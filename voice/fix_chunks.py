"""Regenerate selected chunks of a narration made by narrate.py and splice them in.

Usage:
    python voice/fix_chunks.py script.txt in.wav out.wav 12,30

Uses <in.wav>.chunks.json (written by narrate.py) for exact chunk positions, and the
current script text for the new wording. Writes <out.wav>.chunks.json with updated times.
"""
import json, sys
from pathlib import Path
import torch, torchaudio as ta
sys.path.insert(0, str(Path(__file__).resolve().parent))
from narrate import CONFIG, ROOT, for_speech, plan, trim
from chatterbox.tts import ChatterboxTTS

script, wav_in, wav_out, idx = sys.argv[1], sys.argv[2], sys.argv[3], {int(x) for x in sys.argv[4].split(',')}
cb = CONFIG['chatterbox']
audio, sr = ta.load(wav_in)
log = json.loads(Path(wav_in + '.chunks.json').read_text())
steps = plan(Path(script).read_text())
assert len(steps) == len(log), f'script now has {len(steps)} chunks, audio has {len(log)}; regenerate fully'
model = ChatterboxTTS.from_pretrained(device='cuda' if torch.cuda.is_available() else 'cpu')
ref = str(ROOT / CONFIG['reference_audio'])
pieces, new_log, t = [], [], 0.0
for k, ((text, pause_ms), old) in enumerate(zip(steps, log)):
    if k in idx:
        print('regen', k, text[:70], flush=True)
        wav = trim(model.generate(for_speech(text), audio_prompt_path=ref, exaggeration=cb['exaggeration'], cfg_weight=cb['cfg_weight']), sr)
    else:
        wav = audio[:, int(old['start'] * sr):int(old['end'] * sr)]
    dur = wav.shape[-1] / sr
    new_log.append({'text': text, 'start': round(t, 2), 'end': round(t + dur, 2), 'pause_after_ms': pause_ms})
    pieces.append(wav)
    if pause_ms:
        pieces.append(torch.zeros(1, int(sr * pause_ms / 1000)))
    t += dur + pause_ms / 1000
res = torch.cat(pieces, dim=-1)
ta.save(wav_out, res, sr)
Path(wav_out + '.chunks.json').write_text(json.dumps(new_log, indent=1, ensure_ascii=False))
print('saved', round(res.shape[-1] / sr, 1), 's')
