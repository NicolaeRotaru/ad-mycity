---
data: 2026-10-16 12:30
tipo: visita-completa
richiesta: «controlla come è messo tutto» → poi «lascia stare il marketplace, adesso voglio che ti occupi solo della macchina e tutto quello che la riguarda» (Nicola, 15/10)
come: visita rapida (salute.mjs, 15/10 21:07) + 8 organi controllati in sola lettura, ognuno rifatto da un verificatore che doveva smentirlo, + un critico di completezza. 17 controllori, nessuno caduto. Prove fatte fra il 15/10 21:10 e il 16/10 12:11.
---

# La macchina è spenta da tre settimane, e il Pannello non te l'ha detto bene

**In due righe.** Il server che fa lavorare la macchina da sola tace dal 25 settembre. Per riaccenderlo servono le tue mani sul server. Tutto il resto lo riparo io, in richieste di unione.

## In parole semplici

La macchina ha due parti. Una è il **server**, il computer affittato da Hetzner che lavora da solo giorno e notte. L'altra sono le **sessioni come questa**, che lavorano solo quando ne apri una. Il server si è fermato. Dal 25 settembre non prende più lavori, e dal 7 ottobre non dà più nessun segno di vita. Da allora la macchina lavora solo quando apri una sessione.

Il resto della macchina invece è acceso e sano. La Cabina risponde. Il database della memoria è acceso e chiuso a chi non ha la chiave. I 120 senior sono tutti al loro posto. Nel repo non ci sono segreti. Manca il motore che fa girare tutto questo da solo.

## Cosa cambia per te

- **Il server tace da 21 giorni, non da 8.** Fino al 25 settembre lavorava di continuo. Il 7 ottobre si è svegliato per 25 secondi, poi più niente. Nelle ultime 24 ore il database della memoria l'ha chiamato solo la Cabina, 98 volte. Il server zero.
- **I lavori si accumulano.** In coda ne aspettano 72. Il più vecchio è del 26 settembre. La Cabina ne aggiunge cinque ogni tre giorni, e nessuno li prende.
- **Il 24 settembre hai firmato 53 card, e nessuna è partita.** Fra quelle firme c'erano 19 card della macchina, compresa quella del server. Il Pannello le ha messe «in coda» con la nota «canale non collegato». Ma erano passi da fare con le tue mani, e nessuno te l'ha detto. Il problema non è che tu non rispondi: è il Pannello, che accetta una firma su un'azione che nessuno può eseguire.
- **Quando lo riaccendi, si fermerà di nuovo da solo.** Dall'11 al 25 settembre il freno sulla spesa dell'intelligenza artificiale ha rifiutato 269 lavori. Il contatore partiva ogni mattina già sopra la soglia di 2 milioni di token, quindi non si azzerava mai. Se non lo riparo prima, il server riacceso sbatte sullo stesso muro.
- **Il lavoro di settembre del server è su un ramo sbagliato.** Dal 2 al 10 settembre il server ha scritto 377 modifiche, tutte su un ramo laterale mai unito. Dentro ci sono briefing e card. Le card dalla 195 alla 206 lì hanno un contenuto diverso da quelle che vedi tu: «ok 202» oggi può voler dire due cose diverse. Altre modifiche, se ci sono, stanno ancora solo sul disco del server.
- **Il Pannello ti fa vedere un quadro migliore del vero.** Un esempio: scrive «Pagamenti: ok» su una misura del 1° settembre. Un altro: alcuni controlli della visita escono verdi senza aver guardato niente. La scheda del worker dà come causa un avviso del 28 agosto, e nasconde che il worker è spento.
- **I difetti della macchina sono fermi da cinque settimane.** Ne restano aperti 191, e l'ultima chiusura è dell'8 settembre. Ma dei 85 difetti seri, circa 70 li posso chiudere io da qui, senza firme né chiavi tue. Per 13 servi tu, per 1 serve il server acceso. 23 hanno già la prova verde e aspettano solo di essere chiusi.
- **La squadra dorme.** Solo 3 senior su 120 hanno lavorato negli ultimi sette giorni. È la conseguenza del server spento, non un difetto dei senior.

## Cosa devi fare

Una cosa sola, quando hai mezz'ora: **riaccendere il server, con calma e in quest'ordine.**

- **Prima, la console Hetzner.** Guarda se il server è acceso e se il conto è pagato. Se è spento, accendilo da lì.
- **Poi salva il suo lavoro, prima di toccare i servizi.** Dal terminale del server copi su GitHub quello che ha sul disco. Lo copi su un ramo nuovo, senza forzare. Il comando esatto te lo preparo nella card del server. Se lo riavvii prima, rischi di perdere quelle modifiche.
- **Infine, non riavviare il worker finché non ho riparato il freno sulla spesa.** Altrimenti si ferma di nuovo il giorno stesso. La riparazione la faccio io in una richiesta di unione: quando la unisci, il server la prende.

E una domanda a cui solo tu puoi rispondere: **la decisione sul Garante, la password dell'amministratore e le chiavi del database del sito, le hai fatte?** La scadenza era mercoledì 14 sera, e nella memoria non c'è scritto niente. Nel database del sito vedo che l'amministratore è entrato il 13 ottobre alle 15:11. Non so se con la password nuova.

## Cosa non ho verificato

- **Il server stesso non lo vedo.** Non so se è acceso, se il disco è pieno, se ha le credenziali del motore AI. Vedo solo che non chiama più il database.
- **Stripe non è collegato a questa sessione.** Incassi e pagamenti ai negozi, per la macchina, sono ciechi dal 1° settembre.
- **Gli allarmi su Telegram non sono mai stati collegati.** Il 25 settembre c'erano 42 avvisi mai partiti. Non so se ti arrivano le notifiche di GitHub dell'allarme esterno, che ha 223 commenti.
- **Le 1.097 prove di mutazione non le ho fatte scattare.** Ho controllato solo che siano scritte bene, non che fermino davvero un difetto.
- **I conti dei difetti chiudibili da qui sono una stima.** Li ha fatti un controllore e li ha corretti il suo verificatore. Si confermano solo chiudendoli uno per uno.

---

## La pagella, organo per organo

| Organo | Come sta | Il fatto che lo dice |
|---|---|---|
| Server | ❌ spento | Ultimo battito il 7/10. 72 lavori in attesa. |
| Cervello | 🟡 lavora, non è verde | 1 file di prove rosso su 478. Zero difetti chiusi in ottobre. |
| Cabina | 🟡 accesa, racconta vecchio | Risponde, ma i 7 file che mostra sono tutti scaduti. |
| Senior | 🟡 in ordine, ma dormono | 120 registrati, solo 3 attivi in una settimana. |
| Sensori e mani | ❌ quasi ciechi | La sentinella dei dati è ferma dal 22/8. |
| Cantiere dei difetti | 🟡 fermo, non rotto | 191 aperti, l'ultima chiusura è dell'8/9. |
| Memoria | 🟡 si legge, ma è vecchia | Lo STATO è del 13/10, la lettera a te del 30/7. |
| Firme e richieste di unione | ❌ ferme | 53 firme del 24/9 parcheggiate senza dirtelo. |

**Copertura:** dopo le verifiche, 38 controlli verdi, 120 rossi, 17 che da qui non si vedono. Molti rossi sono lo stesso guasto visto da organi diversi: la coda dei lavori, per esempio, la contano cinque organi. Il server e Stripe restano ciechi.

## I problemi, in ordine

**Prima ciò che tiene spenta la macchina:**

1. **Il server è muto da 21 giorni.** Lo sblocchi tu, dalla console Hetzner e dal terminale del server.
2. **Il lavoro di settembre è su un ramo laterale mai unito, e forse altro è ancora sul disco del server.** Tu lo salvi prima di riaccendere. Io poi decido in una richiesta di unione cosa recuperare, e rinumero le card doppie.
3. **Il freno sulla spesa fermerà di nuovo il server riacceso.** Lo riparo io. A te tocca solo decidere la soglia, se vuoi cambiarla.

**Poi ciò che fa mentire il Pannello:**

4. **Le firme del 24 settembre sono state parcheggiate senza dirtelo.** Lo riparo io: una card che nessuno può eseguire torna «da fare da te», con la scelta da indicare.
5. **La scheda del worker dà una causa vecchia e nasconde che è spento.** Lo riparo io.
6. **L'allarme esterno conta le sessioni come questa come segni di vita del server.** Dice 142 ore invece di 45 giorni, e un briefing scritto da una sessione potrebbe spegnerlo. Lo riparo io. Per Telegram servono due chiavi tue.
7. **Alcuni verdi non hanno misurato niente.** Lo riparo io.
8. **Il cantiere nel Pannello mostra otto difetti gravi come minori, e un andamento vecchio.** Lo riparo io.
9. **La memoria non dice cosa è successo sulla scadenza del Garante.** Mi serve la tua risposta.

**Poi ciò che fa sbagliare la macchina da sola:**

10. **Il worker scrive «fatto» su lavori che non ha mai fatto: 42 su 90 da settembre.** Lo riparo io.
11. **Alcuni controlli della visita sbagliano per conto loro.** Lo riparo io.
12. **Una prova legata al calendario tiene rosso il controllo del codice.** Diventa rossa ogni giorno in cui lo STATO non porta la data di oggi. Lo riparo io.

**Poi la sicurezza:**

13. **Il ramo principale della macchina non ha la serratura.** Il 15 ottobre una modifica è entrata con le prove rosse. Lo scegli tu, con la card della serratura: il mio consiglio è la strada B.
14. **La macchina ha permessi più larghi del dovuto, e due chiavi GitHub sono in chiaro sul server.** Lo fai tu, nella stessa seduta in cui riaccendi il server.

**Il resto:**

15. **La squadra dorme e l'apprendimento è fermo.** Si risveglia col server.

## Quello che ho visto funzionare

- Il database della memoria è acceso e sano, e accetta solo chi ha la chiave.
- La Cabina è accesa. La versione pubblicata è identica al codice, e test, controllo dei tipi e costruzione passano: 13 su 13.
- I numeri del business che la Cabina mostra coincidono con il database del sito.
- L'allarme esterno su GitHub gira ogni giorno, anche se conta male.
- Il registro dei 120 senior torna, senza doppioni e senza rimandi a senior che non esistono.
- Nessun segreto nei 3.165 file del repo.
- L'archivio delle lezioni ha ancora il 3% di margine sotto il suo tetto.
- Da qui, senza chiavi, i sensori non hanno riscritto la memoria con la loro cecità.

## Una correzione alla visita rapida

La visita rapida del 15 ottobre alle 21:07 diceva «la Cabina non risponde». Era falso. A non arrivarci era la rete di questo container, che blocca gli indirizzi di Vercel. Con lo strumento di Vercel la Cabina risponde, e scrive nella memoria ogni mattina. Lo stesso falso rosso del 10 ottobre è già pubblicato, e la Cabina lo mostra a te su se stessa. È un difetto noto, e sta nel lotto dei controlli che sbagliano.

---

## Dettagli tecnici

- **Visita rapida:** `node cervello/salute.mjs`, 2026-10-15 21:07, copertura 74%, 9 ok · 8 rossi · 6 non visti. Referto `consegne/salute/2026-10-15-2107-claude.md`. I due rossi della Cabina (`cabina.viva`, `cabina.cuore`) sono AR-956: proxy del container, CONNECT 403 su `*.vercel.app`.
- **Server** (162.55.51.250, Hetzner). Fonte: progetto Supabase della memoria, sola lettura. `impostazioni`: `worker:ultimo` = 2026-10-07 15:37:09; `worker:ultimo:lavoro-riuscito` = 2026-09-25 06:34, ma era un giro uscito per il lucchetto: l'ultimo lavoro vero è del 2026-09-09 12:17. `memoria-ad:ultimo_push` = 2026-09-01 12:15. `lavori`: 72 in attesa al 16/10 11:08 (67 il 15/10 21:13; 31 il 10/10), un giro «in corso» orfano dal 2026-09-25 12:32. Log API ultime 24 ore: solo Vercel. `salute.json` sezione vps: ultima visita 2026-09-01 06:51 (160 riavvii del worker, 1.159 del worker-chat, allineamento rimandato da 726 giri).
- **Ramo laterale:** `git log --all --author=VPS --since=2026-09-02` → 377 commit dal 2/9 al 10/9 06:44, tutti su `origin/fix/ar-046-mutazione-cieca`, non unito a `main`. Nessun commit del server dopo il 10/9 su nessun ramo. Il ramo di salvataggio `memoria/vps-2026-09-03` chiesto dalla card #168 non esiste.
- **Freno sulla spesa:** 269 lavori in errore «Il tetto di spesa di oggi è stato raggiunto», dal 2026-09-11 13:08 al 2026-09-25 12:07. Contatore al primo lavoro del giorno fra 2.050.000 e 2.550.000 token, soglia 2.000.000. `costo-ai.json` del 1/9: solo stime, `token_totali` 0. Schede collegate: AR-746, AR-803.
- **Firme del 24/9:** 53 firme fra le 07:30 e le 07:40 UTC, stati `coda` / `concluso:coda`, nota «Canale non indicato non ancora collegato: resta in coda». Card della macchina firmate: #168, #143, #150, #153, #177, #185 e altre, 19 in tutto. Nessuna firma dopo il 25/9. Le card a più strade (#177, #172, #185) hanno la firma senza la strada scelta.
- **Cabina:** progetto Vercel `ad-mycity`, deploy production del 2026-09-06 (29e0255), `git diff` vuoto su `pannello/`. Cron delle 09:00 UTC vivo (`cuore:ultimo` 2026-10-16 09:00:32 UTC). Muto dal 29/9 al 9/10, causa ignota: i log di Vercel coprono 7 giorni. `/api/worker-salute` mostra «worker.sh su disco è diverso da git» perché `worker:reload-rifiutato` = 2026-08-28 06:30 non scade mai ed è controllato prima di «worker spento».
- **Allarme esterno:** `cervello/battito-esterno.mjs` + `FONTI_TRACCE` di `cervello/salute.mjs` (righe 272-278) includono `ultimo-briefing.json`, scritto anche dalle sessioni cloud. Issue #868, 223 commenti, titolo fermo a «ferma da 11 ore». Battito esterno corsa #755 riuscita il 2026-10-16 07:10 UTC.
- **Verdi senza misura:** `cervello.fatti` verde con 0 file letti; `senior.loop` verde per costruzione; organo «Cervello» di `StatoMacchina.tsx` verde con un solo senior vivo e senza data; «Pagamenti: ok · live» su misura del 1/9; «Sensori ciechi: nessuno» con 3 ciechi; conto della salute che somma due visite di date diverse (51 controlli, 86%).
- **Cantiere:** 968 schede, 191 vive (180 aperte, 1 in corso, 10 da riverificare). Seri vivi 85: 7 bloccanti e 78 gravi, di cui 8 scritti con `severita` invece di `gravita` (AR-576, 584, 588, 598, 611, 622, 640, 641) e quindi mostrati «minore» da `cantiereSnello`. Ultima chiusura AR-955 del 2026-09-08. Tasso di ottobre 0 su 22. 23 schede con prova verde mai chiuse (21 chiudibili senza Nicola: tolte AR-891 e AR-927). Chiudibili da qui circa 70 dei 85 seri, in circa 10 lotti; servono Nicola almeno AR-070, 090, 119, 142, 206, 274, 518, 568, 802, 825, 833, 872, 927; serve il server AR-189. Chiusura solo con `auto-fix chiudi --id=` scheda per scheda, mai `--applica` (AR-863).
- **Worker che dice «fatto»:** dal 1/9, 28 giri «fatto» con risultato «esco senza fare nulla» (lucchetto) e 14 copie di «Riprova» segnate «fatto» da `pannello/.../riprova/route.ts` righe 56-65: 42 su 90.
- **Prove e CI:** `cervello/test/due-case.test.mjs` rossa quando STATO.md non ha la data di oggi (AR-968); main rosso dal 14/10. `main` senza protezione (`protected: false`): 8 entrate senza verde, la #877 del 15/10 con la corsa rossa 870. `intelligence-agenda.json` committato con null/999 in cefca6672. ~720 MB di cartelle temporanee in /tmp.
- **Sicurezza:** `.claude/settings.json` con `node cervello/*.mjs`, `bash cervello/*.sh` e `mcp__Supabase__execute_sql`, nessun divieto su push e force, `permessi-check` esce 1 (AR-142, AR-206; card #42, #115, #119). Card #7 (token GitHub in chiaro sul server) aperta da 91 giorni. Advisor di sicurezza della memoria: solo 26 INFO «RLS senza policy», nessun WARN o ERROR.
- **Memoria:** STATO.md 164.246 byte, aggiornato al 13/10; LETTERA-A-NICOLA del 30/7; CHECKLIST-NICOLA del 1/9 servita con `dato_al` null; AZIONI-IN-ATTESA 199.783 caratteri su 200.000; 7 fatti scaduti nel registro (fra cui la «data zero» del 29/8); «Supabase 50 €/mese» nel registro contro il piano gratuito; apprendimento.json al 96,9% del tetto (32.590 byte di margine); 235 correzioni di Nicola senza freno né debito dichiarato; 1 lezione nata in ottobre.
- **Senior:** 120 file = 120 in CLAUDE.md = 120 in AGENTI.md; nessun mandato conteso; 3 vivi negli ultimi 7 giorni (ultimo esito 2026-10-11 23:23), 70 mai un esito, 31 con una calibrazione previsto/reale. Sei senior senza il campo `tools`.
- **Per vedere di più:** accesso al server (console Hetzner e ssh); Stripe autorizzato o `STRIPE_SECRET_KEY`; `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` e `MARKETPLACE_SUPABASE_*` nell'ambiente cloud; rete aperta verso `ad-mycity.vercel.app`, `*.supabase.co` e il server (card #76); `NODE_USE_ENV_PROXY=1` per gli script node, che è gratis e fa tornare a vedere GitHub `ci-stato.mjs` e `verifica-automazione.mjs`; `TELEGRAM_BOT_TOKEN` e `TELEGRAM_CHAT_ID`.
- **Dati grezzi della visita:** 8 referti d'organo e 8 verifiche, più il critico, nel diario del flusso `wf_fbe2b556-2d8`.
