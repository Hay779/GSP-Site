export interface HeroParallaxConfig {
  /** Maximum downward parallax travel of the background video/poster layer (% of hero height). */
  readonly maxShiftPercent: number;
  /** Symmetric vertical bleed above and below the hero bounds (% of hero height) to prevent edge seams. */
  readonly verticalBleedPercent: number;
  /** Initial subtle scale at rest. */
  readonly scaleStart: number;
  /** Subtle scale-in at full scroll progress for gentle cinematic depth. */
  readonly scaleEnd: number;
  /** Subtle extra dark scrim opacity added as the hero scrolls out of view. */
  readonly maxScrimExtraOpacity: number;
  /** Subtle counter-movement on the foreground text block (px) to reinforce depth separation. */
  readonly contentOffsetPx: number;
  /** Spring physics smoothing wheel/trackpad scroll input. */
  readonly spring: {
    readonly stiffness: number;
    readonly damping: number;
    readonly mass: number;
  };
}

export interface HeroParallaxFrame {
  readonly translateYPercent: number;
  readonly scale: number;
  readonly scrimExtraOpacity: number;
  readonly contentOffsetPx: number;
}

export const HERO_PARALLAX_CONFIG: HeroParallaxConfig = {
  maxShiftPercent: 16,
  verticalBleedPercent: 18,
  scaleStart: 1,
  scaleEnd: 1.055,
  maxScrimExtraOpacity: 0.24,
  contentOffsetPx: -20,
  spring: {
    stiffness: 150,
    damping: 30,
    mass: 0.25,
  },
};

/**
 * Clamps scroll progress safely into [0, 1].
 */
export function clampScrollProgress(progress: number): number {
  if (!Number.isFinite(progress)) {
    return 0;
  }
  if (progress <= 0) {
    return 0;
  }
  if (progress >= 1) {
    return 1;
  }
  return progress;
}

/**
 * Guarantees that vertical bleed strictly covers the maximum parallax travel plus a safety margin
 * so the background video or poster can never detach from the top or bottom edge of 02_Hero.
 */
export function computeParallaxBleedPercent(
  maxShiftPercent: number,
  safetyMarginPercent = 2
): number {
  const safeShift = Number.isFinite(maxShiftPercent) ? Math.max(0, maxShiftPercent) : 0;
  const safeMargin = Number.isFinite(safetyMarginPercent) ? Math.max(0, safetyMarginPercent) : 0;
  return Math.ceil(safeShift + safeMargin);
}

/**
 * Evaluates the exact background video/poster and foreground depth values at a given scroll progress.
 * Returns a neutral, motionless frame when `prefers-reduced-motion` is enabled.
 */
export function computeHeroParallaxState(
  progress: number,
  reducedMotion: boolean,
  config: HeroParallaxConfig = HERO_PARALLAX_CONFIG
): HeroParallaxFrame {
  if (reducedMotion) {
    return {
      translateYPercent: 0,
      scale: 1,
      scrimExtraOpacity: 0,
      contentOffsetPx: 0,
    };
  }

  const t = clampScrollProgress(progress);

  return {
    translateYPercent: Number((t * config.maxShiftPercent).toFixed(3)),
    scale: Number((config.scaleStart + t * (config.scaleEnd - config.scaleStart)).toFixed(4)),
    scrimExtraOpacity: Number((t * config.maxScrimExtraOpacity).toFixed(4)),
    contentOffsetPx: Number((t * config.contentOffsetPx).toFixed(2)),
  };
}
