---
titolo: "Veglia in tempo reale — la sentinella dei dati che sveglia il worker senza bruciare token"
data: 2026-07-02 23:40
reparto: builder-automazioni
colore: 🟡 (codice in branch) · attivazione VPS 🔴
branch: claude/worker-sentinel-analysis-ncldvf
---

# 👁️ Veglia in tempo reale — analisi completa + build

**Richiesta di Nicola:** aggiungere sentinelle che girano ogni 1-5 minuti, così la macchina è
«sveglia e guarda tutto in tempo reale» e si **auto-analizza ogni 1-5 min** — **senza usare token**,
usando i token **solo quando il worker trova davvero qualcosa da fare**.

Questa è l'analisi profonda di *come* si fa, la scelta di design, e cosa ho costruito (pronto in branch).

---

## 1) Come è fatta oggi la macchina (i due orologi)

La macchina ha già **due tipi di motore schedulato** su systemd (VPS `/opt/mycity/ad-mycity`):

| Tipo | Chi | Cadenza | Costo | Cosa fa |
|---|---|---|---|---|
| **Worker (sempre acceso)** | `worker.sh` via `mycity-worker.service` (`Restart=always`) | poll coda ogni **5s** | **0 token da fermo**; token **solo** quando c'è un lavoro | Prende i `lavori` in `in_attesa` da Supabase e li fa eseguire al **motore AI** (Claude/Cursor). È ciò che fa partire gli «Approva» del Pannello. |
| **Timer (a orario)** | `mycity-giro.timer` (2h), `mycity-ritmo-*`, `mycity-monitora`, `mycity-verifica`, `mycity-sentinella`, `mycity-watch-main` | da 3 min a 1 giorno | dipende | Alcuni accendono l'AI (giro, ritmo, monitora → **token**); altri sono script deterministici (sentinella-lavori, watch-main, verifica → **0 token**). |

**Il punto chiave che già esiste (e che va sfruttato):** il worker **da fermo non costa nulla** — è
un `curl` di polling ogni 5s. Il modello AI si accende **solo** quando in coda `lavori` compare una
riga `in_attesa`. Quindi il modo giusto per «vegliare in tempo reale senza token» **non** è far girare
l'AI ogni minuto: è avere **occhi deterministici** che ogni 1-5 min guardano i dati e, **solo quando
trovano qualcosa**, **accodano un lavoro** che il worker (già acceso) esegue.

Pezzi deterministici (0 token) che già ci sono e che ho riusato:
- `verifica-sensori.mjs` — legge via REST se i sensori dati sono vivi, scrive `sensori-cecita.json`.
- `delta-gate.mjs` — calcola una «firma» dello stato reale (ordini, clienti, sensori) per **saltare**
  i giri AI quando **nulla è cambiato**. È già la prova che la macchina sa misurare lo stato a costo zero.
- `sentinella-lavori.mjs` (timer **ogni 3 min**) — deterministico, ma guarda **solo la coda** (lavori
  falliti/orfani), **non i dati del marketplace**.

**Il buco:** nessuno guardava i **dati reali** (ordini, payout, recensioni, cassa) ogni pochi minuti
per svegliare il cervello sull'evento. Questa è la sentinella che ho costruito.

---

## 2) La decisione di design: modello OCCHI / CERVELLO

```
 ┌────────────────────────────────────────────────────────────────────┐
 │  OCCHI  = sentinella-dati.mjs   (timer ogni 1 min · Node su REST)   │
 │           legge ordini/payout/recensioni/carrelli + salute → 0 TOKEN│
 │           valuta le soglie in modo deterministico                  │
 │                              │                                     │
 │              soglia scattata + evento NUOVO?                        │
 │                    │ sì                    │ no                     │
 │                    ▼                       ▼                        │
 │            accoda 1 «lavoro»        non fa nulla (0 token)          │
 │            in coda `lavori`         → il cervello resta a riposo    │
 └────────────────────┼───────────────────────────────────────────────┘
                      ▼
 ┌────────────────────────────────────────────────────────────────────┐
 │ CERVELLO = worker.sh (già acceso 24/7)                              │
 │   dorme a 5s (0 token) finché la coda è vuota                       │
 │   si SVEGLIA e brucia token SOLO su quel lavoro                     │
 └────────────────────────────────────────────────────────────────────┘
```

Perché questo rispetta **al 100%** il vincolo di Nicola:
- **Guardare** = `node` puro su REST ogni 1 min → **0 token**, per sempre.
- **Pensare** (token) = **solo** quando la sentinella ha trovato un evento e ha accodato un lavoro.
- Con dedup + cooldown + tetto, un problema che dura tutto il giorno = **1 sveglia**, non 720.

Alternative scartate (e perché):
- ❌ *Far girare il `giro` AI ogni 5 min*: brucia token in continuazione anche a marketplace fermo. È
  esattamente ciò che il `delta-gate` (AR-019) è stato scritto per **evitare**.
- ❌ *Far leggere i dati all'AI a ogni tick*: l'AI per «guardare un numero» è lo strumento sbagliato e
  costoso. Un `curl` fa lo stesso a costo zero; l'AI serve per **decidere**, non per **leggere**.
- ✅ *Occhi deterministici + sveglia su evento*: il modello di ogni sistema di monitoraggio serio
  (Prometheus/alertmanager, cron-check → paging). Qui il «paging» è accodare un lavoro all'AD.

---

## 3) Cosa ho costruito (in branch, 🟡 — niente è attivo finché Nicola non firma)

1. **`cervello/sentinella-dati.mjs`** — la sentinella dei dati. A ogni tick (0 token):
   - kill-switch (PAUSA Pannello o pausa propria) → no-op;
   - legge lo stato reale via REST + i JSON di auto-coscienza (best-effort: dato non leggibile → salta
     la regola, **mai numeri inventati né falsi allarmi**);
   - valuta le **10 soglie** deterministiche (sotto): **5 per la MACCHINA + 5 per le AZIONI** (scelta di Nicola);
   - **dedup + cooldown per-regola** (6h default; 12-24h per i segnali lenti) + **doppio dedup lato DB**;
   - **tetto di spesa** (8/giorno, 3/ora) sul volume; **i 🔴 bypassano il tetto** (sono controlli, non volume);
   - accoda **solo `tipo=analisi`/proposta** (⛔ mai `esegui-azione`): le azioni reali restano firma di Nicola;
   - alcuni segnali (worker morto) sono **solo-allerta**: avvisano su Telegram, non accodano nulla;
   - lascia un **battito** per il Pannello (`sentinella-dati:ultimo`) + ping Telegram sui 🔴 nuovi.

2. **`cervello/vps/mycity-sentinella-dati.timer`** — ogni **1 min** (`OnUnitActiveSec=1min`, regolabile 1-5).
3. **`cervello/vps/mycity-sentinella-dati.service`** — oneshot, `SENTINELLA_DATI_LIVE=1`, TZ Europe/Rome.
4. **`cervello/vps/install-ritmo-timers.sh`** — aggiornato: lo stesso comando installa anche la nuova sentinella.
5. **`cervello/sentinelle.md`** — documentato il modello OCCHI/CERVELLO e le 10 soglie live.

### Le 10 sentinelle LIVE (soglie deterministiche su nomi/enum REALI del DB, verificati via schema)

**🧠 MACCHINA (auto-analisi di sé) — 5**
| Regola | Soglia | Colore | Cosa fa |
|---|---|---|---|
| Worker morto | `worker:ultimo` > 3 min **e** 0 lavori in corso | 🔴 | **solo allerta** (accodare sarebbe inutile) |
| Sensori dati ciechi | ≥ 3 giri consecutivi | 🟡 | accoda: `.env` + fallback baseline |
| Salute architettura bassa | voto < 60 (`storico-salute.json`) | 🟡 | accoda: lancia l'auto-radiografia |
| Radiografia di sé vecchia | > 10 giorni (`auto-radiografia.json`) | 🟡 | accoda: rifà la radiografia di sé |
| Volano fermo | `tasso_applicazione` < 0.3 | 🟡 | accoda: capire perché il loop non applica |

**💼 AZIONI (business/marketplace) — 5**
| Regola | Soglia (colonne reali) | Colore | Cosa fa |
|---|---|---|---|
| Ordine pagato senza payout | `payment_status=PAID`, non-COD, `payout_at` nullo da >24h | 🔴 | accoda: proposta payout (Nicola firma) |
| Calo ordini | 24h < 70% media 7g (guardia media ≥ 3/gg) | 🟢 | accoda: mini-briefing sulla causa |
| Recensione ≤2★ | nuova (`reviews`+`store_reviews`, `rating≤2`) | 🟡 | accoda: bozza risposta + recupero |
| Negozio LIVE fermo | seller `approved` >14g, 0 ordini in 14g | 🟡 | accoda: check-in anti-churn |
| Carrello abbandonato | `recovered=false`, email non inviata, fermo >4h | 🟡 | accoda: email di recupero |

> **Prova coi dati veri di oggi** (verificata in test): macchina **sana** (salute 78, volano 0.5,
> radiografia 4gg, 0 sensori ciechi) → le 5 sentinelle macchina restano **zitte** (0 token); scattano
> solo le azioni realmente utili (carrelli abbandonati: 4 reali · negozi LIVE fermi: sui 2 approvati).
> È esattamente il comportamento voluto: **occhi sempre aperti, cervello acceso solo quando serve.**
>
> Aggiungere altre sentinelle = **una regola in più** in `valutaRegole()` (lo schema è già pronto).

---

## 4) Governo e sicurezza (il cancello 🟢🟡🔴)

- **Costruzione in branch = 🟡** — fatto e ti avviso (questo documento).
- **Attivazione sul VPS = 🔴** — `sudo bash cervello/vps/install-ritmo-timers.sh` accende il timer. È
  irreversibile-ish (tocca il cervello in produzione) → **serve la tua firma**. Accodata in AZIONI-IN-ATTESA.
- **La sentinella non spende soldi né manda nulla di reale**: accoda solo analisi/proposte. Ogni azione
  🔴 (payout, email) resta un lavoro che **tu approvi** nel Pannello. Zero doppio-invio.
- **Anti-salasso**: dedup, cooldown, tetto giornaliero/orario. Se domani i token stringono, alzi
  `SENTINELLA_DATI_COOLDOWN_ORE` o abbassi `SENTINELLA_DATI_MAX_GIORNO` — la veglia resta, cala il volume.

---

## 5) Come lo provi (a costo zero, senza attivare niente)

```bash
# Dry-run: mostra cosa accoderebbe, NON accoda e NON usa token
node cervello/sentinella-dati.mjs
node cervello/sentinella-dati.mjs --json     # per il Pannello / debug
```
Sul VPS, quando firmi: `sudo bash cervello/vps/install-ritmo-timers.sh` e poi
`systemctl list-timers | grep sentinella-dati` per vedere il battito ogni minuto.

---

## 6) Cosa serve da Nicola
1. **Firma 🔴** per attivare il timer sul VPS (una riga in AZIONI-IN-ATTESA).
2. (Fatto) cadenza scelta: **1 minuto**.
3. (Opz.) quali **altre soglie** vuoi live per prime (recensioni? negozi in calo? 5xx?) — le aggiungo
   come regole nuove.
