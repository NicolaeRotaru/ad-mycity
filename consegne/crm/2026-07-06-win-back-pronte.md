---
tipo: azioni-pronte-win-back
reparto: crm-lifecycle
data: 2026-07-06 11:40
fonte: STATO.md + verifica LIVE MCP Supabase 2026-07-06 11:11 (`profiles` + `orders`) · letture live MCP/Bash gated in sessione → riuso del dato verificato 11:11, nessun numero nuovo inventato
stato: DRY-RUN — NESSUN INVIO · playbook ARMATO (scatta solo quando esiste un dormiente reale)
voce: Vicino Orgoglioso (FLUSSI-LIFECYCLE §6)
riferimento: flusso completo `consegne/crm/FLUSSI-LIFECYCLE.md` §4
anti-doppione: samir (unico buyer) è già coperto da recupero-carrelli A3 / #26 → NON toccato qui (AR-008)
---

# 💛 Win-back dormienti — pacchetto ARMATO (6/7 11:40)

> **Cos'è questo file.** Un playbook win-back **pronto a partire in automatico** appena esiste il primo
> cliente dormiente reale. Oggi quel segmento è **VUOTO** (lo dimostro sotto con la fonte): quindi qui
> **non parte nessun invio**. È un'arma caricata con la sicura, non un blast. Scatta da sé quando il
> primo ordine vero viene consegnato/pagato e quel cliente resta poi 14 giorni senza riordinare.

---

## 1) Segmento reale OGGI — la verità, con la fonte

**Definizione di "dormiente"** (FLUSSI-LIFECYCLE §4): cliente con **≥1 ordine COMPLETATO** in passato e
**0 ordini negli ultimi 14 giorni**.

| Metrica | Valore | Fonte |
|---|---|---|
| Profili cliente totali | **23** | MCP Supabase `profiles`, verifica 6/7 11:11 |
| Ordini creati in tutta la storia | **1** (COD €19,05, Pane Quotidiano, 24/6) | MCP `orders`, 6/7 11:11 |
| Quell'unico ordine | **ANNULLATO il 3/7 15:38** — mai pagato, mai consegnato | MCP `orders` |
| Ordini completati / pagati / consegnati | **0** | MCP `orders` (North Star = 0) |
| **Clienti dormienti reali** (≥1 completato + 14gg fermi) | **0** | conseguenza diretta: 0 completati ⇒ 0 riattivabili |
| Dei 23 profili: iscritti-mai-attivati (0 ordini) | **la quasi totalità** | 0 ordini completati in DB |

> ⚠️ **Segmento win-back = 0 destinatari, oggi.** Nessuno ha mai completato un ordine → nessuno può
> essere "riattivato". I 23 profili sono **iscritti mai attivati**: il loro caso è un **nudge di
> ATTIVAZIONE** (primo ordine), **non** un win-back — un altro flusso, un altro momento. **Non gonfio
> la lista**, non tratto un iscritto-mai-comprato come un dormiente. **Non invento destinatari.**
>
> 🔒 **L'unico buyer reale (samir)** ha carrello abbandonato + ordine annullato ed è **già coperto** dal
> flusso recupero-carrelli (A3 / #26). Un secondo touch win-back sullo stesso identico e unico cliente
> sarebbe un doppione (AR-008) e fatigue puro → **qui NON lo tocco.**

### Il trigger che farà comparire il primo dormiente reale
```
Precondizione a monte:  ordine #21 (Pane Quotidiano) CONSEGNATO + PAGATO
                        └─ da lì quel cliente ha "1 ordine completato" ⇒ diventa idoneo al win-back
Trigger di ingresso:    quel cliente resta 14 giorni SENZA nuovo ordine
                        └─ query "ultimo ordine per cliente" ≥ 14gg fa E >0 ordini completati
Uscita immediata:       riordina, oppure si disiscrive, oppure incentivo già usato una volta
```
Finché la precondizione non è vera, **la coorte è vuota e il flusso resta a riposo.**

---

## 2) Sequenza win-back (copy finita, pronta — riusa/raffina FLUSSI §4)

> `[Nome]` e `[Bottega]` sono **segnaposti evidenti**: si popolano dal profilo/ordine reale al momento
> dell'invio, mai a mano, mai inventati. Nessun numero di riattivazione qui: non ho ancora un dato
> storico e **non lo fingo** (target atteso dichiarato in §5, marcato come stima onesta senza base locale).

### ✉️ Touch #1 — giorno 14 · "ci manchi", SENZA sconto · 🟡

**Oggetto:** [Nome], è un po' che non ti portiamo niente 💛
**Preheader:** La tua bottega di quartiere è ancora qui. Quando vuoi, te la riporto a casa.

> Ciao [Nome],
>
> è un paio di settimane che non ci vediamo, e un po' si sente.
>
> **[Bottega]** è sempre lì, a due passi, e prepara tutto fresco come l'altra volta. Ti va di
> riprovare? Ti basta un minuto: scegli, riempi il carrello, e te lo portiamo a mano nel quartiere —
> paghi anche alla consegna, se preferisci.
>
> 👉 [Torna da [Bottega]](https://mycity-marketplace.com)
>
> E se la prima volta qualcosa non ti aveva convinto — la consegna, gli orari, un prodotto — **dimmelo
> rispondendo a questa mail**: lo leggo io e voglio fare meglio. Le botteghe del centro le teniamo
> aperte solo se torni anche tu. 💛
>
> A presto,
> Nicola — MyCity
> *Il marketplace delle botteghe di Piacenza*
>
> *MyCity, Piacenza · [Disiscriviti]*

*Colore:* 🟡 — email relazionale, **zero incentivo in denaro**. Costo: **€0**.

---

### ✉️ Touch #2 — giorno 21 · CON incentivo · 🔴 (parte SOLO se ancora 0 ordini)

**Oggetto:** [Nome], la prossima consegna la offro io 🚲
**Preheader:** Un piccolo pensiero per rivederti tra i vicini di MyCity.

> Ciao [Nome],
>
> non voglio insistere — solo dirti che mi piacerebbe rivederti tra i vicini di MyCity.
>
> Per convincerti a riprovare: **il prossimo ordine te lo consegno io, offerto.** Scegli **[Bottega]**,
> riempi il carrello, al resto pensiamo noi.
>
> 👉 [Torna da [Bottega] — consegna offerta](https://mycity-marketplace.com)
>
> *(In alternativa, se preferisci fare la spesa più grande: con il codice **SPED5** hai la consegna
> gratis sopra i 25€. Uno dei due, quello che ti conviene di più.)*
>
> E se non fa per te, nessun problema: con un clic qui sotto ti tolgo dai promemoria. Ma se ci dai
> un'altra possibilità, [Bottega] (e io) ti aspettiamo.
>
> Nicola — MyCity
>
> *MyCity, Piacenza · [Disiscriviti]*

*Colore:* 🔴 — **muove costo reale** (vedi §3). **Una volta per cliente.** Firma Nicola.

---

### 📞 Touch #3 — script telefonata breve · SOLO clienti con ≥2 ordini storici · 🟡

> Per customer-success/Nicola. <60 secondi. Naturale, mai da venditore. (Oggi 0 clienti idonei:
> serve ≥2 ordini completati storici — arma per il futuro.)

> **Apertura:** "Ciao [Nome], sono Nicola di MyCity — quello che ti porta la spesa da [Bottega]. Ti
> rubo trenta secondi, eh."
>
> **Cuore:** "Ho visto che è un po' che non ordini e volevo solo sentire se era andato tutto bene
> l'altra volta… c'era qualcosa che potevo fare meglio?"
>
> → *Se problema:* "Hai ragione, scusami — lo sistemo. La prossima consegna te la offro io per
> rifarmi." (annota → @supporto)
> → *Se "non ci ho pensato":* "Ci sta! Guarda, questo weekend da [Bottega] c'è roba fresca. Se ti va
> te la porto io — consegna offerta. Ti preparo l'ordine o fai tu dall'app?"
>
> **Chiusura:** "Perfetto, grazie davvero — è gente come te che tiene aperte le botteghe del centro.
> A presto!"

*Colore:* 🟡 (la "consegna offerta" promessa a voce diventa 🔴 quando la si concede → stesso cap §3).

---

## 3) Incentivo ENTRO BUDGET — vincolo duro (crm budget = €0)

Budget CRM = **€0** · ogni incentivo in denaro = **🔴 firma Nicola**. Quindi **NIENTE coupon nuovo,
NIENTE cash nuovo.** Solo leve **già esistenti** e margin-safe:

| Leva | Cos'è | Costo max stimato / invio | Colore | Vincolo |
|---|---|---|---|---|
| **Consegna offerta sull'ordine di rientro** | assorbo io il costo logistico della consegna del riordino | **~€4** (cap consegna in zona) | 🔴 | 1 volta per cliente, solo touch #2 / telefonata |
| **Coupon `SPED5`** (già in DB) | consegna gratis sopra €25 di spesa | **€5** ma **solo se lo scontrino supera €25** (auto-selezione: chi spende poco non lo attiva) | 🔴 | già attivo in `coupons`, nessun nuovo coupon |

> ⚠️ **`BENVENUTO10` NON si usa** in win-back: è `first_order_only=true` → non valido per un cliente
> di ritorno. Escluso a monte.
>
> 💡 **Perché queste due e non "-15% a tutti":** premiano **solo** chi torna davvero (incrementale), non
> regalano margine a chi sarebbe rientrato da sé. `SPED5` è **auto-limitante** (si sblocca solo sopra
> €25 → alza anche lo scontrino invece di eroderlo). La consegna offerta ha un **cap** e un **1-per-cliente**.
> **Costo massimo di programma = €4–5 per riattivazione**, e solo su chi arriva vivo al touch #2.

---

## 4) Gate / pre-condizioni all'invio — TUTTE vere o resta in coda

| # | Gate | Stato oggi | Chi sblocca |
|---|---|---|---|
| a | Esiste **≥1 dormiente reale** (≥1 completato + 14gg fermo) | ❌ **NO** (0 ordini completati) | dipende da #21 consegnato + 14gg |
| b | **Consenso marketing** verificato sul destinatario | ❌ da verificare (samir = `email_marketing=false`; presumo gran parte dei 23 idem) | @legale-privacy (transazionale vs marketing) |
| c | **Mani Resend** attive (`RESEND_API_KEY`) | ❌ spente | @builder-automazioni |
| d | **Incentivo firmato** da Nicola (touch #2 / telefonata) | ❌ da firmare | Nicola 🔴 |

> **Finché anche uno solo di questi è ❌ → nessun invio.** Oggi sono ❌ tutti e quattro, a partire dal
> primo: **non c'è nessuno da riattivare.** Questo file resta un DRY-RUN in attesa del trigger.

---

## 5) Metrica attesa (stima onesta, senza base locale)

- **KPI del flusso:** % riattivazioni a 7gg dall'invio. **Target di riferimento ≥10%** (benchmark di
  categoria da FLUSSI §metriche — **NON un dato MyCity**: storico locale = 0 invii, 0 riattivazioni).
- **Misura incrementale, non lorda:** quando la coorte esisterà, tenere un **holdout** (~10-20% non
  contattato) per stimare quanti sarebbero tornati comunque. Il numero che conta è il **delta**, non il
  fatturato lordo del flusso.
- **Loop:** al primo invio reale, scrivere l'esito (segmento, incrementale, costo/riattivazione) in
  `memoria-squadra/crm-lifecycle.md`.

---

## ✅ Cancello onestà (auto-verifica)
- [x] **0 numeri finti** — ogni cifra ha fonte (MCP 6/7 11:11 / STATO / DB coupon); i target sono
      marcati come benchmark esterni, non dati MyCity.
- [x] **0 destinatari inventati** — segmento dichiarato VUOTO; `[Nome]`/`[Bottega]` sono segnaposti evidenti.
- [x] **Anti-doppione** — samir escluso (già in recupero-carrelli #26).
- [x] **Budget** — €0 rispettato: nessun coupon nuovo, solo `SPED5`/consegna offerta, cap €4–5, 🔴.
- [x] **Colore** — email #1 🟡 · incentivo #2 🔴 · telefonata 🟡→🔴 sull'offerta.
- [x] **Nessun invio** — DRY-RUN, 4/4 gate chiusi.
