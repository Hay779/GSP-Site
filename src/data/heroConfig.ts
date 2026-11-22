export type CommitmentIconKey = 'key' | 'clipboard' | 'shield';

export interface HeroCommitment {
  readonly label: string;
  readonly icon: CommitmentIconKey;
}

export interface HeroSlide {
  readonly src: string;
  readonly alt: string;
  /** Libellé court affiché dans l'indicateur (ex. « Vitrerie »). */
  readonly label: string;
  /** Cadrage CSS `object-position` mobile puis ordinateur. */
  readonly objectPositionMobile: string;
  readonly objectPositionDesktop: string;
}

export interface HeroMediaConfig {
  /**
   * Diaporama « cinéma » (fondus enchaînés + mouvements de caméra lents).
   * Utilisé quand aucune vidéo n'est renseignée. La première image sert aussi de poster.
   */
  readonly slides: readonly HeroSlide[];
  /** Chemin ou URL de votre vidéo plein écran MP4 (ex. "/assets/videos/hero-marseille.mp4"). */
  readonly videoSrc: string;
  /** Source WebM optionnelle pour optimiser le chargement. */
  readonly videoWebmSrc?: string;
}

export interface HeroConfig {
  readonly kicker: string;
  readonly headlineLines: readonly [string, string];
  readonly subtitle: string;
  readonly primaryCtaLabel: string;
  readonly secondaryCtaLabel: string;
  /** Lien du second bouton (ex. téléphone « tel:… » ou ancre « #section »). */
  readonly secondaryCtaHref: string;
  readonly commitments: readonly HeroCommitment[];
  readonly media: HeroMediaConfig;
}

export const HERO_CONFIG: HeroConfig = {
  // Sur-titre au-dessus du titre (laisser vide pour ne rien afficher).
  kicker: '',
  headlineLines: ['Votre serrurier', 'à Marseille.'],
  subtitle:
    'Dépannage, changement de serrure, doubles de clés et badges, vitrerie et fermetures — en boutique ou chez vous.',
  primaryCtaLabel: 'Demander un devis',
  secondaryCtaLabel: 'Appeler le 04 91 90 51 65',
  secondaryCtaHref: 'tel:+33491905165',
  commitments: [
    { label: 'Conseils en boutique', icon: 'key' },
    { label: 'Devis détaillé', icon: 'clipboard' },
    { label: 'Suivi après sinistre', icon: 'shield' },
  ],
  media: {
    slides: [
      {
        src: '/src/assets/images/hero_serrurier_marseille_1795288791942.jpg',
        alt: 'Artisan serrurier ajustant un cylindre de porte à Marseille en présence d’une cliente.',
        label: 'Serrurerie',
        objectPositionMobile: '80% 30%',
        objectPositionDesktop: '70% 40%',
      },
      {
        src: '/src/assets/images/domaine_serrurerie_1795289920360.jpg',
        alt: 'Cylindre de sécurité haut de gamme sur une porte blindée.',
        label: 'Portes blindées',
        objectPositionMobile: '50% 45%',
        objectPositionDesktop: '60% 50%',
      },
      {
        src: '/src/assets/images/domaine_vitrerie_1795289921283.jpg',
        alt: 'Vitrier posant une vitrine de commerce à l’aide de ventouses.',
        label: 'Vitrerie',
        objectPositionMobile: '45% 35%',
        objectPositionDesktop: '65% 40%',
      },
      {
        src: '/src/assets/images/domaine_menuiserie_1795289934186.jpg',
        alt: 'Menuisier réglant une fenêtre aluminium avec vue sur la mer.',
        label: 'Menuiserie',
        objectPositionMobile: '40% 35%',
        objectPositionDesktop: '65% 40%',
      },
      {
        src: '/src/assets/images/domaine_fermetures_1795289921534.jpg',
        alt: 'Volet roulant et porte de garage sur une façade en pierre.',
        label: 'Fermetures',
        objectPositionMobile: '35% 50%',
        objectPositionDesktop: '60% 50%',
      },
      {
        src: '/src/assets/images/cles_badges_boutique_1795289681478.jpg',
        alt: 'Remise d’une clé reproduite au comptoir de la boutique.',
        label: 'Clés & badges',
        objectPositionMobile: '60% 40%',
        objectPositionDesktop: '65% 45%',
      },
    ],
    videoSrc: '',
    videoWebmSrc: '',
  },
};
