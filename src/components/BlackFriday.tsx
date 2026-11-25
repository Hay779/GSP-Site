/**
 * Black Friday sur mobile (maquette validée `docs/maquettes/black-friday/8-presentation-onglet-popup.png`) :
 * bandeau doré défilant, rond flottant « Black Friday -20 % » et pop-up des offres.
 * Rien ne s'ouvre tout seul. Textes et dates : `data/promotions.ts`.
 */
import { Fragment, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronRight, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from 'motion/react';
import type { Promotion } from '../data/promotions';
import type { BrandConfig } from '../utils/navigation';
import { REVEAL_EASE } from '../utils/scrollReveal';
import { BrandMark } from './BrandMark';

/** Fond doré des boutons et pastilles. */
export const PROMO_GOLD = 'bg-[linear-gradient(100deg,#E5C57B_0%,#CDB074_45%,#B79A62_100%)]';
/** Texte doré dégradé (chiffres, « FRIDAY »). */
export const PROMO_GOLD_TEXT = 'bg-[linear-gradient(180deg,#F3DB9E,#B79A62)] bg-clip-text text-transparent';

/* ------------------------------------------------------------------ */
/* Bandeau défilant                                                    */
/* ------------------------------------------------------------------ */

/**
 * Bandeau sous l'en-tête. Variante « gold » (accueil, ouvre la pop-up) ou « dark »
 * (page /promotions, simple rappel).
 */
export function PromoTicker({
  promo,
  variant = 'gold',
  onOpen,
}: {
  readonly promo: Promotion;
  readonly variant?: 'gold' | 'dark';
  readonly onOpen?: () => void;
}) {
  const gold = variant === 'gold';
  const items = [...promo.offers.map((o) => o.tickerLabel), promo.untilShortLabel.replace('jusqu’au', 'Jusqu’au')];
  const sequence = (copy: number) => (
    <span aria-hidden={copy > 0 ? true : undefined} className="flex shrink-0 items-center gap-5 pr-5">
      {items.map((item, i) => (
        <Fragment key={`${copy}-${i}`}>
          <span className="uppercase">{item}</span>
          <span aria-hidden="true" className={gold ? 'text-[#1C1F21]' : 'text-[#D9BD82]'}>
            ✦
          </span>
        </Fragment>
      ))}
    </span>
  );

  const content = (
    <>
      <span
        className={`relative z-10 ml-4 mr-1 inline-flex h-[24px] shrink-0 items-center rounded-full px-3 text-[11.5px] font-bold uppercase tracking-[0.14em] ${
          gold ? 'bg-[#0B0C0D] text-[#F3F0E7]' : `${PROMO_GOLD} text-[#0B0C0D]`
        }`}
      >
        {promo.name}
      </span>
      <span className="relative min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_14px,#000_88%,transparent)]">
        <span className="promo-marquee-track flex w-max items-center pl-3">
          {sequence(0)}
          {sequence(1)}
        </span>
      </span>
    </>
  );

  const base = `flex h-[38px] w-full items-center text-[13px] font-bold tracking-[0.02em] ${
    gold ? `${PROMO_GOLD} text-[#1C1F21]` : 'border-b border-[#B79A62]/45 bg-[#0B0C0D] text-[#F3F0E7]'
  }`;

  return onOpen ? (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`${promo.name} : voir les offres, ${promo.untilShortLabel}`}
      aria-haspopup="dialog"
      className={`${base} cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#0B0C0D]`}
    >
      {content}
    </button>
  ) : (
    <div className={base} role="note" aria-label={`${promo.name} ${promo.untilShortLabel}`}>
      {content}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Rond flottant (au-dessus de la barre Devis · SOS · Contact)          */
/* ------------------------------------------------------------------ */

export function PromoFloatingBadge({
  promo,
  visible,
  onOpen,
  onDismiss,
}: {
  readonly promo: Promotion;
  readonly visible: boolean;
  readonly onOpen: () => void;
  readonly onDismiss: () => void;
}) {
  return (
    <div
      aria-hidden={!visible}
      className={`fixed bottom-[98px] right-4 z-[57] transition-all duration-300 motion-reduce:transition-none sm:hidden ${
        visible ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none translate-y-4 scale-90 opacity-0'
      }`}
    >
      <button
        type="button"
        onClick={onOpen}
        tabIndex={visible ? 0 : -1}
        aria-haspopup="dialog"
        aria-label={`${promo.name} -20 % : voir les offres`}
        className="relative grid h-[80px] w-[80px] cursor-pointer place-items-center rounded-full border-2 border-[#D9BD82] bg-[#0B0C0D] text-center shadow-[0_10px_26px_rgba(0,0,0,0.5)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79A62]"
      >
        <span aria-hidden="true" className="absolute -left-0.5 top-0.5 h-3 w-3 rounded-full bg-[#C0392B] ring-2 ring-[#C0392B]/30 motion-safe:animate-pulse" />
        <span className="flex flex-col items-center leading-none">
          <span className="font-display text-[10px] font-bold uppercase leading-[1.15] tracking-[0.12em] text-[#F3F0E7]">
            Black
            <br />
            Friday
          </span>
          <span className={`mt-0.5 font-display text-[22px] font-extrabold tracking-[-0.02em] ${PROMO_GOLD_TEXT}`}>-20%</span>
        </span>
      </button>
      <button
        type="button"
        onClick={onDismiss}
        tabIndex={visible ? 0 : -1}
        aria-label={`Masquer le ${promo.name} pour cette visite`}
        className="absolute -right-2.5 -top-2.5 grid h-8 w-8 cursor-pointer place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-[#B79A62]"
      >
        <span className="grid h-[22px] w-[22px] place-items-center rounded-full bg-white text-[#1C1F21] shadow-[0_2px_6px_rgba(0,0,0,0.3)]">
          <X className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
        </span>
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Ordinateur et tablette : macaron sur la photo et rond en bas à gauche */
/* ------------------------------------------------------------------ */

/** Macaron rond, penché, posé sur la photo du haut de page (grand écran). */
export function PromoHeroBadge({ promo, onOpen }: { readonly promo: Promotion; readonly onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      aria-label={`${promo.name} : jusqu’à -20 %, ${promo.untilShortLabel}. Voir les offres`}
      className="absolute right-[6%] top-10 z-20 hidden h-[150px] w-[150px] -rotate-[10deg] cursor-pointer place-items-center rounded-full border-[2.5px] border-[#D9BD82] bg-[#0B0C0D] text-center shadow-[0_18px_40px_rgba(0,0,0,0.45)] transition-transform duration-300 hover:-rotate-[4deg] hover:scale-105 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E5C57B] lg:grid"
    >
      <span className="flex flex-col items-center leading-none">
        <span className="font-display text-[14px] font-bold uppercase leading-[1.1] tracking-[0.16em] text-[#F3F0E7]">
          Black
          <br />
          Friday
        </span>
        <span className={`mt-1 font-display text-[44px] font-extrabold tracking-[-0.03em] ${PROMO_GOLD_TEXT}`}>-20%</span>
        <span className="mt-0.5 text-[12px] text-[#F3F0E7]/85">{promo.untilShortLabel}</span>
      </span>
    </button>
  );
}

/** Rond flottant en bas à gauche (tablette et ordinateur), masqué sur le pied de page. */
export function PromoDesktopBadge({
  promo,
  hidden,
  onOpen,
  onDismiss,
}: {
  readonly promo: Promotion;
  readonly hidden: boolean;
  readonly onOpen: () => void;
  readonly onDismiss: () => void;
}) {
  const [nearFooter, setNearFooter] = useState(false);
  // Le haut de page a déjà le bandeau (et le macaron sur ordinateur) : le rond n'apparaît qu'après.
  const [pastHero, setPastHero] = useState(false);
  useEffect(() => {
    const update = () => {
      const footer = document.getElementById('11_Pied_De_Page');
      setNearFooter(footer ? footer.getBoundingClientRect().top < window.innerHeight - 40 : false);
      setPastHero(window.scrollY > window.innerHeight * 0.55);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);
  const visible = !hidden && !nearFooter && pastHero;
  return (
    <div
      aria-hidden={!visible}
      className={`fixed bottom-6 left-6 z-40 hidden transition-all duration-300 motion-reduce:transition-none sm:block ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      }`}
    >
      <button
        type="button"
        onClick={onOpen}
        tabIndex={visible ? 0 : -1}
        aria-haspopup="dialog"
        aria-label={`${promo.name} -20 % : voir les offres`}
        className="group relative grid h-[96px] w-[96px] cursor-pointer place-items-center rounded-full border-2 border-[#D9BD82] bg-[#0B0C0D] text-center shadow-[0_12px_30px_rgba(0,0,0,0.45)] transition-transform duration-200 hover:scale-105 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79A62]"
      >
        <span aria-hidden="true" className="absolute left-0.5 top-1 h-3.5 w-3.5 rounded-full bg-[#C0392B] ring-2 ring-[#C0392B]/30 motion-safe:animate-pulse" />
        <span className="flex flex-col items-center leading-none">
          <span className="font-display text-[11px] font-bold uppercase leading-[1.15] tracking-[0.12em] text-[#F3F0E7]">
            Black
            <br />
            Friday
          </span>
          <span className={`mt-1 font-display text-[26px] font-extrabold tracking-[-0.02em] ${PROMO_GOLD_TEXT}`}>-20%</span>
        </span>
      </button>
      <button
        type="button"
        onClick={onDismiss}
        tabIndex={visible ? 0 : -1}
        aria-label={`Masquer le ${promo.name} pour cette visite`}
        className="absolute -right-2 -top-2 grid h-8 w-8 cursor-pointer place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-[#B79A62]"
      >
        <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-[#1C1F21] shadow-[0_2px_6px_rgba(0,0,0,0.3)] transition-colors hover:bg-[#F1E7D3]">
          <X className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
        </span>
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pop-up des offres                                                    */
/* ------------------------------------------------------------------ */

/** Glisser pour fermer : seulement sur petit écran. */
function isTouchLayout(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches;
}

/** Mention d'une offre façon affiche (« -20% », « 3e OFFERT »). */
export function promoBadgeText(badge: string): string {
  return badge.replace(' %', '%').toUpperCase().replace('3E', '3e');
}

interface PromoSheetProps {
  readonly promo: Promotion;
  readonly brand: BrandConfig;
  readonly open: boolean;
  readonly onClose: () => void;
  readonly promoHref: string;
  readonly shopAddress: string;
}

export function PromoSheet({ promo, brand, open, onClose, promoHref, shopAddress }: PromoSheetProps) {
  const reduced = Boolean(useReducedMotion());
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = 'hidden';
    const focusTimer = window.setTimeout(() => closeRef.current?.focus({ preventScroll: true }), 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      // Le focus reste dans la pop-up.
      if (e.key === 'Tab' && sheetRef.current) {
        const items = sheetRef.current.querySelectorAll<HTMLElement>('a[href], button');
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', onKey);
      root.style.overflow = previousOverflow;
      opener?.focus?.({ preventScroll: true });
    };
  }, [open, onClose]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 110 || info.velocity.y > 600) onClose();
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="promo-dim"
            aria-hidden="true"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.2 }}
            className="fixed inset-0 z-[70] bg-black/65"
          />
          <div key="promo-sheet-wrap" className="pointer-events-none fixed inset-0 z-[71] flex items-end justify-center p-3 sm:items-center sm:p-6">
          <motion.div
            key="promo-sheet"
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="promo-sheet-title"
            initial={reduced ? { opacity: 0 } : { y: '110%' }}
            animate={reduced ? { opacity: 1 } : { y: 0 }}
            exit={reduced ? { opacity: 0 } : { y: '110%' }}
            transition={{ duration: reduced ? 0 : 0.38, ease: REVEAL_EASE }}
            drag={reduced || !isTouchLayout() ? false : 'y'}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.7 }}
            onDragEnd={onDragEnd}
            className="pointer-events-auto max-h-[calc(100svh-24px)] w-full max-w-[460px] overflow-y-auto overscroll-contain rounded-[26px] bg-[#0B0C0D] bg-[radial-gradient(120%_50%_at_50%_0%,rgba(183,154,98,0.3),transparent_60%)] p-2 text-[#F3F0E7] shadow-[0_-10px_50px_rgba(0,0,0,0.6)]"
          >
            <div className="relative rounded-[18px] border-[1.5px] border-[#D9BD82]/55 px-3.5 pb-3 pt-3">
              <div aria-hidden="true" className="mx-auto h-1 w-11 rounded-full bg-[#F3F0E7]/30 sm:invisible" />
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Fermer les offres"
                className="absolute right-3 top-3 grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-[#F3F0E7]/30 text-[#F3F0E7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79A62]"
              >
                <X className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
              </button>

              <div className="mt-2.5 flex justify-center" aria-hidden="true">
                <BrandMark brand={brand} compact />
              </div>
              <p className="mt-2 text-center text-[11.5px] font-bold uppercase tracking-[0.24em] text-[#E5C57B]">{promo.untilLabel}</p>
              <h2
                id="promo-sheet-title"
                className={`mt-1 text-center font-display text-[33px] font-extrabold uppercase leading-none tracking-[-0.01em] ${PROMO_GOLD_TEXT}`}
              >
                {promo.name}
              </h2>

              <ul className="mt-3 flex flex-col gap-2">
                {promo.offers.map((offer) => (
                  <li
                    key={offer.id}
                    className="flex items-center gap-3 rounded-2xl border border-[#D9BD82]/35 bg-[#111315] p-2"
                  >
                    <img
                      src={offer.imageSrc}
                      alt=""
                      loading="lazy"
                      className="h-[72px] w-[72px] shrink-0 rounded-xl bg-[#16191B] object-cover"
                    />
                    <div className="min-w-0">
                      <p className={`font-display text-[21px] font-extrabold leading-none tracking-[-0.02em] ${PROMO_GOLD_TEXT}`}>
                        {promoBadgeText(offer.badge)}
                      </p>
                      <p className="mt-1 font-display text-[15px] font-semibold leading-tight">{offer.title}</p>
                      <p className="text-[12.5px] leading-snug text-[#F3F0E7]/70">{offer.summary}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <p className="mt-3 text-center text-[13.5px] leading-snug text-[#F3F0E7]/85">
                Montrez cet écran en boutique
                <br />
                <strong className="font-semibold text-[#F3F0E7]">{shopAddress}</strong>
              </p>

              <div className="mt-3 flex items-center gap-4">
                <a
                  href={promoHref}
                  onClick={onClose}
                  className={`inline-flex h-11 flex-1 items-center justify-center gap-1 rounded-full ${PROMO_GOLD} px-5 text-[15px] font-bold text-[#1C1F21] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F3F0E7]`}
                >
                  Profiter de l’offre
                  <ChevronRight className="h-4 w-4" strokeWidth={2.4} aria-hidden="true" />
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="shrink-0 cursor-pointer px-1 text-[15px] font-semibold text-[#E5C57B] underline decoration-[#E5C57B]/60 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79A62]"
                >
                  Fermer
                </button>
              </div>

              <p className="mt-2.5 text-center text-[10.5px] uppercase tracking-[0.06em] text-[#F3F0E7]/55">
                Offres valables du 24 au 30 novembre · non cumulables
              </p>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
