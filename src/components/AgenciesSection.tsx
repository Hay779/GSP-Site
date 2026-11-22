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
  const reveal = buildCardRevealMotion({ index, offsetY: 18, duration: 0.5, reducedMotion });
  const toggleNotice = (kind: 'phone' | 'maps') =>
    setPendingActionNotice((current) => (current === kind ? null : kind));

  return (
    <motion.article
      initial={reveal.initial}
      whileInView={reveal.visible}
      viewport={REVEAL_VIEWPORT}
      aria-labelledby={`agency-${agency.id}-title`}
      className="rounded-3xl bg-white p-5 sm:p-6 shadow-[0_10px_30px_-18px_rgba(28,31,33,0.35)]"
    >
      {/* En-tête : façade en vignette + quartier et nom */}
      <div className="flex items-center gap-4">
        <div className="h-[84px] w-[112px] sm:h-[96px] sm:w-[132px] shrink-0 overflow-hidden rounded-2xl">
          {hasPhoto ? (
            <img
              src={agency.imageSrc}
              alt={agency.imageAlt}
              loading="lazy"
              onError={() => setImageFailed(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <StorefrontPlaceholder agencyName={agency.name} placeholderLabel={agency.photoPlaceholderLabel} />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7D612D]">{agency.districtLabel}</p>
          <h3
            id={`agency-${agency.id}-title`}
            className="mt-1 font-display text-[22px] sm:text-[24px] font-semibold leading-tight tracking-[-0.01em] text-[#1C1F21]"
          >
            {agency.name}
          </h3>
        </div>
      </div>

      {/* Coordonnées */}
      <ul className="mt-5 space-y-2.5 text-[15px] leading-[1.45]">
        <li className="flex items-start gap-3">
          <MapPin className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#B79A62]" strokeWidth={1.8} aria-hidden="true" />
          <span className={agency.isAddressPending ? 'italic text-[#1C1F21]/50' : 'text-[#1C1F21]/85'}>
            {agency.addressLines.join(', ')}
          </span>
        </li>
        <li className="flex items-start gap-3">
          <Phone className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#B79A62]" strokeWidth={1.8} aria-hidden="true" />
          {hasPhone ? (
            <a href={agency.phoneHref} className="font-medium tabular-nums text-[#1C1F21] hover:text-[#7D612D]">
              {agency.phoneDisplay}
            </a>
          ) : (
            <span className="italic text-[#1C1F21]/50">{agency.phoneDisplay}</span>
          )}
        </li>
        <li className="flex items-start gap-3">
          <Clock className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#B79A62]" strokeWidth={1.8} aria-hidden="true" />
          <span className={agency.isHoursPending ? 'italic text-[#1C1F21]/50' : 'text-[#1C1F21]/85'}>
            {agency.hoursLabel}
          </span>
        </li>
      </ul>

      {/* Actions : pastille Appeler + lien Itinéraire */}
      <div className="mt-5 flex items-center gap-5 border-t border-[#1C1F21]/8 pt-4">
        {hasPhone ? (
          <a
            href={agency.phoneHref}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-[#1C1F21] px-4 text-[14px] font-semibold text-[#F3F0E7] hover:bg-[#292D2F] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79A62]"
          >
            <Phone className="h-4 w-4 text-[#B79A62]" strokeWidth={1.9} aria-hidden="true" />
            Appeler
          </a>
        ) : (
          <button
            type="button"
            onClick={() => toggleNotice('phone')}
            aria-expanded={pendingActionNotice === 'phone'}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-[#1C1F21] px-4 text-[14px] font-semibold text-[#F3F0E7] hover:bg-[#292D2F] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79A62] cursor-pointer"
          >
            <Phone className="h-4 w-4 text-[#B79A62]" strokeWidth={1.9} aria-hidden="true" />
            Appeler
          </button>
        )}
        {hasDirections ? (
          <a
            href={agency.directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Itinéraire vers ${agency.name}`}
            className="inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-[#1C1F21] underline decoration-[#B79A62] decoration-2 underline-offset-[6px] hover:text-[#7D612D]"
          >
            <Navigation className="h-4 w-4 text-[#7D612D]" strokeWidth={1.85} aria-hidden="true" />
            Itinéraire
          </a>
        ) : (
          <button
            type="button"
            onClick={() => toggleNotice('maps')}
            aria-label={`Itinéraire vers ${agency.name}`}
            aria-expanded={pendingActionNotice === 'maps'}
            className="inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-[#1C1F21] underline decoration-[#B79A62] decoration-2 underline-offset-[6px] hover:text-[#7D612D] cursor-pointer"
          >
            <Navigation className="h-4 w-4 text-[#7D612D]" strokeWidth={1.85} aria-hidden="true" />
            Itinéraire
          </button>
        )}
      </div>

      {pendingActionNotice === 'phone' && (
        <p role="status" className="mt-3 text-[13px] italic leading-relaxed text-[#1C1F21]/65">
          Numéro direct de {agency.name} à compléter — standard joignable au{' '}
          <a href={brand.phoneHref} className="not-italic font-semibold tabular-nums text-[#7D612D] hover:underline">
            {brand.phoneDisplay}
          </a>
          .
        </p>
      )}
      {pendingActionNotice === 'maps' && (
        <p role="status" className="mt-3 text-[13px] italic leading-relaxed text-[#1C1F21]/65">
          Adresse exacte de {agency.name} à compléter avant publication pour activer l’itinéraire.
        </p>
      )}
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
      className="relative w-full overflow-hidden bg-[#F7F5F0] text-[#1C1F21] scroll-mt-[74px] lg:scroll-mt-[88px]"
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

        {/* Deux agences côte à côte (empilées sur mobile) */}
        <div className="mt-10 sm:mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
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
