---
data: 2026-11-17 20:10
tipo: quaderno della regista
stima_usd: 110
tetto_usd: 130
---

# Onda 8: il quaderno della regista (i 200 difetti sono l'onda 9)

## In parole semplici
La tappa 1 dell'onda 8 ripara 40 difetti piccoli del sito, in 3 sessioni da 13-14. Sono le voci rimaste dall'onda 7, quelle a metà o con la correzione già scritta, e i difetti nati oggi. I 140 delicati (soldi, dati, permessi) partono giovedì 19/11 alle 10:00 come tappa 2.

## Cosa cambia per te
Niente finché la PR del sito non è pronta.

## Cosa devi fare
Niente: Nicola ha scelto «A tappe» alle 19:08.

## Cosa non ho verificato
Quante voci reggeranno: lo dicono il collaudo e il controllore.

---

## Dettagli tecnici

### Chi
- Regia: chat dell'AD `session_015BmpnWeHkst12TRwrzmMfw`. Integrazione sito `ccr-30918361-coyajm-o8` @ `1a7de5b9` (= testa della PR mycity#295, onde 6 e 7). Rami `ccr-30918361-coyajm-o8-mNN`.
- Decisione: DECISIONI 17/11 19:10 e bacheca 19:08. Limite visto da Nicola: 80-90%.

### Perimetro (`chiavi-tappa1.txt`, 42)
- 27 dalle onde 6-7: 12 rimandate dall'onda 7, 13 parziali/serve_file_altrui/rompe_altro dell'onda 7, R02-001 e R02-002 dell'onda 6.
- 15 nati dell'onda 7 (registro, fonte «nato dalla riparazione onda7»).
- Fuori, per la tappa 2 o una scelta: R01-007 e R04-011 (riservate), R01-008 e R02-002 dell'onda 7 (scelte di Nicola), R02-009 (ruoli all'iscrizione), 5 nati delicati o da decidere (prove con React 19, logger e dati personali, cliente che diventa fattorino, Google per i venditori, prezzo pieno nel carrello).
- `dividi --sessioni 3 --per-sessione 14`: R01 accessibilità 14, R02 flussi-conversione 13, R03 frontend-ux 13; 2 all'onda dopo. `copertura-prima` e `segnaposti` verdi.

### Il tetto
Atteso circa 110 $: riparatori 3 × 26 $, collaudo circa 15 $, controllore 6 $, regia 10 $. Cancello: sotto i 20 $ a chiuso. Prima di ogni apertura `rate_limit_info`.

### Stato
- 20:10 cartella pronta.
- 19:54 aperti R01 `session_015BmpnZ6qEcy4RimJZsZwsH`, R02 `session_015BmpnXoLzgfzuuuBdVvUAG`, R03 `session_015BmpnY8uEE9JYwMef9pGKS` (limite `allowed_warning`, regia 14,21 $). Regole nuove nel prompt: spesa letta prima di ogni lotto, oltre 20 $ niente lotti nuovi, prove esistenti altrui mai.
- 20:05 Nicola: i 200 difetti sono l'onda 9 (10 riparatori). Quest'onda 8 resta di 40 voci. Partenza dell'onda 9 letta: giovedì 19/11 alle 10:00.
- 20:58 R01 consegnato (`9e74f427`, testa `f52905f3`, 25,11 $): 11 riparati, 2 parziali (012, 008), 1 serve_file_altrui (011). `valida-referto` verde; `guardia-ramo` ROSSA su due prove esistenti della chat toccate per R01-001: deroga da chiedere a Nicola, il collaudo guarda se sono indebolite. Si apre K01 su R01.
- 21:06 R03 consegnato (`50f979b5`, testa `b7030c33`, 22,75 $): 8 riparati, 2 parziali (001, 004), 1 già riparato (008), 1 serve_file_altrui (006), 1 scelta di Nicola (003: scheletro del negozio o 404 vero). Guardia e referto verdi. Aggiunto a K01 `session_015BmpnUupLXTjHZjUohMe4U` (tetto 18 $). K01 dell'8b: `session_015BmpnW2ctg1tHAcy75QBH9`.
- 21:12 R02 consegnato (`973ffd41`, testa `974de28e`, 23,74 $): 8 riparati, 3 parziali con file altrui (007, 009, 012), 1 già riparato (013), 1 non_fatto (011: il commit `77997355` non regge e va tolto all'unione). Guardia e referto verdi. Aggiunto a K01 (tetto 22 $), con la domanda se `c32c6e8d` (R02-009) da solo rompe il conto del campanello.
- 21:15 K01: R02-009 rompe_altro (da solo, il pallino del pannello negozio conta 2 e il campanello del sito e la lista 3). All'unione si tolgono `c32c6e8d` (R02-009) e `77997355` (R02-011).
- 21:18 K01: R01-008 (zone del fattorino, `974093ba`) rompe_altro, da togliere all'unione; R01-013 parziale.
