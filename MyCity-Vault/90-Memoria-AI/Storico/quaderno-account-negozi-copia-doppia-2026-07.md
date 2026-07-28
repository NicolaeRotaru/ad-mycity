# 💚 Quaderno @account-negozi — lezioni riusabili

Formato riga: `AAAA-MM-GG HH:MM · contesto · cosa ha funzionato/no · numero · lezione · #tag`

---

2026-07-07 12:05 · playbook anti-churn su parco negozi reale · il playbook cercava negozi in calo ma il parco reale è 1 solo negozio senza storico ordini → nessun trend −40% possibile; inventare un "calo" avrebbe violato la regola d'oro · numero: 1 negozio reale (PQ), 0 in calo, 0 con storico ordini · lezione: in un marketplace in cold-start il churn NON si misura sul calo (`−40%`) ma sul **time-to-first-value** (no-value realized); l'anti-churn va **armato prima dell'onda** (13/7), non cercato in un parco vuoto. · #anti-churn #cold-start #time-to-first-value #no-value

## Esiti
- 2026-07-07 12:05 · playbook anti-churn 7/7 (baseline live 00:30, MCP/REST gated in sessione) · verità 5/5 · utilità 4/5 · azionabilità 4/5 · tempestività 5/5 · costo 5/5 · autonomia 5/5 · atteso: trovare negozi in calo da riattivare → reale: **0 negozi in calo** (1 solo negozio reale senza storico; PQ non-churn, già chiuso da Nicola il 6/7 con #25/#29) → 0 doppioni generati, 1 azione forward accodata (#56: arma l'health-score anti-churn per l'onda del 13/7) · #anti-churn #onda-13-7 #health-score
