import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import type { BrandsConfig, PartnerBrandItem } from '../data/sectionsContent';
import { REVEAL_EASE, REVEAL_VIEWPORT } from '../utils/scrollReveal';

interface BrandsSectionProps {
  readonly config: BrandsConfig;
  /** Lien « contactez-nous » (page devis). */
  readonly contactHref: string;
}

/** Logo officiel de la marque ; à défaut, son nom dans la typographie du site. */
function BrandLogo({ partner }: { readonly partner: PartnerBrandItem }) {
  const [failed, setFailed] = useState(false);
  if (partner.logoSrc && !failed) {
    return (
      <span className="flex h-[72px] w-full items-center justify-center">
        <img
          src={partner.logoSrc}
          alt={`Logo ${partner.name}`}
          loading="lazy"
          onError={() => setFailed(true)}
          style={{ maxHeight: `${partner.logoHeight ?? 56}px` }}
          className="w-auto max-w-[92%] object-contain"
        />
      </span>
    );
  }
  return (
    <span className="flex h-[64px] items-center font-display text-[21px] sm:text-[22px] font-semibold uppercase tracking-[0.14em] text-[#1C1F21] transition-colors duration-200 group-hover:text-[#7D612D]">
      {partner.name}
    </span>
  );
}

/** Marques sur lesquelles nous intervenons : une carte par marque (logo + spécialité). */
export function BrandsSection({ config, contactHref }: BrandsSectionProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;

  return (
    <section
      id="06_Marques"
      data-section="06_Marques"
      aria-labelledby="06_Marques-title"
      className="w-full bg-[#1C1F21] text-[#F3F0E7] scroll-mt-[74px] lg:scroll-mt-[88px]"
    >
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10 py-16 sm:py-20 lg:py-24">
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={REVEAL_VIEWPORT}
          transition={{ duration: prefersReducedMotion ? 0 : 0.52, ease: REVEAL_EASE }}
          className="max-w-2xl"
        >
          <p className="section-kicker text-[#B79A62]">{config.kicker}</p>
          <h2 id="06_Marques-title" className="mt-3 section-title text-[#F3F0E7]">
            {config.title}
          </h2>
          <p className="mt-4 section-subtitle text-[#F3F0E7]/75">{config.subtitle}</p>
        </motion.div>

        <ul
          aria-label="Marques sur lesquelles nous intervenons"
          className="mt-10 sm:mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-5"
        >
          {config.partners.map((partner, index) => (
            <motion.li
              key={partner.id}
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={REVEAL_VIEWPORT}
              transition={{ duration: prefersReducedMotion ? 0 : 0.45, delay: prefersReducedMotion ? 0 : index * 0.06, ease: REVEAL_EASE }}
              className="group flex min-h-[120px] items-center justify-center rounded-xl bg-[#FFFFFF] px-4 py-6 text-center transition-shadow duration-200 hover:shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
            >
              <BrandLogo partner={partner} />
            </motion.li>
          ))}
        </ul>

        <p className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] text-[#F3F0E7]/70">
          {config.otherBrandsLabel}
          <a
            href={contactHref}
            className="group inline-flex items-center gap-1.5 font-semibold text-[#B79A62] hover:text-[#F3F0E7] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79A62] rounded-xs"
          >
            {config.otherBrandsCta}
            <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1" aria-hidden="true" />
          </a>
        </p>
      </div>
    </section>
  );
}
