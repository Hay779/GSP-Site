import { useId } from 'react';

export interface HeroGoldWaveProps {
  /** Hauteur légèrement plus retenue pour les en-têtes compacts (contact, devis, pages légales). */
  readonly compact?: boolean;
  /** Couleur de fond de la section immédiatement sous le Hero (ivoire chaud par défaut). */
  readonly fillColor?: string;
}

/**
 * Coupe organique en S soulignée d'un filet laiton métallique en bas des Heros,
 * assurant une transition fluide et uniforme vers la section suivante.
 */
export function HeroGoldWave({ compact = false, fillColor = '#F7F5F0' }: HeroGoldWaveProps) {
  const gradientId = `hero-gold-wave-${useId().replace(/:/g, '')}`;
  const heightClass = compact ? 'h-[32px] sm:h-[52px] lg:h-[72px]' : 'h-[36px] sm:h-[64px] lg:h-[94px]';

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -bottom-px z-20 w-full overflow-hidden leading-none">
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className={`block w-full ${heightClass}`} fill="none">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="60" x2="1440" y2="20" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C9A252" />
            <stop offset="22%" stopColor="#E6CB88" />
            <stop offset="52%" stopColor="#BA9040" />
            <stop offset="80%" stopColor="#E7CC8A" />
            <stop offset="100%" stopColor="#C79E4C" />
          </linearGradient>
        </defs>

        {/* Remplissage bas épousant le fond de la section suivante */}
        <path d="M 0 64 C 155 40, 340 52, 520 74 C 820 111, 1180 98, 1440 8 L 1440 122 L 0 122 Z" fill={fillColor} />

        {/* Filet doré métallique longeant exactement la découpe */}
        <path
          d="M 0 64 C 155 40, 340 52, 520 74 C 820 111, 1180 98, 1440 8"
          stroke={`url(#${gradientId})`}
          strokeWidth="3.8"
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
