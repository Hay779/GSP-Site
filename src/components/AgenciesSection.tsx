import { useState } from 'react';
import { Clock, MapPin, Navigation, Phone } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import type { AgenciesConfig, AgencyItem } from '../data/sectionsContent';
import type { BrandConfig } from '../utils/navigation';
import { buildCardRevealMotion, REVEAL_VIEWPORT } from '../utils/scrollReveal';

interface AgenciesSectionProps {
  readonly config: AgenciesConfig;
  readonly brand: BrandConfig;
}

/**
 * Visuel de remplacement (vitrine en trait laiton) affiché tant que la vraie photo
 * de la façade n'est pas fournie.
 */
function StorefrontPlaceholder({
  agencyName,
  placeholderLabel,
}: {
  readonly agencyName: string;
  readonly placeholderLabel: string;
}) {
  return (
    <div
      role="img"
      aria-label={`${agencyName} — ${placeholderLabel}`}
      className="relative h-full w-full overflow-hidden bg-[#1C1F21]"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_50%_100%,rgba(183,154,98,0.22),transparent_70%)]"
      />
      <svg
        viewBox="0 0 400 220"
        fill="none"
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 mx-auto h-[82%] w-auto max-w-full"
      >
        {/* Sol */}
        <line x1="20" y1="214" x2="380" y2="214" stroke="#B79A62" strokeOpacity="0.35" />
        {/* Façade */}
        <rect x="80" y="40" width="240" height="174" stroke="#F3F0E7" strokeOpacity="0.16" />
        {/* Enseigne */}
        <rect x="104" y="58" width="192" height="26" rx="2" stroke="#B79A62" strokeOpacity="0.7" />
        <line x1="132" y1="71" x2="268" y2="71" stroke="#B79A62" strokeOpacity="0.5" strokeDasharray="2 5" />
        {/* Store / auvent */}
        <path d="M 96 96 L 304 96 L 292 116 L 108 116 Z" stroke="#B79A62" strokeOpacity="0.55" />
        <path d="M 134 96 L 130 116 M 172 96 L 170 116 M 210 96 L 210 116 M 248 96 L 250 116 M 286 96 L 290 116" stroke="#B79A62" strokeOpacity="0.3" />
        {/* Vitrines */}
        <rect x="108" y="128" width="64" height="86" stroke="#F3F0E7" strokeOpacity="0.2" />
        <rect x="228" y="128" width="64" height="86" stroke="#F3F0E7" strokeOpacity="0.2" />
        <path d="M 116 140 L 136 120" stroke="#F3F0E7" strokeOpacity="0.08" />
        {/* Porte et poignée */}
        <rect x="184" y="128" width="32" height="86" stroke="#B79A62" strokeOpacity="0.6" />
        <circle cx="209" cy="172" r="2" fill="#B79A62" fillOpacity="0.8" />
        {/* Clé dans la vitrine */}
        <circle cx="140" cy="166" r="7" stroke="#B79A62" strokeOpacity="0.55" />
        <path d="M 147 166 L 162 166 M 157 166 L 157 172 M 161 166 L 161 170" stroke="#B79A62" strokeOpacity="0.55" />
      </svg>
      <span className="absolute right-3 top-3 rounded-md bg-[#F3F0E7]/10 px-2.5 py-1 text-[11.5px] font-medium text-[#F3F0E7]/75 backdrop-blur-sm">
        {placeholderLabel}
      </span>
    </div>
  );
}

function AgencyShowcase({
  agency,
  index,
  reducedMotion,
  brand,
}: {
  readonly agency: AgencyItem;
  readonly index: number;
  readonly reducedMotion: boolean;
  readonly brand: BrandConfig;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const [pendingActionNotice, setPendingActionNotice] = useState<'phone' | 'maps' | null>(null);

  const hasPhoto = Boolean(agency.imageSrc.trim()) && !imageFailed;
  const hasPhone = Boolean(agency.phoneHref.trim());
  const hasDirections = Boolean(agency.directionsUrl.trim());
  const reveal = buildCardRevealMotion({
    index,
    staggerSeconds: 0.14,
    offsetY: 28,
    duration: 0.62,
    reducedMotion,
  });

  return (
    <motion.article
      initial={reveal.initial}
      whileInView={reveal.visible}
      viewport={REVEAL_VIEWPORT}
      data-testid={`agency-showcase-${agency.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-[#1C1F21]/12 bg-[#FFFFFF] transition-colors duration-200 hover:border-[#B79A62] will-change-transform"
    >
      <div className="relative h-[200px] sm:h-[240px] overflow-hidden">
        {hasPhoto ? (
          <img
            src={agency.imageSrc}
            alt={agency.imageAlt}
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <StorefrontPlaceholder
            agencyName={agency.name}
            placeholderLabel={agency.photoPlaceholderLabel}
          />
        )}
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-md bg-[#1C1F21]/80 px-2.5 py-1 text-[11.5px] font-medium uppercase tracking-[0.14em] text-[#F3F0E7] backdrop-blur-sm">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#B79A62]" />
          {agency.districtLabel}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-8">
        <h3 className="font-display text-[24px] sm:text-[28px] font-semibold leading-[1.2] tracking-[-0.01em] text-[#1C1F21]">
          {agency.name}
        </h3>

        <div className="mt-4 h-px w-full bg-[#1C1F21]/10" />

        <ul className="mt-5 flex flex-col gap-3.5 text-[15px] sm:text-[16px] leading-[1.5]">
          <li className="flex items-start gap-3.5">
            <MapPin
              className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#7D612D]"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <div
              className={
                agency.isAddressPending ? 'italic text-[#1C1F21]/55' : 'text-[#1C1F21]/88'
              }
            >
              {agency.addressLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </div>
          </li>

          <li className="flex items-center gap-3.5">
            <Phone
              className="h-[18px] w-[18px] shrink-0 text-[#7D612D]"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            {hasPhone ? (
              <a
                href={agency.phoneHref}
                className="text-[#1C1F21] hover:text-[#7D612D] transition-colors duration-150 tabular-nums font-medium"
              >
                {agency.phoneDisplay}
              </a>
            ) : (
              <span className="italic text-[#1C1F21]/55">{agency.phoneDisplay}</span>
            )}
          </li>

          <li className="flex items-start gap-3.5">
            <Clock
              className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#7D612D]"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <div>
              <p className="text-[14px] font-medium text-[#1C1F21]">{agency.hoursTitle}</p>
              <p
                className={`mt-0.5 text-[14px] sm:text-[15px] ${
                  agency.isHoursPending ? 'italic text-[#1C1F21]/55' : 'text-[#1C1F21]/75'
                }`}
              >
                {agency.hoursLabel}
              </p>
            </div>
          </li>
        </ul>

        <div className="mt-auto pt-7">
        <div className="flex flex-wrap items-center gap-3.5">
          {hasPhone ? (
            <a
              href={agency.phoneHref}
              aria-label={`Appeler ${agency.name} au ${agency.phoneDisplay}`}
              className="group/btn relative overflow-hidden inline-flex min-h-[48px] flex-1 sm:flex-initial sm:min-w-[168px] items-center justify-center gap-2.5 rounded-lg bg-[#B79A62] hover:bg-[#C6AA73] active:bg-[#A68952] px-6 py-3 text-[15px] font-semibold text-[#1C1F21] whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C1F21]"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-500 ease-out group-hover/btn:translate-x-full"
              />
              <Phone className="relative h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
              <span className="relative">Appeler</span>
            </a>
          ) : (
            <button
              type="button"
              onClick={() =>
                setPendingActionNotice((prev) => (prev === 'phone' ? null : 'phone'))
              }
              aria-label={`Appeler ${agency.name}`}
              aria-expanded={pendingActionNotice === 'phone'}
              className="group/btn relative overflow-hidden inline-flex min-h-[48px] flex-1 sm:flex-initial sm:min-w-[168px] items-center justify-center gap-2.5 rounded-lg bg-[#B79A62] hover:bg-[#C6AA73] active:bg-[#A68952] px-6 py-3 text-[15px] font-semibold text-[#1C1F21] whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C1F21] cursor-pointer"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-500 ease-out group-hover/btn:translate-x-full"
              />
              <Phone className="relative h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
              <span className="relative">Appeler</span>
            </button>
          )}

          {hasDirections ? (
            <a
              href={agency.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Ouvrir l’itinéraire vers ${agency.name}`}
              className="group/nav inline-flex min-h-[48px] flex-1 sm:flex-initial sm:min-w-[168px] items-center justify-center gap-2.5 rounded-lg border border-[#1C1F21]/25 bg-transparent hover:border-[#1C1F21] hover:bg-[#1C1F21]/5 px-6 py-3 text-[15px] font-medium text-[#1C1F21] whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7D612D]"
            >
              <Navigation
                className="h-4 w-4 shrink-0 text-[#7D612D] transition-transform duration-200 group-hover/nav:translate-x-0.5 group-hover/nav:-translate-y-0.5"
                strokeWidth={1.85}
                aria-hidden="true"
              />
              <span>Itinéraire</span>
            </a>
          ) : (
            <button
              type="button"
              onClick={() =>
                setPendingActionNotice((prev) => (prev === 'maps' ? null : 'maps'))
              }
              aria-label={`Itinéraire vers ${agency.name}`}
              aria-expanded={pendingActionNotice === 'maps'}
              className="group/nav inline-flex min-h-[48px] flex-1 sm:flex-initial sm:min-w-[168px] items-center justify-center gap-2.5 rounded-lg border border-[#1C1F21]/25 bg-transparent hover:border-[#1C1F21] hover:bg-[#1C1F21]/5 px-6 py-3 text-[15px] font-medium text-[#1C1F21] whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7D612D] cursor-pointer"
            >
              <Navigation
                className="h-4 w-4 shrink-0 text-[#7D612D] transition-transform duration-200 group-hover/nav:translate-x-0.5 group-hover/nav:-translate-y-0.5"
                strokeWidth={1.85}
                aria-hidden="true"
              />
              <span>Itinéraire</span>
            </button>
          )}
        </div>

        {pendingActionNotice === 'phone' && (
          <p
            role="status"
            className="mt-3.5 text-[13px] italic text-[#1C1F21]/65 leading-relaxed"
          >
            Numéro direct de {agency.name} à compléter — standard principal joignable au{' '}
            <a
              href={brand.phoneHref}
              className="not-italic font-semibold text-[#7D612D] hover:underline tabular-nums"
            >
              {brand.phoneDisplay}
            </a>
            .
          </p>
        )}

        {pendingActionNotice === 'maps' && (
          <p
            role="status"
            className="mt-3.5 text-[13px] italic text-[#1C1F21]/65 leading-relaxed"
          >
            Adresse exacte de {agency.name} à compléter avant publication pour activer l’itinéraire.
          </p>
        )}
        </div>
      </div>
    </motion.article>
  );
}

export function AgenciesSection({ config, brand }: AgenciesSectionProps) {
  const prefersReducedMotion = Boolean(useReducedMotion());
  const headingReveal = buildCardRevealMotion({
    index: 0,
    offsetY: 16,
    duration: 0.48,
    reducedMotion: prefersReducedMotion,
  });

  return (
    <section
      id="10_Nos_Agences"
      data-section="10_Nos_Agences"
      aria-labelledby="10_Nos_Agences-title"
      className="relative w-full overflow-hidden bg-[#F7F5F0] text-[#1C1F21] border-t border-[#B79A62]/45 scroll-mt-[74px] lg:scroll-mt-[88px]"
    >

      <div className="relative mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10 py-16 sm:py-20 lg:py-24">
        <motion.div
          initial={headingReveal.initial}
          whileInView={headingReveal.visible}
          viewport={REVEAL_VIEWPORT}
          className="max-w-2xl"
        >
          <p className="section-kicker text-[#7D612D]">
            {config.kicker}
          </p>
          <h2
            id="10_Nos_Agences-title"
            className="mt-3 section-title text-[#1C1F21]"
          >
            {config.title}
          </h2>
          <p className="mt-4 section-subtitle text-[#1C1F21]/70">
            {config.subtitle}
          </p>
        </motion.div>

        {/* Mise en page éditoriale ouverte en 2 colonnes séparées par un filet laiton (zéro carte rectangulaire) */}
        <div className="mt-10 sm:mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {config.agencies.map((agency, index) => (
            <AgencyShowcase
              key={agency.id}
              agency={agency}
              index={index}
              reducedMotion={prefersReducedMotion}
              brand={brand}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
