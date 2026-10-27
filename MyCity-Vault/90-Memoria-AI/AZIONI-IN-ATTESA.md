---
tipo: coda-azioni
fonte: senior dell'AD
---

# ⏳ AZIONI IN ATTESA — pronte a partire, aspettano il via di Nicola

> 🧹 **Housekeeping 2026-10-27 12:02** — Automatico: **40 aperte · 110 chiuse in archivio**.
>
> *Nota AD 11:15: questo banner era ripetuto 4 volte identiche, residuo di un giro interrotto. Unificato in uno solo.*

> Qui i senior accodano le azioni **🟡/🔴 già PRONTE** (testo esatto, destinatario, importo, canale).
> Le **🟢** non passano di qui: i senior le fanno e basta.
> Nicola dà l'ok → l'azione passa a ✅ FATTO e parte (via i canali del marketplace o a mano).

## Come approvare
Ogni card ha un **numero fisso**, scritto prima del titolo (es. `#41`). Il numero non cambia mai. Una card nuova prende il numero successivo al più alto mai usato, contando anche le card chiuse dell'archivio.
Per dare il via scrivi all'AD: **«ok 41»** (o «ok a tutte le 🟡»). L'AD esegue, segna FATTO qui e lascia la traccia in [[DECISIONI]].
Le card più nuove stanno in alto. Ogni card porta la data di nascita accanto al titolo.

<!-- write-vs-edit-settings-local -->

---

<!-- trigger-esterno-anti-churn -->


<!-- pausa-scaduta-risveglio -->

<!-- radiografia-totale-sito-3-9 -->

<!-- chiave-anti-robot-prima-di-unire -->

### 🟡 #215 — Scegli se unire la consegna da 3 euro così com'è: il sito funziona, mancano alcune prove · ⏳ accodata 2026-10-27 20:46

**In parole semplici.** La squadra della consegna ha finito. La pagina dell'ordine non scrive più «Spedizione GRATUITA» sopra i 3 € di consegna, e la voce ha lo stesso nome ovunque. Il confine dei 10 km è provato in ogni direzione dritta.

Il collaudo l'ha bocciata tre volte, ma non per un errore del sito. Ogni volta ha trovato un modo nuovo di rompere il codice che le prove non vedrebbero. Per esempio: se domani qualcuno sbagliasse il calcolo della distanza solo in diagonale, oggi nessuna prova diventerebbe rossa.

**Cosa cambia:** con «ok 215» unisco la consegna nella richiesta del sito (#262). Il sito si comporta giusto: 5.917 prove automatiche su 5.917, e nel browser nessuna prova rossa della consegna. I buchi delle prove restano nel registro, aperti, e li chiude un giro dedicato.

**Cosa devi fare tu.** Scrivimi «ok 215» per unirla così: è il mio consiglio. Oppure «215 un altro giro», se vuoi prima anche le prove che mancano. Ogni giro costa circa un'ora e mezza e due milioni di gettoni, e finora ha sempre trovato buchi nuovi.

**Se va bene:** la consegna entra nella #262 insieme alla cancellazione dell'account, appena il quarto giro di quella regge. Poi ti ripresento la #262 da unire.

**Cosa non ho verificato:** la consegna da sola nel browser. L'ho provata insieme al ramo dell'account: le sole 3 prove rosse erano dell'account, e le sta sistemando il quarto giro.

Contenuto: `consegne/audit/2026-10-27-fase2-sito-giro3.json`. Il ramo è `fix/ondata-5-lib-ordini-riepilogo-ordine-ts`.

---

### 🔴 #213 — Comincia dal messaggio delle firme: la tua lista dei lavori è rifatta da capo · ⏳ accodata 2026-10-26 08:50

> ⏰ **2026-10-26 09:05 — Il messaggio è arrivato.** Resta il cambio delle chiavi del database insieme a me: scrivimi «inizio la 203». Poi le visite brevi della tappa 2.

**In parole semplici.** Ho messo in fila tutti i lavori che toccano a te: 133 aperti, raccolti in 50 voci in «Cose da fare per me». Oggi ne servono due: il messaggio delle firme, che ti ho scritto già pronto, e il cambio delle chiavi del database insieme a me.

**Cosa cambia:** le squadre del sito partono appena arriva il messaggio, e la chiave esposta dall'11/10 smette di funzionare. Con le firme oggi, il primo ordine vero è stimato fra il 30/10 e il 1/11.

**Cosa devi fare tu.** Copia il messaggio dal referto, cambia quello che non ti va e mandamelo. Poi scrivimi «inizio la 203».

L'analisi ha trovato anche nove lavori tuoi che non avevano una carta. Stanno nella lista, alle tappe indicate:
- **Tappa 2:**
  - la verifica in due passaggi su Vercel, Supabase, Stripe, Resend, Netsons e Hetzner;
  - l'email di prova alla casella info del sito;
  - la data del prossimo addebito di Supabase e la scadenza della carta;
  - il token di gestione di Supabase diviso in due;
  - gli avvisi di GitHub sulle librerie con falle note.
- **Tappa 3:**
  - le consegne del fresco, cioè corso HACCP, contenitori termici e comunicazione all'ASL;
  - se I Frutti della Terra, La Canteina e Il Pollivendolo sono negozi veri e d'accordo.
- **Tappa 7:**
  - gli accordi sul trattamento dei dati coi fornitori, Supabase per primo;
  - una persona di riserva per consegne ed emergenze.

**Se va bene:** con il tuo messaggio aggiorno il registro dei fatti e faccio partire le squadre. Le quattro carte che l'analisi dà per chiuse del tutto le sistemo io: la #5, la #15, la #186 e la #188.

Contenuto: `consegne/ad/2026-10-26-lavori-di-nicola.md` (testo del messaggio, la fila per tappe, le tabelle con le prove).

---

### 🟡 #212 — Firma il metodo nuovo delle ondate del sito, quello che consuma molti meno gettoni · ⏳ accodata 2026-10-25 15:10

> ⏰ **2026-10-27 15:20 — Hai detto sì al tipo snello.** Lo costruisco appena finisce il giro del sito che sta girando adesso: cambiare il tipo di squadra a metà giro mescolerebbe due misure dei gettoni. Ti arriva in una richiesta di unione sua, col conto prima e dopo.
>
> ⏰ **2026-10-26 09:05 — Il metodo è unito, e l'ondata delle fondamenta parte coi senior tech e qa.**

**In parole semplici.** Un'ondata del sito si mangiava la settimana: ogni agente rilegge tutto a ogni passo, e la prima ne ha accesi più di 600. Il metodo nuovo ne accende al massimo 45, più leggeri. Cambia il manuale dell'AD: serve la tua firma.

**Cosa cambia:**
- Un'ondata: al massimo 45 agenti e due giri di correzione, poi si ferma e ti chiede.
- Il manuale che ogni agente rilegge scende da 75 a 35 KB.
- Un comando misura i gettoni veri, agente per agente.

**Cosa devi fare tu.** Niente, per ora. Il metodo è unito e il sì al tipo snello è arrivato: quando è pronto, ti porto la sua richiesta di unione da firmare.

**Se va bene:** alla prossima ondata uso il metodo nuovo, e ti porto il conto vero accanto a quello dell'ondata 1.

Contenuto: `consegne/audit/2026-10-25-consumo-token.md`.

---

### 🔴 #210 — Il giorno della chiave: i tuoi passi, nell'ordine giusto · ⏳ accodata 2026-10-24 14:20

**In parole semplici.** Il sito oggi non prende ordini perché su Vercel manca la chiave di servizio del database. Quando la metti, partono insieme dieci lavori notturni e si accendono cose che oggi dormono. Per questo i passi vanno in fila, e alcuni solo dopo il mio via.

**Cosa cambia:** dopo questi passi un cliente può ordinare in contanti da Pane Quotidiano, il fornaio salva i prodotti, tu approvi i negozi, e le email partono davvero.

**Cosa devi fare tu, in ordine.**
- **Oggi, da soli:** cambia la password dell'amministratore e le chiavi del database, con le carte #202 e #203. Prima di cambiare la chiave, controlliamo insieme chi usa quella vecchia. *(La #202 è fatta, il 25/10 alle 11:50. Chi usa la chiave vecchia l'ho controllato il 25/10 all'01:25: il sito, il Pannello e il VPS. L'ordine dei passi te l'ho dato in chat.)*
- **Oggi, se vuoi:** accendi la regola «Main» su GitHub, carta #177, in 2 minuti. In Supabase accendi la protezione contro le password già rubate, in 2 minuti.
- **Lunedì:** dimmi com'è messo Stripe, in 10 minuti. Poi verifica il mittente delle email su Resend, carta #195, in 15 minuti.
- **Solo dopo il mio via:** togli l'approvazione al «Panificio Demo», carta #201. Poi copia su Vercel la chiave di servizio nuova e le caselle del titolare, carta #154, e fai un nuovo rilascio.
- **Subito dopo:** un ordine vero di pane da Pane Quotidiano, pagato in contanti e consegnato da te, fino alla rimessa registrata. Nello stesso giro, 5 minuti: carica una foto di copertina entrando come negoziante. La riparazione della carta 167 non è mai stata provata su un database vero.
- **Dopo le riparazioni del rilascio:** i segreti di Vercel su GitHub, carta #161, e le due firme sulle migrazioni.

**Se va bene:** controllo che ogni lavoro notturno parta come deve, e chiudo i difetti che la chiave risolve. Elenco completo con i minuti in `consegne/audit/2026-10-24-piano-riparazione-sito.json`, voce `passi_di_nicola`.

---

### 🔴 #207 — Dopo l'unione, due passi su Supabase: la password dal telefono e i contanti prima della consegna · ⏳ accodata 2026-10-16 12:40

> ✅ **2026-10-18 17:12 — La 163 l'ho lanciata io, con il tuo «sì».** Verificata in sola lettura: il controllo dell'incasso c'è, proprietario e permessi sono quelli di prima. Resta solo il passo dei due modelli email.

**In parole semplici.** Due riparazioni della #206 si completano solo dal pannello di Supabase, che vedi solo tu.

**Cosa cambia:**
- **Due modelli email.** Oggi chi chiede la nuova password dal computer e apre l'email dal telefono non riesce a cambiarla. Con i modelli nuovi ci riesce.
- **Un file da lanciare nel database.** Il controllo della pagina del fattorino entra anche nel database: un ordine in contanti non si chiude come consegnato senza l'incasso confermato.

**Cosa devi fare tu, solo dopo che la #206 è online.** I passi esatti sono nel referto `consegne/audit/2026-10-16-prima-ondata-sito.md`, alla sezione «I passi dopo l'unione»: i due collegamenti da incollare e il nome del file. Il file si può lanciare due volte senza danni, ma non prima della pubblicazione.

**Se va bene:** chiudo i due difetti dopo la prova vera, la password chiesta dal computer e cambiata dal telefono.

---

### 🔴 #203 — Cambia oggi le chiavi del database del sito: una chiave segreta non è più segreta · ⏳ accodata 2026-10-11 23:15

> ⏰ **2026-10-24 14:20 — È ancora la cosa più urgente.** Il piano di riparazione la mette oggi, insieme alla #202, prima di tutto il resto. Finché la chiave vecchia vive, il giorno della chiave della #210 non può partire.

> ⚠️ **2026-10-12 17:55 — Ancora aperta.** Accettata 244 volte in 24 ore, tutte letture del sito. Nel database nessuna traccia di intrusi. La procedura collaudata è in chat del 12/10.

**In parole semplici.** Una chiave del database è finita dove la vede chiunque. Dove e perché sono in chat: questo file è pubblico.

**Cosa cambia:** finché funziona, chi la trova legge e cambia i dati del sito. Toglierla da Vercel non basta: va spenta su Supabase.

**Cosa devi fare tu.** I passi della chat del 12/10, nell'ordine. Mai tornare a una pubblicazione vecchia. Sul Garante decidi col DPO entro mercoledì 14 ottobre in serata.

**Se va bene:** controllo che il sito pubblicato abbia solo la chiave pubblica.

---

### 🔴 #201 — Cancella il «Panificio Demo»: è una tua prova, e i clienti lo vedono come un negozio vero · ⏳ accodata 2026-10-10 12:05

> ⏰ **2026-10-27 15:20 — Hai scritto che l'hai creato tu e che si può cancellare.** Il comando è qui sotto, pronto. L'ho controllato in sola lettura: niente ordini, recensioni, conversazioni o file collegati.

**In parole semplici.** Il «Panificio Demo» è un account di prova con 4 prodotti, approvato come un negozio vero. Il comando toglie in un colpo solo i 4 prodotti, il negozio e l'account.

**Cosa cambia:** sul sito resta solo Pane Quotidiano, coi suoi 5 prodotti. La cancellazione non si può annullare: il negozio di prova non torna più.

**Cosa devi fare tu.** Apri Supabase, poi «SQL Editor». Incolla il comando e premi «Run». Deve uscire una riga sola: 4 prodotti, «Panificio Demo» e l'indirizzo seller.demo@piacenza-demo.local. Se esce un errore, mandami la foto e non riprovare.

```sql
with prodotti as (
  delete from public.products
  where seller_id = '44444444-4444-4444-4444-aaaaaaaa0001'
  returning name
),
negozio as (
  delete from public.profiles
  where id = '44444444-4444-4444-4444-aaaaaaaa0001'
  returning store_name
),
account as (
  delete from auth.users
  where id = '44444444-4444-4444-4444-aaaaaaaa0001'
  returning email
)
select
  (select count(*) from prodotti) as prodotti_cancellati,
  (select store_name from negozio) as negozio_cancellato,
  (select email from account) as account_cancellato;
```

**Se va bene:** scrivimi «fatto 201» e lo ricontrollo nel database.

**Cosa non ho verificato:** se nel magazzino delle foto ci sono immagini del negozio salvate con un nome diverso dal suo codice. Col suo codice non ne ho trovata nessuna.

> 📜 **Storia.** 12/10 17:55: l'account nasce il 5/9 da un programma, insieme ad altri due di prova; il 7/9 alle 21:37 qualcuno ci entra, tre minuti dopo un accesso dal tuo account. 26/10 09:05: hai detto di toglierlo prima della chiave. 27/10: hai confermato che eri tu.

---

### 🔴 #195 — Metti su Vercel la variabile del mittente delle email, prima di unire · ⏳ accodata 2026-09-06 19:10

**In parole semplici.** Da oggi, se manca l'indirizzo da cui partono le email, la posta non parte più in silenzio da un mittente finto: si ferma e lo scrive nel semaforo della salute. È la scelta giusta, perché una posta che parte da un dominio inventato viene buttata dal destinatario e noi non lo sappiamo.

**Cosa cambia:** ha lo stesso rovescio della card #193. Se quella variabile in produzione non c'è, dopo l'unione le email di servizio smettono di partire — conferma d'ordine, ordine pronto, ordine consegnato.

**C'è un motivo concreto per sospettare che manchi.** Il manuale del progetto insegna da sempre il nome `RESEND_FROM_EMAIL`. Il codice legge `RESEND_FROM`. Chi ha configurato Vercel leggendo il manuale ha messo il nome sbagliato.

**Cosa devi fare tu.** Su Vercel, progetto `mycity`, Settings, Environment Variables: controlla che fra quelle di Production ci sia `RESEND_FROM`, con dentro un indirizzo su un dominio che Resend ha verificato. Se trovi `RESEND_FROM_EMAIL`, è quello il problema: va aggiunta quella giusta.

Te lo chiedo perché da qui le variabili di Vercel non le posso leggere.

**Se va bene:** unisco, e il semaforo della salute inizia a sorvegliare quella variabile da solo.

---

### 🟡 #192 — Il dominio funziona: resta da mettere d'accordo il nome che il sito dichiara · ⏳ accodata 2026-09-03 09:35 · ✅ il grosso è fatto il 2026-09-06 17:09

**In parole semplici.** Il nome del sito ha portato a un server spento per trentotto giorni. Il 6 settembre hai cambiato le due righe nel pannello Netsons, e adesso porta al marketplace. Controllato da qui: il nome nudo risponde `216.150.1.1`, il `www` porta all'indirizzo di Vercel, la pagina che arriva è il marketplace vero, e la riga della posta è intatta.

**Cosa resta.** Il sito si presenta come `mycity-marketplace.com`, senza il `www`, mentre Vercel serve il `www`. Non si rompe niente. Però ogni anteprima condivisa e ogni ritorno dal pagamento fa un salto in più, e Google si trova un indirizzo dichiarato che rimbalza.

**Cosa devi fare tu.** Una delle due, e la prima non tocca il codice. Su Vercel metti il nome nudo come principale e fai rimandare il `www` a lui. Oppure metti `NEXT_PUBLIC_APP_URL = https://www.mycity-marketplace.com` fra le variabili di produzione, e poi ripubblica.

**Cosa non ho verificato.** Il lucchetto e la catena del certificato: da qui la rete non lascia bussare al sito per la via normale. E nessuno ha ancora fatto un ordine vero dal nome nuovo.

**Se va bene:** restano tre cose fuori dal sito, da fare una volta sola. L'indirizzo dove Stripe manda l'avviso di pagamento. L'elenco dei rientri ammessi dopo il login su Supabase. La richiesta di riscansione a Google. La procedura distesa sta in `consegne/devops/2026-09-04-dominio-su-vercel.md`.

---

### 🟡 #188 — Dimmi dove vive il comando che ogni giorno mi chiede di controllare i negozi in calo · ⏳ accodata 2026-09-01 11:22

**In parole semplici.** Ogni giorno arriva un compito — "PLAYBOOK anti-churn negozi" — che mi chiede di
cercare negozi con ordini in calo e preparare telefonate di richiamo. L'ho eseguito 23 volte da inizio
luglio: risultato identico ogni volta, perché in tutto il marketplace c'è **un solo negozio vero**
(Pane Quotidiano) e un solo ordine mai pagato. Con un negozio solo non esiste un "calo" da misurare.

**Il problema vero non è il compito, è che non trovo chi lo manda.** Ho cercato in tutto il codice della
macchina (il file che fa girare i turni, le sveglie programmate, l'elenco dei compiti ricorrenti): non
c'è. Arriva da qualche parte fuori da questo repository — una scaletta o un'agenda che nessuna sessione
precedente è riuscita a localizzare. Te l'avevo già chiesto due volte (card #160 il 24/8, poi #187 il
27/8): entrambe sono sparite dalla coda senza una tua risposta, probabilmente in una pulizia automatica.

**Cosa devi fare.** Dimmi tu dove vive questo comando ricorrente (uno strumento esterno? un'agenda che
gestisci tu?), così posso proporti di metterlo in pausa finché non arriva il secondo negozio vero — oggi
mi limito a rifare la stessa verifica e scriverla in memoria, senza produrre nulla di nuovo.

**Se va bene:** o mi dici dove disattivarlo, o confermi di lasciarlo così finché non c'è un secondo
negozio — in entrambi i casi smetto di riproporti la stessa domanda ogni giorno.

- **Colore:** 🟡 (decisione operativa, nessun soldo/dato in gioco)
- **Reparto:** account-negozi / AD

> ✅ **Aggiornamento 2026-09-01 12:00.** Ho cercato in due posti nuovi, non controllati il 24/8.
> Primo: l'elenco delle sveglie programmate da questa sessione (`CronList`) — vuoto, nessuna sveglia
> registrata qui. Secondo: ho cercato la parola «PLAYBOOK» in tutti gli script del server
> (`cervello/vps/*.sh`, `cervello/worker.sh` e i suoi collaboratori) — non compare da nessuna parte.
> Il comando non nasce in questo repository e non nasce in questa sessione. Deve vivere fuori da
> entrambi: un'agenda o una routine che gestisci tu fuori da qui, oppure un pezzo del server che non
> scrive la sua fonte nel codice. Non riesco a guardare oltre da dove sono seduta ora.

---

<!-- cancello-del-sito-e-campo-prova -->
### 🟡 #186 — Decidi se costruire il cancello unico del sito, che oggi non esiste · ⏳ accodata 2026-08-28 21:40

**In parole semplici.** Ho scritto il metodo per chiudere tanti difetti del sito in una volta sola.
Scrivendolo ho trovato tre buchi veri, e non li ho tappati: te li porto perché la decisione costa
lavoro e la firma è tua.

**Il primo buco: sul sito non c'è un comando unico che dica «si consegna».** Sulla macchina c'è, e
un mansionario di casa spiega perché: cinque comandi da ricordare erano cinque occasioni di
dimenticarne uno. Sul sito oggi sono due comandi separati, da lanciare a mano.

**Il secondo buco: le schede dei difetti del sito non hanno il campo della prova.** Ce l'hanno 4
schede su 615, e nessun controllo lo legge. Vuol dire che per un difetto grave su una pagina non
posso dichiarare «questa la verifica un umano», come faccio sulla macchina.

**Per esempio.** Un difetto grave sulla pagina della cassa: le pagine non hanno test che le
importano come modulo. Oggi o riesco a scrivere una prova che gira, oppure quel difetto resta
aperto. Non c'è la terza strada.

**Il terzo buco: dopo l'unione, segnare i difetti come riparati è lavoro a mano.** Vuol dire aprire
un file da ottomila righe e scriverci dentro riga per riga. Se quel passo salta, il lotto successivo
rimette in lista roba già sistemata.

**Cosa cambia per te.** Se dici di sì, i lotti del sito si chiudono con un comando solo. E i
difetti delle pagine si possono chiudere dichiarando chi li ha guardati. Se dici di no, il metodo
funziona lo stesso. Ma resta il debito: due comandi a mano, e nessuna prova dichiarabile sulle
pagine.

**Cosa devi fare.** Rispondi «ok 185» se vuoi che lo costruisca, oppure dimmi di lasciarlo lì. Non
è urgente per il 1° settembre: i lotti si possono fare anche così.

**Se va bene:** costruisco tre cose. Il comando unico del cancello del sito. Il campo della prova
nello schema delle schede, col controllo che lo legge. Il comando che scrive le chiusure dopo
l'unione. Resta tutto in una richiesta di unione, e la firma resta tua.

---

<!-- parte-venditore-strada -->

### 🟡 #180 — Un post pronto per Pane Quotidiano: il pudding vaniglia come merenda, senza promettere la consegna · ⏳ accodata 2026-08-28 12:55

**In parole semplici.** Ho scritto il post del giorno per Pane Quotidiano: il pudding alla vaniglia
bio come merenda pronta di fine pomeriggio, un momento della giornata mai usato finora (finora solo
colazione e pranzo/cena). Testo, versione gruppi Facebook e idea grafica sono pronti in
`consegne/content/2026-08-28-post-del-giorno-merenda-pudding-PQ.md`.

**Cosa cambia per te.** A differenza dei post precedenti, la CTA qui NON promette «ti portiamo a
casa» — dice solo «scopri il catalogo su MyCity» — proprio per il blocco pagamenti spiegato nella
card #179 qui sopra. Puoi pubblicarlo anche prima di risolvere #179, senza rischio che un cliente
trovi un pagamento fallito.

**Cosa devi fare.** Scegli il visual (tipografico, pronto subito, o aspetta una foto reale del
prodotto — serve l'ok del titolare) e dammi il via.

Rispondi «ok 180» per pubblicare (IG feed + storia + pagina FB + gruppi FB, fascia consigliata
16:00–18:00).

**Cosa non ho verificato.** Non ho generato la grafica vera (serve la Content Factory/chiavi AI
attive); il layout è descritto ma non renderizzato.

**Cosa cambia:** un post pronto in più per Pane Quotidiano, con un angolo (merenda) mai usato prima.

**Se va bene:** pubblico secondo la checklist nel file, con UTM `merenda-2808`.

---

<!-- serratura-cancello -->

### 🔴 #177 — Il controllo che protegge il codice avvisa ma non ferma: decidi tu se dargli la serratura · ⏳ accodata 2026-08-26 08:05

> ⏰ **2026-10-26 09:05 — Hai scelto la B.** Adesso tocca a te accendere la regola «Main» su GitHub, prima sul sito e poi sulla macchina, in una seduta di 5-6 minuti. Prima ti porto i costi per rendere privati i repository: sul piano gratuito, in un repository privato la regola non vale.

> 🔁 **2026-10-16 12:40 — Sul sito la regola «Main» si può accendere, dopo la #206.** Il controllo che aspettava adesso esiste ed è verde. Oggi nessuno può scavalcarla, quindi accesa così è la strada C. I passi: referto della #206, «I passi dopo l'unione».

**In parole semplici.** Prima che una mia modifica entri nel codice buono, gira un controllo
automatico. Ricontrolla tutto: le prove, i conti, i guardiani. Quel controllo funziona bene. Legge,
misura, e dice sì o no.

Il problema è che il suo «no» non ferma niente. È come un cartello «lavori in corso» senza
transenna. Ti avvisa, e poi sta a te se passarci sopra.

**Cosa cambia per te.** Sono andato a contare. Dal 4 agosto a oggi sono entrate 141 modifiche nel
codice buono. Dieci sono passate senza il via libera. In nove casi il controllo aveva detto no. Nel
decimo non l'aveva proprio vista.

Dieci su 141 fa il 7%. Cioè circa una ogni due settimane.

Un esempio vero, il più recente. Il 24 agosto è entrata la modifica numero 840. Il controllo era
rosso su quella modifica. Il titolo dice che serviva proprio a rimettere a posto un guardiano che
si lamentava. Quindi probabilmente unirla era la cosa giusta da fare.

Ed è esattamente il punto. Non ti sto dicendo che quelle dieci fossero sbagliate. Ti sto dicendo che
oggi nessuno le distingue. Non resta traccia di quando è stato uno scavalco giusto e quando una
distrazione.

**Cosa devi fare.** Dirmi quale delle tre strade qui sotto vuoi. Nessuna è gratis: ognuna ti costa qualcosa di diverso.

**Strada A — lasciamo com'è, e teniamo il numero d'occhio.** Ho preparato il comando che lo conta.
Oggi sono dieci. Da adesso quel dieci diventa un tetto. Se sale, qualcosa suona. Tu continui a unire
come hai sempre fatto, senza niente che ti freni. *Costo: se un giorno passa una modifica rotta, lo
scopriamo dopo.*

**Strada B — obbligatorio, ma tu puoi scavalcarlo.** Il pulsante si blocca per tutti. A te, che sei
il proprietario, resta il modo di forzare quando serve davvero. *È quella che consiglio: ferma le
distrazioni e non ti toglie l'ultima parola.*

**Strada C — obbligatorio e basta, nessuna deroga.** *Attenzione a un caso che capita davvero. Se un
giorno il codice buono è rosso per conto suo, il pulsante è bloccato per tutti. Bloccato anche per
la correzione che lo rimetterebbe verde. Per uscirne bisogna rientrare qui a mano e togliere
l'obbligo.*

Scrivimi la lettera che scegli e basta: A, B o C.

La B e la C le devi fare tu con le tue mani. È un'impostazione del tuo account su GitHub. Da qui non
ho il permesso di toccarla: ci ho provato, e GitHub mi ha risposto di no. Ed è giusto così.

**Se va bene:** con la B o la C ti scrivo i passaggi esatti. Sono tre clic dentro le impostazioni
del progetto. Con la A non devi fare niente. Il conto parte da solo, e ti avviso solo se quel dieci
sale.

**Cosa non ho verificato.** L'impostazione com'è messa adesso non l'ho potuta leggere. GitHub non me
la fa vedere da qui. Quindi il «non è obbligatorio» lo deduco dal comportamento, non dall'averlo
letto: nove modifiche col controllo rosso sono entrate lo stesso, e se fosse obbligatorio non
avrebbero potuto.

E non sono andato a vedere una per una se quelle dieci fossero giuste o sbagliate. I registri di
quelle giornate GitHub li ha già cancellati. Quella domanda oggi non ha più risposta.

> 🔒 **Aggiornamento AD 2026-09-07 22:35 — ho fatto la mia parte.**
>
> **Perché conta doppio.** Vale anche per il sito. Lì del codice con una prova rossa può ancora andare online, e quello che scegli qui lo chiude alla radice, senza segreti.
>
> **Una cosa che non sapevamo.** Sopra c'è scritto che non la potevo leggere. Ho riprovato da un'altra porta, e si legge. Sul sito una regola esiste già, dal 26 maggio. Non ha mai protetto niente: è spenta, non punta a nessun ramo, e pretende un controllo di nome «Main» che non esiste. **Attento:** accesa così, il pulsante «unisci» resta bloccato per sempre, ad aspettare un controllo che non arriva.
>
> **La A l'ho fatta.** Contavo solo la macchina; del sito non contava nessuno. Misurato oggi: sette lavori su 110 entrati con la prova rossa, il 6,4%, l'ultimo il 20 luglio. Quel sette adesso è un tetto.
>
> **La B e la C sono sei clic.** Un comando ti scrive i passi esatti sui due repo, coi nomi veri dei controlli. Cambia un punto solo: nella B ti aggiungi a chi può scavalcare, nella C lasci vuoto.
>
> **Cosa serve da te.** La lettera, e girare tu l'interruttore: l'ho riprovato oggi, GitHub ha detto no su tutti e due. Consiglio la B.
>
> **Di quanto fidarti.** Che tu riesca davvero a scavalcare si vede solo al primo lavoro dopo averla accesa.
>
> `node cervello/serratura-ramo.mjs --istruzioni`

---

### 🟡 #172 — Centoquarantotto difetti sono chiusi con una prova che non può diventare rossa · ⏳ accodata 2026-08-24 11:45

**In parole semplici.** Il collaudo di ieri ha misurato una cosa che nessuno aveva contato: **148
difetti risultano chiusi, ma la prova che dovrebbe sorvegliarli non può diventare rossa**. Settantotto
non hanno nessun comando da eseguire, settanta hanno solo una parola cercata dentro un file. Se uno
di quei 148 si riapre domani, non se ne accorge nessuno: nella Cabina resta scritto «chiuso».

In più il cancello conta **98 schede riparate la cui prova non è mai stata rotta apposta**. Nessuno ha
mai visto quella prova diventare rossa, quindi nessuno sa se funziona.

**Un esempio di cosa vuol dire.** Il 23 luglio un difetto chiuso a giugno si era riaperto e l'ha
scoperto un collaudatore un mese dopo, per caso: è la scheda AR-142, i permessi della sessione più
larghi del dovuto. La sua prova c'era ed era buona — solo che nessun processo la rilanciava.

**Cosa cambia per te.** Il numero di difetti chiusi che vedi nella Cabina è più ottimista della
realtà: dentro ci sono 148 chiusure che nessuno sta sorvegliando. Non vuol dire che siano tornate —
vuol dire che se tornassero, lo scopriresti tu e non la macchina.

**Cosa devi fare.** Scegliere quanto vale la pena spendere, perché sono lavoro a mano:

- **(a) Tutte e 148**, riaperte e riprovate una per una. È il lavoro più lungo e non entra nei sei
  giorni che restano al 29 agosto.
- **(b) Solo le gravi e le bloccanti**, che sono quelle che se tornano fanno danno vero.
- **(c) Nessuna adesso.** Da oggi però il cantiere non chiude più un difetto grave senza una prova
  a comando. Così il numero smette di crescere mentre pensiamo al resto.

**Se va bene:** la mia raccomandazione è **(c) subito e (b) dopo il 29**. Il tappo prima
dell'asciugatura: la regola nuova è già scritta nel mansionario del cantiere, manca solo la tua parola
per applicarla ai lotti di questi giorni.

**Cosa non ho verificato.** I 148 li ho contati leggendo il cantiere, non li ho riaperti uno per uno:
alcuni potrebbero essere davvero risolti e non avere bisogno di niente. E il conteggio delle 98 mai
rotte apposta viene dal cancello, che lo stampa a ogni consegna — non l'ho ricalcolato a mano.

**Dettagli tecnici.** Fonte: lettura di `cantiere-difetti.json` del 23/8 (578 chiusi con
`verifica.comando`, di cui 561 dentro la suite che il cancello rilancia; 78 senza comando; 70 con
`file+pattern`) e riga `mutazione-mancante` del cancello. Referti del collaudo:
`consegne/audit/2026-08-23-collaudo-tre-freni/`. Regola nuova: `.claude/skills/cantiere/SKILL.md` ⑦ter.

---

<!-- muro-negozi-due-sql-in-ordine -->
### 🔴 #168 — Riaccendi il server che fa lavorare la macchina: tace dal 25 settembre · ⏳ accodata 2026-08-22 20:25 · riscritta 2026-10-16 18:30

**In parole semplici.** Il server è il computer affittato da Hetzner che fa lavorare la macchina da sola. Non prende lavori dal
25 settembre. Il 7 ottobre si è svegliato per 25 secondi, poi più niente. Nelle ultime 24 ore il database della memoria l'ha
chiamato solo la Cabina. In coda aspettano 72 lavori, il più vecchio del 26 settembre.

**Cosa cambia per te.** Finché resta spento non parte niente da solo: né il giro, né i ritmi del giorno, né le sentinelle.
La macchina lavora solo quando apri una sessione. Il 24 settembre avevi firmato questa card dal Pannello, ma il Pannello l'ha
messa «in coda» come se partisse da sola. Non è partito niente: questi passi si fanno solo con le tue mani.

**Cosa devi fare.** In quest'ordine, senza saltare.

- **Prima, la console Hetzner.** Guarda se il server è acceso e se il conto è pagato. Se è spento, leggi lì il motivo prima di riaccenderlo.
- **Poi salva il suo lavoro, prima di toccare i servizi.** Riavviare aggiunge modifiche e rischia di perdere quelle che ha sul disco.
- **Infine aspetta la riparazione del freno sulla spesa, prima di far ripartire il worker.** Dall'11 al 25 settembre quel freno
  ha rifiutato 269 lavori, e alla riaccensione scatterebbe di nuovo. La riparazione arriva in una richiesta di unione.
- **Dimmi cosa hanno stampato i comandi**, e riparto da lì.

**Se va bene.** Recupero io in una richiesta di unione il lavoro salvato. Poi il server riprende i lavori arretrati e la memoria
torna a pubblicarsi da sola.

**Cosa non ho verificato.** Il server non lo vedo da qui: non so se è acceso, se il disco è pieno o se ha ancora le credenziali
del motore AI. Vedo solo che non chiama più il database.

**Dettagli tecnici** (per chi esegue, dal terminale del server):

```bash
ssh root@162.55.51.250
systemctl status mycity-worker mycity-worker-chat --no-pager
systemctl list-timers 'mycity-*' --no-pager
journalctl -u mycity-worker -n 50 --no-pager
df -h ; last reboot | head -5
sudo bash /opt/mycity/ad-mycity/cervello/vps/diagnostica-completa.sh
# salva il lavoro chiuso sul disco, senza forzare:
cd "$(systemctl show -p WorkingDirectory --value mycity-worker)"
git log --oneline origin/main..HEAD | wc -l
git push origin HEAD:refs/heads/memoria/vps-2026-10-16
ls -la .git/MYCITY_RUN_LOCK-* 2>/dev/null   # lucchetto del giro rimasto appeso?
```

Fonti, lette il 15-16/10 in sola lettura dal database della memoria: `worker:ultimo` = 2026-10-07 15:37:09; ultima attività
continua 2026-09-25 12:32:56; ultimo lavoro vero dalla coda 2026-09-09 12:17; 72 lavori in attesa e un giro orfano «in corso»
dal 25/9. Il ramo di salvataggio `memoria/vps-2026-09-03` chiesto il 3/9 non è mai nato. Il lavoro dal 2/9 al 10/9, 377 commit,
è su `origin/fix/ar-046-mutazione-cieca`, mai unito. L'aggiornamento del 10/10, «ha lavorato fino al 28/9», era sbagliato: il
28/9 hanno chiamato solo Vercel e Amazon. Il giro orfano si tratta con `cervello/vps/recupera-lavori-orfani.sh`. Se il motore
AI risponde «auth»: `bash cervello/vps/collega-claude.sh`. Schede: AR-518, AR-978, AR-980, AR-981, AR-982, AR-983. Referto completo:
`consegne/salute/2026-10-16-visita-completa-macchina.md`. Le versioni precedenti di questa card sono nella storia di git.

---

### 🔴 #165 — Scrivi i dati veri del titolare: l'informativa privacy esce col nome «MyCity» e basta · ⏳ accodata 2026-08-22 14:10

**Cosa cambia:** l'informativa privacy, i termini e la pagina dei contatti leggono il nome, la sede,
la partita IVA, il numero camerale, la PEC e il capitale sociale da nove caselle di configurazione.
Nessuna delle nove era dichiarata. Il codice ripiega su un generico «MyCity» e le righe che non ha
le salta, quindi la pagina esce senza errori e sembra a posto.

Un'informativa privacy senza i dati di chi tratta i dati non è un'informativa. È la prima cosa che
un'ispezione guarda.

Adesso le nove caselle sono dichiarate, ma vuote, e la pagina di salute del sito risponde
«degradato» finché restano vuote: almeno la cosa si vede.

**Cosa devi fare:** darmi i valori veri. Servono: denominazione esatta, indirizzo della sede,
partita IVA, numero REA se c'è, PEC, capitale sociale, l'indirizzo email per le questioni di
privacy, e il nome di chi risponde (tu, se resta come hai detto il 20 agosto).

⚠️ **Una cosa importante sui tempi:** questi valori entrano dentro il sito nel momento in cui viene
**ricompilato**, non quando li scrivi. Vanno messi **prima** della prossima pubblicazione,
altrimenti restano vuoti nel sito pubblicato anche se sono scritti nel pannello.

**Se va bene:** li metto fra le variabili del progetto e faccio ripubblicare. Poi controllo
l'informativa e i termini a schermo, e la pagina di salute torna verde.

---

### 🟡 #164 — Guarda cosa dice Supabase sulle copie di sicurezza: sono cinque minuti e chiudono quattro righe vuote · ⏳ accodata 2026-08-22 14:10

**Cosa cambia:** il documento che spiega come si ripristinano i dati ha quattro righe che dicono
«da verificare», e la data del controllo dice «mai fatto». Sono le righe che rispondono alla
domanda più importante del documento: se domani succede qualcosa ai dati, da dove si riparte.

Oggi ho tolto da quel file una contraddizione: in cima diceva «sul piano gratuito il ripristino al
minuto non c'è», e venti righe più sotto lo elencava fra le cose che ci sono. Due righe che si
escludono, nello stesso documento. Adesso ne resta una sola. Ma resta un buco: cosa c'è davvero non
lo sa nessuno.

Nello stesso giro ho scoperto che **la copia notturna del database non partiva più**, e l'ho
riparata: il programma che la fa era di una versione più vecchia del database e si rifiutava di
lavorare. Il primo collaudo vero è stanotte.

**Cosa devi fare:** aprire Supabase, andare su **Settings → Billing** e poi su **Database →
Backups**, e dirmi tre cose: che piano abbiamo, se c'è il ripristino al minuto, quante copie
giornaliere conserva.

**Se va bene:** riempio le quattro righe con la data del controllo, e da lì si vede se conviene
passare al piano a pagamento oppure no.

> 📌 **19/10 18:58:** il piano adesso è il Pro (lettura di Supabase alle 18:50). Restano da guardare in «Database → Backups» le copie giornaliere e il ripristino al minuto.

---

### 🔴 #162 — Un posto dove tenere una copia delle foto dei prodotti · ⏳ accodata 2026-08-22 09:20

**Cosa cambia:** le immagini dei prodotti **non hanno nessuna copia**. Né uno script, né un passo
del lavoro notturno, né un secchio nostro. La documentazione diceva il contrario: «perdita zero,
ripristino immediato». È il tipo di riga più pericoloso in un documento di emergenza. Chi la legge
smette di cercare la copia. Quella riga adesso dice la verità.

Se il progetto Supabase sparisce, spariscono con lui tutte le foto, e con loro ogni scheda del
catalogo: rifarle vuol dire richiamare **ogni** negoziante a rifotografare tutto.

**Cosa devi fare:** dire dove metterle. Serve un secchio di destinazione (un altro fornitore, non
lo stesso) e le sue chiavi. Il comando di copia è già scritto in `docs/backup-restore.md`, sezione
«Storage backup»: oggi è un piano, non una rete.

**Se va bene:** aggancio la copia delle foto al lavoro notturno che già copia il database. Poi la
prova di ripristino mensile, che da oggi gira da sola, comincia a coprire anche le immagini.

---

### 🔴 #161 — Le tre chiavi di Vercel, e poi una parola: così in produzione ci va solo ciò che ha passato i controlli · ⏳ accodata 2026-08-22 09:20 · 🔁 riscritta 2026-10-16 12:40

> 🔓 **2026-10-24 01:30 — Il database è allineato, e il segreto del database su GitHub adesso funziona.** Il passo 2 qui sotto, `"main": false`, non aspetta più la carta #191. Per il passo 1 mancano ancora le tre chiavi di Vercel.

> ⚠️ **2026-10-16 12:40 — Prima unisci la #206.** La guardia che aspettavi è lì dentro. Poi accendi la regola «Main»: è la carta #177.

**Cosa cambia:** oggi ogni unione su `main` fa partire una pubblicazione di produzione entro pochi secondi, **senza aspettare i controlli**. Un test rosso finisce in produzione lo stesso. Il lavoro che dovrebbe pubblicare dopo i controlli è rosso a ogni unione dal 1° settembre, perché gli mancano i segreti.

**Cosa devi fare, in questo ordine** (al contrario il sito smette di aggiornarsi e basta):

1. GitHub → Settings → Secrets → Actions. Servono quattro segreti.
   · `VERCEL_TOKEN`: lo crei su Vercel, in Account Settings → Tokens. È una password: non devo vederla.
   · `VERCEL_ORG_ID` = `team_O5b1EUNnEQWvcXSNlos567lo` e `VERCEL_PROJECT_ID` = `prj_XvKD8R89QzA7qVyOhltfS85SH4k9`, letti da me sul progetto.
   · `SUPABASE_DB_URL`: la riga del «Session pooler» (Supabase → Connect), la stessa della #134. Senza, dopo la #206 il rilascio si ferma con un errore invece di pubblicare codice su un database vecchio.
2. **Solo dopo aver allineato il database (carta #191)**, in `vercel.json`: `"main": true` diventa `"main": false`.

**Se va bene:** l'unica strada per la produzione diventa «controlli verdi → migrazioni applicate → pubblicazione».

**Cosa non ho verificato.** Che i due identificatori bastino per un rilascio vero: li ho letti, non provati. Gli aggiornamenti vecchi, del 28/8 e del 7/9, li trovi nel registro delle decisioni.

---

### 🔴 #154 — Copia su Vercel le nove chiavi di Supabase, Stripe, Resend e Upstash: senza, il sito non registra un ordine · ⏳ accodata 2026-08-22 09:56 · riscritta 2026-10-10 15:50

> ⏸️ **2026-10-24 14:20 — La chiave di servizio, aspetta il mio via.** Oggi alle 13:40 in produzione c'erano 12 variabili, e la chiave di servizio non c'era. Senza, ogni rotta che chiede l'accesso risponde «non disponibile». Ma il giorno che arriva, partono insieme dieci lavori notturni e si svegliano cose che oggi dormono. Prima le preparo io: i passi in ordine sono nella #210.

> ➕ **2026-10-19 08:45 — Dopo la richiesta 259 del sito, la chiave di servizio serve anche al profilo pubblico.** Senza, la pagina del profilo dice «non trovato». Oggi nessuno l'ha acceso, quindi non tocca nessuno.

> ➕ **2026-10-16 12:40 — Dopo la #206 le chiavi di Stripe sono due:** la seconda è `STRIPE_CONNECT_WEBHOOK_SECRET`, per gli avvisi sui conti dei negozi. Passi nella stessa guida.

> ⚠️ **2026-10-12 17:55 — La chiave di Supabase nasce con la #203:** è la nuova `sb_secret_`. Mai ricopiare la vecchia «Legacy», neanche da Render. Qui restano 8 chiavi.

**Cosa cambia:** con la tua firma «Fai la #154» ho messo su Vercel le 8 chiavi che potevo creare
io: l'indirizzo del sito con il «www», quattro chiavi interne, la coppia per le notifiche e il tetto
di spesa per l'AI. Adesso ce ne sono 12 su 21. Le 9 che mancano le rilascia un servizio esterno, e
le vede solo chi entra nel suo pannello. La più importante è la chiave di servizio del database:
senza, Stripe incassa ma l'ordine non nasce. Quando ripartono i lavori automatici partono anche 7
email vecchie, ferme da giugno e agosto, e 3 promemoria di carrelli. Soldi non se ne muovono: non
ci sono ordini fermi né versamenti da fare.

**Se va bene:** copi le 9 chiavi seguendo i passi in `consegne/salute/2026-10-10-chiavi-vercel.md`,
una decina di minuti. Su Stripe l'indirizzo degli avvisi di pagamento deve avere il «www», perché
Stripe non segue i rimandi. Poi mi scrivi «fatto 154»: ripubblico la stessa versione di oggi e
controllo che il sito risponda e che i lavori automatici ripartano. Se vuoi, scrivi anche «annulla
le email vecchie».

> Storia: accodata il 22/8, quando dopo il passaggio da Render il sito scriveva «localhost» come suo
> indirizzo. Il 10/10 alle 09:30 ho letto la lista vera: 4 chiavi su 21. Alle 15:43 ne ho aggiunte 8.

---

### 🟡 #150 — Il server tornerà a parlare con GitHub, e poi guardiamo cosa c'è nei 7.849 cassetti · ⏳ accodata 2026-08-21 20:05

**In parole semplici:** questa carta parla del server, la macchina accesa che lavora quando tu non ci
sei. Ogni minuto controlla se su GitHub è arrivato qualcosa di nuovo e se lo prende. Stasera abbiamo
scoperto che ha smesso di farlo, e ho trovato il perché.

Quando deve aggiornarsi e trova del lavoro a metà, il server lo mette in un cassetto per fare spazio.
Poi dovrebbe riaprirlo. Non l'ha mai riaperto. Ne aveva **7.849**, e se n'è accorto da solo stasera.

**Un esempio di cosa vuol dire.** Alle 19:31 hai lanciato il comando che allinea il server. Ha
provato, ha messo un cassetto da parte, non ce l'ha fatta lo stesso, e ha lasciato lì il cassetto.
Un minuto dopo ha rifatto la stessa cosa. Così dal 18 agosto.

**Cosa cambia per te:** il server è indietro rispetto a GitHub e non riesce a recuperare. Ha quattro
suoi lavori fermi che non ha mai pubblicato. Finché resta così, tutto quello che unisci non gli
arriva — ed è il motivo per cui stasera nessun comando funzionava.

**Cosa c'era rotto, in due pezzi.** Il primo: il server metteva nel cassetto le cose sbagliate.
L'ostacolo vero restava dov'era, e l'aggiornamento falliva comunque. Il secondo è peggiore. Nessuno
riapriva mai quel cassetto. In tutto il programma non esisteva una riga che lo facesse.

**Cosa devi fare.** Prima metti in pausa le sentinelle per due minuti. Girano ogni minuto e usano
git: è quello che ha fatto fallire il tuo commit di stasera.

```
sudo systemctl stop mycity-watch-main.timer mycity-sentinella.timer mycity-sentinella-dati.timer mycity-sentinella-motore.timer
cd /opt/mycity/ad-mycity
git fetch origin main && git checkout origin/main -- cervello/vps/aggiorna-cervello.sh cervello/allineamento-esito.sh
sudo bash cervello/vps/aggiorna-cervello.sh
```

Cerca in fondo la frase **«✓ Commit pendenti pubblicati su GitHub»**. Se compare, il server è tornato
in linea e i suoi quattro lavori sono salvi.

**Poi guardiamo nei cassetti, senza buttare niente:**

```
cd /opt/mycity/ad-mycity
node cervello/stash-dimenticate.mjs --riassunto
```

Ti dice quanti contengono **memoria vera**, cioè lavoro scritto dal server, e quanti solo file che si
riscrivono da soli. I primi non si toccano finché non decidiamo insieme. Con quel numero ti dico io
cosa recuperare.

**Alla fine riaccendi le sentinelle:**

```
sudo systemctl start mycity-watch-main.timer mycity-sentinella.timer mycity-sentinella-dati.timer mycity-sentinella-motore.timer
```

**Cosa non ho verificato:** che sul server funzioni. Da qui non ci arrivo. Ho provato la riparazione
su copie vere costruite apposta: rimettendo il difetto la prova diventa rossa e conta i cassetti che
crescono, uno, due, tre. Con la riparazione restano zero e il server pubblica.

**Se va bene:** il server torna a ricevere quello che unisci e a pubblicare quello che scrive. E da
domani un guardiano suona da solo se i cassetti ricominciano ad accumularsi.

*(La #144 e la #142 nel frattempo si sono chiuse per conto loro: le trovi segnate ✅ più sotto.)*

---

### 🔴 #143 — Il server lavora, ma cinque sveglie su sei non suonano più · ⏳ accodata 2026-08-21 15:02 · ✏️ riscritta 17:05

> **In due righe.** Il server è tornato a lavorare da solo. La prima versione di questa carta diceva
> «riaccendilo», ed era sbagliata. Il guasto vero è un altro: cinque delle sue sei sveglie non
> suonano più, e due erano già rotte da prima.

> ⚠️ **La correzione, e va detta per prima.** Alle 15:02 questa carta diceva «riaccendi il server, è
> fermo da tre giorni». **Non è più vero.** Il server è ripartito da solo nel pomeriggio: ha scritto
> l'ultima volta alle **16:46**, tre minuti prima che me ne accorgessi.
>
> L'avevo dato per morto guardando il suo riflesso. Il riflesso era l'ultimo referto che aveva
> pubblicato, fermo a lunedì mattina. I suoi commit di oggi, intanto, erano lì da vedere.
>
> È lo stesso errore che ho passato la giornata a riparare negli altri: guardare un dato vecchio e
> chiamarlo stato di adesso. E il merito del ritorno non è mio. Il disco era pieno, e l'hai liberato
> tu a mano.

**In parole semplici.** Questa carta parla del server, cioè il computer sempre acceso che fa
lavorare la macchina quando tu non ci sei. Serve a dirti quale sua parte funziona e quale no.

Il server adesso lavora. Il suo lavoro principale si chiama **giro**: guarda i dati e prepara le
cose, ed è partito oggi alle 16:33. Quello che non funziona sono le **sveglie**. La macchina ha sei
orari fissi in cui deve alzarsi da sola, e cinque non suonano più da lunedì 18 agosto.

Quali dormono, e da quanto:

| La sveglia | A che ora dovrebbe suonare | Ferma da |
|---|---|---|
| Piano del mattino | 06:00 | 83 ore |
| Controllo di mezzogiorno | 12:00 | 101 ore |
| Report della sera | 18:00 | **191 ore** (8 giorni) |
| Review del venerdì | venerdì 15:00 | **338 ore** (14 giorni) |
| Monitoraggio | 06:30 | 82 ore |
| La visita di salute del server | 06:45 e 20:45 | 82 ore |

L'ultima colonna dice una cosa in più. Il blocco del disco è cominciato lunedì 18, cioè circa 82 ore
fa. Ma il report della sera è fermo da 191 ore e la review del venerdì da 338: **più del doppio e
più del quadruplo.** Vuol dire che quei due erano già morti prima, e il disco pieno non c'entra.

**Cosa cambia per te.** Non ricevi più il piano del mattino, né il report della sera. E la review
del venerdì non lascia i suoi quattro compiti: il confronto coi migliori, la peer review fra senior,
la calibrazione, e la lettera a te. Sono fermi da quasi un mese.

Un esempio di cosa vuol dire in pratica. Venerdì 8 agosto la review avrebbe dovuto lasciarti una
lettera con cosa era andato bene e cosa no nella settimana. Non l'ha lasciata. Nemmeno il 15. La
prossima sarebbe venerdì 22, cioè domani, e senza questa carta non arriverebbe neanche quella.

Il server intanto lavora, quindi da fuori sembra tutto acceso. È il motivo per cui nessuno se n'era
accorto per quattordici giorni.

**Cosa devi fare.** Un comando solo, che ti dice quali sveglie sono spente e perché:

```
cd /opt/mycity/ad-mycity
systemctl list-timers 'mycity-*' --all
```

Le sveglie da guardare sono sei: `mycity-ritmo-mattino`, `mycity-ritmo-mezzogiorno`,
`mycity-ritmo-sera`, `mycity-ritmo-settimana`, `mycity-monitora`, `mycity-salute`.

Se accanto leggi `disabled` o `not-found`, **non serve digitarle a mano**: c'è già un copione che le
rimette a posto tutte insieme.

```
cd /opt/mycity/ad-mycity
sudo bash cervello/vps/install-ritmo-timers.sh
sudo systemctl enable --now mycity-monitora.timer
```

⚠️ **La terza riga non è un doppione, ed è la cosa che ho scoperto preparando questa carta.** Il
copione del ritmo rimette in piedi tutte le sveglie tranne una: **il monitoraggio non è nel suo
elenco.**

Le sveglie del server le installano due copioni diversi. Ognuno ha il suo elenco scritto a mano: il
ritmo in uno, il giro e il monitoraggio nell'altro. Chi rilancia solo il primo si ritrova il
monitoraggio spento e non se ne accorge. Una sveglia che non esiste non dà errore: non fa niente, e
da fuori sembra che vada bene.

Ho messo un freno perché non succeda con la prossima: `cervello/test/sveglia-che-nessuno-installa.test.mjs`
diventa rosso se qualcuno aggiunge una sveglia e si dimentica di metterla in uno dei due elenchi.

Se invece risultano `active` ma non partono, il problema è in quello che ci gira dentro e non nella
sveglia: allora serve questo, che dice l'errore vero:

```
cd /opt/mycity/ad-mycity
systemctl status mycity-ritmo-sera.service && journalctl -u mycity-ritmo-sera -n 40 --no-pager
```

**Se va bene:** domani mattina ricevi di nuovo il piano delle sei, e venerdì la review lascia i suoi
compiti. Il pallino «le cadenze si alzano davvero» torna verde da solo.

**Cosa non ho verificato.** Le sveglie non le posso vedere da qui: da questa sessione non arrivo a
`systemctl`. Quello che ho misurato è **l'effetto** — l'orario dell'ultima volta che ognuna ha
prodotto qualcosa, letto dentro i file che scrive. Quindi *non so* se siano spente, o accese ma con
un errore dentro: sono due guasti diversi con due cure diverse, ed è per questo che il primo comando
qui sopra guarda prima di toccare. So per certo che il worker è vivo, perché i suoi commit di oggi
li leggo.

**Dettagli tecnici** — prova: `node cervello/freschezza-cadenze.mjs` · unità in
`cervello/vps/mycity-*.timer`, tutte scritte correttamente nel repo (fuso dichiarato,
`Persistent=true`), quindi la causa è sul server · ultimo commit del server: `66dab11`, 21/08 16:46.

---

### 🟡 #120 — Avvisa il fornaio: c'è un circuito welfare gratis a cui può iscriversi subito · ⏳ accodata 2026-08-17 14:05

**Cosa cambia:** a Piacenza esiste già un programma chiamato "Piacenza Pay". Lo gestisce
360Welfare, un'azienda nazionale di buoni pasto, insieme alle 4 associazioni di commercianti
della città. Il programma fa arrivare ai negozi i soldi del welfare aziendale dei dipendenti:
buoni pasto, buoni acquisto. Per il negozio aderire è **gratis**. Paga solo una piccola parte
quando un cliente spende davvero. Non c'entra niente con MyCity: Pane Quotidiano potrebbe
iscriversi oggi stesso, senza aspettare che i nostri pagamenti Stripe siano accesi. È un canale
di soldi in più che il fornaio oggi non sta prendendo.

**Testo pronto da inoltrare (WhatsApp o di persona):**
> «Ciao! Volevo segnalarti una cosa che ho trovato. A Piacenza c'è un programma gratuito chiamato
> "Piacenza Pay". Lo gestisce 360Welfare insieme a Confindustria, Confapi, Confesercenti e
> Confcommercio Piacenza. Fa arrivare ai negozi i buoni pasto e i buoni acquisto welfare dei
> dipendenti delle aziende della zona. Per il negozio è gratis iscriversi, non c'è nessun canone.
> Paghi solo una piccola percentuale quando un cliente spende davvero. Basta scrivere a
> piacenzapay@360welfare.it per iscriverti. Non c'entra con MyCity, è un programma separato — ma
> ti porta clienti e soldi in più senza costo, quindi ti conviene comunque farlo. Fammi sapere se
> vuoi che ti aiuti a scrivere la mail.»

**Se va bene:** lo mandi tu al fornaio. Hai il suo numero, 0523388601 — quando preferisci: ora,
oppure quando riprendi il lavoro operativo il 24/8-1/9. Non costa niente a MyCity e non tocca
nessun paletto: è un consiglio a un partner su un servizio esterno.

**Cosa non ho verificato:** due cose. Se Piacenza Pay ha già negozi come panetterie o gastronomie
bio nel suo circuito. E se la percentuale sulla transazione è alta o bassa — l'articolo dice solo
"nessun costo di ingresso", non parla della commissione sulla vendita.

- **Colore:** 🟡. È un messaggio a una persona reale fuori da MyCity (il fornaio), anche se il
  costo e il rischio sono quasi zero.
- **Reparto:** intelligence
- **Origine:** `{origine:playbook-intelligence-17-8, fonte:piacenza24.eu+ilpiacenza.it+360welfare.it, briefing:90-Memoria-AI/Briefing/2026-08-17-intelligence.md}`

---

### 🟡 #119 — Una tua guardia non si sveglia mai prima che io deleghi lavoro a un senior · ⏳ accodata 2026-08-17 13:35

**Cosa cambia:** ho trovato un buco piccolo ma reale nei tuoi controlli automatici. Il file
`.claude/settings.json` dice a una guardia (`pre-scrittura.mjs`) di svegliarsi prima che io usi lo
strumento chiamato "Task". Ma in questa sessione lo strumento che uso per delegare lavoro a un senior
si chiama "Agent", non "Task". La guardia non riconosce il nome e non si sveglia mai: ogni volta che
delego un compito a un senior, quella guardia salta senza che nessuno se ne accorga. Non è grave da
solo — un'altra guardia (`cancello-senior.mjs`) controlla comunque il risultato quando il senior
finisce — ma il controllo PRIMA della delega manca sempre, silenziosamente, da quando esiste questo
file.

**Se va bene:** incolli tu il blocco corretto (non posso scrivere `.claude/settings.json` da sola, è
bloccato apposta). Basta aggiungere `Agent` accanto a `Task` nella riga del matcher. Nel file, cerca
la sezione `"PreToolUse"` e sostituisci questo pezzo:
```
"matcher": "Bash|Task|mcp__.*",
```
con:
```
"matcher": "Bash|Task|Agent|mcp__.*",
```
È l'unica riga da cambiare, dentro il primo gruppo di `PreToolUse` (quello agganciato a
`pre-scrittura.mjs`).

**Cosa non ho verificato:** non ho controllato se altri repository o altre sessioni con questo stesso
file di permessi hanno lo stesso problema — l'ho trovato solo qui, lavorando su un'altra cosa.

- **Colore:** 🟡 — tocca la configurazione dei tuoi controlli di sicurezza interni, non soldi né dati
  di clienti; è comunque un file che io non posso scrivere da sola per regola tua.
- **Reparto:** AD (trovato dal cancello di fine turno, non da un senior)
- **Origine:** `{origine:cancello-stop-turno-17-8, file:.claude/settings.json, sezione:hooks.PreToolUse}`

---

### 🔴 #118 — Manda il comunicato di lancio a un giornale, ma prima dammi due citazioni vere · ⏳ accodata 2026-08-17 13:20

**Cosa cambia:** ho scritto il comunicato per raccontare alla stampa che MyCity sta nascendo e che Pane
Quotidiano, in Via Calzolai, è il primo negozio a bordo. L'ho controllato un'ora fa sul database vero.
Il negozio esiste. Ha 5 prodotti veri in vendita: per esempio l'hummus di ceci a 2,95€ e il pesto
genovese a 5€. Ma oggi un cliente non può ancora pagare. I pagamenti Stripe sono spenti sul suo
profilo, esattamente come il 10 agosto. Per questo il comunicato NON dice "ordina ora": dice che il
progetto sta nascendo e i pagamenti si accendono nelle prossime settimane. È la versione onesta. Se
scrivessi "puoi già comprare" e un giornalista lo verifica, troverebbe un carrello che non si chiude.
In una città piccola, un errore così non si perdona una seconda volta.

**Se va bene:** appena mi dai le due cose che mancano (sotto), lo mando prima a un giornale online
(PiacenzaSera, il più adatto per una prima uscita leggera) per costruire il "già uscito su…". Tengo da
parte l'esclusiva più pesante per Libertà per quando ci sarà la notizia vera e grande: il primo ordine
pagato per davvero.

**Cosa devi fare — due cose, non posso farle io:**
1. **La tua citazione da fondatore.** Ho scritto una proposta di due frasi nel testo del comunicato
   (`consegne/pr-stampa/2026-08-17-comunicato-nasce-mycity-piacenza.md`). Leggila e dimmi se va bene
   così o riscrivila con le tue parole vere: una citazione finta o generica si vede subito.
2. **Una frase vera del titolare di Pane Quotidiano**, con il suo ok esplicito a comparire con nome e
   cognome sul giornale. Il numero del negozio letto oggi dal database è 0523388601. Bastano 2-3 frasi
   raccolte al telefono o passando in negozio — non posso inventarle io, sarebbe la cosa che brucia di
   più la fiducia di un giornalista se se ne accorge.

Ci sono altri 4 dettagli minori in fondo al file del comunicato: una foto vera, un contatto stampa
dedicato, la data precisa di attivazione pagamenti, e quale numero di desertificazione usare (ho
trovato due cifre diverse in due file del vault, -22,6% e -20,4%, non ancora riconciliate). Non
bloccano quanto le prime due, ma vanno chiusi prima dell'invio vero.

**Cosa non ho verificato:** il numero "-22,6% di negozi in 12 anni" viene dalla ricerca che hai
consegnato tu l'11/8. Non sono riuscita ad aprire il PDF originale per vederne la fonte primissima:
quale ente l'ha misurato, in che anno. Se un giornalista chiede "fonte esatta?", oggi non ho la
risposta pronta. Non ho nemmeno un contatto diretto di nessun giornalista di Piacenza. Ho verificato
solo le caselle email ufficiali delle redazioni (via web, il 17/8), non i nomi delle persone.

- **Colore:** 🔴 — è la voce pubblica dell'azienda verso un giornalista, in una città dove tutti si
  conoscono: resta ferma finché non dai le due citazioni e poi il via libera esplicito.
- **Reparto:** pr-stampa
- **Origine:** `{origine:playbook-stampa-settimana-17-8, invocazione:6, gate:invariato-dal-2026-06-24, file:consegne/pr-stampa/2026-08-17-comunicato-nasce-mycity-piacenza.md}`

---

### 🟡 #104 — Correggi 5 righe nelle tue regole di permesso: è il motivo per cui il giro fallisce da quasi due settimane · ⏳ accodata 2026-08-16 07:20 · 🔄 refresh 2026-08-21 14:50

*Nota: rinumerata da #81 alle 11:12 (collideva col vecchio #81 tabellare "Merge PR #714", mai riutilizzabile).*

**Cosa cambia:** il 4 agosto avevo trovato perché i giri restavano bloccati o scadevano. Cinque righe nel file dei miei permessi dicono "Write" invece di "Edit". Il controllo dei permessi riconosce solo "Edit" per chi scrive file. Per questo, ogni volta che il giro prova a scrivere in memoria, consegne, creativi, cervello o Pannello, il permesso non scatta. Te l'avevo segnalato allora. Non potevo correggerlo da sola: è una protezione voluta, contro il rischio che mi allarghi i permessi da sola. Sono passati 12 giorni. Le righe sono ancora "Write". Ho ricontrollato oggi, 16 agosto. Il giro continua a fallire con lo stesso identico errore. L'ultimo fallimento registrato è del 14/8 alle 11:16. Prima ancora, uno ogni due ore circa, per giorni. Il checkup di salute della macchina è fermo per lo stesso motivo, da oltre 26 ore: non riesce più a scrivere il suo referto.

**Se va bene:** il giro torna a scrivere la memoria regolarmente. Il checkup di salute torna a pubblicarsi da solo. Il Pannello smette di mostrare dati vecchi spacciati per dati di oggi.

**Cosa fare.** Apri `.claude/settings.local.json` sul VPS e in queste 5 righe cambia la parola "Write" in "Edit" (lascia tutto il resto uguale):
```
Write(MyCity-Vault/90-Memoria-AI/**)  →  Edit(MyCity-Vault/90-Memoria-AI/**)
Write(consegne/**)                    →  Edit(consegne/**)
Write(creativi/**)                    →  Edit(creativi/**)
Write(cervello/**)                    →  Edit(cervello/**)
Write(pannello/**)                    →  Edit(pannello/**)
```
Il file non è nel repo: è dentro `.gitignore`. Va modificato a mano sul VPS, non con una PR.

**Cosa non ho verificato:** non ho potuto testare il giro dopo la correzione. Serve il VPS, e io scrivo da un ambiente cloud senza quei permessi. Non so nemmeno se qualcos'altro, oltre a queste 5 righe, contribuisce ai fallimenti. Ho verificato solo che questo stesso errore compare in ogni fallimento registrato dal 12/8 in poi.

**Riconferma 21/8 14:50 — ancora aperta, 5 giorni dopo, e si allarga.** La sentinella macchina segnalava "6 cadenze ferme da quasi 14 giorni" (ritmo-mattino, giro, monitora, ritmo-mezzogiorno, ritmo-sera, ritmo-settimana). Ho controllato che non fosse un falso allarme (mi era già capitato con altri sensori): non lo è. `auto-coscienza/esito-cadenze.json` mostra davvero ogni cadenza ferma al 18/8 (l'ultima riga fresca è "giro" delle 08:36 di quel giorno), anche se il file stesso risulta toccato oggi e anche se in queste ore la memoria si sta pubblicando lo stesso (ultimi commit 14:40/14:44/14:48) — segno che il giro "leggero" di oggi gira, ma il passo che scrive il proprio esito in quel file resta bloccato, stessa causa di questa card. Prova in più di oggi: ho provato a lanciare `systemctl list-timers` per controllare i timer del ritmo sul VPS, come chiede questa stessa card, ed è stato respinto dal controllo permessi prima ancora di partire — il buco non blocca più solo le mie scritture in memoria/cervello/pannello, blocca anche i comandi con cui verificherei se i timer sono vivi. Non ho toccato altro: nessuna nuova card, la diagnosi e la cura restano quelle di sopra.

(dettaglio: vedi memoria `project-settings-local-write-vs-edit-blocca-lavori.md`; prova: `MyCity-Vault/90-Memoria-AI/auto-coscienza/motore-errori.json`, `MyCity-Vault/90-Memoria-AI/auto-coscienza/esito-cadenze.json`)

**Riconferma 21/8 15:35 — stesso blocco, e il freno verificabile esiste già.** Ho riprovato io stessa `node cervello/salute.mjs`: respinto subito, "richiede approvazione", nessuna scrittura possibile. Il file `.claude/settings.local.json` ha ancora le stesse 5 righe `Write(...)` alle righe 24-28. Non serve costruire un nuovo controllo: `cervello/permessi-check.mjs` (regola `forma-file-non-applicata`, AR-562) individua già esattamente questo pattern e diventa rosso se lo trova — è il freno che la card chiede, ma può leggerlo solo chi gira SUL VPS (il file è locale, fuori dal repo). **Cosa fare in più, in un solo giro:** dopo aver cambiato le 5 righe, lanciare sul VPS `node cervello/permessi-check.mjs` — se esce pulito (exit 0) la correzione è confermata dal proprio guardiano, non solo "a occhio".

<!-- posthog-off-vps -->

---

### 🟡 #76 — Apri gli occhi delle sessioni cloud su Cabina e marketplace · ⏳ accodata 2026-08-13 00:30

**Cosa cambia:** quando lavoro da una sessione cloud (come stasera), 7 controlli della visita restano pallini bianchi: «non l'ho potuto vedere da qui». Il motivo è doppio. L'ambiente cloud non ha la rete per raggiungere la Cabina e i database. E non ha le chiavi per leggerne i dati. La parte che non richiedeva niente da te l'ho già fatta: l'indirizzo della Cabina ora è scritto nel repo, la variabile non serve più. Restano due cose che può toccare solo il proprietario dell'ambiente, cioè tu. Si fanno dalle impostazioni dell'ambiente su claude.ai/code (rotellina dell'ambiente → rete e variabili):

**1) Rete (allowlist di uscita).** Aggiungi questi tre host: servono alla visita per bussare alla Cabina e ai database. Ho misurato stasera: oggi il proxy risponde «Host not in allowlist».
```
ad-mycity.vercel.app
clmpyfvpvfjgeviworth.supabase.co
xjljcsorpbqwttrejqte.supabase.co
```
Solo con questo, i 2 pallini della Cabina diventano verdi (o rossi veri, se un giorno è giù davvero): l'indirizzo ora lo trova da sola.

**2) Variabili d'ambiente — facoltativo, servono solo per la vista sui DATI.** Due livelli, scegli tu fin dove arrivare:
- **Minimo (rischio basso):** `MARKETPLACE_SUPABASE_URL = https://clmpyfvpvfjgeviworth.supabase.co` e `MARKETPLACE_SUPABASE_KEY = <la chiave “anon/publishable” del progetto Mycity>`. La chiave la trovi su supabase.com → progetto Mycity → Project Settings → API Keys → anon. È la chiave PUBBLICA di sola lettura, la stessa che gira nel browser del sito. Accende il pallino «La macchina vede i dati veri».
- **Completo (fidati di più):** anche `SUPABASE_URL = https://xjljcsorpbqwttrejqte.supabase.co` e `SUPABASE_SERVICE_KEY = <service key del progetto ad-mycity>`. Accende anche coda e battito del worker visti dal cloud. ⚠️ Questa però è una chiave PADRONA: scrive tutto. Darla alle sessioni cloud è una scelta di fiducia, non un dovere. Senza, quei controlli restano pallini dichiarati e li legge comunque il VPS.

**Se va bene:** la prossima visita da una sessione cloud passa da copertura ~63% a ~85-100%. E i pallini spariscono per il motivo giusto: perché ho guardato davvero, non perché ho smesso di dichiararli.

**Serve da te:** i tre host in allowlist (2 minuti). Le variabili solo se vuoi anche la vista sui dati dal cloud.

- **Colore:** 🟡 — impostazioni del TUO ambiente claude.ai. Le tocchi solo tu: io non posso e non devo.
- **Reparto:** devops-sre + security
- **Origine:** `{origine:salute-2026-08-12, controlli:cabina.viva+cabina.cuore+sensori.vista+worker.coda+worker.battito}`

<!-- permessi-push-e-supabase-da-rinominare -->

---

### 🟡 #74 — 5 righe nuove nel foglio dei permessi del server, nessuno le ha ancora dichiarate · ⏳ accodata 2026-08-12 22:35

**Cosa cambia:** il test che sorveglia i permessi è diventato rosso. Nel foglio dei permessi del server sono comparse cinque righe nuove. Tre permettono il push esplicito su main e sui rami. Due aprono gli strumenti Supabase che scrivono, coi nomi nuovi del server. Nessuna delle cinque aveva un perché scritto da nessuna parte. Il guardiano le ha viste comparire e ha bloccato la prova, come deve fare. I nomi esatti stanno qui sotto nella nota tecnica.

**Se va bene:** il perché di ogni riga l'ho già scritto nel registro del debito. Così il test torna verde senza fingere che il problema non esista. La decisione vera resta tua, su due domande. Prima domanda: il push diretto su main va bene così com'è? Il giro sul VPS lo fa già, ed è dichiarato nel manuale. Oppure va ristretto? Seconda domanda: i due strumenti Supabase che scrivono servono davvero alla macchina? O erano pensati solo per letture? Nel secondo caso vanno tolti, o sostituiti con la versione che legge soltanto.

**Serve da te:** una parola per ciascuna delle due domande. Io non posso toccare il foglio dei permessi: è negato in scrittura alla macchina, apposta.

**Nota tecnica:** trovato riparando il vincolo HARD test-cervello di questo giro (5 test rossi su 1096, uno era questo). File: `.claude/settings.local.json` righe `Bash(git push origin main/feature/*/fix/*:*)` + `mcp__supabase-memoria__execute_sql` + `mcp__supabase-marketplace__execute_sql`. Registro debito aggiornato nello stesso lavoro: `cervello/permessi-debito.json`.
- **Colore:** 🟡 — tocca solo la dichiarazione del debito. I permessi veri restano tuoi.
- **Reparto:** security
- **Origine:** `{origine:giro-2026-08-12, guardiano:permessi-di-guardia.test.mjs}`

<!-- avvisi-permessi-nelle-analisi -->

---

### 🟡 #69 — Dimmi quali piani riscrivo, e in che ordine · ⏳ accodata 2026-08-10 16:15

**Cosa cambia:** i tuoi dieci piani non vengono rivisti dal 24-25 giugno, e adesso so anche cosa dicono di sbagliato: **48 frasi smentite dai fatti**, su nove piani su dieci. Ho messo l'avviso in cima a ognuno, così quando lo apri lo vedi subito, ma **il testo non l'ho toccato**: riscrivere un tuo piano è una revisione tua. La più urgente è il **Piano Istituzionale**, che apre dicendo che il Bando Commercio ER è aperto fino al 21 luglio. Quel bando è chiuso dal 23 giugno — due giorni prima che tu scrivessi quel piano. E il **Piano Vendite** lo ha trasformato in una frase da dire al negoziante: «lo Stato rimborsa il 40%, ma chiude il 21 luglio». È l'unica di queste frasi che può uscire di casa e arrivare a un commerciante vero: se qualcuno la usa, promette soldi che non esistono più.
**Se va bene:** dimmi da quale partire e li rifaccio io, uno per volta, portandoti ogni volta la versione nuova da leggere prima che sostituisca la vecchia. Il mio ordine sarebbe: **① Piano Vendite** (15 frasi, ed è quello che parla ai negozianti) · **② Piano Istituzionale** (8, e apre con la frase sbagliata) · **③ Piano Editoriale** (8, tutte sul negozio-faro) · poi gli altri. Se invece preferisci rivederli tu, l'avviso in cima ti dice riga per riga cosa correggere. Se non facciamo niente, l'avviso resta lì: non è un problema tecnico, è che i piani restano vecchi.
**Nota tecnica:** motore `cervello/piani-verita.mjs` (gira a ogni giro, `--scrivi` riscrive gli avvisi). Le cinque famiglie di smentite: bando ER dato per aperto (17 frasi), negozio-faro ancora Garetti/Casa Linda invece di Pane Quotidiano (20), commissione 12% invece del 10% deciso il 20/7 (4), fotografia del 25/06/2026 presentata come «oggi» (4), PI26 dato per aperto (3, tutte dentro il blocco che rigenera l'AD). Ogni regola cita il fatto in `registro-fatti.json` e ne stampa la fonte. Solo il Piano Prodotto è pulito.
- **Colore:** 🟡 (riscrive testo del vault che è tuo: nessun invio a nessuno, ma la firma sul contenuto è tua)
- **Reparto:** AD + relazioni-istituzionali (bando) · vendite (pitch) · content-social (faro)
- **Origine:** `{origine:piani-verita, seguito-di:PR-690}`

<!-- sensori-spenti-senza-motivo -->

---

### 🟡 #66 — Dimmi se questi occhi della macchina li vuoi accesi o no · ⏳ accodata 2026-08-10 12:16 · 🔄 refresh 2026-08-16 23:52

**Cosa cambia:** ci sono strumenti già costruiti che non stanno guardando niente: `mcp_supabase`, `telegram_bot`. Non sono rotti — non sono mai stati accesi, e non risulta che tu abbia deciso di lasciarli spenti: semplicemente nessuno te l'ha chiesto. È già successo: i controlli che dicono se il sito e il Pannello sono in piedi sono rimasti spenti per 163 giri di fila, e nessuna card te l'ha mai detto.

**Se va bene:** mi dici per ognuno «acceso» o «lasciamolo spento». Se dici spento lo scrivo come una tua decisione e non te lo richiedo mai più. Se dici acceso ti dico l'unica riga che serve per farlo partire.

**Nota tecnica:** difetti AR-105 e AR-108. I motivi vivono in `cervello/sensori-motivi.json` e il guardiano `sensori-spenti-check.mjs` resta rosso finché uno spento non dice perché. Questa card non si ripete: se c'è già, non se ne accoda un'altra.
- **Colore:** 🟡 (accende un controllo in sola lettura, non manda niente a nessuno)
- **Reparto:** devops-sre
- **Origine:** `{origine:auto-radiografia, difetti:AR-105+AR-108}`

<!-- cancello-stop-ancora-ferma-al-4-8 -->

---

### 🟡 #65 — Il cancello di fine-turno accusa lavoro vecchio di 6 giorni come se fosse di oggi · ⏳ accodata 2026-08-10 11:35

**Cosa cambia:** Stasera il cancello di fine turno (`cervello/cancello-stop.mjs`) mi ha accusato di una dimenticanza. Diceva che non avevo accodato in questa pagina gli allarmi delle PR #675, #678, #679, #680, #681, #683. Ho controllato riga per riga: sono TUTTE già qui. Alcune ci sono da sei giorni (righe 1636-1639 e i blocchi `#pr-675`/`#pr-678` più sopra). Il cancello non guarda «cosa ho fatto io in questo turno». Guarda tutto quello che è successo sul ramo dall'ultima volta che ha trovato la cartella di lavoro **completamente pulita**. Quel giorno è il 4/8. Da allora alcuni file JSON dei sensori automatici cambiano da soli a ogni giro (`sentinella-dati.json`, `coerenza-fatti.json`, `apprendimento.json`, `auto-miglioramento.json`, `cervello/routing.json`). Non restano mai fermi abbastanza a lungo da farla apparire «pulita». Risultato: da 6 giorni ogni sessione si becca lo stesso elenco di 397 commit e 170 file come se fosse tutto suo. Anche cose già chiuse da altri.

**Se va bene:** Un tecnico decide una delle due cure. (a) Il punto di riferimento del cancello si pianta quando restano sporchi solo i file dei sensori automatici. Serve una lista di eccezioni nota. (b) Il punto di riferimento avanza da solo a ogni commit pubblicato, non solo quando l'albero è vuoto. Non è urgente. Per ora ogni sessione deve verificare a mano, come ho fatto io, prima di rifare lavoro già fatto.

**Conferma 14/8 08:41 — stesso bug.** Questa volta con un worker VPS attivo in parallelo alla sessione. Il cancello di fine-turno ha rimproverato questa stessa sessione per readability peggiorata su file mai toccati (`Intelligence/eventi-picchi.md`, `Intelligence/leve-uscita.md`). Quei file erano stati riscritti nel frattempo da un giro leggero del worker VPS (`cervello/monitora.md`), non da questa sessione di chat. Stessa causa già diagnosticata sopra: il punto di riferimento del cancello resta al 4/8 perché i file dei sensori non stanno mai fermi. Con un worker concorrente attivo, il problema si aggrava. Ora il cancello attribuisce a una sessione anche il lavoro di un processo automatico indipendente. Non ho aperto un fix di codice: è fuori dal vincolo tasso-di-chiusura, che vieta ricerche nuove in questo giro. Ho solo corretto la leggibilità dei paragrafi segnalati, mio e altrui, per superare il cancello senza intaccare la sostanza.

- **Colore:** 🟡 (fix di codice in `cervello/cancello-stop.mjs`, serve branch+PR)
- **Reparto:** tech
- **Origine:** `{origine:sessione-2026-08-10-vittoria-winback, ancora:3bda15ad5b5b0be5c920fe926341c08b1a0cc8e9, commit-non-contati:397}`

🔧 Dettagli tecnici: due funzioni sono coinvolte. Sono `ancoraDelTurno()` e `piantaAncora()`. Vivono in `cervello/cancello-stop.mjs`, righe ~661-701. L'ancora avanza solo su turni con `git status --porcelain` vuoto. La funzione che controlla questo stato si chiama `alberoSporco()`. Verificato ora: `git rev-list --count 3bda15ad..HEAD` = 397. L'ultimo commit reale del ramo è `f13968f22` (11:24:38). L'ancora resta ferma al `3bda15ad` del 2026-08-04 00:11. Le 6 PR citate dal cancello risultano già in coda: righe 1636-1639 (679/680/681/683). Più i blocchi `#pr-675`/`#pr-678` sopra. Nota 17/8: questo è il motivo per cui i collaudi di fine turno di oggi appaiono enormi (centinaia di file) — l'ancora è ferma qui, non riflette il lavoro del turno.

<!-- sorvegliante-esenzione-vault -->

---

### 🟡 #42 — Togli alla macchina il permesso di eseguire qualunque programma si scriva da sola · ⏳ accodata 2026-07-29 18:50 · aggiornata 2026-10-25 16:32

**Cosa cambia:** nel foglio dei permessi (`.claude/settings.json`) ci sono due righe col jolly: `node cervello/*.mjs` e `bash cervello/*.sh`. Queste righe non dicono «può lanciare questi programmi». Dicono «può lanciare qualunque programma finisca in quella cartella» — e quella cartella la scrive la macchina stessa. I freni veri (la pausa, la tua firma, il controllo su chi riceve un messaggio) stanno dentro ai singoli programmi. Con il jolly si può arrivare a un programma senza passare dal freno che contiene. Non sto dicendo che sia già successo. Sto dicendo che oggi nessuno lo impedirebbe. **Novità 13/8:** il jolly non è solo un rischio — è anche il motivo per cui `test-cervello.mjs`, `gate-veri.mjs`, `pota-apprendimento.mjs` e altri restano bloccati da un'approvazione che in sessione chat non arriva mai (documentato ~16 volte in [[STATO]] dal 4/8). Applicare questa card li sblocca anche per questo.
**Se va bene:** sostituisci le due righe col jolly con i due blocchi qui sotto. Poi lanci `node cervello/permessi-check.mjs` e quella segnalazione sparisce. Da lì in avanti, se serve un programma nuovo, aggiungi il permesso a mano. Aggiungere una riga si vede. Il jolly no.

**⚠️ Aggiornato il 25/10: l'elenco qui sotto era indietro di 19 programmi** (il 23/8 lo era di 51). Dieci erano entrati nel documento ma non in questa card. Nove non li vedeva lo strumento che rifà l'elenco. Adesso una prova diventa rossa se questa card resta indietro rispetto a chi lancia.

Al posto di `"Bash(node cervello/*.mjs:*)"` — 134 righe:

```json
      "Bash(node cervello/adozione-medicine.mjs:*)",
      "Bash(node cervello/agent-registry-check.mjs:*)",
      "Bash(node cervello/allinea-scan-cantiere.mjs:*)",
      "Bash(node cervello/allocazione-check.mjs:*)",
      "Bash(node cervello/apprendimento-guardiano.mjs:*)",
      "Bash(node cervello/auto-fix.mjs:*)",
      "Bash(node cervello/avviso-telegram.mjs:*)",
      "Bash(node cervello/banco-ai.mjs:*)",
      "Bash(node cervello/battito-esterno.mjs:*)",
      "Bash(node cervello/bilancio-vivo.mjs:*)",
      "Bash(node cervello/bottega/scelta-worker.mjs:*)",
      "Bash(node cervello/bottega/testo-lavoro.mjs:*)",
      "Bash(node cervello/c4-cancelli.mjs:*)",
      "Bash(node cervello/calibrazione.mjs:*)",
      "Bash(node cervello/cancello-lotto.mjs:*)",
      "Bash(node cervello/cantiere-prove.mjs:*)",
      "Bash(node cervello/capacita.mjs:*)",
      "Bash(node cervello/chiudi-sito.mjs:*)",
      "Bash(node cervello/chiusura-loop.mjs:*)",
      "Bash(node cervello/ci-stato.mjs:*)",
      "Bash(node cervello/coerenza-fatti.mjs:*)",
      "Bash(node cervello/coerenza-rischi.mjs:*)",
      "Bash(node cervello/collega-marketplace.mjs:*)",
      "Bash(node cervello/conflitti-memoria.mjs:*)",
      "Bash(node cervello/contesto-lezioni.mjs:*)",
      "Bash(node cervello/conto-motore.mjs:*)",
      "Bash(node cervello/conto-token.mjs:*)",
      "Bash(node cervello/correzione-nicola-gate.mjs:*)",
      "Bash(node cervello/costo-ai.mjs:*)",
      "Bash(node cervello/cristallizza-apprendimento.mjs:*)",
      "Bash(node cervello/cronicita-allarmi.mjs:*)",
      "Bash(node cervello/deferral-agenti.mjs:*)",
      "Bash(node cervello/delta-gate.mjs:*)",
      "Bash(node cervello/due-case.mjs:*)",
      "Bash(node cervello/entrate-senza-cancello.mjs:*)",
      "Bash(node cervello/errore-motore.mjs:*)",
      "Bash(node cervello/esegui-azione.mjs:*)",
      "Bash(node cervello/esito-cadenza.mjs:*)",
      "Bash(node cervello/esito-claim.mjs:*)",
      "Bash(node cervello/esito-scrittura.mjs:*)",
      "Bash(node cervello/esperimenti-check.mjs:*)",
      "Bash(node cervello/firma-check.mjs:*)",
      "Bash(node cervello/freno-costi.mjs:*)",
      "Bash(node cervello/freno-scattato.mjs:*)",
      "Bash(node cervello/freschezza-cadenze.mjs:*)",
      "Bash(node cervello/freschezza-checklist.mjs:*)",
      "Bash(node cervello/freschezza-intelligence.mjs:*)",
      "Bash(node cervello/freschezza-okr.mjs:*)",
      "Bash(node cervello/freschezza-rischi.mjs:*)",
      "Bash(node cervello/freschezza-segnali.mjs:*)",
      "Bash(node cervello/gate-veri.mjs:*)",
      "Bash(node cervello/git-merge.mjs:*)",
      "Bash(node cervello/git-pr.mjs:*)",
      "Bash(node cervello/guardiani-check.mjs:*)",
      "Bash(node cervello/guardiano-capacita.mjs:*)",
      "Bash(node cervello/guardiano-tempo.mjs:*)",
      "Bash(node cervello/housekeeping-azioni.mjs:*)",
      "Bash(node cervello/housekeeping-stato.mjs:*)",
      "Bash(node cervello/intelligence-agenda.mjs:*)",
      "Bash(node cervello/istante-cancello.mjs:*)",
      "Bash(node cervello/keyword-owner-check.mjs:*)",
      "Bash(node cervello/letargo.mjs:*)",
      "Bash(node cervello/lezione-nuova.mjs:*)",
      "Bash(node cervello/macchina-del-tempo.mjs:*)",
      "Bash(node cervello/mappa-macchina.mjs:*)",
      "Bash(node cervello/marketplace.mjs:*)",
      "Bash(node cervello/metabolismo.mjs:*)",
      "Bash(node cervello/midollo-spinale.mjs:*)",
      "Bash(node cervello/no-path-cablati-check.mjs:*)",
      "Bash(node cervello/non-vacuita.mjs:*)",
      "Bash(node cervello/north-star-check.mjs:*)",
      "Bash(node cervello/notifica-approvazioni.mjs:*)",
      "Bash(node cervello/onesta-check.mjs:*)",
      "Bash(node cervello/pacchetti-lotto.mjs:*)",
      "Bash(node cervello/pagella-intelligenza.mjs:*)",
      "Bash(node cervello/pausa-check.mjs:*)",
      "Bash(node cervello/percorsi-git.mjs:*)",
      "Bash(node cervello/peso-contesto.mjs:*)",
      "Bash(node cervello/peso-file-cabina.mjs:*)",
      "Bash(node cervello/piani-data.mjs:*)",
      "Bash(node cervello/piani-verita.mjs:*)",
      "Bash(node cervello/porte-check.mjs:*)",
      "Bash(node cervello/pota-apprendimento.mjs:*)",
      "Bash(node cervello/pota-memoria.mjs:*)",
      "Bash(node cervello/prediagnosi.mjs:*)",
      "Bash(node cervello/prossima-card.mjs:*)",
      "Bash(node cervello/prova-sito.mjs:*)",
      "Bash(node cervello/prova-trigger.mjs:*)",
      "Bash(node cervello/prove-oneste.mjs:*)",
      "Bash(node cervello/radiografia-in-corsa.mjs:*)",
      "Bash(node cervello/registra-cadenza.mjs:*)",
      "Bash(node cervello/registro-scelte-check.mjs:*)",
      "Bash(node cervello/retry-policy.mjs:*)",
      "Bash(node cervello/riconcilia-perimetro.mjs:*)",
      "Bash(node cervello/rotte-scriventi-check.mjs:*)",
      "Bash(node cervello/salute.mjs:*)",
      "Bash(node cervello/sblocco-capacita.mjs:*)",
      "Bash(node cervello/scadenzario-check.mjs:*)",
      "Bash(node cervello/scan-segreti.mjs:*)",
      "Bash(node cervello/schede-pacchetto.mjs:*)",
      "Bash(node cervello/scritture-a-rischio.mjs:*)",
      "Bash(node cervello/senior-sola-lettura.mjs:*)",
      "Bash(node cervello/sensore-cassa.mjs:*)",
      "Bash(node cervello/sensori-spenti-check.mjs:*)",
      "Bash(node cervello/sentinella-budget.mjs:*)",
      "Bash(node cervello/sentinella-fonti.mjs:*)",
      "Bash(node cervello/serratura-ramo.mjs:*)",
      "Bash(node cervello/si-capisce.mjs:*)",
      "Bash(node cervello/sincronizza-proposte.mjs:*)",
      "Bash(node cervello/sistema-immunitario.mjs:*)",
      "Bash(node cervello/sonda-volano.mjs:*)",
      "Bash(node cervello/spazza-temporanei.mjs:*)",
      "Bash(node cervello/spazzata-fratelli.mjs:*)",
      "Bash(node cervello/stampo-check.mjs:*)",
      "Bash(node cervello/stash-dimenticate.mjs:*)",
      "Bash(node cervello/supervisione-negozi.mjs:*)",
      "Bash(node cervello/sync-worker-plugins.mjs:*)",
      "Bash(node cervello/tasso-chiusura.mjs:*)",
      "Bash(node cervello/tasso-lezioni.mjs:*)",
      "Bash(node cervello/taste-file.mjs:*)",
      "Bash(node cervello/test-cervello.mjs:*)",
      "Bash(node cervello/test-pannello.mjs:*)",
      "Bash(node cervello/test/battito-esterno.test.mjs:*)",
      "Bash(node cervello/test/i-freni-di-spesa-scollegati.test.mjs:*)",
      "Bash(node cervello/test/il-testo-di-bottega-non-porta-l-altro-negozio.test.mjs:*)",
      "Bash(node cervello/test/lotto-a-pacchetti-conto.test.mjs:*)",
      "Bash(node cervello/test/lucchetto-per-corsia.test.mjs:*)",
      "Bash(node cervello/test/pw-driver.mjs:*)",
      "Bash(node cervello/uscite-check.mjs:*)",
      "Bash(node cervello/utilizzo-senior.mjs:*)",
      "Bash(node cervello/valida-contratti.mjs:*)",
      "Bash(node cervello/vault-sanita.mjs:*)",
      "Bash(node cervello/verifica-avversariale.mjs:*)",
      "Bash(node cervello/verifica-sensori.mjs:*)",
```

Al posto di `"Bash(bash cervello/*.sh:*)"` — 17 righe:

```json
      "Bash(bash cervello/giro.sh:*)",
      "Bash(bash cervello/installa-bats.sh:*)",
      "Bash(bash cervello/installa-hooks.sh:*)",
      "Bash(bash cervello/ritmo.sh:*)",
      "Bash(bash cervello/vps/aggiorna-cervello.sh:*)",
      "Bash(bash cervello/vps/collega-claude.sh:*)",
      "Bash(bash cervello/vps/collega-cursor.sh:*)",
      "Bash(bash cervello/vps/diagnostica-completa.sh:*)",
      "Bash(bash cervello/vps/giro-ora.sh:*)",
      "Bash(bash cervello/vps/install-ritmo-timers.sh:*)",
      "Bash(bash cervello/vps/recupera-lavori-orfani.sh:*)",
      "Bash(bash cervello/vps/riconcilia-memoria.sh:*)",
      "Bash(bash cervello/vps/ritmo-ora.sh:*)",
      "Bash(bash cervello/vps/setup.sh:*)",
      "Bash(bash cervello/vps/test-agent.sh:*)",
      "Bash(bash cervello/vps/test-giro-prompt.sh:*)",
      "Bash(bash cervello/vps/watch-main.sh:*)",
```
**Aggiunto il 23/8: nello stesso foglio ci sono altre tre righe**, e con quelle si chiude anche **AR-142**, l'altro bloccante sui permessi. Una gesto sola per tutt'e due. ① Manca il divieto di spingere sul ramo principale: aggiungi al `deny` le righe `"Bash(git push origin main:*)"` e `"Bash(git push --force:*)"`. Ho scelto il divieto **mirato** e non `git push` intero, perché la macchina deve poter spingere sul suo ramo — altrimenti non può più aprirti una richiesta. ② Nell'`allow` c'è `mcp__Supabase__execute_sql`, che **modifica** il database: consiglio di toglierlo, ho controllato e nessuno script della macchina lo usa. ③ Cinque righe usano `Write(...)` dove il programma vuole `Edit(...)`: sono quelle che stampano l'avviso a ogni avvio, e la protezione vera è già lì accanto. Il dettaglio di tutt'e tre sta nel documento.

**Nota tecnica:** difetti AR-206 parte (a) e AR-142. Il documento intero, con il perché, sta in `consegne/sicurezza/2026-07-29-permessi-senza-jolly.md` — ed è GENERATO da `cervello/permessi-elenco.mjs`, non più tenuto a mano. Il lotto 33 ha verificato la parte (b). È la regola `no-jolly-su-cartella-scrivibile` in `cervello/permessi-check.mjs`. Esiste già e funziona: segnala correttamente entrambe le forme. La parte (a) non l'ho fatta io di proposito. `.claude/settings.json` è negato in scrittura alla macchina apposta (regola `no-auto-permessi`). Scavalcare quel confine per chiudere un difetto sul confine sarebbe stato assurdo. Restano fuori due parti, infrastrutturali, per un lotto a sé: il controllo di provenienza su ogni script, e le chiavi tenute fuori dall'ambiente del worker.
- **Colore:** 🟡 (restringe i permessi della macchina: non manda niente a nessuno, ma va provato che il giro continui a girare)
- **Reparto:** security + devops-sre
- **Origine:** `{origine:lotto-33-perimetri, difetto:AR-206}`

<!-- radiografia-comando-rotto -->

---

### 🔴 #24 — Accendi la sveglia intelligence (bandi alle 7 + Telegram) · ⏳ accodata 2026-07-20 12:02

**Playbook:** `consegne/intelligence/PLAYBOOK-ACCENSIONE-2026-07-20.md` (**PR #496 ✅ mergiata 17:44** — codice su main)

1. Importa in n8n il workflow **n.41** (RSS bandi — file aggiornato, non più stub)
2. Aggiungi `TELEGRAM_BOT_TOKEN` e `TELEGRAM_CHAT_ID` in n8n
3. Test workflow → se ok **Active** (messaggio alle 7:00 solo se ci sono bandi)
4. Stesso per workflow **n.31** (card Da approvare → Telegram) — sblocca le notifiche pendenti

**Cosa cambia:** intelligence ti avvisa da sola su bandi e scadenze, senza chiedere in chat.
**Se va bene:** domani mattina ricevi il riassunto bandi su Telegram; ogni nuova card 🔴 arriva subito.

- **Colore:** 🔴 (chiavi Telegram + Active n8n)
- **Reparto:** builder-automazioni / intelligence

---

---

### 🟡 #15 — Definisci zona, orario e ordine minimo per la prima consegna · ⏳ accodata 2026-07-18 06:30

- **▶️ Pausa finita:** rinvio negozi · classe **business** · riprende con `ripresa.lavoro-operativo`

**Contesto:** Bici presto operativa (settimana 21-25/7). Prima di accettare ordini dal pubblico serve definire: raggio max (es. 3 km dal centro), fasce orarie (es. 12-14 / 18-20), ordine minimo (es. €10).

**Cosa decide Nicola:** 3 parametri (raggio, fascia, minimo). L'AD li imposta poi via `cervello/marketplace.mjs`.

**Cosa cambia:** evita over-promise al primo cliente. Regole chiare = primo ordine evadibile senza imprevisti.

**Se va bene:** parametri impostati → attivi per il lancio.

**Canale:** decisione Nicola → l'AD applica 🟢

---

---

---

---

### 🟡 #13 — Invia la welcome email ai 4 iscritti via Gmail · ⏳ accodata 2026-07-18 06:30

- **▶️ Pausa finita:** rinvio negozi — gate su PQ operativo · classe **business** · riprende con `ripresa.lavoro-operativo`

**Contesto:** **4 clienti iscritti** (correzione Nicola 19/7 — non 23) non hanno mai ricevuto un messaggio da MyCity. Nessuna welcome email. Rischio: si dimenticano di noi.

**Gate:** PQ deve essere pronto ad evadere ordini (conferma da Nicola). Senza PQ operativo, rimandare.

**Cosa fare:** recupera le 4 email da /admin/users del Pannello → invia via Gmail BCC. Testo: `consegne/crm/welcome-email-23.md` (da adattare al numero reale 🟢 prima dell'invio).

**Cosa cambia:** 4 clienti ricevono il primo messaggio → 1-2 risposte/click attesi → 1 primo ordine entro 48h.

**Se va bene:** 1 ordine completato → sblocca tutto il funnel (recensioni, referral, reputazione).

**Canale:** email manuale via Gmail BCC

<!-- ordine-test-pq -->

---

### 🟡 #9 — Aggiungi il burn mensile nel .env VPS per calcolare il runway · ⏳ accodata 2026-07-17 23:35

**Da aggiungere in `cervello/vps/.env` sul VPS (poi riavviare il worker):**

Hai due opzioni — scegli quella che rispecchia la realtà di oggi:

**A) Costi infrastruttura confermati da Nicola (20/7/2026, valore aggiornato 21/7 con dominio incluso)** — Claude 200 + Vercel 30 + Supabase 50 + VPS 20 + dominio ~2 = **302 €/m** (Render in dismissione → marketplace su Vercel):
```
BURN_MENSILE_EUR=302
```

**B) Burn Anno 1 proiettato** (fondatore parzialmente pagato + marketing, da vault):
```
BURN_MENSILE_EUR=3000
```

**Comando completo (una riga nel terminale VPS):**
```bash
echo "BURN_MENSILE_EUR=302" >> /opt/mycity/ad-mycity/cervello/vps/.env && sudo systemctl restart mycity-worker-chat.service
```
_(302 = Claude 200 + Vercel 30 + Supabase 50 + VPS 20 + dominio ~2 — fonte unica: registro-fatti.json, confermato Nicola 20/7, aggiornato 21/7; aggiorna se Vercel sale dopo migrazione marketplace)_

**Cosa cambia:** il sensore smette di essere "sconosciuto" da 128 giri — calcola `runway = cassa / burn`. Oggi cassa=0€ → runway=0 mesi (critico) finché non entra liquidità. Il Pannello mostra il numero reale invece del punto interrogativo.

**Se va bene:** il sensore-cassa produce risultato valido al prossimo giro; la sentinella "runway < 3 mesi" si attiva se serve.

- **Colore:** 🟡 (modifica file .env sul VPS — Nicola lo fa dal terminale)
- **Reparto:** finanza/AD
- **Nota:** se il burn reale è diverso dai due valori sopra, indicalo tu e aggiorno.

<!-- inserisci-tazzina-pq -->

---

### 🟡 #8 — Inserisci tazzina espresso decorata su Pane Quotidiano · ⏳ accodata 2026-07-17 10:10 · aggiornata 2026-07-17 12:52

- **▶️ Pausa finita:** rinvio negozi · classe **business** · riprende con `ripresa.lavoro-operativo`

**Prodotto:** tazzina da espresso bianca con decorazioni colorate (blu/rosso, stile decorativo italiano) — PQ vende la tazzina stessa (oggetto fisico), non il caffè.

**Bloccato su:** Nicola deve dire QUALE tazzina è tra i due candidati trovati e il PREZZO:
- Candidato 1 — Excelsa "Stile Siciliano" (set 6 tazzine ~€31)
- Candidato 2 — Ginori 1735 "Oriente Italiano" (~€55-80 singola)

**Appena Nicola risponde:**
- Foto royalty-free già reperite, foto prodotto su sfondo bianco pronti
- L'AD prepara la riga prodotto e la accoda via `marketplace.mjs aggiorna` per approvazione finale

**Cosa cambia:** primo prodotto non-food a catalogo PQ inserito dall'AD con foto pro trovate online.
**Se va bene:** workflow "AD inserisce prodotto per il negozio" validato, replicabile su tutta la gamma PQ.

- **Colore:** 🟡
- **Reparto:** supervisione-negozi / onboarding-negozi

---

---

---

---

### 🔴 #7 — Ruota i token GitHub trovati in chiaro nel config git del VPS · ⏳ accodata 2026-07-17 03:30

**Cosa fare:** vai su GitHub → Settings → Developer settings → Personal access tokens → revoca i PAT attuali e crea uno nuovo se necessario.

L'AD ha trovato due PAT in chiaro nel file di configurazione git locale del VPS durante il fix dell'email. Non li ha scritti nella risposta, ma sono visibili a chiunque abbia accesso shell al server.

**Cosa cambia:** i vecchi token non potranno essere usati da terzi anche se il VPS fosse compromesso.
**Se va bene:** sicurezza ripristinata; se il PAT è lo stesso usato nei remote git, aggiornare il remote URL con il nuovo token.

- **Colore:** 🔴 (azione su account GitHub reale — Nicola)
- **Reparto:** security / devops-sre

<!-- fix-git-email -->

---

### 🟡 #5 — Crea script `cervello/vercel.mjs` per vedere Vercel dalla chat · ⏳ accodata 2026-07-17 02:15

**Cosa fare:**
Scrivere `cervello/vercel.mjs` — uno script Node che, usando `VERCEL_TOKEN` dall'env, chiama l'API REST Vercel (https://api.vercel.com/v6/deployments) e mostra lo stato e i log degli ultimi deploy. Poi aggiungere `node cervello/vercel.mjs` in allowlist in `settings.local.json`.

**Perché:** Nicola ha chiesto "come faccio a sbloccarti gli strumenti?" (17/7). La strada sicura è uno script dedicato per ogni API esterna — non `node -e` o `curl` generici. Dopo l'ok, lo scrivo e apro la PR.

**Cosa cambia:** dall'AD potrò interrogare Vercel (log build, errori, deploy status) senza bisogno di chiedere a Nicola di copiare il testo dell'errore.
**Se va bene:** build Vercel falliti diagnosticati in autonomia, senza blocchi.

- **Colore:** 🟡 (script nuovo + modifica allowlist → approvazione Nicola prima)
- **Reparto:** builder-automazioni

<!-- chiudi-pr-422 -->

---

## 🛡️ Supervisione negozi & prodotti — proposte di riempimento

> *Nota AD 14/8 08:41: questo banner era ripetuto 6 volte identiche (13/8 20:21, 21:29, 22:21 · 14/8 01:51, 06:21, 08:22), residuo di più giri consecutivi che non hanno trovato nulla di nuovo da proporre. Stesso pattern già visto e corretto una volta l'11/8. Unificato di nuovo in uno solo, tenuta la versione più recente.*

---

<!-- SUPERVISIONE-NEGOZI:INIZIO -->
## 🛡️ Supervisione negozi & prodotti — proposte di riempimento (aggiornato 2026-09-01 11:53)
Nessuna proposta di riempimento automatico in questo giro. Report: [[consegne/supervisione/2026-09-01-supervisione.md]].

> ⚠️ **Scritture al database: si approva un gruppo alla volta** (niente «ok a tutte»). Ogni gruppo
> è un valore DEDOTTO dalla macchina, non fornito dal negozio; per prezzo/orari/descrizione serve prima
> la conferma del dato dal negozio (restano «da procurare», non li scrive nessun autofill).
<!-- SUPERVISIONE-NEGOZI:FINE -->

---

| 179 | 2026-08-28 12:13 | @tech | Merge PR #853 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/853 | github | ✅ fatto: unita da Nicola il 2026-08-28 10:56 (letto su GitHub il 2026-10-10) | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |

---

> 🗄️ Le card chiuse stanno in [[AZIONI-archivio]]. Adesso sono 110.
> Il file è `MyCity-Vault/90-Memoria-AI/Archivio/AZIONI-archivio.md`.
