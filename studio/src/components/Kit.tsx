import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { day, theme } from '../theme';
import { ramp } from '../anim';

/** Beige paper with a soft vignette. */
export const Paper: React.FC<{ children?: React.ReactNode; dark?: boolean }> = ({ children, dark = false }) => (
  <AbsoluteFill
    style={{
      backgroundColor: dark ? theme.bg : day.bg,
      backgroundImage: dark
        ? 'radial-gradient(ellipse at center, rgba(60,90,130,0.30) 0%, rgba(20,34,54,1) 75%)'
        : 'radial-gradient(ellipse at center, rgba(255,255,255,0.32) 0%, rgba(120,95,50,0.10) 85%)',
    }}
  >
    {children}
  </AbsoluteFill>
);

const useSpring = (delay = 0, stiffness = 160) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping: 16, stiffness } });
};

/** Serif title; `accent` is the word shown in italic colour. Optional mono eyebrow above. */
export const Title: React.FC<{ pre?: string; accent?: string; post?: string; eyebrow?: string; size?: number; delay?: number; color?: string; accentColor?: string; align?: 'center' | 'left' }> = ({
  pre = '', accent = '', post = '', eyebrow, size = 110, delay = 0, color = day.text, accentColor = day.circle, align = 'center',
}) => {
  const s = useSpring(delay);
  return (
    <div style={{ textAlign: align, opacity: s, transform: `translateY(${(1 - s) * 26}px)` }}>
      {eyebrow ? <div style={{ fontFamily: theme.fontMono, fontSize: 26, letterSpacing: '0.24em', textTransform: 'uppercase', color: day.danger, marginBottom: 18 }}>{eyebrow}</div> : null}
      <div style={{ fontFamily: theme.fontSerif, fontSize: size, lineHeight: 1.08, color }}>
        {pre}
        {accent ? <span style={{ fontStyle: 'italic', color: accentColor }}>{accent}</span> : null}
        {post}
      </div>
    </div>
  );
};

/** Small mono label */
export const Label: React.FC<{ children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties }> = ({ children, color = day.textMuted, size = 24, style }) => (
  <div style={{ fontFamily: theme.fontMono, fontSize: size, letterSpacing: '0.2em', textTransform: 'uppercase', color, ...style }}>{children}</div>
);

/** Card with a big serif heading (often a year) and mono detail lines. */
export const InfoCard: React.FC<{ head: string; lines: string[]; delay?: number; style?: React.CSSProperties; width?: number }> = ({ head, lines, delay = 0, style, width = 520 }) => {
  const s = useSpring(delay);
  return (
    <div style={{ position: 'absolute', width, padding: '26px 32px', background: '#f3ecd8', border: `2px solid ${day.text}`, outline: `1.5px solid ${day.text}`, outlineOffset: 6, opacity: s, transform: `translateY(${(1 - s) * 30}px)`, ...style }}>
      <div style={{ fontFamily: theme.fontSerif, fontSize: 64, color: day.text, lineHeight: 1 }}>{head}</div>
      <div style={{ height: 2, background: day.text, opacity: 0.25, margin: '16px 0 14px' }} />
      {lines.map((l, i) => (
        <Label key={i} size={22} color={day.text} style={{ lineHeight: 1.6 }}>{l}</Label>
      ))}
    </div>
  );
};

/** Rubber stamp that thumps in. */
export const Stamp: React.FC<{ text: string; color?: string; rotate?: number; delay?: number; size?: number; style?: React.CSSProperties }> = ({ text, color = day.danger, rotate = -8, delay = 0, size = 44, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 9, stiffness: 260 } });
  if (frame < delay) return null;
  return (
    <div style={{ position: 'absolute', transform: `rotate(${rotate}deg) scale(${interpolate(s, [0, 1], [1.8, 1])})`, opacity: Math.min(1, s * 1.5), border: `5px solid ${color}`, color, fontFamily: theme.fontMono, fontSize: size, letterSpacing: '0.18em', padding: '8px 22px', borderRadius: 6, textTransform: 'uppercase', background: 'rgba(235,226,202,0.55)', ...style }}>
      {text}
    </div>
  );
};

/** Horizontal bars, e.g. minutes allowed from an airport. */
export const Bars: React.FC<{ title: string; rows: { label: string; value: number; at: number; color?: string }[]; max: number; width?: number; unit?: string; hideValue?: boolean }> = ({ title, rows, max, width = 1150, unit = 'min', hideValue = false }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ width }}>
      <Label color={day.text} size={24}>{title}</Label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 34, marginTop: 34 }}>
        {rows.map((r, i) => {
          const p = ramp(frame, r.at, r.at + 22);
          if (frame < r.at) return <div key={i} style={{ height: 82 }} />;
          return (
            <div key={i} style={{ opacity: Math.min(1, p * 2) }}>
              <Label size={20} color={day.textMuted}>{r.label}</Label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 8 }}>
                <div style={{ height: 44, width: (width - 200) * (r.value / max) * p, background: r.color ?? day.circle }} />
                {hideValue ? null : <div style={{ fontFamily: theme.fontSerif, fontSize: 40, color: day.text }}>{Math.round(r.value * p)} {unit}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** Big serif number that counts up, with a mono caption. */
export const BigNumber: React.FC<{ value: number; prefix?: string; suffix?: string; caption: string; delay?: number; decimals?: number; color?: string; captionColor?: string; format?: (v: number) => string }> = ({
  value, prefix = '', suffix = '', caption, delay = 0, decimals = 0, color = day.text, captionColor = day.text, format,
}) => {
  const frame = useCurrentFrame();
  const p = ramp(frame, delay, delay + 26);
  const v = value * p;
  const txt = format ? format(v) : v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return (
    <div style={{ textAlign: 'center', opacity: Math.min(1, p * 3) }}>
      <div style={{ fontFamily: theme.fontSerif, fontSize: 180, color, lineHeight: 1 }}>{prefix}{txt}{suffix}</div>
      <Label size={28} color={captionColor} style={{ marginTop: 22 }}>{caption}</Label>
    </div>
  );
};

/** Checklist that ticks items at given local frames. */
export const Checklist: React.FC<{ items: { text: string; at: number }[] }> = ({ items }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 34 }}>
      {items.map((it, i) => {
        const s = spring({ frame: frame - it.at, fps, config: { damping: 14, stiffness: 170 } });
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 30, opacity: frame >= it.at ? 1 : 0.18 }}>
            <svg width={64} height={64} viewBox="0 0 64 64">
              <rect x={3} y={3} width={58} height={58} rx={8} fill="none" stroke={day.text} strokeWidth={4} />
              <path d="M14 33 L27 46 L51 18" fill="none" stroke={day.circle} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={60} strokeDashoffset={60 * (1 - s)} />
            </svg>
            <span style={{ fontFamily: theme.fontSerif, fontSize: 64, color: day.text }}>{it.text}</span>
          </div>
        );
      })}
    </div>
  );
};

/** Side-view line-art airliner with 2, 3 or 4 engines. viewBox 0 0 1000 300 */
export const AircraftSide: React.FC<{ engines: 2 | 3 | 4; width?: number; stroke?: string; fill?: string; label?: string; deadEngine?: number; props?: boolean; spin?: number }> = ({ engines, width = 700, stroke = day.text, fill = '#f6efdc', label, deadEngine, props = false, spin = 0 }) => {
  const sw = 7;
  const eng = (x: number, y: number, i: number) => props ? (
    <g key={i}>
      <rect x={x + 10} y={y - 4} width={110} height={40} rx={16} fill={deadEngine === i ? day.danger : day.circle} stroke={stroke} strokeWidth={sw * 0.7} />
      <ellipse cx={x + 4} cy={y + 16} rx={8} ry={40 * Math.abs(Math.cos(spin + i))} fill="none" stroke={stroke} strokeWidth={4} />
      <circle cx={x + 6} cy={y + 16} r={6} fill={stroke} />
    </g>
  ) : (
    <g key={i}>
      <rect x={x} y={y} width={120} height={44} rx={20} fill={deadEngine === i ? day.danger : day.circle} stroke={stroke} strokeWidth={sw * 0.7} />
      <rect x={x + 84} y={y + 6} width={30} height={32} rx={12} fill={fill} stroke={stroke} strokeWidth={4} />
    </g>
  );
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={width} height={width * 0.32} viewBox="0 0 1000 320">
        {/* tail fin */}
        <path d="M800,150 L880,30 L935,30 L905,150 Z" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
        {engines === 3 ? eng(820, 112, 2) : null}
        {/* fuselage */}
        <path d="M70,190 C70,150 120,135 200,135 L860,135 C910,135 950,160 960,180 L960,185 C940,210 900,225 850,225 L200,225 C120,225 70,215 70,190 Z" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
        {/* cockpit window */}
        <path d="M95,175 L140,160 L160,175 Z" fill={stroke} />
        {/* windows */}
        {Array.from({ length: 22 }, (_, i) => <circle key={i} cx={210 + i * 26} cy={168} r={6} fill={stroke} />)}
        {/* wing */}
        <path d="M390,205 L560,205 L470,290 L410,290 Z" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
        {engines >= 2 && engines !== 4 ? eng(370, 222, 0) : null}
        {engines === 4 ? (
          <>
            {eng(330, 222, 0)}
            {eng(470, 236, 1)}
          </>
        ) : null}
        {/* horizontal stabiliser */}
        <path d="M820,175 L930,175 L960,200 L850,200 Z" fill={fill} stroke={stroke} strokeWidth={sw * 0.8} strokeLinejoin="round" />
      </svg>
      {label ? <Label size={26} color={day.text} style={{ marginTop: 6 }}>{label}</Label> : null}
    </div>
  );
};

/** Chapter badge (top-right): current circle size in minutes. Our own progress device. */
export const MinutesBadge: React.FC<{ minutes: number; opacity?: number; dark?: boolean }> = ({ minutes, opacity = 1, dark = false }) => (
  <div style={{ position: 'absolute', top: 44, right: 52, opacity, display: 'flex', alignItems: 'center', gap: 14, padding: '10px 20px', border: `2px solid ${dark ? '#e9dcbf' : day.text}`, background: dark ? 'rgba(20,34,54,0.7)' : 'rgba(246,239,220,0.85)' }}>
    <svg width={30} height={30} viewBox="0 0 30 30">
      <circle cx={15} cy={15} r={12} fill="none" stroke={dark ? '#e9dcbf' : day.circle} strokeWidth={3} />
      <circle cx={15} cy={15} r={3.5} fill={day.dot} />
    </svg>
    <span style={{ fontFamily: theme.fontMono, fontSize: 26, letterSpacing: '0.16em', color: dark ? '#e9dcbf' : day.text }}>{Math.round(minutes)} MIN</span>
  </div>
);

/** Altitude tape, value 0..1 of cruise */
export const Altimeter: React.FC<{ level: number }> = ({ level }) => (
  <div style={{ width: 120, height: 420, position: 'relative', borderLeft: `3px solid ${day.text}` }}>
    {[0, 0.25, 0.5, 0.75, 1].map((t) => (
      <div key={t} style={{ position: 'absolute', left: 0, top: (1 - t) * 400, width: 24, borderTop: `3px solid ${day.text}` }} />
    ))}
    <div style={{ position: 'absolute', left: 30, top: (1 - level) * 400 - 18, fontFamily: theme.fontMono, fontSize: 26, color: day.danger }}>◀ {Math.round(level * 37000 / 1000)}k ft</div>
  </div>
);
