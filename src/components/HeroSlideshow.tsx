import { useEffect, useRef, useState } from 'react';
import type { HeroSlide } from '../data/heroConfig';
import {
  formatSlideCounter,
  HERO_SLIDESHOW_TIMING,
  kenBurnsMoveFor,
  kenBurnsTransform,
  slidesToRender,
} from '../utils/heroSlideshow';

const TOTAL_ANIMATION_MS =
  HERO_SLIDESHOW_TIMING.slideDurationMs + HERO_SLIDESHOW_TIMING.fadeDurationMs;

/** Image du diaporama avec son mouvement de caméra lent. */
function SlideImage({
  slide,
  index,
  isActive,
  isPaused,
  reducedMotion,
  priority,
}: {
  readonly slide: HeroSlide;
  readonly index: number;
  readonly isActive: boolean;
  readonly isPaused: boolean;
  readonly reducedMotion: boolean;
  readonly priority: boolean;
}) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const animationRef = useRef<Animation | null>(null);

  // (Re)lance le mouvement de caméra à chaque fois que l'image devient active.
  // L'image qui s'efface garde sa position finale pendant le fondu.
  useEffect(() => {
    const el = imgRef.current;
    if (!isActive || !el || reducedMotion || typeof el.animate !== 'function') {
      return;
    }
    const move = kenBurnsMoveFor(index);
    animationRef.current?.cancel();
    animationRef.current = el.animate(
      [{ transform: kenBurnsTransform(move.from) }, { transform: kenBurnsTransform(move.to) }],
      { duration: TOTAL_ANIMATION_MS, easing: 'linear', fill: 'forwards' }
    );
  }, [isActive, index, reducedMotion]);

  useEffect(() => {
    const animation = animationRef.current;
    if (!animation || !isActive) {
      return;
    }
    if (isPaused) {
      animation.pause();
    } else if (animation.playState === 'paused') {
      animation.play();
    }
  }, [isPaused, isActive]);

  useEffect(() => () => animationRef.current?.cancel(), []);

  return (
    <img
      ref={imgRef}
      src={slide.src}
      alt=""
      draggable={false}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      referrerPolicy="no-referrer"
      style={
        {
          '--pos-mobile': slide.objectPositionMobile,
          '--pos-desktop': slide.objectPositionDesktop,
          opacity: isActive ? 1 : 0,
          zIndex: isActive ? 2 : 1,
          transitionDuration: `${HERO_SLIDESHOW_TIMING.fadeDurationMs}ms`,
          transform: reducedMotion ? undefined : kenBurnsTransform(kenBurnsMoveFor(index).from),
        } as React.CSSProperties
      }
      className="hero-slide absolute inset-0 h-full w-full object-cover transition-opacity ease-in-out will-change-[opacity,transform]"
    />
  );
}

/** Couche d'images du diaporama (placée dans le calque média de l'accueil). */
export function HeroSlideshowMedia({
  slides,
  activeIndex,
  isPaused,
  reducedMotion,
}: {
  readonly slides: readonly HeroSlide[];
  readonly activeIndex: number;
  readonly isPaused: boolean;
  readonly reducedMotion: boolean;
}) {
  // Une fois chargée, une image reste montée : on évite de la retélécharger.
  const [mounted, setMounted] = useState<ReadonlySet<number>>(
    () => new Set(slidesToRender(activeIndex, slides.length))
  );

  useEffect(() => {
    setMounted((prev) => {
      const next = new Set(prev);
      for (const i of slidesToRender(activeIndex, slides.length)) {
        next.add(i);
      }
      return next.size === prev.size ? prev : next;
    });
  }, [activeIndex, slides.length]);

  return (
    <div className="absolute inset-0">
      {slides.map((slide, index) =>
        mounted.has(index) ? (
          <SlideImage
            key={slide.src}
            slide={slide}
            index={index}
            isActive={index === activeIndex}
            isPaused={isPaused}
            reducedMotion={reducedMotion}
            priority={index === 0}
          />
        ) : null
      )}
    </div>
  );
}

/** Indicateur façon « site d'architecte » : libellé, compteur et barres de progression. */
export function HeroSlideshowIndicator({
  slides,
  activeIndex,
  isPaused,
  onSelect,
}: {
  readonly slides: readonly HeroSlide[];
  readonly activeIndex: number;
  readonly isPaused: boolean;
  readonly onSelect: (index: number) => void;
}) {
  const active = slides[activeIndex];
  return (
    <div className="flex flex-col lg:items-end">
      {/* Compteur masqué visuellement, annoncé aux lecteurs d'écran */}
      <p className="sr-only" aria-live="polite">
        Image {formatSlideCounter(activeIndex, slides.length)} : {active?.label}
      </p>
      <div className="flex items-center gap-1" role="group" aria-label="Choisir une image">
        {slides.map((slide, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={slide.src}
              type="button"
              onClick={() => onSelect(index)}
              aria-label={`Afficher l’image ${index + 1} : ${slide.label}`}
              aria-current={isActive ? 'true' : undefined}
              className="group relative flex h-4 w-5 sm:w-6 items-center cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79A62]"
            >
              <span className="relative block h-px w-full overflow-hidden bg-[#F3F0E7]/15 group-hover:bg-[#F3F0E7]/35">
                {isActive && (
                  <span
                    key={`${index}-${activeIndex}`}
                    className="hero-progress absolute inset-0 origin-left bg-[#F3F0E7]/55"
                    style={{
                      animationDuration: `${HERO_SLIDESHOW_TIMING.slideDurationMs}ms`,
                      animationPlayState: isPaused ? 'paused' : 'running',
                    }}
                  />
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
