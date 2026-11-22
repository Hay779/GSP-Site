/**
 * Routeur minimal du site : page d'accueil + une page par domaine métier.
 *
 * Deux modes :
 * - « history » (production) : vraies adresses, ex. /vitrerie-miroiterie
 *   (l'hébergeur doit renvoyer index.html pour toutes les adresses).
 * - « hash » (aperçus) : ex. #vitrerie-miroiterie, fonctionne partout sans configuration.
 */

export type DomainId = 'serrurerie' | 'vitrerie' | 'menuiserie' | 'fermetures';

export type RouterMode = 'history' | 'hash';

/** Pages thématiques (hors domaines métiers). */
export type PageId =
  | 'cles-badges'
  | 'apres-sinistre'
  | 'agences-contact'
  | 'zone-intervention'
  | 'avis-clients'
  | 'questions-frequentes'
  | 'mentions-legales'
  | 'confidentialite';

export type Route =
  | { readonly kind: 'home' }
  | { readonly kind: 'domain'; readonly id: DomainId }
  | { readonly kind: 'page'; readonly id: PageId };

export const DOMAIN_SLUGS: Readonly<Record<DomainId, string>> = {
  serrurerie: 'serrurerie-portes-blindees',
  vitrerie: 'vitrerie-miroiterie',
  menuiserie: 'menuiserie',
  fermetures: 'fermetures',
};

export const PAGE_SLUGS: Readonly<Record<PageId, string>> = {
  'cles-badges': 'cles-badges',
  'apres-sinistre': 'apres-sinistre',
  'agences-contact': 'agences-contact',
  'zone-intervention': 'zone-intervention',
  'avis-clients': 'avis-clients',
  'questions-frequentes': 'questions-frequentes',
  'mentions-legales': 'mentions-legales',
  confidentialite: 'confidentialite',
};

export const HOME_ROUTE: Route = { kind: 'home' };

function cleanSlug(slug: string): string {
  return slug.trim().toLowerCase().replace(/^\/+|\/+$/g, '');
}

function domainIdFromSlug(slug: string): DomainId | null {
  const clean = cleanSlug(slug);
  for (const [id, value] of Object.entries(DOMAIN_SLUGS) as [DomainId, string][]) {
    if (value === clean) {
      return id;
    }
  }
  return null;
}

/** Détermine la page à afficher à partir de l'adresse courante. */
export function parseLocation(pathname: string, hash: string, mode: RouterMode): Route {
  const source = mode === 'hash' ? hash.replace(/^#/, '') : pathname;
  const domainId = domainIdFromSlug(source);
  if (domainId) {
    return { kind: 'domain', id: domainId };
  }
  const clean = cleanSlug(source);
  for (const [id, value] of Object.entries(PAGE_SLUGS) as [PageId, string][]) {
    if (value === clean) {
      return { kind: 'page', id };
    }
  }
  return HOME_ROUTE;
}

/** Adresse d'une page thématique. */
export function hrefForPage(id: PageId, mode: RouterMode): string {
  return mode === 'hash' ? `#${PAGE_SLUGS[id]}` : `/${PAGE_SLUGS[id]}`;
}

/** Adresse d'une page de domaine. */
export function hrefForDomain(id: DomainId, mode: RouterMode): string {
  return mode === 'hash' ? `#${DOMAIN_SLUGS[id]}` : `/${DOMAIN_SLUGS[id]}`;
}

/**
 * Adresse d'une section de la page d'accueil, selon la page où l'on se trouve.
 * Depuis l'accueil, un simple ancre suffit ; depuis une page métier en mode
 * « history », il faut revenir à la racine.
 */
export function hrefForHomeSection(sectionId: string, current: Route, mode: RouterMode): string {
  if (current.kind === 'home' || mode === 'hash') {
    return `#${sectionId}`;
  }
  return `/#${sectionId}`;
}

/** Adresse de la page d'accueil. */
export function hrefForHome(mode: RouterMode): string {
  return mode === 'hash' ? '#' : '/';
}

export function routesEqual(a: Route, b: Route): boolean {
  if (a.kind !== b.kind) {
    return false;
  }
  if (a.kind === 'home') {
    return true;
  }
  return 'id' in b && a.id === b.id;
}
