import type { SectionId } from '../utils/navigation';
import type { QuoteDomain } from '../utils/quoteForm';
import type { PageId } from '../utils/router';

export interface UrgencyConfig {
  readonly title: string;
  readonly subtitle: string;
  readonly ctaPrefix: string;
}

export type KeysBadgeIconKey = 'key' | 'badge';

export interface KeysBadgeService {
  readonly label: string;
  readonly icon: KeysBadgeIconKey;
}

export interface KeysBadgesConfig {
  readonly kicker: string;
  readonly headlineLines: readonly [string, string];
  readonly services: readonly KeysBadgeService[];
  readonly note: string;
  readonly ctaLabel: string;
  readonly ctaTargetId: SectionId;
  readonly ctaHref: `#${SectionId}`;
  readonly imageSrc: string;
  readonly imageAlt: string;
}

export interface DomainCardItem {
  readonly id: 'serrurerie' | 'vitrerie' | 'menuiserie' | 'fermetures';
  readonly title: string;
  readonly categoryTag: string;
  readonly quoteDomain: QuoteDomain;
  readonly summary: string;
  readonly prestations: readonly string[];
  readonly ctaLabel: string;
  readonly imageSrc: string;
  readonly imageAlt: string;
  /** Page dédiée : paragraphe d'introduction sous le titre. */
  readonly pageIntro: string;
  /** Page dédiée : titre de l'onglet / Google. */
  readonly seoTitle: string;
  /** Page dédiée : description affichée par Google. */
  readonly seoDescription: string;
}

export interface DomainsConfig {
  readonly kicker: string;
  readonly title: string;
  readonly items: readonly DomainCardItem[];
}

export type PartnerBrandId = 'vachette' | 'bricard' | 'fichet' | 'picard' | 'dom' | 'iseo';

export interface PartnerBrandItem {
  readonly id: PartnerBrandId;
  readonly name: string;
  readonly specialty: string;
  /**
   * Logo officiel (fichier dans public/assets/brands/). S'il est absent ou
   * introuvable, le nom de la marque s'affiche à la place.
   */
  readonly logoSrc?: string;
  /** Hauteur max du logo en px (équilibre visuel entre logos larges et carrés). */
  readonly logoHeight?: number;
}

export interface BrandsConfig {
  readonly kicker: string;
  readonly title: string;
  readonly subtitle: string;
  /**
   * Marques sur lesquelles l'entreprise intervient, avec leur logo officiel.
   * ⚠️ Liste à confirmer par l'entreprise.
   */
  readonly partners: readonly PartnerBrandItem[];
  /** Phrase sous la grille (autres marques). */
  readonly otherBrandsLabel: string;
  readonly otherBrandsCta: string;
}

export interface AfterIncidentStep {
  readonly number: string;
  readonly label: string;
}

export interface InsuranceNoticeConfig {
  readonly partnerName: string;
  readonly partnerNote: string;
  readonly title: string;
  readonly subtitle: string;
  readonly ctaLabel: string;
}

export interface AfterIncidentConfig {
  readonly kicker: string;
  readonly headlineLines: readonly [string, string];
  readonly subtitle: string;
  readonly primaryCtaLabel: string;
  readonly secondaryCtaLabel: string;
  readonly imageSrc: string;
  readonly imageAlt: string;
  readonly steps: readonly AfterIncidentStep[];
  readonly insuranceNotice: InsuranceNoticeConfig;
}

/** Textes du bloc avis (les avis eux-mêmes sont dans data/reviewsContent.ts). */
export interface ReviewsConfig {
  readonly kicker: string;
  readonly title: string;
  readonly subtitle: string;
}

export interface ZoneInterventionConfig {
  readonly kicker: string;
  readonly title: string;
  readonly subtitle: string;
  readonly marseilleLabel: string;
  readonly marseilleRangeLabel: string;
  readonly marseilleSectors: readonly string[];
  readonly neighboringLabel: string;
  readonly neighboringCommunes: readonly string[];
  readonly ctaLabel: string;
  readonly quoteCtaLabel: string;
  readonly responseTimePrefix: string;
  readonly responseTimeHighlight: string;
}

export interface AgencyItem {
  readonly id: 'republique' | 'lodi';
  readonly name: string;
  readonly districtLabel: string;
  readonly imageSrc: string;
  readonly imageAlt: string;
  readonly photoPlaceholderLabel: string;
  readonly addressLines: readonly string[];
  readonly isAddressPending?: boolean;
  readonly phoneDisplay: string;
  readonly phoneHref: string;
  readonly hoursTitle: string;
  readonly hoursLabel: string;
  readonly isHoursPending?: boolean;
  readonly directionsUrl: string;
}

export interface AgenciesConfig {
  readonly kicker: string;
  readonly title: string;
  readonly subtitle: string;
  readonly agencies: readonly AgencyItem[];
}

export interface FaqItem {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
}

export interface FaqConfig {
  readonly kicker: string;
  readonly title: string;
  readonly subtitle: string;
  readonly contactPrompt: string;
  readonly quoteCtaLabel: string;
  readonly items: readonly FaqItem[];
}

export interface FooterServiceLink {
  readonly label: string;
  readonly pageId?: PageId;
  readonly targetId?: SectionId;
  readonly domainId?: DomainCardItem['id'];
}

export interface FooterInfoLink {
  readonly label: string;
  readonly pageId?: PageId;
  readonly targetId?: SectionId;
}

export interface FooterConfig {
  /** Bandeau d'appel à l'action en haut du pied de page. */
  readonly ctaKicker: string;
  readonly ctaTitle: string;
  readonly ctaSubtitle: string;
  readonly tagline: string;
  readonly servicesHeading: string;
  readonly serviceLinks: readonly FooterServiceLink[];
  readonly infoHeading: string;
  readonly infoLinks: readonly FooterInfoLink[];
  readonly agenciesHeading: string;
  readonly contactHeading: string;
  readonly quoteCtaLabel: string;
}

export interface WhatsAppConfig {
  readonly phoneDisplay: string;
  readonly label: string;
  readonly ariaLabel: string;
  readonly prefilledMessage: string;
}

export const URGENCY_CONFIG: UrgencyConfig = {
  title: 'Porte claquée ? Porte forcée ?',
  subtitle: 'Contactez-nous pour organiser votre dépannage.',
  ctaPrefix: 'Appeler le',
};

export const KEYS_BADGES_CONFIG: KeysBadgesConfig = {
  kicker: 'Reproduction en boutique',
  headlineLines: ['Vos doubles de clés', 'et de badges, tout simplement.'],
  services: [
    { label: 'Reproduction de clés', icon: 'key' },
    { label: 'Reproduction de badges', icon: 'badge' },
  ],
  note: 'Retrouvez-nous en agence pour votre demande.',
  ctaLabel: 'Trouver une agence',
  ctaTargetId: '10_Nos_Agences',
  ctaHref: '#10_Nos_Agences',
  imageSrc: '/src/assets/images/cles_badges_boutique_1795289681478.jpg',
  imageAlt:
    'Remise d’un double de clé en laiton au comptoir de la boutique Serrurerie de la République à Marseille, avec un badge d’accès d’immeuble.',
};

export const DOMAINS_CONFIG: DomainsConfig = {
  kicker: 'Nos domaines',
  title: 'Un savoir-faire pour tous vos accès.',
  items: [
    {
      id: 'serrurerie',
      title: 'Serrurerie & portes blindées',
      categoryTag: 'SÉCURITÉ & ACCÈS',
      quoteDomain: 'Serrurerie & portes blindées',
      summary: 'Ouverture, réparation, remplacement et sécurisation des accès.',
      prestations: [
        'Ouverture de porte claquée ou verrouillée sans dégradation lorsque c’est possible',
        'Remplacement de cylindres, serrures multipoints et verrous haute sécurité',
        'Blindage de porte, pose de blocs-portes blindés et mise en sécurité après effraction',
        'Entretien et réglage de serrures pour particuliers, syndics et commerces',
      ],
      ctaLabel: 'En savoir plus',
      imageSrc: '/src/assets/images/domaine_serrurerie_1795289920360.jpg',
      imageAlt:
        'Cylindre de haute sécurité en acier brossé posé sur une porte blindée anthracite.',
      pageIntro:
        'Ouverture de porte, remplacement de serrure ou blindage : nous intervenons à Marseille et alentours pour sécuriser votre logement, votre commerce ou votre immeuble, avec un devis détaillé avant chaque intervention.',
      seoTitle: 'Serrurier à Marseille — Serrurerie & portes blindées | Serrurerie de la République',
      seoDescription:
        'Ouverture de porte, remplacement de cylindres et serrures multipoints, blindage et portes blindées à Marseille. Devis détaillé avant intervention.',
    },
    {
      id: 'vitrerie',
      title: 'Vitrerie & miroiterie',
      categoryTag: 'VITRAGES & VITRINES',
      quoteDomain: 'Vitrerie & miroiterie',
      summary: 'Simple et double vitrage, vitrines et bris de glace.',
      prestations: [
        'Mise en sécurité immédiate et fermeture provisoire après bris de glace',
        'Remplacement à l’identique de simple, double vitrage et vitrage feuilleté',
        'Pose et remplacement de vitrines commerciales et verres de sécurité',
        'Découpe et pose de miroirs sur mesure pour logements et locaux professionnels',
      ],
      ctaLabel: 'En savoir plus',
      imageSrc: '/src/assets/images/domaine_vitrerie_1795289921283.jpg',
      imageAlt:
        'Vitrier manipulant un double vitrage de vitrine à l’aide de ventouses professionnelles dans une rue de Marseille.',
      pageIntro:
        'Bris de glace, vitrine de commerce ou double vitrage à remplacer : nous mettons en sécurité, remplaçons à l’identique et posons vos vitrages et miroirs sur mesure à Marseille.',
      seoTitle: 'Vitrier à Marseille — Vitrerie & miroiterie | Serrurerie de la République',
      seoDescription:
        'Mise en sécurité après bris de glace, remplacement de simple et double vitrage, vitrines commerciales et miroirs sur mesure à Marseille.',
    },
    {
      id: 'menuiserie',
      title: 'Menuiserie',
      categoryTag: 'ALU · PVC · BOIS · MÉTAL',
      quoteDomain: 'Menuiserie',
      summary: 'Portes et fenêtres : aluminium, PVC, bois et métal.',
      prestations: [
        'Fourniture et pose de portes d’entrée, fenêtres et portes-fenêtres sur mesure',
        'Réglage, réparation de quincaillerie, crémones et paumelles',
        'Remplacement de menuiseries aluminium, PVC, bois et acier',
        'Amélioration de l’isolation thermique, acoustique et de l’étanchéité des ouvrants',
      ],
      ctaLabel: 'En savoir plus',
      imageSrc: '/src/assets/images/domaine_menuiserie_1795289934186.jpg',
      imageAlt:
        'Menuisier réglant la poignée et l’alignement d’une fenêtre en aluminium anthracite.',
      pageIntro:
        'Portes d’entrée, fenêtres et portes-fenêtres en aluminium, PVC, bois ou métal : fourniture, pose, réglage et réparation pour gagner en confort, en isolation et en sécurité.',
      seoTitle: 'Menuiserie à Marseille — Portes & fenêtres alu, PVC, bois | Serrurerie de la République',
      seoDescription:
        'Fourniture, pose et réparation de portes d’entrée, fenêtres et portes-fenêtres en aluminium, PVC, bois et métal à Marseille.',
    },
    {
      id: 'fermetures',
      title: 'Fermetures',
      categoryTag: 'RIDEAUX & VOLETS',
      quoteDomain: 'Fermetures',
      summary: 'Rideaux métalliques, volets roulants et portes de garage.',
      prestations: [
        'Dépannage, déblocage et motorisation de rideaux métalliques de commerces',
        'Installation et réparation de volets roulants manuels ou électriques',
        'Pose et entretien de portes de garage sectionnelles, basculantes ou enroulables',
        'Remplacement de moteurs, lames, axes et commandes de sécurité',
      ],
      ctaLabel: 'En savoir plus',
      imageSrc: '/src/assets/images/domaine_fermetures_1795289921534.jpg',
      imageAlt:
        'Rideau métallique motorisé et porte de garage sectionnelle anthracite intégrés dans une façade en pierre claire.',
      pageIntro:
        'Rideaux métalliques de commerce, volets roulants et portes de garage : dépannage, motorisation, installation et entretien pour des fermetures fiables au quotidien.',
      seoTitle: 'Rideaux métalliques, volets & portes de garage à Marseille | Serrurerie de la République',
      seoDescription:
        'Dépannage et motorisation de rideaux métalliques, installation et réparation de volets roulants et de portes de garage à Marseille.',
    },
  ],
};

export const BRANDS_CONFIG: BrandsConfig = {
  kicker: 'Les marques',
  title: 'Les grandes marques, entre de bonnes mains.',
  subtitle:
    'Nous posons, dépannons et entretenons les équipements des principaux fabricants de serrurerie et de fermeture.',
  partners: [
    { id: 'vachette', name: 'Vachette', specialty: 'Cylindres & serrures', logoSrc: '/assets/brands/vachette.png', logoHeight: 40 },
    { id: 'bricard', name: 'Bricard', specialty: 'Haute sécurité A2P', logoSrc: '/assets/brands/bricard.png', logoHeight: 62 },
    { id: 'fichet', name: 'Fichet', specialty: 'Portes blindées', logoSrc: '/assets/brands/fichet.png', logoHeight: 42 },
    { id: 'picard', name: 'Picard', specialty: 'Serrures multipoints', logoSrc: '/assets/brands/picard.png', logoHeight: 52 },
    { id: 'dom', name: 'DOM', specialty: 'Organigrammes & clés', logoSrc: '/assets/brands/dom.png', logoHeight: 50 },
    { id: 'iseo', name: 'ISEO', specialty: 'Contrôle d’accès', logoSrc: '/assets/brands/iseo.png', logoHeight: 40 },
  ],
  otherBrandsLabel: 'Votre équipement est d’une autre marque ?',
  otherBrandsCta: 'Contactez-nous pour vérifier',
};

export const AFTER_INCIDENT_CONFIG: AfterIncidentConfig = {
  kicker: 'Après sinistre',
  headlineLines: ['Du premier diagnostic', 'à la remise en état.'],
  subtitle: 'Effraction, vandalisme ou bris de glace : un accompagnement à chaque étape.',
  primaryCtaLabel: 'Décrire mon besoin',
  secondaryCtaLabel: 'Envoyer des photos',
  imageSrc: '/src/assets/images/apres_sinistre_diagnostic_1795291186729.jpg',
  imageAlt:
    'Artisan serrurier réalisant un diagnostic sur tablette devant une gâche de porte endommagée avec une cliente à Marseille.',
  steps: [
    { number: '01', label: 'Diagnostic et mise en sécurité' },
    { number: '02', label: 'Devis détaillé et reportage photo' },
    { number: '03', label: 'Réparation ou remplacement' },
    { number: '04', label: 'Suivi administratif du dossier' },
  ],
  insuranceNotice: {
    partnerName: 'Allianz',
    partnerNote: 'Lien avec Allianz à confirmer',
    title: 'Vous êtes assuré ? Nous préparons votre dossier.',
    subtitle:
      'Reportage photo, devis détaillé et facture conformes aux attentes de votre assureur.',
    ctaLabel: 'Envoyer mes photos',
  },
};

export const REVIEWS_CONFIG: ReviewsConfig = {
  kicker: 'Avis clients',
  title: 'L’expérience de nos clients.',
  subtitle: 'Ce que nos clients disent de nos interventions et de notre accueil en boutique.',
};

export const ZONE_INTERVENTION_CONFIG: ZoneInterventionConfig = {
  kicker: 'Zone d’intervention',
  title: 'Marseille et ses alentours.',
  subtitle:
    'Serrurerie, vitrerie, menuiserie et fermetures dans tous les arrondissements de Marseille et les communes voisines.',
  marseilleLabel: 'Marseille & Arrondissements',
  marseilleRangeLabel: '1er au 16ème arrondissements',
  marseilleSectors: [
    'République',
    'Lodi',
    'Joliette',
    'Castellane',
    'Vieux-Port',
    'La Timone',
  ],
  neighboringLabel: 'Villes & Communes Voisines',
  neighboringCommunes: [
    'Allauch',
    'Septèmes-les-Vallons',
    'Plan-de-Cuques',
    'Les Pennes-Mirabeau',
    'Aubagne',
    'La Penne-sur-Huveaune',
  ],
  ctaLabel: 'Vérifier votre secteur',
  quoteCtaLabel: 'Demander un devis en ligne',
  // Encart de la carte. ⚠️ N'indiquer un délai (ex. « moins de 30 min ») que s'il est garanti.
  responseTimePrefix: '2 agences à Marseille',
  responseTimeHighlight: 'République & Lodi',
};

export const AGENCIES_CONFIG: AgenciesConfig = {
  kicker: 'Nos agences',
  title: 'Retrouvez-nous en boutique.',
  subtitle:
    'Nos experts vous accueillent pour tous vos besoins de sécurité, dépannage et reproduction de clés.',
  agencies: [
    {
      id: 'republique',
      name: 'Agence République',
      districtLabel: 'Marseille 2e',
      imageSrc: '',
      imageAlt: 'Façade de l’Agence République — Serrurerie de la République à Marseille',
      photoPlaceholderLabel: 'Photo de la façade à venir',
      addressLines: ['48 rue de la République', '13002 Marseille'],
      isAddressPending: false,
      phoneDisplay: '04 91 90 51 65',
      phoneHref: 'tel:+33491905165',
      hoursTitle: 'Horaires d’ouverture',
      hoursLabel: 'Horaires à compléter',
      isHoursPending: true,
      directionsUrl:
        'https://www.google.com/maps/search/?api=1&query=48+rue+de+la+R%C3%A9publique+13002+Marseille',
    },
    {
      id: 'lodi',
      name: 'Agence Lodi',
      districtLabel: 'Marseille 6e',
      imageSrc: '',
      imageAlt: 'Façade de l’Agence Lodi — Serrurerie de la République à Marseille',
      photoPlaceholderLabel: 'Photo de la façade à venir',
      addressLines: ['Adresse à compléter'],
      isAddressPending: true,
      phoneDisplay: 'Téléphone à compléter',
      phoneHref: '',
      hoursTitle: 'Horaires d’ouverture',
      hoursLabel: 'Horaires à compléter',
      isHoursPending: true,
      directionsUrl: '',
    },
  ],
};

export const FAQ_CONFIG: FaqConfig = {
  kicker: 'FAQ',
  title: 'Questions fréquentes.',
  subtitle:
    'Porte claquée, devis, reproduction de clés ou suivi après sinistre : les réponses essentielles pour préparer votre intervention.',
  contactPrompt: 'Vous avez une question spécifique sur votre serrure ou vos accès ?',
  quoteCtaLabel: 'Demander un devis',
  items: [
    {
      id: 'porte-claquee',
      question: 'Ma porte est claquée : intervenez-vous sans abîmer la serrure ?',
      answer:
        'Oui, dès lors que la porte est simplement claquée et non fermée à clé, nous privilégions systématiquement une ouverture fine non destructive. Le remplacement du cylindre n’est envisagé que si la serrure est verrouillée, défectueuse ou endommagée.',
    },
    {
      id: 'devis-prealable',
      question: 'Un devis est-il établi avant le début de l’intervention ?',
      answer:
        'Un devis détaillé vous est toujours présenté et validé avant la réalisation des travaux, qu’il s’agisse d’un dépannage en urgence, d’un changement de cylindre, d’un blindage de porte ou d’un remplacement de vitrage.',
    },
    {
      id: 'cles-badges',
      question: 'Quels types de clés et de badges pouvez-vous reproduire en boutique ?',
      answer:
        'Nous réalisons en agence la reproduction de clés plates, clés de sécurité et clés brevetées (sur présentation de la carte de propriété lorsque le fabricant l’exige), ainsi que les doubles de badges d’immeuble compatibles.',
    },
    {
      id: 'apres-sinistre',
      question: 'Comment se déroule l’accompagnement après une effraction ou un bris de glace ?',
      answer:
        'Nous assurons d’abord la mise en sécurité de votre logement ou local, puis nous préparons un devis précis accompagné d’un reportage photo utile à votre déclaration. Après accord, nous procédons à la remise en état définitive et suivons votre dossier.',
    },
    {
      id: 'marques-compatibles',
      question: 'Intervenez-vous sur toutes les marques de serrures et de portes blindées ?',
      answer:
        'Nos techniciens interviennent sur les principaux fabricants de serrurerie et de fermeture — notamment Vachette, Bricard, Fichet, Picard, DOM et ISEO — pour le dépannage, le réglage, le remplacement de cylindre A2P ou la sécurisation d’accès.',
    },
    {
      id: 'zone-marseille',
      question: 'Dans quels secteurs de Marseille et alentours intervenez-vous ?',
      answer:
        'Nous intervenons dans les différents arrondissements de Marseille (secteurs République, Joliette, Vieux-Port, Lodi, Castellane, La Timone…) ainsi que dans plusieurs communes voisines. Vous pouvez vérifier votre secteur en ligne ou nous appeler directement.',
    },
  ],
};

export const FOOTER_CONFIG: FooterConfig = {
  ctaKicker: 'Un projet, une urgence ?',
  ctaTitle: 'Parlons-en.',
  ctaSubtitle: 'Appelez-nous ou décrivez votre besoin en ligne : nous revenons vers vous rapidement.',
  tagline: 'Serrurerie, vitrerie, menuiserie et fermetures à Marseille. En boutique, chez vous et dans vos locaux.',
  servicesHeading: 'Nos métiers',
  serviceLinks: [
    { label: 'Clés & badges', pageId: 'cles-badges' },
    { label: 'Serrurerie & portes blindées', domainId: 'serrurerie' },
    { label: 'Vitrerie & miroiterie', domainId: 'vitrerie' },
    { label: 'Menuiserie', domainId: 'menuiserie' },
    { label: 'Fermetures', domainId: 'fermetures' },
  ],
  infoHeading: 'Informations',
  infoLinks: [
    { label: 'Après sinistre', pageId: 'apres-sinistre', targetId: '07_Apres_Sinistre' },
    { label: 'Avis clients', pageId: 'avis-clients', targetId: '08_Avis_Clients' },
    { label: 'Zone d’intervention', pageId: 'zone-intervention', targetId: '09_Zone_Intervention' },
    { label: 'Questions fréquentes', pageId: 'questions-frequentes', targetId: 'FAQ' },
    { label: 'Demander un devis', pageId: 'devis' },
    { label: 'Professionnels', pageId: 'professionnels' },
    { label: 'Devenir partenaire', pageId: 'devenir-partenaire' },
  ],
  agenciesHeading: 'Nos agences',
  contactHeading: 'Contact',
  quoteCtaLabel: 'Demander un devis',
};

export const WHATSAPP_CONFIG: WhatsAppConfig = {
  phoneDisplay: '04 91 90 51 65',
  label: 'WhatsApp urgence',
  ariaLabel: 'Contacter Serrurerie de la République sur WhatsApp pour une urgence',
  prefilledMessage:
    'Bonjour Serrurerie de la République, j’ai besoin d’une intervention urgente à Marseille.',
};

/** Textes communs aux pages métiers (une page par domaine). */
export interface DomainPageConfig {
  readonly breadcrumbHomeLabel: string;
  readonly breadcrumbDomainsLabel: string;
  readonly prestationsKicker: string;
  readonly prestationsTitle: string;
  readonly methodKicker: string;
  readonly methodTitle: string;
  readonly methodSteps: readonly { readonly title: string; readonly text: string }[];
  readonly otherDomainsKicker: string;
  readonly otherDomainsTitle: string;
  readonly quoteCtaLabel: string;
}

export const DOMAIN_PAGE_CONFIG: DomainPageConfig = {
  breadcrumbHomeLabel: 'Accueil',
  breadcrumbDomainsLabel: 'Nos domaines',
  prestationsKicker: 'Prestations',
  prestationsTitle: 'Ce que nous réalisons pour vous.',
  methodKicker: 'Notre méthode',
  methodTitle: 'Une intervention claire, de A à Z.',
  methodSteps: [
    { title: 'Écoute & diagnostic', text: 'Nous analysons votre besoin, en boutique ou sur place.' },
    { title: 'Devis détaillé', text: 'Un devis clair, validé avec vous avant toute intervention.' },
    { title: 'Intervention', text: 'Travaux réalisés avec soin, conformément au devis validé.' },
    { title: 'Suivi', text: 'Conseils d’entretien et accompagnement, y compris auprès de votre assureur.' },
  ],
  otherDomainsKicker: 'Nos autres domaines',
  otherDomainsTitle: 'Un même interlocuteur pour tous vos accès.',
  quoteCtaLabel: 'Demander un devis',
};

/** Une étape numérotée (méthode, parcours…). */
export interface NumberedStep {
  readonly title: string;
  readonly text: string;
}

/** Contenu commun d'une page thématique (en-tête + référencement). */
export interface ThematicPageBase {
  readonly kicker: string;
  readonly title: string;
  readonly intro: string;
  readonly seoTitle: string;
  readonly seoDescription: string;
}

export interface KeysBadgesPageConfig extends ThematicPageBase {
  readonly servicesKicker: string;
  readonly servicesTitle: string;
  readonly services: readonly {
    readonly icon: KeysBadgeIconKey;
    readonly title: string;
    readonly text: string;
  }[];
  readonly stepsKicker: string;
  readonly stepsTitle: string;
  readonly steps: readonly NumberedStep[];
}

export const KEYS_BADGES_PAGE_CONFIG: KeysBadgesPageConfig = {
  kicker: 'Reproduction en boutique',
  title: 'Clés & badges',
  intro:
    'Doubles de clés et de badges d’accès, réalisés en boutique à partir de votre original, dans nos agences de Marseille.',
  seoTitle: 'Double de clés et badges à Marseille | Serrurerie de la République',
  seoDescription:
    'Reproduction de clés et de badges d’accès en boutique à Marseille, à partir de votre original. Agences République (2e) et Lodi (6e).',
  servicesKicker: 'Nos services',
  servicesTitle: 'Deux savoir-faire au comptoir.',
  services: [
    {
      icon: 'key',
      title: 'Reproduction de clés',
      text: 'Un double réalisé à partir de votre clé d’origine, vérifié avant de vous être remis.',
    },
    {
      icon: 'badge',
      title: 'Reproduction de badges',
      text: 'Copie de badges d’accès à partir de votre badge d’origine, selon la compatibilité du modèle.',
    },
  ],
  stepsKicker: 'Comment ça marche',
  stepsTitle: 'Simple, en trois étapes.',
  steps: [
    { title: 'Venez avec l’original', text: 'Apportez la clé ou le badge à reproduire dans l’une de nos agences.' },
    { title: 'Vérification du modèle', text: 'Nous identifions le modèle et vous indiquons le délai et le tarif.' },
    { title: 'Reproduction & essai', text: 'Votre double est réalisé et contrôlé avant de vous être remis.' },
  ],
};

export interface AfterIncidentPageConfig extends ThematicPageBase {
  readonly stepsKicker: string;
  readonly stepsTitle: string;
  readonly insuranceKicker: string;
  readonly insuranceTitle: string;
}

export const AFTER_INCIDENT_PAGE_CONFIG: AfterIncidentPageConfig = {
  kicker: 'Après sinistre',
  title: 'Du premier diagnostic à la remise en état.',
  intro:
    'Effraction, vandalisme ou bris de glace : nous sécurisons les lieux, établissons un devis détaillé avec reportage photo et assurons la remise en état.',
  seoTitle: 'Après effraction ou bris de glace à Marseille | Serrurerie de la République',
  seoDescription:
    'Mise en sécurité, devis détaillé et reportage photo pour votre assurance, réparation ou remplacement après effraction, vandalisme ou bris de glace à Marseille.',
  stepsKicker: 'Notre accompagnement',
  stepsTitle: 'Quatre étapes, un seul interlocuteur.',
  insuranceKicker: 'Assurance',
  insuranceTitle: 'Un dossier complet pour votre assureur.',
};

export interface ContactPageConfig extends ThematicPageBase {
  readonly channelsKicker: string;
  readonly channelsTitle: string;
  readonly channels: readonly {
    readonly id: 'phone' | 'whatsapp' | 'quote';
    readonly title: string;
    readonly text: string;
    readonly ctaLabel: string;
  }[];
}

export const CONTACT_PAGE_CONFIG: ContactPageConfig = {
  kicker: 'Agences & contact',
  title: 'Deux boutiques au cœur de Marseille.',
  intro:
    'Retrouvez-nous en agence, appelez-nous ou décrivez votre besoin en ligne : nous vous répondons rapidement.',
  seoTitle: 'Agences et contact — Serrurerie à Marseille | Serrurerie de la République',
  seoDescription:
    'Nos agences République (2e) et Lodi (6e) à Marseille : adresses, téléphone, WhatsApp, demande de devis et zone d’intervention.',
  channelsKicker: 'Nous contacter',
  channelsTitle: 'Le moyen qui vous arrange.',
  channels: [
    {
      id: 'phone',
      title: 'Par téléphone',
      text: 'Le plus rapide pour une urgence ou une question.',
      ctaLabel: 'Appeler',
    },
    {
      id: 'whatsapp',
      title: 'Par WhatsApp',
      text: 'Envoyez un message et des photos de votre problème.',
      ctaLabel: 'Écrire sur WhatsApp',
    },
    {
      id: 'quote',
      title: 'Devis en ligne',
      text: 'Décrivez votre besoin, nous revenons vers vous avec un devis.',
      ctaLabel: 'Demander un devis',
    },
  ],
};
