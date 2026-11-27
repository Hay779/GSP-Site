import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Archive, ArchiveRestore, Check, Copy, Download, Image as ImageIcon, Link2, Megaphone, Pencil, Plus, QrCode, Sparkles, X } from 'lucide-react';
import { fetchStats, failureMessage, type ApiFailure, type DayStats, type OfferSignup } from '../../utils/gestion';
import { DEFAULT_SLUG, offerUrl, reductionBadge, reductionLabel, slugify, type OfferConfig } from '../../utils/offers';
import {
  campaignResult,
  campaignUrl,
  CHANNEL_LABELS,
  fetchCampaigns,
  formatEuros,
  saveCampaign,
  validateCampaign,
  type Campaign,
  type CampaignErrors,
  type Channel,
} from '../../utils/campaigns';
import { AUDIENCE_LABELS, googleAd, LIMITS, socialAds, type Audience } from '../../utils/adCopy';
import { buildVisualSvg, downloadVisualPng, toDataUrl, VISUAL_FORMATS, type VisualFormat } from '../../utils/adVisual';
import { THEMES, themeGradient, type ThemeId } from '../../utils/offerPage';
import { SITE_URL } from '../../utils/seo';
import { encodeQr, qrToSvg } from '../../utils/qrcode';
import logoUrl from '../../assets/images/logo_republique_light.png';
import { REVIEWS_SOURCE } from '../../data/reviewsContent';

const SEA = 'linear-gradient(120deg,#0E6BA8 0%,#1391B8 50%,#17B3A3 100%)';
const INPUT = 'mt-1.5 h-11 w-full rounded-xl border border-[#0B2A3C]/15 bg-[#FFFFFF] px-3.5 text-[15.5px] focus:border-[#1391B8] focus:outline-none focus:ring-4 focus:ring-[#1391B8]/15';
const CHANNELS: readonly Channel[] = ['flyer', 'affiche', 'google', 'facebook', 'instagram', 'annuaire', 'autre'];

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function CopyButton({ text, label = 'Copier' }: { readonly text: string; readonly label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard?.writeText(text).then(() => {
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        });
      }}
      className="inline-flex h-8 shrink-0 cursor-pointer items-center gap-1 rounded-full bg-[#F0F9FC] px-3 text-[13px] font-semibold text-[#0E6BA8] hover:bg-[#E6F1FA]"
    >
      {done ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
      {done ? 'Copié' : label}
    </button>
  );
}

function Modal({ title, onClose, children }: { readonly title: string; readonly onClose: () => void; readonly children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#0B2A3C]/45 backdrop-blur-sm sm:items-center sm:p-6" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={title} className="max-h-[92vh] w-full max-w-[620px] overflow-y-auto rounded-t-[26px] bg-[#FFFFFF] p-5 sm:rounded-[26px] sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-display text-[22px] font-bold tracking-[-0.02em]">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Fermer" className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full text-[#0B2A3C]/60 hover:bg-[#F0F9FC]">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- lien + QR code d'une campagne
function LinkModal({ campaign, onClose }: { readonly campaign: Campaign; readonly onClose: () => void }) {
  const url = campaignUrl(campaign);
  const qr = useMemo(() => encodeQr(url, 'H'), [url]);
  const svg = useMemo(() => qrToSvg(qr), [qr]);
  const png = () => {
    const scale = 40;
    const full = (qr.size + 8) * scale;
    const canvas = document.createElement('canvas');
    canvas.width = full;
    canvas.height = full;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, full, full);
    ctx.fillStyle = '#0B2A3C';
    qr.modules.forEach((row, y) => row.forEach((dark, x) => dark && ctx.fillRect((x + 4) * scale, (y + 4) * scale, scale, scale)));
    canvas.toBlob((b) => b && download(b, `qr-campagne-${campaign.id}.png`), 'image/png');
  };
  const isPrint = campaign.channel === 'flyer' || campaign.channel === 'affiche';
  return (
    <Modal title={`Lien de la campagne : ${campaign.name}`} onClose={onClose}>
      <p className="text-[14.5px] leading-[1.55] text-[#0B2A3C]/70">
        {isPrint
          ? 'Mettez ce QR code sur vos flyers ou affiches : chaque scan est compté pour cette campagne.'
          : 'Utilisez ce lien comme « URL finale » de votre annonce (Google Ads, Facebook…) : chaque visite est comptée pour cette campagne.'}
      </p>
      <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#F5FAFC] p-3">
        <p className="min-w-0 flex-1 break-all font-mono text-[13.5px]">{url}</p>
        <CopyButton text={url} />
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-[200px_1fr] sm:items-center">
        <div className="mx-auto w-[200px] overflow-hidden rounded-2xl ring-1 ring-[#0B2A3C]/10" dangerouslySetInnerHTML={{ __html: svg }} />
        <div className="flex flex-col gap-2">
          <button type="button" onClick={png} className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full text-[15px] font-semibold text-[#FFFFFF] transition hover:brightness-110" style={{ backgroundImage: SEA }}>
            <Download className="h-4 w-4" aria-hidden="true" />
            QR code en image (PNG)
          </button>
          <button type="button" onClick={() => download(new Blob([svg], { type: 'image/svg+xml' }), `qr-campagne-${campaign.id}.svg`)} className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-[#0B2A3C]/15 text-[15px] font-semibold hover:border-[#1391B8] hover:text-[#0E6BA8]">
            <Download className="h-4 w-4" aria-hidden="true" />
            QR code pour l’imprimeur (SVG)
          </button>
          <p className="text-[12.5px] leading-[1.5] text-[#0B2A3C]/55">Scannez-le avec votre téléphone avant d’imprimer.</p>
        </div>
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------- création / modification
function CampaignEditor({
  initial,
  isNew,
  offers,
  existingIds,
  onClose,
  onSaved,
}: {
  readonly initial: Campaign;
  readonly isNew: boolean;
  readonly offers: readonly OfferConfig[];
  readonly existingIds: readonly string[];
  readonly onClose: () => void;
  readonly onSaved: (c: Campaign) => void;
}) {
  const [c, setC] = useState<Campaign>(initial);
  const [idTouched, setIdTouched] = useState(!isNew);
  const [errors, setErrors] = useState<CampaignErrors>({});
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState<ApiFailure | null>(null);
  const set = (patch: Partial<Campaign>) => setC((x) => ({ ...x, ...patch }));
  const err = (k: keyof CampaignErrors) => (errors[k] ? '!border-[#C0392B]' : '');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validateCampaign(c, existingIds, isNew);
    setErrors(found);
    if (Object.keys(found).length) return;
    setSaving(true);
    setFailure(null);
    const r = await saveCampaign({ ...c, name: c.name.trim(), notes: c.notes.trim() }, isNew);
    setSaving(false);
    if (r.ok) onSaved(r.data);
    else setFailure(r.reason);
  };

  const label = (id: string, text: string, error?: string, children?: ReactNode) => (
    <div>
      <label htmlFor={id} className="text-[14px] font-semibold text-[#0B2A3C]/80">
        {text}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-1 text-[13px] font-medium text-[#C0392B]">
          {error}
        </p>
      )}
    </div>
  );

  return (
    <Modal title={isNew ? 'Nouvelle campagne' : 'Modifier la campagne'} onClose={onClose}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        {label('cp-name', 'Nom de la campagne', errors.name, <input id="cp-name" className={`${INPUT} ${err('name')}`} placeholder="Ex. Flyers syndics Marseille 6e" value={c.name} onChange={(e) => set({ name: e.target.value, ...(idTouched ? {} : { id: slugify(e.target.value) }) })} />)}
        {label(
          'cp-id',
          'Identifiant (dans le lien)',
          errors.id,
          <input
            id="cp-id"
            readOnly={!isNew}
            className={`${INPUT} font-mono read-only:bg-[#F5FAFC] read-only:text-[#0B2A3C]/60 ${err('id')}`}
            value={c.id}
            onChange={(e) => {
              setIdTouched(true);
              set({ id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') });
            }}
          />
        )}
        <div>
          <p className="text-[14px] font-semibold text-[#0B2A3C]/80">Support</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {CHANNELS.map((ch) => (
              <button key={ch} type="button" aria-pressed={c.channel === ch} onClick={() => set({ channel: ch })} className={`h-9 cursor-pointer rounded-full px-3.5 text-[14px] font-semibold transition ${c.channel === ch ? 'bg-[#0B2A3C] text-[#FFFFFF]' : 'bg-[#F5FAFC] text-[#0B2A3C]/70 ring-1 ring-[#0B2A3C]/[0.08] hover:text-[#0E6BA8]'}`}>
                {CHANNEL_LABELS[ch]}
              </button>
            ))}
          </div>
        </div>
        {label(
          'cp-offer',
          'Offre liée (page où mène le lien)',
          undefined,
          <select id="cp-offer" className={`${INPUT} cursor-pointer`} value={c.offer} onChange={(e) => set({ offer: e.target.value })}>
            <option value="">Aucune : accueil du site</option>
            {offers.map((o) => (
              <option key={o.slug} value={o.slug}>
                {o.name}
              </option>
            ))}
          </select>
        )}
        <div className="grid gap-4 sm:grid-cols-3">
          {label('cp-budget', 'Budget (€)', errors.budget, <input id="cp-budget" type="number" min={0} step="any" inputMode="decimal" className={`${INPUT} ${err('budget')}`} value={Number.isFinite(c.budget) ? c.budget : ''} onChange={(e) => set({ budget: e.target.value === '' ? 0 : Number(e.target.value) })} />)}
          {label('cp-start', 'Début', undefined, <input id="cp-start" type="date" className={INPUT} value={c.start} onChange={(e) => set({ start: e.target.value })} />)}
          {label('cp-end', 'Fin (facultatif)', errors.end, <input id="cp-end" type="date" className={`${INPUT} ${err('end')}`} value={c.end} onChange={(e) => set({ end: e.target.value })} />)}
        </div>
        {label('cp-notes', 'Notes (facultatif)', undefined, <textarea id="cp-notes" rows={2} maxLength={500} className="mt-1.5 w-full rounded-xl border border-[#0B2A3C]/15 px-3.5 py-2.5 text-[15px] focus:border-[#1391B8] focus:outline-none focus:ring-4 focus:ring-[#1391B8]/15" placeholder="Ex. 500 flyers déposés chez 12 syndics" value={c.notes} onChange={(e) => set({ notes: e.target.value })} />)}
        {failure && <p role="alert" className="rounded-xl bg-[#FDECEA] px-4 py-3 text-[14px] font-medium text-[#A8321F]">{failureMessage(failure)}</p>}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="h-11 cursor-pointer rounded-full border border-[#0B2A3C]/15 px-5 text-[15px] font-semibold hover:border-[#1391B8]">
            Annuler
          </button>
          <button type="submit" disabled={saving} className="h-11 cursor-pointer rounded-full px-6 text-[15px] font-semibold text-[#FFFFFF] transition hover:brightness-110 disabled:opacity-60" style={{ backgroundImage: SEA }}>
            {saving ? 'Enregistrement…' : isNew ? 'Créer la campagne' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ---------------------------------------------------------------- onglet « Campagnes »
function campaignState(c: Campaign): { label: string; tone: string } {
  const today = new Date().toISOString().slice(0, 10);
  if (c.archived) return { label: 'Archivée', tone: 'bg-[#F1F3F5] text-[#5B6770]' };
  if (c.start && today < c.start) return { label: 'À venir', tone: 'bg-[#E6F1FA] text-[#0E6BA8]' };
  if (c.end && today > c.end) return { label: 'Terminée', tone: 'bg-[#FFF4DC] text-[#9A6400]' };
  return { label: 'En cours', tone: 'bg-[#E4F7F3] text-[#0F7A6D]' };
}

function fmtDay(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : '';
}

function CampaignsTab({ offers, signups, onError, prefill, onPrefillUsed }: { readonly offers: readonly OfferConfig[]; readonly signups: readonly OfferSignup[]; readonly onError: (r: ApiFailure) => void; readonly prefill: Partial<Campaign> | null; readonly onPrefillUsed: () => void }) {
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);
  const [stats, setStats] = useState<DayStats[]>([]);
  const [editing, setEditing] = useState<{ c: Campaign; isNew: boolean } | null>(null);
  const [linkFor, setLinkFor] = useState<Campaign | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    void Promise.all([fetchCampaigns(), fetchStats(400)]).then(([c, s]) => {
      if (c.ok) setCampaigns(c.data);
      else onError(c.reason);
      if (s.ok) setStats(s.data);
    });
  }, [onError]);

  const blank = useCallback(
    (p: Partial<Campaign> = {}): Campaign => ({ name: '', channel: 'flyer', offer: DEFAULT_SLUG, start: new Date().toISOString().slice(0, 10), end: '', budget: 0, notes: '', archived: false, ...p, id: p.id ?? (p.name ? slugify(p.name) : '') }),
    []
  );

  useEffect(() => {
    if (prefill && campaigns) {
      setEditing({ c: blank(prefill), isNew: true });
      onPrefillUsed();
    }
  }, [prefill, campaigns, blank, onPrefillUsed]);

  const upsert = (saved: Campaign) => setCampaigns((list) => ((list ?? []).some((x) => x.id === saved.id) ? (list ?? []).map((x) => (x.id === saved.id ? saved : x)) : [...(list ?? []), saved]));
  const visible = (campaigns ?? []).filter((c) => showArchived || !c.archived);
  const results = useMemo(() => new Map(visible.map((c) => [c.id, campaignResult(c, stats, signups)])), [visible, stats, signups]);
  const totals = useMemo(() => {
    let budget = 0;
    let clients = 0;
    let inscr = 0;
    for (const c of visible) {
      budget += c.budget;
      clients += results.get(c.id)?.clients ?? 0;
      inscr += results.get(c.id)?.signups ?? 0;
    }
    return { budget, clients, inscr, perClient: budget > 0 && clients > 0 ? budget / clients : null };
  }, [visible, results]);
  const offerName = new Map(offers.map((o) => [o.slug, o.name]));

  const toggleArchive = async (c: Campaign) => {
    const r = await saveCampaign({ ...c, archived: !c.archived }, false);
    if (r.ok) upsert(r.data);
    else onError(r.reason);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 text-[14px] font-medium text-[#0B2A3C]/70">
          <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} className="h-[18px] w-[18px] accent-[#0E6BA8]" />
          Afficher les campagnes archivées
        </label>
        <button type="button" onClick={() => setEditing({ c: blank(), isNew: true })} className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full px-5 text-[15px] font-semibold text-[#FFFFFF] shadow-[0_12px_26px_-12px_rgba(14,107,168,0.9)] transition hover:brightness-110" style={{ backgroundImage: SEA }}>
          <Plus className="h-4 w-4" strokeWidth={2.6} aria-hidden="true" />
          Nouvelle campagne
        </button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Budget des campagnes', value: formatEuros(totals.budget) },
          { label: 'Inscriptions apportées', value: String(totals.inscr) },
          { label: 'Clients (codes utilisés)', value: String(totals.clients) },
          { label: 'Coût moyen par client', value: totals.perClient === null ? '—' : formatEuros(Math.round(totals.perClient * 100) / 100) },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl bg-[#FFFFFF] p-4 ring-1 ring-[#0B2A3C]/[0.06] sm:p-5">
            <p className="font-display text-[26px] font-bold leading-none tabular-nums">{k.value}</p>
            <p className="mt-1.5 text-[13.5px] text-[#0B2A3C]/60">{k.label}</p>
          </div>
        ))}
      </div>

      {campaigns === null ? (
        <p className="mt-10 text-center text-[15px] text-[#0B2A3C]/55">Chargement…</p>
      ) : visible.length === 0 ? (
        <div className="mt-8 rounded-2xl border-2 border-dashed border-[#0B2A3C]/10 bg-[#FFFFFF]/60 px-6 py-12 text-center">
          <Megaphone className="mx-auto h-8 w-8 text-[#1391B8]/60" aria-hidden="true" />
          <p className="mt-3 font-semibold">Aucune campagne pour l’instant.</p>
          <p className="mt-1 text-[14px] text-[#0B2A3C]/55">Créez-en une pour chaque flyer, affiche ou annonce : vous saurez ce qu’elle rapporte.</p>
        </div>
      ) : (
        <ul className="mt-5 grid gap-3 lg:grid-cols-2">
          {visible.map((c) => {
            const r = results.get(c.id);
            const st = campaignState(c);
            return (
              <li key={c.id} className="flex flex-col rounded-2xl bg-[#FFFFFF] p-5 shadow-[0_10px_30px_-22px_rgba(11,42,60,0.5)] ring-1 ring-[#0B2A3C]/[0.06]">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#0B2A3C] px-2.5 py-0.5 text-[12px] font-semibold text-[#FFFFFF]">{CHANNEL_LABELS[c.channel]}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${st.tone}`}>{st.label}</span>
                </div>
                <p className="mt-2 font-display text-[17px] font-bold leading-tight">{c.name}</p>
                <p className="mt-1 text-[13.5px] text-[#0B2A3C]/55">
                  {c.start ? `Depuis le ${fmtDay(c.start)}` : 'Sans date'}
                  {c.end ? ` jusqu’au ${fmtDay(c.end)}` : ''} · {c.offer ? offerName.get(c.offer) ?? c.offer : 'Accueil du site'} · budget {formatEuros(c.budget)}
                </p>
                {r && (
                  <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-[#F5FAFC] p-3 text-center sm:grid-cols-4">
                    {[
                      { label: 'Visites par le lien', value: String(r.visits) },
                      { label: c.offer ? 'Inscriptions' : 'Vues', value: c.offer ? String(r.signups) : String(r.visits) },
                      { label: 'Clients', value: c.offer ? String(r.clients) : '—' },
                      { label: 'Coût par client', value: r.costPerClient === null ? '—' : formatEuros(r.costPerClient) },
                    ].map((k) => (
                      <span key={k.label}>
                        <span className="block font-display text-[20px] font-bold tabular-nums leading-none">{k.value}</span>
                        <span className="mt-1 block text-[12px] text-[#0B2A3C]/55">{k.label}</span>
                      </span>
                    ))}
                  </div>
                )}
                {c.notes && <p className="mt-3 text-[13.5px] text-[#0B2A3C]/65">{c.notes}</p>}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" onClick={() => setLinkFor(c)} className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full px-4 text-[14px] font-semibold text-[#FFFFFF] transition hover:brightness-110" style={{ backgroundImage: SEA }}>
                    {c.channel === 'flyer' || c.channel === 'affiche' ? <QrCode className="h-4 w-4" aria-hidden="true" /> : <Link2 className="h-4 w-4" aria-hidden="true" />}
                    Lien et QR code
                  </button>
                  <button type="button" onClick={() => setEditing({ c, isNew: false })} className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full border border-[#0B2A3C]/12 px-4 text-[14px] font-semibold text-[#0B2A3C]/75 hover:border-[#1391B8] hover:text-[#0E6BA8]">
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                    Modifier
                  </button>
                  <button type="button" onClick={() => void toggleArchive(c)} className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full border border-[#0B2A3C]/12 px-4 text-[14px] font-semibold text-[#0B2A3C]/75 hover:border-[#1391B8] hover:text-[#0E6BA8]">
                    {c.archived ? <ArchiveRestore className="h-4 w-4" aria-hidden="true" /> : <Archive className="h-4 w-4" aria-hidden="true" />}
                    {c.archived ? 'Réactiver' : 'Archiver'}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-4 text-[13px] leading-[1.55] text-[#0B2A3C]/55">
        « Clients » = codes de réduction utilisés parmi les inscriptions à l’offre liée pendant la campagne. Les visites sont comptées à partir de la mise en ligne du compteur.
      </p>

      {editing && (
        <CampaignEditor
          initial={editing.c}
          isNew={editing.isNew}
          offers={offers}
          existingIds={(campaigns ?? []).map((c) => c.id)}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            upsert(saved);
            setEditing(null);
            if (editing.isNew) setLinkFor(saved);
          }}
        />
      )}
      {linkFor && <LinkModal campaign={linkFor} onClose={() => setLinkFor(null)} />}
    </div>
  );
}

// ---------------------------------------------------------------- onglet « Créer une pub »
function CreatorTab({ offers, onCreateCampaign }: { readonly offers: readonly OfferConfig[]; readonly onCreateCampaign: (p: Partial<Campaign>) => void }) {
  const active = offers.filter((o) => o.active);
  const [offerSlug, setOfferSlug] = useState<string>(active[0]?.slug ?? '');
  const [audience, setAudience] = useState<Audience>('tous');
  const offer = offers.find((o) => o.slug === offerSlug) ?? null;
  const url = offer ? offerUrl(offer.slug) : `${SITE_URL}/`;
  const g = useMemo(() => googleAd(offer, audience), [offer, audience]);
  const social = useMemo(() => socialAds(offer, audience, url), [offer, audience, url]);

  // Visuel
  const [format, setFormat] = useState<VisualFormat>('carre');
  const [theme, setTheme] = useState<ThemeId>(offer?.page.theme ?? 'mer');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [cta, setCta] = useState('');
  const [logo, setLogo] = useState<string | undefined>();
  useEffect(() => {
    void toDataUrl(logoUrl).then(setLogo).catch(() => setLogo(undefined));
  }, []);
  useEffect(() => {
    setTheme(offer?.page.theme ?? 'mer');
    setTitle(offer ? offer.title : 'Votre serrurier à Marseille');
    setSubtitle(offer ? `${offer.description} Code valable ${offer.months} mois.` : 'Serrurerie, clés et badges, vitrerie, menuiserie. Agréé assurances.');
    setCta(offer ? 'Inscription en 30 secondes' : '48 rue de la République');
  }, [offer]);
  const svg = useMemo(
    () => buildVisualSvg({ format, theme, badge: offer ? reductionBadge(offer) : REVIEWS_SOURCE.googleAverage ? `${REVIEWS_SOURCE.googleAverage.toLocaleString('fr-FR')}★` : '★', title, subtitle, cta, footer: 'Serrurerie de la République · 04 91 90 51 65', logoDataUrl: logo }),
    [format, theme, offer, title, subtitle, cta, logo]
  );
  const f = VISUAL_FORMATS.find((x) => x.id === format) ?? VISUAL_FORMATS[0];

  const chip = (on: boolean) => `h-9 cursor-pointer rounded-full px-3.5 text-[14px] font-semibold transition ${on ? 'bg-[#0B2A3C] text-[#FFFFFF]' : 'bg-[#FFFFFF] text-[#0B2A3C]/70 ring-1 ring-[#0B2A3C]/[0.08] hover:text-[#0E6BA8]'}`;
  const card = 'rounded-2xl bg-[#FFFFFF] p-4 ring-1 ring-[#0B2A3C]/[0.06] sm:p-5';

  return (
    <div className="flex flex-col gap-5">
      <div className={card}>
        <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <label htmlFor="ad-offer" className="text-[14px] font-semibold text-[#0B2A3C]/80">
              Pub pour…
            </label>
            <select id="ad-offer" className={`${INPUT} cursor-pointer`} value={offerSlug} onChange={(e) => setOfferSlug(e.target.value)}>
              {active.map((o) => (
                <option key={o.slug} value={o.slug}>
                  {o.name} ({reductionLabel(o)})
                </option>
              ))}
              <option value="">Le site, sans offre</option>
            </select>
          </div>
          <div>
            <p className="text-[14px] font-semibold text-[#0B2A3C]/80">Public visé</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(Object.keys(AUDIENCE_LABELS) as Audience[]).map((a) => (
                <button key={a} type="button" aria-pressed={audience === a} onClick={() => setAudience(a)} className={chip(audience === a)}>
                  {AUDIENCE_LABELS[a]}
                </button>
              ))}
            </div>
          </div>
        </div>
        <p className="mt-3 text-[13px] text-[#0B2A3C]/55">Les textes utilisent seulement des informations vraies de la boutique. Relisez-les et adaptez-les avant de les publier.</p>
      </div>

      {/* Google */}
      <div className={card}>
        <h2 className="font-display text-[18px] font-bold">Google Ads (annonce responsive)</h2>
        <p className="text-[13.5px] text-[#0B2A3C]/55">Collez les titres et descriptions dans votre annonce. Google les combine tout seul.</p>
        <div className="mt-4 grid gap-5 lg:grid-cols-2">
          <div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-[14px] font-bold">Titres ({g.headlines.length}) · 30 caractères max.</p>
              <CopyButton text={g.headlines.join('\n')} label="Tout copier" />
            </div>
            <ul className="mt-2 flex flex-col gap-1.5">
              {g.headlines.map((h) => (
                <li key={h} className="flex items-center justify-between gap-2 rounded-lg bg-[#F5FAFC] px-3 py-1.5 text-[14.5px]">
                  <span className="min-w-0 truncate">{h}</span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="text-[12px] tabular-nums text-[#0B2A3C]/45">{h.length}/{LIMITS.googleHeadline}</span>
                    <CopyButton text={h} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-[14px] font-bold">Descriptions ({g.descriptions.length}) · 90 caractères max.</p>
              <CopyButton text={g.descriptions.join('\n')} label="Tout copier" />
            </div>
            <ul className="mt-2 flex flex-col gap-1.5">
              {g.descriptions.map((d) => (
                <li key={d} className="flex items-start justify-between gap-2 rounded-lg bg-[#F5FAFC] px-3 py-2 text-[14.5px]">
                  <span className="min-w-0">{d}</span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="text-[12px] tabular-nums text-[#0B2A3C]/45">{d.length}/{LIMITS.googleDescription}</span>
                    <CopyButton text={d} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Facebook / Instagram */}
      <div className={card}>
        <h2 className="font-display text-[18px] font-bold">Facebook et Instagram</h2>
        <p className="text-[13.5px] text-[#0B2A3C]/55">Trois versions au choix : texte principal, titre et description.</p>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {social.map((s, i) => (
            <div key={i} className="flex flex-col rounded-xl bg-[#F5FAFC] p-3.5">
              <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#1391B8]">Version {i + 1}</p>
              <p className="mt-2 flex-1 whitespace-pre-line text-[14px] leading-[1.5]">{s.primary}</p>
              <p className="mt-3 text-[13px]">
                <span className="font-semibold">Titre :</span> {s.headline}
              </p>
              <p className="text-[13px]">
                <span className="font-semibold">Description :</span> {s.description}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <CopyButton text={s.primary} label="Copier le texte" />
                <CopyButton text={s.headline} label="Copier le titre" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visuel */}
      <div className={card}>
        <h2 className="flex items-center gap-2 font-display text-[18px] font-bold">
          <ImageIcon className="h-5 w-5 text-[#0E6BA8]" aria-hidden="true" />
          Visuel à publier
        </h2>
        <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_auto]">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {VISUAL_FORMATS.map((v) => (
                <button key={v.id} type="button" aria-pressed={format === v.id} onClick={() => setFormat(v.id)} className={chip(format === v.id)} title={v.hint}>
                  {v.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Couleurs du visuel">
              {THEMES.map((t) => (
                <button key={t.id} type="button" role="radio" aria-checked={theme === t.id} aria-label={t.label} title={t.label} onClick={() => setTheme(t.id)} className={`h-9 w-14 cursor-pointer rounded-full ring-2 ring-offset-2 transition ${theme === t.id ? 'ring-[#0B2A3C]' : 'ring-transparent hover:ring-[#0B2A3C]/25'}`} style={{ backgroundImage: themeGradient(t.id) }} />
              ))}
            </div>
            <div>
              <label htmlFor="ad-title" className="text-[14px] font-semibold text-[#0B2A3C]/80">Titre</label>
              <input id="ad-title" maxLength={60} className={INPUT} value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label htmlFor="ad-sub" className="text-[14px] font-semibold text-[#0B2A3C]/80">Phrase</label>
              <textarea id="ad-sub" rows={2} maxLength={130} className="mt-1.5 w-full rounded-xl border border-[#0B2A3C]/15 px-3.5 py-2.5 text-[15px] focus:border-[#1391B8] focus:outline-none focus:ring-4 focus:ring-[#1391B8]/15" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
            </div>
            <div>
              <label htmlFor="ad-cta" className="text-[14px] font-semibold text-[#0B2A3C]/80">Bouton</label>
              <input id="ad-cta" maxLength={30} className={INPUT} value={cta} onChange={(e) => setCta(e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => void downloadVisualPng(svg, f.w, f.h, `pub-${offer?.slug ?? 'site'}-${format}.png`)} className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full px-5 text-[15px] font-semibold text-[#FFFFFF] transition hover:brightness-110" style={{ backgroundImage: SEA }}>
                <Download className="h-4 w-4" aria-hidden="true" />
                Télécharger l’image
              </button>
              <button type="button" onClick={() => onCreateCampaign({ channel: format === 'story' ? 'instagram' : 'facebook', offer: offer?.slug ?? '', name: `${format === 'story' ? 'Instagram' : 'Facebook'} · ${offer?.name ?? 'site'}` })} className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border border-[#0B2A3C]/15 px-5 text-[15px] font-semibold hover:border-[#1391B8] hover:text-[#0E6BA8]">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Créer la campagne de cette pub
              </button>
            </div>
            <p className="text-[12.5px] text-[#0B2A3C]/50">« Créer la campagne » vous donne un lien à mettre dans la pub : ses visites et ses clients seront comptés.</p>
          </div>
          <div className="flex justify-center">
            <div className="overflow-hidden rounded-xl shadow-[0_20px_50px_-20px_rgba(11,42,60,0.55)] ring-1 ring-[#0B2A3C]/10" style={{ width: format === 'story' ? 225 : 320 }}>
              <div style={{ aspectRatio: `${f.w} / ${f.h}` }} dangerouslySetInnerHTML={{ __html: svg.replace(/ width="\d+" height="\d+"/, ' style="display:block;width:100%;height:100%"') }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Rubrique « Publicité » : suivi des campagnes et création de pubs. */
export function AdsPanel({ offers, signups, onError }: { readonly offers: readonly OfferConfig[] | null; readonly signups: readonly OfferSignup[] | null; readonly onError: (r: ApiFailure) => void }) {
  const [tab, setTab] = useState<'campagnes' | 'creer'>('campagnes');
  const [prefill, setPrefill] = useState<Partial<Campaign> | null>(null);
  const clearPrefill = useCallback(() => setPrefill(null), []);
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[26px] font-bold tracking-[-0.02em] sm:text-[30px]">Publicité</h1>
          <p className="mt-1 text-[14.5px] text-[#0B2A3C]/60">Suivez ce que rapporte chaque campagne, et préparez vos pubs Google, Facebook et Instagram.</p>
        </div>
        <div className="flex rounded-full bg-[#FFFFFF] p-1 ring-1 ring-[#0B2A3C]/[0.08]" role="tablist">
          {(
            [
              ['campagnes', 'Campagnes'],
              ['creer', 'Créer une pub'],
            ] as const
          ).map(([id, label]) => (
            <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`h-9 cursor-pointer rounded-full px-4 text-[14px] font-semibold transition ${tab === id ? 'bg-[#0B2A3C] text-[#FFFFFF]' : 'text-[#0B2A3C]/65 hover:text-[#0E6BA8]'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-6">
        {offers === null || signups === null ? (
          <p className="mt-10 text-center text-[15px] text-[#0B2A3C]/55">Chargement…</p>
        ) : tab === 'campagnes' ? (
          <CampaignsTab offers={offers} signups={signups} onError={onError} prefill={prefill} onPrefillUsed={clearPrefill} />
        ) : (
          <CreatorTab
            offers={offers}
            onCreateCampaign={(p) => {
              setPrefill(p);
              setTab('campagnes');
            }}
          />
        )}
      </div>
    </div>
  );
}
