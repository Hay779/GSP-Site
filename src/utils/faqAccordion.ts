/**
 * Formats a zero-based FAQ index as a two-digit editorial numeral ("01", "02", ...).
 */
export function formatFaqNumber(index: number): string {
  const safeNumber = Math.max(1, Math.floor(index) + 1);
  return String(safeNumber).padStart(2, '0');
}

/**
 * Pure single-open accordion state transition.
 * Clicking the currently open item collapses it; clicking another valid item opens it.
 */
export function toggleFaqItemId(
  currentOpenId: string | null,
  clickedId: string,
  validIds: readonly string[]
): string | null {
  if (!validIds.includes(clickedId)) {
    return currentOpenId;
  }
  return currentOpenId === clickedId ? null : clickedId;
}

/**
 * Resolves the next focused trigger index for ARIA accordion keyboard navigation.
 * Returns null when the pressed key is not a navigation key.
 */
export function resolveNextFaqFocusIndex(
  currentIndex: number,
  key: string,
  totalItems: number
): number | null {
  if (totalItems <= 0 || currentIndex < 0 || currentIndex >= totalItems) {
    return null;
  }

  switch (key) {
    case 'ArrowDown':
      return (currentIndex + 1) % totalItems;
    case 'ArrowUp':
      return (currentIndex - 1 + totalItems) % totalItems;
    case 'Home':
      return 0;
    case 'End':
      return totalItems - 1;
    default:
      return null;
  }
}
