import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatCardIndex,
  resolveNextOpenIndex,
  resolvePeelDuration,
} from './peelCards';

test('formats zero-based indices as 2-digit labels starting at 01', () => {
  assert.equal(formatCardIndex(0), '01');
  assert.equal(formatCardIndex(3), '04');
  assert.equal(formatCardIndex(9), '10');
});

test('clamps peel duration and zeroes it when reduced motion is preferred', () => {
  assert.equal(resolvePeelDuration(0.62, false), 0.62);
  assert.equal(resolvePeelDuration(0.05, false), 0.15);
  assert.equal(resolvePeelDuration(3.0, false), 1.4);
  assert.equal(resolvePeelDuration(0.62, true), 0);
});

test('toggles active peel card index cleanly and guards out-of-range indices', () => {
  assert.equal(resolveNextOpenIndex(-1, 1, 4), 1);
  assert.equal(resolveNextOpenIndex(1, 1, 4), -1);
  assert.equal(resolveNextOpenIndex(1, 2, 4), 2);
  assert.equal(resolveNextOpenIndex(0, 5, 4), -1);
});
