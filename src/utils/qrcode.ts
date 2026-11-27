/**
 * Générateur de QR code (mode octet), sans bibliothèque externe, d'après la norme
 * ISO/IEC 18004 (méthode de Nayuki). Même algorithme que le QR code du flyer
 * (docs/flyer-offre/qr-offre-5.*), vérifié au téléphone ; le test compare les deux.
 */

export type QrEcc = 'L' | 'M' | 'Q' | 'H';

const ECC_PER_BLOCK: Readonly<Record<QrEcc, readonly number[]>> = {
  L: [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  M: [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
  Q: [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  H: [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
};
const NUM_BLOCKS: Readonly<Record<QrEcc, readonly number[]>> = {
  L: [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
  M: [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
  Q: [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
  H: [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81],
};
const FORMAT_BITS: Readonly<Record<QrEcc, number>> = { L: 1, M: 0, Q: 3, H: 2 };

function rawModules(ver: number): number {
  let r = (16 * ver + 128) * ver + 64;
  if (ver >= 2) {
    const n = Math.floor(ver / 7) + 2;
    r -= (25 * n - 10) * n - 55;
    if (ver >= 7) r -= 36;
  }
  return r;
}

function dataCodewords(ver: number, ecl: QrEcc): number {
  return Math.floor(rawModules(ver) / 8) - ECC_PER_BLOCK[ecl][ver] * NUM_BLOCKS[ecl][ver];
}

function gfMul(x: number, y: number): number {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z;
}

function rsDivisor(degree: number): number[] {
  const result = new Array<number>(degree - 1).fill(0).concat([1]);
  let root = 1;
  for (let k = 0; k < degree; k++) {
    for (let j = 0; j < result.length; j++) {
      result[j] = gfMul(result[j], root);
      if (j + 1 < result.length) result[j] ^= result[j + 1];
    }
    root = gfMul(root, 0x02);
  }
  return result;
}

function rsRemainder(data: readonly number[], divisor: readonly number[]): number[] {
  const result = new Array<number>(divisor.length).fill(0);
  for (const b of data) {
    const factor = b ^ (result.shift() as number);
    result.push(0);
    divisor.forEach((coef, i) => {
      result[i] ^= gfMul(coef, factor);
    });
  }
  return result;
}

const MASKS: readonly ((x: number, y: number) => boolean)[] = [
  (x, y) => (x + y) % 2 === 0,
  (_x, y) => y % 2 === 0,
  (x) => x % 3 === 0,
  (x, y) => (x + y) % 3 === 0,
  (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
  (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
  (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
  (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
];

export interface QrCode {
  readonly version: number;
  readonly size: number;
  readonly mask: number;
  /** modules[y][x] : true = carré foncé. */
  readonly modules: readonly (readonly boolean[])[];
}

export function encodeQr(text: string, ecl: QrEcc = 'H'): QrCode {
  const data = Array.from(new TextEncoder().encode(text));
  let ver = 1;
  for (; ver <= 40; ver++) {
    const countBits = ver < 10 ? 8 : 16;
    if (4 + countBits + 8 * data.length <= dataCodewords(ver, ecl) * 8) break;
  }
  if (ver > 40) throw new Error('Texte trop long pour un QR code.');
  const size = ver * 4 + 17;
  const countBits = ver < 10 ? 8 : 16;

  const bits: number[] = [];
  const append = (val: number, n: number) => {
    for (let i = n - 1; i >= 0; i--) bits.push((val >>> i) & 1);
  };
  append(0b0100, 4);
  append(data.length, countBits);
  data.forEach((b) => append(b, 8));
  const cap = dataCodewords(ver, ecl) * 8;
  append(0, Math.min(4, cap - bits.length));
  append(0, (8 - (bits.length % 8)) % 8);
  for (let pad = 0xec; bits.length < cap; pad ^= 0xec ^ 0x11) append(pad, 8);
  const codewords: number[] = [];
  for (let i = 0; i < bits.length; i += 8) codewords.push(parseInt(bits.slice(i, i + 8).join(''), 2));

  const m: boolean[][] = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));
  const f: boolean[][] = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));
  const setf = (x: number, y: number, dark: boolean) => {
    m[y][x] = dark;
    f[y][x] = true;
  };

  const drawFormat = (mask: number) => {
    const d = (FORMAT_BITS[ecl] << 3) | mask;
    let rem = d;
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    const fb = ((d << 10) | rem) ^ 0x5412;
    const b = (i: number) => ((fb >>> i) & 1) === 1;
    for (let i = 0; i < 6; i++) setf(8, i, b(i));
    setf(8, 7, b(6));
    setf(8, 8, b(7));
    setf(7, 8, b(8));
    for (let i = 9; i < 15; i++) setf(14 - i, 8, b(i));
    for (let i = 0; i < 8; i++) setf(size - 1 - i, 8, b(i));
    for (let i = 8; i < 15; i++) setf(8, size - 15 + i, b(i));
    setf(8, size - 8, true);
  };

  // Motifs fixes
  for (let i = 0; i < size; i++) {
    setf(6, i, i % 2 === 0);
    setf(i, 6, i % 2 === 0);
  }
  for (const [cx, cy] of [
    [3, 3],
    [size - 4, 3],
    [3, size - 4],
  ]) {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const x = cx + dx;
        const y = cy + dy;
        if (x >= 0 && x < size && y >= 0 && y < size) setf(x, y, ![2, 4].includes(Math.max(Math.abs(dx), Math.abs(dy))));
      }
    }
  }
  const align: number[] = [];
  if (ver > 1) {
    const na = Math.floor(ver / 7) + 2;
    const step = Math.floor((ver * 8 + na * 3 + 5) / (na * 4 - 4)) * 2;
    align.push(6);
    for (let i = na - 2; i >= 0; i--) align.push(size - 7 - i * step);
  }
  align.forEach((ax, i) =>
    align.forEach((ay, j) => {
      const last = align.length - 1;
      if ((i === 0 && j === 0) || (i === 0 && j === last) || (i === last && j === 0)) return;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) setf(ax + dx, ay + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    })
  );
  drawFormat(0);
  if (ver >= 7) {
    let rem = ver;
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    const vb = (ver << 12) | rem;
    for (let i = 0; i < 18; i++) {
      const bit = ((vb >>> i) & 1) === 1;
      const a = size - 11 + (i % 3);
      const c = Math.floor(i / 3);
      setf(a, c, bit);
      setf(c, a, bit);
    }
  }

  // Correction d'erreurs + entrelacement
  const nb = NUM_BLOCKS[ecl][ver];
  const eccLen = ECC_PER_BLOCK[ecl][ver];
  const raw = Math.floor(rawModules(ver) / 8);
  const nShort = nb - (raw % nb);
  const shortLen = Math.floor(raw / nb);
  const div = rsDivisor(eccLen);
  const blocks: number[][] = [];
  for (let i = 0, k = 0; i < nb; i++) {
    const dat = codewords.slice(k, k + shortLen - eccLen + (i < nShort ? 0 : 1));
    k += dat.length;
    const ecc = rsRemainder(dat, div);
    if (i < nShort) dat.push(0);
    blocks.push(dat.concat(ecc));
  }
  const all: number[] = [];
  for (let i = 0; i < blocks[0].length; i++) {
    blocks.forEach((blk, j) => {
      if (i !== shortLen - eccLen || j >= nShort) all.push(blk[i]);
    });
  }

  // Placement en zigzag
  let bi = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        const upward = ((right + 1) & 2) === 0;
        const y = upward ? size - 1 - vert : vert;
        if (!f[y][x] && bi < all.length * 8) {
          m[y][x] = ((all[bi >>> 3] >>> (7 - (bi & 7))) & 1) === 1;
          bi++;
        }
      }
    }
  }

  const applyMask = (mask: number) => {
    const fn = MASKS[mask];
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!f[y][x] && fn(x, y)) m[y][x] = !m[y][x];
  };
  const penalty = (): number => {
    let p = 0;
    const cols = m[0].map((_, x) => m.map((row) => row[x]));
    for (const lines of [m, cols]) {
      for (const row of lines) {
        let run = 0;
        let prev: boolean | null = null;
        for (const v of row) {
          if (v === prev) run++;
          else {
            if (run >= 5) p += run - 2;
            run = 1;
            prev = v;
          }
        }
        if (run >= 5) p += run - 2;
        const s = row.map((v) => (v ? '1' : '0')).join('');
        if (s.includes('00001011101') || s.includes('10111010000')) p += 40 * (s.split('1011101').length - 1);
      }
    }
    for (let y = 0; y < size - 1; y++)
      for (let x = 0; x < size - 1; x++) if (m[y][x] === m[y][x + 1] && m[y][x] === m[y + 1][x] && m[y][x] === m[y + 1][x + 1]) p += 3;
    const dark = m.reduce((acc, row) => acc + row.filter(Boolean).length, 0);
    p += Math.floor((Math.abs(dark * 20 - size * size * 10) + size * size - 1) / (size * size)) * 10;
    return p;
  };

  let best = 0;
  let bestPenalty = Infinity;
  for (let mask = 0; mask < 8; mask++) {
    applyMask(mask);
    drawFormat(mask);
    const p = penalty();
    if (p < bestPenalty) {
      best = mask;
      bestPenalty = p;
    }
    applyMask(mask);
  }
  applyMask(best);
  drawFormat(best);
  return { version: ver, size, mask: best, modules: m };
}

/** QR code en SVG (bord blanc de 4 modules), pour l'imprimeur. */
export function qrToSvg(qr: QrCode, color = '#0B2A3C', border = 4): string {
  const full = qr.size + border * 2;
  let path = '';
  qr.modules.forEach((row, y) =>
    row.forEach((dark, x) => {
      if (dark) path += `M${x + border},${y + border}h1v1h-1z`;
    })
  );
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${full} ${full}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#FFFFFF"/><path d="${path}" fill="${color}"/></svg>`;
}
