/**
 * Affiche imprimable d'une offre (onglet « Affiche » de l'éditeur) : format et textes.
 * Les couleurs viennent du thème de la page (offerPage.ts), le QR code de l'adresse de l'offre.
 */

export type PosterFormat = 'a4' | 'a5' | 'carte';

export interface PosterSettings {
  readonly format: PosterFormat;
  /** Accroche en grand ; vide = titre de l'offre. */
  readonly title: string;
  /** Phrase sous l'accroche ; vide = explication de l'offre. */
  readonly text: string;
}

export const POSTER_FORMATS: readonly { readonly id: PosterFormat; readonly label: string; readonly hint: string; readonly widthMm: number; readonly heightMm: number }[] = [
  { id: 'a4', label: 'A4', hint: 'Affiche 21 × 29,7 cm (vitrine, hall d’immeuble)', widthMm: 210, heightMm: 297 },
  { id: 'a5', label: 'A5', hint: 'Flyer 14,8 × 21 cm', widthMm: 148, heightMm: 210 },
  { id: 'carte', label: '10 × 15', hint: 'Carte 10 × 15 cm (comptoir, courrier)', widthMm: 100, heightMm: 150 },
];

export const MAX_POSTER_TITLE = 70;
export const MAX_POSTER_TEXT = 180;

export const DEFAULT_POSTER: PosterSettings = { format: 'a4', title: '', text: '' };

export function posterFormat(id: PosterFormat) {
  return POSTER_FORMATS.find((f) => f.id === id) ?? POSTER_FORMATS[0];
}

export function validatePoster(p: PosterSettings): string | null {
  if (p.title.trim().length > MAX_POSTER_TITLE) return `Accroche de l’affiche : ${MAX_POSTER_TITLE} caractères au maximum.`;
  if (p.text.trim().length > MAX_POSTER_TEXT) return `Texte de l’affiche : ${MAX_POSTER_TEXT} caractères au maximum.`;
  return null;
}

export function parsePoster(raw: unknown): PosterSettings {
  const r = (raw ?? {}) as { format?: unknown; titre?: unknown; texte?: unknown };
  return {
    format: POSTER_FORMATS.some((f) => f.id === r.format) ? (r.format as PosterFormat) : 'a4',
    title: typeof r.titre === 'string' ? r.titre : '',
    text: typeof r.texte === 'string' ? r.texte : '',
  };
}

export function serializePoster(p: PosterSettings): Record<string, unknown> {
  return { format: p.format, titre: p.title.trim(), texte: p.text.trim() };
}
