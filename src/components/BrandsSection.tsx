import { useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import type { BrandsConfig, PartnerBrandItem } from '../data/sectionsContent';
import {
  buildMarqueeSequence,
  computeMarqueeDurationSeconds,
  resolveMarqueePlayState,
} from '../utils/reviewsMarquee';
import { REVEAL_EASE, REVEAL_VIEWPORT } from '../utils/scrollReveal';
import { PartnerLogoMark } from './PartnerLogoMark';

interface BrandsSectionProps {
  readonly config: BrandsConfig;
}

interface PartnerLogoTileProps {
  readonly partner: PartnerBrandItem;
  readonly isDuplicate: boolean;
}

function PartnerLogoTile({ partner, isDuplicate }: PartnerLogoTileProps) {
  return (
    <div
      aria-hidden={isDuplicate ? 'true' : undefined}
      className="w-[248px] sm:w-[286px] shrink-0 pr-5 sm:pr-6"
    >
      <div
        aria-hidden={isDuplicate ? 'true' : undefined}
        className="flex h-[138px] sm:h-[150px] flex-col items-center justify-between rounded-xl border border-[#1C1F21]/10 bg-[#FFFFFF] px-6 py-5 transition-colors duration-200 hover:border-[#B79A62]"
      >
        <div className="flex flex-1 items-center justify-center w-full">
          <PartnerLogoMark brandId={partner.id} name={partner.name} />
        </div>
        <div className="w-full flex flex-col items-center gap-2 pt-2">
          <span aria-hidden="true" className="h-px w-8 bg-[#1C1F21]/12" />
          <p className="text-[12.5px] font-medium tracking-[0.02em] text-[#1C1F21]/62 text-center whitespace-nowrap">
            {partner.specialty}
          </p>
        </div>
      </div>
    </div>
  );
}

export function BrandsSection({ config }: BrandsSectionProps) {
  const [isPausedByUser, setIsPausedByUser] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const prefersReducedMotion = useReducedMotion() ?? false;

  const durationSeconds = computeMarqueeDurationSeconds(config.partners.length, 5.2);
  const playState = resolveMarqueePlayState({
    isPausedByUser,
    isHovered,
    isFocused,
    reducedMotion: prefersReducedMotion,
  });
  const sequence = buildMarqueeSequence(config.partners, prefersReducedMotion);

  return (
    <section
      id="06_Marques"
      data-section="06_Marques"
      aria-labelledby="06_Marques-title"
      className="w-full bg-[#F7F5F0] text-[#1C1F21] border-t border-b border-[#B79A62]/45 scroll-mt-[74px] lg:scroll-mt-[88px] overflow-x-clip"
    >
      <div className="py-16 sm:py-20 lg:py-26">
        {/* En-tête éditorial « Nos partenaires » + bouton pause/reprise */}
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={REVEAL_VIEWPORT}
          transition={{ duration: prefersReducedMotion ? 0 : 0.52, ease: REVEAL_EASE }}
          className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="max-w-2xl">
            <p className="text-[13px] sm:text-[14px] font-medium tracking-[0.16em] uppercase text-[#7D612D]">
              {config.kicker}
            </p>
            <h2
              id="06_Marques-title"
              className="mt-3 font-display text-[30px] sm:text-[36px] lg:text-[42px] font-semibold leading-[1.14] tracking-[-0.015em] text-[#1C1F21]"
            >
              {config.title}
            </h2>
            <p className="mt-3 text-[15px] sm:text-[16px] leading-[1.6] text-[#1C1F21]/68">
              {config.subtitle}
            </p>
          </div>

          {!prefersReducedMotion && (
            <div className="flex items-center shrink-0">
              <button
                type="button"
                onClick={() => setIsPausedByUser((prev) => !prev)}
                aria-pressed={isPausedByUser}
                aria-label={
                  isPausedByUser
                    ? 'Reprendre le défilement des partenaires'
                    : 'Mettre en pause le défilement des partenaires'
                }
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-[#1C1F21]/18 bg-[#FFFFFF] px-4 py-2 text-[13.5px] font-medium text-[#1C1F21] whitespace-nowrap transition-colors duration-150 hover:border-[#B79A62] hover:text-[#7D612D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7D612D] cursor-pointer"
              >
                {isPausedByUser ? (
                  <>
                    <Play
                      className="h-4 w-4 shrink-0 text-[#7D612D]"
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    <span>Reprendre</span>
                  </>
                ) : (
                  <>
                    <Pause
                      className="h-4 w-4 shrink-0 text-[#7D612D]"
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    <span>Pause</span>
                  </>
                )}
              </button>
            </div>
          )}
        </motion.div>

        {/* Bandeau défilant plein cadre des logos partenaires en couleur */}
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={REVEAL_VIEWPORT}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.6,
            delay: prefersReducedMotion ? 0 : 0.08,
            ease: REVEAL_EASE,
          }}
          className="relative mt-11 sm:mt-14 w-full"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onFocus={() => setIsFocused(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
              setIsFocused(false);
            }
          }}
        >
          {/* Fondus latéraux assortis au fond clair #F7F5F0 */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 sm:w-20 lg:w-32 bg-gradient-to-r from-[#F7F5F0] via-[#F7F5F0]/80 to-transparent"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 sm:w-20 lg:w-32 bg-gradient-to-l from-[#F7F5F0] via-[#F7F5F0]/80 to-transparent"
          />

          <div
            data-testid="partners-marquee-viewport"
            data-play-state={playState}
            aria-label="Fabricants partenaires"
            className={
              prefersReducedMotion
                ? 'mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10'
                : 'w-full overflow-hidden py-1'
            }
          >
            {prefersReducedMotion ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {config.partners.map((partner) => (
                  <div
                    key={partner.id}
                    className="flex h-[138px] flex-col items-center justify-between rounded-xl border border-[#1C1F21]/10 bg-[#FFFFFF] px-6 py-5"
                  >
                    <div className="flex flex-1 items-center justify-center w-full">
                      <PartnerLogoMark brandId={partner.id} name={partner.name} />
                    </div>
                    <div className="w-full flex flex-col items-center gap-2 pt-2">
                      <span aria-hidden="true" className="h-px w-8 bg-[#1C1F21]/12" />
                      <p className="text-[12.5px] font-medium text-[#1C1F21]/62 text-center">
                        {partner.specialty}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                data-testid="partners-marquee-track"
                className="reviews-marquee-track flex w-max items-stretch"
                style={{
                  animationDuration: `${durationSeconds}s`,
                  animationPlayState: playState,
                }}
              >
                {sequence.map(({ item, key, isDuplicate }) => (
                  <PartnerLogoTile key={key} partner={item} isDuplicate={isDuplicate} />
                ))}
              </div>
            )}
          </div>
        </motion.div>

        <p className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10 mt-9 text-center text-[13px] italic text-[#1C1F21]/56">
          {config.note}
        </p>
      </div>
    </section>
  );
}
