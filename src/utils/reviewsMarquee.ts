export interface MarqueeSequenceItem<T> {
  readonly item: T;
  readonly key: string;
  readonly slotIndex: number;
  readonly isDuplicate: boolean;
}

export interface MarqueePlayStateInput {
  readonly isPausedByUser: boolean;
  readonly isHovered: boolean;
  readonly isFocused: boolean;
  readonly reducedMotion: boolean;
}

export type MarqueePlayState = 'running' | 'paused';

/**
 * Formats a zero-based review slot index as a two-digit editorial index ("01", "02", ...).
 */
export function formatReviewSlotNumber(index: number): string {
  const safeNumber = Math.max(1, Math.floor(index) + 1);
  return String(safeNumber).padStart(2, '0');
}

/**
 * Computes a consistent marquee cycle duration (in seconds) proportional to the
 * number of cards so the visual scroll velocity stays steady if reviews are added or removed.
 */
export function computeMarqueeDurationSeconds(
  itemCount: number,
  secondsPerCard = 6.5
): number {
  const safeCount = Math.max(1, Math.floor(itemCount));
  const safeSecondsPerCard = Math.max(2, secondsPerCard);
  const raw = safeCount * safeSecondsPerCard;
  return Math.min(72, Math.max(18, Number(raw.toFixed(1))));
}

/**
 * Resolves the CSS animation-play-state for the scrolling review track.
 * Any user pause, pointer hover, keyboard focus inside the track, or reduced-motion
 * preference pauses the marquee without resetting scroll position.
 */
export function resolveMarqueePlayState({
  isPausedByUser,
  isHovered,
  isFocused,
  reducedMotion,
}: MarqueePlayStateInput): MarqueePlayState {
  if (reducedMotion || isPausedByUser || isHovered || isFocused) {
    return 'paused';
  }
  return 'running';
}

/**
 * Builds the duplicated card sequence required for a seamless 50% CSS translate3d loop.
 * When reduced motion is requested, returns only the primary accessible items with no duplicates.
 */
export function buildMarqueeSequence<T extends { readonly id: string }>(
  items: readonly T[],
  reducedMotion = false
): readonly MarqueeSequenceItem<T>[] {
  const primary: MarqueeSequenceItem<T>[] = items.map((item, slotIndex) => ({
    item,
    key: `primary-${item.id}`,
    slotIndex,
    isDuplicate: false,
  }));

  if (reducedMotion || items.length === 0) {
    return primary;
  }

  const duplicate: MarqueeSequenceItem<T>[] = items.map((item, slotIndex) => ({
    item,
    key: `duplicate-${item.id}`,
    slotIndex,
    isDuplicate: true,
  }));

  return [...primary, ...duplicate];
}
