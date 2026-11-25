# Black Friday 2026 — cahier des charges (validé par le client, à coder)

Maquettes de référence : `docs/maquettes/black-friday/` (0 = parcours complet).

## Offres et dates
- **Dates** : du **24 au 30 novembre 2026** inclus. Tout s'affiche automatiquement pendant cette période et **disparaît tout seul** après (dates dans un fichier de config, ex. `src/data/promotions.ts`).
- **Offre 1** : **-20 % sur les portes blindées** (fourniture et pose d'un bloc-porte blindé).
- **Offre 2** : **-20 % sur les tampons personnalisés, dès le 2e tampon**.
- **Offre 3** : **double de clé offert**. Modalité exacte à confirmer avec le client (ex. « le 3e offert pour 2 achetés »).
- **Conditions à afficher** : offres non cumulables entre elles ni avec d'autres remises. Réductions calculées sur les prix habituels pratiqués dans les 30 jours précédents (obligation légale).
- **À confirmer avant mise en ligne** :
  - la pose est-elle comprise pour les portes blindées ?
  - les modèles sont-ils certifiés A2P ? Sinon, retirer la mention ;
  - les tampons se commandent-ils seulement en boutique ? Quel délai ?
  - y a-t-il une photo des tampons ?

## Style
Noir profond `#0B0C0D`, doré (dégradé `#E5C57B` → `#B79A62`), texte ivoire `#F3F0E7`, point rouge `#C0392B`. Polices du site. Haut de gamme, pas de rouge et jaune criard.

## Mobile (priorité) — parcours validé
1. **Arrivée sur l'accueil (version « A »)** :
   - **bandeau doré défilant** sous l'en-tête : pastille noire « BLACK FRIDAY » puis « -20 % PORTES BLINDÉES ✦ -20 % TAMPONS DÈS LE 2E ✦ DOUBLE DE CLÉ OFFERT ✦ JUSQU'AU 30/11 », en boucle et lentement ;
   - **macaron rond** noir bordé d'or, posé sur la photo du haut de page, en haut à droite, penché d'environ -10° : « BLACK FRIDAY -20 % jusqu'au 30/11 » ;
   - **bouton doré** « Voir les offres Black Friday › », avec le point rouge, au-dessus du titre « Votre serrurier à Marseille ». Le titre reste visible.
2. **En descendant** : le bandeau se cache avec l'en-tête. Un **rond « BLACK FRIDAY -20 % »** (76 px) apparaît en bas à gauche, au-dessus de la barre Devis · SOS · Contact, sans chevaucher le bouton SOS. Il a une petite croix qui masque tout le Black Friday pour le reste de la visite (sessionStorage).
3. **Toucher le rond, le macaron ou le bandeau** : un **tiroir** monte du bas de l'écran. Il contient :
   - « JUSQU'AU 30 NOVEMBRE », BLACK FRIDAY ;
   - les 3 offres en cartes (pastille dorée -20 %) ;
   - l'encadré « Montrez cet écran en boutique — 48 rue de la République, Marseille 2e » ;
   - les boutons Demander un devis / Appeler ;
   - le lien « Voir le détail des offres › » ;
   - les conditions en petit.

   On le ferme avec la croix, en le glissant vers le bas ou avec Échap.
4. **Page `/promotions`** (le bouton de l'étape 1 et le lien du tiroir y mènent) :
   - bandeau doré ;
   - haut de page noir « BLACK FRIDAY » avec dates, compte à rebours jours/heures/minutes et vague dorée ;
   - les 3 offres en grandes cartes (photo, ce qui est compris, bouton) ;
   - « Comment en profiter » en 3 étapes (boutique, téléphone, devis) ;
   - conditions ;
   - FAQ courte ;
   - carte de l'agence République.

## Règles
- **Uniquement sur la page d'accueil** (bandeau, macaron, rond, tiroir) et sur `/promotions`. Rien ne s'ouvre tout seul.
- Le rond est caché quand le menu SOS est ouvert. Pas d'animation si l'utilisateur a demandé à réduire les animations.
- Aucune mention de l'agence Rome dans les offres : tout se passe à République.
- **SEO** : `/promotions` est ajoutée au sitemap et indexée pendant la promo. Hors promo, la page affiche « Pas d'offre en ce moment » et passe en `noindex`. Ajouter ses balises dans `src/utils/seo.ts` et `PAGE_SLUGS`.

## Ensuite
1. Coder la version mobile, puis la vérifier en captures (aperçu hash).
2. Faire la version PC dans le même esprit : bandeau doré, macaron sur la photo, rond en bas à gauche, panneau des offres.
3. Validation du client, puis « mets à jour main », puis envoi sur OVH (`npm run build:prod`, dossier `dist/`).
