---
tipo: radiografia-macchina
data: 2026-07-02 12:09
voto_salute_architettura: 42
trend: ▼
---

# 🩻 RADIOGRAFIA DELLA MACCHINA — 2026-07-02

> La macchina (il cervello dell'AD, questo repo) ha analizzato **sé stessa** da cima a fondo:
> 12 dimensioni, un revisore + un verificatore avversariale per ognuna (26 agenti), più pre-mortem
> e benchmark vs i migliori. Sola lettura. Ogni difetto qui sotto è **confermato** dal verificatore.

## Voto salute architettura: **42 / 100** ▼ (era 73 alla sonda del 30/6)

**Il crollo NON è un peggioramento.** La radiografia precedente (72-73) era un *seed superficiale* con 3 soli
findings, appoggiato per giunta a una formula-voto rotta (che ora la dimensione `calibrazione-onesta`
segnala come difetto). Questa è la **prima volta che la macchina si guarda davvero a fondo**: ha trovato
**3 difetti BLOCCANTI, 46 gravi, 34 minori** (83 in tutto). Il numero è basso perché è **onesto**.

La verità in una riga: **scheletro eccellente, muscoli fermi.** L'impianto è ricco e ben documentato
(42 agenti, volano di auto-coscienza completo, sensori, sentinelle, pannello). Ma gran parte è **inerte o
non cablata** — il loop non chiude, i sensori scrivono su un registro che non viene salvato, i quaderni dei
senior sono vuoti — e ci sono 3 falle che vanno chiuse **prima** di andare avanti.

---

## 🔴 I 3 BLOCCANTI (agisci qui, prima del resto)

### 1. Token GitHub reale committato nel repo — `AR-004` · sicurezza
`cervello/vps/.env.save` è **tracciato in git** e contiene un **PAT GitHub con permessi di scrittura** (+ un
URL Supabase reale). `.gitignore` protegge `cervello/vps/.env` ma **non** la variante `.env.save`: è sfuggito
ed è finito nella storia. **Chiunque legga il repo ottiene il token.**
- **Causa radice:** il perimetro segreti è difeso da una sola regola fragile (un nome esatto in `.gitignore`),
  non da uno scan attivo. Nessun pre-commit hook, nessuno scan-segreti (`AR-021`).
- **Remediation:** ①**Nicola revoca subito il PAT su GitHub** e ne genera uno nuovo (unica cosa che chiude il
  buco — il token è già nella storia). ② `git rm --cached .env.save` + purga storia (BFG). ③ `.gitignore` →
  `.env*`/`*.save`. ④ i template si chiamano solo `*.example`.

### 2. Il giro schedulato non ha timeout — `AR-005` · cadenza
La via schedulata (`mycity-giro.service` → `giro.sh`, ogni 2h) chiama il motore AI **senza timeout**, e il
`.service` è `Type=oneshot` **senza `TimeoutStartSec`** (default systemd = infinito). Se il motore si appende,
`giro.service` resta *attivo per sempre*, il giro successivo non parte (oneshot non si sovrappone), e **il
battito muore in silenzio**. Il timeout esiste solo nella via-coda (`worker.sh`), mai portato dentro `giro.sh`.
- **Fix (🟡):** `timeout --kill-after=60s ${GIRO_AI_TIMEOUT:-2700}` dentro `giro.sh`/`ritmo.sh` + `TimeoutStartSec=3600`
  nei `.service`.

### 3. Silo contenuti su Garetti, non su Casa Linda — `AR-006` · North Star
Tutta la pipeline contenuti/marketing (post, QR, reel, evento "Il Primo Turno", termini 12%) è costruita su
**Antica Salumeria Garetti**, che il registro-realtà stesso classifica *"scelta_ragionata"* — **prospect non
firmato, non nel database**. Il negozio **davvero payout-ready** (Casa Linda, unico con `stripe_payouts_enabled=true`)
ha **~0 asset**. La `LETTERA-A-NICOLA` del 28/6 lo diceva già nero su bianco ("usa Casa Linda oggi"), ma
4 giorni dopo la coda è ancora tutta su Garetti.
- **Causa radice:** la correzione vive solo in un artefatto di sola lettura (la lettera), senza un canale che
  riscriva coda/OKR/consegne; e il cancello di grounding non è applicato alla **produzione di asset** — un
  senior può sfornare 12+ asset per un'entità non confermata senza blocco.
- **Fix (🟡):** cancello di allocazione ("asset pesanti solo su entità *confermata*"), ripuntare la coda su
  Casa Linda, e la regola "ogni scoperta della lettera che cambia il faro riscrive OKR/coda **nello stesso giro**".

---

## 🩺 Le 12 dimensioni (voto e sintesi)

| Dim | Voto | Stato | In una riga |
|---|---|---|---|
| cadenza-esecuzione | 19 | 🔴 critico | Battito senza timeout (BLOCCANTE); passi del giro saltabili in silenzio; autopilot mai schedulato |
| allineamento-northstar | 32 | 🔴 critico | Tutto su Garetti mentre Casa Linda incassa (BLOCCANTE); nessuna sentinella di dispersione |
| salute-sensori-dati | 38 | 🟠 attenzione | Ledger anti-cecità mai salvato; Stripe/PostHog/Resend non collegati; gate anti-invenzione non blocca |
| calibrazione-onesta | 38 | 🟠 attenzione | Il voto non è riproducibile (copiato, non ricalcolato); calibrazione vuota |
| integrita-memoria | 41 | 🟠 attenzione | Split-brain su code-azioni e quaderni; JSON fuori contratto; cantiere congelato |
| rischio-sicurezza-se | 42 | 🔴 critico | PAT committato (BLOCCANTE); nessuno scan-segreti; token push singolo SPOF |
| chiusura-volano | 47 | 🟠 attenzione | Il volano si auto-certifica; auto-miglioramento mai girato; 0 difetti chiusi da sempre |
| efficienza-costo | 54 | 🟠 attenzione | Un solo modello premium per tutto; 9 giri fissi/giorno; zero sensore di costo |
| coerenza-agenti | 55 | 🟠 attenzione | 15 agenti orfani nel router; umbrella non ristretti → doppioni su leve di ricavo |
| copertura-cieca | 61 | 🟠 attenzione | 14 rischi noti senza owner né sentinella; cassa/HACCP/GDPR ciechi |
| vettori-installati | 64 | 🟠 attenzione | Vettori nei 42 prompt ma loop inerte; rollout fatto prima della validazione |
| guardrail-semaforo | 72 | 🟠 attenzione | Semaforo tenuto, ma endpoint control-plane senza auth; gate qualità solo advisory |

---

## 🧵 I 4 fili rossi (le cause di sistema, non i sintomi)

1. **Il volano non chiude.** Calibrazione vuota, esperimenti mai misurati, quaderni dei senior vuoti,
   0 difetti chiusi da sempre, tasso_applicazione scritto a mano. La macchina *dice* di imparare ma non ha
   ancora un giro impara→applica→misura che si chiuda sui dati. → `AR-009`, `AR-013`.
2. **I sensori sono ciechi e non sanno di esserlo.** Il contatore giri-ciechi esiste ma scrive un ledger che
   non viene salvato; `giro.sh` ingoia l'exit code; MCP non auto-verificabile; Stripe/PostHog/Resend mai
   collegati. La barriera "non inventare numeri" è testo, non un gate. → `AR-010`, `AR-011`, `AR-012`, `AR-022`.
3. **Gli elenchi divergono perché mantenuti a mano.** 15 agenti orfani, umbrella non ristretti, conteggi
   incoerenti (40 vs 42), doppie cartelle di memoria: nessun guardiano deterministico tiene allineati file ↔
   organigramma ↔ comandi ↔ OKR. → `AR-007`, `AR-008`.
4. **I rischi noti non sono sorvegliati.** Cassa/runway (rischio n.1), HACCP, GDPR, dispersione: sono in prosa,
   non in un registro con owner + sentinella. → `AR-015`, `AR-016`, `AR-017`, `AR-018`.

---

## 🔮 Pre-mortem — i danni peggiori plausibili (difese 🟡 da mettere PRIMA)

| Probabilità | Disastro | Difesa proposta |
|---|---|---|
| media | Un'azione 🔴 (email/notifica a clienti/negozi reali) parte senza firma | Doppio gate colore↔canale in `esegui-azione.mjs`; 🔴 richiede flag di firma esplicito |
| media | Doppio invio reale della stessa azione (segno "FATTO" perso) | Idempotenza: marca "inviato" atomica prima dell'invio |
| media | Scrittura sul DB di PRODUZIONE del marketplace | Ribadire read-only sul MCP marketplace; nessun consumatore con chiave write |
| media | Loop autonomo che brucia budget AI senza tetto | Sensore costo token (`AR-020`) + tetto reale sui driver, non solo su `pensa()` |
| media | Memoria persa/corrotta in silenzio (scritture non pushate) | Snapshot periodico di `auto-coscienza/`; gate anti-perdita nel sync |
| bassa | DEM/post pubblico sbagliato pubblicato in automatico | Autopilot: gate qualità/ONESTA bloccante (non advisory) nel percorso 🟡 |

---

## 🏆 Benchmark vs i migliori (divario per mestiere)

**Alto:** Onboarding negozi · Funnel & CRO · Email & CRM lifecycle · SEO locale · Consegne & Operations.
**Medio:** Contenuti & Social · Prezzi & Monetizzazione · PR & stampa locale · Cura clienti · *Gestire l'azienda
in autonomia con agenti AI* (il meta-mestiere).

Il filo comune: i migliori chiudono il loop **osserva → agisci → misura → impara sui numeri reali**. Noi oggi
ci fermiamo a "osserva → agisci" perché i sensori e il volano non sono ancora cablati. **Sbloccare i dati reali
è il moltiplicatore che alza tutti i divari insieme.**

---

## 🆕 Pezzi nuovi che mi mancano (proposte 🟡)
Guardiano drift del registro agenti · sentinella chiusura-loop · ledger sensori persistito · check PostHog/Resend ·
liveness per-fonte del radar · registro rischi con owner · sensore cassa/runway · gate compliance pre-lancio ·
sentinella GDPR (breach 72h) · sensore costo token · scan-segreti pre-commit · sentinella dispersione North Star.
(23 proposte in `auto-radiografia.json → proposte_nuovi_pezzi`.)

## 🙋 Le 7 domande per Nicola
In `auto-radiografia.json → domande_per_nicola`. Le due che sbloccano di più: **collego Stripe davvero o lo tolgo
dai sensori finché non serve?** · **il rollout dei 42 senior lo validiamo (test prima/dopo) o lo diamo per buono?**

---

## 🚧 Stato del cantiere
- **1 difetto CHIUSO** (prima chiusura in assoluto): `AR-002` — il percorso del marketplace ora è parametrizzato
  (`MARKETPLACE_REPO`), quindi la radiografia del sito può girare sul VPS.
- **22 difetti in lavorazione** (20 aperti + 2 in-corso) nel `cantiere-difetti.json`, ordinati per impatto sulla
  crescita. I ~30 medio/basso restanti sono nel `auto-radiografia.json`.

> Prossimo passo che propongo: **chiudere i 3 bloccanti** (R1 revoca token · R2 timeout · R3 Casa Linda), poi
> attaccare il filo n.2 (sensori/dati), perché è quello che sblocca il volano e alza tutti i benchmark insieme.
