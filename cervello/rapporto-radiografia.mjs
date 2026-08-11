#!/usr/bin/env node
// Scrive il rapporto della radiografia totale leggendo il diario del lavoro.
// L'organo NON è nei difetti: lo si ricava dal prompt di ogni agente (è lì che
// sta scritto quale mandato stava eseguendo). Sola lettura sul diario.
//
//   node cervello/rapporto-radiografia.mjs <cartella-run> [--out <file.md>]

import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const RUN = args[0];
const OUT = args.includes("--out") ? args[args.indexOf("--out") + 1] : null;

if (!RUN || !fs.existsSync(path.join(RUN, "journal.jsonl"))) {
  console.error("Serve la cartella del lavoro (quella che contiene journal.jsonl).");
  process.exit(2);
}

const righe = (f) =>
  fs.readFileSync(f, "utf8").split("\n").filter(Boolean).map((l) => {
    try { return JSON.parse(l); } catch { return null; }
  }).filter(Boolean);

/** L'organo sta nel prompt del primo evento dell'agente. */
function organoDi(agentId) {
  const f = path.join(RUN, `agent-${agentId}.jsonl`);
  if (!fs.existsSync(f)) return { organo: "?", mandato: "?" };
  const fh = fs.readFileSync(f, "utf8").split("\n").slice(0, 3);
  for (const l of fh) {
    if (!l.trim()) continue;
    let e;
    try { e = JSON.parse(l); } catch { continue; }
    const c = e?.message?.content;
    if (typeof c !== "string") continue;
    const m = c.match(/Organo "(\w+)", mandato "([\w-]+)"/);
    if (m) return { organo: m[1], mandato: m[2] };
  }
  return { organo: "?", mandato: "?" };
}

const ev = righe(path.join(RUN, "journal.jsonl"));
const difetti = [];
const zone = new Set();
for (const e of ev) {
  if (e.type !== "result") continue;
  const { organo, mandato } = organoDi(e.agentId);
  for (const d of e.result?.difetti || []) difetti.push({ ...d, organo, mandato });
  for (const z of e.result?.zone_non_viste || []) zone.add(z);
}

// Due giri diversi raccontano lo stesso difetto con parole diverse: «dice con
// quale motore lavora» e «dice su quale motore deve girare». Un confronto sul
// titolo esatto non li vede, quindi si confrontano le parole che contano.
const parole = (t) =>
  new Set(String(t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .match(/[a-z]+/g)?.filter((p) => p.length > 4) || []);

const unici = [];
let doppioni = 0;
for (const d of difetti) {
  const pd = parole(d.titolo);
  const gemello = unici.find((u) => {
    if (u.organo !== d.organo) return false;
    const pu = parole(u.titolo);
    const comuni = [...pd].filter((p) => pu.has(p)).length;
    return comuni / Math.max(1, Math.min(pd.size, pu.size)) >= 0.7;
  });
  if (gemello) doppioni++;
  else unici.push(d);
}

const ORDINE = { bloccante: 0, grave: 1, minore: 2 };
unici.sort((a, b) =>
  (ORDINE[a.severita] ?? 3) - (ORDINE[b.severita] ?? 3) ||
  (a.impatto_crescita === "alto" ? -1 : 0) - (b.impatto_crescita === "alto" ? -1 : 0)
);

const conta = (fs_, s) => fs_.filter((d) => d.severita === s).length;
const perOrgano = {};
for (const d of unici) (perOrgano[d.organo] ||= []).push(d);

const NOMI = {
  macchina: "Me stessa (l'AD)", pannello: "Il Pannello", senior: "I senior",
  worker: "Il worker e il server", github: "La repo su GitHub", codice: "Il mio codice",
};

const ora = new Date().toISOString().slice(0, 16).replace("T", " ");
const L = [];
L.push(`---\ndata: ${ora}\n---\n`);
L.push(`# Radiografia di tutti gli organi\n`);
const nB = conta(unici, "bloccante");
L.push(`**In due righe:** ho guardato sei organi in tre giri, e ogni difetto grave è passato da un secondo revisore che provava a smontarlo. Sono rimasti **${unici.length} difetti**: ${nB === 1 ? "uno blocca" : `${nB} bloccano`}, ${conta(unici, "grave")} sono gravi, ${conta(unici, "minore")} minori.\n`);

const alto = unici.filter((d) => d.impatto_crescita === "alto" && d.severita !== "minore");
L.push(`**Cosa cambia per te:** ${alto.length} di questi frenano direttamente ordini, negozi o margine. Quelli sono i primi da riparare.\n`);
L.push(`**Cosa devi fare:** leggi i bloccanti qui sotto e dimmi quali riparo. Ogni riparazione resta una proposta da firmare.\n`);
L.push(`---\n`);

L.push(`## Quanti, e dove\n`);
L.push(`| Organo | Difetti | Bloccanti | Gravi | Minori |`);
L.push(`|---|---|---|---|---|`);
for (const [o, ds] of Object.entries(perOrgano).sort((a, b) => b[1].length - a[1].length)) {
  L.push(`| ${NOMI[o] || o} | ${ds.length} | ${conta(ds, "bloccante")} | ${conta(ds, "grave")} | ${conta(ds, "minore")} |`);
}
L.push(``);

const prove = { comando: 0, umano: 0, grep: 0 };
for (const d of unici) prove[d.prova_tipo] = (prove[d.prova_tipo] || 0) + 1;
L.push(`**Come sono provati:** ${prove.comando || 0} portano un comando che diventa rosso se il difetto c'è, ${prove.umano || 0} chiedono un occhio umano, ${prove.grep || 0} si appoggiano ancora a una parola cercata in un file — questi ultimi sono i più deboli.\n`);
if (doppioni) L.push(`*(${doppioni === 1 ? "Un doppione tolto" : `${doppioni} doppioni tolti`}: più giri avevano trovato la stessa cosa con parole diverse.)*\n`);

// Centotrenta schede lunghe fanno un documento da sei ore di lettura, cioè un
// documento che nessuno legge. La scheda intera va solo a ciò che blocca o
// frena i soldi; tutto il resto è una riga, e chi deve ripararlo apre il difetto
// nel cantiere.
const scheda = (d) => {
  L.push(`### ${d.titolo}`);
  L.push(`*${NOMI[d.organo] || d.organo}${d.impatto_crescita === "alto" ? " · frena la crescita" : ""}*\n`);
  if (d.descrizione) L.push(`${d.descrizione}\n`);
  if (d.impatto) L.push(`**Cosa costa:** ${d.impatto}\n`);
  if (d.causa_radice) L.push(`**Da dove nasce:** ${d.causa_radice}\n`);
  if (d.fix) L.push(`**Come si ripara:** ${d.fix}\n`);
  L.push(`<details><summary>Dettagli tecnici</summary>\n`);
  L.push(`- Dove: \`${d.dove}\``);
  L.push(`- Prova (${d.prova_tipo}): \`${String(d.prova).replace(/\n/g, " ").slice(0, 400)}\``);
  if (d.mandato) L.push(`- Mandato: ${d.mandato}`);
  L.push(`\n</details>\n`);
};

const bloccanti = unici.filter((d) => d.severita === "bloccante");
if (bloccanti.length) {
  L.push(`\n## Quello che blocca\n`);
  bloccanti.forEach(scheda);
}

if (alto.length) {
  L.push(`\n## Quelli che frenano i soldi (${alto.length})\n`);
  L.push(`Questi non bloccano, ma costano ordini, negozi o margine. Sono i primi da riparare dopo il bloccante.\n`);
  alto.filter((d) => d.severita !== "bloccante").forEach(scheda);
}

const restanti = unici.filter((d) => !bloccanti.includes(d) && !alto.includes(d));
if (restanti.length) {
  L.push(`\n## Tutto il resto (${restanti.length})\n`);
  L.push(`Una riga per difetto. La scheda intera — con la prova, la causa e il modo di ripararlo — sta nel cantiere.\n`);
  for (const o of Object.keys(perOrgano)) {
    const ds = restanti.filter((d) => d.organo === o);
    if (!ds.length) continue;
    L.push(`\n**${NOMI[o] || o}** — ${ds.length}\n`);
    for (const d of ds) L.push(`- ${d.severita === "grave" ? "**" : ""}${d.titolo}${d.severita === "grave" ? "**" : ""} · \`${String(d.dove).split(/[ ·]/)[0]}\``);
  }
  L.push(``);
}

if (zone.size) {
  // Gli agenti dichiarano la stessa cecità con parole diverse: si accorpano per
  // parole in comune, altrimenti l'elenco è più lungo dei difetti.
  const gruppi = [];
  for (const z of zone) {
    const pz = parole(z);
    const g = gruppi.find((x) => {
      const comuni = [...pz].filter((p) => x.parole.has(p)).length;
      return comuni / Math.max(1, Math.min(pz.size, x.parole.size)) >= 0.6;
    });
    if (g) g.quante++;
    else gruppi.push({ testo: z, parole: pz, quante: 1 });
  }
  gruppi.sort((a, b) => b.quante - a.quante);
  L.push(`\n## Cosa non ho potuto vedere\n`);
  L.push(`Non sono cose a posto: sono cose che da qui non si guardano. ${zone.size} dichiarazioni, raggruppate in ${gruppi.length}.\n`);
  for (const g of gruppi.slice(0, 25)) L.push(`- ${g.testo}${g.quante > 1 ? ` *(detto ${g.quante} volte)*` : ""}`);
  if (gruppi.length > 25) L.push(`\n*(altre ${gruppi.length - 25} non elencate qui)*`);
  L.push(``);
}

L.push(`\n## Cosa non ho verificato\n`);
L.push(`- **Il server dal vivo.** Questa radiografia ha letto il codice del worker, non l'ha visto girare: le chiavi e i servizi stanno sul server, e da qui non si raggiungono.`);
L.push(`- **I ${conta(unici, "minore")} difetti minori non sono passati dal secondo revisore.** Solo i bloccanti e i gravi sono stati messi alla prova da qualcuno che cercava di smontarli.`);
L.push(`- **${prove.grep || 0} difetti si appoggiano a una parola cercata in un file.** Non è una prova che può fallire come fallisce la realtà: vanno riprovati o declassati.\n`);

const testo = L.join("\n");
if (OUT) {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, testo);
  console.log(`Rapporto scritto: ${OUT}`);
  console.log(`${unici.length} difetti (${conta(unici, "bloccante")} bloccanti · ${conta(unici, "grave")} gravi · ${conta(unici, "minore")} minori) · ${doppioni} doppioni tolti · ${zone.size} zone non viste`);
} else {
  console.log(testo);
}
