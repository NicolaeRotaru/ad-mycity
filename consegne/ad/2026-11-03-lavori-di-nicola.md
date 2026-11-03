---
data: 2026-11-03 07:15
tipo: analisi
fonte: AD digitale
richiesta: «fai un'analisi completa e profonda di tutti i lavori che devo fare io» (Nicola, 2026-11-03)
---

# I tuoi lavori, martedì 3 novembre: cosa blocca l'apertura e in che ordine farli

> **In due righe.** Ho messo insieme la tua lista, le carte in attesa e le scelte del 1/11, e ho controllato il sito vero in sola lettura. I passi di lunedì 2/11 risultano ancora da fare, e mancano 12 giorni al 15/11.

## In parole semplici

Il sito è pronto quasi tutto dal lato del codice. Quello che manca adesso passa quasi solo dalle tue mani: chiavi, firme, persone vere.

Ho guardato il sito vero stamattina alle 07:15. Le chiavi su Vercel sono le stesse del 10 ottobre. Il database ha gli aggiornamenti fino al numero 163, e ne mancano 15. Il negozio di prova è ancora in vetrina.

Vuol dire una cosa sola: oggi nessun cliente può fare un ordine, né in contanti né con la carta. Manca la chiave di servizio del database, e senza quella la cassa non registra niente.

Le cose da fare sono tante, ma si raccolgono in **cinque sedute**. Quattro durano un'ora o un'ora e mezza, l'ultima un quarto d'ora. Le trovi più sotto, in ordine.

## Cosa cambia per te

- **La data del 15/11 dipende dalla partita IVA.** La carta chiede il conto Stripe di MyCity, e il conto chiede la partita IVA. Hai scelto di non aprire senza carta.
- **Un esempio coi giorni.** Se apri la partita IVA mercoledì 4/11 e Stripe verifica in tre giorni, la carta è pronta verso l'11. Se Stripe ci mette due settimane, si apre verso il 20.
- **Una buona notizia sugli allergeni.** Ti avevo scritto «7 alimenti del fornaio». Ho ricontato: 4 sono del fornaio, gli altri sono del negozio di prova. Se cancelli prima il negozio di prova, il lavoro si dimezza.
- **Una dozzina di voci delle tue liste non sono più tue.** Sono già fatte, oppure le hai decise il 1/11. Le trovi nella sezione 6, così le togli dalla testa.

## Cosa devi fare

- **Oggi, per prima cosa, cinque minuti:** avvia su Resend la verifica del dominio, perché può durare ore. Poi la seduta 1, da solo.
- **Oggi stesso, la seduta 2 con me:** il cambio della chiave del database. È il passo che sblocca il sito. Scrivimi «inizio la chiave» quando hai un'ora di fila.
- **Appena puoi, la seduta 3:** il commercialista, e subito dopo il conto Stripe di MyCity.
- **Per le scelte brevi:** rispondi «ok consigli» e prendo tutti i miei consigli della sezione 4. Oppure correggi solo quelle che vuoi.

## Cosa non ho verificato

- **Stripe non lo vedo.** Il collegamento a Stripe di questa sessione chiede un'autorizzazione nelle impostazioni dei connettori di claude.ai. Non so se il fornaio ha finito il suo conto, né se hai aperto quello di MyCity.
- **GitHub, Resend, Netsons e Hetzner non li ho guardati.** Non so se hai messo i segreti o la regola «Main».
- **Non so cosa è successo dal commercialista lunedì.** Nessuna traccia in memoria dopo il 1/11 alle 23:07. Se ci sei andato, dimmelo e riscrivo il piano.
- **I minuti sono stime,** presi dalle carte. Non li ho misurati.

---

## 1 · La fotografia di oggi, letta sul sito vero

Letta martedì 3/11 alle 07:15, in sola lettura, senza scrivere niente.

| Cosa ho guardato | Cosa ho trovato | Cosa vuol dire |
|---|---|---|
| Chiavi del sito su Vercel | 12, le stesse del 10 ottobre | La cassa non può registrare nessun ordine |
| Email, carta, allarmi su Vercel | Nessuna chiave di Resend, Stripe, Sentry, Upstash | Niente email ai clienti, niente carta, nessun allarme sugli errori |
| Aggiornamenti del database | Fermi al numero 163, del 18 ottobre | Ne mancano 15, dal 164 al 195: tutto il lavoro delle ondate del 31/10 e del 1/11 |
| Negozio di prova | Ancora in vetrina, approvato, con 4 prodotti in vendita | Il cliente lo vede come un negozio vero |
| Prodotti senza allergeni o ingredienti | 4 su 5 del fornaio, 4 su 4 del negozio di prova | La legge li chiede anche online |
| Testo grande della home | Dice ancora «abbigliamento» e «30-60» | Promette cose che non facciamo |
| Codici sconto attivi | Nessuno | Fatto: li avevi spenti tu |
| Fattorino di prova | Sospeso, senza documenti | Giusto così: non riattivarlo |
| Ordini nel database | Uno solo, del 24 giugno | Era una prova: nessun cliente vero finora |

## 2 · La strada fino al 15/11: cosa aspetta cosa

Il punto è uno solo. Quasi ogni passo aspetta un passo tuo che viene prima.

1. **La chiave del database** sblocca la cassa, le email automatiche, la copia delle foto e i lavori di notte. Senza, il resto non serve.
2. **Gli aggiornamenti del database** si applicano dopo la chiave. Portano il lavoro di 14 richieste di unione già unite.
3. **La partita IVA** sblocca il conto Stripe di MyCity e il tuo nome completo sul sito.
4. **Il conto Stripe di MyCity e quello del fornaio** sbloccano la carta. È l'unico passo di cui non conosciamo i tempi.
5. **Il primo giro a mano dei lavori di notte**, fatto insieme, sblocca l'interruttore che li accende da soli.

I primi due passi li fai in un'ora, oggi stesso, e non dipendono da nessuno. Il terzo dipende dal commercialista. Il quarto dipende da Stripe.

## 3 · Le cinque sedute, in ordine

### Seduta 1 · Da solo al computer · circa un'ora e mezza

Si fa prima della seduta 2, o anche lo stesso giorno. Il primo passo va fatto subito, perché la verifica può durare ore.

- **Su Resend avvia la verifica del dominio del mittente.** Intanto che aspetti, fai il resto.
- **Cancella il negozio di prova** con il comando già pronto nell'editor SQL di Supabase. Tre minuti, non si annulla. Lo stesso giorno va spenta anche la vetrina «Trending ora».
- **Cambia il testo grande della home** dal pannello dell'amministratore. Testo proposto: «Ordini dai negozi del tuo quartiere in pochi tap: ti portiamo la spesa a casa all'ora che scegli, e paghi alla consegna.» Due minuti.
- **Su Supabase, in una visita sola:** accendi «Secure password change» e la protezione dalle password rubate. Aggiungi il www agli indirizzi di rientro. Cambia i due modelli email della nuova password.
- **Crea la casella info@** nel pannello Netsons e inoltrala alla tua Gmail.
- **Accendi la verifica in due passaggi** su Gmail, Vercel, Supabase, Stripe, Resend, Netsons e Hetzner. Mezz'ora. Fra pochi giorni passeranno soldi veri da quegli account.

### Seduta 2 · Con me · circa un'ora

È la seduta che sblocca il sito. Ti guido io passo per passo, in chat.

- **Cambiamo la chiave del database.** Prima mettiamo la chiave nuova su Vercel per il sito e per il Pannello. Solo dopo spegniamo la vecchia.
- **Metti su Vercel la chiave di servizio nuova.** Poi la chiave di Resend, il mittente, la casella del supporto e le due chiavi di Upstash.
- **Premi il pulsante degli aggiornamenti del database.** Ne applica 15.
- **Facciamo insieme il primo giro a mano dei lavori di notte.** Se va bene, accendi l'interruttore che li fa partire da soli.
- **Subito dopo, la decisione sul Garante della privacy**, col responsabile della privacy. La scadenza che ti avevo dato era il 27 ottobre, quindi è passata da una settimana. Più si aspetta, peggio è.
- **Su GitHub, se resta tempo:** i segreti di Vercel e la regola «Main». Poi dimmelo, e preparo l'ultimo passo del rilascio controllato.

### Seduta 3 · Il commercialista · circa un'ora, più l'attesa

- **Le domande sono cinque**, in un foglio già pronto. La prima decide quasi tutto il costo: se devi pagare i contributi da commerciante, circa 3.000-4.600 euro l'anno.
- **Aggiungi una domanda sull'assicurazione.** Da ditta individuale nel commercio l'INAIL non ti copre quando consegni. Chiedigli se la polizza infortuni è deducibile e quanto costa di solito.
- **Esci con:** partita IVA, PEC, iscrizione alla Camera di Commercio.
- **Uscito dallo studio:** apri il conto Stripe di MyCity. Poi mandami partita IVA e PEC: le metto sul sito io, in una richiesta di unione.

### Seduta 4 · La visita al fornaio · circa un'ora e mezza

Una visita sola, con tutto dentro, così non torni due volte.

- **Allergeni e ingredienti dei suoi 4 prodotti.** Li scrive lui, o te li detta: ne risponde lui per legge.
- **Il suo conto Stripe:** finitelo insieme dal suo telefono.
- **IBAN, sede, categorie e foto** dei prodotti. Le schede le scrivo io dopo, dalle tue foto.
- **Due frasi sue e una foto al banco**, col suo consenso scritto.
- **Il permesso per il cartello col QR** in negozio.
- **Una foto del cartello degli orari.** Mi serve per controllare che le fasce del sito seguano gli orari veri.
- **Dagli il tuo numero** per l'allarme: fino all'app che suona, a ogni ordine lo chiami tu.

### Seduta 5 · Le scelte brevi · circa un quarto d'ora

Le trovi tutte nella sezione 4, ognuna col mio consiglio. Basta «ok consigli».

### Fuori dalle sedute

- **La borsa termica**, prima del primo ordine. È la prima cosa che il cliente vede.
- **Il tuo account da fattorino**, con un'email diversa da quella dell'amministratore.
- **Il primo ordine vero in contanti**, consegnato da te, guardando il sito dal telefono.

## 4 · Le scelte che aspettano te, col mio consiglio

Sono 20. Se rispondi «ok consigli», prendo il consiglio scritto accanto a ognuna.

**Soldi**
1. Chi paga i codici sconto di MyCity? → **Li paga MyCity.** Su 20 euro di pane con 5 di sconto, oggi il negozio incasserebbe 13,50 invece di 18.
2. La carta contestata dal cliente: quando togliamo la quota al negozio? → **Solo se perdiamo**, non all'apertura della contestazione.
3. Le contestazioni aperte prima della correzione? → **Prima un confronto con Stripe in sola lettura**, poi correggiamo.
4. I buoni regalo vecchi? → **Sì al recupero**, dopo un giro di prova che non scrive niente.
5. Quanto costa un bonifico sul tuo conto? → È un'informazione, non una scelta: mi serve per il conto di ogni ordine in contanti.
6. Una casa unica per tutti i costi nel registro dei fatti? → **Sì.**

**Consegne e fattorini**
7. I 5 km si misurano in linea d'aria o per strada? → **Per strada**, perché è la strada che fai in bici.
8. Il cliente vede il numero del fattorino? → **No**, il pulsante chiama il negozio.
9. Quando il fattorino rinnova patente o polizza, la ricontrolliamo? → **Sì**, prima che la data nuova valga.
10. Chi paga la polizza dei fattorini? → **Decidi dopo il primo fattorino vero.** Oggi consegni solo tu, e il sito non promette più niente.
11. Consegna annullata per colpa del cliente: il fattorino è pagato? → **Sì**, se il supporto lo conferma.
12. Alla porta apre chi non ha il codice del cliente: cosa fai? → **Consegni solo con il codice.** Altrimenti chiami il cliente; se non risponde, riporti la merce al negozio e l'ordine si chiude come mancata consegna.
13. Il freno della consegna veloce che non trova una fascia libera: l'euro in più resta? → **Toglierlo anche lì**: il cliente ha aspettato.
14. Fino a quando la cassa accetta le fasce vecchie? → **Una settimana**, cioè fino al 7/11.
15. La borsa frigo: faccio verificare prima cosa chiede l'ASL? → **Sì**, prima della spesa.

**Sito e regole**
16. «Contatta il negozio» o WhatsApp? → **WhatsApp**, finché email e avvisi al negozio non funzionano del tutto.
17. La regola che lascia al negozio modificare i prodotti dal browser? → **Chiuderla**, dopo aver spostato il salvataggio sul server.
18. Il modello di intelligenza artificiale che si spegne il 30/11? → **Lasciarlo spento.** Il 1/11 hai deciso che le funzioni con l'IA a pagamento restano spente.
19. Il rilascio controllato: subito prima della carta, o un giro adesso? → **Subito prima della carta**, insieme ai segreti di GitHub.
20. A chi deve somigliare il sito, e il codice al posto della password? → **Il gesto di Glovo con l'anima della bottega.** Il codice via email **sì, ma dopo l'apertura**: tocca l'ingresso, e cambiarlo a pochi giorni dal lancio è un rischio.

## 5 · I conti tuoi

Tre informazioni che solo tu hai. Servono a sapere quanto costa davvero MyCity ogni mese.

- **Le ricevute di Claude, Vercel e Supabase.** Claude dal sito costa circa 218 euro al mese. Se paghi 260-280, forse l'abbonamento è passato dall'iPhone, che costa di più.
- **Quanto paghi ogni mese di abbonamenti**, e quanti soldi ci sono in banca per MyCity.
- **Il costo di un bonifico** sul tuo conto (è anche la scelta 5).

## 6 · Cose che puoi togliere dalla testa

Stavano ancora nelle tue liste, ma non sono più tue. Nella tua lista le ho già spuntate in questa richiesta di unione; le carte le archivio al prossimo riordino.

- **Decidere sui Termini:** fatto il 1/11, sono in vigore dal 1 novembre. Resta solo la rilettura di un avvocato dopo il lancio.
- **Scegliere cosa vuol dire «senza difetti»:** deciso, zero bloccanti e zero gravi.
- **Dire se le fasce le copri tutte tu:** deciso il 1/11, sì, tutte e sette, in bici.
- **Unire le richieste delle squadre del sito:** fatto, tutte unite fino a quella del 1/11 alle 18:17.
- **Spegnere i codici sconto:** fatto, nel database non ce n'è nessuno attivo.
- **Regali o fresco a novembre:** deciso dai dati, fresco.
- **Due carte già fatte** restano nella coda solo in attesa dell'archivio: le fasce nuove e il metodo snello.
- **Due aggiornamenti del database** che il referto del 1/11 dava da applicare risultano già applicati: quelli del tetto di spesa e delle email dell'ordine pronto.

## 7 · Dopo il 15/11

Sono rischi che hai scelto di correre, non dimenticanze. Te li ricordo quando arrivano gli ordini.

- **L'avvocato:** i Termini, il contratto col fornaio, i contanti che incassi per conto suo.
- **Il corso per chi trasporta alimenti.** In Emilia-Romagna è un obbligo, e una multa è possibile già dal primo giorno.
- **La polizza infortuni e di responsabilità civile.** Oggi, se cadi in consegna, non ti copre nessuno.
- **Una persona di riserva** per le consegne quando non ci sei.
- **Il comunicato stampa, il post del pudding, il benvenuto ai 4 iscritti.** L'ultimo aspetta da luglio: decidi se mandarlo o toglierlo.
- **La riscansione su Google, gli accordi privacy coi fornitori, il server dell'AD**, il bot per gli avvisi sul telefono.

## 8 · I rischi che vedo

- **La data scivola un giorno per ogni giorno senza partita IVA.** È l'unico passo di cui non controlli i tempi a valle, perché poi aspetti Stripe.
- **La chiave esposta resta esposta** finché non la cambiamo. Ogni giorno in più allarga la finestra, e rende più difficile la risposta al Garante.
- **Tutto passa da te.** Consegne, contanti, bonifici, allarmi. Se ti ammali la prima settimana, il servizio si ferma. Una persona di riserva costa poco e toglie il rischio più grosso.
- **Il 15/11 all'una di notte** scadono due date nei controlli della macchina. Le sistemo io entro il 14; a te tocca solo unire la richiesta.

---

## Dettagli tecnici

- **Letture in sola lettura del 2026-11-03 07:15:**
  - Vercel, progetto `mycity` (`prj_XvKD8R89QzA7qVyOhltfS85SH4k9`): 12 variabili di produzione, ultime create il 2026-10-10 13:43. Assenti: `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `RESEND_FROM`, `SUPPORT_EMAIL`, `STRIPE_*`, `SENTRY_DSN`, Upstash, `LAVORI_A_ORARIO`, `NEXT_PUBLIC_TITOLARE_*`. `TURNSTILE_SECRET_KEY` ha ancora l'avviso `readable-secret`.
  - Supabase `clmpyfvpvfjgeviworth`, `list_migrations`: ultima numerata `163_la_consegna_in_contanti_si_chiude_dopo_l_incasso`. Nel repo (`migrations/`, main `21212f9`) mancano 164, 165, 166, 168, 171, 178, 179, 180, 181, 183, 184, 185, 186, 191, 195. Le 131 e 150 sono registrate in produzione col loro nome (il referto `consegne/audit/2026-11-01-cinque-sessioni-referto.md` le dava da applicare).
  - SQL in sola lettura: venditori «Panificio Demo» e «Pane Quotidiano», entrambi `approved`; prodotti `available` 5 e 4; senza `attributes->>'allergeni'` o `->>'ingredienti'` 4 su 5 e 4 su 4 (conto senza il filtro di categoria alimentare della 195, che il 1/11 dava 7 su 9). Coupon attivi 0. Rider «Marco Bianchi» `suspended`, `is_approved=false`. Ordini 1, del 2026-06-24. `site_settings` contiene ancora «abbigliamento» e «30-60».
- **Corrispondenza sedute → carte:** seduta 1 = #195, #201, #210, #192, #207, #202 e la casella info@; seduta 2 = #203, #154, #210, #161, #177, #209 (migrazioni); seduta 3 = #209, #165, `consegne/legale/2026-11-01-domande-commercialista.md`; seduta 4 = #209, #180, #118, #120, #8, #222 (titolare); scelte = referto cinque sessioni, `LAVORO-APERTO.md` «Scelte brevi», #222, #186.
- **Scelte, da dove vengono:** 1-4 e 8-11, 16-18 dal referto delle cinque sessioni; 5-7, 12-15, 19 da `LAVORO-APERTO.md`; 13 = voce 1826 del registro del sito; 18 legata a `ad.uso-e-crediti` in `registro-fatti.json` (il 1/11 «le 18 funzioni del sito con l'IA a pagamento restano spente»); 20 = carta #222, scelte 1 e 2.
- **Carte che proporrei di archiviare** (non toccate in questa richiesta): #224 e #223 (già con «FATTO»), #213 (messaggio delle firme, spuntato nella lista), #212 (superata dalla #223), #15 (zona e fasce decise il 1/11, `consegna.raggio` e `consegna.fasce-orarie`).
- **Non letti:** Stripe (connettore da autorizzare), GitHub segreti e protezione dei rami, Resend, Netsons, Hetzner.
