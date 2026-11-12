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
type Ros = { x: number; y: number; r: number; rot: number; n: number; dot: boolean };
const rosettes: Ros[] = [];
{
  let k = 0;
  for (let y = 200; y < 330; y += 30) for (let x = 275; x < 790; x += 36) {
    const jx = (rnd(k) - 0.5) * 18, jy = (rnd(k + 9) - 0.5) * 14;
    rosettes.push({ x: x + jx + ((y / 30) % 2) * 18, y: y + jy, r: 9 + rnd(k + 3) * 6, rot: rnd(k + 5) * 360, n: 4 + Math.round(rnd(k + 7)), dot: rnd(k + 11) > 0.35 });
    k++;
  }
}
const Rosette: React.FC<Ros> = ({ x, y, r, rot, n, dot }) => (
  <g transform={`translate(${x},${y}) rotate(${rot})`}>
    {Array.from({ length: n }).map((_, i) => {
      const a = (i / n) * 2 * Math.PI + rnd(x + i) * 0.5;
      return <ellipse key={i} cx={Math.cos(a) * r} cy={Math.sin(a) * r * 0.8} rx={r * (0.32 + rnd(y + i) * 0.14)} ry={r * 0.2} transform={`rotate(${(a * 180) / Math.PI + 90} ${Math.cos(a) * r} ${Math.sin(a) * r * 0.8})`} fill={C.spot} />;
    })}
    {dot ? <circle r={r * 0.22} fill={C.spot} opacity={0.9} /> : null}
    <ellipse rx={r * 0.62} ry={r * 0.5} fill="#c2852e" opacity={0.55} />
  </g>
);
const TORSO = 'M248,262 C246,212 288,184 350,182 C420,180 470,196 540,196 C610,196 660,176 724,182 C780,188 812,226 808,270 C805,310 780,336 742,342 C690,350 640,330 590,334 C520,340 470,328 410,330 C350,332 300,330 272,312 C254,300 249,282 248,262 Z';
const HEAD = 'M758,206 C768,162 818,146 864,150 C906,155 936,180 941,206 C945,227 936,247 916,254 C896,260 880,264 858,266 C818,268 778,256 766,236 Z';

export const Jaguar: React.FC<{ eyeGlow?: number; headTurn?: number }> = ({ eyeGlow = 0, headTurn = 0 }) => (
  <svg viewBox="140 120 820 340" width="100%" height="100%" style={{ overflow: 'visible' }}>
    <defs>
      <clipPath id="jbody"><path d={TORSO} /></clipPath>
      <radialGradient id="jlight" cx="70%" cy="40%" r="70%"><stop offset="0%" stopColor="#fff3d6" stopOpacity="0.35" /><stop offset="100%" stopColor="#000" stopOpacity="0.35" /></radialGradient>
    </defs>
    {/* far legs + tail (darker) */}
    <path d="M330,300 C320,350 330,395 338,432 L368,434 C366,395 366,350 380,312 Z" fill={C.furShade} />
    <path d="M752,310 C748,360 752,400 756,430 L786,432 C788,398 786,352 792,306 Z" fill={C.furShade} />
    <path d="M255,252 C188,262 146,322 156,392 C161,424 188,436 206,418" fill="none" stroke={C.fur} strokeWidth={24} strokeLinecap="round" />
    {[[175, 330], [160, 362], [168, 398], [195, 420]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={7} fill={C.spot} />)}
    {/* near legs */}
    <path d="M268,272 C248,332 280,382 296,432 L334,434 C330,392 330,342 346,300 Z" fill={C.fur} />
    <path d="M712,300 C704,358 708,402 714,432 L750,434 C752,404 750,360 760,312 Z" fill={C.fur} />
    {[[315, 436], [732, 436], [353, 437], [771, 435]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={24} ry={9} fill={i > 1 ? C.furShade : C.fur} />)}
    {/* torso + neck */}
    <path d={TORSO} fill={C.fur} />
    <path d="M700,190 C740,176 790,180 815,200 C835,218 838,262 820,292 C800,320 760,330 720,320 Z" fill={C.fur} />
    <path d="M290,318 C350,330 410,322 470,324 C530,326 580,326 630,322 C690,320 740,336 790,310 C770,335 735,344 700,346 C640,348 600,338 540,342 C470,344 420,336 370,338 C330,338 300,330 290,318 Z" fill={C.belly} />
    <g clipPath="url(#jbody)">
      {rosettes.map((r, i) => <Rosette key={i} {...r} />)}
    </g>
    {/* head (turns slightly toward camera) */}
    <g transform={`translate(-14,4) translate(850,210) scale(1.08) translate(-850,-210) rotate(${-6 * headTurn} 800 230)`}>
      <circle cx={812} cy={162} r={17} fill={C.furShade} /><circle cx={812} cy={164} r={8} fill={C.spot} />
      <path d={HEAD} fill={C.fur} />
      <ellipse cx={912} cy={232} rx={31} ry={20} fill={C.belly} />
      <path d="M930,207 L946,213 L934,224 Z" fill={C.spot} />
      <path d="M906,244 C918,252 932,250 940,242" fill="none" stroke={C.spot} strokeWidth={3} strokeLinecap="round" />
      {[[830, 190], [850, 175], [818, 212], [842, 230], [866, 172]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={5} fill={C.spot} />)}
      <path d="M876,192 C884,184 898,184 904,192 C897,198 884,199 876,192 Z" fill={eyeGlow > 0 ? '#ffd56a' : '#4a3210'} />
      {eyeGlow > 0 ? <circle cx={890} cy={192} r={16} fill="#ffd56a" opacity={0.45 * eyeGlow} style={{ filter: 'blur(6px)' }} /> : null}
      <circle cx={892} cy={192} r={3} fill={C.spot} />
    </g>
    <path d={TORSO} fill="url(#jlight)" style={{ mixBlendMode: 'multiply' }} />
  </svg>
);

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
  const scale = ramp(f, T.knows + 1.4, T.knows + 2.0);
  const push = 1 + 0.06 * ramp(f, T.knows, T.size);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 58% 58%, #2c3a22 0%, ${C.night1} 45%, ${C.night0} 85%)`, transform: `scale(${push})`, transformOrigin: '66% 62%' }}>
      <div style={{ position: 'absolute', left: 930 + (1 - step) * 160, top: 528, width: 700, height: 293, opacity: 0.25 + 0.75 * step }}>
        <Jaguar eyeGlow={knows} headTurn={knows} />
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
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 60% 55%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.6) 100%)' }} />
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
