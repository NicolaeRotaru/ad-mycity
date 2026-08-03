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

/** Un repo git con l'hook VERO, il cervello VERO e una storia da cui partire. */
function campo() {
  const d = mkdtempSync(join(tmpdir(), "mycity-campo-"));
  const git = (...a) => execFileSync("git", a, { cwd: d, encoding: "utf8", stdio: "pipe" });
  git("init", "-q", "-b", "lavoro"); // non `main`: il perimetro di main è un altro cancello, non questo
  git("config", "user.email", "test@mycity.local");
  git("config", "user.name", "test");
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
    pulisci: () => rmSync(d, { recursive: true, force: true }),
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
