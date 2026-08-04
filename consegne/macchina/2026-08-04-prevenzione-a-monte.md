---
titolo: I tre pezzi che impediscono l'errore prima che accada, costruiti — due aspettano il tuo interruttore
data: 2026-08-04 04:35
per: Nicola
stato: costruito e provato — due pezzi si accendono con la tua firma
---

# I tre pezzi che impediscono l'errore prima che accada

> **In due righe.** Mi hai chiesto dei freni che mi facciano lavorare bene DA SUBITO, non solo un
> controllore alla fine. I tre pezzi sono costruiti e provati: uno è già acceso, due aspettano te.

## In parole semplici

Facciamo un passo indietro. Il collaudo di stanotte controlla il lavoro **finito**: è la rete di
sicurezza alla fine. Tu però hai chiesto un'altra cosa, in più: dei freni che mi impediscano di
sbagliare **mentre** lavoro, e che alzino il risultato. Sono tre pezzi, in ordine di quando agiscono.

**Primo: la scheda prima di cominciare.** Ho 503 lezioni imparate in memoria (quasi tutte nate da
errori già pagati), ma finora me ne arrivavano sempre le stesse: le ultime 12 in ordine di tempo,
qualunque cosa stessi per fare.
Adesso, appena tu scrivi una richiesta, la macchina pesca solo le lezioni che parlano di **quel**
lavoro. Per esempio, l'ho provato con la richiesta «apri la PR e fai il rebase del ramo». Sono
uscite 8 lezioni su 503, tutte centrate sul tema. Quasi tutte sono correzioni tue. Su una
richiesta fuori tema tace, perché una scheda che allega lezioni a caso è rumore.

**Secondo: la mano fermata.** La casa ha un registro degli errori già pagati (le «malattie»). Se
il testo che sto per scrivere ne contiene uno, finora lo scoprivo un secondo **dopo** averlo
scritto. Adesso la scrittura **non parte proprio**: la mano si ferma prima, con il perché davanti
agli occhi e le due uscite oneste — curare la riga, oppure dichiarare un'esenzione motivata.
Provato dal vivo: rifiuta l'errore censito, tace sul testo pulito, e se il freno stesso si rompe
lascia passare invece di murare ogni scrittura.

**Terzo: l'asticella.** Il collaudo di fine lavoro ora fa anche una domanda in più: «hai
considerato almeno un'altra strada, e perché hai scelto questa?». Serve a non fermarsi alla prima
cosa che funziona. Detto in un altro modo: i primi due pezzi impediscono l'errore, il terzo alza
il risultato.

## Cosa cambia per te

Il terzo pezzo è **già acceso**. Gli altri due sono costruiti e provati, ma spenti: per accenderli
servono due righe nel file delle impostazioni, che per una regola di sicurezza giusta io non posso
toccare da sola. È il file che decide cosa la macchina può fare: se potessi modificarlo io, potrei
allargarmi i permessi da sola — e quella regola esiste apposta.

## Cosa devi fare

Nella coda «Da approvare» c'è la card **#prevenzione-a-monte** con le due righe esatte da
incollare e il punto preciso dove metterle. Cinque minuti. Dalla sessione dopo, i freni sono vivi.
E una cosa detta chiara per l'altra sessione: questa costruzione **sostituisce** quella che ti
aveva proposto — se le dai l'ok là, dille che AR-530 e AR-531 sono già presi qui, o nasce un doppione.

## Cosa non ho verificato

I due pezzi spenti li ho provati simulando l'aggancio a mano, col protocollo vero: non li ho
ancora visti scattare **dentro** una sessione cablata, perché l'interruttore è tuo. Al primo
scatto vero chiudo la scheda e ti mostro cosa hanno fermato.

### Dettagli tecnici

- Scheda: AR-531 (in corso — si chiude al primo scatto dal vivo dopo il cablaggio) · nata da AR-530.
- ① `cervello/contesto-lezioni.mjs --richiesta` (hook `UserPromptSubmit`): selezione per tema con
  soglia e tetto, correzioni di Nicola prioritarie; il modo `--hook` di SessionStart resta identico.
- ② `cervello/mano-fermata.mjs` (hook `PreToolUse` su `Edit|Write|MultiEdit`): riusa `sorveglia()`
  del sorvegliante — stesse esenzioni, stesso filtro commenti; rifiuto via `permissionDecision:
  "deny"`, fail-open su errore interno.
- ③ passo ④ di `righeCollaudo()` in `cervello/collaudo.mjs`.
- Prove: `node --test cervello/test/mano-fermata.test.mjs cervello/test/lezioni-su-misura.test.mjs
  cervello/test/collaudo.test.mjs` (45 verdi) · 3 mutazioni rosse:
  `node cervello/non-vacuita.mjs --difetti AR-531`.
- Cablaggio proposto (card #prevenzione-a-monte): `PreToolUse` → `mano-fermata --hook`,
  `UserPromptSubmit` → `contesto-lezioni --richiesta`, timeout 10s entrambi.
