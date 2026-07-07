---
tipo: auto-radiografia
titolo: "🩻 Radiografia della MACCHINA (l'AD digitale) — profonda e COMPLETA"
data: 2026-07-03 14:30
voto_salute: 57
tipo_run: completa (12/12 dimensioni + pre-mortem + benchmark)
stato: "COMPLETA — 74 difetti macchina confermati (1 bloccante · 39 gravi · 34 minori). 9 chiusi (bonifica). 69 aperti nel cantiere."
colore: 🟢 analisi · 🟡 i fix (firma Nicola)
---

# 🩻 Radiografia della MACCHINA — 3 luglio 2026 (completa)

> La macchina che guarda **sé stessa** (il cervello dell'AD), non il sito.
> Comando di Nicola: *"fai una radiografia profonda e completa della macchina/AD/pannello"*.
> Ogni difetto è passato dalla **verifica avversariale**. Il primo run si è fermato a 4/12 per il limite di sessione; ripreso dopo il reset, ora **12/12 completo** + pre-mortem + benchmark.

## 📊 Verdetto
**Salute architettura: 57/100** (media dei 12 pilastri). In calo dal 72 del 28/6 — ma quel giro trovò **3** difetti, questo ne conferma **74** (1 bloccante, 39 gravi). È una radiografia **enormemente più profonda**: un voto che scende perché guardi meglio è una buona notizia.

**Voti per dimensione:** coerenza-agenti 71 · vettori-installati 75 · salute-sensori-dati 62 · integrità-memoria 62 · chiusura-volano 57 · cadenza-esecuzione 57 · calibrazione-onesta 61 · copertura-cieca 50 · **guardrail-semaforo 36 (CRITICO)** · allineamento-northstar 67 · efficienza-costo 44 · rischio-sicurezza-se 41.

## 🔴 IL BLOCCANTE (guardrail-semaforo)
**L'AUTOPILOT pubblica da solo i 🟡 (post pubblici sul brand) in LIVE.** Il cancello di colore in `autopilot.mjs:120` è `if (LIVE && voce.colore === "rosso")`: blocca **solo** il rosso, quindi tutto ciò che è 🟡 (o ha il colore scritto male) **viene pubblicato senza la tua firma** — e 5 voci su 6 del calendario editoriale sono marcate «giallo». Contraddice la regola d'oro «pubblicare = 🔴». *Fix:* gate **fail-closed** — pubblica solo se `colore === "verde"`, tutto il resto si accoda e ti avvisa. **(AR-072, va chiuso subito)**

## 🔴 Il filo rosso (la causa-radice comune a TUTTE le 12 dimensioni)
Due pattern si ripetono ovunque:
1. **«Scritto ma non installato come binario che produce»** — lo strato 7 (scorecard) è nei 42 prompt ma 36/41 quaderni sono vuoti; ONESTA-RULES esiste solo come prosa; North Star e «STOP se un reparto brucia budget» vivono solo in OKR; il router costo economico è **codice morto** (nessun compito ci passa mai).
2. **Gate fail-open / guardiani ciechi** — il cancello colore lascia passare tutto ciò che non è esattamente «rosso»; il kill-switch PAUSA fallisce **aperto** (se non legge lo stato, il giro parte lo stesso); lo scanner-segreti non riconosce il token `sbp_`; il guardiano anti-orfano usa match a sottostringa.

Sotto tutti: **mancano guardiani/validatori deterministici** che rendano *obbligatorio e misurabile* ciò che i documenti predicano.

---

## 🩺 Le 12 dimensioni — i difetti che pesano di più

### 🛡️ guardrail-semaforo — 36 (CRITICO)
- 🔴 **BLOCCANTE** — Autopilot pubblica i 🟡 in LIVE (AR-072, sopra).
- 🟠 Gate colore **fail-open**: colore mancante/scritto male → pubblica lo stesso (AR-073).
- 🟠 Il colore è auto-dichiarato nel JSON, scollegato dal canale reale (nessuna fonte-di-verità canale→rischio) (AR-074).
- 🟠 **ONESTA-RULES senza guardiano machine-checkable** nel percorso di pubblicazione: i testi con segnaposti/numeri finti possono uscire (AR-075).

### 🔒 rischio-sicurezza-se — 41
- 🟠 **Lo scanner-segreti non riconosce `sbp_`** — il token più potente della macchina (gestione Supabase) può finire committato (AR-096).
- 🟠 **Un solo token `sbp_` sovra-privilegiato** serve entrambi gli MCP: le chiavi di tutta l'org in un'unica credenziale (AR-097, domanda per te).
- 🟠 **L'MCP memoria è in lettura+scrittura senza `--read-only`**: il cervello può fare DROP/DELETE della propria memoria via SQL (AR-098).
- 🟠 **worker.sh risolve i conflitti con `--theirs` cieco**: può cancellare un «FATTO» e causare un **doppio invio reale** (AR-099).
- 🔸 Kill-switch PAUSA fail-open (AR-100); `.claude/settings.json` con path Windows stantii; il voto salute si auto-gonfia (+2 a ogni chiusura, solo in salita).

### 💸 efficienza-costo — 44
- 🟠 Il **router costo** (banco-ai) è codice morto: nessun compito va mai al modello economico (AR-089).
- 🟠 Il **budget token è cieco** (AR-020): nessuno passa i token reali, la soglia 2M non scatta mai (AR-090).
- 🟠 La **metabolizzazione raddoppia il costo di ogni chat** con motore premium, senza gate di valore (AR-091).
- 🟠 Rilanci ciechi (loop 3× che riprovano anche su quota) (AR-092); delta-gate protegge solo `giro`, non `ritmo`/`monitora` (AR-093).

### 🔭 copertura-cieca — 50
- 🟠 **Nessun sensore di uptime del sito**: se il marketplace è giù, la macchina è cieca (AR-084).
- 🟠 **Rischi 🔴 di compliance** (HACCP, rider, età 18+, bus factor) senza owner né monitor (AR-085).
- 🟠 **Funnel/conversione al checkout senza sensore live** (AR-087) e **puntualità consegne** (la promessa core) senza sensore (AR-088).

### ⏱️ cadenza-esecuzione — 57
- 🟠 Nessun guardiano vigila che il **battito 2h sia vivo** (la staleness è solo un display passivo) (AR-056).
- 🟠 Timer orfani mai abilitati; i **timeout esterni sono più corti del budget dei retry** (i 3 tentativi sono di fatto morti) (AR-058); `aggiorna-cervello.sh` non ripropaga le unit systemd.

### 🔁 chiusura-volano — 57
- 🟠 `tasso_applicazione` è **scritto a mano**, nessuno lo calcola (AR-051); la prova-chiusura usa contatori **all-time** (loop_chiude resta true per sempre) (AR-052); la calibrazione non fa lo sweep di scadenza (le previsioni marciscono aperte) (AR-053).

### 🎯 calibrazione-onesta — 61
- 🟠 **L'autonomia si guadagna anche coi sensori ciechi** (AR-061); l'esito «reale» entra **senza fonte** → la macchina può auto-alimentare il proprio punteggio (AR-062); la sonda si auto-certifica «loop chiude» con previsioni ancora aperte (AR-063).

### 🧭 allineamento-northstar — 67
- 🟠 **Silo di allocazione conclamato ma mai corretto**: 13 asset pesanti su Garetti (prospect non firmato) vs 1-2 sui negozi confermati — il guardiano esce con errore ma `giro.sh` lo scarta con `|| true` (AR-081).
- 🟠 North Star e «STOP se brucia budget» solo prosa: nessuno script misura se le mosse muovono ordini/negozi/margine (AR-082). Il **faro contraddittorio** è consolidato in **AR-044**.

### Le prime 4 (già nel report parziale): coerenza-agenti 71 · vettori-installati 75 · salute-sensori-dati 62 · integrità-memoria 62
Difetti-chiave: guardiano registro orbo (AR-024), AR-008 keyword duplicate (AR-027), strato 7 che non impara (AR-029), sensore-cassa sordo (AR-035), cecità dati muta (AR-037), contratto Supabase/Stripe (AR-043), faro (AR-044).

---

## 🔮 Pre-mortem — i 6 disastri più plausibili (difese 🟡 da mettere PRIMA)
1. **[ALTA] Memoria corrotta pubblicata nella Cabina** (JSON rotto / DECISIONI sovrascritte su memoria-ad) → gate `valida-memoria.mjs` in `giro.sh` accanto a scan-segreti (blocca il push se la memoria non valida).
2. **[MEDIA] Messaggio/soldi al destinatario o importo sbagliato** (l'esecutore ricostruisce il comando da prosa, non da dato strutturato) → esecutore fail-closed su blocco machine-readable (canale/destinatario/importo).
3. **[MEDIA] Doppia esecuzione** (doppio merge/email/payout) → `action_id` stabile + ledger append-only idempotente. *(È il bloccante del Pannello + AR-099.)*
4. **[MEDIA] Pubblicazione automatica non voluta** verso canali pubblici → `autopilot.mjs` fail-closed. *(= AR-072.)*
5. **[MEDIA] Il kill-switch non ferma la macchina** (pausa fail-open) → logica fail-safe: se lo stato pausa non è leggibile, il giro **si ferma**.
6. **[MEDIA] Loop che brucia budget/compute** → soglia costo come cancello HARD prima della parte AI.

## 🏆 Benchmark vs i migliori — dove il divario è ALTO
- **Contenuti:** da 0 asset pubblicati a **una rubrica fissa settimanale** reale.
- **Onboarding negozi:** portare **almeno 1 negozio vero** a un primo incasso end-to-end.
- **Funnel/CRO:** azzerare gli ordini fermi (oggi: 1 ordine COD €19,05 fermo) e i carrelli non recuperati.
- **CRM:** attivare il **primo flow automatico** (abbandono carrello via Resend, già disponibile).
- **Consegne:** eseguire la **prima consegna reale** end-to-end (mai avvenuta).

Il filo del benchmark è coerente con la radiografia: la macchina ha ottima **impalcatura** ma **zero output reale nel mondo** — il gap coi migliori non è di sofisticazione, è di **fare la prima cosa vera**.

---

## 🚧 Cantiere: 69 aperti · 9 chiusi
Tutti fix **🟡 (firma tua)** o **🔴/decisione tua**, ognuno con `verifica` machine-checkable → `auto-fix.mjs` li chiude da solo quando il fix entra nel codice.

**Da attaccare per primi (bloccante + impatto alto):**
`AR-072` autopilot pubblica i 🟡 · `AR-096/098/099` sicurezza (segreti/DROP-memoria/doppio-invio) · `AR-029` strato 7 · `AR-035` cassa sorda · `AR-037` cecità dati · `AR-081` silo allocazione · `AR-044` faro (serve la tua decisione).

## 🙋 Cosa mi serve da te (4 decisioni)
1. **Qual è il negozio-faro** — Casa Linda o Pane Quotidiano?
2. **STAMPO su 42/42 non validato**: test prima/dopo su 1-2 reparti, o accetti così?
3. **PostHog è instrumentato?**
4. **Token Supabase `sbp_`**: ne creo di separati e a privilegio minimo per i due MCP? (oggi è un'unica super-chiave)

## Pannello
Audit dedicato: `consegne/design/2026-07-03-radiografia-pannello.md` — **30 bug, 1 bloccante** («Annulla» → doppia esecuzione azione reale), 11 gravi.
