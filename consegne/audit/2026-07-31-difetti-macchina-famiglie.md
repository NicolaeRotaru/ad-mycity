---
data: 2026-07-31 01:40
tipo: analisi
argomento: raggruppamento dei difetti aperti della macchina per causa comune
colore: 🟢
---

# I difetti della macchina — 163 aperti, 10 famiglie, 5 organi

> Analisi richiesta da Nicola: raggruppare i difetti per causa comune, ordinarli per
> priorità, e dire come sarà la macchina una volta finita.
> Pagina visiva: https://claude.ai/code/artifact/aa554ddb-b6f8-4a4e-a3a2-22da3fb2725a

## I numeri (misurati, non stimati)

| misura | valore | fonte |
|---|---|---|
| schede totali | 404 | `cantiere-difetti.json` |
| chiusi / aperti | 241 / **163** | idem |
| bloccanti aperti | **6** (tutti riverificati sul codice vero) | grep diretto |
| non chiudibili da nessun guardiano | **88** | `cantiere-prove.mjs` |
| saldo 10→30 luglio | **+154** (359 nati, 205 chiusi) | calcolo su `nato`/`chiuso_il` |
| copertura ultima visita salute | 0.63 — 9 ok, 1 rotto, 6 non visti | `salute.json` 29/7 17:05 |

**Gravità degli aperti:** 6 bloccanti · 117 gravi · 2 alto · 7 medio · 31 minori.

## Il meccanismo — perché 163 restano aperti

| prova sulla scheda | chiusi (241) | aperti (163) |
|---|---|---|
| comando che **esegue** (test vero) | 150 (62%) | **5 (3%)** |
| pattern in un file (debole) | 66 (27%) | **127 (78%)** |
| nessuna / solo umana | 25 (11%) | 31 (19%) |

**Un difetto si chiude quando qualcuno gli scrive un test vero.** I 163 aperti sono
aperti quasi tutti perché nessuno ha convertito la prova da «cerca questa parola» a
«esegui e guarda l'effetto». Da qui i 57 con prova che non scatta da giorni (punta a un
file cambiato) e i 31 a verifica umana: **88 su 163 non possono uscire dal cantiere da
soli**, per costruzione.

Corollario che decide la strategia: il cantiere **cresce** (+154 in 14 giorni con
attività). Chiuderli uno per uno è una corsa che si perde. La leva è curare la
**malattia** con un organo condiviso + un guardiano con tetto a scendere.

## Le 10 famiglie (163/163 assegnati, nessuno escluso)

| # | famiglia | difetti | bloc. | l'organo condiviso |
|---|---|---|---|---|
| 0 | Il canale di riparazione è tappato | 16 | 1 | un solo modo di pubblicare: sporco messo da parte e rimesso identico; rebase che non parte = errore col motivo, mai «conflitto» |
| 1 | Le cose che fanno danno vero | 15 | 3 | prenotazione condizionata prima di ogni atto reale; serratura senza esenzioni; permessi a elenco, non jolly |
| 2 | La macchina muore e Nicola non lo sa | 10 | 2 | consegna allerta **con ricevuta**, a cascata; «processo vivo» ≠ «sta producendo» |
| 3 | Il verde che non sa | 21 | 0 | tipo di risposta a **tre stati** (✅/❌/⚪), ⚪ mai un verde — 88 istanze già censite |
| 4 | Il freno montato su una porta sola | 21 | 0 | freno **sul dato**, un passaggio obbligato; guardiano che conta le strade all'atto |
| 5 | La prova che non prova | 25 | 0 | cancello che rifiuta la prova a parola sui gravi; ponte scoperta→cantiere; owner + data obbligatori |
| 6 | I soldi che nessuno misura | 11 | 0 | costo come voce di conto economico; burn stimato con confidenza dichiarata |
| 7 | I 120 senior che non lavorano | 18 | 0 | turno letto dalla cartella agenti; workflow apre il mansionario vero; metro sul risultato |
| 8 | Il Pannello | 18 | 0 | identità stabile assegnata alla nascita; indirizzo che porta area+scheda; regole del tocco nel CSS condiviso |
| 9 | La rotta sbagliata | 8 | 0 | vincoli letti da `registro-fatti.json`; cadenza che confronta piano e realtà |

**Ordine:** prima ciò che impedisce di riparare (0), poi il danno vero (1), poi il buio
(2), poi i moltiplicatori (3-5), poi il resto (6-9). I lotti 0-2 sono i più piccoli
(41 difetti) e sono quelli che cambiano la vita di Nicola.

## I 6 bloccanti — riverificati sul codice vero il 31/7

Non sulla scheda: con grep sul file. Tutti e 6 genuinamente aperti.

| id | cosa | prova che manca |
|---|---|---|
| AR-449 | blocca **ogni** PR dal VPS, dando la colpa a un conflitto inesistente | lotto 0 |
| AR-388 | il server butta il lavoro che aveva promesso di tenere | `git stash push` assente in `vps/aggiorna-cervello.sh` |
| AR-412 | due dita sul pulsante mandano **due volte** l'azione vera | `in-corso` assente in `api/azioni-pronte/route.ts` |
| AR-206 | la macchina può scriversi un programma ed eseguirlo | jolly `Bash(node cervello/*.mjs:*)` ancora in `.claude/settings.json:23` |
| AR-365 | l'allerta «macchina morta» esce solo da Telegram (spento) e si dichiara inviata | `consegnaAllerta(` assente in `sentinella-dati.mjs` |
| AR-366 | il battito dice «vivo» anche quando non produce più niente | `worker:ultimo:lavoro-riuscito` assente in `worker.sh` |

## Le malattie già censite — nessuna sta calando

`errore-ingoiato` 66 istanze/28 file · `esito-di-scrittura-buttato` 22/11 ·
`perimetro-dedotto` 5/7 · `cadenza-copiata-a-mano` 3/1 — **tutte «invariata»**.
Le prime due (88 istanze) sono il cuore del lotto 3 e si curano con lo stesso organo.

## Come sarà la macchina finita — e la risposta sulle radiografie

**Non si arriva a «zero difetti per sempre»**, e prometterlo sarebbe una bugia: una
macchina che cambia genera difetti nuovi (359 in 14 giorni). Il numero non è il problema.

Quello che si ottiene:

1. **Nicola non ordina più una radiografia** — diventa un battito automatico che porta
   solo il delta: cosa è peggiorato dall'ultima volta.
2. **Un difetto curato non torna nella stessa forma**, perché ogni cura lascia un
   guardiano con un tetto che scende e non risale. Oggi i tetti esistono per 4 malattie
   e nessuna è scesa; a fine lavoro esistono per tutte e 10 e scendono.

**Il segnale di «finito» non è 163 → 0.** È: il saldo si inverte (chiude più di quanto
trova, per due settimane di fila) e i bloccanti restano a zero senza che nessuno li
rincorra. Da lì il cantiere è manutenzione, non emergenza.

Nella giornata tipo: la macchina non si interroga, parla lei e parla poco — cosa ha
fatto stanotte, le 2-3 cose da firmare (con «cosa cambia» e «se va bene»), e l'elenco
onesto di ciò che **non ha potuto vedere**, col motivo. Nicola resta dove è
insostituibile: trattative, firma sui 🔴, rotta.

## Cosa NON è stato fatto in questo lavoro

Questa è **analisi**, non riparazione: nessun difetto è stato chiuso, nessun codice
toccato. Il lotto 0 è il prossimo passo naturale — e va fatto per primo perché finché
`AR-449` è aperto ogni riparazione consegnata dal VPS costa il doppio.
