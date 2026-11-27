<?php
/**
 * Compteur de visites du site (rubrique « Suivi du site » de /gestion).
 * Sans cookie, sans identifiant, sans adresse IP enregistrée : seuls des totaux par jour sont gardés
 * (pages vues, entrées sur le site, provenance générale, offre vue, type d'appareil).
 *
 * POST /api/stat.php  corps JSON : { "p": "/chemin", "e": true|false, "s": "google", "o": "bienvenue", "m": true|false }
 *   p : page vue ; e : entrée sur le site (arrivée depuis l'extérieur) ; s : provenance ; o : offre ; m : téléphone.
 * Stockage : ~/gestion/stats/AAAA-MM-JJ.json (hors du site).
 */
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex');

const DOMAINES = ['www.serrurerierepublique.fr', 'serrurerierepublique.fr'];
const SOURCES = ['direct', 'google', 'bing', 'autre_moteur', 'annuaire', 'reseau_social', 'qr', 'autre_site'];
const LIMITE_PAR_HEURE = 120;

function fin(int $code): void
{
    http_response_code($code);
    if ($code !== 204) {
        echo '{}';
    }
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    fin(405);
}
// Origine (ou, à défaut, page d'où vient l'appel) : seul le site lui-même peut compter.
$hote = strtolower((string) parse_url((string) ($_SERVER['HTTP_ORIGIN'] ?? $_SERVER['HTTP_REFERER'] ?? ''), PHP_URL_HOST));
if (!in_array($hote, DOMAINES, true)) {
    fin(403);
}
// Robots : on ne compte pas.
$agent = strtolower((string) ($_SERVER['HTTP_USER_AGENT'] ?? ''));
if ($agent === '' || preg_match('/bot|crawl|spider|slurp|preview|headless|lighthouse|monitor|curl|wget|python|java\\//', $agent)) {
    fin(204);
}

$brut = (string) file_get_contents('php://input', false, null, 0, 600);
$d = json_decode($brut, true);
if (!is_array($d)) {
    fin(400);
}
$page = is_string($d['p'] ?? null) ? $d['p'] : '';
if (!preg_match('#^/[a-z0-9/-]{0,80}$#', $page)) {
    fin(400);
}
$entree = ($d['e'] ?? false) === true;
$source = is_string($d['s'] ?? null) && in_array($d['s'], SOURCES, true) ? $d['s'] : 'direct';
$offre = is_string($d['o'] ?? null) && preg_match('/^[a-z0-9-]{1,40}$/', $d['o']) ? $d['o'] : '';
$mobile = ($d['m'] ?? false) === true;

date_default_timezone_set('Europe/Paris');
$racine = dirname(__DIR__, 2);
$dossier = $racine . '/gestion/stats';
$dossierLimites = $dossier . '/_limites';
if (!is_dir($dossierLimites) && !mkdir($dossierLimites, 0700, true) && !is_dir($dossierLimites)) {
    fin(500);
}

// Limite anti-abus : compteur par heure sous une empreinte de l'adresse IP (sel aléatoire, effacée chaque jour).
$fichierSel = $dossier . '/_sel';
if (!is_file($fichierSel)) {
    file_put_contents($fichierSel, bin2hex(random_bytes(16)), LOCK_EX);
    @chmod($fichierSel, 0600);
}
$jour = date('Y-m-d');
foreach (glob($dossierLimites . '/*') ?: [] as $ancien) {
    if (basename($ancien) !== $jour) {
        array_map('unlink', glob($ancien . '/*') ?: []);
        @rmdir($ancien);
    }
}
$dossierJour = $dossierLimites . '/' . $jour;
if (!is_dir($dossierJour)) {
    @mkdir($dossierJour, 0700, true);
}
$empreinte = hash('sha256', (string) ($_SERVER['REMOTE_ADDR'] ?? '') . '|' . (string) file_get_contents($fichierSel) . '|' . $jour . date('H'));
$fichierLimite = $dossierJour . '/' . substr($empreinte, 0, 32);
$nb = is_file($fichierLimite) ? (int) file_get_contents($fichierLimite) : 0;
if ($nb >= LIMITE_PAR_HEURE) {
    fin(429);
}
file_put_contents($fichierLimite, (string) ($nb + 1), LOCK_EX);

// Totaux du jour.
$fichier = $dossier . '/' . $jour . '.json';
$f = fopen($fichier, 'c+');
if ($f === false || !flock($f, LOCK_EX)) {
    fin(500);
}
$contenu = stream_get_contents($f);
$t = json_decode($contenu === false ? '' : $contenu, true);
if (!is_array($t)) {
    $t = ['vues' => 0, 'entrees' => 0, 'pages' => [], 'sources' => [], 'offres' => [], 'mobile' => 0, 'ordinateur' => 0];
}
$t['vues'] = (int) ($t['vues'] ?? 0) + 1;
$t['pages'][$page] = (int) ($t['pages'][$page] ?? 0) + 1;
if ($entree) {
    $t['entrees'] = (int) ($t['entrees'] ?? 0) + 1;
    $t['sources'][$source] = (int) ($t['sources'][$source] ?? 0) + 1;
    $t[$mobile ? 'mobile' : 'ordinateur'] = (int) ($t[$mobile ? 'mobile' : 'ordinateur'] ?? 0) + 1;
}
if ($offre !== '') {
    $t['offres'][$offre] = (int) ($t['offres'][$offre] ?? 0) + 1;
}
ftruncate($f, 0);
rewind($f);
fwrite($f, (string) json_encode($t, JSON_UNESCAPED_SLASHES));
fflush($f);
flock($f, LOCK_UN);
fclose($f);
fin(204);
