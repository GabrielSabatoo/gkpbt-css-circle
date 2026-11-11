import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from 'remotion';
import { Part1 } from './Part1';
import { Part2 } from './Part2';
import { useCues } from './shared';
import { day } from '../../theme';

/** Full video 001. Each part draws only during its own time range (absolute frames). */
export const Video001: React.FC<{ audio?: string }> = ({ audio = 'audio/001-narration.wav' }) => {
  const frame = useCurrentFrame();
  const c = useCues();
  const p2 = c.at('The story begins');
  return (
    <AbsoluteFill style={{ backgroundColor: day.bg }}>
      {frame < p2 ? <Part1 /> : null}
      <Part2 />
      <Audio src={staticFile(audio)} />
    </AbsoluteFill>
  );
};
