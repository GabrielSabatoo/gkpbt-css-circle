import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { day, theme } from '../theme';
import { ramp } from '../anim';
import { PlaneIcon } from './Overlays';

/** Hand-drawn style illustrations for video 002. All are SVG <g> groups drawn in a local box; wrap with <Box>. */

const INK = day.text;
const FILL = '#f6efdc';
const SW = 6;
const rr = (k: number) => { const x = Math.sin(k * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

/** Absolutely positioned SVG box. */
export const Box: React.FC<{ x: number; y: number; w: number; h: number; vb?: string; children: React.ReactNode; opacity?: number; style?: React.CSSProperties }> = ({ x, y, w, h, vb, children, opacity = 1, style }) => (
  <svg width={w} height={h} viewBox={vb ?? `0 0 ${w} ${h}`} style={{ position: 'absolute', left: x, top: y, overflow: 'visible', opacity, ...style }}>{children}</svg>
);

/** Pop-in scale helper for groups. */
export const usePop = (delay = 0) => {
  const f = useCurrentFrame();
  const p = ramp(f, delay, delay + 10);
  return { p, t: `scale(${0.6 + 0.4 * p})`, o: p };
};

/* ---------------- facilities ---------------- */
export const Tower: React.FC<{ x?: number; y?: number; s?: number }> = ({ x = 0, y = 0, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M-30,0 L-20,-200 L20,-200 L30,0 Z" fill={FILL} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M-70,-200 L70,-200 L55,-250 L-55,-250 Z" fill={day.circle} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
    {[-40, -14, 12, 38].map((wx) => <rect key={wx} x={wx - 10} y={-244} width={18} height={36} fill="#bcd6ec" stroke={INK} strokeWidth={3} />)}
    <path d="M-60,-250 L60,-250 L40,-272 L-40,-272 Z" fill={FILL} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
    <line x1={0} y1={-272} x2={0} y2={-310} stroke={INK} strokeWidth={5} /><circle cx={0} cy={-312} r={7} fill={day.dot} />
    <line x1={-120} y1={0} x2={120} y2={0} stroke={INK} strokeWidth={SW} strokeLinecap="round" />
  </g>
);

export const RadarDish: React.FC<{ x?: number; y?: number; s?: number; spin?: number }> = ({ x = 0, y = 0, s = 1, spin = 0 }) => {
  const w = 90 * Math.abs(Math.cos(spin));
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <path d="M-40,0 L-14,-120 L14,-120 L40,0 Z" fill={FILL} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M-60,-80 L60,-80" stroke={INK} strokeWidth={4} /><path d="M-50,-40 L50,-40" stroke={INK} strokeWidth={4} />
      <ellipse cx={0} cy={-160} rx={Math.max(10, w)} ry={46} fill={day.circle} stroke={INK} strokeWidth={SW} />
      <line x1={0} y1={-160} x2={0} y2={-120} stroke={INK} strokeWidth={SW} />
      <line x1={-150} y1={0} x2={150} y2={0} stroke={INK} strokeWidth={SW} strokeLinecap="round" />
    </g>
  );
};

/** Big windowless control centre building with antennas. */
export const CentreBuilding: React.FC<{ x?: number; y?: number; s?: number; dark?: number }> = ({ x = 0, y = 0, s = 1, dark = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-170} y={-150} width={340} height={150} fill={FILL} stroke={INK} strokeWidth={SW} />
    <rect x={-120} y={-200} width={170} height={50} fill={FILL} stroke={INK} strokeWidth={SW} />
    {[-140, -80, -20, 40, 100].map((bx) => <rect key={bx} x={bx} y={-110} width={40} height={14} fill={dark > 0.5 ? '#333' : '#bcd6ec'} stroke={INK} strokeWidth={3} />)}
    <line x1={110} y1={-150} x2={110} y2={-240} stroke={INK} strokeWidth={5} /><path d="M90,-230 L130,-230 M95,-215 L125,-215" stroke={INK} strokeWidth={4} />
    <rect x={-30} y={-60} width={60} height={60} fill={day.circle} stroke={INK} strokeWidth={SW} />
    <line x1={-260} y1={0} x2={260} y2={0} stroke={INK} strokeWidth={SW} strokeLinecap="round" />
  </g>
);

/* ---------------- cabin at the gate ---------------- */
export const Cabin: React.FC<{ speak?: number }> = ({ speak = 0 }) => {
  const f = useCurrentFrame();
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      <rect width={1920} height={1080} fill="#1b2433" />
      {/* ceiling + bins */}
      <path d="M0,0 L1920,0 L1920,250 C1500,330 420,330 0,250 Z" fill="#e9e1cc" />
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M${120 + i * 430},215 L${500 + i * 430},215 L${520 + i * 430},300 L${100 + i * 430},300 Z`} fill="#f4eedd" stroke={INK} strokeWidth={4} />)}
      {[0, 1, 2, 3].map((i) => <rect key={i} x={270 + i * 430} y={260} width={80} height={12} rx={6} fill="#b9b09a" />)}
      {/* window with the terminal outside */}
      <g transform="translate(1660,520)">
        <ellipse rx={120} ry={170} fill="#cfe2f1" stroke={INK} strokeWidth={10} />
        <clipPath id="win"><ellipse rx={110} ry={160} /></clipPath>
        <g clipPath="url(#win)">
          <rect x={-120} y={20} width={240} height={160} fill="#9aa3ad" />
          <rect x={-120} y={-60} width={240} height={80} fill="#d8c9a6" />
          {[-90, -40, 10, 60].map((wx) => <rect key={wx} x={wx} y={-40} width={36} height={40} fill="#6e8bab" />)}
          <rect x={-120} y={10} width={150} height={40} fill="#c9c2b2" stroke={INK} strokeWidth={3} />
        </g>
      </g>
      {/* seat backs in rows */}
      {[0, 1, 2].map((row) => {
        const sc = 1 - row * 0.22, y = 1080 - row * 190, w = 300 * sc;
        return [-1, 0, 1].map((c) => {
          const cx = 760 + c * (w + 30) * 1.05 + (c > 0 ? 120 * sc : c < 0 ? -120 * sc : 0) - 200;
          return (
            <g key={`${row}${c}`}>
              <path d={`M${cx - w / 2},${y} L${cx - w / 2 + 20 * sc},${y - 420 * sc} Q${cx},${y - 470 * sc} ${cx + w / 2 - 20 * sc},${y - 420 * sc} L${cx + w / 2},${y} Z`} fill={row === 0 ? '#2f4a6e' : row === 1 ? '#355377' : '#3b5b82'} stroke="#0f1724" strokeWidth={5} />
              <rect x={cx - w / 3} y={y - 430 * sc} width={(w * 2) / 3} height={60 * sc} rx={14 * sc} fill="#e9e1cc" />
            </g>
          );
        });
      })}
      {/* PA speaker + speech bubble */}
      <g transform="translate(960,150)">
        <circle r={34} fill="#d8cfb8" stroke={INK} strokeWidth={4} />
        {[-14, 0, 14].map((d) => <line key={d} x1={-20} y1={d} x2={20} y2={d} stroke={INK} strokeWidth={3} />)}
        {[1, 2, 3].map((k) => <path key={k} d={`M${40 + k * 16},-20 Q${52 + k * 16},0 ${40 + k * 16},20`} fill="none" stroke={day.dot} strokeWidth={4} opacity={speak > 0 ? 0.4 + 0.6 * Math.abs(Math.sin(f / 4 + k)) : 0} />)}
      </g>
      <g opacity={speak} transform={`translate(560,${380 - 20 * (1 - speak)})`}>
        <rect width={800} height={160} rx={30} fill="#fffaf0" stroke={INK} strokeWidth={6} />
        <path d="M380,0 L400,-40 L430,0 Z" fill="#fffaf0" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <rect x={383} y={-3} width={44} height={8} fill="#fffaf0" />
        <text x={400} y={70} textAnchor="middle" fontFamily={theme.fontSerif} fontStyle="italic" fontSize={44} fill={INK}>“Folks, we've just been told</text>
        <text x={400} y={122} textAnchor="middle" fontFamily={theme.fontSerif} fontStyle="italic" fontSize={44} fill={INK}>to stay on the ground.”</text>
      </g>
    </svg>
  );
};

/* ---------------- cables, diggers, fire ---------------- */
export const BurntWire: React.FC<{ burn: number }> = ({ burn }) => {
  const f = useCurrentFrame();
  return (
    <g>
      {/* insulation */}
      <rect x={-600} y={-60} width={1200} height={120} rx={60} fill="#3a3f47" stroke={INK} strokeWidth={SW} />
      {/* copper strands visible at the cut */}
      {Array.from({ length: 9 }).map((_, i) => (
        <path key={i} d={`M${-120 + i * 4},${-40 + i * 10} C${-40},${-60 + i * 14} ${40},${-20 + i * 6} ${120 - i * 3},${-44 + i * 11}`} stroke="#c97a3a" strokeWidth={9} fill="none" strokeLinecap="round" />
      ))}
      <rect x={-140} y={-66} width={280} height={132} fill="none" />
      {/* burn mark */}
      <ellipse cx={0} cy={0} rx={150 * burn} ry={90 * burn} fill="#1a1410" opacity={0.85} />
      {Array.from({ length: 6 }).map((_, i) => {
        const t = ((f / 30 + i * 0.5) % 3) / 3;
        return <circle key={i} cx={-30 + i * 14 + Math.sin(f / 10 + i) * 20} cy={-80 - t * 260} r={20 + t * 50} fill="#7d7a76" opacity={burn * (1 - t) * 0.55} />;
      })}
      {Array.from({ length: 5 }).map((_, i) => <circle key={i} cx={-60 + rr(i + Math.floor(f / 3)) * 120} cy={-20 + rr(i + 9 + Math.floor(f / 3)) * 40} r={4} fill="#ffb547" opacity={burn} />)}
    </g>
  );
};

export const Excavator: React.FC<{ dig: number; x?: number; y?: number; s?: number }> = ({ dig, x = 0, y = 0, s = 1 }) => {
  const a1 = -35 + 50 * dig, a2 = 40 + 40 * dig;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <rect x={-160} y={-40} width={240} height={40} rx={20} fill="#555" stroke={INK} strokeWidth={SW} />
      {[-130, -80, -30, 20, 60].map((wx) => <circle key={wx} cx={wx} cy={-20} r={13} fill="#999" stroke={INK} strokeWidth={3} />)}
      <rect x={-150} y={-130} width={180} height={90} rx={10} fill="#f2c14e" stroke={INK} strokeWidth={SW} />
      <rect x={-130} y={-180} width={90} height={60} fill="#bcd6ec" stroke={INK} strokeWidth={SW} />
      <g transform={`translate(30,-110) rotate(${a1})`}>
        <rect x={0} y={-16} width={220} height={32} rx={10} fill="#f2c14e" stroke={INK} strokeWidth={SW} />
        <g transform={`translate(215,0) rotate(${a2})`}>
          <rect x={0} y={-12} width={170} height={24} rx={8} fill="#f2c14e" stroke={INK} strokeWidth={SW} />
          <path d="M165,-30 L215,-10 L205,40 L160,25 Z" fill="#666" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
        </g>
      </g>
    </g>
  );
};

/** Ground cross-section with buried cables; `cut` 0..1 snaps them with a spark. */
export const Underground: React.FC<{ cut: number; cables?: number; color?: string; w?: number; sparkAt?: number }> = ({ cut, cables = 2, color = '#e8742a', w = 1500, sparkAt = 0 }) => {
  const f = useCurrentFrame();
  const gap = 40 * cut;
  return (
    <g>
      <rect x={-w / 2} y={0} width={w} height={300} fill="#b89a6a" stroke={INK} strokeWidth={4} />
      {Array.from({ length: 40 }).map((_, i) => <circle key={i} cx={-w / 2 + rr(i) * w} cy={20 + rr(i + 3) * 260} r={3 + rr(i + 7) * 5} fill="#9c7f52" />)}
      <rect x={-w / 2} y={-14} width={w} height={14} fill="#6f9a52" />
      {Array.from({ length: cables }).map((_, i) => {
        const cy = 110 + i * 70;
        return (
          <g key={i}>
            <line x1={-w / 2} y1={cy} x2={sparkAt - gap} y2={cy} stroke={color} strokeWidth={22} strokeLinecap="round" />
            <line x1={sparkAt + gap} y1={cy} x2={w / 2} y2={cy} stroke={color} strokeWidth={22} strokeLinecap="round" />
            {cut > 0 && cut < 1.5 ? Array.from({ length: 8 }).map((_, k) => {
              const a = rr(k + i * 9 + Math.floor(f / 2)) * Math.PI * 2, r = 20 + rr(k + 3 + Math.floor(f / 2)) * 50;
              return <line key={k} x1={sparkAt} y1={cy} x2={sparkAt + Math.cos(a) * r} y2={cy + Math.sin(a) * r} stroke="#ffd27a" strokeWidth={4} strokeLinecap="round" opacity={cut} />;
            }) : null}
          </g>
        );
      })}
      <path d={`M${sparkAt - 90},0 L${sparkAt - 50},${80 + 160 * cut} L${sparkAt + 50},${80 + 160 * cut} L${sparkAt + 90},0 Z`} fill="#7a5f3a" opacity={0.6 * Math.min(1, cut * 2)} />
    </g>
  );
};

export const Flames: React.FC<{ x: number; y: number; s?: number; on: number }> = ({ x, y, s = 1, on }) => {
  const f = useCurrentFrame();
  return (
    <g transform={`translate(${x},${y}) scale(${s * on})`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const h = 90 + 40 * Math.sin(f / 3 + i * 1.7), bx = -80 + i * 40;
        return <path key={i} d={`M${bx - 30},0 Q${bx - 30},${-h * 0.6} ${bx},${-h} Q${bx + 30},${-h * 0.6} ${bx + 30},0 Z`} fill={i % 2 ? '#ff8a2a' : '#e2452a'} opacity={0.9} />;
      })}
      {[0, 1, 2].map((i) => { const h = 50 + 20 * Math.sin(f / 2 + i); return <path key={`y${i}`} d={`M${-40 + i * 40 - 16},0 Q${-40 + i * 40},${-h} ${-40 + i * 40 + 16},0 Z`} fill="#ffd27a" />; })}
    </g>
  );
};

/** Cross-section of a control centre with a basement fire cutting the cables. */
export const BuildingFire: React.FC<{ fire: number; dark: number }> = ({ fire, dark }) => (
  <g>
    <rect x={-300} y={-300} width={600} height={300} fill={dark > 0.5 ? '#3d4048' : FILL} stroke={INK} strokeWidth={SW} />
    {[-240, -120, 0, 120].map((bx) => <rect key={bx} x={bx} y={-250} width={90} height={60} fill={dark > 0.5 ? '#22252b' : '#bcd6ec'} stroke={INK} strokeWidth={3} />)}
    {[-240, -120, 0, 120].map((bx) => <rect key={`d${bx}`} x={bx + 10} y={-120} width={70} height={40} fill={dark > 0.5 ? '#22252b' : '#7cc49a'} stroke={INK} strokeWidth={3} />)}
    <text x={0} y={-150} textAnchor="middle" fontFamily="PlexMonoLocal, monospace" fontSize={26} fill={dark > 0.5 ? '#9a9a9a' : INK}>CONTROL ROOM</text>
    <rect x={-300} y={0} width={600} height={160} fill="#8a7a62" stroke={INK} strokeWidth={SW} />
    <text x={-280} y={40} fontFamily="PlexMonoLocal, monospace" fontSize={22} fill="#f3ecd8">BASEMENT · CABLES</text>
    {[70, 95, 120].map((cy) => <line key={cy} x1={-300} y1={cy} x2={300} y2={cy} stroke={fire > 0.5 ? '#222' : '#c97a3a'} strokeWidth={10} />)}
    <Flames x={40} y={150} s={0.9} on={fire} />
    <line x1={-420} y1={0} x2={420} y2={0} stroke={INK} strokeWidth={SW} />
  </g>
);

/* ---------------- computers ---------------- */
export const Server: React.FC<{ x?: number; y?: number; s?: number; err?: number }> = ({ x = 0, y = 0, s = 1, err = 0 }) => {
  const f = useCurrentFrame();
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <rect x={-110} y={-300} width={220} height={300} rx={12} fill="#2d333c" stroke={INK} strokeWidth={SW} />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <rect x={-90} y={-280 + i * 56} width={180} height={42} rx={6} fill="#3d4450" />
          {[0, 1, 2].map((k) => <circle key={k} cx={50 + k * 16} cy={-259 + i * 56} r={5} fill={err > 0.5 ? ((f + i * 3 + k * 5) % 12 < 6 ? '#ff3b2f' : '#541512') : (f + i * 4 + k * 7) % 16 < 8 ? '#5dff9e' : '#1d4a37'} />)}
          <rect x={-76} y={-266 + i * 56} width={90} height={12} rx={3} fill="#22272e" />
        </g>
      ))}
    </g>
  );
};

export const FileIcon: React.FC<{ x: number; y: number; s?: number; rot?: number; label?: string }> = ({ x, y, s = 1, rot = 0, label = 'NOTAM' }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <path d="M-40,-50 L20,-50 L40,-30 L40,50 L-40,50 Z" fill="#fffaf0" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <path d="M20,-50 L20,-30 L40,-30" fill="none" stroke={INK} strokeWidth={4} />
    {[-14, 2, 18, 34].map((ly) => <line key={ly} x1={-26} y1={ly} x2={26} y2={ly} stroke="#9aa3ad" strokeWidth={4} />)}
    <text x={-26} y={-26} fontFamily="PlexMonoLocal, monospace" fontSize={14} fill={day.dot}>{label}</text>
  </g>
);

export const Trash: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M-70,-120 L70,-120 L55,0 L-55,0 Z" fill="#9aa3ad" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
    <rect x={-85} y={-140} width={170} height={20} rx={6} fill="#b8c0c8" stroke={INK} strokeWidth={SW} />
    {[-30, 0, 30].map((lx) => <line key={lx} x1={lx} y1={-100} x2={lx * 0.85} y2={-20} stroke={INK} strokeWidth={4} />)}
  </g>
);

export const NetRack: React.FC<{ x?: number; y?: number; s?: number; overload: number }> = ({ x = 0, y = 0, s = 1, overload }) => {
  const f = useCurrentFrame();
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <rect x={-120} y={-180} width={240} height={180} rx={10} fill="#2d333c" stroke={INK} strokeWidth={SW} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={-104} y={-164 + i * 54} width={208} height={40} rx={5} fill="#3d4450" />
          {Array.from({ length: 8 }).map((_, k) => <rect key={k} x={-92 + k * 24} y={-152 + i * 54} width={14} height={14} fill="#15181d" stroke={(f + k * 3 + i * 7) % 10 < 5 ? (overload > 0.5 ? '#ff3b2f' : '#5dff9e') : '#333'} strokeWidth={3} />)}
        </g>
      ))}
      {/* data packets piling up */}
      {Array.from({ length: Math.round(18 * overload) }).map((_, i) => (
        <rect key={i} x={-130 + (i % 6) * 44 + rr(i) * 8} y={-200 - Math.floor(i / 6) * 34 - rr(i + 4) * 6} width={36} height={26} rx={4} fill={i % 3 ? '#f2c14e' : '#e2654f'} stroke={INK} strokeWidth={3} />
      ))}
    </g>
  );
};

export const Reboot: React.FC<{ x?: number; y?: number; s?: number }> = ({ x = 0, y = 0, s = 1 }) => {
  const f = useCurrentFrame();
  return (
    <g transform={`translate(${x},${y}) scale(${s}) rotate(${f * 8})`}>
      <path d="M0,-70 A70,70 0 1,1 -60,-36" fill="none" stroke={day.circle} strokeWidth={16} strokeLinecap="round" />
      <path d="M-80,-60 L-56,-24 L-28,-58 Z" fill={day.circle} />
    </g>
  );
};

export const Shield: React.FC<{ x?: number; y?: number; s?: number }> = ({ x = 0, y = 0, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M0,-90 L75,-62 L70,10 C64,52 34,78 0,95 C-34,78 -64,52 -70,10 L-75,-62 Z" fill="#7cc49a" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M-32,4 L-8,28 L36,-22" fill="none" stroke="#fff" strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

export const RadioMast: React.FC<{ x?: number; y?: number; s?: number }> = ({ x = 0, y = 0, s = 1 }) => {
  const f = useCurrentFrame();
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <path d="M-40,0 L0,-200 L40,0" fill="none" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      {[-150, -100, -50].map((ly) => <line key={ly} x1={(ly / -200) * -40} y1={ly} x2={(ly / -200) * 40} y2={ly} stroke={INK} strokeWidth={4} />)}
      <path d="M-40,0 L20,-100 M40,0 L-20,-100" stroke={INK} strokeWidth={3} />
      {[1, 2, 3].map((k) => <path key={k} d={`M${18 + k * 16},${-230} Q${30 + k * 16},${-200} ${18 + k * 16},${-170}`} fill="none" stroke={day.dot} strokeWidth={5} opacity={0.4 + 0.6 * Math.abs(Math.sin(f / 5 + k))} />)}
      {[1, 2, 3].map((k) => <path key={`l${k}`} d={`M${-18 - k * 16},${-230} Q${-30 - k * 16},${-200} ${-18 - k * 16},${-170}`} fill="none" stroke={day.dot} strokeWidth={5} opacity={0.4 + 0.6 * Math.abs(Math.sin(f / 5 + k))} />)}
    </g>
  );
};

export const NetNode: React.FC<{ x?: number; y?: number; s?: number }> = ({ x = 0, y = 0, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    {[[-90, -60], [90, -60], [-90, 60], [90, 60], [0, -100]].map(([a, b], i) => <line key={i} x1={0} y1={0} x2={a} y2={b} stroke={day.gold} strokeWidth={8} />)}
    {[[-90, -60], [90, -60], [-90, 60], [90, 60], [0, -100]].map(([a, b], i) => <circle key={`c${i}`} cx={a} cy={b} r={20} fill={FILL} stroke={INK} strokeWidth={5} />)}
    <circle r={36} fill={day.circle} stroke={INK} strokeWidth={6} />
  </g>
);

/** Person silhouette (generic, not a portrait). */
export const Person: React.FC<{ x: number; y: number; s?: number; color?: string; arm?: number }> = ({ x, y, s = 1, color = '#1d2330', arm = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} fill={color}>
    <circle cx={0} cy={-170} r={26} />
    <path d="M-34,-140 L34,-140 L40,-40 L22,-40 L18,0 L-18,0 L-22,-40 L-40,-40 Z" />
    <path d={`M30,-132 L${70 + 30 * arm},${-110 - 70 * arm}`} stroke={color} strokeWidth={18} strokeLinecap="round" />
  </g>
);

/** FAA-style command room: wall of screens and desks; screen shows the US with dots. */
export const CommandRoom: React.FC<{ alarm?: number }> = ({ alarm = 0 }) => {
  const f = useCurrentFrame();
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      <rect width={1920} height={1080} fill="#121a26" />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${260 + i * 480},120)`}>
          <rect width={440} height={300} rx={8} fill="#0b2a3a" stroke="#4d6a86" strokeWidth={6} />
          {Array.from({ length: 22 }).map((_, k) => <circle key={k} cx={30 + rr(k + i * 30) * 380} cy={30 + rr(k + i * 30 + 5) * 240} r={5} fill={alarm > 0.5 && (f + k) % 10 < 5 ? '#ff3b2f' : '#f2c14e'} />)}
        </g>
      ))}
      <rect x={0} y={680} width={1920} height={400} fill="#1d2735" />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={140 + i * 430} y={640} width={380} height={60} rx={8} fill="#2a3646" stroke="#4d6a86" strokeWidth={4} />)}
      {[0, 1, 2, 3].map((i) => <rect key={`m${i}`} x={200 + i * 430} y={580} width={110} height={60} rx={4} fill="#0b2a3a" stroke="#4d6a86" strokeWidth={4} />)}
      <Person x={960} y={640} s={2.1} color="#05080d" arm={alarm} />
      <Person x={420} y={680} s={1.5} color="#0a0f17" />
      <Person x={1500} y={680} s={1.5} color="#0a0f17" />
    </svg>
  );
};

/** Top-view runway with parked airliners filling it. */
export const ParkedRunway: React.FC<{ n: number }> = ({ n }) => (
  <g>
    <rect x={-60} y={-420} width={120} height={840} fill="#5d6168" stroke={INK} strokeWidth={5} />
    {Array.from({ length: 12 }).map((_, i) => <rect key={i} x={-5} y={-400 + i * 70} width={10} height={36} fill="#f3ecd8" />)}
    <rect x={-260} y={-420} width={140} height={840} fill="#6d7178" stroke={INK} strokeWidth={4} />
    <rect x={120} y={-420} width={140} height={840} fill="#6d7178" stroke={INK} strokeWidth={4} />
    {Array.from({ length: Math.min(n, 38) }).map((_, i) => {
      const side = i % 2 ? 190 : -190, row = Math.floor(i / 2);
      return <PlaneIcon key={i} x={side + (i % 4 < 2 ? -20 : 20)} y={-390 + row * 44} size={58} heading={side > 0 ? -90 : 90} color="#f6efdc" outline="#1d2330" />;
    })}
  </g>
);
