---
data: 2026-07-16 23:58
tipo: auto-radiografia (COMPLETA, su comando di Nicola — worker + AD + 120 senior + Pannello) + tempo 2 PERFORMANCE (23:58)
voto_salute_architettura: 0
voto_salute_pannello: 0
---

# 🩻 Radiografia della MACCHINA — 2026-07-16 16:55

> Su comando di Nicola («radiografia completa e profonda di worker/AD/senior/Pannello») la macchina si è
> guardata allo specchio: **12 dimensioni** sull'architettura (26 agenti: revisore + verificatore
> avversariale per ciascuna, + pre-mortem + benchmark) e in parallelo **8 dimensioni sul Pannello**
> (16 agenti). **Nessun fix applicato**: ogni rimedio è 🟡, aspetta la firma di Nicola.
> Archivio completo: `consegne/audit/2026-07-16-auto-radiografia.md` (173 difetti col dettaglio file:riga).

## ⚡ Tempo 2 (23:58) — la radiografia delle PERFORMANCE

> Su comando di Nicola («radiografia profonda e completa delle performance — non saltare nulla») la macchina
> si è riguardata con la lente di velocità/costo/ingolfamenti: 26 agenti (revisore + verificatore avversariale
> per dimensione, **su Opus** come scelto da Nicola), lavoro fermato alle 17:50 e **ripreso da solo alle 21:19**
> dal punto esatto. Archivio completo: `consegne/audit/2026-07-16-radiografia-performance.md`.

**Esito: 79 difetti confermati (2 bloccanti · 36 gravi · 41 minori), tutti con prova di chiusura automatica.**
La mappa del mattino regge (voto resta **0/100**, trend =); **12 difetti sono NUOVI** ed entrano in cantiere
come **AR-124…AR-135**. I 5 colli di bottiglia che frenano davvero:

1. **Il tassametro è rotto e i freni di spesa non possono frenare** — il contatore token è a 0 per costruzione
   (`costo-ai.mjs:112`: le stime non alzano `token_totali`); oggi risultano 4 voci di costo mentre sono girati
   anche ritmo-sera, decine di chat e 2 recuperi. GATE-BUDGET, letargo e STOP confrontano soglie con uno zero.
2. **La memoria dei giri è bloccata da un token vero nei report** (AR-124, bloccante) — `scan-segreti` esce 1
   ADESSO: la radiografia del mattino ha incollato 3 volte un PAT GitHub reale nel proprio archivio. I giri non
   pubblicano (le chat sì: `sync_vault` non fa lo scan) → «scritture pendenti» recuperate a mano alle 18:00 e 20:20.
3. **Il Pannello martella GitHub senza cache** — ~19 poller (6s/8s/30s/60s…), ~37 richieste/min per tab, ogni
   fetch `no-store`, inclusa la scansione ricorsiva dell'intero albero del repo; la home è UN client component
   da 3.209 righe. Rischio rate-limit (5.000/h) = Cabina che mostra dati vecchi senza dirlo.
4. **Ogni chat costa doppio e tutto gira premium** — ogni turno >160 caratteri accoda una metabolizzazione
   (2° run AI, O(n²) sulla conversazione); il router economico è solo-consiglio (`worker.sh:1292`); ~103KB di
   prompt fissi caricati a ogni run; le cadenze del ritmo accendono il premium ogni giorno bypassando il delta-gate.
5. **~40 guardiani per giro, ma i verdetti finiscono nel vuoto** — quasi tutti chiusi da `|| true`: exit-code
   ingoiati (KPI 81/120 scoperti, contratti violati, north-star ferma da 22 giorni) → il giro da 22 minuti
   produce diagnosi che nessuno ascolta.

Cosa funziona e va tenuto: il **delta-gate** (giro senza novità = 1-3s invece di 22 min), lo streaming con
skip-se-invariato, i timeout su ogni curl (fine outage 9/7), il claim atomico a 2 lane, il recupero orfani.

## 📊 Verdetto

**Macchina: 0/100** — 111 difetti confermati (8 bloccanti · 66 gravi · 37 minori).
**Pannello: 0/100** — 62 bug confermati (7 bloccanti · 33 gravi · 22 minori).

⚠️ **La scoperta più importante riguarda il voto stesso:** le sonde delle ultime settimane mostravano
**100/100**, ma quel numero era **falsificato** — `allinea-scan-cantiere.mjs:166` sovrascrive il voto dei
12 pilastri col voto-cantiere (che vale 100 appena i difetti risultano "chiusi"). La radiografia del 7/7
aveva dato 0 nel report e 100 nel JSON che legge il Pannello. La Cabina ti ha mostrato per 9 giorni una
salute che non esisteva.

### Scorecard per dimensione (macchina)
| Dimensione | Voto | Stato | Difetti |
|---|---|---|---|
| coerenza-agenti | 60 | attenzione | 4 |
| vettori-installati | 44 | attenzione | 7 |
| salute-sensori-dati | 21 | attenzione | 10 |
| integrita-memoria | 0 | critico | 12 |
| chiusura-volano | 2 | critico | 9 |
| cadenza-esecuzione | 5 | attenzione | 13 |
| calibrazione-onesta | 38 | attenzione | 9 |
| copertura-cieca | 54 | attenzione | 6 |
| guardrail-semaforo | 0 | critico | 13 |
| allineamento-northstar | 0 | critico | 8 |
| efficienza-costo | 16 | critico | 9 |
| rischio-sicurezza-se | 0 | critico | 11 |

### Scorecard Pannello
| Dimensione | Voto | Stato | Bug |
|---|---|---|---|
| navigazione-routing | 58 | attenzione | 7 |
| stato-persistenza | 19 | critico | 8 |
| freschezza-dati | 39 | critico | 6 |
| stati-async | 26 | critico | 8 |
| coerenza-azioni | 29 | critico | 7 |
| robustezza-errori | 24 | critico | 6 |
| accessibilita-mobile | 3 | critico | 11 |
| performance-render | 31 | attenzione | 9 |

## 🚨 Gli 8 bloccanti della macchina (in parole semplici, per impatto sulla crescita)

1. **Il voto di salute che vedi in Cabina era falso.** `allinea-scan-cantiere.mjs:166` sovrascrive il voto
   della radiografia col voto-cantiere: il 7/7 la radiografia diceva 0, il Pannello mostrava 100. → AR-105
2. **Il freno del budget AI è morto.** Il gate confronta la soglia con un contatore che è sempre 0 (le voci
   `--stima` non alzano `token_totali`): la macchina può bruciare quota senza che nulla scatti. → AR-111
3. **Il percorso firma→esecuzione non chiude.** Il bottone «Approva» del Pannello crea solo un lavoro
   testuale: il marcatore APPROVATA che la regola AR-103 pretende non lo scrive nessuno tranne il worker
   stesso — cioè l'esecutore si auto-certifica la firma. → AR-108
4. **L'autopilot marketing si fida del colore auto-dichiarato.** Il freno «colore minimo del canale»
   (AR-074) esiste solo come commento: una voce marcata 🟢 nel file-dati parte in LIVE anche se il canale è
   email a persone reali. → AR-107
5. **22 giorni di North Star a zero non fermano niente.** Il guardiano della stella polare è l'unico «soft»
   (`|| true`): la macchina si ferma per una checklist stantia ma non per tre settimane senza un ordine. → AR-109
6. **Nessuno misura quanto sforzo va sulla macchina invece che sul business.** Le PR sul Pannello (la quota
   dominante del lavoro recente) sono invisibili ai guardiani di allocazione, che dichiarano «allocazione
   sana». → AR-110 (pezzo nuovo)
7. **Zero esperimenti da sempre, e il gate che li pretende è scollegato dal battito.** `esperimenti-check`
   esce rosso ma `giro.sh` ne ingoia l'exit code; AR-041 risulta «chiuso» mentre il problema è vivo. → AR-106
8. **Un frammento di GitHub PAT è in DECISIONI.md.** Lo scan-segreti fallisce a OGNI giro e la
   pubblicazione della memoria è in deadlock permanente; serve la tua decisione (ruotare il token +
   eccezione di redazione all'append-only). → AR-112 · **domanda per te, gravità alta**

## 🖥️ I bloccanti del Pannello (i sintomi che avevi segnalato, ora localizzati)

- **Le risposte del worker non compaiono mai nelle chat delle caselle/lavori** («La risposta non è
  arrivata» anche quando c'è): il polling legge la lista lavori che NON contiene il campo risultato, e
  nessuno chiede mai il dettaglio. `pannello/src/lib/parla.ts:113-120` + `ChatCasella.tsx:32-40`. → AR-120
- **Le chat casella/lavoro non vengono mai salvate sul server**: cambio sezione o refresh = conversazione
  persa con la risposta dentro. → AR-121
- **Un'azione approvata che finisce «in coda» non riparte mai** e non si può ri-approvare: vicolo cieco
  permanente. `api/azioni-pronte/route.ts:72,96-103`. → AR-122
- **Aprire «Parla con questa casella» cancella la chat dell'Assistente.** `page.tsx:1949-1969`. → AR-123
- Il tasto **INDIETRO** ha 4 difetti distinti confermati (voce duplicata all'avvio, voci «legacy» che
  intrappolano, `sub` stantio trascinato tra aree, prima scheda non registrata) — tutti gravi/minori, tutti
  con fix puntuale nel report.

## 🧮 Le cause radice ricorrenti (i «5 perché» convergono su 4 sistemi)

1. **Guardiani muti:** il pattern `| tail -4 || true` in `giro.sh` ingoia l'exit code dei check di
   struttura (registro agenti, keyword-owner, esperimenti, north-star) — il principio AR-081 «rc≠0 →
   vincolo HARD» è stato cablato solo sui guardiani di business. *Un check che fallisce cronico viene
   silenziato invece di generare un task.*
2. **Il volano non chiude sull'esterno:** 0 esperimenti misurati, 100/120 quaderni fermi (79 vuoti),
   81/120 senior senza KPI in OKR-Squadra: la macchina sa AGGIUNGERE capacità più in fretta di quanto
   sappia cablarle nei suoi sistemi di governo.
3. **Una sola verità violata sui fatti della macchina:** il conteggio senior è scritto a mano in 5 file
   (120/42/40), il GLOSSARIO-KPI è fermo al seed del 27/6 — il registro-fatti governa il business ma non
   i fatti su sé stessa.
4. **Pannello: lo stato vive nel posto sbagliato:** chat in `useState` locale invece che nello store
   server, cronologia timbrata senza contratto (sub trascinati, voci legacy), liste senza refetch dopo
   mutazione.

## 🔮 Pre-mortem (5 scenari) e 🏆 benchmark (10 mestieri)
Nel file archivio: il disastro più probabile è il **loop che brucia la quota AI** (probabilità alta —
ed è già mezzo successo oggi: la radiografia stessa si è fermata a metà per session-limit). I divari più
alti nel benchmark: **pricing, CRO/funnel, email-CRM, SEO locale, consegne** — tutti ambiti dove il
mestiere c'è (senior) ma mancano dati reali e esperimenti misurati.

## 🚧 Cantiere
**+19 difetti a impatto-alto** (AR-105..AR-123) — entrati con prova di chiusura machine-checkable (AR-023).
Gli altri 154 difetti (impatto medio/basso) restano nell'archivio, fuori dal cantiere per tenerlo
lavorabile: scelta dichiarata qui, non silenziosa. Stato cantiere: **19 aperti · 43 chiusi**.

## 🙋 Cosa serve da te (le 6 domande, la prima è urgente)
1. 🔴 **Ruota il GitHub PAT** e autorizza il commit di sola redazione su DECISIONI.md (sblocca la
   pubblicazione memoria). → card in coda
2. Confermi il **pacchetto fix guardiani** (de-silenziare exit code + voto non falsificato)? → card in coda
3. Confermi il **pacchetto fix Pannello bloccanti** (chat/risposte + azioni in coda)? → card in coda
4. GLOSSARIO-KPI fermo al seed 27/6: lo confermiamo/aggiorniamo?
5. Organigramma 120 senior in fase 0-ordini: congeliamo i dormienti con deroga esplicita?
6. Sensori uptime costruiti ma mai puntati (URL mancanti): li colleghiamo?

*Ogni numero di questo report ha fonte: i due output dei workflow (26+16 agenti) e i guardiani eseguiti
dal vivo (`agent-registry-check`, `chiusura-loop --sonda`, `verifica-sensori`, `coerenza-fatti`,
`allocazione-check`). Nessun fix è stato applicato.*
