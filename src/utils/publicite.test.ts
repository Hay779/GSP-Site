import test from 'node:test';
import assert from 'node:assert/strict';
import { campaignResult, campaignUrl, parseCampaign, serializeCampaign, validateCampaign, type Campaign } from './campaigns';
import { googleAd, LIMITS, socialAds } from './adCopy';
import { buildVisualSvg, wrapText } from './adVisual';
import { DEFAULT_OFFER } from './offers';
import type { DayStats, OfferSignup } from './gestion';

const flyer: Campaign = { id: 'flyer-6e', name: 'Flyers 6e', channel: 'flyer', offer: 'bienvenue', start: '2026-11-01', end: '2026-11-30', budget: 200, notes: '', archived: false };

const day = (d: string, c: number, o: number): DayStats => ({ day: d, views: 0, entries: c, pages: {}, sources: {}, offers: { bienvenue: o }, campaigns: { 'flyer-6e': c }, mobile: 0, desktop: 0 });

test('campaign link keeps the offer address', () => {
  assert.equal(campaignUrl(flyer), 'https://www.serrurerierepublique.fr/offre?c=flyer-6e');
  assert.equal(campaignUrl({ id: 'x-1', offer: 'syndics' }), 'https://www.serrurerierepublique.fr/offre?o=syndics&c=x-1');
  assert.equal(campaignUrl({ id: 'gads', offer: '' }), 'https://www.serrurerierepublique.fr/?c=gads');
});

test('campaign results: visits in period, signups, clients and costs', () => {
  const stats = [day('2026-10-31', 9, 9), day('2026-11-05', 30, 40), day('2026-11-06', 10, 10)];
  const signups = [
    { offer: 'bienvenue', receivedAt: '2026-11-05T10:00:00+01:00', usedAt: '2026-11-20T10:00:00+01:00' },
    { offer: 'bienvenue', receivedAt: '2026-11-06T10:00:00+01:00', usedAt: null },
    { offer: 'bienvenue', receivedAt: '2026-10-20T10:00:00+02:00', usedAt: null },
    { offer: 'autre', receivedAt: '2026-11-06T10:00:00+01:00', usedAt: null },
  ] as OfferSignup[];
  const r = campaignResult(flyer, stats, signups);
  assert.deepEqual(r, { visits: 40, offerViews: 50, signups: 2, clients: 1, costPerVisit: 5, costPerSignup: 100, costPerClient: 200 });
  assert.equal(campaignResult({ ...flyer, budget: 0 }, stats, signups).costPerClient, null);
});

test('campaign validation and server format', () => {
  assert.deepEqual(validateCampaign(flyer, [], true), {});
  const e = validateCampaign({ ...flyer, id: 'A B', name: '', budget: -1, end: '2026-10-01' }, [], true);
  assert.ok(e.id && e.name && e.budget && e.end);
  assert.ok(validateCampaign(flyer, ['flyer-6e'], true).id);
  assert.deepEqual(parseCampaign(serializeCampaign(flyer)), flyer);
});

test('ad copy respects Google and Meta limits', () => {
  for (const audience of ['tous', 'syndics', 'particuliers', 'pros'] as const) {
    const g = googleAd(DEFAULT_OFFER, audience);
    assert.ok(g.headlines.length >= 5 && g.headlines.every((h) => h.length <= LIMITS.googleHeadline), audience);
    assert.ok(g.descriptions.length >= 3 && g.descriptions.every((d) => d.length <= LIMITS.googleDescription), audience);
    const brand = googleAd(null, audience);
    assert.ok(brand.headlines.every((h) => !h.includes('%')));
    for (const s of [...socialAds(DEFAULT_OFFER, audience, 'https://x'), ...socialAds(null, audience, 'https://x')]) {
      assert.ok(s.headline.length <= LIMITS.socialHeadline && s.description.length <= LIMITS.socialDescription);
    }
  }
});

test('visual: wrapping and SVG output', () => {
  assert.deepEqual(wrapText('Offre syndics : -10 % ce printemps', 15, 3), ['Offre syndics :', '-10 % ce', 'printemps']);
  assert.equal(wrapText('un deux trois quatre cinq six', 5, 2).length, 2);
  const svg = buildVisualSvg({ format: 'story', theme: 'mer', badge: '-5%', title: 'A <b>', subtitle: 'B', cta: 'Je m’inscris', footer: '04 91 90 51 65' });
  assert.ok(svg.startsWith('<svg') && svg.includes('height="1920"') && svg.includes('A &lt;b&gt;'));
});
