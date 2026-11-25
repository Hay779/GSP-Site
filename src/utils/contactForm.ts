/** Formulaire de contact (page /agences-contact) : sujets, validation, référence. */
import { isValidFrenchPhone, isValidOptionalEmail } from './quoteForm';

export const CONTACT_SUBJECTS = [
  { id: 'question', label: 'Une question' },
  { id: 'rdv', label: 'Rendez-vous en boutique' },
  { id: 'suivi', label: 'Suivi d’un devis ou d’une intervention' },
  { id: 'autre', label: 'Autre demande' },
] as const;

export type ContactSubject = (typeof CONTACT_SUBJECTS)[number]['id'];

export interface ContactDraft {
  readonly subject: ContactSubject;
  readonly fullName: string;
  readonly phone: string;
  readonly email: string;
  readonly message: string;
  readonly consent: boolean;
}

export type ContactErrors = Partial<Record<keyof ContactDraft, string>>;

export const INITIAL_CONTACT_DRAFT: ContactDraft = {
  subject: 'question',
  fullName: '',
  phone: '',
  email: '',
  message: '',
  consent: false,
};

export function validateContactDraft(draft: ContactDraft): ContactErrors {
  const errors: ContactErrors = {};
  if (draft.fullName.trim().length < 2) errors.fullName = 'Indiquez votre nom.';
  if (!isValidFrenchPhone(draft.phone)) errors.phone = 'Numéro de téléphone invalide (ex. 06 12 34 56 78).';
  if (!isValidOptionalEmail(draft.email)) errors.email = 'Adresse e-mail invalide.';
  if (draft.message.trim().length < 10) errors.message = 'Écrivez votre message (10 caractères minimum).';
  if (!draft.consent) errors.consent = 'Merci d’accepter d’être recontacté.';
  return errors;
}

export function createContactReference(date: Date = new Date(), seed = 1042): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const suffix = String((Math.abs(Math.floor(seed)) % 9000) + 1000);
  return `CT-${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${suffix}`;
}

/** Lignes envoyées au récepteur (libellés « Nom » et « Téléphone » attendus par le serveur). */
export function buildContactSummary(draft: ContactDraft): readonly { readonly label: string; readonly value: string }[] {
  return [
    { label: 'Sujet', value: CONTACT_SUBJECTS.find((s) => s.id === draft.subject)?.label ?? '—' },
    { label: 'Nom', value: draft.fullName.trim() },
    { label: 'Téléphone', value: draft.phone.trim() },
    { label: 'E-mail', value: draft.email.trim() || 'Non renseigné' },
    { label: 'Message', value: draft.message.trim() },
  ];
}
