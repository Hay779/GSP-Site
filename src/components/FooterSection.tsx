import { FileText, MapPin, MessageCircle, Phone } from 'lucide-react';
import type { AgencyItem, DomainCardItem, FooterConfig, WhatsAppConfig } from '../data/sectionsContent';
import type { BrandConfig, SectionId } from '../utils/navigation';
import type { PageId } from '../utils/router';
import { buildWhatsAppUrl } from '../utils/whatsapp';
import { BrandMark } from './BrandMark';

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
      className="w-full bg-[#16191B] border-t border-[#B79A62]/65 scroll-mt-[74px] lg:scroll-mt-[88px]"
    >
      {/* Bandeau d'appel à l'action */}
      {!hideCta && (
        <div className="border-b border-[#F3F0E7]/10 bg-[radial-gradient(ellipse_70%_120%_at_85%_0%,rgba(183,154,98,0.14),transparent_70%)]">
          <div className="mx-auto flex max-w-[1280px] flex-col gap-7 px-5 py-12 sm:px-8 sm:py-14 lg:flex-row lg:items-center lg:justify-between lg:px-10">
            <div className="max-w-xl">
              <p className="section-kicker text-[#B79A62]">{config.ctaKicker}</p>
              <p className="mt-3 section-title text-[#F3F0E7]">{config.ctaTitle}</p>
              <p className="mt-3 text-[16px] leading-[1.6] text-[#F3F0E7]/72">{config.ctaSubtitle}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 shrink-0">
              <a
                href={pageHref('devis')}
                className="inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-lg bg-[#B79A62] hover:bg-[#C6AA73] active:bg-[#A68952] px-7 py-3 text-[16px] font-semibold text-[#1C1F21] whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F3F0E7]"
              >
                <FileText className="h-[18px] w-[18px]" strokeWidth={1.9} aria-hidden="true" />
                {config.quoteCtaLabel}
              </a>
              <a
                href={brand.phoneHref}
                className="inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-lg border border-[#F3F0E7]/55 hover:border-[#F3F0E7] hover:bg-[#F3F0E7]/10 px-7 py-3 text-[16px] font-medium text-[#F3F0E7] tabular-nums whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79A62]"
              >
                <Phone className="h-[18px] w-[18px] text-[#B79A62]" strokeWidth={1.9} aria-hidden="true" />
                {brand.phoneDisplay}
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10 pt-12 sm:pt-14 pb-8 sm:pb-10">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-0 items-start">
          {/* Marque + contact */}
          <div className="sm:col-span-2 lg:col-span-4 lg:pr-10">
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
            <ul className="mt-4 flex flex-col gap-2.5 text-[15px]">
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
            <ul className="mt-4 flex flex-col gap-2.5 text-[15px]">
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
          <div className="lg:col-span-3 lg:border-l lg:border-[#B79A62]/40 lg:pl-8">
            <h2 className={HEADING_CLASS}>{config.agenciesHeading}</h2>
            <ul className="mt-4 flex flex-col gap-5">
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
              <li>
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
          </div>
        </div>
      </div>
    </footer>
  );
}
