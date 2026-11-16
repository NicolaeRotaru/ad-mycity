---
tipo: quaderno-regia
onda: 4
data: 2026-11-16 10:55
---

# Onda 4: il quaderno della regista

## In parole semplici
Questo è il diario della regista dell'onda 4 del sito. Nicola ha chiesto che vada come l'onda 1: poche spese, molte voci chiuse. La preparazione è fatta. Due riparatori da 25 voci aspettano il suo via.

## Cosa cambia per te
Finché non dai il via si spende solo il collaudo di 3 voci, al massimo 5 $.

## Cosa devi fare
Dare il via ai due riparatori, con la percentuale del limite letta nell'app.

## Cosa non ho verificato
Le misure dell'onda 3 vengono dal quaderno della regia O3 quattro, non da get_session.

## Dettagli tecnici
Brief: `consegne/ad/2026-11-16-brief-regia-onda-4.md` (ramo `ccr-546d3724-qilkcw`). Ordine di Nicola, 16/11 verso le 10:30: «fai in modo che vada come l'ondata 1». Regista O4: `session_015BmpnVW3sawgGZzKKZHfbp`, ramo `claude/sito-onda-4`, tetto 15 $. AD: `session_015BmpnXzJ4RxUcjYFTgfqUG`.

## Diario

- **10:35** Mano presa. Base del sito: main `d038f105`, che contiene la #292 (onda 3) unita.
- **10:40** `pronte --git`: A 8 · B 42 · C 43 · D 88.
- **10:45** **Elenco A, 8 voci, ma solo 3 da collaudare.** R04-012 e R04-015 hanno tre «parziale» pieni (K02, K10, K11) con la prova rimessa a uscita 3: un quarto collaudo non cambia condizione (regola 8). R04-021, R07-021 e R07-022 hanno già il «regge» pieno di K11 contro i «parziale» di K02 e K10: le blocca la regola di `decidi` (vince il più severo), non il collaudo. Restano R16-014, -015, -016: «regge» di K08 senza giudizio pieno (campione), e col campo dei 40 serve il pieno. Collaudo: K14, tetto 5 $.
- **10:50** `B-onda4.txt` ha 37 chiavi. Sono le voci di B meno cinque. Le 4 di R27 restano fuori perché aspettano la carta 258. R17-002 resta fuori perché è un grave sui soldi: tocca i bonifici dei contanti.
- **10:52** `dividi --base d038f105 --file-chiavi B-onda4.txt --sessioni 2 --per-sessione 25`. R28 «microcopy» ha 25 voci, di cui 1 grave, e le migrazioni 520-529. R29 «qa-flussi» ha 25 voci, di cui 2 gravi, e le migrazioni 530-539. Delle 37 di B ne entrano 19: le altre 18 restano fra le 93 della parte 2. `schede`, `copertura-prima`, `segnaposti` verdi.
- **10:55** Riga dell'onda 3 in `misure.json`.
- **10:44** **K14 aperto** (`session_015BmpnVoKh8ukxjK38xGnnk`, ramo `claude/sito-onda-4-k14`, partenza `db72b993`), tetto 5 $, sulle 3 voci di R16.
- **10:50** **Fermata 1 mandata all'AD**: perimetro, preventivo (minimo 10-18 $, atteso circa 126 $ con 14-17 voci chiuse, massimo 170 $ con circa 24). Si aspetta il via di Nicola con la percentuale.
- **10:50** L'AD chiede `applica --scrivi` per l'onda 3 insieme a K14. Prova a vuoto, con R27 tolto per quel giro e poi rimesso: 204 voci si chiudono, 461 restano aperte. Nel registro adesso ce ne sono 200 riparate. Il registro si scrive quando consegna K14.
- **11:00** **K14 consegna** (`df1c908`, nessun subagente). R16-014, -015 e -016 reggono col giudizio pieno, prova rimessa a uscita 0. `guardia-ramo` (partenza `db72b993`) e `valida-collaudo` verdi. Collaudo copiato in `collaudi/K14.json`.
- **11:02** `applica --scrivi`, con R27 tolto per quel giro e poi rimesso: 207 voci si chiudono, 458 restano aperte. Scritti 23 frammenti e 20 difetti nati nel registro.
- **11:04** `chiudi-sito --applica` lanciato SOLO sulle 7 voci che nel registro erano ancora aperte (4 di R14, 3 di R26), con PR #292 e commit `d038f105`. Lanciato su tutti i frammenti avrebbe riscritto data e PR delle 200 voci già chiuse dalle onde 1 e 2. Le 3 voci di K14 nel registro erano già «riparato». Registro, per il perimetro: da 200 a 207 riparate, da 452 a 445 aperte.
- **12:12** Nicola dà il via a R28 e R29 (tramite l'AD, verso le 12:05). Ha letto il 12% del limite in app, ma la lettura non è sicura: non va in misure.json finché l'AD non la conferma.
- **12:13** **R28** (`session_015BmpnWap9HeyrxHcJSmb24`) e **R29** (`session_015BmpnYhfD4xKiWKSnKQky6`) aperti sul sito, partenza `d038f1059`, effort xhigh, ultracode spento. Tetto 55 $ l'uno, consegna a 40 $, al massimo 8 subagenti. Le regole e la scheda le leggono dal clone di ad-mycity a `982fd335`. Se il clone non riesce, glieli incollo io. Prima il piano, poi l'approvazione.

- **2026-11-16 15:20** — R28 e R29 non erano mai partiti: alle 12:13 avevo dato il punto di partenza con la sigla accorciata, e il servizio non l'ha trovata. Le due sessioni sono rimaste ferme per tre ore senza spendere niente. Le ho archiviate e riaperte con la sigla intera: R28 = session_015BmpnYgfBZJsuDMpB39sCj, R29 = session_015BmpnW1hb6vTP9viJSV6uD. Stesso compito, stesse regole. Lezione: una sessione figlia si apre sempre con la sigla intera (40 caratteri) e si controlla con get_session un minuto dopo.
- **2026-11-16 15:30** — Piano di R29 approvato. Due prove della cassa (la prova automatica dell'acquisto e la sua guardia) passano a R29: nell'onda 4 non sono di nessun altro, e la voce grave R29-001 vive solo lì. Cron del sorvegliante ogni 5 minuti: sì, è la modifica scritta. Le voci di soli testi e di frontend restano senza revisore interno: le copre il collaudo breve.
- **2026-11-16 15:35** — Piano di R28 approvato con quattro correzioni. ① Sulle prove comuni decide la guardia, non il riparatore. ② La voce che riaccredita soldi al negozio passa solo col revisore e un trasferimento che non si ripete; altrimenti solo un avviso, ed esito parziale. ③ Una migrazione che apre un permesso va scritta in chiaro nel referto. ④ Le voci sui dati personali non partono senza revisore: rimandate alla parte 2. Si fanno solo i tre testi, e solo se resta budget.
- **2026-11-16 16:12** — R29 ha chiuso il primo gruppo, a 20,8 $: 2 voci riparate e 3 parziali, tutte e cinque col controllo ripetuto verde. Ho scelto di fare i 7 testi del terzo gruppo, circa 4 $, al posto del revisore interno del secondo gruppo. Le voci sui soldi passano comunque dal collaudo con revisori. Per la prova automatica dell'acquisto servono a Nicola, nei segreti della CI: E2E_DATI_DI_PROVA=1, STRIPE_TEST_SECRET_KEY (sk_test_) ed E2E_STRIPE_CONTO_NEGOZIO (acct_ di prova).
- **2026-11-16 16:45** — Nell'elenco dei file di R28 e R29 cinque nomi avevano un'annotazione attaccata, per esempio «(di R21 nell'onda 2)», oppure due nomi sulla stessa riga. La guardia quindi non li riconosceva. Li ho ripuliti nel piano dell'onda 4: R28 ora è verde. R29 è rosso per tre motivi veri: ① ha toccato tre prove che usano anche file di R28; ② ha aggiunto prove spente; ③ nei messaggi dei salvataggi cita voci di altre onde. Gli ho scritto come sistemare.
- **2026-11-16 16:58** — Ho scritto il passaggio di consegne (PASSAGGIO-REGIA-O4.md), ma l'apertura della seconda regista è stata fermata dal permesso. Non riprovo: decide l'AD. Intanto la regia resta qui, senza lavori pesanti. R29 è a 38,4 $ e salta il terzo gruppo: chiude la guardia rimettendo alla base le 10 prove comuni, che io applicherò alla cucitura. Il suo arrivo previsto è fra 45 e 48 $, sotto i 55.
- **2026-11-16 17:10** — R29 non può riscrivere i messaggi dei suoi salvataggi: il permesso della sessione lo blocca come azione distruttiva. Non riscrive nessuno, nemmeno la regia. La guardia resta con 4 rossi solo sui messaggi, che citano i commit precedenti di altre onde e non il codice. Vanno portati all'AD come rossi noti, insieme all'eccezione dello spec e2e.
- **2026-11-16 17:12** — R28 ha consegnato a 37 $, usando 7 subagenti su 8. Delle 25 voci: 7 riparate, 2 parziali (fra queste il grave), 5 da applicare alla cucitura, 1 da decidere per Nicola, 1 già riparata prima, 9 non fatte. La guardia e la validazione le ho rilanciate io: verdi. La voce del riaccredito al negozio è stata tolta, perché il revisore l'ha bocciata: nel carrello con due negozi il secondo negozio non viene pagato. Le domande per Nicola sono tre: la consegna veloce pagata che non si può più fare, l'abbonamento dopo un rimborso, la soglia di 45 minuti dell'allarme delle notifiche.
- **2026-11-16 17:15** — R28 ha chiuso. Testa finale: b2e93d20, e la guardia l'ho rilanciata io: verde. Le 5 patch da applicare alla cucitura si leggono dalla storia del suo ramo, al commit 3e9553a2, cartella .riparazione/patch-R28/. Si applicano su 69002b78.
- **2026-11-16 17:20** — R29 ha consegnato a 42,95 $, con 6 subagenti su 8. Delle 25 voci: 7 riparate (fra queste un grave), 3 parziali (fra queste l'altro grave), 1 da applicare alla cucitura, 14 non fatte per il freno. Ho rilanciato io i controlli. La guardia ha solo i 4 rossi noti sui messaggi: il salto dello spec e2e non risulta più. La validazione del referto è rossa solo perché la verifica è rossa, e la verifica torna verde quando applico le modifiche alle 9 prove comuni e i 6 errori di tipo, che stanno nei serve_file_altrui. Due domande per Nicola: Onfido e i segreti di test della CI.
- **Lo stato alle 17:20.** Tutti e due i riparatori hanno chiuso. Spesa: K14 2,06 $, R28 37 $, R29 42,95 $, regia circa 15 $. In tutto circa 97 $ sui 170. Resta da fare: collaudo breve di R28 e di R29, controllore, cucitura con le modifiche altrui, verify, applica, PR in bozza.
