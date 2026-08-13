#!/usr/bin/env node
// AR-337 — «gli occhi della macchina riscrivono i numeri del business anche quando non hanno
// potuto leggerli».
//
// `sentinella-dati.mjs` scriveva `ultimo_stato` — ordini totali, ordini 24h, pagati senza payout,
// recensioni basse — a ogni tick, anche senza MARKETPLACE_SUPABASE_URL/KEY. Senza chiavi quei campi
// valgono `null`, e il file condiviso (quello che il Pannello mostra a Nicola) perdeva i numeri che
// il VPS aveva misurato davvero. Una sessione cieca cancellava il lavoro di una vedente.
//
// PERCHÉ NON BASTAVA LA GUARDIA GIÀ ESISTENTE (AR-281, «se non puoi misurare non scrivere»): lo
// STESSO file tiene due generi di stato. Uno si MISURA DA FUORI (i numeri del business), l'altro la
// sentinella lo RICORDA DI SÉ — `tick`, `regole`, `accodati_ts`, `accodati_giorno`: è la memoria
// anti-doppione che le impedisce di ri-accodare le stesse card a ogni tick. Bloccare tutta la
// scrittura avrebbe curato una bugia creandone una peggiore.
//
// Questa prova tiene ferme tutte e tre le cose insieme, perché ognuna da sola si può soddisfare
// rompendo le altre due:
//   ① i numeri misurati da fuori SOPRAVVIVONO a un giro cieco;
//   ② la memoria di sé si scrive lo stesso (o torna il doppione);
//   ③ quando le chiavi CI SONO i numeri si aggiornano davvero (o il file resta congelato per
//      sempre, che è il modo di far invecchiare un dato mentre si crede di proteggerlo).

import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { conservaSeCieco, MARCA_NON_MISURATO } from "../misura-o-cieco.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const SENTINELLA = join(REPO, "cervello/sentinella-dati.mjs");

const casi = [];
const prova = async (nome, fn) => {
  try {
    await fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

// ── Un finto PostgREST: conta 99 di qualunque cosa, e per il resto risponde vuoto ──
// In un PROCESSO A PARTE, e non è un dettaglio: la sentinella la lanciamo con `spawnSync`, che
// blocca il ciclo di eventi di chi la chiama. Un server nello stesso processo non riuscirebbe mai a
// rispondere, e il test resterebbe appeso fino al timeout credendo di misurare qualcosa.
function fintoPostgrest() {
  const src = `
    import { createServer } from "node:http";
    const srv = createServer((req, res) => {
      res.setHeader("content-type", "application/json");
      if ((req.headers.prefer || "").includes("count=exact")) res.setHeader("content-range", "0-0/99");
      res.end("[]");
    });
    srv.listen(0, "127.0.0.1", () => console.log(srv.address().port));
  `;
  const srv = spawn(process.execPath, ["--input-type=module", "-e", src], { stdio: ["ignore", "pipe", "inherit"] });
  return new Promise((ok, ko) => {
    const t = setTimeout(() => ko(new Error("il finto PostgREST non è partito")), 10_000);
    srv.stdout.once("data", (b) => {
      clearTimeout(t);
      ok({ srv, url: `http://127.0.0.1:${Number(String(b).trim())}` });
    });
  });
}
const { srv: server, url: FINTO } = await fintoPostgrest();

// Lo stato che il VPS ha misurato davvero, e che una sessione cieca non deve toccare.
const MISURATO_DAL_VPS = {
  quando: "2026-08-12 22:00",
  dati_leggibili: true,
  ordini_tot: 37, ordini_24h: 4, pagati_senza_payout: 2,
  recensioni_basse: 1, negozi_fermi: 3, carrelli: 5,
  worker_eta_min: 9, sensori_max_ciechi: 0, salute_voto: 7,
  radiografia_gg: 1, volano_tasso: 0.5,
};
// La memoria di sé: se sparisce, la sentinella ri-accoda le stesse card a ogni tick.
const MEMORIA_DI_SE = {
  regole: { sensori_ciechi: { ultima_firma: "cieco", ultimo_accodato: "2026-08-12 22:00", ultimo_accodato_iso: new Date().toISOString(), colore: "🟡" } },
  accodati_giorno: { giorno: "2026-08-12", n: 3 },
  accodati_ts: [new Date().toISOString()],
  ultima_recensione_vista: "2026-08-10T00:00:00.000Z",
  tick: 41,
  storia: [{ quando: "2026-08-12 22:00", eventi: 1, accodati: 1, allertati: 0 }],
};

const dir = mkdtempSync(join(tmpdir(), "ar337-"));

/** Fa girare la sentinella vera su uno stato finto, in dry-run, con l'ambiente che decidiamo noi. */
function gira({ conChiaviMarketplace }) {
  const statoFile = join(dir, `stato-${conChiaviMarketplace ? "vedente" : "cieco"}.json`);
  writeFileSync(statoFile, JSON.stringify({ aggiornato: "2026-08-12 22:00", ultimo_stato: MISURATO_DAL_VPS, ...MEMORIA_DI_SE }, null, 2));
  const env = {
    ...process.env,
    SENTINELLA_DATI_STATE_FILE: statoFile,
    SUPABASE_URL: FINTO,               // la memoria: c'è sempre, o la sentinella non parte proprio
    SUPABASE_SERVICE_KEY: "finta-di-prova",
    // La sentinella lancia `tick-auto-coscienza-leggero.mjs`, che riscrive apprendimento.json e
    // auto-miglioramento.json nel vault VERO. Una prova che sporca la memoria condivisa ogni volta
    // che gira è una prova che nessuno vorrà più lanciare: la soglia altissima fa saltare il tick
    // per throttle, senza toccare niente.
    TICK_COSCIENZA_MIN: "999999",
    // Le chiavi del marketplace sono LA variabile dell'esperimento. Stringa vuota e non `delete`:
    // `git-github.mjs` carica cervello/vps/.env all'import e riempie solo le chiavi assenti — con
    // `delete` il figlio se le ritroverebbe dal file e girerebbe CON le chiavi credendo di no.
    MARKETPLACE_SUPABASE_URL: conChiaviMarketplace ? FINTO : "",
    MARKETPLACE_SUPABASE_KEY: conChiaviMarketplace ? "finta-di-prova" : "",
  };
  const r = spawnSync(process.execPath, [SENTINELLA, "--json"], { cwd: REPO, encoding: "utf8", env, timeout: 120_000 });
  return { rc: r.status, out: `${r.stdout || ""}${r.stderr || ""}`, stato: JSON.parse(readFileSync(statoFile, "utf8")) };
}

// ── La decisione, eseguita da sola ───────────────────────────────────────────
await prova("chi non ha misurato tiene il valore di chi aveva misurato, e lo dichiara", () => {
  const dopo = conservaSeCieco(
    { ordini_tot: 37, carrelli: 5 },
    { ordini_tot: null, carrelli: null, tick_locale: "fresco" },
    { misurato: false, campi: ["ordini_tot", "carrelli"], quando: "2026-08-13 09:00", motivo: "niente chiavi" },
  );
  assert.equal(dopo.ordini_tot, 37, "il numero misurato da chi poteva vedere è stato cancellato");
  assert.equal(dopo.carrelli, 5);
  assert.equal(dopo.tick_locale, "fresco", "ciò che si sa anche da ciechi deve continuare ad aggiornarsi");
  assert.match(dopo[MARCA_NON_MISURATO], /niente chiavi/, "un valore conservato senza la marca è un valore vecchio spacciato per fresco");
});

await prova("e chi ha misurato davvero riprende il comando, marca compresa", () => {
  const dopo = conservaSeCieco(
    { ordini_tot: 37, [MARCA_NON_MISURATO]: "ieri: ero cieco" },
    { ordini_tot: 41 },
    { misurato: true, campi: ["ordini_tot"], quando: "2026-08-13 09:00", motivo: "" },
  );
  assert.equal(dopo.ordini_tot, 41, "una guardia che non si riapre congela il file per sempre");
  assert.equal(dopo[MARCA_NON_MISURATO], undefined, "la marca del cieco deve sparire quando qualcuno guarda di nuovo");
});

// ── Il comando vero, cieco ───────────────────────────────────────────────────
let cieco;
await prova("giro CIECO: i numeri del business del VPS sono ancora lì dopo la scrittura", () => {
  cieco = gira({ conChiaviMarketplace: false });
  assert.equal(cieco.rc, 0, `la sentinella non è arrivata in fondo:\n${cieco.out.slice(0, 500)}`);
  const u = cieco.stato.ultimo_stato;
  assert.equal(u.ordini_tot, 37, "37 ordini misurati dal VPS sono diventati altro dopo un giro senza chiavi");
  assert.equal(u.ordini_24h, 4);
  assert.equal(u.pagati_senza_payout, 2);
  assert.equal(u.recensioni_basse, 1);
  assert.equal(u.carrelli, 5);
  assert.equal(u.dati_leggibili, true, "«non li vedo da qui» non è «gli occhi sono ciechi»: sono due cose diverse");
  assert.match(String(u[MARCA_NON_MISURATO]), /MARKETPLACE_SUPABASE/, "il dato conservato deve dire da sé che non è stato misurato qui");
});

await prova("giro CIECO: la memoria di sé si è scritta lo stesso (o tornano i doppioni)", () => {
  const s = cieco.stato;
  assert.equal(s.tick, 42, "il tick non è avanzato: la scrittura è stata bloccata in blocco, ed è la cura peggiore della malattia");
  assert.deepEqual(s.regole, MEMORIA_DI_SE.regole, "il dedup per-regola è stato perso: la stessa card verrà riaccodata");
  assert.deepEqual(s.accodati_ts, MEMORIA_DI_SE.accodati_ts, "il tetto orario ha perso la memoria di cosa è già partito");
  assert.deepEqual(s.accodati_giorno, MEMORIA_DI_SE.accodati_giorno, "il tetto giornaliero ha perso il conto");
  assert.ok(Array.isArray(s.storia) && s.storia.length >= 2, "la storia deve continuare a crescere");
});

// ── Il comando vero, vedente ─────────────────────────────────────────────────
await prova("giro VEDENTE: i numeri si aggiornano davvero e la marca sparisce", () => {
  const v = gira({ conChiaviMarketplace: true });
  assert.equal(v.rc, 0, `la sentinella non è arrivata in fondo:\n${v.out.slice(0, 500)}`);
  const u = v.stato.ultimo_stato;
  assert.equal(u.ordini_tot, 99, `chi ha le chiavi deve poter scrivere il numero nuovo (letto: ${u.ordini_tot})`);
  assert.equal(u[MARCA_NON_MISURATO], undefined, "con le chiavi presenti la marca del cieco non ha più ragione di stare lì");
});

server.kill();
rmSync(dir, { recursive: true, force: true });

let ko = 0;
for (const c of casi) {
  console.log(`  ${c.ok ? "ok" : "NOT ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) ko++;
}
console.log(`# pass ${casi.length - ko}\n# fail ${ko}`);
process.exit(ko ? 1 : 0);
