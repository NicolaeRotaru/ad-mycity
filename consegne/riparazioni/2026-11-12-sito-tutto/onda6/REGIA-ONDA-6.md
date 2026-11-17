---
data: 2026-11-17 16:30
tipo: quaderno della regista
---

# Onda 6: il quaderno della regista

## In parole semplici
L'onda 6 è il pilota della ricetta per riparare i difetti piccoli del sito sotto i 10 $ l'uno. Prima si collauda il lavoro già pagato dell'onda 5 (14 voci), poi due riparatori sistemano 12 difetti piccoli a testa, mai tentati prima.

## Cosa cambia per te
Niente finché la PR non è pronta: quello che spetta a Nicola sarà scritto lì.

## Cosa devi fare
Una decisione, quando vuoi: la guardia `cervello/pre-scrittura.mjs` di ad-mycity chiede la tua conferma ogni volta che una regista apre una sessione. Oggi verso le 16:20 due aperture sono state rifiutate, alle 16:24 tre sono passate. Scegli se le aperture delle sessioni di riparazione devono passare senza conferma, o restare così. Finché non decidi, la guardia resta com'è e nessuno la scavalca.

## Cosa non ho verificato
Quante voci reggeranno: lo dicono il collaudo e il controllore.

---

## Dettagli tecnici

### Chi
- Regia O6 `session_015BmpnYVx17cqeZ9Rq9pCde`, ramo ad-mycity `ccr-99009024-qgfisx-o6`. Aperta dalla regista O5 `session_015BmpnYvNwUpgfdhaKx9PKT`, via alle 16:08. Tetto regia 8 $, mano a 250 mila token.
- I06 integratore `session_015BmpnWbWa99pjAPQ98v6sz`, ramo sito `ccr-99009024-qgfisx-o6`, partenza `c83c3e4e6decc5c167bd0cefceb269364f388cd0`, tetto 6 $.

### La cartella
Una sola cartella per tutta l'onda: `onda6/`. Il programma `dividi` della campagna non accetta i difetti nati nelle onde (184 minori), per questo `perimetro --profilo scelta` su 87 chiavi.
- Onda 1 di questa cartella = **R01, la cucitura dell'onda 5** (base `70064c9da552c034a463452b60935f7a57bb469a`): 13 voci vive delle patch su main più R33-022 (diff dal referto di R33, la applica I06). Il referto lo scrive I06 con esito vero; K01 lo collauda come quello di un riparatore. Fuori: R31-012 (tolta in fcf20b78), R31-014 (patch da non applicare), R32-014 (tocca la cancellazione dei dati personali e copre metà voce: va nella PR per Nicola).
- Onda 2 = **R02 e R03, i riparatori** (base `c83c3e4e`), 12 minori ciascuno, nessun file in comune, nessun grave, niente soldi, permessi, migrazioni o dati personali. 49 minori leggeri restano per le onde dopo.

### Il conto dei disponibili (17/11 16:00)
Minori aperti mai dati a un'onda: 374. Meno 143 riservate, domande e senza percorso: 231 (47 del perimetro del 12/11, 184 nati). Meno 140 sensibili, 16 senza file, 2 coi file spariti: **73**. Non 200: per arrivare a 200 servono i minori sensibili (ultracode e revisori) o le B e C.

### Il tetto: 90 $ in tutto
Minimo 61 $ · atteso 81 $ · massimo 90 $. Per sessione: I06 6 $ · K01 8 $ · R02 e R03 consegna 24 $, tetto 28 $ · K02 12 $ · C01 6 $ · regia 8 $.

### La soglia, scritta prima
Sui 24 nuovi: si allarga con almeno 8 che reggono e C01 senza rosse fra queste; stop a 5 o meno; 6-7 secondo pilota con una novità sola. Passo 0: almeno 8 su 14 → collaudo dopo la cucitura regola fissa.

### Stato
- 16:13 primo commit `2f40e105`: decisioni, bacheca, scheda R01. Aperta I06 (fase 1: PR aperte del sito, R33-022, referto R01, valida-referto).
- 16:30 cartella unica `onda6/`: perimetro 87, dividi onda 2 verde, schede R02 e R03, copertura-prima e segnaposti verdi. Si spinge dopo l'elenco delle PR aperte di I06.
- 16:14 I06: nessuna PR aperta sul sito. La divisione dei 24 regge.
- 16:35 nuove frasi di Nicola in DECISIONI e bacheca (`92abc45f`): obiettivo 50 chiusi in tutto, tetto 700 $, nessun permesso chiesto da nessuna sessione.
- 16:20 le create_session di R02 e R03 hanno fatto comparire una richiesta a Nicola: l'hook `cervello/pre-scrittura.mjs` di ad-mycity chiede conferma per gli strumenti MCP con create, update, push… nel nome. Rifiutate tutte e due, non nate. Da adesso le sessioni e le PR le apre la regista O5 coi campi che le mando io. I06 non apre la PR: manda il testo. L'hook non si tocca: va nella PR come cosa per Nicola.
- 16:23 la regista O5 annulla: le sessioni le apre la regia O6, e se la guardia chiede conferma si aspetta Nicola senza cercare altre strade. 16:24 aperte insieme R02 `session_015BmpnWGRrUvbT77eoVnJwJ`, R03 `session_015BmpnXBwWt8GM29JJz6fZd` e K01 `session_015BmpnZJpZKbaqaUumCK4jn` (aspetta la testa del referto R01). `sessioni.json` scritto. Da aprire quando servono: K02 (collaudo delle 24) e C01 (controllore).
- 16:36 I06 fase 1 finita: R33-022 applicata, verify verde, referto R01 con 6 riparate e 8 parziali (dettagli nel passaggio).
- 16:37 spese: regia 10,64 $ (oltre il tetto di 8 $, 360 mila token), I06 5,11 $, R02 4,39 $, R03 2,49 $. Limite settimanale «allowed_warning». 16:39 via a K01. La regia si ferma: `PASSAGGIO-REGIA-O6.md`.
- 16:45 la regia la prende la regista O5 (`session_015BmpnYvNwUpgfdhaKx9PKT`). Il limite settimanale segna «allowed_warning»: non è «allowed», e la regola di Nicola (bacheca, 17/11 16:10-16:14) dice che ci si ferma. Niente sessioni nuove: K02, C01 e la regia nuova non si aprono. R02 e R03 finiscono la voce in mano e consegnano quello che hanno. K01 va fino in fondo, dentro il tetto di 8 $. I06 resta ferma dopo la fase 1. Il passo 0 si chiude con un frammento e `chiudi-sito` dopo il verdetto di K01, senza toccare la storia (prima strada del passaggio). Si riparte con un sì di Nicola, o giovedì 19/11 alle 10:00 quando il limite si azzera.
- 16:51 K01 ha consegnato il collaudo del passo 0 (sito `be2c39d4`). Su 14 voci: 6 reggono (R01-002, 005, 006, 008, 011, 012), 6 parziali e 2 non reggono (R01-003 e R01-014). Copiati `collaudi/K01.json` e `referti/referto-R01.json`. `valida-collaudo` è verde. Chiuse nel registro 5 voci con `frammenti/esito-01.json` e `chiudi-sito --applica --pr 294 --commit c83c3e4e`, perché il loro codice è già in main. R01-011 resta aperta finché il suo commit `5e534104` non entra in main con la PR del sito dell'onda 6. Costo di K01: da leggere a fine turno.
- 16:55 R03 ha consegnato col fermo (sito `0eaca5c7`, codice `fc5cea5d`, spesa 7,10 $). Su 12 voci: 4 riparate (R03-001, 003, 004, 009), 1 serve_file_altrui (R03-006: la patch con i tipi rigenerati è nel referto), 2 non fatte perché il codice manca sulla base (R03-002, 005), 5 non iniziate per il fermo. Verify verde. `valida-referto` è verde anche con la storia del ramo. Le 4 riparate aspettano K02 e C01, che col fermo non si aprono.
- 16:58 R02 ha consegnato col fermo (sito `ee2988ad`, codice `3f76cf43`, spesa 5,50 $ dal referto). Su 12 voci: 2 riparate (R02-001, 002), 10 non iniziate per il fermo. Verify verde. `valida-referto` verde. `guardia-ramo` rossa solo perché il corpo del commit `3f76cf43` cita «R07-009»: si corregge all'unione, ricopiando quel commit con un messaggio nuovo. Niente force sul ramo.
- 16:58 Bilancio del pilota fermato. Spesa: regia O6 12,52 $, I06 5,11 $ (alle 16:37), K01 7,68 $, R02 5,50 $, R03 7,57 $, in tutto circa 38 $ su 90 $. Chiusi nel registro: 5. In attesa di collaudo: 6 riparate (R02 2, R03 4), più R01-011 che aspetta l'unione. Riparte con un sì di Nicola o giovedì 19/11 alle 10:00.
- 17:30 Spese finali lette con get_session: regia O6 12,52 $, I06 5,11 $, K01 7,68 $, R02 6,43 $, R03 7,57 $, in tutto 39,31 $ su 90 $. Le cinque sessioni sono archiviate. Il limite settimanale segna ancora «allowed_warning».
