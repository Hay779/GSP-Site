/**
 * Textes de publicité prêts à copier (Google Ads, Facebook / Instagram), faits à partir des offres
 * et des seules informations vraies de l'entreprise (docs/INFOS-OFFICIELLES.md, avis Google réels).
 * Les limites de longueur sont celles des annonces Google (titres 30, descriptions 90 caractères)
 * et celles conseillées par Meta (titre 40, description 30).
 */
import { REVIEWS_SOURCE } from '../data/reviewsContent';
import { reductionLabel, type OfferConfig } from './offers';

export type Audience = 'tous' | 'syndics' | 'particuliers' | 'pros';

export const AUDIENCE_LABELS: Readonly<Record<Audience, string>> = {
  tous: 'Tout le monde',
  syndics: 'Syndics et gestionnaires',
  particuliers: 'Particuliers',
  pros: 'Commerces et entreprises',
};

export const LIMITS = { googleHeadline: 30, googleDescription: 90, socialHeadline: 40, socialDescription: 30 } as const;

export interface GoogleAd {
  readonly headlines: readonly string[];
  readonly descriptions: readonly string[];
}

export interface SocialAd {
  readonly primary: string;
  readonly headline: string;
  readonly description: string;
}

const PHONE = '04 91 90 51 65';

function rating(): string {
  const avg = REVIEWS_SOURCE.googleAverage;
  return avg ? `Noté ${avg.toLocaleString('fr-FR')}/5 sur Google` : '';
}

function unique(list: readonly string[], max: number): string[] {
  const seen = new Set<string>();
  return list
    .map((t) => t.replace(/\s+/g, ' ').trim())
    .filter((t) => t && t.length <= max && !seen.has(t.toLowerCase()) && seen.add(t.toLowerCase()));
}

export function googleAd(offer: OfferConfig | null, audience: Audience): GoogleAd {
  const label = offer ? reductionLabel(offer).replace(' ', ' ') : '';
  const headlines = [
    'Serrurier Marseille 2e',
    'Serrurerie de la République',
    offer ? `${label} 1re intervention` : '',
    offer ? 'Inscription en 30 secondes' : '',
    offer ? `${label} : votre code en ligne` : '',
    audience === 'syndics' ? 'Serrurier pour copropriétés' : '',
    audience === 'syndics' ? 'Syndics : un serrurier proche' : '',
    audience === 'pros' ? 'Serrurier pour commerces' : '',
    audience === 'particuliers' ? 'Serrure, clés, porte blindée' : '',
    'Agréé assurances',
    'Dépannage soir et dimanche',
    'Clés, badges, serrures',
    'Vitrerie et menuiserie',
    rating(),
    'Boutique rue de la République',
  ];
  const descriptions = [
    offer ? `${offer.description} Inscrivez-vous en 30 secondes, code envoyé aussitôt.` : '',
    offer ? `${label} pendant ${offer.months} mois après l’inscription. Code reçu tout de suite par e-mail.` : '',
    'Serrurerie, clés et badges, vitrerie, menuiserie et fermetures à Marseille. Agréé assurances.',
    `Boutique au 48 rue de la République, Marseille 2e. Lundi au samedi 9h–19h. ${PHONE}.`,
    'Dépannage d’urgence aussi le soir et le dimanche, par téléphone. Serrurier à Marseille.',
    audience === 'syndics' ? 'Portes de hall, boîtes aux lettres, badges : un serrurier à Marseille pour vos immeubles.' : '',
    audience === 'pros' ? 'Rideaux métalliques, serrures, vitrines : un serrurier à Marseille pour votre commerce.' : '',
  ];
  return { headlines: unique(headlines, LIMITS.googleHeadline), descriptions: unique(descriptions, LIMITS.googleDescription) };
}

export function socialAds(offer: OfferConfig | null, audience: Audience, url: string): SocialAd[] {
  const who =
    audience === 'syndics'
      ? 'Syndics et gestionnaires d’immeubles'
      : audience === 'pros'
        ? 'Commerçants et entreprises'
        : audience === 'particuliers'
          ? 'Particuliers'
          : '';
  if (offer) {
    const label = reductionLabel(offer).replace(' ', ' ');
    return [
      {
        primary: `${offer.title} 🔑\n${offer.description}\nInscrivez-vous en 30 secondes : votre code arrive tout de suite, valable ${offer.months} mois.\n👉 ${url}`,
        headline: `${label} chez votre serrurier`,
        description: 'Serrurier · Marseille 2e',
      },
      {
        primary: `${who ? `${who} à Marseille : ` : ''}${label} sur votre premier chantier avec la Serrurerie de la République.\nSerrurerie, clés et badges, vitrerie, menuiserie. Agréé assurances.\nVotre code en 30 secondes 👉 ${url}`,
        headline: `${label} : inscription gratuite`,
        description: '48 rue de la République',
      },
      {
        primary: `📍 48 rue de la République, Marseille 2e\nUn projet de serrure, de porte blindée ou de badges ? Profitez de ${label} : inscription en ligne, code immédiat.\n${url}`,
        headline: 'Votre code de réduction',
        description: 'Code reçu tout de suite',
      },
    ].map(clampSocial);
  }
  return [
    {
      primary: `Serrurier à Marseille 🔑\nSerrurerie, clés et badges, vitrerie, menuiserie, fermetures. Agréé assurances.\nBoutique au 48 rue de la République (2e), du lundi au samedi 9h–19h.\n👉 ${url}`,
      headline: 'Votre serrurier à Marseille',
      description: 'Serrurier · Marseille 2e',
    },
    {
      primary: `${who ? `${who} : ` : ''}besoin d’un serrurier à Marseille ? Dépannage d’urgence aussi le soir et le dimanche, par téléphone : ${PHONE}.\n${url}`,
      headline: 'Dépannage soir et dimanche',
      description: PHONE,
    },
  ].map(clampSocial);
}

function clampSocial(ad: SocialAd): SocialAd {
  const cut = (t: string, max: number) => (t.length <= max ? t : `${t.slice(0, max - 1).trimEnd()}…`);
  return { primary: ad.primary, headline: cut(ad.headline, LIMITS.socialHeadline), description: cut(ad.description, LIMITS.socialDescription) };
}
