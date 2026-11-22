import { useEffect, useRef, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { AfterIncidentSection } from './components/AfterIncidentSection';
import { AgenciesSection } from './components/AgenciesSection';
import { BrandsSection } from './components/BrandsSection';
import { DomainPage } from './components/DomainPage';
import { DomainsSection } from './components/DomainsSection';
import { FaqSection } from './components/FaqSection';
import { FooterSection } from './components/FooterSection';
import { HeaderSection } from './components/HeaderSection';
import { HeroSection } from './components/HeroSection';
import { IncidentPhotoModal } from './components/IncidentPhotoModal';
import { KeysBadgesSection } from './components/KeysBadgesSection';
import { LegalNoticeModal, type LegalDocumentType } from './components/LegalNoticeModal';
import { QuoteModal } from './components/QuoteModal';
import { ReviewsSection } from './components/ReviewsSection';
import { UrgencySection } from './components/UrgencySection';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton';
import { ZoneInterventionSection } from './components/ZoneInterventionSection';
import { HERO_CONFIG } from './data/heroConfig';
import {
  AFTER_INCIDENT_CONFIG,
  AGENCIES_CONFIG,
  BRANDS_CONFIG,
  DOMAINS_CONFIG,
  DOMAIN_PAGE_CONFIG,
  FAQ_CONFIG,
  FOOTER_CONFIG,
  KEYS_BADGES_CONFIG,
  REVIEWS_CONFIG,
  URGENCY_CONFIG,
  WHATSAPP_CONFIG,
  ZONE_INTERVENTION_CONFIG,
  type DomainCardItem,
} from './data/sectionsContent';
import {
  BRAND_CONFIG,
  HEADER_NAV_ITEMS,
  PROVISIONAL_SECTIONS,
  resolveActiveSectionId,
  type SectionId,
  type SectionPosition,
} from './utils/navigation';
import type { QuoteDomain } from './utils/quoteForm';
import { useRouter, ROUTER_MODE } from './hooks/useRouter';
import { hrefForDomain, hrefForHomeSection } from './utils/router';

const NAV_TARGET_IDS: readonly SectionId[] = HEADER_NAV_ITEMS.map((item) => item.targetId);

export default function App() {
  const [activeSectionId, setActiveSectionId] = useState<SectionId | null>(null);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [quoteInitialDomain, setQuoteInitialDomain] = useState<QuoteDomain | undefined>(
    undefined
  );
  const [quoteInitialDistrict, setQuoteInitialDistrict] = useState<string | undefined>(
    undefined
  );
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [legalDocument, setLegalDocument] = useState<LegalDocumentType | null>(null);
  const quoteTriggerRef = useRef<HTMLButtonElement | null>(null);
  const { route, navigate } = useRouter();
  const currentDomain =
    route.kind === 'domain' ? DOMAINS_CONFIG.items.find((item) => item.id === route.id) ?? null : null;
  const sectionHref = (sectionId: SectionId) => hrefForHomeSection(sectionId, route, ROUTER_MODE);
  const domainHref = (domainId: DomainCardItem['id']) => hrefForDomain(domainId, ROUTER_MODE);

  useEffect(() => {
    const updateActiveSection = () => {
      const positions: SectionPosition[] = [];
      for (const section of PROVISIONAL_SECTIONS) {
        const el = document.getElementById(section.id);
        if (el) {
          positions.push({
            id: section.id,
            top: el.getBoundingClientRect().top,
          });
        }
      }

      const nextActive = resolveActiveSectionId(positions, NAV_TARGET_IDS, 140);
      setActiveSectionId(nextActive);
    };

    updateActiveSection();
    window.addEventListener('scroll', updateActiveSection, { passive: true });
    window.addEventListener('resize', updateActiveSection);
    return () => {
      window.removeEventListener('scroll', updateActiveSection);
      window.removeEventListener('resize', updateActiveSection);
    };
  }, [route]);

  const handleSelectSection = (sectionId: SectionId) => {
    if (NAV_TARGET_IDS.includes(sectionId)) {
      setActiveSectionId(sectionId);
    } else {
      setActiveSectionId(null);
    }
  };

  const handleOpenQuoteModal = (domain?: QuoteDomain, district?: string) => {
    setPhotoModalOpen(false);
    setLegalDocument(null);
    setQuoteInitialDomain(domain);
    setQuoteInitialDistrict(district);
    setQuoteModalOpen(true);
  };

  const handleCloseQuoteModal = () => {
    setQuoteModalOpen(false);
    window.requestAnimationFrame(() => {
      quoteTriggerRef.current?.focus();
    });
  };


  return (
    <MotionConfig reducedMotion="user">
    <div
      data-testid="page-stack"
      className="min-h-screen flex flex-col bg-[#1C1F21] text-[#F3F0E7]"
    >
      <a
        href="#02_Hero"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-[#B79A62] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[#1C1F21]"
      >
        Aller au contenu principal
      </a>

      {/* 01_Entete */}
      <HeaderSection
        brand={BRAND_CONFIG}
        navItems={HEADER_NAV_ITEMS}
        activeSectionId={activeSectionId}
        onSelectSection={handleSelectSection}
        sectionHref={sectionHref}
      />

      {currentDomain ? (
        /* Page métier dédiée */
        <main className="flex-1 flex flex-col">
          <DomainPage
            domain={currentDomain}
            otherDomains={DOMAINS_CONFIG.items.filter((item) => item.id !== currentDomain.id)}
            config={DOMAIN_PAGE_CONFIG}
            brand={BRAND_CONFIG}
            route={route}
            routerMode={ROUTER_MODE}
            onOpenQuoteModal={(domain) => handleOpenQuoteModal(domain)}
            quoteTriggerRef={quoteTriggerRef}
          />
          <UrgencySection config={URGENCY_CONFIG} brand={BRAND_CONFIG} />
          <AgenciesSection config={AGENCIES_CONFIG} brand={BRAND_CONFIG} />
        </main>
      ) : (
      /* 02_Hero -> 10_Nos_Agences */
      <main className="flex-1 flex flex-col">
        <HeroSection
          config={HERO_CONFIG}
          onOpenQuoteModal={() => handleOpenQuoteModal()}
          onSelectSection={handleSelectSection}
          quoteTriggerRef={quoteTriggerRef}
        />

        <UrgencySection config={URGENCY_CONFIG} brand={BRAND_CONFIG} />

        <KeysBadgesSection
          config={KEYS_BADGES_CONFIG}
          onSelectSection={handleSelectSection}
        />

        <DomainsSection
          config={DOMAINS_CONFIG}
          onSelectDomain={(domain) => navigate(domainHref(domain.id))}
        />

        <BrandsSection config={BRANDS_CONFIG} />

        <AfterIncidentSection
          config={AFTER_INCIDENT_CONFIG}
          onDescribeNeed={() => handleOpenQuoteModal('Après sinistre')}
          onSendPhotos={() => setPhotoModalOpen(true)}
        />

        <ReviewsSection config={REVIEWS_CONFIG} />

        <ZoneInterventionSection
          config={ZONE_INTERVENTION_CONFIG}
          onRequestQuoteForDistrict={(district) => handleOpenQuoteModal(undefined, district)}
        />

        <AgenciesSection config={AGENCIES_CONFIG} brand={BRAND_CONFIG} />

        <FaqSection
          config={FAQ_CONFIG}
          brand={BRAND_CONFIG}
          onOpenQuoteModal={() => handleOpenQuoteModal()}
        />
      </main>
      )}

      {/* 11_Pied_De_Page */}
      <FooterSection
        brand={BRAND_CONFIG}
        config={FOOTER_CONFIG}
        onSelectSection={handleSelectSection}
        domainHref={domainHref}
        sectionHref={sectionHref}
        onOpenQuoteModal={() => handleOpenQuoteModal()}
        onOpenLegalModal={(docType) => setLegalDocument(docType)}
      />


      {/* Formulaire de devis intégré */}
      <QuoteModal
        isOpen={quoteModalOpen}
        brand={BRAND_CONFIG}
        initialDomain={quoteInitialDomain}
        initialDistrict={quoteInitialDistrict}
        onClose={handleCloseQuoteModal}
      />

      {/* Reportage photo après sinistre */}
      <IncidentPhotoModal
        isOpen={photoModalOpen}
        brand={BRAND_CONFIG}
        onClose={() => setPhotoModalOpen(false)}
      />

      {/* Mentions légales & politique de confidentialité */}
      <LegalNoticeModal
        documentType={legalDocument}
        brand={BRAND_CONFIG}
        onClose={() => setLegalDocument(null)}
      />

      {/* Bouton flottant WhatsApp urgence */}
      <WhatsAppFloatingButton config={WHATSAPP_CONFIG} />
    </div>
    </MotionConfig>
  );
}
