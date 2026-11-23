import { test } from 'node:test';
import assert from 'node:assert/strict';
import { indexableRoutes, pathForRoute, seoForRoute } from './seo';

test('chaque page indexable a un titre et une description uniques, aux bonnes longueurs', () => {
  const titles = new Set<string>();
  const descriptions = new Set<string>();
  for (const route of indexableRoutes()) {
    const seo = seoForRoute(route);
    assert.ok(seo.title.length <= 60, `titre trop long (${seo.title.length}) : ${seo.title}`);
    assert.ok(seo.description.length >= 50 && seo.description.length <= 160, `description ${seo.path} : ${seo.description.length}`);
    assert.ok(!titles.has(seo.title), `titre en double : ${seo.title}`);
    assert.ok(!descriptions.has(seo.description), `description en double : ${seo.path}`);
    titles.add(seo.title);
    descriptions.add(seo.description);
    assert.equal(seo.path, pathForRoute(route));
  }
});

test('la page 404 et les pages légales ne sont pas indexées', () => {
  assert.equal(seoForRoute({ kind: 'notFound' }).noindex, true);
  assert.equal(seoForRoute({ kind: 'page', id: 'mentions-legales' }).noindex, true);
  assert.equal(seoForRoute({ kind: 'home' }).noindex, false);
});

test('l’accueil déclare les deux agences et la FAQ en données structurées', () => {
  const types = seoForRoute({ kind: 'home' }).jsonLd.map((item) => item['@type']);
  assert.equal(types.filter((t) => t === 'Locksmith').length, 2);
  assert.ok(types.includes('FAQPage'));
});
