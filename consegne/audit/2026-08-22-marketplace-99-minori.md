---
data: 2026-08-22 14:10
tipo: riparazioni-marketplace
referto_di_partenza: consegne/audit/2026-08-21-radiografia.md
lotto_precedente: consegne/audit/2026-08-22-marketplace-100-riparazioni.md
selezionati: 99
gia_a_posto: 2
riparati: 97
ramo: claude/marketplace-100-difetti-c62gmv (repo NicolaeRotaru/mycity)
---

# Anche i novantanove minori sono chiusi, e dentro ce n'era uno che minore non era

**In due righe.** Restavano novantanove difetti piccoli. Li ho chiusi tutti.
Uno però non era piccolo: **la copia di sicurezza del database non partiva
più**, e non lo sapeva nessuno. Ti servono **due cose**, scritte in fondo.

## In parole semplici

Ecco il conto della radiografia del 21 agosto, dall'inizio a oggi.

| | 21 agosto | stamattina | adesso |
|---|---:|---:|---:|
| Bloccanti | 12 | 0 | **0** |
| Gravi | 88 | 0 | **0** |
| Minori | 99 | 99 | **0** |
| **Aperti in tutto** | **199** | **99** | **0** |

Due dei novantanove erano già stati chiusi dal lavoro sui cento difetti grossi,
finito il 22 agosto alle 9:20 e raccontato nel referto
`2026-08-22-marketplace-100-riparazioni.md`. Li ho aperti nel codice per
controllare, uno per uno, invece di ricontarli come lavoro nuovo.

## La cosa più importante: la copia notturna era rotta

Ogni notte alle 02:17 parte un lavoro che fa una copia di tutto il database e
la mette al sicuro, cifrata. È la rete che sta sotto a tutto il resto: se un
giorno succede qualcosa ai dati, è da lì che si riparte.

Non partiva.

Il programma che fa la copia si chiama `pg_dump`, e ha una regola sua: se il
database è più recente di lui, si ferma e non copia niente. Il lavoro notturno
installava «qualunque versione ci sia nel computer di turno», che oggi è la
sedici. Ho controllato il database vero con lo strumento di Supabase: gira la
diciassette.

Quindi la copia falliva. E falliva di notte, dove non guarda nessuno.

Adesso la versione è scritta dentro il lavoro, ed è la stessa del database. In
più c'è un controllo che ferma tutto se il programma installato non è quello
giusto: quando Supabase aggiornerà ancora, il lavoro diventerà rosso con un
messaggio che si capisce, invece che con un errore di versione in fondo a un
registro che nessuno apre.

**Il primo vero collaudo è la notte prossima.** Da qui ho verificato che il
numero adesso è quello giusto, non che la copia riesca.

## Cosa cambia per te

**Nella chat del prodotto arrivava il diario di bordo invece della risposta.**
L'assistente produce due testi: quello che scrive mentre lavora («cerco sul
web», «ho trovato tre schede simili») e la risposta vera. Vinceva sempre il
primo. E siccome la ricerca sul web fa fino a cinque giri, il primo c'era quasi
sempre. Il negoziante leggeva i pensieri della macchina invece del risultato.

**Quello che la gente scrive nella casella di ricerca partiva così com'era.**
Nella ricerca non si scrive solo «pane»: si scrive il proprio indirizzo email,
il numero d'ordine, un numero di telefono. Quel testo andava dritto nel sistema
di analisi, che sta negli Stati Uniti. La pulizia esisteva già in quello stesso
file. Era stata scritta per i messaggi d'errore. Alla ricerca non era mai stata
applicata.

**Due tabelle tue mostravano numeri che sembravano veri.** La tabella delle
coorti dice quanti clienti iscritti a luglio hanno ricomprato ad agosto. Per il
mese in corso mostrava «0%», che si legge «non è tornato nessuno». La verità
era «il mese non è ancora finito». Adesso lì c'è un trattino. Nella stessa pagina due etichette diverse mostravano lo stesso identico numero.
Si chiamano «Acquisto singolo» e «A rischio churn». Credevi di guardare due
misure e ne guardavi una.

**Il freno anti-abuso scattava dopo il controllo del login, non prima.** Un
esempio: qualcuno bussa mille volte al minuto con un badge finto. Il sito
andava a chiedere al database chi fosse, mille volte, e solo dopo dava mille
rifiuti. Adesso il freno sta davanti: trecento chiamate al minuto per
indirizzo, e la milleunesima non arriva nemmeno al database.

**Un rimborso si scriveva in sei pezzi.** Quando il pagamento diceva che un
ordine era stato rimborsato per intero, il sito scriveva la stessa riga sei
volte di fila. Se qualcosa si interrompeva alla terza, l'ordine restava a metà:
rimborsato al cliente, non annullato da noi.

## Come l'ho provato

Ogni difetto ha un controllo che diventa rosso se il difetto torna. In tutto:
**1136 prove unitarie verdi**, 17 file di prova sul database verdi, controllo
dei tipi pulito, nessun errore di lint.

Otto di quei controlli li ho verificati **al contrario**: ho rimesso il difetto
e ho guardato la prova diventare rossa, poi ho rimesso il codice com'era. Sono
questi:

- Tolta la riga di sicurezza dai quattro prompt del lavoro massivo. Rossi.
- Rimessi i controlli di conformità in fila indiana. Il controllo che conta
  quanti ne partono insieme è passato da dodici a uno.
- Fatto scrivere il lavoro massivo senza chiedere al filtro. Due rossi.
- Rimesso il numero di versione sbagliato nel lavoro notturno. Rosso.
- Fatta ripartire la ricerca senza pulizia. Rosso.
- Rimesso il freno dopo il riconoscimento. Rosso.

## Cosa non ho verificato

**Niente di tutto questo l'ho visto girare in produzione.** Ho un database di
prova qui in locale, e basta.

**Non ho mai parlato con l'AI vera:** in tutte le prove il modello è finto.

**Le pagine non le ho viste a schermo:** ho letto il codice. Vale per le
tabelle dell'amministratore e per tutto il resto dell'interfaccia.

**La copia notturna non l'ho vista riuscire.** So che la versione adesso è
quella giusta. Il resto lo dirà stanotte.

**Il filtro dei prodotti vietati non copre tutto, e va detto chiaro.** L'ho
aggiunto anche sul lavoro massivo, dove mancava. Ma il negoziante modifica i
propri prodotti anche dal browser, scrivendo dritto sul database, e quella
strada non passa da nessun filtro. Ho chiuso una scorciatoia, non la porta
grande: quella è una decisione da prendere a monte, non una riga da aggiungere.

## Cosa devi fare

**① Guarda cosa dice davvero Supabase sulle copie.** Apri Supabase, vai su
Settings e poi su Database, guarda la sezione Backups, e dimmi cosa c'è: che
piano abbiamo, se c'è il ripristino al minuto, quante copie giornaliere
conserva. Sono cinque minuti. Nel documento del ripristino ci sono quattro
righe vuote che aspettano solo quelle risposte, e finché restano vuote nessuno
sa davvero da dove si ripartirebbe.

**② I dati del titolare.** L'informativa privacy e i termini leggono nome,
indirizzo, partita IVA, PEC e capitale sociale da nove variabili che non erano
dichiarate da nessuna parte. Adesso lo sono, ma vuote: l'informativa esce col
nome generico «MyCity» e senza indirizzo. Ho fatto in modo che il sito lo dica
invece di tacere — la sua pagina di salute risponde «degradato». Attenzione a
una cosa: quei valori entrano nel sito nel momento in cui viene ricompilato,
quindi vanno messi **prima** di ripubblicare, altrimenti restano vuoti lo
stesso.

Nessuna delle due la posso fare io: la prima chiede un pannello a cui non
arrivo, la seconda chiede dati veri tuoi.

## Dettagli tecnici

Undici salvataggi sul ramo `claude/marketplace-100-difetti-c62gmv` del repo
`NicolaeRotaru/mycity`, 316 file toccati.

I nove lotti di questo secondo giro, in ordine: architettura (11) · sicurezza e
regole del database (15) · pagamenti (6) · privacy e legale (7) · prestazioni
(8) · interfaccia (9) · accessibilità e flussi (12) · chiamate al server (11) ·
endpoint AI (9) · dati e analisi + rilascio (10, di cui 2 già chiusi).

Difetti 195 e 197: verificati chiusi dal lotto precedente. Il rilascio fissa
già la versione del codice provata dalla CI (`workflow_run.head_sha`) e non usa
più il gancio di Render; il ripiego del segreto del cookie di ruolo su
`UNSUBSCRIBE_SECRET` era già stato tolto.

Database di produzione letto oggi via MCP Supabase: progetto «Mycity», ref
`clmpyfvpvfjgeviworth`, PostgreSQL 17.6.1, regione eu-west-3, stato
`ACTIVE_HEALTHY`.
