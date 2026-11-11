import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { Globe } from '../../components/Globe';
import { GapField, GeoLine, PlaneIcon, Pin, Ruler, along, headingAt } from '../../components/Overlays';
import { AircraftSide, Bars, InfoCard, Label, MinutesBadge, Paper, Stamp, Title } from '../../components/Kit';
import { byCode, worldAirports } from '../../data/airports';
import { keyed, ramp } from '../../anim';
import { day, theme } from '../../theme';
import { Segments, useCues } from './shared';

type LL = [number, number];
const ATL = ['BOS', 'JFK', 'YYT', 'YQX', 'BGSF', 'KEF', 'SNN', 'LHR', 'CDG', 'LIS', 'TER', 'BDA', 'YUL', 'MAD', 'AMS', 'FRA', 'GOH'].map(byCode as any) as any[];
const PAC = ['SFO', 'LAX', 'SEA', 'YVR', 'ANC', 'CDB', 'HNL', 'MDY', 'AWK', 'GUM', 'NRT', 'KIX', 'CTS', 'ICN', 'PVG', 'TPE', 'HKG', 'MNL', 'MAJ', 'NAN', 'PPT', 'AKL', 'SYD', 'BNE', 'PKC', 'FAI', 'POM', 'NOU']
  .map((c) => worldAirports.find((a) => a.code === c)!)
  .filter(Boolean);

/** Part 2 (≈1:36–4:12): 1953 rule → trijets → twins arrive → 1985 → Pacific → 777. Absolute frames. */
export const Part2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const c = useCues();
  const s = (x: number) => Math.round(x * fps);

  const F = {
    begins: c.at('The story begins'),
    piston: c.at('piston engines'),
    failed: c.at('failed far more'),
    regulator: c.at('So the American regulator'),
    sixty: c.at('had to stay within'),
    draw: c.at('Draw those'),
    obvious: c.at('the problem is obvious'),
    cling: c.at('They cling'),
    middle: c.at('leave the middle'),
    couldnt: c.at('A twin simply'),
    belonged: c.at('So the oceans belonged'),
    exempted: c.at('jets were exempted'),
    dc10: c.at('like the DC'),
    b747: c.at('and the four'),
    decades: c.at('For decades'),
    better: c.at('But jet engines kept'),
    much: c.at('Much better'),
    noticed: c.at('And airlines noticed'),
    fuel: c.at('burn a lot less fuel'),
    buy: c.at('cheaper to buy'),
    maintain: c.at('cheaper to maintain'),
    fly: c.at('and cheaper to fly'),
    a300: c.at('Under international rules'),
    move: c.at('the FAA made its move'),
    standards: c.at('met strict new standards'),
    feb: c.at('February'),
    boston: c.at('took off from Boston'),
    observers: c.at('with FAA observers'),
    swelled: c.at('On the map, the circles swelled'),
    closed: c.at('and the gap in the middle'),
    atlanticOne: c.at('The Atlantic was one thing'),
    pacific: c.at('The Pacific was something'),
    largest: c.at("It's the largest ocean"),
    distances: c.at('the distances between'),
    bigger: c.at('even bigger circles'),
    soon: c.at('Soon, the limit'),
    b777: c.at('In 1995'),
    cleared: c.at('had been cleared'),
    never: c.at('That had never happened'),
    until: c.at('Until then'),
    reach: c.at('With three', c.sec('Until then')),
    end: c.at('Now, this is the part'),
  };

  // badge value over the part
  const badge = frame < F.a300 ? 60 : frame < F.standards ? 90 : frame < F.soon ? 120 : 180;
  const pulse = 0.5 + 0.5 * Math.sin((frame / fps) * Math.PI * 2.5);

  // ---------- Atlantic globe (1953 circles, twin can't cross; 1985 crossing, circles swell) ----------
  const atlantic = (mode: '1953' | '1985') => {
    const cam = { lon: -38, lat: 46, scale: 900 };
    const minutes =
      mode === '1953' ? 60 : interpolate(ramp(frame, F.swelled, F.swelled + s(1.6)), [0, 1], [60, 120]);
    const appear = mode === '1953' ? ramp(frame, F.draw, F.draw + s(1.4)) : 1;
    const route: LL[] = [byCode('BOS').at, byCode('CDG').at];
    const tRoute = mode === '1985' ? ramp(frame, F.boston, F.swelled - s(0.3)) : 0;
    const blockedT = mode === '1953' ? ramp(frame, F.couldnt, F.couldnt + s(1.2)) * 0.22 : 0;
    return (
      <Globe width={width} height={height} camera={cam} day={1} dots={ATL.map((a) => ({ airport: a, appear: 1 }))} circles={ATL.map((a) => ({ airport: a, minutes, appear }))}>
        {(projection) => (
          <>
            <GapField
              projection={projection}
              centers={ATL.map((a) => a.at)}
              minutes={Math.round(minutes / 10) * 10}
              bbox={[-60, -8, 25, 64]}
              opacity={mode === '1953' ? ramp(frame, F.middle, F.middle + s(0.6)) : 1 - ramp(frame, F.closed, F.closed + s(1.2))}
              pulse={pulse}
            />
            {mode === '1953' && frame >= F.couldnt ? (() => {
              const p = projection(along(route, blockedT));
              return p ? (
                <>
                  <GeoLine projection={projection} points={route} progress={blockedT} color={day.circle} width={4} />
                  <PlaneIcon x={p[0]} y={p[1]} size={56} heading={headingAt(projection, route, Math.max(0.02, blockedT))} />
                  {frame >= F.couldnt + s(1.2) ? <text x={p[0] + 40} y={p[1] - 30} fill={day.danger} fontFamily={theme.fontSerif} fontSize={90} fontWeight={700}>✕</text> : null}
                </>
              ) : null;
            })() : null}
            {mode === '1985' && frame >= F.boston ? (() => {
              const p = projection(along(route, tRoute));
              return (
                <>
                  <GeoLine projection={projection} points={route} progress={tRoute} color={day.circle} width={5} />
                  <Pin projection={projection} at={byCode('BOS').at} label="Boston" color={day.text} halo={day.land} dot={day.dot} />
                  <Pin projection={projection} at={byCode('CDG').at} label="Paris" color={day.text} halo={day.land} dot={day.dot} />
                  {p ? <PlaneIcon x={p[0]} y={p[1]} size={56} heading={headingAt(projection, route, Math.max(0.02, tRoute))} /> : null}
                </>
              );
            })() : null}
          </>
        )}
      </Globe>
    );
  };

  // ---------- Pacific globe (distances, 120 → 180 circles) ----------
  const pacific = (final: boolean) => {
    const cam = keyed(frame, [
      [F.pacific, { lon: -120, lat: 30, scale: 470 }],
      [F.pacific + s(1.6), { lon: -170, lat: 18, scale: 520 }],
    ]);
    const minutes = final ? 180 : interpolate(ramp(frame, F.soon, F.soon + s(1.6)), [0, 1], [120, 180]);
    const appear = final ? 1 : ramp(frame, F.bigger - s(0.5), F.bigger + s(0.8));
    return (
      <Globe width={width} height={height} camera={final ? { lon: -170, lat: 18, scale: 520 } : cam} day={1} dots={PAC.map((a) => ({ airport: a, appear: 1 }))} circles={PAC.map((a) => ({ airport: a, minutes, appear }))}>
        {(projection) => (
          <>
            {!final && frame >= F.distances && frame < F.bigger ? (
              <>
                <Ruler projection={projection} a={byCode('HNL').at} b={byCode('SFO').at} label="3,900 KM" progress={ramp(frame, F.distances, F.distances + s(1))} />
                <Ruler projection={projection} a={byCode('HNL').at} b={byCode('GUM').at} label="6,100 KM" progress={ramp(frame, F.distances + s(0.8), F.distances + s(1.8))} />
              </>
            ) : null}
            <GapField projection={projection} centers={PAC.map((a) => a.at)} minutes={Math.round(minutes / 20) * 20} bbox={[150, 240, -30, 60]} step={1.6} opacity={final ? 0 : ramp(frame, F.bigger, F.bigger + s(0.6)) * (1 - ramp(frame, F.soon + s(0.4), F.soon + s(1.8)))} pulse={pulse} />
          </>
        )}
      </Globe>
    );
  };

  const segs = [
    // 1953 date card
    { from: F.begins, to: F.regulator, render: () => (
      <Paper>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 40 }}>
          <Title pre="" accent="1953" size={200} accentColor={day.text} eyebrow="Where it starts" />
          {frame >= F.piston ? <AircraftSide engines={2} props width={760} spin={frame * 0.9} label="Piston-engined airliner" deadEngine={frame >= F.failed + s(0.6) ? 0 : undefined} /> : null}
          <Stamp text="Unreliable" delay={F.failed + s(0.6) - F.begins} style={{ right: 300, top: 640 }} />
        </AbsoluteFill>
      </Paper>
    ) },
    // the FAA rule
    { from: F.regulator, to: F.draw, render: () => (
      <Paper>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <InfoCard head="FAA · 1953" lines={['Rule for twin-engine airliners']} width={560} style={{ position: 'relative', marginBottom: 60 }} />
          {frame >= F.sixty ? <div style={{ marginTop: 340, position: 'absolute' }}><Title pre="Stay within " accent="60 minutes" post=" of an airport" size={92} /></div> : null}
        </AbsoluteFill>
        <MinutesBadge minutes={60} opacity={ramp(frame, F.sixty, F.sixty + s(0.5))} />
      </Paper>
    ) },
    // Atlantic, 1953
    { from: F.draw, to: F.belonged, render: () => (
      <>
        {atlantic('1953')}
        <MinutesBadge minutes={60} />
        <div style={{ position: 'absolute', top: 56, left: 0, right: 0, textAlign: 'center', opacity: ramp(frame, F.middle, F.middle + s(0.5)) }}>
          <Title pre="The middle stays " accent="empty" accentColor={day.danger} size={84} />
        </div>
      </>
    ) },
    // three and four engines
    { from: F.belonged, to: F.decades, render: () => (
      <Paper>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 30 }}>
          <Title pre="The oceans belonged to " accent="three and four" post=" engines" size={76} />
          <div style={{ display: 'flex', gap: 80, alignItems: 'flex-end', marginTop: 40 }}>
            <div style={{ opacity: ramp(frame, F.belonged + s(0.8), F.belonged + s(1.4)), position: 'relative' }}>
              <AircraftSide engines={3} width={640} label={frame >= F.dc10 ? 'Trijets · DC-10 · TriStar' : 'Three engines'} />
              <Stamp text="Exempt · 1964" color={day.circle} delay={F.exempted - F.belonged} style={{ left: 120, top: -40 }} />
            </div>
            <div style={{ opacity: ramp(frame, F.belonged + s(1.6), F.belonged + s(2.2)) }}>
              <AircraftSide engines={4} width={frame >= F.b747 ? 760 : 640} label={frame >= F.b747 ? 'Boeing 747 · four engines' : 'Four engines'} />
            </div>
          </div>
        </AbsoluteFill>
        <MinutesBadge minutes={60} />
      </Paper>
    ) },
    // for decades: timeline 1953 → 1985
    { from: F.decades, to: F.better, render: (l: number) => (
      <Paper>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ width: 1400, position: 'relative', height: 200 }}>
            <div style={{ position: 'absolute', top: 96, left: 0, height: 6, width: 1400 * ramp(l, 0, s(3)), background: day.text }} />
            {[['1953', 0], ['1964', 0.34], ['1976', 0.72], ['1985', 1]].map(([y, x]) => (
              <div key={y as string} style={{ position: 'absolute', left: 1400 * (x as number) - 60, top: 0, width: 120, textAlign: 'center', opacity: ramp(l, s(3) * (x as number), s(3) * (x as number) + 8) }}>
                <div style={{ fontFamily: theme.fontSerif, fontSize: 54, color: day.text }}>{y}</div>
                <div style={{ width: 18, height: 18, borderRadius: 9, background: day.dot, margin: '22px auto 0', border: '3px solid white' }} />
              </div>
            ))}
            <Label size={26} color={day.text} style={{ position: 'absolute', top: 160, width: 1400, textAlign: 'center' }}>Oceans: three and four engines</Label>
          </div>
        </AbsoluteFill>
      </Paper>
    ) },
    // engines got better
    { from: F.better, to: F.noticed, render: (l: number) => (
      <Paper>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 50 }}>
          <Title pre="Jet engines got " accent={frame >= F.much ? 'much better' : 'better'} size={110} />
          <svg width={900} height={260} viewBox="0 0 900 260">
            <path d="M40,230 C260,220 420,180 560,110 S800,30 860,20" fill="none" stroke={day.circle} strokeWidth={8} strokeDasharray={1100} strokeDashoffset={1100 * (1 - ramp(l, 6, s(2.2)))} strokeLinecap="round" />
            <line x1={40} y1={240} x2={880} y2={240} stroke={day.text} strokeWidth={3} />
            <text x={40} y={30} fontFamily={theme.fontMono} fontSize={22} letterSpacing={3} fill={day.textMuted}>RELIABILITY (ILLUSTRATIVE)</text>
          </svg>
        </AbsoluteFill>
      </Paper>
    ) },
    // fuel and cost
    { from: F.noticed, to: F.a300, render: () => (
      <Paper>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 140 }}>
          <Bars title="Fuel burned (illustrative)" max={4} width={900} unit="" hideValue rows={[
            { label: 'Four engines', value: 4, at: F.fuel - F.noticed, color: day.textMuted },
            { label: 'Three engines', value: 3, at: F.fuel - F.noticed + s(0.4), color: day.textMuted },
            { label: 'Two engines', value: 2, at: F.fuel - F.noticed + s(0.8), color: day.circle },
          ]} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
            {[['Cheaper to buy', F.buy], ['Cheaper to maintain', F.maintain], ['Cheaper to fly', F.fly]].map(([t, at]) => (
              <div key={t as string} style={{ fontFamily: theme.fontSerif, fontSize: 56, color: day.text, opacity: ramp(frame, at as number, (at as number) + 8) }}>
                <span style={{ color: day.circle, fontStyle: 'italic' }}>$</span> {t as string}
              </div>
            ))}
          </div>
        </AbsoluteFill>
      </Paper>
    ) },
    // A300, 1976, 90 minutes
    { from: F.a300, to: F.move, render: () => (
      <Paper>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 40 }}>
          <AircraftSide engines={2} width={800} label="Airbus A300" />
          <InfoCard head="1976" lines={['International (ICAO) rules', '90-minute limit over water']} width={560} style={{ position: 'relative' }} delay={s(0.8)} />
        </AbsoluteFill>
        <MinutesBadge minutes={90} />
      </Paper>
    ) },
    // 1985: 120 minutes
    { from: F.move, to: F.feb, render: () => (
      <Paper>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 30 }}>
          <Title accent="1985" accentColor={day.text} size={200} eyebrow="The FAA moves" />
          {frame >= F.standards ? <Title pre="Twins: up to " accent="120 minutes" size={90} /> : null}
        </AbsoluteFill>
        <MinutesBadge minutes={badge} />
      </Paper>
    ) },
    // TWA 767, 1 Feb 1985
    { from: F.feb, to: F.boston, render: () => (
      <Paper>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 30 }}>
          <AircraftSide engines={2} width={820} label="TWA · Boeing 767" />
          <InfoCard head="1 Feb 1985" lines={['Boston → Paris', 'FAA observers on board']} width={560} style={{ position: 'relative' }} />
        </AbsoluteFill>
        <MinutesBadge minutes={120} />
      </Paper>
    ) },
    // Atlantic 1985 crossing, circles swell, gap closes
    { from: F.boston, to: F.atlanticOne, render: () => (
      <>
        {atlantic('1985')}
        <MinutesBadge minutes={interpolate(ramp(frame, F.swelled, F.swelled + s(1.6)), [0, 1], [60, 120])} />
        <InfoCard head="1985" lines={['TWA Boeing 767', 'Boston → Paris']} width={420} style={{ left: 60, bottom: 70 }} />
        <Stamp text="Gap closed" color={day.circle} delay={F.closed + s(1.3) - F.boston} style={{ right: 120, top: 150 }} />
      </>
    ) },
    // Pacific
    { from: F.atlanticOne, to: F.b777, render: () => (
      <>
        {pacific(false)}
        <div style={{ position: 'absolute', top: 50, left: 0, right: 0, textAlign: 'center', opacity: ramp(frame, F.pacific, F.pacific + s(0.5)) * (1 - ramp(frame, F.distances, F.distances + s(0.4))) }}>
          <Title pre="The " accent="Pacific" post=" is different" size={84} />
        </div>
        <MinutesBadge minutes={frame < F.soon ? 120 : interpolate(ramp(frame, F.soon, F.soon + s(1.6)), [0, 1], [120, 180])} />
        {frame >= F.soon ? <InfoCard head="180 min" lines={['Three hours from', 'the nearest airport']} width={420} style={{ left: 60, bottom: 70 }} /> : null}
      </>
    ) },
    // 777, 1995
    { from: F.b777, to: F.reach, render: () => (
      <Paper>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 34 }}>
          <AircraftSide engines={2} width={900} label="Boeing 777 · United · 1995" />
          {frame >= F.until ? <Title pre="Before: prove it " accent="in service" post=" first" size={70} /> : <div style={{ height: 80 }} />}
        </AbsoluteFill>
        <Stamp text="180 min · before service" color={day.circle} delay={F.cleared + s(1.2) - F.b777} rotate={-6} style={{ left: 640, top: 210 }} />
        <Stamp text="A first" delay={F.never - F.b777} rotate={7} style={{ right: 330, top: 300 }} />
        <MinutesBadge minutes={180} />
      </Paper>
    ) },
    // Pacific within reach
    { from: F.reach, to: F.end, render: () => (
      <>
        {pacific(true)}
        <MinutesBadge minutes={180} />
        <div style={{ position: 'absolute', top: 50, left: 0, right: 0, textAlign: 'center' }}>
          <Title pre="The Pacific, " accent="within reach" size={84} />
        </div>
      </>
    ) },
  ];

  if (frame < F.begins || frame >= F.end) return null;
  return (
    <AbsoluteFill style={{ backgroundColor: day.bg }}>
      <Segments segs={segs} />
    </AbsoluteFill>
  );
};
