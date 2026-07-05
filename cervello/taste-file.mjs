#!/usr/bin/env node
// 👅 TASTE-FILE (PZ-009, piano "chiudi i loop") — la MANO che registra i verdetti di Nicola.
// 🟢 Scrive solo MyCity-Vault/07-Agenti/TASTE-FILE-NICOLA.md (log append-only del gusto).
//
// Problema (dalla radiografia): il LOG DEI VERDETTI del taste-file è VUOTO — ogni volta che Nicola
// approva/boccia/corregge un lavoro, quella reazione va persa e i senior ricominciano a indovinare
// l'asticella. I prompt ordinano di "registrare il verdetto" ma non esiste una mano deterministica:
// resta delegato alla memoria dell'LLM (= non succede).
//
// Questo file è la mano. L'AD la chiama SUBITO dopo ogni reazione di Nicola (anche una sola frase):
//   node cervello/taste-file.mjs registra <mestiere> "<cosa>" <si|quasi|no> "<perche>" ["<principio>"] ["#tag"]
//     es: node cervello/taste-file.mjs registra content "post saracinesca v1" no \
//         "sembra una pubblicità qualunque" "apri con una frase vera del bottegaio" "#volti"
//   node cervello/taste-file.mjs --sonda [--json]   -> conta i verdetti (per giro/Pannello: log vivo o morto?)
//
// Le correzioni di Nicola valgono doppio (CLAUDE.md): dopo `registra`, l'AD crea anche la lezione
// in apprendimento.json con caso_studio_nicola=true — questo script glielo ricorda in output.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza, stampSegnale } from "./git-github.mjs";

const PATH = join(AD_ROOT, "MyCity-Vault/07-Agenti/TASTE-FILE-NICOLA.md");
const JSON_MODE = process.argv.includes("--json");

const VERDETTI = { si: "✅sì", sì: "✅sì", quasi: "⚠️quasi", no: "❌no" };

function contaVerdetti(testo) {
  // Righe-verdetto reali: datate e con "VERDETTO:" (il commento-esempio HTML non conta).
  const righe = [];
  let inCommento = false;
  for (const r of testo.split("\n")) {
    if (r.includes("<!--")) inCommento = true;
    if (!inCommento && /^\d{4}-\d{2}-\d{2}.*VERDETTO:/.test(r.trim())) righe.push(r.trim());
    if (r.includes("-->")) inCommento = false;
  }
  return righe;
}

function registra(args) {
  const [mestiere, cosa, verdettoRaw, perche, principio, ...tags] = args;
  const verdetto = VERDETTI[String(verdettoRaw || "").toLowerCase()];
  if (!mestiere || !cosa || !verdetto || !perche) {
    console.error(
      'Uso: node cervello/taste-file.mjs registra <mestiere> "<cosa>" <si|quasi|no> "<perche>" ["<principio>"] ["#tag"]'
    );
    process.exit(2);
  }
  if (!existsSync(PATH)) {
    console.error(`❌ Taste-file non trovato: ${PATH}`);
    process.exit(1);
  }
  let testo = readFileSync(PATH, "utf8");
  const tagTxt = tags.length ? ` · ${tags.map((t) => (t.startsWith("#") ? t : `#${t}`)).join(" ")}` : "";
  const riga =
    `${nowPiacenza()} · [${mestiere}] · COSA: ${cosa} · VERDETTO: ${verdetto}\n` +
    `· PERCHÉ (1 riga): ${perche}${principio ? ` · PRINCIPIO: ${principio}` : ""}${tagTxt}\n`;

  // Appendi sotto l'intestazione del LOG (append-only, la voce più recente in fondo).
  const marcatore = /(##\s*🗂️\s*LOG DEI VERDETTI[^\n]*\n(?:>[^\n]*\n)*)/;
  if (marcatore.test(testo)) {
    // Prima voce reale: rimuovi il commento-esempio come chiede il file stesso.
    if (contaVerdetti(testo).length === 0) {
      testo = testo.replace(/<!-- esempio di come apparirà[\s\S]*?-->\n?/, "");
    }
    testo = testo.trimEnd() + `\n\n${riga}`;
  } else {
    testo = testo.trimEnd() + `\n\n## 🗂️ LOG DEI VERDETTI\n\n${riga}`;
  }
  writeFileSync(PATH, testo, "utf8");
  const totale = contaVerdetti(testo).length;
  console.log(`👅 Verdetto registrato nel taste-file (${totale}° verdetto reale):`);
  console.log(`   ${riga.split("\n")[0]}`);
  console.log(`   → Ora crea la LEZIONE in apprendimento.json con caso_studio_nicola=true (vale doppio).`);
  if (totale >= 20) {
    console.log(`   ⚠️  ${totale} verdetti: è ora di RIASSUMERE i Principi in alto e potare le righe vecchie.`);
  }
}

async function sonda() {
  const quando = nowPiacenza();
  const esiste = existsSync(PATH);
  const verdetti = esiste ? contaVerdetti(readFileSync(PATH, "utf8")) : [];
  const ultimo = verdetti.length ? verdetti[verdetti.length - 1].slice(0, 16) : null;
  const out = { quando, esiste, verdetti: verdetti.length, ultimo, vivo: verdetti.length > 0 };
  await stampSegnale(
    "taste-file",
    out.vivo ? "ok" : "warn",
    `${verdetti.length} verdetti reali${ultimo ? ` · ultimo ${ultimo}` : " · LOG ANCORA VUOTO"} · ${quando}`
  );
  if (JSON_MODE) console.log(JSON.stringify(out, null, 2));
  else if (out.vivo) console.log(`👅 taste-file vivo: ${verdetti.length} verdetti reali (ultimo ${ultimo}).`);
  else console.log("👅 taste-file: LOG VUOTO — al prossimo verdetto di Nicola in chat, registralo (è il metro vero della qualità).");
  process.exit(0);
}

const cmd = process.argv[2];
if (cmd === "registra") registra(process.argv.slice(3));
else if (process.argv.includes("--sonda")) await sonda();
else {
  console.error(
    'Uso:\n  node cervello/taste-file.mjs registra <mestiere> "<cosa>" <si|quasi|no> "<perche>" ["<principio>"] ["#tag"]\n  node cervello/taste-file.mjs --sonda [--json]'
  );
  process.exit(2);
}
