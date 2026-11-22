export const REVEAL_EASE: readonly [number, number, number, number] = [0.22, 1, 0.36, 1];

export const REVEAL_VIEWPORT = {
  once: true,
  amount: 0.15,
} as const;

export interface CardRevealMotion {
  readonly initial: {
    readonly opacity: number;
    readonly y: number;
  };
  readonly visible: {
    readonly opacity: number;
    readonly y: number;
    readonly transition: {
      readonly duration: number;
      readonly delay: number;
      readonly ease: readonly [number, number, number, number];
    };
  };
}

export interface CardRevealOptions {
  readonly index: number;
  readonly staggerSeconds?: number;
  readonly offsetY?: number;
  readonly duration?: number;
  readonly reducedMotion?: boolean;
}

/**
 * Builds deterministic scroll-reveal animation props for card grids.
 * Honors reduced-motion preferences by removing vertical travel and stagger delay.
 */
export function buildCardRevealMotion({
  index,
  staggerSeconds = 0.09,
  offsetY = 24,
  duration = 0.55,
  reducedMotion = false,
}: CardRevealOptions): CardRevealMotion {
  const safeIndex = Math.max(0, Math.floor(index));

  if (reducedMotion) {
    return {
      initial: { opacity: 1, y: 0 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0,
          delay: 0,
          ease: REVEAL_EASE,
        },
      },
    };
  }

  return {
    initial: { opacity: 0, y: offsetY },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration,
        delay: Number((safeIndex * staggerSeconds).toFixed(3)),
        ease: REVEAL_EASE,
      },
    },
  };
}
