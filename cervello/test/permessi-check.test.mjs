// AR-142 — test del guardiano dei permessi di sessione (node --test, nessun I/O).
//
// Il difetto originale elencava 5 permessi troppo larghi. Ricontrollandoli il 25/7 nel repo cloud ne
// restava UNO (curl senza dominio) — ma quella misura era PARZIALE: nella sessione cloud
// `.claude/settings.local.json` non esiste, mentre sul VPS sì, con 33 allow e ZERO deny, e contiene
// tutti i permessi contestati. È il guardiano stesso ad averlo scoperto al primo giro sul VPS.
// Morale registrata qui perché non si ripeta: un permesso non si giudica dal file che si ha sotto
// mano, ma da TUTTI i file che l'ambiente vero carica.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { violazioni, analizza, neutralizzato, REGOLE } from "../permessi-check.mjs";

// Il set "sano" minimo: nessun allow proibito, tutti i deny richiesti presenti.
const DENY_OK = [
  "Bash(git push:*)",
  "Read(**/.env)",
  "Edit(./.claude/settings.json)",
];

test("un set pulito non produce violazioni", () => {
  // AR-206 (28/7): «Bash(node cervello/*.mjs:*)» NON è più un permesso pulito e non può stare qui.
  // Era il jolly su una cartella che la macchina stessa può SCRIVERE: non un permesso su un elenco di
  // programmi, ma su «qualunque programma io decida di scrivere lì dentro». Al suo posto la forma
  // sicura: UN programma preciso, argomenti liberi.
  const allow = ["Bash(git status:*)", "Bash(node cervello/auto-fix.mjs:*)", "Write(consegne/**)"];
  assert.deepEqual(violazioni(allow, DENY_OK), []);
});

test("becca i permessi troppo larghi, uno per uno", () => {
  const casi = [
    ["Bash(git push origin main)", "no-push-diretto"],
    ["Bash(git merge:*)", "no-merge-generico"],
    ["Write", "write-con-path"],
    ["Write(*)", "write-con-path"],
    ["Bash(node /tmp/x.mjs:*)", "no-esecuzione-da-tmp"],
    ["Bash(curl:*)", "curl-limitato"],
  ];
  for (const [voce, regola] of casi) {
    // Deny vuoto di proposito: qui si prova che la regola RICONOSCE il permesso largo. Con un deny
    // che lo copre già il verdetto è diverso — ed è giusto che lo sia: vedi i test su neutralizzato().
    const v = violazioni([voce], []).filter((x) => x.tipo === "allow-troppo-largo");
    assert.equal(v.length, 1, `"${voce}" doveva produrre 1 violazione, ne ha prodotte ${v.length}`);
    assert.equal(v[0].regola, regola);
    assert.ok(v[0].perche.length > 20, "ogni violazione deve dire PERCHÉ, non solo che");
  }
});

test("un curl ristretto a un dominio è ammesso", () => {
  // La regola vieta il jolly, non curl in sé: bloccare tutto renderebbe il guardiano inutilizzabile.
  assert.deepEqual(violazioni(["Bash(curl https://api.resend.com:*)"], DENY_OK), []);
});

test("segnala i DIVIETI mancanti, non solo i permessi di troppo", () => {
  // Un deny assente è pericoloso quanto un allow largo: senza Read(**/.env) le chiavi sono leggibili.
  // È anche il caso del settings.local.json del VPS: 33 allow e ZERO deny.
  const v = violazioni([], []);
  const regole = v.map((x) => x.regola).sort();
  assert.deepEqual(regole, ["no-auto-permessi", "no-push-diretto", "segreti-illeggibili"]);
  assert.ok(v.every((x) => x.tipo === "deny-mancante"));
});

test("ogni regola dichiara la fonte del proprio perché", () => {
  for (const r of REGOLE) {
    assert.ok(r.id && r.perche, `regola senza id/perché: ${JSON.stringify(r)}`);
    assert.ok(r.vieta || r.deve_negare, `regola ${r.id} non controlla nulla`);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Il file VERO di QUESTO repo. Attenzione: qui `.claude/settings.local.json` non esiste, quindi
// questa prova copre solo metà della realtà del VPS. La verità completa la dice il guardiano
// lanciato nell'ambiente vero, ed è per questo che la prova di AR-142 nel cantiere è il COMANDO,
// non un pattern su un file.
// Il residuo che al 25/7 era ancora aperto qui. È un TETTO, non un valore atteso: la prova chiede che
// non compaia niente di NUOVO, non che questo resti.
// Le violazioni che restano perché la correzione è di NICOLA: `.claude/settings.json` è negato in
// Edit/Write alla macchina, apposta — è il file che decide cosa la macchina può eseguire, e un
// guardiano che potesse ripararlo da sé non sarebbe un guardiano.
//   · curl-limitato        — storico
//   · no-push-diretto      — manca `"Bash(git push:*)"` nel deny
//   · no-jolly-…           — AR-206 (28/7): `Bash(node cervello/*.mjs:*)` e `Bash(bash cervello/*.sh:*)`
// Sono un ELENCO ATTESO, non un obiettivo: quando Nicola le sistema il test resta verde (il filtro è
// un sottoinsieme, non un'uguaglianza — lezione del 25/7: un test che punisce chi risolve il
// problema insegna a non risolverlo).
const RESIDUO_NOTO = ["curl-limitato", "no-push-diretto", "no-jolly-su-cartella-scrivibile"];

test("i permessi reali di questo repo non peggiorano oltre il residuo noto", () => {
  const j = JSON.parse(readFileSync(new URL("../../.claude/settings.json", import.meta.url), "utf8"));
  const p = j.permissions || {};
  const v = violazioni(p.allow || [], p.deny || []);
  const nuove = v.filter((x) => !RESIDUO_NOTO.includes(x.regola));
  // CORREZIONE (2026-07-25 05:05). Qui c'era un `deepEqual(ids, ["curl-limitato"])`, cioè una
  // fotografia. Nicola ha tolto `Bash(curl:*)` — ha fatto ESATTAMENTE la cosa giusta, è il gesto che
  // ha chiuso AR-142 — e il test è diventato rosso per quello: pretendeva che la violazione ci FOSSE
  // ancora. Un test che punisce chi risolve il problema è peggio di nessun test, perché insegna a
  // non risolverlo.
  // E il titolo diceva già la verità: «non peggiorano OLTRE il residuo noto». Sbagliato era
  // l'operatore, non l'intenzione: serve un sottoinsieme, non un'uguaglianza.
  // Nota pratica: questo file vive nel repo, quindi la copia cloud e quella del VPS restano diverse
  // finché il worker non pubblica — un test a fotografia sarebbe rosso da una parte o dall'altra
  // per tutto quell'intervallo, senza che nulla sia rotto.
  assert.deepEqual(nuove, [], `violazioni NUOVE, fuori dal residuo noto: ${JSON.stringify(nuove, null, 1)}`);
});

// ─────────────────────────────────────────────────────────────────────────────
// I DUE ERRORI DI PROGETTO del guardiano, corretti il 25/7. Nascono entrambi dallo stesso fatto:
// allow e deny dei due file SI SOMMANO, e il deny vince sempre. Giudicare un file per volta è
// quindi sbagliato in tutte e due le direzioni. Sul VPS produceva 11 violazioni, alcune inesistenti,
// e avrebbe mandato Nicola a togliere righe innocue dai permessi.

test("neutralizzato(): un permesso già coperto da un divieto non concede nulla", () => {
  const deny = ["Bash(git push:*)"];
  assert.equal(neutralizzato("Bash(git push origin main:*)", deny), true, "il deny copre il prefisso");
  assert.equal(neutralizzato("Bash(git push)", deny), true);
  assert.equal(neutralizzato("Bash(git merge:*)", deny), false, "altro comando: scoperto");
  assert.equal(neutralizzato("Write(**)", deny), false, "altro strumento: scoperto");
  // Il confine dev'essere a fine parola, altrimenti un divieto coprirebbe comandi che non c'entrano.
  assert.equal(neutralizzato("Bash(git pushx:*)", deny), false, "`git pushx` non è `git push`");
});

test("un divieto scritto in un file vale anche per i permessi dell'altro", () => {
  // L'ERRORE N°1: i divieti venivano cercati file per file. `settings.local.json` sul VPS ha 33
  // allow e ZERO deny propri — e il guardiano gridava «manca il divieto» tre volte, mentre i
  // divieti c'erano tutti in settings.json, che vale anche lì.
  const r = analizza([
    { file: ".claude/settings.json", allow: [], deny: DENY_OK },
    { file: ".claude/settings.local.json", allow: ["Bash(git status:*)"], deny: [] },
  ]);
  assert.deepEqual(r.violazioni, [], `divieti fantasma: ${JSON.stringify(r.violazioni, null, 1)}`);
});

test("un permesso largo nel file locale, già murato dal divieto condiviso, è inerte e non violazione", () => {
  // L'ERRORE N°2: `Bash(git push origin main:*)` nel file del VPS veniva contato come violazione.
  // Ma settings.json nega `Bash(git push:*)`, e il deny vince: quel permesso non apre niente.
  // Con la versione vecchia avrei fatto togliere a Nicola una riga innocua spacciandola per pericolo.
  const r = analizza([
    { file: ".claude/settings.json", allow: [], deny: DENY_OK },
    { file: ".claude/settings.local.json", allow: ["Bash(git push origin main:*)", "Bash(curl:*)"], deny: [] },
  ]);
  assert.deepEqual(r.violazioni.map((v) => v.regola), ["curl-limitato"], "solo curl è davvero scoperto");
  assert.deepEqual(r.inerti.map((v) => v.voce), ["Bash(git push origin main:*)"]);
  assert.equal(r.inerti[0].tipo, "allow-inerte");
});

test("un permesso largo NON coperto resta una violazione anche nel file locale", () => {
  // Il guardiano non deve diventare accomodante: senza un divieto che lo copra, il permesso apre
  // davvero una porta, e il file in cui è scritto non c'entra.
  const r = analizza([
    { file: ".claude/settings.json", allow: [], deny: DENY_OK },
    { file: ".claude/settings.local.json", allow: ["Bash(git merge:*)", "Write"], deny: [] },
  ]);
  assert.deepEqual(r.violazioni.map((v) => v.regola).sort(), ["no-merge-generico", "write-con-path"]);
  assert.ok(r.violazioni.every((v) => v.file === ".claude/settings.local.json"), "dice in quale file sta");
});

// ─────────────────────────────────────────────────────────────────────────────
// Round 4 — la prova a COMANDO: questo guardiano È la prova di AR-142.
// Serviva perché il difetto non è esprimibile come file+pattern: `git push` compare sia fra i
// permessi sia fra i divieti, e una regex sul testo grezzo non li distingue.
import { eseguiProvaComando } from "../auto-fix.mjs";

test("prova a comando: l'esito segue l'exit code del guardiano", () => {
  const finto = (esito) => () => ({ status: esito });
  assert.equal(eseguiProvaComando("node cervello/permessi-check.mjs", finto(0)).esito, "risolto");
  assert.equal(eseguiProvaComando("node cervello/permessi-check.mjs", finto(1)).esito, "aperto");
  assert.equal(eseguiProvaComando("node cervello/x.mjs --gate", finto(0)).esito, "risolto", "i flag sono ammessi");
});

test("prova a comando: si eseguono SOLO i guardiani del repo, mai una shell", () => {
  // Un difetto non deve poter far girare qualcosa di arbitrario per dichiararsi risolto.
  // Il runner finto ESPLODE se invocato: se un comando proibito passasse il filtro, il test rompe.
  const mai = () => { throw new Error("non doveva essere eseguito"); };
  for (const c of ["rm -rf /", 'bash -c "x"', "node /tmp/evil.mjs", "node ../fuori.mjs", "node cervello/x.mjs; rm -rf /", "", null]) {
    assert.equal(eseguiProvaComando(c, mai).esito, "manuale", `doveva rifiutare: ${JSON.stringify(c)}`);
  }
});
