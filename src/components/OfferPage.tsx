import { useRef, useState } from 'react';
import { ArrowRight, Building2, Check, ChevronDown, KeyRound, Mail, MousePointerClick, Phone, ShieldCheck, Sparkles, Store, Ticket, UserRound } from 'lucide-react';
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
 * fond blanc, grand dégradé lumineux violet → rose → orange, carte en verre dépoli.
 */
const INK = '#16132B';
const GRADIENT = 'linear-gradient(100deg,#6D4BFF 0%,#C14BFF 35%,#FF4F9A 65%,#FF8A3D 100%)';

const TYPES: Readonly<Record<CustomerType, { short: string; icon: typeof Building2 }>> = {
  'Syndic / copropriété': { short: 'Syndic', icon: Building2 },
  'Agence immobilière / bailleur': { short: 'Agence / bailleur', icon: KeyRound },
  'Assureur / expert': { short: 'Assureur', icon: ShieldCheck },
  'Commerce / entreprise': { short: 'Entreprise', icon: Store },
  Particulier: { short: 'Particulier', icon: UserRound },
};

const FIELD =
  'mt-1.5 h-12 w-full rounded-2xl border bg-[#FFFFFF]/80 px-4 text-[16px] text-[#16132B] placeholder:text-[#16132B]/30 transition-all duration-200 focus:border-[#A35BFF] focus:bg-[#FFFFFF] focus:outline-none focus:ring-4 focus:ring-[#A35BFF]/15';

const PAGE_CSS = `
@keyframes offre-flotte-a { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(60px,40px) scale(1.12); } }
@keyframes offre-flotte-b { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-70px,30px) scale(0.9); } }
@keyframes offre-flotte-c { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(30px,-50px) scale(1.08); } }
@keyframes offre-brille { from { background-position: 0% 50%; } to { background-position: 200% 50%; } }
.offre-a { animation: offre-flotte-a 18s ease-in-out infinite; }
.offre-b { animation: offre-flotte-b 22s ease-in-out infinite; }
.offre-c { animation: offre-flotte-c 20s ease-in-out infinite; }
.offre-brille { background-size: 200% 100%; animation: offre-brille 6s linear infinite; }
@media (prefers-reduced-motion: reduce) { .offre-a, .offre-b, .offre-c, .offre-brille { animation: none; } }
`;

function GradientText({ children, className = '' }: { readonly children: React.ReactNode; readonly className?: string }) {
  return (
    <span className={`bg-clip-text text-transparent ${className}`} style={{ backgroundImage: GRADIENT }}>
      {children}
    </span>
  );
}

function ErrorText({ id, message }: { readonly id: string; readonly message?: string }) {
  return message ? (
    <p id={id} role="alert" className="mt-1.5 text-[13.5px] font-medium text-[#D02D5B]">
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
      <label htmlFor={id} className="text-[13.5px] font-semibold text-[#16132B]/70">
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
        className={`${FIELD} ${error ? 'border-[#D02D5B]' : 'border-[#16132B]/10'}`}
      />
      <ErrorText id={`${id}-err`} message={error} />
    </div>
  );
}

/** Bon -5 % en verre, avec le code une fois inscrit. */
function CodeCard({ code, validUntil }: { readonly code: string; readonly validUntil: string }) {
  return (
    <div className="rounded-[26px] p-[1.5px] shadow-[0_24px_60px_-20px_rgba(193,75,255,0.55)]" style={{ backgroundImage: GRADIENT }}>
      <div className="relative overflow-hidden rounded-[25px] bg-[#FFFFFF] px-6 py-6 text-center">
        <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-[#FF4F9A]/15 blur-2xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-[#6D4BFF]/15 blur-2xl" />
        <p className="relative text-[12px] font-semibold uppercase tracking-[0.2em] text-[#16132B]/50">Votre code -{OFFER_RATE} %</p>
        <p className="relative mt-2 break-all font-display text-[23px] font-bold tabular-nums tracking-[0.01em] sm:text-[32px]">
          <GradientText>{code}</GradientText>
        </p>
        <p className="relative mt-2 text-[14.5px] text-[#16132B]/60">
          Valable jusqu’au <strong className="font-semibold text-[#16132B]">{validUntil}</strong>
        </p>
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
    <div className="relative flex flex-1 flex-col overflow-x-clip bg-[#FFFFFF]" style={{ color: INK }}>
      <style>{PAGE_CSS}</style>

      {/* Dégradé lumineux en fond (taches floues qui bougent lentement) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[900px] overflow-hidden">
        <div className="offre-a absolute -left-[10%] top-[-180px] h-[520px] w-[520px] rounded-full bg-[#7B5CFF] opacity-45 blur-[110px] sm:h-[680px] sm:w-[680px]" />
        <div className="offre-b absolute right-[-12%] top-[-120px] h-[480px] w-[480px] rounded-full bg-[#FF5CA8] opacity-40 blur-[110px] sm:h-[640px] sm:w-[640px]" />
        <div className="offre-c absolute left-[30%] top-[220px] h-[420px] w-[420px] rounded-full bg-[#FF9A3D] opacity-35 blur-[120px] sm:h-[560px] sm:w-[560px]" />
        <div className="absolute inset-x-0 bottom-0 h-[320px] bg-[linear-gradient(to_bottom,rgba(255,255,255,0),#FFFFFF)]" />
        {/* grain très léger */}
        <div className="absolute inset-0 opacity-[0.25] mix-blend-soft-light [background-image:radial-gradient(rgba(255,255,255,0.9)_1px,transparent_1px)] [background-size:3px_3px]" />
      </div>

      {/* En-tête */}
      <header className="relative mx-auto flex w-full max-w-[1120px] items-center justify-between gap-4 px-5 py-5 sm:px-8">
        <a href={hrefForHome(routerMode)} className="inline-flex items-center gap-2.5 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A35BFF]">
          <img src={basiliqueUrl} alt="" width={560} height={150} className="h-6 w-auto sm:h-7" />
          <span className="font-display text-[14.5px] font-semibold leading-tight sm:text-[15.5px]">{brand.name}</span>
        </a>
        <a href={brand.phoneHref} className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-[#FFFFFF]/70 bg-[#FFFFFF]/60 px-4 text-[15px] font-semibold tabular-nums shadow-[0_4px_20px_-6px_rgba(22,19,43,0.18)] backdrop-blur-xl transition hover:bg-[#FFFFFF]/90">
          <Phone className="h-4 w-4 text-[#A35BFF]" aria-hidden="true" />
          <span className="hidden sm:inline">{brand.phoneDisplay}</span>
          <span className="sm:hidden">Appeler</span>
        </a>
      </header>

      {/* Accroche centrée */}
      <section className="relative mx-auto w-full max-w-[880px] px-5 pt-8 text-center sm:px-8 sm:pt-14">
        <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#FFFFFF]/80 bg-[#FFFFFF]/55 py-1.5 pl-1.5 pr-4 text-[13.5px] font-medium text-[#16132B]/80 shadow-[0_4px_20px_-8px_rgba(22,19,43,0.2)] backdrop-blur-xl">
          <span className="offre-brille rounded-full px-2.5 py-0.5 text-[12px] font-semibold text-[#FFFFFF]" style={{ backgroundImage: GRADIENT }}>
            Offre de bienvenue
          </span>
          Réservée aux inscrits
        </p>
        <h1 className="mt-6 font-display text-[34px] font-semibold leading-[1.08] tracking-[-0.035em] sm:text-[52px]">
          Votre premier chantier
          <span className="mt-1 block text-[104px] font-bold leading-[0.95] tracking-[-0.06em] sm:text-[168px]">
            <GradientText>-{OFFER_RATE} %</GradientText>
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-[34rem] text-[17px] leading-[1.6] text-[#16132B]/65 sm:text-[18.5px]">
          Sur votre premier achat ou votre première intervention. Inscrivez-vous en 30 secondes, recevez votre code tout de suite.
        </p>
      </section>

      {/* Carte formulaire en verre */}
      <section aria-label="Inscription à l’offre" className="relative mx-auto mt-10 w-full max-w-[620px] px-4 sm:mt-12 sm:px-8">
        <div className="rounded-[34px] border border-[#FFFFFF]/80 bg-[#FFFFFF]/65 p-2 shadow-[0_40px_100px_-30px_rgba(109,75,255,0.45),0_10px_30px_-10px_rgba(22,19,43,0.12)] backdrop-blur-2xl">
          <div className="rounded-[28px] border border-[#16132B]/[0.06] bg-[#FFFFFF]/85 p-6 sm:p-8">
            {registered ? (
              <div className="text-center">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full text-[#FFFFFF] shadow-[0_12px_30px_-8px_rgba(193,75,255,0.6)]" style={{ backgroundImage: GRADIENT }}>
                  <Sparkles className="h-6 w-6" aria-hidden="true" />
                </span>
                <h2 ref={doneRef} tabIndex={-1} className="mt-5 font-display text-[28px] font-semibold leading-tight tracking-[-0.03em] focus:outline-none sm:text-[32px]">
                  {registered.alreadyRegistered ? 'Voici votre code.' : 'C’est fait, votre réduction est activée.'}
                </h2>
                <div className="mt-6">
                  <CodeCard code={registered.code} validUntil={registered.validUntil} />
                </div>
                <p className="mx-auto mt-6 max-w-[28rem] text-[15.5px] leading-[1.6] text-[#16132B]/65">
                  {registered.alreadyRegistered
                    ? 'Il vous a déjà été envoyé par e-mail.'
                    : `Nous vous l’envoyons aussi par e-mail à ${draft.email.trim()}.`}{' '}
                  Donnez ce code au moment du devis, en boutique ou par téléphone.
                </p>
                <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                  <a href={brand.phoneHref} className="inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-semibold text-[#FFFFFF] shadow-[0_12px_30px_-10px_rgba(193,75,255,0.7)] transition hover:brightness-110" style={{ backgroundImage: GRADIENT }}>
                    <Phone className="h-4 w-4" aria-hidden="true" />
                    {brand.phoneDisplay}
                  </a>
                  <a href={hrefForPage('devis', routerMode)} className="inline-flex h-12 items-center justify-center rounded-full border border-[#16132B]/12 bg-[#FFFFFF] px-6 text-[15px] font-semibold transition hover:border-[#A35BFF]/50">
                    Demander un devis
                  </a>
                </div>
              </div>
            ) : (
              <form ref={formRef} onSubmit={submit} noValidate className="relative flex flex-col gap-5">
                <fieldset data-invalid={Boolean(errors.customerType)} tabIndex={-1} aria-describedby={errors.customerType ? 'type-err' : undefined} className="focus:outline-none">
                  <legend className="text-[13.5px] font-semibold text-[#16132B]/70">Vous êtes</legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {CUSTOMER_TYPES.map((type) => {
                      const t = TYPES[type];
                      const checked = draft.customerType === type;
                      return (
                        <label key={type} title={type} className="relative cursor-pointer">
                          <input type="radio" name="type" aria-label={type} checked={checked} onChange={() => update({ customerType: type })} className="peer sr-only" />
                          <span
                            className={`inline-flex h-11 items-center gap-2 rounded-full px-4 text-[14.5px] font-medium transition-all duration-200 peer-focus-visible:ring-4 peer-focus-visible:ring-[#A35BFF]/25 ${checked ? 'text-[#FFFFFF] shadow-[0_10px_24px_-10px_rgba(193,75,255,0.8)]' : 'border border-[#16132B]/10 bg-[#FFFFFF] hover:border-[#A35BFF]/40 hover:bg-[#FBF8FF]'}`}
                            style={checked ? { backgroundImage: GRADIENT } : undefined}
                          >
                            {checked ? <Check className="h-4 w-4" strokeWidth={2.6} aria-hidden="true" /> : <t.icon className="h-4 w-4 text-[#A35BFF]" strokeWidth={1.9} aria-hidden="true" />}
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
                <TextField id="o-email" label="E-mail (votre code y est envoyé)" type="email" inputMode="email" autoComplete="email" placeholder="vous@exemple.fr" value={draft.email} onChange={(v) => update({ email: v })} error={errors.email} />

                <div>
                  <label className="flex cursor-pointer items-start gap-3 text-[14px] leading-[1.55] text-[#16132B]/65">
                    <input
                      type="checkbox"
                      checked={draft.acceptConditions && draft.consent}
                      onChange={(e) => update({ acceptConditions: e.target.checked, consent: e.target.checked })}
                      aria-invalid={Boolean(errors.acceptConditions || errors.consent)}
                      aria-describedby={errors.acceptConditions || errors.consent ? 'cond-err' : undefined}
                      className="mt-0.5 h-5 w-5 shrink-0 accent-[#A35BFF]"
                    />
                    <span>
                      J’accepte les conditions de l’offre et que {brand.name} utilise ces informations pour gérer mon code (
                      <a href={hrefForPage('confidentialite', routerMode)} className="font-medium text-[#8A3DFF] underline underline-offset-2">confidentialité</a>).
                    </span>
                  </label>
                  <ErrorText id="cond-err" message={errors.acceptConditions ?? errors.consent} />
                  <details className="group mt-3 rounded-2xl bg-[#F6F3FF] px-4 py-3">
                    <summary className="flex cursor-pointer list-none items-center justify-between text-[14px] font-semibold text-[#16132B]/75 [&::-webkit-details-marker]:hidden">
                      Conditions de l’offre
                      <ChevronDown className="h-4 w-4 text-[#8A3DFF] transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
                    </summary>
                    <ul className="mt-3 flex flex-col gap-2 text-[14px] leading-[1.5] text-[#16132B]/70">
                      {OFFER_CONDITIONS.map((item) => (
                        <li key={item} className="flex gap-2.5">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#A35BFF]" strokeWidth={2.4} aria-hidden="true" />
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
                  className="offre-brille group relative inline-flex h-14 w-full cursor-pointer items-center justify-center gap-2.5 overflow-hidden rounded-full text-[16.5px] font-semibold text-[#FFFFFF] shadow-[0_16px_40px_-12px_rgba(193,75,255,0.75)] transition hover:-translate-y-px hover:shadow-[0_20px_44px_-12px_rgba(193,75,255,0.9)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#A35BFF] disabled:cursor-wait disabled:opacity-70"
                  style={{ backgroundImage: 'linear-gradient(100deg,#6D4BFF 0%,#C14BFF 25%,#FF4F9A 50%,#FF8A3D 75%,#6D4BFF 100%)' }}
                >
                  {sending ? 'Inscription en cours…' : `Recevoir mon code -${OFFER_RATE} %`}
                  <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
                </button>
                <p className="-mt-1 text-center text-[13px] text-[#16132B]/45">Gratuit, sans engagement · vos informations restent chez nous</p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 3 étapes */}
      <section aria-label="Comment ça marche" className="relative mx-auto mt-14 w-full max-w-[1000px] px-5 pb-16 sm:mt-20 sm:px-8">
        <ol className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: MousePointerClick, title: 'Je m’inscris', text: '30 secondes, ici même.' },
            { icon: Mail, title: 'Je reçois mon code', text: 'À l’écran et par e-mail.' },
            { icon: Ticket, title: 'Je l’utilise', text: `Au moment du devis, pendant ${OFFER_MONTHS} mois.` },
          ].map((step, i) => (
            <li key={step.title} className="relative rounded-[24px] border border-[#16132B]/[0.07] bg-[#FFFFFF]/70 p-5 shadow-[0_10px_30px_-18px_rgba(22,19,43,0.25)] backdrop-blur">
              <div className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-2xl text-[#FFFFFF] shadow-[0_10px_24px_-10px_rgba(193,75,255,0.7)]" style={{ backgroundImage: GRADIENT }}>
                  <step.icon className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
                </span>
                <span className="font-display text-[34px] font-bold leading-none tracking-[-0.04em] text-[#16132B]/[0.08]">0{i + 1}</span>
              </div>
              <p className="mt-4 font-display text-[17px] font-semibold tracking-[-0.01em]">{step.title}</p>
              <p className="mt-1 text-[14.5px] leading-[1.5] text-[#16132B]/60">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Bas de page réduit */}
      <footer className="relative mt-auto border-t border-[#16132B]/[0.07]">
        <div className="mx-auto flex w-full max-w-[1120px] flex-col justify-between gap-3 px-5 py-7 text-[14px] leading-[1.6] text-[#16132B]/55 sm:flex-row sm:items-end sm:px-8">
          <div>
            <p className="font-semibold text-[#16132B]">{brand.name}</p>
            <p>
              48 rue de la République, 13002 Marseille ·{' '}
              <a href={brand.phoneHref} className="whitespace-nowrap font-semibold text-[#16132B] hover:text-[#8A3DFF]">{brand.phoneDisplay}</a>
            </p>
          </div>
          <p className="flex flex-wrap gap-x-4 gap-y-1">
            <a href={hrefForHome(routerMode)} className="hover:text-[#8A3DFF]">Découvrir le site</a>
            <a href={hrefForPage('mentions-legales', routerMode)} className="hover:text-[#8A3DFF]">Mentions légales</a>
            <a href={hrefForPage('confidentialite', routerMode)} className="hover:text-[#8A3DFF]">Confidentialité</a>
            <a href={hrefForPage('cgv', routerMode)} className="hover:text-[#8A3DFF]">CGV</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
