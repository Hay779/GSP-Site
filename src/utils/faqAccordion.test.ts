import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatFaqNumber,
  resolveNextFaqFocusIndex,
  toggleFaqItemId,
} from './faqAccordion';

test('formatFaqNumber zero-pads indices and guards negative values', () => {
  assert.equal(formatFaqNumber(0), '01');
  assert.equal(formatFaqNumber(5), '06');
  assert.equal(formatFaqNumber(10), '11');
  assert.equal(formatFaqNumber(-2), '01');
});

test('toggleFaqItemId toggles open/closed state cleanly and ignores unknown IDs', () => {
  const ids = ['faq-1', 'faq-2', 'faq-3'];
  assert.equal(toggleFaqItemId(null, 'faq-1', ids), 'faq-1');
  assert.equal(toggleFaqItemId('faq-1', 'faq-1', ids), null);
  assert.equal(toggleFaqItemId('faq-1', 'faq-2', ids), 'faq-2');
  assert.equal(toggleFaqItemId('faq-2', 'unknown', ids), 'faq-2');
});

test('resolveNextFaqFocusIndex handles ArrowDown, ArrowUp, Home, End with wrap-around', () => {
  assert.equal(resolveNextFaqFocusIndex(0, 'ArrowDown', 6), 1);
  assert.equal(resolveNextFaqFocusIndex(5, 'ArrowDown', 6), 0);
  assert.equal(resolveNextFaqFocusIndex(0, 'ArrowUp', 6), 5);
  assert.equal(resolveNextFaqFocusIndex(3, 'ArrowUp', 6), 2);
  assert.equal(resolveNextFaqFocusIndex(4, 'Home', 6), 0);
  assert.equal(resolveNextFaqFocusIndex(1, 'End', 6), 5);
  assert.equal(resolveNextFaqFocusIndex(2, 'Enter', 6), null);
  assert.equal(resolveNextFaqFocusIndex(-1, 'ArrowDown', 6), null);
});
