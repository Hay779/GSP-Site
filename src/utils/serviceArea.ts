export type SectorCheckStatus = 'empty' | 'covered' | 'unconfirmed';

export type ZoneMapPinId =
  | 'marseille'
  | 'septemes'
  | 'plan-de-cuques'
  | 'allauch'
  | 'aubagne'
  | 'pennes-mirabeau'
  | 'penne-sur-huveaune';

export interface SectorCheckResult {
  readonly status: SectorCheckStatus;
  readonly matchedLabel: string | null;
  readonly normalizedQuery: string;
  readonly message: string;
}

interface SectorEntry {
  readonly label: string;
  readonly group: 'Marseille' | 'Communes voisines';
  readonly pinId: ZoneMapPinId;
  readonly keywords: readonly string[];
}

const KNOWN_SECTORS: readonly SectorEntry[] = [
  {
    label: 'République (Marseille 13002)',
    group: 'Marseille',
    pinId: 'marseille',
    keywords: ['republique', 'rue de la republique', '13002', 'marseille 2', 'marseille 2e'],
  },
  {
    label: 'Joliette (Marseille 13002)',
    group: 'Marseille',
    pinId: 'marseille',
    keywords: ['joliette', 'la joliette', 'euromediterranee', '13002'],
  },
  {
    label: 'Vieux-Port (Marseille 13001 / 13007)',
    group: 'Marseille',
    pinId: 'marseille',
    keywords: ['vieux-port', 'vieux port', 'canebiere', '13001', '13007', 'marseille 1', 'marseille 7'],
  },
  {
    label: 'Lodi (Marseille 13006)',
    group: 'Marseille',
    pinId: 'marseille',
    keywords: ['lodi', 'rue de lodi', '13006', 'marseille 6', 'marseille 6e'],
  },
  {
    label: 'Castellane (Marseille 13006)',
    group: 'Marseille',
    pinId: 'marseille',
    keywords: ['castellane', 'place castellane', 'prefecture', 'prado', '13006', '13008'],
  },
  {
    label: 'La Timone (Marseille 13005 / 13010)',
    group: 'Marseille',
    pinId: 'marseille',
    keywords: ['la timone', 'timone', 'baille', '13005', '13010', 'marseille 5', 'marseille 10'],
  },
  {
    label: 'Allauch (13190)',
    group: 'Communes voisines',
    pinId: 'allauch',
    keywords: ['allauch', '13190'],
  },
  {
    label: 'Plan-de-Cuques (13380)',
    group: 'Communes voisines',
    pinId: 'plan-de-cuques',
    keywords: ['plan-de-cuques', 'plan de cuques', '13380'],
  },
  {
    label: 'Aubagne (13400)',
    group: 'Communes voisines',
    pinId: 'aubagne',
    keywords: ['aubagne', '13400'],
  },
  {
    label: 'Septèmes-les-Vallons (13240)',
    group: 'Communes voisines',
    pinId: 'septemes',
    keywords: ['septemes-les-vallons', 'septemes les vallons', 'septemes', '13240'],
  },
  {
    label: 'Les Pennes-Mirabeau (13170)',
    group: 'Communes voisines',
    pinId: 'pennes-mirabeau',
    keywords: ['les pennes-mirabeau', 'les pennes mirabeau', 'pennes-mirabeau', 'pennes mirabeau', '13170'],
  },
  {
    label: 'La Penne-sur-Huveaune (13821)',
    group: 'Communes voisines',
    pinId: 'penne-sur-huveaune',
    keywords: ['la penne-sur-huveaune', 'la penne sur huveaune', 'penne-sur-huveaune', 'penne sur huveaune', '13821'],
  },
];

export function normalizeSectorText(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Vrai si le mot-clé apparaît comme mot entier dans la recherche
 * (« marseille 1 » ne doit pas correspondre à « marseille 13006 »),
 * ou si la recherche est le début d'un mot-clé de nom de lieu (saisie en cours).
 */
export function keywordMatches(normalizedQuery: string, keyword: string): boolean {
  if (normalizedQuery === keyword) {
    return true;
  }
  const wholeWord = new RegExp(`(^|[\\s-])${escapeRegExp(keyword)}($|[\\s-])`);
  if (wholeWord.test(normalizedQuery)) {
    return true;
  }
  const isPlaceName = /[a-z]/.test(keyword) && !keyword.startsWith('marseille');
  return isPlaceName && normalizedQuery.length >= 4 && keyword.startsWith(normalizedQuery);
}

export function isMarseillePostalCode(normalizedQuery: string): string | null {
  const match = normalizedQuery.match(/\b(130(?:0[1-9]|1[0-6]))\b/);
  return match ? match[1] : null;
}

/**
 * Resolves which map marker corresponds to a selected district or commune name.
 */
export function resolveZoneMapFocusPin(selectedSector: string | null): ZoneMapPinId {
  if (!selectedSector) {
    return 'marseille';
  }
  const normalized = normalizeSectorText(selectedSector);
  if (!normalized || normalized.includes('arrondissement') || normalized === 'marseille') {
    return 'marseille';
  }

  for (const sector of KNOWN_SECTORS) {
    const matched = sector.keywords.some((kw) => keywordMatches(normalized, kw));
    if (matched) {
      return sector.pinId;
    }
  }

  return 'marseille';
}

export function checkServiceSector(rawQuery: string): SectorCheckResult {
  const normalizedQuery = normalizeSectorText(rawQuery);
  if (normalizedQuery.length < 2) {
    return {
      status: 'empty',
      matchedLabel: null,
      normalizedQuery,
      message: 'Veuillez saisir un quartier, une commune ou un code postal (ex. 13002, Lodi, Allauch).',
    };
  }

  for (const sector of KNOWN_SECTORS) {
    const matched = sector.keywords.some((kw) => keywordMatches(normalizedQuery, kw));
    if (matched) {
      return {
        status: 'covered',
        matchedLabel: sector.label,
        normalizedQuery,
        message: `${sector.label} fait partie de notre zone d’intervention.`,
      };
    }
  }

  const marseilleCp = isMarseillePostalCode(normalizedQuery);
  if (
    marseilleCp ||
    normalizedQuery === 'marseille' ||
    normalizedQuery.startsWith('marseille ') ||
    normalizedQuery.includes('1er au 16') ||
    normalizedQuery.includes('16 arrondissements')
  ) {
    const label = marseilleCp ? `Marseille (${marseilleCp})` : 'Marseille (1er au 16e arr.)';
    return {
      status: 'covered',
      matchedLabel: label,
      normalizedQuery,
      message: `${label} fait partie de notre zone d’intervention à Marseille.`,
    };
  }

  return {
    status: 'unconfirmed',
    matchedLabel: null,
    normalizedQuery,
    message:
      'Ce secteur ne figure pas encore dans la liste principale. Appelez-nous ou demandez un devis pour confirmer la prise en charge.',
  };
}
