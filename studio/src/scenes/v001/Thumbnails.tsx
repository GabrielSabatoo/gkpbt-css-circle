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
