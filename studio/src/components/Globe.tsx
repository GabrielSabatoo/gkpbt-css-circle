import React, { useMemo } from 'react';
import { AbsoluteFill } from 'remotion';
import { geoCircle, geoGraticule10, geoOrthographic, geoPath, GeoProjection } from 'd3-geo';
import { feature } from 'topojson-client';
import world from 'world-atlas/land-110m.json';
import { theme, minutesToDegrees } from '../theme';
import { Airport } from '../data/airports';

export const land = feature(world as any, (world as any).objects.land) as any;
const graticule = geoGraticule10();

export type Camera = { lon: number; lat: number; scale: number; roll?: number };

export type GlobeProps = {
  width: number;
  height: number;
  camera: Camera;
  /** airports to draw as dots; `appear` 0..1 per airport */
  dots?: { airport: Airport; appear: number; label?: boolean }[];
  /** circles around airports; `minutes` sets radius, `appear` 0..1 fades/draws it */
  circles?: { airport: Airport; minutes: number; appear: number; danger?: boolean }[];
  /** 0..1 dims the land so only circles read */
  landDim?: number;
  children?: (projection: GeoProjection) => React.ReactNode;
};

export const Globe: React.FC<GlobeProps> = ({ width, height, camera, dots = [], circles = [], landDim = 0, children }) => {
  const projection = useMemo(
    () =>
      geoOrthographic()
        .translate([width / 2, height / 2])
        .scale(camera.scale)
        .rotate([-camera.lon, -camera.lat, camera.roll ?? 0])
        .clipAngle(90),
    [width, height, camera.lon, camera.lat, camera.scale, camera.roll]
  );
  const path = geoPath(projection);
  const sphere = path({ type: 'Sphere' }) ?? undefined;

  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg }}>
      <svg width={width} height={height}>
        <defs>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="85%" stopColor="rgba(80,120,220,0.0)" />
            <stop offset="100%" stopColor="rgba(80,120,220,0.18)" />
          </radialGradient>
        </defs>
        <path d={sphere} fill={theme.ocean} />
        <path d={path(graticule) ?? undefined} fill="none" stroke={theme.graticule} strokeWidth={1} />
        <path
          d={path(land) ?? undefined}
          fill={theme.land}
          stroke={theme.landEdge}
          strokeWidth={1}
          opacity={1 - landDim * 0.75}
        />
        {(() => {
          // Fills are drawn opaque inside one group and the group is made translucent,
          // so overlapping circles merge into one even area instead of stacking up.
          const shapes = circles
            .filter((c) => c.appear > 0)
            .map((c) => ({ c, d: path(geoCircle().center(c.airport.at).radius(minutesToDegrees(c.minutes) * Math.max(0.001, c.appear))()) ?? undefined }));
          const fillOpacity = Math.min(1, Math.max(0, ...shapes.map((s) => s.c.appear)) * 1.5);
          return (
            <>
              <g opacity={0.13 * fillOpacity}>
                {shapes.filter((s) => !s.c.danger).map((s, i) => <path key={`f${i}`} d={s.d} fill={theme.amber} />)}
              </g>
              <g opacity={0.22 * fillOpacity}>
                {shapes.filter((s) => s.c.danger).map((s, i) => <path key={`fd${i}`} d={s.d} fill={theme.danger} />)}
              </g>
              {shapes.map((s, i) => (
                <path key={`s${i}`} d={s.d} fill="none" stroke={s.c.danger ? theme.danger : theme.amber} strokeWidth={s.c.danger ? 2.5 : 1.6} opacity={Math.min(1, s.c.appear * 1.5) * (shapes.length > 30 ? 0.55 : 0.9)} />
              ))}
            </>
          );
        })()}
        {dots.map((d, i) => {
          const p = projection(d.airport.at);
          const visible = p && isFront(projection, d.airport.at);
          if (!p || !visible || d.appear <= 0) return null;
          return (
            <g key={`d${i}`} opacity={d.appear}>
              <circle cx={p[0]} cy={p[1]} r={10 * (1 - d.appear) + 4} fill="none" stroke={theme.amber} strokeWidth={1.5} opacity={1 - d.appear} />
              <circle cx={p[0]} cy={p[1]} r={4} fill={theme.amber} />
              {d.label ? (
                <text x={p[0] + 10} y={p[1] + 5} fill={theme.text} fontFamily={theme.fontBody} fontSize={20} fontWeight={600}>
                  {d.airport.name}
                </text>
              ) : null}
            </g>
          );
        })}
        <path d={sphere} fill="url(#glow)" stroke="rgba(120,160,240,0.25)" strokeWidth={1.5} />
        {children?.(projection)}
      </svg>
    </AbsoluteFill>
  );
};

// true when a point is on the visible hemisphere
export const isFront = (projection: GeoProjection, at: [number, number]) => {
  const r = projection.rotate();
  const lon = ((at[0] + r[0]) * Math.PI) / 180;
  const lat = (at[1] * Math.PI) / 180;
  const lat0 = (-r[1] * Math.PI) / 180;
  const cosc = Math.sin(lat0) * Math.sin(lat) + Math.cos(lat0) * Math.cos(lat) * Math.cos(lon);
  return cosc > 0;
};
