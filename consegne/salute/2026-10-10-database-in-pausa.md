---
tipo: diagnosi
data: 2026-10-10 09:30
reparto: "@devops-sre (con l'AD)"
card: "#199 in AZIONI-IN-ATTESA"
---

# I due database sono in pausa: per questo il sito non vende e la macchina tace

**In due righe.** Supabase ha messo in pausa il database del sito e quello della macchina. Si
riaccendono con un clic dal suo pannello, oppure lo faccio io se mi scrivi «ok 199».

## In parole semplici

Il sito e la macchina tengono i loro dati su Supabase, in due database separati. Uno è quello
del sito: negozi, prodotti, clienti, ordini. L'altro è la memoria della macchina: la coda dei
lavori, il battito, i conti.

Stamattina tutti e due risultano **in pausa**. Un database in pausa non risponde a nessuno.
Il sito si apre, ma non riesce a caricare negozi, prodotti e carrello. La Cabina si apre, ma non sa
più niente di quello che succede.

**Un esempio concreto.** Alle 08:57 ho chiesto al sito come sta, dalla sua pagina di controllo.
Ha risposto «non sto bene» (codice 503): non riesce a leggere il suo database. La home si apre, ma
nei riquadri dei negozi e delle categorie resta scritto «Stiamo caricando…». Un cliente che arrivasse
oggi da un volantino non vedrebbe nemmeno il pane di Pane Quotidiano.

## Cosa cambia per te

Finché restano in pausa, il sito non può vendere e la macchina non può lavorare. E c'è una
scadenza: Supabase tiene la riaccensione a un clic per **90 giorni dalla pausa**. Dopo, si può solo
scaricare una copia del database e rimontarla a mano su un progetto nuovo.

## Cosa devi fare

- **Apri la fatturazione.** supabase.com → organizzazione «mycity.inizioditutto» → Billing. Guarda
  se c'è una fattura non pagata o una carta scaduta. Se c'è, sistemala per prima: finché resta,
   i progetti non ripartono.
- **Riaccendi i due progetti.** Sono «Mycity», cioè il sito, e «ad-mycity», cioè la memoria. Su
  ognuno premi **Resume project**. In alternativa scrivimi **«ok 199»** e li riaccendo io da
   qui. Lo strumento per farlo ce l'ho. Pagare una fattura, invece, posso farlo solo tu.
- **Decidi se passare al piano Pro.** Con il piano Pro i database non si addormentano più. In più
  arrivano le copie di sicurezza giornaliere che oggi mancano: è la card #134. Il conto, dalla pagina
   dei prezzi di Supabase: 25 dollari al mese per il piano, più circa 10 dollari per ogni progetto,
   meno 10 dollari di crediti inclusi. Per due progetti fa **circa 35 dollari al mese**, cioè circa
   30 euro. È meno dei 50 € al mese che avevi messo in conto per Supabase.

**La mia raccomandazione: tutti e tre i passi, oggi.** Se resti sul gratuito e la macchina non
riparte, fra una settimana i due database si riaddormentano da soli. Il sito oggi non ha visitatori
che lo tengano sveglio.

## Cosa non ho verificato

- **Il giorno esatto della pausa.** Me lo direbbe solo la mail che Supabase ti ha mandato, o il
  pannello di Supabase. Quindi non so quanti dei 90 giorni restano. Il conto più prudente: la
  macchina ha smesso di scrivere il 1° settembre, e il piano gratuito aspetta una settimana di
  silenzio. La pausa quindi non è partita prima dell'8 settembre circa, e la scadenza non cade
  prima di inizio dicembre. È una stima, non una data letta.
- **Quale delle due cause.** Poca attività o fattura: lo vedi tu al passo 1.
- **Il sito visto da un browser vero.** La rete di questa sessione blocca il dominio del sito.
  Ho letto pagine e risposte con lo strumento di Vercel, che entra da un'altra porta.
- **Se dopo la riaccensione il sito registra davvero un ordine.** Su Vercel, fra le variabili del
  progetto del sito, ne vedo solo quattro: l'indirizzo pubblico del database, la sua chiave pubblica e
  le due chiavi anti-robot. La chiave di servizio del database, quelle di Stripe e quella della posta
  non le vedo. Potrebbero stare in un posto che da qui non leggo (le variabili condivise del team), ma
  se mancano davvero, riaccendere il database non basta: il sito mostra i prodotti ma non registra un
  ordine. È la card #154.

## Se va bene

Appena i database rispondono, faccio tre cose, in quest'ordine:

1. ricontrollo il sito: la sua pagina di controllo, la home, il catalogo di Pane Quotidiano;
2. rimisuro i numeri veri che oggi non posso leggere: ordini, clienti, negozi, prodotti;
3. passiamo alle due card che vengono subito dopo. La #191 porta il database del sito al passo
   del codice. La #154 rimette le chiavi che mancano su Vercel.

## Perché è successo — due strade possibili

- **Poca attività.** L'organizzazione Supabase di MyCity, «mycity.inizioditutto», è sul **piano
  gratuito**. Sul piano gratuito Supabase mette in pausa da solo un database che per una settimana
  riceve poche richieste. Prima avvisa con una mail, una settimana prima. La macchina interrogava
  tutti e due i database ogni giorno, e dal 1° settembre è ferma. Quindi da lì in poi nessuno li
  teneva svegli.
- **Una fattura non pagata.** Se una fattura di Supabase resta scoperta, Supabase mette in pausa i
  progetti e riporta l'organizzazione al piano gratuito. Il 20 luglio mi avevi confermato che
  Supabase ti costa 50 € al mese. Oggi però l'organizzazione risulta sul piano gratuito. Questa
  differenza è il motivo per cui vale la pena guardare la pagina della fatturazione prima di tutto.

Da qui non riesco a capire quale delle due. Lo vedi tu in un minuto, al passo 1 qui sotto.

---

## Dettagli tecnici

- **Supabase**, letto con lo strumento Supabase il 2026-10-10 alle 08:56: progetto `Mycity`
  (`clmpyfvpvfjgeviworth`, eu-west-3, Postgres 17) e progetto `ad-mycity` (`xjljcsorpbqwttrejqte`,
  eu-central-2, Postgres 17) → `status: INACTIVE` tutti e due. Organizzazione `xwbccbdkgcmdudcuxwdc`
  («mycity.inizioditutto») → `plan: free`.
- **Sito**, letto con lo strumento Vercel: `https://www.mycity-marketplace.com/api/health` → HTTP 503
  `{"status":"unhealthy","cron":{"ok":false,"stato":"non_letti","esaminati":0,"attesi":10,"error":"battiti non leggibili"}}`
  (2026-10-10 08:57). La home risponde 200 con i soli segnaposto «Stiamo caricando…», «Carico il
  negozio del mese…», «Carico le categorie…». Ultimo deployment di produzione: `dpl_Ez1mAY1U45UnDxjuWQQTHn5BHUq5`,
  2026-09-09 08:49, READY. Errori di esecuzione negli ultimi giorni: nessuno registrato.
- **Cabina**: `https://ad-mycity.vercel.app/api/cuore` → HTTP 200, `workerVivo:false`,
  `ultimoBattito:"2026-09-03 01:01"`, budget cieco con motivo «la memoria non risponde».
  `/api/worker-salute` → HTTP 500 a corpo vuoto.
- **Variabili Vercel** del progetto `mycity` (production), lette senza decifrare i valori:
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (2026-09-03 01:24),
  `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` (2026-09-07 09:20). `hiddenProductionEnvCount: 0`.
- **Fonti Supabase**: https://supabase.com/docs/guides/platform/free-project-pausing (pausa dopo 7
  giorni di bassa attività, mail di preavviso, 90 giorni per riaccendere) e
  https://supabase.com/docs/guides/platform/billing-faq (fattura scaduta → progetti in pausa e
  organizzazione riportata al gratuito; 25 $ il piano Pro, 10 $ di crediti, ~10 $ per progetto).
- **Comando per riaccendere**, con «ok 199»: lo strumento Supabase `restore_project` sui due id qui
  sopra. Non lo lancio senza la tua firma: tocca la produzione.
