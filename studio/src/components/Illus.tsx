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
/** Airliner cabin seen down the aisle (one-point perspective): seats, overhead bins, windows, seatbelt sign. */
export const Cabin: React.FC<{ speak?: number }> = ({ speak = 0 }) => {
  const f = useCurrentFrame();
  const VX = 960, VY = 430;
  const P = (x: number, y: number, k: number) => [VX + (x - VX) * k, VY + (y - VY) * k];
  const poly = (pts: number[][]) => pts.map((q) => q.join(',')).join(' ');
  const ROWS = 7;
  const kOf = (r: number) => 1 / (1 + r * 0.42);
  const seatBlock = (x0: number, x1: number, r: number, key: string) => {
    const k = kOf(r), n = 3, w = (x1 - x0) / n;
    return Array.from({ length: n }).map((_, i) => {
      const xa = x0 + i * w + 8, xb = x0 + (i + 1) * w - 8;
      const [ax, ay] = P(xa, 1080, k), [bx] = P(xb, 1080, k), [, ty] = P(xa, 560, k), [, hy] = P(xa, 625, k);
      const rad = 30 * k;
      return (
        <g key={`${key}${i}`}>
          <path d={`M${ax},${ay} L${ax},${ty + rad} Q${ax},${ty} ${ax + rad},${ty} L${bx - rad},${ty} Q${bx},${ty} ${bx},${ty + rad} L${bx},${ay} Z`} fill={r % 2 ? '#2b4f7e' : '#2e5487'} stroke="#13233a" strokeWidth={Math.max(1.5, 5 * k)} />
          <rect x={ax + 12 * k} y={ty + 8 * k} width={bx - ax - 24 * k} height={hy - ty} rx={10 * k} fill="#f4efe2" />
        </g>
      );
    });
  };
  const win = (side: number, r: number) => {
    const k = kOf(r + 0.5), x = side < 0 ? 40 : 1880, [cx, cy] = P(x, 470, k);
    return <ellipse key={`w${side}${r}`} cx={cx} cy={cy} rx={34 * k} ry={52 * k} fill="#a9cdea" stroke="#8c8370" strokeWidth={Math.max(1, 6 * k)} />;
  };
  const far = kOf(ROWS + 0.4);
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      {/* walls, ceiling, floor */}
      <rect width={1920} height={1080} fill="#ece4d0" />
      <polygon points={poly([[0, 0], [1920, 0], P(1920, 0, far), P(0, 0, far)])} fill="#f6f1e4" />
      <polygon points={poly([[0, 0], P(0, 0, far), P(0, 1080, far), [0, 1080]])} fill="#e3d9c2" />
      <polygon points={poly([[1920, 0], P(1920, 0, far), P(1920, 1080, far), [1920, 1080]])} fill="#e3d9c2" />
      <polygon points={poly([[0, 1080], [1920, 1080], P(1920, 1080, far), P(0, 1080, far)])} fill="#6b6f78" />
      {/* aisle carpet */}
      <polygon points={poly([[800, 1080], [1120, 1080], P(1120, 1080, far), P(800, 1080, far)])} fill="#4a5a7a" />
      {/* back wall: galley curtain + exit sign */}
      {(() => { const [x0, y0] = P(0, 0, far), [x1, y1] = P(1920, 1080, far); return (
        <g>
          <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill="#d8cfb9" stroke="#b3a88f" strokeWidth={3} />
          <rect x={VX - 50} y={VY - 40} width={100} height={130} fill="#8f2f3a" />
          <rect x={VX - 34} y={VY - 70} width={68} height={22} rx={4} fill="#1f8f4e" />
          <text x={VX} y={VY - 53} textAnchor="middle" fontFamily="PlexMonoLocal, monospace" fontSize={15} fill="#fff">EXIT</text>
        </g>
      ); })()}
      {/* windows along both walls */}
      {Array.from({ length: ROWS }).map((_, r) => [win(-1, ROWS - 1 - r), win(1, ROWS - 1 - r)])}
      {/* overhead bins, both sides */}
      {[-1, 1].map((side) => {
        const xo = side < 0 ? 0 : 1920, xi = side < 0 ? 720 : 1200;
        return (
          <g key={side}>
            <polygon points={poly([[xo, 120], [xi, 120], P(xi, 120, far), P(xo, 120, far)])} fill="#fbf8ef" stroke="#b3a88f" strokeWidth={3} />
            <polygon points={poly([[xi, 120], [xi, 330], P(xi, 330, far), P(xi, 120, far)])} fill="#f1ebdc" stroke="#b3a88f" strokeWidth={3} />
            {Array.from({ length: ROWS }).map((_, r) => { const [ax, ay] = P(xi, 330, kOf(r)), [, by] = P(xi, 120, kOf(r)); return <line key={r} x1={ax} y1={ay} x2={ax} y2={by} stroke="#b3a88f" strokeWidth={3 * kOf(r)} />; })}
            {Array.from({ length: ROWS }).map((_, r) => { const [ax, ay] = P(xi, 300, kOf(r + 0.5)); return <rect key={`h${r}`} x={ax - 30 * kOf(r)} y={ay} width={60 * kOf(r)} height={8 * kOf(r)} rx={3} fill="#a79c84" />; })}
          </g>
        );
      })}
      {/* ceiling light strip */}
      <polygon points={poly([[900, 0], [1020, 0], P(1020, 0, far), P(900, 0, far)])} fill="#fffbe9" opacity={0.9} />
      {/* seats: far rows first */}
      {Array.from({ length: ROWS }).map((_, i) => { const r = ROWS - 1 - i; return <g key={r}>{seatBlock(60, 780, r, `L${r}`)}{seatBlock(1140, 1860, r, `R${r}`)}</g>; })}
      {/* fasten seatbelt sign + PA speaker */}
      <g transform="translate(960,70)">
        <rect x={-120} y={-34} width={240} height={68} rx={12} fill="#2d333c" />
        <circle cx={-60} cy={0} r={22} fill={speak > 0 && f % 30 < 20 ? '#ffd27a' : '#6b6f78'} />
        <path d="M-70,-8 Q-60,8 -50,-8" fill="none" stroke="#2d333c" strokeWidth={4} />
        <circle cx={-60} cy={-10} r={5} fill="#2d333c" />
        <text x={0} y={8} fontFamily="PlexMonoLocal, monospace" fontSize={22} fill="#ffd27a">SEATBELT</text>
      </g>
      {[1, 2, 3].map((k) => <path key={k} d={`M${1090 + k * 16},50 Q${1102 + k * 16},70 ${1090 + k * 16},90`} fill="none" stroke={day.dot} strokeWidth={5} opacity={speak > 0 ? 0.4 + 0.6 * Math.abs(Math.sin(f / 4 + k)) : 0} />)}
      <g opacity={speak} transform={`translate(560,${150 - 20 * (1 - speak)})`}>
        <rect width={800} height={160} rx={30} fill="#fffaf0" stroke={INK} strokeWidth={6} />
        <text x={400} y={70} textAnchor="middle" fontFamily={theme.fontSerif} fontStyle="italic" fontSize={44} fill={INK}>“Folks, we've just been told</text>
        <text x={400} y={122} textAnchor="middle" fontFamily={theme.fontSerif} fontStyle="italic" fontSize={44} fill={INK}>to stay on the ground.”</text>
      </g>
      <text x={90} y={1035} fontFamily="PlexMonoLocal, monospace" fontSize={30} fill="#fffaf0" opacity={0.9}>AT THE GATE · BOARDING COMPLETE</text>
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
