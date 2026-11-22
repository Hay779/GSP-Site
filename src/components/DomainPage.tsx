import { useEffect, useState } from 'react';
import { ArrowRight, ChevronRight, Phone } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import type { DomainCardItem, DomainPageConfig } from '../data/sectionsContent';
import type { BrandConfig } from '../utils/navigation';
import type { QuoteDomain } from '../utils/quoteForm';
import { hrefForDomain, hrefForHome, hrefForHomeSection, type Route, type RouterMode } from '../utils/router';
import { buildCardRevealMotion, REVEAL_EASE, REVEAL_VIEWPORT } from '../utils/scrollReveal';

interface DomainPageProps {
  readonly domain: DomainCardItem;
  readonly otherDomains: readonly DomainCardItem[];
  readonly config: DomainPageConfig;
  readonly brand: BrandConfig;
  readonly route: Route;
  readonly routerMode: RouterMode;
  readonly onOpenQuoteModal: (domain: QuoteDomain) => void;
  readonly quoteTriggerRef?: React.RefObject<HTMLButtonElement | null>;
}

/** Met à jour le titre de l'onglet et la description Google de la page. */
function usePageMeta(title: string, description: string) {
  useEffect(() => {
    const previousTitle = document.title;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = meta?.content ?? '';
    document.title = title;
    if (meta) {
      meta.content = description;
    }
    return () => {
      document.title = previousTitle;
      if (meta) {
        meta.content = previousDescription;
      }
    };
  }, [title, description]);
}

function formatIndex(index: number): string {
  return String(index + 1).padStart(2, '0');
}

export function DomainPage({
  domain,
  otherDomains,
  config,
  brand,
  route,
  routerMode,
  onOpenQuoteModal,
  quoteTriggerRef,
}: DomainPageProps) {
  const prefersReducedMotion = Boolean(useReducedMotion());
  const [imageFailed, setImageFailed] = useState(false);
  usePageMeta(domain.seoTitle, domain.seoDescription);

  useEffect(() => setImageFailed(false), [domain.id]);

  const fadeUp = (delay = 0) => ({
    initial: prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: prefersReducedMotion ? 0 : 0.55, delay: prefersReducedMotion ? 0 : delay, ease: REVEAL_EASE },
  });

  return (
    <>
      {/* En-tête de page : photo plein cadre, fil d'Ariane, titre et actions */}
      <section
        id="page-hero"
        aria-labelledby="page-hero-title"
        className="relative w-full overflow-hidden bg-[#1C1F21] min-h-[560px] lg:min-h-[620px] flex items-end"
      >
        <div aria-hidden="true" className="absolute inset-0">
          {!imageFailed && (
            <motion.img
              key={domain.id}
              src={domain.imageSrc}
              alt=""
              referrerPolicy="no-referrer"
              onError={() => setImageFailed(true)}
              initial={prefersReducedMotion ? { scale: 1.04 } : { scale: 1.12 }}
              animate={{ scale: 1.04 }}
              transition={{ duration: prefersReducedMotion ? 0 : 6, ease: 'easeOut' }}
              className="h-full w-full object-cover object-[60%_45%] will-change-transform"
            />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(to_top,#1C1F21_0%,#1C1F21_30%,rgba(28,31,33,0.7)_60%,rgba(28,31,33,0.35)_100%)] lg:bg-[linear-gradient(90deg,#1C1F21_0%,#1C1F21_30%,rgba(28,31,33,0.85)_48%,rgba(28,31,33,0.3)_75%,rgba(28,31,33,0.15)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#1C1F21] to-transparent" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[1280px] px-5 sm:px-8 lg:px-10 pt-28 pb-14 sm:pb-16 lg:py-24">
          <nav aria-label="Fil d’Ariane" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1.5 text-[13px] text-[#F3F0E7]/70">
              <li>
                <a href={hrefForHome(routerMode)} className="hover:text-[#B79A62] transition-colors duration-150">
                  {config.breadcrumbHomeLabel}
                </a>
              </li>
              <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 text-[#F3F0E7]/40" />
              <li>
                <a
                  href={hrefForHomeSection('05_Nos_Domaines', route, routerMode)}
                  className="hover:text-[#B79A62] transition-colors duration-150"
                >
                  {config.breadcrumbDomainsLabel}
                </a>
              </li>
              <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 text-[#F3F0E7]/40" />
              <li aria-current="page" className="text-[#F3F0E7]">
                {domain.title}
              </li>
            </ol>
          </nav>

          <div className="max-w-[640px]">
            <motion.p {...fadeUp(0)} className="section-kicker text-[#B79A62]">
              {domain.categoryTag}
            </motion.p>
            <motion.h1
              {...fadeUp(0.08)}
              id="page-hero-title"
              className="mt-4 font-display text-[clamp(2.15rem,4.4vw,3.6rem)] font-semibold leading-[1.06] tracking-[-0.015em] text-[#F3F0E7]"
            >
              {domain.title}
            </motion.h1>
            <motion.p
              {...fadeUp(0.16)}
              className="mt-5 max-w-[560px] text-[16px] sm:text-[18px] leading-[1.6] text-[#F3F0E7]/85"
            >
              {domain.pageIntro}
            </motion.p>

            <motion.div {...fadeUp(0.24)} className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                ref={quoteTriggerRef}
                type="button"
                onClick={() => onOpenQuoteModal(domain.quoteDomain)}
                className="inline-flex min-h-[48px] items-center justify-center rounded-lg bg-[#B79A62] hover:bg-[#C6AA73] active:bg-[#A68952] px-7 py-3 text-[15px] sm:text-[16px] font-semibold text-[#1C1F21] whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F3F0E7] cursor-pointer"
              >
                {config.quoteCtaLabel}
              </button>
              <a
                href={brand.phoneHref}
                className="inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-lg border border-[#F3F0E7]/65 bg-[#1C1F21]/35 hover:bg-[#F3F0E7]/10 hover:border-[#F3F0E7] px-7 py-3 text-[15px] sm:text-[16px] font-medium text-[#F3F0E7] tabular-nums whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79A62]"
              >
                <Phone className="h-4 w-4 shrink-0 text-[#B79A62]" aria-hidden="true" />
                Appeler le {brand.phoneDisplay}
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Prestations détaillées */}
      <section
        id="page-prestations"
        aria-labelledby="page-prestations-title"
        className="w-full bg-[#F7F5F0] text-[#1C1F21] border-t border-[#B79A62]/45"
      >
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10 py-16 sm:py-20 lg:py-24">
          <div className="max-w-2xl">
            <p className="section-kicker text-[#7D612D]">{config.prestationsKicker}</p>
            <h2 id="page-prestations-title" className="mt-3 section-title text-[#1C1F21]">
              {config.prestationsTitle}
            </h2>
            <p className="mt-4 section-subtitle text-[#1C1F21]/70">{domain.summary}</p>
          </div>

          <ul className="mt-10 sm:mt-12 grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
            {domain.prestations.map((prestation, index) => {
              const reveal = buildCardRevealMotion({
                index,
                staggerSeconds: 0.08,
                offsetY: 22,
                duration: 0.5,
                reducedMotion: prefersReducedMotion,
              });
              return (
                <motion.li
                  key={prestation}
                  initial={reveal.initial}
                  whileInView={reveal.visible}
                  viewport={REVEAL_VIEWPORT}
                  className="flex gap-5 rounded-xl border border-[#1C1F21]/12 bg-[#FFFFFF] p-6 sm:p-7 transition-colors duration-200 hover:border-[#B79A62]"
                >
                  <span className="font-display text-[28px] sm:text-[32px] font-semibold leading-none tabular-nums text-[#B79A62]">
                    {formatIndex(index)}
                  </span>
                  <p className="pt-1 text-[16px] sm:text-[17px] leading-[1.55] text-[#1C1F21]/88">
                    {prestation}
                  </p>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Méthode d'intervention */}
      <section
        id="page-methode"
        aria-labelledby="page-methode-title"
        className="w-full bg-[#1C1F21] border-t border-[#B79A62]/45"
      >
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10 py-16 sm:py-20 lg:py-24">
          <div className="max-w-2xl">
            <p className="section-kicker text-[#B79A62]">{config.methodKicker}</p>
            <h2 id="page-methode-title" className="mt-3 section-title text-[#F3F0E7]">
              {config.methodTitle}
            </h2>
          </div>

          <ol className="mt-10 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 border-t border-[#B79A62]/50 pt-8 sm:pt-10">
            {config.methodSteps.map((step, index) => (
              <motion.li
                key={step.title}
                initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={REVEAL_VIEWPORT}
                transition={{ duration: prefersReducedMotion ? 0 : 0.5, delay: prefersReducedMotion ? 0 : index * 0.1, ease: REVEAL_EASE }}
                className={`flex flex-col gap-3 ${index > 0 ? 'lg:border-l lg:border-[#F3F0E7]/12 lg:pl-8' : ''} lg:pr-8`}
              >
                <span className="font-display text-[34px] sm:text-[40px] font-semibold leading-none tabular-nums text-[#B79A62]">
                  {formatIndex(index)}
                </span>
                <h3 className="font-display text-[19px] sm:text-[20px] font-semibold text-[#F3F0E7]">{step.title}</h3>
                <p className="text-[15px] leading-[1.6] text-[#F3F0E7]/72">{step.text}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* Autres domaines (maillage entre les pages métiers) */}
      <section
        id="page-autres-domaines"
        aria-labelledby="page-autres-domaines-title"
        className="w-full bg-[#F7F5F0] text-[#1C1F21] border-t border-[#B79A62]/45"
      >
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10 py-16 sm:py-20 lg:py-24">
          <div className="max-w-2xl">
            <p className="section-kicker text-[#7D612D]">{config.otherDomainsKicker}</p>
            <h2 id="page-autres-domaines-title" className="mt-3 section-title text-[#1C1F21]">
              {config.otherDomainsTitle}
            </h2>
          </div>

          <ul className="mt-10 sm:mt-12 grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
            {otherDomains.map((item, index) => {
              const reveal = buildCardRevealMotion({
                index,
                staggerSeconds: 0.08,
                offsetY: 22,
                duration: 0.5,
                reducedMotion: prefersReducedMotion,
              });
              return (
                <motion.li key={item.id} initial={reveal.initial} whileInView={reveal.visible} viewport={REVEAL_VIEWPORT}>
                  <a
                    href={hrefForDomain(item.id, routerMode)}
                    className="group flex h-full flex-col overflow-hidden rounded-xl border border-[#1C1F21]/12 bg-[#FFFFFF] transition-colors duration-200 hover:border-[#B79A62] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7D612D]"
                  >
                    <div className="relative h-[180px] overflow-hidden bg-[#1C1F21]">
                      <img
                        src={item.imageSrc}
                        alt=""
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <p className="text-[11.5px] font-medium uppercase tracking-[0.16em] text-[#7D612D]">
                        {item.categoryTag}
                      </p>
                      <h3 className="mt-2 font-display text-[21px] font-semibold leading-[1.2] text-[#1C1F21]">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-[15px] leading-[1.55] text-[#1C1F21]/70">{item.summary}</p>
                      <span className="mt-auto pt-5 inline-flex items-center gap-2 text-[14.5px] font-semibold text-[#1C1F21] group-hover:text-[#7D612D] transition-colors duration-150">
                        Découvrir
                        <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1" aria-hidden="true" />
                      </span>
                    </div>
                  </a>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </section>
    </>
  );
}
