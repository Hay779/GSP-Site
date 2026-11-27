/**
 * Référencement : titre, description, adresse canonique, partage (Open Graph / X)
 * et données structurées (JSON-LD) de chaque page.
 *
 * ➜ SITE_URL : adresse définitive du site. À confirmer une fois le nom de domaine
 *   acheté chez OVH (peut aussi être fournie au build via VITE_SITE_URL).
 */
import { resolvePageDefinition, type PageDefinition } from '../data/pages';
import { CURRENT_PROMOTION, isPromotionActive } from '../data/promotions';
import { AGENCIES_CONFIG, DOMAINS_CONFIG, FAQ_CONFIG, type FaqItem } from '../data/sectionsContent';
import { DOMAIN_SLUGS, PAGE_SLUGS, type PageId, type Route } from './router';

export const SITE_URL = ((import.meta.env?.VITE_SITE_URL as string | undefined) || 'https://www.serrurerierepublique.fr').replace(/\/+$/, '');

export const SITE_NAME = 'Serrurerie de la République';
const DEFAULT_IMAGE = '/src/assets/images/hero_serrurier_marseille_1795288791942.jpg';
const LOGO = '/src/assets/images/logo_republique_dark.png';

export const HOME_TITLE = 'Serrurier Marseille 2e & 6e | Serrurerie de la République';
export const HOME_DESCRIPTION =
  'Serrurier à Marseille : dépannage, ouverture de porte, serrures, doubles de clés et badges, vitrerie et fermetures. Boutiques République (2e) et Rome (6e).';

export interface SeoData {
  readonly title: string;
  readonly description: string;
  /** Chemin canonique (ex. « /vitrerie-miroiterie »). */
  readonly path: string;
  readonly image: string;
  readonly noindex: boolean;
  readonly jsonLd: readonly Record<string, unknown>[];
}

export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}

/** Chemin canonique d'une route (toujours en mode « history »). */
export function pathForRoute(route: Route): string {
  switch (route.kind) {
    case 'home':
      return '/';
    case 'domain':
      return `/${DOMAIN_SLUGS[route.id]}`;
    case 'page':
      return `/${PAGE_SLUGS[route.id]}`;
    default:
      return '/404';
  }
}

/** Toutes les adresses indexables (sitemap, pré-rendu). */
export function indexableRoutes(): readonly Route[] {
  const domains = DOMAINS_CONFIG.items.map((d) => ({ kind: 'domain', id: d.id }) as Route);
  const pages = (Object.keys(PAGE_SLUGS) as PageId[]).map((id) => ({ kind: 'page', id }) as Route);
  return [{ kind: 'home' }, ...domains, ...pages];
}

/* ------------------------------------------------------------------ */
/* Données structurées                                                 */
/* ------------------------------------------------------------------ */

const OPENING_HOURS = [
  {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    opens: '09:00',
    closes: '19:00',
  },
];

const ORG_ID = `${SITE_URL}/#organisation`;

/** Coordonnées GPS des boutiques (Base Adresse Nationale, api-adresse.data.gouv.fr). */
const AGENCY_GEO: Readonly<Record<string, { readonly latitude: number; readonly longitude: number }>> = {
  republique: { latitude: 43.300116, longitude: 5.371197 },
  rome: { latitude: 43.289255, longitude: 5.381727 },
};

function organization(): Record<string, unknown> {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE_NAME,
    legalName: 'SERRURERIE DE LA REPUBLIQUE',
    url: `${SITE_URL}/`,
    logo: absoluteUrl(LOGO),
    image: absoluteUrl(LOGO),
    telephone: '+33491905165',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '48 rue de la République',
      postalCode: '13002',
      addressLocality: 'Marseille',
      addressRegion: 'Provence-Alpes-Côte d’Azur',
      addressCountry: 'FR',
    },
    vatID: 'FR93106157118',
    taxID: '10615711800014',
    founder: { '@type': 'Person', name: 'Grigor Galstyan' },
    sameAs: ['https://www.google.com/maps?cid=8005087096552407541'],
  };
}

function agencies(): Record<string, unknown>[] {
  return AGENCIES_CONFIG.agencies.map((agency) => {
    const [street, cityLine] = agency.addressLines;
    const postalCode = cityLine.match(/\d{5}/)?.[0] ?? '';
    return {
      '@type': 'Locksmith',
      '@id': `${SITE_URL}/#agence-${agency.id}`,
      name: `${SITE_NAME} — ${agency.name}`,
      url: `${SITE_URL}/${PAGE_SLUGS['agences-contact']}`,
      image: absoluteUrl(agency.imageSrc || DEFAULT_IMAGE),
      telephone: `+33${agency.phoneDisplay.replace(/\D/g, '').slice(1)}`,
      priceRange: '€€',
      address: {
        '@type': 'PostalAddress',
        streetAddress: street,
        postalCode,
        addressLocality: 'Marseille',
        addressRegion: 'Provence-Alpes-Côte d’Azur',
        addressCountry: 'FR',
      },
      ...(AGENCY_GEO[agency.id] ? { geo: { '@type': 'GeoCoordinates', ...AGENCY_GEO[agency.id] } } : {}),
      openingHoursSpecification: OPENING_HOURS,
      areaServed: { '@type': 'City', name: 'Marseille' },
      hasMap: agency.directionsUrl,
      parentOrganization: { '@id': ORG_ID },
    };
  });
}

function website(): Record<string, unknown> {
  return {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#site`,
    url: `${SITE_URL}/`,
    name: SITE_NAME,
    inLanguage: 'fr-FR',
    publisher: { '@id': ORG_ID },
  };
}

function breadcrumb(items: readonly { name: string; path: string }[]): Record<string, unknown> {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

function faqPage(items: readonly FaqItem[]): Record<string, unknown> {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

function service(name: string, description: string, path: string): Record<string, unknown> {
  return {
    '@type': 'Service',
    name,
    description,
    url: absoluteUrl(path),
    provider: { '@id': ORG_ID },
    areaServed: { '@type': 'City', name: 'Marseille' },
  };
}

function faqItemsOf(page: PageDefinition): FaqItem[] {
  return page.blocks.flatMap((block) => (block.type === 'faq' ? [...block.items] : []));
}

const PRO_CHILDREN: readonly PageId[] = ['pro-syndics', 'pro-assureurs', 'pro-immobilier', 'devenir-partenaire'];

/* ------------------------------------------------------------------ */

const STATIC_META: Partial<Record<PageId, { title: string; description: string; name: string }>> = {
  devis: {
    title: 'Demander un devis serrurier à Marseille | Serrurerie de la République',
    description:
      'Décrivez votre besoin en serrurerie, vitrerie, menuiserie, fermetures, clés ou après sinistre : nous revenons vers vous avec un devis détaillé.',
    name: 'Demander un devis',
  },
  'devenir-partenaire': {
    title: 'Devenir partenaire — Professionnels | Serrurerie de la République',
    description:
      'Syndics, assureurs, experts, agences immobilières et bailleurs : présentez-nous votre structure pour organiser une collaboration à Marseille.',
    name: 'Devenir partenaire',
  },
  offre: {
    title: 'Offre -5 % : inscription | Serrurerie de la République',
    description:
      'Inscrivez-vous pour bénéficier de -5 % sur votre premier achat ou votre première intervention, valable 5 mois après l’inscription.',
    name: 'Offre -5 %',
  },
};

/**
 * Titres (≤ 60 caractères) et descriptions (≤ 160) optimisés pour Google,
 * prioritaires sur ceux des fichiers de contenu.
 */
const META_OVERRIDES: Readonly<Record<string, { title?: string; description?: string }>> = {
  '/serrurerie-portes-blindees': { title: 'Serrurier à Marseille : serrures & portes blindées' },
  '/vitrerie-miroiterie': { title: 'Vitrier à Marseille : vitrerie & miroiterie' },
  '/menuiserie': { title: 'Menuiserie à Marseille : portes et fenêtres sur mesure' },
  '/fermetures': { title: 'Rideaux métalliques, volets, portes de garage à Marseille' },
  '/cles-badges': { title: 'Double de clés et badges à Marseille | Serrurerie République' },
  '/apres-sinistre': { title: 'Après effraction ou bris de glace à Marseille' },
  '/agences-contact': { title: 'Nos agences à Marseille (2e et 6e) : adresses et contact' },
  '/zone-intervention': {
    title: 'Zone d’intervention : serrurier Marseille et alentours',
    description: 'Serrurier, vitrier et menuisier dans tous les arrondissements de Marseille et les communes voisines, depuis nos boutiques République (2e) et Rome (6e).',
  },
  '/avis-clients': { title: 'Avis clients | Serrurerie de la République, Marseille' },
  '/questions-frequentes': { title: 'Questions fréquentes | Serrurerie de la République' },
  '/devis': { title: 'Devis serrurier à Marseille | Serrurerie de la République' },
  '/professionnels': { title: 'Serrurier pour les professionnels à Marseille' },
  '/syndics-coproprietes': {
    title: 'Serrurier pour syndics et copropriétés à Marseille',
    description: 'Syndics et gestionnaires : serrurerie, contrôle d’accès, vitrerie et fermetures pour vos immeubles à Marseille, avec devis détaillé et compte rendu.',
  },
  '/assureurs-experts': { title: 'Assureurs et experts : travaux après sinistre à Marseille' },
  '/agences-immobilieres-bailleurs': {
    title: 'Serrurier pour agences immobilières et bailleurs à Marseille',
    description: 'Agences immobilières et bailleurs : changement de serrure entre locataires, doubles de clés, réparations et mise en sécurité de vos biens à Marseille.',
  },
  '/devenir-partenaire': { title: 'Devenir partenaire | Serrurerie de la République' },
};

function withOverrides(seo: SeoData): SeoData {
  const o = META_OVERRIDES[seo.path];
  return o ? { ...seo, title: o.title ?? seo.title, description: o.description ?? seo.description } : seo;
}

/** Tout ce qu'il faut pour le <head> d'une route. */
export function seoForRoute(route: Route): SeoData {
  return withOverrides(baseSeoForRoute(route));
}

function baseSeoForRoute(route: Route): SeoData {
  const path = pathForRoute(route);
  const base = [organization(), website(), ...agencies()];

  if (route.kind === 'home') {
    return {
      title: HOME_TITLE,
      description: HOME_DESCRIPTION,
      path,
      image: DEFAULT_IMAGE,
      noindex: false,
      jsonLd: [...base, faqPage(FAQ_CONFIG.items)],
    };
  }

  if (route.kind === 'notFound') {
    return {
      title: 'Page introuvable | Serrurerie de la République',
      description:
        'Cette page n’existe pas ou a été déplacée. Retrouvez nos services de serrurerie, vitrerie, menuiserie et fermetures à Marseille.',
      path,
      image: DEFAULT_IMAGE,
      noindex: true,
      jsonLd: [],
    };
  }

  const crumbs: { name: string; path: string }[] = [{ name: 'Accueil', path: '/' }];
  if (route.kind === 'page' && PRO_CHILDREN.includes(route.id)) {
    crumbs.push({ name: 'Professionnels', path: `/${PAGE_SLUGS.professionnels}` });
  }

  // Promotions : indexée pendant l'opération, « Pas d'offre en ce moment » + noindex le reste du temps.
  if (route.kind === 'page' && route.id === 'promotions') {
    const promo = CURRENT_PROMOTION;
    const active = isPromotionActive(promo);
    crumbs.push({ name: active ? promo.name : 'Promotions', path });
    return active
      ? {
          title: `${promo.name} Marseille : jusqu’à -25 % sur vos projets`,
          description:
            'Jusqu’à -25 % sur vos projets, -20 % portes blindées posées, 3e double de clé à -50 %, -20 % tampons. Jusqu’au 30/11, devis signé avant le 31/12.',
          path,
          image: promo.offers[0].imageSrc,
          noindex: false,
          jsonLd: [...base, breadcrumb(crumbs), faqPage(promo.faq)],
        }
      : {
          title: 'Promotions | Serrurerie de la République',
          description: 'Pas d’offre en ce moment. Retrouvez nos services de serrurerie à Marseille et demandez un devis.',
          path,
          image: DEFAULT_IMAGE,
          noindex: true,
          jsonLd: [...base, breadcrumb(crumbs)],
        };
  }

  const fixed = route.kind === 'page' ? STATIC_META[route.id] : undefined;
  if (fixed) {
    crumbs.push({ name: fixed.name, path });
    return {
      title: fixed.title,
      description: fixed.description,
      path,
      image: DEFAULT_IMAGE,
      // /offre : réservée aux personnes qui ont le flyer (QR code), pas proposée à Google.
      noindex: route.kind === 'page' && route.id === 'offre',
      jsonLd: [...base, breadcrumb(crumbs)],
    };
  }

  const page = resolvePageDefinition(route);
  if (!page) {
    return baseSeoForRoute({ kind: 'notFound' });
  }
  crumbs.push({ name: page.hero.title.replace(/\.$/, ''), path });
  const jsonLd: Record<string, unknown>[] = [...base, breadcrumb(crumbs)];
  if (route.kind === 'domain' || (route.kind === 'page' && ['cles-badges', 'apres-sinistre'].includes(route.id))) {
    jsonLd.push(service(page.hero.title.replace(/\.$/, ''), page.seoDescription, path));
  }
  const faqs = faqItemsOf(page);
  if (faqs.length > 0) {
    jsonLd.push(faqPage(faqs));
  }
  const legal = route.kind === 'page' && (route.id === 'mentions-legales' || route.id === 'confidentialite' || route.id === 'cgv');
  return {
    title: page.seoTitle,
    description: page.seoDescription,
    path,
    image: page.hero.imageSrc || DEFAULT_IMAGE,
    noindex: legal,
    jsonLd,
  };
}

/* ------------------------------------------------------------------ */
/* Application au document                                             */
/* ------------------------------------------------------------------ */

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

/** Écrit les balises de la route dans <head> (appelé à chaque changement de page). */
export function applySeo(seo: SeoData): void {
  const url = absoluteUrl(seo.path);
  const image = absoluteUrl(seo.image);
  document.title = seo.title;
  upsertMeta('name', 'description', seo.description);
  upsertMeta('name', 'robots', seo.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large');
  upsertLink('canonical', url);
  upsertMeta('property', 'og:type', 'website');
  upsertMeta('property', 'og:locale', 'fr_FR');
  upsertMeta('property', 'og:site_name', SITE_NAME);
  upsertMeta('property', 'og:title', seo.title);
  upsertMeta('property', 'og:description', seo.description);
  upsertMeta('property', 'og:url', url);
  upsertMeta('property', 'og:image', image);
  upsertMeta('name', 'twitter:card', 'summary_large_image');
  upsertMeta('name', 'twitter:title', seo.title);
  upsertMeta('name', 'twitter:description', seo.description);
  upsertMeta('name', 'twitter:image', image);

  document.head.querySelectorAll('script[data-seo="jsonld"]').forEach((el) => el.remove());
  if (seo.jsonLd.length > 0) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.seo = 'jsonld';
    script.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': seo.jsonLd });
    document.head.appendChild(script);
  }
}

