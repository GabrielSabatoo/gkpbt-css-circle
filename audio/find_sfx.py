"""Find sound effects in the non-voice stem of a separated video and describe them.

Idea: music is steady; a sound effect is a short burst that rises clearly above the
music's running level. For each burst we measure length, attack, pitch (spectral
centroid), whether the pitch sweeps (whoosh/riser), and how loud it is vs the voice.

Usage:
    python audio/find_sfx.py <stems_dir> [--min-rise-db 6] [--out report.json]
Needs <stems_dir>/no_vocals.wav and vocals.wav (from audio/separate.py).
"""
import argparse
import json
import os

import numpy as np
import soundfile as sf
from scipy.ndimage import median_filter

HOP = 0.01  # 10 ms frames


def mono(path):
    x, sr = sf.read(path, always_2d=True)
    return x.mean(axis=1), sr


def frames(x, sr):
    n = int(HOP * sr)
    win = 2 * n
    count = (len(x) - win) // n
    idx = np.arange(win)[None, :] + n * np.arange(count)[:, None]
    return x[idx] * np.hanning(win)[None, :], n


def db(v):
    return 20 * np.log10(np.maximum(v, 1e-9))


def describe(ev):
    if ev.get('hf_peaky', 0) > 0.35 and ev['dur'] >= 0.15:
        return 'bell / chime (bright ringing tones)'
    if ev.get('hf_flat', 0) > 0.25 and ev['dur'] >= 0.3:
        return 'whoosh / swish (soft noise)'
    if ev.get('hf_flat', 0) > 0.25 and ev['dur'] < 0.3:
        return 'scratch / tick (writing, paper, click)'
    if ev['flatness'] < 0.02 and ev['dur'] >= 0.3:
        return 'music note / chord (part of the score)'
    d, att, c0, c1, cmean, low = ev['dur'], ev['attack_ms'], ev['centroid_start'], ev['centroid_end'], ev['centroid_mean'], ev['low_share']
    if low > 0.6 and cmean < 300:
        return 'low boom / impact'
    if d >= 0.35 and c1 > c0 * 1.6:
        return 'whoosh / riser (pitch sweeps up)'
    if d >= 0.35 and c0 > c1 * 1.6:
        return 'whoosh down / swoosh out'
    if d < 0.12 and att < 15:
        return 'click / tick' if cmean > 2500 else 'pop / thump'
    if d < 0.5 and cmean > 3500:
        return 'chime / ding / bright hit'
    if d < 0.5:
        return 'soft hit / pluck'
    if cmean > 2500:
        return 'airy texture (noise, wind, paper)'
    return 'tonal swell / sustained sound'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('stems')
    ap.add_argument('--min-rise-db', type=float, default=6.0)
    ap.add_argument('--leak-db', type=float, default=99.0, help='(off by default; Demucs stems tested clean) ignore bursts this far under simultaneous speech')
    ap.add_argument('--sim', type=float, default=1.1, help='(off by default) spectral similarity to the voice above which a burst counts as leftover narration')
    ap.add_argument('--band', choices=['full', 'high'], default='high', help='detect on full band or only above 3 kHz (effects)')
    ap.add_argument('--out')
    a = ap.parse_args()

    x, sr = mono(os.path.join(a.stems, 'no_vocals.wav'))
    v, _ = mono(os.path.join(a.stems, 'vocals.wav'))
    F, n = frames(x, sr)
    rms = np.sqrt((F ** 2).mean(axis=1))
    spec = np.abs(np.fft.rfft(F, axis=1))
    freqs = np.fft.rfftfreq(F.shape[1], 1 / sr)
    centroid = (spec * freqs).sum(axis=1) / (spec.sum(axis=1) + 1e-9)
    low = spec[:, freqs < 200].sum(axis=1) / (spec.sum(axis=1) + 1e-9)
    band = (freqs > 100) & (freqs < 8000)
    ps = spec[:, band] ** 2 + 1e-12
    flat = np.exp(np.log(ps).mean(axis=1)) / ps.mean(axis=1)  # 0 = pure tone, 1 = white noise
    hb = freqs > 3000
    hp = spec[:, hb] ** 2 + 1e-12
    hflat = np.exp(np.log(hp).mean(axis=1)) / hp.mean(axis=1)  # noisiness above 3 kHz
    hpeak = np.sort(hp, axis=1)[:, -8:].sum(axis=1) / hp.sum(axis=1)  # share of energy in a few strong tones (bells)

    level = db(rms)
    if a.band == 'high':
        # effects (whooshes, writing, bells) live above the piano/pluck score: detect on energy above 3 kHz
        level = 10 * np.log10((spec[:, freqs > 3000] ** 2).sum(axis=1) + 1e-12) - 10 * np.log10(F.shape[1])
    bed = median_filter(level, size=int(3.0 / HOP), mode='nearest')  # running music level (3 s)
    hot = level - bed > a.min_rise_db

    vf, _ = frames(v, sr)
    vrms = np.sqrt((vf ** 2).mean(axis=1))
    speech_db = db(np.median(vrms[vrms > np.percentile(vrms, 60)]))
    vlevel = db(vrms)[: len(level)]
    vspec = np.abs(np.fft.rfft(vf, axis=1))[: len(level)]

    events, i = [], 0
    while i < len(hot):
        if not hot[i]:
            i += 1
            continue
        j = i
        while j < len(hot) and (hot[j] or (j + 5 < len(hot) and hot[j:j + 5].any())):
            j += 1
        seg = slice(i, j)
        peak = i + int(np.argmax(rms[seg])) if j > i else i
        # leftover narration: the burst sits far under the voice that is speaking at that moment
        leak = vlevel[peak] > speech_db - 20 and level[peak] < vlevel[peak] - a.leak_db
        # same spectral shape as the voice during the burst = narration bleeding through
        if j > i:
            a1, b1 = spec[seg].mean(axis=0), vspec[seg].mean(axis=0)
            sim = float((a1 @ b1) / (np.linalg.norm(a1) * np.linalg.norm(b1) + 1e-9))
        else:
            sim = 0.0
        leak = leak or (sim > a.sim and vlevel[peak] > speech_db - 30)
        if j - i >= 3 and not leak:
            q = max(1, (j - i) // 4)
            events.append({
                't': round(i * HOP, 2),
                'dur': round((j - i) * HOP, 2),
                'attack_ms': int((peak - i) * HOP * 1000),
                'peak_vs_voice_db': round(float(level[peak] - speech_db), 1),
                'rise_over_music_db': round(float((level - bed)[seg].max()), 1),
                'centroid_start': int(np.median(centroid[i:i + q])),
                'centroid_end': int(np.median(centroid[j - q:j])),
                'centroid_mean': int(np.median(centroid[seg])),
                'voice_similarity': round(sim, 2),
                'flatness': round(float(np.median(flat[seg])), 3),
                'hf_flat': round(float(np.median(hflat[seg])), 3),
                'hf_peaky': round(float(np.median(hpeak[seg])), 3),
                'low_share': round(float(np.median(low[seg])), 2),
            })
        i = j
    for e in events:
        e['kind'] = describe(e)

    dur = len(x) / sr
    kinds = {}
    for e in events:
        kinds.setdefault(e['kind'], []).append(e)
    summary = {
        'duration_s': round(dur, 1),
        'events': len(events),
        'per_minute': round(len(events) / (dur / 60), 1),
        'music_bed_vs_voice_db': round(float(np.median(bed) - speech_db), 1),
        'by_kind': {k: {'count': len(v), 'median_dur': float(np.median([e['dur'] for e in v])),
                        'median_vs_voice_db': float(np.median([e['peak_vs_voice_db'] for e in v]))} for k, v in kinds.items()},
    }
    print(json.dumps(summary, indent=1))
    if a.out:
        json.dump({'summary': summary, 'events': events}, open(a.out, 'w'), indent=1)


if __name__ == '__main__':
    main()
