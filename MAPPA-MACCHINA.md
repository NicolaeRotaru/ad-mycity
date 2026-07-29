# 🗺️ Mappa della macchina — com'è fatta, pezzo per pezzo

> A cosa serve questo file: è **l'indice** della macchina, non il manuale.
> Ogni voce dice **cos'è**, **dove sta** e **come si apre**. Serve per scegliere
> UNA cosa e approfondire quella, senza doversi leggere tutto.
>
> Per approfondire un pezzo, in chat basta il numero: «approfondisci 2.3».
>
> I numeri qui dentro sono **contati sul repo**, non stimati (data: 2026-07-29).

---

## Le 9 parti in una riga

| # | Parte | In una frase | Dove vive |
|---|-------|--------------|-----------|
| 1 | **Pannello** | La faccia: quello che vedi e dove firmi | `pannello/` (Vercel) |
| 2 | **Worker + VPS** | Le braccia: esegue davvero i lavori, 24h | `cervello/worker.sh` + `cervello/vps/` |
| 3 | **AD** | La testa: decide, delega, scrive in memoria | `CLAUDE.md` + `cervello/*.md` |
| 4 | **I 120 senior** | La squadra di specialisti a cui l'AD delega | `.claude/agents/` |
| 5 | **Guardiani & sensori** | Il sistema immunitario: impedisce le bugie | `cervello/*.mjs` |
| 6 | **Memoria** | Quello che la macchina ricorda | `MyCity-Vault/` |
| 7 | **Mani & sensi** | Come legge il mondo e come lo tocca | `cervello/publishers/`, sensori |
| 8 | **I flussi** | Come le parti si parlano (i cicli veri) | trasversale |
| 9 | **Estensioni** | Skill, workflow, capacità: i moduli aggiuntivi | `.claude/`, `cervello/capacita/` |

---

## 1. IL PANNELLO — la faccia

**Cos'è:** un'app web Next.js (217 file TypeScript, ~30.267 righe) ospitata su Vercel.
È l'unico posto dove tu guardi e firmi. Non contiene intelligenza: mostra quello che
la macchina ha scritto e raccoglie le tue decisioni.

- **1.1 — Le aree (13 viste).** `plancia`, `azioni`, `lavori`, `cervello`, `salute-sito`,
  `auto-coscienza`, `numeri`, `memoria`, `persone`, `operazioni`, `mondo`, `assistente`,
  `contenuti`. Definite in `pannello/src/lib/nav.ts`, disegnate in `src/components/aree/` (15 file).
- **1.2 — I componenti (44 + 20).** Le "caselle": Bacheca, Autopilota, CuoreMacchina, ChatCasella,
  ParlaCasella, StatoMacchina, Volano, QuaderniSenior… → `pannello/src/components/`.
- **1.3 — Le API interne (75 rotte).** Ogni casella ha la sua fonte: `api/memoria/*` (17 rotte:
  stato, decisioni, fatti, azioni, quaderni, auto-coscienza…), `api/metriche/*` (11: cassa, funnel,
  payout, retention, unit…), `api/lavori/*` (8: coda, stream, annulla, recupera), `api/marketplace/*`,
  più cuore/heartbeat/controllo/costo/diagnosi. → `pannello/src/app/api/`.
- **1.4 — La libreria (79 moduli).** La logica vera: firma azione, consenso, chat unificata,
  autopilota, onestà, demo, store Supabase, economia. → `pannello/src/lib/`.
- **1.5 — Il contratto di navigazione.** La regola che fa funzionare il tasto INDIETRO sul telefono:
  aree e sotto-schede timbrano una voce di cronologia; gli strati sovrapposti stanno in una **pila
  condivisa** (`lib/strati.ts`) invece che in cinque booleani sparsi.
- **1.6 — Deploy e PWA.** Vercel via Deploy Hook, scatta **solo** se cambia `pannello/`
  (`.github/workflows/deploy-pannello.yml`). PWA installabile: `public/sw.js`, `manifest.json`.
- **1.7 — Il database della memoria (5 file SQL).** Supabase **separato** dal marketplace.
  Tabelle: `briefings`, `diario`, `lavori`, `conversazioni`, `impostazioni`, più ~20 tabelle
  dell'operatore. RLS attiva, nessuna policy pubblica. → `pannello/sql/`.

---

## 2. IL WORKER + IL VPS — le braccia

**Cos'è:** uno script bash da 104 KB (`cervello/worker.sh`) che gira su un VPS Linux sotto systemd,
sempre acceso. È l'unico pezzo che **esegue** davvero: prende i lavori dalla coda, li fa fare
all'AI, riscrive il risultato. Quando premi «Approva» sul Pannello, è lui che si muove.

- **2.1 — Le due corsie.** Un worker `all` (i lavori lunghi: giro, azioni) e un worker `chat`
  (le risposte in chat, che non devono aspettare i lavori lunghi). Due servizi separati.
- **2.2 — La coda.** Tabella `lavori` su Supabase-memoria: `in_attesa` → `in_corso` → `fatto`/`errore`.
  Con `gruppo_id` (i lavori della stessa chat), `tentativi`+`riprova_dopo` (ritentativo automatico),
  `worker_owner` (chi l'ha preso, per recuperare gli orfani quando i worker sono due).
- **2.3 — I servizi e i timer (13 service + 11 timer).** `worker`, `worker-chat` (sempre accesi);
  a orario: `giro`, `ritmo-mattino`, `ritmo-mezzogiorno`, `ritmo-sera`, `ritmo-settimana`,
  `sentinella`, `sentinella-dati`, `salute`, `monitora`, `verifica`, `watch-main`. → `cervello/vps/`.
- **2.4 — Il motore AI.** `cervello/motore-ai.sh`: Claude Code (`claude`) è il motore principale;
  Cursor solo se richiesto esplicitamente. Il **router costo** (`banco-ai.mjs`) sceglie il modello
  giusto per il compito invece di usare sempre il premium.
- **2.5 — Le difese.** Ricarica sicura (non si sostituisce con una versione che non compila),
  recupero lavori orfani, dead-letter, lucchetto git, kill-switch «pausa», battito del cuore.
- **2.6 — Installazione e diagnosi.** `setup.sh`, `aggiorna-cervello.sh`, `diagnostica-completa.sh`,
  `CHECKLIST-VIVO.md`, `SETUP-VPS.md`. Skill dedicata: **`worker`**.

---

## 3. L'AD — la testa

**Cos'è:** non è un file eseguibile, è un **mansionario** che l'AI legge ogni volta.
`CLAUDE.md` (61 KB) dice chi è, come decide, chi sono i suoi senior e quali comandi riconosce.

- **3.1 — La regola d'oro 🟢🟡🔴.** Verde = lo fa da solo. Giallo = lo fa e ti avvisa.
  Rosso = si ferma e chiede la firma. Nel dubbio sale di colore. È il fondamento di tutto il resto.
- **3.2 — Il giro.** `cervello/giro.sh` (100 KB) + `giro.md`: la perlustrazione. Legge i dati reali,
  passa **~35 vincoli HARD** (i guardiani), poi l'AD scrive il briefing e aggiorna lo STATO.
- **3.3 — Le cadenze.** `cervello/ritmo.md`: piano del mattino, mezzogiorno, report della sera,
  review del venerdì, strategia mensile. Sono i timer del punto 2.3.
- **3.4 — I comandi.** `COMANDI.md`: le frasi che fanno partire un lavoro («fai un giro»,
  «radiografia», «contenuti pro», «come stiamo?»). Riconosciute anche se dette in modo diverso.
- **3.5 — L'auto-coscienza.** Quattro documenti che le dicono come guardarsi:
  `auto-analisi.md` (verifica il proprio lavoro), `auto-radiografia.md` (analizza sé stessa),
  `auto-miglioramento.md` (si confronta coi migliori), `apprendimento.md` (estrae lezioni).
- **3.6 — I cancelli di qualità.** `verifica-avversariale.mjs` (prova a refutarsi),
  `fonte-numero.mjs` (nessun numero senza fonte), `onesta-check.mjs`, `scrittura-umana.md`
  (il titolo di un'azione deve suonare come lo diresti a voce, senza sigle).

---

## 4. I 120 SENIOR — la squadra

**Cos'è:** 120 file in `.claude/agents/`, uno per specialista. Ognuno ha mansionario, limiti,
criteri di "fatto bene" e un quaderno di memoria. L'AD **delega** invece di fare tutto.

- **4.1 — Motori di soldi (15).** vendite, onboarding-negozi, account-negozi, marketing, growth,
  crm-lifecycle, ads-performance, influencer, content-social, ai-copywriter, ai-video, seo,
  designer, pr-stampa, relazioni-istituzionali.
- **4.2 — Occhi (3).** intelligence (mondo esterno), analista (i numeri), data-engineer (le pipeline).
- **4.3 — Costruttori (6).** builder-automazioni, tech, backend-dev, frontend-dev, devops-sre,
  product-manager.
- **4.4 — Fondamenta (12).** finanza, contabilita, legale-privacy, security, trust-safety, dispute,
  qa, operations, rider-fleet, dispatch, supporto, customer-success.
- **4.5 — Cancelli creativi (6).** direttore-creativo, qa-designer, ux-designer, ai-designer, cro,
  prompt-engineer.
- **4.6 — L'espansione (78).** Rischio & trust (fraud-risk, kyc-aml, dpo…), governo (chief-of-staff,
  corporate-strategy, bi-lead…), innovazione (search-reco, ml-engineer, mobile-app…), ops a scala
  (live-ops, capacity-planning, reverse-logistics…), professionisti (commercialista, notaio,
  avvocati, RSPP — **preparano, non firmano**), banche & finanziamenti (cfo, fondo-garanzia-pmi…).
- **4.7 — Le regole della squadra.** **Owner unico per keyword** (ogni mandato ha UN padrone, gli
  altri rimandano), **doer mode** (il senior consegna il lavoro fatto, non l'analisi di cosa fare),
  **Sala Operativa** (il canale condiviso), **chiusura del loop** (atteso→reale nel quaderno).
- **4.8 — I quaderni (124).** `memoria-squadra/`: cosa ha imparato ogni reparto. Skill: **`senior`**.

---

## 5. GUARDIANI & SENSORI — il sistema immunitario

**Cos'è:** 141 script `.mjs` in `cervello/` che controllano la macchina **prima** che consegni.
Non sono consigli: molti sono vincoli HARD, se falliscono il lavoro non passa.

- **5.1 — I guardiani del giro (~26 attivi).** Esempi veri: `coerenza-fatti` (una copia vecchia di
  un fatto in giro = bugia), `allocazione-check` (lo sforzo pesante va solo dove c'è un negozio
  reale), `firma-check` (chi esegue non può firmare sé stesso), `chiusura-loop`, `fonte-numero`,
  `sensori-spenti-check`, `uscite-check` (il cancello sta al confine col mondo, non dentro).
- **5.2 — I sensori (11).** `supabase_rest` (dati marketplace), `stripe_api`, `posthog_api`,
  `resend_api`, `sito_uptime`, `supabase_memoria`, `pannello_uptime`, `telegram_bot`,
  `watchdog_esterno`, `n8n_health`, `mcp_supabase`. Un sensore cieco **blocca i numeri nuovi**:
  meglio nessun numero che un numero inventato.
- **5.3 — La visita di salute.** `salute.mjs` (44 KB) + `storico-salute.json`: tre risposte per ogni
  controllo — ✅ provato, ❌ rotto, ⚪ non l'ho potuto vedere da qui (⚪ non è mai un verde).
  Skill: **`salute`**.
- **5.4 — Il cantiere dei difetti.** `auto-coscienza/cantiere-difetti.json` + `malattie.json`
  (le famiglie di difetto) + `mutanti.json`. Si ripara per malattia, non per conteggio.
  Skill: **`cantiere`**.
- **5.5 — I test (119) e la CI.** `cervello/test/` (`.test.mjs` e `.bats`) + 4 workflow GitHub
  Actions: test-cervello, cancello-lotto, battito-esterno, deploy-pannello.

---

## 6. LA MEMORIA — quello che ricorda

**Cos'è:** il vault Obsidian `MyCity-Vault/`. Le cartelle numerate sono **tue**; la `90-Memoria-AI/`
è dell'AD (lì scrive da sola).

- **6.1 — Le tue cartelle (7).** 01-Strategia, 02-Mercato, 03-Clienti, 04-Prodotto-Ops,
  05-Soldi-Rischi, 06-Piani, 07-Agenti. Qui l'AD **propone**, non riscrive.
- **6.2 — La memoria dell'AD.** `STATO.md` (i numeri chiave), `DECISIONI.md` (log append-only),
  `AZIONI-IN-ATTESA.md` (la coda da firmare), `BACHECA.md`, `SALA-OPERATIVA.md`, `LEZIONI-CHAT.md`,
  `RITMO.md`, `Briefing/` (35 giri archiviati), `Report/`, `Intelligence/`, `Storico/`.
- **6.3 — La fonte unica della verità.** `registro-fatti.json`: prezzi, date, negozio faro, target.
  Un fatto vive in UNA casa; gli altri file lo citano. Se cambia, il guardiano `coerenza-fatti`
  fallisce finché ogni copia vecchia non è riscritta.
- **6.4 — L'auto-coscienza (28 file JSON).** cantiere difetti, calibrazione, apprendimento,
  registro-realtà (chi è reale e chi è una scelta ragionata), salute, costo-ai, chiusura-loop,
  pagella-intelligenza, LETTERA-A-NICOLA.md.
- **6.5 — La memoria viva su Supabase.** Conversazioni, diario e briefing anche a database, così il
  Pannello li legge da qualunque dispositivo.
- **6.6 — Le consegne (742 file).** `consegne/` diviso per reparto: è dove i senior depositano il
  lavoro finito (dossier, post, audit, contratti). `creativi/` per le grafiche.

---

## 7. MANI & SENSI — come tocca il mondo

**Cos'è:** la parte più delicata. I **sensi** leggono (sola lettura), le **mani** scrivono fuori.
Il principio è *fail-closed*: se non è esplicitamente permesso, non parte.

- **7.1 — Le mani (5 canali + 1 alias).** telegram, email, google-business, facebook, instagram
  (`cervello/publishers/`). Ogni canale dichiara da sé **il colore minimo** (post pubblico = 🟡,
  email a un cliente = 🔴) e **il destinatario reale**. Un canale nuovo che non le dichiara è
  trattato come 🔴 senza destinatario: non può aprire una porta per distrazione.
- **7.2 — L'allowlist.** `mani-allowlist.json`: oggi email `[]`, notifiche `[]`, n8n `false`.
  Vuoto = **prova a vuoto forzata**: anche con un'azione firmata, nulla parte davvero finché il
  destinatario non è in lista.
- **7.3 — I sensi in lettura.** Marketplace via REST Supabase (fonte di verità) e MCP (comodità di
  sessione); Stripe per incassi/payout; PostHog per gli eventi. **Mai scritture sul DB del sito.**
- **7.4 — Il codice del marketplace.** Copia locale in sola lettura (`collega-marketplace.mjs`):
  i workflow di audit e i senior tech lo leggono; le modifiche solo in branch, il deploy è 🔴.
- **7.5 — La fabbrica dei contenuti.** `cervello/content-factory/`: 13 template HTML che diventano
  grafiche vere, più i connettori AI (gemini-image, canva, ai-video).

---

## 8. I FLUSSI — come le parti si parlano

Qui non ci sono file nuovi: è il **come funziona** che tiene insieme i punti 1-7.

- **8.1 — Il ciclo di un'azione.** Un senior prepara l'azione completa → la accoda in
  `AZIONI-IN-ATTESA.md` → il Pannello la mostra come card con «Cosa cambia / Se va bene» →
  tu firmi → il worker la esegue → l'esito torna in memoria. Niente parte senza la firma.
- **8.2 — Il ciclo di un lavoro (chat o comando).** Pannello scrive in `lavori` → il worker lo
  prende (`in_corso`) → l'AI lavora → la risposta torna in streaming sul Pannello → `fatto`.
  Se cade: ritentativo automatico, recupero orfani, dead-letter.
- **8.3 — Il ciclo del giro.** Timer systemd → `giro.sh` → sensori → ~35 guardiani → l'AD scrive
  briefing + STATO → commit e push su `main` → il Pannello legge `main` e si aggiorna.
- **8.4 — Il ciclo dell'apprendimento.** Esito di un lavoro → lezione (le tue correzioni valgono
  doppio) → `LEZIONI-CHAT.md` e `apprendimento.json` → rientrano nel contesto della sessione
  successiva. È il motivo per cui all'inizio di ogni chat vedi «memoria persistente».
- **8.5 — Git e pubblicazione.** Ramo unico `main`. `git-pr.mjs` per le PR, `lucchetto-git.mjs`
  contro le scritture in conflitto, `watch-main.sh` sul VPS che tiene allineata la copia locale.

---

## 9. ESTENSIONI — i moduli aggiuntivi

- **9.1 — Le skill (5).** `salute` (checkup), `worker` (il VPS a fondo), `senior` (la squadra a
  fondo), `cantiere` (riparare i difetti), `verify` (provare le modifiche col browser vero).
  Sono mansionari che si aprono al momento giusto.
- **9.2 — I workflow (5).** `radiografia` (marketplace, 13 dimensioni), `audit-design` (11),
  `audit-pannello`, `auto-radiografia` (la macchina su sé stessa, 12), `giro-operativo`
  (il giro come flotta di senior in parallelo). Ogni problema trovato viene **verificato
  avversarialmente** prima di essere riportato.
- **9.3 — Le capacità (46).** `cervello/capacita/`: le idee di frontiera già scritte come moduli
  (il gemello digitale, il concierge di spesa, il catalogo che si scrive da solo, il sismografo…).
  Sono il magazzino delle cose che la macchina potrà fare.

---

## Come approfondire

In chat, il numero basta: **«approfondisci 5.1»**, **«spiegami il 2.2»**, «voglio vedere il 7.2».
Se preferisci a voce: «come funziona la coda dei lavori», «chi mi protegge dalle bugie»,
«cosa succede quando premo Approva».
