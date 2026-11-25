// La porta corta dei senior (25/11, Nicola: «alleggerire la macchina»).
// Ogni sessione dell'AD carica la `description` di tutti i 120 senior: prima pesavano ~62 KB.
// Ora la description è una riga corta e lo smistamento sta nel corpo, sotto TITOLO_PORTA.
// Questa prova diventa rossa se una description torna lunga, se il paragrafo di smistamento
// sparisce (i guardiani dei confini resterebbero ciechi), o se portaDi smette di leggerlo.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { portaDi, TITOLO_PORTA } from "../porta-senior.mjs";
import { estraiDescription } from "../mandato-owner.mjs";
import { descrizioneDi } from "../deferral-agenti.mjs";

const AGENTS = join(dirname(fileURLToPath(import.meta.url)), "../../.claude/agents");
const schede = readdirSync(AGENTS).filter((f) => f.endsWith(".md")).map((f) => ({ f, t: readFileSync(join(AGENTS, f), "utf8") }));
const TETTO_BYTE = 180;
const descrizioneCorta = (t) => (t.match(/^---\n[\s\S]*?^description:\s*(.+)$/m) || [])[1] || "";

test("ogni senior ha una description corta (sotto il tetto) e senza rimandi", () => {
  const lunghe = schede.filter(({ t }) => Buffer.byteLength(descrizioneCorta(t)) > TETTO_BYTE).map(({ f }) => f);
  assert.deepEqual(lunghe, [], `description oltre ${TETTO_BYTE} byte: lo smistamento va sotto «${TITOLO_PORTA}»`);
  const conRimandi = schede.filter(({ t }) => /\(→|→ \*\*|Deferral|Delega qui per/i.test(descrizioneCorta(t))).map(({ f }) => f);
  assert.deepEqual(conRimandi, [], "rimandi e «Delega qui per» stanno nel corpo, non nel frontmatter");
});

test("ogni senior ha il paragrafo di smistamento, e i guardiani lo leggono", () => {
  const senza = schede.filter(({ t }) => !portaDi(t).startsWith("Usa ")).map(({ f }) => f);
  assert.deepEqual(senza, [], "senza porta nel corpo i guardiani dei confini non vedono nessun rimando");
  const security = schede.find(({ f }) => f === "security.md").t;
  assert.match(estraiDescription(security), /→/, "mandato-owner deve leggere i rimandi dalla porta");
  assert.match(descrizioneDi(security), /→/, "deferral-agenti deve leggere i rimandi dalla porta");
});

test("portaDi: legge il paragrafo, si ferma al titolo dopo, e torna vuoto se manca", () => {
  const t = `---\nname: x\ndescription: corta\n---\n\n${TITOLO_PORTA} (smistamento)\n\nUsa per x. (→ y = **z**)\n\n## Altro\ncorpo`;
  assert.equal(portaDi(t), "Usa per x. (→ y = **z**)");
  assert.equal(portaDi("---\nname: x\ndescription: corta\n---\ncorpo"), "");
  assert.equal(estraiDescription("---\nname: x\ndescription: Usa per vecchio\n---\ncorpo"), "Usa per vecchio", "senza porta vale ancora il frontmatter");
});
