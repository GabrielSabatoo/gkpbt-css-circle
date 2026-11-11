import { displayFont, bodyFont, serifFont, monoFont } from './fonts';

// Channel palette and type (see channel/visual-style.md)
export const theme = {
  bg: '#142236', // night navy (neutral background)
  ocean: '#1d3048',
  land: '#4a6884',
  landEdge: '#4a6884',
  graticule: 'rgba(120, 150, 210, 0.08)',
  amber: '#e9b44c',
  amberSoft: 'rgba(255, 181, 71, 0.10)',
  danger: '#ff4d5e',
  dangerSoft: 'rgba(255, 77, 94, 0.22)',
  text: '#eef2fb',
  textMuted: '#93a0bd',
  fontDisplay: `${serifFont}, Georgia, "Times New Roman", serif`, // was Archivo Black
  fontBlock: `${displayFont}, "Arial Black", Impact, sans-serif`,
  fontBody: `${bodyFont}, "Helvetica Neue", Arial, sans-serif`,
  /** elegant bold serif for titles and key phrases (italic for the emphasised word) */
  fontSerif: `${serifFont}, Georgia, "Times New Roman", serif`,
  /** wide-tracked monospace for small labels */
  fontMono: `${monoFont}, "Courier New", monospace`,
};

// Bright "daytime" palette used after the night-time hook (tune against reference screenshots).
export const day = {
  bg: '#ece1c8', // warm beige paper (text scenes)
  mapBg: '#d6c7a8', // deeper tan behind the globe so cream land stands out
  ocean: '#c3d6de',
  land: '#e9dcbf',
  landEdge: '#e9dcbf',
  graticule: 'rgba(70, 95, 115, 0.18)',
  circle: '#e2a12f',
  dot: '#b97c12',
  text: '#1d2330',
  textMuted: '#5b6273',
  danger: '#d92f3c',
  plane: '#16181d',
};

/** Mix two hex colours (t = 0 → a, 1 → b). */
export const mix = (a: string, b: string, t: number) => {
  if (t <= 0) return a;
  if (t >= 1) return b;
  const h = (x: string) => [1, 3, 5].map((i) => parseInt(x.slice(i, i + 2), 16));
  const [A, B] = [h(a), h(b)];
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
};

// Average single-engine cruise speed used for illustrative circles (~400 kt ≈ 740 km/h)
export const ONE_ENGINE_KMH = 740;
export const KM_PER_DEG = 111.2;
export const minutesToDegrees = (minutes: number) => ((minutes / 60) * ONE_ENGINE_KMH) / KM_PER_DEG;
