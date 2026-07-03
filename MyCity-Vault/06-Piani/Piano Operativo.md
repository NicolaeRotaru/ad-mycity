# 🚲 PIANO OPERATIVO / CONSEGNE 2026 (Operations & Logistica)

> Base dati: [[Operazioni & Logistica]], [[Finanza & Unit Economics]], [[Rischi & Compliance]].
> **Filosofia:** non sei food-delivery on-demand, sei **micro-logistica urbana con batching giornaliero**. Ogni decisione massimizza gli **ordini-per-giro** (è lì che nasce il margine).
> **Punto di partenza reale (25/06/2026):** ~1 negozio, ~0 ordini. Il piano deve far funzionare i **primi ordini in modo impeccabile** (in una città piccola una brutta consegna gira veloce, una perfetta crea fiducia e passaparola), poi **scalare con la densità**, non allungando i giri.
> **Onestà:** sotto i 2 ordini/giro la consegna **perde soldi** (CM −€0,07). Il margine non si trova ottimizzando la singola corsa, ma **accumulando densità nel cluster centro**. Finché la densità non c'è, i primi ordini sono **concierge fatti dal fondatore-rider**: validazione, non scala.

> 🔑 **Regola d'oro operativa:** consegne **DENSE** (solo cluster centro, 200-400 m), domanda fuori cluster in **lista d'attesa per quartiere**. Mai allungare un giro per accontentare un ordine isolato.

---

## 1. OBIETTIVO & MISURA

**Cosa deve fare bene questo piano:** consegnare la spesa delle botteghe del centro **puntuale, fredda quando serve, completa**, a un **costo per consegna sotto controllo** — partendo da pochissimi ordini e reggendo quando crescono.

**KPI operativi (nord-stella: ordini/giro):**
| KPI | Soglia minima | Target a regime | Come lo misuro |
|---|---|---|---|
| **Ordini per giro** (nord-stella) | ≥2 (sotto NON esci) | **18-25** | `orders` raggruppati per slot/giro |
| **On-time** (consegna nello slot) | ≥90% fase concierge | **≥95%** | `delivered_at` vs slot promesso |
| **Tempo di consegna** (ritiro→porta) | <120 min | **<90 min** | `delivered_at` − ora ritiro |
| **% ordini OK** (completi, no reclami) | ≥95% | **≥98%** | ordini senza reso/reclamo / totali |
| **Fill rate** (prodotti consegnati/ordinati) | ≥95% | ≥97% | righe consegnate / righe ordinate |
| **Costo per consegna** | — | **<€3,5** | costo rider+packaging / n. consegne |
| **Excursion freddo** (catena del freddo rotta) | 0 | **~0%** | checklist temperatura |

➡️ *Prossima azione:* prima del primo ordine vero, blocca questi 7 numeri come **cruscotto settimanale** (anche in foglio manuale finché il dispatch non è automatizzato). Senza misura non distingui un incidente singolo da un problema strutturale.

---

## 2. IL MODELLO DI CONSEGNA (cut-off serale → D+1)

**Modello temporale:**
- **Ore 21:00 — cut-off ordini.** 21:30 "order freeze": il sistema aggrega per bottega e invia le **liste-bottega** (ogni negozio stasera sa cosa preparare domani).
- **Giorno dopo (D+1):** ritiro botteghe nelle finestre carico/scarico ZTL (**8-9 / 13-14**), consolidamento all'hub, **giri AM 9:30-12:30** e **PM 14:00-18:00**.
- *Perché cut-off serale:* dà alle botteghe il tempo di preparare e mi permette di **raggruppare** prima di muovermi (densità).

**Slot di consegna (Ocado-style, slot pricing leggero 🟢):**
| Slot | Finestra | Fee | Logica |
|---|---|---|---|
| AM | 9:30-12:30 | gratis/ridotta | sposto qui la domanda flessibile |
| PM | 14:00-18:00 | gratis/ridotta | giro di punta pomeriggio |
| Punta (futuro) | sera/venerdì | piccola fee | sposto domanda dove ho capacità |

**Mezzo: 🟢 cargo-bike elettrica** (3-4 ruote, payload 100-200 kg). Accesso ZTL 8-19 garantito ai mezzi elettrici → consegno tutto il giorno; pedonale OK; cluster 200-400 m = distanze risibili. **Costo ~€0,10/parcel** vs €1,05 van. Backup: **trolley isotermico a piedi** (maltempo/guasto).

**Micro-hub (cross-docking, non magazzino):** 10-15 m² ai margini ZTL, baricentrico sulle 3 vie, cassette numerate per ordine. **Nei primi giorni l'hub È il cassone della cargo-bike**, finché non superi ~12 ordini/giorno.

**Catena del freddo (🔴 rischio #1):** 3 zone (0-4°C / congelato / ambiente), **packaging passivo a PCM** (gel pack), separazione caldo/freddo, **checklist temperatura al ritiro**. Transito <2h grazie al batching → il passivo basta in v1.

➡️ *Prossima azione:* fissa per iscritto cut-off 21:00 + i 2 slot AM/PM e mettili visibili in checkout (📌 è un impegno verso il cliente → vedi §9, il testo va in revisione).

---

## 3. IL FLUSSO ORDINE → CONSEGNA

| # | Step | Quando | Chi | Output / controllo |
|---|---|---|---|---|
| 1 | **Ordine cliente** | entro 21:00 | cliente | ordine in `orders`, slot scelto |
| 2 | **Order freeze + liste-bottega** | 21:30 | sistema | una lista per ogni bottega (cosa preparare) |
| 3 | **Preparazione in bottega** | sera/mattina | negozio | ogni prodotto in **sacchetto etichettato col codice-ordine #1042** |
| 4 | **Ritiro botteghe** | finestre ZTL 8-9 / 13-14 | rider | **checklist temperatura** al ritiro (freddo) |
| 5 | **Consolidamento hub** | dopo il ritiro | rider/hub | raggruppamento per codice-ordine (no picking) |
| 6 | **Pianificazione giro** | prima di partire | dispatch | sequenza fermate per densità (via/quartiere) |
| 7 | **Giro di consegna** | slot AM/PM | rider | cargo-bike, ordine per ordine |
| 8 | **Consegna alla porta** | nello slot | rider | `delivered_at` registrato, verifica 18+ se alcolici |
| 9 | **Post-consegna** | dopo | CS/supporto | feedback primo ordine, gestione eccezioni |

**Decisione chiave (già presa):** **la BOTTEGA divide per ordine, non il rider.** Il prodotto esce già in sacchetto etichettato col codice-ordine → all'hub è semplice raggruppamento, non picking → scala oltre i 15-20 ordini/giorno.

➡️ *Prossima azione:* stampa le **etichette codice-ordine** e consegna a Garetti il mini-protocollo "metti ogni ordine in un sacchetto con questo codice" (è il singolo gesto che fa scalare l'operatività).

---

## 4. BATCHING & DENSITÀ (la densità è sopravvivenza)

**Il conto che decide tutto** (da [[Finanza & Unit Economics]]): il costo rider per giro è ~€7; spalmato su pochi ordini affonda il margine.
| Ordini/giro | Costo rider/ordine | **CM/ordine** |
|---:|---:|---:|
| 1 | €7,00 | **−€0,07** 🔴 perde |
| 2 | €3,50 | **+€3,43** |
| 3 | €2,33 | **+€4,60** |
| 5 | €1,40 | **+€5,53** |

**Regole di batching:**
- **Soglia minima: ≥2 ordini/giro o NON consegni** (sotto, accumuli al giorno dopo — il modello D+1 lo tollera). Soglia operativa di "uscita piena": 10 ordini/giorno nel cluster.
- **Densità per via/quartiere:** raggruppo gli ordini geograficamente (stesse 3 vie centro), sequenzio le fermate per minimizzare i metri. Target a regime 18-25 ordini/giro.
- **Slot pricing leggero 🟢:** slot poco richiesti gratis, slot di punta con piccola fee → sposto la domanda dove ho capacità.
- **Mai allungare i giri esistenti** per un ordine isolato fuori cluster → va in lista d'attesa per quartiere.

➡️ *Prossima azione:* delega a **@dispatch** la regola di batching per via/quartiere e a **@finanza** il monitoraggio del **CM per consegna** (non del GMV): è la metrica che dice se un giro va fatto o rimandato.

---

## 5. COPERTURA RIDER & PICCHI

**Capacità reale:** il fondatore-rider regge **~20-25 ordini/giorno**; il collo di bottiglia NON è la pedalata ma **ritiro + consolidamento + customer service**.

**Gestione picchi (pranzo/cena/weekend):**
| Picco | Rischio | Mitigazione |
|---|---|---|
| Punta pomeriggio | giro PM sovraccarico | **cap ordini/slot** + slot pricing |
| Venerdì / pre-weekend | spesa settimanale concentrata | apri slot extra, sposta domanda su AM |
| Maltempo | consegna lenta/rischio freddo | **trolley a piedi** + slittamento (D+1 lo tollera) |
| Assenza fondatore (bus factor 🔴) | business si ferma | rider backup formato + 3PL jolly d'emergenza |

**Scala = replica cluster-per-cluster** (ogni cluster: micro-hub + 5-15 botteghe in 400 m + cargo-bike + hub master). 100 negozi ≈ 7-10 cluster. **Primo hire = "hub master"** (toglie il lavoro cognitivo del consolidamento), POI i rider.

➡️ *Prossima azione:* prepara (NON firmare) la **soglia ordini/giorno oltre cui si assume il 1° rider** e una **bozza di turno tipo** AM/PM. L'assunzione vera è 🟡/🔴 (contratto + INAIL + HACCP, §8) → va in coda.

---

## 6. I PRIMI ORDINI CONCIERGE (cura maniacale)

In una città piccola **i primi 20-30 ordini valgono più di mille euro di ads**: ogni consegna perfetta è un testimonial, ogni errore un danno reputazionale che gira. Finché la densità non c'è, **li gestisce il fondatore-rider, a mano, con cura ossessiva.**

**Playbook del primo ordine concierge:**
1. **Conferma proattiva** appena ordinato: "ciao, sono [nome] di MyCity, domani porto la tua spesa da Garetti nello slot [X]". (Testo in revisione, §9.)
2. **Controllo qualità al ritiro:** freschezza, completezza, temperatura — il rider verifica in bottega (riduce reclami B7).
3. **Consegna curata:** puntuale nello slot, packaging in ordine, un grazie a voce.
4. **Follow-up post-consegna:** chiamata/messaggio di feedback ("tutto bene? la frutta era come volevi?") → raccolta recensione + segnale precoce di problemi.
5. **Recupero impeccabile** se qualcosa va storto: scusa immediata + rimedio (rimborso/riconsegna) prima che il cliente debba chiederlo.

➡️ *Prossima azione:* coordina con **@customer-success** il **concierge del primo ordine** e con **@supporto** le risposte pronte ai casi tipici. Obiettivo: i primi 10 ordini chiusi a **% OK 100%**.

---

## 7. ECCEZIONI & PIANO B (non bloccarsi, escalare)

> Principio: l'operatività non si ferma mai per un imprevisto. Applica il piano B, **poi** avvisa con una proposta.

| Eccezione | Piano B immediato | Escalation |
|---|---|---|
| **Bottega in ritardo / non pronta** | salta il ritiro, consegna il resto, riconsegna il mancante nello slot dopo | SLA bottega + scoring; reiterato → @account-negozi |
| **Ordine/prodotto mancante** | avvisa il cliente PRIMA che se ne accorga, rimborsa la riga, offri alternativa | se ricorrente → problema strutturale, nota in Briefing |
| **Catena del freddo a rischio** (transito lungo/caldo) | NON consegnare il deperibile a rischio, rimborsa/riprogramma, mai consegnare cibo dubbio | 🔴 rischio legale → blocca e segnala |
| **Maltempo / guasto cargo-bike** | trolley isotermico a piedi; se impraticabile, slitta a D+1 (avvisa il cliente) | guasti ripetuti → backup mezzo |
| **Assenza rider (bus factor)** | rider backup; in emergenza 3PL jolly | 🔴 strutturale → accelera l'hire |
| **Sotto soglia 2 ordini/giro** | accumula al giorno dopo (D+1 lo tollera), avvisa i clienti dello slittamento | se cronico → problema di densità, leva marketing |

**Distinzione che fai sempre:** *incidente singolo* (gestisci e chiudi) vs *problema ricorrente* (→ nota in `90-Memoria-AI/Briefing/` + proposta strutturale all'AD).

➡️ *Prossima azione:* riusa/aggiorna `MyCity-Vault/07-Agenti/PLAYBOOK-ECCEZIONI.md` con queste 6 righe operative, così la squadra non si blocca.

---

## 8. HACCP & SICUREZZA ALIMENTARE (bozze; validità finale umana 🔴)

Trasporto di carne/pesce/latticini = Reg. CE 852/853/2004 e D.Lgs. 193/2007. È il **rischio #1 legale/reputazionale**: le sanzioni alimentari scattano **a prescindere dal fatturato**.

**Cosa serve PRIMA della prima consegna di deperibili (🔴 — non opzionale):**
- Contenitori isotermici pro + gel/PCM; catena del freddo 0/+4°C, surgelati ≤−18°C.
- **Attestato HACCP per chi consegna** (anche per il fondatore-rider).
- **Manuale HACCP** con tempi max di consegna (finestre strette) + **registro pulizia** + **checklist temperatura al ritiro**.
- **Notifica/SCIA alla ASL di Piacenza**; 🟡 confermare con ASL idoneità contenitori e se serve registrazione come OSA.
- Verifica **18+** in checkout e alla consegna per alcolici (la licenza UTF è abolita dal 1/1/2026; vende l'enoteca già in regola).

➡️ *Prossima azione:* delega a **@legale-privacy** la **bozza di manuale HACCP + checklist temperatura + testo notifica ASL** (consegna in `consegne/`). La **validità finale è umana 🔴**: serve la firma di Nicola e, dove indicato, di un professionista.

---

## 9. REGOLE 🟢🟡🔴 (cosa faccio io, cosa aspetta la firma)

| Azione | Colore | Chi |
|---|---|---|
| Pianificare slot, batching, sequenza giri, cruscotto KPI | 🟢 | operations / dispatch (esegue) |
| Scrivere playbook, protocolli bottega, bozze HACCP/checklist | 🟢 | operations / legale (bozza) |
| Preparare il **testo** dei messaggi a cliente/bottega/rider | 🟢 → poi 🟡 | scrivo, ma l'invio è 🟡 |
| **Inviare messaggi reali** a clienti/rider/botteghe | 🟡 | accodo in `AZIONI-IN-ATTESA.md`, firma Nicola |
| **Assumere/ingaggiare un rider** (contratto, INAIL, HACCP) | 🔴 | proposta + firma Nicola + consulente lavoro |
| **Impegni di consegna reali** (SLA promesso al cliente in checkout) | 🟡/🔴 | va validato prima di pubblicare |
| Notifica ASL, registrazione OSA, contratti | 🔴 | firma umana / professionista |

> Nel dubbio salgo di colore. **Mai sorprese:** prima mostro cosa farei, poi (al via) si esegue.

---

## ✅ LE 5 AZIONI DI QUESTA SETTIMANA (operatività pronta per i primi ordini da Garetti)

1. **Cruscotto KPI operativo** (§1): foglio con i 7 numeri (ordini/giro, on-time, tempo, % OK, fill rate, costo/consegna, excursion freddo) pronto a registrare il primo ordine. 🟢
2. **Protocollo bottega + etichette codice-ordine** (§3): consegna a Garetti il gesto "ogni ordine in un sacchetto etichettato" + stampa etichette. 🟢
3. **Playbook concierge del primo ordine** (§6) coordinato con @customer-success e @supporto: obiettivo primi 10 ordini a % OK 100%. 🟢
4. **Bozza HACCP** (§8): manuale + checklist temperatura al ritiro + testo notifica ASL → @legale-privacy, in `consegne/`, per firma Nicola. 🟢 (la validità è 🔴)
5. **Pacchetto "impegni di consegna"** pronto per la firma (§9): testo cut-off 21:00 + slot AM/PM + messaggio di conferma al cliente → **accodato in `AZIONI-IN-ATTESA.md`** (l'invio/pubblicazione è 🟡, aspetta Nicola).

---

*Effetto atteso sui KPI:* primi ordini chiusi a **% OK ~100%** e **on-time ≥90%** (fiducia + passaparola), batching che porta il **CM/ordine da −€0,07 a +€3,4** già dal 2° ordine/giro, **0 excursion freddo**. La leva di crescita resta la **densità nel cluster centro**, non l'allungamento dei giri.

#operazioni #logistica #consegne #piano #coo #piacenza #priorità/alta

<!-- 🤖 AD-AGGIORNAMENTO:START · non scrivere qui dentro: lo rigenera l'AD a ogni giro -->
## 🤖 Aggiornamento dell'AD — 2026-07-03 06:28
> Proposte 🟡 dall'auto-analisi (radar / Intelligence / briefing). NON riscrivono il piano sopra: spunti da validare.
- **Stallo ~214h** — 3 finestre 2/7 saltate. **Meteo di oggi ri-verificato LIVE: sereno 20→33°C con ALLERTA AFA nel pomeriggio** → la finestra consegna per i freschi è **la mattina**: eseguire **#20→#22 stamattina**, accorpato al payout-test (una sola finestra certa, prima del caldo).
- **Oggi è Venerdì Piacentini** — centro pieno tutto il giorno: facilita il ritiro PQ in Via Calzolai (nessun presidio, rimandato).
- **SQL 107** — 30s, prerequisito consegne batch 6/7 (dom 6/7, previsto ~37° → **gate catena del freddo** obbligatorio per i freschi, GATE-COMPLIANCE-PRELANCIO già pronto).
<!-- 🤖 AD-AGGIORNAMENTO:END -->
