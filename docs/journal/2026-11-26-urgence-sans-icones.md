# 2026-11-26 — Blocs urgence : cartes sans icône sur toutes les pages (branche `claude/urgence-sans-icones`)

- Le client avait d'abord demandé de retirer les ronds d'icône seulement sur le bloc de l'accueil (`docs/journal/2026-11-26-bloc-urgence.md`). Après mise en ligne, il confirme qu'il les veut retirés **aussi sur les autres services** (vitrerie, menuiserie, fermetures, clés et badges).
- `src/components/UrgencySection.tsx` : plus de rond d'icône sur les cartes à photo, sur toutes les pages ; champ `hideCaseIcons` supprimé. Le champ `icon` des cartes reste dans les données mais n'est plus affiché.
- Gardé : les petites icônes de la ligne d'engagements en bas des blocs.
- TypeScript, 100 tests, build : OK. Captures mobile des 5 pages services vérifiées. Mis en ligne sur OVH après « mets en ligne » du client.

## Pistes (non faites)
- Les blocs urgence des autres services affichent encore « Intervention rapide » dans la ligne du bas.
