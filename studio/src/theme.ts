import { displayFont, bodyFont, serifFont, monoFont } from './fonts';

// Channel palette and type (see channel/visual-style.md)
export const theme = {
  bg: '#1b2738', // night navy (reference-style)
  ocean: '#2b4b67',
  land: '#71889c',
  landEdge: '#71889c',
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
  bg: '#e9e0c8', // paper beige (all bright scenes)
  mapBg: '#e9e0c8',
  ocean: '#b5cedb',
  land: '#e2d1a9',
  landEdge: '#d2bf93',
  graticule: 'rgba(40, 70, 95, 0.14)',
  outline: '#26323f', // thin dark line around the globe
  circle: '#2c5578', // navy: range circles, accent italic words
  gold: '#d9a23c', // routes, highlights
  dot: '#e0452f', // airport dots: vermilion with a white ring, readable on blue and beige
  text: '#1d2330',
  textMuted: '#5b6273',
  danger: '#c23b2b',
  coral: '#e2654f', // accent word on night scenes, 'not flown' dashes
  plane: '#16181d',
}

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
