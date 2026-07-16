#!/usr/bin/env bats
# specchia-skills.bats — parity skill Claude↔Cursor (fix 2026-07-16).
# Lo specchio .cursor/skills → .claude/skills deve: coprire tutte le skill del manifest,
# convertire la rule ponytail in SKILL.md valida, ed essere idempotente (0 scritture al 2° giro).

ROOT="${BATS_TEST_DIRNAME}/.."
SYNC="$ROOT/sync-worker-plugins.mjs"

@test "specchia: dry-run elenca le skill del manifest (grilling e ponytail incluse)" {
  run node "$SYNC" --specchia --dry-run
  [ "$status" -eq 0 ]
  [[ "$output" == *"specchio grilling"* ]]
  [[ "$output" == *"specchio ponytail"* ]]
  [[ "$output" == *".claude/skills/"* ]]
}

@test "specchia: idempotente — il secondo giro reale non riscrive nulla" {
  run node "$SYNC" --specchia
  [ "$status" -eq 0 ]
  run node "$SYNC" --specchia
  [ "$status" -eq 0 ]
  [[ "$output" == *"0 file aggiornati"* ]]
}

@test "specchia: ponytail convertita da rule .mdc a SKILL.md con frontmatter valido" {
  node "$SYNC" --specchia >/dev/null
  local f="$ROOT/../.claude/skills/ponytail/SKILL.md"
  [ -f "$f" ]
  head -1 "$f" | grep -q '^---$'
  grep -q '^name: ponytail$' "$f"
  grep -q '^description: ' "$f"
  # niente campi mdc (globs/alwaysApply) nel frontmatter della skill
  ! sed -n '2,4p' "$f" | grep -q 'globs\|alwaysApply'
}

@test "specchia: le skill specchiate restano fuori da git (generati, non versionati)" {
  node "$SYNC" --specchia >/dev/null
  run git -C "$ROOT/.." status --porcelain -- .claude/skills
  [ "$status" -eq 0 ]
  [ -z "$output" ]
}
