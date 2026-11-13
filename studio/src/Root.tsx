import React from 'react';
import { Audio, Composition, staticFile } from 'remotion';
import { AtlanticDemo } from './scenes/AtlanticDemo';
import { KineticText } from './components/KineticText';
import { Part1 } from './scenes/v001/Part1';
import { Video001 } from './scenes/v001/Video001';
import { makeCues } from './cues';
import { AvatarA, AvatarB, Banner, BannerGuide, Watermark, WatermarkBell } from './scenes/channel/Branding';
import { OncaTest, ONCA_FRAMES } from './scenes/styletest/OncaTest';
import { Captions } from './components/Captions';
import { ThumbA, ThumbB, ThumbC, ThumbD, ThumbE } from './scenes/v001/Thumbnails';
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

/** Full video with karaoke subtitles (test) */
const V001Captions: React.FC = () => (
  <>
    <Video001 />
    <Captions words={words as any} />
  </>
);

export const Root: React.FC = () => (
  <>
    <Composition id="V001" component={Video001} durationInFrames={Math.round(541 * FPS)} fps={FPS} width={1920} height={1080} />
    <Composition id="V001-Part1" component={V001Part1} durationInFrames={cues.at('The story begins') + FPS} fps={FPS} width={1920} height={1080} />
    <Composition id="AtlanticDemo" component={AtlanticDemo} durationInFrames={8 * FPS} fps={FPS} width={1920} height={1080} />
    <Composition id="EtopsTitle" component={EtopsTitle} durationInFrames={3 * FPS} fps={FPS} width={1920} height={1080} />
    <Composition id="ThumbA" component={ThumbA} durationInFrames={1} fps={FPS} width={1280} height={720} />
    <Composition id="ThumbB" component={ThumbB} durationInFrames={1} fps={FPS} width={1280} height={720} />
    <Composition id="ThumbC" component={ThumbC} durationInFrames={1} fps={FPS} width={1280} height={720} />
    <Composition id="ThumbD" component={ThumbD} durationInFrames={1} fps={FPS} width={1280} height={720} />
    <Composition id="ThumbE" component={ThumbE} durationInFrames={1} fps={FPS} width={1280} height={720} />
    <Composition id="AvatarA" component={AvatarA} durationInFrames={1} fps={FPS} width={800} height={800} />
    <Composition id="AvatarB" component={AvatarB} durationInFrames={1} fps={FPS} width={800} height={800} />
    <Composition id="Banner" component={Banner} durationInFrames={1} fps={FPS} width={2560} height={1440} />
    <Composition id="BannerGuide" component={BannerGuide} durationInFrames={1} fps={FPS} width={2560} height={1440} />
    <Composition id="Watermark" component={Watermark} durationInFrames={1} fps={FPS} width={600} height={600} />
    <Composition id="WatermarkBell" component={WatermarkBell} durationInFrames={1} fps={FPS} width={600} height={600} />
    <Composition id="OncaTest" component={OncaTest} durationInFrames={ONCA_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="V001-Captions" component={V001Captions} durationInFrames={Math.round(541 * FPS)} fps={FPS} width={1920} height={1080} />
  </>
);
