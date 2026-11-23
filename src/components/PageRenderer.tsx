import { ArrowRight, Building2, FileText, KeyRound, MessageCircle, Phone, ShieldCheck } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { blockTone, type HeroAction, type PageBlock, type PageDefinition } from '../data/pages';
import {
  AFTER_INCIDENT_CONFIG,
  AGENCIES_CONFIG,
  CONTACT_PAGE_CONFIG,
  DOMAINS_CONFIG,
  FAQ_CONFIG,
  REVIEWS_CONFIG,
  URGENCY_VARIANTS,
  WHATSAPP_CONFIG,
  ZONE_INTERVENTION_CONFIG,
  BRANDS_CONFIG,
} from '../data/sectionsContent';
import type { BrandConfig } from '../utils/navigation';
import type { QuoteDomain } from '../utils/quoteForm';
import {
  hrefForDomain,
  hrefForPage,
  type Route,
  type RouterMode,
} from '../utils/router';
import { buildCardRevealMotion, REVEAL_EASE, REVEAL_VIEWPORT } from '../utils/scrollReveal';
import { buildWhatsAppUrl } from '../utils/whatsapp';
import { AgenciesSection } from './AgenciesSection';
import { ContactFormSection } from './ContactFormSection';
import { FaqSection } from './FaqSection';
import { InsuranceNotice } from './InsuranceNotice';
import { ServiceIcon } from './KeysBadgesSection';
import {
  PAGE_HERO_PRIMARY_BUTTON,
  PAGE_HERO_SECONDARY_BUTTON,
  PageHero,
} from './PageHero';
import { BeforeAfterCases, FeatureCards, NumberedCards, NumberedSteps, PageSection, ProcessSteps } from './PageSections';
import { BrandsSection } from './BrandsSection';
import { IncidentServiceGrid } from './AfterIncidentSection';
import { ReviewsSection } from './ReviewsSection';
import { UrgencySection } from './UrgencySection';
import { ZoneInterventionSection } from './ZoneInterventionSection';

/** Tout ce dont les blocs ont besoin pour fonctionner. */
export interface PageContext {
  readonly brand: BrandConfig;
  readonly route: Route;
  readonly routerMode: RouterMode;
  readonly onOpenQuoteModal: (domain?: QuoteDomain, district?: string) => void;
  readonly onSendPhotos: () => void;
  readonly quoteTriggerRef?: React.RefObject<HTMLButtonElement | null>;
}

/* ------------------------------------------------------------------ */
/* En-tête : boutons                                                   */
/* ------------------------------------------------------------------ */

function HeroActionButton({
  action,
  primary,
  ctx,
}: {
  readonly action: HeroAction;
  readonly primary: boolean;
  readonly ctx: PageContext;
}) {
  const className = primary ? PAGE_HERO_PRIMARY_BUTTON : PAGE_HERO_SECONDARY_BUTTON;
  switch (action.kind) {
    case 'quote':
      return (
        <button
          ref={primary ? ctx.quoteTriggerRef : undefined}
          type="button"
          onClick={() => ctx.onOpenQuoteModal(action.domain)}
          className={className}
        >
          {action.label ?? 'Demander un devis'}
        </button>
      );
    case 'phone':
      return (
        <a href={ctx.brand.phoneHref} className={className}>
          <Phone className={`h-4 w-4 shrink-0 ${primary ? '' : 'text-[#B79A62]'}`} aria-hidden="true" />
          Appeler le {ctx.brand.phoneDisplay}
        </a>
      );
    case 'photos':
      return (
        <button type="button" onClick={ctx.onSendPhotos} className={className}>
          {action.label}
        </button>
      );
    case 'page':
      return (
        <a href={hrefForPage(action.page, ctx.routerMode)} className={className}>
          {action.label}
        </a>
      );
  }
}

/* ------------------------------------------------------------------ */
/* Blocs                                                               */
/* ------------------------------------------------------------------ */

function DomainCards({ excludeId, ctx }: { readonly excludeId?: string; readonly ctx: PageContext }) {
  const prefersReducedMotion = Boolean(useReducedMotion());
  const items = DOMAINS_CONFIG.items.filter((item) => item.id !== excludeId);
  return (
    <ul
      className={`-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:overflow-visible sm:px-0 sm:pb-0 sm:grid-cols-2 ${
        items.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'
      } sm:gap-5 lg:gap-6`}
    >
      {items.map((item, index) => {
        const reveal = buildCardRevealMotion({
          index,
          staggerSeconds: 0.08,
          offsetY: 22,
          duration: 0.5,
          reducedMotion: prefersReducedMotion,
        });
        return (
          <motion.li
            key={item.id}
            initial={reveal.initial}
            whileInView={reveal.visible}
            viewport={REVEAL_VIEWPORT}
            className="w-[78%] shrink-0 snap-start sm:w-auto"
          >
            <a
              href={hrefForDomain(item.id, ctx.routerMode)}
              className="group flex h-full flex-col overflow-hidden rounded-xl border border-[#1C1F21]/12 bg-[#FFFFFF] transition-colors duration-200 hover:border-[#B79A62] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7D612D]"
            >
              <div className="relative h-[140px] sm:h-[180px] overflow-hidden bg-[#1C1F21]">
                <img
                  src={item.imageSrc}
                  alt=""
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                />
              </div>
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <p className="text-[11.5px] font-medium uppercase tracking-[0.16em] text-[#7D612D]">{item.categoryTag}</p>
                <h3 className="mt-2 font-display text-[21px] font-semibold leading-[1.2] text-[#1C1F21]">{item.title}</h3>
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
  );
}

const AUDIENCE_ICONS = { syndic: Building2, assureur: ShieldCheck, immobilier: KeyRound } as const;

function AudienceCards({
  items,
  ctx,
}: {
  readonly items: Extract<PageBlock, { type: 'audiences' }>['items'];
  readonly ctx: PageContext;
}) {
  const prefersReducedMotion = Boolean(useReducedMotion());
  return (
    <ul className="grid grid-cols-1 gap-3 sm:gap-5 md:grid-cols-3 lg:gap-6">
      {items.map((item, index) => {
        const Icon = AUDIENCE_ICONS[item.icon];
        return (
          <motion.li
            key={item.page}
            initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={REVEAL_VIEWPORT}
            transition={{ duration: prefersReducedMotion ? 0 : 0.45, delay: prefersReducedMotion ? 0 : index * 0.07, ease: REVEAL_EASE }}
          >
            {/* Mobile : ligne compacte (icône, titre, phrase, flèche) — Ordinateur : carte */}
            <a
              href={hrefForPage(item.page, ctx.routerMode)}
              className="group flex h-full items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_10px_28px_-20px_rgba(28,31,33,0.4)] transition-shadow duration-200 hover:shadow-[0_16px_34px_-18px_rgba(28,31,33,0.45)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7D612D] md:flex-col md:items-start md:gap-4 md:p-7"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#F1E8D6] text-[#9C7C40] md:h-14 md:w-14">
                <Icon className="h-6 w-6" strokeWidth={1.6} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[17px] md:text-[22px] font-semibold leading-[1.2] text-[#1C1F21]">{item.title}</span>
                <span className="mt-1 block text-[14px] md:mt-3 md:text-[15.5px] leading-[1.5] text-[#1C1F21]/68">{item.text}</span>
              </span>
              <span className="shrink-0 inline-flex items-center gap-2 text-[15px] font-semibold text-[#1C1F21] group-hover:text-[#7D612D] transition-colors duration-150 md:mt-auto md:pt-2">
                <span className="hidden md:inline underline decoration-[#B79A62] decoration-2 underline-offset-[6px]">Découvrir</span>
                <ArrowRight className="h-5 w-5 text-[#B79A62] transition-transform duration-150 group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </a>
          </motion.li>
        );
      })}
    </ul>
  );
}

const SERVICE_IMAGES = { key: '/src/assets/images/kb_cles.jpg', badge: '/src/assets/images/kb_badge.jpg' } as const;

function ServiceCards({ services }: { readonly services: Extract<PageBlock, { type: 'services' }>['services'] }) {
  const prefersReducedMotion = Boolean(useReducedMotion());
  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
      {services.map((service, index) => (
        <motion.li
          key={service.title}
          initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={REVEAL_VIEWPORT}
          transition={{ duration: prefersReducedMotion ? 0 : 0.5, delay: prefersReducedMotion ? 0 : index * 0.08, ease: REVEAL_EASE }}
          className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_10px_28px_-20px_rgba(28,31,33,0.4)]"
        >
          <div className="flex flex-col gap-3 p-5 sm:p-7">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-[#F1E8D6]">
              <ServiceIcon icon={service.icon} />
            </span>
            <h3 className="font-display text-[20px] sm:text-[23px] font-semibold text-[#1C1F21]">{service.title}</h3>
            <p className="text-[15px] sm:text-[16px] leading-[1.55] text-[#1C1F21]/72">{service.text}</p>
          </div>
          {/* Photo du produit (provisoire : découpée d'une maquette) */}
          <div className="mt-auto h-[150px] sm:h-[190px] bg-gradient-to-b from-white to-[#F1ECE1]">
            <img src={SERVICE_IMAGES[service.icon]} alt="" loading="lazy" className="h-full w-full object-cover mix-blend-multiply" />
          </div>
        </motion.li>
      ))}
    </ul>
  );
}

const CHANNEL_ICONS = { phone: Phone, whatsapp: MessageCircle, quote: FileText } as const;

function ContactChannels({ ctx }: { readonly ctx: PageContext }) {
  const whatsappUrl = buildWhatsAppUrl(WHATSAPP_CONFIG.phoneDisplay, WHATSAPP_CONFIG.prefilledMessage);
  const base =
    'inline-flex w-full h-11 items-center justify-center gap-2.5 rounded-full px-5 text-[15px] whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7D612D] cursor-pointer';
  const primary = `${base} bg-[#B79A62] hover:bg-[#C6AA73] active:bg-[#A68952] text-[#1C1F21] font-semibold`;
  const secondary = `${base} border border-[#1C1F21]/25 hover:border-[#1C1F21] hover:bg-[#1C1F21]/5 text-[#1C1F21] font-medium`;
  return (
    <ul className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
      {CONTACT_PAGE_CONFIG.channels.map((channel) => {
        const Icon = CHANNEL_ICONS[channel.id];
        return (
          <li
            key={channel.id}
            className="flex flex-col gap-4 rounded-xl border border-[#1C1F21]/12 bg-[#FFFFFF] p-7 transition-colors duration-200 hover:border-[#B79A62]"
          >
            <span className="grid h-12 w-12 place-items-center rounded-full border border-[#B79A62]/45 bg-[#F7F5F0] text-[#7D612D]">
              <Icon className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
            </span>
            <h3 className="font-display text-[21px] font-semibold text-[#1C1F21]">{channel.title}</h3>
            <p className="text-[15.5px] leading-[1.6] text-[#1C1F21]/72">{channel.text}</p>
            {channel.id === 'phone' && (
              <p className="font-display text-[20px] font-semibold tabular-nums text-[#1C1F21]">{ctx.brand.phoneDisplay}</p>
            )}
            <div className="mt-auto pt-2">
              {channel.id === 'phone' && (
                <a href={ctx.brand.phoneHref} className={primary}>
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  {channel.ctaLabel}
                </a>
              )}
              {channel.id === 'whatsapp' && (
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={secondary}>
                  <MessageCircle className="h-4 w-4 text-[#7D612D]" aria-hidden="true" />
                  {channel.ctaLabel}
                </a>
              )}
              {channel.id === 'quote' && (
                <button type="button" onClick={() => ctx.onOpenQuoteModal()} className={secondary}>
                  <FileText className="h-4 w-4 text-[#7D612D]" aria-hidden="true" />
                  {channel.ctaLabel}
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function LegalArticles({ articles }: { readonly articles: Extract<PageBlock, { type: 'legal' }>['articles'] }) {
  return (
    <div className="max-w-3xl rounded-xl border border-[#1C1F21]/12 bg-[#FFFFFF] divide-y divide-[#1C1F21]/10">
      {articles.map((article) => (
        <article key={article.heading} className="p-6 sm:p-8">
          <h3 className="font-display text-[20px] font-semibold text-[#1C1F21]">{article.heading}</h3>
          {article.paragraphs.map((p) => (
            <p key={p} className="mt-3 text-[15.5px] leading-[1.7] text-[#1C1F21]/80">
              {p}
            </p>
          ))}
          {article.pending && (
            <p className="mt-3 rounded-lg border border-dashed border-[#B79A62]/60 bg-[#F7F5F0] px-4 py-3 text-[14px] italic text-[#7D612D]">
              À compléter : {article.pending}
            </p>
          )}
        </article>
      ))}
    </div>
  );
}

/** Appel à l'action final : panneau clair (photo en coin, vague dorée) sur fond sombre. */
function CtaPanel({ block, ctx }: { readonly block: Extract<PageBlock, { type: 'cta' }>; readonly ctx: PageContext }) {
  return (
    <section id={block.id} aria-labelledby={`${block.id}-title`} className="w-full bg-white">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10 py-12 sm:py-16 lg:py-20">
        <div className="relative overflow-hidden rounded-3xl bg-[#FAF7F1] p-6 sm:p-8 lg:p-12">
          <div aria-hidden="true" className="absolute right-0 top-0 h-[140px] w-[92%] sm:h-[180px] sm:w-[60%] lg:h-full lg:w-[42%]">
            <img src={ZONE_INTERVENTION_CONFIG.bannerSrc} alt="" loading="lazy" className="h-full w-full object-cover object-[30%_40%]" />
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
              <path d="M-1 -1 L2 -1 C30 0 42 22 55 52 C66 80 80 97 101 100 V101 H-1 Z" className="lg:hidden" fill="#FAF7F1" />
              <path d="M2 -1 C30 0 42 22 55 52 C66 80 80 97 101 100" className="lg:hidden" fill="none" stroke="#B79A62" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
              <path d="M-1 -1 H18 C6 30 6 70 22 101 H-1 Z" className="hidden lg:block" fill="#FAF7F1" />
              <path d="M18 -1 C6 30 6 70 22 101" className="hidden lg:block" fill="none" stroke="#B79A62" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
          <div className="relative max-w-[560px] pt-[110px] sm:pt-[150px] lg:pt-0">
            <p className="section-kicker flex items-center gap-3 font-semibold text-[#9C7C40]">
              <span aria-hidden="true" className="h-0.5 w-8 bg-[#B79A62]" />
              {block.kicker}
            </p>
            <h2 id={`${block.id}-title`} className="mt-3 font-display text-[28px] sm:text-[38px] font-bold leading-[1.1] tracking-[-0.015em] text-[#1C1F21]">
              {block.title}
            </h2>
            {block.subtitle && <p className="mt-3 text-[15.5px] sm:text-[17px] leading-[1.6] text-[#1C1F21]/70">{block.subtitle}</p>}
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
              {block.primary ? (
                <a
                  href={hrefForPage(block.primary.page, ctx.routerMode)}
                  className="group inline-flex h-12 items-center gap-2 rounded-full bg-[#B79A62] px-6 text-[15.5px] font-semibold text-[#1C1F21] hover:bg-[#C6AA73] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C1F21]"
                >
                  {block.primary.label}
                  <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => ctx.onOpenQuoteModal()}
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-[#B79A62] px-6 text-[15.5px] font-semibold text-[#1C1F21] hover:bg-[#C6AA73] transition-colors duration-150 cursor-pointer"
                >
                  Demander un devis
                </button>
              )}
              <a
                href={ctx.brand.phoneHref}
                className="inline-flex items-center gap-2 text-[15.5px] font-semibold tabular-nums text-[#1C1F21] underline decoration-[#B79A62] decoration-2 underline-offset-[6px] hover:text-[#7D612D]"
              >
                <Phone className="h-4 w-4 text-[#7D612D]" strokeWidth={1.9} aria-hidden="true" />
                {ctx.brand.phoneDisplay}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Affiche un bloc de page. */
export function PageBlockView({ block, ctx }: { readonly block: PageBlock; readonly ctx: PageContext }) {
  switch (block.type) {
    case 'cards':
      return (
        <PageSection id={block.id} tone={block.tone} kicker={block.kicker} title={block.title} subtitle={block.subtitle}>
          <NumberedCards items={block.items} columns={block.columns} />
        </PageSection>
      );
    case 'steps':
      return (
        <PageSection id={block.id} tone="dark" kicker={block.kicker} title={block.title} subtitle={block.subtitle}>
          <NumberedSteps steps={block.steps} />
        </PageSection>
      );
    case 'services':
      return (
        <PageSection id={block.id} tone="light" kicker={block.kicker} title={block.title} subtitle={block.subtitle}>
          <ServiceCards services={block.services} />
        </PageSection>
      );
    case 'faq':
      return (
        <FaqSection
          sectionId={block.id}
          tone={block.tone}
          showContact={!block.hideContact}
          brand={ctx.brand}
          onOpenQuoteModal={() => ctx.onOpenQuoteModal()}
          config={{
            kicker: block.kicker,
            title: block.title,
            subtitle: block.subtitle ?? '',
            contactPrompt: FAQ_CONFIG.contactPrompt,
            quoteCtaLabel: FAQ_CONFIG.quoteCtaLabel,
            items: block.items,
          }}
        />
      );
    case 'insurance':
      return (
        <PageSection id={block.id} tone="dark" kicker={block.kicker} title={block.title} subtitle={block.subtitle}>
          <InsuranceNotice config={AFTER_INCIDENT_CONFIG.insuranceNotice} onSendPhotos={ctx.onSendPhotos} />
        </PageSection>
      );
    case 'domains':
      return (
        <PageSection id={block.id} tone="light" kicker={block.kicker} title={block.title} subtitle={block.subtitle}>
          <DomainCards excludeId={block.excludeId} ctx={ctx} />
        </PageSection>
      );
    case 'contactChannels':
      return (
        <PageSection id={block.id} tone="light" kicker={block.kicker} title={block.title} subtitle={block.subtitle}>
          <ContactChannels ctx={ctx} />
        </PageSection>
      );
    case 'contactForm':
      return (
        <ContactFormSection
          id={block.id}
          kicker={block.kicker}
          title={block.title}
          brand={ctx.brand}
          whatsapp={WHATSAPP_CONFIG}
          agencies={AGENCIES_CONFIG.agencies}
          routerMode={ctx.routerMode}
        />
      );
    case 'legal':
      return (
        <PageSection id={block.id} tone="light" kicker={block.kicker} title={block.title} subtitle={block.subtitle}>
          <LegalArticles articles={block.articles} />
        </PageSection>
      );
    case 'cta':
      return <CtaPanel block={block} ctx={ctx} />;
    case 'audiences':
      return (
        <PageSection id={block.id} tone="light" kicker={block.kicker} title={block.title} subtitle={block.subtitle}>
          <AudienceCards items={block.items} ctx={ctx} />
        </PageSection>
      );
    case 'features':
      return (
        <PageSection id={block.id} tone="light" kicker={block.kicker} title={block.title} subtitle={block.subtitle}>
          <FeatureCards items={block.items} />
        </PageSection>
      );
    case 'process':
      return (
        <PageSection id={block.id} tone={block.tone} kicker={block.kicker} title={block.title} subtitle={block.subtitle}>
          <ProcessSteps steps={block.steps} tone={block.tone} icons={block.icons} />
        </PageSection>
      );
    case 'incidentServices':
      return (
        <PageSection id={block.id} tone="light" kicker={block.kicker} title={block.title} subtitle={block.subtitle}>
          <IncidentServiceGrid services={AFTER_INCIDENT_CONFIG.services} />
        </PageSection>
      );
    case 'beforeAfter':
      return (
        <PageSection id={block.id} tone="dark" kicker={block.kicker} title={block.title} subtitle={block.subtitle}>
          <BeforeAfterCases items={block.items} />
        </PageSection>
      );
    case 'brands':
      return <BrandsSection config={BRANDS_CONFIG} contactHref={hrefForPage('devis', ctx.routerMode)} />;
    case 'urgency':
      return <UrgencySection config={URGENCY_VARIANTS[block.variant ?? 'serrurerie']} brand={ctx.brand} />;
    case 'agencies':
      return <AgenciesSection config={AGENCIES_CONFIG} brand={ctx.brand} />;
    case 'zone':
      return (
        <ZoneInterventionSection
          config={ZONE_INTERVENTION_CONFIG}
          onRequestQuoteForDistrict={(district) => ctx.onOpenQuoteModal(undefined, district)}
          embedded={block.embedded}
        />
      );
    case 'reviews':
      return <ReviewsSection config={REVIEWS_CONFIG} layout="grid" hideHeading={block.hideHeading} />;
  }
}

/** Couleur de la section qui suit l'en-tête (remplissage de la vague dorée). */
function heroNextFill(page: PageDefinition): string {
  const first = page.blocks[0];
  if (!first) {
    return '#F7F5F0';
  }
  const tone = blockTone(first);
  return tone === 'band' ? '#FFFFFF' : tone === 'dark' ? '#1C1F21' : '#F7F5F0';
}

/** Page intérieure complète : en-tête + blocs. */
export function PageRenderer({ page, ctx }: { readonly page: PageDefinition; readonly ctx: PageContext }) {

  return (
    <>
      <div className={page.hero.hideOnMobile ? 'hidden lg:block' : undefined}>
      <PageHero
        title={page.hero.title}
        intro={page.hero.intro}
        imageSrc={page.hero.imageSrc}
        imagePosition={page.hero.imagePosition}
        compact={page.hero.compact}
        highlights={page.hero.highlights}
        shortcuts={page.hero.shortcuts}
        nextFill={heroNextFill(page)}
        actions={
          page.hero.actions.length > 0 ? (
            <>
              {page.hero.actions.map((action, index) => (
                <HeroActionButton key={`${action.kind}-${index}`} action={action} primary={index === 0} ctx={ctx} />
              ))}
            </>
          ) : undefined
        }
      />
      </div>
      {page.blocks.map((block, index) => (
        <PageBlockView key={'id' in block ? block.id : `${block.type}-${index}`} block={block} ctx={ctx} />
      ))}
    </>
  );
}
