#!/usr/bin/env node
// no-path-cablati-check.mjs — IL FRENO CONTRO I PERCORSI DI UNA MACCHINA SOLA.
//
// LA STORIA, che è il motivo per cui questo file esiste due volte.
// Il 1/7 Nicola: «mycity-live non c'entra niente, toglila ovunque». Il 4/7, dopo la ricaduta, più
// netto: «togli il cablato su Windows una volta per sempre, IMPEDISCI CHE RIACCADA». Il registro
// delle decisioni di quel giorno dà per fatte due cose: la pulizia di `marketplace-repo.mjs` e la
// nascita di questo guardiano, «agganciato a giro.sh».
//
// Il 21/8 la verifica dell'automazione diceva ancora: «clone marketplace assente in
// C:\\Users\\InfinitaPossibilita\\mycity-live». La riga era tornata dentro `marketplace-repo.mjs`,
// cioè proprio nel file che era stato ripulito — e questo guardiano NON ESISTEVA nel repo, né era
// nominato in `giro.sh`. La correzione era stata chiusa con una frase invece che con un freno, e
// senza freno è rientrata da sola. È esattamente la regola del mansionario: una correzione di
// Nicola si chiude con un guardiano che può fallire, non con una riga di diario.
//
// COSA GUARDA: i file di codice versionati. Un percorso che vale su UNA macchina sola — la cartella
// utente di un Windows, o una home `/Users/<nome>` — dentro il codice significa che su tutte le
// altre macchine quel codice punta al nulla, e lo fa in silenzio.
//
// COSA NON GUARDA, e perché (le esenzioni sono dichiarate, non nascoste):
//   · le righe di COMMENTO — se ne parlare fosse vietato, non si potrebbe nemmeno documentare il
//     difetto: questo stesso file diventerebbe rosso alla riga dieci;
//   · i file dentro `cervello/test/` — lì un percorso Windows è il MATERIALE della prova, cioè
//     serve a verificare che un rilevatore lo riconosca;
//   · sé stesso, per la stessa ragione del primo punto.
//
// Uso: `node cervello/no-path-cablati-check.mjs [--json]`
// Uscita: 0 pulito · 1 trovato un percorso cablato · 2 non ho potuto misurare (⚪ non è mai ✅).

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT } from "./git-github.mjs";
import { percorsiDaGit } from "./percorsi-git.mjs";

const JSON_MODE = process.argv.includes("--json");
const ESTENSIONI = /\.(mjs|cjs|js|ts|tsx|jsx|sh|bash)$/;
const ESENTI = [/^cervello\/test\//, /^cervello\/no-path-cablati-check\.mjs$/, /^node_modules\//];

// Un percorso che vale su una macchina sola. `C:\…` o `C:/…`, e le home di un utente con nome.
const REGOLE = [
  { nome: "cartella utente di Windows", re: /["'`][A-Za-z]:[\\/]{1,2}Users[\\/]{1,2}[A-Za-z0-9._-]+/ },
  { nome: "home di un utente con nome", re: /["'`]\/Users\/[A-Za-z0-9._-]+\// },
];

/** Una riga è solo commento? Allora parla del problema, non lo crea. */
export function soloCommento(riga) {
  const t = String(riga).trim();
  return t.startsWith("//") || t.startsWith("#") || t.startsWith("*") || t.startsWith("/*");
}

/** Le violazioni dentro un testo. Pura: un test la esegue con file finti. */
export function violazioni(file, testo) {
  const fuori = [];
  const righe = String(testo).split("\n");
  for (let i = 0; i < righe.length; i++) {
    if (soloCommento(righe[i])) continue;
    for (const r of REGOLE) {
      if (r.re.test(righe[i])) {
        fuori.push({ file, riga: i + 1, regola: r.nome, testo: righe[i].trim().slice(0, 120) });
        break;
      }
    }
  }
  return fuori;
}

function main() {
  let elenco;
  try {
    elenco = percorsiDaGit(["ls-files", "--cached", "--others", "--exclude-standard"], { cwd: AD_ROOT });
  } catch (e) {
    const motivo = `non ho potuto chiedere l'elenco dei file a git: ${e.message || e}`;
    if (JSON_MODE) console.log(JSON.stringify({ esito: "cieco", motivo }, null, 2));
    else console.error(`⚪ ${motivo}`);
    process.exit(2); // ⚪ non è mai ✅
  }

  const daGuardare = elenco.filter((f) => ESTENSIONI.test(f) && !ESENTI.some((e) => e.test(f)));
  const fuori = [];
  let letti = 0;
  const illeggibili = [];
  for (const rel of daGuardare) {
    let testo;
    try {
      testo = readFileSync(join(AD_ROOT, rel), "utf8");
    } catch (e) {
      if (e?.code === "ENOENT") continue; // cancellato ma ancora nell'indice: non è un buco
      illeggibili.push(rel);
      continue;
    }
    letti++;
    fuori.push(...violazioni(rel, testo));
  }

  if (illeggibili.length) {
    const motivo = `${illeggibili.length} file di codice non aperti (${illeggibili[0]}): su ${letti} letti non posso dire «pulito»`;
    if (JSON_MODE) console.log(JSON.stringify({ esito: "cieco", motivo, letti }, null, 2));
    else console.error(`⚪ ${motivo}`);
    process.exit(2);
  }

  if (JSON_MODE) {
    console.log(JSON.stringify({ esito: fuori.length ? "trovato" : "pulito", letti, fuori }, null, 2));
  } else if (fuori.length) {
    console.log(`\n📌 PERCORSI CABLATI — ${fuori.length} in ${new Set(fuori.map((f) => f.file)).size} file\n`);
    for (const f of fuori.slice(0, 20)) console.log(`  • ${f.file}:${f.riga} — ${f.regola}\n    ${f.testo}`);
    console.log(`\nUn percorso che vale su una macchina sola, su tutte le altre punta al nulla in silenzio.`);
    console.log(`Chiedi la posizione a chi la sa: cervello/marketplace-repo.mjs (resolveMarketplaceRepo).`);
  } else {
    console.log(`✅ nessun percorso cablato su una macchina sola, in ${letti} file di codice`);
  }
  process.exit(fuori.length ? 1 : 0);
}

if (process.argv[1] && process.argv[1].endsWith("no-path-cablati-check.mjs")) main();
