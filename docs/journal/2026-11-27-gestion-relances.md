# 27/11/2026 — Espace /gestion : rubrique « Relances »

Branche : `claude/gestion-relances`.

## Fait
- Rubrique **Relances** : les clients à recontacter, calculés à partir des demandes (et de leur suivi) et des inscriptions aux offres (`src/utils/relances.ts`, + tests) :
  - nouvelles demandes pas rappelées après 24 h ;
  - devis envoyés sans réponse depuis 7 jours ;
  - dossiers « En cours » sans mise à jour depuis 5 jours ;
  - codes de réduction qui expirent dans les 30 jours sans avoir servi ;
  - inscrits depuis plus de 30 jours qui n'ont pas utilisé leur code.
- Pour chaque ligne : Appeler, SMS, WhatsApp, e-mail (message déjà rédigé selon la situation), bouton « Relancé » qui cache la ligne 7 jours (elle revient si rien n'a changé). Pastille orange du nombre de relances dans la barre.
- Serveur `public/api/gestion.php` : actions `relances` et `relance` (`~/gestion/relances.json`).
- Fichiers : `src/components/gestion/RelancesPanel.tsx`, `src/utils/gestion.ts`.

## Question de sécurité du client (27/11)
- « Des hackers ou des clients peuvent-ils accéder à /gestion ? » : la page de connexion est visible par tous, les données non (mot de passe vérifié par le serveur, empreinte PBKDF2, 5 essais / 15 min, cookie signé, origine contrôlée, noindex).
- **À faire plus tard (décision client)** : protection en plus, code à 6 chiffres par e-mail sur un nouvel appareil (recommandé) et/ou adresse secrète à la place de /gestion.
