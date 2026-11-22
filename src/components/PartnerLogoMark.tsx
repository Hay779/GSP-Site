import type { PartnerBrandId } from '../data/sectionsContent';

interface PartnerLogoMarkProps {
  readonly brandId: PartnerBrandId;
  readonly name: string;
}

/**
 * Full-color vector brand lockups for partner manufacturers displayed on light tiles.
 */
export function PartnerLogoMark({ brandId, name }: PartnerLogoMarkProps) {
  switch (brandId) {
    case 'vachette':
      return (
        <svg
          viewBox="0 0 210 56"
          role="img"
          aria-label={`Logo ${name} ASSA ABLOY`}
          className="h-[46px] sm:h-[52px] w-auto max-w-full"
        >
          {/* Emblème rond bleu/cyan Vachette */}
          <circle cx="24" cy="28" r="18" fill="#005DAA" />
          <path
            d="M15.5 20.5L24 37.5L32.5 20.5"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="24" cy="17.5" r="2.6" fill="#00B5E2" />
          {/* Typographie VACHETTE + ASSA ABLOY */}
          <text
            x="52"
            y="30"
            fill="#003D73"
            fontFamily="Plus Jakarta Sans, sans-serif"
            fontWeight="800"
            fontSize="20"
            letterSpacing="1.4"
          >
            VACHETTE
          </text>
          <text
            x="52"
            y="45"
            fill="#0085CA"
            fontFamily="DM Sans, sans-serif"
            fontWeight="700"
            fontSize="10"
            letterSpacing="2.4"
          >
            ASSA ABLOY
          </text>
        </svg>
      );

    case 'bricard':
      return (
        <svg
          viewBox="0 0 200 56"
          role="img"
          aria-label={`Logo ${name}`}
          className="h-[46px] sm:h-[52px] w-auto max-w-full"
        >
          {/* Emblème rouge géométrique Bricard */}
          <rect x="8" y="10" width="36" height="36" rx="7" fill="#C8102E" />
          <path
            d="M20 18H27.5C30.8 18 33 19.9 33 22.8C33 24.9 31.7 26.4 29.8 27.1C32.2 27.8 33.7 29.6 33.7 32.1C33.7 35.4 31.2 37.5 27.5 37.5H20V18Z"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
          <line x1="20" y1="27.4" x2="29" y2="27.4" stroke="#FFFFFF" strokeWidth="2.6" />
          {/* Wordmark BRICARD */}
          <text
            x="55"
            y="33"
            fill="#1C1F21"
            fontFamily="Plus Jakarta Sans, sans-serif"
            fontWeight="800"
            fontSize="23"
            letterSpacing="1.8"
          >
            BRICARD
          </text>
          <rect x="55" y="39" width="52" height="3" rx="1.5" fill="#C8102E" />
        </svg>
      );

    case 'fichet':
      return (
        <svg
          viewBox="0 0 206 56"
          role="img"
          aria-label={`Logo Point Fort ${name}`}
          className="h-[46px] sm:h-[52px] w-auto max-w-full"
        >
          {/* Blason bordeaux & or Fichet */}
          <path
            d="M26 7L43 13V28.5C43 38.2 35.6 45.2 26 49C16.4 45.2 9 38.2 9 28.5V13L26 7Z"
            fill="#9E1B32"
          />
          <path
            d="M26 11.5L39 16V28.2C39 35.6 33.3 41.3 26 44.3C18.7 41.3 13 35.6 13 28.2V16L26 11.5Z"
            fill="none"
            stroke="#D8B35C"
            strokeWidth="1.6"
          />
          <circle cx="26" cy="23.5" r="4.2" fill="#D8B35C" />
          <path d="M24 27H28L29.2 36.5H22.8L24 27Z" fill="#D8B35C" />
          {/* Wordmark POINT FORT FICHET */}
          <text
            x="54"
            y="21"
            fill="#9E1B32"
            fontFamily="DM Sans, sans-serif"
            fontWeight="700"
            fontSize="9.5"
            letterSpacing="2.3"
          >
            POINT FORT
          </text>
          <text
            x="54"
            y="43"
            fill="#1C1F21"
            fontFamily="Plus Jakarta Sans, sans-serif"
            fontWeight="800"
            fontSize="24"
            letterSpacing="2.6"
          >
            FICHET
          </text>
        </svg>
      );

    case 'picard':
      return (
        <svg
          viewBox="0 0 204 56"
          role="img"
          aria-label={`Logo ${name} Serrures`}
          className="h-[46px] sm:h-[52px] w-auto max-w-full"
        >
          {/* Emblème bleu roi & ambre Picard */}
          <rect x="8" y="9" width="38" height="38" rx="19" fill="#17468F" />
          <path
            d="M21 37V19H29.5C33 19 35.5 21.2 35.5 24.7C35.5 28.2 33 30.4 29.5 30.4H21"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="38" cy="16" r="5" fill="#E37B1C" />
          {/* Wordmark PICARD SERRURES */}
          <text
            x="57"
            y="30"
            fill="#17468F"
            fontFamily="Plus Jakarta Sans, sans-serif"
            fontWeight="800"
            fontSize="22"
            letterSpacing="2"
          >
            PICARD
          </text>
          <text
            x="58"
            y="44"
            fill="#D46B0D"
            fontFamily="DM Sans, sans-serif"
            fontWeight="700"
            fontSize="10"
            letterSpacing="2.8"
          >
            SERRURES
          </text>
        </svg>
      );

    case 'dom':
      return (
        <svg
          viewBox="0 0 198 56"
          role="img"
          aria-label={`Logo ${name} Security`}
          className="h-[46px] sm:h-[52px] w-auto max-w-full"
        >
          {/* Cartouche rouge emblématique DOM */}
          <rect x="10" y="9" width="76" height="38" rx="6" fill="#D62828" />
          <text
            x="48"
            y="36"
            textAnchor="middle"
            fill="#FFFFFF"
            fontFamily="Plus Jakarta Sans, sans-serif"
            fontWeight="800"
            fontSize="23"
            letterSpacing="2.2"
          >
            DOM
          </text>
          {/* Complément SECURITY */}
          <text
            x="98"
            y="27"
            fill="#1C1F21"
            fontFamily="Plus Jakarta Sans, sans-serif"
            fontWeight="700"
            fontSize="12.5"
            letterSpacing="1.9"
          >
            SECURITY
          </text>
          <text
            x="98"
            y="41"
            fill="#6B7280"
            fontFamily="DM Sans, sans-serif"
            fontWeight="600"
            fontSize="9.5"
            letterSpacing="1.2"
          >
            METALLERIE
          </text>
        </svg>
      );

    case 'iseo':
      return (
        <svg
          viewBox="0 0 200 56"
          role="img"
          aria-label={`Logo ${name}`}
          className="h-[46px] sm:h-[52px] w-auto max-w-full"
        >
          {/* Emblème bleu dynamique ISEO */}
          <circle cx="28" cy="28" r="18" fill="#0072CE" />
          <path
            d="M21 20C25.5 16.5 32.5 16.5 36 21C39.5 25.5 38.5 32.5 34 36C29.5 39.5 22.5 39 19 34.5"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="28" cy="28" r="4" fill="#7CD4FD" />
          {/* Wordmark ISEO */}
          <text
            x="57"
            y="33"
            fill="#0C2340"
            fontFamily="Plus Jakarta Sans, sans-serif"
            fontWeight="800"
            fontSize="25"
            letterSpacing="3"
          >
            ISEO
          </text>
          <text
            x="58"
            y="45"
            fill="#0072CE"
            fontFamily="DM Sans, sans-serif"
            fontWeight="700"
            fontSize="9"
            letterSpacing="2.1"
          >
            ULTIMATE ACCESS
          </text>
        </svg>
      );
  }
}
