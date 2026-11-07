---
data: 2026-11-07 06:00
autore: account-negozi
oggetto: Pane Quotidiano, piano delle prime 4 settimane dopo il lancio del 15/11 (bozza, nulla è stato mandato)
---

# Pane Quotidiano: come lo seguiamo per 4 settimane

Riassunto in due righe. Dopo il lancio controlliamo un numero a settimana, e il consiglio parte solo se scatta la soglia.
Il primo avviso al negoziante è una bozza, non mandata.

## In parole semplici

Il sito apre il 15/11/2026. Questo piano dice cosa controllare su Pane Quotidiano nelle prime 4 settimane. Parte dalla fotografia di oggi, 7/11.

Un esempio. Oggi chi cerca «pane» sul sito trova l'hummus, non il negozio. In vetrina ci sono 5 prodotti. Sono kefir, hummus, budino e pesto. Se il 20/11 la pagina ha 0 visite, non serve spingere gli ordini. Serve sistemare la vetrina e far girare il link.

Il canale verso il negoziante è fissato dalla regola che hai firmato il 1/11. Il negozio ha un'app minima che mostra solo gli ordini. Tutto il resto lo vede sul sito. Lì approva le anteprime, dopo un avviso via app ed email. Il primo contatto è quindi un avviso, senza messaggi su altre chat. Vale anche la regola «niente contenuti social per i negozi, per ora».

## Cosa cambia per te

- Il negozio non resta fermo ad aspettare.
- Il primo risultato in cassa si misura entro 4 settimane. È il paletto 4 del prodotto: «primo risultato in 2-4 settimane».
- Al lancio c'è solo il pagamento in contanti alla consegna. «Incasso» vuol dire contanti consegnati, non carta.
- Il negoziante deve solo dire sì o no dal sito.

## Cosa devi fare

- Approva o correggi la bozza del primo avviso (sezione 3). Sarebbe un contatto con una persona vera: 🟡, parte solo col tuo via.
- Quando vedi il negozio, chiedi tre cose: ha pane e miele, le scorte vere, gli orari giusti.
- Se ti serve un giorno solo per decidere, ti basta la prima: la bozza dell'avviso.

## Cosa non ho verificato

- **Il canale dell'avviso.** Va controllato nel codice del sito (`/home/user/mycity`, notifiche al venditore) prima di usarlo. Non so se oggi l'avviso parta davvero via app ed email, né con quale testo.
- I numeri di oggi vengono dal file letto dal database il 7/11 alle 02:30 circa. Non ho riaperto né il database né il sito.
- Delle 4 righe d'ordine storiche non so la data riga per riga. Le note di luglio parlano dell'ordine #16 (19,05 euro, contanti), annullato il 3/7. Non so se è una delle 4.
- Nelle note di luglio il negozio aveva 258 prodotti, oggi ne ha 5. Non so cosa sia successo, va chiesto.
- Le soglie delle settimane sono **mie proposte**. MyCity non ha ancora ordini veri per calcolarle. Le correggiamo dopo la settimana 1.
- Non so se le scorte siano vere (20 pezzi per ciascuno dei 5 prodotti). Non so nemmeno se gli orari siano giusti: vengono da PagineGialle.

## 1. Settimana 0 (oggi, 7/11): la fotografia di partenza

| Cosa | Numero oggi | Metro |
|---|---|---|
| Prodotti in vetrina | 5 | tutti «disponibili», scorta di 20 pezzi ciascuno |
| Prodotti con allergeni scritti | 1 su 5 | solo il kefir da 400 grammi («Latte e derivati») |
| Prodotti con ingredienti scritti | 2 su 5 | kefir da 400 grammi e kefir di capra |
| Foto dei prodotti | 13 foto su 5 prodotti | ognuno ha almeno 2 foto |
| Foto del negozio | 1 | logo: assente |
| Orari | mattina e pomeriggio, tranne giovedì pomeriggio e domenica (da confermare) | da confermare con il negozio |
| Ordini storici | 4 righe d'ordine | nessun ordine consegnato (North Star = 0) |
| Dati per incassare | partita IVA, IBAN, termini accettati, documento: tutti assenti | abbonamento: nessuno |

Fonte di tutto: `/tmp/claude-0/-home-user/528441c4-587c-512c-8da8-547598174a58/scratchpad/pane-quotidiano-dati.json`. Dice solo se un dato c'è o no.

### Le tre cose da fare per prime

Sono in ordine di quanto spostano gli ordini.

- **Far dire alla vetrina cosa il negozio vende.** La descrizione promette pane e miele, la vetrina no. Si chiede al negozio se li ha. Se sì, si mettono in vetrina, perché la gente cerca quei nomi. Se no, si riscrive la descrizione con le bozze A/B di `03-bozze-dei-dati.md`. Peso alto: senza prodotto trovabile gli ordini restano zero.
- **Confermare orari e scorte vere.** Se una cliente ordina alle 18 un prodotto che non c'è, il primo ordine finisce come l'ordine #16 di luglio. Peso alto: protegge il primo ordine, che decide se il negozio resta.
- **Completare allergeni e ingredienti** di pudding, hummus e pesto, e aggiungere il logo. Gli allergeni sono un obbligo di legge (Reg. UE 1169/2011). Vanno letti dall'etichetta o dati dal negozio, non scritti da noi. Peso medio sugli ordini, alto sul rischio.

**A parte:** non sposta gli ordini ma blocca i soldi. Mancano IBAN, partita IVA e termini accettati. Senza IBAN non si fa il bonifico del lunedì. Va chiesto al negozio entro la settimana 1.

## 2. Le settimane dopo il lancio

Sotto soglia non parte nessun avviso: niente spam (paletto 8).

### Settimana 1 (15-21/11): si vede?

- **Misuro:** visite alla pagina, prodotti nel carrello, ordini ricevuti, ordini accettati entro 10 minuti.
- **Soglia (mia proposta):** 0 ordini a fine settimana, oppure un ordine non accettato entro 10 minuti.
- **Se 0 visite:** far stampare il QR al negozio e metterlo in cassa.
- **Se visite ma 0 carrelli:** riguardare foto e prezzi dei 5 prodotti.
- **Se ordine non accettato:** chiamare il negozio per capire. L'app mostra l'ordine, quindi si parte da lì.

### Settimana 2 (22-28/11): funziona il primo ordine?

- **Misuro:** ordini consegnati, tempo da ordine a consegna, ordini annullati e perché.
- **Soglia:** 1 ordine annullato, o in ritardo oltre 60 minuti.
- **Se annullato per prodotto finito:** aggiornare le scorte vere.
- **Se in ritardo:** passo a @operations.
- **Se tutto liscio:** chiedere alla cliente un commento breve per la pagina.

### Settimana 3 (29/11-5/12): torna qualcuno?

- **Misuro:** clienti che ordinano una seconda volta, prodotto più venduto, ordini per giorno e fascia oraria.
- **Soglia:** meno di 3 ordini totali in 3 settimane, o un cliente che non riordina dopo 7 giorni.
- **Proposta 1:** un prodotto in più nella categoria che già vende.
- **Proposta 2:** controllare che gli orari in vetrina coincidano con quando arrivano gli ordini.
- **Proposta 3:** preparare un cartellino «ordina da noi» con il link.

### Settimana 4 (6-12/12): il conto in cassa

- **Misuro:** incasso in contanti consegnati (euro), numero di ordini, clienti diversi, quanti sono nuovi per il negozio, 10% di commissione dovuto.
- **Soglia:** incasso sotto i 100 euro (stima mia, da correggere), o ordini fermi da 7 giorni.
- **Report al negozio:** in linguaggio di cassa, «hai incassato X euro da Y clienti». Mai like o visite.
- **Se va bene:** proporre di allargare il catalogo.
- **Se è fermo:** capire la causa (catalogo, orari, consegne) prima di parlare di sconti. Lo sconto sulla commissione è 🔴: lo propongo a Nicola e non lo concedo.

## 3. Bozza del primo avviso (app ed email), NON MANDATO

**A:** il titolare di Pane Quotidiano, tramite l'avviso del sito. Il contatto e il canale vanno presi dal negozio. Oggi nel database c'è solo un numero fisso.

**Quando:** dopo il via di Nicola, con le anteprime già pronte sul sito. 🟡 Consenso del negoziante da verificare con @legale-privacy prima dell'invio.

**Oggetto dell'email:** «Pane Quotidiano, c'è un'anteprima per voi»

> Buongiorno, siamo MyCity. La vostra pagina è pronta e il 15 novembre apre ai clienti di Piacenza.
>
> Abbiamo guardato la vetrina come farebbe una cliente. I testi nuovi li abbiamo scritti noi: voi non dovete scrivere nulla.
>
> Aprite il sito e guardate l'anteprima. Se va bene, premete «Approva». Se no, premete «Non ora». Non pubblichiamo nulla senza il vostro sì.
>
> Una cosa sola ci serve: in negozio avete pane e miele? Li possiamo mettere in vetrina?
>
> Rispondete dal sito, quando avete un momento.

Il testo regge perché porta già i testi scritti e chiede una cosa sola. Non nomina commissioni né sconti. Riuscita: risposta entro 48 ore.

## Dettagli tecnici

- Registro: `prodotto.paletti` (punti 3, 4, 8), `negozi.ingresso` e `pricing.commissione` in `MyCity-Vault/90-Memoria-AI/registro-fatti.json`. Contesto in `CONTESTO_BUSINESS.md` §4.
- Storia del negozio: `consegne/account-negozi/2026-07-13-checkin-pane-quotidiano-sentinella.md` e `2026-07-06-anti-churn-pane-quotidiano-post-annullamento.md`.
- Vetrina vista da cliente: `01-vetrina-vista-da-cliente.md`. Bozze dati: `03-bozze-dei-dati.md`.
- Effetto atteso sui KPI: ordini consegnati da 0 a almeno 1 entro il 21/11, e a 3 o più entro il 12/12. Sono stime mie, non misurate.
- Scorecard 1-5: diagnosi 4, mestiere 4, dati reali 4, cliente 4, foresight 3, documentazione 3. Assi più bassi: foresight e documentazione, perché le soglie non sono tarate su ordini veri.
