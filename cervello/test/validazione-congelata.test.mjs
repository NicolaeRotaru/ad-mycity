#!/usr/bin/env node
// AR-157 — l'unico ordine che proverebbe che i soldi arrivano al fornaio è congelato dentro la
// pausa che esiste proprio per finire la macchina.
//
// Il 23/7 Nicola rimanda l'inserimento negozi. Dodici azioni vanno in pausa e fra queste finisce
// anche `#ordine-test-pq`: un ordine da 3-5€ fatto col telefono che verifica checkout → pagamento →
// consegna. Non è una spinta commerciale, è il collaudo. La coda non aveva un campo per dire la
// differenza, quindi la classificazione l'ha fatta il TEMA della card («riguarda Pane Quotidiano,
// quindi è roba da negozi») invece della sua natura.
//
// La cura non è scongelarla: sarebbe la macchina che ribalta una decisione di Nicola. La cura è
// **dare il campo e pretendere che la domanda gli sia stata fatta**. Un congelamento può restare —
// deve essere una sua scelta, non un effetto collaterale di una parola nel titolo.
//
// Qui si esegue la regola su ingressi finti, e poi si guarda la coda vera.

import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { CLASSI, ambitoDelFatto, congelamentoLegittimo, leggiCard } from "../pausa-coda.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const GUARDIANO = join(REPO, "cervello/pausa-check.mjs");
const CODA = join(REPO, "MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md");
// 24/8 — LA CODA E IL SUO ARCHIVIO SONO LO STESSO REGISTRO, IN DUE FILE.
// Le card chiuse sono state spostate fuori dalla coda perché il file superava i 200.000 caratteri e
// `cancello-stop.mjs` si dichiarava cieco (in CI un ⚪ blocca la consegna: la CI restava rossa a ogni
// push). Prima quelle card vivevano in fondo allo STESSO file, quindi chi leggeva la coda le vedeva
// per caso. Questo caso è cascato lì: la domanda a Nicola su `ordine-test-pq` è stata posta, Nicola
// ha risposto, la card si è chiusa ed è finita in archivio — e il test l'ha data per mai posta.
// La garanzia non cambia: quello che va dimostrato è che la domanda ESISTA, non in quale dei due
// file sia finita. Se non c'è né qui né là, questo test diventa rosso come prima.
const ARCHIVIO = join(REPO, "MyCity-Vault/90-Memoria-AI/Archivio/AZIONI-archivio.md");
const codaEArchivio = () =>
  [CODA, ARCHIVIO].map((f) => (existsSync(f) ? readFileSync(f, "utf8") : "")).join("\n\n---\n\n");

const casi = [];
// AR-935 — un caso può dire «qui non ho materia»: è ⚪ (`ok … # skip`, che la suite conta a parte),
// non un verde e non un rosso. Prima l'unica uscita era il rosso, e la suite diventava rossa il
// giorno in cui la macchina faceva la cosa giusta: svegliare le pause finite.
class Salto extends Error {}
const salta = (motivo) => {
  throw new Salto(motivo);
};
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    if (e instanceof Salto) casi.push({ nome, ok: true, saltato: e.message });
    else casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

function guardiano(args = [], env = {}) {
  try {
    return { rc: 0, out: execFileSync("node", [GUARDIANO, ...args], { cwd: REPO, encoding: "utf8", env: { ...process.env, ...env } }) };
  } catch (e) {
    return { rc: e.status ?? 1, out: `${e.stdout || ""}${e.stderr || ""}` };
  }
}

// ── La regola, eseguita ──────────────────────────────────────────────────────

prova("il caso che ha rotto: pausa di business su azione di validazione → si CHIEDE", () => {
  const g = congelamentoLegittimo({ classeCard: CLASSI.VALIDAZIONE, ambitoPausa: "business" });
  assert.equal(g.legittimo, false);
  assert.equal(g.daChiedere, true, "non si scongela da soli: si sottopone a chi ha deciso la pausa");
  assert.match(g.perche, /finire la macchina/);
});

prova("una pausa di business su un'azione di business è normale, e resta muta", () => {
  const g = congelamentoLegittimo({ classeCard: CLASSI.BUSINESS, ambitoPausa: "business" });
  assert.equal(g.legittimo, true);
  assert.equal(g.daChiedere, false, "un guardiano che parla di undici card su dodici viene spento entro la settimana");
});

prova("senza il campo non c'è giudizio possibile: è l'assenza che ha causato il difetto", () => {
  const g = congelamentoLegittimo({ classeCard: CLASSI.NON_DICHIARATA, ambitoPausa: "business" });
  assert.equal(g.legittimo, false);
  assert.equal(g.daChiedere, false, "manca il campo: si chiede alla macchina di dichiararlo, non a Nicola di deciderlo");
});

prova("l'ambito della pausa viene dal fatto, non dal tema della card", () => {
  // È esattamente l'errore originale: classificare guardando le parole del titolo.
  assert.equal(ambitoDelFatto("ripresa.lavoro-operativo"), "business");
  assert.equal(ambitoDelFatto("fatto.mai.visto"), "sconosciuto");
  assert.equal(congelamentoLegittimo({ classeCard: CLASSI.VALIDAZIONE, ambitoPausa: "sconosciuto" }).daChiedere, false,
    "su un ambito che non conosco non alzo la mano: sarebbe rumore");
});

// ── Il guardiano: rosso finché la domanda non è in coda ──────────────────────

prova("il guardiano resta ROSSO finché a Nicola non è stato chiesto — provato su una fixture", () => {
  const dir = mkdtempSync(join(tmpdir(), "mycity-valid-"));
  const coda = join(dir, "coda.md");
  const registro = join(dir, "fatti.json");
  const env = { PAUSA_CODA_FILE: coda, PAUSA_REGISTRO_FILE: registro };
  const base = [
    "### 🟡 #collaudo — Fai l'ordine di prova · ⏸ in pausa (rinvio negozi)",
    "",
    "- **⏸ Pausa:** rinvio negozi · classe **validazione** · riprende con `ripresa.lavoro-operativo`",
    "",
  ].join("\n");
  try {
    writeFileSync(registro, JSON.stringify({ fatti: [{ id: "ripresa.lavoro-operativo", valore: "dopo il 1 settembre 2026" }] }));

    writeFileSync(coda, base);
    const senza = guardiano(["--adesso", "2026-07-28T08:00"], env);
    assert.equal(senza.rc, 1, "un'azione di collaudo congelata senza che nessuno l'abbia chiesto è una violazione");
    assert.match(senza.out, /congelamento-non-chiesto/);

    // Basta la domanda in coda: la risposta la dà Nicola, non il guardiano.
    writeFileSync(coda, `${base}\n### 🟡 #domanda — Dentro o fuori? {congelamento-da-confermare: collaudo}\n`);
    const con = guardiano(["--adesso", "2026-07-28T08:00"], env);
    assert.equal(con.rc, 0, `con la domanda in coda il guardiano tace:\n${con.out}`);

    // E DOPO la risposta: la card della domanda viene archiviata, ma la conferma resta scritta nella
    // riga di pausa. Senza questo ramo il guardiano tornerebbe rosso proprio quando Nicola ha già
    // deciso — e un allarme che suona dopo la risposta è un allarme che viene spento.
    writeFileSync(coda, base.replace(
      "riprende con `ripresa.lavoro-operativo`",
      "riprende con `ripresa.lavoro-operativo` · congelamento confermato da Nicola",
    ));
    const risposto = guardiano(["--adesso", "2026-07-28T08:00"], env);
    assert.equal(risposto.rc, 0, `con la conferma di Nicola il guardiano tace:\n${risposto.out}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ── La coda vera ─────────────────────────────────────────────────────────────

prova("nella coda vera l'ordine di prova è dichiarato «validazione», non «business»", () => {
  const c = leggiCard(readFileSync(CODA, "utf8")).find((x) => x.id === "ordine-test-pq");
  assert.ok(c, "la card #ordine-test-pq dev'esserci: è l'unica mossa verso il primo ordine pagato");
  if (c.pausa) {
    assert.equal(c.pausa.classe, CLASSI.VALIDAZIONE, "è il collaudo della macchina, non una spinta commerciale");
    return;
  }
  // AR-935 — la pausa può essere FINITA: il 3/9 la sveglia l'ha tolta, e questa riga faceva rossa
  // la suite per una cosa giusta. La classe non sparisce con la pausa: resta scritta sulla riga
  // «▶️ Pausa finita», ed è lì che si legge. Una card mai stata in pausa non ha niente da difendere.
  const finita = /^- \*\*▶\uFE0F? Pausa finita:\*\*.*classe \*\*([a-z-]+)\*\*/m.exec(c.corpo);
  if (!finita) salta("la card non è in pausa e non lo è mai stata: la classe della pausa non ha niente da difendere");
  assert.equal(finita[1], CLASSI.VALIDAZIONE, "la pausa è finita, ma la classe che aveva resta quella del collaudo: la storia non si riscrive");
});

prova("e la domanda a Nicola è in coda o nel suo archivio, con la decisione lasciata a lui", () => {
  const testo = codaEArchivio();
  assert.match(testo, /\{congelamento-da-confermare: ordine-test-pq\}/, "il marcatore lega la domanda alla card congelata");
  const card = leggiCard(testo).find((x) => x.id === "ordine-test-dentro-o-fuori-dalla-pausa");
  assert.ok(card, "serve una card, non una riga di log");
  assert.match(card.corpo, /dentro o fuori/i, "dev'essere una domanda secca, non una riscrittura unilaterale");
  assert.doesNotMatch(card.titolo, /AR-1\d\d/, "il titolo è quello che Nicola legge: le sigle stanno nella nota tecnica");
});

prova("il guardiano vero, eseguito adesso, è verde", () => {
  const r = guardiano([]);
  assert.equal(r.rc, 0, `verde atteso sulla coda vera:\n${r.out}`);
});

let falliti = 0;
let saltati = 0;
for (const c of casi) {
  if (c.saltato) {
    saltati++;
    console.log(`  ok - ${c.nome} # skip ${c.saltato}`);
    continue;
  }
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti - saltati}\n# fail ${falliti}\n# skip ${saltati}`);
process.exit(falliti ? 1 : 0);
