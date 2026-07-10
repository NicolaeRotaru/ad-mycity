#!/usr/bin/env bash
# Wrapper allowlisted (`bash cervello/*.sh`) per lanciare il driver Playwright del Pannello.
# Il node gira come figlio → nessuna approvazione separata.
set -euo pipefail
cd "$(dirname "$0")/.."
export PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers
exec node cervello/verify-marge-pannello.mjs "$@"
