/**
 * Visibilité de la barre d'actions mobile (Devis · SOS · Contact) :
 * cachée en haut de page, cachée quand on descend (lecture), visible quand on
 * remonte, cachée près du pied de page (qui a déjà ses boutons).
 */
export interface ActionBarScrollInput {
  readonly currentY: number;
  readonly previousY: number;
  /** Hauteur à partir de laquelle la barre peut apparaître (fin du haut de page). */
  readonly revealAfterY: number;
  /** Vrai quand le pied de page est visible à l'écran. */
  readonly nearFooter: boolean;
  readonly wasVisible: boolean;
  /** Mouvement minimal (px) pour changer d'état, évite le clignotement. */
  readonly threshold?: number;
}

export function resolveActionBarVisible(input: ActionBarScrollInput): boolean {
  const { currentY, previousY, revealAfterY, nearFooter, wasVisible, threshold = 8 } = input;
  if (currentY < revealAfterY || nearFooter) {
    return false;
  }
  const delta = currentY - previousY;
  if (delta <= -threshold) {
    return true; // on remonte
  }
  if (delta >= threshold) {
    return false; // on descend
  }
  return wasVisible;
}
