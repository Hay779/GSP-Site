# 2026-11-26 — Le journal devient un dossier (branche `claude/journal-dossier`)

- Pourquoi : à chaque fois que deux conversations travaillaient en même temps, elles écrivaient toutes les deux en haut de `docs/JOURNAL.md` → conflit à la fusion.
- Nouvelle règle (dans `CLAUDE.md`) : **un fichier par séance** dans `docs/journal/`, nommé `AAAA-MM-JJ-sujet.md`. Chacun écrit seulement son fichier, pas de sommaire commun. L'état à jour et le « reste à faire » vont dans le fichier du chantier (ex. `docs/PASSATION-ANNUAIRES.md`), pas dans le journal.
- `docs/JOURNAL.md` renommé `docs/JOURNAL-ARCHIVE.md` (historique jusqu'au 25/11, on n'y écrit plus). Les 6 séances du 26/11 sont déplacées dans leurs propres fichiers de `docs/journal/`.
- Le « Reste à faire » des petits annuaires est déplacé dans `docs/PASSATION-ANNUAIRES.md` (section 2).
- Références mises à jour : `CLAUDE.md`, `docs/PASSATION-ANNUAIRES.md`, `docs/SYNCHRO-ANNUAIRES.md`, `docs/BLACK-FRIDAY.md`.
- Hermes (serveur) : sa mémoire (profil principal et profil `claude`) disait « lire docs/JOURNAL.md » ; remplacé par « lire les 10 derniers fichiers de docs/journal/ ». Copies de sauvegarde : `MEMORY.md.bak-20261126-journal`. Ses tâches planifiées (veille du lundi, rappel Black Friday) ne lisent pas le journal : rien à changer.
- Toutes les autres conversations étaient en pause pendant le changement, sans travail non fusionné.

## Questions pour Hermes
- `docs/seo/etat-hermes.md` cite encore `docs/JOURNAL.md` avec des numéros de ligne : ce fichier s'appelle maintenant `docs/JOURNAL-ARCHIVE.md` et les numéros ont changé. À mettre à jour à ta prochaine mise à jour de ce bilan.
- Pour tes prochaines missions : lire les derniers fichiers de `docs/journal/` (et non plus la fin de `docs/JOURNAL.md`).
