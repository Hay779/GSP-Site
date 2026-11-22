import type { SectionId } from '../utils/navigation';

export type CommitmentIconKey = 'key' | 'clipboard' | 'shield';

export interface HeroCommitment {
  readonly label: string;
  readonly icon: CommitmentIconKey;
}

export interface HeroMediaConfig {
  /** Chemin ou URL de votre vidéo plein écran MP4 (ex. "/assets/videos/hero-marseille.mp4"). */
  readonly videoSrc: string;
  /** Source WebM optionnelle pour optimiser le chargement. */
  readonly videoWebmSrc?: string;
  /** Image haute définition affichée en poster et en repli immédiat. */
  readonly posterSrc: string;
  readonly posterAlt: string;
}

export interface HeroConfig {
  readonly kicker: string;
  readonly headlineLines: readonly [string, string];
  readonly subtitle: string;
  readonly primaryCtaLabel: string;
  readonly secondaryCtaLabel: string;
  readonly secondaryCtaTargetId: SectionId;
  readonly secondaryCtaHref: `#${SectionId}`;
  readonly commitments: readonly HeroCommitment[];
  readonly media: HeroMediaConfig;
}

export const HERO_CONFIG: HeroConfig = {
  kicker: 'Serrurerie à Marseille',
  headlineLines: ['Vos clés. Vos accès.', 'Notre savoir-faire.'],
  subtitle:
    'Serrurerie, vitrerie, menuiserie et fermetures. En boutique, chez vous et dans vos locaux.',
  primaryCtaLabel: 'Demander un devis',
  secondaryCtaLabel: 'Trouver une agence',
  secondaryCtaTargetId: '10_Nos_Agences',
  secondaryCtaHref: '#10_Nos_Agences',
  commitments: [
    { label: 'Conseils en boutique', icon: 'key' },
    { label: 'Devis détaillé', icon: 'clipboard' },
    { label: 'Suivi après sinistre', icon: 'shield' },
  ],
  media: {
    videoSrc: '',
    videoWebmSrc: '',
    posterSrc: '/src/assets/images/hero_serrurier_marseille_1795288791942.jpg',
    posterAlt:
      'Artisan serrurier de Serrurerie de la République ajustant un cylindre de porte à Marseille en présence d’une cliente.',
  },
};
