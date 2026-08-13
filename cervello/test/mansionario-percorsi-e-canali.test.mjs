// AR-349 / AR-188 / AR-585 / AR-130 — le tre cose che il registro degli agenti non guardava.
//
// · AR-349: sette mansionari mandavano il senior a leggere `MyCity-Vault/02-Aree/Area - Consegna.md`,
//   una cartella che non esiste più. Nessun controllo apriva i percorsi citati DENTRO una scheda, perché
//   il mansionario era trattato come prosa per il modello invece che come configurazione eseguibile.
// · AR-188 / AR-585: la copertura era letta da un lato solo («ogni agente ha un mandato?») e mai
//   dall'altro («ogni canale verso clienti e negozianti ha un padrone?»): la consegnabilità della posta
//   e il filo WhatsApp col negoziante non erano di nessuno.
// · AR-130: otto capifila (security, legale-privacy, operations, …) non avevano un solo deferral nella
//   propria description, mentre i loro specialisti li citavano: chi leggeva la scheda del generalista
//   non sapeva che sotto c'era uno specialista.
//
// Le prove ESEGUONO le funzioni vere sui 120 mansionari reali e rimettono in scena i difetti storici.

import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, join, basename } from "node:path";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";

const QUI = dirname(fileURLToPath(import.meta.url));
const RADICE = join(QUI, "..", "..");
const AGENTI = join(RADICE, ".claude", "agents");

const { percorsiCitati, percorsiMorti, canaliVersoPersone, canaliSenzaOwner, capifilaMuti, estraiDescription } =
  await import(join(QUI, "..", "mandato-owner.mjs"));

const REALI = readdirSync(AGENTI)
  .filter((f) => f.endsWith(".md"))
  .map((f) => ({ nome: f.replace(/\.md$/, ""), testo: readFileSync(join(AGENTI, f), "utf8") }));

// Il risolutore vero: come lo fa il guardiano — indice dei file dal repo, non un elenco scritto a mano.
const tracciati = execFileSync("git", ["ls-files"], { cwd: RADICE, encoding: "utf8" }).split("\n").filter(Boolean);
const perBasename = new Map();
for (const f of tracciati) {
  const b = basename(f);
  if (!perBasename.has(b)) perBasename.set(b, []);
  perBasename.get(b).push(f);
}
const risolvi = (p) =>
  existsSync(join(RADICE, p)) || (perBasename.get(basename(p)) || []).some((f) => f === p || f.endsWith("/" + p));

test("percorsiCitati riconosce i file citati e lascia stare comandi e segnaposto", () => {
  const t = "leggi `MyCity-Vault/00-Index.md`, lancia `node cervello/salute.mjs`, scrivi `Briefing/AAAA-MM-GG.md` e `consegne/**/*.md`";
  const p = percorsiCitati(t);
  assert.ok(p.includes("MyCity-Vault/00-Index.md"), "il percorso citato va estratto");
  assert.ok(p.includes("cervello/salute.mjs"), "da un comando si estrae il file, non l'intera riga");
  assert.ok(!p.some((x) => x.includes("AAAA")), "i segnaposto di data non sono percorsi");
  assert.ok(!p.some((x) => x.includes("*")), "i glob non sono percorsi");
});

test("AR-349: nessuno dei 120 mansionari manda più a una cartella che non esiste", () => {
  const morti = percorsiMorti(REALI, risolvi);
  assert.deepEqual(morti, [], `percorsi morti ancora presenti: ${JSON.stringify(morti)}`);
});

test("AR-349 canarino: rimesso il percorso vecchio, il controllo lo becca di nuovo", () => {
  const conIlVecchio = REALI.map((s) =>
    s.nome === "dispatch"
      ? { ...s, testo: s.testo.replace("MyCity-Vault/04-Prodotto-Ops/Aree/Area - Consegna.md", "02-Aree/Area - Consegna.md") }
      : s
  );
  const morti = percorsiMorti(conIlVecchio, risolvi);
  assert.ok(
    morti.some((m) => m.agente === "dispatch" && m.percorso.includes("02-Aree")),
    "il percorso della vecchia cartella DEVE risultare morto: era il difetto AR-349"
  );
});

test("AR-188 / AR-585: i canali verso clienti e negozianti si leggono da azioni.md e hanno tutti un padrone", () => {
  const azioni = readFileSync(join(RADICE, "cervello", "azioni.md"), "utf8");
  const canali = canaliVersoPersone(azioni);
  const chiavi = canali.map((c) => c.chiave);
  assert.ok(chiavi.includes("email"), "la posta è un canale verso le persone");
  assert.ok(chiavi.includes("whatsapp"), "WhatsApp è un canale verso le persone");

  const descriptions = new Map(REALI.map((s) => [s.nome, estraiDescription(s.testo)]));
  assert.deepEqual(
    canaliSenzaOwner(canali, descriptions),
    [],
    "nessun canale verso clienti/negozianti deve restare senza un senior che lo reclami"
  );
});

test("AR-585 canarino: tolto il WhatsApp dal mandato di account-negozi, il canale torna orfano", () => {
  const azioni = readFileSync(join(RADICE, "cervello", "azioni.md"), "utf8");
  const canali = canaliVersoPersone(azioni);
  const descriptions = new Map(
    REALI.map((s) => [
      s.nome,
      estraiDescription(s.testo).replace(/WhatsApp/gi, "canale"), // simula lo stato di ieri: nessuno lo nomina
    ])
  );
  const orfani = canaliSenzaOwner(canali, descriptions);
  assert.ok(
    orfani.some((o) => o.chiave === "whatsapp"),
    "senza nessuna scheda che nomini WhatsApp il canale DEVE risultare senza padrone: era AR-585"
  );
});

test("AR-130: nessun capofila resta muto — chi riceve rimandi dichiara anche i suoi", () => {
  assert.deepEqual(
    capifilaMuti(REALI),
    [],
    "un senior a cui due o più specialisti rimandano deve dichiarare almeno un confine nella sua description"
  );
});

test("AR-130 canarino: tolti i rimandi a security, torna il capofila muto", () => {
  const senzaRimandi = REALI.map((s) =>
    s.nome === "security" ? { ...s, testo: s.testo.replace(/\s*\(→[^)]*\)/g, "") } : s
  );
  assert.ok(
    capifilaMuti(senzaRimandi).includes("security"),
    "security riceve rimandi da 6 specialisti: senza deferral propri DEVE emergere come capofila muto"
  );
});

test("il guardiano del registro, lanciato davvero, esce verde e pubblica i tre campi nuovi", () => {
  const r = spawnSync("node", [join(QUI, "..", "agent-registry-check.mjs"), "--json"], { encoding: "utf8" });
  const out = JSON.parse(r.stdout);
  assert.ok(Array.isArray(out.percorsi_morti), "il JSON deve dichiarare i percorsi morti misurati");
  assert.ok(Array.isArray(out.canali_senza_owner), "il JSON deve dichiarare i canali senza owner");
  assert.ok(Array.isArray(out.generalisti_muti), "il JSON deve dichiarare i capifila muti");
  assert.equal(out.drift_totale, 0, `drift residuo: ${JSON.stringify(out).slice(0, 800)}`);
  assert.equal(r.status, 0);
});
