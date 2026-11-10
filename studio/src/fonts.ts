import { continueRender, delayRender, staticFile } from 'remotion';

// Fonts are stored in public/fonts (Archivo Black and Inter, SIL Open Font License).
const faces = [
  { family: 'ArchivoBlackLocal', file: 'fonts/ArchivoBlack.woff2', weight: '400' },
  { family: 'InterLocal', file: 'fonts/Inter.woff2', weight: '100 900' },
];

if (typeof document !== 'undefined') {
  const handle = delayRender('Loading fonts');
  Promise.all(
    faces.map((f) => {
      const face = new FontFace(f.family, `url(${staticFile(f.file)}) format('woff2')`, { weight: f.weight });
      document.fonts.add(face);
      return face.load();
    })
  ).then(() => continueRender(handle), () => continueRender(handle));
}

export const displayFont = 'ArchivoBlackLocal';
export const bodyFont = 'InterLocal';
