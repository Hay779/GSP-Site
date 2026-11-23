# Référencement, sécurité et mise en ligne sur OVH

## 1. Ce qui est en place

### Référencement (SEO)
| Élément | État |
|---|---|
| Titre unique par page (≤ 60 caractères) | ✅ 17 pages indexables |
| Description unique par page (≤ 160 caractères) | ✅ |
| Adresse canonique (`<link rel="canonical">`) | ✅ sur chaque page |
| Partage Facebook / WhatsApp / X (Open Graph, Twitter) | ✅ titre, description, image |
| Un seul titre principal `<h1>` par page, hiérarchie h2/h3 sans saut | ✅ vérifié sur les 20 pages |
| Images avec texte alternatif, liens avec texte | ✅ |
| Pages pré-rendues en HTML (lisibles sans JavaScript) | ✅ `npm run build:prod` |
| `sitemap.xml` (17 adresses) et `robots.txt` | ✅ générés au build |
| Mentions légales et confidentialité en `noindex` | ✅ |
| Page 404 dédiée en `noindex` | ✅ |
| Données structurées (schema.org, JSON-LD) | ✅ voir ci-dessous |

**Données structurées :**
- `Organization` : raison sociale, SIRET, TVA, gérant, fiche Google.
- 2 × `Locksmith` (agences République et Rome) : adresse, téléphone, horaires.
- `WebSite` et `BreadcrumbList` (fil d'Ariane, invisible à l'écran).
- `Service` sur les pages métiers.
- `FAQPage` sur les pages qui contiennent des questions.

### Assistants IA (ChatGPT, Claude, Perplexity, Gemini, Copilot…)
- Les pages sont pré-rendues en HTML. C'est indispensable, car la plupart des robots IA n'exécutent pas le JavaScript.
- `robots.txt` autorise explicitement les robots des assistants : OAI-SearchBot, ChatGPT-User, GPTBot, Claude-SearchBot, ClaudeBot, PerplexityBot, Google-Extended, Applebot, Bingbot, etc.
- `llms.txt` : une fiche en texte simple qui résume l'entreprise pour les IA. Elle contient les agences, les horaires, les téléphones, les services avec leurs liens et la FAQ. Elle est générée automatiquement à partir du contenu du site.
- Les données structurées (entreprise, agences, services, FAQ) donnent aux IA des faits fiables à citer.

### Sécurité (fichier `public/.htaccess`)
- HTTPS obligatoire et adresse unique en `www` (redirections 301).
- En-têtes de sécurité :
  - HSTS ;
  - CSP stricte : seul le site lui-même peut charger du code ;
  - `X-Frame-Options` (pas d'intégration du site dans une autre page) ;
  - `nosniff`, `Referrer-Policy`, `Permissions-Policy` (caméra, micro, position et paiement désactivés).
- Pas de liste des dossiers. Les fichiers sensibles (`.env`, `.map`, `.json`, `.md`…) sont bloqués.
- Dépendances inutiles retirées : `@google/genai`, `express`, `dotenv`, `esbuild`, `autoprefixer`. `npm audit` : 0 vulnérabilité.
- Polices hébergées sur le site, sans appel à Google Fonts. C'est plus rapide et conforme au RGPD : aucune adresse IP de visiteur n'est envoyée à Google.

### Performance
- Photos recompressées : 5,5 Mo → 1,1 Mo.
- Maquettes de travail sorties du site (`docs/maquettes`). Taille du site : 25 Mo → 4,5 Mo.
- Compression gzip et cache navigateur configurés (1 an pour les fichiers versionnés).

## 2. À faire au moment de la mise en ligne

1. **Acheter le nom de domaine chez OVH.**
2. **Mettre l'adresse définitive dans `src/utils/seo.ts`** (`SITE_URL`), aujourd'hui `https://www.serrurerie-republique.fr`. Puis lancer `npm run build:prod`.
3. **Activer le certificat SSL gratuit** (Let's Encrypt) dans l'espace client OVH, *avant* d'envoyer le site. Sans lui, la redirection HTTPS bloque l'accès.
4. **Envoyer le contenu du dossier `dist/`** (avec le fichier caché `.htaccess`) dans le dossier `www/` de l'hébergement, par FTP ou FileZilla.
5. **Hébergeur** : compléter la page Mentions légales :
   - OVH SAS, 2 rue Kellermann, 59100 Roubaix ;
   - téléphone : 1007 ;
   - site : ovhcloud.com.
6. **Google Search Console** : ajouter le domaine, puis envoyer `https://www.<domaine>/sitemap.xml`.
   **Bing Webmaster Tools** : faire la même chose. C'est important, car ChatGPT et Copilot s'appuient sur l'index de Bing.
7. **Fiche Google Business** : mettre l'adresse du site dans le champ « Site web ».
8. **Formulaires** : brancher le service d'envoi, puis ajouter son adresse dans `connect-src` de la CSP (`.htaccess`).
9. **Test final** :
   - securityheaders.com (objectif A) ;
   - PageSpeed Insights ;
   - test des résultats enrichis de Google (rich results test) sur l'accueil et une page métier.

## 3. Commandes

```bash
npm run build:prod   # build + pré-rendu des pages + sitemap + robots
npm run lint         # vérification du code
```
