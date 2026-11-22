/**
 * Définition de toutes les pages intérieures du site, sous forme de listes de blocs.
 *
 * Pour créer ou modifier une page : on assemble des blocs existants (prestations,
 * étapes, FAQ, agences…) sans recoder la mise en page. Le rendu est assuré par
 * `components/PageRenderer.tsx`, et le test `pages.test.ts` vérifie que chaque
 * page respecte l'alternance fond clair / fond sombre.
 */
import type { QuoteDomain } from '../utils/quoteForm';
import type { DomainId, PageId, Route } from '../utils/router';
import {
  FAQ_APRES_SINISTRE,
  FAQ_CLES_BADGES,
  FAQ_FERMETURES,
  FAQ_MENUISERIE,
  FAQ_SERRURERIE,
  FAQ_VITRERIE,
  FAQ_ZONE,
} from './faqContent';
import { HERO_CONFIG } from './heroConfig';
import {
  AFTER_INCIDENT_CONFIG,
  AFTER_INCIDENT_PAGE_CONFIG,
  CONTACT_PAGE_CONFIG,
  DOMAIN_PAGE_CONFIG,
  DOMAINS_CONFIG,
  FAQ_CONFIG,
  KEYS_BADGES_CONFIG,
  KEYS_BADGES_PAGE_CONFIG,
  type DomainCardItem,
  type FaqItem,
  type KeysBadgeIconKey,
  type NumberedStep,
} from './sectionsContent';

export type BlockTone = 'light' | 'dark';

/** Bouton de l'en-tête de page. */
export type HeroAction =
  | { readonly kind: 'quote'; readonly label?: string; readonly domain?: QuoteDomain }
  | { readonly kind: 'phone' }
  | { readonly kind: 'photos'; readonly label: string }
  | { readonly kind: 'page'; readonly label: string; readonly page: PageId };

export interface PageHeroDefinition {
  readonly kicker: string;
  readonly title: string;
  readonly intro: string;
  readonly imageSrc?: string;
  readonly imagePosition?: string;
  /** En-tête réduit (pages légales). */
  readonly compact?: boolean;
  /** Libellé de la page dans le fil d'Ariane (par défaut : le titre). */
  readonly breadcrumbLabel?: string;
  /** Niveau intermédiaire du fil d'Ariane (ex. « Nos domaines »). */
  readonly breadcrumbParent?: 'domaines';
  readonly actions: readonly HeroAction[];
}

interface SectionHeading {
  readonly kicker: string;
  readonly title: string;
  readonly subtitle?: string;
}

export interface LegalArticle {
  readonly heading: string;
  readonly paragraphs: readonly string[];
  /** Information à compléter par l'entreprise. */
  readonly pending?: string;
}

/** Les blocs disponibles. Les blocs « partagés » ont un fond imposé. */
export type PageBlock =
  | ({ readonly type: 'cards'; readonly id: string; readonly tone: 'light'; readonly items: readonly string[]; readonly columns?: 2 | 4 } & SectionHeading)
  | ({ readonly type: 'steps'; readonly id: string; readonly tone: 'dark'; readonly steps: readonly NumberedStep[] } & SectionHeading)
  | ({
      readonly type: 'services';
      readonly id: string;
      readonly tone: 'light';
      readonly services: readonly { readonly icon: KeysBadgeIconKey; readonly title: string; readonly text: string }[];
    } & SectionHeading)
  | ({
      readonly type: 'faq';
      readonly id: string;
      readonly tone: BlockTone;
      readonly items: readonly FaqItem[];
      /** Masque le rappel devis / téléphone (page qui enchaîne plusieurs FAQ). */
      readonly hideContact?: boolean;
    } & SectionHeading)
  | ({ readonly type: 'insurance'; readonly id: string; readonly tone: 'dark' } & SectionHeading)
  | ({ readonly type: 'domains'; readonly id: string; readonly tone: 'light'; readonly excludeId?: DomainId } & SectionHeading)
  | ({ readonly type: 'contactChannels'; readonly id: string; readonly tone: 'light' } & SectionHeading)
  | ({ readonly type: 'legal'; readonly id: string; readonly tone: 'light'; readonly articles: readonly LegalArticle[] } & SectionHeading)
  | ({ readonly type: 'cta'; readonly id: string; readonly tone: 'dark' } & SectionHeading)
  /* Sections partagées avec l'accueil (fond fixe) */
  | { readonly type: 'urgency' }
  | { readonly type: 'agencies' }
  | { readonly type: 'zone' }
  | { readonly type: 'reviews' };

export interface PageDefinition {
  readonly seoTitle: string;
  readonly seoDescription: string;
  readonly hero: PageHeroDefinition;
  readonly blocks: readonly PageBlock[];
}

/** Fond d'un bloc : « band » = bandeau neutre (urgence) qui peut suivre n'importe quel bloc. */
export function blockTone(block: PageBlock): BlockTone | 'band' {
  switch (block.type) {
    case 'urgency':
      return 'band';
    case 'agencies':
    case 'reviews':
      return 'light';
    case 'zone':
      return 'dark';
    default:
      return block.tone;
  }
}

/* ------------------------------------------------------------------ */
/* Blocs réutilisables                                                 */
/* ------------------------------------------------------------------ */

const CTA_BLOCK: PageBlock = {
  type: 'cta',
  id: 'page-cta',
  tone: 'dark',
  kicker: 'Un projet, une urgence ?',
  title: 'Parlons-en.',
  subtitle: 'Appelez-nous ou décrivez votre besoin : nous revenons vers vous rapidement.',
};

function faqBlock(
  id: string,
  tone: BlockTone,
  items: readonly FaqItem[],
  title = 'Vos questions.',
  options: { readonly hideContact?: boolean; readonly kicker?: string } = {}
): PageBlock {
  return {
    type: 'faq',
    id,
    tone,
    kicker: options.kicker ?? 'Questions fréquentes',
    title,
    items,
    hideContact: options.hideContact,
  };
}

/** Groupe de la page « Questions fréquentes » (sans rappel de contact répété). */
function faqGroup(id: string, tone: BlockTone, items: readonly FaqItem[], title: string, kicker: string): PageBlock {
  return faqBlock(id, tone, items, title, { hideContact: true, kicker });
}

/* ------------------------------------------------------------------ */
/* Pages métiers (générées à partir des domaines)                       */
/* ------------------------------------------------------------------ */

export const DOMAIN_FAQS: Readonly<Record<DomainId, readonly FaqItem[]>> = {
  serrurerie: FAQ_SERRURERIE,
  vitrerie: FAQ_VITRERIE,
  menuiserie: FAQ_MENUISERIE,
  fermetures: FAQ_FERMETURES,
};

export function buildDomainPage(domain: DomainCardItem): PageDefinition {
  const c = DOMAIN_PAGE_CONFIG;
  return {
    seoTitle: domain.seoTitle,
    seoDescription: domain.seoDescription,
    hero: {
      kicker: domain.categoryTag,
      title: domain.title,
      intro: domain.pageIntro,
      imageSrc: domain.imageSrc,
      breadcrumbParent: 'domaines',
      actions: [{ kind: 'quote', domain: domain.quoteDomain }, { kind: 'phone' }],
    },
    blocks: [
      {
        type: 'cards',
        id: 'page-prestations',
        tone: 'light',
        kicker: c.prestationsKicker,
        title: c.prestationsTitle,
        subtitle: domain.summary,
        items: domain.prestations,
      },
      { type: 'steps', id: 'page-methode', tone: 'dark', kicker: c.methodKicker, title: c.methodTitle, steps: c.methodSteps },
      {
        type: 'domains',
        id: 'page-autres-domaines',
        tone: 'light',
        kicker: c.otherDomainsKicker,
        title: c.otherDomainsTitle,
        excludeId: domain.id,
      },
      faqBlock('page-faq', 'dark', DOMAIN_FAQS[domain.id], `Vos questions en ${domain.title.toLowerCase()}.`),
      { type: 'urgency' },
      { type: 'agencies' },
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Pages thématiques                                                   */
/* ------------------------------------------------------------------ */

const LEGAL_MENTIONS: readonly LegalArticle[] = [
  {
    heading: 'Éditeur du site',
    paragraphs: ['Serrurerie de la République — 48 rue de la République, 13002 Marseille.', 'Téléphone : 04 91 90 51 65.'],
    pending: 'Forme juridique, capital social, SIRET, RCS et responsable de la publication à compléter.',
  },
  {
    heading: 'Hébergement',
    paragraphs: [],
    pending: 'Nom, raison sociale, adresse et contact de l’hébergeur à compléter.',
  },
  {
    heading: 'Propriété intellectuelle',
    paragraphs: [
      'L’ensemble des contenus de ce site (textes, visuels, logo) est protégé. Toute reproduction sans autorisation préalable est interdite.',
    ],
  },
];

const LEGAL_PRIVACY: readonly LegalArticle[] = [
  {
    heading: 'Données collectées',
    paragraphs: [
      'Les informations transmises via les formulaires (demande de devis, envoi de photos après sinistre) sont destinées uniquement au traitement de votre demande par Serrurerie de la République.',
    ],
  },
  {
    heading: 'Conservation et droits (RGPD)',
    paragraphs: [
      'Vous disposez d’un droit d’accès, de rectification et de suppression de vos données.',
    ],
    pending: 'Durée de conservation et adresse e-mail dédiée à l’exercice des droits à compléter.',
  },
  {
    heading: 'Cookies',
    paragraphs: [],
    pending: 'Politique cookies à compléter selon les outils utilisés (mesure d’audience, cartes, etc.).',
  },
];

/** Pages assemblées à partir de blocs (la page /devis a son propre composant). */
export type BlockPageId = Exclude<PageId, 'devis'>;

export const THEMATIC_PAGES: Readonly<Record<BlockPageId, PageDefinition>> = {
  'cles-badges': {
    seoTitle: KEYS_BADGES_PAGE_CONFIG.seoTitle,
    seoDescription: KEYS_BADGES_PAGE_CONFIG.seoDescription,
    hero: {
      kicker: KEYS_BADGES_PAGE_CONFIG.kicker,
      title: KEYS_BADGES_PAGE_CONFIG.title,
      intro: KEYS_BADGES_PAGE_CONFIG.intro,
      imageSrc: KEYS_BADGES_CONFIG.imageSrc,
      imagePosition: '65% 45%',
      actions: [{ kind: 'page', label: 'Trouver une agence', page: 'agences-contact' }, { kind: 'phone' }],
    },
    blocks: [
      {
        type: 'services',
        id: 'page-services',
        tone: 'light',
        kicker: KEYS_BADGES_PAGE_CONFIG.servicesKicker,
        title: KEYS_BADGES_PAGE_CONFIG.servicesTitle,
        services: KEYS_BADGES_PAGE_CONFIG.services,
      },
      {
        type: 'steps',
        id: 'page-etapes',
        tone: 'dark',
        kicker: KEYS_BADGES_PAGE_CONFIG.stepsKicker,
        title: KEYS_BADGES_PAGE_CONFIG.stepsTitle,
        steps: KEYS_BADGES_PAGE_CONFIG.steps,
      },
      faqBlock('page-faq', 'light', FAQ_CLES_BADGES),
      { type: 'urgency' },
      { type: 'agencies' },
    ],
  },

  'apres-sinistre': {
    seoTitle: AFTER_INCIDENT_PAGE_CONFIG.seoTitle,
    seoDescription: AFTER_INCIDENT_PAGE_CONFIG.seoDescription,
    hero: {
      kicker: AFTER_INCIDENT_PAGE_CONFIG.kicker,
      title: AFTER_INCIDENT_PAGE_CONFIG.title,
      breadcrumbLabel: 'Après sinistre',
      intro: AFTER_INCIDENT_PAGE_CONFIG.intro,
      imageSrc: AFTER_INCIDENT_CONFIG.imageSrc,
      imagePosition: '70% 35%',
      actions: [
        { kind: 'quote', label: AFTER_INCIDENT_CONFIG.primaryCtaLabel, domain: 'Après sinistre' },
        { kind: 'photos', label: AFTER_INCIDENT_CONFIG.secondaryCtaLabel },
      ],
    },
    blocks: [
      {
        type: 'cards',
        id: 'page-accompagnement',
        tone: 'light',
        kicker: AFTER_INCIDENT_PAGE_CONFIG.stepsKicker,
        title: AFTER_INCIDENT_PAGE_CONFIG.stepsTitle,
        items: AFTER_INCIDENT_CONFIG.steps.map((step) => step.label),
        columns: 4,
      },
      {
        type: 'insurance',
        id: 'page-assurance',
        tone: 'dark',
        kicker: AFTER_INCIDENT_PAGE_CONFIG.insuranceKicker,
        title: AFTER_INCIDENT_PAGE_CONFIG.insuranceTitle,
      },
      faqBlock('page-faq', 'light', FAQ_APRES_SINISTRE),
      { type: 'urgency' },
      { type: 'agencies' },
    ],
  },

  'agences-contact': {
    seoTitle: CONTACT_PAGE_CONFIG.seoTitle,
    seoDescription: CONTACT_PAGE_CONFIG.seoDescription,
    hero: {
      kicker: CONTACT_PAGE_CONFIG.kicker,
      title: CONTACT_PAGE_CONFIG.title,
      breadcrumbLabel: 'Agences & contact',
      intro: CONTACT_PAGE_CONFIG.intro,
      imageSrc: HERO_CONFIG.media.slides[0]?.src,
      imagePosition: '72% 35%',
      actions: [{ kind: 'quote' }, { kind: 'phone' }],
    },
    blocks: [
      { type: 'agencies' },
      { type: 'zone' },
      {
        type: 'contactChannels',
        id: 'page-contact',
        tone: 'light',
        kicker: CONTACT_PAGE_CONFIG.channelsKicker,
        title: CONTACT_PAGE_CONFIG.channelsTitle,
      },
      faqBlock('page-faq', 'dark', FAQ_CONFIG.items),
    ],
  },

  'zone-intervention': {
    seoTitle: 'Serrurier à Marseille et alentours — Zone d’intervention | Serrurerie de la République',
    seoDescription:
      'Serrurerie, vitrerie, menuiserie et fermetures dans les arrondissements de Marseille et les communes voisines : Allauch, Plan-de-Cuques, Aubagne, Septèmes-les-Vallons…',
    hero: {
      kicker: 'Zone d’intervention',
      title: 'Marseille et ses alentours.',
      breadcrumbLabel: 'Zone d’intervention',
      intro:
        'Depuis nos agences République et Lodi, nous intervenons dans les arrondissements de Marseille et dans plusieurs communes voisines.',
      imageSrc: DOMAINS_CONFIG.items.find((d) => d.id === 'menuiserie')?.imageSrc,
      imagePosition: '75% 40%',
      actions: [{ kind: 'quote' }, { kind: 'phone' }],
    },
    blocks: [
      {
        type: 'domains',
        id: 'page-domaines',
        tone: 'light',
        kicker: 'Nos domaines',
        title: 'Ce que nous faisons près de chez vous.',
      },
      { type: 'zone' },
      { type: 'agencies' },
      faqBlock('page-faq', 'dark', FAQ_ZONE),
    ],
  },

  'avis-clients': {
    seoTitle: 'Avis clients — Serrurerie de la République à Marseille',
    seoDescription: 'Les avis de nos clients sur nos interventions de serrurerie, vitrerie, menuiserie et fermetures à Marseille.',
    hero: {
      kicker: 'Avis clients',
      title: 'L’expérience de nos clients.',
      breadcrumbLabel: 'Avis clients',
      intro: 'Ce que nos clients disent de nos interventions et de notre accueil en boutique.',
      imageSrc: KEYS_BADGES_CONFIG.imageSrc,
      imagePosition: '65% 45%',
      actions: [{ kind: 'quote' }, { kind: 'phone' }],
    },
    blocks: [{ type: 'reviews' }, CTA_BLOCK],
  },

  'questions-frequentes': {
    seoTitle: 'Questions fréquentes — Serrurerie de la République à Marseille',
    seoDescription:
      'Porte claquée, changement de cylindre, bris de glace, menuiserie, rideaux métalliques, doubles de clés, après sinistre : toutes nos réponses.',
    hero: {
      kicker: 'Questions fréquentes',
      title: 'Toutes nos réponses.',
      breadcrumbLabel: 'Questions fréquentes',
      intro: 'Retrouvez les questions les plus posées, classées par thème. Une question précise ? Appelez-nous.',
      actions: [{ kind: 'phone' }, { kind: 'quote' }],
    },
    blocks: [
      faqGroup('faq-general', 'light', FAQ_CONFIG.items, 'Les essentiels.', 'Général'),
      faqGroup('faq-serrurerie', 'dark', FAQ_SERRURERIE, 'Serrurerie & portes blindées.', 'Métier'),
      faqGroup('faq-vitrerie', 'light', FAQ_VITRERIE, 'Vitrerie & miroiterie.', 'Métier'),
      faqGroup('faq-menuiserie', 'dark', FAQ_MENUISERIE, 'Menuiserie.', 'Métier'),
      faqGroup('faq-fermetures', 'light', FAQ_FERMETURES, 'Fermetures.', 'Métier'),
      faqGroup('faq-cles', 'dark', FAQ_CLES_BADGES, 'Clés & badges.', 'En boutique'),
      faqGroup('faq-sinistre', 'light', FAQ_APRES_SINISTRE, 'Après sinistre.', 'Accompagnement'),
      CTA_BLOCK,
    ],
  },

  'mentions-legales': {
    seoTitle: 'Mentions légales — Serrurerie de la République',
    seoDescription: 'Mentions légales du site de Serrurerie de la République, Marseille.',
    hero: {
      kicker: 'Informations réglementaires',
      title: 'Mentions légales.',
      intro: 'Informations sur l’éditeur et l’hébergeur du site.',
      compact: true,
      actions: [],
    },
    blocks: [{ type: 'legal', id: 'page-legal', tone: 'light', kicker: 'Mentions légales', title: 'Éditeur & hébergement.', articles: LEGAL_MENTIONS }],
  },

  confidentialite: {
    seoTitle: 'Politique de confidentialité — Serrurerie de la République',
    seoDescription: 'Comment Serrurerie de la République traite les données transmises via son site.',
    hero: {
      kicker: 'Informations réglementaires',
      title: 'Politique de confidentialité.',
      intro: 'Comment nous traitons les données que vous nous transmettez via ce site.',
      compact: true,
      actions: [],
    },
    blocks: [{ type: 'legal', id: 'page-legal', tone: 'light', kicker: 'Vos données', title: 'Données & droits.', articles: LEGAL_PRIVACY }],
  },
};

/** Définition de la page à afficher pour une adresse (null = accueil). */
export function resolvePageDefinition(route: Route): PageDefinition | null {
  if (route.kind === 'domain') {
    const domain = DOMAINS_CONFIG.items.find((item) => item.id === route.id);
    return domain ? buildDomainPage(domain) : null;
  }
  if (route.kind === 'page') {
    return route.id === 'devis' ? null : THEMATIC_PAGES[route.id];
  }
  return null;
}
