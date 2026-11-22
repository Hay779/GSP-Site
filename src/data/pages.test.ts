import test from 'node:test';
import assert from 'node:assert/strict';
import { blockTone, DOMAIN_FAQS, resolvePageDefinition, type PageDefinition } from './pages';
import { DOMAINS_CONFIG } from './sectionsContent';
import { PAGE_SLUGS, type PageId, type Route } from '../utils/router';

const ALL_ROUTES: readonly Route[] = [
  ...DOMAINS_CONFIG.items.map((item) => ({ kind: 'domain', id: item.id }) as const),
  ...(Object.keys(PAGE_SLUGS) as PageId[])
    .filter((id) => id !== 'devis' && id !== 'devenir-partenaire') // pages à part (formulaires)
    .map((id) => ({ kind: 'page', id }) as const),
];

function label(route: Route): string {
  return route.kind === 'home' ? 'home' : `${route.kind}:${route.id}`;
}

function definitionFor(route: Route): PageDefinition {
  const def = resolvePageDefinition(route);
  assert.ok(def, `no definition for ${label(route)}`);
  return def;
}

test('every page of the router has a definition with SEO texts', () => {
  for (const route of ALL_ROUTES) {
    const def = definitionFor(route);
    assert.ok(def.seoTitle.trim().length > 10, `seoTitle of ${label(route)}`);
    assert.ok(def.seoDescription.trim().length > 30, `seoDescription of ${label(route)}`);
    assert.ok(def.blocks.length > 0, `blocks of ${label(route)}`);
  }
  assert.equal(resolvePageDefinition({ kind: 'home' }), null);
});

test('backgrounds alternate light / dark on every page (hero is dark)', () => {
  for (const route of ALL_ROUTES) {
    const def = definitionFor(route);
    let previous: string = 'dark'; // en-tête de page sombre
    for (const block of def.blocks) {
      const tone = blockTone(block);
      if (tone === 'band') {
        previous = 'band';
        continue;
      }
      assert.notEqual(tone, previous, `${label(route)}: two ${tone} blocks in a row (${block.type})`);
      previous = tone;
    }
  }
});

test('section ids are unique within a page', () => {
  for (const route of ALL_ROUTES) {
    const ids = definitionFor(route)
      .blocks.map((block) => ('id' in block ? block.id : block.type));
    assert.equal(new Set(ids).size, ids.length, `duplicate block id on ${label(route)}`);
  }
});

test('each trade page has its own FAQ with unique question ids', () => {
  const seen = new Set<string>();
  for (const domain of DOMAINS_CONFIG.items) {
    const faq = DOMAIN_FAQS[domain.id];
    assert.ok(faq.length >= 4, `${domain.id} should have at least 4 questions`);
    for (const item of faq) {
      assert.ok(!seen.has(item.id), `duplicate FAQ id ${item.id}`);
      seen.add(item.id);
    }
    const blocks = definitionFor({ kind: 'domain', id: domain.id }).blocks;
    assert.ok(blocks.some((b) => b.type === 'faq'), `${domain.id} page shows its FAQ`);
  }
});
