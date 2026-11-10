# Usage: python voice/fix_chunks.py script.txt in.wav out.wav word-timings.json 26,29
"""Replace time ranges of a narration with regenerated chunks.
Ranges are found from word timings: the chunk's first word start and last word end, snapped outward to the nearest exact-silence run."""
import sys, json, re, numpy as np, torch, torchaudio as ta
sys.path.insert(0, 'voice')
from narrate import chunk_text, for_speech, CONFIG, ROOT
from chatterbox.tts import ChatterboxTTS
script, wav_in, wav_out, words_json, idx = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4], [int(x) for x in sys.argv[5].split(',')]
cb = CONFIG['chatterbox']
audio, sr = ta.load(wav_in); a = audio[0].numpy()
W = json.load(open(words_json))
norm = lambda s: re.sub(r'[^a-z]', '', s.lower())
chunks = chunk_text(open(script).read(), cb['max_chunk_chars'])
zero = np.concatenate([[0], (a == 0).astype(np.int8), [0]]); d = np.diff(zero)
runs = [(s, e) for s, e in zip(np.where(d == 1)[0], np.where(d == -1)[0]) if e - s >= int(sr * 0.2)]

def find_seq(seq, after=0.0):
    seq = [norm(x) for x in seq if norm(x)]
    for i in range(len(W) - len(seq)):
        if W[i]['start'] >= after and all(norm(W[i + j]['w']) == seq[j] for j in range(len(seq))):
            return i
    raise ValueError(f'not found: {seq}')

ranges = []
for k in idx:
    words = chunks[k].split()
    # skip leading words containing digits (the transcript writes numbers differently)
    lead = 0
    while re.search(r'\d', words[lead]): lead += 1
    if lead == 0 and len(words) > 1 and re.search(r'\d', words[1]): lead = 2
    i0 = find_seq(words[lead:lead + 3]) - lead; i1 = find_seq(words[-3:], after=W[i0]['start'])
    t0, t1 = int(W[i0]['start'] * sr), int(W[i1 + 2]['end'] * sr)
    s0 = max([e for s, e in runs if e <= t0 + int(0.15 * sr)], default=t0)   # end of silence before
    s1 = min([s for s, e in runs if s >= t1 - int(0.15 * sr)], default=t1)   # start of silence after
    ranges.append((k, s0, s1)); print('chunk', k, 'replaces', round(s0 / sr, 2), '-', round(s1 / sr, 2), 's', flush=True)

model = ChatterboxTTS.from_pretrained(device='cuda' if torch.cuda.is_available() else 'cpu')
ref = str(ROOT / CONFIG['reference_audio'])
out, pos = [], 0
for k, s0, s1 in sorted(ranges, key=lambda r: r[1]):
    print('regen', k, for_speech(chunks[k])[:70], flush=True)
    w = model.generate(for_speech(chunks[k]), audio_prompt_path=ref, exaggeration=cb['exaggeration'], cfg_weight=cb['cfg_weight'])[0].numpy()
    out += [a[pos:s0], w]; pos = s1
out.append(a[pos:])
res = torch.from_numpy(np.concatenate(out).astype(np.float32))[None]
ta.save(wav_out, res, sr); print('saved', round(res.shape[-1] / sr, 1), 's')
