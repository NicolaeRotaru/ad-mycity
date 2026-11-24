// Lancia le mutazioni dei difetti nominati (es. radiografia-a-onde radiografia-in-sessioni) contro i loro test e
// rimette sempre il file com era. non-vacuita.mjs --difetti accetta solo codici AR, e questi difetti non ne hanno.
// Uso, dalla radice di ad-mycity: node consegne/audit/2026-11-24-radiografia-a-onde/mutazioni.mjs radiografia-a-onde
import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
const R = join(fileURLToPath(new URL(".", import.meta.url)), "../../../");
const difetti = process.argv.slice(2);
const el = JSON.parse(readFileSync(R + "cervello/mutanti.json", "utf8")).mutanti.filter((m) => difetti.includes(m.difetto));
let vive = 0;
for (const m of el) {
  const f = R + m.file, orig = readFileSync(f, "utf8");
  if (orig.split(m.cerca).length !== 2) { console.log("⚪ pattern non unico/assente:", m.nome); vive++; continue; }
  try {
    writeFileSync(f, orig.replace(m.cerca, m.sostituisci));
    const r = spawnSync("node", ["--test", R + m.test], { encoding: "utf8", cwd: R });
    const rosso = r.status !== 0;
    if (!rosso) vive++;
    console.log(rosso ? "✅ rossa" : "❌ VERDE", "—", m.nome);
  } finally { writeFileSync(f, orig); }
}
console.log(`${el.length} mutazioni, ${vive} non prese`);
process.exitCode = vive ? 1 : 0;
