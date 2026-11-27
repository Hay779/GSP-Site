# Images du site — où elles sont et comment les remplacer

Ce dossier est une **copie de référence** des images du site, rangées par partie du site.
Le site, lui, utilise les fichiers de `src/assets/images/` (versions WebP, plus légères).
Les vraies photos de la boutique (pour les annuaires) sont à part, dans `docs/photos-reelles/`.

## Remplacer une image

1. Regarder dans le tableau ci-dessous quelle image apparaît à l'endroit voulu (une même image peut servir à plusieurs endroits).
2. Déposer la nouvelle image dans **`0-a-remplacer/`**, avec **le même nom** que l'ancienne (l'extension peut changer : jpg, png ou webp).
3. Dire à Claude Code : **« remplace les images »**.

Claude Code alors :
- convertit la nouvelle image en WebP (et en JPG si l'ancienne en avait un), à une taille proche de l'ancienne ;
- la met dans `src/assets/images/` (même nom, donc rien d'autre à changer dans le code) et met à jour la copie dans ce dossier ;
- montre des captures avant / après (mobile, tablette, ordinateur) ;
- met en ligne seulement après « mets en ligne », puis vide `0-a-remplacer/`.

Pour **ajouter** une image à un nouvel endroit, ou mettre une image différente à **un seul** des endroits où elle sert, le dire à Claude Code : il créera un nouveau nom.

Conseils : photos d'au moins la taille indiquée, format paysage sauf indication, pas de texte incrusté, pas de logo d'une autre entreprise.

## Les images

| Fichier | Où elle apparaît | Taille actuelle (px) |
|---|---|---|
| `1-accueil-haut-de-page/hero_serrurier_marseille_1795288791942.jpg` | 1376 × 768 | Accueil : 1re photo du diaporama du haut de page ; image de partage (Facebook, WhatsApp…) ; bloc urgence Menuiserie (« Porte qui ferme mal ») |
| `2-urgence/urgence_ouverture_porte.webp` | 1122 × 1402 | Bloc « Dépannage en urgence » (accueil et page Serrurerie) : carte « Ouverture de porte » |
| `2-urgence/urgence_texture_pierre.webp` | 355 × 1402 | Même carte : texture de pierre derrière le texte (découpée dans la photo ci-dessus) |
| `2-urgence/apres_sinistre_diagnostic_1795291186729.jpg` | 1376 × 768 | Bloc urgence : carte « Mise en sécurité » ; bloc « Après sinistre » de l'accueil |
| `3-services/domaine_serrurerie_1795289920360.jpg` | 1200 × 896 | Diaporama de l'accueil (« Portes blindées ») ; carte Serrurerie du bloc « Nos domaines » ; page Serrurerie |
| `3-services/domaine_vitrerie_1795289921283.jpg` | 1200 × 896 | Diaporama (« Vitrerie ») ; carte Vitrerie des domaines ; bloc urgence Vitrerie (« Vitrine brisée ») |
| `3-services/domaine_menuiserie_1795289934186.jpg` | 1200 × 896 | Diaporama (« Menuiserie ») ; carte Menuiserie des domaines ; bloc urgence Menuiserie (« Fenêtre bloquée ») ; promo Black Friday |
| `3-services/domaine_fermetures_1795289921534.jpg` | 1200 × 896 | Diaporama (« Fermetures ») ; carte Fermetures des domaines ; bloc urgence Fermetures (2 cartes) |
| `4-cles-badges/cles_badges_boutique_1795289681478.jpg` | 1200 × 896 | Diaporama (« Clés & badges ») ; bloc « Clés et badges » de l'accueil |
| `4-cles-badges/kb_cles.jpg` | 620 × 278 | Bloc « Clés et badges » ; bloc urgence Clés (« Clé à refaire ») |
| `4-cles-badges/kb_badge.jpg` | 480 × 234 | Bloc « Clés et badges » ; bloc urgence Clés (« Badge à copier ») |
| `4-cles-badges/cta_cles_badge.jpg` | 486 × 205 | Bandeau d'appel en bas des pages et dans le pied de page |
| `5-apres-sinistre-assurance/as_banniere.jpg` | 1024 × 290 | Bandeau « Vous êtes assuré ? » ; bloc urgence Vitrerie (« Vitre cassée ») ; page Serrurerie (« Porte forcée », photo avant) |
| `5-apres-sinistre-assurance/as_securite.jpg` | 296 × 134 | Bandeau assurance : étape « Mise en sécurité » |
| `5-apres-sinistre-assurance/as_reparation.jpg` | 296 × 134 | Bandeau assurance : étape « Réparation » |
| `5-apres-sinistre-assurance/as_assurance.jpg` | 296 × 134 | Bandeau assurance : étape « Dossier assurance » |
| `6-agences-zone/kb_facade_republique.jpg` | 288 × 170 | Bloc agences : agence République |
| `6-agences-zone/kb_facade_rome.jpg` | 310 × 170 | Bloc agences : agence Rome |
| `6-agences-zone/zone_marseille.jpg` | 575 × 225 | Bloc « Zone d'intervention » (bandeau) |
| `7-promotions/bf_porte_blindee.webp` | 564 × 1136 | Black Friday : offre portes blindées |
| `7-promotions/bf_double_cle.webp` | 558 × 528 | Black Friday : offre double de clé |
| `7-promotions/bf_tampon.webp` | 344 × 394 | Black Friday : offre tampons |
| `8-logos-icones/logo_republique_dark.png` | 580 × 371 | Logo du site (en-tête, pied de page, données Google) |
| `9-professionnels/pro_syndics.jpg` | Menu « Professionnels » : Syndics & gestionnaires ; haut de la page Syndics & copropriétés | 1600 × 893 |
| `9-professionnels/pro_assureurs.jpg` | Menu « Professionnels » : Assureurs & experts ; haut de la page Assureurs & experts | 1600 × 893 |
| `9-professionnels/pro_immobilier.jpg` | Menu « Professionnels » : Agences & bailleurs ; haut de la page Agences & bailleurs | 1600 × 893 |
| `9-professionnels/pro_partenaire.jpg` | Menu « Professionnels » : Devenir partenaire | 1600 × 893 |

## Serruriers créés par IA (`serruriers-ia/`)

Portraits et descriptions des deux serruriers des images Professionnels, à réutiliser pour garder les mêmes personnes sur les prochaines images. Voir `serruriers-ia/LISEZMOI.md`.

## Logos et icônes (`8-logos-icones/`)

- `logo_republique_dark.png` : logo du site.
- `favicon.svg`, `favicon.png`, `favicon.ico`, `apple-touch-icon.png` : petite icône de l'onglet du navigateur et de l'écran d'accueil du téléphone (bouclier doré avec trou de serrure, depuis le 26/11/2026). Pour la changer : déposer une image carrée d'au moins 512 × 512 px dans `0-a-remplacer/` nommée `favicon.png`, Claude Code refait les 4 fichiers.
- `marques/` : logos des 24 marques du bloc « Marques » (fichiers d'origine). `marques/sources/` : provenance de chaque logo, aperçu et formulaires d'autorisation. Copies optimisées du site : `public/assets/brands/` (voir son `LISEZMOI.md`).
- Logo carré pour les annuaires : `docs/logo-google/`.

### Petites icônes dessinées (pas des fichiers)

Les pictogrammes du site (téléphone, cadenas, bouclier, document, épingle de carte…) ne sont pas des images : ils viennent de la bibliothèque **Lucide** (catalogue : https://lucide.dev/icons). Pour en changer un, dire à Claude Code lequel (par exemple « l'épingle à côté de Artisans basés à Marseille ») et, si possible, le nom de l'icône voulue dans le catalogue.

Principaux endroits :

| Partie du site | Icônes |
|---|---|
| Haut de l'accueil (engagements) | KeyRound (clé), ClipboardCheck (devis), ShieldCheck (bouclier) |
| Barre mobile Devis / SOS / Contact | FileText, KeyRound, MessageCircle |
| Bloc urgence (ligne du bas) | MapPin, FileText, ShieldCheck (accueil) ; Timer, ShieldCheck, FileText, Store (autres services) |
| Après sinistre | Search, FileText, Wrench, FolderOpen, Camera, ShieldCheck |
| Clés et badges | KeyRound, Store, Search, Settings, HandHelping, MapPin |
| Agences et zone | MapPin, Clock, Navigation, Phone |
| Contact, formulaires | Phone, MessageCircle, FileText, MapPin, CalendarDays, Send |
