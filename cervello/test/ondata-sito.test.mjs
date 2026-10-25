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
 */
async function lancia(scenario = () => undefined, args = ARGS, budget = undefined) {
  const chiamate = [];
  const righe = [];
  let commit = 0;
  const agent = async (prompt, opts) => {
    chiamate.push({ label: opts.label, tipo: opts.agentType, fase: opts.phase, prompt });
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
