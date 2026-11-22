import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import type { NumberedStep } from '../data/sectionsContent';
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
      className={`w-full border-t border-[#B79A62]/45 ${t.section}`}
    >
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10 py-16 sm:py-20 lg:py-24">
        <div className="max-w-2xl">
          <p className={`section-kicker ${t.kicker}`}>{kicker}</p>
          <h2 id={`${id}-title`} className={`mt-3 section-title ${t.title}`}>
            {title}
          </h2>
          {subtitle && <p className={`mt-4 section-subtitle ${t.subtitle}`}>{subtitle}</p>}
        </div>
        <div className="mt-10 sm:mt-12">{children}</div>
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

/** Cartes blanches numérotées (fond clair). */
export function NumberedCards({
  items,
  columns = 2,
}: {
  readonly items: readonly string[];
  readonly columns?: 2 | 4;
}) {
  const prefersReducedMotion = Boolean(useReducedMotion());
  return (
    <ul
      className={`grid grid-cols-1 md:grid-cols-2 ${columns === 4 ? 'lg:grid-cols-4' : ''} gap-5 lg:gap-6`}
    >
      {items.map((item, index) => (
        <motion.li
          key={item}
          initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={REVEAL_VIEWPORT}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.5,
            delay: prefersReducedMotion ? 0 : index * 0.08,
            ease: REVEAL_EASE,
          }}
          className={`flex rounded-xl border border-[#1C1F21]/12 bg-[#FFFFFF] p-6 sm:p-7 transition-colors duration-200 hover:border-[#B79A62] ${
            columns === 4 ? 'flex-col gap-4' : 'gap-5'
          }`}
        >
          <span className="font-display text-[28px] sm:text-[32px] font-semibold leading-none tabular-nums text-[#B79A62]">
            {formatStepIndex(index)}
          </span>
          <p className="pt-1 text-[16px] sm:text-[17px] leading-[1.55] text-[#1C1F21]/88">{item}</p>
        </motion.li>
      ))}
    </ul>
  );
}
