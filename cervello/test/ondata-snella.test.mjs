// Il workflow dell'ondata snella, fatto girare su un motore finto (node --test).
//
// Come per ondata-sito: il testo del file si compila come funzione asincrona e gli si danno `agent`,
// `parallel`, `pipeline` finti che rispondono secondo uno scenario. Si provano le regole che fanno
// convergere l'ondata: la macchina prima dell'agente, un collaudo per ondata, un solo giro di correzione,
// il ricollaudo con la sola lente che ha bocciato, il registro, e il tetto che non si supera mai.
// Cio' che NON vede: se i lavoratori veri seguono i prompt, e quanto costa un'ondata vera in token.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const TESTO = readFileSync(join(QUI, "..", "..", ".claude", "workflows", "ondata-snella.js"), "utf8");
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const CORPO = new AsyncFunction("args", "agent", "parallel", "pipeline", "phase", "log", "budget", "workflow",
  TESTO.replace("export const meta", "const meta"));
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);

const pac = (chiave, rischio) => ({ chiave, file: [chiave], rischio, lente: "x", difetti: [{ chiave: "x|" + chiave, titolo: "t", gravita: "grave" }] });
const schede = (lista) => ({ ondata: 21, pacchetti: lista, lenti_per_file: {} });
const SOLDI = [pac("lib/soldi.ts", "soldi"), pac("components/Bottone.tsx", "nessuno")];
const NIENTE = [pac("components/A.tsx", "nessuno"), pac("components/B.tsx", "nessuno")];

async function lancia(lista, scenario = () => undefined, extra = {}) {
  const chiamate = [];
  const perSlug = Object.fromEntries(lista.map((p) => [slug(p.chiave), p.chiave]));
  const agent = async (prompt, o) => {
    chiamate.push({ label: o.label, tipo: o.agentType, prompt });
    const r = scenario(o.label, prompt, chiamate);
    if (r !== undefined) return r;
    const [ruolo, s] = o.label.split(":");
    if (["squadra", "rifai", "correggi"].includes(ruolo)) {
      const k = perSlug[s];
      return { ramo: "fix/" + s, worktree: "sito-ondate/" + s, commit: "c-" + s, chiusi: ["x|" + k], file_toccati: [k], prove: ["tests/unit/" + s + ".test.ts"], prova_uscita: 0, rimessa: { esito: "regge", uscita: 0 } };
    }
    const chiavi = [...prompt.matchAll(/^- «([^»]+)»/gm)].map((m) => m[1]);
    return { pacchetti: chiavi.map((chiave) => ({ chiave, regge: true, boccia_per: "nessuno" })), difetti: [], copertura: [{ dimensione: "x", file: chiavi, trovati: 0 }] };
  };
  const parallel = (thunks) => Promise.all(thunks.map((t) => t().catch(() => null)));
  const pipeline = (items, ...stadi) => Promise.all(items.map(async (it, i) => { try { let r = it; for (const s of stadi) r = await s(r, it, i); return r } catch (e) { return null } }));
  const r = await CORPO({ schede: schede(lista), repo: "sito", radice_ad: "ad", base: "b0", ...extra }, agent, parallel, pipeline, () => {}, () => {}, { total: null }, { runId: "wf_finto" });
  return { r, chiamate, etichette: chiamate.map((c) => c.label) };
}
const esitoDi = (r, k) => r.pacchetti.find((p) => p.chiave === k);
const boccia = (k, causa, perche = "npx vitest run tests/unit/x.test.ts") => ({ chiave: k, regge: false, boccia_per: causa, perche });

test("tutto regge con rischio: 2 squadre + 2 collaudi (A da chi costruisce, B da chi legge)", async () => {
  const { r, chiamate } = await lancia(SOLDI);
  assert.equal(r.agenti_usati, 4);
  assert.deepEqual(chiamate.filter((c) => c.label.startsWith("collaudo")).map((c) => [c.label.split(":")[0], c.tipo]).sort(), [["collaudo-A", "tech"], ["collaudo-B", "qa"]]);
  assert.ok(r.pacchetti.every((p) => p.esito === "regge"));
  assert.equal(r.chiedi_a_nicola, false);
  assert.ok(r.copertura.length > 0);
  assert.match(r.prossimi_passi.join(" "), /conto-token\.mjs --workflow wf_finto/);
});

test("senza rischio: un collaudo solo, che porta tutte e due le domande", async () => {
  const { r, chiamate } = await lancia(NIENTE);
  const coll = chiamate.filter((c) => c.label.startsWith("collaudo"));
  assert.equal(coll.length, 1);
  assert.equal(coll[0].tipo, "tech");
  assert.match(coll[0].prompt, /Lente A/);
  assert.match(coll[0].prompt, /Lente B/);
  assert.equal(r.agenti_usati, 3);
});

test("la macchina dice «non morde»: un rifacimento, poi regge", async () => {
  const { r, etichette } = await lancia(NIENTE, (l) => (l === "squadra:components-a-tsx" ? { ramo: "r", commit: "c", chiusi: ["k"], file_toccati: ["components/A.tsx"], prove: ["t"], prova_uscita: 0, rimessa: { esito: "non_morde", uscita: 1 } } : undefined));
  assert.ok(etichette.includes("rifai:components-a-tsx"));
  assert.equal(esitoDi(r, "components/A.tsx").esito, "regge");
});

test("la macchina dice «non morde» due volte: il pacchetto non regge e non va al collaudo", async () => {
  const nm = { ramo: "r", commit: "c", chiusi: ["k"], file_toccati: ["components/A.tsx"], prove: ["t"], prova_uscita: 0, rimessa: { esito: "non_morde", uscita: 1 } };
  const { r, chiamate } = await lancia(NIENTE, (l) => (/:components-a-tsx$/.test(l) && !l.startsWith("collaudo") ? nm : undefined));
  assert.equal(esitoDi(r, "components/A.tsx").esito, "non_regge");
  assert.match(esitoDi(r, "components/A.tsx").motivo, /non_morde/);
  assert.ok(!chiamate.find((c) => c.label.startsWith("collaudo")).prompt.includes("«components/A.tsx»"));
  assert.equal(r.chiedi_a_nicola, true);
});

test("la prova del sito non verde o nessun commit: la macchina ferma la squadra", async () => {
  const { r } = await lancia(NIENTE, (l) => (l.startsWith("squadra:components-a") || l.startsWith("rifai:components-a") ? { ramo: "r", commit: "", chiusi: ["k"], file_toccati: [], prove: [], prova_uscita: 2, rimessa: { esito: "regge", uscita: 0 } } : undefined));
  assert.equal(esitoDi(r, "components/A.tsx").esito, "non_regge");
});

test("la lente A boccia: correzione, poi ricollauda SOLO la lente A, e regge", async () => {
  const { r, etichette } = await lancia(SOLDI, (l, p) => (l === "collaudo-A:ondata-21" ? { pacchetti: [boccia("lib/soldi.ts", "difetto_rimesso"), { chiave: "components/Bottone.tsx", regge: true, boccia_per: "nessuno" }], difetti: [] } : undefined));
  assert.ok(etichette.includes("correggi:lib-soldi-ts"));
  assert.ok(etichette.includes("collaudo-A-bis:ondata-21"));
  assert.ok(!etichette.includes("collaudo-B-bis:ondata-21"));
  assert.equal(esitoDi(r, "lib/soldi.ts").esito, "regge");
  assert.equal(r.chiedi_a_nicola, false);
});

test("boccia anche dopo la correzione: non regge, niente secondo giro, si chiede a Nicola", async () => {
  const { r, etichette } = await lancia(SOLDI, (l) => (l.startsWith("collaudo-A") ? { pacchetti: [boccia("lib/soldi.ts", "sito"), { chiave: "components/Bottone.tsx", regge: true, boccia_per: "nessuno" }], difetti: [] } : undefined));
  assert.equal(etichette.filter((e) => e.startsWith("correggi:")).length, 1);
  assert.equal(esitoDi(r, "lib/soldi.ts").esito, "non_regge");
  assert.equal(r.chiedi_a_nicola, true);
});

test("la lente B trova un grave nato, un minore nato e un vecchio: si corregge solo il grave, gli altri al registro", async () => {
  const { r, etichette } = await lancia(SOLDI, (l) => (l === "collaudo-B:ondata-21" ? { pacchetti: SOLDI.map((p) => ({ chiave: p.chiave, regge: true, boccia_per: "nessuno" })), difetti: [
    { titolo: "rimborso doppio", gravita: "grave", dove: "lib/soldi.ts:10", nato_dal_lotto: true, pacchetto: "lib/soldi.ts" },
    { titolo: "etichetta", gravita: "minore", dove: "x", nato_dal_lotto: true, pacchetto: "lib/soldi.ts" },
    { titolo: "vecchio", gravita: "grave", dove: "y", nato_dal_lotto: false, pacchetto: "components/Bottone.tsx" }] } : undefined));
  assert.deepEqual(etichette.filter((e) => e.startsWith("correggi:")), ["correggi:lib-soldi-ts"]);
  assert.ok(etichette.includes("collaudo-B-bis:ondata-21"));
  assert.equal(r.registro.length, 2);
});

test("la variante col suo comando non boccia e va nel registro; senza comando boccia", async () => {
  const con = await lancia(NIENTE, (l) => (l === "collaudo-AB:ondata-21" ? { pacchetti: [boccia("components/A.tsx", "variante"), { chiave: "components/B.tsx", regge: true, boccia_per: "nessuno" }], difetti: [] } : undefined));
  assert.equal(esitoDi(con.r, "components/A.tsx").esito, "regge");
  assert.equal(con.r.registro.length, 1);
  assert.ok(!con.etichette.some((e) => e.startsWith("correggi:")));
  const senza = await lancia(NIENTE, (l) => (l === "collaudo-AB:ondata-21" ? { pacchetti: [boccia("components/A.tsx", "variante", "secondo me"), { chiave: "components/B.tsx", regge: true, boccia_per: "nessuno" }], difetti: [] } : undefined));
  assert.ok(senza.etichette.includes("correggi:components-a-tsx"));
});

test("troppi pacchetti per il tetto: il workflow non parte e dice di dividere l'ondata", async () => {
  const tanti = Array.from({ length: 11 }, (_, i) => pac("lib/f" + i + ".ts", "soldi"));
  await assert.rejects(lancia(tanti), /Dividi l'ondata/);
});

test("collaudi caduti: non e' mai un regge, e il tetto di 12 non si supera", async () => {
  const cinque = Array.from({ length: 5 }, (_, i) => pac("lib/f" + i + ".ts", "soldi"));
  const { r, chiamate } = await lancia(cinque, (l) => (l.startsWith("collaudo") ? null : undefined));
  assert.ok(chiamate.length <= 12, "lanciati " + chiamate.length);
  assert.ok(r.pacchetti.every((p) => p.esito === "non_regge"));
  assert.equal(r.chiedi_a_nicola, true);
});

test("un grave nato senza pacchetto riconoscibile ferma tutti i pacchetti che quel collaudo ha guardato", async () => {
  const { etichette } = await lancia(SOLDI, (l) => (l === "collaudo-B:ondata-21" ? { pacchetti: SOLDI.map((p) => ({ chiave: p.chiave, regge: true, boccia_per: "nessuno" })), difetti: [{ titolo: "x", gravita: "bloccante", dove: "payout.ts:40", nato_dal_lotto: true, pacchetto: "payout.ts" }] } : undefined));
  assert.equal(etichette.filter((e) => e.startsWith("correggi:")).length, 2);
});

// ── dal collaudo del 30/10: le mutazioni che la prova non vedeva, e i difetti 4, 13 e 17 ──────────

test("una correzione la cui prova rimessa dice «non morde» non passa: non regge, e non si ricollauda", async () => {
  const { r, etichette } = await lancia(SOLDI, (l) => {
    if (l === "collaudo-A:ondata-21") return { pacchetti: [boccia("lib/soldi.ts", "difetto_rimesso"), { chiave: "components/Bottone.tsx", regge: true, boccia_per: "nessuno" }], difetti: [] };
    if (l === "correggi:lib-soldi-ts") return { ramo: "r", commit: "c2", chiusi: ["x|lib/soldi.ts"], file_toccati: ["lib/soldi.ts"], prove: ["t"], prova_uscita: 0, rimessa: { esito: "non_morde", uscita: 1, file: ["lib/soldi.ts"] } };
    return undefined;
  });
  assert.equal(esitoDi(r, "lib/soldi.ts").esito, "non_regge");
  assert.ok(!etichette.some((e) => e.endsWith("-bis:ondata-21")));
});

test("i posti del collaudo sono tenuti da parte: con un tetto stretto il rifacimento salta, i due collaudi no", async () => {
  const nm = { ramo: "r", commit: "c", chiusi: ["k"], file_toccati: ["lib/soldi.ts"], prove: ["t"], prova_uscita: 0, rimessa: { esito: "non_morde", uscita: 1, file: ["lib/soldi.ts"] } };
  const { r, etichette } = await lancia(SOLDI, (l) => (l === "squadra:lib-soldi-ts" ? nm : undefined), { max_agenti: 4 });
  assert.ok(!etichette.includes("rifai:lib-soldi-ts"), "il rifacimento ha preso un posto del collaudo");
  assert.ok(etichette.includes("collaudo-A:ondata-21") && etichette.includes("collaudo-B:ondata-21"));
  assert.equal(esitoDi(r, "lib/soldi.ts").esito, "non_regge");
});

test("niente correzione se poi non c'e' posto per ricollaudarla", async () => {
  const { etichette } = await lancia(SOLDI, (l) => (l === "collaudo-A:ondata-21" ? { pacchetti: SOLDI.map((p) => boccia(p.chiave, "sito")), difetti: [] } : undefined), { max_agenti: 5 });
  assert.ok(!etichette.some((e) => e.startsWith("correggi:")), "lanciata una correzione che nessuno potra' ricollaudare");
});

test("ogni lente ricollauda solo i pacchetti che ha bocciato lei", async () => {
  const { chiamate } = await lancia(SOLDI, (l) => {
    if (l === "collaudo-A:ondata-21") return { pacchetti: [boccia("lib/soldi.ts", "sito"), { chiave: "components/Bottone.tsx", regge: true, boccia_per: "nessuno" }], difetti: [] };
    if (l === "collaudo-B:ondata-21") return { pacchetti: [{ chiave: "lib/soldi.ts", regge: true, boccia_per: "nessuno" }, boccia("components/Bottone.tsx", "sito")], difetti: [] };
    return undefined;
  });
  const a = chiamate.find((c) => c.label === "collaudo-A-bis:ondata-21"), b = chiamate.find((c) => c.label === "collaudo-B-bis:ondata-21");
  assert.ok(a.prompt.includes("«lib/soldi.ts»") && !a.prompt.includes("«components/Bottone.tsx»"));
  assert.ok(b.prompt.includes("«components/Bottone.tsx»") && !b.prompt.includes("«lib/soldi.ts»"));
});

test("la lente A rilancia la prova della macchina nel SUO worktree, non in quello che legge la lente B", async () => {
  const { chiamate } = await lancia(SOLDI);
  const a = chiamate.find((c) => c.label === "collaudo-A:ondata-21").prompt;
  assert.match(a, /--repo <worktree>-collaudo/);
  assert.match(a, /ln -s sito\/node_modules <worktree>-collaudo\/node_modules/);
  const s = chiamate.find((c) => c.label.startsWith("squadra:")).prompt;
  assert.ok(s.indexOf("Committa") < s.indexOf("prova-rimessa.mjs"), "la squadra deve committare prima della prova rimessa");
});

test("i vecchi nomi degli args fermano il workflow con un errore che dice quelli nuovi", async () => {
  await assert.rejects(lancia(SOLDI, () => undefined, { tipo: "tech" }), /tipo_costruisce/);
});
