# 2026-11-26 — Images Professionnels : retouches, essais refusés sur le reste du site (branche `claude/recadrage-syndics`)

- **Syndics** : le regard du serrurier était raté (yeux) → nouvelle image fal.ai, gros plan des mains **sans tatouages** (le client voulait une autre personne que A et D, pas tatouée), serrure dorée sur porte d'immeuble noire.
- **Logo sur les polos** (demande du client) : le vrai logo « Serrurerie de la République » posé sur la poitrine des polos (Assureurs, Agences, Partenaire), avec `docs/images-site/serruriers-ia/outils/logo_polo.py` (l'IA ne sait pas écrire un logo exact).
- Vérification de toutes les images du site : 5 personnes différentes pour un même métier. Essai de refaire l'accueil, la vitrerie, la menuiserie et l'après-sinistre avec A et D + logo : **refusé par le client** (« ça ne me plaît pas »). Photos d'origine conservées ; noté dans `docs/images-site/serruriers-ia/LISEZMOI.md` pour ne pas les reproposer.
- TypeScript, 100 tests, build : OK. Mis en ligne sur OVH après « mets en ligne ».
