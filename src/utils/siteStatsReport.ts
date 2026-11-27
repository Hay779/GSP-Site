/**
 * Calculs de la rubrique « Suivi du site » : totaux d'une période, comparaison avec la période
 * précédente, provenances, pages, offres (vues → inscriptions), appareils.
 */
import type { DayStats, OfferSignup, SiteRequest } from './gestion';
import { SOURCE_LABELS, type VisitSource } from './siteStats';

export interface Totals {
  readonly visits: number;
  readonly views: number;
  readonly requests: number;
  readonly signups: number;
}

export interface Report {
  readonly current: Totals;
  readonly previous: Totals;
  /** Une entrée par jour de la période : visites et demandes reçues ce jour-là. */
  readonly daily: readonly { readonly day: string; readonly visits: number; readonly requests: number }[];
  readonly sources: readonly { readonly id: VisitSource; readonly label: string; readonly count: number; readonly share: number }[];
  readonly pages: readonly { readonly path: string; readonly label: string; readonly count: number }[];
  readonly offers: readonly { readonly slug: string; readonly views: number; readonly signups: number }[];
  readonly mobileShare: number | null;
}

function dayKey(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function add(map: Map<string, number>, key: string, n: number) {
  map.set(key, (map.get(key) ?? 0) + n);
}

const PAGE_NAMES: Readonly<Record<string, string>> = {
  '/': 'Accueil',
  '/offre': 'Page de l’offre (QR code)',
  '/devis': 'Demande de devis',
  '/contact': 'Contact',
};

export function pageLabel(path: string): string {
  if (PAGE_NAMES[path]) return PAGE_NAMES[path];
  const words = path.replace(/^\//, '').split(/[-/]/).filter(Boolean).join(' ');
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : path;
}

/** Évolution en % (null si pas de base de comparaison). */
export function change(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * `stats` couvre 2 × `days` jours (période précédente puis période courante), du plus ancien au plus récent.
 */
export function buildReport(stats: readonly DayStats[], days: number, requests: readonly SiteRequest[], signups: readonly OfferSignup[]): Report {
  const current = stats.slice(-days);
  const previous = stats.slice(-2 * days, -days);
  const currentDays = new Set(current.map((d) => d.day));
  const previousDays = new Set(previous.map((d) => d.day));

  const requestsByDay = new Map<string, number>();
  for (const r of requests) add(requestsByDay, dayKey(r.receivedAt), 1);
  const signupDays = signups.map((s) => ({ day: dayKey(s.receivedAt), offer: s.offer }));

  const totals = (list: readonly DayStats[], set: Set<string>): Totals => ({
    visits: list.reduce((a, d) => a + d.entries, 0),
    views: list.reduce((a, d) => a + d.views, 0),
    requests: [...requestsByDay].filter(([day]) => set.has(day)).reduce((a, [, n]) => a + n, 0),
    signups: signupDays.filter((s) => set.has(s.day)).length,
  });

  const sources = new Map<string, number>();
  const pages = new Map<string, number>();
  const offerViews = new Map<string, number>();
  let mobile = 0;
  let desktop = 0;
  for (const d of current) {
    for (const [k, n] of Object.entries(d.sources)) add(sources, k, n);
    for (const [k, n] of Object.entries(d.pages)) add(pages, k, n);
    for (const [k, n] of Object.entries(d.offers)) add(offerViews, k, n);
    mobile += d.mobile;
    desktop += d.desktop;
  }
  const offerSignups = new Map<string, number>();
  for (const s of signupDays) if (currentDays.has(s.day)) add(offerSignups, s.offer, 1);

  const sourceTotal = [...sources.values()].reduce((a, n) => a + n, 0);
  const offerSlugs = new Set([...offerViews.keys(), ...offerSignups.keys()]);

  return {
    current: totals(current, currentDays),
    previous: totals(previous, previousDays),
    daily: current.map((d) => ({ day: d.day, visits: d.entries, requests: requestsByDay.get(d.day) ?? 0 })),
    sources: [...sources]
      .filter(([id]) => id in SOURCE_LABELS)
      .map(([id, count]) => ({ id: id as VisitSource, label: SOURCE_LABELS[id as VisitSource], count, share: sourceTotal ? count / sourceTotal : 0 }))
      .sort((a, b) => b.count - a.count),
    pages: [...pages]
      .map(([path, count]) => ({ path, label: pageLabel(path), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),
    offers: [...offerSlugs]
      .map((slug) => ({ slug, views: offerViews.get(slug) ?? 0, signups: offerSignups.get(slug) ?? 0 }))
      .sort((a, b) => b.views - a.views),
    mobileShare: mobile + desktop > 0 ? mobile / (mobile + desktop) : null,
  };
}
