import { FileText, Lock, Phone, ShieldAlert, ShieldCheck, Timer } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import type { UrgencyConfig } from '../data/sectionsContent';
import type { BrandConfig } from '../utils/navigation';
import { REVEAL_EASE, REVEAL_VIEWPORT } from '../utils/scrollReveal';

interface UrgencySectionProps {
  readonly config: UrgencyConfig;
  readonly brand: BrandConfig;
}

const CASE_ICONS = { lock: Lock, shield: ShieldAlert } as const;
const ASSURANCE_ICONS = { timer: Timer, shield: ShieldCheck, file: FileText } as const;

/**
 * Bloc « Un problème de porte ? » : deux cas d'urgence illustrés (porte claquée, porte forcée),
 * trois engagements et l'appel direct.
 */
export function UrgencySection({ config, brand }: UrgencySectionProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;

  return (
    <section
      id="03_Urgence"
      data-section="03_Urgence"
      aria-labelledby="03_Urgence-title"
      className="urg-surface relative w-full bg-[var(--urg-bg)] [--urg-bg:#1C1F21] [--urg-card:#1C1F21] [--urg-ink:#F3F0E7] [--urg-text:rgba(243,240,231,0.78)] [--urg-accent:#B79A62] [--urg-line:rgba(243,240,231,0.12)] [--urg-cta:#B79A62] [--urg-cta-ink:#1C1F21] scroll-mt-[74px] lg:scroll-mt-[88px]"
    >
      <motion.div
        initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={REVEAL_VIEWPORT}
        transition={{ duration: prefersReducedMotion ? 0 : 0.48, ease: REVEAL_EASE }}
        className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10 py-12 sm:py-14 lg:py-20"
      >
        {/* En-tête : kicker, titre, sous-titre et appel direct */}
        <div className="max-w-[640px]">
            <p className="section-kicker flex items-center gap-3 text-[var(--urg-accent)]">
              <span aria-hidden="true" className="h-px w-8 bg-[var(--urg-accent)]" />
              {config.kicker}
            </p>
            <h2 id="03_Urgence-title" className="section-title mt-3 text-[var(--urg-ink)]">
              {config.title}
            </h2>
            <p className="section-subtitle mt-3 text-[var(--urg-text)]">{config.subtitle}</p>
            <CallButton brand={brand} prefix={config.ctaPrefix} className="mt-5 inline-flex" />
        </div>

        {/* Deux cas d'urgence : texte à gauche, photo en fondu à droite */}
        <ul className="mt-8 lg:mt-10 grid gap-4 md:grid-cols-2 lg:gap-6">
          {config.cases.map((item) => {
            const Icon = CASE_ICONS[item.icon];
            return (
              <li
                key={item.title}
                className="relative isolate overflow-hidden rounded-2xl border border-[#B79A62]/40 bg-[var(--urg-card)] min-h-[190px] sm:min-h-[210px]"
              >
                <img
                  src={item.imageSrc}
                  alt={item.imageAlt}
                  loading="lazy"
                  className="absolute inset-y-0 right-0 -z-10 h-full w-[55%] object-cover"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 right-0 -z-10 w-[55%] bg-gradient-to-r from-[var(--urg-card)] via-[color-mix(in_srgb,var(--urg-card)_45%,transparent)] to-transparent"
                />
                <div className="flex h-full max-w-[62%] flex-col justify-center p-5 sm:p-6">
                  <span
                    aria-hidden="true"
                    className="grid h-11 w-11 place-items-center rounded-full border border-[var(--urg-accent)]/70 text-[var(--urg-accent)]"
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.6} />
                  </span>
                  <h3 className="mt-3 font-display text-[22px] sm:text-[24px] font-semibold leading-tight text-[#F3F0E7]">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-[14.5px] leading-[1.5] text-[#F3F0E7]/75">{item.text}</p>
                  <span aria-hidden="true" className="mt-4 h-0.5 w-9 bg-[var(--urg-accent)]" />
                </div>
              </li>
            );
          })}
        </ul>

        {/* Engagements */}
        <ul className="mt-8 grid grid-cols-3 border-t border-[var(--urg-line)] pt-6">
          {config.assurances.map((item, index) => {
            const Icon = ASSURANCE_ICONS[item.icon];
            return (
              <li
                key={item.label}
                className={`flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3 px-2 text-center sm:text-left ${
                  index > 0 ? 'border-l border-[var(--urg-line)]' : ''
                } sm:justify-center`}
              >
                <Icon className="h-7 w-7 shrink-0 text-[var(--urg-accent)]" strokeWidth={1.5} aria-hidden="true" />
                <span className="text-[13px] sm:text-[14.5px] leading-[1.35] text-[var(--urg-ink)]/88">{item.label}</span>
              </li>
            );
          })}
        </ul>

      </motion.div>
    </section>
  );
}

function CallButton({
  brand,
  prefix,
  className,
}: {
  readonly brand: BrandConfig;
  readonly prefix: string;
  readonly className: string;
}) {
  return (
    <a
      href={brand.phoneHref}
      className={`group relative shrink-0 h-11 items-center justify-center gap-2 rounded-full bg-[var(--urg-cta)] hover:brightness-110 px-5 text-[15px] font-semibold text-[var(--urg-cta-ink)] tabular-nums whitespace-nowrap transition duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--urg-accent)] ${className}`}
    >
      <Phone className="h-4 w-4 shrink-0 transition-transform duration-150 group-hover:-rotate-6" strokeWidth={1.9} aria-hidden="true" />
      <span>
        {prefix} {brand.phoneDisplay}
      </span>
    </a>
  );
}
