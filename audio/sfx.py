"""Original synthesised sound effects (royalty-free, made in code) in the spirit of the reference videos.

Kinds:
  bell    soft bell for chapter / title cards
  ding    small bright ding for labels, cards, tags, big numbers
  pop     short pitched pop for small items appearing (list items, check marks, dots)
  tick    clock tick (alternating tick / tock)
  roll    fast counter roll (ticks every 60 ms) while a number counts up
  whoosh  soft noise sweep for scene changes and camera moves
  swish   smaller, shorter whoosh for an element sliding in
  scratch pen-on-paper scratch for lines, bars and rulers drawing
  thump   rubber-stamp thump (low knock + paper slap)
"""
import numpy as np
from scipy.signal import butter, lfilter

SR = 44100


def _t(d):
    return np.arange(int(d * SR)) / SR


def _bp(x, lo, hi, order=2):
    b, a = butter(order, [lo / (SR / 2), min(hi / (SR / 2), 0.99)], 'band')
    return lfilter(b, a, x)


def _lp(x, f, order=2):
    b, a = butter(order, f / (SR / 2), 'low')
    return lfilter(b, a, x)


def _norm(x):
    return x / (np.max(np.abs(x)) + 1e-9)


def bell(freq=1174.7, d=2.2, rng=None):
    t = _t(d)
    parts = [(1.0, 1.0, 1.6), (2.76, 0.45, 0.9), (5.40, 0.22, 0.5), (8.93, 0.10, 0.3), (0.5, 0.25, 2.0)]
    x = sum(a * np.sin(2 * np.pi * freq * r * t) * np.exp(-t / tau) for r, a, tau in parts)
    x *= 1 - np.exp(-t / 0.004)
    return _norm(x)


def ding(freq=2093.0, d=0.6, rng=None):
    t = _t(d)
    x = np.sin(2 * np.pi * freq * t) * np.exp(-t / 0.18) + 0.3 * np.sin(2 * np.pi * freq * 2.01 * t) * np.exp(-t / 0.07)
    x *= 1 - np.exp(-t / 0.002)
    return _norm(x)


def pop(freq=880.0, d=0.12, rng=None):
    t = _t(d)
    f = freq * (1 + 0.6 * np.exp(-t / 0.012))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.035)
    return _norm(x)


def tick(hi=True, rng=None):
    rng = rng or np.random.default_rng(0)
    t = _t(0.05)
    f = 3200 if hi else 2500
    x = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.004) + 0.5 * _bp(rng.standard_normal(len(t)), 2000, 7000) * np.exp(-t / 0.002)
    return _norm(x)


def roll(d=1.2, every=0.06, rng=None):
    rng = rng or np.random.default_rng(1)
    out = np.zeros(int(d * SR) + int(0.05 * SR))
    for k, s in enumerate(np.arange(0, d, every)):
        x = tick(k % 2 == 0, rng) * (0.6 + 0.4 * (1 - s / d))
        i = int(s * SR)
        out[i:i + len(x)] += x
    return _norm(out)


def whoosh(d=0.8, lo=300, hi=5000, rng=None):
    rng = rng or np.random.default_rng(2)
    t = _t(d)
    n = rng.standard_normal(len(t))
    # sweep: blend a dark and a bright band as the sound passes
    k = np.linspace(0, 1, len(t))
    x = _bp(n, lo, lo * 4) * (1 - k) + _bp(n, hi / 4, hi) * k
    env = np.sin(np.pi * k) ** 2 * (0.6 + 0.4 * k)
    return _norm(_lp(x * env, 7000))


def swish(rng=None):
    return whoosh(d=0.42, lo=600, hi=7000, rng=rng)


def scratch(d=0.5, rng=None):
    rng = rng or np.random.default_rng(3)
    t = _t(d)
    n = _bp(rng.standard_normal(len(t)), 1800, 7500)
    grain = np.abs(_lp(rng.standard_normal(len(t)), 40))  # uneven pen pressure
    env = np.minimum(1, t / 0.03) * np.minimum(1, (d - t) / 0.08)
    return _norm(n * (0.3 + grain / (grain.max() + 1e-9)) * env)


def thump(rng=None):
    rng = rng or np.random.default_rng(4)
    t = _t(0.35)
    knock = np.sin(2 * np.pi * 95 * t * (1 + 0.5 * np.exp(-t / 0.02))) * np.exp(-t / 0.07)
    slap = _bp(rng.standard_normal(len(t)), 800, 5000) * np.exp(-t / 0.018)
    return _norm(knock + 0.45 * slap)


MAKERS = {
    'bell': bell, 'ding': ding, 'pop': pop, 'roll': roll, 'whoosh': whoosh, 'swish': swish,
    'scratch': scratch, 'thump': thump, 'tick': lambda rng=None: tick(True, rng),
}

# level of each kind relative to the voice (speech RMS), in dB — the reference sits ~20-30 dB under
LEVEL_DB = {'bell': -17, 'ding': -21, 'pop': -24, 'tick': -21, 'roll': -20, 'whoosh': -22, 'swish': -23, 'scratch': -25, 'thump': -18}
# where the sound's main moment is, so it lands on the visual onset (seconds into the sound)
LEAD = {'whoosh': 0.32, 'swish': 0.16}

PENTA = [1174.7, 1318.5, 1480.0, 1760.0, 1975.5]  # D major pentatonic, matches the music bed


def render(cues, total, speech_rms_db, seed=11):
    """cues: list of {'t': seconds, 'kind': str}. Returns a stereo track at SR."""
    rng = np.random.default_rng(seed)
    out = np.zeros((int(total * SR), 2))
    for i, c in enumerate(cues):
        k = c['kind']
        if k == 'bell':
            x = bell(PENTA[i % 3])
        elif k == 'ding':
            x = ding(PENTA[(i % 5)] * 2)
        elif k == 'pop':
            x = pop(rng.choice([740, 880, 988]))
        elif k == 'tick':
            x = tick(c.get('hi', True), rng)
        else:
            x = MAKERS[k](rng=rng)
        rms = np.sqrt(np.mean(x[np.abs(x) > 0.05 * np.abs(x).max()] ** 2))
        x = x * 10 ** ((speech_rms_db + LEVEL_DB[k] + c.get('gain_db', 0)) / 20) / (rms + 1e-9)
        s = int(max(0, c['t'] - LEAD.get(k, 0)) * SR)
        e = min(len(out), s + len(x))
        pan = 0.5 + 0.25 * np.sin(i * 2.1)
        out[s:e, 0] += x[: e - s] * (1 - pan) * 1.2
        out[s:e, 1] += x[: e - s] * pan * 1.2
    return out
