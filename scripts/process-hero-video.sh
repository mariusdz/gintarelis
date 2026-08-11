#!/bin/bash
set -e
export LC_NUMERIC=C

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FFMPEG="$ROOT/tools/ffmpeg"
FFPROBE="$ROOT/tools/ffprobe"
SRC="$ROOT/video/osia-jura.mp4"
OUT_DIR="$ROOT/assets/video"
IMG_DIR="$ROOT/assets/images"
TMP="$ROOT/tmp_hero"

mkdir -p "$OUT_DIR" "$IMG_DIR" "$TMP"

DUR=$($FFPROBE -v error -show_entries format=duration -of csv=p=0 "$SRC")
DUR=${DUR%.*}
echo "Source: duration=${DUR}s, resolution=$("$FFPROBE" -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate -of csv=s=x:p=0 "$SRC")"

CANDIDATES=(1.0 1.5 2.0 2.5 3.0)
BEST_N=1.5
BEST_SSIM=0

for N in "${CANDIDATES[@]}"; do
  # Skip candidates that leave almost no middle body
  if awk "BEGIN {exit !($N * 2 >= $DUR - 0.2)}"; then
    continue
  fi
  BODY_END=$(awk "BEGIN {print $DUR - $N}")
  echo "Testing overlap ${N}s..."
  "$FFMPEG" -y -i "$SRC" -filter_complex "
    [0:v]trim=start=$BODY_END:end=$DUR,setpts=PTS-STARTPTS,fps=fps=24[tail];
    [0:v]trim=start=0:end=$N,setpts=PTS-STARTPTS,fps=fps=24[head]" \
    -map [tail] -c:v libx264 -crf 23 -pix_fmt yuv420p -an "$TMP/tail_${N}.mp4" \
    -map [head] -c:v libx264 -crf 23 -pix_fmt yuv420p -an "$TMP/head_${N}.mp4" >/dev/null 2>&1
  SSIM=$("$FFMPEG" -y -i "$TMP/tail_${N}.mp4" -i "$TMP/head_${N}.mp4" -lavfi ssim -f null - 2>&1 | grep -oP 'All:[0-9.]+' | head -1 | cut -d: -f2)
  echo "  SSIM = $SSIM"
  if awk "BEGIN {exit !($SSIM > $BEST_SSIM)}"; then
    BEST_SSIM=$SSIM
    BEST_N=$N
  fi
done

echo "Selected overlap: ${BEST_N}s (SSIM $BEST_SSIM)"

BODY_START=$BEST_N
BODY_END=$(awk "BEGIN {print $DUR - $BEST_N}")

# Correct seamless loop: start at frame N, play middle body, then crossfade tail->head.
# The crossfade ends at frame N, so the loop boundary (N -> N) is perfectly continuous.
build_loop() {
  local output=$1
  local codec_args=$2
  "$FFMPEG" -y -i "$SRC" -filter_complex "
    [0:v]trim=start=$BODY_START:end=$BODY_END,setpts=PTS-STARTPTS,fps=fps=24[body];
    [0:v]trim=start=$BODY_END:end=$DUR,setpts=PTS-STARTPTS,fps=fps=24[tail];
    [0:v]trim=start=0:end=$BEST_N,setpts=PTS-STARTPTS,fps=fps=24[head];
    [tail][head]xfade=transition=fade:duration=$BEST_N:offset=0[xf];
    [body][xf]concat=n=2:v=1:a=0,format=pix_fmts=yuv420p[outv]" \
    -map [outv] -an $codec_args "$output"
}

build_loop "$OUT_DIR/hero.mp4" "-c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -movflags +faststart"
build_loop "$OUT_DIR/hero.webm" "-c:v libvpx-vp9 -crf 25 -b:v 0 -deadline good -cpu-used 2 -row-mt 1"

# Poster from a representative frame inside the loop (original middle)
POSTER_TIME=$(awk "BEGIN {print $DUR / 2}")
"$FFMPEG" -y -ss "$POSTER_TIME" -i "$SRC" -vframes 1 -c:v libwebp -q:v 85 "$IMG_DIR/poster.webp"

echo "Outputs:"
ls -lh "$OUT_DIR/hero.mp4" "$OUT_DIR/hero.webm" "$IMG_DIR/poster.webp"

# Verify loop: first and last frames of the output should be nearly identical
"$FFMPEG" -y -i "$OUT_DIR/hero.mp4" -vf "select='eq(n,0)'" -frames:v 1 -update 1 "$TMP/first.png"
LAST=$("$FFPROBE" -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$OUT_DIR/hero.mp4")
LAST=$((LAST - 1))
"$FFMPEG" -y -i "$OUT_DIR/hero.mp4" -vf "select='eq(n,$LAST)'" -frames:v 1 -update 1 "$TMP/last.png"
PSNR=$("$FFMPEG" -y -i "$TMP/first.png" -i "$TMP/last.png" -lavfi psnr -f null - 2>&1 | grep -oP 'average:[0-9.]+' | head -1 | cut -d: -f2)
echo "Loop verification PSNR (first vs last frame): ${PSNR} dB"

rm -rf "$TMP"
