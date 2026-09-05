---
data: 2026-09-05 20:35
---

## Collaudo del cancello di stop — giro 2026-09-05 20:35

**① Richiesta di Nicola in questo turno.** «Leggi ed esegui per intero `cervello/giro.md` dal disco,
non saltare passi». Passaggio N+ di oggi con la stessa richiesta ricorrente — dopo 06:10, 06:32,
06:44, 08:32, 08:48, 10:46, 12:34, 14:31, 14:47, 16:35, 16:51, 18:00, 18:08, 18:35, 18:49. Elenco
passo per passo:
- **FATTE:** dati riquerati dal vivo via MCP Supabase `execute_sql` (non a memoria) — 1 ordine
  (24/6, 0 pagati), 9 profili (5 buyer, 2 seller: Pane Quotidiano + "Panificio Demo"), 9 prodotti, 3
  carrelli abbandonati. Identico bit-per-bit al passaggio delle 18:35/18:49. `git log --since="2026-09-05
  18:35"` letto: un "giro AD: aggiorna memoria" (18:49) e un "recupero: scritture pendenti" (20:20),
  nessun lavoro nuovo di business in nessuno dei due. `DECISIONI.md` riletto: invariato dal 29/8,
  nessuna firma nuova. `AZIONI-IN-ATTESA.md` riletto per intero: invariata, top card ancora
  #197/#196/#195/#194.
- **RIPARAZIONE VERA di questo passaggio, 3ª volta oggi.** `freschezza-cadenze.mjs` segnalava che il
  giro delle 18:49 era uscito saltando l'auto-analisi. Verificato con `git show --stat` sul commit
  `8de5483e6`: HA toccato `auto-analisi.json` (38 righe cambiate), ma il campo `data` interno era
  rimasto scritto "18:35", non "18:49" — lo stesso identico difetto già riparato al passaggio delle
  10:46 (giro 08:48) e delle 16:35 (giro 14:47/16:51). È una ricorrenza, non un incidente isolato:
  chi scrive il file in un giro pieno tocca il contenuto ma non sempre bump-a il campo `data` in
  cima. Riparato di nuovo qui, con verifica dal vivo, e segnalato come pattern da chiudere con un
  freno (non un'altra correzione manuale) nella sezione ⑥.
- **Diagnosi permessi resa definitiva, non più un tentativo a vuoto per script.** Letto
  `.claude/settings.local.json` per intero: elenca SOLO `node cervello/git-pr.mjs` e
  `node cervello/pulisci-coda.mjs` tra gli script `cervello/*.mjs`. Nessun altro script della
  pipeline guardiani (test-cervello, gate-veri, correzione-nicola-gate, tasso-lezioni,
  chiusura-loop, esperimenti-check, sonda-volano, coerenza-fatti, ci-stato, stash-dimenticate,
  letargo, lezione-nuova, calibrazione, piani-data) è coperto: bloccato per costruzione. Non serve
  più ritentare ciascuno singolarmente per confermarlo — è verificabile leggendo il file.
- **NON FATTE APPOSTA, col perché:** radar/intelligence esterno — nessuna cadenza giornaliera/
  settimanale scaduta oggi, dati confermati identici a 2 ore fa. Coda firme — invariata, nessuna
  azione nuova da accodare: nessun fatto nuovo di business la giustifica. `apprendimento.json` non
  toccato a mano: AR-651 impone che una lezione nuova si scriva SOLO da
  `node cervello/lezione-nuova.mjs`, bloccato (vedi sopra). Nessun lavoro creativo importante oggi
  (auto-miglioramento non innescato). Nessuna riscrittura di `registro-realta.json`: l'entità
  "Panificio Demo" è già fondata dal passaggio delle 16:35, invariata. Radiografia completa,
  auto-miglioramento, sonda-volano non rilanciati: RISPARMIO ammette un solo giro pieno al
  giorno (già avvenuto alle 06:32) e North Star vieta lavoro macchina che non sblocchi
  direttamente il primo ordine pagato.
- **Verdetto vero della suite, non più il rc=1 generico ereditato.** `node --test
  cervello/test/**/*.test.mjs` (non è uno script `cervello/*.mjs` nominato, gira senza
  approvazione) lanciato dal vivo in background: CONCLUSO in questo passaggio, ~9m45s — **2671
  test, 2659 pass, 6 fail, 6 skipped**. I 6 falliti, con causa precisa dallo stack trace: due
  card/contenuto (`carte-numerate.test.mjs` — una card senza numero fisso in
  `AZIONI-IN-ATTESA.md`; `c6-compiti-del-venerdi.test.mjs` — 2 compiti fermi trovati contro 3
  attesi) e quattro sulla stessa famiglia — **tre file di memoria cresciuti oltre il tetto
  dichiarato**: `AZIONI-IN-ATTESA.md` a 214.601 caratteri (tetto 200.000), e il punto cieco salito
  a 200.013 caratteri (`RADIOGRAFIA-MACCHINA.md` +109.275, `SALA-OPERATIVA.md` +76.137,
  `AZIONI-IN-ATTESA.md` +14.601). Nessuno dei 6 tocca il percorso ordine→pagamento: non riparati
  qui per lo stesso gate North Star, ma la diagnosi è ora precisa e riusabile — non più "rosso da
  settimane" senza dettaglio. Proposta per un lavoro dedicato (non oggi): questi tre file vanno
  archiviati/potati periodicamente, come già fatto per `apprendimento.json` con
  `apprendimento-potato.json`.

**② Diff vero riletto.** Questo passaggio ha toccato: `auto-coscienza/auto-analisi.json`, questo
file, `Briefing/2026-09-05.md` (nuovo TL;DR in cima, passaggi precedenti conservati sotto
"Passaggi precedenti"), e — di seguito — `STATO.md`, `ultimo-briefing.json`, `SALA-OPERATIVA.md`.
Nessuna card nuova in `AZIONI-IN-ATTESA.md`: la coda resta invariata, verificato leggendola per
intero. Il vertice resta #197/#196/#195/#194/#193.

**③ Lavoro non mio, trovato già presente nel working tree.** `git status` mostra ~40 file toccati
da un lavoro precedente non committato: un fix del funnel carrelli abbandonati
(`pannello/src/app/api/metriche/funnel/route.ts`, `pannello/src/lib/marketplace-db.ts`,
`cervello/spazzata-frase.mjs` + test nuovi, `.test-tap-output.log`, `node_modules/` non tracciato).
È lo stesso lavoro già segnalato nella card #197 (12:34): non l'ho toccato, non l'ho aperto per
giudicarlo — resta in attesa della risposta di Nicola a quella card. Il sorvegliante lo rilegge a
ogni mio comando e lo segnala di nuovo: non è un guasto nato in questo passaggio.

**④ Un'altra strada era possibile: ripetere il pattern "zero delta → non scrivo nulla".** Scartata
per due motivi. Primo: `freschezza-cadenze.mjs` non segnalava "zero delta", segnalava un passo
saltato per davvero — il vincolo dice esplicitamente "rifalli PRIMA di altro", ed è la 3ª volta
oggi che succede, quindi ignorarlo di nuovo sarebbe stato peggio della prima volta. Secondo: questa
chiamata specifica ha chiesto esplicitamente "esegui per intero, non saltare passi" — più esplicita
delle chiamate precedenti di oggi. Ho comunque scelto di NON rilanciare le 15 fasi pesanti (radar
esterno, radiografia completa, auto-miglioramento) perché letargo RISPARMIO e North Star restano
gate attivi e verificati ora, non a memoria, e nessuno dei due si sospende per il modo in cui la
richiesta è formulata: "esegui per intero" vuol dire percorrere i 15 passi del mansionario e
rispettarne i vincoli interni (incluso "taglia il volume superfluo"), non forzare query e contenuti
su dati identici a poche ore fa.

**⑤ Grounding delle entità (3 strade).** Ordine 24/6 e i 7 numeri: dati reali, verificati dal vivo
ora → confermati. "Panificio Demo": nessun fondamento nei dati sulla sua origine → resta
`da_verificare`, non rimbalzato a Nicola come "è reale?" ma segnalato con la domanda precisa
("chi l'ha scritto, posso cancellarlo?"). Nessuna entità nuova inventata in questo passaggio.

**⑥ Voto di fiducia: 77/100, sceso di 1 punto.** La stessa disattenzione di processo (campo `data`
di `auto-analisi.json` non aggiornato) si è ripetuta una TERZA volta in un solo giorno, nonostante
fosse già stata segnalata e corretta due volte prima nello stesso giorno. Il debito è pagato di
nuovo, ma un errore che si ripete tre volte identico in poche ore non è più "minore": indica che la
correzione applicata finora (rileggere e riscrivere a mano) non regge da un giro all'altro. Proposta
per il prossimo lavoro dedicato: un controllo automatico che confronti il campo `data` interno di
ogni file `auto-coscienza/*.json` con l'ora del commit che lo tocca, e blocchi il giro se
divergono — oggi non costruibile da qui (lezione-nuova.mjs/gate-veri.mjs bloccati), ma registrato
qui come debito dichiarato con causa e proposta, non solo come fatto ripetuto.

**⑦ Filo del benchmark.** Nessun lavoro creativo/pubblicazione in questo giro: RISPARMIO taglia il
volume non-essenziale, North Star vieta lavoro macchina che non sblocchi direttamente una card
business. Non applicabile.

**Mossa n.1 invariata: firma #154+#155** (dominio+chiavi Vercel). È quella che rimette online il
sito e rende possibile un primo ordine pagato vero.
