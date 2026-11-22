import { FileText, MessageCircle, Phone } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import type {
  AfterIncidentConfig,
  AfterIncidentPageConfig,
  ContactPageConfig,
  KeysBadgesPageConfig,
  WhatsAppConfig,
} from '../data/sectionsContent';
import type { BrandConfig } from '../utils/navigation';
import type { QuoteDomain } from '../utils/quoteForm';
import { hrefForHome, type RouterMode } from '../utils/router';
import { REVEAL_EASE, REVEAL_VIEWPORT } from '../utils/scrollReveal';
import { buildWhatsAppUrl } from '../utils/whatsapp';
import { InsuranceNotice } from './InsuranceNotice';
import { ServiceIcon } from './KeysBadgesSection';
import {
  PAGE_HERO_PRIMARY_BUTTON,
  PAGE_HERO_SECONDARY_BUTTON,
  PageHero,
  usePageMeta,
} from './PageHero';
import { NumberedCards, NumberedSteps, PageSection } from './PageSections';

interface CommonPageProps {
  readonly brand: BrandConfig;
  readonly routerMode: RouterMode;
  readonly quoteTriggerRef?: React.RefObject<HTMLButtonElement | null>;
}

function PhoneButton({ brand }: { readonly brand: BrandConfig }) {
  return (
    <a href={brand.phoneHref} className={PAGE_HERO_SECONDARY_BUTTON}>
      <Phone className="h-4 w-4 shrink-0 text-[#B79A62]" aria-hidden="true" />
      Appeler le {brand.phoneDisplay}
    </a>
  );
}

/* ------------------------------------------------------------------ */
/* Clés & badges                                                       */
/* ------------------------------------------------------------------ */

export function KeysBadgesPage({
  config,
  imageSrc,
  brand,
  routerMode,
  agenciesHref,
}: CommonPageProps & {
  readonly config: KeysBadgesPageConfig;
  readonly imageSrc: string;
  /** Lien vers la page Agences & contact. */
  readonly agenciesHref: string;
}) {
  const prefersReducedMotion = Boolean(useReducedMotion());
  usePageMeta(config.seoTitle, config.seoDescription);

  return (
    <>
      <PageHero
        kicker={config.kicker}
        title={config.title}
        intro={config.intro}
        imageSrc={imageSrc}
        imagePosition="65% 45%"
        breadcrumb={[{ label: 'Accueil', href: hrefForHome(routerMode) }, { label: config.title }]}
        actions={
          <>
            <a href={agenciesHref} className={PAGE_HERO_PRIMARY_BUTTON}>
              Trouver une agence
            </a>
            <PhoneButton brand={brand} />
          </>
        }
      />

      <PageSection id="page-services" tone="light" kicker={config.servicesKicker} title={config.servicesTitle}>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
          {config.services.map((service, index) => (
            <motion.li
              key={service.title}
              initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={REVEAL_VIEWPORT}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.5,
                delay: prefersReducedMotion ? 0 : index * 0.08,
                ease: REVEAL_EASE,
              }}
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
      </PageSection>

      <PageSection id="page-etapes" tone="dark" kicker={config.stepsKicker} title={config.stepsTitle}>
        <NumberedSteps steps={config.steps} />
      </PageSection>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Après sinistre                                                      */
/* ------------------------------------------------------------------ */

export function AfterIncidentPage({
  config,
  sectionConfig,
  routerMode,
  quoteTriggerRef,
  onOpenQuoteModal,
  onSendPhotos,
}: CommonPageProps & {
  readonly config: AfterIncidentPageConfig;
  readonly sectionConfig: AfterIncidentConfig;
  readonly onOpenQuoteModal: (domain: QuoteDomain) => void;
  readonly onSendPhotos: () => void;
}) {
  usePageMeta(config.seoTitle, config.seoDescription);

  return (
    <>
      <PageHero
        kicker={config.kicker}
        title={config.title}
        intro={config.intro}
        imageSrc={sectionConfig.imageSrc}
        imagePosition="70% 35%"
        breadcrumb={[{ label: 'Accueil', href: hrefForHome(routerMode) }, { label: config.kicker }]}
        actions={
          <>
            <button
              ref={quoteTriggerRef}
              type="button"
              onClick={() => onOpenQuoteModal('Après sinistre')}
              className={PAGE_HERO_PRIMARY_BUTTON}
            >
              {sectionConfig.primaryCtaLabel}
            </button>
            <button type="button" onClick={onSendPhotos} className={PAGE_HERO_SECONDARY_BUTTON}>
              {sectionConfig.secondaryCtaLabel}
            </button>
          </>
        }
      />

      <PageSection id="page-accompagnement" tone="light" kicker={config.stepsKicker} title={config.stepsTitle}>
        <NumberedCards items={sectionConfig.steps.map((step) => step.label)} columns={4} />
      </PageSection>

      <PageSection id="page-assurance" tone="dark" kicker={config.insuranceKicker} title={config.insuranceTitle}>
        <InsuranceNotice config={sectionConfig.insuranceNotice} onSendPhotos={onSendPhotos} />
      </PageSection>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Agences & contact                                                   */
/* ------------------------------------------------------------------ */

const CHANNEL_ICONS = {
  phone: Phone,
  whatsapp: MessageCircle,
  quote: FileText,
} as const;

export function ContactPage({
  config,
  whatsapp,
  brand,
  routerMode,
  quoteTriggerRef,
  onOpenQuoteModal,
  afterHero,
}: CommonPageProps & {
  readonly config: ContactPageConfig;
  readonly whatsapp: WhatsAppConfig;
  readonly onOpenQuoteModal: () => void;
  /** Blocs insérés entre l'en-tête et les moyens de contact (agences, zone). */
  readonly afterHero?: React.ReactNode;
}) {
  usePageMeta(config.seoTitle, config.seoDescription);
  const whatsappUrl = buildWhatsAppUrl(whatsapp.phoneDisplay, whatsapp.prefilledMessage);

  return (
    <>
      <PageHero
        kicker={config.kicker}
        title={config.title}
        intro={config.intro}
        breadcrumb={[{ label: 'Accueil', href: hrefForHome(routerMode) }, { label: config.kicker }]}
        actions={
          <>
            <button
              ref={quoteTriggerRef}
              type="button"
              onClick={onOpenQuoteModal}
              className={PAGE_HERO_PRIMARY_BUTTON}
            >
              Demander un devis
            </button>
            <PhoneButton brand={brand} />
          </>
        }
      />

      {afterHero}

      <PageSection id="page-contact" tone="light" kicker={config.channelsKicker} title={config.channelsTitle}>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {config.channels.map((channel) => {
            const Icon = CHANNEL_ICONS[channel.id];
            const buttonClass =
              'mt-auto inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-lg px-6 py-3 text-[15px] font-semibold whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7D612D] cursor-pointer';
            const primary = `${buttonClass} bg-[#B79A62] hover:bg-[#C6AA73] active:bg-[#A68952] text-[#1C1F21]`;
            const secondary = `${buttonClass} border border-[#1C1F21]/25 hover:border-[#1C1F21] hover:bg-[#1C1F21]/5 text-[#1C1F21] font-medium`;
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
                  <p className="font-display text-[20px] font-semibold tabular-nums text-[#1C1F21]">
                    {brand.phoneDisplay}
                  </p>
                )}
                <div className="mt-auto pt-2">
                  {channel.id === 'phone' && (
                    <a href={brand.phoneHref} className={`${primary} w-full`}>
                      <Phone className="h-4 w-4" aria-hidden="true" />
                      {channel.ctaLabel}
                    </a>
                  )}
                  {channel.id === 'whatsapp' && (
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={`${secondary} w-full`}>
                      <MessageCircle className="h-4 w-4 text-[#7D612D]" aria-hidden="true" />
                      {channel.ctaLabel}
                    </a>
                  )}
                  {channel.id === 'quote' && (
                    <button
                      type="button"
                      onClick={onOpenQuoteModal}
                      className={`${secondary} w-full`}
                    >
                      <FileText className="h-4 w-4 text-[#7D612D]" aria-hidden="true" />
                      {channel.ctaLabel}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </PageSection>
    </>
  );
}
