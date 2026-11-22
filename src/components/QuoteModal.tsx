import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Phone, X } from 'lucide-react';
import type { BrandConfig } from '../utils/navigation';
import {
  INITIAL_QUOTE_DRAFT,
  QUOTE_DOMAINS,
  createQuoteReference,
  validateQuoteForm,
  type QuoteDomain,
  type QuoteFormDraft,
  type QuoteFormErrors,
  type QuoteSubmissionRecord,
} from '../utils/quoteForm';

interface QuoteModalProps {
  readonly isOpen: boolean;
  readonly brand: BrandConfig;
  readonly initialDomain?: QuoteDomain;
  readonly initialDistrict?: string;
  readonly onClose: () => void;
  readonly onSubmitted?: (record: QuoteSubmissionRecord) => void;
}

export function QuoteModal({
  isOpen,
  brand,
  initialDomain,
  initialDistrict,
  onClose,
  onSubmitted,
}: QuoteModalProps) {
  const [draft, setDraft] = useState<QuoteFormDraft>(INITIAL_QUOTE_DRAFT);
  const [errors, setErrors] = useState<QuoteFormErrors>({});
  const [submittedRecord, setSubmittedRecord] = useState<QuoteSubmissionRecord | null>(null);
  const firstInputRef = useRef<HTMLSelectElement | null>(null);

  useEffect(() => {
    if (isOpen && (initialDomain || initialDistrict)) {
      setDraft((prev) => ({
        ...prev,
        ...(initialDomain ? { domain: initialDomain } : {}),
        ...(initialDistrict ? { district: initialDistrict } : {}),
      }));
      setSubmittedRecord(null);
      setErrors({});
    }
  }, [isOpen, initialDomain, initialDistrict]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = window.setTimeout(() => {
      firstInputRef.current?.focus();
    }, 30);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const updateField = <K extends keyof QuoteFormDraft>(
    field: K,
    value: QuoteFormDraft[K]
  ) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validateQuoteForm(draft);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstErrorField = Object.keys(validationErrors)[0];
      const el = document.getElementById(`quote-${firstErrorField}`);
      el?.focus();
      return;
    }

    const now = new Date();
    const record: QuoteSubmissionRecord = {
      ...draft,
      fullName: draft.fullName.trim(),
      phone: draft.phone.trim(),
      email: draft.email.trim(),
      district: draft.district.trim(),
      details: draft.details.trim(),
      reference: createQuoteReference(now, now.getMilliseconds() + draft.fullName.length * 17),
      submittedAt: now.toISOString(),
    };

    setSubmittedRecord(record);
    setErrors({});
    onSubmitted?.(record);
  };

  const handleReset = () => {
    setDraft(INITIAL_QUOTE_DRAFT);
    setErrors({});
    setSubmittedRecord(null);
  };

  const inputBaseClass =
    'mt-1.5 w-full rounded-lg border bg-[#1C1F21] px-3.5 py-2.5 text-[15px] text-[#F3F0E7] placeholder:text-[#F3F0E7]/38 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B79A62]';

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6"
      role="presentation"
    >
      {/* Fond assombri */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-xs"
      />

      {/* Conteneur modale */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quote-modal-title"
        aria-describedby="quote-modal-desc"
        className="relative z-10 w-full max-w-[580px] max-h-[90vh] overflow-y-auto rounded-xl border border-[#F3F0E7]/15 bg-[#292D2F] shadow-2xl"
      >
        {/* En-tête modale */}
        <div className="flex items-start justify-between gap-4 border-b border-[#F3F0E7]/12 px-6 py-5 sm:px-7">
          <div>
            <p className="text-[12px] font-medium tracking-[0.14em] text-[#B79A62]">
              Devis gratuit &amp; détaillé
            </p>
            <h2
              id="quote-modal-title"
              className="mt-1 font-display text-[22px] sm:text-[24px] font-semibold tracking-[-0.01em] text-[#F3F0E7]"
            >
              Demander un devis
            </h2>
            <p
              id="quote-modal-desc"
              className="mt-1 text-[14px] text-[#F3F0E7]/70"
            >
              Décrivez votre besoin à notre équipe marseillaise pour recevoir une réponse claire.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer le formulaire de devis"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[#F3F0E7]/15 bg-[#1C1F21]/50 text-[#F3F0E7]/80 hover:border-[#B79A62] hover:text-[#F3F0E7] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79A62] cursor-pointer"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Corps modale */}
        <div className="px-6 py-6 sm:px-7">
          {submittedRecord ? (
            <div className="flex flex-col gap-5" data-testid="quote-confirmation">
              <div className="flex items-start gap-3.5 rounded-lg border border-[#B79A62]/40 bg-[#1C1F21]/75 p-4">
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 shrink-0 text-[#B79A62]"
                  aria-hidden="true"
                />
                <div>
                  <h3 className="font-display text-[17px] font-semibold text-[#F3F0E7]">
                    Votre demande de devis est enregistrée
                  </h3>
                  <p className="mt-1 text-[14px] leading-relaxed text-[#F3F0E7]/75">
                    Référence{' '}
                    <span className="font-medium text-[#B79A62] tabular-nums">
                      {submittedRecord.reference}
                    </span>{' '}
                    — notre atelier vous recontactera au{' '}
                    <span className="font-medium text-[#F3F0E7] tabular-nums">
                      {submittedRecord.phone}
                    </span>
                    .
                  </p>
                </div>
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 border-y border-[#F3F0E7]/10 py-4 text-[14px]">
                <div>
                  <dt className="text-[#F3F0E7]/55">Domaine</dt>
                  <dd className="mt-0.5 font-medium text-[#F3F0E7]">
                    {submittedRecord.domain}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#F3F0E7]/55">Contact</dt>
                  <dd className="mt-0.5 font-medium text-[#F3F0E7]">
                    {submittedRecord.fullName}
                  </dd>
                </div>
                {submittedRecord.district && (
                  <div className="sm:col-span-2">
                    <dt className="text-[#F3F0E7]/55">Secteur</dt>
                    <dd className="mt-0.5 text-[#F3F0E7]">
                      {submittedRecord.district}
                    </dd>
                  </div>
                )}
                <div className="sm:col-span-2">
                  <dt className="text-[#F3F0E7]/55">Besoin précisé</dt>
                  <dd className="mt-0.5 text-[#F3F0E7]/90 leading-relaxed">
                    {submittedRecord.details}
                  </dd>
                </div>
              </dl>

              <p className="text-[13px] text-[#F3F0E7]/68">
                Besoin d’une intervention urgente ? Appelez directement le{' '}
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
                  Nouvelle demande
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
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="quote-domain"
                  className="block text-[14px] font-medium text-[#F3F0E7]/90"
                >
                  Domaine d’intervention
                </label>
                <select
                  ref={firstInputRef}
                  id="quote-domain"
                  value={draft.domain}
                  onChange={(e) => updateField('domain', e.target.value as QuoteDomain)}
                  aria-invalid={Boolean(errors.domain)}
                  className={`${inputBaseClass} ${
                    errors.domain ? 'border-[#E58E73]' : 'border-[#F3F0E7]/18'
                  }`}
                >
                  {QUOTE_DOMAINS.map((domain) => (
                    <option key={domain} value={domain} className="bg-[#1C1F21] text-[#F3F0E7]">
                      {domain}
                    </option>
                  ))}
                </select>
                {errors.domain && (
                  <p role="alert" className="mt-1.5 text-[13px] text-[#F3A68D]">
                    {errors.domain}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="quote-fullName"
                    className="block text-[14px] font-medium text-[#F3F0E7]/90"
                  >
                    Nom complet <span aria-hidden="true" className="text-[#B79A62]">*</span>
                  </label>
                  <input
                    id="quote-fullName"
                    type="text"
                    autoComplete="name"
                    value={draft.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    placeholder="Ex. Claire Moreau"
                    aria-invalid={Boolean(errors.fullName)}
                    aria-describedby={errors.fullName ? 'quote-fullName-error' : undefined}
                    className={`${inputBaseClass} ${
                      errors.fullName ? 'border-[#E58E73]' : 'border-[#F3F0E7]/18'
                    }`}
                  />
                  {errors.fullName && (
                    <p
                      id="quote-fullName-error"
                      role="alert"
                      className="mt-1.5 text-[13px] text-[#F3A68D]"
                    >
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="quote-phone"
                    className="block text-[14px] font-medium text-[#F3F0E7]/90"
                  >
                    Téléphone <span aria-hidden="true" className="text-[#B79A62]">*</span>
                  </label>
                  <input
                    id="quote-phone"
                    type="tel"
                    autoComplete="tel"
                    value={draft.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="06 12 34 56 78"
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? 'quote-phone-error' : undefined}
                    className={`${inputBaseClass} tabular-nums ${
                      errors.phone ? 'border-[#E58E73]' : 'border-[#F3F0E7]/18'
                    }`}
                  />
                  {errors.phone && (
                    <p
                      id="quote-phone-error"
                      role="alert"
                      className="mt-1.5 text-[13px] text-[#F3A68D]"
                    >
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="quote-district"
                    className="block text-[14px] font-medium text-[#F3F0E7]/90"
                  >
                    Quartier ou commune
                  </label>
                  <input
                    id="quote-district"
                    type="text"
                    value={draft.district}
                    onChange={(e) => updateField('district', e.target.value)}
                    placeholder="Ex. République, Lodi, Allauch"
                    className={`${inputBaseClass} border-[#F3F0E7]/18`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="quote-email"
                    className="block text-[14px] font-medium text-[#F3F0E7]/90"
                  >
                    E-mail <span className="text-[#F3F0E7]/45 font-normal">(optionnel)</span>
                  </label>
                  <input
                    id="quote-email"
                    type="email"
                    autoComplete="email"
                    value={draft.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="nom@exemple.fr"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'quote-email-error' : undefined}
                    className={`${inputBaseClass} ${
                      errors.email ? 'border-[#E58E73]' : 'border-[#F3F0E7]/18'
                    }`}
                  />
                  {errors.email && (
                    <p
                      id="quote-email-error"
                      role="alert"
                      className="mt-1.5 text-[13px] text-[#F3A68D]"
                    >
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="quote-details"
                  className="block text-[14px] font-medium text-[#F3F0E7]/90"
                >
                  Description de votre besoin{' '}
                  <span aria-hidden="true" className="text-[#B79A62]">*</span>
                </label>
                <textarea
                  id="quote-details"
                  rows={3}
                  value={draft.details}
                  onChange={(e) => updateField('details', e.target.value)}
                  placeholder="Type de porte, serrure, vitrage ou fermeture, urgence éventuelle…"
                  aria-invalid={Boolean(errors.details)}
                  aria-describedby={errors.details ? 'quote-details-error' : undefined}
                  className={`${inputBaseClass} resize-y min-h-[88px] ${
                    errors.details ? 'border-[#E58E73]' : 'border-[#F3F0E7]/18'
                  }`}
                />
                {errors.details && (
                  <p
                    id="quote-details-error"
                    role="alert"
                    className="mt-1.5 text-[13px] text-[#F3A68D]"
                  >
                    {errors.details}
                  </p>
                )}
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
                    className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[#B79A62] hover:bg-[#C6AA73] active:bg-[#A68952] px-6 py-2.5 text-[14px] font-semibold text-[#1C1F21] whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F3F0E7] cursor-pointer"
                  >
                    Envoyer ma demande
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
