---
tipo: quaderno-memoria
reparto: operations
---

# 🧠 Quaderno di operations
> Cosa ho imparato. Leggi all'inizio, aggiungi un ESITO alla fine di ogni lavoro.
> Formato: AAAA-MM-GG · contesto · cosa ha funzionato o no · numero · lezione · #tag

## Esiti
- 2026-07-18 11:06 · runbook prima consegna + zona/orario/ordine-minimo PQ · ✅ runbook consegnato ✅ parametri operativi definiti · atteso definire il runbook operativo per la prima consegna con PQ → reale runbook 🟢 in consegne/operations/, parametri zona/orario/ordine-minimo 🟡 accodati · #ops-18lug
- 2026-07-14 03:00 · chat VP 17/7 · Nicola: bici non pronta venerdì (corretto bollette 21-27/7, riparazione ~28/7+) → VP = presidio PQ + **ritiro al banco**, non domicilio; North Star+payout-test restano validi con ritiro; domicilio gated su bici · lezione L-218 · #vp17 #bici #ritiro-prima
- 2026-07-01 20:18 · giro AD · finestra slot **18:00–20:00 SCADUTA** — giornata a zero transazioni · ripiano **2/7 mattina** 🟢 + escalation v11 · lezione L-0701-40 · stallo 177,8h (+9,8h oltre 168h) · #operations #slot #zombie
- 2026-07-01 14:19 · giro AD · finestra pranzo **chiusa** → slot #16 **sera post-18** · escalation v8 🟢 · lezione L-36 slot vs orologio · Allerta ER 070/2026 temporali 15-17 · #operations #meteo #slot
- 2026-07-01 10:09 · casella ordine zombie €19,05 · Nicola «3ª volta che lo approvo» · causa: Approva proposta ≠ A/B; firme passate = batch/foglio-firma/Sprint 1 · serve «A» o «B» esplicito · lezione L-0701-29 · #operations #zombie #pannello #ux
- 2026-07-01 07:19 · casella ordine zombie €19,05 · Nicola chiede negozio buyer prima di A/B · risposta: **Pane Quotidiano**, tel. 348 642 1766 · lezione: card decisione ordine deve mostrare negozio+buyer in anteprima (L-0701-24) · #operations #zombie #pannello
- 2026-07-01 00:17 · giro temporali 1/7 · playbook operativo prodotto 🟢 · allerta 070/2026 ER · lezione: monitorare rider se consegne attive · #meteo #playbook
- 2026-07-01 00:58 · Priorità operativa spostata su **ordine zombie €19,05 — Pane Quotidiano** (buyer tel. 348 642 1766, PENDING dal 24/6) · pacchetto pronto in `consegne/operations/pacchetto-sblocco-ordine-zombie-19-05.md` · #operations #zombie
- 2026-07-01 · giro web · Last-mile 2026: i leader spostano KPI da «più veloce» a affidabilità+ETA trasparente — 73% shopper valuta arrivo puntuale più di spedizione economica (Bringg, outlook gen 2026) · https://www.bringg.com/resources/blog/top-3-2025-last-mile-trends-and-2026-outlook · lezione: misurare first-attempt accuracy e update proattivi, non solo minuti di consegna · #operations #last-mile #affidabilita

# ESITO — @operations — 2026-07-02 08:20
Giro 2/7: stallo 189,9h (+12,1h). Meteo sereno — finestra pranzo APERTA. Escalation v12 🟢. Mossa: ok 16 oggi pranzo WhatsApp 348 642 1766. #operations #zombie #meteo

# ESITO — @operations — 2026-07-06 14:10
2026-07-06 · Piano Piramide Fase 1 mossa 2 · Scritto Modello di consegna v1 (consegne/operations/2026-07-06-modello-consegna-v1.md): 4 opzioni con formule (0 costi reali esistenti — 0 consegne mai completate), raccomandazione A+D subito / B col negoziante / C rider a trigger >5 ordini-sett ×2 settimane · Lezione: il costo per consegna oggi NON è misurabile dal DB (mancano consegnato_da, picked_up_at, costo_consegna_cents) → ponte = registro manuale dalla #16 · #operations #modello-consegna #fase1
