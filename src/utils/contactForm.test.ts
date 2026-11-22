import test from 'node:test';
import assert from 'node:assert/strict';
import { createContactReference, INITIAL_CONTACT_DRAFT, validateContactDraft } from './contactForm';

test('empty form reports required fields, e-mail stays optional', () => {
  const e = validateContactDraft(INITIAL_CONTACT_DRAFT);
  for (const k of ['fullName', 'phone', 'message', 'consent']) assert.ok(e[k as keyof typeof e], k);
  assert.equal(e.email, undefined);
});

test('a complete form is valid', () => {
  assert.deepEqual(
    validateContactDraft({ subject: 'rdv', fullName: 'Ana B', phone: '06 12 34 56 78', email: '', message: 'Je souhaite passer samedi.', consent: true }),
    {}
  );
});

test('builds a contact reference', () => {
  assert.match(createContactReference(new Date(2026, 10, 22), 3), /^CT-20261122-\d{4}$/);
});
