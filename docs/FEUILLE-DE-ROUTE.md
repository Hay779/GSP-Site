# Feuille de route — améliorations à apporter

Mise à jour : 23/11/2026. Liste de référence des chantiers restants. On coche au fur et à mesure.

## A. Référencement IA (ChatGPT, Claude, Perplexity, Gemini, Copilot)
- [ ] **Pages locales par quartier ou besoin.** Par exemple :
  - « Serrurier Marseille 6e » et « Serrurier Marseille 2e » ;
  - « Ouverture de porte Marseille », « Changement de serrure Marseille » ;
  - « Rideau métallique bloqué Marseille ».

  Chaque page aura un texte unique et utile (pas de copier-coller), la FAQ du sujet et un lien vers l'agence la plus proche.
- [ ] **Réponses directes en tête de page.** 2 ou 3 phrases factuelles que les IA peuvent citer telles quelles : qui, quoi, où, délai, comment nous joindre.
- [ ] **FAQ enrichie** à partir des vraies questions entendues au téléphone et en boutique. Prix indicatifs si l'entreprise le souhaite (« à partir de… »).
- [ ] **Page « À propos »** : histoire de l'entreprise (reprise en juin 2026), savoir-faire, gérant, marques partenaires (Bricard, Vachette, Fichet…), certifications ou labels éventuels. Les IA s'appuient sur ces signaux de confiance.
- [ ] **Annuaires et citations** : PagesJaunes, Apple Plans (Business Connect), Bing Places, Waze, annuaires d'artisans, Chambre de métiers. Partout le **même nom, la même adresse et le même téléphone**.
- [x] **Bing Webmaster Tools** (25/11/2026) — [ ] **Bing Places** : ChatGPT et Copilot s'appuient sur l'index de Bing.
- [ ] **Avis Google** : continuer à en obtenir (affiche QR, messages), répondre à chaque avis, y compris les 2 avis négatifs sans réponse. Mettre à jour la note affichée sur le site.
- [ ] **Fiche Google Business** : voir `docs/AUDIT-GOOGLE-BUSINESS.md`.
  - Urgent : mettre le vrai nom et « Serrurier » en catégorie principale.
  - Ensuite : description, services, zone, publications, réponses aux avis, fiche de l'agence Rome.
- [ ] Relire `llms.txt` après chaque changement de contenu (il est généré automatiquement au build).
- [ ] Décider s'il faut bloquer les robots d'**entraînement** des IA (GPTBot, Google-Extended, CCBot). Ils sont autorisés aujourd'hui, ce qui donne plus de visibilité.

## B. Référencement Google classique
- [x] Nom de domaine définitif → `SITE_URL` dans `src/utils/seo.ts` (serrurerierepublique.fr).
- [x] Google Search Console et envoi du `sitemap.xml` (25/11/2026, compte gspserrurerie13@gmail.com).
- [ ] Image de partage dédiée (1200×630) avec le logo, pour WhatsApp, Facebook et LinkedIn.
- [x] Coordonnées GPS des 2 agences dans les données structurées (`geo`).
- [ ] Liens internes : depuis chaque page métier, lien vers la page locale du quartier concerné (quand elles existeront).
- [ ] Blog ou conseils (optionnel) : « Que faire après un cambriolage ? », « Porte claquée : les bons réflexes », « Choisir un cylindre haute sécurité ».

## C. Contenu et visuels
- [ ] Images de la rubrique Professionnels : abonnement Higgsfield, images générées par toi, ou vraies photos.
- [ ] Vraies photos : façades des 2 boutiques, équipe, chantiers avant/après (retirer alors le badge « illustration »).
- [ ] Image de partage (voir B).

## D. Technique et performance
- [ ] Découper le code JavaScript (654 Ko, 189 Ko compressé) pour accélérer le premier affichage.
- [ ] Photos en WebP et `width`/`height` sur les images, pour éviter les décalages au chargement.
- [ ] Test PageSpeed Insights (objectif ≥ 90 sur mobile) : 78 le 23/11/2026, LCP 5,7 s à corriger (titre et photo d'accueil visibles sans JavaScript).

## E. Mise en ligne (OVH)
Voir `docs/SEO-SECURITE-MISE-EN-LIGNE.md`, section 2 :
1. ✅ domaine (serrurerierepublique.fr) ;
2. ✅ SSL ;
3. ✅ envoi de `dist/` avec `.htaccess` (en ligne le 23/11/2026) ;
4. ✅ hébergeur dans les mentions légales ;
5. Search Console et Bing ;
6. tests (securityheaders.com, rich results).

## F. Formulaires (à la fin, sur OVH)
- [x] 4 formulaires branchés : devis, contact, devenir partenaire, photos après sinistre (avec pièces jointes) → `public/api/demande.php`.
- [x] Destination : contact@serrurerierepublique.fr, **jamais affichée sur le site** (réglage dans `~/config-formulaires.php` sur OVH).
- [x] Protection anti-spam, message d'erreur avec repli téléphone et WhatsApp (pas de service externe : `connect-src 'self'` suffit).
- [ ] Plus tard : relier les demandes au serveur et à la base de données de l'entreprise (`webhook_url`).

## Déjà fait (rappel)
- Balises SEO par page, données structurées (entreprise, 2 agences, services, FAQ, fil d'Ariane).
- Pré-rendu HTML, `sitemap.xml`, `robots.txt` ouvert aux IA, `llms.txt`.
- `.htaccess` sécurisé, polices locales (RGPD), photos allégées.
- Vrais avis Google (4,6 / 30 avis), bouton « Laisser un avis », affiche QR code.
