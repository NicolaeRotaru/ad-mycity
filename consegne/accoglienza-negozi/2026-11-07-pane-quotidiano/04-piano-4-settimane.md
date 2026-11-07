---
data: 2026-11-07 06:00
autore: account-negozi
oggetto: Pane Quotidiano, piano delle prime 4 settimane dopo il lancio del 15/11 (bozza, nulla è stato mandato)
---

# Pane Quotidiano: come lo seguiamo per 4 settimane

## In parole semplici

Il sito apre il 15/11/2026. Questo piano dice cosa guardare ogni settimana su Pane Quotidiano, a quale numero scatta un consiglio, e cosa fare. Parto dalla fotografia di oggi, 7/11. Ci sono poi la bozza del primo messaggio WhatsApp al negoziante e le tre cose da fare per prime. Il messaggio non è stato mandato a nessuno.

Un esempio. Oggi chi scrive «pane» nella ricerca del sito trova l'hummus, non il negozio: i 5 prodotti in vetrina sono kefir, hummus, pudding e pesto. Se il 20/11 ci sono 0 visite alla pagina, il consiglio non è «fai più ordini» ma «sistemiamo la vetrina e facciamo girare il link».

## Cosa cambia per te

- Il negozio non resta fermo ad aspettare: ogni settimana ha un numero e un consiglio. Il primo risultato in cassa si misura entro 4 settimane (paletto 4 del prodotto: «primo risultato in 2-4 settimane»).
- Al lancio c'è solo pagamento in contanti alla consegna. Quindi «incasso» vuol dire contanti consegnati, non carta.
- **Una contraddizione da sciogliere prima di mandare il messaggio.** Mi hai chiesto «anteprima da approvare, niente app nuove». Ma il 1/11 hai firmato il contrario: il negozio ha un'app minima solo per gli ordini, e le anteprime le approva sul sito dopo un avviso via app ed email (registro `prodotto.paletti`, punto 3). Ho scritto il messaggio nella versione del 1/11, la più recente. Se vale ancora la vecchia, cambio due righe.

## Cosa devi fare

1. Dirmi quale versione vale per le anteprime: sito più avviso (1/11) o WhatsApp (vecchia). La mia raccomandazione: quella del 1/11.
2. Approvare o correggere il messaggio WhatsApp qui sotto (sezione 3). Sarebbe un messaggio a una persona vera: 🟡, parte solo con il tuo via.
3. Confermare quando vedi il negozio: le 3 domande della sezione 1 (pane e miele, scorte, orari).

## Cosa non ho verificato

- I numeri di oggi vengono dal file letto dal database il 7/11 alle 02:30 circa. Non ho riaperto il database né il sito.
- Delle 4 righe d'ordine storiche non so la data riga per riga. Le note di luglio parlano dell'ordine #16 (19,05 euro, contanti) annullato il 3/7: non so se è una delle 4. La data «giugno» è quella che mi hai indicato tu.
- Nelle note di luglio il negozio aveva 258 prodotti, oggi ne ha 5. Non so cosa sia successo: va chiesto.
- Le soglie delle settimane sono **mie proposte**, non medie misurate: MyCity non ha ancora ordini veri con cui calcolarle. Le correggiamo dopo la settimana 1.
- Non so se le scorte (tutte a 20) siano vere né se gli orari siano giusti: vengono da PagineGialle.

## 1. Settimana 0 (oggi, 7/11): la fotografia di partenza

| Cosa | Numero oggi | Metro |
|---|---|---|
| Prodotti in vetrina | 5 | tutti «disponibili», scorta 20 ciascuno |
| Prodotti con allergeni scritti | 1 su 5 | solo il kefir da 400 g («Latte e derivati») |
| Prodotti con ingredienti scritti | 2 su 5 | kefir 400 g e kefir di capra |
| Foto dei prodotti | 13 foto su 5 prodotti | ognuno ha almeno 2 foto |
| Foto del negozio | 1 | logo: assente |
| Orari | lun-mer e sab 09-13 e 16:30-19:30; gio solo 09-13; ven 09-13 e 16:30-19; domenica chiuso | da confermare con il negozio |
| Ordini storici | 4 righe d'ordine | nessun ordine consegnato (North Star = 0) |
| Dati per incassare | partita IVA, IBAN, termini accettati, documento: tutti assenti; abbonamento: nessuno | fonte: file dati, solo presenza sì/no |

Fonte di tutto: `/tmp/claude-0/-home-user/528441c4-587c-512c-8da8-547598174a58/scratchpad/pane-quotidiano-dati.json`.

### Le tre cose da fare per prime, in ordine di quanto spostano gli ordini

1. **Far dire alla vetrina cosa il negozio vende davvero.** La descrizione promette pane e miele, la vetrina non li ha. Domanda al negozio: «hai il pane e il miele in negozio? possiamo metterli?». Se sì, mettere in vetrina quelli: è ciò che la gente cerca con quel nome. Se no, riscrivere la descrizione (bozze A/B già pronte in `03-bozze-dei-dati.md`). Peso: alto, perché senza prodotto trovabile gli ordini sono zero.
2. **Confermare orari e scorte vere.** Se la cliente ordina alle 18 un prodotto che non c'è, o a negozio chiuso, il primo ordine finisce come l'ordine #16 di luglio. Peso: alto, perché protegge il primo ordine, che decide se il negozio resta.
3. **Completare allergeni e ingredienti dei 3 prodotti senza** (pudding, hummus, pesto) e aggiungere il logo. Gli allergeni sono un obbligo di legge (Reg. UE 1169/2011): vanno letti dall'etichetta o dati dal negozio, non scritti da noi. Peso: medio sugli ordini, alto sul rischio.

**A parte, non sposta gli ordini ma blocca i soldi:** mancano IBAN, partita IVA e termini accettati. Senza IBAN non si può fare il bonifico del lunedì. Va chiesto al negozio entro la settimana 1.

## 2. Le settimane dopo il lancio

La regola per tutte: un consiglio parte solo se scatta la soglia. Sotto soglia, nessun messaggio (WhatsApp mai spam: paletto 8).

### Settimana 1 (15-21/11): si vede?

- **Misuro:** visite alla pagina del negozio · prodotti aggiunti al carrello · ordini ricevuti · ordini accettati entro 10 minuti.
- **Soglia (mia proposta):** 0 ordini a fine settimana, oppure un ordine non accettato entro 10 minuti.
- **Azioni tipo:** ① se 0 visite: far stampare il QR al negozio e metterlo in cassa; ② se visite ma 0 carrelli: riguardare foto e prezzi dei 5 prodotti; ③ se ordine non accettato: chiamare il negozio per capire (app o telefono).

### Settimana 2 (22-28/11): funziona il primo ordine?

- **Misuro:** ordini consegnati · tempo da ordine a consegna · ordini annullati e perché.
- **Soglia:** 1 ordine annullato o in ritardo oltre 60 minuti.
- **Azioni tipo:** ① se annullato per prodotto finito: aggiornare le scorte vere; ② se in ritardo: passo a @operations; ③ se tutto liscio: chiedere alla cliente un commento breve per la pagina del negozio.

### Settimana 3 (29/11-5/12): torna qualcuno?

- **Misuro:** clienti che ordinano una seconda volta · prodotto più venduto · ordini per giorno e fascia oraria.
- **Soglia:** meno di 3 ordini totali in 3 settimane, oppure un cliente che non riordina dopo 7 giorni.
- **Azioni tipo:** ① proporre al negozio un prodotto in più nella categoria che già vende; ② controllare che gli orari della vetrina coincidano con quando arrivano gli ordini; ③ preparare un cartellino «ordina da noi» con il link.

### Settimana 4 (6-12/12): il conto in cassa

- **Misuro:** incasso totale in contanti consegnati (euro) · numero di ordini · clienti diversi · quanti sono nuovi per il negozio · 10% di commissione dovuto.
- **Soglia:** incasso sotto i 100 euro (mia stima, da correggere), oppure ordini fermi da 7 giorni.
- **Azioni tipo:** ① report al negozio in linguaggio di cassa («hai incassato X euro da Y clienti»), mai like o visite; ② se bene: proporre allargamento del catalogo; ③ se fermo: capire la causa (catalogo, orari, consegne) prima di parlare di sconti. Lo sconto sulla commissione è 🔴, lo propongo a Nicola e non lo concedo.

## 3. Bozza del primo messaggio WhatsApp (NON MANDATO)

**A:** il titolare di Pane Quotidiano (numero da prendere dal negozio, il telefono nel database è quello fisso 0523 388601 e potrebbe non essere WhatsApp: da chiedere). **Quando:** dopo il via di Nicola, mattina presto o dopo le 13 (orari di chiusura). 🟡 consenso del negoziante da verificare con @legale-privacy prima dell'invio.

> Buongiorno, sono di MyCity. La vostra pagina sul sito è già pronta e il 15 novembre apre ai clienti di Piacenza.
>
> Ho guardato la vetrina come farebbe una cliente e ho preparato io i testi nuovi: non dovete scrivere nulla. Prima di pubblicarli li vedete e dite sì o no, dal sito. Vi arriva un avviso quando sono pronti.
>
> Una cosa sola mi serve da voi: avete il pane e il miele in negozio, e possiamo metterli in vetrina?
>
> Rispondetemi qui con un «sì» o un «no» quando avete un momento.

Perché è fatto così: parte da un dato (la vetrina oggi non ha pane né miele), porta valore (testi già scritti), chiede UNA cosa, non nomina commissioni né sconti. Misura di riuscita: risposta entro 48 ore.

## Dettagli tecnici

- Registro: `prodotto.paletti` (punti 3, 4, 8) e `pricing.commissione` in `MyCity-Vault/90-Memoria-AI/registro-fatti.json`; contesto in `CONTESTO_BUSINESS.md` §4.
- Storia del negozio: `consegne/account-negozi/2026-07-13-checkin-pane-quotidiano-sentinella.md`, `...2026-07-06-anti-churn-pane-quotidiano-post-annullamento.md`.
- Vetrina vista da cliente: `01-vetrina-vista-da-cliente.md`; bozze dati: `03-bozze-dei-dati.md`.
- Effetto atteso su KPI: ordini consegnati da 0 a almeno 1 entro il 21/11, a 3 o più entro il 12/12 (stime mie, non misurate).
- Scorecard 1-5: diagnosi 4 · mestiere 4 · dati reali 4 · cliente 4 · foresight 3 · documentazione 3. Assi più bassi: foresight e documentazione (soglie non tarate su ordini veri).
