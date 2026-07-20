---
tipo: playbook-refresh
reparto: growth-monetizzazione
data: 2026-07-20 11:19
colore: 🔴 (tocca i soldi — firma Nicola al lancio)
stato: ARMATO — refresh numeri + finanza + comunicazione
autore: AD digitale (+ finanza, content-social, loyalty-membership)
fonte-dati: STATO 20/7 11:00 · playbook base 6/7 · @finanza validazione 20/7
---

# 🎟️ REFRESH — Fedeltà di rete (20/7)

> Aggiornamento del playbook del 6/7. Meccanica invariata; numeri, economia e copy aggiornati.
> Documento base: `consegne/growth/2026-07-06-playbook-fedelta-di-rete.md`

---

## ⛔ Dove siamo (20/7 11:00)

| Fatto | Valore | Fonte |
|-------|--------|-------|
| Negozi reali attivi | **1** (Pane Quotidiano) | STATO 20/7 |
| Buyer registrati | **4** | STATO 20/7 |
| Ordini pagati | **0** | STATO 20/7 |
| Stallo business | **~625 h** (~26 gg) | STATO 20/7 |
| Commissione MyCity | **12%** | contratto PQ / pitch vendite |
| Stripe write | **non collegato** | sensori worker |

**Verdetto:** il programma resta **ARMATO, non acceso**. Lanciarlo oggi = promessa senza rete (1 bottega → punti spendibili… da 1 bottega).

---

## PARTE A — MyCity Punti (invariato + raccomandazione @finanza)

### Meccanica (confermata)
- **1 punto / €1** speso su qualunque negozio della rete
- **Valore punto:** da fissare @finanza — default proposto **€0,02** (cashback 2%)
- **Spesa:** su **tutta la rete** · soglia **100 pt = €2** · tetto **30%** carrello (consiglio finanza cold-start rete; playbook ammette 30–50%)
- **Scadenza:** 12 mesi dall'ultimo movimento
- **Chi paga:** margine MyCity (commissione), **non** il negozio — al riscatto il negozio incassa pieno

### Economia validata @finanza (20/7)

Assunzione AOV modello **€50** 🟡 (`Finanza & Unit Economics.md`):

| Voce | Calcolo |
|------|---------|
| Commissione/ordine | 12% × €50 = **€6,00** |
| Costo punti (2%, riscatto pieno) | **€1,00** |
| Commissione netta | **€5,00** (10% GMV) |
| % commissioni erosa | **16,7%** |

**Break-even incrementale (2% cashback):** serve **+20% GMV** sullo stesso bacino (10% × 1,20 = 12%).

### Raccomandazione % per fase (@finanza)

| Fase | Cashback | Quando |
|------|----------|--------|
| **Oggi (1 negozio)** | **0%** — non accendere | Gate AR-006 |
| **Lancio rete (≥5 negozi + payout OK)** | **1%** (1 pt = €0,01) | Break-even ~+9% GMV |
| **Scale (solo se holdout positivo)** | **2%** (1 pt = €0,02) | Solo se incrementale ≥+20% frequenza |

### 3 leve di sicurezza (numeriche)
1. Tetto riscatto **30%** carrello/ordine
2. Soglia minima **100 pt = €2**
3. Scadenza **12 mesi** + cap gift card **€100/giorno/cliente** (anti-frode)

---

## PARTE B — Gift Card MyCity (invariato)

- Tagli **€10 · €25 · €50** · spendibili su tutta la rete
- **Incasso subito** MyCity · negozio pagato **al riscatto**
- **Fiscale 🔴:** buono **MULTIUSO** probabile (art. 6-ter DPR 633/72) → IVA all'utilizzo — parere @legale-privacy + @contabilita **prima** di vendere
- **Mani:** Stripe write + tabella `gift_cards` + redemption checkout (@builder)
- **Anti-frode:** limite €100/giorno/cliente · codici monouso · watch chargeback

**Cassa:** float positivo solo nel gap incasso→payout negozio; oggi passività senza rete = rischio.

---

## PARTE C — Comunicazione (🟢 pronta)

Bozze complete in `consegne/content/2026-07-20-bozze-punti-giftcard-turno.md`:
- Post FB/IG MyCity Punti (pre-lancio, lista attesa)
- Post «Regala Piacenza»
- Pitch negoziante 1 riga
- Email annuncio clienti
- Testo banner home

**Regola copy:** zero % cashback in pubblico finché @finanza non fissa il valore · zero numeri inventati · gate rete esplicito.

---

## Gate di lancio (tutte e 5)

1. **≥ 5 negozi reali** con payout funzionante (oggi: 1)
2. **Flusso ordini reali** avviato (#41 ordine-prova PQ chiuso end-to-end)
3. **Stripe write** collegato
4. **% cashback** firmato @finanza (consiglio: 1% lancio)
5. **Parere legale + contabilità** su gift card (IVA/termini)

---

## ✅ Cosa consegno · ⏳ Coda · 🙋 Nicola

- **✅ FATTO (🟢):** refresh economia + meccanica confermata + bozze comunicazione
- **⏳ GIÀ IN CODA (🔴):** #44 MyCity Punti · #45 Gift Card · dettaglio A19–A20 in [[AZIONI-PRONTE]]
- **🙋 NICOLA oggi:** **niente da firmare** su fedeltà — priorità **PI26 (10:00)** + **ordine test PQ** (#41). Quando la rete c'è: firma % cashback + ok parere fiscale gift card + via al lancio.

## Prossimo passo (ordine reale)

1. Chiudere **#41** (primo ordine PQ + payout-test)
2. Portare **≥3–5 botteghe** dalla shortlist (Peretti, Garetti, Amendolara — #43)
3. Collegare **Stripe write** + parere fiscale
4. Firmare **#44** con % 1% lancio · **#45** dopo parere legale
