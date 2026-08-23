#!/usr/bin/env node
// 🔐 L'ELENCO DEGLI SCRIPT CHE QUALCUNO LANCIA DAVVERO — generato, non tenuto a mano.
//
// ─────────────────────────────────────────────────────────────────────────────
// PERCHÉ ESISTE
// ─────────────────────────────────────────────────────────────────────────────
// AR-206: nel foglio dei permessi ci sono due righe col jolly — `node cervello/*.mjs` e
// `bash cervello/*.sh`. Non dicono «può lanciare questi programmi»: dicono «può lanciare qualunque
// programma finisca in quella cartella», e quella cartella la scrive la macchina stessa. I freni
// veri (la pausa, la firma di Nicola, l'elenco dei destinatari) vivono DENTRO i singoli script: col
// jolly si arriva al risultato senza passare dallo script che contiene il freno.
//
// La cura è un elenco esplicito, e `.claude/settings.json` lo tocca solo Nicola — la macchina è
// negata in scrittura lì apposta, e scavalcare quel confine per chiudere un difetto sul confine
// sarebbe assurdo.
//
// ─────────────────────────────────────────────────────────────────────────────
// PERCHÉ GENERATO E NON SCRITTO A MANO
// ─────────────────────────────────────────────────────────────────────────────
// L'elenco esiste dal 29/7 in `consegne/sicurezza/`, curato a mano. È già stato ritoccato una volta
// (il 13/8, cinque script nati dopo). Misurato oggi, 23/8: la cartella porta 261 file `.mjs` e 18
// `.sh`, e la lista è ferma a quel ritocco.
//
// Un elenco tenuto a mano invecchia in silenzio, e invecchiando diventa peggio che inutile: il
// giorno che Nicola lo applica, gli script nati nel frattempo smettono di partire — cioè la cura
// rompe il giro, e la prossima volta nessuno la applica più. Qui l'elenco si RICALCOLA da chi
// lancia davvero, quindi non può restare indietro senza che si veda.
//
// 🟢 Sola lettura: legge il repo e stampa. Non tocca i permessi, che non sono suoi.
//
// Uso:
//   node cervello/permessi-elenco.mjs            → il blocco pronto da incollare
//   node cervello/permessi-elenco.mjs --json     → l'elenco in JSON
//   node cervello/permessi-elenco.mjs --consegna → riscrive la consegna che Nicola legge
//   node cervello/permessi-elenco.mjs --scaduto  → exit 1 se la consegna di Nicola è indietro

import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT } from "./git-github.mjs";

const JSON_MODE = process.argv.includes("--json");
const SCADUTO = process.argv.includes("--scaduto");
const SCRIVI = process.argv.includes("--consegna");

/** La consegna che Nicola ha in mano: è lei che deve restare al passo. */
export const CONSEGNA = "consegne/sicurezza/2026-07-29-permessi-senza-jolly.md";

/**
 * DOVE SI GUARDA CHI LANCIA.
 *
 * Non «tutti i file che esistono»: i file che qualcuno ESEGUE. Un modulo che serve solo a essere
 * importato non ha bisogno di un permesso di esecuzione, e metterlo nell'elenco allargherebbe il
 * perimetro proprio mentre si dice di restringerlo.
 */
const CHI_LANCIA = [
  "cervello/giro.sh",
  "cervello/worker.sh",
  "cervello/cancello-lotto.mjs",
  "cervello/test-cervello.mjs",
  "CLAUDE.md",
  "COMANDI.md",
];

/** Le cartelle dove stanno gli altri lanciatori: CI, avvio del VPS, skill. */
const CARTELLE_LANCIATRICI = [".github/workflows", "cervello/vps", ".claude/skills", ".claude/commands"];

/** Un file che si esegue, non un modulo che si importa. */
const ESEGUIBILI = /\.(mjs|sh)$/;

function fileDi(relDir) {
  const abs = join(AD_ROOT, relDir);
  if (!existsSync(abs)) return [];
  const out = [];
  const scendi = (dir, rel) => {
    let voci;
    try {
      voci = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const v of voci) {
      if (v.name === "node_modules" || v.name.startsWith(".git")) continue;
      if (v.isDirectory()) scendi(join(dir, v.name), `${rel}/${v.name}`);
      else out.push(`${rel}/${v.name}`);
    }
  };
  scendi(abs, relDir);
  return out;
}

/**
 * Gli script nominati in un testo come cosa da ESEGUIRE.
 *
 * Si cerca la forma dell'esecuzione — `node cervello/x.mjs`, `bash cervello/x.sh`, `$SCRIPT_DIR/x.mjs`
 * — non il nome nudo: `cervello/x.mjs` citato in una frase è una citazione, non un lancio, e
 * contarla metterebbe nell'elenco file che nessuno avvia.
 */
/**
 * Il nome dello script relativo alla cartella del cervello, o `null` se sta fuori.
 *
 * I lanci arrivano in cinque forme diverse — `$SCRIPT_DIR/x.mjs`, `$REPO/cervello/x.mjs`,
 * `cervello/x.mjs`, `./x.mjs`, e sul VPS il percorso assoluto `/opt/mycity/ad-mycity/cervello/x.sh`.
 * Senza normalizzarle, gli assoluti entravano nell'elenco col percorso intero e non combaciavano con
 * nessun file: dodici righe che dicevano «nominato ma non esiste» mentre esistevano eccome.
 */
function dentroIlCervello(grezzo) {
  let s = String(grezzo).replace(/^["']/, "");
  // PRIMA occorrenza, non l'ultima: con `lastIndexOf` un percorso come
  // `/opt/mycity/ad-mycity/cervello/vps/collega-claude.sh` perdeva il segmento `vps/`, e i tre
  // script che stanno lì dentro risultavano «nominati ma non esistono» mentre esistono eccome.
  const i = s.indexOf("cervello/");
  if (i >= 0) s = s.slice(i + "cervello/".length);
  else s = s.replace(/^\.\//, "").replace(/^\$\{?SCRIPT_DIR\}?\//, "");
  // Un percorso che continua a uscire dalla cartella non lo copre questo elenco.
  if (!s || s.startsWith("..") || s.startsWith("/") || s.includes("$")) return null;
  return s;
}

export function scriptLanciatiIn(testo) {
  const trovati = new Set();
  const forme = [/\bnode\s+["']?([\w$${}./-]+\.mjs)/g, /\bbash\s+["']?([\w$${}./-]+\.sh)/g];
  for (const re of forme) {
    for (const m of String(testo).matchAll(re)) {
      const nome = dentroIlCervello(m[1]);
      if (nome) trovati.add(nome);
    }
  }
  return trovati;
}

/** L'elenco: chi viene lanciato E esiste davvero sul disco. */
export function elencoAmmesso(leggi = (f) => readFileSync(join(AD_ROOT, f), "utf8"), esiste = (f) => existsSync(join(AD_ROOT, f))) {
  const fonti = [...CHI_LANCIA, ...CARTELLE_LANCIATRICI.flatMap(fileDi).filter((f) => /\.(ya?ml|sh|mjs|md)$/.test(f))];
  const nominati = new Set();
  for (const f of fonti) {
    let txt;
    try {
      txt = leggi(f);
    } catch {
      continue; // una fonte illeggibile non allarga l'elenco: al massimo lo lascia più stretto
    }
    for (const s of scriptLanciatiIn(txt)) nominati.add(s);
  }
  // Un nome lanciato che sul disco non c'è NON entra: un permesso per un file che non esiste è un
  // permesso che aspetta qualcuno che lo crei — cioè esattamente il jolly, scritto una riga alla volta.
  const veri = [...nominati].filter((s) => ESEGUIBILI.test(s) && esiste(`cervello/${s}`)).sort();
  return {
    mjs: veri.filter((s) => s.endsWith(".mjs")),
    sh: veri.filter((s) => s.endsWith(".sh")),
    nominati_ma_assenti: [...nominati].filter((s) => ESEGUIBILI.test(s) && !esiste(`cervello/${s}`)).sort(),
  };
}

/** Il blocco pronto da incollare in `.claude/settings.json`. */
export function bloccoDaIncollare({ mjs, sh }) {
  const riga = (cmd, s) => `      "Bash(${cmd} cervello/${s}:*)",`;
  return [...mjs.map((s) => riga("node", s)), ...sh.map((s) => riga("bash", s))].join("\n");
}

/** Quali script lanciati NON sono nella consegna che Nicola ha in mano. */
export function mancantiNellaConsegna(elenco, testoConsegna) {
  const dentro = new Set([...String(testoConsegna).matchAll(/Bash\((?:node|bash) cervello\/([\w./-]+):\*\)/g)].map((m) => m[1]));
  return [...elenco.mjs, ...elenco.sh].filter((s) => !dentro.has(s));
}

/**
 * Il testo della consegna, scritto QUI e non a mano.
 *
 * Il documento lo legge Nicola, quindi deve rispettare le regole della scrittura di casa: i blocchi
 * in cima, un esempio concreto, una frase un'idea. Se il modello vivesse fuori dal generatore, la
 * prima rigenerazione se lo porterebbe via — e sarebbe la stessa malattia dell'elenco: una cosa
 * curata a mano che il primo passaggio automatico cancella.
 */
export function testoConsegna({ mjs, sh }) {
  const righe = (cmd, elenco) => elenco.map((s) => `      "Bash(${cmd} cervello/${s}:*)",`).join("\n");
  return `# 🔐 L'elenco dei programmi che la macchina può lanciare

> ⚙️ **Questo file è GENERATO. Non correggerlo a mano.** Si rifà con
> \`node cervello/permessi-elenco.mjs --consegna\`, e una prova diventa rossa il giorno che qualcuno
> aggiunge uno script al giro senza rigenerarlo.

## In due righe

Oggi due righe del foglio dei permessi dicono «puoi lanciare qualunque programma finisca in quella
cartella», e quella cartella la scrive la macchina stessa.
Qui sotto c'è l'elenco esplicito che le sostituisce: **${mjs.length} programmi e ${sh.length} script di avvio.**

## In parole semplici

Un permesso è una lista di cose che si possono fare. Queste due righe non lo sono:

    "Bash(node cervello/*.mjs:*)"

L'asterisco vuol dire «qualunque nome». Ce n'è una identica per gli script di avvio. Quindi il permesso non è su un elenco di programmi, è su
*qualunque programma finisca lì dentro* — e lì dentro ci scrive la macchina.

**Per esempio.** I freni veri non stanno nel foglio dei permessi: stanno dentro ai singoli
programmi. Quello che manda un messaggio a un cliente controlla di avere la tua firma. Quello che
spende controlla il tetto. Ma se io posso scrivere un programma nuovo in quella cartella e lanciarlo,
arrivo allo stesso risultato senza passare da nessuno dei due.

Non sto dicendo che sia successo. Sto dicendo che oggi nessuno lo impedirebbe.

## Cosa cambia per te

Nel foglio \`.claude/settings.json\`, sostituisci la riga \`"Bash(node cervello/*.mjs:*)"\` con queste
${mjs.length}:

\`\`\`json
${righe("node", mjs)}
\`\`\`

E la riga \`"Bash(bash cervello/*.sh:*)"\` con queste ${sh.length}:

\`\`\`json
${righe("bash", sh)}
\`\`\`

Poi lancia \`node cervello/permessi-check.mjs\`: quella segnalazione sparisce.

Da lì in avanti, se serve un programma nuovo il permesso si aggiunge a mano. **Aggiungere una riga
si vede. L'asterisco no.**

## Cosa devi fare

Aprire quel foglio e incollare i due blocchi. È l'unica cosa che serve, e la può fare solo tu: quel
file è negato in scrittura alla macchina *apposta*, perché non deve poter toccare i propri permessi
né per allargarli né per restringerli.

## Cosa non ho verificato

**Non ho provato ad applicarlo.** Non posso, ed è giusto così. L'elenco l'ho ricavato leggendo chi
lancia davvero, e una prova conferma che copre tutto quello che si lancia oggi. Ma che il giro
continui a girare dopo la sostituzione si vede solo dopo.

**Restano fuori due parti**, per un lotto a sé. La prima è il controllo di provenienza su ogni
script: se il file su disco non corrisponde alla versione pubblicata, non parte. La seconda sono le
chiavi, che vanno tenute fuori dall'ambiente del worker.

---

### Dettagli tecnici

**Perché generato.** La versione precedente era curata a mano, ed era già stata ritoccata una volta
il 13/8 per cinque script nati dopo. Misurata il 23/8 era indietro di **51**. Non è manutenzione: il
giorno che la si applica, quei 51 programmi smettono di partire. La cura rompe il giro, e la volta
dopo nessuno la applica più. Un elenco che invecchia in silenzio è peggio di nessun elenco, perché
sembra pronto.

**Come si ricava.** \`cervello/permessi-elenco.mjs\` cerca la forma dell'ESECUZIONE — \`node x.mjs\`,
\`bash x.sh\`, nelle cinque varianti che il repo usa davvero, percorso assoluto del server compreso —
e non il nome nudo: un file citato in una frase è una citazione, non un lancio. Le fonti sono chi
lancia: il giro, il worker, il cancello del lotto, la suite, la CI, i timer del server, le skill,
CLAUDE.md e COMANDI.md.

**Due scelte prudenti.** Uno script nominato ma non presente sul disco resta fuori: un permesso per
un file che non esiste è un permesso che aspetta qualcuno che lo crei, cioè l'asterisco scritto una
riga alla volta. E una fonte illeggibile lascia l'elenco più stretto, mai più largo — un errore di
lettura non deve poter allargare il perimetro.

**Difetto:** AR-206, parte (a). La parte (b) — la regola \`no-jolly-su-cartella-scrivibile\` in
\`permessi-check.mjs\` — esiste dal lotto 33 e funziona.

**Prova:** \`node --test cervello/test/l-elenco-dei-permessi-che-invecchia.test.mjs\` — 11 casi, di cui
uno sul repo vero che diventa rosso quando questa consegna resta indietro.
`;
}

function main() {
  const elenco = elencoAmmesso();
  const consegna = existsSync(join(AD_ROOT, CONSEGNA)) ? readFileSync(join(AD_ROOT, CONSEGNA), "utf8") : "";
  const mancanti = consegna ? mancantiNellaConsegna(elenco, consegna) : [];

  if (SCRIVI) {
    // 🟡 scrive UN file solo, la consegna che Nicola legge. Non tocca i permessi: quelli non sono suoi.
    writeFileSync(join(AD_ROOT, CONSEGNA), testoConsegna(elenco), "utf8");
    console.log(`✅ consegna riscritta: ${CONSEGNA} — ${elenco.mjs.length} programmi e ${elenco.sh.length} script di avvio.`);
  } else if (JSON_MODE) {
    console.log(JSON.stringify({ ...elenco, consegna: CONSEGNA, mancanti_nella_consegna: mancanti }, null, 2));
  } else if (SCADUTO) {
    if (!consegna) {
      console.error(`⚪ la consegna non c'è (${CONSEGNA}): non ho potuto confrontare niente.`);
      process.exit(2);
    }
    if (mancanti.length) {
      console.error(`❌ la consegna che Nicola ha in mano è indietro di ${mancanti.length} script: ${mancanti.join(", ")}`);
      console.error(`   Applicarla così spegnerebbe proprio quegli script. Rigenera il blocco con: node cervello/permessi-elenco.mjs`);
      process.exit(1);
    }
    console.log(`✅ la consegna copre tutti i ${elenco.mjs.length + elenco.sh.length} script che qualcuno lancia.`);
  } else {
    console.log(`# ${elenco.mjs.length} script .mjs e ${elenco.sh.length} .sh che qualcuno lancia davvero\n`);
    console.log(bloccoDaIncollare(elenco));
    if (elenco.nominati_ma_assenti.length) {
      console.log(`\n# nominati da qualcuno ma NON presenti sul disco (fuori dall'elenco apposta): ${elenco.nominati_ma_assenti.join(", ")}`);
    }
  }
  if (!SCADUTO) process.exit(0);
}

if (process.argv[1] && process.argv[1].endsWith("permessi-elenco.mjs")) main();
