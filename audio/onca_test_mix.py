"""Soundtrack for the FerasIncríveis style test: night ambience + dark drone + sparse effects on reveals + narration.
All synthesised (royalty-free). Usage: python audio/onca_test_mix.py narration.wav out.wav"""
import sys, os
import numpy as np, soundfile as sf
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import sfx
from scipy.signal import butter, lfilter

SR = 44100
TOTAL = 35.0
rng = np.random.default_rng(5)
n = int(TOTAL * SR); t = np.arange(n) / SR

def bp(x, lo, hi): b, a = butter(2, [lo / (SR / 2), hi / (SR / 2)], 'band'); return lfilter(b, a, x)
def lp(x, f): b, a = butter(2, f / (SR / 2), 'low'); return lfilter(b, a, x)
def db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)

# --- ambience ---
river = lp(rng.standard_normal(n), 900) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.11 * t))
crick = np.zeros(n)
for k in range(3):  # three cricket voices, chirp trains
    f0 = [4300, 4700, 5100][k]; rate = [2.6, 3.1, 2.2][k]
    gate = (np.sin(2 * np.pi * rate * t + k) > 0.6).astype(float) * (np.sin(2 * np.pi * 38 * t) > 0)
    crick += np.sin(2 * np.pi * f0 * t) * lp(gate, 300) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.07 * t + k))
frogs = np.zeros(n)
for st in np.arange(1.0, TOTAL, 1.7):
    s0 = int((st + rng.uniform(0, 0.6)) * SR); d = int(0.12 * SR)
    if s0 + d < n: frogs[s0:s0 + d] += np.sin(2 * np.pi * 420 * np.arange(d) / SR) * np.hanning(d) * (np.sin(2 * np.pi * 30 * np.arange(d) / SR) > 0)
drone = (np.sin(2 * np.pi * 55 * t) + 0.6 * np.sin(2 * np.pi * 82.4 * t) + 0.3 * np.sin(2 * np.pi * 110.3 * t)) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.05 * t))
shimmer = bp(rng.standard_normal(n), 2600, 3600) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.09 * t))

voice, vsr = sf.read(sys.argv[1])
if voice.ndim > 1: voice = voice.mean(1)
voice = np.interp(np.arange(0, len(voice), vsr / SR), np.arange(len(voice)), voice)
v = np.zeros(n); v[:min(n, len(voice))] = voice[:n]
speech = db(v[np.abs(v) > 0.01])

def level(x, rel): return x * 10 ** ((speech + rel - db(x)) / 20)
# the drone/tension rises at the reveal
rise = np.clip((t - 14.0) / 1.0, 0, 1) * (1 - 0.5 * np.clip((t - 21) / 2, 0, 1))
amb = level(river, -30) + level(crick, -33) + level(frogs, -36) + level(shimmer, -34) * (0.5 + 0.8 * rise) + level(drone, -27) * (0.6 + 0.8 * rise)
amb *= np.clip(t / 1.2, 0, 1) * np.clip((TOTAL - t) / 2.0, 0, 1)
# ambience dips at the branch snap (silence before the scare)
amb *= 1 - 0.6 * np.exp(-((t - 7.6) / 0.6) ** 2)

# --- effects (only on reveals) ---
out = np.stack([v * 0.95, v * 0.95], 1) + np.stack([amb, amb * 0.96], 1)
def add(x, at, rel, pan=0.5):
    x = x * 10 ** ((speech + rel - db(x[np.abs(x) > 0.05 * np.abs(x).max()])) / 20)
    s0 = int(at * SR); e = min(n, s0 + len(x))
    out[s0:e, 0] += x[:e - s0] * (1 - pan) * 1.4; out[s0:e, 1] += x[:e - s0] * pan * 1.4

snap = bp(rng.standard_normal(int(0.09 * SR)), 1200, 7000) * np.exp(-np.arange(int(0.09 * SR)) / (0.012 * SR))
snap[:int(0.01 * SR)] *= 2.0
add(snap, 7.22, -14, 0.75)                          # branch snap
add(sfx.tick(True, rng), 9.43, -20, 0.3)            # torch click
add(sfx.ding(1760.0), 12.35, -24, 0.7)              # eyes glint
add(sfx.thump(rng), 14.85, -16, 0.5)                # reveal: deep hit
add(sfx.bell(587.3, 3.0), 14.9, -19, 0.5)           # reveal: low bell
add(sfx.pop(660.0), 15.4, -26, 0.4)                 # title lands
add(sfx.ding(1318.5), 17.9, -27, 0.6)               # eye glows
add(sfx.whoosh(0.9, rng=rng), 21.05 - 0.4, -24, 0.5) # to the weight scene
add(sfx.scratch(0.6, rng), 21.4, -28, 0.4)          # bar draws
add(sfx.scratch(0.5, rng), 24.1, -28, 0.6)
add(sfx.whoosh(0.7, rng=rng), 27.15 - 0.3, -25, 0.5)
for i in range(4): add(sfx.scratch(0.4, rng), 28.35 + i * 0.45, -29, 0.35 + i * 0.1)
add(sfx.thump(rng), 31.6, -20, 0.5)                 # "a mais forte"
add(sfx.bell(587.3, 3.0), 31.65, -24, 0.5)

peak = np.abs(out).max(); out *= 0.95 / peak if peak > 0.95 else 1
sf.write(sys.argv[2], out.astype(np.float32), SR)
print('ok', round(speech, 1))
