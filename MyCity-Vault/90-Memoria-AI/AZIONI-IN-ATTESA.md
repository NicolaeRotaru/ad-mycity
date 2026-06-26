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
| # | Data | Reparto | Azione (pronta) | Colore | Contenuto | Canale | Stato |
|---|---|---|---|---|---|---|---|
| 1 | 2026-06-25 | vendite | Termini commerciali a Garetti: commissione **12%**, **0€ costi fissi**, **payout a consegna confermata**, **nessun vincolo** | 🔴 | consegne/vendite/pitch-garetti.md (Parte C) | di persona al go-live (condizioni 1 pagina via @legale) | in attesa |
| 2 | 2026-06-25 | finanza | Modalità payout-test: **1€ reale** (da stornare dopo) **o** ambiente test Stripe | 🔴 | consegne/finanza/payout-faro.md | onboarding min 17-20 | in attesa |
| 3 | 2026-06-25 | customer-success | Via libera a inviare i **messaggi/telefonate ai clienti reali** del primo ordine (testi pronti) | 🟡 | consegne/customer-success/primo-ordine-faro.md | manuale (poi email/n8n) | in attesa |
| 4 | 2026-06-24 | tech | Fix checkout (tab bar mobile copriva "Conferma ordine") | 🔴 | PR #199 | — | ✅ MERGED |
| 5 | 2026-06-24 | frontend-dev | Gruppo 1 audit-design (conversione & messaggi) | 🔴 | PR #200 | — | ✅ MERGED |

> 📋 I **4 gruppi rimasti** (2 errori-vuoti · 3 contrasto · 4 brand+layout · 5 immagini/PWA) sono nel piano [[PIANO-FIX-DESIGN]] — eseguibili uno alla volta con *"sistema il gruppo N dell'audit design"*.

<!-- I senior aggiungono righe qui sotto. Esempio:
| 1 | 2026-06-25 | crm | Email benvenuto ai primi 10 iscritti | 🟡 | consegne/crm/benvenuto.md | email (Resend) | in attesa |
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
- **Pre-condizioni prima del via:** (1) ok firmato di Garetti per nome/foto; (2) segnaposto [Garetti/MyCity/Cliente] riempiti coi dati veri; (3) dialetto validato da madrelingua; (4) URL lista d'attesa reale; (5) grafiche pronte ✅ (S1 generata dalla Content Factory: 4 PNG + 1 reel .webm in `creativi/output/social/` — vedi `consegne/automazioni/CONTENT-FACTORY.md`); (6) peer review @finanza sulla promo "primi 50 gratis".
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
- [ ] 🔴 Pubblicare il MANIFESTO-CAUSA "Ogni spesa è un voto" (post gruppi FB + feed IG @mycity.piacenza). Testo+visual pronti in `consegne/content/C1-manifesto-causa.md` (PNG: `creativi/output/social/C1-manifesto-causa.png`). PRECONDIZIONI: (a) confermare il dato −22%/12 anni + fonte citabile [vault riporta anche −20,4% al 2035]; (b) link reale lista d'attesa nel 1° commento (da @builder-automazioni); (c) [opz.] validare la variante dialetto con madrelingua.

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
