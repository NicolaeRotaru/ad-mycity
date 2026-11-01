---
data: 2026-11-01 17:55
tipo: referto
fonte: AD digitale, sesta sessione (controllo e unione)
richiesta: cinque sessioni in parallelo con due ondate a testa, e una sesta che controlla e unisce (Nicola, 1/11)
---

# Le cinque sessioni del 1/11: cosa è chiuso e cosa tocca a te

**In due righe:** 51 difetti seri del sito su 84 sono chiusi e collaudati, tutti in una sola richiesta da unire. Qui sotto trovi i tuoi passi in ordine e le scelte col mio consiglio.

## In parole semplici

Cinque sessioni hanno lavorato insieme sui difetti seri del sito. Ognuna aveva i suoi file, così nessuna pestava i piedi alle altre.
Io ho fatto la sesta: non ho costruito niente. Ho fatto collaudare ogni pezzo da agenti nuovi, che avevano il compito di trovare guasti.
Il collaudo ha bocciato 7 pezzi. Sei sono stati corretti finché hanno retto. Il settimo è il reso pagato col credito MyCity: non ha retto per tre volte ed è rimasto fuori.

## Cosa cambia per te

Un esempio concreto: oggi il catalogo del fornaio ha 7 alimenti senza allergeni né ingredienti. Con la migrazione 195 com'era scritta alle 15 del 1/11, sarebbero diventati tutti non comprabili. Il collaudo l'ha fermata, e adesso restano comprabili.

| Sessione | Difetti seri chiusi |
|---|---:|
| Soldi e cassa | 16 su 21 |
| Ordine, resi e fattorino | 9 su 17 |
| Testi legali, catalogo e home | 12 su 15 |
| Barra in alto, AI e accessi | 5 su 17 |
| Messa online, copie ed email | 9 su 13 |
| **In tutto** | **51 su 84** |

La falla R7 conta fra gli 84 ma non sta in nessuna sessione: è tua, su Supabase.

## Cosa devi fare

### Prima di unire

Non applicare la migrazione 195 e non cambiare i modelli email di Supabase. Col codice che c'è oggi su main romperebbero il sito.

### Dopo l'unione, in quest'ordine

- **Primo:** completa allergeni e ingredienti dei 7 alimenti del fornaio. La legge li chiede per la vendita online.
- **Secondo:** premi il pulsante delle migrazioni. Applica tutte quelle che mancano, anche le 4 nuove.
- **Terzo:** su Supabase accendi «Secure password change». Poi cambia i due modelli email.
- **Quarto:** su GitHub metti i segreti di Vercel e accendi la regola «Main». Dopo, dimmelo: preparo io l'ultimo passo.
- **Quinto:** su Vercel metti la chiave di servizio del database. Serve alla copia delle foto e alla privacy.
- **Sesto:** mandami indirizzo e telefono del titolare. Partita IVA e PEC arrivano dopo.
- **Da non fare:** non riattivare il fattorino sospeso. Non ha nessun documento.

### Le scelte sui soldi

- **Chi paga i codici sconto di MyCity?** Oggi li paga il negozio. Su 20 euro di pane con 5 euro di sconto, il negozio incassa 13,50 euro invece di 18. Consiglio: li paga MyCity, perché servono a trovare clienti.
- **Contestazione vinta in parte.** Oggi al negozio togliamo la quota appena la banca apre la contestazione. Consiglio: non togliere niente all'apertura, e riprendere a mano solo se perdiamo.
- **Contestazioni già aperte prima della correzione.** Consiglio: prima un confronto con Stripe, ordine per ordine, in sola lettura. Poi correggiamo solo quelle senza una contestazione vera.
- **Buoni regalo vecchi.** Consiglio: sì al recupero, ma prima un giro di prova che non scrive niente.

### Le scelte sui fattorini

- **Il cliente vede il numero del fattorino?** Consiglio: no. Il pulsante chiama il negozio.
- **Quando il fattorino rinnova patente o polizza, la ricontrolliamo?** Consiglio: sì, prima che la data nuova valga.
- **Chi paga la polizza dei fattorini?** La pagina d'aiuto prometteva che la pagava MyCity. Adesso non lo promette più, finché non decidi tu.
- **Se la consegna si annulla per colpa del cliente, il fattorino è pagato?** Consiglio: sì, solo se il supporto lo conferma.

### Le scelte su legale e prodotto

- **«Contatta il negozio» o WhatsApp?** Consiglio: WhatsApp, finché email e avvisi al negozio non funzionano del tutto.
- **La regola che lascia al negozio modificare i prodotti dal browser.** Consiglio: chiuderla, ma solo dopo aver spostato sul server il salvataggio della scheda.
- **Il modello AI che si spegne il 30 novembre.** La sessione propone un sostituto che costa uguale. Il prezzo va controllato prima di cambiarlo.

## Cosa non ho verificato

- Niente è stato provato su un telefono vero, in produzione o con Stripe vero. Ci sono solo prove automatiche e prove su un database locale.
- Nel registro dei difetti chiudo i 51 solo dopo la tua unione, voce per voce.
- I 33 rimasti li ho divisi a occhio, non a conto esatto. Circa 17 aspettano un tuo passo, circa 12 non reggono, e circa 4 erano già a posto alla base.
- Il prezzo del modello AI proposto non l'ho controllato io.

---

## Dettagli tecnici

- Richiesta unica: NicolaeRotaru/mycity#280, ramo `claude/hopeful-dirac-jneoam`, testa `79b1801`, base `ecb8e2c`.
- Unite dentro: #275, #276, #277, #278 e #279 (le ondate), poi #281, #283, #284 e #285 (le correzioni). Fuori: #282.
- `npm run verify` col database locale: 7.493 prove su 7.493. Le prove SQL sono tutte verdi, comprese rls/44, 45, 46 e 47.
- Le migrazioni nuove sono la 185, la 186, la 191 e la 195. Le vecchie da applicare in produzione sono la 131, la 150 e la 181.
- Letture in sola lettura sul database di produzione del 1/11:
  - 9 prodotti in vendita, di cui 7 alimenti senza dichiarazioni;
  - 1 profilo sospeso, un fattorino senza documenti e mai approvato;
  - 2 negozi approvati, con chi li ha approvati e la partita IVA;
  - la 126 è già applicata.
- Referti delle sessioni:
  - per la macchina, `consegne/audit/2026-11-01-sessione-S1…S5-referto.json`;
  - in parole, sui rami `claude/cinque-s*` di ad-mycity.
- Territori: `consegne/audit/2026-11-01-cinque-sessioni-territori.json`. Confini: `consegne/audit/2026-11-01-cinque-sessioni-confini.py`.
- Le prove rosse dei collaudatori stanno sul ramo d'appoggio `claude/collaudo-finale-prove-rosse` del sito, che non si unisce.
- Le falle R14, R15 e R83 hanno i dettagli solo nei messaggi fra sessioni.
- Tempo e costo: dalle 13:18 alle 17:50. Gettoni dichiarati dalle sessioni: fra 0,6 e 0,9 milioni per ondata, senza le riletture dalla cache. Nicola misura circa il 10% del tetto settimanale.
