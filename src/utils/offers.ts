/**
 * Offres d'inscription (page /offre et /offre?o=<identifiant>), créées depuis l'espace /gestion.
 * Le serveur (public/api/_offres.php) garde la même offre par défaut « bienvenue » :
 * c'est celle du premier flyer (QR code vers /offre).
 */
import { SITE_URL } from './seo';
import { parseQuestions, serializeQuestions, validateQuestions, type OfferQuestion } from './offerQuestions';
import { DEFAULT_PAGE, parsePage, serializePage, validatePage, type PageSettings } from './offerPage';

export type ReductionType = 'pourcent' | 'euros';

export interface OfferConfig {
  /** Identifiant dans l'adresse (/offre?o=…) ; « bienvenue » = /offre. Ne change plus une fois créé. */
  readonly slug: string;
  /** Nom interne (espace gestion, e-mails). */
  readonly name: string;
  /** Titre affiché aux clients. */
  readonly title: string;
  /** Phrase d'explication sous le titre. */
  readonly description: string;
  readonly reductionType: ReductionType;
  readonly reductionValue: number;
  /** Validité du code après l'inscription, en mois. */
  readonly months: number;
  readonly conditions: readonly string[];
  /** Période d'inscription (AAAA-MM-JJ), vide = sans limite. */
  readonly start: string;
  readonly end: string;
  readonly active: boolean;
  /** Questions en plus du formulaire de base. */
  readonly questions: readonly OfferQuestion[];
  /** Couleurs, textes et blocs de la page. */
  readonly page: PageSettings;
}

export const DEFAULT_SLUG = 'bienvenue';

export const STANDARD_CONDITIONS: readonly string[] = [
  'Une seule inscription par société ou par personne.',
  'Hors dépannage d’urgence (ouverture de porte, mise en sécurité immédiate).',
  'Non cumulable avec une autre offre ou promotion en cours.',
  'Présentez votre code (ou donnez-le par téléphone) au moment du devis.',
];

export const DEFAULT_OFFER: OfferConfig = {
  slug: DEFAULT_SLUG,
  name: 'Offre de bienvenue -5 % (flyer)',
  title: 'Inscription à l’offre de bienvenue',
  description: '5 % de réduction sur votre premier achat ou votre première intervention.',
  reductionType: 'pourcent',
  reductionValue: 5,
  months: 5,
  conditions: [
    '-5 % sur votre premier achat ou votre première intervention, sur devis signé.',
    'Valable 5 mois après l’inscription.',
    ...STANDARD_CONDITIONS,
  ],
  start: '',
  end: '',
  active: true,
  questions: [],
  page: DEFAULT_PAGE,
};

/** « -5 % » ou « -50 € » (espace insécable). */
export function reductionLabel(offer: Pick<OfferConfig, 'reductionType' | 'reductionValue'>): string {
  const v = offer.reductionValue.toLocaleString('fr-FR');
  return offer.reductionType === 'euros' ? `-${v} €` : `-${v} %`;
}

/** Version courte pour la pastille ronde : « -5% » / « -50€ ». */
export function reductionBadge(offer: Pick<OfferConfig, 'reductionType' | 'reductionValue'>): string {
  return `-${offer.reductionValue.toLocaleString('fr-FR')}${offer.reductionType === 'euros' ? '€' : '%'}`;
}

export function offerPath(slug: string): string {
  return slug === DEFAULT_SLUG ? '/offre' : `/offre?o=${encodeURIComponent(slug)}`;
}

export function offerUrl(slug: string): string {
  return SITE_URL + offerPath(slug);
}

export type OfferStatus = 'active' | 'pause' | 'programmee' | 'terminee';

export const OFFER_STATUS_LABELS: Readonly<Record<OfferStatus, string>> = {
  active: 'En cours',
  pause: 'En pause',
  programmee: 'Programmée',
  terminee: 'Terminée',
};

function isoDay(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function offerStatus(offer: OfferConfig, today: Date = new Date()): OfferStatus {
  if (!offer.active) return 'pause';
  const day = isoDay(today);
  if (offer.start && day < offer.start) return 'programmee';
  if (offer.end && day > offer.end) return 'terminee';
  return 'active';
}

/** « Syndics printemps 2027 » → « syndics-printemps-2027 ». */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/g, '');
}

export const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/;

export type OfferErrors = Partial<Record<'slug' | 'name' | 'title' | 'description' | 'reductionValue' | 'months' | 'conditions' | 'end' | 'questions' | 'page', string>>;

export function validateOffer(offer: OfferConfig, existingSlugs: readonly string[] = [], isNew = false): OfferErrors {
  const e: OfferErrors = {};
  if (!SLUG_PATTERN.test(offer.slug)) e.slug = 'Adresse : 3 à 40 caractères, lettres sans accent, chiffres et tirets.';
  else if (isNew && existingSlugs.includes(offer.slug)) e.slug = 'Cette adresse est déjà prise par une autre offre.';
  if (offer.name.trim().length < 3) e.name = 'Donnez un nom à l’offre.';
  if (offer.title.trim().length < 3) e.title = 'Indiquez le titre vu par les clients.';
  if (offer.description.trim().length < 10) e.description = 'Expliquez l’offre en une phrase.';
  const v = offer.reductionValue;
  if (!Number.isFinite(v) || v <= 0 || (offer.reductionType === 'pourcent' ? v > 90 : v > 10000)) {
    e.reductionValue = offer.reductionType === 'pourcent' ? 'Entre 1 et 90 %.' : 'Entre 1 et 10 000 €.';
  }
  if (!Number.isInteger(offer.months) || offer.months < 1 || offer.months > 24) e.months = 'Entre 1 et 24 mois.';
  if (offer.conditions.filter((c) => c.trim()).length === 0) e.conditions = 'Ajoutez au moins une condition.';
  if (offer.start && offer.end && offer.end < offer.start) e.end = 'La fin doit être après le début.';
  const q = validateQuestions(offer.questions);
  if (q) e.questions = q;
  const pageError = validatePage(offer.page);
  if (pageError) e.page = pageError;
  return e;
}

interface RawOffer {
  slug?: unknown;
  nom?: unknown;
  titre?: unknown;
  description?: unknown;
  reduction_type?: unknown;
  reduction_valeur?: unknown;
  duree_mois?: unknown;
  conditions?: unknown;
  debut?: unknown;
  fin?: unknown;
  actif?: unknown;
  questions?: unknown;
  page?: unknown;
}

/** Offre reçue du serveur (noms français) → objet du site. */
export function parseOffer(raw: unknown): OfferConfig | null {
  const r = (raw ?? {}) as RawOffer;
  if (typeof r.slug !== 'string' || typeof r.titre !== 'string') return null;
  return {
    slug: r.slug,
    name: typeof r.nom === 'string' ? r.nom : r.slug,
    title: r.titre,
    description: typeof r.description === 'string' ? r.description : '',
    reductionType: r.reduction_type === 'euros' ? 'euros' : 'pourcent',
    reductionValue: typeof r.reduction_valeur === 'number' ? r.reduction_valeur : Number(r.reduction_valeur) || 0,
    months: typeof r.duree_mois === 'number' ? r.duree_mois : Number(r.duree_mois) || 1,
    conditions: Array.isArray(r.conditions) ? r.conditions.filter((c): c is string => typeof c === 'string') : [],
    start: typeof r.debut === 'string' ? r.debut : '',
    end: typeof r.fin === 'string' ? r.fin : '',
    active: r.actif !== false,
    questions: parseQuestions(r.questions),
    page: parsePage(r.page),
  };
}

/** Objet du site → format serveur. */
export function serializeOffer(o: OfferConfig): Record<string, unknown> {
  return {
    slug: o.slug,
    nom: o.name.trim(),
    titre: o.title.trim(),
    description: o.description.trim(),
    reduction_type: o.reductionType,
    reduction_valeur: o.reductionValue,
    duree_mois: o.months,
    conditions: o.conditions.map((c) => c.trim()).filter(Boolean),
    debut: o.start,
    fin: o.end,
    actif: o.active,
    questions: serializeQuestions(o.questions),
    page: serializePage(o.page),
  };
}

/** Lit « o » dans l'adresse de la page (/offre?o=…). */
export function slugFromSearch(search: string): string {
  const o = new URLSearchParams(search).get('o');
  return o && SLUG_PATTERN.test(o) ? o : DEFAULT_SLUG;
}

export type PublicOfferResult = { readonly ok: true; readonly offer: OfferConfig } | { readonly ok: false; readonly reason: 'indisponible' | 'reseau' };

function isDevPreview(): boolean {
  return Boolean((import.meta as { env?: { DEV?: boolean } }).env?.DEV);
}

/** Offre publique pour la page /offre (le serveur vérifie qu'elle est en cours). */
export async function fetchPublicOffer(slug: string): Promise<PublicOfferResult> {
  if (isDevPreview()) {
    return slug === DEFAULT_SLUG ? { ok: true, offer: DEFAULT_OFFER } : { ok: false, reason: 'indisponible' };
  }
  try {
    const response = await fetch(`/api/offre.php?o=${encodeURIComponent(slug)}`, { credentials: 'same-origin' });
    const body = (await response.json().catch(() => null)) as { ok?: unknown; offre?: unknown } | null;
    if (response.ok && body?.ok === true) {
      const offer = parseOffer(body.offre);
      if (offer) return { ok: true, offer };
    }
    return response.status === 404 || response.status === 410 ? { ok: false, reason: 'indisponible' } : { ok: false, reason: 'reseau' };
  } catch {
    return { ok: false, reason: 'reseau' };
  }
}
