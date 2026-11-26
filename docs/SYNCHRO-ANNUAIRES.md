# Synchronisation des annuaires

> Demande du client (25/11/2026) : tout ce qu'on ajoute sur **Google (GMB)**, sur le site ou ailleurs doit être **répercuté au fur et à mesure sur tous les annuaires**, par Claude Code ou par Hermes.

## Sources (ce qui déclenche une synchro)

| Source | Exemples | Où la lire |
|---|---|---|
| **Fiche Google** (source principale du client) | nouveaux posts et offres, nouvelles photos, horaires exceptionnels, nouveaux services | Google Maps, fiche cid 8005087096552407541 (« Du propriétaire », photos du propriétaire) |
| **Infos officielles** | nom, adresse, téléphones, horaires, prestations, description | `docs/INFOS-OFFICIELLES.md` (seule source de vérité) |
| **Site** | nouvelles pages, nouvelles prestations | https://www.serrurerierepublique.fr |

## Destinations (où recopier)

| Annuaire | Compte | Qui peut publier | Ce qu'on synchronise |
|---|---|---|---|
| PagesJaunes / Solocal Manager | gspserrurerie13@gmail.com (connexion Google) | Claude Code (Chrome) | actualités, photos, horaires, prestations, description |
| Bing Places | gspserrurerie13@gmail.com (connexion Google) | **automatique** : synchro hebdomadaire avec Google activée | rien à faire sauf photos (8 vraies photos + logo ajoutées le 25/11) |
| Apple Business (Plans) | compte Apple géré contact@serrurerierepublique.fr (mot de passe chez le client) | Claude Code (Chrome), une fois l'organisation validée | infos, photos, « Éléments en vedette » (équivalent des posts) |
| Petits annuaires (Cylex, Yably…) | à créer | Claude Code / Hermes | infos, lien du site |
| Facebook / Instagram | à créer plus tard | — | posts |

Google n'est pas modifié par nous : c'est la **source**. Le client y publie lui-même (décision du 25/11/2026).

## Règles de recopie

- **Posts et offres Google** → actualité sur chaque annuaire qui en a (PagesJaunes…), **même texte, même visuel**, bouton « En savoir plus » vers le site. Retirer les dates « Valable du … » quand elles sont dépassées.
- **Photos** : seules les **vraies photos** de la boutique vont dans les galeries. Les visuels promotionnels (ex. posts par marque) ne vont **que** dans les actualités.
- **Infos** (horaires, téléphones…) : toujours depuis `docs/INFOS-OFFICIELLES.md`. Les horaires exceptionnels (fermetures, jours fériés) sont recopiés partout.
- Rien de payant, aucun code SMS ni mot de passe saisi par un agent.

## Fonctionnement

1. **Hermes surveille chaque lundi à 9h** (tâche « Veille synchro annuaires ») : il compare la fiche Google et `INFOS-OFFICIELLES.md` avec ce qui a déjà été recopié (`docs/seo/synchro-etat.md`, tenu par Hermes) et écrit la liste de ce qui manque dans `docs/seo/synchro-a-faire.md`, puis envoie un résumé sur Telegram.
2. **Le client dit à Claude Code « fais la synchro des annuaires »** : Claude lit `docs/seo/synchro-a-faire.md`, publie sur chaque annuaire via Chrome, puis note ce qui a été fait dans un fichier de séance `docs/journal/AAAA-MM-JJ-synchro-annuaires.md`.
3. Le client peut aussi le demander à tout moment, sans attendre le lundi : « j'ai ajouté X sur Google, synchronise ».

## État au 25/11/2026 (déjà recopié sur PagesJaunes)

- Posts Google repris : reproduction de clés et badges ; Bricard ; Héraclès ; KESO ; Mul-T-Lock ; Pollux. Les sujets « Cambriolage, porte forcée, vitre brisée » et « Serrurier à Marseille » sont couverts par les actualités PagesJaunes « Vous êtes assuré ? » et « Porte claquée ou porte forcée ? ».
- Photos : 8 vraies photos (`docs/photos-reelles/`), logo recadré (`docs/logo-google/logo-carre-serre-1080.png`).
