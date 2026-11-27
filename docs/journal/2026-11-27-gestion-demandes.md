# 27/11/2026 — Espace /gestion : rubrique « Demandes »

Branche : `claude/gestion-demandes`. Demande du client : « on continue » (rubrique conseillée : Demandes).

## Fait
- Nouvelle rubrique **Demandes** (première rubrique, ouverte à la connexion) : toutes les demandes des formulaires du site (devis, contact, partenaire, photos après sinistre), lues dans `~/demandes/` ; les inscriptions aux offres restent dans « Inscrits ».
- Compteurs (nouvelles à rappeler, en cours / devis envoyé, reçues ce mois-ci, total), pastille rouge du nombre de nouvelles dans la barre, recherche (nom, téléphone, référence, quartier, note), filtres par type et par suivi (« À traiter » par défaut), export Excel.
- Fiche détaillée (panneau à droite) : boutons Appeler / Répondre par e-mail, suivi (Nouvelle, En cours, Devis envoyé, Terminée, Sans suite), note interne, photos (agrandissables), tout le formulaire.
- Serveur `public/api/gestion.php` : actions `demandes`, `suivi` (écrit `~/gestion/demandes-suivi.json`), `photo` (photo servie seulement si connecté, nom et référence contrôlés). Rien n'est écrit dans `~/demandes/`.
- Fichiers : `src/components/gestion/RequestsPanel.tsx`, `src/utils/gestion.ts` (+ `gestionRequests.test.ts`).

## À faire
- Après mise en ligne : vérifier avec une vraie demande (devis ou photos après sinistre) que la liste, les photos et le suivi fonctionnent.
