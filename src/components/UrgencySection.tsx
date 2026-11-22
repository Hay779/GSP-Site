import { Lock, Phone } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import type { UrgencyConfig } from '../data/sectionsContent';
import type { BrandConfig } from '../utils/navigation';
import { REVEAL_EASE, REVEAL_VIEWPORT } from '../utils/scrollReveal';

interface UrgencySectionProps {
  readonly config: UrgencyConfig;
  readonly brand: BrandConfig;
}

export function UrgencySection({ config, brand }: UrgencySectionProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;

  return (
    <section
      id="03_Urgence"
      data-section="03_Urgence"
      aria-labelledby="03_Urgence-title"
      className="w-full bg-[#292D2F] border-y border-[#B79A62]/65 scroll-mt-[74px] lg:scroll-mt-[88px]"
    >
      <motion.div
        initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={REVEAL_VIEWPORT}
        transition={{ duration: prefersReducedMotion ? 0 : 0.48, ease: REVEAL_EASE }}
        className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10 py-8 sm:py-9 lg:py-10"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 lg:gap-10">
          {/* Bloc gauche : icône cadenas laiton, filet vertical et message d'urgence */}
          <div className="flex items-start sm:items-center gap-4 sm:gap-6">
            <span
              aria-hidden="true"
              className="grid h-12 w-12 sm:h-14 sm:w-14 shrink-0 place-items-center rounded-full border border-[#B79A62]/45 bg-[#1C1F21] text-[#B79A62]"
            >
              <Lock className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={1.6} />
            </span>

            <div>
              <h2
                id="03_Urgence-title"
                className="font-display text-[23px] sm:text-[28px] lg:text-[32px] font-semibold leading-[1.18] tracking-[-0.015em] text-[#F3F0E7]"
              >
                {config.title}
              </h2>
              <p className="mt-1.5 text-[15px] sm:text-[17px] leading-[1.5] text-[#F3F0E7]/82">
                {config.subtitle}
              </p>
            </div>
          </div>

          {/* Bloc droit : accès direct à l'appel avec reflet laiton au survol */}
          <div className="shrink-0">
            <a
              href={brand.phoneHref}
              className="group relative overflow-hidden inline-flex min-h-[52px] w-full md:w-auto items-center justify-center gap-3 rounded-lg bg-[#B79A62] hover:bg-[#C6AA73] active:bg-[#A68952] px-6 sm:px-7 py-3.5 text-[16px] sm:text-[17px] font-semibold text-[#1C1F21] tabular-nums tracking-[0.01em] whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F3F0E7]"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-500 ease-out group-hover:translate-x-full"
              />
              <Phone
                className="relative h-[19px] w-[19px] shrink-0 transition-transform duration-150 group-hover:-rotate-6"
                strokeWidth={1.9}
                aria-hidden="true"
              />
              <span className="relative">
                {config.ctaPrefix} {brand.phoneDisplay}
              </span>
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
