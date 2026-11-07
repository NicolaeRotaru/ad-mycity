---
data: 2026-11-07 12:55
tipo: referto
fonte: palestra (copia del sito per le prove), carta 232
---

# La palestra, primo referto

## In parole semplici

La palestra è la copia del sito fatta solo per le prove, con dati finti. Lì gli specialisti usano il sito come clienti, negozi, fattorini e amministratori. Ogni difetto che trovano lo rifà da capo un verificatore diverso.

Un esempio vero. In palestra il giro intero del pane in contanti è riuscito: ordine, negozio, fattorino, versamento dei contanti. Però chi abita in Via Roma, Via Garibaldi o Via Cavour non riesce a ordinare. Il sito legge male l'indirizzo, lo mette a 10 km dal centro e risponde «troppo lontano». È l'unico difetto che blocca il lancio del 15/11.

## Cosa cambia per te

- Entrano nel registro **28 difetti nuovi**: 1 bloccante, 3 gravi e 24 minori. Tre sono falle riservate, con il solo titolo generico.
- **20 difetti già noti** ricevono la conferma della palestra. Due erano dati per chiusi e tornano aperti, perché la palestra li vede ancora.
- I difetti aperti passano da **696 a 726**: 6 bloccanti, 81 gravi e 639 minori.
- Il sito vero non è stato toccato. Ha sempre 1 ordine, 8 utenti e 22 email in coda, e dalla palestra non è partita nessuna email.

## Cosa devi fare

- Leggere in chat i dettagli delle tre falle riservate nuove, R311, R312 e R313.
- Far riparare per primo il difetto degli indirizzi: l'altra sessione l'ha già ricevuto.
- Unire questa richiesta quando l'hai guardata.

## Cosa non ho verificato

- Le prove fatte sono 114 su 533, più due giri interi a mano. Le altre 419 arrivano coi prossimi lotti: cliente, negozio, amministratore e fattorino. Le 28 prove con la carta aspettano gli avvisi di Stripe.
- La palestra è una copia: il difetto degli indirizzi l'ho rifatto solo lì. Il sito vero usa lo stesso codice e lo stesso servizio di mappe.
- Due difetti visti nel giro del pane non li ha rifatti nessuno: il tour di benvenuto che copre la casella dei Termini e un errore della pagina su tre schermate. Restano fuori dal registro.

## Dettagli tecnici

### Cosa ha fatto la palestra

| Lavoro | Cosa | Esito |
|---|---|---|
| Prova di fumo | il giro del pane in contanti, 4 ruoli | riuscito; 1 bloccante, 1 grave, 1 minore verificati |
| Prova generale | copia di Pane Quotidiano e primo ordine, 2 volte | riuscita; 2 gravi |
| Lotto 1 | 114 prove da estraneo e sul database | 60 passano, 52 falliscono, 1 non eseguibile, 1 bloccata |
| Verifica del lotto 1 | 1 verificatore per i minori, 2 per i gravi | 51 confermati, 1 scartato (comportamento voluto) |
| Costruzione | il database di prova ricostruito dalle migrazioni | 4 minori misurati |

### Dal confronto con il registro

61 difetti confermati (51 del lotto 1, 5 dei giri a mano, 4 della costruzione, 1 visto dal revisore di sicurezza) → 21 già nel registro, 13 doppioni fra loro, 28 nuovi. Il confronto l'hanno fatto 5 agenti contro le 2.907 voci, poi un revisore di sicurezza ha riletto le voci nuove: 6 testi oscurati, 2 difetti trasformati in falle riservate.

### I difetti nuovi più importanti

- **Bloccante — la cassa rifiuta vie del centro come «troppo lontane».** `lib/geocodifica.ts` e `app/api/geocode/route.ts` cercano su Nominatim a testo libero, con `limit=1` e senza confine sul comune: «Via Roma 10, 29121 Piacenza» torna a 44.9583, 9.6815. Verifica dell'AD: 3 indirizzi del centro su 10 fuori zona; dello specialista: 5 su 8.
- **Grave — un negozio già approvato non può scrivere IBAN e dati della ditta,** e il suo bonifico resta «in sospeso». Caso vero: Pane Quotidiano.
- **R312 e R313** — due falle riservate gravi, dettagli solo in chat.

### Riaperti e gravità riviste

- **2077** riaperto e da minore a grave: gli alimenti già in vendita senza allergeni non si salvano più nemmeno per il prezzo; il blocco ora è nel modulo del negozio.
- **1518** riaperto, da grave a minore: la pagina dei negozi arriva dopo 4-5 secondi su rete lenta.
- **377** da minore a grave: la pulizia dei documenti d'identità cade anche su un database costruito dalle migrazioni.

### File e lavori

- Registro: `MyCity-Vault/90-Memoria-AI/auto-coscienza/radiografia-marketplace.json`, da 2.907 a 2.935 voci. Grezzo: `consegne/audit/2026-11-06-radiografia-marketplace-raw.json`, da 183 a 211 voci, giro 5. Digest rifatto su una copia del deposito: 0 voci sparite, 20 voci vecchie cambiate solo nei campi della conferma, `confronto_precedente` rimesso al 5/11.
- Esiti per prova: `esiti-lotto-1.json` in questa cartella, senza i dettagli delle falle riservate.
- Lavori: fumo e smistamento `wf_b3370f8b-0c3`; lotto 1 `wf_4d902b34-f87`; prova generale `wf_6022fe4c-b89`; confronto col registro `wf_443039ef-5c5`.
