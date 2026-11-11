import { Easing, interpolate } from 'remotion';

export const ease = Easing.bezier(0.45, 0, 0.2, 1);
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

/** 0→1 between frames a and b (eased, clamped) */
export const ramp = (frame: number, a: number, b: number, e = ease) =>
  interpolate(frame, [a, Math.max(a + 1, b)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e });

/** fade in at a, fade out at b */
export const window_ = (frame: number, a: number, b: number, fade = 10) => Math.min(ramp(frame, a, a + fade), 1 - ramp(frame, b - fade, b));

export type Key<T> = [number, T];
/** Piecewise eased interpolation of numeric records between keyframes (frame, value). */
export const keyed = <T extends Record<string, number>>(frame: number, keys: Key<T>[]): T => {
  if (frame <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [f0, v0] = keys[i];
    const [f1, v1] = keys[i + 1];
    if (frame <= f1) {
      const p = ramp(frame, f0, f1);
      const out = {} as T;
      for (const k of Object.keys(v0)) (out as any)[k] = v0[k] + ((v1 as any)[k] - v0[k]) * p;
      return out;
    }
  }
  return keys[keys.length - 1][1];
};
