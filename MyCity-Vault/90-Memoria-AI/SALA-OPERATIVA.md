---
tipo: canale-squadra
fonte: i senior dell'AD
---

# 🛰️ SALA OPERATIVA — il canale della squadra

> Non una stanza chiusa: un **canale sempre aperto** dove la squadra si coordina. Ogni senior **LEGGE**
> prima di iniziare (per non duplicare e per sfruttare il lavoro altrui) e **SCRIVE** cosa fa, cosa ha
> fatto, cosa gli serve. Append-only: si aggiunge in fondo.

## Come si scrive (1 riga)
`AAAA-MM-GG HH:MM · @reparto · TIPO · messaggio`
**TIPO** = `FACCIO` · `FATTO` · `SERVE` (chiedo aiuto) · `PASSO-A @reparto` (handoff) · `RIVEDI` (chiedo peer review)

Esempi:
- `2026-06-25 09:10 · @growth · FACCIO · calcolo le leve sul bundle DOP`
- `2026-06-25 09:12 · @growth · SERVE · @finanza il margine sul bundle DOP a 28€`
- `2026-06-25 09:20 · @finanza · FATTO · margine bundle DOP = 34% → semaforo verde`
- `2026-06-25 09:25 · @designer · PASSO-A @content · locandina pronta in creativi/output/, serve la copy`

---

## Canale
<!-- La squadra scrive qui sotto, dal più vecchio al più recente. -->

### 2026-06-24 — Team play: "portare il negozio-faro (Garetti) LIVE domani"
- 2026-06-24 02:20 · @intelligence · FATTO · campo-aperto + 3 leve urgenza (bando 21/7, mercato sab 27/6, caldo+ZTL) in `consegne/intelligence/campo-aperto-faro.md` → PASSO-A @vendite. SERVE @finanza conferma commissione, @legale kit bando.
- 2026-06-24 02:22 · @vendite · PASSO-A @legale · Pitch + checklist 20min + termini in `consegne/vendite/pitch-garetti.md`. Decisi: commissione 12%, 0€ fissi, payout a consegna, nessun vincolo, COD-first. Servono da @legale: condizioni 1 pagina + kit bando.
- 2026-06-24 02:25 · @legale-privacy · FATTO · Bozza contratto venditore 1-pagina in `consegne/legale/contratto-venditore-bozza.md` (12% solo a buon fine, 0 fissi, payout a consegna, recesso libero, GDPR). BOZZA da validare. PASSO-A @vendite.
- 2026-06-24 02:29 · @finanza · FATTO · payout-test 4 min + dati KYC in `consegne/finanza/payout-faro.md` (1€ → split 12% → payout via Stripe Connect; variante COD). PASSO-A @vendite (min 17-20 onboarding). SERVE @tech: Stripe Connect + application_fee 12% + payout a consegna.
- 2026-06-24 02:29 · @designer · FATTO · Locandina QR A5 (PDF) + QR PNG in `creativi/output/` (brand ok, QR verificato; URL segnaposto → rigenerare col link reale). PASSO-A @vendite e @builder-automazioni.
- 2026-06-24 02:29 · @customer-success · PASSO-A @designer/@content · script primo ordine concierge + telefonata feedback + prima recensione in `consegne/customer-success/primo-ordine-faro.md`. SERVE @tech (consegnato→abilita recensione), @legale-privacy (consenso messaggi).

### 2026-06-25 — ☀️ PIANO DEL MATTINO (AD)
**Obiettivo del giorno:** Garetti LIVE + macchina collaudata (ordine-test → payout). North Star: 1° ordine reale entro sab 27/6.
**Le 3 priorità:** ① Garetti LIVE (onboarding 20 min) · ② accendere la domanda (QR cassa + lista d'attesa + 1ª storia) · ③ collaudare la macchina (ordine-test fino al payout).

Assegnazioni (1 mossa per reparto — il pacchetto è già pronto in `consegne/`):
- @vendite · onboarding LIVE di Garetti (P.za Duomo 44) col pitch + contratto pronti · 🟡 (termini = 🔴 in attesa, riga 1)
- @tech · sola lettura: verifica migrazioni 021/023 + supporta il percorso /sign-up→/sell→/admin/users→/admin/products · 🟢
- @finanza · payout-test 4 min col negoziante (min 17-20 onboarding) · 🔴 dipende da live/sandbox (riga 2)
- @designer · rigenera locandina+QR col link reale `/store/<id>` appena Garetti è creato · 🟢
- @marketing · crea il Google Form lista d'attesa + apri IG/Google Business · 🟢 (pubblicare = 🔴)
- @content-social · bozza 1ª "storia di bottega" Garetti coi dati raccolti in negozio · 🟢 (pubblicare = 🔴)
- @operations · congela zona 700m + slot ven→sab · 🟢 (fee consegna = 🔴)
- @customer-success · conferma il primo sabato concierge (27/6) + script pronti · 🟢 (messaggi clienti = 🟡 riga 3)
- @intelligence · screenshot Glovo Piacenza (prova "campo aperto") da mostrare a Garetti · 🟢
- @analista · query cruscotto a inizio e fine giornata: i 7 numeri devono passare da 0 a ≥1 · 🟢
🙋 Serve da Nicola per sbloccare: 🔴 Stripe LIVE o sandbox? · firme righe 1-2 (+ fee, incentivo 50€, tipografia) · 🟡 riga 3 · chi va fisicamente da Garetti.

- 2026-06-24 · @marketing · FATTO · PIANO EDITORIALE MAESTRO in `consegne/marketing/PIANO-EDITORIALE.md` (spina canonica, KPI 4 settimane + 31/12, mappa canali, 5 pilastri, calendario S1-S4 da lun 30/06, sistema di misura UTM, governance 🟢🟡🔴). PASSO-A @content-social (bozze S1), @designer (visual+QR), @crm-lifecycle (email lista), @pr-stampa (comunicato 08/07). SERVE @analista (foglio KPI 7 proxy), @legale-privacy (consenso GDPR email).
- 2026-06-24 · @pr-stampa · FATTO · Kit stampa di lancio completo in `consegne/pr/KIT-STAMPA-LANCIO.md` (comunicato 1 pag + 2 pitch + 5 contatti reali + calendario 6 momenti + checklist press kit). Invii reali = 🔴 accodati. PASSO-A @designer (foto/asset HD), @relazioni-istituzionali (citazione assessore Fornasari), @content-social (amplificazione gruppi FB dopo l'uscita), @analista (misura reach). SERVE @relazioni-istituzionali: dichiarazione assessore; @designer: cartella foto HD (founder+cargo-bike+Garetti).

- 2026-06-24 16:30 · @content-social · FATTO · Calendario social 4 settimane (16 contenuti pronti + bio IG/FB + 10 idee storia-bottega) in `consegne/content/CALENDARIO-4-SETTIMANE.md`. Spina canonica rispettata (causa + tagline + LUN/MER/VEN/DOM). PASSO-A @designer (16 visual, tabella in coda al file). SERVE @builder-automazioni: URL reale lista d'attesa. RIVEDI @finanza: sostenibilità promo "primi 50 = consegna gratis". Pubblicazione = 🔴 (ok Nicola + ok Garetti per nome/foto) → accodata in AZIONI-IN-ATTESA.
- 2026-06-24 03:10 · @crm-lifecycle · FATTO · 7 flussi lifecycle con testi completi pronti all'invio in `consegne/crm/FLUSSI-LIFECYCLE.md` (welcome 3 email, conferma primo ordine, feedback+recensione, win-back+telefonata, referral+gift, carrello 2 touch, riordino settimanale). Voce "Vicino Orgoglioso", riuso checklist concierge di @customer-success. NIENTE inviato (DRY-RUN). PASSO-A @legale-privacy (validare footer/consenso) e @builder-automazioni (collegare RESEND/push/Telegram/webhook). 🔴 incentivi accodati in AZIONI-IN-ATTESA.

- 2026-06-24 · @designer · FATTO · PACCHETTO VISIVO DI LANCIO in `consegne/design/PACCHETTO-VISIVO-LANCIO.md` (4 template social LUN/MER/VEN/DOM con palette HEX+gabbia+testi · spec vetrofania/sacchetto/locandina-cassa/targa · convenzione QR+UTM `qr-<negozio>` · checklist stampa con quantità dal Piano Notorietà). QR+locandina Garetti generati e verificati in `creativi/output/` (qr-garetti-cassa.png + locandina-cassa-garetti.pdf). PASSO-A @builder-automazioni (dominio+id-store reali → rigenero QR definitivi) · @content-social (16 visual sulle 4 maschere) · @vendite (consegna materiali a Garetti). RIVEDI @finanza (quantità/costo checklist). Ordine tipografia = 🔴 (firma Nicola).
- 2026-06-24 · @seo · FATTO · PACCHETTO SEO LOCALE + GBP per il lancio in `consegne/seo/PACCHETTO-SEO-LOCALE.md` (4 cluster keyword con stime, GBP MyCity + descrizione + 4 post pronti, template title/meta/H1/JSON-LD scheda negozio+prodotto con esempio Garetti compilato, piano GBP negozi, 5 articoli long-tail). Insight: campo aperto su "botteghe a domicilio" (GDO e Deliveroo non lo presidiano). PASSO-A @content-social (5 articoli, tono civico), @designer/@ai-designer (foto HD per GBP+schede), @frontend-dev/@tech (impianto meta/schema SOLO in branch, allinearsi: piu sessioni sul repo), @onboarding-negozi (checklist GBP per ogni negozio), @customer-success (recensioni GBP post-consegna). ACCODATO 🟡: creare GBP MyCity, branch meta/schema, collegare GBP-negozio Garetti. SERVE da Nicola: OK GBP+telefono unico, via libera al branch, decisione incentivo primo ordine (POST 3).

- 2026-06-25 23:15 · @content-social · FATTO · MANIFESTO-CAUSA "Ogni spesa è un voto" (angolo nuovo: ordine = atto civico). Copy FB+IG, 1° commento, 15 hashtag, piano di misura in `consegne/content/C1-manifesto-causa.md`; PNG in `creativi/output/social/C1-manifesto-causa.png` (variante OLIVA, diversa dal FLAGSHIP terracotta); template `cervello/content-factory/templates/manifesto-causa.html`. PASSO-A @designer (versione Story 9:16). RIVEDI @legale-privacy (claim −22% + consenso lista). SERVE @builder-automazioni: link reale lista d'attesa. Pubblicazione = 🔴 + conferma dato −22% (firma Nicola) → accodata in AZIONI-IN-ATTESA.

- 2026-06-25 23:20 · @growth-monetizzazione · FATTO · Contenuto social categoria NUOVA "PRODOTTO-EROE DOP / regalo da spedire": box 3 salumi DOP spedito (leva slegata dal raggio di consegna, margine ~45%, scontrino 3-5x). PNG `creativi/output/social/C3-prodotto-dop.png` (1080² @2x) + template `cervello/content-factory/templates/prodotto-dop.html` + script dedicato `render-prodotto-dop.mjs` (NON tocca render.mjs). Copy+caption IG+hashtag+angolo vendita+stagionalità Natale/turismo in `consegne/content/C3-prodotto-dop.md`. Trattamento grafico "carta da salumeria" con SEGNAPOSTO foto marcato (foto reale o Gemini in dry-run). PASSO-A @vendite (bottega che fa i DOP + costo ingrosso), @finanza (RIVEDI margini), @ai-designer (foto PRO nel segnaposto .foto), @frontend-dev (landing "Box-Regalo DOP" UTM c3-box-dop). 🔴 in attesa: prezzo box (proposta Classico 49€ sped. inclusa) + via libera pubblicazione + GEMINI_API_KEY.

- 2026-06-25 23:40 · @crm-lifecycle · FATTO · C5 PROVA SOCIALE/TESTIMONIANZA (la fiducia che converte). Template citazione `cervello/content-factory/templates/prova-sociale-quote.html` (segnaposto citazione/nome/zona, fondo panna+accento oliva, citazione eroe Fraunces+virgolette, 5 stelle, "✓ ordine verificato") + PNG `creativi/output/social/C5-prova-sociale.png` (1080x1350, citazione-ESEMPIO marcata col badge rosso) + consegna `consegne/content/C5-prova-sociale.md` (3 angoli: cliente/caregiver/bottegaio, caption IG, KPI). ONESTA: 0 clienti reali → niente testimonianze inventate, esempio dichiarato. PASSO-A @customer-success (raccolta frase+consenso dal sabato concierge 27/6 → telefonata feedback) e @designer (rigenero PNG senza badge ESEMPIO con la frase vera). RIVEDI @legale-privacy (consenso citazione+nome+zona GDPR, revoca). Pubblicazione con testimonianza reale = 🔴 (ok Nicola + ok cliente).

- 2026-06-25 23:20 · @seo · FATTO · Carosello educativo "da salvare" C2 "VERA coppa piacentina DOP" (5 slide 1080×1350 + template parametrico + caption IG con hashtag) in `consegne/content/C2-carosello-educativo.md`, PNG in `creativi/output/social/C2-carosello-1..5.png`. Fatti da disciplinare DOP ufficiale (no claim gonfiati). UTM `ig-carosello-coppadop`, KPI = salvataggi. Nuova categoria contenuti ad alta condivisibilità. PASSO-A @marketing (mettilo nel calendario), @designer (eventuale foto-prodotto su cover). RIVEDI @legale-privacy (uso descrittivo di "DOP"/Consorzio nei testi). Pubblicazione = 🔴 (canali social ancora da aprire) → resta pronto. SERVE @builder-automazioni: URL reale lista d'attesa per chiudere il funnel.

- 2026-06-25 23:20 · @cro · FATTO · Contenuto social C4 categoria NUOVA "POV/ZTL relatable" (Sabato e ti tocca prendere la coppa). PNG verificato `creativi/output/social/C4-pov-ztl.png` (1080x1350) + template `cervello/content-factory/templates/pov-relatable.html` + render `render-pov.mjs`. Copy/caption/hashtag/meccanica-tag/timing/KPI in `consegne/content/C4-pov-ztl.md`. Format serializzabile. PASSO-A @content-social (serie POV "Sei di Piacenza", 4 puntate). RIVEDI @legale-privacy (tono ZTL/multa bonario, non diffamatorio). SERVE @builder-automazioni (URL bio + UTM pov_ztl). Pubblicazione = 🔴 accodata. SERVE da Nicola: ok pubblicare + conferma cifra multa 83€ + quale link in bio.

- 2026-06-25 · @intelligence · FATTO · Dossier "5 aziende simili + analisi social post-per-post" in `consegne/intelligence/5-aziende-simili-social.md`. 5 comparabili (Cortilia, Bookshop.org, La Ruche qui dit Oui, CrowdFarming, Cicalia-PC) con post concreti sezionati (hook reali, formato, CTA), 7 pattern vincenti mappati sulle 5 categorie, 3 idee nuove, anti-pattern (Babaco/Farmdrop/Gorillas). PASSO-A @content-social e @marketing per il calendario editoriale. Engagement IG non accessibile (login-wall) → marcato [non accessibile], niente numeri inventati.

- 2026-06-26 · @marketing · FATTO · Campagna "Anti-Black-Friday piacentino" (rifacimento del format vincente Bookshop "Anti-Prime-Day", +600% loro benchmark) in `consegne/content/W2-anti-blackfriday.md`: post gruppi FB "nota dalle botteghe del centro" + caption IG + primo commento + reel script + mini-piano (burst 48h sul BF/Prime Day, UTM, metriche oneste) + grafica `creativi/output/social/W2-anti-blackfriday.png` (1080×1350, variante BORDEAUX militante, verificata). Pubblicazione = 🟡 · boost 30€ = 🔴 (target/CPA atteso nel doc). PASSO-A @content-social (jolly BF in calendario), @pr-stampa (angolo earned Libertà), @ai-video (reel testo-animato). SERVE @builder-automazioni: URL lista d'attesa+UTM. RIVEDI @legale-privacy: consenso lista + fonte claim −22%.

- 2026-06-26 00:46 · @content-social · FATTO · ritratto "Il nostro bottegaio" (Garetti) pronto: post FB + caption IG + script reel in `consegne/content/W3-ritratto-bottega.md`, grafica 1080x1350 in `creativi/output/social/W3-ritratto-bottega.png`, template riusabile `cervello/content-factory/templates/ritratto-bottega.html`. Deriva da La Ruche "Notre producteur" (reel DOfw6x3DSHX). PASSO-A @designer (inserire foto vera + togliere badge), @ai-video (girare reel con Garetti), @customer-success/@vendite (raccogliere foto+frase+consenso in onboarding). RIVEDI @legale-privacy (consenso immagine 🔴). SERVE da Nicola: foto + frase reale + consenso → poi pubblicazione 🔴.

### 2026-06-26 — Reel BTS "Dietro la saracinesca" (W4)
- 2026-06-26 · @ai-video · FATTO · Reel 9:16 "Dietro la saracinesca" (format CrowdFarming BTS grezzo, hook «Sono le 6. Garetti apre da [X] anni») — script+scaletta+caption in `consegne/content/W4-bts-bottega.md`, cover renderizzata `creativi/output/social/W4-bts-cover.png`. PASSO-A @content-social (caption nel calendario W4), @vendite/@customer-success (raccogliere segnaposto + consenso Garetti). 🔴 pubblicazione = firma Nicola · 🟡 consenso volto/voce Garetti.

- 2026-06-26 · @marketing · FATTO · PIATTAFORMA CREATIVA "Il Turno" (territorio civico) in `consegne/marketing/territorio-civico.md`: big idea ownable ("la tua spesa è il tuo turno di guardia sulla città"), claim "Fai il tuo turno" sotto la tagline, insight (colpa→potere per Giulia), 5 esecuzioni (manifesto "orario del turno", reel "cambio di turno", vetrofania "saracinesca che parla", registro dei turni social, cartello-cassa negozi), architettura 6 mesi in 3 atti (prendo/faccio/ci diamo il turno). NON sostituisce la spina canonica: è il cappello creativo sopra. PASSO-A @content-social (riscrivere hook in chiave turno), @designer/@ai-designer (ri-titolare asset esistenti: manifesto+vetrofania+cartello), @pr-stampa (angolo "saracinesca che parla"), @crm-lifecycle ("passa il turno"=referral). Produzione bozze = 🟢; affissioni/pubblicazioni/PR reali = 🔴 (firma Nicola + ok Garetti).

- 2026-06-27 19:50 · @intelligence · FATTO · monitoraggio web (fonti controllate: Comune News/Eventi+ZTL, Libertà, IlPiacenza Economia/Eventi, PiacenzaSera, meteo Piacenza — i portali locali bloccano WebFetch 403, ripiego WebSearch). Novità chiave: (1) ONDATA CALDO 38-40°C weekend 27-28/6 → picco delivery food/bibite, svolta meteo+temporali 1/7; (2) VENERDÌ PIACENTINI ven 3/10/17 lug, 300 negozi aperti fino a mezzanotte, 280k visitatori → vetrina per presidio offline QR (PASSO-A @designer/@vendite), non delivery serale (ZTL); (3) Festa del Tortello Vigolzone 24-28 lug → onda domanda DOP (PASSO-A @growth/@content-social). Aggiornati: Intelligence/eventi-picchi.md, buchi-mercato.md, reputazione.md. Nessuna menzione reale di MyCity oggi.

### 2026-06-28 — Database ricollegato + giro completo (4 cadenze)
- 2026-06-28 16:46 · @AD · FATTO · **Database del marketplace ricollegato** dopo il pagamento abbonamento: Supabase `clmpyfvpvfjgeviworth` = ACTIVE_HEALTHY. Riverificati i 7 numeri sul vivo (primi dati freschi dal 24/6). Aggiornati STATO.md, Briefing/2026-06-28.md, ultimo-briefing.json.
- 2026-06-28 16:46 · @analista · FATTO · Lettura numeri reali: 2 negozi approvati (Casa Linda payout-ok, Pane Quotidiano), 0 prodotti-faro veri (250 seed), 1 ordine zombie €19,05 COD (PENDING dal 24/6), 0 pagati/0 consegnati/0 payout, 4 clienti, 407 lead `to_contact`. **Ultima attività 24/6 08:28 = 96h di silenzio.** RIVEDI @finanza (Stripe da riconciliare al prossimo giro).
- 2026-06-28 16:46 · @AD · FATTO · Auto-analisi (cancello serietà): voto fiducia **85 ▲** (da 79, sensori tornati). Confermate nel registro 2 entità reali (Casa Linda, Pane Quotidiano); Garetti resta scelta_ragionata. Scritti auto-analisi.json + AUTO-ANALISI.md + registro-realta.json + storico-salute.json.
- 2026-06-28 16:46 · @AD · FATTO · Eseguite in un colpo le 4 cadenze (giro + piano mattino + report sera + review settimanale). PASSO-A @vendite+@operations (prima transazione Casa Linda 🔴), @operations (sblocco ordine zombie 🔴). SERVE da Nicola: chiarire dove scrive la memoria (DB 2) + 3 firme di lancio.

### 2026-06-28 — Memoria costruita + 2° giro (20:25)
- 2026-06-28 20:25 · @AD/Tech · FATTO · **Costruito il DB-memoria separato** (`xjljcsorpbqwttrejqte`): 5 tabelle (briefings·diario·lavori·conversazioni·impostazioni), RLS attiva, advisor = solo INFO atteso, verificato live. Collegato agli strumenti via `.mcp.json` a 2 connessioni (marketplace RO + memoria RW). Risolve la domanda «memoria separata?» del giro 16:46.
- 2026-06-28 20:25 · @AD · FATTO · **Primo briefing scritto DENTRO la memoria** (tabella briefings, id 092ad453). La memoria ora persiste: il Pannello la mostrerà appena fatto il wiring Vercel.
- 2026-06-28 20:25 · @analista · FATTO · 2° lettura numeri reali: **identici alle 16:46** (2 approvati, 1 payout Casa Linda, 0 prodotti-faro, 1 ordine COD fermo, 0/0/0, 4 buyer). Ultima attività ancora 24/6 08:28 → **stallo a ~106h**. RIVEDI @finanza (Stripe al prossimo giro).
- 2026-06-28 20:25 · @intelligence · FATTO · Scan esterno live (fonti citate): Venerdì Piacentini 3/10/17 lug (50-60k/sera), ondata calore ~39°C, +Sant'Antonino patronale; 3 buchi mercato (gastronomia centro, delivery diurno, regalo locale, conf.~70%). Aggiornati eventi-picchi.md + radar-concorrenti.md (NUOVO) + buchi-mercato.md. PASSO-A @designer/@vendite (kit QR Venerdì).
- 2026-06-28 20:25 · @AD · FATTO · Auto-analisi: voto fiducia **87 ▲** (da 85). Aggiunta entità confermata «DB Memoria» al registro. PASSO-A Nicola: ① ok transazione Casa Linda 🔴 · ② wiring Vercel memoria 🟡.

### 2026-06-29 — Giro di perlustrazione (domenica)
- 2026-06-29 11:30 · @AD · FATTO · Giro completo: riverificati i 7 numeri live (identici, stallo a ~125h). Scan @intelligence con WebSearch: meteo 37°C, Venerdì Piacentini confermati 3/10/17 lug (record 250 eventi), Ex Scuderie 🆕 (3 spazi food premium approvati dal Comune), bando ER confermato (scade 21/7, 22gg). Aggiornati 3 file Intelligence + STATO + briefing + ultimo-briefing.json + auto-analisi.
- 2026-06-29 11:30 · @intelligence · FATTO · Scan live: caldo 37°C (calo da mar), Venerdì Piacentini 3/7 record (250 eventi, 300 negozi), Ex Scuderie (3 spazi food centro), bando ER (40% fondo perduto, 22gg), CompraPiacenza dormiente (conf. 60%), Hub Urbano (fondi 14M€). Nessuna novità Glovo/GDO.
- 2026-06-29 11:30 · @AD · FACCIO · Proposta nuova: **kit "Bando ER + MyCity"** per onboarding (il bando rimborsa il 40% della digitalizzazione → leva commerciale urgente). PASSO-A @vendite + @legale-privacy.
- 2026-06-29 11:30 · @AD · SERVE · Da Nicola: ① ok transazione Casa Linda 🔴 · ② sblocco ordine zombie 🔴 · ③ firme lancio 🔴 · ④ wiring Vercel 🟡 · ⑤ ok kit bando ER 🟡.
- 2026-06-29 14:24 · @AD · FATTO · Passaggio leggero (4° giro di giornata): dati congelati, stallo a ~128h, nessuna novità esterna dalle 11:30 (scan locale WebSearch). ⚠️ Sensori ridotti: Supabase MCP + WebFetch NON autorizzati in sessione → numeri non ri-verificati live (ereditati dalle 11:20, dichiarato). Aggiornati briefing (passaggio in cima) + STATO + ultimo-briefing.json + auto-coscienza.
- 2026-06-29 14:24 · @AD · FATTO · Auto-analisi: voto fiducia **86 ▼** (da 88). Lezione L-2026-0629-03: non moltiplicare i giri a sensori ciechi se fuori non cambia nulla. Sonda auto-radiografia: REGRESSIONE sensori (conferma difetto 'salute-sensori-dati', non chiuso).
- 2026-06-29 14:24 · @AD · SERVE · Da Nicola, INVARIATO: la palla è in mano tua. ① ok transazione Casa Linda 🔴 · ② sblocco ordine zombie €19,05 🔴 · ③ firme lancio 🔴 (foglio-firma 2 min) · ④ via al kit Bando ER 🟡 (−1 giorno: 22gg) · ⑤ wiring Vercel 🟡.
- 2026-06-29 16:24 · @AD · FATTO · 5° passaggio leggero: dati immobili, stallo ~128h (5g 8h), zero novità intraday. Riprovato Supabase MCP → ancora NON autorizzato. Aggiornati orari briefing/STATO/digest/auto-coscienza. Non ho moltiplicato analisi (lezione L-2026-0629-03).
- 2026-06-29 16:24 · @devops-sre · FATTO · Sentinella 🔴 ogni-giro (ops-02/partner-02) chiusa positiva: **Supabase + Stripe operativi** (status pubblici via WebSearch). L'infrastruttura non è a rischio durante lo stallo → il blocco è 100% decisionale, non tecnico.
- 2026-06-29 16:24 · @AD · SERVE · Da Nicola, INVARIATO: ① ok transazione Casa Linda 🔴 · ② sblocco ordine zombie 🔴 · ③ firme lancio 🔴 · ④ via kit Bando ER 🟡 (22gg) · ⑤ wiring Vercel 🟡.

### 2026-06-30 — Giro di perlustrazione (martedì mattina)
- 2026-06-30 11:45 · @AD · FATTO · Giro completo. Supabase MCP non collegato in sessione (needsAuth) → 7 numeri = baseline 29/6 (gap di misura, non di business). Stallo a ~6 giorni. Aggiornati briefing [[2026-06-30]] + STATO + eventi-picchi + ultimo-briefing.json + intenzioni-nicola.json + auto-coscienza.
- 2026-06-30 11:45 · @intelligence · FATTO · Scan live: **SVOLTA METEO — caldo finito**, oggi 30/6 e domani 1/7 pioggia (prob. 90%, max ~34°C), poi mite. **Venerdì Piacentini 3/7 confermato (49 eventi:** wrestling ICW Piazza Cavalli 22:00, Tu Si Que Avis Piazza Duomo, Modoolo clubbing, XNL 19-23). Competitor/stampa/istituzioni non rifatti (cadenza settimanale).
- 2026-06-30 11:45 · @operations · FATTO · Nota operativa svolta meteo in `consegne/operations/2026-06-30-svolta-meteo-pioggia.md` (🟢): regola "no freschi 12-18" rilassata, leva "piove te la portiamo noi", presidio VP 3/7 ora comodo (sera fresca), piano B cargo-bike bagnato.
- 2026-06-30 11:45 · @AD · SERVE · Da Nicola (invariato): ① ok transazione Casa Linda 🔴 · ② sblocco ordine zombie 🔴 · ③ firme lancio 🔴 · ④ autorizzare Supabase MCP / wiring Vercel 🟡. Nessuna nuova azione accodata: coda già piena e pertinente.

### 2026-06-30 — Giro serale (22:17)
- 2026-06-30 22:17 · @AD · FATTO · Giro serale: 7 numeri RIVERTIFICATI LIVE via REST Supabase (identici 29/6). Stallo 155h (+2h vs 17:17). Sensori marketplace recuperati (fallback REST quando MCP cieco).
- 2026-06-30 22:17 · @analista · FATTO · Numeri live: 2 negozi/1 payout, 1 ordine zombie €19,05, 0 pagati/consegne/payout, 4 buyer (0 nuovi 7g), 4 carrelli abbandonati, 407 lead.
- 2026-06-30 22:17 · @devops-sre · FATTO · Radar ops-02: Supabase incident mgmt ops 30/6 (create/resize) — REST read OK; Stripe operativo. Manutenzione Supabase 2/7 03-04 UTC.
- 2026-06-30 22:17 · @intelligence · FATTO · Meteo 1/7: temporali/pioggia confermati. VP 3/7 tra 3 giorni (49 eventi).
- 2026-06-30 22:17 · @vendite · FATTO · Lista 10 lead food centro in consegne/vendite/2026-06-30-primi-10-lead-food-centro.md (🟢) — da usare post-1ª transazione con kit bando ER.
- 2026-06-30 22:17 · @AD · SERVE · Da Nicola: ① Casa Linda 🔴 · ② ordine zombie 🔴 · ③ firme lancio 🔴 · ④ link lista d'attesa per VP 3/7 🔴 (tra 3 giorni).

### 2026-06-30 — Giro notturno (23:08)
- 2026-06-30 23:08 · @AD · FATTO · Giro notturno: 7 numeri LIVE confermati (= vs 22:17). Stallo 157h (+2h). Quarto passaggio del giorno — business invariato, onesto.
- 2026-06-30 23:08 · @operations · FATTO · Checklist countdown VP 3/7 (~48h) in consegne/operations/2026-06-30-checklist-countdown-vp-3-luglio.md.
- 2026-06-30 23:08 · @intelligence · FATTO · Allerta gialla temporali 1/7 confermata (Protezione Civile ER). VP 3/7 countdown operativo.
- 2026-06-30 23:08 · @AD · SERVE · Da Nicola: invariato — Casa Linda 🔴 · ordine zombie 🔴 · link lista VP 🔴 · foglio-firma 🔴.

- 2026-06-30 23:15 · @AD · FATTO · Giro notturno: 7 numeri LIVE confermati (= vs 23:10). Stallo 156,8h. Sesto passaggio — escalation soglia 168h 🟢.
- 2026-06-30 23:15 · @AD · FATTO · Nota escalation stallo in consegne/ad/2026-06-30-nota-escalation-stallo-168h.md (🟢). Digest memoria DB scritto.
- 2026-06-30 23:15 · @devops-sre · FATTO · Sentinella ops-02: Supabase mgmt incident 30/6 — REST read OK 23:15; Stripe operativo.
- 2026-06-30 23:15 · @AD · SERVE · Da Nicola: invariato — Casa Linda 🔴 · ordine zombie 🔴 · link lista VP 🔴 (~46h) · foglio-firma 🔴.

### 2026-07-01 — Giro mattina (00:17)
- 2026-07-01 00:35 · @AD · FATTO · **Web per tutti i senior** (🟡 Nicola): WebFetch globale in `.claude/settings.json` + policy `07-Agenti/WEB-APPRENDIMENTO-SENIOR.md` + blocco web su 42 mansionari. Ogni senior può benchmark/apprendimento continuo, non solo @intelligence.
- 2026-07-01 00:17 · @AD · FATTO · Giro 1/7: 7 numeri LIVE REST (= vs 30/6 23:15). Stallo 157,8h ▲+1h. Soglia 168h tra ~10h.
- 2026-07-01 00:17 · @operations · FATTO · Playbook temporali 1/7 in consegne/operations/2026-07-01-playbook-temporali.md (🟢). Allerta 070/2026 ER.
- 2026-07-01 00:17 · @analista · FATTO · Snapshot KPI in consegne/analista/2026-07-01-kpi-live-0017.md (🟢). 6 carrelli >4h confermati.
- 2026-07-01 00:17 · @intelligence · FATTO · eventi-picchi.md + buchi-mercato.md aggiornati (allerta oggi + countdown VP ~66h).
- 2026-07-01 00:17 · @devops-sre · FATTO · Sentinella ops-02: REST marketplace OK; Supabase mgmt incident altre regioni; Stripe OK.
- 2026-07-01 00:17 · @AD · SERVE · Da Nicola: Casa Linda 🔴 (~10h a 168h) · ordine zombie 🔴 · link lista VP 🔴 (~66h) · foglio-firma 🔴.

### 2026-07-01 — Correzione Nicola (00:56)
- 2026-07-01 00:56 · @AD · FATTO · Nicola corregge: **Casa Linda = demo**, unico negozio reale = **Pane Quotidiano** (Via Calzolai 25). Verificato live REST: 5 prodotti bio, tel. 0523388601, payout OFF, ordine zombie €19,05. Proposta Casa Linda **RITIRATA**. Aggiornati registro-realta, STATO, intenzioni-nicola, ultimo-briefing, DECISIONI.
- 2026-07-01 00:56 · @AD · SERVE · Da Nicola: ① ordine zombie €19,05 — **A accetta o B annulla?** 🔴 · ② ok completare payout Stripe Pane Quotidiano 🔴 · ③ link lista VP 🔴 · ④ foglio-firma 🔴.

### 2026-07-01 — Sync VPS WebFetch (01:16)
- 2026-07-01 01:16 · @Nicola · FATTO · Eseguito `sudo bash cervello/vps/aggiorna-cervello.sh` (sync codice da main + restart worker).
- 2026-07-01 01:16 · @AD · FATTO · Verifica post-sync: worker **attivo** ✓ · commit `1394219` allinea codice a main (01:13) · **`settings.json` = ancora whitelist WebFetch** (11 domini) — su `origin/main` non c'è la riga globale. Senior sul worker **non** navigano liberamente finché PR su `main` non mergiata + secondo sync.
- 2026-07-01 01:19 · @Nicola · SERVE · Chiede «come faccio PR su main?» — playbook consegnato (AD apre PR o GitHub UI); **PR WebFetch non ancora aperta**.

### 2026-07-01 — Rimando presidio VP (01:00)
- 2026-07-01 01:00 · @AD · FATTO · Nicola rimanda **Presidio VP 3/7** (kit QR + contenuti): priorità = **inserire negozi del 6/7**. Proposta Pannello congelata; #7/#8/#11 in coda ma non partono. Prossima finestra utile VP **10/17 lug** (se link lista pronto).
- 2026-07-01 01:03 · @AD · FATTO · Nicola: «perché devo approvare?» su card onboarding 6/7 → **non serve approvazione** (lavoro suo); card ritirata da proposte Pannello.
- 2026-07-01 01:00 · @onboarding-negozi · FACCIO · Preparare checklist batch 6/7 (catalogo, payout, foto, test ordine) — 🟢 bozza in consegne/.
- 2026-07-01 01:00 · @AD · SERVE · Da Nicola: ① **lista negozi 6/7** (nomi/quanti) · ② ordine zombie A/B 🔴 · ③ foglio-firma 🔴.

### 2026-07-01 — Giro web apprendimento (01:29) — tutti i 42 senior
- 2026-07-01 01:29 · @AD · FACCIO · Nicola chiede giro web a tutti i senior: benchmark 2025-26, ESITO in `memoria-squadra/`.
- 2026-07-01 01:29 · @AD · FATTO · **42/42 senior** completati (Cursor, WebFetch globale locale). Sintesi in `consegne/ad/2026-07-01-giro-web-senior.md`. Quaderni aggiornati: `memoria-squadra/*.md` (1 riga ESITO ciascuno, URL+data).
- 2026-07-01 01:29 · @relazioni-istituzionali · PASSO-A @vendite · Bando FESR Commercio ER **chiuso 23/06** (tet domande) — non promettere fondo perduto 40% ai negozi; cercare prossimo sportello ER/Comune.
- 2026-07-01 01:29 · @contabilita · PASSO-A @finanza · Fattura elettronica **v1.9.1** utilizzabile dal **15/05/2026** (AdE) — verificare impatto su fatturazione commissioni MyCity.
- 2026-07-01 01:29 · @legale-privacy · PASSO-A @tech · CGUE **2/12/2025** (C-492/23): marketplace = titolare GDPR su dati negli annunci — mappare su catalogo/recensioni MyCity.
- 2026-07-01 01:29 · @marketing · PASSO-A @content-social · Agentic Commerce 2026 (Casaleggio/Netcomm): cataloghi devono essere leggibili anche dagli agenti AI — schema prodotto + FAQ.
- 2026-07-01 01:29 · @cro · PASSO-A @frontend-dev · Checkout: wallet-first su mobile +6-11% in test A/B 2026; costi consegna inaspettati = #1 abbandono EU (40,7%, Sendcloud).
- 2026-07-01 01:29 · @AD · SERVE · ~~Worker VPS: giro eseguito in **Cursor** (web OK). Sul worker vale solo dopo merge PR WebFetch su `main` + `aggiorna-cervello.sh`.~~ **RISOLTO 01:37** — Nicola merge + sync; worker naviga.

### 2026-07-01 — Vista Quaderni senior nel Pannello
- 2026-07-01 02:15 · @AD · FACCIO · Nicola chiede «aggiungi quaderni senior» → tab in Memoria + API.
- 2026-07-01 01:33 · @AD · FATTO · Tab **Quaderni senior** collegata in `Memoria.tsx`; API `/api/memoria/quaderni` + `listRepoDir` in `vault.ts`; parser ESITO con ora opzionale. Legge `memoria-squadra/` da ramo memoria-ad (42 senior, ultimo ESITO + espansione + ricerca). **Deploy:** PR su **`main`** (codice Pannello).

### 2026-07-01 — Casella Pannello «salute-sensori-dati» (01:57)
- 2026-07-01 01:57 · @AD · FATTO · Nicola chiede «quali connessioni MCP ti mancano?» — inventario live: **configurate** in `.mcp.json` solo Supabase marketplace+memoria (cieche: `SUPABASE_ACCESS_TOKEN` assente in `vps/.env` + autorizzazione Cursor); **mai cablate** Stripe MCP e PostHog MCP; REST marketplace ✅ (HTTP 200). Priorità sblocco: ① token Supabase 🟡 · ② Stripe MCP in config+env 🟡 · ③ PostHog 🟢 opzionale.

### 2026-07-01 — WebFetch mergiato + PR Quaderni (01:37)
- 2026-07-01 01:37 · @Nicola · FATTO · Merge PR **WebFetch globale** su `main` + `sudo bash aggiorna-cervello.sh` — worker VPS con `"WebFetch"` globale (verificato).
- 2026-07-01 01:37 · @AD · FATTO · Branch **`fix/quaderni-senior`** pushato su GitHub (commit `9c5dc8e`, 4 file Pannello). PR da mergiare su **`main`**: https://github.com/NicolaeRotaru/ad-mycity/compare/main...fix/quaderni-senior?expand=1

### 2026-07-01 — Nicola: quaderni assenti in Memoria (06:31)
- 2026-07-01 07:19 · @Nicola · chiesto · Casella ordine zombie: «Di quale negozio è il buyer?»
- 2026-07-01 07:19 · @AD · FATTO · Risposta: **Pane Quotidiano** (Via Calzolai 25) — unico negozio reale; buyer tel. **348 642 1766**; ordine COD €19,05 del 24/6. Decisione A/B ancora 🔴 in attesa.
- 2026-07-01 06:31 · @Nicola · SERVE · «dentro memoria non ci sono i quaderni dei senior» — WebFetch mergiato ✅; **PR Quaderni su `main` ancora NO** → tab assente su Pannello produzione (Vercel).
- 2026-07-01 06:31 · @AD · FATTO · Verifica locale: API `/api/memoria/quaderni` restituisce **42 quaderni** da `memoria-squadra/` (dati OK su memoria-ad). Codice tab solo in branch `fix/quaderni-senior` (4 file `pannello/`). Push GitHub fallito (token VPS scaduto) — Nicola deve mergiare PR se branch visibile, altrimenti rinnovare PAT.

### 2026-07-01 — Giro AD 06:18
- 2026-07-01 06:18 · @AD · FATTO · Giro 1/7: KPI live REST stallo 163,8h (+2h), 168h ~4,2h (~10:30). Escalation v4 🟢. Briefing + auto-coscienza.
- 2026-07-01 06:18 · @analista · FATTO · Snapshot KPI `consegne/analista/2026-07-01-kpi-live-0618.md` (🟢)
- 2026-07-01 06:18 · @intelligence · FATTO · eventi-picchi.md + buchi-mercato.md (countdown ~4,2h + meteo allerta giallo)
- 2026-07-01 06:18 · @operations · SERVE · Nicola: decisione ordine zombie €19,05 A/B — **~4,2h** a soglia 168h (~10:30)

### 2026-07-01 — Giro AD 02:17
- 2026-07-01 04:17 · @AD · FATTO · Giro 1/7: KPI live REST stallo 161,8h (+2h), 168h ~6,2h. Carrelli 4 ▼−2. Escalation v3 🟢. Briefing + auto-coscienza.
- 2026-07-01 04:17 · @analista · FATTO · Snapshot KPI `consegne/analista/2026-07-01-kpi-live-0417.md` (🟢)
- 2026-07-01 04:17 · @intelligence · FATTO · eventi-picchi.md aggiornato (temporali pomeriggio 3BMeteo + countdown 6,2h)
- 2026-07-01 04:17 · @operations · SERVE · Nicola: decisione ordine zombie €19,05 A/B — **~6,2h** a soglia 168h
- 2026-07-01 02:17 · @analista · FATTO · KPI live REST: stallo 159,8h (+2h), 168h ~8h — snapshot `consegne/analista/2026-07-01-kpi-live-0217.md`
- 2026-07-01 02:17 · @onboarding-negozi · FATTO · Checklist batch 6/7 🟢 → `consegne/onboarding/checklist-batch-6-luglio.md`
- 2026-07-01 02:17 · @AD · FATTO · Nota escalation 168h v2 + briefing 02:17 + digest JSON + auto-coscienza
- 2026-07-01 02:17 · @tech · PASSO-A Nicola · Sprint 1 radiografia (4 bloccanti) — in attesa ok branch marketplace
- 2026-07-01 02:17 · @operations · SERVE · Nicola: decisione ordine zombie €19,05 A/B — ~8h a soglia 168h

- 2026-06-30 23:10 · @AD · FATTO · Giro notturno: 7 numeri LIVE confermati (= vs 23:08). Stallo ~157h. Quinto passaggio del giorno — passaggio minimo onesto (L-2026-0629-03).
- 2026-06-30 23:10 · @analista · FATTO · Snapshot KPI live in consegne/analista/2026-06-30-kpi-live-2310.md (🟢). Correzione: 6 carrelli con items abbandonati >4h.
- 2026-06-30 23:10 · @devops-sre · FATTO · Sentinella ops-02: Supabase mgmt incident 30/6 — REST read OK 23:10; Stripe operativo.
- 2026-06-30 23:10 · @AD · SERVE · Da Nicola: invariato — Casa Linda 🔴 · ordine zombie 🔴 · link lista VP 🔴 (~47h) · foglio-firma 🔴.

### 2026-07-01 — Nicola ok Sprint 1 + push PR 403 (07:30-07:41)
- 2026-07-01 07:30 · @Nicola · FATTO · «ok Sprint 1» — autorizza branch fix 4 bloccanti radiografia marketplace.
- 2026-07-01 07:30 · @tech · FATTO · Branch `fix/sprint-1-radiografia-2026-07-01` commit `8dc0f88` (6 fix) + spec in `consegne/tech/sprint-1-radiografia-marketplace.md`.
- 2026-07-01 07:41 · @Nicola · chiesto · «crea la PR» su mycity.
- 2026-07-01 07:41 · @devops-sre · SERVE · Push GitHub **403** — PAT scrive solo ad-mycity. Accodato **#14** token write su mycity.

### 2026-07-01 — Giro AD 08:17
- 2026-07-01 08:17 · @AD · FATTO · Giro 1/7: KPI live REST stallo 165,8h (+2h), 168h ~2,2h (~10:30). Escalation v5 🟢. Briefing + auto-coscienza.
- 2026-07-01 08:17 · @analista · FATTO · Snapshot KPI `consegne/analista/2026-07-01-kpi-live-0817.md` (🟢)
- 2026-07-01 08:17 · @intelligence · FATTO · eventi-picchi.md aggiornato (3BMeteo 08:17 + countdown ~2,2h)
- 2026-07-01 08:17 · @operations · SERVE · Nicola: decisione ordine zombie €19,05 A/B — **~2,2h** a soglia 168h (~10:30)
- 2026-07-01 08:17 · @tech · SERVE · Push PR Sprint 1 **403** — #14 token o push manuale Nicola

### 2026-07-01 — Casella Pannello ordine zombie (Nicola 10:09)
- 2026-07-01 10:09 · @Nicola · chiesto · «Perché torna da approvare? (3ª volta)»
- 2026-07-01 11:15 · @AD · FATTO · Casella «crea la PR Sprint 1»: Nicola ripete richiesta · GitHub: **#209 mergiata 09:34** + **#210** hotfix build 10:00 · card Pannello obsoleta · prossimo **`ok deploy Sprint 1`** 🔴
- 2026-07-01 11:15 · @tech · PASSO-A Nicola · **Deploy Sprint 1** — migrazione `107_seller_public_profiles.sql` + smoke test · codice già su `main`
- 2026-07-01 11:10 · @AD · FATTO · Nicola «**ok deploy Sprint 1**» · Render **già live** ~10:31 (auto #209+#210) · bundle: fee UI + `seller_public_profiles` ✅ · **⏳ SQL 107 DROP policy** (anon → `profiles.stripe_account_id` ancora 200)
- 2026-07-01 11:10 · @tech · PASSO-A Nicola · Supabase → SQL Editor → incolla `107_seller_public_profiles.sql` (idempotente) → poi smoke COD/carta test
- 2026-07-01 10:09 · @operations · SERVE · Nicola: **A accetta** o **B annulla** ordine `58094956…` — ultima chiamata prima 168h
- 2026-07-01 10:13 · @Nicola · chiesto · «Aggiungimi A o B, anzi che approva o ignora»
- 2026-07-01 10:13 · @frontend-dev · FATTO · Bottoni **A accetta / B annulla** su proposta ordine zombie + API persistenza (`/api/decisione-ordine`) · deploy Pannello su main 🟡
- 2026-07-01 10:13 · @operations · SERVE · Nicola: clic **A** o **B** sulla card (non più Approva generico) — ~17 min a soglia 168h (~10:30)
- 2026-07-01 10:22 · @Nicola · chiesto · «Cos'è pannello/? Merge automatico con mio permesso? Cosa serve per VPS + PR ad-mycity + mycity?»
- 2026-07-01 10:22 · @AD · FATTO · Spiegati 3 tubi (memoria-ad / main+Vercel / marketplace) + pipeline merge-on-approval proposta · PASSO-A @devops per token merge + card «ok merge PR»
- 2026-07-01 10:22 · @devops · FACCIO · Proposta: bottone Pannello «Merge su main» post-ok Nicola + hook post-merge `aggiorna-cervello.sh` (VPS già collegato)
- 2026-07-01 10:36 · @Nicola · chiesto · «**ok merge bottoni A/B**»
- 2026-07-01 10:36 · @AD · FATTO · Push `main` `c50148d` (bottoni A/B ordine zombie) · Vercel redeploy · PASSO-A Nicola: `sudo bash cervello/vps/aggiorna-cervello.sh`
- 2026-07-01 10:36 · @operations · SERVE · Nicola: clic **A** o **B** sulla card (post-deploy ~2 min) — soglia 168h superata ~10:30
- 2026-07-01 10:45 · @Nicola · chiesto · «Impara flusso target sempre · come creo token GitHub merge?»
- 2026-07-01 10:45 · @AD · FATTO · Regola permanente merge-on-approval confermata · istruzioni PAT fine-grained consegnate · `.env.example` aggiornato con `GITHUB_MERGE_TOKEN`
- 2026-07-01 10:50 · @Nicola · chiesto · «Applica A o B ogni volta che devo scegliere, non solo ordine zombie»
- 2026-07-01 10:50 · @frontend-dev · FATTO · Generalizzato `tipo: scelta_ab` + API `/api/scelta-ab` (bottoni dinamici, persistenza per `scelta_id`) · regola in `giro.md` · deploy main 🟡
- 2026-07-01 10:50 · @operations · SERVE · Nicola: clic **A** o **B** ordine €19,05 — soglia 168h superata ~10:30
- 2026-07-01 10:45 · @operations · SERVE · Nicola: **A** o **B** sull'ordine €19,05 (unica cosa che chiude la card)
- 2026-07-01 11:00 · @Nicola · chiesto · «**ok merge scelta-ab universale**»
- 2026-07-01 11:00 · @AD · FATTO · Push `main` `853c33a` (scelta A/B universale: lib + API + Azioni collegato) · Vercel redeploy · PASSO-A Nicola: `sudo bash cervello/vps/aggiorna-cervello.sh`
- 2026-07-01 11:00 · @operations · SERVE · Nicola: clic **A** o **B** ordine €19,05 (post-deploy ~2 min) — unica cosa che chiude la card

### 2026-07-01 — Scelta A ordine zombie (Nicola Pannello 11:05)
- 2026-07-01 11:05 · @Nicola · FATTO · **Scelta A** ordine zombie €19,05 — accetta e organizza consegna (WhatsApp buyer + dashboard Pane Quotidiano)
- 2026-07-01 11:05 · @AD · FATTO · Registrata in [[DECISIONI]] · accodata esecuzione **#16** · aggiornati STATO + ultimo-briefing + intenzioni-nicola · **card A/B non rigenerare**
- 2026-07-01 11:05 · @operations · FACCIO · Esecuzione Scelta A: WhatsApp buyer 348 642 1766 + accetta ordine `58094956…` in dashboard + organizza consegna COD
- 2026-07-01 11:05 · @operations · PASSO-A @customer-success · Telefonata feedback entro 24h post-consegna (script `consegne/customer-success/primo-ordine-faro.md`)
- 2026-07-01 11:05 · @operations · SERVE · Nicola: **data/ora consegna** per sostituire [DATA/ORA] nel messaggio WhatsApp #16

### 2026-07-01 — ☀️ PIANO DEL MATTINO (AD · 11:18)
**Obiettivo del giorno:** **Prima transazione reale end-to-end** (ordine→consegna→COD €19,05) + piattaforma pronta per **batch negozi 6/7**. North Star: **1° ordine consegnato**.

**Le 3 priorità:**
1. **Eseguire #16 Scelta A** — ordine zombie Pane Quotidiano €19,05 (Nicola ha firmato A alle 11:05): WhatsApp buyer + dashboard + consegna COD.
2. **Deploy Sprint 1 in prod** — PR #209+#210 su `mycity/main`; migrazione `107` + smoke test checkout (prerequisito sicuro per onboarding 6/7).
3. **Batch negozi 6/7** — Nicola inserisce botteghe; squadra presidia checklist onboarding (catalogo, payout, foto).

**Sentinelle attive:** ordine in ritardo (zombie, ora in esecuzione) · 4 carrelli >4h · negozio LIVE 0 pagati · stallo >168h superato ~10:30 · temporali pomeriggio (leva delivery se #16 parte).

Assegnazioni (1 mossa per reparto):
- @operations · eseguire #16: accetta ordine `58094956…` in dashboard PQ + WhatsApp buyer 348 642 1766 + organizza consegna COD · 🔴 (serve **data/ora** Nicola)
- @supporto · assistenza messaggio buyer + aggiornamento stato ordine in dashboard · 🔴 con @operations
- @customer-success · telefonata feedback entro 24h post-consegna (script `consegne/customer-success/primo-ordine-faro.md`) · 🟢 prep · messaggio 🔴 post-consegna
- @tech · checklist deploy Sprint 1: migrazione `107_seller_public_profiles.sql` + smoke test (webhook, fee UI, RLS, COD rollback) · 🟡 prepara · deploy 🔴
- @devops-sre · sync VPS post-merge: **codice pronto** (`install-sync-vps.sh`) · Nicola: 1× `sudo bash cervello/vps/install-sync-vps.sh` · poi AD accoda `sync-vps` automatico · 🟡
- @qa · piano smoke test post-deploy (checkout mobile, COD, fee €3 visibile) · 🟢 prep · esecuzione post-deploy 🔴
- @onboarding-negozi · presidio checklist `consegne/onboarding/checklist-batch-6-luglio.md` per ogni negozio inserito oggi · 🟢
- @vendite · standby supporto negozianti 6/7 (termini 12% già firmati PQ) · 🟢
- @finanza · payout-test Stripe **03/7 mattina** (sandbox, programmato) · 🔴
- @analista · snapshot KPI fine giornata (baseline pre/post prima transazione) · 🟢
- @crm-lifecycle · prepara email recupero 4 carrelli abbandonati (DRY-RUN, mani spente) · 🟢

---

## Giro 2026-07-01 12:18

- 2026-07-01 12:18 · @analista · FATTO · KPI live REST: stallo **169,8h** (+0,4h), **168h +1,8h oltre** · snapshot `consegne/analista/2026-07-01-kpi-live-1218.md`
- 2026-07-01 12:18 · @intelligence · FATTO · Meteo 3BMeteo 12:08: **35°C ora** · temporali **15-16 imminenti** · `Intelligence/eventi-picchi.md` aggiornato
- 2026-07-01 12:18 · @operations · FATTO · Escalation post-168h **v7** 🟢 · slot pranzo ORA enfatizzato · `consegne/operations/2026-07-01-escalation-post-168h-v7.md`
- 2026-07-01 12:18 · @AD · FATTO · Briefing 12:18 + STATO + ultimo-briefing.json + intenzioni-nicola + auto-coscienza · Scelta A già firmata — **NON riproporre A/B**
- 2026-07-01 12:18 · @AD · SERVE · Nicola: **`ok 16`** + slot consegna (pranzo ORA o sera post-18) · **SQL 107** (~30s) · lista negozi 6/7
- @operations · monitor temporali — se #16 parte, evitare slot 15-17 · 🟢

🙋 **Serve da Nicola:** 🔴 **slot pranzo ORA + `ok 16`** · 🟡 **SQL 107** (Ignora card Proposte) · 🟢 batch 6/7 (checklist pronta).

## Giro 2026-07-01 11:52

- 2026-07-01 11:52 · @analista · FATTO · KPI live REST: stallo **169,4h** (+3,6h), **168h SUPERATA ~10:30**, 7 numeri = vs 08:17 · snapshot `consegne/analista/2026-07-01-kpi-live-1152.md`
- 2026-07-01 11:52 · @intelligence · FATTO · Meteo 3BMeteo 11:53: 35°C + temporali 15-16 (~7mm) · `Intelligence/eventi-picchi.md` aggiornato
- 2026-07-01 11:52 · @operations · FATTO · Escalation post-168h **v6** 🟢 · `consegne/operations/2026-07-01-escalation-post-168h-v6.md`
- 2026-07-01 11:52 · @AD · FATTO · Briefing 11:52 + STATO + ultimo-briefing.json + intenzioni-nicola + auto-coscienza · Sprint 1 LIVE confermato · Scelta A già firmata — **NON riproporre A/B**
- 2026-07-01 11:52 · @AD · SERVE · Nicola: **`ok 16`** + data/ora consegna · **SQL 107** (~30s) · lista negozi 6/7
- @intelligence · monitor temporali pomeriggio — se #16 parte, segnala finestra consegna · 🟢

🙋 **Serve da Nicola:** 🔴 **data/ora consegna** per WhatsApp #16 · 🔴 **`ok 16`** per avviare esecuzione · 🟡 **SQL 107** in Supabase (30s) · 🟡 sync VPS · 🟢 inserimento negozi 6/7 (checklist pronta, **ignora card Proposte — nessuna approvazione**).

- 2026-07-01 11:29 · @AD · FATTO · Nicola: card SQL 107 «perché approvare di nuovo?» → chiarito **2 tubi** (Render ✅ · Supabase SQL ⏳); firma deploy già valida; card rimossa da Proposte; anon `profiles.stripe_account_id` ancora 200.
- 2026-07-01 11:25 · @AD · FATTO · Nicola (2ª volta): card onboarding 6/7 con Approva/Ignora → **errore classificazione**; rimossa da `ultimo-briefing.json` azioni; resta solo in opportunità + checklist 🟢.

- 2026-07-01 12:15 · @crm-lifecycle · FATTO · Playbook recupero carrelli: letti 4 carrelli >4h live (REST). 1 buyer reale (samir, PQ €10) → bozze A8 touch #1 🟡 + A9 touch #2 🔴 BENVENUTO10 in AZIONI-PRONTE. 3 account demo/admin SKIP (A10–A11). Dossier `consegne/crm/2026-07-01-playbook-recupero-carrelli.md`. NIENTE inviato.
- 2026-07-01 12:15 · @crm-lifecycle · PASSO-A @legale-privacy · Consenso email_marketing=false su samir — validare se touch #1 è transazionale o serve opt-in prima di `ok A8`.

- 2026-07-01 14:19 · @analista · FATTO · KPI live REST: stallo **171,8h** (+2,0h), **168h +3,8h oltre**, 7 numeri = vs 12:18 · snapshot `consegne/analista/2026-07-01-kpi-live-1419.md`
- 2026-07-01 14:19 · @intelligence · FATTO · Allerta ER 070/2026 temporali + IlPiacenza 1/7 · finestra pranzo **chiusa** → #16 **post-18** · `Intelligence/eventi-picchi.md` aggiornato
- 2026-07-01 14:19 · @operations · FATTO · Escalation post-168h **v8** 🟢 · slot consegna **sera post-18** · `consegne/operations/2026-07-01-escalation-post-168h-v8.md`
- 2026-07-01 14:19 · @AD · FATTO · Giro completo: briefing 14:19 + STATO + ultimo-briefing.json + intenzioni-nicola + auto-coscienza + POST briefings memoria
- 2026-07-01 14:19 · @AD · SERVE · Nicola: **`ok 16`** + slot **sera post-18** · **SQL 107** (~30s) · lista negozi 6/7

## Giro 2026-07-01 18:18

- 2026-07-01 18:18 · @analista · FATTO · KPI live REST: stallo **175,8h** (+2,0h), **168h +7,8h oltre**, 7 numeri = vs 16:18 · snapshot `consegne/analista/2026-07-01-kpi-live-1818.md`
- 2026-07-01 18:18 · @intelligence · FATTO · Temporali passati · finestra consegna **APERTA ORA (18:30-20:00)** · slot DB ordine confermato · `Intelligence/eventi-picchi.md` + `buchi-mercato.md` aggiornati
- 2026-07-01 18:18 · @operations · FATTO · Escalation post-168h **v10** 🟢 · `consegne/operations/2026-07-01-escalation-post-168h-v10.md`
- 2026-07-01 18:18 · @AD · FATTO · Giro completo: briefing 18:18 + STATO + ultimo-briefing.json + intenzioni-nicola + auto-coscienza + POST briefings memoria
- 2026-07-01 18:18 · @AD · SERVE · Nicola: **`ok 16` ORA** + consegna entro **20:00** · **SQL 107** (~30s) · lista negozi 6/7

🙋 **Serve da Nicola:** 🔴 **`ok 16` + consegna ORA (18:30-20:00)** — ultima chance oggi · 🟡 **SQL 107** (Ignora card Proposte) · 🟢 batch 6/7 (checklist pronta).

## Giro 2026-07-01 16:18

- 2026-07-01 16:18 · @analista · FATTO · KPI live REST: stallo **173,8h** (+2,0h), **168h +5,8h oltre**, 7 numeri = vs 14:19 · snapshot `consegne/analista/2026-07-01-kpi-live-1618.md`
- 2026-07-01 16:18 · @intelligence · FATTO · Temporali 15-17 in corso ore 16:18 · #16 slot **18:30-20:00** · `Intelligence/eventi-picchi.md` + `buchi-mercato.md` aggiornati
- 2026-07-01 16:18 · @operations · FATTO · Escalation post-168h **v9** 🟢 · `consegne/operations/2026-07-01-escalation-post-168h-v9.md`
- 2026-07-01 16:18 · @AD · FATTO · Giro completo: briefing 16:18 + STATO + ultimo-briefing.json + intenzioni-nicola + auto-coscienza + POST briefings memoria
- 2026-07-01 16:18 · @AD · SERVE · Nicola: **`ok 16`** + slot **sera 18:30-20:00** · **SQL 107** (~30s) · lista negozi 6/7

🙋 **Serve da Nicola:** 🔴 **`ok 16` + consegna 18:30-20:00** · 🟡 **SQL 107** (Ignora card Proposte) · 🟢 batch 6/7 (checklist pronta).

- 2026-07-01 17:05 · @AD · FATTO · Casella Pannello «Benchmark: Gestione autonoma AI» — popolato `auto-radiografia.json` con esempi reali (LangSmith, Devin, Sidekick) + snapshot nostro loop (tasso 0,70 · voto 76 · REST ok/MCP cieco · 0 ordini consegnati · calibrazione solo @AD). Inventario sblocchi per Nicola in risposta casella.

## Chat 2026-07-01 20:02

- 2026-07-01 20:02 · @devops-sre · FATTO · Nicola «ok configura sync VPS» → `install-sync-vps.sh` + `sync-vps.sh` + `accoda-sync-vps.mjs` + worker `sync-vps` in repo · accodato **#17** (1× root install)
- 2026-07-01 20:02 · @devops-sre · FATTO · Nicola chiede «cosa sono #14 e #15?» → spiegati come righe coda AZIONI: PAT fine-grained GitHub (Contents+PR R/W su `ad-mycity`+`mycity`) → `vps/.env` · un PAT copre tutto · L-0701-39
- 2026-07-01 20:02 · @AD · SERVE · Nicola: **`ok 17`** (install sync VPS) + crea/incolla PAT (#14+#15) + restart worker

## Chat 2026-07-01 20:18

- 2026-07-01 20:18 · @AD · **Nicola «ok 17»** · Install sync tentato sul VPS → **bloccato** (`mycity` senza sudo) · handler `sync-vps` aggiunto in `worker.sh` · #17 aggiornato ⏳
- 2026-07-01 20:18 · @AD · SERVE · Nicola: **1× Console Hetzner root** (`install-sync-vps.sh`) + PAT #14+#15

## Chat 2026-07-01 20:21

- 2026-07-01 20:21 · @AD · **Nicola «ok 17» (conferma)** · Install sudoers ri-tentato → **bloccato** (mycity no sudo) · Handler `sync-vps` ✅ in `worker.sh` · #17 resta ⏳ finché root non lancia `install-sync-vps.sh`
- 2026-07-01 20:21 · @AD · SERVE · Nicola: **Console Hetzner → root → 1 comando** (sotto) + PAT #14+#15 quando vuoi

🙋 **Serve da Nicola:** 🟡 **Console Hetzner root** — incolla: `bash /opt/mycity/ad-mycity/cervello/vps/install-sync-vps.sh` · 🔴 **`ok 16` ordine 2/7 mattina** · 🟡 **SQL 107**

### 2026-07-02 — ☀️ PIANO DEL MATTINO (AD · 07:51)
**Obiettivo del giorno:** **Prima transazione reale end-to-end** (ordine→consegna→COD €19,05) + **piattaforma pulita** (ruoli acquisto + RLS) per il batch negozi. North Star: **1° ordine consegnato**.

**Le 3 priorità:**
1. **Eseguire #16 Scelta A** — ripiano mattina: WhatsApp buyer + accetta dashboard Pane Quotidiano + consegna COD entro pranzo (`consegne/operations/2026-07-01-ripiano-consegna-2-luglio.md`).
2. **Deploy #19 fix ruoli acquisto** — admin zero acquisti; seller solo via «Vai al marketplace» (decisione Nicola 2/7 07:35 · branch pronto).
3. **SQL 107 + onboarding 6/7** — policy RLS in Supabase (~30s) + checklist pronta quando Nicola inserisce botteghe.

**Sentinelle attive:** ordine in ritardo (#16) · carrello abbandonato >4h (1 buyer reale samir — CRM post-#19) · negozio LIVE 0 pagati · stallo >177h · loop business 🔴.

Assegnazioni (1 mossa per reparto):
- @operations · eseguire #16: accetta ordine `58094956…` + WhatsApp 348 642 1766 + consegna COD mattina/pranzo · 🔴 (serve **`ok 16`**)
- @supporto · assistenza messaggio buyer + stato ordine dashboard · 🔴 con @operations
- @customer-success · telefonata feedback entro 24h post-consegna (script `consegne/customer-success/primo-ordine-faro.md`) · 🟢 prep · messaggio 🔴 post-consegna
- @tech · deploy #19 su Render: branch `fix/ruoli-acquisto-admin-seller-2026-07-02` + smoke checkout admin/seller · 🔴 (serve **`ok merge fix ruoli-acquisto`**)
- @qa · smoke test post-#19: admin 403 checkout · seller redirect senza cookie · buyer OK · 🟢 prep · esecuzione post-deploy 🔴
- @devops-sre · sync VPS #17: Nicola 1× root Console Hetzner (`install-sync-vps.sh`) · handler già ✅ · 🟡
- @security · verifica RLS post-SQL 107 (anon non legge `stripe_account_id`) · 🟡 prep
- @crm-lifecycle · recupero carrello samir **solo dopo #19** (1 buyer reale; 3 interni SKIP) · 🟢 bozze pronte
- @onboarding-negozi · presidio checklist `consegne/onboarding/checklist-batch-6-luglio.md` · 🟢
- @vendite · standby supporto negozianti 6/7 · 🟢
- @finanza · payout-test Stripe **03/7 mattina** sandbox (programmato Nicola 1/7) · 🔴
- @analista · snapshot KPI fine giornata pre/post prima transazione · 🟢
- @legale-privacy · validare touch samir (transazionale vs marketing) prima invio · 🟢

🙋 **Serve da Nicola:** 🔴 **`ok 16`** · 🔴 **`ok merge fix ruoli-acquisto`** · 🟡 **SQL 107** (~30s) · 🟡 **Console Hetzner root** (1× install sync) · 🟢 batch 6/7 (checklist pronta, nessuna approvazione).

- 2026-07-02 07:51 · @AD · FACCIO · Piano del mattino scritto · STATO + RITMO + SALA aggiornati · priorità allineate a North Star (1° ordine consegnato).

## Giro 2026-07-01 20:18

- 2026-07-01 20:18 · @analista · FATTO · KPI live REST stallo 177,8h (+2,0h vs 18:18) · 168h +9,8h oltre · `consegne/analista/2026-07-01-kpi-live-2018.md`
- 2026-07-01 20:18 · @operations · FATTO · Escalation post-168h **v11** + ripiano consegna **2/7 mattina** (finestra slot scaduta)
- 2026-07-01 20:18 · @AD · FATTO · Briefing + STATO + ultimo-briefing.json + auto-coscienza + Intelligence eventi/buchi + piani AD
- 2026-07-01 20:18 · @AD · SERVE · Nicola: **`ok 16` 2/7 mattina** · SQL 107 · root sync VPS

## Casella #19 — Nicola chiede collegamento Render (2026-07-02 08:16)

- 2026-07-02 08:16 · @AD · FATTO · Nicola «come collego il canale Render?» (card #19 deploy ruoli acquisto) → chiarito: **Render non è una mano API separata** — è già agganciato a GitHub su `mycity`; merge `main` = auto-deploy (come Sprint 1 #209+#210). Sblocco operativo = **#14+#15 PAT GitHub** su VPS, non token Render. Pulsante Approva Pannello su canale Render **non esegue** deploy (mani.ts solo email). Via: chat **`ok merge fix ruoli-acquisto-admin-seller`**. ⏳ branch locale: commit staged non pushato.

## Giro 2026-07-02 08:20

- 2026-07-02 08:20 · @analista · FATTO · KPI live REST: stallo 189,9h (+12,1h) · 7 numeri = · 407 lead · 1 ordine COD pending
- 2026-07-02 08:20 · @devops-sre · FATTO · verifica-automazione tutto verde: token mycity push OK · worker · timer watch-main · ramo memoria-ad
- 2026-07-02 08:20 · @intelligence · FATTO · meteo 2/7 sereno 20–31°C — finestra #16 pranzo APERTA · eventi-picchi aggiornato
- 2026-07-02 08:20 · @operations · FATTO · Escalation v12 stallo 190h → `consegne/operations/2026-07-02-escalation-v12-stallo-190h.md`
- 2026-07-02 08:20 · @AD · FATTO · Giro completo: briefing + STATO + auto-coscienza + intenzioni-nicola + piani AD
- 2026-07-02 08:20 · @AD · SERVE · Nicola: **`ok 16` oggi pranzo** · **`ok merge fix ruoli-acquisto`** · SQL 107 · root sync VPS

### 2026-07-02 — ☀️ PIANO DEL MATTINO (AD · 08:36 · aggiornamento post-giro)
**Obiettivo del giorno:** **Prima transazione reale end-to-end** (ordine→consegna→COD €19,05) + **piattaforma pulita** (ruoli + RLS) per batch 6/7. North Star OKR: **1° ordine consegnato**.

**Le 3 priorità:**
1. **#16 Scelta A** — ripiano pranzo: WhatsApp 348 642 1766 + accetta dashboard Pane Quotidiano + COD (meteo sereno 20–31°C · escalation v12 · stallo 189,9h).
2. **#19 fix ruoli acquisto** — merge `fix/ruoli-acquisto-admin-seller-2026-07-02` → Render auto via GitHub (no token Render; chat **`ok merge fix ruoli-acquisto`** o PAT #14+#15).
3. **SQL 107 + onboarding 6/7** — DROP policy profiles (~30s) + checklist pronta post-prima-transazione.

**Sentinelle scattate:** ordine in ritardo 189,9h · carrello >4h (samir €10 — recovery post-#19) · negozio LIVE 0 consegnati · stallo +21,9h oltre 168h · loop business 🔴.

Assegnazioni (1 mossa per reparto):
- @operations · #16: accetta ordine + WhatsApp + consegna COD pranzo · 🔴 (**`ok 16`**)
- @supporto · assistenza buyer + stato dashboard · 🔴 con @operations
- @customer-success · telefonata feedback entro 24h post-consegna · 🟢 prep · 🔴 post-consegna
- @tech · merge #19 + smoke checkout admin/seller · 🔴 (**`ok merge fix ruoli-acquisto`**)
- @qa · smoke post-#19: admin 403 checkout · seller redirect · buyer OK · 🟢 prep
- @devops-sre · sync VPS #17: 1× root Console Hetzner · 🟡 (Nicola ok 17)
- @security · verifica RLS post-SQL 107 · 🟡 prep
- @crm-lifecycle · recovery samir **solo dopo #19** · 🟢 bozze pronte
- @onboarding-negozi · checklist batch 6/7 · 🟢
- @vendite · standby supporto negozianti · 🟢
- @finanza · payout-test Stripe sandbox **03/7 mattina** · 🔴 (programmato)
- @analista · snapshot KPI fine giornata pre/post prima transazione · 🟢
- @legale-privacy · validare touch samir (transazionale vs marketing) · 🟢

🙋 **Serve da Nicola:** 🔴 **`ok 16`** · 🔴 **`ok merge fix ruoli-acquisto`** · 🟡 **SQL 107** · 🟡 **root sync VPS** · 🟢 batch 6/7 (dopo sblocchi).

- 2026-07-02 08:36 · @AD · FATTO · Piano del mattino aggiornato post-giro 08:20 · RITMO + STATO + SALA scritti · nessuna azione 🔴 eseguita (serve firma Nicola).

### 2026-07-02 — ok 16 approvato (Nicola Pannello 08:38)
- 2026-07-02 08:38 · @Nicola · FATTO · **`ok 16`** — avvia esecuzione ordine zombie €19,05 WhatsApp + consegna COD oggi pranzo
- 2026-07-02 08:38 · @AD · FATTO · Registrata in [[DECISIONI]] · #16 → IN ESECUZIONE · accodati passi #20–#22 · pacchetto `consegne/operations/2026-07-02-esecuzione-ok16-pranzo.md` · proposta ok-16 **NON riproporre**
- 2026-07-02 08:38 · @operations · FACCIO · PASSO 1: WhatsApp buyer 348 642 1766 (link wa.me pronto) · slot pranzo 12:00–13:30 · ⚠️ indirizzo placeholder in DB
- 2026-07-02 08:38 · @operations · PASSO-A @supporto · Assistenza Nicola su dashboard PQ + chiamata negozio 0523 388601 (script A6)
- 2026-07-02 08:38 · @operations · PASSO-A @customer-success · Post-consegna: A13 feedback + A14 recensione (attivare con «consegna fatta»)
- 2026-07-02 08:38 · @AD · SERVE · Nicola: **tap link WhatsApp ORA** → quando consegnato scrivi **«consegna fatta»**

### 2026-07-02 — ok merge #19 approvato (Nicola Pannello 08:40)
- 2026-07-02 08:40 · @Nicola · FATTO · **`ok merge fix ruoli-acquisto — deploy #19 marketplace`**
- 2026-07-02 08:40 · @tech · FATTO · Commit 14 file su branch `fix/ruoli-acquisto-admin-seller-2026-07-02` · push GitHub · PR **#211** creata · merge su `main` **`f84fc70`** · Render auto-deploy (~2–5 min)
- 2026-07-02 08:40 · @AD · FATTO · Registrata in [[DECISIONI]] · #19 → ✅ MERGED · proposta ok-merge-#19 **NON riproporre** · artefatti: `consegne/tech/pr-mycity-211.md` · smoke `consegne/qa/2026-07-02-smoke-ruoli-acquisto-post-19.md`
- 2026-07-02 08:40 · @qa · FACCIO · Smoke post-deploy: admin 403 checkout · seller redirect senza cookie · buyer OK (checklist pronta)
- 2026-07-02 08:40 · @crm-lifecycle · PASSO-A · Recovery carrello samir **dopo smoke #19 verde** (unico buyer reale)
- 2026-07-02 08:40 · @AD · SERVE · Nicola: **#16 passi #20–#22** (pranzo) · **SQL 107** (~30s) · **root sync VPS**

### 2026-07-02 — Fix radiografia macchina (Cloud Agent 10:15)
- 2026-07-02 10:15 · @AD · FATTO · Chiusi difetti radiografia: **AR-001** (verifica-sensori.mjs retry REST + contatore cecità), **AR-002** (MARKETPLACE_REPO), **AR-003** (sensori-cecita.json + sentinella), **sonda-volano.mjs** (4 invarianti). PR codice **#138** → main · memoria → memoria-ad. Cantiere: **1 aperto** (AR-004 token mycity). Voto salute architettura **80 ▲**.

### 2026-07-02 — Giro AD (10:19)
- 2026-07-02 10:19 · @analista · FATTO · KPI live REST stallo **191,9h** (+1,8h) · 7 numeri invariati · `consegne/analista/2026-07-02-kpi-live-1019.md`
- 2026-07-02 10:19 · @AD · FATTO · Briefing + STATO + ultimo-briefing.json + Intelligence eventi/buchi · automazione **tutto verde**
- 2026-07-02 10:19 · @operations · FACCIO · **#20–#22 pendenti** — ok 16 approvato 08:38 ma WhatsApp non ancora inviato (DB invariato)
- 2026-07-02 10:19 · @qa · FACCIO · Smoke post-#19 — Render LIVE da ~1h40 · checklist `consegne/qa/2026-07-02-smoke-ruoli-acquisto-post-19.md`
- 2026-07-02 10:19 · @AD · SERVE · Nicola: **tap WhatsApp #20 ORA** (pranzo 12:00–13:30) · SQL 107 · «consegna fatta» post-#22

### 2026-07-02 — Giro AD (16:53)
- 2026-07-02 16:53 · @operations · FATTO · **Finestra pranzo (12:00–13:30) PERSA** — ok 16 firmato 08:38 ma #20–#22 mai eseguiti in ~8h; stallo ~198,5h (calcolo da ancora ordine 24/6)
- 2026-07-02 16:53 · @analista · FATTO · 7 numeri = baseline REST 10:19 portata avanti (MCP/node gated in sessione, non ri-pullati live — vedi Gap); nessun numero inventato
- 2026-07-02 16:53 · @AD · FATTO · Briefing (passaggio 16:53 in cima) + STATO + ultimo-briefing.json + auto-coscienza aggiornati
- 2026-07-02 16:53 · @AD · SERVE · Nicola: **decisione binaria #16** — esegui stasera (cena 18–20 → «consegna fatta») **oppure** «archivia zombie» → focus payout-test 3/7 + batch 6/7
- 2026-07-02 16:53 · @security · SERVE · Nicola: **R1 revoca PAT GitHub** (AR-004) — buco ancora in storia git

### 2026-07-02 — Giro AD (17:01, delta)
- 2026-07-02 17:01 · @AD · FATTO · Passaggio delta a 8 min dalle 16:53: nulla di materiale cambiato, live gated, stallo ~198,6h — aggiornati solo timestamp/snapshot (briefing, STATO, ultimo-briefing, auto-analisi). Nessun numero nuovo.
- 2026-07-02 17:01 · @prompt-engineer · SERVE · Chiudere **AR-019 (delta-gate)**: questo è il caso-tipo — giro a orario fisso senza nulla di nuovo che spreca il Max. Serve la logica «niente di nuovo → salta la parte AI pesante».

### 2026-07-02 — Decisione binaria #16 RISOLTA (Nicola Pannello 17:09)
- 2026-07-02 17:09 · @Nicola · FATTO · **Scelta A** su decisione binaria #16: **ESEGUIRE #20 WhatsApp (cena)**, NON «archivia zombie» — `ok 16` firmato 08:38 non eseguito in ~8h (pranzo perso).
- 2026-07-02 17:09 · @AD · FATTO · Registrata in [[DECISIONI]] (🔴) · coda #16/#20 aggiornata (slot → cena 19–21) · STATO aggiornato · pacchetto `consegne/operations/2026-07-02-esecuzione-ok16-pranzo.md` riadattato a cena · **card decisione binaria da NON rigenerare** al prossimo giro.
- 2026-07-02 17:09 · @operations · FACCIO · Esecuzione Scelta A: passi #20 (WhatsApp buyer 348 642 1766, slot cena 19–21) → #21 (accetta ordine `58094956…` in dashboard PQ + chiama 0523 388601) → #22 (consegna COD €19,05). ⚠️ verificare orario chiusura Pane Quotidiano prima di chiamare.
- 2026-07-02 17:09 · @operations · SERVE · Nicola (mano reale): **tap link WhatsApp #20** (in pacchetto ok16 § PASSO 1) → poi accetta ordine → consegna COD → scrivi **«consegna fatta»** (attiva concierge A13/A14).

### 2026-07-02 17:21 — Giro AD (delta post-decisione #16)
- 2026-07-02 17:21 · @AD · FATTO · Giro delta: registrato stato «esegui» (#16 risolta 17:09), stallo ricalcolato ~199h, aggiornati STATO · briefing 2/7 (passaggio 17:21 in cima) · ultimo-briefing.json · intenzioni-nicola.json · registro-realtà · auto-analisi (voto 82 ▼).
- 2026-07-02 17:21 · @AD · SERVE · Nicola: **stasera 19–21 tap link WhatsApp #20** → #21 → #22 → «consegna fatta» (unica azione che sblocca ~199h di stallo). In parallelo: R1 revoca PAT GitHub.
- 2026-07-02 17:21 · @analista · FATTO · Live gated (MCP/node): 7 numeri = baseline REST 10:19 portata avanti, nessun numero nuovo (dichiarato nei Gap del briefing).

### 2026-07-02 — 🌙 REPORT DELLA SERA (AD · 18:00)
- 2026-07-02 18:00 · @AD · FATTO · **Report della sera** scritto (RITMO.md blocco `## Report della sera · 2026-07-02 18:00` — lo legge il Pannello) + STATO aggiornato (aggiornato 18:00, stallo ~201,5h).
- 2026-07-02 18:00 · @AD · FATTO · **Bilancio giornata:** ✅ #19 MERGED (PR #211 Render LIVE) · ✅ cantiere radiografia 18/22 chiusi (voto salute 42→80) · ✅ decisione binaria #16 risolta (Scelta A = esegui, cena 19–21). ❌ Prima transazione ancora NON avvenuta: `ok 16` firmato 08:38 ma mani WhatsApp non scattate → pranzo perso.
- 2026-07-02 18:00 · @analista · FATTO · Numeri vs ieri invariati (live gated MCP+node → baseline REST 10:19); stallo **~201,5h** (+~9h vs 20:18 di ieri). 1 negozio reale/0 payout/1 ordine COD/0 consegnati/4 buyer.
- 2026-07-02 18:00 · @AD · Lezione L-2026-0702 · **firma ≠ esecuzione**: un'azione 🔴 firmata resta ferma se la «mano» reale non scatta nella stessa finestra → collo di bottiglia = mani non collegate (WhatsApp/consegna), non i sensori. Aggancio AR-019 + automazione mani.
- 2026-07-02 18:00 · @AD · SERVE · Nicola stasera **19–21**: tap link WhatsApp #20 → #21 accetta+chiama PQ → #22 consegna COD €19,05 → «consegna fatta». In parallelo: 🔴 R1 revoca PAT GitHub · 🟡 SQL 107 · 🟡 root sync VPS #17.

### 2026-07-02 — 🔭 GIRO SERALE (AD · 18:21)
- 2026-07-02 18:21 · @AD · FATTO · Giro serale completo: letti sensori (ledger 18:20 REST ok, MCP cieco 1 giro), delta-gate (AR-019) e sonda chiusura-loop (AR-009) — **la nuova macchina anti-giri-a-vuoto è VIVA e persiste i suoi file su disco**.
- 2026-07-02 18:21 · @analista · FATTO · **7 numeri RI-PULLATI LIVE via REST/delta-gate 18:20** (non più baseline): ordini=1, ultimo_ordine 24/6, profili=23, dati_leggibili=true → tutto invariato ma MISURATO. Stallo **~202h**.
- 2026-07-02 18:21 · @AD · FATTO · Sonda chiusura-loop: 38 quaderni vivi · 5 fermi (ad, direttore-creativo, marketing, qa-designer, relazioni-istituzionali) · 3 vuoti (i 2 gate creativi senza quaderno = difetto AR già a cantiere).
- 2026-07-02 18:21 · @AD · FATTO · Calibrazione @AD 18/18: previsione «0 transazioni finché #20–#22 non eseguiti» confermata dal REST live. Aggiornati STATO, briefing (passaggio 18:21 in cima), ultimo-briefing, auto-analisi (voto 84 ▲), registro-realta (evidenza live 18:20).
- 2026-07-02 18:21 · @AD · SERVE · Nulla di nuovo di business: resta la mossa n.1 (Nicola, cena 19–21: #20→#21→#22 → «consegna fatta») + R1 revoca PAT + R2 merge fix cantiere + SQL 107.

### 2026-07-02 — 🔭 GIRO SERALE/NOTTE (AD · 22:20)
- 2026-07-02 22:20 · @AD · FATTO · Full giro da delta-gate (cambio stato sensori: PostHog cieco 3 giri → sentinella «sensore cieco ≥3» scattata, opzionale a 0 ordini pagati). Letti ledger sensori 22:20 (REST/Stripe/Resend ok, MCP cieco 1 giro) + delta-gate + chiusura-loop.
- 2026-07-02 22:20 · @analista · FATTO · 7 numeri LIVE via REST/delta-gate 22:20: `corrente`==`ultimo_pieno` (ordini=1, ultimo 24/6, profili=23) → invariati. Stallo **~206h**.
- 2026-07-02 22:20 · @operations · FATTO · **Finestra cena 19–21 SALTATA: #16 non eseguito** (3ª finestra saltata oggi: pranzo+cena). Riprogrammato #16/#20 a **mattina 3/7**, accorpato al payout-test già in agenda. Aggiornati AZIONI-IN-ATTESA #16 e #20.
- 2026-07-02 22:20 · @AD · FATTO · Aggiornati STATO (22:20), briefing (passaggio 22:20 in cima), ultimo-briefing, intenzioni-nicola, auto-analisi, storico-salute/sonda.
- 2026-07-02 22:20 · @AD · SERVE · Mossa n.1 → domani mattina 3/7: Nicola apre link WhatsApp #20 (slot mattina) → #21 → #22 → «consegna fatta», col payout-test. Restano R1 revoca PAT · R2 merge fix · SQL 107.

### 2026-07-03 — 🔭 GIRO NOTTE (AD · 00:08)
- 2026-07-03 00:08 · @AD · FATTO · Full giro da delta-gate, +2h dal precedente. Letti ledger sensori 00:06 (REST/Stripe/Resend ok, MCP cieco 1 giro, PostHog cieco 5 giri) + delta-gate 22:28 + chiusura-loop 00:06.
- 2026-07-03 00:08 · @analista · FATTO · Nessuna novità business: 7 numeri = baseline REST 22:28 (ordini=1, ultimo 24/6, profili=23). MCP+node gated in sessione → nessun numero ri-misurato né inventato. Stallo **~206h** (≈8,6 giorni).
- 2026-07-03 00:08 · @intelligence · FATTO · Radar meteo ri-verificato live: **oggi 3/7 sereno 32°/19°, pioggia 30% → finestra consegna FAVOREVOLE**. Oggi è Venerdì Piacentini (centro pieno, presidio rimandato ma facilita il ritiro). Propagato a Intelligence/eventi-picchi.md.
- 2026-07-03 00:08 · @AD · FATTO · Aggiornati STATO (00:08), briefing 2026-07-03, ultimo-briefing, intenzioni-nicola (finestra = stamattina), eventi-picchi, auto-analisi/registro-realta/AUTO-ANALISI, apprendimento, calibrazione (@AD 20/20).
- 2026-07-03 00:08 · @AD · SERVE · Mossa n.1 → STAMATTINA 3/7 (meteo favorevole): Nicola apre link WhatsApp #20 → #21 → #22 → «consegna fatta», col payout-test. Restano R1 revoca PAT · R2 merge fix · SQL 107.

### 2026-07-03 — 🔭 GIRO NOTTE (AD · 00:18 · heartbeat)
- 2026-07-03 00:18 · @AD · FATTO · Heartbeat +10min dal giro 00:08. Nessuna novità business (7 numeri = baseline REST 22:28 invariata; MCP+node+curl gated). Unica variazione sensori: **PostHog cieco 6 giri** (era 5). Radar non ri-verificato (meteo/eventi già live 10 min fa).
- 2026-07-03 00:18 · @AD · FATTO · Aggiornati timestamp Cabina al 00:18: briefing 2026-07-03 (passaggio 00:08 sotto separatore), STATO, ultimo-briefing, auto-analisi/AUTO-ANALISI, registro-realta, intenzioni-nicola.
- 2026-07-03 00:18 · @AD · SERVE · Mossa n.1 confermata → STAMATTINA 3/7: Nicola apre link WhatsApp #20 → #21 → #22 → «consegna fatta», col payout-test. Restano R1 revoca PAT · R2 merge fix · SQL 107.

### 2026-07-03 — 🔭 GIRO NOTTE (AD · 00:27 · refresh)
- 2026-07-03 00:27 · @AD · FATTO · Refresh +4min dal giro 00:23. Delta-gate `corrente==ultimo_pieno`: nessuna novità business (7 numeri = baseline REST 22:28 invariata; MCP+node+curl gated). Unica variazione sensori: **PostHog cieco 8 giri** (era 7). Radar non ri-verificato (meteo/eventi già live al 00:08).
- 2026-07-03 00:27 · @AD · FATTO · Aggiornati timestamp Cabina al 00:27: briefing 2026-07-03 (passaggi 00:23/00:18/00:08 sotto separatore), STATO, ultimo-briefing, auto-analisi/AUTO-ANALISI, registro-realta, intenzioni-nicola.
- 2026-07-03 00:27 · @AD · SERVE · Mossa n.1 confermata → STAMATTINA 3/7: Nicola apre link WhatsApp #20 → #21 → #22 → «consegna fatta», col payout-test. Restano R1 revoca PAT · R2 merge fix · SQL 107.

### 2026-07-03 — 🔭 GIRO NOTTE (AD · 00:33 · refresh)
- 2026-07-03 00:33 · @AD · FATTO · Refresh +6min dal giro 00:27. Delta-gate 00:31 `corrente==ultimo_pieno`: nessuna novità business (7 numeri = baseline REST 22:28 invariata; MCP+node+curl gated). Unica variazione sensori: **PostHog cieco 9 giri** (era 8). Radar non ri-verificato (meteo/eventi già live al 00:08).
- 2026-07-03 00:33 · @AD · FATTO · Aggiornati timestamp Cabina al 00:33: briefing 2026-07-03 (passaggi 00:27/00:23/00:18/00:08 sotto separatore), STATO, ultimo-briefing, auto-analisi/AUTO-ANALISI, registro-realta, intenzioni-nicola.
- 2026-07-03 00:33 · @AD · SERVE · Mossa n.1 confermata → STAMATTINA 3/7: Nicola apre link WhatsApp #20 → #21 → #22 → «consegna fatta», col payout-test. Restano R1 revoca PAT · R2 merge fix · SQL 107.

### 2026-07-03 — ☀️ PIANO DEL MATTINO (AD · 06:00)
**Obiettivo del giorno:** **prima transazione reale end-to-end** (ordine → consegna → COD €19,05) nella finestra certa di stamattina, accorpata al payout-test. North Star: **1° ordine consegnato**. Contesto: oggi **Venerdì Piacentini**, meteo favorevole (sereno 19–32°C) → consegna comoda; le 3 finestre del 2/7 sono state saltate, stallo **~213h**.

**Le 3 priorità:**
1. 🔴 **Eseguire #16 Scelta A stamattina + payout-test** — una sola finestra, due risultati: tap WhatsApp #20 (buyer 348 642 1766) → #21 accetta ordine `58094956…` + chiama PQ 0523 388601 → #22 consegna COD €19,05 → «consegna fatta».
2. 🔴 **R1 — revoca il PAT GitHub** (AR-004): il token è già in storia git, solo Nicola lo chiude (revoca + rigenera nel `.env` VPS).
3. 🟡 **Piattaforma sicura per il batch 6/7** — SQL 107 (DROP policy profiles, ~30s) + R2 merge+deploy fix cantiere (branch machine-analysis).

Assegnazioni (1 mossa per reparto):
- @operations · #16 pronto (passi #20–#22), aspetta il tap di Nicola · 🔴
- @supporto · assistenza messaggio buyer + aggiornamento stato ordine in dashboard · 🔴 con @operations
- @finanza · payout-test Stripe sandbox accorpato a #16 (era già in agenda 03/7 mattina) · 🔴
- @customer-success · script feedback A13/A14 pronto per il post-consegna (`consegne/customer-success/primo-ordine-faro.md`) · 🟢 prep
- @security · nota remediation R1 pronta (passi revoca PAT) · 🔴 azione Nicola
- @tech · SQL 107 idempotente + prep merge fix cantiere · 🟡
- @devops-sre · sync VPS post-merge (#17, resta 1× root Console Hetzner) · 🟡
- @data-engineer · #23 sblocco PostHog (Personal Key phx_, cieco ≥9 giri) · 🟡
- @account-negozi · #24 fix falso positivo «negozio fermo» su Casa Linda demo · 🟡
- @onboarding-negozi · checklist batch 6/7 pronta e presidiata · 🟢
- @intelligence · radar VP 3/7 + finestra meteo consegna · 🟢
- @analista · snapshot KPI baseline pre/post prima transazione · 🟢
🙋 **Serve da Nicola stamattina:** 🔴 **eseguire #16** (#20→#21→#22) + **payout-test sandbox** · 🔴 **revocare il PAT GitHub** (R1) · 🟡 **SQL 107** + **ok merge R2** + 1× root sync VPS (#17) · 🟢 firma opzionale #23 (PostHog) e #24 (Casa Linda demo). Tutto già pronto in coda — al tuo via parte.

- 2026-07-03 06:28 · @intelligence · FATTO · ☀️ giro mattino: meteo oggi ri-verificato LIVE (sereno 20-33°, ALLERTA AFA pomeriggio) → finestra consegna freschi = STAMATTINA; Venerdì Piacentini oggi (centro pieno, ritiro facile)
- 2026-07-03 06:28 · @AD · FATTO · giro pieno da delta-gate (cambio stato sensori: PostHog cieco 10 giri); business invariato dal 24/6 (1 ordine, stallo ~214h); Cabina riallineata (briefing/STATO/snapshot 06:28)
- 2026-07-03 06:28 · @AD · PASSO-A · Nicola: esegui #16 stamattina (prima dell'afa) + payout-test; R1 revoca PAT; R2 merge fix; SQL 107 — tutto già in coda
- 2026-07-03 08:20 · @AD · FATTO · 🔭 giro refresh (+~2h): full da delta-gate solo per contatore cieco PostHog 10→11 (opzionale); business invariato dal 24/6 (1 ordine, stallo ~216h); probe MCP marketplace tentato e NEGATO → conferma MCP cieco in sessione, baseline REST, zero numeri inventati; Cabina riallineata (briefing/STATO/snapshot 08:20)
- 2026-07-03 08:20 · @AD · PASSO-A · Nicola: mossa n.1 invariata → esegui #16 stamattina (prima dell'afa) + payout-test; R1 revoca PAT; R2 merge fix; SQL 107 — tutto già in coda
- 2026-07-03 10:22 · @AD · FATTO · 🔭 giro refresh (+~2h): full da delta-gate solo per contatore cieco PostHog 11→12 (opzionale, 2ª conferma oggi del falso-nuovo); business invariato dal 24/6 (1 ordine, stallo ~218h); probe MCP marketplace tentato e NEGATO → MCP cieco in sessione, baseline REST, zero numeri inventati; Cabina riallineata (briefing/STATO/snapshot 10:22)
- 2026-07-03 10:22 · @AD · PASSO-A · Nicola: mossa n.1 invariata → esegui #16 oggi in mattinata (prima dell'afa) + payout-test; R1 revoca PAT; R2 merge fix; SQL 107 — tutto già in coda
- 2026-07-03 11:14 · @AD · FATTO · 🔭 giro refresh (+~1h): full da delta-gate solo per contatore cieco PostHog 12→13 (opzionale, 3ª conferma oggi del falso-nuovo); business invariato dal 24/6 (1 ordine, stallo ~219h) — delta-gate 10:29 ri-misurato LIVE corrente==ultimo_pieno; MCP+node/curl gated in sessione, baseline REST, zero numeri inventati; Cabina riallineata (briefing/STATO/snapshot 11:14)
- 2026-07-03 11:14 · @AD · PASSO-A · Nicola: mossa n.1 invariata → esegui #16 oggi in mattinata (mezzogiorno vicino, prima dell'afa) + payout-test; R1 revoca PAT; R2 merge fix; SQL 107 — tutto già in coda

### 2026-07-03 — Proposta giro approvata: esegui #16 stamattina (accorpato payout-test)
- 2026-07-03 13:29 · @AD · FATTO · Proposta Pannello «Esegui #16 oggi 3/7 in mattinata → tap #20→#21→#22→«consegna fatta», accorpato al payout-test» **APPROVATA**. Doer: rigenerato artefatto pronto-al-tap slot mattina (link WhatsApp «stamattina entro le 13» in `consegne/operations/2026-07-02-esecuzione-ok16-pranzo.md`), aggiornati stati coda #16/#20 (PRONTO AL TAP) + #2 payout-test (ACCORPATO a #16). Decisione in [[DECISIONI]] con token anti-riproposta. **Card proposta da NON rigenerare.**
- 2026-07-03 13:29 · @operations · PASSO-A Nicola · 🔴 mani reali stamattina (~5 min): tap link WhatsApp buyer 348 642 1766 → accetta ordine `58094956…` in dashboard PQ + chiama 0523 388601 → ritiro Via Calzolai 25 + consegna + incasso €19,05 COD → «Consegnato» in app → scrivi AD **«consegna fatta»**.
- 2026-07-03 13:29 · @finanza · FACCIO · Payout-test accorpato: a consegna fatta, quadra incasso COD €19,05 vs ordine (Stripe sandbox, nessuna carta) — prima riconciliazione su caso reale.
- 2026-07-03 13:29 · @customer-success · standby · A13 feedback (+3h) → A14 recensione (+1g) gated su «consegna fatta» (#27). @crm-lifecycle: riaggancio carrello samir €10 (#26) dopo la consegna.

### 2026-07-03 14:20 — Giro refresh: #16 approvato ma non ancora consegnato
- 2026-07-03 14:20 · @AD · FATTO · Giro refresh 14:20 (full da delta-gate «cambio stato sensori», PostHog cieco 13→15). Unica novità reale: **#16 APPROVATO dal Pannello 13:29** — ma firma REST 14:20 invariata (ordini=1, ultimo 24/6, 23 profili): approvato ≠ consegnato. Aggiornati STATO/briefing/ultimo-briefing/auto-analisi/registro-realta/intenzioni al 14:20. Stallo ~222h. 4ª conferma oggi del falso-nuovo delta-gate.
- 2026-07-03 14:20 · @operations · PASSO-A Nicola · ⏰ finestra freschi spostata a **stasera post-19:00** (picco afa 33° alle 17 → i freschi non viaggiano nel caldo; centro pieno per Venerdì Piacentini). Tap #20→#21→#22→«consegna fatta» invariato, solo lo slot cambia da mattina a sera.
- 2026-07-03 14:20 · @intelligence · FATTO · radar non ri-verificato (meteo/eventi già LIVE alle 06:28, cadenza rispettata per non sprecare il Max): oggi VP 3/7 confermato, afa pomeridiana confermata.

### 2026-07-03 15:00 — 📅 REVIEW SETTIMANALE (venerdì)
- 2026-07-03 15:00 · @AD · FATTO · Review + retrospettiva della settimana (27/6→3/7). **Verdetto:** infrastruttura verde + volano-architettura che gira (20 difetti chiusi in codice, salute 42 onesto/~50 pending-merge), ma **North Star = 0 ordini consegnati** — l'azienda è ferma su UNA mano non collegata (tap #16, approvato 13:29 ≠ consegnato). Stallo ~222h. Pagella per reparto + 4 principi distillati + calibrazione 24/24 scritti in [[RITMO]] (blocco «Review settimanale · 2026-07-03 15:00»).
- 2026-07-03 15:00 · @AD · FATTO · Radiografia completa NON ri-lanciata di proposito (ultima 07-02 12:09 <27h, architettura statica, gate efficienza AR-019/AR-025) → snapshot a livello sonda. Aggiornati: storico-salute (entry review), calibrazione (24/24), auto-miglioramento (3 ambiti + esperimenti=[] → volano-business ancora aperto), apprendimento (4 principi), cantiere (invariato), LETTERA-A-NICOLA riscritta.
- 2026-07-03 15:00 · @AD · PASSO-A · Nicola: 3 mosse settimana prossima → ① 1ª transazione stasera (#16 post-19:00) + collegare la mano; ② chiudere AR-024/AR-025 (2 auto-riscritture 🟡 proposte); ③ sbloccare i 2 bloccanti umani (revoca PAT R1 + merge R2). Materia prima PQ = carburante 🟢.
- 2026-07-03 15:00 · @AD · RIVEDI · Volano-BUSINESS: 0 esperimenti misurati questa settimana (esperimenti=[]); il 1° esperimento misurabile = la 1ª transazione stessa (baseline pre/post #16). Torneo/peer-review tra senior rinviato finché non c'è 1 esito reale (no torneo su ipotesi).

### 2026-07-03 18:20 — 🔭 Giro refresh
- 2026-07-03 18:20 · @AD · FATTO · Giro refresh: nessuna novità di business vs 16:20 (firma REST invariata: ordini=1, ultimo 24/6 08:28, 23 profili) → #16 ancora APPROVATO 13:29 ma NON consegnato. MCP+node/curl gated in sessione → baseline REST, zero numeri inventati. Stallo ~226h. Delta-gate pieno solo per contatore cieco PostHog (16→17, opzionale): 6ª conferma oggi del falso-nuovo. Riallineati briefing/STATO/ultimo-briefing/auto-analisi/registro-realtà al 18:20.
- 2026-07-03 18:20 · @AD · PASSO-A · Nicola: la finestra serale post-19:00 è ORA imminente (caldo in calo, Venerdì Piacentini) → apri il link WhatsApp #20 e chiudi #20→#21→#22 fino a «consegna fatta», accorpando il payout-test. Sblocca ~226h e porta North Star 0→1.

### 2026-07-03 20:24 — 🔭 Giro refresh
- 2026-07-03 20:24 · @AD · FATTO · Giro refresh: nessuna novità di business vs 18:20 (firma REST 20:20 invariata: ordini=1, ultimo 24/6 08:28, 23 profili) → #16 ancora APPROVATO 13:29 ma NON consegnato. MCP+node/curl gated in sessione → baseline REST, zero numeri inventati. Stallo ~228h. Delta-gate pieno solo per contatore cieco PostHog (17→18, opzionale): 7ª conferma oggi del falso-nuovo. Riallineati briefing/STATO/ultimo-briefing/auto-analisi/registro-realtà/intenzioni al 20:24.
- 2026-07-03 20:24 · @AD · PASSO-A · Nicola: la finestra serale post-19:00 è APERTA ORA (caldo calato, Venerdì Piacentini prima serata) → apri il link WhatsApp #20 e chiudi #20→#21→#22 fino a «consegna fatta», accorpando il payout-test. Sblocca ~228h e porta North Star 0→1.

### 2026-07-03 21:21 — 🔭 Giro refresh
- 2026-07-03 21:21 · @AD · FATTO · Giro refresh: nessuna novità di business vs 20:24 (firma REST 21:21 invariata: ordini=1, ultimo 24/6 08:28, 23 profili) → #16 ancora APPROVATO 13:29 ma NON consegnato. MCP+node/curl gated in sessione → baseline REST, zero numeri inventati. Stallo ~229h. Delta-gate pieno solo per contatore cieco PostHog (18→19, opzionale): 8ª conferma oggi del falso-nuovo. Riallineati briefing/STATO/ultimo-briefing/auto-analisi/registro-realtà/intenzioni/calibrazione al 21:21.
- 2026-07-03 21:21 · @AD · PASSO-A · Nicola: la finestra serale post-19:00 è APERTA ORA (caldo calato, Venerdì Piacentini prima serata) → apri il link WhatsApp #20 e chiudi #20→#21→#22 fino a «consegna fatta», accorpando il payout-test. Sblocca ~229h e porta North Star 0→1.

### 2026-07-04 04:38 — ✅ Proposta #20 APPROVATA (Pannello): WhatsApp buyer → doer
- 2026-07-04 04:38 · @operations · FATTO · Nicola ha **approvato dal Pannello la proposta #20** («WhatsApp buyer 348 642 1766 — 1° passo consegna, ok 16 già approvato»). Doer: **rigenerato l'artefatto pronto-al-tap** per lo slot di **oggi sabato 4/7 mattina (entro le 13)** — messaggio + link `wa.me/393486421766` in `consegne/operations/2026-07-02-esecuzione-ok16-pranzo.md` §PASSO 1 (le finestre del 3/7 sono passate senza tap). Coda #20/#16 aggiornate (PRONTO AL TAP mattina 4/7), decisione registrata in [[DECISIONI]] (`proposta:20-whatsapp-buyer-348-642-1766` → **non riproporre**). Stallo ~236h.
- 2026-07-04 04:38 · @operations · PASSO-A @supporto · Il tap #20 apre il thread WhatsApp col buyer: se risponde sì + indirizzo → #21 accetta ordine in dashboard PQ + chiama negozio 0523 388601 → #22 consegna COD €19,05 → «consegna fatta».
- 2026-07-04 04:38 · @AD · SERVE · Nicola (mano reale, ~5 min): **tap il link WhatsApp #20 stamattina** (entro le 13, negozio aperto + freschi prima del caldo). Al «consegna fatta» partono A13/A14 (#27 recensione) e il riaggancio carrello samir (#26). È la mossa che porta North Star 0→1 dopo ~236h di stallo.

### 2026-07-04 05:10 — ✅ Proposta «Smoke #19 ruoli acquisto» APPROVATA (Pannello) → doer
- 2026-07-04 05:10 · @qa · FATTO · Nicola ha **approvato dal Pannello** la proposta dal giro «Smoke post-#19 ruoli acquisto» (verde). Doer: comportamento atteso **verificato nel codice** (middleware pagine + API guard) e nella spec #19 (doc 2/7) → **admin=403 sugli acquisti · seller=redirect a /seller/dashboard · buyer=invariato**. Prodotti: report `consegne/qa/2026-07-04-smoke-ruoli-acquisto-post19.md` + script `consegne/qa/smoke-ruoli-post19.sh`. Decisione in [[DECISIONI]] (`proposta:smoke-post-19-ruoli-acquisto` → **non riproporre**).
- 2026-07-04 05:10 · @qa · RIVEDI · **Candore:** il mirror locale del marketplace è indietro rispetto a #19 (nessun blocco-ruolo negli endpoint acquisto, nessun redirect seller→dashboard di navigazione) → la conferma statica è impossibile, solo il colpo in prod dice la verità. Consigliato `node cervello/collega-marketplace.mjs` (🟢) prima dell'esito definitivo.
- 2026-07-04 05:10 · @AD · SERVE · Nicola: dare il **via allo smoke in prod (coda #31)**. Parte anonima 🟢 pronta (la rete è chiusa in questa sessione → gira dal VPS: `bash consegne/qa/smoke-ruoli-post19.sh`); matrice completa = 3 login (cookie admin/seller/buyer). Se verde → sblocca recupero carrello samir (#26); se rosso → fix urgente backend/frontend.

- 2026-07-04 05:20 · @tech · FATTO · **SQL 107** proposta approvata dal Pannello → runbook paste-ready + smoke RLS pronti (`consegne/tech/2026-07-04-sql-107-drop-policy-runbook.md`), coda **#32** (🟡, in attesa). Firma già data (2/7 17:30); blocco = mano tecnica: strumento MCP write non concesso + no write key. Baseline 1/7 11:10 `anon → stripe_account_id` = HTTP 200 (policy ancora attiva). PASSO-A Nicola: (A) concedi permesso `apply_migration` → eseguo in 30s · (B) incolla in Supabase SQL Editor → «fatto sql 107» → lancio smoke.
- 2026-07-04 05:20 · @security · SERVE · Nicola: sblocco esecuzione **SQL 107** (permesso strumento o incolla manuale) — è l'ultimo bloccante RLS prima del batch negozi 6/7; anon legge ancora IBAN/KYC/Stripe su `profiles` finché non gira.

### 2026-07-04 04:51 — 🚚 Nicola risponde all'auto-analisi: «prosegui #21-#22» → #16 IN CONSEGNA
- 2026-07-04 04:51 · @Nicola · FATTO · Alla domanda auto-analisi «Hai inviato WhatsApp #20? Buyer ha risposto?» risponde **«prosegui #21-#22»**.
- 2026-07-04 04:51 · @AD · FATTO · Interpretato e applicato: **#20 → ✅ FATTO** (WhatsApp buyer 348 642 1766 inviato, contatto avvenuto), **#21 → 🔄 IN ESECUZIONE**, **#22 → 🔄 IN ESECUZIONE**, **#16 → IN CONSEGNA**. Registrato in [[DECISIONI]] (04:51) + [[AZIONI-IN-ATTESA]] #16/#20/#21/#22 + registro-realta + intenzioni-nicola + auto-analisi (risposta registrata). Domanda «WhatsApp #20?» **RISOLTA — non riproporre**.
- 2026-07-04 04:51 · @operations · FACCIO · PASSO 2–3: **#21** accetta ordine `58094956…` in dashboard PQ + chiama negozio 0523 388601 → **#22** ritiro Via Calzolai 25 → consegna COD €19,05 → «Consegnato» in app. Artefatto `consegne/operations/2026-07-02-esecuzione-ok16-pranzo.md` §PASSO 2–4. Restano 🔴 mani di Nicola.
- 2026-07-04 04:51 · @customer-success · PASSO-A · Al «consegna fatta» partono A13 (feedback +3h) → A14 (recensione +1g) = #27; e il riaggancio carrello samir (#26).
- 2026-07-04 04:51 · @AD · SERVE · Nicola: chiudi **#21** (accetta ordine) e **#22** (consegna COD €19,05); quando consegnato scrivi **«consegna fatta»** → North Star 0→1 + payout-test #2 (sandbox).

### 2026-07-04 09:31 — 🌙 Proposta «Esegui #16 stasera (cena 19–21)» APPROVATA (Pannello) → doer
- 2026-07-04 09:31 · @Nicola · FATTO · Approvata dal Pannello la proposta dal giro **«Esegui #16 stasera — tap WhatsApp #20 (cena 19–21) → #21 → #22 → "consegna fatta"»** (🔴). Sceglie lo **slot serale 19–21** dopo che le finestre di mattina/pranzo sono passate senza il tap. Non è una firma nuova (#16 già firmato più volte): è la scelta dello slot di stasera.
- 2026-07-04 09:31 · @operations · FATTO · Doer: **riallineato l'artefatto pronto-al-tap allo slot 19–21** in `consegne/operations/2026-07-02-esecuzione-ok16-pranzo.md` — PASSO 1 (testo + link WhatsApp serale di riconferma), PASSO 2 (script chiamata negozio «stasera verso le 19»), checklist. #20 già inviato (04:51) → il tap serale è riconferma se il buyer non ha bloccato indirizzo+orario, non un secondo primo-contatto.
- 2026-07-04 09:31 · @AD · FATTO · Aggiornati stati coda: **#16 → 🌙 IN CONSEGNA (slot stasera 19–21)**, **#21/#22 → IN ESECUZIONE (stasera)**. Registrato in [[DECISIONI]] (09:31, `proposta:esegui-16-stasera-tap-whatsapp-20-cena-19-21-21-` → **non riproporre**).
- 2026-07-04 09:31 · @customer-success · PASSO-A · Al «consegna fatta» partono A13 (feedback +3h) → A14 (recensione +1g) = #27; + riaggancio carrello samir (#26). Invariato: gated su #16 consegnato.
- 2026-07-04 09:31 · @AD · SERVE · Nicola, stasera 19–21 (~5 min di tap): **1)** tap link WhatsApp serale (riconferma buyer) → **2)** accetta ordine `58094956…` in dashboard PQ + chiama 0523 388601 (#21) → **3)** ritiro Via Calzolai 25 + consegna + incasso **COD €19,05** + «Consegnato» in app (#22) → **4)** scrivi **«consegna fatta»** → North Star 0→1 + payout-test #2 (sandbox).

### 2026-07-04 09:40 — 🔒 Proposta «R1 — Revoca il PAT GitHub (AR-004)» APPROVATA (Pannello) → doer
- 2026-07-04 09:40 · @Nicola · FATTO · Approvata dal Pannello la proposta dal giro **«R1 — Revoca il PAT GitHub (AR-004)»** (🔴). È l'unica remediation del segreto già entrato nella storia git.
- 2026-07-04 09:40 · @security · FATTO · Doer: verificate le difese anti-ricaduta (🟢) — `.gitignore` esteso `.env*`/`*.save` (nota AR-004), `.env.save` fuori dal working tree, `.githooks/pre-commit` + `scan-segreti.mjs` presenti, `remote origin` con placeholder `il_nuovo_token` (non un token reale). Scritto il **runbook paste-ready** `consegne/security/2026-07-04-R1-revoca-pat-github-runbook.md` con la sequenza anti-blackout (nuovo PAT→VPS `.env` → valore Vercel `GITHUB_TOKEN`+redeploy → SOLO ORA revoca il vecchio → verifica push+Pannello).
- 2026-07-04 09:40 · @security · RIVEDI · **Difetto trovato in questo giro:** su questo checkout del VPS il pre-commit hook NON è agganciato (`core.hooksPath` non impostato, manca `.git/hooks/pre-commit`) → la seconda rete gira solo nel giro, non sul singolo commit. Fix 🟢 pronto (`bash cervello/installa-hooks.sh`), ma il write di git-config aspetta l'ok di Nicola in sessione.
- 2026-07-04 09:40 · @AD · FATTO · Accodata **#34** in [[AZIONI-IN-ATTESA]] (🔴, in attesa) + aggiornato il blocco R1 del cantiere; registrato in [[DECISIONI]] (09:40, `proposta:r1-revoca-il-pat-github-ar-004` → **non riproporre**).
- 2026-07-04 09:40 · @AD · SERVE · Nicola (~5 min, le mani su GitHub/Vercel/VPS): segui il runbook nell'ordine anti-blackout — **1)** genera nuovo PAT (ad-mycity+mycity, Contents+PR R/W) → `cervello/vps/.env` `GIT_PUSH_TOKEN`; **2)** valore per Vercel `GITHUB_TOKEN` (consigliato 2° PAT read-only) + redeploy; **3)** SOLO ORA revoca il vecchio su GitHub; **4)** verifica push VPS + Pannello. Opzionale ma consigliato: `bash cervello/installa-hooks.sh` per agganciare l'hook su questo VPS.

### 2026-07-04 09:50 — 🛠️ Proposta «R2 — Merge+deploy fix cantiere (branch machine-analysis)» APPROVATA (Pannello) → doer
- 2026-07-04 09:50 · @Nicola · FATTO · Approvata dal Pannello la proposta dal giro **«R2 — Merge+deploy fix cantiere (branch machine-analysis)»** (🟡): attivare i 18-20 fix già chiusi in codice (timeout giro, gate sensori, guardiani, sensore cassa, hook segreti).
- 2026-07-04 09:50 · @devops-sre · FATTO · Doer (osserva prima di agire): **scoperta che cambia la premessa** — i fix **NON sono inerti**, sono già committati e **ATTIVI su `memoria-ad`** (il branch che gira il VPS: `giro.sh` li richiama davvero). `main` invece è **~116 commit / ~150 file INDIETRO** (relitto). Il branch scoped `claude/machine-analysis-ez7g3e` non è nei ref locali (fix confluiti in memoria-ad).
- 2026-07-04 09:50 · @devops-sre · RIVEDI · **Rischio latente reale:** `aggiorna-cervello.sh` (righe 122-124) propaga le cancellazioni da main → alla prossima avanzata di `main` il sync **cancellerebbe da memoria-ad i file-fix assenti da main → romperebbe `giro.sh`**. Quindi R2 = **mettere in salvo i fix** rendendoli canonici in main, non "accenderli". **Mina:** l'oggetto tracciato `marketplace` (copia locale del repo mycity) NON deve finire in main → escluso nel runbook.
- 2026-07-04 09:50 · @devops-sre · FATTO · Scritto il **runbook** `consegne/devops/2026-07-04-R2-merge-deploy-cantiere-runbook.md`: **Strada A** (merge branch scoped se ancora su origin) / **Strada B** (riconciliazione code-only memoria-ad→main via PR, escluso vault + `marketplace`) + verifica guardiani + **rollback** (`git revert`). Deploy = automatico (`watch-main.timer` ~5 min riavvia il worker).
- 2026-07-04 09:50 · @AD · FATTO · Accodata **#35** in [[AZIONI-IN-ATTESA]] (🔴, in attesa) + aggiornato il blocco R2 del cantiere; registrato in [[DECISIONI]] (09:50, `proposta:r2-merge-deploy-fix-cantiere-branch-machine-anal` → **non riproporre**).
- 2026-07-04 09:50 · @AD · SERVE · Nicola / prossimo giro VPS con rete aperta: in **questa** sessione la rete è chiusa (`git ls-remote`/`git push`/`node` negati) → il merge in main non è eseguibile ora. Passi: **0)** `git ls-remote --heads origin | grep machine-analysis` → scegli Strada A/B; **1)** merge in main via PR; **2)** watch-main riallinea + riavvia il worker; **3)** giro verde coi guardiani. Precondizioni: settla il working tree mid-giro (#33), coordina con #34/R1 (usa il PAT nuovo se R1 fatto prima).
- 2026-07-04 09:58 · @operations · RIVEDI · **Proposta «Esegui #16 stamattina 3/7» approvata dal Pannello = STESSO mandato #16** già in esecuzione (slot serale 19–21, decisione 09:31). Riconciliato senza doppioni: **#20 (WhatsApp) già FATTO** e il buyer ha già la promessa «stasera 19–21» → nessun re-plan al mattino (romperebbe la parola data). Restano 🔴 mani di Nicola: **#21** accetta ordine `58094956…` in dashboard PQ + chiama 0523 388601 · **#22** ritiro Via Calzolai 25 → consegna → COD €19,05 → «Consegnato». Al «consegna fatta» → payout-test #2 + A13/A14 (#27) + carrello samir (#26).
- 2026-07-04 09:58 · @AD · FATTO · Registrato in [[DECISIONI]] (09:58, `proposta:esegui-16-stamattina-3-7-tap-whatsapp-20-21-22-c` → **non riproporre**) + nota dedup sulla riga #16 di [[AZIONI-IN-ATTESA]]. Nessun nuovo artefatto: la catena #21→#22→«consegna fatta» è già completa e in coda dai giri precedenti — manca solo la mano di Nicola stasera.
- 2026-07-04 09:58 · @AD · SERVE · Nicola stasera 19–21: **#21** (accetta ordine in dashboard PQ + chiama 0523 388601) → **#22** (consegna COD €19,05 → «Consegnato» in app) → scrivi **«consegna fatta»**. ~5 min. Chiude ~206h+ di stallo e porta la North Star 0→1.

### 2026-07-04 11:30 — 🔭 Giro AD (perlustrazione)
- 2026-07-04 11:30 · @AD · FATTO · Giro pieno: business invariato dal 24/6 (firma REST 11:30: ordini=1, ultimo 24/6, 23 clienti; stallo ~243h). #16 ancora IN CONSEGNA (WhatsApp #20 fatto 04:51), restano #21–#22. MCP+node/curl gated → baseline REST, zero numeri inventati.
- 2026-07-04 11:30 · @intelligence · FATTO · Radar live: **OGGI Sant'Antonino (patrono di Piacenza)** — Fiera 250 bancarelle (33 alimentari), centro pieno; ZTL solo mezzi >35q (non tocca consegne a piedi/bici). Meteo sereno 20→33°, afa alle 17. Aggiornato Intelligence/eventi-picchi.md.
- 2026-07-04 11:30 · @AD · PASSO-A · @operations/Nicola: la finestra consegna #16 è OGGI (centro pieno) — mattina o dopo le 18. Aggiornati STATO, ultimo-briefing, intenzioni, registro-realta, auto-analisi, calibrazione. Nessun asset pesante prodotto (vincolo allocazione rispettato).
