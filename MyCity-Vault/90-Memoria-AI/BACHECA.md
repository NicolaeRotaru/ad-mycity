# 📌 Bacheca — da sapere

> La bacheca della Cabina: qui l'AD appunta le informazioni importanti che devono
> restare sott'occhio (costi, regole, decisioni di contesto, cose da non dimenticare).
> Il Pannello la mostra nella home. Formato di ogni avviso:
> `## <emoji> Titolo · AAAA-MM-GG HH:MM` — corpo in markdown; il Pannello ordina
> gli avvisi per data (più recenti in alto). Un avviso superato si toglie da qui.

## 📒 Registro dei fatti — fonte unica della verità · 2026-07-29 16:20

Specchio umano di `registro-fatti.json` (AR-102): qui vivono i fatti-chiave del business già concordati/verificati. Se un fatto cambia nel registro, questa tabella si riscrive nello stesso momento — niente copie vecchie in giro.

| Fatto | Valore | Aggiornato |
| --- | --- | --- |
| Negozio faro | **Pane Quotidiano** — unico negozio reale attivo (demo Casa Linda esclusa) | 06/7 23:55 |
| Cliente core | **Botteghe** (carrello multi-negozio settimanale) — non ristoranti/trattorie | 13/7 22:35 |
| Commissione MyCity | **10%** sul venduto | 20/7 12:39 |
| Abbonamento venditore | **50 €/mese** | 20/7 12:39 |
| Fonti di reddito | **Due:** ① marketplace (10% + 50 €/m + 3 € fee consegna) ② **Worker per i negozi** (99/299/699-999 €/m) — la ② non è ancora costruita | 29/7 01:19 |
| Le 46 leve di ricavo (lista Nicola 29/7) | **Mappa del potenziale, NON linee attive**: 16 incassabili a zero ordini · 11 ferme al 1° ordine · 12 richiedono pubblico · 7 richiedono un permesso. Nessun prezzo approvato | 29/7 16:20 |
| Worker per i negozi — listino | **Vetrina 99 €/m · Autopilot 299 €/m · Direttore Digitale 699-999 €/m** + setup una tantum | 29/7 00:15 |
| Worker per i negozi — pilot | **149 €/m bloccato** per 3 founder: I Frutti della Terra, Enoteca La Canteina, Il Pollivendolo (da fondare: non risultano nei dati) | 29/7 00:15 |
| Worker per i negozi — stato | **Definito, NON costruito** — si crea in sessioni dedicate future; nessuna azione né pitch finché non lo apre Nicola | 29/7 01:19 |
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

## 💰 Le 46 leve di ricavo — la mappa dei soldi di MyCity al suo apice · 2026-07-29 16:20

Lista di Nicola (chat 29/7 16:0x): *«questa è una parte di tutto ciò che potrà offrire MyCity quando sarà al suo apice»*. Messa in casa perché non finisse fuori — è già successo col listino Worker, nato in una chat claude.ai e assente dal vault per settimane.

> ⚠️ **Cos'è e cosa NON è.** È la mappa del **potenziale**, non un piano e non una coda di lavoro.
> Le linee di ricavo **attive restano DUE** (`strategia.linee-ricavo`): ① marketplace (10% + 50 €/m + 3 € fee consegna) ② Worker per i negozi (99/299/699-999 €/m, definito e **non costruito**, chiuso da Nicola). **Nessuna azione accodata da questa lista, nessun prezzo pubblicato, niente si muove.**

### Dove siamo davvero mentre leggiamo 46 righe di ricavo

| Fatto | Valore | Fonte |
| --- | --- | --- |
| Negozi reali attivi | **1** (Pane Quotidiano) | `negozio.faro` |
| Ordini vivi | **0** (1 solo ordine a DB, annullato il 24/6) | query live 29/7 16:10 |
| Persone registrate · prodotti · recensioni | **7 · 5 · 0** | query live 29/7 16:10 |
| Burn fisso | **~302 €/mese** | `finanza.costi_infrastruttura` |
| Ripresa lavoro operativo sui negozi | **dopo il 24/8 – 1/9** | `ripresa.lavoro-operativo` |

### La cosa più importante: **46 voci, ma 4 portafogli**

Le leve si contano a 46; **i portafogli che devono aprirsi sono quattro**, e il limite non è quante righe inventi ma quanto ognuno di loro può pagare al mese.

| Chi paga | Voci | Il vincolo vero |
| --- | ---: | --- |
| **Il cliente piacentino** | 14 (1-14) | Dentro ci sono **tre abbonamenti diversi** (#5 consegne, #9 box, #14 club): una famiglia ne sottoscrive **uno**, non tre. |
| **Il negozio** | 11 (15-25) **+ i 50 €/m già decisi** | Accese tutte fanno **~223 €/m alla stessa bottega** (50 + 99 + 30 + 19 + 25). La domanda non è quante leve: è **quanto paga al mese una bottega di Piacenza**. |
| **L'azienda / l'istituzione** | 7 (26-32) | L'**unico portafoglio con budget vero oggi** — ma cicli lenti, gare, firma 🔴, e serve l'entità giuridica (dubbio già emerso su PI26). |
| **L'altro builder / l'altra città** | 11 (33-43) | **Non ha bisogno di Piacenza.** È una software house attaccata al marketplace: la parte più facile da vendere subito e quella che può mangiare tutto il tempo che serve al primo ordine. |

Le 3 trasversali (44-46) si appoggiano ai portafogli sopra.

### Quattro cancelli: cosa serve prima di incassare 1 €

| Cancello | Quante | Cosa vuol dire |
| --- | ---: | --- |
| 🟩 **Può incassare ora** | **16** | Non dipende da ordini né da rete — dipende solo dal costruirla. **12 di queste 16 sono servizio/software, non marketplace.** |
| 🟦 **Serve il primo ordine** | **11** | Ferme finché il marketplace non vende: oggi 0 ordini vivi. |
| 🟪 **Serve un pubblico** | **12** | Si vende visibilità o dato: oggi 4 acquirenti registrati, 0 recensioni, newsletter senza lettori. |
| 🟥 **Serve un permesso prima dell'euro** | **7** | Wallet, buoni, welfare, appalti, licenza: qui il blocco è una regola o un contratto, non la fatica. |

#### 🟩 Le 16 che possono incassare senza un solo ordine

| # | Leva | Cosa serve prima |
| --- | --- | --- |
| 15 | Abbonamenti a livelli (Vetrina/Autopilot/Direttore) | **Già a registro** — definita, non costruita, chiusa da Nicola |
| 16 | Setup una tantum | Stessa linea del 15 |
| 19 | Fidelity white-label del negozio | Costruire il modulo (software puro, non serve la rete) |
| 20 | Campagne WhatsApp à la carte | Mano WhatsApp collegata + **base giuridica sui contatti del negozio** (la lista è sua, non nostra) |
| 21 | Servizio contenuti (foto/video/schede) | **La macchina lo sa già fare** — Content Factory + i due cancelli creativi |
| 24 | Formazione in presenza | Il tempo di Nicola, che è la risorsa scarsa |
| 25 | Kit fisico QR + vetrofania | **Grafica pronta su disco**; costa 80-150 € di stampa, margine minimo |
| 29 | Bandi e voucher digitalizzazione | Esiste già come leva — **PI26 scade domani 30/7 ore 16:00** con 3 dubbi di ammissibilità aperti in coda |
| 30 | Partnership associazioni di categoria | È **canale**, non ricavo — già presidiata |
| 33 | Vetrine self-service per professionisti | Costruire il prodotto |
| 39 | Moduli SaaS standalone | Costruire il prodotto |
| 40 | Boilerplate e template a builder globali | **Zero dipendenza da Piacenza** |
| 41 | Corso registrato | Dipende dal 24 |
| 42 | Hosting e manutenzione siti | Costruire il servizio |
| 43 | Widget e integrazioni | Poco ricavo, molto lock-in — giusto così |
| 44 | Affiliazioni B2B ai negozi | **Con 1 negozio vale 0** — inizia ad avere senso da ~10 |

#### 🟦 Le 11 ferme al primo ordine

| # | Leva | Nota |
| --- | --- | --- |
| 1 | Commissioni sugli ordini | Già decisa: **10%** |
| 2 | Paniere settimanale cluster food | Servono 3-4 botteghe **nello stesso giro** |
| 3 | Consegna prioritaria 1,50-2,50 € | Serve una consegna che regga le fasce — **la bici non è operativa** |
| 4 | Supplemento piccoli ordini +1,50 € | Si somma ai 3 € già in codice: vedi «una sola superficie di prezzo» |
| 5 | Abbonamento consegne 7-9 €/m | Nessuno si abbona a consegne che non usa |
| 8 | Fee prenotazione servizi | Serve un'offerta di servizi: oggi zero |
| 9 | Box «Sapori di Piacenza» | Assortimento + logistica ricorrente; è marchio proprio → rischio di pestare i piedi ai negozi |
| 10 | Gruppi d'acquisto condominiali | Serve densità per via |
| 11 | Preordini stagionali | **Incassi soldi prima di consegnare**: è un impegno, va coperto |
| 12 | Liste regalo locali | Dipende dai buoni (#7) |
| 14 | Club MyCity 5-10 €/m | **In conflitto con #5**: uno solo dei due può vivere |

#### 🟪 Le 12 che chiedono un pubblico che non c'è ancora

**17** analytics premium (oggi 0 ordini = niente da vendere) · **18** visibilità interna (Nicola stesso: 2027) · **22** vetrine temporanee · **23** slot newsletter (serve una newsletter con lettori) · **28** sponsorizzazioni locali · **32** report di mercato (2027, + dati aggregati = GDPR) · **34** biglietteria eventi · **35** annunci premium · **37** job board · **38** directory professionisti · **45** turismo ed esperienze · **46** media locale.

#### 🟥 Le 7 dove il blocco è una regola, non la fatica

| # | Leva | Il vero blocco |
| --- | --- | --- |
| 6 | Wallet / Carta Piacenza | Tenere soldi altrui e farci float è **area servizi di pagamento**. E il bonus non è gratis: **incassi 100, devi 105 di merce** |
| 7 | Buoni regalo | IVA del buono (monouso/multiuso), scadenza, e i non riscattati sono **un debito finché non scadono**, non cassa da spendere |
| 13 | Arrotondamento civico | **Non è ricavo** (lo dice Nicola) — sono soldi di terzi: servono regole e rendiconto |
| 26 | Corporate gifting | Dipende dai buoni (#7) + una rete dove spenderli |
| 27 | Welfare ricorrente | Normativa welfare/fringe benefit + wallet |
| 31 | Progetti DUC / Comune | Gare e appalti: tempi lunghi, entità giuridica, firma 🔴 |
| 36 | Licenza ad altre città | **Non si licenzia un modello a 0 ordini** — prima va provato una volta, poi marchio e contratto |

### I conti che riordinano la lista (burn ~302 €/mese)

| Come lo copri | Quanto serve |
| --- | --- |
| Worker Autopilot (299 €/m) | **1 cliente** ≈ tutto il burn |
| Worker Vetrina (99 €/m) | **4 clienti** (3 fanno 297, quasi) |
| Abbonamento venditore (50 €/m) | **6-7 negozi** che pagano — **senza un solo ordine** |
| Commissione 10% | **3.020 € di venduto/mese** — con scontrino *ipotetico* 25 € fanno ~121 ordini/mese, **~4 al giorno** (lo scontrino è un'ipotesi: non abbiamo un ordine reale su cui misurarlo) |
| Fee consegna 3 € | **~101 consegne/mese** |

**Due righe già decise che nella lista non ci sono:** l'**abbonamento venditore 50 €/m** e la **fee consegna 3 €**. La prima è la cosa più vicina a un ricavo ricorrente che il marketplace abbia già oggi.

### Le 5 decisioni che oggi costano poco e dopo costano care

1. **Un solo abbonamento al cliente.** #5, #9 e #14 chiedono soldi alla stessa famiglia: scegli quale è *l'*abbonamento, gli altri diventano livelli dentro quello.
2. **Una sola superficie di prezzo sul carrello.** Ci sono già 3 € di consegna; la lista ne aggiunge due (#3, #4). Tre balzelli su uno scontrino da 25 € si vedono tutti. Un owner unico del listino.
3. **Reputazione e identità legate alla persona, non allo strato.** È già scritto nella mappa multistrato del 6/7: è ciò che rende possibili #8, #38 e #36 senza rifare tutto da capo.
4. **Se un giorno arrivano wallet e buoni (#6, #7, #12, #26, #27): i soldi caricati sono un debito, non un ricavo.** Registro separato dal giorno zero — dopo si sistema solo con un rifacimento.
5. **Che azienda è MyCity.** Le voci 33-43 (11 su 46) **non hanno bisogno di Piacenza**: sono una software house. Sono le più facili da vendere subito e le più capaci di divorare il tempo che serve al primo ordine. È l'unica scelta della lista che la macchina non può fare al posto di Nicola.

### Rapporto con la mappa che avevamo già

Le 46 voci **non aggiungono strati** alla mappa multistrato del 6/7 (`consegne/strategia/2026-07-06-strategia-citta-online-multistrato.md`): la **riempiono di prezzi**. Le uniche che escono da quella mappa sono la software house (33, 39-42) e la licenza ad altre città (36) — cioè, non a caso, proprio quelle che non hanno bisogno della città.

---

## 💼 La seconda fonte di reddito: il Worker dato ai negozi · 2026-07-29 01:20

MyCity avrà **due modi di guadagnare**, non uno. Il marketplace incassa solo se la gente compra; il
**Worker in abbonamento al negozio** incassa il primo del mese comunque — **Vetrina 99 €/m** (esiste
online senza toccare nulla: Google Business, recensioni, social autopilot), **Autopilot 299 €/m** (+
WhatsApp ai clienti, richiami e loyalty, Report del Lunedì), **Direttore Digitale 699-999 €/m** (+
cruscotto finanziario in sola lettura, watchdog bandi, analisi strategica mensile). Più il setup una
tantum; i primi 3 pilot a **149 €/m bloccato**.

Per capirci sul peso: **un solo cliente Vetrina copre un terzo del burn fisso (~302 €/m); tre Autopilot
lo coprono tutto e avanzano** — senza che sia arrivato un solo ordine sul marketplace.

⛔ **Non è ancora costruita e non si tocca:** Nicola la crea in sessioni dedicate più avanti. Nessuna
azione in coda, nessun pitch, nessun materiale intestato ai 3 pilot (che vanno prima fondati: non
risultano nei dati). Tutto il dettaglio piano per piano, con cosa manca per venderlo:
`consegne/strategia/2026-07-29-listino-worker-negozi.md`.

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

---

## 🛡️ I guardiani della macchina · 2026-07-29 01:49

A ogni giro, prima che l'AI scriva una riga, girano **66 controlli automatici**. **25** hanno il potere di fermare il giro: se uno dice no, il lavoro non si chiude pulito e il motivo arriva scritto. Gli altri osservano, avvisano o frenano senza bloccare.

Rispondono tutti con la stessa lingua: **verde** (passato), **rosso** (bocciato), **cieco** (non ha potuto misurare). Un guardiano cieco *non* vale come verde — è uno strumento rotto, e la macchina si ferma lo stesso: meglio memoria vecchia che memoria che mente.

> ⚠️ **5 allarmi si scrivono ma non si contano.** `firma-check`, `pausa-check`, `porte-check`, `sensori-spenti-check`, `stampo-check` mettono il loro «no» davanti all'AI, ma non entrano nel conteggio che decide se il giro è pulito: il giro può chiudersi verde con quei controlli rossi. È un difetto vero, misurato qui sopra e non stimato.

### 🔍 I numeri sono veri?

| Controllo | Cosa guarda | Se dice no |
| --- | --- | --- |
| `coerenza-fatti` | Un fatto cambia in un posto solo. Se una copia vecchia resta in giro, la trova e ferma la pubblicazione. | ⛔ ferma il giro · 🚧 blocca la pubblicazione |
| `coerenza-rischi` | Lo stesso per i rischi: il registro è la casa, gli altri file lo citano invece di ricopiarlo. | ℹ️ scrive e basta |
| `freschezza-segnali` | Controlla i controllori: se un guardiano è morto a metà giro, il suo verde è vecchio e non vale. | ⛔ ferma il giro |
| `guardiani-check` | Tiene questa tabella agganciata al codice: se nasce un controllo e nessuno spiega cosa fa, il giro non si chiude. | ⛔ ferma il giro |
| `onesta-check` | Cerca i numeri orfani: una cifra scritta in memoria senza una fonte accanto non deve uscire. | ⚠️ avvisa, non ferma |
| `sensore-cassa` | Guarda cassa e autonomia: quanto è entrato davvero, quanto brucia al mese, quanti mesi restano. | ℹ️ scrive e basta |
| `sensori-spenti-check` | Uno strumento costruito e mai acceso è un buco, non uno stato: pretende un perché scritto. | ⚠️ allarme **non contato** (il giro può chiudersi lo stesso) |
| `sentinella-fonti` | Prova le fonti web da cui la macchina si informa: una fonte morta smette di portare notizie senza dirlo. | ℹ️ scrive e basta |
| `valida-contratti` | Verifica che i file di memoria abbiano la forma che il Pannello si aspetta — un campo rinominato spegne una schermata in silenzio. | ⛔ ferma il giro |
| `verifica-sensori` | Controlla che gli occhi sui dati reali siano aperti: se il marketplace non risponde, il giro non può scrivere numeri nuovi. | ⛔ ferma il giro |

### 🎯 Stiamo andando dove volevamo?

| Controllo | Cosa guarda | Se dice no |
| --- | --- | --- |
| `allocazione-check` | Impedisce che lo sforzo pesante vada su un negozio che non ha ancora firmato mentre quello reale resta a zero. | ⛔ ferma il giro |
| `bilancio-vivo` | Dice quanto rende ogni ordine al centesimo, con le commissioni e i costi reali dentro. | ℹ️ scrive e basta |
| `capacita` | Il cruscotto di cosa la macchina sa fare davvero oggi, contro cosa è ancora solo un'intelaiatura. | ℹ️ scrive e basta |
| `freschezza-checklist` | La checklist di Nicola invecchia in due giorni; oltre, il giro deve rifarla prima di proporre altro. | ⛔ ferma il giro |
| `freschezza-okr` | Gli obiettivi della squadra scadono: se il documento è stantio o i target sono passati, lo dice. | ⛔ ferma il giro |
| `intelligence-agenda` | Prepara la lista di cosa guardare fuori oggi — concorrenti, eventi, meteo — senza svegliare l'AI. | ℹ️ scrive e basta |
| `north-star-check` | Tiene l'occhio sul numero che conta — ordini pagati, negozi vivi, margine — e alza la voce se il primo ordine è fermo da giorni. | ⛔ ferma il giro |
| `registro-scelte-check` | Ogni prospect nominato in un dossier deve stare anche nel registro, o il Pannello mostra una lista incompleta. | ⛔ ferma il giro |
| `sblocco-capacita` | Veglia i cancelli di realtà: quando arriva il primo ordine o il quinto negozio, avvisa che una capacità nuova è ora costruibile. | ℹ️ scrive e basta |
| `supervisione-negozi` | Passa in rassegna ogni negozio e ogni prodotto, trova i dati mancanti e prepara il riempimento come proposta da firmare. | ℹ️ scrive e basta |

### 🧠 La macchina impara o accumula?

| Controllo | Cosa guarda | Se dice no |
| --- | --- | --- |
| `apprendimento-guardiano` | Misura se le lezioni diventano regole o restano un archivio: accumulare non è imparare. | ⛔ ferma il giro |
| `calibrazione` | Costringe a dire prima cosa ci si aspetta, e poi a confrontarlo col reale: previsioni mai chiuse sono debito. | ⛔ ferma il giro |
| `chiusura-loop` | Un reparto che dice FATTO deve lasciare l'esito nel suo quaderno: senza, il lavoro non ha insegnato niente. | ⛔ ferma il giro |
| `contesto-lezioni` | Rimette in testa alla macchina, all'inizio di ogni sessione, i fatti-chiave e gli errori da non ripetere. | ℹ️ scrive e basta |
| `cristallizza-apprendimento` | Prende le lezioni mature e le trasforma in principi scritti nei mansionari, dove valgono sempre. | ℹ️ scrive e basta |
| `macchina-del-tempo` | Ricostruisce la giornata della macchina in ordine: cosa è successo, quando, e perché è stato deciso. | ℹ️ scrive e basta |
| `sonda-volano` | Controlla che l'anello impara→correggi giri davvero, invece di sembrare che giri. | ⛔ ferma il giro |
| `tasso-lezioni` | Conta quante lezioni la macchina ha davvero applicato in questo giro, non quante ne ha in magazzino. | ⛔ ferma il giro |
| `taste-file` | Registra i verdetti di Nicola — cosa gli è piaciuto e cosa no — perché il gusto non si reinventa ogni volta. | ℹ️ scrive e basta |

### 🔧 I difetti si chiudono davvero?

| Controllo | Cosa guarda | Se dice no |
| --- | --- | --- |
| `allinea-scan-cantiere` | Riallinea la vecchia foto della radiografia al cantiere di adesso, così la lista non mostra roba già riparata. | ℹ️ scrive e basta |
| `auto-fix` | Chiude i difetti la cui prova è diventata verde per un fix vero, e lascia gli altri aperti. | ℹ️ scrive e basta |
| `cantiere-prove` | Smaschera i difetti che nessun controllo automatico potrà mai chiudere: un difetto senza prova resta aperto per sempre. | ℹ️ scrive e basta |
| `esperimenti-check` | Senza almeno un esperimento aperto non si misura niente: pretende che ce ne sia uno vivo e chiude quelli scaduti. | ⛔ ferma il giro |
| `pagella-intelligenza` | I cinque voti che dicono se la macchina è pronta per il business o sta solo girando a vuoto. | ℹ️ scrive e basta |
| `prove-oneste` | Impedisce a un difetto di nascere già chiuso, con una prova scritta apposta per essere verde. | ⛔ ferma il giro |
| `sincronizza-proposte` | Tiene le proposte di auto-riscrittura agganciate allo stato vero del cantiere. | ℹ️ scrive e basta |
| `sistema-immunitario` | Fa il red team su sé stessa: verifica che le difese di base siano ancora in piedi. | ℹ️ scrive e basta |
| `spazzata-fratelli` | Chiede «l'hai risolto o hai curato una copia sola?»: cerca la stessa malattia nei punti accanto. | ⛔ ferma il giro |

### 🛡️ Niente esce che non deve uscire

| Controllo | Cosa guarda | Se dice no |
| --- | --- | --- |
| `firma-check` | Nessuno script può scriversi da solo la firma di Nicola: chi esegue non firma sé stesso. | ⚠️ allarme **non contato** (il giro può chiudersi lo stesso) |
| `peso-contesto` | Sorveglia quanto testo la macchina si porta dietro: un contesto gonfio costa soldi e fa perdere il filo. | ⚠️ avvisa, non ferma |
| `porte-check` | Trova i punti che pubblicano scavalcando il cancello: una porta scoperta non si vede, pubblica e basta. | ⚠️ allarme **non contato** (il giro può chiudersi lo stesso) |
| `scan-segreti` | Cerca chiavi e password nei file che stanno per essere pubblicati, e blocca tutto se ne trova una. | 🚧 blocca la pubblicazione |
| `uscite-check` | Elenca ogni punto in cui la macchina tocca il mondo — email, messaggi, pagamenti — e pretende che ognuno abbia un controllo. | ⛔ ferma il giro |
| `vault-sanita` | Ultima visita alla memoria prima che finisca online: file troncati, link rotti, roba che non deve uscire. | 🚧 blocca la pubblicazione |

### 👥 I 120 senior sono a posto?

| Controllo | Cosa guarda | Se dice no |
| --- | --- | --- |
| `agent-registry-check` | Confronta i senior che esistono davvero con quelli elencati nei documenti: nessun agente orfano, nessun doppione. | ⛔ ferma il giro |
| `guardiano-capacita` | Verifica che i comandi e le capacità promesse nei documenti esistano davvero come file eseguibili. | ℹ️ scrive e basta |
| `keyword-owner-check` | Ogni mandato ha un padrone solo: se due senior rivendicano la stessa cosa, il lavoro va a chi capita. | ⛔ ferma il giro |
| `stampo-check` | Controlla la qualità dei mansionari: kit fotocopia, quaderni mai scritti, senior più sottili della media. | ⚠️ allarme **non contato** (il giro può chiudersi lo stesso) |

### 💶 Quanto costa tenerla accesa

| Controllo | Cosa guarda | Se dice no |
| --- | --- | --- |
| `costo-ai` | Segna il consumo di ogni giro — quanto tempo, quanti token — e tiene il totale del giorno. | ⏭️ spegne il motore AI |
| `freno-costi` | Il freno a mano sulla spesa AI: se non sa quanto è stato speso oggi, non finge che sia zero. | ⛔ ferma il giro · ⏭️ spegne il motore AI |
| `metabolismo` | Dice dove finiscono i soldi dell'AI: quale tipo di lavoro consuma di più e se conviene ancora. | ℹ️ scrive e basta |
| `sentinella-budget` | Un reparto che sfora il suo budget viene fermato con una proposta di STOP da firmare. | ℹ️ scrive e basta |

### ⏰ Tempo, code e scadenze

| Controllo | Cosa guarda | Se dice no |
| --- | --- | --- |
| `delta-gate` | Se dall'ultimo giro non è cambiato niente, evita di svegliare l'AI per riscrivere le stesse righe. | ⏭️ spegne il motore AI |
| `guardiano-tempo` | Misura quanto lavoro sta aspettando la firma di Nicola e da quanti giorni: la coda è un costo. | ℹ️ scrive e basta |
| `housekeeping-azioni` | Sposta in archivio le azioni già fatte o rifiutate, così la coda da firmare resta corta e vera. | ℹ️ scrive e basta |
| `letargo` | Se quota, cassa o sensori calano, spegne il superfluo in ordine e tiene vivo solo il nucleo. | ℹ️ scrive e basta |
| `midollo-spinale` | I riflessi rapidi: per ogni allarme delle sentinelle propone la reazione pronta, con il suo limite. | ℹ️ scrive e basta |
| `pausa-check` | Una card messa in pausa deve avere una sveglia: senza, dorme per sempre e nessuno se ne accorge. | ⚠️ allarme **non contato** (il giro può chiudersi lo stesso) |
| `scadenzario-check` | Nessuna scadenza esterna arriva a sorpresa, e nessun conto alla rovescia trascritto resta a mentire. | ⛔ ferma il giro |

### 🧪 Il codice regge?

| Controllo | Cosa guarda | Se dice no |
| --- | --- | --- |
| `test-cervello` | Lancia tutti i test del cervello a ogni giro: un test che nessuno esegue non è una rete, è un file. | ⛔ ferma il giro |
| `test-pannello` | Lo stesso per i test del Pannello, la parte che Nicola guarda davvero. | ℹ️ scrive e basta |
| `verifica-avversariale` | Smaschera l'auto-verifica finta: se il lavoro dice «verificato» senza che nessuno abbia provato a smontarlo, non vale. | ⛔ ferma il giro |

### 📲 Le mani (non giudicano: agiscono)

| Controllo | Cosa guarda | Se dice no |
| --- | --- | --- |
| `avviso-telegram` | Il canale per un messaggio urgente su Telegram quando qualcosa non può aspettare il prossimo giro. | — |
| `notifica-approvazioni` | Manda a Nicola le cose da firmare invece di aspettare che apra il Pannello. | — |
| `retry-policy` | Decide se un lavoro fallito va ritentato e quando: una sola regola per il worker e per le sentinelle. | — |
| `sync-worker-plugins` | Tiene aggiornati sul server i pezzi approvati, così il worker gira sempre la versione firmata. | — |

Questa tabella non è scritta a mano: la ricava `cervello/guardiani-check.mjs` leggendo `cervello/giro.sh` a ogni giro. Se ne nasce uno nuovo compare qui da solo, e finché nessuno ha scritto cosa fa il giro resta rosso.
