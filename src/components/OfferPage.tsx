import { useRef, useState, type CSSProperties } from 'react';
import { ArrowRight, Building2, Check, Clock3, Home, KeyRound, Lock, Mail, Phone, ShieldCheck, Store } from 'lucide-react';
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
import { sendFormRequest } from '../utils/formDelivery';
import { DeliveryErrorNotice, HoneypotField } from './FormDelivery';
import basiliqueUrl from '../assets/images/logo_basilique_brass.png';
import photoUrl from '../assets/images/pro_syndics.webp';

const TYPE_ICONS: Readonly<Record<CustomerType, typeof Building2>> = {
  'Syndic / copropriété': Building2,
  'Agence immobilière / bailleur': KeyRound,
  'Assureur / expert': ShieldCheck,
  'Commerce / entreprise': Store,
  Particulier: Home,
};

/** Libellés courts des boutons de choix (le libellé complet part dans la demande). */
const TYPE_SHORT: Readonly<Record<CustomerType, string>> = {
  'Syndic / copropriété': 'Syndic',
  'Agence immobilière / bailleur': 'Agence / bailleur',
  'Assureur / expert': 'Assureur',
  'Commerce / entreprise': 'Entreprise',
  Particulier: 'Particulier',
};

const FIELD =
  'mt-1.5 h-12 w-full rounded-xl border bg-[#F7F5F0] px-4 text-[16px] text-[#1C1F21] placeholder:text-[#1C1F21]/35 transition-colors duration-150 focus:border-[#B79A62] focus:bg-[#FFFFFF] focus:outline-none focus:ring-4 focus:ring-[#B79A62]/15';

/** Bon de réduction : encoches rondes sur les deux côtés. */
const TICKET_MASK_IMAGE =
  'radial-gradient(circle at 0 50%, transparent 13px, #000 13.5px), radial-gradient(circle at 100% 50%, transparent 13px, #000 13.5px)';
const TICKET_MASK: CSSProperties = {
  WebkitMaskImage: TICKET_MASK_IMAGE,
  WebkitMaskSize: '51% 100%',
  WebkitMaskPosition: 'left, right',
  WebkitMaskRepeat: 'no-repeat',
  maskImage: TICKET_MASK_IMAGE,
  maskSize: '51% 100%',
  maskPosition: 'left, right',
  maskRepeat: 'no-repeat',
};

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
  type = 'text',
  autoComplete,
  placeholder,
  inputMode,
}: {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly onChange: (v: string) => void;
  readonly error?: string;
  readonly type?: string;
  readonly autoComplete?: string;
  readonly placeholder?: string;
  readonly inputMode?: 'tel' | 'email' | 'text';
}) {
  return (
    <div>
      <label htmlFor={id} className="text-[14px] font-semibold text-[#1C1F21]/80">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-err` : undefined}
        className={`${FIELD} ${error ? 'border-[#A33B2B]' : 'border-transparent'}`}
      />
      <ErrorText id={`${id}-err`} message={error} />
    </div>
  );
}

function ConditionsList({ className = '' }: { readonly className?: string }) {
  return (
    <ul className={`flex flex-col gap-2.5 text-[14.5px] leading-[1.5] text-[#1C1F21]/75 ${className}`}>
      {OFFER_CONDITIONS.map((item) => (
        <li key={item} className="flex gap-2.5">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#7D612D]" strokeWidth={2.4} aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Le bon -5 % (sur la photo, puis avec le code une fois inscrit). */
function Ticket({ code, validUntil }: { readonly code?: string; readonly validUntil?: string }) {
  return (
    <div style={TICKET_MASK} className="flex items-stretch rounded-2xl bg-[#FFFFFF] shadow-[0_20px_50px_-12px_rgba(28,31,33,0.35)] ring-1 ring-[#1C1F21]/5">
      <div className={`flex flex-col justify-center py-4 pr-4 ${code ? 'pl-6' : 'pl-7 sm:pl-8'}`}>
        <p className={`bg-[linear-gradient(135deg,#7D612D,#B79A62_55%,#D9BE86)] bg-clip-text font-display font-extrabold ${code ? 'text-[40px] sm:text-[54px]' : 'text-[54px]'} leading-none tracking-[-0.04em] text-transparent sm:text-[62px]`}>
          -{OFFER_RATE}%
        </p>
      </div>
      <div className="my-3 border-l-2 border-dashed border-[#1C1F21]/12" aria-hidden="true" />
      <div className="flex min-w-0 flex-col justify-center py-4 pl-4 pr-6 sm:pl-5 sm:pr-8">
        {code ? (
          <>
            <p className="text-[11.5px] font-bold uppercase tracking-[0.16em] text-[#7D612D]">Votre code</p>
            <p className="mt-1 break-all font-display text-[19px] font-bold tabular-nums tracking-[0.02em] sm:text-[24px]">{code}</p>
            <p className="mt-1 text-[13.5px] text-[#1C1F21]/60">Valable jusqu’au {validUntil}</p>
          </>
        ) : (
          <>
            <p className="text-[11.5px] font-bold uppercase tracking-[0.16em] text-[#7D612D]">Offre de bienvenue</p>
            <p className="mt-1 text-[15px] font-semibold leading-snug">1er achat ou 1re intervention</p>
            <p className="mt-1 text-[13.5px] text-[#1C1F21]/60">Valable {OFFER_MONTHS} mois</p>
          </>
        )}
      </div>
    </div>
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
    <div className="relative flex flex-1 flex-col overflow-x-clip bg-[#F7F5F0] text-[#1C1F21]">
      {/* Fond : halo doré + quadrillage léger qui s'efface */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[760px]">
        <div className="absolute left-1/2 top-[-260px] h-[620px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(217,190,134,0.55),rgba(247,245,240,0))]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(28,31,33,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(28,31,33,0.05)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_at_top,#000_20%,transparent_70%)]" />
      </div>

      {/* En-tête minimal */}
      <header className="relative mx-auto flex w-full max-w-[1160px] items-center justify-between gap-4 px-5 pt-5 sm:px-8">
        <a href={hrefForHome(routerMode)} className="inline-flex items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B79A62]">
          <img src={basiliqueUrl} alt="" width={560} height={150} className="h-7 w-auto sm:h-8" />
          <span className="font-display text-[15px] font-bold leading-tight sm:text-[16px]">
            {brand.name}
            <span className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7D612D]">{brand.city}</span>
          </span>
        </a>
        <a href={brand.phoneHref} className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-[#1C1F21]/10 bg-[#FFFFFF]/80 px-4 text-[15px] font-semibold tabular-nums shadow-sm backdrop-blur hover:border-[#B79A62]">
          <Phone className="h-4 w-4 text-[#7D612D]" aria-hidden="true" />
          <span className="hidden sm:inline">{brand.phoneDisplay}</span>
          <span className="sm:hidden">Appeler</span>
        </a>
      </header>

      <div className="relative mx-auto grid w-full max-w-[1160px] gap-10 px-5 pb-16 pt-10 sm:px-8 sm:pt-14 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:pt-16">
        {/* Colonne texte + photo */}
        <div className="flex flex-col">
          <p className="inline-flex w-fit items-center gap-2 rounded-full border border-[#B79A62]/35 bg-[#FFFFFF]/70 py-1 pl-1 pr-3.5 text-[13px] font-semibold text-[#7D612D] backdrop-blur">
            <span className="rounded-full bg-[#1C1F21] px-2.5 py-0.5 text-[12px] font-bold text-[#E9D3A1]">Nouveau</span>
            Réservé aux inscrits
          </p>
          <h1 className="mt-5 font-display text-[40px] font-extrabold leading-[1.02] tracking-[-0.035em] sm:text-[56px] lg:text-[64px]">
            Votre premier chantier{' '}
            <span className="bg-[linear-gradient(135deg,#7D612D,#B79A62_50%,#C9A55C)] bg-clip-text text-transparent">à -{OFFER_RATE} %</span>
          </h1>
          <p className="mt-5 max-w-[30rem] text-[17px] leading-[1.6] text-[#1C1F21]/70">
            Syndics, agences, entreprises ou particuliers : inscrivez-vous, recevez votre code et donnez-le au moment du devis.
          </p>
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[14.5px] font-medium text-[#1C1F21]/75">
            <li className="inline-flex items-center gap-1.5"><Clock3 className="h-4 w-4 text-[#7D612D]" aria-hidden="true" />30 secondes</li>
            <li className="inline-flex items-center gap-1.5"><Mail className="h-4 w-4 text-[#7D612D]" aria-hidden="true" />Code reçu par e-mail</li>
            <li className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-[#7D612D]" aria-hidden="true" />Valable {OFFER_MONTHS} mois</li>
          </ul>

          {/* Photo + bon de réduction (ordinateur et tablette) */}
          <div className="relative mt-10 hidden sm:block lg:mt-12">
            <div className="overflow-hidden rounded-[28px] ring-1 ring-[#1C1F21]/10">
              <img src={photoUrl} alt="Serrurier installant une serrure sur une porte d’immeuble" width={1600} height={1067} className="aspect-[16/10] w-full object-cover" />
            </div>
            <div className="absolute -bottom-7 left-6 rotate-[-2deg] sm:left-8">
              <Ticket />
            </div>
          </div>
        </div>

        {/* Carte formulaire */}
        <section aria-label="Inscription à l’offre" className="lg:pt-2">
          <div className="rounded-[28px] bg-[linear-gradient(160deg,rgba(183,154,98,0.6),rgba(183,154,98,0.08)_40%,rgba(28,31,33,0.08))] p-px shadow-[0_30px_80px_-30px_rgba(28,31,33,0.35)]">
            <div className="rounded-[27px] bg-[#FFFFFF] p-6 sm:p-8">
              {registered ? (
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E7F3EC] px-3 py-1 text-[13px] font-semibold text-[#1F6B45]">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
                    {registered.alreadyRegistered ? 'Déjà inscrit' : 'Inscription confirmée'}
                  </span>
                  <h2 ref={doneRef} tabIndex={-1} className="mt-4 font-display text-[28px] font-extrabold leading-tight tracking-[-0.02em] focus:outline-none">
                    {registered.alreadyRegistered ? 'Voici votre code.' : 'Votre réduction est activée.'}
                  </h2>
                  <div className="mt-6">
                    <Ticket code={registered.code} validUntil={registered.validUntil} />
                  </div>
                  <p className="mt-6 text-[15.5px] leading-[1.6] text-[#1C1F21]/70">
                    {registered.alreadyRegistered
                      ? 'Il vous a déjà été envoyé par e-mail.'
                      : `Nous vous l’envoyons aussi par e-mail à ${draft.email.trim()}.`}{' '}
                    Donnez ce code au moment du devis, en boutique ou par téléphone.
                  </p>
                  <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    <a href={brand.phoneHref} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#1C1F21] px-6 text-[15px] font-semibold text-[#FFFFFF] hover:bg-[#2B2F31]">
                      <Phone className="h-4 w-4 text-[#E9D3A1]" aria-hidden="true" />
                      {brand.phoneDisplay}
                    </a>
                    <a href={hrefForPage('devis', routerMode)} className="inline-flex h-12 items-center justify-center rounded-full border border-[#1C1F21]/15 px-6 text-[15px] font-semibold hover:border-[#B79A62]">
                      Demander un devis
                    </a>
                  </div>
                </div>
              ) : (
                <form ref={formRef} onSubmit={submit} noValidate className="relative flex flex-col gap-5">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-display text-[22px] font-extrabold tracking-[-0.02em]">Recevoir mon code</h2>
                    <span className="rounded-full bg-[#F7F5F0] px-3 py-1 text-[12.5px] font-semibold text-[#1C1F21]/60">Gratuit</span>
                  </div>

                  <fieldset data-invalid={Boolean(errors.customerType)} tabIndex={-1} aria-describedby={errors.customerType ? 'type-err' : undefined} className="focus:outline-none">
                    <legend className="text-[14px] font-semibold text-[#1C1F21]/80">Vous êtes</legend>
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-6">
                      {CUSTOMER_TYPES.map((type, index) => {
                        const Icon = TYPE_ICONS[type];
                        const checked = draft.customerType === type;
                        return (
                          <label key={type} className={`relative cursor-pointer ${index < 3 ? 'sm:col-span-2' : 'sm:col-span-3'} ${index === 4 ? 'col-span-2' : ''}`} title={type}>
                            <input type="radio" name="type" aria-label={type} checked={checked} onChange={() => update({ customerType: type })} className="peer sr-only" />
                            <span className={`flex h-[68px] flex-col items-start justify-between rounded-xl border px-3 py-2.5 text-[13.5px] font-semibold leading-tight transition-colors duration-150 peer-focus-visible:ring-4 peer-focus-visible:ring-[#B79A62]/25 ${checked ? 'border-[#1C1F21] bg-[#1C1F21] text-[#FFFFFF]' : 'border-[#1C1F21]/10 bg-[#F7F5F0] hover:border-[#B79A62]'}`}>
                              <Icon className={`h-4 w-4 ${checked ? 'text-[#E9D3A1]' : 'text-[#7D612D]'}`} strokeWidth={2} aria-hidden="true" />
                              {TYPE_SHORT[type]}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    <ErrorText id="type-err" message={errors.customerType} />
                  </fieldset>

                  {pro && (
                    <TextField id="o-company" label="Société" autoComplete="organization" placeholder="Nom de la société" value={draft.company} onChange={(v) => update({ company: v })} error={errors.company} />
                  )}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <TextField id="o-name" label="Nom et prénom" autoComplete="name" value={draft.fullName} onChange={(v) => update({ fullName: v })} error={errors.fullName} />
                    <TextField id="o-phone" label="Téléphone" type="tel" inputMode="tel" autoComplete="tel" placeholder="06 12 34 56 78" value={draft.phone} onChange={(v) => update({ phone: v })} error={errors.phone} />
                  </div>
                  <TextField id="o-email" label="E-mail (votre code y est envoyé)" type="email" inputMode="email" autoComplete="email" placeholder="vous@exemple.fr" value={draft.email} onChange={(v) => update({ email: v })} error={errors.email} />

                  <div>
                    <label className="flex cursor-pointer items-start gap-3 text-[14px] leading-[1.55] text-[#1C1F21]/70">
                      <input
                        type="checkbox"
                        checked={draft.acceptConditions && draft.consent}
                        onChange={(e) => update({ acceptConditions: e.target.checked, consent: e.target.checked })}
                        aria-invalid={Boolean(errors.acceptConditions || errors.consent)}
                        aria-describedby={errors.acceptConditions || errors.consent ? 'cond-err' : undefined}
                        className="mt-0.5 h-5 w-5 shrink-0 accent-[#1C1F21]"
                      />
                      <span>
                        J’accepte les conditions de l’offre et que {brand.name} utilise ces informations pour gérer mon code (
                        <a href={hrefForPage('confidentialite', routerMode)} className="font-medium text-[#7D612D] underline underline-offset-2">confidentialité</a>).
                      </span>
                    </label>
                    <ErrorText id="cond-err" message={errors.acceptConditions ?? errors.consent} />
                    <details className="group mt-3 rounded-xl border border-[#1C1F21]/10 px-4 py-3">
                      <summary className="flex cursor-pointer list-none items-center justify-between text-[14px] font-semibold text-[#1C1F21]/75 [&::-webkit-details-marker]:hidden">
                        Conditions de l’offre
                        <span className="text-[18px] leading-none text-[#7D612D] transition-transform duration-200 group-open:rotate-45" aria-hidden="true">+</span>
                      </summary>
                      <ConditionsList className="mt-3" />
                    </details>
                  </div>

                  <HoneypotField value={honeypot} onChange={setHoneypot} />
                  {failure && <DeliveryErrorNotice reason={failure} />}
                  <button type="submit" disabled={sending} aria-busy={sending} className="group inline-flex h-14 w-full cursor-pointer items-center justify-between rounded-full bg-[#1C1F21] pl-6 pr-2 text-[16px] font-semibold text-[#FFFFFF] shadow-[0_12px_30px_-10px_rgba(28,31,33,0.6)] transition-colors hover:bg-[#2B2F31] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79A62] disabled:cursor-wait disabled:opacity-70">
                    {sending ? 'Inscription en cours…' : `Recevoir mon code -${OFFER_RATE} %`}
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-[linear-gradient(135deg,#B79A62,#E9D3A1)] text-[#1C1F21] transition-transform duration-200 group-hover:translate-x-0.5">
                      <ArrowRight className="h-5 w-5" aria-hidden="true" />
                    </span>
                  </button>
                  <p className="-mt-1 flex items-center justify-center gap-1.5 text-[13px] text-[#1C1F21]/50">
                    <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                    Vos informations restent chez nous.
                  </p>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* Mobile : bon de réduction sous le formulaire */}
        {!registered && (
          <div className="flex justify-center pb-2 sm:hidden">
            <div className="rotate-[-2deg]">
              <Ticket />
            </div>
          </div>
        )}
      </div>

      {/* Bas de page réduit */}
      <footer className="relative mx-auto mt-auto w-full max-w-[1160px] border-t border-[#1C1F21]/10 px-5 pb-8 pt-8 text-[14px] leading-[1.6] text-[#1C1F21]/60 sm:px-8">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="font-semibold text-[#1C1F21]">{brand.name}</p>
            <p>
              48 rue de la République, 13002 Marseille ·{' '}
              <a href={brand.phoneHref} className="whitespace-nowrap font-semibold text-[#7D612D] hover:text-[#1C1F21]">{brand.phoneDisplay}</a>
            </p>
          </div>
          <p className="flex flex-wrap gap-x-4 gap-y-1">
            <a href={hrefForHome(routerMode)} className="hover:text-[#1C1F21]">Découvrir le site</a>
            <a href={hrefForPage('mentions-legales', routerMode)} className="hover:text-[#1C1F21]">Mentions légales</a>
            <a href={hrefForPage('confidentialite', routerMode)} className="hover:text-[#1C1F21]">Confidentialité</a>
            <a href={hrefForPage('cgv', routerMode)} className="hover:text-[#1C1F21]">CGV</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
