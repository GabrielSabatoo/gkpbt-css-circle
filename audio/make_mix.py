"""Build the soundtrack for a video: original ambient music bed + soft whooshes + narration, mastered to -14 LUFS.

Everything here is synthesised in code (no samples), so it is royalty-free.
Levels follow the reference videos: music sits ~17-18 dB under the voice, music
plays alone at the end and fades out.

Usage:
    python audio/make_mix.py narration.wav out.wav --total 541 --whooshes 18.3,26.6,...
"""
import argparse
import numpy as np
import soundfile as sf

SR = 44100


def note(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def pad_voice(freq, dur, sr=SR):
    t = np.arange(int(dur * sr)) / sr
    # soft detuned triangle-ish tone: a few sines with gentle detune
    sig = np.zeros_like(t)
    for det, amp in ((0.0, 1.0), (0.18, 0.6), (-0.21, 0.6)):
        f = freq * (1 + det / 100)
        sig += amp * (np.sin(2 * np.pi * f * t) + 0.18 * np.sin(2 * np.pi * 2 * f * t))
    return sig


def envelope(n, attack, release, sr=SR):
    env = np.ones(n)
    a, r = int(attack * sr), int(release * sr)
    env[:a] = np.linspace(0, 1, a) ** 2
    env[-r:] *= np.linspace(1, 0, r) ** 2
    return env


def lowpass(x, cutoff, sr=SR):
    # one-pole low-pass (gentle, warm)
    from scipy.signal import lfilter
    a = np.exp(-2 * np.pi * cutoff / sr)
    return lfilter([1 - a], [1, -a], x)


def music_bed(total, sr=SR, seed=7):
    """Slow ambient chord progression (D major-ish), 8 s per chord, with a soft bass and a light shimmer."""
    rng = np.random.default_rng(seed)
    chords = [
        [50, 57, 62, 66, 69],  # Dmaj
        [47, 54, 59, 62, 66],  # Bm
        [43, 55, 59, 62, 66],  # Gmaj7
        [45, 52, 57, 61, 64],  # A
    ]
    seg = 8.0
    n = int(total * sr)
    out = np.zeros((n, 2))
    k = 0
    t0 = 0.0
    while t0 < total:
        ch = chords[k % len(chords)]
        dur = seg + 2.5  # overlap for smooth crossfade
        L = np.zeros(int(dur * sr))
        R = np.zeros(int(dur * sr))
        for j, m in enumerate(ch):
            v = pad_voice(note(m), dur) * (0.55 if j == 0 else 0.32)
            pan = 0.5 + 0.35 * np.sin(j * 1.7 + k)
            L += v * (1 - pan)
            R += v * pan
        env = envelope(len(L), 2.2, 2.6)
        start = int(t0 * sr)
        end = min(n, start + len(L))
        out[start:end, 0] += (L * env)[: end - start]
        out[start:end, 1] += (R * env)[: end - start]
        t0 += seg
        k += 1
    # shimmer: sparse soft high notes (pentatonic), like a distant chime
    for _ in range(int(total / 3.5)):
        m = rng.choice([74, 76, 78, 81, 83, 86])
        st = rng.uniform(0, total - 3)
        d = 2.8
        tone = np.sin(2 * np.pi * note(m) * np.arange(int(d * sr)) / sr) * np.exp(-np.arange(int(d * sr)) / (sr * 0.9)) * 0.10
        s = int(st * sr)
        e = min(n, s + len(tone))
        p = rng.uniform(0.2, 0.8)
        out[s:e, 0] += tone[: e - s] * (1 - p)
        out[s:e, 1] += tone[: e - s] * p
    out[:, 0] = lowpass(out[:, 0], 2400)
    out[:, 1] = lowpass(out[:, 1], 2400)
    out /= np.max(np.abs(out)) + 1e-9
    return out


def whoosh(dur=0.7, sr=SR, seed=0):
    rng = np.random.default_rng(seed)
    n = int(dur * sr)
    noise = rng.standard_normal(n)
    # sweep a band from low to high by mixing two low-passed versions
    lo = lowpass(noise, 600)
    hi = lowpass(noise, 4000) - lowpass(noise, 900)
    mixc = np.linspace(0, 1, n)
    sig = lo * (1 - mixc) + hi * mixc
    env = np.sin(np.linspace(0, np.pi, n)) ** 2
    sig = sig * env
    return sig / (np.max(np.abs(sig)) + 1e-9)


def rms_db(x):
    return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('narration')
    ap.add_argument('out')
    ap.add_argument('--total', type=float, required=True, help='total length in seconds (video length)')
    ap.add_argument('--whooshes', default='', help='comma-separated times in seconds')
    ap.add_argument('--music-under-db', type=float, default=-18.0, help='music level relative to voice while talking')
    args = ap.parse_args()

    voice, vsr = sf.read(args.narration)
    if voice.ndim > 1:
        voice = voice.mean(axis=1)
    if vsr != SR:  # simple resample
        idx = np.arange(0, len(voice), vsr / SR)
        voice = np.interp(idx, np.arange(len(voice)), voice)
    n = int(args.total * SR)
    v = np.zeros(n)
    v[: min(n, len(voice))] = voice[:n]
    voice_end = len(voice) / SR

    music = music_bed(args.total)
    # level: music RMS set relative to the voice RMS (measured on speech only)
    speech = v[np.abs(v) > 0.01]
    target = rms_db(speech) + args.music_under_db
    music *= 10 ** ((target - rms_db(music)) / 20)
    # after the voice ends, music rises ~8 dB (plays alone), then fades out over the last 6 s
    t = np.arange(n) / SR
    gain = np.ones(n)
    rise = np.clip((t - voice_end) / 2.0, 0, 1)
    gain *= 10 ** (8 * rise / 20)
    fade_in = np.clip(t / 1.5, 0, 1)
    fade_out = np.clip((args.total - t) / 6.0, 0, 1)
    gain *= fade_in * fade_out
    music *= gain[:, None]

    mix = np.stack([v, v], axis=1) * 0.92 + music
    for k, ts in enumerate([float(x) for x in args.whooshes.split(',') if x.strip()]):
        w = whoosh(seed=k) * 10 ** ((target - 4 - rms_db(whoosh(seed=k))) / 20)
        s = int(max(0, ts - 0.35) * SR)
        e = min(n, s + len(w))
        pan = 0.35 + 0.3 * (k % 3) / 2
        mix[s:e, 0] += w[: e - s] * (1 - pan)
        mix[s:e, 1] += w[: e - s] * pan
    peak = np.max(np.abs(mix))
    if peak > 0.98:
        mix *= 0.98 / peak
    sf.write(args.out, mix.astype(np.float32), SR)
    print(f'wrote {args.out}: {args.total:.1f}s, voice ends {voice_end:.1f}s, music under voice {args.music_under_db} dB')


if __name__ == '__main__':
    main()
