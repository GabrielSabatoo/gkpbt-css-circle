import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { geoDistance } from 'd3-geo';
import { Globe } from '../../components/Globe';
import { GapField, GeoLine, PlaneIcon, Pin, Ruler, along, headingAt } from '../../components/Overlays';
import { Altimeter, BigNumber, Checklist, InfoCard, Label, MinutesBadge, Paper, Stamp, Title } from '../../components/Kit';
import { byCode, worldAirports } from '../../data/airports';
import { keyed, ramp } from '../../anim';
import { day, minutesToDegrees, theme } from '../../theme';
import { Segments, useCues } from './shared';

type LL = [number, number];
const PAC = ['SFO', 'LAX', 'SEA', 'YVR', 'ANC', 'CDB', 'HNL', 'MDY', 'AWK', 'GUM', 'NRT', 'KIX', 'CTS', 'ICN', 'PVG', 'TPE', 'HKG', 'MNL', 'MAJ', 'NAN', 'PPT', 'AKL', 'SYD', 'BNE', 'PKC', 'FAI', 'POM', 'NOU'].map((c) => byCode(c));
const ATL = ['BOS', 'JFK', 'YYT', 'YQX', 'BGSF', 'KEF', 'SNN', 'LHR', 'CDG', 'LIS', 'TER', 'BDA', 'YUL', 'YYZ', 'MAD'].map((c) => byCode(c));

/** Part 3 (≈4:12–7:06): is it safe → engine out → Midway → Air Transat. Absolute frames. */
export const Part3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const c = useCues();
  const s = (x: number) => Math.round(x * fps);

  const F = {
    start: c.at('Now, this is the part'),
    twoHours: c.at('three hours from land'),
    safe: c.at('Is that really safe'),
    answer: c.at('The answer is'),
    shut: c.at('no more than twice'),
    modern: c.at('Modern engines do'),
    ge: c.at('General Electric says'),
    roughly: c.at('roughly one in every'),
    perspective: c.at('To put that in perspective'),
    years: c.at('would take about'),
    only: c.at("And ETOPS isn't only"),
    fuel: c.at('carry enough fuel'),
    fire: c.at('Its fire protection'),
    maintained: c.at('maintained to a stricter'),
    question: c.at('Every part of the system'),
    canWe: c.at('Can we get everyone'),
    whatHappens: c.at('So what actually happens'),
    notFall: c.at('does not fall'),
    designed: c.at('designed to fly safely'),
    descends: c.at('The crew descends'),
    turns: c.at('and turns towards'),
    brings: c.at('Which brings us'),
    neverHeard: c.at("Runways you've probably"),
    likeThis: c.at('Like this one'),
    speck: c.at('A speck of sand'),
    noScheduled: c.at('There are no scheduled'),
    united: c.at('And yet United'),
    in2026: c.at('In 2026'),
    repairs: c.at('The runway needs'),
    keepOpen: c.at('please keep it open'),
    holes: c.at('Without it'),
    sometimes: c.at('And sometimes, being inside'),
    august: c.at('In August'),
    leak: c.at('when a fuel leak'),
    oneStop: c.at('One engine stopped'),
    other: c.at('Then the other'),
    glided: c.at('The crew glided'),
    landed: c.at('and landed at'),
    survived: c.at('All 306'),
    wasnt: c.at("It wasn't the kind"),
    end: c.at('Today, the circles'),
  };
  const pulse = 0.5 + 0.5 * Math.sin((frame / fps) * Math.PI * 2.5);

  // ---- engine-out over the Pacific ----
  const enginePlane: LL = [-168, 34];
  const engineOutScene = () => {
    const cam = keyed(frame, [
      [F.whatHappens, { lon: -165, lat: 30, scale: 560 }],
      [F.turns, { lon: -170, lat: 31, scale: 900 }],
      [F.brings, { lon: -170, lat: 25, scale: 760 }],
    ]);
    const nearest = byCode('MDY');
    const tTurn = ramp(frame, F.turns, F.brings);
    const path: LL[] = [enginePlane, nearest.at];
    const pos = frame < F.turns ? enginePlane : along(path, tTurn * 0.7);
    return (
      <Globe width={width} height={height} camera={cam} day={1} dots={PAC.map((a) => ({ airport: a, appear: 1 }))} circles={PAC.map((a) => ({ airport: a, minutes: 180, appear: 1 }))}>
        {(projection) => {
          const p = projection(pos);
          const n = projection(nearest.at);
          return (
            <>
              {frame >= F.turns && n && p ? <GeoLine projection={projection} points={path} progress={tTurn} color={day.coral} width={4} dashed /> : null}
              {p ? <PlaneIcon x={p[0]} y={p[1]} size={84} heading={frame < F.turns ? 80 : headingAt(projection, path, Math.max(0.02, tTurn * 0.7))} engineOut={frame >= F.whatHappens + s(1.4)} /> : null}
              {frame >= F.turns ? <Pin projection={projection} at={nearest.at} label="Nearest runway" color={day.text} halo={day.land} dot={day.dot} /> : null}
            </>
          );
        }}
      </Globe>
    );
  };

  // ---- Midway ----
  const midwayScene = (mode: 'zoom' | 'holes') => {
    const cam =
      mode === 'zoom'
        ? keyed(frame, [
            [F.brings, { lon: -165, lat: 25, scale: 500 }],
            [F.likeThis, { lon: -170, lat: 26, scale: 520 }],
            [F.likeThis + s(1.8), { lon: -172, lat: 25, scale: 1500 }],
            [F.noScheduled, { lon: -173, lat: 25.5, scale: 1650 }],
          ])
        : { lon: -170, lat: 25, scale: 560 };
    const remote = ['MDY', 'AWK', 'CDB', 'MAJ'].map((x) => byCode(x));
    const midwayGone = mode === 'holes' ? ramp(frame, F.holes, F.holes + s(1.2)) : 0;
    const circles = PAC.map((a) => ({ airport: a, minutes: 180, appear: a.code === 'MDY' ? 1 - midwayGone : 1 }));
    const centers = PAC.filter((a) => !(mode === 'holes' && a.code === 'MDY' && midwayGone > 0.5)).map((a) => a.at);
    return (
      <Globe width={width} height={height} camera={cam} day={1} dots={PAC.map((a) => ({ airport: a, appear: 1 }))} circles={mode === 'holes' ? circles : []}>
        {(projection) => (
          <>
            {mode === 'zoom' && frame < F.likeThis
              ? remote.map((a, i) => {
                  const q = projection(a.at);
                  const o = ramp(frame, F.neverHeard + i * 6, F.neverHeard + i * 6 + 8);
                  return q ? <circle key={a.code} cx={q[0]} cy={q[1]} r={16 + 10 * pulse} fill="none" stroke={day.dot} strokeWidth={4} opacity={o} /> : null;
                })
              : null}
            {mode === 'zoom' && frame >= F.likeThis ? (
              <>
                <Pin projection={projection} at={byCode('MDY').at} label="Midway Atoll" color={day.text} halo={day.land} dot={day.dot} size={30} />
                {frame >= F.speck ? <Pin projection={projection} at={byCode('HNL').at} label="Honolulu" color={day.text} halo={day.land} dot={day.dot} /> : null}
                {frame >= F.speck ? <Ruler projection={projection} a={byCode('MDY').at} b={byCode('HNL').at} label="2,000+ KM" progress={ramp(frame, F.speck + s(1), F.speck + s(2.4))} /> : null}
              </>
            ) : null}
            {mode === 'holes' ? (
              <GapField projection={projection} centers={centers} minutes={180} bbox={[150, 210, 5, 45]} step={1.2} opacity={ramp(frame, F.holes + s(0.8), F.holes + s(1.6))} pulse={pulse} />
            ) : null}
          </>
        )}
      </Globe>
    );
  };

  // ---- Air Transat (night) ----
  const transatScene = () => {
    const cam = keyed(frame, [
      [F.august, { lon: -40, lat: 42, scale: 620 }],
      [F.leak + s(1), { lon: -36, lat: 41, scale: 760 }],
      [F.other, { lon: -30, lat: 39.8, scale: 2200 }],
      [F.glided, { lon: -28.2, lat: 39.1, scale: 22000 }],
      [F.landed, { lon: -27.6, lat: 38.85, scale: 30000 }],
    ]);
    const route: LL[] = [byCode('YYZ').at, byCode('LIS').at];
    const lajes = byCode('TER').at;
    // cruise along the route, divert toward Lajes after the leak; glide the last ~120 km (65 nm)
    const divStart = along(route, 0.55);
    const divert: LL[] = [divStart, lajes];
    const divKm = geoDistance(divStart, lajes) * 6371;
    const glideStart = along(divert, Math.max(0, 1 - 120 / divKm));
    const tCruise = ramp(frame, F.august + s(1), F.leak + s(1), (t) => t) * 0.55;
    const tDivert = ramp(frame, F.leak + s(1), F.glided, (t) => t);
    const preGlide: LL[] = [divStart, glideStart];
    const tGlide = ramp(frame, F.glided, F.landed + s(0.6));
    const glidePath: LL[] = [glideStart, lajes];
    const pos = frame < F.leak + s(1) ? along(route, tCruise) : frame < F.glided ? along(preGlide, tDivert) : along(glidePath, tGlide);
    const lajesCircle = geoDistance(glideStart, lajes) < (minutesToDegrees(60) * Math.PI) / 180;
    return (
      <Globe width={width} height={height} camera={cam} day={0} dots={[byCode('YYZ'), byCode('LIS'), byCode('TER')].map((a) => ({ airport: a, appear: 1 }))} circles={frame >= F.wasnt ? [{ airport: byCode('TER'), minutes: 60, appear: ramp(frame, F.wasnt, F.wasnt + s(1)) }] : []}>
        {(projection) => {
          const p = projection(pos);
          return (
            <>
              <GeoLine projection={projection} points={[route[0], divStart]} progress={tCruise / 0.55} color={theme.amber} width={4} />
              {frame >= F.leak + s(1) ? <GeoLine projection={projection} points={preGlide} progress={tDivert} color={theme.amber} width={4} /> : null}
              {frame >= F.glided ? <GeoLine projection={projection} points={glidePath} progress={tGlide} color={day.coral} width={4} dashed /> : null}
              <Pin projection={projection} at={byCode('YYZ').at} label="Toronto" color={theme.text} halo={theme.bg} dot={day.dot} />
              <Pin projection={projection} at={byCode('LIS').at} label="Lisbon" color={theme.text} halo={theme.bg} dot={day.dot} />
              {frame >= F.glided ? <Pin projection={projection} at={lajes} label="Lajes, Azores" color={theme.text} halo={theme.bg} dot={day.dot} /> : null}
              {p ? (
                <PlaneIcon x={p[0]} y={p[1]} size={70} heading={frame < F.leak + s(1) ? headingAt(projection, route, Math.max(0.02, tCruise)) : frame < F.glided ? headingAt(projection, preGlide, Math.max(0.02, tDivert)) : headingAt(projection, glidePath, Math.max(0.02, tGlide))} engineOut={frame >= F.oneStop} engineOut2={frame >= F.other} glow={0.6} />
              ) : null}
              {(() => {
                // Terceira island (approximate outline around Lajes), too small for the world map data
                const ring: LL[] = Array.from({ length: 24 }, (_, i) => {
                  const t = (i / 24) * Math.PI * 2;
                  return [-27.21 + 0.2 * Math.cos(t), 38.72 + 0.085 * Math.sin(t)] as LL;
                });
                const pts = ring.map((q) => projection(q)).filter(Boolean) as [number, number][];
                return pts.length > 3 ? <path d={'M' + pts.map((q) => q.join(',')).join('L') + 'Z'} fill={theme.land} /> : null;
              })()}
            </>
          );
        }}
      </Globe>
    );
  };

  const segs = [
    { from: F.start, to: F.answer, render: () => (
      <Paper>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 40 }}>
          <Title pre="Two engines. Three hours from " accent="land" size={96} />
          {frame >= F.safe ? <Title pre="Is that really " accent="safe?" size={130} accentColor={day.danger} delay={0} /> : null}
        </AbsoluteFill>
        <MinutesBadge minutes={180} />
      </Paper>
    ) },
    { from: F.answer, to: F.modern, render: () => (
      <Paper>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          {frame >= F.shut ? (
            <BigNumber value={2} prefix="≤ " caption="Engine shutdowns per 100,000 engine hours" />
          ) : (
            <Title pre="The answer is in the " accent="numbers" size={110} />
          )}
          {frame >= F.shut ? <Label size={24} color={day.circle} style={{ position: 'absolute', bottom: 260 }}>FAA world-fleet limit for 180-minute ETOPS</Label> : null}
        </AbsoluteFill>
      </Paper>
    ) },
    { from: F.modern, to: F.perspective, render: () => (
      <Paper>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 160 }}>
          <div style={{ opacity: 0.45, transform: 'scale(0.7)' }}>
            <BigNumber value={2} prefix="≤ " caption="Per 100,000 h · FAA limit" />
          </div>
          {frame >= F.roughly ? (
            <BigNumber value={700000} prefix="1 in " caption="Engine hours · GE90-94B (GE figure)" color={day.circle} format={(v) => Math.round(v / 1000) * 1000 > 0 ? (Math.round(v / 1000) * 1000).toLocaleString('en-US') : '0'} />
          ) : (
            <Title pre="Modern engines: " accent="far better" size={90} />
          )}
        </AbsoluteFill>
      </Paper>
    ) },
    { from: F.perspective, to: F.only, render: () => (
      <Paper>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 30 }}>
          {frame >= F.years ? <BigNumber value={80} caption="Non-stop running = 700,000 hours" suffix=" years" /> : <Title pre="In " accent="perspective" size={110} />}
        </AbsoluteFill>
      </Paper>
    ) },
    { from: F.only, to: F.question, render: () => (
      <Paper>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 120 }}>
          <Title pre="Not only " accent="engines" size={100} align="left" />
          <Checklist items={[{ text: 'Enough fuel', at: F.fuel - F.only }, { text: 'Fire protection', at: F.fire - F.only }, { text: 'Stricter maintenance', at: F.maintained - F.only }]} />
        </AbsoluteFill>
      </Paper>
    ) },
    { from: F.question, to: F.whatHappens, render: () => (
      <Paper>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          {frame >= F.canWe ? <Title pre="Can we get everyone safely to that " accent="runway?" size={92} /> : <Title pre="One " accent="question" size={120} />}
        </AbsoluteFill>
      </Paper>
    ) },
    { from: F.whatHappens, to: F.brings, render: () => (
      <>
        {engineOutScene()}
        <MinutesBadge minutes={180} />
        {frame >= F.notFall && frame < F.descends ? <Stamp text="Designed for it" color={day.circle} delay={F.designed - F.whatHappens} style={{ left: 140, top: 160 }} /> : null}
        {frame >= F.descends ? (
          <div style={{ position: 'absolute', left: 120, top: 300, padding: '24px 30px', background: '#f3ecd8', border: `2px solid ${day.text}`, outline: `1.5px solid ${day.text}`, outlineOffset: 6 }}>
            <Label size={20} color={day.circle}>Altitude</Label>
            <div style={{ marginTop: 20 }}><Altimeter level={interpolate(ramp(frame, F.descends, F.descends + s(3)), [0, 1], [1, 0.6])} /></div>
          </div>
        ) : null}
      </>
    ) },
    { from: F.brings, to: F.united, render: () => (
      <>
        {midwayScene('zoom')}
        {frame >= F.noScheduled ? <InfoCard head="Henderson Field" lines={['Midway Atoll', 'No scheduled passenger flights']} width={520} style={{ left: 70, bottom: 80 }} /> : null}
        {frame >= F.likeThis && frame < F.speck ? <div style={{ position: 'absolute', top: 54, left: 0, right: 0, textAlign: 'center' }}><Title pre="Remember this " accent="island?" size={84} /></div> : null}
      </>
    ) },
    { from: F.united, to: F.in2026, render: () => (
      <Paper>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <BigNumber value={8000} suffix="+" caption="Flights a year planned around Midway · United" color={day.circle} />
        </AbsoluteFill>
      </Paper>
    ) },
    { from: F.in2026, to: F.holes, render: () => (
      <Paper>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 100 }}>
          <InfoCard head="2026" lines={['FAA request for information', 'Should Midway stay an', 'emergency alternate?']} width={600} style={{ position: 'relative' }} />
          <div style={{ position: 'relative', width: 520, height: 300 }}>
            <Stamp text="~$100M of repairs" delay={F.repairs - F.in2026} style={{ left: 0, top: 30 }} />
            <Stamp text="Keep it open" color={day.circle} rotate={6} delay={F.keepOpen - F.in2026} style={{ left: 60, top: 170 }} />
          </div>
        </AbsoluteFill>
      </Paper>
    ) },
    { from: F.holes, to: F.sometimes, render: () => (
      <>
        {midwayScene('holes')}
        <div style={{ position: 'absolute', top: 54, left: 0, right: 0, textAlign: 'center' }}>
          <Title pre="Without Midway: a " accent="hole" accentColor={day.danger} size={84} />
        </div>
      </>
    ) },
    { from: F.sometimes, to: F.august, render: () => (
      <Paper dark>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Title pre="Disaster, or a " accent="miracle" size={120} color={theme.text} accentColor={day.coral} />
        </AbsoluteFill>
      </Paper>
    ) },
    { from: F.august, to: F.survived, render: () => (
      <>
        {transatScene()}
        <InfoCard head="August 2001" lines={['Air Transat 236 · Airbus A330', 'Toronto → Lisbon']} width={560} style={{ left: 70, bottom: 80 }} />
        {frame >= F.leak && frame < F.glided ? <Stamp text="Fuel leak" delay={F.leak - F.august} style={{ right: 160, top: 160 }} /> : null}
        {frame >= F.glided ? (
          <div style={{ position: 'absolute', right: 90, top: 80, padding: '22px 32px', background: '#f3ecd8', border: `2px solid ${day.text}` }}>
            <div style={{ fontFamily: theme.fontSerif, fontSize: 80, color: day.text, lineHeight: 1 }}>{Math.min(19, Math.floor(interpolate(frame, [F.glided, F.landed + s(0.6)], [0, 19], { extrapolateRight: 'clamp' })))} min</div>
            <Label size={22} color={day.text} style={{ marginTop: 10 }}>Gliding · no engines · ~65 nm</Label>
          </div>
        ) : null}
      </>
    ) },
    { from: F.survived, to: F.wasnt, render: () => (
      <Paper dark>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <BigNumber value={306} caption="People on board · all survived" color={theme.amber} captionColor="#e9dcbf" />
        </AbsoluteFill>
      </Paper>
    ) },
    { from: F.wasnt, to: F.end, render: () => (
      <>
        {transatScene()}
        <div style={{ position: 'absolute', top: 54, left: 0, right: 0, textAlign: 'center' }}>
          <Title pre="A runway " accent="within reach" size={84} color={theme.text} accentColor={theme.amber} />
        </div>
      </>
    ) },
  ];

  if (frame < F.start || frame >= F.end) return null;
  return (
    <AbsoluteFill style={{ backgroundColor: day.bg }}>
      <Segments segs={segs} />
    </AbsoluteFill>
  );
};
