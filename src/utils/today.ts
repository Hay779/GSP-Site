/**
 * Page « Aujourd'hui » de l'espace /gestion : le résumé à regarder chaque matin
 * (demandes à rappeler, relances, inscriptions de la semaine, visites d'hier).
 */
import { signupStatus, type DayStats, type OfferSignup, type SiteRequest } from './gestion';
import type { Relance } from './relances';

export interface TodaySummary {
  /** Demandes « Nouvelle », les plus récentes d'abord. */
  readonly newRequests: readonly SiteRequest[];
  /** Relances à faire, dans l'ordre de la rubrique Relances (avis Google à part). */
  readonly relances: readonly Relance[];
  readonly reviewRequests: number;
  readonly requestsWeek: number;
  readonly requestsPrevWeek: number;
  readonly signupsWeek: number;
  readonly signupsPrevWeek: number;
  /** Codes de réduction utilisés ces 30 derniers jours (= clients venus grâce aux offres). */
  readonly codesUsed30: number;
  /** null : pas encore de chiffres (compteur démarré le 27/11/2026, ou erreur). */
  readonly visitsYesterday: number | null;
  readonly visitsDayBefore: number | null;
}

const DAY = 24 * 3600 * 1000;

export function localDay(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Nombre de jours entre la date et maintenant (0 = moins de 24 h). */
function age(iso: string, now: Date): number {
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? Infinity : (now.getTime() - t) / DAY;
}

export function buildToday(
  requests: readonly SiteRequest[],
  signups: readonly OfferSignup[],
  relances: readonly Relance[],
  stats: readonly DayStats[] | null,
  now: Date = new Date()
): TodaySummary {
  const inWeek = (iso: string) => age(iso, now) < 7;
  const inPrevWeek = (iso: string) => age(iso, now) >= 7 && age(iso, now) < 14;
  const visits = (offset: number): number | null => {
    if (!stats) return null;
    const day = localDay(new Date(now.getTime() - offset * DAY));
    const found = stats.find((d) => d.day === day);
    return found ? found.entries : stats.length > 0 && stats.every((d) => d.day > day) ? null : 0;
  };
  return {
    newRequests: requests.filter((r) => r.status === 'nouvelle').sort((a, b) => b.receivedAt.localeCompare(a.receivedAt)),
    relances: relances.filter((r) => r.reason !== 'avis'),
    reviewRequests: relances.filter((r) => r.reason === 'avis').length,
    requestsWeek: requests.filter((r) => inWeek(r.receivedAt)).length,
    requestsPrevWeek: requests.filter((r) => inPrevWeek(r.receivedAt)).length,
    signupsWeek: signups.filter((s) => inWeek(s.receivedAt)).length,
    signupsPrevWeek: signups.filter((s) => inPrevWeek(s.receivedAt)).length,
    codesUsed30: signups.filter((s) => signupStatus(s, now) === 'utilise' && s.usedAt && age(s.usedAt, now) < 30).length,
    visitsYesterday: visits(1),
    visitsDayBefore: visits(2),
  };
}

/** « Bonjour » le matin, « Bon après-midi », « Bonsoir ». */
export function greeting(now: Date = new Date()): string {
  const h = now.getHours();
  return h < 12 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir';
}
