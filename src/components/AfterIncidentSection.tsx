import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { InsuranceNotice } from './InsuranceNotice';
import type { AfterIncidentConfig } from '../data/sectionsContent';
import { REVEAL_EASE, REVEAL_VIEWPORT } from '../utils/scrollReveal';

interface AfterIncidentSectionProps {
  readonly config: AfterIncidentConfig;
  readonly onDescribeNeed: () => void;
  readonly onSendPhotos: () => void;
}

export function AfterIncidentSection({
  config,
  onDescribeNeed,
  onSendPhotos,
}: AfterIncidentSectionProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const prefersReducedMotion = useReducedMotion() ?? false;

  return (
    <section
      id="07_Apres_Sinistre"
      data-section="07_Apres_Sinistre"
      aria-labelledby="07_Apres_Sinistre-title"
      className="w-full bg-[#1C1F21] scroll-mt-[74px] lg:scroll-mt-[88px]"
    >
      {/* Partie haute : accroche + boutons sur scène photographique avec voile directionnel */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[#1C1F21]" aria-hidden="true">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_40%,rgba(183,154,98,0.14),rgba(41,45,47,0.4)_45%,rgba(28,31,33,1)_85%)]" />
          {!imageFailed && (
            <img
              src={config.imageSrc}
              alt={config.imageAlt}
              referrerPolicy="no-referrer"
              onError={() => setImageFailed(true)}
              className="h-full w-full object-cover object-[70%_20%] lg:object-[72%_18%]"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1F21] via-[#1C1F21]/84 to-[#1C1F21]/50 lg:hidden" />
          <div className="hidden lg:block absolute inset-0 bg-[linear-gradient(90deg,#1C1F21_0%,#1C1F21_32%,rgba(28,31,33,0.92)_46%,rgba(28,31,33,0.44)_62%,rgba(28,31,33,0.14)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#1C1F21] via-[#1C1F21]/45 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10 py-16 sm:py-20 lg:py-24">
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={REVEAL_VIEWPORT}
            transition={{ duration: prefersReducedMotion ? 0 : 0.56, ease: REVEAL_EASE }}
            className="flex flex-col items-start max-w-[540px]"
          >
            <p className="section-kicker text-[#B79A62]">
              {config.kicker}
            </p>

            <h2
              id="07_Apres_Sinistre-title"
              className="mt-3 section-title text-[#F3F0E7]"
            >
              <span className="block">{config.headlineLines[0]}</span>
              <span className="block">{config.headlineLines[1]}</span>
            </h2>

            <p className="mt-4 max-w-[460px] section-subtitle text-[#F3F0E7]/84">
              {config.subtitle}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3.5 sm:gap-4 w-full sm:w-auto">
              <button
                type="button"
                onClick={onDescribeNeed}
                className="group relative overflow-hidden inline-flex min-h-[48px] w-full sm:w-auto items-center justify-center rounded-lg bg-[#B79A62] hover:bg-[#C6AA73] active:bg-[#A68952] px-6 sm:px-7 py-3 text-[15px] sm:text-[16px] font-semibold text-[#1C1F21] whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F3F0E7] cursor-pointer"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-500 ease-out group-hover:translate-x-full"
                />
                <span className="relative">{config.primaryCtaLabel}</span>
              </button>

              <button
                type="button"
                onClick={onSendPhotos}
                className="inline-flex min-h-[48px] w-full sm:w-auto items-center justify-center rounded-lg border border-[#F3F0E7]/65 bg-[#1C1F21]/35 hover:bg-[#F3F0E7]/10 hover:border-[#F3F0E7] px-6 sm:px-7 py-3 text-[15px] sm:text-[16px] font-medium text-[#F3F0E7] whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79A62] cursor-pointer"
              >
                {config.secondaryCtaLabel}
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Partie basse : parcours en 4 étapes animé avec rail laiton progressif */}
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10 pb-14 sm:pb-16 lg:pb-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.05 }}
          className="relative border-t border-[#F3F0E7]/12 pt-8 sm:pt-10 pb-8 sm:pb-10"
        >
          {/* Rail laiton horizontal progressif au scroll (bureau) */}
          <motion.div
            aria-hidden="true"
            variants={{
              hidden: prefersReducedMotion ? { scaleX: 1 } : { scaleX: 0 },
              visible: {
                scaleX: 1,
                transition: { duration: prefersReducedMotion ? 0 : 0.65, ease: REVEAL_EASE },
              },
            }}
            className="hidden lg:block absolute left-0 right-0 top-[-1px] h-[2px] origin-left bg-gradient-to-r from-[#B79A62] via-[#D8BC82] to-[#B79A62]/40"
          />

          <ol
            aria-label="Étapes de prise en charge après sinistre"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0"
          >
            {config.steps.map((step, index) => (
              <motion.li
                key={step.number}
                variants={{
                  hidden: prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: prefersReducedMotion ? 0 : 0.42,
                      delay: prefersReducedMotion ? 0 : index * 0.08,
                      ease: REVEAL_EASE,
                    },
                  },
                }}
                className={`relative flex items-center gap-4 ${
                  index > 0 ? 'lg:border-l lg:border-[#B79A62]/35 lg:pl-7' : ''
                } ${index < config.steps.length - 1 ? 'lg:pr-6' : ''}`}
              >
                <span className="font-display text-[30px] sm:text-[34px] font-semibold leading-none tracking-[-0.02em] text-[#B79A62] tabular-nums shrink-0">
                  {step.number}
                </span>
                <span className="text-[15px] sm:text-[16px] leading-[1.4] text-[#F3F0E7]/90">
                  {step.label}
                </span>
              </motion.li>
            ))}
          </ol>
        </motion.div>

        {/* Bandeau mention d'assurance à confirmer */}
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={REVEAL_VIEWPORT}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.52,
            delay: prefersReducedMotion ? 0 : 0.15,
            ease: REVEAL_EASE,
          }}
        >
          <InsuranceNotice config={config.insuranceNotice} onSendPhotos={onSendPhotos} />
        </motion.div>
      </div>
    </section>
  );
}
