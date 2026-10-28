// Il workflow dell'ondata, fatto girare su un motore finto (node --test).
//
// PERCHE' UN MOTORE FINTO. Il workflow vero non si puo' lanciare da una prova: lo esegue il motore di
// Claude Code, con lavoratori veri e worktree veri del sito. Ma le regole che fanno CONVERGERE
// un'ondata — il tetto agli agenti, le due lenti solo dove c'e' rischio, il ricollaudo con la sola
// lente che ha bocciato, i minori che non tornano alle squadre, il fermo dopo due giri — sono codice
// del workflow, e si possono eseguire. Qui il testo del file si compila come funzione asincrona (la
// stessa forma che il motore accetta: niente import, `meta` per primo, `return` in cima) e gli si
// danno `agent`, `parallel`, `pipeline` finti che rispondono secondo uno scenario.
//
// Cio' che questa prova NON vede, detto qui: se i lavoratori veri seguono i prompt, se `git worktree`
// e prova-sito girano davvero nel sito, quanto costa un'ondata in gettoni. Quello si misura solo
// lanciandola, con cervello/conto-token.mjs.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { TEMPO_TOTALE_MS, TETTO_BASH_MS } from "../prova-sito.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const TESTO = readFileSync(join(QUI, "..", "..", ".claude", "workflows", "ondata-sito.js"), "utf8");
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const CORPO = new AsyncFunction("args", "agent", "parallel", "pipeline", "phase", "log", "budget", "workflow",
  TESTO.replace("export const meta", "const meta"));

const SCHEDE = {
  piano: "consegne/audit/finto.json",
  ondata: 2,
  pacchetti: [
    { chiave: "lib/stripe/payout.ts", file: ["lib/stripe/payout.ts"], rischio: "soldi", lente: "pagamenti-stripe",
      difetti: [{ chiave: "pagamenti-stripe|rimborso doppio", titolo: "Rimborso doppio", gravita: "grave" }] },
    { chiave: "components/cart/Pay.tsx", file: ["components/cart/Pay.tsx"], rischio: "nessuno", lente: "frontend-ux",
      difetti: [{ chiave: "frontend-ux|pulsante sparito", titolo: "Pulsante sparito", gravita: "grave" }] },
  ],
  lenti_per_file: { "lib/stripe/payout.ts": "pagamenti-stripe", "components/cart/Pay.tsx": "frontend-ux" },
};
const ARGS = { schede: SCHEDE, repo: "sito", radice_ad: "ad", base: "b0" };
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);

/**
 * Lancia il workflow con un motore finto. `scenario(label, prompt, opts)` risponde per ogni
 * lavoratore; quello che non risponde riceve il comportamento di default (tutto regge).
 * `motore` (facoltativo, da aGettoni) fa lavorare ogni lavoratore un passo d'orologio e addebita il budget.
 */
async function lancia(scenario = () => undefined, args = ARGS, budget = undefined, motore = undefined) {
  const chiamate = [];
  const righe = [];
  let commit = 0;
  const agent = async (prompt, opts) => {
    chiamate.push({ label: opts.label, tipo: opts.agentType, fase: opts.phase, prompt, schema: opts.schema });
    if (motore) await motore.lavora();
    const r = scenario(opts.label, prompt, opts);
    if (r instanceof Error) throw r; // un lavoratore che cade
    if (r !== undefined) return r;
    if (/^(squadra|rifacimento|correzione)/.test(opts.label)) {
      const chiusi = [...prompt.matchAll(/"chiave":"([^"]+)"/g)].map((m) => m[1]);
      const pac = (args.schede?.pacchetti || []).find((p) => opts.label.endsWith(":" + slug(p.chiave)));
      const file = opts.label.includes("payout") ? ["lib/stripe/payout.ts", "tests/unit/payout.test.ts"] : pac ? pac.file : ["components/cart/Pay.tsx"];
      return { ramo: "fix/x", worktree: "wt-" + opts.label.split(":")[1], commit: "c" + ++commit, chiusi, file_toccati: file };
    }
    if (opts.label.startsWith("verifica")) return { reale: true };
    return { regge: true, difetti: [] };
  };
  const parallel = (thunks) => Promise.all(thunks.map((t) => t()));
  const pipeline = (items, uno, due) => Promise.all(items.map(async (x) => due(await uno(x), x)));
  const esito = await CORPO(args, agent, parallel, pipeline, () => {}, (m) => righe.push(m), budget, { runId: "run-finto" });
  return { esito, chiamate, righe, etichette: chiamate.map((c) => c.label) };
}

/**
 * Un budget a gettoni. «fine»: il lavoratore paga tutto quando finisce, cioe' mentre lavora il motore
 * non ha ancora tolto niente (la variante scomoda, quella del collaudo del 25/10). «meta»: meta' quando
 * parte e meta' quando finisce (scende mentre lavora). «avvio»: tutto quando parte (il modello comodo).
 * `minimo` e' il punto piu' basso toccato dal budget: sotto la riserva vuol dire riserva mangiata.
 */
function aGettoni(modo, totale, { iniziale = totale, costo = 10 } = {}) {
  let speso = 0;
  let minimo = iniziale;
  const paga = (x) => { speso += x; minimo = Math.min(minimo, iniziale - speso); };
  const prima = { fine: 0, meta: costo / 2, avvio: costo }[modo];
  return {
    budget: { total: totale, remaining: () => iniziale - speso },
    minimo: () => minimo,
    async lavora() {
      paga(prima);
      await new Promise((ok) => setTimeout(ok, 1));
      paga(costo - prima);
    },
  };
}

test("tutto regge: due lenti solo sul pacchetto dei soldi, una sola altrove, un riesame per lente", async () => {
  const { esito, etichette, chiamate } = await lancia();
  assert.deepEqual(etichette.filter((l) => l.startsWith("collaudo")).sort(),
    ["collaudoA:lib-stripe-payout-ts", "collaudoAB:components-cart-pay-tsx", "collaudoB:lib-stripe-payout-ts"]);
  assert.deepEqual(etichette.filter((l) => l.startsWith("riesame")).sort(), ["riesame:frontend-ux", "riesame:pagamenti-stripe"]);
  assert.equal(esito.agenti.usati, 7, "2 squadre + 3 collaudi + 2 revisori");
  assert.equal(esito.chiedi_a_nicola, false);
  assert.deepEqual(esito.pacchetti.map((p) => p.chiusi.length), [1, 1]);
  const tipiDi = (re) => [...new Set(chiamate.filter((c) => re.test(c.label)).map((c) => c.tipo))];
  assert.deepEqual(tipiDi(/^squadra/), ["tech"], "chi costruisce: un senior che esiste, non il tipo che non e' ancora nato");
  assert.deepEqual(tipiDi(/^collaudo(A|AB):/), ["tech"], "la lente A muta in un worktree: scrive, quindi non e' qa");
  assert.deepEqual(tipiDi(/^(collaudoB|riesame)/), ["qa"], "chi solo legge: la lente B e il riesame");
  assert.match(esito.poi.at(-1), /conto-token\.mjs --workflow run-finto/);
  // Il file di prova scritto fuori dal territorio (tests/) non accende la seconda lente da solo.
  assert.ok(!etichette.includes("collaudoA:components-cart-pay-tsx"));
});

test("i minori nati non tornano alle squadre: vanno nel registro, e nessun rifacimento parte", async () => {
  const minore = { titolo: "Etichetta storta", gravita: "minore", dove: "components/cart/Pay.tsx:3", nato_dal_lotto: true };
  const preesistente = { titolo: "Vecchio grave", gravita: "grave", dove: "components/cart/Pay.tsx:9", nato_dal_lotto: false };
  const { esito, etichette } = await lancia((l) =>
    l.startsWith("collaudoAB") ? { regge: true, difetti: [minore] } : l.startsWith("riesame:frontend") ? { regge: true, difetti: [preesistente, minore] } : undefined);
  assert.ok(!etichette.some((l) => l.startsWith("rifacimento") || l.startsWith("correzione") || l.startsWith("verifica")));
  assert.deepEqual(esito.registro.map((d) => d.titolo).sort(), ["Etichetta storta", "Vecchio grave"], "doppioni tolti, preesistente compreso");
  assert.equal(esito.chiedi_a_nicola, false);
});

test("si ricollauda solo con la lente che ha bocciato", async () => {
  let bocciature = 0;
  const { etichette, esito } = await lancia((l) =>
    l === "collaudoB:lib-stripe-payout-ts" && bocciature++ === 0 ? { regge: false, perche: "npm test x diventa rosso", difetti: [] } : undefined);
  assert.equal(etichette.filter((l) => l === "collaudoA:lib-stripe-payout-ts").length, 1, "la lente A aveva promosso: non si richiama");
  assert.equal(etichette.filter((l) => l === "collaudoB:lib-stripe-payout-ts").length, 2);
  assert.equal(etichette.filter((l) => l.startsWith("rifacimento1")).length, 1);
  assert.equal(esito.pacchetti[0].stato, "regge");
});

const NATO = { titolo: "Il rimborso parte due volte", gravita: "grave", dove: "lib/stripe/payout.ts:40", prova: "npx vitest run x", nato_dal_lotto: true };

test("un revisore del riesame che cade non sparisce: il suo pacchetto si ferma e si chiede a Nicola", async () => {
  const { esito } = await lancia((l) => (l === "riesame:pagamenti-stripe" ? new Error("rete caduta") : undefined));
  assert.equal(esito.chiedi_a_nicola, true, "un riesame mai avvenuto sui pagamenti non e' un'ondata pulita");
  assert.match(esito.motivo, /riesame non concluso/);
  assert.notEqual(esito.pacchetti.find((p) => p.pacchetto === "lib/stripe/payout.ts").stato, "regge", "senza riesame il ramo non si ricuce");
  assert.equal(esito.pacchetti.find((p) => p.pacchetto === "components/cart/Pay.tsx").stato, "regge", "l'altra lente il riesame l'ha avuto");
  assert.deepEqual(esito.agenti.caduti, ["riesame:pagamenti-stripe"]);
});

test("un revisore che dice regge:false senza nominare il difetto non viene ignorato", async () => {
  const { esito } = await lancia((l) => (l === "riesame:pagamenti-stripe" ? { regge: false, perche: "il rimborso parte due volte: npx vitest run x rosso", difetti: [] } : undefined));
  assert.equal(esito.chiedi_a_nicola, true);
  assert.match(esito.riesame_non_concluso[0].perche, /senza nominare il difetto/);
});

test("il posto del riesame non lo rubano i rifacimenti dei pacchetti in parallelo", async () => {
  // Il caso del collaudo del 25/10: tetto 45, cinque pacchetti a rischio, le due lenti bocciano due
  // volte e promuovono alla terza. Prima, in 2 lanci su 3 il riesame partiva con 0 revisori su 4.
  const pac = [1, 2, 3, 4, 5].map((i) => ({ chiave: `lib/stripe/f${i}.ts`, file: [`lib/stripe/f${i}.ts`], rischio: "soldi", lente: `lente${i}`, difetti: [{ chiave: `k${i}`, titolo: "t", gravita: "grave" }] }));
  const schede = { ondata: 9, pacchetti: pac, lenti_per_file: Object.fromEntries(pac.map((p, i) => [p.file[0], `lente${i + 1}`])) };
  const conti = {};
  let n = 0;
  const { esito, etichette } = await lancia((l, prompt) => {
    conti[l] = (conti[l] || 0) + 1;
    if (/^(squadra|rifacimento)/.test(l)) {
      const p = pac.find((x) => l.endsWith(x.chiave.replace(/[^a-z0-9]+/g, "-")));
      return new Promise((ok) => setTimeout(() => ok({ ramo: "r", worktree: "w-" + p.chiave, commit: "c" + ++n, chiusi: [...prompt.matchAll(/"chiave":"([^"]+)"/g)].map((m) => m[1]), file_toccati: p.file }), (n * 7) % 5));
    }
    if (l.startsWith("collaudo") && conti[l] <= 2) return { regge: false, perche: "rosso", difetti: [] };
    return undefined;
  }, { ...ARGS, schede });
  const revisori = etichette.filter((l) => l.startsWith("riesame"));
  const lentiOk = esito.pacchetti.filter((p) => p.stato === "regge").length;
  assert.ok(lentiOk > 0, "almeno un pacchetto deve arrivare al riesame, o la prova non prova niente");
  assert.equal(revisori.length, Math.min(4, lentiOk), "ogni lente dei pacchetti promossi ha il suo revisore");
  assert.ok(!esito.agenti.saltati.some((l) => l.startsWith("riesame")), `riesame saltato: ${esito.agenti.saltati}`);
  assert.ok(esito.agenti.usati <= 45);
});

test("un pacchetto «nessuno» che scrive fuori dal suo territorio prende tutte e due le lenti", async () => {
  const { etichette } = await lancia((l) =>
    l === "squadra:components-cart-pay-tsx" ? { ramo: "r", worktree: "w", commit: "c9", chiusi: ["frontend-ux|pulsante sparito"], file_toccati: ["components/cart/Pay.tsx", "lib/stripe/payout.ts"] } : undefined);
  assert.ok(etichette.includes("collaudoA:components-cart-pay-tsx") && etichette.includes("collaudoB:components-cart-pay-tsx"), etichette.join(" "));
  assert.ok(!etichette.includes("collaudoAB:components-cart-pay-tsx"));
});

test("la seconda voce: se cade il grave resta, se lo smonta il grave sparisce davvero", async () => {
  const caduta = await lancia((l) => (l.startsWith("riesame:pagamenti") ? { regge: false, difetti: [NATO] } : l.startsWith("verifica") ? new Error("giu'") : undefined));
  assert.ok(caduta.etichette.includes("correzione1:lib-stripe-payout-ts"), "un verificatore caduto non fa sparire un grave nato sui soldi");
  const smontato = await lancia((l) => (l.startsWith("riesame:pagamenti") ? { regge: false, difetti: [NATO] } : l.startsWith("verifica") ? { reale: false, perche: "passa anche sulla base" } : undefined));
  assert.ok(!smontato.etichette.some((l) => l.startsWith("correzione")), "un grave smontato non si corregge");
  assert.equal(smontato.esito.smontati.length, 1);
  assert.equal(smontato.esito.chiedi_a_nicola, false);
});

test("dopo una correzione riuscita restano chiusi anche i difetti originali del pacchetto", async () => {
  const { esito, etichette } = await lancia((l) => (l.startsWith("riesame:pagamenti") ? { regge: false, difetti: [NATO] } : undefined));
  assert.ok(etichette.includes("correzione1:lib-stripe-payout-ts"));
  const p = esito.pacchetti.find((x) => x.pacchetto === "lib/stripe/payout.ts");
  assert.deepEqual(p.chiusi, ["pagamenti-stripe|rimborso doppio"], "la correzione non cancella le chiusure della squadra");
  assert.equal(p.stato, "regge");
  assert.equal(esito.chiedi_a_nicola, false);
});

test("un grave nato che non si lascia correggere: due giri, poi si ferma e chiede a Nicola", async () => {
  const nato = { titolo: "Il rimborso parte due volte", gravita: "grave", dove: "lib/stripe/payout.ts:40", prova: "npx vitest run x", nato_dal_lotto: true };
  let inCorrezione = false;
  const { esito, etichette } = await lancia((l) => {
    if (l.startsWith("correzione")) inCorrezione = true;
    if (l.startsWith("riesame:pagamenti")) return { regge: false, difetti: [nato] };
    if (inCorrezione && l.startsWith("collaudo")) return { regge: true, difetti: [nato] };
    return undefined;
  });
  assert.equal(etichette.filter((l) => l.startsWith("verifica")).length, 1, "la seconda voce solo sul grave nato");
  assert.equal(etichette.filter((l) => l.startsWith("correzione")).length, 2, "al massimo due giri di correzione");
  assert.equal(esito.chiedi_a_nicola, true);
  assert.equal(esito.gravi_aperti.length, 1);
  assert.match(esito.motivo, /dopo 2 giri/);
  assert.ok(!etichette.some((l) => l.startsWith("riesame") && etichette.indexOf(l) > etichette.indexOf("correzione1:lib-stripe-payout-ts")), "un solo riesame: la correzione non ne apre un altro");
  assert.notEqual(esito.pacchetti[0].stato, "regge", "un ramo con un grave aperto non si ricuce");
});

test("una lente che boccia nominando il grave conta UN grave, non due", async () => {
  let inCorrezione = false;
  const { esito } = await lancia((l) => {
    if (l.startsWith("correzione")) inCorrezione = true;
    if (l.startsWith("riesame:pagamenti")) return { regge: false, difetti: [NATO] };
    if (inCorrezione && l.startsWith("collaudo")) return { regge: false, perche: "il rimborso parte ancora due volte", difetti: [NATO] };
    return undefined;
  });
  assert.deepEqual(esito.gravi_aperti.map((d) => d.titolo), [NATO.titolo]);
  assert.equal(esito.gravi_aperti[0].pacchetto, "lib/stripe/payout.ts");
  assert.match(esito.motivo, /^1 gravi nati/);
  assert.equal(esito.pacchetti[0].stato, "fermo: grave nato ancora aperto sul ramo");
});

test("il tetto agli agenti si rispetta e il fermo si dichiara", async () => {
  const { esito } = await lancia(undefined, { ...ARGS, max_agenti: 3 });
  assert.ok(esito.agenti.usati <= 3, `${esito.agenti.usati} agenti con un tetto di 3`);
  assert.ok(esito.agenti.saltati.length > 0);
  assert.equal(esito.chiedi_a_nicola, true);
  assert.match(esito.motivo, /tetto/);
});

test("con un budget quasi finito non parte niente oltre la riserva", async () => {
  const budget = { total: 1000, remaining: () => 50 };
  const { esito } = await lancia(undefined, ARGS, budget);
  assert.equal(esito.agenti.usati, 0);
  assert.equal(esito.chiedi_a_nicola, true);
});

test("senza schede, repo, radice dell'AD o base non parte: e dice quale comando le prepara", async () => {
  await assert.rejects(() => lancia(undefined, { repo: "s", radice_ad: "a", base: "b" }), /schede-pacchetto\.mjs/);
  await assert.rejects(() => lancia(undefined, { ...ARGS, repo: undefined }), /args\.repo/);
  await assert.rejects(() => lancia(undefined, { ...ARGS, radice_ad: undefined }), /args\.radice_ad/);
  await assert.rejects(() => lancia(undefined, { ...ARGS, base: undefined }), /args\.base/);
  const { chiamate } = await lancia(undefined, { ...ARGS, tipo_costruisce: "squadra-sito", tipo_controlla: "squadra-sito" });
  assert.ok(chiamate.every((c) => c.tipo === "squadra-sito"), "quando il tipo snello nascera', si passa e vale per tutti");
  // I nomi vecchi non si ignorano in silenzio: manderebbero il tipo di default senza che nessuno lo sappia.
  await assert.rejects(() => lancia(undefined, { ...ARGS, tipo: "squadra-sito" }), /tipo_costruisce/);
  await assert.rejects(() => lancia(undefined, { ...ARGS, tipo_controllo: "qa" }), /tipo_controlla/);
  const senza = await lancia();
  assert.ok(!senza.chiamate.some((c) => c.tipo === "squadra-sito"), "senza args.tipo nessun lavoratore chiede un tipo che non esiste");
});

test("una chiave che il piano non ha non conta come chiusa, e un difetto taciuto diventa parziale", async () => {
  const { esito } = await lancia((l) =>
    l === "squadra:components-cart-pay-tsx" ? { ramo: "r", worktree: "w", commit: "c9", chiusi: ["frontend-ux|inventata"], file_toccati: ["components/cart/Pay.tsx"] } : undefined);
  const p = esito.pacchetti.find((x) => x.pacchetto === "components/cart/Pay.tsx");
  assert.deepEqual(p.chiusi, []);
  assert.deepEqual(p.chiavi_sconosciute, ["frontend-ux|inventata"]);
  assert.equal(p.parziali[0].chiave, "frontend-ux|pulsante sparito");
});

// ── i casi che il collaudo del 25/10 (seconda correzione) ha trovato senza una prova rossa ──────

// Tre pacchetti: due sui soldi che il riesame guarda con la STESSA lente, uno altrove.
const TRE = {
  ondata: 3,
  pacchetti: [
    SCHEDE.pacchetti[0],
    { chiave: "lib/stripe/refund.ts", file: ["lib/stripe/refund.ts"], rischio: "soldi", lente: "pagamenti-stripe",
      difetti: [{ chiave: "pagamenti-stripe|rimborso perso", titolo: "Rimborso perso", gravita: "grave" }] },
    SCHEDE.pacchetti[1],
  ],
  lenti_per_file: { ...SCHEDE.lenti_per_file, "lib/stripe/refund.ts": "pagamenti-stripe" },
};
const stato = (esito, chiave) => esito.pacchetti.find((p) => p.pacchetto === chiave).stato;

test("il padrone di un grave nato si trova anche senza la cartella e con i percorsi assoluti del worktree", async () => {
  // «payout.ts:40»: prima nessun pacchetto «conteneva» il file, la correzione non partiva e il ramo dei
  // soldi restava «regge» con un grave confermato aperto.
  const corto = await lancia((l) => (l.startsWith("riesame:pagamenti") ? { regge: false, difetti: [{ ...NATO, dove: "payout.ts:40" }] } : undefined));
  assert.ok(corto.etichette.includes("correzione1:lib-stripe-payout-ts"), corto.etichette.join(" "));
  assert.deepEqual(corto.esito.gravi_aperti, []);
  // La squadra dichiara i file col percorso assoluto del suo worktree: si riportano alla radice del sito.
  const wt = "/srv/sito-ondate/o2-lib-stripe-payout-ts";
  const assoluto = await lancia((l) => {
    if (l === "squadra:lib-stripe-payout-ts") return { ramo: "r", worktree: wt, commit: "c7", chiusi: ["pagamenti-stripe|rimborso doppio"], file_toccati: [wt + "/lib/stripe/payout.ts"] };
    if (l.startsWith("riesame:pagamenti")) return { regge: false, difetti: [NATO] };
    return undefined;
  });
  assert.ok(assoluto.etichette.includes("correzione1:lib-stripe-payout-ts"), assoluto.etichette.join(" "));
  assert.match(assoluto.chiamate.find((c) => c.label === "riesame:pagamenti-stripe").prompt, /diff b0\.\.HEAD -- lib\/stripe\/payout\.ts\n/);
  // E un percorso assoluto dentro il territorio non accende da solo la seconda lente.
  const pay = await lancia((l) =>
    l === "squadra:components-cart-pay-tsx" ? { ramo: "r", worktree: "/w/pay", commit: "c8", chiusi: ["frontend-ux|pulsante sparito"], file_toccati: ["/w/pay/components/cart/Pay.tsx"] } : undefined);
  assert.ok(pay.etichette.includes("collaudoAB:components-cart-pay-tsx") && !pay.etichette.includes("collaudoA:components-cart-pay-tsx"), pay.etichette.join(" "));
});

test("un grave nato senza padrone ferma TUTTI i pacchetti che il suo revisore ha guardato, e solo quelli", async () => {
  const { esito, etichette } = await lancia((l) =>
    l.startsWith("riesame:pagamenti") ? { regge: false, difetti: [{ ...NATO, dove: "lib/stripe/altro.ts:3" }] } : undefined, { ...ARGS, schede: TRE });
  assert.ok(!etichette.some((l) => l.startsWith("correzione")), "senza padrone non si sa a chi mandarlo");
  assert.notEqual(stato(esito, "lib/stripe/payout.ts"), "regge");
  assert.notEqual(stato(esito, "lib/stripe/refund.ts"), "regge");
  assert.equal(stato(esito, "components/cart/Pay.tsx"), "regge", "l'altra lente non l'ha visto: il suo ramo si ricuce");
  assert.equal(esito.gravi_aperti[0].pacchetto, null);
  assert.deepEqual(esito.gravi_aperti[0].fermati, ["lib/stripe/payout.ts", "lib/stripe/refund.ts"]);
  assert.equal(esito.chiedi_a_nicola, true);
});

test("un riesame che non avviene ferma tutti i pacchetti della sua lente, non solo il primo", async () => {
  const { esito } = await lancia((l) => (l === "riesame:pagamenti-stripe" ? new Error("giu'") : undefined), { ...ARGS, schede: TRE });
  assert.notEqual(stato(esito, "lib/stripe/payout.ts"), "regge");
  assert.notEqual(stato(esito, "lib/stripe/refund.ts"), "regge");
  assert.equal(stato(esito, "components/cart/Pay.tsx"), "regge");
});

test("un collaudo che non c'e' stato non e' mai una promozione: caduto o saltato dal tetto, il pacchetto si ferma", async () => {
  const caduto = await lancia((l) => (l === "collaudoB:lib-stripe-payout-ts" ? new Error("giu'") : undefined));
  assert.match(stato(caduto.esito, "lib/stripe/payout.ts"), /collaudo non eseguito/, "una lente su due sui soldi non e' un collaudo");
  assert.ok(!caduto.etichette.includes("riesame:pagamenti-stripe"), "un pacchetto fermo non va al riesame come se reggesse");
  assert.equal(caduto.esito.chiedi_a_nicola, true);
  // Tetto 6, riserva del riesame 2: le due squadre e le due lenti dei soldi passano, la terza lente no.
  const saltato = await lancia(undefined, { ...ARGS, max_agenti: 6 });
  const saltati = saltato.esito.agenti.saltati.filter((l) => l.startsWith("collaudo"));
  assert.ok(saltati.length > 0, "la prova vuole almeno un collaudo saltato: " + saltato.esito.agenti.saltati);
  for (const l of saltati) {
    const p = saltato.esito.pacchetti.find((x) => l.endsWith(":" + slug(x.pacchetto)));
    assert.match(p.stato, /collaudo non eseguito/, l);
  }
  assert.equal(saltato.esito.chiedi_a_nicola, true);
});

test("un grave nato nel collaudo boccia anche con regge:true, arriva al rifacimento con la sua chiave, e il ricollaudo sa cosa verificare", async () => {
  const nato = { titolo: "Lo storno si somma al rimborso", gravita: "grave", dove: "lib/stripe/payout.ts:12", prova: "npx vitest run y", nato_dal_lotto: true };
  let prima = true;
  const { etichette, chiamate, esito } = await lancia((l) => {
    if (l === "collaudoA:lib-stripe-payout-ts" && prima) { prima = false; return { regge: true, difetti: [nato] }; }
    return undefined;
  });
  const rifacimento = chiamate.find((c) => c.label === "rifacimento1:lib-stripe-payout-ts");
  assert.ok(rifacimento, "un grave nato non si lascia passare perche' il collaudatore ha scritto regge:true: " + etichette.join(" "));
  assert.match(rifacimento.prompt, /Lo storno si somma al rimborso/, "la squadra deve sapere cosa correggere");
  // Senza la chiave in JSON la squadra non puo' metterlo fra i chiusi, e il workflow non puo' controllarlo.
  assert.ok(rifacimento.prompt.includes('"chiave":"nato|lib/stripe/payout.ts|lo storno si somma al rimborso"'), "la chiave del grave nato arriva in JSON al rifacimento");
  const ricollaudi = chiamate.filter((c) => c.label === "collaudoA:lib-stripe-payout-ts");
  assert.equal(ricollaudi.length, 2, "si ricollauda con la lente che ha bocciato");
  assert.match(ricollaudi[1].prompt, /Lo storno si somma al rimborso[\s\S]*npx vitest run y/, "il ricollaudo e' un lavoratore nuovo: il prompt gli dice quale grave rilanciare");
  assert.doesNotMatch(ricollaudi[0].prompt, /dichiara chiusi/, "al primo collaudo non c'e' niente da ricontrollare");
  assert.equal(etichette.filter((l) => l === "collaudoB:lib-stripe-payout-ts").length, 1, "la lente B aveva promosso");
  // Qui regge, e per la ragione giusta: il rifacimento di default chiude la chiave, e il ricollaudo regge.
  assert.equal(stato(esito, "lib/stripe/payout.ts"), "regge");
  assert.deepEqual(esito.gravi_aperti, []);
  assert.equal(esito.chiedi_a_nicola, false);
});

// ── il collaudo del 25/10 (quarta correzione): la stessa regola, nel collaudo che viene prima del riesame ──

test("un grave o bloccante nato nel collaudo resta aperto finche' il rifacimento non lo mette fra i chiusi: ferma il ramo, esce in gravi_aperti, chiede a Nicola", async () => {
  // Il caso del collaudo: la lente trova un grave nato con la sua prova rossa, la squadra del rifacimento
  // lo mette nei parziali (e' quello che il prompt le chiede se il fix sta fuori territorio) o lo tace.
  // Prima il ricollaudo — nuovo, senza il grave nel prompt — reggeva: «regge», gravi_aperti vuoto.
  const casi = {
    parziale: (chiave) => ({ chiusi: [], parziali: [{ chiave, perche: "non ci riesco senza toccare refund.ts, fuori territorio" }] }),
    muto: () => ({ chiusi: [] }),
    "chiude altro": () => ({ chiusi: ["nato|lib/stripe/payout.ts|un altro titolo"] }),
  };
  const dove = [
    ["lente A dei soldi, regge:false", "collaudoA:lib-stripe-payout-ts", "lib/stripe/payout.ts", false],
    ["lente A dei soldi, regge:true", "collaudoA:lib-stripe-payout-ts", "lib/stripe/payout.ts", true],
    ["lente unica, nessun rischio", "collaudoAB:components-cart-pay-tsx", "components/cart/Pay.tsx", true],
  ];
  for (const gravita of ["grave", "bloccante"]) {
    for (const [lente, label, pac, regge] of dove) {
      for (const [nome, risposta] of Object.entries(casi)) {
        const caso = gravita + " / " + lente + " / " + nome;
        const nato = { titolo: "Lo storno si somma al rimborso", gravita, dove: pac + ":12", prova: "npx vitest run tests/unit/storno.test.ts", nato_dal_lotto: true };
        let prima = true;
        let chiaveRicevuta = null;
        const { esito, etichette } = await lancia((l, prompt) => {
          if (l === label && prima) { prima = false; return { regge, perche: regge ? undefined : "npx vitest run tests/unit/storno.test.ts rosso", difetti: [nato] }; }
          if (l === "rifacimento1:" + slug(pac)) {
            chiaveRicevuta = [...prompt.matchAll(/"chiave":"(nato\|[^"]+)"/g)].map((m) => m[1])[0] || null;
            return { ramo: "fix/x", worktree: "wt-r", commit: "c-r", file_toccati: [pac], ...risposta(chiaveRicevuta) };
          }
          return undefined;
        });
        assert.ok(etichette.includes("rifacimento1:" + slug(pac)), caso + ": il rifacimento deve partire, o la prova non prova niente");
        assert.ok(chiaveRicevuta, caso + ": la chiave del grave arriva in JSON al rifacimento");
        assert.notEqual(stato(esito, pac), "regge", caso + ": un ramo con un " + gravita + " nato non chiuso non si ricuce");
        assert.deepEqual(esito.gravi_aperti.map((d) => d.titolo), [nato.titolo], caso);
        assert.equal(esito.gravi_aperti[0].pacchetto, pac, caso);
        assert.equal(esito.gravi_aperti[0].gravita, gravita, caso);
        assert.equal(esito.chiedi_a_nicola, true, caso);
        if (nome === "parziale") assert.match(esito.gravi_aperti[0].perche, /non ci riesco/, caso + ": il perche' della squadra arriva a Nicola");
        const altro = SCHEDE.pacchetti.map((p) => p.chiave).find((k) => k !== pac);
        assert.equal(stato(esito, altro), "regge", caso + ": si ferma il ramo del grave, non l'ondata intera");
      }
    }
  }
});

test("un grave del collaudo dichiarato chiuso resta aperto se dopo nessun collaudo regge, e conta una volta sola fra i giri", async () => {
  const nato = { titolo: "Lo storno si somma al rimborso", gravita: "grave", dove: "lib/stripe/payout.ts:12", prova: "npx vitest run y", nato_dal_lotto: true };
  // Il ricollaudo che doveva confermare la chiusura cade: la squadra l'ha dichiarato chiuso, ma nessuno l'ha visto reggere.
  let volte = 0;
  const caduto = await lancia((l) => {
    if (l === "collaudoA:lib-stripe-payout-ts") return volte++ === 0 ? { regge: true, difetti: [nato] } : new Error("giu'");
    return undefined;
  });
  assert.match(stato(caduto.esito, "lib/stripe/payout.ts"), /collaudo non eseguito/);
  assert.deepEqual(caduto.esito.gravi_aperti.map((d) => d.titolo), [nato.titolo]);
  assert.match(caduto.esito.gravi_aperti[0].perche, /dichiara chiuso/);
  // La lente lo ritrova a ogni ricollaudo: due rifacimenti, poi si ferma, e il grave e' UNO in gravi_aperti.
  const ostinato = await lancia((l) => (l === "collaudoA:lib-stripe-payout-ts" ? { regge: true, difetti: [nato] } : undefined));
  assert.equal(ostinato.etichette.filter((l) => l.startsWith("rifacimento") && l.endsWith("payout-ts")).length, 2);
  const secondo = ostinato.chiamate.find((c) => c.label === "rifacimento2:lib-stripe-payout-ts");
  assert.ok(secondo.prompt.includes('"chiave":"nato|lib/stripe/payout.ts|lo storno si somma al rimborso"'), "un grave che il ricollaudo ritrova torna al rifacimento dopo, con la sua chiave");
  assert.match(stato(ostinato.esito, "lib/stripe/payout.ts"), /bocciato 3 volte/);
  assert.deepEqual(ostinato.esito.gravi_aperti.map((d) => d.titolo), [nato.titolo]);
  assert.equal(ostinato.esito.chiedi_a_nicola, true);
});

test("una prova scritta in tests/ non e' fuori territorio, e la lente unica porta tutte e due le domande", async () => {
  const { etichette, chiamate } = await lancia((l) =>
    l === "squadra:components-cart-pay-tsx" ? { ramo: "r", worktree: "w", commit: "c9", chiusi: ["frontend-ux|pulsante sparito"], file_toccati: ["components/cart/Pay.tsx", "tests/unit/pay.test.ts"] } : undefined);
  assert.ok(etichette.includes("collaudoAB:components-cart-pay-tsx") && !etichette.includes("collaudoA:components-cart-pay-tsx"), etichette.join(" "));
  const ab = chiamate.find((c) => c.label === "collaudoAB:components-cart-pay-tsx").prompt;
  assert.match(ab, /Lente A, sa diventare rosso\?/);
  assert.match(ab, /Lente B, nasce rotto\?/);
});

test("il collaudo di una correzione guarda il SUO delta, dal commit di prima", async () => {
  const { chiamate } = await lancia((l) => {
    if (l === "squadra:lib-stripe-payout-ts") return { ramo: "r", worktree: "wt-p", commit: "c-squadra", chiusi: ["pagamenti-stripe|rimborso doppio"], file_toccati: ["lib/stripe/payout.ts"] };
    if (l.startsWith("riesame:pagamenti")) return { regge: false, difetti: [NATO] };
    return undefined;
  });
  const i = chiamate.findIndex((c) => c.label.startsWith("correzione1"));
  const dopo = chiamate.slice(i + 1).filter((c) => c.label.startsWith("collaudo"));
  assert.ok(dopo.length, "la correzione deve essere collaudata");
  for (const c of dopo) {
    assert.match(c.prompt, /diff c-squadra\.\.HEAD/, c.label);
    assert.doesNotMatch(c.prompt, /diff b0\.\.HEAD/, c.label);
    assert.match(c.prompt, /dichiara chiusi[\s\S]*Il rimborso parte due volte/, c.label + ": il collaudo della correzione sa quale grave rilanciare");
  }
});

test("al massimo due rifacimenti per pacchetto, poi si ferma", async () => {
  const { etichette, esito } = await lancia((l) => (l === "collaudoAB:components-cart-pay-tsx" ? { regge: false, perche: "npx vitest run z rosso", difetti: [] } : undefined));
  assert.equal(etichette.filter((l) => l.startsWith("rifacimento") && l.endsWith("pay-tsx")).length, 2);
  assert.equal(etichette.filter((l) => l === "collaudoAB:components-cart-pay-tsx").length, 3);
  assert.match(stato(esito, "components/cart/Pay.tsx"), /bocciato 3 volte/);
});

test("un rifacimento non parte se non c'e' posto anche per il suo ricollaudo", async () => {
  // Un pacchetto solo, tetto 4, riserva del riesame 1: squadra e collaudo ne usano 2, il rifacimento
  // ne vorrebbe 2 (lui e il ricollaudo) e il tetto per le squadre e' 3.
  const solo = { ondata: 4, pacchetti: [SCHEDE.pacchetti[1]], lenti_per_file: SCHEDE.lenti_per_file };
  const { etichette, esito } = await lancia((l) => (l.startsWith("collaudoAB") ? { regge: false, perche: "rosso", difetti: [] } : undefined), { ...ARGS, schede: solo, max_agenti: 4 });
  assert.ok(!etichette.some((l) => l.startsWith("rifacimento")), etichette.join(" "));
  assert.match(stato(esito, "components/cart/Pay.tsx"), /tetto vicino/);
});

test("lo stesso grave visto da due revisori si verifica e si corregge una volta", async () => {
  const { etichette } = await lancia((l) => (l.startsWith("riesame") ? { regge: false, difetti: [NATO] } : undefined));
  assert.equal(etichette.filter((l) => l.startsWith("verifica")).length, 1);
  assert.equal(etichette.filter((l) => l.startsWith("correzione1")).length, 1);
  assert.ok(etichette.includes("correzione1:lib-stripe-payout-ts"), "e va al pacchetto che ha toccato il file");
});

test("se il tetto non lascia correggere, la correzione non parte a meta' e il grave ferma il suo ramo", async () => {
  const solo = { ondata: 5, pacchetti: [SCHEDE.pacchetti[0]], lenti_per_file: SCHEDE.lenti_per_file };
  const { etichette, esito, righe } = await lancia((l) => (l.startsWith("riesame") ? { regge: false, difetti: [{ ...NATO, dove: "payout.ts:40" }] } : undefined), { ...ARGS, schede: solo, max_agenti: 6 });
  assert.ok(righe.includes("tetto: la correzione non parte"), righe.join(" | "));
  assert.ok(!etichette.some((l) => l.startsWith("correzione")), etichette.join(" "));
  assert.notEqual(stato(esito, "lib/stripe/payout.ts"), "regge");
  assert.equal(esito.gravi_aperti[0].pacchetto, "lib/stripe/payout.ts");
  assert.equal(esito.chiedi_a_nicola, true);
});

test("un minore nato nel collaudo della correzione va nel registro, non riapre il pacchetto", async () => {
  const minore = { titolo: "Commento storto", gravita: "minore", dove: "lib/stripe/payout.ts:41", nato_dal_lotto: true };
  let inCorrezione = false;
  const { esito } = await lancia((l) => {
    if (l.startsWith("correzione")) inCorrezione = true;
    if (l.startsWith("riesame:pagamenti")) return { regge: false, difetti: [NATO] };
    if (inCorrezione && l.startsWith("collaudo")) return { regge: true, difetti: [minore] };
    return undefined;
  });
  assert.deepEqual(esito.gravi_aperti, []);
  assert.equal(stato(esito, "lib/stripe/payout.ts"), "regge");
  assert.ok(esito.registro.some((d) => d.titolo === "Commento storto" && /collaudo correzione/.test(d.fonte)), JSON.stringify(esito.registro));
  assert.equal(esito.chiedi_a_nicola, false);
});

test("un revisore che boccia con un solo minore nato boccia senza bersaglio: il pacchetto si ferma", async () => {
  const minore = { titolo: "Nome poco chiaro", gravita: "minore", dove: "lib/stripe/payout.ts:5", nato_dal_lotto: true };
  const { esito } = await lancia((l) => (l === "riesame:pagamenti-stripe" ? { regge: false, perche: "non mi convince", difetti: [minore] } : undefined));
  assert.equal(esito.riesame_non_concluso.length, 1);
  assert.notEqual(stato(esito, "lib/stripe/payout.ts"), "regge");
  assert.ok(esito.registro.some((d) => d.titolo === "Nome poco chiaro"), "il minore resta visibile nel registro");
  assert.equal(esito.chiedi_a_nicola, true);
});

test("un revisore che ha guardato un ramo solo: il grave e' di quel ramo anche se «dove» non cita un file", async () => {
  const { etichette, esito } = await lancia((l) =>
    l.startsWith("riesame:pagamenti") ? { regge: false, difetti: [{ ...NATO, dove: "il calcolo del rimborso, riga 40" }] } : undefined);
  assert.ok(etichette.includes("correzione1:lib-stripe-payout-ts"), etichette.join(" "));
  assert.equal(stato(esito, "components/cart/Pay.tsx"), "regge", "il ramo di un'altra lente non c'entra");
});

test("due rami nella stessa lente: «payout.ts:40» va al suo, e un grave che cita tutti e due li ferma tutti e due", async () => {
  const corto = await lancia((l) => (l.startsWith("riesame:pagamenti") ? { regge: false, difetti: [{ ...NATO, dove: "payout.ts:40" }] } : undefined), { ...ARGS, schede: TRE });
  assert.ok(corto.etichette.includes("correzione1:lib-stripe-payout-ts"), corto.etichette.join(" "));
  assert.ok(!corto.etichette.includes("correzione1:lib-stripe-refund-ts"));
  assert.equal(stato(corto.esito, "lib/stripe/refund.ts"), "regge");
  const ambiguo = await lancia((l) =>
    l.startsWith("riesame:pagamenti") ? { regge: false, difetti: [{ ...NATO, dove: "lib/stripe/payout.ts:40 e lib/stripe/refund.ts:12" }] } : undefined, { ...ARGS, schede: TRE });
  assert.ok(!ambiguo.etichette.some((l) => l.startsWith("correzione")), "un grave di due pacchetti non si da' al primo che capita");
  assert.notEqual(stato(ambiguo.esito, "lib/stripe/payout.ts"), "regge");
  assert.notEqual(stato(ambiguo.esito, "lib/stripe/refund.ts"), "regge");
});

test("un grave nato nel collaudo della correzione torna al SUO pacchetto al giro dopo, anche se «dove» non cita un file", async () => {
  let inCorrezione = false;
  let volte = 0;
  const { etichette } = await lancia((l) => {
    if (l.startsWith("correzione")) inCorrezione = true;
    if (l.startsWith("riesame:pagamenti")) return { regge: false, difetti: [NATO] };
    if (inCorrezione && l.startsWith("collaudo") && volte++ === 0) return { regge: true, difetti: [{ ...NATO, titolo: "Lo storno sbaglia segno", dove: "riga 40 del calcolo" }] };
    return undefined;
  });
  assert.ok(etichette.includes("correzione2:lib-stripe-payout-ts"), etichette.join(" "));
});

// ── il collaudo del 25/10 (terza correzione): il grave nato che la correzione ammette di non chiudere ──

test("un grave o bloccante nato resta aperto finche' la correzione non lo mette fra i chiusi, anche se il suo collaudo regge", async () => {
  // Il caso del collaudo: la squadra della correzione fa quello che il prompt le chiede — mette il grave
  // in parziali col perche' — e il collaudo della correzione regge, perche' guarda un delta che non
  // c'entra. Prima il pacchetto dei soldi usciva «regge», gravi_aperti vuoto e chiedi_a_nicola false.
  const casi = {
    parziale: (chiave) => ({ chiusi: [], parziali: [{ chiave, perche: "non ci riesco senza toccare refund.ts" }] }),
    muto: () => ({ chiusi: [] }),
    "chiude altro": () => ({ chiusi: ["nato|lib/stripe/payout.ts|un altro titolo"] }),
  };
  for (const gravita of ["grave", "bloccante"]) {
    for (const [nome, risposta] of Object.entries(casi)) {
      const nato = { ...NATO, gravita };
      const { esito, etichette } = await lancia((l, prompt) => {
        if (l.startsWith("riesame:pagamenti")) return { regge: false, difetti: [nato] };
        if (l.startsWith("correzione")) {
          const chiave = [...prompt.matchAll(/"chiave":"(nato\|[^"]+)"/g)].map((m) => m[1])[0];
          return { ramo: "fix/x", worktree: "wt-x", commit: "c-" + l, file_toccati: [], ...risposta(chiave) };
        }
        return undefined;
      });
      const caso = gravita + " / " + nome;
      assert.ok(etichette.includes("correzione1:lib-stripe-payout-ts"), caso + ": la correzione deve partire, o la prova non prova niente");
      assert.ok(etichette.slice(etichette.indexOf("correzione1:lib-stripe-payout-ts") + 1).some((l) => l.startsWith("collaudo")), caso + ": e deve essere collaudata");
      assert.notEqual(stato(esito, "lib/stripe/payout.ts"), "regge", caso + ": un ramo con un " + gravita + " nato non chiuso non si ricuce");
      assert.deepEqual(esito.gravi_aperti.map((d) => d.titolo), [NATO.titolo], caso);
      assert.equal(esito.gravi_aperti[0].pacchetto, "lib/stripe/payout.ts", caso);
      assert.equal(esito.gravi_aperti[0].gravita, gravita, caso);
      assert.equal(esito.chiedi_a_nicola, true, caso);
      if (nome === "parziale") assert.match(esito.gravi_aperti[0].perche, /non ci riesco/, caso + ": il perche' della squadra arriva a Nicola");
    }
  }
});

test("il tipo segue i permessi: scrive o muta chi costruisce, legge e basta chi controlla, su ogni ruolo", async () => {
  // Il mansionario di qa tiene il codice del sito in sola lettura e git fuori dalle sue mani: un
  // collaudatore che muta in un worktree, o un verificatore che fa diventare rossa una prova, non puo' essere qa.
  let bocciato = false;
  let inCorrezione = false;
  const scenario = (l) => {
    if (l.startsWith("correzione")) inCorrezione = true;
    if (l === "collaudoAB:components-cart-pay-tsx" && !bocciato) { bocciato = true; return { regge: false, perche: "npx vitest run z rosso", difetti: [] }; }
    if (l.startsWith("riesame:pagamenti") && !inCorrezione) return { regge: false, difetti: [NATO] };
    return undefined;
  };
  const atteso = { squadra: "C", rifacimento1: "C", correzione1: "C", collaudoA: "C", collaudoAB: "C", verifica: "C", collaudoB: "L", riesame: "L" };
  for (const [tipi, C, L] of [[{}, "tech", "qa"], [{ tipo_costruisce: "chi-scrive", tipo_controlla: "chi-legge" }, "chi-scrive", "chi-legge"]]) {
    bocciato = false;
    inCorrezione = false;
    const { chiamate } = await lancia(scenario, { ...ARGS, ...tipi });
    const visti = new Set();
    for (const c of chiamate) {
      const ruolo = c.label.split(":")[0];
      assert.ok(ruolo in atteso, "ruolo che la prova non conosce: " + c.label);
      visti.add(ruolo);
      assert.equal(c.tipo, atteso[ruolo] === "C" ? C : L, c.label + " ha il tipo sbagliato");
    }
    assert.deepEqual([...visti].sort(), Object.keys(atteso).sort(), "la prova deve vedere ogni ruolo, o non prova niente");
    // Il prompt segue il tipo: chi legge non riceve istruzioni per mutare, chi muta si', fuori dal worktree della squadra.
    for (const c of chiamate.filter((x) => /^(collaudoB|riesame):/.test(x.label))) {
      assert.doesNotMatch(c.prompt, /worktree add|muta e prova/, c.label + ": a chi solo legge non si chiede di scrivere");
      assert.match(c.prompt, /Sola lettura/, c.label);
    }
    for (const c of chiamate.filter((x) => /^(collaudoA|collaudoAB|verifica):/.test(x.label))) assert.match(c.prompt, /worktree add --detach/, c.label);
  }
});

test("la prova del sito sta dentro lo strumento Bash: tetto unico < timeout della shell < 600 secondi dichiarati", async () => {
  // Lo strumento Bash di un agente si ferma a 600 secondi al massimo, a 120 se la chiamata non lo
  // dichiara. Prima: tetto 840 e «timeout 900», e la prova moriva senza verdetto.
  const { chiamate } = await lancia((l) => (l.startsWith("riesame:pagamenti") ? { regge: false, difetti: [NATO] } : undefined));
  const conLaProva = chiamate.filter((c) => /prova-sito\.mjs/.test(c.prompt));
  assert.ok(conLaProva.some((c) => c.label.startsWith("squadra")), "la squadra deve ricevere il comando della prova");
  for (const c of conLaProva) {
    assert.doesNotMatch(c.prompt, /timeout 900/, c.label);
    const shell = [...c.prompt.matchAll(/timeout (\d+) node \S*prova-sito\.mjs/g)].map((m) => Number(m[1]));
    assert.ok(shell.length, c.label + ": la prova si lancia dentro un timeout della shell");
    const bash = [...c.prompt.matchAll(/timeout: (\d+)/g)].map((m) => Number(m[1]));
    assert.ok(bash.length, c.label + ": il prompt dichiara il timeout della chiamata allo strumento Bash");
    for (const sec of shell) {
      assert.ok(sec * 1000 > TEMPO_TOTALE_MS, `${c.label}: timeout ${sec} della shell sotto il tetto unico di prova-sito (${TEMPO_TOTALE_MS} ms)`);
      for (const ms of bash) assert.ok(sec * 1000 < ms && ms <= TETTO_BASH_MS, `${c.label}: shell ${sec}s, strumento ${ms} ms, massimo ${TETTO_BASH_MS}`);
    }
  }
});

test("un grave del piano chiuso, che il rifacimento dichiara parziale, resta aperto anche se il ricollaudo regge", async () => {
  // Il caso del collaudo del 25/10: la squadra chiude il grave dei soldi, la lente B boccia, il
  // rifacimento ammette «non ci riesco» e lo mette nei parziali, il ricollaudo regge. Prima
  // unisci() teneva l'unione dei chiusi e il grave usciva chiuso, col parziale cancellato.
  const CHIAVE = "pagamenti-stripe|rimborso doppio";
  let bocciature = 0;
  const { esito, etichette } = await lancia((l) => {
    if (l === "collaudoB:lib-stripe-payout-ts" && bocciature++ === 0) return { regge: false, perche: "il rimborso parte ancora due volte", difetti: [] };
    if (l.startsWith("rifacimento1:lib-stripe-payout-ts"))
      return { ramo: "fix/x", worktree: "wt-r", commit: "c9", chiusi: [], parziali: [{ chiave: CHIAVE, perche: "non ci riesco senza toccare refund.ts" }], file_toccati: ["lib/stripe/payout.ts"] };
    return undefined;
  });
  assert.equal(etichette.filter((l) => l.startsWith("rifacimento1")).length, 1);
  const p = esito.pacchetti.find((x) => x.pacchetto === "lib/stripe/payout.ts");
  assert.ok(!p.chiusi.includes(CHIAVE), "il grave non deve risultare chiuso");
  assert.ok((p.parziali || []).some((x) => x.chiave === CHIAVE), "il grave resta visibile fra i parziali col suo perche'");
});

// ── il riesame del 25/10 (lente cadenza-esecuzione): il riesame saltato in silenzio ──────────────

test("AR-1014 — il riesame guarda SEMPRE il territorio del piano: file_toccati vuoti o parziali non tolgono la rete al pacchetto dei soldi", async () => {
  const CHIAVE = "pagamenti-stripe|rimborso doppio";
  // Vuoti: prima nessun gruppo nasceva da [], nessun revisore guardava i soldi, e il pacchetto usciva
  // «regge» col suo chiuso contato e chiedi_a_nicola:false.
  const vuoti = await lancia((l) => (l === "squadra:lib-stripe-payout-ts" ? { ramo: "r", worktree: "wt-p", commit: "c1", chiusi: [CHIAVE], file_toccati: [] } : undefined));
  const rv = vuoti.chiamate.find((c) => c.label === "riesame:pagamenti-stripe");
  assert.ok(rv, "il pacchetto dei soldi deve avere il suo revisore: " + vuoti.etichette.join(" "));
  assert.match(rv.prompt, /git -C wt-p diff b0\.\.HEAD -- lib\/stripe\/payout\.ts\n/, "il revisore guarda il territorio del piano");
  const p = vuoti.esito.pacchetti.find((x) => x.pacchetto === "lib/stripe/payout.ts");
  assert.deepEqual(p.chiusi, [], "un chiuso senza nessun file toccato non si conta");
  assert.match(p.parziali.find((x) => x.chiave === CHIAVE).perche, /nessun file toccato/, "e torna parziale col perche'");
  assert.equal(vuoti.esito.chiedi_a_nicola, true);
  assert.match(vuoti.esito.motivo, /nessun file toccato \(lib\/stripe\/payout\.ts\)/, "il motivo lo dice, non lo tace");
  // Parziali: la squadra dichiara solo la sua prova. Il revisore guarda anche il file del piano, e i chiusi contano.
  const parziali = await lancia((l) => (l === "squadra:lib-stripe-payout-ts" ? { ramo: "r", worktree: "wt-p", commit: "c1", chiusi: [CHIAVE], file_toccati: ["tests/unit/payout.test.ts"] } : undefined));
  assert.match(parziali.chiamate.find((c) => c.label === "riesame:pagamenti-stripe").prompt, /diff b0\.\.HEAD -- lib\/stripe\/payout\.ts tests\/unit\/payout\.test\.ts\n/);
  assert.deepEqual(parziali.esito.pacchetti.find((x) => x.pacchetto === "lib/stripe/payout.ts").chiusi, [CHIAVE]);
  assert.equal(parziali.esito.chiedi_a_nicola, false);
  // Il padrone di un grave nato si cerca negli stessi file che il revisore ha guardato: con [] dichiarato
  // e due rami nella stessa lente, il grave va al suo pacchetto e non ferma quello accanto.
  const nato = await lancia((l) => {
    if (l === "squadra:lib-stripe-payout-ts") return { ramo: "r", worktree: "wt-p", commit: "c1", chiusi: [CHIAVE], file_toccati: [] };
    if (l.startsWith("riesame:pagamenti")) return { regge: false, difetti: [NATO] };
    return undefined;
  }, { ...ARGS, schede: TRE });
  assert.ok(nato.etichette.includes("correzione1:lib-stripe-payout-ts"), nato.etichette.join(" "));
  assert.equal(stato(nato.esito, "lib/stripe/refund.ts"), "regge");
  // Niente da guardare (ne' piano ne' squadra nominano un file): il riesame non c'e' stato, e non e' un «regge».
  const nudo = { ondata: 6, pacchetti: [{ chiave: "lib/x.ts", file: [], rischio: "nessuno", lente: "qa-flussi", difetti: [{ chiave: "qa-flussi|x", titolo: "x", gravita: "grave" }] }], lenti_per_file: {} };
  const senza = await lancia((l) => (l.startsWith("squadra") ? { ramo: "r", worktree: "wt-x", commit: "c1", chiusi: ["qa-flussi|x"], file_toccati: [] } : undefined), { ...ARGS, schede: nudo });
  assert.match(stato(senza.esito, "lib/x.ts"), /niente da riesaminare/);
  assert.equal(senza.esito.chiedi_a_nicola, true);
});

test("AR-1015 — col budget del motore il posto del riesame resta tenuto da parte mentre lavorano squadre e collaudi", async () => {
  // Il modello comodo (addebito quando l'agente parte); quello scomodo, addebito alla fine, e' piu' sotto.
  // Ogni lavoratore costa 10 unita' di budget su 100, riserva 10. La lente unica del carrello boccia
  // sempre: prima i due rifacimenti e i ricollaudi mangiavano il budget, e il riesame dei soldi
  // trovava 10 su 10 e saltava, col motivo «il revisore non ha risposto».
  let speso = 0;
  const budget = { total: 100, remaining: () => 100 - speso };
  const { esito, etichette } = await lancia((l) => {
    speso += 10;
    return l === "collaudoAB:components-cart-pay-tsx" ? { regge: false, perche: "npx vitest run z rosso", difetti: [] } : undefined;
  }, ARGS, budget);
  assert.ok(etichette.includes("riesame:pagamenti-stripe"), "il riesame dei soldi deve partire: " + etichette.join(" "));
  assert.ok(!esito.agenti.saltati.some((l) => l.startsWith("riesame")), "riesame saltato: " + esito.agenti.saltati);
  assert.equal(stato(esito, "lib/stripe/payout.ts"), "regge");
  assert.match(stato(esito, "components/cart/Pay.tsx"), /budget vicino[\s\S]*precedenza/, "a fermarsi e' il rifacimento, e dice che e' il budget");
  assert.ok(100 - speso >= 10, "la riserva del motore resta intatta: restano " + (100 - speso));
});

test("AR-1015 — il motivo di un riesame mancato dice quale freno: budget, tetto degli agenti o revisore caduto", async () => {
  // Budget: il motore scende di colpo sotto la riserva dopo squadre e collaudi.
  let n = 0;
  const budget = { total: 100, remaining: () => (++n <= 6 ? 50 : 5) };
  const b = await lancia(undefined, ARGS, budget);
  assert.ok(b.esito.agenti.saltati.some((l) => l.startsWith("riesame")), "la prova vuole un riesame saltato dal budget: " + b.esito.agenti.saltati);
  for (const s of b.esito.riesame_non_concluso) assert.match(s.perche, /budget/, s.lente);
  assert.doesNotMatch(b.esito.motivo, /non ha risposto|tetto/, "un budget finito non e' un revisore muto ne' un tetto");
  assert.match(b.esito.motivo, /budget del motore finito/);
  // Tetto: un pacchetto con due file in due lenti, tetto 3, riserva del riesame 1: il secondo revisore non c'entra.
  const due = { ondata: 7, pacchetti: [{ chiave: "components/cart/Pay.tsx", file: ["components/cart/Pay.tsx", "components/cart/Riga.tsx"], rischio: "nessuno", lente: "frontend-ux", difetti: [{ chiave: "frontend-ux|pulsante sparito", titolo: "Pulsante sparito", gravita: "grave" }] }],
    lenti_per_file: { "components/cart/Pay.tsx": "frontend-ux", "components/cart/Riga.tsx": "design-system" } };
  const t = await lancia(undefined, { ...ARGS, schede: due, max_agenti: 3 });
  assert.equal(t.esito.riesame_non_concluso.length, 1, JSON.stringify(t.esito.riesame_non_concluso));
  assert.match(t.esito.riesame_non_concluso[0].perche, /tetto degli agenti/);
  assert.match(t.esito.motivo, /tetto degli agenti raggiunto/);
  assert.doesNotMatch(t.esito.motivo, /budget|non ha risposto/);
  // Caduto: il revisore e' partito ed e' caduto.
  const c = await lancia((l) => (l === "riesame:pagamenti-stripe" ? new Error("rete caduta") : undefined));
  assert.match(c.esito.riesame_non_concluso[0].perche, /caduto/);
  assert.doesNotMatch(c.esito.motivo, /budget|tetto/);
});

// ── il collaudo del 25/10 (rifacimento): il posto del riesame sul budget che scende MENTRE lavorano ──

const pk = (chiave, rischio, lente) => ({ chiave, file: [chiave], rischio, lente, difetti: [{ chiave: lente + "|" + chiave, titolo: "d " + chiave, gravita: "grave" }] });
// La misura di un'ondata vera: uno dei soldi che regge e quattro del carrello che la lente unica boccia sempre.
const CINQUE = { ondata: 3, pacchetti: [pk("lib/stripe/payout.ts", "soldi", "pagamenti-stripe"), ...["a", "b", "c", "d"].map((x) => pk("components/" + x + ".tsx", "nessuno", "frontend-ux"))],
  lenti_per_file: { "lib/stripe/payout.ts": "pagamenti-stripe" } };
// Quattro pacchetti dei soldi in quattro lenti (il riesame usa tutti e quattro i posti) e uno del carrello bocciato.
const QUATTRO = { ondata: 3, pacchetti: [...[1, 2, 3, 4].map((i) => pk("lib/l" + i + "/x.ts", "soldi", "lente" + i)), pk("components/z.tsx", "nessuno", "frontend-ux")],
  lenti_per_file: Object.fromEntries([1, 2, 3, 4].map((i) => ["lib/l" + i + "/x.ts", "lente" + i])) };
const bocciaIlCarrello = (l) => (/^collaudoAB:components/.test(l) ? { regge: false, perche: "npx vitest run z rosso", difetti: [] } : undefined);
const quantiReggono = (esito) => esito.pacchetti.filter((p) => p.stato === "regge").length;

test("AR-1015 — col budget che scende mentre gli agenti lavorano il riesame non salta mai, e la riserva del motore resta intatta", async () => {
  // Prima, col costo addebitato alla fine: a 130, 170, 200, 210 e 300 il riesame dei soldi era l'UNICO
  // passo saltato, dopo otto rifacimenti facoltativi partiti. budget.remaining() non contava chi era in
  // corso, la media divideva per i partiti (chi non aveva pagato contava zero) e il «-1» lasciava a chi
  // chiamava un posto della riserva. Si scandisce il budget, perche' il guasto stava a budget sparsi.
  for (const modo of ["fine", "meta"]) {
    for (let totale = 100; totale <= 320; totale += 10) {
      const m = aGettoni(modo, totale);
      const { esito, etichette } = await lancia(bocciaIlCarrello, { ...ARGS, schede: CINQUE }, m.budget, m);
      const dove = modo + " " + totale + ": ";
      assert.ok(!esito.agenti.saltati.some((l) => l.startsWith("riesame")), dove + "riesame saltato · " + esito.agenti.saltati + " · partiti " + etichette.filter((l) => l.startsWith("rifacimento")));
      assert.ok(m.minimo() >= Math.round(totale * 0.1), dove + "riserva del motore mangiata: il budget e' sceso a " + m.minimo());
      if (totale >= 150) assert.equal(stato(esito, "lib/stripe/payout.ts"), "regge", dove + "col budget che basta il pacchetto dei soldi arriva in fondo");
    }
  }
  // Quattro revisori: il posto tenuto da parte e' di quattro, e nessuno di loro scava nella riserva del motore.
  for (let totale = 100; totale <= 260; totale += 10) {
    const m = aGettoni("fine", totale);
    const { esito } = await lancia(bocciaIlCarrello, { ...ARGS, schede: QUATTRO }, m.budget, m);
    assert.ok(!esito.agenti.saltati.some((l) => l.startsWith("riesame")), totale + ": riesame saltato · " + esito.agenti.saltati);
    assert.ok(m.minimo() >= Math.round(totale * 0.1), totale + ": riserva del motore mangiata, il budget e' sceso a " + m.minimo());
    if (totale >= 210) assert.equal(quantiReggono(esito), 4, totale + ": i quattro dei soldi arrivano in fondo");
  }
});

test("prima che un lavoratore finisca la sola stima del costo e' la quota del tetto: la prima ondata non scava nella riserva", async () => {
  // Totale 450 su 45 agenti: 10 a lavoratore. Il motore ne ha gia' spesi tanti: ne restano 90, la riserva
  // e' 45, e sopra ci sta il posto del riesame (quattro revisori, 40) e nessuna squadra intera in piu'.
  // Nessuno ha ancora finito, quindi non c'e' una media: senza la quota (o con meta' quota) il costo
  // stimato e' troppo basso, partono le cinque squadre insieme e il budget scende a 40, sotto la riserva,
  // per un lavoro che nessuno potra' collaudare.
  const m = aGettoni("fine", 450, { iniziale: 90 });
  const { esito } = await lancia(bocciaIlCarrello, { ...ARGS, schede: CINQUE }, m.budget, m);
  assert.ok(m.minimo() >= 45, "riserva del motore mangiata: il budget e' sceso a " + m.minimo());
  assert.equal(esito.chiedi_a_nicola, true);
  assert.match(esito.motivo, /budget del motore finito/);
});

test("col budget addebitato quando l'agente parte, un no del budget con altri in corso aspetta il conto esatto", async () => {
  // Qui la stima prudente sbaglia per eccesso: chi e' in corso ha gia' pagato, ma conta come se non avesse
  // pagato niente. Se il no fosse subito definitivo, il collaudo dei soldi non partirebbe mai a 200 di budget.
  for (const modo of ["avvio", "meta"]) {
    const m = aGettoni(modo, 200);
    const { esito, etichette } = await lancia(bocciaIlCarrello, { ...ARGS, schede: CINQUE }, m.budget, m);
    assert.equal(stato(esito, "lib/stripe/payout.ts"), "regge", modo + ": " + etichette.join(" "));
    assert.ok(etichette.includes("riesame:pagamenti-stripe"), modo);
    assert.ok(m.minimo() >= 20, modo + ": riserva del motore mangiata, il budget e' sceso a " + m.minimo());
  }
});

test("AR-1014 — la squadra dei soldi dichiara un file di codice ma non quello del piano: il riesame guarda lo stesso il file del piano", async () => {
  // La variante scomoda che il collaudo del 25/10 ha trovato scoperta (il suo mutante A4): il territorio
  // del piano saltato appena la squadra dichiara almeno un file di codice suo.
  const CHIAVE = "pagamenti-stripe|rimborso doppio";
  const { chiamate, etichette } = await lancia((l) => (l === "squadra:lib-stripe-payout-ts" ? { ramo: "r", worktree: "wt-p", commit: "c1", chiusi: [CHIAVE], file_toccati: ["lib/stripe/helper.ts"] } : undefined));
  const rv = chiamate.find((c) => c.label === "riesame:pagamenti-stripe");
  assert.ok(rv, "il pacchetto dei soldi deve avere il suo revisore: " + etichette.join(" "));
  const riga = rv.prompt.split("\n").find((r) => r.includes("git -C wt-p diff"));
  assert.ok(riga && riga.includes("lib/stripe/payout.ts"), "il revisore guarda il file del piano anche se la squadra non lo nomina: " + riga);
  assert.ok(riga.includes("lib/stripe/helper.ts"), "e anche il file che la squadra ha dichiarato");
});

test("AR-1027 — la regola del collaudo e' UNA: arriva uguale a ogni collaudo, a ogni revisore e a ogni verificatore", async () => {
  // Nicola, 28/10, «ok 216»: si boccia per il sito, non per la prova. Il motore finto non sa cosa decide
  // un lavoratore vero: qui si prova che la stessa regola arriva a OGNI collaudo (primo, ricollaudo,
  // collaudo della correzione), con la sola differenza fra chi muta e chi legge e basta. Il collaudo del
  // 28/10 (run wf_a499c8b8-08c) aveva trovato una frase «questo e' un RICOLLAUDO» che arrivava anche al
  // primo collaudo di una correzione e alla lente B, e le diceva di chiamare minore un grave vero.
  let bocciatoPay = false;
  let bocciatoB = false;
  let inCorrezione = false;
  const scenario = (l) => {
    if (l.startsWith("correzione")) inCorrezione = true;
    if (l === "collaudoAB:components-cart-pay-tsx" && !bocciatoPay) { bocciatoPay = true; return { regge: false, boccia_per: "sito", perche: "npx vitest run z rosso", difetti: [] }; }
    if (l === "collaudoB:lib-stripe-payout-ts" && !bocciatoB) { bocciatoB = true; return { regge: false, boccia_per: "sito", perche: "npx vitest run tests/unit/cod.test.ts rosso", difetti: [] }; }
    if (l.startsWith("riesame:pagamenti") && !inCorrezione) return { regge: false, boccia_per: "sito", difetti: [NATO] };
    return undefined;
  };
  const { chiamate } = await lancia(scenario);
  const collaudi = chiamate.filter((c) => /^collaudo/.test(c.label));
  const revisori = chiamate.filter((c) => /^riesame:/.test(c.label));
  const verificatori = chiamate.filter((c) => /^verifica:/.test(c.label));
  const iCorr = chiamate.findIndex((c) => c.label.startsWith("correzione"));
  assert.ok(iCorr > 0 && collaudi.length >= 5 && revisori.length >= 1 && verificatori.length >= 1, "la prova deve vedere collaudi, ricollaudi, correzione, revisori e verificatori: " + chiamate.map((c) => c.label).join(" "));
  const muta = (c) => !/^collaudoB:/.test(c.label);
  for (const c of collaudi) {
    assert.match(c.prompt, /COME DECIDI \(una regola sola, uguale in ogni collaudo; il motore legge boccia_per\)\. Si boccia per il sito, non per la prova\./, c.label + ": la regola unica manca");
    assert.match(c.prompt, /boccia_per «sito» se un comando rosso sul codice di oggi del ramo, senza mutarlo/, c.label + ": «il sito sbaglia» va mostrato sul codice di oggi");
    assert.match(c.prompt, /nato_dal_lotto:true se non c'e' sul commit b0, la base dell'ondata/, c.label + ": il nato si misura sulla base dell'ondata, non sul solo delta della correzione");
    assert.match(c.prompt, /Grave o bloccante solo se il sito si comporta male; un buco nelle prove su un sito che fa giusto e' sempre minore\./, c.label + ": la riga finale della gravita' manca");
    assert.doesNotMatch(c.prompt, /RICOLLAUDO|variante NUOVA/, c.label + ": non c'e' una seconda regola per il ricollaudo");
    if (muta(c)) {
      assert.match(c.prompt, /boccia_per «difetto_rimesso» se un difetto dichiarato chiuso, rimesso com'e' scritto nella sua scheda, lascia verdi le prove della squadra/, c.label + ": il difetto chiuso rimesso resta un motivo per bocciare");
      assert.match(c.prompt, /una condizione in piu' \(solo sopra una cifra, solo con un dato, solo da un negozio in poi\) fa una variante/, c.label + ": «com'e' scritto» va detto");
      assert.match(c.prompt, /Una variante scomoda si prova prima sul codice di oggi, SENZA mutarlo: rossa li' vuol dire «sito»/, c.label + ": «il sito fa giusto» va provato, non supposto");
      assert.match(c.prompt, /Va in difetti come minore, con in prova il comando che la uccide/, c.label + ": il buco nelle prove e' minore");
      assert.match(c.prompt, /boccia_per «variante», che il motore tratta come regge solo se in perche c'e' quel comando/, c.label + ": l'uscita «variante» e il suo prezzo");
      assert.match(c.prompt, /prima rimettilo COM'E' SCRITTO nella scheda \(la mutazione ovvia\)/, c.label + ": la lente A rimette prima il difetto com'e' scritto");
      assert.deepEqual(c.schema.properties.boccia_per.enum, ["nessuno", "sito", "difetto_rimesso", "motivo_aperto", "variante"], c.label + ": chi muta ha le cinque cause");
    } else {
      assert.match(c.prompt, /Tu non muti\. Se leggendo vedi che le prove non coprono un caso, e in quel caso il codice di oggi fa giusto, e' un buco nelle prove/, c.label + ": la lente B ha la sua riga");
      assert.match(c.prompt, /o non sai dire se fa giusto: regge:false con boccia_per «sito»/, c.label + ": nel dubbio, per la lente B, e' il sito");
      assert.doesNotMatch(c.prompt, /boccia_per «variante»|difetto_rimesso|rimettilo com'e' descritto/, c.label + ": alla lente B non si chiede una mutazione");
      assert.deepEqual(c.schema.properties.boccia_per.enum, ["nessuno", "sito", "motivo_aperto"], c.label + ": la lente B non ha «variante» ne' «difetto_rimesso», che si provano solo mutando");
    }
    assert.deepEqual(c.schema.required, ["regge", "boccia_per", "difetti"], c.label + ": la causa e' obbligatoria");
  }
  // Il blocco COME DECIDI e' lo stesso, carattere per carattere, in tutti i collaudi dello stesso tipo.
  const blocco = (c) => c.prompt.slice(c.prompt.indexOf("COME DECIDI (una regola sola"), c.prompt.indexOf("SOBRIETA'"));
  for (const tipo of [true, false]) assert.equal(new Set(collaudi.filter((c) => muta(c) === tipo).map(blocco)).size, 1, (tipo ? "chi muta" : "la lente B") + ": COME DECIDI cambia da un collaudo all'altro");
  // Il ricollaudo ha in piu' solo le righe dei motivi e dei gravi: nessuna seconda regola nascosta.
  // (Il collaudo di una correzione guarda il SUO delta: «diff <commit di prima>..HEAD» e' l'unica altra differenza ammessa.)
  const righe = (c) => c.prompt.replace(/\bc\d+\b/g, "C").replace(/diff \S+\.\.HEAD/g, "diff X..HEAD").split("\n").filter((r) => !/^(La volta prima il collaudo|Gravi nati che la squadra|Se il comando di un grave nomina|Nota della squadra|\[\{|Chiusi dichiarati)/.test(r));
  for (const nome of ["collaudoAB:components-cart-pay-tsx", "collaudoB:lib-stripe-payout-ts", "collaudoA:lib-stripe-payout-ts"]) {
    const giri = collaudi.filter((c) => c.label === nome);
    assert.ok(giri.length >= 2, nome + ": serve un collaudo e un collaudo dopo (ricollaudo o correzione): " + giri.length);
    for (const g of giri.slice(1)) assert.deepEqual(righe(g), righe(giri[0]), nome + ": un collaudo dopo il primo ha una riga di regola che il primo non ha");
  }
  const dopoCorr = chiamate.slice(iCorr).filter((c) => /^collaudo/.test(c.label));
  assert.ok(dopoCorr.length >= 2, "serve il collaudo della correzione, con le sue due lenti");
  for (const c of dopoCorr) {
    if (muta(c)) assert.match(c.prompt, /rimettilo com'e' descritto e verifica che una prova della squadra diventi ROSSA/, c.label + ": la cura di un grave confermato si prova rimettendolo");
    else assert.match(c.prompt, /rilancia il comando di ognuno sul codice di oggi, dove deve passare/, c.label + ": la lente B rilancia e basta");
  }
  const ricPay = collaudi.filter((c) => c.label === "collaudoAB:components-cart-pay-tsx").at(-1);
  assert.match(ricPay.prompt, /\[sito\] npx vitest run z rosso[^\n]*boccia_per «motivo_aperto»/, "il ricollaudo riceve i motivi con la loro causa");
  for (const r of revisori) {
    assert.match(r.prompt, /buco nelle prove su un codice che si comporta giusto e' MINORE/, r.label + ": il riesame deve conoscere la regola");
    assert.match(r.prompt, /se leggendo il diff non sai dire che il sito oggi fa giusto in quel caso, non chiamarlo buco nelle prove: mettilo grave con la sua prova, e decide il verificatore/, r.label + ": nel dubbio decide chi lancia la prova");
    assert.deepEqual(r.schema.properties.boccia_per.enum, ["nessuno", "sito"], r.label + ": il riesame non ha «variante»");
  }
  for (const v of verificatori) {
    assert.match(v.prompt, /Prima di dire solo_prova, scrivi e lancia sul ramo, senza mutare niente, la prova del comportamento giusto/, v.label + ": il verificatore prova il codice di oggi prima di dire «solo una prova»");
    assert.match(v.prompt, /reale:false e preesistente:true/, v.label + ": il verificatore sa dire «c'era gia'»");
    assert.ok(v.schema.properties.solo_prova && v.schema.properties.preesistente, v.label + ": lo schema ha solo_prova e preesistente");
  }
});

test("AR-1027 — una variante su un sito che fa giusto non ferma il pacchetto: diventa un minore nel registro", async () => {
  // Il caso dell'email del quinto giro: «passa tu dal negozio a prenderla» resta verde con le prove della
  // squadra, ma il sito di oggi non lo scrive. Il motore legge boccia_per: nessun rifacimento, pacchetto
  // «regge», e il buco nelle prove nel registro col comando che lo uccide.
  const PERCHE = "npx vitest run tests/unit/email.test.ts: verde sul codice di oggi, rosso sul mutante «passa tu dal negozio»";
  const { esito, etichette } = await lancia((l) => (l === "collaudoAB:components-cart-pay-tsx" ? { regge: false, boccia_per: "variante", perche: PERCHE, difetti: [] } : undefined));
  assert.ok(!etichette.some((l) => l.startsWith("rifacimento")), "una variante non fa partire un rifacimento: " + etichette.join(" "));
  const pay = esito.pacchetti.find((p) => p.pacchetto === "components/cart/Pay.tsx");
  assert.equal(pay.stato, "regge");
  const voce = esito.registro.find((d) => d.prova === PERCHE);
  assert.ok(voce, "il buco nelle prove deve finire nel registro: " + JSON.stringify(esito.registro));
  assert.equal(voce.gravita, "minore");
  assert.equal(esito.chiedi_a_nicola, false);
  // Se la lente ha gia' scritto lo stesso minore fra i difetti, il registro non lo raddoppia.
  const MINORE = { titolo: "La prova non vede «passa tu dal negozio»", gravita: "minore", dove: "components/cart/Pay.tsx:3", prova: PERCHE, nato_dal_lotto: true };
  const due = await lancia((l) => (l === "collaudoAB:components-cart-pay-tsx" ? { regge: false, boccia_per: "variante", perche: PERCHE, difetti: [MINORE] } : undefined));
  assert.equal(due.esito.registro.filter((d) => d.prova === PERCHE).length, 1, "un minore solo: " + JSON.stringify(due.esito.registro));
  // Un minore che non c'entra non fa sparire la variante (ricollaudo del 28/10).
  const ALTRO = { titolo: "Etichetta storta", gravita: "minore", dove: "components/cart/Pay.tsx:9", prova: "si vede a occhio", nato_dal_lotto: true };
  const tre = await lancia((l) => (l === "collaudoAB:components-cart-pay-tsx" ? { regge: false, boccia_per: "variante", perche: PERCHE, difetti: [ALTRO] } : undefined));
  assert.ok(tre.esito.registro.some((d) => d.prova === PERCHE), "la variante resta nel registro accanto all'altro minore: " + JSON.stringify(tre.esito.registro));
});

test("AR-1027 — «variante» vale solo da chi muta e col comando: dalla lente B, o senza comando, boccia", async () => {
  // Il ricollaudo del 28/10 (run wf_040a3d61-2de): la lente B legge il pulsante «Rimborsa» che rimborsa
  // due volte, non puo' scriverne la prova, e sceglie «variante»: il pacchetto dei soldi usciva «regge».
  // Il perche' porta un comando: cosi' a fermarla e' solo la lente che parla, non la mancanza del comando.
  const PANNELLO = "npx vitest run tests/unit/pannello.test.ts: il pulsante Rimborsa chiama rimborsa() senza id evento, due tocchi due rimborsi";
  let fattoB = false;
  const b = await lancia((l) => (l === "collaudoB:lib-stripe-payout-ts" && !fattoB ? ((fattoB = true), { regge: false, boccia_per: "variante", perche: PANNELLO, difetti: [] }) : undefined));
  assert.ok(b.etichette.includes("rifacimento1:lib-stripe-payout-ts"), "un regge:false della lente B boccia sempre: " + b.etichette.join(" "));
  assert.ok(!b.esito.registro.some((d) => d.prova === PANNELLO), "e non diventa un minore nel registro");
  let fattoA = false;
  const a = await lancia((l) => (l === "collaudoA:lib-stripe-payout-ts" && !fattoA ? ((fattoA = true), { regge: false, boccia_per: "variante", perche: "una variante resta verde", difetti: [] }) : undefined));
  assert.ok(a.etichette.includes("rifacimento1:lib-stripe-payout-ts"), "una «variante» senza comando boccia: " + a.etichette.join(" "));
  // Nel collaudo della correzione: la «variante» della lente B non chiude il grave dei soldi.
  let inCorr = false;
  const c = await lancia((l) => {
    if (l.startsWith("correzione")) inCorr = true;
    if (l.startsWith("riesame:pagamenti") && !inCorr) return { regge: false, boccia_per: "sito", difetti: [NATO] };
    if (inCorr && l === "collaudoB:lib-stripe-payout-ts") return { regge: false, boccia_per: "variante", perche: PANNELLO, difetti: [] };
    return undefined;
  });
  assert.notEqual(c.esito.pacchetti.find((p) => p.pacchetto === "lib/stripe/payout.ts").stato, "regge", "il pacchetto dei soldi non esce «regge»");
  assert.ok(!c.esito.registro.some((d) => d.prova === PANNELLO), "e il doppio rimborso non finisce nel registro come buco nelle prove");
  assert.equal(c.esito.chiedi_a_nicola, true);
});

test("AR-1027 — bocciano ancora: «sito», «difetto_rimesso», «motivo_aperto», un regge:false senza causa o con «nessuno», un grave nato, e una causa che boccia anche con regge:true", async () => {
  for (const [nome, risposta] of [
    ["sito", { regge: false, boccia_per: "sito", perche: "npx vitest run z: rosso sul codice di oggi", difetti: [] }],
    ["difetto_rimesso", { regge: false, boccia_per: "difetto_rimesso", perche: "rimesso com'e' scritto, le prove restano verdi", difetti: [] }],
    ["motivo_aperto", { regge: false, boccia_per: "motivo_aperto", perche: "il motivo di prima resta", difetti: [] }],
    ["senza causa", { regge: false, perche: "npx vitest run z rosso", difetti: [] }],
    ["nessuno", { regge: false, boccia_per: "nessuno", perche: "npx vitest run z rosso", difetti: [] }],
    ["grave nato con regge:true", { regge: true, boccia_per: "nessuno", difetti: [{ titolo: "Il pulsante paga due volte", gravita: "grave", dove: "components/cart/Pay.tsx:9", prova: "npx vitest run y", nato_dal_lotto: true }] }],
    ["regge:true ma «sito»", { regge: true, boccia_per: "sito", perche: "npx vitest run tests/unit/zona.test.ts: ROSSO sul codice di oggi", difetti: [] }],
    ["regge:true ma «difetto_rimesso»", { regge: true, boccia_per: "difetto_rimesso", perche: "rimesso, verde", difetti: [] }],
    ["regge:true ma «motivo_aperto»", { regge: true, boccia_per: "motivo_aperto", perche: "il motivo di prima resta", difetti: [] }],
  ]) {
    let fatto = false;
    const { etichette } = await lancia((l) => (l === "collaudoAB:components-cart-pay-tsx" && !fatto ? ((fatto = true), risposta) : undefined));
    assert.ok(etichette.includes("rifacimento1:components-cart-pay-tsx"), nome + ": deve bocciare e far partire il rifacimento: " + etichette.join(" "));
  }
});

test("AR-1027 — un grave trovato dalla sola lente B si ricollauda anche con la lente A, che lo rimette", async () => {
  let fatto = false;
  const GRAVE_B = { titolo: "Il rimborso del pannello parte due volte", gravita: "grave", dove: "lib/stripe/payout.ts:52", prova: "npx vitest run tests/unit/pannello.test.ts", nato_dal_lotto: true };
  const { etichette, chiamate } = await lancia((l) => (l === "collaudoB:lib-stripe-payout-ts" && !fatto ? ((fatto = true), { regge: false, boccia_per: "sito", perche: GRAVE_B.prova, difetti: [GRAVE_B] }) : undefined));
  const iRif = etichette.indexOf("rifacimento1:lib-stripe-payout-ts");
  assert.ok(iRif > 0, etichette.join(" "));
  const dopo = chiamate.slice(iRif + 1).filter((c) => c.label.startsWith("collaudo")).map((c) => c.label);
  assert.ok(dopo.includes("collaudoA:lib-stripe-payout-ts") && dopo.includes("collaudoB:lib-stripe-payout-ts"), "il ricollaudo prende anche chi muta: " + dopo.join(" "));
  // Se ha bocciato la sola B senza un grave da rimettere, si ricollauda solo con B (regola ②).
  let solo = false;
  const due = await lancia((l) => (l === "collaudoB:lib-stripe-payout-ts" && !solo ? ((solo = true), { regge: false, boccia_per: "sito", perche: "npx vitest run tests/unit/cod.test.ts rosso", difetti: [] }) : undefined));
  const i2 = due.etichette.indexOf("rifacimento1:lib-stripe-payout-ts");
  assert.deepEqual(due.chiamate.slice(i2 + 1).filter((c) => c.label.startsWith("collaudo")).map((c) => c.label), ["collaudoB:lib-stripe-payout-ts"]);
});

test("AR-1027 — nel collaudo di una correzione una variante non diventa un grave da correggere", async () => {
  let inCorrezione = false;
  const PERCHE = "npx vitest run tests/unit/payout.test.ts: verde sul codice di oggi, rosso sul mutante del pulsante";
  const { esito, etichette } = await lancia((l) => {
    if (l.startsWith("correzione")) inCorrezione = true;
    if (l.startsWith("riesame:pagamenti") && !inCorrezione) return { regge: false, boccia_per: "sito", difetti: [NATO] };
    if (inCorrezione && l === "collaudoA:lib-stripe-payout-ts") return { regge: false, boccia_per: "variante", perche: PERCHE, difetti: [] };
    return undefined;
  });
  assert.equal(etichette.filter((l) => l.startsWith("correzione")).length, 1, "un giro di correzione solo: la variante non apre un secondo giro (" + etichette.join(" ") + ")");
  assert.deepEqual(esito.gravi_aperti, []);
  assert.ok(esito.registro.some((d) => d.prova === PERCHE && d.gravita === "minore"), "la variante va nel registro: " + JSON.stringify(esito.registro));
  assert.equal(esito.pacchetti.find((p) => p.pacchetto === "lib/stripe/payout.ts").stato, "regge");
});

test("AR-1027 — il verificatore: «solo una prova» entra come minore col suo comando, «c'era gia'» entra come preesistente, il falso allarme no", async () => {
  const COMANDO = "npx vitest run tests/unit/doppio.test.ts: verde sul ramo";
  const giro = (risposta) => lancia((l) => {
    if (l.startsWith("riesame:pagamenti")) return { regge: false, boccia_per: "sito", difetti: [NATO] };
    if (l.startsWith("verifica")) return risposta;
    return undefined;
  });
  const uno = await giro({ reale: false, solo_prova: true, perche: COMANDO });
  assert.ok(!uno.etichette.some((l) => l.startsWith("correzione")), "niente correzione per un buco nelle prove");
  assert.ok(uno.esito.smontati.some((d) => d.titolo === NATO.titolo && d.solo_prova), "resta fra gli smontati, segnato");
  const voce = uno.esito.registro.find((d) => d.titolo === NATO.titolo);
  assert.ok(voce && voce.gravita === "minore" && voce.prova === COMANDO, "e nel registro come minore col comando del verificatore: " + JSON.stringify(uno.esito.registro));
  const due = await giro({ reale: false, preesistente: true, perche: "rossa sul ramo e sul commit b0" });
  const vecchio = due.esito.registro.find((d) => d.titolo === NATO.titolo);
  assert.ok(vecchio && vecchio.gravita === "grave" && vecchio.nato_dal_lotto === false, "un difetto vero che c'era gia' va nel registro con la sua gravita': " + JSON.stringify(due.esito.registro));
  const tre = await giro({ reale: false, perche: "la prova e' verde sul ramo: il difetto non c'e'" });
  assert.ok(!tre.esito.registro.some((d) => d.titolo === NATO.titolo), "un falso allarme non entra nel registro");
});

// Il secondo ricollaudo del 28/10 (run wf_258deb23-0a8) ha retto, con sette minori. Queste prove tengono le
// sue cure: le aveva scritte rosse sul motore di prima e verdi con la cura (R1-R6), piu' le due rotture che
// lasciava verdi (il titolo della variante, la scheda dei chiusi) e la variante detta con regge:true.
const ARGS_VERI = { schede: SCHEDE, repo: "/home/user/mycity", radice_ad: "/home/user/ad-mycity", base: "6ae86ca5" };
const una = (label, risposta) => { let fatto = false; return (l) => (l === label && !fatto ? ((fatto = true), risposta) : undefined); };
const statoDi = (esito, k) => esito.pacchetti.find((p) => p.pacchetto === k).stato;
const G_PANNELLO = { titolo: "Il rimborso del pannello parte due volte", gravita: "grave", dove: "lib/stripe/payout.ts:52", prova: "npx vitest run tests/unit/pannello.test.ts", nato_dal_lotto: true };

test("AR-1027 R1 — «variante» col comando solo in un minore che non c'entra boccia: il comando della variante va nel perche'", async () => {
  const ALTRO = { titolo: "Etichetta storta nel riepilogo", gravita: "minore", dove: "lib/stripe/payout.ts:3", prova: "npx vitest run tests/unit/etichetta.test.ts", nato_dal_lotto: true };
  const { etichette } = await lancia(una("collaudoA:lib-stripe-payout-ts", { regge: false, boccia_per: "variante", perche: "il webhook ripetuto con importo diverso resta verde", difetti: [ALTRO] }));
  assert.ok(etichette.includes("rifacimento1:lib-stripe-payout-ts"), etichette.join(" "));
});

test("AR-1027 R2 — coi percorsi veri, una variante e un minore lanciati tutti e due con prova-sito entrano tutti e due nel registro", async () => {
  const PRE = "timeout 540 node /home/user/ad-mycity/cervello/prova-sito.mjs --repo /home/user/mycity-ondate/o2-lib-stripe-payout-ts";
  const PERCHE = PRE + "-mutanti-a --file lib/stripe/payout.ts,tests/unit/webhook-ripetuto.test.ts: verde oggi, rosso sul mutante";
  const ALTRO = { titolo: "Etichetta storta nel riepilogo", gravita: "minore", dove: "lib/stripe/payout.ts:3", prova: PRE + " --file components/Riepilogo.tsx", nato_dal_lotto: true };
  const { esito } = await lancia(una("collaudoA:lib-stripe-payout-ts", { regge: false, boccia_per: "variante", perche: PERCHE, difetti: [ALTRO] }), ARGS_VERI);
  assert.ok(esito.registro.some((d) => d.prova === PERCHE), JSON.stringify(esito.registro.map((d) => d.titolo)));
  assert.ok(esito.registro.some((d) => d.titolo === ALTRO.titolo));
});

test("AR-1027 R3 — un revisore che dice «sito» senza mettere il grave fra i difetti, anche con regge:true, ferma il pacchetto", async () => {
  const { esito } = await lancia((l) => (l.startsWith("riesame:pagamenti") ? { regge: true, boccia_per: "sito", perche: "il rimborso del pannello parte due volte", difetti: [] } : undefined));
  assert.notEqual(statoDi(esito, "lib/stripe/payout.ts"), "regge");
  assert.equal(esito.chiedi_a_nicola, true);
  assert.match(esito.motivo, /riesame non concluso/);
});

test("AR-1027 R4 — col tetto a 9 il rifacimento non parte se il suo ricollaudo, con la lente A aggiunta, non ci sta", async () => {
  const { esito, etichette } = await lancia(una("collaudoB:lib-stripe-payout-ts", { regge: false, boccia_per: "sito", perche: G_PANNELLO.prova, difetti: [G_PANNELLO] }), { ...ARGS, max_agenti: 9 });
  assert.ok(!etichette.includes("rifacimento1:lib-stripe-payout-ts"), "nessun rifacimento pagato senza il posto per il suo ricollaudo: " + etichette.join(" "));
  assert.match(statoDi(esito, "lib/stripe/payout.ts"), /tetto vicino/);
});

test("AR-1027 R5 — la stessa variante, trovata al primo collaudo e al ricollaudo con la lente A aggiunta, fa una riga sola", async () => {
  const P = "npx vitest run tests/unit/zz-variante.test.ts: verde oggi, rosso sul mutante";
  let b = false;
  const { esito } = await lancia((l) => {
    if (l === "collaudoA:lib-stripe-payout-ts") return { regge: false, boccia_per: "variante", perche: P, difetti: [] };
    if (l === "collaudoB:lib-stripe-payout-ts" && !b) { b = true; return { regge: false, boccia_per: "sito", perche: "in sola lettura non posso provarlo", difetti: [G_PANNELLO] }; }
    return undefined;
  });
  assert.equal(esito.registro.filter((d) => d.prova === P).length, 1, JSON.stringify(esito.registro.map((d) => d.titolo)));
});

test("AR-1027 R6 — il verificatore sa che «rossa anche sulla base» non vale per un codice che sulla base non c'e'", async () => {
  const { chiamate } = await lancia((l) => (l.startsWith("riesame:pagamenti") ? { regge: false, boccia_per: "sito", difetti: [NATO] } : undefined));
  const v = chiamate.find((c) => c.label.startsWith("verifica"));
  assert.match(v.prompt, /non si carica perche' il codice che prova non c'era, e' nato: reale:true/);
  assert.match(v.prompt, /per lo stesso comportamento \(il passo vitest che fallisce sul controllo, non tsc ne' un import che li' non c'e'\)/);
});

test("AR-1027 — due varianti diverse dello stesso pacchetto, da due collaudi, fanno due righe; e una variante detta con regge:true entra lo stesso", async () => {
  // Il titolo porta il file di prova del comando: due varianti con prove diverse non diventano una sola.
  let inCorr = false;
  // Il comando vero comincia sempre col lungo percorso di prova-sito: e' il caso in cui due titoli fatti
  // dall'inizio del perche' sarebbero uguali per sessanta caratteri, e il registro ne terrebbe uno.
  const PRE = "timeout 540 node /home/user/ad-mycity/cervello/prova-sito.mjs --repo /home/user/mycity-ondate/o2-lib-stripe-payout-ts-mutanti-a --file lib/stripe/payout.ts,";
  const P1 = PRE + "tests/unit/webhook-ripetuto.test.ts: verde oggi, rosso sul mutante";
  const P2 = PRE + "tests/unit/importo-negativo.test.ts: verde oggi, rosso sul mutante";
  const { esito } = await lancia((l) => {
    if (l.startsWith("correzione")) inCorr = true;
    if (l === "collaudoA:lib-stripe-payout-ts") return inCorr ? { regge: false, boccia_per: "variante", perche: P2, difetti: [] } : { regge: false, boccia_per: "variante", perche: P1, difetti: [] };
    if (l.startsWith("riesame:pagamenti") && !inCorr) return { regge: false, boccia_per: "sito", difetti: [NATO] };
    return undefined;
  });
  assert.ok(esito.registro.some((d) => d.prova === P1) && esito.registro.some((d) => d.prova === P2), "due righe: " + JSON.stringify(esito.registro.map((d) => d.titolo)));
  const P3 = "npx vitest run tests/unit/carrello.test.ts: verde oggi, rosso sul mutante";
  const tre = await lancia(una("collaudoAB:components-cart-pay-tsx", { regge: true, boccia_per: "variante", perche: P3, difetti: [] }));
  assert.ok(tre.esito.registro.some((d) => d.prova === P3), "una variante detta con regge:true va nel registro: " + JSON.stringify(tre.esito.registro));
  assert.ok(!tre.etichette.some((l) => l.startsWith("rifacimento")));
});

test("AR-1027 — il collaudo vede la scheda dei chiusi, non solo la chiave: «com'e' scritto» si decide sulla descrizione", async () => {
  const schede = JSON.parse(JSON.stringify(SCHEDE));
  schede.pacchetti[0].difetti[0] = { ...schede.pacchetti[0].difetti[0], dove: "lib/stripe/payout.ts:40", descrizione: "il webhook ripetuto rimborsa due volte lo stesso ordine" };
  const { chiamate } = await lancia(() => undefined, { ...ARGS, schede });
  const a = chiamate.find((c) => c.label === "collaudoA:lib-stripe-payout-ts");
  assert.match(a.prompt, /Chiusi dichiarati: pagamenti-stripe\|rimborso doppio \[lib\/stripe\/payout\.ts:40 — il webhook ripetuto rimborsa due volte lo stesso ordine\]/, a.prompt.split("\n").find((r) => r.startsWith("Chiusi")));
});

// Il collaudo delle cure del secondo ricollaudo (run wf_b8888e09-e59) ha retto, con quattro minori. Di
// questi si tengono i pezzi piccoli: la nota di chi ha costruito arriva al collaudatore solo per trovare la
// prova nuova di un grave, e la nota e' quella dell'ultimo frammento; nel registro una variante si
// riconosce dal comando intero, anche quando la lente l'ha gia' scritta fra i minori con la sola parte comando.
test("AR-1027 — la nota della squadra non arriva al primo collaudo; al ricollaudo di un grave arriva l'ultima, con la sua cornice", async () => {
  let rif = false;
  let b = false;
  const GRAVE_B = { titolo: "Il rimborso del pannello parte due volte", gravita: "grave", dove: "lib/stripe/payout.ts:52", prova: "npx vitest run tests/unit/pannello.test.ts (da scrivere)", nato_dal_lotto: true };
  const { chiamate } = await lancia((l, prompt) => {
    if (l === "squadra:lib-stripe-payout-ts") return { ramo: "r", worktree: "wt-p", commit: "c1", chiusi: ["pagamenti-stripe|rimborso doppio"], file_toccati: ["lib/stripe/payout.ts"], nota: "ho usato un aiuto nuovo, NOTA-VECCHIA" };
    if (l === "rifacimento1:lib-stripe-payout-ts") { rif = true; return { ramo: "r", worktree: "wt-p", commit: "c2", chiusi: [...prompt.matchAll(/"chiave":"([^"]+)"/g)].map((m) => m[1]), file_toccati: ["lib/stripe/payout.ts", "tests/unit/payout-pannello.test.ts"], nota: "la prova del grave sta in tests/unit/payout-pannello.test.ts, NOTA-NUOVA" }; }
    if (l === "collaudoB:lib-stripe-payout-ts" && !b) { b = true; return { regge: false, boccia_per: "sito", perche: GRAVE_B.prova, difetti: [GRAVE_B] }; }
    return undefined;
  });
  assert.ok(rif, "serve un rifacimento");
  const primi = chiamate.filter((c) => c.label.startsWith("collaudo")).slice(0, 2);
  for (const c of primi) assert.doesNotMatch(c.prompt, /Nota della squadra|NOTA-VECCHIA/, c.label + ": al primo collaudo chi ha costruito non parla a chi collauda");
  const dopo = chiamate.slice(chiamate.findIndex((c) => c.label.startsWith("rifacimento1")) + 1).filter((c) => c.label.startsWith("collaudo"));
  assert.ok(dopo.length >= 1);
  for (const c of dopo) {
    assert.match(c.prompt, /Nota della squadra \(la scrive chi ha costruito: non e' una prova e non cambia COME DECIDI[^\n]*NOTA-NUOVA/, c.label + ": al ricollaudo di un grave arriva la nota nuova, con la cornice");
    assert.doesNotMatch(c.prompt, /NOTA-VECCHIA/, c.label + ": la nota vecchia non resta appiccicata");
  }
});

test("AR-1027 — nel registro due varianti nello stesso file di prova sono due righe, e la stessa scritta due volte e' una", async () => {
  const BASE_CMD = "npx vitest run tests/unit/payout.test.ts -t ";
  const P1 = BASE_CMD + "'webhook ripetuto': verde oggi, rosso sul mutante";
  const P2 = BASE_CMD + "'importo negativo': verde oggi, rosso sul mutante";
  let inCorr = false;
  const { esito } = await lancia((l) => {
    if (l.startsWith("correzione")) inCorr = true;
    if (l === "collaudoA:lib-stripe-payout-ts") return { regge: false, boccia_per: "variante", perche: inCorr ? P2 : P1, difetti: [] };
    if (l.startsWith("riesame:pagamenti") && !inCorr) return { regge: false, boccia_per: "sito", difetti: [NATO] };
    return undefined;
  });
  assert.ok(esito.registro.some((d) => d.prova === P1) && esito.registro.some((d) => d.prova === P2), "due righe: " + JSON.stringify(esito.registro.map((d) => d.prova)));
  // La lente ha gia' scritto il minore con lo stesso comando e una nota diversa: la variante non lo raddoppia.
  const SOLO = "npx vitest run tests/unit/carrello.test.ts";
  const MINORE = { titolo: "La prova del carrello non vede la variante", gravita: "minore", dove: "components/cart/Pay.tsx:3", prova: SOLO + " (verde oggi, rosso sul mutante)", nato_dal_lotto: true };
  const due = await lancia(una("collaudoAB:components-cart-pay-tsx", { regge: false, boccia_per: "variante", perche: SOLO + ": verde sul codice di oggi, rosso sul mutante", difetti: [MINORE] }));
  assert.equal(due.esito.registro.filter((d) => String(d.prova || "").startsWith(SOLO)).length, 1, JSON.stringify(due.esito.registro));
});

test("AR-1027 — un rifacimento senza nota non si porta dietro la nota del primo frammento", async () => {
  let b = false;
  const GRAVE_B = { titolo: "Il rimborso del pannello parte due volte", gravita: "grave", dove: "lib/stripe/payout.ts:52", prova: "npx vitest run tests/unit/pannello.test.ts", nato_dal_lotto: true };
  const { chiamate } = await lancia((l, prompt) => {
    if (l === "squadra:lib-stripe-payout-ts") return { ramo: "r", worktree: "wt-p", commit: "c1", chiusi: ["pagamenti-stripe|rimborso doppio"], file_toccati: ["lib/stripe/payout.ts"], nota: "NOTA-VECCHIA" };
    if (l === "rifacimento1:lib-stripe-payout-ts") return { ramo: "r", worktree: "wt-p", commit: "c2", chiusi: [...prompt.matchAll(/"chiave":"([^"]+)"/g)].map((m) => m[1]), file_toccati: ["lib/stripe/payout.ts"] };
    if (l === "collaudoB:lib-stripe-payout-ts" && !b) { b = true; return { regge: false, boccia_per: "sito", perche: GRAVE_B.prova, difetti: [GRAVE_B] }; }
    return undefined;
  });
  const dopo = chiamate.slice(chiamate.findIndex((c) => c.label.startsWith("rifacimento1")) + 1).filter((c) => c.label.startsWith("collaudo"));
  assert.ok(dopo.length >= 1);
  for (const c of dopo) assert.doesNotMatch(c.prompt, /NOTA-VECCHIA/, c.label + ": la nota del primo frammento non vale per il rifacimento");
});
