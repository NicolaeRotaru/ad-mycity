// Filtra i frammenti di un'onda alle sole chiavi ancora aperte nel registro (prima regista onda 4, 16/11).
// Uso: node nuove-chiavi.mjs <cartella-frammenti> <cartella-uscita>; poi chiudi-sito --applica sulla cartella di uscita.
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { piano } from "../../../cervello/chiudi-sito.mjs";
import { chiaveProblema } from "../../../cervello/referti-sito.mjs";
const [C, out] = process.argv.slice(2);
const reg = JSON.parse(readFileSync("/home/user/ad-mycity/MyCity-Vault/90-Memoria-AI/auto-coscienza/radiografia-marketplace.json", "utf8"));
const statoDi = new Map(reg.problemi.map((p) => [chiaveProblema(p), p.stato]));
const nomi = readdirSync(C).filter((f) => /^esito-\d+\.json$/.test(f));
mkdirSync(out, { recursive: true });
let n = 0;
for (const f of nomi) {
  const fr = JSON.parse(readFileSync(join(C, f), "utf8"));
  const { chiudo } = piano(reg.problemi, [fr], {});
  const tenere = new Set(chiudo.filter((c) => !["riparato", "chiuso"].includes(statoDi.get(c.chiave))).map((c) => c.chiave));
  if (!tenere.size) continue;
  const difetti = fr.difetti.filter((d) => { const { chiudo: c } = piano(reg.problemi, [{ ...fr, difetti: [d] }], {}); return c.length && tenere.has(c[0].chiave); });
  for (const d of difetti) console.log(f, statoDi.get(piano(reg.problemi, [{ ...fr, difetti: [d] }], {}).chiudo[0].chiave), String(d.chiave).slice(0, 90));
  n += difetti.length;
  writeFileSync(join(out, f), JSON.stringify({ ...fr, difetti }, null, 2));
}
console.log("nuove:", n);
