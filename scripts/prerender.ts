/**
 * Pré-rendu après `vite build` : enregistre le HTML complet de chaque page
 * (dist/<adresse>/index.html) pour que Google et les réseaux sociaux lisent
 * le contenu sans exécuter le JavaScript. Génère aussi 404.html, sitemap.xml
 * robots.txt et llms.txt (présentation pour les assistants IA).
 *
 * Utilisation : npm run build:prod   (voir package.json)
 */
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { SITE_URL, indexableRoutes, pathForRoute, seoForRoute } from '../src/utils/seo';
import { buildLlmsTxt } from './llms';

const require = createRequire(import.meta.url);
// Playwright (navigateur sans écran) : installé sur la machine de build.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { chromium } = require('playwright') as { chromium: any };

const DIST = resolve(import.meta.dirname, '..', 'dist');
const PORT = 4321;

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.woff2': 'font/woff2',
};

// Copie intacte de l'index généré par Vite (sert de base à toutes les pages).
const shell = readFileSync(join(DIST, 'index.html'), 'utf8');

const server = createServer((req, res) => {
  const url = decodeURIComponent((req.url ?? '/').split('?')[0]);
  const file = join(DIST, url);
  if (url !== '/' && existsSync(file) && statSync(file).isFile()) {
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
    res.end(readFileSync(file));
    return;
  }
  res.writeHead(200, { 'content-type': TYPES['.html'] });
  res.end(shell);
});

function outFile(path: string): string {
  if (path === '/') return join(DIST, 'index.html');
  if (path === '/404') return join(DIST, '404.html');
  // « /vitrerie-miroiterie » → dist/vitrerie-miroiterie.html (servi sans « .html » par .htaccess).
  return join(DIST, `${path.slice(1)}.html`);
}

async function main() {
  await new Promise<void>((ok) => server.listen(PORT, ok));
  const browser = await chromium.launch();
  // Animations désactivées : le contenu est figé dans son état visible.
  const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('pageerror', (e: Error) => errors.push(e.message));

  const routes = [...indexableRoutes(), { kind: 'notFound' } as const];
  for (const route of routes) {
    const path = pathForRoute(route);
    await page.goto(`http://localhost:${PORT}${path === '/404' ? '/page-introuvable-404' : path}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
    // Accueil : la photo du haut de page (élément LCP) est demandée dès la lecture du <head>.
    if (path === '/') {
      await page.evaluate(() => {
        const first = document.querySelector<HTMLImageElement>('img.hero-slide[fetchpriority="high"]');
        if (!first) return;
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = first.getAttribute('src') ?? '';
        link.setAttribute('fetchpriority', 'high');
        document.head.prepend(link);
      });
    }
    const html = await page.evaluate(() => '<!doctype html>\n' + document.documentElement.outerHTML);
    writeFileSync(outFile(path), html);
    console.log(`✓ ${path}`);
  }

  // Sitemap : pages indexables uniquement.
  const today = new Date().toISOString().slice(0, 10);
  const urls = indexableRoutes()
    .filter((r) => !seoForRoute(r).noindex)
    .map((r) => {
      const p = pathForRoute(r);
      const priority = p === '/' ? '1.0' : r.kind === 'domain' ? '0.9' : '0.7';
      return `  <url><loc>${SITE_URL}${p}</loc><lastmod>${today}</lastmod><priority>${priority}</priority></url>`;
    });
  writeFileSync(
    join(DIST, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
  );
  // Robots : moteurs de recherche ET assistants IA explicitement autorisés.
  const aiBots = [
    'Googlebot', 'Bingbot', 'Applebot', 'DuckDuckBot',
    'OAI-SearchBot', 'ChatGPT-User', 'GPTBot',
    'Claude-SearchBot', 'Claude-User', 'ClaudeBot',
    'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended',
    'MistralAI-User', 'Amazonbot', 'meta-externalagent',
  ];
  const robots = [
    ...aiBots.map((bot) => `User-agent: ${bot}\nAllow: /\nDisallow: /404.html\n`),
    'User-agent: *\nAllow: /\nDisallow: /404.html\n',
    `Sitemap: ${SITE_URL}/sitemap.xml\n`,
  ].join('\n');
  writeFileSync(join(DIST, 'robots.txt'), robots);
  writeFileSync(join(DIST, 'llms.txt'), buildLlmsTxt());
  console.log(`✓ sitemap.xml (${urls.length} adresses), robots.txt et llms.txt`);

  await browser.close();
  server.close();
  if (errors.length > 0) {
    console.error('Erreurs JavaScript pendant le pré-rendu :\n' + errors.join('\n'));
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
