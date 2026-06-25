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
