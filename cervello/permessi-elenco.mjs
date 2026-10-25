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
  // 25/10 — il metodo del lotto del sito. COMANDI.md («chiudi i gravi del sito») rimanda qui per i
  // passi, e uno di quei passi — `chiudi-sito.mjs`, la chiusura nel registro del sito — si lancia a
  // mano e non lo nominava nessun lanciatore: era entrato nella consegna aggiunto a mano il 9/9, e
  // la prima rigenerazione l'avrebbe tolto.
  "cervello/lotto-a-pacchetti.md",
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
  // PRIMA occorrenza, non l'ultima.
  //
  // ⚠️ 27/8 — QUI SOPRA C'ERA UNA SPIEGAZIONE FALSA, e la correggo invece di lasciarla. Diceva che
  // con `lastIndexOf` un percorso come `/opt/mycity/ad-mycity/cervello/vps/collega-claude.sh`
  // perdeva il segmento `vps/`. Non è vero: lì «cervello/» compare UNA volta sola, quindi le due
  // funzioni danno lo stesso indice. Misurato sui lanci veri dell'elenco: **zero** contengono
  // «cervello/» più di una volta, quindi oggi la scelta non cambia nessun risultato.
  //
  // Resta la scelta giusta lo stesso, e per un motivo che si può dire senza inventare: un percorso
  // annidato — `$REPO/cervello/test/cervello/x.mjs` — con `lastIndexOf` perderebbe `test/cervello/`
  // e il file risulterebbe «nominato ma non esiste» mentre esiste. È un caso che oggi non capita, e
  // la prova che lo tiene fermo lo dice: è costruito, non pescato dai dati.
  const i = s.indexOf("cervello/");
  if (i >= 0) s = s.slice(i + "cervello/".length);
  // 25/10 — anche `${SCRIPT_DIR:-cervello}/` e `${SCRIPT_DIR:-.}/`, la forma col valore di riserva
  // che usano le librerie caricate dal giro e dal worker: prima restava il `$` e il lancio spariva.
  else s = s.replace(/^\.\//, "").replace(/^\$(?:SCRIPT_DIR|\{SCRIPT_DIR(?::-[^}]*)?\})\//, "");
  // Un percorso che continua a uscire dalla cartella non lo copre questo elenco.
  //
  // ⚠️ 27/8, AR-846 — QUESTO CONTROLLO GUARDAVA SOLO L'INIZIO. `startsWith("..")` fermava
  // `../fuori.mjs`, e lasciava passare `cervello/a/../../../etc/passwd.mjs`, che dopo il taglio
  // diventa `a/../../../etc/passwd.mjs`: un nome che esce dal repo dentro l'elenco dei permessi.
  // Trovato dalla lente della sicurezza sul perimetro toccato, eseguendo invece di rileggere.
  // Adesso si guarda OGNI segmento: un `..` in mezzo esce come uno in testa.
  if (!s || s.startsWith("/") || s.includes("$")) return null;
  if (s.split("/").some((pezzo) => pezzo === "..")) return null;
  return s;
}

/** Un percorso come lo scrive la shell, compreso `${VAR:-riserva}`. */
const PERCORSO = /(?:\$\{\w+:-[^}\s"']*\}|[\w$${}./-])+/.source;

/** Una riga che la shell non esegue. */
const COMMENTO = /^\s*#/;

/**
 * `lanciatori` sono le funzioni di casa che lanciano lo script ricevuto come primo argomento — oggi
 * `sensore` e `guardiano` di `cervello/giro-esito.sh`. Si contano solo nelle righe di shell che non
 * sono commenti: «guardiano» è anche una parola italiana, e una frase che la usa non è un lancio.
 */
export function scriptLanciatiIn(testo, lanciatori = new Set()) {
  const trovati = new Set();
  // `Bash(node cervello/x.mjs:*)` è un PERMESSO scritto, non un lancio: `motore-ai.sh` ne porta una
  // lista, e contarla metteva nell'elenco `git-github.mjs`, che è un modulo senza comando.
  const forme = [new RegExp(String.raw`(?<!Bash\()\bnode\s+["']?(${PERCORSO}\.mjs)`, "g"), new RegExp(String.raw`(?<!Bash\()\bbash\s+["']?(${PERCORSO}\.sh)`, "g")];
  for (const re of forme) {
    for (const m of String(testo).matchAll(re)) {
      const nome = dentroIlCervello(m[1]);
      if (nome) trovati.add(nome);
    }
  }
  if (lanciatori.size) {
    const re = new RegExp(String.raw`(?:^|[\s;&|(!])(?:${[...lanciatori].join("|")})\s+["']?([\w./-]+\.mjs)`, "g");
    for (const riga of String(testo).split("\n")) {
      if (COMMENTO.test(riga)) continue;
      for (const m of riga.matchAll(re)) {
        const nome = dentroIlCervello(m[1]);
        if (nome) trovati.add(nome);
      }
    }
  }
  return trovati;
}

/**
 * Le funzioni della shell che lanciano uno script il cui nome arriva da una variabile.
 *
 * 25/10 — IL DIFETTO CHE L'HA FATTA NASCERE. AR-859 ha convertito le righe dei sensori alla forma
 * `sensore "taste-file.mjs" 2 --sonda`: il `node` c'è ancora, ma sta dentro la funzione, e la riga
 * che lancia non lo nomina più. Lo strumento cercava solo `node x.mjs`, quindi a ogni riga convertita
 * uno script spariva dall'elenco senza che niente diventasse rosso. Il 1/9 (#858) la consegna
 * rigenerata ne ha persi cinque — bilancio-vivo, guardiano-tempo, metabolismo, midollo-spinale,
 * sentinella-fonti — e il 25/10 ne stavano per sparire altri due.
 *
 * La funzione si riconosce dal CORPO, non dal nome: un `node "<cartella>/$variabile"`, dove la
 * variabile è il primo argomento (`$1`, o `local _script="$1"`). Così un lanciatore nuovo scritto
 * domani entra da solo, invece di aspettare che qualcuno aggiorni un elenco di nomi — che sarebbe la
 * stessa malattia, spostata di un piano.
 */
export function lanciatoriIn(testo) {
  const nomi = new Set();
  const lancia = /\bnode\s+["']?\$\{?\w+(?::-[^}]*)?\}?\/\$\{?(\w+)\}?["'\s]/;
  const definizione = /^\s*(?:function\s+)?([A-Za-z_]\w*)\s*\(\)\s*\{(.*)$/;
  const quante = (s, c) => s.split(c).length - 1;
  const righe = String(testo).split("\n");
  for (let i = 0; i < righe.length; i++) {
    const def = righe[i].match(definizione);
    if (!def) continue;
    // Una funzione su una riga sola finisce lì: senza questo, `ts() { date; }  # ora` si prenderebbe
    // il corpo della funzione dopo. Si contano le graffe, perché una coda (`;`, un commento) non
    // cambia il fatto che la funzione si è chiusa. Le altre finiscono alla prima `}` in colonna zero,
    // o al più tardi dove comincia la funzione successiva.
    const corpo = [];
    if (quante(def[2], "}") > quante(def[2], "{")) corpo.push(def[2]);
    else for (let j = i + 1; j < righe.length && !/^\}/.test(righe[j]) && !definizione.test(righe[j]); j++) corpo.push(righe[j]);
    // 25/10, dalla rilettura indipendente: la variabile deve essere l'ARGOMENTO. Senza questo,
    // `audit() { local f=fisso.mjs; node "$SCRIPT_DIR/$f" "$1"; }` diventava un lanciatore, e
    // `audit x.mjs` metteva x.mjs nell'elenco.
    const daArgomento = (v) => v === "1" || corpo.some((r) => new RegExp(String.raw`\b${v}=["']?\$\{?1(?!\d)`).test(r));
    const lanci = corpo.filter((r) => !COMMENTO.test(r)).map((r) => r.match(lancia)).filter(Boolean);
    if (lanci.some((m) => daArgomento(m[1]))) nomi.add(def[1]);
  }
  return nomi;
}

/**
 * Le variabili che una shell riempie con la SUA cartella, riscritte come `$SCRIPT_DIR/`.
 *
 * 25/10, dalla rilettura indipendente: `motore-ai.sh` lancia `conto-motore.mjs` come
 * `node "$dir/conto-motore.mjs"`, con `dir="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"`.
 * Lo strumento scarta i percorsi con un `$` che non conosce — giusto, perché `$dir` potrebbe essere
 * qualunque cosa — e così quel lancio spariva. Qui si riconosce solo la forma che dice da sé dove
 * punta: la cartella del file stesso. Le altre variabili restano sconosciute, e restano fuori.
 */
export function conCartellaPropria(file, testo) {
  if (!String(file).startsWith("cervello/")) return String(testo);
  const sotto = file.slice("cervello/".length).replace(/[^/]*$/, ""); // "" oppure "vps/"
  const propria = /\b(\w+)="?\$\(cd "\$\(dirname "\$\{BASH_SOURCE\[0\][^}]*\}"\)" && pwd\)"?/g;
  let t = String(testo);
  for (const nome of new Set([...t.matchAll(propria)].map((m) => m[1]))) {
    t = t.replace(new RegExp(String.raw`\$(?:\{${nome}\}|${nome}\b)\/`, "g"), () => `$SCRIPT_DIR/${sotto}`);
  }
  return t;
}

/** I file di shell CARICATI (`. "$SCRIPT_DIR/x.sh"`, `source …`): girano nello stesso processo di chi li carica. */
export function caricatiIn(testo) {
  const trovati = new Set();
  const re = new RegExp(String.raw`(?:^|[\s;&|(])(?:\.|source)\s+["']?(${PERCORSO}\.sh)`, "g");
  for (const riga of String(testo).split("\n")) {
    if (COMMENTO.test(riga)) continue;
    for (const m of riga.matchAll(re)) {
      const nome = dentroIlCervello(m[1]);
      if (nome) trovati.add(nome);
    }
  }
  return trovati;
}

/** L'elenco: chi viene lanciato E esiste davvero sul disco. */
export function elencoAmmesso(leggi = (f) => readFileSync(join(AD_ROOT, f), "utf8"), esiste = (f) => existsSync(join(AD_ROOT, f))) {
  const fonti = [...CHI_LANCIA, ...CARTELLE_LANCIATRICI.flatMap(fileDi).filter((f) => /\.(ya?ml|sh|mjs|md)$/.test(f))];
  // 25/10 — CHI LANCIA NON STA TUTTO NEI FILE QUI SOPRA. Il giro carica `giro-esito.sh`, ed è lì
  // che vive `sensore`; il worker carica le sue librerie, e quelle lanciano a loro volta. Uno script
  // di shell che si lancia è un lanciatore anche lui. Quindi si legge anche quello che le shell
  // caricano e quello che le fonti lanciano in `.sh`, finché non resta niente di nuovo.
  const testi = new Map();
  const daLeggere = [...fonti];
  while (daLeggere.length) {
    const f = daLeggere.shift();
    if (testi.has(f)) continue;
    testi.set(f, "");
    let txt;
    try {
      txt = leggi(f);
    } catch {
      continue; // una fonte illeggibile non allarga l'elenco: al massimo lo lascia più stretto
    }
    if (f.endsWith(".sh")) txt = conCartellaPropria(f, txt);
    testi.set(f, txt);
    if (f.endsWith(".sh")) for (const s of caricatiIn(txt)) daLeggere.push(`cervello/${s}`);
    for (const s of scriptLanciatiIn(txt)) if (s.endsWith(".sh")) daLeggere.push(`cervello/${s}`);
  }
  // Prima i lanciatori di TUTTE le shell lette, poi le loro chiamate: `sensore` è definita in un
  // file e chiamata in un altro.
  const shell = [...testi].filter(([f]) => f.endsWith(".sh"));
  const lanciatori = new Set(shell.flatMap(([, txt]) => [...lanciatoriIn(txt)]));
  const nominati = new Set();
  for (const [f, txt] of testi) {
    for (const s of scriptLanciatiIn(txt, f.endsWith(".sh") ? lanciatori : undefined)) nominati.add(s);
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

/** Gli script che una consegna nomina nel suo blocco da incollare. */
function nellaConsegna(testoConsegna) {
  return new Set([...String(testoConsegna).matchAll(/Bash\((?:node|bash) cervello\/([\w./-]+):\*\)/g)].map((m) => m[1]));
}

/** Quali script lanciati NON sono nella consegna che Nicola ha in mano. */
export function mancantiNellaConsegna(elenco, testoConsegna) {
  const dentro = nellaConsegna(testoConsegna);
  return [...elenco.mjs, ...elenco.sh].filter((s) => !dentro.has(s));
}

/**
 * Il verso opposto: quali script la consegna di oggi porta e l'elenco rigenerato NON porta più.
 *
 * 25/10 — è il verso che nessuno guardava. `--scaduto` chiede «la consegna copre l'elenco?», e il
 * 1/9 rispondeva sì: ma l'elenco aveva perso cinque sensori, e la consegna rigenerata li ha persi
 * con lui. Uno script che esce dalla consegna mentre il suo file è ancora sul disco o non lo lancia
 * più nessuno, o lo lancia una forma che questo strumento non sa leggere. Da qui le due cose non si
 * distinguono, quindi si dice ad alta voce, invece di riscrivere in silenzio.
 */
export function toltiDallaConsegna(elenco, testoConsegna) {
  const ora = new Set([...elenco.mjs, ...elenco.sh]);
  return [...nellaConsegna(testoConsegna)].filter((s) => !ora.has(s)).sort();
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

## Le altre tre cose, nello stesso foglio

Già che lo apri, ci sono altre tre righe che il guardiano segnala. Con queste si chiude anche
**AR-142**, l'altro bloccante sui permessi: una gesto sola per tutt'e due.

### ① Manca il divieto di spingere sul ramo principale

Nel blocco \`"deny"\` non c'è nessuna riga che vieti \`git push\`. La regola di casa dice che da qui si
lavora su un ramo e si apre una richiesta — mai spingere dritto sul ramo principale.

Aggiungi al \`"deny"\` queste due righe:

\`\`\`json
      "Bash(git push origin main:*)",
      "Bash(git push --force:*)",
\`\`\`

Ho scelto il divieto **mirato** e non \`git push\` intero: la macchina deve poter spingere sul suo
ramo, altrimenti non può più aprirti una richiesta. Vietare tutto avrebbe chiuso anche quella strada.

### ② Uno strumento che scrive, concesso senza chiedere

Nel blocco \`"allow"\` c'è \`mcp__Supabase__execute_sql\`. È lo strumento che esegue SQL: **modifica** lo
stato del database, e sta fra quelli concessi senza chiedere.

**Consiglio di toglierlo.** Ho controllato: nessuno script della macchina lo usa. Per leggere ci sono
gli altri strumenti, e la fonte di verità dei numeri è comunque l'altro canale. Un cambio di
struttura del database è 🔴 in ogni caso, quindi passerebbe da te.

### ③ Cinque righe che non fanno niente

Cinque righe usano la forma \`Write(...)\` su file che vanno protetti. Quella forma il programma non
la applica più: sono le righe che stampano l'avviso a ogni avvio. Riscrivile con \`Edit(...)\`. La protezione vera è già lì
accanto: queste sono solo il doppione morto.

\`\`\`
Write(./cervello/vps/.env)        →  Edit(./cervello/vps/.env)
Write(**/.env)                    →  Edit(**/.env)
Write(**/.env.*)                  →  Edit(**/.env.*)
Write(./.claude/settings.json)    →  Edit(./.claude/settings.json)
Write(./.claude/settings.local.json) → Edit(./.claude/settings.local.json)
\`\`\`

## Cosa devi fare

Aprire quel foglio e incollare. È l'unica cosa che serve, e la può fare solo tu: quel file è negato
in scrittura alla macchina *apposta*, perché non deve poter toccare i propri permessi né per
allargarli né per restringerli.

Quando hai finito, \`node cervello/permessi-check.mjs\` deve dire zero violazioni.

## Cosa non ho verificato

**Non ho provato ad applicarlo.** Non posso, ed è giusto così. L'elenco l'ho ricavato leggendo chi
lancia davvero, e una prova conferma che copre tutto quello che si lancia oggi. Ma che il giro
continui a girare dopo la sostituzione si vede solo dopo.

**Restano fuori due parti**, per un lotto a sé. La prima è il controllo di provenienza su ogni
script: se il file su disco non corrisponde alla versione pubblicata, non parte. La seconda sono le
chiavi, che vanno tenute fuori dall'ambiente del worker.

**Sul divieto di spinta non ho potuto provare l'effetto.** So che il divieto mirato lascia passare la
spinta sul ramo, perché è una forma diversa. Ma il programma applica quelle righe fuori da qui, e da
una sessione non posso vederlo. Se dopo la modifica non riesco più ad aprirti una richiesta, è quella
riga: toglila e dimmelo.

---

### Dettagli tecnici

**Perché generato.** La versione precedente era curata a mano, ed era già stata ritoccata una volta
il 13/8 per cinque script nati dopo. Misurata il 23/8 era indietro di **51**. Non è manutenzione: il
giorno che la si applica, quei 51 programmi smettono di partire. La cura rompe il giro, e la volta
dopo nessuno la applica più. Un elenco che invecchia in silenzio è peggio di nessun elenco, perché
sembra pronto.

**Come si ricava.** \`cervello/permessi-elenco.mjs\` cerca la forma dell'ESECUZIONE — \`node x.mjs\`,
\`bash x.sh\`, nelle varianti che il repo usa davvero, percorso assoluto del server compreso —
e non il nome nudo: un file citato in una frase è una citazione, non un lancio. Conta anche i lanci
che passano da una funzione di casa, come \`sensore "taste-file.mjs" 2 --sonda\` nel giro. Le fonti
sono chi lancia: il giro, il worker, le librerie che caricano, gli script di shell che lanciano, il
cancello del lotto, la suite, la CI, i timer del server, le skill, CLAUDE.md, COMANDI.md e il metodo
del lotto del sito.

**Il 25/10 questa consegna era indietro di 14 script, e rigenerarla ne avrebbe tolti altri 3.** Il
giro lancia una parte dei sensori attraverso la funzione \`sensore\`, e lo strumento cercava solo
\`node x.mjs\`. Il 1/9 una rigenerazione ne aveva già persi cinque, senza che niente diventasse rosso.
Gli altri nove stanno nei file che il giro e il worker caricano o lanciano — le loro librerie, il
motore e l'installatore dei cancelli del commit — e lì lo strumento non guardava. Adesso le funzioni che
lanciano si riconoscono dal loro corpo, e si leggono anche quei file.
Quando una rigenerazione toglie uno script che esiste ancora sul disco, lo dice.

**Tre scelte prudenti.** Uno script nominato ma non presente sul disco resta fuori: un permesso per
un file che non esiste è un permesso che aspetta qualcuno che lo crei, cioè l'asterisco scritto una
riga alla volta. Una fonte illeggibile lascia l'elenco più stretto, mai più largo — un errore di
lettura non deve poter allargare il perimetro. E un permesso già scritto, come
\`Bash(node cervello/…:*)\`, non conta come lancio: è una concessione, non un'esecuzione.

**Difetto:** AR-206, parte (a). La parte (b) — la regola \`no-jolly-su-cartella-scrivibile\` in
\`permessi-check.mjs\` — esiste dal lotto 33 e funziona.

**Prova:** \`node --test cervello/test/l-elenco-dei-permessi-che-invecchia.test.mjs\` — 26 casi, di cui
quattro sul repo vero. Il primo diventa rosso quando questa consegna resta indietro. Il secondo quando
porta uno script che lo strumento non vede più lanciare. Il terzo quando un lancio via \`sensore\` o
\`guardiano\` non entra nell'elenco. Il quarto quando la card in coda che porta lo stesso elenco resta
indietro.
`;
}

function main() {
  const elenco = elencoAmmesso();
  const consegna = existsSync(join(AD_ROOT, CONSEGNA)) ? readFileSync(join(AD_ROOT, CONSEGNA), "utf8") : "";
  const mancanti = consegna ? mancantiNellaConsegna(elenco, consegna) : [];
  const tolti = consegna ? toltiDallaConsegna(elenco, consegna) : [];

  if (SCRIVI) {
    // 🟡 scrive UN file solo, la consegna che Nicola legge. Non tocca i permessi: quelli non sono suoi.
    writeFileSync(join(AD_ROOT, CONSEGNA), testoConsegna(elenco), "utf8");
    console.log(`✅ consegna riscritta: ${CONSEGNA} — ${elenco.mjs.length} programmi e ${elenco.sh.length} script di avvio.`);
    if (tolti.length) {
      const vivi = tolti.filter((s) => existsSync(join(AD_ROOT, "cervello", s)));
      console.error(`⚠️  tolti dalla consegna: ${tolti.join(", ")}`);
      if (vivi.length) {
        console.error(`   ${vivi.length} esistono ancora sul disco (${vivi.join(", ")}): o non li lancia più nessuno, o li lancia una forma che questo strumento non legge. Guarda chi li lanciava prima di consegnare.`);
      }
    }
  } else if (JSON_MODE) {
    console.log(JSON.stringify({ ...elenco, consegna: CONSEGNA, mancanti_nella_consegna: mancanti, tolti_dalla_consegna: tolti }, null, 2));
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
