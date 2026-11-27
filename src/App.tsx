import { useCallback, useEffect, useRef, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { AfterIncidentSection } from './components/AfterIncidentSection';
import { AgenciesSection } from './components/AgenciesSection';
import { PromoDesktopBadge, PromoFloatingBadge, PromoHeroBadge, PromoSheet, PromoTicker } from './components/BlackFriday';
import { PromotionsPage } from './components/PromotionsPage';
import { usePromotion } from './hooks/usePromotion';
import { BrandsSection } from './components/BrandsSection';
import { PageRenderer } from './components/PageRenderer';
import { DomainsSection } from './components/DomainsSection';
import { FaqSection } from './components/FaqSection';
import { FooterSection } from './components/FooterSection';
import { CookieBanner } from './components/CookieBanner';
import { FocusHeader } from './components/FocusHeader';
import { HeaderSection, type HeaderNavLink } from './components/HeaderSection';
import { HeroSection } from './components/HeroSection';
import { IncidentPhotoModal } from './components/IncidentPhotoModal';
import { KeysBadgesSection } from './components/KeysBadgesSection';
import { MobileActionBar } from './components/MobileActionBar';
import { NotFoundPage } from './components/NotFoundPage';
import { PartnerPage } from './components/PartnerPage';
import { OfferPage } from './components/OfferPage';
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
import { applySeo, seoForRoute } from './utils/seo';
import { hrefForDomain, hrefForHome, hrefForHomeSection, hrefForPage, routeKey, type PageId } from './utils/router';

const NAV_TARGET_IDS: readonly SectionId[] = HEADER_NAV_ITEMS.map((item) => item.targetId);

export default function App() {
  const [activeSectionId, setActiveSectionId] = useState<SectionId | null>(null);
  // Pré-remplissage du questionnaire de devis + compteur pour le réinitialiser à chaque ouverture.
  const [quotePrefill, setQuotePrefill] = useState<{ domain?: QuoteDomain; location?: string }>({});
  const [quoteSession, setQuoteSession] = useState(0);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const quoteTriggerRef = useRef<HTMLButtonElement | null>(null);
  const { route, navigate } = useRouter();
  // Black Friday (mobile) : visible pendant les dates, sur l'accueil et /promotions.
  const { promo, active: promoActive, dismissed: promoDismissed, dismiss: dismissPromo } = usePromotion();
  const [promoSheetOpen, setPromoSheetOpen] = useState(false);
  const openPromoSheet = useCallback(() => setPromoSheetOpen(true), []);
  const closePromoSheet = useCallback(() => setPromoSheetOpen(false), []);

  // Titre, description, adresse canonique et données structurées de la page.
  useEffect(() => {
    applySeo(seoForRoute(route));
  }, [route]);
  const currentPage = resolvePageDefinition(route);
  const sectionHref = (sectionId: SectionId) => hrefForHomeSection(sectionId, route, ROUTER_MODE);
  const domainHref = (domainId: DomainCardItem['id']) => hrefForDomain(domainId, ROUTER_MODE);
  const pageHref = (pageId: PageId) => hrefForPage(pageId, ROUTER_MODE);
  const currentPageId = route.kind === 'page' ? route.id : null;
  const onHome = route.kind === 'home';
  const isQuotePage = route.kind === 'page' && route.id === 'devis';
  const isPromoPage = route.kind === 'page' && route.id === 'promotions';
  // /offre (QR code du flyer) : page seule, sans menu, pied de page ni boutons flottants.
  const isOfferPage = route.kind === 'page' && route.id === 'offre';
  const showPromoHome = promoActive && !promoDismissed && onHome;
  const showPromoTicker = promoActive && !promoDismissed && (onHome || isPromoPage);
  const republique = AGENCIES_CONFIG.agencies.find((a) => a.id === 'republique') ?? AGENCIES_CONFIG.agencies[0];

  // Ferme la pop-up quand on change de page ou à la fin de la promo.
  useEffect(() => {
    if (!showPromoHome) setPromoSheetOpen(false);
  }, [showPromoHome]);

  // Menu principal : pages dédiées + menu déroulant « Nos domaines ».
  // Sur l'accueil, le lien de la section visible est mis en avant.
  const headerNav: readonly HeaderNavLink[] = [
    {
      key: 'services',
      label: 'Nos services',
      href: sectionHref('05_Nos_Domaines'),
      isActive:
        route.kind === 'domain' ||
        currentPageId === 'cles-badges' ||
        currentPageId === 'apres-sinistre' ||
        (onHome &&
          (activeSectionId === '04_Cles_Badges' ||
            activeSectionId === '05_Nos_Domaines' ||
            activeSectionId === '07_Apres_Sinistre')),
      children: [
        ...DOMAINS_CONFIG.items.map((item) => ({
          key: item.id,
          label: item.title,
          description: item.categoryTag,
          href: domainHref(item.id),
          imageSrc: item.imageSrc,
          isActive: route.kind === 'domain' && route.id === item.id,
        })),
        {
          key: 'cles-badges',
          label: 'Clés & badges',
          description: 'REPRODUCTION EN BOUTIQUE',
          href: pageHref('cles-badges'),
          imageSrc: KEYS_BADGES_CONFIG.imageSrc,
          isActive: currentPageId === 'cles-badges',
        },
        {
          key: 'apres-sinistre',
          label: 'Après sinistre',
          description: 'EFFRACTION · BRIS DE GLACE',
          href: pageHref('apres-sinistre'),
          imageSrc: AFTER_INCIDENT_CONFIG.imageSrc,
          isActive: currentPageId === 'apres-sinistre',
        },
      ],
      overviewLink: { label: 'Voir tous nos services', href: sectionHref('05_Nos_Domaines') },
    },
    {
      key: 'professionnels',
      label: 'Professionnels',
      href: pageHref('professionnels'),
      isActive:
        currentPageId === 'professionnels' ||
        currentPageId === 'pro-syndics' ||
        currentPageId === 'pro-assureurs' ||
        currentPageId === 'pro-immobilier' ||
        currentPageId === 'devenir-partenaire',
      children: [
        {
          key: 'pro-syndics',
          label: 'Syndics & gestionnaires',
          description: 'COPROPRIÉTÉS',
          href: pageHref('pro-syndics'),
          imageSrc: '/src/assets/images/pro_syndics.webp',
          isActive: currentPageId === 'pro-syndics',
        },
        {
          key: 'pro-assureurs',
          label: 'Assureurs & experts',
          description: 'SINISTRES',
          href: pageHref('pro-assureurs'),
          imageSrc: '/src/assets/images/pro_assureurs.webp',
          isActive: currentPageId === 'pro-assureurs',
        },
        {
          key: 'pro-immobilier',
          label: 'Agences & bailleurs',
          description: 'GESTION LOCATIVE',
          href: pageHref('pro-immobilier'),
          imageSrc: '/src/assets/images/pro_immobilier.webp',
          isActive: currentPageId === 'pro-immobilier',
        },
        {
          key: 'devenir-partenaire',
          label: 'Devenir partenaire',
          description: 'FORMULAIRE PRO',
          href: pageHref('devenir-partenaire'),
          imageSrc: '/src/assets/images/pro_partenaire.webp',
          isActive: currentPageId === 'devenir-partenaire',
        },
      ],
      overviewLink: { label: 'Voir l’espace Professionnels', href: pageHref('professionnels') },
    },
    {
      key: 'zone-intervention',
      label: 'Zone d’intervention',
      href: pageHref('zone-intervention'),
      isActive: currentPageId === 'zone-intervention' || (onHome && activeSectionId === '09_Zone_Intervention'),
    },
    // « Contact » n'est plus dans le menu du haut : il reste dans le pied de page.
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
      {isOfferPage ? null : isQuotePage ? (
        <FocusHeader brand={BRAND_CONFIG} homeHref={hrefForHome(ROUTER_MODE)} />
      ) : (
        <HeaderSection
          brand={BRAND_CONFIG}
          nav={headerNav}
          homeHref={sectionHref('02_Hero')}
          quoteHref={pageHref('devis')}
          belowBar={
            showPromoTicker ? (
              <PromoTicker promo={promo} variant={onHome ? 'gold' : 'dark'} onOpen={onHome ? openPromoSheet : undefined} />
            ) : undefined
          }
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
      ) : route.kind === 'page' && route.id === 'devenir-partenaire' ? (
        <main className="flex-1 flex flex-col">
          <PartnerPage brand={BRAND_CONFIG} routerMode={ROUTER_MODE} />
        </main>
      ) : route.kind === 'page' && route.id === 'offre' ? (
        <main id="02_Hero" className="flex-1 flex flex-col">
          <OfferPage brand={BRAND_CONFIG} routerMode={ROUTER_MODE} />
        </main>
      ) : isPromoPage ? (
        <main className="flex-1 flex flex-col">
          <PromotionsPage
            promo={promo}
            active={promoActive}
            agency={republique}
            phoneDisplay={BRAND_CONFIG.phoneDisplay}
            phoneHref={BRAND_CONFIG.phoneHref}
            quoteHref={pageHref('devis')}
            homeHref={hrefForHome(ROUTER_MODE)}
          />
        </main>
      ) : route.kind === 'notFound' ? (
        <main className="flex-1 flex flex-col">
          <NotFoundPage brand={BRAND_CONFIG} routerMode={ROUTER_MODE} />
        </main>
      ) : currentPage ? (
        /* Pages intérieures : assemblées à partir de blocs (voir data/pages.ts) */
        <main className="flex-1 flex flex-col">
          <PageRenderer
            key={routeKey(route)}
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
          hasPromoBar={showPromoHome}
          overlay={showPromoHome ? <PromoHeroBadge promo={promo} onOpen={openPromoSheet} /> : undefined}
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

        <AfterIncidentSection
          config={AFTER_INCIDENT_CONFIG}
          onDescribeNeed={() => handleOpenQuoteModal('Après sinistre')}
          onSendPhotos={() => setPhotoModalOpen(true)}
        />

        <BrandsSection config={BRANDS_CONFIG} contactHref={pageHref('devis')} />

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
      {!isOfferPage && (
      <FooterSection
        brand={BRAND_CONFIG}
        config={FOOTER_CONFIG}
        agencies={AGENCIES_CONFIG.agencies}
        whatsapp={WHATSAPP_CONFIG}
        domainHref={domainHref}
        sectionHref={sectionHref}
        pageHref={pageHref}
        hideCta={isQuotePage || currentPage?.blocks[currentPage.blocks.length - 1]?.type === 'cta'}
      />
      )}



      {/* Reportage photo après sinistre */}
      <IncidentPhotoModal
        isOpen={photoModalOpen}
        brand={BRAND_CONFIG}
        onClose={() => setPhotoModalOpen(false)}
      />


      {/* Consentement cookies (Google Analytics) */}
      <CookieBanner privacyHref={pageHref('confidentialite')} />

      {/* Bouton flottant WhatsApp urgence */}
      {!isOfferPage && <WhatsAppFloatingButton config={WHATSAPP_CONFIG} />}

      {/* Barre d'actions mobile (hors page devis, déjà centrée sur le questionnaire) */}
      {!isQuotePage && !isOfferPage && (
        <MobileActionBar
          brand={BRAND_CONFIG}
          whatsapp={WHATSAPP_CONFIG}
          quoteHref={pageHref('devis')}
          contactHref={pageHref('agences-contact')}
          routeKey={routeKey(route)}
          floatingExtra={
            showPromoHome
              ? ({ sosOpen, nearFooter }) => (
                  <PromoFloatingBadge
                    promo={promo}
                    visible={!sosOpen && !nearFooter && !promoSheetOpen}
                    onOpen={openPromoSheet}
                    onDismiss={dismissPromo}
                  />
                )
              : undefined
          }
        />
      )}

      {/* Black Friday : pop-up des offres (ouverte par le rond ou le bandeau, jamais toute seule) */}
      {showPromoHome && (
        <PromoDesktopBadge promo={promo} hidden={promoSheetOpen} onOpen={openPromoSheet} onDismiss={dismissPromo} />
      )}
      {showPromoHome && (
        <PromoSheet
          promo={promo}
          brand={BRAND_CONFIG}
          open={promoSheetOpen}
          onClose={closePromoSheet}
          promoHref={pageHref('promotions')}
          shopAddress={`${republique.addressLines[0]}, Marseille 2e`}
        />
      )}
    </div>
    </MotionConfig>
  );
}
