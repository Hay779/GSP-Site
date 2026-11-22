import { useState } from 'react';
import { ArrowRight, KeyRound } from 'lucide-react';
import type { KeysBadgeIconKey, KeysBadgesConfig } from '../data/sectionsContent';
import type { SectionId } from '../utils/navigation';

interface KeysBadgesSectionProps {
  readonly config: KeysBadgesConfig;
  readonly onSelectSection: (sectionId: SectionId) => void;
}

function ServiceIcon({ icon }: { readonly icon: KeysBadgeIconKey }) {
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

export function KeysBadgesSection({
  config,
  onSelectSection,
}: KeysBadgesSectionProps) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <section
      id="04_Cles_Badges"
      data-section="04_Cles_Badges"
      aria-labelledby="04_Cles_Badges-title"
      className="w-full bg-[#F7F5F0] text-[#1C1F21] border-b border-[#B79A62]/45 scroll-mt-[74px] lg:scroll-mt-[88px]"
    >
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10 py-16 sm:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Colonne gauche : photo lumineuse en boutique */}
          <div className="lg:col-span-6">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-[#1C1F21]/12 bg-[#EAE6DC]">
              {!imageFailed ? (
                <img
                  src={config.imageSrc}
                  alt={config.imageAlt}
                  referrerPolicy="no-referrer"
                  onError={() => setImageFailed(true)}
                  className="h-full w-full object-cover object-center"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[#EAE6DC] px-6 text-center">
                  <KeyRound className="h-10 w-10 text-[#7D612D]" strokeWidth={1.5} aria-hidden="true" />
                  <p className="font-display text-lg font-medium text-[#1C1F21]">
                    Reproduction de clés &amp; badges en boutique
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Colonne droite : promesse, deux services et bouton vers les agences */}
          <div className="lg:col-span-6 flex flex-col items-start">
            <p className="text-[13px] sm:text-[14px] font-medium tracking-[0.16em] uppercase text-[#7D612D]">
              {config.kicker}
            </p>

            <h2
              id="04_Cles_Badges-title"
              className="mt-3 font-display text-[30px] sm:text-[36px] lg:text-[42px] font-semibold leading-[1.12] tracking-[-0.015em] text-[#1C1F21]"
            >
              <span className="block">{config.headlineLines[0]}</span>
              <span className="block">{config.headlineLines[1]}</span>
            </h2>

            {/* Deux services clés avec séparateur vertical discret */}
            <ul
              aria-label="Services de reproduction en boutique"
              className="mt-7 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-0 w-full"
            >
              {config.services.map((service, index) => (
                <li
                  key={service.label}
                  className={`flex items-center gap-3.5 text-[16px] sm:text-[17px] font-medium text-[#1C1F21] ${
                    index > 0
                      ? 'sm:border-l sm:border-[#1C1F21]/16 sm:pl-7 sm:ml-7'
                      : ''
                  }`}
                >
                  <ServiceIcon icon={service.icon} />
                  <span>{service.label}</span>
                </li>
              ))}
            </ul>

            <p className="mt-6 text-[16px] sm:text-[17px] leading-[1.6] text-[#1C1F21]/72">
              {config.note}
            </p>

            <div className="mt-8">
              <a
                href={config.ctaHref}
                onClick={() => onSelectSection(config.ctaTargetId)}
                className="group inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-lg bg-[#1C1F21] hover:bg-[#292D2F] active:bg-[#171A1C] px-7 py-3.5 text-[15px] sm:text-[16px] font-semibold text-[#F3F0E7] whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7D612D]"
              >
                <span>{config.ctaLabel}</span>
                <ArrowRight
                  className="h-[18px] w-[18px] shrink-0 text-[#B79A62] transition-transform duration-150 group-hover:translate-x-1"
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
