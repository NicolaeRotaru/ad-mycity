---
name: contenuti-cliente
description: >-
  BOZZA (27/11/2026). Aprila quando Nicola chiede di FARE i contenuti social di un'attività cliente — post,
  caroselli, storie, reel — in qualunque forma: «fai i contenuti di [cliente]», «la settimana di contenuti di
  [cliente]», «riempi il profilo di [cliente]», «storie e reel per [cliente]», «fallo come Canva / CapCut»,
  «tanti contenuti da subito». Produce i file veri, coi colori del marchio letti dal sito del cliente, e li mette
  nel Calendario «da approvare» con l'anteprima su Telegram. NON è la scheda o la proposta commerciale di
  un'attività nuova (quella è `scheda-da-foto`), NON pubblica niente da sola, NON è la campagna di MyCity
  (quella usa `creativi/impaginazioni`).
---

# Contenuti social di un cliente — la procedura veloce (bozza)

La procedura intera, coi comandi, sta nel deposito **NicolaeRotaru/N8N**, in `flussi/ad-studio/studio-canva/PROCEDURA.md`.
Leggila prima di cominciare: è scritta dal Tropico del 26-27/11, la prima volta che si è fatto.

## I cinque passi, in breve
1. **Il file del cliente** (10 min): i colori si prendono dal foglio di stile del sito con `node marchio.mjs`, mai a occhio. Poi si riempie `clienti/<id>.json`: colori, caratteri, logo, indirizzo, telefono, fatti verificati.
2. **Il materiale** (10 min): `bash prepara.sh <id> <cartella>`; foto originali e logo si scaricano col flusso «AD · Leggi materiale (anteprime)». La sessione deve stare sull'ambiente «SDG».
3. **Il piano** (20-30 min, l'unico passo di giudizio): una idea per pezzo, storie animate, solo fatti veri, orari liberi del Calendario.
4. **Montaggio e controllo** (15 min): `node rendi.mjs`, `python3 consegna.py comprimi`, un solo provino di tutto, mandato a Nicola.
5. **Consegna** (20 min): cartella Drive nuova, `consegna.py` a lotti, «AD · Proponi nel Calendario» per ogni pezzo, sette alla volta. Poi la memoria in una PR.

## Le regole che non si saltano
- **I colori del marchio sono quelli che il sito USA di più**, non quelli più grandi nel logo. Il logo non si tocca. (Nicola, 27/11: «il rosa non è il colore del marchio».)
- **Mai inventare**: niente prezzi nelle grafiche, niente nomi di piatti non confermati, niente «unico» o «il migliore» senza prova. Nei giorni di chiusura, niente «stasera».
- **Niente si elimina**: le versioni superate si archiviano. (Nicola, 26/11.)
- **Esce solo quello che Nicola approva** su Telegram. La sessione non pubblica e non cambia lo stato delle righe.
- Prima di occupare orari nel Calendario, si avvisa la sessione che pubblica i contenuti di quel cliente, se c'è.
- Una domanda a Nicola solo se manca un fatto: un orario, un giorno di chiusura, un nome.
