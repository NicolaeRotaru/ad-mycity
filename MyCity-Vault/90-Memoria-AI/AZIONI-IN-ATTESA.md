---
tipo: coda-azioni
fonte: senior dell'AD
---

# ⏳ AZIONI IN ATTESA — pronte a partire, aspettano il via di Nicola

> Qui i senior accodano le azioni **🟡/🔴 già PRONTE** (testo esatto, destinatario, importo, canale).
> Le **🟢** non passano di qui: i senior le fanno e basta.
> Nicola dà l'ok → l'azione passa a ✅ FATTO e parte (via i canali del marketplace o a mano).

## Come approvare
Scrivi all'AD: **"ok [numero/azione]"** oppure **"ok a tutte le 🟡"**. L'AD esegue, segna FATTO qui e lascia la traccia in [[DECISIONI]].

> 🟢 **Scorciatoia lancio:** le righe **1-2** (le 3 decisioni 🔴 di lancio) sono consolidate in
> un **foglio-firma da 2 minuti** → `consegne/decisioni/2026-06-26-foglio-firma-lancio.md`. Firma lì.

## Coda
> ✍️ **Il titolo (colonna `Azione`) è il testo grosso della card:** scrivilo come lo diresti a voce, con un verbo
> e una cosa vera, **senza codici/sigle/ID/path** — quelli vanno in `Contenuto`, per chi esegue. Metro: la lettera
> a Nicola. Regola completa: `cervello/scrittura-umana.md`.
> Le ultime 2 colonne (**Cosa cambia · Se va bene**) sono la spiegazione che compare nella card del Pannello:
> scrivile in parole semplici per Nicola. Sono opzionali — se vuote, il Pannello mette un testo per-reparto.
>
> ⚠️ **Impatto sistema (AR-081 · pre-mortem cross-silo):** se una mossa di reparto rischia di **brucia margine**
> o **intasa operations** (spillover su altri silos), segnalalo in "Cosa cambia" con `⚠️ impatto sistema: …`.
> È la forcing-function della visione olistica (AD-VETTORI-SISTEMA): una vittoria di reparto non deve costare all'azienda.

| # | Data e ora | Reparto | Azione (pronta) | Colore | Contenuto | Canale | Stato | Cosa cambia | Se va bene |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 2026-06-25 10:09 | vendite | Proponi a Garetti le condizioni per entrare: **12% di commissione, 0€ di costi fissi, incasso a consegna confermata, nessun vincolo** | 🔴 | consegne/vendite/pitch-garetti.md (Parte C) | di persona al go-live (condizioni 1 pagina via @legale) | in attesa | Garetti accetta 12% di commissione e 0€ fissi: da quel sì può ricevere ordini veri e MyCity guadagna sul primo incasso. | Si fissa il go-live e si prepara il primo ordine concierge al sabato (mercato di Piazza Cavalli). |
| 2 | 2026-06-25 10:09 | finanza | Scegli come testare il primo pagamento al negozio: **1€ vero da restituire dopo**, oppure l'ambiente di prova di Stripe | 🔴 | consegne/finanza/payout-faro.md | onboarding min 17-20 | in attesa | Si sceglie come testare il primo payout (1€ vero da stornare, oppure ambiente test Stripe): verifichi che i soldi arrivino al negozio senza intoppi. | Il flusso pagamenti è validato e il primo incasso vero gira pulito verso Garetti. |
| 3 | 2026-06-25 10:09 | customer-success | Via libera ai **messaggi e alle telefonate ai primi clienti veri** del primo ordine (testi già pronti) | 🟡 | consegne/customer-success/primo-ordine-faro.md | manuale (poi email/n8n) | in attesa | Partono i contatti veri al primo cliente (messaggio + telefonata di feedback): è la cura concierge che evita la "brutta prima esperienza". | Il primo cliente è seguito a mano, il problema viene intercettato prima del reclamo e si chiede la prima recensione. |
| 4 | 2026-06-24 10:43 | tech | Sistemato il checkout su cellulare: la barra in basso copriva il tasto "Conferma ordine" | 🔴 | PR #199 | — | ✅ MERGED |  |  |
| 5 | 2026-06-24 10:43 | frontend-dev | Applicate le correzioni del primo gruppo dell'audit design (conversione e messaggi) | 🔴 | PR #200 | — | ✅ MERGED |  |  |
| 6 | 2026-06-26 23:05 | content-social | Pubblica il primo post di Garetti "La saracinesca" su **Instagram e Facebook** — serve da Nicola il **link vero della lista d'attesa** | 🔴 | consegne/content/POST-storia-bottega-garetti-saracinesca.md + creativi/output/social/storia-bottega-garetti-saracinesca.png · su FB il link va nel 1° commento | IG + FB (manuale, poi n8n) | in attesa | Il primo post pubblico di Garetti esce su IG+FB: i suoi clienti scoprono che possono ordinare a casa. Serve il link reale della lista d'attesa. | Arrivano i primi iscritti dai clienti caldi della bottega, a costo ≈0 (ripubblicazione del negozio). |
| 7 | 2026-06-27 02:10 | content-social | Pubblica "I tre venerdì" nelle **sere dei Venerdì Piacentini (3, 10 e 17 luglio)**, quando il centro è pieno — finestra che si chiude il 17/7, serve il link della lista d'attesa e l'ok al lancio **entro il 3 luglio** | 🔴 | consegne/content/GARETTI-kit-L7.md · post + storia IG/FB + post nel gruppo locale; su FB il link nel 1° commento | IG + FB + gruppi FB locali (manuale, poi n8n) | in attesa | I 3 post escono nelle sere dei Venerdì Piacentini (3/10/17 lug), quando il centro è pieno: cavalchi l'evento. Finestra reale che si chiude il 17/7. | Picco di iscritti agganciato all'evento; poi "Bottega × Evento" può diventare una rubrica fissa. |
| 8 | 2026-06-27 02:10 | content-social→relazioni-istituzionali/pr-stampa | Chiedi agli **organizzatori dei Venerdì Piacentini e alle pagine "Sei di Piacenza se…"** di ricondividere la mini-storia della bottega — contenuto di valore, non spam — durante la finestra dell'evento | 🔴 | consegne/content/GARETTI-kit-L7.md §3B | DM/email a pagine locali | in attesa | Pagine e organizzatori locali ricondividono la mini-storia della bottega: portata gratis verso un pubblico già piacentino. | MyCity entra nelle conversazioni locali senza spendere, con la credibilità di chi ti ripubblica. |
| 9 | 2026-06-27 02:10 | content-social (proposta L7) | Decidi se **"Bottega × Evento" diventa una rubrica fissa** — ogni evento del centro agganciato a una bottega. Servono il calendario eventi (da @intelligence) e i consensi dei negozi | 🔴 | consegne/content/GARETTI-kit-L7.md §7 | decisione strategica Nicola | in attesa | Si decide se trasformare "Bottega × Evento" in una rubrica fissa (ogni evento del centro agganciato a una bottega). | Diventa un format-motore che sforna contenuti rilevanti a ogni evento, quasi in automatico. |
| 10 | 2026-06-28 20:25 | AD/Tech | **Collega la memoria al Pannello**: imposta le due chiavi Supabase nelle variabili di Vercel e rilancia il deploy — così la spia "Memoria collegata" diventa verde | 🟡 | env da impostare: `SUPABASE_URL=https://xjljcsorpbqwttrejqte.supabase.co` + `SUPABASE_SERVICE_KEY=<service_role progetto memoria>` (la prendi da Supabase → progetto ad-mycity → Settings → API) | Vercel (manuale, lato Nicola) | in attesa | Il Pannello inizia a leggere/scrivere la memoria nel DB giusto: la spia "Memoria collegata" diventa verde e i briefing compaiono nella card "Cosa ho scoperto". | Ogni giro si accumula da solo nella Cabina, senza che io riscriva file a mano. |
| 11 | 2026-06-28 20:25 | designer→vendite | **Kit QR "Venerdì Piacentini"** per le botteghe aperte le sere del 3/10/17 luglio: vetrofania + cartoncino in cassa con QR "ordina e te lo portiamo" (presidio dal vivo, non consegna in ZTL) | 🟡 | da produrre in creativi/output/ (brief @designer) — serve il LINK reale lista d'attesa | stampa + consegna a mano alle botteghe (manuale) | in attesa | Davanti a 50-60k persone/sera in centro, le botteghe espongono un QR che porta i clienti su MyCity: acquisizione a costo ≈0. Serve il link reale della lista d'attesa. | Primi iscritti agganciati all'evento più grande della città; il presidio diventa ripetibile ogni venerdì. |
| 12 | 2026-06-29 11:30 | vendite→legale-privacy | **Kit "Bando ER + MyCity"** da usare a ogni incontro con un negozio: un foglio pronto per chiedere il **40% di fondo perduto** sulla digitalizzazione (**scade il 21/7**) — preventivo intestabile, spesa ammissibile, mini-guida, disclaimer "mai promettere l'esito" | 🟡 | da produrre in consegne/vendite/ (@vendite + @legale-privacy) | di persona + email ai lead | in attesa | Ogni negozio che incontri porta con sé un foglio pronto per chiedere il 40% di rimborso sulla digitalizzazione: abbassa la barriera d'ingresso e dà urgenza (scade 21/7). | I negozi firmano prima perché il bando scade; MyCity diventa "chi ti aiuta a prendere i fondi", non solo un marketplace. |
| 13 | 2026-07-02 23:40 | AD/Tech (builder-automazioni) | **Attiva la sentinella dei dati sul server**: veglia i dati reali ogni minuto a costo zero e sveglia l'AI **solo** quando scatta un allarme (10 sentinelle: 5 sulla macchina, 5 sulle azioni) | 🔴 | dopo il `git pull` del branch mergiato: `sudo bash /opt/mycity/ad-mycity/cervello/vps/install-ritmo-timers.sh` · verifica con `systemctl list-timers` (cerca `sentinella-dati`) · consiglio: prima un dry-run `node cervello/sentinella-dati.mjs`. Codice in branch `claude/worker-sentinel-analysis-ncldvf`, analisi in `consegne/automazioni/2026-07-02-sentinella-dati-veglia-realtime.md` | VPS (systemctl, lato Nicola/root) | in attesa | La macchina inizia a guardare i dati reali ogni minuto a costo zero e sveglia il modello AI **solo** quando scatta una soglia (ordine senza payout, calo ordini, recensione ≤2★, negozio fermo, carrello, o un guasto della macchina stessa). Nessun token sprecato a vuoto. | La Cabina reagisce in un minuto invece che al prossimo giro (ogni 2h); i problemi 🔴 arrivano subito su Telegram e come proposta da firmare. |
| 14 | 2026-07-03 14:07 | frontend-dev (radiografia Pannello) | **Fix del Pannello**: premere «Annulla» su un'azione **già partita** non deve farla ripartire — niente doppio merge o doppia email allo stesso cliente | 🟡 | consegne/design/2026-07-03-radiografia-pannello.md (bug #1). In pratica: consentire annulla solo se lo stato è vuoto o 'rifiutata', altrimenti 409; nascondere «annulla» su fatta/coda. File: `api/azioni-pronte/route.ts:45-52`, `Azioni.tsx:751`, `mani.ts:74,101` | branch → anteprima → merge | ✅ FATTO 2026-07-04 · fix già in codice su `main` e `memoria-ad` (commit a4c8561, 3/7) — nessuna PR da mergiare, il guard 409 anti-doppio-invio è già live | Approvare e poi annullare un'azione già partita non la fa ripartire una seconda volta: niente doppio merge PR né doppia email allo stesso cliente. | Le azioni reali 🔴 diventano sicure; posso poi attaccare gli altri 29 bug del Pannello per priorità. |
| 15 | 2026-07-03 14:07 | AD (radiografia macchina) | **Qual è il nostro negozio-faro**: **Casa Linda** (pronto al payout nel database) o **Pane Quotidiano** (che la costituzione dà come unico reale)? Memoria e costituzione si contraddicono | 🔴 | AR-044 · registro-realta.json vs CLAUDE.md:157 | risposta a me | ✅ DECISO 3/7: **Pane Quotidiano** (Casa Linda = demo). Memoria allineata. | Allineo memoria, cancello di allocazione (AR-006) e calibrazione su UN solo faro: i motori di soldi smettono di tirare in direzioni opposte. | So dove concentrare lo sforzo pesante (post/QR/eventi) e non lo disperdo sul negozio sbagliato. |
| 16 | 2026-07-03 14:07 | AD (radiografia macchina) | **Collaudo dello "stampo" dei 42 senior**: l'ho applicato a tutti **senza un tuo test** (il quaderno dei giudizi è vuoto). Faccio una prova prima/dopo su 1-2 reparti, o accetti così com'è? | 🟡 | AR-032 · STAMPO-SENIOR-PRO.md · consegne/collaudo/2026-07-03-collaudo-stampo.md | tuo verdetto di gusto sui 2 deliverable | 🧪 COLLAUDO FATTO 3/7: STAMPO **indifferente** su 2 motori di soldi (baseline vince di poco). Le leve vere = carburante reale + forcing-function AR-029. Serve il tuo verdetto sui deliverable → riempie il TASTE-FILE | Validiamo (o accettiamo consapevolmente) che i 42 senior lavorino al livello promesso, invece di darlo per scontato. | Se lo stampo ha un difetto sistematico lo becco su 1-2 reparti prima che diventi un problema su 42. |
| 17 | 2026-07-03 14:07 | AD (radiografia macchina) | **PostHog è collegato al sito?** Oggi ne controllo solo lo stato ma nessuno legge il funnel: senza, non ho un allarme sui cali di conversione del checkout | 🟡 | AR-040 · cervello/verifica-sensori.mjs:157-175 | risposta a me | ⏸ RIMANDATO da Nicola: collega PostHog dopo il 10/7 (serve abbonamento). Sensore resta 'non_configurato'. | Se è collegato ti attacco un allarme «conversione checkout −X% vs baseline»; se no lo tolgo dal conteggio dei sensori attivi per non gonfiarlo. | La macchina si accorge da sola dei cali di conversione invece di scoprirli tardi dai numeri. |
| 18 | 2026-07-03 14:30 | AD/builder-automazioni (radiografia macchina) | **Metti in sicurezza l'autopilot**: oggi pubblica da solo sul brand tutto ciò che non è «rosso» (anche i 🟡). Deve pubblicare **solo i 🟢 davvero reversibili**; tutto il resto si accoda e avvisa te | 🔴 | AR-072 · in pratica gate fail-closed: pubblica solo se `colore==='verde'` · cervello/autopilot.mjs:120 · calendario-editoriale.json (5/6 voci «giallo») | branch → firma | in attesa | La macchina **non pubblica più nulla sul brand senza la tua firma**: oggi tutto ciò che non è esattamente «rosso» esce da solo. Chiude il buco del semaforo. | Torni ad avere il controllo totale su cosa esce pubblicamente; l'autopilot resta utile solo per i 🟢 davvero reversibili. |
| 19 | 2026-07-03 14:30 | AD/security (radiografia macchina) | **Metti in sicurezza le chiavi Supabase**: oggi una sola chiave super-privilegiata apre tutta l'organizzazione, e la memoria è scrivibile. Genero chiavi separate col minimo permesso e metto la memoria in sola lettura? | 🔴 | AR-097/AR-098 · un solo token `sbp_` per entrambi gli MCP · MCP memoria senza `--read-only` · .mcp.json:12-25 · lo scanner-segreti non vede `sbp_` (AR-096) | decisione + rigenerazione chiavi (lato Nicola) | in attesa | Se una chiave trapela non espone tutta l'organizzazione; e il cervello non può più fare DROP/DELETE della propria memoria per sbaglio via SQL. | La superficie di attacco crolla: chiavi a scadenza/privilegio minimo, memoria protetta in scrittura. |
| 20 | 2026-07-03 20:05 | AD/security | **Chiudi il buco di sicurezza n.1**: due chiavi trapelate restano leggibili nella storia di git — un **token GitHub con permesso di scrittura** e una **chiave Supabase**. Prima revocale, poi ripulisci la storia | 🔴 | Il codice è già a posto (file non tracciato, `.gitignore` copre `.env*`/`*.save`, scan-segreti attivo); resta solo la storia: il vecchio `cervello/vps/.env.save` è nei commit `c464891`, `e6c62bc`. Passi: **(1) PRIORITÀ — tu revochi/rigeneri** il token su GitHub e la chiave su Supabase (li rende inutili anche a chi ha già la storia); **(2) poi** purga: `git filter-repo --path cervello/vps/.env.save --invert-paths` + force-push (riscrive la storia condivisa, da coordinare con le PR aperte e la clone del VPS). NON l'ho fatto io: sono azioni 🔴 tue. | GitHub/Supabase (revoca, lato Nicola) + `git filter-repo` (force-push, coordinato) | in attesa | I token trapelati smettono di funzionare: anche chi ha già clonato la storia non può più usarli per scrivere sul repo o leggere il DB. Poi la storia viene ripulita del file. | Il buco di sicurezza n.1 (credenziali write in chiaro nella storia) è chiuso alla radice. |
| 21 | 2026-07-06 11:11 | @onboarding-negozi/@finanza | Fai un primo ordine di prova su Pane Quotidiano e attiva il payout-test | 🔴 | Il vecchio ordine #16 (`58094956…`, COD €19,05) risulta ANNULLATO dal 3/7 15:38 nel DB → è morto, non si consegna più. Serve un ordine-prova pulito su PQ (seller `c0b240c0…`, Via Calzolai 25, tel 0523 388601) da chiudere per intero: accetta → consegna → payout-test. `consegne/finanza/payout-faro.md` | manuale + dashboard PQ | in attesa | Porti la North Star da 0 a 1 su un negozio reale e verifichi che i soldi arrivino davvero al negozio (payout), cosa mai successa finora. | Il ciclo end-to-end è validato una volta: da lì si replica su ogni nuovo negozio della shortlist. |
| 22 | 2026-07-06 11:11 | @vendite | Dal 9/7 chiama le prime 6 botteghe food della shortlist onboarding | 🔴 | Priorità A (verticale del faro): Osteria Carducci 0523 318394 · Trattoria La Forchetta 0523 325740 · Tre Ganasce 0523 490097 · La Dispensa de i Balocchi 0523 323639 · Trattoria dei Pescatori 0523 769788 · Tigella Bella 366 162 8361. Lista completa 27 + pitch: `consegne/vendite/2026-07-06-shortlist-onboarding-post-9-7.md` · aggancio bando ER 40% (scade 21/7) | telefono (manuale) | in attesa | Metti in moto la pipeline vendite rimasta ferma: 407 lead nel DB mai contattati, questi 6 sono già chiamabili. | Anche un solo sì porta il secondo negozio reale e riduce il rischio «un solo negozio». |
| 23 | 2026-07-06 11:11 | @builder-automazioni | Fai leggere alla sentinella dati anche lo stato di annullamento degli ordini | 🟡 | Causa-radice del loop cieco: la sentinella/REST conta solo il *numero* di ordini, non `delivery_status`/`canceled_at`. Aggiungere un check che scatti un allarme quando un ordine passa a CANCELED. `cervello/sentinella-dati.mjs` | VPS (dopo firma) | in attesa | Un ordine annullato scatta subito un allarme invece di restare invisibile per giorni (com'è successo a #16, inseguito morto per 2 giorni). | La macchina non tiene più viva una narrativa falsa quando la realtà è cambiata. |

> 📋 I **4 gruppi rimasti** (2 errori-vuoti · 3 contrasto · 4 brand+layout · 5 immagini/PWA) sono nel piano [[PIANO-FIX-DESIGN]] — eseguibili uno alla volta con *"sistema il gruppo N dell'audit design"*.

<!-- I senior aggiungono righe qui sotto. Metti SEMPRE data E ora (AAAA-MM-GG HH:MM).
     Le ultime 2 colonne (Cosa cambia · Se va bene) sono OPZIONALI ma consigliate: sono la spiegazione che Nicola legge nella card. Esempio:
| 1 | 2026-06-25 14:30 | crm | Email benvenuto ai primi 10 iscritti | 🟡 | consegne/crm/benvenuto.md | email (Resend) | in attesa | I primi 10 iscritti ricevono il benvenuto e capiscono come funziona MyCity. | Più clienti completano il primo ordine invece di sparire dopo l'iscrizione. |
-->

### 2026-06-24 · @pr-stampa · 🔴 Pacchetto earned media di lancio (kit pronto)
Fonte: `consegne/pr/KIT-STAMPA-LANCIO.md`. Tutto scritto e pronto; serve la firma per gli invii reali.
1. 🔴 **Invio email ESCLUSIVA a Libertà** (+ proposta servizio Telelibertà). Verificare prima il nome del direttore attuale (Rocco vs Visconti).
2. 🔴 **Invio email alle 3 testate online** (PiacenzaSera, Piacenza24, IlPiacenza) — solo DOPO l'uscita su Libertà o dopo 48h di silenzio.
3. 🔴 **Autorizzazione citazione titolare Garetti** (ok scritto del negoziante prima di pubblicarla).
4. 🔴 **Richiesta citazione/foto assessore Fornasari** (via @relazioni-istituzionali).
5. Completare campi [INSERIRE]: numero/email/sito stampa, fonte ufficiale del -22%, data di lancio.

---
## 🔴 Pubblicazione contenuti social — Settimane 1-4 (content-social)
- **Data proposta:** 2026-06-24
- **Cosa:** pubblicare i 16 post + bio IG/FB del calendario `consegne/content/CALENDARIO-4-SETTIMANE.md` sui canali reali (gruppi FB locali, IG feed/storie).
- **Perché 🔴:** tocca canali pubblici reali in città piccola; cita nome/foto del negoziante.
- **Pre-condizioni prima del via:** (1) ok firmato di Garetti per nome/foto; (2) segnaposto [Garetti/MyCity/Cliente] riempiti coi dati veri; (3) dialetto validato da madrelingua; (4) URL lista d'attesa reale; (5) ⏳ grafiche DA GENERARE — la Content Factory (`render.mjs`) esiste, ma su disco c'è SOLO `creativi/output/social/storia-bottega-garetti-saracinesca.png`: i 4 PNG S1 + il reel .webm vanno ancora prodotti (non spuntare come pronti finché non sono su disco); (6) peer review @finanza sulla promo "primi 50 gratis".
- **Mani:** canali social → da collegare via @builder-automazioni (o pubblicazione manuale).
- **Stato:** IN ATTESA DI FIRMA NICOLA.
- **Nota builder (2026-06-24):** le grafiche di base ci sono già a €0. Per i contenuti AI fotorealistici / Canva pro / video MP4 servono le chiavi (`GEMINI_API_KEY` / `CANVA_TOKEN` / `RUNWAY_API_KEY|KLING_API_KEY`) — collegabili da @builder-automazioni al via di Nicola.

## 2026-06-24 · @crm-lifecycle · Flussi lifecycle pronti (DRY-RUN)
Fonte: consegne/crm/FLUSSI-LIFECYCLE.md — niente è stato inviato.
- [ ] 🔴 Approvare incentivo "prima consegna gratis" primi 50 iscritti (cap ~200€).
- [ ] 🔴 Approvare referral give-get 5€+5€ (budget mensile suggerito 250€) + anti-frode.
- [ ] 🔴 Approvare "Regala una spesa" (gift, prepagato = cash-positive) + scadenza buono 12 mesi.
- [ ] 🔴 Approvare consegna offerta su win-back #2 e carrello #2 (1 volta/cliente, ~4€).
- [ ] 🟡 Via libera all'INVIO dei 3 Welcome + transazionali ai primi clienti reali (dopo validazione legale-privacy footer/consenso).
- [ ] 🛠️ @builder-automazioni: collegare RESEND_API_KEY (+ dominio/SPF/DKIM), VAPID push, Telegram, webhook stato ordine.
- [ ] ⚖️ @legale-privacy: validare footer disiscrizione + testi consenso (marketing vs transazionale) prima del primo invio.
- [ ] 🔴 Pubblicare il MANIFESTO-CAUSA "Ogni spesa è un voto" (post gruppi FB + feed IG @mycity.piacenza). Testo pronto in `consegne/content/C1-manifesto-causa.md` (⏳ PNG `creativi/output/social/C1-manifesto-causa.png` DA GENERARE — non ancora su disco). PRECONDIZIONI: (a) confermare il dato −22%/12 anni + fonte citabile [vault riporta anche −20,4% al 2035]; (b) link reale lista d'attesa nel 1° commento (da @builder-automazioni); (c) [opz.] validare la variante dialetto con madrelingua.

## 🔴 Pubblicare il POV/ZTL "Sabato e ti tocca prendere la coppa" (C4) — @cro/@content-social
- **Data proposta:** 2026-06-25
- **Cosa:** pubblicare il contenuto POV relatable su canali reali: gruppi FB locali ("Sei di Piacenza se…", "Piacenza Mia") + IG feed @mycity.piacenza + rilancio in Storia. Testo+visual pronti in `consegne/content/C4-pov-ztl.md` (PNG: `creativi/output/social/C4-pov-ztl.png`).
- **Perché 🔴:** tocca canali pubblici reali in città piccola; cita ZTL/multa/vigile (tono bonario, da validare @legale-privacy).
- **Pre-condizioni prima del via:** (1) conferma cifra multa ZTL Piacenza — uso **83€** come ordine di grandezza, correggibile in 1 riga del render o rimovibile; (2) link reale in bio (lista d'attesa o /store) con UTM `pov_ztl` da @builder-automazioni; (3) caption versione "uno di noi" senza hashtag nei gruppi FB, link nel 1° commento; (4) [opz.] validazione tono @legale-privacy (non diffamatorio verso Comune/PL).
- **Mani:** canali social → @builder-automazioni o pubblicazione manuale.
- **Quando consigliato:** venerdì sera 18-20 (o sabato mattina 8:30-9:30 per max identificazione).
- **Stato:** IN ATTESA DI FIRMA NICOLA.

## 2026-06-26 · @content-social · Pubblicare il ritratto "Il nostro bottegaio" (Garetti) — 🔴
- **Cosa:** pubblicare post FB + caption IG (carosello) + reel su @mycity.piacenza e gruppi locali Piacenza.
- **Contenuto pronto:** `consegne/content/W3-ritratto-bottega.md` · grafica `creativi/output/social/W3-ritratto-bottega.png`.
- **Canale:** Facebook/Instagram MyCity (+ gruppi quartiere). Le "mani" social passano da n8n/integrazioni → @builder-automazioni se non collegate.
- **🔴 BLOCCO finché non arrivano:** ① foto vera del volto di Garetti · ② frase reale sua · ③ consenso scritto uso nome/volto/frase (in città piccola la reputazione conta).
- **Effetto atteso KPI:** iscritti lista d'attesa (acquisizione calda dai clienti di Garetti, portata a costo ≈0 via ripubblicazione del negozio).
- **Via libera:** "ok" di Nicola DOPO foto+frase+consenso.

## 2026-06-26 · @ai-video · Reel W4 "Dietro la saracinesca"
- 🟡 **Consenso Garetti** (volto+voce+nome) prima di girare/pubblicare il BTS. Chi va a chiederlo?
- 🔴 **Pubblicare il reel** su IG/FB/TikTok (canali reali) → firma Nicola. Contenuto pronto in `consegne/content/W4-bts-bottega.md`, cover in `creativi/output/social/W4-bts-cover.png`.
- 📋 Pre-requisito: riempire segnaposto in negozio (anni attività, prodotto-orgoglio DOP, parentela) + scegliere traccia audio royalty-free con licenza social.

## 2026-06-26 23:40 · @content-social · SISTEMA DI LANCIO Garetti (L6) → primi 50 iscritti
Piano completo (5 canali + funnel + L7): `consegne/content/PIANO-LANCIO-garetti-L6.md`. È il sistema dentro cui vive il post L3 già fatto. Cosa tocca il mondo reale (🔴/🟡):
- [ ] 🔴 **PRE-CONDIZIONE n°1 — Landing lista d'attesa reale** (1 campo + "primi 50 gratis" + UTM per canale). Senza, OGNI canale converte 0. → @builder-automazioni + @frontend-dev + @cro. *Questo sblocca tutto il resto.*
- [ ] 🔴 **Canale 2 (il più ricco) — SÌ di Garetti su 3 cose:** (a) ricondividere il post L3 "La saracinesca" ai suoi clienti, (b) QR + vetrofania in cassa, (c) [opz.] comparire su Libertà. Senza il suo consenso il funnel scende sotto i 50 nel caso peggiore. → richiesta da portare via @vendite/@onboarding-negozi.
- [ ] 🔴 **Canale 1 — pubblicare il Contenuto-faro nei gruppi FB locali** (già in coda; CORREZIONE d'onestà obbligatoria: togliere il −22% non confermato + ZTL solo se cifra blindata). Presidio commenti primi 90'.
- [ ] 🔴 **Canale 5 — angolo stampa Libertà** ("le botteghe storiche sfidano il delivery, parte da Piazza Duomo") → @pr-stampa, su base §4D del piano. Serve data lancio + consenso Garetti.
- [ ] 🟡 **Referral civico** (riga §4C in thank-you page, no budget, gloria non sconto) → @crm-lifecycle. Tenere distinto dal give-get 5€+5€.
- [ ] 🔴 **Vetrofania + cartoncino-cassa + QR per Garetti** → @designer (brief §6), check @qa-designer.
- [ ] 🔴 **Conferma/blinda dato −22% + cifra ZTL + cap incentivo "primi 50 gratis"** → @analista/@finanza prima di pubblicare.
- **Stato:** IN ATTESA DI FIRMA NICOLA. **Mani social** → @builder-automazioni o pubblicazione manuale.

## 2026-06-26 23:40 · @content-social · 🔴🚀 PROPOSTA L7 (mossa 10x non richiesta) — Evento "IL PRIMO TURNO" in Piazza Duomo
- **Cosa:** evento civico di lancio nel sabato di apertura — Garetti alza la saracinesca in Piazza Duomo + partono le prime 50 consegne in cargo-bike. Trasforma "iscriviti alla lista" in "sii tra le 50 consegne del Primo Turno". Dettagli: §8 del piano `PIANO-LANCIO-garetti-L6.md`.
- **Perché 10x:** dà a stampa+gruppi FB un EVENTO (data+luogo iconico+immagine forte) → earned media; trasforma l'iscrizione in un rito civico; arruola Vita in Centro/Comune/altre botteghe a costo ≈0; nativamente "Il Turno", incopiabile da Amazon; i 50 iscritti diventano i primi 50 CLIENTI reali (fine dei "0 ordini").
- **Serve:** una data · ok Garetti a fare il "primo turno" in piazza · mini-budget €0-300 · catena @relazioni-istituzionali + @pr-stampa + @designer + @operations.
- **Colore:** 🔴 PROPOSTA — non eseguita. Aspetta valutazione/firma di Nicola.
- **Stato:** PROPOSTA SUL TAVOLO.

## Bonifica marketplace — 102 problemi (piano pronto da applicare)
- **Cosa:** pacchetto di fix turnkey per tutti e 102 i problemi della radiografia (12 workstream, 23 migrazioni SQL, 4 file corretti). Entry-point: `consegne/bonifica/PIANO-DI-BONIFICA.md`; tabella 🔴 nel §6.
- **Cosa cambia:** applicando l'Onda 0 il sito torna deployabile (B3), il catalogo torna acquistabile per gli shopper (B2), si chiude il furto del wallet (B1) e l'auto-approvazione venditori senza KYC (B4).
- **Se va bene:** apro un branch/PR nel repo del marketplace per workstream, nell'ordine delle 4 ondate, con i test come cancello; le migrazioni prima su staging poi — con firma — sul DB live.
- **Serve da Nicola (🔴):** firma migrazioni su DB live · deploy Render · dati reali Titolare · DPA Anthropic (zero-retention) · dominio email verificato (RESEND_FROM) · chiave Upstash · numero WhatsApp reale · decisione modello approvazione venditori · toggle Leaked-Password ON.
- **Colore:** 🟢 il piano (creato) · 🔴 l'applicazione in produzione (da firmare).
- **Stato:** PRONTO — in attesa del via all'Onda 0.


## 🟡 Accendi le notifiche in tasca: crea il bot Telegram così ti scrivo io quando c'è da firmare
- **Data:** 2026-07-05 05:10
- **Cosa:** dal piano "chiudi i loop" (tuo ordine in chat): la macchina ora sa mandarti su Telegram ogni azione 🟡/🔴 nuova che finisce in coda (una volta sola, niente doppioni). Il codice è pronto e testato in dry-run — mancano solo le 2 chiavi.
- **Come (5 minuti):** ① su Telegram apri **@BotFather** → `/newbot` → copia il token · ② scrivi un messaggio al tuo bot, poi apri `https://api.telegram.org/bot<TOKEN>/getUpdates` e copia il `chat.id` · ③ metti `TELEGRAM_BOT_TOKEN=` e `TELEGRAM_CHAT_ID=` in `cervello/vps/.env` sul VPS · ④ prova: `node cervello/notifica-approvazioni.mjs --test` (ti arriva il messaggio di prova).
- **Cosa cambia:** non devi più aprire il Pannello per scoprire che c'è una firma che ti aspetta: ti squilla in tasca col titolo e il "cosa cambia". Il collo di bottiglia firma→azione (l'ordine #16 fermo per ore) si accorcia.
- **Se va bene:** al primo run reale recuperi in un colpo tutte le azioni in coda mai notificate; poi ogni giro ti manda solo le nuove. Prossimo passo possibile (da firmare a parte): rispondere "ok 16" al bot per approvare dal telefono.
- **Stato:** in attesa

## 🟡 Attiva il guardiano esterno: un servizio gratuito ti avvisa se la macchina si spegne
- **Data:** 2026-07-05 05:10
- **Cosa:** il giro ora manda un "battito" a un watchdog FUORI dalla macchina (PZ-007). Se il VPS o il timer muoiono, il battito smette di arrivare e il servizio ti manda l'allarme — è l'unico guasto che i controlli interni non possono coprire (se muore il VPS, muore anche il controllore).
- **Come (5 minuti):** ① account gratuito su **healthchecks.io** (o UptimeRobot heartbeat) · ② crea un check "giro MyCity" con periodo 4 ore e grace 2 ore · ③ copia l'URL di ping in `HEARTBEAT_PING_URL=` in `cervello/vps/.env` · ④ (consigliato) imposta l'avviso via Telegram/email.
- **Cosa cambia:** se il cuore della macchina si ferma (VPS giù, timer spento, giro che crasha in loop), lo scopri in ~2 ore da un allarme, non dopo giorni di Cabina ferma.
- **Se va bene:** l'auto-guarigione ha l'ultimo anello: guasti interni li vede la macchina, guasti totali li vede il guardiano esterno.
- **Stato:** in attesa

<!-- SUPERVISIONE-NEGOZI:INIZIO -->
### 🛡️ Supervisione negozi & prodotti — proposte di riempimento (aggiornato 2026-07-06 12:03)
Report completo con comandi pronti: `consegne/supervisione/2026-07-06-supervisione.md`. Tutte 🟡, reversibili (backup per riga).

| Azione (pronta) | Colore | Quanti | Cosa cambia | Se va bene |
|---|---|---|---|---|
| Metti «nuovo» come condizione ai 252 prodotti che non ce l'hanno | 🟡 | 252 | 252 schede oggi incomplete mostrano condizione corretta ai clienti. | Cataloghi più completi = ricerca/filtri migliori e più fiducia; poi passo al gruppo successivo. |
| Metti «pezzo» come unità di misura ai 242 prodotti che non ce l'hanno | 🟡 | 242 | 242 schede oggi incomplete mostrano unità di misura corretta ai clienti. | Cataloghi più completi = ricerca/filtri migliori e più fiducia; poi passo al gruppo successivo. |

> Approva scrivendo **«ok riempi [unità/condizione/…]»** oppure **«ok a tutte le proposte di supervisione»**.
<!-- SUPERVISIONE-NEGOZI:FINE -->
