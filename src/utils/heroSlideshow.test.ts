import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatSlideCounter,
  frameHidesEdges,
  kenBurnsTransform,
  HERO_SLIDESHOW_TIMING,
  kenBurnsMoveFor,
  nextSlideIndex,
  previousSlideIndex,
  slidesToRender,
} from './heroSlideshow';

test('loops forward and backward through slides', () => {
  assert.equal(nextSlideIndex(0, 6), 1);
  assert.equal(nextSlideIndex(5, 6), 0);
  assert.equal(previousSlideIndex(0, 6), 5);
  assert.equal(previousSlideIndex(3, 6), 2);
});

test('handles empty or invalid slide counts safely', () => {
  assert.equal(nextSlideIndex(2, 0), 0);
  assert.equal(previousSlideIndex(2, 0), 0);
  assert.deepEqual(slidesToRender(0, 0), []);
  assert.equal(nextSlideIndex(-3, 4), 1);
});

test('only keeps previous, current and next slides mounted', () => {
  assert.deepEqual(slidesToRender(0, 6), [0, 1, 5]);
  assert.deepEqual(slidesToRender(3, 6), [2, 3, 4]);
  assert.deepEqual(slidesToRender(0, 1), [0]);
  assert.deepEqual(slidesToRender(1, 2), [0, 1]);
});

test('alternates camera moves and always stays zoomed in to hide edges', () => {
  const a = kenBurnsMoveFor(0);
  const b = kenBurnsMoveFor(1);
  assert.notDeepEqual(a, b);
  for (let i = 0; i < 8; i += 1) {
    const move = kenBurnsMoveFor(i);
    assert.ok(frameHidesEdges(move.from), `start frame of move ${i}`);
    assert.ok(frameHidesEdges(move.to), `end frame of move ${i}`);
  }
  assert.equal(frameHidesEdges({ scale: 1.02, xPercent: 3, yPercent: 0 }), false);
});

test('fade is shorter than slide display time', () => {
  assert.ok(HERO_SLIDESHOW_TIMING.fadeDurationMs < HERO_SLIDESHOW_TIMING.slideDurationMs);
});

test('formats the slide counter with two digits', () => {
  assert.equal(formatSlideCounter(0, 6), '01 / 06');
  assert.equal(formatSlideCounter(5, 6), '06 / 06');
});

test('builds a CSS transform string', () => {
  assert.equal(
    kenBurnsTransform({ scale: 1.1, xPercent: -2, yPercent: 1 }),
    'scale(1.1) translate(-2%, 1%)'
  );
});
