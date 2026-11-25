/**
 * Mesure d'audience Google Analytics 4, chargée UNIQUEMENT après accord du visiteur (CNIL).
 * Sans accord : aucun script Google, aucun cookie.
 * Le choix est gardé 6 mois, puis la bannière est reproposée.
 */

/** ID de mesure GA4 (propriété « serrurerierepublique.fr », compte gspserrurerie13@gmail.com). */
export const GA_MEASUREMENT_ID: string =
  ((import.meta as { env?: { VITE_GA_ID?: string } }).env?.VITE_GA_ID ?? '').trim() || 'G-GDWWNV28B3';

export const CONSENT_STORAGE_KEY = 'sr-consentement';
export const CONSENT_DURATION_MS = 182 * 24 * 60 * 60 * 1000; // environ 6 mois
export const OPEN_CONSENT_EVENT = 'sr:ouvrir-cookies';

export interface StoredConsent {
  readonly analytics: boolean;
  readonly savedAt: number;
}

/** Lit un choix enregistré ; null s'il n'existe pas, est illisible ou a plus de 6 mois. */
export function parseConsent(raw: string | null, now: number = Date.now()): StoredConsent | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Partial<StoredConsent>;
    if (typeof data.analytics !== 'boolean' || typeof data.savedAt !== 'number') return null;
    if (now - data.savedAt > CONSENT_DURATION_MS || data.savedAt > now + 60_000) return null;
    return { analytics: data.analytics, savedAt: data.savedAt };
  } catch {
    return null;
  }
}

export function readConsent(): StoredConsent | null {
  try {
    return parseConsent(window.localStorage.getItem(CONSENT_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function saveConsent(analytics: boolean): void {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({ analytics, savedAt: Date.now() }));
  } catch {
    /* navigation privée : le choix ne sera pas mémorisé */
  }
  if (analytics) loadAnalytics();
  else removeAnalyticsCookies();
}

/** Robots (pré-rendu Playwright, Lighthouse) : ni bannière ni mesure. */
export function isAutomatedBrowser(): boolean {
  return typeof navigator !== 'undefined' && navigator.webdriver === true;
}

type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

let loaded = false;

export function loadAnalytics(): void {
  if (loaded || !GA_MEASUREMENT_ID || isAutomatedBrowser()) return;
  loaded = true;
  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, { allow_google_signals: false, allow_ad_personalization_signals: false });
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
  document.head.appendChild(script);
}

/** Retrait des cookies Google Analytics si le visiteur retire son accord. */
function removeAnalyticsCookies(): void {
  const host = window.location.hostname.replace(/^www\./, '');
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.split('=')[0]?.trim();
    if (name && (name === '_ga' || name.startsWith('_ga_'))) {
      for (const domain of ['', `; domain=.${host}`, `; domain=${window.location.hostname}`]) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain}`;
      }
    }
  }
}

/** Envoie un événement si (et seulement si) la mesure est active. */
export function trackEvent(name: string, params: Record<string, string | number> = {}): void {
  if (loaded && window.gtag) window.gtag('event', name, params);
}

/** Nom d'événement pour un lien cliqué (appel, WhatsApp), ou null. */
export function eventForHref(href: string): { name: string; params: Record<string, string> } | null {
  if (href.startsWith('tel:')) return { name: 'clic_telephone', params: { numero: href.slice(4) } };
  if (/^https:\/\/(wa\.me|api\.whatsapp\.com)\//.test(href)) return { name: 'clic_whatsapp', params: {} };
  return null;
}

/** Démarre la mesure au chargement si le visiteur l'a déjà acceptée, et suit les clics Appeler / WhatsApp. */
export function initAnalytics(): void {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID) return;
  if (readConsent()?.analytics) loadAnalytics();
  document.addEventListener(
    'click',
    (event) => {
      const link = (event.target as Element | null)?.closest?.('a[href]');
      const found = link ? eventForHref(link.getAttribute('href') ?? '') : null;
      if (found) trackEvent(found.name, { ...found.params, page: window.location.pathname });
    },
    { capture: true }
  );
}
