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
  googleProfileUrl: 'https://www.google.com/maps?cid=8005087096552407541',
  leaveReviewUrl: '',
  // Chiffres de la fiche Google au 23/11/2026.
  googleAverage: 4.6,
  googleTotalCount: 30,
};

/**
 * VOS VRAIS AVIS — copiés depuis la fiche Google le 23/11/2026.
 * Seuls les avis 5 étoiles avec un commentaire sont repris ici ; la note et le total
 * affichés (REVIEWS_SOURCE) sont ceux de Google, tous avis confondus.
 */
export const REAL_REVIEWS: readonly CustomerReview[] = [
  {
    id: 'g-garcia',
    author: 'Thierry G.',
    rating: 5,
    date: '2026-10-21',
    text: 'Très réactif, très bon professionnel, magasin très propre et bien rangé. Je recommande fortement ce vendeur. Merci encore.',
    service: 'Clés & badges',
    source: 'Google',
  },
  {
    id: 'g-boucher',
    author: 'Jeremy B.',
    rating: 5,
    date: '2026-09-03',
    text: 'Je viens d’avoir un problème avec une clé reproduite coincée dans la serrure. Le gérant s’est déplacé et a réglé le problème sans frais. A pris le temps de m’expliquer comment faire à l’avenir. Gentil et professionnel. Je recommande.',
    service: 'Clés & badges',
    source: 'Google',
  },
  {
    id: 'g-mdfe',
    author: 'MDFE',
    rating: 5,
    date: '2026-08-29',
    text: 'Depuis la demande de devis jusqu’à l’installation, le service a été très professionnel et plaisant. Le prix est de plus raisonnable. Je recommande grandement.',
    service: 'Serrurerie',
    source: 'Google',
  },
  {
    id: 'g-bobin',
    author: 'Mickaël B.',
    rating: 5,
    date: '2026-08-28',
    text: 'Après avoir testé un autre serrurier à plusieurs reprises pour refaire ma clé (qui ne tournait pas lorsque je la mettais dans la serrure), je suis venue ici et les clés ont fonctionné du premier coup ! Merci beaucoup.',
    service: 'Clés & badges',
    source: 'Google',
  },
  {
    id: 'g-remy',
    author: 'Rémy G.',
    rating: 5,
    date: '2026-02-23',
    text: 'Des artisans comme il en reste peu, et surtout avec la gentillesse et un très bon rapport qualité-prix ! Merci !',
    service: 'Serrurerie',
    source: 'Google',
  },
  {
    id: 'g-verhoosel',
    author: 'Thomas V.',
    rating: 5,
    date: '2026-01-13',
    text: 'Rapide, efficace et extrêmement aimable (pour faire un double de clés).',
    service: 'Clés & badges',
    source: 'Google',
  },
  {
    id: 'g-lina',
    author: 'Lina B.',
    rating: 5,
    date: '2025-04-24',
    text: 'Intervention rapide et très efficace. Les serruriers sont très gentils et compétents, je recommande.',
    service: 'Serrurerie',
    source: 'Google',
  },
  {
    id: 'g-zeppel',
    author: 'Der Z.',
    rating: 5,
    date: '2025-01-25',
    text: 'J’ai eu besoin de changer le barillet de ma porte d’entrée. Ils sont intervenus rapidement et ont réussi à me dépanner malgré une porte en mauvais état.',
    service: 'Serrurerie',
    source: 'Google',
  },
  {
    id: 'g-franck',
    author: 'Théo F.',
    rating: 5,
    date: '2025-01-16',
    text: 'Reproduction de clé très rapide et bon marché.',
    service: 'Clés & badges',
    source: 'Google',
  },
  {
    id: 'g-madamet',
    author: 'Madame T.',
    rating: 5,
    date: '2024-10-30',
    text: 'Parfait ! Intervention à domicile suite à une déclaration d’assurance. Les deux serruriers qui sont intervenus ont été professionnels, m’ont donné des conseils et ont été très sympathiques ! Je recommande fortement l’entreprise ! Le travail rendu est plus que parfait !',
    service: 'Après sinistre',
    source: 'Google',
  },
  {
    id: 'g-reinhard',
    author: 'Laurent R.',
    rating: 5,
    date: '2024-10-17',
    text: 'Un accueil très sympathique et une copie de clé en moins de 5 minutes. Super !',
    service: 'Clés & badges',
    source: 'Google',
  },
  {
    id: 'g-emilie',
    author: 'Émilie',
    rating: 5,
    date: '2024-07-19',
    text: 'Rien à dire ! Rapides, compétents, professionnels… Nous n’hésiterons pas à refaire appel à vos services !',
    service: 'Serrurerie',
    source: 'Google',
  },
  {
    id: 'g-marion',
    author: 'Marion L.',
    rating: 5,
    date: '2024-04-30',
    text: 'Je suis venue pour poser une simple question, et la personne a pris tout le temps nécessaire pour me répondre. Il s’avère que j’ai pu dépanner moi-même ma serrure grâce à ses précieux conseils. Merci monsieur pour votre aide, je sais vers qui me tourner si j’ai un problème de serrurerie.',
    service: 'Serrurerie',
    source: 'Google',
  },
  {
    id: 'g-antunes',
    author: 'Sébastien A.',
    rating: 5,
    date: '2023-10-27',
    text: 'Travail rapide et efficace, très bon rapport qualité-prix !',
    service: 'Serrurerie',
    source: 'Google',
  },
  {
    id: 'g-gauthier',
    author: 'Anthony G.',
    rating: 5,
    date: '2023-09-19',
    text: 'Entreprise sérieuse, je recommande.',
    service: 'Serrurerie',
    source: 'Google',
  },
  {
    id: 'g-mt',
    author: 'MT',
    rating: 5,
    date: '2023-09-08',
    text: 'La serrurerie est rapide, efficace, le travail est bien fait et les ouvriers sont compétents.',
    service: 'Serrurerie',
    source: 'Google',
  },
  {
    id: 'g-riban',
    author: 'Arnaud R.',
    rating: 5,
    date: '2023-08-10',
    text: 'Rapide et efficace. Nickel.',
    service: 'Serrurerie',
    source: 'Google',
  },
  {
    id: 'g-bouacid',
    author: 'Nadia B.',
    rating: 5,
    date: '2022-12-17',
    text: 'Professionnel et très bonne communication. Intervention rapide. Je recommande.',
    service: 'Serrurerie',
    source: 'Google',
  },
];

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
