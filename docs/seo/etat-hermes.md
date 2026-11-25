# État Hermes — Serrurerie de la République

Date : 25 novembre 2026 (Europe/Paris). Référence : branche `main` au commit `a90b845`, après `git pull`. Lecture intégrale de `docs/JOURNAL.md` et de `docs/FEUILLE-DE-ROUTE.md`.

## Réponses d'après le journal

Les adresses e-mail exactes ne sont pas recopiées dans ce bilan public. Les références ci-dessous indiquent où retrouver les valeurs consignées dans le journal.

1. **Site en ligne** — `https://www.serrurerierepublique.fr`, depuis le **23 novembre 2026**, sur OVH Perso (`docs/JOURNAL.md`, ligne 33). L'accueil et la page des agences ont répondu HTTP 200 lors de la vérification.
2. **Formulaires** — Les quatre formulaires (devis, contact, partenaire et photos après sinistre) enregistrent chaque demande sur OVH dans `~/demandes/AAAA-MM/<référence>/`, hors du site. La demande est ensuite envoyée à la boîte de contact OVH MX Plan (Roundcube), avec redirection vers Hotmail et copie conservée sur OVH. Gmail ne reçoit pas ces demandes (`docs/JOURNAL.md`, lignes 7 à 10 et 34 à 35).
3. **Compte Google** — Search Console, Analytics 4 et la fiche Google utilisent le même compte Gmail professionnel, identifié dans `docs/JOURNAL.md`, lignes 47, 52 et 74.
4. **Redirections** — `contact@` redirige vers la boîte Hotmail, avec copie sur OVH. `postmaster@` redirige vers deux boîtes Gmail : la destination historique et le compte professionnel qui gère les outils Google, ajouté le 25 novembre 2026. Les adresses exactes figurent dans `docs/JOURNAL.md`, lignes 8 et 12.
5. **Vitesse** — Dernier PageSpeed mobile consigné : **83/100**, le **25 novembre 2026** (LCP : **4,5 s**). Pas de nouvelle mesure dans ce bilan. Le WebP, le préchargement de la photo d'accueil et la suppression des animations d'entrée sur le haut de page pré-rendu sont en place. React reconstruit encore ce HTML : la photo attend environ 1 s de plus, le temps de charger le JavaScript. À tester : réutiliser le HTML avec `hydrateRoot` (premier rendu client identique au pré-rendu) ou découper le JavaScript par page (`React.lazy`), puis remesurer. La feuille de route note aussi les dimensions `width`/`height` à renseigner sur les images restantes. Objectifs : score mobile ≥ 90 et LCP sous 2,5 s (`docs/JOURNAL.md`, lignes 19 à 24 et 46 ; feuille de route, section D).
6. **OVH : ne jamais supprimer `www/signature/` lors d'un déploiement** — Le dossier héberge le logo et le bandeau vers lesquels pointent les signatures Gmail, Outlook et Roundcube. Le supprimer casserait leurs images (`docs/JOURNAL.md`, lignes 14 à 15).
7. **Mission prioritaire** — Corriger partout les anciennes informations, notamment le lien Wix et les horaires. Remplacer Wix sur la fiche Google, inventorier les fiches des deux boutiques dans `docs/seo/annuaires.md`, corriger les données incohérentes et consigner les actions réservées au client (`docs/JOURNAL.md`, lignes 61 à 74).

## Mission annuaires

**Référentiel public** : Serrurerie de la République — 48 rue de la République, 13002 Marseille — 04 91 90 51 65 — `https://www.serrurerierepublique.fr` — du lundi au samedi de 9h à 19h, fermé le dimanche. Deuxième boutique : 124 rue de Rome, 13006 Marseille, mêmes téléphone et horaires, page `https://www.serrurerierepublique.fr/agences-contact`. Ne pas afficher d'adresse e-mail, ni annoncer de note ou de nombre d'avis sans source vérifiée.

**Déjà fait** : la fiche Google République a été auditée le 23 novembre ; l'ancien Wix y était signalé. Search Console et Bing Webmaster Tools sont configurés et le sitemap a été envoyé le 25 novembre. Bing Webmaster Tools n'est pas Bing Places. Aucun inventaire `docs/seo/annuaires.md` n'était présent après le pull. Pour une correction d'annuaire déjà publiée : **pas dans le journal**. Aucune fiche externe n'a été modifiée pour ce bilan.

**Premier repérage public (non exhaustif)** :

| Fiche | Constat | Accès / suite |
| --- | --- | --- |
| [Marseille Centre — République](https://marseillecentre.fr/boutiques/serrurerie-de-la-republique/) | Ancien site, anciens horaires, mauvais code postal (13001) et adresse e-mail affichée. Téléphone conforme. | Accès non confirmé. Demander à l'éditeur la mise à jour et le retrait de l'e-mail. |
| [PagesJaunes — République](https://www.pagesjaunes.fr/pros/65378857) | Fiche au 13002 : le titre affiche « Galstyan Grigor », la dénomination recherchée figure dans les informations juridiques. Horaires non renseignés sur la fiche consultée. | Revendication non confirmée. Vérifier la fiche dans Solocal Manager avant toute création ou correction. |
| [TopMarseille — République](https://topmarseille.com/b/bricard-vachette-serrurerie-de-la-republique/) | Adresse et téléphone conformes ; nom affiché différent du référentiel. | Revendication proposée sur la fiche ; titulaire non confirmé. Demander une correction du nom. |
| [Artisans Réunis — Rome](https://artisansreunis.fr/artisan/serrurerie-extra-serrurier-marseille-marseille-zp8gvc) | Adresse conforme, téléphone différent. La plateforme indique que la fiche n'est pas revendiquée. | Vérifier l'enseigne affichée en boutique avant de demander un changement de nom ; corriger téléphone, site et horaires selon le référentiel. |
| [Acceslibre — Rome](https://acceslibre.beta.gouv.fr/app/13-marseille/a/cordonnerie-serrurerie/erp/serrurerie-extra-2/) | Adresse conforme ; établissement affiché sous « Serrurerie Extra ». | Accès non confirmé. Vérifier l'enseigne en boutique avant de modifier le nom. |

Hors annuaires, [l'ancien site Wix](https://serrurerierepubliq.wixsite.com/website) est toujours accessible. [Le site Serrurerie Extra](https://serrurerieextra.com/) publie un autre numéro pour Rome. Demander au client qui gère ces deux sites avant de proposer une redirection ou une mise à jour.

**Reste à faire** : compléter l'inventaire pour les deux boutiques, en priorité Google, PagesJaunes, Apple Plans, Bing Places, Waze et Mappy ; puis Facebook, Instagram, Yelp, Hoodspot, 118712, 118000, Cylex, Kompass, Societe.com, Pappers, les annuaires d'artisans et la Chambre de métiers. Pour chaque fiche : URL, écarts, propriétaire ou revendication, action et état (« à corriger », « corrigé », « à créer »). Distinguer les fiches commerciales des registres légaux : vérifier l'entité avant de demander une correction. Corriger la fiche Google avant l'éventuel import dans Bing Places. Relire chaque fiche publique après publication avant de la marquer « corrigé ».

### À faire par le client

- **Google** : se connecter au compte propriétaire, ou donner un accès de gestion, pour remplacer Wix sur la fiche République et contrôler le nom, la catégorie principale « Serrurier » et les horaires. Pour Rome, confirmer l'enseigne visible en boutique puis rechercher la fiche existante avant d'en créer une.
- **PagesJaunes** : ouvrir [Solocal Manager](https://www.pagesjaunes.fr/landingpage/aide-media/), retrouver l'établissement et confirmer si le client en a la gestion. Sinon, demander le rattachement de la fiche ou passer par le [signalement PagesJaunes](https://assistance.pagesjaunes.fr/hc/fr/articles/6118109519516-Il-manque-une-info-un-professionnel-il-y-a-un-bug-Dites-le).
- **Bing Places, Apple Plans et autres fiches revendiquées** : si une connexion propriétaire ou une autorisation d'import est nécessaire, le client se connecte ou donne un accès de gestion lorsque la plateforme le permet.
- **SMS ou courrier** : aucun code en attente n'est confirmé. Si une plateforme propose une validation par SMS, appel ou courrier, le client reçoit et saisit lui-même le code dans l'interface officielle, sans le transmettre. [Google indique que les méthodes varient par fiche](https://support.google.com/business/answer/7107242?hl=fr) : ne pas présumer qu'un SMS ou un courrier sera proposé.
