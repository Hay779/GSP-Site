import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveActionBarVisible } from './mobileActionBar';

test('hidden at the top of the page', () => {
  assert.equal(resolveActionBarVisible({ scrollY: 100, revealAfterY: 300, nearFooter: false }), false);
});

test('stays visible while reading, in both scroll directions', () => {
  assert.equal(resolveActionBarVisible({ scrollY: 1500, revealAfterY: 300, nearFooter: false }), true);
});

test('hidden on the footer', () => {
  assert.equal(resolveActionBarVisible({ scrollY: 4000, revealAfterY: 300, nearFooter: true }), false);
});
