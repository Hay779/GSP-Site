import { motion, useReducedMotion } from 'motion/react';
import { X } from 'lucide-react';
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

  return (
    <div className="relative flex h-full min-h-[380px] sm:min-h-[450px] w-full overflow-hidden rounded-xl border border-[#B79A62]/30 bg-[#111518]">
      {/* Carte stylisée sombre Marseille & Mer Méditerranée avec littoral et axes dorés */}
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
          <radialGradient id="marseille-map-glow" cx="44%" cy="56%" r="55%">
            <stop offset="0%" stopColor="#B79A62" stopOpacity="0.16" />
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

          <linearGradient id="coast-gold-line" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#E4C178" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#B79A62" stopOpacity="0.72" />
            <stop offset="100%" stopColor="#E4C178" stopOpacity="0.85" />
          </linearGradient>
        </defs>

        {/* Mer Méditerranée (fond sombre profond) */}
        <rect width="680" height="560" fill="#0F1316" />

        {/* Masse terrestre Provence / Marseille */}
        <path
          d="M0 0H680V560H530C495 546 472 522 448 525C424 528 408 548 378 542C344 535 332 508 296 510C260 512 246 534 234 514C224 496 244 466 258 438C272 410 278 386 252 362C226 338 232 292 254 268C274 246 256 218 228 192C198 164 176 138 140 124C102 110 54 114 0 132V0Z"
          fill="#171C20"
        />

        {/* Reliefs subtils (Étoile, Garlaban, Calanques) */}
        <path
          d="M342 146C395 130 462 128 524 152C572 170 618 196 664 232"
          stroke="#252C32"
          strokeWidth="22"
          strokeLinecap="round"
          opacity="0.45"
        />
        <path
          d="M274 470C336 458 398 468 468 492C510 506 558 510 612 496"
          stroke="#232A30"
          strokeWidth="18"
          strokeLinecap="round"
          opacity="0.4"
        />

        {/* Halo global chaleureux centré sur Marseille */}
        <rect width="680" height="560" fill="url(#marseille-map-glow)" />

        {/* Cercles radar concentriques centrés sur Marseille */}
        <g stroke="#B79A62" fill="none">
          <circle cx="292" cy="330" r="76" strokeOpacity="0.22" strokeWidth="1" />
          <circle cx="292" cy="330" r="146" strokeOpacity="0.14" strokeWidth="1" />
          <circle cx="292" cy="330" r="228" strokeOpacity="0.09" strokeWidth="1" />
        </g>

        {/* Réseau routier doré (A7, A55, A50, L2, axes vers Plan-de-Cuques & Allauch) */}
        <g strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Axe Nord A7 : Septèmes -> Marseille */}
          <path
            d="M206 0C226 42 254 78 274 112C290 140 288 184 282 228C276 270 284 302 292 330"
            stroke="#C7A664"
            strokeOpacity="0.52"
            strokeWidth="2.2"
          />
          {/* Axe Littoral A55 : Nord-Ouest -> Joliette -> Vieux-Port */}
          <path
            d="M72 0C124 44 166 96 206 146C240 188 264 246 278 308L292 330"
            stroke="#C7A664"
            strokeOpacity="0.4"
            strokeWidth="1.7"
          />
          {/* Rocade L2 & axe Nord-Est vers Plan-de-Cuques & Allauch */}
          <path
            d="M282 228C334 218 394 202 454 192C498 184 548 166 616 146"
            stroke="#C7A664"
            strokeOpacity="0.46"
            strokeWidth="1.9"
          />
          <path
            d="M292 330C356 296 410 248 454 192"
            stroke="#D6B571"
            strokeOpacity="0.48"
            strokeWidth="1.9"
          />
          <path
            d="M292 330C370 318 448 308 520 298C568 291 616 284 680 272"
            stroke="#C7A664"
            strokeOpacity="0.46"
            strokeWidth="1.8"
          />
          {/* Axe Est A50 : Marseille -> La Penne-sur-Huveaune -> Aubagne */}
          <path
            d="M292 330C348 354 404 378 458 392C508 405 552 410 588 416C626 422 654 434 680 448"
            stroke="#D6B571"
            strokeOpacity="0.56"
            strokeWidth="2.3"
          />
          {/* Liaison Plan-de-Cuques -> Allauch -> Aubagne */}
          <path
            d="M454 192C482 230 502 262 520 298C544 344 566 380 588 416"
            stroke="#B79A62"
            strokeOpacity="0.38"
            strokeWidth="1.5"
          />
          {/* Axes secondaires Marseille Sud & Est */}
          <path
            d="M292 330C302 384 316 428 338 476"
            stroke="#B79A62"
            strokeOpacity="0.32"
            strokeWidth="1.4"
          />
          <path
            d="M196 94C230 100 252 106 274 112"
            stroke="#B79A62"
            strokeOpacity="0.35"
            strokeWidth="1.4"
          />
          <path
            d="M0 78C68 54 134 56 196 94"
            stroke="#B79A62"
            strokeOpacity="0.28"
            strokeWidth="1.2"
          />
        </g>

        {/* Tracé lumineux pointillé du littoral et du périmètre d'intervention */}
        <path
          d="M142 126C180 140 202 168 230 196C258 224 274 248 254 270C234 292 228 338 252 362C276 386 272 412 258 438C244 466 226 496 236 514C248 534 264 512 298 510C332 508 346 534 378 540C408 546 424 526 448 524C472 522 496 544 530 554"
          stroke="url(#coast-gold-line)"
          strokeWidth="2"
          strokeDasharray="2.5 5.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M274 60C350 48 434 62 496 108C554 150 610 218 648 296C668 338 662 396 638 446"
          stroke="#D6B571"
          strokeOpacity="0.45"
          strokeWidth="1.6"
          strokeDasharray="2 6"
          strokeLinecap="round"
          fill="none"
        />

        {/* Mention Mer Méditerranée */}
        <text
          x="128"
          y="428"
          textAnchor="middle"
          fill="#F3F0E7"
          fillOpacity="0.32"
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
                  stroke="#E5C57B"
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
                stroke="#E5C57B"
                strokeOpacity={isActive ? 0.55 : 0.25}
                strokeWidth="1"
              />

              {/* Goutte / Pin doré */}
              <g transform={`translate(${pin.x}, ${pin.y})`}>
                <path
                  d="M0 0C-7.5 -9.2 -12 -14.8 -12 -20.6C-12 -27.2 -6.6 -32.5 0 -32.5C6.6 -32.5 12 -27.2 12 -20.6C12 -14.8 7.5 -9.2 0 0Z"
                  fill="url(#pin-body-gold)"
                  stroke="#FFF3D1"
                  strokeOpacity={isActive ? 0.85 : 0.45}
                  strokeWidth={isActive ? 1.4 : 1}
                />
                <circle cx="0" cy="-20.5" r="4.2" fill="#181C1F" />
              </g>

              {/* Étiquette de la ville */}
              <text
                x={pin.labelX}
                y={pin.labelY}
                textAnchor={pin.labelAnchor ?? 'middle'}
                fill={isActive ? '#FFF7E4' : '#F3F0E7'}
                fillOpacity={isActive ? 1 : 0.9}
                fontFamily="Plus Jakarta Sans, sans-serif"
                fontSize={pin.isHub || isActive ? '16' : '15'}
                fontWeight={pin.isHub || isActive ? '600' : '500'}
                style={{
                  textShadow: '0 2px 10px rgba(10, 12, 14, 0.95)',
                }}
              >
                {pin.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Indicateur discret en haut à gauche lorsqu'un secteur précis est sélectionné */}
      {selectedSector && (
        <div className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-lg border border-[#B79A62]/40 bg-[#14171A]/90 px-3.5 py-2 text-[13px] text-[#F3F0E7] backdrop-blur-md">
          <span className="text-[#F3F0E7]/68">Secteur :</span>
          <span className="font-semibold text-[#E5C57B]">{selectedSector}</span>
          <button
            type="button"
            onClick={onClearSelection}
            aria-label="Effacer la sélection du secteur"
            className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-sm text-[#F3F0E7]/65 hover:text-[#F3F0E7] transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Encart en bas à droite : Intervention en moins de 30 min */}
      <div className="pointer-events-none absolute bottom-4 right-4 z-10 rounded-xl border border-[#B79A62]/30 bg-[#14171A]/90 px-4 py-3 text-right backdrop-blur-md">
        <p className="text-[12.5px] leading-snug text-[#F3F0E7]/76">
          {responseTimePrefix}
        </p>
        <p className="mt-0.5 font-display text-[14.5px] sm:text-[15.5px] font-semibold leading-snug text-[#F3F0E7] tabular-nums">
          {responseTimeHighlight}
        </p>
      </div>
    </div>
  );
}
