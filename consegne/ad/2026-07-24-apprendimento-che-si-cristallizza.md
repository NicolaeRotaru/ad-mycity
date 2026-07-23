---
tipo: consegna
reparto: AD
data: 2026-07-24 00:20
colore: 🟡
titolo: Perché la macchina ripete gli errori — e il fix che la fa imparare davvero
---

# 🧠 «Fa ancora tanti errori che devo ripeterti» — la causa e il fix

> Richiesta di Nicola (23/7 ~23:59): *«come faccio a rendere la macchina ancora più intelligente,
> perché adesso fa ancora tanti errori che devo continuare a ripeterli?»*
> Diagnosi coi numeri veri + primo motore, sul branch `claude/improve-machine-accuracy-a3oucg`.

## 1. La diagnosi (con i tuoi numeri, non a sensazione)

La macchina **cattura** benissimo le lezioni, ma non le **cristallizza** né le **fa rispettare**.
Prova dai file reali (`apprendimento.json`):

| Numero | Valore | Cosa significa |
|---|---|---|
| Lezioni vive | **464** | l'archivio cresce all'infinito |
| Promosse a `principio` | **4** | quasi nessuna diventa regola stabile |
| Lezioni mature MAI promosse | **75** | avevano i requisiti per diventare regola, ferme lì |
| Tasso di applicazione | **17%** | l'83% delle lezioni non cambia mai una decisione |
| Decadute | **0** | il decadimento non gira → l'archivio è un cimitero |
| Lezioni da tue correzioni | **276** | 276 volte ti ho fatto ripetere qualcosa |

E il richiamo era una **cannuccia**: le lezioni tornavano nel cervello **solo in chat**, **8 alla volta**,
come **paragrafi da 170 parole** che il modello non riesce a trasformare in comportamento. Fuori dalla
chat — nel **giro** e in ogni **sessione nuova** — ripartiva **cieca**. Lo script scritto apposta per
portare la memoria ovunque (`contesto-lezioni.mjs`) **non era collegato da nessuna parte**.

**Radice unica:** una lezione è una **nota che devi ricordarti di leggere**, non un **muro che ti ferma**.
Sotto carico la nota si dimentica. Prova nera nel tuo stesso file: lo stesso errore `git-pr.mjs`
registrato, **ririaccaduto 3 ore dopo**, poi **di nuovo 40 min dopo**. Catturato tre volte, mai un gate.

Errori che si ripetono di più (per firma, **mai** diventati un gate):

```
worker  67 lezioni · 142 ripetizioni · 47 da tue correzioni
ux      45 lezioni ·  80 ripetizioni · 41 da tue correzioni
chat    34 lezioni ·  69 ripetizioni · 29 da tue correzioni
vps     35 lezioni ·  78 ripetizioni · 18 da tue correzioni
n8n     40 lezioni ·  73 ripetizioni · 17 da tue correzioni
```

## 2. Cosa è SUL BRANCH ora (motore nuovo, testato)

L'idea: **trasformare le lezioni in comportamento** — farle arrivare ovunque, nette, e rendere gli errori
ricorrenti un muro invece di una nota.

1. **`cervello/apprendimento-guardiano.mjs`** (NUOVO) — il guardiano che misura se la macchina *impara o
   solo accumula*: salute dell'archivio (applicazione, cristallizzazione ferma, decadimento, gonfiore) +
   rilevamento degli **errori che si ripetono** per firma. Esce rc≠0 quando è malato, come gli altri gate.
   Prova: `node cervello/apprendimento-guardiano.mjs`.

2. **`cervello/contesto-lezioni.mjs`** (potenziato) — inietta la **regola netta** di ogni lezione (il
   nucleo dopo «Regola:» o il grassetto), non il paragrafo; mette **in cima** gli errori ricorrenti; nuova
   modalità `--righe` per il worker; reso importabile senza effetti collaterali.

## 3. 🙋 Cosa serve da te — 3 interruttori (🟡)

Il motore è pronto ma va **acceso**. Dal cloud non ho toccato i due script-cuore (`giro.sh` 851 righe,
`worker.sh` 1502) a mano via API: reinserirli rischierebbe di corromperli — esattamente l'errore da
spegnere. Ecco i tre innesti, piccoli e verificabili, da applicare sul VPS (worker, ha i diritti di push
su `main`) o da farmi applicare da lì.

### A. SessionStart hook — il più importante (fa arrivare la memoria a OGNI sessione)
Vive in `.claude/settings.json`, **bloccato** alla macchina (non posso modificarmi i permessi). Aggiungi
questo accanto a `"permissions"`:
```json
"hooks": {
  "SessionStart": [
    { "hooks": [ { "type": "command", "command": "node cervello/contesto-lezioni.mjs --hook" } ] }
  ]
}
```
Effetto: ogni nuova sessione parte con fatti-chiave + errori-da-non-ripetere + regole nette (~1.500 token).

### B. `giro.sh` — il giro riceve la memoria + un vincolo «cristallizza»
Dopo il gate `keyword-owner` (riga ~359), aggiungi la chiamata al guardiano; e nell'assemblaggio del
prompt (prima di «## Risposta in chat») aggiungi il vincolo. Diff esatto:
```sh
# dopo il blocco keyword-owner:
echo "[$(ts)] Guardiano apprendimento (impara o solo accumula?)..."
_appr_out="$(node "$SCRIPT_DIR/apprendimento-guardiano.mjs" --gate 2>&1)"; _appr_rc=$?
printf '%s\n' "$_appr_out" | tail -6
if [ "$_appr_rc" -ne 0 ]; then
  _appr_ric="$(node "$SCRIPT_DIR/apprendimento-guardiano.mjs" --memoria 2>&1 || true)"
  APPRENDIMENTO_VINCOLO="⛔ APPRENDIMENTO FERMO: promuovi 2-3 lezioni mature a \`principio\`, rendi la 1ª area ricorrente un GATE, poi accorpa i doppioni. NON loggare l'ennesima lezione uguale.
$_appr_ric"
fi
# e iniettare $_MEMORIA_BLOCK (da: node cervello/contesto-lezioni.mjs) + $APPRENDIMENTO_VINCOLO nel PROMPT.
```

### C. `worker.sh` — la chat riceve regole nette + errori ricorrenti
Alla riga che legge `lezioni=` (~652): sostituire l'head-8 grezzo con
`node cervello/contesto-lezioni.mjs --righe --max 8` (con fallback al grep attuale), e aggiungere un
bullet `ricorrenti="$(node cervello/apprendimento-guardiano.mjs --memoria 2>/dev/null||true)"`.
I 19 test `contesto-chat`+`sessione-chat` restano verdi (già verificato in locale).

> A da solo dà già il grosso del beneficio. B e C lo rinforzano nel giro e nella chat.

## 4. Prossima ondata (proposta)

- **Disciplina di cristallizzazione:** ogni errore ricorrente ≥2 volte DEVE diventare principio o gate
  (aggiornare `apprendimento.md` + `metabolizza.md` — oggi 4 principi su 464).
- **Accendere il decadimento:** potare le 464 lezioni (decadute=0 è un bug).
- **Campo `regola:` obbligatorio** su ogni lezione: una riga imperativa separata dal racconto.

---
*Consegna AD · branch `claude/improve-machine-accuracy-a3oucg` · gli innesti si attivano col tuo ok (🟡).*
