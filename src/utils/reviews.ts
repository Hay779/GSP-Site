import type { CustomerReview, ReviewService, ReviewsSource } from '../data/reviewsContent';

export interface RatingSummary {
  /** Note moyenne arrondie au dixième (0 s'il n'y a aucun avis). */
  readonly average: number;
  readonly count: number;
}

/** Note moyenne et nombre d'avis (les chiffres Google priment s'ils sont fournis). */
export function computeRatingSummary(reviews: readonly CustomerReview[], source?: ReviewsSource): RatingSummary {
  if (source?.googleAverage && source.googleTotalCount) {
    return {
      average: Math.round(Math.min(5, Math.max(0, source.googleAverage)) * 10) / 10,
      count: Math.max(0, Math.floor(source.googleTotalCount)),
    };
  }
  if (reviews.length === 0) {
    return { average: 0, count: 0 };
  }
  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  return { average: Math.round((total / reviews.length) * 10) / 10, count: reviews.length };
}

/** « 4,9 » (virgule française). */
export function formatRating(value: number): string {
  return value.toFixed(1).replace('.', ',');
}

/** Remplissage d'une étoile (0 à 1) pour une note donnée : étoile n° index (0 à 4). */
export function starFill(rating: number, index: number): number {
  return Math.min(1, Math.max(0, rating - index));
}

/** « octobre 2026 ». Renvoie la chaîne d'origine si la date est invalide. */
export function formatReviewDate(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) {
    return isoDate;
  }
  const months = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
  ];
  const month = Number(match[2]) - 1;
  return months[month] ? `${months[month]} ${match[1]}` : isoDate;
}

/** Initiales pour l'avatar (« Sophie L. » → « SL »). */
export function reviewInitials(author: string): string {
  const parts = author.replace(/\./g, ' ').trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('') || '?';
}

/** Avis les plus récents d'abord, éventuellement filtrés par métier. */
export function selectReviews(
  reviews: readonly CustomerReview[],
  service: ReviewService | 'all' = 'all'
): readonly CustomerReview[] {
  return [...reviews]
    .filter((r) => service === 'all' || r.service === service)
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** Métiers réellement présents dans les avis (pour n'afficher que des filtres utiles). */
export function servicesWithReviews(
  reviews: readonly CustomerReview[],
  order: readonly ReviewService[]
): readonly ReviewService[] {
  return order.filter((service) => reviews.some((r) => r.service === service));
}

/** Avis à afficher : les vrais s'il y en a, sinon les exemples en mode démo, sinon rien. */
export function resolveDisplayedReviews(
  real: readonly CustomerReview[],
  demo: readonly CustomerReview[],
  demoEnabled: boolean
): { readonly reviews: readonly CustomerReview[]; readonly isDemo: boolean } {
  if (real.length > 0) {
    return { reviews: real, isDemo: false };
  }
  return demoEnabled ? { reviews: demo, isDemo: true } : { reviews: [], isDemo: false };
}
