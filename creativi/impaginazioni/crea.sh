#!/usr/bin/env bash
# Rifà da capo post, reel e copertina della storia con le impaginazioni di questa cartella.
# Uso: bash creativi/impaginazioni/crea.sh   → i file finiti escono in creativi/impaginazioni/output/
set -euo pipefail
cd "$(dirname "$0")"
[ -d node_modules/@fontsource/fraunces ] || npm install --silent
OUT=output
rm -rf "$OUT/fotogrammi"; mkdir -p "$OUT"
node render.mjs post "$OUT/post-1080x1350.png"
node render.mjs reel "$OUT/fotogrammi"
python3 musica.py "$OUT/musica.wav"
ffmpeg -y -loglevel error -framerate 30 -i "$OUT/fotogrammi/f%04d.jpg" -i "$OUT/musica.wav" \
  -filter_complex "[1:a]loudnorm=I=-14:TP=-1.5:LRA=11[a]" -map 0:v -map "[a]" \
  -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 18 -preset slow \
  -c:a aac -b:a 128k -ar 48000 -shortest -movflags +faststart "$OUT/reel-15s.mp4"
ffmpeg -y -loglevel error -ss 2.2 -i "$OUT/reel-15s.mp4" -frames:v 1 -q:v 2 "$OUT/storia-copertina-1080x1920.jpg"
rm -rf "$OUT/fotogrammi" "$OUT/musica.wav"
echo "Fatto: $(pwd)/$OUT/"
