# 27/11/2026 — Espace /gestion : rubrique « Suivi du site »

Branche : `claude/gestion-suivi`.

## Fait
- **Compteur de visites du site** (`public/api/stat.php`, appelé par `src/utils/siteStats.ts` à chaque page) : sans cookie, sans identifiant, aucune adresse IP conservée, robots exclus ; garde seulement des totaux par jour dans `~/gestion/stats/AAAA-MM-JJ.json` (pages vues, arrivées sur le site, provenance générale, offre vue, téléphone/ordinateur). Limite anti-abus par heure (empreinte salée, effacée chaque jour). Rien n'est compté sur /gestion ni dans l'aperçu de l'éditeur.
- Provenances : Google, Bing, autres moteurs, annuaires, réseaux sociaux, QR code / flyer (arrivée sans site d'origine sur une page d'offre, ou `utm_source=qr|flyer|affiche`), autres sites, accès direct.
- Rubrique **Suivi du site** : période 7 / 30 / 90 jours, visites (+ pages vues), demandes reçues, part des visites qui finissent en demande, inscriptions, comparaison avec la période précédente ; graphique des visites par jour (survol + tableau) ; provenances, pages les plus vues, offres (pages vues → inscrits), appareils. Calculs : `src/utils/siteStatsReport.ts` (+ tests).
- Page Confidentialité : paragraphe ajouté sur ces statistiques internes sans cookie (Google Analytics inchangé, toujours après accord).

## À savoir
- Le compteur démarre à la mise en ligne : pas d'historique avant. Les chiffres de Google Analytics restent dans le compte Google.
