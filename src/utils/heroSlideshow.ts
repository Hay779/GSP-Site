/**
 * Logique du diaporama « cinéma » de l'accueil : enchaînement des images,
 * mouvements de caméra lents (effet Ken Burns) et fenêtre de préchargement.
 */

export interface HeroSlideshowTiming {
  /** Durée d'affichage d'une image avant le passage à la suivante (ms). */
  readonly slideDurationMs: number;
  /** Durée du fondu enchaîné entre deux images (ms). */
  readonly fadeDurationMs: number;
}

export const HERO_SLIDESHOW_TIMING: HeroSlideshowTiming = {
  slideDurationMs: 6500,
  fadeDurationMs: 1600,
};

/** Position de caméra : zoom et décalage (en % de la taille de l'image). */
export interface KenBurnsFrame {
  readonly scale: number;
  readonly xPercent: number;
  readonly yPercent: number;
}

/** Mouvement de caméra appliqué à une image pendant qu'elle est affichée. */
export interface KenBurnsMove {
  readonly from: KenBurnsFrame;
  readonly to: KenBurnsFrame;
}

const KEN_BURNS_MOVES: readonly KenBurnsMove[] = [
  { from: { scale: 1.04, xPercent: 0, yPercent: 0 }, to: { scale: 1.14, xPercent: -2, yPercent: -1 } },
  { from: { scale: 1.14, xPercent: 2, yPercent: 0 }, to: { scale: 1.04, xPercent: 0, yPercent: 0 } },
  { from: { scale: 1.04, xPercent: 0, yPercent: 0 }, to: { scale: 1.14, xPercent: 2, yPercent: -1.5 } },
  { from: { scale: 1.14, xPercent: -2, yPercent: 1 }, to: { scale: 1.04, xPercent: 0, yPercent: 0 } },
];

/**
 * Vrai si le décalage reste dans la marge créée par le zoom, c'est-à-dire
 * qu'aucun bord de l'image n'apparaît.
 */
export function frameHidesEdges(frame: KenBurnsFrame): boolean {
  const margin = (frame.scale - 1) * 50;
  return (
    frame.scale >= 1 &&
    Math.abs(frame.xPercent) * frame.scale <= margin &&
    Math.abs(frame.yPercent) * frame.scale <= margin
  );
}

/** Valeur CSS `transform` correspondant à une position de caméra. */
export function kenBurnsTransform(frame: KenBurnsFrame): string {
  return `scale(${frame.scale}) translate(${frame.xPercent}%, ${frame.yPercent}%)`;
}

/** Index de l'image suivante, en boucle. */
export function nextSlideIndex(current: number, total: number): number {
  if (!Number.isInteger(total) || total <= 0) {
    return 0;
  }
  const safe = Number.isInteger(current) && current >= 0 ? current % total : 0;
  return (safe + 1) % total;
}

/** Index de l'image précédente, en boucle. */
export function previousSlideIndex(current: number, total: number): number {
  if (!Number.isInteger(total) || total <= 0) {
    return 0;
  }
  const safe = Number.isInteger(current) && current >= 0 ? current % total : 0;
  return (safe - 1 + total) % total;
}

/** Mouvement de caméra attribué à une image (alterné pour éviter la monotonie). */
export function kenBurnsMoveFor(index: number): KenBurnsMove {
  const safe = Number.isInteger(index) && index >= 0 ? index : 0;
  return KEN_BURNS_MOVES[safe % KEN_BURNS_MOVES.length];
}

/**
 * Images à garder chargées : l'image courante, la précédente (qui s'efface
 * pendant le fondu) et la suivante (préchargée). Évite de télécharger toutes
 * les images d'un coup sur mobile.
 */
export function slidesToRender(current: number, total: number): readonly number[] {
  if (!Number.isInteger(total) || total <= 0) {
    return [];
  }
  const set = new Set<number>([
    previousSlideIndex(current, total),
    current % total,
    nextSlideIndex(current, total),
  ]);
  return [...set].sort((a, b) => a - b);
}

/** Libellé de compteur au format « 01 / 06 ». */
export function formatSlideCounter(index: number, total: number): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(index + 1)} / ${pad(total)}`;
}
