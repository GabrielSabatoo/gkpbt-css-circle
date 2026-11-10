import { displayFont, bodyFont } from './fonts';

// Channel palette and type (see channel/visual-style.md)
export const theme = {
  bg: '#060b18', // near-black navy (neutral background, oceans)
  ocean: '#08112a',
  land: '#26365a',
  landEdge: '#3a4d78',
  graticule: 'rgba(120, 150, 210, 0.08)',
  amber: '#ffb547',
  amberSoft: 'rgba(255, 181, 71, 0.10)',
  danger: '#ff4d5e',
  dangerSoft: 'rgba(255, 77, 94, 0.22)',
  text: '#eef2fb',
  textMuted: '#93a0bd',
  fontDisplay: `${displayFont}, "Arial Black", Impact, sans-serif`,
  fontBody: `${bodyFont}, "Helvetica Neue", Arial, sans-serif`,
};

// Average single-engine cruise speed used for illustrative circles (~400 kt ≈ 740 km/h)
export const ONE_ENGINE_KMH = 740;
export const KM_PER_DEG = 111.2;
export const minutesToDegrees = (minutes: number) => ((minutes / 60) * ONE_ENGINE_KMH) / KM_PER_DEG;
