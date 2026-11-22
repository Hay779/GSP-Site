import { ArrowRight, FileText, KeyRound, MapPin, MessageCircle, Phone, Store } from 'lucide-react';
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
      {/* Appel à l'action sur panneau clair : trois façons de nous joindre + boutiques */}
      {!hideCta && (
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10 pt-10 sm:pt-14">
          <div className="rounded-3xl bg-[#F7F5F0] p-5 sm:p-8 lg:p-10">
            <div className="max-w-2xl">
              <p className="section-kicker text-[#7D612D]">{config.ctaKicker}</p>
              <p className="mt-2 font-display text-[28px] sm:text-[36px] font-semibold leading-[1.12] tracking-[-0.015em] text-[#1C1F21]">
                {config.ctaTitle}
              </p>
              <p className="mt-2 text-[15.5px] leading-[1.6] text-[#1C1F21]/70">{config.ctaSubtitle}</p>
            </div>

            <ul className="mt-6 grid gap-3 sm:gap-4 md:grid-cols-3">
              {[
                {
                  href: brand.phoneHref,
                  icon: KeyRound,
                  tone: 'bg-[#C0392B] text-white',
                  title: 'Urgence',
                  text: 'Porte claquée, effraction, serrure bloquée.',
                  action: brand.phoneDisplay,
                  external: false,
                },
                {
                  href: pageHref('devis'),
                  icon: FileText,
                  tone: 'bg-[#1C1F21] text-[#B79A62]',
                  title: 'Devis en ligne',
                  text: 'Décrivez votre besoin en quelques questions.',
                  action: config.quoteCtaLabel,
                  external: false,
                },
                {
                  href: whatsappUrl,
                  icon: MessageCircle,
                  tone: 'bg-[#1FA855] text-white',
                  title: 'WhatsApp',
                  text: 'Envoyez une photo de votre porte ou de votre serrure.',
                  action: 'Écrire sur WhatsApp',
                  external: true,
                },
              ].map((item) => (
                <li key={item.title}>
                  <a
                    href={item.href}
                    {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="group flex h-full items-start gap-4 rounded-2xl bg-white p-4 sm:p-5 shadow-[0_8px_24px_-16px_rgba(28,31,33,0.35)] transition-shadow duration-200 hover:shadow-[0_14px_30px_-14px_rgba(28,31,33,0.4)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79A62]"
                  >
                    <span aria-hidden="true" className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${item.tone}`}>
                      <item.icon className="h-5 w-5" strokeWidth={1.8} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-[17px] font-semibold text-[#1C1F21]">{item.title}</span>
                      <span className="mt-0.5 block text-[14px] leading-[1.45] text-[#1C1F21]/65">{item.text}</span>
                      <span className="mt-2.5 inline-flex items-center gap-1.5 text-[14.5px] font-semibold tabular-nums text-[#1C1F21] underline decoration-[#B79A62] decoration-2 underline-offset-[5px] group-hover:text-[#7D612D]">
                        {item.action}
                        <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[14.5px] text-[#1C1F21]/70">
              <Store className="h-4 w-4 text-[#7D612D]" strokeWidth={1.8} aria-hidden="true" />
              Ou passez en boutique :
              <a href={pageHref('agences-contact')} className="font-semibold text-[#1C1F21] hover:text-[#7D612D] underline underline-offset-4 decoration-[#1C1F21]/30">
                {agencies.map((agency) => `${agency.name.replace('Agence ', '')} (${agency.districtLabel.replace('Marseille ', '')})`).join(' · ')}
              </a>
            </p>
          </div>
        </div>
      )}

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
          </div>
        </div>
      </div>
    </footer>
  );
}
