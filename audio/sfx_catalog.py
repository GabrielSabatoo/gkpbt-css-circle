"""Build a catalogue of sound-effect "moments" for a separated video.

Combines three detectors on the non-voice stem:
  1. short bright/noisy bursts above 3 kHz (bells, pops, clicks, writing scratches)  -> find_sfx.py --band high
  2. softer, longer noise swells above 3 kHz (whooshes)                              -> find_sfx.py --band high, low threshold
  3. steady repeating ticks (clocks, counters)                                       -> onset autocorrelation
Bursts closer than --merge seconds become one moment. For each moment it measures how much the
picture moves around it (vs the video's typical motion) and saves one frame, so a person can check.

Usage:
    python audio/sfx_catalog.py <stems_dir> <video.mp4> <out_dir>
"""
import argparse
import json
import os
import subprocess
import sys

import numpy as np
import soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))


def run_find(stems, rise, out):
    subprocess.run([sys.executable, os.path.join(HERE, 'find_sfx.py'), stems, '--band', 'high', '--min-rise-db', str(rise), '--out', out],
                   check=True, stdout=subprocess.DEVNULL)
    return json.load(open(out))['events']


def ticks(stems, thresh=0.45):
    x, sr = sf.read(os.path.join(stems, 'no_vocals.wav'), always_2d=True)
    x = x.mean(axis=1)
    hop = int(0.005 * sr)
    n = 4 * hop
    m = (len(x) - n) // hop
    idx = np.arange(n)[None, :] + hop * np.arange(m)[:, None]
    sp = np.abs(np.fft.rfft(x[idx] * np.hanning(n), axis=1))
    fr = np.fft.rfftfreq(n, 1 / sr)
    hf = 10 * np.log10((sp[:, fr > 2500] ** 2).sum(axis=1) + 1e-12)
    on = np.maximum(np.diff(hf, prepend=hf[0]), 0)
    win, step = int(4 / 0.005), int(1 / 0.005)
    runs = []
    for s in range(0, len(on) - win, step):
        o = on[s:s + win] - on[s:s + win].mean()
        ac = np.correlate(o, o, 'full')[win - 1:]
        ac /= ac[0] + 1e-9
        lo, hi = int(0.2 / 0.005), int(1.5 / 0.005)
        k = lo + int(np.argmax(ac[lo:hi]))
        if ac[k] > thresh:
            t, p = s * 0.005, k * 0.005
            if runs and t - runs[-1]['end'] <= 1.01 and abs(p - runs[-1]['every']) < 0.05:
                runs[-1]['end'] = t + 4
                runs[-1]['strength'] = max(runs[-1]['strength'], float(ac[k]))
            else:
                runs.append({'t': t, 'end': t + 4, 'every': round(p, 2), 'strength': float(ac[k])})
    return [r for r in runs if r['end'] - r['t'] >= 5]


def motion(video, fps=20):
    p = subprocess.run(['ffmpeg', '-v', 'error', '-i', video, '-an', '-vf', f'fps={fps},scale=96:54,format=gray', '-f', 'rawvideo', '-'],
                       check=True, capture_output=True)
    g = np.frombuffer(p.stdout, np.uint8).reshape(-1, 54, 96).astype(np.float32)
    d = np.abs(np.diff(g, axis=0)).mean(axis=(1, 2))
    return np.r_[0, d], fps


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('stems')
    ap.add_argument('video')
    ap.add_argument('out')
    ap.add_argument('--merge', type=float, default=0.35)
    ap.add_argument('--strong', type=float, default=13.0, help='keep bursts rising at least this much (dB)')
    a = ap.parse_args()
    os.makedirs(os.path.join(a.out, 'frames'), exist_ok=True)

    bursts = [e for e in run_find(a.stems, a.strong, os.path.join(a.out, 'bursts.json'))]
    soft = run_find(a.stems, 6, os.path.join(a.out, 'soft.json'))
    whooshes = [e for e in soft if e['dur'] >= 0.3 and e['hf_flat'] > 0.15]
    for e in whooshes:
        e['kind'] = 'whoosh / swish (soft noise)'
    tick_runs = ticks(a.stems)
    tick_spans = [(r['t'], r['end']) for r in tick_runs]

    evs = [e for e in bursts + whooshes if not any(s <= e['t'] <= t for s, t in tick_spans)]
    evs.sort(key=lambda e: e['t'])
    moments = []
    for e in evs:
        if moments and e['t'] - moments[-1]['end'] <= a.merge:
            m = moments[-1]
            m['end'] = max(m['end'], e['t'] + e['dur'])
            m['kinds'].append(e['kind'])
            m['peak_rise_db'] = max(m['peak_rise_db'], e['rise_over_music_db'])
        else:
            moments.append({'t': e['t'], 'end': e['t'] + e['dur'], 'kinds': [e['kind']], 'peak_rise_db': e['rise_over_music_db']})
    for r in tick_runs:
        moments.append({'t': r['t'], 'end': r['end'], 'kinds': [f"repeating ticks every {r['every']} s (clock / counter)"], 'peak_rise_db': None})
    moments.sort(key=lambda m: m['t'])

    d, fps = motion(a.video)
    base = float(np.median(d))
    for i, m in enumerate(moments):
        lo, hi = int(max(0, m['t'] - 0.3) * fps), int((m['t'] + 0.5) * fps) + 1
        m['motion_x_typical'] = round(float(d[lo:hi].max() / (base + 1e-6)), 1)
        # main label: most specific kind present
        order = ['repeating', 'bell', 'whoosh', 'chime', 'scratch', 'click', 'pop', 'soft hit', 'music']
        m['label'] = next((k for o in order for k in m['kinds'] if k.startswith(o)), m['kinds'][0])
        m['dur'] = round(m['end'] - m['t'], 2)
        m['n'] = len(m['kinds'])
        m['frame'] = f'frames/{i:03d}.jpg'
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f"{m['t'] + 0.25:.2f}", '-i', a.video, '-frames:v', '1', '-vf', 'scale=320:-1',
                        os.path.join(a.out, m['frame'])], check=True)
    json.dump(moments, open(os.path.join(a.out, 'moments.json'), 'w'), indent=1)
    print(len(moments), 'moments;', len(tick_runs), 'tick runs;', len(whooshes), 'whooshes')


if __name__ == '__main__':
    main()
