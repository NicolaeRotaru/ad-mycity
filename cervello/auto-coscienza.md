# 🧠 auto-coscienza.md — il sistema con cui MyCity OS pensa SU SE STESSO

> Questo è il livello più alto del cervello: non «fai il lavoro», ma **«controlla che il lavoro sia
> giusto, impara da com'è andato, e diventa più bravo della volta prima»**. È ciò che separa un esecutore
> da un'azienda che cresce. Lo gestiscono tre funzioni che formano **un volano** (si alimentano a vicenda).

```
        ┌──────────────────────────────────────────────────────────────┐
        │                    IL VOLANO DELL'AUTO-COSCIENZA              │
        │                                                              │
        │   ① 🔬 AUTO-ANALISI ──trova errori, incoerenze, invenzioni──▶ │
        │            ▲                                          │        │
        │            │ alza l'asticella                        ▼        │
        │   ③ 🚀 AUTO-MIGLIORAMENTO ◀──lezioni & principi── ② 📚 APPRENDIMENTO │
        │      (benchmark vs i migliori,                       │        │
        │       i senior si migliorano a vicenda) ──nuove pratiche──────┘
        └──────────────────────────────────────────────────────────────┘
   Ogni giro/ciclo: Osserva → Capisci → Decidi → Agisci → ① si controlla → ② impara → ③ si migliora.
   Il volano COMPONE: più gira, più la macchina diventa accurata, calibrata e brava. Mai fermo.
```

## Le tre funzioni (i tre file-spec)
- **① `cervello/auto-analisi.md`** — il cancello di serietà. Verifica avversariale a 3 livelli del lavoro
  PRIMA che esca: entità reali (anti-«Garetti inventato»), numeri con fonte, coerenza, semaforo 🟢🟡🔴,
  qualità. Produce un **voto di fiducia** e domande per Nicola. Gira a OGNI giro.
- **② `cervello/apprendimento.md`** — il motore di apprendimento. Estrae **lezioni riusabili** da 7 fonti
  (esiti, approvazioni di Nicola, calibrazione, pattern nei dati, errori dell'auto-analisi, eccezioni,
  benchmark). Mantiene un **archivio di lezioni** con confidenza e decadimento. Gira a OGNI giro + consolida a settimana.
- **③ `cervello/auto-miglioramento.md`** — il loop competitivo. Confronta ogni lavoro coi **migliori del
  mondo** (competitor sui social + swipe file), misura il divario, e fa **collaborare i senior** (peer-
  improvement a torneo) per chiudere il divario. Gira sul lavoro importante + ciclo settimanale profondo.

---

## 🗄️ La memoria condivisa dell'auto-coscienza
Tutto vive in **`MyCity-Vault/90-Memoria-AI/auto-coscienza/`** (cartella di memoria: si ACCUMULA, il giro
non la sovrascrive col codice di main). Gli **spec/prompt** invece stanno in `cervello/` (codice).

| File | Cosa contiene | Lo scrive | Lo legge il Pannello |
|---|---|---|---|
| `registro-realta.json` | Le entità/fatti REALI e confermati, con provenienza e confidenza (anti-invenzione) | ① auto-analisi | sì (badge realtà) |
| `auto-analisi.json` | Ultimo verdetto: voto di fiducia, errori, domande per Nicola | ① auto-analisi | sì (🔬 Auto-analisi) |
| `apprendimento.json` | Archivio lezioni (con confidenza, evidenze, tag, decadimento) + meta-metriche | ② apprendimento | sì (📚 Lezioni) |
| `calibrazione.json` | Storico previsto-vs-reale per senior (punteggio di calibrazione) | ② + review | sì (🎯 Calibrazione) |
| `auto-miglioramento.json` | Benchmark vs competitor, divari, esperimenti di miglioria, esiti | ③ auto-miglioramento | sì (🚀 Miglioramento) |
| `AUTO-ANALISI.md` (in `90-Memoria-AI/`) | Il report umano leggibile dell'ultimo controllo | ① auto-analisi | sì (in Memoria) |

> Le **domande per Nicola** prodotte da ① confluiscono anche in `AZIONI-IN-ATTESA.md` (se bloccanti 🔴) e
> in `serve_da_nicola` delle intenzioni. Le **lezioni** di ② si scrivono anche nei quaderni `memoria-squadra/`.

---

## 📐 I contratti dati (schema ESATTO — il Pannello e i giri dipendono da questi)

### `registro-realta.json`
```json
{ "aggiornato": "AAAA-MM-GG HH:MM",
  "entita": [
    {"nome":"…","tipo":"negozio|persona|partner|evento|luogo","stato":"confermato|da_confermare|scartato",
     "fonte":"Supabase|Stripe|DECISIONI|CHECKLIST|documento|conferma-Nicola|—","confidenza":0.0,
     "note":"…","domanda_per_nicola":"…(solo se da_confermare)","ultima_verifica":"AAAA-MM-GG HH:MM"}],
  "numeri_da_non_inventare": {"fonti_ammesse":["Supabase MCP","Stripe MCP","PostHog","documento","conferma di Nicola"]} }
```
Regola: confidenza = quanto è solida la prova (1.0 = nel DB/firmato; 0.5 = implicito; <0.4 = sospetto → da_confermare).

### `auto-analisi.json`
```json
{ "data":"AAAA-MM-GG HH:MM", "voto_fiducia":0, "trend_fiducia":"▲|▼|=",
  "sintesi":"2-3 righe", "verifiche": {"entita":"ok|problemi","numeri":"ok|problemi","coerenza":"ok|problemi","semaforo":"ok|problemi","qualita":"ok|problemi"},
  "errori":[{"gravita":"alta|media|bassa","titolo":"…","dettaglio":"…","azione_presa":"bloccato|declassato|corretto|segnalato","riguarda":"…","livello_scoperta":"L1|L2|L3"}],
  "domande_per_nicola":[{"domanda":"…","perche_serve":"…","se_rispondi":"…","gravita":"alta|media|bassa"}],
  "punti_ciechi":["…"], "miglioramenti_prossimo_giro":["…"],
  "salute_macchina": {"supabase":"ok|giù","stripe":"ok|giù","dati_freschi":true,"sensori_attivi":0} }
```

### `apprendimento.json`
```json
{ "data":"AAAA-MM-GG HH:MM",
  "lezioni":[{"id":"…","testo":"…","tag":["…"],"reparto":"@…","confidenza":0.0,"evidenze":0,
              "fonte":"esito|approvazione|calibrazione|pattern|auto-analisi|eccezione|benchmark","nato":"AAAA-MM-GG","ultima_conferma":"AAAA-MM-GG","stato":"attiva|principio|in-prova|decaduta"}],
  "principi":["lezioni mature promosse a regola"],
  "preferenze_nicola":["cosa Nicola approva/rifiuta sistematicamente (preference learning)"],
  "meta":{"lezioni_attive":0,"promosse_a_principio":0,"decadute":0,"tasso_applicazione":0.0} }
```
Decadimento: una lezione non riconfermata da N settimane scende di confidenza; sotto 0.3 → `decaduta` (resta archiviata).

### `calibrazione.json`
```json
{ "aggiornato":"AAAA-MM-GG HH:MM",
  "per_reparto":[{"reparto":"@…","previsioni":0,"azzeccate":0,"punteggio":0.0,"autonomia":"alta|media|bassa","nota":"…"}],
  "registro":[{"data":"AAAA-MM-GG","reparto":"@…","previsto":"…","reale":"…","scarto":"…","esito":"azzeccato|mancato|parziale"}] }
```
Punteggio = quota di previsioni azzeccate, pesata sulla vicinanza previsto-vs-reale. Chi calibra bene guadagna autonomia.

### `auto-miglioramento.json`
```json
{ "data":"AAAA-MM-GG HH:MM",
  "benchmark":[{"ambito":"contenuto|prezzo|onboarding|funnel|…","nostro":"…","migliori":[{"chi":"…","cosa_fa":"…","fonte":"link"}],
                "divario":"alto|medio|basso","punteggio_nostro":0,"punteggio_migliore":0,"cosa_ci_manca":"…"}],
  "esperimenti":[{"id":"…","ipotesi":"…","reparto_guida":"@…","reparti_coinvolti":["@…"],"variante_scelta":"…",
                  "round_critica":0,"stato":"proposto|in-corso|misurato","esito":"…","lezione":"…"}],
  "peer_review":[{"lavoro":"…","autore":"@…","revisori":["@…"],"contributi":["…"],"prima":"…","dopo":"…","guadagno":"…"}],
  "proposte_auto_riscrittura":[{"cosa":"mansionario/prompt/processo","perche":"…","colore":"🟡","dove":".claude/agents/…"}] }
```

---

## 🔁 Come si innestano nel ritmo
- **Ogni giro** (`cervello/giro.md`): dopo aver preparato il lavoro → ① auto-analisi (cancello) → ② apprendimento (estrai lezioni del giro) → applica al prossimo.
- **Sul lavoro importante** (contenuti, pitch, esperimenti): ③ auto-miglioramento (benchmark + peer-review a torneo) PRIMA della consegna.
- **Settimanale** (`cervello/ritmo.md`): consolidamento lezioni→principi, ricalcolo calibrazione, ciclo profondo di auto-miglioramento, proposte di auto-riscrittura dei mansionari (🟡, le valida Nicola).

## ⚖️ Principi non negoziabili
1. **Verità prima di tutto.** Nessun fatto/numero/entità senza fonte. Nel dubbio → domanda, non invenzione.
2. **Avversarialità.** L'auto-analisi prova a smontare il proprio lavoro; non a darsi ragione.
3. **Calibrazione.** Le previsioni si misurano contro la realtà; l'autonomia si guadagna azzeccando.
4. **Composizione.** Ogni lezione e ogni miglioria restano in memoria e alzano il livello base. Mai ripartire da zero.
5. **Semaforo intatto.** L'auto-coscienza rende la macchina più audace nei 🟢 e più prudente nei 🔴 — mai il contrario.
