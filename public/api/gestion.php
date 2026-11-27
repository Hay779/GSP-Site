<?php
/**
 * Espace gestion (page /gestion) : accès protégé par mot de passe.
 *
 * Actions :
 *   GET  ?action=session        → connecté ou non
 *   POST ?action=connexion      → { "mot_de_passe": "..." } ; pose un cookie signé (30 jours)
 *   POST ?action=deconnexion
 *   GET  ?action=inscriptions   → liste des inscriptions à l'offre -5 % (+ codes utilisés)
 *   POST ?action=utilisation    → { "reference": "OFF-…", "utilise": true|false, "note": "…" }
 *
 * Réglages : ~/config-gestion.php (hors du dossier www, jamais dans Git), créé avec
 * « npm run gestion:mot-de-passe ». Modèle : server/config-gestion.exemple.php.
 * Données : lit ~/demandes/ (écrit par demande.php) ; écrit uniquement dans ~/gestion/.
 */
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex');

const NOM_COOKIE = 'srp_gestion';
const DUREE_CONNEXION = 30 * 24 * 3600;
const ESSAIS_MAX = 5;
const FENETRE_ESSAIS = 15 * 60;
const DOMAINES_PAR_DEFAUT = ['www.serrurerierepublique.fr', 'serrurerierepublique.fr'];

function repondre(int $code, array $donnees): void
{
    http_response_code($code);
    echo json_encode($donnees, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function refuser(int $code, string $raison): void
{
    repondre($code, ['ok' => false, 'erreur' => $raison]);
}

function poserCookie(string $valeur, int $expiration): void
{
    setcookie(NOM_COOKIE, $valeur, [
        'expires' => $expiration,
        'path' => '/api/',
        'secure' => true,
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
}

/** Lit un fichier JSON (tableau) ; tableau vide s'il n'existe pas ou est illisible. */
function lireJson(string $fichier): array
{
    if (!is_file($fichier)) {
        return [];
    }
    $donnees = json_decode((string) file_get_contents($fichier), true);
    return is_array($donnees) ? $donnees : [];
}

$racine = dirname(__DIR__, 2); // dossier personnel OVH (au-dessus de www)
$fichierConfig = $racine . '/config-gestion.php';
if (!is_file($fichierConfig)) {
    refuser(503, 'non_configure');
}
/** @var array{mot_de_passe: array{sel:string, iterations:int, empreinte:string}, secret:string, domaines_autorises?: string[]} $config */
$config = require $fichierConfig;
if (!is_array($config) || !isset($config['mot_de_passe']['empreinte'], $config['secret']) || strlen((string) $config['secret']) < 32) {
    refuser(503, 'non_configure');
}

$dossierDemandes = $racine . '/demandes';
$dossierGestion = $racine . '/gestion';
if (!is_dir($dossierGestion) && !mkdir($dossierGestion, 0700, true) && !is_dir($dossierGestion)) {
    refuser(500, 'stockage');
}

$methode = (string) ($_SERVER['REQUEST_METHOD'] ?? '');
$action = (string) ($_GET['action'] ?? '');

// Envois (POST) : uniquement depuis le site lui-même.
if ($methode === 'POST') {
    $domaines = $config['domaines_autorises'] ?? DOMAINES_PAR_DEFAUT;
    $hoteOrigine = strtolower((string) parse_url((string) ($_SERVER['HTTP_ORIGIN'] ?? ''), PHP_URL_HOST));
    if ($hoteOrigine === '' || !in_array($hoteOrigine, $domaines, true)) {
        refuser(403, 'origine');
    }
} elseif ($methode !== 'GET') {
    header('Allow: GET, POST');
    refuser(405, 'methode');
}

$corps = [];
if ($methode === 'POST') {
    $corps = json_decode((string) file_get_contents('php://input'), true);
    if (!is_array($corps)) {
        $corps = [];
    }
}

$secret = (string) $config['secret'];
$estConnecte = static function () use ($secret): bool {
    $valeur = $_COOKIE[NOM_COOKIE] ?? '';
    if (!is_string($valeur) || strpos($valeur, '.') === false) {
        return false;
    }
    [$expiration, $signature] = explode('.', $valeur, 2);
    if (!ctype_digit($expiration) || (int) $expiration < time()) {
        return false;
    }
    return hash_equals(hash_hmac('sha256', $expiration, $secret), $signature);
};

// ---------------------------------------------------------------- session
if ($action === 'session' && $methode === 'GET') {
    repondre(200, ['ok' => true, 'connecte' => $estConnecte()]);
}

// ---------------------------------------------------------------- connexion
if ($action === 'connexion' && $methode === 'POST') {
    $dossierEssais = $dossierGestion . '/_essais';
    if (!is_dir($dossierEssais) && !mkdir($dossierEssais, 0700, true) && !is_dir($dossierEssais)) {
        refuser(500, 'stockage');
    }
    $fichierEssais = $dossierEssais . '/' . hash('sha256', (string) ($_SERVER['REMOTE_ADDR'] ?? '') . '|' . $secret) . '.json';
    $echecs = array_values(array_filter(lireJson($fichierEssais), static function ($t): bool {
        return is_int($t) && $t > time() - FENETRE_ESSAIS;
    }));
    if (count($echecs) >= ESSAIS_MAX) {
        refuser(429, 'trop_d_essais');
    }

    $motDePasse = $corps['mot_de_passe'] ?? '';
    $mdp = $config['mot_de_passe'];
    $empreinte = is_string($motDePasse) && $motDePasse !== '' && strlen($motDePasse) <= 200
        ? hash_pbkdf2('sha256', $motDePasse, (string) hex2bin((string) $mdp['sel']), (int) $mdp['iterations'], 64)
        : '';
    if ($empreinte === '' || !hash_equals((string) $mdp['empreinte'], $empreinte)) {
        $echecs[] = time();
        file_put_contents($fichierEssais, json_encode($echecs), LOCK_EX);
        usleep(400000);
        refuser(401, 'mot_de_passe');
    }

    if (is_file($fichierEssais)) {
        unlink($fichierEssais);
    }
    $expiration = time() + DUREE_CONNEXION;
    poserCookie($expiration . '.' . hash_hmac('sha256', (string) $expiration, $secret), $expiration);
    repondre(200, ['ok' => true, 'connecte' => true]);
}

// ---------------------------------------------------------------- déconnexion
if ($action === 'deconnexion' && $methode === 'POST') {
    poserCookie('', time() - 3600);
    repondre(200, ['ok' => true, 'connecte' => false]);
}

// Tout le reste : réservé aux personnes connectées.
if (!$estConnecte()) {
    refuser(401, 'non_connecte');
}

$fichierUtilisations = $dossierGestion . '/offre-utilisations.json';

// ---------------------------------------------------------------- inscriptions
if ($action === 'inscriptions' && $methode === 'GET') {
    $utilisations = lireJson($fichierUtilisations);
    $liste = [];
    foreach (glob($dossierDemandes . '/*/OFF-*/demande.json') ?: [] as $fichier) {
        $d = lireJson($fichier);
        if (($d['type'] ?? '') !== 'inscription' || !is_string($d['reference'] ?? null)) {
            continue;
        }
        $champs = [];
        foreach (($d['champs'] ?? []) as $c) {
            if (is_array($c) && is_string($c['libelle'] ?? null) && is_string($c['valeur'] ?? null)) {
                $champs[$c['libelle']] = $c['valeur'];
            }
        }
        $ref = $d['reference'];
        $liste[] = [
            'reference' => $ref,
            'recu_le' => (string) ($d['recu_le'] ?? ''),
            'valable_jusqu_au' => (string) ($d['valable_jusqu_au'] ?? ''),
            'champs' => $champs,
            'utilise_le' => isset($utilisations[$ref]['le']) ? (string) $utilisations[$ref]['le'] : null,
            'note' => isset($utilisations[$ref]['note']) ? (string) $utilisations[$ref]['note'] : '',
        ];
    }
    usort($liste, static function (array $a, array $b): int {
        return strcmp($b['recu_le'], $a['recu_le']);
    });
    repondre(200, ['ok' => true, 'inscriptions' => $liste]);
}

// ---------------------------------------------------------------- code utilisé / annulé
if ($action === 'utilisation' && $methode === 'POST') {
    $reference = (string) ($corps['reference'] ?? '');
    if (!preg_match('/^OFF-\d{8}-\d{4}$/', $reference) || count(glob($dossierDemandes . '/*/' . $reference . '/demande.json') ?: []) === 0) {
        refuser(400, 'reference');
    }
    $utilise = ($corps['utilise'] ?? false) === true;
    $note = preg_replace('/[\x00-\x1F\x7F]/u', ' ', mb_substr((string) ($corps['note'] ?? ''), 0, 300)) ?? '';

    $f = fopen($fichierUtilisations, 'c+');
    if ($f === false || !flock($f, LOCK_EX)) {
        refuser(500, 'stockage');
    }
    $contenu = stream_get_contents($f);
    $utilisations = json_decode($contenu === false ? '' : $contenu, true);
    if (!is_array($utilisations)) {
        $utilisations = [];
    }
    if ($utilise) {
        $utilisations[$reference] = ['le' => date('c'), 'note' => trim($note)];
    } else {
        unset($utilisations[$reference]);
    }
    ftruncate($f, 0);
    rewind($f);
    fwrite($f, (string) json_encode($utilisations, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    fflush($f);
    flock($f, LOCK_UN);
    fclose($f);
    @chmod($fichierUtilisations, 0600);

    repondre(200, [
        'ok' => true,
        'reference' => $reference,
        'utilise_le' => $utilise ? $utilisations[$reference]['le'] : null,
    ]);
}

refuser(400, 'action');
