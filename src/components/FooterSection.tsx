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
      className="w-full bg-[#16191B] border-t border-[#B79A62]/65 scroll-mt-[74px] lg:scroll-mt-[88px]"
    >
      {/* Appel à l'action sur panneau clair : photo clés & badge, trois façons de nous joindre, boutiques */}
      {!hideCta && (
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10 pt-10 sm:pt-14">
          <div className="relative overflow-hidden rounded-3xl bg-[#F7F5F0] p-5 sm:p-8 lg:p-10">
            {/* Photo : bandeau courbé (mobile) / coin haut droit arrondi avec filet doré (bureau) */}
            <div className="kb-curve relative -mx-5 -mt-5 mb-5 sm:-mx-8 sm:-mt-8 lg:hidden">
              <img src={CTA_IMAGE} alt="" loading="lazy" className="h-[150px] sm:h-[200px] w-full object-cover" />
            </div>
            <div aria-hidden="true" className="hidden lg:block absolute right-0 top-0 h-[230px] w-[40%] bg-[#B79A62] [clip-path:ellipse(100%_100%_at_100%_0%)]">
              <img
                src={CTA_IMAGE}
                alt=""
                loading="lazy"
                className="h-[226px] w-[calc(100%-4px)] ml-auto object-cover [clip-path:ellipse(100%_100%_at_100%_0%)]"
              />
            </div>

            <div className="relative max-w-2xl lg:max-w-[56%]">
              <p className="section-kicker flex items-center gap-3 text-[#7D612D]">
                <span aria-hidden="true" className="h-0.5 w-8 bg-[#B79A62]" />
                {config.ctaKicker}
              </p>
              <p className="mt-2 font-display text-[32px] sm:text-[44px] font-semibold leading-[1.05] tracking-[-0.02em] text-[#1C1F21]">
                {config.ctaTitle}
              </p>
              <p className="mt-3 text-[15.5px] leading-[1.6] text-[#1C1F21]/70">{config.ctaSubtitle}</p>
            </div>

            <ul className="relative mt-7 grid gap-3 sm:gap-4 md:grid-cols-3">
              {[
                { href: brand.phoneHref, icon: KeyRound, title: 'Urgence', text: 'Porte claquée, effraction, serrure bloquée.', action: brand.phoneDisplay, actionIcon: Phone, primary: true, external: false },
                { href: pageHref('devis'), icon: FileText, title: 'Devis en ligne', text: 'Décrivez votre besoin en quelques questions.', action: config.quoteCtaLabel, actionIcon: null, primary: false, external: false },
                { href: whatsappUrl, icon: MessageCircle, title: 'WhatsApp', text: 'Envoyez une photo de votre porte ou de votre serrure.', action: 'Écrire sur WhatsApp', actionIcon: null, primary: false, external: true },
              ].map((item) => (
                <li key={item.title} className="flex flex-col rounded-2xl bg-gradient-to-b from-white to-[#FBFAF6] p-4 sm:p-5 shadow-[0_10px_28px_-18px_rgba(28,31,33,0.4)] ring-1 ring-[#1C1F21]/5">
                  <div className="flex items-start gap-4">
                    <span aria-hidden="true" className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#F1E8D6] text-[#9C7C40] ring-1 ring-[#B79A62]/25">
                      <item.icon className="h-[22px] w-[22px]" strokeWidth={1.6} />
                    </span>
                    <div className="min-w-0">
                      <p className="font-display text-[19px] font-semibold leading-tight text-[#1C1F21]">{item.title}</p>
                      <p className="mt-1 text-[14.5px] leading-[1.45] text-[#1C1F21]/65">{item.text}</p>
                    </div>
                  </div>
                  <a
                    href={item.href}
                    {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className={`group mt-4 sm:mt-5 flex h-11 items-center justify-center gap-2.5 rounded-full px-5 text-[15px] font-semibold tabular-nums transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79A62] ${
                      item.primary
                        ? 'bg-[#1C1F21] text-[#F3F0E7] hover:bg-[#292D2F]'
                        : 'border border-[#B79A62]/60 bg-white/60 text-[#1C1F21] hover:border-[#B79A62] hover:bg-white'
                    }`}
                  >
                    {item.actionIcon && <item.actionIcon className="h-4 w-4 text-[#B79A62]" strokeWidth={1.9} aria-hidden="true" />}
                    {item.action}
                    <ArrowRight className="h-4 w-4 text-[#B79A62] transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>

            <p className="relative mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-[15px] text-[#1C1F21]/70">
              <Store className="h-5 w-5 text-[#9C7C40]" strokeWidth={1.7} aria-hidden="true" />
              Ou passez en boutique :
              {agencies.map((agency, index) => (
                <span key={agency.id} className="inline-flex items-center gap-3">
                  {index > 0 && <span aria-hidden="true" className="h-1 w-1 rounded-full bg-[#B79A62]" />}
                  <a
                    href={agency.directionsUrl || pageHref('agences-contact')}
                    {...(agency.directionsUrl ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="font-semibold text-[#1C1F21] underline decoration-[#B79A62] decoration-2 underline-offset-[6px] hover:text-[#7D612D]"
                  >
                    {agency.name.replace('Agence ', '')} ({agency.districtLabel.replace('Marseille ', '')})
                  </a>
                </span>
              ))}
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
