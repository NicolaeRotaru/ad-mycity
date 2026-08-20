---
data: 2026-08-20 11:20
tipo: riparazioni-marketplace
referto_di_partenza: consegne/audit/2026-08-18-radiografia.md
riparati: 100
aperti: 32
ramo: claude/marketplace-100-bugs-jpl7hw (repo NicolaeRotaru/mycity)
---

# Cento riparazioni sul sito, e i difetti aperti scendono da 141 a 32

**In due righe.** Dei duecentoquarantacinque difetti trovati il 18 agosto ne
restavano aperti centoquarantuno. Oggi ne ho riparati cento. Ti servono due
firme, e sono due cose diverse: unire la richiesta, e applicare la migrazione
al database.

## In parole semplici

Ieri l'altro la radiografia aveva trovato duecentoquarantacinque difetti. Il 19
ne sono stati riparati centoquattro. Oggi altri cento.

Ecco il conto.

| | 18 agosto | 19 agosto | oggi |
|---|---:|---:|---:|
| Bloccanti | 12 | 4 | 4 |
| Gravi | 114 | 76 | 15 |
| Minori | 119 | 60 | 13 |
| **Aperti in tutto** | **245** | **141** | **32** |

Otto dei centoquarantuno erano già a posto. Li aveva riparati il lotto del 19
agosto, e il referto è stato scritto due ore prima: non poteva saperlo. Li ho
aperti uno per uno nel codice invece di ricontarli come lavoro nuovo.

I quattro bloccanti sono gli stessi di ieri, e sono tuoi: aspettano una tua
decisione o un tuo dato, non una riga di codice. Te li richiamo in fondo.

## Cosa cambia per te

Le cose più grosse, in ordine di quanto costavano.

**Il doppio clic faceva due ordini.** In contanti non c'era nessuna protezione
contro il doppio invio.

Un esempio vero. Anna ordina 34 euro di spesa da Pane Quotidiano, tocca
«Ordina», e per due secondi non succede niente. Tocca di nuovo. Nascono due
ordini identici: la merce viene riservata due volte e il suo credito MyCity
scalato due volte. Il fornaio prepara due spese, il fattorino ne consegna una,
e i 34 euro dell'altra li rimettiamo noi.

**I recapiti dei clienti erano scaricabili da ogni fattorino.** Non solo i suoi:
nome, telefono e indirizzo di casa di *tutti* gli ordini liberi della città. Per
decidere se accettare una consegna quei dati non servono — servono il negozio,
la zona, l'importo e l'orario. Ora la bacheca non li ha proprio; sull'ordine che
il fattorino ha preso li vede eccome, altrimenti non consegnerebbe.

**Il registro dei consensi cookie era vuoto. Da sempre.** Ogni scelta veniva
rifiutata dal server per un dettaglio tecnico e buttata via in silenzio:
accetto, rifiuto, personalizzo, tutte e tre. Il giorno in cui il Garante, o semplicemente un
cliente, chiede «dimostrate che vi aveva detto di sì», non c'era niente da
mostrare.

**Il controllo «il negozio è chiuso adesso» non scattava mai.** Una modifica di
agosto ha chiuso la lettura dei profili. Da allora quella verifica tornava
vuota: nessun errore, zero righe.

Le conseguenze sono tre. Si potevano fare ordini alle tre di notte, e il
fattorino andava a vuoto. La consegna veniva prezzata sempre a tariffa fissa
invece che sulla distanza. E la chat col negozio non si apriva più.

**Dopo aver pagato con la carta si poteva leggere «Non hai ancora ordini».** La
pagina riprovava due volte e si arrendeva. Chi legge quella frase dopo aver
pagato fa una cosa sola: paga di nuovo, o chiama la banca.

**Il totale del checkout usava i prezzi salvati nel carrello.** Il server ne
addebitava altri. Ora i prezzi si rileggono all'apertura, e se qualcosa è
cambiato si dice, con la cifra di prima e quella di adesso.

**Il backup notturno non bastava a rimettere in piedi il sito** — escludeva gli
utenti, quindi ripristinandolo si otteneva un database senza nessun account — e
viaggiava in chiaro, con dentro nomi, indirizzi e telefoni di tutti, per trenta
giorni.

**Il catalogo si fermava a 96 prodotti** e non lo diceva: dal novantasettesimo
in poi non esistevano per nessuno, nemmeno per il negoziante che li aveva
pubblicati.

**Le storie dei negozi non si potevano fermare.** Cinque secondi e via, senza
appello, per chi legge piano o usa un lettore di schermo.

## Cosa devi fare

**Due firme, e sono due cose separate.**

**① Unire la richiesta.** Il codice è su un ramo, con le prove verdi. Unirla
pubblica il codice del sito.

**② Applicare la migrazione 122 al database.** È un'azione a parte e va chiesta
a parte: unire una richiesta pubblica il codice, non tocca il database. Il file
si chiama `122_radiografia_20_agosto.sql`. Dentro ci sono sette riparazioni,
fra cui la bacheca dei fattorini senza recapiti e il tetto sui contatori delle
campagne sponsorizzate.

**Poi tre cose piccole, quando puoi.**

- **Una passphrase per il backup.** Da oggi il backup notturno, se non trova
  quella parola d'ordine, si ferma invece di uscire in chiaro. Scegline una
  lunga, salvala dove tieni le password e mettila su GitHub come
  `BACKUP_PASSPHRASE`. Finché non c'è, il backup non gira.
- **La stringa di connessione al database** come segreto `SUPABASE_DB_URL`:
  serve al controllo che ogni mattina verifica se una modifica al database è
  stata scritta nel codice e mai applicata. È esattamente quello che il 19
  agosto ha fermato a metà la migrazione 119.
- **Il banner dei cookie ricomparirà una volta a tutti.** È voluto: i consensi
  «già dati» non esistono, perché venivano buttati via.

**I quattro bloccanti che restano, e perché sono tuoi.**

**Il compenso del fattorino non sta dentro l'incasso.** Tre euro fissi di
consegna non coprono un compenso che a cinque chilometri vale otto euro e
cinquanta. Non è un errore di codice: è un numero da decidere. O sale la tariffa
di consegna, o sale la soglia della spedizione gratis.

**La partita IVA in fondo alle pagine è finta.** Servono i tuoi dati veri:
denominazione, sede, partita IVA. E se un responsabile della protezione dati
esista oppure no.

**I negozi rimessi «in attesa» dalla bonifica del 14** vanno riapprovati dal
pannello, non con una scrittura a mano.

**Il ritiro in negozio non arriva mai a «consegnato».** L'ordine resta fermo e
il negoziante non viene pagato. Serve una funzione nuova nel database più un
pulsante nella pagina ordine del venditore: è un lavoro a sé, te lo propongo
separato.

## Cosa non ho verificato

Non ho aperto il sito in un browser. Non ho fatto un ordine e non ho pagato con
una carta di prova. Non ho premuto due volte il pulsante che ora è protetto dal
doppio invio. Non ho visto il pannello di Render.

La migrazione 122 non è stata applicata a nessun database vero: l'ho applicata
solo a un Postgres di prova, qui dentro, ricostruendo lo schema da zero. Le sue
riparazioni non sono attive finché non la firmi.

Delle cento riparazioni, quarantasette hanno una prova automatica nuova o
aggiornata che le copre. Le altre cinquantatré sono coperte dal controllo dei
tipi, dal controllo di stile e dalle ottocentosessanta prove esistenti che
continuano a passare. È meno di quanto vorrei, e lo dico invece di lasciartelo
scoprire.

Su tre riparazioni ho fatto meno di quanto chiedeva il referto. L'ho scritto nel
registro accanto a ognuna, e te le dico anche qui.

- I totali del riepilogo venditore restano calcolati nel browser. Andrebbero
  spostati nel database.
- L'endpoint AI che prepara le risposte alle domande dei clienti è stato messo
  in sicurezza. Resta senza una schermata che lo usi.
- Per la posizione dei fattorini ho scritto l'informativa e l'avviso dentro
  l'app. La valutazione d'impatto privacy resta da fare, prima di avere
  fattorini veri.

La Dichiarazione di Accessibilità e l'informativa privacy le ho riscritte
togliendo quello che non era vero. Sono testi pubblici con valore legale: vanno
riletti da chi ne risponde, non da me.

---

## Dettagli tecnici

**Dove sta il lavoro.** Repo `NicolaeRotaru/mycity`, ramo
`claude/marketplace-100-bugs-jpl7hw`, dieci commit sopra `abfc341`.

**Cancelli eseguiti.** `tsc --noEmit` pulito · `next lint` zero errori (95
avvisi di accessibilità preesistenti, erano 96) · `vitest run` 860 verdi su 860
(erano 800) · schema ricostruito da zero su Postgres 16 con tutte e 123 le
migrazioni applicate, zero fallite · cinque file di controlli SQL verdi.

**La prova che diventa rossa senza la riparazione.** Sul database senza la
migrazione 122, un fattorino approvato legge `delivery_phone = 3331234567` di un
ordine che non è suo. Con la 122, zero righe. Il controllo sta in
`tests/sql/rls/05-bacheca-rider-e-sponsorizzati.test.sql`.

**Prove nuove scritte in questo lotto** (`tests/unit/`):
`orologio-di-piacenza.test.ts` (7) · `analytics-senza-dati-personali.test.ts`
(6) · `filtri-a-blocchi.test.ts` (5) · `immagini-base64.test.ts` (8) ·
`logger-non-perde-l-errore.test.ts` (4) · `corpo-con-tetto.test.ts` (6) ·
`sconti-in-una-chiamata.test.ts` (5) · `registro-consensi.test.ts` (4) ·
`una-sola-regola-per-la-spedizione.test.ts` (7) ·
`notifiche-solo-dal-server.test.ts` (3) · più i casi aggiunti a
`api-vision-photo-order`, `api-ai-catalog-create-bulk`, `api-ai-copilot`,
`api-ai-reviews-summary`.

**Ripartizione delle 100 per reparto.** dati-analytics 19 · ai-endpoints 14 ·
deploy-sre 13 · frontend-ux 12 (con accessibilità) · performance 8 ·
architettura 7 · privacy-legale 7 · api-backend 6 · rls-database 5 ·
qa-flussi 2 · sicurezza-auth 2 · accessibilità 5.

**Migrazione 122** (`migrations/122_radiografia_20_agosto.sql`): vista
`ordini_disponibili_rider` + policy ristretta sugli ordini · `category` sulle
notifiche dei trigger · tetto per minuto sui contatori degli sponsorizzati ·
`product_active_discounts(uuid[])` · `store_cards(int,int)` con LATERAL ·
resi e conversazioni da CASCADE a SET NULL · tabella
`cod_checkout_attempts` per il doppio invio.

**Il registro.** `MyCity-Vault/90-Memoria-AI/auto-coscienza/radiografia-marketplace.json`
porta ora `stato` e `lotto` su ogni voce, più il blocco `stato_lotto_20_agosto`
col conto, le note sulle riparazioni parziali e l'elenco di cosa serve da te.
