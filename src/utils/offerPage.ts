/**
 * Réglages de la page d'une offre (onglet « Page » de l'éditeur) : thème de couleurs,
 * textes du bouton et du message de fin, blocs affichés sous le formulaire et leur ordre.
 * Le serveur (public/api/_offres.php) applique les mêmes règles.
 */

export type ThemeId = 'mer' | 'soleil' | 'calanques' | 'lavande';
export type BlockId = 'etapes' | 'avis' | 'infos';

export interface PageBlock {
  readonly id: BlockId;
  readonly visible: boolean;
}

export interface PageSettings {
  readonly theme: ThemeId;
  /** Texte du bouton d'envoi ; vide = « Recevoir mon code -5 % ». */
  readonly buttonText: string;
  /** Titre affiché après l'inscription ; vide = « C’est fait, votre réduction est activée. ». */
  readonly successText: string;
  readonly blocks: readonly PageBlock[];
}

export interface Theme {
  readonly id: ThemeId;
  readonly label: string;
  readonly hint: string;
  /** Couleurs : 3 pour le dégradé (la 1re sert aussi de couleur principale), fonds, taches, pied de page. */
  readonly accent: string;
  readonly accent2: string;
  readonly accent3: string;
  readonly bg1: string;
  readonly bg2: string;
  readonly blob1: string;
  readonly blob2: string;
  readonly tint: string;
  readonly footer: string;
}

export const THEMES: readonly Theme[] = [
  { id: 'mer', label: 'Mer', hint: 'Bleu mer et turquoise', accent: '#0E6BA8', accent2: '#1391B8', accent3: '#17B3A3', bg1: '#E6F4FA', bg2: '#E4F7F3', blob1: '#7FD3E6', blob2: '#7FE0C9', tint: '#F0F9FC', footer: '#5FD6C6' },
  { id: 'soleil', label: 'Soleil', hint: 'Orange et ocre', accent: '#B4460F', accent2: '#D4661A', accent3: '#D98A1E', bg1: '#FFF3E3', bg2: '#FFF7DF', blob1: '#FFC98A', blob2: '#FFE08A', tint: '#FFF6EC', footer: '#FFC26B' },
  { id: 'calanques', label: 'Calanques', hint: 'Vert pin et eau claire', accent: '#0B5D5B', accent2: '#12807A', accent3: '#3E9E6F', bg1: '#E3F3F0', bg2: '#EEF5E6', blob1: '#8FD4C8', blob2: '#B9DFA0', tint: '#EEF7F4', footer: '#7FD9B5' },
  { id: 'lavande', label: 'Lavande', hint: 'Violet de Provence et bleu', accent: '#5B3FA6', accent2: '#7051BD', accent3: '#4B78C8', bg1: '#EFEAFB', bg2: '#E8EEFB', blob1: '#C2B3F0', blob2: '#AFC6F2', tint: '#F4F1FC', footer: '#B9A8F2' },
];

export const BLOCK_LABELS: Readonly<Record<BlockId, { readonly label: string; readonly hint: string }>> = {
  etapes: { label: 'Comment ça marche', hint: 'Les 3 étapes : inscription, code, devis' },
  avis: { label: 'Avis clients', hint: '3 vrais avis Google et la note' },
  infos: { label: 'Infos de la boutique', hint: 'Adresse, horaires, téléphone (masqué : seule une ligne légale reste)' },
};

export const DEFAULT_PAGE: PageSettings = {
  theme: 'mer',
  buttonText: '',
  successText: '',
  blocks: [
    { id: 'etapes', visible: true },
    { id: 'avis', visible: true },
    { id: 'infos', visible: true },
  ],
};

export const MAX_BUTTON_TEXT = 40;
export const MAX_SUCCESS_TEXT = 90;

export function themeById(id: ThemeId): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

/** Variables CSS posées sur la page (couleurs du thème). */
export function themeStyle(id: ThemeId): Record<string, string> {
  const t = themeById(id);
  return {
    '--o-accent': t.accent,
    '--o-accent2': t.accent2,
    '--o-accent3': t.accent3,
    '--o-bg1': t.bg1,
    '--o-bg2': t.bg2,
    '--o-blob1': t.blob1,
    '--o-blob2': t.blob2,
    '--o-tint': t.tint,
    '--o-footer': t.footer,
  };
}

export const THEME_GRADIENT = 'linear-gradient(120deg,var(--o-accent) 0%,var(--o-accent2) 50%,var(--o-accent3) 100%)';

export function themeGradient(id: ThemeId): string {
  const t = themeById(id);
  return `linear-gradient(120deg,${t.accent} 0%,${t.accent2} 50%,${t.accent3} 100%)`;
}

const BLOCK_IDS: readonly BlockId[] = ['etapes', 'avis', 'infos'];

/** Les 3 blocs, chacun une fois, dans l'ordre donné (les manquants à la fin). */
export function normalizeBlocks(blocks: readonly PageBlock[]): PageBlock[] {
  const out: PageBlock[] = [];
  for (const b of blocks) if (BLOCK_IDS.includes(b.id) && !out.some((x) => x.id === b.id)) out.push({ id: b.id, visible: b.visible });
  for (const id of BLOCK_IDS) if (!out.some((x) => x.id === id)) out.push({ id, visible: true });
  return out;
}

export function validatePage(page: PageSettings): string | null {
  if (!THEMES.some((t) => t.id === page.theme)) return 'Thème inconnu.';
  if (page.buttonText.trim().length > MAX_BUTTON_TEXT) return `Texte du bouton : ${MAX_BUTTON_TEXT} caractères au maximum.`;
  if (page.successText.trim().length > MAX_SUCCESS_TEXT) return `Message après l’inscription : ${MAX_SUCCESS_TEXT} caractères au maximum.`;
  return null;
}

interface RawPage {
  theme?: unknown;
  bouton?: unknown;
  message?: unknown;
  blocs?: unknown;
}

export function parsePage(raw: unknown): PageSettings {
  const r = (raw ?? {}) as RawPage;
  const theme = THEMES.some((t) => t.id === r.theme) ? (r.theme as ThemeId) : DEFAULT_PAGE.theme;
  const blocks = Array.isArray(r.blocs)
    ? r.blocs.flatMap((b: { id?: unknown; visible?: unknown }) =>
        typeof b?.id === 'string' && BLOCK_IDS.includes(b.id as BlockId) ? [{ id: b.id as BlockId, visible: b.visible !== false }] : []
      )
    : [];
  return {
    theme,
    buttonText: typeof r.bouton === 'string' ? r.bouton : '',
    successText: typeof r.message === 'string' ? r.message : '',
    blocks: normalizeBlocks(blocks),
  };
}

export function serializePage(page: PageSettings): Record<string, unknown> {
  return {
    theme: page.theme,
    bouton: page.buttonText.trim(),
    message: page.successText.trim(),
    blocs: normalizeBlocks(page.blocks).map((b) => ({ id: b.id, visible: b.visible })),
  };
}
