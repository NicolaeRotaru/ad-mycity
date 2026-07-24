---
tipo: consegna
reparto: AD
data: 2026-07-24 01:10
colore: 🟡
titolo: Le prime 3 mosse per rendere la macchina più intelligente — motori pronti + cablaggio
---

# 🧠 Prime 3 mosse — «collega l'ultimo miglio · verificatore avversariale · cristallizzazione»

> Nicola: «fai le prime 3». Fatto e testato sul branch `claude/improve-machine-accuracy-a3oucg`.
> I **motori** sono già sul branch (byte-verificati). Il **cablaggio** nei due file-cuore (`giro.sh`,
> `.claude/settings.json`) è qui sotto come diff pronto — dal cloud non lo applico a mano su file da
> 890/1500 righe via API (rischio di corromperli = l'errore da spegnere): lo applica il worker VPS
> (o tu), dove il file si edita in sicurezza.

## ✅ Cosa è GIÀ sul branch (motori, testati)

| File | Lever | Cosa fa |
|---|---|---|
| `cervello/cristallizza-apprendimento.mjs` (NUOVO) | 3 | promuove le lezioni mature a `principio` (top-5/esecuzione), riconcilia `principi[]`, accende il decadimento; backup `.bak` reversibile |
| `cervello/verifica-avversariale.mjs` (NUOVO) | 2 | gate che smaschera l'auto-analisi «timbro» (refutazione boilerplate + 0 errori con voto alto) → rc≠0 |
| `cervello/contesto-lezioni.mjs` (potenziato) | 1 | ora inietta anche **Principi** + **Preferenze-di-Nicola** nel contesto persistente (prima vivevano solo nel Pannello) |

Provati in locale: `node --check` verde su tutti; il crystallizer promuove 5 mature (4→9 principi) e scrive JSON valido; il verificatore becca il timbro reale (voto 90, refutazione boilerplate) con rc 1.

## 🙋 Attivazione — 2 innesti (🟡, applicabili dal worker VPS o da te)

### A. `.claude/settings.json` — SessionStart hook (copre OGNI sessione, chat inclusa)
È il pezzo a più alto valore quotidiano: porta fatti + principi + errori-da-non-ripetere + preferenze in **ogni** sessione. Aggiungi accanto a `"permissions"`:
```json
"hooks": {
  "SessionStart": [
    { "hooks": [ { "type": "command", "command": "node cervello/contesto-lezioni.mjs --hook" } ] }
  ]
}
```

### B. `cervello/giro.sh` — i 3 gate nel battito del giro (diff esatto, testato)

**B1.** Dopo la dichiarazione `KEYWORD_VINCOLO` (~riga 148) aggiungi:
```sh
APPRENDIMENTO_VINCOLO="" # Lever 1: guardiano apprendimento (archivio malato / errori ricorrenti non cristallizzati)
VERIFICA_VINCOLO=""      # Lever 2: verificatore avversariale (auto-analisi vuota) + validatore contratti come gate
```

**B2.** Nel blocco guardiani, SOSTITUISCI `node "$SCRIPT_DIR/valida-contratti.mjs" 2>&1 | tail -4 || true` con:
```sh
  # Lever 1 — Guardiano apprendimento → vincolo hard «cristallizza».
  _appr_out="$(node "$SCRIPT_DIR/apprendimento-guardiano.mjs" --gate 2>&1)"; _appr_rc=$?
  printf '%s\n' "$_appr_out" | tail -6
  if [ "$_appr_rc" -ne 0 ]; then
    _appr_ric="$(node "$SCRIPT_DIR/apprendimento-guardiano.mjs" --memoria 2>&1 || true)"
    APPRENDIMENTO_VINCOLO="⛔ APPRENDIMENTO FERMO: promuovi 2-3 lezioni mature a \`principio\`, rendi la 1ª area ricorrente un GATE, NON loggare l'ennesima lezione uguale.
$_appr_ric"
  fi
  # Lever 3 — Cristallizzazione (meccanica, con backup).
  node "$SCRIPT_DIR/cristallizza-apprendimento.mjs" --applica 2>&1 | tail -4 || true
  # Lever 2 — Verificatore avversariale.
  _verif_out="$(node "$SCRIPT_DIR/verifica-avversariale.mjs" --gate 2>&1)"; _verif_rc=$?
  [ "$_verif_rc" -ne 0 ] && [ -n "$_verif_out" ] && VERIFICA_VINCOLO="$_verif_out"
  # Lever 2 — Validatore contratti JSON ora GATE HARD (niente più «|| true»).
  _contr_out="$(node "$SCRIPT_DIR/valida-contratti.mjs" 2>&1)"; _contr_rc=$?
  printf '%s\n' "$_contr_out" | tail -4
  if [ "$_contr_rc" -ne 0 ]; then
    VERIFICA_VINCOLO="$VERIFICA_VINCOLO
⛔ CONTRATTI JSON FUORI-CONTRATTO: un file auto-coscienza usa nomi-campo fuori contratto → il Pannello mostra salute cieca. Rinomina ai nomi canonici PRIMA di chiudere."
  fi
```

**B3.** Dopo il blocco `## Istruzione aggiuntiva`, PRIMA di `if [ -n "$SENSORI_VINCOLO" ]`, aggiungi:
```sh
_MEMORIA_BLOCK="$(node "$SCRIPT_DIR/contesto-lezioni.mjs" 2>/dev/null || true)"
if [ -n "$_MEMORIA_BLOCK" ]; then
  PROMPT="$PROMPT

$_MEMORIA_BLOCK"
fi
```

**B4.** Dopo il blocco `## Vincolo keyword-owner`, PRIMA di `## Risposta in chat`, aggiungi:
```sh
if [ -n "${APPRENDIMENTO_VINCOLO:-}" ]; then
  PROMPT="$PROMPT

## Vincolo apprendimento (HARD — Lever 1)
$APPRENDIMENTO_VINCOLO"
fi
if [ -n "${VERIFICA_VINCOLO:-}" ]; then
  PROMPT="$PROMPT

## Vincolo auto-verifica (HARD — Lever 2)
$VERIFICA_VINCOLO"
fi
```

> Il commit `af957cc` sul branch contiene questi 4 innesti già applicati a `giro.sh` (base main): il worker VPS può fare `git show af957cc -- cervello/giro.sh` per prenderli esatti.

## ▶️ Provare l'effetto SUBITO (senza aspettare il giro)
```sh
node cervello/apprendimento-guardiano.mjs          # salute: 17% applicazione, errori ricorrenti
node cervello/cristallizza-apprendimento.mjs        # anteprima promozioni (aggiungi --applica per scrivere)
node cervello/verifica-avversariale.mjs             # l'ultima auto-analisi è vera o un timbro?
node cervello/contesto-lezioni.mjs                  # il contesto persistente completo (con Principi + Preferenze)
```

---
*Consegna AD · branch `claude/improve-machine-accuracy-a3oucg` · motori live, attivazione col tuo ok (🟡).*
