import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Eye, FileText, Info, MousePointerClick, RefreshCw, Smartphone, Ticket } from 'lucide-react';
import { fetchStats, type ApiFailure, type OfferSignup, type SiteRequest } from '../../utils/gestion';
import { buildReport, change, type Report } from '../../utils/siteStatsReport';
import type { OfferConfig } from '../../utils/offers';

const BAR = '#1391B8';
const PERIODS = [7, 30, 90] as const;
type Period = (typeof PERIODS)[number];

function formatDay(day: string, long = false): string {
  const [y, m, d] = day.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('fr-FR', long ? { weekday: 'long', day: 'numeric', month: 'long' } : { day: 'numeric', month: 'short' });
}

function Kpi({ icon: Icon, label, value, previous, hint }: { readonly icon: typeof Eye; readonly label: string; readonly value: string; readonly previous: number | null; readonly hint?: string }) {
  return (
    <div className="rounded-2xl bg-[#FFFFFF] p-4 shadow-[0_10px_30px_-20px_rgba(11,42,60,0.45)] ring-1 ring-[#0B2A3C]/[0.06] sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#E6F1FA] text-[#0E6BA8]">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        {previous !== null && (
          <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[12.5px] font-semibold ${previous >= 0 ? 'bg-[#E4F7F3] text-[#0F7A6D]' : 'bg-[#FDECEA] text-[#B0321F]'}`}>
            {previous >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" /> : <ArrowDownRight className="h-3.5 w-3.5" aria-hidden="true" />}
            {previous > 0 ? '+' : ''}
            {previous} %
          </span>
        )}
      </div>
      <p className="mt-3 font-display text-[28px] font-bold leading-none tabular-nums">{value}</p>
      <p className="mt-1.5 text-[13.5px] text-[#0B2A3C]/60">{label}</p>
      {hint && <p className="mt-1 text-[12px] text-[#0B2A3C]/45">{hint}</p>}
    </div>
  );
}

/** Visites par jour : barres fines, une seule couleur, info-bulle au survol, tableau disponible. */
function DailyChart({ daily }: { readonly daily: Report['daily'] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...daily.map((d) => d.visits));
  const niceMax = Math.max(4, Math.ceil(max / 4) * 4);
  const ticks = [0, niceMax / 2, niceMax];
  const n = daily.length;
  const labelEvery = n <= 7 ? 1 : n <= 31 ? 7 : 14;
  const h = hover !== null ? daily[hover] : null;

  return (
    <div className="overflow-hidden rounded-2xl bg-[#FFFFFF] p-4 shadow-[0_10px_30px_-20px_rgba(11,42,60,0.45)] ring-1 ring-[#0B2A3C]/[0.06] sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-[18px] font-bold">Visites par jour</h2>
        <p className="min-h-[20px] text-[13.5px] text-[#0B2A3C]/65" aria-live="polite">
          {h ? (
            <>
              <strong className="font-semibold text-[#0B2A3C]">{formatDay(h.day, true)}</strong> · {h.visits} visite{h.visits > 1 ? 's' : ''} · {h.requests} demande{h.requests > 1 ? 's' : ''}
            </>
          ) : (
            'Survolez une barre pour le détail'
          )}
        </p>
      </div>
      <div className="relative mt-4 flex h-[220px] gap-2">
        {/* axe des valeurs */}
        <div className="flex w-7 shrink-0 flex-col-reverse justify-between pb-6 text-right text-[11.5px] tabular-nums text-[#0B2A3C]/45" aria-hidden="true">
          {ticks.map((t) => (
            <span key={t} className="-translate-y-1/2 leading-none">
              {t}
            </span>
          ))}
        </div>
        <div className="relative flex min-w-0 flex-1 flex-col">
          <div className="relative flex-1">
            {ticks.map((t) => (
              <div key={t} aria-hidden="true" className="absolute inset-x-0 border-t border-[#0B2A3C]/[0.07]" style={{ bottom: `${(t / niceMax) * 100}%` }} />
            ))}
            <div className="absolute inset-0 flex items-end" style={{ gap: n > 45 ? 1 : 2 }} onMouseLeave={() => setHover(null)}>
              {daily.map((d, i) => (
                <div
                  key={d.day}
                  className="flex h-full min-w-0 flex-1 cursor-default items-end"
                  onMouseEnter={() => setHover(i)}
                  onFocus={() => setHover(i)}
                  tabIndex={0}
                  role="img"
                  aria-label={`${formatDay(d.day, true)} : ${d.visits} visites, ${d.requests} demandes`}
                >
                  <div
                    className="mx-auto w-full max-w-[28px] rounded-t-[4px] transition-opacity"
                    style={{ height: `${(d.visits / niceMax) * 100}%`, minHeight: d.visits > 0 ? 2 : 0, backgroundColor: BAR, opacity: hover === null || hover === i ? 1 : 0.45 }}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="mt-2 flex h-4 overflow-hidden text-[11.5px] text-[#0B2A3C]/45" aria-hidden="true">
            {daily.map((d, i) => (
              <span key={d.day} className={`min-w-0 flex-1 whitespace-nowrap ${n <= 7 ? 'text-center' : 'overflow-visible'}`}>
                {i % labelEvery === 0 ? formatDay(d.day) : ''}
              </span>
            ))}
          </div>
        </div>
      </div>
      <details className="mt-4">
        <summary className="cursor-pointer text-[13.5px] font-semibold text-[#0E6BA8]">Voir le tableau</summary>
        <div className="mt-2 max-h-[260px] overflow-y-auto">
          <table className="w-full text-[13.5px]">
            <thead>
              <tr className="text-left text-[#0B2A3C]/55">
                <th className="py-1.5 font-semibold">Jour</th>
                <th className="py-1.5 text-right font-semibold">Visites</th>
                <th className="py-1.5 text-right font-semibold">Demandes</th>
              </tr>
            </thead>
            <tbody>
              {[...daily].reverse().map((d) => (
                <tr key={d.day} className="border-t border-[#0B2A3C]/[0.06]">
                  <td className="py-1.5">{formatDay(d.day, true)}</td>
                  <td className="py-1.5 text-right tabular-nums">{d.visits}</td>
                  <td className="py-1.5 text-right tabular-nums">{d.requests}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

/** Liste avec barres horizontales (une couleur) : provenances, pages, offres. */
function RankList({ title, rows, empty }: { readonly title: string; readonly rows: readonly { key: string; label: string; value: number; extra?: string }[]; readonly empty: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="rounded-2xl bg-[#FFFFFF] p-4 shadow-[0_10px_30px_-20px_rgba(11,42,60,0.45)] ring-1 ring-[#0B2A3C]/[0.06] sm:p-5">
      <h2 className="font-display text-[17px] font-bold">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-3 text-[14px] text-[#0B2A3C]/55">{empty}</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-3">
          {rows.map((r) => (
            <li key={r.key}>
              <div className="flex items-baseline justify-between gap-3 text-[14px]">
                <span className="min-w-0 truncate">{r.label}</span>
                <span className="shrink-0 tabular-nums text-[#0B2A3C]/75">
                  <strong className="font-semibold text-[#0B2A3C]">{r.value}</strong>
                  {r.extra ? ` · ${r.extra}` : ''}
                </span>
              </div>
              <div className="mt-1.5 h-2 rounded-full bg-[#F0F4F6]" aria-hidden="true">
                <div className="h-2 rounded-full" style={{ width: `${Math.max(2, (r.value / max) * 100)}%`, backgroundColor: BAR }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Rubrique « Suivi du site » : visites (compteur du site), demandes et inscriptions. */
export function SuiviPanel({
  requests,
  signups,
  offers,
  onError,
}: {
  readonly requests: readonly SiteRequest[] | null;
  readonly signups: readonly OfferSignup[] | null;
  readonly offers: readonly OfferConfig[] | null;
  readonly onError: (reason: ApiFailure) => void;
}) {
  const [period, setPeriod] = useState<Period>(30);
  const [report, setReport] = useState<Report | null>(null);

  const load = useCallback(async () => {
    setReport(null);
    const r = await fetchStats(period * 2);
    if (r.ok) setReport(buildReport(r.data, period, requests ?? [], signups ?? []));
    else onError(r.reason);
  }, [period, requests, signups, onError]);

  useEffect(() => {
    void load();
  }, [load]);

  const offerName = useMemo(() => new Map((offers ?? []).map((o) => [o.slug, o.name])), [offers]);
  const c = report?.current;
  const p = report?.previous;
  const rate = c && c.visits > 0 ? Math.round((c.requests / c.visits) * 1000) / 10 : null;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[26px] font-bold tracking-[-0.02em] sm:text-[30px]">Suivi du site</h1>
          <p className="mt-1 text-[14.5px] text-[#0B2A3C]/60">Visites du site, d’où elles viennent, et ce qu’elles rapportent en demandes et en inscriptions.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-full bg-[#FFFFFF] p-1 ring-1 ring-[#0B2A3C]/[0.08]" role="group" aria-label="Période">
            {PERIODS.map((d) => (
              <button
                key={d}
                type="button"
                aria-pressed={period === d}
                onClick={() => setPeriod(d)}
                className={`h-8 cursor-pointer rounded-full px-3.5 text-[13.5px] font-semibold transition ${period === d ? 'bg-[#0B2A3C] text-[#FFFFFF]' : 'text-[#0B2A3C]/65 hover:text-[#0E6BA8]'}`}
              >
                {d} jours
              </button>
            ))}
          </div>
          <button type="button" onClick={() => void load()} aria-label="Actualiser" className="grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-[#FFFFFF] text-[#0B2A3C]/70 ring-1 ring-[#0B2A3C]/[0.08] hover:text-[#0E6BA8]">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {!report || !c || !p ? (
        <p className="mt-10 text-center text-[15px] text-[#0B2A3C]/55">Chargement…</p>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Kpi icon={MousePointerClick} label="Visites" value={String(c.visits)} previous={change(c.visits, p.visits)} hint={`${c.views} pages vues`} />
            <Kpi icon={FileText} label="Demandes reçues" value={String(c.requests)} previous={change(c.requests, p.requests)} />
            <Kpi icon={Eye} label="Visites → demande" value={rate === null ? '—' : `${rate.toLocaleString('fr-FR')} %`} previous={null} hint="Part des visites qui finissent en demande" />
            <Kpi icon={Ticket} label="Inscriptions aux offres" value={String(c.signups)} previous={change(c.signups, p.signups)} />
          </div>
          <p className="mt-2 text-[12.5px] text-[#0B2A3C]/45">Flèches : comparaison avec les {period} jours précédents.</p>

          <div className="mt-5">
            <DailyChart daily={report.daily} />
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <RankList
              title="D’où viennent les visiteurs"
              rows={report.sources.map((s) => ({ key: s.id, label: s.label, value: s.count, extra: `${Math.round(s.share * 100)} %` }))}
              empty="Pas encore de visites sur cette période."
            />
            <RankList title="Pages les plus vues" rows={report.pages.map((r) => ({ key: r.path, label: r.label, value: r.count }))} empty="Pas encore de pages vues." />
            <RankList
              title="Offres : pages vues → inscriptions"
              rows={report.offers.map((o) => ({
                key: o.slug,
                label: offerName.get(o.slug) ?? o.slug,
                value: o.views,
                extra: `${o.signups} inscrit${o.signups > 1 ? 's' : ''}${o.views > 0 ? ` (${Math.round((o.signups / o.views) * 100)} %)` : ''}`,
              }))}
              empty="Aucune page d’offre vue sur cette période."
            />
            <div className="rounded-2xl bg-[#FFFFFF] p-4 shadow-[0_10px_30px_-20px_rgba(11,42,60,0.45)] ring-1 ring-[#0B2A3C]/[0.06] sm:p-5">
              <h2 className="font-display text-[17px] font-bold">Appareils</h2>
              {report.mobileShare === null ? (
                <p className="mt-3 text-[14px] text-[#0B2A3C]/55">Pas encore de visites sur cette période.</p>
              ) : (
                <>
                  <p className="mt-3 flex items-center gap-2 text-[15px]">
                    <Smartphone className="h-5 w-5 text-[#0E6BA8]" aria-hidden="true" />
                    <strong className="font-display text-[24px] font-bold tabular-nums">{Math.round(report.mobileShare * 100)} %</strong> des visites sur téléphone
                  </p>
                  <div className="mt-3 flex h-3 overflow-hidden rounded-full" aria-hidden="true">
                    <div style={{ width: `${report.mobileShare * 100}%`, backgroundColor: BAR }} />
                    <div className="ml-[2px] flex-1 bg-[#C9DCE4]" />
                  </div>
                  <p className="mt-2 flex justify-between text-[12.5px] text-[#0B2A3C]/55">
                    <span>Téléphone</span>
                    <span>Ordinateur ({Math.round((1 - report.mobileShare) * 100)} %)</span>
                  </p>
                </>
              )}
            </div>
          </div>

          <p className="mt-6 flex gap-2 rounded-xl bg-[#FFFFFF]/70 px-4 py-3 text-[13px] leading-[1.55] text-[#0B2A3C]/60 ring-1 ring-[#0B2A3C]/[0.06]">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            Compteur du site, sans cookie et sans donnée personnelle : il compte toutes les visites (les robots sont exclus). Une arrivée sans site d’origine sur une page d’offre est comptée comme un scan de QR code. Les chiffres détaillés de Google Analytics restent dans votre compte Google.
          </p>
        </>
      )}
    </div>
  );
}
