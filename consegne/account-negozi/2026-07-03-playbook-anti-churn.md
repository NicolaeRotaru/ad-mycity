---
tipo: registro-salute-negozi
data: 2026-07-03 11:26
fonte: account-negozi (playbook anti-churn) · AD digitale
sensori: baseline REST Supabase marketplace clmpyfvpvfjgeviworth (MCP execute_sql gated in sessione 3/7 — permesso non concesso) · delta-gate 3/7 10:29 ri-misurato LIVE `corrente==ultimo_pieno`
playbook: negozi-calo
precedente: 2026-07-01-playbook-anti-churn.md
---

# 📉 Playbook anti-churn — registro salute negozi (3/7 11:26)

## ⚠️ Verità sui dati (regola d'oro: nessun numero inventato)
Oggi 3/7 il **Supabase MCP `execute_sql` è gated** (permesso non concesso in sessione) → non ho ri-eseguito la query seller live. Uso la **baseline REST** confermata al giro 1/7 11:57 (17 seller, 1 reale, 16 demo) + il **delta-gate 3/7 10:29** che ha ri-misurato LIVE il business `corrente==ultimo_pieno` (ordini=1, ultimo 24/6 08:28, 23 profili). Nessun numero nuovo inventato. La struttura negozi non è cambiata dal 1/7.

## Metodo
Health score + sentinella `−40% ordini 30g vs 30g precedenti` **oppure** `0 ordini da 14g`.
Filtro **negozi REALI**: esclusi i seed demo (UUID `11111111…`, conferma Nicola 1/7) — vedi `registro-realta.json`.

## Riepilogo
| Metrica | Valore | Δ vs 1/7 |
|---|---|---|
| Seller nel DB | **17** (baseline REST 1/7) | = |
| Seller REALI | **1** (Pane Quotidiano) | = |
| Seller demo (seed) | **16** — **nessuna azione** | = |
| 🟡 attenzione trend −40% | **0** | = |
| 🔴 a rischio (override operativo) | **1** (Pane Quotidiano) | = |
| Stallo primo ordine PQ | **~219h** | **peggiorato +50h** (era ~169h) |

## Registro prioritizzato (solo REALI)

| Negozio | GMV 30g | Health | Segnale che pesa | Causa (dato) | Leva | Colore |
|---|---|---|---|---|---|---|
| **Pane Quotidiano** | €0 incassato · 1 ordine COD €19,05 | 🔴 **~38** (override, ↓ da 42 il 1/7 per stallo cresciuto) | Ordine #58094956 fermo **~219h** (24/6 → 3/7) · stato NEW/PENDING · payout OFF | **Frizione operativa MyCity** — non calo vendite negozio; primo ordine mai consegnato → rischio «non vendo qui». Attesa passata da 7 a 9+ giorni. | ① Check-in retented al titolare **oggi** (rider su #21) · ② chiudere l'ordine (#16 stamattina) · ③ upsell post-consegna (A7) | 🟡 contatto |

### Perché è un caso di churn (e non un +100% "sano")
- Algoritmo trend: 1 ordine ultimi 30g vs 0 il mese prima = **+100%**, non −40% → il filtro trend NON scatterebbe.
- **Override playbook:** ordine bloccato ora **>9 giorni** sull'**unico** negozio reale = stadio **no value realized** (causa #1 di churn commercianti, KIT). Priorità assoluta a prescindere dal trend.
- **Concentrazione di rischio:** se PQ molla, i negozi reali di MyCity = **0**. Massima leva possibile su un solo account.

### Diagnostica Pane Quotidiano (confidenza 90%, invariata dal 1/7)
| Ipotesi | Verifica dati | Esito |
|---|---|---|
| Catalogo fermo | 5 prodotti `available`, stock OK (baseline 1/7) | ❌ scartata |
| Best-seller esaurito | stock ≥9 su tutti (baseline 1/7) | ❌ scartata |
| Frizione operativa | ordine COD NEW/PENDING da ~219h; Scelta A firmata; #16 in attesa esecuzione | ✅ **causa** |
| No-value / zero valore realizzato | 1 ordine esiste ma non chiuso da 9+ giorni | ✅ correlata (aggravata) |
| Stagionalità | panetteria bio — luglio OK | ❌ scartata |

**Contatto:** Via Calzolai 25 · tel. **0523 388601** (registro-realta.json).

## Cosa cambia rispetto al giro 1/7 (perché non è un doppione)
1. **Stallo peggiorato** 169h→219h (+50h): il check-in va **ancorato a oggi** e alla chiusura #16, non riproposto generico.
2. **Gap d'integrità chiuso:** il registro 1/7 dichiarava «A6/A7 accodati» ma i blocchi **non erano nel file** AZIONI-PRONTE (c'erano solo A1–A5). Ora **A6 (check-in) e A7 (upsell)** sono scritti davvero + riga canonica **#25** in AZIONI-IN-ATTESA.
3. **Anti-duplicazione (AR-008):** il check-in è un **rider** sulla chiamata operativa #21 (stessa telefonata al negozio), non una seconda azione — +2 min di retention, poi follow-up dopo la consegna.

## Azioni accodate (ora davvero presenti)
→ `AZIONI-PRONTE.md` **A6** (check-in anti-churn PQ, 🟡) · **A7** (upsell post-prima-consegna, 🟢 pianificato)
→ `AZIONI-IN-ATTESA.md` **#25** (coda canonica, firma Nicola)

## Prossimo ciclo (quando batch negozi 6/7)
- Riapplicare il registro su **≥6 negozi reali** con health score completo (login/listing — oggi mancano colonne DB).
- Attivare la sentinella `S-negozio-calo` quando ≥2 seller reali hanno storico ordini (allora il trend −40% diventa misurabile).
- Al ritorno del MCP: ri-eseguire la query seller live per confermare la baseline REST.
