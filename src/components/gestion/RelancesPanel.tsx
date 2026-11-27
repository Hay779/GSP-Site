import { useMemo, useState } from 'react';
import { BellRing, CalendarClock, Check, FileText, Hourglass, Mail, MessageCircle, MessageSquareText, Phone, PhoneCall, RefreshCw, Ticket } from 'lucide-react';
import { formatDateTime, markRelanceDone, type ApiFailure, type OfferSignup, type RelanceDone, type SiteRequest } from '../../utils/gestion';
import { computeRelances, mailHref, RELANCE_GROUPS, RELANCE_PAUSE_JOURS, smsHref, whatsappHref, type Relance, type RelanceReason } from '../../utils/relances';

const SEA = 'linear-gradient(120deg,#0E6BA8 0%,#1391B8 50%,#17B3A3 100%)';

const GROUP_STYLE: Readonly<Record<RelanceReason, { icon: typeof Phone; tone: string }>> = {
  rappel: { icon: PhoneCall, tone: 'bg-[#FDECEA] text-[#B0321F]' },
  devis: { icon: FileText, tone: 'bg-[#E6F1FA] text-[#0E6BA8]' },
  suivi: { icon: Hourglass, tone: 'bg-[#FFF4DC] text-[#9A6400]' },
  expire: { icon: CalendarClock, tone: 'bg-[#FFF1E6] text-[#B4460F]' },
  inutilise: { icon: Ticket, tone: 'bg-[#E4F7F3] text-[#0F7A6D]' },
};

function RelanceCard({ relance, busy, onDone }: { readonly relance: Relance; readonly busy: boolean; readonly onDone: () => void }) {
  const btn = 'inline-flex h-10 items-center gap-1.5 rounded-full border border-[#0B2A3C]/12 bg-[#FFFFFF] px-3.5 text-[14px] font-semibold text-[#0B2A3C]/75 transition hover:border-[#1391B8] hover:text-[#0E6BA8]';
  return (
    <li className="min-w-0 rounded-2xl bg-[#FFFFFF] p-4 shadow-[0_10px_30px_-24px_rgba(11,42,60,0.55)] ring-1 ring-[#0B2A3C]/[0.06]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1 basis-[15rem] overflow-hidden">
          <p className="text-[15.5px] font-bold">
            {relance.name || 'Sans nom'}
            {relance.company && <span className="font-semibold text-[#0B2A3C]/55"> · {relance.company}</span>}
          </p>
          <p className="mt-0.5 text-[14.5px] text-[#0B2A3C]/80">{relance.why}</p>
          <p className="mt-0.5 truncate text-[13px] text-[#0B2A3C]/50">
            {relance.detail} · {relance.reference}
          </p>
          {relance.lastDone && (
            <p className="mt-1.5 inline-flex rounded-lg bg-[#F5FAFC] px-2.5 py-1 text-[12.5px] text-[#0B2A3C]/60">Déjà relancé le {formatDateTime(relance.lastDone.at)}</p>
          )}
        </div>
        <button type="button" onClick={onDone} disabled={busy} className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-4 text-[14px] font-semibold text-[#FFFFFF] shadow-[0_10px_22px_-12px_rgba(14,107,168,0.9)] transition hover:brightness-110 disabled:opacity-60" style={{ backgroundImage: SEA }}>
          <Check className="h-4 w-4" strokeWidth={2.6} aria-hidden="true" />
          {busy ? 'Enregistrement…' : 'Relancé'}
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {relance.phone && (
          <>
            <a href={`tel:${relance.phone.replace(/[^\d+]/g, '')}`} className={btn}>
              <Phone className="h-4 w-4" aria-hidden="true" />
              Appeler
            </a>
            <a href={smsHref(relance.phone, relance.message)} className={btn}>
              <MessageSquareText className="h-4 w-4" aria-hidden="true" />
              SMS
            </a>
            <a href={whatsappHref(relance.phone, relance.message)} target="_blank" rel="noopener noreferrer" className={btn}>
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              WhatsApp
            </a>
          </>
        )}
        {relance.email && (
          <a href={mailHref(relance.email, relance.reference, relance.message)} className={btn}>
            <Mail className="h-4 w-4" aria-hidden="true" />
            E-mail
          </a>
        )}
      </div>
    </li>
  );
}

/** Rubrique « Relances » : qui recontacter aujourd'hui (calculé à partir des demandes et des inscriptions). */
export function RelancesPanel({
  requests,
  signups,
  done,
  onDoneChange,
  onReload,
  onError,
}: {
  readonly requests: readonly SiteRequest[] | null;
  readonly signups: readonly OfferSignup[] | null;
  readonly done: Readonly<Record<string, RelanceDone>> | null;
  readonly onDoneChange: (done: Record<string, RelanceDone>) => void;
  readonly onReload: () => void;
  readonly onError: (reason: ApiFailure) => void;
}) {
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const loading = requests === null || signups === null || done === null;
  const relances = useMemo(() => (loading ? [] : computeRelances(requests ?? [], signups ?? [], done ?? {})), [loading, requests, signups, done]);

  const markDone = async (r: Relance) => {
    setBusyKey(r.key);
    const res = await markRelanceDone(r.key);
    setBusyKey(null);
    if (res.ok) onDoneChange({ ...(done ?? {}), [r.key]: res.data });
    else onError(res.reason);
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[26px] font-bold tracking-[-0.02em] sm:text-[30px]">Relances</h1>
          <p className="mt-1 max-w-[46rem] text-[14.5px] text-[#0B2A3C]/60">
            Les clients à recontacter, calculés à partir des demandes et des inscriptions. Appelez ou envoyez le message proposé (SMS, WhatsApp, e-mail), puis cliquez « Relancé » : la ligne disparaît pendant {RELANCE_PAUSE_JOURS} jours.
          </p>
        </div>
        <button type="button" onClick={onReload} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-[#FFFFFF] px-4 text-[14px] font-semibold text-[#0B2A3C]/75 shadow-[0_6px_18px_-12px_rgba(11,42,60,0.5)] ring-1 ring-[#0B2A3C]/[0.08] transition hover:text-[#0E6BA8]">
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Actualiser
        </button>
      </div>

      {loading ? (
        <p className="mt-10 text-center text-[15px] text-[#0B2A3C]/55">Chargement…</p>
      ) : relances.length === 0 ? (
        <div className="mt-8 rounded-2xl border-2 border-dashed border-[#0B2A3C]/10 bg-[#FFFFFF]/60 px-6 py-12 text-center">
          <BellRing className="mx-auto h-8 w-8 text-[#1391B8]/60" aria-hidden="true" />
          <p className="mt-3 font-semibold">Rien à relancer aujourd’hui.</p>
          <p className="mt-1 text-[14px] text-[#0B2A3C]/55">Toutes les demandes et les inscriptions sont à jour.</p>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-8">
          {RELANCE_GROUPS.map((g) => {
            const items = relances.filter((r) => r.reason === g.reason);
            if (items.length === 0) return null;
            const S = GROUP_STYLE[g.reason];
            return (
              <section key={g.reason} aria-labelledby={`rel-${g.reason}`}>
                <div className="flex items-center gap-3">
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${S.tone}`}>
                    <S.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 id={`rel-${g.reason}`} className="font-display text-[18px] font-bold leading-tight">
                      {g.title} <span className="text-[#0B2A3C]/45">({items.length})</span>
                    </h2>
                    <p className="text-[13px] text-[#0B2A3C]/55">{g.hint}</p>
                  </div>
                </div>
                <ul className="mt-3 grid gap-2.5 lg:grid-cols-2">
                  {items.map((r) => (
                    <RelanceCard key={r.key} relance={r} busy={busyKey === r.key} onDone={() => void markDone(r)} />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

