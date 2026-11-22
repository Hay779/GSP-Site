import { ArrowRight, FileText, MessageCircle, Phone } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import type { HeroAction, PageBlock, PageDefinition } from '../data/pages';
import {
  AFTER_INCIDENT_CONFIG,
  AGENCIES_CONFIG,
  CONTACT_PAGE_CONFIG,
  DOMAIN_PAGE_CONFIG,
  DOMAINS_CONFIG,
  FAQ_CONFIG,
  REVIEWS_CONFIG,
  URGENCY_CONFIG,
  WHATSAPP_CONFIG,
  ZONE_INTERVENTION_CONFIG,
} from '../data/sectionsContent';
import type { BrandConfig } from '../utils/navigation';
import type { QuoteDomain } from '../utils/quoteForm';
import {
  hrefForDomain,
  hrefForHome,
  hrefForHomeSection,
  hrefForPage,
  type Route,
  type RouterMode,
} from '../utils/router';
import { buildCardRevealMotion, REVEAL_EASE, REVEAL_VIEWPORT } from '../utils/scrollReveal';
import { buildWhatsAppUrl } from '../utils/whatsapp';
import { AgenciesSection } from './AgenciesSection';
import { FaqSection } from './FaqSection';
import { InsuranceNotice } from './InsuranceNotice';
import { ServiceIcon } from './KeysBadgesSection';
import {
  PAGE_HERO_PRIMARY_BUTTON,
  PAGE_HERO_SECONDARY_BUTTON,
  PageHero,
  usePageMeta,
  type BreadcrumbItem,
} from './PageHero';
import { NumberedCards, NumberedSteps, PageSection } from './PageSections';
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
    <ul className={`grid grid-cols-1 md:grid-cols-2 ${items.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-5 lg:gap-6`}>
      {items.map((item, index) => {
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
              href={hrefForDomain(item.id, ctx.routerMode)}
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
          className="flex flex-col gap-4 rounded-xl border border-[#1C1F21]/12 bg-[#FFFFFF] p-7 sm:p-8 transition-colors duration-200 hover:border-[#B79A62]"
        >
          <span className="grid h-14 w-14 place-items-center rounded-full border border-[#B79A62]/45 bg-[#F7F5F0]">
            <ServiceIcon icon={service.icon} />
          </span>
          <h3 className="font-display text-[22px] sm:text-[24px] font-semibold text-[#1C1F21]">{service.title}</h3>
          <p className="text-[16px] leading-[1.6] text-[#1C1F21]/75">{service.text}</p>
        </motion.li>
      ))}
    </ul>
  );
}

const CHANNEL_ICONS = { phone: Phone, whatsapp: MessageCircle, quote: FileText } as const;

function ContactChannels({ ctx }: { readonly ctx: PageContext }) {
  const whatsappUrl = buildWhatsAppUrl(WHATSAPP_CONFIG.phoneDisplay, WHATSAPP_CONFIG.prefilledMessage);
  const base =
    'inline-flex w-full min-h-[48px] items-center justify-center gap-2.5 rounded-lg px-6 py-3 text-[15px] whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7D612D] cursor-pointer';
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

function CtaActions({ ctx }: { readonly ctx: PageContext }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
      <button type="button" onClick={() => ctx.onOpenQuoteModal()} className={PAGE_HERO_PRIMARY_BUTTON}>
        Demander un devis
      </button>
      <a href={ctx.brand.phoneHref} className={PAGE_HERO_SECONDARY_BUTTON}>
        <Phone className="h-4 w-4 shrink-0 text-[#B79A62]" aria-hidden="true" />
        Appeler le {ctx.brand.phoneDisplay}
      </a>
    </div>
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
    case 'legal':
      return (
        <PageSection id={block.id} tone="light" kicker={block.kicker} title={block.title} subtitle={block.subtitle}>
          <LegalArticles articles={block.articles} />
        </PageSection>
      );
    case 'cta':
      return (
        <PageSection id={block.id} tone="dark" kicker={block.kicker} title={block.title} subtitle={block.subtitle}>
          <CtaActions ctx={ctx} />
        </PageSection>
      );
    case 'urgency':
      return <UrgencySection config={URGENCY_CONFIG} brand={ctx.brand} />;
    case 'agencies':
      return <AgenciesSection config={AGENCIES_CONFIG} brand={ctx.brand} />;
    case 'zone':
      return (
        <ZoneInterventionSection
          config={ZONE_INTERVENTION_CONFIG}
          onRequestQuoteForDistrict={(district) => ctx.onOpenQuoteModal(undefined, district)}
        />
      );
    case 'reviews':
      return <ReviewsSection config={REVIEWS_CONFIG} />;
  }
}

/** Page intérieure complète : en-tête + blocs. */
export function PageRenderer({ page, ctx }: { readonly page: PageDefinition; readonly ctx: PageContext }) {
  usePageMeta(page.seoTitle, page.seoDescription);

  const breadcrumb: BreadcrumbItem[] = [{ label: DOMAIN_PAGE_CONFIG.breadcrumbHomeLabel, href: hrefForHome(ctx.routerMode) }];
  if (page.hero.breadcrumbParent === 'domaines') {
    breadcrumb.push({
      label: DOMAIN_PAGE_CONFIG.breadcrumbDomainsLabel,
      href: hrefForHomeSection('05_Nos_Domaines', ctx.route, ctx.routerMode),
    });
  }
  breadcrumb.push({ label: page.hero.breadcrumbLabel ?? page.hero.title.replace(/\.$/, '') });

  return (
    <>
      <PageHero
        kicker={page.hero.kicker}
        title={page.hero.title}
        intro={page.hero.intro}
        imageSrc={page.hero.imageSrc}
        imagePosition={page.hero.imagePosition}
        compact={page.hero.compact}
        breadcrumb={breadcrumb}
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
      {page.blocks.map((block, index) => (
        <PageBlockView key={'id' in block ? block.id : `${block.type}-${index}`} block={block} ctx={ctx} />
      ))}
    </>
  );
}
