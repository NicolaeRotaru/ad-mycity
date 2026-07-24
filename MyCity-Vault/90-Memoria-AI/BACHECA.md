# 📌 Bacheca — da sapere

> La bacheca della Cabina: qui l'AD appunta le informazioni importanti che devono
> restare sott'occhio (costi, regole, decisioni di contesto, cose da non dimenticare).
> Il Pannello la mostra nella home. Formato di ogni avviso:
> `## <emoji> Titolo · AAAA-MM-GG HH:MM` — corpo in markdown; il Pannello ordina
> gli avvisi per data (più recenti in alto). Un avviso superato si toglie da qui.

## 📒 Registro dei fatti — fonte unica della verità · 2026-07-24 17:10

Specchio umano di `registro-fatti.json` (AR-102): qui vivono i fatti-chiave del business già concordati/verificati. Se un fatto cambia nel registro, questa tabella si riscrive nello stesso momento — niente copie vecchie in giro.

| Fatto | Valore | Aggiornato |
| --- | --- | --- |
| Negozio faro | **Pane Quotidiano** — unico negozio reale attivo (demo Casa Linda esclusa) | 06/7 23:55 |
| Cliente core | **Botteghe** (carrello multi-negozio settimanale) — non ristoranti/trattorie | 13/7 22:35 |
| Commissione MyCity | **10%** sul venduto | 20/7 12:39 |
| Abbonamento venditore | **50 €/mese** | 20/7 12:39 |
| Costi infrastruttura | **~302 €/mese** fissi (dettaglio nella sezione "💰 Costi infrastruttura" qui sotto) | 21/7 00:37 |
| Soglia costi extra (admin/assicurazioni/app store) | Sospesi finché l'utile netto non arriva a **~5.000 €/mese** | 23/7 17:26 |
| Ripresa lavoro operativo (inserimento negozi) | **Dopo il 24 agosto – 1 settembre 2026** | 23/7 17:36 |
| Bici consegna | Non operativa; riparazione da **~28/7** in poi | 14/7 02:59 |
| Ordini consegnati (North Star) | **0** | 07/7 00:29 |
| Ordine #16 (test 19,05 € del 24/6) | **Annullato** — non riesumare, il primo ordine reale va creato ex-novo | 07/7 00:29 |
| Ristoranti/trattorie | **Esclusi** — MyCity lavora solo con botteghe | 16/7 12:57 |
| Bando Commercio ER (40% fondo perduto) | **Chiuso** il 23/6 (350 domande raggiunte) — nessuna azione possibile | 11/7 11:40 |
| Motore AI del cervello | **Claude Code** — Cursor solo con flag esplicito | 16/7 12:03 |
| Ramo di pubblicazione memoria | **main** (ramo unico) | 07/7 00:29 |
| Deploy Pannello su Vercel | Solo quando cambia `pannello/`, via Deploy Hook | 07/7 00:29 |
| PostHog — regione | Account US (us.posthog.com) | 20/7 20:21 |
| PostHog — project id | **495230** | 20/7 18:49 |
| Venerdì Piacentini (date passate) | 10/7 e 17/7 — nessuna data futura ancora fissata | 07/7 00:29 |
| Visita 6 botteghe food | Nicola c'è andato **di persona** il 13/7 | 06/7 23:55 |

Fonte di ogni riga: campo `fonte` in `MyCity-Vault/90-Memoria-AI/registro-fatti.json` — lì c'è anche la storia delle correzioni.

---

## 📍 Capillarità — kit fisico QR e vetrine · 2026-07-20 23:59

Ogni negozio **confermato** esce dal go-live con kit fisico (QR cassa/vetrina, vetrofania, sacchetti) + mappa presenza in città. **Grafica pronta, stampa e posa bloccate** — non mettere QR in vetrina prima che il fornaio sappia evadere ordini.

### Dove siamo

| Fatto | Valore |
| --- | --- |
| Negozi approvati | **1** (Pane Quotidiano) |
| Ordini consegnati | **0** |
| Kit PQ intestato | **Pronto su disco** (QR live verificato) |
| Template neutri prospect | **Pronti** (Garetti / Peretti / Amendolara — solo dopo firma) |

**Verdetto:** ARMATO, non stampare. Priorità: ordine test PQ → preventivo tipografia → posa in negozio.

### Cosa c'è già (gratis, su disco)

- **Pane Quotidiano:** cartoncino cassa, vetrofania, QR vetrina — file pronti per la tipografia
- **Prospect non firmati:** solo template neutri con segnaposto — niente pacchetto intestato finché non aderiscono
- **Casa Linda:** esclusa (demo)

### Cosa resta in coda (🔴 firma Nicola — costa soldi)

| Passo | Gate |
| --- | --- |
| Preventivo + stampa kit PQ | Dopo **ordine test PQ** chiuso — stima **~80–150 €** tipografia locale |
| Posa vetrina + cassa | Stesso gate + ok titolare |
| QR sparsi in città (bar, edicole) | **≥ 3 negozi** reali che evadono — oggi ne abbiamo 1 |

> Il bando «Vita in Centro rimborsa materiali» **non esiste**. Alternativa stampa: **PI26 CCIAA** (50% digitalizzazione, scade 30/7).

### Prossimo passo (ordine)

1. **Ordine test Pane Quotidiano** — il fornaio deve sapere evadere
2. Chiedi preventivo tipografia con i file PQ → firma stampa
3. Dopo **≥ 3 negozi evadibili:** semina QR in città

Playbook completo: `consegne/vendite/2026-07-20-playbook-capillarita.md` · refresh vendite 20/7 11:24.

---

## 🎟️ Fedeltà di rete — MyCity Punti + Gift Card · 2026-07-20 23:54

Playbook aggiornato (base 6/7). **Meccanica pronta, programma NON acceso** — oggi 1 bottega, 0 ordini pagati: promettere punti su tutta la rete non ha senso finché la rete non c'è.

### Dove siamo

| Fatto | Valore |
| --- | --- |
| Negozi attivi | **1** (Pane Quotidiano) |
| Clienti registrati | **4** |
| Ordini pagati | **0** |
| Commissione MyCity | **10%** venduto + **50 €/mese** abbonamento negozio |

**Verdetto:** ARMATO, non acceso. Priorità adesso: PI26 + primo ordine test PQ.

### MyCity Punti (quando accendiamo)

- **1 punto ogni 1 €** speso, valido su **tutta la rete**
- Valore punto — stima rivista al rialzo 23/7 (Nicola: il costo è più alto di quanto pensavo): proposta lancio **2%** (100 pt = 2 €), può salire a **3–5%** se serve competere con Glovo/altri programmi fedeltà locali — l'1% iniziale era troppo ottimistico, i programmi fedeltà reali che spostano comportamento stanno nella fascia 2–5%
- Riscatto: minimo **100 pt**, max **30%** del carrello, scadenza **12 mesi**
- **Paga MyCity** (dalla commissione), il negozio incassa pieno al riscatto
- **Oggi: 0%** — non accendere con 1 solo negozio

### Gift Card MyCity

- Tagli **10 · 25 · 50 €**, spendibili su tutta la rete
- Incasso subito MyCity, negozio pagato quando il cliente spende
- **Prima di vendere:** parere legale + contabilità (IVA buono multiuso) 🔴
- Serve Stripe collegato in scrittura + tabella dedicata

### Per accendere servono tutte e 5

1. **≥ 5 negozi** con payout ok (oggi: 1)
2. **Primo ordine reale** chiuso end-to-end
3. **Stripe write** collegato
4. **% cashback firmata** (consiglio: 1% al lancio)
5. **Ok legale/fiscale** sulle gift card

### Prossimo passo (ordine)

1. Chiudere ordine test Pane Quotidiano + payout
2. Portare **3–5 botteghe** (Peretti, Garetti, Amendolara…)
3. Collegare Stripe + parere fiscale gift card
4. Firmare lancio Punti (1%) e Gift Card

Bozze post/email/banner già pronte. **Niente da firmare oggi su fedeltà** — card in coda (#44 Punti · #45 Gift Card).

Fonte: refresh growth 20/7 · validazione finanza · playbook base 6/7.

---

## 💰 Costi infrastruttura MyCity · 2026-07-23 17:26

Lista completa per Nicola — **✅ = confermato da te** · **📊 = stima orientativa** (tipografia, listini, mercato PMI — da rifinire col preventivo reale) · **🚫 = sospeso** (Nicola 23/7: niente amministrazione/assicurazioni/app store finché l'utile netto mensile non arriva a **~5.000 €/mese** — si attivano prima solo se un evento le rende obbligatorie, es. bando o assunzione).

### Oggi — confermati (fissi mensili)

| Voce | €/mese | Note |
| --- | ---: | --- |
| **Claude Max** (AD / worker) | **200** ✅ | Abbonamento fisso AI |
| **Vercel** (Pannello Cabina) | **30** ✅ | Oggi solo Pannello |
| **Supabase** (database marketplace) | **50** ✅ | DB + auth + storage |
| **VPS worker** | **20** ✅ | Cervello AD + n8n + sensori |
| **Dominio** | **~2** ✅ | **20 €/anno** ammortizzato |
| **Totale fisso mensile** | **~302** | 300 €/m servizi + dominio |

### In transizione

| Voce | Stima | Note |
| --- | ---: | --- |
| **Render** (marketplace) | **0** (chiusura) | Spegni quando migri — oggi **~7–25 €/m** se ancora attivo 📊 |
| **Vercel totale** (Pannello + sito) | **~50–70 €/m** 📊 | Dopo migrazione marketplace — oggi paghi 30 €; il piano può salire con traffico |

### Materiali fisici, volantini e stampa (🔴 on-demand — non nel burn mensile)

Grafica pronta su disco; paghi solo in tipografia. Gate: **ordine test PQ** prima del QR in vetrina.

| Voce | Stima | Cosa include |
| --- | ---: | --- |
| **Kit negozio** (1° bottega) | **~80–150 €** | QR cassa, vetrofania, adesivi, sacchetti kraft |
| **Volantini quartiere** (200–500 pz A5) | **~50–100 €** 📊 | Tiratura color tipografia Piacenza |
| **Locandine bacheche** (10–20 pz A5) | **~25–40 €** 📊 | Comune, associazioni, partner |
| **Presidio evento** (fiera, Venerdì Piacentini) | **~70–100 €** 📊 | ~200 volantini + QR plastificato |
| **Primo lotto completo** (kit + volantini cluster) | **~150–300 €** | Lancio zona — DECISIONI 24/6 |
| **2°–3° negozio** (kit) | **~80–150 €** ciascuno | Stampa batch |

**PI26 CCIAA** — fino al **50%** digitalizzazione (scadenza **30/7**): può ridurre kit/stampa. Distribuire volantini a mano = **~0 €**.

### App store (🚫 sospeso fino a 5.000 €/mese di utile — Nicola 23/7)

| Store | Costo | Quando |
| --- | ---: | --- |
| **Apple App Store** | **~99 €/anno** 📊 | Rinnovo annuale |
| **Google Play** | **~23 €** una tantum 📊 | Paghi una volta |
| **Primo anno entrambi** | **~120 €** | Poi **~99 €/anno** (solo Apple) |
| **PWA gratis** (alternativa) | **0 €** | Sito installabile — limiti su iPhone — **unica via oggi, resta gratis** |

### Email

| Tipo | Costo | Quando |
| --- | --- | --- |
| **Email automatiche** (Resend) | **0 €** → **~19 €/m** 📊 | Gratis fino 3.000/mese, poi Pro |
| **Casella tua** (Google Workspace) | **~7–8 €/m** per casella 📊 | info@ / nicola@ |

### SMS (Twilio)

**~0,05–0,10 €** a messaggio 📊 — backup urgente. Oggi **0 €** (Telegram + email bastano).

### Amministrazione e professionisti (🚫 sospeso fino a 5.000 €/mese di utile — Nicola 23/7)

| Voce | Stima | Frequenza |
| --- | ---: | --- |
| **PEC** | **~25–35 €/anno** (~3 €/m) 📊 | Obbligatoria per bandi/enti |
| **Firma digitale / SPID** | **~25–40 €/anno** (~3 €/m) 📊 | Se non ce l'hai già |
| **Commercialista** (micro/PMI) | **~800–1.200 €/anno** (~70–100 €/m) 📊 | Bilancio, IVA, dichiarazioni |
| **Visure / pratiche CCIAA** | **~15 €** a visura 📊 | Su richiesta |
| **Notaio** (atti societari) | **~200–500 €** a atto 📊 | Solo quando serve |
| **Consulente del lavoro** | **~50–150 €** a pratica 📊 | Quando assumi rider dipendente |

> Eccezione: se un bando/adempimento impone PEC o firma digitale PRIMA della soglia, si attiva comunque (obbligo, non scelta).

### Operatività consegne (quando parti)

| Voce | Stima | Note |
| --- | ---: | --- |
| **Bici** | **0 €** | Nicola ha già una bici elettrica (in riparazione) — **non calcolare acquisto/noleggio** finché non serve una seconda |
| **Pagamento rider** (freelance) | **~3–5 €** a consegna 📊 | Oppure **~8–12 €/ora** 📊 se a turno |
| **Packaging food extra** (termico) | **~0,30–0,80 €** a ordine 📊 | Oltre sacchetti brand |

### Marketing attivo (🔴 quando accendi)

| Voce | Stima | Note |
| --- | ---: | --- |
| **Meta / Google Ads** | **~300–500 €/m** minimo test 📊 | Tu decidi budget — 🔴 firma |
| **Promo «porta un amico»** | **~15 €** a coppia attivata 📊 | 5 € + 5 € cliente/amico + ~5 € margine per abusi (auto-referral, doppi account) e cannibalizzazione (chi avrebbe comprato comunque) — stima rivista al rialzo 23/7 su richiesta Nicola |
| **Influencer micro locali** | **~50–150 €** o baratto 📊 | Creator food/Piacenza |
| **Comunicato stampa** (invio) | **~0 €** | Email giornalisti — tempo tuo |

### A volume — quando incassi ordini

| Voce | Stima | Note |
| --- | ---: | --- |
| **Stripe** (commissioni carta) | **~1,4% + 0,25 €** / transazione 📊 | Esempio ordine 20 € → **~0,53 €** |
| **Assicurazione RC marketplace** | 🚫 sospesa fino a 5.000 €/m utile | **~500–1.000 €/anno** (~40–85 €/m) 📊 quando riattivata — da preventivo broker 🔴 |
| **Assicurazione RC consegne / rider** | 🚫 sospesa fino a 5.000 €/m utile | **~300–600 €/anno** (~25–50 €/m) 📊 quando riattivata — da preventivo broker 🔴 |

### In stack — oggi a zero o variabile

| Voce | €/mese | Note |
| --- | ---: | --- |
| **PostHog** | **0** (oggi) | Piano free — se superi limiti **~50 €/m** 📊 |
| **Telegram bot** | **0** | Gratis |
| **GitHub** | **0** | Repo attuali |
| **Cursor API** (fallback AI) | **~0–20 €/m** 📊 | Solo se Claude Max satura |
| **Supabase Pro+** | **~23 €/m**+ 📊 | Se superi piano attuale (50 €) |
| **Resend Pro** | **~19 €/m** 📊 | Oltre 3.000 email/mese |

### Riepilogo scenari (solo per orientarti)

| Scenario | €/mese indicativi | Cosa include |
| --- | ---: | --- |
| **Oggi (minimo)** | **~302** ✅ | Solo infrastruttura accesa |
| **+ operativo leggero** | **~320–370** 📊 | + qualche consegna rider (bici già c'è, gratis) |
| **+ marketing test** | **~620–870** 📊 | + ads 300–500 €/m (tu decidi) |
| **One-shot lancio zona** | **+150–300 €** una tantum | Primo lotto stampa + kit negozio |

**Runway:** il burn **certo oggi** resta **~302 €/m**. Amministrazione, assicurazioni e app store sono **fuori da ogni scenario** finché l'utile netto non arriva a **~5.000 €/mese** (Nicola 23/7). Tutto il resto entra solo quando lo accendi.

Fonte: Nicola chat 20–21/7 ✅ e 23/7 17:25 ✅ (soglia 5.000 €/m, bici già presente, referral/punti rivisti al rialzo) · playbook capillarità · DECISIONI 11/7 e 24/6 · listini Resend/Google/Stripe · stime PMI 📊.

---

## 🚀 Versione avanzata — checklist worker · AD · Pannello · 2026-07-20 21:52

Obiettivo: macchina che **vede tutto**, **ti disturba poco**, **agisce dopo il tuo ok**, **impara dagli ordini veri** — non «più AI».

### Livello 1 — Fondamenta (lo fai tu, 1–2 settimane)

- [ ] **Telegram** collegato (avvisi card + sveglia bandi alle 7)
- [ ] **Meta FB + IG** su n8n (post solo dopo Approva)
- [ ] **Email / notifiche** in modalità live (non solo bozze)
- [ ] **Burn mensile** nel file env del server (runway visibile)
- [ ] **Stripe in lettura** (cassa e payout monitorati)
- [ ] **Primo ordine test** su Pane Quotidiano + payout ok

### Livello 2 — Pannello che non stanca

- [ ] In cima solo **3 decisioni al giorno** (priorità automatica)
- [ ] Chat **stesso filo** tra telefono e PC
- [ ] Card che **spariscono sole** dopo merge o fix online
- [ ] Radiografia dice **cosa fare**, non solo rosso/verde

### Livello 3 — AD operatore

- [ ] Il giro **esegue** ciò che hai approvato (non solo accoda)
- [ ] Impara da ogni **ok / no** nelle card
- [ ] **PostHog funnel**: dove si perde il cliente (non solo visite)
- [ ] **Telegram** solo se cambia qualcosa di importante

### Livello 4 — Ultra avanzata (fa molto di più, sempre con firma su soldi/messaggi)

- [ ] **Carrello abbandonato** → recupero automatico (email/push) dopo regole ok
- [ ] **Negozio fermo** → check-in proposto prima che molla
- [ ] **Meteo + eventi città** → post e ops adattati (tu approvi solo eccezioni)
- [ ] **Bandi e scadenze** → promemoria + bozza domanda pronta (PI26, CCIAA…)
- [ ] **Health score negozi** → alert anti-churn automatici
- [ ] **Onboarding negozio** done-for-you end-to-end in meno di 48 ore
- [ ] **Report mattino/sera** su Telegram: 3 numeri + 1 mossa consigliata
- [ ] **Esperimenti prezzo/consegna** guidati dai dati (A/B con PostHog)
- [ ] **Gestionale negozio** collegato (catalogo e stock sincronizzati)
- [ ] **App / push nativa** — il cliente torna senza aspettare email

**Mossa unica consigliata adesso:** Telegram + Meta + ordine test PQ — trasforma la macchina da «assistente che scrive» a «operatore che agisce e misura».

---

## ⚙️ 50 workflow n8n MyCity (catalogo completo) · 2026-07-20 03:36

Bozze importabili in n8n — tutte **spente** finché non le completi. 🔴 messaggi/post · 🟡 avvisi interni · 🟢 solo report.

**1 Social & canali** — 1 FB 🔴 · 2 IG 🔴 · 3 Google Business 🔴 · 4 calendario post 🔴 · 5 report social 🟢

**2 Acquisizione** — 6 nuovo iscritto 🟡 · 7 invito zona live 🔴 · 8 reminder lista 🔴 · 9 referral 🟡 · 10 report iscrizioni 🟢

**3 Carrelli** — 11 abbandonato 1h 🔴 · 12 abbandonato 24h 🔴 · 13 alert alto valore 🟡 · 14 coupon recupero 🔴 · 15 report recupero 🟢

**4 Fidelizzazione** — 16 win-back 30gg 🔴 · 17 win-back 60gg 🔴 · 18 grazie+recensione 🔴 · 19 riordino freschi 🔴 · 20 report retention 🟢

**5 Negozi** — 21 nuovo ordine negozio 🔴 · 22 KYC Stripe 🟡 · 23 health score calo 🟡 · 24 catalogo vuoto 🟡 · 25 check-in settimanale 🔴

**6 Operations** — 26 ordine ritardo 🟡 · 27 negozio non risponde 🔴 · 28 meteo pioggia+ops 🔴 · 29 pagamento fallito 🔴 · 30 report ordini 🟢

**7 Comunicazione AD** — **31 card Da approvare → Telegram 🟡** (59 avvisi) · 32 errore worker 🟡 · 33 email Resend 🔴 · 34 WhatsApp negozio 🔴 · 35 SMS urgente 🔴

**8 Marketing locale** — 36 post pioggia 🔴 · 37 storia bottega 🔴 · 38 Venerdì Piacentini 🔴 · 39 prodotto del giorno 🔴 · 40 report reach 🟢

**9 Intelligence** — **41 RSS bandi Comune 🟢** (PI26 oggi 10:00) · 42 RSS Vita in Centro/CNA 🟢 · 43 promemoria scadenza 🟡 · 44 meteo domani 🟢 · 45 report intelligence 🟢

**10 Back-office** — 46 Stripe payout bloccato 🟡 · 47 alert runway 🟡 · 48 export incassi Sheets 🟢 · 49 health check n8n 🟢 · 50 log uscite social 🟢

**Priorità accensione:** 31 Telegram → 1–2 Meta → 41 RSS bandi → 11 carrello 1h → 21 ordine negozio. File JSON nel repo (50 stub + 2 workflow completi: pubblica post + lista attesa).

---

## 🔌 20 mani n8n utili per MyCity · 2026-07-20 03:25

n8n collega il worker a uscite diverse — ordine per impatto:

1. **Telegram** — avvisi immediati (59 card in attesa senza bot)
2. **Facebook pagina** — post programmati
3. **Instagram feed** — stesso post su IG
4. **Email (Resend)** — welcome, carrelli, promemoria negozi
5. **Marketplace (API)** — notifiche in-app, push, coupon, catalogo
6. **Google Sheets** — report ordini, liste negozi, log uscite
7. **Google Forms** — lista d'attesa iscritti (modello pronto)
8. **Google Business Profile** — post Maps + recensioni
9. **Cron** — sveglie fisse: bandi, report, meteo
10. **RSS Comune/bandi** — riassunto portali istituzionali
11. **Meteo** — trigger post «pioggia + consegna»
12. **WhatsApp Business** — messaggi ai negozi
13. **Stripe (solo lettura)** — alert pagamenti/payout
14. **Gemini (API)** — bozze testi in volume
15. **Google Drive** — PDF, locandine, export
16. **Google Calendar** — PI26, check-in, scadenze
17. **SMS (Twilio)** — backup Telegram/email
18. **Webhook → worker** — n8n sveglia il cervello
19. **Supabase (lettura)** — trigger ordine, iscritto, carrello
20. **Slack/Discord** — opzionale, team separato

**Regola:** messaggi, post e soldi = 🔴 (approvi la card). **Ordine:** Telegram → Meta → post test 🔴 → email welcome → notifica ordine negozio.

---

## 👥 Mani n8n per reparto (cosa chiedono i senior) · 2026-07-20 03:25

**Comunicazione & clienti** — Meta FB+IG, email (welcome/carrelli/win-back/recensioni), Google Business Profile, meteo, Google Forms.

**Negozi & vendite** — WhatsApp follow-up, email onboarding/KYC, Telegram health score, API marketplace (nuovo ordine, catalogo vuoto).

**Operations & consegne** — Supabase trigger (ordine/ritardo), Telegram/SMS alert urgenti, push cliente, WhatsApp rider/negozio 🔴.

**Soldi & pagamenti** — Stripe read (falliti/payout/chargeback), Telegram anomalie cassa, Sheets quadratura.

**Intelligence & istituzioni** — RSS+cron bandi (Comune 403 al worker), Calendar PI26 (**apre oggi 10:00**, scade 30/7), Telegram riassunto mattutino.

**Governance & numeri** — Telegram 59 card bloccate, cron report mattino/sera, Sheets/Drive KPI, webhook worker↔n8n (ok).

**Builder & tech** — webhook bidirezionale, cron health n8n, Gemini bozze.

**Creativi & ads** — Meta post/reel 🔴, email creator, ads solo con budget firmato 🔴.

**NON passa da n8n (umano 🔴):** invio bandi su portale, contratti, trattative, rimborsi, deploy, primo ordine fornaio.

**Ordine condiviso:** Telegram → Meta → RSS bandi → email welcome → notifica ordine negozio.

---

## 🗺️ Mappa negozi Piacenza — ordine di onboarding per MyCity · 2026-07-16 16:55

**L'obiettivo è creare 3 motivi per aprire l'app ogni settimana + 1 impulso emotivo.**

**Non onboardiamo:** ristoranti/trattorie, pizza/sushi/burger (terreno Glovo/Deliveroo).

---

### Subito — mesi 1–6 (costruire l'abitudine settimanale)

| # | Categoria | Perché viene prima |
|---|---|---|
| 1 | **Panifici / forni** | Già avviato (Pane Quotidiano). Acquisto quotidiano. |
| 2 | **Salumerie DOP** | Coppa, Pancetta, Salame Piacentino: le 3 DOP esistono solo qui. È il moat che nessun competitor può copiare. |
| 3 | **Fiorai** | Urgenza alta (compleanno → apri l'app). Scontrino €40–80. Già delivery-native. |
| 4 | **Macellerie / pollerie** | Acquisto settimanale, fiducia alta, scontrino buono. |
| 5 | **Enoteche / bottiglierie** | Piacenza zona DOC Colli Piacentini. Stesso cliente della salumeria. |

### Mesi 6–12 (completare il carrello)

- **Ortofrutta / verdurerie** — volume, completa la spesa settimanale
- **Pescherie** — nicchia fedele, poca concorrenza online
- **Caseifici / fromagerie** — chiude il tris DOP piacentino
- **Gelaterie / pasticcerie** — stagionale; **Bardini** (Largo Battisti 19) è il candidato principale

### Anno 2 (retail non-food)

Profumerie · Erboristerie · Cartolerie/librerie · Gioiellerie · Abbigliamento locale · Calzature · Casa/casalinghi (**Kaefu** Via Genova 31 entra qui)

### Anno 3 (servizi, con massa critica)

Lavanderie · Sartorie · Barbieri/parrucchieri · Studi professionali

---

**Botteghe prioritarie da chiamare** (appena la bici è pronta):
1. Antica Salumeria Garetti — Piazza Duomo 44
2. Peretti Frutta e Verdura — Via Alberici Fratelli
3. Caseificio Amendolara — Via Trento 7
4. Alloni Fiori — Corso V.E. 114
5. Taverna del Gusto (enoteca) — centro

~5.000 PMI totali a Piacenza · ~200 food nel centro · aggredibili in 12 mesi.

---

## 📱 Pubblicare l'app MyCity sugli store (iPhone e Android): costi e cose da sapere · 2026-07-16 12:23

**In breve: su Android è quasi gratis (25 $ una volta), su iPhone no (99 $ ogni anno). E sugli ordini Apple e Google non prendono nulla.**

**Quanto costa**

| Store | Costo | Quando si paga |
| --- | --- | --- |
| Apple App Store (iPhone) | 99 $/anno (~99 € + eventuale IVA) | ogni anno, finché l'app resta sullo store |
| Google Play (Android) | 25 $ una tantum (~23 €) | una volta sola, per sempre |

- Primo anno su entrambi: **~120 €**; dagli anni dopo **~99 €/anno** (solo Apple).
- Se smetti di pagare Apple, l'app sparisce dallo store. Esenzioni solo per nonprofit, scuole ed enti pubblici: MyCity non rientra.
- Oltre all'iscrizione non si paga nient'altro: pubblicazione, aggiornamenti e download sono inclusi.

**La notizia buona: zero commissioni sugli ordini**
La famosa commissione del 15–30% vale solo per i beni digitali comprati dentro l'app. MyCity vende beni fisici con consegna: le regole degli store *obbligano* a usare un pagamento esterno → gli incassi restano al 100% su Stripe, come oggi. Stesso regime di Amazon e Glovo.

**Si può avere gratis?**
- Davvero gratis: trasformare il sito in **PWA** (app installabile dal browser, «Aggiungi a schermata Home»). Zero costi, funziona subito su Android; su iPhone con qualche limite.
- Android quasi gratis: 25 $ una volta.
- iPhone: nessuna scorciatoia seria, i 99 $/anno sono il biglietto d'ingresso.

**Prima di iscriversi (requisiti, non costi)**
1. **Account azienda, non personale**: sullo store deve comparire «MyCity», non un nome privato. Serve il numero **D-U-N-S** (gratuito, ma arriva in giorni/settimane: muoversi in anticipo).
2. **Regola tester di Google**: con un account personale serve un test chiuso con 12 tester per 14 giorni prima di poter pubblicare. Con l'account organizzazione il vincolo non c'è.
3. **Obblighi UE**: dichiarare sullo store lo status di venditore (indirizzo, email e telefono visibili — Digital Services Act) + privacy policy GDPR.

**Il vero costo non sono le fee**
Oggi MyCity è un sito web: per andare sugli store va impacchettato come app (strada a tappe: PWA gratis → TWA su Play → Capacitor/nativa per iOS). Quello è il lavoro vero; le iscrizioni sono spiccioli. Iscrizioni e pagamenti agli store = 🔴 firma di Nicola.

Fonti: [Apple Developer Program](https://developer.apple.com/programs/whats-included/) · [esenzioni Apple](https://developer.apple.com/help/account/membership/fee-waivers/) · [Google Play Console](https://support.google.com/googleplay/android-developer/answer/6112435?hl=en) · [fee Google + regola 12 tester](https://www.iconikai.com/blog/google-play-developer-account-fee-2026)
