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

export type Route = { readonly kind: 'home' } | { readonly kind: 'domain'; readonly id: DomainId };

export const DOMAIN_SLUGS: Readonly<Record<DomainId, string>> = {
  serrurerie: 'serrurerie-portes-blindees',
  vitrerie: 'vitrerie-miroiterie',
  menuiserie: 'menuiserie',
  fermetures: 'fermetures',
};

export const HOME_ROUTE: Route = { kind: 'home' };

function domainIdFromSlug(slug: string): DomainId | null {
  const clean = slug.trim().toLowerCase().replace(/^\/+|\/+$/g, '');
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
  const id = domainIdFromSlug(source);
  return id ? { kind: 'domain', id } : HOME_ROUTE;
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
  return a.kind === 'home' || (b.kind === 'domain' && a.id === b.id);
}
