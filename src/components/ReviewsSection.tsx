import { useState } from 'react';
import { ArrowRight, Pause, Play, Star } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import {
  DEMO_REVIEWS,
  REAL_REVIEWS,
  REVIEW_SERVICES,
  REVIEWS_SOURCE,
  type CustomerReview,
  type ReviewService,
} from '../data/reviewsContent';
import type { ReviewsConfig } from '../data/sectionsContent';
import {
  computeRatingSummary,
  formatRating,
  formatReviewDate,
  resolveDisplayedReviews,
  reviewInitials,
  selectReviews,
  servicesWithReviews,
  starFill,
} from '../utils/reviews';
import {
  buildMarqueeSequence,
  computeMarqueeDurationSeconds,
  resolveMarqueePlayState,
} from '../utils/reviewsMarquee';
import { REVEAL_EASE, REVEAL_VIEWPORT } from '../utils/scrollReveal';

/** Les avis d'exemple ne s'affichent que dans les aperçus compilés avec VITE_REVIEWS_DEMO=true. */
const DEMO_ENABLED = import.meta.env.VITE_REVIEWS_DEMO === 'true';

interface ReviewsSectionProps {
  readonly config: ReviewsConfig;
  /** « marquee » : bandeau défilant (accueil) ; « grid » : grille filtrable (page Avis). */
  readonly layout?: 'marquee' | 'grid';
  /** Lien vers la page de tous les avis (affiché en mode bandeau). */
  readonly allReviewsHref?: string;
}

/* ------------------------------------------------------------------ */

function Stars({ rating, size = 'h-4 w-4' }: { readonly rating: number; readonly size?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${formatRating(rating)} sur 5`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = starFill(rating, i);
        return (
          <span key={i} className={`relative inline-block ${size}`} aria-hidden="true">
            <Star className={`absolute inset-0 ${size} text-[#B79A62]/35`} strokeWidth={1.6} />
            {fill > 0 && (
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star className={`${size} fill-[#B79A62] text-[#B79A62]`} strokeWidth={1.6} />
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}

function GoogleMark() {
  return (
    <span
      className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#1C1F21]/12 bg-[#FFFFFF] font-display text-[13px] font-bold text-[#1C1F21]/70"
      title="Avis Google"
      aria-label="Avis Google"
    >
      G
    </span>
  );
}

function ReviewCard({ review, isDemo }: { readonly review: CustomerReview; readonly isDemo: boolean }) {
  return (
    <article className="flex h-full flex-col rounded-xl border border-[#1C1F21]/12 bg-[#FFFFFF] p-6 sm:p-7 transition-colors duration-200 hover:border-[#B79A62]">
      <div className="flex items-center justify-between gap-3">
        <Stars rating={review.rating} />
        <span className="text-[13px] text-[#1C1F21]/55">{formatReviewDate(review.date)}</span>
      </div>
      {isDemo && (
        <span className="mt-3 inline-flex w-fit rounded-md border border-dashed border-[#B79A62] bg-[#F7F5F0] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7D612D]">
          Exemple
        </span>
      )}
      <p className="mt-4 flex-1 text-[15.5px] leading-[1.65] text-[#1C1F21]/85 line-clamp-6">« {review.text} »</p>
      <div className="mt-6 flex items-center gap-3 border-t border-[#1C1F21]/10 pt-4">
        <span
          aria-hidden="true"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#1C1F21] font-display text-[14px] font-semibold text-[#B79A62]"
        >
          {reviewInitials(review.author)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold text-[#1C1F21]">{review.author}</p>
          {review.service && (
            <p className="truncate text-[12px] font-medium uppercase tracking-[0.12em] text-[#7D612D]">{review.service}</p>
          )}
        </div>
        <GoogleMark />
      </div>
    </article>
  );
}

function RatingSummaryCard({ reviews }: { readonly reviews: readonly CustomerReview[] }) {
  const summary = computeRatingSummary(reviews, REVIEWS_SOURCE);
  return (
    <div className="flex items-center gap-5 rounded-xl border border-[#1C1F21]/12 bg-[#FFFFFF] px-6 py-5">
      <p className="font-display text-[44px] font-semibold leading-none tabular-nums text-[#1C1F21]">
        {formatRating(summary.average)}
      </p>
      <div>
        <Stars rating={summary.average} size="h-5 w-5" />
        <p className="mt-1.5 text-[14px] text-[#1C1F21]/70">
          sur {summary.count} avis Google
        </p>
      </div>
    </div>
  );
}

function ReviewActions({ allReviewsHref, showAllLink }: { readonly allReviewsHref?: string; readonly showAllLink: boolean }) {
  const hasLeave = Boolean(REVIEWS_SOURCE.leaveReviewUrl.trim());
  const hasProfile = Boolean(REVIEWS_SOURCE.googleProfileUrl.trim());
  if (!showAllLink && !hasLeave && !hasProfile) {
    return null;
  }
  return (
    <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
      {showAllLink && allReviewsHref && (
        <a
          href={allReviewsHref}
          className="group inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-lg bg-[#1C1F21] px-7 py-3 text-[15px] font-medium text-[#F3F0E7] hover:bg-[#292D2F] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7D612D]"
        >
          Voir tous les avis
          <ArrowRight className="h-[18px] w-[18px] text-[#B79A62] transition-transform duration-150 group-hover:translate-x-1" aria-hidden="true" />
        </a>
      )}
      {hasLeave && (
        <a
          href={REVIEWS_SOURCE.leaveReviewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-lg border border-[#1C1F21]/25 px-7 py-3 text-[15px] font-medium text-[#1C1F21] hover:border-[#1C1F21] transition-colors duration-150"
        >
          <Star className="h-4 w-4 text-[#7D612D]" aria-hidden="true" />
          Laisser un avis
        </a>
      )}
      {!showAllLink && hasProfile && (
        <a
          href={REVIEWS_SOURCE.googleProfileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[48px] items-center justify-center gap-2 px-4 py-3 text-[15px] font-medium text-[#7D612D] underline-offset-4 hover:underline"
        >
          Voir notre fiche Google
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      )}
    </div>
  );
}

function EmptyState() {
  const hasLeave = Boolean(REVIEWS_SOURCE.leaveReviewUrl.trim());
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center rounded-xl border border-[#1C1F21]/12 bg-[#FFFFFF] px-6 py-12 text-center sm:px-12">
      <Stars rating={0} size="h-7 w-7" />
      <p className="mt-4 font-display text-[22px] font-semibold text-[#1C1F21]">Les avis de nos clients arrivent ici.</p>
      <p className="mt-2 max-w-md text-[15.5px] leading-[1.6] text-[#1C1F21]/70">
        Vous avez fait appel à nous ? Votre avis aide d’autres Marseillais à trouver un artisan de confiance.
      </p>
      {hasLeave && (
        <a
          href={REVIEWS_SOURCE.leaveReviewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-lg bg-[#B79A62] px-7 py-3 text-[15px] font-semibold text-[#1C1F21] hover:bg-[#C6AA73]"
        >
          <Star className="h-4 w-4" aria-hidden="true" />
          Laisser un avis Google
        </a>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function ReviewsMarquee({ reviews, isDemo }: { readonly reviews: readonly CustomerReview[]; readonly isDemo: boolean }) {
  const [isPausedByUser, setIsPausedByUser] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const prefersReducedMotion = useReducedMotion() ?? false;
  const durationSeconds = computeMarqueeDurationSeconds(reviews.length, 7);
  const playState = resolveMarqueePlayState({ isPausedByUser, isHovered, isFocused, reducedMotion: prefersReducedMotion });
  const sequence = buildMarqueeSequence(reviews, prefersReducedMotion);

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsFocused(false);
        }
      }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 sm:w-20 lg:w-32 bg-gradient-to-r from-[#F7F5F0] via-[#F7F5F0]/80 to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 sm:w-20 lg:w-32 bg-gradient-to-l from-[#F7F5F0] via-[#F7F5F0]/80 to-transparent" />
      <div
        data-testid="reviews-marquee-viewport"
        data-play-state={playState}
        className={prefersReducedMotion ? 'mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10 overflow-x-auto pb-2' : 'w-full overflow-hidden py-1'}
      >
        <div
          data-testid="reviews-marquee-track"
          className={prefersReducedMotion ? 'flex w-max items-stretch' : 'reviews-marquee-track flex w-max items-stretch'}
          style={prefersReducedMotion ? undefined : { animationDuration: `${durationSeconds}s`, animationPlayState: playState }}
        >
          {sequence.map(({ item, key, isDuplicate }) => (
            <div key={key} aria-hidden={isDuplicate ? 'true' : undefined} className="w-[300px] sm:w-[360px] shrink-0 pr-5 sm:pr-6">
              <ReviewCard review={item} isDemo={isDemo} />
            </div>
          ))}
        </div>
      </div>
      {!prefersReducedMotion && (
        <div className="mx-auto mt-5 flex max-w-[1280px] justify-end px-5 sm:px-8 lg:px-10">
          <button
            type="button"
            onClick={() => setIsPausedByUser((prev) => !prev)}
            aria-pressed={isPausedByUser}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-lg px-3 py-2 text-[13.5px] font-medium text-[#1C1F21]/70 hover:text-[#7D612D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7D612D] cursor-pointer"
          >
            {isPausedByUser ? <Play className="h-4 w-4" aria-hidden="true" /> : <Pause className="h-4 w-4" aria-hidden="true" />}
            {isPausedByUser ? 'Reprendre le défilement' : 'Mettre en pause'}
          </button>
        </div>
      )}
    </div>
  );
}

function ReviewsGrid({ reviews, isDemo }: { readonly reviews: readonly CustomerReview[]; readonly isDemo: boolean }) {
  const [filter, setFilter] = useState<ReviewService | 'all'>('all');
  const services = servicesWithReviews(reviews, REVIEW_SERVICES);
  const visible = selectReviews(reviews, filter);
  const chip = (active: boolean) =>
    `inline-flex min-h-[40px] items-center rounded-full border px-4 py-2 text-[14px] transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7D612D] ${
      active ? 'border-[#1C1F21] bg-[#1C1F21] text-[#F3F0E7]' : 'border-[#1C1F21]/18 bg-[#FFFFFF] text-[#1C1F21]/80 hover:border-[#B79A62]'
    }`;
  return (
    <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">
      {services.length > 1 && (
        <div role="group" aria-label="Filtrer les avis par métier" className="mb-8 flex flex-wrap gap-2">
          <button type="button" aria-pressed={filter === 'all'} onClick={() => setFilter('all')} className={chip(filter === 'all')}>
            Tous ({reviews.length})
          </button>
          {services.map((s) => (
            <button key={s} type="button" aria-pressed={filter === s} onClick={() => setFilter(s)} className={chip(filter === s)}>
              {s}
            </button>
          ))}
        </div>
      )}
      <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {visible.map((review) => (
          <li key={review.id}>
            <ReviewCard review={review} isDemo={isDemo} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function ReviewsSection({ config, layout = 'marquee', allReviewsHref }: ReviewsSectionProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const { reviews, isDemo } = resolveDisplayedReviews(REAL_REVIEWS, DEMO_REVIEWS, DEMO_ENABLED);
  const hasReviews = reviews.length > 0;
  const displayed = selectReviews(reviews);

  return (
    <section
      id="08_Avis_Clients"
      data-section="08_Avis_Clients"
      aria-labelledby="08_Avis_Clients-title"
      className="w-full bg-[#F7F5F0] text-[#1C1F21] border-t border-[#B79A62]/45 scroll-mt-[74px] lg:scroll-mt-[88px] overflow-x-clip"
    >
      <div className="py-16 sm:py-20 lg:py-24">
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={REVEAL_VIEWPORT}
          transition={{ duration: prefersReducedMotion ? 0 : 0.52, ease: REVEAL_EASE }}
          className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="max-w-2xl">
            <p className="section-kicker text-[#7D612D]">{config.kicker}</p>
            <h2 id="08_Avis_Clients-title" className="mt-3 section-title text-[#1C1F21]">
              {config.title}
            </h2>
            <p className="mt-4 section-subtitle text-[#1C1F21]/70">{config.subtitle}</p>
            {isDemo && (
              <p className="mt-4 inline-flex rounded-lg border border-dashed border-[#B79A62] bg-[#FFFFFF] px-3 py-2 text-[13px] text-[#7D612D]">
                Aperçu du design : avis d’exemple, non publiés sur le site.
              </p>
            )}
          </div>
          {hasReviews && <RatingSummaryCard reviews={reviews} />}
        </motion.div>

        <div className="mt-10 sm:mt-12">
          {!hasReviews ? (
            <div className="px-5 sm:px-8 lg:px-10">
              <EmptyState />
            </div>
          ) : layout === 'grid' ? (
            <ReviewsGrid reviews={reviews} isDemo={isDemo} />
          ) : (
            <ReviewsMarquee reviews={displayed} isDemo={isDemo} />
          )}
        </div>

        {hasReviews && (
          <div className="mx-auto mt-8 sm:mt-10 max-w-[1280px] px-5 sm:px-8 lg:px-10">
            <ReviewActions allReviewsHref={allReviewsHref} showAllLink={layout === 'marquee'} />
          </div>
        )}
      </div>
    </section>
  );
}
