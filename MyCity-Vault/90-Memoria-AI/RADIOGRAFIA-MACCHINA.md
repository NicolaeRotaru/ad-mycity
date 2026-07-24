---
data: 2026-07-23 22:20
tipo: auto-radiografia (COMPLETA, su comando di Nicola — "analizzati da cima a fondo" → "vai") — 14 senior in parallelo (Agent, il tool Workflow è bloccato in sessione headless)
voto_salute_architettura: 0
---

# 🩻 Radiografia della MACCHINA — 2026-07-23 22:20

> Su comando di Nicola («analizzati da cima a fondo» → «vai») la macchina si è auto-analizzata: 12 dimensioni +
> pre-mortem + benchmark vs i migliori, ognuna affidata a un senior in sola lettura, poi sintetizzata dall'AD.
> Il tool `Workflow` (orchestrazione dichiarativa) è risultato bloccato in questa sessione headless (gate di
> conferma non disponibile in chat) — sostituito con 14 chiamate `Agent` in parallelo, stesso risultato pratico.
> Archivio completo dei findings: `auto-coscienza/auto-radiografia.json` (dimensioni) e
> `auto-coscienza/cantiere-difetti.json` (AR-138..AR-153, i nuovi difetti di questo giro).

## Il numero (e perché non spaventarsi)

**Voto di salute architettura: 0/100.** Non significa "la macchina è rotta": il marketplace è vivo, i sensori
dati sono per lo più sani, il lavoro tecnico del 23/7 (3 bug chat chiusi, 2 token GitHub sbloccati, 2 PR
mergiate) era coerente con la priorità dichiarata da Nicola. Il voto tocca 0 perché la formula pesa ogni
difetto bloccante/grave trovato in **12 dimensioni indipendenti auditate con rigore** — coerente col
`voto_pieno: 0` che la sonda leggera segnalava già prima di questa radiografia (non è una sorpresa nuova,
è la conferma di un segnale che la macchina stessa aveva già dato). Un voto basso qui è il prezzo di
un'analisi onesta e profonda, non un incidente improvviso.

Quello che conta davvero: **3 rischi bloccanti** meritano priorità immediata, il resto è un cantiere ordinato
per impatto sulla crescita.

## 🔴 I 3 rischi bloccanti (priorità immediata)

1. **[AR-138 / AR-139] L'autopilota del Pannello esegue azioni verdi senza mai verificare la PAUSA né
   l'allowlist destinatari.** Il cancello AR-103 (pausa + AZIONE_ID + allowlist) protegge solo la via da
   terminale; la via Pannello/autopilota — quella senza un click umano davanti — non lo eredita. Oggi
   `AZIONI_LIVE=1` e alcune mani (GitHub, tabella `products`) sono già sbloccate: le condizioni per un'azione
   reale senza vera firma ci sono già, anche se nessuna si è mai verificata finora.
2. **[AR-144] Il freno "stop se superi il budget token giornaliero" non scatta mai** — bug di conteggio,
   `token_totali` resta a 0 anche a 1,3M token/giorno stimati. Combinato con **[AR-145]** (il giro si
   autorilancia a raffica: 7 esecuzioni del "Piano del mattino" in ~100 minuti lo stesso giorno) e col giro
   fermo 3 giorni (20-23/7, causa mai trovata, **AR-146**), non esiste nessun argine automatico contro un
   ciclo fuori controllo in nessuna delle due direzioni (troppo silenzio / troppo rumore).
3. **[AR-147] PI26 (10.000€ a fondo perduto, scade 30/7) non ha nessun countdown/allarme automatico reale** —
   vive solo in un promemoria riscritto a mano ogni sera; il canale che dovrebbe avvisare Nicola in modo
   proattivo (Telegram) è ancora spento per mancanza di una chiave.

## 🟡 Da sistemare, impatto alto (non urgente in ore, ma non va dimenticato)

- **[AR-142]** Permessi di sessione più larghi del dovuto (Write senza path, `git push origin main`, `git
  merge`, `curl:*`, `node /tmp/*.mjs`) — nessuno li ha sfruttati, vanno stretti.
- **[AR-152, chiuso in questo turno]** Il piano di crescita 12 mesi in `STATO.md` calcolava ancora con la
  vecchia commissione 20%+fee invece del 10%+50€/mese confermato il 20/7 — segnalato STALE con ricalcolo
  rapido (~164.800€ di ricavi vs 387k€ dichiarati); il margine va rifatto da @finanza/@pricing-scientist.
- **[AR-149, AR-150]** Il sistema di "imparare dagli errori" nasconde più che gonfiare: tasso di applicazione
  delle lezioni al 17% da 42 giri, un flag che dice "il ciclo chiude" con una soglia diversa da quella vera,
  un esperimento segnato "misurato con successo" che in realtà non è mai partito.
- **[AR-151]** Un difetto (AR-008) fu chiuso il 2/7 verificato contro il documento sbagliato — lo stesso
  identico problema è poi riemerso identico 2 settimane dopo come AR-130. Le chiusure vecchie del cantiere
  non sono mai state ri-controllate con lo standard di verifica di oggi.
- Un ordine esplicito di Nicola del 23/7 ("il fix anti-duplicati su tutte le analisi") è stato eseguito solo
  su 2 sentinelle su 5 di quelle note come rotte.
- `cervello/vps/aggiorna-cervello.sh` usa ancora `git add -A` non perimetrato — lo stesso bug (AR-044) chiuso
  su altri 3 script, mai esteso a questo quarto.

## Le 12 dimensioni, in breve

| Dimensione | Voto | Stato | Il punto |
|---|---|---|---|
| guardrail-semaforo | 30 | 🔴 critico | autopilota senza pausa, colore testo libero |
| chiusura-volano | 22 | 🔴 critico | 17% applicazione lezioni, falso positivo esperimento |
| cadenza-esecuzione | 32 | 🔴 critico | piano mattino 7x/giorno, 4 giorni senza traccia |
| calibrazione-onesta | 39 | 🔴 critico | @AD/@ad nasconde il vero track record (0/5) |
| allineamento-northstar | 39 | 🔴 critico | giro fermo 3gg poi 11+ volte in poche ore |
| copertura-cieca | 40 | 🔴 critico | PI26 senza allarme, 6/14 rischi senza sentinella |
| efficienza-costo | 42 | 🔴 critico | budget-token gate inerte, playbook a vuoto |
| integrita-memoria | 42 | 🔴 critico | 2 difetti corretti in questo turno (card/piano stale) |
| rischio-sicurezza-se | 45 | 🔴 critico | permessi larghi, token in chiaro nel marketplace |
| coerenza-agenti | 55 | 🟡 attenzione | AR-008 chiuso male, AR-130 4x più esteso |
| vettori-installati | 64 | 🟡 attenzione | ok nella sostanza, TASTE-FILE quasi vuoto |
| salute-sensori-dati | 67 | 🟡 attenzione | MCP Stripe stale 5gg, 4 fonti mai verificate |

## Pre-mortem (i disastri più plausibili se non si tocca nulla)

1. Un'azione reale parte senza vera firma di Nicola (le route del Pannello non hanno autenticazione server-side
   — vedi guardrail-semaforo). **Probabilità: alta.**
2. Memoria corrotta da un commit sporco durante lavoro in parallelo (già successo 3 volte il 23/7 con
   `git-pr.mjs`). **Media-alta.**
3. Loop che ri-esegue lavoro pesante e brucia budget (pattern già osservato ripetutamente: piano mattino,
   4 playbook di reparto). **Alta.**
4. Messaggio/incentivo reale duplicato (bug di dedup chat già visto 3 volte oggi). **Media.**
5. Azione sbagliata eseguita per matching ambiguo del codice-casella. **Bassa.**

## Benchmark vs i migliori

Il confronto più utile non è su un singolo mestiere ma su **come si governa un'azienda gestita in autonomia
da agenti AI**: Anthropic (Project Vend/Claudius) ha un caso pubblico di un'AI che ha gestito un vero negozio
per un mese — senza controlli sullo stato reale, ha riordinato/scontato a vuoto. È lo stesso difetto che questa
macchina ha oggi: playbook che si rieseguono su dati fermi invece di accorgersi che nulla è cambiato. Sul resto
(onboarding, prezzi, SEO, consegne, cura clienti) il piano è già allineato ai migliori sulla carta, solo non
ancora testato con negozi veri — normale, siamo fermi apposta fino al 24/8-1/9.

## Cosa ho già corretto da solo (🟢, solo memoria, zero codice toccato)

- Rimossa la card `#pat-decisioni-redazione` dalla coda: chiedeva la firma di Nicola su un difetto (con l'ID
  sbagliato, AR-112 invece di AR-118) già chiuso dal 16/7 — verificato con grep che `DECISIONI.md` non
  contiene più nessun frammento di token.
- Segnalato STALE il piano di crescita 12 mesi in `STATO.md` con un ricalcolo rapido alla commissione vera.
- Scritti 16 nuovi difetti nel cantiere (AR-138..AR-153), 2 già chiusi in questo turno (AR-152, AR-153).

## Cosa serve da Nicola

- Confermare la priorità sui 3 bloccanti (autopilota/pausa, budget-token, PI26) prima che l'AD apra le PR di
  fix — sono modifiche a codice sensibile (il cancello di sicurezza stesso), vanno fatte con calma e riviste,
  non in blitz.
- Decidere se restringere ora i permessi di sessione (AR-142) o lasciarli per comodità operativa.
- Confermare la rotazione del PAT GitHub (già in coda, ora anche più urgente per AR-143: era persistito in
  chiaro anche nel file di collegamento al marketplace).

## Aggiornamento review settimanale — 2026-07-24 16:00

Non ri-eseguita la radiografia completa (fatta ieri sera, <24h fa, stesso ambito — ripeterla ora sarebbe il
loop a vuoto che questa stessa settimana ha imparato a evitare). Delta rispetto ai 3 bloccanti sopra:

- ✅ **[AR-138/AR-139] Autopilota senza pausa/allowlist — CHIUSI** in 24h (PR #518/#519 mergiate).
- ⏳ **[AR-144] Budget-token inerte — ancora aperto.**
- ⏳ **[AR-147] PI26 senza allarme — ancora aperto**, e ora la scadenza è a **6 giorni** (30/7 ore 16:00).
- 🆕 **[AR-154] Nuovo, trovato in questa review**: il rituale ESITO (AR-009) non ha coperto lo sprint Pannello
  21-24/7 — @tech ha 47 righe ferme al 20/7 nonostante decine di PR mergiate dopo. Non blocca nulla oggi, ma
  svuota la calibrazione futura sul reparto più attivo della settimana. Dettaglio in `cantiere-difetti.json`.
- 🆕 **Rischio più grave trovato oggi, fuori dalla radiografia tecnica**: un valutatore indipendente ha
  esaminato la bozza della domanda PI26 (€10.000, scade 30/7) e l'ha giudicata **DA SISTEMARE**, non pronta
  — mancano 3 verifiche di base (spesa minima ammissibile ~€5.000 mai confrontata col burn reale ~850€
  accumulati, esistenza di una P.IVA/entità giuridica MyCity mai controllata, documenti di spesa reali).
  Vedi `MyCity-Vault/90-Memoria-AI/auto-coscienza/auto-miglioramento.json` (peer_review PR-007).
