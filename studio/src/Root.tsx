import React from 'react';
import { Composition } from 'remotion';
import { AtlanticDemo } from './scenes/AtlanticDemo';
import { KineticText } from './components/KineticText';

const EtopsTitle: React.FC = () => (
  <KineticText words={['Engines', 'Turn,', 'Or', 'Passengers', 'Swim']} highlight={[0, 1, 2, 3, 4]} perWordFrames={10} size={110} />
);

export const Root: React.FC = () => (
  <>
    <Composition id="AtlanticDemo" component={AtlanticDemo} durationInFrames={8 * 30} fps={30} width={1920} height={1080} />
    <Composition id="EtopsTitle" component={EtopsTitle} durationInFrames={3 * 30} fps={30} width={1920} height={1080} />
  </>
);
