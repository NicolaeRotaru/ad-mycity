#!/usr/bin/env node
// 🧬 REGISTRA IN MEMORIA LA RIVERIFICA DEL PROGRAMMA (25/7 04:43, PR #545). Idempotente.
//
// Perché esiste. Il programma intelligenza esisteva già (PR #540). PR #542 si intitolava
// «freni 4 → 3» ma aveva soltanto SCRITTO lo script della correzione senza eseguirlo: per 50
// minuti PROGRAMMA-INTELLIGENZA.md ha dichiarato «4 bloccanti» mentre il cantiere ne segnava 3.
// È lo stesso difetto che il programma condanna in C3 — dichiarare fatto ciò che è solo scritto —
// commesso sopra il programma stesso. Questa volta lo script è stato eseguito, il documento
// riverificato (13 comandi su 13) e la memoria lo deve sapere.
//
// Perché uno script e non un diff: DECISIONI.md (459KB) e STATO.md (412KB) sono troppo grossi per
// passare dall'API GitHub senza rischiare una trascrizione corrotta, e la sessione cloud non ha il
// permesso di `git push` (AR-142). Stesso schema di registra-programma-intelligenza.mjs.
//
// La riga ESITO nel quaderno di @AD è GIÀ stata registrata e pubblicata nella PR #545: qui non si
// rifà, altrimenti si conterebbe due volte nella calibrazione.
//
// Uso (sul VPS, in /opt/mycity/ad-mycity):
//   node cervello/registra-riverifica-programma.mjs --dry   -> dice cosa farebbe, non scrive
//   node cervello/registra-riverifica-programma.mjs         -> scrive

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT } from "./git-github.mjs";

const DRY = process.argv.includes("--dry");
const V = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI");

const MARCA_DEC = "uno script scritto e mai eseguito";
const MARCA_STATO = "PROGRAMMA RIVERIFICATO";

const DECISIONI = `- 2026-07-25 04:43 · 🟡 · [AD] · **Riverifica del programma intelligenza: trovato «uno script scritto e mai eseguito», corretti 8 numeri superati, rieseguiti tutti i 13 comandi (PR #545).** Origine: richiesta di costruire il programma «perché non esiste la lista di cosa fare». **Verificato invece di dedurre: esisteva già** (PR #540, 13 cantieri completi). Il lavoro che restava era un altro. **La scoperta:** PR #542 si intitola «Correzione del programma: freni 4 → 3» ma aveva soltanto SCRITTO \`cervello/programma-correzione-ar114.mjs\` **senza eseguirlo** — per 50 minuti il documento ha detto «4 bloccanti aperti: AR-114, AR-123, AR-142, AR-151» mentre il cantiere ne segnava 3. È **lo stesso difetto che il programma condanna in C3 e nella regola del ciclo** (dichiarare fatto ciò che è solo scritto), commesso sopra il programma stesso. **Fatto (🟡, PR #545):** ① eseguito lo script (14 sostituzioni, ri-misura interna confermata: 3 bloccanti · 26 aperti · 68 chiusi); ② chiusi 8 residui che lo script non copriva (titolo C2 «25 difetti», «Su 27 difetti aperti», «11 prove sospette», «i quattro freni», «i 4 fix», «~67 chiusure», «freni 4 → 0», C10 fermo al 76%); ③ ri-misurata la quota di sforzo macchina-vs-business: **76% → 78%** (1321 file macchina · 375 business · 202 non classificati, 7 giorni); ④ rieseguito OGNI comando del documento e aggiunta la sezione «Riverifica» con l'output vero — **13 su 13 combaciano**. **Tre cose emerse:** (a) la chiusura di AR-114 è **legittima ma con prova debole** — cerca la stringa \`consegne/tech\` che compare anche in un commento (riga 46), la firma esatta del falso positivo di C3; il codice sotto però esiste davvero (classificazione macchina/business, righe 62-84) → prova da rifare in C2; (b) **AR-155 è ancora chiuso senza fix** (\`cattura consumo reale: 0 · token contati oggi: 0\`), come C3 denunciava; (c) **la coda non è di 140 card ma di 50** — il 140 contava anche le 98 già chiuse e archiviate nello stesso file (\`housekeeping-azioni.mjs --dry-run\`): non è un dettaglio, 140 sembra ingestibile, 50 in tre blocchi è una seduta. **Non toccato di proposito:** soglie della pagella e definizione di «lezione applicata» — sono il metro con cui la macchina viene giudicata, e restano proposte in attesa della firma di Nicola (verità A e C del documento). **Prova di integrità:** il file caricato ha impronta \`0167f8424079f21126f07ebd23f5e6eafa0dc34b\` e 51654 byte, identiche alla copia locale verificata con \`git hash-object\` — nessuna trascrizione corrotta. · AD (sessione cloud 25/7 ~04:00-05:00)
`;

const STATO = `> 🗺️ **25/7 ~04:43 — PROGRAMMA RIVERIFICATO: il programma esisteva già, il difetto era «uno script scritto e mai eseguito». Freni 4 → 3 (PR #545).** Richiesta: «costruisci il programma, non esiste la lista di cosa fare». Verificato invece di dedurre: **esisteva già** (PR #540, 13 cantieri). Il lavoro vero era un altro: **PR #542 si intitolava «freni 4 → 3» ma non aveva eseguito la propria correzione** — per 50 minuti il documento ha dichiarato 4 bloccanti mentre il cantiere ne segnava 3. Stesso difetto che il programma condanna in C3, commesso sul programma stesso. **Fatto:** script eseguito (14 sostituzioni) + 8 residui numerici chiusi + quota sforzo macchina ri-misurata **76% → 78%** + **tutti i 13 comandi rieseguiti, 13 su 13 combaciano** (sezione «Riverifica» nel documento). **Emerso:** AR-114 chiuso legittimamente ma con **prova debole** (matcha un commento — da rifare in C2) · **AR-155 ancora chiuso senza fix** (consumo reale = 0) · **la coda è di 50 card, non 140** (le altre 98 sono già chiuse e archiviate). **Restano 3 bloccanti:** AR-123, AR-142, AR-151. **In attesa della firma di Nicola:** le due scelte sul metro (verità A — soglie ostaggio della pausa business; verità C — il 70% delle lezioni aritmeticamente irraggiungibile con 473 lezioni mai potate). Programma completo in [[PROGRAMMA-INTELLIGENZA]]. Fonte: PR #545 + 13 comandi eseguiti sul repo.`;

const fatto = [];
const saltato = [];

// ① DECISIONI — append-only, mai riscrivere le righe vecchie
const pDec = join(V, "DECISIONI.md");
if (!existsSync(pDec)) saltato.push("DECISIONI.md non trovato");
else if (readFileSync(pDec, "utf8").includes(MARCA_DEC)) saltato.push("DECISIONI: già registrata");
else {
  if (!DRY) writeFileSync(pDec, readFileSync(pDec, "utf8") + "\n" + DECISIONI, "utf8");
  fatto.push("DECISIONI: 1 voce appesa (riverifica del programma, PR #545)");
}

// ② STATO — la voce va IN CIMA, subito dopo il frontmatter
const pSta = join(V, "STATO.md");
if (!existsSync(pSta)) saltato.push("STATO.md non trovato");
else {
  let t = readFileSync(pSta, "utf8");
  if (t.includes(MARCA_STATO)) saltato.push("STATO: già aggiornato");
  else {
    const fine = t.indexOf("---", 4);
    const dopo = t.indexOf("\n", fine) + 1;
    t = t.slice(0, dopo) + "\n" + STATO + "\n" + t.slice(dopo);
    t = t.replace(/^aggiornato: .*$/m, "aggiornato: 2026-07-25 04:43");
    if (!DRY) writeFileSync(pSta, t, "utf8");
    fatto.push("STATO: voce in cima + data aggiornata");
  }
}

console.log(`\n🧬 MEMORIA RIVERIFICA PROGRAMMA — ${DRY ? "PROVA A SECCO" : "scritta"}\n`);
for (const x of fatto) console.log(`   ✅ ${x}`);
for (const x of saltato) console.log(`   ⏭️  ${x}`);
console.log(
  fatto.length
    ? `\n   Riverifica:  node cervello/pagella-intelligenza.mjs --gate\n   (la riga ESITO di @AD è già in memoria-squadra/AD.md, pubblicata con la PR #545)\n`
    : "\n   Nulla da fare: la memoria è già aggiornata.\n"
);
process.exit(0);
