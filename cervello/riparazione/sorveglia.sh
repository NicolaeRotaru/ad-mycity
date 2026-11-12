#!/usr/bin/env bash
# Un giro di sorveglianza della campagna, in un comando solo (skill `riparazione`, «La sorveglianza»).
# Uso, dalla radice di ad-mycity:  bash cervello/riparazione/sorveglia.sh <cartella della campagna> <onda>
#   es.  bash cervello/riparazione/sorveglia.sh consegne/riparazioni/2026-11-12-sito-tutto 1
# Per ogni riparatore dell'onda in sessioni.json: guardia-ramo e valida-referto sul referto parziale; per ogni
# collaudatore con un ramo: guardia-ramo e valida-collaudo; poi una prova-unione per tutta l'onda.
# Scrive una riga per sessione nel diario e stampa solo i rossi e i finiti. Uscita 0 nessun rosso, 1 rossi.
# Lo stato delle sessioni (get_session) e la quota li guarda la regista a parte: da bash non si vedono.
set -uo pipefail
C="${1:?serve la cartella della campagna, relativa alla radice di ad-mycity}"; C="${C%/}"
ONDA="${2:?serve il numero dell onda}"
RADICE="$(cd "$(dirname "$0")/../.." && pwd)"
[ -f "$RADICE/$C/sessioni.json" ] || { echo "⚪ $C/sessioni.json non c'è: nessuna sessione da sorvegliare"; exit 2; }
SITO="${MARKETPLACE_REPO:-$RADICE/../mycity}"
P="node $RADICE/cervello/riparazione-sessioni.mjs"
DIARIO="$RADICE/$C/diario-della-sorveglianza.txt"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
cd "$RADICE" || exit 2
ORA="$(TZ=Europe/Rome date '+%Y-%m-%d %H:%M')"

# R<tab>NOME<tab>ramo per i riparatori dell'onda, K<tab>NOME<tab>ramo per i collaudatori che ne hanno uno.
mapfile -t RIGHE < <(node -e '
  const s = require(process.argv[1]); const o = Number(process.argv[2]);
  for (const [n, v] of Object.entries(s.sessioni || {})) if (Number(v.onda) === o) console.log("R\t" + n + "\t" + v.ramo);
  const mie = new Set(Object.entries(s.sessioni || {}).filter(([, v]) => Number(v.onda) === o).map(([n]) => n));
  for (const [n, v] of Object.entries(s.collaudatori || {})) if ((v.riparatori || []).some((r) => mie.has(r))) console.log("K\t" + n + "\t" + v.ramo);
' "$RADICE/$C/sessioni.json" "$ONDA")

for riga in "${RIGHE[@]}"; do
  IFS=$'\t' read -r TIPO _ RAMO <<< "$riga"
  if [ "$TIPO" = "R" ]; then git -C "$SITO" fetch --quiet origin "+refs/heads/$RAMO:refs/remotes/origin/$RAMO" 2>/dev/null
  else git fetch --quiet origin "+refs/heads/$RAMO:refs/remotes/origin/$RAMO" 2>/dev/null; fi
done

ROSSI=0
for riga in "${RIGHE[@]}"; do
  IFS=$'\t' read -r TIPO N RAMO <<< "$riga"
  if [ "$TIPO" = "K" ]; then
    git rev-parse --verify --quiet "origin/$RAMO" >/dev/null || { echo "$ORA · $N · ramo non ancora spinto · guardia – · collaudo – · nessuna" >> "$DIARIO"; continue; }
    G="✅"; $P guardia-ramo "$RAMO" "$N" --cartella "$C" > "$TMP/g-$N.txt" 2>&1 || { G="🔴"; ROSSI=1; }
    K="–"
    if git show "origin/$RAMO:$C/collaudi/$N.json" > "$TMP/$N.json" 2>/dev/null; then
      if $P valida-collaudo "$TMP/$N.json" --cartella "$C" --git "$SITO" > "$TMP/k-$N.txt" 2>&1; then K="✅"
      else rc=$?; if [ $rc -eq 3 ]; then K="⏳"; else K="🔴"; ROSSI=1; fi; fi
    fi
    echo "$ORA · $N · collaudo · guardia $G · collaudo $K · nessuna" >> "$DIARIO"
    [ "$G" = "🔴" ] && { echo "🔴 $N guardia-ramo:"; grep -v '^✅' "$TMP/g-$N.txt" | head -15; }
    [ "$K" = "🔴" ] && { echo "🔴 $N valida-collaudo:"; grep -v '^✅' "$TMP/k-$N.txt" | head -15; }
    continue
  fi
  if ! git -C "$SITO" rev-parse --verify --quiet "origin/$RAMO" >/dev/null; then
    echo "$ORA · $N · ramo non ancora spinto · guardia – · referto – · unione – · nessuna" >> "$DIARIO"; continue
  fi
  G="✅"; $P guardia-ramo "$RAMO" "$N" --cartella "$C" --git "$SITO" > "$TMP/g-$N.txt" 2>&1 || { G="🔴"; ROSSI=1; }
  REF="–"; FIN=""
  if git -C "$SITO" show "origin/$RAMO:.riparazione/referto-$N.json" > "$TMP/referto-$N.json" 2>/dev/null; then
    VOCI="$(node -e 'const r=require(process.argv[1]);console.log((r.voci||[]).length+(r.finita?" finita":""))' "$TMP/referto-$N.json" 2>/dev/null)"
    [[ "$VOCI" == *finita ]] && FIN=" FINITA"
    if $P valida-referto "$TMP/referto-$N.json" --cartella "$C" --git "$SITO" --ramo "$RAMO" > "$TMP/v-$N.txt" 2>&1; then REF="✅ ${VOCI%% *} voci"
    else rc=$?; if [ $rc -eq 3 ]; then REF="⏳ ${VOCI%% *} voci"; else REF="🔴 ${VOCI%% *} voci"; ROSSI=1; fi; fi
  fi
  echo "$ORA · $N · in lavoro$FIN · guardia $G · referto $REF · unione (sotto) · nessuna" >> "$DIARIO"
  [ "$G" = "🔴" ] && { echo "🔴 $N guardia-ramo:"; grep -v '^✅' "$TMP/g-$N.txt" | head -15; }
  [[ "$REF" == 🔴* ]] && { echo "🔴 $N valida-referto:"; grep -v '^✅' "$TMP/v-$N.txt" | head -15; }
  [ -n "$FIN" ] && echo "🏁 $N ha finito (guardia $G, referto $REF)"
done

U="✅"; $P prova-unione --cartella "$C" --git "$SITO" --onda "$ONDA" > "$TMP/u.txt" 2>&1 || { rc=$?; [ $rc -eq 3 ] && U="⏳" || { U="🔴"; ROSSI=1; }; }
echo "$ORA · onda $ONDA · prova-unione $U" >> "$DIARIO"
[ "$U" = "🔴" ] && { echo "🔴 prova-unione:"; grep -v '^✅' "$TMP/u.txt" | head -20; }
echo "👀 ora list_sessions (limit 20): ogni figlia BLOCKED si sblocca in questo giro; un clic che solo Nicola può dare va subito all'AD (SKILL riparazione, regole del 12/11 sera)"
[ $ROSSI -eq 0 ] && echo "✅ giro $ORA: nessun rosso (${#RIGHE[@]} sessioni, unione $U)"
exit $ROSSI
