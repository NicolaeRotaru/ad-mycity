---
data: 2026-11-01 20:05
tipo: referto
fonte: AD digitale, sesta sessione (controllo e unione)
richiesta: cinque sessioni in parallelo con due ondate a testa, e una sesta che controlla e unisce (Nicola, 1/11)
---

# Le cinque sessioni del 1/11: cosa è chiuso e cosa tocca a te

**In due righe:** dei difetti seri del sito ne sono chiusi 46 su 84, ognuno con una prova, e 1 era già a posto prima. Prima dell'unione ti avevo scritto 51: era sbagliato, e qui sotto c'è il perché.

## In parole semplici

Cinque sessioni hanno lavorato insieme sui difetti seri del sito. Ognuna aveva i suoi file, così nessuna pestava i piedi alle altre.
Io ho fatto la sesta: non ho costruito niente. Ho fatto collaudare ogni pezzo da agenti nuovi, col compito di trovare guasti.
Hai unito tutto alle 18:17 del 1/11, nella NicolaeRotaru/mycity#280. Dopo l'unione ho fatto ricontrollare ogni chiusura, una per una, prima di scriverla nel registro.

## Cosa cambia per te

Un esempio concreto: oggi il catalogo del fornaio ha 7 alimenti senza allergeni né ingredienti. Con la migrazione 195 com'era scritta alle 15 del 1/11, sarebbero diventati tutti non comprabili. Il collaudo l'ha fermata, e adesso restano comprabili.

| Sessione | Difetti seri chiusi |
|---|---:|
| Soldi e cassa | 16 su 21 |
| Ordine, resi e fattorino | 8 su 17 |
| Testi legali, catalogo e home | 10 su 15 |
| Barra in alto, AI e accessi | 5 su 17 |
| Messa online, copie ed email | 7 su 13 |
| **In tutto** | **46 su 84** |

La falla R7 conta fra gli 84 ma non sta in nessuna sessione: è tua, su Supabase. Un difetto della barra in alto, il cookie di accesso a 6 mesi, era già a posto prima del lotto: l'ho segnato così, e non lo conto come lavoro di oggi.

### Perché 46 e non 51

Dopo l'unione, cinque collaudatori nuovi hanno riletto ogni chiusura sul codice unito. Si chiedevano una cosa: il codice chiude tutto il difetto, o solo un pezzo?
- **Uno dei 51 non era fra gli 84.** È il fattorino che poteva scrivere la sua posizione su un ordine annullato: un difetto vecchio, trovato e chiuso strada facendo. L'ho scritto nel registro come voce nuova, già riparata.
- **Quattro erano chiusi solo in parte**, nel pezzo che il titolo dice ancora rotto. Per esempio, la mappa per Google non mostra più le categorie vuote, ma la pagina che parte dal server sì. Restano aperti, con una nota che dice cosa manca.
- **Uno non era chiuso per niente**: le foto delle categorie in home. La prova copriva le categorie vuote, non le foto.
- **Sette erano chiusi nel caso del titolo, ma con un avanzo.** Li ho chiusi, e ogni avanzo ha la sua voce nuova. Il più serio riguarda i soldi: in un carrello di due negozi, con un rimborso già diviso dal pannello, il reso ripreso dopo un guasto toglie due volte la quota al negozio. È raro, ma è grave.

### Cosa c'è adesso nel registro

- Le voci nuove sono 80: difetti nati durante il lavoro, difetti vecchi visti strada facendo, e gli avanzi. Di queste, 17 sono già riparate con la loro prova.
- I difetti seri aperti del sito sono 39 su 2301 voci. Sono i 37 rimasti degli 84, più due gravi nuovi: il rimborso diviso e i 7 alimenti senza dichiarazioni.
- Ogni difetto serio rimasto aperto ha una riga che dice perché: una tua scelta, un pezzo che non ha retto, o un file di un'altra sessione.

## Cosa devi fare

### I tuoi passi, in quest'ordine

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
- Alcune voci nuove dicono «da provare su un telefono vero», come la posizione che il pulsante SOS manda a MyCity. Non le ho provate.
- Per il cookie già a posto ho rilanciato la prova, 2 verdi su 2, ma non l'ho rotta apposta per vederla diventare rossa.
- Le prove SQL dei collaudatori dopo l'unione non sono girate: su questa macchina il database locale era spento. Le ha fatte girare la CI della #280, verde.

---

## Dettagli tecnici

- Richiesta unica: NicolaeRotaru/mycity#280, unita alle 18:17 del 1/11 nel commit `21212f9a`. L'albero è identico alla testa provata `79b1801`.
- Unite dentro: #275, #276, #277, #278 e #279 (le ondate), poi #281, #283, #284 e #285 (le correzioni). Fuori: #282.
- `npm run verify` col database locale, sulla testa: 7.493 prove su 7.493. Le prove SQL sono tutte verdi, comprese rls/44, 45, 46 e 47.
- Le migrazioni nuove sono la 185, la 186, la 191 e la 195. Le vecchie da applicare in produzione sono la 131, la 150 e la 181.
- Registro: `MyCity-Vault/90-Memoria-AI/auto-coscienza/radiografia-marketplace.json`, scritto alle 20:01. Le chiusure le ha scritte `cervello/chiudi-sito.mjs`: 63 in tutto, 46 degli 84 più 17 voci nuove, con 0 chiavi orfane.
- I due giri di controllo dopo l'unione:
  - `wf_88c90934-76a` preparava le voci, con 5 `tech` che scrivevano e 5 `qa` che contestavano. Gettoni senza le letture dalla cache: 2.516.095; con le letture: 80.877.062.
  - `wf_ef89f60e-5c7` ricontrollava le chiusure, con 5 `qa`. Gettoni senza le letture dalla cache: 1.066.253; con le letture: 42.853.783.
- Lettura in sola lettura sulla produzione, la sera del 1/11 prima della scrittura delle 20:01: i profili respinti sono 0. Per questo la voce dei 90 giorni dopo un rifiuto si chiude: non c'è nessun respinto vecchio da sistemare.
- Le 73 voci in stato `doppione` non passano il conto delle voci scritte male di `cervello/lotto-a-pacchetti.md` ⑨, perché il conto non conosce quello stato. C'erano già prima di stasera, ed è debito del conto.
- Referti delle sessioni: per la macchina, `consegne/audit/2026-11-01-sessione-S1…S5-referto.json`; in parole, sui rami `claude/cinque-s*` di ad-mycity.
- Territori: `consegne/audit/2026-11-01-cinque-sessioni-territori.json`. Confini: `consegne/audit/2026-11-01-cinque-sessioni-confini.py`.
- Le falle R14, R15 e R83 hanno i dettagli solo nei messaggi fra sessioni. Nel registro, R14 e R83 sono chiuse; la seconda parte di R83 e un suo residuo minore hanno due voci col titolo generico.
