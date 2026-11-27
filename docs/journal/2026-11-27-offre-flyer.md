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

## À faire
- Partie PHP non testée en local (pas de PHP sur le poste) : faire une vraie inscription test après la mise en ligne.
- Générer le QR code vers https://www.serrurerierepublique.fr/offre pour le flyer.
