import React from 'react';
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, Easing } from 'remotion';
import { geoMercator, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import countries from 'world-atlas/countries-110m.json';
import { bodyFont, displayFont, monoFont } from '../../fonts';

/** FerasIncríveis style test (~35 s): night, Pantanal, jaguar. Our own look: deep green night, warm flashlight,
 *  flat ochre jaguar, gold accent word, small human for scale, Brazil map inset, bar chart. */

const FPS = 30;
const C = {
  night0: '#06110d', night1: '#0d2119', far: '#0f2a20', mid: '#0a1f17', near: '#061510',
  moon: '#d9eee4', water: '#0b2430', beam: '#ffe9b0', gold: '#e9b44c', text: '#eef3ea', muted: '#8fb3a3',
  fur: '#d6993b', furShade: '#b47827', belly: '#efd7a6', spot: '#2a190c',
};
const s = (t: number) => Math.round(t * FPS);
const ease = Easing.bezier(0.33, 0, 0.2, 1);
const ramp = (f: number, a: number, b: number) => interpolate(f, [s(a), s(b)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });

// timings from the narration (marks.json)
const T = { snap: 7.2, torch: 9.43, eyes: 12.3, reveal: 14.85, knows: 17.05, size: 21.05, bite: 27.15, end: 33.6, total: 35 };

/* ---------- reusable drawings ---------- */
const rnd = (k: number) => { const x = Math.sin(k * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

/* Realistic stalking jaguar (side view, facing right): shoulders high, head low, lit by a torch from the left. */
const BODY = 'M232,214 C250,188 300,178 360,190 C420,202 520,206 590,180 C625,166 665,162 700,180 C735,198 760,218 790,224 C815,214 850,216 872,232 C890,244 904,258 912,272 C914,282 906,292 896,296 C892,306 878,314 860,314 C835,316 812,308 796,300 C780,318 762,330 752,346 C748,380 762,420 772,450 C778,462 794,468 806,470 L742,472 C732,446 722,410 714,384 C706,392 700,420 698,450 C696,462 708,468 718,470 L656,472 C652,440 650,400 646,366 C620,372 560,372 500,364 C450,358 410,362 380,368 C374,400 368,430 376,455 C380,466 394,470 406,471 L340,472 C326,446 318,410 310,384 C292,400 286,430 290,455 C292,465 302,470 312,471 L254,472 C246,440 242,400 242,360 C232,320 222,270 232,214 Z';
type Spot = { x: number; y: number; r: number; rot: number; n: number; ring: boolean };
const spots: Spot[] = [];
{
  let k = 0;
  for (let y = 175; y < 470; y += 22) for (let x = 230; x < 830; x += 26) {
    const jx = (rnd(k) - 0.5) * 16, jy = (rnd(k + 9) - 0.5) * 12; const yy = y + jy;
    const onLeg = yy > 365, onNeck = x > 700;
    const r = onLeg ? 3 + rnd(k + 3) * 3 : onNeck ? 6 + rnd(k + 3) * 4 : 8 + rnd(k + 3) * 6;
    spots.push({ x: x + jx + ((y / 22) % 2) * 13, y: yy, r, rot: rnd(k + 5) * 360, n: 4 + Math.round(rnd(k + 7) * 2), ring: !onLeg && !onNeck ? true : rnd(k + 2) > 0.7 });
    k++;
  }
}
const SpotMark: React.FC<Spot> = ({ x, y, r, rot, n, ring }) => ring ? (
  <g transform={`translate(${x},${y}) rotate(${rot})`}>
    <ellipse rx={r * 0.7} ry={r * 0.55} fill="#8a5418" opacity={0.6} />
    {Array.from({ length: n }).map((_, i) => {
      const a = (i / n) * 2 * Math.PI + rnd(x * 3 + i) * 0.6; const cx = Math.cos(a) * r, cy = Math.sin(a) * r * 0.78;
      return <ellipse key={i} cx={cx} cy={cy} rx={r * (0.3 + rnd(y + i) * 0.2)} ry={r * 0.17} transform={`rotate(${(a * 180) / Math.PI + 90} ${cx} ${cy})`} fill="#150c05" />;
    })}
    {rnd(x + y) > 0.45 ? <circle r={r * 0.18} fill="#150c05" /> : null}
  </g>
) : <ellipse cx={x} cy={y} rx={r} ry={r * 0.8} transform={`rotate(${rot} ${x} ${y})`} fill="#150c05" />;

export const Jaguar: React.FC<{ eyeGlow?: number; headTurn?: number }> = ({ eyeGlow = 0, headTurn = 0 }) => {
  const snarl = headTurn; // lips pull back as it "knows where you are"
  return (
    <svg viewBox="140 140 800 345" width="100%" height="100%" style={{ overflow: 'visible' }}>
      <defs>
        <clipPath id="jb"><path d={BODY} /></clipPath>
        <linearGradient id="jfur" x1="0" y1="0" x2="1" y2="0.35">
          <stop offset="0%" stopColor="#5a3a14" /><stop offset="45%" stopColor="#a8702a" /><stop offset="78%" stopColor="#d29a45" /><stop offset="100%" stopColor="#b9802f" />
        </linearGradient>
        <linearGradient id="jbelly" x1="0" y1="0" x2="0" y2="1"><stop offset="55%" stopColor="#e8cf9c" stopOpacity="0" /><stop offset="80%" stopColor="#e2c48c" stopOpacity="0.75" /><stop offset="100%" stopColor="#c9a468" stopOpacity="0.9" /></linearGradient>
        <radialGradient id="jlit" cx="0.78" cy="0.3" r="0.55"><stop offset="0%" stopColor="#fff0c8" stopOpacity="0.38" /><stop offset="100%" stopColor="#fff0c8" stopOpacity="0" /></radialGradient>
        <linearGradient id="jshadow" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#000" stopOpacity="0" /><stop offset="70%" stopColor="#000" stopOpacity="0.25" /><stop offset="100%" stopColor="#000" stopOpacity="0.75" /></linearGradient>
        <linearGradient id="jrear" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#000" stopOpacity="0.7" /><stop offset="45%" stopColor="#000" stopOpacity="0" /></linearGradient>
      </defs>
      {/* tail (in shadow) */}
      <path d="M236,216 C190,236 160,284 160,334 C160,372 176,398 198,404" fill="none" stroke="#4d3110" strokeWidth={26} strokeLinecap="round" />
      {[[178, 262], [163, 300], [162, 338], [172, 372], [190, 398]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={9} ry={6} fill="#140b04" />)}
      {/* body */}
      <path d={BODY} fill="url(#jfur)" />
      <g clipPath="url(#jb)">
        <rect x={140} y={140} width={820} height={345} fill="url(#jbelly)" />
        {spots.map((sp, i) => <SpotMark key={i} {...sp} />)}
        {/* muscle shading: shoulder blade, elbow, haunch */}
        <path d="M640,175 C680,230 690,290 670,350" fill="none" stroke="#2a1806" strokeWidth={14} opacity={0.28} />
        <path d="M700,190 C740,230 750,290 735,345" fill="none" stroke="#fff0c8" strokeWidth={6} opacity={0.18} />
        <path d="M250,230 C320,240 345,300 330,372" fill="none" stroke="#2a1806" strokeWidth={14} opacity={0.3} />
        <path d="M600,340 C640,352 660,352 690,340" fill="none" stroke="#2a1806" strokeWidth={10} opacity={0.25} />
        <rect x={140} y={140} width={820} height={345} fill="url(#jlit)" />
        <rect x={140} y={140} width={820} height={345} fill="url(#jshadow)" />
        <rect x={140} y={140} width={820} height={345} fill="url(#jrear)" />
      </g>
      {/* rim light from the torch along the back and head */}
      <path d="M590,180 C625,166 665,162 700,180 C735,198 760,218 786,222" fill="none" stroke="#ffe7b0" strokeWidth={3} opacity={0.5} />
      {/* ear (black back with pale spot) */}
      <path d="M806,214 C804,190 822,180 840,188 C848,198 846,212 838,220 Z" fill="#1b1007" />
      <ellipse cx={826} cy={200} rx={5} ry={4} fill="#d8c08f" opacity={0.8} />
      {/* face — drawn inside the head, clipped to it */}
      <g clipPath="url(#jb)">
        <path d="M884,262 C904,262 922,270 928,282 C928,296 914,306 900,310 C888,318 872,324 860,324 C866,312 874,298 884,290 Z" fill="#ead7ab" opacity={0.92} />
        <path d="M842,238 C856,230 880,236 892,252 C880,252 862,250 842,238 Z" fill="#1a0f06" opacity={0.25} />
        {[[826, 226], [838, 214], [852, 212], [818, 246], [834, 262], [850, 276], [812, 272], [826, 290], [842, 300], [866, 214], [806, 254]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={2.4 + (i % 3) * 1.1} fill="#150c05" />)}
        <path d="M800,300 C820,312 840,318 858,322" fill="none" stroke="#2a1806" strokeWidth={8} opacity={0.3} />
      </g>
      <path d="M914,268 C922,266 930,272 930,280 C926,286 918,288 912,284 C908,278 908,272 914,268 Z" fill="#2d1a10" />
      <path d={`M916,290 C912,${296 + 2 * snarl} 904,${302 + 3 * snarl} 892,${304 + 3 * snarl} C882,${306 + 2 * snarl} 872,${306 - snarl} 862,${302 - 3 * snarl}`} fill="none" stroke="#120a05" strokeWidth={3.2} strokeLinecap="round" />
      <path d="M916,288 L918,292" stroke="#120a05" strokeWidth={2.5} />
      <g opacity={snarl}>
        <path d={`M900,${302 + 3 * snarl} L903,${314 + 3 * snarl} L906,${301 + 3 * snarl} Z`} fill="#f4ecdc" />
        <path d={`M884,${305 + 2 * snarl} L886,${314 + 2 * snarl} L889,${305 + 2 * snarl} Z`} fill="#f4ecdc" />
      </g>
      {[[902, 294], [908, 290], [896, 297]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={1.6} fill="#120a05" />)}
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M904,${292 + i * 2.5} C926,${290 + i * 5} 948,${294 + i * 8} 966,${300 + i * 11}`} fill="none" stroke="#f4ead2" strokeWidth={1} opacity={0.55} />)}
      {/* heavy brow + eye */}
      <path d="M856,236 C866,228 882,228 892,238" fill="none" stroke="#1a0f06" strokeWidth={4.5} strokeLinecap="round" />
      <path d="M860,246 C866,238 882,237 890,245 C882,251 868,252 860,246 Z" fill={eyeGlow > 0 ? '#ffdc6a' : '#9a8a2a'} />
      <ellipse cx={876} cy={245} rx={2.2} ry={4.6} fill="#0b0703" />
      {eyeGlow > 0 ? <circle cx={875} cy={245} r={22} fill="#ffd56a" opacity={0.5 * eyeGlow} style={{ filter: 'blur(7px)' }} /> : null}
      <path d="M890,246 C898,256 904,264 908,272" fill="none" stroke="#1a0f06" strokeWidth={2.2} opacity={0.7} />
    </svg>
  );
};

const Person: React.FC<{ h: number; color?: string; torch?: boolean }> = ({ h, color = '#020806', torch }) => (
  <svg width={h * 0.42} height={h} viewBox="0 0 42 100" style={{ overflow: 'visible' }}>
    <circle cx={21} cy={9} r={8} fill={color} />
    <path d="M10,20 Q21,16 32,20 L35,55 L29,56 L28,98 L22,98 L21,62 L20,98 L14,98 L13,56 L7,55 Z" fill={color} />
    {torch ? <rect x={33} y={36} width={10} height={4} rx={1.5} fill="#7d6a3a" /> : null}
  </svg>
);

const Particles: React.FC<{ f: number; n?: number; color?: string }> = ({ f, n = 40, color = '#cfe9a0' }) => (
  <svg width={1920} height={1080} style={{ position: 'absolute' }}>
    {Array.from({ length: n }).map((_, i) => {
      const x = (i * 467) % 1920, y = 200 + ((i * 263) % 700);
      const dx = 18 * Math.sin(f / 50 + i), dy = 12 * Math.cos(f / 63 + i * 1.7);
      const a = 0.25 + 0.75 * Math.max(0, Math.sin(f / 22 + i * 2.3));
      return <circle key={i} cx={x + dx} cy={y + dy} r={2.2} fill={color} opacity={0.55 * a} style={{ filter: 'blur(1px)' }} />;
    })}
  </svg>
);

const Label: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; o?: number }> = ({ children, style, o = 1 }) => (
  <div style={{ position: 'absolute', fontFamily: monoFont, fontSize: 26, letterSpacing: 6, color: C.muted, textTransform: 'uppercase', opacity: o, ...style }}>{children}</div>
);

/* ---------- scenes ---------- */
// S1 — [FOOTAGE stand-in] calm river at night with moon reflection (to be replaced by a stock clip)
const NightWater: React.FC<{ f: number }> = ({ f }) => {
  const push = 1 + 0.06 * (f / s(T.snap));
  return (
    <AbsoluteFill style={{ background: `linear-gradient(${C.night0}, #0a1c24 45%, ${C.water})`, transform: `scale(${push})` }}>
      <svg width={1920} height={1080}>
        <defs><radialGradient id="moonglow"><stop offset="0%" stopColor={C.moon} stopOpacity="0.9" /><stop offset="100%" stopColor={C.moon} stopOpacity="0" /></radialGradient></defs>
        <circle cx={1350} cy={190} r={140} fill="url(#moonglow)" opacity={0.35} />
        <circle cx={1350} cy={190} r={36} fill={C.moon} opacity={0.9} />
        <path d="M0,470 C200,440 380,455 560,430 C760,402 980,450 1180,428 C1400,404 1650,448 1920,420 L1920,500 L0,500 Z" fill="#051009" />
        {Array.from({ length: 70 }).map((_, i) => {
          const y = 505 + i * 8 + 2 * Math.sin(f / 9 + i);
          const w = (40 + 5 * i) * (0.55 + 0.45 * Math.sin(f / 13 + i * 0.7));
          const x = 1350 + 26 * Math.sin(f / 17 + i * 0.9) - w / 2;
          return <rect key={i} x={x} y={y} width={w} height={2 + i * 0.04} rx={1} fill={C.moon} opacity={0.5 - i * 0.006} />;
        })}
        {Array.from({ length: 50 }).map((_, i) => {
          const y = 520 + ((i * 97) % 560); const x = (i * 389 + f * (0.6 + (i % 3) * 0.3)) % 2100 - 100;
          return <rect key={'r' + i} x={x} y={y} width={60 + (i % 5) * 30} height={1.5} fill="#5d8d97" opacity={0.18} />;
        })}
      </svg>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.6) 100%)' }} />
    </AbsoluteFill>
  );
};

// S2 — [ILLUSTRATION] riverbank, branch snap, torch beam, two eyes
const Bank: React.FC<{ f: number }> = ({ f }) => {
  const t = f / FPS;
  const shake = t > T.snap && t < T.snap + 0.35 ? 6 * Math.sin(t * 90) * (1 - (t - T.snap) / 0.35) : 0;
  const beamOn = ramp(f, T.torch, T.torch + 0.25);
  const ang = interpolate(t, [T.torch, T.eyes, T.reveal], [-28, -4, -2], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
  const eyes = ramp(f, T.eyes, T.eyes + 0.4);
  const zoom = 1 + 0.05 * ramp(f, T.snap, T.reveal);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(${C.night0}, ${C.night1})`, transform: `translate(${shake}px,0) scale(${zoom})` }}>
      <svg width={1920} height={1080}>
        <circle cx={300} cy={150} r={28} fill={C.moon} opacity={0.7} />
        <path d="M0,520 C120,420 220,470 330,400 C460,320 560,430 700,380 C860,320 980,420 1120,360 C1300,290 1450,410 1600,350 C1740,300 1840,380 1920,340 L1920,700 L0,700 Z" fill={C.far} />
        <rect y={690} width={1920} height={390} fill="#071a20" />
        {Array.from({ length: 30 }).map((_, i) => <rect key={i} x={(i * 211 + f * 0.8) % 2000 - 80} y={720 + (i * 53) % 330} width={90} height={1.5} fill="#4c7b84" opacity={0.2} />)}
        {/* bushes where the eyes are */}
        <path d="M1180,700 C1150,560 1260,520 1320,560 C1360,470 1490,480 1510,560 C1580,520 1680,560 1660,700 Z" fill={C.mid} />
        <path d="M900,700 C880,610 960,580 1010,610 C1050,560 1130,590 1120,700 Z" fill={C.mid} />
        {/* torch beam from the camper (bottom-left) */}
        <g transform={`rotate(${ang} 330 860)`} opacity={beamOn}>
          <defs><linearGradient id="beam" x1="0" x2="1"><stop offset="0%" stopColor={C.beam} stopOpacity="0.55" /><stop offset="100%" stopColor={C.beam} stopOpacity="0" /></linearGradient></defs>
          <path d="M330,860 L1700,560 L1760,760 Z" fill="url(#beam)" />
        </g>
        {/* eyes */}
        <g opacity={eyes}>
          {[1400, 1452].map((x, i) => (
            <g key={i}><circle cx={x} cy={615} r={22} fill="#ffd56a" opacity={0.35} style={{ filter: 'blur(8px)' }} /><ellipse cx={x} cy={615} rx={11} ry={7} fill="#ffe08a" /></g>
          ))}
        </g>
        {/* near grass silhouettes */}
        <path d="M0,1080 L0,860 C60,800 90,900 130,820 C160,760 200,880 240,800 C280,880 330,780 380,860 C430,800 470,900 520,840 L560,1080 Z" fill={C.near} />
        <path d="M1500,1080 C1560,900 1640,980 1700,880 C1760,980 1820,900 1920,940 L1920,1080 Z" fill={C.near} />
      </svg>
      <div style={{ position: 'absolute', left: 270, top: 760 }}><Person h={120} torch /></div>
      <Particles f={f} n={34} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 55% 55%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.65) 100%)' }} />
    </AbsoluteFill>
  );
};

// S3 — [ILLUSTRATION] reveal: jaguar in the torch light + title + human for scale
const Reveal: React.FC<{ f: number }> = ({ f }) => {
  const t = f / FPS;
  const step = ramp(f, T.reveal, T.reveal + 1.4);
  const title = ramp(f, T.reveal + 0.5, T.reveal + 1.1);
  const knows = ramp(f, T.knows, T.knows + 0.8);
  const scale = ramp(f, T.reveal + 1.5, T.reveal + 2.1) * (1 - ramp(f, T.knows + 0.2, T.knows + 0.9));
  const push = 1 + 2.2 * ramp(f, T.knows + 0.2, T.size + 0.2);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 58% 58%, #2c3a22 0%, ${C.night1} 45%, ${C.night0} 85%)`, transform: `scale(${push})`, transformOrigin: '82% 57%' }}>
      <div style={{ position: 'absolute', left: 930 + (1 - step) * 160, top: 528, width: 700, height: 293, opacity: 0.25 + 0.75 * step }}>
        <Jaguar eyeGlow={Math.max(knows, step * 0.5)} headTurn={knows} />
      </div>
      <svg width={1920} height={1080} style={{ position: 'absolute' }}><rect y={806} width={1920} height={274} fill="#050f0b" opacity={0.85} /></svg>
      {/* human for scale + scale bar */}
      <div style={{ position: 'absolute', left: 640, top: 231, opacity: scale }}><Person h={575} color="#2f463b" /></div>
      <div style={{ position: 'absolute', left: 640, top: 830, width: 1010, opacity: scale }}>
        <div style={{ height: 3, background: C.muted, opacity: 0.7 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: monoFont, color: C.muted, fontSize: 22, letterSpacing: 4, marginTop: 10 }}>
          <span>VOCÊ · 1,75 M</span><span>ONÇA · ATÉ ~2,4 M COM A CAUDA</span>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 120, top: 64, opacity: title, transform: `translateY(${(1 - title) * 20}px)` }}>
        <div style={{ fontFamily: displayFont, fontSize: 104, color: C.text, letterSpacing: 2, lineHeight: 1 }}>ONÇA-<span style={{ color: C.gold }}>PINTADA</span></div>
        <div style={{ fontFamily: monoFont, fontSize: 28, letterSpacing: 8, color: C.muted, marginTop: 18 }}>PANTHERA ONCA · PANTANAL</div>
      </div>
      <Particles f={f} n={22} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 75% 58%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.82) 100%)' }} />
    </AbsoluteFill>
  );
};

// S4 — [ILLUSTRATION + TEXT] weight vs a man, with Brazil map inset
const brazil = (feature(countries as any, (countries as any).objects.countries) as any).features.find((d: any) => d.id === '076');
const Weight: React.FC<{ f: number }> = ({ f }) => {
  const a = ramp(f, T.size + 0.3, T.size + 1.5), b = ramp(f, T.size + 3.0, T.size + 4.0), m = ramp(f, T.size + 0.2, T.size + 1.0);
  const proj = geoMercator().fitSize([360, 360], brazil); const path = geoPath(proj);
  const pan = proj([-57, -18])!;
  const Bar: React.FC<{ label: string; kg: string; w: number; p: number; gold?: boolean }> = ({ label, kg, w, p, gold }) => (
    <div style={{ marginBottom: 46 }}>
      <div style={{ fontFamily: monoFont, color: C.muted, fontSize: 26, letterSpacing: 5, marginBottom: 12 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ height: 54, width: w * p, background: gold ? C.gold : '#5f7d70', borderRadius: 4 }} />
        <div style={{ fontFamily: displayFont, fontSize: 52, whiteSpace: 'nowrap', color: gold ? C.gold : C.text, opacity: p }}>{kg}</div>
      </div>
    </div>
  );
  return (
    <AbsoluteFill style={{ background: `linear-gradient(${C.night0}, ${C.night1})` }}>
      <div style={{ position: 'absolute', left: 140, top: 120, fontFamily: displayFont, fontSize: 72, color: C.text }}>O maior felino das <span style={{ color: C.gold }}>Américas</span></div>
      <div style={{ position: 'absolute', left: 140, top: 330, width: 1050 }}>
        <Bar label="Onça-pintada · machos grandes" kg="100+ kg" w={900} p={a} gold />
        <Bar label="Homem adulto · média" kg="~80 kg" w={720} p={b} />
      </div>
      <svg width={420} height={420} style={{ position: 'absolute', right: 150, top: 300, opacity: m }}>
        <g transform="translate(30,30)">
          <path d={path(brazil) ?? undefined} fill="#16352a" stroke={C.muted} strokeWidth={1.5} />
          <circle cx={pan[0]} cy={pan[1]} r={26} fill={C.gold} opacity={0.25} />
          <circle cx={pan[0]} cy={pan[1]} r={8} fill={C.gold} />
        </g>
      </svg>
      <Label style={{ right: 210, top: 740 }} o={m}>Pantanal</Label>
      <Particles f={f} n={16} />
    </AbsoluteFill>
  );
};

// S5 — [TEXT] bite force quotient bars
const Bite: React.FC<{ f: number }> = ({ f }) => {
  const rows = [
    { n: 'Onça-pintada', v: 137, gold: true }, { n: 'Tigre', v: 127 }, { n: 'Leão', v: 112 }, { n: 'Leopardo', v: 94 },
  ];
  const head = ramp(f, T.bite, T.bite + 0.6);
  const end = ramp(f, T.end, T.total);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(${C.night0}, ${C.night1})`, opacity: 1 - end }}>
      <div style={{ position: 'absolute', left: 140, top: 110, opacity: head }}>
        <div style={{ fontFamily: displayFont, fontSize: 68, color: C.text }}>A mordida mais <span style={{ color: C.gold }}>forte</span></div>
        <div style={{ fontFamily: monoFont, fontSize: 24, letterSpacing: 5, color: C.muted, marginTop: 14 }}>FORÇA DA MORDIDA EM RELAÇÃO AO TAMANHO DO CORPO (BFQ)</div>
      </div>
      <div style={{ position: 'absolute', left: 140, top: 340 }}>
        {rows.map((r, i) => {
          const p = ramp(f, T.bite + 1.2 + i * 0.45, T.bite + 2.0 + i * 0.45);
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: 38 }}>
              <div style={{ width: 330, fontFamily: bodyFont, fontWeight: 700, fontSize: 36, color: r.gold ? C.gold : C.text }}>{r.n}</div>
              <div style={{ height: 46, width: r.v * 8 * p, background: r.gold ? C.gold : '#5f7d70', borderRadius: 4 }} />
              <div style={{ marginLeft: 22, fontFamily: monoFont, fontSize: 34, color: r.gold ? C.gold : C.muted, opacity: p }}>{r.v}</div>
            </div>
          );
        })}
      </div>
      <Label style={{ left: 140, bottom: 70, fontSize: 18, letterSpacing: 3 }} o={head}>Estimativa · Wroe, McHenry &amp; Thomason, 2005</Label>
      <Particles f={f} n={14} />
    </AbsoluteFill>
  );
};

export const OncaTest: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const fadeIn = (a: number) => ramp(f, a, a + 0.35);
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {t < T.snap + 0.4 ? <NightWater f={f} /> : null}
      {t >= T.snap && t < T.reveal + 0.4 ? <AbsoluteFill style={{ opacity: fadeIn(T.snap) }}><Bank f={f} /></AbsoluteFill> : null}
      {t >= T.reveal && t < T.size + 0.4 ? <AbsoluteFill style={{ opacity: fadeIn(T.reveal) }}><Reveal f={f} /></AbsoluteFill> : null}
      {t >= T.size && t < T.bite + 0.4 ? <AbsoluteFill style={{ opacity: fadeIn(T.size) }}><Weight f={f} /></AbsoluteFill> : null}
      {t >= T.bite ? <AbsoluteFill style={{ opacity: fadeIn(T.bite) }}><Bite f={f} /></AbsoluteFill> : null}
      {t < T.snap ? <Label style={{ left: 120, bottom: 90 }} o={ramp(f, 1.2, 2.2) * (1 - ramp(f, 6.2, 7))}>Pantanal · 23:40</Label> : null}
      <Audio src={staticFile('audio/onca-test-mix.wav')} />
    </AbsoluteFill>
  );
};
export const ONCA_FRAMES = Math.round(T.total * FPS);
