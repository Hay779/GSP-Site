import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import type { BrandsConfig } from '../data/sectionsContent';
import { REVEAL_EASE, REVEAL_VIEWPORT } from '../utils/scrollReveal';

interface BrandsSectionProps {
  readonly config: BrandsConfig;
  /** Lien « contactez-nous » (page devis). */
  readonly contactHref: string;
}

/**
 * Marques sur lesquelles nous intervenons, présentées en texte dans la typographie
 * du site (pas de reproduction des logos déposés des fabricants).
 */
export function BrandsSection({ config, contactHref }: BrandsSectionProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;

  return (
    <section
      id="06_Marques"
      data-section="06_Marques"
      aria-labelledby="06_Marques-title"
      className="w-full bg-[#F7F5F0] text-[#1C1F21] border-t border-b border-[#B79A62]/45 scroll-mt-[74px] lg:scroll-mt-[88px]"
    >
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10 py-16 sm:py-20 lg:py-24">
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={REVEAL_VIEWPORT}
          transition={{ duration: prefersReducedMotion ? 0 : 0.52, ease: REVEAL_EASE }}
          className="max-w-2xl"
        >
          <p className="section-kicker text-[#7D612D]">{config.kicker}</p>
          <h2 id="06_Marques-title" className="mt-3 section-title text-[#1C1F21]">
            {config.title}
          </h2>
          <p className="mt-4 section-subtitle text-[#1C1F21]/70">{config.subtitle}</p>
        </motion.div>

        <ul
          aria-label="Marques sur lesquelles nous intervenons"
          className="mt-10 sm:mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px overflow-hidden rounded-xl border border-[#1C1F21]/12 bg-[#1C1F21]/10"
        >
          {config.partners.map((partner, index) => (
            <motion.li
              key={partner.id}
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={REVEAL_VIEWPORT}
              transition={{ duration: prefersReducedMotion ? 0 : 0.45, delay: prefersReducedMotion ? 0 : index * 0.06, ease: REVEAL_EASE }}
              className="group relative flex min-h-[150px] flex-col items-center justify-center gap-3 bg-[#FFFFFF] px-4 py-7 text-center transition-colors duration-200 hover:bg-[#FBFAF7]"
            >
              <span className="font-display text-[22px] sm:text-[24px] font-semibold uppercase tracking-[0.14em] text-[#1C1F21] transition-colors duration-200 group-hover:text-[#7D612D]">
                {partner.name}
              </span>
              <span aria-hidden="true" className="h-px w-8 bg-[#B79A62] transition-all duration-300 group-hover:w-12" />
              <span className="min-h-[2.6em] text-[12.5px] font-medium uppercase leading-[1.3] tracking-[0.12em] text-[#1C1F21]/55">{partner.specialty}</span>
            </motion.li>
          ))}
        </ul>

        <p className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] text-[#1C1F21]/70">
          {config.otherBrandsLabel}
          <a
            href={contactHref}
            className="group inline-flex items-center gap-1.5 font-semibold text-[#7D612D] hover:text-[#1C1F21] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7D612D] rounded-xs"
          >
            {config.otherBrandsCta}
            <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1" aria-hidden="true" />
          </a>
        </p>
      </div>
    </section>
  );
}
