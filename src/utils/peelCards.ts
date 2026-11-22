export const PEEL_EASE: readonly [number, number, number, number] = [0.22, 1, 0.36, 1];
export const DEFAULT_PEEL_DURATION = 0.62;
export const DEFAULT_PEEL_IMAGE_SCALE = 1.05;

export function formatCardIndex(index: number): string {
  return String(Math.max(0, Math.floor(index)) + 1).padStart(2, '0');
}

export function resolvePeelDuration(
  durationSeconds: number,
  reducedMotion: boolean
): number {
  if (reducedMotion) {
    return 0;
  }
  return Math.max(0.15, Math.min(1.4, durationSeconds));
}

export function resolveNextOpenIndex(
  currentOpenIndex: number,
  tappedIndex: number,
  totalCards: number
): number {
  if (tappedIndex < 0 || tappedIndex >= totalCards) {
    return -1;
  }
  return currentOpenIndex === tappedIndex ? -1 : tappedIndex;
}
