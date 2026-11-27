import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ArrowRight, BellRing, Eye, Inbox, MessageSquareText, Phone, Star, Ticket, TrendingDown, TrendingUp, UserPlus } from 'lucide-react';
import { fetchStats, formatDateTime, REQUEST_TYPE_LABELS, requestField, requestSummary, type DayStats, type OfferSignup, type RelanceDone, type SiteRequest } from '../../utils/gestion';
import { computeRelances, smsHref } from '../../utils/relances';
import { buildToday, greeting } from '../../utils/today';

export type TodayTarget = 'demandes' | 'relances' | 'inscrits' | 'suivi';

const SEA = 'linear-gradient(120deg,#0E6BA8 0%,#1391B8 50%,#17B3A3 100%)';

function Trend({ value, previous, unit }: { readonly value: number; readonly previous: number | null; readonly unit: string }) {
  if (previous === null) return <span className="text-[12.5px] text-[#0B2A3C]/45">{unit}</span>;
  const diff = value - previous;
  if (diff === 0) return <span className="text-[12.5px] text-[#0B2A3C]/50">Pareil que {unit}</span>;
  const up = diff > 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-1 text-[12.5px] font-semibold ${up ? 'text-[#0F7A6D]' : 'text-[#B4460F]'}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {up ? '+' : ''}
      {diff} par rapport à {unit}
    </span>
  );
}

function Tile({
  icon: Icon,
  tone,
  label,
  value,
  children,
  onClick,
}: {
  readonly icon: typeof Inbox;
  readonly tone: string;
  readonly label: string;
  readonly value: string;
  readonly children?: ReactNode;
  readonly onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-w-0 cursor-pointer flex-col items-start rounded-2xl bg-[#FFFFFF] p-4 text-left shadow-[0_10px_30px_-24px_rgba(11,42,60,0.55)] ring-1 ring-[#0B2A3C]/[0.06] transition hover:-translate-y-0.5 hover:ring-[#1391B8]/40 sm:p-5"
    >
      <span className="flex w-full items-center justify-between">
        <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <ArrowRight className="h-4 w-4 text-[#0B2A3C]/25 transition group-hover:translate-x-0.5 group-hover:text-[#1391B8]" aria-hidden="true" />
      </span>
      <span className="mt-3 font-display text-[30px] font-bold leading-none tracking-[-0.02em]">{value}</span>
      <span className="mt-1.5 text-[14px] font-semibold text-[#0B2A3C]/75">{label}</span>
      <span className="mt-1">{children}</span>
    </button>
  );
}

function Card({ title, action, onAction, children }: { readonly title: string; readonly action: string; readonly onAction: () => void; readonly children: ReactNode }) {
  return (
    <section className="min-w-0 rounded-2xl bg-[#FFFFFF] p-4 shadow-[0_10px_30px_-24px_rgba(11,42,60,0.55)] ring-1 ring-[#0B2A3C]/[0.06] sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-[18px] font-bold">{title}</h2>
        <button type="button" onClick={onAction} className="inline-flex cursor-pointer items-center gap-1 whitespace-nowrap text-[14px] font-semibold text-[#0E6BA8] hover:underline">
          <span className="hidden sm:inline">{action}</span>
          <span className="sm:hidden">Tout voir</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

const callBtn = 'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-[#0B2A3C]/12 px-3 text-[13.5px] font-semibold text-[#0B2A3C]/75 transition hover:border-[#1391B8] hover:text-[#0E6BA8]';

function Empty({ text }: { readonly text: string }) {
  return <p className="rounded-xl bg-[#F5FAFC] px-4 py-5 text-center text-[14px] text-[#0B2A3C]/55">{text}</p>;
}

/** Page d'accueil de /gestion : ce qu'il faut faire aujourd'hui, en un coup d'œil. */
export function TodayPanel({
  requests,
  signups,
  done,
  onGo,
}: {
  readonly requests: readonly SiteRequest[] | null;
  readonly signups: readonly OfferSignup[] | null;
  readonly done: Readonly<Record<string, RelanceDone>> | null;
  readonly onGo: (target: TodayTarget) => void;
}) {
  const [stats, setStats] = useState<DayStats[] | null>(null);
  useEffect(() => {
    let alive = true;
    void fetchStats(3).then((r) => alive && setStats(r.ok ? r.data : []));
    return () => {
      alive = false;
    };
  }, []);

  const loading = requests === null || signups === null || done === null;
  const t = useMemo(() => {
    if (loading) return null;
    const relances = computeRelances(requests ?? [], signups ?? [], done ?? {});
    return buildToday(requests ?? [], signups ?? [], relances, stats);
  }, [loading, requests, signups, done, stats]);

  const now = new Date();
  const date = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div>
      <h1 className="font-display text-[26px] font-bold tracking-[-0.02em] sm:text-[30px]">{greeting(now)} !</h1>
      <p className="mt-1 text-[14.5px] text-[#0B2A3C]/60">
        Nous sommes {date}. Voici ce qui vous attend aujourd’hui.
      </p>

      {!t ? (
        <p className="mt-10 text-center text-[15px] text-[#0B2A3C]/55">Chargement…</p>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Tile icon={Inbox} tone="bg-[#FDECEA] text-[#B0321F]" label="Demandes à rappeler" value={String(t.newRequests.length)} onClick={() => onGo('demandes')}>
              <span className="text-[12.5px] text-[#0B2A3C]/50">{t.requestsWeek} reçue{t.requestsWeek > 1 ? 's' : ''} en 7 jours</span>
            </Tile>
            <Tile icon={BellRing} tone="bg-[#FFF4DC] text-[#9A6400]" label="Relances à faire" value={String(t.relances.length)} onClick={() => onGo('relances')}>
              <span className="text-[12.5px] text-[#0B2A3C]/50">
                {t.reviewRequests > 0 ? `+ ${t.reviewRequests} avis Google à demander` : 'Clients à recontacter'}
              </span>
            </Tile>
            <Tile icon={UserPlus} tone="bg-[#E4F7F3] text-[#0F7A6D]" label="Inscriptions sur 7 jours" value={String(t.signupsWeek)} onClick={() => onGo('inscrits')}>
              <Trend value={t.signupsWeek} previous={t.signupsPrevWeek} unit="la semaine d’avant" />
            </Tile>
            <Tile icon={Eye} tone="bg-[#E6F1FA] text-[#0E6BA8]" label="Visites du site hier" value={t.visitsYesterday === null ? '—' : String(t.visitsYesterday)} onClick={() => onGo('suivi')}>
              {t.visitsYesterday === null ? (
                <span className="text-[12.5px] text-[#0B2A3C]/45">{stats === null ? 'Chargement…' : 'Compteur démarré le 27/11'}</span>
              ) : (
                <Trend value={t.visitsYesterday} previous={t.visitsDayBefore} unit="avant-hier" />
              )}
            </Tile>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <Card title="Demandes à rappeler" action="Toutes les demandes" onAction={() => onGo('demandes')}>
              {t.newRequests.length === 0 ? (
                <Empty text="Aucune nouvelle demande : tout est traité." />
              ) : (
                <ul className="divide-y divide-[#0B2A3C]/[0.06]">
                  {t.newRequests.slice(0, 4).map((r) => {
                    const phone = requestField(r, 'Téléphone');
                    return (
                      <li key={r.reference} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[15px] font-bold">{requestField(r, 'Nom') || 'Sans nom'}</p>
                          <p className="truncate text-[13px] text-[#0B2A3C]/55">
                            {REQUEST_TYPE_LABELS[r.type]} · {requestSummary(r) || r.title} · {formatDateTime(r.receivedAt)}
                          </p>
                        </div>
                        {phone && (
                          <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className={callBtn}>
                            <Phone className="h-4 w-4" aria-hidden="true" />
                            Appeler
                          </a>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
              {t.newRequests.length > 4 && <p className="mt-2 text-[13px] text-[#0B2A3C]/50">Et {t.newRequests.length - 4} autre(s).</p>}
            </Card>

            <Card title="Relances les plus urgentes" action="Toutes les relances" onAction={() => onGo('relances')}>
              {t.relances.length === 0 ? (
                <Empty text="Rien à relancer aujourd’hui." />
              ) : (
                <ul className="divide-y divide-[#0B2A3C]/[0.06]">
                  {t.relances.slice(0, 4).map((r) => (
                    <li key={r.key} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-bold">
                          {r.name || 'Sans nom'}
                          {r.company && <span className="font-semibold text-[#0B2A3C]/50"> · {r.company}</span>}
                        </p>
                        <p className="truncate text-[13px] text-[#0B2A3C]/55">{r.why}</p>
                      </div>
                      {r.phone && (
                        <a href={smsHref(r.phone, r.message)} className={callBtn} aria-label={`SMS à ${r.name || 'ce client'}`}>
                          <MessageSquareText className="h-4 w-4" aria-hidden="true" />
                          <span className="hidden sm:inline">SMS</span>
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              {t.relances.length > 4 && <p className="mt-2 text-[13px] text-[#0B2A3C]/50">Et {t.relances.length - 4} autre(s).</p>}
            </Card>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl px-5 py-4 text-[#FFFFFF]" style={{ backgroundImage: SEA }}>
            <Ticket className="h-6 w-6 shrink-0" aria-hidden="true" />
            <p className="min-w-0 flex-1 basis-[13rem] text-[14.5px]">
              <span className="font-bold">
                {t.codesUsed30} code{t.codesUsed30 > 1 ? 's' : ''} de réduction utilisé{t.codesUsed30 > 1 ? 's' : ''}
              </span>{' '}
              ces 30 derniers jours : autant de clients venus grâce à vos offres.
            </p>
            {t.reviewRequests > 0 && (
              <button type="button" onClick={() => onGo('relances')} className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-[#FFFFFF] px-3.5 text-[13.5px] font-semibold text-[#0E6BA8]">
                <Star className="h-4 w-4" aria-hidden="true" />
                Demander {t.reviewRequests} avis
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
