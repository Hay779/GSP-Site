# 27/11/2026 — Page d'inscription à l'offre -5 % du flyer

Branche : `claude/offre-flyer` (pas encore en ligne).

## Contexte
Flyer recto verso pour syndics, agences, assurances et professionnels (`docs/Flyer recto verso d’un serrurier marseillais.png`) : « -5 % sur votre premier achat ou votre première intervention, offre valable 5 mois après inscription, scannez et inscrivez-vous ».

## Fait
- Nouvelle page **`/offre`**, page seule sans menu ni pied de page du site (demande du client : « une page qui ne parle que de l’offre ») (adresse du QR code : https://www.serrurerierepublique.fr/offre). Non proposée à Google (`noindex`, absente du sitemap) : réservée aux personnes qui ont le flyer.
- Formulaire : vous êtes (syndic, agence/bailleur, assureur/expert, commerce/entreprise, particulier), nom, société (obligatoire pour un pro), téléphone, e-mail (obligatoire, pour recevoir le code), ville, acceptation des conditions et des données.
- Conditions (décision client) : sur devis signé, valable 5 mois, une inscription par société ou par personne, hors dépannage d'urgence, non cumulable.
- Après l'envoi : le code (ex. `OFF-20261127-1234`) et sa date de fin s'affichent ; un e-mail de confirmation part au client ; l'entreprise reçoit l'inscription par e-mail comme les autres formulaires.
- Serveur (`public/api/demande.php`) : nouveau type `inscription` ; anti-doublon par téléphone, e-mail ou société (`~/demandes/_inscriptions.json`) : une 2e inscription renvoie le code existant.
- Fichiers : `src/components/OfferPage.tsx`, `src/utils/offerForm.ts` (+ tests), `formDelivery.ts`, `router.ts`, `seo.ts`, `pages.ts`, `App.tsx`.

## Design final de /offre (validé par le client)
- Inscription directe en haut de page (plus de grand titre), vrai logo en version fond clair (`src/assets/images/logo_republique_light.png`, copie dans `docs/images-site/8-logos-icones/`).
- Couleurs propres à la campagne : bleu mer / turquoise / vert d'eau (pas de rose).
- Boutons « Vous êtes » en cartes ; bloc « Votre société » pour les pros : nom complet obligatoire (libellé adapté au type), fonction et ville facultatives.
- Sous le formulaire : « Comment ça marche » (3 étapes), 3 vrais avis Google (aucun avis sur l'offre n'existe encore : ne pas en inventer), infos boutique.

## Espace gestion `/gestion` (privé, mot de passe)
- Première rubrique : **Offre -5 %** : liste des inscrits, recherche (code, nom, société, téléphone), filtres (valides, expirent bientôt, utilisés, périmés), bouton « Marquer utilisé » / « Annuler », export Excel (CSV). Rubriques prévues ensuite (affichées « Bientôt ») : Demandes, Relances, Publicité, Suivi du site.
- Les inscriptions continuent d'arriver aussi par e-mail.
- Serveur : `public/api/gestion.php` (lit `~/demandes/`, écrit seulement dans `~/gestion/`), cookie signé 30 jours, 5 essais de mot de passe par 15 min.
- Mot de passe : le client le choisit lui-même avec `npm run gestion:mot-de-passe` (dans son propre terminal) → `server/prive/config-gestion.php` (jamais dans Git), à envoyer sur OVH en `~/config-gestion.php`. Seule une empreinte est stockée.
- Page `noindex`, absente du sitemap. Fichiers : `src/components/GestionPage.tsx`, `src/utils/gestion.ts` (+ tests).

## À faire
- Le client crée son mot de passe (`npm run gestion:mot-de-passe`), puis envoi de `~/config-gestion.php` sur OVH avec la mise en ligne.
- Tester en vrai après mise en ligne : connexion /gestion, mauvais mot de passe, « Marquer utilisé ».
- Partie PHP non testée en local (pas de PHP sur le poste) : faire une vraie inscription test après la mise en ligne.
- Générer le QR code vers https://www.serrurerierepublique.fr/offre pour le flyer.
