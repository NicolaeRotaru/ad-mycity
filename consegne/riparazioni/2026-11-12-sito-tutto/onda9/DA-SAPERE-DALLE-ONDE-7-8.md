---
data: 2026-11-17 21:58
tipo: passaggio di regia
da: chat «Ondata 7 difetti» (session_015BmpnWeHkst12TRwrzmMfw)
a: chat «Ondata 9» (session_015BmpnYq3DQDRwTXdBwfzud)
---

# Quello che serve alla regia dell'onda 9 e non sta nel quaderno

## In parole semplici
Sono le cose imparate stasera, dall'onda 7 all'onda 8b: alcune hanno fatto perdere soldi o tempo, altre li hanno fatti risparmiare. Vanno lette prima di aprire le sessioni dell'onda 9.
Esempio: stasera R04 dell'onda 7 ha speso 30,77 $ contro un tetto di 28 $, perché i suoi controllori interni erano già partiti quando la regia ha detto «consegna».

## Cosa cambia per te
Niente: è un foglio per la regia.

## Cosa devi fare
Niente.

## Cosa non ho verificato
Che le regole valgano con 10 riparatori invece di 3-4: stasera non ce n'erano mai più di 5 insieme.

---

## Dettagli tecnici

### La spesa
- I riparatori, i collaudatori e i controllori quasi sempre non vedono il loro `usage.cost_usd`: lo legge la regia con `get_session <id>`. Anche dalla regia, a volte compare solo a turno chiuso.
- La regola che ha tenuto: «oltre 20 $ niente lotti nuovi» e «a 24 $ consegna», detti dalla regia. Si sfora lo stesso di 2-4 $, perché gli smentitori sono già partiti: R03 dell'onda 7 è arrivato a 28,85 $, R04 a 30,77 $. Con 20 voci a testa servirebbe consegna a 40 $ e tetto 45 $, come nel quaderno.
- Un riparatore costa circa 2,15 $ per voce data. Il collaudo circa 0,5-1,2 $ a voce, il controllore 6-8 $.

### Il primo messaggio alle figlie
Il testo esatto sta nel primo evento delle sessioni dell'onda 8 (si legge con `list_events`):
- riparatore: `session_015BmpnZ6qEcy4RimJZsZwsH` (O8 · R01);
- riparatore delle correzioni scritte: `session_015BmpnYRBGAQ3sBM96pErCE` (O8b · R01);
- collaudatore: `session_015BmpnUupLXTjHZjUohMe4U` (O8 · K01);
- controllore: `session_015BmpnZ5HU2NaFXoXnK6nTs` (O8 · C01).

Le regole che hanno funzionato, da rimettere: niente parametro `model` (tutti Opus, se no la misura non si legge); il piano per conoscenza, poi via senza aspettare; il referto spinto dopo ogni voce; prima di riparare, controllare che il codice ci sia ancora sulla base; niente migrazioni, privacy, permessi o soldi; non toccare prove esistenti che non importano i propri file; esiti ammessi `riparato`, `parziale`, `serve_file_altrui`, `non_fatto` (mai `non_iniziata`), `gia_riparato_prima`, `scelta_di_nicola`. Ai collaudatori e controllori (che lavorano in ad-mycity, dove l'SQL è permesso): mai strumenti Supabase, Vercel, Stripe o psql verso il database vero, scritto anche nel mandato dei subagenti.

### I rossi che tornano
- **`guardia-ramo` sulle prove esistenti comuni** («una prova esistente che usa file di altre sessioni: la tocca solo la regista»). È scattata due volte stasera, R03 dell'onda 7 e R01 dell'onda 8. Entrambe le volte il collaudo ha detto «non indebolite» e Nicola ha firmato un'eccezione in `piano.json` (`eccezioni_firmate`, regole `prove_comuni` e `prova_esistente_altrui`). Senza firma, `applica` blocca tutta la cartella.
- **`guardia-ramo` vieta di cancellare una prova esistente o di toglierle asserzioni**, senza deroga: R02 dell'8b ha dovuto ritirare due correzioni fatte bene.
- **Le correzioni scritte stanno quasi sempre in file che non sono della voce.** `dividi` deve ricevere i file che servono: con `--file-chiavi` e un `pronte.json` accanto (`precedenti[k].file_che_servono`), oppure aggiungendoli al piano prima delle schede. Stasera nell'8b l'ho fatto a mano dopo la partenza.
- **I referti di lavoro hanno lo stesso nome fra cartelle** (`.riparazione/referto-R01.json` nell'onda 8 e nell'8b): prima di unire rami di cartelle diverse, togliere `.riparazione/` dall'integrazione, o l'unione litiga.
- **`applica` legge i referti in `<cartella>/referti/RNN.json`** (non `referto-RNN.json`): copiarli così.
- **Il guardiano dei fatti** esenta solo `ondaN/registro-compatto.txt`, con N solo cifre: una cartella `onda8b/` lo fa fallire. Nomi di cartella solo `ondaN`.
- **I nati visti dai collaudatori non entrano da `applica`**: vanno scritti a parte. Quelli dell'onda 7 sono in `onda7/sessioni.json`, chiave `nati_fuori_voce`. Il grave del carosello sponsorizzato l'ha riportato anche R03 dell'onda 8 nel suo referto, quindi dovrebbe essere già nel registro: da controllare.

### Dove stanno le cose
- Clone del sito: `/home/user/mycity` (accanto a `/home/user/ad-mycity`). Alcune figlie hanno clonato ad-mycity in `/home/ad-mycity` e messo un collegamento.
- Integrazione delle onde 8 e 8b: `ccr-30918361-coyajm-o8` @ `7f59df78` (mycity#296). Se giovedì non è unita, l'onda 9 parte da lì; se è unita, da main.
- Il programma della scelta dell'onda 9: `onda9/scelta-onda9.mjs` (esclude le voci dell'onda 8 e dell'8b).
- Le due riservate di stasera (permessi della chat su R01-007 dell'onda 7, privacy delle recensioni su R04-011) sono solo in chat: non vanno mai nei depositi.
