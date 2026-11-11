import React from 'react';
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import { geoDistance } from 'd3-geo';
import { Globe, Camera } from '../../components/Globe';
import { GapField, GeoLine, PlaneIcon, Pin, Ruler, along, headingAt } from '../../components/Overlays';
import { IconCard, NeutralBg, Slam, Words } from '../../components/Neutral';
import { airports, byCode, worldAirports } from '../../data/airports';
import { keyed, ramp, window_ } from '../../anim';
import { makeCues } from '../../cues';
import { day, minutesToDegrees, theme } from '../../theme';
import { PilotJoke } from '../../components/Pilot';
import words from '../../data/v001/words.json';

type LL = [number, number];

/** Part 1: the hook and "what the circles are" (beats 1–25). Ends at "The story begins in 1953". */
export const Part1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const c = makeCues(words as any, fps);
  const s = (sec: number) => Math.round(sec * fps);

  // ---- cue frames ----
  const F = {
    twoEngines: c.at('two engines'),
    people: c.at('300 people'),
    thousands: c.at('thousands of kilometres'),
    noLand: c.at('There is no land'),
    circle: c.at('inside an invisible circle'),
    pilots: c.at('Pilots have'),
    etopsPhrase: c.at('Engines Turn'),
    realName: c.at('Its real name'),
    straight: c.at('straight line'),
    island: c.at('a tiny island'),
    reason: c.at('reason two engines'),
    anywhere: c.at('anywhere on Earth'),
    soHow: c.at('So how did'),
    imagine: c.at('Imagine every airport'),
    runway: c.at('A long enough runway'),
    fire: c.at('Fire crews'),
    somewhere: c.at('Somewhere for'),
    draw: c.at('Now draw'),
    howFar: c.at('how far the plane'),
    oneEngine: c.at('on just one engine'),
    stillAir: c.at('in still air'),
    those: c.at('Those circles are'),
    stayInside: c.at('stay inside them'),
    everyPoint: c.at('Every point'),
    europe: c.at('Over Europe'),
    oceans: c.at('out over the oceans'),
    nowhere: c.at('nowhere to go'),
    end: c.at('The story begins'),
  };

  // ---- camera ----
  const plane: LL = [-150, 31]; // camera target
  const drift = ramp(frame, F.twoEngines, F.pilots, (t) => t);
  const planePos: LL = [plane[0] - 2.4 * drift, plane[1] + 1.4 * drift]; // slow forward motion
  const HNL = byCode('HNL').at;
  const camera = keyed<Camera>(frame, [
    [0, { lon: -95, lat: 18, scale: 330 }],
    [F.twoEngines - s(0.4), { lon: -150, lat: 28, scale: 380 }],
    [F.twoEngines + s(1.4), { lon: plane[0], lat: plane[1], scale: 2600 }],
    [F.thousands, { lon: plane[0], lat: plane[1], scale: 2500 }],
    [F.thousands + s(2.2), { lon: -152, lat: 22, scale: 300 }],
    [F.pilots, { lon: -158, lat: 22, scale: 330 }],
    // straight line vs real route (Sydney → Santiago)
    [F.realName + s(2), { lon: -150, lat: -42, scale: 360 }],
    [F.straight, { lon: -150, lat: -42, scale: 360 }],
    // tiny island tease
    [F.island, { lon: -155, lat: 10, scale: 360 }],
    [F.island + s(1.6), { lon: -177.4, lat: 28.2, scale: 2400 }],
    [F.reason, { lon: -177.4, lat: 28.2, scale: 2200 }],
    [F.reason + s(2.2), { lon: -160, lat: 15, scale: 330 }],
    [F.soHow, { lon: -120, lat: 10, scale: 330 }],
    // every airport
    [F.imagine, { lon: -45, lat: 25, scale: 380 }],
    [F.draw + s(4), { lon: -25, lat: 30, scale: 400 }],
    [F.those, { lon: -30, lat: 38, scale: 420 }],
    [F.stayInside, { lon: -38, lat: 47, scale: 700 }],
    [F.europe, { lon: -35, lat: 48, scale: 760 }],
    [F.europe + s(2), { lon: 2, lat: 49, scale: 1050 }],
    [F.oceans, { lon: 1, lat: 49, scale: 1000 }],
    [F.oceans + s(2.4), { lon: -36, lat: 46, scale: 1050 }],
    [F.end, { lon: -37, lat: 46, scale: 1120 }],
  ]);

  // ---- what is on the globe in each stretch ----
  const inHook = frame < F.pilots;
  const inRoute = frame >= F.realName && frame < F.island + s(1);
  const inIsland = frame >= F.island && frame < F.anywhere;
  const inWorld = frame >= F.reason && frame < F.soHow + s(1);
  const inAirports = frame >= F.imagine;

  const dots: { airport: (typeof airports)[number]; appear: number; label?: boolean }[] = [];
  const circles: { airport: (typeof airports)[number]; minutes: number; appear: number; danger?: boolean }[] = [];

  if (inHook) {
    dots.push({ airport: byCode('HNL'), appear: ramp(frame, F.circle - s(0.4), F.circle + s(0.4)), label: true });
    circles.push({ airport: byCode('HNL'), minutes: 180, appear: ramp(frame, F.circle, F.circle + s(1.4)) });
  }
  if (inWorld) {
    worldAirports.forEach((a, i) =>
      circles.push({ airport: a, minutes: 150, appear: ramp(frame, F.anywhere + (i % 12) * 2, F.anywhere + s(1.2) + (i % 12) * 2) * (1 - ramp(frame, F.soHow, F.soHow + s(0.6))) })
    );
  }
  // circle size in the "airports" chapter: 90 min (so oceans show gaps)
  const atlanticSet = ['BOS', 'JFK', 'YYT', 'YQX', 'BGSF', 'KEF', 'SNN', 'LHR', 'CDG', 'LIS', 'TER', 'BDA'];
  if (inAirports) {
    worldAirports.forEach((a, i) => {
      const appear = ramp(frame, F.imagine + (i * 3) % s(3.5), F.imagine + (i * 3) % s(3.5) + s(0.6));
      dots.push({ airport: a, appear });
      circles.push({ airport: a, minutes: 90, appear: ramp(frame, F.draw + (i * 2) % s(2.4), F.draw + (i * 2) % s(2.4) + s(1)) });
    });
  }

  // Atlantic crossing JFK → LHR
  const crossing: LL[] = [byCode('JFK').at, byCode('LHR').at];
  const crossT = ramp(frame, F.stayInside - s(0.5), F.europe - s(0.3));
  const crossPos = along(crossing, crossT);
  const r90 = (minutesToDegrees(90) * Math.PI) / 180;
  const nearest = worldAirports.reduce((best, a) => (geoDistance(a.at, crossPos) < geoDistance(best.at, crossPos) ? a : best), worldAirports[0]);

  const pulse = 0.5 + 0.5 * Math.sin((frame / fps) * Math.PI * 2.5);
  const isDay = frame >= F.realName ? 1 : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: isDay ? day.mapBg : theme.bg }}>
      <Globe width={width} height={height} camera={camera} dots={dots} circles={circles} day={isDay} landDim={inAirports ? ramp(frame, F.those, F.those + s(1.5)) * 0.85 : 0}>
        {(projection) => (
          <>
            {/* HOOK: the plane over the Pacific */}
            {inHook && (() => {
              const p = projection(planePos);
              if (!p) return null;
              return (
                <>
                  <PlaneIcon x={p[0]} y={p[1]} size={interpolate(camera.scale, [300, 2600], [26, 120])} heading={-60} glow={0.6 + 0.4 * ramp(frame, F.twoEngines, F.twoEngines + s(0.6))} />
                  <Ruler projection={projection} a={planePos} b={[-124.2, 40.8]} label="≈ 2,500 km to land" progress={ramp(frame, F.thousands + s(1.6), F.thousands + s(3))} />
                </>
              );
            })()}

            {/* straight line vs actual route */}
            {inRoute && (
              <>
                <GeoLine projection={projection} points={[byCode('SYD').at, byCode('SCL').at]} progress={ramp(frame, F.straight - s(1), F.straight + s(0.6))} color={day.text} dashed width={3} opacity={0.7} />
                <GeoLine projection={projection} points={[byCode('SYD').at, [-178, -30], [-140, -28], [-105, -32], byCode('SCL').at]} progress={ramp(frame, F.straight + s(0.4), F.straight + s(1.8))} color={day.circle} width={5} />
                <Pin projection={projection} at={byCode('SYD').at} label="SYDNEY" color={day.text} halo={day.land} dot={day.dot} opacity={ramp(frame, F.realName + s(1.5), F.realName + s(2))} />
                <Pin projection={projection} at={byCode('SCL').at} label="SANTIAGO" color={day.text} halo={day.land} dot={day.dot} opacity={ramp(frame, F.realName + s(1.5), F.realName + s(2))} />
              </>
            )}

            {/* tiny island tease */}
            {inIsland && (() => {
              const p = projection(byCode('MDY').at);
              if (!p) return null;
              const o = ramp(frame, F.island + s(1.2), F.island + s(1.8)) * (1 - ramp(frame, F.reason + s(1), F.reason + s(1.6)));
              return (
                <g opacity={o}>
                  <circle cx={p[0]} cy={p[1]} r={14 + 10 * pulse} fill="none" stroke={day.dot} strokeWidth={3} />
                  <circle cx={p[0]} cy={p[1]} r={7} fill={day.dot} />
                  <text x={p[0]} y={p[1] - 50} textAnchor="middle" fill={day.text} fontFamily={theme.fontSerif} fontStyle="italic" fontSize={120}>?</text>
                </g>
              );
            })()}

            {/* Atlantic crossing that stays inside circles */}
            {inAirports && frame >= F.stayInside - s(0.6) && frame < F.oceans && (() => {
              const p = projection(crossPos);
              const n = projection(nearest.at);
              const o = 1 - ramp(frame, F.europe + s(0.5), F.europe + s(1.2));
              return (
                <g opacity={o}>
                  <GeoLine projection={projection} points={crossing} progress={crossT} color={day.text} width={3} />
                  {n && p && frame >= F.everyPoint ? (
                    <line x1={p[0]} y1={p[1]} x2={n[0]} y2={n[1]} stroke={day.text} strokeWidth={2.5} strokeDasharray="8 8" opacity={ramp(frame, F.everyPoint, F.everyPoint + s(0.4))} />
                  ) : null}
                  {worldAirports.filter((a) => geoDistance(a.at, crossPos) <= r90).map((a) => {
                    const q = projection(a.at);
                    return q ? <circle key={a.code} cx={q[0]} cy={q[1]} r={12} fill="none" stroke={day.dot} strokeWidth={4} /> : null;
                  })}
                  {p ? <PlaneIcon x={p[0]} y={p[1]} size={40} heading={headingAt(projection, crossing, crossT)} /> : null}
                </g>
              );
            })()}

            {/* the real gaps over the Atlantic */}
            {inAirports && (
              <GapField
                projection={projection}
                centers={worldAirports.map((a) => a.at)}
                minutes={90}
                bbox={[-65, -5, 22, 66]}
                opacity={ramp(frame, F.oceans + s(1.4), F.oceans + s(2.6))}
                pulse={frame >= F.nowhere ? pulse : 0}
              />
            )}
          </>
        )}
      </Globe>

      {/* stopwatch: "no land beneath it for hours" */}
      {inHook && (
        <div style={{ position: 'absolute', top: 60, right: 70, opacity: window_(frame, F.noLand, F.circle, 8) }}>
          <Clock hours={interpolate(frame, [F.noLand, F.circle], [0, 5], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })} />
        </div>
      )}
      {/* counter "300 people" */}
      {inHook && (
        <div style={{ position: 'absolute', left: width / 2 + 90, top: height / 2 - 150, opacity: window_(frame, F.people, F.thousands + s(0.6), 6), fontFamily: theme.fontDisplay, color: theme.text }}>
          <div style={{ fontSize: 120, color: theme.amber, fontFamily: theme.fontSerif }}>{Math.round(interpolate(frame, [F.people, F.people + s(0.8)], [0, 300], { extrapolateRight: 'clamp' }))}</div>
          <div style={{ fontFamily: theme.fontMono, fontSize: 28, letterSpacing: '0.2em', textTransform: 'uppercase' }}>people on board</div>
        </div>
      )}

      {/* runway / fire crews / somewhere to go */}
      {inAirports && frame < F.draw + s(2) && (
        <div style={{ position: 'absolute', left: 70, top: 300, display: 'flex', flexDirection: 'column', gap: 26, padding: 30, borderRadius: 24, background: 'rgba(246,240,226,0.92)', boxShadow: '0 8px 30px rgba(29,35,48,0.15)', opacity: 1 - ramp(frame, F.draw + s(1), F.draw + s(2)) }}>
          <IconCard light kind="runway" label="A long runway" appear={ramp(frame, F.runway, F.runway + s(0.4))} />
          <IconCard light kind="fire" label="Fire crews" appear={ramp(frame, F.fire, F.fire + s(0.4))} />
          <IconCard light kind="terminal" label="Somewhere to go" appear={ramp(frame, F.somewhere, F.somewhere + s(0.4))} />
        </div>
      )}

      {/* NOWHERE TO GO label */}
      {inAirports && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: height * 0.5 + 40, textAlign: 'center', fontFamily: theme.fontSerif, fontStyle: 'italic', fontSize: 96, color: day.danger, opacity: ramp(frame, F.nowhere + s(0.3), F.nowhere + s(0.9)), textShadow: `0 0 18px ${day.land}, 0 0 4px ${day.land}` }}>
          Nowhere to go
        </div>
      )}


      {/* ---------- neutral-background moments ---------- */}
      <Sequence from={F.pilots} durationInFrames={F.realName - F.pilots}>
        <PilotJoke zoomOutAt={s(0.9)} balloonAt={c.at('They say') - F.pilots} phraseAt={F.etopsPhrase - F.pilots} phrase={['Engines', 'turn,', 'or', 'passengers', 'swim!']} />
      </Sequence>
      <Sequence from={F.realName} durationInFrames={s(2)}>
        <NeutralBg beige>
          <Slam text="ETOPS" color={day.circle} size={240} sub="Extended-range Twin-engine Operations" subColor={day.text} />
        </NeutralBg>
      </Sequence>
      <Sequence from={F.soHow} durationInFrames={F.imagine - F.soHow - s(1.6)}>
        <SplitThenNow />
      </Sequence>
      <Sequence from={F.imagine - s(1.6)} durationInFrames={s(1.6)}>
        <NeutralBg beige>
          <Slam text={<>The invisible <span style={{ fontStyle: 'italic', color: day.circle }}>circles</span></>} size={150} color={day.text} />
        </NeutralBg>
      </Sequence>
      <Sequence from={F.howFar} durationInFrames={F.those - F.howFar}>
        <Formula oneEngineAt={F.oneEngine - F.howFar} stillAirAt={F.stillAir - F.howFar} />
      </Sequence>
    </AbsoluteFill>
  );
};

/** Split screen: 1953 (small circles, ocean closed to twins) vs today (huge circles). */
const SplitThenNow: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, height, width } = useVideoConfig();
  const atl = ['BOS', 'JFK', 'YYT', 'YQX', 'BGSF', 'KEF', 'SNN', 'LHR', 'CDG', 'LIS', 'TER', 'BDA'].map(byCode);
  const today = ['JFK', 'LHR', 'KEF'].map(byCode);
  const panel = (label: string, minutes: number, camera: Camera, sub: string, set = atl) => (
    <div style={{ position: 'relative', width: width / 2, height, overflow: 'hidden', borderRight: `4px solid ${day.bg}` }}>
      <Globe day={1} width={width / 2} height={height} camera={camera} circles={set.map((a) => ({ airport: a, minutes, appear: ramp(frame, fps * 0.3, fps * 1.4) }))} dots={set.map((a) => ({ airport: a, appear: 1 }))} landDim={0.4} />
      <div style={{ position: 'absolute', top: 60, width: '100%', textAlign: 'center', fontFamily: theme.fontSerif, fontSize: 96, color: day.text }}>{label}</div>
      <div style={{ position: 'absolute', top: 170, width: '100%', textAlign: 'center', fontFamily: theme.fontMono, fontSize: 30, letterSpacing: '0.18em', textTransform: 'uppercase', color: day.text }}>{sub}</div>
    </div>
  );
  return (
    <AbsoluteFill style={{ flexDirection: 'row', opacity: ramp(frame, 0, 8) }}>
      {panel('1953', 60, { lon: -35, lat: 45, scale: 620 }, '60 minutes')}
      {panel('TODAY', 370, { lon: -35, lat: 40, scale: 330 }, 'up to 370 minutes', today)}
    </AbsoluteFill>
  );
};

/** time × one-engine speed = radius */
const Formula: React.FC<{ oneEngineAt: number; stillAirAt: number }> = ({ oneEngineAt, stillAirAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const part = (i: number) => ramp(frame, i * fps * 0.45, i * fps * 0.45 + 8);
  const item = (text: string, i: number, color: string = day.text) => (
    <span style={{ opacity: part(i), transform: `translateY(${(1 - part(i)) * 24}px)`, display: 'inline-block', color }}>{text}</span>
  );
  return (
    <NeutralBg beige>
      <div style={{ fontFamily: theme.fontSerif, fontSize: 88, display: 'flex', gap: 36, alignItems: 'center' }}>
        {item('Time', 0)} {item('×', 1, day.textMuted)} {item('one-engine speed', 2, day.circle)} {item('=', 3, day.textMuted)} {item('radius', 4)}
      </div>
      <div style={{ position: 'absolute', bottom: 210, display: 'flex', gap: 120, alignItems: 'center' }}>
        <svg width={220} height={220} viewBox="-110 -110 220 220" style={{ opacity: ramp(frame, oneEngineAt, oneEngineAt + 8) }}>
          <PlaneIcon x={0} y={0} size={190} engineOut />
        </svg>
        <div style={{ fontFamily: theme.fontMono, fontSize: 34, letterSpacing: '0.15em', textTransform: 'uppercase', color: day.textMuted, opacity: ramp(frame, stillAirAt, stillAirAt + 8) }}>
          <span style={{ textDecoration: 'line-through' }}>wind</span> → still air
        </div>
      </div>
    </NeutralBg>
  );
};

/** small stopwatch showing hours */
const Clock: React.FC<{ hours: number }> = ({ hours }) => {
  const a = ((hours % 1) * 360 * Math.PI) / 180;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '16px 26px', borderRadius: 20, background: 'rgba(20,34,54,0.8)', border: `2px solid ${theme.landEdge}` }}>
      <svg width={80} height={80} viewBox="-40 -40 80 80">
        <circle r={34} fill="none" stroke={theme.amber} strokeWidth={4} />
        <line x1={0} y1={0} x2={Math.sin(a) * 26} y2={-Math.cos(a) * 26} stroke={theme.amber} strokeWidth={4} strokeLinecap="round" />
        <circle r={4} fill={theme.amber} />
      </svg>
      <div style={{ fontFamily: theme.fontSerif, fontSize: 60, color: theme.text }}>{Math.floor(hours)} h</div>
    </div>
  );
};
