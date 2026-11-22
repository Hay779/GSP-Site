import assert from 'node:assert/strict';
import test from 'node:test';
import { HEADER_SCROLL_CONFIG, resolveHeaderHidden } from './headerVisibility';

test('header always stays visible near top of page regardless of scroll direction', () => {
  assert.equal(
    resolveHeaderHidden({
      currentY: 80,
      previousY: 40,
      wasHidden: false,
      isMenuOpen: false,
      hasFocusWithin: false,
    }),
    false
  );

  assert.equal(
    resolveHeaderHidden({
      currentY: HEADER_SCROLL_CONFIG.revealTopThresholdPx,
      previousY: 20,
      wasHidden: true,
      isMenuOpen: false,
      hasFocusWithin: false,
    }),
    false
  );
});

test('header hides on deliberate downward scroll past threshold and reappears on upward scroll', () => {
  const hidden = resolveHeaderHidden({
    currentY: 260,
    previousY: 220,
    wasHidden: false,
    isMenuOpen: false,
    hasFocusWithin: false,
  });
  assert.equal(hidden, true);

  const revealed = resolveHeaderHidden({
    currentY: 240,
    previousY: 260,
    wasHidden: true,
    isMenuOpen: false,
    hasFocusWithin: false,
  });
  assert.equal(revealed, false);
});

test('header preserves previous visibility on tiny jitter deltas to avoid flicker', () => {
  assert.equal(
    resolveHeaderHidden({
      currentY: 304,
      previousY: 300,
      wasHidden: false,
      isMenuOpen: false,
      hasFocusWithin: false,
    }),
    false
  );

  assert.equal(
    resolveHeaderHidden({
      currentY: 296,
      previousY: 300,
      wasHidden: true,
      isMenuOpen: false,
      hasFocusWithin: false,
    }),
    true
  );
});

test('header never hides while mobile menu is open or keyboard focus is inside', () => {
  assert.equal(
    resolveHeaderHidden({
      currentY: 480,
      previousY: 400,
      wasHidden: false,
      isMenuOpen: true,
      hasFocusWithin: false,
    }),
    false
  );

  assert.equal(
    resolveHeaderHidden({
      currentY: 480,
      previousY: 400,
      wasHidden: true,
      isMenuOpen: false,
      hasFocusWithin: true,
    }),
    false
  );
});
