---
tipo: lavoro-aperto
fonte: AD digitale
aggiornato: 2026-10-30 01:29
regola: si legge PRIMA di cercare cosa manca; si aggiorna a ogni lavoro che si apre o si chiude
---

# Il lavoro aperto, tutto in una pagina

> **In due righe.** Qui c'è tutto quello che resta da fare, tuo e mio, con il posto dove sta il dettaglio. Una sessione nuova legge questa pagina prima di cercare altrove.

## In parole semplici

Prima il lavoro aperto stava sparso in tante liste: le carte, la tua lista, lo STATO, i piani del sito, i referti. Ogni sessione nuova doveva ricostruirlo, e costava molti token. Adesso il punto di partenza è uno solo. Le voci sono corte, e ognuna dice dove si trova il resto.

## Cosa cambia per te

- Chiedi «cosa resta da fare?» e la risposta parte da qui, senza una ricerca nuova. Esempio: stanotte la stessa domanda ha chiesto un controllo con dieci agenti; con questa pagina basta leggerla.
- Le cose che toccano a te stanno anche nella tua lista, che la Cabina ti mostra: `CHECKLIST-NICOLA.md`.

## Cosa devi fare

Niente di nuovo. Le tue voci sono nella sezione 1 e nella tua lista.

## Cosa non ho verificato

La pagina dice com'era il lavoro il 30 ottobre all'1:29. Ogni voce va riletta nel suo posto prima di agire.

---

## 1 · Cose che toccano a te

**Da unire**
- La richiesta di unione #899 della memoria: le chiusure della #263, il prezzo nuovo, i piani del sito, il resoconto dei costi. È verde.
- La richiesta #900, dell'altra sessione: il sito visto da chi compra, con dieci mosse. Si scontra con la #899 in due file: chi va per seconda va sistemata.

**Scelte brevi**
- Cosa vuol dire «senza difetti» per aprire al primo cliente. Il mio consiglio: zero bloccanti e zero gravi.
- Il rilascio controllato: subito prima delle chiavi di Vercel, o con un giro adesso.
- I 5 km: in linea d'aria o per strada.
- Le sei fasce orarie: le copri tutte tu, in bici?
- Il cliente assente: cosa fare se alla porta apre chi non ha il codice.
- La casa unica dei costi nel registro dei fatti: sì o no.
- Le quattro scelte della carta #222, che porta la richiesta #900.

**Cose da fare con le mani**
- Cambia il testo grande della home dal pannello dell'amministratore. Oggi dice «abbigliamento» e «arriva a casa in 30-60 min». Testo proposto: «Ordini dai negozi del tuo quartiere in pochi tap: ti portiamo la spesa a casa all'ora che scegli, e paghi alla consegna.»
- Guarda le ricevute di Claude, Vercel e Supabase. Claude Max 20x dal sito costa circa 218 euro; se paghi 260-280, forse è l'abbonamento dall'iPhone.
- Guarda quanto costa un bonifico sul tuo conto.
- Le chiavi del database insieme a me, 45 minuti: la cosa più urgente.

Tutti gli altri tuoi passi, 33 prima del primo ordine, sono in fila nella tua lista.

## 2 · Il mio lavoro sul sito

- **L'ondata 15 sta girando.** Il prezzo con più negozi, il ricalcolo quando un negozio rifiuta, le ultime frasi dei 30-60 minuti, le prove vecchie.
- **Poi l'ondata 16:** la conferma della veloce entro 10 minuti e l'email al negozio con la scadenza giusta.
- **Poi l'ondata 2:** il pannello, i resi, la vetrina e gli orari dei negozi.
- **Prima di accendere la carta**, quattro cose:
  - Non pagare due volte i contanti già pagati.
  - La data della fascia quando si paga dopo mezzanotte.
  - La promessa del bonifico «in un'ora».
  - Il permesso delle carte chiesto ai negozi.
- **Le dieci mosse della richiesta #900**, da confrontare col lavoro in corso. La revisione sta girando.

## 3 · La macchina

- Il server che la fa lavorare da sola è fermo; l'ultimo controllo di salute è del 1° settembre.
- Il 15 novembre all'01:00 scadono due date, e ogni controllo automatico diventa rosso. Lo sistemo entro il 14.
- Il voto su me stessa a ottobre è 0,09: chiudo prima di aprire ricerche nuove.
- La Cabina mostra cose vecchie: la Bacheca, gli obiettivi della squadra e il piano del mattino.

## 4 · Le mie promesse non mantenute

1. Il piano dell'ondata 2 rifatto e la proposta delle categorie.
2. Le tre preparazioni per le tue visite: Pane Quotidiano, commercialista, lista del fresco.
3. Le richieste al broker, al consulente del lavoro e al legale, pronte da mandare.
4. I costi per rendere privati i due repository.
5. La riparazione del freno della spesa del server.
6. Le vecchie password da togliere dai file del sito.
7. Il disegno dei messaggi WhatsApp per il negoziante.
8. La squadra più leggera per le ondate del sito.
9. La scadenza del dominio del sito.
10. Le 24 carte con il testo vecchio.
11. Il sì sulle sei schede del pannello dell'amministratore.

---

## Dettagli tecnici

- Tua lista, letta dalla Cabina: `MyCity-Vault/90-Memoria-AI/CHECKLIST-NICOLA.md`. Carte: `AZIONI-IN-ATTESA.md`. Decisioni: `DECISIONI.md`. Fatti: `registro-fatti.json` (prezzo: `consegna.promessa`, `logistica.compenso-fattorino`, `consegna.negozio-che-rifiuta`).
- Registro del sito: `auto-coscienza/radiografia-marketplace.json`, 1.821 voci. Prima della carta: 1810, 1797, 1811, 1812. Testo della home dal database: 1819.
- Piani delle ondate: `consegne/audit/2026-10-29-ondata13-prezzo-sito.json`, `2026-10-29-ondata14-prezzo-sito.json`, `2026-10-30-ondata15-prezzo-sito.json`; ondata 2: `2026-10-28-ondata2-sito.json` e `2026-10-28-ricette-ondata2.json`.
- Rami del sito: base dell'ondata 15 `fix/base-ondata-15` (`9d2bb05d`). Il ramo della fascia con la carta `fix/ondata-14-lib-ordini-fascia-leggibile-ts` non entra.
- Referti di ieri e stanotte: `consegne/finanza/2026-10-29-costi-e-commissioni.md`, `consegne/finanza/2026-10-29-prezzo-della-consegna.md`, `consegne/audit/2026-10-29-ondata1-giroB-sito-referto.md`; richiesta #900: `consegne/design/2026-10-29-esperienza-cliente-vs-migliori.md`.
- Pagina del carrello spiegato: https://claude.ai/artifact/R7a3oyeinPkPEc26fMEGqd
