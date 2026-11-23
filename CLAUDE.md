# Serrurerie de la République — site vitrine (Marseille)

## À lire en premier
- `docs/FEUILLE-DE-ROUTE.md` : **liste des améliorations restantes** (référencement IA, Google, contenu, technique, mise en ligne, formulaires). Cocher au fur et à mesure.
- `docs/SEO-SECURITE-MISE-EN-LIGNE.md` : ce qui est en place côté SEO et sécurité, et la check-list de mise en ligne OVH.
- `docs/seo/` : recherches écrites par **Hermes** (mots-clés, concurrents, annuaires, avis). À lire avant de créer ou modifier une page.
- `docs/JOURNAL.md` : ce que Claude Code a fait, séance par séance.

## Travail avec Hermes
Hermes (agent sur le serveur) fait la recherche, le SEO, les annuaires et le suivi Google ; Claude Code fait le développement du site.
- **Avant de travailler** : `git pull` sur `main`, puis lire `docs/seo/` et la fin de `docs/JOURNAL.md`.
- **Après une séance** : ajouter une entrée datée en haut de `docs/JOURNAL.md` (ce qui a été fait, pages créées ou modifiées, ce qui reste, questions pour Hermes).
- **Ne jamais modifier `docs/seo/`** : c'est le dossier de Hermes. Pour lui demander quelque chose, l'écrire dans le journal sous « Questions pour Hermes ».
- Hermes publie directement sur `main`, mais uniquement dans `docs/seo/` (aucun effet sur le site).

## Contexte
- Client francophone. Toujours répondre en français, simplement.
- Hébergement final : **OVH** (Apache, `public/.htaccess`). Le nom de domaine sera acheté chez OVH ; adresse provisoire dans `src/utils/seo.ts` (`SITE_URL`).
- Google AI Studio importe la branche `main`. Le travail se fait sur une branche, puis demande de fusion vers `main` quand le client dit « mets à jour main ».
- Formulaires : **ne rien brancher avant la mise en ligne sur OVH**. Destination : l'adresse e-mail de l'entreprise, qui ne doit jamais être affichée sur le site.
- Avis clients : uniquement les vrais avis Google (`src/data/reviewsContent.ts`), jamais d'avis négatifs affichés, et **jamais de note ou de nombre d'avis inventés**.

## Pile technique
- React 19, Vite 8, Tailwind v4 (`@theme` dans `src/index.css`), motion, lucide-react, TypeScript.
- Routeur maison `src/utils/router.ts` (mode history en production, hash pour les aperçus).
- SEO : `src/utils/seo.ts` (balises par page et JSON-LD), `scripts/prerender.ts` (HTML pré-rendu, sitemap, robots), `scripts/llms.ts` (`llms.txt`).
- Polices auto-hébergées (`@fontsource-variable`), sans Google Fonts.

## Commandes
```bash
npm run lint                     # vérification TypeScript
npx tsx --test src/**/*.test.ts  # tests
npm run build:prod               # build + pré-rendu + sitemap + robots + llms.txt (dossier dist/ à envoyer sur OVH)
```

## Style
- Palette :
  - anthracite `#1C1F21` ;
  - ivoire `#F7F5F0` ;
  - laiton `#B79A62` ;
  - laiton foncé `#7D612D` ;
  - rouge SOS `#C0392B`.
- Polices : Plus Jakarta Sans (titres), DM Sans (texte).
- Boutons en pilule `h-11 rounded-full px-5 text-[15px]`.
- Sections claires entre le haut de page et le pied de page. Vague dorée sous les hauts de page.
