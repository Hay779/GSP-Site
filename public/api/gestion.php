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
 *   GET  ?action=offres         → toutes les offres (voir _offres.php)
 *   POST ?action=offre          → { "offre": {…}, "nouvelle": true|false } : créer ou modifier une offre
 *   GET  ?action=demandes       → demandes des formulaires du site (devis, contact, partenaire, sinistre) + suivi
 *   POST ?action=suivi          → { "reference": "DV-…", "statut": "en_cours", "note": "…" }
 *   GET  ?action=photo&reference=SIN-…&nom=photo-1.jpg → photo d'une demande
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
/** Demandes des formulaires (les inscriptions OFF- sont dans « Inscrits »). */
const MOTIF_DEMANDE = '/^(DV|CT|PA|SIN)-\d{8}-\d{4}$/';
const STATUTS_DEMANDE = ['nouvelle', 'en_cours', 'devis_envoye', 'terminee', 'sans_suite'];
const MAX_DEMANDES = 500;

require __DIR__ . '/_offres.php';

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
            'offre' => (string) ($d['offre'] ?? OFFRE_DEFAUT),
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

// ---------------------------------------------------------------- offres
if ($action === 'offres' && $methode === 'GET') {
    $liste = [];
    foreach (lireOffres($racine) as $o) {
        $o['ouverte'] = offreOuverte($o);
        $liste[] = $o;
    }
    repondre(200, ['ok' => true, 'offres' => $liste]);
}

if ($action === 'offre' && $methode === 'POST') {
    [$offre, $erreur] = validerOffre(is_array($corps['offre'] ?? null) ? $corps['offre'] : []);
    if ($erreur !== '') {
        refuser(400, 'offre_' . $erreur);
    }
    $nouvelle = ($corps['nouvelle'] ?? false) === true;

    $f = fopen(fichierOffres($racine), 'c+');
    if ($f === false || !flock($f, LOCK_EX)) {
        refuser(500, 'stockage');
    }
    $offres = lireOffres($racine);
    if ($nouvelle && isset($offres[$offre['slug']])) {
        flock($f, LOCK_UN);
        fclose($f);
        refuser(409, 'slug_existe');
    }
    if (!$nouvelle && !isset($offres[$offre['slug']])) {
        flock($f, LOCK_UN);
        fclose($f);
        refuser(404, 'offre_inconnue');
    }
    $offre['cree_le'] = $nouvelle ? date('c') : (string) ($offres[$offre['slug']]['cree_le'] ?? date('c'));
    $offre['modifie_le'] = date('c');
    $offres[$offre['slug']] = $offre;
    ftruncate($f, 0);
    rewind($f);
    fwrite($f, (string) json_encode(array_values($offres), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    fflush($f);
    flock($f, LOCK_UN);
    fclose($f);
    @chmod(fichierOffres($racine), 0600);

    $offre['ouverte'] = offreOuverte($offre);
    repondre(200, ['ok' => true, 'offre' => $offre]);
}

// ---------------------------------------------------------------- demandes du site
$fichierSuivi = $dossierGestion . '/demandes-suivi.json';

/** Dossier d'une demande (référence déjà contrôlée), ou '' si elle n'existe pas. */
$dossierDemande = static function (string $reference) use ($dossierDemandes): string {
    $trouves = glob($dossierDemandes . '/*/' . $reference . '/demande.json') ?: [];
    return count($trouves) > 0 ? dirname($trouves[0]) : '';
};

if ($action === 'demandes' && $methode === 'GET') {
    $suivi = lireJson($fichierSuivi);
    $liste = [];
    $fichiers = glob($dossierDemandes . '/*/*/demande.json') ?: [];
    rsort($fichiers); // dossiers AAAA-MM puis références datées : les plus récentes d'abord
    foreach ($fichiers as $fichier) {
        if (count($liste) >= MAX_DEMANDES) {
            break;
        }
        $d = lireJson($fichier);
        $ref = is_string($d['reference'] ?? null) ? $d['reference'] : '';
        if (!preg_match(MOTIF_DEMANDE, $ref)) {
            continue;
        }
        $champs = [];
        foreach (($d['champs'] ?? []) as $c) {
            if (is_array($c) && is_string($c['libelle'] ?? null) && is_string($c['valeur'] ?? null)) {
                $champs[] = ['libelle' => $c['libelle'], 'valeur' => $c['valeur']];
            }
        }
        $photos = [];
        foreach (($d['photos'] ?? []) as $nomPhoto) {
            if (is_string($nomPhoto) && preg_match('/^photo-\d{1,2}\.(jpg|png|webp)$/', $nomPhoto)) {
                $photos[] = $nomPhoto;
            }
        }
        $s = is_array($suivi[$ref] ?? null) ? $suivi[$ref] : [];
        $liste[] = [
            'reference' => $ref,
            'type' => (string) ($d['type'] ?? ''),
            'titre' => (string) ($d['titre'] ?? ''),
            'recu_le' => (string) ($d['recu_le'] ?? ''),
            'champs' => $champs,
            'photos' => $photos,
            'statut' => in_array($s['statut'] ?? '', STATUTS_DEMANDE, true) ? $s['statut'] : 'nouvelle',
            'note' => (string) ($s['note'] ?? ''),
            'maj_le' => (string) ($s['le'] ?? ''),
        ];
    }
    usort($liste, static function (array $a, array $b): int {
        return strcmp($b['recu_le'], $a['recu_le']);
    });
    repondre(200, ['ok' => true, 'demandes' => $liste]);
}

if ($action === 'suivi' && $methode === 'POST') {
    $reference = (string) ($corps['reference'] ?? '');
    $statut = (string) ($corps['statut'] ?? '');
    if (!preg_match(MOTIF_DEMANDE, $reference) || $dossierDemande($reference) === '' || !in_array($statut, STATUTS_DEMANDE, true)) {
        refuser(400, 'suivi');
    }
    $note = trim(str_replace("\r", '', mb_substr((string) ($corps['note'] ?? ''), 0, 1000)));
    $note = preg_replace('/[\x00-\x09\x0B-\x1F\x7F]/u', ' ', $note) ?? '';

    $f = fopen($fichierSuivi, 'c+');
    if ($f === false || !flock($f, LOCK_EX)) {
        refuser(500, 'stockage');
    }
    $contenu = stream_get_contents($f);
    $suivi = json_decode($contenu === false ? '' : $contenu, true);
    if (!is_array($suivi)) {
        $suivi = [];
    }
    $suivi[$reference] = ['statut' => $statut, 'note' => $note, 'le' => date('c')];
    ftruncate($f, 0);
    rewind($f);
    fwrite($f, (string) json_encode($suivi, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    fflush($f);
    flock($f, LOCK_UN);
    fclose($f);
    @chmod($fichierSuivi, 0600);
    repondre(200, ['ok' => true, 'reference' => $reference, 'statut' => $statut, 'note' => $note, 'maj_le' => $suivi[$reference]['le']]);
}

if ($action === 'photo' && $methode === 'GET') {
    $reference = (string) ($_GET['reference'] ?? '');
    $nom = (string) ($_GET['nom'] ?? '');
    if (!preg_match(MOTIF_DEMANDE, $reference) || !preg_match('/^photo-\d{1,2}\.(jpg|png|webp)$/', $nom, $m)) {
        refuser(400, 'photo');
    }
    $dossier = $dossierDemande($reference);
    $chemin = $dossier === '' ? '' : $dossier . '/' . $nom;
    if ($chemin === '' || !is_file($chemin)) {
        refuser(404, 'photo');
    }
    $types = ['jpg' => 'image/jpeg', 'png' => 'image/png', 'webp' => 'image/webp'];
    header('Content-Type: ' . $types[$m[1]]);
    header('Cache-Control: private, max-age=3600');
    header('X-Content-Type-Options: nosniff');
    header('Content-Length: ' . (string) filesize($chemin));
    readfile($chemin);
    exit;
}

refuser(400, 'action');
