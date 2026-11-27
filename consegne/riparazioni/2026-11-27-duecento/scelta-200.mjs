// I 200 esatti: 40 normali + 29 gravi e bloccanti delicati + 131 minori delicati (20 di pilota, senza file in comune coi normali).
import { readFileSync, writeFileSync } from "node:fs";
const [C] = process.argv.slice(2);
const per = JSON.parse(readFileSync(`${C}/perimetro.json`, "utf8"));
const by = new Map(per.lavorabili.map((v) => [v.chiave, v]));
const f = JSON.parse(readFileSync(`${C}/filtro-delicati.json`, "utf8"));
const PRIO = ["pagamenti-stripe", "qa-flussi", "flussi-conversione", "sicurezza-auth", "privacy-legale", "api-backend", "stati-ui", "frontend-ux", "architettura", "deploy-sre", "performance", "ai-endpoints", "microcopy", "dati-analytics"];
const rank = (d) => { const i = PRIO.indexOf(d); return i < 0 ? PRIO.length : i; };
const normali = f.normali;
const gravi = f.delicati.filter((k) => by.get(k).gravita !== "minore");
const minori = f.delicati.filter((k) => by.get(k).gravita === "minore");
// il pilota gira a rotazione fra le dimensioni (misura il costo su tutti i tipi); l onda 2 va in ordine di impatto sulla crescita
const code = new Map(); for (const k of minori) { const d = by.get(k).dimensione; if (!code.has(d)) code.set(d, []); code.get(d).push(k); }
const dims = [...code.keys()].sort((a, b) => rank(a) - rank(b)); const giro = [];
while (giro.length < minori.length) for (const d of dims) { const q = code.get(d); if (q.length) giro.push(q.shift()); }
const fileNormali = new Set(normali.flatMap((k) => by.get(k).file));
const pilota = giro.filter((k) => !by.get(k).file.some((x) => fileNormali.has(x))).slice(0, 20);
const resto = minori.filter((k) => !pilota.includes(k)).sort((a, b) => rank(by.get(a).dimensione) - rank(by.get(b).dimensione)).slice(0, 200 - normali.length - gravi.length - pilota.length);
const onda2 = [...gravi, ...resto], tutti = [...normali, ...pilota, ...onda2];
if (new Set(tutti).size !== 200) throw new Error("non sono 200: " + new Set(tutti).size);
const scrivi = (n, a, t) => writeFileSync(`${C}/${n}`, `# ${t} — ${a.length} voci, una chiave per riga (AD, 2026-11-27)\n` + a.join("\n") + "\n");
scrivi("chiavi-normali.txt", normali, "Onda 1 · i normali");
scrivi("chiavi-pilota.txt", pilota, "Onda 1 · il pilota dei delicati, senza ultracode (Nicola 24/11 20:30)");
scrivi("chiavi-onda2.txt", onda2, "Onda 2 · gravi e bloccanti delicati, poi i minori delicati");
scrivi("chiavi-200.txt", tutti, "I 200 esatti");
const fuori = f.delicati.filter((k) => !tutti.includes(k)); scrivi("chiavi-fuori-dai-200.txt", fuori, "Senza Nicola ma fuori dai 200");
const dm = (a) => { const o = {}; a.forEach((k) => { const d = by.get(k).dimensione; o[d] = (o[d] || 0) + 1; }); return Object.entries(o).sort((x, y) => y[1] - x[1]).map(([x, y]) => x + ":" + y).join(" "); };
console.log("normali", normali.length, "· pilota", pilota.length, "· onda2", onda2.length, `(gravi e bloccanti ${gravi.length}, minori ${resto.length})`, "· fuori", fuori.length);
console.log("pilota:", dm(pilota)); console.log("onda2 minori:", dm(resto)); console.log("fuori:", dm(fuori));
