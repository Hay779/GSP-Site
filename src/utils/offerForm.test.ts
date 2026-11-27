import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildOfferSummary,
  formatFrenchDate,
  INITIAL_OFFER_DRAFT,
  offerValidUntil,
  validateOfferDraft,
  type OfferDraft,
} from './offerForm';

const filled: OfferDraft = {
  customerType: 'Syndic / copropriété',
  company: 'Syndic du Port',
  role: '',
  fullName: 'Ana Bel',
  phone: '06 12 34 56 78',
  email: 'ana@syndic.fr',
  city: 'Marseille 2e',
  acceptConditions: true,
  consent: true,
  answers: {},
};

test('empty form: every required field is reported', () => {
  const errors = validateOfferDraft(INITIAL_OFFER_DRAFT);
  for (const key of ['customerType', 'fullName', 'phone', 'email', 'acceptConditions', 'consent']) {
    assert.ok(errors[key as keyof OfferDraft], key);
  }
});

test('company is required for a professional, not for a private person', () => {
  assert.ok(validateOfferDraft({ ...filled, company: '' }).company);
  assert.equal(validateOfferDraft({ ...filled, customerType: 'Particulier', company: '' }).company, undefined);
  assert.deepEqual(validateOfferDraft(filled), {});
});

test('validity: 5 months later, clamped to the end of the month', () => {
  assert.equal(formatFrenchDate(offerValidUntil(new Date(2026, 10, 27))), '27/04/2027');
  assert.equal(formatFrenchDate(offerValidUntil(new Date(2026, 8, 30))), '28/02/2027');
});

test('summary carries the labels the server needs', () => {
  const labels = buildOfferSummary(filled).map((r) => r.label);
  for (const l of ['Nom', 'Téléphone', 'E-mail']) assert.ok(labels.includes(l), l);
});
