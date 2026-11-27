import test from 'node:test';
import assert from 'node:assert/strict';
import { formatAnswer, newQuestion, parseQuestions, serializeQuestions, validateAnswers, validateQuestions, type OfferQuestion } from './offerQuestions';
import { buildOfferSummary, INITIAL_OFFER_DRAFT, validateOfferDraft } from './offerForm';
import { DEFAULT_OFFER } from './offers';

const lots: OfferQuestion = { id: 'q1', label: 'Nombre de lots gérés', type: 'nombre', required: true, options: [] };
const travaux: OfferQuestion = { id: 'q2', label: 'Travaux prévus', type: 'cases', required: false, options: ['Serrures', 'Vitrerie'] };

test('question definitions are checked', () => {
  assert.equal(validateQuestions([lots, travaux]), null);
  assert.match(validateQuestions([{ ...lots, label: '' }]) ?? '', /intitulé/);
  assert.match(validateQuestions([{ ...lots, label: 'Téléphone' }]) ?? '', /formulaire de base/);
  assert.match(validateQuestions([lots, { ...travaux, label: 'nombre de lots gérés' }]) ?? '', /même intitulé/);
  assert.match(validateQuestions([{ ...travaux, options: ['Seul'] }]) ?? '', /2 choix/);
  assert.match(validateQuestions([{ ...travaux, options: ['A, B', 'C'] }]) ?? '', /virgule/);
});

test('new question ids never collide', () => {
  const q = newQuestion('choix', [lots, { ...travaux, id: 'q3' }]);
  assert.ok(!['q1', 'q3'].includes(q.id));
  assert.equal(q.options.length, 2);
});

test('answers: required, numbers, formatting', () => {
  assert.deepEqual(Object.keys(validateAnswers([lots, travaux], {})), ['q1']);
  assert.ok(validateAnswers([lots], { q1: 'beaucoup' }).q1);
  assert.deepEqual(validateAnswers([lots], { q1: '12,5' }), {});
  assert.equal(formatAnswer(travaux, ['Serrures', 'Vitrerie']), 'Serrures, Vitrerie');
  assert.equal(formatAnswer({ ...lots, type: 'date' }, '2027-03-01'), '01/03/2027');
  assert.equal(formatAnswer(lots, undefined), '—');
});

test('signup form: question errors and summary rows', () => {
  const offer = { ...DEFAULT_OFFER, questions: [lots, travaux] };
  assert.ok(validateOfferDraft(INITIAL_OFFER_DRAFT, offer)['q:q1']);
  const rows = buildOfferSummary({ ...INITIAL_OFFER_DRAFT, answers: { q1: '120', q2: ['Serrures'] } }, offer);
  assert.deepEqual(rows.slice(-2), [
    { label: 'Nombre de lots gérés', value: '120' },
    { label: 'Travaux prévus', value: 'Serrures' },
  ]);
});

test('server format round trip', () => {
  assert.deepEqual(parseQuestions(serializeQuestions([lots, travaux])), [lots, travaux]);
  assert.deepEqual(parseQuestions([{ id: 'q1', libelle: 'X', type: 'inconnu' }]), []);
});
