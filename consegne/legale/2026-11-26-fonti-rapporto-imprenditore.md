---
tipo: parere-legale
data: 2026-11-26 14:53
autore: legale-privacy — bozza, da far validare da un legale abilitato prima dell'uso reale
per: AD, sessione dei flussi (n8n), sessione del sito
fonte: PIANO.md del 26/11 (Le fonti, Avvertenze legali), CONTESTO_BUSINESS.md righe 160-166, termini letti il 26/11
---

# Le tre fonti a pagamento del rapporto: cosa permettono le loro regole

## In parole semplici
Questo parere serve a dire cosa possiamo fare coi dati di tre fonti a pagamento, prima di accenderle. Le usa il rapporto che vendiamo a chi si iscrive.
Le fonti sono Google, Tripadvisor (il sito di recensioni di ristoranti e hotel) e DataForSEO. Ho letto oggi le loro regole.
Google, per chi paga da un indirizzo europeo, è più stretto di quanto dice il piano. Voto, recensioni e orari non si salvano, nemmeno per 30 giorni.
Google non permette neppure di copiarli in un rapporto che vendiamo. Si possono mostrare solo nel suo riquadro ufficiale, caricato in diretta.
Per esempio (caso inventato): un bar di via Roma si iscrive oggi. Il preventivo può mostrare il riquadro Google col suo 4,5 e le recensioni.
Non può scrivere «4,5» nella nostra tabella accanto a «4,1, la media dei 6 bar vicini»: quella media coi dati Google è vietata.
Tripadvisor ha forse chiuso la vecchia interfaccia il 31/8/2026, secondo siti non ufficiali. Prima di usarla serve il suo sì scritto.
DataForSEO non si prende il rischio verso Google: il suo contratto lo ribalta su di noi.
Sulle recensioni la regola del piano regge: solo temi («lodano il caffè»), mai nomi, mai testi.

## Cosa cambia per te
- Google: il preventivo mostra il riquadro di Google (voto, recensioni, orari) così com'è. Niente numeri Google nelle nostre tabelle o nei PDF.
- Concorrenti: il voto medio dei vicini calcolato da noi coi dati Google non si può fare. Il loro numero, da OpenStreetMap, sì.
- L'assaggio di 3-4 numeri si fa con numeri nostri: concorrenti vicini, ricerche su Google a Piacenza, velocità del sito. Accanto, il riquadro Google.
- Tripadvisor resta spenta finché Tripadvisor non conferma per iscritto l'uso «analisi venduta a un'impresa».
- DataForSEO: ricerche e posizioni sì. Recensioni solo come temi, con un rischio residuo che resta nostro.

## Cosa devi fare
- Decidere se accetti il rischio residuo di DataForSEO sulle recensioni. Raccomando sì: solo temi, testi cancellati a fine lettura.
- Far leggere questa bozza a un legale abilitato prima di accendere le fonti: la firma resta sua.

## Cosa non ho verificato
- Le regole europee di Google le ho lette per intero. La pagina Google sui loghi e sulle attribuzioni era bloccata dalla rete di questa sessione.
- Le pagine di Tripadvisor e di DataForSEO erano bloccate anche loro. Le ho lette solo negli estratti di un motore di ricerca: è un'affidabilità media.
- Do per scontato che il conto con cui MyCity paga Google (Google Cloud) sia intestato in Italia. Se l'indirizzo è fuori dall'Europa valgono altre regole.
- Il testo della legge europea sulla privacy (GDPR) non l'ho riaperto oggi. Gli articoli citati sono stabili, ma il legale li riconferma.

---
## Dettagli tecnici

**1. Google Places API (New) — verdetto: NO come previsto dal piano; SÌ con condizioni tramite Places UI Kit.**
Termini EEA (fatturazione in Italia): §15.2 + «Permitted Uses» ammettono solo 9 usi. Un rapporto venduto non c'è; l'uso (3), «sales team's customers or opportunities», copre solo la vista interna del nostro commerciale.
§15.1: nessun dato Places «With any Map», cioè sopra, accanto o collegato a una mappa, anche Google. §15.3: UI Kit esente da 15.1 e 15.2.
Conservazione: `place_id` per sempre (§A.3); lat/lng al massimo 30 giorni (§15.4); tutto il resto zero (ToS 3.3.2(b)). ToS 3.3.2(a)(iii) vieta «copy and save business names, addresses, or user reviews».
ToS 3.3.2(c): niente contenuti creati dai dati Google, quindi niente temi AI dalle recensioni Places. ToS 3.2.2: i nostri termini rimandano ai Google Maps Additional Terms e alla Google Privacy Policy.
Codice: DB = solo `place_id` (+ lat/lng con cancellazione a 30 gg); riquadro `<gmp-place-details>` lato browser; attribuzione intatta (§16.1); niente PDF/email con dati Google; niente medie dei concorrenti.
Fonti: [EEA Service Specific Terms, mod. 28/10/2026](https://cloud.google.com/terms/maps-platform/eea/maps-service-terms) · [EEA Places Permitted Uses, mod. 4/6/2025](https://cloud.google.com/terms/maps-platform/eea-places-api-permitted-uses) · [EEA ToS, mod. 26/8/2026](https://cloud.google.com/terms/maps-platform/eea). NON aperta (proxy 403): [Places policies/attribuzione](https://developers.google.com/maps/documentation/places/web-service/policies).

**2. Tripadvisor Content API — verdetto: NO per ora.** Chiusura legacy il 31/8/2026 e passaggio a «Terra» riportati solo da fonti non ufficiali ([stayapi](https://stayapi.com/blog/tripadvisor-reviews-api), [apigraveyard](https://apigraveyard.com/tripadvisor-content-api/)): la FAQ «5.000 gratis» del piano potrebbe riguardare un prodotto spento.
Caching (policy ufficiale, letta via estratti): solo `location_id`; ogni altro campo «no caching, storing or indexing». Display: logo e bolle Tripadvisor dall'API, link alla pagina, recensione intera con data.
Uso B2B / analisi venduta: nessun testo ufficiale trovato. Fonti secondarie: API pensata per siti di viaggio rivolti al pubblico; reputation management escluso; AI oltre l'ambito solo con accordo firmato.
Codice, se arriva il sì scritto: salvare solo `location_id`, mostrare in diretta con logo+bolle+link, niente temi AI.
Fonti (solo estratti): [caching legacy](https://tripadvisor-content-api.readme.io/reference/caching-policy) · [caching Terra](https://docs.terra.tripadvisor.com/docs/caching-policy) · [display Terra](https://docs.terra.tripadvisor.com/docs/display-requirements) · [Master Terms Terra](https://docs.terra.tripadvisor.com/docs/api-master-terms) · [FAQ legacy](https://developer-tripadvisor.com/content-api/FAQ/).

**3. DataForSEO — verdetto: SÌ con condizioni.** ToS §7.1 vieta usi che danneggiano i motori di ricerca; §7.2: il cliente manleva DataForSEO per violazioni dei loro termini → il rischio è NOSTRO, non «suo» come dice il piano.
Il DPA ci fa titolari, unici responsabili di liceità e minimizzazione. La FAQ vieta di rivendere i dati grezzi come flusso; i dati trasformati nei rapporti ai clienti sono l'uso tipico. Rischio extra: siamo clienti Google Maps (ToS 3.3, «will not permit a third party to»): tenere le due filiere separate.
Codice: testi recensioni solo in memoria, cancellati a fine lettura (max 24 h); salvare solo tema + conteggio; mai testi all'imprenditore; volumi e posizioni salvabili come numeri, etichettati «stima». Regole di conservazione DataForSEO non lette.
Fonti (solo estratti): [Terms of Service](https://dataforseo.com/terms-of-service) · [FAQ legali](https://dataforseo.com/help-center/quick-answers-to-frequently-asked-legal-questions).

**4. GDPR — verdetto: SÌ con condizioni.** Nomi, foto, profili e testi dei recensori sono dati personali (art. 4.1), anche se pubblici. Regola: solo temi aggregati; un tema compare solo se lo citano ≥3 recensioni; zero citazioni e zero nomi (art. 5.1.c).
Basi: titolare dell'attività (ditta individuale = persona fisica) → art. 6.1.b, misure precontrattuali chieste con l'iscrizione, poi contratto. Recensori → art. 6.1.f con bilanciamento scritto (LIA, @dpo); informativa via art. 14.5.b, paragrafo pubblico nella privacy.
Per il rapporto MyCity è titolare autonomo: la riga 164 di CONTESTO (MyCity «responsabile») vale per i clienti del negozio, non qui. Informativa titolari: va aggiornata, con le fonti (art. 14.2.f), cosa si vede prima di pagare e i tempi.
Il testo passa al fornitore AI: DPA e trasferimento extra-UE da verificare con @dpo. Fonte: [GDPR, Reg. UE 2016/679](https://eur-lex.europa.eu/eli/reg/2016/679/oj) (non riaperto oggi).

**5. Cosa scrivere accanto al dato**
| Fonte | Riga nel rapporto |
|---|---|
| Google (UI Kit) | «Scheda mostrata in diretta da Google Maps. MyCity non salva questi dati.» (+ l'attribuzione del riquadro, intatta) |
| Tripadvisor (se approvata) | Logo + bolle + «Leggi su Tripadvisor» (link) · «Dati Tripadvisor, letti il 26/11/2026 alle 14:53» |
| DataForSEO, ricerche | «Stima delle ricerche su Google a Piacenza, fonte DataForSEO, novembre 2026. Non è un dato ufficiale Google.» |
| DataForSEO, posizione | «Posizione su Google rilevata il 26/11/2026 (fonte DataForSEO): cambia da persona a persona.» |
| Temi recensioni | «Temi ricavati da 48 recensioni pubbliche lette il 26/11/2026. Non conserviamo nomi né testi.» (48 = esempio) |
