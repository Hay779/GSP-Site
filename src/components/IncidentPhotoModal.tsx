import { useEffect, useRef, useState } from 'react';
import { Camera, CheckCircle2, Phone, Trash2, Upload, X } from 'lucide-react';
import type { BrandConfig } from '../utils/navigation';
import {
  INCIDENT_TYPES,
  INITIAL_INCIDENT_DRAFT,
  MAX_INCIDENT_PHOTOS,
  createIncidentReference,
  validateIncidentPhotoReport,
  validateIncomingPhotoFiles,
  type IncidentPhotoDraft,
  type IncidentPhotoErrors,
  type IncidentType,
} from '../utils/incidentPhotos';

interface AttachedPhoto {
  readonly id: string;
  readonly name: string;
  readonly previewUrl: string;
}

interface IncidentSubmissionSummary {
  readonly reference: string;
  readonly incidentType: IncidentType;
  readonly fullName: string;
  readonly phone: string;
  readonly photoCount: number;
}

interface IncidentPhotoModalProps {
  readonly isOpen: boolean;
  readonly brand: BrandConfig;
  readonly onClose: () => void;
}

export function IncidentPhotoModal({
  isOpen,
  brand,
  onClose,
}: IncidentPhotoModalProps) {
  const [draft, setDraft] = useState<IncidentPhotoDraft>(INITIAL_INCIDENT_DRAFT);
  const [photos, setPhotos] = useState<readonly AttachedPhoto[]>([]);
  const [errors, setErrors] = useState<IncidentPhotoErrors>({});
  const [fileWarning, setFileWarning] = useState<string | null>(null);
  const [submission, setSubmission] = useState<IncidentSubmissionSummary | null>(null);
  const firstInputRef = useRef<HTMLSelectElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const photosRef = useRef<readonly AttachedPhoto[]>([]);
  photosRef.current = photos;

  useEffect(() => {
    return () => {
      for (const item of photosRef.current) {
        URL.revokeObjectURL(item.previewUrl);
      }
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const timer = window.setTimeout(() => {
      firstInputRef.current?.focus();
    }, 30);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const updateField = <K extends keyof IncidentPhotoDraft>(
    field: K,
    value: IncidentPhotoDraft[K]
  ) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
    if (field === 'fullName' || field === 'phone') {
      const errorKey: 'fullName' | 'phone' = field;
      setErrors((prev) => {
        if (!prev[errorKey]) return prev;
        const next = { ...prev };
        delete next[errorKey];
        return next;
      });
    }
  };

  const handleFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = Array.from(event.target.files ?? []);
    if (fileList.length === 0) {
      return;
    }

    const result = validateIncomingPhotoFiles(
      fileList.map((file) => ({ name: file.name, type: file.type, size: file.size })),
      photos.length
    );

    if (result.acceptedIndices.length > 0) {
      const additions: AttachedPhoto[] = result.acceptedIndices.map((idx) => {
        const file = fileList[idx];
        return {
          id: `${file.name}-${file.size}-${Date.now()}-${idx}`,
          name: file.name,
          previewUrl: URL.createObjectURL(file),
        };
      });
      setPhotos((prev) => [...prev, ...additions]);
      setErrors((prev) => {
        if (!prev.photos) return prev;
        const next = { ...prev };
        delete next.photos;
        return next;
      });
    }

    setFileWarning(result.errorMessage);
    event.target.value = '';
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((p) => p.id !== id);
    });
    setFileWarning(null);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validateIncidentPhotoReport(draft, photos.length);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const now = new Date();
    setSubmission({
      reference: createIncidentReference(now, now.getMilliseconds() + photos.length * 31),
      incidentType: draft.incidentType,
      fullName: draft.fullName.trim(),
      phone: draft.phone.trim(),
      photoCount: photos.length,
    });
    setErrors({});
    setFileWarning(null);
  };

  const handleReset = () => {
    for (const item of photos) {
      URL.revokeObjectURL(item.previewUrl);
    }
    setPhotos([]);
    setDraft(INITIAL_INCIDENT_DRAFT);
    setErrors({});
    setFileWarning(null);
    setSubmission(null);
  };

  const inputBaseClass =
    'mt-1.5 w-full rounded-lg border bg-[#1C1F21] px-3.5 py-2.5 text-[15px] text-[#F3F0E7] placeholder:text-[#F3F0E7]/38 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B79A62]';

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6"
      role="presentation"
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-xs"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="incident-modal-title"
        data-testid="incident-photo-modal"
        className="relative z-10 w-full max-w-[600px] max-h-[90vh] overflow-y-auto rounded-xl border border-[#F3F0E7]/15 bg-[#292D2F] shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#F3F0E7]/12 px-6 py-4 sm:px-7">
          <div>
            <p className="text-[12px] font-medium tracking-[0.14em] text-[#B79A62]">
              Reportage photo après sinistre
            </p>
            <h2
              id="incident-modal-title"
              className="mt-0.5 font-display text-[21px] sm:text-[23px] font-semibold tracking-[-0.01em] text-[#F3F0E7]"
            >
              Envoyer des photos
            </h2>
            <p className="mt-1 text-[13px] sm:text-[14px] text-[#F3F0E7]/70">
              Transmettez vos clichés pour accélérer le diagnostic, le devis détaillé et votre dossier assurance.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer l’envoi de photos"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#F3F0E7]/15 bg-[#1C1F21]/50 text-[#F3F0E7]/80 hover:border-[#B79A62] hover:text-[#F3F0E7] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79A62] cursor-pointer"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="px-6 py-4 sm:px-7 sm:py-5">
          {submission ? (
            <div className="flex flex-col gap-5" data-testid="incident-photo-confirmation">
              <div className="flex items-start gap-3.5 rounded-lg border border-[#B79A62]/40 bg-[#1C1F21]/75 p-4">
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 shrink-0 text-[#B79A62]"
                  aria-hidden="true"
                />
                <div>
                  <h3 className="font-display text-[17px] font-semibold text-[#F3F0E7]">
                    Votre dossier photo est enregistré
                  </h3>
                  <p className="mt-1 text-[14px] leading-relaxed text-[#F3F0E7]/75">
                    Référence{' '}
                    <span className="font-medium text-[#B79A62] tabular-nums">
                      {submission.reference}
                    </span>{' '}
                    — {submission.photoCount}{' '}
                    {submission.photoCount > 1 ? 'photos jointes' : 'photo jointe'} pour{' '}
                    <span className="font-medium text-[#F3F0E7]">{submission.incidentType}</span>.
                  </p>
                </div>
              </div>

              <p className="text-[14px] text-[#F3F0E7]/75 leading-relaxed">
                Un technicien de Serrurerie de la République vous rappellera au{' '}
                <span className="font-medium text-[#F3F0E7] tabular-nums">{submission.phone}</span>.
                Pour une mise en sécurité immédiate, appelez le{' '}
                <a
                  href={brand.phoneHref}
                  className="font-semibold text-[#B79A62] hover:underline tabular-nums"
                >
                  {brand.phoneDisplay}
                </a>
                .
              </p>

              <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-[#F3F0E7]/25 px-5 py-2.5 text-[14px] font-medium text-[#F3F0E7] hover:border-[#F3F0E7]/60 transition-colors duration-150 cursor-pointer"
                >
                  Nouvel envoi
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[#B79A62] hover:bg-[#C6AA73] px-6 py-2.5 text-[14px] font-semibold text-[#1C1F21] transition-colors duration-150 cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
              <div>
                <label
                  htmlFor="incident-type"
                  className="block text-[14px] font-medium text-[#F3F0E7]/90"
                >
                  Nature du sinistre
                </label>
                <select
                  ref={firstInputRef}
                  id="incident-type"
                  value={draft.incidentType}
                  onChange={(e) => updateField('incidentType', e.target.value as IncidentType)}
                  className={`${inputBaseClass} border-[#F3F0E7]/18`}
                >
                  {INCIDENT_TYPES.map((type) => (
                    <option key={type} value={type} className="bg-[#1C1F21] text-[#F3F0E7]">
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Zone d'ajout de photos */}
              <div>
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="incident-files"
                    className="block text-[14px] font-medium text-[#F3F0E7]/90"
                  >
                    Photos des dégâts <span aria-hidden="true" className="text-[#B79A62]">*</span>
                  </label>
                  <span className="text-[12px] text-[#F3F0E7]/55 tabular-nums">
                    {photos.length} / {MAX_INCIDENT_PHOTOS}
                  </span>
                </div>

                <input
                  ref={fileInputRef}
                  id="incident-files"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleFilesSelected}
                  className="sr-only"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={photos.length >= MAX_INCIDENT_PHOTOS}
                  className={`mt-1.5 flex w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed px-4 py-3.5 text-center transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.photos
                      ? 'border-[#E58E73] bg-[#1C1F21]/80'
                      : 'border-[#F3F0E7]/25 bg-[#1C1F21]/55 hover:border-[#B79A62]'
                  }`}
                >
                  <Upload className="h-5 w-5 text-[#B79A62]" aria-hidden="true" />
                  <span className="text-[14px] font-medium text-[#F3F0E7]">
                    Sélectionner des photos (JPG, PNG, WebP)
                  </span>
                  <span className="text-[12px] text-[#F3F0E7]/55">
                    Vue d’ensemble de la porte ou vitrine + gros plan sur la zone endommagée
                  </span>
                </button>

                {fileWarning && (
                  <p role="alert" className="mt-1.5 text-[13px] text-[#F3A68D]">
                    {fileWarning}
                  </p>
                )}

                {errors.photos && (
                  <p role="alert" className="mt-1.5 text-[13px] text-[#F3A68D]">
                    {errors.photos}
                  </p>
                )}

                {photos.length > 0 && (
                  <ul
                    aria-label="Photos sélectionnées"
                    className="mt-3 grid grid-cols-3 gap-2.5"
                  >
                    {photos.map((photo) => (
                      <li
                        key={photo.id}
                        className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-[#F3F0E7]/15 bg-[#1C1F21]"
                      >
                        <img
                          src={photo.previewUrl}
                          alt={photo.name}
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(photo.id)}
                          aria-label={`Retirer la photo ${photo.name}`}
                          className="absolute right-1.5 top-1.5 inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#1C1F21]/85 text-[#F3F0E7] hover:bg-[#B79A62] hover:text-[#1C1F21] transition-colors duration-150 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="incident-fullName"
                    className="block text-[14px] font-medium text-[#F3F0E7]/90"
                  >
                    Nom complet <span aria-hidden="true" className="text-[#B79A62]">*</span>
                  </label>
                  <input
                    id="incident-fullName"
                    type="text"
                    value={draft.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    placeholder="Ex. Marc Laurent"
                    aria-invalid={Boolean(errors.fullName)}
                    className={`${inputBaseClass} ${
                      errors.fullName ? 'border-[#E58E73]' : 'border-[#F3F0E7]/18'
                    }`}
                  />
                  {errors.fullName && (
                    <p role="alert" className="mt-1.5 text-[13px] text-[#F3A68D]">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="incident-phone"
                    className="block text-[14px] font-medium text-[#F3F0E7]/90"
                  >
                    Téléphone <span aria-hidden="true" className="text-[#B79A62]">*</span>
                  </label>
                  <input
                    id="incident-phone"
                    type="tel"
                    value={draft.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="06 12 34 56 78"
                    aria-invalid={Boolean(errors.phone)}
                    className={`${inputBaseClass} tabular-nums ${
                      errors.phone ? 'border-[#E58E73]' : 'border-[#F3F0E7]/18'
                    }`}
                  />
                  {errors.phone && (
                    <p role="alert" className="mt-1.5 text-[13px] text-[#F3A68D]">
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="incident-insurer"
                  className="block text-[14px] font-medium text-[#F3F0E7]/90"
                >
                  Assureur / n° de sinistre{' '}
                  <span className="text-[#F3F0E7]/45 font-normal">(optionnel)</span>
                </label>
                <input
                  id="incident-insurer"
                  type="text"
                  value={draft.insurer}
                  onChange={(e) => updateField('insurer', e.target.value)}
                  placeholder="Ex. Nom de votre assurance ou numéro de dossier"
                  className={`${inputBaseClass} border-[#F3F0E7]/18`}
                />
              </div>

              <div>
                <label
                  htmlFor="incident-note"
                  className="block text-[14px] font-medium text-[#F3F0E7]/90"
                >
                  Précisions utiles{' '}
                  <span className="text-[#F3F0E7]/45 font-normal">(optionnel)</span>
                </label>
                <textarea
                  id="incident-note"
                  rows={2}
                  value={draft.note}
                  onChange={(e) => updateField('note', e.target.value)}
                  placeholder="Porte fermant encore ou non, quartier à Marseille, disponibilités…"
                  className={`${inputBaseClass} border-[#F3F0E7]/18 resize-y`}
                />
              </div>

              <div className="mt-2 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-[#F3F0E7]/10 pt-4">
                <a
                  href={brand.phoneHref}
                  className="inline-flex items-center gap-2 text-[14px] text-[#F3F0E7]/78 hover:text-[#B79A62] transition-colors duration-150 tabular-nums"
                >
                  <Phone className="h-4 w-4 text-[#B79A62]" aria-hidden="true" />
                  <span>Urgence : {brand.phoneDisplay}</span>
                </a>

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-[#F3F0E7]/20 px-4 py-2.5 text-[14px] font-medium text-[#F3F0E7]/85 hover:border-[#F3F0E7]/50 hover:text-[#F3F0E7] transition-colors duration-150 cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#B79A62] hover:bg-[#C6AA73] active:bg-[#A68952] px-6 py-2.5 text-[14px] font-semibold text-[#1C1F21] whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F3F0E7] cursor-pointer"
                  >
                    <Camera className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>Transmettre mes photos</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
