import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DOMAIN_SLUGS,
  hrefForDomain,
  hrefForHome,
  hrefForHomeSection,
  hrefForPage,
  PAGE_SLUGS,
  parseLocation,
  routesEqual,
} from './router';

test('parses domain pages from the path in history mode', () => {
  assert.deepEqual(parseLocation('/vitrerie-miroiterie', '', 'history'), {
    kind: 'domain',
    id: 'vitrerie',
  });
  assert.deepEqual(parseLocation('/menuiserie/', '', 'history'), { kind: 'domain', id: 'menuiserie' });
  assert.deepEqual(parseLocation('/', '#05_Nos_Domaines', 'history'), { kind: 'home' });
  assert.deepEqual(parseLocation('/inconnue', '', 'history'), { kind: 'notFound' });
  assert.deepEqual(parseLocation('/', '', 'history'), { kind: 'home' });
  // En mode « hash », une ancre inconnue reste sur l'accueil (sections de la page).
  assert.deepEqual(parseLocation('/', '#inconnue', 'hash'), { kind: 'home' });
  assert.deepEqual(parseLocation('/', '#404', 'hash'), { kind: 'notFound' });
});

test('parses domain pages from the hash in hash mode and keeps section anchors on home', () => {
  assert.deepEqual(parseLocation('/x', '#fermetures', 'hash'), { kind: 'domain', id: 'fermetures' });
  assert.deepEqual(parseLocation('/x', '#10_Nos_Agences', 'hash'), { kind: 'home' });
  assert.deepEqual(parseLocation('/x', '', 'hash'), { kind: 'home' });
});

test('builds links in both modes', () => {
  assert.equal(hrefForDomain('serrurerie', 'history'), '/serrurerie-portes-blindees');
  assert.equal(hrefForDomain('serrurerie', 'hash'), '#serrurerie-portes-blindees');
  assert.equal(hrefForHome('history'), '/');
  assert.equal(hrefForHome('hash'), '#');
});

test('section links go back to the home page when needed', () => {
  const domain = { kind: 'domain', id: 'vitrerie' } as const;
  assert.equal(hrefForHomeSection('FAQ', { kind: 'home' }, 'history'), '#FAQ');
  assert.equal(hrefForHomeSection('FAQ', domain, 'history'), '/#FAQ');
  assert.equal(hrefForHomeSection('FAQ', domain, 'hash'), '#FAQ');
});

test('parses and links thematic pages', () => {
  assert.deepEqual(parseLocation('/cles-badges', '', 'history'), { kind: 'page', id: 'cles-badges' });
  assert.deepEqual(parseLocation('/x', '#apres-sinistre', 'hash'), { kind: 'page', id: 'apres-sinistre' });
  assert.equal(hrefForPage('agences-contact', 'history'), '/agences-contact');
  assert.equal(hrefForPage('agences-contact', 'hash'), '#agences-contact');
  assert.ok(!routesEqual({ kind: 'page', id: 'cles-badges' }, { kind: 'page', id: 'apres-sinistre' }));
});

test('slugs are unique, URL-safe and never collide with section ids', () => {
  const slugs = [...Object.values(DOMAIN_SLUGS), ...Object.values(PAGE_SLUGS)];
  assert.equal(new Set(slugs).size, slugs.length);
  for (const slug of slugs) {
    assert.match(slug, /^[a-z0-9-]+$/);
  }
});

test('compares routes', () => {
  assert.ok(routesEqual({ kind: 'home' }, { kind: 'home' }));
  assert.ok(routesEqual({ kind: 'domain', id: 'menuiserie' }, { kind: 'domain', id: 'menuiserie' }));
  assert.ok(!routesEqual({ kind: 'domain', id: 'menuiserie' }, { kind: 'home' }));
});
