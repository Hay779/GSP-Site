import { useId, useState } from 'react';
import { ArrowRight, ArrowUpRight, Shield, X } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import type { DomainCardItem, DomainsConfig } from '../data/sectionsContent';
import {
  DEFAULT_PEEL_DURATION,
  DEFAULT_PEEL_IMAGE_SCALE,
  PEEL_EASE,
  formatCardIndex,
  resolveNextOpenIndex,
  resolvePeelDuration,
} from '../utils/peelCards';
import { buildCardRevealMotion, REVEAL_VIEWPORT } from '../utils/scrollReveal';

interface DomainsSectionProps {
  readonly config: DomainsConfig;
  readonly onSelectDomain: (domain: DomainCardItem) => void;
}

interface PortraitPeelDomainCardProps {
  readonly item: DomainCardItem;
  readonly index: number;
  readonly isActive: boolean;
  readonly isFocused: boolean;
  readonly instanceId: string;
  readonly reducedMotion: boolean;
  readonly onPointerEnterMouse: () => void;
  readonly onPointerLeaveMouse: () => void;
  readonly onToggleOpen: () => void;
  readonly onCloseCard: () => void;
  readonly onFocusCard: () => void;
  readonly onBlurCard: () => void;
  readonly onSelectDomain: (domain: DomainCardItem) => void;
}

function PortraitPeelDomainCard({
  item,
  index,
  isActive,
  isFocused,
  instanceId,
  reducedMotion,
  onPointerEnterMouse,
  onPointerLeaveMouse,
  onToggleOpen,
  onCloseCard,
  onFocusCard,
  onBlurCard,
  onSelectDomain,
}: PortraitPeelDomainCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const number = formatCardIndex(index);
  const detailId = `${instanceId}-domain-detail-${index}`;
  const peelDuration = resolvePeelDuration(DEFAULT_PEEL_DURATION, reducedMotion);
  const reveal = buildCardRevealMotion({
    index,
    staggerSeconds: 0.09,
    offsetY: 26,
    duration: 0.55,
    reducedMotion,
  });

  return (
    <motion.article
      initial={reveal.initial}
      whileInView={reveal.visible}
      viewport={REVEAL_VIEWPORT}
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') {
          onPointerEnterMouse();
        }
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse') {
          onPointerLeaveMouse();
        }
      }}
      data-peel-active={isActive ? 'true' : 'false'}
      className={`relative w-full min-w-0 aspect-[0.78] overflow-hidden rounded-xl border bg-white isolate transition-colors duration-300 ${
        isActive ? 'border-[#B79A62]/70' : 'border-[#1C1F21]/10'
      } will-change-transform select-none ${
        isFocused ? 'outline-2 outline-offset-3 outline-[#B79A62]' : ''
      }`}
    >
      {/* Face révélée (sous la couverture photo) : fond clair + accents laiton */}
      <div
        id={detailId}
        aria-hidden={!isActive}
        className={`absolute inset-0 z-10 flex flex-col p-5 sm:p-6 text-[#1C1F21] bg-[radial-gradient(ellipse_90%_60%_at_100%_0%,rgba(183,154,98,0.16),transparent_65%)] transition-opacity duration-200 ${
          isActive ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7D612D]">
          <span className="truncate">{item.categoryTag}</span>
          <div className="flex items-center gap-2 shrink-0">
            <span className="tabular-nums">{number}</span>
            <button
              type="button"
              onClick={onCloseCard}
              tabIndex={isActive ? 0 : -1}
              aria-label={`Refermer la carte ${item.title}`}
              className="inline-flex sm:hidden h-7 w-7 items-center justify-center rounded-full border border-[#1C1F21]/20 text-[#1C1F21] hover:bg-[#1C1F21]/5 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-3" />

        <div className="flex flex-col gap-3">
          <h3 className="font-display text-[22px] sm:text-[24px] xl:text-[26px] font-semibold leading-[1.15] tracking-[-0.015em] text-[#1C1F21]">
            {item.title}
          </h3>
          <p className="text-[14px] leading-[1.52] text-[#1C1F21]/72">
            {item.summary}
          </p>
          <ul className="mt-0.5 flex flex-col gap-1.5 text-[12.5px] leading-[1.4] text-[#1C1F21]/68">
            {item.prestations.slice(0, 2).map((prestation) => (
              <li key={prestation} className="flex items-start gap-2">
                <span
                  aria-hidden="true"
                  className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-[#B79A62]"
                />
                <span className="line-clamp-2">{prestation}</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          onClick={() => onSelectDomain(item)}
          onFocus={onFocusCard}
          onBlur={onBlurCard}
          tabIndex={isActive ? 0 : -1}
          aria-label={`En savoir plus sur ${item.title}`}
          className="mt-5 flex w-full items-center justify-between gap-3 border-t border-[#B79A62]/40 pt-3.5 text-left font-display text-[14px] font-semibold text-[#7D612D] hover:text-[#1C1F21] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79A62] rounded-xs cursor-pointer"
        >
          <span>{item.ctaLabel}</span>
          <ArrowRight className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden="true" />
        </button>
      </div>

      {/* Couverture portrait coulissante (effet PortraitPeelCards) */}
      <motion.button
        type="button"
        aria-label={`Découvrir ${item.title}`}
        aria-expanded={isActive}
        aria-controls={detailId}
        tabIndex={isActive ? -1 : 0}
        onClick={() => {
          // Écrans tactiles (sans survol) : un seul appui ouvre directement la fiche.
          if (typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches) {
            onSelectDomain(item);
            return;
          }
          onToggleOpen();
        }}
        onFocus={onFocusCard}
        onBlur={onBlurCard}
        initial={false}
        animate={{ x: isActive ? '-102%' : '0%' }}
        transition={{ duration: peelDuration, ease: PEEL_EASE }}
        className={`absolute inset-0 z-30 block h-full w-full overflow-hidden border-0 bg-[#292D2F] p-0 text-left will-change-transform ${
          isActive ? 'pointer-events-none cursor-default' : 'pointer-events-auto cursor-pointer'
        }`}
      >
        {!imageFailed ? (
          <motion.img
            src={item.imageSrc}
            alt={item.imageAlt}
            draggable={false}
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
            initial={false}
            animate={{ scale: isActive ? DEFAULT_PEEL_IMAGE_SCALE : 1 }}
            transition={{ duration: peelDuration, ease: PEEL_EASE }}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[radial-gradient(circle_at_50%_40%,rgba(183,154,98,0.18),rgba(41,45,47,0.96))] px-4 text-center">
            <Shield className="h-9 w-9 text-[#B79A62]" strokeWidth={1.5} aria-hidden="true" />
          </div>
        )}

        {/* Voile éditorial sombre pour contraste texte sur photo */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(28,31,33,0.42)_0%,rgba(28,31,33,0.06)_36%,rgba(28,31,33,0.18)_58%,rgba(28,31,33,0.88)_100%)]"
        />

        {/* Contenu de la face portrait */}
        <div className="relative z-10 flex h-full w-full flex-col justify-between p-5 sm:p-6 text-[#F3F0E7]">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#F3F0E7]/90 tabular-nums">
              {number} / DOMAINE
            </span>
            <span
              aria-hidden="true"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#F3F0E7]/70 bg-[#1C1F21]/25 text-[#F3F0E7]"
            >
              <ArrowUpRight className="h-4 w-4" strokeWidth={1.8} />
            </span>
          </div>

          <div>
            <p className="font-display text-[22px] sm:text-[24px] xl:text-[26px] font-semibold leading-[1.15] tracking-[-0.015em] text-[#F3F0E7]">
              {item.title}
            </p>
            <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[#B79A62]">
              {item.categoryTag}
            </p>
            <p className="mt-4 text-[10px] font-medium uppercase tracking-[0.1em] text-[#F3F0E7]/75">
              Voir les prestations →
            </p>
          </div>
        </div>
      </motion.button>
    </motion.article>
  );
}

export function DomainsSection({ config, onSelectDomain }: DomainsSectionProps) {
  const prefersReducedMotion = Boolean(useReducedMotion());
  const instanceId = useId();
  const [openIndex, setOpenIndex] = useState<number>(-1);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  const headingReveal = buildCardRevealMotion({
    index: 0,
    offsetY: 16,
    duration: 0.48,
    reducedMotion: prefersReducedMotion,
  });

  return (
    <section
      id="05_Nos_Domaines"
      data-section="05_Nos_Domaines"
      aria-labelledby="05_Nos_Domaines-title"
      className="w-full bg-white scroll-mt-[74px] lg:scroll-mt-[88px]"
    >
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10 py-16 sm:py-20 lg:py-24">
        <motion.div
          initial={headingReveal.initial}
          whileInView={headingReveal.visible}
          viewport={REVEAL_VIEWPORT}
          className="max-w-2xl"
        >
          <p className="section-kicker text-[#7D612D]">
            {config.kicker}
          </p>
          <h2
            id="05_Nos_Domaines-title"
            className="mt-3 section-title text-[#1C1F21]"
          >
            {config.title}
          </h2>
        </motion.div>

        <div
          role="group"
          aria-label="Nos domaines d’intervention"
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setOpenIndex(-1);
            }
          }}
          className="mt-10 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-4"
        >
          {config.items.map((item, index) => (
            <PortraitPeelDomainCard
              key={item.id}
              item={item}
              index={index}
              isActive={openIndex === index}
              isFocused={focusedIndex === index}
              instanceId={instanceId}
              reducedMotion={prefersReducedMotion}
              onPointerEnterMouse={() => setOpenIndex(index)}
              onPointerLeaveMouse={() => setOpenIndex(-1)}
              onToggleOpen={() =>
                setOpenIndex((prev) =>
                  resolveNextOpenIndex(prev, index, config.items.length)
                )
              }
              onCloseCard={() => setOpenIndex(-1)}
              onFocusCard={() => setFocusedIndex(index)}
              onBlurCard={() => setFocusedIndex(-1)}
              onSelectDomain={onSelectDomain}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
