import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Globe } from '../../components/Globe';
import { PlaneIcon } from '../../components/Overlays';
import { Paper } from '../../components/Kit';
import { byCode } from '../../data/airports';
import { day, theme } from '../../theme';

const ATL = ['BOS', 'JFK', 'YYT', 'KEF', 'SNN', 'LHR', 'LIS', 'TER', 'BDA', 'MAD'].map((c) => byCode(c)!).filter(Boolean);

/** Avatar A (800×800): paper globe with a few circles, big black plane across it. */
export const AvatarA: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: day.bg }}>
    <Globe width={800} height={800} camera={{ lon: -35, lat: 42, scale: 330 }} day={1}
      dots={ATL.map((a) => ({ airport: a, appear: 1 }))} circles={ATL.map((a) => ({ airport: a, minutes: 120, appear: 1 }))}>
      {() => <PlaneIcon x={400} y={410} size={470} heading={45} />}
    </Globe>
  </AbsoluteFill>
);

/** Avatar B (800×800): just a navy range ring + black plane — reads best at tiny sizes. */
export const AvatarB: React.FC = () => (
  <Paper>
    <svg width={800} height={800}>
      <circle cx={400} cy={400} r={300} fill="rgba(44,85,120,0.16)" stroke={day.circle} strokeWidth={14} />
      <circle cx={400} cy={400} r={300} fill="none" stroke={day.circle} strokeWidth={4} strokeDasharray="2 30" transform="rotate(10 400 400)" opacity={0} />
      <circle cx={590} cy={250} r={26} fill={day.dot} stroke="#fff" strokeWidth={8} />
      <PlaneIcon x={400} y={410} size={440} heading={45} />
    </svg>
  </Paper>
);

/** Banner (2560×1440). Safe area for all devices: centre 1546×423. */
export const Banner: React.FC = () => {
  const W = 2560, H = 1440;
  return (
    <Paper>
      {/* faint range circles across the full width (seen on TV / desktop only) */}
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        {[[260, 520, 300], [560, 900, 260], [2280, 560, 320], [1980, 980, 240], [120, 1050, 220], [2460, 1120, 260]].map(([x, y, r], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={r} fill="rgba(44,85,120,0.07)" stroke={day.circle} strokeOpacity={0.35} strokeWidth={3} />
            <circle cx={x} cy={y} r={10} fill={day.dot} stroke="#fff" strokeWidth={3} />
          </g>
        ))}
        {/* route arcing over the title, airport dots at both ends */}
        <path d="M 560 645 Q 1280 455 2000 645" fill="none" stroke={day.circle} strokeWidth={5} />
        <path d="M 560 645 L 2000 645" fill="none" stroke={day.coral} strokeWidth={3} strokeDasharray="16 14" opacity={0.0} />
        <circle cx={560} cy={645} r={15} fill={day.dot} stroke="#fff" strokeWidth={4} />
        <circle cx={2000} cy={645} r={15} fill={day.dot} stroke="#fff" strokeWidth={4} />
        <PlaneIcon x={1568} y={565} size={96} heading={97} />
      </svg>
      {/* text inside the safe area */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 672, textAlign: 'center' }}>
        <div style={{ fontFamily: theme.fontSerif, fontWeight: 700, fontSize: 132, color: day.text, letterSpacing: -1 }}>
          How flying <span style={{ fontStyle: 'italic', color: day.circle }}>really</span> works
        </div>
        <div style={{ fontFamily: theme.fontMono, fontSize: 34, letterSpacing: 9, color: day.textMuted, marginTop: 26, textTransform: 'uppercase' }}>
          Planes · pilots · routes · the rules of the sky
        </div>
      </div>
    </Paper>
  );
};

/** Same banner with the safe-area guide drawn on top (for checking only). */
export const BannerGuide: React.FC = () => (
  <AbsoluteFill>
    <Banner />
    <div style={{ position: 'absolute', left: (2560 - 1546) / 2, top: (1440 - 423) / 2, width: 1546, height: 423, border: '4px dashed #c23b2b' }} />
    <div style={{ position: 'absolute', left: (2560 - 2560) / 2, top: (1440 - 423) / 2, width: 2560, height: 423, borderTop: '3px dotted #888', borderBottom: '3px dotted #888' }} />
  </AbsoluteFill>
);

/** Video watermark (shown bottom-right of the player; YouTube recommends 150×150, transparent PNG).
 *  Navy disc, cream bell, red "airport dot" as the notification badge. Drawn at 600×600, scaled down. */
export const Watermark: React.FC = () => (
  <svg width={600} height={600} viewBox="0 0 600 600">
    <circle cx={300} cy={300} r={280} fill={day.circle} stroke="#f3ecd8" strokeWidth={20} />
    {/* bell */}
    <path
      d="M300 130 C 230 130 195 185 195 250 L 195 330 C 195 360 175 385 150 405 L 450 405 C 425 385 405 360 405 330 L 405 250 C 405 185 370 130 300 130 Z"
      fill="#f3ecd8"
    />
    <rect x={286} y={105} width={28} height={36} rx={12} fill="#f3ecd8" />
    <path d="M255 430 A 45 45 0 0 0 345 430 Z" fill="#f3ecd8" />
    {/* notification dot */}
    <circle cx={430} cy={165} r={62} fill={day.dot} stroke="#fff" strokeWidth={16} />
  </svg>
);

/** Watermark B: outline bell in the familiar "notifications on" style — white strokes with a soft dark
 *  shadow so it reads on paper and on night scenes. Transparent background. */
export const WatermarkBell: React.FC = () => {
  const stroke = { fill: 'none', stroke: '#ffffff', strokeWidth: 34, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const shapes = (
    <>
      {/* bell body */}
      <path d="M300 150 C 225 150 185 205 185 275 L 185 365 L 140 420 L 460 420 L 415 365 L 415 275 C 415 205 375 150 300 150 Z" {...stroke} />
      {/* top knob */}
      <path d="M300 112 L 300 150" {...stroke} />
      {/* clapper */}
      <path d="M262 465 C 268 492 282 505 300 505 C 318 505 332 492 338 465" {...stroke} />
      {/* ringing waves */}
      <path d="M150 140 C 112 175 92 220 88 270" {...stroke} strokeWidth={30} />
      <path d="M450 140 C 488 175 508 220 512 270" {...stroke} strokeWidth={30} />
    </>
  );
  return (
    <svg width={600} height={600} viewBox="0 0 600 600">
      <defs>
        <filter id="wmShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#000" floodOpacity="0.55" />
        </filter>
      </defs>
      <g filter="url(#wmShadow)">{shapes}</g>
    </svg>
  );
};
