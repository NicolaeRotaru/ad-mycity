---
data: 2026-07-11 15:40
tipo: radiografia-profonda
oggetto: worker del VPS — pipeline completa (bash + Pannello + prompt + sicurezza)
metodo: 12 lenti in parallelo + verifica avversariale di ogni difetto (49 confermati / 78 candidati)
---

# 🩻 Radiografia PROFONDA del worker — 49 difetti confermati

> Ogni difetto qui sotto è stato **verificato da un secondo agente avversariale** che ha
> letto il codice vero e provato a smontarlo. I 29 candidati respinti (già difesi da
> guardiani/test/gate) NON sono in lista. Raggruppo per gravità e per causa comune.

## Il quadro in una frase
Il worker singolo è robusto. **Quasi tutti i difetti gravi nascono da DUE fatti architetturali**:
1. **Due worker girano insieme** (`mycity-worker` "all" + `mycity-worker-chat`) ma il codice è
   scritto come se ce ne fosse **uno solo** → si pestano i piedi su coda, battito, worktree, flag di riavvio.
2. **Le azioni reali possono partire due volte** — diversi percorsi di errore trasformano un'azione
   *già eseguita* in «Riprova» sul Pannello.
Più un terzo tema trasversale: **sicurezza del prompt** (testo dal Pannello → dentro la CLI con le mani).

---

## 🔴 BLOCCANTI / GRAVI (13 problemi distinti)

### A. I due worker si sabotano a vicenda
- **A1 — Recupero orfani cieco (il più grave).** `recupera_lavori_orfani` gira all'avvio di OGNI
  worker e assume di essere l'unico consumer: quando il worker-chat (ri)parte o fa exec-reload,
  **cestina o ri-accoda il lavoro che l'altro worker sta ANCORA eseguendo**. Se quel lavoro è un
  `esegui-azione` reale, viene marcato «riapprova» *mentre sta girando* → **rischio doppio invio reale**.
  `worker.sh` (recupera_lavori_orfani). *Confermato da 5 lenti indipendenti.*
- **A2 — Flag di riavvio a consumo singolo.** `worker:riavvia=on` viene spento dal primo worker che
  lo legge → l'altro **non si ricarica mai** e resta sul codice vecchio (motore-ai.sh incluso) all'infinito.
- **A3 — Battito condiviso.** Entrambi scrivono `worker:ultimo`: il worker-chat vivo **maschera la morte**
  del worker principale — il Pannello dice "cervello acceso" mentre giro/ritmo/azioni sono fermi.
- **A4 — Worktree condiviso senza serializzazione.** Due lavori AI concorrenti scrivono file nello
  stesso checkout; `sync_vault` di uno committa i file **a metà scrittura** dell'altro.

### B. Azioni reali che partono due volte
- **B1 — sync_vault fallita dopo un'azione riuscita** converte l'azione **già partita** in `stato=errore`
  → il Pannello mostra «Riprova» = invito al doppio invio. (`worker.sh`, blocco 3b)
- **B2 — PATCH finale del risultato senza retry/fallback.** Se la scrittura dell'esito fallisce dopo un
  lavoro riuscito, il lavoro resta `in_corso` → la sentinella lo marca «riapprova» → doppio invio.
- **B3 — Tipo `proposta` classificato male.** La retry-policy lo tratta come *pre-esecuzione* (auto-retry
  sicuro) ma worker e sentinella lo trattano come *azione reale*: un timeout su una proposta approvata
  la **ri-esegue in automatico**. (incoerenza tra `retry-policy.mjs` e worker/sentinella)

### C. Codice non revisionato che finisce in produzione
- **C1 — sync_vault pusha `HEAD:main` alla cieca**, qualunque branch sia checked-out. Se una chat ha
  lasciato un branch `fix/*` (o è stata killata a metà lavoro con `CHAT_SOSTITUITA`), **i commit di
  codice non revisionati finiscono dritti su `main` e in deploy**, saltando la PR. (`worker.sh`, sync_vault)

### D. Sicurezza (prompt → mani)
- **D1 — Prompt injection con le mani armate.** La `richiesta` arriva dal Pannello e finisce nel prompt
  della CLI, che sui lavori ha `curl` libero, i segreti su disco e `acceptEdits`: un testo ostile (o un
  allegato) può ordinare **esfiltrazione chiavi / scrittura DB arbitraria**.
- **D2 — `acceptEdits` senza restrizione dei file**: la macchina può riscrivere i **propri guardrail**
  (worker.sh, settings.json) — c'è il gate di provenienza sul reload, ma la scrittura del file avviene.
- **D3 — Lezioni avvelenate.** `LEZIONI-CHAT.md` (righe 10-12) è iniettato in ogni chat e **ordina**
  `git fetch`, `push --force-with-lease` ed estrazione del PAT da `.env` — in **contraddizione frontale**
  coi divieti del prompt. Va bonificato: una lezione non deve mai insegnare l'aggiramento.
- **D4 — Deny-list aggirabile.** `.claude/settings.json` nega `git push*main*` e `*api.github.com*` ma
  la sintassi è aggirabile (spazi, host alternativi github.com) e ridondante.

### E. Blocco totale silenzioso
- **E1 — watch-main senza timeout.** `watch-main.sh` non ha timeout e il suo service è `oneshot` senza
  `RuntimeMaxSec`: un `git fetch` appeso **tiene il lock git per sempre** → niente più allineamenti né
  sync memoria, e nessun watchdog lo copre.

---

## 🟡 MEDI (12 problemi distinti)
- **PATCH esito senza guardia `stato=eq.in_corso`**: una chat sostituita/annullata nella finestra
  post-generazione **risorge come «fatto»** col testo vecchio (vale per stream, json e lavori). *5 lenti.*
- **`scarta_lavori_scaduti` ignora `riprova_dopo`**: i ritentativi programmati per il reset-quota
  vengono dead-letterati al primo riavvio (usa solo `created_at`).
- **`HAS_RETRY_COLS` fail-open**: se la curl di sondaggio fallisce per rete su un DB non migrato, il
  worker assume le colonne presenti → **coda ferma per sempre col battito vivo**.
- **`rispondi_chat_json` parsa stdout+stderr insieme**: un solo warning della CLI su stderr rompe il
  JSON → ogni chat non-stream degrada a doppia/tripla esecuzione.
- **Fallback «riparto senza resume» su QUALSIASI `rc≠0`** (timeout/rate-limit inclusi): fino a **3
  generazioni complete** per un turno → doppio/triplo costo e side-effect ripetuti.
- **Streaming che si congela**: dopo il primo messaggio assistant completato, nelle chat con tool-use
  (le più comuni) i parziali smettono di aggiornarsi → sembra bloccato.
- **git fetch/push/ls-remote del worker senza timeout**: un socket mezzo-aperto congela il loop fino
  al watchdog-kill (~55 min). (nel loop chat, fino a 3 run sequenziali possono superare `WatchdogSec`)
- **Router `banco-ai` decorativo**: `AI_ECON_CMD` non esiste in tutto il repo → il ramo economico non
  entra MAI, tutto gira premium (spreco, non rottura).
- **Prompt incoerenti coi permessi reali**: dichiara «bloccati» `git fetch`, `git pull --rebase`, `curl`
  verso GitHub che l'allowlist **consente**; conflitto di precedenza non dichiarato tra CLAUDE.md
  («il ciclo vale SEMPRE») e il prompt chat («niente rituali, rispondi e basta»); la ricetta PR copre
  solo `ad-mycity`, niente corsia per il marketplace `mycity`.
- **Segreti negli argomenti dei processi**: token git nell'URL e service key negli header curl (visibili
  in `ps`/log sul VPS).
- **Path traversal allegati**: la regex del percorso ammette `..`.
- **Doppia storia / crescita quadratica**: con `--resume` attivo ogni turno reinvia comunque l'INTERA
  conversazione (che la sessione già contiene) + regole complete → token O(n²), la memoria muore nelle
  chat lunghe proprio quando serve. Il gate metabolizzazione misura la conversazione intera, non il turno.

---

## ⚪ MINORI (efficienza/pulizia, 6)
- File temporanei orfani (`mktemp`, `/tmp/mycity-allegati/<id>`) mai ripuliti (nessun `trap`).
- Chiavi `chat:sessione:*` in `impostazioni` mai pulite: una riga permanente per conversazione.
- Polling 5s × 2 servizi ≈ 150k chiamate REST/giorno a coda vuota + battito ogni 5s.
- Thinking 8000 indiscriminato anche su metabolizza/diagnosi/ritmo (lavoro di volume che non ne ha bisogno).
- `salva_sessione_chat` salva l'id anche di un run **fallito/scartato** → mappa che punta a storia divergente.
- Streaming: PATCH del testo parziale COMPLETO ogni 1.5s → banda O(N²) per risposte lunghe.

---

## 🎯 La mia raccomandazione (ordine di fix per impatto/rischio)
1. **Sicurezza del doppio invio + due worker (A + B + C)** — è il gruppo che può causare **danni reali**
   (email/payout doppi, codice non rivisto in produzione). Fix mirati: guardia `stato=eq.in_corso` su
   ogni PATCH d'esito; `recupera_lavori_orfani` che rispetta un claim/heartbeat per-worker; `sync_vault`
   che pusha il branch **corrente** (mai `main` da un `fix/*`) e non declassa un'azione già partita.
2. **Sicurezza del prompt (D)** — bonificare `LEZIONI-CHAT.md`, restringere `acceptEdits`/allowlist,
   isolare la `richiesta` come dato non-fidato.
3. **Blocco silenzioso (E1, HAS_RETRY_COLS, timeout git)** — timeout ovunque + fail-closed.
4. **Chiarezza dei prompt (i medi «incoerenti»)** — allineare permessi dichiarati e reali, risolvere il
   conflitto CLAUDE.md↔chat: pochi rii, molto ritorno sulla qualità delle risposte.
5. **Efficienza (router, doppia storia, thinking mirato, polling)** — taglio costi senza toccare la qualità.

> ⚠️ **Governo:** ogni auto-modifica del worker è 🟡 **firma di Nicola** (CLAUDE.md). Questo è un
> report (🟢). I fix vanno in una PR da approvare — dimmi da quale gruppo partire e la preparo.

## 🔧 Dettagli tecnici
- Metodo: workflow multi-agente, 12 lenti (concorrenza, hang/rete, sicurezza, integrità-coda,
  qualità-prompt, memoria-sessione, streaming, integrazione-Pannello, efficienza, osservabilità,
  giro/ritmo, gap-vs-stato-arte) → 78 difetti candidati → verifica avversariale 1:1 → 49 confermati.
- Interrotto agli ultimi 2 verificatori su richiesta (velocità): copertura ≥96% dei candidati.
- Dati grezzi: scratchpad `radiografia-dati.json` (findings + verdetti per dimensione).
