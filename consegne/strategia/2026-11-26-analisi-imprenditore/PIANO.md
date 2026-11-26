---
tipo: piano
data: 2026-11-26 14:47
fonte: richiesta di Nicola del 25-26/11/2026 in chat con l'AD («recupera molti più dati sul cliente… l'analisi più figa che si possa creare per l'imprenditore, usando anche i dati che già analizza l'AD… e metterlo già dentro il preventivo, in base all'abbonamento»)
stato: via di Nicola il 2026-11-26 ~14:45 — tre fonti a pagamento approvate, assaggio prima di pagare, due sessioni aperte
---

# Il rapporto dell'imprenditore — piano

## In parole semplici
Oggi l'analisi di un'attività che si iscrive legge il web: il suo sito, gli elenchi e gli articoli, fino a 10
pagine. Non legge la scheda Google, Instagram, Facebook, TripAdvisor: copiarle con un programma è vietato dalle
loro regole. Questo piano aggiunge le fonti ufficiali e gratuite, quelle a pagamento solo con la firma di
Nicola, e i dati che l'AD segue già per MyCity (eventi, bandi, meteo, notizie, numeri del marketplace).
Il risultato è un rapporto in 11 parti, e il preventivo dice quali parti dà ogni abbonamento.

## Le 11 parti del rapporto
| # | Parte | Cosa dice all'imprenditore | Da dove arriva |
|---|---|---|---|
| 1 | La tua carta d'identità online | Se Google, sito e social dicono le stesse cose (orari, indirizzo) | Google ufficiale, pagine scaricate da n8n |
| 2 | La tua reputazione | Voto, numero di recensioni, cosa lodano e cosa criticano, se rispondi | Google ufficiale (5 recensioni), TripAdvisor ufficiale, tutte con DataForSEO |
| 3 | I concorrenti vicini | Quanti entro 300-500 m, il loro voto medio, chi è aperto quando tu sei chiuso | OpenStreetMap (gratis) + Google ufficiale |
| 4 | La tua zona | Scuole, uffici, fermate, parcheggi vicini: i momenti in cui passa gente | OpenStreetMap, ISTAT |
| 5 | Cosa cerca la gente | Quante ricerche su Google a Piacenza per la tua categoria, in che posizione esci | DataForSEO (a pagamento) |
| 6 | Il tuo sito | Velocità, se si trova su Google, se funziona dal telefono | PageSpeed (già acceso), pagine scaricate |
| 7 | I tuoi social | Follower, post al mese, video, confronto coi concorrenti | Instagram ufficiale (Business Discovery) |
| 8 | Il calendario della città | Eventi e mercati vicino a te nei prossimi 30 giorni, meteo della settimana | Radar dell'AD (Comune, sagre), MET Norway |
| 9 | Soldi pubblici | I bandi e i contributi aperti adatti a te, con la scadenza | Radar dell'AD (Comune, Camera di Commercio, Unione Commercianti) |
| 10 | Su MyCity | Vetrina, prodotti, ordini, incassi, clienti tornati | La pagella del flusso 18 (dopo l'abbonamento) |
| 11 | Il piano dei 30 giorni | Tre mosse, ognuna col servizio che la copre e cosa cambia in cassa | L'AD, dalle parti 1-10 |

## Le fonti: gratis e a pagamento
**Gratis, partono subito**
- OpenStreetMap (Overpass): concorrenti e servizi vicini. Al massimo 1 richiesta al secondo, nome di programma generico.
- MET Norway (`api.met.no`): meteo dei prossimi giorni. Ammesso anche l'uso commerciale, citando la fonte (CC BY 4.0).
  Open-Meteo NO: gratis solo per uso non commerciale.
- Radar dell'AD (flusso 24): eventi del Comune, sagre e mercatini, bandi di Comune, Camera di Commercio e Unione
  Commercianti, notizie locali. Fonti in `ad-mycity/cervello/radar-fonti.json`.
- ISTAT: residenti per zona (file fisso, fase 2).
- PageSpeed: già acceso sul sito.
- Instagram ufficiale (Business Discovery): follower, numero di post, ultimi post con data e interazioni degli
  account professionali. Gratis. Serve l'account Instagram professionale di MyCity collegato all'app Meta, col permesso
  `instagram_basic` (da verificare se l'app di MyCity ce l'ha già). Esclusi gli account con limite d'età.
- Dopo l'abbonamento, col permesso del titolare: Google Business Profile (chiamate, richieste di indicazioni, visite
  al sito dalla scheda) e Instagram Insights (persone raggiunte, città dei follower). Gratis. Per Google serve una
  richiesta di accesso alle sue API, approvata da Google.

**A pagamento — solo con la firma di Nicola (🔴)**
| Fonte | Cosa dà in più | Costo (verificato il 26/11 sulle pagine ufficiali) | Uso stimato |
|---|---|---|---|
| Google Places (ufficiale) | Scheda Google: voto, n. recensioni, 5 recensioni, orari, stato; voto dei concorrenti | Serve la carta su Google Cloud. 1.000 richieste gratis al mese per ogni tipo «Enterprise»; oltre, 20-40 $ ogni 1.000 | ~10 attività al giorno × 2 richieste ≈ 600 al mese → 0 € |
| TripAdvisor Content API | Voto, n. recensioni, posizione in città («12° su 300»), 5 recensioni | Serve la carta. Gratis 5.000 chiamate al mese secondo la FAQ ufficiale (un'altra pagina ufficiale dice 1.000) | Solo bar, ristoranti, hotel: ≈ 300 al mese → 0 € |
| DataForSEO | TUTTE le recensioni Google; quanto si cerca una parola a Piacenza; in che posizione esce il locale | Ricarica minima 50 $, una volta sola, non è un canone. Recensioni: 75 $ ogni milione | Pochi centesimi al mese: i 50 $ durano a lungo |
| Visura camerale | Anno di apertura, codice attività, addetti | A pezzo, prezzo da verificare | Non la consiglio ora |

Avvertenze legali, da passare a `legale-privacy` prima di accendere:
- Google vieta di tenere i suoi dati oltre 30 giorni (tranne l'identificativo del luogo). Quindi prima
  dell'abbonamento i dati Google si mostrano «letti il …» e spariscono dopo 30 giorni. Il confronto mese su mese
  si fa coi dati del titolare (Google Business Profile), che dopo l'abbonamento sono suoi e si possono tenere.
- DataForSEO raccoglie i dati da Google con un suo programma: il rischio delle regole di Google è suo, ma il
  legale lo guarda prima.
- Recensioni: mai il nome di chi le ha scritte. Si tengono i temi, non le persone.
- Mai pagine di Meta, mappe o portali lette di nascosto (regola già nel codice: `flussi/chiedi-all-ad/leggi-pagine.mjs`).

## Il preventivo, per abbonamento (proposta dell'AD, da confermare)
Prezzi invariati (Base 300 €, Business 500 €, Premium 999 €). Cambia il testo `FASCE.*.servizi.analisi` in
`mycity/lib/agenzia/preventivo.ts` e nasce l'elenco «Cosa c'è nella tua analisi»:
- **Base** — il rapporto completo all'avvio: parti 1-4, 6-9 e 11, più un avviso quando esce un bando adatto.
- **Business** — il rapporto all'avvio e ogni mese: cosa è cambiato (voto, recensioni, follower, concorrenti), gli
  eventi del mese, i bandi nuovi, le vendite su MyCity (parte 10), la parte 5 se DataForSEO è acceso.
- **Premium** — ogni settimana: le recensioni nuove con la risposta pronta, eventi e meteo della settimana con le
  mosse, il confronto coi concorrenti; un incontro al mese per leggerlo insieme.
Il preventivo usa già l'analisi per le proposte su misura (opportunità → servizio): con più dati, le proposte diventano
più precise. Prima di pagare il titolare vede **un assaggio** (scelta di Nicola: assaggio o rapporto intero).

## Il contratto fra n8n e il sito (bozza: lo chiude la sessione dei flussi, il sito lo legge)
Due parti nuove nella scheda che il flusso 26 manda al sito:
- `fatti` — numeri calcolati da n8n, senza IA, ognuno con `fonte` e `letto_il`:
  `google {voto, recensioni, orari, stato}` · `tripadvisor {voto, recensioni, posizione}` ·
  `instagram {follower, post, post_30_giorni, video_30_giorni, ultimo_post_il, interazioni_medie}` ·
  `concorrenti {raggio_m, quanti, voto_medio, elenco[≤8]{nome, distanza_m, voto, recensioni}}` ·
  `zona {scuole, uffici, fermate, parcheggi}` · `meteo [≤7]{data, massima, pioggia_mm}` ·
  `eventi [≤5]{titolo, data, luogo, fonte}` · `bandi [≤5]{titolo, ente, scadenza, per_chi, fonte}` ·
  `sito {https, telefono_ok, titolo, descrizione, dati_strutturati}` · `ricerche [≤10]{parola, volume_mese}` (solo DataForSEO).
  Un blocco che manca è `null` con il motivo in `non_letto`; mai uno zero inventato.
- Nuove sezioni dell'AD (come le attuali: max 3 frasi, ognuna con fonte): `reputazione_temi`, `confronto_concorrenti`,
  `occasioni` (eventi + meteo → mosse), `soldi_pubblici`, `piano_30_giorni` (tipo `MOSSA`, col servizio).
Vincoli: il lavoro per «Chiedi all'AD» resta sotto i 64 KB (i `fatti` sono numeri, non pagine); tetto 40 corse al giorno.

## Il lavoro, in due sessioni parallele
- **Sessione Flussi** (repo `N8N`): nodi gratis nel flusso 26 (OpenStreetMap, MET Norway, eventi e bandi dalle fonti
  del radar, controlli del sito dalle pagine già scaricate); nodi Google Places, TripAdvisor, Instagram e DataForSEO
  pronti ma **spenti** finché la chiave non c'è (`FONTE_* = no` nel Config); schema dell'AD allargato; chiude il contratto.
- **Sessione Sito** (repo `mycity`): due campi facoltativi all'iscrizione (nome Instagram, link della scheda Google);
  le parti nuove nella pagina «Analisi del business»; il preventivo con l'elenco per abbonamento; i dati Google che
  scadono dopo 30 giorni. Migrazione solo se serve (la tabella `analisi_negozi` è della 711).
- Regole: prima le prove (dato → atteso), chi costruisce non collauda, `npm run verify` e
  `node cervello/radiografia-in-corsa.mjs --repo ../mycity` sul sito, PR su `main` per ciascun repo.
- Preventivo: 2 sessioni, ~10 subagenti in tutto, circa 2-3 milioni di token. Stima a occhio, non dalle misure.

## Le prove (dato → atteso)
1. La Ragazzetta, Piacenza, nessun sito → `fatti.concorrenti.quanti` > 0 da OpenStreetMap; `google = null` con
   `non_letto: "chiave Google non accesa"` finché Places è spento.
2. Un locale con Instagram professionale → `instagram.follower` è un numero letto, con fonte e data.
3. Una scheda Google letta 31 giorni fa → il sito non mostra più voto e recensioni Google.
4. Il Config con `FONTE_GOOGLE = no` → nessuna chiamata a Google parte (nessuna spesa).
5. Una recensione con «Mario Rossi» → nel rapporto non compare nessun nome di persona.
6. Il preventivo Base → l'elenco dell'analisi non promette il confronto mese su mese.

## Stato adesso (2026-11-26 14:47)
- ✅ Scelte di Nicola (~14:45): **Google Places, TripAdvisor e DataForSEO approvate**; prima di pagare **un assaggio**;
  **via alle due sessioni**. Fatto nel registro: `agenzia.rapporto-imprenditore`. Ha chiesto anche se ci sono altre fonti.
- ⏳ Parere legale sulle tre fonti a pagamento: agente `legale-privacy` → `consegne/legale/2026-11-26-fonti-rapporto-imprenditore.md`.
- ⏳ Sessione Flussi (N8N) e Sessione Sito (mycity): ID in `LAVORO-APERTO.md`. I nodi a pagamento nascono spenti.
- 👉 Nicola: aprire i tre account e mettere le chiavi nelle credenziali di n8n (mai in chat); su Google Cloud un tetto di spesa.
- Il flusso 26 vero si ripubblica solo con l'«ok ripubblica» di Nicola, dopo la copia di sicurezza.
