import { useEffect, useRef } from 'react';
import { Check, Phone, X } from 'lucide-react';
import type { DomainCardItem } from '../data/sectionsContent';
import type { BrandConfig } from '../utils/navigation';
import type { QuoteDomain } from '../utils/quoteForm';

interface DomainDetailModalProps {
  readonly domain: DomainCardItem | null;
  readonly brand: BrandConfig;
  readonly onClose: () => void;
  readonly onRequestQuote: (domain: QuoteDomain) => void;
}

export function DomainDetailModal({
  domain,
  brand,
  onClose,
  onRequestQuote,
}: DomainDetailModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!domain) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const timer = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 30);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [domain, onClose]);

  if (!domain) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6"
      role="presentation"
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-xs"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="domain-modal-title"
        data-testid="domain-detail-modal"
        className="relative z-10 flex w-full max-w-[600px] max-h-[90vh] flex-col overflow-hidden rounded-xl border border-[#F3F0E7]/15 bg-[#292D2F] shadow-2xl"
      >
        <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="relative aspect-[16/9] sm:aspect-[16/8] w-full overflow-hidden bg-[#1C1F21]">
          <img
            src={domain.imageSrc}
            alt={domain.imageAlt}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#292D2F] via-[#292D2F]/25 to-transparent" />

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label={`Fermer les détails de ${domain.title}`}
            className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[#F3F0E7]/25 bg-[#1C1F21]/80 text-[#F3F0E7] backdrop-blur-sm hover:border-[#B79A62] hover:text-[#B79A62] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79A62] cursor-pointer"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="px-6 pb-6 pt-2 sm:px-7">
          <p className="text-[12px] font-medium uppercase tracking-[0.18em] text-[#B79A62]">
            {domain.categoryTag}
          </p>
          <h2
            id="domain-modal-title"
            className="mt-1.5 font-display text-[24px] sm:text-[26px] font-semibold tracking-[-0.01em] text-[#F3F0E7]"
          >
            {domain.title}
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-[#F3F0E7]/78">
            {domain.summary}
          </p>

          <ul
            aria-label={`Prestations en ${domain.title}`}
            className="mt-5 flex flex-col gap-3 border-t border-[#F3F0E7]/10 pt-5"
          >
            {domain.prestations.map((line) => (
              <li
                key={line}
                className="flex items-start gap-3 text-[14px] sm:text-[15px] leading-[1.55] text-[#F3F0E7]/88"
              >
                <Check
                  className="mt-1 h-4 w-4 shrink-0 text-[#B79A62]"
                  strokeWidth={2.2}
                  aria-hidden="true"
                />
                <span>{line}</span>
              </li>
            ))}
          </ul>

        </div>
        </div>

        {/* Barre d'actions toujours visible (même quand le contenu défile sur mobile) */}
        <div className="shrink-0 border-t border-[#F3F0E7]/10 bg-[#292D2F] px-6 py-4 sm:px-7 sm:py-5">
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
            <a
              href={brand.phoneHref}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg border border-[#F3F0E7]/40 px-5 py-2.5 text-[14px] font-medium text-[#F3F0E7] hover:border-[#B79A62] hover:text-[#B79A62] tabular-nums whitespace-nowrap transition-colors duration-150"
            >
              <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Appeler le {brand.phoneDisplay}</span>
            </a>

            <button
              type="button"
              onClick={() => onRequestQuote(domain.quoteDomain)}
              className="inline-flex min-h-[48px] items-center justify-center rounded-lg bg-[#B79A62] hover:bg-[#C6AA73] active:bg-[#A68952] px-6 py-2.5 text-[14px] sm:text-[15px] font-semibold text-[#1C1F21] whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F3F0E7] cursor-pointer"
            >
              Demander un devis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
