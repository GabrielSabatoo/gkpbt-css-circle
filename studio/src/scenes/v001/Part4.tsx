import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { Globe } from '../../components/Globe';
import { GapField, GeoLine, PlaneIcon, Pin, along, headingAt } from '../../components/Overlays';
import { AircraftSide, Bars, InfoCard, Label, MinutesBadge, Paper, Stamp, Title } from '../../components/Kit';
import { byCode } from '../../data/airports';
import { keyed, ramp } from '../../anim';
import { day, minutesToDegrees, theme } from '../../theme';
import { geoCircle, geoPath } from 'd3-geo';
import { Segments, useCues } from './shared';

type LL = [number, number];
const SOUTH = ['SYD', 'MEL', 'BNE', 'PER', 'AKL', 'CHC', 'NOU', 'NAN', 'PPT', 'IPC', 'SCL', 'PUQ', 'USH', 'EZE', 'GRU', 'CPT', 'JNB', 'MRU', 'LIM'].map((c) => byCode(c));
const PAC = ['SFO', 'LAX', 'SEA', 'YVR', 'ANC', 'CDB', 'HNL', 'MDY', 'AWK', 'GUM', 'NRT', 'KIX', 'CTS', 'ICN', 'PVG', 'TPE', 'HKG', 'MNL', 'MAJ', 'NAN', 'PPT', 'AKL', 'SYD', 'BNE', 'PKC', 'FAI', 'POM', 'NOU'].map((c) => byCode(c));

/** Part 4 (≈7:06–end): today's limits, Sydney–Santiago, outro, end screen. Absolute frames. */
export const Part4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const c = useCues();
  const s = (x: number) => Math.round(x * fps);

  const F = {
    start: c.at('Today, the circles'),
    since2007: c.at('Since 2007'),
    twins: c.at("but it's the twins"),
    a350: c.at('In 2014'),
    sixHours: c.at('more than six hours'),
    radius: c.at('a circle with a radius'),
    b787: c.at('The Boeing 787'),
    remote: c.at('And that is what made'),
    qantas: c.at('Qantas flies'),
    bend: c.at('can bend far'),
    boeing: c.at('Boeing itself said'),
    bigCircles: c.at('With circles that big'),
    corners: c.at('just a few corners'),
    heart: c.at('like the heart'),
    nextTime: c.at('So the next time'),
    notLost: c.at("it isn't lost"),
    threading: c.at("It's threading"),
    runway: c.at('each one built around'),
    enginesTurn: c.at('Engines turn', c.sec("It's threading")),
    swim: c.at("Passengers don't swim"),
    beneath: c.at('And somewhere beneath you'),
    justInCase: c.at('Just in case'),
    voiceEnd: c.end('Just in case'),
  };
  const endScreen = F.voiceEnd + s(1.5);
  const pulse = 0.5 + 0.5 * Math.sin((frame / fps) * Math.PI * 2.5);

  const barsRows = (local0: number) => [
    { label: '1953 · twins', value: 60, at: 0, color: day.textMuted },
    { label: '1985 · twins', value: 120, at: 6, color: day.textMuted },
    { label: '1995 · Boeing 777', value: 180, at: 12, color: day.textMuted },
    ...(frame >= F.b787 ? [{ label: 'Boeing 787', value: 330, at: F.b787 - local0, color: day.circle }] : []),
    ...(frame >= F.a350 ? [{ label: 'Airbus A350 · 2014', value: 370, at: F.a350 + s(2.2) - local0, color: day.circle }] : []),
  ];

  // south-pole globe for Sydney → Santiago and "the heart of Antarctica"
  const southGlobe = (mode: 'route' | 'cover') => {
    const cam =
      mode === 'route'
        ? keyed(frame, [
            [F.remote, { lon: -150, lat: -40, scale: 470 }],
            [F.qantas + s(1), { lon: -160, lat: -62, scale: 470 }],
          ])
        : keyed(frame, [
            [F.bigCircles, { lon: -150, lat: -65, scale: 470 }],
            [F.heart, { lon: 20, lat: -85, scale: 470 }],
            [F.heart + s(1.6), { lon: 30, lat: -86, scale: 780 }],
          ]);
    const route: LL[] = [byCode('SYD').at, [168, -58], [-160, -70], [-115, -66], byCode('SCL').at];
    const t = ramp(frame, F.qantas + s(0.6), F.boeing - s(0.4));
    return (
      <Globe width={width} height={height} camera={cam} day={1}
        dots={SOUTH.map((a) => ({ airport: a, appear: 1 }))}
        circles={mode === 'cover' ? SOUTH.map((a) => ({ airport: a, minutes: 330, appear: ramp(frame, F.bigCircles, F.bigCircles + s(1.4)) })) : []}>
        {(projection) => {
          const p = projection(along(route, t));
          return mode === 'route' ? (
            <>
              <GeoLine projection={projection} points={[byCode('SYD').at, byCode('SCL').at]} progress={1} color={day.coral} dashed width={3} opacity={0.6} />
              <GeoLine projection={projection} points={route} progress={t} color={day.circle} width={5} />
              <Pin projection={projection} at={byCode('SYD').at} label="Sydney" color={day.text} halo={day.land} dot={day.dot} />
              <Pin projection={projection} at={byCode('SCL').at} label="Santiago" color={day.text} halo={day.land} dot={day.dot} />
              {p && t > 0 ? <PlaneIcon x={p[0]} y={p[1]} size={60} heading={headingAt(projection, route, Math.max(0.02, t))} /> : null}
            </>
          ) : (
            <GapField projection={projection} centers={SOUTH.map((a) => a.at)} minutes={330} bbox={[-180, 180, -90, -55]} step={1.8} includeLand opacity={ramp(frame, F.corners, F.corners + s(0.8))} pulse={pulse} />
          );
        }}
      </Globe>
    );
  };

  // outro: a Pacific crossing that threads through circles
  const outroGlobe = () => {
    const route: LL[] = [byCode('NRT').at, [160, 46], [-175, 50], [-158, 50], byCode('SFO').at];
    const t = ramp(frame, F.nextTime + s(1), F.runway + s(2), (x) => x);
    const lit = (a: (typeof PAC)[number]) => {
      const pos = along(route, t);
      const d = Math.hypot(a.at[0] - pos[0], a.at[1] - pos[1]);
      return frame >= F.threading && d < 25;
    };
    return (
      <Globe width={width} height={height} camera={keyed(frame, [[F.nextTime, { lon: 175, lat: 38, scale: 520 }], [F.runway, { lon: 190, lat: 42, scale: 560 }]])} day={1}
        dots={PAC.map((a) => ({ airport: a, appear: 1 }))}
        circles={frame >= F.threading ? PAC.map((a) => ({ airport: a, minutes: 180, appear: ramp(frame, F.threading, F.threading + s(1)) })) : []}>
        {(projection) => {
          const p = projection(along(route, t));
          return (
            <>
              <GeoLine projection={projection} points={[byCode('NRT').at, byCode('SFO').at]} progress={1} color={day.coral} dashed width={3} opacity={frame < F.notLost ? 0.8 : 0.3} />
              <GeoLine projection={projection} points={route} progress={t} color={day.circle} width={5} />
              {PAC.filter(lit).map((a) => (
                <path key={a.code} d={geoPath(projection)(geoCircle().center(a.at).radius(minutesToDegrees(180))()) ?? undefined} fill="none" stroke={day.gold} strokeWidth={5} />
              ))}
              {p ? <PlaneIcon x={p[0]} y={p[1]} size={62} heading={headingAt(projection, route, Math.max(0.02, t))} /> : null}
            </>
          );
        }}
      </Globe>
    );
  };

  const segs = [
    { from: F.start, to: F.since2007, render: () => (
      <Paper>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 60 }}>
          <Title pre="Today, the circles have " accent="grown" size={96} />
          <Bars title="Max time to an airport on one engine" max={370} width={1300} rows={barsRows(F.start)} />
        </AbsoluteFill>
      </Paper>
    ) },
    { from: F.since2007, to: F.a350, render: () => (
      <Paper>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 50 }}>
          <div style={{ display: 'flex', gap: 80, alignItems: 'flex-end', opacity: frame >= F.twins ? 0.35 : 1 }}>
            <AircraftSide engines={3} width={560} label="Three engines" />
            <AircraftSide engines={4} width={620} label="Four engines" />
          </div>
          {frame >= F.twins ? <AircraftSide engines={2} width={760} label="But the twins push the limits" /> : null}
        </AbsoluteFill>
        <InfoCard head="2007" lines={['3- and 4-engine passenger jets', 'ETOPS rules beyond 180 min']} width={520} style={{ left: 70, top: 70 }} />
      </Paper>
    ) },
    { from: F.a350, to: F.radius, render: (l: number) => (
      <Paper>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 50 }}>
          <AircraftSide engines={2} width={820} label="Airbus A350 · EASA · 2014" />
          {frame >= F.sixHours ? <Title pre="More than " accent="six hours" post=" on one engine" size={84} /> : <Title accent="370 minutes" size={110} />}
        </AbsoluteFill>
        <MinutesBadge minutes={interpolate(ramp(frame, F.a350, F.a350 + s(2)), [0, 1], [180, 370])} />
      </Paper>
    ) },
    { from: F.radius, to: F.b787, render: () => (
      <>
        <Globe width={width} height={height} camera={{ lon: -165, lat: 10, scale: 470 }} day={1} dots={[{ airport: byCode('HNL'), appear: 1, label: true }]} circles={[{ airport: byCode('HNL'), minutes: 370, appear: ramp(frame, F.radius, F.radius + s(1.6)) }]} />
        <InfoCard head="2,500 nm" lines={['Radius of a 370-minute circle']} width={460} style={{ left: 70, bottom: 80 }} />
        <MinutesBadge minutes={370} />
      </>
    ) },
    { from: F.b787, to: F.remote, render: () => (
      <Paper>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Bars title="Max time to an airport on one engine" max={370} width={1300} rows={[
            { label: '1995 · Boeing 777', value: 180, at: 0, color: day.textMuted },
            { label: 'Boeing 787', value: 330, at: 6, color: day.circle },
            { label: 'Airbus A350', value: 370, at: 12, color: day.circle },
          ]} />
        </AbsoluteFill>
        <MinutesBadge minutes={330} />
      </Paper>
    ) },
    { from: F.remote, to: F.boeing, render: () => (
      <>
        {southGlobe('route')}
        {frame >= F.qantas ? <InfoCard head="Sydney → Santiago" lines={['Qantas · Boeing 787', 'Track can bend toward Antarctica']} width={560} style={{ left: 70, bottom: 80 }} /> : null}
        <MinutesBadge minutes={330} />
      </>
    ) },
    { from: F.boeing, to: F.bigCircles, render: () => (
      <Paper>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ width: 1200, padding: '50px 70px', background: '#f3ecd8', border: `2px solid ${day.text}`, outline: `1.5px solid ${day.text}`, outlineOffset: 8, textAlign: 'center' }}>
            <div style={{ fontFamily: theme.fontSerif, fontSize: 66, color: day.text, lineHeight: 1.2 }}>
              “The Sydney–Santiago route is <span style={{ fontStyle: 'italic', color: day.danger }}>not possible</span> with 180-minute ETOPS.”
            </div>
            <Label size={24} color={day.textMuted} style={{ marginTop: 30 }}>Boeing, to Australian Aviation</Label>
          </div>
        </AbsoluteFill>
      </Paper>
    ) },
    { from: F.bigCircles, to: F.nextTime, render: () => (
      <>
        {southGlobe('cover')}
        <MinutesBadge minutes={330} />
        {frame >= F.heart ? (
          <div style={{ position: 'absolute', top: 54, left: 0, right: 0, textAlign: 'center' }}>
            <Title pre="The heart of " accent="Antarctica" accentColor={day.danger} size={84} />
          </div>
        ) : null}
      </>
    ) },
    { from: F.nextTime, to: F.enginesTurn, render: () => (
      <>
        {outroGlobe()}
        {frame >= F.notLost && frame < F.threading ? <Stamp text="Not lost" color={day.circle} delay={F.notLost - F.nextTime} style={{ right: 160, top: 140 }} /> : null}
        {frame >= F.runway ? (
          <div style={{ position: 'absolute', right: 56, top: 300, width: 400, padding: '26px 34px', background: '#f3ecd8', border: `2px solid ${day.text}`, outline: `1.5px solid ${day.text}`, outlineOffset: 7 }}>
            <Label size={22} color={day.circle}>Each circle is</Label>
            {['A runway', 'A fire crew', 'A safe place to land'].map((t, i) => (
              <div key={t} style={{ fontFamily: theme.fontSerif, fontSize: 52, color: day.text, marginTop: 14, opacity: ramp(frame, F.runway + s(0.6) + i * s(0.7), F.runway + s(0.9) + i * s(0.7)) }}>{t}</div>
            ))}
          </div>
        ) : null}
      </>
    ) },
    { from: F.enginesTurn, to: F.beneath, render: () => (
      <Paper>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 30 }}>
          <Title pre="Engines " accent="turn." size={130} />
          {frame >= F.swim ? <Title pre="Passengers don't " accent="swim." size={130} accentColor={day.danger} /> : null}
        </AbsoluteFill>
      </Paper>
    ) },
    { from: F.beneath, to: endScreen, fade: 14, render: () => {
      const cam = keyed(frame, [[F.beneath, { lon: -165, lat: 24, scale: 450 }], [F.justInCase, { lon: -177.38, lat: 28.2, scale: 2600 }]]);
      const fadeOut = ramp(frame, F.voiceEnd + s(0.3), endScreen);
      return (
        <AbsoluteFill style={{ opacity: 1 - fadeOut * 0.0 }}>
          <Globe width={width} height={height} camera={cam} day={0}>
            {(projection) => {
              const p = projection(byCode('MDY').at);
              return p ? (
                <g>
                  <circle cx={p[0]} cy={p[1]} r={30 + 18 * pulse} fill={theme.amber} opacity={0.18 + 0.2 * pulse} />
                  <circle cx={p[0]} cy={p[1]} r={8} fill={theme.amber} />
                </g>
              ) : null;
            }}
          </Globe>
          {frame >= F.justInCase ? (
            <div style={{ position: 'absolute', bottom: 120, left: 0, right: 0, textAlign: 'center' }}>
              <Title pre="Just in " accent="case." size={110} color={theme.text} accentColor={theme.amber} />
            </div>
          ) : null}
          <AbsoluteFill style={{ backgroundColor: '#000', opacity: fadeOut }} />
        </AbsoluteFill>
      );
    } },
    { from: endScreen, to: durationInFrames, fade: 20, render: () => (
      <Paper>
        <div style={{ position: 'absolute', top: 120, left: 0, right: 0, textAlign: 'center' }}>
          <Title pre="The invisible " accent="circles" size={90} />
          <Label size={24} color={day.textMuted} style={{ marginTop: 18 }}>Thanks for watching</Label>
        </div>
        {/* space reserved for YouTube end-screen elements */}
        <div style={{ position: 'absolute', left: 260, top: 400, width: 640, height: 360, border: `2px dashed rgba(29,35,48,0.18)` }} />
        <div style={{ position: 'absolute', right: 260, top: 400, width: 640, height: 360, border: `2px dashed rgba(29,35,48,0.18)` }} />
      </Paper>
    ) },
  ];

  if (frame < F.start) return null;
  return (
    <AbsoluteFill style={{ backgroundColor: day.bg }}>
      <Segments segs={segs} />
    </AbsoluteFill>
  );
};
