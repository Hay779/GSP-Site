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
}

export function FaqSection({ config, brand, onOpenQuoteModal }: FaqSectionProps) {
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
      id="FAQ"
      data-section="FAQ"
      aria-labelledby="FAQ-title"
      className="w-full bg-[#F7F5F0] text-[#1C1F21] border-t border-b border-[#B79A62]/45 scroll-mt-[74px] lg:scroll-mt-[88px]"
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
            <p className="text-[13px] sm:text-[14px] font-medium tracking-[0.16em] uppercase text-[#7D612D]">
              {config.kicker}
            </p>
            <h2
              id="FAQ-title"
              className="mt-3 font-display text-[30px] sm:text-[36px] lg:text-[42px] font-semibold leading-[1.12] tracking-[-0.015em] text-[#1C1F21]"
            >
              {config.title}
            </h2>
            <p className="mt-3.5 text-[15px] sm:text-[16px] leading-[1.65] text-[#1C1F21]/70">
              {config.subtitle}
            </p>

            <div className="mt-7 border-t border-[#1C1F21]/12 pt-6">
              <p className="text-[14px] leading-[1.55] text-[#1C1F21]/75">
                {config.contactPrompt}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3.5">
                <button
                  type="button"
                  onClick={onOpenQuoteModal}
                  className="group inline-flex min-h-[46px] items-center justify-center gap-2.5 rounded-lg bg-[#1C1F21] hover:bg-[#292D2F] active:bg-[#171A1C] px-5 py-2.5 text-[14.5px] font-semibold text-[#F3F0E7] whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7D612D] cursor-pointer"
                >
                  <span>{config.quoteCtaLabel}</span>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-[#B79A62] transition-transform duration-150 group-hover:translate-x-1"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </button>

                <a
                  href={brand.phoneHref}
                  className="inline-flex min-h-[46px] items-center gap-2 px-1 py-2 text-[14.5px] font-semibold text-[#7D612D] hover:text-[#1C1F21] whitespace-nowrap tabular-nums transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7D612D]"
                >
                  <Phone className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
                  <span>{brand.phoneDisplay}</span>
                </a>
              </div>
            </div>
          </motion.div>

          {/* Colonne droite : accordéon éditorial sur carte blanche unifiée */}
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
            <div className="rounded-xl border border-[#1C1F21]/12 bg-[#FFFFFF] divide-y divide-[#1C1F21]/10 overflow-hidden">
              {config.items.map((item, index) => {
                const isOpen = openId === item.id;
                const triggerId = `faq-trigger-${item.id}`;
                const panelId = `faq-panel-${item.id}`;
                const itemNumber = formatFaqNumber(index);

                return (
                  <div key={item.id} className="bg-[#FFFFFF]">
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
                        className="group flex w-full min-h-[68px] items-center justify-between gap-4 px-5 sm:px-7 py-5 text-left transition-colors duration-150 hover:bg-[#F7F5F0]/60 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#7D612D] cursor-pointer"
                      >
                        <span className="flex items-baseline gap-4 min-w-0">
                          <span
                            aria-hidden="true"
                            className="shrink-0 font-display text-[13px] font-semibold tracking-[0.06em] tabular-nums text-[#7D612D]"
                          >
                            {itemNumber}
                          </span>
                          <span className="font-display text-[16.5px] sm:text-[18px] font-semibold leading-[1.35] text-[#1C1F21] group-hover:text-[#7D612D] transition-colors duration-150">
                            {item.question}
                          </span>
                        </span>

                        <span
                          aria-hidden="true"
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 ${
                            isOpen
                              ? 'border-[#7D612D] bg-[#1C1F21] text-[#B79A62]'
                              : 'border-[#1C1F21]/16 bg-[#F7F5F0] text-[#7D612D] group-hover:border-[#B79A62]'
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
                            <p className="text-[15px] sm:text-[15.5px] leading-[1.7] text-[#1C1F21]/76">
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
