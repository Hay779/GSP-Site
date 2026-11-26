# Passation — annuaires et présence en ligne (état au 26/11/2026)

> À lire **en premier** par Hermes et par toute nouvelle conversation Claude Code qui reprend les annuaires.
> Ensuite, lire `docs/INFOS-OFFICIELLES.md` (seule source de vérité), `docs/SYNCHRO-ANNUAIRES.md` (procédure) et `docs/seo/annuaires.md` (inventaire de Hermes).

## 1. Décisions du client (à respecter partout)

- **Une seule boutique** sur les annuaires : République, **48 rue de la République, 13002 Marseille**. On ne parle **pas** de l'agence Rome ni de Serrurerie Extra (autre société, traitée plus tard).
- **Google n'est pas modifié par nous** : c'est la source. Le client y publie lui-même (posts, photos). Son nom long « Bricard Vachette Serrurerie de la République… », sa catégorie « Reproduction de clés » et sa description sont gardés volontairement.
- Téléphones : **04 91 90 51 65** (boutique) et **06 50 70 44 52** (mobile, WhatsApp, urgences). Le 07 82 82 82 08 n'est plus utilisé.
- **Pas d'e-mail public** sur les annuaires (spam). **Pour toutes les inscriptions et validations d'annuaires : `annuaires@serrurerierepublique.fr`** (boîte OVH créée le 26/11, réservée aux annuaires, mot de passe dans le Gestionnaire de mots de passe Google du client). `gspserrurerie13@gmail.com` reste le compte des connexions « avec Google » faites par Claude Code dans Chrome avec le client ; **ne jamais le donner à Hermes** (compte maître : fiche Google, Search Console, réinitialisations).
- **Agréé assurances** (confirmé). Urgences aussi le soir et le dimanche.
- Tout l'ancien site Wix : on ne s'en occupe pas, mais tout lien vers lui trouvé sur une fiche est remplacé par https://www.serrurerierepublique.fr.
- **Aucun prix affiché** pour l'instant (décision du 26/11). Facebook et Instagram : à créer plus tard.
- Photos : **vraies photos seulement** dans les galeries (`docs/photos-reelles/`). Les visuels promotionnels par marque (`docs/photos-reelles/posts-marques/`) ne vont que dans les publications. Logo pour les annuaires : `docs/logo-google/logo-carre-serre-1080.png`.
- Rien de payant. Aucun mot de passe ni code SMS saisi par un agent.

## 2. Où on en est

| Annuaire | État | Compte | Détail |
|---|---|---|---|
| Google | source | gspserrurerie13 | géré par le client |
| **PagesJaunes / Solocal** (+ 118 712, Mappy) | ✅ revendiquée et complétée | Solocal Manager via Google (gspserrurerie13) | nom, adresse 48, horaires, 2 téléphones, paiements, description, site, activités, 9 prestations, 15 marques, logo, 7 photos, **10 actualités**. Nom, téléphones et activités en vérification chez Solocal (48 h) |
| **Bing Places** | ✅ importée de Google | via Google (gspserrurerie13) | **synchro automatique hebdomadaire avec Google** ; 8 photos et logo ajoutés ; publication sous 7 à 12 jours |
| **Apple Plans** | ⏳ en attente de validation Apple | compte Apple géré contact@serrurerierepublique.fr (mot de passe chez le client) | ancienne fiche « Galstyan Grigor, 61 » revendiquée et corrigée au 48 ; description, site, logo, couverture, 7 photos. Après validation : ajouter les « Éléments en vedette » |
| Waze | rien à faire | — | se nourrit de Google |
| **Petits annuaires** | ⏳ **prochaine étape** | — | voir section 4 |

## 3. Le site (pour info)

- En ligne sur OVH : https://www.serrurerierepublique.fr. Procédure d'envoi : `CLAUDE.md` et `docs/JOURNAL.md`.
- **Black Friday** en ligne jusqu'au 30/11 : jusqu'à -25 % sur les projets (hors dépannage), -20 % porte blindée (remplacement ou création), 3e double de clé à -50 %, -20 % tampons. Demande avant le 30/11, devis signé avant le 31/12/2026.
- **01/12 à 8h** : rappel Hermes sur Telegram pour reconstruire et renvoyer le site (retirer `/promotions`).
- Nouvelle icône du site (bouclier doré avec trou de serrure) depuis le 26/11.
- Surveillance Hermes chaque lundi à 9h (« Veille synchro annuaires »), qui écrit `docs/seo/synchro-a-faire.md`.

## 4. Mission « petits annuaires » — qui fait quoi

**Hermes** (navigateur, recherche web, et **lecture de la boîte annuaires@** depuis le 26/11) :
- Lire la boîte : `~/bin/annuaires-mail list` (derniers e-mails), `~/bin/annuaires-mail read UID`, `~/bin/annuaires-mail links UID` (liens de confirmation). Lecture seule. Ouvrir un lien de confirmation **seulement** s'il vient d'un annuaire où Hermes vient de s'inscrire.
1. Pour chaque annuaire de la liste ci-dessous, vérifier si une fiche existe déjà (nom, adresse, téléphone).
2. **Si la fiche existe** : noter les écarts avec `INFOS-OFFICIELLES.md`. Si l'annuaire permet de **suggérer une correction sans compte** (formulaire public), l'envoyer avec les infos officielles et le noter.
3. **Si la fiche n'existe pas et que l'ajout se fait par un simple formulaire public, sans compte ni mot de passe** : remplir et envoyer le formulaire avec les infos officielles (nom « Serrurerie de la République », 48 rue de la République 13002 Marseille, 04 91 90 51 65, site, horaires, catégorie Serrurier, description courte d'`INFOS-OFFICIELLES.md`), **sans e-mail public**. Si un e-mail est obligatoire : **`annuaires@serrurerierepublique.fr`**, puis lire la boîte et ouvrir le lien de confirmation. Ne pas cocher les e-mails publicitaires.
4. **Si l'annuaire exige un compte, un mot de passe, un code SMS, un paiement ou une pièce d'identité** : **ne rien créer**. Préparer la fiche prête à copier, et la mettre dans « À faire avec Claude Code + client ».
5. Tout noter dans `docs/seo/annuaires.md` (une ligne par annuaire : URL, état « existait / créé / corrigé / à faire avec le client », date, ce qui a été envoyé) et publier sur `main` (uniquement `docs/seo/`).
6. Envoyer un résumé sur Telegram.

**Liste à traiter, dans l'ordre** : Cylex, Hoodspot, Yelp (notre propre fiche ; signaler celle d'un autre qui affiche notre numéro), Kompass, Cybo, NosAvis, Yably, Marseille Centre (corriger : horaires, 13001 → 13002, retirer l'e-mail), Serrurier24 (retirer l'e-mail), Trustup, 118000, Annuaire-Professionnel, Guide Jalis (numéro faux à corriger), Chambre de métiers PACA (annuaire des artisans), Obat (gratuit uniquement).
**À ne pas faire** : Starofservice, Habitatpresto, Travaux.com et tout ce qui est payant ; Facebook et Instagram (plus tard).

**Claude Code (nouvelle conversation) + client** : reprend la section « À faire avec Claude Code + client » de `docs/seo/annuaires.md`, crée les comptes dans Chrome (connexion Google gspserrurerie13 quand c'est possible), le client saisit les mots de passe et les codes, puis Claude met à jour le journal.
