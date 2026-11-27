# 27/11/2026 — Espace /gestion : rubrique « Publicité »

Branche : `claude/gestion-publicite`. Demande du client : « fais les 2 » (suivi des campagnes + création de pubs).

## Fait
- Onglet **Campagnes** : une campagne par flyer, affiche, Google Ads, Facebook, Instagram, annuaire payant… (nom, support, offre liée, dates, budget, notes, archivage). Chaque campagne a son lien `…?c=<identifiant>` et son QR code (PNG/SVG). Résultats : visites arrivées par le lien, inscriptions et clients (codes utilisés) de l'offre liée sur la période, coût par client ; totaux en haut.
- Compteur de visites : paramètre `c` (ou `utm_campaign`) compté à l'arrivée sur le site (`stat.php`, `siteStats.ts`), visible dans `campagnes` des totaux par jour.
- Onglet **Créer une pub** : textes Google Ads (titres ≤ 30, descriptions ≤ 90 caractères) et Facebook/Instagram (3 versions) faits à partir de l'offre et du public visé, uniquement avec des infos vraies (adresse, horaires, agréé assurances, note Google réelle) ; visuel carré 1080 × 1080 ou story 1080 × 1920 aux couleurs du thème, téléchargeable en PNG ; bouton « Créer la campagne de cette pub ».
- Serveur `gestion.php` : actions `campagnes` / `campagne` (`~/gestion/campagnes.json`).
- Fichiers : `src/components/gestion/AdsPanel.tsx`, `src/utils/campaigns.ts`, `adCopy.ts`, `adVisual.ts` (+ `publicite.test.ts`).
