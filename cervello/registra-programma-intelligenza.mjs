#!/usr/bin/env node
// 🧬 REGISTRA IN MEMORIA IL PROGRAMMA INTELLIGENZA (round 1 e 2). Idempotente.
//
// Perché esiste. I round 1 e 2 sono nati per curare un difetto preciso: «la macchina fa il lavoro e
// poi non lo registra». Poi l'AD ha chiuso due lavori 🟡 e due PR mergiate senza scrivere una riga
// in DECISIONI, in STATO o nel quaderno del reparto — commettendo lo stesso difetto sopra il proprio
// lavoro. Nicola l'ha fatto notare (chat 25/7 ~02:45). Questo script mette in memoria ciò che è
// successo, così il round 3 parte dal cervello della macchina e non dalla clipboard di Nicola.
//
// Perché uno script e non un diff: DECISIONI.md (459KB) e STATO.md (412KB) sono troppo grossi per
// passare dall'API GitHub senza rischiare una trascrizione corrotta, e la sessione cloud non ha il
// permesso di git push. Stesso schema di round2-applica.mjs.
//
// Uso:
//   node cervello/registra-programma-intelligenza.mjs --dry   -> dice cosa farebbe
//   node cervello/registra-programma-intelligenza.mjs         -> scrive

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { AD_ROOT } from "./git-github.mjs";

const DRY = process.argv.includes("--dry");
const V = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI");

const MARCA_DEC = "Nasce il «programma intelligenza»";
const MARCA_STATO = "PROGRAMMA INTELLIGENZA: nasce la pagella";
const MARCA_ESITO = "#programma-intelligenza";

const DECISIONI = `- 2026-07-25 02:00 · 🟡 · [tech/AD] · **Nasce il «programma intelligenza»: Nicola decide che la macchina si concentra su SÉ STESSA finché non è pronta, e il round 1 gli dà una definizione di «pronta» che prima non esisteva (PR #534, mergiata).** Origine: Nicola chiede «la macchina è pronta a gestire il business? è abbastanza intelligente? sa ragionare correttamente?». Analisi: sa ragionare bene sul tecnico (contraddice Nicola quando ha ragione, rifiuta il blitz sui 16 difetti, salva 10.000€ bloccando una domanda PI26 incompleta) ma fallisce su due assi — applica il 17% delle lezioni che scrive e non sa prevedere le conseguenze delle proprie mosse (35 previsioni, 0 reparti affidabili, scarti >90%). Nicola: «voglio concentrarmi sul rendere la macchina sempre più intelligente finché non è davvero pronta, facciamo analisi su analisi». **Obiezione dell'AD, accettata:** «analisi su analisi» è la malattia, non la cura (93 difetti trovati, 62 chiusi) — il metodo diventa **misura → cambia → riverifica**. **Fatto (🟡, PR #534):** \`cervello/pagella-intelligenza.mjs\` — 5 numeri da fonti verificabili con soglie dichiarate PRIMA (lezioni ≥70% · calibrazione ≥5 reparti AD incluso · freni bloccanti = 0 · quaderni vivi ≥60% · salute ≥80) e un gate \`--gate\` che smaschera il fix finto (numero fermo dopo un fix dichiarato). Baseline: **0 voci su 5**. Provato in 3 casi prima di consegnare; i test hanno trovato 2 difetti miei, corretti (frecce ↑/↓ invertite sulle voci inverse; rumore di virgola mobile contato come miglioramento). · Nicola (chat 24/7 ~23:00, «vai»)

- 2026-07-25 02:00 · 🟡 · [tech/AD] · **Round 2 — scoperto che il registro dei difetti MENTE: un freno riparato veniva contato come rotto. Freni 8 → 6 (PR #535, mergiata).** Prima misura dopo il merge del round 1: la pagella segna «freni fermi a 8» nonostante il fix del budget-token fosse appena entrato (PR #519). Verificato di persona invece di fidarsi: il freno **scatta davvero** (99.999 stimati con soglia 1.000 → SOGLIA SUPERATA; 500 → nessun allarme). Non era il fix a essere finto: era il registro. **Due cause:** ① AR-144 marcato \`verifica:{tipo:"umano"}\` → nessun guardiano potrà mai chiuderlo; ② AR-117 con la prova puntata al file SBAGLIATO (cercava \`token_stimati\` in \`giro.sh\`, il fix è in \`costo-ai.mjs\`). Per \`auto-fix.mjs\` «pattern assente» e «puntatore rotto» sono indistinguibili. **Portata misurata: 29 difetti su 31 (94%) non chiudibili da nessun guardiano** — tutti e 8 i bloccanti inclusi: un numero che nessun lavoro normale poteva abbassare. **Fatto (🟡, PR #535):** \`cervello/cantiere-prove.mjs\` (classifica ogni prova: auto-ok/auto-attesa/auto-sospetta/umana, \`--gate\` fallisce se un bloccante non è verificabile) + \`cervello/round2-applica.mjs\` (idempotente, applica registro e aggancia i 2 guardiani al giro come INFORMATIVI — non hard, altrimenti bloccherebbero ogni giro dal primo minuto). Registro: AR-144 chiuso con prova · AR-117 chiuso (duplicato) · **AR-155 aperto** per il residuo onesto (il gate protegge con le STIME, manca il consumo reale e il test automatico). **Verificato da Nicola sul VPS: 4 controlli su 4 a posto.** · Nicola (chat 25/7 ~01:00-01:50)

- 2026-07-25 02:45 · 🟢 · [AD] · **Autocritica: il programma sull'«imparare a registrare» non era registrato da nessuna parte — scritto ora, dopo che Nicola l'ha fatto notare.** Nicola: «ricordami come sono nati questi round, hai capito cosa voglio dirti?». Verificato: 0 righe in DECISIONI datate 25/7, nessuna traccia in STATO/AZIONI/briefing, quaderno @tech fermo al 1/7 nonostante il lavoro della notte fosse suo. Due lavori 🟡, due PR mergiate, due strumenti agganciati al giro: nella memoria della macchina non era successo niente. **È lo stesso difetto diagnosticato stanotte in tre punti diversi** (quaderni fermi, lezioni al 18%, registro congelato) commesso una quarta volta dall'AD sopra il proprio lavoro. Aggravante: l'AD aveva consegnato a Nicola un **prompt da incollare** per il round 3, facendo di lui la memoria della macchina, e aveva *offerto* di salvarlo come se fosse un extra — mentre il mansionario (AR-009) lo impone dopo ogni lavoro 🟡. **Fatto ora (🧬):** riga ESITO in \`memoria-squadra/tech.md\`, queste 3 decisioni, entry in STATO, e il passaggio del round 3 scritto in memoria invece che nella chat. **Lezione strutturale:** un lavoro 🟡 non è finito quando la PR è mergiata, è finito quando la memoria lo sa. · Nicola (chat 25/7 ~02:45)
`;
const STATO = `> 🎓 **25/7 ~02:45 — PROGRAMMA INTELLIGENZA: nasce la pagella ("quando è pronta") e cade una bugia del registro. Freni 8 → 6.** Nicola chiede se la macchina è pronta a gestire il business e decide di concentrarsi su di lei finché non lo è. **Round 1 (PR #534):** creata la pagella dell'intelligenza — 5 numeri con soglie dichiarate prima (lezioni ≥70% · calibrazione ≥5 reparti · freni bloccanti 0 · quaderni vivi ≥60% · salute ≥80) e un gate che smaschera il fix finto. **Oggi: 0 voci su 5** (lezioni 18% · calibrazione 0 reparti · freni 6 · quaderni 31/120 · salute 43/100). **Round 2 (PR #535):** la pagella al primo uso segna "freni fermi" dopo un fix appena mergiato → verificato di persona che il freno budget-token **scatta davvero** (99.999 con soglia 1.000 → SOGLIA SUPERATA); a mentire era il registro. Scoperto che **27 difetti su 30 non sono chiudibili da nessun guardiano** (prova umana o puntatore al file sbagliato) — i 13 "sospetti" hanno tutti la stessa età, 9 giorni: le prove sono nate descrivendo il fix voluto, non un controllo verificabile. Verificato da Nicola sul VPS: **4 controlli su 4**. **Prossimo (round 3, sessione nuova):** AR-110 (firma→esecuzione) e AR-109 (colore auto-dichiarato) — prima verificare se esistono ancora, poi scrivere. Passaggio completo in [[CONSEGNA-ROUND-3]]. Fonte: chat 24-25/7 + PR #534/#535 mergiate + verifica VPS di Nicola.`;

const fatto = [], saltato = [];

// ① DECISIONI — append-only, mai riscrivere le righe vecchie
const pDec = join(V, "DECISIONI.md");
if (!existsSync(pDec)) saltato.push("DECISIONI.md non trovato");
else if (readFileSync(pDec, "utf8").includes(MARCA_DEC)) saltato.push("DECISIONI: già registrate");
else {
  if (!DRY) writeFileSync(pDec, readFileSync(pDec, "utf8") + "\n" + DECISIONI, "utf8");
  fatto.push("DECISIONI: 3 voci appese (nascita programma, round 2, autocritica)");
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
    t = t.replace(/^aggiornato: .*$/m, "aggiornato: 2026-07-25 02:45");
    if (!DRY) writeFileSync(pSta, t, "utf8");
    fatto.push("STATO: voce in cima + data aggiornata");
  }
}

// ③ ESITO nel quaderno del reparto che ha fatto il lavoro (AR-009) — via lo strumento ufficiale,
//    così alimenta anche la calibrazione (atteso→reale) invece di essere solo testo.
const pTech = join(AD_ROOT, "memoria-squadra/tech.md");
if (existsSync(pTech) && readFileSync(pTech, "utf8").includes(MARCA_ESITO)) {
  saltato.push("ESITO @tech: già registrato");
} else if (DRY) {
  fatto.push("ESITO @tech: da registrare (chiusura-loop)");
} else {
  const r = spawnSync(process.execPath, [
    join(AD_ROOT, "cervello/chiusura-loop.mjs"), "registra", "tech",
    "Programma intelligenza round 1+2 (notte 24-25/7): pagella dell'intelligenza + guardiano delle prove del cantiere",
    "7/10 — i due strumenti funzionano e Nicola li ha verificati con 4 controlli su 4; ma ho consegnato un comando di verifica rotto (mancava oggi.data: il cambio giorno azzerava il contatore) e ho indovinato due volte il percorso VPS invece di leggerlo nella repo",
    "chiudere 2 freni bloccanti e rendere misurabile 'quando e pronta'",
    "freni 8->6 con prova end-to-end del freno budget; definizione di pronta = 5 soglie; scoperto che 27 difetti su 30 nessun guardiano puo chiuderli; PR #534 e #535 mergiate",
    "#programma-intelligenza #pagella #cantiere-prove #round2",
  ], { encoding: "utf8", timeout: 60000 });
  fatto.push(r.status === 0 ? "ESITO @tech registrato (+ calibrazione)" : "ESITO @tech: chiusura-loop ha fallito");
}

console.log(`\n🧬 MEMORIA PROGRAMMA INTELLIGENZA — ${DRY ? "PROVA A SECCO" : "scritta"}\n`);
for (const x of fatto) console.log(`   ✅ ${x}`);
for (const x of saltato) console.log(`   ⏭️  ${x}`);
console.log(fatto.length ? "\n   Passaggio round 3: MyCity-Vault/90-Memoria-AI/CONSEGNA-ROUND-3.md\n" : "\n   Nulla da fare.\n");
process.exit(0);
