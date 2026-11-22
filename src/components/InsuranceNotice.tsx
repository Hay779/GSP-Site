import { Camera, Check, ShieldCheck } from 'lucide-react';
import type { InsuranceNoticeConfig } from '../data/sectionsContent';

/** Encart « Vous êtes assuré ? » : documents fournis pour l'assureur + envoi de photos. */
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
    <div className={`rounded-3xl bg-[#F7F5F0] p-6 sm:p-8 lg:p-10 grid gap-6 lg:grid-cols-12 lg:items-center lg:gap-10 ${className}`}>
      <div className="lg:col-span-7 flex items-start gap-4">
        <span aria-hidden="true" className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#F1E8D6] text-[#9C7C40]">
          <ShieldCheck className="h-6 w-6" strokeWidth={1.6} />
        </span>
        <div>
          <p className="font-display text-[20px] sm:text-[24px] font-semibold leading-[1.25] text-[#1C1F21]">{config.title}</p>
          <p className="mt-2 text-[15px] sm:text-[16px] leading-[1.55] text-[#1C1F21]/70">{config.subtitle}</p>
        </div>
      </div>
      <div className="lg:col-span-5">
        <ul className="grid gap-2.5">
          {config.documents.map((item) => (
            <li key={item} className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-[15px] font-medium text-[#1C1F21] shadow-[0_6px_18px_-14px_rgba(28,31,33,0.4)]">
              <Check className="h-4 w-4 shrink-0 text-[#9C7C40]" strokeWidth={2.4} aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onSendPhotos}
          className="mt-4 inline-flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-[#1C1F21] px-5 text-[15px] font-semibold text-[#F3F0E7] hover:bg-[#292D2F] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79A62] cursor-pointer"
        >
          <Camera className="h-4 w-4 text-[#B79A62]" strokeWidth={1.9} aria-hidden="true" />
          {config.ctaLabel}
        </button>
      </div>
    </div>
  );
}
