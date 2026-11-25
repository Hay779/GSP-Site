import { MapPin, MessageCircle, Phone } from 'lucide-react';
import type { AgencyItem, DomainCardItem, FooterConfig, WhatsAppConfig } from '../data/sectionsContent';
import type { BrandConfig, SectionId } from '../utils/navigation';
import type { PageId } from '../utils/router';
import { buildWhatsAppUrl } from '../utils/whatsapp';
import { BrandMark } from './BrandMark';
import { ContactCtaSection } from './ContactCtaSection';
import { openCookieSettings } from './CookieBanner';
import { GA_MEASUREMENT_ID } from '../utils/analytics';

interface FooterSectionProps {
  readonly brand: BrandConfig;
  readonly config: FooterConfig;
  readonly agencies: readonly AgencyItem[];
  readonly whatsapp: WhatsAppConfig;
  /** Adresse de la page dédiée d'un domaine. */
  readonly domainHref: (domainId: DomainCardItem['id']) => string;
  /** Adresse d'une section de l'accueil (préfixée quand on est sur une page intérieure). */
  readonly sectionHref: (sectionId: SectionId) => string;
  /** Adresse d'une page thématique. */
  readonly pageHref: (pageId: PageId) => string;
  /** Masque le bandeau d'appel à l'action (ex. sur la page devis). */
  readonly hideCta?: boolean;
}

const LINK_CLASS =
  'text-[#F3F0E7]/80 hover:text-[#B79A62] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B79A62] rounded-xs';
/** Photo provisoire (découpée d'une maquette) : remplacer par une vraie photo clés & badge. */
const CTA_IMAGE = '/src/assets/images/cta_cles_badge.jpg';

const HEADING_CLASS = 'text-[12px] sm:text-[13px] font-semibold uppercase tracking-[0.16em] text-[#B79A62]';

export function FooterSection({
  brand,
  config,
  agencies,
  whatsapp,
  domainHref,
  sectionHref,
  pageHref,
  hideCta = false,
}: FooterSectionProps) {
  const whatsappUrl = buildWhatsAppUrl(whatsapp.phoneDisplay, whatsapp.prefilledMessage);
  const year = new Date().getFullYear();

  return (
    <footer
      id="11_Pied_De_Page"
      data-section="11_Pied_De_Page"
      className={`w-full scroll-mt-[74px] lg:scroll-mt-[88px] ${hideCta ? 'bg-[#16191B] border-t border-[#B79A62]/65' : 'bg-[#F6F2EA]'}`}
    >
      {/* Appel à l'action « Parlons-en » (photo clés & badge en vague dorée) */}
      {!hideCta && (
        <ContactCtaSection
          kicker={config.ctaKicker}
          title={config.ctaTitle}
          subtitle={config.ctaSubtitle}
          imageSrc={CTA_IMAGE}
          phoneDisplay={brand.phoneDisplay}
          phoneHref={brand.phoneHref}
          quoteHref={pageHref('devis')}
          quoteLabel={config.quoteCtaLabel}
          whatsappHref={whatsappUrl}
          agencies={agencies.map((agency) => ({
            id: agency.id,
            label: `${agency.name.replace('Agence ', '')} (${agency.districtLabel.replace('Marseille ', '')})`,
            href: agency.directionsUrl || pageHref('agences-contact'),
            external: Boolean(agency.directionsUrl),
          }))}
        />
      )}

      <div className={hideCta ? '' : 'rounded-t-[28px] sm:rounded-t-[40px] bg-[#16191B]'}>
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10 pt-12 sm:pt-14 pb-8 sm:pb-10">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-12 lg:gap-0 items-start">
          {/* Marque + contact */}
          <div className="col-span-2 lg:col-span-4 lg:pr-10">
            <a
              href={sectionHref('02_Hero')}
              aria-label={`${brand.name} — ${brand.city}, retour à l’accueil`}
              className="inline-flex rounded-md py-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B79A62]"
            >
              <BrandMark brand={brand} />
            </a>
            <p className="mt-5 max-w-sm text-[15px] leading-[1.6] text-[#F3F0E7]/65">{config.tagline}</p>
            <h2 className="sr-only">{config.contactHeading}</h2>
            <div className="mt-5 flex flex-col items-start gap-3">
              <a
                href={brand.phoneHref}
                className="inline-flex items-center gap-2.5 text-[17px] font-semibold text-[#F3F0E7] hover:text-[#B79A62] transition-colors duration-150 tabular-nums focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B79A62] rounded-xs"
              >
                <Phone className="h-[18px] w-[18px] shrink-0 text-[#B79A62]" strokeWidth={1.8} aria-hidden="true" />
                {brand.phoneDisplay}
              </a>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2.5 text-[15px] ${LINK_CLASS}`}>
                <MessageCircle className="h-[18px] w-[18px] shrink-0 text-[#B79A62]" strokeWidth={1.8} aria-hidden="true" />
                Écrire sur WhatsApp
              </a>
            </div>
          </div>

          {/* Nos métiers */}
          <nav aria-labelledby="footer-services" className="lg:col-span-3 lg:border-l lg:border-[#B79A62]/40 lg:pl-8">
            <h2 id="footer-services" className={HEADING_CLASS}>{config.servicesHeading}</h2>
            <ul className="mt-4 flex flex-col gap-2.5 text-[14.5px] sm:text-[15px]">
              {config.serviceLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={
                      link.domainId
                        ? domainHref(link.domainId)
                        : link.pageId
                          ? pageHref(link.pageId)
                          : link.targetId
                            ? sectionHref(link.targetId)
                            : '#'
                    }
                    className={LINK_CLASS}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Informations */}
          <nav aria-labelledby="footer-info" className="lg:col-span-2 lg:border-l lg:border-[#B79A62]/40 lg:pl-8">
            <h2 id="footer-info" className={HEADING_CLASS}>{config.infoHeading}</h2>
            <ul className="mt-4 flex flex-col gap-2.5 text-[14.5px] sm:text-[15px]">
              {config.infoLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.pageId ? pageHref(link.pageId) : link.targetId ? sectionHref(link.targetId) : '#'}
                    className={LINK_CLASS}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Nos agences */}
          <div className="col-span-2 lg:col-span-3 lg:border-l lg:border-[#B79A62]/40 lg:pl-8">
            <h2 className={HEADING_CLASS}>{config.agenciesHeading}</h2>
            <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-5">
              {agencies.map((agency) => (
                <li key={agency.id} className="flex gap-3">
                  <MapPin className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#B79A62]" strokeWidth={1.8} aria-hidden="true" />
                  <div className="text-[14.5px] leading-[1.55]">
                    <p className="font-semibold text-[#F3F0E7]">
                      {agency.name} <span className="font-normal text-[#F3F0E7]/55">· {agency.districtLabel}</span>
                    </p>
                    {!agency.isAddressPending &&
                      agency.addressLines.map((line) => (
                        <p key={line} className="text-[#F3F0E7]/70">
                          {line}
                        </p>
                      ))}
                  </div>
                </li>
              ))}
              <li className="sm:col-span-2 lg:col-span-1">
                <a href={pageHref('agences-contact')} className={`text-[14.5px] font-medium ${LINK_CLASS} !text-[#B79A62] hover:!text-[#D2B478]`}>
                  Horaires & itinéraires →
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Barre inférieure */}
        <div className="mt-12 flex flex-col gap-3 border-t border-[#F3F0E7]/12 pt-6 text-[13px] sm:text-[14px] text-[#F3F0E7]/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {brand.name} — Marseille
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <a href={pageHref('mentions-legales')} className={LINK_CLASS}>
              Mentions légales
            </a>
            <a href={pageHref('confidentialite')} className={LINK_CLASS}>
              Confidentialité
            </a>
            {GA_MEASUREMENT_ID && (
              <button type="button" onClick={openCookieSettings} className={`${LINK_CLASS} cursor-pointer`}>
                Gérer les cookies
              </button>
            )}
          </div>
        </div>
      </div>
      </div>
    </footer>
  );
}
