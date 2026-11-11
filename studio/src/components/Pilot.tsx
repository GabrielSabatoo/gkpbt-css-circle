import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { day, theme } from '../theme';
import { ramp } from '../anim';

/** Flat pilot silhouette (head, captain's cap with badge, headset, shoulders with epaulettes). viewBox 0 0 600 700 */
const PilotSilhouette: React.FC<{ talk: number }> = ({ talk }) => {
  const ink = '#1d1a16';
  const mouth = 4 + 10 * talk; // mouth opens while talking
  return (
    <g>
      {/* shoulders + jacket */}
      <path d="M60,700 C70,560 150,500 300,490 C450,500 530,560 540,700 Z" fill={ink} />
      {/* epaulettes */}
      <rect x={110} y={545} width={95} height={26} rx={6} fill={ink} stroke={day.bg} strokeWidth={4} transform="rotate(-14 157 558)" />
      <path d="M125,553 L190,537 M128,563 L193,547" stroke={day.gold} strokeWidth={4} transform="rotate(-0 157 558)" />
      <rect x={395} y={545} width={95} height={26} rx={6} fill={ink} stroke={day.bg} strokeWidth={4} transform="rotate(14 443 558)" />
      <path d="M408,537 L473,553 M406,547 L471,563" stroke={day.gold} strokeWidth={4} />
      {/* collar + tie */}
      <path d="M255,490 L300,560 L345,490 Z" fill={day.bg} />
      <path d="M290,515 L310,515 L318,600 L300,620 L282,600 Z" fill={ink} />
      {/* neck */}
      <rect x={262} y={410} width={76} height={90} rx={20} fill={ink} />
      {/* head */}
      <ellipse cx={300} cy={330} rx={115} ry={135} fill={ink} />
      {/* ear + headset */}
      <ellipse cx={186} cy={340} rx={22} ry={34} fill={ink} />
      <path d="M186,300 C175,200 230,170 300,170 C370,170 425,200 414,300" fill="none" stroke={ink} strokeWidth={14} />
      <rect x={168} y={300} width={34} height={66} rx={14} fill={ink} stroke={day.bg} strokeWidth={4} />
      <path d="M190,370 C200,420 240,440 262,438" fill="none" stroke={day.bg} strokeWidth={5} />
      <circle cx={266} cy={437} r={9} fill={day.bg} />
      {/* cap */}
      <path d="M170,250 C175,175 230,140 300,138 C370,140 425,175 430,250 Z" fill={ink} />
      <path d="M160,250 L440,250 L440,268 L160,268 Z" fill={ink} stroke={day.bg} strokeWidth={4} />
      <path d="M180,268 C230,300 370,300 420,268 Z" fill={ink} />
      {/* cap badge: wings */}
      <path d="M300,195 L338,182 L328,198 L360,192 L320,212 L300,206 L280,212 L240,192 L272,198 L262,182 Z" fill={day.gold} />
      <circle cx={300} cy={200} r={9} fill={day.gold} />
      {/* mouth (only shape cut from the silhouette) */}
      <ellipse cx={318} cy={400} rx={20} ry={mouth / 2} fill={day.bg} opacity={0.9} />
    </g>
  );
};

/**
 * Beige scene: pilot zoomed in → zooms out → speech balloon (dots while "talking"),
 * then the balloon fills with the phrase. Frames are local to the Sequence.
 */
export const PilotJoke: React.FC<{ zoomOutAt: number; balloonAt: number; phraseAt: number; phrase: string[] }> = ({ zoomOutAt, balloonAt, phraseAt, phrase }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const z = interpolate(ramp(frame, zoomOutAt, zoomOutAt + fps * 1.4), [0, 1], [2.6, 1]);
  const pan = interpolate(ramp(frame, zoomOutAt, zoomOutAt + fps * 1.4), [0, 1], [-60, 0]);
  const balloon = spring({ frame: frame - balloonAt, fps, config: { damping: 12, stiffness: 160 } });
  const talking = frame >= balloonAt ? 0.5 + 0.5 * Math.sin(frame * 1.3) : 0;
  const dots = Math.floor((frame - balloonAt) / 6) % 4;
  const showPhrase = frame >= phraseAt;
  return (
    <AbsoluteFill style={{ backgroundColor: day.bg }}>
      {/* soft paper vignette */}
      <AbsoluteFill style={{ backgroundImage: 'radial-gradient(ellipse at 40% 55%, rgba(255,255,255,0.35) 0%, rgba(0,0,0,0.06) 75%)' }} />
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <g transform={`translate(${width * 0.3 + pan}, ${height - 700 * 1.25 * z + 40 * (z - 1) * 6}) scale(${1.25 * z})`}>
          <PilotSilhouette talk={talking} />
        </g>
      </svg>
      {/* speech balloon */}
      {frame >= balloonAt && (
        <div
          style={{
            position: 'absolute', left: width * 0.53, top: height * 0.1, width: width * 0.42, minHeight: height * 0.36,
            transform: `scale(${balloon})`, transformOrigin: '8% 100%',
            background: '#ffffff', border: `6px solid ${day.text}`, borderRadius: 70,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 56px', boxSizing: 'border-box',
            boxShadow: '10px 12px 0 rgba(29,35,48,0.15)',
          }}
        >
          {showPhrase ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 22px', justifyContent: 'center' }}>
              {phrase.map((w, i) => {
                const s = spring({ frame: frame - phraseAt - i * 6, fps, config: { damping: 16, stiffness: 170 } });
                return (
                  <span key={i} style={{ fontFamily: theme.fontDisplay, fontSize: 76, lineHeight: 1.12, color: day.circle, opacity: s, transform: `translateY(${(1 - s) * 22}px)` }}>
                    {w}
                  </span>
                );
              })}
            </div>
          ) : (
            <div style={{ fontFamily: theme.fontDisplay, fontSize: 120, color: day.text, letterSpacing: 10 }}>{'.'.repeat(dots)}&nbsp;</div>
          )}
          {/* tail */}
          <svg width={120} height={110} style={{ position: 'absolute', left: 30, bottom: -100 }} viewBox="0 0 120 110">
            <path d="M20,0 L95,0 L8,105 Z" fill="#ffffff" stroke={day.text} strokeWidth={6} strokeLinejoin="round" />
            <rect x={14} y={-6} width={90} height={12} fill="#ffffff" />
          </svg>
        </div>
      )}
    </AbsoluteFill>
  );
};
