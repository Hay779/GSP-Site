/**
 * Avis clients.
 *
 * ➜ Pour publier vos vrais avis : copiez-les depuis votre fiche Google dans
 *   REAL_REVIEWS (même format que les exemples), et renseignez les liens de
 *   REVIEWS_SOURCE. Dès qu'il y a au moins un vrai avis, les exemples ne sont
 *   plus jamais utilisés.
 * ➜ Tant que REAL_REVIEWS est vide, le site affiche un message d'attente.
 *   Les exemples (DEMO_REVIEWS) ne s'affichent que dans les aperçus compilés
 *   avec VITE_REVIEWS_DEMO=true, avec un badge « Exemple ».
 */

export type ReviewRating = 1 | 2 | 3 | 4 | 5;

export interface CustomerReview {
  readonly id: string;
  /** Prénom + initiale, comme sur Google (ex. « Sophie L. »). */
  readonly author: string;
  readonly rating: ReviewRating;
  /** Date de l'avis au format AAAA-MM-JJ. */
  readonly date: string;
  readonly text: string;
  /** Métier concerné (sert au filtre de la page Avis clients). */
  readonly service?: ReviewService;
  readonly source: 'Google';
}

export const REVIEW_SERVICES = [
  'Serrurerie',
  'Clés & badges',
  'Vitrerie',
  'Menuiserie',
  'Fermetures',
  'Après sinistre',
] as const;

export type ReviewService = (typeof REVIEW_SERVICES)[number];

export interface ReviewsSource {
  /** Lien vers votre fiche Google (avis). */
  readonly googleProfileUrl: string;
  /** Lien direct « Laisser un avis » (fourni par Google dans votre fiche). */
  readonly leaveReviewUrl: string;
  /**
   * Note moyenne et nombre total affichés par Google. Facultatif : sinon,
   * ils sont calculés à partir des avis listés ci-dessous.
   */
  readonly googleAverage?: number;
  readonly googleTotalCount?: number;
}

export const REVIEWS_SOURCE: ReviewsSource = {
  googleProfileUrl: '',
  leaveReviewUrl: '',
};

/** VOS VRAIS AVIS (à remplir). */
export const REAL_REVIEWS: readonly CustomerReview[] = [];

/** EXEMPLES pour l'aperçu du design — jamais affichés en production. */
export const DEMO_REVIEWS: readonly CustomerReview[] = [
  {
    id: 'demo-1',
    author: 'Exemple A.',
    rating: 5,
    date: '2026-10-14',
    text: 'Porte claquée un dimanche soir : intervention rapide et soignée, la serrure n’a pas été abîmée. Tarif annoncé avant de commencer.',
    service: 'Serrurerie',
    source: 'Google',
  },
  {
    id: 'demo-2',
    author: 'Exemple B.',
    rating: 5,
    date: '2026-09-02',
    text: 'Double de badge d’immeuble fait en boutique, accueil très agréable et de bons conseils.',
    service: 'Clés & badges',
    source: 'Google',
  },
  {
    id: 'demo-3',
    author: 'Exemple C.',
    rating: 4,
    date: '2026-08-21',
    text: 'Vitrine de notre commerce remplacée après un bris de glace. Mise en sécurité le jour même, pose propre.',
    service: 'Vitrerie',
    source: 'Google',
  },
  {
    id: 'demo-4',
    author: 'Exemple D.',
    rating: 5,
    date: '2026-07-09',
    text: 'Fenêtres de l’appartement réglées au lieu d’être changées : honnêteté appréciée.',
    service: 'Menuiserie',
    source: 'Google',
  },
  {
    id: 'demo-5',
    author: 'Exemple E.',
    rating: 5,
    date: '2026-06-18',
    text: 'Rideau métallique bloqué un matin d’ouverture, réparé dans la matinée.',
    service: 'Fermetures',
    source: 'Google',
  },
  {
    id: 'demo-6',
    author: 'Exemple F.',
    rating: 5,
    date: '2026-05-30',
    text: 'Après une effraction, ils ont sécurisé la porte puis préparé un dossier complet pour l’assurance.',
    service: 'Après sinistre',
    source: 'Google',
  },
];
