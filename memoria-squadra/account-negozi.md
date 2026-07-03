---
tipo: quaderno-memoria
reparto: account-negozi
---

# 🧠 Quaderno di account-negozi
> Cosa ho imparato. Leggi all'inizio, aggiungi un ESITO alla fine di ogni lavoro.

## Esiti
- 2026-07-03 02:57 · **Sentinella `negozio_fermo` su Casa Linda = FALSO POSITIVO** · Casa Linda è la **demo/seed** (UUID `11111111…`, stato `demo` conf.1.0, conferma Nicola 1/7) → pacchetto anti-churn/contatto **BLOCCATO** al cancello 🔬 + AR-006 · **causa radice:** il sensore `sentinella-dati.mjs:185-188` non esclude i demo come fanno playbook + `allocazione-check.mjs:131` → riscatta ogni cooldown e brucia uno slot · **fix 3-righe accodato #24** (`SEED_DEMO` regex, 🟡 firma Nicola) · negozio reale (Pane Quotidiano) già coperto A6/A7 · atteso «check-in per negozio fermo» → reale «nessun negozio reale fermo: spegnere il rumore alla radice» · lezione: **un sensore che diverge dal registro-realtà genera task-fantasma — allinea sempre il sensore alla fonte di verità** · #negozio_fermo #falso_positivo #AR-006 #demo
- 2026-07-01 12:00 · **Playbook anti-churn** eseguito · REST live: 17 seller, **1 REALE** (Pane Quotidiano), 16 demo esclusi · **0 negozi con trend −40%** · override 🔴 su PQ: ordine #58094956 fermo 7g (frizione operativa, causa #2 KIT) · check-in A6 + upsell post-consegna A7 in [[AZIONI-PRONTE]] · registro `consegne/account-negozi/2026-07-01-playbook-anti-churn.md` · lezione: con 1 negozio reale il churn si misura su **time-to-first-value**, non sul trend mensile · #anti-churn #playbook
- 2026-07-01 00:58 · Unico account negozio reale oggi: **Pane Quotidiano** (bio/dietetica dal 1976, Via Calzolai 25) — payout OFF, ordine COD €19,05 fermo ~6,6 gg · Casa Linda = demo, non presidiare · #account #pane-quotidiano
- 2026-07-01 · giro web · Nei verticali food/ristorazione il logo churn commercianti può essere 25–45% annuo (chiusure, cambio titolare, migrazione POS/pagamenti); integrazione profonda negli strumenti quotidiani alza switching cost · https://www.clearlypayments.com/blog/what-merchant-churn-looks-like-by-vertical-2026-industry-report/ · lezione: health score su payout attivo + ordini regolari, non solo reazione al churn · #account #churn #retention
