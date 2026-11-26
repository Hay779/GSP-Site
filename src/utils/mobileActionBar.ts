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
