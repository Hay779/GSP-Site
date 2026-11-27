import { useRef, useState } from 'react';
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
    <div className="flex flex-1 flex-col bg-[#FFFBF2] text-[#1C1F21]">
      {/* Fine barre : logo + appel (le logo est clair, il lui faut un fond foncé) */}
      <div className="bg-[#1C1F21]">
        <div className="mx-auto flex max-w-[1080px] items-center justify-between gap-4 px-5 py-1.5 sm:px-8 lg:px-10">
          <a href={hrefForHome(routerMode)} aria-label={`${brand.name} — site`} className="inline-flex items-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B79A62]">
            <BrandMark brand={brand} compact />
          </a>
          <a href={brand.phoneHref} className="inline-flex h-11 items-center gap-2 rounded-full bg-[#B79A62] px-4 text-[15px] font-semibold tabular-nums text-[#1C1F21] hover:bg-[#C9AB70]">
            <Phone className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{brand.phoneDisplay}</span>
            <span className="sm:hidden">Appeler</span>
          </a>
        </div>
      </div>

      {/* Haut de page clair et coloré : uniquement l'offre */}
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#FFF3D6_0%,#FDE4B8_45%,#F9D3A0_100%)]">
        <div aria-hidden="true" className="pointer-events-none absolute -left-20 -top-24 h-[300px] w-[300px] rounded-full bg-[#FFFFFF]/60 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -right-16 h-[360px] w-[360px] rounded-full bg-[#F2B66B]/45 blur-3xl" />
        <div className="relative mx-auto grid max-w-[1080px] items-center gap-7 px-5 pb-24 pt-8 sm:px-8 sm:pt-12 lg:grid-cols-[auto_1fr] lg:gap-14 lg:px-10 lg:pb-28">
          {/* Étiquette -5 % façon bon de réduction */}
          <div className="mx-auto -rotate-3 rounded-2xl bg-[linear-gradient(135deg,#C9A55C,#E9CB85)] p-2 shadow-[0_16px_40px_rgba(125,97,45,0.30)] lg:mx-0">
            <div className="rounded-xl border-2 border-dashed border-[#1C1F21]/25 px-7 py-4 text-center sm:px-9">
              <p className="font-display text-[76px] font-extrabold leading-none tracking-[-0.03em] text-[#1C1F21] sm:text-[100px]">-{OFFER_RATE}%</p>
              <p className="mt-1 text-[13px] font-bold uppercase tracking-[0.18em] text-[#1C1F21]/80">Offre de bienvenue</p>
            </div>
          </div>
          <div className="text-center lg:text-left">
            <h1 className="font-display text-[28px] font-bold leading-[1.12] sm:text-[38px]">
              Sur votre premier achat ou votre première intervention
            </h1>
            <p className="mt-3 text-[16.5px] leading-[1.55] text-[#1C1F21]/75">
              Inscription en 30 secondes : votre code s’affiche tout de suite, valable {OFFER_MONTHS} mois.
            </p>
            <ol className="mt-6 flex flex-wrap justify-center gap-2.5 lg:justify-start">
              {[
                { text: 'Je m’inscris', color: 'bg-[#D9732A]' },
                { text: 'Je reçois mon code', color: 'bg-[#2A8A5E]' },
                { text: 'Je le donne au devis', color: 'bg-[#2F6FC4]' },
              ].map((step, i) => (
                <li key={step.text} className="flex items-center gap-2 rounded-full bg-[#FFFFFF]/80 py-1.5 pl-1.5 pr-4 text-[14.5px] font-medium shadow-sm">
                  <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[13.5px] font-bold text-[#FFFFFF] ${step.color}`}>{i + 1}</span>
                  {step.text}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Formulaire d'inscription (court) */}
      <section aria-label="Inscription à l’offre" className="relative z-10 mx-auto -mt-14 w-full max-w-[760px] px-5 sm:px-8">
        <div className="rounded-2xl border border-[#E9CB85] bg-[#FFFFFF] p-6 shadow-[0_18px_50px_rgba(125,97,45,0.14)] sm:p-8">
          {registered ? (
            <div className="text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#2A8A5E] text-[#FFFFFF]">
                <Ticket className="h-7 w-7" strokeWidth={2} aria-hidden="true" />
              </span>
              <h2 ref={doneRef} tabIndex={-1} className="mt-4 font-display text-[26px] font-bold leading-tight focus:outline-none">
                {registered.alreadyRegistered ? 'Vous êtes déjà inscrit.' : 'C’est fait, votre réduction est activée !'}
              </h2>
              <div className="mt-5 rounded-xl border-2 border-dashed border-[#C9A55C] bg-[#FFF3D6] p-5 sm:p-6">
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
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <a href={brand.phoneHref} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#1C1F21] px-5 text-[15px] font-semibold text-[#F3F0E7] hover:bg-[#292D2F] [&_svg]:text-[#E9CB85]">
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  {brand.phoneDisplay}
                </a>
                <a href={hrefForPage('devis', routerMode)} className="inline-flex h-11 items-center justify-center rounded-full border border-[#1C1F21]/20 px-5 text-[15px] font-semibold text-[#1C1F21] hover:border-[#B79A62]">
                  Demander un devis
                </a>
              </div>
            </div>
          ) : (
            <form ref={formRef} onSubmit={submit} noValidate className="relative flex flex-col gap-6">
              <h2 className="font-display text-[22px] font-bold">Recevez votre code</h2>
              <fieldset data-invalid={Boolean(errors.customerType)} tabIndex={-1} aria-describedby={errors.customerType ? 'type-err' : undefined} className="focus:outline-none">
                <legend className="text-[15px] font-medium">Vous êtes</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {CUSTOMER_TYPES.map((type) => {
                    const Icon = TYPE_ICONS[type];
                    const checked = draft.customerType === type;
                    return (
                      <label key={type} className="relative cursor-pointer">
                        <input type="radio" name="type" checked={checked} onChange={() => update({ customerType: type })} className="peer sr-only" />
                        <span className={`inline-flex h-11 items-center gap-2 rounded-full border px-4 text-[14.5px] transition-colors duration-150 peer-focus-visible:ring-2 peer-focus-visible:ring-[#B79A62] ${checked ? 'border-[#C9A55C] bg-[#FDE4B8] font-semibold' : 'border-[#1C1F21]/15 bg-[#FFFFFF] hover:border-[#C9A55C]'}`}>
                          {checked ? (
                            <Check className="h-4 w-4 shrink-0 text-[#7D612D]" strokeWidth={2.6} aria-hidden="true" />
                          ) : (
                            <Icon className="h-4 w-4 shrink-0 text-[#7D612D]" strokeWidth={1.8} aria-hidden="true" />
                          )}
                          {type}
                        </span>
                      </label>
                    );
                  })}
                </div>
                <ErrorText id="type-err" message={errors.customerType} />
              </fieldset>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {pro && (
                  <div className="sm:col-span-2">
                    <TextField id="o-company" label="Société" autoComplete="organization" value={draft.company} onChange={(v) => update({ company: v })} error={errors.company} />
                  </div>
                )}
                <TextField id="o-name" label="Nom et prénom" autoComplete="name" value={draft.fullName} onChange={(v) => update({ fullName: v })} error={errors.fullName} />
                <TextField id="o-phone" label="Téléphone" type="tel" autoComplete="tel" value={draft.phone} onChange={(v) => update({ phone: v })} error={errors.phone} />
                <div className="sm:col-span-2">
                  <TextField id="o-email" label="E-mail (pour recevoir votre code)" type="email" autoComplete="email" value={draft.email} onChange={(v) => update({ email: v })} error={errors.email} />
                </div>
              </div>

              <div>
                <label className="flex cursor-pointer items-start gap-3 text-[14.5px] leading-[1.55] text-[#1C1F21]/80">
                  <input
                    type="checkbox"
                    checked={draft.acceptConditions && draft.consent}
                    onChange={(e) => update({ acceptConditions: e.target.checked, consent: e.target.checked })}
                    aria-invalid={Boolean(errors.acceptConditions || errors.consent)}
                    aria-describedby={errors.acceptConditions || errors.consent ? 'cond-err' : undefined}
                    className="mt-1 h-5 w-5 shrink-0 accent-[#7D612D]"
                  />
                  <span>
                    J’accepte les conditions de l’offre et que Serrurerie de la République utilise ces informations pour gérer mon code.{' '}
                    <a href={hrefForPage('confidentialite', routerMode)} className="text-[#7D612D] underline">Confidentialité</a>
                  </span>
                </label>
                <ErrorText id="cond-err" message={errors.acceptConditions ?? errors.consent} />
                <details className="mt-3 rounded-lg bg-[#FFF8EA] px-4 py-3 text-[14.5px]">
                  <summary className="cursor-pointer font-semibold text-[#7D612D]">Voir les conditions de l’offre</summary>
                  <ConditionsList className="mt-3" />
                </details>
              </div>

              <div className="flex flex-col gap-4">
                <HoneypotField value={honeypot} onChange={setHoneypot} />
                {failure && <DeliveryErrorNotice reason={failure} />}
                <button type="submit" disabled={sending} aria-busy={sending} className="inline-flex h-[52px] w-full cursor-pointer items-center justify-center gap-2.5 rounded-full bg-[linear-gradient(135deg,#D9732A,#C2611E)] px-7 text-[17px] font-bold text-[#FFFFFF] shadow-[0_10px_24px_rgba(194,97,30,0.35)] hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7D612D] disabled:cursor-wait disabled:opacity-70">
                  <Send className="h-5 w-5" aria-hidden="true" />
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
