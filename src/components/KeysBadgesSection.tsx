import { useState } from 'react';
import { ArrowRight, KeyRound, MapPin, Store } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import type { AgencyItem, KeysBadgeIconKey, KeysBadgesConfig, KeysBadgesPageConfig } from '../data/sectionsContent';
import { REVEAL_EASE, REVEAL_VIEWPORT } from '../utils/scrollReveal';

interface KeysBadgesSectionProps {
  readonly config: KeysBadgesConfig;
  /** Services détaillés et étapes (partagés avec la page Clés & badges). */
  readonly details: KeysBadgesPageConfig;
  readonly agencies: readonly AgencyItem[];
  /** Lien vers la page Clés & badges. */
  readonly pageHref: string;
  /** Lien vers la page Agences & contact. */
  readonly agenciesHref: string;
}

export function ServiceIcon({ icon }: { readonly icon: KeysBadgeIconKey }) {
  if (icon === 'key') {
    return (
      <KeyRound
        className="h-7 w-7 shrink-0 text-[#7D612D]"
        strokeWidth={1.65}
        aria-hidden="true"
      />
    );
  }

  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      className="h-7 w-7 shrink-0 text-[#7D612D]"
      aria-hidden="true"
    >
      <path
        d="M14 3.25C10.55 3.25 6.5 9.85 6.5 16.25C6.5 20.65 9.8 24.25 14 24.25C18.2 24.25 21.5 20.65 21.5 16.25C21.5 9.85 17.45 3.25 14 3.25Z"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinejoin="round"
      />
      <circle cx="14" cy="8.5" r="1.4" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M11.6 15.6C12.35 16.35 12.35 17.65 11.6 18.4M14.2 14.3C15.6 15.7 15.6 18.3 14.2 19.7M16.7 13C18.8 15.1 18.8 18.9 16.7 21"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function KeysBadgesSection({ config, details, agencies, pageHref, agenciesHref }: KeysBadgesSectionProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const prefersReducedMotion = Boolean(useReducedMotion());
  const reveal = (delay: number) => ({
    initial: prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: REVEAL_VIEWPORT,
    transition: { duration: prefersReducedMotion ? 0 : 0.5, delay: prefersReducedMotion ? 0 : delay, ease: REVEAL_EASE },
  });

  return (
    <section
      id="04_Cles_Badges"
      data-section="04_Cles_Badges"
      aria-labelledby="04_Cles_Badges-title"
      className="w-full bg-[#F7F5F0] text-[#1C1F21] border-b border-[#B79A62]/45 scroll-mt-[74px] lg:scroll-mt-[88px]"
    >
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10 py-16 sm:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-stretch">
          {/* Photo en boutique */}
          <motion.div {...reveal(0)} className="lg:col-span-5">
            <div className="group relative h-full min-h-[300px] w-full overflow-hidden rounded-xl border border-[#1C1F21]/12 bg-[#EAE6DC]">
              {!imageFailed ? (
                <img
                  src={config.imageSrc}
                  alt={config.imageAlt}
                  referrerPolicy="no-referrer"
                  onError={() => setImageFailed(true)}
                  className="absolute inset-0 h-full w-full object-cover object-[45%_50%] transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
                  <KeyRound className="h-10 w-10 text-[#7D612D]" strokeWidth={1.5} aria-hidden="true" />
                  <p className="font-display text-lg font-medium text-[#1C1F21]">Reproduction de clés &amp; badges en boutique</p>
                </div>
              )}
              <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#1C1F21]/70 to-transparent" />
              <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-lg bg-[#1C1F21]/85 px-3.5 py-2 text-[13px] font-medium text-[#F3F0E7] backdrop-blur-sm">
                <Store className="h-4 w-4 text-[#B79A62]" aria-hidden="true" />
                En boutique · République &amp; Lodi
              </span>
            </div>
          </motion.div>

          {/* Contenu */}
          <div className="lg:col-span-7 flex flex-col">
            <motion.div {...reveal(0.05)}>
              <p className="section-kicker text-[#7D612D]">{config.kicker}</p>
              <h2 id="04_Cles_Badges-title" className="mt-3 section-title text-[#1C1F21]">
                <span className="block">{config.headlineLines[0]}</span>
                <span className="block">{config.headlineLines[1]}</span>
              </h2>
            </motion.div>

            {/* Deux services */}
            <motion.ul {...reveal(0.1)} aria-label="Services de reproduction en boutique" className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {details.services.map((service) => (
                <li key={service.title} className="flex gap-4 rounded-xl border border-[#1C1F21]/12 bg-[#FFFFFF] p-5 transition-colors duration-200 hover:border-[#B79A62]">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-[#B79A62]/45 bg-[#F7F5F0]">
                    <ServiceIcon icon={service.icon} />
                  </span>
                  <div>
                    <p className="font-display text-[17px] font-semibold text-[#1C1F21]">{service.title}</p>
                    <p className="mt-1 text-[14.5px] leading-[1.55] text-[#1C1F21]/70">{service.text}</p>
                  </div>
                </li>
              ))}
            </motion.ul>

            {/* Comment ça marche (version courte) */}
            <motion.ol {...reveal(0.15)} aria-label={details.stepsKicker} className="mt-6 grid grid-cols-3 border-y border-[#1C1F21]/10 py-5">
              {details.steps.map((step, index) => (
                <li
                  key={step.title}
                  className={`flex flex-col items-center gap-1.5 px-1.5 text-center sm:flex-row sm:items-center sm:gap-3 sm:px-0 sm:text-left ${
                    index > 0 ? 'border-l border-[#1C1F21]/10 sm:pl-5' : ''
                  } sm:pr-4`}
                >
                  <span className="font-display text-[22px] font-semibold leading-none tabular-nums text-[#B79A62]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="text-[12.5px] sm:text-[14.5px] font-medium leading-snug text-[#1C1F21]/85">{step.title}</span>
                </li>
              ))}
            </motion.ol>

            {/* Agences + actions */}
            <motion.div {...reveal(0.2)} className="mt-6 flex flex-col gap-6">
              <ul aria-label="Nos boutiques" className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap">
                {agencies.map((agency) => (
                  <li key={agency.id} className="flex items-center gap-2 rounded-xl border border-[#1C1F21]/15 bg-[#FFFFFF] px-3 py-2.5 text-[13.5px] text-[#1C1F21]/80 sm:inline-flex sm:rounded-full sm:px-3.5 sm:py-1.5 sm:text-[14px]">
                    <MapPin className="h-4 w-4 shrink-0 text-[#7D612D]" aria-hidden="true" />
                    <span className="flex min-w-0 flex-col leading-tight sm:flex-row sm:gap-1.5">
                      <span className="font-medium text-[#1C1F21]">{agency.name.replace('Agence ', '')}</span>
                      <span className="text-[12px] text-[#1C1F21]/55 sm:text-[14px]">{agency.districtLabel}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={pageHref}
                  className="group inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-lg bg-[#1C1F21] hover:bg-[#292D2F] active:bg-[#171A1C] px-7 py-3 text-[15px] sm:text-[16px] font-semibold text-[#F3F0E7] whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7D612D]"
                >
                  Découvrir Clés &amp; badges
                  <ArrowRight className="h-[18px] w-[18px] shrink-0 text-[#B79A62] transition-transform duration-150 group-hover:translate-x-1" strokeWidth={2} aria-hidden="true" />
                </a>
                <a
                  href={agenciesHref}
                  className="inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-lg border border-[#1C1F21]/25 hover:border-[#1C1F21] hover:bg-[#1C1F21]/5 px-7 py-3 text-[15px] sm:text-[16px] font-medium text-[#1C1F21] whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7D612D]"
                >
                  {config.ctaLabel}
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
