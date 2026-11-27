import test from 'node:test';
import assert from 'node:assert/strict';
import { buildToday, greeting, localDay } from './today';
import type { DayStats, OfferSignup, SiteRequest } from './gestion';
import type { Relance } from './relances';

const now = new Date('2026-11-28T09:00:00+01:00');

const req = (reference: string, receivedAt: string, status: SiteRequest['status'] = 'nouvelle'): SiteRequest => ({
  reference,
  type: 'devis',
  title: 'Demande de devis',
  receivedAt,
  fields: [],
  photos: [],
  status,
  note: '',
  updatedAt: '',
});

const sig = (reference: string, receivedAt: string, usedAt: string | null = null): OfferSignup => ({
  reference,
  receivedAt,
  validUntil: '01/05/2027',
  offer: 'bienvenue',
  fields: {},
  usedAt,
  note: '',
});

const day = (d: string, entries: number): DayStats => ({ day: d, views: entries, entries, pages: {}, sources: {}, offers: {}, campaigns: {}, offerDirect: {}, mobile: 0, desktop: 0 });

test('today summary: new requests, weeks, codes used, visits', () => {
  const t = buildToday(
    [
      req('DV-20261120-0001', '2026-11-20T10:00:00+01:00'),
      req('DV-20261127-0002', '2026-11-27T18:00:00+01:00'),
      req('DV-20261126-0003', '2026-11-26T10:00:00+01:00', 'terminee'),
      req('DV-20261117-0004', '2026-11-17T10:00:00+01:00', 'en_cours'),
    ],
    [
      sig('OFF-20261127-0001', '2026-11-27T10:00:00+01:00'),
      sig('OFF-20261118-0002', '2026-11-18T10:00:00+01:00', '2026-11-25T10:00:00+01:00'),
      sig('OFF-20260901-0003', '2026-09-01T10:00:00+02:00', '2026-09-20T10:00:00+02:00'),
    ],
    [{ reason: 'rappel' } as Relance, { reason: 'avis' } as Relance, { reason: 'avis' } as Relance],
    [day('2026-11-27', 14), day('2026-11-28', 3)],
    now
  );
  assert.deepEqual(t.newRequests.map((r) => r.reference), ['DV-20261127-0002', 'DV-20261120-0001']);
  assert.equal(t.relances.length, 1);
  assert.equal(t.reviewRequests, 2);
  assert.deepEqual([t.requestsWeek, t.requestsPrevWeek], [2, 2]);
  assert.deepEqual([t.signupsWeek, t.signupsPrevWeek], [1, 1]);
  assert.equal(t.codesUsed30, 1);
  // Hier : 14 ; avant-hier : avant le début du compteur → pas de chiffre.
  assert.deepEqual([t.visitsYesterday, t.visitsDayBefore], [14, null]);
  assert.equal(buildToday([], [], [], null, now).visitsYesterday, null);
});

test('greeting and local day', () => {
  assert.equal(greeting(new Date(2026, 10, 28, 8)), 'Bonjour');
  assert.equal(greeting(new Date(2026, 10, 28, 15)), 'Bon après-midi');
  assert.equal(greeting(new Date(2026, 10, 28, 20)), 'Bonsoir');
  assert.equal(localDay(new Date(2026, 0, 5)), '2026-01-05');
});
