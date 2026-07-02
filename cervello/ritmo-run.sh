#!/usr/bin/env bash
# Alias storico citato in ritmo.md / auto-radiografia — delega a ritmo.sh
exec "$(dirname "$0")/ritmo.sh" "$@"
