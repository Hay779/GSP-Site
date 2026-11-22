import type { DomainCardItem } from './sectionsContent';

/** Icônes disponibles pour les cartes « prestations » des pages métiers. */
export type FeatureIconKey =
  | 'door'
  | 'lock'
  | 'shield'
  | 'wrench'
  | 'glass'
  | 'store'
  | 'mirror'
  | 'window'
  | 'thermo'
  | 'shutter'
  | 'garage'
  | 'motor';

/** Icônes disponibles pour les étapes (« méthode », « comment ça marche »). */
export type ProcessIconKey = 'hand' | 'search' | 'file' | 'wrench' | 'folder' | 'settings';

export interface FeatureCard {
  readonly icon: FeatureIconKey;
  readonly title: string;
  readonly text: string;
}

/** Un exemple d'intervention présenté en « avant / après ». */
export interface BeforeAfterCase {
  readonly title: string;
  readonly text: string;
  readonly beforeSrc: string;
  readonly beforeAlt: string;
  /** Cadrage CSS (object-position) de la photo « avant ». */
  readonly beforePosition?: string;
  readonly afterSrc: string;
  readonly afterAlt: string;
  readonly afterPosition?: string;
  /**
   * Photos d'illustration (pas une intervention réelle) : un badge le signale sur le site.
   * À passer à false une fois les vraies photos de chantier fournies.
   */
  readonly illustrative: boolean;
}

export interface DomainPageExtras {
  /** Points rassurants du haut de page. */
  readonly highlights: readonly string[];
  readonly features: readonly FeatureCard[];
  /** Exemples avant / après (bloc masqué s'il est vide). */
  readonly beforeAfter: readonly BeforeAfterCase[];
  /** Affiche le bloc des marques (serrurerie uniquement). */
  readonly showBrands: boolean;
}

export const DOMAIN_PAGE_EXTRAS: Readonly<Record<DomainCardItem['id'], DomainPageExtras>> = {
  serrurerie: {
    highlights: ['Devis avant intervention', 'Marseille & alentours', 'Particuliers & professionnels'],
    features: [
      { icon: 'door', title: 'Ouverture de porte', text: 'Porte claquée ou verrouillée, sans dégradation lorsque c’est possible.' },
      { icon: 'lock', title: 'Serrures & cylindres', text: 'Cylindres, serrures multipoints et verrous haute sécurité.' },
      { icon: 'shield', title: 'Blindage', text: 'Blindage de porte, blocs-portes blindés, sécurisation après effraction.' },
      { icon: 'wrench', title: 'Entretien & réglage', text: 'Pour les particuliers, les syndics et les commerces.' },
    ],
    beforeAfter: [
      {
        title: 'Porte forcée : sécurisation et remplacement du cylindre',
        text: 'Après une tentative d’effraction : mise en sécurité, nouveau cylindre et remise en état de la porte.',
        beforeSrc: '/src/assets/images/as_banniere.jpg',
        beforeAlt: 'Porte d’entrée forcée, bois arraché autour de la serrure.',
        beforePosition: '22% 50%',
        afterSrc: '/src/assets/images/domaine_serrurerie_1795289920360.jpg',
        afterAlt: 'Porte d’entrée remise en état avec un cylindre neuf.',
        afterPosition: '50% 50%',
        illustrative: true,
      },
    ],
    showBrands: true,
  },
  vitrerie: {
    highlights: ['Mise en sécurité rapide', 'Vitrages sur mesure', 'Particuliers & commerces'],
    features: [
      { icon: 'shield', title: 'Mise en sécurité', text: 'Fermeture provisoire immédiate après un bris de glace.' },
      { icon: 'glass', title: 'Vitrages', text: 'Simple, double vitrage et vitrage feuilleté, remplacés à l’identique.' },
      { icon: 'store', title: 'Vitrines', text: 'Pose et remplacement de vitrines et de verres de sécurité.' },
      { icon: 'mirror', title: 'Miroirs sur mesure', text: 'Découpe et pose pour logements et locaux professionnels.' },
    ],
    beforeAfter: [],
    showBrands: false,
  },
  menuiserie: {
    highlights: ['Sur mesure', 'Alu · PVC · bois · acier', 'Devis avant intervention'],
    features: [
      { icon: 'door', title: 'Portes & fenêtres', text: 'Portes d’entrée, fenêtres et portes-fenêtres sur mesure.' },
      { icon: 'wrench', title: 'Réglage & réparation', text: 'Quincaillerie, crémones et paumelles.' },
      { icon: 'window', title: 'Remplacement', text: 'Menuiseries aluminium, PVC, bois et acier.' },
      { icon: 'thermo', title: 'Isolation', text: 'Isolation thermique, acoustique et étanchéité des ouvrants.' },
    ],
    beforeAfter: [],
    showBrands: false,
  },
  fermetures: {
    highlights: ['Dépannage de rideaux', 'Volets & portes de garage', 'Particuliers & commerces'],
    features: [
      { icon: 'store', title: 'Rideaux métalliques', text: 'Dépannage, déblocage et motorisation pour les commerces.' },
      { icon: 'shutter', title: 'Volets roulants', text: 'Installation et réparation, manuels ou électriques.' },
      { icon: 'garage', title: 'Portes de garage', text: 'Sectionnelles, basculantes ou enroulables : pose et entretien.' },
      { icon: 'motor', title: 'Pièces & moteurs', text: 'Moteurs, lames, axes et commandes de sécurité.' },
    ],
    beforeAfter: [],
    showBrands: false,
  },
};
