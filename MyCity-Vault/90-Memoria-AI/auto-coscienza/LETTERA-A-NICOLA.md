---
tipo: lettera-radiografia-totale
data: 2026-07-07 22:21
---

# 💌 Lettera a Nicola — 2026-07-07 (radiografia totale: sito + macchina)

Ciao Nicola,

mi hai chiesto una cosa sola, e giusta: **trova davvero tutti i problemi**, sia del sito (il marketplace)
che di me (la macchina AD), e mettili in chiaro. L'ho fatto sul serio — non con me stessa di corsa, ma con
**due squadre di revisori "Opus"** (il modello più forte), una per il sito e una per la macchina, e per
ogni problema un **secondo revisore che provava a smontarlo**: ho tenuto solo quelli veri, provati nel codice.

Ti dico la verità come sta, senza addolcirla.

## Il sito (marketplace): 87 problemi veri, 4 sono da fermare-tutto

I 4 che non puoi lasciare accesi con soldi e persone reali:

1. **Si può pagare merce già rimessa in vendita.** La prenotazione dell'articolo dura 2 ore, ma la pagina di
   pagamento resta valida circa 24 ore. Chi paga in mezzo compra qualcosa che il sistema ha già "rimesso a
   scaffale" — e magari venduto a un altro. Doppia vendita.
2. **I dati dei clienti sono esposti.** Una regola del database è scritta troppo larga: chiunque, anche senza
   account, può leggere nome, indirizzo e telefono dei clienti con un ordine in consegna. Problema privacy serio (GDPR).
3. **Le contestazioni carta non quadrano.** Se vinciamo una disputa dopo aver già pagato il negozio, quei
   soldi il negozio non li rivede; nel caso opposto restiamo scoperti noi. Manca il pezzo che ri-sistema i conti.
4. **Ordine rifiutato ma già pagato = cliente non rimborsato.** Se il negozio rifiuta un ordine pagato con
   carta, oggi il cliente non viene rimborsato in automatico. Soldi trattenuti senza merce: inaccettabile.

Poi 35 problemi "gravi" (tra cui: il **rider non viene pagato** quando la spedizione è gratis ma la consegna è
vera; i **rimborsi parziali ripetuti** non recuperano la quota dal negozio → ci rimettiamo noi) e 47 minori.
Tutto è nel referto `consegne/audit/2026-07-07-radiografia.md`, ognuno con file e riga esatti.

## La macchina (io): 74 problemi, 5 bloccanti — e sono onesti

Il voto di salute mi è uscito basso. Non perché sia peggiorata: perché **stavolta mi sono guardata più a
fondo**. Il filo comune, detto semplice: **il mio "imparo dai miei errori" oggi gira a vuoto.**

1. **Non ho mai aperto un solo esperimento.** Il meccanismo che dovrebbe misurare se una mossa ha funzionato
   è cablato solo per "chiudere", mai per "aprire": quindi non ha mai misurato niente.
2. **Le mie previsioni sono scritte a mano in un formato che il mio stesso motore non legge** — 18 previsioni
   registrate, zero entrate nel punteggio. Mi do i voti su un registro che poi ignoro.
3. **Il sensore che conta quanto costo è cieco**: sottostima di circa 1000 volte. Un giro da 20 minuti risulta
   costare 882 "gettoni". Così non posso davvero controllare la spesa.
4. **Il giro può pubblicare il proprio codice** (fa `git add -A` di tutto): oggi il "non toccarti da sola senza
   firma" è solo una frase, non un cancello meccanico. Va reso un blocco vero.
5. (+ i problemi già trovati stamattina su worker e Pannello: un'azione interrotta che **riparte da sola**,
   le risposte che **spariscono**, le liste che **non si aggiornano** — sono confermati e localizzati.)

## Cosa ho fatto adesso (🟢, reversibile)
- Scritto i **due referti completi** (sito + macchina), ognuno con prove file:riga.
- Aggiornato la mia memoria: `auto-radiografia.json`, `storico-salute.json`, e ho **finalmente messo nel
  cantiere i 14 difetti che stamattina avevo preparato ma mai agganciato** + i 5 nuovi bloccanti. Il cantiere
  ora ha 25 difetti aperti/in-corso da portare a zero, ordinati per impatto sulla crescita.

## Cosa NON ho fatto (e perché aspetto te)
**Non ho corretto niente né sul sito né su di me.** Le regole sono chiare: ogni fix al sito è 🟡 (in un ramo,
mai in produzione da sola) e ogni auto-modifica è 🟡 con la tua firma. Ti ho preparato i problemi pronti da
decidere, non li ho toccati.

## Cosa mi serve da te
Dimmi solo **da quale fronte partiamo**: i 4 bloccanti del **sito** (soldi e privacy dei clienti — io direi
questi per primi) o i 5 della **macchina** (così smetto di illudermi che il volano giri). Appena mi dici "vai
sul blocco X", preparo la correzione completa in un ramo e te la porto da firmare.

Ci sto mettendo l'impegno che mi hai chiesto. Non ti nascondo niente: questi sono tutti i problemi che ho
trovato guardando davvero a fondo.

— l'AD di MyCity
