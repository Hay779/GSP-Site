import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_QUOTE_DRAFT,
  createQuoteReference,
  isValidFrenchPhone,
  isValidOptionalEmail,
  validateQuoteForm,
} from './quoteForm';

test('validates French landline, mobile, and international +33 numbers', () => {
  assert.equal(isValidFrenchPhone('04 91 90 51 65'), true);
  assert.equal(isValidFrenchPhone('06.12.34.56.78'), true);
  assert.equal(isValidFrenchPhone('+33 4 91 90 51 65'), true);
  assert.equal(isValidFrenchPhone('00 12 34 56 78'), false);
  assert.equal(isValidFrenchPhone('049190'), false);
  assert.equal(isValidFrenchPhone(''), false);
});

test('allows blank optional email and validates non-empty emails', () => {
  assert.equal(isValidOptionalEmail(''), true);
  assert.equal(isValidOptionalEmail('   '), true);
  assert.equal(isValidOptionalEmail('client@marseille.fr'), true);
  assert.equal(isValidOptionalEmail('client@invalide'), false);
});

test('returns targeted errors for empty initial draft', () => {
  const errors = validateQuoteForm(INITIAL_QUOTE_DRAFT);
  assert.ok(errors.fullName);
  assert.ok(errors.phone);
  assert.ok(errors.details);
  assert.equal(errors.domain, undefined);
  assert.equal(errors.email, undefined);
});

test('accepts a complete valid quote request with zero errors', () => {
  const errors = validateQuoteForm({
    domain: 'Serrurerie & portes blindées',
    fullName: 'Claire Moreau',
    phone: '06 42 18 90 12',
    email: 'claire.moreau@example.fr',
    district: 'Marseille 13002 — République',
    details: 'Remplacement de cylindre haute sécurité sur porte d’entrée.',
  });
  assert.deepEqual(errors, {});
});

test('formats deterministic quote reference string', () => {
  const ref = createQuoteReference(new Date(2026, 10, 21), 248);
  assert.equal(ref, 'SR-20261121-1248');
});
