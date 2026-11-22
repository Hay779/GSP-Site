import { useState } from 'react';
import { ArrowRight, HandHelping, KeyRound, MapPin, Search, Settings, Store } from 'lucide-react';
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

const KB_IMAGES = {
  keys: '/src/assets/images/kb_cles.jpg',
  badge: '/src/assets/images/kb_badge.jpg',
  facades: {
    republique: '/src/assets/images/kb_facade_republique.jpg',
    rome: '/src/assets/images/kb_facade_rome.jpg',
  } as Record<string, string>,
};

const STEP_ICONS = [HandHelping, Search, Settings] as const;

export function KeysBadgesSection({ config, details, agencies, pageHref, agenciesHref }: KeysBadgesSectionProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const prefersReducedMotion = Boolean(useReducedMotion());
  const reveal = (delay: number) => ({
    initial: prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: REVEAL_VIEWPORT,
    transition: { duration: prefersReducedMotion ? 0 : 0.5, delay: prefersReducedMotion ? 0 : delay, ease: REVEAL_EASE },
  });
  const productImages = [KB_IMAGES.keys, KB_IMAGES.badge];

  return (
    <section
      id="04_Cles_Badges"
      data-section="04_Cles_Badges"
      aria-labelledby="04_Cles_Badges-title"
      className="w-full bg-[#F7F5F0] text-[#1C1F21] border-b border-[#B79A62]/45 scroll-mt-[74px] lg:scroll-mt-[88px]"
    >
      <div className="mx-auto max-w-[1280px] lg:px-10 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-14 lg:items-stretch">
          {/* Photo : pleine largeur avec courbe dorée sur mobile, carte arrondie sur ordinateur */}
          <motion.div {...reveal(0)} className="lg:col-span-5">
            <div className="kb-curve group relative h-[260px] w-full overflow-hidden bg-[#1C1F21] sm:h-[340px] lg:h-full lg:min-h-[520px] lg:rounded-xl">
              {!imageFailed ? (
                <img
                  src={config.imageSrc}
                  alt={config.imageAlt}
                  referrerPolicy="no-referrer"
                  onError={() => setImageFailed(true)}
                  className="absolute inset-0 h-full w-full object-cover object-[45%_45%] transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center">
                  <KeyRound className="h-10 w-10 text-[#B79A62]" strokeWidth={1.5} aria-hidden="true" />
                </div>
              )}
              <span className="absolute bottom-9 left-5 inline-flex items-center gap-2 rounded-xl bg-[#1C1F21]/85 px-4 py-2.5 text-[14px] font-medium text-[#F3F0E7] backdrop-blur-sm sm:left-8 lg:bottom-5 lg:left-5">
                <Store className="h-[18px] w-[18px] text-[#B79A62]" aria-hidden="true" />
                En boutique · République &amp; Rome
              </span>
            </div>
          </motion.div>

          {/* Contenu */}
          <div className="lg:col-span-7 flex flex-col px-5 pt-2 pb-14 sm:px-8 lg:px-0 lg:py-0">
            <motion.div {...reveal(0.05)}>
              <p className="section-kicker text-[#7D612D]">{config.kicker}</p>
              <h2 id="04_Cles_Badges-title" className="mt-2 font-display text-[29px] sm:text-[36px] lg:text-[42px] font-semibold leading-[1.1] tracking-[-0.015em] text-[#1C1F21]">
                {config.headlineLines[0]} {config.headlineLines[1]}
              </h2>
              <p className="mt-3 text-[15.5px] sm:text-[17px] leading-[1.55] text-[#1C1F21]/65">{config.subtitle}</p>
            </motion.div>

            {/* Deux services illustrés */}
            <motion.ul {...reveal(0.1)} aria-label="Services de reproduction en boutique" className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
              {details.services.map((service, index) => (
                <li
                  key={service.title}
                  className="flex flex-col overflow-hidden rounded-2xl border border-[#1C1F21]/10 bg-gradient-to-b from-[#FFFFFF] to-[#F1ECE1] shadow-[0_10px_28px_rgba(28,31,33,0.06)] transition-colors duration-200 hover:border-[#B79A62]"
                >
                  <div className="flex flex-col gap-3 p-3.5 sm:flex-row sm:p-5">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#B79A62]/45 bg-[#F7F2E7] sm:h-14 sm:w-14">
                      <ServiceIcon icon={service.icon} />
                    </span>
                    <div>
                      <p className="font-display text-[16px] font-semibold leading-tight text-[#1C1F21] sm:text-[19px]">{service.title}</p>
                      <p className="mt-1 text-[13px] leading-[1.45] text-[#1C1F21]/65 sm:text-[14.5px]">{service.text}</p>
                    </div>
                  </div>
                  <img src={productImages[index]} alt="" loading="lazy" className="mt-auto h-[92px] w-full object-cover object-center mix-blend-multiply sm:h-[130px]" />
                </li>
              ))}
            </motion.ul>

            {/* Comment ça marche : carte unique en 3 colonnes */}
            <motion.ol
              {...reveal(0.15)}
              aria-label={details.stepsKicker}
              className="mt-4 grid grid-cols-3 rounded-2xl border border-[#1C1F21]/10 bg-[#FBF9F4] py-4"
            >
              {details.steps.map((step, index) => {
                const Icon = STEP_ICONS[index] ?? KeyRound;
                return (
                  <li
                    key={step.title}
                    className={`flex flex-col items-start gap-1 px-3 sm:flex-row sm:items-center sm:gap-3 sm:px-5 ${index > 0 ? 'border-l border-[#1C1F21]/10' : ''}`}
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="h-6 w-6 shrink-0 text-[#7D612D] sm:h-8 sm:w-8" strokeWidth={1.5} aria-hidden="true" />
                      <span className="font-display text-[22px] font-semibold leading-none tabular-nums text-[#B79A62] sm:text-[26px]">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </span>
                    <span className="text-[12.5px] font-medium leading-snug text-[#1C1F21]/85 sm:text-[14.5px]">{step.title}</span>
                  </li>
                );
              })}
            </motion.ol>

            {/* Boutiques avec façade */}
            <motion.ul {...reveal(0.2)} aria-label="Nos boutiques" className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
              {agencies.map((agency) => {
                const facade = KB_IMAGES.facades[agency.id];
                return (
                  <li key={agency.id}>
                    <a
                      href={agency.directionsUrl || agenciesHref}
                      {...(agency.directionsUrl ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className="relative flex h-[64px] items-center gap-2.5 overflow-hidden rounded-xl border border-[#1C1F21]/10 bg-[#FFFFFF] pl-3 transition-colors duration-200 hover:border-[#B79A62] sm:h-[72px] sm:pl-4"
                    >
                      {facade && (
                        <img src={facade} alt="" loading="lazy" className="absolute inset-y-0 right-0 h-full w-[48%] object-cover" />
                      )}
                      <span aria-hidden="true" className="absolute inset-y-0 right-0 w-[60%] bg-gradient-to-r from-[#FFFFFF] via-[#FFFFFF]/70 to-transparent" />
                      <MapPin className="relative h-5 w-5 shrink-0 text-[#7D612D]" strokeWidth={1.7} aria-hidden="true" />
                      <span className="relative flex flex-col leading-tight">
                        <span className="text-[15px] font-semibold text-[#1C1F21]">{agency.name.replace('Agence ', '')}</span>
                        <span className="text-[13px] text-[#1C1F21]/60">{agency.districtLabel}</span>
                      </span>
                    </a>
                  </li>
                );
              })}
            </motion.ul>

            {/* Actions */}
            <motion.div {...reveal(0.25)} className="mt-5 flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
              <a
                href={pageHref}
                className="group inline-flex min-h-[52px] w-full items-center justify-center gap-3 rounded-xl bg-[#1C1F21] px-8 text-[16px] font-medium text-[#F3F0E7] hover:bg-[#292D2F] transition-colors duration-150 sm:w-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7D612D]"
              >
                Découvrir le service
                <ArrowRight className="h-5 w-5 text-[#B79A62] transition-transform duration-150 group-hover:translate-x-1" strokeWidth={2} aria-hidden="true" />
              </a>
              <a href={agenciesHref} className="border-b-[1.5px] border-[#B79A62] pb-0.5 text-[15px] font-medium text-[#1C1F21] hover:text-[#7D612D]">
                {config.ctaLabel}
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
