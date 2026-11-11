import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { bodyFont } from '../fonts';

type Word = { w: string; start: number; end: number };
type Line = { words: Word[]; start: number; end: number };

/** Split the word timings into short subtitle lines (max ~6 words, break at punctuation or pauses). */
const toLines = (words: Word[], maxWords = 6): Line[] => {
  const lines: Line[] = [];
  let cur: Word[] = [];
  const flush = () => {
    if (cur.length) lines.push({ words: cur, start: cur[0].start, end: cur[cur.length - 1].end });
    cur = [];
  };
  words.forEach((w, i) => {
    const next = words[i + 1];
    cur.push(w);
    const punct = /[.?!]$/.test(w.w) || (/[,;:]$/.test(w.w) && cur.length >= 3);
    const pause = next ? next.start - w.end > 0.5 : true;
    if (cur.length >= maxWords || punct || pause) flush();
  });
  flush();
  return lines;
};

/** Small karaoke subtitles at the bottom: the line on a dark pill, the word being said in gold. */
export const Captions: React.FC<{ words: Word[]; color?: string; highlight?: string; size?: number }> = ({
  words, color = '#f6efdc', highlight = '#e9b44c', size = 34,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const lines = useMemo(() => toLines(words), [words]);
  const idx = lines.findIndex((l, i) => t >= l.start - 0.05 && t < Math.max(l.end + 0.35, 0) && !(lines[i + 1] && t >= lines[i + 1].start - 0.05));
  if (idx < 0) return null;
  const line = lines[idx];
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 44, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
      <div style={{
        fontFamily: bodyFont, fontWeight: 600, fontSize: size, lineHeight: 1.25, color,
        background: 'rgba(20,24,32,0.72)', padding: '8px 20px', borderRadius: 10, letterSpacing: 0.2,
      }}>
        {line.words.map((w, i) => {
          const active = t >= w.start - 0.03 && (t < w.end + 0.05 || (i === line.words.length - 1 && t < line.end + 0.35));
          return (
            <span key={i} style={{ color: active ? highlight : color }}>
              {w.w}{i < line.words.length - 1 ? ' ' : ''}
            </span>
          );
        })}
      </div>
    </div>
  );
};
