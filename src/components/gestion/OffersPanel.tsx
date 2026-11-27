import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { CalendarRange, Check, Copy, Download, ExternalLink, Pause, Pencil, Play, Plus, Printer, QrCode, Users, X } from 'lucide-react';
import {
  DEFAULT_SLUG,
  OFFER_STATUS_LABELS,
  offerPath,
  offerStatus,
  offerUrl,
  reductionLabel,
  STANDARD_CONDITIONS,
  type OfferConfig,
  type OfferStatus,
} from '../../utils/offers';
import { saveOffer, signupStatus, type ApiFailure, type OfferSignup } from '../../utils/gestion';
import { encodeQr, qrToSvg } from '../../utils/qrcode';
import { OfferEditor, type EditorTab } from './OfferEditor';
import { DEFAULT_PAGE, themeGradient } from '../../utils/offerPage';
import { DEFAULT_POSTER } from '../../utils/offerPoster';

const SEA = 'linear-gradient(120deg,#0E6BA8 0%,#1391B8 50%,#17B3A3 100%)';
const INK_HEX = '#0B2A3C';

const STATUS_STYLE: Readonly<Record<OfferStatus, string>> = {
  active: 'bg-[#E4F7F3] text-[#0F7A6D]',
  pause: 'bg-[#F1F3F5] text-[#5B6770]',
  programmee: 'bg-[#E6F1FA] text-[#0E6BA8]',
  terminee: 'bg-[#FFF4DC] text-[#9A6400]',
};

function formatDay(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : '';
}

function periodLabel(o: OfferConfig): string {
  if (o.start && o.end) return `Inscriptions du ${formatDay(o.start)} au ${formatDay(o.end)}`;
  if (o.start) return `Inscriptions à partir du ${formatDay(o.start)}`;
  if (o.end) return `Inscriptions jusqu’au ${formatDay(o.end)}`;
  return 'Inscriptions sans date de fin';
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ---------------------------------------------------------------- fenêtre
function Modal({ title, onClose, children }: { readonly title: string; readonly onClose: () => void; readonly children: ReactNode }) {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    closeRef.current?.focus();
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
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#0B2A3C]/45 p-0 backdrop-blur-sm sm:items-center sm:p-6" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={title} className="max-h-[92vh] w-full max-w-[640px] overflow-y-auto rounded-t-[26px] bg-[#FFFFFF] p-5 shadow-[0_30px_80px_-20px_rgba(11,42,60,0.5)] sm:rounded-[26px] sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-display text-[22px] font-bold tracking-[-0.02em]">{title}</h2>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Fermer" className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full text-[#0B2A3C]/60 hover:bg-[#F0F9FC] hover:text-[#0E6BA8]">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- QR code
function QrModal({ offer, onClose }: { readonly offer: OfferConfig; readonly onClose: () => void }) {
  const url = offerUrl(offer.slug);
  const qr = useMemo(() => encodeQr(url, 'H'), [url]);
  const svg = useMemo(() => qrToSvg(qr, INK_HEX), [qr]);
  const [copied, setCopied] = useState(false);

  const downloadPng = () => {
    const scale = 40;
    const full = (qr.size + 8) * scale;
    const canvas = document.createElement('canvas');
    canvas.width = full;
    canvas.height = full;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, full, full);
    ctx.fillStyle = INK_HEX;
    qr.modules.forEach((row, y) => row.forEach((dark, x) => dark && ctx.fillRect((x + 4) * scale, (y + 4) * scale, scale, scale)));
    canvas.toBlob((blob) => blob && download(blob, `qr-offre-${offer.slug}.png`), 'image/png');
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Modal title={`QR code : ${offer.name}`} onClose={onClose}>
      <div className="grid gap-5 sm:grid-cols-[220px_1fr] sm:items-center">
        <div className="mx-auto w-[220px] overflow-hidden rounded-2xl ring-1 ring-[#0B2A3C]/10" dangerouslySetInnerHTML={{ __html: svg }} />
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#1391B8]">Adresse de la page</p>
          <p className="mt-1 break-all font-mono text-[14px]">{url}</p>
          <div className="mt-4 flex flex-col gap-2">
            <button type="button" onClick={downloadPng} className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full text-[15px] font-semibold text-[#FFFFFF] shadow-[0_12px_26px_-12px_rgba(14,107,168,0.9)] transition hover:brightness-110" style={{ backgroundImage: SEA }}>
              <Download className="h-4 w-4" aria-hidden="true" />
              Image pour le flyer (PNG)
            </button>
            <button type="button" onClick={() => download(new Blob([svg], { type: 'image/svg+xml' }), `qr-offre-${offer.slug}.svg`)} className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-[#0B2A3C]/15 text-[15px] font-semibold transition hover:border-[#1391B8] hover:text-[#0E6BA8]">
              <Download className="h-4 w-4" aria-hidden="true" />
              Fichier pour l’imprimeur (SVG)
            </button>
            <div className="flex gap-2">
              <button type="button" onClick={() => void copy()} className="inline-flex h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-[#F0F9FC] text-[14px] font-semibold text-[#0E6BA8] hover:bg-[#E6F1FA]">
                {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                {copied ? 'Copié' : 'Copier le lien'}
              </button>
              <a href={offerPath(offer.slug)} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-[#F0F9FC] text-[14px] font-semibold text-[#0E6BA8] hover:bg-[#E6F1FA]">
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                Voir la page
              </a>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-5 rounded-xl bg-[#FFF4DC] px-4 py-3 text-[13.5px] leading-[1.55] text-[#7A4F00]">
        Avant d’imprimer, scannez le QR code avec votre téléphone. Une fois imprimé, ne changez plus l’adresse de l’offre ; mettez-la plutôt en pause quand elle est finie.
      </p>
    </Modal>
  );
}

// ---------------------------------------------------------------- liste des offres
function OfferCard({
  offer,
  signups,
  busy,
  onQr,
  onEdit,
  onPoster,
  onToggle,
  onShowSignups,
}: {
  readonly offer: OfferConfig;
  readonly signups: readonly OfferSignup[];
  readonly busy: boolean;
  readonly onQr: () => void;
  readonly onEdit: () => void;
  readonly onPoster: () => void;
  readonly onToggle: () => void;
  readonly onShowSignups: () => void;
}) {
  const status = offerStatus(offer);
  const stats = useMemo(() => {
    let used = 0;
    let valid = 0;
    for (const s of signups) {
      const st = signupStatus(s);
      if (st === 'utilise') used++;
      if (st === 'valide' || st === 'bientot') valid++;
    }
    return { total: signups.length, used, valid };
  }, [signups]);

  return (
    <li className="flex flex-col rounded-2xl bg-[#FFFFFF] p-5 shadow-[0_10px_30px_-22px_rgba(11,42,60,0.5)] ring-1 ring-[#0B2A3C]/[0.06]">
      <div className="flex items-start gap-4">
        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl font-display text-[19px] font-extrabold tracking-[-0.03em] text-[#FFFFFF]" style={{ backgroundImage: themeGradient(offer.page.theme) }}>
          {reductionLabel(offer).replace(' ', '')}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-display text-[17px] font-bold leading-tight">{offer.name}</p>
            <span className={`rounded-full px-2.5 py-0.5 text-[12.5px] font-semibold ${STATUS_STYLE[status]}`}>{OFFER_STATUS_LABELS[status]}</span>
          </div>
          <p className="mt-1 truncate font-mono text-[13px] text-[#0B2A3C]/55">{offerPath(offer.slug)}</p>
          <p className="mt-1 flex items-center gap-1.5 text-[13.5px] text-[#0B2A3C]/60">
            <CalendarRange className="h-4 w-4 shrink-0" aria-hidden="true" />
            {periodLabel(offer)} · code valable {offer.months} mois
          </p>
        </div>
      </div>

      <button type="button" onClick={onShowSignups} className="mt-4 grid cursor-pointer grid-cols-3 gap-2 rounded-xl bg-[#F5FAFC] p-3 text-center transition hover:bg-[#EAF6FB]">
        {[
          { label: 'Inscrits', value: stats.total },
          { label: 'Codes valides', value: stats.valid },
          { label: 'Utilisés', value: stats.used },
        ].map((s) => (
          <span key={s.label}>
            <span className="block font-display text-[22px] font-bold tabular-nums leading-none">{s.value}</span>
            <span className="mt-1 block text-[12.5px] text-[#0B2A3C]/55">{s.label}</span>
          </span>
        ))}
      </button>

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={onQr} className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full px-4 text-[14px] font-semibold text-[#FFFFFF] shadow-[0_10px_22px_-12px_rgba(14,107,168,0.9)] transition hover:brightness-110" style={{ backgroundImage: SEA }}>
          <QrCode className="h-4 w-4" aria-hidden="true" />
          QR code
        </button>
        <button type="button" onClick={onEdit} className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full border border-[#0B2A3C]/12 px-4 text-[14px] font-semibold text-[#0B2A3C]/75 transition hover:border-[#1391B8] hover:text-[#0E6BA8]">
          <Pencil className="h-4 w-4" aria-hidden="true" />
          Modifier
        </button>
        <button type="button" onClick={onPoster} className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full border border-[#0B2A3C]/12 px-4 text-[14px] font-semibold text-[#0B2A3C]/75 transition hover:border-[#1391B8] hover:text-[#0E6BA8]">
          <Printer className="h-4 w-4" aria-hidden="true" />
          Affiche
        </button>
        <button type="button" onClick={onToggle} disabled={busy} className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full border border-[#0B2A3C]/12 px-4 text-[14px] font-semibold text-[#0B2A3C]/75 transition hover:border-[#1391B8] hover:text-[#0E6BA8] disabled:opacity-60">
          {offer.active ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
          {offer.active ? 'Mettre en pause' : 'Réactiver'}
        </button>
      </div>
    </li>
  );
}

const NEW_OFFER: OfferConfig = {
  slug: '',
  name: '',
  title: '',
  description: '',
  reductionType: 'pourcent',
  reductionValue: 5,
  months: 3,
  conditions: ['Sur devis signé.', ...STANDARD_CONDITIONS],
  start: '',
  end: '',
  active: true,
  questions: [],
  page: DEFAULT_PAGE,
  poster: DEFAULT_POSTER,
};

/** Rubrique « Offres & QR codes » de l'espace gestion. */
export function OffersPanel({
  offers,
  signups,
  onOffersChange,
  onShowSignups,
  onError,
}: {
  readonly offers: readonly OfferConfig[] | null;
  readonly signups: readonly OfferSignup[];
  readonly onOffersChange: (offers: OfferConfig[]) => void;
  readonly onShowSignups: (slug: string) => void;
  readonly onError: (reason: ApiFailure) => void;
}) {
  const [qrFor, setQrFor] = useState<OfferConfig | null>(null);
  const [editing, setEditing] = useState<{ offer: OfferConfig; isNew: boolean; tab?: EditorTab } | null>(null);
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const list = offers ?? [];
  const bySlug = useMemo(() => {
    const map = new Map<string, OfferSignup[]>();
    for (const s of signups) map.set(s.offer, [...(map.get(s.offer) ?? []), s]);
    return map;
  }, [signups]);

  const upsert = (saved: OfferConfig) => {
    const exists = list.some((o) => o.slug === saved.slug);
    onOffersChange(exists ? list.map((o) => (o.slug === saved.slug ? saved : o)) : [...list, saved]);
  };

  const toggle = async (o: OfferConfig) => {
    setBusySlug(o.slug);
    const r = await saveOffer({ ...o, active: !o.active }, false);
    setBusySlug(null);
    if (r.ok) upsert(r.data);
    else onError(r.reason);
  };

  const ordered = [...list].sort((a, b) => (a.slug === DEFAULT_SLUG ? -1 : b.slug === DEFAULT_SLUG ? 1 : 0));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[26px] font-bold tracking-[-0.02em] sm:text-[30px]">Offres & QR codes</h1>
          <p className="mt-1 text-[14.5px] text-[#0B2A3C]/60">Créez une offre : sa page d’inscription et son QR code sont prêts tout de suite.</p>
        </div>
        <button type="button" onClick={() => setEditing({ offer: NEW_OFFER, isNew: true })} className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full px-5 text-[15px] font-semibold text-[#FFFFFF] shadow-[0_12px_26px_-12px_rgba(14,107,168,0.9)] transition hover:brightness-110" style={{ backgroundImage: SEA }}>
          <Plus className="h-4 w-4" strokeWidth={2.6} aria-hidden="true" />
          Nouvelle offre
        </button>
      </div>

      {offers === null ? (
        <p className="mt-10 text-center text-[15px] text-[#0B2A3C]/55">Chargement…</p>
      ) : (
        <ul className="mt-6 grid gap-3 lg:grid-cols-2">
          {ordered.map((o) => (
            <OfferCard
              key={o.slug}
              offer={o}
              signups={bySlug.get(o.slug) ?? []}
              busy={busySlug === o.slug}
              onQr={() => setQrFor(o)}
              onEdit={() => setEditing({ offer: o, isNew: false })}
              onPoster={() => setEditing({ offer: o, isNew: false, tab: 'affiche' })}
              onToggle={() => void toggle(o)}
              onShowSignups={() => onShowSignups(o.slug)}
            />
          ))}
        </ul>
      )}
      <p className="mt-5 flex items-center gap-2 text-[13.5px] text-[#0B2A3C]/55">
        <Users className="h-4 w-4" aria-hidden="true" />
        Cliquez sur les chiffres d’une offre pour voir ses inscrits.
      </p>

      {qrFor && <QrModal offer={qrFor} onClose={() => setQrFor(null)} />}
      {editing && (
        <OfferEditor
          initial={editing.offer}
          isNew={editing.isNew}
          initialTab={editing.tab}
          existingSlugs={list.map((o) => o.slug)}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            upsert(saved);
            setEditing(null);
            if (editing.isNew) setQrFor(saved);
          }}
        />
      )}
    </div>
  );
}
