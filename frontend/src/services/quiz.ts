// Quiz generation from the offline proverb dataset. Three modes + difficulty.
// Hermes-safe (no Unicode property escapes). Blanks whole whitespace tokens.
import { PROVERBS, Proverb, normalize } from '@/src/services/proverbs';

export type QuizMode = 'complete' | 'meaning' | 'word';
export type Difficulty = 'easy' | 'medium' | 'hard';

export type QuizQuestion = {
  mode: QuizMode;
  proverb: Proverb;
  prompt: string; // display text (with blank for complete/word modes)
  options: string[];
  answerIndex: number;
};

// Seconds per question for timed mode, by difficulty.
export const TIME_LIMITS: Record<Difficulty, number> = { easy: 20, medium: 12, hard: 8 };
// Score multiplier by difficulty.
export const DIFFICULTY_MULTIPLIER: Record<Difficulty, number> = { easy: 1, medium: 1.5, hard: 2 };

const QUESTIONS_PER_QUIZ = 10;
const BLANK = '______';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function clean(word: string): string {
  return word.replace(/[.,;:!?"“”'’`()\[\]{}«»…\-–—/]/g, '').trim();
}

function tokenize(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

const FILL_POOL: Proverb[] = PROVERBS.filter((p) => {
  const t = tokenize(p.proverb);
  return t.filter((w) => clean(w).length >= 3).length >= 3;
});
const MEANING_POOL: Proverb[] = PROVERBS.filter((p) => p.meaning && p.meaning.length > 10);

const VOCAB: string[] = (() => {
  const set = new Set<string>();
  for (const p of FILL_POOL) {
    for (const w of tokenize(p.proverb)) {
      const c = clean(w);
      if (c.length >= 3) set.add(c);
    }
  }
  return [...set];
})();

function distinctDistractors(correct: string, n: number, difficulty: Difficulty): string[] {
  const cNorm = normalize(correct);
  let pool = VOCAB;
  // Hard: prefer words sharing the same first letter and similar length (more confusing).
  if (difficulty === 'hard') {
    const fc = cNorm.charAt(0);
    const filtered = VOCAB.filter(
      (w) => normalize(w).charAt(0) === fc && Math.abs(w.length - correct.length) <= 3,
    );
    if (filtered.length >= n + 2) pool = filtered;
  }
  const out: string[] = [];
  const used = new Set<string>([cNorm]);
  let guard = 0;
  while (out.length < n && guard < 800) {
    guard++;
    const cand = pickRandom(pool);
    const cn = normalize(cand);
    if (!used.has(cn) && cand.length >= 3) {
      used.add(cn);
      out.push(cand);
    }
  }
  return out;
}

function buildBlank(p: Proverb, mode: 'complete' | 'word', difficulty: Difficulty): QuizQuestion | null {
  const tokens = tokenize(p.proverb);
  const candidateIdx: number[] = [];
  const from = mode === 'complete' ? 0 : 1;
  const to = mode === 'complete' ? tokens.length : tokens.length - 1;
  for (let i = from; i < to; i++) {
    if (clean(tokens[i]).length >= 3) candidateIdx.push(i);
  }
  if (candidateIdx.length === 0) return null;

  const targetIdx =
    mode === 'complete' ? candidateIdx[candidateIdx.length - 1] : pickRandom(candidateIdx);
  const answer = clean(tokens[targetIdx]);
  if (!answer) return null;

  const promptTokens = [...tokens];
  promptTokens[targetIdx] = BLANK;
  const distractors = distinctDistractors(answer, 3, difficulty);
  if (distractors.length < 3) return null;

  const options = shuffle([answer, ...distractors]);
  return {
    mode,
    proverb: p,
    prompt: promptTokens.join(' '),
    options,
    answerIndex: options.indexOf(answer),
  };
}

function buildMeaning(p: Proverb, difficulty: Difficulty): QuizQuestion | null {
  if (!p.meaning || p.meaning.length < 10) return null;
  const answer = p.meaning;
  // Hard: distractors from proverbs sharing the same first letter (look related).
  let pool = MEANING_POOL;
  if (difficulty === 'hard') {
    const filtered = MEANING_POOL.filter((x) => x.firstLetter === p.firstLetter && x.id !== p.id);
    if (filtered.length >= 5) pool = filtered;
  }
  const distractors: string[] = [];
  const used = new Set<string>([normalize(answer)]);
  let guard = 0;
  while (distractors.length < 3 && guard < 400) {
    guard++;
    const cand = pickRandom(pool);
    const cn = normalize(cand.meaning);
    if (!used.has(cn)) {
      used.add(cn);
      distractors.push(cand.meaning);
    }
  }
  if (distractors.length < 3) return null;
  const options = shuffle([answer, ...distractors]);
  return {
    mode: 'meaning',
    proverb: p,
    prompt: p.proverb,
    options,
    answerIndex: options.indexOf(answer),
  };
}

export function generateQuiz(
  mode: QuizMode,
  difficulty: Difficulty = 'medium',
  count = QUESTIONS_PER_QUIZ,
): QuizQuestion[] {
  const pool = mode === 'meaning' ? MEANING_POOL : FILL_POOL;
  const questions: QuizQuestion[] = [];
  const usedIds = new Set<string>();
  let guard = 0;
  while (questions.length < count && guard < count * 40) {
    guard++;
    const p = pickRandom(pool);
    if (usedIds.has(p.id)) continue;
    let q: QuizQuestion | null = null;
    if (mode === 'meaning') q = buildMeaning(p, difficulty);
    else q = buildBlank(p, mode, difficulty);
    if (q) {
      usedIds.add(p.id);
      questions.push(q);
    }
  }
  return questions;
}
