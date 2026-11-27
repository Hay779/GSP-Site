<?php
/**
 * Offre publique pour la page /offre : GET /api/offre.php?o=<identifiant>
 * (sans « o » : offre de bienvenue). Répond 410 si l'offre est en pause ou terminée.
 */
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex');

require __DIR__ . '/_offres.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    header('Allow: GET');
    http_response_code(405);
    echo json_encode(['ok' => false, 'erreur' => 'methode']);
    exit;
}

$slug = (string) ($_GET['o'] ?? OFFRE_DEFAUT);
$offres = lireOffres(dirname(__DIR__, 2));
if (!preg_match('/^[a-z0-9-]{1,40}$/', $slug) || !isset($offres[$slug])) {
    http_response_code(404);
    echo json_encode(['ok' => false, 'erreur' => 'inconnue']);
    exit;
}
if (!offreOuverte($offres[$slug])) {
    http_response_code(410);
    echo json_encode(['ok' => false, 'erreur' => 'indisponible']);
    exit;
}
echo json_encode(['ok' => true, 'offre' => offrePublique($offres[$slug])], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
