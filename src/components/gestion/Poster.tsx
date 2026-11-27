import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { offerUrl, reductionBadge, type OfferConfig } from '../../utils/offers';
import { themeById } from '../../utils/offerPage';
import { posterFormat } from '../../utils/offerPoster';
import { encodeQr, qrToSvg } from '../../utils/qrcode';
import logoUrl from '../../assets/images/logo_republique_light.png';

/** Largeur de référence (A4) : les autres formats sont des réductions du même dessin. */
const BASE_W = 210;
const INK = '#0B2A3C';

interface PosterProps {
  readonly offer: OfferConfig;
  readonly brandName: string;
  readonly phone: string;
}

/** Contenu de l'affiche, dessiné en millimètres sur une largeur de 210 mm. */
function PosterContent({ offer, brandName, phone, baseH }: PosterProps & { readonly baseH: number }) {
  const t = themeById(offer.page.theme);
  const gradient = `linear-gradient(125deg,${t.accent} 0%,${t.accent2} 55%,${t.accent3} 100%)`;
  const url = offerUrl(offer.slug);
  const qrSvg = useMemo(() => qrToSvg(encodeQr(url, 'H'), INK, 2), [url]);
  const title = offer.poster.title.trim() || offer.title;
  const text = offer.poster.text.trim() || offer.description;
  const shortUrl = url.replace(/^https:\/\/www\./, '');
  const badge = reductionBadge(offer);
  // Taille du « -10% » selon sa longueur, pour rester dans le rond.
  const badgeSize = badge.length <= 3 ? '20mm' : badge.length === 4 ? '15.5mm' : badge.length === 5 ? '12.5mm' : '10.5mm';

  return (
    <div
      style={{ width: `${BASE_W}mm`, height: `${baseH}mm`, background: `linear-gradient(180deg,${t.bg1} 0%,${t.bg2} 100%)`, color: INK, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      className="font-sans"
    >
      <div aria-hidden="true" style={{ position: 'absolute', left: '-30mm', top: '-25mm', width: '110mm', height: '110mm', borderRadius: '50%', background: t.blob1, opacity: 0.35, filter: 'blur(18mm)' }} />
      <div aria-hidden="true" style={{ position: 'absolute', right: '-35mm', top: '90mm', width: '120mm', height: '120mm', borderRadius: '50%', background: t.blob2, opacity: 0.35, filter: 'blur(18mm)' }} />

      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', padding: '12mm 14mm 0', gap: '8mm' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <img src={logoUrl} alt="" style={{ height: '26mm', width: 'auto' }} />
        </div>

        {/* Bandeau de l'offre */}
        <div style={{ background: gradient, borderRadius: '9mm', padding: '11mm 10mm', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8mm', position: 'relative', overflow: 'hidden', boxShadow: '0 4mm 10mm -5mm rgba(11,42,60,0.45)' }}>
          <div aria-hidden="true" style={{ position: 'absolute', right: '-14mm', top: '-18mm', width: '55mm', height: '55mm', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
          <div
            className="font-display"
            style={{ flexShrink: 0, width: '50mm', height: '50mm', borderRadius: '50%', background: '#FFFFFF', color: t.accent, display: 'grid', placeItems: 'center', fontSize: badgeSize, fontWeight: 800, letterSpacing: '-0.04em', position: 'relative' }}
          >
            {badge}
          </div>
          <div style={{ position: 'relative', minWidth: 0 }}>
            <p className="font-display" style={{ fontSize: '11.5mm', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.02em', margin: 0 }}>
              {title}
            </p>
            <p style={{ fontSize: '5.6mm', lineHeight: 1.4, marginTop: '3.5mm', marginBottom: 0, opacity: 0.92 }}>{text}</p>
          </div>
        </div>

        {/* QR code */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '9mm', background: '#FFFFFF', borderRadius: '9mm', padding: '8mm', boxShadow: '0 4mm 10mm -6mm rgba(11,42,60,0.3)' }}>
          <div style={{ width: '64mm', height: '64mm', flexShrink: 0 }} dangerouslySetInnerHTML={{ __html: qrSvg.replace('<svg ', '<svg width="100%" height="100%" ') }} />
          <div style={{ minWidth: 0 }}>
            <p className="font-display" style={{ fontSize: '10mm', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.02em', margin: 0, color: t.accent }}>
              Scannez pour en profiter
            </p>
            <p style={{ fontSize: '5.4mm', lineHeight: 1.45, margin: '3.5mm 0 0' }}>
              Inscription en 30 secondes.
              <br />
              Votre code arrive tout de suite.
            </p>
            <p style={{ fontSize: '4.1mm', margin: '3.5mm 0 0', opacity: 0.6, overflowWrap: 'anywhere' }}>{shortUrl}</p>
          </div>
        </div>
        <p style={{ fontSize: '3.6mm', lineHeight: 1.4, textAlign: 'center', margin: 0, opacity: 0.6 }}>
          Code valable {offer.months} mois après l’inscription. Offre soumise à conditions : voir la page de l’offre.
        </p>
      </div>

      {/* Pied */}
      <div style={{ position: 'relative', marginTop: '9mm', background: INK, color: '#FFFFFF', padding: '7mm 14mm', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6mm' }}>
        <div>
          <p className="font-display" style={{ fontSize: '6mm', fontWeight: 700, margin: 0 }}>{brandName}</p>
          <p style={{ fontSize: '4.3mm', margin: '1mm 0 0', opacity: 0.75 }}>48 rue de la République, 13002 Marseille</p>
        </div>
        <p className="font-display" style={{ fontSize: '8mm', fontWeight: 800, margin: 0, whiteSpace: 'nowrap', color: t.footer }}>
          {phone}
        </p>
      </div>
    </div>
  );
}

/** Affiche à sa vraie taille (mm) pour l'impression. */
function PosterAtSize(props: PosterProps) {
  const f = posterFormat(props.offer.poster.format);
  const scale = f.widthMm / BASE_W;
  const baseH = f.heightMm / scale;
  return (
    <div style={{ width: `${f.widthMm}mm`, height: `${f.heightMm}mm`, overflow: 'hidden', printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' } as CSSProperties}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        <PosterContent {...props} baseH={baseH} />
      </div>
    </div>
  );
}

/** Aperçu réduit à une largeur en pixels. */
export function PosterPreview({ widthPx, ...props }: PosterProps & { readonly widthPx: number }) {
  const f = posterFormat(props.offer.poster.format);
  const pxPerMm = 96 / 25.4;
  const scale = widthPx / (f.widthMm * pxPerMm);
  return (
    <div style={{ width: `${widthPx}px`, height: `${f.heightMm * pxPerMm * scale}px`, overflow: 'hidden' }} className="rounded-md shadow-[0_24px_60px_-24px_rgba(11,42,60,0.55)] ring-1 ring-[#0B2A3C]/10">
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        <PosterAtSize {...props} />
      </div>
    </div>
  );
}

const PRINT_ID = 'affiche-impression';

/**
 * Impression de l'affiche (la fenêtre d'impression du navigateur propose « Enregistrer au format PDF »).
 * Pendant l'impression, seule l'affiche est visible, à sa taille réelle, sans marges.
 */
export function usePosterPrint(props: PosterProps) {
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    if (!printing) return;
    const f = posterFormat(props.offer.poster.format);
    const style = document.createElement('style');
    style.textContent = `@media print {
  @page { size: ${f.widthMm}mm ${f.heightMm}mm; margin: 0; }
  html, body { background: #FFFFFF !important; margin: 0 !important; height: auto !important; overflow: visible !important; }
  body > *:not(#${PRINT_ID}) { display: none !important; }
  #${PRINT_ID} { display: block !important; }
}
#${PRINT_ID} { display: none; }`;
    document.head.appendChild(style);
    const done = () => setPrinting(false);
    window.addEventListener('afterprint', done);
    // Laisser le temps aux images (logo) d'être prêtes.
    const images = Array.from(document.querySelectorAll<HTMLImageElement>(`#${PRINT_ID} img`));
    void Promise.all(images.map((img) => (img.complete ? Promise.resolve() : new Promise((r) => img.addEventListener('load', r, { once: true }))))).then(() => {
      window.setTimeout(() => window.print(), 50);
    });
    return () => {
      window.removeEventListener('afterprint', done);
      style.remove();
    };
  }, [printing, props.offer.poster.format]);

  const portal = printing
    ? createPortal(
        <div id={PRINT_ID}>
          <PosterAtSize {...props} />
        </div>,
        document.body
      )
    : null;

  return { print: () => setPrinting(true), portal };
}
