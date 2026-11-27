import { useRef, useState, type ReactNode } from 'react';
import { Building2, Check, Home, KeyRound, Phone, Send, ShieldCheck, Store, Ticket } from 'lucide-react';
import type { BrandConfig } from '../utils/navigation';
import {
  buildOfferSummary,
  CUSTOMER_TYPES,
  formatFrenchDate,
  INITIAL_OFFER_DRAFT,
  isProfessional,
  OFFER_CONDITIONS,
  OFFER_MONTHS,
  OFFER_RATE,
  offerValidUntil,
  validateOfferDraft,
  type CustomerType,
  type OfferDraft,
  type OfferErrors,
} from '../utils/offerForm';
import { hrefForHome, hrefForPage, type RouterMode } from '../utils/router';
import { BrandMark } from './BrandMark';
import { sendFormRequest } from '../utils/formDelivery';
import { DeliveryErrorNotice, HoneypotField } from './FormDelivery';

const TYPE_ICONS: Readonly<Record<CustomerType, typeof Building2>> = {
  'Syndic / copropriété': Building2,
  'Agence immobilière / bailleur': KeyRound,
  'Assureur / expert': ShieldCheck,
  'Commerce / entreprise': Store,
  Particulier: Home,
};

const FIELD =
  'mt-1.5 w-full rounded-lg border bg-[#FFFFFF] px-4 py-3 text-[16px] text-[#1C1F21] placeholder:text-[#1C1F21]/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B79A62]';

function ErrorText({ id, message }: { readonly id: string; readonly message?: string }) {
  return message ? (
    <p id={id} role="alert" className="mt-1.5 text-[13.5px] font-medium text-[#A33B2B]">
      {message}
    </p>
  ) : null;
}

function TextField({
  id,
  label,
  value,
  onChange,
  error,
  optional,
  type = 'text',
  autoComplete,
  placeholder,
}: {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly onChange: (v: string) => void;
  readonly error?: string;
  readonly optional?: boolean;
  readonly type?: string;
  readonly autoComplete?: string;
  readonly placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-[15px] font-medium text-[#1C1F21]">
        {label} {optional && <span className="font-normal text-[#1C1F21]/55">(facultatif)</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-err` : undefined}
        className={`${FIELD} ${error ? 'border-[#A33B2B]' : 'border-[#1C1F21]/20'}`}
      />
      <ErrorText id={`${id}-err`} message={error} />
    </div>
  );
}

function Group({ title, children }: { readonly title: string; readonly children: ReactNode }) {
  return (
    <div className="border-t border-[#1C1F21]/10 pt-7 first:border-t-0 first:pt-0">
      <h2 className="font-display text-[20px] font-semibold text-[#1C1F21]">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function ConditionsList({ className = '' }: { readonly className?: string }) {
  return (
    <ul className={`flex flex-col gap-3 text-[15px] leading-[1.5] text-[#1C1F21]/80 ${className}`}>
      {OFFER_CONDITIONS.map((item) => (
        <li key={item} className="flex gap-3">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#7D612D]" strokeWidth={2.4} aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  );
}

interface Registered {
  readonly code: string;
  readonly validUntil: string;
  readonly alreadyRegistered: boolean;
}

/** Page /offre : inscription à l'offre -5 % du flyer (accès par QR code). */
export function OfferPage({ brand, routerMode }: { readonly brand: BrandConfig; readonly routerMode: RouterMode }) {
  const [draft, setDraft] = useState<OfferDraft>(INITIAL_OFFER_DRAFT);
  const [errors, setErrors] = useState<OfferErrors>({});
  const [registered, setRegistered] = useState<Registered | null>(null);
  const [honeypot, setHoneypot] = useState('');
  const [startedAt] = useState(() => Date.now());
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState<'reseau' | 'limite' | 'refus' | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const doneRef = useRef<HTMLHeadingElement | null>(null);

  const update = (patch: Partial<OfferDraft>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setErrors((e) => {
      const next = { ...e };
      for (const key of Object.keys(patch)) {
        delete next[key as keyof OfferDraft];
      }
      return next;
    });
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (sending) return;
    const found = validateOfferDraft(draft);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      const first = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"], [data-invalid="true"]');
      first?.focus();
      first?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }
    setSending(true);
    setFailure(null);
    const result = await sendFormRequest({ kind: 'inscription', rows: buildOfferSummary(draft), startedAt, honeypot });
    setSending(false);
    if (!result.ok) {
      setFailure(result.reason);
      return;
    }
    setRegistered({
      code: result.reference,
      validUntil: result.validUntil ?? formatFrenchDate(offerValidUntil()),
      alreadyRegistered: result.alreadyRegistered === true,
    });
    window.requestAnimationFrame(() => {
      doneRef.current?.focus();
      doneRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
  };

  const pro = isProfessional(draft.customerType);

  return (
    <div className="flex flex-1 flex-col bg-[#F7F5F0] text-[#1C1F21]">
      {/* Haut de page : uniquement l'offre (pas de menu du site) */}
      <section className="relative overflow-hidden bg-[#1C1F21] text-[#F3F0E7]">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-[360px] w-[360px] rounded-full bg-[#B79A62]/12 blur-3xl" />
        <div className="relative mx-auto max-w-[1080px] px-5 pb-28 pt-5 sm:px-8 sm:pb-32 lg:px-10">
          <div className="flex items-center justify-between gap-4">
            <a href={hrefForHome(routerMode)} aria-label={`${brand.name} — site`} className="inline-flex items-center rounded-md py-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B79A62]">
              <BrandMark brand={brand} compact />
            </a>
            <a href={brand.phoneHref} className="inline-flex h-11 items-center gap-2 rounded-full border border-[#F3F0E7]/20 px-4 text-[15px] font-semibold tabular-nums hover:border-[#B79A62] [&_svg]:text-[#B79A62]">
              <Phone className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">{brand.phoneDisplay}</span>
              <span className="sm:hidden">Appeler</span>
            </a>
          </div>

          <div className="mt-10 grid items-end gap-8 sm:mt-14 lg:grid-cols-[auto_1fr] lg:gap-14">
            <p className="font-display text-[88px] font-bold leading-[0.9] tracking-[-0.03em] text-[#B79A62] sm:text-[120px]">-{OFFER_RATE}%</p>
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#B79A62]">Offre de bienvenue</p>
              <h1 className="mt-3 font-display text-[30px] font-semibold leading-[1.1] sm:text-[40px]">
                sur votre premier achat ou votre première intervention.
              </h1>
              <p className="mt-4 text-[16px] leading-[1.6] text-[#F3F0E7]/75">
                Inscrivez-vous ci-dessous : vous recevez votre code tout de suite, valable {OFFER_MONTHS} mois.
              </p>
            </div>
          </div>

          <ol className="mt-9 grid gap-3 sm:grid-cols-3">
            {['Inscrivez-vous', 'Recevez votre code', 'Donnez-le au moment du devis'].map((step, i) => (
              <li key={step} className="flex items-center gap-3 rounded-lg border border-[#F3F0E7]/12 bg-[#F3F0E7]/5 px-4 py-3 text-[15px]">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#B79A62] text-[14px] font-bold text-[#1C1F21]">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Formulaire d'inscription */}
      <section aria-label="Inscription à l’offre" className="relative z-10 mx-auto -mt-20 w-full max-w-[1080px] px-5 sm:px-8 lg:px-10">
        <div className="rounded-xl border border-[#1C1F21]/12 bg-[#FFFFFF] p-6 shadow-[0_18px_50px_rgba(28,31,33,0.10)] sm:p-9">
              {registered ? (
                <div>
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-[#B79A62] text-[#1C1F21]">
                    <Ticket className="h-7 w-7" strokeWidth={2} aria-hidden="true" />
                  </span>
                  <h2 ref={doneRef} tabIndex={-1} className="mt-5 font-display text-[28px] font-semibold leading-tight focus:outline-none">
                    {registered.alreadyRegistered ? 'Vous êtes déjà inscrit.' : 'C’est fait, votre réduction est activée.'}
                  </h2>
                  <div className="mt-6 rounded-xl border-2 border-dashed border-[#B79A62] bg-[#B79A62]/8 p-5 text-center sm:p-6">
                    <p className="text-[14px] font-semibold uppercase tracking-[0.12em] text-[#7D612D]">Votre code -{OFFER_RATE} %</p>
                    <p className="mt-2 font-display text-[30px] font-bold tabular-nums tracking-[0.04em] sm:text-[36px]">{registered.code}</p>
                    <p className="mt-2 text-[15.5px] text-[#1C1F21]/75">
                      Valable jusqu’au <strong className="font-semibold text-[#1C1F21]">{registered.validUntil}</strong>
                    </p>
                  </div>
                  <p className="mt-5 text-[16px] leading-[1.6] text-[#1C1F21]/75">
                    {registered.alreadyRegistered
                      ? 'Voici le code de votre inscription. Il vous a déjà été envoyé par e-mail.'
                      : `Nous vous l’envoyons aussi par e-mail à ${draft.email.trim()}.`}{' '}
                    Donnez ce code au moment du devis, en boutique ou par téléphone.
                  </p>
                  <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    <a href={brand.phoneHref} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#1C1F21] px-5 text-[15px] font-semibold text-[#F3F0E7] hover:bg-[#292D2F] [&_svg]:text-[#B79A62]">
                      <Phone className="h-4 w-4" aria-hidden="true" />
                      {brand.phoneDisplay}
                    </a>
                    <a href={hrefForPage('devis', routerMode)} className="inline-flex h-11 items-center justify-center rounded-full border border-[#1C1F21]/20 px-5 text-[15px] font-semibold text-[#1C1F21] hover:border-[#B79A62]">
                      Demander un devis
                    </a>
                  </div>
                </div>
              ) : (
                <form ref={formRef} onSubmit={submit} noValidate className="relative flex flex-col gap-7">
                  <Group title="Vous êtes">
                    <fieldset data-invalid={Boolean(errors.customerType)} tabIndex={-1} aria-describedby={errors.customerType ? 'type-err' : undefined}>
                      <legend className="sr-only">Vous êtes</legend>
                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                        {CUSTOMER_TYPES.map((type) => {
                          const Icon = TYPE_ICONS[type];
                          const checked = draft.customerType === type;
                          return (
                            <label key={type} className="relative block cursor-pointer">
                              <input type="radio" name="type" checked={checked} onChange={() => update({ customerType: type })} className="peer sr-only" />
                              <span className={`flex items-center gap-3 rounded-lg border px-4 py-3.5 text-[15px] transition-colors duration-150 peer-focus-visible:ring-2 peer-focus-visible:ring-[#B79A62] ${checked ? 'border-[#B79A62] bg-[#B79A62]/12 font-medium' : 'border-[#1C1F21]/15 hover:border-[#B79A62]/70'}`}>
                                <Icon className="h-5 w-5 shrink-0 text-[#7D612D]" strokeWidth={1.7} aria-hidden="true" />
                                {type}
                                {checked && <Check className="ml-auto h-4 w-4 text-[#7D612D]" strokeWidth={2.4} aria-hidden="true" />}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                      <ErrorText id="type-err" message={errors.customerType} />
                    </fieldset>
                  </Group>

                  <Group title="Vos coordonnées">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <TextField id="o-name" label="Nom et prénom" autoComplete="name" value={draft.fullName} onChange={(v) => update({ fullName: v })} error={errors.fullName} />
                      <TextField id="o-company" label="Société" optional={!pro} autoComplete="organization" value={draft.company} onChange={(v) => update({ company: v })} error={errors.company} />
                      <TextField id="o-phone" label="Téléphone" type="tel" autoComplete="tel" value={draft.phone} onChange={(v) => update({ phone: v })} error={errors.phone} />
                      <TextField id="o-email" label="E-mail (pour recevoir votre code)" type="email" autoComplete="email" value={draft.email} onChange={(v) => update({ email: v })} error={errors.email} />
                      <TextField id="o-city" label="Ville ou arrondissement" optional autoComplete="address-level2" placeholder="Ex. Marseille 2e" value={draft.city} onChange={(v) => update({ city: v })} />
                    </div>
                  </Group>

                  <Group title="Conditions de l’offre">
                    <ConditionsList />
                    <label className="mt-5 flex cursor-pointer items-start gap-3 text-[14.5px] leading-[1.55] text-[#1C1F21]/80">
                      <input type="checkbox" checked={draft.acceptConditions} onChange={(e) => update({ acceptConditions: e.target.checked })} aria-invalid={Boolean(errors.acceptConditions)} aria-describedby={errors.acceptConditions ? 'cond-err' : undefined} className="mt-1 h-5 w-5 shrink-0 accent-[#7D612D]" />
                      <span>J’ai lu et j’accepte les conditions de l’offre.</span>
                    </label>
                    <ErrorText id="cond-err" message={errors.acceptConditions} />
                    <label className="mt-3 flex cursor-pointer items-start gap-3 text-[14.5px] leading-[1.55] text-[#1C1F21]/80">
                      <input type="checkbox" checked={draft.consent} onChange={(e) => update({ consent: e.target.checked })} aria-invalid={Boolean(errors.consent)} aria-describedby={errors.consent ? 'consent-err' : undefined} className="mt-1 h-5 w-5 shrink-0 accent-[#7D612D]" />
                      <span>
                        J’accepte que Serrurerie de la République utilise ces informations pour gérer mon code et me recontacter.{' '}
                        <a href={hrefForPage('confidentialite', routerMode)} className="text-[#7D612D] underline">En savoir plus</a>
                      </span>
                    </label>
                    <ErrorText id="consent-err" message={errors.consent} />
                  </Group>

                  <div className="flex flex-col gap-4 border-t border-[#1C1F21]/10 pt-6">
                    <HoneypotField value={honeypot} onChange={setHoneypot} />
                    {failure && <DeliveryErrorNotice reason={failure} />}
                    <button type="submit" disabled={sending} aria-busy={sending} className="inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-full bg-[#1C1F21] px-7 text-[16px] font-semibold text-[#F3F0E7] hover:bg-[#292D2F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79A62] disabled:cursor-wait disabled:opacity-70 sm:w-auto sm:self-start cursor-pointer [&_svg]:text-[#B79A62]">
                      <Send className="h-4 w-4" aria-hidden="true" />
                      {sending ? 'Inscription en cours…' : `Recevoir mon code -${OFFER_RATE} %`}
                    </button>
                  </div>
                </form>
              )}
        </div>
      </section>

      {/* Bas de page réduit */}
      <footer className="mx-auto mt-auto w-full max-w-[1080px] px-5 pb-8 pt-12 text-[14px] leading-[1.6] text-[#1C1F21]/65 sm:px-8 lg:px-10">
        <p className="font-semibold text-[#1C1F21]">{brand.name}</p>
        <p>
          48 rue de la République, 13002 Marseille ·{' '}
          <a href={brand.phoneHref} className="whitespace-nowrap font-semibold text-[#7D612D] hover:text-[#1C1F21]">{brand.phoneDisplay}</a>
        </p>
        <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          <a href={hrefForHome(routerMode)} className="underline hover:text-[#1C1F21]">Découvrir le site</a>
          <a href={hrefForPage('mentions-legales', routerMode)} className="underline hover:text-[#1C1F21]">Mentions légales</a>
          <a href={hrefForPage('confidentialite', routerMode)} className="underline hover:text-[#1C1F21]">Confidentialité</a>
          <a href={hrefForPage('cgv', routerMode)} className="underline hover:text-[#1C1F21]">CGV</a>
        </p>
      </footer>
    </div>
  );
}
