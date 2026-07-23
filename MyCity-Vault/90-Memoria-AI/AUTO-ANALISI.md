# 🔬 AUTO-ANALISI — 2026-07-23 11:35

## Voto di fiducia: **88/100** (▼ vs 92 del 20/7 20:22)

## Sintesi
Primo giro pieno dopo 3 giorni di sole sentinelle automatiche (21-23/7 nessun briefing prodotto). Business invariato: 1 PQ, 5 prodotti, 4 buyer, 0 pagati, stallo ~698h. Chiusi oggi i 3 vincoli macchina rimasti scaduti: CHECKLIST-NICOLA (AR-030), OKR-Squadra con target scaduto (AR-115), esperimento in scadenza EXP-004 + apertura EXP-013 (AR-041/106).

## Errori trovati
**Processuale, non di questo giro:** per 3 giorni la macchina non ha completato un giro pieno — solo bookkeeping automatico (sensori, sentinelle). La checklist di Nicola e l'OKR sono rimasti scaduti tutto questo tempo senza che nessuno se ne accorgesse fino all'arrivo di questo vincolo hard. Accodata card 🟡 #218 a devops-sre per la diagnosi.

## Domande per Nicola
1. **Ordine test PQ?** — ancora fermo, unica mossa diretta North Star 0→1 (#ordine-test-pq)
2. **PI26 inviata?** — 7 giorni residui (#bandi-cciaa-2007)
3. **Quale post pubblichi** tra i 3 pronti?
4. **Ok a far diagnosticare a devops-sre** perché i giri si sono interrotti per 3 giorni? (#218, sola lettura log)

## Salute macchina
- Sensori: 8/9 ok (Telegram assente, non è un guasto)
- Coerenza-fatti: non ri-verificata con lo script in questa sessione (nessun fatto-chiave noto è cambiato)
- MCP Supabase: cieco 7 giri (REST copre)
- **3 giorni senza giro pieno completato** — nuovo segnale, non c'era nei giri precedenti

## Entità verificate (registro-realta.json)
- Pane Quotidiano → confermato (invariato)
- 13 prospect onda-2 → scelta_ragionata (invariato)
- Pricing standard 10%+50€/m → confermato (registro-fatti, invariato)

## Perché il voto scende
Non per un errore nel lavoro di oggi, ma perché **onestà > compiacenza**: 3 giorni di buio sulla visibilità di Nicola sono un fatto reale della salute della macchina, e nasconderlo dietro un voto stabile sarebbe la bugia che l'auto-analisi esiste per impedire.

---

## Aggiornamento 11:36 — verifica live chiude il gap
Query dirette MCP Supabase in questa sessione hanno confermato tutti i 4 numeri del passaggio 11:35 (1 PQ, 4 buyer, 5 prodotti, 0 ordini pagati) e aggiunto un dato nuovo: **3 carrelli abbandonati reali su Pane Quotidiano**, mai convertiti nonostante l'email di recupero (giugno). Coerenza-fatti verificata con lo script (`node cervello/coerenza-fatti.mjs` → coerente, 5 cacce bonificate chiuse). MCP Supabase riconciliato a `ok`. **Voto fiducia sale a 91** (gap L1→L2 chiuso). Nessuna nuova azione da accodare: le mosse n.1/n.2 restano quelle già in coda.
