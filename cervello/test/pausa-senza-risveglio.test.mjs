#!/usr/bin/env node
// AR-159 — «riprendono da sole al 24/8-1/9» era una frase, non un meccanismo.
//
// Il 23/7 Nicola rimanda l'inserimento negozi e dodici azioni vanno in pausa. Il verbale (STATO 23/7
// 18:05) dice che riprendono da sole. Misurato il 28/7: il carattere `⏸` è letto da UN punto solo in
// tutta la macchina — `guardiano-tempo.mjs:38` — e serve a TOGLIERE la card dal conteggio delle
// firme che aspettano, sotto l'etichetta «in attesa di una condizione, non di te». È una promessa
// scritta nel codice che qualcuno controllerà. Non esiste quel qualcuno.
//
// E la data era ricopiata in 11 titoli su 11 invece di essere citata dal registro — mentre Nicola ne
// sta già proponendo un'altra (metà agosto, STATO 26/7 ~01:05 e ~01:10). Il giorno che risponde,
// undici titoli mentono insieme.
//
// Qui si ESEGUONO le decisioni e il risveglio vero, su un ingresso finto e con un orologio finto.
// Non si guarda com'è il mondo adesso: una prova che guarda lo stato attuale resta verde anche a fix
// rimosso — è successo due volte nel lotto 14, e si paga solo dopo.

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { dateNelTesto, leggiCard, ricopiaDelFatto, risolviRipresa, statoPausa } from "../pausa-coda.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const GUARDIANO = join(REPO, "cervello/pausa-check.mjs");

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

function guardiano(args = [], env = {}) {
  try {
    return { rc: 0, out: execFileSync("node", [GUARDIANO, ...args], { cwd: REPO, encoding: "utf8", env: { ...process.env, ...env } }) };
  } catch (e) {
    return { rc: e.status ?? 1, out: `${e.stdout || ""}${e.stderr || ""}` };
  }
}

// ── Dal valore in italiano al giorno ─────────────────────────────────────────

prova("il valore vero del fatto diventa un giorno: «24 agosto - 1 settembre 2026» → 2026-09-01", () => {
  const r = risolviRipresa("dopo il 24 agosto - 1 settembre 2026 (Nicola: prima completa il Pannello)");
  assert.equal(r.iso, "2026-09-01", "di un intervallo si prende il bordo TARDI");
  assert.equal(r.ambigua, false);
});

prova("svegliarsi presto è peggio che svegliarsi tardi: il bordo scelto è l'ultimo", () => {
  // Se prendesse il primo, il 25/8 la macchina rimetterebbe in lista dodici azioni che Nicola aveva
  // rimandato — cioè gli disobbedirebbe di una settimana.
  assert.equal(risolviRipresa("dal 3 al 30 settembre 2026").iso, "2026-09-30");
  assert.equal(risolviRipresa("tra il 1/9/2026 e il 15/9/2026").iso, "2026-09-15");
});

prova("«metà agosto» NON diventa una data: al buio non si dà la risposta comoda", () => {
  // È il valore che Nicola sta proponendo adesso. Indovinare il 15 sarebbe inventare una decisione sua.
  const r = risolviRipresa("metà agosto, appena riparo la bici");
  assert.equal(r.iso, null);
  assert.equal(r.ambigua, true);
  assert.match(r.perche, /anno|giorno/, "deve dire PERCHÉ non è calcolabile, non solo che non lo è");
});

prova("senza anno è ambigua: «1 settembre» da solo non dice quale settembre", () => {
  assert.equal(risolviRipresa("dopo il 1 settembre").ambigua, true);
  assert.equal(risolviRipresa("dopo il 1 settembre 2026").iso, "2026-09-01");
});

// ── La decisione: questa pausa vale ancora adesso? ───────────────────────────

const ms = (s) => new Date(s).getTime();

prova("i quattro esiti, eseguiti con un orologio finto", () => {
  assert.equal(statoPausa({ inPausa: false }), "non-in-pausa");
  assert.equal(statoPausa({ inPausa: true, ripresaIso: "2026-09-01", adessoMs: ms("2026-07-28T08:00") }), "attiva");
  assert.equal(statoPausa({ inPausa: true, ripresaIso: "2026-09-01", adessoMs: ms("2026-09-05T08:00") }), "scaduta");
  assert.equal(statoPausa({ inPausa: true, ripresaIso: null, adessoMs: ms("2026-07-28T08:00") }), "senza-risveglio",
    "in pausa senza un momento di fine è la forma pura del difetto: dorme per sempre");
});

prova("il giorno indicato è ancora DENTRO la pausa, non fuori", () => {
  // «dopo l'1 settembre» include l'1. Un fuso o un'ora storta non deve far partire la sveglia il giorno prima.
  assert.equal(statoPausa({ inPausa: true, ripresaIso: "2026-09-01", adessoMs: ms("2026-09-01T23:00") }), "attiva");
  assert.equal(statoPausa({ inPausa: true, ripresaIso: "2026-09-01", adessoMs: ms("2026-09-02T00:30") }), "scaduta");
});

// ── La copia contro la citazione ─────────────────────────────────────────────

prova("la copia del valore si vede; la data PROPRIA della card no", () => {
  const valore = "dopo il 24 agosto - 1 settembre 2026";
  assert.equal(ricopiaDelFatto("in pausa (rinvio negozi 24/8-1/9)", valore), "24/8",
    "questa è la copia della decisione di Nicola: quando lui la sposta, resta qui a mentire");
  assert.equal(ricopiaDelFatto("Pubblica il post nei gruppi il 20/7", valore), null,
    "il 20/7 è la data SUA: bocciarla sarebbe un guardiano che punisce la verità");
  assert.equal(ricopiaDelFatto("riprende con `ripresa.lavoro-operativo`", valore), null, "citare l'id è la forma giusta");
  assert.equal(ricopiaDelFatto("fine pausa: 1 settembre 2026", valore), "1 settembre", "anche scritta a parole è una copia");
  assert.deepEqual(dateNelTesto("il 2026-09-01").map((d) => [d.g, d.m]), [[1, 9]]);
});

// ── Il risveglio VERO, eseguito ──────────────────────────────────────────────

prova("il caso che ha rotto: passata la data, la card viene svegliata DAVVERO", () => {
  // Non un promemoria: AR-159 (c) vieta esplicitamente di chiudere il punto con un promemoria, perché
  // il promemoria a mano è il meccanismo che qui ha già fallito. Quindi si esegue la scrittura.
  const dir = mkdtempSync(join(tmpdir(), "mycity-pausa-"));
  const coda = join(dir, "coda.md");
  const registro = join(dir, "fatti.json");
  try {
    writeFileSync(coda, [
      "# coda finta",
      "",
      "### 🟡 #prova-sveglia — Fai la cosa · ⏳ accodata 2026-07-01 09:00 · ⏸ in pausa (rinvio finto)",
      "",
      "- **⏸ Pausa:** rinvio finto · classe **business** · riprende con `fatto.finto`",
      "",
      "**Contesto:** niente di vero.",
      "",
      "---",
      "",
    ].join("\n"));
    writeFileSync(registro, JSON.stringify({ fatti: [{ id: "fatto.finto", valore: "dopo il 10 luglio 2026" }] }));

    const env = { PAUSA_CODA_FILE: coda, PAUSA_REGISTRO_FILE: registro };

    // Prima: l'orologio dice che siamo ancora dentro la pausa → niente si muove.
    const dentro = guardiano(["--adesso", "2026-07-05T08:00"], env);
    assert.equal(dentro.rc, 0, `dentro la pausa non c'è niente da dire (rc=${dentro.rc})`);

    // Poi: la data è passata → il guardiano è rosso e lo dice.
    const fuori = guardiano(["--adesso", "2026-07-20T08:00"], env);
    assert.equal(fuori.rc, 1, "una pausa scaduta e una card ancora ferma è una violazione");
    assert.match(fuori.out, /SCADUTA|scaduta/);

    // E col risveglio, la scrittura avviene per davvero — ed esce VERDE, perché ha appena sistemato
    // ciò di cui si lamentava: un guardiano che dopo aver riparato passa comunque un vincolo al
    // motore gli fa cercare un problema che non c'è più.
    const sveglia = guardiano(["--risveglia", "--adesso", "2026-07-20T08:00"], env);
    assert.equal(sveglia.rc, 0, `dopo aver svegliato non resta niente da segnalare (rc=${sveglia.rc})`);
    const dopo = readFileSync(coda, "utf8");
    assert.doesNotMatch(dopo.split("\n").find((l) => l.includes("#prova-sveglia — Fai la cosa")), /⏸/,
      "il ⏸ dev'essere sparito dal titolo: è quello che Nicola vede");
    assert.match(dopo, /▶️ Pausa finita/, "la riga resta come storia, ma dice che è finita");
    assert.match(dopo, /<!-- pausa-scaduta-risveglio -->/, "e deve esserci UNA card che glielo dice, non N card mute");
    assert.match(dopo, /`#prova-sveglia`/, "la card nuova deve elencare quali sono tornate vive");
    assert.ok(sveglia.out.length > 0);

    // Idempotenza: rigirando, non risveglia due volte e non riaccoda la card.
    const ancora = guardiano(["--risveglia", "--adesso", "2026-07-21T08:00"], env);
    const finale = readFileSync(coda, "utf8");
    assert.equal((finale.match(/<!-- pausa-scaduta-risveglio -->/g) || []).length, 1, "la card del risveglio non si duplica a ogni giro");
    assert.equal(ancora.rc, 0, "dopo il risveglio non c'è più niente in violazione");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

prova("una pausa senza legame al fatto è una violazione, non un dettaglio di stile", () => {
  const dir = mkdtempSync(join(tmpdir(), "mycity-pausa2-"));
  const coda = join(dir, "coda.md");
  const registro = join(dir, "fatti.json");
  try {
    writeFileSync(coda, "### 🟡 #orfana — Fai la cosa · ⏸ in pausa (chissà fino a quando)\n\n**Contesto:** niente.\n");
    writeFileSync(registro, JSON.stringify({ fatti: [] }));
    const r = guardiano([], { PAUSA_CODA_FILE: coda, PAUSA_REGISTRO_FILE: registro });
    assert.equal(r.rc, 1);
    assert.match(r.out, /senza-risveglio/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

prova("fatto ambiguo → CIECO (2), non verde e non rosso", () => {
  // Se non so calcolare la fine, non so nemmeno se le pause sono scadute. Dire «rosso» sarebbe
  // inventarsi una misura che non ho; dire «verde» sarebbe la bugia comoda. Contratto AR-322.
  const dir = mkdtempSync(join(tmpdir(), "mycity-pausa3-"));
  const coda = join(dir, "coda.md");
  const registro = join(dir, "fatti.json");
  try {
    writeFileSync(coda, [
      "### 🟡 #vaga — Fai la cosa · ⏸ in pausa (rinvio)",
      "",
      "- **⏸ Pausa:** rinvio · classe **business** · riprende con `fatto.vago`",
      "",
    ].join("\n"));
    writeFileSync(registro, JSON.stringify({ fatti: [{ id: "fatto.vago", valore: "metà agosto" }] }));
    const r = guardiano([], { PAUSA_CODA_FILE: coda, PAUSA_REGISTRO_FILE: registro });
    assert.equal(r.rc, 2, `un guardiano che non può calcolare deve uscire 2 (uscito ${r.rc})`);
    assert.match(r.out, /cieco|non calcolabil/i);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ── La coda vera, adesso ─────────────────────────────────────────────────────

prova("nella coda vera ogni card in pausa ha un momento in cui finisce", () => {
  const testo = readFileSync(join(REPO, "MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md"), "utf8");
  const inPausa = leggiCard(testo).filter((c) => c.inPausa);
  // Qui c'era `>= 11`: il numero di card in pausa il giorno in cui la prova è stata scritta.
  // Quel numero scende ogni volta che la macchina LAVORA — una card in pausa che riprende è un
  // successo — quindi la soglia diventava rossa per il motivo sbagliato (il 30/7: 10 invece di 11,
  // suite rossa su main). L'invariante che questa prova difende è nel ciclo qui sotto: OGNI card in
  // pausa dice da quale fatto dipende e di che classe è. La soglia serve solo a garantire che il
  // ciclo non giri a vuoto — e per questo basta che ce ne sia almeno una.
  assert.ok(inPausa.length >= 1, "nessuna card in pausa nella coda: il ciclo qui sotto non proverebbe nulla");
  for (const c of inPausa) {
    assert.ok(c.pausa?.fatto, `#${c.id} (riga ${c.riga}) è in pausa e non dice da quale fatto dipende`);
    assert.ok(["business", "validazione"].includes(c.pausa.classe), `#${c.id} non dichiara la classe`);
  }
});

prova("e nessuna ricopia la data invece di citarla — il guardiano vero, eseguito adesso", () => {
  // Si giudicano SOLO le violazioni di AR-159. Il codice d'uscita è condiviso col difetto accanto
  // (AR-157), e una prova che guarda l'esito globale diventa rossa quando si rompe il vicino: è la
  // prova condivisa di AR-254 al contrario — non chiude niente di falso, ma accusa un fix sano.
  const r = guardiano(["--json"]);
  const rep = JSON.parse(r.out);
  const mie = rep.violazioni.filter((v) => ["senza-risveglio", "valore-ricopiato", "pausa-scaduta"].includes(v.tipo));
  assert.deepEqual(mie, [], `pause senza risveglio o con la data ricopiata: ${JSON.stringify(mie)}`);
  assert.deepEqual(rep.ciechi, [], "nessuna pausa dev'essere incalcolabile sulla coda vera");
  assert.equal(rep.card_in_pausa, rep.dettaglio.length, "ogni card in pausa dev'essere giudicata, non saltata in silenzio");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
