import test from 'node:test';
import assert from 'node:assert/strict';
import { matchesRequestSearch, parseRequests, requestField, requestsToCsv, requestSummary } from './gestion';

const body = {
  demandes: [
    {
      reference: 'DV-20261127-5512',
      type: 'devis',
      titre: 'Demande de devis',
      recu_le: '2026-11-27T09:41:00+01:00',
      champs: [
        { libelle: 'Besoin', valeur: 'Changement de serrure' },
        { libelle: 'Lieu', valeur: 'Marseille 4e' },
        { libelle: 'Nom', valeur: 'Ana Bel' },
        { libelle: 'Téléphone', valeur: '06 12 34 56 78' },
      ],
      photos: ['photo-1.jpg'],
      statut: 'en_cours',
      note: 'Rappeler lundi',
      maj_le: '2026-11-27T10:00:00+01:00',
    },
    { reference: 'OFF-20261127-0001', type: 'inscription' },
    { reference: 'CT-20261127-0002', type: 'contact', champs: 'cassé', statut: 'bizarre' },
  ],
};

test('requests from the server: unknown types dropped, defaults applied', () => {
  const list = parseRequests(body);
  assert.equal(list.length, 2);
  assert.equal(list[0].status, 'en_cours');
  assert.deepEqual(list[0].photos, ['photo-1.jpg']);
  assert.equal(list[1].status, 'nouvelle');
  assert.deepEqual(list[1].fields, []);
  assert.deepEqual(parseRequests(null), []);
});

test('summary, fields and search', () => {
  const [r] = parseRequests(body);
  assert.equal(requestSummary(r), 'Changement de serrure');
  assert.equal(requestField(r, 'Ville', 'Lieu'), 'Marseille 4e');
  assert.ok(matchesRequestSearch(r, 'serrure'));
  assert.ok(matchesRequestSearch(r, '0612345678'));
  assert.ok(matchesRequestSearch(r, 'lundi'));
  assert.ok(!matchesRequestSearch(r, 'vitrerie'));
});

test('CSV export has one column per label', () => {
  const csv = requestsToCsv(parseRequests(body));
  const head = csv.split('\r\n')[0];
  assert.ok(head.includes('Besoin') && head.includes('Suivi') && head.includes('Photos'));
  assert.ok(csv.includes('En cours'));
});
