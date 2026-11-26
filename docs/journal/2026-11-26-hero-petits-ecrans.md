# 2026-11-26 — Accueil mobile : le haut de page tient dans l'écran des petits iPhone (branche `claude/hero-petits-ecrans`)

- Problème : le haut de page de l'accueil avait une hauteur minimale de 540 px. Sur iPhone SE 2/3 (environ 548 px visibles dans Safari), il dépassait de 105 px : la barre Devis / SOS / Contact était cachée. Ancien iPhone SE (568 px) : 85 px cachés.
- Correction (`src/components/HeroSection.tsx`, mobile seulement) : titre, texte, espace au-dessus de la barre et marge du bas s'adaptent à la hauteur de l'écran (`svh`) avec des valeurs plafonnées ; hauteur minimale 540 → 400 px ; photo 150 → 110 px minimum.
- iPhone 13 / 14 / 15 : rendu **identique au pixel près** (mesuré avant/après : photo 247 px, texte 305 px, barre en bas à 645 px).
- Petits écrans après : tout tient dans l'écran (SE 2/3 : haut de page jusqu'à 549 px pour 548 ; SE 1 : 569 pour 568), barre visible au-dessus de la vague dorée.
- Reste connu : sur petit écran, le rond Black Friday recouvre la fin de 2 lignes du texte (comme sur iPhone 13). Laissé tel quel : il disparaît le 01/12 avec la fin de la promo.
- Captures avant/après (iPhone 13, SE 2/3, SE 1) validées par le client. TypeScript, 100 tests, build : OK. Mis en ligne sur OVH.
