import test from 'node:test';
import assert from 'node:assert/strict';
import { BLACK_FRIDAY_2026, isPromotionActive, promotionCountdown } from './promotions';

const at = (iso: string) => new Date(iso);

test('Black Friday is shown from 24/11 00:00 to 30/11 23:59 (Paris time)', () => {
  assert.equal(isPromotionActive(BLACK_FRIDAY_2026, at('2026-11-23T23:59:00+01:00')), false);
  assert.equal(isPromotionActive(BLACK_FRIDAY_2026, at('2026-11-24T00:00:00+01:00')), true);
  assert.equal(isPromotionActive(BLACK_FRIDAY_2026, at('2026-11-30T23:59:59+01:00')), true);
  assert.equal(isPromotionActive(BLACK_FRIDAY_2026, at('2026-12-01T00:00:00+01:00')), false);
  assert.equal(isPromotionActive(BLACK_FRIDAY_2026, at('2027-11-25T12:00:00+01:00')), false);
});

test('countdown counts days, hours and minutes left, never below zero', () => {
  assert.deepEqual(promotionCountdown(BLACK_FRIDAY_2026, at('2026-11-24T09:28:00+01:00')), {
    days: 6,
    hours: 14,
    minutes: 32,
  });
  assert.deepEqual(promotionCountdown(BLACK_FRIDAY_2026, at('2026-11-30T23:59:30+01:00')), {
    days: 0,
    hours: 0,
    minutes: 0,
  });
  assert.deepEqual(promotionCountdown(BLACK_FRIDAY_2026, at('2026-12-02T10:00:00+01:00')), {
    days: 0,
    hours: 0,
    minutes: 0,
  });
});

test('three offers, with the legal conditions', () => {
  assert.equal(BLACK_FRIDAY_2026.offers.length, 3);
  const text = BLACK_FRIDAY_2026.conditions.join(' ');
  assert.match(text, /non cumulables/);
  assert.match(text, /30 jours précédents/);
  // Tout se passe à République : aucune mention de l'agence Rome.
  assert.doesNotMatch(JSON.stringify(BLACK_FRIDAY_2026), /Rome/);
});
