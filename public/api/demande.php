<?php
/**
 * Récepteur des 4 formulaires du site (devis, contact, partenaire, sinistre).
 *
 * Pour chaque demande :
 *   1. contrôles anti-spam (origine, champ piège, délai minimum, limite par heure) ;
 *   2. enregistrement dans ~/demandes/AAAA-MM/<référence>/ (hors du site, jamais public) ;
 *   3. envoi d'un e-mail à l'adresse de réception (photos en pièces jointes) ;
 *   4. si `webhook_url` est rempli : transmission au serveur de l'entreprise (base de données).
 *
 * Réglages : ~/config-formulaires.php (hors du dossier www, jamais dans Git).
 * Modèle : server/config-formulaires.exemple.php dans le dépôt.
 */
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex');

const TYPES = [
    'devis' => ['prefixe' => 'DV', 'titre' => 'Demande de devis'],
    'contact' => ['prefixe' => 'CT', 'titre' => 'Message de contact'],
    'partenaire' => ['prefixe' => 'PA', 'titre' => 'Demande de partenariat'],
    'sinistre' => ['prefixe' => 'SIN', 'titre' => 'Photos après sinistre'],
];
const MAX_CHAMPS = 30;
const MAX_LIBELLE = 80;
const MAX_VALEUR = 5000;
const MAX_PHOTOS = 6;
const MAX_TAILLE_PHOTO = 5 * 1024 * 1024;
const DELAI_MINIMUM_MS = 3000;
const LIMITE_PAR_HEURE = 5;

function repondre(int $code, array $donnees): void
{
    http_response_code($code);
    echo json_encode($donnees, JSON_UNESCAPED_UNICODE);
    exit;
}

function refuser(int $code, string $raison): void
{
    repondre($code, ['ok' => false, 'erreur' => $raison]);
}

function nettoyer(string $texte, int $max): string
{
    $texte = str_replace(["\r\n", "\r"], "\n", $texte);
    $texte = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $texte) ?? '';
    return trimMb(mb_substr($texte, 0, $max));
}

function trimMb(string $texte): string
{
    return preg_replace('/^\s+|\s+$/u', '', $texte) ?? '';
}

/** Une seule ligne, sans retour à la ligne (objet de mail, en-têtes). */
function uneLigne(string $texte, int $max): string
{
    return nettoyer(str_replace("\n", ' ', $texte), $max);
}

function encoderEntete(string $texte): string
{
    return '=?UTF-8?B?' . base64_encode($texte) . '?=';
}

$racine = dirname(__DIR__, 2); // dossier personnel OVH (au-dessus de www)
$fichierConfig = $racine . '/config-formulaires.php';
if (!is_file($fichierConfig)) {
    refuser(500, 'configuration');
}
/** @var array{destinataire:string, expediteur:string, domaines_autorises:string[], webhook_url?:string, webhook_secret?:string} $config */
$config = require $fichierConfig;

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    refuser(405, 'methode');
}

// Origine : seul le site lui-même peut envoyer.
$origine = (string) ($_SERVER['HTTP_ORIGIN'] ?? '');
$hoteOrigine = strtolower((string) parse_url($origine, PHP_URL_HOST));
if ($hoteOrigine === '' || !in_array($hoteOrigine, $config['domaines_autorises'], true)) {
    refuser(403, 'origine');
}

$type = (string) ($_POST['type'] ?? '');
if (!isset(TYPES[$type])) {
    refuser(400, 'type');
}

// Champ piège : invisible pour un humain, rempli par les robots. On fait semblant d'accepter.
$piege = (string) ($_POST['website'] ?? '');
$debut = (int) ($_POST['debut'] ?? 0);
$maintenantMs = (int) floor(microtime(true) * 1000);
if ($piege !== '' || $debut <= 0 || $maintenantMs - $debut < DELAI_MINIMUM_MS) {
    repondre(200, ['ok' => true, 'reference' => TYPES[$type]['prefixe'] . '-' . date('Ymd') . '-0000']);
}

// Limite : quelques envois par heure et par adresse IP (IP stockée sous forme d'empreinte).
$dossierDemandes = $racine . '/demandes';
$dossierLimites = $dossierDemandes . '/_limites';
if (!is_dir($dossierLimites) && !mkdir($dossierLimites, 0700, true) && !is_dir($dossierLimites)) {
    refuser(500, 'stockage');
}
$ip = (string) ($_SERVER['REMOTE_ADDR'] ?? '');
$fichierLimite = $dossierLimites . '/' . hash('sha256', $ip . '|' . $config['destinataire']) . '.json';
$envois = is_file($fichierLimite) ? (json_decode((string) file_get_contents($fichierLimite), true) ?: []) : [];
$envois = array_values(array_filter($envois, static fn ($t) => is_int($t) && $t > time() - 3600));
if (count($envois) >= LIMITE_PAR_HEURE) {
    refuser(429, 'limite');
}

// Champs : liste [{ "libelle": "...", "valeur": "..." }] déjà rédigée par le site.
$champsBruts = json_decode((string) ($_POST['champs'] ?? ''), true);
if (!is_array($champsBruts) || count($champsBruts) === 0 || count($champsBruts) > MAX_CHAMPS) {
    refuser(400, 'champs');
}
$champs = [];
foreach ($champsBruts as $ligne) {
    if (!is_array($ligne) || !is_string($ligne['libelle'] ?? null) || !is_string($ligne['valeur'] ?? null)) {
        refuser(400, 'champs');
    }
    $libelle = uneLigne($ligne['libelle'], MAX_LIBELLE);
    if ($libelle === '') {
        refuser(400, 'champs');
    }
    $champs[] = ['libelle' => $libelle, 'valeur' => nettoyer($ligne['valeur'], MAX_VALEUR)];
}
$valeurDe = static function (string $libelle) use ($champs): string {
    foreach ($champs as $c) {
        if (mb_strtolower($c['libelle']) === mb_strtolower($libelle)) {
            return $c['valeur'];
        }
    }
    return '';
};
$telephone = preg_replace('/\D/', '', $valeurDe('Téléphone')) ?? '';
if (strlen($telephone) < 10 || strlen($telephone) > 13) {
    refuser(400, 'telephone');
}
$nom = uneLigne($valeurDe('Nom'), 80);
if (mb_strlen($nom) < 2) {
    refuser(400, 'nom');
}

// Photos (formulaire sinistre uniquement) : JPEG, PNG ou WebP vérifiés par leur contenu.
$photos = [];
if (isset($_FILES['photos']) && is_array($_FILES['photos']['name'] ?? null)) {
    $nb = count($_FILES['photos']['name']);
    if ($type !== 'sinistre' || $nb > MAX_PHOTOS) {
        refuser(400, 'photos');
    }
    $extensions = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    for ($i = 0; $i < $nb; $i++) {
        $erreur = (int) $_FILES['photos']['error'][$i];
        $tmp = (string) $_FILES['photos']['tmp_name'][$i];
        $taille = (int) $_FILES['photos']['size'][$i];
        if ($erreur !== UPLOAD_ERR_OK || !is_uploaded_file($tmp) || $taille <= 0 || $taille > MAX_TAILLE_PHOTO) {
            refuser(400, 'photos');
        }
        $mime = (string) $finfo->file($tmp);
        if (!isset($extensions[$mime])) {
            refuser(400, 'photos');
        }
        $photos[] = ['tmp' => $tmp, 'mime' => $mime, 'nom' => sprintf('photo-%d.%s', $i + 1, $extensions[$mime])];
    }
}
if ($type === 'sinistre' && count($photos) === 0) {
    refuser(400, 'photos');
}

// Référence unique : DV-20261124-4821
$reference = '';
$dossierMois = $dossierDemandes . '/' . date('Y-m');
for ($essai = 0; $essai < 20; $essai++) {
    $candidat = TYPES[$type]['prefixe'] . '-' . date('Ymd') . '-' . random_int(1000, 9999);
    if (!is_dir($dossierMois . '/' . $candidat)) {
        $reference = $candidat;
        break;
    }
}
if ($reference === '') {
    refuser(500, 'reference');
}
$dossier = $dossierMois . '/' . $reference;
if (!mkdir($dossier, 0700, true)) {
    refuser(500, 'stockage');
}

$enregistrement = [
    'reference' => $reference,
    'type' => $type,
    'titre' => TYPES[$type]['titre'],
    'recu_le' => date('c'),
    'champs' => $champs,
    'photos' => array_column($photos, 'nom'),
];
foreach ($photos as $p) {
    if (!move_uploaded_file($p['tmp'], $dossier . '/' . $p['nom'])) {
        refuser(500, 'stockage');
    }
}
file_put_contents($dossier . '/demande.json', json_encode($enregistrement, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));

$envois[] = time();
file_put_contents($fichierLimite, json_encode($envois));

// E-mail
$resume = array_filter([$valeurDe('Besoin') ?: $valeurDe('Type de sinistre') ?: $valeurDe('Sujet') ?: $valeurDe('Structure'), $valeurDe('Lieu'), $nom]);
$objet = TYPES[$type]['titre'] . ' ' . $reference . ' – ' . uneLigne(implode(' – ', $resume), 150);
$texte = TYPES[$type]['titre'] . ' reçue le ' . date('d/m/Y à H:i') . "\nRéférence : " . $reference . "\n\n";
foreach ($champs as $c) {
    $texte .= $c['libelle'] . ' : ' . $c['valeur'] . "\n";
}
if (count($photos) > 0) {
    $texte .= "\n" . count($photos) . " photo(s) en pièce jointe.\n";
}
$texte .= "\nRappeler le client : " . $valeurDe('Téléphone') . "\n";

$frontiere = 'srp-' . bin2hex(random_bytes(12));
$entetes = [
    'From: ' . encoderEntete('Site Serrurerie de la République') . ' <' . $config['expediteur'] . '>',
    'MIME-Version: 1.0',
    'Content-Type: multipart/mixed; boundary="' . $frontiere . '"',
    'X-Reference-Demande: ' . $reference,
];
$emailClient = uneLigne($valeurDe('E-mail'), 254);
if ($emailClient !== '' && filter_var($emailClient, FILTER_VALIDATE_EMAIL)) {
    $entetes[] = 'Reply-To: ' . $emailClient;
}
$corps = "--$frontiere\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
    . chunk_split(base64_encode($texte)) . "\r\n";
foreach ($photos as $p) {
    $corps .= "--$frontiere\r\nContent-Type: {$p['mime']}; name=\"{$p['nom']}\"\r\n"
        . "Content-Transfer-Encoding: base64\r\nContent-Disposition: attachment; filename=\"{$p['nom']}\"\r\n\r\n"
        . chunk_split(base64_encode((string) file_get_contents($dossier . '/' . $p['nom']))) . "\r\n";
}
$corps .= "--$frontiere--\r\n";

$mailEnvoye = mail(
    $config['destinataire'],
    encoderEntete($objet),
    $corps,
    implode("\r\n", $entetes),
    '-f' . $config['expediteur']
);
if (!$mailEnvoye) {
    file_put_contents($dossier . '/ERREUR-mail.txt', date('c') . " : l'envoi du mail a échoué.\n");
}

// Transmission au serveur de l'entreprise (plus tard : base de données).
$webhook = (string) ($config['webhook_url'] ?? '');
if ($webhook !== '' && function_exists('curl_init')) {
    $json = (string) json_encode($enregistrement, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $ch = curl_init($webhook);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $json,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'X-Signature: sha256=' . hash_hmac('sha256', $json, (string) ($config['webhook_secret'] ?? '')),
        ],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 5,
    ]);
    $reponse = curl_exec($ch);
    $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($reponse === false || $code < 200 || $code >= 300) {
        file_put_contents($dossier . '/ERREUR-webhook.txt', date('c') . " : code $code\n");
    }
}

// La demande est enregistrée : c'est un succès pour le visiteur, même si le mail a échoué.
repondre(200, ['ok' => true, 'reference' => $reference]);
