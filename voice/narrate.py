"""Narrate a script in the channel voice with Chatterbox.

Usage:
    python voice/narrate.py script.txt output.wav

The script is split into paragraphs (blank lines) and sentence-based chunks
(Chatterbox degrades on very long inputs). Each chunk is voiced with the channel
reference clip, its edge silence is trimmed, and chunks are joined with pauses
that depend on where they fall, so the read sounds natural:

- between sentences inside a paragraph: `sentence_pause_ms`
- at a `[pause]` marker in the script: `dramatic_pause_ms`
- between paragraphs: `paragraph_pause_ms`

A `<output>.chunks.json` file records each chunk's text and start/end time.
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
PAUSE_MARK = "[pause]"


def for_speech(text: str) -> str:
    """Apply the channel's pronunciation fixes (spoken form only; scripts keep the written form)."""
    for written, spoken in CONFIG.get("pronunciations", {}).items():
        text = re.sub(rf"\b{re.escape(written)}\b", spoken, text)
    return text


def chunk_text(text: str, max_chars: int) -> list[str]:
    """Group sentences into chunks of at most `max_chars` (markers removed)."""
    sentences = re.split(r"(?<=[.!?])\s+", " ".join(text.replace(PAUSE_MARK, " ").split()))
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


def plan(text: str) -> list[tuple[str, int]]:
    """Return (chunk, pause_after_ms) pairs for the whole script."""
    cb = CONFIG["chatterbox"]
    out: list[tuple[str, int]] = []
    paragraphs = [p for p in re.split(r"\n\s*\n", text) if p.strip()]
    for pi, para in enumerate(paragraphs):
        parts = [p for p in para.split(PAUSE_MARK) if p.strip()]
        for si, part in enumerate(parts):
            chunks = chunk_text(part, cb["max_chunk_chars"])
            for ci, chunk in enumerate(chunks):
                if ci < len(chunks) - 1:
                    pause = cb["sentence_pause_ms"]
                elif si < len(parts) - 1:
                    pause = cb["dramatic_pause_ms"]
                elif pi < len(paragraphs) - 1:
                    pause = cb["paragraph_pause_ms"]
                else:
                    pause = 0
                out.append((chunk, pause))
    return out


def trim(wav: torch.Tensor, sr: int, threshold: float = 0.004, keep_ms: int = 40) -> torch.Tensor:
    """Cut leading/trailing near-silence, keeping a few ms so words aren't clipped."""
    loud = (wav.abs() > threshold).nonzero()
    if loud.numel() == 0:
        return wav
    keep = int(sr * keep_ms / 1000)
    start = max(0, int(loud[0, -1]) - keep)
    end = min(wav.shape[-1], int(loud[-1, -1]) + keep)
    return wav[..., start:end]


def main(script_path: str, out_path: str) -> None:
    cb = CONFIG["chatterbox"]
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = ChatterboxTTS.from_pretrained(device=device)
    ref = str(ROOT / CONFIG["reference_audio"])

    steps = plan(Path(script_path).read_text())
    pieces, log, t = [], [], 0.0
    for i, (chunk, pause_ms) in enumerate(steps, 1):
        print(f"[{i}/{len(steps)}] {chunk[:60]}...", flush=True)
        wav = model.generate(
            for_speech(chunk),
            audio_prompt_path=ref,
            exaggeration=cb["exaggeration"],
            cfg_weight=cb["cfg_weight"],
        )
        wav = trim(wav, model.sr)
        dur = wav.shape[-1] / model.sr
        log.append({"text": chunk, "start": round(t, 2), "end": round(t + dur, 2), "pause_after_ms": pause_ms})
        pieces.append(wav)
        if pause_ms:
            pieces.append(torch.zeros(1, int(model.sr * pause_ms / 1000)))
        t += dur + pause_ms / 1000
    audio = torch.cat(pieces, dim=-1)
    ta.save(out_path, audio, model.sr)
    Path(out_path + ".chunks.json").write_text(json.dumps(log, indent=1, ensure_ascii=False))
    print(f"Saved {out_path} ({audio.shape[-1] / model.sr:.1f}s)")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
