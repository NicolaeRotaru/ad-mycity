#!/usr/bin/env bash
# installa-hooks.sh — attiva i git hook VERSIONATI di questa repo (perimetro segreti attivo, AR-004).
#
# I hook stanno in `.githooks/` (tracciati in git, quindi condivisi e aggiornabili) invece che in
# `.git/hooks/` (locale, non versionato). Basta puntare git lì una volta sola:
#     git config core.hooksPath .githooks
# Idempotente: rilanciarlo non fa danni. Va eseguito una volta per ogni clone (setup VPS incluso).
#
# 🔒 AR-644 — QUESTO SCRIPT VERIFICA IL PROPRIO EFFETTO, non si limita a lanciare il comando.
# Prima stampava «✅ git hooks attivi» subito dopo il `git config`, e usciva 0. Ma «il comando non ha
# sollevato un errore» e «i cancelli del commit adesso girano» sono due fatti diversi: il valore può
# non essere stato scritto, può essere stato scritto altrove da una configurazione più specifica, e
# il pre-commit può esserci senza essere eseguibile — nel qual caso git lo salta **in silenzio**.
# Chi ci chiama (giro.sh, worker.sh, il SessionStart) legge solo il codice d'uscita: se quel codice
# non distingue i due fatti, la sessione parte scoperta e nessun organo lo dice.
# Ora si rilegge quello che git risponde DAVVERO e si decide con `esitoAggancioCancelli()`
# (cervello/istante-cancello.mjs), che è una funzione pura e quindi una prova la può eseguire.

set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ATTESO="${GITHOOKS_PATH:-.githooks}"

_rc=0
git config core.hooksPath "$ATTESO" || _rc=$?
chmod +x .githooks/* 2>/dev/null || true

# Cosa risponde git ADESSO: è l'unica prova che l'aggancio ha attecchito.
LETTO="$(git config --get core.hooksPath 2>/dev/null || true)"
ESEGUIBILE=1
[ -x "$ATTESO/pre-commit" ] || ESEGUIBILE=0

# Il verdetto lo dà `esitoAggancioCancelli()`. Se la testa non è raggiungibile — un clone parziale,
# un ambiente senza node — NON si rinuncia a controllare: si controlla lo stesso l'unica cosa che
# conta (git risponde quello che deve? il pre-commit è eseguibile?) e si dice che il motivo
# dettagliato non è disponibile. La classificazione resta in un posto solo; qui c'è la domanda, non
# una seconda copia della regola.
MOTIVO=""
if command -v node >/dev/null 2>&1 && [ -f "$SCRIPT_DIR/istante-cancello.mjs" ]; then
  _vrc=0
  VERDETTO="$(node "$SCRIPT_DIR/istante-cancello.mjs" aggancio \
    --rc="$_rc" --hooks-path="$LETTO" --atteso="$ATTESO" --pre-commit-eseguibile="$ESEGUIBILE")" || _vrc=$?
  [ "$_vrc" = 0 ] || MOTIVO="$(printf '%s' "$VERDETTO" | sed -n 's/.*"motivo":"\([^"]*\)".*/\1/p')"
  [ "$_vrc" = 0 ] || [ -n "$MOTIVO" ] || MOTIVO="la testa che classifica l'aggancio non ha risposto"
elif [ "$_rc" != 0 ] || [ "$LETTO" != "$ATTESO" ] || [ "$ESEGUIBILE" != 1 ]; then
  MOTIVO="core.hooksPath=«${LETTO:-vuoto}» (atteso «$ATTESO»), pre-commit eseguibile=$ESEGUIBILE — motivo non classificato: manca istante-cancello.mjs"
fi

if [ -n "$MOTIVO" ]; then
  echo "⛔ cancelli del commit NON agganciati: $MOTIVO" >&2
  echo "   Senza di loro un commit passa senza scan dei segreti e senza perimetro di main." >&2
  echo "   Rimedio: git config core.hooksPath $ATTESO && chmod +x $ATTESO/*" >&2
  exit 1
fi

echo "✅ git hooks attivi e VERIFICATI (core.hooksPath=$LETTO, pre-commit eseguibile)."
echo "   pre-commit → scan-segreti su ogni commit (blocca i segreti reali prima della storia)."
