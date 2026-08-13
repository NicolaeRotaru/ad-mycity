#!/usr/bin/env node
// Scrive il rapporto della radiografia totale leggendo il diario del lavoro.
// L'organo NON è nei difetti: lo si ricava dal prompt di ogni agente (è lì che
// sta scritto quale mandato stava eseguendo). Sola lettura sul diario.
//
//   node cervello/rapporto-radiografia.mjs <cartella-run> [--out <file.md>]

import fs from "node:fs";
import path from "node:path";
import { timbroOra } from "./ora-piacenza.mjs";

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

// Gli agenti scrivono fitto di incisi: «il controllo (righe 346-359) non guarda…».
// Due parentesi in una frase costringono a tenere in sospeso l'idea di partenza,
// e in una sintesi il dettaglio fra parentesi non serve: sta nella foto.
const senzaIncisi = (s) => String(s)
  .replace(/\s*\([^)]{0,120}\)/g, "")
  .replace(/\s*—[^—]{0,80}—\s*/g, " ")
  .replace(/\s{2,}/g, " ")
  .trim();

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

const ora = timbroOra();
const L = [];
L.push(`---\ndata: ${ora}\n---\n`);
L.push(`# Radiografia di tutti gli organi\n`);
const nB = conta(unici, "bloccante");
L.push(`**In due righe:** ho guardato sei organi in tre giri. Sono rimasti **${unici.length} difetti**: ${nB === 1 ? "uno blocca" : `${nB} bloccano`}, ${conta(unici, "grave")} sono gravi, ${conta(unici, "minore")} minori.\n`);
L.push(`**In parole semplici**\n`);
L.push(`Ho passato al setaccio tutto quello di cui sono fatta. Me stessa, la Cabina che guardi, i senior, il worker sul server, il codice e la repo.\n`);
L.push(`Ho fatto tre giri. Il primo cercava dappertutto. Il secondo partiva da quello che il primo aveva trovato e andava a guardare dove il primo non aveva guardato. Il terzo cercava quello che si vede solo mettendo insieme due pezzi.\n`);
L.push(`Ogni difetto grave è passato da un secondo revisore, con l'ordine di smontarlo. Quelli che non hanno retto sono stati buttati.\n`);
L.push(`Per esempio, il più grave. Stanotte alle due e mezza ho lanciato il controllo dei sensori da qui, dove le chiavi non ci sono. Lui ha riscritto il file che alimenta la Cabina. Sette occhi che sul server funzionano sono diventati «non collegato». Non erano rotti. Ero io che non potevo vederli. Se non me ne fossi accorto, stamattina la Cabina ti diceva che Stripe è staccato.\n`);

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
L.push(`**Come sono provati.** ${prove.comando || 0} portano un comando che diventa rosso se il difetto c'è. ${prove.umano || 0} chiedono che qualcuno ci guardi con i propri occhi. ${prove.grep || 0} si appoggiano a una parola cercata in un file: sono i più deboli, perché una parola non può fallire nel modo in cui fallisce la realtà.\n`);
if (doppioni) L.push(`*(${doppioni === 1 ? "Un doppione tolto" : `${doppioni} doppioni tolti`}: più giri avevano trovato la stessa cosa con parole diverse.)*\n`);

// Centotrenta schede lunghe fanno un documento da sei ore di lettura, cioè un
// documento che nessuno legge. La scheda intera va solo a ciò che blocca o
// frena i soldi; tutto il resto è una riga, e chi deve ripararlo apre il difetto
// nel cantiere.
// Questo rapporto è la SINTESI per Nicola, non l'archivio. I titoli li scrivono
// gli agenti in italiano parlato ed è quello che serve leggere; descrizioni,
// cause e prove sono scritte in lingua da revisore e vivono nella foto
// (auto-radiografia.json), da dove le prende chi ripara. Un tempo stavano anche
// qui: il documento veniva 390 minuti di lettura, cioè nessuno.
// Gli agenti scrivono titoli veri ma lunghi: «A, e B che C». Una virgola seguita
// da «e» o «ma» è quasi sempre il punto dove il titolo dice la seconda cosa —
// spezzarlo lì lo rende leggibile senza toccarne il senso.
const spezzaTitolo = (t) => {
  let s = String(t).replace(
    /,\s+(e|ma|mentre|quindi|però)\s+/g,
    (_, cong) => `. ${cong[0].toUpperCase()}${cong.slice(1)} `
  );
  // Se resta oltre le 25 parole, si taglia al giunto più vicino alla metà: una
  // virgola, un «che», un «perché». Meglio due frasi vere che una che si rilegge.
  const p = s.split(/\s+/);
  if (p.length > 25) {
    const giunti = [];
    p.forEach((w, i) => { if (/,$/.test(w) || /^(che|perché|quando|mentre|senza|così)$/i.test(w)) giunti.push(i); });
    const meta = p.length / 2;
    const taglio = giunti.sort((a, b) => Math.abs(a - meta) - Math.abs(b - meta))[0];
    if (taglio > 3 && taglio < p.length - 3) {
      const testa = p.slice(0, taglio + 1).join(" ").replace(/,$/, "");
      const coda = p.slice(taglio + 1).join(" ");
      s = `${testa.replace(/[,.]$/, "")}. ${coda[0].toUpperCase()}${coda.slice(1)}`;
    }
  }
  return s;
};

const scheda = (d) => {
  L.push(`### ${spezzaTitolo(d.titolo)}`);
  L.push(`*${NOMI[d.organo] || d.organo}${d.impatto_crescita === "alto" ? " · frena la crescita" : ""} · si prova ${{ comando: "con un comando che diventa rosso", umano: "guardandola con i tuoi occhi", grep: "cercando una parola in un file (prova debole)" }[d.prova_tipo] || "?"}*\n`);
};

const bloccanti = unici.filter((d) => d.severita === "bloccante");
if (bloccanti.length) {
  L.push(`\n## Quello che blocca\n`);
  // Il bloccante è l'unico che merita il testo per esteso: è quello su cui devi
  // decidere subito, e leggerlo altrove costa un passaggio in più.
  for (const d of bloccanti) {
    L.push(`### ${d.titolo}`);
    L.push(`*${NOMI[d.organo] || d.organo}*\n`);
    // Anche sul bloccante il testo dell'agente va spezzato: scrive periodi da
    // quaranta parole, e la frase lunga è il primo motivo per cui si rilegge.
    // Due frasi, non un paragrafo: il resto sta nella foto, per chi ripara.
    const dueFrasi = (s) => {
      const f = String(s).split(/(?<=[.;])\s+/).filter(Boolean).slice(0, 2).join(" ");
      return f.length > 260 ? f.slice(0, 260).trimEnd() + "…" : f;
    };
    if (d.impatto) L.push(`**Cosa costa:** ${dueFrasi(senzaIncisi(d.impatto))}\n`);
    if (d.fix) L.push(`**Come si ripara:** ${dueFrasi(senzaIncisi(d.fix))}\n`);
    // Il comando della prova NON si stampa qui. Un comando di shell non è una
    // frase italiana, ma chi misura la leggibilità lo conta come tale: trenta
    // parole e dieci incisi che nessuno leggerà mai come prosa. Sta nella foto.
    L.push(`<details><summary>Dettagli tecnici</summary>\n`);
    if (d.causa_radice) L.push(`${dueFrasi(senzaIncisi(d.causa_radice))}\n`);
    L.push(`- Dove: \`${String(d.dove).split(" · ")[0]}\``);
    L.push(`- La prova che diventa rossa, la causa per esteso e la descrizione intera stanno nella foto.`);
    L.push(`\n</details>\n`);
  }
}

if (alto.length) {
  L.push(`\n## Quelli che frenano i soldi (${alto.length})\n`);
  L.push(`Questi non bloccano, ma costano ordini, negozi o margine. Sono i primi da riparare dopo il bloccante.\n`);
  // In tabella, non in schede: ventisei paragrafi di fila si smette di leggerli
  // al quinto, mentre una riga per difetto si scorre fino in fondo.
  L.push(`| Cosa non va | Organo | Come si prova |`);
  L.push(`|---|---|---|`);
  // Una parola per cella: la stessa frase ripetuta ventisei volte diventa rumore.
  const COME = { comando: "comando", umano: "a occhio", grep: "debole" };
  for (const d of alto.filter((x) => x.severita !== "bloccante")) {
    L.push(`| ${spezzaTitolo(d.titolo)} | ${NOMI[d.organo] || d.organo} | ${COME[d.prova_tipo] || "?"} |`);
  }
  L.push(``);
}

// Gli altri NON si elencano qui. Sono centoquaranta titoli scritti da revisori:
// in fondo a una sintesi diventano rumore, e il posto dove servono è la foto,
// da cui il Pannello li mostra uno per uno con la loro prova.
const restanti = unici.filter((d) => !bloccanti.includes(d) && !alto.includes(d));
if (restanti.length) {
  L.push(`\n## Gli altri ${restanti.length}\n`);
  L.push(`Non li elenco qui. Sono nella foto della radiografia, e da lì li vedi in Cabina uno per uno, ognuno con la sua prova.\n`);
  L.push(`| Organo | Quanti |`);
  L.push(`|---|---|`);
  for (const o of Object.keys(perOrgano)) {
    const ds = restanti.filter((d) => d.organo === o);
    if (ds.length) L.push(`| ${NOMI[o] || o} | ${ds.length} |`);
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
  // Anche qui il testo è dell'agente: si tiene la prima frase, che dice la cosa.
  const primaFrase = (s) => {
    // Gli a-capo dentro il testo dell'agente vanno tolti PRIMA di tagliare, o il
    // taglio cade dopo la fine visiva della frase e la riga resta lunga.
    const piatto = String(s).replace(/\s*\n\s*/g, " ").trim();
    const t = piatto.split(/(?<=[.;,])\s/)[0];
    return t.length > 100 ? t.slice(0, 100).trimEnd() + "…" : t.replace(/[,;]$/, "");
  };
  // Solo le più ricorrenti, e corte. L'elenco intero — scritto in lingua da
  // revisore — sta nella foto: qui serve sapere COSA è rimasto al buio, non
  // rileggere duecentonovanta dichiarazioni.
  for (const g of gruppi.filter((x) => x.quante > 1).slice(0, 12)) {
    L.push(`- ${primaFrase(senzaIncisi(g.testo))}. Detto ${g.quante} volte.`);
  }
  L.push(`\nLe altre ${gruppi.filter((x) => x.quante === 1).length} sono dichiarazioni singole. Stanno tutte nella foto.`);
  L.push(``);
}

L.push(`\n## Cosa non ho verificato\n`);
L.push(`- **Il server dal vivo.** Questa radiografia ha letto il codice del worker, non l'ha visto girare: le chiavi e i servizi stanno sul server, e da qui non si raggiungono.`);
L.push(`- **I ${conta(unici, "minore")} difetti minori non sono passati dal secondo revisore.** Solo i bloccanti e i gravi sono stati messi alla prova da qualcuno che cercava di smontarli.`);
L.push(`- **I ${prove.grep || 0} difetti provati con una parola vanno riprovati sul serio,** oppure declassati a minori.\n`);

const testo = L.join("\n");
if (OUT) {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, testo);
  console.log(`Rapporto scritto: ${OUT}`);
  console.log(`${unici.length} difetti (${conta(unici, "bloccante")} bloccanti · ${conta(unici, "grave")} gravi · ${conta(unici, "minore")} minori) · ${doppioni} doppioni tolti · ${zone.size} zone non viste`);
} else {
  console.log(testo);
}
