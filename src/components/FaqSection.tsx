import { useRef, useState, type KeyboardEvent } from 'react';
import { ArrowRight, Phone, Plus } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { FaqConfig } from '../data/sectionsContent';
import type { BrandConfig } from '../utils/navigation';
import {
  formatFaqNumber,
  resolveNextFaqFocusIndex,
  toggleFaqItemId,
} from '../utils/faqAccordion';
import { REVEAL_EASE, REVEAL_VIEWPORT } from '../utils/scrollReveal';

interface FaqSectionProps {
  readonly config: FaqConfig;
  readonly brand: BrandConfig;
  readonly onOpenQuoteModal: () => void;
  /** Fond clair ou sombre (pour respecter l'alternance des blocs). */
  readonly tone?: 'light' | 'dark';
  /** Identifiant de la section (ancre). */
  readonly sectionId?: string;
  /** Affiche le rappel « une question ? » avec devis et téléphone. */
  readonly showContact?: boolean;
}

/** Couleurs du bloc FAQ selon le fond. */
const FAQ_TONES = {
  dark: {
    section: 'bg-[#1C1F21] text-[#F3F0E7]',
    kicker: 'text-[#B79A62]',
    title: 'text-[#F3F0E7]',
    subtitle: 'text-[#F3F0E7]/76',
    rule: 'border-[#F3F0E7]/12',
    prompt: 'text-[#F3F0E7]/75',
    phone: 'text-[#B79A62] hover:text-[#F3F0E7]',
    outline: 'focus-visible:outline-[#B79A62]',
    // Questions/réponses sur un panneau clair, même sur fond sombre (lisibilité)
    list: 'border-transparent bg-[#F7F5F0] divide-[#1C1F21]/10',
    rowHover: 'hover:bg-white',
    number: 'text-[#7D612D]',
    question: 'text-[#1C1F21] group-hover:text-[#7D612D]',
    iconOpen: 'border-[#1C1F21] bg-[#1C1F21] text-[#B79A62]',
    iconClosed: 'border-[#1C1F21]/16 bg-white text-[#7D612D] group-hover:border-[#B79A62]',
    answer: 'text-[#1C1F21]/76',
  },
  light: {
    section: 'bg-[#F7F5F0] text-[#1C1F21]',
    kicker: 'text-[#7D612D]',
    title: 'text-[#1C1F21]',
    subtitle: 'text-[#1C1F21]/70',
    rule: 'border-[#1C1F21]/12',
    prompt: 'text-[#1C1F21]/75',
    phone: 'text-[#7D612D] hover:text-[#1C1F21]',
    outline: 'focus-visible:outline-[#7D612D]',
    list: 'border-[#1C1F21]/12 bg-[#FFFFFF] divide-[#1C1F21]/10',
    rowHover: 'hover:bg-[#F7F5F0]/70',
    number: 'text-[#7D612D]',
    question: 'text-[#1C1F21] group-hover:text-[#7D612D]',
    iconOpen: 'border-[#1C1F21] bg-[#1C1F21] text-[#B79A62]',
    iconClosed: 'border-[#1C1F21]/16 bg-[#F7F5F0] text-[#7D612D] group-hover:border-[#B79A62]',
    answer: 'text-[#1C1F21]/76',
  },
} as const;

export function FaqSection({
  config,
  brand,
  onOpenQuoteModal,
  tone = 'dark',
  sectionId = 'FAQ',
  showContact = true,
}: FaqSectionProps) {
  const t = FAQ_TONES[tone];
  const [openId, setOpenId] = useState<string | null>(config.items[0]?.id ?? null);
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const prefersReducedMotion = useReducedMotion() ?? false;

  const validIds = config.items.map((item) => item.id);

  const handleToggle = (itemId: string) => {
    setOpenId((current) => toggleFaqItemId(current, itemId, validIds));
  };

  const handleTriggerKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    const nextIndex = resolveNextFaqFocusIndex(index, event.key, config.items.length);
    if (nextIndex !== null) {
      event.preventDefault();
      triggerRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <section
      id={sectionId}
      data-section={sectionId}
      aria-labelledby={`${sectionId}-title`}
      className={`w-full ${t.section} border-t border-[#B79A62]/45 scroll-mt-[74px] lg:scroll-mt-[88px]`}
    >
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10 py-16 sm:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Colonne gauche : titre éditorial & accès direct devis / téléphone */}
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={REVEAL_VIEWPORT}
            transition={{ duration: prefersReducedMotion ? 0 : 0.52, ease: REVEAL_EASE }}
            className="lg:col-span-4 lg:sticky lg:top-28"
          >
            <p className={`section-kicker ${t.kicker}`}>
              {config.kicker}
            </p>
            <h2
              id={`${sectionId}-title`}
              className={`mt-3 section-title ${t.title}`}
            >
              {config.title}
            </h2>
            {config.subtitle && (
              <p className={`mt-4 section-subtitle ${t.subtitle}`}>
                {config.subtitle}
              </p>
            )}

            {showContact && (
            <div className={`mt-7 border-t ${t.rule} pt-6`}>
              <p className={`text-[14px] leading-[1.55] ${t.prompt}`}>
                {config.contactPrompt}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3.5">
                <button
                  type="button"
                  onClick={onOpenQuoteModal}
                  className="group inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#B79A62] hover:bg-[#C6AA73] active:bg-[#A68952] px-4 text-[14px] font-semibold text-[#1C1F21] whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79A62] cursor-pointer"
                >
                  <span>{config.quoteCtaLabel}</span>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-[#1C1F21] transition-transform duration-150 group-hover:translate-x-1"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </button>

                <a
                  href={brand.phoneHref}
                  className={`inline-flex min-h-[46px] items-center gap-2 px-1 py-2 text-[14.5px] font-semibold ${t.phone} whitespace-nowrap tabular-nums transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 ${t.outline}`}
                >
                  <Phone className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
                  <span>{brand.phoneDisplay}</span>
                </a>
              </div>
            </div>
            )}
          </motion.div>

          {/* Colonne droite : accordéon sur panneau clair */}
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={REVEAL_VIEWPORT}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.56,
              delay: prefersReducedMotion ? 0 : 0.08,
              ease: REVEAL_EASE,
            }}
            className="lg:col-span-8"
          >
            <div className={`rounded-3xl border divide-y overflow-hidden ${t.list}`}>
              {config.items.map((item, index) => {
                const isOpen = openId === item.id;
                const triggerId = `faq-trigger-${item.id}`;
                const panelId = `faq-panel-${item.id}`;
                const itemNumber = formatFaqNumber(index);

                return (
                  <div key={item.id}>
                    <h3>
                      <button
                        ref={(el) => {
                          triggerRefs.current[index] = el;
                        }}
                        id={triggerId}
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() => handleToggle(item.id)}
                        onKeyDown={(event) => handleTriggerKeyDown(event, index)}
                        className={`group flex w-full min-h-[68px] items-center justify-between gap-4 px-5 sm:px-7 py-5 text-left transition-colors duration-150 ${t.rowHover} focus-visible:outline-2 focus-visible:outline-offset-[-2px] ${t.outline} cursor-pointer`}
                      >
                        <span className="flex items-baseline gap-4 min-w-0">
                          <span
                            aria-hidden="true"
                            className={`shrink-0 font-display text-[13px] font-semibold tracking-[0.06em] tabular-nums ${t.number}`}
                          >
                            {itemNumber}
                          </span>
                          <span className={`font-display text-[16.5px] sm:text-[18px] font-semibold leading-[1.35] ${t.question} transition-colors duration-150`}>
                            {item.question}
                          </span>
                        </span>

                        <span
                          aria-hidden="true"
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 ${
                            isOpen
                              ? t.iconOpen
                              : t.iconClosed
                          }`}
                        >
                          <Plus
                            className={`h-[18px] w-[18px] transition-transform duration-200 ${
                              isOpen ? 'rotate-45' : 'rotate-0'
                            }`}
                            strokeWidth={2}
                          />
                        </span>
                      </button>
                    </h3>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          id={panelId}
                          role="region"
                          aria-labelledby={triggerId}
                          initial={
                            prefersReducedMotion
                              ? { opacity: 1, height: 'auto' }
                              : { opacity: 0, height: 0 }
                          }
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={
                            prefersReducedMotion
                              ? { opacity: 1, height: 'auto' }
                              : { opacity: 0, height: 0 }
                          }
                          transition={{
                            duration: prefersReducedMotion ? 0 : 0.26,
                            ease: REVEAL_EASE,
                          }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 sm:px-7 pb-6 pt-0 pl-[52px] sm:pl-[66px] pr-6 sm:pr-14">
                            <p className={`text-[15px] sm:text-[15.5px] leading-[1.7] ${t.answer}`}>
                              {item.answer}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
