import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { makeCues } from '../../cues';
import words from '../../data/v002/words.json';
import { Sequence } from 'remotion';
type Seg = { from: number; to: number; fade?: number; render: (local: number) => React.ReactNode };
import { USMap, airportAt, planesAt } from '../../components/USMap';
import { Globe } from '../../components/Globe';
import { GeoLine, Pin, PlaneIcon } from '../../components/Overlays';
import { Paper, Title, Label, InfoCard, Stamp, BigNumber, Checklist, AircraftSide } from '../../components/Kit';
import { byCode } from '../../data/airports';
import { day, theme } from '../../theme';
import { ramp } from '../../anim';

/** Video 002 — "How One Outage Stopped Every Plane in America". Scenes are timed by narration cues. */

const NIGHT_BG = '#0c1626';
const CREAM = '#efe6cf';


const SegStart = React.createContext(0);
/** Mount children at absolute frame `at`, with their own local clock starting at 0. */
const On: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => {
  const start = React.useContext(SegStart);
  return <Sequence from={at - start} layout="none">{children}</Sequence>;
};
const Segments: React.FC<{ segs: Seg[] }> = ({ segs }) => {
  const frame = useCurrentFrame();
  return (<>{segs.filter((x) => frame >= x.from && frame < x.to).map((x, i) => {
    const f = x.fade ?? 8; const o = Math.min(1, (frame - x.from) / f, (x.to - frame) / f);
    return (
      <Sequence key={`${x.from}-${i}`} from={x.from} durationInFrames={x.to - x.from} layout="none">
        <SegStart.Provider value={x.from}><AbsoluteFill style={{ opacity: Math.max(0, Math.min(1, o)) }}>{x.render(frame - x.from)}</AbsoluteFill></SegStart.Provider>
      </Sequence>
    );
  })}</>);
};

const useC = () => { const { fps } = useVideoConfig(); return makeCues(words as any, fps); };

/* ---------- small building blocks ---------- */
const Clock: React.FC<{ h: number; m: number; size?: number; dark?: boolean; label?: string }> = ({ h, m, size = 260, dark = false, label }) => {
  const col = dark ? CREAM : day.text;
  const ha = ((h % 12) + m / 60) * 30, ma = m * 6;
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={size} height={size} viewBox="-110 -110 220 220">
        <circle r={100} fill={dark ? 'rgba(12,22,38,0.75)' : '#f3ecd8'} stroke={col} strokeWidth={6} />
        {Array.from({ length: 12 }).map((_, i) => <line key={i} x1={0} y1={-86} x2={0} y2={-74} stroke={col} strokeWidth={4} transform={`rotate(${i * 30})`} />)}
        <line x1={0} y1={8} x2={0} y2={-52} stroke={col} strokeWidth={9} strokeLinecap="round" transform={`rotate(${ha})`} />
        <line x1={0} y1={10} x2={0} y2={-78} stroke={day.dot} strokeWidth={5} strokeLinecap="round" transform={`rotate(${ma})`} />
        <circle r={7} fill={col} />
      </svg>
      {label ? <Label size={28} color={col} style={{ marginTop: 10 }}>{label}</Label> : null}
    </div>
  );
};

const Quote: React.FC<{ text: string; who: string; delay?: number; dark?: boolean; width?: number }> = ({ text, who, delay = 0, dark = false, width = 1300 }) => {
  const f = useCurrentFrame(); const s = ramp(f, delay, delay + 14);
  return (
    <div style={{ width, opacity: s, transform: `translateY(${(1 - s) * 24}px)`, borderLeft: `8px solid ${day.dot}`, padding: dark ? '24px 36px 24px 40px' : '10px 0 10px 40px', background: dark ? 'rgba(8,14,26,0.88)' : undefined }}>
      <div style={{ fontFamily: theme.fontSerif, fontStyle: 'italic', fontSize: 66, lineHeight: 1.18, color: dark ? CREAM : day.text }}>“{text}”</div>
      <Label size={26} color={dark ? '#9fb3c9' : day.textMuted} style={{ marginTop: 22 }}>{who}</Label>
    </div>
  );
};

const Center: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', ...style }}>{children}</AbsoluteFill>
);

const Board: React.FC<{ holdAt: number; dark?: boolean }> = ({ holdAt }) => {
  const f = useCurrentFrame();
  const rows = [['BOSTON', '4:05'], ['CHICAGO', '4:10'], ['DENVER', '4:15'], ['ATLANTA', '4:20'], ['SEATTLE', '4:25'], ['MIAMI', '4:30'], ['DALLAS', '4:35'], ['PHOENIX', '4:40']];
  return (
    <div style={{ width: 1320, background: '#111418', border: '6px solid #2a2f38', borderRadius: 10, padding: '26px 36px', boxShadow: '0 30px 80px rgba(0,0,0,0.5)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: theme.fontMono, color: '#f2c14e', fontSize: 34, letterSpacing: 6, marginBottom: 16 }}><span>DEPARTURES</span><span>15:5{Math.min(9, 2 + Math.floor(f / 30))}</span></div>
      {rows.map(([d, t], i) => {
        const flip = f >= holdAt + i * 4; const s = ramp(f, holdAt + i * 4, holdAt + i * 4 + 6);
        return (
          <div key={d} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: theme.fontMono, fontSize: 42, letterSpacing: 4, padding: '10px 0', borderTop: '2px solid #23272f', color: '#e8e6dd' }}>
            <span style={{ width: 160 }}>{t}</span><span style={{ flex: 1 }}>{d}</span>
            <span style={{ width: 320, textAlign: 'right', color: flip ? '#ff5a4a' : '#7ddc8a', transform: `scaleY(${flip ? Math.max(0.2, s) : 1})` }}>{flip ? 'HOLD' : 'ON TIME'}</span>
          </div>
        );
      })}
    </div>
  );
};

const Counter: React.FC<{ value: number; label: string; delay?: number; dark?: boolean; prefix?: string; suffix?: string; color?: string; decimals?: number }> = ({ value, label, delay = 0, dark = false, prefix = '', suffix = '', color, decimals = 0 }) => {
  const f = useCurrentFrame(); const p = ramp(f, delay, delay + 30);
  return (
    <div style={{ padding: '18px 28px', background: dark ? 'rgba(12,22,38,0.82)' : 'rgba(243,236,216,0.92)', border: `2px solid ${dark ? '#9fb3c9' : day.text}`, opacity: Math.min(1, p * 3) }}>
      <div style={{ fontFamily: theme.fontSerif, fontSize: 84, lineHeight: 1, color: color ?? (dark ? CREAM : day.text) }}>{prefix}{(value * p).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</div>
      <Label size={22} color={dark ? '#9fb3c9' : day.textMuted} style={{ marginTop: 10 }}>{label}</Label>
    </div>
  );
};

const Radar: React.FC<{ dead: number; t: number }> = ({ dead, t }) => {
  const a = (t * 140) % 360;
  return (
    <svg width={560} height={560} viewBox="-150 -150 300 300">
      <circle r={140} fill="#07140f" stroke="#2c5a46" strokeWidth={4} />
      {[45, 90, 130].map((r) => <circle key={r} r={r} fill="none" stroke="#1d4a37" strokeWidth={2} />)}
      <g opacity={1 - dead}>
        <path d={`M0,0 L${140 * Math.sin((a * Math.PI) / 180)},${-140 * Math.cos((a * Math.PI) / 180)}`} stroke="#5dff9e" strokeWidth={3} />
        {[[40, -60], [-70, 30], [90, 50], [-30, -100]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={5} fill="#5dff9e" />)}
      </g>
      <text x={0} y={8} textAnchor="middle" fontFamily="PlexMonoLocal, monospace" fontSize={22} fill="#ff5a4a" opacity={dead}>NO RADAR</text>
    </svg>
  );
};

const BackupLines: React.FC<{ cutA: number; cutB: number }> = ({ cutA, cutB }) => {
  const line = (y: number, cut: number, label: string) => (
    <g>
      <text x={-470} y={y - 24} fontFamily="PlexMonoLocal, monospace" fontSize={26} letterSpacing={4} fill={day.textMuted}>{label}</text>
      <line x1={-480} y1={y} x2={-40} y2={y} stroke={cut > 0 ? '#9a3a2e' : '#c98a3a'} strokeWidth={10} />
      <line x1={40} y1={y} x2={480} y2={y} stroke={cut > 0 ? '#9a3a2e' : '#c98a3a'} strokeWidth={10} />
      <line x1={-40} y1={y} x2={40} y2={y} stroke="#c98a3a" strokeWidth={10} opacity={1 - cut} />
      <g opacity={cut} transform={`translate(0,${y})`}><path d="M-26,-26 L26,26 M26,-26 L-26,26" stroke={day.danger} strokeWidth={10} strokeLinecap="round" /></g>
    </g>
  );
  return (
    <svg width={1300} height={520} viewBox="-650 -260 1300 520">
      <rect x={-640} y={-80} width={140} height={160} rx={10} fill="#f3ecd8" stroke={day.text} strokeWidth={4} />
      <text x={-570} y={8} textAnchor="middle" fontFamily="PlexMonoLocal, monospace" fontSize={22} fill={day.text}>RADAR</text>
      <rect x={500} y={-80} width={140} height={160} rx={10} fill="#f3ecd8" stroke={day.text} strokeWidth={4} />
      <text x={570} y={8} textAnchor="middle" fontFamily="PlexMonoLocal, monospace" fontSize={22} fill={day.text}>CONTROL</text>
      {line(-60, cutA, 'PRIMARY')}
      {line(90, cutB, 'BACKUP')}
    </svg>
  );
};

/* ---------- the video ---------- */
export const Video002: React.FC<{ audio?: string }> = ({ audio = 'audio/002-final-mix.wav' }) => {
  const frame = useCurrentFrame();
  const c = useC();
  const { fps } = useVideoConfig();
  const s = (sec: number) => Math.round(sec * fps);
  const A = (p: string, after = 0) => c.at(p, after);
  const sec = (p: string, after = 0) => c.sec(p, after);
  const t = frame / fps;

  // key moments
  const F = {
    gate: A("You're sitting at the gate"), folks: A('Folks'), exact: A('And at that exact moment'),
    thousands: A('Thousands of planes are still'), fr24: A('According to'), notone: A('Not one of them was told'),
    q1: A('So how does one broken link'), q2: A('Why were the planes in the air'), q3: A('And why did the last person'),
    relay: A('To understand Friday'), tower: A('When you take off'), approach: A("Within minutes, you're passed"),
    centres: A("Then you're handed to one of"), sectors: A('is cut into smaller'), faa: A('The Federal Aviation Administration handles'),
    busiest: A('At the busiest moments'), handoff: A('And every single handoff'), lines: A('Those voices and that data'),
    quiet: A('Which raises the obvious question'), newark: A('We already have a pretty good idea'), cause: A('The cause'),
    dallas: A('Five months later'), outdated: A('The FAA called it'), backup: A('You might be thinking'),
    dallasBk: A('But in Dallas'), philly: A('And in September this year'), both: A('Two paths'),
    dark: A('And what if a whole'), chicago: A('In September', c.sec('And what if a whole')), stretch: A('But the neighboring'),
    different: A('Friday was different'), safest: A("So if a controller can't talk"), feed: A("It isn't to clear the sky"),
    gs: A("That's what a ground stop is"), still: A('The planes already flying are still'), gatePlane: A('A plane waiting at a gate'),
    landed: A("That's why on Friday, the flights"), annoying: A('Annoying'), pilot: A("And if you're a pilot up there"),
    squawk: A('You set your transponder'), script: A('Then you follow a script'), route: A('Keep flying the route'),
    alt: A('Hold the highest'), arrive: A('And time your arrival'), everyone: A('Even if everyone stops talking'),
    rare: A('A nationwide stop like this'), three: A('But stopping every departure'), sept11: A('The first was the'),
    landall: A('the man running it ordered'), sliney: A('His name was'), firstday: A('It was his first day'),
    commission: A('later wrote that'), canada: A('Flights heading for the United States'), gander: A('to one small town'),
    notam: A('The second came in January'), uk: A("And it isn't only an American"), third: A('And the third was last Friday'),
    small: A('It started small'), stop: A('due to what it called'), cited: A('It cited communication problems'),
    evening: A('By early evening'), lifted: A('The stop was lifted'), cancels: A('had counted more than'),
    knock: A("And it didn't end there"), denver: A('A plane that should have finished'), morning: A('So the next morning'),
    oneStop: A('One four hour stop'), broke: A('So what actually broke'), asof: A('As of the'),
    secretary: A('The Transportation Secretary said'), cbs: A('citing unnamed sources'), cyber: A('no sign of a cyber'),
    inv: A('The investigation is still going on'), old: A('What we do know is how old'), gao: A('the Government Accountability Office'),
    unsust: A('were rated unsustainable'), potential: A('potentially unsustainable'), plan: A('A plan is underway'),
    congress: A('Congress has approved'), until: A("Until it's finished"), back: A('So, back to that gate'),
    working: A('But it was also the system working'), home: A('Every plane already in the sky'),
    wire: A('Somewhere beneath the busiest sky'), country: A('And on Friday, a whole country'),
  };
  const END = c.end('how much it matters') + s(1.2);
  const TOTAL = END + s(9);

  // traffic clock: one running timeline for the map scenes (seconds)
  const trafficT = 200 + t * 0.5;

  const segs: Seg[] = [
    // 1 — cold open: date + clock
    { from: 0, to: F.gate, render: (l) => (
      <AbsoluteFill style={{ backgroundColor: NIGHT_BG }}>
        <Center>
          <Label size={40} color="#9fb3c9" style={{ marginBottom: 30 }}>FRIDAY · 13 NOVEMBER 2026</Label>
          <Clock h={15} m={50 + Math.min(4, l / 40)} dark size={340} label="EASTERN TIME" />
        </Center>
      </AbsoluteFill>
    ) },
    // 2 — departure board flips to HOLD
    { from: F.gate, to: F.exact + s(0.6), render: (l) => (
      <AbsoluteFill style={{ backgroundColor: '#07090d' }}>
        <Center><Board holdAt={F.folks - F.gate + s(0.8)} /></Center>
      </AbsoluteFill>
    ) },
    // 3 — whole country: every airport turns red
    { from: F.exact, to: F.q1, render: (l) => {
      const stopT = 200 + (F.exact / fps) * 0.5;
      return (
        <AbsoluteFill>
          <USMap night={1} traffic={{ n: 150, t: trafficT, stopAt: stopT, size: 22 }} airportColor={(code) => (l > 10 + (code.charCodeAt(0) % 20) ? '#ff3b2f' : '#f2c14e')} />
          <Stamp text="All departures stopped" color="#ff5a4a" delay={s(0.8)} size={40} rotate={-4} style={{ background: 'rgba(8,14,26,0.85)', whiteSpace: 'nowrap', left: 90, top: 60 }} />
          <On at={F.fr24}><div style={{ position: 'absolute', right: 80, bottom: 70 }}><Counter value={4000} prefix="" suffix="+" label="flights to US airports in the air · Flightradar24" dark delay={0} /></div></On>
          <On at={F.notone}><Stamp text="None told to land" color={CREAM} delay={0} size={34} rotate={3} style={{ background: 'rgba(8,14,26,0.85)', whiteSpace: 'nowrap', right: 120, top: 70 }} /></On>
        </AbsoluteFill>
      );
    } },
    // 4 — three questions (open loops)
    { from: F.q1, to: F.relay, render: (l) => (
      <AbsoluteFill style={{ backgroundColor: NIGHT_BG }}>
        <Center>
          {[['How does one broken link', 'stop a whole country?', F.q1], ['Why were the planes', 'in the air the safe ones?', F.q2], ['The last order like this…', 'given on his first day?', F.q3]].map(([a, b, at], i) => {
            const o = ramp(frame, at as number, (at as number) + 12);
            return (
              <div key={i} style={{ opacity: o, display: 'flex', gap: 36, alignItems: 'baseline', margin: '22px 0', transform: `translateX(${(1 - o) * 40}px)` }}>
                <span style={{ fontFamily: theme.fontMono, fontSize: 40, color: '#f2c14e' }}>0{i + 1}</span>
                <span style={{ fontFamily: theme.fontSerif, fontSize: 64, color: CREAM }}>{a} <i style={{ color: '#e2654f' }}>{b}</i></span>
              </div>
            );
          })}
        </Center>
      </AbsoluteFill>
    ) },
    // 5 — title: relay race
    { from: F.relay, to: F.tower, render: () => <Paper><Center><Title eyebrow="HOW AMERICA'S SKY WORKS" pre="The invisible " accent="relay race" size={120} /></Center></Paper> },
    // 6 — tower → approach → centre, zoomed on Atlanta
    { from: F.tower, to: F.sectors, render: (l) => {
      const atl = airportAt('ATL');
      const z = interpolate(frame, [F.tower, F.centres, F.centres + s(1.5)], [5, 3.2, 1.2], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
      return (
        <USMap zoom={{ x: 1330 - 960, y: 690 - 540, s: z }} centers={ramp(frame, F.centres, F.centres + s(1))} centerLabels={ramp(frame, F.centres + s(1), F.centres + s(2))}>
          {(p) => { const xy = p(atl)!; return (
            <g>
              <circle cx={xy[0]} cy={xy[1]} r={14} fill="none" stroke={day.circle} strokeWidth={3 / z * 2} opacity={ramp(frame, F.tower, F.tower + 10)} />
              <text x={xy[0] + 18} y={xy[1] - 16} fontSize={30 / z} fontFamily="PlexMonoLocal, monospace" fill={day.text} opacity={1 - ramp(frame, F.approach, F.approach + 8)}>TOWER</text>
              <circle cx={xy[0]} cy={xy[1]} r={60} fill="rgba(44,85,120,0.12)" stroke={day.circle} strokeWidth={4 / z} strokeDasharray={`${8 / z} ${6 / z}`} opacity={ramp(frame, F.approach, F.approach + 12)} />
              <text x={xy[0] + 64} y={xy[1] - 50} fontSize={30 / z} fontFamily="PlexMonoLocal, monospace" fill={day.text} opacity={ramp(frame, F.approach, F.approach + 12) * (1 - ramp(frame, F.centres, F.centres + 8))}>APPROACH</text>
              <PlaneIcon x={xy[0] + 4 + ramp(frame, F.tower, F.sectors) * 60} y={xy[1] - 6 - ramp(frame, F.tower, F.sectors) * 50} size={52 / z} heading={50} />
            </g>
          ); }}
        </USMap>
      );
    } },
    // 7 — sectors + handoffs across the country
    { from: F.sectors, to: F.faa, render: () => {
      const route = [airportAt('ATL'), airportAt('DEN')];
      const prog = ramp(frame, F.sectors, F.faa);
      return (
        <USMap centers={1} centerLabels={1} centerTint={{ ZTL: 'rgba(217,162,60,0.25)', ZME: prog > 0.2 ? 'rgba(217,162,60,0.25)' : 'transparent', ZKC: prog > 0.5 ? 'rgba(217,162,60,0.25)' : 'transparent', ZDV: prog > 0.8 ? 'rgba(217,162,60,0.25)' : 'transparent' }}>
          {(p) => <GeoLine projection={p} points={route} progress={prog} color={day.gold} width={5} />}
        </USMap>
      );
    } },
    // 8 — 44,000 flights a day / 5,000 at once
    { from: F.faa, to: F.handoff, render: () => (
      <AbsoluteFill>
        <USMap traffic={{ n: frame >= F.busiest ? 160 : 70, t: trafficT, size: 22 }} airports={0.8} />
        <div style={{ position: 'absolute', left: 70, bottom: 70, display: 'flex', gap: 28 }}>
          <Counter value={44000} suffix="" label="flights a day · FAA" />
          <On at={F.busiest}><Counter value={5000} suffix="+" label="aircraft at once at peak · FAA" /></On>
        </div>
      </AbsoluteFill>
    ) },
    // 9 — voice + data, telecom lines
    { from: F.handoff, to: F.newark, render: () => (
      <AbsoluteFill>
        <USMap centers={0.6} centerLabels={0.5} wires={ramp(frame, F.handoff + s(1), F.lines + s(1.5))} wireBroken={ramp(frame, F.quiet + s(1), F.newark)} />
        <div style={{ position: 'absolute', left: 80, top: 60 }}>
          <Label size={30} color={day.text}>{frame < F.lines ? 'Every handoff: a voice + a data link' : frame < F.quiet ? 'Telecom lines · some decades old' : 'What happens when they go quiet?'}</Label>
        </div>
      </AbsoluteFill>
    ) },
    // 10 — Newark 2025
    { from: F.newark, to: F.dallas, render: (l) => (
      <Paper>
        <div style={{ position: 'absolute', left: 220, top: 240 }}><Radar dead={ramp(l, s(1), s(1.6))} t={l / fps} /></div>
        <InfoCard head="April 2025" lines={['Newark approach control', 'Radar + radio lost', '≈ 90 seconds · DOT Inspector General']} style={{ right: 200, top: 300 }} width={680} />
        <On at={F.cause}><Stamp text="A burnt copper wire" delay={s(0.9)} size={38} style={{ whiteSpace: 'nowrap', right: 230, top: 650 }} /></On>
      </Paper>
    ) },
    // 11 — Dallas 2025
    { from: F.dallas, to: F.backup, render: () => (
      <Paper>
        <InfoCard head="Sept 2025" lines={['Dallas · two fibre cables cut', 'Both big airports stopped for hours']} style={{ left: 200, top: 200 }} width={760} />
        <On at={F.outdated}><div style={{ position: 'absolute', left: 200, top: 620 }}><Quote text="A clear example of outdated infrastructure" who="FAA, on the Dallas outage" /></div></On>
      </Paper>
    ) },
    // 12 — backups: primary and backup both cut
    { from: F.backup, to: F.dark, render: () => (
      <Paper>
        <Center><BackupLines cutA={ramp(frame, F.dallasBk, F.dallasBk + 10)} cutB={ramp(frame, F.philly + s(2.5), F.philly + s(3))} /></Center>
        <On at={F.philly}><InfoCard head="Sept 2026" lines={['Philadelphia & Newark area', 'Circuit failed · backup cable cut', 'at a New Jersey construction site']} style={{ right: 110, top: 70 }} width={640} /></On>
        <On at={F.both}><Stamp text="Both gone" delay={0} size={52} style={{ whiteSpace: 'nowrap', left: 820, top: 820 }} /></On>
      </Paper>
    ) },
    // 13 — Chicago 2014: one centre dark, neighbours cover
    { from: F.dark, to: F.safest, render: () => {
      const dark = ramp(frame, F.chicago, F.chicago + 15);
      const cover = ramp(frame, F.stretch, F.stretch + s(1.2));
      const multi = ramp(frame, F.different, F.different + 12);
      const tint: Record<string, string> = { ZAU: `rgba(20,20,24,${0.75 * dark * (1 - cover * 0.6)})` };
      for (const n of ['ZMP', 'ZKC', 'ZID', 'ZOB']) tint[n] = `rgba(44,85,120,${0.3 * cover * (1 - multi)})`;
      for (const n of ['ZNY', 'ZBW', 'ZDC', 'ZOB', 'ZAU']) if (multi > 0) tint[n] = `rgba(194,59,43,${0.45 * multi})`;
      return (
        <AbsoluteFill>
          <USMap centers={1} centerLabels={0.8} centerTint={tint} />
          {frame >= F.chicago && frame < F.different ? <InfoCard head="Sept 2014" lines={['Chicago Center · fire cut its cables', 'Thousands of flights cancelled', 'Neighbours covered · back in ≈ 2 weeks']} style={{ left: 70, bottom: 70 }} width={700} /> : null}
          <On at={F.different}><Stamp text="Friday: more than one centre" delay={0} size={40} rotate={-3} style={{ whiteSpace: 'nowrap', left: 80, bottom: 90 }} /></On>
        </AbsoluteFill>
      );
    } },
    // 14 — "stop feeding it"
    { from: F.safest, to: F.gs, render: () => (
      <Paper><Center>
        {frame < F.feed ? <Title pre="What's the " accent="safest" post=" move?" size={110} /> : <Title pre="Don't clear the sky. " accent="Stop feeding it." size={96} />}
      </Center></Paper>
    ) },
    // 15 — ground stop definition + gate vs circling
    { from: F.gs, to: F.pilot, render: (l) => {
      const ang = (l / fps) * 90;
      return (
        <Paper>
          {frame < F.gatePlane ? (
            <div style={{ position: 'absolute', left: 230, top: 260 }}>
              <Quote text="A process that requires aircraft … to remain on the ground." who="FAA definition of a ground stop" width={1450} />
            </div>
          ) : null}
          {frame >= F.still && frame < F.gatePlane ? <Label size={30} color={day.text} style={{ position: 'absolute', left: 230, top: 700 }}>Planes already flying: still controlled, sector by sector, until they land</Label> : null}
          {frame >= F.gatePlane && frame < F.landed ? (
            <AbsoluteFill style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
              <div style={{ textAlign: 'center' }}>
                <svg width={420} height={420}><rect x={60} y={300} width={300} height={30} fill="#cdbf9c" /><PlaneIcon x={210} y={200} size={200} heading={0} /></svg>
                <Label size={30} color={day.text}>At the gate: an inconvenience</Label>
              </div>
              <div style={{ textAlign: 'center', opacity: ramp(frame, F.gatePlane + s(1.6), F.gatePlane + s(2)) }}>
                <svg width={420} height={420}><ellipse cx={210} cy={210} rx={160} ry={110} fill="none" stroke={day.danger} strokeWidth={4} strokeDasharray="12 10" /><PlaneIcon x={210 + 160 * Math.cos((ang * Math.PI) / 180)} y={210 + 110 * Math.sin((ang * Math.PI) / 180)} size={110} heading={ang + 180} /></svg>
                <Label size={30} color={day.danger}>Circling, nowhere to go: a problem</Label>
              </div>
            </AbsoluteFill>
          ) : null}
          {frame >= F.landed ? (
            <AbsoluteFill>
              <USMap traffic={{ n: 150, t: trafficT, stopAt: 200 + (F.landed / fps) * 0.5 - 2, size: 22 }} airportColor={() => '#c23b2b'} />
              <div style={{ position: 'absolute', left: 70, bottom: 70 }}>
                <Counter value={planesAt({ n: 150, t: trafficT, stopAt: 200 + (F.landed / fps) * 0.5 - 2 }).length} label="still airborne · all landing" delay={0} />
              </div>
              <On at={F.annoying}><Stamp text="Working as designed" color={day.circle} delay={0} size={36} rotate={3} style={{ whiteSpace: 'nowrap', right: 120, top: 80 }} /></On>
            </AbsoluteFill>
          ) : null}
        </Paper>
      );
    } },
    // 16 — lost comms: 7600 + script
    { from: F.pilot, to: F.rare, render: () => (
      <AbsoluteFill style={{ backgroundColor: frame < F.script ? '#0f1216' : day.bg }}>
        {frame < F.script ? (
          <Center>
            <div style={{ padding: '30px 60px', background: '#05070a', border: '6px solid #2a2f38', borderRadius: 12 }}>
              <Label size={26} color="#9fb3c9">TRANSPONDER</Label>
              <div style={{ fontFamily: theme.fontMono, fontSize: 220, color: '#ffb547', letterSpacing: 20, textShadow: '0 0 30px rgba(255,180,70,0.6)', opacity: ramp(frame, F.squawk + s(1), F.squawk + s(1.3)) }}>7600</div>
            </div>
            <Label size={32} color={CREAM} style={{ marginTop: 40, opacity: ramp(frame, F.squawk + s(3), F.squawk + s(3.4)) }}>“I can't hear you.”</Label>
          </Center>
        ) : (
          <AbsoluteFill style={{ padding: '140px 200px' }}>
            <Label size={30} color={day.textMuted} style={{ marginBottom: 50 }}>Lost radio · written into federal rules (14 CFR 91.185)</Label>
            <Checklist items={[{ text: 'Fly the route you were cleared for', at: F.route - F.pilot }, { text: 'Highest of: assigned, minimum safe', at: F.alt - F.pilot }, { text: 'Arrive when you were expected', at: F.arrive - F.pilot }]} />
            <On at={F.everyone}><Stamp text="Everyone knows the plan" color={day.circle} delay={0} size={36} style={{ whiteSpace: 'nowrap', right: 200, bottom: 150 }} /></On>
          </AbsoluteFill>
        )}
      </AbsoluteFill>
    ) },
    // 17 — rare: three times this century
    { from: F.rare, to: F.sept11, render: () => (
      <Paper><Center>
        <Title pre="Every departure stopped: " accent="three times" post=" this century" size={84} />
        <div style={{ display: 'flex', gap: 60, marginTop: 70 }}>
          {['2001', '2023', '2026'].map((y, i) => <div key={y} style={{ fontFamily: theme.fontSerif, fontSize: 96, color: i === 2 ? day.danger : day.text, opacity: ramp(frame, F.three + s(0.6 + i * 0.5), F.three + s(1 + i * 0.5)) }}>{y}</div>)}
        </div>
      </Center></Paper>
    ) },
    // 18 — 9/11
    { from: F.sept11, to: F.canada, render: () => (
      <Paper>
        <div style={{ position: 'absolute', left: 160, top: 160, display: 'flex', gap: 70 }}>
          <Clock h={9} m={frame < F.landall ? 25 : 42} size={300} label={frame < F.landall ? '9:25 · ALL DEPARTURES STOPPED' : '9:42 · EVERY AIRCRAFT: LAND NOW'} />
        </div>
        <InfoCard head="11 Sept 2001" lines={['FAA Command Center', 'Nationwide ground stop, then land-all']} style={{ right: 160, top: 160 }} width={660} />
        {frame >= F.sliney ? <div style={{ position: 'absolute', right: 160, top: 520, width: 660 }}>
          <div style={{ fontFamily: theme.fontSerif, fontSize: 80, color: day.text }}>Ben Sliney</div>
          <Label size={24} color={day.textMuted}>National Operations Manager</Label>
        </div> : null}
        <On at={F.firstday}><Stamp text="His first day" delay={0} size={44} style={{ whiteSpace: 'nowrap', right: 220, top: 700 }} /></On>
        <On at={F.commission}><div style={{ position: 'absolute', left: 160, bottom: 110 }}><Counter value={4500} label="aircraft landed without incident · 9/11 Commission" /></div></On>
      </Paper>
    ) },
    // 19 — Canada / Gander
    { from: F.canada, to: F.notam, render: () => {
      const g = byCode('YQX') as any;
      const srcs: [number, number][] = [[-0.45, 51.47], [2.55, 49.0], [8.57, 50.03], [-6.27, 53.42], [4.76, 52.31]];
      return (
        <AbsoluteFill>
        <Globe width={1920} height={1080} camera={{ lon: -28, lat: 47, scale: 620 }} day={1} dots={g ? [{ airport: g, appear: 1 }] : []}>
          {(p) => (
            <g>
              {srcs.map((sxy, i) => <GeoLine key={i} projection={p} points={[sxy, [-54.57, 48.94]]} progress={ramp(frame, F.canada + i * 6, F.canada + s(2) + i * 6)} color={day.gold} width={4} />)}
              <Pin projection={p} at={[-54.57, 48.94]} label="Gander" opacity={ramp(frame, F.gander, F.gander + 10)} color={day.text} halo="#f3ecd8" dot={day.dot} />
            </g>
          )}
        </Globe>
        <div style={{ position: 'absolute', right: 120, top: 140, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Counter value={200} suffix="+" label="US-bound flights sent to Canada" delay={s(0.5)} />
          <On at={F.gander}><Counter value={38} label="landed at Gander, Newfoundland" /></On>
        </div>
        </AbsoluteFill>
      );
    } },
    // 20 — 2023 NOTAM + UK
    { from: F.notam, to: F.third, render: () => (
      <Paper>
        <InfoCard head="Jan 2023" lines={['Safety-notice database (NOTAM) fails', 'Files deleted by mistake', 'Nationwide stop · ≈ 90 minutes']} style={{ left: 160, top: 220 }} width={720} />
        <On at={F.uk}><InfoCard head="Aug 2023 · UK" lines={['One unusual flight plan', 'stops UK flight-plan processing', '700,000+ passengers · UK CAA']} style={{ right: 160, top: 420 }} width={720} /></On>
      </Paper>
    ) },
    // 21 — the third: Friday
    { from: F.third, to: F.small, render: () => (
      <Paper><Center><div style={{ fontFamily: theme.fontSerif, fontSize: 200, color: day.danger }}>2026</div><Label size={36} color={day.text}>Friday · 13 November</Label></Center></Paper>
    ) },
    // 22 — Friday timeline on the night map
    { from: F.small, to: F.knock, render: () => {
      const stopT = 200 + (F.stop / fps) * 0.5;
      const alerts = ['ZNY', 'ZBW', 'ZDC'];
      const tint: Record<string, string> = {};
      alerts.forEach((a, i) => { if (frame >= F.small + s(1.5 + i * 1.2)) tint[a] = 'rgba(255,59,47,0.35)'; });
      if (frame >= F.cited) ['ZOB', 'ZAU', 'ZID', 'ZTL'].forEach((a) => (tint[a] = 'rgba(255,59,47,0.28)'));
      const hm = frame < F.stop ? [15, 50] : frame < F.evening ? [15, 54] : frame < F.lifted ? [18, 0] : [20, 15];
      return (
        <AbsoluteFill>
          <USMap night={1} centers={1} centerTint={tint} traffic={{ n: 150, t: trafficT, stopAt: frame >= F.stop ? stopT : undefined, size: 20 }} airportColor={() => (frame >= F.stop && frame < F.lifted ? '#ff3b2f' : '#f2c14e')} />
          <div style={{ position: 'absolute', left: 60, top: 50 }}><Clock h={hm[0]} m={hm[1]} dark size={210} label={frame >= F.lifted ? '≈ 8:15 PM ET · LIFTED' : frame >= F.evening ? 'EARLY EVENING · SOME RELEASED' : frame >= F.stop ? '3:54 PM ET' : 'EASTERN TIME'} /></div>
          {frame < F.stop ? <Label size={24} color="#9fb3c9" style={{ position: 'absolute', right: 60, top: 60 }}>Account of one controller · Scripps News</Label> : null}
          {frame >= F.stop && frame < F.evening ? <div style={{ position: 'absolute', right: 70, bottom: 70 }}><Quote text="Extraordinary circumstances … reasons of safety" who="FAA" dark width={900} /></div> : null}
          <On at={F.cancels}><div style={{ position: 'absolute', right: 70, bottom: 70 }}><Counter value={4000} suffix="+" label="cancellations · FlightAware, Friday evening" dark /></div></On>
        </AbsoluteFill>
      );
    } },
    // 23 — knock-on effects
    { from: F.knock, to: F.broke, render: () => {
      const atl = airportAt('ATL'), den = airportAt('DEN');
      return (
        <AbsoluteFill>
          <USMap airports={0.6}>
            {(p) => { const a = p(atl)!, d = p(den)!; return (
              <g>
                <line x1={a[0]} y1={a[1]} x2={d[0]} y2={d[1]} stroke={day.gold} strokeWidth={4} strokeDasharray="12 10" opacity={ramp(frame, F.denver, F.denver + 15)} />
                <PlaneIcon x={a[0] - 20} y={a[1] + 10} size={60} heading={300} />
                <text x={a[0] + 30} y={a[1] + 60} fontFamily="PlexMonoLocal, monospace" fontSize={26} fill={day.text}>STUCK IN ATLANTA</text>
                <circle cx={d[0]} cy={d[1]} r={46} fill="none" stroke={day.danger} strokeWidth={5} strokeDasharray="10 8" opacity={ramp(frame, F.morning, F.morning + 10)} />
                <text x={d[0] + 56} y={d[1] + 8} fontFamily="PlexMonoLocal, monospace" fontSize={26} fill={day.danger} opacity={ramp(frame, F.morning, F.morning + 10)}>DENVER, 6 AM: NO PLANE, NO CREW</text>
              </g>
            ); }}
          </USMap>
          <On at={F.oneStop}><Stamp text="Ripples all weekend" delay={0} size={38} style={{ whiteSpace: 'nowrap', left: 80, top: 70 }} /></On>
        </AbsoluteFill>
      );
    } },
    // 24 — what broke: under investigation
    { from: F.broke, to: F.old, render: () => (
      <Paper>
        <Stamp text="Under investigation · as of 14 Nov" delay={s(0.6)} size={30} rotate={-3} style={{ whiteSpace: 'nowrap', right: 140, top: 70 }} />
        <div style={{ position: 'absolute', left: 140, top: 230, display: 'flex', flexDirection: 'column', gap: 30 }}>
          {[['The Transportation Secretary', 'Old switches and routers overloaded with data', F.secretary], ['CBS News · unnamed sources', 'A network update → reboot → crash', F.cbs], ['Officials', 'No sign of a cyberattack', F.cyber]].map(([who, what, at], i) => {
            const o = ramp(frame, at as number, (at as number) + 12);
            return (
              <div key={i} style={{ opacity: o, transform: `translateX(${(1 - o) * 30}px)`, padding: '20px 30px', background: '#f3ecd8', border: `2px solid ${day.text}`, width: 1300 }}>
                <Label size={22} color={day.textMuted}>{who as string}</Label>
                <div style={{ fontFamily: theme.fontSerif, fontSize: 52, color: day.text, marginTop: 8 }}>{what as string}</div>
              </div>
            );
          })}
        </div>
      </Paper>
    ) },
    // 25 — ageing system: GAO
    { from: F.old, to: F.plan, render: () => {
      const cells = Array.from({ length: 138 });
      return (
        <Paper>
          <Label size={28} color={day.text} style={{ position: 'absolute', left: 160, top: 120 }}>FAA air traffic systems · GAO, 2024</Label>
          <div style={{ position: 'absolute', left: 160, top: 190, width: 1600, display: 'flex', flexWrap: 'wrap', gap: 14 }}>
            {cells.map((_, i) => {
              const col = i < 51 && frame >= F.unsust ? day.danger : i < 105 && i >= 51 && frame >= F.potential ? '#e09a3a' : '#9fb3c9';
              return <div key={i} style={{ width: 56, height: 56, borderRadius: 6, background: col, opacity: ramp(frame, F.gao + i * 0.4, F.gao + i * 0.4 + 6) }} />;
            })}
          </div>
          <div style={{ position: 'absolute', left: 160, bottom: 110, display: 'flex', gap: 60 }}>
            <On at={F.unsust}><Label size={30} color={day.danger}>■ 51 unsustainable</Label></On>
            <On at={F.potential}><Label size={30} color="#c07a20">■ 54 potentially unsustainable</Label></On>
          </div>
        </Paper>
      );
    } },
    // 26 — the plan
    { from: F.plan, to: F.back, render: () => (
      <Paper>
        <div style={{ position: 'absolute', left: 140, top: 160, display: 'flex', gap: 40 }}>
          <Counter value={5000} suffix="+" label="new network connections" delay={s(0.5)} />
          <Counter value={27000} suffix="+" label="new radios" delay={s(1.4)} />
          <Counter value={600} suffix="+" label="new radars" delay={s(2.3)} />
        </div>
        <Label size={34} color={day.text} style={{ position: 'absolute', left: 140, top: 470, opacity: ramp(frame, F.plan + s(3), F.plan + s(3.4)) }}>Target: end of 2028</Label>
        <On at={F.congress}><div style={{ position: 'absolute', left: 140, bottom: 150 }}><Counter value={12.5} decimals={1} prefix="$" suffix=" bn" label="approved by Congress so far" color={day.circle} /></div></On>
        <On at={F.until}><Stamp text="Still on the old wiring" delay={s(0.8)} size={34} style={{ whiteSpace: 'nowrap', right: 140, bottom: 150 }} /></On>
      </Paper>
    ) },
    // 27 — back to the gate, every plane home
    { from: F.back, to: F.wire, render: () => (
      frame < F.working ? <AbsoluteFill style={{ backgroundColor: '#07090d' }}><Center><Board holdAt={-100} /></Center></AbsoluteFill> : (
        <AbsoluteFill>
          <USMap night={1} traffic={{ n: Math.round(150 * (1 - ramp(frame, F.working, F.home + s(2.5)))), t: trafficT, stopAt: 200 + (F.working / fps) * 0.5 - 3, size: 22 }} airportColor={() => '#f2c14e'} />
          <On at={F.home}><Stamp text="Every plane came home" color={CREAM} delay={0} size={36} rotate={-3} style={{ background: 'rgba(8,14,26,0.85)', whiteSpace: 'nowrap', left: 80, top: 70 }} /></On>
        </AbsoluteFill>
      )
    ) },
    // 28 — ending: the wire under the sky
    { from: F.wire, to: TOTAL, fade: 20, render: () => (
      <AbsoluteFill>
        <USMap night={1} centers={0.4} wires={1} wireColor="#f2c14e" airports={0.7} airportColor={() => '#f2c14e'} />
        <AbsoluteFill style={{ background: `rgba(5,8,14,${ramp(frame, END - s(1), END + s(6))})` }} />
      </AbsoluteFill>
    ) },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: NIGHT_BG }}>
      <Segments segs={segs} />
      <Audio src={staticFile(audio)} />
    </AbsoluteFill>
  );
};
