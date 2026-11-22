import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCardRevealMotion, REVEAL_VIEWPORT } from './scrollReveal';

test('viewport triggers once with a safe mobile-friendly threshold', () => {
  assert.equal(REVEAL_VIEWPORT.once, true);
  assert.ok(REVEAL_VIEWPORT.amount > 0 && REVEAL_VIEWPORT.amount <= 0.25);
});

test('staggers card reveal delays monotonically by card index', () => {
  const card0 = buildCardRevealMotion({ index: 0, staggerSeconds: 0.08, offsetY: 24 });
  const card1 = buildCardRevealMotion({ index: 1, staggerSeconds: 0.08, offsetY: 24 });
  const card3 = buildCardRevealMotion({ index: 3, staggerSeconds: 0.08, offsetY: 24 });

  assert.equal(card0.initial.opacity, 0);
  assert.equal(card0.initial.y, 24);
  assert.equal(card0.visible.opacity, 1);
  assert.equal(card0.visible.y, 0);
  assert.equal(card0.visible.transition.delay, 0);
  assert.equal(card1.visible.transition.delay, 0.08);
  assert.equal(card3.visible.transition.delay, 0.24);
});

test('clamps negative indices safely to zero delay', () => {
  const negative = buildCardRevealMotion({ index: -2 });
  assert.equal(negative.visible.transition.delay, 0);
});

test('respects reduced motion by removing displacement and stagger delay', () => {
  const reduced = buildCardRevealMotion({ index: 2, reducedMotion: true });
  assert.equal(reduced.initial.opacity, 1);
  assert.equal(reduced.initial.y, 0);
  assert.equal(reduced.visible.transition.duration, 0);
  assert.equal(reduced.visible.transition.delay, 0);
});
