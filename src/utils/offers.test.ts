import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_OFFER,
  offerPath,
  offerStatus,
  parseOffer,
  reductionLabel,
  serializeOffer,
  slugFromSearch,
  slugify,
  validateOffer,
} from './offers';

test('reduction labels', () => {
  assert.equal(reductionLabel(DEFAULT_OFFER), '-5 %');
  assert.equal(reductionLabel({ reductionType: 'euros', reductionValue: 50 }), '-50 €');
});

test('addresses: welcome offer keeps /offre (flyer QR code)', () => {
  assert.equal(offerPath('bienvenue'), '/offre');
  assert.equal(offerPath('syndics-printemps'), '/offre?o=syndics-printemps');
  assert.equal(slugFromSearch('?o=syndics-printemps'), 'syndics-printemps');
  assert.equal(slugFromSearch('?o=../../x'), 'bienvenue');
  assert.equal(slugFromSearch(''), 'bienvenue');
});

test('slugify', () => {
  assert.equal(slugify('Syndics : Printemps 2027 !'), 'syndics-printemps-2027');
  assert.equal(slugify('Été — Agences'), 'ete-agences');
});

test('status by dates and pause', () => {
  const today = new Date(2026, 10, 27);
  assert.equal(offerStatus(DEFAULT_OFFER, today), 'active');
  assert.equal(offerStatus({ ...DEFAULT_OFFER, active: false }, today), 'pause');
  assert.equal(offerStatus({ ...DEFAULT_OFFER, start: '2027-03-01' }, today), 'programmee');
  assert.equal(offerStatus({ ...DEFAULT_OFFER, end: '2026-11-26' }, today), 'terminee');
  assert.equal(offerStatus({ ...DEFAULT_OFFER, end: '2026-11-27' }, today), 'active');
});

test('validation', () => {
  assert.deepEqual(validateOffer(DEFAULT_OFFER), {});
  const e = validateOffer({ ...DEFAULT_OFFER, slug: 'bienvenue', reductionValue: 95, months: 0, conditions: [] }, ['bienvenue'], true);
  assert.ok(e.slug && e.reductionValue && e.months && e.conditions);
  assert.ok(validateOffer({ ...DEFAULT_OFFER, start: '2027-05-01', end: '2027-04-01' }).end);
});

test('server round trip', () => {
  assert.deepEqual(parseOffer(serializeOffer(DEFAULT_OFFER)), DEFAULT_OFFER);
  assert.equal(parseOffer({ nope: 1 }), null);
});
