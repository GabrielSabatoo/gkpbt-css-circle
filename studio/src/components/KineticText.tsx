import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { theme } from '../theme';

/** Words appear one by one. `highlight` words turn amber; `initials` lights up the first letter. */
export const KineticText: React.FC<{
  words: string[];
  perWordFrames?: number;
  highlight?: number[];
  initials?: boolean;
  size?: number;
}> = ({ words, perWordFrames = 8, highlight = [], initials = false, size = 96 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.bg,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundImage: 'radial-gradient(ellipse at center, rgba(40,60,110,0.35) 0%, rgba(6,11,24,1) 70%)',
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: `0 ${size * 0.3}px`, justifyContent: 'center', maxWidth: '80%' }}>
        {words.map((w, i) => {
          const s = spring({ frame: frame - i * perWordFrames, fps, config: { damping: 18, stiffness: 140 } });
          const y = interpolate(s, [0, 1], [30, 0]);
          const isHi = highlight.includes(i);
          return (
            <span
              key={i}
              style={{
                fontFamily: theme.fontDisplay,
                fontSize: size,
                color: isHi ? theme.amber : theme.text,
                opacity: s,
                transform: `translateY(${y}px)`,
                letterSpacing: '0.01em',
              }}
            >
              {initials ? (
                <>
                  <span style={{ color: theme.amber }}>{w[0]}</span>
                  <span style={{ opacity: 0.85 }}>{w.slice(1)}</span>
                </>
              ) : (
                w
              )}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
