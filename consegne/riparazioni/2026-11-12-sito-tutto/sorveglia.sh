#!/usr/bin/env bash
# Un giro di sorveglianza della campagna, in un comando solo (skill `riparazione`, «La sorveglianza»).
# Uso, dalla radice di ad-mycity:  bash consegne/riparazioni/2026-11-12-sito-tutto/sorveglia.sh <onda>
# Per ogni sessione dell'onda in sessioni.json: guardia-ramo, valida-referto sul referto parziale, poi una
# prova-unione per tutta l'onda. Scrive una riga per sessione nel diario e stampa solo i rossi e i finiti.
# Lo stato delle sessioni (get_session) e la quota li guarda la regista a parte: da bash non si vedono.
set -uo pipefail
ONDA="${1:?serve il numero dell onda}"
RADICE="$(cd "$(dirname "$0")/../../.." && pwd)"
C="consegne/riparazioni/2026-11-12-sito-tutto"
SITO="${MARKETPLACE_REPO:-$RADICE/../mycity}"
P="node $RADICE/cervello/riparazione-sessioni.mjs"
DIARIO="$RADICE/$C/diario-della-sorveglianza.txt"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
cd "$RADICE" || exit 2
ORA="$(TZ=Europe/Rome date '+%Y-%m-%d %H:%M')"

git -C "$SITO" fetch --quiet origin '+refs/heads/claude/sweet-galileo-0skkay*:refs/remotes/origin/claude/sweet-galileo-0skkay*' 2>/dev/null
git fetch --quiet origin '+refs/heads/claude/sweet-galileo-0skkay*:refs/remotes/origin/claude/sweet-galileo-0skkay*' 2>/dev/null

# RNN <tab> ramo, solo l'onda chiesta
mapfile -t RIGHE < <(node -e '
  const s = require(process.argv[1]); const o = Number(process.argv[2]);
  for (const [n, v] of Object.entries(s.sessioni || {})) if (Number(v.onda) === o) console.log(n + "\t" + v.ramo);
' "$RADICE/$C/sessioni.json" "$ONDA")

ROSSI=0
for riga in "${RIGHE[@]}"; do
  R="${riga%%$'\t'*}"; RAMO="${riga#*$'\t'}"
  if ! git -C "$SITO" rev-parse --verify --quiet "origin/$RAMO" >/dev/null; then
    echo "$ORA · $R · ramo non ancora spinto · guardia – · referto – · unione – · nessuna" >> "$DIARIO"; continue
  fi
  G="✅"; $P guardia-ramo "$RAMO" "$R" --cartella "$C" --git "$SITO" > "$TMP/g-$R.txt" 2>&1 || { G="🔴"; ROSSI=1; }
  REF="–"; FIN=""
  if git -C "$SITO" show "origin/$RAMO:.riparazione/referto-$R.json" > "$TMP/referto-$R.json" 2>/dev/null; then
    VOCI="$(node -e 'const r=require(process.argv[1]);console.log((r.voci||[]).length+(r.finita?" finita":""))' "$TMP/referto-$R.json" 2>/dev/null)"
    [[ "$VOCI" == *finita ]] && FIN=" FINITA"
    if $P valida-referto "$TMP/referto-$R.json" --cartella "$C" --git "$SITO" --ramo "$RAMO" > "$TMP/v-$R.txt" 2>&1; then REF="✅ ${VOCI%% *} voci"
    else rc=$?; if [ $rc -eq 3 ]; then REF="⏳ ${VOCI%% *} voci"; else REF="🔴 ${VOCI%% *} voci"; ROSSI=1; fi; fi
  fi
  echo "$ORA · $R · in lavoro$FIN · guardia $G · referto $REF · unione (sotto) · nessuna" >> "$DIARIO"
  if [ "$G" = "🔴" ]; then echo "🔴 $R guardia-ramo:"; grep -v '^✅' "$TMP/g-$R.txt" | head -15; fi
  if [[ "$REF" == 🔴* ]]; then echo "🔴 $R valida-referto:"; grep -v '^✅' "$TMP/v-$R.txt" | head -15; fi
  [ -n "$FIN" ] && echo "🏁 $R ha finito (guardia $G, referto $REF)"
done

U="✅"; $P prova-unione --cartella "$C" --git "$SITO" --onda "$ONDA" > "$TMP/u.txt" 2>&1 || { rc=$?; [ $rc -eq 3 ] && U="⏳" || { U="🔴"; ROSSI=1; }; }
echo "$ORA · onda $ONDA · prova-unione $U" >> "$DIARIO"
[ "$U" = "🔴" ] && { echo "🔴 prova-unione:"; grep -v '^✅' "$TMP/u.txt" | head -20; }
[ $ROSSI -eq 0 ] && echo "✅ giro $ORA: nessun rosso (${#RIGHE[@]} sessioni, unione $U)"
exit $ROSSI
