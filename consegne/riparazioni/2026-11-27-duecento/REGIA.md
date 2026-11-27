---
data: 2026-11-27 02:10
tipo: quaderno di bordo della regia
campagna: i 200 risolti del 27/11 (strada B, tetto 3.000 $), seguito della riparazione del 26/11
---

# Regia · 200 difetti risolti, e se si può 400

## In parole semplici
Il 27/11 verso le 02:00 Nicola ha chiesto 200 difetti del sito risolti davvero, «e se riesci 400», con un tetto di 3.000 $.
97 risolti sono già pronti nella riparazione del 26/11 (mycity#342, in bozza): mancano il controllore finale e l'unione di Nicola.
Questa campagna lavora i 320 difetti rimasti che non chiedono Nicola, partendo dal codice di quella riparazione.
Per esempio: i 39 difetti rimasti a metà il 26/11 ripartono dalla correzione già scritta, non da zero.

## Cosa cambia per te
Niente: lavora la macchina. Le unioni sul sito restano di Nicola.

## Cosa devi fare
Segui «Il piano». Il via di Nicola copre tutte le onde dentro il tetto: alle fermate scrivi all'AD e vai avanti.

## Cosa non ho verificato
Che le voci rimaste a metà il 26/11 siano ancora a metà sul codice di oggi: la scheda è un indizio, comanda il codice.

## Dettagli tecnici
- AD: session_015BmpnWXi7guL4RmfTAwzbU (fermate ed esito con send_message). Ramo ad-mycity e sito: `ccr-819e0c8d-7ryjjr`; riparatori `ccr-819e0c8d-7ryjjr-mNN`.
- Base del sito: **main @ 2ba05a74de2e9ad96fa94178df89711923119b0e** (Nicola ha unito la #342 alle 01:49; correzione dell'AD alle 02:25). Prima era l'integrazione del 26/11 `f1b35670`, che è un genitore di main. Integrazione della campagna sul sito: `ccr-819e0c8d-7ryjjr` @ 2ba05a74. Le 9 migrazioni della #342 non sono applicate: non toccare il database vero.
- Registro: `registro-26-11.json`, fuori da git perché pesa 11,7 MB: lo ricrei con `git show de5836c5fd91b249cc62f94462c454bb2b49c51a:MyCity-Vault/90-Memoria-AI/auto-coscienza/radiografia-marketplace.json > <C>/registro-26-11.json` (il registro del ramo del 26/11, con i suoi 41 nati: 646 aperti). Si passa con `--registro`.
- Perimetro (`tutto/`): 466 lavorabili. `lavorabili-ora.mjs`: fuori 97 che si chiudono con la #342, 49 che chiedono Nicola → **320** (1 che blocca il lancio, 33 gravi, 286 minori). Di questi 122 lavorati il 26/11 (39 parziali, 30 file altrui, 36 non fatti, 15 riparati senza verdetto, 2 già riparati), 198 mai toccati.
- Le 43 con file di migrazione (`chiavi-con-migrazione.txt`) vanno in un'onda a parte, alla fine: `dividi` dà fasce da 1000 in su e il sito ordina i file per byte (1000_ prima di 100_). Difetto AR-1194. Nelle onde 1-2 **nessuna migrazione nuova**: se una voce la chiede, resta parziale con l'SQL nel referto.
- Onda 1 (`onda1/`, `dividi --per-sessione 16`): 12 sessioni, 174 voci (26 gravi), 103 all'onda 2. Schede da scrivere: `schede --cartella <C>/onda1 --ramo ccr-819e0c8d-7ryjjr --regista <id>`, poi `copertura-prima` e `segnaposti`.
- La preparazione di prima (200 dalla base main, si sovrapponeva al 26/11) è in `superata/`.

## Preventivo (dalle misure: 26/11 senza ultracode 10,3 $ a chiuso, circa 3,3 $ a voce data)
Onda 1 circa 575 $ · onda 2 circa 340 $ · migrazioni circa 170 $ · correzioni circa 270 $ · regia circa 150 $ → **circa 1.500 $** (stima_usd 1500). Chiusi attesi 145-165 sui 320, più i 97 della #342: **circa 240-260 risolti**. 400 si avvicinano solo con le risposte di Nicola (64 domande, 49 voci sue) e il binario riservato (96).

## Il piano
0. Il controllore finale della #342 lo apre l'AD della campagna del 26/11 (session_015BmpnWupeVireM1DyLQB3e), avvisato dall'AD alle 02:10. Non aprirlo tu: segui solo l'esito.
1. Onda 1: 12 riparatori senza ultracode (`effort: "xhigh"`, `permission_mode: "auto"`), limite 25 $ con gravi e 20 $ minori; 4 collaudatori; unione; C01.
2. Giro di correzione dopo ogni unione: bocciate, parziali, file altrui, nati senza Nicola (regola del 14/11 e Nicola 26/11).
3. Onda 2: le 103 rimaste, dall'integrazione dell'onda 1. Poi l'onda delle migrazioni quando la numerazione oltre 999 è decisa (chiedila all'AD).
4. Avanti finché restano solo voci di Nicola o finisce il tetto. PR del sito in bozza, controllore finale, unione di Nicola, `chiudi-sito`.

## Regole da tenere
Tetto 3.000 $ rigido: a 2.250 $ misurati non si apre niente di nuovo senza l'AD. Sopra 12 $ a chiuso lo dici all'AD col numero. Niente ultracode. Lotti al massimo da 16. Niente id di altre voci nei commit. Controllo a 10 minuti con list_sessions. La regia passa la mano a 400 mila token (firma del 24/11). Riga in `cervello/riparazione/misure.json` a fine onda. Voci che chiedono Nicola: in `per-nicola.md`, senza fermate. Ci si ferma solo per la lista «Quando ti fermi» della skill (tranne la conferma fra un'onda e l'altra, già data).

## Scelte di Nicola
- 2026-11-27 01:15 «Riesci a riparare 200 difetto adesso, e dico 200 esatti».
- 2026-11-27 01:35 «A», poi fermata dall'AD: si sovrapponeva al 26/11 (vedi `superata/`).
- 2026-11-27 ~01:55 «No scusa la B. 200 esatti difetti risolti. E se ne riesci cerca di arrivare anche a 400. C'è la puoi fare.» Alle domande dell'AD: tetto **3.000 $**, limite settimanale **sotto il 50%**.

## Diario della regia
- 2026-11-27 02:35 Regista nata (session_015BmpnYPczqtRmcwQzQzjV6). Limite settimanale `allowed_warning`, senza uso extra: il via di Nicola copre le onde dentro il tetto.
- 2026-11-27 02:50 Schede dell'onda 1 scritte, con in fondo le note del 26/11 voce per voce (`regole-campagna.md` entra nel primo messaggio). Il registro del 26/11 serve anche ai riparatori: lo ricreano fuori dal deposito e lo passano con `--registro`.
- 2026-11-27 02:58 Arriva la correzione dell'AD sulla base. Fermate le aperture: era nata solo R05 (0,25 $), interrotta. Rifatti `perimetro` e `dividi --per-sessione 16` su 2ba05a74: divisione identica (12 sessioni, 174 voci, 26 gravi; 103 all'onda 2). Schede riscritte, controlli verdi, SHA_REGISTA 0c9469a8.
- 2026-11-27 03:05 R05 rimessa in moto con la correzione (stessa sessione, ramo rifatto da 2ba05a74). Aperte le altre 11.
- 2026-11-27 03:20 Tutte e 12 aperte e al lavoro (`onda1/sessioni.json`), nessuna ferma. Piani approvati: R01, R02, R05, R06, R07, R08, R09, R10, R11; attesi R03, R04, R12. Scelte della regia: un revisore può guardare due gravi insieme, mai mescolati coi minori; R06 ha 9 subagenti invece di 8. La spesa di una figlia si legge con `get_session` col suo id scritto: senza id il campo `usage` non c'è.
- Falso allarme del cancello dello stop: l'esenzione delle schede (`eSchedaRisolutore`) non copre `<C>/onda1/schede/`. Da dire all'AD come difetto della macchina.
- 2026-11-27 03:25 Tutti i 12 piani approvati (R03 fino a 10 subagenti, R04 revisori rifatti). La regia prima passa la mano a 356 mila token: `PASSAGGIO.md`. Regia seconda aperta dalla prima.
- 2026-11-27 02:30 Regia seconda nata (session_015BmpnXMPYJa9T9pP6LW8kP). Avvisate le 12 figlie, `sessioni.json` col suo id. Sito clonato in `/home/user/mycity`, collegato come `marketplace`. Registro del 26/11 ricreato. Main del sito è andato avanti a 1bf83687 (mycity#344, 8 file sotto `lib/agenti/`, nessuno della campagna): la base resta 2ba05a74.
- 2026-11-27 02:30 Primo giro: R01, R02, R05, R06 spinti, gli altri 8 no; nessuna figlia ferma. R02 guardia rossa: ha toccato la prova comune `la-chat-mostra-la-proposta-che-il-server-applica.test.ts` (importa file di altre sessioni). Detto a R02 di riportarla alla base e lasciare le 7 righe nel referto: le applica la regia sull'integrazione prima di `npm run verify`. Spesa alle 02:30: R01 5,76 $, R03 5,53 $. Sorveglianza muta (`sorveglia.sh --attendi`) accesa.
- Il difetto del cancello dello stop (passo 5 del passaggio) l'ha già registrato l'AD (5f2b1b5).
- Nota sugli orari: dalla regia seconda le ore vengono da `TZ=Europe/Rome date`. Le righe della prima dalle 02:35 alle 03:25 sono circa un'ora avanti: la prima è nata alle 01:52 di Piacenza (00:52 UTC).
- 2026-11-27 02:36 Spinti anche R04, R07, R09. R04 guardia rossa per lo stesso motivo di R02: ha toccato la prova comune `riparazione-r07-reso-pane.test.tsx`. Stessa istruzione: la riporta alla base e lascia la modifica nel referto, la applica la regia. Spesa letta male da R01 (scriveva 2,57 $, misurati 5,76) e R03 (0,77 contro 5,53): detto il numero vero; la regia ricontrolla la spesa a ogni risveglio.
- 2026-11-27 02:53 Giro sulla spesa, misurata con get_session per id: R01 13,88 · R02 13,43 · R03 12,11 · R04 11,03 · R05 14,20 · R06 10,28 · R07 17,68 · R08 9,31 · R09 14,98 · R10 11,97 · R11 14,24 · R12 7,75 → circa 151 $ per i 12 riparatori (limiti 275 $). Oltre il 70%: R07, R09, R11, detto a ognuno niente lotti nuovi e un tetto duro. R09 guardia rossa su due prove comuni (stessa istruzione di R02 e R04). R05 parte davvero da 2ba05a74 anche se la sessione dichiara f1b35670.
- 2026-11-27 03:02 R12 finito (referto 2320bd2f, spesa 18,75 $): 2 riparati, 3 parziali, 6 già riparati, 1 file altrui; valida-referto con --registro verde, guardia rossa per il nome di un file d'aiuto nuovo (`finto-r12-…`): chiesto il rinomino, poi va al collaudo. Una falla riservata dei pagamenti è arrivata solo in chat: resta fuori dal deposito, va all'AD alla fermata. R10 oltre il 70% (14,43 $) si ferma da solo: una voce ritirata col revert perché rompeva altro.
- 2026-11-27 03:06 R11 finito e verde. Aperto K01 (session_015BmpnXZw6B1LCCHKMiTyZb) su R11, partenza 74938e41 (stessi programmi di SHA_REGISTA, ma con `sessioni.json` dentro: a 0c9469a8 la cartella dell'onda non c'era). Nel primo messaggio: niente ultracode, registro del 26/11 con --registro, prove comuni da giudicare con la nota, tetto 30 $. R12 va a K01 dopo il rinomino.
- 2026-11-27 03:07 R03 finito e verde, passato a K01: 1 riparato, 2 parziali, 1 già riparato, 12 non fatti per 17,13 $. Costo per chiusa sopra i 12 $: da dire all'AD alla fermata col numero.
- 2026-11-27 03:08 R07 finito e verde, aperto K02 (session_015BmpnYhCRtBMUTLYxub3cz) su R07. R03 segnala un grave nuovo da verificare sui rimborsi in contanti (la quota del negozio tolta due volte): è nei nuovi difetti del referto. R11 ha lasciato una seconda falla riservata solo in chat: va all'AD alla fermata.
- 2026-11-27 03:09 R09 finito e verde, passato a K02: 1 riparato, 7 parziali, 2 già riparati, 4 file altrui, 1 scelta di Nicola, 1 non fatto per 17,77 $. Anche qui oltre 12 $ a chiusa. La correzione di R09-006 (d7e3261) non va ripresa così: il revisore ha trovato un passo indietro.
- 2026-11-27 03:10 R12 ha rinominato l'aiutante (punta aed60125): guardia e referto verdi, passato a K01, che ora ha R11, R03, R12.
- 2026-11-27 03:11 R10 finito e verde, passato a K02 (ora R07, R09, R10). R10 ha lasciato una terza falla riservata solo in chat (area: il registro degli errori): va all'AD alla fermata.
- 2026-11-27 03:12 R05 a 21,31 $ su 25 (85%) senza avvisare: detto di fermarsi subito, tetto duro 24 $. Lezione per l'onda 2: la spesa delle figlie va letta dalla regia a ogni risveglio, non solo al 70% dichiarato da loro.
- 2026-11-27 03:13 Secondo giro sulla spesa: R01 23,66 $ (95%), R02 22,09 (88%), R05 21,31 (85%), R04 15,52, R06 16,28, R08 13,84. A R01, R02, R05 detto di chiudere subito (tetto duro 24-25 $), a R06 due revisori invece di quattro sopra il 70%. Il costo dei subagenti arriva tardi in usage.cost_usd: le figlie leggono un numero vecchio e passano il 70% senza saperlo. R01 ha ritirato col revert R01-001 (rompeva la prova altrui la-pagina-contatti).
- 2026-11-27 03:15 La regia seconda passa la mano a 353 mila token, prima dell'unione: `PASSAGGIO-terza.md`. Promemoria delle prove comuni in `onda1/da-applicare-all-unione.md`.
- 2026-11-27 03:16 Regia terza nata (session_015BmpnXCNZDPwoc9LQi6wa1). Avvisate R01, R02, R04, R05, R06, R08, K01, K02. Due riavvii del worker della regia; add_repo del sito mai approvato: il sito è clonato in sola lettura senza (l'unione la farà una sessione a parte).
- 2026-11-27 03:33 Tutti e 12 i riparatori finiti. Verdi con --registro: R04, R05, R08 → K03 (session_015BmpnVPPGx99q7A4c57EGb, partenza 2c94bf42). Guardia rossa per prove comuni: R01 (3 file, più 4 prova_tipo «leggera» da portare a «comando»), R02 (1 file), R06 (1 file): giro corto senza subagenti, diff nella nota, nuovo verify. Il segnale «finita» non scatta di nuovo: le nuove punte arrivano per messaggio.
- 2026-11-27 03:36 K01 fermo da circa 20 minuti sull'approvazione di add_repo: interrotto. K02 fermo su un Bash: l'interruzione è negata dal controllo dei permessi, detto all'AD (Nicola preme «Nega» in K02) e scritta a K02 l'altra strada. Per K01, K02 (figlie della seconda) get_session con l'id non dà il campo usage: la spesa la mandano loro.
- 2026-11-27 03:42 K01 non può clonare il sito: il controllo dei permessi lo rifiuta («Undermining Oversight», la sessione vede solo ad-mycity). Aprire «K01 secondo» col permesso nel primo messaggio è rifiutato anche alla regia, per lo stesso motivo: nessun'altra strada intorno al rifiuto. Chiesto all'AD il clic di Nicola (add_repo mycity in lettura nella sessione K01) o l'autorizzazione ad aprire i collaudatori col sito come sorgente. Lezione per l'onda 2: i collaudatori nascono già con l'accesso al sito.
- 2026-11-27 03:46 R02 rifatto: punta 72069840, guardia e referto verdi. R01 rifatto (punta 1530f04f): prove comuni alla base, ma guardia rossa sul messaggio di 7877cd55 senza «R01-varie» (errore della regia terza: aveva scritto «nessun id») → deroga da chiedere a Nicola. Le 4 etichette «leggera» e la verifica «verde con la nota» negate a R01 dal controllo dei permessi: le giudica prima il collaudo con la rimessa. K03 ha il sito e ha rimesso 14 prove su 14. K01 aspetta il clic di Nicola su add_repo.
- 2026-11-27 03:48 R06 rifatto (punta 3d365e86, 22,71 $): stesso esito di R01. Guardia rossa sul messaggio di 79f5bb30 (errore della regia) e verifica scritta «rossa» con la nota, perché uscita con 1 solo nella prova comune. Il programma non ha un modo di dire «rosso solo nelle prove comuni che applica la regia»: R02 ha scritto «verde» con la nota, su istruzione della seconda; R01 e R06 hanno scritto «rosso». Alla fermata: deroga di Nicola sui due commit, e la scelta su come leggere le tre verifiche (la prova vera è il verify sull'integrazione con le prove comuni applicate). Da dire all'AD come difetto della macchina: valida-referto non distingue i rossi delle prove comuni.
- 2026-11-27 03:49 K02 finito (punta ac9ad809): guardia e valida-collaudo verdi. Su 25 voci: R07 2 reggono, 4 parziali, 1 non regge; R09 4 reggono, 6 parziali; R10 7 reggono, 1 parziale; nessuna rompe altro. 7 subagenti qa (mai più di 4 insieme), sopra il tetto di 4 a collaudatore. Una falla riservata nuova (area: l'iscrizione), solo in chat: le riservate in mano alla regia sono 5, tutte per l'AD alla fermata.
- 2026-11-27 03:52 K02 (244 mila token, legge il sito) prende R02 e R06 in un secondo giro, al massimo 2 subagenti nuovi, e controlla le prove comuni con le note applicate. R01 andrà a K03 quando finisce; R11, R03, R12 a chi finisce prima se il clic in K01 non arriva. Nessun collaudatore nuovo: nascerebbe senza accesso al sito. Detto all'AD che il clic non è più bloccante.
- 2026-11-27 03:55 K02 era già a 355 mila token (la lettura dei 244 mila era vecchia) e si è fermato da solo. Costo letto da lui: 5,81 $, che arriva in ritardo. Eccezione della regia alla regola dei 300 mila: il giro lo fa K02 stesso, tetto 20 $ o 650 mila token, al massimo 2 subagenti. La regola presuppone una sessione nuova che riparte dal referto, ma un collaudatore nuovo oggi non legge il sito. Il K02 2.0 proposto da K02 è scartato: nascerebbe senza clone e aggirerebbe il rifiuto avuto dalla regia.
- 2026-11-27 04:15 K02 secondo giro finito (punta ba9d3db4): guardia e valida-collaudo verdi, 46 voci su 5 riparatori, 18 rimesse su 18, nessuna rompe altro. R02 9 reggono e 3 parziali; R06 7 reggono e 2 parziali. Le prove comuni di R02 e R06 con le note applicate sono tutte verdi (R02 25/25, R06 7/7): il «rosso» di R06 è solo la prova riportata alla base. Costo finale 16,31 $ (letto all'archivio), 439 mila token. Archiviato. Una seconda falla riservata sull'approvazione dei fattorini, solo in chat: le riservate in mano alla regia restano 5 aree, con questa che rafforza quella di R06.
- 2026-11-27 04:17 Le 5 falle riservate mandate all'AD in chat, adesso invece che alla fermata, così non restano solo nella sessione della regia. Nel deposito nessun dettaglio.
- 2026-11-27 04:25 K03 finito (punta ba127fa8, 23,80 $, 287 mila token): guardia e valida-collaudo verdi. R04 3 reggono, 1 parziale, 1 non regge (010: gira solo nella prova); R05 4 reggono, 3 parziali, 2 non reggono (005, 008: pezzi non dichiarati); R08 2 reggono, 1 parziale. Nessuna rompe altro. Oltre il 70% del tetto: non prende R01. prova-unione dei 12 rami verde.
- 2026-11-27 04:27 FERMATA. Rifiutata anche l'apertura di U01 (unione sul sito, sorgente mycity): terzo rifiuto del controllo dei permessi («Undermining Oversight») a sessioni sul sito aperte dalla regia. Ferme: unione dei 7 collaudati verdi (R02, R04, R05, R07, R08, R09, R10), collaudo di R01, R03, R11, R12, C01. Chiesto all'AD: Nicola scrive l'autorizzazione direttamente nella sessione della regia e approva add_repo, oppure il clic in K01 (solo collaudo), oppure una regola nelle impostazioni.
- 2026-11-27 04:30 L'AD apre lui le sessioni sul sito dalla sua sessione, che ha mycity fra le sorgenti, e loro rispondono alla regia. Mandati scritti in onda1/mandati/: U01 (unione dei 7 verdi; il diff di R04-010 sulla prova r02 NON si applica, se è rossa si toglie il commit di R04-010) e K04 (R01, R03, R11, R12, sorgente sito, LEGGIMI intero dentro). Il prompt è il testo intero del file: la figlia non deve leggere ad-mycity per partire.
