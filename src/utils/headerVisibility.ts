export interface HeaderScrollConfig {
  /** Scroll depth (px) below which the header always remains visible. */
  readonly revealTopThresholdPx: number;
  /** Minimum downward delta (px) required to hide the header. */
  readonly hideDeltaPx: number;
  /** Minimum upward delta (px) required to bring the header back. */
  readonly showDeltaPx: number;
}

export interface HeaderVisibilityInput {
  readonly currentY: number;
  readonly previousY: number;
  readonly wasHidden: boolean;
  readonly isMenuOpen: boolean;
  readonly hasFocusWithin: boolean;
}

export const HEADER_SCROLL_CONFIG: HeaderScrollConfig = {
  revealTopThresholdPx: 100,
  hideDeltaPx: 12,
  showDeltaPx: 8,
};

/**
 * Resolves whether the sticky header should tuck away while reading down
 * and smoothly reappear as soon as the user scrolls upward, opens the mobile menu,
 * or focuses an element inside the header.
 */
export function resolveHeaderHidden(
  input: HeaderVisibilityInput,
  config: HeaderScrollConfig = HEADER_SCROLL_CONFIG
): boolean {
  const safeCurrentY = Number.isFinite(input.currentY) ? Math.max(0, input.currentY) : 0;
  const safePreviousY = Number.isFinite(input.previousY) ? Math.max(0, input.previousY) : 0;

  if (input.isMenuOpen || input.hasFocusWithin || safeCurrentY <= config.revealTopThresholdPx) {
    return false;
  }

  const delta = safeCurrentY - safePreviousY;

  if (delta >= config.hideDeltaPx) {
    return true;
  }

  if (delta <= -config.showDeltaPx) {
    return false;
  }

  return input.wasHidden;
}
