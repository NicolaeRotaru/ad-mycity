// AR-185 / AR-583 / AR-586 / AR-130 — la prova che il guardiano dell'owner unico LEGGE DAVVERO il mandato.
//
// Storia: `keyword-owner-check.mjs` prendeva solo l'elenco fra virgolette del blocco «Delega qui per "…"»
// e buttava via la frase «Usa per …», cioè la parte in cui il mansionario dichiara di cosa risponde. Con
// quel taglio due senior potevano contendersi lo stesso lavoro col guardiano verde: crm-lifecycle e cro
// sul carrello abbandonato (AR-583), public-policy e consulente-lavoro sull'inquadramento dei rider
// (AR-586), security e trust-safety sulla protezione dei clienti (AR-130).
//
// Qui NON si cercano parole dentro il codice: si ESEGUE l'estrazione vera sui 120 mansionari reali e si
// rimette in scena il difetto storico togliendo il rimando appena aggiunto — se il guardiano tornasse
// cieco, quei conflitti non riapparirebbero e questi test diventerebbero rossi.

import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";

const QUI = dirname(fileURLToPath(import.meta.url));
const RADICE = join(QUI, "..", "..");
const AGENTI = join(RADICE, ".claude", "agents");

const { analizzaMandati, frasiDelMandato, separaDescription, estraiDescription, agentiRichiamati } =
  await import(join(QUI, "..", "mandato-owner.mjs"));

/** Le 120 schede vere, lette dal disco. */
function schedeReali() {
  return readdirSync(AGENTI)
    .filter((f) => f.endsWith(".md"))
    .map((f) => ({ nome: f.replace(/\.md$/, ""), testo: readFileSync(join(AGENTI, f), "utf8") }));
}

const REALI = schedeReali();
const descDi = (nome) => estraiDescription(REALI.find((s) => s.nome === nome).testo);

test("il mandato «Usa per …» viene letto: è la metà di scheda che il guardiano buttava via (AR-185)", () => {
  // crm-lifecycle dichiara il recupero carrelli NEL MANDATO, non fra le virgolette del blocco domande.
  const desc = descDi("crm-lifecycle");
  const { mandato, domande } = separaDescription(desc);
  assert.ok(mandato.includes("recupero carrelli abbandonati"), "il mandato deve contenere la rivendicazione vera");
  assert.ok(!domande.includes("recupero carrelli abbandonati"), "quella frase NON sta nel blocco virgolettato");

  const frasi = frasiDelMandato(desc).map((f) => f.testo);
  assert.ok(
    frasi.some((f) => f.includes("recupero carrelli abbandonati")),
    "l'estrazione deve restituire la frase del mandato, altrimenti il guardiano è cieco come prima"
  );
});

test("su tutte e 120 le schede vere si estraggono mandati: un verde per estrazione vuota sarebbe cecità", () => {
  const esito = analizzaMandati(REALI);
  assert.equal(esito.schede, 120, "le schede reali devono essere 120");
  assert.deepEqual(esito.senza_mandato, [], "ogni scheda deve avere almeno una frase di mandato leggibile");
  assert.ok(esito.frasi_mandato > 400, `frasi di mandato estratte: ${esito.frasi_mandato} (attese centinaia)`);
});

test("AR-583: tolto il rimando, crm-lifecycle e cro tornano a contendersi il carrello abbandonato", () => {
  // Oggi la contesa è chiusa da due parti: cro rimanda a crm-lifecycle per il recupero, e crm-lifecycle
  // rimanda a cro per la conversione on-site. Per rimettere in scena il difetto vanno tolte entrambe.
  const senzaRimando = REALI.map((s) => {
    if (s.nome === "cro") return { ...s, testo: s.testo.replace(/\s*\(→ recupero dei carrelli abbandonati[^)]*\)/, "") };
    if (s.nome === "crm-lifecycle") return { ...s, testo: s.testo.replace(/\s*\(→ conversione on-site[^)]*\)/, "") };
    return s;
  });
  const conflitti = analizzaMandati(senzaRimando).conflitti;
  const coppia = conflitti.find((c) => c.a === "crm-lifecycle" && c.b === "cro");
  assert.ok(coppia, "senza deferral il doppione DEVE emergere: era il difetto AR-583");
  assert.ok(coppia.temi.some((t) => t.tema.includes("carrell")), "il tema conteso è il carrello abbandonato");

  // con il rimando rimesso (lo stato vero del repo) il conflitto non c'è più
  assert.ok(
    !analizzaMandati(REALI).conflitti.some((c) => c.a === "crm-lifecycle" && c.b === "cro"),
    "col deferral scritto in cro il conflitto è risolto"
  );
});

test("AR-586: tolto il rimando, public-policy si riprende l'inquadramento dei rider di consulente-lavoro", () => {
  const senzaRimando = REALI.map((s) =>
    s.nome === "public-policy"
      ? { ...s, testo: s.testo.replace(/;\s*inquadramento operativo dei rider[^)]*(?=\))/, "") }
      : s
  );
  const coppia = analizzaMandati(senzaRimando).conflitti.find(
    (c) => c.a === "consulente-lavoro" && c.b === "public-policy"
  );
  assert.ok(coppia, "senza deferral il doppione DEVE emergere: era il difetto AR-586");
  assert.ok(coppia.temi.some((t) => t.tema.includes("rider")), "il tema conteso riguarda i rider");
});

test("AR-130: tolto il rimando, security e trust-safety si contendono la protezione dei clienti", () => {
  // Anche qui il confine è dichiarato da entrambi (trust-safety → security e security → trust-safety):
  // il difetto storico era che NESSUNO dei due lo diceva.
  const senzaRimando = REALI.map((s) => {
    if (s.nome === "trust-safety")
      return { ...s, testo: s.testo.replace(/;\s*\(→ protezione tecnica dei dati dei clienti[^)]*\)/, "") };
    if (s.nome === "security") return { ...s, testo: s.testo.replace(/\s*\(→ monitoraggio, incidenti[^)]*\)/, "") };
    return s;
  });
  const coppia = analizzaMandati(senzaRimando).conflitti.find(
    (c) => c.a === "security" && c.b === "trust-safety"
  );
  assert.ok(coppia, "il generalista senza deferral verso lo specialista DEVE emergere: era AR-130");
});

test("il deferral vale fra i DUE in causa, non basta che qualcun altro lo abbia scritto (AR-185b)", () => {
  // Due schede si contendono un mandato; una terza, estranea, cita il tema in un rimando suo.
  const scheda = (nome, desc) => ({ nome, testo: `---\nname: ${nome}\ndescription: ${desc}\n---\ncorpo` });
  const contese = [
    scheda("alfa", "Usa per il ritiro delle ceste di vimini invendute."),
    scheda("beta", "Usa per il ritiro delle ceste di vimini a fine giornata."),
    scheda("gamma", "Usa per altro. (→ ritiro delle ceste di vimini = **alfa**)"),
  ];
  const conflitti = analizzaMandati(contese).conflitti;
  assert.ok(
    conflitti.some((c) => c.a === "alfa" && c.b === "beta"),
    "il rimando scritto da gamma non risolve la contesa fra alfa e beta"
  );

  // se è BETA a rimandare ad alfa, la contesa è chiusa
  const risolte = [contese[0], scheda("beta", "Usa per il ritiro delle ceste di vimini a fine giornata. (→ ceste invendute = **alfa**)"), contese[2]];
  assert.deepEqual(analizzaMandati(risolte).conflitti, [], "col rimando fra i due in causa il conflitto sparisce");
});

test("il contesto d'azienda non fonda una contesa: due schede che nominano MyCity non sono un doppione", () => {
  const scheda = (nome, desc) => ({ nome, testo: `---\nname: ${nome}\ndescription: ${desc}\n---\ncorpo` });
  const r = analizzaMandati([
    scheda("uno", "Usa per far entrare un negozio nuovo su MyCity."),
    scheda("due", "Usa per il volantino cartaceo dei negozi MyCity."),
  ]);
  assert.deepEqual(r.conflitti, [], "parole di contesto (MyCity, negozi) da sole non sono un mandato conteso");
});

test("il guardiano vero, lanciato sui 120 file, esce verde e dichiara quanto ha misurato", () => {
  const r = spawnSync("node", [join(QUI, "..", "keyword-owner-check.mjs"), "--json"], { encoding: "utf8" });
  const out = JSON.parse(r.stdout);
  assert.equal(r.status, 0, `il gate deve essere verde. Conflitti: ${JSON.stringify(out.conflitti)}`);
  assert.equal(out.agenti, 120);
  assert.ok(out.frasi_mandato > 400, "il JSON deve dichiarare le frasi misurate, non solo 'ok'");
  assert.deepEqual(out.conflitti, []);
});
