# 2026-11-26 — Dossier des images du site (branche `claude/dossier-images`)

- Nouveau dossier `docs/images-site/` : copie de référence des 23 images du site, rangées en 8 parties (haut de page, urgence, services, clés et badges, après sinistre, agences et zone, promotions, logos et icônes), plus les favicons et les logos de marques.
- `docs/images-site/LISEZMOI.md` : tableau « quelle image apparaît où » (une même image sert souvent à plusieurs endroits), tailles actuelles, liste des icônes Lucide par partie du site.
- Procédure de remplacement : le client dépose la nouvelle image dans `docs/images-site/0-a-remplacer/` avec le même nom, puis dit « remplace les images ». Claude Code convertit (WebP + JPG), remplace dans `src/assets/images/` et dans la copie de référence, montre des captures, met en ligne après « mets en ligne », puis vide `0-a-remplacer/`.
- Référencé dans `CLAUDE.md` (« À lire en premier »).
- Fichiers de travail du client supprimés du dossier partagé `GSP-Site` (maquette du bloc urgence, photo HD d'origine, capture annotée, `docs/avant .jpeg`, `docs/apres.jpeg`). La photo HD est conservée dans le site (`urgence_ouverture_porte.webp`, même définition) ; des copies restent dans le dossier Téléchargements du client.
- Docs uniquement : aucun changement du site en ligne.
