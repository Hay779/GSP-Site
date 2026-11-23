import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FileText, KeyRound, MessageCircle, Phone, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { WhatsAppConfig } from '../data/sectionsContent';
import type { BrandConfig } from '../utils/navigation';
import { resolveActionBarVisible } from '../utils/mobileActionBar';
import { REVEAL_EASE } from '../utils/scrollReveal';
import { buildWhatsAppUrl } from '../utils/whatsapp';

interface MobileActionBarProps {
  readonly brand: BrandConfig;
  readonly whatsapp: WhatsAppConfig;
  readonly quoteHref: string;
  readonly contactHref: string;
  /** Change à chaque changement de page (pour retrouver l'emplacement du haut de page). */
  readonly routeKey: string;
}

function WhatsAppIcon({ className }: { readonly className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M20.52 3.48A11.82 11.82 0 0 0 12.06 0C5.5 0 .16 5.33.16 11.9c0 2.1.55 4.15 1.6 5.96L0 24l6.33-1.66a11.86 11.86 0 0 0 5.73 1.46h.01c6.56 0 11.9-5.34 11.9-11.9 0-3.18-1.24-6.17-3.45-8.42Zm-8.46 18.3h-.01a9.87 9.87 0 0 1-5.04-1.38l-.36-.21-3.76.98 1-3.66-.24-.38a9.84 9.84 0 0 1-1.51-5.23c0-5.44 4.43-9.87 9.88-9.87 2.64 0 5.12 1.03 6.98 2.9a9.82 9.82 0 0 1 2.89 6.98c0 5.44-4.43 9.87-9.83 9.87Zm5.41-7.4c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.6.13-.13.3-.35.44-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.21 5.09 4.5.71.31 1.27.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35Z" />
    </svg>
  );
}

const ITEM =
  'flex flex-1 flex-col items-center gap-0.5 py-1 text-[12px] font-semibold text-white [text-shadow:0_1px_1px_rgba(0,0,0,0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79A62] rounded-lg';

/**
 * Barre d'actions mobile (Devis · SOS · Contact), façon application.
 * Sur l'accueil, elle remplace les boutons du haut de page puis se fixe en bas
 * de l'écran quand on descend. Ailleurs, elle apparaît après le haut de page.
 * Masquée sur le pied de page (qui a déjà ses boutons).
 */
export function MobileActionBar({ brand, whatsapp, quoteHref, contactHref, routeKey }: MobileActionBarProps) {
  const prefersReducedMotion = Boolean(useReducedMotion());
  const [visible, setVisible] = useState(false);
  const [sosOpen, setSosOpen] = useState(false);
  /** Emplacement dans le haut de page (accueil) : la barre y est affichée tant qu'il est visible. */
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  const [slotInView, setSlotInView] = useState(false);
  const sosButtonRef = useRef<HTMLButtonElement | null>(null);

  // Recherche l'emplacement du haut de page à chaque changement de page.
  useEffect(() => {
    const id = window.requestAnimationFrame(() => setSlot(document.getElementById('hero-action-slot')));
    return () => window.cancelAnimationFrame(id);
  }, [routeKey]);

  useEffect(() => {
    if (!slot) {
      setSlotInView(false);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setSlotInView(entry.isIntersecting), {
      rootMargin: '0px 0px -24px 0px',
    });
    observer.observe(slot);
    return () => observer.disconnect();
  }, [slot]);

  // Barre fixe : visible dès qu'on a quitté le haut de page, sauf sur le pied de page.
  useEffect(() => {
    const update = () => {
      const footer = document.getElementById('11_Pied_De_Page');
      const nearFooter = footer ? footer.getBoundingClientRect().top < window.innerHeight - 40 : false;
      setVisible(
        resolveActionBarVisible({
          scrollY: window.scrollY,
          revealAfterY: window.innerHeight * 0.35,
          nearFooter,
        })
      );
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [routeKey]);

  useEffect(() => {
    if (!sosOpen) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSosOpen(false);
        sosButtonRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sosOpen]);

  const inlineActive = Boolean(slot) && slotInView;
  const shown = (slot ? !slotInView && visible : visible) || (sosOpen && !inlineActive);
  const whatsappUrl = buildWhatsAppUrl(whatsapp.phoneDisplay, whatsapp.prefilledMessage);

  const renderButtons = (focusable: boolean, inline: boolean) => (
        <div className="flex items-center justify-between">
          <a href={quoteHref} tabIndex={focusable ? 0 : -1} className={ITEM}>
            <FileText className="h-[21px] w-[21px] text-[#EBCB82]" strokeWidth={1.9} aria-hidden="true" />
            Devis
          </a>
          <button
            ref={inline === inlineActive ? sosButtonRef : undefined}
            type="button"
            tabIndex={focusable ? 0 : -1}
            onClick={() => setSosOpen((o) => !o)}
            aria-expanded={sosOpen}
            aria-label="SOS urgence : appeler ou envoyer une photo"
            className={`${ITEM} cursor-pointer`}
          >
            <span className="-mt-7 grid h-[54px] w-[54px] place-items-center rounded-full border-[3px] border-[#F3F0E7]/90 bg-[#C0392B] text-white shadow-[0_8px_20px_rgba(192,57,43,0.5)]">
              <KeyRound className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
            </span>
            SOS
          </button>
          <a href={contactHref} tabIndex={focusable ? 0 : -1} className={ITEM}>
            <MessageCircle className="h-[21px] w-[21px] text-[#EBCB82]" strokeWidth={1.9} aria-hidden="true" />
            Contact
          </a>
        </div>
  );

  const PILL =
    'rounded-full border border-[#F3F0E7]/20 bg-[#16191B]/80 px-3.5 py-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl backdrop-saturate-150';

  return (
    <div className="sm:hidden">
      {slot &&
        createPortal(
          <nav aria-label="Actions rapides (haut de page)" className={`mx-auto w-[min(320px,100%)] ${PILL} !bg-[#2C3134]/85 !border-white/25`}>
            {renderButtons(true, true)}
          </nav>,
          slot
        )}
      <AnimatePresence>
        {sosOpen && (
          <>
            <motion.div
              key="dim"
              aria-hidden="true"
              onClick={() => setSosOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[58] bg-black/45"
            />
            <motion.div
              key="sheet"
              role="dialog"
              aria-modal="true"
              aria-labelledby="sos-title"
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.22, ease: REVEAL_EASE }}
              className="fixed inset-x-3 bottom-[92px] z-[59] rounded-2xl border border-[#F3F0E7]/18 bg-[#16191B]/85 p-4 text-[#F3F0E7] backdrop-blur-xl"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p id="sos-title" className="font-display text-[17px] font-semibold">Urgence serrurerie</p>
                  <p className="mt-0.5 text-[13px] text-[#F3F0E7]/70">Porte claquée, effraction, bris de glace</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSosOpen(false)}
                  aria-label="Fermer"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#F3F0E7]/20 text-[#F3F0E7]/80"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <a
                href={brand.phoneHref}
                className="mt-3 flex h-[52px] items-center gap-3 rounded-xl bg-[#C0392B] px-4 text-[16px] font-semibold text-white"
              >
                <Phone className="h-5 w-5" aria-hidden="true" />
                <span className="tabular-nums">Appeler le {brand.phoneDisplay}</span>
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2.5 flex h-[52px] items-center gap-3 rounded-xl bg-[#1FA855] px-4 text-[16px] font-semibold text-white"
              >
                <WhatsAppIcon className="h-5 w-5" />
                Envoyer une photo sur WhatsApp
              </a>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav
        aria-label="Actions rapides"
        aria-hidden={!shown}
        className={`fixed bottom-3.5 left-1/2 z-[60] w-[min(320px,calc(100%-40px))] -translate-x-1/2 ${PILL} transition-all duration-300 ${
          shown ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-[140%] opacity-0'
        }`}
      >
        {renderButtons(shown, false)}
      </nav>
    </div>
  );
}
