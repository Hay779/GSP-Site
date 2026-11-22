import { useRef, useState, type ReactNode } from 'react';
import { Building2, Check, KeyRound, Phone, Send, ShieldCheck, Users } from 'lucide-react';
import type { BrandConfig } from '../utils/navigation';
import {
  createPartnerReference,
  INITIAL_PARTNER_DRAFT,
  ORGANIZATION_TYPES,
  PARTNER_NEEDS,
  toggleNeed,
  validatePartnerDraft,
  type OrganizationType,
  type PartnerDraft,
  type PartnerErrors,
} from '../utils/partnerForm';
import { hrefForPage, type RouterMode } from '../utils/router';
import { PageHero, usePageMeta } from './PageHero';

const ORG_ICONS: Readonly<Record<OrganizationType, typeof Building2>> = {
  'Syndic / gestionnaire de copropriété': Building2,
  'Assureur / expert': ShieldCheck,
  'Agence immobilière / bailleur': KeyRound,
  'Autre professionnel': Users,
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

export function PartnerPage({ brand, routerMode }: { readonly brand: BrandConfig; readonly routerMode: RouterMode }) {
  usePageMeta(
    'Devenir partenaire — Professionnels | Serrurerie de la République',
    'Syndics, assureurs, experts, agences immobilières et bailleurs : présentez-nous votre structure pour organiser une collaboration à Marseille.'
  );
  const [draft, setDraft] = useState<PartnerDraft>(INITIAL_PARTNER_DRAFT);
  const [errors, setErrors] = useState<PartnerErrors>({});
  const [reference, setReference] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const doneRef = useRef<HTMLHeadingElement | null>(null);

  const update = (patch: Partial<PartnerDraft>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setErrors((e) => {
      const next = { ...e };
      for (const key of Object.keys(patch)) {
        delete next[key as keyof PartnerDraft];
      }
      return next;
    });
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const found = validatePartnerDraft(draft);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      const first = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"], [data-invalid="true"]');
      first?.focus();
      first?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }
    const now = new Date();
    setReference(createPartnerReference(now, now.getMilliseconds() + draft.company.length * 13));
    window.requestAnimationFrame(() => {
      doneRef.current?.focus();
      doneRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
  };

  return (
    <>
      <PageHero
        compact
        title="Devenir partenaire."
        intro="Syndics, assureurs, experts, agences immobilières et bailleurs : présentez-nous votre structure et vos besoins, nous revenons vers vous pour organiser notre collaboration."
      />

      <section aria-label="Formulaire partenaire" className="w-full border-t border-[#B79A62]/45 bg-[#F7F5F0] text-[#1C1F21]">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-8 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-12 lg:gap-12 lg:px-10 lg:py-20">
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-28 flex flex-col gap-4">
              <div className="rounded-xl border border-[#1C1F21]/12 bg-[#FFFFFF] p-6">
                <p className="font-display text-[18px] font-semibold">Ce que nous vous proposons</p>
                <ul className="mt-4 flex flex-col gap-3 text-[15px] leading-[1.5] text-[#1C1F21]/80">
                  {[
                    'Un interlocuteur unique pour tous vos accès',
                    'Un devis détaillé avant chaque intervention',
                    'Des photos et un compte rendu pour vos dossiers',
                    'Deux agences à Marseille : République & Rome',
                  ].map((item) => (
                    <li key={item} className="flex gap-3">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#7D612D]" strokeWidth={2.4} aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-[#1C1F21]/12 bg-[#FFFFFF] p-6">
                <p className="font-display text-[16px] font-semibold">Une intervention urgente ?</p>
                <a href={brand.phoneHref} className="mt-2 inline-flex items-center gap-2 text-[16px] font-semibold tabular-nums text-[#7D612D] hover:text-[#1C1F21]">
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  {brand.phoneDisplay}
                </a>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-8">
            <div className="rounded-xl border border-[#1C1F21]/12 bg-[#FFFFFF] p-6 shadow-[0_18px_50px_rgba(28,31,33,0.06)] sm:p-9">
              {reference ? (
                <div>
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-[#B79A62] text-[#1C1F21]">
                    <Check className="h-7 w-7" strokeWidth={2.4} aria-hidden="true" />
                  </span>
                  <h2 ref={doneRef} tabIndex={-1} className="mt-5 font-display text-[28px] font-semibold leading-tight focus:outline-none">
                    Merci, votre demande est bien enregistrée.
                  </h2>
                  <p className="mt-3 text-[16px] leading-[1.6] text-[#1C1F21]/75">
                    Référence <strong className="font-semibold tabular-nums text-[#1C1F21]">{reference}</strong>. Nous revenons vers{' '}
                    {draft.fullName.trim()} ({draft.company.trim()}) pour organiser notre collaboration.
                  </p>
                  <a href={hrefForPage('professionnels', routerMode)} className="mt-7 inline-flex min-h-[48px] items-center justify-center rounded-lg bg-[#1C1F21] px-6 py-3 text-[15px] font-semibold text-[#F3F0E7] hover:bg-[#292D2F]">
                    Retour à l’espace Professionnels
                  </a>
                </div>
              ) : (
                <form ref={formRef} onSubmit={submit} noValidate className="flex flex-col gap-7">
                  <Group title="Votre structure">
                    <fieldset data-invalid={Boolean(errors.organizationType)} tabIndex={-1} aria-describedby={errors.organizationType ? 'org-err' : undefined}>
                      <legend className="sr-only">Type de structure</legend>
                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                        {ORGANIZATION_TYPES.map((type) => {
                          const Icon = ORG_ICONS[type];
                          const checked = draft.organizationType === type;
                          return (
                            <label key={type} className="relative block cursor-pointer">
                              <input type="radio" name="org" checked={checked} onChange={() => update({ organizationType: type })} className="peer sr-only" />
                              <span className={`flex items-center gap-3 rounded-lg border px-4 py-3.5 text-[15px] transition-colors duration-150 peer-focus-visible:ring-2 peer-focus-visible:ring-[#B79A62] ${checked ? 'border-[#B79A62] bg-[#B79A62]/12 font-medium' : 'border-[#1C1F21]/15 hover:border-[#B79A62]/70'}`}>
                                <Icon className="h-5 w-5 shrink-0 text-[#7D612D]" strokeWidth={1.7} aria-hidden="true" />
                                {type}
                                {checked && <Check className="ml-auto h-4 w-4 text-[#7D612D]" strokeWidth={2.4} aria-hidden="true" />}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                      <ErrorText id="org-err" message={errors.organizationType} />
                    </fieldset>
                    <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <TextField id="p-company" label="Nom de la société" autoComplete="organization" value={draft.company} onChange={(v) => update({ company: v })} error={errors.company} />
                      <TextField id="p-volume" label="Volume" optional placeholder="Ex. 40 immeubles, 200 lots…" value={draft.volume} onChange={(v) => update({ volume: v })} />
                    </div>
                  </Group>

                  <Group title="Vos besoins">
                    <fieldset data-invalid={Boolean(errors.needs)} tabIndex={-1} aria-describedby={errors.needs ? 'needs-err' : undefined}>
                      <legend className="sr-only">Besoins</legend>
                      <div className="flex flex-wrap gap-2.5">
                        {PARTNER_NEEDS.map((need) => {
                          const checked = draft.needs.includes(need);
                          return (
                            <label key={need} className="cursor-pointer">
                              <input type="checkbox" checked={checked} onChange={() => update({ needs: toggleNeed(draft.needs, need) })} className="peer sr-only" />
                              <span className={`inline-flex min-h-[44px] items-center gap-2 rounded-full border px-4 py-2 text-[14.5px] transition-colors duration-150 peer-focus-visible:ring-2 peer-focus-visible:ring-[#B79A62] ${checked ? 'border-[#1C1F21] bg-[#1C1F21] text-[#F3F0E7]' : 'border-[#1C1F21]/18 hover:border-[#B79A62]'}`}>
                                {checked && <Check className="h-4 w-4 text-[#B79A62]" strokeWidth={2.4} aria-hidden="true" />}
                                {need}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                      <ErrorText id="needs-err" message={errors.needs} />
                    </fieldset>
                    <div className="mt-5">
                      <label htmlFor="p-message" className="text-[15px] font-medium">
                        Votre message <span className="font-normal text-[#1C1F21]/55">(facultatif)</span>
                      </label>
                      <textarea id="p-message" rows={4} value={draft.message} onChange={(e) => update({ message: e.target.value })} placeholder="Votre contexte, vos attentes, votre secteur…" className={`${FIELD} resize-y border-[#1C1F21]/20`} />
                    </div>
                  </Group>

                  <Group title="Vos coordonnées">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <TextField id="p-name" label="Nom et prénom" autoComplete="name" value={draft.fullName} onChange={(v) => update({ fullName: v })} error={errors.fullName} />
                      <TextField id="p-role" label="Fonction" optional autoComplete="organization-title" value={draft.role} onChange={(v) => update({ role: v })} />
                      <TextField id="p-phone" label="Téléphone" type="tel" autoComplete="tel" value={draft.phone} onChange={(v) => update({ phone: v })} error={errors.phone} />
                      <TextField id="p-email" label="E-mail professionnel" type="email" autoComplete="email" value={draft.email} onChange={(v) => update({ email: v })} error={errors.email} />
                    </div>
                    <label className="mt-5 flex cursor-pointer items-start gap-3 text-[14.5px] leading-[1.55] text-[#1C1F21]/80">
                      <input type="checkbox" checked={draft.consent} onChange={(e) => update({ consent: e.target.checked })} aria-invalid={Boolean(errors.consent)} aria-describedby={errors.consent ? 'consent-err' : undefined} className="mt-1 h-5 w-5 shrink-0 accent-[#7D612D]" />
                      <span>
                        J’accepte que Serrurerie de la République utilise ces informations pour me recontacter.{' '}
                        <a href={hrefForPage('confidentialite', routerMode)} className="text-[#7D612D] underline">En savoir plus</a>
                      </span>
                    </label>
                    <ErrorText id="consent-err" message={errors.consent} />
                  </Group>

                  <div className="border-t border-[#1C1F21]/10 pt-6">
                    <button type="submit" className="inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-full bg-[#1C1F21] px-7 text-[16px] font-semibold text-[#F3F0E7] hover:bg-[#292D2F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79A62] sm:w-auto cursor-pointer [&_svg]:text-[#B79A62]">
                      <Send className="h-4 w-4" aria-hidden="true" />
                      Envoyer ma demande
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
