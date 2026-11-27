/**
 * Visuel de publicité (carré 1080 × 1080 pour Facebook / Instagram, story 1080 × 1920) dessiné en SVG
 * aux couleurs du thème de l'offre, puis converti en image PNG dans le navigateur.
 */
import { themeById, type ThemeId } from './offerPage';

export type VisualFormat = 'carre' | 'story';

export const VISUAL_FORMATS: readonly { readonly id: VisualFormat; readonly label: string; readonly hint: string; readonly w: number; readonly h: number }[] = [
  { id: 'carre', label: 'Carré', hint: 'Publication Facebook / Instagram (1080 × 1080)', w: 1080, h: 1080 },
  { id: 'story', label: 'Story', hint: 'Story ou Reel (1080 × 1920)', w: 1080, h: 1920 },
];

export interface VisualInput {
  readonly format: VisualFormat;
  readonly theme: ThemeId;
  readonly badge: string;
  readonly title: string;
  readonly subtitle: string;
  readonly cta: string;
  readonly footer: string;
  /** Logo en data URL (pour qu'il soit gardé dans l'image PNG). */
  readonly logoDataUrl?: string;
}

const FONT = "'Arial Black','Helvetica Neue',Arial,sans-serif";
const FONT_TEXT = "'Helvetica Neue',Arial,sans-serif";

function esc(t: string): string {
  return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Coupe un texte en lignes d'environ `maxChars` caractères (mots entiers). */
export function wrapText(text: string, maxChars: number, maxLines: number): string[] {
  const words = text.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = w;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = `${kept[maxLines - 1].replace(/[.,;:!?]?$/, '')}…`;
    return kept;
  }
  return lines;
}

export function buildVisualSvg(v: VisualInput): string {
  const f = VISUAL_FORMATS.find((x) => x.id === v.format) ?? VISUAL_FORMATS[0];
  const t = themeById(v.theme);
  const { w, h } = f;
  const story = v.format === 'story';
  const pad = 80;
  const footH = story ? 170 : 120;
  const top = story ? 90 : 44;
  const bottom = h - footH - (story ? 70 : 40);

  // Mise en page : on réduit tout (k) jusqu'à ce que le contenu tienne au-dessus du bandeau du bas.
  const layout = (k: number) => {
    const logoH = (story ? 250 : 190) * k;
    const badgeR = (story ? 200 : 128) * k;
    const titleSize = (story ? 92 : 70) * k;
    const subSize = (story ? 46 : 36) * k;
    const ctaH = v.cta ? (story ? 120 : 92) * k : 0;
    const gap = (story ? 60 : 34) * k;
    const titleLines = wrapText(v.title, Math.round((story ? 18 : 22) / k), 3);
    const subLines = wrapText(v.subtitle, Math.round((story ? 32 : 40) / k), story ? 4 : 3);
    const total = logoH + gap + badgeR * 2 + gap + titleLines.length * titleSize * 1.08 + gap * 0.6 + subLines.length * subSize * 1.3 + (v.cta ? gap + ctaH : 0);
    return { k, logoH, badgeR, titleSize, subSize, ctaH, gap, titleLines, subLines, total };
  };
  let L = layout(1);
  for (let k = 0.95; L.total > bottom - top && k > 0.5; k -= 0.05) L = layout(k);

  // Centre le bloc dans la place disponible.
  let y = top + Math.max(0, (bottom - top - L.total) / 2);
  const logoW = L.logoH * 1.85;
  const logoBox = `<rect x="${w / 2 - logoW / 2}" y="${y}" width="${logoW}" height="${L.logoH}" rx="${36 * L.k}" fill="#FFFFFF"/>`;
  const logo = v.logoDataUrl ? `<image href="${v.logoDataUrl}" x="${w / 2 - logoW / 2 + 20 * L.k}" y="${y + 14 * L.k}" width="${logoW - 40 * L.k}" height="${L.logoH - 28 * L.k}" preserveAspectRatio="xMidYMid meet"/>` : '';
  y += L.logoH + L.gap;
  const badgeCy = y + L.badgeR;
  const badgeSize = v.badge.length <= 3 ? L.badgeR * 0.78 : v.badge.length === 4 ? L.badgeR * 0.6 : L.badgeR * 0.48;
  const badge = `<circle cx="${w / 2}" cy="${badgeCy}" r="${L.badgeR}" fill="#FFFFFF"/>
<text x="${w / 2}" y="${badgeCy + badgeSize * 0.35}" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="${badgeSize}" letter-spacing="-3" fill="${t.accent}">${esc(v.badge)}</text>`;
  y = badgeCy + L.badgeR + L.gap + L.titleSize * 0.85;
  const title = L.titleLines
    .map((l, i) => `<text x="${w / 2}" y="${y + i * L.titleSize * 1.08}" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="${L.titleSize}" letter-spacing="-1.5" fill="#FFFFFF">${esc(l)}</text>`)
    .join('');
  y += (L.titleLines.length - 1) * L.titleSize * 1.08 + L.gap * 0.6 + L.subSize * 1.1;
  const sub = L.subLines
    .map((l, i) => `<text x="${w / 2}" y="${y + i * L.subSize * 1.3}" text-anchor="middle" font-family="${FONT_TEXT}" font-size="${L.subSize}" fill="#FFFFFF" fill-opacity="0.92">${esc(l)}</text>`)
    .join('');
  y += (L.subLines.length - 1) * L.subSize * 1.3 + L.subSize * 0.3 + L.gap;
  const ctaFont = (story ? 46 : 38) * L.k;
  const ctaW = Math.min(w - 2 * pad, 100 * L.k + v.cta.length * ctaFont * 0.62);
  const cta = v.cta
    ? `<rect x="${(w - ctaW) / 2}" y="${y}" width="${ctaW}" height="${L.ctaH}" rx="${L.ctaH / 2}" fill="#FFFFFF"/>
<text x="${w / 2}" y="${y + L.ctaH / 2 + ctaFont * 0.35}" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="${ctaFont}" fill="${t.accent}">${esc(v.cta)}</text>`
    : '';
  const footer = `<rect x="0" y="${h - footH}" width="${w}" height="${footH}" fill="#0B2A3C"/>
<text x="${w / 2}" y="${h - footH / 2 + 14}" text-anchor="middle" font-family="${FONT_TEXT}" font-weight="700" font-size="${story ? 44 : 38}" fill="${t.footer}">${esc(v.footer)}</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<defs>
<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.accent}"/><stop offset="0.55" stop-color="${t.accent2}"/><stop offset="1" stop-color="${t.accent3}"/></linearGradient>
</defs>
<rect width="${w}" height="${h}" fill="url(#g)"/>
<circle cx="${w - 60}" cy="${story ? 260 : 120}" r="${story ? 330 : 260}" fill="#FFFFFF" fill-opacity="0.08"/>
<circle cx="80" cy="${h - footH - 40}" r="${story ? 280 : 210}" fill="#FFFFFF" fill-opacity="0.07"/>
${logoBox}
${logo}
${badge}
${title}
${sub}
${cta}
${footer}
</svg>`;
}

/** Convertit le SVG en image PNG et la télécharge. */
export async function downloadVisualPng(svg: string, width: number, height: number, filename: string): Promise<void> {
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const img = new Image();
    img.decoding = 'async';
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('image'));
      img.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(img, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/png'));
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Charge une image du site en data URL (pour l'inclure dans le visuel). */
export async function toDataUrl(src: string): Promise<string> {
  const res = await fetch(src);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('lecture'));
    reader.readAsDataURL(blob);
  });
}
