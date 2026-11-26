# Feuille de route — améliorations à apporter

Mise à jour : 26/11/2026. Liste de référence des chantiers restants. On coche au fur et à mesure.

## ⏭️ Prochaines étapes (état au 26/11/2026)

### Obligations légales
- [ ] **Médiateur de la consommation** : le client adhère à un médiateur (CM2C proposé). Ensuite Claude Code l'ajoute aux mentions légales et à l'article 20 des CGV. Obligatoire pour les clients particuliers (amende DGCCRF sinon).
- [ ] **Relecture des CGV** par le comptable ou un avocat (articles 5, 6, 12, 13, 15 à 18).
- [ ] **Case « J'ai lu les CGV »** sous le formulaire de devis.
- [ ] **Page Tarifs** avec le barème des prestations principales (obligation du dépannage à domicile, voir l'étude Tryba). Après le Black Friday. Décision du client à reprendre : il ne voulait pas afficher de prix (26/11).

### Dates
- [ ] **01/12/2026** (rappel Hermes à 8h) : la promo Black Friday disparaît toute seule le 01/12 à 0h ; reconstruire et renvoyer le site pour retirer la page `/promotions`. Le client a dit « on garde » le 26/11 : lui redemander s'il veut prolonger (nouvelle date, nouveau nom) avant de retirer.
- [ ] **Vers le 06/12/2026** : la clé fal.ai donnée le 26/11 expire ; le client la supprime sur fal.ai. Pour de nouvelles images, lui en redemander une (ne jamais l'écrire dans un fichier).

### Site
- [ ] Blocs urgence des services (vitrerie, menuiserie, fermetures, clés) : ils affichent encore « Intervention rapide ». Laissé tel quel à la demande du client (26/11), à reprendre s'il le souhaite.
- [ ] Vitesse mobile : passer à `hydrateRoot` ou découper le code par page (section D).
- [ ] Pages locales (8 à 12 quartiers ou communes, contenu unique) : attendre l'avis de Hermes sur l'étude Tryba.
- [ ] Campagne d'avis Google (QR code en boutique, SMS après intervention) : voir l'étude Tryba.
- Images : la procédure est dans `docs/images-site/LISEZMOI.md`. Les serruriers IA A et D ne servent que dans la partie Professionnels (le client a refusé de les mettre ailleurs).

### Annuaires (autre conversation, voir `docs/PASSATION-ANNUAIRES.md`)
- [ ] Trustup (horaires faux, correction payante) et doublon Serrurier24 : le client a répondu « oui pour les deux » (écrire aux deux).
- [ ] Suivi des fiches en attente (Cylex, Yelp, Kompass, NosAvis, Marseille Centre, Serrurier24, Jalis) : veille Hermes du lundi 9h.


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
- [x] Photos en WebP (25/11/2026). [ ] `width`/`height` sur les images restantes.
- [ ] Test PageSpeed Insights (objectif ≥ 90 sur mobile) : 78 le 23/11 → 83 le 25/11/2026 (LCP 4,5 s). Reste : reprendre le HTML pré-rendu sans le reconstruire (`hydrateRoot`) ou découper le code.

## E. Mise en ligne (OVH)
**V1 en ligne le 24/11/2026 sur https://www.serrurerierepublique.fr.** Vérifié : HTTPS, www, en-têtes de sécurité, gzip, cache, pages pré-rendues, sitemap, robots, llms.txt, page 404.
- [ ] Renvoyer le `.htaccess` corrigé : redirections sans « :443 ».
- [ ] Fiche Google : mettre le site en **https**://www.serrurerierepublique.fr (aujourd'hui en http).
- [ ] Mentions légales : ajouter l'hébergeur OVH.
- [ ] Search Console et Bing Webmaster Tools, avec envoi du sitemap.

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
