# 27/11/2026 — Correctif du pré-rendu (port 4321)

## Ce qui s'est passé
Pendant la mise en ligne de la rubrique Publicité (PR #44), un autre programme de l'ordinateur occupait déjà le port 4321 sur `localhost` (adresse ::1).
Le pré-rendu a donc enregistré les pages d'erreur de ce programme à la place des pages du site, et ces pages ont été envoyées sur OVH.
Le site a affiché une page d'erreur pendant une dizaine de minutes. La mise en ligne a été refaite aussitôt avec les bonnes pages, et tout a été vérifié (accueil, devis, offre, gestion, page 404).

## Correctif
`scripts/prerender.ts` : le petit serveur du pré-rendu écoute sur `127.0.0.1`, et les pages sont lues sur `127.0.0.1` (plus sur `localhost`). Si le port est déjà pris, le pré-rendu s'arrête avec une erreur au lieu d'enregistrer de mauvaises pages.

## À retenir avant chaque envoi sur OVH
Vérifier que `dist/index.html` contient bien le titre du site (« Serrurier Marseille 2e & 6e »), et qu'aucun fichier `dist/*.html` ne contient une page d'erreur.
