# Journal — archive (jusqu'au 26/11/2026)

Ancien journal de Claude Code, gardé pour l'historique. **On n'y écrit plus.**
Depuis le 26/11/2026 : un fichier par séance dans `docs/journal/` (voir `CLAUDE.md`). Les séances du 26/11/2026 y ont été déplacées.

## 2026-11-25 — Fusion et mise en ligne (Black Friday + annuaires)
- Fusion dans `main` de `claude/youthful-pascal-btj1i4` (Black Friday mobile, offres confirmées), puis de `claude/annuaires-pagesjaunes`. Seul conflit : ce journal, résolu en gardant les deux entrées.
- Vérifications : `tsc` OK, 100 tests OK, `npm run build:prod` OK (18 pages dont `/promotions`). Pendant la séance, la version PC et tablette du Black Friday (PR #17) est arrivée sur `main` : elle a été intégrée, revérifiée et mise en ligne aussi.
- Envoi sur OVH : 81 fichiers de `dist/` par FTP, sans suppression. `www/signature/`, `~/config-formulaires.php` et `~/demandes/` intacts. `api/demande.php` identique à la version du serveur.
- Le `.htaccess` en ligne est maintenant la version corrigée : redirections en `https://` complet, sans « :443 ».
- Contrôlé en ligne : `/`, `/promotions`, `/devis`, `/agences-contact`, sitemap, robots, llms.txt, signature → 200. Les redirections `.html`, `index.html` et http sans www → 301 propres. Le formulaire répond 405 en GET (normal).
- **Rappel Hermes** sur Telegram le **01/12 à 8h** (tâche 387402680cc9, une seule fois) : reconstruire et renvoyer le site pour retirer `/promotions` du HTML pré-rendu et du sitemap.

## 2026-11-25 — Black Friday : version PC et tablette (branche `claude/youthful-pascal-btj1i4`)
- **Bandeau doré** affiché sur toutes les tailles d'écran (accueil et `/promotions`).
- **Ordinateur** : macaron « Black Friday -20 % » penché sur la photo du haut de page. Il ouvre la pop-up.
- **Tablette et ordinateur** : rond « Black Friday -20 % » en bas à gauche (le bouton WhatsApp est à droite). Il apparaît après le haut de page, est masqué sur le pied de page, et sa croix masque le Black Friday pour la visite.
- **Pop-up** : centrée à l'écran sur tablette et ordinateur (en bas sur mobile), fermeture par la croix, « Fermer », Échap ou clic à côté.
- **Page `/promotions`** : sur ordinateur, texte et compte à rebours à gauche, offres à droite ; « Comment en profiter » sur 3 colonnes ; questions et carte de l'agence côte à côte.
- Mobile inchangé. Captures : `docs/maquettes/black-friday/captures-pc/`. Vérification du code, 100 tests et construction de production : OK.
- **À fusionner vers `main` puis renvoyer sur OVH** (la version mobile est déjà dans `main`).

## 2026-11-25 — Black Friday : version mobile codée (branche `claude/youthful-pascal-btj1i4`)
- Présentation validée par le client : `docs/maquettes/black-friday/8-presentation-onglet-popup.png` (style noir et or de ses affiches, `modeles-client/`). Captures du résultat : `docs/maquettes/black-friday/captures-mobile/`.
- **Accueil (mobile)** : bandeau doré défilant sous l'en-tête (caché avec lui), rond « Black Friday -20 % » en bas à droite au-dessus de la barre Devis · SOS · Contact (petite croix = masqué pour la visite, sessionStorage ; caché quand le menu SOS est ouvert et sur le pied de page). Toucher le rond ou le bandeau ouvre la **pop-up** des 3 offres (croix, « Fermer », glisser vers le bas, Échap). Rien ne s'ouvre tout seul.
- **Page `/promotions`** : haut de page façon affiche + compte à rebours, 3 offres avec visuels, « Comment en profiter », conditions, FAQ, carte de l'agence République (sans photo du magasin, demande du client).
- **Dates** : `src/data/promotions.ts` (24/11 00:00 → 30/11 23:59, heure de Paris). Après : tout disparaît, `/promotions` affiche « Pas d'offre en ce moment » et passe en noindex. Testé avec l'horloge au 01/12.
- **SEO** : `/promotions` dans `PAGE_SLUGS`, balises et JSON-LD (fil d'Ariane + FAQ) dans `seo.ts`, sitemap (pendant la promo), bloc « Offre en cours » dans `llms.txt`.
- Visuels des offres : recadrés des affiches du client (`src/assets/images/promo/`). Aucune photo du magasin.
- Version PC : pas encore faite (tout le Black Friday est `sm:hidden` sauf la page `/promotions`).

### À faire / à confirmer
- Offres **confirmées par le client** (25/11) : 3e double de clé offert pour 2 achetés ; portes blindées pose comprise, modèles certifiés A2P, jusqu’à -25 % selon le projet (sur devis) ; tampons en boutique ou par téléphone, prêts dans la journée.
- **Reconstruire et renvoyer le site le 01/12** (`npm run build:prod`) : le HTML pré-rendu et le sitemap sont figés au moment du build (le JavaScript masque bien la promo, mais le HTML de départ et le sitemap la gardent jusqu'au prochain envoi).
- Pas de mise en ligne OVH sans l'accord de l'autre session (celle de la mise en ligne).

### Questions pour Hermes
- Après le 30/11, retirer `/promotions` de la Search Console si elle y a été soumise ; vérifier qu'elle repasse en noindex.

## 2026-11-25 — Apple Plans (Apple Business)
- Compte **Apple Business** créé : organisation SERRURERIE DE LA REPUBLIQUE, compte Apple géré **contact@serrurerierepublique.fr** (mot de passe choisi par le client), téléphone de vérification 06 50 70 44 52. E-mails promotionnels Apple refusés.
- **Validation de l'organisation** : documents envoyés par le client, en attente chez Apple (quelques jours).
- Fiche Plans : l'ancienne fiche « Galstyan Grigor, **61** r de la République » a été **revendiquée et corrigée au 48**. Nom affiché « Serrurerie de la République », catégorie Emergency Locksmith Service, site, description (agréé assurances, urgences le soir et le dimanche). Horaires déjà justes (lun–sam 9h–19h).
- Logo recadré, photo de couverture (comptoir) et 7 vraies photos ajoutés : tout est « en cours de validation » chez Apple.
- À faire après validation : vérifier la fiche publique, puis ajouter les « Éléments en vedette » (équivalent des posts Google) lors de la prochaine synchro.

## 2026-11-25 — Bing Places
- Compte Bing Places créé avec « Continuer avec Google » (gspserrurerie13). Fiche **importée depuis Google**, vérification instantanée. **Synchronisation hebdomadaire avec Google activée** : les changements faits sur Google (infos, horaires, description, services) passent sur Bing tout seuls.
- Ajouté à la main : 8 vraies photos (`docs/photos-reelles/`) + logo recadré.
- Publication Bing annoncée sous 7 à 12 jours. Le nom est celui de Google (« Bricard Vachette Serrurerie de la République… ») : c'est voulu, Google n'est pas modifié (décision client).
- Pas d'actualités sur Bing Places (la fonction n'existe pas) : rien à synchroniser de ce côté.

## 2026-11-25 — PagesJaunes revendiquée et corrigée
- Compte **Solocal Manager** créé avec « Continuer avec Google » (gspserrurerie13@gmail.com), fiche PagesJaunes n° 65378857 **revendiquée** (code par appel vocal depuis le 04 91 90 51 65, saisi par le client).
- Modifié dans Solocal Manager :
  - nom « Serrurerie de la République » (le nom secondaire « SERRURERIE DE LA REPUBLIQUE » est gardé) ;
  - adresse 48 rue de la République, 13002 ;
  - horaires lun–sam 9h–19h, dimanche fermé ;
  - téléphones 04 91 90 51 65 (Boutique) + 06 50 70 44 52 (Mobile / WhatsApp – urgences) ;
  - moyens de paiement (CB, Visa, Mastercard, Amex, espèces, chèque, virement, PayPal, Apple Pay, Google Pay, Paylib) ;
  - description longue + « Agréé assurances » + « Urgences aussi le soir et le dimanche » ;
  - site https://www.serrurerierepublique.fr ;
  - activités secondaires « serrurerie (dépannage) » et « vitrerie » (la principale « clés (reproduction) » est gardée, comme sur Google) ;
  - prestations « duplication de clé » et « reproduction de badge d'immeuble ».
- **Visuels PagesJaunes** : logo recadré serré `docs/logo-google/logo-carre-serre-1080.png` (le texte prend toute la largeur, plus lisible en petit ; à réutiliser sur les autres annuaires), vignette = façade de jour, galerie = 7 vraies photos de la boutique.
- **Vraies photos** (prises par le client, récupérées depuis sa fiche Google) : `docs/photos-reelles/` (façade jour/nuit/vitrine, comptoir, intérieur, plan de travail, machines à clés, présentoir clés et badges). À utiliser pour les annuaires, et plus tard sur le site à la place des illustrations.
- **Compléments PagesJaunes** : 15 marques (Abus, Assa Abloy, Bricard, Cisa, DOM, Héraclès, ISEO, JPM, Keso, Laperche, Mottura, Muel, Mul-T-Lock, Pollux, Thirard ; Vachette, Picard et Fichet absents de la liste) ; 9 prestations clés, confirmées par le client (carte de propriété, clé à puce, clé automobile reproduction/duplication/reprogrammation, télécommande de portail, reprogrammation de clé électronique, duplication, badge d'immeuble).
- **5 actualités publiées sur PagesJaunes** (25/11, avec photos réelles et bouton vers le site) : doubles de clés et de badges ; porte claquée ou forcée et urgences soir et dimanche ; syndics et copropriétés ; assurances et sinistres (agréé) ; clés de voiture et télécommandes. Textes réutilisables pour Google, Bing et Facebook.
- **5 autres actualités PagesJaunes par marque** (Bricard, Héraclès, KESO, Mul-T-Lock, Pollux) : textes et visuels repris des posts Google du client. Visuels dans `docs/photos-reelles/posts-marques/`. Ce sont des visuels promotionnels, pas des photos de la boutique, donc à n'utiliser que pour les publications, pas dans les galeries.
- Le connecteur Google Business (Pipedream) ne voit aucun compte : il n'est pas relié à gspserrurerie13. À reconnecter si on veut publier sur Google depuis Claude ou Hermes.
- Pas d'e-mail public (décision client). Aucune certification ajoutée : la liste ne propose que des labels officiels (A2P…), pas « agréé assurances ».
- Nom, adresse, téléphones et activités sont **en vérification chez Solocal** (jusqu'à 48 h, réponse par e-mail).
- Google : **on n'y touche pas** (décision client).

### Questions pour Hermes
- Dans `docs/seo/annuaires.md`, passer PagesJaunes à « corrigé (en vérification Solocal) ». Vérifier la fiche publique dans 2–3 jours, puis 118 712 et Mappy, qui reprennent PagesJaunes.

## 2026-11-25 — fiche « infos officielles » pour les annuaires
- Nouveau fichier **`docs/INFOS-OFFICIELLES.md`**, validé par le client : seule source de vérité pour toutes les fiches (nom, adresse, téléphones, e-mail, horaires, dépannage d'urgence, catégories, descriptions, prestations détaillées, zone, logos, infos légales).
- Décisions du client :
  - **Une seule boutique** sur les annuaires : République, 48 rue de la République. L'agence Rome n'y figure pas.
  - **Ne pas mélanger** avec Serrurerie Extra ni une autre société : à traiter plus tard, séparément.
  - **Ancien Wix** : on ne s'en occupe pas, mais tout lien vers lui trouvé sur une fiche est remplacé par https://www.serrurerierepublique.fr.
  - **Mobile / WhatsApp : 06 50 70 44 52**, qui remplace le 07 82 82 82 08.
  - Dépannage d'urgence assuré aussi le soir et le dimanche.
  - Facebook et Instagram seront créés plus tard.
- Reste côté site : le 07 82 82 82 08 apparaît encore à 6 endroits, et le dépannage le soir et le dimanche n'est pas mentionné. À corriger pour que le site et les fiches disent la même chose.

### Questions pour Hermes
- Mission annuaires : partir de `docs/INFOS-OFFICIELLES.md` (et non plus des infos du site) pour l'inventaire `docs/seo/annuaires.md`. Aucune création ni modification de fiche sans accord du client.

## 2026-11-25 — messagerie de l'entreprise (état de référence)
- **contact@serrurerierepublique.fr** : boîte OVH MX Plan, webmail Roundcube (mail.ovh.net). Reçoit les formulaires du site.
- **Redirection OVH** : contact@ → serrurerierepublique@hotmail.fr, avec une copie conservée sur OVH. Les messages de contact@ arrivent donc dans Roundcube **et** dans Hotmail.
- **Gmail gspserrurerie13@gmail.com** : envoie en tant que contact@ (SMTP ssl0.ovh.net:465 SSL, nom affiché « Serrurerie République »), adresse **par défaut**. Gmail ne **reçoit pas** les messages de contact@.
- **Hotmail / Outlook.com** : reçoit contact@ par la redirection, mais **ne peut pas envoyer en tant que contact@** (Outlook.com web ne permet pas l'envoi depuis un domaine extérieur). Solutions : répondre depuis Gmail ou Roundcube, ou ajouter contact@ en compte IMAP dans l'application Outlook (PC ou téléphone).
- **Signature** « Serrurerie de la République » (version adaptée au mobile) installée par défaut dans Gmail (rattachée à contact@), Outlook et Roundcube. Images dans `www/signature/` sur OVH. Outlook.com retire les liens `tel:`.
- `postmaster@serrurerierepublique.fr` (adresse technique obligatoire) est redirigé vers serrurerieextra13@gmail.com (réglage d'origine, toujours utilisé) **et** vers gspserrurerie13@gmail.com (ajouté le 25/11/2026).

## 2026-11-25 — signature e-mail (hors site)
- Dossier `www/signature/` sur OVH : logo et bandeau de la signature e-mail, plus une page d'aperçu (noindex, `.htaccess` propre au dossier). **Ne pas le supprimer lors d'un envoi du site** : les signatures Gmail, Outlook et Roundcube pointent vers ces images.
- Sources dans `Projects/Signature_Republique_Gmail_Outlook_OVH/signature_mail_republique/final`.
- Gmail : la version adaptable se repliait mal dans la petite fenêtre « Nouveau message » (moins de 640 px). Elle est remplacée par une version à largeur fixe (440 px, 3 colonnes serrées : logo, numéros, coordonnées), `final/signature-fixe.html`. Roundcube avait le même problème (blocs empilés) : version fixe installée aussi le 26/11/2026. Outlook garde la version adaptable (sa fenêtre de rédaction est assez large, affichage vérifié correct). Copie du dossier aussi dans `Projects/GSP/`.

- Anti-spam (26/11/2026) : SPF (`include:mx.ovh.com -all`) et DKIM OVH (vert dans MX Plan) déjà en place ; **DMARC ajouté** dans la zone DNS OVH : `_dmarc` TXT `v=DMARC1; p=none; adkim=r; aspf=r` (surveillance seule, ne bloque rien). À durcir plus tard (`p=quarantine`) une fois vérifié que les formulaires du site passent SPF/DKIM.
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
