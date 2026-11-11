import React from 'react';
import { geoDistance, geoInterpolate, geoPath, GeoProjection } from 'd3-geo';
import { day, theme } from '../theme';
import { isFront } from './Globe';

type LL = [number, number];

/** Top-down airliner. `engines` lists engine states (true = running). */
export const PlaneIcon: React.FC<{ x: number; y: number; size?: number; heading?: number; engineOut?: boolean; glow?: number; color?: string; outline?: string }> = ({
  x, y, size = 46, heading = 0, engineOut = false, glow = 0, color = '#16181d', outline = '#f6f0e2',
}) => {
  const s = size / 100;
  const body = { fill: color, stroke: outline, strokeWidth: 3, strokeLinejoin: 'round' as const };
  return (
    <g transform={`translate(${x},${y}) rotate(${heading}) scale(${s})`}>
      {glow > 0 ? <circle r={75} fill={theme.amber} opacity={0.35 * glow} /> : null}
      {/* fuselage */}
      <path d="M0,-50 C6,-46 7,-36 7,-20 L7,30 L0,48 L-7,30 L-7,-20 C-7,-36 -6,-46 0,-50 Z" {...body} />
      {/* wings */}
      <path d="M7,-6 L50,14 L50,22 L7,12 Z M-7,-6 L-50,14 L-50,22 L-7,12 Z" {...body} />
      {/* tail */}
      <path d="M5,30 L20,42 L20,47 L3,42 Z M-5,30 L-20,42 L-20,47 L-3,42 Z" {...body} />
      {/* engines */}
      <rect x={20} y={2} width={7} height={16} rx={3} fill={color} stroke={outline} strokeWidth={2} />
      <rect x={-27} y={2} width={7} height={16} rx={3} fill={engineOut ? theme.danger : color} stroke={engineOut ? theme.danger : outline} strokeWidth={2} />
    </g>
  );
};

/** Great-circle (or multi-point) line that draws on with `progress` 0..1. */
export const GeoLine: React.FC<{
  projection: GeoProjection; points: LL[]; progress?: number; color?: string; dashed?: boolean; width?: number; opacity?: number;
}> = ({ projection, points, progress = 1, color = theme.amber, dashed = false, width = 4, opacity = 1 }) => {
  const coords = pathPoints(points, progress);
  const d = geoPath(projection)({ type: 'LineString', coordinates: coords });
  return <path d={d ?? undefined} fill="none" stroke={color} strokeWidth={width} strokeDasharray={dashed ? '14 12' : undefined} strokeLinecap="round" opacity={opacity} />;
};

/** Point at fraction t along a multi-segment great-circle path. */
export const along = (points: LL[], t: number): LL => {
  const segs = points.slice(1).map((p, i) => ({ a: points[i], b: p, d: geoDistance(points[i], p) }));
  const total = segs.reduce((s, x) => s + x.d, 0);
  let target = Math.max(0, Math.min(1, t)) * total;
  for (const s of segs) {
    if (target <= s.d || s === segs[segs.length - 1]) return geoInterpolate(s.a, s.b)(s.d === 0 ? 0 : Math.min(1, target / s.d)) as LL;
    target -= s.d;
  }
  return points[points.length - 1];
};

const pathPoints = (points: LL[], progress: number) => {
  const n = 120;
  const out: LL[] = [];
  for (let i = 0; i <= n * progress; i++) out.push(along(points, i / n));
  if (out.length < 2) out.push(along(points, Math.max(0.001, progress)));
  return out;
};

/** heading in screen degrees for a plane travelling along points at t */
export const headingAt = (projection: GeoProjection, points: LL[], t: number) => {
  const a = projection(along(points, Math.max(0, t - 0.01)));
  const b = projection(along(points, Math.min(1, t + 0.01)));
  if (!a || !b) return 0;
  return (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI + 90;
};

export const Pin: React.FC<{ projection: GeoProjection; at: LL; label?: string; opacity?: number; color?: string; size?: number; halo?: string; dot?: string }> = ({
  projection, at, label, opacity = 1, color = theme.text, size = 26, halo = theme.bg, dot = theme.amber,
}) => {
  const p = projection(at);
  if (!p || !isFront(projection, at) || opacity <= 0) return null;
  return (
    <g opacity={opacity}>
      <circle cx={p[0]} cy={p[1]} r={7} fill={dot} stroke="#ffffff" strokeWidth={2.5} />
      {label ? (
        <text x={p[0] + 14} y={p[1] - 14} fill={color} fontFamily={theme.fontSerif} fontWeight={700} fontSize={size * 1.25} style={{ paintOrder: 'stroke' }} stroke={halo} strokeWidth={7}>
          {label}
        </text>
      ) : null}
    </g>
  );
};

/** Distance ruler between two points with a label at the middle. */
export const Ruler: React.FC<{ projection: GeoProjection; a: LL; b: LL; label: string; progress?: number }> = ({ projection, a, b, label, progress = 1 }) => {
  const mid = projection(along([a, b], 0.5 * progress));
  return (
    <g>
      <GeoLine projection={projection} points={[a, b]} progress={progress} color={day.coral} width={4} dashed opacity={0.95} />
      {mid && progress > 0.6 ? (
        <text x={mid[0]} y={mid[1] - 18} textAnchor="middle" fill={theme.text} fontFamily={theme.fontMono} fontSize={30} letterSpacing={3} opacity={(progress - 0.6) / 0.4} style={{ paintOrder: 'stroke' }} stroke={theme.bg} strokeWidth={8}>
          {label}
        </text>
      ) : null}
    </g>
  );
};

// ---- Gap field: red dots over ocean points that no circle covers ----
import { geoContains } from 'd3-geo';
import { land } from './Globe';
import { minutesToDegrees } from '../theme';

const oceanCache = new Map<string, LL[]>();
const oceanGrid = (lon0: number, lon1: number, lat0: number, lat1: number, step: number) => {
  const key = [lon0, lon1, lat0, lat1, step].join(',');
  if (!oceanCache.has(key)) {
    const pts: LL[] = [];
    for (let lat = lat0; lat <= lat1; lat += step)
      for (let lon = lon0; lon <= lon1; lon += step / Math.max(0.35, Math.cos((lat * Math.PI) / 180))) if (!geoContains(land, [lon, lat])) pts.push([lon, lat]);
    oceanCache.set(key, pts);
  }
  return oceanCache.get(key)!;
};

export const GapField: React.FC<{
  projection: GeoProjection; centers: LL[]; minutes: number; bbox: [number, number, number, number]; step?: number; opacity?: number; pulse?: number;
}> = ({ projection, centers, minutes, bbox, step = 1.1, opacity = 1, pulse = 0 }) => {
  if (opacity <= 0) return null;
  // Uncovered points depend only on the inputs, not the camera: compute once and cache.
  const key = `${bbox.join(',')}|${step}|${minutes}|${centers.length}|${centers[0]?.join(',')}`;
  if (!gapCache.has(key)) {
    const r = (minutesToDegrees(minutes) * Math.PI) / 180;
    gapCache.set(key, oceanGrid(bbox[0], bbox[1], bbox[2], bbox[3], step).filter((p) => !centers.some((c) => geoDistance(p, c) <= r)));
  }
  // All dots in one path (one shape for the renderer instead of thousands).
  const rr = 4 + 2 * pulse;
  let d = '';
  for (const p of gapCache.get(key)!) {
    if (!isFront(projection, p)) continue;
    const xy = projection(p);
    if (!xy) continue;
    d += `M${(xy[0] - rr).toFixed(1)},${xy[1].toFixed(1)}a${rr},${rr} 0 1,0 ${2 * rr},0a${rr},${rr} 0 1,0 ${-2 * rr},0`;
  }
  return <path d={d} fill={theme.danger} opacity={opacity * (0.55 + 0.35 * pulse)} />;
};
const gapCache = new Map<string, LL[]>();
