/**
 * Campagnes de publicité (rubrique « Publicité » de /gestion) : flyers, affiches, Google, Facebook…
 * Chaque campagne a son lien (« ?c=<identifiant> ») : le compteur du site compte les visites arrivées par ce lien.
 * Si elle est liée à une offre, ses inscriptions et ses codes utilisés (= clients) sont comptés sur sa période.
 */
import { call, demo, failureFrom, isDevPreview, type ApiResult, type DayStats, type OfferSignup } from './gestion';
import { DEFAULT_SLUG, offerPath, SLUG_PATTERN } from './offers';
import { SITE_URL } from './seo';

export type Channel = 'flyer' | 'affiche' | 'google' | 'facebook' | 'instagram' | 'annuaire' | 'autre';

export const CHANNEL_LABELS: Readonly<Record<Channel, string>> = {
  flyer: 'Flyer',
  affiche: 'Affiche',
  google: 'Google Ads',
  facebook: 'Facebook',
  instagram: 'Instagram',
  annuaire: 'Annuaire payant',
  autre: 'Autre',
};

export interface Campaign {
  /** Identifiant dans le lien (« ?c=… »). Ne change plus une fois créé. */
  readonly id: string;
  readonly name: string;
  readonly channel: Channel;
  /** Offre liée (identifiant), ou '' pour l'accueil du site. */
  readonly offer: string;
  /** AAAA-MM-JJ, vide = pas de limite. */
  readonly start: string;
  readonly end: string;
  /** Budget total en euros. */
  readonly budget: number;
  readonly notes: string;
  readonly archived: boolean;
  /** Compter aussi les arrivées sur la page de l'offre sans lien de campagne (QR code imprimé avant la campagne). */
  readonly countDirect: boolean;
}

export interface CampaignResult {
  /** Arrivées sur le site par le lien de la campagne. */
  readonly visits: number;
  /** Vues de la page de l'offre liée pendant la campagne (tous liens confondus). */
  readonly offerViews: number;
  /** Inscriptions à l'offre liée pendant la campagne. */
  readonly signups: number;
  /** Codes de ces inscriptions déjà utilisés (= clients). */
  readonly clients: number;
  readonly costPerVisit: number | null;
  readonly costPerSignup: number | null;
  readonly costPerClient: number | null;
}

/** Lien de la campagne : page de l'offre liée (ou accueil) + « c=<identifiant> ». */
export function campaignUrl(c: Pick<Campaign, 'id' | 'offer'>): string {
  const base = c.offer ? offerPath(c.offer) : '/';
  return `${SITE_URL}${base}${base.includes('?') ? '&' : '?'}c=${encodeURIComponent(c.id)}`;
}

function inPeriod(day: string, c: Pick<Campaign, 'start' | 'end'>): boolean {
  return (!c.start || day >= c.start) && (!c.end || day <= c.end);
}

function isoDay(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const per = (budget: number, n: number) => (budget > 0 && n > 0 ? Math.round((budget / n) * 100) / 100 : null);

export function campaignResult(c: Campaign, stats: readonly DayStats[], signups: readonly OfferSignup[]): CampaignResult {
  let visits = 0;
  let offerViews = 0;
  for (const d of stats) {
    if (!inPeriod(d.day, c)) continue;
    visits += d.campaigns[c.id] ?? 0;
    if (c.offer && c.countDirect) visits += d.offerDirect[c.offer] ?? 0;
    if (c.offer) offerViews += d.offers[c.offer] ?? 0;
  }
  const own = c.offer ? signups.filter((s) => s.offer === c.offer && inPeriod(isoDay(s.receivedAt), c)) : [];
  const clients = own.filter((s) => s.usedAt).length;
  return {
    visits,
    offerViews,
    signups: own.length,
    clients,
    costPerVisit: per(c.budget, visits || offerViews),
    costPerSignup: per(c.budget, own.length),
    costPerClient: per(c.budget, clients),
  };
}

export function formatEuros(v: number): string {
  return v.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: v % 1 === 0 ? 0 : 2 });
}

export type CampaignErrors = Partial<Record<'id' | 'name' | 'budget' | 'end', string>>;

export function validateCampaign(c: Campaign, existingIds: readonly string[], isNew: boolean): CampaignErrors {
  const e: CampaignErrors = {};
  if (!SLUG_PATTERN.test(c.id)) e.id = 'Identifiant : 3 à 40 caractères, lettres sans accent, chiffres et tirets.';
  else if (isNew && existingIds.includes(c.id)) e.id = 'Une campagne utilise déjà cet identifiant.';
  if (c.name.trim().length < 3) e.name = 'Donnez un nom à la campagne.';
  if (!Number.isFinite(c.budget) || c.budget < 0 || c.budget > 1_000_000) e.budget = 'Budget entre 0 et 1 000 000 €.';
  if (c.start && c.end && c.end < c.start) e.end = 'La fin doit être après le début.';
  return e;
}

const CHANNELS = new Set<Channel>(['flyer', 'affiche', 'google', 'facebook', 'instagram', 'annuaire', 'autre']);

export function parseCampaign(raw: unknown): Campaign | null {
  const r = (raw ?? {}) as Record<string, unknown>;
  if (typeof r.id !== 'string' || typeof r.nom !== 'string') return null;
  return {
    id: r.id,
    name: r.nom,
    channel: CHANNELS.has(r.canal as Channel) ? (r.canal as Channel) : 'autre',
    offer: typeof r.offre === 'string' ? r.offre : '',
    start: typeof r.debut === 'string' ? r.debut : '',
    end: typeof r.fin === 'string' ? r.fin : '',
    budget: typeof r.budget === 'number' ? r.budget : Number(r.budget) || 0,
    notes: typeof r.notes === 'string' ? r.notes : '',
    archived: r.archivee === true,
    countDirect: r.sans_lien === true,
  };
}

export function serializeCampaign(c: Campaign): Record<string, unknown> {
  return { id: c.id, nom: c.name.trim(), canal: c.channel, offre: c.offer, debut: c.start, fin: c.end, budget: c.budget, notes: c.notes.trim(), archivee: c.archived, sans_lien: c.countDirect };
}

let demoCampaigns: Campaign[] = [
  { id: 'flyer-syndics-6e', name: 'Flyers syndics Marseille 6e', channel: 'flyer', offer: DEFAULT_SLUG, start: '2026-11-01', end: '', budget: 180, notes: '500 flyers déposés chez 12 syndics.', archived: false, countDirect: true },
  { id: 'google-ads-serrurier', name: 'Google Ads « serrurier Marseille »', channel: 'google', offer: '', start: '2026-11-10', end: '2026-12-10', budget: 300, notes: '', archived: false, countDirect: false },
];

export async function fetchCampaigns(): Promise<ApiResult<Campaign[]>> {
  if (isDevPreview()) return demo(() => ({ ok: true, data: demoCampaigns }));
  const r = await call('GET', 'campagnes');
  if (!r) return { ok: false, reason: 'reseau' };
  if (r.status !== 200) return { ok: false, reason: failureFrom(r.status, r.body) };
  const list = (r.body as { campagnes?: unknown })?.campagnes;
  return { ok: true, data: Array.isArray(list) ? list.map(parseCampaign).filter((c): c is Campaign => c !== null) : [] };
}

export async function saveCampaign(c: Campaign, isNew: boolean): Promise<ApiResult<Campaign>> {
  if (isDevPreview()) {
    return demo(() => {
      if (isNew && demoCampaigns.some((x) => x.id === c.id)) return { ok: false, reason: 'slug_existe' };
      demoCampaigns = isNew ? [...demoCampaigns, c] : demoCampaigns.map((x) => (x.id === c.id ? c : x));
      return { ok: true, data: c };
    });
  }
  const r = await call('POST', 'campagne', { campagne: serializeCampaign(c), nouvelle: isNew });
  if (!r) return { ok: false, reason: 'reseau' };
  if (r.status !== 200) return { ok: false, reason: failureFrom(r.status, r.body) };
  const saved = parseCampaign((r.body as { campagne?: unknown })?.campagne);
  return saved ? { ok: true, data: saved } : { ok: false, reason: 'reseau' };
}
