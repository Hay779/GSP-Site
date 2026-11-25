import { useState } from 'react';
import { CalendarDays, Check, FileText, HelpCircle, MapPin, MessageCircle, Phone, Send, type LucideIcon } from 'lucide-react';
import type { AgencyItem, WhatsAppConfig } from '../data/sectionsContent';
import {
  buildContactSummary,
  CONTACT_SUBJECTS,
  INITIAL_CONTACT_DRAFT,
  validateContactDraft,
  type ContactDraft,
  type ContactErrors,
  type ContactSubject,
} from '../utils/contactForm';
import type { BrandConfig } from '../utils/navigation';
import { hrefForPage, type RouterMode } from '../utils/router';
import { buildWhatsAppUrl } from '../utils/whatsapp';
import { sendFormRequest } from '../utils/formDelivery';
import { DeliveryErrorNotice, HoneypotField } from './FormDelivery';

const SUBJECT_ICONS: Readonly<Record<ContactSubject, LucideIcon>> = {
  question: HelpCircle,
  rdv: CalendarDays,
  suivi: FileText,
  autre: MessageCircle,
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

interface ContactFormSectionProps {
  readonly id: string;
  readonly kicker: string;
  readonly title: string;
  readonly brand: BrandConfig;
  readonly whatsapp: WhatsAppConfig;
  readonly agencies: readonly AgencyItem[];
  readonly routerMode: RouterMode;
}

/** Formulaire de contact en tête de la page Contact, avec les accès directs à côté (dessous sur mobile). */
export function ContactFormSection({ id, kicker, title, brand, whatsapp, agencies, routerMode }: ContactFormSectionProps) {
  const [draft, setDraft] = useState<ContactDraft>(INITIAL_CONTACT_DRAFT);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [reference, setReference] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState('');
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState<'reseau' | 'limite' | 'refus' | null>(null);
  const whatsappUrl = buildWhatsAppUrl(whatsapp.phoneDisplay, whatsapp.prefilledMessage);

  const update = (patch: Partial<ContactDraft>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setErrors((e) => {
      const next = { ...e };
      for (const key of Object.keys(patch)) delete next[key as keyof ContactDraft];
      return next;
    });
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;
    const found = validateContactDraft(draft);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      event.currentTarget.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }
    setSending(true);
    setFailure(null);
    const result = await sendFormRequest({ kind: 'contact', rows: buildContactSummary(draft), startedAt, honeypot });
    setSending(false);
    if (result.ok) setReference(result.reference);
    else setFailure(result.reason);
  };

  const input = (key: 'fullName' | 'phone' | 'email', label: string, opts: { type?: string; auto?: string; ph?: string; optional?: boolean } = {}) => (
    <div>
      <label htmlFor={`c-${key}`} className="text-[15px] font-medium text-[#1C1F21]">
        {label} {opts.optional && <span className="font-normal text-[#1C1F21]/55">(facultatif)</span>}
      </label>
      <input
        id={`c-${key}`}
        type={opts.type ?? 'text'}
        autoComplete={opts.auto}
        placeholder={opts.ph}
        value={draft[key]}
        onChange={(e) => update({ [key]: e.target.value })}
        aria-invalid={Boolean(errors[key])}
        aria-describedby={errors[key] ? `c-${key}-err` : undefined}
        className={`${FIELD} ${errors[key] ? 'border-[#A33B2B]' : 'border-[#1C1F21]/20'}`}
      />
      <ErrorText id={`c-${key}-err`} message={errors[key]} />
    </div>
  );

  return (
    <section id={id} aria-labelledby={`${id}-title`} className="w-full bg-[#F7F5F0] text-[#1C1F21] lg:border-t lg:border-[#B79A62]/45">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-6 px-4 pt-4 pb-12 sm:px-8 sm:pt-6 lg:grid-cols-12 lg:gap-12 lg:px-10 lg:py-20">
        {/* Formulaire */}
        <div className="lg:col-span-7">
          <p className="hidden lg:block section-kicker text-[#7D612D]">{kicker}</p>
          <h2 id={`${id}-title`} className="font-display text-[22px] font-semibold leading-tight sm:text-[26px] lg:mt-3 lg:text-[34px]">
            {title}
          </h2>
          <p className="mt-1 text-[14px] text-[#1C1F21]/65 lg:mt-3 lg:text-[16px]">Nous vous répondons par téléphone ou par e-mail.</p>

          <div className="mt-4 rounded-xl border border-[#1C1F21]/12 bg-[#FFFFFF] p-5 shadow-[0_18px_50px_rgba(28,31,33,0.06)] sm:p-8 lg:mt-7">
            {reference ? (
              <div>
                <span className="grid h-12 w-12 place-items-center rounded-full bg-[#B79A62] text-[#1C1F21]">
                  <Check className="h-6 w-6" strokeWidth={2.4} aria-hidden="true" />
                </span>
                <p className="mt-4 font-display text-[22px] font-semibold">Merci, votre message est bien enregistré.</p>
                <p className="mt-2 text-[15px] text-[#1C1F21]/75">
                  Référence <strong className="tabular-nums">{reference}</strong>. Nous vous recontactons au{' '}
                  <strong className="tabular-nums">{draft.phone}</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setDraft(INITIAL_CONTACT_DRAFT);
                    setReference(null);
                    setStartedAt(Date.now());
                  }}
                  className="mt-6 inline-flex h-11 items-center rounded-full border border-[#1C1F21]/25 px-5 text-[15px] font-medium hover:border-[#1C1F21] cursor-pointer"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="relative flex flex-col gap-5">
                <HoneypotField value={honeypot} onChange={setHoneypot} />
                <fieldset>
                  <legend className="text-[15px] font-medium">Votre demande concerne</legend>
                  <div className="mt-2 grid grid-cols-2 gap-2.5">
                    {CONTACT_SUBJECTS.map((s) => {
                      const Icon = SUBJECT_ICONS[s.id];
                      const checked = draft.subject === s.id;
                      return (
                        <label key={s.id} className="relative block cursor-pointer">
                          <input type="radio" name="subject" checked={checked} onChange={() => update({ subject: s.id })} className="peer sr-only" />
                          <span
                            className={`flex h-full items-center gap-2.5 rounded-lg border px-3 py-3 text-[13.5px] leading-snug transition-colors duration-150 peer-focus-visible:ring-2 peer-focus-visible:ring-[#B79A62] sm:text-[14.5px] ${
                              checked ? 'border-[#B79A62] bg-[#B79A62]/12 font-medium' : 'border-[#1C1F21]/15 hover:border-[#B79A62]/70'
                            }`}
                          >
                            <Icon className="h-[18px] w-[18px] shrink-0 text-[#7D612D]" strokeWidth={1.8} aria-hidden="true" />
                            {s.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">{input('fullName', 'Nom et prénom', { auto: 'name' })}</div>
                  {input('phone', 'Téléphone', { type: 'tel', auto: 'tel', ph: '06 12 34 56 78' })}
                  {input('email', 'E-mail', { type: 'email', auto: 'email', optional: true })}
                </div>

                <div>
                  <label htmlFor="c-message" className="text-[15px] font-medium">Votre message</label>
                  <textarea
                    id="c-message"
                    rows={4}
                    value={draft.message}
                    onChange={(e) => update({ message: e.target.value })}
                    placeholder="Ex. je souhaite passer en boutique samedi matin pour un double de badge."
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? 'c-message-err' : undefined}
                    className={`${FIELD} resize-y ${errors.message ? 'border-[#A33B2B]' : 'border-[#1C1F21]/20'}`}
                  />
                  <ErrorText id="c-message-err" message={errors.message} />
                </div>

                <div>
                  <label className="flex cursor-pointer items-start gap-3 text-[14px] leading-[1.55] text-[#1C1F21]/80">
                    <input
                      type="checkbox"
                      checked={draft.consent}
                      onChange={(e) => update({ consent: e.target.checked })}
                      aria-invalid={Boolean(errors.consent)}
                      aria-describedby={errors.consent ? 'c-consent-err' : undefined}
                      className="mt-1 h-5 w-5 shrink-0 accent-[#7D612D]"
                    />
                    <span>
                      J’accepte que Serrurerie de la République utilise ces informations pour me recontacter.{' '}
                      <a href={hrefForPage('confidentialite', routerMode)} className="text-[#7D612D] underline">En savoir plus</a>
                    </span>
                  </label>
                  <ErrorText id="c-consent-err" message={errors.consent} />
                </div>

                {failure && <DeliveryErrorNotice reason={failure} />}

                <button
                  type="submit"
                  disabled={sending}
                  aria-busy={sending}
                  className="inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-full bg-[#1C1F21] px-7 text-[16px] font-semibold text-[#F3F0E7] hover:bg-[#292D2F] disabled:cursor-wait disabled:opacity-70 sm:w-auto cursor-pointer [&_svg]:text-[#B79A62]"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  {sending ? 'Envoi en cours…' : 'Envoyer mon message'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Accès directs */}
        <aside className="lg:col-span-5 lg:pt-[118px]">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7D612D]">Ou directement</p>
          <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <li>
              <a href={brand.phoneHref} className="flex items-center gap-4 rounded-xl border border-[#1C1F21]/12 bg-[#FFFFFF] p-4 hover:border-[#B79A62]">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#1C1F21] text-[#B79A62]">
                  <Phone className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-[13px] text-[#1C1F21]/60">Par téléphone</span>
                  <span className="block font-display text-[18px] font-semibold tabular-nums">{brand.phoneDisplay}</span>
                </span>
              </a>
            </li>
            <li>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 rounded-xl border border-[#1C1F21]/12 bg-[#FFFFFF] p-4 hover:border-[#B79A62]">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#1FA855] text-white">
                  <MessageCircle className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-[13px] text-[#1C1F21]/60">Par WhatsApp</span>
                  <span className="block font-display text-[16px] font-semibold">Message ou photo</span>
                </span>
              </a>
            </li>
            <li>
              <a href={hrefForPage('devis', routerMode)} className="flex items-center gap-4 rounded-xl border border-[#1C1F21]/12 bg-[#FFFFFF] p-4 hover:border-[#B79A62]">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#B79A62]/45 bg-[#F7F5F0] text-[#7D612D]">
                  <FileText className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-[13px] text-[#1C1F21]/60">Un projet précis ?</span>
                  <span className="block font-display text-[16px] font-semibold">Demander un devis</span>
                </span>
              </a>
            </li>
            <li>
              <div className="flex items-start gap-4 rounded-xl border border-[#1C1F21]/12 bg-[#FFFFFF] p-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#B79A62]/45 bg-[#F7F5F0] text-[#7D612D]">
                  <MapPin className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
                </span>
                <span className="text-[14px] leading-[1.5]">
                  <span className="block text-[13px] text-[#1C1F21]/60">En boutique</span>
                  {agencies.map((a) => (
                    <span key={a.id} className="block">
                      <strong className="font-semibold">{a.name.replace('Agence ', '')}</strong>
                      <span className="text-[#1C1F21]/60"> · {a.districtLabel}</span>
                    </span>
                  ))}
                </span>
              </div>
            </li>
          </ul>
        </aside>
      </div>
    </section>
  );
}
