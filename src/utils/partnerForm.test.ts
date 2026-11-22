import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPartnerMessage,
  createPartnerReference,
  INITIAL_PARTNER_DRAFT,
  toggleNeed,
  validatePartnerDraft,
  type PartnerDraft,
} from './partnerForm';

const VALID: PartnerDraft = {
  organizationType: 'Syndic / gestionnaire de copropriété',
  company: 'Cabinet Exemple',
  fullName: 'Marie Durand',
  role: 'Gestionnaire',
  phone: '04 91 00 00 00',
  email: 'contact@exemple.fr',
  volume: '40 immeubles',
  needs: ['Dépannages ponctuels', 'Clés & badges'],
  message: '',
  consent: true,
};

test('an empty form reports every required field', () => {
  const errors = validatePartnerDraft(INITIAL_PARTNER_DRAFT);
  for (const key of ['organizationType', 'company', 'fullName', 'phone', 'email', 'needs', 'consent']) {
    assert.ok(errors[key as keyof PartnerDraft], key);
  }
  assert.equal(errors.role, undefined);
  assert.equal(errors.volume, undefined);
});

test('a complete form is valid; e-mail is required for professionals', () => {
  assert.deepEqual(validatePartnerDraft(VALID), {});
  assert.ok(validatePartnerDraft({ ...VALID, email: '' }).email);
  assert.ok(validatePartnerDraft({ ...VALID, email: 'pas-un-mail' }).email);
});

test('toggles needs on and off', () => {
  const once = toggleNeed([], 'Vitrerie');
  assert.deepEqual(once, ['Vitrerie']);
  assert.deepEqual(toggleNeed(once, 'Vitrerie'), []);
});

test('builds a reference and a readable message', () => {
  assert.match(createPartnerReference(new Date(2026, 10, 22), 5), /^PRO-20261122-\d{4}$/);
  const message = buildPartnerMessage(VALID, 'PRO-20261122-1005');
  assert.ok(message.includes('Cabinet Exemple'));
  assert.ok(message.includes('Marie Durand (Gestionnaire)'));
  assert.ok(message.includes('Besoins : Dépannages ponctuels, Clés & badges'));
});
