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
