import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { Globe } from '../components/Globe';
import { byCode } from '../data/airports';
import { theme } from '../theme';

// Test of beats 30–32 and 47–48: 60-min circles leave a gap; they swell to 120 and the gap closes.
const CODES = ['BOS', 'JFK', 'YYT', 'YQX', 'BGSF', 'KEF', 'SNN', 'LHR', 'CDG', 'LIS', 'TER', 'BDA'];

export const AtlanticDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const ease = Easing.bezier(0.45, 0, 0.2, 1);
  const t = (a: number, b: number) => interpolate(frame, [a * fps, b * fps], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });

  // camera: push in from a wide globe to the North Atlantic
  const zoom = t(0, 2.5);
  const camera = { lon: interpolate(zoom, [0, 1], [-60, -35]), lat: interpolate(zoom, [0, 1], [20, 48]), scale: interpolate(zoom, [0, 1], [420, 1150]) };

  const minutes = interpolate(t(6, 8), [0, 1], [60, 120]);
  const circlesIn = t(2.5, 4);
  const gapPulse = frame > 4.2 * fps && frame < 6.2 * fps ? 0.5 + 0.5 * Math.sin((frame / fps) * Math.PI * 3) : 0;

  return (
    <AbsoluteFill>
      <Globe
        width={width}
        height={height}
        camera={camera}
        landDim={t(2.5, 3.5) * 0.35}
        dots={CODES.map((c, i) => ({ airport: byCode(c), appear: t(0.8 + i * 0.1, 1.4 + i * 0.1) }))}
        circles={CODES.map((c) => ({ airport: byCode(c), minutes, appear: circlesIn }))}
      >
        {(projection) => {
          const p = projection([-38, 45]);
          if (!p) return null;
          const gapOpacity = (frame < 6 * fps ? 1 : 1 - t(6, 7.4)) * Math.min(1, t(4, 4.5) * 2);
          return (
            <g opacity={gapOpacity}>
              <circle cx={p[0]} cy={p[1]} r={150 + 20 * gapPulse} fill={theme.dangerSoft} stroke={theme.danger} strokeWidth={2} strokeDasharray="8 8" />
              <text x={p[0]} y={p[1] + 14} textAnchor="middle" fill={theme.danger} fontFamily={theme.fontDisplay} fontSize={46}>
                NOWHERE TO GO
              </text>
            </g>
          );
        }}
      </Globe>
      {/* chapter badge */}
      <div
        style={{
          position: 'absolute', top: 48, right: 56, padding: '10px 22px', borderRadius: 999,
          border: `2px solid ${theme.amber}`, color: theme.amber, fontFamily: theme.fontDisplay, fontSize: 34,
          background: 'rgba(6,11,24,0.6)', opacity: t(2.5, 3),
        }}
      >
        {Math.round(minutes)} MIN
      </div>
      <div style={{ position: 'absolute', bottom: 36, left: 56, color: theme.textMuted, fontFamily: theme.fontBody, fontSize: 18, opacity: 0.7 }}>
        Illustrative circles
      </div>
    </AbsoluteFill>
  );
};
