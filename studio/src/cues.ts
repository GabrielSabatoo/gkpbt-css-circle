// Find when a phrase is spoken, using word-level timings of the narration.
export type Word = { w: string; start: number; end: number };

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

export const makeCues = (words: Word[], fps: number) => {
  const tokens = words.map((w) => ({ ...w, n: norm(w.w) }));
  const find = (phrase: string, afterSec = 0) => {
    const seq = phrase.split(/\s+/).map(norm).filter(Boolean);
    for (let i = 0; i <= tokens.length - seq.length; i++) {
      if (tokens[i].start < afterSec) continue;
      if (seq.every((s, j) => tokens[i + j].n === s)) return { i, start: tokens[i].start, end: tokens[i + seq.length - 1].end };
    }
    throw new Error(`Cue not found: "${phrase}" after ${afterSec}s`);
  };
  return {
    /** frame when the phrase starts */
    at: (phrase: string, afterSec = 0) => Math.round(find(phrase, afterSec).start * fps),
    /** frame when the phrase ends */
    end: (phrase: string, afterSec = 0) => Math.round(find(phrase, afterSec).end * fps),
    sec: (phrase: string, afterSec = 0) => find(phrase, afterSec).start,
  };
};
