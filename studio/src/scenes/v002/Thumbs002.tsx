import React from 'react';
import { AbsoluteFill } from 'remotion';
import { USMap, US_AIRPORTS, CENTERS } from '../../components/USMap';
import { theme } from '../../theme';
import { PlaneIcon } from '../../components/Overlays';

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

/* ---------- more dramatic versions ---------- */
const rr = (k: number) => { const x = Math.sin(k * 91.7 + 13.3) * 43758.5453; return x - Math.floor(x); };
const crack = (x0: number, y0: number, ang: number, len: number, seed: number) => {
  const pts: [number, number][] = [[x0, y0]]; let x = x0, y = y0, a = ang;
  for (let i = 0; i < 9; i++) { a += (rr(seed + i) - 0.5) * 0.9; const step = len / 9; x += Math.cos(a) * step; y += Math.sin(a) * step; pts.push([x, y]); }
  return pts.map((p) => p.join(',')).join(' ');
};
const glitch = (size: number, color: string): React.CSSProperties => ({
  fontFamily: theme.fontBlock ?? theme.fontSerif, fontWeight: 900, fontSize: size, lineHeight: 0.9, color, letterSpacing: -1,
  textShadow: `6px 0 0 rgba(0,229,255,0.55), -6px 0 0 rgba(255,0,60,0.75), 0 10px 40px rgba(0,0,0,0.9)`,
});
const Hazard: React.FC<{ text: string; top: number }> = ({ text, top }) => (
  <div style={{ position: 'absolute', left: -40, right: -40, top, height: 92, transform: 'rotate(-3deg)', background: 'repeating-linear-gradient(-45deg, #ffcc00 0 40px, #111 40px 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.7)' }}>
    <span style={{ background: '#111', color: '#ffcc00', fontFamily: theme.fontMono, fontWeight: 700, fontSize: 52, letterSpacing: 10, padding: '4px 30px' }}>{text}</span>
  </div>
);

/** I: red-alert night map, the country cracking from one broken link, a giant dark jet overhead. */
export const Thumb002I: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: '#050203' }}>
    <USMap night={1} airports={0}>
      {(p) => {
        const s = p(CENTERS.find((c) => c.id === 'ZOB')!.at)!;
        return (
          <g>
            {US_AIRPORTS.map((ap) => { const xy = p(ap.at); if (!xy) return null; return (
              <g key={ap.code}><circle cx={xy[0]} cy={xy[1]} r={34} fill="#ff1a0f" opacity={0.28} /><circle cx={xy[0]} cy={xy[1]} r={10} fill="#ff2a1f" stroke="#ffd0c8" strokeWidth={3} /></g>
            ); })}
            {Array.from({ length: 11 }).map((_, i) => (
              <polyline key={i} points={crack(s[0], s[1], (i / 11) * Math.PI * 2, 260 + rr(i) * 420, i * 17)} fill="none" stroke="#ff3b1f" strokeWidth={6 - (i % 3)} strokeLinejoin="round" opacity={0.9} style={{ filter: 'drop-shadow(0 0 10px #ff2a00)' }} />
            ))}
            <circle cx={s[0]} cy={s[1]} r={130} fill="#ff4a1a" opacity={0.25} />
            <circle cx={s[0]} cy={s[1]} r={46} fill="#ffb27a" opacity={0.7} />
            <circle cx={s[0]} cy={s[1]} r={16} fill="#fff1e0" />
          </g>
        );
      }}
    </USMap>
    {/* red alarm wash + vignette */}
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 60% 45%, rgba(120,0,0,0.15) 0%, rgba(60,0,0,0.55) 55%, rgba(0,0,0,0.92) 100%)', mixBlendMode: 'multiply' }} />
    <AbsoluteFill style={{ background: 'rgba(255,20,10,0.10)' }} />
    {/* giant jet overhead, seen from below */}
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      <g style={{ filter: 'drop-shadow(0 0 40px rgba(255,40,20,0.6))' }}>
        <PlaneIcon x={1560} y={330} size={640} heading={-55} color="#030303" outline="#5a1410" />
      </g>
      <circle cx={1452} cy={480} r={0} fill="#ff2a1f" style={{ filter: 'drop-shadow(0 0 18px #ff2a1f)' }} />
    </svg>
    <div style={{ position: 'absolute', left: 60, top: 70 }}>
      <div style={glitch(200, '#ffffff')}>AMERICA</div>
      <div style={glitch(200, '#ff2a1f')}>GROUNDED</div>
    </div>
    <Hazard text="⚠ EVERY FLIGHT STOPPED" top={880} />
  </AbsoluteFill>
);

/** J: radar scope, every target lost. */
export const Thumb002J: React.FC = () => {
  const blips = Array.from({ length: 34 }).map((_, i) => [rr(i) * 2 - 1, rr(i + 50) * 2 - 1]).filter(([x, y]) => x * x + y * y < 0.85);
  return (
    <AbsoluteFill style={{ backgroundColor: '#020504' }}>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id="scope"><stop offset="0%" stopColor="#0d2a1c" /><stop offset="100%" stopColor="#020806" /></radialGradient>
          <linearGradient id="sweep" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#ff2a1f" stopOpacity="0" /><stop offset="100%" stopColor="#ff2a1f" stopOpacity="0.55" /></linearGradient>
        </defs>
        <g transform="translate(1340,540)">
          <circle r={520} fill="url(#scope)" stroke="#1f5a3e" strokeWidth={6} />
          {[130, 260, 390].map((r) => <circle key={r} r={r} fill="none" stroke="#174a33" strokeWidth={3} />)}
          <line x1={-520} y1={0} x2={520} y2={0} stroke="#174a33" strokeWidth={3} /><line x1={0} y1={-520} x2={0} y2={520} stroke="#174a33" strokeWidth={3} />
          <path d="M0,0 L520,0 A520,520 0 0,0 368,-368 Z" fill="url(#sweep)" />
          {blips.map(([x, y], i) => (
            <g key={i} transform={`translate(${x * 520},${y * 520})`}>
              <circle r={22} fill="#ff1a0f" opacity={0.3} /><circle r={8} fill="#ff3b2f" />
              <path d="M-14,-14 L14,14 M14,-14 L-14,14" stroke="#ffd0c8" strokeWidth={3} opacity={0.8} />
            </g>
          ))}
          <text y={20} textAnchor="middle" fontFamily="PlexMonoLocal, monospace" fontSize={64} fontWeight={700} fill="#ff2a1f" letterSpacing={10} style={{ filter: 'drop-shadow(0 0 16px #ff2a1f)' }}>SIGNAL LOST</text>
        </g>
      </svg>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 70% 50%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.85) 100%)' }} />
      <div style={{ position: 'absolute', left: 60, top: 120 }}>
        <div style={glitch(150, '#ffffff')}>THE SKY</div>
        <div style={glitch(150, '#ffffff')}>WENT</div>
        <div style={glitch(190, '#ff2a1f')}>DARK</div>
      </div>
      <Hazard text="⚠ ALL US FLIGHTS STOPPED" top={890} />
    </AbsoluteFill>
  );
};
