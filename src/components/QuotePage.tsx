import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  AppWindow,
  ArrowRight,
  DoorOpen,
  Blinds,
  Check,
  ChevronLeft,
  KeyRound,
  Lock,
  MapPin,
  Phone,
  ShieldAlert,
  type LucideIcon,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { BrandConfig } from '../utils/navigation';
import { createQuoteReference, QUOTE_DOMAINS, type QuoteDomain } from '../utils/quoteForm';
import {
  buildQuoteSummary,
  CALLBACK_OPTIONS,
  CONTACT_PREFERENCE_OPTIONS,
  createInitialDraft,
  CUSTOMER_OPTIONS,
  firstIncompleteStep,
  NEEDS_BY_DOMAIN,
  QUOTE_STEPS,
  URGENCY_OPTIONS,
  validateQuoteStep,
  withDomain,
  type QuoteStepId,
  type QuoteWizardDraft,
  type QuoteWizardErrors,
} from '../utils/quoteWizard';
import { hrefForHome, hrefForPage, type RouterMode } from '../utils/router';
import { checkServiceSector } from '../utils/serviceArea';
import { REVEAL_EASE } from '../utils/scrollReveal';
import { PageHero, usePageMeta } from './PageHero';

const DOMAIN_ICONS: Readonly<Record<QuoteDomain, LucideIcon>> = {
  'Serrurerie & portes blindées': Lock,
  'Clés & badges': KeyRound,
  'Vitrerie & miroiterie': AppWindow,
  Menuiserie: DoorOpen,
  Fermetures: Blinds,
  'Après sinistre': ShieldAlert,
};

const FIELD_CLASS =
  'mt-1.5 w-full rounded-lg border bg-[#FFFFFF] px-4 py-3 text-[16px] text-[#1C1F21] placeholder:text-[#1C1F21]/40 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B79A62]';

interface QuotePageProps {
  readonly brand: BrandConfig;
  readonly routerMode: RouterMode;
  readonly prefill?: { readonly domain?: QuoteDomain; readonly location?: string };
}

/** Option à choix unique (bouton radio natif, accessible, au style de carte). */
function ChoiceOption({
  name,
  checked,
  onChange,
  children,
  className = '',
}: {
  readonly name: string;
  readonly checked: boolean;
  readonly onChange: () => void;
  readonly children: ReactNode;
  readonly className?: string;
}) {
  return (
    <label className={`relative block cursor-pointer ${className}`}>
      <input type="radio" name={name} checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        className={`flex h-full items-center gap-3 rounded-lg border px-4 py-3.5 text-[15px] transition-colors duration-150 peer-focus-visible:ring-2 peer-focus-visible:ring-[#B79A62] ${
          checked
            ? 'border-[#B79A62] bg-[#B79A62]/12 text-[#1C1F21] font-medium'
            : 'border-[#1C1F21]/15 bg-[#FFFFFF] text-[#1C1F21]/85 hover:border-[#B79A62]/70'
        }`}
      >
        {children}
        {checked && <Check className="ml-auto h-4 w-4 shrink-0 text-[#7D612D]" strokeWidth={2.4} aria-hidden="true" />}
      </span>
    </label>
  );
}

function FieldError({ id, message }: { readonly id: string; readonly message?: string }) {
  if (!message) {
    return null;
  }
  return (
    <p id={id} role="alert" className="mt-1.5 text-[13.5px] font-medium text-[#A33B2B]">
      {message}
    </p>
  );
}

function Fieldset({ legend, error, errorId, children }: { readonly legend: string; readonly error?: string; readonly errorId: string; readonly children: ReactNode }) {
  return (
    <fieldset aria-describedby={error ? errorId : undefined}>
      <legend className="font-display text-[17px] font-semibold text-[#1C1F21]">{legend}</legend>
      <div className="mt-3">{children}</div>
      <FieldError id={errorId} message={error} />
    </fieldset>
  );
}

export function QuotePage({ brand, routerMode, prefill }: QuotePageProps) {
  usePageMeta(
    'Demander un devis — Serrurerie de la République à Marseille',
    'Décrivez votre besoin en serrurerie, vitrerie, menuiserie, fermetures, clés ou après sinistre : nous revenons vers vous avec un devis détaillé.'
  );
  const prefersReducedMotion = Boolean(useReducedMotion());
  const [draft, setDraft] = useState<QuoteWizardDraft>(() => createInitialDraft(prefill));
  const [step, setStep] = useState<QuoteStepId>(() => (prefill?.domain ? 'precisions' : 'besoin'));
  const [errors, setErrors] = useState<QuoteWizardErrors>({});
  const [reference, setReference] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const firstRender = useRef(true);

  const stepIndex = QUOTE_STEPS.findIndex((s) => s.id === step);
  const sector = useMemo(() => checkServiceSector(draft.location), [draft.location]);

  // À chaque changement d'étape : on remonte en haut du questionnaire et on annonce le titre.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const top = (cardRef.current?.getBoundingClientRect().top ?? 0) + window.scrollY - 110;
    if (window.scrollY > top) {
      window.scrollTo({ top, behavior: prefersReducedMotion ? 'instant' : 'smooth' });
    }
    headingRef.current?.focus({ preventScroll: true });
  }, [step, reference, prefersReducedMotion]);

  const update = (patch: Partial<QuoteWizardDraft>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setErrors((e) => {
      const next = { ...e };
      for (const key of Object.keys(patch)) {
        delete next[key as keyof QuoteWizardDraft];
      }
      return next;
    });
  };

  const goTo = (target: QuoteStepId) => {
    setErrors({});
    setStep(target);
  };

  const next = (override?: QuoteWizardDraft) => {
    const current = override ?? draft;
    const stepErrors = validateQuoteStep(step, current);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    goTo(QUOTE_STEPS[Math.min(stepIndex + 1, QUOTE_STEPS.length - 1)].id);
  };

  const submit = () => {
    const blocking = firstIncompleteStep(draft);
    if (blocking !== 'recap') {
      goTo(blocking);
      setErrors(validateQuoteStep(blocking, draft));
      return;
    }
    const now = new Date();
    setReference(createQuoteReference(now, now.getMilliseconds() + draft.fullName.length * 17));
  };

  const restart = () => {
    setDraft(createInitialDraft());
    setReference(null);
    goTo('besoin');
  };

  const stepTitle: Record<QuoteStepId, string> = {
    besoin: 'De quoi avez-vous besoin ?',
    precisions: 'Précisez votre demande.',
    lieu: 'Où et quoi exactement ?',
    coordonnees: 'Comment vous recontacter ?',
    recap: 'Vérifiez votre demande.',
  };

  const motionProps = {
    initial: prefersReducedMotion ? { opacity: 1 } : { opacity: 0, x: 16 },
    animate: { opacity: 1, x: 0 },
    exit: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -16 },
    transition: { duration: prefersReducedMotion ? 0 : 0.25, ease: REVEAL_EASE },
  };

  return (
    <>
      <PageHero
        compact
        kicker="Devis en ligne"
        title="Demander un devis."
        intro="Quelques questions, deux minutes : nous revenons vers vous avec un devis détaillé, validé avec vous avant toute intervention."
        breadcrumb={[{ label: 'Accueil', href: hrefForHome(routerMode) }, { label: 'Demander un devis' }]}
      />

      <section id="page-devis" aria-label="Questionnaire de devis" className="w-full border-t border-[#B79A62]/45 bg-[#F7F5F0] text-[#1C1F21]">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-8 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-12 lg:gap-12 lg:px-10 lg:py-20">
          {/* Étapes */}
          <aside className="lg:col-span-4">
            {/* Mobile : barre de progression */}
            <div className="lg:hidden">
              <p className="text-[13px] font-medium uppercase tracking-[0.16em] text-[#7D612D]">
                {reference ? 'Demande envoyée' : `Étape ${stepIndex + 1} sur ${QUOTE_STEPS.length}`}
              </p>
              <div className="mt-2 flex gap-1.5" aria-hidden="true">
                {QUOTE_STEPS.map((s, i) => (
                  <span key={s.id} className={`h-1 flex-1 rounded-full ${reference || i <= stepIndex ? 'bg-[#B79A62]' : 'bg-[#1C1F21]/12'}`} />
                ))}
              </div>
            </div>

            {/* Ordinateur : liste des étapes */}
            <ol className="hidden lg:flex lg:sticky lg:top-28 flex-col gap-1" aria-label="Étapes du questionnaire">
              {QUOTE_STEPS.map((s, i) => {
                const done = Boolean(reference) || i < stepIndex;
                const current = !reference && i === stepIndex;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      disabled={!done || Boolean(reference)}
                      onClick={() => goTo(s.id)}
                      aria-current={current ? 'step' : undefined}
                      className={`flex w-full items-center gap-4 rounded-lg px-3 py-3 text-left transition-colors duration-150 ${
                        done && !reference ? 'hover:bg-[#1C1F21]/[0.04] cursor-pointer' : 'cursor-default'
                      }`}
                    >
                      <span
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border font-display text-[14px] font-semibold tabular-nums ${
                          current
                            ? 'border-[#1C1F21] bg-[#1C1F21] text-[#B79A62]'
                            : done
                              ? 'border-[#B79A62] bg-[#B79A62] text-[#1C1F21]'
                              : 'border-[#1C1F21]/20 text-[#1C1F21]/45'
                        }`}
                      >
                        {done ? <Check className="h-4 w-4" strokeWidth={2.6} aria-hidden="true" /> : i + 1}
                      </span>
                      <span className={`text-[15.5px] ${current ? 'font-semibold text-[#1C1F21]' : done ? 'text-[#1C1F21]/80' : 'text-[#1C1F21]/45'}`}>
                        {s.label}
                      </span>
                    </button>
                  </li>
                );
              })}
              <li className="mt-6 rounded-xl border border-[#1C1F21]/12 bg-[#FFFFFF] p-5">
                <p className="font-display text-[16px] font-semibold text-[#1C1F21]">Une urgence ?</p>
                <p className="mt-1 text-[14px] leading-[1.55] text-[#1C1F21]/70">Pour une porte claquée ou une effraction, appelez-nous directement.</p>
                <a href={brand.phoneHref} className="mt-3 inline-flex items-center gap-2 text-[15px] font-semibold tabular-nums text-[#7D612D] hover:text-[#1C1F21]">
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  {brand.phoneDisplay}
                </a>
              </li>
            </ol>
          </aside>

          {/* Carte du questionnaire */}
          <div ref={cardRef} className="lg:col-span-8">
            <div className="rounded-xl border border-[#1C1F21]/12 bg-[#FFFFFF] p-6 shadow-[0_18px_50px_rgba(28,31,33,0.06)] sm:p-9">
              <AnimatePresence mode="wait" initial={false}>
                {reference ? (
                  <motion.div key="done" {...motionProps}>
                    <span className="grid h-14 w-14 place-items-center rounded-full bg-[#B79A62] text-[#1C1F21]">
                      <Check className="h-7 w-7" strokeWidth={2.4} aria-hidden="true" />
                    </span>
                    <h2 ref={headingRef} tabIndex={-1} className="mt-5 font-display text-[28px] font-semibold leading-tight text-[#1C1F21] focus:outline-none sm:text-[32px]">
                      Merci, votre demande est bien enregistrée.
                    </h2>
                    <p className="mt-3 text-[16px] leading-[1.6] text-[#1C1F21]/75">
                      Référence <strong className="font-semibold tabular-nums text-[#1C1F21]">{reference}</strong>. Nous vous recontactons au{' '}
                      <strong className="font-semibold tabular-nums text-[#1C1F21]">{draft.phone}</strong> pour établir votre devis.
                    </p>
                    {draft.urgency === 'urgent' && (
                      <p className="mt-4 rounded-lg border border-[#B79A62]/50 bg-[#F7F5F0] px-4 py-3 text-[15px] text-[#1C1F21]/85">
                        C’est urgent ? N’attendez pas notre rappel :{' '}
                        <a href={brand.phoneHref} className="font-semibold tabular-nums text-[#7D612D] underline">
                          appelez le {brand.phoneDisplay}
                        </a>
                        .
                      </p>
                    )}
                    <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                      <a href={hrefForHome(routerMode)} className="inline-flex min-h-[48px] items-center justify-center rounded-lg bg-[#1C1F21] px-6 py-3 text-[15px] font-semibold text-[#F3F0E7] hover:bg-[#292D2F]">
                        Retour à l’accueil
                      </a>
                      <button type="button" onClick={restart} className="inline-flex min-h-[48px] items-center justify-center rounded-lg border border-[#1C1F21]/25 px-6 py-3 text-[15px] font-medium text-[#1C1F21] hover:border-[#1C1F21] cursor-pointer">
                        Faire une autre demande
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key={step} {...motionProps}>
                    <p className="text-[13px] font-medium uppercase tracking-[0.16em] text-[#7D612D]">
                      {QUOTE_STEPS[stepIndex].label}
                    </p>
                    <h2 ref={headingRef} tabIndex={-1} className="mt-2 font-display text-[26px] font-semibold leading-tight text-[#1C1F21] focus:outline-none sm:text-[30px]">
                      {stepTitle[step]}
                    </h2>

                    <div className="mt-7 flex flex-col gap-7">
                      {step === 'besoin' && (
                        <Fieldset legend="Type de besoin" error={errors.domain} errorId="err-domain">
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {QUOTE_DOMAINS.map((domain) => {
                              const Icon = DOMAIN_ICONS[domain];
                              return (
                                <ChoiceOption
                                  key={domain}
                                  name="domain"
                                  checked={draft.domain === domain}
                                  onChange={() => {
                                    const nextDraft = withDomain(draft, domain);
                                    update({ domain, need: nextDraft.need });
                                    next(nextDraft);
                                  }}
                                >
                                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#B79A62]/45 bg-[#F7F5F0] text-[#7D612D]">
                                    <Icon className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
                                  </span>
                                  <span className="font-medium">{domain}</span>
                                </ChoiceOption>
                              );
                            })}
                          </div>
                        </Fieldset>
                      )}

                      {step === 'precisions' && draft.domain && (
                        <>
                          <Fieldset legend={`Votre besoin en ${draft.domain.toLowerCase()}`} error={errors.need} errorId="err-need">
                            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                              {NEEDS_BY_DOMAIN[draft.domain].map((need) => (
                                <ChoiceOption key={need} name="need" checked={draft.need === need} onChange={() => update({ need })}>
                                  {need}
                                </ChoiceOption>
                              ))}
                            </div>
                          </Fieldset>
                          <Fieldset legend="Quand ?" error={errors.urgency} errorId="err-urgency">
                            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                              {URGENCY_OPTIONS.map((o) => (
                                <ChoiceOption key={o.id} name="urgency" checked={draft.urgency === o.id} onChange={() => update({ urgency: o.id })}>
                                  <span className="flex flex-col">
                                    <span className="font-medium">{o.label}</span>
                                    <span className="text-[13px] text-[#1C1F21]/60">{o.hint}</span>
                                  </span>
                                </ChoiceOption>
                              ))}
                            </div>
                            {draft.urgency === 'urgent' && (
                              <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-[#B79A62]/50 bg-[#F7F5F0] px-4 py-3 text-[14.5px] text-[#1C1F21]/85">
                                Pour une urgence, le plus rapide reste le téléphone :
                                <a href={brand.phoneHref} className="inline-flex items-center gap-1.5 font-semibold tabular-nums text-[#7D612D] underline">
                                  <Phone className="h-4 w-4" aria-hidden="true" />
                                  {brand.phoneDisplay}
                                </a>
                              </p>
                            )}
                          </Fieldset>
                          <Fieldset legend="Vous êtes" error={errors.customerType} errorId="err-customer">
                            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                              {CUSTOMER_OPTIONS.map((o) => (
                                <ChoiceOption key={o.id} name="customer" checked={draft.customerType === o.id} onChange={() => update({ customerType: o.id })}>
                                  {o.label}
                                </ChoiceOption>
                              ))}
                            </div>
                          </Fieldset>
                        </>
                      )}

                      {step === 'lieu' && (
                        <>
                          <div>
                            <label htmlFor="q-location" className="font-display text-[17px] font-semibold text-[#1C1F21]">
                              Ville, arrondissement ou code postal
                            </label>
                            <input
                              id="q-location"
                              type="text"
                              autoComplete="address-level2"
                              value={draft.location}
                              onChange={(e) => update({ location: e.target.value })}
                              placeholder="Ex. Marseille 13006, Aubagne…"
                              aria-invalid={Boolean(errors.location)}
                              aria-describedby={errors.location ? 'err-location' : 'q-location-hint'}
                              className={`${FIELD_CLASS} ${errors.location ? 'border-[#A33B2B]' : 'border-[#1C1F21]/20'}`}
                            />
                            <FieldError id="err-location" message={errors.location} />
                            {!errors.location && sector.status !== 'empty' && (
                              <p id="q-location-hint" className={`mt-2 inline-flex items-center gap-2 text-[14px] ${sector.status === 'covered' ? 'text-[#3F6B3A]' : 'text-[#1C1F21]/65'}`}>
                                <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                                {sector.message}
                              </p>
                            )}
                          </div>
                          <div>
                            <label htmlFor="q-details" className="font-display text-[17px] font-semibold text-[#1C1F21]">
                              Décrivez votre besoin
                            </label>
                            <textarea
                              id="q-details"
                              rows={5}
                              value={draft.details}
                              onChange={(e) => update({ details: e.target.value })}
                              placeholder="Ex. porte d’entrée qui ferme mal, serrure 3 points, appartement au 2e étage…"
                              aria-invalid={Boolean(errors.details)}
                              aria-describedby={errors.details ? 'err-details' : undefined}
                              className={`${FIELD_CLASS} resize-y ${errors.details ? 'border-[#A33B2B]' : 'border-[#1C1F21]/20'}`}
                            />
                            <FieldError id="err-details" message={errors.details} />
                          </div>
                        </>
                      )}

                      {step === 'coordonnees' && (
                        <>
                          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                              <label htmlFor="q-name" className="text-[15px] font-medium text-[#1C1F21]">Nom et prénom</label>
                              <input id="q-name" type="text" autoComplete="name" value={draft.fullName} onChange={(e) => update({ fullName: e.target.value })}
                                aria-invalid={Boolean(errors.fullName)} aria-describedby={errors.fullName ? 'err-name' : undefined}
                                className={`${FIELD_CLASS} ${errors.fullName ? 'border-[#A33B2B]' : 'border-[#1C1F21]/20'}`} />
                              <FieldError id="err-name" message={errors.fullName} />
                            </div>
                            <div>
                              <label htmlFor="q-phone" className="text-[15px] font-medium text-[#1C1F21]">Téléphone</label>
                              <input id="q-phone" type="tel" inputMode="tel" autoComplete="tel" value={draft.phone} onChange={(e) => update({ phone: e.target.value })}
                                placeholder="06 12 34 56 78" aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'err-phone' : undefined}
                                className={`${FIELD_CLASS} ${errors.phone ? 'border-[#A33B2B]' : 'border-[#1C1F21]/20'}`} />
                              <FieldError id="err-phone" message={errors.phone} />
                            </div>
                            <div>
                              <label htmlFor="q-email" className="text-[15px] font-medium text-[#1C1F21]">
                                E-mail <span className="font-normal text-[#1C1F21]/55">(facultatif)</span>
                              </label>
                              <input id="q-email" type="email" autoComplete="email" value={draft.email} onChange={(e) => update({ email: e.target.value })}
                                aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'err-email' : undefined}
                                className={`${FIELD_CLASS} ${errors.email ? 'border-[#A33B2B]' : 'border-[#1C1F21]/20'}`} />
                              <FieldError id="err-email" message={errors.email} />
                            </div>
                          </div>
                          <Fieldset legend="Comment souhaitez-vous poursuivre ?" errorId="err-pref">
                            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                              {CONTACT_PREFERENCE_OPTIONS.map((o) => (
                                <ChoiceOption key={o.id} name="pref" checked={draft.contactPreference === o.id} onChange={() => update({ contactPreference: o.id })}>
                                  {o.label}
                                </ChoiceOption>
                              ))}
                            </div>
                          </Fieldset>
                          <Fieldset legend="Vos disponibilités" errorId="err-callback">
                            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                              {CALLBACK_OPTIONS.map((o) => (
                                <ChoiceOption key={o.id} name="callback" checked={draft.callbackSlot === o.id} onChange={() => update({ callbackSlot: o.id })}>
                                  {o.label}
                                </ChoiceOption>
                              ))}
                            </div>
                          </Fieldset>
                          <div>
                            <label className="flex cursor-pointer items-start gap-3 text-[14.5px] leading-[1.55] text-[#1C1F21]/80">
                              <input type="checkbox" checked={draft.consent} onChange={(e) => update({ consent: e.target.checked })}
                                aria-invalid={Boolean(errors.consent)} aria-describedby={errors.consent ? 'err-consent' : undefined}
                                className="mt-1 h-5 w-5 shrink-0 accent-[#7D612D]" />
                              <span>
                                J’accepte que Serrurerie de la République utilise ces informations pour me recontacter au sujet de ma demande.{' '}
                                <a href={hrefForPage('confidentialite', routerMode)} className="text-[#7D612D] underline">En savoir plus</a>
                              </span>
                            </label>
                            <FieldError id="err-consent" message={errors.consent} />
                          </div>
                        </>
                      )}

                      {step === 'recap' && (
                        <dl className="divide-y divide-[#1C1F21]/10 rounded-lg border border-[#1C1F21]/12">
                          {buildQuoteSummary(draft).map((row) => (
                            <div key={row.label} className="grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-[150px_1fr] sm:gap-4">
                              <dt className="text-[13px] font-medium uppercase tracking-[0.12em] text-[#7D612D]">{row.label}</dt>
                              <dd className="whitespace-pre-line text-[15.5px] text-[#1C1F21]">{row.value}</dd>
                            </div>
                          ))}
                        </dl>
                      )}
                    </div>

                    {/* Navigation */}
                    <div className="mt-9 flex flex-col-reverse gap-3 border-t border-[#1C1F21]/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                      {stepIndex > 0 ? (
                        <button type="button" onClick={() => goTo(QUOTE_STEPS[stepIndex - 1].id)}
                          className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg px-4 py-3 text-[15px] font-medium text-[#1C1F21]/75 hover:text-[#1C1F21] cursor-pointer">
                          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                          Retour
                        </button>
                      ) : (
                        <span />
                      )}
                      {step === 'recap' ? (
                        <button type="button" onClick={submit}
                          className="inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-lg bg-[#B79A62] px-8 py-3 text-[16px] font-semibold text-[#1C1F21] hover:bg-[#C6AA73] active:bg-[#A68952] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C1F21] cursor-pointer">
                          Envoyer ma demande
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </button>
                      ) : (
                        <button type="button" onClick={() => next()}
                          className="inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-lg bg-[#1C1F21] px-8 py-3 text-[16px] font-semibold text-[#F3F0E7] hover:bg-[#292D2F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79A62] cursor-pointer">
                          Continuer
                          <ArrowRight className="h-4 w-4 text-[#B79A62]" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <p className="mt-4 text-center text-[13.5px] text-[#1C1F21]/55 lg:hidden">
              Une urgence ? <a href={brand.phoneHref} className="font-semibold tabular-nums text-[#7D612D]">{brand.phoneDisplay}</a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
