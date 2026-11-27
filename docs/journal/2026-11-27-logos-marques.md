# 27/11/2026 — Logos des 24 marques

Branche : `claude/logos-marques` (pas fusionnée sur `main`, rien de mis en ligne).

## Fait
- 18 logos ajoutés au bloc « Marques » (Héraclès, ABUS, JPM, Mottura, Pollux, Tordjman Métal, Muel, Reelax, Cisa, Mul-T-Lock, Keso, Assa Abloy, Laperche, Deny Fontaine, Thirard, Somfy, Came, Nice). Les 6 logos existants, l'ordre et les noms sont inchangés.
- Fichiers fournis (dossier `docs/GSP-Site-logos-marques-manquants/`) rangés dans `docs/images-site/8-logos-icones/marques/` ; sources, aperçu et formulaire Tordjman dans `marques/sources/`. Aucun fichier existant écrasé.
- Copies optimisées (marges rognées, 180 px max) dans `public/assets/brands/`.
- `logoSrc` et `logoHeight` renseignés dans `src/data/sectionsContent.ts` (tailles harmonisées avec les 6 logos existants). Deny Fontaine utilise le logo Dény Security.
- Vérifié sur mobile (390 px) et ordinateur (1440 px) : 24 logos chargés. `npm run lint` et `npm run build:prod` OK.

## À vérifier avant publication
- Autorisations d'usage des logos : Tordjman Métal (formulaire PDF), CISA (formulaire en ligne), conditions des autres fabricants.
- Ne pas présenter les marques comme partenaires agréés sans justificatif.
- Héraclès et Assa Abloy sont des logos très larges : ils paraissent petits dans les cartes.
- Came et Nice ont été fournis en petite taille : un peu flous sur écran haute définition, à remplacer si une version plus grande est trouvée.
