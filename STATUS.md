# Project status — YouTube automation (aviation explainers)

_Last updated: 2026-11-11 (after Part 1 revisions)_

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
1. Part 1 revisions are DONE in code (drifting plane, beige pilot + speech balloon, bright day palette after the hook,
   black planes, Fraunces + IBM Plex Mono fonts, watermark removed). Render was cancelled at 248/2918 frames —
   re-render the preview (~30–40 min) and send for review:
   `cd studio && npx remotion render src/index.ts V001-Part1 out/v001-part1-v2-720p.mp4 --scale=0.6666666666666666 --concurrency=4`
   - Optional: study the reference video (Manicule, "Why Planes Cross the Atlantic at Night") with the watch-video plugin
     once its MP4 is in Google Drive (YouTube downloads are blocked on the cloud machine).
2. Part 2: 1953 → 1985 → Pacific (beats 26–56)
3. Part 3: safety numbers, Midway, Air Transat (beats 57–85)
4. Part 4: today (330/370 min), outro, end screen; full 1080p render; sound design
5. Then: agents/skill for the pipeline (Producer, Reviewer, Analyst)

## Restoring on a new machine
- Narration audio is not in git. Either download the backup parts from Google Drive ("YouTube Channel - Voice Backup" folder) and join them, or regenerate:
  `python voice/narrate.py videos/001-invisible-circles/narration.txt studio/public/audio/001-narration.wav` (~35 min on CPU)
- Voice tools need: Chatterbox (`pip install chatterbox-tts`, Python 3.11, `setuptools<81`), Kokoro, faster-whisper; network access to Hugging Face.
- Studio: `cd studio && npm install`; fonts are in `studio/public/fonts`.

## Known issue
- `git push` fails with 403: Claude has no GitHub access to this repo. Fix at https://claude.ai/connect-github. Until then, a git bundle backup is kept in Google Drive.
