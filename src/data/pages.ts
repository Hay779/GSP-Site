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
  FAQ_PRO_ASSUREURS,
  FAQ_PRO_GENERAL,
  FAQ_PRO_IMMOBILIER,
  FAQ_PRO_SYNDICS,
  FAQ_CLES_BADGES,
  FAQ_FERMETURES,
  FAQ_MENUISERIE,
  FAQ_SERRURERIE,
  FAQ_VITRERIE,
  FAQ_ZONE,
} from './faqContent';
import { HERO_CONFIG } from './heroConfig';
import { DOMAIN_PAGE_EXTRAS, type BeforeAfterCase, type FeatureCard, type ProcessIconKey } from './domainPagesContent';
import {
  AFTER_INCIDENT_CONFIG,
  AFTER_INCIDENT_PAGE_CONFIG,
  CONTACT_PAGE_CONFIG,
  DOMAIN_PAGE_CONFIG,
  DOMAINS_CONFIG,
  FAQ_CONFIG,
  KEYS_BADGES_CONFIG,
  KEYS_BADGES_PAGE_CONFIG,
  ZONE_INTERVENTION_CONFIG,
  type DomainCardItem,
  type FaqItem,
  type KeysBadgeIconKey,
  type NumberedStep,
  type UrgencyVariant,
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
  /** Petits points rassurants sous l'introduction (2 ou 3, courts). */
  readonly highlights?: readonly string[];
  /** Raccourcis vers des sections de la page (pastilles cliquables). */
  readonly shortcuts?: readonly { readonly label: string; readonly targetId: string }[];
  /** En-tête réduit (pages légales). */
  readonly compact?: boolean;
  /** Masque l'en-tête sur mobile et tablette (le contenu commence directement). */
  readonly hideOnMobile?: boolean;
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

/** Carte « public » (page Professionnels). */
export interface AudienceCard {
  readonly icon: 'syndic' | 'assureur' | 'immobilier';
  readonly title: string;
  readonly text: string;
  readonly page: PageId;
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
  | ({ readonly type: 'contactForm'; readonly id: string; readonly tone: 'light' } & SectionHeading)
  | ({ readonly type: 'legal'; readonly id: string; readonly tone: 'light'; readonly articles: readonly LegalArticle[] } & SectionHeading)
  | ({
      readonly type: 'cta';
      readonly id: string;
      readonly tone: 'dark';
      /** Bouton principal vers une page (par défaut : « Demander un devis »). */
      readonly primary?: { readonly label: string; readonly page: PageId };
    } & SectionHeading)
  | ({
      readonly type: 'audiences';
      readonly id: string;
      readonly tone: 'light';
      readonly items: readonly AudienceCard[];
    } & SectionHeading)
  | ({ readonly type: 'features'; readonly id: string; readonly tone: 'light'; readonly items: readonly FeatureCard[] } & SectionHeading)
  | ({
      readonly type: 'process';
      readonly id: string;
      readonly tone: BlockTone;
      readonly steps: readonly NumberedStep[];
      readonly icons?: readonly ProcessIconKey[];
    } & SectionHeading)
  | ({ readonly type: 'incidentServices'; readonly id: string; readonly tone: 'light' } & SectionHeading)
  | ({ readonly type: 'beforeAfter'; readonly id: string; readonly tone: 'dark'; readonly items: readonly BeforeAfterCase[] } & SectionHeading)
  /* Sections partagées avec l'accueil (fond fixe) */
  | { readonly type: 'brands' }
  | { readonly type: 'urgency'; readonly variant?: UrgencyVariant }
  | { readonly type: 'agencies' }
  | { readonly type: 'zone'; readonly embedded?: boolean }
  | { readonly type: 'reviews'; readonly hideHeading?: boolean };

export interface PageDefinition {
  readonly seoTitle: string;
  readonly seoDescription: string;
  readonly hero: PageHeroDefinition;
  readonly blocks: readonly PageBlock[];
}

/** Fond d'un bloc : « band » = bandeau neutre (urgence, zone) qui peut suivre n'importe quel bloc. */
export function blockTone(block: PageBlock): BlockTone | 'band' {
  switch (block.type) {
    case 'urgency':
    case 'zone':
      return 'band';
    case 'agencies':
    case 'reviews':
      return 'light';
    case 'brands':
      return 'dark';
    default:
      return block.tone;
  }
}

/* ------------------------------------------------------------------ */
/* Blocs réutilisables                                                 */
/* ------------------------------------------------------------------ */


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
      highlights: DOMAIN_PAGE_EXTRAS[domain.id].highlights,
      actions: [{ kind: 'quote', domain: domain.quoteDomain }, { kind: 'phone' }],
    },
    blocks: domainPageBlocks(domain),
  };
}

/**
 * Blocs d'une page métier : urgence, prestations, avant / après (si photos), méthode,
 * marques (serrurerie), autres domaines, FAQ, agences — en alternant clair / sombre.
 */
function domainPageBlocks(domain: DomainCardItem): PageBlock[] {
  const c = DOMAIN_PAGE_CONFIG;
  const extras = DOMAIN_PAGE_EXTRAS[domain.id];
  const hasCases = extras.beforeAfter.length > 0;
  const blocks: PageBlock[] = [
    // Bloc urgence adapté au métier (porte pour la serrurerie, vitre, fenêtre, rideau…)
    { type: 'urgency', variant: domain.id },
    {
      type: 'features',
      id: 'page-prestations',
      tone: 'light',
      kicker: c.prestationsKicker,
      title: c.prestationsTitle,
      subtitle: domain.summary,
      items: extras.features,
    },
  ];
  if (hasCases) {
    blocks.push({
      type: 'beforeAfter',
      id: 'page-avant-apres',
      tone: 'dark',
      kicker: c.casesKicker,
      title: c.casesTitle,
      items: extras.beforeAfter,
    });
  }
  // La méthode prend le fond opposé au bloc précédent.
  const processTone: BlockTone = hasCases ? 'light' : 'dark';
  blocks.push({ type: 'process', id: 'page-methode', tone: processTone, kicker: c.methodKicker, title: c.methodTitle, steps: c.methodSteps });
  const otherDomains: PageBlock = {
    type: 'domains',
    id: 'page-autres-domaines',
    tone: 'light',
    kicker: c.otherDomainsKicker,
    title: c.otherDomainsTitle,
    excludeId: domain.id,
  };
  const faq = faqBlock('page-faq', 'dark', DOMAIN_FAQS[domain.id], `Vos questions en ${domain.title.toLowerCase()}.`);
  if (processTone === 'light') {
    // … méthode (clair) → marques ou FAQ (sombre) → autres domaines (clair) → [FAQ (sombre)] → agences (clair)
    if (extras.showBrands) {
      blocks.push({ type: 'brands' }, otherDomains, faq);
    } else {
      // (pas de bloc sombre disponible entre « autres domaines » et les agences : on le retire)
      blocks.push(faq);
    }
  } else {
    // … méthode (sombre) → autres domaines (clair) → FAQ (sombre)
    blocks.push(otherDomains, faq);
  }
  blocks.push({ type: 'agencies' });
  return blocks;
}

/* ------------------------------------------------------------------ */
/* Pages thématiques                                                   */
/* ------------------------------------------------------------------ */

const LEGAL_MENTIONS: readonly LegalArticle[] = [
  {
    heading: 'Éditeur du site',
    paragraphs: [
      'SERRURERIE DE LA REPUBLIQUE, société à responsabilité limitée (SARL) au capital de 1\u00A0000\u00A0€.',
      'Siège social\u00A0: 48 rue de la République, 13002 Marseille.',
      'Immatriculée au RCS de Marseille sous le numéro 106\u00A0157\u00A0118 — SIRET 106\u00A0157\u00A0118\u00A000014.',
      'TVA intracommunautaire\u00A0: FR93106157118 — Code APE\u00A0: 43.32B (travaux de menuiserie métallique et serrurerie).',
      'Téléphone\u00A0: 04 91 90 51 65.',
    ],
  },
  {
    heading: 'Directeur de la publication',
    paragraphs: ['Grigor Galstyan, gérant.'],
  },
  {
    heading: 'Hébergement',
    paragraphs: [
      'OVH SAS, 2 rue Kellermann, 59100 Roubaix, France.',
      'Téléphone : 1007 — site : www.ovhcloud.com.',
    ],
  },
  {
    heading: 'Propriété intellectuelle',
    paragraphs: [
      'L’ensemble des contenus de ce site (textes, visuels, logo) est la propriété de SERRURERIE DE LA REPUBLIQUE ou de ses partenaires. Toute reproduction, même partielle, sans autorisation préalable est interdite.',
    ],
  },
  {
    heading: 'Photographies',
    paragraphs: [
      'Certaines photographies présentes sur le site sont des visuels d’illustration et ne représentent pas nécessairement des interventions réalisées par l’entreprise.',
    ],
  },
];

const LEGAL_PRIVACY: readonly LegalArticle[] = [
  {
    heading: 'Données collectées',
    paragraphs: [
      'Les informations transmises via les formulaires (demande de devis, envoi de photos après sinistre, demande de partenariat) sont destinées uniquement au traitement de votre demande par SERRURERIE DE LA REPUBLIQUE, responsable du traitement, représentée par son gérant, Grigor Galstyan.',
      'Elles ne sont ni vendues ni cédées à des tiers.',
    ],
  },
  {
    heading: 'Conservation et droits (RGPD)',
    paragraphs: [
      'Vos données sont conservées le temps nécessaire au traitement de votre demande, puis au maximum 3 ans après notre dernier échange.',
      'Vous disposez d’un droit d’accès, de rectification, d’opposition et de suppression de vos données, par courrier à SERRURERIE DE LA REPUBLIQUE, 48 rue de la République, 13002 Marseille, ou en nous contactant via le formulaire du site. Vous pouvez aussi saisir la CNIL (cnil.fr).',
    ],
  },
  {
    heading: 'Cookies et mesure d’audience',
    paragraphs: [
      'Le site utilise Google Analytics (Google Ireland Limited) pour mesurer sa fréquentation : pages vues, provenance des visites (moteur de recherche, réseau social, lien direct), type d’appareil, ville approximative, et clics sur les boutons d’appel, WhatsApp et de demande de devis. Les signaux publicitaires de Google sont désactivés.',
      'Ces cookies (_ga, _ga_*) ne sont déposés qu’après votre accord, donné dans la bannière affichée lors de votre première visite. Sans accord, aucun script Google n’est chargé. Votre choix est conservé 6 mois ; vous pouvez le modifier à tout moment avec le lien « Gérer les cookies » en bas de chaque page.',
      'Les données de mesure d’audience sont conservées 14 mois au maximum. Elles peuvent être traitées par Google en dehors de l’Union européenne, dans le cadre du Data Privacy Framework UE–États-Unis.',
      'Le site ne dépose aucun autre cookie. Les formulaires n’utilisent pas de cookies.',
    ],
  },
];

/** Pages assemblées à partir de blocs (la page /devis a son propre composant). */
export type BlockPageId = Exclude<PageId, 'devis' | 'devenir-partenaire'>;


/* ------------------------------------------------------------------ */
/* Professionnels                                                      */
/* ------------------------------------------------------------------ */

const PARTNER_CTA: PageBlock = {
  type: 'cta',
  id: 'page-partenaire',
  tone: 'dark',
  kicker: 'Travaillons ensemble',
  title: 'Un interlocuteur unique pour vos immeubles et vos dossiers.',
  subtitle: 'Présentez-nous votre structure et vos besoins : nous revenons vers vous pour organiser notre collaboration.',
  primary: { label: 'Devenir partenaire', page: 'devenir-partenaire' },
};

const PRO_METHOD: readonly NumberedStep[] = [
  { title: 'Votre demande', text: 'Par téléphone ou en ligne, avec l’adresse, le besoin et le contact sur place.' },
  { title: 'Devis détaillé', text: 'Transmis et validé avant toute intervention.' },
  { title: 'Intervention', text: 'Réalisée par nos artisans, conformément au devis.' },
  { title: 'Compte rendu', text: 'Photos et informations utiles au suivi de votre dossier.' },
];

const PRO_PAGES = {
  professionnels: {
    seoTitle: 'Professionnels : syndics, assureurs, agences immobilières | Serrurerie de la République',
    seoDescription:
      'Serrurerie, vitrerie, menuiserie et fermetures pour les syndics de copropriété, assureurs, experts, agences immobilières et bailleurs à Marseille.',
    hero: {
      kicker: 'Professionnels',
      title: 'Un partenaire de confiance pour vos immeubles.',
      intro:
        'Syndics, assureurs, experts, agences immobilières et bailleurs : un seul interlocuteur à Marseille pour la serrurerie, la vitrerie, la menuiserie et les fermetures.',
      imageSrc: ZONE_INTERVENTION_CONFIG.bannerSrc,
      imagePosition: '30% 40%',
      highlights: ['Un seul interlocuteur', 'Devis avant intervention', 'Compte rendu avec photos'],
      breadcrumbLabel: 'Professionnels',
      actions: [{ kind: 'page', label: 'Devenir partenaire', page: 'devenir-partenaire' }, { kind: 'phone' }],
    },
    blocks: [
      {
        type: 'audiences',
        id: 'page-publics',
        tone: 'light',
        kicker: 'Vous êtes',
        title: 'Des solutions adaptées à votre métier.',
        items: [
          {
            icon: 'syndic',
            title: 'Syndics & gestionnaires',
            text: 'Parties communes, accès de la copropriété, clés et badges des résidents.',
            page: 'pro-syndics',
          },
          {
            icon: 'assureur',
            title: 'Assureurs & experts',
            text: 'Mise en sécurité, devis détaillé et reportage photo, remise en état après sinistre.',
            page: 'pro-assureurs',
          },
          {
            icon: 'immobilier',
            title: 'Agences immobilières & bailleurs',
            text: 'Changement de serrure entre locataires, jeux de clés, petites réparations.',
            page: 'pro-immobilier',
          },
        ],
      },
      {
        type: 'process',
        id: 'page-methode',
        tone: 'dark',
        kicker: 'Notre méthode',
        title: 'Une collaboration simple et traçable.',
        steps: PRO_METHOD,
        icons: ['hand', 'file', 'wrench', 'folder'],
      },
      faqBlock('page-faq', 'light', FAQ_PRO_GENERAL, 'Vos questions de professionnels.'),
      PARTNER_CTA,
    ],
  },

  'pro-syndics': {
    seoTitle: 'Serrurier pour syndics et copropriétés à Marseille | Serrurerie de la République',
    seoDescription:
      'Portes de hall, serrures, ferme-portes, vitrages, portes de garage, clés et badges des résidents : nos services pour les syndics et gestionnaires de copropriété à Marseille.',
    hero: {
      kicker: 'Syndics & gestionnaires',
      title: 'Les accès de vos copropriétés, entre de bonnes mains.',
      intro:
        'Nous intervenons sur les parties communes de vos immeubles et accompagnons la gestion des clés et des badges des résidents.',
      imageSrc: DOMAINS_CONFIG.items.find((d) => d.id === 'fermetures')?.imageSrc,
      imagePosition: '55% 50%',
      breadcrumbLabel: 'Syndics & gestionnaires',
      actions: [{ kind: 'page', label: 'Devenir partenaire', page: 'devenir-partenaire' }, { kind: 'phone' }],
    },
    blocks: [
      {
        type: 'cards',
        id: 'page-prestations',
        tone: 'light',
        kicker: 'Nos interventions',
        title: 'Pour vos parties communes.',
        items: [
          'Dépannage et remplacement des serrures, cylindres et ferme-portes des portes de hall',
          'Clés et badges compatibles pour les résidents',
          'Remplacement des vitrages des parties communes',
          'Portes de garage, rideaux et fermetures collectives',
        ],
      },
      {
        type: 'process',
        id: 'page-methode',
        tone: 'dark',
        kicker: 'Notre méthode',
        title: 'Une collaboration simple et traçable.',
        steps: PRO_METHOD,
        icons: ['hand', 'file', 'wrench', 'folder'],
      },
      faqBlock('page-faq', 'light', FAQ_PRO_SYNDICS, 'Vos questions de gestionnaires.'),
      PARTNER_CTA,
    ],
  },

  'pro-assureurs': {
    seoTitle: 'Assureurs et experts : intervention après sinistre à Marseille | Serrurerie de la République',
    seoDescription:
      'Mise en sécurité, fermeture provisoire, devis détaillé et reportage photo, remise en état après effraction ou bris de glace à Marseille.',
    hero: {
      kicker: 'Assureurs & experts',
      title: 'De la mise en sécurité à la remise en état.',
      intro:
        'Après une effraction, du vandalisme ou un bris de glace, nous sécurisons les lieux et fournissons les éléments utiles à l’instruction du dossier.',
      imageSrc: AFTER_INCIDENT_CONFIG.imageSrc,
      imagePosition: '70% 35%',
      breadcrumbLabel: 'Assureurs & experts',
      actions: [{ kind: 'page', label: 'Devenir partenaire', page: 'devenir-partenaire' }, { kind: 'phone' }],
    },
    blocks: [
      {
        type: 'cards',
        id: 'page-prestations',
        tone: 'light',
        kicker: 'Nos interventions',
        title: 'Pour vos dossiers sinistres.',
        items: [
          'Mise en sécurité et fermeture provisoire des accès',
          'Devis détaillé accompagné d’un reportage photo',
          'Remise en état : serrurerie, vitrerie, menuiserie et fermetures',
          'Suivi administratif du dossier',
        ],
      },
      {
        type: 'process',
        id: 'page-methode',
        tone: 'dark',
        kicker: 'Notre méthode',
        title: 'Une collaboration simple et traçable.',
        steps: PRO_METHOD,
        icons: ['hand', 'file', 'wrench', 'folder'],
      },
      faqBlock('page-faq', 'light', FAQ_PRO_ASSUREURS, 'Vos questions d’assureurs et d’experts.'),
      PARTNER_CTA,
    ],
  },

  'pro-immobilier': {
    seoTitle: 'Agences immobilières et bailleurs : serrurier à Marseille | Serrurerie de la République',
    seoDescription:
      'Changement de serrure entre locataires, doubles de clés et badges, ouverture de porte et petites réparations pour les agences immobilières et bailleurs à Marseille.',
    hero: {
      kicker: 'Agences immobilières & bailleurs',
      title: 'Des logements prêts à être remis en main.',
      intro:
        'Entre deux locataires ou en cours de bail, nous prenons en charge les serrures, les clés et les petites réparations de vos biens.',
      imageSrc: KEYS_BADGES_CONFIG.imageSrc,
      imagePosition: '55% 45%',
      breadcrumbLabel: 'Agences immobilières & bailleurs',
      actions: [{ kind: 'page', label: 'Devenir partenaire', page: 'devenir-partenaire' }, { kind: 'phone' }],
    },
    blocks: [
      {
        type: 'cards',
        id: 'page-prestations',
        tone: 'light',
        kicker: 'Nos interventions',
        title: 'Pour vos biens en gestion.',
        items: [
          'Changement de cylindre ou de serrure entre deux locataires',
          'Doubles de clés et de badges compatibles',
          'Ouverture de porte',
          'Réglages et petites réparations de menuiseries et fermetures',
        ],
      },
      {
        type: 'process',
        id: 'page-methode',
        tone: 'dark',
        kicker: 'Notre méthode',
        title: 'Une collaboration simple et traçable.',
        steps: PRO_METHOD,
        icons: ['hand', 'file', 'wrench', 'folder'],
      },
      faqBlock('page-faq', 'light', FAQ_PRO_IMMOBILIER, 'Vos questions de gestionnaires de biens.'),
      PARTNER_CTA,
    ],
  },
} satisfies Record<'professionnels' | 'pro-syndics' | 'pro-assureurs' | 'pro-immobilier', PageDefinition>;

export const THEMATIC_PAGES: Readonly<Record<BlockPageId, PageDefinition>> = {
  ...PRO_PAGES,
  'cles-badges': {
    seoTitle: KEYS_BADGES_PAGE_CONFIG.seoTitle,
    seoDescription: KEYS_BADGES_PAGE_CONFIG.seoDescription,
    hero: {
      kicker: KEYS_BADGES_PAGE_CONFIG.kicker,
      title: KEYS_BADGES_PAGE_CONFIG.title,
      intro: KEYS_BADGES_PAGE_CONFIG.intro,
      imageSrc: KEYS_BADGES_CONFIG.imageSrc,
      imagePosition: '65% 45%',
      highlights: ['En boutique', 'À partir de votre original', 'République & Rome'],
      actions: [{ kind: 'page', label: 'Trouver une agence', page: 'agences-contact' }, { kind: 'phone' }],
    },
    blocks: [
      { type: 'urgency', variant: 'cles' },
      {
        type: 'services',
        id: 'page-services',
        tone: 'light',
        kicker: KEYS_BADGES_PAGE_CONFIG.servicesKicker,
        title: KEYS_BADGES_PAGE_CONFIG.servicesTitle,
        services: KEYS_BADGES_PAGE_CONFIG.services,
      },
      {
        type: 'process',
        id: 'page-etapes',
        tone: 'dark',
        kicker: KEYS_BADGES_PAGE_CONFIG.stepsKicker,
        title: KEYS_BADGES_PAGE_CONFIG.stepsTitle,
        steps: KEYS_BADGES_PAGE_CONFIG.steps,
        icons: ['hand', 'search', 'settings'],
      },
      // Service réalisé en boutique : les agences viennent juste après.
      { type: 'agencies' },
      faqBlock('page-faq', 'dark', FAQ_CLES_BADGES),
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
      highlights: ['Mise en sécurité rapide', 'Reportage photo', 'Dossier assurance'],
      actions: [
        { kind: 'quote', label: AFTER_INCIDENT_CONFIG.primaryCtaLabel, domain: 'Après sinistre' },
        { kind: 'photos', label: AFTER_INCIDENT_CONFIG.secondaryCtaLabel },
      ],
    },
    blocks: [
      { type: 'urgency' },
      {
        type: 'incidentServices',
        id: 'page-prise-en-charge',
        tone: 'light',
        kicker: AFTER_INCIDENT_PAGE_CONFIG.servicesKicker,
        title: AFTER_INCIDENT_PAGE_CONFIG.servicesTitle,
      },
      {
        type: 'beforeAfter',
        id: 'page-avant-apres',
        tone: 'dark',
        kicker: AFTER_INCIDENT_PAGE_CONFIG.casesKicker,
        title: AFTER_INCIDENT_PAGE_CONFIG.casesTitle,
        items: DOMAIN_PAGE_EXTRAS.serrurerie.beforeAfter,
      },
      {
        type: 'process',
        id: 'page-accompagnement',
        tone: 'light',
        kicker: AFTER_INCIDENT_PAGE_CONFIG.stepsKicker,
        title: AFTER_INCIDENT_PAGE_CONFIG.stepsTitle,
        steps: AFTER_INCIDENT_CONFIG.steps.map((step) => ({ title: step.label, text: '' })),
        icons: ['search', 'file', 'wrench', 'folder'],
      },
      {
        type: 'insurance',
        id: 'page-assurance',
        tone: 'dark',
        kicker: AFTER_INCIDENT_PAGE_CONFIG.insuranceKicker,
        title: AFTER_INCIDENT_PAGE_CONFIG.insuranceTitle,
      },
      { type: 'agencies' },
      faqBlock('page-faq', 'dark', FAQ_APRES_SINISTRE),
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
      compact: true,
      hideOnMobile: true,
      actions: [{ kind: 'quote' }, { kind: 'phone' }],
    },
    blocks: [
      {
        type: 'contactForm',
        id: 'page-contact',
        tone: 'light',
        kicker: 'Nous écrire',
        title: 'Une question ? Écrivez-nous.',
      },
      { type: 'zone' },
      { type: 'agencies' },
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
        'Depuis nos agences République et Rome, nous intervenons dans les arrondissements de Marseille et dans plusieurs communes voisines.',
      imageSrc: ZONE_INTERVENTION_CONFIG.bannerSrc,
      imagePosition: '30% 40%',
      highlights: ['16 arrondissements', 'Communes voisines', '2 agences : République & Rome'],
      actions: [{ kind: 'quote' }, { kind: 'phone' }],
    },
    blocks: [
      // La carte et la recherche d'abord : c'est l'objet de la page.
      { type: 'zone', embedded: true },
      { type: 'agencies' },
      faqBlock('page-faq', 'dark', FAQ_ZONE),
      {
        type: 'domains',
        id: 'page-domaines',
        tone: 'light',
        kicker: 'Nos domaines',
        title: 'Ce que nous faisons près de chez vous.',
      },
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
    blocks: [{ type: 'reviews', hideHeading: true }],
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
      shortcuts: [
        { label: 'Les essentiels', targetId: 'faq-general' },
        { label: 'Serrurerie', targetId: 'faq-serrurerie' },
        { label: 'Vitrerie', targetId: 'faq-vitrerie' },
        { label: 'Menuiserie', targetId: 'faq-menuiserie' },
        { label: 'Fermetures', targetId: 'faq-fermetures' },
        { label: 'Clés & badges', targetId: 'faq-cles' },
        { label: 'Après sinistre', targetId: 'faq-sinistre' },
      ],
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
    return route.id === 'devis' || route.id === 'devenir-partenaire' ? null : THEMATIC_PAGES[route.id];
  }
  return null;
}
