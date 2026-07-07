---
name: verify
description: >-
  Verifica end-to-end (osservazione a runtime) delle modifiche al repo AD MyCity, su due superfici reali:
  (1) il Pannello Next.js in `pannello/` guidato con Playwright headless (Chromium già installato); (2) gli
  script bash del worker/cervello in `cervello/*.sh` testati con bats-core, senza VPS. Usa questa skill dopo
  ogni modifica non banale per PROVARE che il cambiamento fa quello che deve, guidando l'app vera — non i test,
  non il typecheck. Copre i round di fix del cantiere (worker, memoria, Pannello).
---

# Verifica di progetto — AD MyCity

> **La verifica è osservazione a runtime.** Costruisci, avvii, guidi fino a dove il codice cambiato
> viene eseguito, e catturi cosa vedi. Quella cattura è la prova. Non lanciare `next lint` né `tsc`
> come surrogato: dimostrano che sai far girare la CI, non che il fix funziona.

Scegli la corsia in base a cosa hai toccato. Un round può toccarne più di una.

---

## 🖥️ Corsia A — Pannello (Next.js, superficie = pixel)

Per ogni modifica sotto `pannello/src/**` (chat, navigazione/INDIETRO, liste, azioni, stati async).

### Setup (una volta per sessione)
```bash
cd /home/user/ad-mycity/pannello
[ -d node_modules ] || npm install --no-audit --no-fund      # ~1-2 min la prima volta
PORT=3939 nohup npm run dev > /tmp/pannello-dev.log 2>&1 &    # boota in ~2.5s, home 200 in ~12s (prima compile)
# attendi che risponda:
for i in $(seq 1 40); do curl -fsS -o /dev/null http://127.0.0.1:3939/ && break; sleep 1; done
```
Il Pannello boota **anche senza chiavi** (degrada a "non collegato"): sufficiente per provare UX,
navigazione, stato chat, race. Per provare i dati veri servono le env di `pannello/.env.example`
(GitHub/Supabase) — quando mancano, verifica la LOGICA e dichiara quale ramo-dati non hai esercitato.

### Guidare con Playwright
Il modulo `playwright` NON è dep del Pannello: vive nel global. Caricalo con `createRequire` e punta
i browser preinstallati. Template già pronto: `cervello/test/pw-driver.mjs` (vedi sotto).
```bash
SC=/tmp/pw PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node cervello/test/pw-driver.mjs <url> <nome-screenshot>
```
Gotcha che costano tempo:
- **ESM + NODE_PATH non funziona** per importare playwright. USA `createRequire('/opt/node22/lib/node_modules/')`.
- Sempre `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers` (Chromium è lì; niente `playwright install`).
- Viewport **mobile 390×844**: il Pannello è usato da telefono, molti bug (safe-area, target touch, INDIETRO) si vedono solo lì.
- Cattura `console`/`pageerror`: un errore runtime silenzioso è un finding.
- Porta dedicata (3939) e `tmux`/nohup isolati: non condividere stato con altri processi.

### Flussi che vale la pena guidare (i punti caldi della radiografia 2026-07-07)
- **Chat**: manda una domanda → cambia sezione mentre "sto pensando…" → torna → la risposta deve essere lì e nella chat GIUSTA (bug AR-033).
- **INDIETRO**: apri Azioni › una scheda diversa da "Mosse" → vai in Numeri → premi INDIETRO → devi tornare sulla scheda di prima, non su "Mosse".
- **Liste**: approva/ignora una card → deve sparire e NON ricomparire al refresh (bug freschezza/idempotenza).
- **Deep-link**: da Bussola/Plancia "vai all'azione" → deve aprire la scheda giusta, non il default.

Prova SEMPRE almeno un percorso 🔍 fuori dal happy-path (doppio clic, refresh a metà, cambio-chat in volo).

---

## ⚙️ Corsia B — Worker / cervello (bash, superficie = la CLI dello script)

Per ogni modifica sotto `cervello/*.sh` (giro, ritmo, worker, allineamento git, lock, pausa, claim coda).

### bats-core senza installazione
```bash
npx --yes bats cervello/test/<nome>.bats        # provato: funziona in questo ambiente
```
I test vivono in `cervello/test/*.bats`. Scrivili in modo che NON tocchino il mondo reale:
- **git**: opera in un repo temporaneo (`mktemp -d` + `git init`), mai sul repo vero.
- **rete/Supabase/Stripe**: stub dei comandi (`curl`, `node …`) con funzioni fittizie o `PATH` fasullo.
- **niente push, niente systemctl, niente deploy**: la superficie è il comportamento dello script (exit code,
  cosa scrive, cosa NON fa), non l'effetto su produzione.

Cosa provare (i difetti del round 1 — worker):
- **AR-026**: un orfano `esegui-azione`/`proposta` NON deve mai tornare `in_attesa` da solo (deve andare in "riapprova").
- **AR-027**: `watch-main` con `REMOTE_SHA == HEAD locale` NON deve riavviare il worker.
- **AR-028**: `ritmo.sh` non deve fare `checkout -f -B` che scarta commit non pushati.
- **claim atomico**: due prese concorrenti dello stesso lavoro → solo una vince.
- **pausa fail-closed**: se la lettura della pausa fallisce, il worker NON prende lavori.

Quando lo script richiede il VPS o chiavi che qui non ho, verifico la logica in isolamento e
**dichiaro** quale ramo (deploy reale, push su main) non ho esercitato e perché.

---

## Report (sempre inline, alla fine)
Verdetto **PASS / FAIL / BLOCKED / SKIP** + Claim + Method + Steps (ogni step = una cosa fatta all'app che
gira + cosa ho osservato, con evidenza: screenshot per il Pannello via `SendUserFile`, cattura output per bats)
+ Findings (anche gli attriti, non solo i bug). Almeno un passo 🔍 fuori dal happy-path. Nel dubbio, **FAIL**.

> Governo: la verifica è 🟢 (sola osservazione). I fix restano 🟡: il merge in `main` di Nicola è la firma;
> il VPS auto-deploya da `main`, quindi non mergiare WIP non verificato.
