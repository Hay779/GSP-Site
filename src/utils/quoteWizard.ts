/**
 * Logique du questionnaire de devis (page /devis) : étapes, choix proposés,
 * validation étape par étape et récapitulatif.
 */
import { isValidFrenchPhone, isValidOptionalEmail, QUOTE_DOMAINS, type QuoteDomain } from './quoteForm';

export type QuoteStepId = 'besoin' | 'precisions' | 'lieu' | 'coordonnees' | 'recap';

export const QUOTE_STEPS: readonly { readonly id: QuoteStepId; readonly label: string }[] = [
  { id: 'besoin', label: 'Votre besoin' },
  { id: 'precisions', label: 'Précisions' },
  { id: 'lieu', label: 'Lieu & description' },
  { id: 'coordonnees', label: 'Vos coordonnées' },
  { id: 'recap', label: 'Récapitulatif' },
];

export type Urgency = 'urgent' | 'semaine' | 'projet';
export type CustomerType = 'particulier' | 'professionnel' | 'syndic';
export type CallbackSlot = 'matin' | 'apres-midi' | 'indifferent';
export type ContactPreference = 'rappel' | 'boutique';

export const URGENCY_OPTIONS: readonly { readonly id: Urgency; readonly label: string; readonly hint: string }[] = [
  { id: 'urgent', label: 'Urgent', hint: 'Aujourd’hui si possible' },
  { id: 'semaine', label: 'Cette semaine', hint: 'Dans les prochains jours' },
  { id: 'projet', label: 'Projet', hint: 'Pas de date imposée' },
];

export const CUSTOMER_OPTIONS: readonly { readonly id: CustomerType; readonly label: string }[] = [
  { id: 'particulier', label: 'Particulier' },
  { id: 'professionnel', label: 'Commerce / professionnel' },
  { id: 'syndic', label: 'Syndic / copropriété' },
];

export const CONTACT_PREFERENCE_OPTIONS: readonly { readonly id: ContactPreference; readonly label: string }[] = [
  { id: 'rappel', label: 'Être rappelé' },
  { id: 'boutique', label: 'Passer en boutique / prendre RDV' },
];

export const CALLBACK_OPTIONS: readonly { readonly id: CallbackSlot; readonly label: string }[] = [
  { id: 'matin', label: 'Le matin' },
  { id: 'apres-midi', label: 'L’après-midi' },
  { id: 'indifferent', label: 'Peu importe' },
];

/** Besoins précis proposés selon le domaine choisi. */
export const NEEDS_BY_DOMAIN: Readonly<Record<QuoteDomain, readonly string[]>> = {
  'Serrurerie & portes blindées': [
    'Ouverture de porte',
    'Changement de serrure ou de cylindre',
    'Blindage ou porte blindée',
    'Réglage / entretien',
    'Autre',
  ],
  'Clés & badges': ['Double de clé', 'Double de badge', 'Autre'],
  'Vitrerie & miroiterie': ['Bris de glace', 'Remplacement de vitrage', 'Vitrine de commerce', 'Miroir sur mesure', 'Autre'],
  Menuiserie: ['Porte d’entrée', 'Fenêtre / porte-fenêtre', 'Réglage ou réparation', 'Autre'],
  Fermetures: ['Rideau métallique', 'Volet roulant', 'Porte de garage', 'Motorisation', 'Autre'],
  'Après sinistre': ['Effraction', 'Vandalisme', 'Bris de glace', 'Autre'],
};

export interface QuoteWizardDraft {
  readonly domain: QuoteDomain | null;
  readonly need: string | null;
  readonly urgency: Urgency | null;
  readonly customerType: CustomerType | null;
  readonly location: string;
  readonly details: string;
  readonly fullName: string;
  readonly phone: string;
  readonly email: string;
  readonly callbackSlot: CallbackSlot;
  readonly contactPreference: ContactPreference;
  readonly consent: boolean;
}

export type QuoteWizardErrors = Partial<Record<keyof QuoteWizardDraft, string>>;

export function createInitialDraft(prefill: { readonly domain?: QuoteDomain; readonly location?: string } = {}): QuoteWizardDraft {
  return {
    domain: prefill.domain && QUOTE_DOMAINS.includes(prefill.domain) ? prefill.domain : null,
    need: null,
    urgency: null,
    customerType: null,
    location: prefill.location?.trim() ?? '',
    details: '',
    fullName: '',
    phone: '',
    email: '',
    callbackSlot: 'indifferent',
    contactPreference: 'rappel',
    consent: false,
  };
}

/** Erreurs de l'étape donnée (objet vide = étape valide). */
export function validateQuoteStep(step: QuoteStepId, draft: QuoteWizardDraft): QuoteWizardErrors {
  const errors: QuoteWizardErrors = {};
  switch (step) {
    case 'besoin':
      if (!draft.domain) {
        errors.domain = 'Choisissez le type de besoin.';
      }
      break;
    case 'precisions':
      if (!draft.need || (draft.domain && !NEEDS_BY_DOMAIN[draft.domain].includes(draft.need))) {
        errors.need = 'Précisez votre besoin.';
      }
      if (!draft.urgency) {
        errors.urgency = 'Indiquez le délai souhaité.';
      }
      if (!draft.customerType) {
        errors.customerType = 'Indiquez qui vous êtes.';
      }
      break;
    case 'lieu':
      if (draft.location.trim().length < 2) {
        errors.location = 'Indiquez la ville, l’arrondissement ou le code postal.';
      }
      if (draft.details.trim().length < 10) {
        errors.details = 'Décrivez brièvement votre besoin (10 caractères minimum).';
      }
      break;
    case 'coordonnees':
      if (draft.fullName.trim().length < 2) {
        errors.fullName = 'Indiquez votre nom.';
      }
      if (!isValidFrenchPhone(draft.phone)) {
        errors.phone = 'Numéro de téléphone invalide (ex. 06 12 34 56 78).';
      }
      if (!isValidOptionalEmail(draft.email)) {
        errors.email = 'Adresse e-mail invalide.';
      }
      if (!draft.consent) {
        errors.consent = 'Merci d’accepter d’être recontacté au sujet de votre demande.';
      }
      break;
    case 'recap':
      break;
  }
  return errors;
}

/** Première étape incomplète (pour empêcher de sauter des étapes). */
export function firstIncompleteStep(draft: QuoteWizardDraft): QuoteStepId {
  for (const step of QUOTE_STEPS) {
    if (Object.keys(validateQuoteStep(step.id, draft)).length > 0) {
      return step.id;
    }
  }
  return 'recap';
}

/** Changer de domaine remet à zéro le besoin précis s'il ne correspond plus. */
export function withDomain(draft: QuoteWizardDraft, domain: QuoteDomain): QuoteWizardDraft {
  const keepNeed = draft.need !== null && NEEDS_BY_DOMAIN[domain].includes(draft.need);
  return { ...draft, domain, need: keepNeed ? draft.need : null };
}

function labelOf<T extends string>(options: readonly { readonly id: T; readonly label: string }[], id: T | null): string {
  return options.find((o) => o.id === id)?.label ?? '—';
}

/** Lignes du récapitulatif. */
export function buildQuoteSummary(draft: QuoteWizardDraft): readonly { readonly label: string; readonly value: string }[] {
  return [
    { label: 'Besoin', value: [draft.domain, draft.need].filter(Boolean).join(' — ') || '—' },
    { label: 'Délai', value: labelOf(URGENCY_OPTIONS, draft.urgency) },
    { label: 'Vous êtes', value: labelOf(CUSTOMER_OPTIONS, draft.customerType) },
    { label: 'Lieu', value: draft.location.trim() || '—' },
    { label: 'Description', value: draft.details.trim() || '—' },
    { label: 'Nom', value: draft.fullName.trim() || '—' },
    { label: 'Téléphone', value: draft.phone.trim() || '—' },
    { label: 'E-mail', value: draft.email.trim() || 'Non renseigné' },
    { label: 'Préférence', value: labelOf(CONTACT_PREFERENCE_OPTIONS, draft.contactPreference) },
    { label: 'Disponibilité', value: labelOf(CALLBACK_OPTIONS, draft.callbackSlot) },
  ];
}

/** Texte de la demande (prêt pour un envoi par e-mail ou WhatsApp). */
export function buildQuoteMessage(draft: QuoteWizardDraft, reference: string): string {
  const lines = buildQuoteSummary(draft).map((row) => `${row.label} : ${row.value}`);
  return [`Demande de devis ${reference}`, ...lines].join('\n');
}
