import { continueRender, delayRender, staticFile } from 'remotion';

// Fonts are stored in public/fonts (Archivo Black and Inter, SIL Open Font License).
const faces = [
  { family: 'ArchivoBlackLocal', file: 'fonts/ArchivoBlack.woff2', weight: '400', style: 'normal' },
  { family: 'InterLocal', file: 'fonts/Inter.woff2', weight: '100 900' },
  { family: 'FrauncesLocal', file: 'fonts/Fraunces-Bold.woff2', weight: '700', style: 'normal' },
  { family: 'FrauncesLocal', file: 'fonts/Fraunces-BoldItalic.woff2', weight: '700', style: 'italic' },
  { family: 'PlexMonoLocal', file: 'fonts/IBMPlexMono-Medium.woff2', weight: '500' },
];

if (typeof document !== 'undefined') {
  const handle = delayRender('Loading fonts');
  Promise.all(
    faces.map((f) => {
      const face = new FontFace(f.family, `url(${staticFile(f.file)}) format('woff2')`, { weight: f.weight, style: (f as any).style ?? 'normal' });
      document.fonts.add(face);
      return face.load();
    })
  ).then(() => continueRender(handle), () => continueRender(handle));
}

export const displayFont = 'ArchivoBlackLocal';
export const bodyFont = 'InterLocal';
export const serifFont = 'FrauncesLocal';
export const monoFont = 'PlexMonoLocal';
