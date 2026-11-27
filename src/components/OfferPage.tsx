import { useRef, useState, type ReactNode } from 'react';
import { ArrowRight, BadgePercent, Building2, CalendarHeart, Check, KeyRound, Mail, Phone, ShieldCheck, Sparkles, Store, UserRound, Zap } from 'lucide-react';
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

/*
 * Identité propre à la campagne -5 % (volontairement différente du site) :
 * papier crème, encre noire, contours épais, ombres franches, couleurs vives.
 */
const C = {
  ink: '#14110F',
  paper: '#FFF7E8',
  blue: '#2D4BFF',
  yellow: '#FFD23F',
  coral: '#FF6B4A',
  mint: '#4FE0A5',
  lilac: '#C9B6FF',
  sky: '#9FD8FF',
} as const;

const HARD = 'border-2 border-[#14110F] shadow-[4px_4px_0_#14110F]';
const HARD_LG = 'border-2 border-[#14110F] shadow-[7px_7px_0_#14110F]';

const TYPES: Readonly<Record<CustomerType, { short: string; icon: typeof Building2; color: string }>> = {
  'Syndic / copropriété': { short: 'Syndic', icon: Building2, color: C.sky },
  'Agence immobilière / bailleur': { short: 'Agence / bailleur', icon: KeyRound, color: C.yellow },
  'Assureur / expert': { short: 'Assureur', icon: ShieldCheck, color: C.mint },
  'Commerce / entreprise': { short: 'Entreprise', icon: Store, color: C.coral },
  Particulier: { short: 'Particulier', icon: UserRound, color: C.lilac },
};

const FIELD =
  'mt-1.5 h-12 w-full rounded-xl border-2 bg-[#FFFFFF] px-4 text-[16px] text-[#14110F] placeholder:text-[#14110F]/35 transition-shadow duration-150 focus:outline-none focus:shadow-[3px_3px_0_#2D4BFF]';

const PAGE_CSS = `
@keyframes offre-defile { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.offre-defile { animation: offre-defile 28s linear infinite; }
@media (prefers-reduced-motion: reduce) { .offre-defile { animation: none; } }
`;

function ErrorText({ id, message }: { readonly id: string; readonly message?: string }) {
  return message ? (
    <p id={id} role="alert" className="mt-1.5 text-[13.5px] font-semibold text-[#C2261B]">
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
      <label htmlFor={id} className="text-[14px] font-bold">
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
        className={`${FIELD} ${error ? 'border-[#C2261B]' : 'border-[#14110F]'}`}
      />
      <ErrorText id={`${id}-err`} message={error} />
    </div>
  );
}

/** Pastille « autocollant » légèrement tournée. */
function Sticker({ children, color, className = '' }: { readonly children: ReactNode; readonly color: string; readonly className?: string }) {
  return (
    <span style={{ backgroundColor: color }} className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13.5px] font-extrabold ${HARD} ${className}`}>
      {children}
    </span>
  );
}

/** Le bon -5 % (perforé), avec le code une fois inscrit. */
function Coupon({ code, validUntil }: { readonly code?: string; readonly validUntil?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-[22px] ${HARD_LG}`} style={{ backgroundColor: C.coral }}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.12] [background:repeating-linear-gradient(-45deg,#14110F_0_2px,transparent_2px_14px)]" />
      <div className="relative flex items-stretch">
        <div className="flex flex-col justify-center py-5 pl-5 pr-4 sm:pl-7 sm:pr-6">
          <p className={`font-display font-extrabold leading-[0.85] tracking-[-0.05em] text-[#FFFFFF] [-webkit-text-stroke:2px_#14110F] [paint-order:stroke_fill] ${code ? 'text-[48px] sm:text-[64px]' : 'text-[60px] sm:text-[84px]'}`}>
            -{OFFER_RATE}%
          </p>
        </div>
        <div aria-hidden="true" className="relative w-0 border-l-[3px] border-dashed border-[#14110F]/70">
          <span className="absolute -top-3.5 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full border-2 border-[#14110F]" style={{ backgroundColor: C.paper }} />
          <span className="absolute -bottom-3.5 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full border-2 border-[#14110F]" style={{ backgroundColor: C.paper }} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center py-5 pl-4 pr-5 sm:pl-6">
          {code ? (
            <>
              <p className="text-[11.5px] font-extrabold uppercase tracking-[0.16em]">Votre code</p>
              <p className="mt-1 break-all rounded-lg border-2 border-[#14110F] bg-[#FFFFFF] px-2 py-1 font-display text-[16px] font-extrabold tabular-nums sm:text-[20px]">{code}</p>
              <p className="mt-1.5 text-[13.5px] font-bold">Jusqu’au {validUntil}</p>
            </>
          ) : (
            <>
              <p className="text-[11.5px] font-extrabold uppercase tracking-[0.16em]">Bon de bienvenue</p>
              <p className="mt-1 font-display text-[16px] font-extrabold leading-tight sm:text-[19px]">1er achat ou 1re intervention</p>
              <p className="mt-1.5 text-[13.5px] font-bold">Valable {OFFER_MONTHS} mois</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Marquee() {
  const words = [`-${OFFER_RATE} % de bienvenue`, 'Syndics', 'Agences', 'Assureurs', 'Entreprises', 'Particuliers', 'Code immédiat'];
  const row = (n: number) => (
    <span key={n} className="flex shrink-0 items-center">
      {words.map((w) => (
        <span key={w} className="flex items-center gap-5 pr-5">
          <span>{w}</span>
          <Sparkles className="h-4 w-4 text-[#FFD23F]" aria-hidden="true" />
        </span>
      ))}
    </span>
  );
  return (
    <div aria-hidden="true" className="relative overflow-hidden border-y-2 border-[#14110F] py-2.5 font-display text-[15px] font-extrabold uppercase tracking-[0.08em] text-[#FFFFFF]" style={{ backgroundColor: C.blue }}>
      <div className="offre-defile flex w-max">{[0, 1, 2, 3].map(row)}</div>
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
    <div className="relative flex flex-1 flex-col overflow-x-clip" style={{ backgroundColor: C.paper, color: C.ink }}>
      <style>{PAGE_CSS}</style>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 [background-image:radial-gradient(rgba(20,17,15,0.13)_1.2px,transparent_1.2px)] [background-size:22px_22px]" />

      {/* En-tête */}
      <header className="relative mx-auto flex w-full max-w-[1160px] items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <a href={hrefForHome(routerMode)} className="inline-flex items-center gap-2.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2D4BFF]">
          <img src={basiliqueUrl} alt="" width={560} height={150} className="h-6 w-auto sm:h-7" />
          <span className="font-display text-[14.5px] font-extrabold leading-tight sm:text-[16px]">{brand.name}</span>
        </a>
        <a href={brand.phoneHref} className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-[15px] font-extrabold tabular-nums transition-transform hover:-translate-y-0.5 ${HARD}`} style={{ backgroundColor: C.yellow }}>
          <Phone className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
          <span className="hidden sm:inline">{brand.phoneDisplay}</span>
          <span className="sm:hidden">Appeler</span>
        </a>
      </header>

      <Marquee />

      <div className="relative mx-auto grid w-full max-w-[1160px] gap-10 px-5 pb-16 pt-9 sm:px-8 sm:pt-14 lg:grid-cols-[1.05fr_1fr] lg:gap-x-14 lg:gap-y-12">
        {/* Accroche */}
        <div className="lg:col-start-1 lg:row-start-1">
          <Sticker color={C.mint} className="-rotate-2">
            <Zap className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
            Réservé aux inscrits
          </Sticker>
          <h1 className="mt-6 font-display text-[44px] font-extrabold leading-[0.98] tracking-[-0.04em] sm:text-[64px] lg:text-[72px]">
            Votre 1<sup className="text-[0.45em]">er</sup> chantier{' '}
            <span className="relative ml-2 inline-block whitespace-nowrap">
              <span aria-hidden="true" className="absolute inset-x-[-6px] bottom-[4%] top-[20%] -rotate-1 rounded-lg border-2 border-[#14110F]" style={{ backgroundColor: C.yellow }} />
              <span className="relative">à -{OFFER_RATE} %</span>
            </span>
          </h1>
          <p className="mt-5 max-w-[30rem] text-[17.5px] font-medium leading-[1.55] text-[#14110F]/75">
            Syndics, agences, assureurs, entreprises ou particuliers : inscrivez-vous, recevez votre code, et économisez dès votre premier devis signé.
          </p>
        </div>

        {/* Carte formulaire */}
        <section aria-label="Inscription à l’offre" className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <div className={`rounded-[26px] bg-[#FFFFFF] p-6 sm:p-8 ${HARD_LG}`}>
            {registered ? (
              <div>
                <Sticker color={C.mint} className="-rotate-2">
                  <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
                  {registered.alreadyRegistered ? 'Déjà inscrit' : 'Inscription confirmée'}
                </Sticker>
                <h2 ref={doneRef} tabIndex={-1} className="mt-5 font-display text-[30px] font-extrabold leading-[1.05] tracking-[-0.03em] focus:outline-none">
                  {registered.alreadyRegistered ? 'Voici votre code !' : <>Bravo, votre <span className="whitespace-nowrap">-{OFFER_RATE} %</span> est activé !</>}
                </h2>
                <div className="mt-6">
                  <Coupon code={registered.code} validUntil={registered.validUntil} />
                </div>
                <p className="mt-6 text-[15.5px] font-medium leading-[1.6] text-[#14110F]/75">
                  {registered.alreadyRegistered
                    ? 'Il vous a déjà été envoyé par e-mail.'
                    : `Nous vous l’envoyons aussi par e-mail à ${draft.email.trim()}.`}{' '}
                  Donnez ce code au moment du devis, en boutique ou par téléphone.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <a href={brand.phoneHref} className={`inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-extrabold text-[#FFFFFF] transition-transform hover:-translate-y-0.5 ${HARD}`} style={{ backgroundColor: C.blue }}>
                    <Phone className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
                    {brand.phoneDisplay}
                  </a>
                  <a href={hrefForPage('devis', routerMode)} className={`inline-flex h-12 items-center justify-center rounded-full bg-[#FFFFFF] px-6 text-[15px] font-extrabold transition-transform hover:-translate-y-0.5 ${HARD}`}>
                    Demander un devis
                  </a>
                </div>
              </div>
            ) : (
              <form ref={formRef} onSubmit={submit} noValidate className="relative flex flex-col gap-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-display text-[26px] font-extrabold leading-[1.05] tracking-[-0.03em]">
                    Je récupère
                    <br />
                    mon code -{OFFER_RATE} %
                  </h2>
                  <Sticker color={C.yellow} className="rotate-3">Gratuit</Sticker>
                </div>

                <fieldset data-invalid={Boolean(errors.customerType)} tabIndex={-1} aria-describedby={errors.customerType ? 'type-err' : undefined} className="focus:outline-none">
                  <legend className="text-[14px] font-bold">Vous êtes…</legend>
                  <div className="mt-2.5 grid grid-cols-2 gap-2.5 sm:grid-cols-6">
                    {CUSTOMER_TYPES.map((type, index) => {
                      const t = TYPES[type];
                      const checked = draft.customerType === type;
                      return (
                        <label key={type} title={type} className={`relative cursor-pointer ${index < 3 ? 'sm:col-span-2' : 'sm:col-span-3'} ${index === 4 ? 'col-span-2' : ''}`}>
                          <input type="radio" name="type" aria-label={type} checked={checked} onChange={() => update({ customerType: type })} className="peer sr-only" />
                          <span
                            className={`flex h-[60px] items-center gap-2.5 rounded-2xl border-2 border-[#14110F] px-2.5 text-[14px] font-extrabold leading-tight transition-all duration-150 peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#2D4BFF] ${checked ? '-translate-y-0.5 shadow-[4px_4px_0_#14110F]' : 'bg-[#FFFFFF] hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#14110F]'}`}
                            style={checked ? { backgroundColor: t.color } : undefined}
                          >
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border-2 border-[#14110F]" style={{ backgroundColor: checked ? '#FFFFFF' : t.color }}>
                              {checked ? <Check className="h-[18px] w-[18px]" strokeWidth={3} aria-hidden="true" /> : <t.icon className="h-[18px] w-[18px]" strokeWidth={2.4} aria-hidden="true" />}
                            </span>
                            {t.short}
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
                <TextField id="o-email" label="E-mail (on vous y envoie le code)" type="email" inputMode="email" autoComplete="email" placeholder="vous@exemple.fr" value={draft.email} onChange={(v) => update({ email: v })} error={errors.email} />

                <div>
                  <label className="flex cursor-pointer items-start gap-3 text-[14px] font-medium leading-[1.55] text-[#14110F]/80">
                    <input
                      type="checkbox"
                      checked={draft.acceptConditions && draft.consent}
                      onChange={(e) => update({ acceptConditions: e.target.checked, consent: e.target.checked })}
                      aria-invalid={Boolean(errors.acceptConditions || errors.consent)}
                      aria-describedby={errors.acceptConditions || errors.consent ? 'cond-err' : undefined}
                      className="mt-0.5 h-5 w-5 shrink-0 accent-[#2D4BFF]"
                    />
                    <span>
                      J’accepte les conditions de l’offre et que {brand.name} utilise ces informations pour gérer mon code (
                      <a href={hrefForPage('confidentialite', routerMode)} className="font-bold underline underline-offset-2">confidentialité</a>).
                    </span>
                  </label>
                  <ErrorText id="cond-err" message={errors.acceptConditions ?? errors.consent} />
                  <details className="group mt-3 rounded-xl border-2 border-dashed border-[#14110F]/40 px-4 py-3">
                    <summary className="flex cursor-pointer list-none items-center justify-between text-[14px] font-extrabold [&::-webkit-details-marker]:hidden">
                      Conditions de l’offre
                      <span className="grid h-6 w-6 place-items-center rounded-full border-2 border-[#14110F] text-[15px] leading-none transition-transform duration-200 group-open:rotate-45" style={{ backgroundColor: C.yellow }} aria-hidden="true">+</span>
                    </summary>
                    <ul className="mt-3 flex flex-col gap-2 text-[14px] font-medium leading-[1.5] text-[#14110F]/75">
                      {OFFER_CONDITIONS.map((item) => (
                        <li key={item} className="flex gap-2.5">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#2D4BFF]" strokeWidth={3} aria-hidden="true" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </details>
                </div>

                <HoneypotField value={honeypot} onChange={setHoneypot} />
                {failure && <DeliveryErrorNotice reason={failure} />}
                <button
                  type="submit"
                  disabled={sending}
                  aria-busy={sending}
                  className="group inline-flex h-[58px] w-full cursor-pointer items-center justify-between rounded-full border-2 border-[#14110F] pl-6 pr-2 text-[17px] font-extrabold text-[#FFFFFF] shadow-[5px_5px_0_#14110F] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[7px_7px_0_#14110F] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[2px_2px_0_#14110F] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#2D4BFF] disabled:cursor-wait disabled:opacity-70"
                  style={{ backgroundColor: C.blue }}
                >
                  {sending ? 'Inscription en cours…' : `Je récupère mon -${OFFER_RATE} %`}
                  <span className="grid h-11 w-11 place-items-center rounded-full border-2 border-[#14110F] text-[#14110F] transition-transform duration-200 group-hover:rotate-[-20deg]" style={{ backgroundColor: C.yellow }}>
                    <ArrowRight className="h-5 w-5" strokeWidth={2.75} aria-hidden="true" />
                  </span>
                </button>
                <p className="-mt-1 text-center text-[13px] font-medium text-[#14110F]/55">Sans engagement · vos informations restent chez nous</p>
              </form>
            )}
          </div>
        </section>

        {/* Bon de réduction + étapes */}
        <div className="lg:col-start-1 lg:row-start-2">
          {!registered && (
            <div className="relative mx-auto max-w-[470px] pt-2 lg:mx-0">
              <div className="rotate-[-2.5deg]">
                <Coupon />
              </div>
              <Sticker color={C.lilac} className="absolute -right-1 -top-4 rotate-6 sm:-right-5">
                <CalendarHeart className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
                {OFFER_MONTHS} mois
              </Sticker>
            </div>
          )}
          <ol className="mt-12 grid gap-3 sm:grid-cols-3">
            {[
              { icon: BadgePercent, color: C.yellow, title: 'Je m’inscris', text: '30 secondes' },
              { icon: Mail, color: C.sky, title: 'Je reçois mon code', text: 'Écran + e-mail' },
              { icon: Check, color: C.mint, title: 'Je l’utilise', text: 'Au moment du devis' },
            ].map((step, i) => (
              <li key={step.title} className={`flex items-center gap-3 rounded-2xl bg-[#FFFFFF] p-3.5 sm:flex-col sm:items-start ${HARD}`}>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border-2 border-[#14110F]" style={{ backgroundColor: step.color }}>
                  <step.icon className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-[11.5px] font-extrabold uppercase tracking-[0.12em] text-[#14110F]/50">Étape {i + 1}</span>
                  <span className="block font-display text-[16px] font-extrabold leading-tight">{step.title}</span>
                  <span className="block text-[13.5px] font-medium text-[#14110F]/65">{step.text}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Bas de page réduit */}
      <footer className="relative mt-auto border-t-2 border-[#14110F] bg-[#FFFFFF]">
        <div className="mx-auto flex w-full max-w-[1160px] flex-col justify-between gap-3 px-5 py-7 text-[14px] leading-[1.6] text-[#14110F]/70 sm:flex-row sm:items-end sm:px-8">
          <div>
            <p className="font-extrabold text-[#14110F]">{brand.name}</p>
            <p>
              48 rue de la République, 13002 Marseille ·{' '}
              <a href={brand.phoneHref} className="whitespace-nowrap font-extrabold text-[#14110F] underline underline-offset-2">{brand.phoneDisplay}</a>
            </p>
          </div>
          <p className="flex flex-wrap gap-x-4 gap-y-1 font-medium">
            <a href={hrefForHome(routerMode)} className="hover:text-[#2D4BFF]">Découvrir le site</a>
            <a href={hrefForPage('mentions-legales', routerMode)} className="hover:text-[#2D4BFF]">Mentions légales</a>
            <a href={hrefForPage('confidentialite', routerMode)} className="hover:text-[#2D4BFF]">Confidentialité</a>
            <a href={hrefForPage('cgv', routerMode)} className="hover:text-[#2D4BFF]">CGV</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
