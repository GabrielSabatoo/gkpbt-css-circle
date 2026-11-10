"""Narrate a script in the channel voice with Chatterbox.

Usage:
    python voice/narrate.py script.txt output.wav

Long scripts are split into sentence-based chunks (Chatterbox degrades on very
long inputs), each chunk is voiced with the channel reference clip, and the
results are joined with a short pause.
"""
import json
import re
import sys
from pathlib import Path

import torch
import torchaudio as ta
from chatterbox.tts import ChatterboxTTS

ROOT = Path(__file__).resolve().parent.parent
CONFIG = json.loads((ROOT / "voice" / "channel_voice.json").read_text())


def for_speech(text: str) -> str:
    """Apply the channel's pronunciation fixes (spoken form only; scripts keep the written form)."""
    for written, spoken in CONFIG.get("pronunciations", {}).items():
        text = re.sub(rf"\b{re.escape(written)}\b", spoken, text)
    return text


def chunk_text(text: str, max_chars: int) -> list[str]:
    sentences = re.split(r"(?<=[.!?])\s+", " ".join(text.split()))
    chunks, current = [], ""
    for s in sentences:
        if current and len(current) + len(s) + 1 > max_chars:
            chunks.append(current)
            current = s
        else:
            current = f"{current} {s}".strip()
    if current:
        chunks.append(current)
    return chunks


def main(script_path: str, out_path: str) -> None:
    cb = CONFIG["chatterbox"]
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = ChatterboxTTS.from_pretrained(device=device)
    ref = str(ROOT / CONFIG["reference_audio"])
    pause = torch.zeros(1, int(model.sr * cb["pause_between_chunks_ms"] / 1000))

    chunks = chunk_text(Path(script_path).read_text(), cb["max_chunk_chars"])
    pieces = []
    for i, chunk in enumerate(chunks, 1):
        print(f"[{i}/{len(chunks)}] {chunk[:60]}...", flush=True)
        wav = model.generate(
            for_speech(chunk),
            audio_prompt_path=ref,
            exaggeration=cb["exaggeration"],
            cfg_weight=cb["cfg_weight"],
        )
        pieces += [wav, pause]
    audio = torch.cat(pieces[:-1], dim=-1)
    ta.save(out_path, audio, model.sr)
    print(f"Saved {out_path} ({audio.shape[-1] / model.sr:.1f}s)")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
