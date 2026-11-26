---
name: scheda-da-foto
description: >-
  Aprila appena una sessione riceve la FOTO di un negozio, di un locale o di un'azienda (insegna, vetrina,
  ingresso, biglietto da visita), anche senza una parola, oppure il solo NOME di un'attività con «fai la
  scheda», «scheda di questo negozio», «analizza questa attività», «proposta per [nome]», «preventivo per
  [nome]». Due momenti. ① La PROPOSTA, subito: la sessione legge chi è, cerca sul web indirizzo, telefono,
  sito, social e recensioni, e consegna la SCHEDA per il venditore (cosa ha, cosa non ha, cosa va
  migliorato, potenziale, offerta, domande, obiezioni) e la PROPOSTA per l'azienda (punti forti e deboli,
  bozza del sito, piano editoriale del mese, cosa cambia con ogni abbonamento, prezzi, come si paga).
  ② Il PREVENTIVO, solo quando Nicola scrive che il TITOLARE ha detto sì («ha detto sì», «vuole aderire»,
  «ha accettato»): la sessione iscrive l'attività col flusso 20 di n8n e nasce il link col preventivo, che il
  titolare accetta; paga in contanti. «Preventivo per [nome]» da solo non basta: fa il primo momento e chiede
  se il titolare ha già detto sì. Non manda mai niente al cliente.
---

# La scheda del cliente dalla foto

> **Da dove viene.** Nicola, 26/11/2026: «faccio la foto al negozio in cui entreremo … la mando a Claude, una
> nuova sessione, e in automatico deve crearsi la scheda del cliente e fare tutte le analisi … va a cercare i
> suoi social, la via, il numero … Nel preventivo ci deve essere già un piano editoriale, una bozza del sito
> seguendo gli standard, i punti deboli, forti, e tutto quello che possiamo offrire che oggi non ha».
> Prima prova: Ora del Gusto e La Ragazzetta, `consegne/clienti/2026-11-26-*`.

> **I due momenti (Nicola, 26/11/2026, pomeriggio).** «Prima del preventivo si farà la proposta … il
> preventivo lo si crea solo quando si ha l'ok dall'imprenditore che dice sì, voglio aderire … gli daremo
> tramite link, e lui basterà accettare». «Nella proposta si vedono i prezzi», «bisogna spiegare la
> personalizzazione del prodotto in base all'abbonamento», «paga con i contanti per il momento».
> Per esempio: lunedì il venditore fotografa un bar, pochi minuti dopo ha scheda e proposta; giovedì il
> titolare dice sì, Nicola lo scrive in chat, e la sessione fa nascere il link del preventivo.

## Le pagine del primo momento, e a chi servono

| Pagina | Per chi | Cosa dice |
|---|---|---|
| `scheda.html` | il venditore, **interna** | in 30 secondi · il gancio per aprire · ha / non ha / da migliorare · i dati con stato e fonte · reputazione · sito e social di oggi · potenziale · offerta e perché · domande · obiezioni · attenzione · fonti |
| `proposta.html` (+ `bozza-sito.html`) | l'azienda | punti forti · dove perde clienti · oggi/con noi · bozza del sito nel telefono · piano editoriale del mese · **cosa cambia con ogni abbonamento** · le tre fasce coi prezzi · **come si paga** · i primi 30 giorni |

Nella proposta **non** c'è nessun pulsante per accettare o pagare: si accetta solo dal link del preventivo,
che nasce nel secondo momento. Le cartelle fatte prima del pomeriggio del 26/11 avevano `preventivo.html`:
era la stessa pagina, oggi si chiama `proposta.html`.

Le pagine le scrive **sempre** il programma `cervello/scheda-cliente.mjs`: la sessione scrive solo `dati.json`.
Così due sessioni diverse consegnano la stessa forma, e i controlli non dipendono dalla memoria di chi scrive.

## Primo momento: la proposta

1. **Leggi la foto, o parti dal nome.** Se arriva solo il nome, chiedi la città in una riga se non è
   Piacenza, e salta al passo 2. Nome sull'insegna, tipo di attività, via e numero civico (targhe, cartelli), telefono,
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
   26/11: copia la forma, mai i contenuti. I testi per il cliente stanno nel blocco `proposta`. Ogni dato
   ha `stato` e `fonte`:
   - `confermato` solo se l'hai letto sulla pagina o sul profilo **dell'attività**, aperto davvero;
   - `da_confermare` se viene da un elenco, un giornale o un riassunto della ricerca;
   - `frammento` se è un indizio incerto o discorde (orari diversi tra elenchi);
   - `non_trovato` se non c'è: valore `null`, nessuna fonte. Meglio un buco dichiarato che un numero inventato.
5. **Scegli l'abbonamento** con le tabelle firmate: `agenzia.sito-solo-dove-vale-di-piu` e
   `agenzia.social-come-il-sito` nel registro dei fatti. Il piano editoriale ha **esattamente** i contenuti e i
   video della fascia consigliata (Base 8/0, Business 12/2, Premium 20/4): il programma lo controlla.
   **La personalizzazione:** in `proposta.su_misura` scrivi una frase per OGNI abbonamento (`base`,
   `business`, `premium`) che dice cosa riceve in pratica *questo* cliente: il suo sito, i suoi temi, le sue
   foto. Tre frasi diverse, solo promesse che la fascia mantiene davvero (guarda `FASCE` nel programma). Il
   programma le mette in colonna accanto a sito, piano, foto e analisi di ogni fascia. Ferma la proposta se
   ne manca una, se due sono uguali, se una fascia promette quello che non dà (video o «più pagine» nel Base,
   storie o referente nel Business) o se i numeri di contenuti e video non sono quelli della fascia.
6. **Genera e controlla:** `node cervello/scheda-cliente.mjs consegne/clienti/<cartella>`. Deve stampare ✓.
   Se stampa ✗, correggi `dati.json`, mai il programma per farlo passare. Come si paga lo legge dal registro
   dei fatti (`sdg.pagamento`): non scriverlo a mano.
7. **Pubblica le due pagine** con lo strumento Artifact: `scheda.html` (icona `clipboard`) e `proposta.html`
   con `files: {"bozza-sito.html": …}` (icona `document`). Sono private: le vede solo Nicola finché non le
   condivide.
8. **Lascia la traccia:** una riga in `LAVORO-APERTO.md` (sezione dell'agenzia), commit sul ramo della sessione
   e PR (regola `flusso.pr-sempre`).
9. **Rispondi a Nicola** col formato «Il punto adesso»: i due link, l'abbonamento consigliato, le 3 domande più
   importanti da fare al titolare, e «Cosa non ho verificato». Ricordagli che il preventivo nasce quando lui
   ti scrive che il titolare ha detto sì.

## Secondo momento: il preventivo, solo dopo il sì

Parte **solo** quando Nicola scrive che il titolare ha detto sì. Mai prima, nemmeno «per avere il link pronto»:
iscrivere l'attività scrive sul database vero (🟡), e il sì di Nicola è la firma. Fino al 26/11 Nicola chiamava
«preventivo» anche la proposta: se scrive «fai il preventivo a [nome]» senza dire che il titolare ha accettato,
fai il primo momento e chiedi in una riga: «Il titolare ha già detto sì? Se sì, faccio nascere il link».

1. **Ritrova la cartella** del cliente in `consegne/clienti/`. Se non c'è, prima si fa il primo momento.
2. **Prendi i dati per l'iscrizione:** `node cervello/scheda-cliente.mjs consegne/clienti/<cartella> --iscrizione`.
   Stampa solo dati pubblici dell'attività: nome, città, tipo, l'indirizzo se trovato, il sito solo se è uno,
   confermato e letto sul sito stesso. Si ferma se trova un numero di telefono o un'email nei testi, e se la
   proposta non passa i controlli (prima si sistema quella).
3. **Iscrivi l'attività col flusso 20 di n8n** («20 · Iscrivi il cliente in MyCity», `s5vKU6Ml8PUjwn29`). Si
   avvia solo da un altro flusso: come il 25/11 per La Ragazzetta, crea un lanciatore una tantum che lo chiama
   con quei dati, avvialo **una volta** e archivialo subito (DECISIONI, 25/11 16:17). Il sito crea il negozio
   nascosto, senza accesso, e il **link col preventivo**; Nicola riceve l'avviso su Telegram. Se l'attività
   c'è già, MyCity risponde «era già in MyCity» e non fa doppioni.
4. **Il link lo manda Nicola**, da Admin → Preventivi col link. Se col titolare si è già scelto l'abbonamento,
   il link giusto è `…/preventivo/<codice>/abbonamento?fascia=<base|business|premium>`. Il titolare lo apre,
   lascia la sua email e preme «Accetto il preventivo». **Paga in contanti, di persona** (`sdg.pagamento`): sul
   sito il pagamento online è spento (`lib/agenzia/pagamento-servizi.ts`, repo del sito).
5. **Lascia la traccia:** in `dati.json` aggiungi `"adesione": {"data": "AAAA-MM-GG HH:MM", "fascia": "…"}`,
   una riga in `DECISIONI.md` (🟡, iscrizione chiesta da Nicola) e in `LAVORO-APERTO.md`.

## I paletti

- 🟢 foto, ricerca, `dati.json`, pagine, pubblicazione privata. 🟡 iscrivere l'attività su MyCity (flusso 20):
  solo dopo che Nicola scrive che il titolare ha detto sì. 🔴 mandare qualunque cosa al cliente o al titolare:
  mai da qui.
- Mai scritture nel database. Mai dati personali del titolare o dei clienti (nomi, telefoni privati, email):
  solo i recapiti pubblici dell'attività.
- Nei contenuti proposti mai gioco (Sisal, scommesse) né tabacco: in Italia la pubblicità è vietata.
- Nella proposta il 10% sui prodotti venduti tramite MyCity resta anche con l'abbonamento (`pricing.commissione`, 26/11): mai scrivere «nessuna percentuale». Sulle vendite al banco non si prende niente.
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
