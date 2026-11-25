# État Hermes — Serrurerie de la République

Date : 25 novembre 2026 (Europe/Paris). Référence : branche `main` après `git pull`. Lecture de `docs/JOURNAL.md` et de `docs/INFOS-OFFICIELLES.md` (seule source de vérité).

## Réponses d'après le journal

Les adresses e-mail exactes ne sont pas recopiées dans ce bilan public. Les références ci-dessous indiquent où retrouver les valeurs consignées dans le journal.

1. **Site en ligne** — `https://www.serrurerierepublique.fr`, depuis le **23 novembre 2026**, sur OVH Perso (`docs/JOURNAL.md`, ligne 33). L'accueil a répondu HTTP 200 lors de la vérification.
2. **Formulaires** — Les quatre formulaires (devis, contact, partenaire et photos après sinistre) enregistrent chaque demande sur OVH dans `~/demandes/AAAA-MM/<référence>/`, hors du site. La demande est ensuite envoyée à la boîte de contact OVH MX Plan (Roundcube), avec redirection vers Hotmail et copie conservée sur OVH. Gmail ne reçoit pas ces demandes (`docs/JOURNAL.md`, lignes 7 à 10 et 34 à 35).
3. **Compte Google** — Search Console, Analytics 4 et la fiche Google utilisent le même compte Gmail professionnel, identifié dans `docs/JOURNAL.md`, lignes 47, 52 et 74.
4. **Redirections** — `contact@` redirige vers la boîte Hotmail, avec copie sur OVH. `postmaster@` redirige vers deux boîtes Gmail : la destination historique et le compte professionnel qui gère les outils Google, ajouté le 25 novembre 2026. Les adresses exactes figurent dans `docs/JOURNAL.md`, lignes 8 et 12.
5. **Vitesse** — Dernier PageSpeed mobile consigné : **83/100**, le **25 novembre 2026** (LCP : **4,5 s**). Pas de nouvelle mesure dans ce bilan. Pistes : `hydrateRoot` ou découpage du JavaScript par page (`React.lazy`), puis remesurer. Objectifs : score mobile ≥ 90 et LCP sous 2,5 s (`docs/JOURNAL.md`, lignes 19 à 24 et 46 ; feuille de route, section D).
6. **OVH : ne jamais supprimer `www/signature/` lors d'un déploiement** — Le dossier héberge le logo et le bandeau vers lesquels pointent les signatures Gmail, Outlook et Roundcube (`docs/JOURNAL.md`, lignes 14 à 15).

## Mission annuaires — bilan du 25 novembre 2026

Règles appliquées (`docs/INFOS-OFFICIELLES.md`) : une seule boutique (48 rue de la République) ; aucune autre société ni autre boutique ; tout lien vers l'ancien Wix est à remplacer par `https://www.serrurerierepublique.fr`. Détail dans `docs/seo/annuaires.md`.

**Fait** : inventaire par recherche web (25 lignes : annuaires, sites qui copient Google, registres). **Aucune fiche créée ni modifiée.**

**Principaux écarts constatés**
- Fiche Google : site = ancien Wix ; nom trop long (mots-clés ajoutés) ; catégorie principale « Reproduction de clés » au lieu de « Serrurier » ; ancienne description avec de mauvais horaires. Horaires affichés corrects (lundi au samedi 9h–19h).
- PagesJaunes : titre au nom du gérant, adresse sans numéro, aucun horaire ni site.
- Horaires faux sur Marseille Centre (13001 au lieu de 13002), Cylex, Yably, Serrurier24, RevierEuro. Ancien Wix ou ancien site Solocal comme site web sur la plupart.
- Adresse e-mail de l'entreprise visible sur Marseille Centre, Cylex et Serrurier24 : à faire retirer.
- Un numéro faux sur Guide Jalis ; notre numéro apparaît sur la fiche Yelp d'un autre établissement.
- TopMarseille (repéré lors du premier passage) : nom affiché différent du référentiel ; revendication proposée sur la fiche, titulaire non confirmé.
- **Deux sociétés au même nom et à la même adresse dans les registres** : l'ancienne (SIREN 539 656 173) apparaît encore active sur Societe.com, Pappers, etc., et plusieurs annuaires affichent son SIRET. Question pour le client.

**Absents (à vérifier)** : Bing Places, Apple Plans, Mappy, Yelp, Hoodspot, Kompass, Chambre de métiers (classés par importance dans `annuaires.md`, partie 3).

**Non vérifiable sans connexion** : Apple Plans, Bing Places, Waze, et qui gère chaque fiche.

### À faire par le client

Voir « Actions client » dans `docs/seo/annuaires.md` : accord général, Google (site, nom, catégorie, description), revendication PagesJaunes (code SMS ou courrier saisi par le client), Bing Places puis Apple Plans, régularisation de l'ancienne société avec son gérant, comptes gratuits pour les petits annuaires.
