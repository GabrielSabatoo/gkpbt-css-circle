import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import { makeCues } from '../../cues';
import words from '../../data/v001/words.json';

export const useCues = () => {
  const { fps } = useVideoConfig();
  return makeCues(words as any, fps);
};

export type Seg = { from: number; to: number; fade?: number; render: (local: number) => React.ReactNode };

/** Render only the segments active at this frame, with short cross-fades. Frames are absolute. */
export const Segments: React.FC<{ segs: Seg[] }> = ({ segs }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {segs
        .filter((s) => frame >= s.from && frame < s.to)
        .map((s, i) => {
          const f = s.fade ?? 8;
          const o = Math.min(1, (frame - s.from) / f, (s.to - frame) / f);
          return (
            // Sequence makes useCurrentFrame() inside kit components local to the segment
            <Sequence key={`${s.from}-${i}`} from={s.from} durationInFrames={s.to - s.from} layout="none">
              <AbsoluteFill style={{ opacity: Math.max(0, Math.min(1, o)) }}>{s.render(frame - s.from)}</AbsoluteFill>
            </Sequence>
          );
        })}
    </>
  );
};
