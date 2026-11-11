import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { theme } from '../theme';

export const NeutralBg: React.FC<{ children?: React.ReactNode; opacity?: number }> = ({ children, opacity = 1 }) => (
  <AbsoluteFill
    style={{
      opacity,
      backgroundColor: theme.bg,
      backgroundImage: 'radial-gradient(ellipse at center, rgba(40,60,110,0.38) 0%, rgba(6,11,24,1) 72%)',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    {children}
  </AbsoluteFill>
);

/** Word-by-word line. `color` for all words; `hi` indexes turn amber. Frames are local to the Sequence. */
export const Words: React.FC<{ words: string[]; every?: number; size?: number; color?: string; hi?: number[]; startAt?: number[] }> = ({
  words, every = 7, size = 92, color = theme.text, hi = [], startAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: `0 ${size * 0.3}px`, maxWidth: '82%' }}>
      {words.map((w, i) => {
        const s = spring({ frame: frame - (startAt ? startAt[i] : i * every), fps, config: { damping: 18, stiffness: 150 } });
        return (
          <span key={i} style={{ fontFamily: theme.fontDisplay, fontSize: size, lineHeight: 1.15, color: hi.includes(i) ? theme.amber : color, opacity: s, transform: `translateY(${interpolate(s, [0, 1], [28, 0])}px)` }}>
            {w}
          </span>
        );
      })}
    </div>
  );
};

/** Big word that slams in (scale from 1.4 → 1). */
export const Slam: React.FC<{ text: string; size?: number; color?: string; sub?: string }> = ({ text, size = 220, color = theme.amber, sub }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 14, stiffness: 180 } });
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: theme.fontDisplay, fontSize: size, color, transform: `scale(${interpolate(s, [0, 1], [1.4, 1])})`, opacity: Math.min(1, s * 1.4), letterSpacing: '0.04em' }}>{text}</div>
      {sub ? <div style={{ fontFamily: theme.fontBody, fontSize: 40, color: theme.textMuted, marginTop: 10, opacity: s }}>{sub}</div> : null}
    </div>
  );
};

/** Small icon card (runway, fire, terminal) */
export const IconCard: React.FC<{ kind: 'runway' | 'fire' | 'terminal'; label: string; appear: number }> = ({ kind, label, appear }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 18, opacity: appear, transform: `translateX(${(1 - appear) * 40}px)` }}>
    <svg width={70} height={70} viewBox="0 0 70 70">
      <rect x={1} y={1} width={68} height={68} rx={16} fill="rgba(255,181,71,0.12)" stroke={theme.amber} strokeWidth={2} />
      {kind === 'runway' ? (
        <g stroke={theme.amber} strokeWidth={3} fill="none">
          <path d="M26 58 L31 12 M44 58 L39 12" />
          <path d="M35 52 L35 46 M35 38 L35 32 M35 24 L35 18" strokeDasharray="0" />
        </g>
      ) : kind === 'fire' ? (
        <path d="M35 14 C44 26 50 32 48 44 C46 54 40 58 35 58 C30 58 23 54 22 45 C21 37 27 31 30 24 C32 31 35 33 37 33 C38 27 37 20 35 14 Z" fill={theme.amber} />
      ) : (
        <g fill={theme.amber}>
          <rect x={14} y={30} width={42} height={24} rx={3} />
          <rect x={20} y={20} width={30} height={10} rx={2} />
          <rect x={20} y={36} width={6} height={8} fill={theme.bg} />
          <rect x={32} y={36} width={6} height={8} fill={theme.bg} />
          <rect x={44} y={36} width={6} height={8} fill={theme.bg} />
        </g>
      )}
    </svg>
    <span style={{ fontFamily: theme.fontBody, fontWeight: 700, fontSize: 36, color: theme.text }}>{label}</span>
  </div>
);
