import { useEffect, useRef, useState } from 'react';
import { ClipboardCheck, KeyRound, Pause, Play, ShieldCheck } from 'lucide-react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import type { CommitmentIconKey, HeroConfig } from '../data/heroConfig';
import { HERO_PARALLAX_CONFIG } from '../utils/heroParallax';
import type { SectionId } from '../utils/navigation';
import { REVEAL_EASE } from '../utils/scrollReveal';

interface HeroSectionProps {
  readonly config: HeroConfig;
  readonly onOpenQuoteModal: () => void;
  readonly onSelectSection: (sectionId: SectionId) => void;
  readonly quoteTriggerRef?: React.RefObject<HTMLButtonElement | null>;
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
}: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [posterFailed, setPosterFailed] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [isVideoPaused, setIsVideoPaused] = useState(false);
  const prefersReducedMotion = useReducedMotion() ?? false;

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
      className="relative w-full overflow-hidden bg-[#1C1F21] scroll-mt-[74px] lg:scroll-mt-[88px] min-h-[560px] sm:min-h-[620px] lg:min-h-[min(calc(100svh-88px),740px)] flex items-center"
    >
      {/* Couche média plein écran : vidéo HTML5 + poster artisanal avec parallaxe immersif au scroll */}
      <div
        data-testid="hero-media-layer"
        className="absolute inset-0 z-0 overflow-hidden bg-[#1C1F21]"
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
          {/* Image poster haute qualité (affichée immédiatement et en repli vidéo) */}
          {!posterFailed && (
            <img
              src={config.media.posterSrc}
              alt={config.media.posterAlt}
              referrerPolicy="no-referrer"
              onError={() => setPosterFailed(true)}
              className="h-full w-full object-cover object-[72%_32%] sm:object-[68%_38%] lg:object-[70%_40%]"
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
              poster={config.media.posterSrc}
              onError={() => setVideoFailed(true)}
              className="absolute inset-0 h-full w-full object-cover object-center"
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
        <div className="absolute inset-0 bg-gradient-to-t from-[#1C1F21] via-[#1C1F21]/82 to-[#1C1F21]/45 lg:hidden" />
        <div className="hidden lg:block absolute inset-0 bg-[linear-gradient(90deg,#1C1F21_0%,#1C1F21_28%,rgba(28,31,33,0.92)_44%,rgba(28,31,33,0.48)_62%,rgba(28,31,33,0.12)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#1C1F21]/90 via-[#1C1F21]/35 to-transparent" />
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
        className="relative z-10 mx-auto w-full max-w-[1280px] px-5 sm:px-8 lg:px-10 py-16 sm:py-20 lg:py-24 will-change-transform"
      >
        <div className="flex flex-col items-start max-w-[640px]">
          <motion.p
            initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.45, ease: REVEAL_EASE }}
            className="text-[13px] sm:text-[14px] font-medium tracking-[0.16em] text-[#B79A62]"
          >
            {config.kicker}
          </motion.p>

          <h1
            id="02_Hero-title"
            className="mt-4 font-display text-[clamp(2.15rem,4vw,3.5rem)] font-semibold leading-[1.08] tracking-[-0.015em] text-[#F3F0E7]"
          >
            <span className="block overflow-hidden pb-1">
              <motion.span
                initial={prefersReducedMotion ? { y: 0, opacity: 1 } : { y: '105%', opacity: 0 }}
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
                initial={prefersReducedMotion ? { y: 0, opacity: 1 } : { y: '105%', opacity: 0 }}
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
            initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.54,
              delay: prefersReducedMotion ? 0 : 0.3,
              ease: REVEAL_EASE,
            }}
            className="mt-5 max-w-[490px] text-[16px] sm:text-[18px] leading-[1.6] text-[#F3F0E7]/85"
          >
            {config.subtitle}
          </motion.p>

          {/* Deux boutons d'appel à l'action */}
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.54,
              delay: prefersReducedMotion ? 0 : 0.4,
              ease: REVEAL_EASE,
            }}
            className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4 w-full sm:w-auto"
          >
            <button
              ref={quoteTriggerRef}
              type="button"
              onClick={onOpenQuoteModal}
              className="group relative overflow-hidden inline-flex min-h-[48px] flex-1 sm:flex-initial items-center justify-center rounded-lg bg-[#B79A62] hover:bg-[#C6AA73] active:bg-[#A68952] px-5 sm:px-7 py-3 text-[15px] sm:text-[16px] font-semibold text-[#1C1F21] whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F3F0E7] cursor-pointer"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-500 ease-out group-hover:translate-x-full"
              />
              <span className="relative">{config.primaryCtaLabel}</span>
            </button>

            <a
              href={config.secondaryCtaHref}
              onClick={() => onSelectSection(config.secondaryCtaTargetId)}
              className="inline-flex min-h-[48px] flex-1 sm:flex-initial items-center justify-center rounded-lg border border-[#F3F0E7]/65 bg-[#1C1F21]/35 hover:bg-[#F3F0E7]/10 hover:border-[#F3F0E7] px-5 sm:px-7 py-3 text-[15px] sm:text-[16px] font-medium text-[#F3F0E7] whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79A62]"
            >
              {config.secondaryCtaLabel}
            </a>
          </motion.div>

          {/* Engagements concrets en cascade */}
          <motion.ul
            aria-label="Nos engagements"
            initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.54,
              delay: prefersReducedMotion ? 0 : 0.5,
              ease: REVEAL_EASE,
            }}
            className="mt-10 sm:mt-12 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3.5 sm:gap-y-3 sm:gap-x-0 border-t border-[#F3F0E7]/15 pt-6 w-full"
          >
            {config.commitments.map((item, index) => (
              <li
                key={item.label}
                className={`flex items-center gap-2.5 text-[14px] sm:text-[15px] text-[#F3F0E7]/90 whitespace-nowrap ${
                  index > 0
                    ? 'sm:border-l sm:border-[#F3F0E7]/20 sm:pl-5 sm:ml-5'
                    : ''
                }`}
              >
                <CommitmentIcon icon={item.icon} />
                <span>{item.label}</span>
              </li>
            ))}
          </motion.ul>
        </div>
      </motion.div>

      {/* Contrôle discret lecture/pause lorsqu'une vidéo plein écran est branchée */}
      {hasVideoSource && (
        <button
          type="button"
          onClick={handleTogglePlayback}
          aria-label={
            isVideoPaused
              ? 'Lancer la vidéo d’arrière-plan'
              : 'Mettre en pause la vidéo d’arrière-plan'
          }
          className="absolute bottom-5 right-5 z-20 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[#F3F0E7]/25 bg-[#1C1F21]/70 text-[#F3F0E7] backdrop-blur-sm hover:border-[#B79A62] hover:text-[#B79A62] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79A62] cursor-pointer"
        >
          {isVideoPaused ? (
            <Play className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Pause className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      )}
    </section>
  );
}
