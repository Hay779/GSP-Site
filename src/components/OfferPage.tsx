import { useRef, useState } from 'react';
import {
  ArrowRight,
  Building2,
  Check,
  ChevronDown,
  Clock3,
  KeyRound,
  Mail,
  MapPin,
  MessageCircle,
  MousePointerClick,
  Phone,
  ShieldCheck,
  Star,
  Store,
  Ticket,
  UserRound,
} from 'lucide-react';
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
import { REAL_REVIEWS, REVIEWS_SOURCE } from '../data/reviewsContent';
import { WHATSAPP_CONFIG } from '../data/sectionsContent';
import { buildWhatsAppUrl } from '../utils/whatsapp';
import logoUrl from '../assets/images/logo_republique_light.png';

/*
 * Identité propre à la campagne -5 % : couleurs de la mer à Marseille
 * (bleu profond, bleu mer, turquoise, vert d'eau), fond clair.
 */
const INK = '#0B2A3C';
const SEA = 'linear-gradient(120deg,#0E6BA8 0%,#1391B8 50%,#17B3A3 100%)';

const TYPES: Readonly<Record<CustomerType, { short: string; icon: typeof Building2 }>> = {
  'Syndic / copropriété': { short: 'Syndic', icon: Building2 },
  'Agence immobilière / bailleur': { short: 'Agence / bailleur', icon: KeyRound },
  'Assureur / expert': { short: 'Assureur', icon: ShieldCheck },
  'Commerce / entreprise': { short: 'Entreprise', icon: Store },
  Particulier: { short: 'Particulier', icon: UserRound },
};

const FIELD =
  'mt-1.5 h-12 w-full rounded-xl border bg-[#FFFFFF] px-4 text-[16px] text-[#0B2A3C] placeholder:text-[#0B2A3C]/30 transition-all duration-200 focus:border-[#1391B8] focus:outline-none focus:ring-4 focus:ring-[#1391B8]/15';

/** Avis Google réels (aucun avis inventé) : trois avis courts. */
const REVIEWS = REAL_REVIEWS.filter((r) => r.rating === 5 && r.text.length >= 60 && r.text.length <= 240).slice(0, 3);

function ErrorText({ id, message }: { readonly id: string; readonly message?: string }) {
  return message ? (
    <p id={id} role="alert" className="mt-1.5 text-[13.5px] font-medium text-[#C0392B]">
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
      <label htmlFor={id} className="text-[14px] font-semibold text-[#0B2A3C]/80">
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
        className={`${FIELD} ${error ? 'border-[#C0392B]' : 'border-[#0B2A3C]/15'}`}
      />
      <ErrorText id={`${id}-err`} message={error} />
    </div>
  );
}

/** Vague décorative (bas d'une zone colorée). */
function Wave({ className = '', fill }: { readonly className?: string; readonly fill: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 1440 80" preserveAspectRatio="none" className={`block h-10 w-full sm:h-16 ${className}`}>
      <path d="M0 40 C 240 80 480 0 720 36 C 960 72 1200 8 1440 40 L1440 80 L0 80 Z" fill={fill} />
    </svg>
  );
}

function SectionTitle({ kicker, title }: { readonly kicker: string; readonly title: string }) {
  return (
    <div className="text-center">
      <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-[#1391B8]">{kicker}</p>
      <h2 className="mt-2 font-display text-[28px] font-bold leading-tight tracking-[-0.02em] sm:text-[36px]">{title}</h2>
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
  const whatsappHref = buildWhatsAppUrl(WHATSAPP_CONFIG.phoneDisplay, 'Bonjour, je viens de la page de l’offre -5 %.');

  return (
    <div className="relative flex flex-1 flex-col overflow-x-clip bg-[#FFFFFF]" style={{ color: INK }}>
      {/* ===== Haut : logo + inscription directe ===== */}
      <div className="relative bg-[linear-gradient(180deg,#E6F4FA_0%,#E4F7F3_100%)]">
        <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#7FD3E6]/35 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-40 h-80 w-80 rounded-full bg-[#7FE0C9]/35 blur-3xl" />

        <header className="relative mx-auto flex w-full max-w-[1100px] items-center justify-between gap-4 px-5 pt-4 sm:px-8 sm:pt-6">
          <a href={hrefForHome(routerMode)} aria-label={`${brand.name} — site`} className="rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1391B8]">
            <img src={logoUrl} alt={`${brand.name} — ${brand.city}`} width={580} height={371} className="h-[58px] w-auto sm:h-[74px]" />
          </a>
          <a href={brand.phoneHref} className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-[#FFFFFF] px-4 text-[15px] font-semibold tabular-nums shadow-[0_6px_20px_-8px_rgba(11,42,60,0.3)] transition hover:text-[#0E6BA8]">
            <Phone className="h-4 w-4 text-[#1391B8]" aria-hidden="true" />
            <span className="hidden sm:inline">{brand.phoneDisplay}</span>
            <span className="sm:hidden">Appeler</span>
          </a>
        </header>

        <section aria-label="Inscription à l’offre" className="relative mx-auto w-full max-w-[640px] px-4 pb-6 pt-5 sm:px-8 sm:pt-8">
          <div className="overflow-hidden rounded-[28px] bg-[#FFFFFF] shadow-[0_30px_80px_-30px_rgba(14,107,168,0.45),0_8px_24px_-12px_rgba(11,42,60,0.15)]">
            {/* Bandeau de l'offre */}
            <div className="relative flex items-center gap-4 px-6 py-5 text-[#FFFFFF] sm:gap-5 sm:px-8 sm:py-6" style={{ backgroundImage: SEA }}>
              <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-[#FFFFFF]/10" />
              <div aria-hidden="true" className="pointer-events-none absolute -bottom-14 right-16 h-28 w-28 rounded-full bg-[#FFFFFF]/10" />
              <span className="relative grid h-[76px] w-[76px] shrink-0 place-items-center rounded-full bg-[#FFFFFF] font-display text-[26px] font-extrabold tracking-[-0.04em] text-[#0E6BA8] shadow-[0_8px_20px_-8px_rgba(0,0,0,0.35)] sm:h-[86px] sm:w-[86px] sm:text-[30px]">
                -{OFFER_RATE}%
              </span>
              <div className="relative">
                <h1 className="font-display text-[21px] font-bold leading-tight tracking-[-0.01em] sm:text-[24px]">Inscription à l’offre de bienvenue</h1>
                <p className="mt-1 text-[14.5px] leading-[1.5] text-[#FFFFFF]/90 sm:text-[15.5px]">
                  {OFFER_RATE} % de réduction sur votre premier achat ou votre première intervention, valable {OFFER_MONTHS} mois.
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              {registered ? (
                <div className="text-center">
                  <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#E4F7F3] text-[#0F8F80]">
                    <Check className="h-7 w-7" strokeWidth={2.6} aria-hidden="true" />
                  </span>
                  <h2 ref={doneRef} tabIndex={-1} className="mt-4 font-display text-[26px] font-bold leading-tight tracking-[-0.02em] focus:outline-none">
                    {registered.alreadyRegistered ? 'Vous êtes déjà inscrit.' : 'C’est fait, votre réduction est activée.'}
                  </h2>
                  <div className="mt-6 rounded-2xl border-2 border-dashed border-[#1391B8]/50 bg-[#F0F9FC] px-5 py-5">
                    <p className="text-[12.5px] font-bold uppercase tracking-[0.18em] text-[#0E6BA8]">Votre code -{OFFER_RATE} %</p>
                    <p className="mt-2 break-all font-display text-[24px] font-extrabold tabular-nums tracking-[0.01em] sm:text-[30px]">{registered.code}</p>
                    <p className="mt-1.5 text-[14.5px] text-[#0B2A3C]/65">
                      Valable jusqu’au <strong className="font-semibold text-[#0B2A3C]">{registered.validUntil}</strong>
                    </p>
                  </div>
                  <p className="mx-auto mt-5 max-w-[28rem] text-[15.5px] leading-[1.6] text-[#0B2A3C]/70">
                    {registered.alreadyRegistered
                      ? 'Il vous a déjà été envoyé par e-mail.'
                      : `Nous vous l’envoyons aussi par e-mail à ${draft.email.trim()}.`}{' '}
                    Donnez ce code au moment du devis, en boutique ou par téléphone.
                  </p>
                  <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                    <a href={brand.phoneHref} className="inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-semibold text-[#FFFFFF] shadow-[0_12px_28px_-12px_rgba(14,107,168,0.8)] transition hover:brightness-110" style={{ backgroundImage: SEA }}>
                      <Phone className="h-4 w-4" aria-hidden="true" />
                      {brand.phoneDisplay}
                    </a>
                    <a href={hrefForPage('devis', routerMode)} className="inline-flex h-12 items-center justify-center rounded-full border border-[#0B2A3C]/15 px-6 text-[15px] font-semibold transition hover:border-[#1391B8]">
                      Demander un devis
                    </a>
                  </div>
                </div>
              ) : (
                <form ref={formRef} onSubmit={submit} noValidate className="relative flex flex-col gap-5">
                  <fieldset data-invalid={Boolean(errors.customerType)} tabIndex={-1} aria-describedby={errors.customerType ? 'type-err' : undefined} className="focus:outline-none">
                    <legend className="text-[14px] font-semibold text-[#0B2A3C]/80">Vous êtes</legend>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {CUSTOMER_TYPES.map((type) => {
                        const t = TYPES[type];
                        const checked = draft.customerType === type;
                        return (
                          <label key={type} title={type} className="relative cursor-pointer">
                            <input type="radio" name="type" aria-label={type} checked={checked} onChange={() => update({ customerType: type })} className="peer sr-only" />
                            <span
                              className={`inline-flex h-11 items-center gap-2 rounded-full px-4 text-[14.5px] font-medium transition-all duration-200 peer-focus-visible:ring-4 peer-focus-visible:ring-[#1391B8]/25 ${checked ? 'text-[#FFFFFF] shadow-[0_8px_20px_-10px_rgba(14,107,168,0.9)]' : 'border border-[#0B2A3C]/12 bg-[#F5FAFC] hover:border-[#1391B8]/50'}`}
                              style={checked ? { backgroundImage: SEA } : undefined}
                            >
                              {checked ? <Check className="h-4 w-4" strokeWidth={2.6} aria-hidden="true" /> : <t.icon className="h-4 w-4 text-[#1391B8]" strokeWidth={1.9} aria-hidden="true" />}
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
                    <label className="flex cursor-pointer items-start gap-3 text-[14px] leading-[1.55] text-[#0B2A3C]/70">
                      <input
                        type="checkbox"
                        checked={draft.acceptConditions && draft.consent}
                        onChange={(e) => update({ acceptConditions: e.target.checked, consent: e.target.checked })}
                        aria-invalid={Boolean(errors.acceptConditions || errors.consent)}
                        aria-describedby={errors.acceptConditions || errors.consent ? 'cond-err' : undefined}
                        className="mt-0.5 h-5 w-5 shrink-0 accent-[#0E6BA8]"
                      />
                      <span>
                        J’accepte les conditions de l’offre et que {brand.name} utilise ces informations pour gérer mon code (
                        <a href={hrefForPage('confidentialite', routerMode)} className="font-medium text-[#0E6BA8] underline underline-offset-2">confidentialité</a>).
                      </span>
                    </label>
                    <ErrorText id="cond-err" message={errors.acceptConditions ?? errors.consent} />
                    <details className="group mt-3 rounded-xl bg-[#F0F9FC] px-4 py-3">
                      <summary className="flex cursor-pointer list-none items-center justify-between text-[14px] font-semibold text-[#0B2A3C]/80 [&::-webkit-details-marker]:hidden">
                        Conditions de l’offre
                        <ChevronDown className="h-4 w-4 text-[#0E6BA8] transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
                      </summary>
                      <ul className="mt-3 flex flex-col gap-2 text-[14px] leading-[1.5] text-[#0B2A3C]/75">
                        {OFFER_CONDITIONS.map((item) => (
                          <li key={item} className="flex gap-2.5">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#17B3A3]" strokeWidth={2.6} aria-hidden="true" />
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
                    className="group inline-flex h-14 w-full cursor-pointer items-center justify-center gap-2.5 rounded-full text-[16.5px] font-semibold text-[#FFFFFF] shadow-[0_16px_36px_-14px_rgba(14,107,168,0.9)] transition hover:-translate-y-px hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#1391B8] disabled:cursor-wait disabled:opacity-70"
                    style={{ backgroundImage: SEA }}
                  >
                    {sending ? 'Inscription en cours…' : `Recevoir mon code -${OFFER_RATE} %`}
                    <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
                  </button>
                  <p className="-mt-1 text-center text-[13px] text-[#0B2A3C]/50">Gratuit, sans engagement · vos informations restent chez nous</p>
                </form>
              )}
            </div>
          </div>
        </section>
        <Wave fill="#FFFFFF" className="relative" />
      </div>

      {/* ===== Comment ça marche ===== */}
      <section aria-labelledby="offre-etapes" className="mx-auto w-full max-w-[1040px] px-5 py-12 sm:px-8 sm:py-16">
        <div id="offre-etapes">
          <SectionTitle kicker="Simple et rapide" title="Comment ça marche ?" />
        </div>
        <ol className="relative mt-10 grid gap-8 sm:mt-12 sm:grid-cols-3 sm:gap-6">
          {/* ligne qui relie les étapes */}
          <div aria-hidden="true" className="absolute left-[27px] top-2 bottom-2 w-[2px] bg-[linear-gradient(180deg,#0E6BA8,#17B3A3)] opacity-25 sm:left-[16%] sm:right-[16%] sm:top-[27px] sm:bottom-auto sm:h-[2px] sm:w-auto sm:bg-[linear-gradient(90deg,#0E6BA8,#17B3A3)]" />
          {[
            { icon: MousePointerClick, title: 'Je m’inscris', text: 'Je remplis le formulaire ci-dessus : 30 secondes suffisent.' },
            { icon: Mail, title: 'Je reçois mon code', text: 'Il s’affiche tout de suite à l’écran et arrive aussi par e-mail.' },
            { icon: Ticket, title: 'J’en profite', text: `Je donne mon code au moment du devis : -${OFFER_RATE} % pendant ${OFFER_MONTHS} mois.` },
          ].map((step, i) => (
            <li key={step.title} className="relative flex gap-5 sm:flex-col sm:items-center sm:text-center">
              <span className="relative grid h-14 w-14 shrink-0 place-items-center rounded-full text-[#FFFFFF] shadow-[0_10px_24px_-10px_rgba(14,107,168,0.8)] ring-[6px] ring-[#FFFFFF]" style={{ backgroundImage: SEA }}>
                <step.icon className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
                <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-[#0B2A3C] text-[12px] font-bold text-[#FFFFFF]">{i + 1}</span>
              </span>
              <div className="pt-1 sm:pt-0">
                <p className="font-display text-[19px] font-bold tracking-[-0.01em]">{step.title}</p>
                <p className="mt-1.5 max-w-[17rem] text-[15px] leading-[1.55] text-[#0B2A3C]/65">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ===== Avis clients (vrais avis Google) ===== */}
      {REVIEWS.length > 0 && (
        <section aria-labelledby="offre-avis" className="bg-[#F0F9FC]">
          <div className="mx-auto w-full max-w-[1100px] px-5 py-12 sm:px-8 sm:py-16">
            <div id="offre-avis">
              <SectionTitle kicker="Avis clients" title="Ils nous ont fait confiance" />
            </div>
            {REVIEWS_SOURCE.googleAverage && REVIEWS_SOURCE.googleTotalCount ? (
              <p className="mt-3 flex items-center justify-center gap-2 text-[15px] text-[#0B2A3C]/70">
                <span className="flex" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((n) => (
                    <Star key={n} className="h-4 w-4 fill-[#F5B731] text-[#F5B731]" />
                  ))}
                </span>
                <span>
                  <strong className="font-semibold text-[#0B2A3C]">{REVIEWS_SOURCE.googleAverage.toLocaleString('fr-FR')}/5</strong> sur Google · {REVIEWS_SOURCE.googleTotalCount} avis
                </span>
              </p>
            ) : null}
            <ul className="mt-9 grid gap-4 md:grid-cols-3">
              {REVIEWS.map((review) => (
                <li key={review.id} className="flex flex-col rounded-[22px] bg-[#FFFFFF] p-6 shadow-[0_14px_36px_-22px_rgba(11,42,60,0.35)]">
                  <span className="flex" role="img" aria-label={`${review.rating} sur 5`}>
                    {Array.from({ length: review.rating }, (_, n) => (
                      <Star key={n} className="h-4 w-4 fill-[#F5B731] text-[#F5B731]" aria-hidden="true" />
                    ))}
                  </span>
                  <p className="mt-3 flex-1 text-[15.5px] leading-[1.6] text-[#0B2A3C]/80">« {review.text} »</p>
                  <div className="mt-5 flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full font-display text-[15px] font-bold text-[#FFFFFF]" style={{ backgroundImage: SEA }} aria-hidden="true">
                      {review.author.charAt(0)}
                    </span>
                    <div className="leading-tight">
                      <p className="text-[15px] font-semibold">{review.author}</p>
                      <p className="text-[13px] text-[#0B2A3C]/55">Avis Google{review.service ? ` · ${review.service}` : ''}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-center">
              <a href={REVIEWS_SOURCE.googleProfileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-[#0E6BA8] hover:underline">
                Voir tous les avis sur Google
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </p>
          </div>
        </section>
      )}

      {/* ===== Infos de l'entreprise ===== */}
      <footer className="mt-auto bg-[#0B2A3C] text-[#FFFFFF]">
        <Wave fill="#F0F9FC" className="rotate-180" />
        <div className="mx-auto w-full max-w-[1100px] px-5 pb-8 pt-8 sm:px-8 sm:pt-10">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <p className="font-display text-[19px] font-bold">{brand.name}</p>
              <p className="mt-2 text-[14.5px] leading-[1.6] text-[#FFFFFF]/70">Serrurier à Marseille : serrurerie, clés et badges, vitrerie, menuiserie et fermetures.</p>
            </div>
            <div className="flex gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#5FD6C6]" aria-hidden="true" />
              <div className="text-[14.5px] leading-[1.6]">
                <p className="font-semibold">Boutique</p>
                <p className="text-[#FFFFFF]/75">48 rue de la République<br />13002 Marseille</p>
                <a href={REVIEWS_SOURCE.googleProfileUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block font-medium text-[#5FD6C6] hover:underline">Itinéraire</a>
              </div>
            </div>
            <div className="flex gap-3">
              <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-[#5FD6C6]" aria-hidden="true" />
              <div className="text-[14.5px] leading-[1.6]">
                <p className="font-semibold">Horaires</p>
                <p className="text-[#FFFFFF]/75">Lundi au samedi : 9h – 19h<br />Dimanche : fermé</p>
                <p className="mt-1 text-[#FFFFFF]/75">Dépannage d’urgence aussi le soir et le dimanche, par téléphone.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Phone className="mt-0.5 h-5 w-5 shrink-0 text-[#5FD6C6]" aria-hidden="true" />
              <div className="text-[14.5px] leading-[1.6]">
                <p className="font-semibold">Contact</p>
                <a href={brand.phoneHref} className="block whitespace-nowrap font-semibold tabular-nums hover:text-[#5FD6C6]">{brand.phoneDisplay}</a>
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1.5 text-[#FFFFFF]/75 hover:text-[#5FD6C6]">
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-col justify-between gap-3 border-t border-[#FFFFFF]/12 pt-6 text-[13.5px] text-[#FFFFFF]/60 sm:flex-row">
            <p>© {new Date().getFullYear()} {brand.name}</p>
            <p className="flex flex-wrap gap-x-4 gap-y-1">
              <a href={hrefForHome(routerMode)} className="hover:text-[#FFFFFF]">Découvrir le site</a>
              <a href={hrefForPage('mentions-legales', routerMode)} className="hover:text-[#FFFFFF]">Mentions légales</a>
              <a href={hrefForPage('confidentialite', routerMode)} className="hover:text-[#FFFFFF]">Confidentialité</a>
              <a href={hrefForPage('cgv', routerMode)} className="hover:text-[#FFFFFF]">CGV</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
