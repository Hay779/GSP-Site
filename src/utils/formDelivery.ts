/**
 * Envoi des formulaires vers le récepteur PHP du site (public/api/demande.php, sur OVH).
 * Chaque formulaire envoie des lignes « libellé : valeur » déjà rédigées ; le serveur
 * enregistre la demande, l'envoie par e-mail et renvoie la référence.
 */

import { trackEvent } from './analytics';

export type FormKind = 'devis' | 'contact' | 'partenaire' | 'sinistre' | 'inscription';

export interface SummaryRow {
  readonly label: string;
  readonly value: string;
}

export type DeliveryResult =
  | {
      readonly ok: true;
      readonly reference: string;
      /** Inscription à l'offre : date de fin de validité (JJ/MM/AAAA) donnée par le serveur. */
      readonly validUntil?: string;
      /** Inscription à l'offre : déjà inscrit, le code existant est renvoyé. */
      readonly alreadyRegistered?: boolean;
    }
  | { readonly ok: false; readonly reason: 'reseau' | 'limite' | 'refus' };

export const FORM_ENDPOINT = '/api/demande.php';

/** Nom du champ piège (invisible pour les visiteurs, rempli par les robots). */
export const HONEYPOT_NAME = 'website';

export interface DeliveryInput {
  readonly kind: FormKind;
  readonly rows: readonly SummaryRow[];
  /** Moment où le visiteur a ouvert le formulaire (Date.now()). */
  readonly startedAt: number;
  readonly honeypot: string;
  readonly photos?: readonly Blob[];
  /** Champs techniques en plus (ex. { offre: 'bienvenue' } pour une inscription). */
  readonly extra?: Readonly<Record<string, string>>;
}

export function buildFormData(input: DeliveryInput): FormData {
  const data = new FormData();
  data.append('type', input.kind);
  data.append(
    'champs',
    JSON.stringify(input.rows.map((row) => ({ libelle: row.label, valeur: row.value })))
  );
  data.append('debut', String(Math.floor(input.startedAt)));
  data.append(HONEYPOT_NAME, input.honeypot);
  for (const [key, value] of Object.entries(input.extra ?? {})) {
    data.append(key, value);
  }
  (input.photos ?? []).forEach((photo, index) => {
    data.append('photos[]', photo, `photo-${index + 1}.jpg`);
  });
  return data;
}

export function interpretResponse(status: number, body: unknown): DeliveryResult {
  const data = (body ?? {}) as { ok?: unknown; reference?: unknown; valable_jusqu_au?: unknown; deja_inscrit?: unknown };
  if (status >= 200 && status < 300 && data.ok === true && typeof data.reference === 'string') {
    return {
      ok: true,
      reference: data.reference,
      ...(typeof data.valable_jusqu_au === 'string' ? { validUntil: data.valable_jusqu_au } : {}),
      ...(data.deja_inscrit === true ? { alreadyRegistered: true } : {}),
    };
  }
  if (status === 429) return { ok: false, reason: 'limite' };
  if (status >= 400 && status < 500) return { ok: false, reason: 'refus' };
  return { ok: false, reason: 'reseau' };
}

/** Message affiché au visiteur quand l'envoi échoue (toujours avec le repli téléphone). */
export function deliveryErrorMessage(reason: 'reseau' | 'limite' | 'refus'): string {
  if (reason === 'limite') {
    return 'Vous avez déjà envoyé plusieurs demandes. Pour aller plus vite, appelez-nous ou écrivez-nous sur WhatsApp.';
  }
  return 'L’envoi n’a pas abouti. Appelez-nous ou écrivez-nous sur WhatsApp : nous traitons votre demande tout de suite.';
}

function isDevPreview(): boolean {
  return Boolean((import.meta as { env?: { DEV?: boolean } }).env?.DEV);
}

export async function sendFormRequest(
  input: DeliveryInput,
  fetchImpl: typeof fetch = globalThis.fetch
): Promise<DeliveryResult> {
  if (isDevPreview()) {
    // Aperçu de développement (pas de PHP) : on simule un envoi réussi.
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { ok: true, reference: `TEST-${input.kind.toUpperCase()}` };
  }
  try {
    const response = await fetchImpl(FORM_ENDPOINT, {
      method: 'POST',
      body: buildFormData(input),
      credentials: 'same-origin',
    });
    let body: unknown = null;
    try {
      body = await response.json();
    } catch {
      body = null;
    }
    const result = interpretResponse(response.status, body);
    if (result.ok) trackEvent('generate_lead', { form_type: input.kind });
    return result;
  } catch {
    return { ok: false, reason: 'reseau' };
  }
}
