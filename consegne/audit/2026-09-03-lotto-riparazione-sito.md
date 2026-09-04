---
tipo: referto-lotto
data: 2026-09-03 21:00
registro: sito (marketplace)
ramo: claude/marketplace-issues-52cttv
---

# Il sito aveva 110 problemi seri: ne restano 26, e uno che nessuno aveva mai visto era il peggiore di tutti

> **In due righe.** Su 110 problemi seri del marketplace ne abbiamo chiusi 97, ognuno con
> una prova che gira. Ti resta da firmare una richiesta di unione, quattro migrazioni del
> database, e le tre cose di sempre: dominio, migrazioni in produzione, segreti.

## In parole semplici

Il marketplace aveva 110 problemi fra bloccanti e gravi. Ne abbiamo chiusi 97.

Il lavoro non l'ho fatto io da sola. L'ho diviso in pacchetti per file, e ogni pacchetto
è andato a una squadra con la sua finestra. Poi cinque revisori hanno riguardato tutto
quello che le squadre avevano toccato. La regola di casa è che chi costruisce non collauda
mai il proprio lavoro.

I revisori hanno trovato altre 41 cose. Quattro erano nate quella mattina insieme alle
riparazioni. Le più care le abbiamo chiuse nello stesso giorno.

La cosa più grossa non stava in nessuna lista. Provando il sito in un browser vero, per
la prima volta, è saltato fuori che 95 pagine su 95 arrivavano al cliente senza il loro
JavaScript: accesso, carrello e cassa erano gusci morti. In produzione. Da chissà quanto.

## Cosa cambia per te

Il sito adesso fa quello che scrive. Prima scriveva «spedizione gratuita» in vetrina e
poi in cassa addebitava 3 euro di consegna. Prometteva 5 euro all'amico invitato, e i
5 euro andavano solo a chi invitava. Prometteva il ritiro in negozio, che alla cassa non
esiste.

Un esempio vero, di quelli che si vedono in cassa: 18 euro di pane dal fornaio e 18 euro
di carne dal macellaio. La barra diceva «Spedizione gratis», perché sommava i due negozi
e superava i 30. Poi il totale addebitava due spedizioni, perché la soglia vale per
negozio. Adesso la barra e il totale dicono la stessa cosa.

Il negozio vede il suo guadagno vero. Prima il rimborso a un cliente non toglieva un euro
dai guadagni che il negoziante leggeva sul cruscotto: decideva se restare con noi
guardando un numero gonfiato.

Chi chiede di cancellare l'account adesso viene cancellato davvero. Prima il codice
scriveva una colonna che nel database non esiste, il database rifiutava tutta la riga, e
nome, telefono e indirizzo restavano in chiaro. Nessuna scheda l'aveva mai notato.

Un cliente non può più approvarsi da solo un rimborso. Erano soldi che uscivano su
decisione di chi li incassava.

## Cosa devi fare tu

**Guarda la richiesta di unione e dimmi se va bene.** È una sola, sul ramo
`claude/marketplace-issues-52cttv`, e dentro c'è il lavoro di venticinque squadre già
ricucito.

**Poi ci sono quattro migrazioni del database che aspettano la tua firma** — la 151, la
152, la 153 e la 154. Non le ho applicate: una volta applicate non tornano indietro. La
153 è quella che chiude il rimborso auto-approvato dal lato del database; il lato del
codice è già chiuso e provato.

**E restano tre cose che solo tu puoi fare.** Sono le stesse che ti ho messo in coda alle
9:35 di oggi. Il dominio punta ancora al vecchio server spento. In produzione mancano
diciannove migrazioni. E al rilascio mancano i segreti per partire.

Le trovi come card #190, #191 e #192. Le ho aggiornate con quello che ho verificato oggi,
guardando Vercel e il database veri invece di ripetere la scheda di ieri.

Finché il dominio resta com'è, nessun cliente vede una sola di queste 97 riparazioni.

## Cosa non ho verificato

**Nessuno ha aperto il sito in un browser e comprato qualcosa.** Le prove girano, ma
provano il codice, non l'esperienza: un giro d'acquisto vero, dal prodotto al pagamento,
non l'ha fatto nessuno. È la verifica che manca e che va fatta sull'anteprima.

**Le quattro migrazioni non le ha applicate nessuno su un database vero di produzione.**
Sono state provate su una copia locale ricostruita, ed è una cosa diversa.

**Le impaginazioni sono calcolate, non guardate.** Dove una squadra dice «la scritta ci
sta», ha fatto un conto sulle misure dichiarate: non ha visto lo schermo. Su questo il
segno è affidabile, il decimo no.

**Il costo di una scelta non l'ho misurato.** Per riparare le pagine senza JavaScript
tutto il sito è diventato «costruito a ogni richiesta»: da qui non posso sapere quanto
costa su Vercel. Si torna indietro in una riga.

**Ventisei problemi gravi restano aperti.** Non sono nascosti: stanno nel registro, con il
motivo scritto accanto. La maggior parte aspetta una migrazione, o esce dal perimetro del
lotto.

---

## Dettagli tecnici

### Il conto

| | prima | dopo |
|---|---:|---:|
| difetti aperti nel registro del sito | 369 | 304 |
| di cui bloccanti | 4 | 3 |
| di cui gravi | 106 | 26 |
| di cui minori | 259 | 275 |
| prove unitarie verdi | 2411 | 3200 |
| file di prova | 326 | 419 |

I 275 minori non erano nel lotto: il lotto era «solo bloccanti e gravi», 110 difetti in
54 pacchetti su 11 ondate (`node cervello/pacchetti-lotto.mjs --sito --gravi`). I minori
salgono di 16 perché i revisori ne hanno trovati di nuovi.

### Come è andata, squadra per squadra

Quattordici squadre di riparazione (105 difetti chiusi nei loro frammenti, 4 già a posto
nel codice, 14 lasciati aperti con il motivo scritto, 39 pezzi passati ad altre squadre).
Cinque revisori con lenti diverse su 146 file toccati: 41 cose trovate. Cinque squadre di
riparazione sul referto dei revisori: 12 chiuse. Una revisione finale sul perimetro
rimasto.

Il metodo: `cervello/lotto-a-pacchetti.md`. Il cancello del sito è `npm run verify` nel
repo del sito più `node cervello/radiografia-in-corsa.mjs --repo ../mycity`.

### Le cose che nessuna radiografia aveva visto

1. **95 pagine su 95 senza JavaScript in produzione.** La regola di sicurezza (nonce +
   `strict-dynamic`) vale solo per le pagine costruite al momento della richiesta; le 95
   preparate in anticipo arrivavano con tutti gli script rifiutati. Misurata in due modi:
   i file `.next/server/app/*.html` e le risposte HTTP vere. Chiusa con una riga in
   `app/layout.tsx`, tenendo la sicurezza dov'era.
2. **La cancellazione dell'account non cancellava niente.** `lib/account/cancellazione.ts`
   scriveva `profiles.avatar_url`, che non esiste (si chiama `public_avatar_url`): il
   database rifiutava l'intera UPDATE. Trovata da un controllo nuovo che legge tutte le
   scritture del codice — 440 colonne, una sola violazione.
3. **La fascia di consegna la scriveva il cliente.** Regressione nata la mattina stessa:
   il campo era testo libero e decideva se il negozio poteva servire. La parola «domani»
   apriva una finestra di 24 ore. Trovata dai revisori, chiusa nel pomeriggio.
4. **Il guardiano della chat non poteva scattare.** Dentro una funzione `SECURITY DEFINER`
   `current_user` è il proprietario, quindi il controllo autorizzava sé stesso. La prova
   era verde anche togliendo il trigger del tutto.
5. **`referral_leaderboard` serviva nome e cognome di cinquanta clienti veri** a chiunque
   avesse la chiave pubblica, e l'advisor di Supabase la considera a posto.

### Lo stato vero della produzione, letto oggi

- Vercel, progetto `mycity`: nessun dominio personalizzato; protezione «Vercel
  Authentication» accesa su tutto tranne i domini personalizzati. `mycity-marketplace.com`
  risolve `216.24.57.1`, il Render dismesso.
- Supabase, progetto Mycity: ultima migrazione applicata `20260828230000`. Nel repo ne
  restano fuori diciannove, più le quattro nuove di oggi.
- Advisor di sicurezza della produzione: 6 viste `SECURITY DEFINER` (ERROR), 14 funzioni
  eseguibili da `anon`, 31 da `authenticated`, 11 tabelle con RLS accesa e nessuna regola.

### Le migrazioni scritte oggi (🔴 non applicate)

- `151_revoca_esecuzione_agli_anonimi.sql` — toglie l'esecuzione ad `anon` sulle funzioni
  potenti; sulle due che contano clic e visualizzazioni degli annunci mette un tetto per
  chiamante.
- `152_le_viste_usano_i_permessi_di_chi_legge.sql` — la misura che conta è dentro: mettere
  `security_invoker` su tutte e sei le viste **spegneva il sito** (bacheca dei fattorini
  1→0 righe). La migrazione lascia scritta quella misura accanto a ogni vista.
- `153_il_reso_lo_apre_il_server_non_il_cliente.sql` — chiude il bloccante del rimborso
  auto-approvato dal lato del database.
- `154_la_chat_non_si_intesta_a_un_altro.sql` — riscritta dopo la revisione, perché la
  prima versione si autorizzava da sola.

Altre diciannove migrazioni sono state proposte dalle squadre e stanno nei frammenti, non
in `migrations/`: le scrivo solo quando servono davvero.
