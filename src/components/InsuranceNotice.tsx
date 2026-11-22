import { Camera, ShieldCheck } from 'lucide-react';
import type { InsuranceNoticeConfig } from '../data/sectionsContent';

/** Encart « Vous êtes assuré ? » réutilisé sur l'accueil et la page Après sinistre. */
export function InsuranceNotice({
  config,
  onSendPhotos,
  className = '',
}: {
  readonly config: InsuranceNoticeConfig;
  readonly onSendPhotos: () => void;
  readonly className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-[#B79A62]/30 bg-[#292D2F]/90 p-6 sm:p-7 grid grid-cols-1 md:grid-cols-[auto_1fr_auto] items-center gap-5 md:gap-7 ${className}`}
    >
      <span
        aria-hidden="true"
        className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-[#B79A62]/45 bg-[#1C1F21] text-[#B79A62]"
      >
        <ShieldCheck className="h-6 w-6" strokeWidth={1.6} />
      </span>
      <div>
        <p className="font-display text-[18px] sm:text-[20px] font-semibold leading-[1.3] text-[#F3F0E7]">
          {config.title}
        </p>
        <p className="mt-1.5 text-[15px] leading-[1.55] text-[#F3F0E7]/75">
          {config.subtitle}
        </p>
        <p className="mt-3 inline-flex items-center gap-2 text-[13px] text-[#F3F0E7]/60">
          <span className="font-display text-[15px] font-bold tracking-[-0.01em] text-[#F3F0E7]/90">
            {config.partnerName}
          </span>
          <span aria-hidden="true" className="h-3 w-px bg-[#F3F0E7]/25" />
          <span className="italic">{config.partnerNote}</span>
        </p>
      </div>
      <button
        type="button"
        onClick={onSendPhotos}
        className="group inline-flex min-h-[48px] w-full md:w-auto items-center justify-center gap-2.5 rounded-lg border border-[#F3F0E7]/65 hover:border-[#F3F0E7] hover:bg-[#F3F0E7]/10 px-6 py-3 text-[15px] font-medium text-[#F3F0E7] whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79A62] cursor-pointer"
      >
        <Camera className="h-4 w-4 shrink-0 text-[#B79A62]" strokeWidth={1.9} aria-hidden="true" />
        <span>{config.ctaLabel}</span>
      </button>
    </div>
  );
}
