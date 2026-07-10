#!/usr/bin/env bash
set -euo pipefail
TOKEN=$(git remote get-url origin | grep -oP '(?<=://)[^@]+(?=@)' | cut -d: -f2)
if [ -z "${TOKEN:-}" ]; then TOKEN="${GIT_PUSH_TOKEN:-${GITHUB_TOKEN:-}}"; fi
if [ -z "${TOKEN:-}" ]; then echo "NO_TOKEN"; exit 2; fi
BODY='Quando apri una chat dalla lista conversazioni, quella non salta piu in cima: resta nella sua posizione, evidenziata (conv-row-active). Tolto il .sort che spingeva in cima la conversazione aperta, nei due punti (cassetto conversazioni + lista fluttuante). La lista resta nell ordine del server (piu recenti prima), stabile. Richiesto da Nicola. 1 file, +3/-5.'
curl -sS -X POST \
  -H "Authorization: token ${TOKEN}" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/NicolaeRotaru/ad-mycity/pulls \
  -d "$(printf '{"title":%s,"head":"fix/lista-conversazioni-stabile-v2","base":"main","body":%s}' \
    "\"Lista conversazioni: ordine stabile, la chat aperta resta al suo posto\"" \
    "$(printf '%s' "$BODY" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')")" \
  | grep -E '"html_url"|"number"|"message"' | head -5
