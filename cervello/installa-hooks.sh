#!/usr/bin/env bash
# installa-hooks.sh — attiva i git hook VERSIONATI di questa repo (perimetro segreti attivo, AR-004).
#
# I hook stanno in `.githooks/` (tracciati in git, quindi condivisi e aggiornabili) invece che in
# `.git/hooks/` (locale, non versionato). Basta puntare git lì una volta sola:
#     git config core.hooksPath .githooks
# Idempotente: rilanciarlo non fa danni. Va eseguito una volta per ogni clone (setup VPS incluso).

set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

git config core.hooksPath .githooks
chmod +x .githooks/* 2>/dev/null || true

echo "✅ git hooks attivi (core.hooksPath=.githooks)."
echo "   pre-commit → scan-segreti su ogni commit (blocca i segreti reali prima della storia)."
