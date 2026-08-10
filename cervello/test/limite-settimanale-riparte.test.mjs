#!/usr/bin/env node
// 🧪 «Claude ha raggiunto il limite settimanale e la macchina si è fermata» (Nicola, 2026-08-10).
//
// Cosa prova, e perché proprio questo:
//   ① la TESTA — `retry-policy.mjs` distingue il limite SETTIMANALE dalla finestra rolling di 5h, e
//      calcola un ritentativo a GIORNI invece che a minuti. Era il difetto vero: il tetto delle 6h
//      valeva per tutte le quote, quindi un muro di sette giorni veniva trattato come un intoppo di
//      un quarto d'ora, sei tentativi bruciati in poche ore e poi stop definitivo.
//   ② il PONTE — `errore-motore.mjs` scrive il perché in memoria, ripulito dai segreti. Senza, da
//      fuori si vede «motore-fallito» e nient'altro (undici giorni per capire cos'era).
//   ③ la VEGLIA — `sentinella-motore.mjs` non bussa prima del reset, non bussa troppo spesso, e
//      quando il motore torna recupera solo le cadenze che ha ancora senso rifare.
//   ④ la SPAZZATA DEI FRATELLI — giro · ritmo · monitora devono TUTTI avere il recupero. È la
//      clausola che era stata saltata: il recupero esisteva dal giorno di AR-024, ma solo in ritmo.sh.
//      Senza ④ questo lotto chiuderebbe il sintomo su una copia e lo lascerebbe aperto sulle altre due.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { classificaErrore, dataDaTesto, decidiRitento, MAX_ATTESA_QUOTA_MS } from "../retry-policy.mjs";
import { codaPulita, registra, ripulisci, spiegazioneUmana } from "../errore-motore.mjs";
import { cadenzeDaRiprendere, decidiSonda } from "../sentinella-motore.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const CERVELLO = join(QUI, "..");
const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: e.message });
  }
};

// Il messaggio vero che Claude stampa quando il pacchetto settimanale è finito.
const SETTIMANALE = "Claude usage limit reached. You've reached your weekly limit · resets Aug 14 at 9am (Europe/Rome)";
const ROLLING = "You've hit your session limit · resets 9:30pm (Europe/Rome)";
const ORA = new Date("2026-08-10T06:30:00+02:00").getTime();

// ─────────────────────────── ① LA TESTA ───────────────────────────
prova("il limite settimanale NON viene scambiato per la finestra di 5 ore", () => {
  assert.equal(classificaErrore(SETTIMANALE).classe, "quota_settimanale");
  assert.equal(classificaErrore(ROLLING).classe, "quota", "la rolling deve restare com'era: niente regressioni");
});

prova("legge la data di reset scritta per esteso, non solo l'ora", () => {
  const ms = dataDaTesto("resets Aug 14 at 9am", ORA);
  assert.ok(ms, "Aug 14 at 9am deve dare un istante");
  const d = new Date(ms);
  assert.equal(d.getDate(), 14);
  assert.equal(d.getMonth(), 7, "agosto");
  assert.equal(d.getHours(), 9);
  assert.ok(dataDaTesto("resets in 3 days", ORA) > ORA + 2.9 * 86400000, "«in 3 days» va letto");
  assert.ok(dataDaTesto("resets on 2026-08-14", ORA), "la forma ISO va letta");
  assert.equal(dataDaTesto("nessuna data qui dentro", ORA), null, "senza data si dice null, non si inventa");
});

prova("IL DIFETTO: il ritentativo cade fra GIORNI, non fra minuti", () => {
  const d = decidiRitento({ tipo: "monitora", tentativi: 0, risultato: SETTIMANALE, nowMs: ORA });
  assert.equal(d.azione, "ritenta");
  const attesaMs = Date.parse(d.quandoISO) - ORA;
  assert.ok(
    attesaMs > MAX_ATTESA_QUOTA_MS,
    `l'attesa (${Math.round(attesaMs / 3600000)}h) deve superare il tetto della finestra rolling (6h): è il bug che si sta chiudendo`
  );
  assert.ok(attesaMs < 9 * 86400000, "ma non deve nemmeno sparare a due settimane");
});

prova("senza data dichiarata ricontrolla ogni 6h invece di arrendersi", () => {
  const d = decidiRitento({ tipo: "giro", tentativi: 0, risultato: "You have reached your weekly limit.", nowMs: ORA });
  assert.equal(d.azione, "ritenta");
  const ore = (Date.parse(d.quandoISO) - ORA) / 3600000;
  assert.ok(ore > 5 && ore < 7, `atteso ~6h, ottenuto ${ore}h`);
});

prova("la pazienza dura giorni: non si esaurisce dopo 6 tentativi", () => {
  const d = decidiRitento({ tipo: "monitora", tentativi: 7, risultato: SETTIMANALE, nowMs: ORA });
  assert.equal(d.azione, "ritenta", "col vecchio tetto di 6 tentativi qui la macchina si arrendeva");
});

prova("un limite settimanale è comunque prova che il motore non è partito → sicuro anche per le azioni 🔴", () => {
  const d = decidiRitento({ tipo: "esegui-azione", tentativi: 0, risultato: SETTIMANALE, nowMs: ORA });
  assert.equal(d.azione, "ritenta", "zero rischio doppio-invio: il motore non ha girato affatto");
});

// ─────────────────────────── ② IL PONTE ───────────────────────────
prova("i segreti non finiscono su GitHub", () => {
  const sporco = [
    "https://x-access-token:ghp_REALEREALEREALE@github.com/x/y.git",
    "ANTHROPIC_API_KEY=sk-ant-abcdefghijklmnop",
    "apikey: sbp_0123456789abcdef",
  ].join("\n");
  const pulito = ripulisci(sporco);
  for (const segreto of ["ghp_REALEREALEREALE", "sk-ant-abcdefghijklmnop", "sbp_0123456789abcdef"]) {
    assert.ok(!pulito.includes(segreto), `«${segreto}» è ancora nel testo che finirebbe pubblicato`);
  }
});

prova("tiene le ultime righe utili e butta le vuote", () => {
  const righe = codaPulita("a\n\n\nb\nc\n", 2);
  assert.deepEqual(righe, ["b", "c"]);
});

prova("il guasto si spiega in italiano, senza far decifrare niente", () => {
  const f = spiegazioneUmana({ classe: "quota_settimanale", resetDataISO: "2026-08-14T07:00:00.000Z" });
  assert.ok(/settimanale/i.test(f), "deve dire che è il pacchetto settimanale");
  assert.ok(/riparte da sola/i.test(f), "deve dire se riparte da sola: è la domanda che uno si fa");
  const auth = spiegazioneUmana({ classe: "auth" });
  assert.ok(/NON si aggiusta da solo/i.test(auth), "il caso che richiede una mano umana va detto chiaro");
});

prova("il guasto registrato è leggibile e dice quando riparte", () => {
  const tmp = mkdtempSync(join(tmpdir(), "errmot-"));
  try {
    const path = join(tmp, "motore-errori.json");
    const voce = registra({ cadenza: "monitora", rc: 1, testo: SETTIMANALE, nowMs: ORA, path });
    assert.equal(voce.classe, "quota_settimanale");
    assert.equal(voce.riparte_da_sola, true);
    assert.ok(voce.ritento_previsto, "senza ritento_previsto la sentinella non sa quando svegliarsi");
    const salvato = JSON.parse(readFileSync(path, "utf8"));
    assert.equal(salvato.voci.length, 1);
    // Un secondo guasto non cancella il primo: l'anello serve a vedere se il guasto si ripete.
    registra({ cadenza: "giro", rc: 1, testo: ROLLING, nowMs: ORA + 60000, path });
    assert.equal(JSON.parse(readFileSync(path, "utf8")).voci.length, 2);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

// ─────────────────────────── ③ LA VEGLIA ───────────────────────────
prova("non bussa a una porta che sa chiusa", () => {
  const d = decidiSonda({
    ultimoGuasto: { classe: "quota_settimanale", ritento_previsto: new Date(ORA + 3 * 86400000).toISOString() },
    nowMs: ORA,
  });
  assert.equal(d.azione, "riposo", "sondare prima del reset è solo rumore");
});

prova("dopo il reset prova davvero", () => {
  const d = decidiSonda({
    ultimoGuasto: { classe: "quota_settimanale", ritento_previsto: new Date(ORA - 60000).toISOString() },
    nowMs: ORA,
  });
  assert.equal(d.azione, "sonda");
});

prova("non insiste più di una volta ogni 15 minuti", () => {
  const d = decidiSonda({
    ultimoGuasto: { classe: "quota_settimanale", ritento_previsto: new Date(ORA - 86400000).toISOString() },
    ultimaSonda: new Date(ORA - 5 * 60000).toISOString(),
    nowMs: ORA,
  });
  assert.equal(d.azione, "riposo", "è il freno che tiene leggera una veglia che gira ogni 5 minuti");
});

prova("un guasto di credenziali non fa svegliare nessuno: serve una mano umana", () => {
  const d = decidiSonda({ ultimoGuasto: { classe: "auth", ritento_previsto: null }, nowMs: ORA });
  assert.equal(d.azione, "riposo");
});

prova("recupera solo le cadenze che ha ancora senso rifare", () => {
  const esiti = {
    cadenze: {
      monitora: { quando: "2026-08-10 06:30", esito: "motore-fallito" },
      giro: { quando: "2026-08-08 06:20", esito: "motore-fallito" }, // 2 giorni fa: troppo vecchio
    },
  };
  const da = cadenzeDaRiprendere(esiti, ORA);
  const tipi = da.map((c) => c.tipo);
  assert.ok(tipi.includes("monitora"), "il monitoraggio di stamattina va recuperato");
  assert.ok(!tipi.includes("giro"), "un giro di due giorni fa non si recupera: è lavoro doppio, non recupero");
});

prova("una cadenza andata BENE non viene rifatta", () => {
  const esiti = { cadenze: { monitora: { quando: "2026-08-10 06:30", esito: "ok" } } };
  assert.equal(cadenzeDaRiprendere(esiti, ORA).length, 0);
});

// ────────────────── ④ LA SPAZZATA DEI TRE FRATELLI ──────────────────
// Il punto che rende questo lotto diverso da una pezza: il recupero non deve esistere solo dove il
// sintomo è stato visto. Si legge il codice vero dei tre copioni, non la memoria di chi ha scritto.
prova("giro · ritmo · monitora hanno TUTTI il recupero della cadenza", () => {
  for (const f of ["giro.sh", "monitora.sh", "ritmo.sh"]) {
    const src = readFileSync(join(CERVELLO, f), "utf8");
    assert.ok(
      /cadenza_recupero\s/.test(src),
      `${f} non chiama cadenza_recupero: col motore in limite resta fermo fino al timer successivo (il difetto di partenza)`
    );
  }
});

prova("il recupero vive in UNA casa sola, non in tre copie", () => {
  const lib = readFileSync(join(CERVELLO, "lib-cadenza.sh"), "utf8");
  assert.ok(/^cadenza_recupero\(\)/m.test(lib), "la funzione deve stare in lib-cadenza.sh");
  const ritmo = readFileSync(join(CERVELLO, "ritmo.sh"), "utf8");
  assert.ok(
    !/curl -fsS -X POST "\$SUPABASE_URL\/rest\/v1\/lavori"/.test(ritmo),
    "ritmo.sh ha ancora la sua copia della POST: la terza copia della stessa catena è la causa di sistema, non il rimedio"
  );
});

prova("il guasto viene registrato da tutte e tre le strade", () => {
  const lib = readFileSync(join(CERVELLO, "lib-cadenza.sh"), "utf8");
  assert.ok(/errore-motore\.mjs/.test(lib), "cadenza_ai_run (usata da ritmo e monitora) deve registrare il guasto");
  const giro = readFileSync(join(CERVELLO, "giro.sh"), "utf8");
  assert.ok(/errore-motore\.mjs/.test(giro), "il giro ha un ciclo suo: gli serve la chiamata esplicita");
});

prova("la sonda del motore è installata sul VPS, non solo scritta", () => {
  const inst = readFileSync(join(CERVELLO, "vps/install-ritmo-timers.sh"), "utf8");
  for (const unit of ["mycity-sentinella-motore.service", "mycity-sentinella-motore.timer"]) {
    assert.ok(inst.includes(unit), `${unit} non viene copiata: resterebbe un file nel repo e basta`);
  }
  const righeAvvio = inst.split("\n").filter((r) => r.startsWith("systemctl enable") || r.startsWith("systemctl start"));
  for (const r of righeAvvio) {
    assert.ok(r.includes("mycity-sentinella-motore.timer"), "copiata ma non abilitata = installata e mai partita");
  }
});

// La CLI deve funzionare per davvero: è quella che chiamano gli script bash.
prova("la CLI `decidi` risponde al bash come si aspetta", () => {
  const out = execFileSync("node", [join(CERVELLO, "retry-policy.mjs"), "decidi"], {
    encoding: "utf8",
    env: { ...process.env, RP_TIPO: "monitora", RP_TENTATIVI: "0", RP_RISULTATO: SETTIMANALE },
  });
  const j = JSON.parse(out);
  assert.equal(j.azione, "ritenta");
  assert.equal(j.classe, "quota_settimanale");
  assert.ok(j.quandoISO, "il bash legge .quandoISO per riprova_dopo");
});

// ─────────────────────────── esito ───────────────────────────
const rotti = casi.filter((c) => !c.ok);
for (const c of casi) console.log(`${c.ok ? "✅" : "❌"} ${c.nome}${c.ok ? "" : `\n   ↳ ${c.err}`}`);
console.log(`\n${casi.length - rotti.length}/${casi.length} prove passate.`);
process.exit(rotti.length ? 1 : 0);
