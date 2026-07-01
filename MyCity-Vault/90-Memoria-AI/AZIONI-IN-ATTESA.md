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
> Le ultime 2 colonne (**Cosa cambia · Se va bene**) sono la spiegazione che compare nella card del Pannello:
> scrivile in parole semplici per Nicola. Sono opzionali — se vuote, il Pannello mette un testo per-reparto.

| # | Data e ora | Reparto | Azione (pronta) | Colore | Contenuto | Canale | Stato | Cosa cambia | Se va bene |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 2026-06-25 10:09 | vendite→legale | Termini commerciali **Pane Quotidiano**: commissione **12%**, **0€ costi fissi**, **payout a consegna**, **nessun vincolo** | 🔴 | `consegne/legale/contratto-pane-quotidiano-bozza.md` | firma col negozio (dopo validazione legale) | ✅ **FIRMATA** Nicola 1/7 01:02 · contratto creato · firma negozio 🔴 | Pane Quotidiano accetta 12% e 0€ fissi: può ricevere ordini veri e MyCity incassa commissione sul primo incasso. | Contratto firmato col negozio → onboarding payout + ordine zombie €19,05. |
| 2 | 2026-06-25 10:09 | finanza | Payout-test Stripe / flusso pagamenti | 🔴 | consegne/finanza/payout-faro.md | **Nicola esegue 03/07 mattina** | ✅ **PROGRAMMATO** Nicola 1/7 01:02 · Stripe **sandbox** (decisione #3) | Il 3 luglio mattina verifichi che payout e pagamenti funzionano (sandbox o COD-first). | Flusso validato → si può passare a LIVE o completare ordine COD reale. |
| 3 | 2026-06-25 10:09 | customer-success | Via libera a inviare i **messaggi/telefonate ai clienti reali** del primo ordine (testi pronti) | 🟡 | consegne/customer-success/primo-ordine-faro.md | manuale (poi email/n8n) | ✅ approvato Pannello 30/6 09:08 · in coda | Partono i contatti veri al primo cliente (messaggio + telefonata di feedback): è la cura concierge che evita la "brutta prima esperienza". | Il primo cliente è seguito a mano, il problema viene intercettato prima del reclamo e si chiede la prima recensione. |
| 4 | 2026-06-24 10:43 | tech | Fix checkout (tab bar mobile copriva "Conferma ordine") | 🔴 | PR #199 | — | ✅ MERGED |  |  |
| 5 | 2026-06-24 10:43 | frontend-dev | Gruppo 1 audit-design (conversione & messaggi) | 🔴 | PR #200 | — | ✅ MERGED |  |  |
| 6 | 2026-06-26 23:05 | content-social | Pubblicare post storia-bottega Garetti "La saracinesca" su **IG + FB** (FB: link nel 1° commento). Serve il **LINK reale lista d'attesa** da Nicola | 🔴 | consegne/content/POST-storia-bottega-garetti-saracinesca.md + creativi/output/social/storia-bottega-garetti-saracinesca.png | IG + FB (manuale, poi n8n) | in attesa | Il primo post pubblico di Garetti esce su IG+FB: i suoi clienti scoprono che possono ordinare a casa. Serve il link reale della lista d'attesa. | Arrivano i primi iscritti dai clienti caldi della bottega, a costo ≈0 (ripubblicazione del negozio). |
| 7 | 2026-06-27 02:10 | content-social | Pubblicare "I TRE VENERDÌ" (post+storia IG/FB + post gruppo locale) **nelle sere dei Venerdì Piacentini rimasti: 3, 10, 17 lug**. FB: link nel 1° commento. **FINESTRA REALE che si chiude il 17/7** → serve LINK lista d'attesa + ok lancio | 🔴 | consegne/content/GARETTI-kit-L7.md | IG + FB + gruppi FB locali (manuale, poi n8n) | ⏸️ **RIMANDATO** Nicola 1/7 (priorità negozi 6/7; VP 3/7 saltato) | I 3 post escono nelle sere dei Venerdì Piacentini (3/10/17 lug), quando il centro è pieno: cavalchi l'evento. Finestra reale che si chiude il 17/7. | Picco di iscritti agganciato all'evento; poi "Bottega × Evento" può diventare una rubrica fissa. |
| 8 | 2026-06-27 02:10 | content-social→relazioni-istituzionali/pr-stampa | Contattare **organizzatori Venerdì Piacentini / pagine "Sei di Piacenza se…"** per ricondivisione DI VALORE (mini-storia bottega del centro, non spam) durante la finestra | 🔴 | consegne/content/GARETTI-kit-L7.md §3B | DM/email a pagine locali | ⏸️ **RIMANDATO** Nicola 1/7 (priorità negozi 6/7; VP 3/7 saltato) | Pagine e organizzatori locali ricondividono la mini-storia della bottega: portata gratis verso un pubblico già piacentino. | MyCity entra nelle conversazioni locali senza spendere, con la credibilità di chi ti ripubblica. |
| 9 | 2026-06-27 02:10 | content-social (proposta L7) | Rendere **"Bottega × Evento" rubrica fissa** (format-motore che aggancia ogni evento del centro PC a una bottega). Serve calendario eventi PC da @intelligence + consensi-bottega | 🔴 | consegne/content/GARETTI-kit-L7.md §7 | decisione strategica Nicola | ✅ approvato Pannello 30/6 09:08 · in coda | Si decide se trasformare "Bottega × Evento" in una rubrica fissa (ogni evento del centro agganciato a una bottega). | Diventa un format-motore che sforna contenuti rilevanti a ogni evento, quasi in automatico. |
| 10 | 2026-06-28 20:25 | AD/Tech | **Wiring Vercel della memoria**: impostare `SUPABASE_URL=https://xjljcsorpbqwttrejqte.supabase.co` + `SUPABASE_SERVICE_KEY=<service_role del progetto memoria>` nelle env del Pannello + **Redeploy** | 🟡 | la service key la prendi da Supabase → progetto ad-mycity → Settings → API | Vercel (manuale, lato Nicola) | ❌ rifiutato Pannello 30/6 09:08 | Il Pannello inizia a leggere/scrivere la memoria nel DB giusto: la spia "Memoria collegata" diventa verde e i briefing compaiono nella card "Cosa ho scoperto". | Ogni giro si accumula da solo nella Cabina, senza che io riscriva file a mano. |
| 11 | 2026-06-28 20:25 | designer→vendite | **Kit QR "Venerdì Piacentini"**: vetrofania + cartoncino-cassa con QR "ordina e te lo portiamo" per le botteghe aperte nelle sere del 3/10/17 lug (presidio offline, NON delivery in ZTL) | 🟡 | da produrre in creativi/output/ (brief @designer) — serve il LINK reale lista d'attesa | stampa + consegna a mano alle botteghe (manuale) | ⏸️ **RIMANDATO** Nicola 1/7 (priorità negozi 6/7) | Davanti a 50-60k persone/sera in centro, le botteghe espongono un QR che porta i clienti su MyCity: acquisizione a costo ≈0. Serve il link reale della lista d'attesa. | Primi iscritti agganciati all'evento più grande della città; il presidio diventa ripetibile ogni venerdì. |
| 12 | 2026-06-29 11:30 | vendite→legale-privacy | **Kit "Bando ER + MyCity"** per onboarding negozi: one-pager con preventivo MyCity intestabile + descrizione spesa ammissibile + mini-guida Sfinge + disclaimer "mai promettere l'esito". **⚠️ Giro web 1/7 01:29:** bando FESR Commercio ER **chiuso 23/6** (tet domande) — rivedere leva e scadenze prima del pitch; non citare 40% fondo perduto finché kit non aggiornato | 🟡 | da produrre in consegne/vendite/ (@vendite + @legale-privacy) | di persona + email ai lead | ✅ approvato Pannello 30/6 09:08 · **⚠️ da rivedere** post-giro web 1/7 | Kit bando va aggiornato: lo sportello FESR Commercio non accetta più domande dal 23/6. | Dopo revisione @relazioni-istituzionali + @legale: kit corretto o pivot su prossimo bando ER/Comune. |
| 13 | 2026-07-01 02:17 | tech→security | **Sprint 1 radiografia marketplace** — branch fix 4 bloccanti pre-live: (1) webhook Stripe rollback se insert fallisce (2) fee €3/consegna/negozio in UI checkout (3) RLS profiles → view pubblica (4) COD rollback se order_items fallisce | 🟡 | `consegne/audit/2026-07-01-radiografia.md` § Sprint 1 | branch marketplace (no deploy) | in attesa | Il checkout mostra il prezzo vero, non perde ordini Stripe/COD e non espone IBAN/KYC negozi: prerequisito sicuro prima del batch negozi 6/7. | Branch pronto per review → QA → deploy 🔴 separato dopo ok Nicola. |

> 📋 I **4 gruppi rimasti** (2 errori-vuoti · 3 contrasto · 4 brand+layout · 5 immagini/PWA) sono nel piano [[PIANO-FIX-DESIGN]] — eseguibili uno alla volta con *"sistema il gruppo N dell'audit design"*.

<!-- I senior aggiungono righe qui sotto. Metti SEMPRE data E ora (AAAA-MM-GG HH:MM).
     Le ultime 2 colonne (Cosa cambia · Se va bene) sono OPZIONALI ma consigliate: sono la spiegazione che Nicola legge nella card. Esempio:
| 1 | 2026-06-25 14:30 | crm | Email benvenuto ai primi 10 iscritti | 🟡 | consegne/crm/benvenuto.md | email (Resend) | in attesa | I primi 10 iscritti ricevono il benvenuto e capiscono come funziona MyCity. | Più clienti completano il primo ordine invece di sparire dopo l'iscrizione. |
-->

### 2026-06-24 · @pr-stampa · 🔴 Pacchetto earned media di lancio (kit pronto)
**Stato 30/6 09:09:** ❌ **rifiutato** da Nicola via Pannello — non riproporre finché non chiede esplicitamente.
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
