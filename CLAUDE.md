# Serrurerie de la République — site vitrine (Marseille)

## À lire en premier
- `docs/FEUILLE-DE-ROUTE.md` : **liste des améliorations restantes** (référencement IA, Google, contenu, technique, mise en ligne, formulaires). Cocher au fur et à mesure.
- `docs/BLACK-FRIDAY.md` : **chantier en cours** — promo Black Friday 24-30/11/2026 validée en maquettes (`docs/maquettes/black-friday/`), à coder (mobile d'abord).
- `docs/SEO-SECURITE-MISE-EN-LIGNE.md` : ce qui est en place côté SEO et sécurité, et la check-list de mise en ligne OVH.

## Contexte
- Client francophone. Toujours répondre en français, simplement.
- Hébergement final : **OVH** (Apache, `public/.htaccess`). Domaine : **www.serrurerierepublique.fr** (sans trait d'union), défini dans `src/utils/seo.ts` (`SITE_URL`). V1 en ligne depuis le 24/11/2026.
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
