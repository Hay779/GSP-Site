import assert from 'node:assert/strict';
import test from 'node:test';
import {
  HERO_PARALLAX_CONFIG,
  clampScrollProgress,
  computeHeroParallaxState,
  computeParallaxBleedPercent,
} from './heroParallax';

test('clampScrollProgress bounds values safely to [0, 1] and handles non-finite input', () => {
  assert.equal(clampScrollProgress(-0.5), 0);
  assert.equal(clampScrollProgress(0), 0);
  assert.equal(clampScrollProgress(0.45), 0.45);
  assert.equal(clampScrollProgress(1.8), 1);
  assert.equal(clampScrollProgress(Number.NaN), 0);
  assert.equal(clampScrollProgress(Number.POSITIVE_INFINITY), 0);
});

test('vertical bleed strictly exceeds maximum parallax travel to prevent exposed edges', () => {
  const requiredBleed = computeParallaxBleedPercent(HERO_PARALLAX_CONFIG.maxShiftPercent, 2);
  assert.ok(
    HERO_PARALLAX_CONFIG.verticalBleedPercent >= requiredBleed,
    `Expected verticalBleedPercent (${HERO_PARALLAX_CONFIG.verticalBleedPercent}) >= ${requiredBleed}`
  );
  assert.equal(computeParallaxBleedPercent(12.2, 2), 15);
  assert.equal(computeParallaxBleedPercent(-4, 2), 2);
});

test('computeHeroParallaxState interpolates smoothly across [0, 1] for immersive depth', () => {
  const atStart = computeHeroParallaxState(0, false);
  assert.deepEqual(atStart, {
    translateYPercent: 0,
    scale: 1,
    scrimExtraOpacity: 0,
    contentOffsetPx: 0,
  });

  const atMid = computeHeroParallaxState(0.5, false);
  assert.equal(atMid.translateYPercent, 8);
  assert.equal(atMid.scale, 1.0275);
  assert.equal(atMid.scrimExtraOpacity, 0.12);
  assert.equal(atMid.contentOffsetPx, -10);

  const atEnd = computeHeroParallaxState(1, false);
  assert.equal(atEnd.translateYPercent, HERO_PARALLAX_CONFIG.maxShiftPercent);
  assert.equal(atEnd.scale, HERO_PARALLAX_CONFIG.scaleEnd);
  assert.equal(atEnd.scrimExtraOpacity, HERO_PARALLAX_CONFIG.maxScrimExtraOpacity);
  assert.equal(atEnd.contentOffsetPx, HERO_PARALLAX_CONFIG.contentOffsetPx);
});

test('computeHeroParallaxState neutralizes all movement when reduced motion is preferred', () => {
  const reduced = computeHeroParallaxState(0.75, true);
  assert.deepEqual(reduced, {
    translateYPercent: 0,
    scale: 1,
    scrimExtraOpacity: 0,
    contentOffsetPx: 0,
  });
});
