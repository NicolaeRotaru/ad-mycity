#!/usr/bin/env node
// LOTTO 44, CORSIA 7 — cinque freni che erano promesse scritte, provati facendoli scattare.
//
//   ① AR-143 — il token di GitHub finiva scritto in chiaro dentro `marketplace/.git/config` e non
//      veniva tolto più. Adesso l'indirizzo salvato è pulito e il segreto non passa nemmeno dagli
//      argomenti dei comandi. ⚠️ In questo file il valore del token non compare MAI: si prova che
//      NON c'è, e per provarlo non serve stamparlo.
//   ② AR-442 — il contatore della spesa si azzera a mezzanotte, quindi alle 00:10 il freno lasciava
//      passare una macchina che aveva bruciato tutto fra le 18 e le 24. Adesso i tetti sono due e
//      vince il più severo.
//   ③ AR-208 — lo stop al budget produceva una proposta in coda, non uno stato: nessuno lo leggeva
//      prima di agire. Adesso lo legge il cancello di consenso, e una firma non lo scavalca.
//   ④ AR-209 — una pubblicazione vera dell'autopilota non lasciava niente nel registro delle
//      decisioni, e riscriveva lo stato del calendario cancellando la storia.
//   ⑤ AR-617 — 114 senior promettevano sola lettura senza nessun freno tecnico.
//
// Si lancia con: node cervello/test/c7-freni-che-fermano-davvero.test.mjs

import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const G = await import(join(REPO, "cervello/credenziali-git.mjs"));
const F = await import(join(REPO, "cervello/fonte-numero.mjs"));
const C = await import(join(REPO, "cervello/consenso-azione.mjs"));
const T = await import(join(REPO, "cervello/traccia-decisione.mjs"));
const S = await import(join(REPO, "cervello/senior-sola-lettura.mjs"));
const { msDaTimbro } = await import(join(REPO, "cervello/ora-piacenza.mjs"));

const casi = [];
const prova = async (nome, fn) => {
  try {
    await fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

// ── ① AR-143 · il segreto non tocca il disco ────────────────────────────────
// Un valore finto con la forma di un token vero: se comparisse da qualche parte, si vedrebbe.
const FINTO = "ghp_QUESTO_E_UN_FINTO_TOKEN_DI_PROVA_0000";

await prova("AR-143: la sequenza di comandi git non contiene mai il segreto", () => {
  const passi = G.pianoDiCollegamento({ repo: "NicolaeRotaru/mycity", branch: "main", esiste: false, conToken: true });
  assert.deepEqual(G.segretoNelPiano(passi, FINTO), [], "il token non deve stare in nessun argomento: `ps` li mostra a chiunque");
  const setUrl = passi.find((p) => p.argv[0] === "remote");
  assert.ok(setUrl, "l'indirizzo va scritto esplicitamente");
  assert.equal(setUrl.argv[3], "https://github.com/NicolaeRotaru/mycity.git", "sul disco ci va l'indirizzo PULITO");
  assert.ok(!passi.some((p) => p.argv[0] === "clone"), "niente `clone`: `clone -c` salverebbe la configurazione nel repo nuovo");
  assert.ok(passi.some((p) => p.autenticato), "e le credenziali devono comunque poter arrivare a chi scarica");
});

await prova("AR-143: un config sporco viene visto e ripulito, senza mai stampare il valore", () => {
  const sporco = [
    '[remote "origin"]',
    `\turl = https://x-access-token:${FINTO}@github.com/NicolaeRotaru/mycity.git`,
    "\tfetch = +refs/heads/*:refs/remotes/origin/*",
  ].join("\n");
  const trovate = G.credenzialiInConfig(sporco);
  assert.equal(trovate.length, 1, "l'indirizzo col token dentro dev'essere trovato");
  assert.equal(trovate[0].riga, 2);
  assert.ok(!JSON.stringify(trovate).includes(FINTO), "il verdetto NON deve contenere il segreto, nemmeno troncato");
  const pulito = G.configRipulito(sporco);
  assert.ok(!pulito.includes(FINTO), "dopo la bonifica il segreto non c'è più");
  assert.ok(pulito.includes("https://github.com/NicolaeRotaru/mycity.git"), "e l'indirizzo resta usabile");
  assert.deepEqual(G.credenzialiInConfig(pulito), [], "e il controllo lo conferma");
});

// ── ② AR-442 · due tetti, vince il più severo ───────────────────────────────

await prova("AR-442: alle 00:10 il freno guarda le ultime ore, non il giorno appena nato", () => {
  // Il caso vero del difetto: contatore del giorno ripartito da poco, finestra scorrevole piena.
  const v = F.decidiFrenoCostoDoppio({
    giorno: { valore: 1000, fonte: "misura", soglia: 2_000_000 },
    sessione: { valore: 2_400_000, fonte: "misura", soglia: 2_000_000 },
  });
  assert.equal(v.azione, "frena", "prima diceva «lascia»: il giorno era vuoto e nessuno guardava la finestra");
  assert.match(v.motivo, /ultime ore/);
});

await prova("AR-442: basta uno dei due tetti per frenare, e sotto entrambi si lascia", () => {
  const soloGiorno = F.decidiFrenoCostoDoppio({
    giorno: { valore: 3_000_000, fonte: "misura", soglia: 2_000_000 },
    sessione: { valore: 10, fonte: "misura", soglia: 2_000_000 },
  });
  assert.equal(soloGiorno.azione, "frena");
  const nessuno = F.decidiFrenoCostoDoppio({
    giorno: { valore: 10, fonte: "misura", soglia: 2_000_000 },
    sessione: { valore: 10, fonte: "misura", soglia: 2_000_000 },
  });
  assert.equal(nessuno.azione, "lascia");
});

await prova("AR-442: una gamba cieca si DICHIARA, due gambe cieche sono cieco", () => {
  const mezza = F.decidiFrenoCostoDoppio({
    giorno: { valore: 10, fonte: "misura", soglia: 2_000_000 },
    sessione: { valore: null, fonte: "assente", soglia: 2_000_000 },
  });
  assert.equal(mezza.azione, "lascia");
  assert.match(mezza.motivo, /⚪/, "il buco va detto: un verde che tace su metà misura è la bugia di AR-424");
  const buio = F.decidiFrenoCostoDoppio({
    giorno: { valore: null, fonte: "assente", soglia: 2_000_000 },
    sessione: { valore: null, fonte: "assente", soglia: 2_000_000 },
  });
  assert.equal(buio.azione, "cieco");
});

await prova("AR-442: un conto della finestra fermo da più della finestra è SCADUTO, non basso", () => {
  const adesso = msDaTimbro("2026-08-15 20:00");
  const fresco = F.tokenSessionePerGate({ token_sessione_rolling: 900_000, finestra_min: 360, aggiornato: "2026-08-15 19:30" }, adesso, msDaTimbro);
  assert.equal(fresco.fonte, "misura");
  assert.equal(fresco.valore, 900_000);
  const vecchio = F.tokenSessionePerGate({ token_sessione_rolling: 0, finestra_min: 360, aggiornato: "2026-08-15 03:00" }, adesso, msDaTimbro);
  assert.equal(vecchio.fonte, "scaduta", "uno zero di dieci ore fa non è una spesa bassa");
  const senzaTimbro = F.tokenSessionePerGate({ token_sessione_rolling: 5, finestra_min: 360 }, adesso, msDaTimbro);
  assert.equal(senzaTimbro.fonte, "assente");
});

// ── ③ AR-208 · lo stop di budget è uno stato che il cancello legge ──────────

await prova("AR-208: un reparto oltre il tetto non parte, e il motivo lo dice", () => {
  const registro = { soglia_stop: 1, reparti: { "ads-performance": { budget: 300, speso: 320 } } };
  const v = C.repartoInStop(registro, "ads-performance");
  assert.equal(v.stop, true, "prima lo stop era una card in fondo alla stessa coda che genera le spese");
  assert.match(v.motivo, /320/);
  assert.match(v.motivo, /nemmeno firmato/);
});

await prova("AR-208: sotto il tetto si passa, e un registro illeggibile ferma tutto", () => {
  assert.equal(C.repartoInStop({ soglia_stop: 1, reparti: { vendite: { budget: 300, speso: 10 } } }, "vendite").stop, false);
  assert.equal(C.repartoInStop({ soglia_stop: 1, reparti: { vendite: { budget: 0, speso: 0 } } }, "vendite").stop, false, "budget zero e spesa zero non è uno sforo");
  const cieco = C.repartoInStop(null, "vendite");
  assert.equal(cieco.stop, true, "è il tetto dei SOLDI: al buio si sta fermi");
  assert.equal(cieco.misurabile, false);
});

await prova("AR-208: il reparto viaggia col blocco della coda, o non c'è su cosa applicare lo stop", () => {
  const coda = "## 2026-08-15 10:00 · @ads-performance · Compra il pacchetto di annunci\n- Cosa cambia: spesa\n";
  const [b] = C.blocchiCoda(coda);
  assert.equal(b.reparto, "ads-performance", "prima veniva parsato per calcolare l'id e poi buttato via");
});

// ── ④ AR-209 · la traccia dell'atto ─────────────────────────────────────────

await prova("AR-209: ogni pubblicazione reale deve avere la sua riga nel registro delle decisioni", () => {
  const log = [
    JSON.stringify({ ts: "2026-08-15T10:00:00Z", id: "post-fornaio", canale: "instagram", live: true, stato: "inviato" }),
    JSON.stringify({ ts: "2026-08-15T10:01:00Z", id: "post-fiorista", canale: "instagram", live: false, stato: "inviato" }),
  ].join("\n");
  const senza = T.riscontroTracce(log, "- 2026-08-15 12:00 · 🟢 · [AD] · nota qualunque\n");
  assert.equal(senza.reali, 1, "la prova a secco non è un atto e non chiede una traccia");
  assert.equal(senza.ok, false, "l'atto vero senza traccia è il buco nella catena di custodia");
  const con = T.riscontroTracce(log, T.rigaDecisione({ chi: "AD/autopilot", cosa: 'pubblicato "post-fornaio"' }));
  assert.equal(con.ok, true);
});

await prova("AR-209: lo stato del calendario cambia, ma la storia di com'era non si cancella", () => {
  const voce = { id: "x", stato: "programmato" };
  const storico = T.conStorico(voce, { quando: "2026-08-15 10:00", esito: "inviato" });
  assert.equal(storico.length, 1);
  assert.equal(storico[0].da, "programmato");
  assert.equal(storico[0].a, "pubblicato");
  // e una seconda pubblicazione si aggiunge, non sostituisce.
  const dopo = T.conStorico({ ...voce, storico }, { quando: "2026-08-16 10:00", esito: "inviato" });
  assert.equal(dopo.length, 2, "append-only: è la regola della memoria, e valeva anche qui");
});

await prova("AR-209: l'autopilota scrive DAVVERO la riga, e la scrive nel ramo che pubblica", async () => {
  // Il pezzo dell'autopilota, ESEGUITO su un registro finto: la riga deve comparire nel file.
  const { mkdtempSync, existsSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const dir = mkdtempSync(join(tmpdir(), "c7-decisioni-"));
  const dec = join(dir, "DECISIONI.md");
  process.env.AUTOPILOT_DECISIONI = dec;
  const A = await import(join(REPO, "cervello/autopilot.mjs") + "?traccia");
  A.tracciaPubblicazione({ id: "post-fornaio", canale: "instagram", azioneId: "#A42" }, "inviato");
  delete process.env.AUTOPILOT_DECISIONI;
  assert.equal(existsSync(dec), true, "il registro dev'essere creato: prima non veniva scritto niente");
  const scritto = readFileSync(dec, "utf8");
  assert.match(scritto, /post-fornaio/, "senza il nome della voce la traccia non è ricostruibile da terzi");
  assert.match(scritto, /#A42/);
  assert.match(scritto, /MANO ESEGUITA \(LIVE\)/, "stesso formato dell'altro esecutore: chi legge la storia non deve distinguerli");

  // E deve stare dentro il ramo che pubblica davvero, prima che il calendario venga toccato.
  const src = readFileSync(join(REPO, "cervello/autopilot.mjs"), "utf8");
  const dentro = src.slice(src.indexOf('if (modo && r.stato === "inviato")'));
  assert.match(dentro, /^\s+tracciaPubblicazione\(voce/m, "la chiamata dev'essere viva, non commentata");
  assert.ok(dentro.indexOf("tracciaPubblicazione") < dentro.indexOf('voce.stato = "pubblicato"'), "prima si traccia, poi si tocca il calendario");
});

// ── ⑤ AR-617 · la promessa di sola lettura ha un freno ──────────────────────

await prova("AR-617: nessun senior promette sola lettura senza il campo degli strumenti", () => {
  const dir = join(REPO, ".claude/agents");
  const scoperti = readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => S.verdettoAgente(f, readFileSync(join(dir, f), "utf8")))
    .filter((v) => !v.ok);
  assert.deepEqual(scoperti.map((v) => v.nome), [], `promesse scoperte: ${scoperti.length}`);
});

await prova("AR-617: il kit concesso non contiene nulla che scriva su un sistema esterno", () => {
  const finto = "---\nname: x\ndescription: y\ntools: " + S.KIT_SOLA_LETTURA.join(", ") + "\n---\n\n## Da dove leggi (SOLA LETTURA)\n";
  assert.equal(S.verdettoAgente("finto.md", finto).ok, true);
  // Il metro non è vuoto: uno strumento che scrive dev'essere bocciato, e Task pure.
  const largo = finto.replace("tools: ", "tools: mcp__Supabase__execute_sql, ");
  assert.equal(S.verdettoAgente("largo.md", largo).ok, false);
  const conTask = finto.replace("tools: ", "tools: Task, ");
  assert.equal(S.verdettoAgente("task.md", conTask).ok, false);
  const senza = "---\nname: x\ndescription: y\n---\n\n## Da dove leggi (SOLA LETTURA)\n";
  assert.equal(S.verdettoAgente("senza.md", senza).ok, false, "è esattamente com'erano tutti e 120 prima");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
