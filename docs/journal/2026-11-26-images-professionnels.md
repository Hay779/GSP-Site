# 2026-11-26 — Images dédiées pour le menu et les pages Professionnels (branche `claude/images-pro`)

- Problème signalé par le client : les vignettes du menu « Professionnels » ne correspondaient pas (volets roulants pour les syndics, cylindre pour les agences, panorama de Marseille pour « Devenir partenaire »).
- 4 images créées avec fal.ai (FLUX 1.1 pro ultra) : `pro_syndics`, `pro_assureurs`, `pro_immobilier`, `pro_partenaire` (1600 px, WebP + JPG dans `src/assets/images/`).
- Branchées dans le menu (`src/App.tsx`) et dans le haut des pages Syndics, Assureurs, Agences (`src/data/pages.ts`). La page « Devenir partenaire » n'a pas de photo de haut de page ; la page d'ensemble « Professionnels » garde le panorama.
- Choix du client, en plusieurs essais : d'abord un serrurier aux cheveux gris (comme le reste du site), puis un jeune tatoué refusé (coupe et visage), puis 4 portraits proposés : le client a retenu **A et D**, deux jeunes serruriers (A : Syndics et Agences ; D : Assureurs et Partenaire). Coût fal.ai total d'environ 2 €.
- **Mémoire des serruriers** : portraits, descriptions exactes et scripts dans `docs/images-site/serruriers-ia/` (la clé fal.ai n'y est jamais : variable `FAL_KEY` au lancement). Copies des 4 images dans `docs/images-site/9-professionnels/`.
- TypeScript, 100 tests, build : OK. Captures menu + 3 pages (ordinateur et mobile) validées. Mis en ligne sur OVH après « mets en ligne ».

## Pistes (non faites)
- Le reste du site montre encore l'ancien serrurier aux cheveux gris (haut de l'accueil, urgence, après sinistre, vitrerie…). À remplacer par A/D seulement si le client le demande.
