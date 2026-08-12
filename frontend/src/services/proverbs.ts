// Proverb data layer. Loads the bundled offline dataset and exposes fast,
// Turkish-aware query helpers. Search index is built lazily on first use to
// keep app startup fast.

import rawData from '@/src/data/proverbs.json';

export type Proverb = {
  id: string;
  proverb: string;
  meaning: string;
  explanation: string;
  firstLetter: string;
  categories: string[];
};

export const PROVERBS: Proverb[] = rawData as unknown as Proverb[];
export const PROVERB_COUNT = PROVERBS.length;

const BY_ID: Record<string, Proverb> = {};
for (const p of PROVERBS) BY_ID[p.id] = p;

export function getById(id: string): Proverb | undefined {
  return BY_ID[id];
}

// Turkish-insensitive normalization for search & comparison.
export function normalize(input: string): string {
  return input
    .replace(/İ/g, 'i')
    .replace(/I/g, 'i')
    .replace(/ı/g, 'i')
    .toLowerCase()
    .replace(/â/g, 'a')
    .replace(/î/g, 'i')
    .replace(/û/g, 'u')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Turkish alphabet ordering for the A-Z rail.
const TR_ORDER = 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ';
function letterRank(l: string): number {
  const i = TR_ORDER.indexOf(l);
  return i === -1 ? 999 : i;
}

// Letters actually present, in Turkish order, with counts.
export const LETTERS: { letter: string; count: number }[] = (() => {
  const counts: Record<string, number> = {};
  for (const p of PROVERBS) counts[p.firstLetter] = (counts[p.firstLetter] || 0) + 1;
  return Object.keys(counts)
    .sort((a, b) => letterRank(a) - letterRank(b))
    .map((letter) => ({ letter, count: counts[letter] }));
})();

// First index of each letter in PROVERBS order (dataset is already alphabetical).
export const LETTER_INDEX: Record<string, number> = (() => {
  const idx: Record<string, number> = {};
  PROVERBS.forEach((p, i) => {
    if (idx[p.firstLetter] === undefined) idx[p.firstLetter] = i;
  });
  return idx;
})();

// Lazy search index.
let SEARCH_INDEX: string[] | null = null;
function ensureIndex(): string[] {
  if (SEARCH_INDEX) return SEARCH_INDEX;
  SEARCH_INDEX = PROVERBS.map((p) =>
    normalize(`${p.proverb} ${p.meaning} ${p.explanation}`),
  );
  return SEARCH_INDEX;
}

export function search(query: string, limit = 500): Proverb[] {
  const q = normalize(query);
  if (!q) return [];
  const terms = q.split(' ').filter(Boolean);
  const index = ensureIndex();
  const out: Proverb[] = [];
  for (let i = 0; i < PROVERBS.length; i++) {
    const hay = index[i];
    let ok = true;
    for (const t of terms) {
      if (!hay.includes(t)) {
        ok = false;
        break;
      }
    }
    if (ok) {
      out.push(PROVERBS[i]);
      if (out.length >= limit) break;
    }
  }
  return out;
}

export function byLetter(letter: string): Proverb[] {
  return PROVERBS.filter((p) => p.firstLetter === letter);
}

export function byCategory(key: string): Proverb[] {
  return PROVERBS.filter((p) => p.categories.includes(key));
}

export function categoryCount(key: string): number {
  let n = 0;
  for (const p of PROVERBS) if (p.categories.includes(key)) n++;
  return n;
}

export function randomProverb(): Proverb {
  return PROVERBS[Math.floor(Math.random() * PROVERBS.length)];
}

function dayKey(d = new Date()): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// Deterministic proverb of the day — same all day, changes daily.
export function proverbOfDay(): Proverb {
  return PROVERBS[hashStr(dayKey()) % PROVERBS.length];
}

// Richer entries (with explanation) used for "Öne Çıkan".
const RICH_INDICES: number[] = (() => {
  const arr: number[] = [];
  PROVERBS.forEach((p, i) => {
    if (p.explanation && p.explanation.length > 40) arr.push(i);
  });
  return arr;
})();

// Deterministic daily featured selection.
export function featuredProverbs(count = 8): Proverb[] {
  const pool = RICH_INDICES.length ? RICH_INDICES : PROVERBS.map((_, i) => i);
  const seed = hashStr(dayKey() + 'featured');
  const step = 97;
  const out: Proverb[] = [];
  const used = new Set<number>();
  let cursor = seed % pool.length;
  while (out.length < count && used.size < pool.length) {
    if (!used.has(cursor)) {
      used.add(cursor);
      out.push(PROVERBS[pool[cursor]]);
    }
    cursor = (cursor + step) % pool.length;
  }
  return out;
}
