import { useState, type ReactNode } from 'react';
import {
  AppWindow,
  Blinds,
  Check,
  ChevronsLeftRight,
  Cog,
  DoorOpen,
  FileText,
  FolderCheck,
  HandHelping,
  Settings,
  Frame,
  LockKeyhole,
  PanelsTopLeft,
  Search,
  ShieldCheck,
  Store,
  Thermometer,
  Warehouse,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import type { NumberedStep } from '../data/sectionsContent';
import type { BeforeAfterCase, FeatureCard, FeatureIconKey, ProcessIconKey } from '../data/domainPagesContent';
import { REVEAL_EASE, REVEAL_VIEWPORT } from '../utils/scrollReveal';

export type SectionTone = 'light' | 'dark';

const TONE_CLASSES: Record<SectionTone, { section: string; kicker: string; title: string; subtitle: string }> = {
  light: {
    section: 'bg-[#F7F5F0] text-[#1C1F21]',
    kicker: 'text-[#7D612D]',
    title: 'text-[#1C1F21]',
    subtitle: 'text-[#1C1F21]/70',
  },
  dark: {
    section: 'bg-[#1C1F21] text-[#F3F0E7]',
    kicker: 'text-[#B79A62]',
    title: 'text-[#F3F0E7]',
    subtitle: 'text-[#F3F0E7]/76',
  },
};

export function formatStepIndex(index: number): string {
  return String(index + 1).padStart(2, '0');
}

/** Section standard des pages intérieures : sur-titre, titre, sous-titre, contenu. */
export function PageSection({
  id,
  tone,
  kicker,
  title,
  subtitle,
  children,
}: {
  readonly id: string;
  readonly tone: SectionTone;
  readonly kicker: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly children: ReactNode;
}) {
  const t = TONE_CLASSES[tone];
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={`w-full ${t.section}`}
    >
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10 py-12 sm:py-20 lg:py-24">
        <div className="max-w-2xl">
          <p className={`section-kicker ${t.kicker}`}>{kicker}</p>
          <h2 id={`${id}-title`} className={`mt-3 section-title ${t.title}`}>
            {title}
          </h2>
          {subtitle && <p className={`mt-4 section-subtitle ${t.subtitle}`}>{subtitle}</p>}
        </div>
        <div className="mt-8 sm:mt-12">{children}</div>
      </div>
    </section>
  );
}

/** Étapes numérotées sur une ligne laiton (fond sombre). */
export function NumberedSteps({ steps }: { readonly steps: readonly NumberedStep[] }) {
  const prefersReducedMotion = Boolean(useReducedMotion());
  const columns =
    steps.length >= 4 ? 'lg:grid-cols-4' : steps.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2';
  return (
    <ol
      className={`grid grid-cols-1 sm:grid-cols-2 ${columns} gap-8 lg:gap-0 border-t border-[#B79A62]/50 pt-8 sm:pt-10`}
    >
      {steps.map((step, index) => (
        <motion.li
          key={step.title}
          initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={REVEAL_VIEWPORT}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.5,
            delay: prefersReducedMotion ? 0 : index * 0.1,
            ease: REVEAL_EASE,
          }}
          className={`flex flex-col gap-3 ${index > 0 ? 'lg:border-l lg:border-[#F3F0E7]/12 lg:pl-8' : ''} lg:pr-8`}
        >
          <span className="font-display text-[34px] sm:text-[40px] font-semibold leading-none tabular-nums text-[#B79A62]">
            {formatStepIndex(index)}
          </span>
          <h3 className="font-display text-[19px] sm:text-[20px] font-semibold text-[#F3F0E7]">{step.title}</h3>
          {step.text && <p className="text-[15px] leading-[1.6] text-[#F3F0E7]/72">{step.text}</p>}
        </motion.li>
      ))}
    </ol>
  );
}

/** Liste de prestations sur cartes blanches, avec une coche laiton (fond clair). */
export function NumberedCards({
  items,
  columns = 2,
}: {
  readonly items: readonly string[];
  readonly columns?: 2 | 4;
}) {
  const prefersReducedMotion = Boolean(useReducedMotion());
  return (
    <ul className={`grid grid-cols-1 md:grid-cols-2 ${columns === 4 ? 'lg:grid-cols-4' : ''} gap-3 sm:gap-4 lg:gap-5`}>
      {items.map((item, index) => (
        <motion.li
          key={item}
          initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={REVEAL_VIEWPORT}
          transition={{ duration: prefersReducedMotion ? 0 : 0.45, delay: prefersReducedMotion ? 0 : index * 0.06, ease: REVEAL_EASE }}
          className="flex items-start gap-3.5 rounded-2xl bg-white p-4 sm:p-5 shadow-[0_10px_28px_-20px_rgba(28,31,33,0.4)]"
        >
          <span aria-hidden="true" className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#F1E8D6] text-[#9C7C40]">
            <Check className="h-4 w-4" strokeWidth={2.4} />
          </span>
          <p className="text-[15px] sm:text-[16px] leading-[1.5] text-[#1C1F21]/85">{item}</p>
        </motion.li>
      ))}
    </ul>
  );
}

const FEATURE_ICONS: Record<FeatureIconKey, LucideIcon> = {
  door: DoorOpen,
  lock: LockKeyhole,
  shield: ShieldCheck,
  wrench: Wrench,
  glass: PanelsTopLeft,
  store: Store,
  mirror: Frame,
  window: AppWindow,
  thermo: Thermometer,
  shutter: Blinds,
  garage: Warehouse,
  motor: Cog,
};

/** Prestations : cartes blanches avec icône laiton, titre court et une ligne (2 × 2 sur mobile). */
export function FeatureCards({ items }: { readonly items: readonly FeatureCard[] }) {
  const prefersReducedMotion = Boolean(useReducedMotion());
  return (
    <ul className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
      {items.map((item, index) => {
        const Icon = FEATURE_ICONS[item.icon];
        return (
          <motion.li
            key={item.title}
            initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={REVEAL_VIEWPORT}
            transition={{ duration: prefersReducedMotion ? 0 : 0.45, delay: prefersReducedMotion ? 0 : index * 0.07, ease: REVEAL_EASE }}
            className="rounded-2xl bg-white p-4 sm:p-6 shadow-[0_10px_28px_-20px_rgba(28,31,33,0.4)]"
          >
            <span aria-hidden="true" className="grid h-11 w-11 sm:h-12 sm:w-12 place-items-center rounded-full bg-[#F1E8D6] text-[#9C7C40]">
              <Icon className="h-5 w-5 sm:h-[22px] sm:w-[22px]" strokeWidth={1.6} />
            </span>
            <h3 className="mt-3 sm:mt-4 font-display text-[16px] sm:text-[19px] font-semibold leading-tight text-[#1C1F21]">{item.title}</h3>
            <p className="mt-1.5 text-[13.5px] sm:text-[15px] leading-[1.45] text-[#1C1F21]/68">{item.text}</p>
          </motion.li>
        );
      })}
    </ul>
  );
}

const DEFAULT_PROCESS_ICONS: readonly LucideIcon[] = [Search, FileText, Wrench, FolderCheck];

const PROCESS_ICON_MAP: Record<ProcessIconKey, LucideIcon> = {
  hand: HandHelping,
  search: Search,
  file: FileText,
  wrench: Wrench,
  folder: FolderCheck,
  settings: Settings,
};

/** Méthode en étapes : icône + numéro laiton, 2 × 2 sur mobile, une ligne sur ordinateur. */
export function ProcessSteps({
  steps,
  tone,
  icons,
}: {
  readonly steps: readonly NumberedStep[];
  readonly tone: SectionTone;
  readonly icons?: readonly ProcessIconKey[];
}) {
  const dark = tone === 'dark';
  const iconList = icons ? icons.map((key) => PROCESS_ICON_MAP[key]) : DEFAULT_PROCESS_ICONS;
  return (
    <ol className={`grid grid-cols-2 ${steps.length >= 4 ? 'lg:grid-cols-4' : steps.length === 3 ? 'lg:grid-cols-3' : ''} gap-y-7`}>
      {steps.map((step, index) => {
        const Icon = iconList[index % iconList.length];
        return (
          <li
            key={step.title}
            className={`px-3 sm:px-5 ${index % 2 === 1 ? 'border-l' : ''} ${index > 0 ? 'lg:border-l' : ''} ${
              dark ? 'border-[#F3F0E7]/12' : 'border-[#1C1F21]/12'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className={`grid h-10 w-10 place-items-center rounded-full ${dark ? 'bg-[#B79A62]/15 text-[#B79A62]' : 'bg-[#EAE2D2] text-[#7D612D]'}`}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.7} />
              </span>
              <span className="font-display text-[26px] font-semibold tabular-nums text-[#B79A62]">{formatStepIndex(index)}</span>
            </div>
            <h3 className={`mt-3 font-display text-[16.5px] sm:text-[19px] font-semibold ${dark ? 'text-[#F3F0E7]' : 'text-[#1C1F21]'}`}>
              {step.title}
            </h3>
            {step.text && (
              <p className={`mt-1 text-[13.5px] sm:text-[15px] leading-[1.5] ${dark ? 'text-[#F3F0E7]/70' : 'text-[#1C1F21]/68'}`}>{step.text}</p>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/** Comparateur avant / après : on fait glisser la poignée pour révéler la photo « après ». */
function BeforeAfterSlider({ item }: { readonly item: BeforeAfterCase }) {
  const [position, setPosition] = useState(50);
  return (
    <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full select-none overflow-hidden rounded-2xl bg-[#292D2F]">
      <img
        src={item.afterSrc}
        alt={item.afterAlt}
        loading="lazy"
        style={{ objectPosition: item.afterPosition }}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <img
        src={item.beforeSrc}
        alt={item.beforeAlt}
        loading="lazy"
        style={{ objectPosition: item.beforePosition, clipPath: `inset(0 ${100 - position}% 0 0)` }}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-[#1C1F21]/80 px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#F3F0E7]">
        Avant
      </span>
      <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-[#B79A62] px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#1C1F21]">
        Après
      </span>
      {/* Poignée */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.15)]" style={{ left: `${position}%` }}>
        <span className="absolute left-1/2 top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-[#1C1F21] shadow-lg">
          <ChevronsLeftRight className="h-5 w-5" strokeWidth={2} />
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={position}
        onChange={(event) => setPosition(Number(event.target.value))}
        aria-label={`Comparer avant et après : ${item.title}`}
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}

/** Exemples d'interventions en avant / après (fond sombre). */
export function BeforeAfterCases({ items }: { readonly items: readonly BeforeAfterCase[] }) {
  return (
    <ul className="grid gap-8 lg:gap-10">
      {items.map((item) => (
        <li key={item.title} className="grid gap-5 lg:grid-cols-12 lg:items-center lg:gap-10">
          <div className="lg:col-span-7">
            <BeforeAfterSlider item={item} />
          </div>
          <div className="lg:col-span-5">
            {item.illustrative && (
              <p className="mb-3 inline-flex rounded-full border border-[#F3F0E7]/20 px-3 py-1 text-[12px] text-[#F3F0E7]/65">
                Photos d’illustration
              </p>
            )}
            <h3 className="font-display text-[21px] sm:text-[24px] font-semibold leading-tight text-[#F3F0E7]">{item.title}</h3>
            <p className="mt-2 text-[15px] sm:text-[16px] leading-[1.6] text-[#F3F0E7]/75">{item.text}</p>
            <p className="mt-4 inline-flex items-center gap-2 text-[14px] text-[#B79A62]">
              <ChevronsLeftRight className="h-4 w-4" aria-hidden="true" />
              Faites glisser pour comparer
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
