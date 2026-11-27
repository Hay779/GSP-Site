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
      'Le site serrurerierepublique.fr est édité par SERRURERIE DE LA REPUBLIQUE, conformément à l’article 6 de la loi du 21 juin 2004 pour la confiance dans l’économie numérique.',
      'Société à responsabilité limitée (SARL) au capital de 1 000 €.',
      'Siège social : 48 rue de la République, 13002 Marseille.',
      'Immatriculée au RCS de Marseille sous le numéro 106 157 118 — SIREN 106 157 118 — SIRET 106 157 118 00014.',
      'TVA intracommunautaire : FR93106157118 — Code APE : 43.32B (travaux de menuiserie métallique et serrurerie).',
      'Téléphone : 04 91 90 51 65 — Mobile / WhatsApp : 06 50 70 44 52.',
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
      'Téléphone : 1007 — site : www.ovhcloud.com.',
    ],
  },
  {
    heading: 'Activité et assurance',
    paragraphs: [
      'Services de serrurerie, vitrerie, menuiserie et fermetures, avec dépannage et intervention après sinistre.',
      'Responsabilité civile professionnelle souscrite auprès d’Allianz. Couverture géographique : France.',
    ],
  },
  {
    heading: 'Propriété intellectuelle',
    paragraphs: [
      'Les textes, photographies, logos, graphismes et la structure du site sont la propriété de SERRURERIE DE LA REPUBLIQUE ou utilisés avec autorisation. Toute reproduction, représentation, modification ou exploitation, même partielle, sans accord écrit préalable, est interdite et peut engager la responsabilité de son auteur.',
    ],
  },
  {
    heading: 'Photographies',
    paragraphs: [
      'Certaines photographies présentes sur le site sont des visuels d’illustration et ne représentent pas nécessairement des interventions réalisées par l’entreprise.',
    ],
  },
  {
    heading: 'Responsabilité',
    paragraphs: [
      'Les informations du site sont données à titre indicatif et ne remplacent pas un devis. Seul le devis signé engage SERRURERIE DE LA REPUBLIQUE. Nous faisons le nécessaire pour que le site soit exact et accessible, sans garantir l’absence d’interruption ou d’erreur. Nous ne sommes pas responsables du contenu des sites tiers vers lesquels le site renvoie.',
    ],
  },
  {
    heading: 'Liens hypertextes',
    paragraphs: [
      'Un lien vers le site est autorisé s’il ne porte pas atteinte à son image et n’induit pas en erreur sur l’origine des services. Nous pouvons demander le retrait d’un lien à tout moment.',
    ],
  },
  {
    heading: 'Droit applicable',
    paragraphs: [
      'Le site est soumis au droit français. En cas de litige avec un professionnel, les tribunaux de Marseille sont compétents. Un consommateur peut saisir la juridiction de son choix, dans les conditions prévues par la loi.',
      'Les conditions de vente et d’intervention sont consultables sur la page « Conditions générales de vente ».',
    ],
  },
];

const LEGAL_PRIVACY: readonly LegalArticle[] = [
  {
    heading: 'Responsable du traitement',
    paragraphs: [
      'SERRURERIE DE LA REPUBLIQUE, 48 rue de la République, 13002 Marseille, représentée par son gérant, Grigor Galstyan.',
      'Nous n’utilisons vos données que pour répondre à votre demande, établir un devis et réaliser l’intervention. Nous vous rappelons dans les 24 heures suivant l’envoi du formulaire.',
    ],
  },
  {
    heading: 'Données collectées',
    paragraphs: [
      'Via les formulaires du site (demande de devis, envoi de photos après sinistre, demande de partenariat) ou par téléphone : nom, numéro de téléphone, adresse de l’intervention, type de demande et message. Nous ne vous demandons aucune donnée que la demande ne nécessite pas.',
    ],
  },
  {
    heading: 'Finalités et bases légales',
    paragraphs: [
      'Répondre à votre demande et vous rappeler sous 24 h : mesures précontractuelles prises à votre demande.',
      'Établir le devis, réaliser l’intervention, facturer : exécution du contrat.',
      'Conserver les documents comptables : obligation légale.',
      'Nous défendre en cas de litige : intérêt légitime.',
    ],
  },
  {
    heading: 'Durées de conservation',
    paragraphs: [
      'Demande sans suite : 3 ans maximum à compter du dernier contact, puis suppression.',
      'Devis, factures et pièces comptables : 10 ans, conformément au Code de commerce.',
      'Enregistrements téléphoniques, s’il y en a : 6 mois.',
      'Les justificatifs d’identité et d’occupation recueillis avant une ouverture de porte, ainsi que les photos de l’intervention, sont conservés 5 ans pour pouvoir prouver les faits en cas de litige.',
    ],
  },
  {
    heading: 'Destinataires',
    paragraphs: [
      'Vos données sont réservées à SERRURERIE DE LA REPUBLIQUE et à ses prestataires techniques (hébergeur OVH, messagerie, comptable), qui n’agissent que sur nos instructions. Elles ne sont ni vendues ni cédées. Elles peuvent être transmises à votre assureur pour un dossier sinistre, à votre demande, ou à une autorité qui l’exige légalement.',
    ],
  },
  {
    heading: 'Vos droits (RGPD)',
    paragraphs: [
      'Vous disposez d’un droit d’accès, de rectification, d’effacement, d’opposition, de limitation et de portabilité. Exercez-les par courrier à SERRURERIE DE LA REPUBLIQUE, 48 rue de la République, 13002 Marseille, ou en nous contactant via le formulaire du site, en joignant au besoin un justificatif d’identité. Nous répondons dans un délai d’un mois.',
      'Si la réponse ne vous satisfait pas, vous pouvez saisir la CNIL (cnil.fr).',
    ],
  },
  {
    heading: 'Sécurité',
    paragraphs: [
      'Le site est servi en HTTPS et l’accès aux données est limité aux personnes qui en ont besoin. Aucun traitement ne garantit un risque nul : en cas de violation de données, nous appliquons les obligations de notification prévues par le RGPD.',
    ],
  },
  {
    heading: 'Cookies et mesure d’audience',
    paragraphs: [
      'Le site utilise Google Analytics (Google Ireland Limited) pour mesurer sa fréquentation : pages vues, provenance des visites (moteur de recherche, réseau social, lien direct), type d’appareil, ville approximative, et clics sur les boutons d’appel, WhatsApp et de demande de devis. Les signaux publicitaires de Google sont désactivés.',
      'Ces cookies (_ga, _ga_*) ne sont déposés qu’après votre accord, donné dans la bannière affichée lors de votre première visite. Sans accord, aucun script Google n’est chargé. Votre choix est conservé 6 mois ; vous pouvez le modifier à tout moment avec le lien « Gérer les cookies » en bas de chaque page.',
      'Les données de mesure d’audience sont conservées 14 mois au maximum. Elles peuvent être traitées par Google en dehors de l’Union européenne, dans le cadre du Data Privacy Framework UE–États-Unis.',
      'Indépendamment de Google Analytics, le site tient ses propres statistiques de fréquentation, sans cookie et sans aucune donnée personnelle : nombre de pages vues, provenance générale de la visite (moteur de recherche, annuaire, réseau social, QR code, accès direct) et type d’appareil (téléphone ou ordinateur). Rien n’est lu ni enregistré sur votre appareil et aucune adresse IP n’est conservée ; seuls des totaux par jour sont gardés.',
      'Le site ne dépose aucun autre cookie. Les formulaires n’utilisent pas de cookies.',
    ],
  },
];

const LEGAL_CGV: readonly LegalArticle[] = [
  {
    heading: 'Préambule',
    paragraphs: [
      'Ces conditions règlent toute prestation et toute vente de SERRURERIE DE LA REPUBLIQUE, avec un devis préalable, un prix connu avant les travaux et des obligations claires pour chaque partie. Elles sont acceptées par la signature (ou l’acceptation électronique ou orale confirmée par SMS) du devis ou du bon d’intervention.',
    ],
  },
  {
    heading: 'Article 1 – Objet et champ d’application',
    paragraphs: [
      'Elles s’appliquent aux prestations de serrurerie, vitrerie, menuiserie, fermetures et dépannage, à la vente de fournitures et à la reproduction de clés et de badges. Elles s’appliquent aux consommateurs comme aux professionnels, sauf mention contraire. Pour un professionnel, elles prévalent sur ses propres conditions d’achat. Seul un écrit signé par les deux parties y déroge.',
    ],
  },
  {
    heading: 'Article 2 – Le prestataire',
    paragraphs: [
      'SERRURERIE DE LA REPUBLIQUE, SARL au capital de 1 000 €, 48 rue de la République, 13002 Marseille, SIREN 106 157 118, RCS Marseille, TVA FR93106157118. Téléphone : 04 91 90 51 65 — mobile : 06 50 70 44 52.',
    ],
  },
  {
    heading: 'Article 3 – Devis et commande',
    paragraphs: [
      'Un devis détaillé et gratuit est remis avant tout travaux : nature de l’intervention, fournitures, main-d’œuvre, déplacement, majorations éventuelles, TVA et prix total. Il est valable 30 jours. La commande est ferme dès son acceptation par le client. En cas d’urgence, le devis peut être accepté sur place, par signature ou par SMS, avant le début de l’intervention. Aucun travail n’est commencé sans accord sur le prix. Tout travail supplémentaire fait l’objet d’un nouvel accord du client.',
    ],
  },
  {
    heading: 'Article 4 – Prix',
    paragraphs: [
      'Les prix sont en euros. Les prix aux consommateurs sont indiqués toutes taxes comprises, au taux de TVA applicable à la prestation. Les déplacements, le diagnostic et les majorations (50 % sur le déplacement et la main-d’œuvre, de 20 h à 6 h, les dimanches et jours fériés) sont indiqués au devis. Un diagnostic ou un déplacement est dû même si le client renonce aux travaux après avoir reçu le devis. Pour bénéficier d’un taux de TVA réduit, le client remet l’attestation exigée par la loi, à défaut de quoi le taux normal s’applique.',
    ],
  },
  {
    heading: 'Article 5 – Ouverture de porte et intervention d’urgence',
    paragraphs: [
      'Avant toute ouverture, le client justifie de son identité et de son droit d’occuper les lieux (pièce d’identité et justificatif de domicile, bail, titre de propriété ou équivalent). Nous refusons d’intervenir sans justificatif, sans que ce refus ouvre droit à indemnité. Le client garantit qu’il est le légitime occupant ou qu’il agit pour lui, et répond des conséquences d’une fausse déclaration.',
      'Nous choisissons d’abord la méthode la moins destructrice. Si l’ouverture sans dégât n’est pas possible, le client accepte, avant l’intervention, l’ouverture destructive (perçage, démontage, remplacement de la serrure ou du cylindre), reportée au devis. Nous pouvons remettre les lieux en sécurité provisoirement si la réparation n’est pas possible tout de suite.',
    ],
  },
  {
    heading: 'Article 6 – Droit de rétractation',
    paragraphs: [
      'Quand le contrat est conclu hors de notre boutique (au domicile du client ou à distance), le consommateur dispose en principe de 14 jours pour se rétracter, sans motif. Ce droit ne s’applique pas aux travaux d’entretien ou de réparation à effectuer en urgence au domicile du consommateur et demandés expressément par lui, ni aux biens confectionnés selon ses spécifications ou nettement personnalisés (serrure à mesure, vitrage à la cote, clé reproduite).',
      'Si le client demande expressément que l’intervention commence avant la fin du délai de 14 jours, il paie la part de prestation déjà réalisée et reconnaît perdre son droit une fois la prestation intégralement exécutée. Un contrat conclu en boutique n’ouvre pas de droit légal de rétractation.',
    ],
  },
  {
    heading: 'Article 7 – Paiement',
    paragraphs: [
      'Le solde est payé comptant à la fin de l’intervention, par carte bancaire, virement ou espèces dans la limite légale. Un acompte de 30 % peut être demandé à la commande pour les devis importants et pour toute fourniture sur mesure, sauf quand la loi l’interdit (contrat conclu à la suite d’un démarchage). Aucun escompte n’est accordé pour paiement anticipé.',
    ],
  },
  {
    heading: 'Article 8 – Retard de paiement',
    paragraphs: [
      'Tout retard de paiement entraîne de plein droit, pour un client professionnel, des pénalités au taux de trois fois le taux d’intérêt légal, ainsi qu’une indemnité forfaitaire de 40 € pour frais de recouvrement, sans préjudice d’une indemnité complémentaire sur justificatif. Pour un consommateur, les sommes dues portent intérêt au taux légal après mise en demeure restée sans effet. Les fournitures restent notre propriété jusqu’au paiement intégral du prix, dans les limites de la loi.',
    ],
  },
  {
    heading: 'Article 9 – Obligations du client',
    paragraphs: [
      'Le client donne des informations exactes, assure l’accès aux lieux et la présence d’un adulte, retire ou protège les objets fragiles ou de valeur, et signale les risques connus (animaux, chantier, installation électrique). Un déplacement inutile est facturé : client absent ou injoignable, adresse erronée, annulation tardive ou refus du devis sur place, selon le tarif de déplacement indiqué au devis. Le technicien peut interrompre une intervention qui met sa sécurité en danger.',
    ],
  },
  {
    heading: 'Article 10 – Délais',
    paragraphs: [
      'Les délais d’intervention ou de livraison sont indicatifs, sauf engagement écrit sur une date. En cas de retard important, le client consommateur peut procéder selon les conditions prévues par la loi. Nous ne sommes pas responsables d’un retard dû à un cas de force majeure, à un défaut d’accès ou à un manquement de fournisseur que nous ne pouvions prévoir.',
    ],
  },
  {
    heading: 'Article 11 – Garanties',
    paragraphs: [
      'Les fournitures bénéficient de la garantie légale de conformité (consommateur) et de la garantie des vices cachés, ainsi que de la garantie du fabricant. Garantie commerciale : notre main-d’œuvre est garantie 3 mois à compter de l’intervention.',
      'La garantie ne couvre pas l’usure normale, un mauvais usage, une intervention d’un tiers, une nouvelle effraction ou un défaut lié à un support (huisserie, porte, mur) que nous n’avons pas fait remplacer. Pour les ouvrages relevant de la construction, les garanties légales de la loi s’appliquent.',
    ],
  },
  {
    heading: 'Article 12 – Responsabilité',
    paragraphs: [
      'Nous répondons des dommages directs causés par notre faute, dans le cadre de notre assurance de responsabilité civile professionnelle. Notre responsabilité ne couvre pas : les dommages causés par l’état antérieur de la porte, de la serrure ou du support ; les dégâts inhérents à une ouverture destructive acceptée au devis ; les conséquences d’informations inexactes ou d’un justificatif falsifié ; les pertes indirectes (perte d’exploitation, de loyer, de clientèle) ; les dommages dus à un cas de force majeure.',
      'Envers un professionnel, notre responsabilité est limitée au prix de la prestation concernée. Ces limites ne s’appliquent pas aux dommages corporels, à la faute lourde ou intentionnelle, ni dans les cas où la loi l’interdit, notamment à l’égard des consommateurs.',
    ],
  },
  {
    heading: 'Article 13 – Clés et badges',
    paragraphs: [
      'La reproduction de clés et de badges se fait en boutique, sur présentation de l’original. Pour une clé protégée ou un badge d’immeuble, nous demandons la carte de propriété ou une autorisation écrite du syndic ou du propriétaire, et nous refusons sans justificatif. Le client garantit qu’il est autorisé à reproduire la clé ou le badge. Nous ne garantissons pas le fonctionnement d’un double réalisé à partir d’un original usé ou déformé.',
    ],
  },
  {
    heading: 'Article 14 – Sinistre et assurance',
    paragraphs: [
      'Après un sinistre, nous établissons un devis détaillé avec des photos de l’état constaté, utiles à la déclaration. Le remboursement relève de l’assureur et n’est pas garanti par nous. Sauf convention de paiement direct avec l’assureur, le client reste débiteur du prix, quel que soit le résultat de sa déclaration.',
    ],
  },
  {
    heading: 'Article 15 – Preuves et réserves',
    paragraphs: [
      'Le bon d’intervention signé (sur papier, sur écran ou confirmé par SMS) fait foi de l’intervention et de son prix. Avant et après l’intervention, le technicien peut photographier la porte, la serrure, les lieux et le justificatif présenté. Ces photos et ces justificatifs sont conservés 5 ans et peuvent servir de preuve en cas de litige, ou à la demande d’un assureur ou d’une autorité.',
      'Le client vérifie le travail en présence du technicien et note toute réserve sur le bon d’intervention. Un défaut apparent non signalé à ce moment doit l’être par écrit sous 8 jours, avec photos, sans réduire les garanties légales du consommateur.',
    ],
  },
  {
    heading: 'Article 16 – Sécurité et respect des équipes',
    paragraphs: [
      'Les injures, menaces, violences ou pressions envers un technicien ou un membre de l’équipe mettent fin à l’intervention. Le déplacement et les travaux déjà réalisés restent dus, et nous pouvons déposer plainte. Le technicien peut refuser ou interrompre une intervention dans des lieux dangereux ou face à une personne agressive.',
      'Les techniciens agissent au nom et pour le compte de SERRURERIE DE LA REPUBLIQUE : toute réclamation s’adresse à la société, et non à eux à titre personnel, sauf quand la loi en décide autrement.',
    ],
  },
  {
    heading: 'Article 17 – Prévention de la fraude',
    paragraphs: [
      'Nous refusons d’intervenir en cas de doute sur l’identité du client, sur son droit d’occuper les lieux ou sur l’origine d’une demande de double de clé, ou si un tiers conteste la demande. Dans ce cas, le déplacement reste dû, nous ne donnons pas suite à l’ouverture ou à la reproduction, et nous pouvons alerter les forces de l’ordre. Nous coopérons avec les autorités sur réquisition. Celui qui fait une fausse déclaration ou présente un faux justificatif s’expose à des poursuites et nous rembourse les frais et dommages qui en résultent.',
    ],
  },
  {
    heading: 'Article 18 – Impayés et rétention',
    paragraphs: [
      'En cas de non-paiement, nous pouvons retenir les objets qui nous ont été confiés (clés, serrures, pièces à réparer) jusqu’au règlement complet. Un chèque ou un paiement rejeté donne lieu au remboursement des frais bancaires engagés. Le client conteste une facture par écrit sous 8 jours et règle la part non contestée. Nous pouvons refuser une nouvelle intervention à un client qui a un impayé, sauf danger immédiat. Nous recouvrons les sommes dues par tous moyens légaux, y compris par huissier ou en justice, et les frais engagés sont à la charge du client, dans les limites de la loi pour un consommateur.',
    ],
  },
  {
    heading: 'Article 19 – Données personnelles',
    paragraphs: [
      'Les données du client sont traitées selon la politique de confidentialité du site, que le client reconnaît avoir consultée.',
    ],
  },
  {
    heading: 'Article 20 – Réclamations',
    paragraphs: [
      'Toute réclamation s’adresse par écrit à SERRURERIE DE LA REPUBLIQUE, 48 rue de la République, 13002 Marseille (ou via le formulaire du site), avec le numéro du devis ou de la facture. Nous répondons sous 15 jours.',
    ],
  },
  {
    heading: 'Article 21 – Droit applicable et litiges',
    paragraphs: [
      'Les présentes conditions sont soumises au droit français. Si une clause est jugée invalide, les autres restent applicables. Pour les litiges avec un professionnel, les tribunaux de Marseille sont compétents. Le consommateur peut saisir la juridiction du lieu de son domicile ou de l’exécution de la prestation, dans les conditions fixées par la loi.',
      'Dernière mise à jour : 25 novembre 2026.',
    ],
  },
];

/** Pages assemblées à partir de blocs (la page /devis a son propre composant). */
export type BlockPageId = Exclude<PageId, 'devis' | 'devenir-partenaire' | 'promotions' | 'offre' | 'gestion'>;


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
      imageSrc: '/src/assets/images/pro_syndics.webp',
      imagePosition: '45% 50%',
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
      imageSrc: '/src/assets/images/pro_assureurs.webp',
      imagePosition: '60% 40%',
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
      imageSrc: '/src/assets/images/pro_immobilier.webp',
      imagePosition: '55% 40%',
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

  cgv: {
    seoTitle: 'Conditions générales de vente — Serrurerie de la République',
    seoDescription: 'Conditions générales de vente et d’intervention de Serrurerie de la République, Marseille : devis, urgence, ouverture de porte, garanties.',
    hero: { kicker: 'Informations réglementaires', title: 'Conditions générales de vente.', intro: 'Devis, urgence, paiement, garanties : les règles de nos prestations.', compact: true, actions: [] },
    blocks: [{ type: 'legal', id: 'page-legal', tone: 'light', kicker: 'CGV', title: 'Vente & intervention.', articles: LEGAL_CGV }],
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
    return route.id === 'devis' || route.id === 'devenir-partenaire' || route.id === 'promotions' || route.id === 'offre' || route.id === 'gestion'
      ? null
      : THEMATIC_PAGES[route.id];
  }
  return null;
}
