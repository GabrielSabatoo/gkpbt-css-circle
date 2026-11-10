# Word-level timestamps for a narration (faster-whisper). Usage: python voice/align.py narration.wav word-timings.json
import sys, json
from faster_whisper import WhisperModel
wav, out = sys.argv[1], sys.argv[2]
m = WhisperModel("small.en", device="cpu", compute_type="int8")
segs, info = m.transcribe(wav, word_timestamps=True, beam_size=5, vad_filter=False)
words = []
for s in segs:
    for w in s.words:
        words.append({"w": w.word.strip(), "start": round(w.start, 2), "end": round(w.end, 2)})
json.dump(words, open(out, "w"), indent=0)
print(len(words), "words")
