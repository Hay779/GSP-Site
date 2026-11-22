import { useEffect, useState, type ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { REVEAL_EASE } from '../utils/scrollReveal';

export interface BreadcrumbItem {
  readonly label: string;
  /** Absent pour la page courante. */
  readonly href?: string;
}

interface PageHeroProps {
  readonly kicker: string;
  readonly title: string;
  readonly intro: string;
  readonly imageSrc?: string;
  /** Cadrage de la photo (CSS object-position). */
  readonly imagePosition?: string;
  readonly breadcrumb: readonly BreadcrumbItem[];
  readonly actions?: ReactNode;
  /** En-tête réduit, sans photo (pages légales). */
  readonly compact?: boolean;
}

/** Met à jour le titre de l'onglet et la description Google de la page. */
export function usePageMeta(title: string, description: string) {
  useEffect(() => {
    const previousTitle = document.title;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = meta?.content ?? '';
    document.title = title;
    if (meta) {
      meta.content = description;
    }
    return () => {
      document.title = previousTitle;
      if (meta) {
        meta.content = previousDescription;
      }
    };
  }, [title, description]);
}

/** En-tête commun des pages intérieures : photo plein cadre, fil d'Ariane, titre, actions. */
export function PageHero({
  kicker,
  title,
  intro,
  imageSrc,
  imagePosition = '60% 45%',
  breadcrumb,
  actions,
  compact = false,
}: PageHeroProps) {
  const prefersReducedMotion = Boolean(useReducedMotion());
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => setImageFailed(false), [imageSrc]);

  const fadeUp = (delay = 0) => ({
    initial: prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: prefersReducedMotion ? 0 : 0.55,
      delay: prefersReducedMotion ? 0 : delay,
      ease: REVEAL_EASE,
    },
  });

  return (
    <section
      id="page-hero"
      aria-labelledby="page-hero-title"
      className={`relative w-full overflow-hidden bg-[#1C1F21] flex items-end ${
        compact ? 'min-h-[340px] lg:min-h-[380px]' : 'min-h-[560px] lg:min-h-[620px]'
      }`}
    >
      <div aria-hidden="true" className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_40%,rgba(183,154,98,0.16),rgba(41,45,47,0.45)_45%,rgba(28,31,33,1)_85%)]" />
        {imageSrc && !compact && !imageFailed && (
          <motion.img
            key={imageSrc}
            src={imageSrc}
            alt=""
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
            initial={prefersReducedMotion ? { scale: 1.04 } : { scale: 1.12 }}
            animate={{ scale: 1.04 }}
            transition={{ duration: prefersReducedMotion ? 0 : 6, ease: 'easeOut' }}
            style={{ objectPosition: imagePosition }}
            className="absolute inset-0 h-full w-full object-cover will-change-transform"
          />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(to_top,#1C1F21_0%,#1C1F21_30%,rgba(28,31,33,0.7)_60%,rgba(28,31,33,0.35)_100%)] lg:bg-[linear-gradient(90deg,#1C1F21_0%,#1C1F21_30%,rgba(28,31,33,0.85)_48%,rgba(28,31,33,0.3)_75%,rgba(28,31,33,0.15)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#1C1F21] to-transparent" />
      </div>

      <div className={`relative z-10 mx-auto w-full max-w-[1280px] px-5 sm:px-8 lg:px-10 ${compact ? 'pt-20 pb-12 lg:pb-14' : 'pt-28 pb-14 sm:pb-16 lg:py-24'}`}>
        <nav aria-label="Fil d’Ariane" className="mb-6">
          <ol className="flex flex-wrap items-center gap-1.5 text-[13px] text-[#F3F0E7]/70">
            {breadcrumb.map((item, index) => (
              <li key={item.label} className="flex items-center gap-1.5">
                {index > 0 && (
                  <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 text-[#F3F0E7]/40" />
                )}
                {item.href ? (
                  <a href={item.href} className="hover:text-[#B79A62] transition-colors duration-150">
                    {item.label}
                  </a>
                ) : (
                  <span aria-current="page" className="text-[#F3F0E7]">
                    {item.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <div className="max-w-[640px]">
          <motion.p {...fadeUp(0)} className="section-kicker text-[#B79A62]">
            {kicker}
          </motion.p>
          <motion.h1
            {...fadeUp(0.08)}
            id="page-hero-title"
            className="mt-4 font-display text-[clamp(2.15rem,4.4vw,3.6rem)] font-semibold leading-[1.06] tracking-[-0.015em] text-[#F3F0E7]"
          >
            {title}
          </motion.h1>
          <motion.p
            {...fadeUp(0.16)}
            className="mt-5 max-w-[560px] text-[16px] sm:text-[18px] leading-[1.6] text-[#F3F0E7]/85"
          >
            {intro}
          </motion.p>

          {actions && (
            <motion.div {...fadeUp(0.24)} className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
              {actions}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

/** Classes des deux boutons standard des en-têtes de page. */
export const PAGE_HERO_PRIMARY_BUTTON =
  'inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-lg bg-[#B79A62] hover:bg-[#C6AA73] active:bg-[#A68952] px-7 py-3 text-[15px] sm:text-[16px] font-semibold text-[#1C1F21] whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F3F0E7] cursor-pointer';

export const PAGE_HERO_SECONDARY_BUTTON =
  'inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-lg border border-[#F3F0E7]/65 bg-[#1C1F21]/35 hover:bg-[#F3F0E7]/10 hover:border-[#F3F0E7] px-7 py-3 text-[15px] sm:text-[16px] font-medium text-[#F3F0E7] tabular-nums whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79A62] cursor-pointer';
