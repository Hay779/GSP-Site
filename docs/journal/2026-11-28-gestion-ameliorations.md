# 28/11/2026 — Espace /gestion : 3 améliorations

Demande du client : « regarde ce qu'on peut améliorer », puis « commence par le 1 et continue » (liste proposée : 1 avis Google, 2 ancien QR code, 3 page Aujourd'hui).

## 1. Relance « Demander un avis Google » (rubrique Relances)
- `src/utils/relances.ts` : nouvelle raison `avis`. Proposée 1 à 60 jours après un code de réduction utilisé ou une demande « Terminée » (sauf demandes partenaires).
- Une seule fois par client : jamais reproposée après « Avis demandé », même pour une autre référence du même téléphone.
- Message SMS / WhatsApp / e-mail avec le lien direct « Laisser un avis » (`REVIEWS_SOURCE.leaveReviewUrl`).
- `public/api/gestion.php` : la clé `…:avis` est acceptée.

## 2. Campagne : compter l'ancien QR code (rubrique Publicité)
- `public/api/stat.php` : nouveau total `offres_sans_lien` (arrivées sur la page d'une offre sans lien de campagne), compté à partir de la mise en ligne.
- Case « Compter aussi les visites de l'ancien QR code » dans la fiche d'une campagne liée à une offre (`sans_lien` dans `~/gestion/campagnes.json`). Pour les flyers -5 % déjà imprimés avec le QR code vers `/offre`.

## 3. Page « Aujourd'hui » (nouvelle 1re rubrique, ouverte à la connexion)
- `src/utils/today.ts` + `src/components/gestion/TodayPanel.tsx` : demandes à rappeler, relances à faire (+ avis à demander), inscriptions sur 7 jours, visites d'hier, avec la comparaison à la période d'avant. Chaque case mène à sa rubrique.
- 5 relances urgentes / demandes à rappeler avec bouton Appeler ou SMS, et le nombre de codes utilisés sur 30 jours.

Tests : 146 OK. Pas encore en ligne au moment d'écrire (attente du « mets en ligne » du client).
