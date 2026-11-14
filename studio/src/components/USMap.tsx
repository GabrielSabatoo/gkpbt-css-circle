import React, { useMemo } from 'react';
import { AbsoluteFill } from 'remotion';
import { geoAlbersUsa, geoPath, geoInterpolate, GeoProjection } from 'd3-geo';
import { Delaunay } from 'd3-delaunay';
import { feature, mesh } from 'topojson-client';
import us from 'us-atlas/states-10m.json';
import { day, mix } from '../theme';
import { PlaneIcon } from './Overlays';

const W = 1920;
const H = 1080;
const nation = feature(us as any, (us as any).objects.nation) as any;
const statesMesh = mesh(us as any, (us as any).objects.states, (a: any, b: any) => a !== b);

/** The 20 en-route Air Route Traffic Control Centers in the lower 48 (approximate facility locations). */
export const CENTERS: { id: string; name: string; at: [number, number] }[] = [
  { id: 'ZSE', name: 'Seattle', at: [-122.2, 47.3] }, { id: 'ZOA', name: 'Oakland', at: [-122.0, 37.5] },
  { id: 'ZLA', name: 'Los Angeles', at: [-118.1, 34.6] }, { id: 'ZLC', name: 'Salt Lake', at: [-111.9, 40.8] },
  { id: 'ZAB', name: 'Albuquerque', at: [-106.6, 35.2] }, { id: 'ZDV', name: 'Denver', at: [-105.1, 40.2] },
  { id: 'ZMP', name: 'Minneapolis', at: [-93.2, 44.6] }, { id: 'ZKC', name: 'Kansas City', at: [-94.8, 38.9] },
  { id: 'ZFW', name: 'Fort Worth', at: [-97.0, 32.8] }, { id: 'ZHU', name: 'Houston', at: [-95.3, 30.0] },
  { id: 'ZME', name: 'Memphis', at: [-89.9, 35.1] }, { id: 'ZAU', name: 'Chicago', at: [-88.3, 41.8] },
  { id: 'ZID', name: 'Indianapolis', at: [-86.3, 39.7] }, { id: 'ZOB', name: 'Cleveland', at: [-82.2, 41.3] },
  { id: 'ZTL', name: 'Atlanta', at: [-84.3, 33.4] }, { id: 'ZJX', name: 'Jacksonville', at: [-81.8, 30.2] },
  { id: 'ZMA', name: 'Miami', at: [-80.4, 25.8] }, { id: 'ZDC', name: 'Washington', at: [-77.6, 39.1] },
  { id: 'ZNY', name: 'New York', at: [-73.1, 40.8] }, { id: 'ZBW', name: 'Boston', at: [-71.5, 42.8] },
];

export const US_AIRPORTS: { code: string; at: [number, number] }[] = [
  ['ATL', -84.43, 33.64], ['DFW', -97.04, 32.9], ['DEN', -104.67, 39.86], ['ORD', -87.9, 41.98], ['LAX', -118.41, 33.94],
  ['JFK', -73.78, 40.64], ['LAS', -115.15, 36.08], ['MCO', -81.31, 28.43], ['MIA', -80.29, 25.8], ['CLT', -80.94, 35.21],
  ['SEA', -122.31, 47.45], ['PHX', -112.01, 33.43], ['EWR', -74.17, 40.69], ['SFO', -122.38, 37.62], ['IAH', -95.34, 29.98],
  ['BOS', -71.0, 42.36], ['FLL', -80.15, 26.07], ['MSP', -93.22, 44.88], ['LGA', -73.87, 40.78], ['DTW', -83.35, 42.21],
  ['PHL', -75.24, 39.87], ['SLC', -111.98, 40.79], ['BWI', -76.67, 39.18], ['DCA', -77.04, 38.85], ['SAN', -117.19, 32.73],
  ['IAD', -77.46, 38.95], ['TPA', -82.53, 27.98], ['BNA', -86.68, 36.12], ['AUS', -97.67, 30.19], ['MDW', -87.75, 41.79],
  ['PDX', -122.6, 45.59], ['STL', -90.37, 38.75], ['MSY', -90.26, 29.99], ['RDU', -78.79, 35.88], ['SMF', -121.59, 38.69],
  ['MCI', -94.71, 39.3], ['CLE', -81.85, 41.41], ['IND', -86.29, 39.72], ['PIT', -80.23, 40.49], ['CMH', -82.89, 39.99],
].map(([code, lon, lat]) => ({ code: code as string, at: [lon as number, lat as number] as [number, number] }));
export const airportAt = (code: string) => US_AIRPORTS.find((a) => a.code === code)!.at;

const rnd = (k: number) => { const x = Math.sin(k * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

/** Deterministic traffic: each plane repeats a route; departures after `stopAt` (s) never leave. */
export type Traffic = { n: number; t: number; stopAt?: number; durScale?: number };
const ROUTES = Array.from({ length: 160 }, (_, i) => {
  const a = US_AIRPORTS[Math.floor(rnd(i) * US_AIRPORTS.length)];
  let b = US_AIRPORTS[Math.floor(rnd(i + 99) * US_AIRPORTS.length)];
  if (b.code === a.code) b = US_AIRPORTS[(US_AIRPORTS.indexOf(a) + 7) % US_AIRPORTS.length];
  return { a: a.at, b: b.at, phase: rnd(i + 7) * 40, dur: 14 + rnd(i + 3) * 16, gap: 4 + rnd(i + 5) * 10 };
});
export const planesAt = ({ n, t, stopAt, durScale = 1 }: Traffic) => {
  const out: { at: [number, number]; next: [number, number]; p: number; key: number }[] = [];
  for (let i = 0; i < Math.min(n, ROUTES.length); i++) {
    const r = ROUTES[i]; const dur = r.dur * durScale; const period = dur + r.gap;
    const k = Math.floor((t - r.phase) / period);
    const dep = r.phase + k * period;
    const p = (t - dep) / dur;
    if (p < 0 || p >= 1) continue;
    if (stopAt !== undefined && dep >= stopAt) continue;
    const interp = geoInterpolate(r.a, r.b);
    out.push({ at: interp(p) as [number, number], next: interp(Math.min(1, p + 0.01)) as [number, number], p, key: i });
  }
  return out;
};

export type USMapProps = {
  /** 0 = day paper palette, 1 = night */
  night?: number;
  zoom?: { x: number; y: number; s: number };
  centers?: number; // 0..1 show center regions
  centerTint?: Record<string, string>; // id -> fill colour (alerts, dark centre…)
  centerLabels?: number;
  airports?: number;
  airportColor?: (code: string) => string | undefined;
  traffic?: Traffic & { size?: number; color?: string };
  wires?: number; // 0..1 draw telecom lines between centres
  wireColor?: string;
  wireBroken?: number; // 0..1 lines go quiet
  children?: (projection: GeoProjection) => React.ReactNode;
};

export const USMap: React.FC<USMapProps> = ({ night = 0, zoom = { x: 0, y: 0, s: 1 }, centers = 0, centerTint = {}, centerLabels = 0, airports = 1, airportColor, traffic, wires = 0, wireColor = '#c98a3a', wireBroken = 0, children }) => {
  const projection = useMemo(() => geoAlbersUsa().fitExtent([[150, 110], [W - 150, H - 90]], nation), []);
  const path = geoPath(projection);
  const nationD = useMemo(() => path(nation) ?? '', [path]);
  const statesD = useMemo(() => path(statesMesh as any) ?? '', [path]);
  const cells = useMemo(() => {
    const pts = CENTERS.map((c) => projection(c.at) as [number, number]);
    const v = Delaunay.from(pts).voronoi([0, 0, W, H]);
    return CENTERS.map((c, i) => ({ ...c, d: v.renderCell(i), xy: pts[i] }));
  }, [projection]);
  const wiresD = useMemo(() => {
    const pts = cells.map((c) => c.xy);
    const del = Delaunay.from(pts);
    const segs: [number, number, number, number][] = [];
    const { halfedges, triangles } = del;
    for (let e = 0; e < halfedges.length; e++) {
      if (e < halfedges[e]) continue;
      const a = pts[triangles[e]], b = pts[triangles[e % 3 === 2 ? e - 2 : e + 1]];
      if (Math.hypot(a[0] - b[0], a[1] - b[1]) < 520) segs.push([a[0], a[1], b[0], b[1]]);
    }
    return segs;
  }, [cells]);

  const C = {
    bg: mix(day.bg, '#0c1626', night),
    land: mix(day.land, '#1c2f45', night),
    edge: mix('#9c8a64', '#3d5878', night),
    outline: mix(day.outline, '#8fb0d2', night),
    cellLine: mix('rgba(44,85,120,0.55)', 'rgba(160,200,240,0.45)', night),
    label: mix(day.text, '#dce8f5', night),
    plane: mix(day.plane, '#f2e6c8', night),
  };
  const planes = traffic ? planesAt(traffic) : [];

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <svg width={W} height={H}>
        <defs><clipPath id="usclip"><path d={nationD} /></clipPath></defs>
        <g transform={`translate(${W / 2},${H / 2}) scale(${zoom.s}) translate(${-W / 2 - zoom.x},${-H / 2 - zoom.y})`}>
          <path d={nationD} fill={C.land} />
          <path d={statesD} fill="none" stroke={C.edge} strokeWidth={1.4 / zoom.s} />
          {centers > 0 ? (
            <g clipPath="url(#usclip)" opacity={centers}>
              {cells.map((c) => (
                <path key={c.id} d={c.d} fill={centerTint[c.id] ?? 'transparent'} stroke={C.cellLine} strokeWidth={2.4 / zoom.s} strokeDasharray={`${10 / zoom.s} ${6 / zoom.s}`} />
              ))}
            </g>
          ) : null}
          <path d={nationD} fill="none" stroke={C.outline} strokeWidth={2.6 / zoom.s} />
          {wires > 0 ? (
            <g opacity={wires}>
              {wiresD.map(([x1, y1, x2, y2], i) => {
                const broken = wireBroken > 0 && rnd(i + 3) < wireBroken;
                return <line key={i} x1={x1} y1={y1} x2={x1 + (x2 - x1) * Math.min(1, wires * 1.2)} y2={y1 + (y2 - y1) * Math.min(1, wires * 1.2)} stroke={broken ? '#c23b2b' : wireColor} strokeWidth={(broken ? 3 : 3.5) / zoom.s} strokeDasharray={broken ? `${6 / zoom.s} ${10 / zoom.s}` : undefined} opacity={broken ? 0.5 : 0.85} />;
              })}
            </g>
          ) : null}
          {centerLabels > 0 ? cells.map((c) => (
            <g key={c.id} opacity={centerLabels}>
              <circle cx={c.xy[0]} cy={c.xy[1]} r={7 / zoom.s} fill={C.label} />
              <text x={c.xy[0] + 12 / zoom.s} y={c.xy[1] + 6 / zoom.s} fontSize={20 / zoom.s} fontFamily="PlexMonoLocal, monospace" letterSpacing={2 / zoom.s} fill={C.label}>{c.name.toUpperCase()}</text>
            </g>
          )) : null}
          {airports > 0 ? US_AIRPORTS.map((a) => {
            const xy = projection(a.at); if (!xy) return null;
            const col = airportColor?.(a.code) ?? day.dot;
            return <circle key={a.code} cx={xy[0]} cy={xy[1]} r={6.5 / zoom.s} fill={col} stroke="#fff" strokeWidth={2.2 / zoom.s} opacity={airports} />;
          }) : null}
          {planes.map((pl) => {
            const xy = projection(pl.at), nx = projection(pl.next); if (!xy || !nx) return null;
            const hd = (Math.atan2(nx[0] - xy[0], -(nx[1] - xy[1])) * 180) / Math.PI;
            return <PlaneIcon key={pl.key} x={xy[0]} y={xy[1]} size={(traffic?.size ?? 26) / zoom.s} heading={hd} color={traffic?.color ?? C.plane} outline={night > 0.5 ? '#0c1626' : '#f6f0e2'} />;
          })}
          {children ? children(projection) : null}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
export const US_W = W;
export const US_H = H;
