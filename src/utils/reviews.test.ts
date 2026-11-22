import test from 'node:test';
import assert from 'node:assert/strict';
import { DEMO_REVIEWS, REAL_REVIEWS, type CustomerReview } from '../data/reviewsContent';
import {
  computeRatingSummary,
  formatRating,
  formatReviewDate,
  resolveDisplayedReviews,
  reviewInitials,
  selectReviews,
  servicesWithReviews,
  starFill,
} from './reviews';

const R = (id: string, rating: 1 | 2 | 3 | 4 | 5, date: string, service?: CustomerReview['service']): CustomerReview => ({
  id,
  author: 'Jean D.',
  rating,
  date,
  text: 'x',
  service,
  source: 'Google',
});

test('computes the average rating and count', () => {
  assert.deepEqual(computeRatingSummary([]), { average: 0, count: 0 });
  assert.deepEqual(computeRatingSummary([R('a', 5, '2026-01-01'), R('b', 4, '2026-01-02'), R('c', 5, '2026-01-03')]), {
    average: 4.7,
    count: 3,
  });
  assert.deepEqual(
    computeRatingSummary([R('a', 5, '2026-01-01')], { googleProfileUrl: '', leaveReviewUrl: '', googleAverage: 4.86, googleTotalCount: 127 }),
    { average: 4.9, count: 127 }
  );
});

test('formats ratings, dates and initials the French way', () => {
  assert.equal(formatRating(4.9), '4,9');
  assert.equal(formatRating(5), '5,0');
  assert.equal(formatReviewDate('2026-10-14'), 'octobre 2026');
  assert.equal(formatReviewDate('hier'), 'hier');
  assert.equal(reviewInitials('Sophie L.'), 'SL');
  assert.equal(reviewInitials(''), '?');
});

test('fills stars partially', () => {
  assert.equal(starFill(4.5, 0), 1);
  assert.equal(starFill(4.5, 4), 0.5);
  assert.equal(starFill(4, 4), 0);
});

test('sorts newest first and filters by trade', () => {
  const list = [R('a', 5, '2026-01-01', 'Vitrerie'), R('b', 4, '2026-03-01', 'Serrurerie'), R('c', 5, '2026-02-01', 'Vitrerie')];
  assert.deepEqual(selectReviews(list).map((r) => r.id), ['b', 'c', 'a']);
  assert.deepEqual(selectReviews(list, 'Vitrerie').map((r) => r.id), ['c', 'a']);
  assert.deepEqual(servicesWithReviews(list, ['Serrurerie', 'Menuiserie', 'Vitrerie']), ['Serrurerie', 'Vitrerie']);
});

test('never shows demo reviews when real reviews exist or demo mode is off', () => {
  const real = [R('real', 5, '2026-01-01')];
  assert.deepEqual(resolveDisplayedReviews(real, DEMO_REVIEWS, true), { reviews: real, isDemo: false });
  assert.deepEqual(resolveDisplayedReviews([], DEMO_REVIEWS, false), { reviews: [], isDemo: false });
  assert.equal(resolveDisplayedReviews([], DEMO_REVIEWS, true).isDemo, true);
});

test('review data is well formed (unique ids, valid dates and ratings)', () => {
  for (const list of [REAL_REVIEWS, DEMO_REVIEWS]) {
    const ids = list.map((r) => r.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const r of list) {
      assert.match(r.date, /^\d{4}-\d{2}-\d{2}$/);
      assert.ok(r.rating >= 1 && r.rating <= 5);
      assert.ok(r.text.trim().length > 0);
    }
  }
  // Les exemples doivent rester identifiables comme tels.
  for (const r of DEMO_REVIEWS) {
    assert.ok(r.id.startsWith('demo-') && r.author.startsWith('Exemple'));
  }
});
