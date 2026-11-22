import { ArrowRight, Phone } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import type { DomainCardItem, DomainPageConfig } from '../data/sectionsContent';
import type { BrandConfig } from '../utils/navigation';
import type { QuoteDomain } from '../utils/quoteForm';
import { hrefForDomain, hrefForHome, hrefForHomeSection, type Route, type RouterMode } from '../utils/router';
import { PAGE_HERO_PRIMARY_BUTTON, PAGE_HERO_SECONDARY_BUTTON, PageHero, usePageMeta } from './PageHero';
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
  usePageMeta(domain.seoTitle, domain.seoDescription);

  return (
    <>
      <PageHero
        kicker={domain.categoryTag}
        title={domain.title}
        intro={domain.pageIntro}
        imageSrc={domain.imageSrc}
        breadcrumb={[
          { label: config.breadcrumbHomeLabel, href: hrefForHome(routerMode) },
          {
            label: config.breadcrumbDomainsLabel,
            href: hrefForHomeSection('05_Nos_Domaines', route, routerMode),
          },
          { label: domain.title },
        ]}
        actions={
          <>
            <button
              ref={quoteTriggerRef}
              type="button"
              onClick={() => onOpenQuoteModal(domain.quoteDomain)}
              className={PAGE_HERO_PRIMARY_BUTTON}
            >
              {config.quoteCtaLabel}
            </button>
            <a href={brand.phoneHref} className={PAGE_HERO_SECONDARY_BUTTON}>
              <Phone className="h-4 w-4 shrink-0 text-[#B79A62]" aria-hidden="true" />
              Appeler le {brand.phoneDisplay}
            </a>
          </>
        }
      />

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
