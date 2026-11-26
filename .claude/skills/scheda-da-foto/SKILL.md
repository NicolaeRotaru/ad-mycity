---
name: scheda-da-foto
description: >-
  Aprila appena una sessione riceve la FOTO di un negozio, di un locale o di un'azienda (insegna, vetrina,
  ingresso, biglietto da visita), anche senza una parola, oppure quando Nicola chiede «fai la scheda del
  cliente», «scheda di questo negozio», «analizza questa attività», «preventivo per [nome]», «fammi il
  preventivo con piano editoriale e bozza del sito». Dalla foto la sessione legge chi è, cerca sul web
  indirizzo, telefono, sito, social e recensioni, e consegna due pagine: la SCHEDA per il venditore (cosa ha,
  cosa non ha, cosa va migliorato, potenziale, offerta, domande, obiezioni) e il PREVENTIVO per il cliente
  (punti forti e deboli, bozza del sito, piano editoriale del mese, abbonamenti). NON è l'iscrizione su
  MyCity (flusso 20, solo se Nicola la chiede), non scrive nel database e non manda niente al cliente.
---

# La scheda del cliente dalla foto

> **Da dove viene.** Nicola, 26/11/2026: «faccio la foto al negozio in cui entreremo … la mando a Claude, una
> nuova sessione, e in automatico deve crearsi la scheda del cliente e fare tutte le analisi … va a cercare i
> suoi social, la via, il numero … Nel preventivo ci deve essere già un piano editoriale, una bozza del sito
> seguendo gli standard, i punti deboli, forti, e tutto quello che possiamo offrire che oggi non ha».
> Prima prova: Ora del Gusto e La Ragazzetta, `consegne/clienti/2026-11-26-*`.

## Le due pagine, e a chi servono

| Pagina | Per chi | Cosa dice |
|---|---|---|
| `scheda.html` | il venditore, **interna** | in 30 secondi · il gancio per aprire · ha / non ha / da migliorare · i dati con stato e fonte · reputazione · sito e social di oggi · potenziale · offerta e perché · domande · obiezioni · attenzione · fonti |
| `preventivo.html` (+ `bozza-sito.html`) | il cliente | punti forti · dove perde clienti · oggi/con noi · bozza del sito nel telefono · piano editoriale del mese · le tre fasce · i primi 30 giorni |

Le pagine le scrive **sempre** il programma `cervello/scheda-cliente.mjs`: la sessione scrive solo `dati.json`.
Così due sessioni diverse consegnano la stessa forma, e i controlli non dipendono dalla memoria di chi scrive.

## I passi

1. **Leggi la foto.** Nome sull'insegna, tipo di attività, via e numero civico (targhe, cartelli), telefono,
   orari esposti, profili social o QR in vetrina, adesivi che dicono cosa c'è già (Satispay, TheFork, Glovo,
   Deliveroo, Just Eat, Sisal, tabacchi), com'è curata la vetrina. Quello che leggi davvero nella foto è
   `confermato` con `"fonte": "foto"` (nella scheda diventa «foto del venditore»). La foto non si salva nel
   repository: può avere persone o targhe. Se dalla foto non si legge il nome (sfocata, insegna coperta),
   chiedi a Nicola il nome e la via in una riga, e non cercare a caso.
2. **Guarda se c'è già.** `ls consegne/clienti/ consegne/schede/` e, in sola lettura, `profiles` del
   database del sito (`store_name ilike`). Se c'è già una scheda, riparti da quella invece di rifarla.
3. **Cerca sul web.** `WebSearch` in modalità `extended`, in parallelo: «nome città», «nome via», «nome
   instagram / facebook», «nome recensioni», la stampa locale (Libertà, Il Piacenza, PiacenzaSera, Piacenza
   Diario, Piacenza24, Zerocinque23), gli elenchi (Tripadvisor, Sluurpy, Wanderlog, Restaurant Guru,
   Gastroranking). Cerca anche gli **omonimi** e scrivili in «attenzione». Se la misura Google del sito è già
   nel database (`analisi_negozi.sito`), usala.
4. **Scrivi `dati.json`** in `consegne/clienti/AAAA-MM-GG-<nome>/`. Lo schema è quello dei due esempi del
   26/11: copia la forma, mai i contenuti. Ogni dato ha `stato` e `fonte`:
   - `confermato` solo se l'hai letto sulla pagina o sul profilo **dell'attività**, aperto davvero;
   - `da_confermare` se viene da un elenco, un giornale o un riassunto della ricerca;
   - `frammento` se è un indizio incerto o discorde (orari diversi tra elenchi);
   - `non_trovato` se non c'è: valore `null`, nessuna fonte. Meglio un buco dichiarato che un numero inventato.
5. **Scegli l'abbonamento** con le tabelle firmate: `agenzia.sito-solo-dove-vale-di-piu` e
   `agenzia.social-come-il-sito` nel registro dei fatti. Il piano editoriale ha **esattamente** i contenuti e i
   video della fascia consigliata (Base 8/0, Business 12/2, Premium 20/4): il programma lo controlla.
6. **Genera e controlla:** `node cervello/scheda-cliente.mjs consegne/clienti/<cartella>`. Deve stampare ✓.
   Se stampa ✗, correggi `dati.json`, mai il programma per farlo passare.
7. **Pubblica le due pagine** con lo strumento Artifact: `scheda.html` (icona `clipboard`) e `preventivo.html`
   con `files: {"bozza-sito.html": …}` (icona `document`). Sono private: le vede solo Nicola finché non le
   condivide.
8. **Lascia la traccia:** una riga in `LAVORO-APERTO.md` (sezione dell'agenzia), commit sul ramo della sessione
   e PR (regola `flusso.pr-sempre`).
9. **Rispondi a Nicola** col formato «Il punto adesso»: i due link, l'abbonamento consigliato, le 3 domande più
   importanti da fare al titolare, e «Cosa non ho verificato».

## I paletti

- 🟢 foto, ricerca, `dati.json`, pagine, pubblicazione privata. 🟡 iscrivere l'attività su MyCity (flusso 20):
  solo se Nicola lo chiede. 🔴 mandare qualunque cosa al cliente o al titolare: mai da qui.
- Mai scritture nel database. Mai dati personali del titolare o dei clienti (nomi, telefoni privati, email):
  solo i recapiti pubblici dell'attività.
- Nei contenuti proposti mai gioco (Sisal, scommesse) né tabacco: in Italia la pubblicità è vietata.
- Nella bozza del sito mai prezzi (stessa regola del sito, `lib/agenzia/bozza-sito-ad.ts`), e ogni testo è
  «da confermare dal titolare»: il nastro in cima lo dice.
- Prima dell'abbonamento solo fonti pubbliche e gratuite, guardate come le vede chiunque senza accesso. Le
  scelte di Nicola su questo valgono più di questa riga.
- La scheda per il venditore **non** è la scheda del cliente che riempie la vetrina MyCity: quella resta dopo
  l'abbonamento (`agenzia.analisi-e-scheda`).

## Il limite della rete (26/11/2026)

L'ambiente «Default» lascia passare solo n8n e i pacchetti: `WebFetch` e `curl` sulle pagine dei locali
rispondono 403. Il 26/11 Nicola non ha aperto la rete. Quindi, oggi, `WebSearch` funziona e le pagine no:
quasi tutto esce `da_confermare`, e social, scheda Google e recensioni si vedono solo nei riassunti. Se la rete
viene aperta, i passi 3 e 4 restano uguali: si aprono le pagine trovate e quello che si legge sull'attività
diventa `confermato`. Non chiedere di nuovo di aprire la rete nella stessa sessione se Nicola ha detto no.
