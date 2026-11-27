// Le voci che si chiudono senza Nicola (regola del 24/11 17:23): fuori chi chiede una sua scelta, un gesto o una migrazione da applicare.
import { readFileSync, writeFileSync } from "node:fs";
const [C] = process.argv.slice(2);
const per = JSON.parse(readFileSync(`${C}/perimetro.json`, "utf8"));
const reg = JSON.parse(readFileSync("MyCity-Vault/90-Memoria-AI/auto-coscienza/radiografia-marketplace.json", "utf8")).problemi;
const { chiaveProblema } = await import(process.cwd() + "/cervello/referti-sito.mjs");
const perChiave = new Map(reg.map((p) => [chiaveProblema(p), p]));
const vecchio = "consegne/riparazioni/2026-11-24-onda-700/prossima-ondata/per-nicola.txt";
const perNicola = new Map(readFileSync(vecchio, "utf8").split("\n").filter((r) => r && !r.startsWith("#")).map((r) => { const [m, k] = r.split("\t"); return [k, m]; }));
const RXM = /migrations\/|migrazion/i;
const out = { senza: [], fuori: {} };
for (const v of per.lavorabili) {
  const p = perChiave.get(v.chiave) || {};
  const testo = [p.fix, p.descrizione].join(" ");
  if (perNicola.has(v.chiave)) { out.fuori[v.chiave] = perNicola.get(v.chiave); continue; }
  if (v.file.some((f) => f.startsWith("migrations/")) || RXM.test(p.fix || "")) { out.fuori[v.chiave] = "migrazione"; continue; }
  out.senza.push(v.chiave);
}
writeFileSync(`${C}/senza-nicola.json`, JSON.stringify(out, null, 1));
const g = {}; Object.values(out.fuori).forEach((m) => g[m] = (g[m] || 0) + 1);
const gr = {}; out.senza.forEach((k) => { const v = per.lavorabili.find((x) => x.chiave === k); gr[v.gravita] = (gr[v.gravita] || 0) + 1; });
console.log("senza Nicola", out.senza.length, gr, "· fuori", g);
