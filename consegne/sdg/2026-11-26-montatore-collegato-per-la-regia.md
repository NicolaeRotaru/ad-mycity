---
data: 2026-11-26 14:16
per: la regia «n8n workflow per MyCity» e la sessione «n8n in ordine»
da: la sessione del montatore e dell'officina di Scatti di G
---

# Il montatore usa l'AD: due difetti stanno nel «90»

> **In due righe:** il montatore ora chiede l'IA all'AD e regge al collaudo, ma resta spento finché gli allegati non sono in produzione.
> Due difetti trovati dal collaudo stanno nel «90 · Chiedi all'AD»: li decide la regia.

## In parole semplici
Il montatore di Scatti di G non chiama più l'API di Claude a pagamento.
I suoi cinque passi con l'IA passano da «90 · Chiedi all'AD», come vuole la regola di Nicola del 24/11.
Un controllore indipendente l'ha provato anche su un n8n vero (2.49.5) e dice che regge.
Ha trovato però due difetti che stanno nel «90», non nel montatore: quelli li decide la regia.

## Cosa cambia per te
- **Il montatore** si chiama «31 · Montatore». È caricato su n8n spento (aggiornato il 2026-11-26 alle 14:15) e nel ramo è snellito. Sessione «n8n in ordine»: il nome 31 e lo snellimento che avevi chiesto sono fatti.
- **Difetto 1, medio: i tetti di 40 corse al giorno e 25 all'ora si possono superare.**
  - Prova del controllore: 6 corse partite insieme, la routine parte 6 volte, ma `corse_oggi` sale di 1 e le partenze dell'ultima ora contate sono 1.
  - Esempio: alle 21:00 il team chiede un ritocco su Telegram mentre il montatore scrive un piano. Partono 2 corse, il conto ne segna 1. Così il tetto di 40 al giorno non ferma più al momento giusto.
  - Perché: il conto sta nella memoria statica del «90». Ogni esecuzione la legge all'inizio e la riscrive a fine corsa, dopo l'attesa di 15 minuti. Due corse insieme si cancellano il conto a vicenda.
  - Dal lato montatore l'ho attenuato: il guardiano fa partire un servizio alla volta, uno ogni 2 ore. Ma i ritocchi da Telegram e gli altri flussi possono ancora partire insieme.
  - Proposta: una riga per corsa in una Data table, scritta alla partenza e contata prima di partire. Così la finestra in cui due corse si sovrappongono scende da 15 minuti a pochi millisecondi.
- **Difetto 2, minore: una risposta in forma diversa fa fallire tutta la corsa.**
  - Succede quando la corsa porta più lavori insieme.
  - Il caso: l'AD risponde con una stringa JSON, o col JSON dentro i recinti ```json, invece di `{risultati:[…]}`.
  - Allora tutta la corsa dà «la risposta dell'AD non ha la lista dei risultati».
  - Proposta: se `risultato` è una stringa, togliere i recinti e leggerla come JSON prima di cercare `risultati`.
  - Il montatore, dal suo lato, accetta già il JSON nei recinti quando c'è un lavoro solo.

## Cosa devi fare
- **Allegati in produzione:** restano i passi della consegna del 25/11 (`consegne/sdg/2026-11-25-allegati-per-la-regia.md`). Sono: la Data table «Allegati per l'AD», il `--manda` di `allegati.mjs` e `costruisci.mjs`, accendere l'89, la regola nella routine e una prova vera.
- **Pubblica il «90» prima del «31».** n8n rifiuta di pubblicare un flusso che chiama un sotto-flusso non pubblicato. Il messaggio è «references workflow … which is not published».
- **Decidi sui due difetti del «90».** Il montatore resta spento finché gli allegati non sono in produzione.

## Cosa non ho verificato
- La routine vera dell'AD: come risponde davvero, e se apre gli allegati. Il controllore ha usato una routine finta.
- Il giro intero del montatore dentro n8n: sono stati provati i tratti «guarda il materiale» e «controlla i reel» con i nodi veri, non correzione e ritocco.
- La correzione dal lato montatore (un servizio alla volta) è in un secondo collaudo, ancora in corso mentre scrivo.

---
Dettagli tecnici
- Ramo `claude/affectionate-thompson-j841pj` di NicolaeRotaru/N8N: commit 661bd8f (collegamento all'AD, nome, snellimento) e il commit del collaudo del 26/11.
- Montatore su n8n: id `LRYfyQRHTLBAvW9c`. È spento e ha 158 nodi.
- I cinque nodi «Chiedi all'AD» puntano al «90» (`fRtCLoVmjbbWo9uB`). Nel repository l'id resta `DA_IMPOSTARE`: si genera con `CHIEDI_ID=… node montatore/genera.mjs`.
- Difetto 1: `flussi/chiedi-all-ad/codice/prepara-lavoro.js` righe 91-143 (memoria `corse_oggi`, `partenze`).
- Difetto 2: `flussi/chiedi-all-ad/codice/componi-risposta.js` riga 60.
- Corse per giro: da 2 a 4. Ogni ritocco ne usa 1, con al massimo 3 ritocchi per video.
- Il budget di 40 corse al giorno è condiviso da tutti i flussi.
