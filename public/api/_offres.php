<?php
/**
 * Offres d'inscription (partagé par offre.php, demande.php et gestion.php ; jamais appelé seul).
 * Stockage : ~/gestion/offres.json (hors du site). Sans ce fichier, seule l'offre de bienvenue
 * (« bienvenue », page /offre, QR code du premier flyer) existe.
 */
declare(strict_types=1);

if (realpath((string) ($_SERVER['SCRIPT_FILENAME'] ?? '')) === __FILE__) {
    http_response_code(404);
    exit;
}

date_default_timezone_set('Europe/Paris');

const OFFRE_DEFAUT = 'bienvenue';
const TYPES_QUESTIONS = ['texte', 'paragraphe', 'choix', 'cases', 'oui_non', 'nombre', 'date'];
const LIBELLES_RESERVES = ['offre', 'vous êtes', 'société', 'fonction', 'nom', 'téléphone', 'e-mail', 'ville'];
const MAX_QUESTIONS = 10;
const MAX_CHOIX = 12;
const THEMES_PAGE = ['mer', 'soleil', 'calanques', 'lavande'];
const BLOCS_PAGE = ['etapes', 'avis', 'infos'];
const FORMATS_AFFICHE = ['a4', 'a5', 'carte'];

function offreBienvenue(): array
{
    return [
        'slug' => OFFRE_DEFAUT,
        'nom' => 'Offre de bienvenue -5 % (flyer)',
        'titre' => 'Inscription à l’offre de bienvenue',
        'description' => '5 % de réduction sur votre premier achat ou votre première intervention.',
        'reduction_type' => 'pourcent',
        'reduction_valeur' => 5,
        'duree_mois' => 5,
        'conditions' => [
            '-5 % sur votre premier achat ou votre première intervention, sur devis signé.',
            'Valable 5 mois après l’inscription.',
            'Une seule inscription par société ou par personne.',
            'Hors dépannage d’urgence (ouverture de porte, mise en sécurité immédiate).',
            'Non cumulable avec une autre offre ou promotion en cours.',
            'Présentez votre code (ou donnez-le par téléphone) au moment du devis.',
        ],
        'debut' => '',
        'fin' => '',
        'actif' => true,
        'cree_le' => '2026-11-27T00:00:00+01:00',
    ];
}

function fichierOffres(string $racine): string
{
    return $racine . '/gestion/offres.json';
}

/** Toutes les offres, indexées par identifiant (l'offre de bienvenue existe toujours). */
function lireOffres(string $racine): array
{
    $offres = [];
    $fichier = fichierOffres($racine);
    if (is_file($fichier)) {
        $donnees = json_decode((string) file_get_contents($fichier), true);
        if (is_array($donnees)) {
            foreach ($donnees as $o) {
                if (is_array($o) && is_string($o['slug'] ?? null)) {
                    $offres[$o['slug']] = $o;
                }
            }
        }
    }
    if (!isset($offres[OFFRE_DEFAUT])) {
        $offres = [OFFRE_DEFAUT => offreBienvenue()] + $offres;
    }
    return $offres;
}

/** Inscriptions ouvertes : offre active et dans sa période. */
function offreOuverte(array $offre): bool
{
    if (($offre['actif'] ?? true) !== true) {
        return false;
    }
    $jour = date('Y-m-d');
    $debut = (string) ($offre['debut'] ?? '');
    $fin = (string) ($offre['fin'] ?? '');
    return !($debut !== '' && $jour < $debut) && !($fin !== '' && $jour > $fin);
}

/** « -5 % » ou « -50 € ». */
function libelleReduction(array $offre): string
{
    $v = $offre['reduction_valeur'] ?? 0;
    $texte = rtrim(rtrim(number_format((float) $v, 2, ',', ' '), '0'), ',');
    return '-' . $texte . (($offre['reduction_type'] ?? '') === 'euros' ? ' €' : ' %');
}

/**
 * Vérifie les réponses aux questions de l'offre (lignes « libellé : valeur » envoyées par le site).
 * Renvoie '' si tout va bien, sinon le libellé de la question en défaut.
 */
function erreurReponses(array $offre, callable $valeurDe): string
{
    foreach (($offre['questions'] ?? []) as $q) {
        $v = trim((string) $valeurDe((string) $q['libelle']));
        if ($v === '' || $v === '—') {
            if (!empty($q['obligatoire'])) {
                return (string) $q['libelle'];
            }
            continue;
        }
        $type = (string) ($q['type'] ?? '');
        $options = is_array($q['options'] ?? null) ? $q['options'] : [];
        $ok = true;
        if ($type === 'choix') {
            $ok = in_array($v, $options, true);
        } elseif ($type === 'cases') {
            foreach (explode(', ', $v) as $morceau) {
                $ok = $ok && in_array($morceau, $options, true);
            }
        } elseif ($type === 'oui_non') {
            $ok = in_array($v, ['Oui', 'Non'], true);
        } elseif ($type === 'nombre') {
            $ok = (bool) preg_match('/^-?\d+(?:[.,]\d+)?$/', $v);
        } elseif ($type === 'date') {
            $ok = (bool) preg_match('/^\d{2}\/\d{2}\/\d{4}$/', $v);
        }
        if (!$ok) {
            return (string) $q['libelle'];
        }
    }
    return '';
}

/** Champs visibles par le public (page /offre). */
function offrePublique(array $offre): array
{
    $champs = ['slug', 'titre', 'description', 'reduction_type', 'reduction_valeur', 'duree_mois', 'conditions', 'questions', 'page'];
    return array_intersect_key($offre, array_flip($champs));
}

/**
 * Contrôle une offre envoyée par l'espace gestion. Renvoie [offre propre, erreur ou ''].
 */
function validerOffre(array $o): array
{
    $texte = static function ($v, int $max): string {
        $v = is_string($v) ? $v : '';
        $v = preg_replace('/[\x00-\x1F\x7F]/u', ' ', $v) ?? '';
        return trim(mb_substr($v, 0, $max));
    };
    $slug = is_string($o['slug'] ?? null) ? $o['slug'] : '';
    if (!preg_match('/^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/', $slug)) {
        return [[], 'slug'];
    }
    $type = ($o['reduction_type'] ?? '') === 'euros' ? 'euros' : 'pourcent';
    $valeur = is_int($o['reduction_valeur'] ?? null) || is_float($o['reduction_valeur'] ?? null) ? (float) $o['reduction_valeur'] : 0.0;
    if ($valeur <= 0 || ($type === 'pourcent' ? $valeur > 90 : $valeur > 10000)) {
        return [[], 'reduction'];
    }
    $mois = is_int($o['duree_mois'] ?? null) ? $o['duree_mois'] : 0;
    if ($mois < 1 || $mois > 24) {
        return [[], 'duree'];
    }
    $conditions = [];
    foreach ((is_array($o['conditions'] ?? null) ? $o['conditions'] : []) as $c) {
        $c = $texte($c, 200);
        if ($c !== '' && count($conditions) < 12) {
            $conditions[] = $c;
        }
    }
    // Questions ajoutées (constructeur de formulaire).
    $questions = [];
    $libellesVus = [];
    $brutes = is_array($o['questions'] ?? null) ? $o['questions'] : [];
    if (count($brutes) > MAX_QUESTIONS) {
        return [[], 'questions'];
    }
    foreach ($brutes as $q) {
        if (!is_array($q)) {
            return [[], 'questions'];
        }
        $idQ = is_string($q['id'] ?? null) ? $q['id'] : '';
        $libelle = $texte($q['libelle'] ?? '', 80);
        $typeQ = is_string($q['type'] ?? null) ? $q['type'] : '';
        $cle = mb_strtolower($libelle);
        if (!preg_match('/^q[a-z0-9]{1,12}$/', $idQ) || mb_strlen($libelle) < 2 || !in_array($typeQ, TYPES_QUESTIONS, true)
            || in_array($cle, LIBELLES_RESERVES, true) || isset($libellesVus[$cle]) || isset($libellesVus['#' . $idQ])) {
            return [[], 'questions'];
        }
        $libellesVus[$cle] = true;
        $libellesVus['#' . $idQ] = true;
        $options = [];
        if ($typeQ === 'choix' || $typeQ === 'cases') {
            foreach ((is_array($q['options'] ?? null) ? $q['options'] : []) as $opt) {
                $opt = $texte($opt, 60);
                if ($opt !== '' && strpos($opt, ',') === false && !in_array($opt, $options, true)) {
                    $options[] = $opt;
                }
            }
            if (count($options) < 2 || count($options) > MAX_CHOIX) {
                return [[], 'questions'];
            }
        }
        $questions[] = ['id' => $idQ, 'libelle' => $libelle, 'type' => $typeQ, 'obligatoire' => ($q['obligatoire'] ?? false) === true, 'options' => $options];
    }

    // Page : thème, textes, blocs (chacun une fois, ordre libre).
    $pageBrute = is_array($o['page'] ?? null) ? $o['page'] : [];
    $theme = is_string($pageBrute['theme'] ?? null) && in_array($pageBrute['theme'], THEMES_PAGE, true) ? $pageBrute['theme'] : 'mer';
    $blocs = [];
    foreach ((is_array($pageBrute['blocs'] ?? null) ? $pageBrute['blocs'] : []) as $b) {
        $idB = is_array($b) && is_string($b['id'] ?? null) ? $b['id'] : '';
        if (in_array($idB, BLOCS_PAGE, true) && !in_array($idB, array_column($blocs, 'id'), true)) {
            $blocs[] = ['id' => $idB, 'visible' => ($b['visible'] ?? true) !== false];
        }
    }
    foreach (BLOCS_PAGE as $idB) {
        if (!in_array($idB, array_column($blocs, 'id'), true)) {
            $blocs[] = ['id' => $idB, 'visible' => true];
        }
    }
    $page = ['theme' => $theme, 'bouton' => $texte($pageBrute['bouton'] ?? '', 40), 'message' => $texte($pageBrute['message'] ?? '', 90), 'blocs' => $blocs];

    // Affiche imprimable : format et textes (facultatifs).
    $afficheBrute = is_array($o['affiche'] ?? null) ? $o['affiche'] : [];
    $affiche = [
        'format' => is_string($afficheBrute['format'] ?? null) && in_array($afficheBrute['format'], FORMATS_AFFICHE, true) ? $afficheBrute['format'] : 'a4',
        'titre' => $texte($afficheBrute['titre'] ?? '', 70),
        'texte' => $texte($afficheBrute['texte'] ?? '', 180),
    ];

    $date = static function ($v): string {
        return is_string($v) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $v) ? $v : '';
    };
    $propre = [
        'slug' => $slug,
        'nom' => $texte($o['nom'] ?? '', 80),
        'titre' => $texte($o['titre'] ?? '', 80),
        'description' => $texte($o['description'] ?? '', 220),
        'reduction_type' => $type,
        'reduction_valeur' => floor($valeur) === $valeur ? (int) $valeur : $valeur,
        'duree_mois' => $mois,
        'conditions' => $conditions,
        'debut' => $date($o['debut'] ?? ''),
        'fin' => $date($o['fin'] ?? ''),
        'actif' => ($o['actif'] ?? true) === true,
        'questions' => $questions,
        'page' => $page,
        'affiche' => $affiche,
    ];
    if (mb_strlen($propre['nom']) < 3 || mb_strlen($propre['titre']) < 3 || mb_strlen($propre['description']) < 10 || count($conditions) === 0) {
        return [[], 'champs'];
    }
    if ($propre['debut'] !== '' && $propre['fin'] !== '' && $propre['fin'] < $propre['debut']) {
        return [[], 'dates'];
    }
    return [$propre, ''];
}
