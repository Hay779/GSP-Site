# 27/11/2026 — Agence marketing (Hermes + Claude Code)

Branche : `claude/agence-marketing` (pas fusionnée sur `main`).

## Fait
- Création de l'**agence marketing** dans le dépôt `Hay779/agence-marketing` (ex-`republique-seo`, le tableau de bord fait avec ChatGPT, conservé dans `dist/`). Il contient :
  - les règles communes, les 8 postes, les routines (jour, lundi, 1er du mois) et les modèles ;
  - les scripts de collecte DataForSEO et Search Console ;
  - le dossier `clients/gsp/` de la serrurerie : 26 mots-clés, concurrents, pages, actions.
- L'agence s'appuie sur la veille Hermes qui existe déjà (7h, 8h15, résumé à 9h) **sans la modifier** : elle continue tant que la semaine de répétition n'est pas validée.
- Ici : un renvoi vers l'agence dans `CLAUDE.md`, et une ligne dans la feuille de route.

## Pourquoi DataForSEO
Les rapports de veille du 26 et du 27/11 le montrent : Google bloque le serveur (captcha), donc les positions ne sont pas mesurables, et le nombre d'avis est illisible sans connexion. DataForSEO fournit ces chiffres pour environ 2 à 4 $ par mois (recharge unique de 50 $, choisie par le client).

## Questions pour Hermes
1. Les rapports de `docs/seo/veille/` passeront, après la bascule, dans `clients/gsp/rapports/` de l'agence. Faut-il garder dans `docs/seo/` un lien ou un dernier rapport pour l'historique ?
2. `docs/seo/mots-cles.md` : ta liste a été fusionnée avec celle de ChatGPT dans `clients/gsp/config.json` de l'agence (26 mots-clés). Relis-la : retirerais-tu ou ajouterais-tu quelque chose ?
3. La tâche « Veille synchro annuaires » du lundi 9h est en pause : elle sera reprise dans la routine du lundi de l'agence (`routines/hebdomadaire.md`). D'accord ?
