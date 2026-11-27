import test from 'node:test';
import assert from 'node:assert/strict';
import { computeRelances, intlPhone, smsHref } from './relances';
import { parseRelancesDone, type OfferSignup, type SiteRequest } from './gestion';

const now = new Date('2026-11-27T12:00:00+01:00');

const req = (over: Partial<SiteRequest>): SiteRequest => ({
  reference: 'DV-20261120-1111',
  type: 'devis',
  title: 'Demande de devis',
  receivedAt: '2026-11-20T10:00:00+01:00',
  fields: [
    { label: 'Besoin', value: 'Porte blindée' },
    { label: 'Nom', value: 'Ana Bel' },
    { label: 'Téléphone', value: '06 12 34 56 78' },
  ],
  photos: [],
  status: 'nouvelle',
  note: '',
  updatedAt: '',
  ...over,
});

const signup = (over: Partial<OfferSignup>): OfferSignup => ({
  reference: 'OFF-20261001-2222',
  receivedAt: '2026-10-01T10:00:00+02:00',
  validUntil: '01/03/2027',
  offer: 'bienvenue',
  fields: { Nom: 'Léo D.', Téléphone: '06 00 00 00 01', 'E-mail': 'leo@exemple.fr', Société: '—' },
  usedAt: null,
  note: '',
  ...over,
});

test('requests: new not called back, quote without answer, stalled case', () => {
  const list = computeRelances(
    [
      req({}),
      req({ reference: 'DV-20261126-0001', receivedAt: '2026-11-27T08:00:00+01:00' }), // moins de 24 h
      req({ reference: 'DV-20261101-0002', status: 'devis_envoye', updatedAt: '2026-11-15T10:00:00+01:00' }),
      req({ reference: 'DV-20261101-0003', status: 'devis_envoye', updatedAt: '2026-11-25T10:00:00+01:00' }), // trop récent
      req({ reference: 'SIN-20261101-0004', type: 'sinistre', status: 'en_cours', updatedAt: '2026-11-18T10:00:00+01:00' }),
      req({ reference: 'CT-20261101-0005', type: 'contact', status: 'terminee' }),
    ],
    [],
    {},
    now
  );
  assert.deepEqual(
    list.map((r) => `${r.reason}:${r.reference}`),
    ['rappel:DV-20261120-1111', 'devis:DV-20261101-0002', 'suivi:SIN-20261101-0004', 'avis:CT-20261101-0005']
  );
  assert.match(list[1].why, /12 jours/);
});

test('signups: code expiring soon, code unused after 30 days, used or expired ignored', () => {
  const list = computeRelances(
    [],
    [
      signup({}),
      signup({ reference: 'OFF-20260701-3333', validUntil: '15/12/2026' }),
      signup({ reference: 'OFF-20261120-4444', receivedAt: '2026-11-20T10:00:00+01:00' }),
      signup({ reference: 'OFF-20260601-5555', validUntil: '01/11/2026' }),
      signup({ reference: 'OFF-20260901-6666', usedAt: '2026-11-01T10:00:00+01:00' }),
    ],
    {},
    now
  );
  assert.deepEqual(
    list.map((r) => `${r.reason}:${r.reference}`),
    ['expire:OFF-20260701-3333', 'inutilise:OFF-20261001-2222', 'avis:OFF-20260901-6666']
  );
});

test('a relance done hides the line for 7 days, then it comes back', () => {
  const requests = [req({})];
  assert.equal(computeRelances(requests, [], { 'DV-20261120-1111:rappel': { at: '2026-11-25T10:00:00+01:00', note: '' } }, now).length, 0);
  const back = computeRelances(requests, [], { 'DV-20261120-1111:rappel': { at: '2026-11-18T10:00:00+01:00', note: '' } }, now);
  assert.equal(back.length, 1);
  assert.equal(back[0].lastDone?.at, '2026-11-18T10:00:00+01:00');
});

test('phone formats and server payload', () => {
  assert.equal(intlPhone('06 12 34 56 78'), '+33612345678');
  assert.equal(intlPhone('+33 6 12 34 56 78'), '+33612345678');
  assert.ok(smsHref('06 12 34 56 78', 'Bonjour').startsWith('sms:+33612345678?&body=Bonjour'));
  assert.deepEqual(parseRelancesDone({ relances: { 'A:rappel': { le: 'x', note: 'n' }, bad: 3 } }), { 'A:rappel': { at: 'x', note: 'n' } });
});

test('review request: after a used code or a finished request, once per person, within 60 days', () => {
  const list = computeRelances(
    [
      req({ reference: 'DV-20261101-0007', status: 'terminee', updatedAt: '2026-11-25T10:00:00+01:00' }),
      req({ reference: 'DV-20260801-0008', status: 'terminee', updatedAt: '2026-08-10T10:00:00+02:00', fields: [{ label: 'Nom', value: 'Vieux' }, { label: 'Téléphone', value: '06 99 99 99 99' }] }),
      req({ reference: 'PA-20261101-0009', type: 'partenaire', status: 'terminee', updatedAt: '2026-11-25T10:00:00+01:00' }),
    ],
    [
      // même téléphone que DV-20261101-0007 : un seul avis demandé
      signup({ reference: 'OFF-20261001-1010', usedAt: '2026-11-20T10:00:00+01:00', fields: { Nom: 'Ana Bel', Téléphone: '+33 6 12 34 56 78' } }),
      signup({ reference: 'OFF-20261001-1111', usedAt: '2026-11-27T11:00:00+01:00' }), // utilisé aujourd'hui : trop tôt
    ],
    {},
    now
  );
  assert.deepEqual(list.map((r) => r.key), ['DV-20261101-0007:avis']);
  assert.match(list[0].message, /search\.google\.com\/local\/writereview/);
  // Avis déjà demandé (même ancien) : ne revient jamais, ni pour la même personne via une autre référence.
  const after = computeRelances(
    [req({ reference: 'DV-20261101-0007', status: 'terminee', updatedAt: '2026-11-25T10:00:00+01:00' })],
    [signup({ reference: 'OFF-20261001-1010', usedAt: '2026-11-20T10:00:00+01:00', fields: { Nom: 'Ana Bel', Téléphone: '06 12 34 56 78' } })],
    { 'OFF-20261001-1010:avis': { at: '2026-10-01T10:00:00+02:00', note: '' } },
    now
  );
  assert.equal(after.length, 0);
});
