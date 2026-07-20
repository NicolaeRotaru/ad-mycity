# 📌 Bacheca — da sapere

> La bacheca della Cabina: qui l'AD appunta le informazioni importanti che devono
> restare sott'occhio (costi, regole, decisioni di contesto, cose da non dimenticare).
> Il Pannello la mostra nella home. Formato di ogni avviso:
> `## <emoji> Titolo · AAAA-MM-GG HH:MM` — corpo in markdown; il Pannello ordina
> gli avvisi per data (più recenti in alto). Un avviso superato si toglie da qui.

## 💰 Costi infrastruttura MyCity · 2026-07-20 23:43

Lista aggiornata da Nicola — importi **mensili** salvo dove indicato.

### Oggi — confermati

| Voce | €/mese | Note |
| --- | ---: | --- |
| **Claude Max** (AD / worker) | **200** | Abbonamento fisso AI |
| **Vercel** (Pannello Cabina) | **30** | Hosting Pannello |
| **Supabase** (database marketplace) | **50** | DB + auth + storage |
| **Totale confermato** | **280** | Solo queste tre voci |

### In stack — importo da mettere

| Voce | €/mese | Note |
| --- | ---: | --- |
| **Render** | *?* | Sito marketplace online — attivo, manca cifra |
| **VPS worker** | *?* | Cervello AD + n8n + sensori — manca cifra |
| **Dominio / DNS** | *?* | mycity + eventuali alias |
| **PostHog** | 0 (oggi) | Piano cloud free US — monitorare se superiamo i limiti |
| **Stripe** | variabile | Nessun canone fisso — solo % su transazione |
| **Resend** (email) | *?* | Quando accendiamo welcome / carrelli / notifiche |
| **Telegram bot** | 0 | Gratis |
| **GitHub** | 0 | Repo pubblici/privati attuali |

### Quando scaliamo — previsti

| Voce | Stima | Quando |
| --- | --- | --- |
| **Meta / Google Ads** | budget variabile 🔴 | Campagne acquisizione — decidi tu importo |
| **Apple App Store** | ~99 €/anno | App iPhone (vedi avviso store sotto) |
| **Google Play** | ~23 € una tantum | App Android |
| **Twilio SMS** | pay-per-use | Solo se accendiamo SMS urgenti |
| **Cursor API** | pay-per-use | Fallback se Claude Max satura (oggi raro) |
| **Supabase Pro+** | sale con traffico | Se superiamo piano attuale |
| **Vercel Pro+** | sale con traffico | Se superiamo piano attuale |

**Runway:** per calcolarlo serve anche il **burn completo** (Render + VPS + dominio) nel file env del server — oggi mancano quelle cifre. Quando le hai, scrivimele e aggiorno il totale.

Fonte importi confermati: Nicola, chat 20/7 ~23:43.

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
