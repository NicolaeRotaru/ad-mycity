// Le voci da lavorare dopo la campagna del 26/11: fuori chi si chiude con la mycity#342 e chi chiede Nicola. Le migrazioni restano dentro (Nicola 27/11: strada B, un «ok migrazioni» alla fine).
import { readFileSync, writeFileSync } from "node:fs";
const [C] = process.argv.slice(2);
const per = JSON.parse(readFileSync(`${C}/tutto/perimetro.json`, "utf8"));
const chiude = new Set(), nicola = new Map(), esitoPrima = {};
for (const o of ["onda1", "onda2", "onda3"]) for (const d of JSON.parse(readFileSync(`${C}/decisioni-26-11-${o}.json`, "utf8")).decisioni) {
  if (["si_chiude", "gia_riparato_prima"].includes(d.decisione)) chiude.add(d.chiave);
  else if (["scelta_di_nicola", "non_codice", "domanda_per_nicola"].includes(d.esito)) nicola.set(d.chiave, d.esito);
  else esitoPrima[d.chiave] = d.esito || "senza esito";
}
for (const r of readFileSync(`${C}/per-nicola-26-11.md`, "utf8").split("\n")) { const m = r.match(/^- ([a-z-]+\|.+)$/); if (m) nicola.set(m[1].trim(), nicola.get(m[1].trim()) || "per-nicola.md"); }
for (const r of readFileSync(`${C}/superata/../../2026-11-24-onda-700/prossima-ondata/per-nicola.txt`, "utf8").split("\n")) { if (!r || r.startsWith("#")) continue; const [m, k] = r.split("\t"); nicola.set(k, m); }
const dentro = [], fuori = {};
for (const v of per.lavorabili) {
  if (chiude.has(v.chiave)) { fuori[v.chiave] = "si chiude con la mycity#342"; continue; }
  if (nicola.has(v.chiave)) { fuori[v.chiave] = "chiede Nicola: " + nicola.get(v.chiave); continue; }
  dentro.push(v.chiave);
}
writeFileSync(`${C}/chiavi-ora.txt`, `# Voci da lavorare dopo la campagna del 26/11 — ${dentro.length}, una chiave per riga (AD, 2026-11-27)\n` + dentro.join("\n") + "\n");
writeFileSync(`${C}/fuori-ora.json`, JSON.stringify(fuori, null, 1));
const by = new Map(per.lavorabili.map((v) => [v.chiave, v]));
const gr = {}; dentro.forEach((k) => gr[by.get(k).gravita] = (gr[by.get(k).gravita] || 0) + 1);
const f = {}; Object.values(fuori).forEach((m) => { const c = m.split(":")[0]; f[c] = (f[c] || 0) + 1; });
const pr = {}; dentro.forEach((k) => { const e = esitoPrima[k] ? "lavorata il 26/11 (" + esitoPrima[k] + ")" : "mai lavorata"; pr[e] = (pr[e] || 0) + 1; });
const mig = dentro.filter((k) => by.get(k).file.some((x) => x.startsWith("migrations/"))).length;
console.log("dentro", dentro.length, gr, "· con file di migrazione", mig, "· fuori", f); console.log(pr);
