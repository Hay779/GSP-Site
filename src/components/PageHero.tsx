import { useEffect, useState, type ReactNode } from 'react';
import { Check } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { REVEAL_EASE } from '../utils/scrollReveal';
import { HeroGoldWave } from './HeroGoldWave';

interface PageHeroProps {
  readonly title: string;
  readonly intro: string;
  readonly imageSrc?: string;
  /** Cadrage de la photo (CSS object-position). */
  readonly imagePosition?: string;
  readonly actions?: ReactNode;
  /** En-tête réduit, sans photo (pages légales). */
  readonly compact?: boolean;
  /** Petits points rassurants affichés sous l'introduction. */
  readonly highlights?: readonly string[];
  /** Couleur de la section suivante (remplissage de la vague dorée du bas). */
  readonly nextFill?: string;
  /** Raccourcis vers des sections de la page (pastilles). */
  readonly shortcuts?: readonly { readonly label: string; readonly targetId: string }[];
}

/** Met à jour le titre de l'onglet et la description Google de la page. */
export function usePageMeta(title: string, description: string) {
  useEffect(() => {
    const previousTitle = document.title;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = meta?.content ?? '';
    document.title = title;
    if (meta) {
      meta.content = description;
    }
    return () => {
      document.title = previousTitle;
      if (meta) {
        meta.content = previousDescription;
      }
    };
  }, [title, description]);
}

/** En-tête commun des pages intérieures. */
export function PageHero({
  title,
  intro,
  imageSrc,
  imagePosition = '60% 45%',
  actions,
  highlights = [],
  shortcuts = [],
  nextFill = '#F7F5F0',
  compact = false,
}: PageHeroProps) {
  const prefersReducedMotion = Boolean(useReducedMotion());
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => setImageFailed(false), [imageSrc]);

  const fadeUp = (delay = 0) => ({
    initial: prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: prefersReducedMotion ? 0 : 0.55,
      delay: prefersReducedMotion ? 0 : delay,
      ease: REVEAL_EASE,
    },
  });

  const hasPhoto = Boolean(imageSrc) && !compact && !imageFailed;

  const photo = (className: string) =>
    imageSrc ? (
      <motion.img
        key={imageSrc}
        src={imageSrc}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setImageFailed(true)}
        initial={prefersReducedMotion ? { scale: 1.02 } : { scale: 1.1 }}
        animate={{ scale: 1.02 }}
        transition={{ duration: prefersReducedMotion ? 0 : 6, ease: 'easeOut' }}
        style={{ objectPosition: imagePosition }}
        className={`h-full w-full object-cover will-change-transform [filter:contrast(1.06)_saturate(1.1)_brightness(1.05)] ${className}`}
      />
    ) : null;

  const text = (
    <>
      <motion.h1
        {...fadeUp(0.04)}
        id="page-hero-title"
        className="font-display text-[clamp(2.15rem,4.4vw,3.5rem)] font-semibold leading-[1.06] tracking-[-0.015em] text-white"
      >
        {title}
      </motion.h1>
      <motion.p {...fadeUp(0.12)} className="mt-4 sm:mt-5 max-w-[560px] text-[16px] sm:text-[18px] leading-[1.6] text-white/92">
        {intro}
      </motion.p>
      {highlights.length > 0 && (
        <motion.ul {...fadeUp(0.18)} className="mt-5 flex flex-wrap gap-2">
          {highlights.map((item) => (
            <li
              key={item}
              className="inline-flex items-center gap-2 rounded-full bg-[#F3F0E7]/[0.08] px-3.5 py-1.5 text-[13.5px] sm:text-[14px] text-white ring-1 ring-white/20"
            >
              <Check className="h-3.5 w-3.5 shrink-0 text-[#B79A62]" strokeWidth={2.4} aria-hidden="true" />
              {item}
            </li>
          ))}
        </motion.ul>
      )}
      {shortcuts.length > 0 && (
        <motion.nav {...fadeUp(0.18)} aria-label="Thèmes de la page" className="mt-6 flex flex-wrap gap-2">
          {shortcuts.map((item) => (
            <button
              key={item.targetId}
              type="button"
              onClick={() => document.getElementById(item.targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="rounded-full border border-[#F3F0E7]/25 px-3.5 py-1.5 text-[14px] text-[#F3F0E7]/90 hover:border-[#B79A62] hover:text-[#F3F0E7] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79A62] cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </motion.nav>
      )}
    </>
  );

  if (!hasPhoto) {
    // En-tête sans photo (pages légales, ou photo indisponible).
    return (
      <section
        id="page-hero"
        aria-labelledby="page-hero-title"
        className={`relative w-full overflow-hidden bg-[#24282B] bg-[radial-gradient(ellipse_at_78%_30%,rgba(183,154,98,0.22),rgba(54,58,61,0.4)_45%,rgba(36,40,43,1)_85%)] ${
          compact ? '' : 'lg:min-h-[420px] lg:flex lg:items-center'
        }`}
      >
        <div className={`relative mx-auto w-full max-w-[1280px] px-5 sm:px-8 lg:px-10 ${compact ? 'pt-20 pb-16 lg:pb-24' : 'pt-24 pb-20 lg:pt-20 lg:pb-28'}`}>
          <div className="max-w-[640px]">
            {text}
            {actions && (
              <motion.div {...fadeUp(0.24)} className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
                {actions}
              </motion.div>
            )}
          </div>
        </div>
        <HeroGoldWave compact={compact} fillColor={nextFill} />
      </section>
    );
  }

  return (
    <section
      id="page-hero"
      aria-labelledby="page-hero-title"
      className="relative w-full overflow-hidden bg-[#16191B] lg:bg-[#24282B] bg-[radial-gradient(ellipse_at_80%_35%,rgba(183,154,98,0.2),transparent_60%)]"
    >
      {/* Mobile & tablette : photo en bandeau, bas arrondi avec filet doré */}
      <div aria-hidden="true" className="kb-curve relative h-[34svh] min-h-[210px] max-h-[320px] overflow-hidden lg:hidden">
        {photo('absolute inset-0')}
      </div>

      <div className="relative mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10 pt-6 pb-16 sm:pb-20 lg:grid lg:grid-cols-12 lg:items-center lg:gap-12 lg:pt-16 lg:pb-28">
        <div className="lg:col-span-6">
          {text}
          {actions && (
            <motion.div {...fadeUp(0.24)} className="mt-7 hidden sm:flex flex-row flex-wrap gap-3">
              {actions}
            </motion.div>
          )}
          {/* Mobile : la barre Devis · SOS · Contact vient se placer ici (puis se fixe en bas en descendant). */}
          <div id="hero-action-slot" className="mt-7 w-full sm:hidden" />
        </div>
        {/* Ordinateur : photo à droite, en carte arrondie */}
        <div aria-hidden="true" className="relative hidden h-[400px] overflow-hidden rounded-3xl ring-1 ring-[#B79A62]/30 lg:col-span-6 lg:block">
          {photo('absolute inset-0')}
        </div>
      </div>
      {/* Coupe vague dorée vers la section suivante */}
      <HeroGoldWave fillColor={nextFill} />
    </section>
  );
}

/** Classes des deux boutons standard des en-têtes de page. */
export const PAGE_HERO_PRIMARY_BUTTON =
  'inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#B79A62] hover:bg-[#C6AA73] active:bg-[#A68952] px-5 text-[15px] font-semibold text-[#1C1F21] whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F3F0E7] cursor-pointer';

export const PAGE_HERO_SECONDARY_BUTTON =
  'inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#F3F0E7]/40 hover:border-[#F3F0E7] hover:bg-[#F3F0E7]/10 px-5 text-[15px] font-medium text-[#F3F0E7] tabular-nums whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79A62] cursor-pointer';
