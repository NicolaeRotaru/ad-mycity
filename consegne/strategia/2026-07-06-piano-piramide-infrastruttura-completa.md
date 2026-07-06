---
tipo: piano
titolo: Il Piano della Piramide — costruire l'infrastruttura completa (53 Capacità)
data: 2026-07-06 13:04
revisione: 2026-07-06 13:30 — passato dal panel avversariale a 3 lenti (realismo · costituzione · sequenza), verdetto unanime «solido-con-correzioni», ~30 correzioni applicate
fonte: AD digitale — sessione di visione con Nicola del 6/7/2026
stato: bozza 🟡 — diventa la rotta solo con la firma di Nicola
riferimenti: MyCity-Vault/00-Blueprint-MyCity-OS.md · STATO.md · cantiere-difetti.json · sensori-cecita.json · calibrazione.json
---

# 🏗️ Il Piano della Piramide

> **In una frase:** da dove siamo oggi (1 negozio reale, 0 consegne completate, salute macchina 44/100 —
> provvisoria 50 pending-merge; la completa del 2/7 dava 42) fino all'infrastruttura di civiltà —
> l'azienda-organismo con la città come corpo — costruita **dal basso**, un piano alla volta, con ogni
> piano che si guadagna e si paga il successivo.
>
> ⏱️ **Numeri all'ultima misura reale: 4/7 22:20** (REST + ledger sensori). Da ri-misurare al primo giro
> prima della firma: tra il 4/7 e oggi la macchina non ha ri-letto i sensori.
>
> Questo piano ordina le capacità emerse nella sessione del 6/7 — **38 Capacità di Frontiera + 15
> Capacità di Civiltà = 53**, riscontro completo una-per-una nell'**Appendice di tracciabilità** in fondo —
> più gli 8 punti da migliorare e le 7 aggiunte già individuate (anch'essi mappati in appendice).
> Non è una lista dei desideri: è una sequenza con **cancelli di realtà** — si sale di fase solo quando
> i numeri veri lo permettono.

---

## Le 5 regole del piano (non negoziabili)

1. **Dal basso.** Nessuna capacità si costruisce prima del suo carburante. Il Modello del Mondo senza
   ordini modella il nulla; il Concierge senza negozi serve nessuno.
2. **Ogni piano paga il successivo.** Legge della frugalità: una fase finanzia la prossima coi risultati,
   o la prossima non parte. STOP automatico su ciò che brucia senza rendere.
3. **Cancelli di realtà, non date.** Le date sono indicative; i cancelli sono numeri misurabili da fonte
   reale, e per ogni cancello è scritto QUALE sensore lo misura. Si sale quando il cancello è passato.
4. **La Costituzione vale a ogni piano.** Semaforo 🟢🟡🔴 sempre; ogni auto-modifica della macchina è 🟡;
   soldi veri, clienti reali e produzione sono 🔴 firma di Nicola. La **patente di autonomia** (Fase 2)
   allarga solo dentro il 🟡: **il 🔴 non si guadagna con la bravura, si guadagna solo con la firma di
   Nicola caso per caso.** Mai sorprese, a nessuna altezza.
5. **Nicola al timone, sempre più leggero.** Dalla Fase 2 lo misura il Guardiano del Tuo Tempo; nelle
   Fasi 0–1, dove il Guardiano non esiste ancora, vale come intento con un **proxy misurabile da subito**:
   numero di firme/settimana evase dalla coda AZIONI-IN-ATTESA + tempo dichiarato da Nicola. (La Fase 0,
   unica eccezione dichiarata, il carico lo alza: sono gli sblocchi che solo lui può fare.)

---

## La mappa (7 fasi)

| Fase | Nome | La macchina diventa | Cancello d'uscita (sintesi) | Orizzonte indicativo |
|---|---|---|---|---|
| 0 | Il Mattone Zero | onesta con sé stessa | 1ª consegna reale + 0 bloccanti sicurezza | questa settimana |
| 1 | Sensi Pieni, Prime Mani | vede tutto, tocca il mondo | 10 negozi reali · sensori critici vivi · 1 mano live · costo/consegna misurato | luglio–settembre 2026 |
| 2 | L'Organismo di Base | si gestisce da sola | ordini/sett. in crescita 8 settimane · giornata di Nicola ≤30 min vs baseline | autunno 2026 |
| 3a | La Rete Viva — negozianti e città | il tessuto delle botteghe | 40–60 negozi · servizi-negozio usati davvero | 2027 |
| 3b | La Rete Viva — clienti e soldi | il tessuto della domanda | 2–3 quartieri densi · retention ≥ soglia su 2 coorti | 2027 |
| 4 | La Mente | capisce e prevede | previsioni battono la baseline 3 mesi · ≥12 mesi di storico | 2027–2028 |
| 5 | L'Infrastruttura | il sistema operativo della città | ≥50% dei negozi del centro sulla rete · ≥1 attore terzo sul Protocollo | 2028+ |
| 6 | La Specie | replicabile e perenne | Piacenza autonoma e in utile 6 mesi → seconda città | quando il 5 regge |

---

## FASE 0 — Il Mattone Zero *(adesso → questa settimana)*

**Obiettivo:** chiudere il loop business per la prima volta nella storia della macchina e togliere i
bloccanti di sicurezza. Niente di nuovo si costruisce finché il mattone zero non è posato.

Le mosse (in ordine):
1. 🔴 **Consegna dell'ordine #16** (Pane Quotidiano, contrassegno €19,05) — mani di Nicola: accetta in
   dashboard + consegna → «Consegnato». È la North Star che passa 0→1. *Tutto il resto del piano aspetta
   questo.*
2. 🔴 **Cambiare la chiave GitHub trapelata** (revoca del token + ok alla pulizia della storia git —
   difetto AR-004). Solo Nicola può chiuderlo. Una macchina con una chiave persa per strada non sale di fase.
3. 🟡 **Preparare merge + collaudo dei fix pendenti** (branch machine-analysis, PR #167 del Pannello,
   smoke test @qa in branch) · 🔴 **il passaggio in produzione parte solo all'ok di Nicola** (come da
   Costituzione: il deploy è sempre 🔴; così è già avvenuto per la PR #211, solo dopo l'«ok merge»).
4. 🟡 **Autorizzare i connettori di sessione Stripe e n8n** dalle impostazioni connettori di claude.ai
   (comodità di sessione per l'AD). ✅ *Nota di realtà:* il **sensore-cassa REST di Stripe è GIÀ vivo**
   dal 4/7 22:20 (`sensori-cecita.json`: balance API ok) — non va "collegato", va solo tenuto d'occhio.
   Resta da mettere `SUPABASE_ACCESS_TOKEN` sul VPS per l'MCP.
5. 🟢 **Igiene informativa (solo memoria mia):** aggiornare CHECKLIST-NICOLA (ferma al 26/6, parla ancora
   di Garetti) e riconciliare la memoria sul ramo che il Pannello legge.
6. 🟢 **Verifica post-merge del silenziatore falsi-nuovi:** il fix del delta-gate su PostHog è **già nel
   codice** (AR-025 chiuso il 4/7, commit 34e7bd4, verificato avversarialmente) — dopo il merge va solo
   confermato che i falsi-nuovi restino a zero per 3 giorni. Non è lavoro nuovo: è una verifica.

**Cancello d'uscita** *(misura: REST orders + cantiere-difetti.json + log delta-gate)*: ordini consegnati
≥1 · 0 bloccanti di sicurezza aperti · falsi-nuovi delta-gate = 0 per 3 giorni post-merge.

---

## FASE 1 — Sensi Pieni, Prime Mani *(luglio–settembre 2026 · i negozi dal 9/7)*

**Obiettivo:** la macchina vede tutto con occhi propri, tocca il mondo con la prima mano vera, e —
correzione del panel — **l'azienda impara a consegnare senza Nicola**. Nicola inserisce i negozi (suo
piano: dopo giovedì 9/7); la macchina li mette a reddito.

Le mosse:
1. 🔴 **Onboarding dei primi negozi reali** (target 5–10 confermati nel registro-realtà): Nicola firma i
   contratti, la macchina fa il done-for-you <48h (catena onboarding-negozi).
2. 🟡 **Modello di consegna v1** *(il buco che il panel ha trovato: nessuna fase costruiva CHI consegna)* —
   owner rider-fleet + dispatch: chi consegna (Nicola? un rider? il negoziante?), costo per consegna,
   copertura oraria, piano per i picchi. Senza questo, ogni cancello sugli ordini è impassabile o si
   regge sulle gambe di Nicola — contro la regola 5.
3. 🟢 **Accendi lo storico** *(owner data-engineer)* — la Fase 4 si allena su dati che iniziano a
   esistere ORA: definizione operativa di retention (**% clienti con un 2° ordine entro 60 giorni**,
   fonte REST `orders`), coorti settimanali, eventi conservati dal giorno 1.
4. 🟢 **PostHog:** oggi è **spento per decisione firmata di Nicola** (scollegato fino a dopo il 10/7 —
   ledger sensori, nota #17). Si accende al primo traffico vero da misurare; finché è spento per scelta,
   non conta come sensore cieco.
5. 🟡 **La prima mano live: WhatsApp Business API** — il canale dove vivono negozianti e buyer. Regola
   ferrea (correzione del panel): **in LIVE nessun messaggio a persone reali parte da solo — ogni invio a
   negozianti/buyer è 🔴 in coda firma. Il 🟢 automatico esiste solo verso Nicola** (notifiche, briefing).
   L'eventuale patente su template transazionali già firmati (es. conferma d'ordine) è un allargamento
   futuro 🟡, da firmare esplicitamente uno per uno.
6. 🟡 **La Cabina sul telefono:** le firme 🔴 approvabili da push/WhatsApp. Il collo di bottiglia è la
   latenza della firma di Nicola → si porta la firma dove sta lui.
7. 🟢 **Briefing vocale del mattino:** 90 secondi, i 3 numeri e le 2 firme che servono.
8. 🟡 **Routine giornaliera a cadenza** (patto del 4/7: max 1 giro pieno/giorno finché la quota AI è
   contata; «poco e mirato», mai spacciata per gratis).
9. 🟡 **Il primo esperimento misurato end-to-end:** previsto → eseguito → misurato → lezione. Il ciclo
   che oggi risulta a 0 (review del 3/7) si chiude almeno una volta, per prova.
10. 🟢 **Baseline del carico di Nicola** (per la regola 5): firme/settimana dalla coda + tempo dichiarato.
    È il «prima» contro cui il Guardiano (Fase 2) dimostrerà il «dopo».

**Cancello d'uscita** *(misura: registro-realtà + REST orders + sensori-cecita.json + quaderni)*:
≥10 negozi `confermati` · ordini/settimana >0 stabili per 4 settimane · **sensori critici tutti vivi**
(REST marketplace + REST memoria + Stripe + Resend + uptime; PostHog acceso *o* consapevolmente spento
per decisione firmata) · **costo per consegna misurato** · 1 mano live senza incidenti · 1 esperimento
chiuso con lezione.

---

## FASE 2 — L'Organismo di Base *(autunno 2026)*

**Obiettivo:** le Capacità di Frontiera che lavorano su ciò che la macchina GIÀ produce. La macchina
inizia a gestirsi da sola. ⚠️ **Questa fase è un portafoglio ordinato, non un blocco unico:** si
costruisce nell'ordine scritto, al ritmo che la quota consente — e infatti i primi due pezzi sono
proprio quelli che liberano quota e misurano il carico.

1. 🔥 **Il Metabolismo** *(per primo, di proposito)* — costo AI per organo vs resa; affama i processi
   sterili (estende banco-ai/routing/costo-ai già in repo). È ciò che trasforma la quota da vincolo a leva
   e **finanzia il resto della fase**.
2. ⏱️ **Il Guardiano del Tuo Tempo** *(per secondo)* — misura quali decisioni servivano davvero a Nicola,
   contro la baseline della Fase 1. È il KPI della regola 5.
3. 💶 **Il Bilancio Vivo** — ogni ordine sa quanto rende al centesimo. **Include la corsia contrassegno**
   (oggi il 100% del fatturato è COD, che Stripe non vede): fonte REST `orders` + registro incassi
   contanti riconciliato da @contabilita. *Confine:* il Metabolismo CONSUMA i numeri del Bilancio Vivo,
   non li ricalcola.
4. 🦠 **Il Sistema Immunitario** — red team interno: attacchi simulati (frodi, recensioni finte,
   manipolazione prompt). Estende scan-segreti/pre-commit già esistenti. **Si accende in notturna solo se
   il Metabolismo certifica il budget; finché la quota è contata, è un ciclo settimanale dentro il giro.**
5. ⚡ **Il Midollo Spinale** — riflessi rapidi sulle sentinelle esistenti. Regola ferrea (correzione del
   panel): **ogni riflesso nasce 🟡 come proposta** (trigger + azione esatta + tetto + kill-switch);
   Nicola lo firma UNA volta e da lì scatta da solo NEI LIMITI firmati (playbook pre-firmato). I riflessi
   che scrivono a persone reali o toccano la produzione **restano 🔴 finché il singolo automatismo non è
   firmato**. Primo passo: 3 riflessi PROPOSTI (non cablati).
6. 🌩️ **Le Squadre-Lampo** — task-force temporanee su trigger (meteo, eventi) con scadenza. **Il budget
   esiste solo se pre-firmato da Nicola per categoria di trigger (tetto e scadenza scritti); senza
   pre-firma la squadra produce solo proposte 🟢 e accoda le spese 🔴.** Formalizza ciò che il giro di
   Sant'Antonino ha fatto a mano.
7. 📸 **Il Catalogo che si Scrive da Solo** — foto dello scaffale → schede+prezzi proposti. Sempre 🟡
   proposta in coda, mai scrittura diretta (corsia supervisione-negozi già esistente, backup per riga).
8. 📉 **Il Sismografo** — segnali deboli di churn da login/aggiornamenti/attività. ⚠️ Se legge il *tono*
   di persone reali, passa PRIMA da @legale-privacy (GDPR): finché non c'è il parere, si limita ai
   segnali tecnici. Alimenta l'health score di @account-negozi coi sensori veri.
9. 🪞 **Il Tuo Doppio** — modello delle decisioni di Nicola da DECISIONI + correzioni. **Non firma MAI da
   solo.** Correzione del panel: la coda si pre-ordina per **impatto sulla crescita** — la probabilità-
   di-firma è solo un'etichetta informativa sulla card, mai il criterio d'ordine; le azioni di
   sicurezza/STOP stanno sempre in cima a prescindere.
10. 🎓 **L'autonomia a patente** — ⚠️ nota di realtà dal panel: lo STATO diceva «calibrazione 20/20» ma la
    fonte-di-verità (`calibrazione.json`, 4/7 22:20) dice: 17 previsioni registrate, 16 confermate, però
    **punteggio meccanico 0 / autonomia "bassa"** — il contatore va riconciliato PRIMA di usarlo come
    patente. *Confine:* il Doppio ordina, la Patente promuove. E la patente allarga solo dentro il 🟡
    (regola 4): il 🔴 non si patenta mai.
11. ⏪ **La Macchina del Tempo** — il replay della giornata dell'AD: ogni decisione cliccabile fino alla
    fonte del dato che l'ha causata. Lavora su log e journal che già esistono: è la «macchina di vetro»
    portata al massimo.
12. 🛌 **Il Letargo** — degradazione con grazia: se quota/fondi/sensori calano, la macchina spegne il
    superfluo in ordine inverso d'importanza e tiene il nucleo vitale (ordini, consegne, firma). Regole di
    letargo proposte 🟡 e firmate una volta.
13. 🧬 **L'Auto-espansione dell'Organico** — la radiografia dice «mi manca un mestiere» → la macchina
    prepara il 44° senior, lo mette in prova su lavoro 🟢, lo misura, e ti chiede la firma per assumerlo.
    Ogni assunzione resta 🟡.
14. 🧪 **Qualità mondiale (la «Fase 4» del Blueprint):** valutatore avversariale + A/B su ogni uscita
    importante — il cancello che questo stesso piano ha appena attraversato, reso sistematico.

**Cancello d'uscita** *(misura: REST orders + Guardiano vs baseline Fase 1 + Bilancio Vivo)*:
ordini/settimana in crescita per 8 settimane · giornata di Nicola ≤30 min contro la baseline di Fase 1 ·
ogni azione esce col suo costo/resa · 0 incidenti di sicurezza.

---

## FASE 3 — La Rete Viva *(2027 · richiede densità · spezzata in due ondate dal panel)*

**Obiettivo:** le Capacità di Frontiera che MANGIANO rete. È la fase in cui la macchina smette di essere
un'azienda e diventa il tessuto della città. ⚠️ **Cancello d'INGRESSO per le capacità che profilano
persone reali** (Consiglio dei Piacentini, Orecchio della Città, e il Sismografo se legge il tono):
**parere di @legale-privacy su GDPR/AI Act, prima di costruire.** Molte capacità di quest'ondata toccano
il codice del marketplace: si costruiscono in branch, e ogni passaggio in produzione resta 🔴.

### Ondata 3a — per il negoziante e per la città *(poco codice, tanto servizio)*

- 🤖 **Un mini-AD per ogni negoziante** — il fornaio scrive su WhatsApp e il suo assistente aggiorna
  catalogo/foto nei binari della macchina. **Scrive solo con delega firmata dal negoziante, solo sul SUO
  catalogo, corsia supervisione con backup per riga; le pubblicazioni social restano 🔴.**
- 🎓 **La Macchina che Insegna** — micro-lezioni cucite sui dati del singolo negozio (include il
  playbook «report-dati ai negozi» già disegnato nell'Arsenale).
- 🛡️ **L'Angelo Custode Normativo** — HACCP/fisco/GDPR vegliati, avvisi prima della multa (bozze 🟡;
  validità legale finale sempre umana 🔴).
- 🆘 **La Rete di Mutuo Soccorso** — negozio in difficoltà → la rete lo solleva. Il meccanismo propone
  🟢; l'attivazione di una campagna collettiva su persone reali è 🟡/🔴 come ogni pubblicazione.
- 👂 **L'Orecchio della Città** *(gate legale-privacy)* + 📊 **L'Almanacco** (si nutre dello storico
  acceso in Fase 1) + 🧑‍🤝‍🧑 **Il Consiglio dei Piacentini** *(gate legale-privacy)*.
- 📰 **Il Quotidiano del Commercio** — il racconto settimanale generato dai dati veri. Pubblicare = 🔴.
- 🏛️ **Il Registro Civico della Fiducia** — il badge «Verificato MyCity» come standard cittadino.
- 🕯️ **La Memoria delle Botteghe** — il sapere delle botteghe senza eredi, conservato per la successione
  (sempre col consenso del bottegaio: è materia sua).

**Cancello 3a** *(misura: registro-realtà + quaderni reparto)*: 40–60 negozi confermati · i servizi-
negozio (lezioni, report, angelo custode) usati da ≥metà dei negozi attivi.

### Ondata 3b — per il cliente e per i soldi *(molto codice, molto 🔴)*

- 🛒 **Il Concierge di Spesa** — «la spesa per la carbonara per 4» → carrello multi-negozio composto.
- 🔁 **La Spesa che si Riordina da Sola** — riordino previsto, **un tap del cliente per confermare**
  (mai ordini a sua insaputa).
- 📖 **Il Passaporto del Prodotto** — provenienza e storia verificabile di ogni prodotto.
- 🎰 **I Micro-esperimenti a Bandito** — il budget sperimentale si auto-alloca su ciò che rende, DENTRO
  tetti pre-firmati per categoria (stessa regola delle Squadre-Lampo).
- 🗺️ **Il Catasto Vivo della Domanda** — la mappa della domanda inespressa: decide QUALE negozio
  reclutare dopo, con prove.
- 🤝 **La Camera di Negoziazione delle Botteghe** — gli agenti negoziano BOZZE di bundle win-win;
  **l'accordo lo firmano i negozianti (🔴)**.
- 🛍️ **Il Gruppo d'Acquisto** — la macchina aggrega e negozia bozze da grande; **l'ordine d'acquisto è
  🔴, firmato dai negozianti che spendono**.
- 🚴 **La Staffetta** + 📦 **Il Magazzino Diffuso** — logistica peer-to-peer e inventario federato
  (evoluzione del Modello di consegna v1 di Fase 1).
- 💚 **Il Dividendo del Volano** — **calcolo 🟢, erogazione 🔴** (sposta soldi veri: firma sempre).
- 🏷️ **Il Prezzo Onesto Dinamico** — la leva PROPONE e spiega; **il cambio prezzo/fee resta 🔴, o si
  muove solo entro forchette pre-firmate 🟡 da Nicola** (CLAUDE.md: cambiare prezzi/commissioni è
  l'esempio canonico di 🔴).
- 🏦 **La Tesoreria di Rete** *(solo previsione)* — prevede i buchi di cassa dei negozi; **gli anticipi
  veri slittano a Fase 5** (territorio regolamentato).

**Cancello 3b** *(misura: coorti di data-engineer + Bilancio Vivo)*: 2–3 quartieri con densità di
consegna · **retention ≥ soglia definita in Fase 1 su 2 coorti consecutive** · bundle/dividendo hanno
mosso numeri veri almeno una volta.

---

## FASE 4 — La Mente *(2027–2028 · richiede ≥12 mesi dello storico acceso in Fase 1)*

**Obiettivo:** le Capacità di Civiltà cognitive. La macchina smette di reagire e inizia a capire.

- 🌆 **Il Modello del Mondo** — il modello vivo di Piacenza che risponde ai controfattuali («e se la ZTL
  si allarga?»). Si allena sullo storico acceso in Fase 1 e maturato nelle fasi 2–3.
- 🔬 **Lo Scienziato** — motore causale: ipotesi → esperimenti naturali → leggi del commercio locale.
  Estende il ciclo esperimenti nato in Fase 1.
- 🎲 **La Sala dei Mille Futuri** — scenari in massa contro cui ogni strategia deve sopravvivere. Il
  pre-mortem testuale diventa quantitativo. **Come l'Immunitario: in notturna solo se il Metabolismo
  certifica il budget; altrimenti ciclo settimanale.** (Il **Gemello Digitale** e l'**Anticipo
  Predittivo** delle prime liste maturano qui dentro: simulazione dell'azienda + previsione della
  domanda per negozio per fascia oraria.)
- 🧬 **L'Evoluzione in Ombra** — varianti di sé in shadow sui dati veri; la vincente proposta per la
  firma (ogni mutazione 🟡).
- 📚 **La Macchina che fa Ricerca su Sé Stessa** — legge le novità dell'AI, propone upgrade della propria
  architettura, li prova in ombra. Ogni adozione resta 🟡.

**Cancello d'uscita** *(misura: registro previsioni vs esiti, stesso motore della calibrazione)*: le
previsioni battono la baseline ingenua su 3 metriche per 3 mesi · ≥1 decisione importante presa DOPO
simulazione con esito migliore del previsto · 10+ esperimenti causali chiusi.

---

## FASE 5 — L'Infrastruttura *(2028+ · richiede Piacenza densa)*

**Obiettivo:** le Capacità di Civiltà economiche e fisiche. La macchina diventa il sistema operativo del
commercio della città — invisibile come l'elettricità.

- 🔌 **Il Protocollo** — lo standard aperto con cui qualunque agente esterno (fornitori, banche, Comune,
  altre città) si collega e negozia. Da piattaforma a lingua.
- 🏦 **Il Circuito del Credito** + 🛟 **La Mutua Algoritmica** — liquidità e rischio condivisi dentro la
  rete. ⚠️ **Territorio regolamentato** (credito/assicurazioni): si entra SOLO con @legale-privacy,
  partner autorizzati e via libera normativo — o si rimanda senza vergogna. La macchina prepara; le
  carte le firmano gli umani. 🔴 **Il resto della fase NON dipende da questi due moduli.**
- 🥖 **La Produzione a Domanda** — la domanda aggregata di domani detta stasera quanto produrre.
- 🌡️ **Il Sistema Nervoso Fisico** — IoT: frigo che si autodenuncia (HACCP), contapersone, locker.
- 🔒 **Sapere senza Guardare** — apprendimento federato + privacy differenziale: impara da tutti i dati
  senza vedere i dati di nessuno.
- ✅ **L'Onestà Dimostrabile** — le promesse della macchina verificabili matematicamente da terzi.
- 👥 **Un Agente per Ogni Cittadino** — ogni piacentino col suo agente personale che negozia con la rete.
- 🏦 **La Tesoreria di Rete — anticipi veri** (dal modulo-previsione di Fase 3b, col via libera legale).

**Cancello d'uscita** *(misura: registro-realtà vs censimento negozi del perimetro Vita in Centro)*:
**≥50% dei negozi del perimetro del centro sulla rete** · **≥1 attore terzo esterno**
(fornitore/istituzione/banca) collegato via Protocollo · il circuito credito/mutua ha il via libera
legale o è stato consapevolmente rimandato.

---

## FASE 6 — La Specie *(quando il 5 regge)*

**Obiettivo:** durare e riprodursi.

- 🧬 **Il Genoma Replicabile** — «incolla il DNA» sulla seconda città (Parma o Cremona): stessi principi,
  dati propri, Stelle proprie.
- 📜 **La Costituzione Vivente** — le 18 Leggi come codice eseguibile e auto-emendabile (ogni emendamento
  firmato). L'anima che sopravvive ai modelli AI e alle persone.
- 🗿 **La Pianificazione Generazionale** — strategie a orizzonte 2040 portate avanti senza dimenticare.
- 🏗️ **Il Compilatore d'Impresa** — il punto d'arrivo: descrivi un'azienda a parole e la macchina la
  compila. MyCity diventa la prima frase di quel linguaggio.

**Cancello d'uscita:** Piacenza autonoma e in utile da 6 mesi · il genoma clonato accende la seconda
città in <30 giorni.

---

## Le regole trasversali (valgono a ogni fase, per sempre)

- **Semaforo:** 🟢 reversibile = da sola · 🟡 = fa e avvisa / propone e firma · 🔴 soldi-legale-clienti-
  produzione = MAI senza Nicola. Ogni auto-modifica della macchina è 🟡, anche banale. Gli automatismi su
  azioni 🔴 esistono SOLO come playbook pre-firmati uno per uno, con tetti e kill-switch.
- **Verità:** nessun numero senza fonte; se i sensori sono ciechi, baseline e Gap dichiarato — mai
  inventare. Le entità: confermate, scelte ragionate con prove, o bloccate.
- **Privacy by design:** ogni capacità che profila persone reali (tono, gusti, comportamenti) passa da
  @legale-privacy PRIMA di essere costruita, non dopo.
- **Quota AI:** finché è contata, «poco e mirato» (patto del 4/7); i processi notturni pesanti si
  accendono solo quando il Metabolismo (Fase 2) certifica che c'è budget.
- **Sicurezza:** scan-segreti + pre-commit sempre attivi; ogni nuova mano nasce col kill-switch e in
  dry-run; RLS e GDPR prima di ogni nuova superficie dati.
- **Il confine umano:** trattative vere, fiducia profonda, responsabilità legale, visione, etica — di
  Nicola, a ogni fase, senza eccezioni.

## Il pre-mortem del piano (cosa lo ammazza, e le difese — 10 rischi)

1. **Il mattone zero non si posa** (la consegna resta ferma) → la Fase 0 ha una sola priorità e tutto il
   resto aspetta; la Cabina-sul-telefono (Fase 1) toglie la latenza-firma per sempre.
2. **Nicola-collo-di-bottiglia si cronicizza** → Guardiano del Tuo Tempo come KPI di fase (proxy già
   dalla Fase 1); se il carico sale, la fase si ferma e si corregge.
3. **La quota AI strozza il battito** → Metabolismo + routing economico + delta-gate pulito; verità e
   sicurezza non si tagliano mai, si taglia il volume.
4. **Fase 5 sbatte sulla regolamentazione** (credito/mutua) → dichiarato: si entra con legale e partner,
   o si rimanda; il resto della fase non dipende da quei moduli.
5. **Un concorrente nazionale scende su Piacenza** → le capacità civiche (Registro Fiducia, Memoria delle
   Botteghe, Mutuo Soccorso) sono il fossato che non possono comprare: accelerarle se accade.
6. **La qualità deriva mentre si scala** → il flywheel di auto-coscienza gira a ogni fase; la radiografia
   settimanale ha l'ultima parola sulla salita di fase.
7. *(dal panel)* **Dipendenza da un solo fornitore AI** — la macchina È Claude: outage, deprecazioni,
   prezzi → piano B multi-modello nel banco-ai (routing già esistente, da estendere a fornitori diversi);
   il Letargo (Fase 2) copre l'outage.
8. *(dal panel)* **Blocco privacy (GDPR/AI Act) sul profiling** → parere @legale-privacy come cancello
   d'INGRESSO (non d'uscita) per Consiglio/Orecchio/Sismografo-tono; se il parere è no, quelle capacità
   si riprogettano su dati aggregati, non si forzano.
9. *(dal panel)* **L'unico umano si assenta** (malattia, ferie, burnout — la Fase 0 ferma ~10 giorni
   sulle sue mani lo dimostra già) → procedura «Nicola assente >N giorni»: la macchina entra in modalità
   conservativa (solo 🟢 + coda), le consegne hanno un piano B umano (Fase 1, Modello di consegna v1).
10. *(dal panel)* **Runway: chi paga le fasi pre-ricavo** — la Fase 0 incassa €19,05 e la Fase 1 costa
    (WhatsApp API, onboarding, quota) → budget-ponte esplicito da concordare con Nicola per le Fasi 0–2,
    coi tetti in OKR-Squadra; la regola 2 («ogni piano paga il successivo») vale DALLA Fase 2 in poi.

## Cosa serve da te, adesso (Fase 0 — scritto come lo diresti a voce)

1. 🔴 **Consegna la spesa di Pane Quotidiano e incassa i 19,05 € in contanti, poi segna «Consegnato».**
   *(ordine #16: accetta in dashboard + consegna — è la North Star che passa 0→1)*
2. 🔴 **Cambia la chiave GitHub trapelata e dammi l'ok a ripulirne la storia.**
   *(difetto AR-004: revoca del token + purga — solo tu puoi chiuderlo)*
3. 🔴 **Dammi l'ok a portare in produzione i fix già pronti e collaudati.**
   *(merge branch machine-analysis + PR #167 del Pannello, dopo lo smoke test)*
4. 🟡 **Autorizza i collegamenti Stripe e n8n nelle impostazioni connettori di claude.ai.**
   *(comodità di sessione per me; il sensore-cassa vero è già vivo dal 4/7)*
5. 🟡 **Portami le foto, la scheda e il consenso di Pane Quotidiano.**
   *(chiude il difetto AR-006 e alza il pacchetto del faro a livello professionale)*
6. 🟡 **Firma questo piano come rotta — o correggilo.** *(le tue correzioni valgono doppio, come sempre)*

## Come misuriamo che il piano vive

- Le **3 Stelle Polari** del Blueprint restano il metro: ordini consegnati/settimana · primi clienti/
  settimana · Indice Influenza Piacenza.
- Ogni **review del venerdì** controlla: a che fase siamo, distanza dal cancello (col sensore che lo
  misura), carico di Nicola vs baseline.
- Il piano si **ri-esamina a ogni cancello passato** e a ogni correzione di Nicola: è un documento vivo,
  non un monumento.

---

## 📎 Appendice di tracciabilità — le 53 Capacità, una per una

*(Richiesta dal panel: «impossibile verificare che nulla sia caduto per strada». Ora si può.)*

**Le 38 Capacità di Frontiera:**

| # | Capacità | Fase |
|---|---|---|
| 1 | Il Gemello Digitale | 4 (matura dentro Sala dei Mille Futuri/Evoluzione in Ombra) |
| 2 | Un mini-AD per ogni negoziante | 3a |
| 3 | Il Concierge di Spesa | 3b |
| 4 | La Macchina del Tempo | 2 |
| 5 | L'Anticipo Predittivo | 4 (embrione nelle Squadre-Lampo di Fase 2) |
| 6 | L'Auto-espansione dell'Organico | 2 |
| 7 | Il Genoma Replicabile | 6 |
| 8 | I Micro-esperimenti a Bandito | 3b |
| 9 | Il Catasto Vivo della Domanda | 3b |
| 10 | La Camera di Negoziazione delle Botteghe | 3b |
| 11 | La Spesa che si Riordina da Sola | 3b |
| 12 | Il Sistema Immunitario | 2 |
| 13 | Il Bilancio Vivo | 2 |
| 14 | Il Tuo Doppio | 2 |
| 15 | Le Squadre-Lampo | 2 |
| 16 | La Macchina che Insegna | 3a |
| 17 | Il Prezzo Onesto Dinamico | 3b |
| 18 | Il Registro Civico della Fiducia | 3a |
| 19 | L'Orecchio della Città | 3a (gate legale-privacy) |
| 20 | Il Sismografo | 2 (il tono solo dopo gate legale-privacy) |
| 21 | L'Almanacco | 3a (si nutre dello storico acceso in Fase 1) |
| 22 | Il Consiglio dei Piacentini | 3a (gate legale-privacy) |
| 23 | Il Midollo Spinale | 2 |
| 24 | Il Catalogo che si Scrive da Solo | 2 |
| 25 | Il Magazzino Diffuso | 3b |
| 26 | La Staffetta | 3b |
| 27 | La Tesoreria di Rete | 3b (previsione) → 5 (anticipi) |
| 28 | Il Gruppo d'Acquisto | 3b |
| 29 | Il Dividendo del Volano | 3b |
| 30 | Il Metabolismo | 2 (primo della fase) |
| 31 | Il Passaporto del Prodotto | 3b |
| 32 | Il Quotidiano del Commercio | 3a |
| 33 | L'Angelo Custode Normativo | 3a |
| 34 | La Memoria delle Botteghe | 3a |
| 35 | La Rete di Mutuo Soccorso | 3a |
| 36 | L'Evoluzione in Ombra | 4 |
| 37 | Il Letargo | 2 |
| 38 | Il Guardiano del Tuo Tempo | 2 (baseline proxy già in Fase 1) |

**Le 15 Capacità di Civiltà:**

| # | Capacità | Fase |
|---|---|---|
| 39 | Il Modello del Mondo | 4 |
| 40 | Lo Scienziato | 4 |
| 41 | La Sala dei Mille Futuri | 4 |
| 42 | Il Protocollo | 5 |
| 43 | Il Circuito del Credito | 5 (gate regolamentare) |
| 44 | La Mutua Algoritmica | 5 (gate regolamentare) |
| 45 | La Produzione a Domanda | 5 |
| 46 | Il Sistema Nervoso Fisico | 5 |
| 47 | Sapere senza Guardare | 5 |
| 48 | L'Onestà Dimostrabile | 5 |
| 49 | Un Agente per Ogni Cittadino | 5 |
| 50 | La Macchina che fa Ricerca su Sé Stessa | 4 |
| 51 | La Costituzione Vivente | 6 |
| 52 | La Pianificazione Generazionale | 6 |
| 53 | Il Compilatore d'Impresa | 6 |

**Gli 8 punti da migliorare** (sessione 6/7) → 1. loop business = Fase 0 mossa 1 · 2. sensori a metà =
Fase 0 mossa 4 + Fase 1 mosse 3–4 (nota: Stripe REST già vivo dal 4/7) · 3. mani = Fase 1 mosse 5–6 ·
4. falsi-nuovi = Fase 0 mossa 6 (fix già in codice, AR-025) · 5. chiave trapelata = Fase 0 mossa 2 ·
6. esperimenti mai misurati = Fase 1 mossa 9 · 7. deploy fragili = Fase 0 mossa 3 + sync VPS ·
8. documenti stantii = Fase 0 mossa 5.

**Le 7 aggiunte previste** → mani mancanti = Fase 1 · sensore-cassa = già vivo (verifica in Fase 0) ·
Cabina sul telefono = Fase 1 · briefing vocale = Fase 1 · qualità mondiale (Fase-4-Blueprint) = Fase 2 ·
autonomia a patente = Fase 2 · report-dati ai negozi = Fase 3a (dentro La Macchina che Insegna).

---

*Scritto dall'AD digitale il 2026-07-06 13:04, riveduto alle 13:30 dopo il panel avversariale a 3 lenti
(realismo · costituzione · sequenza — verdetto unanime: solido-con-correzioni; tutte le correzioni fondate
applicate). Bozza: correggila, taglia, aggiungi — quando è come la vuoi, diventa la rotta.*
