import { useState } from 'react';
import logoDarkUrl from '../assets/images/logo_republique_dark.png';
import type { BrandConfig } from '../utils/navigation';

interface BrandMarkProps {
  readonly brand: BrandConfig;
  readonly compact?: boolean;
}

export function BrandMark({ brand, compact = false }: BrandMarkProps) {
  const [imageFailed, setImageFailed] = useState(false);

  if (imageFailed) {
    return (
      <span className="inline-flex flex-col items-center select-none whitespace-nowrap shrink-0">
        <span
          className={`font-display font-semibold tracking-normal sm:tracking-[-0.005em] text-[#F3F0E7] leading-tight ${
            compact
              ? 'text-[16px] sm:text-[21px] lg:text-[23px]'
              : 'text-[20px] sm:text-[23px] lg:text-[25px]'
          }`}
        >
          {brand.name}
        </span>
        <span className="mt-1 flex w-full items-center gap-2.5" aria-hidden="true">
          <span className="h-px flex-1 bg-[#B79A62]/70" />
          <span className="text-[9px] sm:text-[10px] font-medium tracking-[0.28em] text-[#B79A62] leading-none">
            {brand.city}
          </span>
          <span className="h-px flex-1 bg-[#B79A62]/70" />
        </span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center select-none shrink-0">
      <img
        src={logoDarkUrl}
        alt={`${brand.name} — ${brand.city}`}
        width={580}
        height={371}
        referrerPolicy="no-referrer"
        onError={() => setImageFailed(true)}
        className={`w-auto object-contain ${
          compact
            ? 'h-[54px] sm:h-[60px] lg:h-[68px]'
            : 'h-[86px] sm:h-[98px] lg:h-[108px]'
        }`}
      />
    </span>
  );
}
