---
tipo: piano
data: 2026-11-26 15:30
fonte: chat di Nicola con l'AD del 25 e 26 novembre 2026
stato: aggiornato alle 15:30 del 26/11
---

# Il rapporto dell'imprenditore — piano

## In parole semplici
Oggi l'analisi di un'attività nuova legge solo il web aperto: il suo sito e qualche elenco, al massimo 10 pagine.
Questo piano la porta a 12 parti, con fonti ufficiali e con i dati che l'AD segue già per MyCity.
Per esempio: per La Ragazzetta, un bar di Piacenza, il web non ha dato nemmeno l'indirizzo.
Con il riquadro ufficiale di Google il titolare vede la sua scheda in diretta. Con OpenStreetMap si contano i bar vicini.
Detto in un altro modo: più fonti vere, e un preventivo che mostra cosa dà ogni abbonamento.

## Cosa cambia per te
- Prima di pagare, il titolare vede un assaggio di 3-4 numeri veri. Il rapporto intero arriva dopo l'abbonamento.
- L'analisi cambia da Base a Business a Premium. Il preventivo mostra cosa c'è e cosa no. I prezzi restano uguali.
- L'analisi dei concorrenti sui social e sul web diventa la parte 12 del rapporto.
- Il parere legale ha cambiato tre cose. Primo: i dati di Google non si salvano, si mostrano solo nel riquadro di Google.
- Secondo: TripAdvisor resta spento per ora. Terzo: con DataForSEO il rischio verso Google è nostro.

## Cosa devi fare
- Dire se accetti il rischio di DataForSEO sulle recensioni. Il legale consiglia sì, tenendo solo i temi.
- Dire quanto entra in ogni abbonamento. La mia proposta sta nella sezione del preventivo.
- Aprire Google Cloud con un avviso di spesa, e DataForSEO con 50 dollari di ricarica. TripAdvisor per ora no.
- Far rileggere il parere a un legale abilitato prima di accendere le fonti.
- Unire le due richieste delle sessioni. Poi dare l'«ok ripubblica» per il flusso delle attività nuove.

## Cosa non ho verificato
- Il legale non ha potuto aprire le pagine ufficiali di TripAdvisor e DataForSEO: le ha lette di seconda mano.
- Non so se il conto Google Cloud è intestato in Italia. Il parere lo dà per probabile.
- Il prezzo del riquadro ufficiale di Google non l'ho controllato.
- Non so se l'app Meta di MyCity ha già il permesso per leggere i numeri di Instagram.
- Il costo delle due sessioni è una stima a occhio: da 2 a 3 milioni di token.

## Dettagli tecnici

### Le 11 parti del rapporto
| # | Parte | Cosa dice all'imprenditore | Da dove arriva |
|---|---|---|---|
| 1 | La tua carta d'identità online | Se sito, social ed elenchi dicono le stesse cose (orari, indirizzo) | Pagine scaricate da n8n; riquadro Google accanto, senza confronti coi suoi dati |
| 2 | La tua reputazione | Cosa lodano e cosa criticano, per temi; se rispondi | Temi da DataForSEO (≥3 recensioni per tema); riquadro Google in diretta |
| 3 | I concorrenti vicini | Quanti entro 300-500 m, chi è aperto quando tu sei chiuso | OpenStreetMap; il loro voto solo da DataForSEO, mai da Google |
| 4 | La tua zona | Scuole, uffici, fermate, parcheggi vicini: i momenti in cui passa gente | OpenStreetMap, ISTAT |
| 5 | Cosa cerca la gente | Quante ricerche su Google a Piacenza per la tua categoria, in che posizione esci | DataForSEO |
| 6 | Il tuo sito | Velocità, se si trova su Google, se funziona dal telefono | PageSpeed (già acceso), pagine scaricate |
| 7 | I tuoi social | Follower, post al mese, video, confronto coi concorrenti | Instagram ufficiale (Business Discovery) |
| 8 | Il calendario della città | Eventi e mercati vicino a te nei prossimi 30 giorni, meteo della settimana | Radar dell'AD (Comune, sagre), MET Norway |
| 9 | Soldi pubblici | I bandi e i contributi aperti adatti a te, con la scadenza | Radar dell'AD (Comune, Camera di Commercio, Unione Commercianti) |
| 10 | Su MyCity | Vetrina, prodotti, ordini, incassi, clienti tornati | La pagella del flusso 18 (dopo l'abbonamento) |
| 11 | Il piano dei 30 giorni | Tre mosse, ognuna col servizio che la copre e cosa cambia in cassa | L'AD, dalle parti 1-10 e 12 |
| 12 | I concorrenti sui social e sul web | Cosa pubblicano, quanto, in che formati, cosa funziona; cosa fanno meglio e peggio; idee di contenuti | Instagram Business Discovery sui 3-5 concorrenti più vicini, loro siti (lettore di pagine), posizioni DataForSEO |

### Le fonti
**Gratis, partono subito**
- OpenStreetMap (Overpass): concorrenti e servizi vicini. Al massimo 1 richiesta al secondo, nome di programma generico.
- MET Norway (`api.met.no`): meteo, uso commerciale ammesso citando la fonte (CC BY 4.0). Open-Meteo NO.
- Radar dell'AD (flusso 24): eventi del Comune, sagre, bandi di Comune, Camera di Commercio, Unione Commercianti.
- ISTAT: residenti per zona (fase 2). PageSpeed: già acceso.
- Instagram ufficiale (Business Discovery): follower, post, ultimi post degli account professionali. Serve l'account
  professionale di MyCity collegato all'app Meta (`instagram_basic`, da verificare).
- Dopo l'abbonamento, col permesso del titolare: Google Business Profile e Instagram Insights.

**A pagamento, approvate da Nicola il 26/11 alle 14:45, corrette dal parere legale delle 15:10**
| Fonte | Cosa si può fare | Costo |
|---|---|---|
| Google Places | Solo `place_id` (salvato senza scadenza) e coordinate (30 giorni). La scheda si mostra col riquadro `<gmp-place-details>` (Places UI Kit) in diretta. Niente voto, recensioni, orari, nome o indirizzo salvati o copiati; niente temi AI né medie dei concorrenti dai dati Google | 1.000 richieste gratis al mese per tipo; prezzo del UI Kit da verificare |
| TripAdvisor | **Spenta** finché non arriva un sì scritto. La Content API potrebbe essere stata sostituita da «Terra» il 31/8/2026 | — |
| DataForSEO | Ricerche e posizioni su Google: sì. Recensioni: testi solo in memoria, cancellati entro 24 ore; si salvano tema e numero di citazioni; un tema si mostra solo con ≥3 recensioni. Il rischio verso Google è nostro (§7.1-7.2: li teniamo indenni) | Ricarica minima 50 $, una volta |

**Il parere legale** (`consegne/legale/2026-11-26-fonti-rapporto-imprenditore.md`, bozza da far validare a un legale abilitato):
- Termini Google EEA dall'8/7/2025: dati Places ammessi solo per 9 usi; un rapporto venduto a terzi non c'è (§15.2).
  Vietato «copy and save business names, addresses, or user reviews» (ToS 3.3.2). Il riquadro UI Kit è esente da §15.1-15.2.
- Le filiere DataForSEO e Google Places restano separate.
- GDPR: per il titolare art. 6.1.b; per chi scrive le recensioni legittimo interesse (art. 6.1.f) con bilanciamento scritto
  e informativa pubblicata (art. 14.5.b). MyCity è titolare autonomo del rapporto. Va aggiornata l'informativa dei titolari.
- I termini d'uso di MyCity rimandano ai Google Maps Additional Terms e alla Google Privacy Policy (ToS 3.2.2).

### Il preventivo, per abbonamento (proposta dell'AD: quanto entra in ogni fascia lo decide Nicola)
Nicola, 26/11 14:54: l'analisi si personalizza per abbonamento, come contenuti, foto, video e sito; il preventivo mostra
per ogni fascia le parti incluse e quelle escluse. Una sola tabella nel codice, facile da cambiare (come `FASCE`).
Prezzi invariati (Base 300 €, Business 500 €, Premium 999 €).
- **Base**: il rapporto all'avvio, parti 1-4, 6, 7 (solo i suoi social), 8, 9 e 11, più un avviso quando esce un bando adatto.
  Esclusi: parte 5, parte 12, aggiornamenti periodici.
- **Business**: tutto il Base, più la parte 5 e la parte 12 sui 3 concorrenti principali. Ogni mese: cosa è cambiato
  (follower, temi delle recensioni, concorrenti), eventi del mese, bandi nuovi, vendite su MyCity (parte 10).
  Il confronto Google mese su mese solo con Google Business Profile del titolare.
- **Premium**: tutto, ogni settimana; parte 12 su fino a 5 concorrenti coi loro post migliori della settimana e le idee per i
  suoi; recensioni nuove con la risposta pronta; eventi e meteo con le mosse; un incontro al mese.
- **Assaggio prima di pagare** (scelta di Nicola delle 14:45): concorrenti vicini (OpenStreetMap), velocità del sito,
  follower Instagram, ricerche e posizione (DataForSEO), con accanto il riquadro Google.
- Primo esempio vero della parte 12: il dossier dei concorrenti del Tropico Latino, `consegne/content/2026-11-26-tropico-concorrenti.md`
  (lo prepara la sessione del Tropico).

### Il contratto fra n8n e il sito
Lo chiude la sessione dei flussi: `N8N/flussi/16-nuovo-cliente-da-mycity/CONTRATTO-RAPPORTO.md`, v1 del 26/11.
- `analisi.fatti` = { versione, raccolti_il, posizione, vicini, meteo, eventi, bandi, sito, google, tripadvisor, recensioni,
  ricerche, instagram }. Ogni blocco è una busta: { stato: letto|vuoto|spento|non_applicabile|errore, motivo, fonte, fonte_nome,
  licenza, letto_il, conserva_fino_al, dati|null }. Fonte spenta = `spento`, mai «0».
- Correzione del parere legale: `google.dati` = { place_id } e niente altro; `tripadvisor` = `spento`.
- Sezioni nuove dell'AD in `analisi.business`: `reputazione_temi`, `confronto_concorrenti`, `occasioni`, `soldi_pubblici`,
  `piano_30_giorni` (con `proposta`). I numeri vengono solo da `fatti`.
- Il lavoro per «Chiedi all'AD» resta sotto i 64 KB; tetto 40 corse al giorno.

### Le due sessioni
- Flussi (N8N): `session_01R8112K1DyjU4xADptnSgNq`, ramo `claude/rapporto-imprenditore-flussi`.
- Sito (mycity): `session_01R8112MSbmrMsg1NS5fYwU7`, ramo `claude/rapporto-imprenditore-sito`.
- Tetto: 6 subagenti e circa 1,5 milioni di token ciascuna. Chi costruisce non collauda. PR su `main` per ogni repo.
- Il flusso 26 vero si ripubblica solo con l'«ok ripubblica» di Nicola, dopo la copia di sicurezza.

### Le prove (dato → atteso)
1. La Ragazzetta, nessun sito → `vicini` letto da OpenStreetMap con concorrenti > 0; `google` col solo `place_id` o `spento`.
2. Un locale con Instagram professionale → `instagram.follower` è un numero letto, con fonte e data.
3. Dopo una lettura Google → nel database e nella scheda al sito c'è solo `place_id`: nessun voto, orario o recensione.
4. `FONTE_GOOGLE = no` o `FONTE_DATAFORSEO = no` → nessuna chiamata a pagamento parte.
5. Una recensione con «Mario Rossi» → nel rapporto non compare nessun nome di persona.
6. Il preventivo Base → l'elenco dell'analisi non promette il confronto mese su mese.
7. Un tema citato da 2 recensioni → non si mostra; da 3 → si mostra con il numero.
8. Il preventivo di ogni fascia elenca le parti incluse e quelle escluse, lette dalla stessa tabella; il Base mostra la parte 12 come esclusa.

### Stato adesso (2026-11-26 15:20)
- Fatto: scelte di Nicola nel registro (`agenzia.rapporto-imprenditore`); parere legale arrivato alle 15:10 e girato alle due
  sessioni come avviso urgente; carta #265 in `AZIONI-IN-ATTESA.md`.
- In corso: le due sessioni.
- Da Nicola: rischio DataForSEO sì o no; i due account (Google Cloud, DataForSEO); legale abilitato; unione delle PR.
