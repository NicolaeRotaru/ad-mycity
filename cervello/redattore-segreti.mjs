#!/usr/bin/env node
// redattore-segreti.mjs — redige segreti PRIMA di scrivere artefatti (audit, consegne, memoria).
// Riusa le stesse regex di scan-segreti.mjs via segreti-pattern.mjs.
//
// Uso:
//   node cervello/redattore-segreti.mjs --testo "github_pat_11ABC…"
//   echo "…" | node cervello/redattore-segreti.mjs --stdin
//   node cervello/redattore-segreti.mjs --in-place file1.md [file2 …]
//
// Exit: 0 = ok · 1 = almeno un segreto redatto (in --in-place) · 2 = errore

import { readFileSync, writeFileSync } from "node:fs";
import { redigiTesto } from "./segreti-pattern.mjs";

const args = process.argv.slice(2);

function usaStdin() {
  return readFileSync(0, "utf8");
}

function redigiEStampa(testo) {
  const pulito = redigiTesto(testo);
  process.stdout.write(pulito);
  return pulito !== testo;
}

function main() {
  if (args.includes("--testo")) {
    const i = args.indexOf("--testo");
    const testo = args[i + 1] ?? "";
    process.exit(redigiEStampa(testo) ? 1 : 0);
  }

  if (args.includes("--stdin")) {
    process.exit(redigiEStampa(usaStdin()) ? 1 : 0);
  }

  if (args.includes("--in-place")) {
    const files = args.filter((a) => !a.startsWith("-"));
    if (!files.length) {
      console.error("Uso: node cervello/redattore-segreti.mjs --in-place <file…>");
      process.exit(2);
    }
    let redatti = 0;
    for (const file of files) {
      const prima = readFileSync(file, "utf8");
      const dopo = redigiTesto(prima);
      if (dopo !== prima) {
        writeFileSync(file, dopo, "utf8");
        redatti++;
        console.log(`🔒 Redatto: ${file}`);
      }
    }
    process.exit(redatti ? 1 : 0);
  }

  console.error("Uso: redattore-segreti.mjs --testo \"…\" | --stdin | --in-place <file…>");
  process.exit(2);
}

main();
