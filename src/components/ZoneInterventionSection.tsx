import { useState } from 'react';
import { ArrowUpRight, CheckCircle2, Info, MapPin, Search } from 'lucide-react';
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

  return (
    <section
      id="09_Zone_Intervention"
      data-section="09_Zone_Intervention"
      aria-labelledby="09_Zone_Intervention-title"
      className="w-full bg-[#1C1F21] border-t border-[#B79A62]/45 scroll-mt-[74px] lg:scroll-mt-[88px]"
    >
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10 py-16 sm:py-20 lg:py-24">
        {/* En-tête pleine largeur aligné sur la maquette */}
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={REVEAL_VIEWPORT}
          transition={{ duration: prefersReducedMotion ? 0 : 0.5, ease: REVEAL_EASE }}
          className="max-w-3xl"
        >
          <p className="section-kicker text-[#B79A62]">{config.kicker}</p>
          <h2
            id="09_Zone_Intervention-title"
            className="mt-3 section-title text-[#F3F0E7]"
          >
            {config.title}
          </h2>
          <p className="mt-4 section-subtitle text-[#F3F0E7]/76">
            {config.subtitle}
          </p>
        </motion.div>

        {/* Grille 2 colonnes équilibrée : cartes secteurs à gauche, carte lumineuse à droite */}
        <div className="mt-9 sm:mt-11 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Colonne gauche : 2 cartes encadrées + 2 boutons d'action */}
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={REVEAL_VIEWPORT}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.55,
              delay: prefersReducedMotion ? 0 : 0.06,
              ease: REVEAL_EASE,
            }}
            className="lg:col-span-5 flex flex-col justify-between gap-5"
          >
            <div className="flex flex-col gap-5">
              {/* Vérification du secteur : toujours visible, réponse en direct */}
<div className="rounded-xl border border-[#B79A62]/45 bg-[#23272A] p-5 sm:p-6">
                  <label htmlFor="sector-check-input" className="flex items-center gap-2.5 font-display text-[17px] sm:text-[18.5px] font-semibold text-[#F3F0E7]">
                    <Search className="h-[18px] w-[18px] text-[#B79A62]" strokeWidth={2} aria-hidden="true" />
                    Votre adresse est-elle couverte ?
                  </label>
                  <p className="mt-1.5 text-[14px] text-[#F3F0E7]/65">Quartier, commune ou code postal.</p>
                  <form onSubmit={handleVerifySubmit} className="mt-3.5 flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <input
                        id="sector-check-input"
                        type="text"
                        value={query}
                        onChange={(e) => handleQueryChange(e.target.value)}
                        placeholder="Ex. 13002, Lodi, Allauch, 13170…"
                        className="w-full min-h-[44px] rounded-lg border border-[#F3F0E7]/20 bg-[#15181A] px-3.5 py-2 text-[14px] text-[#F3F0E7] placeholder:text-[#F3F0E7]/42 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B79A62]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#B79A62] hover:bg-[#C6AA73] px-5 py-2 text-[14px] font-semibold text-[#1C1F21] whitespace-nowrap transition-colors duration-150 cursor-pointer"
                    >
                      <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>Vérifier</span>
                    </button>
                  </form>

                  {checkResult && (
                    <div
                      role="status"
                      className="mt-3.5 flex flex-col gap-2.5 border-t border-[#F3F0E7]/10 pt-3.5"
                    >
                      <div className="flex items-start gap-2.5 text-[14px] leading-relaxed text-[#F3F0E7]/88">
                        {checkResult.status === 'covered' ? (
                          <CheckCircle2
                            className="mt-0.5 h-4 w-4 shrink-0 text-[#B79A62]"
                            aria-hidden="true"
                          />
                        ) : (
                          <Info
                            className="mt-0.5 h-4 w-4 shrink-0 text-[#B79A62]"
                            aria-hidden="true"
                          />
                        )}
                        <span>{checkResult.message}</span>
                      </div>

                      {checkResult.status !== 'empty' && (
                        <div>
                          <button
                            type="button"
                            onClick={() =>
                              onRequestQuoteForDistrict(
                                checkResult.matchedLabel ?? query.trim()
                              )
                            }
                            className="text-[14px] font-medium text-[#B79A62] hover:text-[#D4B77E] underline underline-offset-4 cursor-pointer"
                          >
                            Demander un devis pour ce secteur
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

              {/* Secteurs couverts : une seule carte, quartiers et communes en pastilles cliquables */}
              <div className="rounded-xl border border-[#B79A62]/35 bg-[#15181A]/90 p-5 sm:p-6">
                {[
                  {
                    label: config.marseilleLabel,
                    aria: 'Secteurs de Marseille',
                    items: [config.marseilleRangeLabel, ...config.marseilleSectors],
                  },
                  { label: config.neighboringLabel, aria: 'Villes et communes voisines', items: config.neighboringCommunes },
                ].map((group, groupIndex) => (
                  <div key={group.label} className={groupIndex > 0 ? 'mt-5 border-t border-[#F3F0E7]/10 pt-5' : ''}>
                    <h3 className="flex items-center gap-2.5 font-display text-[16.5px] sm:text-[18px] font-semibold tracking-[-0.01em] text-[#F3F0E7]">
                      <MapPin className="h-[17px] w-[17px] text-[#B79A62]" strokeWidth={2} aria-hidden="true" />
                      {group.label}
                    </h3>
                    <ul aria-label={group.aria} className="mt-3 flex flex-wrap gap-2">
                      {group.items.map((item) => {
                        const isSelected = selectedSector === item;
                        return (
                          <li key={item}>
                            <button
                              type="button"
                              onClick={() => handleSelectSector(item)}
                              aria-pressed={isSelected}
                              className={`inline-flex min-h-[36px] items-center rounded-full border px-3.5 text-[14px] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79A62] cursor-pointer ${
                                isSelected
                                  ? 'border-[#B79A62] bg-[#B79A62] text-[#1C1F21] font-semibold'
                                  : 'border-[#F3F0E7]/18 text-[#F3F0E7]/86 hover:border-[#B79A62]/70 hover:text-[#F3F0E7]'
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
              </div>
            </div>
            {/* Deux boutons d'action en bas à gauche */}
            <div>
              <div className="flex flex-col sm:flex-row gap-3">

                <button
                  type="button"
                  onClick={() => onRequestQuoteForDistrict(selectedSector ?? undefined)}
                  className="group inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-lg bg-[#B79A62] hover:bg-[#C6AA73] active:bg-[#A68952] px-5 py-3 text-[15px] font-semibold text-[#1C1F21] whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F3F0E7] cursor-pointer"
                >
                  <ArrowUpRight
                    className="h-4 w-4 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  <span>{config.quoteCtaLabel}</span>
                </button>
              </div>

            </div>
          </motion.div>

          {/* Colonne droite : carte interactive lumineuse Marseille & région */}
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={REVEAL_VIEWPORT}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.58,
              delay: prefersReducedMotion ? 0 : 0.14,
              ease: REVEAL_EASE,
            }}
            className="order-first lg:order-none lg:col-span-7 flex lg:sticky lg:top-28"
          >
            <MarseilleRadarMap
              activePinId={activePinId}
              selectedSector={selectedSector}
              responseTimePrefix={config.responseTimePrefix}
              responseTimeHighlight={config.responseTimeHighlight}
              onSelectPin={handleSelectSector}
              onClearSelection={() => {
                setSelectedSector(null);
                setQuery('');
              }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
