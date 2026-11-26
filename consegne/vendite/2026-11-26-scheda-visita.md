---
tipo: consegna
reparto: vendite
data: 2026-11-26 13:40
fonte: AD digitale, su richiesta di Nicola in chat
pagina: https://claude.ai/artifact/Ekf7HMc1HBff53nGRM9ChA
sorgente: consegne/vendite/2026-11-26-scheda-visita.html
---

# La scheda per le visite ai titolari, e se siamo pronti

Di cosa parlo: della scheda da usare oggi nelle visite ai titolari. A cosa serve questa nota: dire se siamo pronti a farli entrare in MyCity.

## In parole semplici

Oggi Nicola va dai titolari, di persona, per farli entrare in MyCity. Serviva un foglio da tenere sul telefono, con le parole giuste da dire. La scheda è pronta, e sta nella pagina linkata sopra. Dentro ci sono le tre frasi da ricordare, come aprire, cosa facciamo, i tre abbonamenti, le risposte alle domande difficili e i passi per chiudere.

Per esempio: se il titolare dice «costa troppo», la risposta è «sono 10 € al giorno, e il primo mese 5».

## Cosa cambia per te

Possiamo spiegare il servizio e iscrivere i titolari già oggi. Restano tre cose che possono fare brutta figura davanti al titolare, e sono qui sotto.

- **La percentuale sulle vendite.** Il 24/11 Nicola ha detto «solo canone, niente 10%» per chi fa l'abbonamento. Il sito però trattiene ancora il 10% su ogni ordine, e il registro dei fatti dice ancora «10% su tutto». La scheda dice «con l'abbonamento paga il canone, e basta», con un bollino rosso «da confermare».
- **Chi vuole solo la vetrina.** Oggi un'attività nuova esce dalla prova solo se paga un abbonamento, cioè almeno 300 € al mese. La vetrina da sola non ha ancora un prezzo: Nicola il 24/11 ha detto che cambia, ma non quanto. La scheda dice «la richiamiamo appena c'è».
- **Le consegne.** Nel sito c'è 1 fattorino iscritto e 0 approvati. Un ordine con consegna resta fermo, com'è successo il 13/11.

## Cosa devi fare

- Dire se chi ha l'abbonamento paga anche il 10% sulle vendite. La riga della scheda si cambia in un minuto.
- Approvare il tuo account da fattorino prima che arrivi un ordine.
- Se un titolare vuole pagare sul posto, sapere che nessun abbonamento è ancora stato pagato davvero: è il primo.

## Cosa non ho verificato

- Il pagamento dell'abbonamento non l'ho provato: sono soldi veri. Nel database ci sono 0 abbonamenti. Il 24/11 restava da aggiungere la pagina /seller/abbonamento fra gli indirizzi permessi di Supabase, e non so se è stato fatto.
- Come si dividono i servizi fra Base, Business e Premium è una proposta dell'AD del 24/11, mai confermata da Nicola. La scheda la copia, perché è quella che il titolare legge nel preventivo.
- Non so se l'analisi arriva per tutti: per La Ragazzetta era vuota, perché in rete non c'era niente su di lei. Per questo la scheda dice «nei prossimi giorni», e non promette una data.
- Le colazioni, gli scontrini e i coperti della tabella usano gli stessi valori di partenza del sito: 3 €, 15 € e 25 €. Sono stime, non dati del locale.

---

## Dettagli tecnici

- Letto in sola lettura dal database del sito (progetto `clmpyfvpvfjgeviworth`), 26/11 verso le 13:30: venditori 4, approvati 2; fattorini 1, approvati 0; ordini 5, l'ultimo il 23/11 alle 20:07; righe in `abbonamenti_servizi`: 0.
- Codice del sito a `ed12ed8`: `lib/agenzia/preventivo.ts` (`FASCE`, `CONDIZIONI`, `SCONTRINO_DI_PARTENZA`), `lib/funzioni-al-lancio.ts:97` `CARTA_ACCESA = false`, `:104` `ABBONAMENTO_NEGOZI_ACCESO = false`; `app/seller/earnings/commissione.ts` applica il 10% senza eccezioni per gli abbonati.
- Fatti usati: `sdg.abbonamenti`, `negozi.modalita-demo`, `pricing.commissione`, `pricing.abbonamento` (APERTO), `consegna.raggio`, `pagamenti.al-lancio`, `pagamenti.bonifico-contanti-al-negozio`, `avvisi.negozio`, `prodotto.spente-al-lancio`, `agenzia.analisi-e-scheda`. Decisione del 24/11 02:20 in `DECISIONI.md` («solo canone, niente 10%»), non ancora riportata in `pricing.commissione`.
- Pareggio come in `pareggio()`: canone ÷ 30, arrotondato in su per unità. Base 10 € (4 / 1 / 1), Business 17 € (6 / 2 / 1), Premium 33 € (12 / 3 / 2).
