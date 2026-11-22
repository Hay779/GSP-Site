import { Phone, X } from 'lucide-react';
import type { BrandConfig } from '../utils/navigation';
import { BrandMark } from './BrandMark';

/**
 * Barre du haut simplifiée pour la page « Demander un devis » :
 * pas de menu ni de bouton devis, pour que le client reste concentré sur le questionnaire.
 */
export function FocusHeader({ brand, homeHref }: { readonly brand: BrandConfig; readonly homeHref: string }) {
  return (
    <header
      id="01_Entete"
      data-section="01_Entete"
      className="sticky top-0 z-50 w-full border-b border-[#F3F0E7]/14 bg-[#1C1F21]/95 backdrop-blur-md"
    >
      <div className="mx-auto flex h-[74px] lg:h-[88px] max-w-[1280px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
        <a
          href={homeHref}
          aria-label={`${brand.name} — retour à l’accueil`}
          className="inline-flex items-center rounded-md py-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B79A62]"
        >
          <BrandMark brand={brand} compact />
        </a>

        <div className="flex items-center gap-2.5 sm:gap-4">
          <a
            href={brand.phoneHref}
            aria-label={`Appeler le ${brand.phoneDisplay}`}
            className="inline-flex h-11 items-center justify-center gap-2.5 rounded-lg px-3 sm:px-4 text-[15px] font-semibold tabular-nums text-[#F3F0E7] hover:text-[#B79A62] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79A62]"
          >
            <Phone className="h-[18px] w-[18px] text-[#B79A62]" strokeWidth={2} aria-hidden="true" />
            <span className="hidden sm:inline">{brand.phoneDisplay}</span>
          </a>
          <a
            href={homeHref}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#F3F0E7]/25 px-3.5 sm:px-4 text-[14.5px] font-medium text-[#F3F0E7]/85 hover:border-[#B79A62] hover:text-[#F3F0E7] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79A62]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            <span>Quitter<span className="hidden sm:inline"> le devis</span></span>
          </a>
        </div>
      </div>
    </header>
  );
}
