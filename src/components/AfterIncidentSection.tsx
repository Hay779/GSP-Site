import { ArrowRight, Camera, FileCheck, FileText, FolderOpen, Search, ShieldCheck, Wrench } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import type { AfterIncidentConfig } from '../data/sectionsContent';
import { REVEAL_EASE, REVEAL_VIEWPORT } from '../utils/scrollReveal';

interface AfterIncidentSectionProps {
  readonly config: AfterIncidentConfig;
  readonly onDescribeNeed: () => void;
  readonly onSendPhotos: () => void;
}

const SERVICE_ICONS = { shield: ShieldCheck, wrench: Wrench, file: FileCheck } as const;
const STEP_ICONS = [Search, FileText, Wrench, FolderOpen] as const;

/**
 * Bloc « Après sinistre » de l'accueil : photo en bandeau, trois prises en charge illustrées,
 * parcours en 4 étapes, puis « Décrire mon besoin » et l'envoi de photos.
 */
export function AfterIncidentSection({ config, onDescribeNeed, onSendPhotos }: AfterIncidentSectionProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const reveal = {
    initial: prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: REVEAL_VIEWPORT,
    transition: { duration: prefersReducedMotion ? 0 : 0.5, ease: REVEAL_EASE },
  };

  return (
    <section
      id="07_Apres_Sinistre"
      data-section="07_Apres_Sinistre"
      aria-labelledby="07_Apres_Sinistre-title"
      className="w-full bg-[#F3F0E7] scroll-mt-[74px] lg:scroll-mt-[88px] lg:py-20"
    >
      <div className="mx-auto max-w-[1280px] lg:px-10">
        {/* En-tête : photo en bandeau courbé (mobile) / à droite (bureau) */}
        <div className="lg:grid lg:grid-cols-12 lg:items-center lg:gap-12">
          <div className="kb-curve relative lg:order-2 lg:col-span-6">
            <img
              src={config.bannerSrc}
              alt={config.bannerAlt}
              loading="lazy"
              className="h-[210px] sm:h-[280px] w-full object-cover lg:h-[300px] lg:rounded-2xl"
            />
          </div>

          <motion.div {...reveal} className="px-5 sm:px-8 lg:px-0 pt-6 lg:pt-0 lg:col-span-6 lg:order-1">
            <p className="section-kicker flex items-center gap-3 text-[#7D612D]">
              <span aria-hidden="true" className="h-px w-8 bg-[#B79A62]" />
              {config.kicker}
            </p>
            <h2 id="07_Apres_Sinistre-title" className="section-title mt-3 text-[#1C1F21]">
              {config.headlineLines[0]} {config.headlineLines[1]}
            </h2>
            <p className="section-subtitle mt-3 text-[#1C1F21]/70">{config.subtitle}</p>
          </motion.div>
        </div>

        <div className="px-5 sm:px-8 lg:px-0 pb-12 sm:pb-14 lg:pb-0">
          {/* Trois prises en charge */}
          <IncidentServiceGrid services={config.services} className="mt-7 lg:mt-12" />

          {/* Parcours en 4 étapes */}
          <div className="mt-9 lg:mt-12 flex items-center gap-4">
            <span aria-hidden="true" className="h-px flex-1 bg-[#B79A62]/70" />
            <h3 className="font-display text-[17px] sm:text-[20px] font-semibold text-[#1C1F21] text-center">
              {config.stepsTitle}
            </h3>
            <span aria-hidden="true" className="h-px flex-1 bg-[#B79A62]/70" />
          </div>
          <ol aria-label={config.stepsTitle} className="mt-6 grid grid-cols-2 gap-y-6 sm:grid-cols-4">
            {config.steps.map((step, index) => {
              const Icon = STEP_ICONS[index % STEP_ICONS.length];
              return (
                <li
                  key={step.number}
                  className={`px-3 sm:px-4 text-center ${index % 2 === 1 ? 'border-l' : ''} ${
                    index > 0 ? 'sm:border-l' : ''
                  } border-[#1C1F21]/12`}
                >
                  <div className="flex items-center justify-center gap-2.5">
                    <span aria-hidden="true" className="grid h-10 w-10 place-items-center rounded-full bg-[#EAE2D2] text-[#7D612D]">
                      <Icon className="h-[18px] w-[18px]" strokeWidth={1.7} />
                    </span>
                    <span className="font-display text-[26px] font-semibold tabular-nums text-[#B79A62]">{step.number}</span>
                  </div>
                  <p className="mt-2 text-[14px] sm:text-[15px] leading-[1.35] text-[#1C1F21]/85">{step.label}</p>
                </li>
              );
            })}
          </ol>

          {/* Actions */}
          <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-8">
            <button
              type="button"
              onClick={onDescribeNeed}
              className="group inline-flex h-11 w-full sm:w-auto items-center justify-center gap-3 rounded-full bg-[#1C1F21] px-5 text-[15px] font-semibold text-[#F3F0E7] hover:bg-[#292D2F] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79A62] cursor-pointer"
            >
              {config.primaryCtaLabel}
              <ArrowRight className="h-5 w-5 text-[#B79A62] transition-transform duration-150 group-hover:translate-x-0.5" strokeWidth={1.8} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onSendPhotos}
              className="inline-flex items-center gap-2.5 text-[15.5px] font-medium text-[#1C1F21] underline decoration-[#1C1F21]/40 underline-offset-[5px] hover:decoration-[#B79A62] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B79A62] rounded cursor-pointer"
            >
              <Camera className="h-5 w-5 text-[#B79A62]" strokeWidth={1.7} aria-hidden="true" />
              {config.secondaryCtaLabel}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Les trois prises en charge (accueil et page Après sinistre) : photo, icône centrée à cheval
 * sur la photo, titre et texte centrés. Mobile : une carte par ligne ; tablette et ordinateur : 3 colonnes.
 */
export function IncidentServiceGrid({
  services,
  className = '',
}: {
  readonly services: AfterIncidentConfig['services'];
  readonly className?: string;
}) {
  return (
    <ul className={`grid grid-cols-1 gap-4 sm:grid-cols-3 lg:gap-6 ${className}`}>
      {services.map((service) => {
        const Icon = SERVICE_ICONS[service.icon];
        return (
          <li
            key={service.title}
            className="flex flex-col items-center overflow-hidden rounded-2xl bg-white text-center shadow-[0_10px_28px_-20px_rgba(28,31,33,0.4)]"
          >
            <img src={service.imageSrc} alt="" loading="lazy" className="h-[120px] sm:h-[130px] lg:h-[160px] w-full object-cover" />
            <span
              aria-hidden="true"
              className="relative -mt-7 grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#F3EBDD] text-[#7D612D] ring-4 ring-white"
            >
              <Icon className="h-6 w-6" strokeWidth={1.6} />
            </span>
            <div className="w-full px-4 pt-3 pb-5 sm:px-3 lg:px-5 lg:pb-6">
              <h3 className="font-display text-[18px] lg:text-[20px] font-semibold leading-tight text-[#1C1F21]">{service.title}</h3>
              <p className="mx-auto mt-1.5 max-w-[30ch] text-[14px] lg:text-[15px] leading-[1.45] text-[#1C1F21]/68">{service.text}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
