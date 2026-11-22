import { useEffect } from 'react';
import { X } from 'lucide-react';
import type { BrandConfig } from '../utils/navigation';

export type LegalDocumentType = 'mentions' | 'confidentialite';

interface LegalNoticeModalProps {
  readonly documentType: LegalDocumentType | null;
  readonly brand: BrandConfig;
  readonly onClose: () => void;
}

export function LegalNoticeModal({
  documentType,
  brand,
  onClose,
}: LegalNoticeModalProps) {
  useEffect(() => {
    if (!documentType) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [documentType, onClose]);

  if (!documentType) {
    return null;
  }

  const isMentions = documentType === 'mentions';

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
        aria-labelledby="legal-modal-title"
        data-testid="legal-notice-modal"
        className="relative z-10 w-full max-w-[580px] max-h-[88vh] overflow-y-auto rounded-xl border border-[#F3F0E7]/15 bg-[#292D2F] shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#F3F0E7]/12 px-6 py-4 sm:px-7">
          <div>
            <p className="text-[12px] font-medium tracking-[0.14em] text-[#B79A62]">
              Informations réglementaires
            </p>
            <h2
              id="legal-modal-title"
              className="mt-0.5 font-display text-[22px] font-semibold tracking-[-0.01em] text-[#F3F0E7]"
            >
              {isMentions ? 'Mentions légales' : 'Politique de confidentialité'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer les informations légales"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#F3F0E7]/15 bg-[#1C1F21]/50 text-[#F3F0E7]/80 hover:border-[#B79A62] hover:text-[#F3F0E7] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79A62] cursor-pointer"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="px-6 py-5 sm:px-7 text-[14px] sm:text-[15px] leading-[1.6] text-[#F3F0E7]/82 flex flex-col gap-4">
          {isMentions ? (
            <>
              <div>
                <h3 className="font-display text-[15px] font-semibold text-[#F3F0E7]">
                  Éditeur du site
                </h3>
                <p className="mt-1">
                  {brand.name} — 48 rue de la République, 13002 Marseille.
                  <br />
                  Téléphone : {brand.phoneDisplay}.
                </p>
                <p className="mt-1 italic text-[#F3F0E7]/62">
                  Forme juridique, SIRET, RCS, capital social et responsable de publication à compléter avant mise en ligne.
                </p>
              </div>

              <div>
                <h3 className="font-display text-[15px] font-semibold text-[#F3F0E7]">
                  Hébergement
                </h3>
                <p className="mt-1 italic text-[#F3F0E7]/62">
                  Nom, raison sociale, adresse et contact de l’hébergeur à compléter avant mise en ligne.
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <h3 className="font-display text-[15px] font-semibold text-[#F3F0E7]">
                  Données collectées via les formulaires
                </h3>
                <p className="mt-1">
                  Les informations transmises lors d’une demande de devis ou d’un envoi de photos après sinistre sont destinées uniquement au traitement de votre demande par {brand.name}.
                </p>
              </div>

              <div>
                <h3 className="font-display text-[15px] font-semibold text-[#F3F0E7]">
                  Conservation et droits (RGPD)
                </h3>
                <p className="mt-1 italic text-[#F3F0E7]/62">
                  Durée de conservation, adresse e-mail dédiée à l’exercice des droits (accès, rectification, suppression) et politique cookies à compléter avant publication.
                </p>
              </div>
            </>
          )}

          <div className="mt-1 flex justify-end border-t border-[#F3F0E7]/10 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-[42px] items-center justify-center rounded-lg bg-[#B79A62] hover:bg-[#C6AA73] px-5 py-2 text-[14px] font-semibold text-[#1C1F21] transition-colors duration-150 cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
