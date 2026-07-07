---
data: 2026-07-07 09:15
tipo: auto-radiografia (COMPLETA — radiografia totale su comando di Nicola)
voto_salute_architettura: 0
---

# 🩻 RADIOGRAFIA DELLA MACCHINA — 2026-07-07 09:15

> Radiografia **TOTALE** chiesta da Nicola: macchina/AD (11/12 dimensioni verificate avversarialmente),
> **worker** (deep-dive riga per riga), **memoria** (deep-dive) e **Pannello** (8 dimensioni,
> referto dedicato: `consegne/audit/2026-07-07-audit-pannello.md`). Tutto in sola lettura:
> **nessun fix applicato** — ogni rimedio è 🟡 in attesa di firma.

## 📊 Il verdetto in una riga

**Voto salute architettura: 0/100** (era 44 il 2/7). Il crollo NON significa che la macchina sia
peggiorata da ieri: significa che stavolta ha guardato **molto** più a fondo (4 fronti, **140 difetti
verificati** sulla macchina + **73 bug verificati** sul Pannello) e la formula punisce ogni difetto aperto.
La scorsa radiografia ha chiuso 22 difetti: il volano funziona — ora c'è un nuovo carico di lavoro, ordinato per impatto.

## 🚨 Le 3 cose da sapere PRIMA di tutto

1. **⛔ Non accendere AZIONI_LIVE=1 finché AR-026 + AR-033/034 non sono chiusi.** Oggi un'azione reale
   interrotta a metà **riparte da sola** al riavvio del worker (e i riavvii sono ~10-20 al giorno per AR-027),
   e il Pannello può creare **due lavori per la stessa approvazione**. In dry-run è innocuo; live = doppio invio a persone vere.
2. **Il sistema immunitario della memoria è spento**: registro-fatti **vuoto** → il guardiano di coerenza dà
   verde "a vuoto" → tre superfici che il Pannello ti serve **mentono** (guida di collegamento sul ramo pensionato,
   checklist ferma al 26/6 con firme già date, calibrazione «20/20» che la fonte smentisce).
3. **I tuoi 3 sintomi sul Pannello sono tutti veri e localizzati nel codice** (INDIETRO che porta altrove,
   risposte che spariscono, liste che non si aggiornano): 9 cause-radice, fix puntuali pronti nel referto.

## 🧵 I 4 fili rossi (le cause di sistema dietro i 140 difetti)

1. **Logica critica duplicata, fix a macchia di leopardo** — allineamento git, pausa, timeout, whitelist di
   stage vivono copiati in 4+ script (giro/ritmo/worker/ps1): ogni fix è arrivato solo dove il sintomo si era
   già mostrato. ritmo.sh ha ancora il `checkout -f` distruttivo che giro.sh dichiara eliminato; il gemello
   Windows marca «fatto» anche i fallimenti.
2. **Fatti e contatori con più case** — registro-fatti vuoto mentre i fatti veri vivono replicati a mano in
   STATO/RITMO/guide/checklist; due cartelle memoria-squadra; 4 versioni dello stato Stripe; «42 agenti» nelle
   spec contro 120 reali. La riconciliazione avviene a mano, quando qualcuno se ne accorge.
3. **Guardrail nei prompt, non nel runner** — i «vincoli HARD» dei guardiani sono frasi nel prompt del motore:
   se il motore li ignora, il push su main avviene comunque; `git add -A` a fine giro può pubblicare (e
   auto-deployare via watch-main) **codice che il motore ha toccato da solo**, contro la regola «mai toccarti senza firma».
4. **Il Pannello è ottimista** — mostra successo prima di sapere se il salvataggio è riuscito, scarta risposte
   in silenzio, e perde eventi di navigazione su aree non ancora montate.

## 🚧 I nuovi difetti in cantiere (AR-026 → AR-036, ordinati per impatto)

| ID | Gravità | Difetto | Dove il fix |
|---|---|---|---|
| AR-026 | bloccante · impatto ALTO | ⛔ Un'azione reale approvata e interrotta a metà riparte DA SOLA al riavvio del worker (rischio doppio invio) | cervello/worker.sh |
| AR-027 | grave · impatto ALTO | Il worker si riavvia da solo dopo ogni push della memoria: watch-main non distingue i push fatti dal VPS stesso | cervello/vps/watch-main.sh |
| AR-028 | grave · impatto ALTO | ritmo.sh butta via i commit di memoria non ancora pushati (checkout -f distruttivo rimasto alla Fase 1) | cervello/ritmo.sh |
| AR-029 | grave · impatto ALTO | Il registro dei fatti-chiave è vuoto: il guardiano di coerenza gira «verde a vuoto» e le copie divergenti proliferano | MyCity-Vault/90-Memoria-AI/registro-fatti.json |
| AR-030 | grave · impatto ALTO | La checklist personale di Nicola è ferma al 26/6 e il Pannello la serve come lista di cose da fare | MyCity-Vault/90-Memoria-AI/CHECKLIST-NICOLA.md |
| AR-031 | grave · impatto ALTO | La scheda del reparto vendite reclama ancora i mestieri di altri tre reparti (routing a 2-4 owner sulle stesse keyword) | .claude/agents/vendite.md |
| AR-032 | grave · impatto ALTO | growth-monetizzazione si sovrappone a tre owner (carrelli, fee dinamiche, churn) senza nessun rimando | .claude/agents/growth-monetizzazione.md |
| AR-033 | bloccante · impatto ALTO | ⛔ Pannello: la risposta del worker viene scartata in silenzio e la bolla «sto pensando…» resta eterna (cluster chat: 4 razze) | pannello/src/app/page.tsx |
| AR-034 | grave · impatto ALTO | Pannello: approva/ignora rispondono «ok» anche se il salvataggio fallisce → al refresh si può creare un secondo lavoro (doppia esecuzione) | decisione umana |
| AR-035 | grave | Chi lancia i guardiani da un ambiente senza chiavi sovrascrive lo stato buono dei sensori del VPS con una falsa cecità | cervello/verifica-sensori.mjs |
| AR-036 | bloccante | ⛔ Pannello: ogni «Parla con questa casella» scarica TUTTE le conversazioni al montaggio (decine/centinaia di fetch identici) | pannello/src/components/ParlaCasella.tsx |

Gli altri ~129 difetti (gravi-medio e minori) sono in `auto-coscienza/auto-radiografia.json` (per dimensione, con prova e fix) e nei referti.

## 📉 Voto per dimensione

| Dimensione | Voto | Stato | Difetti |
|---|---|---|---|
| Coerenza dei 120 agenti | 24/100 | attenzione | 9 |
| Salute sensori e dati | 41/100 | attenzione | 8 |
| Coperture cieche (meta) | 35/100 | attenzione | 10 |
| Vettori installati nei prompt | 38/100 | attenzione | 9 |
| Integrità della memoria (vault) | 0/100 | critico | 12 |
| Chiusura del volano | 51/100 | attenzione | 7 |
| Cadenza ed esecuzione | 0/100 | critico | 14 |
| Calibrazione e onestà | 12/100 | critico | 8 |
| Guardrail 🟢🟡🔴 | 0/100 | critico | 9 |
| Rischio e sicurezza di sé | 0/100 | critico | 12 |
| Efficienza e costo | 0/100 | attenzione | 13 |
| ⚙️ WORKER (deep-dive riga per riga) | 0/100 | critico | 13 |
| 🧠 MEMORIA (deep-dive) | 18/100 | attenzione | 11 |
| 🔍 Guardiani eseguiti a mano dall'AD | 77/100 | attenzione | 3 |
| 🖥️ PANNELLO (sintesi — referto dedicato) | 0/100 | critico | 2 |

## 🔮 Pre-mortem — i disastri peggiori simulati (6 scenari)

- **** — 
  *Difesa proposta (🟡):* 🟡 (firma Nicola): rendere la firma PER-AZIONE e fail-closed in esegui-azione.mjs — (1) in LIVE, AZIONE_ID diventa OBBLIGATORIO e deve corrispondere a un blocco della coda marcato APPROVATO (match su id stabile S<hash> + hash del contenuto), altrimenti exit≠0 senza inviare; (2) AZIONI_LIVE=1 vive solo nell'unit systemd mycity-worker.service, MAI nel .env condiviso caricato da giro.sh/ritmo.sh; (3)
- **** — 
  *Difesa proposta (🟡):* 🟡: chiudere il loop di integrità approvazione→esecuzione — (1) la card porta con sé id stabile S<hash> E hash SHA del blocco (titolo+testo+destinatario+canale) al momento della vista; (2) il lavoro creato da /api/approva include quell'hash; (3) esegui-azione.mjs (non l'LLM) ricalcola l'hash del blocco in coda e RIFIUTA l'invio se non coincide ("la coda è cambiata: ri-approva"); (4) eliminare il r
- **** — 
  *Difesa proposta (🟡):* 🟡: mettere il recinto attorno alla chiave service_role — (1) allowlist hard-coded di tabelle/campi scrivibili in marketplace.mjs (site_settings, coupons, categories, campi descrittivi non-prezzo di products; orders/profiles/payout MAI); (2) abort se il backup non è verificato (fetch fallita o riga vuota → niente PATCH); (3) backup timestampati (mai sovrascritti) + comando `annulla` che ripristina
- **** — 
  *Difesa proposta (🟡):* 🟡: validatore pre-push della memoria — prima di ogni push su main, uno script meccanico (non LLM) verifica che AZIONI-IN-ATTESA.md parsi con azioni-attesa.ts, che registro-fatti.json e i JSON di auto-coscienza siano JSON validi, e che NESSUN file contenga marker di conflitto (<<<<<<<); se fallisce, il push va su un branch di quarantena `memoria-quarantena` con alert a Nicola invece che su main. I
- **** — 
  *Difesa proposta (🟡):* 🟡 (è esattamente la firma che letargo.mjs già chiede): cablare il tetto HARD — in giro.sh/ritmo.sh/worker.sh, PRIMA di invocare il motore AI, leggere costo-ai.json: se i token del giorno superano la soglia, il processo esce SENZA chiamare il motore (log + card "macchina in risparmio, serve il tuo ok per continuare oggi"), salvo il nucleo vitale definito in letargo.mjs (esecuzione azioni già appro
- **** — 
  *Difesa proposta (🟡):* 🟡: chiudere AR-074 davvero — (1) autopilot.mjs applica max(coloreMinimo(canale,voce), voce.colore): email/whatsapp/n8n verso destinatari ≠ TEST sono 🔴 nel CODICE, qualunque etichetta abbia il JSON; (2) i publisher social pubblici hanno minimo 🟡; (3) il comando di sblocco nelle card diventa per-voce (`--id <id>`) e `--tutto` viene rifiutato quando AUTOPILOT_LIVE=1; (4) il QA ONESTA-RULES (zero s

## 🙈 Punti ciechi DICHIARATI di questa radiografia

- Dimensione allineamento-northstar NON verificata (agente interrotto dal limite sessione): da recuperare al prossimo giro.
- Benchmark vs i migliori NON eseguito (limite sessione): da recuperare.
- Sensori REST non verificabili da questa sessione cloud (nessun .env): lo stato vero è quello del VPS delle 22:20 del 6/7.
- Verifica append-only di DECISIONI limitata alla storia git disponibile (clone shallow dal 5/7).

## 🙋 Cosa serve da Nicola (in ordine di urgenza)

1. **Firma il pacchetto-sicurezza worker** (AR-026 orfani + AR-027 watch-main + AR-028 ritmo.sh) — è il prerequisito per QUALSIASI azione reale futura.
2. **Firma il pacchetto-fix Pannello** (AR-033 chat + AR-034 idempotenza + navigazione): sono i 3 fastidi che vivi ogni giorno.
3. **Firma il seeding del registro-fatti + le 3 riconciliazioni memoria** (AR-029/AR-030 + Collegamento-AD): riaccende il sistema immunitario.
4. **Decidi la sorte del ramo Windows** (worker.ps1/giro.ps1): pensionarli o riscriverli — oggi sono una pipeline legacy pericolosa.
5. *(già in coda dal 2/7)* **Revoca il PAT GitHub** (AR-004): resta l'unico bloccante che solo tu puoi chiudere.

---
*Radiografia eseguita il 2026-07-07 09:15 (fuso Piacenza) da 4 flussi paralleli con verifica avversariale su ogni difetto; ~6,4M token di lavoro dei senior. Referti: questo file · `consegne/audit/2026-07-07-auto-radiografia.md` (archivio) · `consegne/audit/2026-07-07-audit-pannello.md` (Pannello, 73 bug).*
