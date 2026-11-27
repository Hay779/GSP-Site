import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  AlignLeft,
  ArrowDown,
  ArrowUp,
  Calendar,
  CheckSquare,
  CircleDot,
  Hash,
  Lock,
  Plus,
  Smartphone,
  ToggleLeft,
  Trash2,
  Type,
  X,
} from 'lucide-react';
import { slugify, serializeOffer, validateOffer, type OfferConfig, type OfferErrors } from '../../utils/offers';
import {
  hasOptions,
  MAX_OPTIONS,
  MAX_QUESTIONS,
  newQuestion,
  QUESTION_TYPES,
  type OfferQuestion,
  type QuestionType,
} from '../../utils/offerQuestions';
import { failureMessage, saveOffer, type ApiFailure } from '../../utils/gestion';
import { PREVIEW_READY, PREVIEW_UPDATE } from '../OfferPage';

const SEA = 'linear-gradient(120deg,#0E6BA8 0%,#1391B8 50%,#17B3A3 100%)';
const INPUT =
  'mt-1.5 h-11 w-full rounded-xl border bg-[#FFFFFF] px-3.5 text-[15.5px] focus:border-[#1391B8] focus:outline-none focus:ring-4 focus:ring-[#1391B8]/15';

const TYPE_ICONS: Readonly<Record<QuestionType, typeof Type>> = {
  texte: Type,
  paragraphe: AlignLeft,
  choix: CircleDot,
  cases: CheckSquare,
  oui_non: ToggleLeft,
  nombre: Hash,
  date: Calendar,
};

type Tab = 'offre' | 'formulaire' | 'apercu';

function Field({ id, label, hint, error, children }: { readonly id: string; readonly label: string; readonly hint?: string; readonly error?: string; readonly children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="text-[14px] font-semibold text-[#0B2A3C]/80">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-[12.5px] text-[#0B2A3C]/50">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1 text-[13px] font-medium text-[#C0392B]">
          {error}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- onglet « Offre »
function OfferSettings({
  offer,
  isNew,
  errors,
  conditionsText,
  onConditionsText,
  onChange,
}: {
  readonly offer: OfferConfig;
  readonly isNew: boolean;
  readonly errors: OfferErrors;
  readonly conditionsText: string;
  readonly onConditionsText: (v: string) => void;
  readonly onChange: (patch: Partial<OfferConfig>, fromName?: boolean) => void;
}) {
  const err = (k: keyof OfferErrors) => (errors[k] ? 'border-[#C0392B]' : 'border-[#0B2A3C]/15');
  return (
    <div className="flex flex-col gap-4">
      <Field id="of-name" label="Nom de l’offre (pour vous)" hint="Ex. Syndics printemps 2027" error={errors.name}>
        <input id="of-name" className={`${INPUT} ${err('name')}`} value={offer.name} onChange={(e) => onChange({ name: e.target.value }, true)} />
      </Field>

      <Field id="of-slug" label="Adresse de la page" hint={isNew ? 'Créée à partir du nom. Elle ne pourra plus changer une fois l’offre créée.' : 'Ne change plus : elle est dans le QR code.'} error={errors.slug}>
        <div className={`mt-1.5 flex h-11 items-center overflow-hidden rounded-xl border bg-[#F5FAFC] ${err('slug')}`}>
          <span className="whitespace-nowrap pl-3.5 text-[14px] text-[#0B2A3C]/50">…/offre?o=</span>
          <input
            id="of-slug"
            readOnly={!isNew}
            className="h-full min-w-0 flex-1 bg-transparent pr-3.5 font-mono text-[14.5px] focus:outline-none read-only:text-[#0B2A3C]/60"
            value={offer.slug}
            onChange={(e) => onChange({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
          />
        </div>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="of-value" label="Réduction" error={errors.reductionValue}>
          <div className="mt-1.5 flex gap-2">
            <input
              id="of-value"
              type="number"
              min={1}
              inputMode="decimal"
              className={`h-11 w-full min-w-0 rounded-xl border bg-[#FFFFFF] px-3.5 text-[15.5px] focus:border-[#1391B8] focus:outline-none focus:ring-4 focus:ring-[#1391B8]/15 ${err('reductionValue')}`}
              value={Number.isFinite(offer.reductionValue) ? offer.reductionValue : ''}
              onChange={(e) => onChange({ reductionValue: e.target.value === '' ? Number.NaN : Number(e.target.value) })}
            />
            <div className="flex shrink-0 rounded-xl bg-[#F0F9FC] p-1" role="group" aria-label="Type de réduction">
              {(['pourcent', 'euros'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={offer.reductionType === t}
                  onClick={() => onChange({ reductionType: t })}
                  className={`h-9 w-11 cursor-pointer rounded-lg text-[15px] font-bold transition ${offer.reductionType === t ? 'bg-[#FFFFFF] text-[#0E6BA8] shadow-sm' : 'text-[#0B2A3C]/50'}`}
                >
                  {t === 'pourcent' ? '%' : '€'}
                </button>
              ))}
            </div>
          </div>
        </Field>
        <Field id="of-months" label="Code valable (mois)" error={errors.months}>
          <input id="of-months" type="number" min={1} max={24} className={`${INPUT} ${err('months')}`} value={Number.isFinite(offer.months) ? offer.months : ''} onChange={(e) => onChange({ months: e.target.value === '' ? Number.NaN : Math.round(Number(e.target.value)) })} />
        </Field>
      </div>

      <Field id="of-title" label="Titre vu par les clients" hint="Ex. Offre syndics : -10 % ce printemps" error={errors.title}>
        <input id="of-title" className={`${INPUT} ${err('title')}`} value={offer.title} onChange={(e) => onChange({ title: e.target.value })} />
      </Field>
      <Field id="of-desc" label="Explication en une phrase" hint="Ex. 10 % de réduction sur vos interventions dans vos copropriétés." error={errors.description}>
        <input id="of-desc" className={`${INPUT} ${err('description')}`} value={offer.description} onChange={(e) => onChange({ description: e.target.value })} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="of-start" label="Début des inscriptions (facultatif)">
          <input id="of-start" type="date" className={`${INPUT} border-[#0B2A3C]/15`} value={offer.start} onChange={(e) => onChange({ start: e.target.value })} />
        </Field>
        <Field id="of-end" label="Fin des inscriptions (facultatif)" error={errors.end}>
          <input id="of-end" type="date" className={`${INPUT} ${err('end')}`} value={offer.end} onChange={(e) => onChange({ end: e.target.value })} />
        </Field>
      </div>

      <Field id="of-cond" label="Conditions (une par ligne)" error={errors.conditions}>
        <textarea id="of-cond" rows={5} className={`mt-1.5 w-full rounded-xl border bg-[#FFFFFF] px-3.5 py-2.5 text-[15px] leading-[1.5] focus:border-[#1391B8] focus:outline-none focus:ring-4 focus:ring-[#1391B8]/15 ${err('conditions')}`} value={conditionsText} onChange={(e) => onConditionsText(e.target.value)} />
      </Field>

      <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl bg-[#F5FAFC] px-4 py-3">
        <span>
          <span className="block text-[14.5px] font-semibold">Offre active</span>
          <span className="block text-[13px] text-[#0B2A3C]/55">Décochée : la page affiche « offre plus disponible ».</span>
        </span>
        <input type="checkbox" checked={offer.active} onChange={(e) => onChange({ active: e.target.checked })} className="h-5 w-5 accent-[#0E6BA8]" />
      </label>
    </div>
  );
}

// ---------------------------------------------------------------- onglet « Formulaire »
const BASE_FIELDS = ['Vous êtes (syndic, agence, assureur, entreprise, particulier)', 'Société, fonction, ville (pour les professionnels)', 'Nom et prénom', 'Téléphone', 'E-mail (le code y est envoyé)', 'Acceptation des conditions'];

function QuestionEditor({
  question,
  index,
  count,
  onChange,
  onMove,
  onRemove,
}: {
  readonly question: OfferQuestion;
  readonly index: number;
  readonly count: number;
  readonly onChange: (q: OfferQuestion) => void;
  readonly onMove: (delta: -1 | 1) => void;
  readonly onRemove: () => void;
}) {
  const Icon = TYPE_ICONS[question.type];
  const typeLabel = QUESTION_TYPES.find((t) => t.type === question.type)?.label ?? '';
  const id = `qe-${question.id}`;
  const iconBtn = 'grid h-9 w-9 cursor-pointer place-items-center rounded-lg text-[#0B2A3C]/55 transition hover:bg-[#F0F9FC] hover:text-[#0E6BA8] disabled:cursor-not-allowed disabled:opacity-30';
  return (
    <li className="rounded-2xl bg-[#FFFFFF] p-4 ring-1 ring-[#0B2A3C]/[0.08]">
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[#FFFFFF]" style={{ backgroundImage: SEA }}>
          <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
        </span>
        <span className="flex-1 text-[13px] font-semibold uppercase tracking-[0.1em] text-[#1391B8]">
          Question {index + 1} · {typeLabel}
        </span>
        <button type="button" className={iconBtn} onClick={() => onMove(-1)} disabled={index === 0} aria-label="Monter la question">
          <ArrowUp className="h-4 w-4" aria-hidden="true" />
        </button>
        <button type="button" className={iconBtn} onClick={() => onMove(1)} disabled={index === count - 1} aria-label="Descendre la question">
          <ArrowDown className="h-4 w-4" aria-hidden="true" />
        </button>
        <button type="button" className={`${iconBtn} hover:!bg-[#FDECEA] hover:!text-[#C0392B]`} onClick={onRemove} aria-label="Supprimer la question">
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <label htmlFor={id} className="sr-only">
        Intitulé de la question {index + 1}
      </label>
      <input
        id={id}
        className={`${INPUT} border-[#0B2A3C]/15`}
        placeholder="Intitulé de la question (ex. Nombre de lots gérés)"
        value={question.label}
        onChange={(e) => onChange({ ...question, label: e.target.value })}
      />

      {hasOptions(question.type) && (
        <div className="mt-3">
          <p className="text-[13px] font-semibold text-[#0B2A3C]/65">Choix proposés</p>
          <ul className="mt-1.5 flex flex-col gap-2">
            {question.options.map((option, i) => (
              <li key={i} className="flex items-center gap-2">
                {question.type === 'choix' ? <CircleDot className="h-4 w-4 shrink-0 text-[#0B2A3C]/35" aria-hidden="true" /> : <CheckSquare className="h-4 w-4 shrink-0 text-[#0B2A3C]/35" aria-hidden="true" />}
                <input
                  aria-label={`Choix ${i + 1}`}
                  className="h-10 min-w-0 flex-1 rounded-lg border border-[#0B2A3C]/12 bg-[#F8FBFC] px-3 text-[15px] focus:border-[#1391B8] focus:bg-[#FFFFFF] focus:outline-none"
                  value={option}
                  onChange={(e) => onChange({ ...question, options: question.options.map((o, j) => (j === i ? e.target.value.replace(/,/g, '') : o)) })}
                />
                <button
                  type="button"
                  aria-label={`Retirer le choix ${i + 1}`}
                  disabled={question.options.length <= 2}
                  onClick={() => onChange({ ...question, options: question.options.filter((_, j) => j !== i) })}
                  className={iconBtn}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
          {question.options.length < MAX_OPTIONS && (
            <button type="button" onClick={() => onChange({ ...question, options: [...question.options, `Choix ${question.options.length + 1}`] })} className="mt-2 inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-3 text-[14px] font-semibold text-[#0E6BA8] hover:bg-[#F0F9FC]">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Ajouter un choix
            </button>
          )}
        </div>
      )}

      <label className="mt-3 inline-flex cursor-pointer items-center gap-2.5 text-[14px] font-medium text-[#0B2A3C]/75">
        <input type="checkbox" checked={question.required} onChange={(e) => onChange({ ...question, required: e.target.checked })} className="h-[18px] w-[18px] accent-[#0E6BA8]" />
        Réponse obligatoire
      </label>
    </li>
  );
}

function FormBuilder({ questions, error, onChange }: { readonly questions: readonly OfferQuestion[]; readonly error?: string; readonly onChange: (q: OfferQuestion[]) => void }) {
  const [picking, setPicking] = useState(questions.length === 0);
  const move = (i: number, delta: -1 | 1) => {
    const next = [...questions];
    [next[i], next[i + delta]] = [next[i + delta], next[i]];
    onChange(next);
  };
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl bg-[#F5FAFC] p-4">
        <p className="flex items-center gap-2 text-[14px] font-bold text-[#0B2A3C]/80">
          <Lock className="h-4 w-4 text-[#0B2A3C]/45" aria-hidden="true" />
          Toujours présents (nécessaires pour créer et envoyer le code)
        </p>
        <ul className="mt-2.5 flex flex-wrap gap-1.5">
          {BASE_FIELDS.map((f) => (
            <li key={f} className="rounded-full bg-[#FFFFFF] px-3 py-1 text-[13px] text-[#0B2A3C]/65 ring-1 ring-[#0B2A3C]/[0.07]">
              {f}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-[15px] font-bold">Vos questions en plus</p>
        <p className="text-[13.5px] text-[#0B2A3C]/55">
          Elles s’affichent sous l’e-mail. Les réponses arrivent dans l’e-mail, dans « Inscrits » et dans l’export Excel. {MAX_QUESTIONS} questions au maximum.
        </p>
        {error && (
          <p role="alert" className="mt-2 rounded-xl bg-[#FDECEA] px-3.5 py-2.5 text-[13.5px] font-medium text-[#A8321F]">
            {error}
          </p>
        )}
        {questions.length > 0 && (
          <ul className="mt-3 flex flex-col gap-3">
            {questions.map((q, i) => (
              <QuestionEditor
                key={q.id}
                question={q}
                index={i}
                count={questions.length}
                onChange={(updated) => onChange(questions.map((x) => (x.id === q.id ? updated : x)))}
                onMove={(delta) => move(i, delta)}
                onRemove={() => onChange(questions.filter((x) => x.id !== q.id))}
              />
            ))}
          </ul>
        )}

        {questions.length < MAX_QUESTIONS &&
          (picking ? (
            <div className="mt-3 rounded-2xl border-2 border-dashed border-[#1391B8]/35 p-3">
              <p className="px-1 text-[13.5px] font-semibold text-[#0B2A3C]/70">Quel type de question ?</p>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {QUESTION_TYPES.map((t) => {
                  const Icon = TYPE_ICONS[t.type];
                  return (
                    <button
                      key={t.type}
                      type="button"
                      onClick={() => {
                        onChange([...questions, newQuestion(t.type, questions)]);
                        setPicking(false);
                      }}
                      className="flex cursor-pointer flex-col items-start gap-1.5 rounded-xl bg-[#FFFFFF] p-3 text-left ring-1 ring-[#0B2A3C]/[0.08] transition hover:-translate-y-0.5 hover:ring-[#1391B8]/50"
                    >
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#E9F6F8] text-[#0E6BA8]">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="text-[14px] font-bold leading-tight">{t.label}</span>
                      <span className="text-[12px] leading-snug text-[#0B2A3C]/55">{t.hint}</span>
                    </button>
                  );
                })}
              </div>
              {questions.length > 0 && (
                <button type="button" onClick={() => setPicking(false)} className="mt-2 h-9 cursor-pointer rounded-full px-3 text-[13.5px] font-semibold text-[#0B2A3C]/60 hover:text-[#0E6BA8]">
                  Annuler
                </button>
              )}
            </div>
          ) : (
            <button type="button" onClick={() => setPicking(true)} className="mt-3 inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#1391B8]/40 text-[15px] font-semibold text-[#0E6BA8] transition hover:bg-[#F0F9FC]">
              <Plus className="h-4 w-4" strokeWidth={2.6} aria-hidden="true" />
              Ajouter une question
            </button>
          ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- aperçu téléphone
function PhonePreview({ offer }: { readonly offer: OfferConfig }) {
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin === window.location.origin && e.source === frameRef.current?.contentWindow && (e.data as { type?: unknown })?.type === PREVIEW_READY) setReady(true);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  useEffect(() => {
    if (!ready) return;
    frameRef.current?.contentWindow?.postMessage({ type: PREVIEW_UPDATE, offre: serializeOffer(offer) }, window.location.origin);
  }, [ready, offer]);

  return (
    <div className="flex flex-col items-center">
      <p className="mb-3 flex items-center gap-1.5 text-[13px] font-semibold text-[#0B2A3C]/55">
        <Smartphone className="h-4 w-4" aria-hidden="true" />
        Aperçu sur téléphone (rien n’est envoyé)
      </p>
      <div className="rounded-[44px] bg-[#0B2A3C] p-3 shadow-[0_30px_60px_-25px_rgba(11,42,60,0.6)]">
        <iframe ref={frameRef} title="Aperçu de la page de l’offre" src="/offre?apercu=1" className="block h-[700px] w-[360px] rounded-[34px] bg-[#FFFFFF]" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- éditeur complet
export function OfferEditor({
  initial,
  isNew,
  existingSlugs,
  onClose,
  onSaved,
}: {
  readonly initial: OfferConfig;
  readonly isNew: boolean;
  readonly existingSlugs: readonly string[];
  readonly onClose: () => void;
  readonly onSaved: (offer: OfferConfig) => void;
}) {
  const [offer, setOffer] = useState<OfferConfig>(initial);
  const [conditionsText, setConditionsText] = useState(initial.conditions.join('\n'));
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [errors, setErrors] = useState<OfferErrors>({});
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState<ApiFailure | null>(null);
  const [tab, setTab] = useState<Tab>('offre');

  // Offre telle qu'elle sera enregistrée (conditions lues dans la zone de texte).
  const current: OfferConfig = { ...offer, conditions: conditionsText.split('\n').map((c) => c.trim()).filter(Boolean) };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  const change = (patch: Partial<OfferConfig>, fromName = false) => {
    if ('slug' in patch) setSlugTouched(true);
    setOffer((o) => ({ ...o, ...patch, ...(fromName && !slugTouched ? { slug: slugify(patch.name ?? '') } : {}) }));
  };

  const submit = async () => {
    const found = validateOffer(current, existingSlugs, isNew);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setTab(found.questions && Object.keys(found).length === 1 ? 'formulaire' : 'offre');
      return;
    }
    setSaving(true);
    setFailure(null);
    const r = await saveOffer(current, isNew);
    setSaving(false);
    if (r.ok) onSaved(r.data);
    else setFailure(r.reason);
  };

  const TABS: readonly { id: Tab; label: string; mobileOnly?: boolean }[] = [
    { id: 'offre', label: 'Offre' },
    { id: 'formulaire', label: `Formulaire${offer.questions.length ? ` (${offer.questions.length})` : ''}` },
    { id: 'apercu', label: 'Aperçu', mobileOnly: true },
  ];

  return (
    <div role="dialog" aria-modal="true" aria-label={isNew ? 'Nouvelle offre' : 'Modifier l’offre'} className="fixed inset-0 z-50 flex flex-col bg-[#F3F8FA]">
      {/* Barre du haut */}
      <div className="flex items-center justify-between gap-3 border-b border-[#0B2A3C]/[0.07] bg-[#FFFFFF] px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="text-[12.5px] font-semibold uppercase tracking-[0.12em] text-[#1391B8]">{isNew ? 'Nouvelle offre' : 'Modifier l’offre'}</p>
          <p className="truncate font-display text-[18px] font-bold">{offer.name.trim() || 'Sans nom'}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={onClose} className="h-10 cursor-pointer rounded-full border border-[#0B2A3C]/15 px-4 text-[14.5px] font-semibold hover:border-[#1391B8]">
            Annuler
          </button>
          <button type="button" onClick={() => void submit()} disabled={saving} className="h-10 cursor-pointer rounded-full px-5 text-[14.5px] font-semibold text-[#FFFFFF] shadow-[0_12px_26px_-12px_rgba(14,107,168,0.9)] transition hover:brightness-110 disabled:opacity-60" style={{ backgroundImage: SEA }}>
            {saving ? 'Enregistrement…' : isNew ? 'Créer l’offre' : 'Enregistrer'}
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Colonne réglages */}
        <div className="flex min-h-0 w-full flex-col lg:w-[560px] lg:shrink-0 lg:border-r lg:border-[#0B2A3C]/[0.07]">
          <div className="flex gap-1.5 px-4 pt-4 sm:px-6" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`h-9 cursor-pointer rounded-full px-4 text-[14px] font-semibold transition ${t.mobileOnly ? 'lg:hidden' : ''} ${tab === t.id ? 'bg-[#0B2A3C] text-[#FFFFFF]' : 'bg-[#FFFFFF] text-[#0B2A3C]/70 ring-1 ring-[#0B2A3C]/[0.08] hover:text-[#0E6BA8]'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-10 pt-4 sm:px-6">
            {failure && (
              <p role="alert" className="mb-4 rounded-xl bg-[#FDECEA] px-4 py-3 text-[14px] font-medium text-[#A8321F]">
                {failureMessage(failure)}
              </p>
            )}
            {Object.keys(errors).length > 0 && (
              <p role="alert" className="mb-4 rounded-xl bg-[#FFF4DC] px-4 py-3 text-[14px] font-medium text-[#7A4F00]">
                Certaines informations sont à corriger
                {errors.questions && tab !== 'formulaire' ? ' (voir aussi l’onglet Formulaire)' : ''}.
              </p>
            )}
            {tab === 'offre' && (
              <OfferSettings
                offer={offer}
                isNew={isNew}
                errors={errors}
                conditionsText={conditionsText}
                onConditionsText={setConditionsText}
                onChange={change}
              />
            )}
            {tab === 'formulaire' && <FormBuilder questions={offer.questions} error={errors.questions} onChange={(questions) => change({ questions })} />}
            {tab === 'apercu' && (
              <div className="lg:hidden">
                <PhonePreview offer={current} />
              </div>
            )}
          </div>
        </div>

        {/* Aperçu (ordinateur) */}
        <div className="hidden min-h-0 flex-1 items-start justify-center overflow-y-auto py-6 lg:flex">
          <PhonePreview offer={current} />
        </div>
      </div>
    </div>
  );
}
