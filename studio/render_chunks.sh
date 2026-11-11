#!/usr/bin/env bash
# Render a composition in chunks (video only), join them, and add the final soundtrack.
# Usage: render_chunks.sh <composition> <total_frames> <chunk_frames> <audio.wav> <out.mp4> [scale]
set -euo pipefail
COMP=$1; TOTAL=$2; CHUNK=$3; AUDIO=$4; OUT=$5; SCALE=${6:-1}
cd "$(dirname "$0")"
WORK=out/chunks-$COMP; mkdir -p "$WORK"
LOG=$WORK/progress.log; : > "$LOG"
i=0; start=0
while [ $start -lt $TOTAL ]; do
  end=$(( start + CHUNK - 1 )); [ $end -ge $TOTAL ] && end=$(( TOTAL - 1 ))
  f=$(printf "%s/chunk_%02d.mp4" "$WORK" $i)
  if [ ! -s "$f" ]; then
    echo "$(date -u +%H:%M:%S) chunk $i frames $start-$end" >> "$LOG"
    npx remotion render src/index.ts "$COMP" "$f.tmp.mp4" --frames=$start-$end --muted --scale=$SCALE --concurrency=4 --crf=18 --log=error >> "$LOG" 2>&1
    mv "$f.tmp.mp4" "$f"
  fi
  i=$((i+1)); start=$((end+1))
done
ls "$WORK"/chunk_*.mp4 | sed "s#^#file '$PWD/#; s#\$#'#" > "$WORK/list.txt"
ffmpeg -v error -y -f concat -safe 0 -i "$WORK/list.txt" -c copy "$WORK/video.mp4"
ffmpeg -v error -y -i "$WORK/video.mp4" -i "$AUDIO" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -shortest -movflags +faststart "$OUT"
echo "$(date -u +%H:%M:%S) DONE $OUT" >> "$LOG"
touch "$WORK/DONE"
