import React, { useMemo } from 'react';
import { AbsoluteFill } from 'remotion';
import { geoCircle, geoDistance, geoGraticule10, geoOrthographic, geoPath, GeoProjection } from 'd3-geo';
import { feature } from 'topojson-client';
import world from 'world-atlas/land-110m.json';
import { day as dayP, mix, theme, minutesToDegrees } from '../theme';
import { Airport } from '../data/airports';

export const land = feature(world as any, (world as any).objects.land) as any;
const graticule = geoGraticule10();

// Circle polygons are cached by centre and (rounded) radius; only the projection changes per frame.
const circleCache = new Map<string, any>();
const circleGeom = (at: [number, number], radius: number) => {
  const key = `${at[0]},${at[1]},${radius.toFixed(2)}`;
  let g = circleCache.get(key);
  if (!g) {
    g = geoCircle().center(at).radius(radius).precision(4)();
    if (circleCache.size > 20000) circleCache.clear();
    circleCache.set(key, g);
  }
  return g;
};

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
  /** 0 = night palette, 1 = bright day palette */
  day?: number;
  children?: (projection: GeoProjection) => React.ReactNode;
};

export const Globe: React.FC<GlobeProps> = ({ width, height, camera, dots = [], circles = [], landDim = 0, day = 0, children }) => {
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
  const C = {
    bg: mix(theme.bg, dayP.mapBg, day),
    ocean: mix(theme.ocean, dayP.ocean, day),
    land: mix(theme.land, dayP.land, day),
    landEdge: mix(theme.landEdge, dayP.landEdge, day),
    circle: mix(theme.amber, dayP.circle, day),
    dot: mix(theme.amber, dayP.dot, day),
    text: mix(theme.text, dayP.text, day),
    danger: mix(theme.danger, dayP.danger, day),
  };

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <svg width={width} height={height}>
        <defs>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="85%" stopColor="rgba(80,120,220,0.0)" />
            <stop offset="100%" stopColor="rgba(80,120,220,0.18)" />
          </radialGradient>
        </defs>
        <path d={sphere} fill={C.ocean} />
        <path d={path(graticule) ?? undefined} fill="none" stroke={day > 0.5 ? dayP.graticule : theme.graticule} strokeWidth={1} />
        <path
          d={path(land) ?? undefined}
          fill={C.land}
          stroke={C.landEdge}
          strokeWidth={1}
          opacity={1 - landDim * (day > 0.5 ? 0.35 : 0.75)}
        />
        {(() => {
          // Fills are drawn opaque inside one group and the group is made translucent,
          // so overlapping circles merge into one even area instead of stacking up.
          // Skip circles entirely on the far side of the globe.
          const center: [number, number] = [camera.lon, camera.lat];
          const shapes = circles
            .filter((c) => c.appear > 0)
            .filter((c) => (geoDistance(center, c.airport.at) * 180) / Math.PI < 90 + minutesToDegrees(c.minutes) * c.appear)
            .map((c) => ({ c, d: path(circleGeom(c.airport.at, minutesToDegrees(c.minutes) * Math.max(0.001, c.appear))) ?? '' }));
          const fillOpacity = Math.min(1, Math.max(0, ...shapes.map((s) => s.c.appear)) * 1.5);
          return (
            <>
              {/* one combined path per colour: overlaps merge, and it is one shape to draw */}
              <path d={shapes.filter((s) => !s.c.danger).map((s) => s.d).join('')} fill={C.circle} opacity={(day > 0.5 ? 0.16 : 0.13) * fillOpacity} />
              <path d={shapes.filter((s) => s.c.danger).map((s) => s.d).join('')} fill={C.danger} opacity={0.22 * fillOpacity} />
              {shapes.map((s, i) => (
                <path key={`s${i}`} d={s.d} fill="none" stroke={s.c.danger ? C.danger : C.circle} strokeWidth={s.c.danger ? 2.5 : day > 0.5 ? 2 : 1.6} opacity={Math.min(1, s.c.appear * 1.5) * (shapes.length > 30 ? 0.55 : 0.9)} />
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
              <circle cx={p[0]} cy={p[1]} r={10 * (1 - d.appear) + 4} fill="none" stroke={C.dot} strokeWidth={1.5} opacity={1 - d.appear} />
              <circle cx={p[0]} cy={p[1]} r={4} fill={C.dot} />
              {d.label ? (
                <text x={p[0] + 10} y={p[1] + 5} fill={C.text} fontFamily={theme.fontBody} fontSize={20} fontWeight={600}>
                  {d.airport.name}
                </text>
              ) : null}
            </g>
          );
        })}
        <path d={sphere} fill={day > 0.5 ? 'none' : 'url(#glow)'} stroke={day > 0.5 ? dayP.landEdge : 'rgba(120,160,240,0.25)'} strokeWidth={1.5} />
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
