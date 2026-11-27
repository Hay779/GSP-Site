import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_POSTER, parsePoster, posterFormat, serializePoster, validatePoster } from './offerPoster';
import { DEFAULT_OFFER, parseOffer, serializeOffer } from './offers';

test('poster settings: round trip, defaults, limits', () => {
  const p = { format: 'carte' as const, title: 'Syndics : -10 %', text: 'Pour vos copropriétés.' };
  assert.deepEqual(parsePoster(serializePoster(p)), p);
  assert.deepEqual(parsePoster(null), DEFAULT_POSTER);
  assert.equal(parsePoster({ format: 'a0' }).format, 'a4');
  assert.ok(validatePoster({ ...DEFAULT_POSTER, title: 'x'.repeat(71) }));
  assert.equal(posterFormat('a5').heightMm, 210);
});

test('offer keeps its poster through the server format', () => {
  const offer = { ...DEFAULT_OFFER, poster: { format: 'a5' as const, title: 'A', text: '' } };
  assert.deepEqual(parseOffer(serializeOffer(offer))?.poster, offer.poster);
});
