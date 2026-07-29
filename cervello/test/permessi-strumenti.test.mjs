// AR-273 — il guardiano dei permessi non guardava gli strumenti collegati.
//
// Verificato sul file vero il 29/7: `permessi-check.mjs` conteneva ZERO occorrenze di `mcp__`,
// e fra i permessi concessi senza chiedere c'era `mcp__Supabase__execute_sql` — SQL arbitrario sul
// database. Non era una regola sbagliata: quel tipo di voce non veniva proprio guardato.
//
// Questi test ESEGUONO la classificazione sui nomi veri del repo, non cercano un pattern nel file.
// La differenza conta: la prova precedente di questo difetto era `{file, pattern, presente:false}`
// su `.claude/settings.json` — cioè misurava se Nicola avesse tolto la riga, non se la macchina
// sapesse accorgersene. Un difetto la cui prova dipende da un gesto umano non si chiude mai da solo.

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  classificaStrumento,
  eStrumentoCollegato,
  nomeStrumento,
  strumentiSospetti,
} from "../permessi-strumenti.mjs";
import { violazioni } from "../permessi-check.mjs";

test("riconosce le voci che sono strumenti collegati", () => {
  assert.equal(eStrumentoCollegato("mcp__Supabase__execute_sql"), true);
  assert.equal(eStrumentoCollegato("Bash(git status:*)"), false);
  assert.equal(eStrumentoCollegato("WebSearch"), false);
  assert.equal(nomeStrumento("mcp__github__create_pull_request"), "create_pull_request");
});

test("il verbo si trova anche quando NON sta in testa", () => {
  // È il caso che rompe il classificatore ingenuo: `pull_request_read` è di sola lettura ma comincia
  // con «pull». Guardare solo la prima parola sbagliava metà delle voci vere di questo repo.
  assert.equal(classificaStrumento("mcp__github__pull_request_read").tipo, "lettura");
  assert.equal(classificaStrumento("mcp__github__actions_list").tipo, "lettura");
  assert.equal(classificaStrumento("mcp__Supabase__execute_sql").tipo, "scrittura");
});

test("fra lettura e scrittura nello stesso nome vince la scrittura", () => {
  // `create_or_update_file` contiene anche parole innocue. Un classificatore che in caso di dubbio
  // assolve non è un cancello: qui deve vincere sempre il più pericoloso.
  assert.equal(classificaStrumento("mcp__github__create_or_update_file").tipo, "scrittura");
  assert.equal(classificaStrumento("mcp__github__get_or_create_branch").tipo, "scrittura");
});

test("una forma mai vista NON viene assolta: è sconosciuta, e sconosciuto è una violazione", () => {
  // Il fail-closed è il cuore del fix. La causa radice di AR-273 è «il controllo insegue, non copre»:
  // se una forma nuova passasse in silenzio, avremmo curato il punto e lasciato la malattia.
  const c = classificaStrumento("mcp__qualcosa__ping_pong");
  assert.equal(c.tipo, "sconosciuto");
  const fuori = strumentiSospetti(["mcp__qualcosa__ping_pong"], {});
  assert.equal(fuori.length, 1);
  assert.equal(fuori[0].tipo, "sconosciuto");
});

test("execute_sql concesso senza giustificazione è una violazione del guardiano", () => {
  // La prova che conta: non «il file contiene la stringa», ma «il guardiano lo BOCCIA».
  const v = violazioni(["mcp__Supabase__execute_sql"], [], undefined, {});
  const mia = v.filter((x) => x.regola === "strumenti-di-scrittura-non-automatici");
  assert.equal(mia.length, 1, "execute_sql doveva produrre esattamente 1 violazione");
  assert.equal(mia[0].tipo, "strumento-di-scrittura");
  assert.match(mia[0].perche, /AR-273/);
});

test("una giustificazione scritta toglie la violazione; una vuota NO", () => {
  // «Un'esenzione senza motivo è un silenzio» — il silenzio è esattamente ciò che questo cura.
  const conMotivo = strumentiSospetti(["mcp__github__create_pull_request"], {
    "mcp__github__create_pull_request": "aprire una PR è 🟡: non mergia.",
  });
  assert.deepEqual(conMotivo, []);

  const senzaMotivo = strumentiSospetti(["mcp__github__create_pull_request"], {
    "mcp__github__create_pull_request": "   ",
  });
  assert.equal(senzaMotivo.length, 1, "una giustificazione vuota deve valere come assente");
});

test("gli strumenti di sola lettura non danno mai fastidio", () => {
  const soloLettura = [
    "mcp__supabase-marketplace__list_tables",
    "mcp__supabase-marketplace__get_logs",
    "mcp__github__list_commits",
    "mcp__claude_ai_Vercel__get_deployment",
  ];
  assert.deepEqual(strumentiSospetti(soloLettura, {}), []);
});

test("le voci non-MCP restano affare delle regole d'oro, non di questa", () => {
  // Il modulo non deve invadere il perimetro esistente: `Bash(...)` e `Write(...)` hanno già le loro
  // regole, e due controlli che giudicano la stessa voce producono doppioni illeggibili.
  assert.deepEqual(strumentiSospetti(["Bash(curl:*)", "Write", "WebSearch"], {}), []);
});
