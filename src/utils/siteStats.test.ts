import test from 'node:test';
import assert from 'node:assert/strict';
import { classifySource } from './siteStats';
import { buildReport, change, pageLabel } from './siteStatsReport';
import { parseDayStats, type DayStats, type OfferSignup, type SiteRequest } from './gestion';

const own = 'www.serrurerierepublique.fr';

test('visit source classification', () => {
  assert.equal(classifySource('https://www.google.fr/', '/', '', own), 'google');
  assert.equal(classifySource('https://www.bing.com/search?q=x', '/', '', own), 'bing');
  assert.equal(classifySource('https://www.pagesjaunes.fr/pros/123', '/', '', own), 'annuaire');
  assert.equal(classifySource('https://m.facebook.com/', '/', '', own), 'reseau_social');
  assert.equal(classifySource('', '/offre', '?o=bienvenue', own), 'qr');
  assert.equal(classifySource('', '/', '', own), 'direct');
  assert.equal(classifySource('', '/', '?utm_source=flyer', own), 'qr');
  assert.equal(classifySource('https://exemple.org/', '/', '', own), 'autre_site');
});

const day = (d: string, entries: number, extra: Partial<DayStats> = {}): DayStats => ({
  day: d,
  views: entries * 2,
  entries,
  pages: { '/': entries },
  sources: { google: entries },
  offers: {},
  mobile: entries,
  desktop: 0,
  ...extra,
});

test('report: current vs previous period, requests and signups by day', () => {
  const stats = [day('2026-11-24', 5), day('2026-11-25', 5), day('2026-11-26', 10, { offers: { bienvenue: 4 }, pages: { '/offre': 4, '/': 6 } }), day('2026-11-27', 20)];
  const requests = [{ receivedAt: '2026-11-26T10:00:00+01:00' }, { receivedAt: '2026-11-24T10:00:00+01:00' }] as SiteRequest[];
  const signups = [{ receivedAt: '2026-11-26T11:00:00+01:00', offer: 'bienvenue' }] as OfferSignup[];
  const r = buildReport(stats, 2, requests, signups);
  assert.deepEqual(r.current, { visits: 30, views: 60, requests: 1, signups: 1 });
  assert.deepEqual(r.previous, { visits: 10, views: 20, requests: 1, signups: 0 });
  assert.deepEqual(r.daily.map((d) => `${d.day}:${d.visits}:${d.requests}`), ['2026-11-26:10:1', '2026-11-27:20:0']);
  assert.deepEqual(r.offers, [{ slug: 'bienvenue', views: 4, signups: 1 }]);
  assert.equal(r.pages[0].path, '/');
  assert.equal(r.mobileShare, 1);
  assert.equal(r.sources[0].label, 'Google');
});

test('helpers', () => {
  assert.equal(change(30, 10), 200);
  assert.equal(change(5, 0), null);
  assert.equal(pageLabel('/vitrerie-miroiterie'), 'Vitrerie miroiterie');
  assert.equal(pageLabel('/'), 'Accueil');
  assert.equal(parseDayStats({ jours: [{ jour: '2026-11-27', vues: 3, entrees: 2, pages: { '/': 3, x: 'a' } }, { jour: 'bad' }] }).length, 1);
});
