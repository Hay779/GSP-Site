import { useCallback, useEffect, useRef, useState } from 'react';
import { HOME_ROUTE, parseLocation, routesEqual, type Route, type RouterMode } from '../utils/router';

/** Mode choisi à la compilation : VITE_ROUTER_MODE=hash pour les aperçus. */
export const ROUTER_MODE: RouterMode =
  import.meta.env.VITE_ROUTER_MODE === 'hash' ? 'hash' : 'history';

function currentRoute(): Route {
  if (typeof window === 'undefined') {
    return HOME_ROUTE;
  }
  return parseLocation(window.location.pathname, window.location.hash, ROUTER_MODE);
}

/** Fait défiler jusqu'à l'ancre de l'adresse (ou en haut de page). */
function scrollToHashOrTop(route: Route) {
  scrollOnce(route);
  // La mise en page de l'accueil peut encore bouger (images, animations) :
  // on recale une seconde fois.
  window.setTimeout(() => scrollOnce(route), 400);
}

function scrollOnce(route: Route) {
  const hash = window.location.hash.replace(/^#/, '');
  const target = route.kind === 'home' && hash ? document.getElementById(decodeURIComponent(hash)) : null;
  if (target) {
    target.scrollIntoView({ behavior: 'instant', block: 'start' });
  } else {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
}

export function useRouter() {
  const [route, setRoute] = useState<Route>(currentRoute);
  const routeRef = useRef<Route>(route);
  routeRef.current = route;

  // Change de page : défilement en haut (ou jusqu'à la section demandée).
  const applyLocation = useCallback((scroll: boolean) => {
    const next = currentRoute();
    setRoute((prev) => (routesEqual(prev, next) ? prev : next));
    if (scroll) {
      // Laisse React afficher la nouvelle page avant de défiler.
      window.requestAnimationFrame(() => window.setTimeout(() => scrollToHashOrTop(next), 30));
    }
  }, []);

  const navigate = useCallback(
    (href: string) => {
      if (ROUTER_MODE === 'hash') {
        const nextHash = href.startsWith('#') ? href : `#${href.replace(/^\/+/, '')}`;
        if (window.location.hash === nextHash) {
          applyLocation(true);
        } else {
          window.location.hash = nextHash === '#' ? '' : nextHash;
        }
        return;
      }
      window.history.pushState(null, '', href);
      applyLocation(true);
    },
    [applyLocation]
  );

  useEffect(() => {
    // Mode « history » : boutons précédent / suivant du navigateur.
    // (En mode « hash », le navigateur émet aussi « popstate » sur chaque ancre :
    // on laisse alors « hashchange » tout gérer, sinon la page change trop tôt.)
    const onPop = () => {
      if (ROUTER_MODE === 'history') {
        applyLocation(false);
      }
    };
    const onHash = () => {
      if (ROUTER_MODE !== 'hash') {
        return;
      }
      const before = routeRef.current;
      const next = currentRoute();
      setRoute((prev) => (routesEqual(prev, next) ? prev : next));
      // Changement de page via l'ancre (mode aperçu) : on remet le défilement en ordre.
      if (!routesEqual(before, next)) {
        window.requestAnimationFrame(() => window.setTimeout(() => scrollToHashOrTop(next), 30));
      }
    };
    window.addEventListener('popstate', onPop);
    window.addEventListener('hashchange', onHash);
    return () => {
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('hashchange', onHash);
    };
  }, [applyLocation]);

  // En mode « history » : les liens internes qui changent de page sont gérés
  // sans recharger le site.
  useEffect(() => {
    if (ROUTER_MODE !== 'history') {
      return;
    }
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      const anchor = (event.target as Element | null)?.closest?.('a');
      if (!anchor || anchor.target || anchor.hasAttribute('download')) {
        return;
      }
      const href = anchor.getAttribute('href');
      if (!href || !href.startsWith('/')) {
        return;
      }
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) {
        return;
      }
      if (url.pathname === window.location.pathname) {
        return; // même page : simple ancre, comportement natif
      }
      event.preventDefault();
      navigate(url.pathname + url.hash);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [navigate]);

  return { route, navigate };
}
