---
tipo: registro-salute-negozi
data: 2026-07-04 11:52
fonte: account-negozi (playbook anti-churn) · AD digitale
sensori: baseline REST Supabase marketplace clmpyfvpvfjgeviworth · giro.sh 4/7 11:30 (ordini=1, ultimo 24/6 08:28, 23 profili, dati_leggibili=true) · MCP execute_sql gated in sessione 4/7 (permesso non concesso — query seller live non ri-eseguita)
playbook: negozi-calo
precedente: 2026-07-03-playbook-anti-churn.md
---

# 📉 Playbook anti-churn — registro salute negozi (4/7 11:52)

## ⚠️ Verità sui dati (regola d'oro: nessun numero inventato)
Oggi 4/7 il **Supabase MCP `execute_sql` è gated** (ho tentato la query seller+trend ordini live → permesso non concesso). Uso la **baseline REST** confermata dal giro.sh 11:30 (business `corrente==ultimo_pieno`: ordini=1, ultimo 24/6 08:28, 23 profili) + la struttura negozi consolidata dal 1/7 (17 seller, 1 reale, 16 demo). **Nessun numero nuovo inventato.** La struttura negozi non è cambiata dal 1/7.

## Metodo
Health score + sentinella `−40% ordini 30g vs 30g precedenti` **oppure** `0 ordini da 14g`.
Filtro **negozi REALI**: esclusi i seed demo (UUID `11111111…`, conferma Nicola 1/7) — vedi `registro-realta.json`.

## Riepilogo
| Metrica | Valore | Δ vs 3/7 |
|---|---|---|
| Seller nel DB | **17** (baseline REST) | = |
| Seller REALI | **1** (Pane Quotidiano) | = |
| Seller demo (seed) | **16** — **nessuna azione** | = |
| 🟡 attenzione trend −40% | **0** | = |
| 🔴 a rischio (override operativo) | **1** (Pane Quotidiano) | = |
| Stallo primo ordine PQ | **~243h ≈ 10 giorni** | **peggiorato +24h** (era ~219h il 3/7) |

## Registro prioritizzato (solo REALI)

| Negozio | GMV 30g | Health | Segnale che pesa | Causa (dato) | Leva | Colore |
|---|---|---|---|---|---|---|
| **Pane Quotidiano** | €0 incassato · 1 ordine COD €19,05 | 🔴 **~36** (override, ↓ da 38 il 3/7 per stallo cresciuto) | Ordine `58094956…` fermo **~243h** (24/6 → 4/7) · stato NEW/PENDING · payout OFF | **Frizione operativa MyCity** — non calo vendite negozio; primo ordine mai consegnato → rischio «non vendo qui». Attesa ormai ~10 giorni. | ① Chiudere l'ordine OGGI (#16 IN CONSEGNA — WhatsApp #20 fatto, restano #21 accetta + #22 consegna) · ② Check-in retention sulla stessa chiamata #21 (A6) · ③ upsell post-consegna (A7) | 🟡 contatto |

### Perché è un caso di churn (e non un +100% "sano")
- Algoritmo trend: 1 ordine ultimi 30g vs 0 il mese prima = **+100%**, non −40% → il filtro trend NON scatterebbe.
- **Override playbook:** ordine bloccato ora **~10 giorni** sull'**unico** negozio reale = stadio **no value realized** (causa #1 di churn commercianti). Priorità assoluta a prescindere dal trend.
- **Concentrazione di rischio:** se PQ molla, i negozi reali di MyCity = **0**. Massima leva possibile su un solo account.

### Diagnostica Pane Quotidiano (confidenza 90%, invariata dal 1/7)
| Ipotesi | Verifica dati | Esito |
|---|---|---|
| Catalogo fermo | 5 prodotti `available`, stock OK (baseline 1/7) | ❌ scartata |
| Best-seller esaurito | stock ≥9 su tutti (baseline 1/7) | ❌ scartata |
| Frizione operativa | ordine COD NEW/PENDING da ~243h; #16 IN CONSEGNA, restano #21+#22 | ✅ **causa** |
| No-value / zero valore realizzato | 1 ordine esiste ma non chiuso da ~10 giorni | ✅ correlata (aggravata) |
| Stagionalità | panetteria bio — luglio OK | ❌ scartata |

**Contatto:** Via Calzolai 25 · tel. **0523 388601** (registro-realta.json).
**Finestra oggi:** Sant'Antonino (patrono) → centro pienissimo, ritiro a piedi/bici da Via Calzolai facilissimo; ZTL solo mezzi >35q. Consegna in mattinata o dopo le 18 (afa alle 17).

## Cosa cambia rispetto al giro 3/7 (perché non è un doppione)
1. **Stallo peggiorato** 219h→243h (+24h): il check-in resta ancorato a **oggi** e alla chiusura #16, non riproposto generico.
2. **Fase #16 avanzata:** dal 3/7 l'ordine è passato da «approvato ma fermo» a **IN CONSEGNA** (WhatsApp #20 al buyer FATTO 4/7 04:51). Restano solo le mani manuali #21 (accetta) + #22 (consegna COD €19,05). → Il check-in retention (A6) parte **sulla stessa telefonata #21**, come già previsto.
3. **Anti-duplicazione (AR-008):** le azioni di check-in/riattivazione per l'unico negozio reale **esistono già in coda** e coprono i tre scenari (vedi sotto). Questo giro le **conferma e aggiorna la cifra stallo**, non ne crea di nuove.

## Azioni di check-in/riattivazione — GIÀ ACCODATE (confermate, nessun doppione)
Il playbook produce UN check-in per negozio reale. C'è UN solo negozio reale → il check-in è già scritto e in coda, in 3 varianti a copertura degli scenari:

| Coda | Blocco | Cosa fa | Quando parte | Colore |
|---|---|---|---|---|
| **#25** | **A6** | Check-in retention sulla chiamata operativa #21 (+2 min: «scusate l'attesa, era rodaggio nostro, vi ho scelti perché il bio dal '76 in consegna non lo fa nessuno») + follow-up post-consegna | Sulla chiamata #21 (oggi, con la consegna #16) | 🟡 |
| **#25** | **A7** | Upsell post-prima-consegna: 2-3 prodotti-civetta bio + spinta social → flusso settimanale | Entro 48h **dopo** la prima consegna chiusa | 🟢 (bozza) |
| **#29** | **A9** | Rassicurazione standalone (telefonata 2 min) se #16 slitta ancora oggi | SOLO se #16 non si chiude oggi; se si chiude → salta ad A6/A7 | 🔴 (bozza 🟢) |

**Deliverable pieni:** `consegne/account-negozi/2026-07-04-anti-churn-standalone-pane-quotidiano.md` (A9) · script A6/A7 in `AZIONI-PRONTE.md`.

## Prossimo ciclo (quando batch negozi 6/7)
Al batch 6/7 il playbook avrà **>1 negozio reale** → il trend −40% diventa misurabile davvero e l'health score torna un ranking, non un override su singolo account. Da quel momento: giro settimanale su tutti i seller reali, check-in automatico a chi cala.
