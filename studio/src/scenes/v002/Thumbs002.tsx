import React from 'react';
import { AbsoluteFill } from 'remotion';
import { USMap, US_AIRPORTS, CENTERS } from '../../components/USMap';
import { theme } from '../../theme';

/** Thumbnails for video 002 (rendered at 1920×1080, exported at 1280×720). */

const big = (size: number, color: string): React.CSSProperties => ({
  fontFamily: theme.fontSerif, fontWeight: 700, fontSize: size, lineHeight: 0.92, color, letterSpacing: -2,
  textShadow: '0 6px 28px rgba(0,0,0,0.65)',
});

const Spark: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <circle cx={x} cy={y} r={90} fill="#ffb347" opacity={0.18} />
    <circle cx={x} cy={y} r={40} fill="#ffd27a" opacity={0.45} />
    {Array.from({ length: 14 }).map((_, i) => {
      const a = (i / 14) * Math.PI * 2 + 0.3, r1 = 18, r2 = 60 + ((i * 37) % 50);
      return <line key={i} x1={x + Math.cos(a) * r1} y1={y + Math.sin(a) * r1} x2={x + Math.cos(a) * r2} y2={y + Math.sin(a) * r2} stroke="#ffe3a3" strokeWidth={4} strokeLinecap="round" />;
    })}
    <circle cx={x} cy={y} r={14} fill="#fff6dc" />
  </g>
);

/** G: night map, every airport red, a severed glowing cable sparking across the country. */
export const Thumb002G: React.FC = () => (
  <AbsoluteFill>
    <USMap night={1} airports={0}>
      {(p) => {
        const a = p(CENTERS.find((c) => c.id === 'ZAU')!.at)!, b = p(CENTERS.find((c) => c.id === 'ZNY')!.at)!;
        const w1 = p(CENTERS.find((c) => c.id === 'ZDV')!.at)!;
        const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        return (
          <g>
            {US_AIRPORTS.map((ap) => { const xy = p(ap.at); if (!xy) return null; return (
              <g key={ap.code}><circle cx={xy[0]} cy={xy[1]} r={26} fill="#ff2a1f" opacity={0.25} /><circle cx={xy[0]} cy={xy[1]} r={10} fill="#ff3b2f" stroke="#fff" strokeWidth={3} /></g>
            ); })}
            <polyline points={`${w1[0]},${w1[1]} ${a[0]},${a[1]} ${mid[0] - 30},${mid[1] - 8}`} fill="none" stroke="#f2c14e" strokeWidth={9} strokeLinecap="round" opacity={0.95} />
            <polyline points={`${mid[0] + 30},${mid[1] + 8} ${b[0]},${b[1]}`} fill="none" stroke="#f2c14e" strokeWidth={9} strokeLinecap="round" opacity={0.95} />
            <Spark x={mid[0] - 30} y={mid[1] - 8} />
          </g>
        );
      }}
    </USMap>
    <AbsoluteFill style={{ background: 'linear-gradient(90deg, rgba(5,9,18,0.9) 0%, rgba(5,9,18,0.55) 38%, rgba(5,9,18,0) 60%)' }} />
    <div style={{ position: 'absolute', left: 70, top: 110 }}>
      <div style={big(170, '#f6efe0')}>ALL</div>
      <div style={big(170, '#f6efe0')}>FLIGHTS</div>
      <div style={big(170, '#ff3b2f')}>STOPPED</div>
    </div>
    <div style={{ position: 'absolute', left: 76, bottom: 110, fontFamily: theme.fontMono, fontSize: 44, letterSpacing: 8, color: '#0c1626', background: '#f2c14e', padding: '10px 24px', transform: 'rotate(-2deg)' }}>ONE BROKEN LINK?</div>
  </AbsoluteFill>
);

/** H: departures board, every row GROUNDED. */
export const Thumb002H: React.FC = () => {
  const rows = ['NEW YORK', 'CHICAGO', 'ATLANTA', 'DENVER', 'DALLAS', 'LOS ANGELES', 'MIAMI'];
  return (
    <AbsoluteFill style={{ backgroundColor: '#06080c' }}>
      <div style={{ position: 'absolute', right: 70, top: 120, width: 1050, background: '#111418', border: '8px solid #2a2f38', borderRadius: 14, padding: '26px 34px', transform: 'rotate(2deg)', boxShadow: '0 40px 120px rgba(0,0,0,0.8)' }}>
        <div style={{ fontFamily: theme.fontMono, color: '#f2c14e', fontSize: 40, letterSpacing: 8, marginBottom: 14 }}>DEPARTURES</div>
        {rows.map((r) => (
          <div key={r} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: theme.fontMono, fontSize: 54, padding: '12px 0', borderTop: '2px solid #23272f', color: '#e8e6dd' }}>
            <span>{r}</span><span style={{ color: '#ff3b2f', textShadow: '0 0 18px rgba(255,59,47,0.7)' }}>GROUNDED</span>
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', left: 60, bottom: 90 }}>
        <div style={big(150, '#f6efe0')}>EVERY</div>
        <div style={big(150, '#ff3b2f')}>PLANE</div>
        <div style={big(150, '#f6efe0')}>IN AMERICA</div>
      </div>
    </AbsoluteFill>
  );
};
