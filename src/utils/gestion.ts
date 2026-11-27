import { DEFAULT_OFFER, DEFAULT_SLUG, parseOffer, serializeOffer, type OfferConfig } from './offers';

/**
 * Espace gestion (/gestion) : échanges avec public/api/gestion.php et calculs d'affichage
 * (état d'un code -5 %, recherche, export tableur).
 */

export interface OfferSignup {
  readonly reference: string;
  /** Date d'inscription (ISO 8601). */
  readonly receivedAt: string;
  /** Fin de validité « JJ/MM/AAAA ». */
  readonly validUntil: string;
  /** Identifiant de l'offre (« bienvenue » = /offre). */
  readonly offer: string;
  /** Lignes du formulaire : « Vous êtes », « Société », « Nom », « Téléphone »… */
  readonly fields: Readonly<Record<string, string>>;
  /** Date d'utilisation du code (ISO), ou null s'il n'a pas encore servi. */
  readonly usedAt: string | null;
  readonly note: string;
}

export type SignupStatus = 'valide' | 'bientot' | 'perime' | 'utilise';

export type ApiFailure = 'non_connecte' | 'mot_de_passe' | 'trop_d_essais' | 'non_configure' | 'slug_existe' | 'reseau' | 'refus';

export type ApiResult<T> = { readonly ok: true; readonly data: T } | { readonly ok: false; readonly reason: ApiFailure };

const ENDPOINT = '/api/gestion.php';
/** Un code « expire bientôt » dans les 30 derniers jours. */
const SOON_DAYS = 30;

export function parseFrenchDate(value: string): Date | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!m) return null;
  const date = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function signupStatus(signup: OfferSignup, today: Date = new Date()): SignupStatus {
  if (signup.usedAt) return 'utilise';
  const end = parseFrenchDate(signup.validUntil);
  if (!end) return 'valide';
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (end < startOfToday) return 'perime';
  const soon = new Date(startOfToday);
  soon.setDate(soon.getDate() + SOON_DAYS);
  return end <= soon ? 'bientot' : 'valide';
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/** Recherche dans le code, le nom, la société, l'e-mail, la ville et le téléphone (chiffres seuls). */
export function matchesSearch(signup: OfferSignup, query: string): boolean {
  const q = normalize(query.trim());
  if (!q) return true;
  const haystack = normalize([signup.reference, ...Object.values(signup.fields)].join(' '));
  if (haystack.includes(q)) return true;
  const digits = q.replace(/\D/g, '');
  return digits.length >= 4 && (signup.fields['Téléphone'] ?? '').replace(/\D/g, '').includes(digits);
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const CSV_COLUMNS: readonly { readonly label: string; readonly value: (s: OfferSignup) => string }[] = [
  { label: 'Code', value: (s) => s.reference },
  { label: 'Inscrit le', value: (s) => formatDateTime(s.receivedAt) },
  { label: 'Valable jusqu’au', value: (s) => s.validUntil },
  { label: 'État', value: (s) => STATUS_LABELS[signupStatus(s)] },
  { label: 'Utilisé le', value: (s) => (s.usedAt ? formatDateTime(s.usedAt) : '') },
  { label: 'Vous êtes', value: (s) => s.fields['Vous êtes'] ?? '' },
  { label: 'Société', value: (s) => clean(s.fields['Société']) },
  { label: 'Fonction', value: (s) => clean(s.fields['Fonction']) },
  { label: 'Nom', value: (s) => s.fields['Nom'] ?? '' },
  { label: 'Téléphone', value: (s) => s.fields['Téléphone'] ?? '' },
  { label: 'E-mail', value: (s) => s.fields['E-mail'] ?? '' },
  { label: 'Ville', value: (s) => clean(s.fields['Ville']) },
];

function clean(value: string | undefined): string {
  return !value || value === '—' ? '' : value;
}

export const STATUS_LABELS: Readonly<Record<SignupStatus, string>> = {
  valide: 'Valide',
  bientot: 'Expire bientôt',
  perime: 'Périmé',
  utilise: 'Utilisé',
};

/** Libellés envoyés par le formulaire de base (le reste = questions propres à l'offre). */
const BASE_LABELS = new Set(['Offre', 'Vous êtes', 'Société', 'Fonction', 'Nom', 'Téléphone', 'E-mail', 'Ville']);

/** Réponses aux questions ajoutées dans l'offre (libellé → réponse), sans les réponses vides. */
export function extraAnswers(s: OfferSignup): [string, string][] {
  return Object.entries(s.fields).filter(([k, v]) => !BASE_LABELS.has(k) && v.trim() !== '' && v !== '—');
}

/** Fichier CSV lisible par Excel (séparateur « ; », accents conservés ; une colonne par question). */
export function signupsToCsv(list: readonly OfferSignup[]): string {
  const cell = (v: string) => (/[;"\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const extraLabels = [...new Set(list.flatMap((s) => Object.keys(s.fields).filter((k) => !BASE_LABELS.has(k))))];
  const columns = [...CSV_COLUMNS, ...extraLabels.map((label) => ({ label, value: (s: OfferSignup) => clean(s.fields[label]) }))];
  const rows = [columns.map((c) => c.label), ...list.map((s) => columns.map((c) => c.value(s)))];
  return '﻿' + rows.map((r) => r.map(cell).join(';')).join('\r\n');
}

interface RawSignup {
  reference?: unknown;
  recu_le?: unknown;
  valable_jusqu_au?: unknown;
  offre?: unknown;
  champs?: unknown;
  utilise_le?: unknown;
  note?: unknown;
}

export function parseSignups(body: unknown): OfferSignup[] {
  const list = (body as { inscriptions?: unknown } | null)?.inscriptions;
  if (!Array.isArray(list)) return [];
  return list.flatMap((item: RawSignup) => {
    if (typeof item?.reference !== 'string') return [];
    const fields: Record<string, string> = {};
    if (item.champs && typeof item.champs === 'object') {
      for (const [k, v] of Object.entries(item.champs as Record<string, unknown>)) {
        if (typeof v === 'string') fields[k] = v;
      }
    }
    return [
      {
        reference: item.reference,
        receivedAt: typeof item.recu_le === 'string' ? item.recu_le : '',
        validUntil: typeof item.valable_jusqu_au === 'string' ? item.valable_jusqu_au : '',
        offer: typeof item.offre === 'string' && item.offre ? item.offre : DEFAULT_SLUG,
        fields,
        usedAt: typeof item.utilise_le === 'string' ? item.utilise_le : null,
        note: typeof item.note === 'string' ? item.note : '',
      },
    ];
  });
}

function failureFrom(status: number, body: unknown): ApiFailure {
  const code = (body as { erreur?: unknown } | null)?.erreur;
  if (code === 'non_connecte' || code === 'mot_de_passe' || code === 'trop_d_essais' || code === 'non_configure' || code === 'slug_existe') return code;
  return status >= 400 && status < 500 ? 'refus' : 'reseau';
}

// --------------------------------------------------------------------------
// Aperçu de développement (pas de PHP) : données d'exemple en mémoire.
// --------------------------------------------------------------------------
function isDevPreview(): boolean {
  return Boolean((import.meta as { env?: { DEV?: boolean } }).env?.DEV);
}

let demoConnected = false;
const demoUsed = new Map<string, string>();
const DEMO: readonly OfferSignup[] = [
  { reference: 'OFF-20261127-4821', receivedAt: '2026-11-27T10:12:00+01:00', validUntil: '27/04/2027', offer: 'syndics-printemps', fields: { 'Vous êtes': 'Syndic / copropriété', Société: 'Cabinet Exemple Immobilier', Fonction: 'Gestionnaire', Nom: 'Exemple A.', Téléphone: '06 00 00 00 01', 'E-mail': 'exemple-a@exemple.fr', Ville: 'Marseille 6e', 'Nombre de lots gérés': '120', 'Travaux prévus': 'Serrures, Contrôle d’accès' }, usedAt: null, note: '' },
  { reference: 'OFF-20261126-1937', receivedAt: '2026-11-26T16:40:00+01:00', validUntil: '26/04/2027', offer: DEFAULT_SLUG, fields: { 'Vous êtes': 'Particulier', Société: '—', Fonction: '—', Nom: 'Exemple B.', Téléphone: '06 00 00 00 02', 'E-mail': 'exemple-b@exemple.fr', Ville: '—' }, usedAt: null, note: '' },
  { reference: 'OFF-20261120-7310', receivedAt: '2026-11-20T09:05:00+01:00', validUntil: '20/04/2027', offer: DEFAULT_SLUG, fields: { 'Vous êtes': 'Commerce / entreprise', Société: 'Commerce Exemple', Fonction: 'Gérant', Nom: 'Exemple C.', Téléphone: '06 00 00 00 03', 'E-mail': 'exemple-c@exemple.fr', Ville: 'Marseille 2e' }, usedAt: '2026-11-25T11:00:00+01:00', note: '' },
  { reference: 'OFF-20260705-2208', receivedAt: '2026-07-05T14:20:00+02:00', validUntil: '05/12/2026', offer: DEFAULT_SLUG, fields: { 'Vous êtes': 'Agence immobilière / bailleur', Société: 'Agence Exemple', Fonction: '—', Nom: 'Exemple D.', Téléphone: '06 00 00 00 04', 'E-mail': 'exemple-d@exemple.fr', Ville: 'Marseille 1er' }, usedAt: null, note: '' },
];

async function demo<T>(make: () => ApiResult<T>): Promise<ApiResult<T>> {
  await new Promise((r) => setTimeout(r, 300));
  return make();
}

// --------------------------------------------------------------------------
// Appels au serveur
// --------------------------------------------------------------------------
async function call(method: 'GET' | 'POST', action: string, payload?: unknown): Promise<{ status: number; body: unknown } | null> {
  try {
    const response = await fetch(`${ENDPOINT}?action=${action}`, {
      method,
      credentials: 'same-origin',
      headers: payload === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: payload === undefined ? undefined : JSON.stringify(payload),
    });
    let body: unknown = null;
    try {
      body = await response.json();
    } catch {
      body = null;
    }
    return { status: response.status, body };
  } catch {
    return null;
  }
}

export async function fetchSession(): Promise<ApiResult<boolean>> {
  if (isDevPreview()) return demo(() => ({ ok: true, data: demoConnected }));
  const r = await call('GET', 'session');
  if (!r) return { ok: false, reason: 'reseau' };
  if (r.status === 200) return { ok: true, data: (r.body as { connecte?: unknown })?.connecte === true };
  return { ok: false, reason: failureFrom(r.status, r.body) };
}

export async function login(password: string): Promise<ApiResult<true>> {
  if (isDevPreview()) {
    return demo(() => {
      demoConnected = password.length > 0;
      return demoConnected ? { ok: true, data: true } : { ok: false, reason: 'mot_de_passe' };
    });
  }
  const r = await call('POST', 'connexion', { mot_de_passe: password });
  if (!r) return { ok: false, reason: 'reseau' };
  return r.status === 200 ? { ok: true, data: true } : { ok: false, reason: failureFrom(r.status, r.body) };
}

export async function logout(): Promise<void> {
  if (isDevPreview()) {
    demoConnected = false;
    return;
  }
  await call('POST', 'deconnexion', {});
}

export async function fetchSignups(): Promise<ApiResult<OfferSignup[]>> {
  if (isDevPreview()) {
    return demo(() => ({ ok: true, data: DEMO.map((s) => (demoUsed.has(s.reference) ? { ...s, usedAt: demoUsed.get(s.reference) ?? null } : s)) }));
  }
  const r = await call('GET', 'inscriptions');
  if (!r) return { ok: false, reason: 'reseau' };
  return r.status === 200 ? { ok: true, data: parseSignups(r.body) } : { ok: false, reason: failureFrom(r.status, r.body) };
}

export async function setSignupUsed(reference: string, used: boolean): Promise<ApiResult<string | null>> {
  if (isDevPreview()) {
    return demo(() => {
      const at = used ? new Date().toISOString() : null;
      if (at) demoUsed.set(reference, at);
      else demoUsed.delete(reference);
      return { ok: true, data: at };
    });
  }
  const r = await call('POST', 'utilisation', { reference, utilise: used });
  if (!r) return { ok: false, reason: 'reseau' };
  if (r.status !== 200) return { ok: false, reason: failureFrom(r.status, r.body) };
  const at = (r.body as { utilise_le?: unknown })?.utilise_le;
  return { ok: true, data: typeof at === 'string' ? at : null };
}

export function failureMessage(reason: ApiFailure): string {
  switch (reason) {
    case 'mot_de_passe':
      return 'Mot de passe incorrect.';
    case 'trop_d_essais':
      return 'Trop d’essais. Réessayez dans 15 minutes.';
    case 'non_configure':
      return 'L’espace gestion n’est pas encore activé sur le serveur (mot de passe à créer).';
    case 'non_connecte':
      return 'Votre connexion a expiré. Reconnectez-vous.';
    case 'slug_existe':
      return 'Une offre utilise déjà cette adresse. Choisissez-en une autre.';
    default:
      return 'Le serveur ne répond pas. Vérifiez votre connexion et réessayez.';
  }
}

// --------------------------------------------------------------------------
// Offres (rubrique « Offres & QR codes »)
// --------------------------------------------------------------------------
let demoOffers: OfferConfig[] = [
  DEFAULT_OFFER,
  {
    ...DEFAULT_OFFER,
    slug: 'syndics-printemps',
    name: 'Syndics printemps 2027',
    title: 'Offre syndics : -10 % ce printemps',
    description: '10 % de réduction sur vos interventions dans vos copropriétés.',
    reductionValue: 10,
    months: 3,
    conditions: ['-10 % sur devis signé, pour les syndics et gestionnaires.', 'Valable 3 mois après l’inscription.', 'Non cumulable avec une autre offre ou promotion en cours.'],
    start: '2027-03-01',
    end: '2027-05-31',
    questions: [
      { id: 'q1', label: 'Nombre de lots gérés', type: 'nombre', required: true, options: [] },
      { id: 'q2', label: 'Travaux prévus', type: 'cases', required: false, options: ['Serrures', 'Portes blindées', 'Contrôle d’accès', 'Vitrerie'] },
    ],
  },
];

export async function fetchOffers(): Promise<ApiResult<OfferConfig[]>> {
  if (isDevPreview()) return demo(() => ({ ok: true, data: demoOffers }));
  const r = await call('GET', 'offres');
  if (!r) return { ok: false, reason: 'reseau' };
  if (r.status !== 200) return { ok: false, reason: failureFrom(r.status, r.body) };
  const list = (r.body as { offres?: unknown })?.offres;
  return { ok: true, data: Array.isArray(list) ? list.map(parseOffer).filter((o): o is OfferConfig => o !== null) : [] };
}

export async function saveOffer(offer: OfferConfig, isNew: boolean): Promise<ApiResult<OfferConfig>> {
  if (isDevPreview()) {
    return demo(() => {
      if (isNew && demoOffers.some((o) => o.slug === offer.slug)) return { ok: false, reason: 'slug_existe' };
      demoOffers = isNew ? [...demoOffers, offer] : demoOffers.map((o) => (o.slug === offer.slug ? offer : o));
      return { ok: true, data: offer };
    });
  }
  const r = await call('POST', 'offre', { offre: serializeOffer(offer), nouvelle: isNew });
  if (!r) return { ok: false, reason: 'reseau' };
  if (r.status !== 200) return { ok: false, reason: failureFrom(r.status, r.body) };
  const saved = parseOffer((r.body as { offre?: unknown })?.offre);
  return saved ? { ok: true, data: saved } : { ok: false, reason: 'reseau' };
}
