#!/usr/bin/env node
// 🔍 MISURA CIECA — una misura che non può dire di no non è una misura.
//
// PERCHÉ ESISTE. Il 30/7, nello stesso giorno in cui costruivo il freno contro i difetti che mi
// infliggo da solo, ho commesso CINQUE volte lo stesso errore — non nel codice, nel modo in cui
// misuravo il codice:
//
//   1. `node -e "require('.claude/settings.json')" 2>/dev/null || echo "(assente)"`
//      → `require` su percorso relativo senza `./` lancia; l'errore finiva in /dev/null e il `||`
//        stampava «assente». Ho concluso «zero hook configurati» mentre ce n'era uno, e ho
//        progettato mezz'ora sopra un fatto falso.
//   2. `node cervello/sorvegliante.mjs | head -60; echo "EXIT=$?"` → 0, sempre. Era l'uscita di
//      `head`. Ho letto «passa» su un comando che stava fallendo.
//   3. Stessa cosa con `git commit ... | tail -14; echo $?` — il commit era BLOCCATO e leggevo 0.
//   4. `cd <scratchpad>; node cervello/test-cervello.mjs | grep ❌` → il cd riusciva, il node no
//      (file inesistente lì), nessun output, e ho letto «nessun test rosso».
//   5. `git checkout <ref> -- file; git diff` → vuoto, perché `git checkout -- ` METTE IN STAGE e
//      `git diff` guarda il non-staged. Ho letto «il file non è cambiato» mentre era cambiato.
//
// Cinque forme, una malattia sola: **il canale che porta il verdetto lo nasconde**. È `errore-ingoiato`
// — la malattia che questo cantiere censisce nel codice — commessa nel modo in cui si misura. E fa
// più danno lì che nel codice: un errore ingoiato in produzione rompe una schermata, un errore
// ingoiato in una misura rompe il RAGIONAMENTO che ci si costruisce sopra.
//
// COSA FA. Legge il testo di un comando di shell e segnala le forme che rendono cieco il verdetto.
// Non giudica il comando: giudica se il comando POTRÀ dire di no.
//
// COPERTURA DICHIARATA: sono le cinque forme misurate sul campo, non una teoria della shell. Un
// comando che passa non è «sicuro»: è «non contiene le cinque trappole già pagate».
//
// E DAL 3/8 (AR-486) questo hook fa un secondo mestiere: fa girare anche il SORVEGLIANTE sul delta.
// Non è un accorpamento di comodo. Il sorvegliante è agganciato a `Edit|Write|MultiEdit`, quindi un
// `sed -i`, uno script che riscrive un file, un `git checkout -- file` o un generatore non lo
// svegliavano affatto: il modo più comodo di modificare il repo era anche l'unico senza guardia.
// `.claude/settings.json` non lo posso toccare (deny-list, ed è giusto così), ma questo hook sul Bash
// c'è già — e i due verdetti viaggiano in UNA busta sola, perché l'hook legge una sola uscita.
//
// Uso:
//   node cervello/misura-cieca.mjs "<comando>"      # 0 = nessuna trappola · 1 = trappola trovata
//   node cervello/misura-cieca.mjs --hook           # legge il comando dal JSON dell'hook su stdin
//
// 🟢 Sola lettura sul repo. In forma `--hook` scrive il battito del sorvegliante (fuori da git, come
//    sempre): è la prova che la guardia ha girato anche su questo canale.

/** Le forme, ognuna col caso vero che l'ha generata: un guardiano senza la sua storia diventa una
 *  regola che qualcuno toglierà «perché dà fastidio». */
export const TRAPPOLE = [
  {
    id: "uscita-dopo-la-pipe",
    // `$?` dopo una pipeline è l'uscita dell'ULTIMO elemento. Con `| head`, `| tail`, `| grep` il
    // verdetto del comando che conta viene buttato via, e resta lo 0 del filtro.
    prova: (c) => /\|\s*(head|tail|grep|sed|awk|cut|sort|uniq|wc|jq)\b[^\n;]*[\n;][^\n]*\$\?/.test(c),
    cosa: "leggi $? dopo una pipe: quello è il codice di uscita del filtro, non del comando che ti interessa",
    invece: 'metti il comando in una variabile — out=$(cmd); code=$?; echo "$out" — oppure usa ${PIPESTATUS[0]}',
  },
  {
    id: "errore-in-nulla-poi-fallback",
    // `cmd 2>/dev/null || echo "assente"`: se `cmd` fallisce per un motivo QUALSIASI (percorso
    // sbagliato, permessi, sintassi) il fallback stampa una conclusione che non è stata misurata.
    prova: (c) => /2>\s*\/dev\/null[^\n;]*\|\|/.test(c),
    cosa: "butti l'errore in /dev/null e poi concludi qualcosa dal fallimento: un errore qualsiasi diventa una risposta",
    invece: "tieni stderr e distingui «ha detto no» da «non è partito»: sono due verdetti diversi",
  },
  {
    id: "diff-che-non-guarda-lo-stage",
    // `git add`/`git checkout <ref> -- <file>` mettono in stage; `git diff` senza --cached guarda
    // solo il non-staged e mostra vuoto. Il vuoto viene letto come «non è cambiato niente».
    // `\b` dopo `--` non combacia mai (`-` non è un carattere di parola): la prima stesura di questa
    // riga lo aveva, e il caso `git checkout <ref> -- <file>` — cioè proprio quello che mi ha
    // ingannato — non veniva riconosciuto. Trovato dal test, non dalla rilettura.
    prova: (c) => /git\s+(add\b|checkout\s+\S+\s+--)/.test(c) && /git\s+diff\b(?![^\n;]*(--cached|--staged|HEAD))/.test(c),
    cosa: "hai messo in stage e poi guardi `git diff` senza --cached: mostrerà vuoto anche se il file è cambiato",
    invece: "git diff --cached, oppure git status --short che vede entrambi",
  },
  {
    id: "cd-che-puo-fallire",
    // `cd x; cmd` — se il cd fallisce, `cmd` gira nella cartella sbagliata e spesso non stampa
    // niente. Il silenzio viene letto come «nessun problema trovato».
    prova: (c) => /\bcd\s+[^\n&|]+;\s*\S/.test(c),
    cosa: "un `cd` seguito da `;`: se il cd fallisce il comando dopo gira nel posto sbagliato e il suo silenzio sembra un verde",
    invece: "cd ... && ... (con &&, non ;), o percorsi assoluti",
  },
  {
    id: "prova-che-non-puo-dire-no",
    // Una verifica che passerebbe anche sulla versione SBAGLIATA non è una verifica. Forma tipica:
    // controllare che un JSON sia valido per dimostrare che contiene qualcosa.
    prova: (c) => /JSON\.parse\([^)]*\)\s*(&&|;)?\s*(console\.log|echo)?[^\n]*(valido|ok|✅)/i.test(c) && !/(includes|grep|match|\.some\()/.test(c),
    cosa: "«il JSON è valido» non dimostra che contenga quello che cerchi: passerebbe identico sulla versione sbagliata",
    invece: "cerca il contenuto (grep -c, includes, .some): una prova deve poter dire di no",
  },
];

/** @returns {Array<{id:string,cosa:string,invece:string}>} le trappole trovate nel comando. */
/**
 * La busta che ARRIVA al modello (AR-463, stessa forma di AR-465 nel sorvegliante).
 *
 * Pura: una prova la esegue e prova a romperla, invece di guardare se il codice «sembra giusto» —
 * che è esattamente il modo in cui questo difetto è passato inosservato la prima volta.
 * Torna `null` quando non c'è niente da dire: tacere è la scelta giusta, un avvisatore che parla a
 * ogni comando viene spento entro la settimana.
 */
export function bustaPerIlModello(trovate = [], dalSorvegliante = null) {
  const righe = trovate.length
    ? ["🔍 MISURA CIECA — il comando che hai appena lanciato può darti un verdetto che non ha misurato:", ...trovate.map((t) => `   · ${t.cosa}\n     → ${t.invece}`)]
    : [];
  // Il verdetto del sorvegliante sul delta viaggia nella STESSA busta (AR-486): l'hook legge una sola
  // uscita, e due buste stampate di fila non sono JSON — la seconda finirebbe nel nulla, che è
  // esattamente il difetto che questi due file esistono per curare.
  if (dalSorvegliante) righe.push(dalSorvegliante);
  if (!righe.length) return null;
  return JSON.stringify({
    hookSpecificOutput: { hookEventName: "PostToolUse", additionalContext: righe.join("\n") },
  });
}

export function misuraCieca(comando = "") {
  const c = String(comando);
  if (!c.trim()) return [];
  return TRAPPOLE.filter((t) => t.prova(c)).map(({ id, cosa, invece }) => ({ id, cosa, invece }));
}

// L'import è sicuro perché il sorvegliante ha la guardia `import.meta.url` in fondo: importarlo NON
// ne esegue il programma. È la malattia `programma-che-parte-importando` (AR-445), censita oggi nel
// registro proprio perché 71 file del cervello non ce l'hanno ancora.
const { verdettoDelDelta, scatto } = await import("./sorvegliante.mjs");

async function leggiStdin() {
  const pezzi = [];
  for await (const p of process.stdin) pezzi.push(p);
  return Buffer.concat(pezzi).toString("utf8");
}

async function main() {
  const argv = process.argv.slice(2);
  let comando = argv.filter((a) => !a.startsWith("--")).join(" ");

  if (argv.includes("--hook")) {
    // L'hook riceve il payload dell'evento su stdin. Se non è leggibile NON invento un verdetto:
    // esco 0 in silenzio — un avvisatore che parla a vanvera si impara a ignorare.
    try {
      const ev = JSON.parse(await leggiStdin());
      comando = ev?.tool_input?.command || "";
    } catch {
      process.exit(0);
    }
  }

  const trovate = misuraCieca(comando);

  if (argv.includes("--hook")) {
    // AR-486 — LA GUARDIA CHE NON SI SVEGLIAVA. Il sorvegliante è agganciato a `Edit|Write|MultiEdit`:
    // un `sed -i`, uno script che riscrive un file, un `git checkout -- file`, un generatore, non lo
    // svegliavano affatto. Cioè il modo più comodo di modificare il repo era anche l'unico senza
    // guardia — e non è un caso raro: è come si fanno le modifiche in massa, quelle che toccano più
    // file tutte insieme. `.claude/settings.json` non lo posso toccare io (è nel mio deny-list, ed è
    // giusto così), ma questo hook sul Bash esiste già: gli passo accanto il verdetto sul delta.
    //
    // Costa una lettura del diff a ogni comando (~150 ms, misurati): il prezzo di non averla è che
    // le modifiche fatte da un comando restano l'unico punto cieco della guardia.
    //
    // E il canale resta quello di AR-463, che qui vale doppio: stdout in JSON con
    // `hookSpecificOutput.additionalContext`, o non arriva a nessuno. Fino al 31/7 questa modalità
    // stampava testo semplice e usciva 0 — lo stesso difetto che il sorvegliante ha avuto per un
    // giorno intero (AR-465), scoperto solo provandolo dal vivo.
    let dalSorvegliante = null;
    try {
      const { errore, esito, toccati } = verdettoDelDelta();
      if (!errore) {
        const busta = scatto(esito, toccati.length);
        // Dalla busta dell'altro prendo il TESTO, non l'involucro: le buste non si annidano.
        if (busta) dalSorvegliante = JSON.parse(busta)?.hookSpecificOutput?.additionalContext || null;
      }
    } catch {
      // Se la guardia non gira, questo hook fa comunque il suo mestiere: un pezzo mancante non deve
      // portarsi via anche l'altro verdetto. Che abbia girato o no lo dice il battito, non il silenzio.
    }
    const busta = bustaPerIlModello(trovate, dalSorvegliante);
    if (busta) console.log(busta);
    process.exit(0);
  }

  if (!trovate.length) process.exit(0);

  console.log("🔍 MISURA CIECA — questo comando può darti un verdetto che non ha misurato:");
  for (const t of trovate) {
    console.log(`   · ${t.cosa}`);
    console.log(`     → ${t.invece}`);
  }
  // Avvisa e basta: bloccare un comando di lettura sarebbe sproporzionato, e un freno sproporzionato
  // viene spento.
  process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
