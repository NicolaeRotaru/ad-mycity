#!/usr/bin/env node
// 🔧 APPLICA IL ROUND 4 (2026-07-25) — voce 3 della pagella: i freni di sicurezza. Idempotente.
//
// Perché esiste come script: cantiere-difetti.json pesa 141 KB e non passa dall'API GitHub, che è
// l'unico canale di pubblicazione di questa sessione. Stessa ragione del round 2.
//
// COSA FA, e perché ogni riscrittura è legittima.
// I tre bloccanti AR-123, AR-142, AR-151 avevano `verifica: {tipo:"umano"}`: nessun guardiano
// potrà MAI chiuderli, quindi la voce «freni rotti» non può arrivare a 0 per costruzione — lo stesso
// male che il round 2 ha smascherato. Cambiare la prova di un difetto è però anche il gesto con cui
// si potrebbe fingere una chiusura, quindi qui ogni prova nuova è agganciata a un fatto verificabile
// e NESSUNA chiude un difetto che non sia davvero risolto:
//
//   · AR-142 (permessi troppo larghi) → la prova diventa il GUARDIANO: «`permessi-check.mjs` esce 0».
//     Il difetto NON si chiude adesso: sul VPS il guardiano trova 11 violazioni, e le correzioni le
//     fa Nicola — la macchina non può toccarsi i permessi, `.claude/settings.json` le è negato in
//     Edit/Write apposta. Si chiuderà da solo quando l'ultima violazione sparisce.
//     Perché il guardiano e non un pattern: vedi il commento lungo sulla voce AR-142 qui sotto.
//     Due tentativi precedenti erano sbagliati, ed è documentato dove e perché.
//
//   · AR-151 (nessun audit delle chiusure passate) → la prova diventa: «esiste chiusure-audit.mjs
//     con la funzione riverifica». Il difetto chiedeva esattamente quel passo mancante, e ora c'è:
//     ri-esegue la prova di tutti i difetti chiusi e distingue regrediti / senza prova / prova debole.
//     Alla prima esecuzione ha già trovato una cosa vera: AR-037 risultava regredito e invece il fix
//     c'era — la sua prova conteneva un `$` che come regex non può mai matchare. Corretto in
//     auto-fix.mjs e nell'audit: un pattern vale anche come testo letterale.
//     RESTA APERTO un pezzo dichiarato in AR-151: l'estensione di AR-130 (34 file senza deferral,
//     non 8). Non è in questo round e non va spacciata per fatta.
//
//   · AR-123 (il Pannello cancella la chat aperta) → NON viene toccato. Il codice di oggi ha uno
//     stato conversazione separato e un bus dedicato (lib/chat-unificata.ts), quindi con ogni
//     probabilità è già risolto — ma è un bug di INTERFACCIA e l'unica prova onesta è guidare il
//     Pannello e guardarlo. Non l'ho fatto, quindi non gli do una prova: un difetto UX chiuso
//     leggendo il codice è esattamente il tipo di chiusura che AR-151 ci ha insegnato a diffidare.
//
// Uso:
//   node cervello/round4-applica.mjs --dry   -> dice cosa farebbe, non tocca nulla
//   node cervello/round4-applica.mjs         -> applica e ristampa lo stato

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT } from "./git-github.mjs";

const DRY = process.argv.includes("--dry");
const CANTIERE = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json");

const PROVE = [
  {
    id: "AR-142",
    // CORREZIONE (2026-07-25 04:10). La prima versione di questa prova puntava a
    // `.claude/settings.json` e dava per stretti 4 permessi su 5. Sbagliato: quella diagnosi è stata
    // fatta nella sessione cloud, dove `.claude/settings.local.json` NON ESISTE. Sul VPS esiste, ha
    // 33 allow e ZERO deny, e contiene TUTTI i permessi che AR-142 denunciava — git push diretto su
    // main, git merge generico, Write senza path, node /tmp/*.mjs, curl senza dominio — più nessun
    // divieto su .env e su settings.json stesso. Il guardiano nuovo l'ha rilevato al primo giro
    // sul VPS: 11 violazioni, 10 delle quali nel file locale.
    //
    // Con la prova vecchia il difetto si sarebbe chiuso da solo togliendo `curl` dal file SBAGLIATO,
    // mentre la macchina restava larga: la stessa trappola che questo round doveva estirpare.
    //
    // E nemmeno spostare il pattern sul file giusto bastava: `git push` compare sia fra i permessi
    // CONCESSI sia fra i DIVIETI, e una regex sul testo grezzo non li distingue — un file
    // configurato BENE sarebbe risultato sporco (provato). I divieti MANCANTI, poi, non sono
    // esprimibili affatto: non si cerca l'assenza di una regola in un elenco che non la contiene.
    // Per questo la prova è ora il GUARDIANO: l'unica cosa che legge la struttura e sa la verità.
    verifica: { comando: "node cervello/permessi-check.mjs" },
    nota:
      "Round 4 (corretto due volte). ① La prima diagnosi diceva «4 su 5 già stretti»: sbagliata, " +
      "misurata nella sessione cloud dove settings.local.json non esiste. Sul VPS quel file ha 33 allow " +
      "e 0 deny e contiene TUTTI i permessi contestati (11 violazioni totali). ② La prima correzione " +
      "usava file+pattern su settings.local.json: sbagliata anche quella, perché `git push` compare sia " +
      "fra i permessi sia fra i divieti e una regex sul testo grezzo non li distingue — un file " +
      "configurato bene sarebbe risultato sporco. ③ Ora la prova è il guardiano stesso: si chiude " +
      "quando `permessi-check.mjs` esce 0, cioè quando NON c'è più nessuna violazione in nessuno dei " +
      "due file, divieti mancanti compresi. È l'unica formulazione che dice la verità.",
  },
  {
    id: "AR-151",
    verifica: { file: "cervello/chiusure-audit.mjs", pattern: "export function riverifica", presente: true },
    nota:
      "Round 4: creato il passo di audit che mancava (cervello/chiusure-audit.mjs): ri-esegue la prova di " +
      "ogni difetto chiuso e separa regrediti / senza prova / prova debole (quest'ultima è l'errore di " +
      "AR-008: verificare contro un file che descrive). Prima esecuzione: 67 chiusi ricontrollati, 0 " +
      "regrediti reali, 22 senza prova, 4 con prova debole. Resta aperta l'estensione di AR-130 (34 file " +
      "senza deferral) dichiarata nello stesso difetto: NON è coperta da questo round.",
  },
];

if (!existsSync(CANTIERE)) {
  console.error(`❌ cantiere non trovato: ${CANTIERE}`);
  process.exit(1);
}
const cant = JSON.parse(readFileSync(CANTIERE, "utf8"));

const fatto = [], saltato = [];
for (const p of PROVE) {
  const d = (cant.difetti || []).find((x) => x.id === p.id);
  if (!d) {
    saltato.push(`${p.id}: non trovato nel cantiere`);
    continue;
  }
  // Idempotenza: confronto sulla prova INTERA, non sui singoli campi. Con le prove a comando
  // `file` e `pattern` sono entrambi undefined da tutte e due le parti, e un confronto campo-a-campo
  // dichiarava «già aggiornata» senza applicare niente — lo script sarebbe stato un no-op silenzioso.
  const uguale = d.verifica && JSON.stringify(d.verifica) === JSON.stringify(p.verifica);
  if (uguale) {
    saltato.push(`${p.id}: prova già aggiornata`);
    continue;
  }
  if (!DRY) {
    d.verifica = p.verifica;
    d.nota_round4 = p.nota;
  }
  const descrizione = p.verifica.comando
    ? `guardiano: \`${p.verifica.comando}\` deve uscire 0`
    : `${p.verifica.file} /${p.verifica.pattern}/ (presente:${p.verifica.presente})`;
  fatto.push(`${p.id}: prova «umana» → ${descrizione}`);
}

if (DRY) {
  console.log("→ DRY-RUN, niente scritto.");
  fatto.forEach((x) => console.log("   farebbe: " + x));
  saltato.forEach((x) => console.log("   salta:   " + x));
  process.exit(0);
}

if (fatto.length) writeFileSync(CANTIERE, JSON.stringify(cant, null, 2) + "\n", "utf8");
fatto.forEach((x) => console.log("✅ " + x));
saltato.forEach((x) => console.log("• " + x));

const bloccanti = (cant.difetti || []).filter((d) => d.gravita === "bloccante" && d.stato !== "chiuso");
console.log(`\nBloccanti ancora aperti: ${bloccanti.length} — ${bloccanti.map((d) => d.id).join(", ")}`);
console.log(`\nOra:  node cervello/auto-fix.mjs verifica --applica   (chiude ciò che risulta risolto)`);
console.log(`Poi:  node cervello/pagella-intelligenza.mjs --gate    (rimisura, deve restare 0 peggiorate)`);
