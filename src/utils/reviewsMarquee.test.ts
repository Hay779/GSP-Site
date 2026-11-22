import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildMarqueeSequence,
  computeMarqueeDurationSeconds,
  formatReviewSlotNumber,
  resolveMarqueePlayState,
} from './reviewsMarquee';

test('formatReviewSlotNumber zero-pads single digits and clamps negatives', () => {
  assert.equal(formatReviewSlotNumber(0), '01');
  assert.equal(formatReviewSlotNumber(5), '06');
  assert.equal(formatReviewSlotNumber(11), '12');
  assert.equal(formatReviewSlotNumber(-3), '01');
});

test('computeMarqueeDurationSeconds scales proportionally and clamps to safe bounds', () => {
  assert.equal(computeMarqueeDurationSeconds(6, 6.5), 39);
  assert.equal(computeMarqueeDurationSeconds(1, 6.5), 18);
  assert.equal(computeMarqueeDurationSeconds(20, 6.5), 72);
});

test('resolveMarqueePlayState pauses on user toggle, hover, focus, or reduced motion', () => {
  assert.equal(
    resolveMarqueePlayState({
      isPausedByUser: false,
      isHovered: false,
      isFocused: false,
      reducedMotion: false,
    }),
    'running'
  );
  assert.equal(
    resolveMarqueePlayState({
      isPausedByUser: true,
      isHovered: false,
      isFocused: false,
      reducedMotion: false,
    }),
    'paused'
  );
  assert.equal(
    resolveMarqueePlayState({
      isPausedByUser: false,
      isHovered: true,
      isFocused: false,
      reducedMotion: false,
    }),
    'paused'
  );
  assert.equal(
    resolveMarqueePlayState({
      isPausedByUser: false,
      isHovered: false,
      isFocused: true,
      reducedMotion: false,
    }),
    'paused'
  );
  assert.equal(
    resolveMarqueePlayState({
      isPausedByUser: false,
      isHovered: false,
      isFocused: false,
      reducedMotion: true,
    }),
    'paused'
  );
});

test('buildMarqueeSequence duplicates items for seamless loop and omits clones on reduced motion', () => {
  const sample = [{ id: 'avis-1' }, { id: 'avis-2' }, { id: 'avis-3' }];

  const standard = buildMarqueeSequence(sample, false);
  assert.equal(standard.length, 6);
  assert.equal(standard[0].isDuplicate, false);
  assert.equal(standard[2].slotIndex, 2);
  assert.equal(standard[3].isDuplicate, true);
  assert.equal(standard[3].slotIndex, 0);
  assert.notEqual(standard[0].key, standard[3].key);

  const reduced = buildMarqueeSequence(sample, true);
  assert.equal(reduced.length, 3);
  assert.equal(reduced.every((entry) => !entry.isDuplicate), true);

  assert.deepEqual(buildMarqueeSequence([], false), []);
});
