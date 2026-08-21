#!/usr/bin/env bats
# specchio-senza-doppioni.bats — 2026-08-21, installazione del plugin Claude "superpowers".
#
# Il difetto che questa prova impedisce: due skill con lo STESSO nome caricate insieme.
# `using-superpowers` e `systematic-debugging` arrivano da obra/superpowers e stanno vendored in
# .cursor/skills (per il motore Cursor). Da quando il plugin Claude è attivo, Claude Code carica
# già le sue copie: se lo specchio .cursor → .claude ne scrive una seconda, la stessa skill
# esiste due volte — costa token a ogni sessione e rende ambigua l'attivazione.
#
# Le due direzioni contano tutte e due:
#  - plugin ATTIVO  → lo specchio non deve scrivere quelle due, e deve togliere la copia vecchia
#    (una macchina che aveva specchiato PRIMA dell'installazione resterebbe col doppione)
#  - plugin ASSENTE → devono tornare, se no un VPS senza plugin resta senza quelle skill.
#
# Seme: SYNC_PLUGIN_ATTIVI (vedi pluginClaudeAttivo in sync-worker-plugins.mjs).

ROOT="${BATS_TEST_DIRNAME}/.."
SYNC="$ROOT/sync-worker-plugins.mjs"
SKILLS="$ROOT/../.claude/skills"

@test "specchio: col plugin superpowers attivo le due skill doppie non si specchiano" {
  SYNC_PLUGIN_ATTIVI=superpowers run node "$SYNC" --specchia
  [ "$status" -eq 0 ]
  [ ! -f "$SKILLS/superpowers/SKILL.md" ]
  [ ! -f "$SKILLS/systematic-debugging/SKILL.md" ]
}

@test "specchio: col plugin attivo le altre skill restano (nessun danno collaterale)" {
  SYNC_PLUGIN_ATTIVI=superpowers run node "$SYNC" --specchia
  [ "$status" -eq 0 ]
  [ -f "$SKILLS/grilling/SKILL.md" ]
  [ -f "$SKILLS/tdd/SKILL.md" ]
  [ -f "$SKILLS/ponytail/SKILL.md" ]
}

@test "specchio: col plugin attivo la copia già specchiata viene rimossa" {
  # simula la macchina che aveva specchiato prima di installare il plugin
  SYNC_PLUGIN_ATTIVI= node "$SYNC" --specchia >/dev/null
  [ -f "$SKILLS/systematic-debugging/SKILL.md" ]
  SYNC_PLUGIN_ATTIVI=superpowers run node "$SYNC" --specchia
  [ "$status" -eq 0 ]
  [[ "$output" == *"doppione rimosso"* ]]
  [ ! -f "$SKILLS/systematic-debugging/SKILL.md" ]
}

@test "specchio: senza il plugin le due skill tornano (VPS scoperto = no)" {
  SYNC_PLUGIN_ATTIVI= run node "$SYNC" --specchia
  [ "$status" -eq 0 ]
  [ -f "$SKILLS/superpowers/SKILL.md" ]
  [ -f "$SKILLS/systematic-debugging/SKILL.md" ]
  grep -q '^name: using-superpowers$' "$SKILLS/superpowers/SKILL.md"
}

@test "specchio: col plugin attivo resta idempotente (secondo giro non tocca niente)" {
  SYNC_PLUGIN_ATTIVI=superpowers node "$SYNC" --specchia >/dev/null
  SYNC_PLUGIN_ATTIVI=superpowers run node "$SYNC" --specchia
  [ "$status" -eq 0 ]
  [[ "$output" == *"0 file aggiornati"* ]]
}

@test "specchio: la pulizia tocca un file solo, non spazza la cartella" {
  # una voce marcata per sbaglio non deve poter cancellare roba di altri:
  # si toglie il SKILL.md specchiato, e la cartella solo se resta vuota
  SYNC_PLUGIN_ATTIVI= node "$SYNC" --specchia >/dev/null
  echo "roba mia" > "$SKILLS/systematic-debugging/APPUNTI.md"
  SYNC_PLUGIN_ATTIVI=superpowers run node "$SYNC" --specchia
  [ "$status" -eq 0 ]
  [ ! -f "$SKILLS/systematic-debugging/SKILL.md" ]
  [ -f "$SKILLS/systematic-debugging/APPUNTI.md" ]
  rm -rf "$SKILLS/systematic-debugging"
}

@test "specchio: le skill di progetto versionate restano intatte" {
  SYNC_PLUGIN_ATTIVI=superpowers run node "$SYNC" --specchia
  [ "$status" -eq 0 ]
  for s in verify cantiere salute worker senior; do
    [ -f "$SKILLS/$s/SKILL.md" ]
  done
}
