import React from 'react';
import { Audio, Composition, staticFile } from 'remotion';
import { AtlanticDemo } from './scenes/AtlanticDemo';
import { KineticText } from './components/KineticText';
import { Part1 } from './scenes/v001/Part1';
import { makeCues } from './cues';
import words from './data/v001/words.json';

const FPS = 30;
const cues = makeCues(words as any, FPS);

const EtopsTitle: React.FC = () => (
  <KineticText words={['Engines', 'Turn,', 'Or', 'Passengers', 'Swim']} highlight={[0, 1, 2, 3, 4]} perWordFrames={10} size={110} />
);

/** Part 1 preview with narration */
const V001Part1: React.FC = () => (
  <>
    <Part1 />
    <Audio src={staticFile('audio/001-narration.wav')} />
  </>
);

export const Root: React.FC = () => (
  <>
    <Composition id="V001-Part1" component={V001Part1} durationInFrames={cues.at('The story begins') + FPS} fps={FPS} width={1920} height={1080} />
    <Composition id="AtlanticDemo" component={AtlanticDemo} durationInFrames={8 * FPS} fps={FPS} width={1920} height={1080} />
    <Composition id="EtopsTitle" component={EtopsTitle} durationInFrames={3 * FPS} fps={FPS} width={1920} height={1080} />
  </>
);
