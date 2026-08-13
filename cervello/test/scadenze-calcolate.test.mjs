#!/usr/bin/env node
// AR-147 · AR-214 · AR-212 — un fatto che scade, e nessuno se ne accorge.
//
// Tre difetti, una radice: **un dato che cambia da solo col tempo veniva TRASCRITTO invece che
// calcolato, e una volta scritto smetteva di essere vero senza che nulla lo dicesse.**
//
//   AR-214 (bloccante) — misurato il 28/7 alle 05:59: due schede della stessa pagina dicevano
//     «mancano 3 giorni» per il bando PI26, mentre ne mancavano 2,4. E non divergevano fra loro —
//     CONCORDAVANO, il che è peggio: due fonti che dicono lo stesso numero sembrano una conferma.
//     Nel vault la deriva si legge riga per riga: «mancano 4 giorni», «~2,5», «~2,3», «~2,2»,
//     «mancano 3 giorni». Ognuna vera al suo istante, nessuna ricalcolata.
//
//   AR-147 — l'agente `scadenzario` esisteva da sempre e non aveva mai prodotto un artefatto-dati:
//     le scadenze esterne vivevano come racconto dentro i Report, e un racconto non suona quando
//     è ora.
//
//   AR-212 (bloccante) — il giro scriveva `domande_bloccanti` mentre la Cabina legge
//     `domande_per_nicola`. Il cancello alzato nel lotto 9 dà al motore un VINCOLO — cioè CHIEDE di
//     scrivere il nome giusto — ma un vincolo è una richiesta, non una garanzia: giorni dopo, il
//     file aveva ancora TRE domande sotto l'alias. Una era proprio quella sul bando PI26.
//
// La posta non è architetturale: PI26 sono 10.000€ a fondo perduto, sportello a esaurimento, e dopo
// l'invio una domanda inammissibile non si corregge.

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const leggi = (f) => readFileSync(join(REPO, f), "utf8");

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};
const esegui = (args) => {
  try {
    return { rc: 0, out: execFileSync("node", args, { cwd: REPO, encoding: "utf8" }) };
  } catch (e) {
    return { rc: e.status ?? 1, out: `${e.stdout || ""}${e.stderr || ""}` };
  }
};

const S = await import(join(REPO, "cervello/scadenze-regole.mjs"));
const V = await import(join(REPO, "cervello/valida-contratti.mjs"));
const ORA = 3_600_000;

// ── AR-214: il countdown si calcola ──────────────────────────────────────────
prova("il caso che ha rotto: «mancano 3 giorni» quando ne mancano 2,4 è STANTIO", () => {
  // Il caso reale del 28/7, con i numeri veri: scadenza 30/7 16:00, adesso 28/7 06:00.
  const adesso = Date.parse("2026-07-28T06:00:00+02:00");
  const v = S.countdownStantio({ scritto: 3, scadenzaIso: "2026-07-30T16:00:00+02:00", adessoMs: adesso });
  assert.equal(v.stantio, true, v.motivo);
  assert.ok(v.reale > 2.3 && v.reale < 2.5, `giorni reali fuori range: ${v.reale}`);
});

prova("un arrotondamento onesto NON è stantio: la tolleranza esiste", () => {
  // Senza tolleranza il guardiano segnalerebbe ogni «2 giorni» scritto quando ne mancano 2,4 — e un
  // guardiano che protesta sempre viene disattivato.
  const adesso = Date.parse("2026-07-28T06:00:00+02:00");
  assert.equal(S.countdownStantio({ scritto: 2, scadenzaIso: "2026-07-30T16:00:00+02:00", adessoMs: adesso }).stantio, false);
});

prova("le frasi col countdown si trovano nel testo, in tutte le forme", () => {
  const t = "Rispondi entro il 30/7 (mancano 3 giorni) — sportello a esaurimento. Poi manca 1 giorno.";
  const c = S.countdownNelTesto(t);
  assert.equal(c.length, 2);
  assert.equal(c[0].giorni, 3);
  assert.equal(c[1].giorni, 1, "anche il singolare «manca 1 giorno»");
  assert.equal(S.countdownNelTesto("mancano 12 ore")[0].giorni, 0.5, "le ore si convertono");
});

prova("quanto manca è un DATO, e una data illeggibile non diventa zero", () => {
  const adesso = Date.parse("2026-07-28T06:00:00+02:00");
  const m = S.quantoManca("2026-07-30T16:00:00+02:00", adesso);
  assert.ok(Math.abs(m.ore - 58) < 0.1, `ore: ${m.ore}`);
  assert.equal(m.scaduta, false);
  for (const brutta of [null, "", "domani", "fra tre giorni"]) {
    assert.equal(S.quantoManca(brutta, adesso), null, `${brutta} non deve diventare un numero`);
  }
});

prova("gli scalini salgono, e «scaduta» è un caso a sé", () => {
  assert.equal(S.livelloScadenza(200), "lontana");
  assert.equal(S.livelloScadenza(100), "questa-settimana");
  assert.equal(S.livelloScadenza(58), "imminente", "58 ore = il caso PI26 di oggi");
  assert.equal(S.livelloScadenza(10), "ultime-ore");
  assert.equal(S.livelloScadenza(-1), "scaduta");
  assert.equal(S.livelloScadenza(NaN), "sconosciuto", "e non misurabile NON è «lontana»");
});

prova("al buio il guardiano è CIECO, non verde (AR-322)", () => {
  assert.equal(S.codiceUscita("sconosciuto"), 2);
  assert.equal(S.codiceUscita("imminente"), 1);
  assert.equal(S.codiceUscita("lontana"), 0);
});

prova("il countdown scritto porta con sé quando è stato calcolato", () => {
  // Una frase senza «calcolato il …» non si può smentire: è per questo che «mancano 3 giorni» è
  // sopravvissuto un giorno di troppo.
  const adesso = Date.parse("2026-07-28T06:00:00+02:00");
  const t = S.testoCountdown("2026-07-30T16:00:00+02:00", adesso);
  assert.match(t.testo, /mancano 2\.4 giorni/, "sopra le 48h i giorni con un decimale: «3» era l'arrotondamento che ha ingannato");
  assert.equal(t.livello, "imminente");
  // Sotto le 48 ore si passa alle ore: «mancano 1,5 giorni» a un giorno e mezzo dalla chiusura di uno
  // sportello è più vago di quanto la situazione permetta.
  const stretta = S.testoCountdown("2026-07-29T16:00:00+02:00", adesso);
  assert.match(stretta.testo, /mancano 34 ore/);
  assert.match(S.testoCountdown("2026-07-20T16:00:00+02:00", adesso).testo, /SCADUTA/);
});

// ── AR-147: le scadenze come dati, non come racconto ─────────────────────────
prova("il caso che ha rotto: lo scadenzario ESISTE come artefatto-dati", () => {
  const reg = JSON.parse(leggi("cervello/scadenzario.json"));
  assert.ok(Array.isArray(reg.scadenze), "l'agente scadenzario non aveva mai prodotto un file di dati");
  for (const s of reg.scadenze) {
    assert.ok(s.id && s.titolo && s.scade, `scadenza incompleta: ${s.id || "?"}`);
    assert.ok(S.istante(s.scade) != null, `${s.id}: la data dev'essere un DATO leggibile, non una frase`);
    assert.ok((s.fonte || "").length > 30, `${s.id}: senza fonte è un numero orfano`);
  }
});

prova("PI26 ha una casa sola: il registro dei fatti (AR-102)", () => {
  const reg = JSON.parse(leggi("MyCity-Vault/90-Memoria-AI/registro-fatti.json"));
  const f = (reg.fatti || []).find((x) => x.id === "bandi.pi26.scadenza");
  assert.ok(f, "il fatto dev'essere nel registro, non sparso in prosa in tre file");
  // Qui c'era `assert.match(f.valore, /2026-07-30 16:00/)`: la prova che difende la CASA UNICA del
  // fatto ne teneva una copia scritta a mano dentro di sé — esattamente la duplicazione che AR-102
  // esiste per impedire. Quando Nicola ha deciso (29/7 00:10) che PI26 non è idoneo, il valore è
  // cambiato e la prova è diventata rossa: non perché la macchina avesse sbagliato, ma perché aveva
  // ragione. L'invariante vero è che il fatto abbia una casa sola e un valore vero; il suo CONTENUTO
  // è di Nicola e può cambiare quando vuole, senza rompere niente.
  assert.ok(String(f.valore || "").trim().length > 0, "il fatto c'è ma è vuoto: una casa senza nessuno dentro");
  assert.ok((f.fonte || f.aggiornato || "").length > 0, "un fatto senza fonte né data non è verificabile");
});

prova("il guardiano gira e CALCOLA, non legge una frase", () => {
  // Non punta su PI26: era la scadenza vera del 28/7, ma il 29/7 Nicola l'ha chiusa (non idoneo) e
  // il guardiano l'ha spostata in `chiuse` — giustamente. Una scadenza APERTA finta, iniettata via
  // SCADENZARIO_REGISTRO, prova lo stesso comportamento (il calcolo) senza dipendere da un contenuto
  // di business che può cambiare in qualunque momento (stessa lezione della prova "PI26 ha una casa sola").
  const dir = mkdtempSync(join(tmpdir(), "mycity-scad-reg-"));
  const registro = join(dir, "scadenzario-finto.json");
  writeFileSync(registro, JSON.stringify({
    scadenze: [{ id: "prova-calcolo", titolo: "Scadenza finta per il test", scade: "2099-01-01T00:00:00+01:00", fonte: "fixture del test scadenze-calcolate" }],
    chiuse: [],
  }));
  try {
    const r = execFileSync("node", [join(REPO, "cervello/scadenzario-check.mjs"), "--json"], {
      cwd: REPO, encoding: "utf8", env: { ...process.env, SCADENZARIO_REGISTRO: registro },
    }).toString();
    const j = JSON.parse(r);
    assert.ok(j.scadenze.length > 0);
    const finta = j.scadenze.find((s) => s.id === "prova-calcolo");
    assert.ok(finta, "la scadenza iniettata dev'essere sorvegliata");
    assert.ok(typeof finta.ore === "number", "le ore devono essere un numero calcolato");
    assert.equal(finta.livello, S.livelloScadenza(finta.ore), "il livello dev'essere coerente col calcolo");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

prova("una scadenza entro 72h vincola il giro, non passa inosservata", () => {
  const r = esegui([join(REPO, "cervello/scadenzario-check.mjs")]);
  const j = JSON.parse(esegui([join(REPO, "cervello/scadenzario-check.mjs"), "--json"]).out);
  const imminente = j.scadenze.some((s) => ["imminente", "ultime-ore", "scaduta"].includes(s.livello));
  if (imminente) assert.notEqual(r.rc, 0, "una scadenza imminente DEVE dare un vincolo al giro");
});

prova("nei file vivi non resta nessun countdown trascritto e stantio", () => {
  // È il difetto vivo del 28/7: tre file lo contenevano, uno sbagliato di 1,6 giorni.
  const j = JSON.parse(esegui([join(REPO, "cervello/scadenzario-check.mjs"), "--json"]).out);
  assert.deepEqual(j.stantii, [], `countdown stantii rimasti: ${JSON.stringify(j.stantii)}`);
});

prova("il caso che ha rotto: il rilevatore VEDE un countdown stantio, provato su una fixture", () => {
  // La prima versione di questa prova guardava solo i file veri, che ORA sono a posto: restava verde
  // anche spegnendo il rilevatore. Un controllo sullo stato attuale non distingue «non c'è niente da
  // trovare» da «non sto più cercando» — è la stessa malattia del lotto 10, applicata a un test.
  const dir = mkdtempSync(join(tmpdir(), "mycity-scad-"));
  const finto = join(dir, "CHECKLIST-FINTA.md");
  writeFileSync(finto, "- [ ] 🔴 Rispondi sul bando pi26 (scadenza 30/7) — mancano 9 giorni\n");
  // La scadenza reale "pi26" non è più APERTA (chiusa il 29/7, non idoneo): senza un'apertura finta
  // che condivida l'id, il rilevatore non avrebbe niente con cui confrontare la frase trascritta.
  const registro = join(dir, "scadenzario-finto.json");
  writeFileSync(registro, JSON.stringify({
    scadenze: [{ id: "pi26", titolo: "Bando PI26 finto", scade: "2026-07-30T16:00:00+02:00", fonte: "fixture del test scadenze-calcolate" }],
    chiuse: [],
  }));
  try {
    const r = execFileSync("node", [join(REPO, "cervello/scadenzario-check.mjs"), "--json"], {
      cwd: REPO, encoding: "utf8", env: { ...process.env, SCADENZARIO_FILE_VIVI: finto, SCADENZARIO_REGISTRO: registro },
    }).toString();
    const j = JSON.parse(r);
    assert.equal(j.stantii.length, 1, "un «mancano 9 giorni» su una scadenza a 2 giorni DEVE essere visto");
    assert.match(j.stantii[0].motivo, /dice 9 giorni/);
  } catch (e) {
    const j = JSON.parse(String(e.stdout || "{}"));
    assert.equal(j.stantii?.length, 1, `il rilevatore non ha visto il countdown finto: ${e.message}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

prova("il guardiano è agganciato al giro come cancello", () => {
  const src = leggi("cervello/giro.sh");
  assert.match(src, /guardiano scadenzario-check\.mjs/);
  assert.match(src, /SCADENZE_VINCOLO=/);
  // AR-379/AR-387 (lotto 33): i vincoli si derivano dalle variabili vere (`compgen -v`), non da una
  // seconda lista scritta a mano — quella lista è proprio ciò che aveva lasciato fuori dal conteggio
  // cinque allarmi rossi, fra cui la firma e le porte di pubblicazione.
  assert.match(src, /compgen -v[^\n]*_VINCOLO/, "i vincoli vanno derivati: una lista a mano prima o poi resta indietro");
});

// ── AR-212: correggere è meglio che chiedere ─────────────────────────────────
prova("il caso che ha rotto: le 3 domande sono nel campo che la Cabina LEGGE", () => {
  // Il cancello del lotto 9 CHIEDEVA di scrivere il nome giusto. Giorni dopo il file aveva ancora
  // tre domande sotto l'alias — una sul bando da 10.000€ in scadenza fra due giorni.
  const a = JSON.parse(leggi("MyCity-Vault/90-Memoria-AI/auto-coscienza/auto-analisi.json"));
  assert.equal((a.domande_bloccanti || []).length, 0, "l'alias non deve più contenere niente");
  assert.ok((a.domande_per_nicola || []).length >= 3, "le domande devono stare nel campo canonico");
  // Qui c'era `includes("PI26")`: il contenuto di business del giorno in cui la prova è nata, usato
  // come prova di una regola STRUTTURALE (l'alias si sposta nel campo canonico). PI26 è stato chiuso
  // il 29/7 — «non idoneo, confermato da Nicola» — quindi quella domanda è giustamente sparita e la
  // prova è diventata rossa mentre la regola che difende funzionava. Il comportamento vero lo prova
  // già la prova qui sotto, che ESEGUE `correggiAlias` su un input finto: è quella la rete.
});

prova("la correzione è DETERMINISTICA: eseguita su un input finto, sposta il campo", () => {
  // La prima versione di questa prova guardava auto-analisi.json, che ORA è corretto: restava verde
  // anche togliendo il codice della correzione. Qui la funzione si ESEGUE.
  const regola = { vietati: { domande_bloccanti: "domande_per_nicola", errori_giro: "errori" } };
  const dati = { domande_bloccanti: [{ domanda: "urgente" }], domande_per_nicola: [], errori_giro: [] };
  const fatti = V.correggiAlias(dati, regola);
  assert.equal(dati.domande_per_nicola.length, 1, "il contenuto dev'essere spostato nel canonico");
  assert.equal(dati.domande_per_nicola[0].domanda, "urgente");
  assert.ok(!("domande_bloccanti" in dati), "e l'alias deve sparire");
  assert.ok(!("errori_giro" in dati), "anche l'alias vuoto, che è solo rumore");
  assert.ok(fatti.length >= 2, `deve dire cosa ha fatto: ${JSON.stringify(fatti)}`);
  const src = leggi("cervello/valida-contratti.mjs");
  assert.match(src, /scriviJsonAtomico/, "e la scrittura dev'essere atomica (AR-296)");
});

prova("…e non tocca NIENTE quando il canonico è già pieno", () => {
  const regola = { vietati: { domande_bloccanti: "domande_per_nicola" } };
  const dati = { domande_bloccanti: [{ domanda: "alias" }], domande_per_nicola: [{ domanda: "vera" }] };
  V.correggiAlias(dati, regola);
  assert.equal(dati.domande_per_nicola[0].domanda, "vera", "il canonico pieno non si sovrascrive mai");
  assert.ok("domande_bloccanti" in dati, "e l'alias resta, così il contratto continua a protestare");
});

prova("…ma non sovrascrive dati veri: se il canonico è pieno, si ferma", () => {
  // A quel punto non è un rinominare: sono due liste diverse, e deciderlo non tocca a uno script.
  const src = leggi("cervello/valida-contratti.mjs");
  assert.match(src, /const canonicoVuoto = /, "il caso «canonico già pieno» dev'essere esplicito");
  assert.match(src, /if \(canonicoVuoto && aliasPieno\)/);
});

prova("il giro CORREGGE prima di giudicare", () => {
  const src = leggi("cervello/giro.sh");
  const iCorr = src.indexOf('valida-contratti.mjs" --correggi');
  const iGate = src.indexOf('_contr_out="$(node "$SCRIPT_DIR/valida-contratti.mjs"');
  assert.ok(iCorr > 0, "la correzione dev'essere nel giro");
  assert.ok(iGate > iCorr, "e deve venire PRIMA del cancello che vieta gli alias");
});

prova("il contratto adesso è verde sul file vero", () => {
  const r = esegui([join(REPO, "cervello/valida-contratti.mjs"), "--json"]);
  const j = JSON.parse(r.out);
  assert.deepEqual(j.violazioni, [], `violazioni residue: ${JSON.stringify(j.violazioni)}`);
});

prova("un elenco solo: ogni chiave ammessa dal contratto ha il suo tile in Cabina (10/8)", () => {
  // IL CASO VERO. Il giro scriveva `salute_macchina.sito_uptime` — «il sito dei negozi non risponde
  // dal 30/7» — e succedevano due cose insieme: il contratto lo bocciava (cancello rosso su OGNI PR
  // aperta) e la Cabina non lo mostrava lo stesso. Due elenchi scritti a mano in due file diversi,
  // che è la malattia già pagata qui più volte: prima o poi divergono, e la divergenza non fa
  // rumore finché non blocca tutto.
  //
  // Questa prova li tiene appaiati nell'unico modo che non si può dimenticare: se domani qualcuno
  // ammette una chiave nel contratto senza aggiungere il tile — o toglie il tile lasciando la
  // chiave — qui diventa rosso, e il messaggio dice quale delle due metà manca.
  const contratto = leggi("cervello/valida-contratti.mjs");
  const blocco = /salute_macchina:\s*\{[\s\S]*?canonici:\s*\[([^\]]+)\]/.exec(contratto);
  assert.ok(blocco, "non trovo l'elenco canonico di salute_macchina nel contratto");
  const ammesse = [...blocco[1].matchAll(/"([a-z_]+)"/g)].map((m) => m[1]);
  assert.ok(ammesse.includes("sito_uptime"), "il sito dei negozi dev'essere una chiave ammessa");

  const cabina = leggi("pannello/src/components/AutoCoscienza.tsx");
  const tile = /const sm = live\?\.salute_macchina[\s\S]*?\n\s*\]\.map\(/.exec(cabina);
  assert.ok(tile, "non trovo l'elenco dei tile di salute nella Cabina");
  const mostrate = [...tile[0].matchAll(/raw:\s*sm\.([a-z_]+)/g)].map((m) => m[1]);
  const senzaTile = ammesse.filter((k) => !mostrate.includes(k));
  assert.deepEqual(senzaTile, [], `il contratto ammette ${senzaTile.join(", ")} e la Cabina non lo mostra: il giro scriverebbe nel vuoto`);
  const senzaContratto = mostrate.filter((k) => !ammesse.includes(k));
  assert.deepEqual(senzaContratto, [], `la Cabina mostra ${senzaContratto.join(", ")} e il contratto lo boccia: il cancello resterebbe rosso`);
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
