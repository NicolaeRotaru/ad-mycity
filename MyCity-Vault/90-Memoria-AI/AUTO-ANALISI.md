---
data: 2026-06-30 11:45
tipo: auto-analisi
fonte: AD digitale — cancello di serietà (verifica avversariale)
---

# 🔬 Auto-analisi del giro — 2026-06-30 11:45

## Voto di fiducia: 85 / 100 — trend ▼ (da 88)
−3 punti, **non per un errore di lavoro ma per un peggioramento dei sensori**: il Supabase MCP, che il 29/6
era leggibile live, in questa sessione è di nuovo cieco (needsAuth). I 7 numeri non sono riverificabili oggi:
tenuti correttamente alla baseline del 29/6 e dichiarati come gap di misura (non come dato fresco). Il valore
aggiunto reale del giro è il **radar live**: confermata la **svolta meteo** (fine caldo, pioggia oggi+domani)
e il dettaglio del **Venerdì Piacentini 3/7** (49 eventi), entrambi con fonti citate. Nessuna entità nuova
senza fondamento, nessun numero orfano, nessuna 🔴 travestita da 🟢.

## Errori per gravità

### Media — Regressione dei sensori (Supabase cieco dopo il 29/6)
La cecità sui dati interni è tornata in questa sessione. Gestita con onestà (baseline + gap), ma è un
peggioramento dell'invariante "dati freschi". **Azione:** 7 numeri etichettati come baseline 29/6; wiring
Vercel / autorizzazione MCP già in coda (#10).

### Bassa — Stallo a ~6 giorni osservato ma non sbloccabile dalla macchina
Quarto giro: le leve di sblocco sono tutte 🔴 in attesa. **Azione:** prodotto comunque un 🟢 concreto (nota
operativa svolta meteo) e riescalate le domande 🔴 a Nicola.

Nessun errore grave. Nessuna entità inventata, nessun numero orfano.

## Grounding delle entità (3 strade)
- **Casa Linda** → `confermato` (baseline 29/6; **non riverificato oggi**, MCP cieco).
- **Pane Quotidiano** → `confermato` (baseline 29/6; non riverificato oggi).
- **Garetti** → `scelta_ragionata` (prospect, fondato su campo-aperto-faro.md + fatti pubblici).
- **Ex Scuderie** → `scelta_ragionata` (3 spazi food approvati dal Comune, fonte PiacenzaSera).
- **Svolta meteo 30/6** → fatto esterno verificato live (TempoItalia/MeteoLive/iLMeteo).
- **Venerdì Piacentini 3/7 (49 eventi)** → fatto esterno verificato live (programma ufficiale PDF + IlPiacenza).

## Domande per Nicola
1. 🔴 **Forzo la prima transazione con Casa Linda?** — ~6 giorni a zero, unico payout-ready.
2. 🔴 **Sblocco l'ordine zombie €19,05?** — fermo da ~6 giorni, buyer nel limbo.
3. 🟡 **Autorizzi il Supabase MCP (o chiavi su Vercel)?** — è l'unico modo per tornare a vedere i 7 numeri.

## Salute della macchina
Sensori attivi: **1** (solo web). Supabase marketplace cieco in sessione, Stripe/PostHog non collegati,
dati_freschi = **false**. Il volano gira (lezioni applicate, vedi apprendimento.json), ma la calibrazione
previsto-vs-reale resta ferma finché i sensori dati non tornano stabili.
