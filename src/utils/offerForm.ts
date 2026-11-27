/**
 * Inscription à une offre (page /offre) : choix proposés,
 * validation, lignes envoyées au serveur et date de fin de validité.
 */
import { isValidFrenchPhone, isValidOptionalEmail } from './quoteForm';
import { DEFAULT_OFFER, reductionLabel, type OfferConfig } from './offers';

/** Durée de validité par défaut (offre de bienvenue), en mois. */
export const OFFER_MONTHS = DEFAULT_OFFER.months;

export const CUSTOMER_TYPES = [
  'Syndic / copropriété',
  'Agence immobilière / bailleur',
  'Assureur / expert',
  'Commerce / entreprise',
  'Particulier',
] as const;

export type CustomerType = (typeof CUSTOMER_TYPES)[number];

export interface OfferDraft {
  readonly customerType: CustomerType | null;
  /** Obligatoire sauf pour un particulier. */
  readonly company: string;
  /** Fonction dans la société (facultatif). */
  readonly role: string;
  readonly fullName: string;
  readonly phone: string;
  /** Obligatoire : le code y est envoyé. */
  readonly email: string;
  readonly city: string;
  readonly acceptConditions: boolean;
  readonly consent: boolean;
}

export type OfferErrors = Partial<Record<keyof OfferDraft, string>>;

export const INITIAL_OFFER_DRAFT: OfferDraft = {
  customerType: null,
  company: '',
  role: '',
  fullName: '',
  phone: '',
  email: '',
  city: '',
  acceptConditions: false,
  consent: false,
};

export function isProfessional(type: CustomerType | null): boolean {
  return type !== null && type !== 'Particulier';
}

export function validateOfferDraft(draft: OfferDraft): OfferErrors {
  const errors: OfferErrors = {};
  if (!draft.customerType) {
    errors.customerType = 'Indiquez qui vous êtes.';
  }
  if (isProfessional(draft.customerType) && draft.company.trim().length < 2) {
    errors.company = 'Indiquez le nom complet de votre société.';
  }
  if (draft.fullName.trim().length < 2) {
    errors.fullName = 'Indiquez votre nom.';
  }
  if (!isValidFrenchPhone(draft.phone)) {
    errors.phone = 'Numéro de téléphone invalide (ex. 06 12 34 56 78).';
  }
  if (draft.email.trim().length === 0 || !isValidOptionalEmail(draft.email)) {
    errors.email = 'Indiquez une adresse e-mail valide : nous y envoyons votre code.';
  }
  if (!draft.acceptConditions) {
    errors.acceptConditions = 'Merci d’accepter les conditions de l’offre.';
  }
  if (!draft.consent) {
    errors.consent = 'Merci d’accepter l’utilisation de vos informations pour cette offre.';
  }
  return errors;
}

/** Date de fin de validité : même jour, {@link OFFER_MONTHS} mois plus tard (fin de mois si besoin). */
export function offerValidUntil(from: Date = new Date(), months = OFFER_MONTHS): Date {
  const target = new Date(from.getFullYear(), from.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(from.getDate(), lastDay));
  return target;
}

export function formatFrenchDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

/** Lignes envoyées au récepteur (libellés « Nom », « Téléphone » et « E-mail » attendus par le serveur). */
export function buildOfferSummary(
  draft: OfferDraft,
  offer: OfferConfig = DEFAULT_OFFER
): readonly { readonly label: string; readonly value: string }[] {
  return [
    { label: 'Offre', value: `${offer.name} (${reductionLabel(offer)}, valable ${offer.months} mois)` },
    { label: 'Vous êtes', value: draft.customerType ?? '—' },
    { label: 'Société', value: draft.company.trim() || '—' },
    { label: 'Fonction', value: draft.role.trim() || '—' },
    { label: 'Nom', value: draft.fullName.trim() },
    { label: 'Téléphone', value: draft.phone.trim() },
    { label: 'E-mail', value: draft.email.trim() },
    { label: 'Ville', value: draft.city.trim() || '—' },
  ];
}
