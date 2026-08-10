#!/usr/bin/env node
// 🏟️ LA PROVA SUL CAMPO (AR-510, Nicola 3/8: «prova sul campo un commit e una chiusura del turno
// bloccati, però fai una prova complessa e difficile»).
//
// PERCHÉ SERVIVA. Fino a qui i due freni erano provati sulle loro funzioni PURE: `verdetto()` torna
// blocca:true, `sorveglia()` torna una voce grave. Nessuno aveva mai verificato la catena intera —
// git chiama l'hook, l'hook chiama node, node legge il registro, il codice d'uscita torna a git e git
// RIFIUTA il commit. È la differenza fra «il codice sembra giusto» e «l'ho visto succedere», ed è la
// stessa differenza che è costata AR-455 (chiuso perché la riga in settings.json c'era, mentre il
// freno che quella riga attaccava parlava a nessuno) e AR-465.
//
// PERCHÉ COMPLESSA. Una prova che mette UN difetto e vede UN rosso non distingue un cancello che
// funziona da un cancello che dice sempre di no. Qui lo scenario ne mescola quattro, di tre gravità
// diverse, e la prova pretende che il cancello li tratti in modo DIVERSO:
//
//   ① una riga nuova con una malattia censita         → grave, blocca
//   ② un'asserzione tolta da un test, codice intatto  → grave, blocca (⑪ AR-509)
//   ③ una sorella della stessa malattia lasciata viva  → media, si dice e NON blocca (⑩ AR-509)
//   ④ una riga innocua in un altro file               → niente, e non deve diventare rumore
//
// E soprattutto: la cura PARZIALE non deve bastare. Tolgo ①, il commit deve restare rifiutato per ②.
// È il caso che un cancello scritto male passa — perché conta i problemi invece di guardarli.
//
// COSA NON COPRE, detto qui e non scoperto fra un mese: il repo di prova ha il cervello vero ma un
// registro delle malattie FINTO (una malattia sola, inventata per il test). Provare col registro vero
// legherebbe questa prova al debito del repo: diventerebbe rossa o verde per motivi che non c'entrano
// col cancello. Il registro vero lo misura già `spazzata-fratelli`.

import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { test } from "node:test";
import assert from "node:assert/strict";
import { CERCA_ESITO_IN_GIT, ARGOMENTI_CERCA_ESITO } from "../cancello-stop.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");

/** La malattia finta: un `console.log` lasciato in un guardiano. Vera abbastanza da essere credibile,
 *  finta abbastanza da non dipendere dal registro di casa. */
const MALATTIA = {
  id: "verdetto-stampato-e-basta",
  nome: "Un guardiano stampa e non torna niente",
  perche_e_grave: "chi lo chiama riceve un silenzio che somiglia a un verde",
  pattern: "console\\.log\\(\"VERDETTO",
  dove: ["cervello"],
  estensioni: [".mjs"],
  baseline: 0,
};

const CODICE_MALATO = [
  'export function guarda(x) {',
  '  if (!x) console.log("VERDETTO: manca x");',
  '  return true;',
  '}',
  '',
].join("\n");

const PROVA_PIENA = [
  'import assert from "node:assert/strict";',
  'import { guarda } from "../guardiano.mjs";',
  'assert.equal(guarda(1), true);',
  'assert.equal(guarda(0), false, "il caso che conta");',
  '',
].join("\n");

/**
 * Butta la cartella di scarto SENZA poter far cadere il caso che la usava (AR-563).
 *
 * Perché è una funzione a sé, ed esportata: il fix vero di AR-563 è una DECISIONE — un caso è rosso
 * per ciò che asserisce, non per quanto era occupata una cartella in /tmp — e una decisione che vive
 * dentro una chiusura anonima non la può provare nessuno. Da qui il collaudo l'ha trovata scoperta:
 * le mutazioni coprivano la diagnosticabilità e non lei.
 *
 * `rimuovi` si inietta apposta. L'ENOTEMPTY vero non si fabbrica su questa macchina (gira da root, e
 * i permessi non fermano root: misurato, non supposto), quindi la prova non finge di riprodurre
 * l'ambiente del runner — verifica la sola cosa che qui è verificabile e che è anche quella che conta:
 * se la rimozione fallisce, questa funzione NON propaga, e non tace.
 */
export function pulisciSenzaFarCadereIlCaso(dir, rimuovi = rmSync, avvisa = console.error) {
  try {
    rimuovi(dir, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
    return { rimossa: true };
  } catch (e) {
    avvisa(`⚠️  cartella di prova non cancellata (${e.code}): ${dir} — il verdetto del caso non cambia`);
    return { rimossa: false, codice: e.code };
  }
}

/** Un repo git con l'hook VERO, il cervello VERO e una storia da cui partire. */
function campo() {
  const d = mkdtempSync(join(tmpdir(), "mycity-campo-"));
  const git = (...a) => execFileSync("git", a, { cwd: d, encoding: "utf8", stdio: "pipe" });
  git("init", "-q", "-b", "lavoro"); // non `main`: il perimetro di main è un altro cancello, non questo
  git("config", "user.email", "test@mycity.local");
  git("config", "user.name", "test");
  // AR-563 — LA CAUSA DEL ROSSO CHE APPARIVA SOLO SU GITHUB. Dopo certi comandi git lancia da sé una
  // manutenzione IN BACKGROUND (`gc --auto`), che continua a scrivere dentro `.git/objects` quando il
  // comando in primo piano è già tornato. Su questa macchina finisce prima che il caso chiuda; sul
  // runner — più lento, e con 130 test appena girati addosso — no: `pulisci()` trovava la cartella
  // ancora popolata e moriva con ENOTEMPTY. Non era un'asserzione a cadere, era la pulizia, e siccome
  // sta nel `finally` il caso risultava rosso lo stesso. Spiega tutto ciò che sembrava misterioso:
  // perché solo in CI, perché solo dentro la suite intera, e perché da solo passava 10 su 10.
  git("config", "gc.auto", "0");
  git("config", "core.hooksPath", ".githooks");
  mkdirSync(join(d, ".githooks"), { recursive: true });
  cpSync(join(REPO, ".githooks/pre-commit"), join(d, ".githooks/pre-commit"));
  execFileSync("chmod", ["+x", join(d, ".githooks/pre-commit")]);
  // Il cervello vero, senza le prove (che sono fixture: porterebbero dentro finti gate e finte
  // malattie, cioè esattamente l'errore «menzione ≠ istanza» che questa casa ha già pagato tre volte).
  cpSync(join(REPO, "cervello"), join(d, "cervello"), {
    recursive: true,
    filter: (src) => !src.includes("/test") && !src.includes("_tmp_") && !src.includes("node_modules"),
  });
  writeFileSync(join(d, "cervello/malattie.json"), JSON.stringify({ malattie: [MALATTIA] }, null, 1));
  writeFileSync(join(d, "cervello/mutanti.json"), JSON.stringify({ mutanti: [] }, null, 1));
  // Lo stato di partenza: un guardiano SANO con due console.log innocenti, e la sua prova piena.
  mkdirSync(join(d, "cervello/test"), { recursive: true });
  writeFileSync(join(d, "cervello/guardiano.mjs"), 'export function guarda(x) {\n  return Boolean(x);\n}\n');
  writeFileSync(join(d, "cervello/test/guardiano.test.mjs"), PROVA_PIENA);
  // Il secondo modulo, con la sua prova: serve per ② — l'asserzione tolta da un test mentre il file
  // che difende resta intatto. Deve essere un file DIVERSO da quello di ①, o i due difetti si
  // annullerebbero a vicenda: toccare il codice insieme al test È la riparazione normale, e ⑪ tace.
  // (Trovato dalla prova sul campo stessa, alla prima esecuzione: lo scenario era mal costruito.)
  writeFileSync(join(d, "cervello/vecchio.mjs"), 'export function v(x) {\n  return x === 0 ? "zero" : "altro";\n}\n');
  writeFileSync(
    join(d, "cervello/test/vecchio.test.mjs"),
    ['import assert from "node:assert/strict";', 'import { v } from "../vecchio.mjs";', 'assert.equal(v(1), "altro");', 'assert.equal(v(0), "zero", "il caso limite");', ""].join("\n"),
  );
  // Il terzo: due sorelle della stessa malattia, per ③ (ne curo una e lascio l'altra).
  writeFileSync(join(d, "cervello/terzo.mjs"), 'export function t() {\n  console.log("VERDETTO: uno");\n  console.log("VERDETTO: due");\n}\n');
  git("add", "-A");
  git("commit", "-q", "-m", "base", "--no-verify");
  return {
    dir: d,
    git,
    scrivi(file, testo) {
      mkdirSync(dirname(join(d, file)), { recursive: true });
      writeFileSync(join(d, file), testo);
    },
    leggi: (file) => readFileSync(join(d, file), "utf8"),
    commit(msg = "prova") {
      git("add", "-A");
      try {
        return { rc: 0, out: execFileSync("git", ["commit", "-m", msg], { cwd: d, encoding: "utf8", stdio: "pipe" }) };
      } catch (e) {
        return { rc: e.status ?? 1, out: `${e.stdout || ""}${e.stderr || ""}` };
      }
    },
    // LA PULIZIA NON DÀ IL VERDETTO (AR-563). `gc.auto 0` toglie la causa principale — la manutenzione
    // che git avviava in background — ma sul runner resta l'ENOTEMPTY che il filesystem a strati
    // restituisce su una cartella appena svuotata, senza nessun processo vivo dentro. Stava nel
    // `finally`, quindi si portava dietro il caso: due esecuzioni di fila hanno accusato tre casi
    // DIVERSI, che è la firma di un guasto d'ambiente e non di una difesa che ha trovato qualcosa.
    //
    // Un caso deve essere rosso per ciò che ASSERISCE. Se la cartella di scarto in /tmp resiste, lo
    // dico e tiro dritto: non sparisce in silenzio (il messaggio resta nel log, e il sistema quella
    // cartella la ripulisce da sé), ma non trasforma una prova verde in un rosso che manda a cercare
    // un bug che non c'è — che è il costo già pagato qui in mezzo pomeriggio.
    pulisci: () => pulisciSenzaFarCadereIlCaso(d),
  };
}

test("SUL CAMPO: git rifiuta davvero un commit che mescola quattro difetti diversi", () => {
  const c = campo();
  try {
    // ① la malattia in una riga nuova · ② l'asserzione tolta dalla prova di un ALTRO modulo, che non
    // tocco · ③ una sorella lasciata viva nel file di cui curo una riga · ④ rumore innocuo.
    c.scrivi("cervello/guardiano.mjs", CODICE_MALATO);
    c.scrivi(
      "cervello/test/vecchio.test.mjs",
      ['import assert from "node:assert/strict";', 'import { v } from "../vecchio.mjs";', 'assert.equal(v(1), "altro");', ""].join("\n"),
    );
    c.scrivi("cervello/terzo.mjs", 'export function t() {\n  console.log("VERDETTO: due");\n}\n');
    c.scrivi("note.txt", "niente di che\n");

    const r = c.commit();
    assert.notEqual(r.rc, 0, "il commit DEVE essere rifiutato: qui git è il cancello, non una funzione pura");
    assert.match(r.out, /COMMIT BLOCCATO/, "e deve dire perché, non morire in silenzio");
    assert.match(r.out, /verdetto-stampato-e-basta/, "① la malattia nuova nominata per nome");
    assert.match(r.out, /prova-indebolita/, "② il termometro cambiato al posto della febbre");
    assert.match(r.out, /vecchio\.mjs/, "…e dice QUALE codice è rimasto senza quella prova");

    // ⑤ E la storia non è cambiata: un commit rifiutato non deve lasciare niente dietro.
    assert.equal(c.git("log", "--oneline").trim().split("\n").length, 1, "nessun commit è passato");
  } finally {
    c.pulisci();
  }
});

test("SUL CAMPO: la cura PARZIALE non basta — tolgo il primo difetto e resta rifiutato", () => {
  const c = campo();
  try {
    // Curo ① (via il console.log) ma lascio ② (l'asserzione tolta dalla prova di vecchio.mjs).
    c.scrivi("cervello/guardiano.mjs", 'export function guarda(x) {\n  return Boolean(x);\n}\n// riscritto\n');
    c.scrivi(
      "cervello/test/vecchio.test.mjs",
      ['import assert from "node:assert/strict";', 'import { v } from "../vecchio.mjs";', 'assert.equal(v(1), "altro");', ""].join("\n"),
    );
    const r = c.commit();
    assert.notEqual(r.rc, 0, "un cancello che conta i problemi invece di guardarli passerebbe qui");
    assert.match(r.out, /prova-indebolita/);
  } finally {
    c.pulisci();
  }
});

test("SUL CAMPO: curati tutti e due, il commit passa — un cancello che non può diventare verde è spento", () => {
  const c = campo();
  try {
    c.scrivi("cervello/guardiano.mjs", 'export function guarda(x) {\n  return Boolean(x);\n}\n// riscritto\n');
    c.scrivi("cervello/test/guardiano.test.mjs", `${PROVA_PIENA}assert.equal(guarda(null), false, "caso nuovo");\n`);
    const r = c.commit("lavoro pulito");
    assert.equal(r.rc, 0, `doveva passare, invece: ${r.out.slice(0, 400)}`);
    assert.equal(c.git("log", "--oneline").trim().split("\n").length, 2);
  } finally {
    c.pulisci();
  }
});

test("SUL CAMPO: il debito VECCHIO non blocca nessuno — solo ciò che aggiungo adesso", () => {
  const c = campo();
  try {
    // `vecchio.mjs` ha due istanze della malattia dal commit base, e nessuno le tocca.
    c.scrivi("cervello/altro.mjs", "export const x = 1;\n");
    const r = c.commit("lavoro innocente");
    assert.equal(r.rc, 0, "un cancello che parte rosso su mezzo repo viene disattivato entro la settimana");
  } finally {
    c.pulisci();
  }
});

test("SUL CAMPO: la chiusura del turno si ferma davvero (uscita 2 = l'hook Stop blocca)", () => {
  const c = campo();
  try {
    // Lo stato che deve fermarla: un difetto passato a «chiuso» senza nessuna prova eseguibile.
    const cantiere = "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json";
    c.scrivi(cantiere, JSON.stringify({ difetti: [{ id: "AR-1", stato: "aperto", titolo: "un difetto vero" }] }, null, 1));
    c.scrivi("MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json", JSON.stringify({ lezioni: [] }, null, 1));
    c.git("add", "-A");
    c.git("commit", "-q", "-m", "cantiere", "--no-verify");
    c.scrivi(cantiere, JSON.stringify({ difetti: [{ id: "AR-1", stato: "chiuso", titolo: "un difetto vero" }] }, null, 1));

    let rc = 0;
    let out = "";
    try {
      out = execFileSync("node", ["cervello/cancello-stop.mjs", "--hook"], {
        cwd: c.dir,
        encoding: "utf8",
        input: JSON.stringify({ stop_hook_active: false }),
        stdio: ["pipe", "pipe", "pipe"],
      });
    } catch (e) {
      rc = e.status ?? 1;
      out = `${e.stdout || ""}${e.stderr || ""}`;
    }
    assert.equal(rc, 2, "dentro l'hook Stop il 2 è l'unico codice che blocca la chiusura del turno");
    assert.match(out, /AR-1/, "e dice quale difetto stavo archiviando invece di riparare");
    assert.match(out, /verifica|riaprilo/, "…e cosa fare adesso");
  } finally {
    c.pulisci();
  }
});

test("SUL CAMPO: senza ancora il cancello non accusa di lavoro altrui, ma non tace nemmeno (AR-507)", () => {
  const c = campo();
  try {
    // Un allarme committato in una consegna, come se l'avesse scritto un turno di ieri: qui l'ancora
    // non esiste (repo appena nato), quindi il perimetro è tutto il ramo.
    c.scrivi("consegne/devops/incidente.md", "# 🔴 CRITICO — il sito è giù\nbloccante, va deciso oggi\n");
    c.scrivi("MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json", JSON.stringify({ difetti: [] }, null, 1));
    c.scrivi("MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json", JSON.stringify({ lezioni: [] }, null, 1));
    c.git("add", "-A");
    c.git("commit", "-q", "-m", "consegna di ieri", "--no-verify");

    let rc = 0;
    let out = "";
    try {
      out = execFileSync("node", ["cervello/cancello-stop.mjs", "--hook"], {
        cwd: c.dir,
        encoding: "utf8",
        input: JSON.stringify({ stop_hook_active: false }),
        stdio: ["pipe", "pipe", "pipe"],
      });
    } catch (e) {
      rc = e.status ?? 1;
      out = `${e.stdout || ""}${e.stderr || ""}`;
    }
    assert.notEqual(rc, 2, "senza sapere di chi è il lavoro, il turno non si blocca");
    if (out.includes("incidente.md")) {
      assert.match(out, /non so cosa è tuo/, "se lo nomina, lo nomina come dubbio e non come accusa");
      assert.doesNotMatch(out, /^❌ ho scritto un allarme/m, "niente accuse in prima persona su lavoro non attribuito");
    }
  } finally {
    c.pulisci();
  }
});

test("SUL CAMPO: il commit che riscrive un JSON tutto viene rifiutato (AR-511)", () => {
  // Il freno esisteva dal 30/7 e girava solo in CI: lo stesso errore è passato due volte, e tutte e
  // due le volte l'ha visto Nicola prima della macchina. Qui il pre-commit lo esegue davvero.
  const c = campo();
  try {
    // Un JSON con indentazione a DUE spazi nella storia, come il cantiere vero.
    const dati = { voci: [{ id: "A", n: 1 }, { id: "B", n: 2 }] };
    c.scrivi("registro.json", `${JSON.stringify(dati, null, 2)}\n`);
    c.git("add", "-A");
    c.git("commit", "-q", "-m", "registro", "--no-verify");
    // Al commit la base è HEAD (ciò che sto per committare non è ancora un commit), quindi non serve
    // fabbricare `origin/main`. La prima stesura lo faceva e il test restava verde per il motivo
    // sbagliato: il guardiano non vedeva NIENTE — `origin/main...HEAD` guarda i commit, e il mio file
    // era in staging. Un test che passa perché il guardiano non ha misurato è «cieco = verde».

    // Ora lo riscrivo a UNO spazio aggiungendo una voce: contenuto giusto, forma cambiata su ogni riga.
    dati.voci.push({ id: "C", n: 3 });
    c.scrivi("registro.json", `${JSON.stringify(dati, null, 1)}\n`);
    const r = c.commit("aggiungo una voce");
    assert.notEqual(r.rc, 0, "una PR da ottomila righe per cambiarne tre non deve poter partire");
    assert.match(r.out, /riscrivendo un JSON tutto|registro\.json/);

    // E con l'indentazione giusta passa: il freno si può soddisfare, non solo subire.
    c.scrivi("registro.json", `${JSON.stringify(dati, null, 2)}\n`);
    const ok = c.commit("aggiungo una voce, forma invariata");
    assert.equal(ok.rc, 0, `doveva passare, invece: ${ok.out.slice(0, 300)}`);
  } finally {
    c.pulisci();
  }
});

test("SUL CAMPO: rimettere la forma di casa NON è una riformattazione (AR-511)", () => {
  // Il caso vero: HEAD contiene già il file riscritto storto, e il commit che lo raddrizza deve
  // poter passare. Un cancello che impedisce di riparare si aggira col primo --no-verify.
  const c = campo();
  try {
    const dati = { voci: [{ id: "A" }] };
    c.scrivi("registro.json", `${JSON.stringify(dati, null, 2)}\n`); // la forma di casa: due spazi
    c.git("add", "-A");
    c.git("commit", "-q", "-m", "casa", "--no-verify");
    c.git("update-ref", "refs/remotes/origin/main", "HEAD");
    c.scrivi("registro.json", `${JSON.stringify(dati, null, 1)}\n`); // il commit storto, già fatto
    c.git("add", "-A");
    c.git("commit", "-q", "-m", "storto", "--no-verify");

    dati.voci.push({ id: "B" });
    c.scrivi("registro.json", `${JSON.stringify(dati, null, 2)}\n`); // torno a casa e aggiungo una voce
    const r = c.commit("raddrizzo e aggiungo");
    assert.equal(r.rc, 0, `tornare alla forma di origin/main deve passare, invece: ${r.out.slice(0, 300)}`);
  } finally {
    c.pulisci();
  }
});

test("SUL CAMPO: il commit automatico del worker che aggiorna un registro PASSA (AR-541)", () => {
  // Nicola, 4/8: «il worker sul server vero: da qui lo vedo di riflesso, ho tolto la causa ma non ho
  // visto il server girare». Il server da qui non lo raggiungo — ma il pezzo che rischiava di
  // fermarlo è il pre-commit, e quello posso farlo girare davvero.
  //
  // Il worker committa senza saltare gli hook (git-pr.mjs: `git commit`, e su errore exit 1). Se il
  // freno sulla forma scattasse su un suo commit, la memoria smetterebbe di pubblicarsi. Qui il
  // percorso è quello vero: un registro scritto dalla via ufficiale della macchina.
  const c = campo();
  try {
    const registro = "MyCity-Vault/90-Memoria-AI/auto-coscienza/registro.json";
    // Il registro nasce COMPATTO, come apprendimento.json e mutanti.json nel repo vero.
    c.scrivi(registro, `${JSON.stringify({ voci: [{ id: "A" }] }, null, 1)}\n`);
    c.git("add", "-A");
    c.git("commit", "-q", "-m", "registro", "--no-verify");
    c.git("update-ref", "refs/remotes/origin/main", "HEAD");

    // Il giro della macchina: legge, aggiunge, risalva con la via ufficiale.
    const script = [
      'import { readFileSync } from "node:fs";',
      'import { scriviJsonAtomico } from "./cervello/scrivi-json.mjs";',
      `const p = ${JSON.stringify(registro)};`,
      'const j = JSON.parse(readFileSync(p, "utf8"));',
      'j.voci.push({ id: "B" });',
      "scriviJsonAtomico(p, j);",
    ].join("\n");
    c.scrivi("giro-finto.mjs", `${script}\n`);
    execFileSync("node", ["giro-finto.mjs"], { cwd: c.dir, encoding: "utf8" });

    const r = c.commit("memoria del giro");
    assert.equal(r.rc, 0, `il commit automatico deve passare, invece: ${r.out.slice(0, 400)}`);
    assert.equal(JSON.parse(c.leggi(registro)).voci.length, 2, "e il contenuto nuovo c'è davvero");
    assert.equal(c.leggi(registro).split("\n")[1].match(/^ +/)[0].length, 1, "con la forma di prima, non quella di chi scrive");
  } finally {
    c.pulisci();
  }
});

// ── SUL CAMPO: la riga di esito scritta dentro una fusione (AR-505) ──────────
//
// Il caso che ha bloccato la CI tre volte in un giorno, e che la scheda chiedeva di provare così:
// «con una prova che parta ROSSA su un ramo dove l'unica riga di esito vive in un commit di merge».
// Qui il ramo si biforca, i due lati toccano lo stesso file, e la riga di esito viene scritta
// mentre si risolve il conflitto — cioè nel commit di fusione, che è il flusso naturale.

test("SUL CAMPO: la riga di esito dentro un commit di fusione dev'essere trovata (AR-505)", () => {
  const c = campo();
  try {
    const g = (...a) => c.git(...a);
    g("branch", "base"); // il punto da cui si guarda
    // Sul mio ramo: un lavoro qualsiasi.
    c.scrivi("cervello/terzo.mjs", 'export function t() {\n  return 1;\n}\n');
    g("add", "-A");
    g("commit", "-q", "-m", "lavoro mio", "--no-verify");
    // Sull'altro ramo: qualcun altro tocca LO STESSO file, così la fusione va in conflitto.
    g("checkout", "-q", "-b", "altro", "base");
    c.scrivi("cervello/terzo.mjs", 'export function t() {\n  return 2;\n}\n');
    g("add", "-A");
    g("commit", "-q", "-m", "lavoro altrui", "--no-verify");
    // Torno sul mio, unisco, risolvo, e nello STESSO commit scrivo la riga di esito.
    g("checkout", "-q", "lavoro");
    try {
      g("merge", "altro", "--no-edit");
    } catch {
      /* il conflitto è voluto: è il punto della prova */
    }
    c.scrivi("cervello/terzo.mjs", 'export function t() {\n  return 3;\n}\n');
    c.scrivi("memoria-squadra/tech.md", "# tech\n\n- 2026-08-04 06:00 · la fusione · scorecard · atteso X → reale Y · #tag\n");
    g("add", "-A");
    g("commit", "-q", "-m", "fusione con la riga di esito dentro", "--no-verify");

    const cerca = (...extra) =>
      execFileSync("git", ["log", "-1", "--format=%H", "-G", CERCA_ESITO_IN_GIT, ...extra, "base..HEAD", "--", "memoria-squadra"], {
        cwd: c.dir,
        encoding: "utf8",
        stdio: "pipe",
      }).trim();

    assert.equal(cerca(), "", "questa è la prova che parte ROSSA: senza il flag, git non vede dentro le fusioni");
    assert.notEqual(
      cerca(...ARGOMENTI_CERCA_ESITO.filter((a) => a.startsWith("--diff-merges"))),
      "",
      "col flag la riga si vede: chi risolve un conflitto e registra l'esito non è più muto",
    );
  } finally {
    c.pulisci();
  }
});

test("La cartella di scarto che resiste NON fa cadere il caso, e non sparisce in silenzio (AR-563)", () => {
  // Il guasto vero, in una riga: la cancellazione lancia. Sul runner era ENOTEMPTY dal filesystem a
  // strati; qui lo inietto, perché da root quell'errore non si fabbrica (provato) e una prova che
  // finge di riprodurre l'ambiente proverebbe la finzione.
  const detto = [];
  const esito = pulisciSenzaFarCadereIlCaso(
    "/tmp/una-cartella-qualsiasi",
    () => { const e = new Error("directory not empty"); e.code = "ENOTEMPTY"; throw e; },
    (m) => detto.push(m),
  );
  assert.equal(esito.rimossa, false, "l'esito dice che non è stata rimossa: non si racconta un successo");
  assert.equal(esito.codice, "ENOTEMPTY");
  assert.equal(detto.length, 1, "e lo dice: un fallimento ingoiato in silenzio è il difetto opposto");
  assert.match(detto[0], /il verdetto del caso non cambia/);
  // La prova che conta: NON è arrivata qui dentro un'eccezione. Prima di AR-563 questa riga non si
  // raggiungeva — la chiamata moriva nel `finally` e si portava dietro un caso con tutte le
  // asserzioni verdi.
});

test("Se invece la cartella si cancella, si dice che è andata — e senza rumore inutile (AR-563)", () => {
  const detto = [];
  const visti = [];
  const esito = pulisciSenzaFarCadereIlCaso("/tmp/x", (d, o) => visti.push({ d, o }), (m) => detto.push(m));
  assert.equal(esito.rimossa, true);
  assert.equal(detto.length, 0, "nessun avviso quando non c'è niente da segnalare");
  assert.equal(visti[0].o.recursive, true, "e la rimozione è quella vera: ricorsiva, con i tentativi");
  assert.ok(visti[0].o.maxRetries >= 1, "i tentativi restano: sono la prima cintura, tolta quella resta solo la seconda");
});
