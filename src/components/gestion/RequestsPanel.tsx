import { useEffect, useMemo, useRef, useState } from 'react';
import { Camera, ChevronRight, Download, FileText, Handshake, Inbox, Mail, MapPin, MessageSquare, Phone, RefreshCw, Search, ShieldAlert, X } from 'lucide-react';
import {
  formatDateTime,
  matchesRequestSearch,
  REQUEST_STATUS_LABELS,
  REQUEST_TYPE_LABELS,
  requestField,
  requestPhotoUrl,
  requestsToCsv,
  requestSummary,
  saveRequestFollowUp,
  type ApiFailure,
  type RequestStatus,
  type RequestType,
  type SiteRequest,
} from '../../utils/gestion';

const SEA = 'linear-gradient(120deg,#0E6BA8 0%,#1391B8 50%,#17B3A3 100%)';

const TYPE_STYLE: Readonly<Record<RequestType, { icon: typeof Inbox; className: string }>> = {
  devis: { icon: FileText, className: 'bg-[#E6F1FA] text-[#0E6BA8]' },
  contact: { icon: MessageSquare, className: 'bg-[#EEF0FB] text-[#4B4FB8]' },
  partenaire: { icon: Handshake, className: 'bg-[#E4F7F3] text-[#0F7A6D]' },
  sinistre: { icon: ShieldAlert, className: 'bg-[#FFF1E6] text-[#B4460F]' },
};

const STATUS_STYLE: Readonly<Record<RequestStatus, string>> = {
  nouvelle: 'bg-[#FDECEA] text-[#B0321F]',
  en_cours: 'bg-[#FFF4DC] text-[#9A6400]',
  devis_envoye: 'bg-[#E6F1FA] text-[#0E6BA8]',
  terminee: 'bg-[#E4F7F3] text-[#0F7A6D]',
  sans_suite: 'bg-[#F1F3F5] text-[#5B6770]',
};

const STATUSES: readonly RequestStatus[] = ['nouvelle', 'en_cours', 'devis_envoye', 'terminee', 'sans_suite'];

function formatDateHour(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return `${d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })} à ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
}

function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

// ---------------------------------------------------------------- fiche détaillée
function RequestDetail({ request, onClose, onSaved, onError }: { readonly request: SiteRequest; readonly onClose: () => void; readonly onSaved: (r: SiteRequest) => void; readonly onError: (reason: ApiFailure) => void }) {
  const [status, setStatus] = useState<RequestStatus>(request.status);
  const [note, setNote] = useState(request.note);
  const [saving, setSaving] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const phone = requestField(request, 'Téléphone');
  const email = requestField(request, 'E-mail');
  const changed = status !== request.status || note.trim() !== request.note.trim();
  const T = TYPE_STYLE[request.type];

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') (photo ? setPhoto(null) : onClose());
    };
    window.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose, photo]);

  const save = async () => {
    setSaving(true);
    const r = await saveRequestFollowUp(request.reference, status, note.trim());
    setSaving(false);
    if (r.ok) onSaved({ ...request, ...r.data });
    else onError(r.reason);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#0B2A3C]/40 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={`Demande ${request.reference}`} className="flex h-full w-full max-w-[620px] flex-col bg-[#F3F8FA] shadow-[-20px_0_60px_-20px_rgba(11,42,60,0.5)]">
        <div className="flex items-start justify-between gap-3 border-b border-[#0B2A3C]/[0.07] bg-[#FFFFFF] px-5 py-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12.5px] font-semibold ${T.className}`}>
                <T.icon className="h-3.5 w-3.5" aria-hidden="true" />
                {REQUEST_TYPE_LABELS[request.type]}
              </span>
              <span className="font-mono text-[14px] font-bold">{request.reference}</span>
            </div>
            <p className="mt-1 text-[13.5px] text-[#0B2A3C]/55">Reçue le {formatDateHour(request.receivedAt)}</p>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Fermer" className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full text-[#0B2A3C]/60 hover:bg-[#F0F9FC] hover:text-[#0E6BA8]">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {/* Actions rapides */}
          <div className="flex flex-wrap gap-2">
            {phone && (
              <a href={telHref(phone)} className="inline-flex h-11 items-center gap-2 rounded-full px-5 text-[15px] font-semibold text-[#FFFFFF] shadow-[0_12px_26px_-12px_rgba(14,107,168,0.9)] transition hover:brightness-110" style={{ backgroundImage: SEA }}>
                <Phone className="h-4 w-4" aria-hidden="true" />
                Appeler {phone}
              </a>
            )}
            {email && (
              <a href={`mailto:${email}?subject=${encodeURIComponent(`Votre demande ${request.reference}`)}`} className="inline-flex h-11 items-center gap-2 rounded-full border border-[#0B2A3C]/15 bg-[#FFFFFF] px-5 text-[15px] font-semibold transition hover:border-[#1391B8] hover:text-[#0E6BA8]">
                <Mail className="h-4 w-4" aria-hidden="true" />
                Répondre par e-mail
              </a>
            )}
          </div>

          {/* Suivi */}
          <div className="mt-5 rounded-2xl bg-[#FFFFFF] p-4 ring-1 ring-[#0B2A3C]/[0.07]">
            <p className="text-[14px] font-bold">Suivi</p>
            <div className="mt-2.5 flex flex-wrap gap-2" role="radiogroup" aria-label="État de la demande">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={status === s}
                  onClick={() => setStatus(s)}
                  className={`h-9 cursor-pointer rounded-full px-3.5 text-[13.5px] font-semibold transition ${status === s ? 'bg-[#0B2A3C] text-[#FFFFFF]' : 'bg-[#F5FAFC] text-[#0B2A3C]/70 ring-1 ring-[#0B2A3C]/[0.08] hover:text-[#0E6BA8]'}`}
                >
                  {REQUEST_STATUS_LABELS[s]}
                </button>
              ))}
            </div>
            <label htmlFor="rq-note" className="mt-4 block text-[13.5px] font-semibold text-[#0B2A3C]/70">
              Note interne (jamais vue par le client)
            </label>
            <textarea
              id="rq-note"
              rows={3}
              maxLength={1000}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex. rappelé le 27/11, devis à envoyer lundi"
              className="mt-1.5 w-full rounded-xl border border-[#0B2A3C]/15 bg-[#FFFFFF] px-3.5 py-2.5 text-[15px] leading-[1.5] focus:border-[#1391B8] focus:outline-none focus:ring-4 focus:ring-[#1391B8]/15"
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-[12.5px] text-[#0B2A3C]/50">{request.updatedAt ? `Mis à jour le ${formatDateHour(request.updatedAt)}` : 'Pas encore traitée'}</p>
              <button type="button" onClick={() => void save()} disabled={!changed || saving} className="h-10 cursor-pointer rounded-full px-5 text-[14.5px] font-semibold text-[#FFFFFF] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40" style={{ backgroundImage: SEA }}>
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </div>

          {/* Photos */}
          {request.photos.length > 0 && (
            <div className="mt-5">
              <p className="flex items-center gap-1.5 text-[14px] font-bold">
                <Camera className="h-4 w-4 text-[#0B2A3C]/50" aria-hidden="true" />
                Photos ({request.photos.length})
              </p>
              <div className="mt-2.5 grid grid-cols-3 gap-2">
                {request.photos.map((name) => (
                  <button key={name} type="button" onClick={() => setPhoto(name)} className="aspect-[4/3] cursor-zoom-in overflow-hidden rounded-xl bg-[#E6EEF1] ring-1 ring-[#0B2A3C]/[0.08]" aria-label={`Agrandir ${name}`}>
                    <img src={requestPhotoUrl(request.reference, name)} alt="" loading="lazy" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tout le formulaire */}
          <div className="mt-5 rounded-2xl bg-[#FFFFFF] p-4 ring-1 ring-[#0B2A3C]/[0.07]">
            <p className="text-[14px] font-bold">{request.title || 'Demande'}</p>
            <dl className="mt-3 flex flex-col divide-y divide-[#0B2A3C]/[0.06]">
              {request.fields.map((f, i) => (
                <div key={`${f.label}-${i}`} className="grid gap-1 py-2.5 sm:grid-cols-[150px_1fr] sm:gap-4">
                  <dt className="text-[13px] font-semibold text-[#0B2A3C]/55">{f.label}</dt>
                  <dd className="whitespace-pre-line break-words text-[15px]">{f.value || '—'}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {photo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0B2A3C]/85 p-4" onMouseDown={() => setPhoto(null)}>
          <img src={requestPhotoUrl(request.reference, photo)} alt={`Photo ${photo}`} className="max-h-full max-w-full rounded-xl object-contain" />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- liste
type TypeFilter = 'toutes' | RequestType;
type StatusFilter = 'tous' | 'a_traiter' | RequestStatus;

export function RequestsPanel({
  requests,
  onRequestsChange,
  onReload,
  onError,
}: {
  readonly requests: readonly SiteRequest[] | null;
  readonly onRequestsChange: (list: SiteRequest[]) => void;
  readonly onReload: () => void;
  readonly onError: (reason: ApiFailure) => void;
}) {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('toutes');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('a_traiter');
  const [open, setOpen] = useState<SiteRequest | null>(null);
  const list = requests ?? [];

  const counts = useMemo(() => {
    const now = new Date();
    const c = { nouvelles: 0, enCours: 0, mois: 0, total: list.length };
    for (const r of list) {
      if (r.status === 'nouvelle') c.nouvelles++;
      if (r.status === 'en_cours' || r.status === 'devis_envoye') c.enCours++;
      const d = new Date(r.receivedAt);
      if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) c.mois++;
    }
    return c;
  }, [list]);

  const visible = useMemo(
    () =>
      list.filter((r) => {
        if (typeFilter !== 'toutes' && r.type !== typeFilter) return false;
        if (statusFilter === 'a_traiter' && !['nouvelle', 'en_cours', 'devis_envoye'].includes(r.status)) return false;
        if (statusFilter !== 'tous' && statusFilter !== 'a_traiter' && r.status !== statusFilter) return false;
        return matchesRequestSearch(r, query);
      }),
    [list, typeFilter, statusFilter, query]
  );

  const exportCsv = () => {
    const blob = new Blob([requestsToCsv(visible)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `demandes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const chip = (active: boolean) =>
    `h-9 cursor-pointer whitespace-nowrap rounded-full px-3.5 text-[14px] font-semibold transition ${active ? 'bg-[#0B2A3C] text-[#FFFFFF]' : 'bg-[#FFFFFF] text-[#0B2A3C]/70 ring-1 ring-[#0B2A3C]/[0.08] hover:text-[#0E6BA8]'}`;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[26px] font-bold tracking-[-0.02em] sm:text-[30px]">Demandes du site</h1>
          <p className="mt-1 text-[14.5px] text-[#0B2A3C]/60">Devis, contacts, partenaires et photos après sinistre. Elles arrivent aussi par e-mail.</p>
        </div>
        <button type="button" onClick={onReload} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-[#FFFFFF] px-4 text-[14px] font-semibold text-[#0B2A3C]/75 shadow-[0_6px_18px_-12px_rgba(11,42,60,0.5)] ring-1 ring-[#0B2A3C]/[0.08] transition hover:text-[#0E6BA8]">
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Actualiser
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Nouvelles, à rappeler', value: counts.nouvelles, tone: 'bg-[#FDECEA] text-[#B0321F]', icon: Inbox },
          { label: 'En cours ou devis envoyé', value: counts.enCours, tone: 'bg-[#FFF4DC] text-[#9A6400]', icon: RefreshCw },
          { label: 'Reçues ce mois-ci', value: counts.mois, tone: 'bg-[#E6F1FA] text-[#0E6BA8]', icon: FileText },
          { label: 'Au total', value: counts.total, tone: 'bg-[#E4F7F3] text-[#0F7A6D]', icon: MessageSquare },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-[#FFFFFF] p-4 shadow-[0_10px_30px_-20px_rgba(11,42,60,0.45)] ring-1 ring-[#0B2A3C]/[0.06] sm:p-5">
            <span className={`grid h-10 w-10 place-items-center rounded-xl ${s.tone}`}>
              <s.icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="mt-3 font-display text-[28px] font-bold leading-none tabular-nums">{s.value}</p>
            <p className="mt-1.5 text-[13.5px] text-[#0B2A3C]/60">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block w-full lg:max-w-[420px]">
            <span className="sr-only">Rechercher une demande</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#0B2A3C]/40" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nom, téléphone, référence, quartier…"
              className="h-12 w-full rounded-full border border-[#0B2A3C]/10 bg-[#FFFFFF] pl-11 pr-4 text-[15.5px] shadow-[0_6px_18px_-14px_rgba(11,42,60,0.5)] focus:border-[#1391B8] focus:outline-none focus:ring-4 focus:ring-[#1391B8]/15"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {(['toutes', 'devis', 'contact', 'partenaire', 'sinistre'] as const).map((t) => (
              <button key={t} type="button" aria-pressed={typeFilter === t} onClick={() => setTypeFilter(t)} className={chip(typeFilter === t)}>
                {t === 'toutes' ? 'Tous types' : REQUEST_TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(['a_traiter', 'tous', ...STATUSES] as const).map((s) => (
            <button key={s} type="button" aria-pressed={statusFilter === s} onClick={() => setStatusFilter(s)} className={chip(statusFilter === s)}>
              {s === 'a_traiter' ? 'À traiter' : s === 'tous' ? 'Toutes' : REQUEST_STATUS_LABELS[s]}
            </button>
          ))}
          <button type="button" onClick={exportCsv} disabled={visible.length === 0} className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-[#FFFFFF] px-3.5 text-[14px] font-semibold text-[#0E6BA8] ring-1 ring-[#1391B8]/30 transition hover:bg-[#F0F9FC] disabled:cursor-not-allowed disabled:opacity-50">
            <Download className="h-4 w-4" aria-hidden="true" />
            Excel
          </button>
        </div>
      </div>

      {requests === null ? (
        <p className="mt-10 text-center text-[15px] text-[#0B2A3C]/55">Chargement…</p>
      ) : visible.length === 0 ? (
        <div className="mt-8 rounded-2xl border-2 border-dashed border-[#0B2A3C]/10 bg-[#FFFFFF]/60 px-6 py-12 text-center">
          <Inbox className="mx-auto h-8 w-8 text-[#1391B8]/60" aria-hidden="true" />
          <p className="mt-3 font-semibold">{list.length === 0 ? 'Aucune demande pour l’instant.' : 'Aucune demande ici.'}</p>
          <p className="mt-1 text-[14px] text-[#0B2A3C]/55">{list.length === 0 ? 'Les demandes envoyées par le site apparaîtront ici.' : 'Essayez « Toutes » ou une autre recherche.'}</p>
        </div>
      ) : (
        <>
          <p className="mt-6 text-[13.5px] text-[#0B2A3C]/55">
            {visible.length} demande{visible.length > 1 ? 's' : ''}
          </p>
          <ul className="mt-2 flex flex-col gap-2.5">
            {visible.map((r) => {
              const T = TYPE_STYLE[r.type];
              const name = requestField(r, 'Nom');
              const place = requestField(r, 'Lieu', 'Ville', 'Adresse');
              const phone = requestField(r, 'Téléphone');
              return (
                <li key={r.reference}>
                  <button type="button" onClick={() => setOpen(r)} className="group flex w-full cursor-pointer items-center gap-4 rounded-2xl bg-[#FFFFFF] p-4 text-left shadow-[0_10px_30px_-24px_rgba(11,42,60,0.55)] ring-1 ring-[#0B2A3C]/[0.06] transition hover:ring-[#1391B8]/40">
                    <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${T.className}`}>
                      <T.icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-[15.5px] font-bold">{name || 'Sans nom'}</span>
                        <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${STATUS_STYLE[r.status]}`}>{REQUEST_STATUS_LABELS[r.status]}</span>
                        {r.photos.length > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#F1F3F5] px-2 py-0.5 text-[12px] font-semibold text-[#5B6770]">
                            <Camera className="h-3.5 w-3.5" aria-hidden="true" />
                            {r.photos.length}
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block truncate text-[14.5px] text-[#0B2A3C]/75">{requestSummary(r) || r.title}</span>
                      <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[13px] text-[#0B2A3C]/50">
                        <span>{REQUEST_TYPE_LABELS[r.type]} · {formatDateTime(r.receivedAt)}</span>
                        {place && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                            {place}
                          </span>
                        )}
                        {phone && <span className="tabular-nums">{phone}</span>}
                      </span>
                      {r.note && <span className="mt-1.5 block truncate rounded-lg bg-[#F5FAFC] px-2.5 py-1 text-[13px] text-[#0B2A3C]/70">Note : {r.note}</span>}
                    </span>
                    <ChevronRight className="h-5 w-5 shrink-0 text-[#0B2A3C]/30 transition group-hover:translate-x-0.5 group-hover:text-[#0E6BA8]" aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {open && (
        <RequestDetail
          request={open}
          onClose={() => setOpen(null)}
          onError={onError}
          onSaved={(saved) => {
            onRequestsChange(list.map((x) => (x.reference === saved.reference ? saved : x)));
            setOpen(saved);
          }}
        />
      )}
    </div>
  );
}

