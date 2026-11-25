/**
 * Formulaire « Devenir partenaire » (page /devenir-partenaire) : choix proposés,
 * validation et récapitulatif.
 */
import { isValidFrenchPhone, isValidOptionalEmail } from './quoteForm';

export const ORGANIZATION_TYPES = [
  'Syndic / gestionnaire de copropriété',
  'Assureur / expert',
  'Agence immobilière / bailleur',
  'Autre professionnel',
] as const;

export type OrganizationType = (typeof ORGANIZATION_TYPES)[number];

export const PARTNER_NEEDS = [
  'Dépannages ponctuels',
  'Interventions après sinistre',
  'Changements de serrure / cylindre',
  'Clés & badges',
  'Vitrerie',
  'Menuiserie & fermetures',
] as const;

export type PartnerNeed = (typeof PARTNER_NEEDS)[number];

export interface PartnerDraft {
  readonly organizationType: OrganizationType | null;
  readonly company: string;
  readonly fullName: string;
  readonly role: string;
  readonly phone: string;
  /** Obligatoire pour un professionnel (échanges de devis et de comptes rendus). */
  readonly email: string;
  /** Nombre de lots / biens gérés / dossiers par an (facultatif, texte libre). */
  readonly volume: string;
  readonly needs: readonly PartnerNeed[];
  readonly message: string;
  readonly consent: boolean;
}

export type PartnerErrors = Partial<Record<keyof PartnerDraft, string>>;

export const INITIAL_PARTNER_DRAFT: PartnerDraft = {
  organizationType: null,
  company: '',
  fullName: '',
  role: '',
  phone: '',
  email: '',
  volume: '',
  needs: [],
  message: '',
  consent: false,
};

export function toggleNeed(needs: readonly PartnerNeed[], need: PartnerNeed): readonly PartnerNeed[] {
  return needs.includes(need) ? needs.filter((n) => n !== need) : [...needs, need];
}

export function validatePartnerDraft(draft: PartnerDraft): PartnerErrors {
  const errors: PartnerErrors = {};
  if (!draft.organizationType) {
    errors.organizationType = 'Indiquez votre type de structure.';
  }
  if (draft.company.trim().length < 2) {
    errors.company = 'Indiquez le nom de votre société.';
  }
  if (draft.fullName.trim().length < 2) {
    errors.fullName = 'Indiquez votre nom.';
  }
  if (!isValidFrenchPhone(draft.phone)) {
    errors.phone = 'Numéro de téléphone invalide (ex. 04 91 00 00 00).';
  }
  if (draft.email.trim().length === 0 || !isValidOptionalEmail(draft.email)) {
    errors.email = 'Indiquez une adresse e-mail professionnelle valide.';
  }
  if (draft.needs.length === 0) {
    errors.needs = 'Choisissez au moins un besoin.';
  }
  if (!draft.consent) {
    errors.consent = 'Merci d’accepter d’être recontacté.';
  }
  return errors;
}

/** Référence de la demande, ex. « PRO-20261122-1234 ». */
export function createPartnerReference(date: Date = new Date(), seed = 1042): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const suffix = String((Math.abs(Math.floor(seed)) % 9000) + 1000);
  return `PRO-${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${suffix}`;
}

/** Texte de la demande (prêt pour un envoi par e-mail). */
export function buildPartnerMessage(draft: PartnerDraft, reference: string): string {
  return [
    `Demande de partenariat ${reference}`,
    `Structure : ${draft.organizationType ?? '—'} — ${draft.company.trim()}`,
    `Contact : ${draft.fullName.trim()}${draft.role.trim() ? ` (${draft.role.trim()})` : ''}`,
    `Téléphone : ${draft.phone.trim()}`,
    `E-mail : ${draft.email.trim()}`,
    `Volume : ${draft.volume.trim() || 'Non précisé'}`,
    `Besoins : ${draft.needs.join(', ')}`,
    `Message : ${draft.message.trim() || '—'}`,
  ].join('\n');
}

/** Lignes envoyées au récepteur (libellés « Nom » et « Téléphone » attendus par le serveur). */
export function buildPartnerSummary(draft: PartnerDraft): readonly { readonly label: string; readonly value: string }[] {
  return [
    { label: 'Structure', value: draft.organizationType ?? '—' },
    { label: 'Société', value: draft.company.trim() },
    { label: 'Nom', value: draft.fullName.trim() },
    { label: 'Fonction', value: draft.role.trim() || '—' },
    { label: 'Téléphone', value: draft.phone.trim() },
    { label: 'E-mail', value: draft.email.trim() },
    { label: 'Volume', value: draft.volume.trim() || '—' },
    { label: 'Besoins', value: draft.needs.length > 0 ? draft.needs.join(', ') : '—' },
    { label: 'Message', value: draft.message.trim() || '—' },
  ];
}
