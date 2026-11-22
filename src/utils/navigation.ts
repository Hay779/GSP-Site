export type SectionId =
  | '01_Entete'
  | '02_Hero'
  | '03_Urgence'
  | '04_Cles_Badges'
  | '05_Nos_Domaines'
  | '06_Marques'
  | '07_Apres_Sinistre'
  | '08_Avis_Clients'
  | '09_Zone_Intervention'
  | '10_Nos_Agences'
  | 'FAQ'
  | '11_Pied_De_Page';

export type SectionSurface = 'primary' | 'secondary' | 'footer';
export type SectionDensity = 'hero' | 'band' | 'standard' | 'footer';

export interface BrandConfig {
  readonly name: string;
  readonly city: string;
  readonly phoneDisplay: string;
  readonly phoneHref: string;
}

export interface HeaderNavItem {
  readonly label: string;
  readonly targetId: SectionId;
  readonly href: `#${SectionId}`;
}

export interface SiteSectionSpec {
  readonly id: SectionId;
  readonly indexLabel: string;
  readonly provisionalTitle: string;
  readonly summary: string;
  readonly toComplete: readonly string[];
  readonly surface: SectionSurface;
  readonly density: SectionDensity;
  readonly hasBrassRules?: boolean;
}

export const BRAND_CONFIG: BrandConfig = {
  name: 'Serrurerie de la République',
  city: 'MARSEILLE',
  phoneDisplay: '04 91 90 51 65',
  phoneHref: 'tel:+33491905165',
};

export const HEADER_NAV_ITEMS: readonly HeaderNavItem[] = [
  {
    label: 'Clés & badges',
    targetId: '04_Cles_Badges',
    href: '#04_Cles_Badges',
  },
  {
    label: 'Nos domaines',
    targetId: '05_Nos_Domaines',
    href: '#05_Nos_Domaines',
  },
  {
    label: 'Après sinistre',
    targetId: '07_Apres_Sinistre',
    href: '#07_Apres_Sinistre',
  },
  {
    label: 'Nos agences',
    targetId: '10_Nos_Agences',
    href: '#10_Nos_Agences',
  },
];

export const SITE_SECTIONS: readonly SiteSectionSpec[] = [
  {
    id: '01_Entete',
    indexLabel: '01',
    provisionalTitle: 'En-tête',
    summary: 'Logo, navigation courte, menu mobile et bouton d’appel direct.',
    toComplete: [],
    surface: 'primary',
    density: 'band',
  },
  {
    id: '02_Hero',
    indexLabel: '02',
    provisionalTitle: 'Vos clés. Vos accès. Notre savoir-faire.',
    summary:
      'Haut de page plein écran prêt pour vidéo d’arrière-plan, visuel artisanal de repli, deux boutons d’action et engagements.',
    toComplete: ['Fichier vidéo plein écran définitif à renseigner dans heroConfig'],
    surface: 'primary',
    density: 'hero',
  },
  {
    id: '03_Urgence',
    indexLabel: '03',
    provisionalTitle: 'Porte claquée ? Porte forcée ?',
    summary:
      'Bandeau d’urgence sobre et immédiatement identifiable avec accès direct à l’appel téléphonique.',
    toComplete: [],
    surface: 'secondary',
    density: 'band',
    hasBrassRules: true,
  },
  {
    id: '04_Cles_Badges',
    indexLabel: '04',
    provisionalTitle: 'Vos doubles de clés et de badges, tout simplement.',
    summary:
      'Bloc prioritaire dédié à la reproduction en boutique : photo, services proposés et lien vers nos agences.',
    toComplete: [],
    surface: 'primary',
    density: 'standard',
  },
  {
    id: '05_Nos_Domaines',
    indexLabel: '05',
    provisionalTitle: 'Un savoir-faire pour tous vos accès.',
    summary:
      'Quatre cartes dédiées : serrurerie & portes blindées, vitrerie & miroiterie, menuiserie et fermetures.',
    toComplete: [],
    surface: 'primary',
    density: 'standard',
  },
  {
    id: '06_Marques',
    indexLabel: '06',
    provisionalTitle: 'Marques',
    summary:
      'Bandeau discret présentant les marques de serrurerie proposées ou prises en charge.',
    toComplete: ['Sélection des marques à confirmer avant publication'],
    surface: 'primary',
    density: 'band',
    hasBrassRules: true,
  },
  {
    id: '07_Apres_Sinistre',
    indexLabel: '07',
    provisionalTitle: 'Du premier diagnostic à la remise en état.',
    summary:
      'Accompagnement après effraction, vandalisme ou bris de glace en 4 étapes, formulaire de besoin, envoi de photos et mention d’assurance à confirmer.',
    toComplete: ['Lien avec Allianz à préciser avant publication'],
    surface: 'primary',
    density: 'standard',
  },
  {
    id: '08_Avis_Clients',
    indexLabel: '08',
    provisionalTitle: 'L’expérience de nos clients.',
    summary:
      'Trois emplacements dédiés aux avis clients vérifiés et bouton d’accès vers l’ensemble des avis.',
    toComplete: [
      '3 avis vérifiés (texte, nom, date, source) à intégrer',
      'Lien vers la page d’avis vérifiés à renseigner',
    ],
    surface: 'primary',
    density: 'standard',
    hasBrassRules: true,
  },
  {
    id: '09_Zone_Intervention',
    indexLabel: '09',
    provisionalTitle: 'Un service de proximité.',
    summary:
      'Secteurs marseillais et communes voisines indicatifs, vérificateur de secteur interactif et emplacement carte.',
    toComplete: ['Périmètre exact des quartiers et communes à confirmer', 'Carte définitive à intégrer'],
    surface: 'primary',
    density: 'standard',
    hasBrassRules: true,
  },
  {
    id: '10_Nos_Agences',
    indexLabel: '10',
    provisionalTitle: 'Retrouvez-nous en boutique.',
    summary:
      'Fiches Agence République et Agence Rome avec emplacement photo, coordonnées, horaires à compléter et boutons Appeler / Itinéraire.',
    toComplete: [
      'Photos des agences à intégrer',
      'Horaires Agence République à compléter',
      'Horaires des agences et photos des façades à compléter',
    ],
    surface: 'primary',
    density: 'standard',
    hasBrassRules: true,
  },
  {
    id: 'FAQ',
    indexLabel: '11',
    provisionalTitle: 'Questions fréquentes.',
    summary:
      'Accordéon sur fond clair répondant aux questions courantes sur les ouvertures de portes, devis, clés/badges, marques et suivi après sinistre.',
    toComplete: [],
    surface: 'primary',
    density: 'standard',
    hasBrassRules: true,
  },
  {
    id: '11_Pied_De_Page',
    indexLabel: '12',
    provisionalTitle: 'Pied de page',
    summary:
      'Identité de marque, raccourcis services, informations, contact direct, demande de devis et fenêtres Mentions légales / Confidentialité.',
    toComplete: ['Mentions légales et politique de confidentialité à compléter avant publication'],
    surface: 'footer',
    density: 'footer',
    hasBrassRules: true,
  },
];

export const PROVISIONAL_SECTIONS: readonly SiteSectionSpec[] = SITE_SECTIONS.filter(
  (section) => section.id !== '01_Entete'
);

/**
 * Formats a French display phone number (e.g. "04 91 90 51 65") into a valid tel: URI.
 */
export function formatTelHref(phoneDisplay: string): string {
  const digits = phoneDisplay.replace(/\D/g, '');
  if (digits.length === 10 && digits.startsWith('0')) {
    return `tel:+33${digits.slice(1)}`;
  }
  if (digits.startsWith('33') && digits.length === 11) {
    return `tel:+${digits}`;
  }
  return `tel:${digits}`;
}

export interface SectionPosition {
  readonly id: SectionId;
  readonly top: number;
}

/**
 * Determines which navigation target section is currently active given viewport-relative tops.
 */
export function resolveActiveSectionId(
  positions: readonly SectionPosition[],
  navTargets: readonly SectionId[],
  activationOffset = 140
): SectionId | null {
  if (positions.length === 0 || navTargets.length === 0) {
    return null;
  }

  const targetSet = new Set<SectionId>(navTargets);
  let active: SectionId | null = null;

  for (const pos of positions) {
    if (pos.top <= activationOffset && targetSet.has(pos.id)) {
      active = pos.id;
    }
  }

  return active;
}

export interface StructureValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

const EXPECTED_SECTION_ORDER: readonly SectionId[] = [
  '01_Entete',
  '02_Hero',
  '03_Urgence',
  '04_Cles_Badges',
  '05_Nos_Domaines',
  '06_Marques',
  '07_Apres_Sinistre',
  '08_Avis_Clients',
  '09_Zone_Intervention',
  '10_Nos_Agences',
  'FAQ',
  '11_Pied_De_Page',
];

export function validateSiteStructure(
  sections: readonly SiteSectionSpec[],
  navItems: readonly HeaderNavItem[]
): StructureValidationResult {
  const errors: string[] = [];

  if (sections.length !== EXPECTED_SECTION_ORDER.length) {
    errors.push(
      `Expected ${EXPECTED_SECTION_ORDER.length} sections, got ${sections.length}.`
    );
  }

  sections.forEach((section, index) => {
    const expectedId = EXPECTED_SECTION_ORDER[index];
    if (section.id !== expectedId) {
      errors.push(
        `Section at index ${index} should be "${expectedId}", got "${section.id}".`
      );
    }
  });

  const sectionIds = new Set(sections.map((s) => s.id));
  for (const nav of navItems) {
    if (!sectionIds.has(nav.targetId)) {
      errors.push(`Nav item "${nav.label}" targets unknown section "${nav.targetId}".`);
    }
    if (nav.href !== `#${nav.targetId}`) {
      errors.push(
        `Nav item "${nav.label}" href "${nav.href}" does not match "#${nav.targetId}".`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
