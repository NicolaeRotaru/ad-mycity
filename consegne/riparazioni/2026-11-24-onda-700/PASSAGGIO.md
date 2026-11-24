---
data: 2026-11-24 20:50
tipo: passaggio della regia (undicesima → chiusura)
campagna: onda dei 700
---

# Passaggio · dalla regia undicesima alla chiusura

## In parole semplici
Questo foglio serve a chi chiude la campagna, senza rileggere la chat dell'undicesima.
Le riparazioni sono finite. La richiesta di unione del sito (mycity#315) non è più in bozza: aspetta solo il clic di Nicola.
Quando Nicola la unisce si chiudono 54 difetti del registro: 39 riparati e collaudati, più 15 che il codice aveva già sistemato.
Per esempio: un fattorino già approvato che rinnova la patente non resta più «In attesa di verifica».
Le 7 migrazioni del database partono da sole col rilascio, prima del codice nuovo.

## Cosa cambia per te
Niente finché Nicola non unisce la #315. Il lavoro che resta viene dopo quel clic: scrivere le chiusure nel registro e la memoria.

## Cosa devi fare
Segui «I prossimi passi» qui sotto. Si parte solo con la #315 unita.

## Cosa non ho verificato
Il rilascio vero: quando Nicola unisce, le migrazioni e la pubblicazione girano senza che io le abbia viste.
Le migrazioni sul database vero: le ha lette il controllore finale e le hanno applicate due database di prova, non quello vero.
La memoria di fine campagna: STATO, LAVORO-APERTO, l'esito nel quaderno e il voto non li ho scritti, per stare nel tetto.

## Dettagli tecnici

**Ids.** AD session_01R8112Lzth8WvHHrQ4H3whZ. Regia undicesima session_01R8112KPerW4JdmjTRVhpJR: da adesso non spinge più.
K06 session_01R8112PHSf3MRoHnBPCXrae (3,23 $), C03 session_01R8112MwmTXvN1PAwWEYcjp (1,6 $), CF session_01R8112K3uxv4DAfQ3rk6ww2 (2,15 $): finite, non archiviate.

**La spesa.** Tetto della campagna 400 $. Misurata: 387,12 + K06 3,23 + C03 1,6 + regia undicesima circa 6,9 = **circa 398,9 $**.
Il controllore finale (2,15 $) lo paga il tetto della prossima ondata (AD, 20:31). La regia undicesima è costata più dei 4-5 $ previsti perché lavorava a 290 mila token: ogni passo rileggeva tutto il contesto.

**Il sito.** ccr-d7a54140-hak4ez @ **51495a1ce3f22739db639ff88f5a0015da4f965e** (unione di R11 e R12 su e173796f, revert di R12-001 4847bd9d, `.riparazione/` tolta).
mycity#315 **fuori bozza** alle 20:47: CI verde su 51495a1c (9 controlli, «La cassa vera» saltata senza chiavi), mergeable clean, base main 0311a90f.
Migrazioni nuove: 821, 822, 830, 831, 832, 840, 860. Nicola ha dato «ok migrazione» alle 20:35. Le applica `deploy-dopo-ci.yml` («Applica le migrazioni al database, prima di pubblicare») all'unione: il conto delle mancanti è 14 (15 se manca la 704), sotto il tetto di 20. Non le applica nessuno a mano.

**Onda 3.** K06: reggono R11-001, -003, -004, -005, R12-003, -004, -005. R11-006 non regge (la prova non distingue il codice rotto da quello giusto). R11-002 e R12-002 a metà. R12-001 rompe altro: revertita.
C03 e CF verdi: 0 voci rosse, 0 difetti nuovi. CF ha provato anche l'unione con main di oggi: nessun conflitto, harness con 232 migrazioni e tsc verdi.
`applica --git /home/user/mycity` con C01, C02, C03 e CF: 133 voci, **39 si chiudono all'unione**, 15 già riparate, 79 aperte, 40 nati. `applica --scrivi` fatto: 11 frammenti in `normali/frammenti/`, 40 nati e 15 già riparati nel registro, **nessuna chiusura** (`conti`: 88 aperte e 15 già riparate per le chiavi del perimetro).

**Per le domande di Nicola** (vanno nella lista dell'AD): R12-001, il rimedio vero chiede uno schema nuovo (una presa in carico che scade, oppure la presa subito prima dell'invio, solo per le notifiche da mandare). R11-002: resta «spezzare il file in tre», che toglie asserzioni e chiede la sua firma.

**Rami da cancellare quando Nicola vuole** (ad-mycity): -k06, -c03, -cf; (mycity) -m11, -m12. Più quelli già in REGIA.md.

**Sveglie.** Ne resta una della regia undicesima (trig_01DKSvJgRyAAMjDmDLkfJuPi, controllo del CF): quando scatta non c'è niente da fare. Non l'ho cancellata.

**La prossima ondata** (Nicola, 20:30, «ok 1.200»): tetto 1.200 $, solo voci senza di lui, pilota di 20 delicati senza ultracode, regie a 400 mila token. La apre l'AD con una cartella nuova. Già scritto in BACHECA-SESSIONI e DECISIONI.

**Le regole da tenere.** Dopo un riavvio del worker Postgres è spento e il ruolo root manca: `pg_ctlcluster 16 main start`, poi `su postgres -c "createuser -s root"`, con `PGHOST=/var/run/postgresql PGUSER=root`. Le migrazioni del sito stanno in `migrations/`, non in `supabase/migrations/`. `sessioni.json` si scrive con indentazione 1.

## I prossimi passi (solo con la #315 unita da Nicola)
1. Lo SHA dell'unione su main (`git fetch origin main` nel clone del sito, oppure il merge commit della #315).
2. `node cervello/chiudi-sito.mjs /home/user/ad-mycity/consegne/riparazioni/2026-11-24-onda-700/normali/frammenti --applica --pr 315 --commit <sha dell'unione>`.
3. `node cervello/riparazione-sessioni.mjs conti --cartella consegne/riparazioni/2026-11-24-onda-700/normali`: «54 chiusi» si dice solo dopo questo.
4. Tre riparazioni a caso fra le `si_chiude` di `normali/decisioni.json`: il loro `verifica_comando` rilanciato su main, con l'uscita copiata.
5. Memoria: STATO.md, LAVORO-APERTO.md, DECISIONI.md, l'esito con `node cervello/chiusura-loop.mjs registra …`, il voto in `memoria-squadra/ad.md`.
6. Il messaggio finale all'AD nei quattro blocchi, col conto da `node cervello/conto-token.mjs`.

**Riga di apertura (se l'AD vuole una regia per la chiusura).** «Sei la regista della chiusura della campagna consegne/riparazioni/2026-11-24-onda-700 (regia dodicesima). Leggi consegne/riparazioni/2026-11-24-onda-700/PASSAGGIO.md e, di .claude/skills/riparazione/SKILL.md, solo la sezione F3 dal punto 8. Nicola ha unito mycity#315: fai «I prossimi passi» del passaggio, dall'1. Nicola parla con l'AD nella sessione session_01R8112Lzth8WvHHrQ4H3whZ: l'esito va lì con send_message. Tetto: quello che dà l'AD. Il sito si legge col git normale. Non cancellare sveglie.»
