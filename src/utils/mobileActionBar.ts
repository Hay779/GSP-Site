/**
 * Visibilité de la barre d'actions mobile fixée en bas de l'écran (Devis · SOS · Contact) :
 * visible dès qu'on a dépassé le haut de page, masquée sur le pied de page.
 */
export interface ActionBarScrollInput {
  readonly scrollY: number;
  /** Hauteur à partir de laquelle la barre apparaît. */
  readonly revealAfterY: number;
  /** Vrai quand le pied de page est visible à l'écran. */
  readonly nearFooter: boolean;
}

export function resolveActionBarVisible({ scrollY, revealAfterY, nearFooter }: ActionBarScrollInput): boolean {
  return scrollY >= revealAfterY && !nearFooter;
}

/**
 * Masquage au défilement : la barre se cache dès qu'on descend et revient dès qu'on remonte,
 * comme l'en-tête. `anchorY` est le point le plus haut (en descendant) ou le plus bas
 * (en remontant) depuis le dernier changement d'état.
 */
export interface ScrollHiddenInput {
  readonly currentY: number;
  readonly anchorY: number;
  readonly wasHidden: boolean;
}

export interface ScrollHiddenState {
  readonly hidden: boolean;
  readonly anchorY: number;
}

export const ACTION_BAR_HIDE_DELTA_PX = 12;
export const ACTION_BAR_SHOW_DELTA_PX = 8;

export function resolveScrollHidden({ currentY, anchorY, wasHidden }: ScrollHiddenInput): ScrollHiddenState {
  const y = Number.isFinite(currentY) ? Math.max(0, currentY) : 0;
  const delta = y - anchorY;
  if (!wasHidden) {
    if (delta >= ACTION_BAR_HIDE_DELTA_PX) return { hidden: true, anchorY: y };
    return { hidden: false, anchorY: Math.min(anchorY, y) };
  }
  if (delta <= -ACTION_BAR_SHOW_DELTA_PX) return { hidden: false, anchorY: y };
  return { hidden: true, anchorY: Math.max(anchorY, y) };
}
