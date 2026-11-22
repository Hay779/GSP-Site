export const QUOTE_DOMAINS = [
  'Serrurerie & portes blindées',
  'Clés & badges',
  'Vitrerie & miroiterie',
  'Menuiserie',
  'Fermetures',
  'Après sinistre',
] as const;

export type QuoteDomain = (typeof QUOTE_DOMAINS)[number];

export interface QuoteFormDraft {
  readonly domain: QuoteDomain;
  readonly fullName: string;
  readonly phone: string;
  readonly email: string;
  readonly district: string;
  readonly details: string;
}

export type QuoteFormErrors = Partial<Record<keyof QuoteFormDraft, string>>;

export interface QuoteSubmissionRecord extends QuoteFormDraft {
  readonly reference: string;
  readonly submittedAt: string;
}

export const INITIAL_QUOTE_DRAFT: QuoteFormDraft = {
  domain: 'Serrurerie & portes blindées',
  fullName: '',
  phone: '',
  email: '',
  district: '',
  details: '',
};

export function isValidFrenchPhone(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 10 && digits.startsWith('0') && digits[1] !== '0') {
    return true;
  }
  if (digits.length === 11 && digits.startsWith('33') && digits[2] !== '0') {
    return true;
  }
  return false;
}

export function isValidOptionalEmail(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return true;
  }
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed);
}

export function validateQuoteForm(draft: QuoteFormDraft): QuoteFormErrors {
  const errors: QuoteFormErrors = {};

  if (!QUOTE_DOMAINS.includes(draft.domain)) {
    errors.domain = 'Veuillez sélectionner un domaine d’intervention.';
  }

  if (draft.fullName.trim().length < 2) {
    errors.fullName = 'Veuillez indiquer votre nom complet.';
  }

  if (!isValidFrenchPhone(draft.phone)) {
    errors.phone = 'Veuillez saisir un numéro de téléphone valide (ex. 06 12 34 56 78).';
  }

  if (!isValidOptionalEmail(draft.email)) {
    errors.email = 'L’adresse e-mail saisie semble invalide.';
  }

  if (draft.details.trim().length < 10) {
    errors.details = 'Merci de préciser brièvement votre besoin (10 caractères minimum).';
  }

  return errors;
}

export function createQuoteReference(date: Date = new Date(), seed = 1042): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const suffix = String(Math.abs(Math.floor(seed)) % 9000 + 1000);
  return `SR-${year}${month}${day}-${suffix}`;
}
