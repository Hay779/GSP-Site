import { isValidFrenchPhone } from './quoteForm';

export const INCIDENT_TYPES = [
  'Effraction',
  'Porte forcée ou serrure endommagée',
  'Bris de glace / vitrine',
  'Vandalisme / fermeture bloquée',
] as const;

export type IncidentType = (typeof INCIDENT_TYPES)[number];

export const MAX_INCIDENT_PHOTOS = 6;
export const MAX_PHOTO_SIZE_BYTES = 10 * 1024 * 1024;
export const ALLOWED_PHOTO_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export interface PhotoFileMetadata {
  readonly name: string;
  readonly type: string;
  readonly size: number;
}

export interface IncidentPhotoDraft {
  readonly incidentType: IncidentType;
  readonly fullName: string;
  readonly phone: string;
  readonly insurer: string;
  readonly note: string;
}

export interface IncidentPhotoErrors {
  fullName?: string;
  phone?: string;
  photos?: string;
}

export const INITIAL_INCIDENT_DRAFT: IncidentPhotoDraft = {
  incidentType: 'Effraction',
  fullName: '',
  phone: '',
  insurer: '',
  note: '',
};

export interface PhotoValidationResult {
  readonly acceptedIndices: readonly number[];
  readonly errorMessage: string | null;
}

export function validateIncomingPhotoFiles(
  files: readonly PhotoFileMetadata[],
  existingCount: number
): PhotoValidationResult {
  const acceptedIndices: number[] = [];
  const errors: string[] = [];
  let remaining = Math.max(0, MAX_INCIDENT_PHOTOS - existingCount);

  files.forEach((file, index) => {
    if (remaining <= 0) {
      errors.push(`Maximum ${MAX_INCIDENT_PHOTOS} photos par dossier.`);
      return;
    }

    if (!ALLOWED_PHOTO_MIMES.includes(file.type as (typeof ALLOWED_PHOTO_MIMES)[number])) {
      errors.push(`Format non pris en charge pour « ${file.name} » (JPG, PNG ou WebP uniquement).`);
      return;
    }

    if (file.size > MAX_PHOTO_SIZE_BYTES) {
      errors.push(`« ${file.name} » dépasse la taille maximale de 10 Mo.`);
      return;
    }

    acceptedIndices.push(index);
    remaining -= 1;
  });

  return {
    acceptedIndices,
    errorMessage: errors.length > 0 ? errors[0] : null,
  };
}

export function validateIncidentPhotoReport(
  draft: IncidentPhotoDraft,
  photoCount: number
): IncidentPhotoErrors {
  const errors: IncidentPhotoErrors = {};

  if (draft.fullName.trim().length < 2) {
    errors.fullName = 'Veuillez indiquer votre nom complet.';
  }

  if (!isValidFrenchPhone(draft.phone)) {
    errors.phone = 'Veuillez saisir un numéro de téléphone valide (ex. 06 12 34 56 78).';
  }

  if (photoCount < 1) {
    errors.photos = 'Veuillez ajouter au moins une photo des dégâts pour établir le diagnostic.';
  }

  return errors;
}

export function createIncidentReference(date: Date = new Date(), seed = 415): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const suffix = String((Math.abs(Math.floor(seed)) % 9000) + 1000);
  return `SIN-${year}${month}${day}-${suffix}`;
}
