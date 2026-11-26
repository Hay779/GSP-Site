import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveActionBarVisible, resolveScrollHidden } from './mobileActionBar';

test('hidden at the top of the page', () => {
  assert.equal(resolveActionBarVisible({ scrollY: 100, revealAfterY: 300, nearFooter: false }), false);
});

test('visible once past the top of the page', () => {
  assert.equal(resolveActionBarVisible({ scrollY: 1500, revealAfterY: 300, nearFooter: false }), true);
});

test('hidden on the footer', () => {
  assert.equal(resolveActionBarVisible({ scrollY: 4000, revealAfterY: 300, nearFooter: true }), false);
});

test('hides as soon as the page scrolls down', () => {
  assert.deepEqual(resolveScrollHidden({ currentY: 1012, anchorY: 1000, wasHidden: false }), {
    hidden: true,
    anchorY: 1012,
  });
});

test('slow downward scroll adds up until it hides', () => {
  let state = { hidden: false, anchorY: 1000 };
  for (const y of [1004, 1008, 1012]) {
    state = resolveScrollHidden({ currentY: y, anchorY: state.anchorY, wasHidden: state.hidden });
  }
  assert.equal(state.hidden, true);
});

test('comes back after a small upward scroll, measured from the lowest point', () => {
  let state = { hidden: false, anchorY: 1000 };
  for (const y of [1100, 1400, 1395, 1393]) {
    state = resolveScrollHidden({ currentY: y, anchorY: state.anchorY, wasHidden: state.hidden });
  }
  assert.equal(state.hidden, true);
  assert.equal(state.anchorY, 1400);
  state = resolveScrollHidden({ currentY: 1390, anchorY: state.anchorY, wasHidden: state.hidden });
  assert.equal(state.hidden, false);
});

test('tiny jitter does not toggle the bar', () => {
  assert.deepEqual(resolveScrollHidden({ currentY: 1003, anchorY: 1000, wasHidden: false }), {
    hidden: false,
    anchorY: 1000,
  });
});
