import { useEffect, useRef, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { AfterIncidentSection } from './components/AfterIncidentSection';
import { AgenciesSection } from './components/AgenciesSection';
import { BrandsSection } from './components/BrandsSection';
import { PageRenderer } from './components/PageRenderer';
import { DomainsSection } from './components/DomainsSection';
import { FaqSection } from './components/FaqSection';
import { FooterSection } from './components/FooterSection';
import { FocusHeader } from './components/FocusHeader';
import { HeaderSection, type HeaderNavLink } from './components/HeaderSection';
import { HeroSection } from './components/HeroSection';
import { IncidentPhotoModal } from './components/IncidentPhotoModal';
import { KeysBadgesSection } from './components/KeysBadgesSection';
import { QuotePage } from './components/QuotePage';
import { ReviewsSection } from './components/ReviewsSection';
import { UrgencySection } from './components/UrgencySection';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton';
import { ZoneInterventionSection } from './components/ZoneInterventionSection';
import { HERO_CONFIG } from './data/heroConfig';
import { resolvePageDefinition } from './data/pages';
import {
  AFTER_INCIDENT_CONFIG,
  AGENCIES_CONFIG,
  BRANDS_CONFIG,
  DOMAINS_CONFIG,
  FAQ_CONFIG,
  FOOTER_CONFIG,
  KEYS_BADGES_CONFIG,
  KEYS_BADGES_PAGE_CONFIG,
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
import { hrefForDomain, hrefForHome, hrefForHomeSection, hrefForPage, type PageId } from './utils/router';

const NAV_TARGET_IDS: readonly SectionId[] = HEADER_NAV_ITEMS.map((item) => item.targetId);

export default function App() {
  const [activeSectionId, setActiveSectionId] = useState<SectionId | null>(null);
  // Pré-remplissage du questionnaire de devis + compteur pour le réinitialiser à chaque ouverture.
  const [quotePrefill, setQuotePrefill] = useState<{ domain?: QuoteDomain; location?: string }>({});
  const [quoteSession, setQuoteSession] = useState(0);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const quoteTriggerRef = useRef<HTMLButtonElement | null>(null);
  const { route, navigate } = useRouter();
  const currentPage = resolvePageDefinition(route);
  const sectionHref = (sectionId: SectionId) => hrefForHomeSection(sectionId, route, ROUTER_MODE);
  const domainHref = (domainId: DomainCardItem['id']) => hrefForDomain(domainId, ROUTER_MODE);
  const pageHref = (pageId: PageId) => hrefForPage(pageId, ROUTER_MODE);
  const currentPageId = route.kind === 'page' ? route.id : null;
  const onHome = route.kind === 'home';
  const isQuotePage = route.kind === 'page' && route.id === 'devis';

  // Menu principal : pages dédiées + menu déroulant « Nos domaines ».
  // Sur l'accueil, le lien de la section visible est mis en avant.
  const headerNav: readonly HeaderNavLink[] = [
    {
      key: 'cles-badges',
      label: 'Clés & badges',
      href: pageHref('cles-badges'),
      isActive: currentPageId === 'cles-badges' || (onHome && activeSectionId === '04_Cles_Badges'),
    },
    {
      key: 'domaines',
      label: 'Nos domaines',
      href: sectionHref('05_Nos_Domaines'),
      isActive: route.kind === 'domain' || (onHome && activeSectionId === '05_Nos_Domaines'),
      children: DOMAINS_CONFIG.items.map((item) => ({
        key: item.id,
        label: item.title,
        description: item.categoryTag,
        href: domainHref(item.id),
        imageSrc: item.imageSrc,
        isActive: route.kind === 'domain' && route.id === item.id,
      })),
      overviewLink: { label: 'Voir tous nos domaines', href: sectionHref('05_Nos_Domaines') },
    },
    {
      key: 'apres-sinistre',
      label: 'Après sinistre',
      href: pageHref('apres-sinistre'),
      isActive: currentPageId === 'apres-sinistre' || (onHome && activeSectionId === '07_Apres_Sinistre'),
    },
    {
      key: 'agences-contact',
      label: 'Agences & contact',
      href: pageHref('agences-contact'),
      isActive: currentPageId === 'agences-contact' || (onHome && activeSectionId === '10_Nos_Agences'),
    },
  ];

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

  /** Tous les boutons « devis » mènent à la page /devis, pré-remplie si possible. */
  const handleOpenQuoteModal = (domain?: QuoteDomain, district?: string) => {
    setPhotoModalOpen(false);
    setQuotePrefill({ domain, location: district });
    setQuoteSession((n) => n + 1);
    navigate(pageHref('devis'));
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
      {isQuotePage ? (
        <FocusHeader brand={BRAND_CONFIG} homeHref={hrefForHome(ROUTER_MODE)} />
      ) : (
        <HeaderSection
          brand={BRAND_CONFIG}
          nav={headerNav}
          homeHref={sectionHref('02_Hero')}
          quoteHref={pageHref('devis')}
        />
      )}

      {route.kind === 'page' && route.id === 'devis' ? (
        <main className="flex-1 flex flex-col">
          <QuotePage
            key={quoteSession}
            brand={BRAND_CONFIG}
            routerMode={ROUTER_MODE}
            prefill={quotePrefill}
          />
        </main>
      ) : currentPage ? (
        /* Pages intérieures : assemblées à partir de blocs (voir data/pages.ts) */
        <main className="flex-1 flex flex-col">
          <PageRenderer
            key={route.kind === 'home' ? 'home' : `${route.kind}-${route.id}`}
            page={currentPage}
            ctx={{
              brand: BRAND_CONFIG,
              route,
              routerMode: ROUTER_MODE,
              onOpenQuoteModal: handleOpenQuoteModal,
              onSendPhotos: () => setPhotoModalOpen(true),
              quoteTriggerRef,
            }}
          />
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
          details={KEYS_BADGES_PAGE_CONFIG}
          agencies={AGENCIES_CONFIG.agencies}
          pageHref={pageHref('cles-badges')}
          agenciesHref={pageHref('agences-contact')}
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

        <ReviewsSection config={REVIEWS_CONFIG} allReviewsHref={pageHref('avis-clients')} />

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
        agencies={AGENCIES_CONFIG.agencies}
        whatsapp={WHATSAPP_CONFIG}
        domainHref={domainHref}
        sectionHref={sectionHref}
        pageHref={pageHref}
        hideCta={isQuotePage}
      />



      {/* Reportage photo après sinistre */}
      <IncidentPhotoModal
        isOpen={photoModalOpen}
        brand={BRAND_CONFIG}
        onClose={() => setPhotoModalOpen(false)}
      />


      {/* Bouton flottant WhatsApp urgence */}
      <WhatsAppFloatingButton config={WHATSAPP_CONFIG} />
    </div>
    </MotionConfig>
  );
}
