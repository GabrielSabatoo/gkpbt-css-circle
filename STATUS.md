# Project status — YouTube automation (aviation explainers)

_Last updated: 2026-11-11 04:30 UTC (full render running)_

## Done
- **Niche:** aviation explainers — `channel/niche.md`
- **Visual style + pacing rules:** `channel/visual-style.md`
- **Voice:** British narrator (Kokoro blend → Chatterbox clone) — `voice/`
  - `narrate.py` (natural pauses, `[pause]` markers, pronunciation fixes), `fix_chunks.py`, `align.py`
  - Settings: `voice/channel_voice.json` (exaggeration 0.6, cfg 0.4)
- **Video 001 — "The Invisible Circles Your Plane Must Stay Inside"** (`videos/001-invisible-circles/`)
  - Script + sources: `script.md` · narration text: `narration.txt` · 104-beat shot list: `shotlist.md`
  - Narration v2 approved (8:41) · `narration.chunks.json`, `word-timings.json`
- **Animation studio (Remotion):** `studio/`
  - Components: globe, range circles, gap field, routes, plane icon, rulers, kinetic text, formula, split screen
  - Video 001 Part 1 (0:00–1:36, beats 1–25) built: `studio/src/scenes/v001/Part1.tsx`

## In progress / next
1. **Full 1080p render of video 001 is running** (started 04:29 UTC, chunked):
   `studio/render_chunks.sh V001 16230 2700 public/audio/001-final-mix.wav out/v001-full-1080p.mp4`
   Progress: `studio/out/chunks-V001/progress.log`. Re-running the same command resumes (finished chunks are kept).
2. Video 001 is fully built: Part 1 (restyled to the reference look), Parts 2–4, end screen.
   Style reference: two Manicule videos studied with watch-video (frames + audio levels).
3. Audio: `audio/make_mix.py` → original synthesised music bed + whooshes, ~17 dB under voice, mastered to -14 LUFS
   (`studio/public/audio/001-final-mix.wav`, not in git).
4. To check by ear: "GE90-94B" pronunciation (~4:35), music bed taste, whoosh level.
5. Then: thumbnail, title/description, upload; agents/skill for the pipeline (Producer, Reviewer, Analyst).

## Restoring on a new machine
- Narration audio is not in git. Either download the backup parts from Google Drive ("YouTube Channel - Voice Backup" folder) and join them, or regenerate:
  `python voice/narrate.py videos/001-invisible-circles/narration.txt studio/public/audio/001-narration.wav` (~35 min on CPU)
- Voice tools need: Chatterbox (`pip install chatterbox-tts`, Python 3.11, `setuptools<81`), Kokoro, faster-whisper; network access to Hugging Face.
- Studio: `cd studio && npm install`; fonts are in `studio/public/fonts`.

## Known issue
- `git push` fails with 403: Claude has no GitHub access to this repo. Fix at https://claude.ai/connect-github. Until then, a git bundle backup is kept in Google Drive.
