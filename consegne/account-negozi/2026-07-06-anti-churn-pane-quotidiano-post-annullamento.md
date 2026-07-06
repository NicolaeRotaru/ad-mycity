---
tipo: deliverable-anti-churn
reparto: account-negozi
data: 2026-07-06 12:40
negozio: Pane Quotidiano (bio/dietetica dal 1976, Via Calzolai 25, Piacenza)
seller: c0b240c0… · tel 0523 388601
livello: 🟢 bozza libera · 🔴 la telefonata reale al titolare si ACCODA (firma Nicola)
azione-collegata: coda #21 (ordine-prova pulito su PQ → payout-test) in AZIONI-IN-ATTESA
supersede: 2026-07-04-anti-churn-standalone-pane-quotidiano.md (A9) · A6 (blocco #25)
fonte-dati: LIVE AD 6/7 11:11 — ordine #16 (58094956…, COD €19,05) ANNULLATO 3/7 15:38 · 0 ordini completati · payout OFF
---

# 💚 Anti-churn Pane Quotidiano — versione POST-ANNULLAMENTO (6/7)

> Scopo in una riga: **tenere dentro l'unico negozio reale di MyCity dopo che il suo primo ordine
> è stato annullato**, prendendoci la responsabilità del rodaggio e ripartendo subito con un
> ordine-prova pulito che porti la North Star da 0 a 1 — senza mai dirgli una cosa falsa.

⚠️ **Questo file SOSTITUISCE lo script del 4/7.** Lo script vecchio (A9 standalone + A6) diceva al
titolare che «il primo ordine sta tardando ad arrivare» / «oggi lo chiudiamo». **Non è più vero:**
l'ordine #16 è stato **ANNULLATO il 3/7 alle 15:38** nel database — mai accettato, mai consegnato.
Leggere quello script al telefono significherebbe **mentire al negoziante** (l'ordine non è in
consegna, è morto). Vedi §5 "Supersession".

---

## 1) Diagnosi onesta

- **Non esiste una coorte di churn.** Su MyCity c'è **1 solo negozio reale** (Pane Quotidiano). I 407 lead
  sono negozi mai contattati, non attivi: non possono "churnare". Casa Linda è demo/seed. Con un negozio
  solo il churn **non si misura sul trend −X%** (non c'è una serie storica da confrontare): si misura sul
  **time-to-first-value** — quanto ci mette il negozio a incassare la prima volta.
- **PQ è comunque a rischio churn MASSIMO.** Due segnali che si sommano: (a) **no-value-realized da ~12
  giorni** (0 ordini completati, 0 incassi, payout OFF dall'attivazione); (b) il suo **unico ordine è stato
  annullato** senza mai arrivare al cliente. Dal punto di vista del titolare la storia che si racconta è la
  peggiore possibile: *"mi sono iscritto, è arrivato un ordine, è saltato, non ho visto un euro — qui non
  vendo, mollo."* Se PQ molla, i negozi reali di MyCity vanno a **0**: massima concentrazione di rischio su
  un solo account.
- **La causa è nostra, non sua.** Il catalogo è a posto (bio dal 1976, prodotti caricati), il negozio ha
  fatto la sua parte. Il fermo e l'annullamento dipendono dalla **logistica del nostro rodaggio**, non da un
  problema di Pane Quotidiano. Questo va detto chiaro e senza scuse ipocrite.

---

## 2) La leva (una sola, chiara)

**Ripartire con un ordine-prova PULITO su PQ** — accetta → consegna → payout-test — per portare la North
Star 0→1 su un negozio reale. Si aggancia direttamente alla **coda #21** già in AZIONI-IN-ATTESA
(@onboarding-negozi/@finanza: "Fai un primo ordine di prova su PQ e attiva il payout-test").
Non uno sconto, non una promessa di volume: **un ciclo end-to-end che funziona davvero**, così il titolare
vede per la prima volta i soldi arrivare al suo conto. Il modo migliore di trattenerlo è farlo incassare.

---

## 3) SCRIPT TELEFONATA di riattivazione — AGGIORNATO 🔴

> Canale: telefono **0523 388601** (negozio, Via Calzolai 25).
> Chi chiama: **Nicola / account manager — NON il rider.**
> Tono: persona vera, onesta, breve. Il titolare deve sentirsi **scelto e seguito**, non gestito.
> Regola d'onestà: NON dire che l'ordine è "in consegna" o "lo chiudiamo oggi" — è stato annullato.

«Buongiorno, sono Nicola di MyCity — quello del vostro negozio online, Pane Quotidiano. Ho due minuti da
rubarvi, niente di che.

Volevo dirvi una cosa di persona, con onestà. Quel primo ordine che vi era arrivato **l'abbiamo dovuto
annullare**: in questi primi giorni stiamo ancora rodando le consegne e non siamo riusciti a chiuderlo come
si deve. **La colpa è nostra, tutta dal lato nostro** — non del vostro negozio, che è a posto: il catalogo è
caricato, il bio c'è, avete fatto la vostra parte. Non voglio che pensiate che qui non si vende: il problema
era la nostra logistica, e lo stiamo sistemando.

Vi ho scelti come **primo negozio di Piacenza** per un motivo preciso, e ci tengo a dirvelo: il vostro bio,
quello vero **dal 1976**, portato a domicilio in città, **non lo fa nessun altro qui**. È esattamente quello
che voglio far vedere a Piacenza. Per questo non voglio partire male con voi.

Allora facciamo così, se siete d'accordo: **ripartiamo da zero con un ordine di prova pulito**, seguito da me
passo passo — lo accettate voi, lo consegniamo noi come si deve, e questa volta **arriva anche il pagamento
sul vostro conto**, così vedete che il giro funziona per davvero. Zero rischi per voi, ci metto la faccia io.

Vi va? Quando siete comodi in negozio nei prossimi giorni, così lo facciamo insieme?»

**[se il titolare è freddo / deluso dall'annullamento]**
→ «Vi capisco, e avete ragione ad essere scocciati — l'ordine saltato è colpa nostra e me la prendo io. Proprio
per questo non vi lascio in sospeso: l'ordine di prova lo seguo personalmente dall'inizio alla fine, voi non
dovete rincorrere niente. Datemi una possibilità di farvi vedere il giro fatto bene.»

**[se chiede "e chi mi garantisce che stavolta funziona?"]**
→ «Giusto chiederlo. La differenza è che stavolta lo seguo io in prima persona, un ordine solo, controllato:
serve proprio a verificare che consegna e pagamento filino lisci prima di aprire il rubinetto. Se qualcosa non
va, lo vedo io e lo sistemo io — non lo scaricate voi.»

**[chiusura]**
→ «Grazie della pazienza in questo avvio. Siete il negozio da cui voglio partire, e ci tengo a fare le cose
per bene. Vi risento a strettissimo giro per l'ordine di prova. A presto.»

> ❌ Da NON dire mai: "l'ordine è in consegna", "lo chiudiamo oggi", "il cliente lo sta ricevendo",
> qualsiasi numero di vendite/volume, qualsiasi testimonianza di altri negozi (non esistono). Solo il vero:
> bio dal 1976, contratto 12%, rodaggio nostro, ordine annullato, ordine-prova pulito.

---

## 4) VARIANTE WhatsApp / in-app (backup — se non risponde al telefono)

Buongiorno, sono Nicola di MyCity 👋 (quello di Pane Quotidiano online).
Vi scrivo con onestà: quel primo ordine **l'abbiamo dovuto annullare** — in questi primi giorni stiamo
rodando le consegne e non l'abbiamo chiuso come si deve. **La colpa è nostra, non del vostro negozio**, che è
a posto (catalogo caricato, tutto ok).
Vi ho scelti come primo negozio di Piacenza perché il vostro bio **dal 1976**, portato a domicilio, non lo fa
nessun altro qui — e voglio partire bene con voi, non male.
Proposta: **ripartiamo da zero con un ordine di prova pulito**, che seguo io passo passo — lo accettate voi,
lo consegniamo noi, e stavolta arriva anche il pagamento sul vostro conto, così vedete che il giro funziona.
Zero rischi per voi. Quando siete comodi in negozio nei prossimi giorni lo facciamo insieme? 🌾

---

## 5) Follow-up POST-prima-consegna (aggancio ad A7 — NON parte ora)

> ⛔ Parte **solo DOPO** che l'ordine-prova (coda #21) è stato **realmente consegnato e il payout-test è
> arrivato**. Non anticipare l'upsell finché non c'è un valore reale in tasca: sarebbe di nuovo raccontare
> una cosa che non è ancora successa.

Quando il primo ciclo è chiuso davvero:
1. **Telefonata di conferma valore** (+2 min): «Visto? Il giro ha funzionato, il pagamento è arrivato. Da qui
   partiamo per davvero.» — chiude il loop emotivo dell'annullamento con un fatto reale.
2. **A7 upsell catalogo** (bozza 🟢, esecuzione dopo): 2-3 prodotti-civetta bio in vetrina + spinta social →
   costruire il flusso settimanale. Solo sul catalogo che ha già. Nessuna promessa di volume: si propone, si
   misura.
3. Da lì il negozio entra nel giro settimanale di health-score/check-in (quando ci saranno >1 negozi reali il
   trend −40% torna misurabile e l'health-score torna un ranking, non un override su singolo account).

---

## 6) Nota di SUPERSESSION (A6 e A9 → STALE)

Le seguenti azioni sono **marcate STALE**: la loro premessa ("ordine #16 in consegna / in ritardo, lo
chiudiamo oggi") è **morta** — #16 è stato ANNULLATO il 3/7 15:38. **Questo nuovo script le sostituisce.**

| Azione | Dov'era | Premessa (ora falsa) | Stato |
|---|---|---|---|
| **A6** | blocco #25 · playbook 4/7 | Check-in retention SULLA chiamata operativa #21 «oggi chiudiamo il vostro primo ordine e vi porto il cliente» | 🚫 **STALE** — non esiste più una consegna #16 da chiudere. Il check-in retention è assorbito da §3 di questo file. |
| **A9** | `2026-07-04-anti-churn-standalone-pane-quotidiano.md` | Telefonata «il primo ordine sta tardando ad arrivare» | 🚫 **STALE** — l'ordine non sta arrivando, è stato annullato. Sostituita da §3 di questo file. |
| **A7** | blocco #25 | Upsell post-prima-consegna | ✅ **ANCORA VALIDA ma differita** — vedi §5. Parte solo dopo la consegna reale dell'ordine-prova (coda #21). |

> Azione richiesta lato coda: chi processa AZIONI-IN-ATTESA deve trattare A6/A9 come superate da questo
> deliverable e agganciare la telefonata di riattivazione (§3) alla ripartenza dell'ordine-prova (coda #21).

---

## 7) Effetto atteso sui KPI (stima onesta)

- **Retention negozi reali:** mantiene **1/1** (evita che l'unico faro reale vada a 0 dopo l'annullamento —
  la finestra di rischio è ORA, non "tra qualche giorno").
- **North Star 0→1:** la telefonata è il gancio umano che sblocca l'ordine-prova (coda #21) → primo incasso
  reale su un negozio + primo payout-test validato (mai successo finora).
- **Metrica onesta:** non muove GMV oggi (è una telefonata). Muove la **probabilità di sopravvivenza** del
  faro e apre la strada al primo valore realizzato. È difesa + riattivazione; l'espansione (A7) arriva dopo,
  su fatti veri.
