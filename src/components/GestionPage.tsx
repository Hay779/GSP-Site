import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Building2,
  CalendarClock,
  Check,
  CheckCircle2,
  Download,
  Eye,
  EyeOff,
  Inbox,
  Lock,
  LogOut,
  Mail,
  Megaphone,
  Phone,
  RefreshCw,
  Repeat,
  Search,
  QrCode,
  Ticket,
  Undo2,
  Users,
} from 'lucide-react';
import type { BrandConfig } from '../utils/navigation';
import { hrefForHome, type RouterMode } from '../utils/router';
import {
  failureMessage,
  fetchSession,
  fetchSignups,
  formatDateTime,
  login,
  logout,
  matchesSearch,
  setSignupUsed,
  signupStatus,
  signupsToCsv,
  extraAnswers,
  STATUS_LABELS,
  type ApiFailure,
  type OfferSignup,
  type SignupStatus,
} from '../utils/gestion';
import { fetchOffers } from '../utils/gestion';
import { DEFAULT_SLUG, type OfferConfig } from '../utils/offers';
import { OffersPanel } from './gestion/OffersPanel';
import { RequestsPanel } from './gestion/RequestsPanel';
import { RelancesPanel } from './gestion/RelancesPanel';
import { fetchRelancesDone, type RelanceDone } from '../utils/gestion';
import { computeRelances } from '../utils/relances';
import { fetchRequests, type SiteRequest } from '../utils/gestion';
import logoUrl from '../assets/images/logo_republique_light.png';

/* Même univers que la page /offre : bleu mer, turquoise, vert d'eau. */
const SEA = 'linear-gradient(120deg,#0E6BA8 0%,#1391B8 50%,#17B3A3 100%)';
const INK = '#0B2A3C';

const STATUS_STYLE: Readonly<Record<SignupStatus, string>> = {
  valide: 'bg-[#E4F7F3] text-[#0F7A6D]',
  bientot: 'bg-[#FFF4DC] text-[#9A6400]',
  perime: 'bg-[#F1F3F5] text-[#5B6770]',
  utilise: 'bg-[#E6F1FA] text-[#0E6BA8]',
};

type Filter = 'tous' | 'actifs' | 'bientot' | 'utilise' | 'perime';
const FILTERS: readonly { readonly id: Filter; readonly label: string }[] = [
  { id: 'tous', label: 'Tous' },
  { id: 'actifs', label: 'Valides' },
  { id: 'bientot', label: 'Expirent bientôt' },
  { id: 'utilise', label: 'Utilisés' },
  { id: 'perime', label: 'Périmés' },
];

/** Rubriques de l'espace (celles « Bientôt » restent à construire). */
type SectionId = 'offres' | 'inscrits' | 'demandes' | 'relances' | 'publicite' | 'suivi';
const SECTIONS: readonly { readonly id: SectionId; readonly label: string; readonly icon: typeof Ticket; readonly ready: boolean }[] = [
  { id: 'demandes', label: 'Demandes', icon: Inbox, ready: true },
  { id: 'offres', label: 'Offres & QR codes', icon: QrCode, ready: true },
  { id: 'inscrits', label: 'Inscrits', icon: Users, ready: true },
  { id: 'relances', label: 'Relances', icon: Repeat, ready: true },
  { id: 'publicite', label: 'Publicité', icon: Megaphone, ready: false },
  { id: 'suivi', label: 'Suivi du site', icon: BarChart3, ready: false },
];

function Logo({ routerMode, className = '' }: { readonly routerMode: RouterMode; readonly className?: string }) {
  return (
    <a href={hrefForHome(routerMode)} className="shrink-0 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1391B8]">
      <img src={logoUrl} alt="Serrurerie de la République" width={580} height={371} className={`w-auto ${className}`} />
    </a>
  );
}

// ---------------------------------------------------------------- connexion
function LoginScreen({ routerMode, onConnected }: { readonly routerMode: RouterMode; readonly onConnected: () => void }) {
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<ApiFailure | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending || !password) return;
    setSending(true);
    setError(null);
    const r = await login(password);
    setSending(false);
    if (r.ok) {
      setPassword('');
      onConnected();
    } else {
      setError(r.reason);
    }
  };

  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#E6F4FA_0%,#E4F7F3_100%)] px-4 py-12">
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#7FD3E6]/35 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-[#7FE0C9]/35 blur-3xl" />
      <div className="relative w-full max-w-[420px] rounded-[28px] bg-[#FFFFFF] p-7 shadow-[0_30px_80px_-30px_rgba(14,107,168,0.45),0_8px_24px_-12px_rgba(11,42,60,0.15)] sm:p-9">
        <div className="flex justify-center">
          <Logo routerMode={routerMode} className="h-[68px]" />
        </div>
        <h1 className="mt-6 text-center font-display text-[24px] font-bold tracking-[-0.02em]">Espace gestion</h1>
        <p className="mt-1 text-center text-[14.5px] text-[#0B2A3C]/60">Accès réservé à l’équipe.</p>
        <form onSubmit={submit} className="mt-7 flex flex-col gap-4">
          <div>
            <label htmlFor="g-mdp" className="text-[14px] font-semibold text-[#0B2A3C]/80">
              Mot de passe
            </label>
            <div className="relative mt-1.5">
              <input
                id="g-mdp"
                type={visible ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'g-mdp-err' : undefined}
                className={`h-12 w-full rounded-xl border bg-[#FFFFFF] pl-4 pr-12 text-[16px] focus:border-[#1391B8] focus:outline-none focus:ring-4 focus:ring-[#1391B8]/15 ${error ? 'border-[#C0392B]' : 'border-[#0B2A3C]/15'}`}
              />
              <button type="button" onClick={() => setVisible((v) => !v)} aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'} className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 cursor-pointer place-items-center rounded-lg text-[#0B2A3C]/50 hover:bg-[#F0F9FC] hover:text-[#0E6BA8]">
                {visible ? <EyeOff className="h-[18px] w-[18px]" aria-hidden="true" /> : <Eye className="h-[18px] w-[18px]" aria-hidden="true" />}
              </button>
            </div>
            {error && (
              <p id="g-mdp-err" role="alert" className="mt-1.5 text-[13.5px] font-medium text-[#C0392B]">
                {failureMessage(error)}
              </p>
            )}
          </div>
          <button type="submit" disabled={sending || !password} className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full text-[16px] font-semibold text-[#FFFFFF] shadow-[0_14px_30px_-14px_rgba(14,107,168,0.9)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60" style={{ backgroundImage: SEA }}>
            <Lock className="h-4 w-4" aria-hidden="true" />
            {sending ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- tableau de bord
function StatCard({ icon: Icon, label, value, tone }: { readonly icon: typeof Users; readonly label: string; readonly value: number; readonly tone: string }) {
  return (
    <div className="rounded-2xl bg-[#FFFFFF] p-4 shadow-[0_10px_30px_-20px_rgba(11,42,60,0.45)] ring-1 ring-[#0B2A3C]/[0.06] sm:p-5">
      <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <p className="mt-3 font-display text-[28px] font-bold leading-none tabular-nums">{value}</p>
      <p className="mt-1.5 text-[13.5px] text-[#0B2A3C]/60">{label}</p>
    </div>
  );
}

function field(s: OfferSignup, key: string): string {
  const v = s.fields[key];
  return v && v !== '—' ? v : '';
}

function SignupCard({ signup, offerName, busy, onToggle }: { readonly signup: OfferSignup; readonly offerName: string; readonly busy: boolean; readonly onToggle: () => void }) {
  const status = signupStatus(signup);
  const company = field(signup, 'Société');
  const role = field(signup, 'Fonction');
  const city = field(signup, 'Ville');
  const extras = extraAnswers(signup);
  const phone = field(signup, 'Téléphone');
  const email = field(signup, 'E-mail');
  return (
    <li className="rounded-2xl bg-[#FFFFFF] p-4 shadow-[0_10px_30px_-22px_rgba(11,42,60,0.5)] ring-1 ring-[#0B2A3C]/[0.06] sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-mono text-[16px] font-bold tracking-[0.02em]">{signup.reference}</p>
            <span className={`rounded-full px-2.5 py-0.5 text-[12.5px] font-semibold ${STATUS_STYLE[status]}`}>{STATUS_LABELS[status]}</span>
            <span className="inline-flex max-w-full items-center gap-1 truncate rounded-full bg-[#F0F9FC] px-2.5 py-0.5 text-[12.5px] font-semibold text-[#0E6BA8]">
              <Ticket className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {offerName}
            </span>
          </div>
          <p className="mt-1 text-[13.5px] text-[#0B2A3C]/55">
            Inscrit le {formatDateTime(signup.receivedAt)} · valable jusqu’au {signup.validUntil || '—'}
            {signup.usedAt ? ` · utilisé le ${formatDateTime(signup.usedAt)}` : ''}
          </p>
        </div>
        {status === 'utilise' ? (
          <button type="button" onClick={onToggle} disabled={busy} className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full border border-[#0B2A3C]/15 px-4 text-[14px] font-semibold text-[#0B2A3C]/75 transition hover:border-[#1391B8] hover:text-[#0E6BA8] disabled:opacity-60">
            <Undo2 className="h-4 w-4" aria-hidden="true" />
            Annuler
          </button>
        ) : status === 'perime' ? null : (
          <button type="button" onClick={onToggle} disabled={busy} className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full px-4 text-[14px] font-semibold text-[#FFFFFF] shadow-[0_10px_22px_-12px_rgba(14,107,168,0.9)] transition hover:brightness-110 disabled:opacity-60" style={{ backgroundImage: SEA }}>
            <Check className="h-4 w-4" strokeWidth={2.6} aria-hidden="true" />
            {busy ? 'Enregistrement…' : 'Marquer utilisé'}
          </button>
        )}
      </div>

      <div className="mt-4 grid gap-3 border-t border-[#0B2A3C]/[0.07] pt-4 sm:grid-cols-[1.2fr_1fr]">
        <div className="min-w-0">
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#1391B8]">{signup.fields['Vous êtes'] ?? '—'}</p>
          {company && (
            <p className="mt-1 flex items-center gap-1.5 text-[15.5px] font-semibold">
              <Building2 className="h-4 w-4 shrink-0 text-[#0B2A3C]/40" aria-hidden="true" />
              <span className="truncate">{company}</span>
            </p>
          )}
          <p className={`${company ? 'mt-0.5 text-[14.5px] text-[#0B2A3C]/75' : 'mt-1 text-[15.5px] font-semibold'}`}>
            {field(signup, 'Nom') || '—'}
            {role ? <span className="text-[#0B2A3C]/55"> · {role}</span> : null}
            {city ? <span className="text-[#0B2A3C]/55"> · {city}</span> : null}
          </p>
        </div>
        <div className="flex flex-col gap-1.5 text-[14.5px] sm:items-end">
          {phone && (
            <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="inline-flex items-center gap-2 font-semibold tabular-nums text-[#0E6BA8] hover:underline">
              <Phone className="h-4 w-4" aria-hidden="true" />
              {phone}
            </a>
          )}
          {email && (
            <a href={`mailto:${email}`} className="inline-flex min-w-0 items-center gap-2 text-[#0B2A3C]/70 hover:text-[#0E6BA8]">
              <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{email}</span>
            </a>
          )}
        </div>
      </div>
      {extras.length > 0 && (
        <dl className="mt-4 grid gap-x-4 gap-y-2 rounded-xl bg-[#F5FAFC] p-3.5 text-[14px] sm:grid-cols-2">
          {extras.map(([label, value]) => (
            <div key={label} className="min-w-0">
              <dt className="text-[12.5px] font-semibold text-[#0B2A3C]/55">{label}</dt>
              <dd className="break-words font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </li>
  );
}

function Dashboard({ routerMode, onLoggedOut }: { readonly routerMode: RouterMode; readonly onLoggedOut: () => void }) {
  const [signups, setSignups] = useState<OfferSignup[] | null>(null);
  const [error, setError] = useState<ApiFailure | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('tous');
  const [busyRef, setBusyRef] = useState<string | null>(null);
  const [section, setSection] = useState<SectionId>('demandes');
  const [offers, setOffers] = useState<OfferConfig[] | null>(null);
  const [offerFilter, setOfferFilter] = useState<string>('toutes');
  const [requests, setRequests] = useState<SiteRequest[] | null>(null);
  const newRequests = (requests ?? []).filter((x) => x.status === 'nouvelle').length;
  const [relancesDone, setRelancesDone] = useState<Record<string, RelanceDone> | null>(null);
  const relanceCount = useMemo(
    () => (requests && signups && relancesDone ? computeRelances(requests, signups, relancesDone).length : 0),
    [requests, signups, relancesDone]
  );

  const load = useCallback(async () => {
    setError(null);
    const [r, o, d, rl] = await Promise.all([fetchSignups(), fetchOffers(), fetchRequests(), fetchRelancesDone()]);
    if (!r.ok && r.reason === 'non_connecte') return onLoggedOut();
    if (r.ok) setSignups(r.data);
    else setError(r.reason);
    if (o.ok) setOffers(o.data);
    else if (r.ok) setError(o.reason);
    if (d.ok) setRequests(d.data);
    else if (r.ok && o.ok) setError(d.reason);
    if (rl.ok) setRelancesDone(rl.data);
    else if (r.ok && o.ok && d.ok) setError(rl.reason);
  }, [onLoggedOut]);

  useEffect(() => {
    void load();
  }, [load]);

  const counts = useMemo(() => {
    const c = { total: 0, actifs: 0, bientot: 0, utilise: 0 };
    for (const s of signups ?? []) {
      if (offerFilter !== 'toutes' && s.offer !== offerFilter) continue;
      const st = signupStatus(s);
      c.total += 1;
      if (st === 'valide' || st === 'bientot') c.actifs += 1;
      if (st === 'bientot') c.bientot += 1;
      if (st === 'utilise') c.utilise += 1;
    }
    return c;
  }, [signups, offerFilter]);

  const visible = useMemo(
    () =>
      (signups ?? []).filter((s) => {
        if (offerFilter !== 'toutes' && s.offer !== offerFilter) return false;
        if (!matchesSearch(s, query)) return false;
        const st = signupStatus(s);
        if (filter === 'actifs') return st === 'valide' || st === 'bientot';
        if (filter === 'tous') return true;
        return st === filter;
      }),
    [signups, query, filter, offerFilter]
  );

  const toggle = async (s: OfferSignup) => {
    setBusyRef(s.reference);
    const r = await setSignupUsed(s.reference, !s.usedAt);
    setBusyRef(null);
    if (r.ok) {
      setSignups((list) => (list ?? []).map((x) => (x.reference === s.reference ? { ...x, usedAt: r.data } : x)));
    } else if (r.reason === 'non_connecte') {
      onLoggedOut();
    } else {
      setError(r.reason);
    }
  };

  const exportCsv = () => {
    const blob = new Blob([signupsToCsv(visible)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inscriptions-offre-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const signOut = async () => {
    await logout();
    onLoggedOut();
  };

  return (
    <div className="flex flex-1 flex-col bg-[#F3F8FA]">
      {/* Barre du haut */}
      <header className="sticky top-0 z-20 border-b border-[#0B2A3C]/[0.07] bg-[#FFFFFF]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo routerMode={routerMode} className="h-[44px]" />
            <span className="hidden h-8 w-px bg-[#0B2A3C]/10 sm:block" aria-hidden="true" />
            <span className="hidden font-display text-[16px] font-bold sm:block">Espace gestion</span>
          </div>
          <button type="button" onClick={signOut} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-[#0B2A3C]/12 px-4 text-[14px] font-semibold text-[#0B2A3C]/75 transition hover:border-[#1391B8] hover:text-[#0E6BA8]">
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
        {/* Rubriques */}
        <nav aria-label="Rubriques" className="mx-auto max-w-[1180px] overflow-x-auto px-4 sm:px-6">
          <ul className="flex gap-1.5 pb-2.5">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                {s.ready ? (
                  <button
                    type="button"
                    onClick={() => setSection(s.id)}
                    aria-current={section === s.id ? 'page' : undefined}
                    className={`inline-flex h-9 cursor-pointer items-center gap-2 whitespace-nowrap rounded-full px-3.5 text-[14px] font-semibold transition ${section === s.id ? 'text-[#FFFFFF] shadow-[0_8px_18px_-10px_rgba(14,107,168,0.9)]' : 'text-[#0B2A3C]/70 hover:bg-[#F0F9FC] hover:text-[#0E6BA8]'}`}
                    style={section === s.id ? { backgroundImage: SEA } : undefined}
                  >
                    <s.icon className="h-4 w-4" aria-hidden="true" />
                    {s.label}
                    {s.id === 'relances' && relanceCount > 0 && (
                      <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#D98A1E] px-1.5 text-[11.5px] font-bold text-[#FFFFFF]" aria-label={`${relanceCount} à relancer`}>
                        {relanceCount}
                      </span>
                    )}
                    {s.id === 'demandes' && newRequests > 0 && (
                      <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#C0392B] px-1.5 text-[11.5px] font-bold text-[#FFFFFF]" aria-label={`${newRequests} nouvelles`}>
                        {newRequests}
                      </span>
                    )}
                  </button>
                ) : (
                  <span className="inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-full px-3.5 text-[14px] font-semibold text-[#0B2A3C]/35">
                    <s.icon className="h-4 w-4" aria-hidden="true" />
                    {s.label}
                    <span className="rounded-full bg-[#0B2A3C]/[0.06] px-2 py-0.5 text-[11px] font-semibold">Bientôt</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <div className="mx-auto w-full max-w-[1180px] flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {section === 'relances' ? (
          <>
            {error && (
              <p role="alert" className="mb-5 rounded-xl bg-[#FDECEA] px-4 py-3 text-[14.5px] font-medium text-[#A8321F]">
                {failureMessage(error)}
              </p>
            )}
            <RelancesPanel
              requests={requests}
              signups={signups}
              done={relancesDone}
              onDoneChange={setRelancesDone}
              onReload={() => void load()}
              onError={(reason) => (reason === 'non_connecte' ? onLoggedOut() : setError(reason))}
            />
          </>
        ) : section === 'demandes' ? (
          <>
            {error && (
              <p role="alert" className="mb-5 rounded-xl bg-[#FDECEA] px-4 py-3 text-[14.5px] font-medium text-[#A8321F]">
                {failureMessage(error)}
              </p>
            )}
            <RequestsPanel
              requests={requests}
              onRequestsChange={setRequests}
              onReload={() => void load()}
              onError={(reason) => (reason === 'non_connecte' ? onLoggedOut() : setError(reason))}
            />
          </>
        ) : section === 'offres' ? (
          <>
            {error && (
              <p role="alert" className="mb-5 rounded-xl bg-[#FDECEA] px-4 py-3 text-[14.5px] font-medium text-[#A8321F]">
                {failureMessage(error)}
              </p>
            )}
            <OffersPanel
              offers={offers}
              signups={signups ?? []}
              onOffersChange={setOffers}
              onShowSignups={(slug) => {
                setOfferFilter(slug);
                setSection('inscrits');
              }}
              onError={(reason) => (reason === 'non_connecte' ? onLoggedOut() : setError(reason))}
            />
          </>
        ) : (
        <>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-[26px] font-bold tracking-[-0.02em] sm:text-[30px]">Inscrits aux offres</h1>
            <p className="mt-1 text-[14.5px] text-[#0B2A3C]/60">Chaque inscription vous est aussi envoyée par e-mail.</p>
            <label className="mt-3 inline-flex items-center gap-2 text-[14px] font-semibold text-[#0B2A3C]/70">
              Offre :
              <select
                value={offerFilter}
                onChange={(e) => setOfferFilter(e.target.value)}
                className="h-10 max-w-[260px] cursor-pointer rounded-full border border-[#0B2A3C]/12 bg-[#FFFFFF] px-3.5 text-[14px] font-semibold text-[#0B2A3C] focus:border-[#1391B8] focus:outline-none"
              >
                <option value="toutes">Toutes les offres</option>
                {(offers ?? []).map((o) => (
                  <option key={o.slug} value={o.slug}>
                    {o.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button type="button" onClick={() => void load()} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-[#FFFFFF] px-4 text-[14px] font-semibold text-[#0B2A3C]/75 shadow-[0_6px_18px_-12px_rgba(11,42,60,0.5)] ring-1 ring-[#0B2A3C]/[0.08] transition hover:text-[#0E6BA8]">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Actualiser
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard icon={Users} label="Inscrits" value={counts.total} tone="bg-[#E6F1FA] text-[#0E6BA8]" />
          <StatCard icon={Ticket} label="Codes valides" value={counts.actifs} tone="bg-[#E4F7F3] text-[#0F7A6D]" />
          <StatCard icon={CheckCircle2} label="Codes utilisés" value={counts.utilise} tone="bg-[#E6F1FA] text-[#0E6BA8]" />
          <StatCard icon={CalendarClock} label="Expirent dans 30 jours" value={counts.bientot} tone="bg-[#FFF4DC] text-[#9A6400]" />
        </div>

        {/* Recherche + filtres */}
        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block w-full lg:max-w-[420px]">
            <span className="sr-only">Rechercher</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#0B2A3C]/40" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Code, nom, société, téléphone…"
              className="h-12 w-full rounded-full border border-[#0B2A3C]/10 bg-[#FFFFFF] pl-11 pr-4 text-[15.5px] shadow-[0_6px_18px_-14px_rgba(11,42,60,0.5)] focus:border-[#1391B8] focus:outline-none focus:ring-4 focus:ring-[#1391B8]/15"
            />
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                aria-pressed={filter === f.id}
                className={`h-9 cursor-pointer rounded-full px-3.5 text-[14px] font-semibold transition ${filter === f.id ? 'bg-[#0B2A3C] text-[#FFFFFF]' : 'bg-[#FFFFFF] text-[#0B2A3C]/70 ring-1 ring-[#0B2A3C]/[0.08] hover:text-[#0E6BA8]'}`}
              >
                {f.label}
              </button>
            ))}
            <button type="button" onClick={exportCsv} disabled={visible.length === 0} className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-[#FFFFFF] px-3.5 text-[14px] font-semibold text-[#0E6BA8] ring-1 ring-[#1391B8]/30 transition hover:bg-[#F0F9FC] disabled:cursor-not-allowed disabled:opacity-50">
              <Download className="h-4 w-4" aria-hidden="true" />
              Excel
            </button>
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-5 rounded-xl bg-[#FDECEA] px-4 py-3 text-[14.5px] font-medium text-[#A8321F]">
            {failureMessage(error)}
          </p>
        )}

        {signups === null && !error ? (
          <p className="mt-10 text-center text-[15px] text-[#0B2A3C]/55">Chargement…</p>
        ) : visible.length === 0 ? (
          <div className="mt-8 rounded-2xl border-2 border-dashed border-[#0B2A3C]/10 bg-[#FFFFFF]/60 px-6 py-12 text-center">
            <Ticket className="mx-auto h-8 w-8 text-[#1391B8]/60" aria-hidden="true" />
            <p className="mt-3 font-semibold">{(signups ?? []).length === 0 ? 'Aucune inscription pour l’instant.' : 'Aucun résultat.'}</p>
            <p className="mt-1 text-[14px] text-[#0B2A3C]/55">
              {(signups ?? []).length === 0 ? 'Les inscriptions de la page /offre apparaîtront ici.' : 'Essayez une autre recherche ou un autre filtre.'}
            </p>
          </div>
        ) : (
          <>
            <p className="mt-6 text-[13.5px] text-[#0B2A3C]/55">
              {visible.length} inscription{visible.length > 1 ? 's' : ''}
            </p>
            <ul className="mt-2 grid gap-3 lg:grid-cols-2">
              {visible.map((s) => (
                <SignupCard
                  key={s.reference}
                  signup={s}
                  offerName={(offers ?? []).find((o) => o.slug === s.offer)?.name ?? (s.offer === DEFAULT_SLUG ? 'Offre de bienvenue' : s.offer)}
                  busy={busyRef === s.reference}
                  onToggle={() => void toggle(s)}
                />
              ))}
            </ul>
          </>
        )}
        </>
        )}
      </div>
    </div>
  );
}

/** Page /gestion : espace privé (mot de passe) ; d'abord le suivi de l'offre -5 %. */
export function GestionPage({ brand: _brand, routerMode }: { readonly brand: BrandConfig; readonly routerMode: RouterMode }) {
  const [state, setState] = useState<'verification' | 'deconnecte' | 'connecte'>('verification');
  const [startError, setStartError] = useState<ApiFailure | null>(null);

  useEffect(() => {
    let alive = true;
    void fetchSession().then((r) => {
      if (!alive) return;
      if (r.ok) setState(r.data ? 'connecte' : 'deconnecte');
      else {
        setStartError(r.reason);
        setState('deconnecte');
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  const onLoggedOut = useCallback(() => setState('deconnecte'), []);

  return (
    <div className="flex flex-1 flex-col" style={{ color: INK }}>
      {state === 'verification' ? (
        <div className="flex flex-1 items-center justify-center bg-[#F3F8FA] text-[15px] text-[#0B2A3C]/55">Chargement…</div>
      ) : state === 'connecte' ? (
        <Dashboard routerMode={routerMode} onLoggedOut={onLoggedOut} />
      ) : (
        <>
          {startError === 'non_configure' && (
            <p role="alert" className="bg-[#FFF4DC] px-4 py-2.5 text-center text-[14px] font-medium text-[#7A4F00]">
              {failureMessage('non_configure')}
            </p>
          )}
          <LoginScreen routerMode={routerMode} onConnected={() => setState('connecte')} />
        </>
      )}
    </div>
  );
}
