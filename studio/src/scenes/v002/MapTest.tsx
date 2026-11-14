import React from 'react';
import { useCurrentFrame } from 'remotion';
import { USMap } from '../../components/USMap';
export const MapTest: React.FC<{ night?: number }> = ({ night = 0 }) => {
  const f = useCurrentFrame();
  return <USMap night={night} centers={1} centerLabels={1} wires={1} traffic={{ n: 120, t: 30 + f / 30, size: 24 }} centerTint={{ ZAU: 'rgba(194,59,43,0.25)' }} />;
};
