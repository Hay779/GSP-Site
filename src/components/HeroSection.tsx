import { HeroGoldWave } from './HeroGoldWave';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ClipboardCheck, KeyRound, Pause, Phone, Play, ShieldCheck } from 'lucide-react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import type { CommitmentIconKey, HeroConfig } from '../data/heroConfig';
import { HERO_PARALLAX_CONFIG } from '../utils/heroParallax';
import { HERO_SLIDESHOW_TIMING, nextSlideIndex } from '../utils/heroSlideshow';
import { HeroSlideshowIndicator, HeroSlideshowMedia } from './HeroSlideshow';
import type { SectionId } from '../utils/navigation';
import { REVEAL_EASE } from '../utils/scrollReveal';
import { HAS_PRERENDERED_HTML } from '../utils/firstPaint';

interface HeroSectionProps {
  readonly config: HeroConfig;
  readonly onOpenQuoteModal: () => void;
  readonly onSelectSection: (sectionId: SectionId) => void;
  readonly quoteTriggerRef?: React.RefObject<HTMLButtonElement | null>;
  /** Bandeau promotionnel affiché sous l'en-tête (mobile) : le haut de page se raccourcit d'autant. */
  readonly hasPromoBar?: boolean;
  /** Élément posé sur la photo (ex. macaron Black Friday sur grand écran). */
  readonly overlay?: ReactNode;
}

function CommitmentIcon({ icon }: { readonly icon: CommitmentIconKey }) {
  const iconClass = 'h-[19px] w-[19px] shrink-0 text-[#B79A62]';
  switch (icon) {
    case 'key':
      return <KeyRound className={iconClass} strokeWidth={1.7} aria-hidden="true" />;
    case 'clipboard':
      return <ClipboardCheck className={iconClass} strokeWidth={1.7} aria-hidden="true" />;
    case 'shield':
      return <ShieldCheck className={iconClass} strokeWidth={1.7} aria-hidden="true" />;
  }
}

export function HeroSection({
  config,
  onOpenQuoteModal,
  onSelectSection,
  quoteTriggerRef,
  hasPromoBar = false,
  overlay,
}: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [posterFailed, setPosterFailed] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [isVideoPaused, setIsVideoPaused] = useState(false);
  const prefersReducedMotion = useReducedMotion() ?? false;
  const skipIntro = Boolean(prefersReducedMotion) || HAS_PRERENDERED_HTML;
  const slides = config.media.slides;
  const posterSlide = slides[0];
  const [activeSlide, setActiveSlide] = useState(0);
  const [isSlideshowToggled, setIsSlideshowToggled] = useState(false);
  const [isPageHidden, setIsPageHidden] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 88px', 'end start'],
  });

  const smoothScrollProgress = useSpring(scrollYProgress, HERO_PARALLAX_CONFIG.spring);

  const mediaParallaxY = useTransform(
    smoothScrollProgress,
    [0, 1],
    ['0%', `${HERO_PARALLAX_CONFIG.maxShiftPercent}%`]
  );
  const mediaParallaxScale = useTransform(
    smoothScrollProgress,
    [0, 1],
    [HERO_PARALLAX_CONFIG.scaleStart, HERO_PARALLAX_CONFIG.scaleEnd]
  );
  const depthScrimOpacity = useTransform(
    smoothScrollProgress,
    [0, 1],
    [0, HERO_PARALLAX_CONFIG.maxScrimExtraOpacity]
  );
  const contentParallaxY = useTransform(
    smoothScrollProgress,
    [0, 1],
    [0, HERO_PARALLAX_CONFIG.contentOffsetPx]
  );

  const hasVideoSource =
    !videoFailed &&
    Boolean(config.media.videoSrc.trim() || config.media.videoWebmSrc?.trim());

  const hasSlideshow = !hasVideoSource && slides.length > 1;
  // Si l'utilisateur préfère réduire les animations, le diaporama démarre en pause
  // (il peut quand même le lancer avec le bouton lecture).
  const isSlideshowPausedByChoice = prefersReducedMotion ? !isSlideshowToggled : isSlideshowToggled;
  const isSlideshowPaused = isSlideshowPausedByChoice || isPageHidden;

  // Met le diaporama en pause quand l'onglet n'est pas visible.
  useEffect(() => {
    const onVisibility = () => setIsPageHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // Passe à l'image suivante après la durée d'affichage.
  useEffect(() => {
    if (!hasSlideshow || isSlideshowPaused) {
      return;
    }
    const timer = window.setTimeout(() => {
      setActiveSlide((current) => nextSlideIndex(current, slides.length));
    }, HERO_SLIDESHOW_TIMING.slideDurationMs);
    return () => window.clearTimeout(timer);
  }, [hasSlideshow, isSlideshowPaused, activeSlide, slides.length]);

  useEffect(() => {
    if (!hasVideoSource || !videoRef.current) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      videoRef.current.pause();
      setIsVideoPaused(true);
      return;
    }

    const playPromise = videoRef.current.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        setIsVideoPaused(true);
      });
    }
  }, [hasVideoSource]);

  const handleTogglePlayback = () => {
    if (hasSlideshow) {
      setIsSlideshowToggled((toggled) => !toggled);
      return;
    }
    const videoEl = videoRef.current;
    if (!videoEl) {
      return;
    }
    if (videoEl.paused) {
      videoEl.play().catch(() => undefined);
      setIsVideoPaused(false);
    } else {
      videoEl.pause();
      setIsVideoPaused(true);
    }
  };

  return (
    <section
      ref={sectionRef}
      id="02_Hero"
      data-section="02_Hero"
      aria-labelledby="02_Hero-title"
      className={`relative w-full overflow-hidden bg-[#16191B] lg:bg-[#24282B] scroll-mt-[74px] lg:scroll-mt-[88px] flex flex-col ${hasPromoBar ? 'h-[calc(100svh-112px)]' : 'h-[calc(100svh-74px)]'} min-h-[400px] sm:h-auto sm:min-h-0 lg:flex-row ${hasPromoBar ? 'lg:min-h-[min(calc(100svh-126px),740px)]' : 'lg:min-h-[min(calc(100svh-88px),740px)]'} lg:items-center`}
    >
      {/* Couche média plein écran : vidéo HTML5 + poster artisanal avec parallaxe immersif au scroll */}
      <div
        data-testid="hero-media-layer"
        className="relative min-h-[110px] flex-1 sm:h-[54svh] sm:max-h-[520px] sm:flex-none w-full lg:absolute lg:inset-0 lg:h-auto lg:min-h-0 lg:max-h-none z-0 overflow-hidden bg-[#16191B] lg:bg-[#24282B]"
        aria-hidden="true"
      >
        {/* Repli stylisé si ni vidéo ni poster ne chargent */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_40%,rgba(183,154,98,0.16),rgba(41,45,47,0.45)_45%,rgba(28,31,33,1)_85%)]" />

        {/* Surdimensionnement vertical symétrique (-18% / -18%) pour absorber la course parallaxe sans jamais dévoiler de bordure */}
        <motion.div
          data-testid="hero-parallax-media"
          data-parallax-enabled={prefersReducedMotion ? 'false' : 'true'}
          style={
            prefersReducedMotion
              ? undefined
              : { y: mediaParallaxY, scale: mediaParallaxScale }
          }
          className="absolute -top-[18%] -bottom-[18%] inset-x-0 origin-center will-change-transform"
        >
          {/* Diaporama cinéma (fondus enchaînés + mouvements de caméra lents) */}
          {hasSlideshow && (
            <HeroSlideshowMedia
              slides={slides}
              activeIndex={activeSlide}
              isPaused={isSlideshowPaused}
              reducedMotion={prefersReducedMotion}
            />
          )}

          {/* Image unique haute qualité (poster de la vidéo ou image seule) */}
          {!hasSlideshow && posterSlide && !posterFailed && (
            <img
              src={posterSlide.src}
              alt={posterSlide.alt}
              referrerPolicy="no-referrer"
              onError={() => setPosterFailed(true)}
              className="h-full w-full object-cover [filter:contrast(1.06)_saturate(1.1)_brightness(1.04)] lg:[filter:contrast(1.08)_saturate(1.14)_brightness(1.1)] object-[80%_30%] sm:object-[72%_36%] lg:object-[70%_40%]"
            />
          )}

          {/* Balise vidéo plein écran animée en parallaxe avec la couche média */}
          {hasVideoSource && (
            <video
              ref={videoRef}
              data-testid="hero-background-video"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={posterSlide?.src}
              onError={() => setVideoFailed(true)}
              className="absolute inset-0 h-full w-full object-cover object-center [filter:contrast(1.06)_saturate(1.1)_brightness(1.04)]"
            >
              {config.media.videoWebmSrc && (
                <source src={config.media.videoWebmSrc} type="video/webm" />
              )}
              {config.media.videoSrc && (
                <source src={config.media.videoSrc} type="video/mp4" />
              )}
            </video>
          )}
        </motion.div>

        {/* Voile directionnel calibré pour garantir un contraste WCAG AA sur tout contenu vidéo */}
        <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-[#16191B] via-[#16191B]/30 to-transparent lg:hidden" />
        <div className="hidden lg:block absolute inset-0 bg-[linear-gradient(90deg,rgba(36,40,43,0.9)_0%,rgba(36,40,43,0.72)_26%,rgba(36,40,43,0.4)_44%,rgba(36,40,43,0.08)_62%,rgba(36,40,43,0)_100%)]" />
        {/* Voile haut (mobile) pour la lisibilité de l'indicateur du diaporama */}
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#16191B]/40 to-transparent lg:hidden" />
        <div className="hidden lg:block absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#24282B]/35 via-[#24282B]/10 to-transparent" />
        {/* Assombrissement progressif subtil au défilement pour fondre 02_Hero vers la section suivante */}
        <motion.div
          style={prefersReducedMotion ? undefined : { opacity: depthScrimOpacity }}
          className="pointer-events-none absolute inset-0 bg-[#1C1F21] opacity-0 will-change-[opacity]"
        />
      </div>

      {/* Contenu éditorial centré max 1280 px avec révélation typographique masquée et léger décalage de profondeur */}
      <motion.div
        data-testid="hero-parallax-content"
        style={prefersReducedMotion ? undefined : { y: contentParallaxY }}
        className="relative z-10 mx-auto w-full max-w-[1280px] shrink-0 px-5 sm:px-8 lg:px-10 pt-1 pb-[clamp(12px,calc(6.9svh-25.5px),20px)] sm:pt-2 sm:pb-20 lg:pt-24 lg:pb-32 will-change-transform"
      >
        <div className="flex flex-col items-start max-w-[640px]">
          {config.kicker && (
          <motion.p
            initial={skipIntro ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.45, ease: REVEAL_EASE }}
            className="section-kicker text-[#B79A62]"
          >
            {config.kicker}
          </motion.p>
          )}

          <h1
            id="02_Hero-title"
            className={`${config.kicker ? 'mt-4' : 'mt-2'} font-display text-[clamp(2.15rem,4vw,3.5rem)] max-sm:text-[clamp(1.95rem,calc(3.2svh+0.9rem),2.15rem)] font-semibold leading-[1.08] tracking-[-0.015em] text-white`}
          >
            <span className="block overflow-hidden pb-1">
              <motion.span
                initial={skipIntro ? { y: 0, opacity: 1 } : { y: '105%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: prefersReducedMotion ? 0 : 0.62,
                  delay: prefersReducedMotion ? 0 : 0.08,
                  ease: REVEAL_EASE,
                }}
                className="block sm:whitespace-nowrap will-change-transform"
              >
                {config.headlineLines[0]}
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-1">
              <motion.span
                initial={skipIntro ? { y: 0, opacity: 1 } : { y: '105%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: prefersReducedMotion ? 0 : 0.62,
                  delay: prefersReducedMotion ? 0 : 0.19,
                  ease: REVEAL_EASE,
                }}
                className="block will-change-transform"
              >
                {config.headlineLines[1]}
              </motion.span>
            </span>
          </h1>

          <motion.p
            initial={skipIntro ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.54,
              delay: prefersReducedMotion ? 0 : 0.3,
              ease: REVEAL_EASE,
            }}
            className="mt-3 sm:mt-5 max-w-[490px] text-[clamp(14.5px,calc(1.5svh+5.6px),15.5px)] sm:text-[18px] leading-[1.6] text-white/92"
          >
            {config.subtitle}
          </motion.p>

          {/* Mobile : emplacement de la barre d'actions (Devis · SOS · Contact), qui se fixe en bas au défilement */}
          <div id="hero-action-slot" className="mt-[clamp(20px,calc(13.8svh-55px),36px)] w-full sm:hidden" />

          {/* Deux boutons d'appel à l'action (tablette & ordinateur) */}
          <motion.div
            initial={skipIntro ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.54,
              delay: prefersReducedMotion ? 0 : 0.4,
              ease: REVEAL_EASE,
            }}
            className="mt-8 hidden sm:flex sm:flex-row sm:flex-wrap sm:items-center gap-3 w-auto"
          >
            <button
              ref={quoteTriggerRef}
              type="button"
              onClick={onOpenQuoteModal}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#B79A62] hover:bg-[#C6AA73] active:bg-[#A68952] px-5 text-[15px] font-semibold text-[#1C1F21] whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F3F0E7] cursor-pointer"
            >
              <span>{config.primaryCtaLabel}</span>
            </button>

            <a
              href={config.secondaryCtaHref}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#F3F0E7]/40 hover:border-[#F3F0E7] hover:bg-[#F3F0E7]/10 px-5 text-[15px] font-medium text-[#F3F0E7] tabular-nums whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79A62] cursor-pointer"
            >
              {config.secondaryCtaHref.startsWith('tel:') && (
                <Phone className="h-4 w-4 shrink-0 text-[#B79A62]" strokeWidth={2} aria-hidden="true" />
              )}
              <span className="tabular-nums">{config.secondaryCtaLabel}</span>
            </a>
          </motion.div>

          {/* Engagements concrets en cascade */}
          <motion.ul
            aria-label="Nos engagements"
            initial={skipIntro ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.54,
              delay: prefersReducedMotion ? 0 : 0.5,
              ease: REVEAL_EASE,
            }}
            className="mt-6 sm:mt-8 hidden sm:flex flex-wrap items-center gap-2"
          >
            {config.commitments.map((item) => (
              <li
                key={item.label}
                className="inline-flex items-center gap-2 rounded-full bg-[#F3F0E7]/[0.08] px-3.5 py-1.5 text-[14px] text-white whitespace-nowrap ring-1 ring-white/20"
              >
                <CommitmentIcon icon={item.icon} />
                <span>{item.label}</span>
              </li>
            ))}
          </motion.ul>
        </div>
      </motion.div>

      {/* Indicateur du diaporama + contrôle lecture/pause (vidéo ou diaporama) */}
      {(hasSlideshow || hasVideoSource) && (
        <div className="pointer-events-none absolute inset-x-0 top-2 sm:top-[calc(min(54svh,520px)-30px)] lg:top-auto lg:bottom-4 z-20">
          <div className="pointer-events-auto mx-auto flex max-w-[1280px] items-center justify-center lg:justify-end gap-3 px-5 sm:px-8 lg:px-10">
            {hasSlideshow && (
              <HeroSlideshowIndicator
                slides={slides}
                activeIndex={activeSlide}
                isPaused={isSlideshowPaused}
                onSelect={setActiveSlide}
              />
            )}
            <button
              type="button"
              onClick={handleTogglePlayback}
              aria-label={
                (hasSlideshow ? isSlideshowPausedByChoice : isVideoPaused)
                  ? hasSlideshow
                    ? 'Relancer le diaporama'
                    : 'Lancer la vidéo d’arrière-plan'
                  : hasSlideshow
                    ? 'Mettre en pause le diaporama'
                    : 'Mettre en pause la vidéo d’arrière-plan'
              }
              className="sr-only focus:not-sr-only focus:inline-flex focus:h-10 focus:w-10 focus:shrink-0 focus:items-center focus:justify-center focus:rounded-full focus:border focus:border-[#B79A62] focus:bg-[#1C1F21]/80 focus:text-[#F3F0E7] focus:outline-2 focus:outline-offset-2 focus:outline-[#B79A62] cursor-pointer"
            >
              {(hasSlideshow ? isSlideshowPausedByChoice : isVideoPaused) ? (
                <Play className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Pause className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      )}

      {overlay}

      {/* Coupe vague dorée vers la section suivante (bloc urgence, fond blanc) */}
      <HeroGoldWave fillColor="#FFFFFF" />
    </section>
  );
}
