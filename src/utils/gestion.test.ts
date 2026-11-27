import test from 'node:test';
import assert from 'node:assert/strict';
import { matchesSearch, parseFrenchDate, parseSignups, signupStatus, signupsToCsv, type OfferSignup } from './gestion';

const base: OfferSignup = {
  reference: 'OFF-20261127-4821',
  receivedAt: '2026-11-27T10:12:00+01:00',
  validUntil: '27/04/2027',
  offer: 'bienvenue',
  fields: { 'Vous êtes': 'Syndic / copropriété', Société: 'Cabinet Étoile', Nom: 'Ana Bel', Téléphone: '06 12 34 56 78', 'E-mail': 'ana@exemple.fr' },
  usedAt: null,
  note: '',
};

test('French date parsing', () => {
  assert.equal(parseFrenchDate('27/04/2027')?.getMonth(), 3);
  assert.equal(parseFrenchDate('2027-04-27'), null);
});

test('status: valid, soon, expired, used', () => {
  const today = new Date(2026, 10, 27);
  assert.equal(signupStatus(base, today), 'valide');
  assert.equal(signupStatus({ ...base, validUntil: '10/12/2026' }, today), 'bientot');
  assert.equal(signupStatus({ ...base, validUntil: '27/11/2026' }, today), 'bientot');
  assert.equal(signupStatus({ ...base, validUntil: '26/11/2026' }, today), 'perime');
  assert.equal(signupStatus({ ...base, usedAt: '2026-11-27T12:00:00Z' }, today), 'utilise');
});

test('search: code, accents ignored, phone digits', () => {
  assert.ok(matchesSearch(base, '4821'));
  assert.ok(matchesSearch(base, 'etoile'));
  assert.ok(matchesSearch(base, '0612345678'));
  assert.ok(matchesSearch(base, ''));
  assert.ok(!matchesSearch(base, 'dupont'));
});

test('CSV for Excel: BOM, semicolons, quoted cells', () => {
  const csv = signupsToCsv([{ ...base, fields: { ...base.fields, Société: 'A; B' } }]);
  assert.ok(csv.startsWith('﻿Code;'));
  assert.ok(csv.includes('"A; B"'));
});

test('server payload is parsed defensively', () => {
  const list = parseSignups({
    inscriptions: [
      { reference: 'OFF-1', recu_le: 'x', valable_jusqu_au: '01/01/2027', champs: { Nom: 'A', X: 3 }, utilise_le: null },
      { nope: true },
    ],
  });
  assert.equal(list.length, 1);
  assert.deepEqual(list[0].fields, { Nom: 'A' });
  assert.equal(list[0].usedAt, null);
  assert.deepEqual(parseSignups(null), []);
});
