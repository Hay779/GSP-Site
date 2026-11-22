import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveActionBarVisible } from './mobileActionBar';

const base = { revealAfterY: 600, nearFooter: false, wasVisible: false };

test('hidden at the top of the page, even when scrolling up', () => {
  assert.equal(resolveActionBarVisible({ ...base, currentY: 200, previousY: 300, wasVisible: true }), false);
});

test('appears when scrolling up, hides when scrolling down', () => {
  assert.equal(resolveActionBarVisible({ ...base, currentY: 1500, previousY: 1540 }), true);
  assert.equal(resolveActionBarVisible({ ...base, currentY: 1540, previousY: 1500, wasVisible: true }), false);
});

test('small movements keep the current state (no flicker)', () => {
  assert.equal(resolveActionBarVisible({ ...base, currentY: 1500, previousY: 1503, wasVisible: true }), true);
  assert.equal(resolveActionBarVisible({ ...base, currentY: 1503, previousY: 1500, wasVisible: false }), false);
});

test('hidden near the footer', () => {
  assert.equal(resolveActionBarVisible({ ...base, nearFooter: true, currentY: 4000, previousY: 4100, wasVisible: true }), false);
});
