#!/usr/bin/env bats
# permessi-guardrail.bats — gruppo «restrizione permessi» della radiografia (D2/D4).
# .claude/settings.json: la deny-list ora impedisce all'AD di stampare/estrarre segreti, riscrivere
# i propri permessi e fare push grezzo — SENZA togliere le capacità legittime (git-pr.mjs, edit del
# codice marketplace/pannello per le PR, git locale, node cervello/*.mjs, web).

SETTINGS="${BATS_TEST_DIRNAME}/../../.claude/settings.json"

need_node() { command -v node >/dev/null 2>&1 || skip "node non disponibile"; }

@test "settings.json è JSON valido" {
  need_node
  run node -e "JSON.parse(require('fs').readFileSync('$SETTINGS','utf8'))"
  [ "$status" -eq 0 ]
}

deny_has() { # $1 = stringa che deve comparire in una regola deny
  node -e "const d=JSON.parse(require('fs').readFileSync('$SETTINGS','utf8')).permissions.deny; process.exit(d.some(r=>r.includes('$1'))?0:1)"
}
allow_has() {
  node -e "const a=JSON.parse(require('fs').readFileSync('$SETTINGS','utf8')).permissions.allow; process.exit(a.some(r=>r.includes('$1'))?0:1)"
}

# ── DENY: i buchi chiusi dalla radiografia ──────────────────────────────────────────────────────
# ⚠️ 1/9 — QUESTO CASO ACCUSAVA LA MACCHINA DI UNA SCELTA DI NICOLA, da più di un mese.
#
# Chiedeva che `.claude/settings.json` contenesse `Bash(git push:*)` fra i divieti. Quella riga
# NICOLA L'HA TOLTA LUI il 27/7 (commit 1b5d0d1c8, «Update settings.json»), e si vede perché: il
# manuale di questa casa PRETENDE che io spinga sul ramo di lavoro — «PUSH to the specified branch»
# — e un divieto secco su ogni push rende impossibile il lavoro che lo stesso manuale ordina. Il
# caso è rimasto rosso da allora: un guardiano che dà la colpa alla macchina per una decisione del
# proprietario, e un cancello sempre rosso si impara ad aggirare.
#
# Ma la PROPRIETÀ che il titolo nomina — «niente codice non revisionato su main» — è vera e va
# difesa. Solo che non è quella riga a difenderla: è il guardiano-integrità di `giro.sh` (AR-044),
# che al momento di pubblicare mette in stage SOLO le quattro cartelle di memoria e poi toglie di
# lì qualunque file di codice ci sia finito lo stesso. È il meccanismo che agisce davvero, e questo
# caso adesso guarda quello.
#
# 🙋 DA CONFERMARE CON NICOLA: se il 27/7 la riga è stata tolta per sbaglio invece che di proposito,
# va rimessa — ma allora va cambiato anche il manuale, perché oggi i due si contraddicono.
@test "il giro pubblica SOLO memoria: il codice non arriva su main da qui" {
  local GIRO="${BATS_TEST_DIRNAME}/../giro.sh"
  # ① mette in stage solo il perimetro della memoria, non tutto
  grep -q 'git add -A "${MEM_DIRS\[@\]}"' "$GIRO"
  # ② e se un file di codice ci finisce lo stesso, lo toglie invece di pubblicarlo
  grep -q 'GUARDIANO-INTEGRITÀ' "$GIRO"
  grep -q 'git reset HEAD -- .' "$GIRO"
}

@test "deny: gh vietato (le PR passano solo da git-pr.mjs)" {
  need_node
  run deny_has "gh:*"
  [ "$status" -eq 0 ]
}

@test "deny: lettura del file dei segreti (.env) bloccata — anti-esfiltrazione" {
  need_node
  run deny_has "Read(./cervello/vps/.env)"
  [ "$status" -eq 0 ]
  run deny_has "Read(**/.env)"
  [ "$status" -eq 0 ]
}

@test "deny: scrittura del .env bloccata (l'AD non riconfigura i propri segreti)" {
  need_node
  run deny_has "Write(**/.env)"
  [ "$status" -eq 0 ]
  run deny_has "Edit(**/.env)"
  [ "$status" -eq 0 ]
}

@test "deny: l'AD non può riscrivere i propri permessi (settings.json)" {
  need_node
  run deny_has "Edit(./.claude/settings.json)"
  [ "$status" -eq 0 ]
  run deny_has "Write(./.claude/settings.json)"
  [ "$status" -eq 0 ]
}

# ── ALLOW: la restrizione NON ha rotto le capacità legittime (guardia di regressione) ────────────
@test "allow: git-pr.mjs resta consentito (le PR si aprono ancora)" {
  need_node
  run allow_has "node cervello/git-pr.mjs"
  [ "$status" -eq 0 ]
}

@test "allow: git locale + strumenti cervello + web restano consentiti" {
  need_node
  run allow_has "git commit:*"; [ "$status" -eq 0 ]
  run allow_has "node cervello/*.mjs:*"; [ "$status" -eq 0 ]
  run allow_has "WebSearch"; [ "$status" -eq 0 ]
}

@test "coerenza: nessuna regola legittima è finita per errore nella deny-list" {
  need_node
  # git-pr.mjs / git commit / node cervello NON devono comparire tra i deny
  run deny_has "git-pr.mjs"; [ "$status" -ne 0 ]
  run deny_has "git commit"; [ "$status" -ne 0 ]
}
