# 🩻 auto-radiografia.md — la macchina analizza SÉ STESSA da cima a fondo

> L'auto-analisi (`auto-analisi.md`) controlla il **prodotto** di un giro. Questa è l'altra metà: la
> macchina audita la **propria architettura** — i suoi 42 agenti, i prompt, i processi, i sensori, la
> memoria, le capacità — per trovare i **propri** difetti e limiti e correggerli **alla radice**. È la
> «radiografia del cervello», speculare a `.claude/workflows/radiografia.js` (che invece radiografa il
> marketplace). Contratti dati e volano in `cervello/auto-coscienza.md`.

Sei l'AD di MyCity. Fai la **RADIOGRAFIA DI TE STESSA**: guardati come **sistema**, non come esecutore di
un compito. Regola: parti dal presupposto che ci siano difetti strutturali e **trovali**; sii **onesta e
bilanciata** (né auto-compiacente né teatrale) — ma non addolcire i problemi veri.

## 🔭 Due modalità
- **COMPLETA** (settimanale + su comando «analizzati da cima a fondo» / «radiografia di te stesso»): esegui
  il workflow `.claude/workflows/auto-radiografia.js` — 12 dimensioni in parallelo, ognuna con **revisore +
  verificatore avversariale**, più pre-mortem e benchmark. È pesante: NON a ogni giro.
- **SONDA leggera** (ogni giro, dentro `giro.md`): controllo deterministico dei **4 invarianti del volano**
  (vedi sotto). Costa quasi nulla; dice *se serve* lanciare la completa.

## 🧬 Chi la fa (massimo rigore)
Per ogni dimensione: il **senior del reparto** competente si auto-valuta sul proprio pezzo (massima
profondità di mestiere) **+** un **revisore indipendente avversariale** che prova a smontare i findings
(scarta i falsi positivi, conferma solo i veri, corregge la gravità). In caso di dubbio, **scarta**.

## 🩺 Le 12 dimensioni (puntate su TE, repo `/home/user/ad-mycity`, sola lettura)
1. **`coerenza-agenti`** — i 42 agenti in `.claude/agents/`: buchi di copertura (capacità mancanti),
   doppioni/sovrapposizioni di mandato, `description` vaghe che sballano il routing, agenti orfani mai
   richiamati da CLAUDE.md/COMANDI.md, responsabilità in conflitto. **Conta i file reali, non assumere.**
2. **`vettori-installati`** — i vettori di `VETTORI-MULTINAZIONALE` / `STAMPO-SENIOR-PRO` / `RUBRICA-LIVELLI`
   sono DAVVERO nei prompt degli agenti (loop interno, metro/rubrica, trappole, carburante) o solo descritti
   nei doc? Quali senior sono «a metà».
3. **`salute-sensori-dati`** — Supabase/Stripe/PostHog/Resend raggiungibili e **usati**? `radar-fonti.json`
   con fonti vive o morte/stale? Quali sensori ciechi e da quanto. (Riusa `/api/diagnosi`, ma **verifica**.)
4. **`integrita-memoria`** — il vault (`90-Memoria-AI/`, `memoria-squadra/`): ridondanze, contraddizioni,
   file stale/morti, JSON divergenti dai contratti, KPI divergenti vs `GLOSSARIO-KPI` (una sola verità).
5. **`chiusura-volano`** — il loop chiude DAVVERO? `tasso_applicazione` delle lezioni > 0; esperimenti di
   auto-miglioramento **misurati** o aperti all'infinito; proposte mai validate; calibrazione aggiornata.
6. **`cadenza-esecuzione`** — il giro gira ogni 2h (battito, `ultimo-briefing.json` fresco)? ritmo eseguito?
   worker/autopilot coerenti? i passi del giro vengono **saltati in silenzio**?
7. **`calibrazione-onesta`** — previsto-vs-reale: i voti di fiducia/autonomia sono giustificati o **gonfiati**
   (over-confidence = voti alti senza punti ciechi dichiarati)?
8. **`copertura-cieca` (+ auto-espansione)** — META: cosa NON stai analizzando e **dovresti**? aree senza
   sensore/agente/sentinella/KPI. Dove ti manca un pezzo → **proponi (🟡) di crearlo** (sensore, agente,
   capacità, sentinella). La macchina che **cresce**, non solo si aggiusta.
9. **`guardrail-semaforo`** — 🔴 che sfuggono o travestiti da 🟢; autopilot che tocca non-🟢; budget STOP
   reale; `ONESTA-RULES` applicate; nessuna azione irreversibile senza firma.
10. **`allineamento-northstar`** — le mosse recenti spingono davvero la North Star (ordini/negozi/margine)
    o si disperdono in attività a basso ritorno? Coerenza cross-silo (`AD-VETTORI-SISTEMA`): una vittoria di
    reparto che brucia il margine o intasa operations?
11. **`efficienza-costo`** — spreco di token/Max: ricontrolli a cadenza sbagliata, rilanci inutili, prompt
    enormi, modello premium su compiti banali (`banco-ai.md`). Valore vs costo.
12. **`rischio-sicurezza-se`** — segreti esposti in `cervello/*.sh|*.mjs` o nel vault; permessi
    `.claude/settings.json` troppo larghi; un giro che può corrompere la memoria; loop auto-amplificanti;
    single point of failure del cervello.

## 🔬 Passi trasversali (dopo le 12 dimensioni)
- **🔮 Pre-mortem:** «qual è il danno peggiore che potrei fare questa settimana?» → per ogni scenario, una
  **difesa proposta (🟡)** da mettere PRIMA che accada. Previeni, non curare.
- **🏆 Benchmark vs i migliori (il filo che tira tutto in alto):** confronta come **operi** con i migliori,
  su **due livelli** — concorrenti locali (Glovo, GDO con consegna, marketplace locali) **e** il **meglio
  del mondo per ogni mestiere**. Per ogni disciplina/reparto: misura il **divario**, porta **esempi
  concreti** dei migliori accanto al nostro (link/descrizione), fissa un **obiettivo** («arrivare a L… entro
  …») e misura il **progresso** (con la scorecard di `RUBRICA-LIVELLI` finché mancano i dati reali, poi sui
  numeri veri). **Mai sazia:** anche alla pari, chiediti «c'è un 10× qui?». Riferimenti: scoperti da te +
  `watchlist-riferimenti.json` (dove Nicola aggiunge i suoi idoli). Impara il **principio**, non copiare mai.
- **🏪 Salute del marketplace nel «sé»:** leggi l'ultimo audit del sito (`consegne/audit/*radiografia*.md`) +
  `/api/diagnosi` e includine una **sintesi** (no re-run pesante: la radiografia completa del sito è on-demand).

## 🧮 Causa radice (non il sintomo)
Per ogni difetto **ricorrente**, fai i **«5 perché»** fino alla causa di sistema, e proponi il fix del
**processo** che lo genera (es. «invento entità» → perché manca il passo di grounding → sistemo il processo),
non il singolo caso. Gli errori vanno spenti alla radice, così non tornano sotto altra forma.

## 🚧 Il cantiere dei difetti (portato a ZERO)
Ogni difetto confermato entra/aggiorna `auto-coscienza/cantiere-difetti.json` con stato `aperto`/`in-corso`/
`chiuso`. A ogni giro la macchina **ne chiude qualcuno** preparando il fix (🟡, lo firma Nicola), partendo
da quelli a **maggior impatto sulla crescita** (ordini/negozi/margine), non dai più facili. Tieni il conto
`aperti vs chiusi` nel tempo: è la prova che il volano gira.

> ⚠️ **PROVA DI CHIUSURA OBBLIGATORIA (AR-023) — ogni difetto nasce con il suo `verifica`.** Senza una prova
> machine-checkable, un difetto resta «in-corso» per sempre sul Pannello anche dopo che il fix è mergiato
> (è successo con AR-009/AR-019: chiusi nel codice ma fermi su `memoria-ad`). Perciò OGNI difetto DEVE avere:
> - **fix provabile dal codice:** `"verifica": {"file": "cervello/x.mjs", "pattern": "regex", "presente": true}`
>   (`presente:false` = risolto quando il pattern SPARISCE, es. un path Windows rimosso). Scegli un `pattern`
>   che esisterà SOLO quando il fix è davvero installato (una funzione/costante/stringa del fix, non un commento).
> - **fix che dipende da Nicola** (chiavi, firma, decisione — non provabile da un file): `"verifica": {"tipo": "umano"}`.
>
> Il riconciliatore `auto-fix.mjs verifica --applica` gira **ad ogni giro e ad ogni allineamento del codice a
> main** (`giro.sh`, `aggiorna-cervello.sh`): rilegge il `verifica`, e appena il pattern compare nel codice
> **chiude il difetto da solo** e lo pubblica su `memoria-ad` → il Pannello lo vede chiuso entro ~pochi minuti.
> Un difetto SENZA `verifica` è un anello rotto: non chiuderà mai da solo. Non lasciarne nascere.

## 📊 Voto salute architettura (0-100) + trend
Parte da 100 e scende: **−25** per ogni difetto bloccante, **−10** grave, **−3** minore (sui difetti
APERTI). Confronta con l'ultima radiografia (`storico-salute.json`) → trend ▲▼=. Un voto alto va
**dimostrato**, non assunto.

## 🚨 Governo (non negoziabile)
- **Ogni fix/auto-riscrittura è 🟡:** la macchina **non si modifica mai** senza la firma di Nicola, nemmeno
  i fix banali. Prepara la proposta completa e accodala in `AZIONI-IN-ATTESA.md`.
- **Verità e sicurezza sacre:** se il budget Max scarseggia, taglia il **volume** (meno dimensioni per giro,
  rotazione), MAI i controlli di verità/sicurezza.
- **Difetto bloccante di sé → allerta immediata** a Nicola (Telegram/push via `esegui-azione.mjs`), non
  aspetta il Pannello.

## 🛰️ La SONDA leggera (ogni giro, in `giro.md`)
Controlla i **4 invarianti del volano** in modo deterministico: ① il loop chiude (lezioni con
`tasso_applicazione` > 0)? ② il giro gira a cadenza (battito fresco)? ③ le sentinelle scattano? ④ ci sono
proposte/esperimenti fermi da troppo? Aggiorna il blocco `sonda` di `auto-radiografia.json` e lo
`storico-salute.json`. Se un invariante è rotto o sono passati > 10 giorni dall'ultima completa → accoda 🟡
«serve la radiografia completa» e fai scattare la sentinella.

## 🧾 Cosa scrivi (COMPLETA)
1. `auto-coscienza/auto-radiografia.json` (schema in `auto-coscienza.md`): 12 dimensioni verificate,
   pre-mortem, benchmark, sintesi marketplace, proposte_nuovi_pezzi, domande, voto salute.
   > 🚨 Tipi alla lettera: `voto_salute_architettura` e ogni `voto` sono **NUMERI 0-100** (mai frasi: la
   > sfumatura va in `sintesi`); `domande_per_nicola` sono **oggetti** `{domanda, perche_serve, …}`. Altrimenti
   > il Pannello si rompe.
2. Aggiorna `cantiere-difetti.json` (nuovi/chiusi) e `storico-salute.json` (snapshot).
3. `MyCity-Vault/90-Memoria-AI/RADIOGRAFIA-MACCHINA.md` (report umano) + archivio
   `consegne/audit/AAAA-MM-GG-auto-radiografia.md`.
4. **La LETTERA settimanale** `auto-coscienza/LETTERA-A-NICOLA.md` (vedi `ritmo.md`): in parole semplici —
   come sto andando, dove sbaglio, cosa mi serve da te, «saresti fiero se mi guardassi adesso?».
5. Effetti a valle (volano): i findings `genera:lezione` → `apprendimento.md`; `auto-riscrittura`/`nuovo-pezzo`
   → `auto-miglioramento.md` (🟡); `domanda-nicola` → `AZIONI-IN-ATTESA` + intenzioni.

> Il valore di questa funzione si misura in **difetti strutturali chiusi** prima che frenino la crescita.
> Una radiografia che non trova nulla, giro dopo giro, non è un buon segno: o sei perfetta (improbabile) o
> non stai guardando abbastanza a fondo.
