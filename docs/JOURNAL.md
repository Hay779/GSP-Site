# Journal — Claude Code

Ce que Claude Code a fait sur le site, séance par séance (plus récent en haut).
Hermes lit ce fichier avant de travailler. Ses propres recherches sont dans `docs/seo/`.

## 2026-11-25 — signature e-mail (hors site)
- Dossier `www/signature/` sur OVH : logo et bandeau de la signature e-mail, plus une page d'aperçu (noindex, `.htaccess` propre au dossier). **Ne pas le supprimer lors d'un envoi du site** : les signatures Gmail, Outlook et Roundcube pointent vers ces images.
- Sources dans `Projects/Signature_Republique_Gmail_Outlook_OVH/signature_mail_republique/final`.
- Numéro de dépannage et WhatsApp de la signature : 06 50 70 44 52. Différent du WhatsApp du site (07 82 82 82 08) : à harmoniser si le client le confirme.

## 2026-11-25 — vitesse mobile
- Photos du site converties en WebP : 1,3 Mo en JPEG → 0,76 Mo. Les JPEG restent pour l'image de partage (`seo.ts`).
- Accueil : la photo du haut de page est préchargée dans le `<head>` (ajouté par `scripts/prerender.ts`).
- Animations d'entrée du haut de page coupées quand la page arrive pré-rendue (`src/utils/firstPaint.ts`) : le titre est visible tout de suite.
- PageSpeed mobile : 78 → **83** ; LCP 5,7 s → **4,5 s**. Ordinateur : 83 → **93**.
- Reste : environ 1 s d'affichage de la photo attend le JavaScript (662 Ko), parce que React reconstruit la page au lieu de reprendre le HTML pré-rendu. Pistes : passer à `hydrateRoot` (le pré-rendu doit alors produire exactement le premier rendu client), ou découper le code par page (`React.lazy`). Chantier à part, à tester avec soin.

## 2026-11-23 (séance 2) — préparation de la mise en ligne
- Plan d'action en 7 étapes validé avec le client : 1) mise en ligne OVH, 2) formulaires, 3) Search Console et Bing, 4) fiche Google, 5) annuaires, 6) pages locales et contenu, 7) avis, publications et blog en autonomie. Les étapes 4, 5 et 7 (fiche Google, annuaires, avis, mots-clés) sont le rôle de Hermes.
- Version finale du site fabriquée (`npm run build:prod`) : 17 pages pré-rendues, `sitemap.xml`, `robots.txt`, `llms.txt`, `.htaccess`. Vérification du code et 88 tests : OK. `npm audit` : 0 vulnérabilité.
- Correction : `playwright` manquait dans `package.json` (le pré-rendu ne marchait pas après une installation propre). Ajouté en dépendance de développement.
- Pages locales (étape 6) : la recommandation de `docs/seo/mots-cles.md` est retenue. On enrichira d'abord la page `/zone-intervention` regroupée plutôt que de créer une page par quartier.
- Domaine choisi par le client : **serrurerierepublique.fr** (sans tiret), acheté chez OVH avec un hébergement Perso. `SITE_URL` mis à jour (`https://www.serrurerierepublique.fr`), site refabriqué.
- Mentions légales : hébergeur OVH SAS renseigné (`src/data/pages.ts`).
- **Site en ligne le 23/11/2026 : https://www.serrurerierepublique.fr** (hébergement OVH Perso, cluster130). SSL Let's Encrypt actif sur les 2 adresses. 58 fichiers envoyés par FTP dans `www/`. Vérifié : pages en 200, page inconnue en 404, redirection http → https www, en-têtes de sécurité présents, `.htaccess` inaccessible (403).
- **Formulaires branchés (étape 2)** : les 4 formulaires (devis, contact, partenaire, photos après sinistre) envoient à `public/api/demande.php` (PHP 8.4 sur OVH).
  - Chaque demande est enregistrée dans `~/demandes/AAAA-MM/<référence>/` (hors du site), puis envoyée par mail à `contact@serrurerierepublique.fr` (boîte MX Plan créée le 23/11/2026).
  - Anti-spam : vérification de l'origine, champ piège, délai minimum de 3 s, 5 envois par heure et par IP.
  - Photos réduites dans le navigateur (1600 px, JPEG) avant l'envoi.
  - En cas d'échec : message avec le téléphone et WhatsApp.
  - Réglages dans `~/config-formulaires.php` sur OVH (pas dans Git ; modèle dans `server/config-formulaires.exemple.php`).
  - Prévu pour plus tard : `webhook_url` pour transmettre chaque demande au serveur et à la base de données de l'entreprise (signature HMAC dans `X-Signature`).
- Tests externes (23/11/2026) :
  - PageSpeed mobile : performance 78, accessibilité 97, bonnes pratiques 100, SEO 100. Point faible : LCP 5,7 s, car le titre et la photo d'accueil attendent le JavaScript (662 Ko) et l'animation.
  - PageSpeed ordinateur : performance 83.
  - Test des résultats enrichis : 6 éléments valides. Corrigé : adresse et image ajoutées à `Organization`, coordonnées GPS (`geo`) des 2 agences (Base Adresse Nationale).
  - En-têtes de sécurité vérifiés à la main (HSTS, CSP, X-Frame-Options, nosniff).
- À faire (feuille de route D) : rendre le haut de page visible sans attendre le JavaScript et découper le code pour passer le LCP mobile sous 2,5 s.
- Étape 3 (25/11/2026) : **Google Search Console** configurée avec le compte gspserrurerie13@gmail.com (le même que la fiche Google).
  - Propriété « domaine » serrurerierepublique.fr, validée par un enregistrement TXT dans la zone DNS OVH. Ne pas supprimer cet enregistrement.
  - `sitemap.xml` envoyé : 17 pages découvertes. La page d'accueil est déjà indexée.
- Étape 3 terminée : Bing Webmaster Tools configuré (import depuis Search Console, sitemap envoyé).
- **Google Analytics 4** installé (25/11/2026), choix du client (Umami écarté pour l'instant).
  - Compte « Serrurerie de la République », propriété serrurerierepublique.fr, ID de mesure `G-GDWWNV28B3`, compte gspserrurerie13@gmail.com.
  - Réglages : partage de données avec Google désactivé (sauf l'assistance technique), signaux publicitaires désactivés, conservation 14 mois, e-mails marketing refusés. Propriété reliée à Search Console.
  - Côté site : le script n'est chargé qu'après « Accepter » dans la bannière (`src/components/CookieBanner.tsx`, `src/utils/analytics.ts`). Choix gardé 6 mois, lien « Gérer les cookies » dans le pied de page. Rien n'est chargé pour les robots (`navigator.webdriver`).
  - Événements suivis : `clic_telephone`, `clic_whatsapp`, `generate_lead` (avec `form_type`).
  - CSP élargie aux domaines Google Analytics. Page Confidentialité : section cookies rédigée.
  - À faire quand les premières données arrivent : marquer `generate_lead`, `clic_telephone` et `clic_whatsapp` comme « événements clés » dans GA4.
  - Remarque : le PC du client bloque googletagmanager.com par DNS (100.123.0.1), donc ses propres visites ne sont pas comptées.
- Statistiques de visite (avant ce choix) : le client veut savoir qui vient, d'où, et ce que font les visiteurs. Proposé : Search Console + statistiques OVH + Umami auto-hébergé (sans cookies, avec suivi des clics Appeler, WhatsApp et Devis). Pas Google Analytics (bannière cookies CNIL).

### Questions pour Hermes
- Le site est en ligne : mettre `https://www.serrurerierepublique.fr` dans le champ « Site web » de la fiche Google, à la place de l'ancien Wix.
- **MISSION PRIORITAIRE (demande du client, 25/11/2026) : corriger partout sur le web les anciennes informations.** Les annuaires affichent encore les anciens horaires et l'ancien site (Wix). À faire :
  1. **Inventaire** : rechercher toutes les fiches existantes (PagesJaunes, Apple Plans / Business Connect, Bing Places, Waze, Facebook, Instagram, Yelp, Hoodspot, 118712, Mappy, Cylex, Kompass, Societe.com, Pappers, annuaires d'artisans, Chambre de métiers, etc.). Les noter dans `docs/seo/annuaires.md` avec, pour chacune : l'adresse de la fiche, ce qui est faux, qui en a l'accès (revendiquée ou non) et l'état (à corriger, corrigé, à créer).
  2. **Corriger chaque fiche** avec ces informations exactes, identiques partout :
     - Nom : Serrurerie de la République
     - Adresse : 48 rue de la République, 13002 Marseille
     - Téléphone : 04 91 90 51 65
     - Site : https://www.serrurerierepublique.fr
     - Horaires : du lundi au samedi, 9h-19h ; dimanche fermé
     - 2e boutique : 124 rue de Rome, 13006 Marseille (mêmes téléphone et horaires ; page https://www.serrurerierepublique.fr/agences-contact)
  3. **Ne jamais afficher** l'adresse e-mail de l'entreprise. N'inventer ni note ni nombre d'avis.
  4. Les actions qui demandent la connexion du client (mot de passe, code reçu par SMS ou courrier) : les lister dans `docs/seo/annuaires.md`, section « À faire par le client », avec les étapes.
- Google Search Console (domaine) et Google Analytics 4 (`G-GDWWNV28B3`) sont en place sur le compte gspserrurerie13@gmail.com. Bing Webmaster Tools : site importé depuis Search Console (compte Google gspserrurerie13@gmail.com, accès en lecture seule) et `sitemap.xml` envoyé le 25/11/2026. Reste à faire : **Bing Places** (fiche entreprise Bing), qui peut s'importer depuis la fiche Google.

## 2026-11-23
- Mise en place de la communication avec Hermes : section « Travail avec Hermes » dans `CLAUDE.md`, création de ce journal.
- État du site : voir `docs/FEUILLE-DE-ROUTE.md` (25 points restants, priorité : mise en ligne OVH).

### Questions pour Hermes
- Pages locales : une page par quartier (proposée dans la feuille de route) ou une page « zone d'intervention » regroupée (ta recommandation) ? Donne ton avis argumenté dans `docs/seo/mots-cles.md`.
