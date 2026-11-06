---
data: 2026-11-06 02:10
tipo: elenco
fonte: AD digitale, su domanda di Nicola in chat il 6/11 («quali altri controlli molto utili ci possono essere?»)
metodo: tre cercatori con angoli diversi e un giudice che ha tolto i doppioni, ricontrollato le prove e messo in fila (run wf_b7ca6dd7-8c0)
---

# Dodici controlli da fare prima di aprire il 15/11, che nessuna radiografia del codice vede

**In due righe.** La radiografia legge il codice. Questi dodici controlli stanno fuori dal codice: nei pannelli dei fornitori, nella posta, al banco del fornaio. Quasi tutti li puoi fare solo tu, e quasi tutti costano meno di mezz'ora.

## In parole semplici

Tre agenti hanno cercato da tre lati: le cose fuori dal codice, cosa succede quando qualcosa si rompe, il primo giorno vero con le persone e i soldi. Un giudice ha tolto i doppioni e ha ricontrollato la prova di quelli in cima. Sono rimasti dodici controlli, tutti da fare prima del 15/11.

Un esempio. Lunedì 16/11 una cliente si iscrive per ordinare il pane. Per entrare deve cliccare il link di conferma che le arriva per email. Quel link però non lo spedisce il nostro servizio di posta, lo spedisce Supabase. Se nel pannello di Supabase non è impostata la nostra posta, il link non arriva, la cliente non entra e nessuno se ne accorge.

## Cosa cambia per te

| # | Il controllo | Chi | Quanto |
|---:|---|---|---|
| 1 | Nel pannello di Supabase, chi spedisce le email di iscrizione e di password dimenticata | tu | 15 minuti |
| 2 | Su Stripe, se i conti di MyCity e di Pane Quotidiano sono verificati | tu | 15-20 minuti |
| 3 | L'account da fattorino con cui consegnerai tu, approvato davvero | insieme | 30 minuti |
| 4 | Le email del sito arrivano nella posta in arrivo e non nello spam | insieme | 30 minuti |
| 5 | Al banco col fornaio: i cinque prodotti e la casella dove gli arriva l'ordine | tu | 30-40 minuti |
| 6 | Su GitHub, i token vecchi spenti | tu | 10 minuti |
| 7 | Le cinque caselle pubbliche del sito esistono, e l'indirizzo di supporto è su Vercel | tu | 15-20 minuti |
| 8 | Il foglio dei contanti e il controllo della sera per la prima settimana | insieme | un'ora la macchina, 5-10 minuti a sera tu |
| 9 | La scaletta del primo giro a mano degli 11 lavori a orario | insieme | un'ora più 30-45 minuti |
| 10 | Una sentinella fuori da Vercel e GitHub che guarda il sito ogni 5 minuti | tu | 20 minuti |
| 11 | Le due strade per tornare indietro: il database e il rilascio precedente | insieme | 30-40 minuti |
| 12 | Quando scadono il dominio, la posta e le carte che pagano i fornitori | tu | 15 minuti |

I tempi sono stime. I costi sono zero per tutti, tranne due casi:
- il piano a pagamento della posta, se il gratuito non basta. Costa circa 20 $ al mese, da riconfermare;
- un'assicurazione per la bici, da chiedere al broker.

**Perché ognuno conta, in una riga:**
- **1** · Senza la nostra posta su Supabase, i clienti nuovi non ricevono il link di conferma e non possono ordinare.
- **2** · Il sito apre solo con contanti e carta accesi. Oggi il database dice che il fornaio non ha mai finito l'iscrizione su Stripe.
- **3** · Un ordine con consegna a casa si chiude solo se ha un fattorino. Oggi non ce n'è nessuno approvato: l'unico è sospeso.
- **4** · Il dominio è gestito su Netsons. Le righe che servono alla posta vanno copiate a mano nel suo DNS, e nessuno ha mai verificato che ci siano.
- **5** · Oggi i cinque prodotti hanno tutti scorta 20, che sembra un numero messo a mano. Per il cibo online, poi, la legge chiede allergeni e ingredienti prima dell'acquisto.
- **6** · Nei repository pubblici della macchina possono restare tracce di vecchi accessi. Revocarli costa dieci minuti, e se non lo fai, uno sconosciuto potrebbe cambiare il codice del sito.
- **7** · Il sito mostra cinque indirizzi email, e nessuno ha mai provato che esistano. Senza l'indirizzo di supporto su Vercel, i messaggi del modulo contatti non avvisano nessuno.
- **8** · Il giro dei contanti non è ancora riparato nel codice. Il primo lunedì con soldi da girare è il 23/11, e senza un foglio non sapresti quanto bonificare.
- **9** · L'ordine del giro a mano conta. Se la posta non funziona, il giro delle email consuma i tentativi e perde i messaggi.
- **10** · Oggi, se il database non risponde un sabato sera, nessun pezzo della macchina se ne accorge.
- **11** · L'unica prova di ripristino del database è dell'1/11, prima delle 178 migrazioni del 6/11.
- **12** · Se il dominio scade, cadono insieme il sito, le caselle e l'invio delle email.

## Cosa devi fare

- I controlli 1, 2, 5, 6, 7, 10 e 12 sono tuoi: pannelli e persone che da qui non vedo.
- Il 3, il 4, l'8, il 9 e l'11 li facciamo insieme. Io preparo la parte mia, tu fai i clic.
- Il 6 è il più urgente: i dettagli te li ho dati in chat, non qui, perché questo repository è pubblico.

## Cosa non ho verificato

- Nessun pannello: Supabase, Stripe, Netsons, Resend e GitHub da qui non li leggo. Ogni controllo dice cosa cercare, non cosa c'è.
- Il DNS della posta: da questa macchina la rete lo blocca.
- I tetti della posta di serie di Supabase e del piano gratuito della posta vengono da quello che gli agenti sanno dei servizi, e vanno riconfermati nelle loro pagine.

---

## Dettagli tecnici

- Run `wf_b7ca6dd7-8c0`: tre cercatori (fuori dal codice, quando si rompe, il primo giorno vero) e un giudice. Il giudice ha ricontrollato la prova di ogni voce in cima partendo dal file o dal comando citato.
- Le prove principali: `lib/auth/conferma-email.ts:4` e `app/api/auth/signup/route.ts:46-50` (1); `registro-fatti.json`, voci `lancio.data` e `pagamenti.al-lancio` (2); un conteggio in sola lettura dei ruoli sul database vero del 6/11 e `lib/cassa/registra-incasso.ts:64,76-78` (3); `app/api/orders/cod/route.ts:1647` e la voce `avvisi.negozio` (4); un conteggio in sola lettura dei prodotti del 6/11 (5); `app/api/contact/route.ts:100-105` e `app/api/cron/operational-alerts/route.ts:737-748` (7); `consegne/audit/2026-11-05-radiografia.md:45-52` (8); `docs/runbook.md:347-349` del sito (9); `app/api/health/route.ts:52-53,232-234` (10); `.github/workflows/backup-db.yml` del sito, righe 20, 308-310, 394, 657 e 661 (11); `LAVORO-APERTO.md`, promessa 9 (12).
- Nessuno di questi controlli è nella radiografia in 12 sessioni, o lo è solo in parte: quella legge il codice, questi guardano pannelli, posta e persone.
