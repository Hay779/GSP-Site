# 2026-11-26 — Accueil mobile : barre Devis / SOS / Contact descendue (branche `claude/barre-mobile`)
- Sur mobile, en haut de l'accueil, la barre Devis / SOS / Contact est descendue de 12 px (`src/components/HeroSection.tsx` : marge du bas du haut de page `pb-8` → `pb-5`). 16 px testés : le coin de la barre touchait la vague dorée.
- Effet secondaire positif : le rond flottant Black Friday ne touche plus la barre sur iPhone 13.
- Une refonte plus large (barre plus fine, plus large, cachée en descendant) a été montrée en captures puis **refusée par le client** : il préfère l'ancienne barre. Rien d'autre n'a changé (barre fixe, taille, comportement au défilement).
- Captures AVANT / APRÈS iPhone 13 et iPhone SE (Playwright) validées par le client. Vérification TypeScript, 100 tests, build : OK. Mis en ligne sur OVH.
