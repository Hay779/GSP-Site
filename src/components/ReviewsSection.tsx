import { useState } from 'react';
import { ArrowRight, Pause, Play } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import type { ReviewItem, ReviewsConfig } from '../data/sectionsContent';
import {
  buildMarqueeSequence,
  computeMarqueeDurationSeconds,
  formatReviewSlotNumber,
  resolveMarqueePlayState,
} from '../utils/reviewsMarquee';
import { REVEAL_EASE, REVEAL_VIEWPORT } from '../utils/scrollReveal';

interface ReviewsSectionProps {
  readonly config: ReviewsConfig;
}

interface ReviewMarqueeCardProps {
  readonly review: ReviewItem;
  readonly slotIndex: number;
  readonly isDuplicate: boolean;
}

function ReviewMarqueeCard({ review, slotIndex, isDuplicate }: ReviewMarqueeCardProps) {
  const slotLabel = formatReviewSlotNumber(slotIndex);

  return (
    <div
      aria-hidden={isDuplicate ? 'true' : undefined}
      className="w-[308px] sm:w-[368px] shrink-0 pr-5 sm:pr-6"
    >
      <article className="group flex h-full min-h-[244px] flex-col justify-between rounded-xl border border-[#1C1F21]/12 bg-[#FFFFFF] p-6 sm:p-7 transition-colors duration-200 hover:border-[#B79A62]">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                aria-hidden="true"
                className="font-display text-[38px] leading-[0.72] text-[#B79A62] select-none translate-y-1"
              >
                “
              </span>
              {review.serviceTag && (
                <span className="truncate text-[12px] font-medium tracking-[0.11em] uppercase text-[#7D612D]">
                  {review.serviceTag}
                </span>
              )}
            </div>
            <span className="shrink-0 font-display text-[12px] font-medium tracking-[0.08em] tabular-nums text-[#1C1F21]/40">
              {slotLabel}
            </span>
          </div>

          <h3 className="mt-4 font-display text-[18px] sm:text-[19px] font-semibold leading-[1.3] text-[#1C1F21]">
            {review.title}
          </h3>
          <p
            className={`mt-2.5 text-[14.5px] sm:text-[15px] leading-[1.65] ${
              review.isPlaceholder
                ? 'italic text-[#1C1F21]/64'
                : 'text-[#1C1F21]/82'
            }`}
          >
            {review.quote}
          </p>
        </div>

        <div className="mt-6 border-t border-[#1C1F21]/10 pt-4">
          <p className="text-[13.5px] sm:text-[14px] font-medium text-[#1C1F21]/88">
            <span>{review.author}</span>
            <span aria-hidden="true" className="mx-1.5 text-[#7D612D]/70">
              ·
            </span>
            <span className="font-normal text-[#1C1F21]/66">{review.date}</span>
          </p>
          <p className="mt-0.5 text-[12px] italic text-[#1C1F21]/55">
            {review.source}
          </p>
        </div>
      </article>
    </div>
  );
}

export function ReviewsSection({ config }: ReviewsSectionProps) {
  const [showPendingNotice, setShowPendingNotice] = useState(false);
  const [isPausedByUser, setIsPausedByUser] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const prefersReducedMotion = useReducedMotion() ?? false;

  const hasExternalUrl = Boolean(config.externalUrl.trim());
  const durationSeconds = computeMarqueeDurationSeconds(config.items.length, 6.5);
  const playState = resolveMarqueePlayState({
    isPausedByUser,
    isHovered,
    isFocused,
    reducedMotion: prefersReducedMotion,
  });
  const sequence = buildMarqueeSequence(config.items, prefersReducedMotion);

  return (
    <section
      id="08_Avis_Clients"
      data-section="08_Avis_Clients"
      aria-labelledby="08_Avis_Clients-title"
      className="w-full bg-[#F7F5F0] text-[#1C1F21] border-t border-[#B79A62]/45 scroll-mt-[74px] lg:scroll-mt-[88px] overflow-x-clip"
    >
      <div className="py-16 sm:py-20 lg:py-24">
        {/* En-tête de section + contrôle du défilement */}
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={REVEAL_VIEWPORT}
          transition={{ duration: prefersReducedMotion ? 0 : 0.52, ease: REVEAL_EASE }}
          className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="max-w-2xl">
            <p className="section-kicker text-[#7D612D]">
              {config.kicker}
            </p>
            <h2
              id="08_Avis_Clients-title"
              className="mt-3 section-title text-[#1C1F21]"
            >
              {config.title}
            </h2>
            <p className="mt-4 section-subtitle text-[#1C1F21]/70">
              {config.subtitle}
            </p>
          </div>

          {!prefersReducedMotion && (
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsPausedByUser((prev) => !prev)}
                aria-pressed={isPausedByUser}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-[#1C1F21]/18 bg-[#FFFFFF] px-4 py-2 text-[13.5px] font-medium text-[#1C1F21] whitespace-nowrap transition-colors duration-150 hover:border-[#B79A62] hover:text-[#7D612D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7D612D] cursor-pointer"
              >
                {isPausedByUser ? (
                  <>
                    <Play className="h-4 w-4 shrink-0 text-[#7D612D]" strokeWidth={2} aria-hidden="true" />
                    <span>Reprendre le défilement</span>
                  </>
                ) : (
                  <>
                    <Pause className="h-4 w-4 shrink-0 text-[#7D612D]" strokeWidth={2} aria-hidden="true" />
                    <span>Mettre en pause</span>
                  </>
                )}
              </button>
            </div>
          )}
        </motion.div>

        {/* Bandeau de défilement continu style Framer Testimonial Marquee */}
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={REVEAL_VIEWPORT}
          transition={{ duration: prefersReducedMotion ? 0 : 0.6, delay: prefersReducedMotion ? 0 : 0.08, ease: REVEAL_EASE }}
          className="relative mt-10 sm:mt-12 w-full"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onFocus={() => setIsFocused(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
              setIsFocused(false);
            }
          }}
        >
          {/* Masques de fondu latéraux harmonisés au fond clair */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 sm:w-20 lg:w-32 bg-gradient-to-r from-[#F7F5F0] via-[#F7F5F0]/80 to-transparent"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 sm:w-20 lg:w-32 bg-gradient-to-l from-[#F7F5F0] via-[#F7F5F0]/80 to-transparent"
          />

          <div
            data-testid="reviews-marquee-viewport"
            data-play-state={playState}
            className={
              prefersReducedMotion
                ? 'mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10 overflow-x-auto pb-2'
                : 'w-full overflow-hidden py-1'
            }
          >
            <div
              data-testid="reviews-marquee-track"
              className={
                prefersReducedMotion
                  ? 'flex w-max items-stretch'
                  : 'reviews-marquee-track flex w-max items-stretch'
              }
              style={
                prefersReducedMotion
                  ? undefined
                  : {
                      animationDuration: `${durationSeconds}s`,
                      animationPlayState: playState,
                    }
              }
            >
              {sequence.map(({ item, key, slotIndex, isDuplicate }) => (
                <ReviewMarqueeCard
                  key={key}
                  review={item}
                  slotIndex={slotIndex}
                  isDuplicate={isDuplicate}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Bouton vers l'ensemble des avis */}
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10 mt-10 sm:mt-12 flex flex-col items-center gap-3">
          {hasExternalUrl ? (
            <a
              href={config.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-lg border border-[#1C1F21] bg-[#1C1F21] hover:bg-[#292D2F] px-7 py-3 text-[15px] sm:text-[16px] font-medium text-[#F3F0E7] whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7D612D]"
            >
              <span>{config.ctaLabel}</span>
              <ArrowRight
                className="h-[18px] w-[18px] shrink-0 text-[#B79A62] transition-transform duration-150 group-hover:translate-x-1"
                strokeWidth={2}
                aria-hidden="true"
              />
            </a>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setShowPendingNotice((prev) => !prev)}
                aria-expanded={showPendingNotice}
                className="group inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-lg border border-[#1C1F21] bg-[#1C1F21] hover:bg-[#292D2F] px-7 py-3 text-[15px] sm:text-[16px] font-medium text-[#F3F0E7] whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7D612D] cursor-pointer"
              >
                <span>{config.ctaLabel}</span>
                <ArrowRight
                  className="h-[18px] w-[18px] shrink-0 text-[#B79A62] transition-transform duration-150 group-hover:translate-x-1"
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </button>
              {showPendingNotice && (
                <p
                  role="status"
                  className="text-center text-[13px] italic text-[#1C1F21]/72 max-w-md"
                >
                  {config.pendingUrlNotice}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
