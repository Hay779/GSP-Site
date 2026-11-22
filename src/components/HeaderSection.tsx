import { useEffect, useRef, useState } from 'react';
import { Menu, Phone, X } from 'lucide-react';
import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react';
import { resolveHeaderHidden } from '../utils/headerVisibility';
import type { BrandConfig, HeaderNavItem, SectionId } from '../utils/navigation';
import { REVEAL_EASE } from '../utils/scrollReveal';
import { BrandMark } from './BrandMark';

interface HeaderSectionProps {
  readonly brand: BrandConfig;
  readonly navItems: readonly HeaderNavItem[];
  readonly activeSectionId: SectionId | null;
  readonly onSelectSection: (sectionId: SectionId) => void;
  /** Adresse d'une section de l'accueil (préfixée quand on est sur une page métier). */
  readonly sectionHref?: (sectionId: SectionId) => string;
}

const defaultSectionHref = (sectionId: SectionId) => `#${sectionId}`;

export function HeaderSection({
  brand,
  navItems,
  activeSectionId,
  onSelectSection,
  sectionHref = defaultSectionHref,
}: HeaderSectionProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const [hasFocusWithin, setHasFocusWithin] = useState(false);
  const toggleButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastScrollYRef = useRef<number>(0);
  const prefersReducedMotion = useReducedMotion() ?? false;

  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 32,
    restDelta: 0.001,
  });

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;
      const previousY = lastScrollYRef.current;
      lastScrollYRef.current = currentY;

      setIsHeaderHidden((prevHidden) =>
        resolveHeaderHidden({
          currentY,
          previousY,
          wasHidden: prevHidden,
          isMenuOpen: mobileMenuOpen,
          hasFocusWithin,
        })
      );
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [mobileMenuOpen, hasFocusWithin]);

  useEffect(() => {
    if (mobileMenuOpen || hasFocusWithin) {
      setIsHeaderHidden(false);
    }
  }, [mobileMenuOpen, hasFocusWithin]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
        toggleButtonRef.current?.focus();
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, [mobileMenuOpen]);

  const handleNavClick = (sectionId: SectionId) => {
    onSelectSection(sectionId);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Filet de progression de lecture laiton (2px) toujours visible en bord supérieur */}
      {!prefersReducedMotion && (
        <motion.div
          aria-hidden="true"
          data-testid="reading-progress-bar"
          style={{ scaleX: smoothProgress }}
          className="pointer-events-none fixed inset-x-0 top-0 z-[55] h-[2px] origin-left bg-gradient-to-r from-[#B79A62]/80 via-[#D9BD82] to-[#B79A62]"
        />
      )}

      <motion.header
        id="01_Entete"
        data-section="01_Entete"
        data-header-hidden={isHeaderHidden ? 'true' : 'false'}
        onFocusCapture={() => setHasFocusWithin(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setHasFocusWithin(false);
          }
        }}
        animate={{ y: isHeaderHidden ? '-100%' : '0%' }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.28,
          ease: REVEAL_EASE,
        }}
        className="sticky top-0 z-50 w-full bg-[#1C1F21]/92 backdrop-blur-md border-b border-[#F3F0E7]/14 will-change-transform"
      >
        <div className="mx-auto flex h-[74px] lg:h-[88px] max-w-[1280px] items-center justify-between gap-6 lg:gap-8 px-5 sm:px-8 lg:px-10">
          {/* Zone 1 : Logo / Nom */}
          <a
            href={sectionHref('02_Hero')}
            onClick={() => handleNavClick('02_Hero')}
            aria-label={`${brand.name} — ${brand.city}, retour en haut de page`}
            className="inline-flex items-center rounded-md py-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B79A62]"
          >
            <BrandMark brand={brand} compact />
          </a>

          {/* Zone 2 : Navigation principale (bureau) avec indicateur actif glissant */}
          <nav
            aria-label="Navigation principale"
            className="hidden lg:flex items-center gap-7 xl:gap-9 ml-auto"
          >
            {navItems.map((item) => {
              const isActive = activeSectionId === item.targetId;
              return (
                <a
                  key={item.targetId}
                  href={sectionHref(item.targetId)}
                  onClick={() => handleNavClick(item.targetId)}
                  aria-current={isActive ? 'location' : undefined}
                  className={`group relative py-2 text-[15px] tracking-[0.01em] whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B79A62] rounded-sm ${
                    isActive
                      ? 'text-[#F3F0E7] font-medium'
                      : 'text-[#F3F0E7]/85 hover:text-[#F3F0E7] font-normal'
                  }`}
                >
                  {item.label}
                  {isActive ? (
                    <motion.span
                      layoutId={prefersReducedMotion ? undefined : 'header-nav-active-indicator'}
                      aria-hidden="true"
                      transition={{ duration: prefersReducedMotion ? 0 : 0.34, ease: REVEAL_EASE }}
                      className="absolute inset-x-0 -bottom-0.5 h-[2px] rounded-full bg-[#B79A62]"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 -bottom-0.5 h-[1.5px] bg-[#B79A62] opacity-0 group-hover:opacity-60 transition-opacity duration-150"
                    />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Zone 3 : Séparateur + Bouton d'appel (bureau) et commandes mobile */}
          <div className="flex items-center gap-2.5 sm:gap-3 lg:gap-7 shrink-0">
            <span
              aria-hidden="true"
              className="hidden lg:block h-6 w-px bg-[#F3F0E7]/20"
            />

            {/* Bouton d'appel principal (tablette & bureau) */}
            <a
              href={brand.phoneHref}
              className="hidden sm:inline-flex items-center gap-2.5 rounded-lg bg-[#B79A62] hover:bg-[#C6AA73] active:bg-[#A68952] px-4 lg:px-5 py-2.5 text-[15px] font-semibold text-[#1C1F21] tabular-nums tracking-[0.01em] whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F3F0E7]"
            >
              <Phone className="h-[17px] w-[17px] shrink-0" strokeWidth={2} aria-hidden="true" />
              <span>{brand.phoneDisplay}</span>
            </a>

            {/* Accès appel direct 1 tap sur mobile étroit */}
            <a
              href={brand.phoneHref}
              aria-label={`Appeler le ${brand.phoneDisplay}`}
              className="inline-flex sm:hidden h-11 w-11 items-center justify-center rounded-lg bg-[#B79A62] hover:bg-[#C6AA73] active:bg-[#A68952] text-[#1C1F21] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F3F0E7]"
            >
              <Phone className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden="true" />
            </a>

            {/* Bouton menu mobile / tablette */}
            <button
              ref={toggleButtonRef}
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              className="inline-flex lg:hidden h-11 w-11 items-center justify-center rounded-lg border border-[#F3F0E7]/20 bg-[#292D2F]/60 text-[#F3F0E7] hover:border-[#B79A62]/70 hover:text-[#B79A62] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79A62]"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Menu déroulant mobile & tablette */}
        {mobileMenuOpen && (
          <>
            <div
              aria-hidden="true"
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-x-0 top-[74px] bottom-0 z-40 bg-black/55 lg:hidden"
            />
            <nav
              id="mobile-navigation"
              aria-label="Navigation mobile"
              className="relative z-50 border-y border-[#B79A62]/35 bg-[#292D2F] shadow-2xl lg:hidden"
            >
              <div className="mx-auto max-w-[1280px] px-5 sm:px-8 py-5 flex flex-col gap-1">
                {navItems.map((item) => {
                  const isActive = activeSectionId === item.targetId;
                  return (
                    <a
                      key={item.targetId}
                      href={sectionHref(item.targetId)}
                      onClick={() => handleNavClick(item.targetId)}
                      aria-current={isActive ? 'location' : undefined}
                      className={`flex min-h-[48px] items-center justify-between border-b border-[#F3F0E7]/10 px-2 py-3 text-[16px] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79A62] rounded-sm ${
                        isActive
                          ? 'text-[#B79A62] font-medium'
                          : 'text-[#F3F0E7] hover:text-[#B79A62]'
                      }`}
                    >
                      <span>{item.label}</span>
                    </a>
                  );
                })}

                <div className="pt-4">
                  <a
                    href={brand.phoneHref}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex min-h-[48px] w-full items-center justify-center gap-2.5 rounded-lg bg-[#B79A62] hover:bg-[#C6AA73] active:bg-[#A68952] px-5 py-3 text-[15px] font-semibold text-[#1C1F21] tabular-nums transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F3F0E7]"
                  >
                    <Phone className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden="true" />
                    <span>Appeler le {brand.phoneDisplay}</span>
                  </a>
                </div>
              </div>
            </nav>
          </>
        )}
      </motion.header>
    </>
  );
}
