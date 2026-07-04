---
tipo: esito-sentinella
data: 2026-07-03 02:55
fonte: account-negozi + AD (cancello serietà 🔬 + allocazione AR-006)
sentinella: negozio_fermo (firma 11111111-1111-1111-1111-cccccccc0001)
colore: 🟡 (fix auto-modifica, firma Nicola)
---

# 💼 Sentinella «NEGOZIO FERMO» su Casa Linda → falso positivo (demo)

## Cosa chiedeva la sentinella
«1 negozio LIVE con 0 ordini da 14g (Casa Linda): prepara check-in anti-churn + messaggio di contatto.»

## Cosa ho verificato PRIMA di agire (🔬)
**Casa Linda NON è un negozio reale — è la demo/seed.**
- Firma della sentinella = `11111111-1111-1111-1111-cccccccc0001` = **UUID seed** del negozio demo.
- `registro-realta.json`: Casa Linda → stato **`demo`**, confidenza **1.0**, con conferma esplicita di Nicola (1/7 00:56): *«casa linda non esiste, è un negozio demo»*.
- Nota del registro: *«Non contattare, non usare per KPI negozi reali»*.
- Il **playbook anti-churn del 1/7** già classifica i 16 seed `11111111…` come *«monitoraggio passivo, 0 azioni»*.

→ **Nessun pacchetto anti-churn intestato e nessun messaggio di contatto** per Casa Linda: sarebbe un'azione senza fondamento e viola il cancello di allocazione **AR-006** (asset pesanti solo su entità `confermata`). Azione **bloccata**, come da regola d'oro.

## La causa radice (perché scatta lo stesso, in loop)
Il **sensore** `negozio_fermo` (`cervello/sentinella-dati.mjs`, righe 185-188) prende **tutti** i seller `approved` con 0 ordini/14g **senza escludere i demo/seed** — a differenza del playbook e di `allocazione-check.mjs` (riga 131: `e.stato !== "demo"`). Risultato: Casa Linda rientra ogni giro, la `ultima_firma` della dedup diventa il suo UUID demo, e la sentinella **riscatta a ogni cooldown (24h) bruciando uno slot di coda** — e, se un domani colleghiamo le «mani», rischierebbe di contattare un negozio inesistente.

## Il fix (🟡 auto-modifica → firma Nicola: NON applicato da sola)
Allineare il sensore al playbook, escludendo il namespace UUID seed. Patch a `cervello/sentinella-dati.mjs`:

```diff
@@ Negozio LIVE fermo da 14g
+    // AR-006 — i negozi demo/seed (UUID 11111111-…, es. Casa Linda) non sono reali: mai anti-churn/contatto.
+    const SEED_DEMO = /^11111111-1111-1111-1111-/i;
     s.negozi_fermi = sellers
       .filter((v) => oreDa(v.created_at) > 24 * 14)   // approvato da più di 14g
       .filter((v) => !attivi.has(v.id))
+      .filter((v) => !SEED_DEMO.test(v.id))            // escludi seed demo
       .map((v) => ({ id: v.id, nome: v.store_name || v.id }));
```

Effetto: la sentinella `negozio_fermo` scatterà **solo su negozi reali** fermi da 14g (oggi: nessuno → 0 falsi positivi). Da riapplicare anche nella prossima raccolta batch.

## Il negozio reale è già coperto (niente da fabbricare)
L'**unico** seller reale è **Pane Quotidiano**, e l'anti-churn è **già in corso**: playbook 1/7 → check-in titolare (**A6**) + upsell post-prima-consegna (**A7**) già accodati; frizione = ordine COD #58094956 fermo (decisione #16 = ESEGUI), payout-test 3/7. Non serve un nuovo pacchetto: aggiungerne uno sarebbe rumore.

## Esito
- ❌ Nessun contenuto intestato a Casa Linda (demo) — bloccato al cancello 🔬/AR-006.
- ⏳ Accodato 1 fix 🟡 (sopra) per spegnere il falso positivo alla radice.
- ✅ Anti-churn del negozio reale (Pane Quotidiano) già attivo (A6/A7) — nulla di nuovo da fare.
