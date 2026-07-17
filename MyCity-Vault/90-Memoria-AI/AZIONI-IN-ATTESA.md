---
tipo: coda-azioni
fonte: senior dell'AD
---

# ⏳ AZIONI IN ATTESA — pronte a partire, aspettano il via di Nicola

> 🧹 **Housekeeping 2026-07-14 01:12** — Nicola «pulisci coda»: **101 → 22** card in «Da approvare» (confermato 02:15). Archiviate merge duplicate, PR già mergiate, social Garetti e gate scaduti. +1 nuova card merge #368 (fix numeri) aggiunta dal worker dopo la pulizia.

> Qui i senior accodano le azioni **🟡/🔴 già PRONTE** (testo esatto, destinatario, importo, canale).
> Le **🟢** non passano di qui: i senior le fanno e basta.
> Nicola dà l'ok → l'azione passa a ✅ FATTO e parte (via i canali del marketplace o a mano).

## Come approvare
Scrivi all'AD: **"ok [numero/azione]"** oppure **"ok a tutte le 🟡"**. L'AD esegue, segna FATTO qui e lascia la traccia in [[DECISIONI]].

---


### ✅ #pr-cassetto-conversazioni-fixed — PR #423 mergiata · FATTO 2026-07-17

Cassetto conversazioni ancorato con `position: fixed` — live su Vercel dopo il merge.

---

### 🟡 #chiudi-pr-422 — Chiudi PR #422 su GitHub (ha conflitti, è la vecchia) · ⏳ accodata 2026-07-17 01:30

**Cosa fare:** vai su GitHub → PR #422 → clicca "Close pull request" (senza merge).

PR #422 = branch `fix/chat-coda-messaggi` — è il branch stale che ha generato i conflitti. I fix che conteneva sono già stati riapplicati e confluiti in PR #424 (quella attiva, typecheck pulito). Lasciare #422 aperta causa confusione nei Checks di Vercel.

**Cosa cambia:** GitHub più pulito, nessun build Vercel spurio su una PR morta.
**Se va bene:** solo PR #424 rimane attiva per il merge dei 3 fix chat.

- **Colore:** 🟡 (azione su GitHub → Nicola)
- **Reparto:** frontend-dev

---

### ✅ #mergia-pr-424 — PR #424 mergiata · FATTO 2026-07-17 02:09

**APPROVATA** da Nicola via Pannello · 2026-07-17 02:08 · SHA merge: `6c41f2f708f6d3f787d42a6ff88f667e5283f118`

**Cosa fa:** Nicola ha eseguito i 3 comandi VPS (branch `fix/chat-3bug-v2`, commit fix 3 bug chat). L'AD ha aperto PR #424 — nessun conflitto.

**Per metterlo live:** mergia PR #424 → https://github.com/NicolaeRotaru/ad-mycity/pull/424

**Cosa cambia:** (1) doppia risposta eliminata — check coda sincrono su `pendingLavoroChatRef`; (2) flicker sparito — rimossi blocchi "Sto lavorando..." ridondanti; (3) bottone invio funziona su smartphone anche durante l'elaborazione.
**Se va bene:** chat stabile su tutti i dispositivi; live su Vercel in ~2 min.

- **Colore:** 🟡 (merge su main → Nicola)
- **Reparto:** frontend-dev

---

### 🟡 #vercel-token-vps — Riavvia il worker per attivare il token Vercel · ⏳ aggiornata 2026-07-17 ~01:56

**Stato:** token IN `cervello/vps/.env` ✅ (Nicola confermato, path corretto per systemd). Serve solo riavvio.

**Comando (terminale VPS):**
```bash
sudo systemctl restart mycity-worker-chat.service
```

**Cosa cambia:** l'AD potrà vedere i log di build Vercel in tempo reale dalla chat del Pannello.
**Se va bene:** al prossimo build fallito, l'AD diagnostica autonomamente senza chiedere a Nicola.

---

### 🟡 #streaming-worker — Streaming live chat (testo parola-per-parola come Claude.ai) · ⏳ accodata 2026-07-17

**Cosa fare (nel worker-chat, NON nel Pannello):**

Nicola ha chiesto (17/7): «voglio che la conversazione sia live come quella di claude». Il Pannello già ha il codice per mostrare il testo parziale — il problema è che il worker manda il blocco completo solo a fine elaborazione.

Fix = DUE modifiche nel worker:
1. **Worker**: ogni N secondi, mentre Claude sta ragionando, scrivi su DB il testo prodotto finora (campo `risposta_parziale` o simile)
2. **Già fatto**: il frontend legge già questo campo e aggiorna la bolla — non serve toccare il Pannello

**Cosa cambia:** le parole appaiono man mano, come in Claude.ai. Non si aspetta il blocco finale.
**Se va bene:** esperienza molto più naturale; utente vede subito che la macchina sta ragionando.

- **Colore:** 🟡 (modifica al cuore del worker — l'AD lo esegue dopo ok di Nicola)
- **Reparto:** frontend-dev / builder-automazioni

---

### ✅ #pr-chat-conv-pulsanti — PR #415 mergiata · FATTO 2026-07-16 (merge e6671f5f)

---

### 🟡 #thinking-budget-vps — Alza il ragionamento interno della chat nel VPS · ⏳ accodata 2026-07-16 17:30

**Cosa fare (sul VPS, nel `.env` del worker-chat):**

Nicola ha confermato: vuole ragionamento profondo interno + output breve. Non serve PR — è un parametro nel `.env`.

Cerca la variabile `THINKING_BUDGET` (o equivalente) nel file `.env` del VPS e alzala al massimo consentito dal modello (tipicamente `10000` o il valore indicato nella config del worker).

**Cosa cambia:** la chat «pensa di più» prima di rispondere — più profondità nell'analisi, stessa risposta breve all'esterno.
**Se va bene:** nei turni con domande complesse vedrai risposte meglio ragionate senza diventare più lunghe.

- **Colore:** 🟡 (modifica env VPS — Nicola la fa)
- **Reparto:** prompt-engineer

---

### ✅ #pr-411-chat — PR #411 mergiata da Nicola · FATTO 2026-07-16 ~17:30

Nicola ha mergato PR #411 (7 fix chat). Vercel ha rotto il build per errore TypeScript TS2367 in `page.tsx:2959` — fix in branch separato (vedi #fix-vercel-ts-2959 sotto).

---

### ✅ #pr-416-skill-tab — PR #416 mergiata da Nicola · FATTO 2026-07-17 (merge 73e79d97)

Chat si apre vuota, comandi rapidi nella tab ⚡ Skill. Build Vercel partito dopo il merge.

---

### ✅ #pr-419-chat-3fix — PR #419 mergiata da Nicola · FATTO 2026-07-17 (merge f3389eb8)

Chat stabile: niente doppioni, niente lampeggio, bottone invio funziona su mobile. TS2367 risolto nel merge.

---

### ✅ #fix-vercel-ts-2959 — Fix TS2367 incluso nel merge PR #419 · FATTO 2026-07-17

`const chatVisibile = chatFluttuante` incorporato da Nicola nel merge di PR #419 (f3389eb8). Branch separato non necessario.

---

### ✅ #pr-415-chat-pulsanti — PR #415 mergiata · FATTO 2026-07-16 (merge e6671f5f — conv in cima + pulsanti in basso)

---

### ✅ #burn-mensile-runway — APPROVATA 2026-07-16 21:17 · esegui il comando sul VPS

**Diagnosi completa:** `consegne/finanza/2026-07-16-diagnosi-cassa-runway.md`

**Nicola: esegui questo comando sul VPS** (una sola volta):
```bash
echo '' >> /opt/mycity/ad-mycity/cervello/vps/.env
echo '# Burn mensile stimato (stima 150€ — aggiorna con il valore reale)' >> /opt/mycity/ad-mycity/cervello/vps/.env
echo 'BURN_MENSILE_EUR=150' >> /opt/mycity/ad-mycity/cervello/vps/.env
```
Oppure, se preferisci il valore reale (VPS + Vercel + Cursor + domini), sostituisci `150` con il numero giusto prima di eseguire.

**Stato:** Nicola ha approvato dal Pannello (21:17:43). File `.env` protetto da permessi — scrittura solo da Nicola.

**Cosa cambia:** la macchina calcola i mesi di autonomia (cassa ÷ burn) e allerta se sotto 3 mesi.
**Se va bene:** da prossimo giro vedrai il runway nel cruscotto (con cassa 0€ = runway critico → plan con @fp-and-a).

- **Colore:** 🟡 (modifica env VPS)
- **Reparto:** finanza
- **Origine:** `{origine:sentinella:cassa_sconosciuta}`

---


### 🟡 #ritiro-pq-vp17-checkin — Giovedì chiama il fornaio e conferma il presidio di venerdì al banco · ⏳ accodata 2026-07-14 11:07

> **Contesto anti-churn 15/7 12:56:** sentinella `negozio_fermo` ri-scattata — **falso positivo confermato** (PQ aspetta VP 17/7, non sta mollando). Scan REST → **0 negozi in calo**; rischio = **zero ordini consegnati** (non abbandono). Re-accodamento **saltato** (cooldown 24h). Report: `consegne/account-negozi/2026-07-15-negozio-fermo-pane-quotidiano.md`.

**Quando:** **giovedì 16/7 mattina** (T-1 al Venerdì Piacentini).

**Chi chiami:** Pane Quotidiano · **0523 388601** · Via Calzolai 25.

**Script (2 minuti, tono relazione — non «ci manchi»):**

> «Ciao, sono Nicola di MyCity. Venerdì sera c'è il Venerdì Piacentini — centro pieno. Ti va se passo da te al banco con il QR e restiamo lì un'oretta? I clienti ordinano e **ritirano da te** (la bici non è ancora pronta). Così proviamo il primo ordine vero insieme, senza stress di consegna a domicilio.»

**Cosa cambia:** il fornaio sa che venerdì non resta solo — il rischio «qui non vendo mai» si abbassa prima del VP.
**Se va bene:** venerdì 17/7 al banco → primo ordine ritiro → North Star 0→1 → payout-test (#41).

- **Colore:** 🟡 (telefonata a negoziante reale — Nicola la fa)
- **Canale:** telefono
- **Reparto:** account-negozi
- **Origine:** `{origine:playbook:negozi-calo}`

---


### 🔴 #post-kefir-estate-1407 — Pubblica "La vera stella della colazione" sui canali locali · ⏳ accodata 2026-07-14 02:43

**Contenuto completo:** `consegne/content/2026-07-14-post-del-giorno-kefir-caldo-PQ.md` · anteprima [[AZIONI-PRONTE]] **A28**

**Testo pronto (versione Gruppi Facebook):**

> Chi ha voglia di uscire a prendere la colazione fresca con questo caldo? 😅
>
> Stiamo portando online i negozi veri di Piacenza: c'è **Pane Quotidiano** (Via Calzolai, bio dal '76) con kefir e freschi bio già ordinabili. Te li portiamo a casa al mattino, paghi alla consegna se ti è più comodo.
>
> Se ti va di provare, link nel primo commento 👇

**Prima del post servono da Nicola (due minuti):**
1. **Link lista d'attesa** — incollalo e la macchina completa il primo commento
2. **Visual** — tipografico neutro subito, oppure foto kefir reale da negozio

**Timing suggerito:** oggi entro le 11 (fascia colazione).

**Cosa cambia:** post estivo prodotto-eroe sul negozio reale — colazione fresca a domicilio senza uscire col caldo.
**Se va bene:** click lista d'attesa via UTM + PQ ripubblica ai clienti.

- **Colore:** 🔴 (pubblicazione IG/FB/gruppi — firma Nicola)
- **Canale:** Gruppi FB locali + Instagram/Facebook @mycity.piacenza

---


### ✅ #pr-342-pannello-streaming-live — MERGIATA 2026-07-13 ~18:50 · ⏳ nona prova streaming in corso
- **Stato:** ✅ ARCHIVIATA housekeeping 14/7

**Cosa fa:** il Pannello aggiorna la bolla chat in tempo reale mentre l'AD scrive (poll UI) e fissa i pallini che tornavano ad ogni pezzo di streaming.

**PR su GitHub:** [#342 su ad-mycity](https://github.com/NicolaeRotaru/ad-mycity/pull/342) ← commit `6ee0ac4a`

**Esito 18:41:** diagnosi verificata — worker già scriveva parziali in DB; collo di bottiglia era il Pannello, non il VPS.

**Esito 18:50:** Nicola «fatto» — merge eseguito; quinta prova streaming.

**Esito 18:54:** Nicola «fai la prova» — sesta prova streaming; esito non dichiarato.

**Esito 18:56:** Nicola «rifai la prova» — settima prova streaming; esito non dichiarato.

**Esito 19:02:** Nicola «**cresce live, però solo alla fine**» + «non da quando inizi» — **progresso parziale** (primo «cresce live» dopo 7 prove); tema **non chiuso** — serve #343 + aggiorna-cervello.sh per streaming dall'inizio.

**Esito 19:13:** Nicola «**ok fatto**» — VPS allineato (`aggiorna-cervello.sh` completato, worker-chat riavviato 19:10); **nona prova** streaming in corso.

**Esito 19:15:** Nicola feedback 3 punti — (1) «Sto elaborando…» subito **sì** · (2) testo vero **solo alla fine** · (3) pallini **uguali**. Streaming parziale (#343 ok placeholder); pallini #342 insufficiente — **tema aperto**.

**Esito 19:23:** Nicola «**2) tutto insieme**» — testo finale non cresce parola per parola nemmeno negli ultimi secondi; arriva in un colpo solo. Prossimo fix = diagnosi parziali DB vs Pannello, non merge/restart.

**Esito 14/7 02:37:** riapprovazione Pannello 00:35 — merge **già eseguito** su GitHub (`2e273311`, 13/7 18:46). Worker: `esegui-azione github-merge` → «PR #342 non è aperta (stato: closed)» exit 1 — obiettivo già raggiunto, nessun secondo merge.

- **Colore:** ✅ merge fatto · ⏳ streaming testo vero (tutto insieme) + pallini ancora aperti

---


### ✅ #pr-343-streaming-reattivo-inizio — MERGIATA 2026-07-13 ~19:05 · ✅ Nicola «ok fatto» 19:13
- **Stato:** ✅ ARCHIVIATA housekeeping 14/7

**Cosa fa:** mostra «Sto elaborando…» / «Sto verificando i dati…» subito dopo l'invio e aggiorna la bolla più spesso — lo streaming parte dall'inizio, non solo in fase testo finale.

**PR su GitHub:** [#343 su ad-mycity](https://github.com/NicolaeRotaru/ad-mycity/pull/343)

**Esito 19:10:** VPS usciva RIMANDATO (branch `fix/streaming-piu-reattivo-inizio`) — AD ha chiuso branch → main `5a6bd24b`, codice #343 su disco.

**Esito 19:13:** Nicola «**ok fatto**» — `aggiorna-cervello.sh` completato, worker-chat riavviato 19:10, codice #343 live; nona prova streaming in corso.

**Esito 19:15:** Nicola — (1) «Sto elaborando…» subito **sì** (#343 ok) · (2) testo vero **solo alla fine** (obiettivo non raggiunto) · (3) pallini **uguali** (track separato).

**Esito 19:23:** Nicola «**2) tutto insieme**» — nemmeno parola per parola negli ultimi secondi; #343 raggiunge solo placeholder iniziale.

- **Colore:** ✅ merge fatto · ⏳ testo vero tutto insieme — serve fix oltre #343 (DB vs Pannello)

---


### ✅ #pr-341-streaming-vps-allineamento — MERGIATA 2026-07-13 ~18:50 · ✅ Nicola «fatto»
- **Stato:** ✅ ARCHIVIATA housekeeping 14/7

**Cosa fa:** allinea codice VPS da GitHub e riavvia **entrambi** i worker (principale + chat); fix streaming poll 1s + testo semplice mentre scrivo — chiude il buco «restart non basta».

**PR su GitHub:** [#341 su ad-mycity](https://github.com/NicolaeRotaru/ad-mycity/pull/341) ← commit `cf690e6e`

**Esito 18:50:** Nicola «fatto» — merge + procedura completati insieme a #342.

- **Colore:** ✅ merge fatto · ✅ Nicola ha eseguito procedura 13/7 ~18:50

---


### ✅ #pr-340-pallino-mancante — MERGIATA 2026-07-13 ~18:14 · ⏳ deploy Vercel + test Nicola
- **Stato:** ✅ ARCHIVIATA housekeeping 14/7

**Cosa fa:** mostra il pallino rosso sulle chat con risposta AD non letta anche quando sei in Plancia/Lavori — pallino sparisce solo se la chat è davvero a schermo (tab Assistente o drawer fluttuante).

**PR su GitHub:** [#340 su ad-mycity](https://github.com/NicolaeRotaru/ad-mycity/pull/340) ← merge `824e1759`, commit `eef9e4f4`

**Esito verifica 18:15:** codice su main ok; test B = scrivi → Plancia → elenco Conversazioni deve mostrare pallino dopo risposta AD.

**Esito 18:27:** Nicola «merge non lette» — fix è su Vercel, non worker; serve deploy + Ctrl+F5 (restart worker non cambia pallini).

**Pendente:** refresh forzato Pannello (Ctrl+F5) post-deploy Vercel.

- **Colore:** ✅ merge fatto · verifica UX post-deploy

---


### ✅ #pr-339-streaming-spezzato — MERGIATA 2026-07-13 ~18:14 · ✅ riavvio worker FATTO 18:22 · ⏳ aggiorna-cervello.sh
- **Stato:** ✅ ARCHIVIATA housekeeping 14/7

**Cosa fa:** durante lo streaming in chat, il testo cresce **in orizzontale** (parola per parola) invece di spezzarsi a colonna — worker concatena i micro-frammenti Cursor; Pannello mostra testo semplice (no Markdown) finché la risposta non è completa.

**PR su GitHub:** [#339 su ad-mycity](https://github.com/NicolaeRotaru/ad-mycity/pull/339) ← merge `d7881680`, commit `1081be71`

**Esito verifica 18:15:** `_estrai_stream` testato in locale con pattern bug Nicola.

**Esito 18:22:** Nicola ha eseguito `sudo systemctl restart mycity-worker-chat` + Ctrl+F5.

**Esito 18:27:** streaming **ancora rotto** — restart non aggiorna codice su disco; serve **#341** + `aggiorna-cervello.sh`.

- **Colore:** ✅ merge fatto · ⏳ VPS allineamento via #341

---


### ✅ #pr-338-streaming-pallini — MERGIATA 2026-07-13 ~17:58 · ✅ riavvio worker FATTO 18:22
- **Stato:** ✅ ARCHIVIATA housekeeping 14/7

**Cosa fa:** ripristina lo streaming parola-per-parola con motore Cursor (la #335 aveva reintrodotto flag incompatibili) e chiude la race del pallino che tornava ~5s dopo aver aperto la chat (`segnaLetta` salva orario «adesso» in persist).

**PR su GitHub:** [#338 su ad-mycity](https://github.com/NicolaeRotaru/ad-mycity/pull/338) ← merge `81c28c0b`, commit fix `30c4c614`

**Esito:** Nicola riconferma pallino ancora visibile ~18:01 — probabile versione Vercel pre-deploy (2–3 min). Test post-deploy: refresh forzato → apri chat col pallino → resta 15s → pallino non torna.

**Esito 18:22:** Nicola ha eseguito restart worker + Ctrl+F5 — streaming live ora testabile; pallini da verificare post-deploy.

- **Colore:** ✅ merge fatto · ✅ riavvio worker fatto 13/7 18:22

---


### ✅ #pr-337-git-pr-body-gate — MERGIATA 2026-07-13 ~17:49
- **Stato:** ✅ ARCHIVIATA housekeeping 14/7

**Cosa fa:** `git-pr.mjs` si ferma se manca il body reale (cosa/perché/come provare) — niente più PR con solo «PR aperta dall'AD…»; se la PR esiste già, aggiorna la descrizione quando il testo è diverso.

**PR su GitHub:** [#337 su ad-mycity](https://github.com/NicolaeRotaru/ad-mycity/pull/337) ← body verificato 997 caratteri

**Cosa cambia:** da oggi nessuna PR nuova può aprirsi senza spiegazione in italiano dentro GitHub — lo script blocca l'AD se dimentica.
**Se va bene:** prova ad aprire una PR senza body: deve fallire con messaggio chiaro.

- **Colore:** ✅ merge fatto (#337 live)

---


### ✅ #pr-336-pallini-poll — MERGIATA 2026-07-13 ~17:49 · residuo → #338
- **Stato:** ✅ ARCHIVIATA housekeeping 14/7

**Cosa fa:** quando apri una chat con pallino, segna «letta» con l'orario più recente tra chat e lavoro AD, e si riallinea al refresh automatico dell'elenco — il pallino non torna rosso dopo ~5 secondi.

**PR su GitHub:** [#336 su ad-mycity](https://github.com/NicolaeRotaru/ad-mycity/pull/336) ← commit `ee9d3f9b`, mergiata ~17:49

**Esito:** Nicola riconferma pallino ancora rosso post-merge — race `persistConversazione` coperta in **#338** (mergiata ~17:58).

- **Colore:** ✅ merge fatto · fix completo in #338 mergiata

---


### ❌ #pr-334-pallini-poll — ANNULLATA 2026-07-13 17:51 · sostituita da #336
- **Stato:** ✅ ARCHIVIATA housekeeping 14/7

**Cosa è successo:** Nicola «c'è un conflitto» — #334 partiva da codice vecchio e mescolava fix già su main (#328/#332/#333). Stesso bug coperto da **#336** (ribasata su main, merge simulato OK).

**Da fare:** Chiudi PR #334 su GitHub **senza mergiare** (se ancora aperta).

- **Colore:** 🟢 (annullata — nessun merge)

---


### ✅ #pr-335-streaming-chat — MERGIATA 2026-07-13 ~17:49 · ⚠️ fix annullato su main
- **Stato:** ✅ ARCHIVIATA housekeeping 14/7

**Cosa fa:** riattiva lo streaming in chat quando il motore è Cursor — il testo compare nel Pannello mentre l'AD lavora.

**PR su GitHub:** [#335 su ad-mycity](https://github.com/NicolaeRotaru/ad-mycity/pull/335) ← fix buono `db0552a0`, merge ha portato `68c15aa4` con codice vecchio

**Esito:** streaming rotto su main — ripristino in **#338** (mergiata ~17:58). Dopo merge: `sudo systemctl restart mycity-worker-chat`.

- **Colore:** ✅ merge fatto · fix in #338 mergiata · riavvio worker pendente

---


### ✅ #pr-331-worker-plugins-fase3 — MERGIATA 2026-07-13 · ✅ riavvio worker FATTO 18:22
- **Stato:** ✅ ARCHIVIATA housekeeping 14/7

**Cosa fa:** aggiunge al manifest 8 skill GitHub (21 totali): debug sistematico, design moduli, Supabase, Postgres, cross-repo, PDF/Excel/Word.

**PR su GitHub:** [#331 su ad-mycity](https://github.com/NicolaeRotaru/ad-mycity/pull/331) ← commit `41ab7192`

**Esito audit 17:55:** su main ma worker **non riavviato** dal 16:08 — plugin fase 3 non caricati live.

**Esito 18:22:** Nicola ha riavviato `mycity-worker-chat` — plugin fase 3 ora caricabili live.

- **Colore:** ✅ merge fatto · ✅ riavvio worker fatto 13/7 18:22

---


### ✅ #pr-329-agent-registry — MERGIATA 2026-07-13 · card coda ancora «chiusa»
- **Stato:** ✅ ARCHIVIATA housekeeping 14/7

**Cosa fa:** guardiano agenti legge le `description` di routing e segnala collisioni (fraud-risk/trust-safety).

**PR su GitHub:** [#329 su ad-mycity](https://github.com/NicolaeRotaru/ad-mycity/pull/329) ← commit `53afcdcc`

**Esito audit 17:55:** su main; card #101 in coda Pannello non ancora aggiornata.

- **Colore:** ✅ merge fatto

---


### ❌ #pr-327-pallini-badge — ANNULLATA 2026-07-13 17:16 · sostituita da #328
- **Stato:** ✅ ARCHIVIATA housekeeping 14/7

**Cosa è successo:** Nicola «le mergio entrambe?» — #327 era fix incompleto (solo badge, senza sync server cross-device). Stesso bug coperto da **#328** (commit `812cff8b`, conflitti risolti).

**Da fare:** Chiudi PR #327 su GitHub **senza mergiare**. Mergia solo **#328** (card #102).

- **Colore:** 🟢 (annullata — nessun merge)

---


### ❌ #pr-332-pallini-orologio — ANNULLATA 2026-07-13 17:45 · sostituita da #336
- **Stato:** ✅ ARCHIVIATA housekeeping 14/7

**Cosa è successo:** fix incompleto — Nicola conferma che il pallino riaccende ancora dopo ~5s. Stesso bug coperto da **#336** (max orario chat+lavoro + riallineamento al poll). #334 annullata 17:51 (conflittuale).

**Da fare:** Chiudi PR #332 su GitHub **senza mergiare**. Mergia solo **#336** (card #108).

- **Colore:** 🟢 (annullata — nessun merge)

---


### ❌ #pr-328-pallini-sync — GIÀ SU MAIN 2026-07-13 17:51 · chiudere PR se ancora aperta
- **Stato:** ✅ ARCHIVIATA housekeeping 14/7

**Cosa è successo:** fix pallini sync telefono/PC (#328) già mergiato su main insieme a #332/#333. Nicola non deve mergiare di nuovo.

**Da fare:** Se #328 è ancora aperta su GitHub, **chiudila senza merge**. Per il residuo pallino ~5s → solo **#336** (card #108).

- **Colore:** 🟢 (già su main — nessun merge richiesto)

---


### ✅� #pr-323-avvisi-parla — Mergia PR #323: «Parla con questa casella» su schede Avvisi · ⏳ chiusa · accodata 2026-07-13 14:33
- **Stato:** ✅ ARCHIVIATA housekeeping 14/7

**Cosa fa:** sotto ogni scheda gialla «memoria incoerente» in Avvisi compare il link **«Parla con questa casella»** — apri chat contestuale, l'AD vede il testo completo dell'avviso e la data.

**PR su GitHub:** [#323 su ad-mycity](https://github.com/NicolaeRotaru/ad-mycity/pull/323)

**Cosa cambia:** da sola lettura dell'avviso a dialogo con l'AD su cosa significa e cosa fare — stesso pattern delle altre card del Pannello.
**Se va bene:** mergi #323 dal Pannello → deploy Vercel → Avvisi → sotto ogni scheda gialla trovi «Parla con questa casella».

- **Colore:** 🟢🟢 (merge dal Pannello — card #96)

---


### ❌ #pr-320-worker-plugins — ANNULLATA 2026-07-13 17:19 · plugin fase 1 già su main
- **Stato:** ✅ ARCHIVIATA housekeeping 14/7

**Cosa è successo:** Nicola segnalò conflitto su #320 — stessi file già entrati su `main` con recovery worker (`601aec92`/`f5f5ae96`, 13/7 12:32–12:37). Manifest, sync, grilling, ponytail e caveman-internal già live.

**Da fare:** Chiudi PR #320 su GitHub **senza mergiare** (come #316). Fase 2 = **PR #330 mergiata** (`ac9e24a9`). Dopo: **riavvia worker** una volta per caricare le 14 skill del manifest.

- **Colore:** 🟢 (già su main — nessun merge richiesto)

---


### ✅� #pr-319-volano-tasso — Mergia PR #319: fix volano tasso lezioni (ESITI quaderni + STATO) · ⏳ chiusa · accodata 2026-07-13 12:42
- **Stato:** ✅ ARCHIVIATA housekeeping 14/7

**Cosa fa:** il calcolo del tasso lezioni legge anche gli ESITI dei quaderni senior e le citazioni in STATO, non solo i briefing — tasso onesto **0,29** (39/133). Fix pipeline in `giro.sh` + `tasso-lezioni.mjs` + `sentinella-dati.mjs`.

**PR su GitHub:** [#319 su ad-mycity](https://github.com/NicolaeRotaru/ad-mycity/pull/319) ← branch `fix/volano-tasso-lezioni`, commit `2d8ff61f` (conflitti risolti 13/7 12:42 — uniti #317+#318 su main)

**Cosa cambia:** il volano auto-coscienza misura le lezioni realmente applicate nel lavoro, non sottostima più.
**Se va bene:** mergi #319 dal Pannello → prossimo giro aggiorna sentinella volano con tasso corretto.

- **Colore:** 🟢🟢 (merge dal Pannello — card #96)

---


### ✅ #pr-305-ordine-conversazioni — FATTO 2026-07-12 17:44 · fix già su main via PR #303 mergiata da Nicola
- **Stato:** ✅ ARCHIVIATA housekeeping 14/7

Aprire una chat non la sposta più in cima nella lista Conversazioni — ordine stabile (pinnate 📌 + data creazione). Commit `67c6b804` su main. PR #305/#306/#304 doppioni da chiudere senza merge (conflitti su file cervello). Deploy Vercel automatico.

- **Colore:** 🟢 (già merged via #303)

---


### 🟡 #pr-297-archivio-parallelo — Mergia PR #297: Archivio carica in 1-2 sec invece di 15 · ⏳ IN ATTESA · accodata 2026-07-12

**Cosa fa:** la route API dell'Archivio leggeva le cartelle una alla volta (15 chiamate HTTP in fila = ~15 secondi). Con `Promise.all()` tutte le chiamate partono insieme — il tempo diventa quello della cartella più lenta (~1-2 secondi).

**PR su GitHub:** [#297 su ad-mycity](https://github.com/NicolaeRotaru/ad-mycity/pull/297) ← branch pulito, solo `route.ts`, zero conflitti

⚠️ **Chiudi PR #296 su GitHub senza mergiare** — aveva conflitti su `sentinella-dati.json`, superata da #297.

**Cosa cambia:** apri Archivio → vedi i file in 1-2 secondi invece di aspettare 15.
**Se va bene:** deploy automatico, Archivio diventa comodo da usare ogni giorno.

- **Colore:** 🟡 (codice Pannello → il merge lo fai tu)

---


### ❌ #pr-299-badge-fix — SOSTITUITA da PR #316 · 2026-07-13 12:14
- **Stato:** ✅ ARCHIVIATA housekeeping 14/7

**Cosa è successo:** PR #299 (fix parziale badge) superata da #316 che unisce sync chat cross-device + logica badge completa secondo specifica Nicola 13/7.

**Da fare:** Chiudi PR #299 su GitHub senza mergiare. ~~Mergia **#316**~~ → sync già su main (#317); chiudi #316 senza merge.

---


### ❌ #pr-316-chat-sync-badge — SOSTITUITA · sync già su main · 2026-07-13 12:39
- **Stato:** ✅ ARCHIVIATA housekeeping 14/7

**Cosa è successo:** sync chat PC↔telefono + fix pallini rossi entrati su `main` con merge #317 (13/7 ~12:30). PR #316 obsoleta — stesso fix già live.

**Da fare:** Chiudi PR #316 su GitHub **senza mergiare**. Chiudi anche #299 se ancora aperta.

---


### ✅� #pr-318-chat-ux-tre-fix — Mergia PR #318: X prompt + chat evidenziata + annulla invio · ⏳ chiusa · accodata 2026-07-13 12:27
- **Stato:** ✅ ARCHIVIATA housekeeping 14/7

**Cosa fa:** (1) **X** sulla card «Prompt pronto» — chiudi senza copiare; (2) chat aperta **evidenziata** nel cassetto (bordo colorato + «aperta ora»), anche in chat fluttuante; (3) **Annulla invio** mentre compare «sto pensando…» — ferma l'AD, toglie il messaggio, rimette il testo nella casella.

**PR su GitHub:** [#318 su ad-mycity](https://github.com/NicolaeRotaru/ad-mycity/pull/318) ← branch `fix/chat-ux-tre-fix`, commit `03751823`, solo `globals.css` + `page.tsx` (conflitti risolti 13/7 12:39 — file worker contatore lezioni rimossi dal branch)

⚠️ **Non mergiare #316** — sync già su main. Opzionale: chiudi #316 senza merge.

**Cosa cambia:** UX chat più controllabile — chiudi prompt, vedi quale chat hai aperto, annulla invii per sbaglio.
**Se va bene:** deploy automatico Vercel; i tre fix online su PC e telefono.

- **Colore:** 🟢🟢 (merge dal Pannello — card #94)

---


### ✅ #pr-conv-pin-badge — FATTO 2026-07-12 02:22 · PR #294 MERGIATA da Nicola · pin + badge "non letto" live
- **Stato:** ✅ ARCHIVIATA housekeeping 14/7

Feature: graffetta (📌) per pinnare chat in cima + pallino rosso per messaggi non letti (localStorage). PR #292 e #293 scartate per conflitti su file di memoria → risolto al terzo tentativo con branch pulito da main HEAD + solo `pannello/src/app/page.tsx`. Deploy Vercel automatico partito.

⚠️ **Chiudi PR #292 e #293 su GitHub senza mergiare** (superate da #294 già merged).

- **Colore:** 🟢 (già merged)

---


### ❌ #pr-290-report-piani — CHIUDERE SENZA MERGE · PR #290 basata su malinteso · 2026-07-12 01:39
- **Stato:** ✅ ARCHIVIATA housekeeping 14/7

**Cosa è successo:** PR #290 spostava "Archivio" in una sezione dedicata "Report & Piani" nel sidebar. Nicola ha chiarito che NON vuole quella sezione — vuole rimettere "Archivio" com'era prima (dentro "Approfondisci"). La PR #290 va chiusa su GitHub **senza mergiare**.

**Cosa voleva davvero Nicola:** il navigatore ad albero (Opzione A). **Già fatto:** commit `cc99d5e7` su main, deploy automatico in corso — Archivio mostra cartelle cliccabili.

**Da fare:** Nicola chiude PR #290 su GitHub senza mergiare (il navigatore è già live senza bisogno di quella PR).

---


### ❌ #pr-289-guard-pannello-main — SOSTITUITA da PR #295 (aveva conflitti) · 2026-07-12 02:35
- **Stato:** ✅ ARCHIVIATA housekeeping 14/7

PR #289 aveva conflitti su `sentinella-dati.json` e `routing.json`. Sostituita da PR #295 (branch pulito, zero conflitti). **Chiudi PR #289 su GitHub senza mergiare.**

---


### ✅ #pr-295-guard-pannello-main-v3 — FATTO 2026-07-12 02:40 · PR #295 MERGIATA da Nicola · guard giro.sh v3 live
- **Stato:** ✅ ARCHIVIATA housekeeping 14/7

La guard in `giro.sh` è attiva: il sistema di recupero VPS non commette più `pannello/` o `cervello/` su main automaticamente.

⚠️ **Chiudi PR #289 su GitHub senza mergiare** — superata da #295 già merged.

- **Colore:** 🟢 (già merged)

---


### ✅ #pr-288-scroll-chat — FATTO 2026-07-12 01:14 · Fix già su main (commit bf1ac43d) — nessuna PR da mergiare
- **Stato:** ✅ ARCHIVIATA housekeeping 14/7

Il sistema di recupero VPS ha committato il fix `forzaScrollRef` direttamente su main, come già successo con PR #286. **PR #288 va chiusa su GitHub (è superata — la modifica è già live).** La chat ora si apre sempre all'ultimo messaggio.

- **Colore:** 🟢 (già su main)

---


### 🟡 #pr-archivio-sezioni-chiuse — Pusha il branch e apri PR: sezioni Archivio chiuse di default · ⏳ IN ATTESA · accodata 2026-07-12 00:46

**Cosa fa:** le sezioni dell'Archivio (account-negozi, Audit & radiografie, ecc.) partono chiuse invece di aperte. Clicchi sul titolo → si apre; clicchi ancora → si richiude. Freccia ruota di 180°. La ricerca mostra i risultati comunque.

**Branch locale:** `fix/archivio-sezioni-chiuse-default` · commit `35524d20` (SOLO LOCALE — non pushato)
**File modificato:** `pannello/src/app/archivio/Documenti.tsx`

**Per sbloccare — scegli una delle due:**
- (A) Dal VPS: `git push origin fix/archivio-sezioni-chiuse-default` → poi apri PR su GitHub
- (B) In chat: scrivi **"ok pr archivio sezioni"** → l'AD esegue `node cervello/git-pr.mjs --repo ad-mycity --base main --accoda`

**Cosa cambia:** l'Archivio si apre pulito — vedi solo i titoli delle sezioni; espandi solo quelle che ti servono.
**Se va bene:** Nicola mergia la PR → deploy automatico → Archivio aggiornato nel Pannello.

- **Colore:** 🟡 (codice Pannello → il merge lo fai tu)

---


### ✅ #pr-chat-fluttuante-v2 — FATTO 2026-07-12 00:42 · Fix già su main (commit 4bcdd5c5) — nessuna PR da mergiare
- **Stato:** ✅ ARCHIVIATA housekeeping 14/7

Il sistema di recupero ha committato il fix direttamente su main prima che fosse possibile mergiare la PR #286. **PR #286 va chiusa su GitHub (è superata — la modifica è già live).**

- **Colore:** 🟢 (già su main)

---


### ✅ #pr-284-archivio — FATTO 2026-07-12 00:40 · PR #287 mergiata da Nicola · "Archivio" ora nel menu del Pannello
- **Stato:** ✅ ARCHIVIATA housekeeping 14/7

- **Colore:** 🟡 (codice Pannello → il merge lo fai tu)

---


### ✅ #pr-276-grafica-chat-coda — FATTO 2026-07-12 02:44 · PR #276 MERGIATA da Nicola · grafica "In coda" a 3 livelli live
- **Stato:** ✅ ARCHIVIATA housekeeping 14/7

La sezione **Lavori** del Pannello mostra ora 3 stati visivi distinti: in elaborazione (animato), in coda (grigio), errore (rosso). PR #275 (superata) chiusa. Deploy Vercel automatico.

- **Colore:** 🟢 (già merged)

---


### ✅ #pr-274-memoria-chat — FATTO 2026-07-12 02:44 · PR #274 MERGIATA da Nicola · chat con memoria sessioni precedenti live
- **Stato:** ✅ ARCHIVIATA housekeeping 14/7

Ogni messaggio include automaticamente le ultime conversazioni compresse. #272 (contesto memoria in coda), #270 (errori AutoCoscienza), #269 (chat caselle compatta) — tutte mergiata nello stesso batch. Deploy Vercel automatico.

- **Colore:** 🟢 (già merged)

---


### ✅ #crea-tabella-conversazioni — FATTO 2026-07-12 01:30 · Nicola ha eseguito il SQL su Supabase SQL Editor · tabella `conversazioni` + index + RLS + policy creati nel DB Memoria
- **Stato:** ✅ ARCHIVIATA housekeeping 14/7

⚡ **APPROVATA in chat da Nicola il 12/7 00:35 ("fallo tu")** — firma data. Il MCP Supabase Memoria è connesso (`apply_migration` disponibile). L'AD può eseguire direttamente nel prossimo turno.

**Problema:** le chat del Pannello si perdono a ogni ricarica perché la tabella `conversazioni` non esiste nel DB Memoria. Il codice è pronto, la tabella no.

**Passi — firma Nicola (2 opzioni):**

**Opzione A — 3 minuti su Supabase (subito):**
1. Vai su [supabase.com](https://supabase.com) → progetto Memoria (`xjljcsorpbqwttrejqte`)
2. SQL Editor → incolla e clicca **Run**:
```sql
create table if not exists public.conversazioni (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  titolo text not null default 'Conversazione',
  messaggi jsonb not null default '[]'::jsonb,
  ultima_lettura timestamptz
);
create index if not exists conversazioni_updated_at_idx on public.conversazioni (updated_at desc);
alter table public.conversazioni enable row level security;
create policy "service role full access" on public.conversazioni
  using (true) with check (true);
```

> ⚡ **Aggiornato 2026-07-12:** aggiunto `ultima_lettura timestamptz` — usato per mostrare il badge "non letto" nella lista conversazioni (se l'ultimo messaggio AI è più recente di `ultima_lettura`, compare il pallino). Si aggiorna ogni volta che si apre la chat. Richiesto da Nicola 12/7.

**Opzione B — aggiungi token al VPS (poi l'AD crea la tabella da solo):**
- Aggiungi `SUPABASE_ACCESS_TOKEN` (Management API token da supabase.com/account/tokens) nel file `.env` del VPS

**Cosa cambia:** le chat vengono salvate e sincronizzate — non si perdono più a ogni ricarica.
**Se va bene:** riapri il Pannello e la chat ripartirà da dove l'hai lasciata.

- **Colore:** 🔴 (operazione DB in produzione — firma Nicola)
- **Blocco n.1** da risolvere prima di `#allegati-vercel-env` (le env var servono, ma senza tabella non basta)

---


### ✅ #allegati-vercel-env — FATTO 2026-07-13 17:28 · Nicola «ok #60» · variabili Storage su Vercel attive, upload verificato live
- **Stato:** ✅ ARCHIVIATA housekeeping 14/7

**Problema:** il Pannello non riesce a far leggere all'AD i file allegati. Il Pannello li carica su Supabase Memoria Storage, poi manda il percorso al worker. Il caricamento fallisce perché Vercel non ha le credenziali Supabase.

**Passi (2 minuti, su [vercel.com](https://vercel.com)) — firma Nicola:**
1. Vai al progetto Pannello → **Settings → Environment Variables**
2. Aggiungi `SUPABASE_URL` = `https://xjljcsorpbqwttrejqte.supabase.co`
3. Aggiungi `SUPABASE_SERVICE_KEY` = valore dalla riga `SUPABASE_SERVICE_KEY=eyJhbGci…` nel file `.env` del VPS
4. Clicca **Save** — il prossimo deploy le userà automaticamente

**Nota:** il worker VPS ha già entrambe le chiavi e sa scaricare i file — manca solo il lato Vercel.

**Cosa cambia:** il Pannello riesce a caricare file su Supabase Memoria; l'AD può leggerli e rispondere al loro contenuto.
**Se va bene:** test immediato — allega un file in chat e l'AD risponde al contenuto (no più errore).

- **Colore:** 🔴 (variabili d'ambiente in produzione — firma Nicola)

---


### 🟡 #recensioni-trigger — Attiva il messaggio "grazie + recensione" automatico dopo ogni consegna · ⏳ IN ATTESA · accodata 2026-07-11 15:50

**Template pronto:** `consegne/customer-success/2026-07-11-template-email-recensione.md`

**Situazione attuale (dati reali 14/7 02:42 — REST live ✅):**
- Ordini con `delivery_status = 'delivered'`: **0** (nessuna consegna completata)
- Recensioni in DB: **0** (tabella `reviews` e `store_reviews` entrambe vuote)
- Ordini totali: **1** — unico ordine zombie `58094956…` CANCELED 3/7 (€19,05, PQ) — **non va contattato**
- Playbook ri-verificato: `AZIONI-PRONTE` **A27** + bozze **A4/A13/A14**

**Cosa attivare:** costruire l'automazione in **n8n** (o webhook Supabase) che su cambio `delivery_status → delivered` invia l'email template via Resend, dopo 15–30 minuti. Delegare a **builder-automazioni** quando dai il via.

**Cosa cambia:** ogni cliente che riceve la spesa riceve entro 30 minuti un ringraziamento + link recensione. Non costa nulla (Resend già configurato). Genera le prime stelle sul marketplace.
**Se va bene:** le prime recensioni compaiono entro 24h dal primo ordine reale del 17/7. Stima: 1 recensione ogni 5 consegne nelle prime settimane.

- **Colore:** 🟡 (tocca Resend — email a clienti reali; l'automazione è nuova)
- **Attiva quando:** primo negozio online post-13/7, prima di accettare ordini reali

---


### ✅� #post-bts-lunedi — Pubblica "Lunedì mattina ci vado di persona" sui canali social · ⏳ chiusa · accodata 2026-07-11 15:30
- **Stato:** ✅ ARCHIVIATA housekeeping 14/7

**Contenuto completo:** `consegne/content/2026-07-11-post-del-giorno-lunedi-busso.md`

**Testo pronto (versione Gruppi Facebook — dal profilo personale del fondatore):**

> Lunedì mattina mi alzo presto, prendo la bici e giro nel centro storico di Piacenza.
>
> Busso alle saracinesche delle botteghe che voglio portare su MyCity. Di persona.
>
> Non mando una mail. Non pago un agente. Ci vado io.
>
> Perché se dico ai piacentini "la tua spesa la prepara qualcuno del centro", devo conoscere il centro anch'io. Devo sapere come si chiama il panettiere, a che ora alza la saracinesca, cosa va tenuto in fresco.
>
> Questa settimana le prime botteghe. La prossima, vi dico chi c'è.
>
> Un marketplace di Piacenza costruito a Piacenza — un negozio alla volta.
>
> *La spesa che tiene viva la città. Fai il tuo turno.*
>
> (nel 1° commento il link)

**Prima del post servono da Nicola (👁️ due minuti):**
1. **Link lista d'attesa** — incollalo qui e la macchina aggiunge il 1° commento al testo
2. **Visual** — opzione rapida: testo *"Lunedì mattina ci vado di persona."* su sfondo cotto-brand (si prepara in 5 minuti col template); oppure una foto tua in bici/piedi per il centro

**Timing suggerito:** sabato pomeriggio (oggi) o domenica mattina — finestra migliore per i gruppi FB; il lunedì 13/7 diventa "atteso".

**Cosa cambia:** primo post BTS-fondatore della serie "Il Turno" — mostra la faccia di chi costruisce il marketplace, non solo il prodotto. Angolo impossibile da copiare per Amazon.
**Se va bene:** commenti con "ci sono anch'io" + click lista d'attesa → follow-up naturale lunedì sera con "ecco le botteghe che ho incontrato" (post #5 già pianificato).

- **Colore:** 🔴 (pubblicazione su profilo personale / pagina — firma Nicola prima)
- **Canale:** Gruppi Facebook locali piacentini (profilo personale) + Instagram/Facebook Pagina MyCity

---


### 🟡 #pr-5bloccanti — PR #212: ⚠️ Manca PAT con scope mycity + rebase corretto · aggiornata 2026-07-11 04:00

**✅ Commit (2026-07-11 ~01:30):** `987b85b` — 46 file, 969 ins, 117 del. ✅ PR #212 aperta su GitHub. ✅ Rebase dal terminale VPS fatto. ⚠️ Push ha risposto "Everything up-to-date" — branch già in sync con origin PRIMA del fetch → PR ha ancora conflitti.

**Causa radice:** `GIT_PUSH_TOKEN` in `cervello/vps/.env` ha scope su `ad-mycity`, NON su `NicolaeRotaru/mycity`. Serve un PAT separato.

**⏳ Passi per chiudere — dal terminale VPS (in ordine):**

1. **Crea un nuovo PAT** su [github.com/settings/tokens](https://github.com/settings/tokens):
   - Tipo: Fine-grained · Repository: `NicolaeRotaru/mycity` · Permesso: `Contents: Read and write`

2. **Esegui sul VPS (⚠️ stash prima — ci sono modifiche non-staged che bloccano il rebase):**
```bash
cd /opt/mycity/ad-mycity/marketplace
git stash
git remote set-url origin "https://NicolaeRotaru:IL_NUOVO_PAT@github.com/NicolaeRotaru/mycity.git"
git fetch origin
git rebase origin/main
git push --force-with-lease origin fix/5-bloccanti-sicurezza
git stash pop
```

3. **Mergia la PR #212** su GitHub: [https://github.com/NicolaeRotaru/mycity/pull/212](https://github.com/NicolaeRotaru/mycity/pull/212)

**Cosa è fixato (nei commit del branch):**
1. `migrations/108+109` — RLS rider e auto-assign: anonimo non legge più dati clienti **(B2 chiuso)**
2. `app/api/seller/orders/[id]/reject/route.ts` — rifiuto venditore rimborsa Stripe automaticamente **(B4 chiuso)**
3. `migrations/110` — profilo pubblico non espone IBAN/CF/stripe_account_id **(G10 chiuso)**
4. `migrations/111` — fix migrazione 020 broken (RLS recensioni rider + 9 indici) **(G13 chiuso)**
5. `migrations/112` — wallet ripristinato su cancel/reject COD **(G4 chiuso)**
6. `migrations/113` — coupon check atomico **(G8 chiuso)**
7. `migrations/114` — newsletter double opt-in **(G17 chiuso)**
8. `migrations/115` — rimborsi incrementali scalano payout venditore **(G5 chiuso)**
9. `middleware.ts` — fail-closed senza variabili Supabase **(G11 chiuso)**
10. XSS JSON-LD: escape dati venditore **(G12 chiuso)**

**PR:** https://github.com/NicolaeRotaru/mycity/pull/212
**Cosa cambia:** 4 bloccanti + 8 gravi chiusi. Clienti protetti (GDPR, RLS), vendor rimborsati correttamente, coupon sicuri, newsletter conforme.
**Se va bene:** Nicola mergia la PR → migrazioni applicate al DB → sito sicuro.

- **Colore:** 🟡 (codice del sito → il merge lo fai tu).

---


### 🟡 #fix-35-gravi — Crea branch e scrivi i 35 fix gravi della radiografia · ⏳ IN ATTESA · accodata 2026-07-11 07:40

**Richiesta di Nicola (11/7 ~07:40):** risolvere TUTTI i 35 problemi gravi della radiografia (non solo i 5 bloccanti già in PR #212).

**⏳ Bloccante:** i comandi `git checkout` nel marketplace richiedono approvazione manuale. Approva questi due comandi dal terminale VPS:

```bash
git -C /opt/mycity/ad-mycity/marketplace checkout main
git -C /opt/mycity/ad-mycity/marketplace checkout -b fix/35-gravi-radiografia-2026-07-07
```

Poi dì **"ok #fix-35-gravi"** e scrivo tutti i 35 fix uno per uno (Write/Edit, nessuna altra approvazione necessaria per la scrittura dei file).

**Cosa cambia:** 35 problemi gravi del sito chiusi (sicurezza, pagamenti, UX, dati). Clienti e venditori più protetti, meno bug operativi.
**Se va bene:** PR aperta → Nicola mergia → migrazioni e codice in produzione.

- **Colore:** 🟡 (creazione branch + commit finale richiedono approvazione; la scrittura dei file è 🟢 immediata).

---


### ✅� #checkin-pane-quotidiano — Porta questo kit alla visita di Pane Quotidiano lunedì 13/7 · ⏳ chiusa · accodata 2026-07-11 10:40 · **aggiornato 2026-07-13 11:18**
- **Stato:** ✅ ARCHIVIATA housekeeping 14/7

> ℹ️ **Contesto:** PQ non è in churn. Nicola li conosce di persona e aspettano che la piattaforma sia pronta. La sentinella "negozio fermo" è scattata di nuovo oggi (firma `c0b240c0…`) — **cancello 🔬 confermato: falso positivo, nessuna telefonata anti-churn.** Il problema operativo resta la **vetrina scheletrica** (2/8), non l'abbandono.
>
> **Dossier stampabile aggiornato:** `consegne/account-negozi/2026-07-13-checkin-pane-quotidiano-sentinella.md`

**Health score — Pane Quotidiano (unico negozio approvato)**

| Dimensione | Stato | Note |
|---|---|---|
| Approvato sul marketplace | ✅ | Unico negozio LIVE |
| Prodotti caricati | ✅ | 258 prodotti presenti |
| Ordini ultimi 14 giorni | ⚠️ 0 | Atteso: PQ aspetta la piattaforma — non è abbandono |
| Logo negozio | ❌ manca | Da raccogliere fisicamente |
| Foto prodotti | ❌ 1+ mancanti | Da raccogliere fisicamente |
| Descrizione vetrina | ❌ manca | Da scrivere con loro (ai-copywriter dopo) |
| Indirizzo / città | ❌ manca | "Piacenza" — 1 riga da aggiungere |
| Fee consegna / min ordine | ⚠️ da verificare | Coerenti con l'operatività reale? |

**Punteggio: 2/8 — la vetrina è scheletrica.** Non blocca ora, ma abbassa la qualità percepita dai clienti del 13/7+.

---

**Kit per la visita del 13/7 — 3 cose da raccogliere di persona:**

1. 📸 **Logo** — chiedi se hanno un file (JPG/PNG) o fai una foto del cartello su sfondo neutro
2. 📸 **3–5 foto prodotti** — gli articoli più riconoscibili: banco reale o fondo bianco
3. ✍️ **Descrizione in 2 righe** — "Chi siete, cosa vendete di speciale, da quando" — bastano le loro parole, ci pensa la macchina a formattarle in copia

**Domande da fare durante la visita:**
- Avete accesso al vostro account? Riuscite a entrare?
- Avete ricevuto l'email di conferma attivazione?
- Quando volete iniziare a prendere ordini sul serio?
- Preferite che scrivo io la descrizione vetrina, o volete farlo voi?

---

**Cosa cambia:** la vetrina di PQ passa da scheletrica a completa → i clienti del 13/7+ vedono un negozio affidabile, non una pagina vuota.
**Se va bene:** Nicola torna con logo + foto + descrizione → la macchina li carica (🟢) e PQ è pronto al 100% per il primo ordine reale (obiettivo VEN 17/7).

- **Chi:** Nicola (visita fisica il 13/7)
- **Canale:** di persona — non un'email automatica
- **Colore:** 🟡 — il via di Nicola attiva la visita; i file raccolti dopo vanno in `consegne/negozi/pane-quotidiano/` e la macchina li carica.

---


### 🟡 #antichurn-13lug — Lancia il ciclo di check-in per le botteghe onboardate dopo il 13/7 · ⏳ IN ATTESA · accodata 2026-07-11 12:15

> **Scan 14/7 11:07 (REST live):** ancora **1 solo negozio approvato** (PQ) — nessuna bottega nuova online dal 13/7. Debrief visita mancante. Dettaglio: `consegne/account-negozi/2026-07-14-antichurn-playbook.md`.

> **Playbook completo:** `consegne/account-negozi/2026-07-11-playbook-antichurn-6-botteghe.md` (titolo storico — da riallineare alle botteghe core, non ristoranti/trattorie)

**Questo playbook si attiva dopo l'onboarding delle prime botteghe** — clienti MyCity = solo botteghe (Nicola 13/7 22:34).

**4 touch point per ogni bottega onboardata (colori esatti nel playbook):**

| Giorno | Trigger | Azione | Chi |
|---|---|---|---|
| **T+3** (≈ mer 16/7) | 3gg dall'onboarding | WhatsApp/tel caldo: "come va?" | Nicola |
| **T+7** (≈ dom 20/7) | 0 ordini | Chiamata check-in + ottimizzazione vetrina | Nicola |
| **T+14** (≈ dom 27/7) | < 3 ordini | Post social bottega + boost su MyCity | AD + Nicola |
| **T+45** (≈ 29/8) | Health score < 50 | Decisione: upsell / promozione / ritiro | Nicola 🔴 |

**Cosa faccio dopo il tuo "ok [#antichurn-13lug] + conferma quali botteghe hai firmato":**
1. Inserisco i contatti raccolti nel playbook
2. Preparo il messaggio WhatsApp T+3 personalizzato per ogni bottega (testo pronto, tu invii)
3. Setto le date dei touch point T+7/T+14/T+45 nel calendario (scadenzario)

**Cosa cambia:** ogni nuova bottega onboardata ha un ciclo di cura garantito nei primi 45 giorni — nessuna «si perde» in silenzio dopo l'onboarding.
**Se va bene:** primo ristorante con ≥ 5 ordini nei primi 14 giorni = segnale che il ciclo funziona → estendiamo il modello a tutte le future.

- **Chi avvia:** Nicola dopo le visite del 13/7 con "ok #antichurn-13lug + [nomi firmati]"
- **Canale:** WhatsApp/telefono diretto (Nicola) + AD prepara i testi pronti
- **Colore:** 🟡 (check-in reali con persone reali — Nicola li avvia, la macchina prepara i testi)

---


### ✅✅ #pr-270-errori-undefined — Mergia PR #270: caselle AutoCoscienza mostrano testo vero degli errori · ⏳ IN ATTESA · accodata 2026-07-11 15:39
- **Stato:** ✅ ARCHIVIATA housekeeping 14/7

**Cosa cambia:** le caselle "Errore: undefined" nel Pannello (sezione AutoCoscienza) mostrano ora il testo reale dell'errore (es. "MCP marketplace gated in sessione..."). Bug: il giro scriveva `errori` come array di stringhe, il componente cercava `.titolo` su ciascuna → undefined.

**PR:** https://github.com/NicolaeRotaru/ad-mycity/pull/270

**Cosa cambia:** il Pannello smette di mostrare caselle vuote con "Errore: undefined" — ogni errore ha il suo titolo leggibile.
**Se va bene:** Nicola mergia la PR → deploy Vercel → caselle mostrano il testo degli errori.

- **Colore:** 🟢🟢 (codice Pannello → il merge lo fai tu).

---


### ✅✅ #pr-269-chat-height — Mergia PR #269: chat delle caselle più compatta · ⏳ IN ATTESA · accodata 2026-07-11 15:37
- **Stato:** ✅ ARCHIVIATA housekeeping 14/7

**Cosa cambia:** l'area messaggi nella chat delle caselle passa da 144px (`h-36`) a 96px (`h-24`) — un terzo di spazio in meno, il campo di testo rimane dov'è. Tocca `ChatCasella.tsx` (e la componente gemella se presente).

**PR:** https://github.com/NicolaeRotaru/ad-mycity/pull/269

**Cosa cambia:** la chat è più compatta e meno invasiva nel layout della casella.
**Se va bene:** Nicola mergia la PR → deploy Vercel → chat accorciata online. Se l'altezza risultasse ancora troppa o troppo poca, basta riaprire e cambiare il valore in 30 secondi.

- **Colore:** 🟢🟢 (codice Pannello → il merge lo fai tu).

---


### ✅ #pr-255 — SUPERATA: sostituita da PR #257 · 2026-07-10 18:50
- **Stato:** ✅ ARCHIVIATA housekeeping 14/7

Branch `fix/chat-parla-casella-ux` presente su GitHub ma il commit non arrivava su `origin/main` in modo pulito. La PR #257 include gli stessi fix + la causa radice trovata (vercel.json). Non mergiare la #255.

---


### ✅ #pr-257 — MERGIATA (auto-merge): vercel.json + ParlaCasella UX · FATTO 2026-07-10 18:57
- **Stato:** ✅ ARCHIVIATA housekeeping 14/7

**Fix confermati su `origin/main`:**
1. `vercel.json`: `"deploymentEnabled": {"main": false}` → `true` — deploy Vercel sbloccati
2. `ParlaCasella.tsx`: altezza `h-36`, scroll al fondo all'apertura, nessun doppio a capo

**Nota:** PR mergiata via auto-merge (non da Nicola). I fix sono verificati su GitHub.
Vercel dovrebbe buildare a breve; il Pannello si aggiorna in 1-2 minuti dal merge.

---


### ❌ #pr-252 — ANNULLATA: sostituita dalla #255 · 2026-07-10 18:35
- **Stato:** ✅ ARCHIVIATA housekeeping 14/7

Branch non era su GitHub. Fix ripushato tramite PR #255.

---


### ✅ #trigger-build-pannello — Committa un trigger su pannello/ per forzare il build Vercel · FATTO 2026-07-11 14:48
- **Stato:** ✅ ARCHIVIATA housekeeping 14/7

**Esito:** commit `4d37c741` su `origin/main` (toccato `pannello/.build-trigger`) — approvato Nicola 11/7. Da allora ogni merge su `pannello/` ribuilda Vercel automaticamente; i commit di sola memoria non triggerano build (voluto). Card rimasta in coda per errore housekeeping — **ignorare** se il Pannello online è aggiornato. Chiusa in metabolizzazione 13/7 19:44 dopo chiarimento Nicola «cioè?».

---


### 🟡 #chip-chat-normale — Pusho il branch e apro la PR per i chip nella chat normale · ⏳ IN ATTESA · accodata 2026-07-10 18:00

I chip delle skill rapide funzionano in «Parla con questa casella» ma **mancano nella chat normale** (la chat principale che usi adesso). Il fix è già committato nel branch `fix/chat-altezza-scroll-spaziatura` — manca solo pubblicarlo.

Per sbloccarmi, aggiungi questa riga in `.claude/settings.local.json` (dopo `"Bash(git push origin feature/*:*)"`):
```json
"Bash(git push origin fix/*:*)",
```
Poi dimmi «fatto» e pusho + PR in 10 secondi.

In alternativa, pusha tu dal terminale:
```bash
cd /opt/mycity/ad-mycity && git push origin fix/chat-altezza-scroll-spaziatura
```

**Cosa cambia:** i chip (🔄 Giro, /verify, /auto-radiografia ecc.) compaiono anche nella chat normale, identici a quelli che già vedi in «Parla con questa casella».
**Se va bene:** il Pannello si deploya al merge e le due chat sono finalmente uguali.

---


### ✅ #chat-fix-1 — Pusha il branch fix/chat-altezza-scroll-spaziatura e apri la PR · FATTO 2026-07-10 18:10
- **Stato:** ✅ ARCHIVIATA housekeeping 14/7

PR #251 MERGIATA (Nicola, 10/7 ~18:15). Fix deployati su Vercel.

Fix inclusi:
- Altezza fissa finestra messaggi (`h-36`), scroll al fondo all'apertura, scroll al fondo dopo ogni risposta
- `motore-ai.sh`: in auto Claude viene scelto per primo; Cursor gira solo se `CERVELLO_MOTORE=cursor` esplicito

⚠️ `module_not_found` segnalato ancora da Nicola dopo il merge (10/7 ~23:59) → vedi azione `#worker-restart` qui sotto.

---


### ✅ #sblocca-pannello — Push trigger-build + riavvio worker (1 comando, ~20 secondi) · FATTO 2026-07-13 19:44
- **Stato:** ✅ ARCHIVIATA housekeeping 14/7

**Esito:** trigger pushato **11/7** (`4d37c741` su `origin/main`); worker riavviato più volte (ultimo confermato **13/7 19:10** post-#343). Obiettivo raggiunto — Pannello ribuilda su ogni modifica `pannello/`. Card obsoleta, chiusa in metabolizzazione 13/7 19:44.

---

## 2026-07-09 23:30 · @devops-sre → 🔴 Accendi gli allegati in chat su Vercel (variabili + Redeploy)
Il codice degli allegati (foto + file nella chat con l'AD) è pronto nel branch. Perché funzioni online servono due passi che tocco NON posso fare io (sono nella dashboard Vercel): li devi fare tu, in 5 minuti.

**Passo 1 — Metti due variabili su Vercel** (Project → Settings → Environment Variables, ambiente *Production*). Sono quelle del progetto Supabase **MEMORIA** (NON il marketplace), le stesse che hai sul VPS in `cervello/vps/.env`:
- `SUPABASE_URL` = l'URL del progetto memoria (`https://…​.supabase.co`)
- `SUPABASE_SERVICE_KEY` = la service_role key del progetto memoria (segreta, resta solo sul server)

Servono perché la route `/api/allegato` carica il file nel bucket privato `chat-allegati` con quella chiave. Il bucket si crea da solo al primo upload: nessun passo manuale sul database.

**Passo 2 — Fai il Redeploy** (Deployments → ultimo deploy → Redeploy) così Vercel builda il codice nuovo del Pannello con gli allegati.

- **Cosa cambia:** dopo questi due passi potrai allegarmi foto e PDF/documenti direttamente dalla chat, e io li leggo. Finché non li fai, il pulsante graffetta compare ma l'upload dà errore.
- **Se va bene:** provalo tu dal browser (allega una foto, mandamela) → se la vedo, è fatto; poi mergiamo il branch su `main`.
- **Colore:** 🔴 — tocca la produzione (variabili + deploy). Lo firmi/fai tu; io non entro nella dashboard.

---


### ✅ #60 — FATTO 2026-07-13 17:28 · Nicola «ok #60» · Storage allegati LIVE su Vercel (POST /api/allegato ok:true verificato)
- **Stato:** ✅ ARCHIVIATA housekeeping 14/7
**Cosa cambia:** con queste variabili la chat del Pannello inizia ad accettare **foto e file (PDF/documenti)** — li carica su Supabase Storage e li mostra in conversazione. Senza variabili + deploy, il codice c'è ma resta spento online.
**Se va bene:** provo l'upload nel browser sul Pannello vero e ti mostro che una foto e un PDF arrivano davvero, prima di dichiararlo fatto.

- **Colore:** 🔴 (tocca la produzione: dashboard Vercel + deploy online).
- **Superficie:** usi **Vercel online** → le variabili vanno in **Vercel → Progetto del Pannello → Settings → Environment Variables** (non sul VPS).
- **Passo A — variabili su Vercel** (Nicola, ~3 min): apri Settings → Environment Variables e verifica/aggiungi le chiavi Supabase del progetto **memoria** che servono allo Storage:
  - `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` (progetto memoria) — se già presenti per la chat, sono queste.
  - la chiave di **service role** lato server per scrivere nel bucket (nome esatto lo confermo quando ho pronto il branch del codice).
  - il bucket Storage dedicato (es. `chat-allegati`) creato sul progetto memoria.
  > Nota: i nomi esatti li fisso io quando finisco il codice nel branch — questa card è il segnaposto perché il passo non si perda. Non aggiungere nulla alla cieca finché non ti do la lista chiusa.
- **Passo B — deploy** (Nicola, 1 clic): dopo aver salvato le variabili, **Redeploy** dell'ultimo commit del Pannello su Vercel, così il codice foto/file va online.
- **Cosa NON faccio io:** non ho le mani sulla dashboard Vercel né sul deploy in produzione → li firmi tu. Io preparo il codice nel branch e ti do la lista esatta delle variabili.
- Traccia: [[DECISIONI]] 2026-07-09 23:11 · richiesta Nicola «aggiungi foto e file in chat».

---


### 🟡 #59 — Togli dalla macchina tutto ciò che usa le API AI a pagamento
**Cosa cambia:** spariscono i pezzi di codice che chiamerebbero API AI a consumo (generazione immagini/video/testi) — così non c'è più modo di far partire una spesa "credito AI". Sparisce anche la chiave Cursor inutilizzata dal server. L'AD continua a funzionare identico: gira già sul piano fisso Claude, non su un'API a consumo.
**Se va bene:** apro un branch con la rimozione (nessun file toccato sul ramo vivo finché non approvi il merge), poi tu revochi la chiave Cursor su cursor.com. Diventa impossibile, per costruzione, che un giro o l'autopilot brucino credito AI.

- **Colore:** 🟡 (auto-modifica del cervello → firma prima, mai da sola).
- **Cosa RIMUOVO in branch** (sono tutte "API AI a pagamento"):
  - `cervello/content-factory/ai/gemini-image.mjs`, `…/canva.mjs`, `…/ai-video.mjs` (connettori generazione a pagamento — oggi scheletri DRY-RUN dormienti, nessuna chiave).
  - `cervello/banco-ai.mjs` + `cervello/banco-ai.md` + `cervello/routing.json` (il "router" che sceglie tra Gemini/Groq/OpenAI/Whisper/ElevenLabs — ha senso solo se usi quelle API).
  - Il ramo **Cursor** in `cervello/motore-ai.sh` (`CURSOR_API_KEY` = API a consumo) → il motore resta fisso su Claude (forfait), com'è già ora.
  - Le sezioni "contenuti pro / modalità mondiale" in `CLAUDE.md` e `COMANDI.md` che promettono foto/video AI → riscritte su "solo rendering locale con template, niente API AI".
  - Aggancio in `cervello/worker.sh` al router `banco-ai` (righe AR-089).
- **Cosa NON tocco:** il motore Claude che fa vivere l'AD (è il piano fisso con cui parli ora); i publisher email/telegram/facebook (canali, non AI); Supabase/Stripe; il rendering grafico locale `content-factory/render*.mjs` (template, niente AI).
- **Cosa TENGO (consiglio):** i sensori `costo-ai.mjs` + `sentinella-budget.mjs` (+ metabolismo/letargo) — **non sono API AI**, sono la guardia-budget che questa casella chiedeva. Se li vuoi via comunque, dimmelo.
- **Azione TUA (🔴 credenziale):** revoca `CURSOR_API_KEY` su cursor.com (è viva) e toglila dal `.env` del VPS. Io dal repo non tocco il `.env` (vive solo sul server).
- **Resta valido a prescindere (non è AI):** l'autopilot deve rifiutare il LIVE su canali a pagamento (WhatsApp/SMS) senza budget-cap esplicito, e de-duplicare le voci del calendario. Lo tengo in cantiere separato.
- Traccia: [[DECISIONI]] 2026-07-08 23:40 · casella «Pre-mortem: Loop che brucia budget».


---

## 🩻 RADIOGRAFIA DELLA MACCHINA — cantiere 2/7 · PRIORITÀ
> 18/22 difetti chiusi in codice. Restano 3 cose che richiedono TE:


### ✅� R1 — REVOCA IL TOKEN GITHUB (AR-004) · azione TUA · ✅ **FATTA — Nicola ha revocato il vecchio PAT (chat 2026-07-07)** → buco AR-004 chiuso. Resta solo la verifica a occhio: il Pannello hosted mostra ancora il giro di oggi? (se cieco = Vercel condivideva il token → dargli un suo PAT read-only + Redeploy). **↺ 7/7 10:57 — verifica trasformata in doer:** ordine A→B chiarito (prima la causa PRIMA = push `origin/main` **#54/#35**, poi il token). Il fix token è ora una card discreta **#55** (condizionata: parte solo se `/api/diagnosi` «Vault GitHub» è ROSSO dopo il push). Diagnosi completa: `consegne/devops/2026-07-07-verifica-pannello-hosted-token.md`. Il check «a occhio» dei 30 s resta l'unico passo umano (URL hosted non nel repo, rete gated in sessione).
- **Stato:** ✅ ARCHIVIATA housekeeping 14/7
Il file `cervello/vps/.env.save` col PAT è stato **rimosso dal repo**, il `.gitignore` è esteso (`.env*`/`*.save`) e ora c'è un **pre-commit hook** (`.githooks/pre-commit`) che passa **ogni commit** dallo scan-segreti e lo blocca — non più solo il giro. Ma il token **è già nella storia git**: vai su GitHub → *Settings → Developer settings → PAT* e **revocalo**, poi generane uno nuovo (solo nel `.env` del VPS, mai committato). È l'unica cosa che chiude davvero il buco.
> 📄 **Runbook pronto (sequenza esatta, ~5 min):** `consegne/security/2026-07-04-R1-revoca-pat-github-runbook.md`.
> ⚠️ **Difetto trovato in questo giro (🟢, 1 comando):** su QUESTO checkout del VPS il pre-commit hook **non è agganciato** (`core.hooksPath` non impostato, manca `.git/hooks/pre-commit`). L'ho preparato ma il write di git-config aspetta il tuo ok → lancia `bash cervello/installa-hooks.sh`.

> **Decisione Nicola 2026-07-03 (Pannello):** *"Genera nuovo PAT solo nel `.env` VPS."* → nuovo PAT solo in `cervello/vps/.env` (`GIT_PUSH_TOKEN`), non condiviso con Vercel.
> ⚠️ **Trappola da rispettare nella sequenza:** oggi lo STESSO token serve anche al **Pannello su Vercel** (`GITHUB_TOKEN`, `obsidian.ts`). Se revochi e metti il nuovo solo nel VPS, il Pannello va **cieco** (non legge più `memoria-ad` né il codice per radiografia/audit). Ordine corretto: 1) genera nuovo PAT (repo ad-mycity+mycity, Contents R/W + PR R/W) → VPS `.env`; 2) dai a Vercel un suo valore in `GITHUB_TOKEN` (consigliato: 2° PAT **read-only** = least-privilege, oppure lo stesso nuovo PAT); 3) **solo allora REVOCA il vecchio** su GitHub. Tutto 🔴, solo Nicola.


### R2 — Merge + deploy dei fix del cantiere · ✅ **FATTO 2026-07-07 13:35 — Nicola: «l'ho fatto»** → `git push origin main` eseguito: i 20 fix del cantiere (PR #212) sono **canonici su `origin/main`** + la memoria pubblicata nello **stesso push** (chiude anche #54). **Non verificato dal VPS in sessione** (fetch/push gated) → prova del nove a video = il Pannello hosted mostra i fix + il giro di oggi; se in `/api/diagnosi` la voce «Vault GitHub» è **ROSSA** → card token **#55**. Il testo storico sotto è **superato**.
- **Stato:** ✅ ARCHIVIATA housekeeping 14/7
> ⛔ **[SUPERATO 7/7 13:35 — vedi header] Tentativo di esecuzione 2026-07-04 15:22 — BLOCCATO (nessun merge fatto).** Motivo: **non esiste nessuna PR da mergiare.** `github-merge`/`git-merge.mjs` mergia solo una PR già aperta (la recupera via API GitHub) — non la crea. Strada A: branch `claude/machine-analysis-ez7g3e` **assente dai ref locali** (morta). Strada B: creare branch→push→aprire PR→merge, ma **rete/git-push chiusi in questa sessione** (`git ls-remote`, esecuzione `node`, `printenv` tutti negati). `main` ora è **459 commit** dietro `memoria-ad` (non più 116). ➡️ Resta ⏳: serve una sessione con **rete + git push aperti** (VPS/cloud-agent) per creare e mergiare la PR Strada B. Nessun dato inventato, niente ✅ FATTO finché il merge non avviene davvero.
I fix di codice del cantiere (timeout giro AR-005, gate sensori anti-invenzione, guardiano agenti, `sensore-cassa`, `allocazione-check` AR-006, **pre-commit hook segreti AR-004**, gate HACCP) vanno resi **canonici in `main`**.
> 🔎 **Scoperta di questo giro (cambia la premessa):** i fix **NON sono inerti** — sono già committati e **ATTIVI su `memoria-ad`**, il branch da cui gira il VPS (`giro.sh` li richiama davvero). Il problema vero è che **`main` è indietro di ~116 commit / ~150 file**: alla prossima avanzata di `main`, `aggiorna-cervello.sh` (righe 122-124, propaga le cancellazioni) **cancellerebbe da `memoria-ad` i file-fix assenti da main → romperebbe `giro.sh`**. Quindi R2 = **mettere in salvo i fix** rendendoli canonici, non "accenderli".
> ⚠️ **Mina:** non spingere in `main` l'oggetto tracciato `marketplace` (copia locale del repo mycity, va escluso). `.mcp.json` è pulito.
> 📄 **Runbook pronto (Strada A branch scoped / Strada B code-only, verifica + rollback):** `consegne/devops/2026-07-04-R2-merge-deploy-cantiere-runbook.md`.
> 🔗 **Coordina con #33** (no-path-cablati, stesso cantiere, mid-giro) e **#34/R1** (usa il PAT nuovo se R1 fatto prima). Deploy = **automatico** via `watch-main.timer` (~5 min, riavvia il worker): nessun `systemctl` a mano.


### ✅ R3 — Ripuntare i contenuti su Pane Quotidiano (AR-006) · CHIUSO 2026-07-14 01:00
- **Stato:** ✅ ARCHIVIATA housekeeping 14/7
**Correzione di rotta:** Casa Linda era una **demo**, non un negozio. L'**unico negozio reale** su MyCity è **Pane Quotidiano** (contratto firmato 1/7). **Fix completato:** cancello allocazione attivo; **12** pacchetti Garetti archiviati; sforzo attivo su PQ (**16** contenuti); merge **PR #349** 13/7 21:44; **AR-006 chiuso** in cantiere su ordine Nicola «chiudi AR-006» (14/7 01:00); `allocazione-check` exit 0 (14/7 00:59). **Resta fuori da R3 (azioni separate):** foto/consenso/link CTA PQ; primo ordine payout-test; pubblicazioni PQ chiusa firma.


### 🩻 R4 — Firma 6 fix di salute della macchina (radiografia Opus del 7/7) · ⏳ SERVE FIRMA
> La radiografia profonda del 7/7 ha trovato **74 difetti macchina**: 34 già chiusi in codice, 6 merge pendenti, **1 aperto-davvero già risolto oggi** (AR-030, checklist rigenerata) e **6 bloccanti che aspettano la tua firma** — sono auto-modifiche, per regola non le applico da sola. In ordine di **impatto sulla crescita**:
> 1. 🟡 **Il contatore dei costi AI è cieco** (AR-043) — registra ~882 token per un giro da 20 min (sottostima ~1000×): non possiamo decidere niente su costo/valore finché mente. Fix: leggere l'usage reale del motore (`--output-format json`).
> 2. 🟡 **Il volano non misura mai gli esiti** (AR-040/041/042) — 18 previsioni loggate ma 0 entrano nel punteggio (schema incompatibile) e nessun codice apre un esperimento: autonomia reparti ferma a 0 da sempre. Fix: ponte previsto→misura obbligatorio nel giro.
> 3. 🟡 **Il giro può pubblicare il proprio codice senza firma** (AR-044) — `git add -A` mette in produzione anche eventuali auto-modifiche del motore. Fix: guardiano-integrità che blocca il push se tocca codice fuori dalla memoria.
> 4. 🟡 **Pannello: "approva/ignora" risponde ok anche se il salvataggio fallisce** (AR-034) — con le azioni reali accese = rischio doppio invio. Fix: rollback della card + chiave di idempotenza (da chiudere insieme al claim atomico worker).
> 5. 🟡 **Checklist di Nicola — la radice** (AR-030) — il sintomo è risolto (rigenerata oggi), ma senza un guardiano che la rigeneri dalla coda a ogni report della sera torna stantia. Fix: (a) freschezza nel giro, oppure (b) far derivare la checklist dal parser della coda nel Pannello (elimina la copia).
> Dettaglio e causa-radice di ciascuno: `MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json` (AR-030, AR-034, AR-040→044). **Cosa cambia:** finché non firmi, il termometro-salute resta gated (voto pieno 0, provvisorio 55) e il volano-business non misura un solo esito. **Se va bene:** con le firme la macchina inizia a misurare il proprio costo e i propri risultati, e non può più modificarsi di nascosto.

---

> 🟢 **Scorciatoia lancio:** le righe **1-2** (le 3 decisioni 🔴 di lancio) sono consolidate in
> un **foglio-firma da 2 minuti** → `consegne/decisioni/2026-06-26-foglio-firma-lancio.md`. Firma lì.

## Coda
> ✍️ **Il titolo (colonna `Azione`) è il testo grosso della card:** scrivilo come lo diresti a voce, con un verbo
> e una cosa vera, **senza codici/sigle/ID/path** — quelli vanno in `Contenuto`, per chi esegue. Metro: la lettera
> a Nicola. Regola completa: `cervello/scrittura-umana.md`.
> Le ultime 2 colonne (**Cosa cambia · Se va bene**) sono la spiegazione che compare nella card del Pannello:
> scrivile in parole semplici per Nicola. Sono opzionali — se vuote, il Pannello mette un testo per-reparto.

>
> ⚠️ **Impatto sistema (AR-081 · pre-mortem cross-silo):** se una mossa di reparto rischia di **brucia margine**
> o **intasa operations** (spillover su altri silos), segnalalo in "Cosa cambia" con `⚠️ impatto sistema: …`.
> È la forcing-function della visione olistica (AD-VETTORI-SISTEMA): una vittoria di reparto non deve costare all'azienda.
| # | Data e ora | Reparto | Azione (pronta) | Colore | Contenuto | Canale | Stato | Cosa cambia | Se va bene |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 2026-06-25 10:09 | vendite→legale | Termini commerciali **Pane Quotidiano**: commissione **12%**, **0€ costi fissi**, **payout a consegna**, **nessun vincolo** | 🔴 | `consegne/legale/contratto-pane-quotidiano-bozza.md` | firma col negozio (dopo validazione legale) | ✅ **FIRMATA** Nicola 1/7 01:02 · contratto creato · firma negozio 🔴 | Pane Quotidiano accetta 12% e 0€ fissi: può ricevere ordini veri e MyCity incassa commissione sul primo incasso. | Contratto firmato col negozio → onboarding payout + ordine zombie €19,05. |
| 2 | 2026-06-25 10:09 | finanza | Payout-test Stripe / flusso pagamenti | 🔴 | consegne/finanza/payout-faro.md | **Nicola esegue 03/07 mattina — ACCORPATO a #16** | ✅ **PROGRAMMATO** Nicola 1/7 01:02 · Stripe **sandbox** (decisione #3) · **⚠️ ri-ancorato 6/7: #16 è ANNULLATO**, non è più il caso-test → il payout-test va fatto sul **1° ordine reale nuovo** (o in sandbox pura senza ordine), non su #16 | Quando nasce la prima transazione reale, quella fa da payout-test: incasso riconciliato vs ordine (sandbox → nessuna carta). | Flusso validato su caso vero → si può passare a LIVE o replicare su nuovi ordini. |
| 3 | 2026-06-25 10:09 | customer-success | Via libera a inviare i **messaggi/telefonate ai clienti reali** del primo ordine (testi pronti) | 🟡 | consegne/customer-success/primo-ordine-faro.md | manuale (poi email/n8n) | ✅ approvato Pannello 30/6 09:08 · in coda | Partono i contatti veri al primo cliente (messaggio + telefonata di feedback): è la cura concierge che evita la "brutta prima esperienza". | Il primo cliente è seguito a mano, il problema viene intercettato prima del reclamo e si chiede la prima recensione. |
| 4 | 2026-06-24 10:43 | tech | Fix checkout (tab bar mobile copriva "Conferma ordine") | 🔴 | PR #199 | — | ✅ MERGED |  |  |
| 5 | 2026-06-24 10:43 | frontend-dev | Gruppo 1 audit-design (conversione & messaggi) | 🔴 | PR #200 | — | ✅ MERGED |  |  |
| 6 | 2026-06-26 23:05 | content-social | Pubblicare post storia-bottega Garetti "La saracinesca" su **IG + FB** (FB: link nel 1° commento). Serve il **LINK reale lista d'attesa** da Nicola | 🔴 | consegne/content/POST-storia-bottega-garetti-saracinesca.md + creativi/output/social/storia-bottega-garetti-saracinesca.png | IG + FB (manuale, poi n8n) | ⏸️ **CONGELATO** (AR-006) — Garetti è prospect non firmato: pubblicazione pesante bloccata dal cancello di allocazione finché non firma; il contenuto resta come bozza-template | Nessuna pubblicazione intestata a un negozio che non incassa: si evita di bruciare sforzo su un'ipotesi. | Quando Garetti firma (diventa `confermato`) si scongela in 1 minuto; nel frattempo lo sforzo va su Pane Quotidiano. |
| 7 | 2026-06-27 02:10 | content-social | Pubblicare "I TRE VENERDÌ" (post+storia IG/FB + post gruppo locale) **nelle sere dei Venerdì Piacentini rimasti: 3, 10, 17 lug**. FB: link nel 1° commento. **FINESTRA REALE che si chiude il 17/7** → serve LINK lista d'attesa + ok lancio | 🔴 | consegne/content/GARETTI-kit-L7.md | IG + FB + gruppi FB locali (manuale, poi n8n) | ⏸️ **RIMANDATO** Nicola 1/7 (priorità negozi 6/7; VP 3/7 saltato) | I 3 post escono nelle sere dei Venerdì Piacentini (3/10/17 lug), quando il centro è pieno: cavalchi l'evento. Finestra reale che si chiude il 17/7. | Picco di iscritti agganciato all'evento; poi "Bottega × Evento" può diventare una rubrica fissa. |
| 8 | 2026-06-27 02:10 | content-social→relazioni-istituzionali/pr-stampa | Contattare **organizzatori Venerdì Piacentini / pagine "Sei di Piacenza se…"** per ricondivisione DI VALORE (mini-storia bottega del centro, non spam) durante la finestra | 🔴 | consegne/content/GARETTI-kit-L7.md §3B | DM/email a pagine locali | ⏸️ **RIMANDATO** Nicola 1/7 (priorità negozi 6/7; VP 3/7 saltato) | Pagine e organizzatori locali ricondividono la mini-storia della bottega: portata gratis verso un pubblico già piacentino. | MyCity entra nelle conversazioni locali senza spendere, con la credibilità di chi ti ripubblica. |
| 9 | 2026-06-27 02:10 | content-social (proposta L7) | Rendere **"Bottega × Evento" rubrica fissa** (format-motore che aggancia ogni evento del centro PC a una bottega). Serve calendario eventi PC da @intelligence + consensi-bottega | 🔴 | consegne/content/GARETTI-kit-L7.md §7 | decisione strategica Nicola | ✅ approvato Pannello 30/6 09:08 · in coda | Si decide se trasformare "Bottega × Evento" in una rubrica fissa (ogni evento del centro agganciato a una bottega). | Diventa un format-motore che sforna contenuti rilevanti a ogni evento, quasi in automatico. |
| 10 | 2026-06-28 20:25 | AD/Tech | **Wiring Vercel della memoria**: impostare `SUPABASE_URL=https://xjljcsorpbqwttrejqte.supabase.co` + `SUPABASE_SERVICE_KEY=<service_role del progetto memoria>` nelle env del Pannello + **Redeploy** | 🟡 | la service key la prendi da Supabase → progetto ad-mycity → Settings → API | Vercel (manuale, lato Nicola) | ❌ rifiutato Pannello 30/6 09:08 | Il Pannello inizia a leggere/scrivere la memoria nel DB giusto: la spia "Memoria collegata" diventa verde e i briefing compaiono nella card "Cosa ho scoperto". | Ogni giro si accumula da solo nella Cabina, senza che io riscriva file a mano. |
| 11 | 2026-06-28 20:25 | designer→vendite | **Kit QR "Venerdì Piacentini"**: vetrofania + cartoncino-cassa con QR "ordina e te lo portiamo" per le botteghe aperte nelle sere del 3/10/17 lug (presidio offline, NON delivery in ZTL) | 🟡 | da produrre in creativi/output/ (brief @designer) — serve il LINK reale lista d'attesa | stampa + consegna a mano alle botteghe (manuale) | ⏸️ **RIMANDATO** Nicola 1/7 (priorità negozi 6/7) | Davanti a 50-60k persone/sera in centro, le botteghe espongono un QR che porta i clienti su MyCity: acquisizione a costo ≈0. Serve il link reale della lista d'attesa. | Primi iscritti agganciati all'evento più grande della città; il presidio diventa ripetibile ogni venerdì. |
| 12 | 2026-06-29 11:30 | vendite→legale-privacy | **Kit "Bando ER + MyCity"** per onboarding negozi: one-pager con preventivo MyCity intestabile + descrizione spesa ammissibile + mini-guida Sfinge + disclaimer "mai promettere l'esito". **⚠️ Giro web 1/7 01:29:** bando FESR Commercio ER **chiuso 23/6** (tet domande) — rivedere leva e scadenze prima del pitch; non citare 40% fondo perduto finché kit non aggiornato | 🟡 | da produrre in consegne/vendite/ (@vendite + @legale-privacy) | di persona + email ai lead | ✅ approvato Pannello 30/6 09:08 · **⚠️ da rivedere** post-giro web 1/7 | Kit bando va aggiornato: lo sportello FESR Commercio non accetta più domande dal 23/6. | Dopo revisione @relazioni-istituzionali + @legale: kit corretto o pivot su prossimo bando ER/Comune. |
| 13 | 2026-07-01 02:17 | tech→security | **Sprint 1 radiografia marketplace** — branch fix 4 bloccanti pre-live: (1) webhook Stripe rollback se insert fallisce (2) fee €3/consegna/negozio in UI checkout (3) RLS profiles → view pubblica (4) COD rollback se order_items fallisce | 🟡 | `consegne/audit/2026-07-01-radiografia.md` § Sprint 1 · `consegne/tech/sprint-1-radiografia-marketplace.md` · patch `consegne/tech/sprint-1-radiografia-marketplace.patch` · branch `fix/sprint-1-radiografia-2026-07-01` commit `03d66e6` | branch marketplace (no deploy) | ✅ **DEPLOY CODICE 1/7 ~10:31** Render auto da #209+#210 · fee UI + `seller_public_profiles` in prod · **⏳ migrazione 107 policy** (DROP policy — 1 SQL Nicola) · AD senza `MARKETPLACE_SUPABASE_WRITE_KEY` | Il checkout mostra il prezzo vero, non perde ordini Stripe/COD e non espone IBAN/KYC negozi: prerequisito sicuro prima del batch negozi 6/7. | Dopo SQL 107 → smoke COD + carta test → batch 6/7 sicuro. |
| 14 | 2026-07-01 07:41 | devops | **Token GitHub write su `NicolaeRotaru/mycity`** — estendere `GIT_PUSH_TOKEN` (fine-grained) con *Contents: Read and write* su repo **mycity** **oppure** aggiungere `MARKETPLACE_GIT_TOKEN` in `cervello/vps/.env` | 🟡 | `cervello/vps/.env.example` · oggi PAT scrive solo su `ad-mycity` | GitHub PAT + env VPS | ⏳ **SBLOCCATO 2/7 12:35** — Nicola ha creato `github_push_token` (mycity+ad-mycity, Contents+PR R/W); basta incollarlo in `GIT_PUSH_TOKEN` (VPS `.env`) 🔴 | L'AD può pushare branch e aprire PR sul marketplace senza passare da te ogni volta. | Nicola incolla il token → push marketplace testato (chiude 403 Sprint 1). |
| 15 | 2026-07-01 10:22 | devops→AD | **Token GitHub merge (`GITHUB_MERGE_TOKEN`)** — PAT fine-grained su **`ad-mycity` + `mycity`**: *Contents* + *Pull requests: Read and write* · incolla in `cervello/vps/.env` (può coincidere con `GIT_PUSH_TOKEN` / `MARKETPLACE_GIT_TOKEN` se stesso PAT) · guida: chat AD 1/7 10:45 + `cervello/vps/.env.example` | 🟡 | Nicola: «impara flusso merge-on-approval» · istruzioni PAT consegnate 10:45 | GitHub PAT + env VPS + `systemctl restart mycity-worker` | ⏳ **SBLOCCATO 2/7 12:35** — coincide con `github_push_token` (stesso PAT, ha già Pull requests R/W); basta il valore in `GIT_PUSH_TOKEN` | Dopo il tuo ok esplicito l'AD mergia la PR su GitHub al posto tuo — niente browser. Vercel redeploya il Pannello; opzionale sync VPS. | Card «Merge PR #N?» nel Pannello + un click «Ok merge» chiude il loop deploy 🟡. Deploy prod marketplace resta 🔴 separato. |
| 16 | 2026-07-01 11:05 (agg. 2026-07-04 09:31) | operations→supporto | **Eseguire Scelta A ordine zombie €19,05 — Pane Quotidiano** · approvato **`ok 16`** Pannello **2/7 08:38** · **decisione binaria 2/7 17:09 = Scelta A (esegui, non archivia)** · **#20 WhatsApp FATTO** (4/7 04:51) · **PROPOSTA APPROVATA 4/7 09:31: consegna STASERA cena 19–21** · **ri-approvata 4/7 09:58** (card precedente "stamattina 3/7", `proposta:esegui-16-stamattina-3-7-tap-whatsapp-20-21-22-c` → **registrata, non riproporre**; stesso mandato, slot serale confermato) → resta accettazione ordine + consegna, accorpata al payout-test #2 | 🔴 | `consegne/operations/2026-07-02-esecuzione-ok16-pranzo.md` | dashboard + consegna COD (manuale) | ❌ **DECADUTA — Nicola/Pannello 2026-07-06 16:15**: l'ordine #16 risulta **ANNULLATO** nel DB (`delivery_status=CANCELED`, alert Pannello «1 consegne annullate»). La macchina lo dava «in consegna» perché l'MCP era cieco. **Non c'è consegna da eseguire** — lo zombie €19,05 del 24/6 non si riesuma. Il 1° ordine reale va CREATO ex-novo. Cadono con questa anche #21 e #22 e la cascata gated su «#16 consegnato». | — | Il primo ordine reale va fatto NASCERE (domanda vera su PQ), poi consegna + payout-test su quel caso. |
| 20 | 2026-07-02 08:38 (chiuso 2026-07-04 04:51) | operations→supporto | **#16.1 WhatsApp buyer 348 642 1766** — messaggio + richiesta indirizzo reale (placeholder in DB) · link wa.me in pacchetto ok16 §PASSO 1 | 🔴 | `consegne/operations/2026-07-02-esecuzione-ok16-pranzo.md` § PASSO 1 | WhatsApp (Nicola) | ✅ **FATTO** (storico) — WhatsApp inviato il 4/7 04:51. **Nota 6/7:** l'ordine #16 è poi risultato **ANNULLATO** (CANCELED) → il contatto non ha prodotto un ordine reale; #21/#22 decadute. | — | — |
| 21 | 2026-07-02 08:38 (slot serale 2026-07-04 09:31) | operations | **Accetta l'ordine e chiama il fornaio Pane Quotidiano per confermarlo** — stasera verso le 19 | 🔴 | `consegne/operations/2026-07-02-esecuzione-ok16-pranzo.md` § PASSO 2 · in dashboard «Accetta» l'ordine `58094956…` · tel. negozio 0523 388601 · script A6 in AZIONI-PRONTE | dashboard + telefono (Nicola) | ❌ **DECADUTA — 2026-07-06 16:15**: segue #16, ordine ANNULLATO (CANCELED) → non c'è ordine da accettare. | — | — |
| 22 | 2026-07-02 08:38 (slot serale 2026-07-04 09:31) | operations→customer-success | **Ritira dal fornaio, consegna e incassa €19,05 in contanti, poi segna «Consegnato»** — finestra 19–21 | 🔴 | `consegne/operations/2026-07-02-esecuzione-ok16-pranzo.md` § PASSO 3–4 · ritiro Pane Quotidiano in Via Calzolai 25 → consegna all'indirizzo del buyer → «Consegnato» in app → poi A13 feedback + A14 recensione | consegna manuale + app (Nicola) | ❌ **DECADUTA — 2026-07-06 16:15**: segue #16, ordine ANNULLATO (CANCELED) → niente ritiro/consegna. La 1ª transazione end-to-end va fatta su un ordine reale nuovo. | — | — |
| 17 | 2026-07-01 20:02 | devops | **Attiva sync VPS automatico** — 1 comando root sul VPS (Nicola «ok configura sync VPS» + **«ok 17»** 20:18): `sudo bash /opt/mycity/ad-mycity/cervello/vps/install-sync-vps.sh` | 🟡 | `cervello/vps/install-sync-vps.sh` · `mycity-sync-vps.sudoers` | Console Hetzner root (1×) | ⏳ **Nicola ok 17** · install **bloccato** (mycity senza sudo) · handler `sync-vps` ✅ in `worker.sh` · **resta 1× root** Console Hetzner | Dopo ogni merge su `main` l'AD allinea il worker da solo — non devi più lanciare `aggiorna-cervello.sh` a mano. | Post-merge: dici «ok merge …» → merge GitHub → Vercel redeploy → VPS si aggiorna in automatico (~30s). |

> 📋 I **4 gruppi rimasti** (2 errori-vuoti · 3 contrasto · 4 brand+layout · 5 immagini/PWA) sono nel piano [[PIANO-FIX-DESIGN]] — eseguibili uno alla volta con *"sistema il gruppo N dell'audit design"*.

| 18 | 2026-07-02 07:09 | @tech | Porta online le modifiche del Pannello (approva il merge della PR #131) | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/131 · merge ad-mycity → main | github | ✅ ARCHIVIATA housekeeping 14/7 | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 19 | 2026-07-02 07:35 | tech | **Deploy fix ruoli acquisto** — admin bloccato, seller solo via «Vai al marketplace» (modalità cookie) | 🔴 | `consegne/tech/2026-07-02-ruoli-acquisto-admin-seller.md` · PR **#211** merged `f84fc70` · smoke `consegne/qa/2026-07-02-smoke-ruoli-acquisto-post-19.md` | Render (marketplace) | ✅ **MERGED** Nicola **`ok merge fix ruoli-acquisto`** 2/7 08:40 · Render auto-deploy ~2–5 min · @qa smoke post-deploy | Gli account assistenza non possono più creare carrelli/ordini test; i venditori non finiscono sul catalogo per errore — solo se cliccano il pulsante dedicato. | CRM pulito (1 solo carrello buyer reale); meno confusione ruoli in onboarding 6/7. |
| 23 | 2026-07-03 02:50 (agg. 2026-07-04 11:56) | AD/data-engineer | **Il sensore che misura le vendite del sito (PostHog) è spento da 24 giri: serve la chiave giusta** — quella di lettura, la generi dal tuo account PostHog | 🟡 | `cervello/vps/.env:27` (sostituisci il valore) · verificatore `cervello/verifica-sensori.mjs:158` · diagnosi: sulla riga 27 c'è una **Project Key** `phc_…` (solo scrittura eventi) → l'endpoint di lettura dà 401. Serve una **Personal API Key** `phx_` (PostHog → Settings → Personal API keys → Create, scope Project:read; verifica `POSTHOG_HOST` EU/US). ⚠️ Il codice legge `POSTHOG_API_KEY` per prima: **sostituisci il valore sulla riga 27** con la `phx_`, non aggiungere una seconda variabile (resterebbe ignorata). Il Pannello usa un'altra chiave client-side: nessun impatto | env VPS (sostituisci riga 27 + `systemctl restart mycity-worker`) | ✅ ARCHIVIATA housekeeping 14/7 | Il sensore funnel/conversione torna a vedere: al prossimo giro il contatore giri-ciechi si azzera e la sentinella 🧠 si spegne. Finché è cieco: nessun numero PostHog scritto come fatto. | Sensore verde → possiamo misurare conversione/eventi del marketplace, non solo i 7 numeri Supabase. |
| 25 | 2026-07-03 11:26 (agg. 2026-07-04 11:52) | account-negozi | **Telefonata di 2 minuti al fornaio Pane Quotidiano per non farlo mollare** — agganciata alla chiamata dell'ordine (#21); l'unico negozio reale aspetta da ~10 giorni | 🟡 | `MyCity-Vault/90-Memoria-AI/AZIONI-PRONTE.md` **A6** (check-in) + **A7** (upsell 🟢 post-consegna) · registro `consegne/account-negozi/2026-07-04-playbook-anti-churn.md` · stessa telefonata 0523 388601, +2 min, poi follow-up dopo la consegna. Rischio qui = primo ordine fermo da ~243h (peggiorato +24h vs 3/7) → «qui non vendo». Non duplica #16/#21: è lo strato-relazione | telefono (rider su #21) | ✅ ARCHIVIATA housekeeping 14/7 | — | — |
| 27 | 2026-07-03 11:40 (ri-verif. 2026-07-09 11:30) | customer-success | **Chiedi la prima recensione al cliente dopo la consegna del primo ordine** — prima un messaggio di feedback, poi (solo se è contento) la recensione | 🔴 (bozze 🟢) | [[AZIONI-PRONTE]] **A13** feedback (+3h da «Consegnato») → se 👍 **A14** richiesta recensione (+1g) · modello neutro **A4** · testo pieno `consegne/customer-success/2026-07-01-playbook-recensioni.md` · parte quando il 1° ordine reale è «Consegnato» (oggi 0 consegne complete nel marketplace → nessuno da sollecitare). Coperto dalla firma #3; non duplica #22 | WhatsApp 348 642 1766 (+ email/in-app) | ✅ ARCHIVIATA housekeeping 14/7 | Il primo cliente reale viene seguito post-consegna: prima intercettiamo eventuali problemi, poi (solo se contento) chiediamo la recensione. | Prima recensione verificata di MyCity a Piacenza → social proof sulla scheda del faro + aggancio a #26 (carrello samir) per il 2° acquisto. |
| 24 | 2026-07-03 02:57 | account-negozi/AD | **Zittisci un falso allarme: la macchina segnala «negozio fermo» su Casa Linda, che è solo una demo** — bastano 3 righe di codice, con la tua firma | 🟡 | `consegne/account-negozi/2026-07-03-negozio-fermo-casalinda-falso-positivo.md` (patch dentro) · `cervello/sentinella-dati.mjs:185-188` · il sensore `negozio_fermo` conta anche i negozi demo/seed (UUID `11111111…`): vanno esclusi così scatta solo sui negozi VERI fermi da 14g. Fix (dopo riga 187): `const SEED_DEMO = /^11111111-1111-1111-1111-/i;` + `.filter((v) => !SEED_DEMO.test(v.id))`. Auto-modifica → firma tua, non applicata da sola | commit branch `memoria-ad` (no deploy) | ✅ ARCHIVIATA housekeeping 14/7 | La sentinella «negozio fermo» smette di svegliare la macchina su un negozio inesistente: scatterà solo su negozi REALI fermi da 14g (oggi: nessuno). | Coda pulita + zero rischio di contattare un negozio demo quando colleghiamo le «mani». |
| 26 | 2026-07-03 11:40 (ri-verif. 2026-07-04 11:47) | crm-lifecycle | **Riporta indietro il cliente che ha lasciato un carrello da €10** (samir: 3 prodotti bio Pane Quotidiano, fermo dal 16/6) — parte dopo che ha ricevuto il primo ordine | 🟡 | `consegne/crm/2026-07-03-recupero-carrelli-pronte.md` · playbook `consegne/crm/2026-07-01-playbook-recupero-carrelli.md` · carrello `57494b3e…`, unico carrello buyer reale. Bozze pronte: Touch #1 promemoria senza sconto 🟡 · Touch #2 col codice `BENVENUTO10` 🔴 (solo se #1 non converte). Parte SOLO dopo #16 consegnato (stesso cliente). Gli altri 3 carrelli abbandonati sono admin/seller/demo → SKIP | Email (Resend, spento) — manuale finché mani off | ✅ ARCHIVIATA housekeeping 14/7 | L'unico cliente reale riceve un promemoria caldo del carrello da €10 dopo aver ricevuto il primo ordine: un secondo acquisto invece del silenzio. | Se torna: primo cliente con 2 ordini → base per riordino/referral; se muto dopo Touch #2, si archivia. |
| 37 | 2026-07-06 14:32 | crm-lifecycle | **Accendi il "porta un amico" e manda il primo invito** — 5€ al cliente + 5€ all'amico quando l'amico ordina e riceve | 🔴 | `consegne/crm/2026-07-06-playbook-referral.md` · testi in [[AZIONI-PRONTE]] **A17** · il loop è GIÀ nel codice (referrals mig.015, premio €5 su consegna mig.089, welcome €5 mig.029, no self-referral mig.092, pagina `/profile/referral` live). Costo reale incrementale ≈€5 per cliente nuovo con ordine ricevuto. Anti-frode già attiva (premio solo su CONSEGNATO, no auto-invito) | Email/WhatsApp (Resend spento) + pagina invito nel sito | 🅿️ **RIMANDATA da Nicola 2026-07-09 12:12: si riparla del referral DOPO che inserisce il primo negozio** (inserimento previsto 13/7, di persona). Gate precedente resta valido a valle: 1° ordine reale consegnato + cliente contento (A13 👍) + mani Resend accese. Fino ad allora fuori dalle card "da approvare". | Si accende il referral e parte il primo invito a samir dopo che riceve #16: se porta un vicino che ordina, 5€ a lui e 5€ all'amico. Il canale di crescita più economico che abbiamo (CAC ≈€5). | Un cliente ne porta un altro senza spesa pubblicitaria → primo motore organico; poi si aggiungono i tetti anti-frode (🟡) prima di scalare. |
| 39 | 2026-07-06 15:40 | vendite→onboarding | **Chiama le botteghe food per farle entrare su MyCity** — parte la campagna di prospecting sulle botteghe food del centro (panetterie, macellerie, gastronomie). Copione, ordine di chiamata e obiezioni sono pronti; la demo forte è "c'è già Pane Quotidiano online in centro". ⛔ Leva bando ER: CHIUSO il 23/6/2026 (limite 350 domande raggiunto — non più disponibile). Pitch alternativo: retail piacentino −6,6% Q2 + caldo 40°C il 15-17/7 = urgenza reale senza scadenza artificiale. Chi dice sì → handoff a @onboarding-negozi (vetrina <48h). **Lista: 10 botteghe verificate dal DB pronte + 17 da completare con un giro dati live** (query pronta nel file). | 🟡 | `consegne/vendite/2026-07-06-lista-27-botteghe-food-da-chiamare.md` (scheda chiamate + copione) · kit `consegne/vendite/kit-bando-er-mycity.md` | Telefono (numeri da recuperare Maps/visita) · poi email/WhatsApp | ✅ ARCHIVIATA housekeeping 14/7 | Il motore vendite si riaccende sulle prime 10 botteghe food reali del centro: ogni "sì" è un negozio nuovo che può incassare, e il bando ER (scade 21/7) dà un motivo per rispondere adesso. | Prima bottega che dice sì → onboarding done-for-you <48h → secondo negozio reale su MyCity dopo Pane Quotidiano; poi si scala alle altre della lista. |
| 28 | 2026-07-03 19:46 | AD/Tech→DevOps | **Merge + deploy PR #167 — fix lettura vault del Pannello** (memoria-ad→main auto-guarente in sola lettura + ramo servito osservabile in `/api/stato` + parsing briefing tollerante). Toglie la causa radice del «Pannello non vede tutti i dati di GitHub». | 🟡 merge / 🔴 deploy | branch `claude/github-obsidian-vault-integration-cl02mq` · **PR #167** · `pannello/src/lib/obsidian.ts` · `pannello/src/app/api/stato/route.ts` · `pannello/.env.example` | GitHub merge + Vercel redeploy | ⏳ **PRONTO** · `tsc`+`next build` verdi · **deploy Vercel bloccato oggi** dal limite free «api-deployments-free-per-day» (>100/die) → si sblocca ~24h | Il Pannello smette di mostrare schermate vuote quando la memoria è su un ramo disallineato, e segnala da quale ramo sta leggendo (spia di deriva). | «ok merge 28» → merge PR #167; quando il limite Vercel si sblocca (o su piano Pro) il redeploy porta il fix in produzione. |
| 29 | 2026-07-04 00:20 | account-negozi | **Rassicura il titolare di Pane Quotidiano mentre l'ordine è ancora fermo** — telefonata standalone di 2 min: ci prendiamo noi la colpa del ritardo, gli diciamo che è stato scelto come primo negozio. **Parte SOLO se #16 slitta ancora**; se l'ordine si chiude → salta A9 e vai a A6/A7. **Non duplica A6** (A6 = relazione sulla chiamata #21; A9 = tocco che parte se #21 non parte). Playbook anti-churn: 0 negozi con trend −X% (1 solo negozio reale nel marketplace), churn qui = **time-to-first-value** (0 incassi da ~230h). | 🔴 (bozza 🟢) | `MyCity-Vault/90-Memoria-AI/AZIONI-PRONTE.md` **A9** · `consegne/account-negozi/2026-07-04-anti-churn-standalone-pane-quotidiano.md` | Telefono 0523 388601 · backup WhatsApp/in-app | ✅ ARCHIVIATA housekeeping 14/7 | — | — |
| 30 | 2026-07-04 04:31 | content-social | **Pubblica il post del sabato di Pane Quotidiano** — "È sabato: fai il tuo turno, la spesa dalle botteghe del centro da casa, senza ZTL". Angolo utilità/weekend agganciato a "Il Turno", **complementare** alla storia-bottega di ieri (A8): quella racconta il negozio, questo spinge l'azione del sabato + iscrizione lista. Sul faro reale (Pane Quotidiano, `confermato`); Garetti resta congelato (AR-006). Gate onestà passato: solo "bio dal 1976" (fonte pubblica), 0 numeri finti, 0 testimonianze. | 🔴 (bozza 🟢 fatta) | `consegne/content/2026-07-04-POST-turno-del-sabato-PQ.md` · anteprima [[AZIONI-PRONTE]] **A15** | IG feed @mycity.piacenza + storia 9:16 + gruppi FB locali | ✅ ARCHIVIATA housekeeping 14/7 | Esce il post del sabato del negozio reale su MyCity: spinta di iscrizioni nel weekend, a costo ≈0, ripubblicabile dal negozio; complementa il ritratto di ieri senza duplicarlo. | Il negozio ripubblica ai suoi clienti → primi iscritti caldi alla lista; si consolida il ritmo settimanale del motore "Volti/Il Turno". |
| 32 | 2026-07-04 05:23 · **↺ ri-approvata dal Pannello 2026-07-08 22:40** | AD/security→frontend-dev→qa | **Chiudere l'ultimo blocco di sicurezza del sito prima delle 6 botteghe (SQL 107 / RLS `profiles`)** — proposta approvata oggi dal Pannello. **⚠️ SCOPE CORRETTO 8/7 (cancello 🔬):** NON è "1 comando SQL" come scritto l'1/7 — la verifica di oggi ha trovato **~34 embed raw `profiles!...fkey` ancora nel codice client** → 107 nuda chiude il leak IBAN/KYC **ma spegne insieme vetrina, ordini e RITIRO RIDER** (con `!inner` i prodotti spariscono dalla ricerca). Chiusura sicura = **deploy coordinato SQL+codice**: (1) 🟡 branch `fix/107-embed-migration-2026-07-08` che migra i ~34 embed vetrina allo helper `seller_public_profiles` (helper già in produzione; **branch NON producibile in sessione 8/7: git/npx su `marketplace/` negati dal sandbox** → spec pronto nel dossier, si costruisce al giro VPS o con Bash aperto); (2) 🔴 anteprima+smoke (scheda prodotto, ordine, ritiro rider, ricerca, COD); (3) 🔴 deploy branch **+** SQL 107 nella stessa finestra (mai SQL prima del codice); (4) 🔴 verifica RLS (anon → `stripe_account_id/billing_iban` = 403). **Firma già data** (2/7 «eseguilo tu, io approvo», ri-confermata 4/7 e oggi dal Pannello); **non serve altra firma**. Blocco unico = **la mano**: MCP write `execute_sql`/`apply_migration` **ancora negato in sessione** (ri-provato oggi) + branch da deployare su Render. **Fuori scope** (follow-up blocco 110/GDPR): embed che leggono `full_name` di controparti rider/buyer/reviewer — 107 non li rompe. | 🟡+🔴 | dossier `consegne/security/2026-07-08-chiusura-blocco-107-profiles.md` · patch `consegne/tech/2026-07-08-107-embed-migration.patch` *(da generare quando la mano è aperta)* · smoke `consegne/qa/2026-07-04-verifica-rls-smoke-checkout.sh` · runbook `consegne/tech/2026-07-04-sql-107-drop-policy-runbook.md` · fonte `marketplace/migrations/107_seller_public_profiles.sql` | **Sblocco = la mano:** (A) concedi `mcp__supabase-marketplace__apply_migration`/`execute_sql` in sessione live + deploy branch su Render → l'AD applica SQL+verifica+smoke · (B) giro sul VPS con rete+creds che esegue SQL e smoke; il branch codice va comunque mergiato/deployato prima o insieme | ⏳ in attesa — **AD-owned, firmato, bloccato solo sulla mano** (branch pronto + grant tool/giro VPS) | Chiunque senza login smette di poter leggere IBAN/KYC/Stripe dei negozi, la vetrina resta viva (view) e il ritiro rider non si rompe: prerequisito di sicurezza del batch 6/7 chiuso in modo sicuro, non un DROP che spegne il sito. | Deploy coordinato → anon non legge più i dati sensibili (403), vetrina/ordini/ritiro-rider funzionano dalla view, smoke COD passa → via libera al batch 6/7 del 13/7. |
| 31 | 2026-07-04 05:10 | qa | **Prova in prod i blocchi di ruolo sugli acquisti** — verifica che dopo #19 l'admin NON possa comprare (403 sugli ordini) e che il negoziante venga rimandato alla sua area. Lo script è pronto (`bash consegne/qa/smoke-ruoli-post19.sh`): la parte anonima gira da sola, la matrice completa serve un login da admin, negoziante e cliente (bastano i loro cookie). Serve solo dare il via / girarlo dal VPS dove la rete è aperta. | 🟡 | `consegne/qa/2026-07-04-smoke-ruoli-acquisto-post19.md` · script `consegne/qa/smoke-ruoli-post19.sh` | curl in sola lettura verso `mycity-marketplace.com` (nessun ordine creato) | ✅ ARCHIVIATA housekeeping 14/7 | Confermiamo dal vivo che nessun admin può creare ordini e che i negozianti restano nella loro area: il guard di #19 è davvero attivo in produzione, non solo nel codice. | Se tutto verde → via libera al recupero carrello samir (coda #26); se rosso → fix urgente a backend/frontend e stop alle comunicazioni d'acquisto. |

| 34 | 2026-07-04 09:40 | security→AD | **Revoca il token GitHub compromesso e sostituiscilo** (AR-004 · proposta R1 approvata dal Pannello) — un vecchio PAT è già entrato nella storia git: l'unico modo di chiudere il buco è revocarlo su GitHub. **Ordine anti-blackout (5 min):** 1) genera un nuovo PAT (repo ad-mycity+mycity, Contents R/W + PR R/W) → incollalo in `cervello/vps/.env` (`GIT_PUSH_TOKEN`, `chmod 600`, mai committato); 2) dai a Vercel un valore per `GITHUB_TOKEN` (consigliato: 2° PAT read-only, oppure lo stesso nuovo); redeploy Pannello; 3) **SOLO ORA** revoca il vecchio su GitHub; 4) verifica push VPS + Pannello. Runbook con i passi esatti pronto. | 🔴 | `consegne/security/2026-07-04-R1-revoca-pat-github-runbook.md` | GitHub (revoca+genera) + env VPS + Vercel — mani di Nicola | ✅ **FATTA — Nicola ha revocato il vecchio PAT (chat 2026-07-07)**: buco AR-004 chiuso, il segreto nella storia git è ora carta straccia. Resta solo verifica a occhio del Pannello hosted (se cieco → Vercel condivideva il token, dargli un suo PAT read-only + Redeploy). Storicamente **RI-APPROVATA dal Pannello 2026-07-04 15:33** («Revoca il vecchio token GitHub (R1)», rosso), **aspetta solo le tue mani su GitHub/Vercel/VPS** (io non tocco token/env reali 🔴). Runbook anti-blackout pronto e ri-verificato.<br>⛔ **Comando Pannello «esegui il merge» 2026-07-04 15:24 — NON eseguibile come `github-merge` (nessun merge fatto):** #34 **non è una PR** ma una **revoca+rotazione di PAT**; `github-merge` mergia solo una PR già aperta e **non esiste alcun numero PR** (né inventabile). L'AD non tocca token/env reali (🔴) né inventa PR (🔬) → resta ⏳ finché non ci metti le mani. | Il segreto già finito nella storia git diventa carta straccia: nessuno che clona il repo può più usarlo per entrare su GitHub. La difesa anti-ricaduta (gitignore + hook + scan) è già in piedi. | Vecchio PAT morto + nuovo attivo su VPS e Vercel → buco AR-004 chiuso davvero, cantiere radiografia da 2/3 a 1/3 residuo (restano R2 merge/deploy e R3). |
| 36 | 2026-07-04 12:10 | content-social | **Pubblica il post di Sant'Antonino di Pane Quotidiano** — "Oggi Piacenza festeggia sé stessa: una città si tiene viva quando qualcuno alza la saracinesca". Cavalca il momento unico di OGGI (Sant'Antonino, patrono di Piacenza — fiera, centro pieno, snapshot reale [[STATO]] 4/7), agganciato a "Il Turno". **Non duplica A8/A15** (storia-bottega / sabato): angolo nuovo, a scadenza di giornata. Sul faro reale (Pane Quotidiano, `confermato`); Garetti congelato (AR-006). Gate onestà passato: Sant'Antonino il 4/7 e "bio dal 1976" = fatti pubblici, 0 numeri finti, 0 testimonianze, festa citata con rispetto. Ghigliottina "poteva farlo Amazon?" → no. | 🔴 (bozza 🟢 fatta) | `consegne/content/2026-07-04-POST-santantonino-PQ.md` · anteprima [[AZIONI-PRONTE]] **A16** | IG feed @mycity.piacenza + storia 9:16 + gruppi FB locali | ✅ ARCHIVIATA housekeeping 14/7 | MyCity si fa vedere nel giorno di massima attenzione locale associando il negozio reale alla festa della città: reach nel picco di oggi + primi iscritti caldi, a costo ≈0, ripubblicabile dal negozio. | Il negozio ripubblica ai suoi clienti → iscritti caldi alla lista nel giorno-picco; si consolida il ritmo del motore "Volti/Il Turno". |
| 35 | 2026-07-04 09:50 | AD/DevOps-SRE | **Metti in salvo i fix della macchina rendendoli canonici in `main`** (R2 · ✅ **RI-APPROVATA dal Pannello 2026-07-07**: «Metti in salvo i fix della macchina nel ramo principale», rosso). **AGGIORNAMENTO 2026-07-07 10:40 — l'azione si è SEMPLIFICATA a un fast-forward push.** Il mondo del 4/7 (fix su `memoria-ad`, main ~116 indietro, riconciliazione Strada A/B via PR) è superato: con il RAMO UNICO `main` applicato, i 20 fix del cantiere (timeout giro AR-005, sicurezza worker AR-026/027/028, allocazione AR-031, verifica-sensori AR-035, claim atomico AR-037, pausa fail-closed AR-038, AR-039, gate sensori anti-invenzione, guardiano agenti, sensore-cassa, hook segreti AR-004, gate HACCP) sono **già dentro `main` locale del VPS** (merge **PR #212**). Resta solo **pubblicarli su `origin/main`** (indietro di **1831 commit**) — il ramo letto da Pannello hosted e da watch-main. **Comando unico non-force:** `cd /opt/mycity/ad-mycity && git pull --rebase origin main && git push origin main` (committa prima le scritture di memoria pendenti). ⚠️ **È lo STESSO push di #54** (la memoria): un solo `git push origin main` chiude entrambe (AR-008, niente doppioni). | 🔴 | `consegne/devops/2026-07-07-R2-metti-in-salvo-fix-verifica.md` (supera il runbook del 04-07) | git push su `origin/main` — sessione VPS con rete aperta, oppure «ok 35» / il giro VPS lo fa da sé | ✅ **FATTA — Nicola: «l'ho fatto» (2026-07-07)**: il `git push origin main` è stato eseguito → i 20 fix (PR #212) sono canonici su `origin/main` e la memoria di oggi (#54) è pubblicata nello stesso push. **#35 e #54 chiuse insieme.** ⚠️ **Non verificato dal VPS in questa sessione** (fetch/ls-remote verso GitHub sono gated qui, la punta locale `origin/main` è ancora ferma al 27/6 finché non si fa fetch): **prova del nove a video = il Pannello hosted mostra i fix + il giro di oggi**; se dopo il push `/api/diagnosi` «Vault GitHub» è ROSSO → parte la card token #55 (Vercel condivideva il PAT revocato). **Verifiche di sicurezza fatte 07/07 10:40 (VPS):** ✅ `git merge-base --is-ancestor origin/main main` → `origin/main` è **antenato** di `main` = **fast-forward pulito, niente `--force`** · ✅ divergenza **1831 avanti / 0 dietro** (solo avanti) · ✅ `marketplace` **assente dal tree di `main`** (`git cat-file -p HEAD^{tree}` → niente landmine, non trascina la copia codice) · ✅ i fix sono in `main` (grafo PR #212). Rollback = `git revert` mirato (FF puro, storia non riscritta). | I 20 fix del cervello dell'AD smettono di vivere solo nel `main` **locale** non pushato — dove un allineamento futuro da `origin/main` (indietro) li spazzerebbe via rompendo `giro.sh`/i guardiani: diventano canonici in `origin/main`. Nello stesso push va live anche la memoria del giro (Pannello hosted allineato). | Push → Vercel ripubblica il Pannello hosted (vede subito i fix + il giro) e `watch-main` riallinea il VPS in ~5 min riavviando il worker coi guardiani attivi; cantiere radiografia protetto, #35 e #54 chiuse insieme. |
| 33 | 2026-07-04 08:40 | AD/DevOps | **Togli il path Windows dai due workflow di radiografia** — resta cablato `return 'C:\Users\InfinitaPossibilita\mycity-live'` in `.claude/workflows/radiografia.js:46` e `audit-design.js:46`. La fonte di verità (`cervello/marketplace-repo.mjs`) è **già ripulita** e c'è un **guardiano anti-ricaduta** (`cervello/no-path-cablati-check.mjs`, gira a ogni giro). Questi 2 file l'harness li marca "file sensibili" e blocca ogni scrittura senza il tuo ok. Modifica identica in entrambi: sostituire il blocco `const local = join(adRoot,'marketplace'); if(existsSync(local)) return local; return 'C:\\...'` con **`return join(adRoot, 'marketplace')`** (fallback cross-platform). Sblocco = **approva l'Edit** in una sessione live, oppure girala dal VPS. | 🟡 | `.claude/workflows/radiografia.js:41-47` · `.claude/workflows/audit-design.js:41-47` · guardiano `cervello/no-path-cablati-check.mjs` | approva Edit sui 2 file sensibili (o giro VPS) | ✅ ARCHIVIATA housekeeping 14/7 | Le due radiografie del sito smettono per sempre di dipendere da una cartella del vecchio PC Windows: girano ovunque (VPS, cloud) leggendo `MARKETPLACE_REPO` o `marketplace/`. | Guardiano verde a ogni giro → l'errore non può più rientrare; radiografia/audit-design portabili al 100%. |
| 40 | 2026-07-06 16:52 | devops-sre→AD | **Controlla che la sentinella veda gli ordini annullati al prossimo giro** — il codice è pronto (la sentinella ora legge lo stato di annullamento e alza un allarme sui nuovi ordini cancellati); resta solo confermare che sul VPS giri davvero al primo tick e non ripeta l'allarme sul vecchio ordine di test. | 🟡 (accendere il timer = 🔴) | codice `cervello/sentinella-dati.mjs` (regola A7 «ordine annullato», watermark `ultimo_annullo_visto` su `canceled_at`) · doc `cervello/sentinelle.md` · timer `mycity-sentinella-dati.timer` sul VPS (attivarlo se spento = `sudo bash cervello/vps/install-ritmo-timers.sh`, 🔴) | giro/tick sul VPS (o dry-run `node cervello/sentinella-dati.mjs`) | ✅ ARCHIVIATA housekeeping 14/7 | La macchina smette di essere cieca sugli ordini annullati: un ordine cancellato scatta un allarme (con la causa e, se pagato, la proposta di rimborso da firmare) invece di restare invisibile fino a quando apri il Pannello. | Al 1° giro live: 0 falsi allarmi sull'ordine di test (24/6, watermark), e un annullamento vero futuro sveglia subito operations. |
| 41 | 2026-07-06 11:11 | @onboarding-negozi/@finanza | Fai un primo ordine di prova su Pane Quotidiano e attiva il payout-test | 🔴 | Il vecchio ordine #16 (`58094956…`, COD €19,05) risulta ANNULLATO dal 3/7 15:38 nel DB → è morto, non si consegna più. Serve un ordine-prova pulito su PQ (seller `c0b240c0…`, Via Calzolai 25, tel 0523 388601) da chiudere per intero: accetta → consegna → payout-test. `consegne/finanza/payout-faro.md` | manuale + dashboard PQ | in attesa | Porti la North Star da 0 a 1 su un negozio reale e verifichi che i soldi arrivino davvero al negozio (payout), cosa mai successa finora. | Il ciclo end-to-end è validato una volta: da lì si replica su ogni nuovo negozio della shortlist. |
| 42 | 2026-07-06 12:21 | @crm-lifecycle | Tieni pronta l'email che riporta indietro chi si ferma: parte da sola quando un cliente resta due settimane senza riordinare — oggi non c'è ancora nessuno da riattivare | 🟡→🔴 | Pacchetto ARMATO (dry-run, 0 invii): `consegne/crm/2026-07-06-win-back-pronte.md`. **Segmento dormienti reali = 0 oggi** (0 ordini completati nel DB → nessuno da riattivare; fonte MCP Supabase 6/7 11:11 + STATO). Sequenza pronta: mail #1 "ci manchi" a **€0** (🟡) → mail #2 con **consegna offerta cap ~€4** oppure codice **SPED5** (gratis sopra €25, già in DB) 1×/cliente (🔴) → telefonata per chi avrà ≥2 ordini. **Incentivo entro budget €0: nessun coupon nuovo, `BENVENUTO10` escluso.** Trigger: primo ordine PQ consegnato (#21) + 14 gg fermo. samir escluso (già in recupero carrelli, AR-008). 4 gate chiusi: dormiente reale, consenso marketing, mani Resend, firma incentivo | email (Resend, mani spente) | ⏸ armato — nessun invio | Appena un cliente reale smette di ordinare per due settimane, riceve da solo l'invito a tornare; se serve, la seconda mail gli offre la consegna (max ~4€, una volta sola). Oggi non parte niente: nessun cliente ha ancora completato un ordine. | Quando arrivano i primi clienti veri non li perdiamo in silenzio: il flusso li recupera da solo a costo quasi zero e misuriamo quanti tornano (holdout per il dato incrementale). |
| 43 | 2026-07-06 12:40 | @vendite | Dal 9/7 aggiungi al giro chiamate le 3 botteghe della spesa fresca che mancano nel centro | 🔴 | Scout categorie mancanti nel cluster (oggi solo Pane Quotidiano; la shortlist è tutta ristorazione). 3 target `scelta_ragionata` su fatti pubblici (prospect, non nel DB): **Ortofrutta** → Peretti Frutta e Verdura, Via Alberici · **Salumeria/DOP** → Antica Salumeria Garetti, Piazza Duomo 44 (già #1) · **Formaggi/gastronomia** → Caseificio Amendolara, Via Trento 7. Pitch pronti + condizioni (12%/0€ fissi/payout a consegna) e agganci (⛔ bando ER CHIUSO il 23/6; argomento alternativo: caldo 40°C + retail −6,6%): `consegne/vendite/2026-07-06-scout-negozi-categorie-mancanti.md` · dettaglio esteso A18 in [[AZIONI-PRONTE]] | telefono/di persona (manuale) | ✅ ARCHIVIATA housekeeping 14/7 | La pipeline mira alle botteghe che completano il carrello-spesa (frutta, salumi, formaggi) attorno al faro, invece di inseguire pizza/sushi dove Glovo/JustEat già competono. | Anche 1-2 sì e MyCity diventa "la spesa completa del centro" — offerta unica in città e fine del rischio "un solo negozio reale". |
| 44 | 2026-07-06 12:51 | @growth-monetizzazione | Accendi la fedeltà di rete: punti spendibili in tutti i negozi MyCity | 🔴 | Programma *MyCity Punti* pronto (meccanica + economia + comunicazione): 1 punto ogni €1 speso, 1 punto = €0,02 (cashback 2%), spendibili su TUTTA la rete, soglia riscatto 100 punti = €2, tetto 30–50% del carrello, scadenza 12 mesi. **Il montepremi lo paga il margine MyCity, non il negozio.** ⚠️ impatto sistema: erode il margine (2/12 ≈ 17% delle commissioni) → @finanza fissa il % con l'incrementale (holdout) PRIMA. Meccanica completa: `consegne/growth/2026-07-06-playbook-fedelta-di-rete.md` (Parte A) · dettaglio A19 in [[AZIONI-PRONTE]]. **ARMATO dietro gate di scala:** parte solo a ≥5 negozi reali + ordini reali avviati (oggi 1 negozio, 0 transazioni) — niente rete = niente dove spendere i punti. | config banner + account cliente (codice) + email (Resend, spente) | ⏸ armato — nessun lancio | I clienti guadagnano un vantaggio spendibile in tutti i negozi del centro: è il moat locale che Amazon non copia. Oggi non parte: manca la rete (1 solo negozio). | Quando ci sono ≥5 negozi la fedeltà è già scritta e firmabile: alza frequenza e scontrino, misurata con holdout per il dato incrementale. |
| 45 | 2026-07-06 12:51 | @growth-monetizzazione→@legale-privacy/@contabilita | Vendi le Gift Card MyCity: incasso anticipato che gira nei negozi del centro | 🔴 | Gift card digitali €10/€25/€50 spendibili su tutta la rete. **Incasso subito, paghi il negozio solo al riscatto** → cassa positiva upfront senza debito. Non-usato dopo scadenza = breakage (ricavo). **Prima di vendere serve:** parere @legale-privacy + @contabilita su IVA (buono MULTIUSO, art. 6-ter DPR 633/72 → IVA all'utilizzo) + registro passività `giftcard_liability` + anti-frode @trust-safety. Mani: Stripe write (oggi sola lettura) + generatore codici (@builder). Meccanica: `consegne/growth/2026-07-06-playbook-fedelta-di-rete.md` (Parte B) · dettaglio A20 in [[AZIONI-PRONTE]]. **ARMATO:** nessuna vendita finché Stripe write non è collegato e il parere fiscale non è dato. | pagina marketplace + Stripe (spente) | ⏸ armato — nessuna vendita | Entrano soldi veri oggi (incasso anticipato) che poi girano nelle botteghe reali; "Regala Piacenza" invece di un buono Amazon. Serve prima il sì fiscale e la mano Stripe. | Carburante di cassa senza debito + un prodotto-regalo che porta clienti nuovi nella rete (welfare aziendale locale B2B). |
| 46 | 2026-07-06 13:23 | @content-social | Pubblica il post di oggi "Il Lunedì della Bottega" di Pane Quotidiano su Instagram e Facebook | 🔴 | Post del giorno pronto (rubrica settimanale nuova, #1): testo + storia + versione gruppi FB in `consegne/content/2026-07-06-POST-lunedi-della-bottega-PQ.md`. Angolo: oggi 34° a Piacenza (fonte iLMeteo/3BMeteo) → la spesa fresca/bio di Pane Quotidiano (Via Calzolai, bio dal 1976) arriva a casa al fresco del mattino. Visual **tipografico neutro** = pubblicabile con sola firma (nessuna foto/consenso); versione col prodotto solo con ok titolare (aggancio #26). **Serve il LINK reale della lista d'attesa** (UTM `lunedi_bottega`) nel 1° commento su FB / in bio su IG. Gate onestà passato: 0 numeri finti, 0 testimonianze, CTA = lista d'attesa (non "ordina ora", il flusso non è ancora provato). | IG + FB + gruppi FB locali (manuale, poi n8n) — mattina | ⏸️ PARCHEGGIATA (Nicola 2026-07-09) — **gate: pubblicare SOLO dopo che il primo negozio è dentro MyCity** (onboarding botteghe food previsto 13/7). Motivo: mandare gente sul marketplace prima che ci sia una bottega evadibile brucia i primi iscritti caldi. La rubrica "Il Lunedì della Bottega" riparte dal primo lunedì utile a bottega online; l'angolo-meteo (34°) era legato al 6/7 → il #1 va riscritto con l'hook del giorno di ripartenza. Coerente con AR-006 (sforzo pesante dove c'è un negozio che può incassare). | Esce il post del giorno sull'unico negozio reale, con un hook vero e nasce un appuntamento fisso del lunedì: i clienti del centro scoprono che i freschi bio arrivano a casa. Serve il link reale della lista d'attesa. | Primi iscritti caldi via UTM a costo ≈0; se la rubrica attecchisce diventa un format-motore settimanale. |
| 47 | 2026-07-06 13:05 | @seo→@frontend-dev/@tech | Completa la scheda schema.org dei negozi e correggi l'indirizzo web che Google non vede | 🟡 | Patch in un branch del repo marketplace, test SEO come cancello (`tests/e2e/06-seo-and-a11y.spec.ts`), mai deploy senza firma. 4 interventi su `app/store/[id]/page.tsx`: ① bug URL canonico (`window.location.href` → undefined lato server, il crawler non lo vede) da costruire server-side · ② aggiungere `openingHoursSpecification` (serve orari reali PQ) · ③ `@type` da generico `Store` a `GroceryStore`/`HealthFoodStore` · ④ `Product`/`Offer` sulle schede prodotto + `BreadcrumbList` sulla categoria. Spec: `consegne/seo/2026-07-06-playbook-seo-locale-PQ.md` (§3) · dettaglio A22 in [[AZIONI-PRONTE]]. | branch → anteprima → merge | ✅ ARCHIVIATA housekeeping 14/7 | Lo schema.org di ogni negozio (da PQ in poi) esce completo e leggibile dai motori: telefono, indirizzo, orari, tipo corretto, prodotti con prezzo. Migliora come MyCity appare su Google/Maps. Serve: orari reali PQ + firma al merge. | Base tecnica SEO solida e riusabile per OGNI negozio futuro — si scrive una volta e vale per tutta la rete. |
| 48 | 2026-07-06 13:26 | @designer→@vendite | Stampa e posa il kit fisico del negozio (QR in cassa, vetrofania in vetrina, sacchetti) — parte quando il primo negozio sa evadere | 🔴 | Playbook Capillarità: `consegne/vendite/2026-07-06-playbook-capillarita.md`. **Template neutri riusabili PRODOTTI (🟢, gratis):** `creativi/output/kit-capillarita/` (vetrofania neutra, cartoncino QR A5 cassa, adesivo tondo Ø10, sacchetti 18×22 e 26×32) + istanza intestata PQ `creativi/output/capillarita/vetrofania-pane-quotidiano.svg`. **Cosa firma questa riga:** ① preventivo tipografia locale (cartoncini + vetrofanie su adesivo statico + sacchetti kraft 1 colore terracotta) e ② posa fisica in Pane Quotidiano. **Gate — NON stampare prima:** PQ dev'essere di nuovo evadibile (ordine-prova #21 chiuso: accetta→consegna→payout-test) — coerente con anti-churn #26 e carrello #27; mandare gente in vetrina prima brucia la prima impressione. Prima della stampa serve l'**URL pieno pagina PQ** (o ok a leggerlo dal DB: seller `c0b240c0…`, pattern `/store/{id}/pane-quotidiano`) per il QR reale. Aggancio risparmio: bando «Vita in Centro» rimborsa ≤50% dei materiali (A1). | tipografia locale (preventivo→stampa) + posa a mano in negozio | ⏸ pronto — gated su PQ evadibile (#21) | Il primo negozio reale esce dal go-live con QR in cassa + vetrofania in vetrina + sacchetti brandizzati: ogni consegna e ogni vetrina diventano un cartellone che porta clienti su MyCity, a costo di sola stampa (dimezzabile col bando). ⚠️ impatto sistema: nessuno finché è 1 negozio; scala solo con ≥3 negozi evadibili. | Il kit di PQ è il «primo esemplare»: dal 9/7, per ogni nuovo negozio firmato bastano 2 minuti per istanziare il template e stampare — la capillarità diventa ripetibile. |
| 49 | 2026-07-06 13:26 | @vendite→@relazioni-istituzionali | Semina i punti QR in città (partner di quartiere, banchetti eventi, bacheche) — quando ci sono almeno 3 negozi che consegnano | 🔴 | Playbook Capillarità §"Punti di presenza" (`consegne/vendite/2026-07-06-playbook-capillarita.md`). Adesivo tondo neutro pronto in `creativi/output/kit-capillarita/qr-adesivo-tondo.svg`. Punti: bar/edicole/associazioni (consenso di ogni partner, via @relazioni-istituzionali con Vita in Centro), banchetti/negozi aperti ai **Venerdì Piacentini (17/7 ultima data)**, locandine su bacheche/Comune. **Gate di scala (AR-081):** parte con **≥3 negozi reali evadibili** — oggi 1 (PQ, non ancora evadibile): riempire la città di QR verso un marketplace con un solo negozio fermo brucia la prima impressione. Ogni QR punta al marketplace con UTM per misurare i punti che rendono. | posa a mano + DM/email ai partner (manuale) | ⏸ armato — gated su ≥3 negozi | La città si riempie di punti QR verso MyCity a costo ≈0 (vetrine e casse altrui come cartelloni): acquisizione capillare nel centro. Oggi non parte: manca la rete. | Con ≥3 negozi la mappa dei punti è già scritta e firmabile; si misura con UTM quali punti portano iscritti veri e si raddoppia su quelli. |
| 50 | 2026-07-06 13:52 | @account-negozi→@analista | Regala al fornaio il report che solo noi possiamo dargli: cosa vende di più, quando ordinano, chi torna | 🔴 | Playbook **Dati-come-servizio** pronto (stampo + query SOLA LETTURA riusabili per ogni negozio): `consegne/account-negozi/2026-07-06-playbook-dati-come-servizio.md`. **Onestà (cancello 🔬):** oggi il report è VUOTO di transato — 0 ordini consegnati su PQ → «cosa vende di più / orari di punta / clienti di ritorno» non è calcolabile ancora, e 0 clienti di ritorno per definizione (fonte MCP 6/7 11:11). Il dato reale che esiste è solo: 5 prodotti attivi + 1 composizione-carrello osservata (pesto+2 kefir bio, €10, buyer samir). **Gate:** il primo report REALE si genera e si consegna appena PQ chiude il primo ordine vero (aggancio #21); prima non c'è niente da mostrare. Poi diventa tocco di retention mensile (aggancio anti-churn #26) e, a ≥5 negozi, tier premium a pagamento (owner @growth-monetizzazione). | report generato dai dati + consegna al titolare (email/telefono, manuale) | ⏸ stampo pronto — gated su #21 (primo ordine PQ) | Il fornaio riceve ogni mese un mini-report con dati che dal banco non può vedere (venduto online, orari della domanda a domicilio, clienti che tornano): un motivo concreto per restare su MyCity. Oggi non parte: servono prima ordini veri. | Diventa un'arma di retention riusabile per ogni negozio e, a scala, un servizio dati da vendere (ricavo ricorrente che non tocca la commissione). |
| 51 | 2026-07-06 14:20 | @trust-safety→@frontend-dev/@backend-dev | Fai in modo che il badge «Verificato» appaia solo ai negozi che lo meritano davvero, non a tutti | 🟡 | **Difetto verificato nel codice del sito (6/7):** il badge "Negozio verificato da MyCity" (`components/ui/VerifiedBadge.tsx`) è reso **senza condizione** in 4 punti su 5 — `StoreListRow.tsx:44`, `StorePreviewCard.tsx:76`, `home/HeroStoreCard.tsx:137 e 235` — mentre solo `store-sections/HeroSection.tsx:167` lo condiziona (a `is_approved`). Risultato: nelle liste/card/home OGNI negozio (anche la demo Casa Linda) risulta "verificato" → badge decorativo, non guadagnato. **Fix (branch, reversibile):** un predicato unico `lib/store-trust.ts::isVerifiedStore(profile)` = approvato + Stripe `charges_enabled` + `payouts_enabled`, applicato a tutti e 5 i punti + un test-cancello anti-regressione. Spec pronta: `consegne/trust-safety/2026-07-06-gate-codice-badge-verificato.md`. Il livello di badge pubblico (Identità Verificata vs Verificato completo) lo fissa lo standard. | branch → anteprima → merge | ⏸️ PARCHEGGIATA — Nicola 7/7 «forse più avanti» (chat): non parte ora, spec non scade. **Non re-flaggare urgente nei giri intermedi**; ripescare all'onboarding dei negozi reali (6 botteghe priorità dal 13/7). Vedi DECISIONI 00:28 + [[badge-verificato-parcheggiato]] | Il badge di fiducia smette di comparire su chiunque: appare solo ai negozi che hanno superato la verifica e possono davvero incassare/pagare. Un negozio finto non può più risultare "verificato". | Il badge diventa un vero segnale di fiducia (leva di conversione onesta, stile Etsy/Stripe) e regge per ogni negozio futuro senza intervento manuale. |
| 52 | 2026-07-06 14:45 | @relazioni-istituzionali | Manda le due mail per far entrare MyCity nell'Hub Urbano del centro: una all'Ufficio Commercio del Comune, una all'Unione Commercianti | 🔴 | Testi pronti + destinatari reali verificati oggi in `consegne/relazioni-istituzionali/2026-07-06-playbook-bandi-mail-istituzioni.md`. **Mail #1** → Ufficio Commercio Comune di Piacenza (margherita.maini@comune.piacenza.it · 0523 492212; PEC SUAP suap@cert.comune.piacenza.it): propone MyCity come servizio digitale condiviso dell'Hub. **Mail #2** → Unione Commercianti PC, capofila del partenariato Hub (direzione@unionecommerciantipc.it · 0523 461852): apre i negozi soci in blocco. Leva comune: **Bando Commercio ER** (fondo perduto fino a €50.000, sportello **aperto fino al 21/7/2026 ore 13:00**, ri-verificato oggi — fonte Regione ER) → i negozi lo usano per pagarsi l'onboarding. **Serve da Nicola prima dell'invio:** firma reale (telefono/email/sito MyCity, oggi segnaposto) + conferma di citare **Pane Quotidiano** come esempio (unico negozio reale, NON Garetti/Casa Linda, AR-006). Mai promettere l'esito del bando. | email (Comune) + email (Unione Commercianti) — manuale | ⏸️ PARCHEGGIATA (Nicola 2026-07-09 11:45) — **gate: inviare SOLO dopo che la prima bottega è dentro MyCity** (onboarding botteghe food previsto 13/7). Motivo: presentarsi al tavolo Hub con un negozio reale attivo, non con la sola demo. ⚠️ Bando Commercio ER scade **21/7 ore 13:00**: se il primo negozio entra dopo il ~18/7 la leva-bando si accorcia — riproporre a Nicola l'invio appena la bottega è online. | MyCity entra nel tavolo pubblico-privato del centro storico come alleato dell'Hub, non concorrente: due porte (Comune amministrativo + Unione che apre i negozi), un solo racconto. L'aggancio al bando 21/7 dà urgenza vera. | Incontro di 20 min → pilota su 3-5 negozi soci del centro, ciascuno agganciato al Bando Commercio; poi @vendite fa l'onboarding done-for-you con la copertura di fiducia delle istituzioni. |
| 53 | 2026-07-06 20:22 | AD/devops-sre | **Sposta la lettura del Pannello sul binario giusto: due impostazioni da cambiare (Vercel e VPS)** | 🟡 | Oggi il cervello sul VPS scrive la memoria su un ramo (`memoria-ad`) e i giri cloud su un altro (`main`): il Pannello legge il primo e non vede il secondo — è il «pannello non legge da main». Questa riconciliazione ha già riunito la memoria su `main`; restano 2 mani tue: ① Vercel → Settings → Environment Variables: `OBSIDIAN_BRANCH=main` (tieni `OBSIDIAN_BRANCH_FALLBACK=memoria-ad` per la transizione) + Redeploy; ② VPS → `cervello/vps/.env`: `GIT_BRANCH=main`, poi `sudo bash cervello/vps/aggiorna-cervello.sh`. ③ Dopo le due mani dimmi «riconcilia il residuo»: riporto su `main` le scritture arrivate su `memoria-ad` nel frattempo e il vecchio ramo va in pensione (backup già fatto: `backup/memoria-ad-20260704-1335`). Riferimenti: `cervello/giro.md` (RAMO UNICO — Fase 2). | Vercel + VPS (manuale, lato Nicola) | ✅ **FATTO — confermato da Nicola 2026-07-07**: le due mani sono state fatte (① Vercel `OBSIDIAN_BRANCH=main` + Redeploy · ② VPS `GIT_BRANCH=main`, **verificato** in `cervello/vps/.env`). ③ Residuo: **niente da riportare** — `memoria-ad` è fermo al 30/6 (tip precedente allo switch), nessuna scrittura vi è arrivata dopo, quindi il VPS ora pubblica già su `main`. Ramo `memoria-ad` in pensione (backup `backup/memoria-ad-20260704-1335`). La canonicalizzazione dei fix-codice storici resta tracciata a parte in **R2/#35**. · **🗄️ CARD CHIUSA/RITIRATA 2026-07-07 01:44** — proposta Pannello «Marca come fatta la card sul binario di lettura» eseguita: le due mani (Vercel + VPS) le hai già fatte tu, non resta nulla da approvare; decisione registrata **non-riproporre** in [[DECISIONI]]. | Pannello e cervello smettono di lavorare su due binari diversi: tutto vive su `main`, la Cabina mostra sempre l'ultima memoria (oggi le scritture del VPS non si vedevano dai giri cloud e viceversa). | La memoria non si spacca mai più in due; il prossimo giro pubblica direttamente dove il Pannello legge e `memoria-ad` va in pensione con backup. |
| 54 | 2026-07-07 01:36 | AD/devops-sre | **Pubblica su GitHub la memoria del giro di stanotte, così il Pannello online la vede** | 🟡 | La memoria del giro cloud di stanotte (briefing `2026-07-07` + `STATO.md`, commit `5c50543a`) è **già sul `main` locale del VPS**: il merge nel ramo principale è **fatto**. Manca solo **pubblicarla su `origin/main`**, che è **indietro di 1599 commit** — perciò la copia hosted del Pannello (che legge `origin/main`) non vede ancora il giro. In questa sessione la **rete/git-push è chiusa dal sandbox** (`git fetch`/`push` negati), quindi l'ho preparata pronta. **Comando (flusso sanzionato, non-force con rebase — `cervello/giro.md` RAMO UNICO):** `cd /opt/mycity/ad-mycity && git pull --rebase origin main && git push origin main`. **Verifiche fatte:** landmine oggetto `marketplace` **NON tracciato** su `main` (ok); divergenza = solo avanti (0 dietro). Deploy del Pannello hosted = **automatico** via Vercel al push (nessun comando extra). **↺ Precisazione 7/7 10:57:** in realtà il Pannello hosted legge `main` **live via API GitHub** (`obsidian.ts`, `cache:no-store`) → il contenuto compare **senza redeploy**, basta il push; `vercel.json` ha comunque `deploymentEnabled.main=false` (un push NON fa partire un deploy — irrilevante per il contenuto, rilevante solo se cambia una env). **Se dopo il push il Pannello resta cieco → è il token: vedi #55.** | git push su `origin/main` (sessione VPS con rete aperta, oppure «ok 54») | ⏳ pronto — gated su rete/git-push | Il Pannello **online** mostra briefing e STATO aggiornati di stanotte: oggi la copia hosted legge `origin/main` fermo a 1599 commit fa e non vede il giro. Sulla copia VPS (legge il filesystem) è già visibile. | La Cabina online resta sempre allineata al VPS; il push diventa il passo standard di chiusura di ogni giro cloud e la memoria non resta più "ferma in locale". |
| 55 | 2026-07-07 10:57 | AD/devops-sre | **Dai al Pannello online un token GitHub tutto suo di sola lettura e rifai il Redeploy** | 🔴 | **Condizionata, a valle di #54.** Il Pannello hosted legge il vault da GitHub via API con `OBSIDIAN_TOKEN`→fallback `GITHUB_TOKEN` (`pannello/src/lib/obsidian.ts`, `cache:no-store`, ramo `main`). Oggi Nicola ha revocato il vecchio PAT (R1): se su Vercel quel token era ancora il valore revocato, il Pannello è **cieco in lettura** (401/403). **Check a occhio (30 s):** apri `<url-pannello>/api/diagnosi` → voce **«Vault GitHub (Pannello)»**: se **ROSSO «accesso KO»** → esegui questa card; se **verde** ma manca il giro di oggi → è solo #54 (push), questa card NON serve. **Passi (least-privilege):** ① GitHub → fine-grained PAT read-only, repo `ad-mycity`+`mycity`, *Contents: Read-only* (nome `vercel-pannello-readonly`); ② Vercel → Settings → Env: `GITHUB_TOKEN`=nuovo PAT (opz. anche `OBSIDIAN_TOKEN`), lascia `OBSIDIAN_BRANCH=main`; ③ Vercel → Deployments → **Redeploy a mano** (`vercel.json` ha `deploymentEnabled.main=false` → il push non lo fa da solo); ④ ricontrolla `/api/diagnosi` = verde. Dettaglio: `consegne/devops/2026-07-07-verifica-pannello-hosted-token.md`. Separato dal `GIT_PUSH_TOKEN` del VPS (che scrive) — chiude AR-004 senza dare a Vercel poteri di scrittura. | Vercel (manuale, lato Nicola) | ✅ **NON SERVE — 2026-07-09: Nicola conferma «Vault GitHub» VERDE in `/api/diagnosi`.** Il token su Vercel legge il vault, la condizione (ROSSO) non si è avverata → card chiusa senza fare nulla. Il PAT read-only dedicato resta un nice-to-have di igiene (least-privilege), non un'urgenza. | Il Pannello online torna a leggere la memoria: la spia «Vault GitHub» diventa verde e briefing/STATO ricompaiono. Se il check è verde, non serve fare nulla qui. | Cabina hosted allineata al VPS in tempo reale (lettura live, senza altri redeploy); il buco del token revocato resta chiuso con un token di sola lettura. |
| 56 | 2026-07-07 12:05 | account-negozi | **Arma la veglia anti-churn sui negozi prima dell'onda del 13/7** | 🟡 | Playbook anti-churn 7/7: **oggi 0 negozi in calo** (1 solo negozio reale, senza storico; PQ non-churn, già chiuso da te il 6/7 con #25/#29). Il churn nasce dal **13/7** con le 6 botteghe priorità → armare l'health-score PRIMA le protegge dal giorno 1. Soglie (sola lettura): 🟡 0 ordini a 5g dal go-live (no-value) · 🟡 0 da 14g (silenzio) · 🔴 0 da 30g o «tolgo il negozio». Nessun contatto automatico: alza solo una card «negozio a rischio» sul Pannello. Non tocca #25/#29 né #40 (è la lente salute/retention, oggi assente). Dettaglio + template check-in neutro: `consegne/account-negozi/2026-07-07-playbook-anti-churn.md` · blocco A25 in [[AZIONI-PRONTE]]. | giro.sh (sola lettura) + Pannello | ✅ ARCHIVIATA housekeeping 14/7 | La macchina veglia da sola il tempo-al-primo-ordine di ogni bottega del 13/7 e ti segnala chi rischia di mollare in tempo per la spinta, invece che a molla persa. | Le 6 botteghe non ammutoliscono nel silenzio: chi rischia il "no value" riceve ordine di prova + post prima di andarsene. Riusabile per ogni negozio futuro. |
| 57 | 2026-07-07 12:12 | content-social | **Pubblica il post del giorno "Oggi è il tuo turno" su Facebook e Instagram** | 🔴 | Post-manifesto pronto (versioni Gruppi FB + IG/FB Pagina + idea visual): `consegne/content/2026-07-07-post-del-giorno-il-turno.md`. È **neutro** (parla della causa, non di un negozio → nessun consenso bottega, cancello allocazione ok). Aggancio piattaforma "Il Turno" + cavalca il momento del gigante online (anti-Prime-Day). **Prima di uscire servono 4 cose da te:** ① il **link reale della lista d'attesa** (oggi manca ovunque — è il tappo n.1; va nel 1° commento su FB e in bio su IG, con UTM); ② conferma **fonte del −22%** (o si toglie la cifra); ③ ok sull'aggancio Prime Day (se non cade questi giorni si pubblica senza la 1ª riga); ④ la **foto** della saracinesca all'alba (o via libera a immagine AI dichiarata). Zero numeri/testimonianze inventati (ONESTA-RULES superato). | IG + Facebook (manuale, poi n8n) | ⏳ pronto — aspetta link lista + firma | Esce il primo contenuto sotto la piattaforma "Il Turno": manifesto della causa che chiede le prime 50 famiglie del centro, senza promettere numeri che non abbiamo. Riempie il vuoto social (oggi 0 follower). | Primo mattone di notorietà + prime iscrizioni tracciabili via UTM; poi il manifesto diventa la testa della rubrica settimanale "Il Turno". |
| 58 | 2026-07-08 10:31 | account-negozi/AD | **Insegna alla macchina che Pane Quotidiano sta aspettando, così smette di segnalarlo come negozio a rischio** | 🟡 | **Falso positivo alla radice.** Il sensore «negozio fermo» (`cervello/sentinella-dati.mjs:189-192`) conta ogni negozio approvato da >14g con 0 ordini in 14g e stamattina (10:28) ha di nuovo svegliato la macchina su PQ chiedendo un tocco anti-churn — che hai **già escluso il 6/7** («li conosco e aspettano», #25/#29 chiuse). Il sensore **non conosce l'eccezione «attesa concordata»** → ricasca a ogni giro (~2h) e, quando colleghiamo le «mani», rischia un tocco automatico su una relazione che gestisci a mano. **Fix minimo e reversibile:** allowlist alimentata dal `registro-fatti.json` (nessun id nel codice) — un negozio in *attesa concordata* non alza l'allarme churn finché non ha il 1° incasso, poi rientra normale. Estende lo stesso sensore di #24 (esclude le demo) ai negozi **reali in attesa**. Auto-modifica → **non la applico da sola**. Dettaglio + le 3 prove: `consegne/account-negozi/2026-07-08-negozio-fermo-pane-quotidiano-falso-positivo.md`. | commit branch (no deploy) | ✅ ARCHIVIATA housekeeping 14/7 | La sentinella smette di suonare a vuoto su PQ e di consumare cervello ogni 2h; nessun rischio di tocco automatico su una relazione che gestisci tu. Scatterà solo su negozi reali **davvero** fermi (dal 13/7, le botteghe che ammutoliscono). | La macchina distingue «silenzio = abbandono» da «silenzio = attesa concordata»: l'eccezione vale per ogni futuro negozio in pre-lancio, non solo PQ. |
| 59 | 2026-07-08 11:20 | content-social | **Pubblica il post del giorno "Il tuo turno, senza la trafila" su Facebook e Instagram** | 🔴 | Post del giorno 8/7 pronto (versioni Gruppi FB + IG/FB Pagina + idea visual): `consegne/content/2026-07-08-post-del-giorno-il-turno-comodo.md`. Angolo **utilità/ZTL (P4)** — diverso dal manifesto-causa di ieri (#57, P1) → non duplica: apre col dolore concreto della spesa del sabato (ZTL, parcheggio, 5 negozi) e lo risolve con "la tua spesa è il tuo turno". **Neutro** (parla della comodità, non di un negozio → nessun consenso bottega, cancello allocazione AR-006 ok; Pane Quotidiano resta il faro ma non è intestato). Zero numeri/testimonianze inventati: la multa ZTL è lasciata qualitativa (ONESTA-RULES superato). ⛔ L'aggancio anti-Prime-Day di ieri è **scaduto** — Prime Day 2026 era 23-26 giugno. **Prima di uscire servono 2 cose da te:** ① il **link reale della lista d'attesa** (manca ovunque — tappo n.1; va nel 1° commento su FB, in bio su IG, con UTM); ② la **foto** (borsa spesa sulla soglia di un portone del centro, o via libera a immagine AI dichiarata). | IG + Facebook (manuale, poi n8n) | ⏳ pronto — aspetta link lista + firma | Esce il 2° contenuto sotto "Il Turno", stavolta sul lato pratico (comodità senza la trafila): parla a chi vive il centro e la ZTL, senza promettere numeri che non abbiamo. | Secondo mattone di notorietà + iscrizioni tracciabili via UTM; con #57 nasce la coppia causa+utilità che regge la rubrica settimanale "Il Turno". |
| 60 | 2026-07-09 11:21 | content-social | **Pubblica il post del giorno "Il tuo ordine ha un nome" su Facebook e Instagram** | 🔴 | Post del giorno 9/7 pronto (versioni Gruppi FB + IG/FB Pagina + idea visual): `consegne/content/2026-07-09-post-del-giorno-volti-non-algoritmi.md` · anteprima [[AZIONI-PRONTE]] **A26**. Angolo **IL MOTORE "Volti, non algoritmi"** (swipe #3: il volto prima del prodotto) — pilastro diverso dai due già usati (7/7 causa P1 #57 · 8/7 comodità P4 #59) → **non duplica**: dice il *chi* c'è dietro l'ordine (una persona con un nome, non un algoritmo/magazzino anonimo). **Neutro** (figure archetipiche fornaio/salumiere, nessun negozio intestato → nessun consenso bottega, cancello allocazione AR-006 ok; Pane Quotidiano resta il faro ma non è intestato). Ghigliottina "poteva farlo Amazon?" → no (Amazon *è* l'algoritmo). Zero numeri/testimonianze inventati (ONESTA-RULES superato). **Prima di uscire servono 2 cose da te:** ① il **link reale della lista d'attesa** (manca ovunque — tappo n.1; va nel 1° commento su FB, in bio su IG, con UTM); ② la **foto** delle mani/gesto di un bottegaio che incarta (o via libera a immagine AI dichiarata); col volto reale → serve anche ok del titolare (ponte verso l'angolo "ritratto"). | IG + Facebook (manuale, poi n8n) | ⏳ pronto — aspetta link lista + firma | Esce il 3° contenuto sotto "Il Turno", stavolta sul *chi* (volti, non algoritmi): differenzia MyCity dal delivery anonimo senza promettere numeri che non abbiamo. | Terzo mattone di notorietà + iscrizioni tracciabili via UTM; con #57 e #59 la rubrica "Il Turno" ha tre pilastri diversi in fila (causa · comodità · volti) e regge come appuntamento settimanale. |

> ℹ️ **Righe #41–#52 importate il 2026-07-06 20:22 dal giro cloud** (riconciliazione del ramo unico `main`):
> nella coda del giro cloud erano numerate diversamente — i rimandi «#21/#26/#36…» DENTRO quelle righe seguono la vecchia numerazione.
> Mappa: #21→#41 (ordine-prova PQ) · #24→#42 (win-back) · #25→#43 (scout 3 botteghe) · #28→#44 (punti) · #29→#45 (gift card) · #29→#46 (post lunedì) · #31→#47 (schema.org) · #33→#48 (kit fisico) · #34→#49 (semina QR) · #35→#50 (report dati) · #36→#51 (gate badge nel codice) · #39→#52 (mail istituzioni).
> Non importate perché superate da decisioni successive di Nicola o già in coda: chiamate alle 6 botteghe (16:35: ci va di persona il 13/7), anti-churn PQ (15:52: chiusa), sentinella annullati (≡#40), carrello samir (≡#26), SEO vetrina (≡blocchi 16:10), scheda Google MyCity (16:08: parcheggiata), comunicazione badge (≡blocco standard).

| 61 | 2026-07-10 18:13 | @tech | Merge PR #252 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/252 | github | ✅ ARCHIVIATA housekeeping 14/7 | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 62 | 2026-07-10 18:27 | @tech | Merge PR #255 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/255 | github | ✅ ARCHIVIATA housekeeping 14/7 | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 63 | 2026-07-10 18:42 | @tech | Merge PR #257 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/257 | github | ✅ ARCHIVIATA housekeeping 14/7 | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 64 | 2026-07-11 00:08 | @tech | Merge PR #212 mycity → main | 🔴 | https://github.com/NicolaeRotaru/mycity/pull/212 | github | ✅ ARCHIVIATA housekeeping 14/7 | Il codice in anteprima va online su Render (sito) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 65 | 2026-07-11 00:09 | @tech | Merge PR #212 mycity → main | 🔴 | https://github.com/NicolaeRotaru/mycity/pull/212 | github | ✅ ARCHIVIATA housekeeping 14/7 | Il codice in anteprima va online su Render (sito) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 66 | 2026-07-11 15:36 | @tech | Merge PR #269 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/269 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 67 | 2026-07-11 15:37 | @tech | Merge PR #270 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/270 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 68 | 2026-07-11 15:54 | @tech | Merge PR #272 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/272 | github | ✅ ARCHIVIATA housekeeping 14/7 | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 69 | 2026-07-11 16:00 | @tech | Merge PR #274 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/274 | github | ✅ ARCHIVIATA housekeeping 14/7 | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 70 | 2026-07-11 16:05 | @tech | Merge PR #275 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/275 | github | ✅ ARCHIVIATA housekeeping 14/7 | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 71 | 2026-07-11 16:09 | @tech | Merge PR #276 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/276 | github | ✅ ARCHIVIATA housekeeping 14/7 | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 72 | 2026-07-11 22:46 | @tech | Merge PR #283 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/283 | github | ✅ ARCHIVIATA housekeeping 14/7 | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 73 | 2026-07-12 00:02 | @tech | Merge PR #284 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/284 | github | ✅ ARCHIVIATA housekeeping 14/7 | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 74 | 2026-07-12 00:12 | @tech | Merge PR #285 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/285 | github | ✅ ARCHIVIATA housekeeping 14/7 | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 75 | 2026-07-12 00:16 | @tech | Merge PR #286 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/286 | github | ✅ ARCHIVIATA housekeeping 14/7 | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 76 | 2026-07-12 00:37 | @tech | Merge PR #287 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/287 | github | ✅ ARCHIVIATA housekeeping 14/7 | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 77 | 2026-07-12 00:53 | @tech | Merge PR #288 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/288 | github | ✅ ARCHIVIATA housekeeping 14/7 | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 78 | 2026-07-12 01:04 | @tech | Merge PR #289 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/289 | github | ✅ ARCHIVIATA housekeeping 14/7 | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 79 | 2026-07-12 01:06 | @tech | Merge PR #290 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/290 | github | ✅ ARCHIVIATA housekeeping 14/7 | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 80 | 2026-07-12 01:29 | @tech | Merge PR #291 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/291 | github | ✅ ARCHIVIATA housekeeping 14/7 | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 81 | 2026-07-12 02:35 | @tech | Merge PR #296 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/296 | github | ✅ ARCHIVIATA housekeeping 14/7 | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 82 | 2026-07-12 02:41 | @tech | Merge PR #297 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/297 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 83 | 2026-07-12 19:35 | @tech | Merge PR #305 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/305 | github | ✅ FATTO 2026-07-12 17:44 | Aprire una chat non la sposterà più in cima nella lista Conversazioni — ordine stabile (pinnate + data creazione). | Fix già su main via PR #303 mergiata 17:44 (commit `67c6b804`). Chiudere #305/#306/#304 senza merge. |
| 84 | 2026-07-12 17:39 | @tech | Merge PR #302 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/302 | github | ✅ ARCHIVIATA housekeeping 14/7 | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 85 | 2026-07-12 19:47 | @tech | Merge PR #308 ad-mycity → main | ❌ | https://github.com/NicolaeRotaru/ad-mycity/pull/308 | github | CHIUDI SENZA MERGE · sostituita da #309 2026-07-12 19:53 | Conflitti: git-pr aveva incluso routing/sentinella nel branch. | Usa #309 (solo 4 file pannello). |
| 86 | 2026-07-12 19:53 | @tech | Merge PR #309 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/309 | github | ✅ FATTO 2026-07-13 · mergiata su main | Caselle dark mode leggibili — Quaderni/Numeri/Grafo con token tema. | Deploy Vercel automatico; ricarica Pannello per verificare. #308 chiudere senza merge. |
| 87 | 2026-07-13 11:16 | @tech | Merge PR #312 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/312 | github | ✅ ARCHIVIATA housekeeping 14/7 | Le prossime PR del Pannello non si bloccheranno più per routing/sentinella — un solo file script. | Chiudi #310 e #311 senza merge (sporche); mergia #312. |
| — | 2026-07-13 11:16 | @tech | CHIUDI #310 e #311 senza merge | ❌ | #310 #311 | github | CHIUDI · #312 ✅ su main · riapprovazione #310 14/7 00:36 | Fix git-pr già live (#312 `090448b1`); #310 conflitti = branch vecchio, non mergiare. Nicola: chiudi #310 su GitHub. | #311 presumibilmente chiusa; se #310 ancora aperta → chiudi senza merge. |
| 88 | 2026-07-13 11:24 | @tech | Merge PR #313 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/313 | github | ✅ ARCHIVIATA housekeeping 14/7 | Le caselle «Confronto coi migliori» in Miglioramento mostrano @content-social e @AD con obiettivo/divario — non più vuote né «undefined». | Dopo Approva: merge + deploy Vercel; ricarica Auto-coscienza per verificare.
| 89 | 2026-07-13 11:29 | @tech | Merge PR #314 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/314 | github | ✅ ARCHIVIATA housekeeping 14/7 | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 90 | 2026-07-13 11:32 | @tech | Merge PR #315 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/315 | github | ✅ ARCHIVIATA housekeeping 14/7 | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 91 | 2026-07-13 11:37 | @tech | Merge PR #315 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/315 | github | ✅ ARCHIVIATA housekeeping 14/7 | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 92 | 2026-07-13 12:14 | @tech | Merge PR #316 ad-mycity → main | ❌ | https://github.com/NicolaeRotaru/ad-mycity/pull/316 | github | CHIUDI SENZA MERGE · sync già su main via #317 2026-07-13 12:39 | Sync chat + badge già live su main — #316 duplicata. | Chiudi #316 e #299 senza merge. |
| 93 | 2026-07-13 12:24 | @tech | Merge PR #317 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/317 | github | ✅ FATTO 2026-07-13 · mergiata su main | Volano ponte applicazione lezioni + sync chat inclusa. | Sync PC↔telefono già attiva; chiudi #316. |
| 94 | 2026-07-13 12:27 | @tech | Merge PR #318 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/318 | github | ✅ FATTO 2026-07-13 · mergiata su main (audit 17:55) | X su Prompt pronto, chat aperta evidenziata, Annulla invio durante «sto pensando…». | Deploy Vercel; tre fix UX chat online. Coda Pannello da aggiornare. |
| 95 | 2026-07-13 12:59 | @tech | Merge PR #322 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/322 | github | ✅ ARCHIVIATA housekeeping 14/7 | Tab Piani mostra ogni piano dall'inizio (titolo/obiettivo), non più tronca a metà frase. | Dopo Approva: deploy Vercel; ricarica tab Piani — «💶 PIANO FINANZIARIO» all'inizio, non «…he il CM sia positivo». |
| 96 | 2026-07-13 14:33 | @tech | Merge PR #323 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/323 | github | ✅ FATTO 2026-07-13 · mergiata su main (audit 17:55) | Sotto ogni avviso «memoria incoerente» compare «Parla con questa casella» — chat contestuale come le altre card. | Deploy Vercel; Avvisi → clic su avviso giallo → «Parla con questa casella» sotto la scheda. |
| 97 | 2026-07-13 16:17 | @tech | Merge PR #324 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/324 | github | ✅ ARCHIVIATA housekeeping 14/7 | Su telefono Invio va a capo (Invia = manda); nella lista chat fluttuante compaiono graffetta 📌 e pallino rosso come nel cassetto chat intera. | Da telefono: Invio = nuova riga; apri chat fluttuante → lista con pin e pallino; ricarica post-deploy.
| 98 | 2026-07-13 16:16 | @tech | Merge PR #325 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/325 | github | ✅ ARCHIVIATA housekeeping 14/7 | Tab Lavori: badge «In coda» e «Archivio» presi dal database (≈1010 archivio, tutti gli attivi in coda); lista archivio paginata con «Carica altri». | Dopo Approva: numeri corretti in Lavori e archivio completo navigabile; deploy Vercel automatico. |
| 99 | 2026-07-13 16:25 | @tech | Merge PR #326 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/326 | github | ✅ ARCHIVIATA housekeeping 14/7 | Tab OKR & pagella: frasi dentro le card su mobile, Stelle Polari si aggiornano ogni minuto, data documento visibile sotto. | Dopo Approva: deploy Vercel ~2 min; ricarica tab — numeri in alto si muovono; target sotto restano 24/6 finché non fai «fai un giro». |
| 100 | 2026-07-13 17:07 | @tech | Merge PR #327 ad-mycity → main | ❌ | https://github.com/NicolaeRotaru/ad-mycity/pull/327 | github | CHIUDI SENZA MERGE · sostituita da #328 2026-07-13 17:16 | Fix incompleto (solo badge, no sync server). | Chiudi #327; mergia solo #328 (card #102). |
| 101 | 2026-07-13 17:11 | @tech | Merge PR #329 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/329 | github | ✅ FATTO 2026-07-13 · mergiata su main (audit 17:55) | Il guardiano agenti segnala collisioni nelle description di routing (es. fraud-risk/trust-safety) — non più falso verde. | Al prossimo giro il controllo blocca nuove collisioni; correggere trust-safety = passo separato. |
| 102 | 2026-07-13 17:12 | @tech | Merge PR #328 ad-mycity → main | ❌ | https://github.com/NicolaeRotaru/ad-mycity/pull/328 | github | GIÀ SU MAIN 2026-07-13 17:51 · chiudere se aperta | Pallini sync telefono/PC già online su main. | Chiudi #328 se ancora aperta; residuo ~5s → solo #336 (card #108). |
| 103 | 2026-07-13 17:15 | @tech | Merge PR #330 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/330 | github | ✅ FATTO 2026-07-13 17:19 · mergiata `ac9e24a9` | 10 plugin fase 2 nel manifest (debug, TDD, security, UI, web, Firecrawl…) — 14 skill totali. | Riavvia worker per caricare le nuove regole; Firecrawl solo con chiave API sul VPS. |
| 104 | 2026-07-13 17:26 | @tech | Merge PR #331 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/331 | github | ✅ FATTO 2026-07-13 · mergiata su main (audit 17:55) | 8 plugin fase 3 nel manifest (debug, design moduli, Supabase, cross-repo, PDF/Excel/Word) — 21 skill totali. | **Riavvia worker** per caricare le regole (ultimo riavvio 16:08); codebase-search solo con Tabnine collegato. |
| 105 | 2026-07-13 17:36 | @tech | Merge PR #332 ad-mycity → main | ❌ | https://github.com/NicolaeRotaru/ad-mycity/pull/332 | github | CHIUDI SENZA MERGE · sostituita da #336 2026-07-13 17:51 | Fix incompleto — pallino riaccende ancora dopo ~5s. | Chiudi #332; mergia solo #336 (card #108). |
| 106 | 2026-07-13 17:37 | @tech | Merge PR #333 ad-mycity → main | ❌ | https://github.com/NicolaeRotaru/ad-mycity/pull/333 | github | GIÀ SU MAIN 2026-07-13 17:51 · chiudere se aperta | Graffetta Safari fluttuante già online su main. | Chiudi #333 se ancora aperta. |
| 107 | 2026-07-13 17:45 | @tech | Merge PR #334 ad-mycity → main | ❌ | https://github.com/NicolaeRotaru/ad-mycity/pull/334 | github | CHIUDI SENZA MERGE · sostituita da #336 2026-07-13 17:51 | #334 conflittuale — partiva da codice vecchio. | Chiudi #334; mergia solo #336 (card #108). |
| 110 | 2026-07-13 17:53 | @builder-automazioni | Merge PR #337 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/337 | github | ✅ ARCHIVIATA housekeeping 14/7 | Ogni PR ha descrizione obbligatoria su GitHub — git-pr.mjs blocca senza body reale. | Dopo Approva: nessuna PR nuova si apre più senza spiegazione in italiano dentro GitHub. |
| 108 | 2026-07-13 17:51 | @tech | Merge PR #336 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/336 | github | ✅ FATTO 2026-07-13 ~17:49 · ⚠️ pallino ancora rotto (audit 17:55) | Pallino resta spento dopo il poll (~5s) — max orario chat+lavoro, 1 file Pannello. | Codice su main ma Nicola riconferma bug 17:52 — serve diagnosi post-deploy su telefono/PC. Chiudi #334. |
| 109 | 2026-07-13 17:50 | @builder-automazioni | Merge PR #335 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/335 | github | ✅ FATTO 2026-07-13 ~17:49 · ⚠️ fix annullato su main (audit 17:55) | In chat torni a vedere la risposta crescere parola per parola con motore Cursor. | Fix correttivo in #338 mergiata — `sudo systemctl restart mycity-worker-chat`. |
| 111 | 2026-07-13 17:58 | @tech | Merge PR #338 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/338 | github | ✅ FATTO 2026-07-13 ~17:58 · verifica UX post-deploy | Streaming Cursor + pallino resta spento dopo poll (~5s) — `segnaLetta` con orario «adesso» in persist. | Deploy Vercel 2–3 min → refresh forzato → apri chat 15s; riavvio worker per streaming. |
| 112 | 2026-07-13 18:12 | @tech | Merge PR #340 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/340 | github | ✅ FATTO 2026-07-13 ~18:14 | Sulle chat con risposta AD non aperta compare il pallino rosso anche se sei in Plancia o Lavori. | Dopo Approva: scrivi in chat → vai in Plancia → quando rispondo, elenco Conversazioni mostra il pallino. |
| 113 | 2026-07-13 18:12 | @builder-automazioni | Merge PR #339 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/339 | github | ✅ FATTO 2026-07-13 ~18:14 · restart 18:22 · VPS allineamento via #341 | In chat il testo dell'AD cresce in orizzontale mentre scrive, senza sillabe spezzate a colonna. | Restart 18:22 non bastato — serve merge #341 + aggiorna-cervello.sh. |
| 114 | 2026-07-13 18:29 | @tech | Merge PR #341 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/341 | github | ✅ FATTO 2026-07-13 ~18:50 · Nicola «fatto» | Pull codice GitHub sul VPS + riavvio entrambi i worker + fix streaming poll 1s. | Sesta prova streaming in corso — feedback Nicola atteso a fine risposta. |
| 115 | 2026-07-13 18:45 | @tech | Merge PR #342 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/342 | github | ✅ FATTO 2026-07-13 ~18:50 · riapprovazione 14/7 00:35 confermata 02:37 · merge commit `2e273311` già su main | Il Pannello mostra la bolla live mentre l'AD scrive + fissa pallini durante streaming. | Nessuna azione ulteriore — PR chiusa; ignora card se riappare. |
| 116 | 2026-07-13 19:36 | @tech | Merge PR #345 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/345 | github | ✅ ARCHIVIATA housekeeping 14/7 | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 117 | 2026-07-13 19:37 | @tech | Merge PR #346 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/346 | github | ✅ ARCHIVIATA housekeeping 14/7 | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 118 | 2026-07-13 19:42 | @tech | Merge PR #348 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/348 | github | ✅ FATTO 2026-07-13 20:10 · main `b153f62f` | Pallini: impronta ultima risposta (non timestamp) — fix scenario 1+4. | Ctrl+Shift+R + test 15s esci da chat + elenco non tutto rosso. |
| 119 | 2026-07-13 21:01 | @tech | Merge PR #349 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/349 | github | ✅ FATTO 2026-07-13 21:44 · main `444439af` · **AR-006 chiuso 14/7 01:00** | Chiude silo allocazione: 12 asset Garetti archiviati, ripunta Pane Quotidiano, allocazione-check verde. | Casella silo sparita; niente più pacchetti pesanti su prospect non firmati. |
| 120 | 2026-07-13 21:10 | @tech | Mergia PR #350: Ritmo del giorno leggibile | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/350 | github | ✅ FATTO 2026-07-13 21:14 · main `42c657a8` | Piano mattino e report sera in Plancia: sezioni brevi in italiano semplice, senza muri di sigle nel testo principale. | Ricarica Plancia — card «Ritmo del giorno» con titoli ed elenchi; fix scroll fluttuante incluso nello stesso merge. |
| 121 | 2026-07-13 21:12 | @tech | Mergia PR #351: scroll chat fluttuante al riaprire | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/351 | github | ✅ FATTO 2026-07-13 21:14 · CHIUDI SENZA MERGE · fix già su main via #350 | Chiudi e riapri «Parla con l'AD»: vedi subito l'ultimo messaggio, non l'inizio della conversazione. | Fix già live con #350 — chiudi #351 su GitHub; se mergi → Accept main sul body. |
| 122 | 2026-07-13 21:13 | @tech | Mergia PR #352: chip Grillami e Codice minimo nel menù ⚡ | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/352 | github | ✅ conflitto risolto AD 21:42 · head `ac9606fc` · card verde | Nell'icona fulmine accanto a Invia compaiono «Grillami» e «Codice minimo» in cima alle skill rapide. | Solo Approva → deploy ~2 min → apri chat → icona ⚡ in cima. |
| 123 | 2026-07-13 21:47 | @frontend-dev | Merge PR #354: auto-rimuovi card merge dopo merge GitHub | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/354 | github | ✅ ARCHIVIATA housekeeping 14/7 | Dopo che mergi una PR su GitHub, la card «Merge PR #N» sparisce da sola da Da approvare — niente più caselle fantasma. | Approva → deploy ~2 min → mergia una PR e verifica che la card sparisce entro ~15 secondi. |
| 124 | 2026-07-13 21:48 | @tech | Merge PR #355 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/355 | github | ✅ ARCHIVIATA housekeeping 14/7 | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 125 | 2026-07-13 22:28 | @tech | Merge PR #356 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/356 | github | ✅ ARCHIVIATA housekeeping 14/7 | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 126 | 2026-07-13 23:22 | @tech | Merge PR #357: menu Memoria hub 4 tab | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/357 | github | in attesa | Memoria = hub unico con tab Viva·Archivio·Storico·GitHub; Diario eliminato; Governo&diretta in Lavori; menu laterale snello. | Dopo Approva: deploy ~2 min → ricarica Pannello e vedi il nuovo ordine Memoria. |
| 127 | 2026-07-13 23:38 | @tech | Merge PR #358: accordion Decisioni + tab Stato/OKR e Memoria/Scoperte | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/358 | github | in attesa | Decisioni si aprono e chiudono con testo leggibile; Stato&numeri in due tab; Memoria viva separa Memoria e Scoperte con briefing e Sala aperti. | Dopo Approva: deploy ~2 min → ricarica Memoria e prova accordion in Storico→Decisioni. |
| 128 | 2026-07-13 23:43 | @tech | Merge PR #359: GitHub dentro Archivio (tab Consegne e GitHub) | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/359 | github | in attesa | GitHub non è più tab in Memoria: sta in Archivio con Consegne; menu Memoria resta a 3 voci. | Dopo Approva: deploy ~2 min → Memoria → Archivio → tab GitHub; link vecchi funzionano. |
| 129 | 2026-07-14 00:09 | @tech | Merge PR #360 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/360 | github | ✅ ARCHIVIATA housekeeping 14/7 | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 130 | 2026-07-14 00:47 | @frontend-dev | Merge PR #362: rete sync Pannello ovunque | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/362 | github | ✅ MERGIATA 14/7 (`475b0bf9`) | Segni un fix o approvi un'azione: sparisce subito ovunque (Radiografia macchina, Da approvare, Plancia, memoria) senza ricaricare la pagina. | Sync parziale live: Scoperte e Proposte dal giro ancora su ultimo giro — fix prodotto aperto (chat 14/7 ~02:20). |
| 131 | 2026-07-14 00:56 | @tech | Merge PR #363: allegati caselle Lavori + selezione testo leggibile | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/363 | github | in attesa | Foto nella chat delle caselle Lavori e testo evidenziato con mouse o touch si vedono di nuovo su telefono e desktop. | Dopo Approva: aspetta 1–2 min, ricarica (su iPhone chiudi e riapri) e prova allegato + selezione in una chat casella Lavori. |
| 132 | 2026-07-14 01:16 | @tech | Merge PR #365 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/365 | github | ✅ MERGIATA 14/7 02:02 | Coerenza agenti: description senza collisioni, drift 0. | Casella coerenza-agenti aggiornata; ricarica Radiografia. |
| 133 | 2026-07-14 02:15 | @tech | Merge PR #368 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/368 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 134 | 2026-07-14 02:24 | @tech | Merge PR #369: sync tempo reale Scoperte, Proposte e Plancia | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/369 | github | ✅ FATTO 14/7 02:57 · merge già su main 02:52 (`50127999`) | Approvi o ignori una proposta: sparisce subito in Azioni e Scoperte senza ricaricare la pagina; anche numeri e briefing in home si aggiornano insieme. | Dopo Approva: deploy ~2 min → prova approva/ignora una proposta senza refresh; se non si muove entro 10s, dimmelo. |
| 135 | 2026-07-14 02:34 | @prompt-engineer | Mergia PR #370: Come pensa l'AD — stampo 120/120 | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/370 | github | ✅ MERGIATA 14/7 ~02:41 (`746e0947`) | Ogni specialista ha quaderno, scorecard e kit completi; guardiano stampo-check attivo. | Casella verde dopo merge PR bookkeeping finding chiusi (#376); quaderni vuoti = normale. |
| 136 | 2026-07-14 02:38 | @tech | Merge PR #371: ordine conversazioni + header chat pulito | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/371 | github | ✅ MERGIATA 14/7 ~03:10 · ⚠️ regressione ordine | Header pulito ok; ma `convVistaAt` ha reintrodotto «ultima aperta in cima» (già tolto 12/7 con #303) — Nicola «ho mangiato un fix vecchio», click sposta chat in cima. | Fix in **#375** card **#141** — non riapprovare #371. |
| 137 | 2026-07-14 02:39 | @tech | Merge PR #372 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/372 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 138 | 2026-07-14 02:43 | content-social | **Pubblica il post del giorno "La vera stella della colazione" su Facebook e Instagram** | 🔴 | Post del giorno 14/7 pronto (testo + storia + gruppi FB + idea visual): `consegne/content/2026-07-14-post-del-giorno-kefir-caldo-PQ.md` · anteprima [[AZIONI-PRONTE]] **A28**. Angolo **prodotto-eroe** (swipe #2 Cortilia) su **Pane Quotidiano** — kefir bio €2,95 (fonte REST 1/7). Diverso da pesto 1/7, lunedì 6/7, volti 9/7, BTS 11/7. Gate ONESTA passato. **Prima di uscire:** ① link reale lista d'attesa (1° commento FB + bio IG, UTM `kefir_estate_1407`); ② foto kefir reale o ok visual tipografico neutro. | IG + FB + gruppi FB locali (manuale) | ⏳ pronto — aspetta link lista + firma | Esce post estivo sul negozio reale: colazione fresca a domicilio senza uscire col caldo. | Primi iscritti via UTM; ripubblicabile da PQ. |
| 139 | 2026-07-14 02:50 | @tech | Merge PR #373: descrizione umana su ogni avviso | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/373 | github | in attesa · mergeable verificato 14/7 02:56 | Ogni scheda gialla in Avvisi mostra sopra una spiegazione in italiano (cosa significa, se è storico, cosa fare) — anche «Parla con questa casella» riceve la descrizione per prima. | Dopo Approva: deploy ~2 min → Ctrl+Shift+R su Avvisi e verifica descrizione sopra il testo tecnico. |
| 140 | 2026-07-14 03:07 | @tech | Mergia la PR: descrizione chiara sulle opportunità in Scoperte | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/374 | github | in attesa · conflitti risolti 14/7 03:09 · head `b556149d` · mergeable verificato | Ogni opportunità in Scoperte mostra sopra una spiegazione in italiano (es. 494 campi = 252 condizione + 242 unità) — come già fatto per gli avvisi; anche «Parla con questa casella» la riceve per prima. | Dopo Approva: deploy ~2 min → Ctrl+Shift+R su Scoperte e verifica la descrizione sopra il dettaglio tecnico. |
| 141 | 2026-07-14 03:09 | @tech | Merge PR #375: ripristina ordine stabile conversazioni | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/375 | github | in attesa · commit `671a42ed` | Aprire una chat **non** la sposta più in cima (fix regressione #371); resta header pulito con icona storico. | Dopo Approva: deploy ~2 min, Ctrl+Shift+R, clicca chat a metà lista — resta al suo posto. |
| 142 | 2026-07-14 03:30 | @tech | Mergia la PR: Chi impara da cosa — volano apprendimento | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/378 | github | ✅ FATTO 14/7 03:36 · merge `2162a760` · 6/6 finding chiusi voto 72 | Chi impara da cosa passa a verde in Radiografia (6/6 fix, ponte quaderni→calibrazione). | Dopo Approva: deploy ~2 min → Ctrl+Shift+R su Radiografia macchina › Chi impara da cosa. |
| 143 | 2026-07-14 03:37 | @analista | Mergia la PR: Onestà sui numeri — calibrazione e radiografia | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/379 | github | in attesa · conflitti risolti 14/7 12:44 · head `f2d79065` · mergeable verificato · 4/4 finding chiusi voto 75 | Onestà sui numeri passa a verde in Radiografia (4/4 fix, ponte loop→calibrazione con sensore_stato, niente auto-conferme al buio). | Dopo Approva: deploy ~2 min → Ctrl+Shift+R su Radiografia macchina › Onestà sui numeri — zero schede sotto. |
| 144 | 2026-07-14 12:58 | @tech | Miniatura foto allegata visibile sopra la casella (fluttuante + Assistente) | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/380 | github | in attesa | Dopo aver scelto una foto in chat fluttuante o Assistente vedi il quadratino con l'immagine sopra dove scrivi — non più solo un nome minuscolo che sembrava assente; se iPhone non manda il file compare un avviso giallo. | Dopo Approva: aspetta 1–2 min, su iPhone chiudi e riapri il Pannello, scegli una foto → miniatura sopra la casella → puoi inviare anche senza testo. |
| 145 | 2026-07-14 13:08 | @tech | Mergia la PR: Rischio tecnico — guardiani sicurezza e sync monitora | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/383 | github | ✅ FATTO 2026-07-15 11:52 · merge `417ded09` · 6/8 finding chiusi (resto in PR #398) | Sei schede di Rischio tecnico spariscono in Radiografia (hook segreti attivi, monitora non cancella commit locali, scan Resend/n8n, timeout sensori, meta-guardiani); restano 2 che richiedono tua decisione su Cursor e auto-fix. | Dopo Approva: merge + VPS si allinea → Ctrl+Shift+R su Radiografia › Rischio tecnico. |
| 146 | 2026-07-14 14:44 | @tech | Merge PR #381 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/381 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 147 | 2026-07-14 18:47 | @tech | Merge PR #384 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/384 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 148 | 2026-07-14 19:03 | @tech | Merge PR #385 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/385 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 149 | 2026-07-14 21:34 | @tech | Merge PR #387 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/387 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 150 | 2026-07-14 22:00 | @tech | Merge PR #388 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/388 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 151 | 2026-07-14 22:30 | @tech | Merge PR #389 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/389 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 152 | 2026-07-14 22:33 | @tech | Merge PR #390 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/390 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 153 | 2026-07-14 22:54 | @tech | Merge PR #391 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/391 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 154 | 2026-07-14 23:01 | @tech | Merge PR #393 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/393 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 155 | 2026-07-14 23:01 | @tech | Merge PR #392 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/392 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 156 | 2026-07-14 23:42 | @tech | Merge PR #395 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/395 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 157 | 2026-07-14 23:54 | @tech | Merge PR #396 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/396 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 158 | 2026-07-15 11:44 | @tech | Merge PR #397 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/397 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 159 | 2026-07-15 11:52 | @tech | Merge PR #398 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/398 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 160 | 2026-07-15 16:04 | @tech | Merge PR #400 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/400 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 161 | 2026-07-15 16:06 | @tech | Merge PR #401 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/401 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 162 | 2026-07-15 19:11 | @tech | Merge PR #402 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/402 | github | ✅ FATTO 2026-07-15 19:20 · mergiata su main | Chat casella: Invia non resta bloccato, risposte con contesto scheda, niente «risposta vuota». | Deploy Vercel ~2 min → ricarica Pannello (iPhone: chiudi e riapri app). |
| 163 | 2026-07-16 01:05 | @tech | Merge PR #403 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/403 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 164 | 2026-07-16 11:27 | @tech | Merge PR #404 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/404 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 165 | 2026-07-16 16:14 | @tech | Merge PR #409 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/409 | github | ❌ ANNULLATA 2026-07-16 17:00 — sostituita da PR #410 che contiene entrambe le fix | Superata dalla PR #410 (briefing/sala chiuse + Storico→Memoria viva). | — |
| 166 | 2026-07-16 16:27 | @tech | Mergia PR #410 — Pannello: briefing/sala chiuse + Storico→Memoria viva | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/410 | github | in attesa | Contiene 2 fix: (1) Briefing e Sala Operativa chiuse di default in Memoria viva; (2) Tab Storico eliminato, i 3 sotto-tab (Decisioni · Quaderni senior · Stato & numeri) spostati dentro Memoria viva. Branch pulito, nessun conflitto. | Dopo Approva: merge automatico + deploy Vercel ~2 min → ricarica Pannello (Ctrl+Shift+R). |
| 167 | 2026-07-16 16:55 | @tech | Merge PR #411 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/411 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 168 | 2026-07-16 21:22 | @tech | Merge PR #414 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/414 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 169 | 2026-07-16 22:44 | @tech | Merge PR #416 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/416 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 170 | 2026-07-16 23:28 | @tech | Merge PR #419 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/419 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
| 171 | 2026-07-16 23:58 | @tech | Merge PR #420 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/420 | github | ✅ FATTO 2026-07-17 02:08 | PR già mergiata su main (merge commit 4da9da25). Fix scroll-conv-bottom attivo. | — |
| 172 | 2026-07-17 00:21 | @tech | Merge PR #424 ad-mycity → main | 🔴 | https://github.com/NicolaeRotaru/ad-mycity/pull/424 | github | in attesa | Il codice in anteprima va online su Vercel (Pannello) dopo il merge. | Dopo Approva: merge automatico + deploy; VPS si allinea al prossimo watch-main. |
<!-- I senior aggiungono righe qui sotto. Metti SEMPRE data E ora (AAAA-MM-GG HH:MM).
     Le ultime 2 colonne (Cosa cambia · Se va bene) sono OPZIONALI ma consigliate: sono la spiegazione che Nicola legge nella card. Esempio:
| 1 | 2026-06-25 14:30 | crm | Email benvenuto ai primi 10 iscritti | 🟡 | consegne/crm/benvenuto.md | email (Resend) | ✅ ARCHIVIATA housekeeping 14/7 | I primi 10 iscritti ricevono il benvenuto e capiscono come funziona MyCity. | Più clienti completano il primo ordine invece di sparire dopo l'iscrizione. |
-->


### 2026-06-24 · @pr-stampa · ✅� Pacchetto earned media di lancio (kit pronto)
- **Stato:** ✅ ARCHIVIATA housekeeping 14/7
**Stato 30/6 09:09:** ❌ **rifiutato** da Nicola via Pannello — non riproporre finché non chiede esplicitamente.
Fonte: `consegne/pr/KIT-STAMPA-LANCIO.md`. Tutto scritto e pronto; serve la firma per gli invii reali.
1. 🟢� **Invio email ESCLUSIVA a Libertà** (+ proposta servizio Telelibertà). Verificare prima il nome del direttore attuale (Rocco vs Visconti).
2. 🟢� **Invio email alle 3 testate online** (PiacenzaSera, Piacenza24, IlPiacenza) — solo DOPO l'uscita su Libertà o dopo 48h di silenzio.
3. 🟢� **Autorizzazione citazione titolare Garetti** (ok scritto del negoziante prima di pubblicarla).
4. 🟢� **Richiesta citazione/foto assessore Fornasari** (via @relazioni-istituzionali).
5. Completare campi [INSERIRE]: numero/email/sito stampa, fonte ufficiale del -22%, data di lancio.

---
## 🟢� Pubblicazione contenuti social — Settimane 1-4 (content-social)
- **Data proposta:** 2026-06-24
- **Cosa:** pubblicare i 16 post + bio IG/FB del calendario `consegne/content/CALENDARIO-4-SETTIMANE.md` sui canali reali (gruppi FB locali, IG feed/storie).
- **Perché 🟢�:** tocca canali pubblici reali in città piccola; cita nome/foto del negoziante.
- **Pre-condizioni prima del via:** (1) ok firmato di Garetti per nome/foto; (2) segnaposto [Garetti/MyCity/Cliente] riempiti coi dati veri; (3) dialetto validato da madrelingua; (4) URL lista d'attesa reale; (5) ⏳ grafiche DA GENERARE — la Content Factory (`render.mjs`) esiste, ma su disco c'è SOLO `creativi/output/social/storia-bottega-garetti-saracinesca.png`: i 4 PNG S1 + il reel .webm vanno ancora prodotti (non spuntare come pronti finché non sono su disco); (6) peer review @finanza sulla promo "primi 50 gratis".
- **Mani:** canali social → da collegare via @builder-automazioni (o pubblicazione manuale).
- **Stato:** chiusa DI FIRMA NICOLA.
- **Nota builder (2026-06-24):** le grafiche di base ci sono già a €0. Per i contenuti AI fotorealistici / Canva pro / video MP4 servono le chiavi (`GEMINI_API_KEY` / `CANVA_TOKEN` / `RUNWAY_API_KEY|KLING_API_KEY`) — collegabili da @builder-automazioni al via di Nicola.

## 2026-06-24 · @crm-lifecycle · Flussi lifecycle pronti (DRY-RUN)
Fonte: consegne/crm/FLUSSI-LIFECYCLE.md — niente è stato inviato.
- [x] 🟢� Approvare incentivo "prima consegna gratis" primi 50 iscritti (cap ~200€).
- [x] 🟢� Approvare referral give-get 5€+5€ (budget mensile suggerito 250€) + anti-frode.
- [x] 🟢� Approvare "Regala una spesa" (gift, prepagato = cash-positive) + scadenza buono 12 mesi.
- [x] 🟢� Approvare consegna offerta su win-back #2 e carrello #2 (1 volta/cliente, ~4€).
- [x] 🟢� Via libera all'INVIO dei 3 Welcome + transazionali ai primi clienti reali (dopo validazione legale-privacy footer/consenso).
- [x] 🟢�️ @builder-automazioni: collegare RESEND_API_KEY (+ dominio/SPF/DKIM), VAPID push, Telegram, webhook stato ordine.
- [x] ⚖️ @legale-privacy: validare footer disiscrizione + testi consenso (marketing vs transazionale) prima del primo invio.
- [x] 🟢� Pubblicare il MANIFESTO-CAUSA "Ogni spesa è un voto" (post gruppi FB + feed IG @mycity.piacenza). Testo pronto in `consegne/content/C1-manifesto-causa.md` (⏳ PNG `creativi/output/social/C1-manifesto-causa.png` DA GENERARE — non ancora su disco). PRECONDIZIONI: (a) confermare il dato −22%/12 anni + fonte citabile [vault riporta anche −20,4% al 2035]; (b) link reale lista d'attesa nel 1° commento (da @builder-automazioni); (c) [opz.] validare la variante dialetto con madrelingua.

## 🟢� Pubblicare il POV/ZTL "Sabato e ti tocca prendere la coppa" (C4) — @cro/@content-social
- **Data proposta:** 2026-06-25
- **Cosa:** pubblicare il contenuto POV relatable su canali reali: gruppi FB locali ("Sei di Piacenza se…", "Piacenza Mia") + IG feed @mycity.piacenza + rilancio in Storia. Testo+visual pronti in `consegne/content/C4-pov-ztl.md` (PNG: `creativi/output/social/C4-pov-ztl.png`).
- **Perché 🟢�:** tocca canali pubblici reali in città piccola; cita ZTL/multa/vigile (tono bonario, da validare @legale-privacy).
- **Pre-condizioni prima del via:** (1) conferma cifra multa ZTL Piacenza — uso **83€** come ordine di grandezza, correggibile in 1 riga del render o rimovibile; (2) link reale in bio (lista d'attesa o /store) con UTM `pov_ztl` da @builder-automazioni; (3) caption versione "uno di noi" senza hashtag nei gruppi FB, link nel 1° commento; (4) [opz.] validazione tono @legale-privacy (non diffamatorio verso Comune/PL).
- **Mani:** canali social → @builder-automazioni o pubblicazione manuale.
- **Quando consigliato:** venerdì sera 18-20 (o sabato mattina 8:30-9:30 per max identificazione).
- **Stato:** chiusa DI FIRMA NICOLA.

## 2026-06-26 · @content-social · Pubblicare il ritratto "Il nostro bottegaio" (Garetti) — 🟢�
- **Cosa:** pubblicare post FB + caption IG (carosello) + reel su @mycity.piacenza e gruppi locali Piacenza.
- **Contenuto pronto:** `consegne/content/W3-ritratto-bottega.md` · grafica `creativi/output/social/W3-ritratto-bottega.png`.
- **Canale:** Facebook/Instagram MyCity (+ gruppi quartiere). Le "mani" social passano da n8n/integrazioni → @builder-automazioni se non collegate.
- **🟢� BLOCCO finché non arrivano:** ① foto vera del volto di Garetti · ② frase reale sua · ③ consenso scritto uso nome/volto/frase (in città piccola la reputazione conta).
- **Effetto atteso KPI:** iscritti lista d'attesa (acquisizione calda dai clienti di Garetti, portata a costo ≈0 via ripubblicazione del negozio).
- **Via libera:** "ok" di Nicola DOPO foto+frase+consenso.

## 2026-06-26 · @ai-video · Reel W4 "Dietro la saracinesca"
- 🟢� **Consenso Garetti** (volto+voce+nome) prima di girare/pubblicare il BTS. Chi va a chiederlo?
- 🟢� **Pubblicare il reel** su IG/FB/TikTok (canali reali) → firma Nicola. Contenuto pronto in `consegne/content/W4-bts-bottega.md`, cover in `creativi/output/social/W4-bts-cover.png`.
- 🟢� Pre-requisito: riempire segnaposto in negozio (anni attività, prodotto-orgoglio DOP, parentela) + scegliere traccia audio royalty-free con licenza social.

## 2026-06-26 23:40 · @content-social · SISTEMA DI LANCIO Garetti (L6) → primi 50 iscritti
Piano completo (5 canali + funnel + L7): `consegne/content/PIANO-LANCIO-garetti-L6.md`. È il sistema dentro cui vive il post L3 già fatto. Cosa tocca il mondo reale (🟢�/🟢�):
- [x] 🟢� **PRE-CONDIZIONE n°1 — Landing lista d'attesa reale** (1 campo + "primi 50 gratis" + UTM per canale). Senza, OGNI canale converte 0. → @builder-automazioni + @frontend-dev + @cro. *Questo sblocca tutto il resto.*
- [x] 🟢� **Canale 2 (il più ricco) — SÌ di Garetti su 3 cose:** (a) ricondividere il post L3 "La saracinesca" ai suoi clienti, (b) QR + vetrofania in cassa, (c) [opz.] comparire su Libertà. Senza il suo consenso il funnel scende sotto i 50 nel caso peggiore. → richiesta da portare via @vendite/@onboarding-negozi.
- [x] 🟢� **Canale 1 — pubblicare il Contenuto-faro nei gruppi FB locali** (già in coda; CORREZIONE d'onestà obbligatoria: togliere il −22% non confermato + ZTL solo se cifra blindata). Presidio commenti primi 90'.
- [x] 🟢� **Canale 5 — angolo stampa Libertà** ("le botteghe storiche sfidano il delivery, parte da Piazza Duomo") → @pr-stampa, su base §4D del piano. Serve data lancio + consenso Garetti.
- [x] 🟢� **Referral civico** (riga §4C in thank-you page, no budget, gloria non sconto) → @crm-lifecycle. Tenere distinto dal give-get 5€+5€.
- [x] 🟢� **Vetrofania + cartoncino-cassa + QR per Garetti** → @designer (brief §6), check @qa-designer.
- [x] 🟢� **Conferma/blinda dato −22% + cifra ZTL + cap incentivo "primi 50 gratis"** → @analista/@finanza prima di pubblicare.
- **Stato:** chiusa DI FIRMA NICOLA. **Mani social** → @builder-automazioni o pubblicazione manuale.

## 2026-06-26 23:40 · @content-social · 🟢�🟢� PROPOSTA L7 (mossa 10x non richiesta) — Evento "IL PRIMO TURNO" in Piazza Duomo
- **Cosa:** evento civico di lancio nel sabato di apertura — Garetti alza la saracinesca in Piazza Duomo + partono le prime 50 consegne in cargo-bike. Trasforma "iscriviti alla lista" in "sii tra le 50 consegne del Primo Turno". Dettagli: §8 del piano `PIANO-LANCIO-garetti-L6.md`.
- **Perché 10x:** dà a stampa+gruppi FB un EVENTO (data+luogo iconico+immagine forte) → earned media; trasforma l'iscrizione in un rito civico; arruola Vita in Centro/Comune/altre botteghe a costo ≈0; nativamente "Il Turno", incopiabile da Amazon; i 50 iscritti diventano i primi 50 CLIENTI reali (fine dei "0 ordini").
- **Serve:** una data · ok Garetti a fare il "primo turno" in piazza · mini-budget €0-300 · catena @relazioni-istituzionali + @pr-stampa + @designer + @operations.
- **Colore:** 🟢� PROPOSTA — non eseguita. Aspetta valutazione/firma di Nicola.
- **Stato:** PROPOSTA SUL TAVOLO.

## 2026-07-03 11:34 · @content-social · 🟢� Post del giorno "Il turno più lungo di Piacenza" (Pane Quotidiano) — 🟢�
- **Cosa:** pubblicare il post storia-bottega sul faro reale (partner firmato) su @mycity.piacenza (feed+storia) + gruppi FB locali. Gancio verificabile "bio dal 1976" agganciato alla piattaforma "Il Turno".
- **Contenuto pronto + anteprima estesa:** `consegne/content/2026-07-03-POST-turno-piu-lungo-PQ.md` · blocco [[AZIONI-PRONTE]] **A8**.
- **Cosa cambia:** primo ritratto pubblico di un negozio reale MyCity; nome/immagine di Pane Quotidiano nella campagna (città piccola).
- **Se va bene:** il negozio ripubblica ai suoi clienti → primi iscritti caldi; parte il ritmo settimanale del motore "Volti".
- **🟢� Due strade:** (a) versione col **nome+foto** → serve **ok del titolare** (chiedibile nella chiamata A6/#21); (b) versione **neutra tipografica** → pubblicabile subito con sola firma Nicola.
- **Pre-condizione tecnica:** link reale in bio con UTM `turno_pq` (@builder-automazioni). **Mani social** → @builder-automazioni o pubblicazione manuale.
- **Onestà:** gate ONESTA-RULES passato (0 numeri finti, 0 testimonianze, "1976" = fonte pubblica Vita in Centro/Pagine Gialle).
- **Stato:** chiusa DI FIRMA NICOLA.

## 2026-07-06 15:10 · @trust-safety · 🟢�️ Dai il bollino «Negozio Verificato» al primo negozio che se lo merita (#38)
- **Cosa:** far nascere il bollino «Negozio Verificato MyCity» — lo standard di fiducia della città (5 criteri verificabili nei dati) — e assegnarlo al primo negozio che li rispetta tutti. Standard, criteri, idoneità e bozze pronti in `consegne/trust-safety/2026-07-06-badge-negozio-verificato.md` · anteprima estesa [[AZIONI-PRONTE]] **A18**.
- **I 5 criteri (tutti verificabili):** ① identità reale (P.IVA/sede + KYC Stripe) · ② bottega attiva e approvata (≥5 prodotti veri) · ③ pagamenti sicuri (payout Stripe ON) · ④ consegna provata (≥1 consegnato, 0 dispute) · ⑤ regole rispettate (contratto+GDPR, 0 segnalazioni). Il badge si **perde** se un pilastro cade → così vale qualcosa.
- **Idoneità reale oggi (2026-07-06):** **0 verificati, 1 candidato = Pane Quotidiano** (3/5 pilastri; mancano payout ON + 1ª consegna). Casa Linda = demo (esclusa), Garetti = prospect non nel DB (non idoneo). PQ diventa il **1° Negozio Verificato di Piacenza** appena #16 è consegnato + payout acceso.
- **Cosa cambia:** nasce lo standard di fiducia cittadino e il primo negozio reale che consegna si guadagna un bollino visibile a video → segnale di garanzia per i clienti, fossato contro Glovo/Amazon.
- **Se va bene:** diventa il rito di qualità dell'onboarding dei negozi dal 13/7 (entri → payout+catalogo → 1ª consegna → bollino).
- **🟢� Pre-condizioni (onestà):** (a) annuncio pubblico **solo con ≥1 negozio davvero verificato** — mai "lo standard della città" con 0 verificati · (b) mostrare il bollino su PQ = ok Nicola + validazione claim @legale-privacy · (c) 🟢� corsia tecnica: flag `verified` sul profilo (backend-dev) + bollino a video (frontend-dev/CONFIG), in branch, da collegare al via.
- **Stato:** STANDARD DEFINITO (🟢�). Assegnazione + annuncio **chiusa DI FIRMA NICOLA** (condizionati alla prima consegna reale).

## 2026-07-06 16:10 · @seo→@tech · 🟢� Riempi la vetrina di Pane Quotidiano con le parole cercate su Google — APPROVATA
- **Cosa:** scrivere `store_description` (bio dal 1976, pane/pesto/kefir bio, bottega del centro, consegna a domicilio Piacenza) + `store_address` (Via Calzolai 25, Piacenza) sul profilo PQ, così title/meta/OG/schema del sito intercettano *prodotti bio a Piacenza · spesa bio online · pane bio a domicilio · botteghe del centro con consegna*. Comando + JSON pronti in `consegne/seo/2026-07-06-riempimento-vetrine-SEO.md` §1.
- **Approvazione:** Nicola 2026-07-06 «lo approvo e devi farlo con tutti i negozi» (Pannello).
- **Colore:** 🟢� — CONFIG marketplace (`marketplace.mjs aggiorna profiles`), **mai DB clienti, mai deploy**. Backup automatico per riga → **reversibile** (rollback dal backup).
- **Canale/mani:** `node cervello/marketplace.mjs aggiorna` — esegue via Pannello/giro autorizzato (il comando è gated nella chat: prima `leggi` conferma id `c0b240c0…` + valori attuali, poi `aggiorna`).
- **Cosa cambia:** la scheda di Pane Quotidiano su Google smette di uscire con testo generico e inizia a intercettare 5 ricerche bio/consegna del centro — traffico organico gratis verso l'unico negozio reale che può incassare.
- **Se va bene:** stessa cosa in automatico su ogni negozio nuovo (regola-standing sotto) → le 6 botteghe dal 13/7 nascono già ottimizzate.
- **Onestà:** solo fatti verificati (bio dal 1976, indirizzo reale, prodotti a catalogo). "Senza glutine/dietetico" **NON inserito** — linea da confermare col titolare.
- **Stato:** chiusa DI ESECUZIONE (config autorizzato).

## 2026-07-06 16:10 · @onboarding-negozi → @seo · 🟢� Regola-standing: SEO-fill nell'onboarding di OGNI negozio
- **Cosa:** rendere il riempimento vetrina (`store_description` con le parole cercate + `store_address` pieno) un **passo obbligatorio del go-live** di ogni negozio nuovo. Handoff: @onboarding-negozi raccoglie i campi reali → @seo compila il template (`consegne/seo/2026-07-06-riempimento-vetrine-SEO.md` §2) → proposta 🟢� col comando pronto → firma → `aggiorna`.
- **Colore:** 🟢� regola di processo (l'esecuzione per-negozio resta 🟢� firma).
- **Cosa cambia:** "farlo con tutti i negozi" diventa automatico, non un secondo giro manuale; ogni bottega dal 13/7 nasce già ottimizzata per Google.
- **Casa Linda (demo):** esclusa in modo permanente finché resta seed — non si mette un negozio finto nell'indice.
- **Stato:** REGOLA ATTIVA — si applica al primo onboarding dal 13/7.


## 2026-07-06 23:55 · @frontend-dev → @devops-sre · 🟢� Metti il codice fisso «#A42 — nome» su ogni card del Pannello (branch + verifica + PR)
- **Cosa:** ho scritto la modifica che dà a ogni casella del Pannello un'etichetta STABILE visibile nel formato «#codice — nome» (codice + nome sempre insieme, come chiesto). File toccati: `pannello/src/lib/azioni-attesa.ts` (il codice ora è `#A42` col cancelletto + helper `etichettaCasella`), `pannello/src/components/aree/Azioni.tsx` (codice inline col titolo nella card "Da approvare"), `pannello/src/components/aree/Plancia.tsx` (codice + «—» nella lista "Da firmare"). Il codice deriva dall'hash del contenuto dell'azione: NON si rinumera a ogni giro.
- **Perché serve la tua mano:** nella mia sessione i comandi git/typecheck/browser sono bloccati, quindi il branch NON è ancora creato e la modifica NON è stata provata a video. I comandi pronti (copia-incolla dal VPS) sono qui sotto.
- **Colore:** 🟢� — modifica UI in un branch, **nessun deploy**. La PR resta da mergiare a mano (Vercel redeploy solo dopo merge su `main`).
- **Canale/mani:** terminale VPS (git + `npm run dev` per la prova a video) → poi PR su GitHub.
- **Comandi (VPS, cartella `/opt/mycity/ad-mycity`):**
  1. `git checkout -b pannello/etichetta-stabile-card`
  2. `git add pannello/src/lib/azioni-attesa.ts pannello/src/components/aree/Azioni.tsx pannello/src/components/aree/Plancia.tsx`
  3. `cd pannello && npm run build` (verifica typecheck+build verdi) poi `cd ..`
  4. `cd pannello && npm run dev` → apri http://localhost:3000, vai su "Azioni → Da approvare" e sulla Plancia "Da firmare": controlla che ogni card mostri «#codice — nome» sulla stessa riga e che il codice non cambi ricaricando.
  5. `git commit -m "Pannello: etichetta stabile #codice — nome su ogni card della coda"`
  6. `git push -u origin pannello/etichetta-stabile-card` poi apri la PR su `main` (NO deploy diretto).
- **Cosa cambia:** quando l'AD ti scrive «guarda #A42» tu trovi subito quella card nel Pannello — oggi le caselle non hanno numero e non le ritrovi.
- **Se va bene:** merghi la PR su `main`, Vercel ripubblica, il codice è visibile in produzione su ogni card.
- **Stato:** chiusa — branch/verifica/PR da eseguire (bloccati nella mia sessione).


## 2026-07-08 23:03 · @devops-sre → 🟢� Blocca il push del giro se la memoria è incoerente (gate coerenza-fatti + sanità del vault)
- **Cosa:** due innesti in `cervello/giro.sh`, sullo STESSO meccanismo che già blocca su segreti/onestà (`GIRO_PUSH_OK=0`, righe 445-482):
  1. **Ri-eseguire `coerenza-fatti.mjs` prima del push** (accanto a scan-segreti/onesta-check, dopo che l'AI ha scritto — non solo a inizio giro alla riga 217, dove l'AI non ha ancora bonificato). Se `rc≠0` → memoria NON pubblicata su `main` + Telegram «memoria incoerente, giro non pubblicato» via `notifica-approvazioni.mjs`.
  2. **Check di sanità pre-commit del vault:** frontmatter valido, nessun marcatore di conflitto `<<<<<<`/`>>>>>>`, nessun file del vault a 0 byte. Se fallisce → blocca il commit del vault.
- **Perché:** oggi il gate coerenza-fatti è solo un vincolo testuale passato all'AI (righe 217-222): se l'AI non bonifica tutte le copie vecchie di un fatto, il valore vecchio resta e il push parte comunque → il Pannello lo mostra a Nicola come vero. Idem per uno snapshot sporco da rebase/merge in conflitto (righe 88-96) o scritture a metà auto-committate (righe 68-72).
- **Colore:** 🟢� — auto-modifica di `giro.sh` in un branch. Firma obbligatoria (regola: mai toccarsi da sola). **Nessun deploy** (è lo script del VPS, non il sito).
- **Canale/mani:** terminale VPS, @devops-sre, in un branch → prova con la skill `verify` (bats sugli script) → commit.
- **Cosa cambia:** una memoria incoerente o mezza-scritta viene TRATTENUTA sul server invece di finire su `main`; il caso peggiore diventa «un giro non pubblicato + una notifica», mai un dato falso in Cabina.
- **Se va bene:** ogni giro futuro pubblica solo memoria coerente e integra; il rischio pre-mortem della casella è chiuso alla radice.
- **Stato:** ✅ FIRMATA da Nicola («ok», 2026-07-08 23:48) — ora IN ESECUZIONE. Codice scritto e riletto a mano (`giro.sh` modificato + `vault-sanita.mjs` + `avviso-telegram.mjs` + test bats `gate-coerenza-vault-pre-push.bats`), **non ancora provato a runtime** (bash -n / node --check / bats gated in sessione). Restano da Nicola: approvare le verifiche, isolare i 4 file nel branch `ops/gate-coerenza-vault-pre-push` (oggi mescolati col lavoro AR-103), merge (🟢�), e confermare `TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_ID` in `cervello/vps/.env` (altrimenti l'avviso resta dry-run).


<!-- SUPERVISIONE-NEGOZI:INIZIO -->
## 🛡️ Supervisione negozi & prodotti — proposte di riempimento (aggiornato 2026-07-16 20:20)
Report completo con comandi pronti: `consegne/supervisione/2026-07-16-supervisione.md`. Tutte 🟡, con **valore DEDOTTO** (non fornito dal negozio), reversibili (backup versionato per riga).

### 🟡 Metti «nuovo» come condizione ai 252 prodotti che non ce l'hanno

| Colore | Quanti | Cosa cambia | Se va bene |
|---|---|---|---|
| 🟡 | 252 | 252 schede oggi incomplete mostrano condizione = «nuovo» (valore dedotto) ai clienti. | Cataloghi più completi = ricerca/filtri migliori e più fiducia; poi passi al gruppo successivo. Undo: annulla-batch. |

Approva **solo questo gruppo**: «ok riempi condizione». Comando e undo nel report.

### 🟡 Metti «pezzo» come unità di misura ai 242 prodotti che non ce l'hanno

| Colore | Quanti | Cosa cambia | Se va bene |
|---|---|---|---|
| 🟡 | 242 | 242 schede oggi incomplete mostrano unità di misura = «pezzo» (valore dedotto) ai clienti. | Cataloghi più completi = ricerca/filtri migliori e più fiducia; poi passi al gruppo successivo. Undo: annulla-batch. |

Approva **solo questo gruppo**: «ok riempi unità di misura». Comando e undo nel report.


> ⚠️ **Scritture al database: si approva un gruppo alla volta** (niente «ok a tutte»). Ogni gruppo
> è un valore DEDOTTO dalla macchina, non fornito dal negozio; per prezzo/orari/descrizione serve prima
> la conferma del dato dal negozio (restano «da procurare», non li scrive nessun autofill).
<!-- SUPERVISIONE-NEGOZI:FINE -->

---

### 🔴 #pat-decisioni-redazione — Ruota il token GitHub e lasciami cancellare il pezzo rimasto nel diario · ⏳ accodata 2026-07-16 16:55

**Cosa è successo:** nella riga 205 di `DECISIONI.md` è rimasto un frammento di un token GitHub (PAT). Lo scan-segreti lo becca a **ogni giro** e per sicurezza blocca la pubblicazione della memoria: la Cabina non riceve più aggiornamenti freschi finché quella riga resta lì.

**Cosa fare (2 passi):**
1. Su GitHub → Settings → Developer settings → Tokens: **revoca/rigenera** il PAT (se è quello in uso come `GIT_PUSH_TOKEN`, aggiorna anche il `.env` del VPS).
2. Rispondi «ok pat» a questa card: farò **un solo commit di redazione** su DECISIONI.md (`github_pat_…` → `[REDATTO]`), unica eccezione all'append-only, documentata.

**Cosa cambia:** lo scan-segreti torna verde e la memoria riprende a pubblicarsi sulla Cabina a ogni giro.
**Se va bene:** deadlock chiuso; aggiungo un guardiano che rifiuta i commit con pattern di token (così non risuccede).

- **Colore:** 🔴 (rotazione credenziale + eccezione a una regola di memoria — decidi tu)
- **Reparto:** security
- **Origine:** `{origine:auto-radiografia-2026-07-16, difetto:AR-112}`

---

### 🟡 #fix-termometro-guardiani — Firma il pacchetto «termometro vero + guardiani ascoltati» · ⏳ accodata 2026-07-16 16:55

**Il problema in una frase:** la Cabina ti ha mostrato salute **100/100 per 9 giorni mentre la radiografia diceva 0** (uno script sovrascrive il voto), e 4 guardiani (registro agenti, keyword-owner, esperimenti, north-star) escono rossi ma il giro ne scarta l'esito con `|| true`.

**Cosa preparo (branch, nessun deploy):**
- togliere la riga che sovrascrive il voto (`allinea-scan-cantiere.mjs:166`);
- promuovere i 4 guardiani muti al pattern già usato dagli altri (esito catturato → vincolo hard nel giro);
- far leggere al gate-budget un contatore vero (o il numero di chiamate come proxy finché la misura reale non c'è).

**Cosa cambia:** il voto in Cabina torna a dire la verità e un guardiano rosso non può più essere ignorato in silenzio.
**Se va bene:** il cantiere (19 difetti aperti) si chiude con prove vere, e il prossimo «100» sarà guadagnato.

- **Colore:** 🟡 (modifica al codice della macchina in branch — firma tua, regola «mai toccarmi da sola»)
- **Reparto:** tech
- **Origine:** `{origine:auto-radiografia-2026-07-16, difetti:AR-105,AR-106,AR-109,AR-111}`

---

### 🟡 #fix-pannello-bloccanti — Firma il pacchetto «il Pannello risponde»: chat che mostrano le risposte e azioni che non muoiono in coda · ⏳ accodata 2026-07-16 16:55

**I 4 difetti (tutti confermati nel codice, file:riga nel report):**
1. Le chat di caselle/lavori dicono «La risposta non è arrivata» anche quando c'è → il client non chiede mai il dettaglio del lavoro (`parla.ts:113-120`, `ChatCasella.tsx:32-40`).
2. Le chat delle caselle non si salvano mai sul server → refresh = tutto perso.
3. Un'azione approvata che finisce «in coda» non riparte mai e non si può ri-approvare (`api/azioni-pronte/route.ts:72,96-103`).
4. Aprire «Parla con questa casella» cancella la chat dell'Assistente (`page.tsx:1949-1969`).

**Cosa preparo:** fix in branch sul repo AD (cartella `pannello/`), anteprima Vercel per provarli dal telefono, poi merge solo col tuo ok.

**Cosa cambia:** il bottone Approva e le chat tornano affidabili — quello che scrivi al worker non sparisce più.
**Se va bene:** passo ai 4 difetti del tasto INDIETRO (stessi file, fix piccoli) nello stesso branch.

- **Colore:** 🟡 (codice del Pannello in branch — firma tua)
- **Reparto:** frontend-dev
- **Origine:** `{origine:audit-pannello-2026-07-16, difetti:AR-120..AR-123}`
