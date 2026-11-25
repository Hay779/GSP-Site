/**
 * Éléments du Black Friday sur mobile : bandeau doré défilant, macaron sur la photo
 * du haut de page, bouton « Voir les offres », rond flottant et tiroir des offres.
 * Les textes et les dates viennent de `data/promotions.ts`.
 */
import { Fragment, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronRight, Phone, Store, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from 'motion/react';
import type { Promotion } from '../data/promotions';
import { REVEAL_EASE } from '../utils/scrollReveal';

export const PROMO_GOLD = 'bg-[linear-gradient(100deg,#E5C57B_0%,#CDB074_45%,#B79A62_100%)]';
const PROMO_BLACK = '#0B0C0D';

/* ------------------------------------------------------------------ */
/* Bandeau défilant                                                    */
/* ------------------------------------------------------------------ */

function tickerItems(promo: Promotion, long: boolean): string[] {
  const labels = promo.offers.map((o) =>
    long && o.tickerLabel.startsWith('-20 %') ? o.tickerLabel.replace('-20 %', '-20 % sur les') : o.tickerLabel
  );
  return [...labels, promo.untilShortLabel.replace('jusqu’au', 'Jusqu’au')];
}

/**
 * Bandeau sous l'en-tête. Variante « gold » (accueil, ouvre le tiroir) ou « dark »
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
  const items = tickerItems(promo, !gold);
  const sequence = (copy: number) => (
    <span aria-hidden={copy > 0 ? true : undefined} className="flex shrink-0 items-center gap-5 pr-5">
      {items.map((item, i) => (
        <Fragment key={`${copy}-${i}`}>
          <span className={gold ? 'uppercase' : ''}>{item}</span>
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

  const base = `flex h-[38px] w-full items-center text-[13px] font-semibold tracking-[0.02em] ${
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
/* Macaron et bouton du haut de page                                    */
/* ------------------------------------------------------------------ */

/** Macaron rond, penché, posé sur la photo du haut de page (en haut à droite). */
export function PromoHeroBadge({ promo, onOpen }: { readonly promo: Promotion; readonly onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      aria-label={`${promo.name} : -20 %, ${promo.untilShortLabel}. Voir les offres`}
      className="absolute right-3 top-4 z-20 grid h-[128px] w-[128px] -rotate-[10deg] cursor-pointer place-items-center rounded-full border-[2.5px] border-[#D9BD82] bg-[#0B0C0D] text-center shadow-[0_14px_34px_rgba(0,0,0,0.45)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E5C57B] sm:hidden"
    >
      <span className="flex flex-col items-center leading-none">
        <span className="font-display text-[12.5px] font-bold uppercase leading-[1.1] tracking-[0.16em] text-[#F3F0E7]">
          Black
          <br />
          Friday
        </span>
        <span className="mt-1 bg-[linear-gradient(180deg,#F0D592,#B79A62)] bg-clip-text font-display text-[37px] font-extrabold tracking-[-0.03em] text-transparent">
          -20%
        </span>
        <span className="mt-0.5 text-[11px] text-[#F3F0E7]/85">{promo.untilShortLabel}</span>
      </span>
    </button>
  );
}

/** Bouton doré « Voir les offres Black Friday » au-dessus du titre (mobile). */
export function PromoHeroButton({ promo, href }: { readonly promo: Promotion; readonly href: string }) {
  return (
    <a
      href={href}
      className={`mb-3 inline-flex h-11 items-center gap-2.5 rounded-full ${PROMO_GOLD} pl-4 pr-5 text-[15px] font-semibold text-[#1C1F21] shadow-[0_8px_26px_rgba(229,197,123,0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F3F0E7] sm:hidden`}
    >
      <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-[#C0392B] ring-[3px] ring-[#C0392B]/25" />
      Voir les offres {promo.name}
      <ChevronRight className="-ml-1 h-4 w-4" strokeWidth={2.4} aria-hidden="true" />
    </a>
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
      className={`fixed bottom-[86px] left-3.5 z-[57] transition-all duration-300 motion-reduce:transition-none sm:hidden ${
        visible ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none translate-y-4 scale-90 opacity-0'
      }`}
    >
      <button
        type="button"
        onClick={onOpen}
        tabIndex={visible ? 0 : -1}
        aria-haspopup="dialog"
        aria-label={`${promo.name} -20 % : voir les offres`}
        className="relative grid h-[76px] w-[76px] cursor-pointer place-items-center rounded-full border-2 border-[#B79A62] bg-[#0B0C0D] text-center shadow-[0_10px_26px_rgba(0,0,0,0.4)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79A62]"
      >
        <span aria-hidden="true" className="absolute -left-0.5 top-0.5 h-3 w-3 rounded-full bg-[#C0392B] ring-2 ring-[#C0392B]/30" />
        <span className="flex flex-col items-center leading-none">
          <span className="font-display text-[9.5px] font-bold uppercase leading-[1.15] tracking-[0.12em] text-[#F3F0E7]">
            Black
            <br />
            Friday
          </span>
          <span className="mt-0.5 bg-[linear-gradient(180deg,#F0D592,#B79A62)] bg-clip-text font-display text-[21px] font-extrabold tracking-[-0.02em] text-transparent">
            -20%
          </span>
        </span>
      </button>
      <button
        type="button"
        onClick={onDismiss}
        tabIndex={visible ? 0 : -1}
        aria-label={`Masquer le ${promo.name} pour cette visite`}
        className="absolute -right-3 -top-3 grid h-8 w-8 cursor-pointer place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-[#B79A62]"
      >
        <span className="grid h-[22px] w-[22px] place-items-center rounded-full border border-[#1C1F21]/15 bg-white text-[#1C1F21] shadow-[0_2px_6px_rgba(0,0,0,0.25)]">
          <X className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
        </span>
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tiroir des offres                                                    */
/* ------------------------------------------------------------------ */

/** Pastille dorée d'une offre (-20 %, Offert…). */
export function PromoOfferBadge({ label, size = 'md' }: { readonly label: string; readonly size?: 'md' | 'lg' }) {
  const short = label.replace(' %', '%');
  const long = short.length > 5;
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-xl ${PROMO_GOLD} font-display font-extrabold tracking-[-0.02em] text-[#0B0C0D] ${
        size === 'lg'
          ? `h-[46px] px-4 ${long ? 'text-[19px]' : 'text-[26px]'} shadow-[0_8px_20px_rgba(0,0,0,0.25)]`
          : `h-[58px] w-[70px] ${long ? 'text-[15px]' : 'text-[22px]'}`
      }`}
    >
      {short}
    </span>
  );
}

interface PromoSheetProps {
  readonly promo: Promotion;
  readonly open: boolean;
  readonly onClose: () => void;
  readonly quoteHref: string;
  readonly promoHref: string;
  readonly phoneHref: string;
  readonly shopAddress: string;
}

export function PromoSheet({ promo, open, onClose, quoteHref, promoHref, phoneHref, shopAddress }: PromoSheetProps) {
  const reduced = Boolean(useReducedMotion());
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    openerRef.current = document.activeElement as HTMLElement | null;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = 'hidden';
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      // Le focus reste dans le tiroir.
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
      openerRef.current?.focus?.({ preventScroll: true });
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
            className="fixed inset-0 z-[70] bg-[#1C1F21]/55"
          />
          <motion.div
            key="promo-sheet"
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="promo-sheet-title"
            initial={reduced ? { opacity: 0 } : { y: '100%' }}
            animate={reduced ? { opacity: 1 } : { y: 0 }}
            exit={reduced ? { opacity: 0 } : { y: '100%' }}
            transition={{ duration: reduced ? 0 : 0.38, ease: REVEAL_EASE }}
            drag={reduced ? false : 'y'}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.7 }}
            dragListener
            onDragEnd={onDragEnd}
            className="fixed inset-x-0 bottom-0 z-[71] mx-auto max-h-[94svh] w-full max-w-[520px] overflow-y-auto overscroll-contain rounded-t-[28px] border-t border-[#B79A62]/40 bg-[#0B0C0D] bg-[radial-gradient(120%_60%_at_100%_0%,rgba(183,154,98,0.28),transparent_60%)] px-[18px] pb-[max(18px,env(safe-area-inset-bottom))] pt-3 text-[#F3F0E7] shadow-[0_-20px_60px_rgba(0,0,0,0.5)]"
          >
            <div aria-hidden="true" className="mx-auto h-1 w-11 rounded-full bg-[#F3F0E7]/30" />

            <div className="mt-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.26em] text-[#E5C57B]">{promo.untilLabel}</p>
                <h2 id="promo-sheet-title" className="mt-1.5 font-display text-[32px] font-extrabold uppercase leading-none tracking-[-0.02em]">
                  Black <span className="text-[#C9AA68]">Friday</span>
                </h2>
                <p className="mt-2 text-[15px] text-[#F3F0E7]/75">Sur devis, en boutique et à domicile.</p>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Fermer les offres"
                className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full border border-[#F3F0E7]/25 text-[#F3F0E7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79A62]"
              >
                <X className="h-[18px] w-[18px]" strokeWidth={2.2} aria-hidden="true" />
              </button>
            </div>

            <ul className="mt-4 flex flex-col gap-2.5">
              {promo.offers.map((offer) => (
                <li
                  key={offer.id}
                  className="flex items-center gap-3.5 rounded-2xl border border-[#F3F0E7]/10 bg-[#16191B] p-3"
                >
                  <PromoOfferBadge label={offer.badge} />
                  <div className="min-w-0">
                    <p className="font-display text-[17px] font-semibold leading-tight">{offer.title}</p>
                    <p className="mt-0.5 text-[14px] leading-snug text-[#F3F0E7]/70">{offer.summary}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-2.5 flex items-center gap-3 rounded-2xl bg-[#1F2224] p-3">
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${PROMO_GOLD} text-[#0B0C0D]`}>
                <Store className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="font-display text-[15.5px] font-semibold leading-tight">Montrez cet écran en boutique</p>
                <p className="mt-0.5 text-[13.5px] text-[#F3F0E7]/70">{shopAddress}</p>
              </div>
            </div>

            <div className="mt-3.5 grid grid-cols-2 gap-2.5">
              <a
                href={quoteHref}
                onClick={onClose}
                className={`inline-flex h-11 items-center justify-center rounded-full ${PROMO_GOLD} px-4 text-[15px] font-semibold text-[#1C1F21] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F3F0E7]`}
              >
                Demander un devis
              </a>
              <a
                href={phoneHref}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#F3F0E7]/35 px-4 text-[15px] font-semibold text-[#F3F0E7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79A62]"
              >
                <Phone className="h-4 w-4 text-[#E5C57B]" strokeWidth={2} aria-hidden="true" />
                Appeler
              </a>
            </div>

            <a
              href={promoHref}
              onClick={onClose}
              className="mx-auto mt-4 flex w-fit items-center gap-0.5 text-[15px] font-semibold text-[#E5C57B] underline decoration-[#E5C57B]/60 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79A62]"
            >
              Voir le détail des offres
              <ChevronRight className="h-4 w-4" strokeWidth={2.4} aria-hidden="true" />
            </a>

            <p className="mt-3 text-center text-[12px] leading-snug text-[#F3F0E7]/50">
              Offres valables du 24 au 30/11, non cumulables. Détail en boutique.
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

export { PROMO_BLACK };
