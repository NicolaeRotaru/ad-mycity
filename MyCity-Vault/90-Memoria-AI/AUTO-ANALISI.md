# 🔬 AUTO-ANALISI — 2026-07-25 06:45

## Voto di fiducia: **90/100** (▼ da 92 di ieri 11:05 — vedi "Perché il voto scende")

## Sintesi
Giro pieno heartbeat (19h dall'ultimo giro pieno, ieri 24/7 11:05). Business riverificato dal vivo con query SQL dirette: INVARIATO — 1 PQ, 5 prodotti, 4 buyer, 1 ordine (zombie, annullato), 0 pagati, 0 recensioni, 3 carrelli abbandonati. Stallo North Star **31 giorni esatti**. Misurati i 2 esperimenti in scadenza oggi: **EXP-001** (ordini_consegnati, mancata — 0 vs atteso 1) ed **EXP-007** (check-in PQ concordato, mancata — superato dalla pausa negozi concordata con Nicola, non un fallimento operativo). Chiuso il gate `chiusura-loop` (ESITO @ad registrato). Corretto un difetto di contratto JSON trovato in `auto-analisi.json` stesso (vedi sotto). Accodate 2 azioni 🟡 concrete e pronte invece di rilogare l'ennesima lezione.

## Errori trovati
1. **Contratto JSON fuori-schema (corretto in questo giro):** `auto-analisi.json` scriveva `salute_macchina` con campi liberi (`sensori_ok`, `max_giri_ciechi`, `automazione`, …) invece dei nomi canonici che il Pannello legge (`supabase`/`stripe`/`dati_freschi`/`sensori_attivi`, da `AutoCoscienza.tsx:146`). Il Pannello mostrava quel blocco vuoto da almeno il giro di ieri. Riscritto ai campi canonici in questo giro.
2. **4 script di diagnosi bloccati da approvazione per tutta la sessione**: `esperimenti-check.mjs`, `valida-contratti.mjs`, `apprendimento-guardiano.mjs`, `cristallizza-apprendimento.mjs` — tutti dichiarati sola-lettura/bookkeeping nella loro stessa intestazione. Bypassati leggendo il sorgente e replicando la logica a mano (più lento, più a rischio di errore di calcolo mio). Non un errore di questo giro, ma la causa root di un pattern che torna da giorni — vedi card #239.

## Passaggi precedenti

### 2026-07-24 11:05
Giro pieno su richiesta esplicita di Nicola in chat — riconferma, non novità. Business riverificato dal vivo con query SQL dirette: invariato — 1 PQ, 5 prodotti, 4 buyer, 1 solo ordine (zombie, annullato), 0 pagati, 0 recensioni. Verificati nel merito entrambi i vincoli hard iniettati dal giro: **AR-113** rispettato (nessuna azione fuori scope North Star); **AR-041/AR-106** — il messaggio "nessun esperimento aperto" non corrispondeva ai fatti (6 restano aperti dopo questo passaggio, incl. 2 dedicati al North Star), il vero trigger era **EXP-005** in scadenza oggi: misurato ora come mancata (il suo gate social è ancora in pausa per il rinvio negozi al 24/8-1/9). Nessuna azione 🟡/🔴 nuova accodata: le mosse giuste (ordine test PQ, domanda PI26) restano quelle di stamattina.

### 2026-07-24 06:24
Giro pieno legittimo (heartbeat: 14h dall'ultimo giro pieno di ieri sera 23/7 16:47) — non un'invocazione ravvicinata a vuoto. Business riverificato dal vivo con query SQL dirette: invariato — 1 PQ, 5 prodotti, 4 buyer, 1 solo ordine (zombie, annullato), 0 pagati, 0 recensioni, stallo ~718h (~30gg). Nessuna azione 🟡/🔴 nuova accodata: le mosse giuste (ordine test PQ, domanda PI26) sono già in coda dai giorni scorsi. Trovato e corretto (🟢, memoria) un refuso residuo: `cervello/radar.json` citava ancora "Garetti" come negozio-faro nel fattore "negozio-01", invece di "Pane Quotidiano" — residuo di prima della correzione R3/AR-006 del 14/7.

## Domande per Nicola
1. **Ordine test PQ?** — ancora fermo, unica mossa diretta North Star 0→1 (`#ordine-test-pq`)
2. **PI26 inviata?** — 5 giorni residui, scade 30/7 ore 16:00 (`#bandi-cciaa-2007`)

## Salute macchina
- Sensori: 10/11 attivi (Telegram non configurato, noto, non bloccante) · Supabase ok · Stripe ok · dati freschi
- Coerenza-fatti: **NON riverificata in modo indipendente in questa sessione** (script bloccato da approvazione) — ereditata dal pre-check di giro.sh delle 06:20. Declassata onestamente in `registro-realta.json`, non spacciata per confermata.
- North Star: stallo confermato 31 giorni esatti (ricalcolato a mano, non solo citato)
- Esperimenti: 4/13 misurati (tutti mancata), 4 aperti residui, 0 in scadenza oggi (verificato leggendo ogni singola data_misura, non solo il contatore)
- Nessun pattern "loop a vuoto": 19h reali dall'ultimo giro pieno, heartbeat legittimo

## Entità verificate (registro-realta.json)
- Pane Quotidiano → confermato (invariato, query diretta)
- 0 ordini pagati / 7 profili / 4 buyer / 5 prodotti / 0 recensioni / 3 carrelli abbandonati → confermati (query diretta)
- EXP-001 mancata, EXP-007 mancata → confermati (query diretta + registro-fatti.json)

## Refutazione vera (non boilerplate — 3 claim messi in dubbio davvero)
1. **"Stallo 31 giorni"** — ricalcolato a mano da `ultimo_ordine=2026-06-24 08:28:40` a oggi: 6 giorni residui di giugno + 25 di luglio = 31. **Sopravvive.**
2. **"0 esperimenti in scadenza residui"** — non preso per buono dal contatore: rilette una per una le `data_misura` dei 4 esperimenti aperti rimasti (EXP-002 27/7, EXP-003 28/7, EXP-006 20/8, EXP-013 30/7). Nessuno ≤ oggi. **Sopravvive.**
3. **"Memoria coerente"** — **NON sopravvive allo stesso livello**: ereditata dal pre-step di `giro.sh`, mai riverificata in modo indipendente in questa sessione (script bloccato). Rischio stimato basso (nessuna scrittura di questo giro ha toccato un valore di `registro-fatti.json`) ma è un gap di verifica reale, dichiarato come tale, non nascosto.

## Perché il voto scende (92→90)
Non per il business (invariato, verificato). Il voto scende di 2 punti perché il **livello di verifica è L2, non L3**: 4 controlli deterministici sono stati bypassati a mano per un blocco di approvazione ricorrente, invece di essere eseguiti dallo strumento dedicato. È un problema di ambiente (card #239 lo propone come fix), non di rigore del lavoro fatto — ma un voto che ignorasse questo gap sarebbe un timbro, non una misura onesta.
