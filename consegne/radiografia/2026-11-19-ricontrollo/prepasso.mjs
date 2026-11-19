// Primo passaggio del ricontrollo, solo programma: per ogni voce aperta non riservata del registro del sito
// dice se i file citati esistono ancora alla base, e se sono cambiati dall'ultima volta che la voce è stata
// confermata vera. Uso: node prepasso.mjs <radice ad-mycity> <copia del sito con la storia> <base> <cartella>
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const [radice, sito, base, cartella] = process.argv.slice(2);
const { fileCitati, eRiservataTitolo } = await import(join(radice, "cervello/radiografia-sessioni.mjs"));
const { chiaveProblema } = await import(join(radice, "cervello/referti-sito.mjs"));
const reg = JSON.parse(readFileSync(join(radice, "MyCity-Vault/90-Memoria-AI/auto-coscienza/radiografia-marketplace.json"), "utf8"));
const git = (args) => execFileSync("git", ["-C", sito, ...args], { encoding: "utf8", maxBuffer: 1 << 28 });

const allaBase = new Set(git(["ls-tree", "-r", "--name-only", base]).split("\n").filter(Boolean));
const righe = new Map();
const righeDi = (f) => {
  if (!righe.has(f)) { try { righe.set(f, git(["show", `${base}:${f}`]).split("\n").length); } catch { righe.set(f, null); } }
  return righe.get(f);
};
const commitDi = new Map();
const commitAllaData = (d) => {
  if (!commitDi.has(d)) { const s = git(["rev-list", "-1", `--before=${d}`, base]).trim(); commitDi.set(d, s || null); }
  return commitDi.get(d);
};
const cambiati = new Map();
const cambiatiDa = (c) => {
  if (!cambiati.has(c)) {
    try { cambiati.set(c, new Set(git(["diff", "--name-only", "--no-renames", `${c}..${base}`]).split("\n").filter(Boolean))); }
    catch { cambiati.set(c, null); }
  }
  return cambiati.get(c);
};
const pezziMemo = new Map();
function pezziCambiati(rif, f) {
  const k = `${rif}:${f}`;
  if (!pezziMemo.has(k)) {
    try {
      const out = git(["diff", "-U0", "--no-renames", `${rif}..${base}`, "--", f]);
      pezziMemo.set(k, [...out.matchAll(/^@@ -(\d+)(?:,(\d+))? /gm)].map((m) => [Number(m[1]), m[2] === undefined ? 1 : Number(m[2])]));
    } catch { pezziMemo.set(k, null); }
  }
  return pezziMemo.get(k);
}
const dataIn = (s) => (String(s ?? "").match(/20\d\d-\d\d-\d\d(?:[ T]\d\d:\d\d)?/) ?? [null])[0];

// i percorsi anche dentro le note fra parentesi: «app/x.tsx:12-20 (spiegazione) · lib/y.ts (…)»
const RE_PERCORSO = /((?:[\w@.\-\[\]()]+\/)*[\w@.\-\[\]]+\.(?:tsx|ts|jsx|json|js|mjs|cjs|sql|css|md|yml|yaml|toml|html|txt|sh))(?![\w])(?::(\d+)(?:-(\d+))?)?/g;
const perNome = new Map();
for (const f of allaBase) { const n = f.split("/").pop(); if (!perNome.has(n)) perNome.set(n, []); perNome.get(n).push(f); }
function risolvi(f) {
  if (allaBase.has(f)) return f;
  const coda = [...allaBase].filter((x) => x.endsWith("/" + f));
  if (coda.length === 1) return coda[0];
  if (coda.length > 1) return { ambiguo: f };
  return null;
}
function citatiTolleranti(campo) {
  const visti = new Map();
  for (const m of String(campo ?? "").matchAll(RE_PERCORSO)) {
    let f = m[1].replace(/^[(`'"«]+/, "").replace(/^.*?\/marketplace\//, "").replace(/^marketplace\//, "").replace(/^\.\//, "");
    if (f.startsWith("http") || f.includes("//") || /(^|\/)(node_modules|\.next)\//.test(f) || f.startsWith("cervello/") || f.includes("*")) continue;
    if (!f.includes("/") && !/\.(sql|sh)$/.test(f) && !allaBase.has(f)) {
      // un nome nudo («FreeShippingProgress.tsx»): vale solo se nel sito c'è un file con quel nome
      const n = perNome.get(f); if (!n) continue; if (n.length === 1) f = n[0]; else continue;
    }
    const r = risolvi(f);
    const da = m[2] ? Number(m[2]) : null, a = m[3] ? Number(m[3]) : da;
    if (r && typeof r === "object") continue; // ambiguo: non dice né sì né no
    const ff = r ?? f;
    if (!visti.has(`${ff}:${da}`)) visti.set(`${ff}:${da}`, { f: ff, da, a });
  }
  return [...visti.values()];
}
const esiti = [];
for (const p of reg.problemi) {
  if (p.stato !== "aperto" || eRiservataTitolo(p.titolo)) continue;
  // l'ultima conferma: la più recente fra le riverifiche che dicono «c'è», la riapertura e la nascita
  const conferme = [];
  const r6 = p.riverifica_6_11; if (r6 && typeof r6 === "object" && r6.esito !== "non_verificabile") conferme.push({ d: r6.data, c: r6.codice, da: `riverifica 6/11 ${r6.esito}` });
  const r1 = p.riverifica_1_11; if (r1 && typeof r1 === "object" && r1.esito === "presente") conferme.push({ d: r1.data, c: r1.codice, da: "riverifica 1/11" });
  const rv = p.riverifica; if (rv && typeof rv === "object" && rv.data && rv.verdetto !== "non_era_un_difetto") conferme.push({ d: rv.data, da: `riverifica ${rv.verdetto}` });
  if (p.riaperto_il) conferme.push({ d: dataIn(p.riaperto_il), da: "riaperta" });
  const nascita = dataIn(p.fonte_radiografia) ?? dataIn(p.fonte);
  if (nascita) conferme.push({ d: nascita, da: "nascita" });
  conferme.sort((a, b) => String(b.d).localeCompare(String(a.d)));
  const ult = conferme[0] ?? null;
  let commit = null;
  if (ult) {
    if (ult.c) { try { commit = git(["rev-parse", "--verify", `${ult.c}^{commit}`]).trim(); } catch { commit = null; } }
    if (!commit && ult.d) commit = commitAllaData(ult.d.length === 10 ? `${ult.d} 23:59` : ult.d);
  }
  const citati = citatiTolleranti(p.file);
  const spariti = citati.filter((x) => !allaBase.has(x.f)).map((x) => x.f);
  const righeFuori = citati.filter((x) => allaBase.has(x.f) && x.a && righeDi(x.f) !== null && x.a > righeDi(x.f)).map((x) => `${x.f}:${x.a}`);
  const cam = commit ? cambiatiDa(commit) : null;
  const toccati = cam ? [...new Set(citati.filter((x) => cam.has(x.f)).map((x) => x.f))] : [];
  // le righe citate sono cambiate? riferimento: il commit della nascita (le righe del campo file sono di allora)
  let righeToccate = null;
  if (toccati.length) {
    const rif = nascita ? commitAllaData(nascita.length === 10 ? `${nascita} 23:59` : nascita) : commit;
    righeToccate = false;
    for (const x of citati) {
      if (!cam.has(x.f)) continue;
      if (!x.da || !rif) { righeToccate = true; break; }
      const pezzi = pezziCambiati(rif, x.f);
      if (pezzi === null || pezzi.some(([a, n]) => (n === 0 ? a >= x.da - 1 && a <= x.a : a <= x.a && a + n - 1 >= x.da))) { righeToccate = true; break; }
    }
  }
  let classe;
  if (citati.length === 0) classe = "senza_file";
  else if (spariti.length) classe = "file_spariti";
  else if (!commit || !cam) classe = "senza_data";
  else if (toccati.length) classe = righeToccate ? "righe_toccate" : "righe_ferme";
  else classe = "fermo";
  const r17 = p.riparazione_17_11 && typeof p.riparazione_17_11 === "object" ? p.riparazione_17_11 : null;
  esiti.push({
    chiave: chiaveProblema(p), gravita: String(p.severita).toLowerCase(), classe,
    conferma: ult ? `${ult.d} (${ult.da})` : "-", commit: commit ? commit.slice(0, 12) : "-",
    spariti, toccati, righe_fuori: righeFuori,
    riparazione: r17 ? `${r17.esito}/${r17.collaudo ?? "-"}` : "-",
    dichiarato_riparato: r17 ? ["riparato", "gia_riparato_prima"].includes(r17.esito) : false,
    titolo: String(p.titolo).replace(/\s+/g, " ").slice(0, 160),
  });
}

const conta = {};
for (const e of esiti) { const k = `${e.classe}|${e.gravita}`; conta[k] = (conta[k] ?? 0) + 1; }
const dich = esiti.filter((e) => e.dichiarato_riparato);
const sintesi = {
  base, voci: esiti.length, per_classe_e_gravita: conta,
  righe_oltre_la_fine: esiti.filter((e) => e.righe_fuori.length).length,
  dichiarate_riparate_ma_aperte: dich.length,
  dichiarate_riparate_per_classe: dich.reduce((m, e) => ((m[e.classe] = (m[e.classe] ?? 0) + 1), m), {}),
};
writeFileSync(join(cartella, "prepasso.json"), JSON.stringify({ sintesi, esiti }, null, 1) + "\n");
writeFileSync(join(cartella, "prepasso.tsv"), ["chiave\tgravita\tclasse\tconferma\tcommit\triparazione_17_11\tspariti\ttoccati\trighe_fuori\ttitolo",
  ...esiti.map((e) => [e.chiave, e.gravita, e.classe, e.conferma, e.commit, e.riparazione, e.spariti.join(" "), e.toccati.join(" "), e.righe_fuori.join(" "), e.titolo].join("\t"))].join("\n") + "\n");
console.log(JSON.stringify(sintesi, null, 1));
