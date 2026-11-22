import { FileText, Phone } from 'lucide-react';
import type { DomainCardItem, FooterConfig } from '../data/sectionsContent';
import type { BrandConfig, SectionId } from '../utils/navigation';
import { BrandMark } from './BrandMark';
import type { LegalDocumentType } from './LegalNoticeModal';

interface FooterSectionProps {
  readonly brand: BrandConfig;
  readonly config: FooterConfig;
  readonly onSelectSection: (sectionId: SectionId) => void;
  readonly onSelectDomainId: (domainId: DomainCardItem['id']) => void;
  readonly onOpenQuoteModal: () => void;
  readonly onOpenLegalModal: (docType: LegalDocumentType) => void;
}

export function FooterSection({
  brand,
  config,
  onSelectSection,
  onSelectDomainId,
  onOpenQuoteModal,
  onOpenLegalModal,
}: FooterSectionProps) {
  return (
    <footer
      id="11_Pied_De_Page"
      data-section="11_Pied_De_Page"
      className="w-full bg-[#16191B] border-t border-[#B79A62]/65 scroll-mt-[74px] lg:scroll-mt-[88px]"
    >
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10 pt-12 sm:pt-14 pb-8 sm:pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-0 items-start">
          {/* Identité de marque */}
          <div className="sm:col-span-2 lg:col-span-4 lg:pr-8 lg:self-center">
            <a
              href="#02_Hero"
              onClick={() => onSelectSection('02_Hero')}
              aria-label={`${brand.name} — ${brand.city}, retour en haut de page`}
              className="inline-flex rounded-md py-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B79A62]"
            >
              <BrandMark brand={brand} />
            </a>
          </div>

          {/* Colonne NOS SERVICES */}
          <div className="lg:col-span-3 lg:border-l lg:border-[#B79A62]/50 lg:pl-7">
            <h2 className="text-[12px] sm:text-[13px] font-semibold uppercase tracking-[0.16em] text-[#B79A62]">
              {config.servicesHeading}
            </h2>
            <ul className="mt-4 flex flex-col gap-2.5 text-[15px] text-[#F3F0E7]/85">
              {config.serviceLinks.map((link) => (
                <li key={link.label}>
                  {link.domainId ? (
                    <button
                      type="button"
                      onClick={() => onSelectDomainId(link.domainId!)}
                      className="text-left text-[#F3F0E7]/85 hover:text-[#B79A62] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B79A62] rounded-xs cursor-pointer"
                    >
                      {link.label}
                    </button>
                  ) : (
                    <a
                      href={`#${link.targetId}`}
                      onClick={() => link.targetId && onSelectSection(link.targetId)}
                      className="text-[#F3F0E7]/85 hover:text-[#B79A62] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B79A62] rounded-xs"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne INFORMATIONS */}
          <div className="lg:col-span-2 lg:border-l lg:border-[#B79A62]/50 lg:pl-7">
            <h2 className="text-[12px] sm:text-[13px] font-semibold uppercase tracking-[0.16em] text-[#B79A62]">
              {config.infoHeading}
            </h2>
            <ul className="mt-4 flex flex-col gap-2.5 text-[15px] text-[#F3F0E7]/85">
              {config.infoLinks.map((link) => (
                <li key={link.targetId}>
                  <a
                    href={`#${link.targetId}`}
                    onClick={() => onSelectSection(link.targetId)}
                    className="text-[#F3F0E7]/85 hover:text-[#B79A62] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B79A62] rounded-xs"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne CONTACT */}
          <div className="lg:col-span-3 lg:border-l lg:border-[#B79A62]/50 lg:pl-7">
            <h2 className="text-[12px] sm:text-[13px] font-semibold uppercase tracking-[0.16em] text-[#B79A62]">
              {config.contactHeading}
            </h2>
            <div className="mt-4 flex flex-col items-start gap-3.5">
              <a
                href={brand.phoneHref}
                className="inline-flex items-center gap-2.5 text-[16px] font-semibold text-[#F3F0E7] hover:text-[#B79A62] transition-colors duration-150 tabular-nums focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B79A62] rounded-xs"
              >
                <Phone className="h-[18px] w-[18px] shrink-0 text-[#B79A62]" strokeWidth={1.8} aria-hidden="true" />
                <span>{brand.phoneDisplay}</span>
              </a>

              <button
                type="button"
                onClick={onOpenQuoteModal}
                className="inline-flex items-center gap-2.5 text-[15px] text-[#F3F0E7]/88 hover:text-[#B79A62] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B79A62] rounded-xs cursor-pointer"
              >
                <FileText className="h-[18px] w-[18px] shrink-0 text-[#B79A62]" strokeWidth={1.7} aria-hidden="true" />
                <span>{config.quoteCtaLabel}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Barre légale inférieure */}
        <div className="mt-10 sm:mt-12 border-t border-[#B79A62]/50 pt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[13px] sm:text-[14px] text-[#F3F0E7]/78">
          <button
            type="button"
            onClick={() => onOpenLegalModal('mentions')}
            className="hover:text-[#B79A62] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B79A62] rounded-xs cursor-pointer"
          >
            Mentions légales
          </button>
          <span aria-hidden="true" className="text-[#F3F0E7]/35">
            |
          </span>
          <button
            type="button"
            onClick={() => onOpenLegalModal('confidentialite')}
            className="hover:text-[#B79A62] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B79A62] rounded-xs cursor-pointer"
          >
            Confidentialité
          </button>
        </div>
      </div>
    </footer>
  );
}
