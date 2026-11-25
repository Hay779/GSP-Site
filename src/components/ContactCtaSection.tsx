import { useId } from 'react';
import { ArrowRight, FileText, KeyRound, Phone, Store } from 'lucide-react';

export interface ContactAgencyLink {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly external?: boolean;
}

export interface ContactCtaSectionProps {
  readonly kicker?: string;
  readonly title?: string;
  readonly subtitle?: string;
  readonly imageSrc?: string;
  readonly phoneDisplay?: string;
  readonly phoneHref?: string;
  readonly quoteHref?: string;
  readonly quoteLabel?: string;
  readonly whatsappHref?: string;
  readonly whatsappLabel?: string;
  readonly agenciesIntro?: string;
  readonly agencies?: readonly ContactAgencyLink[];
}

/** Icône WhatsApp (bulle + combiné) au trait assorti aux icônes Lucide. */
function WhatsAppOutlineIcon({ className }: { readonly className?: string; readonly strokeWidth?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 3a9 9 0 0 0-7.79 13.5L3 21l4.65-1.18A9 9 0 1 0 12 3Z" />
      <path d="M9.6 8.85c-.22-.48-.44-.49-.65-.5h-.55c-.2 0-.5.07-.77.36-.26.3-1 1-1 2.42s1.03 2.8 1.17 3c.15.2 2 3.2 4.94 4.35 2.44.96 2.94.77 3.47.72.53-.05 1.71-.7 1.95-1.38.24-.67.24-1.25.17-1.37-.07-.12-.26-.2-.55-.34-.29-.14-1.71-.84-1.97-.94-.27-.1-.46-.14-.65.15-.2.29-.75.94-.92 1.13-.17.2-.34.22-.63.07-.29-.14-1.22-.45-2.32-1.43-.86-.77-1.44-1.71-1.61-2-.17-.3-.02-.45.13-.6.13-.13.29-.34.43-.5.15-.17.2-.29.29-.49.1-.19.05-.36-.02-.5-.08-.15-.64-1.58-.88-2.16Z" />
    </svg>
  );
}

/**
 * Tracé principal en S (repère 800x224) : part en tangente du bord supérieur du panneau (y=44),
 * plonge entre le sous-titre et la photo, atteint son creux au-dessus de la 3e carte (y=212)
 * puis remonte légèrement vers le bord droit.
 */
const DESKTOP_MAIN_WAVE_PATH =
  'M 0,44 C 125,44 205,58 315,123 C 425,188 505,212 605,212 C 685,212 745,199 800,175';

/** Second filet doré fin remontant vers le haut de la photo. */
const DESKTOP_ACCENT_ARC_PATH = 'M 237,83 C 292,65 342,34 388,0';

/** Découpe normalisée (0..1) correspondant exactement au-dessus de DESKTOP_MAIN_WAVE_PATH. */
const DESKTOP_WAVE_CLIP_PATH =
  'M 0,0 L 1,0 L 1,0.7813 C 0.9313,0.8884 0.8563,0.9464 0.7563,0.9464 C 0.6313,0.9464 0.5313,0.8393 0.3938,0.5491 C 0.2563,0.2589 0.1563,0.1964 0,0.1964 Z';

const DEFAULT_AGENCIES: readonly ContactAgencyLink[] = [
  { id: 'republique', label: 'République (2e)', href: '#agences' },
  { id: 'rome', label: 'Rome (6e)', href: '#agences' },
];

/** « Un projet, une urgence ? Parlons-en. » : photo clés & badge en vague dorée, trois façons de nous joindre. */
export function ContactCtaSection({
  kicker = 'Un projet, une urgence ?',
  title = 'Parlons-en.',
  subtitle = 'Choisissez le moyen le plus simple pour nous contacter : téléphone, devis en ligne ou WhatsApp.',
  imageSrc = '/src/assets/images/cta_cles_badge.webp',
  phoneDisplay = '04 91 90 51 65',
  phoneHref = 'tel:+33491905165',
  quoteHref = '/devis',
  quoteLabel = 'Demander un devis',
  whatsappHref = 'https://wa.me/33782828208',
  whatsappLabel = 'Écrire sur WhatsApp',
  agenciesIntro = 'Ou passez en boutique :',
  agencies = DEFAULT_AGENCIES,
}: ContactCtaSectionProps) {
  const uid = useId().replace(/:/g, '');
  const clipId = `cta-wave-clip-${uid}`;
  const mainGoldId = `cta-main-gold-${uid}`;
  const mainGlowId = `cta-main-glow-${uid}`;
  const accentGoldId = `cta-accent-gold-${uid}`;

  const ctaItems = [
    {
      href: phoneHref,
      icon: KeyRound,
      title: 'Urgence',
      text: 'Porte claquée, effraction, serrure bloquée...',
      action: phoneDisplay,
      actionIcon: Phone,
      primary: true,
      external: false,
    },
    {
      href: quoteHref,
      icon: FileText,
      title: 'Devis en ligne',
      text: 'Décrivez votre besoin en quelques questions.',
      action: quoteLabel,
      actionIcon: null,
      primary: false,
      external: false,
    },
    {
      href: whatsappHref,
      icon: WhatsAppOutlineIcon,
      title: 'WhatsApp',
      text: 'Envoyez une photo de votre porte ou de votre serrure.',
      action: whatsappLabel,
      actionIcon: null,
      primary: false,
      external: true,
    },
  ] as const;

  return (
    <section className="relative w-full overflow-hidden bg-[#F6F2EA]">
      {/* Masque SVG en coordonnées normalisées (toujours monté, jamais display:none) */}
      <svg aria-hidden="true" width="0" height="0" className="pointer-events-none absolute">
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <path d={DESKTOP_WAVE_CLIP_PATH} />
          </clipPath>
        </defs>
      </svg>

      <div className="mx-auto max-w-[1280px] px-4 sm:px-8 lg:px-10 pt-7 pb-10 sm:pt-10 sm:pb-12 lg:pt-11 lg:pb-14">
        <div className="relative">
          {/* Panneau principal ivoire clair avec contour lumineux et ombre diffuse */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[24px] bg-[#FBF8F3] border border-[#E8DFCE]/90 shadow-[0_14px_38px_-14px_rgba(62,48,24,0.14),0_2px_6px_rgba(28,31,33,0.03)]"
          />

          {/* Photo + double vague dorée (tablette & desktop) : déborde au-dessus et à droite */}
          <div
            aria-hidden="true"
            className="pointer-events-none hidden md:block absolute -top-10 lg:-top-11 left-[36%] lg:left-[37%] -right-8 lg:-right-[clamp(2.5rem,calc(50vw-600px),12rem)] h-[196px] lg:h-[224px] z-10"
          >
            {/* Couche photo découpée au-dessus de la courbe en S */}
            <div className="absolute inset-0 bg-[#F6F2EA]" style={{ clipPath: `url(#${clipId})` }}>
              {/* Halo bokeh chaud pour la transition douce entre l'ivoire et la photo */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(ellipse 36% 120% at 40% 24%, rgba(120,98,76,0.58) 0%, rgba(178,160,138,0.24) 48%, transparent 78%), linear-gradient(90deg, #F6F2EA 0%, #F6F2EA 10%, rgba(246,242,234,0.68) 24%, rgba(92,76,60,0.48) 42%, #3B332C 100%)',
                }}
              />
              <img
                src={imageSrc}
                alt=""
                loading="lazy"
                className="absolute right-0 -top-2 h-[106%] w-[64%] object-cover object-[56%_20%] [mask-image:linear-gradient(to_right,transparent_0%,rgba(0,0,0,0.38)_16%,black_32%)]"
              />
              {/* Voile doux fondant le bord gauche de la photo dans la crème */}
              <div
                className="absolute inset-y-0 left-0 w-[45%]"
                style={{
                  background:
                    'linear-gradient(90deg, #F6F2EA 0%, #F6F2EA 16%, rgba(246,242,234,0.86) 36%, rgba(246,242,234,0.32) 64%, transparent 100%)',
                }}
              />
            </div>

            {/* Double tracé doré : courbe principale en S + filet fin supérieur */}
            <svg viewBox="0 0 800 224" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
              <defs>
                <linearGradient id={mainGoldId} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#DFCEAE" stopOpacity="0" />
                  <stop offset="10%" stopColor="#D7BE8F" stopOpacity="0.7" />
                  <stop offset="32%" stopColor="#C79E4C" stopOpacity="1" />
                  <stop offset="56%" stopColor="#E1C078" stopOpacity="1" />
                  <stop offset="82%" stopColor="#C8A256" stopOpacity="0.94" />
                  <stop offset="100%" stopColor="#DEC590" stopOpacity="0.82" />
                </linearGradient>
                <linearGradient id={mainGlowId} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#B79A62" stopOpacity="0" />
                  <stop offset="28%" stopColor="#B79A62" stopOpacity="0.3" />
                  <stop offset="72%" stopColor="#B79A62" stopOpacity="0.24" />
                  <stop offset="100%" stopColor="#B79A62" stopOpacity="0.1" />
                </linearGradient>
                <linearGradient id={accentGoldId} x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#D8B978" stopOpacity="0.18" />
                  <stop offset="30%" stopColor="#E8CB8F" stopOpacity="0.9" />
                  <stop offset="70%" stopColor="#F2DDA8" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#D8B978" stopOpacity="0.6" />
                </linearGradient>
              </defs>

              <path d={DESKTOP_ACCENT_ARC_PATH} fill="none" stroke={`url(#${accentGoldId})`} strokeWidth="1.35" vectorEffect="non-scaling-stroke" />
              <path d={DESKTOP_MAIN_WAVE_PATH} fill="none" stroke={`url(#${mainGlowId})`} strokeWidth="7.5" vectorEffect="non-scaling-stroke" />
              <path
                d={DESKTOP_MAIN_WAVE_PATH}
                fill="none"
                stroke={`url(#${mainGoldId})`}
                strokeWidth="4"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>

          {/* Photo + double tracé doré adaptés au format mobile (< md) */}
          <div aria-hidden="true" className="relative md:hidden h-[156px] overflow-hidden rounded-t-[24px] bg-[#F6F2EA]">
            <img src={imageSrc} alt="" loading="lazy" className="h-full w-full object-cover object-[60%_24%] scale-[1.04]" />
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(90deg, rgba(246,242,234,0.58) 0%, rgba(246,242,234,0.16) 24%, transparent 44%)',
              }}
            />
            <svg viewBox="0 0 400 156" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
              <path d="M 14,118 C 46,98 72,56 96,0" fill="none" stroke="#E8CB8F" strokeOpacity="0.88" strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
              <path d="M -2,118 C 72,116 142,146 238,148 C 308,150 358,136 402,122 L 402,158 L -2,158 Z" fill="#FBF8F3" />
              <path
                d="M -2,118 C 72,116 142,146 238,148 C 308,150 358,136 402,122"
                fill="none"
                stroke="#CCA558"
                strokeWidth="3.5"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>

          {/* Contenu du panneau */}
          <div className="relative z-20 px-5 pb-6 pt-3 sm:px-8 sm:pb-8 md:pt-8 lg:px-11 lg:pt-10 lg:pb-9">
            <div className="max-w-full md:max-w-[66%] lg:max-w-[68%]">
              <p className="flex items-center gap-3 text-[12.5px] sm:text-[13.5px] font-semibold uppercase tracking-[0.16em] text-[#9A722B]">
                <span aria-hidden="true" className="h-[2.5px] w-7 sm:w-8 rounded-full bg-[#C4963A]" />
                {kicker}
              </p>
              <h2 className="mt-2 font-display text-[36px] sm:text-[46px] lg:text-[54px] font-bold leading-[1.03] tracking-[-0.025em] text-[#181B1D]">
                {title}
              </h2>
              <p className="mt-2.5 text-[15px] sm:text-[16px] leading-[1.55] text-[#424649]">{subtitle}</p>
            </div>

            {/* Trois cartes d'action */}
            <ul className="mt-7 lg:mt-8 grid gap-4 sm:gap-5 md:grid-cols-3">
              {ctaItems.map((item) => (
                <li
                  key={item.title}
                  className="flex flex-col rounded-[22px] bg-gradient-to-b from-[#FDFBF8] to-[#F7F2E9] p-5 sm:p-6 shadow-[0_12px_28px_-14px_rgba(68,52,24,0.16),0_2px_6px_rgba(28,31,33,0.03)] ring-1 ring-[#E9DFCE]/85"
                >
                  <div className="flex items-start gap-4">
                    <span
                      aria-hidden="true"
                      className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#F2E7D3] text-[#9E752A] ring-1 ring-[#E2CFAF]/65"
                    >
                      <item.icon className="h-[25px] w-[25px]" strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0 pt-0.5">
                      <p className="font-display text-[20px] sm:text-[22px] font-bold leading-tight tracking-[-0.005em] text-[#181B1D]">
                        {item.title}
                      </p>
                      <p className="mt-1.5 text-[14.5px] leading-[1.45] text-[#474B4E]">{item.text}</p>
                    </div>
                  </div>

                  <a
                    href={item.href}
                    {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="group mt-auto pt-5 block rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79A62]"
                  >
                    <span
                      className={`flex h-11 w-full items-center justify-center gap-2 rounded-full px-5 text-[15px] font-semibold whitespace-nowrap tabular-nums transition-colors duration-150 ${
                        item.primary
                          ? 'bg-[#1C1F21] text-[#F3F0E7] group-hover:bg-[#292D2F]'
                          : 'border border-[#B79A62]/60 bg-white text-[#1C1F21] group-hover:border-[#B79A62] group-hover:text-[#7D612D]'
                      }`}
                    >
                      {item.actionIcon && (
                        <item.actionIcon className="h-4 w-4 shrink-0 text-[#B79A62]" strokeWidth={1.9} aria-hidden="true" />
                      )}
                      <span>{item.action}</span>
                      <ArrowRight
                        className={`h-4 w-4 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5 ${
                          item.primary ? 'text-[#B79A62]' : 'text-[#7D612D]'
                        }`}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            {/* Accès direct aux boutiques */}
            {agencies.length > 0 && (
              <p className="mt-6 lg:mt-7 flex flex-wrap items-center gap-x-3.5 gap-y-2 text-[15px] sm:text-[15.5px] text-[#3F4346]">
                <Store className="h-[22px] w-[22px] shrink-0 text-[#9E752A]" strokeWidth={1.75} aria-hidden="true" />
                <span>{agenciesIntro}</span>
                {agencies.map((agency, index) => (
                  <span key={agency.id} className="inline-flex items-center gap-3.5">
                    {index > 0 && <span aria-hidden="true" className="h-1 w-1 rounded-full bg-[#C4963A]" />}
                    <a
                      href={agency.href}
                      {...(agency.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className="font-semibold text-[#1C1F21] underline decoration-[#B79A62] decoration-2 underline-offset-[6px] transition-colors duration-150 hover:text-[#7D612D] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B79A62]"
                    >
                      {agency.label}
                    </a>
                  </span>
                ))}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
