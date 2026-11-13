import React from 'react';
import { AbsoluteFill } from 'remotion';
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

/** D (Test & Compare): night ocean, big black plane with a burning red engine, smoke trail, "NOWHERE TO LAND". */
export const ThumbD: React.FC = () => (
  <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 70% 45%, #1d3550 0%, #0c1626 55%, #05080f 100%)' }}>
    <svg width={W} height={H} style={{ position: 'absolute' }}>
      <defs>
        <radialGradient id="fire"><stop offset="0%" stopColor="#ffd27a" /><stop offset="35%" stopColor="#ff5a2a" /><stop offset="100%" stopColor="#ff2a00" stopOpacity="0" /></radialGradient>
        <linearGradient id="smoke" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#8a8f98" stopOpacity="0.75" /><stop offset="100%" stopColor="#8a8f98" stopOpacity="0" /></linearGradient>
      </defs>
      {/* ocean texture */}
      {Array.from({ length: 60 }).map((_, i) => (
        <path key={i} d={`M${(i * 173) % 1400 - 80},${120 + ((i * 97) % 600)} q30,-6 60,0 t60,0`} fill="none" stroke="#4d6f92" strokeWidth={2} opacity={0.18} />
      ))}
      {/* distant runway, far away */}
      <circle cx={120} cy={640} r={150} fill="none" stroke="#e9b44c" strokeWidth={3} strokeDasharray="10 10" opacity={0.55} />
      <circle cx={120} cy={640} r={9} fill="#e0452f" stroke="#fff" strokeWidth={3} />
      <line x1={150} y1={625} x2={700} y2={470} stroke="#e9b44c" strokeWidth={3} strokeDasharray="4 12" opacity={0.7} />
      {/* smoke trail from the dead engine */}
      <path d="M880,500 C960,560 1100,640 1300,720 L1180,720 C1060,660 950,600 875,530 Z" fill="url(#smoke)" />
      <circle cx={889} cy={512} r={75} fill="url(#fire)" opacity={0.9} />
      <PlaneIcon x={900} y={380} size={520} heading={-62} engineOut />
      <circle cx={889} cy={512} r={22} fill="#ffb347" opacity={0.8} style={{ filter: 'blur(4px)' }} />
    </svg>
    <div style={{ position: 'absolute', left: 50, top: 40 }}>
      <div style={{ ...big(150, '#f6efdc'), letterSpacing: -2 }}>NOWHERE</div>
      <div style={{ ...big(118, '#ff4d3d'), fontStyle: 'italic', marginTop: 4 }}>to land</div>
    </div>
  </AbsoluteFill>
);

/** E (Test & Compare): one huge plane over a flat blue ocean, one big red no-runway zone, 2 huge words. */
export const ThumbE: React.FC = () => (
  <AbsoluteFill style={{ background: '#9fc3d6' }}>
    <svg width={W} height={H} style={{ position: 'absolute' }}>
      <defs>
        <pattern id="hatch" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="10" height="22" fill="#e0452f" opacity="0.35" /></pattern>
      </defs>
      <circle cx={940} cy={380} r={300} fill="#e0452f" opacity={0.22} />
      <circle cx={940} cy={380} r={300} fill="url(#hatch)" />
      <circle cx={940} cy={380} r={300} fill="none" stroke="#c23b2b" strokeWidth={10} strokeDasharray="34 18" />
      <PlaneIcon x={940} y={380} size={400} heading={58} />
    </svg>
    <div style={{ position: 'absolute', left: 46, top: 36 }}>
      <div style={{ ...big(170, '#16181d'), textShadow: '0 4px 0 #f3ecd8', letterSpacing: -3 }}>NO</div>
      <div style={{ ...big(124, '#c23b2b'), textShadow: '0 4px 0 #f3ecd8', letterSpacing: -2 }}>RUNWAY</div>
    </div>
  </AbsoluteFill>
);
