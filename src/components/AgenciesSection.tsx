import { useState } from 'react';
import { Clock, KeyRound, MapPin, Navigation, Phone } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import type { AgenciesConfig, AgencyItem } from '../data/sectionsContent';
import type { BrandConfig } from '../utils/navigation';
import { buildCardRevealMotion, REVEAL_VIEWPORT } from '../utils/scrollReveal';

interface AgenciesSectionProps {
  readonly config: AgenciesConfig;
  readonly brand: BrandConfig;
}

/**
 * Architectural Haussmannian storefront line-art placeholder shown inside the arched
 * vitrine until real agency photographs are supplied.
 */
function StorefrontArchPlaceholder({
  agencyName,
  placeholderLabel,
}: {
  readonly agencyName: string;
  readonly placeholderLabel: string;
}) {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-end overflow-hidden bg-[radial-gradient(ellipse_at_50%_22%,rgba(183,154,98,0.18),rgba(34,38,41,0.92)_58%,rgba(28,31,33,1)_100%)] px-6 pb-8 pt-10 text-center">
      {/* Subtle Haussmannian facade elevation lines */}
      <svg
        viewBox="0 0 360 210"
        fill="none"
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[86%] w-full opacity-55"
      >
        {/* Outer stone arcade arch */}
        <path
          d="M 52 210 L 52 110 C 52 44 109 12 180 12 C 251 12 308 44 308 110 L 308 210"
          stroke="#B79A62"
          strokeOpacity="0.32"
          strokeWidth="1.2"
        />
        {/* Inner storefront glazing arch */}
        <path
          d="M 74 210 L 74 114 C 74 60 121 30 180 30 C 239 30 286 60 286 114 L 286 210"
          stroke="#F3F0E7"
          strokeOpacity="0.14"
          strokeWidth="1"
        />
        {/* Transom lintel & double boutique door */}
        <line x1="74" y1="112" x2="286" y2="112" stroke="#B79A62" strokeOpacity="0.28" strokeWidth="1" />
        <line x1="142" y1="112" x2="142" y2="210" stroke="#F3F0E7" strokeOpacity="0.14" strokeWidth="1" />
        <line x1="218" y1="112" x2="218" y2="210" stroke="#F3F0E7" strokeOpacity="0.14" strokeWidth="1" />
        <line x1="180" y1="112" x2="180" y2="210" stroke="#B79A62" strokeOpacity="0.22" strokeWidth="1" />
        {/* Brass door handles */}
        <line x1="173" y1="154" x2="173" y2="174" stroke="#B79A62" strokeOpacity="0.55" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="187" y1="154" x2="187" y2="174" stroke="#B79A62" strokeOpacity="0.55" strokeWidth="1.8" strokeLinecap="round" />
        {/* Subtle stonework horizon lines */}
        <line x1="18" y1="112" x2="52" y2="112" stroke="#F3F0E7" strokeOpacity="0.08" strokeWidth="1" />
        <line x1="308" y1="112" x2="342" y2="112" stroke="#F3F0E7" strokeOpacity="0.08" strokeWidth="1" />
      </svg>

      {/* Center brass monogram medallion */}
      <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-[#B79A62]/45 bg-[#1C1F21]/85 shadow-[0_0_32px_rgba(183,154,98,0.22)]">
        <KeyRound className="h-5 w-5 text-[#D2B478]" strokeWidth={1.6} aria-hidden="true" />
      </div>

      <p className="relative z-10 mt-3.5 text-[12px] font-medium uppercase tracking-[0.2em] text-[#D2B478]/90">
        {agencyName}
      </p>
      <p className="relative z-10 mt-1 text-[13px] italic text-[#F3F0E7]/65">
        {placeholderLabel}
      </p>
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
      className={`group flex flex-col justify-between will-change-transform ${
        index === 0 ? 'lg:pr-12 xl:pr-16' : 'pt-12 lg:pt-0 lg:pl-12 xl:pl-16'
      }`}
    >
      <div>
        {/* Vitrine sculpturale en arche haussmannienne (rompt le rythme rectangulaire du site) */}
        <div className="relative mx-auto w-full max-w-[460px] lg:max-w-none">
          {/* Halo laiton discret derrière l'arche */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-x-4 -top-4 h-36 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(183,154,98,0.16),transparent_70%)] blur-2xl"
          />

          <div className="relative h-[225px] sm:h-[250px] overflow-hidden rounded-t-[170px] rounded-b-[24px] ring-1 ring-[#B79A62]/32 transition-all duration-300 group-hover:ring-[#D2B478]/55">
            {hasPhoto ? (
              <img
                src={agency.imageSrc}
                alt={agency.imageAlt}
                referrerPolicy="no-referrer"
                onError={() => setImageFailed(true)}
                className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              />
            ) : (
              <StorefrontArchPlaceholder
                agencyName={agency.name}
                placeholderLabel={agency.photoPlaceholderLabel}
              />
            )}

            {/* Fondu doux du bas de la vitrine vers le fond anthracite (zéro coupure brutale) */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#1C1F21] via-[#1C1F21]/55 to-transparent"
            />
          </div>
        </div>

        {/* Contenu éditorial ouvert directement sur le fond anthracite (sans cadre rectangulaire) */}
        <div className="mt-7">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h3 className="font-display text-[23px] sm:text-[26px] font-semibold uppercase tracking-[0.04em] text-[#D2B478]">
              {agency.name}
            </h3>
            <span className="inline-flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-[0.16em] text-[#F3F0E7]/72">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#B79A62]" />
              {agency.districtLabel}
            </span>
          </div>

          <div className="mt-4 h-px w-full bg-gradient-to-r from-[#B79A62]/40 via-[#F3F0E7]/10 to-transparent" />

          <ul className="mt-5 flex flex-col gap-3.5 text-[15px] sm:text-[16px] leading-[1.5]">
            <li className="flex items-start gap-3.5">
              <MapPin
                className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#B79A62]"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              <div
                className={
                  agency.isAddressPending ? 'italic text-[#F3F0E7]/68' : 'text-[#F3F0E7]/94'
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
                className="h-[18px] w-[18px] shrink-0 text-[#B79A62]"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              {hasPhone ? (
                <a
                  href={agency.phoneHref}
                  className="text-[#F3F0E7]/94 hover:text-[#D2B478] transition-colors duration-150 tabular-nums font-medium"
                >
                  {agency.phoneDisplay}
                </a>
              ) : (
                <span className="italic text-[#F3F0E7]/68">{agency.phoneDisplay}</span>
              )}
            </li>

            <li className="flex items-start gap-3.5">
              <Clock
                className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#B79A62]"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              <div>
                <p className="text-[14px] font-medium text-[#F3F0E7]">{agency.hoursTitle}</p>
                <p
                  className={`mt-0.5 text-[14px] sm:text-[15px] ${
                    agency.isHoursPending ? 'italic text-[#F3F0E7]/68' : 'text-[#F3F0E7]/85'
                  }`}
                >
                  {agency.hoursLabel}
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Actions organiques en pilules laiton & contour doré (en harmonie avec l'arche) */}
      <div className="mt-7">
        <div className="flex flex-wrap items-center gap-3.5">
          {hasPhone ? (
            <a
              href={agency.phoneHref}
              aria-label={`Appeler ${agency.name} au ${agency.phoneDisplay}`}
              className="group/btn relative overflow-hidden inline-flex min-h-[48px] flex-1 sm:flex-initial sm:min-w-[168px] items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-[#B79A62] via-[#C9AD74] to-[#B79A62] hover:from-[#C6AA73] hover:to-[#D5BA82] px-6 py-2.5 text-[15px] font-semibold text-[#1C1F21] whitespace-nowrap transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F3F0E7]"
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
              className="group/btn relative overflow-hidden inline-flex min-h-[48px] flex-1 sm:flex-initial sm:min-w-[168px] items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-[#B79A62] via-[#C9AD74] to-[#B79A62] hover:from-[#C6AA73] hover:to-[#D5BA82] px-6 py-2.5 text-[15px] font-semibold text-[#1C1F21] whitespace-nowrap transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F3F0E7] cursor-pointer"
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
              className="group/nav inline-flex min-h-[48px] flex-1 sm:flex-initial sm:min-w-[168px] items-center justify-center gap-2.5 rounded-full border border-[#B79A62]/60 bg-transparent hover:border-[#D2B478] hover:bg-[#B79A62]/10 px-6 py-2.5 text-[15px] font-medium text-[#F3F0E7] whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79A62]"
            >
              <Navigation
                className="h-4 w-4 shrink-0 text-[#D2B478] transition-transform duration-200 group-hover/nav:translate-x-0.5 group-hover/nav:-translate-y-0.5"
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
              className="group/nav inline-flex min-h-[48px] flex-1 sm:flex-initial sm:min-w-[168px] items-center justify-center gap-2.5 rounded-full border border-[#B79A62]/60 bg-transparent hover:border-[#D2B478] hover:bg-[#B79A62]/10 px-6 py-2.5 text-[15px] font-medium text-[#F3F0E7] whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79A62] cursor-pointer"
            >
              <Navigation
                className="h-4 w-4 shrink-0 text-[#D2B478] transition-transform duration-200 group-hover/nav:translate-x-0.5 group-hover/nav:-translate-y-0.5"
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
            className="mt-3.5 text-[13px] italic text-[#F3F0E7]/72 leading-relaxed"
          >
            Numéro direct de {agency.name} à compléter — standard principal joignable au{' '}
            <a
              href={brand.phoneHref}
              className="not-italic font-semibold text-[#D2B478] hover:underline tabular-nums"
            >
              {brand.phoneDisplay}
            </a>
            .
          </p>
        )}

        {pendingActionNotice === 'maps' && (
          <p
            role="status"
            className="mt-3.5 text-[13px] italic text-[#F3F0E7]/72 leading-relaxed"
          >
            Adresse exacte de {agency.name} à compléter avant publication pour activer l’itinéraire.
          </p>
        )}
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
      className="relative w-full overflow-hidden bg-[#1C1F21] border-t border-[#B79A62]/45 scroll-mt-[74px] lg:scroll-mt-[88px]"
    >
      {/* Lueur ambiante très douce en arrière-plan pour souligner la profondeur sans encadré */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[360px] bg-[radial-gradient(ellipse_60%_55%_at_50%_0%,rgba(183,154,98,0.09),transparent_72%)]"
      />

      <div className="relative mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10 py-18 sm:py-22 lg:py-26">
        <motion.div
          initial={headingReveal.initial}
          whileInView={headingReveal.visible}
          viewport={REVEAL_VIEWPORT}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-[13px] sm:text-[14px] font-medium uppercase tracking-[0.2em] text-[#B79A62]">
            {config.kicker}
          </p>
          <h2
            id="10_Nos_Agences-title"
            className="mt-3 font-display text-[32px] sm:text-[40px] lg:text-[46px] font-semibold leading-[1.12] tracking-[-0.02em] text-[#F3F0E7]"
          >
            {config.title}
          </h2>
          <p className="mt-4 text-[15px] sm:text-[17px] leading-[1.6] text-[#F3F0E7]/76">
            {config.subtitle}
          </p>
        </motion.div>

        {/* Mise en page éditoriale ouverte en 2 colonnes séparées par un filet laiton (zéro carte rectangulaire) */}
        <div className="mt-14 lg:mt-16 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#B79A62]/22">
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
