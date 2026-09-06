// 🧪 AR-812 — il cancello che autorizza la consegna non eseguiva le prove del Pannello.
//
// COME È SALTATO FUORI, e non cercandolo. La CI restava «in corso» da 21 minuti su un passo che ne
// prende 6. Andando a vedere cosa fosse cambiato ho lanciato a mano `cervello/test-pannello.mjs` —
// che è il modo in cui quelle prove girano davvero — e sono usciti DUE rossi:
//
//   ① la prova appena scritta leggeva un file partendo da `process.cwd()`, e il guardiano lancia i
//      test con la cartella di lavoro sulla RADICE del repo, non su `pannello/`. Da dentro
//      `pannello/` passava; lanciata come la lancia chi la lancia davvero, era rossa.
//   ② `store.sanitize.test.mts` passava da mesi e l'avevo rotta io: avevo importato il modulo nuovo
//      in `store.ts` con l'alias `@/lib/...`, che Node ESM non risolve. La riga SOPRA la mia, nello
//      stesso file, importa in modo relativo.
//
// E il cancello, per tutt'e due, aveva detto «SI PUÒ CONSEGNARE».
//
// Il guardiano `test-pannello.mjs` esisteva già — l'aveva costruito AR-156 per curare esattamente
// questo, prove che nessuno lanciava. Ma era montato su `round3-verifica.mjs`, cioè il GIRO, e
// negli altri due punti che lo nominano gira con `|| true`: non può fallire. Un cancello costruito
// bene su una porta da cui non si esce. La malattia di casa, applicata a sé stessa.
//
// PERCHÉ QUESTO CONTROLLO GUARDA IL MONTAGGIO E NON SOLO LE PROVE. Se qui ci fosse scritto solo
// «le 13 prove del Pannello passano», domani qualcuno potrebbe togliere la riga dal cancello e
// questo file resterebbe verde: il difetto tornerebbe con la sua stessa prova che dice di no. Il
// difetto NON è «le prove sono rosse»: è «il cancello non le guarda». Quindi si guarda quello.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { AD_ROOT } from "../git-github.mjs";

const cancello = readFileSync(join(AD_ROOT, "cervello/cancello-lotto.mjs"), "utf8");

test("il cancello monta le prove del Pannello fra i suoi passi", () => {
  // Non un commento che le nomina: la chiamata vera, con il file del guardiano.
  const senzaCommenti = cancello.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/[^\n]*$/gm, " ");
  assert.match(
    senzaCommenti,
    /esegui\(\s*"prove del Pannello"[\s\S]{0,200}test-pannello\.mjs/,
    "il cancello ha smesso di eseguire le prove del Pannello: torna a consegnare col Pannello rotto",
  );
});

test("e le esegue DAVVERO, non con un `|| true` che non può fallire", () => {
  // È la forma con cui giro.sh e round6-applica.mjs lo chiamano: gira, stampa, e non boccia mai.
  const riga = cancello.split("\n").find((r) => r.includes("prove del Pannello") && r.includes("esegui("));
  assert.ok(riga, "la riga che esegue le prove del Pannello non c'è più");
  assert.doesNotMatch(riga, /\|\|\s*true/, "un guardiano che non può fallire non è un guardiano");
});

test("…e non con un passo fatto a mano che nasce già «non fallito»", () => {
  // ⚠️ QUESTO CASO È NATO PERCHÉ LA SUA MUTAZIONE NON MORDEVA, il 1/9, dopo che una fusione con
  // main l'aveva riagganciata. Il caso qui sopra cerca la GRAFIA `|| true`; la proprietà però è
  // un'altra — «il passo deve poter BLOCCARE» — e ci sono altri modi di toglierla. Il più naturale
  // sta dieci righe più giù nel cancello stesso, nel ramo che gestisce l'ambiente incompleto:
  // un oggetto scritto a mano con `fallito: false`, che stampa e non boccia mai.
  //
  // Una prova che difende una grafia lascia passare la stessa bugia scritta in un altro modo.
  const blocco = cancello.slice(
    Math.max(0, cancello.indexOf('esegui("prove del Pannello"') - 200),
    cancello.indexOf('esegui("prove del Pannello"') + 300,
  );
  assert.ok(blocco.includes('esegui("prove del Pannello"'), "il passo non passa più da `esegui`");
  assert.doesNotMatch(blocco, /passi\.push\(\{[^}]*"prove del Pannello"/s,
    "il passo delle prove del Pannello è diventato un oggetto scritto a mano: quello nasce col `fallito` che gli si dà, e chi lo scrive può dargli `false`");
  assert.doesNotMatch(blocco, /"prove del Pannello"[\s\S]{0,300}?fallito:\s*false/,
    "al passo delle prove del Pannello è stato attaccato `fallito: false`: stampa e non boccia mai");
});

test("il guardiano dice NO quando una prova del Pannello non gira: exit diverso da zero", () => {
  // La metà comportamentale: che il cancello lo chiami serve solo se chiamarlo può bocciare.
  // Qui si esegue davvero, e si pretende che l'uscita sia un numero (0 = tutte passano).
  const r = spawnSync(process.execPath, [join(AD_ROOT, "cervello/test-pannello.mjs"), "--json"], {
    encoding: "utf8",
    cwd: AD_ROOT,
    timeout: 600_000,
  });
  assert.equal(typeof r.status, "number", "il guardiano non è nemmeno partito");
  const esito = JSON.parse(r.stdout);
  assert.ok(Array.isArray(esito.test) && esito.test.length > 0, "nessuna prova del Pannello trovata");
  // Il contratto che rende utile il montaggio: uno rotto ⇒ exit 1.
  const rotti = esito.test.filter((x) => x.esito !== "ok");
  assert.equal(
    r.status === 0,
    rotti.length === 0,
    `l'uscita non segue i rossi: status ${r.status} con ${rotti.length} rotti`,
  );
});
