import test from 'node:test';
import assert from 'node:assert/strict';
import { QUOTE_DOMAINS } from './quoteForm';
import {
  buildQuoteMessage,
  buildQuoteSummary,
  createInitialDraft,
  firstIncompleteStep,
  NEEDS_BY_DOMAIN,
  QUOTE_STEPS,
  validateQuoteStep,
  withDomain,
  type QuoteWizardDraft,
} from './quoteWizard';

const COMPLETE: QuoteWizardDraft = {
  domain: 'Vitrerie & miroiterie',
  need: 'Bris de glace',
  urgency: 'urgent',
  customerType: 'professionnel',
  location: 'Marseille 13006',
  details: 'Vitrine fissurée suite à un choc.',
  fullName: 'Jean Martin',
  phone: '06 12 34 56 78',
  email: '',
  callbackSlot: 'matin',
  contactPreference: 'boutique',
  consent: true,
};

test('starts empty, or prefilled with a valid domain and location', () => {
  const empty = createInitialDraft();
  assert.equal(empty.domain, null);
  assert.equal(firstIncompleteStep(empty), 'besoin');
  const pre = createInitialDraft({ domain: 'Fermetures', location: ' Aubagne ' });
  assert.equal(pre.domain, 'Fermetures');
  assert.equal(pre.location, 'Aubagne');
  assert.equal(firstIncompleteStep(pre), 'precisions');
});

test('every domain offers specific needs ending with « Autre »', () => {
  for (const domain of QUOTE_DOMAINS) {
    const needs = NEEDS_BY_DOMAIN[domain];
    assert.ok(needs.length >= 2, domain);
    assert.equal(needs[needs.length - 1], 'Autre');
  }
});

test('validates each step', () => {
  assert.ok(validateQuoteStep('precisions', { ...COMPLETE, need: null }).need);
  assert.ok(validateQuoteStep('precisions', { ...COMPLETE, need: 'Porte de garage' }).need, 'need must match domain');
  assert.ok(validateQuoteStep('lieu', { ...COMPLETE, details: 'court' }).details);
  assert.ok(validateQuoteStep('coordonnees', { ...COMPLETE, phone: '123' }).phone);
  assert.ok(validateQuoteStep('coordonnees', { ...COMPLETE, consent: false }).consent);
  assert.ok(validateQuoteStep('coordonnees', { ...COMPLETE, email: 'pas-un-mail' }).email);
  for (const step of QUOTE_STEPS) {
    assert.deepEqual(validateQuoteStep(step.id, COMPLETE), {}, step.id);
  }
  assert.equal(firstIncompleteStep(COMPLETE), 'recap');
});

test('changing domain drops a need that no longer applies', () => {
  assert.equal(withDomain(COMPLETE, 'Fermetures').need, null);
  assert.equal(withDomain({ ...COMPLETE, need: 'Autre' }, 'Fermetures').need, 'Autre');
});

test('builds a readable summary and message', () => {
  const summary = buildQuoteSummary(COMPLETE);
  assert.equal(summary[0].value, 'Vitrerie & miroiterie — Bris de glace');
  assert.ok(summary.some((row) => row.label === 'E-mail' && row.value === 'Non renseigné'));
  const message = buildQuoteMessage(COMPLETE, 'SR-20261122-1234');
  assert.ok(message.startsWith('Demande de devis SR-20261122-1234'));
  assert.ok(message.includes('Téléphone : 06 12 34 56 78'));
});
