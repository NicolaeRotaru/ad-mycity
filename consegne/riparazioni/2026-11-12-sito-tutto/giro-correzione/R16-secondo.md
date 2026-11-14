Sei «R16 O2 correzione»: fai il giro di correzione di R16 nell'onda 2 della campagna consegne/riparazioni/2026-11-12-sito-tutto. Ti ha aperto la «regista O2 settima» (session_015BmpnVKqiFCVbsAjWm364m). Questo messaggio e il prossimo (il LEGGIMI del riparatore, per intero) sono tutto il tuo compito: non ti serve leggere altro per partire.

LA RICHIESTA, con le parole di Nicola (14/11 08:56): «la strada a». Le voci date per fatte e poi bocciate dal collaudo o dal controllore tornano allo stesso riparatore per UN giro di correzione, poi allo stesso collaudatore. Se cadono di nuovo restano aperte con la nota: un terzo giro non esiste senza Nicola.

I FATTI
- Deposito NicolaeRotaru/mycity, ramo claude/magical-hamilton-xouwr8-m16. Sei partito dalla sua punta 8a00cbaf4fe149c515c2f59d10329796dc01cb65. Spingi solo su questo ramo.
- Il ramo è già unito nel ramo di integrazione claude/magical-hamilton-xouwr8 (punta 4a3d9b8a). Dopo il tuo giro la regista unisce di nuovo il tuo ramo: non toccare il ramo di integrazione.
- Il referto è .riparazione/referto-R16.json alla punta del ramo. Aggiorni SOLO le voci qui sotto: esito, nota, prova, commit. Il resto lo lasci com'è; «finita» resta true e «verifica.testa» diventa il nuovo ultimo commit di codice.
- Il tuo territorio sono i file della tua scheda dell'onda 2: quelli che il tuo ramo tocca già e quelli che le voci qui sotto citano. Un file di un'altra sessione non si tocca: la voce diventa serve_file_altrui, con la nota. guardia-ramo lo controlla.
- Il clone in sola lettura di https://github.com/NicolaeRotaru/ad-mycity al commit 125b2db0322dadc8ae68eb4cb51e45c9d5e33ed6 serve solo per i comandi del programma (valida-referto, guardia-ramo, prova-rimessa). Se non riesci a clonarlo, dillo e vai avanti: li lancio io sul ramo.

LE VOCI (3, tutte minori), con la diagnosi del collaudo (K08, da collaudi/<K>.json):
- R16-019 (verdetto parziale, collaudatore K08). Voce: «rls-database|chiunque abbia un account può riempire i 30 posti del carosello delle storie in home e svuotarlo per tutti».
  Diagnosi: Un revisore qa (gruppo B, copia a 0628993d24e8), tutte e due le lenti. CHIUDE_TUTTA: Solo un pezzo. La 404 chiude la strada scritta nel titolo, «chiunque abbia un account»: un cliente o un negozio sospeso non pubblica più storie e non allunga quelle vecchie, e la prova SQL lo dimostra (7 controlli verdi). La seconda metà della correzione nel registro, «il carosello filtra prima di tagliare», non è fatta: il carosello taglia ancora e filtra dopo (components/home/StoriesCarousel.tsx:78-80). Altri residui sono passati alla regista in chat. NATA_ROTTA: Non rompe niente accanto. Il negozio legge ancora le proprie storie, anche scadute. Il negozio sospeso cancella ancora le sue. La lettura pubblica non cambia. Il cliente non scrive a nome di altri. Nella regola dei profili, ruolo e approvazione restano riservati allo staff (migrations/400:51). La nota del revisore precedente resta: l'admin dentro l'area negozio lascia una foto orfana, perché la foto si carica e poi il salvataggio viene rifiutato. Residui: components/home/StoriesCarousel.tsx:78-80 il carosello prende le storie più recenti e filtra i negozi solo dopo il taglio: la seconda metà della correzione del registro manca (altri residui passati alla regista in chat) Prove: apply.sh k08_b: 197 migrazioni applicate, 0 fallite. psql riparazione-r16-storie-solo-negozi.test.sql: uscita 0, 7 controlli verdi. Due sonde SQL del revisore, chiuse con ROLLBACK (dettagli alla regista).
- R16-020 (verdetto parziale, collaudatore K08). Voce: «stati-ui|se la lettura del prodotto non riesce, la pagina di modifica dice «prodotto non trovato» e non offre «riprova»».
  Diagnosi: Un revisore qa (gruppo C, copia a 0628993d24e8), tutte e due le lenti. CHIUDE_TUTTA: Il registro dice anche «Senza rete, stesso testo». Il caso coperto è l'errore 500, o un fetch che fallisce mentre react-query crede di essere in linea: lì ora compare «Non riesco a leggere il prodotto» con Riprova. Il caso non coperto è il telefono senza rete. react-query (networkMode 'online' di default, QueryProvider.tsx) mette la lettura in pausa: stato pending, isLoading falso, nessun errore. La pagina allora cade in '!product' (edit/page.tsx:255) e dice ancora «Prodotto non trovato» senza Riprova. Lo stesso succede col nuovo tentativo messo in pausa quando la rete singhiozza (retry: 1). L'ho riprodotto con una sonda sulla pagina vera e onlineManager.setOnline(false): «Errore · Prodotto non trovato», nessun Riprova. La pagina si rimette da sola solo quando la rete torna. NATA_ROTTA: I rami PGRST116, prodotto di un altro negozio e sessione mancante restano corretti. La classe LetturaNegata funziona con instanceof perché il target è es2017. Prove e controllo dei tipi verdi. Fuori voce: la pagina di modifica dell'amministratore ha lo stesso difetto originale. Residui: app/seller/products/[id]/edit/page.tsx:235,255 La lettura in pausa perché il telefono è senza rete non è né caricamento (isLoading falso) né errore: si cade in '!product' e compare «Prodotto non trovato» senza Riprova. Serve isPending o fetchStatus==='paused'.; app/admin/products/[id]/edit/page.tsx:137-141 Fuori voce, stessa classe: l'errore di Supabase non è un Error, quindi cade su «Prodotto non trovato» senza Riprova Prove: La prova riparazione-r16-modifica-lettura-caduta è verde, 6 prove. Sonda zz-k08-offline-edit con onlineManager offline: «Prodotto non trovato», riprova: false. Al ritorno della rete: «Non riesco a leggere…» con Riprova. Sonda cancellata.
- R16-021 (verdetto parziale, collaudatore K08). Voce: «stati-ui|se le categorie non arrivano, il modulo «nuovo prodotto» mostra un elenco vuoto e poi chiede di scegliere una categoria che non c'è».
  Diagnosi: Un revisore qa (gruppo C, copia a 0628993d24e8), tutte e due le lenti. CHIUDE_TUTTA: Il caso coperto: se la lettura delle categorie fallisce (rotta bloccata, come nella palestra del registro), compare l'avviso «Non riesco a leggere le categorie» con Riprova. Il caso non coperto è il titolo stesso, «se le categorie non arrivano», quando il telefono è senza rete. react-query mette la lettura in pausa (pending, isLoading falso, isError falso), e new/page.tsx:279-281 apre il modulo con l'elenco vuoto. È il difetto originale, che il registro collega alla «rete che singhiozza». Riprodotto con una sonda sulla pagina vera e onlineManager offline: «MODULO con 0 categorie». NATA_ROTTA: La query delle categorie condivide la chiave queryKeys.categories.form con la pagina di modifica e con le pagine dell'amministratore. Coi dati in memoria il modulo si apre comunque, ed è corretto. Prove vicine e controllo dei tipi verdi. Il gemello, la pagina di modifica alle righe 235-236, ha la stessa lacuna di pausa. Residui: app/seller/products/new/page.tsx:76,279 Con la rete assente, isLoading (pending più fetching) è falso perché la lettura è in pausa: il modulo si apre con 0 categorie e chiede di sceglierne una. Serve isPending o fetchStatus==='paused'.; app/seller/products/[id]/edit/page.tsx:113,235-236 Stessa lacuna sulle categorie nella pagina gemella presa a modello Prove: La prova riparazione-r16-nuovo-prodotto-categorie è verde. Sonda zz-k08-offline: offline dà «MODULO con 0 categorie», in linea con errore dà l'avviso con Riprova. Sonda cancellata.

R16-019: questo giro corregge una cosa sola, «il carosello filtra i negozi prima di tagliare, lato database, non dopo». Il resto della voce non è in questo giro.

COSA NON SI TOCCA
- Le voci di R16 che il collaudo ha già dato per buone, e le voci tolte dal ramo di integrazione che non sono in questa lista.
- Il database vero, la messa online e Stripe: gli strumenti mcp__Supabase__, mcp__Vercel__ e mcp__Stripe__ sono vietati, anche ai tuoi subagenti. Le prove SQL girano solo sul Postgres locale.
- Mai git add -A; niente file temporanei nel ramo.

LA PROVA CHE DICE «FATTO»
1. Per ogni voce correggi solo quello che dice la diagnosi, una voce per commit, col messaggio che comincia con l'id («R16-019 correzione: …»). Ogni voce ha una prova che torna rossa togliendo la correzione (prova-rimessa, uscita 0).
2. Sulla testa: le prove dei file toccati e di chi li importa, poi il verify completo (npm run verify, con NODE_OPTIONS=--max-old-space-size=6144), legato allo SHA in verifica.testa.
3. guardia-ramo e valida-referto verdi, coi comandi del LEGGIMI.

IL PIANO PRIMA. Prima di toccare il codice mandami il piano, in 5-10 righe, con send_message alla sessione session_015BmpnVKqiFCVbsAjWm364m, e chiudi il turno. Parti quando rispondo «approvato».

IL TETTO. 9 $ di usage.cost_usd (get_session senza id), e al massimo 3 subagenti in tutta la tua vita, ultracode compreso. I minori senza soldi, dati o permessi possono andare a un subagente col modello piccolo (model: "sonnet"). Se il tetto non basta ti fermi e me lo scrivi, con la cifra.

A CHI RIFERISCI. Alla fine, con send_message alla sessione session_015BmpnVKqiFCVbsAjWm364m: la punta e la testa del ramo (git rev-parse), una riga per voce con l'esito (riparato, parziale o serve_file_altrui) e il tuo costo. Sei al livello 8 di 8: non puoi aprire sessioni. Oltre 150 mila token (context_usage.used_tokens) scrivi il passaggio nel referto, spingi e me lo dici: la tua 2.0 la apro io.

LE REGOLE DELLE SESSIONI (cervello/sessioni-insieme.md), per intero:
1. **L'urgente si manda urgente.** Uno stop, la quota, la sicurezza e i soldi partono con `send_message` e
   `priority: "now"`. Chi riceve risponde subito con una riga: «ricevuto, faccio così». Chi manda, se dopo 10
   minuti non ha la risposta, guarda `get_session` di chi doveva riceverlo e riprova.
2. **Le decisioni di Nicola finiscono in bacheca, ovunque arrivino.** Chi riceve una decisione di Nicola la scrive
   nella bacheca nello stesso turno, in qualunque chat sia arrivata. Ci mette l'ora, chi l'ha ricevuta e le sue parole,
   e la manda all'AD. L'AD la registra in `DECISIONI.md`, e se tocca le altre sessioni la passa a loro.
4. **Chi aspetta un clic di Nicola lo dice subito all'AD**, in modo urgente: quale sessione, cosa deve cliccare e
   dove. L'AD lo mette nella riga «Tocca a te» del suo messaggio. Vale anche per la regista, non solo per le figlie.
5. **La quota la dice chi la vede.** Chi in `get_session` trova `allowed_warning`, `isUsingOverage` o un blocco lo
   scrive subito all'AD, in modo urgente. Poi lo segna in bacheca con l'ora. L'AD lo dice a Nicola nel messaggio dopo.
7. **Si cambia sessione prima, non dopo** (Nicola, 13/11: «perché non ne apri una nuova quando hai raggiunto il
   60-80% del contesto?»). Ogni passo rilegge tutta la storia. A 800 mila token su un milione una chiamata costa circa
   quattro volte una a 200 mila. La compressione automatica, che arriva verso l'80-90%, riassume a modo suo e perde
   dettagli. Quindi: alla fine di ogni lavoro lungo la sessione guarda la sua storia con `get_session`
   (`context_usage.used_tokens`). **Oltre 400 mila token**, cioè il 40% della finestra, scrive il passaggio: lo stato in
   poche righe, i lavori aperti, gli id e le decisioni in sospeso. Poi apre una sessione nuova che riparte da lì, la
   scrive in bacheca e manda il nuovo id alle sessioni vive. Chi ripara punta più in basso, a 150 mila (regola dei lotti).
   La chat dell'AD con Nicola non si sposta da sola: l'AD prepara la chat nuova e gli dice dove continuare.
   **La sessione nuova la apre la sessione stessa, ed è la sua 2.0** (Nicola, 13/11 alle 13:30: «superato il 40-60% di
   contesto deve aprire una nuova sessione 2.0 di se stessa»). Ha lo stesso ruolo e lo stesso ramo, e «· 2.0» in fondo
   al titolo. Ultracode non lo eredita: lo accende Nicola dall'app (regola 10). Vale anche per le figlie: riparatori, collaudatori e controllori
   a 400 mila token non si fermano ad aspettare. Aprono la loro 2.0, scrivono l'id a chi le ha aperte e si fermano.
   Se una non può aprirla, lo dice subito, e la 2.0 la apre chi l'ha aperta lei. Esempio vero: fino alle 13:30 del
   13/11 ai riparatori dell'onda 2 era stato detto «oltre 350 mila token vi fermate e lo dite».
10. **Chi scrive codice nasce con ultracode acceso** (Nicola, 13/11 alle 03:05: «ogni nuova sessione che si occupa a
   scrivere codice deve essere aperta con l'ultracode»). Vale per chi ripara, per il controllore che sistema la CI e
   per ogni sessione della regola 8 che tocca il codice. Ultracode fa lavorare la sessione con squadre di agenti e
   verificatori indipendenti, invece che da sola.
   - **Come si accende** (Nicola, 14/11: «cerca in tutti i modi di capire come aprire da solo l'ultracode», poi
     «l'hai aggiunta alla regola?»). Lo accende chi apre la sessione, da solo. Il campo `prompt` di `create_session` è
     **esattamente** `/effort ultracode`, senza altre parole e senza a capo. Il compito e le regole arrivano subito
     dopo con `send_message`, oppure nel campo `append_system_prompt`. Vale anche per le cartelle: il prompt che
     passano è `/effort ultracode`, e il compito lo manda chi ha chiesto «apri:». La prova è del 14/11 alle 07:45: una
     sessione aperta così risultava accesa dopo 2 secondi, senza nessun clic.
   - **Cosa non funziona.** La parola «ultracode» nel testo: K09 l'aveva 9 volte ed è nato spento. Il comando mandato
     dopo con `send_message`: i messaggi fra sessioni non eseguono comandi. `effort: "ultracode"`: lo strumento non lo
     accetta. E la sessione nuova non prende ultracode da chi la apre.
   - **I due limiti.** Questa via non scrive il campo `flag_settings`, che scrive invece il clic di Nicola nell'app:
     l'interruttore nell'app può sembrare spento anche quando è acceso. E secondo il codice si perde se il processo
     della sessione riparte (`worker_epoch` cambia), cosa non ancora vista succedere.
   - **Il controllo.** Subito dopo `create_session`, `get_session` deve dire `is_ultracode_active: true`, con effort
     xhigh in `session_context`. Si riguarda prima di ogni lavoro lungo e dopo una ripartenza. Se è spento, la
     sessione non comincia il lavoro: chi l'ha aperta lo dice subito all'AD, e Nicola lo accende dall'app (regola 4).
   - **I tetti restano.** Ultracode fa lanciare più agenti, quindi consuma di più. Vale lo stesso il preventivo prima di
     lanciare: oltre 12 subagenti o 2 milioni di token si chiede a Nicola (regole ⑱ e ㉑ del manuale dell'AD). Chi
     ripara non ne lancia più di 12 (skill `riparazione`). E vale la quota.

Rispondimi per prima cosa con una riga: «ricevute le regole», poi il piano.