---
tipo: consegna
reparto: AD
data: 2026-10-28 19:50
colore: 🟢
titolo: Com'è messo il sito stasera, e l'ondata 2 pronta da lanciare
---

# Com'è messo il sito stasera, e l'ondata 2 pronta da lanciare

> **In due righe.** Il sito è in piedi, ma la cassa non funziona finché su Vercel manca la chiave di servizio. L'ondata 2 è pronta e controllata: ti chiedo solo se farla prima o dopo l'ondata 1.

## In parole semplici

Ho guardato il sito com'è dopo la tua unione delle 15:15, in sola lettura. Ho guardato quattro cose: il database, gli errori del sito pubblicato, il registro dei difetti e il codice.

Il sito pubblicato è in piedi, ma è ancora una vetrina senza cassa che funziona. Il motivo è uno solo, ed è sempre lo stesso. Gli errori del sito degli ultimi sette giorni sono quasi tutti quella chiave. Per esempio, il lavoro che manda le email ha fallito 1.007 volte, e quello dei bonifici ai negozi 672 volte.

L'ondata 2 è pronta: cinque squadre, 24 difetti, file che non si toccano fra loro. Non l'ho lanciata. Prima ti chiedo una cosa sull'ordine, qui sotto.

## Cosa cambia per te

- **Il piano dell'ondata 2 è scritto e controllato.** Lo strumento che prepara le schede delle squadre le ha trovate tutte: 24 su 24.
- **Le scelte che servono le hai già firmate** il 26/10, con la tua risposta alla carta delle 14 scelte. Pagamento solo in contanti. Niente chat fra cliente e negozio: c'è «Chiama il negozio». Categorie vuote nascoste. Scheda dell'ordine nel pannello solo da guardare. Non ti chiedo firme nuove per partire.
- **La base da cui partono le squadre è sana.** Sulla versione pubblicata, il controllo completo del sito è verde: 6.026 prove su 6.026.

## Cosa devi fare

Una risposta sola: **quale ondata prima.**

- **A — prima l'ondata 1, poi la 2.** È il mio consiglio. L'ondata 1 ripara la porta del negozio. Oggi un negoziante nuovo che si iscrive viene respinto, oppure legge «richiesta in valutazione» senza aver compilato niente: sono due dei 9 difetti bloccanti. Ripara anche le promesse sbagliate che i clienti leggono oggi. Le due ondate condividono 7 file, quindi non possono girare insieme: vanno in fila.
- **B — prima la 2.** Ripara quello che serve quando arrivano ordini veri: il pannello ordini, i rimborsi dei resi, le recensioni del negozio, gli orari di chiusura, i soldi nel cruscotto del negoziante. Ha senso se il primo ordine di Pane Quotidiano arriva prima di un secondo negozio.

Scrivimi «ondata 1» oppure «ondata 2». In tutti e due i casi l'ondata gira col tetto di 45 agenti, e la richiesta di unione arriva a te.

E resta la cosa più urgente di tutte, che non dipende dalle ondate: **la seduta di 45 minuti per cambiare le chiavi del database.** Finché la chiave vecchia funziona e quella di servizio manca su Vercel, nessuna riparazione si vede in cassa.

## Cosa non ho verificato

- **Non ho visto Stripe, Resend né il server della macchina.** Quello che dico sui pagamenti viene dalla memoria e dal database, non da un controllo di oggi.
- **Non ho guardato il sito nel browser.** Il dominio è bloccato dalla rete di questa sessione. Le pagine pubblicate le ha già lette la verifica delle 16:22.
- **Le schede dei difetti descrivono il codice di quando sono state scritte.** Le squadre rileggono il codice di oggi prima di toccarlo: qualcuna potrebbe risultare già risolta.
- **Non ho fatto una radiografia nuova.** Il mio voto su me stessa questo mese è 0,09: ho chiuso 7 difetti della macchina e ne ho aperti 74. Sotto 1 la regola dice di non aprire ricerche nuove. Ho usato solo quello che c'era già, più i dati dal vivo.

---

## La situazione, in numeri

**Il negozio e i clienti** (database del sito, sola lettura, 28/10 ore 19:30 circa):

| Cosa | Quanti |
|---|---|
| Account in tutto | 9 |
| Negozi approvati | 2 su 2: Pane Quotidiano, che è vero, e il Panificio Demo, la tua prova da togliere |
| Prodotti in vendita | 9: 5 di Pane Quotidiano e 4 del Panificio Demo |
| Fattorini | 1 account |
| Ordini in tutto | 1, del 24 giugno; nessuno negli ultimi 30 giorni |
| Ultimo account creato | 5 settembre |

Il Panificio Demo è ancora approvato e visibile. Il comando che lo toglie è pronto nella sua carta.

**Il sito pubblicato** (errori di Vercel, ultimi 7 giorni):

| Lavoro che fallisce | Volte | Causa |
|---|---|---|
| Notifiche sul telefono | 2.016 | la stessa chiave |
| Email | 1.007 | la stessa chiave |
| Bonifici ai negozi | 672 | la stessa chiave |
| Altri sei lavori notturni, il consenso ai cookie e il registro delle visite | 1.359 | la stessa chiave |
| Avvisi sui prezzi e carrelli abbandonati | 336, metà per uno | la stessa chiave |

Su circa 5.400 errori, tutti tranne 2 vengono dalla stessa chiave che manca. Gli altri 2 sono un accesso scaduto, il 25/10.

**Il controllo di sicurezza di Supabase** segnala ancora regole d'accesso da stringere. Sono già nell'elenco delle falle riservate: i dettagli restano fuori da questo deposito, che è pubblico. Segnala anche la protezione contro le password già rubate, ancora spenta: è uno dei tuoi passi da 2 minuti.

**Il registro dei difetti del sito:** 806 aperti su 1.730. Di questi, 9 sono bloccanti, 107 gravi e 690 minori.

| Fase del piano del 24/10 | Aperti |
|---|---|
| 0 — gli 8 già risolti da chiudere con le prove | 0 su 8: fatta |
| 1 — le fondamenta comuni | 7 su 19 |
| 2 — posta, allarmi e privacy | 7 su 14 |
| 3 — il giorno della chiave, coi passi tuoi | 6 su 6 |
| 4 — **ondata 1**: le porte e quello che vedono i clienti | 24 su 25 |
| 5 — **ondata 2**: pannello, negozio, resi, vetrina, conti | 19 su 21 |
| 6 — ondata 3: quello che aspetta un'altra squadra | 6 su 6 |
| 7 — le migrazioni | 17 su 18 |
| 8 — le liste «prima di accendere» | 25 su 27 |

**Correzione delle 20:40.** Alla prima stesura avevo scritto che la fase 0 era ancora tutta aperta. Non è vero: gli 8 gravi sono segnati «riparati prima» nel registro, e il mio conto aveva escluso solo gli stati «riparato» e «chiuso». La fase 0 è fatta.

## L'ondata 2, squadra per squadra

| Squadra | Cosa ripara | Difetti | Rischio |
|---|---|---|---|
| Pannello | Lista ordini vuota quando la lettura cade. Cruscotto bianco. Scheda dell'ordine che non esiste. Contanti confermati con un tocco. Promozioni in errore. | 9 (5 gravi, 4 minori) | soldi: due collaudatori |
| Negozio | Recensioni sempre in errore. «Utente» al posto del cliente. La chat da togliere. «Contatta il rider» chiama il negozio. Logo a metà invisibile. | 5 gravi | soldi: due collaudatori |
| Soldi dei resi | Rimborso registrato due volte dopo un guasto. Credito MyCity perso se l'annullo non riesce. | 4 gravi | soldi: due collaudatori |
| Vetrina | Categorie vuote in mostra. «Nessun risultato» quando cade la rete. Foto dell'iPhone invisibili. | 3 gravi | nessuno: un collaudatore |
| Orari e conti del negozio | Negozio in ferie che accetta ordini. Ritiro promesso ma spento. Cruscotto con meno soldi del vero. | 3 gravi | soldi: due collaudatori |

**Cosa ho spostato rispetto al piano del 24/10**, seguendo la sua critica:

- Due difetti del pannello erano già riparati: li ho tolti.
- Il bonifico che fallisce per la colonna mancante l'ho rinviato. La critica dice che si chiude dopo il rilascio controllato, insieme al compenso del fattorino.
- Il «Ritiro in negozio» va con gli orari, perché toccano lo stesso file e quel file deve avere un padrone solo.
- I quattro difetti piccoli dei contanti e quello dell'annullo nel pannello vanno con la squadra del pannello, che apre già quei file.
- Il logo invisibile va con la squadra del negozio, perché la testata la tocca anche la chat da togliere.
- I soldi nel cruscotto del negoziante vanno con gli orari, perché la cassa in contanti la toccano tutti e due.

Così le cinque squadre non condividono nessun file: l'ho misurato con lo stesso calcolo che usa lo strumento delle schede.

**Quanto costa** (stima del metodo, non misura): da 24 a 41 agenti, con un tetto fisso di 45. Il conto vero lo leggo a fine ondata e te lo scrivo.

---

## Dettagli tecnici

- Piano: `consegne/audit/2026-10-28-ondata2-sito.json`. Le ondate 1-8 sono vuote: si legge con `--ondata 9`, così i worktree nascono `o9-*`.
- Validazione: `node cervello/schede-pacchetto.mjs --piano consegne/audit/2026-10-28-ondata2-sito.json --ondata 9` → exit 0, 24 schede trovate, 22 tagliate a 1.500 byte, 4 pacchetti su 5 a rischio, args da 41.179 byte.
- Pacchetti e indici del registro:
  - `app/admin/orders/page.tsx`: 1229, 1230, 118, 142, 1320, 1265, 111, 1277, 281
  - `app/messages/page.tsx`: 114, 1336, 22, 1245, 278
  - `lib/stripe/payout.ts`: 1287, 1313 (solo la parte in comune con la 1287), 1333, 1286
  - `components/CategoryShowcase.tsx`: 1310, 300, 1228
  - `lib/store-hours.ts`: 24, 251, 195
- Tolti: 1394 e 280 (`riparato`). Rinviato: 1290, con il 1289, dopo `main:false` (critica, `mancanze` «stanno in più posti»).
- File in comune fra ondata 1 (fase 4) e ondata 2: `app/product/[id]/page.tsx`, `app/orders/[id]/page.tsx`, `lib/stripe/payout.ts`, `components/Footer.tsx`, `app/api/orders/cod/route.ts`, `app/api/stripe/checkout/route.ts`, `lib/constants.ts`. Le due ondate vanno in serie.
- Base: main del sito `1776e6b1` (unione della #262). `npm run verify` sulla base (installazione come la CI, `npm ci --legacy-peer-deps`): tipi e regole di scrittura a posto, 666 file di prove, 6.026 prove passate su 6.026.
- Lancio, quando Nicola sceglie: `node cervello/schede-pacchetto.mjs --piano consegne/audit/2026-10-28-ondata2-sito.json --ondata 9 --json` come `args.schede` del workflow `.claude/workflows/ondata-sito.js`, con `repo: /home/user/mycity`, `radice_ad: /home/user/ad-mycity`, `base: 1776e6b1`, `max_agenti: 45`, tipi `tech` e `qa`.
- Errori di Vercel: progetto `mycity`, finestra 7 giorni, rilascio `dpl_H1JjMwfrGpP7z4ih2fKV9k8DTEAR`. Gruppi: send-push 2.016, service role 1.359, send-emails 1.007, release-payouts 672, external-price-alerts 168, abandoned-carts 168, activity-record 6, refresh token 2.
- Voto di chiusura della macchina: `node cervello/tasso-chiusura.mjs` → ottobre 74 aperti, 7 chiusi, 0,09.
