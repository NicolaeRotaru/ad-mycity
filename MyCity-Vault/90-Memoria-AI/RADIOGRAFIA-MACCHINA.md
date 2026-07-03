---
tipo: auto-radiografia
titolo: "🩻 Radiografia della MACCHINA (l'AD digitale) — profonda, su comando"
data: 2026-07-03 14:07
voto_salute: 68
tipo_run: completa-parziale
stato: "PARZIALE — 4/12 dimensioni verificate a fondo (limite di sessione, reset 11:20 UTC). 27 difetti macchina confermati. Da completare: 8 dimensioni + pre-mortem + benchmark."
colore: 🟢 analisi · 🟡 i fix (firma Nicola)
---

# 🩻 Radiografia della MACCHINA — 3 luglio 2026

> Questa è la macchina che guarda **sé stessa** (il cervello dell'AD), non il sito.
> Comando di Nicola: *"fai una radiografia profonda e completa della macchina/AD/pannello"*.
> Ogni difetto qui sotto è passato dalla **verifica avversariale** (un secondo agente che prova a smontarlo).

## ⚠️ Onestà prima di tutto: questo giro è PARZIALE
Il limite di sessione (reset **11:20 UTC**) ha ucciso a metà il workflow: hanno completato **review + verifica** solo **4 dimensioni su 12**, e sono saltati **pre-mortem** e **benchmark vs i migliori**. Le 8 dimensioni mancanti hanno i findings grezzi ma **non verificati** → per disciplina **non entrano nel cantiere** finché non passano la verifica. **Le completo dopo il reset**, partendo dalle 2 🔴-critiche (`guardrail-semaforo`, `rischio-sicurezza-se`).

**Voto salute: 68** = media dei 4 pilastri verificati. Non confrontarlo brutalmente col 72 del 28/6: quel giro trovò **3** difetti, questo ne conferma **27**. È una radiografia **più profonda e più onesta**, non una regressione. Un voto che scende perché guardi meglio è un buon segno.

## 🔴 Il filo rosso (la causa-radice comune)
Tanti strati della macchina sono **«scritti/descritti ma non installati come binario che produce»**:
- lo **strato 7** (scorecard/calibrazione) è in tutti i 42 prompt, ma **36/41 quaderni sono vuoti** e **0 scorecard** registrate;
- il **sensore-cassa** (il rischio esistenziale n.1) calcola il runway e **scrive un file che nessuna sentinella legge**;
- il **contratto** `salute_macchina` è divergente → i due tile **Supabase/Stripe del Pannello sono sempre spenti**;
- il **«faro»** ha **due verità opposte** (Casa Linda nella memoria vs Pane Quotidiano nella costituzione).

La radice sotto tutti: **mancano guardiani/validatori deterministici** che rendano *obbligatorio e misurabile* ciò che i documenti predicano. La macchina si fida della disciplina dell'LLM dove servirebbe un gate.

---

## 🩺 Le 4 dimensioni verificate

### 1) coerenza-agenti — voto 71 (attenzione)
- 🟠 **GRAVE — Il guardiano del registro è orbo** (`agent-registry-check.mjs:56`): usa `includes()` a sottostringa → marca `0 orfani` mentre **ai-video** non è nel roster. Nomi corti (`cro`,`seo`) matchano `cross-sell`,`micro-influencer`. La safety-net anti-orfano ha buchi ciechi. → matcher con confine di parola / `agents-manifest.json`. **(AR-024)**
- 🟠 **GRAVE — AR-008 «owner unico per keyword» non applicato**: `marketing.md` rivendica keyword di crm/seo/content, `trust-safety.md` rivendica «chargeback» (owner = dispute). Il router legge le *description*, ma il guardiano non controlla le collisioni. → ripulire description + `keyword-owner-check.mjs`. **(AR-027)**
- 🔸 Minori: ai-video assente dal roster CLAUDE.md (AR-025), conteggio «40 vs 42» in AGENTI.md (AR-026), `tech` ancora generalista dopo lo split (AR-028).

### 2) vettori-installati — voto 75 (attenzione)
- 🟠 **GRAVE — Lo strato 7 non produce**: 36/41 quaderni vuoti, 0 scorecard, la sonda `chiusura-loop` gira con `|| true` (avvisa ma non blocca) e il formato ESITO canonico non ha il campo scorecard. I 42 senior **non imparano dai numeri veri**. → campo scorecard nel README + sonda come gate morbido. **(AR-029, impatto crescita ALTO)**
- 🔸 Minori: i 2 gate creativi (direttore-creativo, qa-designer) senza la Carta standard (AR-030); i doc STAMPO/VETTORI dicono «pilota» mentre è già su 42/42 (AR-031); **lo STAMPO è stato scalato senza validare** (TASTE-FILE vuoto) — domanda per te (AR-032); scorecard a due scale (AR-033); quaderni split-brain (AR-034).

### 3) salute-sensori-dati — voto 62 (attenzione)
- 🟠 **GRAVE — Il sensore-cassa scrive un file che nessuno legge** (`sensore-cassa.mjs`→`cassa-runway.json`, mai letto da `sentinella-dati.mjs`): il **rischio esistenziale n.1** è sensorizzato ma **sordo**. Se il runway scende sotto 3 mesi, nessuno viene svegliato. → sentinella M6 + regola «ogni sensore deve avere un consumatore». **(AR-035, impatto ALTO)**
- 🟠 **GRAVE — Cecità dati real-time non escalata**: gli «occhi» ogni minuto vedono il REST giù ma restano muti (il canale che allerta è alimentato solo dal giro, che ha il **timer disattivato**). La macchina può restare cieca sui soldi per ore. → evento 🔴 «REST cieco ORA». **(AR-037, impatto ALTO)**
- 🔸 Minori: nessun check deterministico se le fonti web sono vive (AR-036); MCP tracciato solo a mano (AR-038); sensore-cassa senza contatore-cecità (AR-039); PostHog health-checkato ma inerte — domanda per te (AR-040); due registri fonti (AR-041); `sensori-cecita.json` stantio (AR-042).

### 4) integrità-memoria — voto 62 (attenzione)
- 🟠 **GRAVE — Contratto rotto: i tile Supabase/Stripe del Pannello sono sempre spenti** (`auto-analisi.json` usa `supabase_marketplace`/`supabase_memoria`, il Pannello legge `.supabase`/`.stripe`). Vedi sempre rosso anche quando sono verdi. → validatore di schema. **(AR-043)**
- 🟠 **GRAVE — Una sola verità rotta sul FARO**: la memoria dice «Casa Linda reale/payout-ready», CLAUDE.md:157 la chiama «la demo Casa Linda» e indica Pane Quotidiano come unico reale. I motori di crescita tirano in **direzioni opposte**. → **decisione tua** su quale sia il faro (AR-044, impatto ALTO).
- ✅ **Risolti in questo giro** (bonifica memoria, 🟢 mia area): report stantio rigenerato (AR-045), storico-salute corretto+aggiornato (AR-046), verdetto auto-radiografia riportato all'enum (AR-048), split-brain consolidato (AR-047).
- 🔸 Minori aperti: memoria-squadra duplicata nel vault (AR-034), `AZIONI-PRONTE.md` coda orfana e scaduta (AR-049), `apprendimento.json` meta gonfiato 10 vs 4 (AR-050).

---

## 🚧 Cantiere: 23 aperti · 9 chiusi
I 23 aperti sono tutti fix **🟡 (firma tua)** — codice/doc/agenti — o **🔴/decisione tua** (faro, PostHog, validazione STAMPO). Ognuno ha una `verifica` machine-checkable: appena il fix entra nel codice, `auto-fix.mjs` lo chiude da solo.

**Da attaccare per primi (impatto crescita ALTO):** AR-029 (strato 7 che non impara) · AR-035 (cassa sorda) · AR-037 (cecità dati muta) · AR-044 (faro contraddittorio, serve la tua decisione).

## 🙋 Cosa mi serve da te (3 decisioni)
1. **Qual è il negozio-faro** — Casa Linda o Pane Quotidiano? (orienta tutti i motori di soldi)
2. **STAMPO su 42/42 non validato**: faccio ORA un test prima/dopo su 1-2 reparti, o accetti il rollout non validato?
3. **PostHog è instrumentato?** (decide se aggiungo la sentinella conversione o lo declasso)

## ⏭️ Prossimo passo
Completo le **8 dimensioni mancanti** + pre-mortem + benchmark dopo il reset (11:20 UTC), aggiorno questo report e il cantiere, e ti porto il voto pieno. Il Pannello ha un audit dedicato: **1 bloccante** — vedi `consegne/design/2026-07-03-radiografia-pannello.md`.
