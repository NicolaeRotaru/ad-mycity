---
tipo: piano
titolo: Il Piano della Piramide — costruire l'infrastruttura completa (53 Capacità)
data: 2026-07-06 13:04
fonte: AD digitale — sessione di visione con Nicola del 6/7/2026
stato: bozza 🟡 — diventa la stella polare solo con la firma di Nicola
riferimenti: MyCity-Vault/00-Blueprint-MyCity-OS.md · STATO.md · cantiere-difetti.json
---

# 🏗️ Il Piano della Piramide

> **In una frase:** da dove siamo oggi (1 negozio reale, 0 consegne completate, salute macchina 42/100)
> fino all'infrastruttura di civiltà — l'azienda-organismo con la città come corpo — costruita **dal
> basso**, un piano alla volta, con ogni piano che si guadagna e si paga il successivo.
>
> Questo piano ordina le **53 Capacità** emerse nella sessione del 6/7 (38 di Frontiera + 15 di
> Civiltà), più gli 8 punti da migliorare e le 7 aggiunte previste. Non è una lista dei desideri:
> è una sequenza con **cancelli di realtà** — si sale di fase solo quando i numeri veri lo permettono.

---

## Le 5 regole del piano (non negoziabili)

1. **Dal basso.** Nessuna capacità si costruisce prima del suo carburante. Il Modello del Mondo senza
   ordini modella il nulla; il Concierge senza negozi serve nessuno.
2. **Ogni piano paga il successivo.** Legge della frugalità: una fase finanzia la prossima coi risultati,
   o la prossima non parte. STOP automatico su ciò che brucia senza rendere.
3. **Cancelli di realtà, non date.** Le date sono indicative; i cancelli sono numeri misurabili da fonte
   reale. Si sale quando il cancello è passato, non quando il calendario lo dice.
4. **La Costituzione vale a ogni piano.** Semaforo 🟢🟡🔴 sempre; ogni auto-modifica della macchina è 🟡;
   soldi veri, clienti reali e produzione sono 🔴 firma di Nicola. Mai sorprese, a nessuna altezza.
5. **Nicola al timone, sempre più leggero.** A ogni fase il carico di Nicola deve *scendere* (misurato dal
   Guardiano del Tuo Tempo dalla Fase 2 in poi). Se una fase gli aumenta il lavoro, la fase è sbagliata.

---

## La mappa (7 fasi)

| Fase | Nome | La macchina diventa | Cancello d'uscita (sintesi) | Orizzonte indicativo |
|---|---|---|---|---|
| 0 | Il Mattone Zero | onesta con sé stessa | 1ª consegna reale + 0 bloccanti sicurezza | questa settimana |
| 1 | Sensi Pieni, Prime Mani | vede tutto, tocca il mondo | 10 negozi reali · sensori 5/5 · 1 mano live | luglio–settembre 2026 |
| 2 | L'Organismo di Base | si gestisce da sola | ordini/sett. stabili · giornata di Nicola ≤30 min | autunno 2026 |
| 3 | La Rete Viva | il tessuto della città | 40–60 negozi · 2–3 quartieri densi · retention | 2027 |
| 4 | La Mente | capisce e prevede | previsioni che battono la baseline · ≥12 mesi di storico | 2027–2028 |
| 5 | L'Infrastruttura | il sistema operativo della città | metà del centro sulla rete · 1 terzo esterno sul Protocollo | 2028+ |
| 6 | La Specie | replicabile e perenne | Piacenza autonoma e in utile → seconda città | quando il 5 regge |

---

## FASE 0 — Il Mattone Zero *(adesso → questa settimana)*

**Obiettivo:** chiudere il loop business per la prima volta nella storia della macchina e togliere i
bloccanti di sicurezza. Niente di nuovo si costruisce finché il mattone zero non è posato.

Le mosse (in ordine):
1. 🔴 **Consegna dell'ordine #16** (Pane Quotidiano, COD €19,05) — mani di Nicola: #21 accetta in
   dashboard + #22 consegna → «Consegnato». È la North Star che passa 0→1. *Tutto il resto del piano
   aspetta questo.*
2. 🔴 **Revoca del PAT GitHub** finito nella storia git (AR-004) + purga della storia. Solo Nicola può
   chiuderlo. Una macchina con una chiave persa per strada non sale di fase.
3. 🟡 **Merge e deploy dei fix pendenti** (branch machine-analysis, PR #167 del Pannello) + smoke test @qa.
4. 🟡 **Collegare i sensori mancanti in sessione:** autorizzare i connettori **Stripe** e **n8n** dalle
   impostazioni connettori di claude.ai; `SUPABASE_ACCESS_TOKEN` sul VPS per l'MCP.
5. 🟢 **Pulizia dell'igiene informativa:** aggiornare CHECKLIST-NICOLA (ferma al 26/6, parla ancora di
   Garetti), silenziare il falso-nuovo del delta-gate su PostHog (8 sveglie a vuoto in un giorno = quota
   bruciata), riconciliare la memoria sul ramo che il Pannello legge.

**Cancello d'uscita:** ordini consegnati ≥1 (fonte REST) · 0 bloccanti di sicurezza aperti ·
delta-gate senza falsi-nuovi per 3 giorni.

---

## FASE 1 — Sensi Pieni, Prime Mani *(luglio–settembre 2026 · i negozi dal 9/7)*

**Obiettivo:** la macchina vede tutto con occhi propri e tocca il mondo con la prima mano vera.
Nicola inserisce i negozi (suo piano: dopo giovedì 9/7); la macchina li mette a reddito.

Le mosse:
1. 🔴 **Onboarding dei primi negozi reali** (target 5–10 confermati nel registro-realtà): Nicola firma
   i contratti, la macchina fa il done-for-you <48h (catena onboarding-negozi).
2. 🟡 **Sensore-cassa vero:** Stripe collegato in sola lettura — incassi, payout e anomalie smettono di
   essere stime.
3. 🟢 **PostHog al primo funnel vero:** si accende quando c'è traffico da misurare (0 ordini pagati =
   resta opzionale, come da regola attuale).
4. 🟡 **La prima mano live: WhatsApp Business API** — il canale dove vivono negozianti e buyer. Dietro il
   cancello fail-closed già collaudato (in LIVE parte da solo SOLO il 🟢; tutto il resto in coda firma).
5. 🟡 **La Cabina sul telefono:** le firme 🔴 approvabili da push/WhatsApp. Il collo di bottiglia è la
   latenza della firma di Nicola → si porta la firma dove sta lui.
6. 🟢 **Briefing vocale del mattino:** 90 secondi, i 3 numeri e le 2 firme che servono.
7. 🟡 **Routine giornaliera a cadenza** (patto del 4/7: max 1 giro pieno/giorno finché la quota AI è
   contata; «poco e mirato», mai spacciata per gratis).
8. 🟡 **Il primo esperimento misurato end-to-end:** previsto → eseguito → misurato → lezione. Il ciclo
   che oggi risulta a 0 (review del 3/7) si chiude almeno una volta, per prova.

**Cancello d'uscita:** ≥10 negozi `confermati` · ordini/settimana >0 stabili per 4 settimane ·
sensori 5/5 vivi · 1 mano live senza incidenti · 1 esperimento chiuso con lezione.

---

## FASE 2 — L'Organismo di Base *(autunno 2026)*

**Obiettivo:** le Capacità di Frontiera che lavorano su ciò che la macchina GIÀ produce — quelle che non
hanno bisogno di scala per esistere. La macchina inizia a gestirsi da sola.

Le capacità di questa fase (dalle 53, con dipendenze):
- 💶 **Il Bilancio Vivo** — ogni ordine sa quanto rende al centesimo (richiede: Stripe collegato, Fase 1).
  *Primo passo:* costo/resa per ordine nel Pannello, leve entro tetti firmati.
- 🪞 **Il Tuo Doppio** — modello delle decisioni di Nicola da DECISIONI + correzioni (che già valgono
  doppio). *Primo passo:* pre-ordinamento della coda firme per «probabilità di firma». Non firma MAI da solo.
- 🦠 **Il Sistema Immunitario** — red team permanente: attacchi simulati (frodi, recensioni finte,
  manipolazione prompt) ogni notte. *Primo passo:* estendere lo scan-segreti/pre-commit già esistente a
  una suite di attacco periodica.
- ⚡ **Il Midollo Spinale** — riflessi sotto il minuto che non passano dal cervello: ordine fermo →
  sollecito; sito giù → allarme/rollback. *Primo passo:* 3 riflessi cablati sulle sentinelle esistenti.
- 🌩️ **Le Squadre-Lampo** — task-force temporanee su trigger (meteo, eventi) con budget micro e scadenza.
  *Primo passo:* formalizzare ciò che il giro di Sant'Antonino ha fatto a mano.
- 📸 **Il Catalogo che si Scrive da Solo** — foto dello scaffale → schede+prezzi proposti (sempre 🟡
  proposta, mai scrittura diretta: corsia supervisione-negozi già esistente).
- 📉 **Il Sismografo** — segnali deboli di churn/crisi da login, aggiornamenti, tono. *Primo passo:*
  health score negozi (account-negozi) alimentato dai sensori veri.
- 🔥 **Il Metabolismo** — costo AI per organo vs resa; affama i processi sterili (estende banco-ai/
  routing e costo-ai già in repo).
- ⏱️ **Il Guardiano del Tuo Tempo** — misura quali decisioni servivano davvero a Nicola e restringe il
  suo carico. È il KPI della regola 5 del piano.
- 🎓 **L'autonomia a patente** — la calibrazione (già 20/20 su @AD) diventa gradi di autonomia guadagnati
  per reparto: chi azzecca si merita più 🟢. Ogni allargamento di autonomia resta 🟡 firma.
- 🧪 **Fase-4-del-Blueprint completata:** valutatore avversariale + A/B su ogni uscita importante.

**Cancello d'uscita:** ordini/settimana in crescita per 8 settimane · giornata di Nicola ≤30 min
(misurata dal Guardiano) · ogni azione esce col suo costo/resa · 0 incidenti di sicurezza.

---

## FASE 3 — La Rete Viva *(2027 · richiede densità)*

**Obiettivo:** le Capacità di Frontiera che MANGIANO rete — hanno senso solo con decine di negozi e
clienti abituali. È la fase in cui la macchina smette di essere un'azienda e diventa il tessuto della città.

Per il **negoziante**:
- 🤖 **Un mini-AD per ogni negoziante** — il fornaio scrive su WhatsApp e il suo assistente aggiorna
  catalogo/foto/post nei binari della macchina.
- 🎓 **La Macchina che Insegna** — micro-lezioni cucite sui dati del singolo negozio.
- 🛡️ **L'Angelo Custode Normativo** — HACCP/fisco/GDPR vegliati, avvisi prima della multa (bozze legali
  sempre con validità finale umana 🔴).
- 🆘 **La Rete di Mutuo Soccorso** — negozio in difficoltà → la rete lo solleva (promo collettiva).

Per il **cliente**:
- 🛒 **Il Concierge di Spesa** — «la spesa per la carbonara per 4» → carrello multi-negozio composto.
- 🔁 **La Spesa che si Riordina da Sola** — riordino previsto, un tap per confermare.
- 📖 **Il Passaporto del Prodotto** — provenienza e storia verificabile di ogni prodotto.

Per la **città**:
- 🗺️ **Il Catasto Vivo della Domanda** — la mappa della domanda inespressa: decide QUALE negozio
  reclutare dopo, con prove.
- 👂 **L'Orecchio della Città** + 📊 **L'Almanacco** + 🧑‍🤝‍🧑 **Il Consiglio dei Piacentini** — sensi
  civici: ascolto pubblico, memoria storica, focus group sintetico calibrato su clienti reali.
- 📰 **Il Quotidiano del Commercio** — il racconto settimanale generato dai dati veri.
- 🏛️ **Il Registro Civico della Fiducia** — il badge «Verificato MyCity» come standard cittadino.
- 🕯️ **La Memoria delle Botteghe** — il sapere delle botteghe senza eredi, conservato per la successione.

Per i **soldi**:
- 🤝 **La Camera di Negoziazione delle Botteghe** — bundle e accordi win-win negoziati dagli agenti,
  firmati dagli umani.
- 🛍️ **Il Gruppo d'Acquisto Autonomo** — la rete compra insieme da grande.
- 🚴 **La Staffetta** + 📦 **Il Magazzino Diffuso** — logistica peer-to-peer e inventario federato.
- 💚 **Il Dividendo del Volano** — parte del valore torna ai negozi che fanno crescere la rete.
- 🏷️ **Il Prezzo Onesto Dinamico** — leve di prezzo mobili ma spiegate in chiaro al cliente.
- 🏦 **La Tesoreria di Rete** *(inizio)* — previsione dei buchi di cassa dei negozi; gli anticipi veri
  slittano a Fase 5 (territorio regolamentato).

**Cancello d'uscita:** 40–60 negozi confermati · 2–3 quartieri con densità di consegna · retention
clienti misurata in crescita · il Dividendo/i bundle hanno mosso numeri veri almeno una volta.

---

## FASE 4 — La Mente *(2027–2028 · richiede ≥12 mesi di storico)*

**Obiettivo:** le Capacità di Civiltà cognitive. La macchina smette di reagire e inizia a capire.

- 🌆 **Il Modello del Mondo** — il modello vivo di Piacenza che risponde ai controfattuali («e se la ZTL
  si allarga?»). Si allena sullo storico accumulato dalle fasi 1–3.
- 🔬 **Lo Scienziato** — motore causale: ipotesi → esperimenti naturali → leggi del commercio locale.
  Estende il ciclo esperimenti nato in Fase 1.
- 🎲 **La Sala dei Mille Futuri** — ogni notte migliaia di scenari; ogni strategia deve sopravvivere a
  tutti. Il pre-mortem testuale di oggi diventa quantitativo.
- 🧬 **L'Evoluzione in Ombra** — varianti di sé in shadow sui dati veri; la vincente proposta per la
  firma. (Il Gemello Digitale e l'Anticipo Predittivo delle prime liste maturano qui dentro.)
- 📚 **La Macchina che fa Ricerca su Sé Stessa** — legge le novità dell'AI, propone upgrade della propria
  architettura, li prova in ombra. Ogni adozione resta 🟡.

**Cancello d'uscita:** le previsioni della macchina battono la baseline ingenua su 3 metriche per 3 mesi ·
almeno 1 decisione importante presa DOPO simulazione con esito migliore del previsto · 10+ esperimenti
causali chiusi.

---

## FASE 5 — L'Infrastruttura *(2028+ · richiede Piacenza densa)*

**Obiettivo:** le Capacità di Civiltà economiche e fisiche. La macchina diventa il sistema operativo del
commercio della città — invisibile come l'elettricità.

- 🔌 **Il Protocollo** — lo standard aperto con cui qualunque agente esterno (fornitori, banche, Comune,
  altre città) si collega e negozia. Da piattaforma a lingua.
- 🏦 **Il Circuito del Credito** + 🛟 **La Mutua Algoritmica** — liquidità e rischio condivisi dentro la
  rete. ⚠️ **Territorio regolamentato** (credito/assicurazioni): qui si entra SOLO con legale-privacy,
  partner autorizzati e via libera normativo. La macchina prepara; le carte le firmano gli umani. 🔴
- 🥖 **La Produzione a Domanda** — la domanda aggregata di domani detta stasera quanto produrre. Sprechi → 0.
- 🌡️ **Il Sistema Nervoso Fisico** — IoT: frigo che si autodenuncia (HACCP), contapersone, locker di quartiere.
- 🔒 **Sapere senza Guardare** — apprendimento federato + privacy differenziale: impara da tutti i dati
  senza vedere i dati di nessuno.
- ✅ **L'Onestà Dimostrabile** — le promesse della macchina verificabili matematicamente da terzi.
- 👥 **Un Agente per Ogni Cittadino** — l'economia degli agenti completa: ogni piacentino col suo agente
  personale che negozia con la rete.

**Cancello d'uscita:** una quota significativa dei negozi del centro sulla rete · ≥1 attore terzo
(fornitore/istituzione) collegato via Protocollo · il circuito credito/mutua ha il via libera legale o è
stato consapevolmente rimandato.

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
  produzione = MAI senza Nicola. Ogni auto-modifica della macchina è 🟡, anche banale.
- **Verità:** nessun numero senza fonte; se i sensori sono ciechi, baseline e Gap dichiarato — mai
  inventare. Le entità: confermate, scelte ragionate con prove, o bloccate.
- **Quota AI:** finché è contata, «poco e mirato» (patto del 4/7); il Metabolismo (Fase 2) la trasforma
  da vincolo a leva.
- **Sicurezza:** scan-segreti + pre-commit sempre attivi; ogni nuova mano nasce col kill-switch e in
  dry-run; RLS e GDPR prima di ogni nuova superficie dati.
- **Il confine umano:** trattative vere, fiducia profonda, responsabilità legale, visione, etica — di
  Nicola, a ogni fase, senza eccezioni.

## Il pre-mortem del piano (cosa lo ammazza, e le difese)

1. **Il mattone zero non si posa** (la consegna resta ferma) → il piano intero è carta. *Difesa:* la
   Fase 0 ha una sola priorità e tutto il resto aspetta; la Cabina-sul-telefono (Fase 1) toglie la
   latenza-firma per sempre.
2. **Nicola-collo-di-bottiglia si cronicizza** → *difesa:* Guardiano del Tuo Tempo come KPI di fase; se il
   carico di Nicola sale, la fase si ferma e si corregge.
3. **La quota AI strozza il battito** → *difesa:* Metabolismo + routing economico + delta-gate pulito;
   verità e sicurezza non si tagliano mai, si taglia il volume.
4. **Fase 5 sbatte sulla regolamentazione** (credito/mutua) → *difesa:* dichiarato nel piano: si entra con
   legale e partner, o si rimanda senza vergogna. Il resto della fase non dipende da quei due moduli.
5. **Un concorrente nazionale scende su Piacenza** → *difesa:* le capacità civiche (Registro Fiducia,
   Memoria delle Botteghe, Mutuo Soccorso) sono il fossato che non possono comprare: accelerarle se accade.
6. **La qualità deriva mentre si scala** → *difesa:* il flywheel di auto-coscienza gira a ogni fase; la
   radiografia settimanale ha l'ultima parola sulla salita di fase.

## Cosa serve da te, adesso (Fase 0, in ordine)

1. 🔴 Consegna #16 (accetta + consegna COD €19,05 → «Consegnato»)
2. 🔴 Revoca del PAT GitHub + ok alla purga della storia
3. 🟡 Ok al merge/deploy dei fix pendenti
4. 🟡 Autorizzare i connettori Stripe e n8n su claude.ai (impostazioni → connettori)
5. 🟡 Firma di QUESTO piano come stella polare (o le tue correzioni: valgono doppio, come sempre)

## Come misuriamo che il piano vive

- Le **3 Stelle Polari** del Blueprint restano il metro: ordini consegnati/settimana · primi clienti/
  settimana · Indice Influenza Piacenza.
- Ogni **review del venerdì** controlla: a che fase siamo, distanza dal cancello, carico di Nicola.
- Il piano si **ri-esamina a ogni cancello passato** e a ogni correzione di Nicola: è un documento vivo,
  non un monumento.

---

*Scritto dall'AD digitale il 2026-07-06 13:04 dopo la sessione di visione con Nicola (la fotografia
della macchina, le 38 Capacità di Frontiera, le 15 Capacità di Civiltà). Bozza: correggila, taglia,
aggiungi — quando è come la vuoi, diventa la rotta.*
