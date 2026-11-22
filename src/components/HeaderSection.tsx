import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronDown, FileText, Menu, Phone, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from 'motion/react';
import { resolveHeaderHidden } from '../utils/headerVisibility';
import type { BrandConfig } from '../utils/navigation';
import { REVEAL_EASE } from '../utils/scrollReveal';
import { BrandMark } from './BrandMark';

/** Sous-lien d'un menu déroulant (ex. une page métier). */
export interface HeaderSubLink {
  readonly key: string;
  readonly label: string;
  readonly description: string;
  readonly href: string;
  readonly imageSrc?: string;
  readonly isActive: boolean;
}

/** Lien de navigation principal, avec menu déroulant optionnel. */
export interface HeaderNavLink {
  readonly key: string;
  readonly label: string;
  readonly href: string;
  readonly isActive: boolean;
  readonly children?: readonly HeaderSubLink[];
  /** Lien « voir tout » en bas du menu déroulant. */
  readonly overviewLink?: { readonly label: string; readonly href: string };
}

interface HeaderSectionProps {
  readonly brand: BrandConfig;
  readonly nav: readonly HeaderNavLink[];
  /** Adresse du logo (haut de l'accueil). */
  readonly homeHref: string;
  /** Adresse de la page « Demander un devis ». */
  readonly quoteHref: string;
}

const DESKTOP_LINK_CLASS =
  'group relative inline-flex items-center gap-1.5 py-2 text-[14.5px] tracking-[0.01em] whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B79A62] rounded-sm';

function ActiveIndicator({ isActive, reducedMotion }: { readonly isActive: boolean; readonly reducedMotion: boolean }) {
  return isActive ? (
    <motion.span
      layoutId={reducedMotion ? undefined : 'header-nav-active-indicator'}
      aria-hidden="true"
      transition={{ duration: reducedMotion ? 0 : 0.34, ease: REVEAL_EASE }}
      className="absolute inset-x-0 -bottom-0.5 h-[2px] rounded-full bg-[#B79A62]"
    />
  ) : (
    <span
      aria-hidden="true"
      className="absolute inset-x-0 -bottom-0.5 h-[1.5px] bg-[#B79A62] opacity-0 group-hover:opacity-60 transition-opacity duration-150"
    />
  );
}

/** Lien du menu principal avec panneau déroulant (bureau). */
function DesktopDropdown({
  item,
  reducedMotion,
}: {
  readonly item: HeaderNavLink;
  readonly reducedMotion: boolean;
}) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const panelId = `nav-panel-${item.key}`;

  const cancelClose = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setOpen(false), 160);
  };

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        containerRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  useEffect(() => cancelClose, []);

  return (
    <div
      ref={containerRef}
      className="relative"
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') {
          cancelClose();
          setOpen(true);
        }
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse') {
          scheduleClose();
        }
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setOpen(false);
        }
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((prev) => !prev)}
        className={`${DESKTOP_LINK_CLASS} cursor-pointer ${
          item.isActive ? 'text-[#F3F0E7] font-medium' : 'text-[#F3F0E7]/85 hover:text-[#F3F0E7] font-normal'
        }`}
      >
        {item.label}
        <ChevronDown
          aria-hidden="true"
          className={`h-4 w-4 text-[#B79A62] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
        <ActiveIndicator isActive={item.isActive} reducedMotion={reducedMotion} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
            transition={{ duration: reducedMotion ? 0 : 0.2, ease: REVEAL_EASE }}
            className="absolute left-1/2 top-full z-50 w-[620px] -translate-x-1/2 pt-4"
          >
            <div className="overflow-hidden rounded-xl border border-[#B79A62]/35 bg-[#292D2F] shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
              <ul className="grid grid-cols-2 gap-1 p-3">
                {item.children?.map((child) => (
                  <li key={child.key}>
                    <a
                      href={child.href}
                      onClick={() => setOpen(false)}
                      aria-current={child.isActive ? 'page' : undefined}
                      className={`group/sub flex items-center gap-3.5 rounded-lg p-2.5 transition-colors duration-150 hover:bg-[#F3F0E7]/[0.06] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#B79A62] ${
                        child.isActive ? 'bg-[#F3F0E7]/[0.06]' : ''
                      }`}
                    >
                      {child.imageSrc && (
                        <span className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-[#1C1F21]">
                          <img
                            src={child.imageSrc}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-300 group-hover/sub:scale-110"
                          />
                        </span>
                      )}
                      <span className="min-w-0">
                        <span
                          className={`block font-display text-[15.5px] font-semibold leading-tight ${
                            child.isActive ? 'text-[#B79A62]' : 'text-[#F3F0E7] group-hover/sub:text-[#D2B478]'
                          }`}
                        >
                          {child.label}
                        </span>
                        <span className="mt-1 block text-[11.5px] font-medium uppercase tracking-[0.12em] text-[#F3F0E7]/55">
                          {child.description}
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
              {item.overviewLink && (
                <a
                  href={item.overviewLink.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between border-t border-[#F3F0E7]/10 px-5 py-3.5 text-[14px] font-medium text-[#B79A62] hover:bg-[#F3F0E7]/[0.04] hover:text-[#D2B478] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#B79A62]"
                >
                  {item.overviewLink.label}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function HeaderSection({ brand, nav, homeHref, quoteHref }: HeaderSectionProps) {
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

  const [mobileExpandedKey, setMobileExpandedKey] = useState<string | null>(null);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobileExpandedKey(null);
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
            href={homeHref}
            onClick={closeMobileMenu}
            aria-label={`${brand.name} — ${brand.city}, retour en haut de page`}
            className="inline-flex items-center rounded-md py-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B79A62]"
          >
            <BrandMark brand={brand} compact />
          </a>

          {/* Zone 2 : Navigation principale (bureau) avec indicateur actif glissant */}
          <nav
            aria-label="Navigation principale"
            className="hidden lg:flex items-center gap-5 xl:gap-7 ml-auto"
          >
            {nav.map((item) =>
              item.children?.length ? (
                <DesktopDropdown key={item.key} item={item} reducedMotion={prefersReducedMotion} />
              ) : (
                <a
                  key={item.key}
                  href={item.href}
                  aria-current={item.isActive ? 'page' : undefined}
                  className={`${DESKTOP_LINK_CLASS} ${
                    item.isActive ? 'text-[#F3F0E7] font-medium' : 'text-[#F3F0E7]/85 hover:text-[#F3F0E7] font-normal'
                  }`}
                >
                  {item.label}
                  <ActiveIndicator isActive={item.isActive} reducedMotion={prefersReducedMotion} />
                </a>
              )
            )}
          </nav>

          {/* Zone 3 : Séparateur + Bouton d'appel (bureau) et commandes mobile */}
          <div className="flex items-center gap-2.5 sm:gap-3 lg:gap-4 xl:gap-5 shrink-0">
            <span
              aria-hidden="true"
              className="hidden lg:block h-6 w-px bg-[#F3F0E7]/20"
            />

            {/* Bouton devis (grand écran) */}
            <a
              href={quoteHref}
              className="hidden xl:inline-flex items-center gap-2 rounded-lg border border-[#B79A62]/70 px-4 py-2.5 text-[15px] font-medium text-[#F3F0E7] whitespace-nowrap shrink-0 transition-colors duration-150 hover:border-[#B79A62] hover:bg-[#B79A62]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79A62]"
            >
              <FileText className="h-[17px] w-[17px] shrink-0 text-[#B79A62]" strokeWidth={1.9} aria-hidden="true" />
              Demander un devis
            </a>

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
                {nav.map((item) => {
                  const rowClass = `flex min-h-[48px] w-full items-center justify-between border-b border-[#F3F0E7]/10 px-2 py-3 text-[16px] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79A62] rounded-sm ${
                    item.isActive ? 'text-[#B79A62] font-medium' : 'text-[#F3F0E7] hover:text-[#B79A62]'
                  }`;
                  if (!item.children?.length) {
                    return (
                      <a
                        key={item.key}
                        href={item.href}
                        onClick={closeMobileMenu}
                        aria-current={item.isActive ? 'page' : undefined}
                        className={rowClass}
                      >
                        <span>{item.label}</span>
                      </a>
                    );
                  }
                  const expanded = mobileExpandedKey === item.key;
                  return (
                    <div key={item.key}>
                      <button
                        type="button"
                        aria-expanded={expanded}
                        aria-controls={`mobile-sub-${item.key}`}
                        onClick={() => setMobileExpandedKey(expanded ? null : item.key)}
                        className={`${rowClass} cursor-pointer`}
                      >
                        <span>{item.label}</span>
                        <ChevronDown
                          aria-hidden="true"
                          className={`h-5 w-5 text-[#B79A62] transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {expanded && (
                        <ul id={`mobile-sub-${item.key}`} className="flex flex-col border-b border-[#F3F0E7]/10 py-1.5 pl-4">
                          {item.children.map((child) => (
                            <li key={child.key}>
                              <a
                                href={child.href}
                                onClick={closeMobileMenu}
                                aria-current={child.isActive ? 'page' : undefined}
                                className={`flex min-h-[44px] items-center gap-3 px-2 py-2 text-[15px] transition-colors duration-150 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79A62] ${
                                  child.isActive ? 'text-[#B79A62] font-medium' : 'text-[#F3F0E7]/85 hover:text-[#B79A62]'
                                }`}
                              >
                                <span aria-hidden="true" className="h-1 w-1 rounded-full bg-[#B79A62]" />
                                {child.label}
                              </a>
                            </li>
                          ))}
                          {item.overviewLink && (
                            <li>
                              <a
                                href={item.overviewLink.href}
                                onClick={closeMobileMenu}
                                className="flex min-h-[44px] items-center gap-2 px-2 py-2 text-[14px] font-medium text-[#B79A62]"
                              >
                                {item.overviewLink.label}
                                <ArrowRight className="h-4 w-4" aria-hidden="true" />
                              </a>
                            </li>
                          )}
                        </ul>
                      )}
                    </div>
                  );
                })}

                <div className="pt-4 flex flex-col gap-3">
                  <a
                    href={quoteHref}
                    onClick={closeMobileMenu}
                    className="flex min-h-[48px] w-full items-center justify-center gap-2.5 rounded-lg border border-[#B79A62]/70 px-5 py-3 text-[15px] font-medium text-[#F3F0E7] hover:bg-[#B79A62]/10 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79A62]"
                  >
                    <FileText className="h-[18px] w-[18px] shrink-0 text-[#B79A62]" strokeWidth={1.9} aria-hidden="true" />
                    <span>Demander un devis</span>
                  </a>
                  <a
                    href={brand.phoneHref}
                    onClick={closeMobileMenu}
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
