import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import type { WhatsAppConfig } from '../data/sectionsContent';
import { buildWhatsAppUrl } from '../utils/whatsapp';

interface WhatsAppFloatingButtonProps {
  readonly config: WhatsAppConfig;
}

function WhatsAppIcon({ className }: { readonly className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M20.52 3.48A11.82 11.82 0 0 0 12.06 0C5.5 0 .16 5.33.16 11.9c0 2.1.55 4.15 1.6 5.96L0 24l6.33-1.66a11.86 11.86 0 0 0 5.73 1.46h.01c6.56 0 11.9-5.34 11.9-11.9 0-3.18-1.24-6.17-3.45-8.42Zm-8.46 18.3h-.01a9.87 9.87 0 0 1-5.04-1.38l-.36-.21-3.76.98 1-3.66-.24-.38a9.84 9.84 0 0 1-1.51-5.23c0-5.44 4.43-9.87 9.88-9.87 2.64 0 5.12 1.03 6.98 2.9a9.82 9.82 0 0 1 2.89 6.98c0 5.44-4.43 9.87-9.83 9.87Zm5.41-7.4c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.6.13-.13.3-.35.44-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.21 5.09 4.5.71.31 1.27.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35Z" />
    </svg>
  );
}

export function WhatsAppFloatingButton({ config }: WhatsAppFloatingButtonProps) {
  const prefersReducedMotion = Boolean(useReducedMotion());
  const href = buildWhatsAppUrl(config.phoneDisplay, config.prefilledMessage);
  // Sur mobile, le bouton n'apparaît qu'après un début de défilement
  // (pour ne pas masquer le texte du haut de page).
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const update = () => setRevealed(window.innerWidth >= 640 || window.scrollY > window.innerHeight * 0.5);
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div
      data-testid="whatsapp-floating-cta"
      className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 transition-all duration-300 ${
        revealed ? 'opacity-100 translate-y-0' : 'pointer-events-none opacity-0 translate-y-4'
      }`}
    >
      <div className="group relative inline-flex items-center">
        {/* Étiquette contextuelle au survol / focus (bureau) */}
        <span
          aria-hidden="true"
          className="pointer-events-none hidden sm:inline-flex items-center mr-3 rounded-lg border border-[#B79A62]/45 bg-[#292D2F]/95 px-3.5 py-2 text-[13px] font-medium text-[#F3F0E7] shadow-lg whitespace-nowrap opacity-0 translate-x-1.5 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 group-focus-within:opacity-100 group-focus-within:translate-x-0"
        >
          {config.label}
        </span>

        <div className="relative inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center">
          {/* Anneau d'impulsion concentrique */}
          {!prefersReducedMotion && (
            <motion.span
              aria-hidden="true"
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: [1, 1.42, 1.6], opacity: [0.6, 0.22, 0] }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: 'easeOut',
                repeatDelay: 0.45,
              }}
              className="pointer-events-none absolute inset-0 rounded-full bg-[#25D366]/60"
            />
          )}

          <motion.a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={config.ariaLabel}
            whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
            className="relative inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-[#1FA855] hover:bg-[#23BC5F] active:bg-[#1A9249] text-white shadow-[0_10px_28px_rgba(0,0,0,0.45)] ring-1 ring-white/20 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#B79A62]"
          >
            <WhatsAppIcon className="h-6 w-6 sm:h-[26px] sm:w-[26px] shrink-0" />
          </motion.a>
        </div>
      </div>
    </div>
  );
}
