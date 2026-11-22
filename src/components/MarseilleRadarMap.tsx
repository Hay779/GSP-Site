import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Store, X } from 'lucide-react';
import type { ZoneMapPinId } from '../utils/serviceArea';

interface MapPinSpec {
  readonly id: ZoneMapPinId;
  readonly label: string;
  readonly x: number;
  readonly y: number;
  readonly labelX: number;
  readonly labelY: number;
  readonly labelAnchor?: 'start' | 'middle' | 'end';
  readonly primary: boolean;
  readonly isHub?: boolean;
}

const MAP_PINS: readonly MapPinSpec[] = [
  {
    id: 'septemes',
    label: 'Septèmes-les-Vallons',
    x: 274,
    y: 112,
    labelX: 294,
    labelY: 112,
    labelAnchor: 'start',
    primary: true,
  },
  {
    id: 'plan-de-cuques',
    label: 'Plan-de-Cuques',
    x: 454,
    y: 192,
    labelX: 454,
    labelY: 220,
    labelAnchor: 'middle',
    primary: true,
  },
  {
    id: 'marseille',
    label: 'Marseille',
    x: 292,
    y: 330,
    labelX: 292,
    labelY: 360,
    labelAnchor: 'middle',
    primary: true,
    isHub: true,
  },
  {
    id: 'allauch',
    label: 'Allauch',
    x: 520,
    y: 298,
    labelX: 520,
    labelY: 326,
    labelAnchor: 'middle',
    primary: true,
  },
  {
    id: 'aubagne',
    label: 'Aubagne',
    x: 588,
    y: 416,
    labelX: 588,
    labelY: 444,
    labelAnchor: 'middle',
    primary: true,
  },
  {
    id: 'pennes-mirabeau',
    label: 'Les Pennes-Mirabeau',
    x: 196,
    y: 94,
    labelX: 196,
    labelY: 122,
    labelAnchor: 'middle',
    primary: false,
  },
  {
    id: 'penne-sur-huveaune',
    label: 'La Penne-sur-Huveaune',
    x: 458,
    y: 392,
    labelX: 458,
    labelY: 420,
    labelAnchor: 'middle',
    primary: false,
  },
];

interface MarseilleRadarMapProps {
  readonly activePinId: ZoneMapPinId;
  readonly selectedSector: string | null;
  readonly responseTimePrefix: string;
  readonly responseTimeHighlight: string;
  readonly onSelectPin: (label: string) => void;
  readonly onClearSelection: () => void;
}

export function MarseilleRadarMap({
  activePinId,
  selectedSector,
  responseTimePrefix,
  responseTimeHighlight,
  onSelectPin,
  onClearSelection,
}: MarseilleRadarMapProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  // Sur téléphone la carte est réduite : on grossit les étiquettes pour qu'elles restent lisibles.
  const [labelScale, setLabelScale] = useState(1);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 639px)');
    const update = () => setLabelScale(query.matches ? 1.55 : 1);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return (
    <div className="relative flex aspect-[680/560] w-full overflow-hidden bg-[#CFE5EF]">
      {/* Carte stylisée en couleur : mer, terre, routes, littoral et périmètre d'intervention */}
      <svg
        viewBox="0 0 680 560"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={`Carte interactive de la zone d’intervention autour de Marseille${
          selectedSector ? ` — secteur sélectionné : ${selectedSector}` : ''
        }`}
        className="h-full w-full object-cover select-none"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <g fill="none" strokeLinecap="round" strokeLinejoin="round" id="zone-roads">
          {/* Axe Nord A7 : Septèmes -> Marseille */}
          <path
            d="M206 0C226 42 254 78 274 112C290 140 288 184 282 228C276 270 284 302 292 330"
          />
          {/* Axe Littoral A55 : Nord-Ouest -> Joliette -> Vieux-Port */}
          <path
            d="M72 0C124 44 166 96 206 146C240 188 264 246 278 308L292 330"
          />
          {/* Rocade L2 & axe Nord-Est vers Plan-de-Cuques & Allauch */}
          <path
            d="M282 228C334 218 394 202 454 192C498 184 548 166 616 146"
          />
          <path
            d="M292 330C356 296 410 248 454 192"
          />
          <path
            d="M292 330C370 318 448 308 520 298C568 291 616 284 680 272"
          />
          {/* Axe Est A50 : Marseille -> La Penne-sur-Huveaune -> Aubagne */}
          <path
            d="M292 330C348 354 404 378 458 392C508 405 552 410 588 416C626 422 654 434 680 448"
          />
          {/* Liaison Plan-de-Cuques -> Allauch -> Aubagne */}
          <path
            d="M454 192C482 230 502 262 520 298C544 344 566 380 588 416"
          />
          {/* Axes secondaires Marseille Sud & Est */}
          <path
            d="M292 330C302 384 316 428 338 476"
          />
          <path
            d="M196 94C230 100 252 106 274 112"
          />
          <path
            d="M0 78C68 54 134 56 196 94"
          />
        </g>
          <radialGradient id="zone-area" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E8C982" stopOpacity="0.38" />
            <stop offset="70%" stopColor="#E8C982" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#E8C982" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="sea-blue" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#6FB0CF" />
            <stop offset="100%" stopColor="#B4DAEA" />
          </linearGradient>
          <radialGradient id="marseille-map-glow" cx="44%" cy="56%" r="55%">
            <stop offset="0%" stopColor="#B79A62" stopOpacity="0.14" />
            <stop offset="55%" stopColor="#1C2227" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#0E1215" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="pin-halo-gold" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E5C57B" stopOpacity="0.48" />
            <stop offset="48%" stopColor="#B79A62" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#B79A62" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="pin-body-gold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F3DC9B" />
            <stop offset="55%" stopColor="#C9A863" />
            <stop offset="100%" stopColor="#9A7A3B" />
          </linearGradient>

        </defs>

        {/* Mer Méditerranée (fond sombre profond) */}
        <rect width="680" height="560" fill="url(#sea-blue)" />

        {/* Masse terrestre Provence / Marseille */}
        <path
          d="M0 0H680V560H530C495 546 472 522 448 525C424 528 408 548 378 542C344 535 332 508 296 510C260 512 246 534 234 514C224 496 244 466 258 438C272 410 278 386 252 362C226 338 232 292 254 268C274 246 256 218 228 192C198 164 176 138 140 124C102 110 54 114 0 132V0Z"
          fill="#F5F2EA"
        />

        {/* Reliefs subtils (Étoile, Garlaban, Calanques) */}
        <path
          d="M342 146C395 130 462 128 524 152C572 170 618 196 664 232"
          stroke="#E1E8D0"
          strokeWidth="30"
          strokeLinecap="round"
          opacity="0.9"
        />
        <path
          d="M274 470C336 458 398 468 468 492C510 506 558 510 612 496"
          stroke="#E1E8D0"
          strokeWidth="24"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* Halo global chaleureux centré sur Marseille */}
        <rect width="680" height="560" fill="url(#marseille-map-glow)" />

        {/* Zone couverte : halo doré doux autour de Marseille */}
        <circle cx="292" cy="330" r="236" fill="url(#zone-area)" />

        {/* Cercles radar concentriques centrés sur Marseille */}
        <g stroke="#9C7C40" fill="none">
          <circle cx="292" cy="330" r="76" strokeOpacity="0.22" strokeWidth="1" />
          <circle cx="292" cy="330" r="146" strokeOpacity="0.14" strokeWidth="1" />
          <circle cx="292" cy="330" r="228" strokeOpacity="0.09" strokeWidth="1" />
        </g>

        {/* Réseau routier : liseré beige puis chaussée blanche */}
        <g strokeLinecap="round" strokeLinejoin="round" fill="none">
          <use href="#zone-roads" stroke="#E6D4A8" strokeWidth="6" />
          <use href="#zone-roads" stroke="#FFFFFF" strokeWidth="3.2" />
        </g>

        {/* Tracé lumineux pointillé du littoral et du périmètre d'intervention */}
        <path
          d="M142 126C180 140 202 168 230 196C258 224 274 248 254 270C234 292 228 338 252 362C276 386 272 412 258 438C244 466 226 496 236 514C248 534 264 512 298 510C332 508 346 534 378 540C408 546 424 526 448 524C472 522 496 544 530 554"
          stroke="#5F97B3"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M274 60C350 48 434 62 496 108C554 150 610 218 648 296C668 338 662 396 638 446"
          stroke="#B79A62"
          strokeOpacity="0.95"
          strokeWidth="2.2"
          strokeDasharray="5 6"
          strokeLinecap="round"
          fill="none"
        />

        {/* Mention Mer Méditerranée */}
        <text
          x="128"
          y="428"
          textAnchor="middle"
          fill="#FFFFFF"
          fillOpacity="0.95"
          fontStyle="italic"
          fontFamily="DM Sans, sans-serif"
          fontSize="13.5"
          letterSpacing="0.06em"
        >
          Mer Méditerranée
        </text>

        {/* Repères dorés interactifs */}
        {MAP_PINS.map((pin) => {
          const isActive = activePinId === pin.id;
          const isVisible = pin.primary || isActive;
          if (!isVisible) {
            return null;
          }

          return (
            <g
              key={pin.id}
              onClick={() => onSelectPin(pin.label)}
              role="button"
              tabIndex={0}
              aria-label={`Sélectionner le secteur ${pin.label} sur la carte`}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelectPin(pin.label);
                }
              }}
              className="cursor-pointer focus:outline-none"
            >
              {/* Halo doré lumineux */}
              <circle
                cx={pin.x}
                cy={pin.y - 6}
                r={isActive ? 54 : pin.isHub ? 48 : 38}
                fill="url(#pin-halo-gold)"
              />

              {/* Onde subtile sur le repère actif */}
              {isActive && !prefersReducedMotion && (
                <motion.circle
                  cx={pin.x}
                  cy={pin.y - 6}
                  r={18}
                  fill="none"
                  stroke="#C0392B"
                  strokeWidth="1.5"
                  initial={{ scale: 0.85, opacity: 0.7 }}
                  animate={{ scale: 2.3, opacity: 0 }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                  style={{ transformOrigin: `${pin.x}px ${pin.y - 6}px` }}
                />
              )}

              {/* Anneau fin autour du repère */}
              <circle
                cx={pin.x}
                cy={pin.y - 6}
                r={isActive ? 24 : 18}
                fill="none"
                stroke={isActive ? '#C0392B' : '#9C7C40'}
                strokeOpacity={isActive ? 0.6 : 0.3}
                strokeWidth="1"
              />

              {/* Goutte / Pin doré */}
              <g transform={`translate(${pin.x}, ${pin.y})`}>
                <path
                  d="M0 0C-7.5 -9.2 -12 -14.8 -12 -20.6C-12 -27.2 -6.6 -32.5 0 -32.5C6.6 -32.5 12 -27.2 12 -20.6C12 -14.8 7.5 -9.2 0 0Z"
                  fill={isActive ? '#C0392B' : 'url(#pin-body-gold)'}
                  stroke="#FFFFFF"
                  strokeWidth={1.6}
                />
                <circle cx="0" cy="-20.5" r="4.2" fill="#FFFFFF" />
              </g>

              {/* Étiquette de la ville : pastille blanche */}
              {(() => {
                const size = (pin.isHub || isActive ? 16 : 14) * labelScale;
                const width = pin.label.length * size * 0.56 + 22;
                const anchor = pin.labelAnchor ?? 'middle';
                const left = anchor === 'start' ? pin.labelX - 10 : anchor === 'end' ? pin.labelX - width + 10 : pin.labelX - width / 2;
                return (
                  <>
                    <rect
                      x={left}
                      y={pin.labelY - size * 0.74 - 7}
                      width={width}
                      height={size + 14}
                      rx={(size + 14) / 2}
                      fill="#FFFFFF"
                      fillOpacity="0.96"
                      style={{ filter: 'drop-shadow(0 2px 4px rgba(28,31,33,0.18))' }}
                    />
                    <text
                      x={pin.labelX}
                      y={pin.labelY}
                      textAnchor={anchor}
                      fill="#1C1F21"
                      fontFamily="Plus Jakarta Sans, sans-serif"
                      fontSize={size}
                      fontWeight={pin.isHub || isActive ? '700' : '600'}
                    >
                      {pin.label}
                    </text>
                  </>
                );
              })()}
            </g>
          );
        })}
      </svg>

      {/* Indicateur discret en haut à gauche lorsqu'un secteur précis est sélectionné */}
      {selectedSector && (
        <div className="absolute right-3 bottom-3 sm:right-4 sm:bottom-4 z-10 inline-flex items-center gap-2 rounded-full bg-white/95 px-3.5 py-1.5 text-[13px] text-[#1C1F21] shadow-sm">
          <span className="text-[#1C1F21]/60">Secteur :</span>
          <span className="font-semibold text-[#C0392B]">{selectedSector}</span>
          <button
            type="button"
            onClick={onClearSelection}
            aria-label="Effacer la sélection du secteur"
            className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-sm text-[#1C1F21]/55 hover:text-[#1C1F21] transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Encart des agences (en haut à gauche) */}
      <div className="pointer-events-none absolute left-3 bottom-3 sm:bottom-auto sm:left-4 sm:top-4 z-10 flex items-center gap-2.5 rounded-xl bg-[#1C1F21]/92 px-3 py-2 sm:px-4 sm:py-2.5 shadow-md">
        <Store className="h-5 w-5 shrink-0 text-[#B79A62]" strokeWidth={1.7} aria-hidden="true" />
        <div>
          <p className="text-[11px] sm:text-[12px] leading-snug text-[#F3F0E7]/70">{responseTimePrefix}</p>
          <p className="font-display text-[13px] sm:text-[15px] font-semibold leading-snug text-[#F3F0E7]">{responseTimeHighlight}</p>
        </div>
      </div>
    </div>
  );
}
