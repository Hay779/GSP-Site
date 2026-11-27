import test from 'node:test';
import assert from 'node:assert/strict';
import { buildFormData, interpretResponse, sendFormRequest } from './formDelivery';
import { fitWithin } from './photoCompression';

const rows = [
  { label: 'Nom', value: 'Ana B' },
  { label: 'Téléphone', value: '06 12 34 56 78' },
];

test('builds the form data sent to the PHP receiver', () => {
  const data = buildFormData({ kind: 'contact', rows, startedAt: 1700000000000, honeypot: '' });
  assert.equal(data.get('type'), 'contact');
  assert.equal(data.get('debut'), '1700000000000');
  assert.equal(data.get('website'), '');
  assert.deepEqual(JSON.parse(String(data.get('champs'))), [
    { libelle: 'Nom', valeur: 'Ana B' },
    { libelle: 'Téléphone', valeur: '06 12 34 56 78' },
  ]);
  assert.equal(data.getAll('photos[]').length, 0);
});

test('attaches photos', () => {
  const data = buildFormData({ kind: 'sinistre', rows, startedAt: 1, honeypot: '', photos: [new Blob(['a']), new Blob(['b'])] });
  assert.equal(data.getAll('photos[]').length, 2);
});

test('interprets server answers', () => {
  assert.deepEqual(interpretResponse(200, { ok: true, reference: 'DV-20261124-1234' }), { ok: true, reference: 'DV-20261124-1234' });
  assert.deepEqual(interpretResponse(429, { ok: false }), { ok: false, reason: 'limite' });
  assert.deepEqual(interpretResponse(400, { ok: false }), { ok: false, reason: 'refus' });
  assert.deepEqual(interpretResponse(500, null), { ok: false, reason: 'reseau' });
  assert.deepEqual(interpretResponse(200, { ok: true }), { ok: false, reason: 'reseau' });
});

test('a network failure is reported, never thrown', async () => {
  const failing = (async () => {
    throw new Error('offline');
  }) as unknown as typeof fetch;
  assert.deepEqual(await sendFormRequest({ kind: 'devis', rows, startedAt: 1, honeypot: '' }, failing), { ok: false, reason: 'reseau' });
});

test('posts to the receiver and returns the reference', async () => {
  let calledWith = '';
  const fake = (async (url: string) => {
    calledWith = url;
    return new Response(JSON.stringify({ ok: true, reference: 'CT-20261124-5555' }), { status: 200 });
  }) as unknown as typeof fetch;
  assert.deepEqual(await sendFormRequest({ kind: 'contact', rows, startedAt: 1, honeypot: '' }, fake), { ok: true, reference: 'CT-20261124-5555' });
  assert.equal(calledWith, '/api/demande.php');
});

test('photos are shrunk to 1600 px on the longest edge, never enlarged', () => {
  assert.deepEqual(fitWithin(4000, 3000), { width: 1600, height: 1200 });
  assert.deepEqual(fitWithin(3000, 4000), { width: 1200, height: 1600 });
  assert.deepEqual(fitWithin(800, 600), { width: 800, height: 600 });
});

test('passes the offer validity and "already registered" flag through', () => {
  assert.deepEqual(interpretResponse(200, { ok: true, reference: 'OFF-20261127-1234', valable_jusqu_au: '27/04/2027', deja_inscrit: true }), {
    ok: true,
    reference: 'OFF-20261127-1234',
    validUntil: '27/04/2027',
    alreadyRegistered: true,
  });
});
