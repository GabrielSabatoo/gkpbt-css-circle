import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { Globe } from '../../components/Globe';
import { GapField, PlaneIcon } from '../../components/Overlays';
import { worldAirports } from '../../data/airports';
import { day, theme } from '../../theme';

const W = 1280;
const H = 720;
const PAC = ['SFO', 'LAX', 'SEA', 'YVR', 'ANC', 'CDB', 'HNL', 'MDY', 'AWK', 'GUM', 'NRT', 'KIX', 'CTS', 'ICN', 'PVG', 'TPE', 'HKG', 'MNL', 'MAJ', 'NAN', 'PPT', 'AKL', 'SYD', 'BNE', 'PKC', 'FAI', 'POM', 'NOU']
  .map((c) => worldAirports.find((a) => a.code === c)!)
  .filter(Boolean);

const big = (size: number, color: string): React.CSSProperties => ({
  fontFamily: theme.fontSerif, fontWeight: 700, fontSize: size, lineHeight: 0.95, color, letterSpacing: -1,
  textShadow: '0 4px 18px rgba(0,0,0,0.35)',
});

/** A: night Pacific, glowing circles, black plane with a dead engine in the red gap. "3 HOURS FROM LAND" */
export const ThumbA: React.FC = () => (
  <AbsoluteFill>
    <Globe width={W} height={H} camera={{ lon: -158, lat: 22, scale: 560 }} day={0}
      dots={PAC.map((a) => ({ airport: a, appear: 1 }))} circles={PAC.map((a) => ({ airport: a, minutes: 120, appear: 1 }))}>
      {(p) => {
        const xy = p([-140, 26])!;
        return (
          <>
            <GapField projection={p} centers={PAC.map((a) => a.at)} minutes={120} bbox={[150, 240, -30, 60]} step={1.6} opacity={0.9} pulse={0.6} />
            <circle cx={xy[0]} cy={xy[1]} r={120} fill={theme.danger} opacity={0.22} />
            <PlaneIcon x={xy[0]} y={xy[1]} size={190} heading={60} engineOut />
          </>
        );
      }}
    </Globe>
    <div style={{ position: 'absolute', left: 56, top: 60 }}>
      <div style={big(150, '#f6efdc')}>3 HOURS</div>
      <div style={{ ...big(112, theme.coral ?? '#e2654f'), fontStyle: 'italic', marginTop: 8 }}>from land</div>
    </div>
  </AbsoluteFill>
);

/** B: paper globe, navy circles, one red uncovered area with the plane inside it. "Can't fly here" */
export const ThumbB: React.FC = () => (
  <AbsoluteFill>
    <Globe width={W} height={H} camera={{ lon: -152, lat: 20, scale: 640 }} day={1}
      dots={PAC.map((a) => ({ airport: a, appear: 1 }))} circles={PAC.map((a) => ({ airport: a, minutes: 120, appear: 1 }))}>
      {(p) => {
        const xy = p([-141, 27])!;
        return (
          <>
            <GapField projection={p} centers={PAC.map((a) => a.at)} minutes={120} bbox={[150, 240, -30, 60]} step={2.4} opacity={0.9} pulse={0.9} />
            <circle cx={xy[0]} cy={xy[1]} r={150} fill="#f3ecd8" opacity={0.55} />
            <circle cx={xy[0]} cy={xy[1]} r={150} fill="none" stroke={day.danger} strokeWidth={5} strokeDasharray="14 10" />
            <PlaneIcon x={xy[0]} y={xy[1]} size={235} heading={75} />
          </>
        );
      }}
    </Globe>
    {/* soft vignette so the corners and text area read */}
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 45% 55%, rgba(0,0,0,0) 55%, rgba(60,45,20,0.28) 100%)' }} />
    <div style={{ position: 'absolute', right: 44, top: 40, textAlign: 'right' }}>
      <div style={{ ...big(132, day.text), textShadow: '0 0 18px #f3ecd8, 0 0 6px #f3ecd8' }}>Can't fly</div>
      <div style={{ ...big(168, day.danger), fontStyle: 'italic', textShadow: '0 0 18px #f3ecd8, 0 0 6px #f3ecd8' }}>here</div>
    </div>
  </AbsoluteFill>
);

/** C: night, huge black plane at the edge of the last circle, one red engine. "TOO FAR?" */
export const ThumbC: React.FC = () => (
  <AbsoluteFill>
    <Globe width={W} height={H} camera={{ lon: -150, lat: 20, scale: 1500 }} day={0}
      dots={PAC.map((a) => ({ airport: a, appear: 1 }))} circles={PAC.map((a) => ({ airport: a, minutes: 120, appear: 1 }))}>
      {(p) => {
        const xy = p([-141, 25])!;
        return (
          <>
            <GapField projection={p} centers={PAC.map((a) => a.at)} minutes={120} bbox={[150, 240, -30, 60]} step={1.0} opacity={0.8} pulse={0.4} />
            <circle cx={xy[0]} cy={xy[1]} r={190} fill={theme.danger} opacity={0.18} />
            <PlaneIcon x={xy[0]} y={xy[1]} size={330} heading={50} engineOut />
          </>
        );
      }}
    </Globe>
    <div style={{ position: 'absolute', left: 60, bottom: 60 }}>
      <div style={{ ...big(170, '#f6efdc') }}>Too <span style={{ fontStyle: 'italic', color: '#e2654f' }}>far?</span></div>
    </div>
  </AbsoluteFill>
);

/** D v2 (Test & Compare): stormy night, big banking plane with a burning engine, sparks, warning tag, red banner text. */
export const ThumbD: React.FC = () => {
  const stroke = (w: number, c: string): React.CSSProperties => ({ WebkitTextStroke: `${w}px ${c}`, paintOrder: 'stroke fill' } as any);
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 72% 58%, #ff7a2a 0%, #8a2a12 18%, #1a1424 45%, #05060c 100%)' }}>
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        <defs>
          <radialGradient id="fireD"><stop offset="0%" stopColor="#fff3b0" /><stop offset="30%" stopColor="#ffb02e" /><stop offset="65%" stopColor="#ff3d0a" /><stop offset="100%" stopColor="#ff2a00" stopOpacity="0" /></radialGradient>
          <linearGradient id="smokeD" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#3a3a40" stopOpacity="0.95" /><stop offset="100%" stopColor="#3a3a40" stopOpacity="0" /></linearGradient>
          <filter id="glowD"><feGaussianBlur stdDeviation="10" /></filter>
        </defs>
        {/* light rays from the fire */}
        {Array.from({ length: 14 }).map((_, i) => {
          const a = (i / 14) * Math.PI * 2; const x = 905 + Math.cos(a) * 900, y = 520 + Math.sin(a) * 900;
          return <path key={i} d={`M905,520 L${x - 40},${y} L${x + 40},${y} Z`} fill="#ff9a3a" opacity={0.06} />;
        })}
        {/* dark sea with moon glints */}
        <path d="M0,560 L1280,500 L1280,720 L0,720 Z" fill="#070a14" opacity={0.85} />
        {Array.from({ length: 40 }).map((_, i) => <rect key={i} x={(i * 211) % 1280} y={540 + ((i * 53) % 170)} width={40 + (i % 4) * 25} height={2} fill="#ffb070" opacity={0.25} />)}
        {/* billowing smoke trail behind the plane */}
        {[0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx={930 + i * 70} cy={560 + i * 32} r={40 + i * 22} fill="url(#smokeD)" opacity={0.85 - i * 0.11} />)}
        {/* fire */}
        <circle cx={905} cy={520} r={150} fill="url(#fireD)" opacity={0.95} />
        <circle cx={905} cy={520} r={60} fill="#fff1a0" filter="url(#glowD)" />
        {Array.from({ length: 22 }).map((_, i) => <circle key={i} cx={905 + ((i * 47) % 220) - 60} cy={520 + ((i * 31) % 160) - 40} r={2 + (i % 3)} fill="#ffd36a" opacity={0.9} />)}
        <g transform="rotate(-8 900 380)"><PlaneIcon x={900} y={380} size={600} heading={-62} engineOut /></g>
        {/* red arrow to the engine */}
        <path d="M560,600 C640,640 760,620 830,560" fill="none" stroke="#ff2d2d" strokeWidth={14} strokeLinecap="round" />
        <path d="M800,540 L852,548 L826,594 Z" fill="#ff2d2d" />
      </svg>
      <div style={{ position: 'absolute', left: 40, top: 30 }}>
        <div style={{ ...big(156, '#ffffff'), ...stroke(10, '#05060c'), letterSpacing: -2, textShadow: '0 0 30px rgba(255,120,40,0.6)' }}>NOWHERE</div>
        <div style={{ display: 'inline-block', marginTop: 6, background: '#e8261d', padding: '2px 22px 10px', transform: 'rotate(-2deg)', boxShadow: '0 8px 30px rgba(0,0,0,0.6)' }}>
          <span style={{ ...big(112, '#ffffff'), textShadow: 'none', letterSpacing: -1 }}>TO LAND</span>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 48, bottom: 40, background: '#ffcc00', color: '#111', fontFamily: 'PlexMonoLocal, monospace', fontWeight: 700, fontSize: 30, letterSpacing: 4, padding: '8px 16px' }}>⚠ ENGINE FAILURE</div>
    </AbsoluteFill>
  );
};

/** E v2 (Test & Compare): deep ocean, glowing red no-runway zone with pulse rings, outlined text, yellow arrow. */
export const ThumbE: React.FC = () => {
  const stroke = (w: number, c: string): React.CSSProperties => ({ WebkitTextStroke: `${w}px ${c}`, paintOrder: 'stroke fill' } as any);
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 72% 52%, #2f7fb0 0%, #154a73 45%, #071a2c 100%)' }}>
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        <defs>
          <radialGradient id="zoneE"><stop offset="0%" stopColor="#ff3b30" stopOpacity="0.55" /><stop offset="75%" stopColor="#ff3b30" stopOpacity="0.35" /><stop offset="100%" stopColor="#ff3b30" stopOpacity="0" /></radialGradient>
          <pattern id="hatchE" width="24" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="9" height="24" fill="#ff5a4a" opacity="0.45" /></pattern>
          <filter id="glowE"><feGaussianBlur stdDeviation="14" /></filter>
        </defs>
        {Array.from({ length: 50 }).map((_, i) => <path key={i} d={`M${(i * 173) % 1400 - 80},${40 + ((i * 97) % 680)} q30,-7 60,0 t60,0`} fill="none" stroke="#9fd0ee" strokeWidth={2.5} opacity={0.2} />)}
        {[400, 360].map((r, i) => <circle key={i} cx={930} cy={380} r={r} fill="none" stroke="#ff3b30" strokeWidth={4} opacity={0.25 - i * 0.05} />)}
        <circle cx={930} cy={380} r={318} fill="#ff2a1a" opacity={0.5} filter="url(#glowE)" />
        <circle cx={930} cy={380} r={300} fill="url(#zoneE)" />
        <circle cx={930} cy={380} r={300} fill="url(#hatchE)" />
        <circle cx={930} cy={380} r={300} fill="none" stroke="#ff2d2d" strokeWidth={12} strokeDasharray="36 18" />
        <ellipse cx={950} cy={420} rx={170} ry={60} fill="#000" opacity={0.3} filter="url(#glowE)" />
        <PlaneIcon x={930} y={370} size={430} heading={58} />
        {/* yellow arrow */}
        <path d="M520,610 C600,640 690,600 740,520" fill="none" stroke="#ffd400" strokeWidth={16} strokeLinecap="round" />
        <path d="M712,512 L760,490 L758,546 Z" fill="#ffd400" />
      </svg>
      <div style={{ position: 'absolute', left: 40, top: 30 }}>
        <div style={{ ...big(176, '#ffffff'), ...stroke(12, '#0a0d14'), letterSpacing: -3 }}>NO</div>
        <div style={{ ...big(132, '#ff2d2d'), ...stroke(10, '#ffffff'), letterSpacing: -2, marginTop: 4 }}>RUNWAY</div>
        <div style={{ marginTop: 18, display: 'inline-block', background: '#ffd400', color: '#111', fontFamily: 'PlexMonoLocal, monospace', fontWeight: 700, fontSize: 34, letterSpacing: 4, padding: '8px 16px' }}>FOR 3 HOURS</div>
      </div>
    </AbsoluteFill>
  );
};

/** F (Test & Compare): painted storm (generated background) + backlit airliner silhouette gliding toward the waves,
 *  burning engine, smoke, distant island lights. Extinct-Zoo-like: image first, very little text. */
export const ThumbF: React.FC = () => {
  const stroke = (w: number, c: string): React.CSSProperties => ({ WebkitTextStroke: `${w}px ${c}`, paintOrder: 'stroke fill' } as any);
  return (
    <AbsoluteFill>
      <Img src={staticFile('thumbs/storm19.png')} style={{ width: W, height: H, objectFit: 'cover', filter: 'contrast(1.12) saturate(1.1)' }} />
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        <defs>
          <radialGradient id="fireF"><stop offset="0%" stopColor="#fff2b0" /><stop offset="35%" stopColor="#ffa02a" /><stop offset="70%" stopColor="#ff3d0a" stopOpacity="0.8" /><stop offset="100%" stopColor="#ff2a00" stopOpacity="0" /></radialGradient>
          <linearGradient id="smokeF" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stopColor="#5b5e66" stopOpacity="0.9" /><stop offset="100%" stopColor="#3a3c42" stopOpacity="0" /></linearGradient>
          <filter id="blurF"><feGaussianBlur stdDeviation="6" /></filter>
          <radialGradient id="islandF"><stop offset="0%" stopColor="#ffcf6a" stopOpacity="0.9" /><stop offset="100%" stopColor="#ffcf6a" stopOpacity="0" /></radialGradient>
        </defs>
        {/* distant runway lights glow */}
        {/* airliner silhouette backlit by the storm, nose down to the left, burning engine + smoke trail */}
        <g transform="translate(330,70) rotate(-11 450 160) scale(0.86)">
          <path d="M560,212 C700,190 900,130 1180,40 L1260,0 L1300,80 C1080,150 860,220 640,250 Z" fill="url(#smokeF)" filter="url(#blurF)" opacity={0.95} />
          <path d="M470,128 L620,124 L700,70 L680,66 Z" fill="#07080c" />
          <path d="M40,170 C55,140 110,128 190,126 L800,122 C840,121 862,112 880,92 L935,30 L968,30 L948,120 C960,128 958,150 940,156 L200,176 C120,180 60,184 40,170 Z" fill="#090b10" />
          <path d="M870,132 L1000,146 L996,160 L880,152 Z" fill="#090b10" />
          <path d="M420,165 L600,170 L840,300 L790,308 Z" fill="#1b2230" />
          <g transform="rotate(10 560 212)"><rect x={488} y={190} width={150} height={46} rx={20} fill="#0a0c11" /><ellipse cx={490} cy={213} rx={10} ry={21} fill="#1a1f29" /></g>
          <path d="M48,166 C62,142 112,131 190,129 L800,125 C840,124 860,115 878,95 L933,33" fill="none" stroke="#dbe9f7" strokeWidth={3.5} opacity={0.85} />
          <path d="M420,165 L600,170 L840,300 L790,308 Z" fill="none" stroke="#dbe9f7" strokeWidth={3} opacity={0.75} />
          {Array.from({ length: 28 }).map((_, i) => <rect key={i} x={230 + i * 21} y={138} width={8} height={8} rx={2} fill="#ffe2a0" opacity={0.8} />)}
          <circle cx={640} cy={232} r={110} fill="url(#fireF)" />
          <circle cx={640} cy={232} r={30} fill="#fff4c0" filter="url(#blurF)" />
        </g>
        {/* rain */}
        {Array.from({ length: 160 }).map((_, i) => { const x = (i * 97) % 1320 - 20, y = (i * 211) % 740 - 20; return <line key={i} x1={x} y1={y} x2={x - 10} y2={y + 34} stroke="#cfd8e0" strokeWidth={1.2} opacity={0.22} />; })}
      </svg>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 55% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%)' }} />
      <div style={{ position: 'absolute', left: 44, bottom: 30 }}>
        <div style={{ ...big(124, '#ffffff'), ...stroke(8, '#05060c'), letterSpacing: -2 }}>NOWHERE</div>
        <div style={{ ...big(100, '#ff3b2f'), ...stroke(7, '#05060c'), fontStyle: 'italic', marginTop: 0 }}>to land</div>
      </div>
    </AbsoluteFill>
  );
};
