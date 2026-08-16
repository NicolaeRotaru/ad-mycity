#!/usr/bin/env node
// AR-568 · AR-464 · AR-446 · AR-286 · AR-639 — LA SOLA LETTURA CHE SCRIVE, seconda metà.
//
// Il lotto precedente ha messo il freno sul DATO (`cervello/casa-memoria.mjs`, attraversato da
// `cervello/scrivi-json.mjs`) invece che dentro ogni script. Giusto — ma un freno vale solo per chi
// ci passa, e quattro penne di casa non ci passavano affatto:
//
//   · `coerenza-fatti.mjs`      scriveva il REGISTRO DEI FATTI con un `writeFileSync` crudo;
//   · `stampo-check.mjs`        scriveva il suo stato allo stesso modo;
//   · `sensori-spenti-check.mjs` infilava una card nella coda delle approvazioni allo stesso modo;
//   · `verifica-sensori.mjs`    passava da `stato-sensori.mjs`, la cui penna di default è cruda.
//
// Misurato qui il 15/8 prima del fix, eseguendolo: con `MYCITY_MEMORIA_SOLA_LETTURA=1` e il
// contenuto cambiato, `stampo-check.mjs` ha riscritto il file VERO lo stesso. Il freno c'era e non
// passava di lì: è la stessa forma di AR-668 — la porta che non si è vista.
//
// Le due domande che questi casi fanno, e sono diverse fra loro:
//   ① la penna passa dal freno? (la memoria vera non si muove quando la corsa è deviata)
//   ② il freno regge da solo? (una misura più povera non prende il posto di una più ricca, e la
//      regola sta sul dato — la eredita chiunque scriva, non solo chi si è ricordato di scriverla)
//
// PERCHÉ QUESTO FILE NON SPORCA LA MEMORIA VERA: ogni caso che lancia uno script gli devia la radice
// e poi CONFRONTA l'impronta della memoria vera prima e dopo. Se un giorno la memoria si muove, il
// caso diventa rosso invece di lasciare un diff a chi verrà dopo.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { fileMemoriaDaLeggere } from "../casa-memoria.mjs";
import { scriviJsonAtomico } from "../scrivi-json.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const casi = [];
const prova = (nome, fn) => {
  try { fn(); casi.push({ nome, ok: true }); }
  catch (e) { casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] }); }
};

const sabbiera = mkdtempSync(join(tmpdir(), "sola-lettura-"));
const nuovaSab = (nome) => {
  const d = join(sabbiera, nome);
  mkdirSync(d, { recursive: true });
  return d;
};

/** Si giudica l'EFFETTO sul disco, non il codice d'uscita: un guardiano cieco esce 2 e non è un guasto. */
const node = (args, env = {}) => {
  const r = spawnSync(process.execPath, args, {
    cwd: REPO, encoding: "utf8", maxBuffer: 32 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, ...env },
  });
  return { uscita: r.status, testo: `${r.stdout || ""}`, errore: `${r.stderr || ""}` };
};

/** L'impronta di un file della memoria vera: il contenuto, o «assente». */
const impronta = (rel) => {
  try { return readFileSync(join(REPO, rel), "utf8"); } catch { return "assente"; }
};

/**
 * LA RETE DI SICUREZZA, e non è la mitigazione criticata da AR-446.
 *
 * Sulla strada VERDE qui non si scrive niente nella memoria vera: è proprio ciò che i casi
 * affermano. La rete serve alla strada ROTTA — la prova di non-vacuità, che smonta il freno apposta
 * e rilancia. Senza, rompere il fix per verificare che il test diventi rosso riscriverebbe davvero il
 * registro dei fatti e la coda delle approvazioni: la malattia riprodotta dentro la sua stessa cura,
 * ogni volta che qualcuno passa il metro sul metro.
 *
 * Rimette com'era ciò che si è mosso, e CANCELLA ciò che è comparso dal nulla.
 */
function conLaMemoriaAlSicuro(relativi, lavoro) {
  const prima = new Map(relativi.map((f) => [f, impronta(f)]));
  try {
    lavoro();
  } finally {
    for (const f of relativi) {
      const adesso = impronta(f);
      if (adesso === prima.get(f)) continue;
      if (prima.get(f) === "assente") rmSync(join(REPO, f), { force: true });
      else writeFileSync(join(REPO, f), prima.get(f), "utf8");
    }
  }
}

// ── ① LE QUATTRO PENNE ───────────────────────────────────────────────────────

const REL_CECITA = "MyCity-Vault/90-Memoria-AI/auto-coscienza/sensori-cecita.json";


prova("① AR-568 · con una chiave sola la misura dei sensori si scrive, ma non sopra quella vera", () => {
  // È lo scenario esatto della scheda: una sessione che vede quasi niente decide comunque di
  // scrivere il quadro dei sensori. La guardia d'ambiente (AR-035) qui NON la ferma — basta una
  // chiave su dieci per aprirle la porta — quindi questo caso misura davvero la penna e non un
  // rifiuto arrivato prima. La chiave è finta e l'indirizzo non esiste: il sensore risulta cieco,
  // che è appunto la misura povera contro cui AR-568 protegge.
  const sab = nuovaSab("sensori");
  // ⚠️ LA SABBIERA RESTA VUOTA, ed è il punto. Il 16/8 questi due casi sono diventati rossi senza che
  // una riga di codice cambiasse: il server aveva scritto una misura più ricca, e la guardia «cieco
  // non sovrascrive vedente» la leggeva dal file VERO mentre la scrittura andava in sabbiera —
  // giudicava un file che non avrebbe toccato. La cura è nel codice (il lettore che conosce la
  // deviazione, in verifica-sensori.mjs), non qui: seminare un precedente finto avrebbe nascosto il
  // difetto e smussato la mutazione, che senza sabbiera vuota resta verde col fix rotto.
  const prima = impronta(REL_CECITA);
  let dopo;
  conLaMemoriaAlSicuro([REL_CECITA], () => {
    node(["cervello/verifica-sensori.mjs"], {
      MYCITY_MEMORIA_ROOT: sab,
      MARKETPLACE_SUPABASE_URL: "https://esempio.invalid",
      MARKETPLACE_SUPABASE_KEY: "finta",
    });
    dopo = impronta(REL_CECITA);
  });
  assert.equal(dopo, prima,
    "la memoria dei sensori VERA si è mossa: la penna non passa dal freno (AR-568)");
  assert.ok(existsSync(join(sab, REL_CECITA)),
    "e non ha scritto nemmeno nella sabbiera: allora questo caso non sta misurando la deviazione, sta misurando un rifiuto");
});

prova("② AR-286 · e la misura che ha scritto dice da dove veniva e quanto aveva visto", () => {
  const sab = nuovaSab("timbro");
  conLaMemoriaAlSicuro([REL_CECITA], () => {
    node(["cervello/verifica-sensori.mjs"], {
      MYCITY_MEMORIA_ROOT: sab,
      MARKETPLACE_SUPABASE_URL: "https://esempio.invalid",
      MARKETPLACE_SUPABASE_KEY: "finta",
    });
  });
  const scritta = JSON.parse(readFileSync(join(sab, REL_CECITA), "utf8"));
  assert.ok(scritta.origine, "senza provenienza una misura e un residuo sono la stessa riga");
  assert.equal(typeof scritta.copertura, "number", "senza copertura la regola «cieco non sovrascrive vedente» non è nemmeno scrivibile");
  assert.equal(scritta.scritto_da, "verifica-sensori.mjs", "quattro programmi scrivono in quella cartella: serve sapere quale");
});

prova("③ AR-446 · il registro dei fatti VERO non si tocca nemmeno quando il comando è «registra»", () => {
  // La fonte unica della verità (AR-102). Prima passava da un `writeFileSync` crudo: nessun freno la
  // attraversava, e una prova che esercitava questo comando riscriveva il registro vero — per giunta
  // senza atomicità, quindi un crash a metà lo lasciava monco.
  const sab = nuovaSab("fatti");
  const rel = "MyCity-Vault/90-Memoria-AI/registro-fatti.json";
  const prima = impronta(rel);
  let r, dopo;
  conLaMemoriaAlSicuro([rel], () => {
    r = node(["cervello/coerenza-fatti.mjs", "registra", "prova.lotto44.sola-lettura", "valore di prova", "--nuovo", "--fonte=prova automatica"], {
      MYCITY_MEMORIA_ROOT: sab,
    });
    dopo = impronta(rel);
  });
  assert.equal(dopo, prima,
    `il registro dei fatti VERO è cambiato: ${(r.errore || r.testo).slice(0, 160)}`);
  const finito = join(sab, rel);
  assert.ok(existsSync(finito), "e non è finito nemmeno nella sabbiera: il comando non ha scritto affatto, quindi il caso non misura la deviazione");
  assert.ok(JSON.parse(readFileSync(finito, "utf8")).fatti.some((f) => f.id === "prova.lotto44.sola-lettura"),
    "il fatto nuovo deve esserci: deviare non vuol dire perdere il lavoro");
});

prova("④ AR-464 · il guardiano dello stampo scrive nella sabbiera, non nel suo stato vero", () => {
  // La baseline vuota gli fa vedere tutto il parco come «nuovo»: così il contenuto CAMBIA davvero e
  // la scrittura parte. Senza questo, la regola «non riscrivo se è cambiata solo l'ora» fermerebbe
  // tutto prima della penna, e il caso resterebbe verde anche col freno smontato.
  const sab = nuovaSab("stampo");
  const baseline = join(sab, "baseline-vuota.json");
  writeFileSync(baseline, "{}\n");
  const rel = "MyCity-Vault/90-Memoria-AI/auto-coscienza/stampo-check.json";
  const prima = impronta(rel);
  let dopo;
  conLaMemoriaAlSicuro([rel], () => {
    node(["cervello/stampo-check.mjs"], { MYCITY_MEMORIA_ROOT: sab, STAMPO_BASELINE: baseline });
    dopo = impronta(rel);
  });
  assert.equal(dopo, prima, "lo stato VERO si è mosso: verificare torna a costare un diff (AR-464)");
  assert.ok(existsSync(join(sab, rel)), "e non ha scritto nemmeno nella sabbiera: allora non ha scritto affatto e il caso non misura niente");
});

prova("⑤ AR-568 · una card non si infila nella coda vera solo perché un guardiano ha girato", () => {
  // La coda delle approvazioni è il file che Nicola legge nel Pannello: una card comparsa perché
  // qualcuno stava verificando è peggio di un diff, è una domanda finta.
  const sab = nuovaSab("coda");
  const relCoda = "MyCity-Vault/90-Memoria-AI/prova-coda-sensori.md";
  writeFileSync(join(sab, "cecita.json"), JSON.stringify({ sensori: { finto_sensore: { stato: "non_configurato", dettaglio: "CHIAVE_FINTA assente" } }, meta: {} }));
  writeFileSync(join(sab, "motivi.json"), JSON.stringify({ motivi: {} }));
  let comparsa;
  conLaMemoriaAlSicuro([relCoda], () => {
    node(["cervello/sensori-spenti-check.mjs", "--accoda"], {
      MYCITY_MEMORIA_ROOT: sab,
      SENSORI_CECITA_FILE: join(sab, "cecita.json"),
      SENSORI_MOTIVI_FILE: join(sab, "motivi.json"),
      SENSORI_CODA_FILE: relCoda,
    });
    comparsa = existsSync(join(REPO, relCoda));
  });
  assert.equal(comparsa, false,
    "la card è comparsa nella memoria vera: la penna della coda non passa dal freno");
  assert.ok(existsSync(join(sab, relCoda)),
    "e non è comparsa nemmeno nella sabbiera: il guardiano non ha accodato niente, quindi il caso non misura la deviazione");
});

prova("⑥ AR-464 · leggere il report della calibrazione non costa un diff", () => {
  // Trovato eseguendo, non leggendo: un `report --json` — un comando di LETTURA — faceva comparire il
  // registro delle previsioni in `git status`. L'unica riga diversa era `aggiornato`.
  const rel = "MyCity-Vault/90-Memoria-AI/auto-coscienza/calibrazione.json";
  const prima = impronta(rel);
  assert.notEqual(prima, "assente", "il registro vero non c'è: questo caso non sta guardando niente");
  let dopo;
  conLaMemoriaAlSicuro([rel], () => {
    node(["cervello/calibrazione.mjs", "report", "--json"]);
    dopo = impronta(rel);
  });
  assert.equal(dopo, prima, "il registro si è mosso solo perché qualcuno l'ha letto (AR-464)");
});

// ── ② IL FRENO SUL DATO, che non dipende da chi scrive ───────────────────────

prova("⑦ AR-568 · cieco non sovrascrive vedente, e la regola sta sulla PENNA non nel comando", () => {
  // La clausola esisteva dentro `verifica-sensori.mjs`, cioè proteggeva un file solo. Qui vale per
  // chiunque passi dallo scrittore condiviso: il prezzo di ammissione è il timbro di provenienza.
  const f = join(sabbiera, "misura.json");
  writeFileSync(f, JSON.stringify({ origine: "vps", copertura: 18, quota: 100 }, null, 2) + "\n");
  const esito = scriviJsonAtomico(f, { origine: "cloud", copertura: 2, quota: 50 }, {});
  assert.equal(esito, null, "una misura più povera da un altro punto d'osservazione non deve entrare");
  assert.equal(JSON.parse(readFileSync(f, "utf8")).copertura, 18,
    "il numero buono è sparito: un voto che migliora perché si è misurato di meno è una bugia");
});

prova("⑧ AR-568 · un calo visto dallo STESSO posto è una notizia e deve entrare", () => {
  const f = join(sabbiera, "calo.json");
  writeFileSync(f, JSON.stringify({ origine: "vps", copertura: 18 }, null, 2) + "\n");
  assert.ok(scriviJsonAtomico(f, { origine: "vps", copertura: 4 }, {}),
    "senza questa riga un guasto vero non entrerebbe più e la memoria resterebbe all'ultimo giorno buono");
  assert.equal(JSON.parse(readFileSync(f, "utf8")).copertura, 4);
});

prova("⑨ il freno non si allarga: un documento senza timbro si scrive come sempre", () => {
  // Registri, code, cantieri: non sono misure e non dichiarano provenienza. Un freno che scattasse
  // anche lì si imparerebbe a spegnere, ed è la cosa che questo cantiere cura.
  const f = join(sabbiera, "registro.json");
  writeFileSync(f, JSON.stringify({ voci: [1, 2, 3] }, null, 2) + "\n");
  assert.ok(scriviJsonAtomico(f, { voci: [1] }, {}), "un documento senza `origine` non va giudicato sulla copertura");
  assert.deepEqual(JSON.parse(readFileSync(f, "utf8")).voci, [1]);
});

// ── ③ LA LETTURA, che è la metà che mancava (AR-446) ─────────────────────────

prova("⑩ AR-446 · si legge dalla sabbiera se c'è la copia, dalla memoria vera se non c'è", () => {
  const radice = "/casa/repo";
  const rel = "MyCity-Vault/90-Memoria-AI/registro-fatti.json";
  const vero = join(radice, rel);

  assert.equal(fileMemoriaDaLeggere(vero, { env: {}, radice, esiste: () => true }), vero,
    "senza radice deviata si legge la memoria vera: leggere non sporca nessuno");

  assert.equal(
    fileMemoriaDaLeggere(vero, { env: { MYCITY_MEMORIA_ROOT: "/tmp/sab" }, radice, esiste: () => true }),
    join("/tmp/sab", rel),
    "con la copia nella sabbiera si legge quella: è il mondo che la prova ha preparato");

  assert.equal(
    fileMemoriaDaLeggere(vero, { env: { MYCITY_MEMORIA_ROOT: "/tmp/sab" }, radice, esiste: () => false }),
    vero,
    "senza la copia si torna alla memoria vera: una sabbiera è un banco di prova, non un mondo vuoto");

  assert.equal(
    fileMemoriaDaLeggere(vero, { env: { MYCITY_MEMORIA_SOLA_LETTURA: "1" }, radice, esiste: () => false }),
    vero,
    "la sola lettura ferma la penna, non gli occhi");
});

prova("⑪ AR-446 · il TETTO: quante prove scrivono ancora nella memoria vera", () => {
  // Il numero è un tetto: scende quando si cura e non si alza mai. Chi resta è elencato per nome,
  // così «ne restano due» non diventa «ne resta un po'».
  //
  // Si guarda il percorso costruito sulla radice del REPO: una prova che si fabbrica un albero finto
  // in `/tmp` non è in questa famiglia, ed è anzi la cura.
  // Misurato il 2026-08-15 sul codice vero, dopo la cura di previsione-banale-dai-dati. Chi resta è
  // `previsione-aperta-prima.test.mjs`, e resta per un motivo dichiarato: guida `chiusura-loop.mjs`,
  // che il percorso di lettura se lo calcola da sé — quel file è di un'altra corsia.
  const TETTO = 1;
  const dir = join(REPO, "cervello/test");
  const colpevoli = readdirSync(dir)
    .filter((f) => f.endsWith(".test.mjs"))
    .filter((f) => {
      const t = readFileSync(join(dir, f), "utf8");
      // Una casa della memoria calcolata sulla radice del repo, e una penna nello stesso file.
      const casa = /=\s*join\((?:REPO|AD_ROOT|RADICE)[^)]*(?:MyCity-Vault|memoria-squadra)/.test(t);
      return casa && /\b(writeFileSync|appendFileSync|rmSync)\s*\(\s*(?:CAL|P|F|CODA|CANTIERE|VERO|MEM|QUADERNO)\b/.test(t);
    });
  assert.ok(colpevoli.length <= TETTO,
    `prove che scrivono nella memoria vera: ${colpevoli.length} > tetto ${TETTO}. Sono: ${colpevoli.join(", ")}`);
});

// ── il conto ────────────────────────────────────────────────────────────────
rmSync(sabbiera, { recursive: true, force: true });
for (const c of casi) console.log(`  ${c.ok ? "✓" : "✗"} ${c.nome}${c.ok ? "" : ` → ${c.err}`}`);
const rossi = casi.filter((c) => !c.ok).length;
console.log(`\n# pass ${casi.length - rossi}\n# fail ${rossi}`);
process.exit(rossi ? 1 : 0);
