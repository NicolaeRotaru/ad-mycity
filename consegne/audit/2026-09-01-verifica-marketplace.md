---
data: 2026-09-01 14:45
tipo: verifica del marketplace
repo: mycity, stato del 1 settembre
---

# Verifica del marketplace — 1 settembre 2026

**In due righe.** Ho controllato il sito e sta bene: tutte le 1538 prove passano.
Il referto di stanotte non vale, perché l'ho scritto su una copia vecchia di un mese:
quasi tutto quello che avevo elencato era già riparato. Tre difetti veri restavano, e
li ho sistemati.

## In parole semplici

Stanotte ho fatto una radiografia del sito. L'ho fatta su una fotografia vecchia di un
mese, senza accorgermene. Il sito vero era molto più avanti.

I tre problemi gravi che ti avevo annunciato erano **già risolti**. Ho rifatto le
verifiche sul sito di oggi. Sono rimasti tre difetti veri, e li ho riparati.

## Cosa cambia per te

Il sito sta bene. Tutte le prove automatiche passano: sono 1538 e passano tutte.
A luglio erano 718. Il lavoro fatto in agosto ha più che raddoppiato i controlli.

Anche i punti che ti avevo segnalato come pesanti risultano chiusi. La commissione, per
dire, è chiusa meglio di come l'avrei chiusa io. Prima il numero scritto nelle condizioni
di vendita e il numero davvero trattenuto erano due cose separate. Adesso le condizioni
leggono il valore vero dal codice. Quei due numeri non possono più diventare diversi.

Tre difetti invece erano veri, e li ho riparati:

**Il pulsante spento non si leggeva.** Quando un pulsante è disattivato diventava così
chiaro da sparire. L'ho misurato in un browser: il testo era quattro volte meno visibile
del minimo consentito. Non è un dettaglio di bellezza. Su un prodotto esaurito quel
pulsante dice «Non disponibile», e il cliente deve poterlo leggere. Adesso si legge, e
resta comunque chiaramente spento.

**Il titolo delle finestre veniva tagliato.** Il titolo era scritto troppo grande, e le
parole in eccesso sparivano con i puntini. «Condividi la lista della spesa» non ci
stava. Nemmeno «Scansiona il codice a barre». Adesso ci stanno.

**Sei falle di sicurezza nelle librerie del sito.** Cinque erano gravi. Il sito usa
componenti scritti da altri, e sei di questi avevano problemi noti. Adesso sono zero.
Non ho cambiato niente del nostro codice: ho solo aggiornato quei componenti alle
versioni corrette.

## Cosa devi fare

Una cosa sola: decidere se unire la richiesta di modifica numero 245 sul sito.
Contiene i tre fix qui sopra. Tutte le prove sono verdi.

Poi, se vuoi, dimmi se rifare la radiografia. Quella di stanotte descrive luglio e non
serve più. Una nuova, sul sito di oggi, va rifatta da capo.

## Cosa non ho verificato

Non ho provato le due correzioni visive sulle pagine vere del sito. Le ho provate sul
banco di prova dei componenti. Se una pagina ha uno stile suo che sovrascrive quello
standard, lì va guardata a occhio.

I titoli che ho provato sono quelli che ho trovato nell'applicazione. Non li ho provati
tutti. Un titolo più lungo di quelli potrebbe ancora non entrare.

Non ho potuto guardare i pagamenti dal vivo. Il collegamento a Stripe non è attivo in
questa sessione. Restano fuori dalla mia vista i tempi reali di accredito ai negozi.

## Come ho controllato

Ogni riga qui sotto è un comando che ho lanciato, non un'impressione.

| Controllo | Esito |
|---|---|
| Il codice non ha errori di tipo | verde |
| Lo stile del codice è pulito | verde |
| Il sito si costruisce | verde, 177 pagine |
| Le prove automatiche | verdi, 1538 su 1538 |
| Il database si ricostruisce da zero | verde, 130 passaggi su 130 |
| Falle nelle librerie | zero, erano sei |

## La lezione, e il freno che ci metto

Non ho controllato quanto fosse vecchia la copia su cui stavo lavorando.

È lo stesso errore che stavo documentando: fidarsi di uno stato senza una prova che sia
quello vero. Mi è costato un referto intero da buttare. E ti ho accodato quattro azioni
che, se le avessi eseguite, avrebbero fatto tornare indietro il database.

Il freno costa trenta secondi. Prima di aprire una radiografia si confronta la copia
locale con quella su GitHub. Se è indietro di più di un giorno, o la si aggiorna, o lo
si scrive in cima al referto.

Un esempio di cosa mi è costato non averlo fatto. Stanotte ti ho scritto che nessun
cliente poteva comprare, perché la scheda prodotto diceva «Prodotto non disponibile».
Era vero il 30 luglio. Il 28 agosto qualcuno l'ha riparato, e io non l'ho visto.
Ti ho fatto passare un'ora a leggere un allarme su un problema che non c'era più.

---

### Dettagli tecnici

Stato del repo `mycity` al commit `51ab3e3`, dopo la PR #244.

I fix stanno nel commit `2ab20bd`, ramo `claude/amazing-lovelace-nqa9o1`, PR #245:

- `components/ui/Button.tsx` — sostituito `disabled:opacity-50` con uno stato
  disabilitato esplicito. L'opacità compone l'intero elemento sulla pagina, quindi
  schiarisce testo e fondo insieme. Contrasto misurato su Storybook: 1,62:1 prima,
  8,80:1 dopo. La soglia WCAG AA è 4,5:1.
- `components/ui/Modal.tsx` — aggiunta la classe `text-lg sm:text-xl` all'`h2` del
  titolo. Senza classe di dimensione ereditava il default di `globals.css`, cioè 30px
  in Fraunces. Con `truncate` i titoli si tagliavano: su un modale `sm` restano 332px
  utili, «Condividi la lista della spesa» ne occupa 363 e «Scansiona il codice a barre»
  341. Allineato a `ConfirmDialog`.
- `package-lock.json` — sei vulnerabilità risolte: Next.js con SSRF nei rewrites, DoS
  sulle immagini SVG ed esposizione non autenticata degli endpoint delle Server
  Function; postcss con path traversal; sharp con le CVE di libvips; fast-uri. Solo il
  lockfile si muove: Next passa da 15.5.18 a 15.5.25, dentro il range già in
  `package.json`.

Punti del vecchio referto ricontrollati e risultati già chiusi: commissione dichiarata
contro incassata, dati camerali segnaposto nel footer, `getClientIp` che leggeva il
primo elemento di `x-forwarded-for`, `rider_fee_cents` mai scritto, scheda prodotto non
visibile senza account, trigger degli ordini che citava `invoice_number`.
