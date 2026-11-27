/**
 * Questions personnalisées d'une offre (constructeur de formulaire de l'espace /gestion).
 * Le serveur (public/api/_offres.php et demande.php) applique les mêmes règles.
 */

export type QuestionType = 'texte' | 'paragraphe' | 'choix' | 'cases' | 'oui_non' | 'nombre' | 'date';

export interface OfferQuestion {
  /** Identifiant stable (« q » + lettres/chiffres). */
  readonly id: string;
  readonly label: string;
  readonly type: QuestionType;
  readonly required: boolean;
  /** Choix proposés (types « choix » et « cases »). */
  readonly options: readonly string[];
}

export type Answer = string | readonly string[];
export type Answers = Readonly<Record<string, Answer>>;

export const MAX_QUESTIONS = 10;
export const MAX_OPTIONS = 12;

export const QUESTION_TYPES: readonly { readonly type: QuestionType; readonly label: string; readonly hint: string }[] = [
  { type: 'texte', label: 'Réponse courte', hint: 'Une ligne de texte' },
  { type: 'paragraphe', label: 'Réponse longue', hint: 'Plusieurs lignes' },
  { type: 'choix', label: 'Un seul choix', hint: 'Le client choisit une réponse' },
  { type: 'cases', label: 'Plusieurs choix', hint: 'Le client coche une ou plusieurs réponses' },
  { type: 'oui_non', label: 'Oui / Non', hint: 'Deux boutons' },
  { type: 'nombre', label: 'Nombre', hint: 'Ex. nombre de lots gérés' },
  { type: 'date', label: 'Date', hint: 'Ex. date souhaitée' },
];

/** Libellés déjà utilisés par le formulaire de base (interdits pour une question). */
export const RESERVED_LABELS: readonly string[] = ['offre', 'vous êtes', 'société', 'fonction', 'nom', 'téléphone', 'e-mail', 'ville'];

export function hasOptions(type: QuestionType): boolean {
  return type === 'choix' || type === 'cases';
}

export function newQuestionId(existing: readonly OfferQuestion[]): string {
  for (let n = existing.length + 1; ; n++) {
    const id = `q${n}`;
    if (!existing.some((q) => q.id === id)) return id;
  }
}

export function newQuestion(type: QuestionType, existing: readonly OfferQuestion[]): OfferQuestion {
  return {
    id: newQuestionId(existing),
    label: '',
    type,
    required: false,
    options: hasOptions(type) ? ['Choix 1', 'Choix 2'] : [],
  };
}

/** Erreur sur la définition des questions (constructeur), ou null si tout va bien. */
export function validateQuestions(questions: readonly OfferQuestion[]): string | null {
  if (questions.length > MAX_QUESTIONS) return `${MAX_QUESTIONS} questions au maximum.`;
  const seen = new Set<string>();
  for (const q of questions) {
    const label = q.label.trim();
    if (label.length < 2) return 'Chaque question doit avoir un intitulé.';
    if (label.length > 80) return `Intitulé trop long : « ${label.slice(0, 30)}… » (80 caractères au maximum).`;
    const key = label.toLowerCase();
    if (RESERVED_LABELS.includes(key)) return `« ${label} » existe déjà dans le formulaire de base.`;
    if (seen.has(key)) return `Deux questions ont le même intitulé : « ${label} ».`;
    seen.add(key);
    if (hasOptions(q.type)) {
      const opts = q.options.map((o) => o.trim()).filter(Boolean);
      if (opts.length < 2) return `« ${label} » : ajoutez au moins 2 choix.`;
      if (opts.length > MAX_OPTIONS) return `« ${label} » : ${MAX_OPTIONS} choix au maximum.`;
      if (new Set(opts.map((o) => o.toLowerCase())).size !== opts.length) return `« ${label} » : deux choix identiques.`;
      if (opts.some((o) => o.includes(',') || o.length > 60)) return `« ${label} » : un choix ne doit pas contenir de virgule ni dépasser 60 caractères.`;
    }
  }
  return null;
}

function isEmpty(a: Answer | undefined): boolean {
  return a === undefined || (Array.isArray(a) ? a.length === 0 : String(a).trim() === '');
}

/** Erreurs de réponses (page d'inscription), par identifiant de question. */
export function validateAnswers(questions: readonly OfferQuestion[], answers: Answers): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const q of questions) {
    const a = answers[q.id];
    if (isEmpty(a)) {
      if (q.required) errors[q.id] = q.type === 'cases' ? 'Cochez au moins une réponse.' : 'Merci de répondre à cette question.';
      continue;
    }
    if (q.type === 'nombre' && !/^-?\d+(?:[.,]\d+)?$/.test(String(a).trim())) errors[q.id] = 'Indiquez un nombre.';
  }
  return errors;
}

/** Réponse telle qu'envoyée au serveur et dans l'e-mail. */
export function formatAnswer(q: OfferQuestion, a: Answer | undefined): string {
  if (isEmpty(a)) return '—';
  if (Array.isArray(a)) return a.join(', ');
  const v = String(a).trim();
  if (q.type === 'date') {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
    return m ? `${m[3]}/${m[2]}/${m[1]}` : v;
  }
  return v;
}

interface RawQuestion {
  id?: unknown;
  libelle?: unknown;
  type?: unknown;
  obligatoire?: unknown;
  options?: unknown;
}

const TYPES = new Set<QuestionType>(['texte', 'paragraphe', 'choix', 'cases', 'oui_non', 'nombre', 'date']);

export function parseQuestions(raw: unknown): OfferQuestion[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((r: RawQuestion) => {
    if (typeof r?.id !== 'string' || typeof r.libelle !== 'string' || !TYPES.has(r.type as QuestionType)) return [];
    return [
      {
        id: r.id,
        label: r.libelle,
        type: r.type as QuestionType,
        required: r.obligatoire === true,
        options: Array.isArray(r.options) ? r.options.filter((o): o is string => typeof o === 'string') : [],
      },
    ];
  });
}

export function serializeQuestions(questions: readonly OfferQuestion[]): Record<string, unknown>[] {
  return questions.map((q) => ({
    id: q.id,
    libelle: q.label.trim(),
    type: q.type,
    obligatoire: q.required,
    options: hasOptions(q.type) ? q.options.map((o) => o.trim()).filter(Boolean) : [],
  }));
}
