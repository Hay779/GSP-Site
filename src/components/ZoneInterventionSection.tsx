import { useState } from 'react';
import { ArrowRight, CheckCircle2, Info, MapPin, Search } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import type { ZoneInterventionConfig } from '../data/sectionsContent';
import {
  checkServiceSector,
  resolveZoneMapFocusPin,
  type SectorCheckResult,
} from '../utils/serviceArea';
import { REVEAL_EASE, REVEAL_VIEWPORT } from '../utils/scrollReveal';
import { MarseilleRadarMap } from './MarseilleRadarMap';

interface ZoneInterventionSectionProps {
  readonly config: ZoneInterventionConfig;
  readonly onRequestQuoteForDistrict: (district?: string) => void;
}

export function ZoneInterventionSection({
  config,
  onRequestQuoteForDistrict,
}: ZoneInterventionSectionProps) {
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [checkResult, setCheckResult] = useState<SectorCheckResult | null>(null);
  const prefersReducedMotion = useReducedMotion() ?? false;

  const activePinId = resolveZoneMapFocusPin(selectedSector);

  const handleSelectSector = (sector: string) => {
    const nextSector = selectedSector === sector ? null : sector;
    setSelectedSector(nextSector);
    setQuery(nextSector ?? '');
    setCheckResult(nextSector ? checkServiceSector(nextSector) : null);
  };

  /** Réponse en direct pendant la saisie (à partir de 2 caractères). */
  const handleQueryChange = (value: string) => {
    setQuery(value);
    setCheckResult(value.trim().length >= 2 ? checkServiceSector(value) : null);
  };

  const handleVerifySubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = checkServiceSector(query);
    setCheckResult(result);
    if (result.status === 'covered' && result.matchedLabel) {
      setSelectedSector(result.matchedLabel);
    }
  };

  const groups = [
    { label: config.marseilleLabel, aria: 'Secteurs de Marseille', items: [config.marseilleRangeLabel, ...config.marseilleSectors] },
    { label: config.neighboringLabel, aria: 'Villes et communes voisines', items: config.neighboringCommunes },
  ];

  return (
    <section
      id="09_Zone_Intervention"
      data-section="09_Zone_Intervention"
      aria-labelledby="09_Zone_Intervention-title"
      className="w-full bg-[#1C1F21] scroll-mt-[74px] lg:scroll-mt-[88px]"
    >
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10 py-14 sm:py-20 lg:py-24">
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={REVEAL_VIEWPORT}
          transition={{ duration: prefersReducedMotion ? 0 : 0.5, ease: REVEAL_EASE }}
          className="max-w-3xl"
        >
          <p className="section-kicker text-[#B79A62]">{config.kicker}</p>
          <h2 id="09_Zone_Intervention-title" className="mt-3 section-title text-[#F3F0E7]">
            {config.title}
          </h2>
          <p className="mt-4 section-subtitle text-[#F3F0E7]/76">{config.subtitle}</p>
        </motion.div>

        {/* Un seul grand panneau clair : carte en couleur + recherche + secteurs */}
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={REVEAL_VIEWPORT}
          transition={{ duration: prefersReducedMotion ? 0 : 0.55, delay: prefersReducedMotion ? 0 : 0.08, ease: REVEAL_EASE }}
          className="mt-8 sm:mt-10 overflow-hidden rounded-3xl bg-[#F7F5F0] lg:grid lg:grid-cols-12"
        >
          <div className="lg:col-span-7 lg:order-2">
            <MarseilleRadarMap
              activePinId={activePinId}
              selectedSector={selectedSector}
              responseTimePrefix={config.responseTimePrefix}
              responseTimeHighlight={config.responseTimeHighlight}
              onSelectPin={handleSelectSector}
              onClearSelection={() => {
                setSelectedSector(null);
                setQuery('');
                setCheckResult(null);
              }}
            />
          </div>

          <div className="lg:col-span-5 lg:order-1 p-5 sm:p-7 lg:p-8">
            {/* Vérification du secteur : champ et bouton sur une ligne */}
            <label htmlFor="sector-check-input" className="font-display text-[17px] sm:text-[18px] font-semibold text-[#1C1F21]">
              Votre adresse est-elle couverte ?
            </label>
            <form
              onSubmit={handleVerifySubmit}
              className="mt-3 flex items-center gap-2 rounded-full border border-[#1C1F21]/15 bg-white p-1.5 pl-4 focus-within:border-[#B79A62]"
            >
              <Search className="h-4 w-4 shrink-0 text-[#7D612D]" strokeWidth={2} aria-hidden="true" />
              <input
                id="sector-check-input"
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder="Ville, quartier, code postal"
                className="min-w-0 flex-1 bg-transparent py-1.5 text-[14px] text-[#1C1F21] placeholder:text-[#1C1F21]/45 focus:outline-none"
              />
              <button
                type="submit"
                className="shrink-0 rounded-full bg-[#1C1F21] px-4 py-2 text-[13.5px] font-semibold text-[#F3F0E7] hover:bg-[#292D2F] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79A62] cursor-pointer"
              >
                Vérifier
              </button>
            </form>
            {checkResult && (
              <div role="status" className="mt-3 flex items-start gap-2 text-[14px] leading-relaxed text-[#1C1F21]/85">
                {checkResult.status === 'covered' ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#2E7D4F]" aria-hidden="true" />
                ) : (
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#7D612D]" aria-hidden="true" />
                )}
                <span>
                  {checkResult.message}
                  {checkResult.status !== 'empty' && (
                    <>
                      {' '}
                      <button
                        type="button"
                        onClick={() => onRequestQuoteForDistrict(checkResult.matchedLabel ?? query.trim())}
                        className="font-medium text-[#7D612D] underline underline-offset-4 hover:text-[#1C1F21] cursor-pointer"
                      >
                        Demander un devis
                      </button>
                    </>
                  )}
                </span>
              </div>
            )}

            {/* Secteurs en pastilles, sans cadre */}
            {groups.map((group) => (
              <div key={group.label} className="mt-6">
                <h3 className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-[#7D612D]">
                  <MapPin className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                  {group.label}
                </h3>
                <ul aria-label={group.aria} className="mt-2.5 flex flex-wrap gap-1.5">
                  {group.items.map((item) => {
                    const isSelected = selectedSector === item;
                    return (
                      <li key={item}>
                        <button
                          type="button"
                          onClick={() => handleSelectSector(item)}
                          aria-pressed={isSelected}
                          className={`inline-flex min-h-[32px] items-center rounded-full px-3 text-[13.5px] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79A62] cursor-pointer ${
                            isSelected
                              ? 'bg-[#C0392B] text-white font-semibold'
                              : 'bg-white text-[#1C1F21]/85 shadow-[0_1px_2px_rgba(28,31,33,0.08)] hover:text-[#1C1F21] hover:shadow-[0_2px_6px_rgba(28,31,33,0.14)]'
                          }`}
                        >
                          {item}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}

            <button
              type="button"
              onClick={() => onRequestQuoteForDistrict(selectedSector ?? undefined)}
              className="group mt-7 inline-flex items-center gap-2 text-[15px] font-semibold text-[#1C1F21] underline decoration-[#B79A62] decoration-2 underline-offset-[6px] hover:text-[#7D612D] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B79A62] rounded cursor-pointer"
            >
              {config.quoteCtaLabel}
              <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
