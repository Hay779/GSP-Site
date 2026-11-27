/**
 * Rubrique « Relances » de l'espace /gestion : qui recontacter, et pourquoi.
 * Calculé à partir des demandes (et de leur suivi) et des inscriptions aux offres.
 * Une relance faite cache la ligne pendant RELANCE_PAUSE_JOURS ; si la situation n'a pas changé, elle revient.
 */
import { REVIEWS_SOURCE } from '../data/reviewsContent';
import { formatDateTime, requestField, REQUEST_TYPE_LABELS, requestSummary, signupStatus, type OfferSignup, type RelanceDone, type SiteRequest } from './gestion';

export type { RelanceDone };

export type RelanceReason = 'rappel' | 'devis' | 'suivi' | 'expire' | 'inutilise' | 'avis';

export type RelancesDone = Readonly<Record<string, RelanceDone>>;

export interface Relance {
  /** « référence:raison » : clé enregistrée par le serveur quand la relance est faite. */
  readonly key: string;
  readonly reason: RelanceReason;
  readonly reference: string;
  readonly name: string;
  readonly company: string;
  readonly phone: string;
  readonly email: string;
  /** Pourquoi relancer, en une phrase. */
  readonly why: string;
  /** Contexte (besoin, offre…). */
  readonly detail: string;
  /** Nombre de jours depuis l'événement qui déclenche la relance. */
  readonly days: number;
  readonly lastDone?: RelanceDone;
  /** Message proposé pour l'e-mail ou le SMS. */
  readonly message: string;
}

export const RELANCE_PAUSE_JOURS = 7;

export const RELANCE_GROUPS: readonly { readonly reason: RelanceReason; readonly title: string; readonly hint: string }[] = [
  { reason: 'rappel', title: 'Nouvelles demandes pas encore rappelées', hint: 'Reçues depuis plus de 24 h, toujours « Nouvelle ».' },
  { reason: 'devis', title: 'Devis envoyés sans réponse', hint: 'Devis envoyé depuis plus de 7 jours.' },
  { reason: 'suivi', title: 'Dossiers en cours sans nouvelles', hint: '« En cours » sans mise à jour depuis plus de 5 jours.' },
  { reason: 'expire', title: 'Codes de réduction qui expirent', hint: 'Code valable encore 30 jours ou moins, pas encore utilisé.' },
  { reason: 'inutilise', title: 'Inscrits qui n’ont pas encore utilisé leur code', hint: 'Inscrits depuis plus de 30 jours.' },
  { reason: 'avis', title: 'Demander un avis Google', hint: 'Clients servis il y a 1 à 60 jours (code utilisé ou demande terminée). Une seule fois par client.' },
];

/** Fenêtre pour demander un avis : assez tôt pour que le client s'en souvienne. */
export const AVIS_JOURS = { min: 1, max: 60 } as const;

const DAY = 24 * 3600 * 1000;

function daysSince(iso: string, now: Date): number {
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? 0 : Math.floor((now.getTime() - t) / DAY);
}

function firstName(name: string): string {
  return name.trim() ? `Bonjour ${name.trim()},` : 'Bonjour,';
}

const SIGNATURE = '\n\nSerrurerie de la République\n48 rue de la République, 13002 Marseille\n04 91 90 51 65';

function isPaused(done: RelanceDone | undefined, now: Date): boolean {
  return Boolean(done && daysSince(done.at, now) < RELANCE_PAUSE_JOURS);
}

function avisMessage(name: string): string {
  return `${firstName(name)}\n\nMerci de nous avoir fait confiance. Si vous êtes satisfait de notre travail, pourriez-vous nous laisser un avis sur Google ? Cela prend une minute et nous aide beaucoup :\n${REVIEWS_SOURCE.leaveReviewUrl}\n\nMerci et à bientôt !${SIGNATURE}`;
}

const phoneKey = (p: string) => p.replace(/\D/g, '').slice(-9);

/** Toutes les relances à faire, les plus urgentes d'abord dans chaque groupe. */
export function computeRelances(requests: readonly SiteRequest[], signups: readonly OfferSignup[], done: RelancesDone, now: Date = new Date()): Relance[] {
  const out: Relance[] = [];
  const avisCandidates: Omit<Relance, 'key' | 'lastDone'>[] = [];
  const push = (r: Omit<Relance, 'key' | 'lastDone'>) => {
    const key = `${r.reference}:${r.reason}`;
    // Un avis ne se demande qu'une fois ; les autres relances reviennent après la pause.
    if (r.reason === 'avis' ? done[key] : isPaused(done[key], now)) return;
    out.push({ ...r, key, ...(done[key] ? { lastDone: done[key] } : {}) });
  };

  for (const r of requests) {
    const name = requestField(r, 'Nom');
    const base = {
      reference: r.reference,
      name,
      company: requestField(r, 'Société'),
      phone: requestField(r, 'Téléphone'),
      email: requestField(r, 'E-mail'),
      detail: `${REQUEST_TYPE_LABELS[r.type]} · ${requestSummary(r) || r.title}`,
    };
    const received = daysSince(r.receivedAt, now);
    const updated = r.updatedAt ? daysSince(r.updatedAt, now) : received;
    if (r.status === 'nouvelle' && received >= 1) {
      push({
        ...base,
        reason: 'rappel',
        days: received,
        why: `Demande reçue le ${formatDateTime(r.receivedAt)}, pas encore rappelée.`,
        message: `${firstName(name)}\n\nNous avons bien reçu votre demande (${r.reference}). Nous essayons de vous joindre : quand êtes-vous disponible pour en parler ?${SIGNATURE}`,
      });
    } else if (r.status === 'devis_envoye' && updated >= 7) {
      push({
        ...base,
        reason: 'devis',
        days: updated,
        why: `Devis envoyé il y a ${updated} jours, sans réponse.`,
        message: `${firstName(name)}\n\nAvez-vous pu regarder notre devis (${r.reference}) ? Nous restons disponibles pour toute question ou pour l’ajuster.${SIGNATURE}`,
      });
    } else if (r.status === 'en_cours' && updated >= 5) {
      push({
        ...base,
        reason: 'suivi',
        days: updated,
        why: `En cours, sans mise à jour depuis ${updated} jours.`,
        message: `${firstName(name)}\n\nNous revenons vers vous au sujet de votre demande (${r.reference}). Où en êtes-vous de votre côté ?${SIGNATURE}`,
      });
    } else if (r.status === 'terminee' && r.type !== 'partenaire' && updated >= AVIS_JOURS.min && updated <= AVIS_JOURS.max) {
      avisCandidates.push({
        ...base,
        reason: 'avis',
        days: updated,
        why: `Demande terminée il y a ${updated} jour${updated > 1 ? 's' : ''}.`,
        message: avisMessage(name),
      });
    }
  }

  for (const s of signups) {
    const status = signupStatus(s, now);
    const name = s.fields['Nom'] ?? '';
    const company = s.fields['Société'] && s.fields['Société'] !== '—' ? s.fields['Société'] : '';
    const base = { reference: s.reference, name, company, phone: s.fields['Téléphone'] ?? '', email: s.fields['E-mail'] ?? '' };
    const offerLabel = s.offer === 'bienvenue' ? 'Offre de bienvenue' : `Offre « ${s.offer} »`;
    if (s.usedAt) {
      const used = daysSince(s.usedAt, now);
      if (used >= AVIS_JOURS.min && used <= AVIS_JOURS.max) {
        avisCandidates.push({ ...base, reason: 'avis', days: used, detail: `${offerLabel} · code utilisé`, why: `Code utilisé le ${formatDateTime(s.usedAt)}.`, message: avisMessage(name) });
      }
      continue;
    }
    if (status !== 'valide' && status !== 'bientot') continue;
    if (status === 'bientot') {
      push({
        ...base,
        reason: 'expire',
        days: daysSince(s.receivedAt, now),
        detail: offerLabel,
        why: `Code valable jusqu’au ${s.validUntil}, pas encore utilisé.`,
        message: `${firstName(name)}\n\nVotre code de réduction ${s.reference} est valable jusqu’au ${s.validUntil}. Un projet de serrurerie, de vitrerie ou de fermeture ? C’est le moment d’en profiter : appelez-nous ou passez en boutique.${SIGNATURE}`,
      });
    } else if (daysSince(s.receivedAt, now) >= 30) {
      const days = daysSince(s.receivedAt, now);
      push({
        ...base,
        reason: 'inutilise',
        days,
        detail: offerLabel,
        why: `Inscrit il y a ${days} jours, code pas encore utilisé (valable jusqu’au ${s.validUntil}).`,
        message: `${firstName(name)}\n\nVous êtes inscrit à notre offre (code ${s.reference}, valable jusqu’au ${s.validUntil}). Avez-vous un projet pour lequel nous pouvons vous aider ?${SIGNATURE}`,
      });
    }
  }

  // Un seul avis demandé par personne (même téléphone), même si elle a une demande et une inscription.
  const seenPhones = new Set<string>();
  for (const c of avisCandidates) if (done[`${c.reference}:avis`] && phoneKey(c.phone)) seenPhones.add(phoneKey(c.phone));
  for (const c of [...avisCandidates].sort((a, b) => a.days - b.days)) {
    const ph = phoneKey(c.phone);
    if (ph && seenPhones.has(ph)) continue;
    if (!c.phone && !c.email) continue;
    if (ph) seenPhones.add(ph);
    push(c);
  }

  const order: RelanceReason[] = RELANCE_GROUPS.map((g) => g.reason);
  return out.sort((a, b) => order.indexOf(a.reason) - order.indexOf(b.reason) || b.days - a.days);
}

/** Numéro au format international pour SMS / WhatsApp (06… → +336…). */
export function intlPhone(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) return digits;
  if (digits.startsWith('00')) return `+${digits.slice(2)}`;
  if (digits.startsWith('0') && digits.length === 10) return `+33${digits.slice(1)}`;
  return digits;
}

export function smsHref(phone: string, message: string): string {
  return `sms:${intlPhone(phone)}?&body=${encodeURIComponent(message)}`;
}

export function whatsappHref(phone: string, message: string): string {
  return `https://wa.me/${intlPhone(phone).replace('+', '')}?text=${encodeURIComponent(message)}`;
}

export function mailHref(email: string, reference: string, message: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(`Serrurerie de la République — ${reference}`)}&body=${encodeURIComponent(message)}`;
}
