/**
 * Black Friday 2026 : dates, offres et textes.
 *
 * Tout ce qui concerne la promotion (bandeau doré, macaron, rond flottant, tiroir des
 * offres, page /promotions) lit ce fichier. En dehors des dates, rien ne s'affiche :
 * la page /promotions indique « Pas d'offre en ce moment » et passe en noindex.
 *
 * ➜ Pour une prochaine opération : changer les dates et les offres ci-dessous.
 */
import type { FaqItem } from './sectionsContent';

export type PromoOfferId = 'portes-blindees' | 'double-cle' | 'tampons';

export interface PromoOffer {
  readonly id: PromoOfferId;
  /** Pastille dorée (ex. « -20 % » ou « Offert »). */
  readonly badge: string;
  readonly title: string;
  /** Accroche façon affiche (« sur les portes blindées »). */
  readonly headline: string;
  /** Une ligne, reprise dans le tiroir. */
  readonly summary: string;
  /** Ce qui est compris (page /promotions). */
  readonly includes: readonly string[];
  /** Texte du bandeau défilant. */
  readonly tickerLabel: string;
  /** Visuel de l'offre (repris des affiches du client). */
  readonly imageSrc: string;
  readonly imageAlt: string;
  readonly cta: { readonly kind: 'quote' | 'shop'; readonly label: string };
}

export interface Promotion {
  readonly id: string;
  readonly name: string;
  /** Début et fin en heure de Paris (fin exclue : la promo s'arrête à minuit). */
  readonly startsAt: string;
  readonly endsAt: string;
  /** Libellés de dates affichés. */
  readonly untilLabel: string;
  readonly untilShortLabel: string;
  readonly periodLabel: string;
  readonly tagline: string;
  readonly offers: readonly PromoOffer[];
  readonly conditions: readonly string[];
  readonly faq: readonly FaqItem[];
}

export const BLACK_FRIDAY_2026: Promotion = {
  id: 'black-friday-2026',
  name: 'Black Friday',
  startsAt: '2026-11-24T00:00:00+01:00',
  endsAt: '2026-12-01T00:00:00+01:00',
  untilLabel: 'Jusqu’au 30 novembre',
  untilShortLabel: 'jusqu’au 30/11',
  tagline: 'Jusqu’à -25 % sur vos projets',
  periodLabel: 'Du 24 au 30 novembre 2026',
  offers: [
    {
      id: 'portes-blindees',
      badge: '-20 %',
      title: 'Portes blindées',
      headline: 'sur les portes blindées',
      summary: 'Fourniture et pose d’un bloc-porte blindé certifié A2P.',
      // Confirmé par le client le 25/11 : pose comprise, modèles A2P, jusqu'à -25 % selon le projet.
      includes: ['Pose comprise, par nos serruriers', 'Modèles certifiés A2P', 'Jusqu’à -25 % selon votre projet, sur devis'],
      tickerLabel: '-20 % portes blindées',
      imageSrc: '/src/assets/images/promo/bf_porte_blindee.webp',
      imageAlt: 'Bloc-porte blindé gris anthracite posé dans une entrée.',
      cta: { kind: 'quote', label: 'Demander un devis' },
    },
    {
      id: 'double-cle',
      badge: '3e offert',
      title: 'Double de clé',
      headline: '3e double de clé offert',
      // Confirmé par le client le 25/11 : le 3e offert pour 2 achetés.
      summary: 'Pour 2 doubles achetés, le 3e est offert.',
      includes: ['Reproduction sur place, en boutique', 'Clés plates et clés de sécurité', 'Conseils sur votre serrure'],
      tickerLabel: '3e double de clé offert',
      imageSrc: '/src/assets/images/promo/bf_double_cle.webp',
      imageAlt: 'Deux clés de sécurité reproduites.',
      cta: { kind: 'shop', label: 'Venir en boutique' },
    },
    {
      id: 'tampons',
      badge: '-20 %',
      title: 'Tampons personnalisés',
      headline: 'sur les tampons personnalisés',
      summary: 'Dès le 2e tampon commandé.',
      // Confirmé par le client le 25/11 : en boutique ou par téléphone, prêts dans la journée.
      includes: ['Tampons d’entreprise, adresse, signature', 'Commande en boutique ou par téléphone', 'Prêts dans la journée'],
      tickerLabel: '-20 % tampons dès le 2e',
      imageSrc: '/src/assets/images/promo/bf_tampon.webp',
      imageAlt: 'Tampon encreur personnalisé noir.',
      cta: { kind: 'shop', label: 'Venir en boutique' },
    },
  ],
  conditions: [
    'Offres valables du 24 au 30 novembre 2026 inclus, non cumulables entre elles ni avec d’autres remises.',
    'Réductions calculées sur nos prix habituels pratiqués dans les 30 jours précédents. Détail de chaque offre en boutique.',
  ],
  faq: [
    {
      id: 'bf-pose',
      question: 'La pose est-elle comprise pour la porte blindée ?',
      answer:
        'Oui : l’offre porte sur la fourniture et la pose d’un bloc-porte blindé certifié A2P par nos serruriers. Nous venons prendre les mesures et vous remettons un devis détaillé : jusqu’à -25 % selon votre projet.',
    },
    {
      id: 'bf-tampons',
      question: 'Puis-je commander les tampons par téléphone ?',
      answer:
        'Oui : en boutique au 48 rue de la République (Marseille 2e) ou par téléphone au 04 91 90 51 65. Vos tampons sont prêts dans la journée.',
    },
    {
      id: 'bf-pros',
      question: 'L’offre s’applique-t-elle aux professionnels ?',
      answer:
        'Oui, les offres Black Friday s’adressent aux particuliers comme aux professionnels, dans les mêmes conditions, du 24 au 30 novembre 2026.',
    },
  ],
};

/** Promotion en cours d'affichage (une seule à la fois). */
export const CURRENT_PROMOTION: Promotion = BLACK_FRIDAY_2026;

/** Vrai pendant la promotion (début inclus, fin exclue). */
export function isPromotionActive(promo: Promotion, now: Date = new Date()): boolean {
  const t = now.getTime();
  return t >= Date.parse(promo.startsAt) && t < Date.parse(promo.endsAt);
}

export interface Countdown {
  readonly days: number;
  readonly hours: number;
  readonly minutes: number;
}

/** Temps restant avant la fin (jours, heures, minutes), jamais négatif. */
export function promotionCountdown(promo: Promotion, now: Date = new Date()): Countdown {
  const left = Math.max(0, Date.parse(promo.endsAt) - now.getTime());
  const totalMinutes = Math.floor(left / 60_000);
  return {
    days: Math.floor(totalMinutes / (24 * 60)),
    hours: Math.floor((totalMinutes % (24 * 60)) / 60),
    minutes: totalMinutes % 60,
  };
}

/** Clé sessionStorage : le visiteur a masqué le Black Friday pour sa visite. */
export const PROMO_DISMISS_KEY = `promo-masquee-${CURRENT_PROMOTION.id}`;
