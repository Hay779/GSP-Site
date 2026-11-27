/**
 * Compteur de visites du site (sans cookie, sans identifiant) : envoie à /api/stat.php
 * la page vue, et pour une arrivée sur le site sa provenance générale et le type d'appareil.
 * Rien n'est lu ni écrit sur l'appareil du visiteur. Les totaux s'affichent dans /gestion (« Suivi du site »).
 */
import { slugFromSearch } from './offers';

export type VisitSource = 'direct' | 'google' | 'bing' | 'autre_moteur' | 'annuaire' | 'reseau_social' | 'qr' | 'autre_site';

export const SOURCE_LABELS: Readonly<Record<VisitSource, string>> = {
  google: 'Google',
  direct: 'Accès direct (adresse tapée, favori)',
  qr: 'QR code / flyer',
  annuaire: 'Annuaires (PagesJaunes, Yelp…)',
  reseau_social: 'Réseaux sociaux',
  bing: 'Bing',
  autre_moteur: 'Autres moteurs de recherche',
  autre_site: 'Autres sites',
};

const SEARCH = /(^|\.)(duckduckgo|yahoo|qwant|ecosia|yandex|startpage|lilo|brave)\./;
const SOCIAL = /(^|\.)(facebook|fb|instagram|linkedin|tiktok|pinterest|youtube|snapchat|whatsapp|threads)\.|(^|\.)(t\.co|x\.com|twitter\.com|lnkd\.in)$/;
const DIRECTORIES =
  /(^|\.)(pagesjaunes|solocal|yelp|cylex|hoodspot|118712|118000|kompass|justacote|mappy|waze|trustup|serrurier24|houzz|starofservice|habitatpresto|travaux|tripadvisor|infobel|annuaire|cybo|tupalo|brownbook|hotfrog|europages|societe|pappers|lafourchette|fr\.foursquare|foursquare)\.|maps\.apple\.com$/;

/** Provenance d'une arrivée sur le site. */
export function classifySource(referrer: string, path: string, search: string, ownHost: string): VisitSource {
  const utm = new URLSearchParams(search).get('utm_source')?.toLowerCase() ?? '';
  if (utm === 'qr' || utm === 'flyer' || utm === 'affiche') return 'qr';
  let host = '';
  try {
    host = referrer ? new URL(referrer).hostname.toLowerCase() : '';
  } catch {
    host = '';
  }
  if (!host || host === ownHost) return path.startsWith('/offre') ? 'qr' : 'direct';
  if (/(^|\.)google\./.test(host)) return 'google';
  if (/(^|\.)bing\.com$/.test(host)) return 'bing';
  if (SEARCH.test(host)) return 'autre_moteur';
  if (SOCIAL.test(host)) return 'reseau_social';
  if (DIRECTORIES.test(host)) return 'annuaire';
  return 'autre_site';
}

function isDevPreview(): boolean {
  return Boolean((import.meta as { env?: { DEV?: boolean } }).env?.DEV);
}

/** Campagne de publicité de l'adresse (« ?c=… » ou « utm_campaign=… »), si elle est valide. */
export function campaignFromSearch(search: string): string {
  const params = new URLSearchParams(search);
  const c = (params.get('c') ?? params.get('utm_campaign') ?? '').toLowerCase();
  return /^[a-z0-9-]{1,40}$/.test(c) ? c : '';
}

let firstHit = true;
let lastPath = '';

/** À appeler à chaque changement de page. */
export function recordVisit(): void {
  if (typeof window === 'undefined' || isDevPreview()) return;
  const { pathname, search, hostname } = window.location;
  const path = pathname.replace(/\/+$/, '') || '/';
  if (path.startsWith('/gestion') || new URLSearchParams(search).get('apercu') === '1') return;
  const key = path + search;
  if (key === lastPath) return;
  lastPath = key;

  let entry = false;
  let source: VisitSource = 'direct';
  if (firstHit) {
    firstHit = false;
    let refHost = '';
    try {
      refHost = document.referrer ? new URL(document.referrer).hostname : '';
    } catch {
      refHost = '';
    }
    entry = refHost !== hostname;
    source = classifySource(document.referrer, path, search, hostname);
  }
  const payload: Record<string, unknown> = { p: path.toLowerCase().slice(0, 80), e: entry };
  if (entry) {
    payload.s = source;
    const campaign = campaignFromSearch(search);
    if (campaign) payload.c = campaign;
    payload.m = window.matchMedia?.('(pointer: coarse)').matches === true;
  }
  if (path === '/offre') payload.o = slugFromSearch(search);
  try {
    void fetch('/api/stat.php', {
      method: 'POST',
      keepalive: true,
      credentials: 'omit',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => undefined);
  } catch {
    // Le compteur ne doit jamais gêner la visite.
  }
}
