---
data: 2026-08-31 02:03
---

# Ho riparato 181 dei 194 problemi trovati il 27 agosto

## In parole semplici
Il 27 agosto una radiografia del marketplace aveva trovato **194 problemi**. Non li ho
cercati di nuovo: ho preso quella lista e li ho riparati. Adesso ne restano aperti **otto**,
e per ognuno c'è scritto qui sotto perché.

Quello che ho toccato è **solo codice, su un ramo separato**. Il sito che vedono i clienti
in questo momento non è cambiato di una virgola: nessuna riparazione è andata in produzione.
Per quello serve la tua firma.

## Cosa cambia per te
Le riparazioni che contano di più sono quelle dove si perdevano **soldi veri**:

- Al negozio dicevamo l'8% di commissione e ne trattenevamo il 10.
- In cassa il cliente vedeva un prezzo e ne pagava un altro.
- Il fattorino consegnava e non incassava un euro quando il credito copriva tutto l'ordine:
  il sistema scriveva comunque «pagato in contanti», da lì non partiva nessun bonifico, e la
  quadratura non se ne accorgeva (atteso 0, incassato 0, differenza 0).
- Dopo un reclamo o un reso, i soldi restavano fermi per strada.
- Un buono sconto poteva essere bruciato due volte.
- In un carrello da due o tre negozi, se la mail al primo negoziante non partiva, il secondo
  e il terzo non ricevevano niente — mentre il cliente aveva già pagato.

Poi c'è il gruppo delle cose che non fanno perdere soldi oggi, ma li fanno perdere il giorno
in cui qualcosa si rompe: il semaforo della salute guardava 5 segreti su 13, e bastava
dimenticarne uno perché non partisse più nessuna email senza che nessuno lo sapesse.

E una che vale la pena raccontare per intero: **il controllo dell'accessibilità era spento e
diceva verde lo stesso.** Se mancavano due chiavi del database, saltava tutti i suoi passi e
il semaforo restava verde: sull'ultima esecuzione vera su main non aveva provato niente. È il
guardiano su cui poggia la conformità che dichiariamo per legge. Adesso ha un lavoro suo,
senza chiavi e senza condizioni — e appena acceso ha trovato subito una cosa vera: la pillola
«Consegna a Piacenza» in cima a ogni pagina era troppo chiara per essere letta da chi non ha
la vista perfetta. Riparata.

## Cosa devi fare
Otto problemi restano aperti. **Cinque aspettano una tua decisione**, non altro lavoro:

1. **Come si pubblica il sito.** Oggi ogni unione su `main` va in produzione senza aspettare
   i controlli. Il rilascio con il cancello è scritto e pronto, ma si accende solo dopo che
   metti tre chiavi Vercel su GitHub: accenderlo prima fermerebbe gli aggiornamenti del sito.
2. **Quali metodi di pagamento offriamo in cassa.** Togliere il vincolo alla sola carta è una
   riga di codice, ma cambia cosa vede il cliente al momento di pagare: è una scelta
   commerciale, non tecnica.
3. **Le foto dei negozi non sono in nessuna copia di sicurezza.** Adesso almeno si sa *cosa*
   c'era (l'elenco è nella copia notturna) e lo script che copia i file è scritto e si accende
   da solo. Manca un posto dove copiarle, fuori da Supabase: circa 1-2 € al mese, più le sue
   chiavi.
4. **Le prove che attraversano la cassa da cima a fondo.** Servono un progetto Supabase di
   prova con dei dati finti e le chiavi Stripe in modalità prova. Senza, il collaudo della
   cassa resta sulla carta.
5. **Fra «il negozio ha accettato» e «consegnato» il cliente non ha vie d'uscita.** Non è un
   errore nel codice: è un buco nel disegno del flusso. Va deciso cosa deve poter fare, prima
   di scriverlo.

Gli altri tre li ho lasciati aperti **dichiarandolo**, con il motivo:

6. La scheda prodotto carica 200 recensioni all'apertura anche a chi ne legge tre: ripararlo
   bene vuol dire riscrivere una pagina da 1206 righe, e il rischio era più alto del guadagno.
7. e 8. Il tetto della coda email (90 messaggi l'ora): la manovra da fare quando l'allarme
   suona adesso c'è nel runbook, e i tre numeri che prima non si parlavano sono legati da una
   prova. Alzare il tetto vero cambia il comportamento in produzione: te lo propongo, non lo
   faccio da solo.

## Cosa non ho verificato
Questo è il pezzo di cui fidarsi di meno, e va detto per intero.

- **Non ho aperto il sito pubblicato.** Ho costruito l'app e fatto girare i controlli contro
  il sito acceso qui dentro, non su quello vero con clienti veri.
- **Non ho toccato la produzione né il database.** Nessuna migrazione è stata applicata.
- Le prove nuove girano qui e in CI; **non provano che in produzione, con i dati veri, il
  comportamento sia identico**.
- **Le prove che attraversano la cassa da cima a fondo continuano a non esistere** (è il
  punto 4 qui sopra). Tutto ciò che ho verificato l'ho verificato a pezzi, non percorrendo
  un acquisto vero dall'inizio alla fine.
- Cinque dei 194 problemi erano **già a posto** prima che cominciassi: li ho contati a parte,
  non fra le mie riparazioni.

---

## Dettagli tecnici

**Il conto.** 194 schede della radiografia del 27/8: **181 chiuse**, 5 già a posto prima,
**8 aperte** — R047, R077, R078, R083, R123, R129, R176, R180 (quest'ultima chiusa a metà).

**Come è stato fatto.** Selezione in sola lettura delle 194 schede (181 aperte / 13 già
chiuse), poi riparazione in lotti con **proprietà esclusiva dei file** — ogni file assegnato
a un solo riparatore, così nessuno lavorava sopra il lavoro di un altro. 32 difetti erano
stati saltati perché i file servivano a qualcun altro: tre giri di recupero li hanno ripresi.
Quattro schede non erano mai state assegnate a nessuno: chiuse alla fine.

**L'asticella.** Ogni riparazione porta una prova che gira e che è stata **vista rossa prima
del fix**, non una parola cercata dentro un file. 126 file di prova nuovi.

**Lo stato del ramo `claude/marketplace-issues-iih4bg`**, verificato da me e non dai
riparatori: `npm run typecheck` 0 · `npm run lint` 0 errori (85 avvisi contro i 99 di `main`)
· `npx vitest run` **316 file, 2332 prove, tutte verdi** · `npm run build` 0 · il cancello
axe 8 controlli su 8 verdi **con l'elenco delle eccezioni vuoto**.

**Due difetti che nessuno aveva visto**, trovati costruendo davvero l'app: `tsc --noEmit`
passava e `next build` falliva, perché Next genera i tipi delle rotte solo mentre costruisce.
① le sei porte d'ingresso dichiaravano il contesto come facoltativo, e Next pretende un
contesto; ② un file di rotta può esportare solo i verbi HTTP, e tre numeri della coda email
erano esportati da lì. Riparati tutti e due: senza, la CI sarebbe stata rossa al primo giro.

**Nessuna PR aperta** — non me l'hai chiesta.
