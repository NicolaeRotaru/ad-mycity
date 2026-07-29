#!/usr/bin/env node
// Prova la TESTA CONDIVISA delle tre cadenze (cervello/esito-cadenza.mjs) ESEGUENDOLA su casi
// concreti — non cercando un pattern nel codice.
//
// Copre: AR-162 (timeout derivato dal budget) · AR-163/AR-313/AR-166 (l'esito è un dato, e le tre
// cadenze usano UNA testa sola) · AR-302 (il motore non si spegne mentre i cancelli sono rossi) ·
// AR-164 (la cadenza che smette di uscire si vede) · AR-201 (si CHIEDE alla retry-policy).
//
// Il caso che conta di più è la PARITÀ: la nuova testa deve rispondere esattamente come
// `esito_giro_rc` di cervello/giro-esito.sh su TUTTA la tabella di verità. È la difesa contro il
// ritorno della malattia — non «ho copiato bene», ma «non possono più divergere senza diventare
// rosse». Se domani qualcuno corregge una delle due e non l'altra, questo test lo dice.
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import assert from "node:assert/strict";
import {
  timeoutPerTentativo,
  budgetRispettato,
  esitoCadenza,
  motoreSaltabile,
  cadenzeStantie,
  vaChiestaLaPolicy,
  giaFattaDiRecente,
  ritentaSecondoPolicy,
  TENTATIVI_DEFAULT,
  PAUSA_DEFAULT_SEC,
  CADENZE,
} from "../esito-cadenza.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const GIRO_ESITO_SH = join(QUI, "..", "giro-esito.sh");

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: e.message });
  }
};

/** Esegue la funzione bash VERA del giro, per il confronto di parità. */
function rcDelGiro({ memoriaIncoerente = 0, hadChanges = 1, pushOk = 1, aiRc = 0, gateRossi = 0, nonConsegnati = 0 }) {
  const out = execFileSync(
    "bash",
    [
      "-c",
      `. "${GIRO_ESITO_SH}"; esito_giro_rc ${memoriaIncoerente} ${hadChanges} ${pushOk} ${aiRc} ${gateRossi} ${nonConsegnati}`,
    ],
    { encoding: "utf8" },
  );
  return Number(out.trim());
}

// ── AR-162 — i tre tentativi erano finti ─────────────────────────────────────
prova("AR-162: il timeout di un tentativo NON può essere l'intero budget", () => {
  // Il difetto vero: RITMO_AI_TIMEOUT=2700 con budget esterno 2700. Il primo tentativo da solo
  // consumava tutto e chi stava fuori uccideva il processo prima del secondo.
  const t = timeoutPerTentativo({ budgetSec: 2700 });
  assert.ok(t < 2700, `un tentativo prende ${t}s su 2700s di budget: i tentativi 2 e 3 non partono mai`);
});

prova("AR-162: l'invariante tentativi×timeout + pause ≤ budget vale per ogni budget", () => {
  for (const budget of [600, 900, 1800, 2700, 3600, 7200]) {
    assert.ok(
      budgetRispettato({ budgetSec: budget }),
      `budget ${budget}s: ${TENTATIVI_DEFAULT}×${timeoutPerTentativo({ budgetSec: budget })}s + pause sfora`,
    );
  }
});

prova("AR-162: col budget di oggi ci stanno davvero tre tentativi", () => {
  const t = timeoutPerTentativo({ budgetSec: 2700 });
  const totale = t * TENTATIVI_DEFAULT + (TENTATIVI_DEFAULT - 1) * PAUSA_DEFAULT_SEC;
  assert.ok(totale <= 2700, `3 tentativi + pause = ${totale}s > 2700s`);
  assert.ok(t >= 600, `${t}s per tentativo è troppo poco perché un giro concluda`);
});

// ── AR-163 / AR-313 / AR-166 — l'esito è un dato, e la testa è una sola ──────
prova("AR-313: memoria non arrivata su GitHub NON è un successo", () => {
  const r = esitoCadenza({ aiRc: 0, hadChanges: true, pushOk: false });
  assert.equal(r.codice, 2, "push fallito con modifiche deve dare 2, non 0");
  assert.equal(r.pulito, false);
});

prova("AR-163: motore fallito e niente memoria nuova NON è un successo", () => {
  const r = esitoCadenza({ aiRc: 1, hadChanges: false });
  assert.equal(r.codice, 1, "monitora.sh usciva 0 in questo caso, sempre");
});

prova("AR-166: un passo saltato non sparisce nel registro tecnico", () => {
  const r = esitoCadenza({ aiRc: 0, hadChanges: true, pushOk: true, passiOk: false });
  assert.equal(r.esito, "passi-saltati", "il passo saltato deve avere un nome, non solo una riga di stderr");
  assert.equal(r.pulito, false, "un giro con i passi 11-12 saltati non è pulito");
});

prova("un giro davvero pulito resta pulito", () => {
  const r = esitoCadenza({ aiRc: 0, hadChanges: true, pushOk: true, passiOk: true, vincoliAttivi: 0 });
  assert.equal(r.codice, 0);
  assert.equal(r.pulito, true);
});

prova("PARITÀ: la testa condivisa risponde come esito_giro_rc su tutta la tabella di verità", () => {
  const diff = [];
  for (const memoriaIncoerente of [0, 1])
    for (const hadChanges of [0, 1])
      for (const pushOk of [0, 1])
        for (const aiRc of [0, 1, 124])
          for (const gateRossi of [0, 1, 5])
            for (const nonConsegnati of [0, 1]) {
              const atteso = rcDelGiro({ memoriaIncoerente, hadChanges, pushOk, aiRc, gateRossi, nonConsegnati });
              const reale = esitoCadenza({
                memoriaIncoerente: !!memoriaIncoerente,
                hadChanges: !!hadChanges,
                pushOk: !!pushOk,
                aiRc,
                vincoliAttivi: gateRossi,
                vincoliNonConsegnati: !!nonConsegnati,
              }).codice;
              if (atteso !== reale) {
                diff.push(
                  `incoerente=${memoriaIncoerente} cambi=${hadChanges} push=${pushOk} ai=${aiRc} gate=${gateRossi} nc=${nonConsegnati} → bash ${atteso} ≠ modulo ${reale}`,
                );
              }
            }
  assert.equal(diff.length, 0, `le due teste divergono in ${diff.length} casi:\n  ${diff.slice(0, 5).join("\n  ")}`);
});

// ── AR-302 — i cancelli rossi non si spengono col motore ─────────────────────
prova("AR-302: col delta-gate il motore NON si salta se ci sono vincoli attivi", () => {
  const r = motoreSaltabile({ vincoliAttivi: 15, motivoSalto: "delta" });
  assert.equal(r.saltabile, false, "quindici allarmi accesi e nessuno che li legga: era esattamente il difetto");
});

prova("AR-302: saltato per budget, i vincoli restano dichiarati NON consegnati", () => {
  const r = motoreSaltabile({ vincoliAttivi: 3, motivoSalto: "budget" });
  assert.equal(r.saltabile, true, "sotto budget si taglia il volume, non la sicurezza");
  assert.equal(r.vincoliNonConsegnati, true, "i vincoli non possono evaporare in silenzio");
});

prova("AR-302: senza vincoli il delta-gate può risparmiare come prima", () => {
  const r = motoreSaltabile({ vincoliAttivi: 0, motivoSalto: "delta" });
  assert.equal(r.saltabile, true);
  assert.equal(r.vincoliNonConsegnati, false);
});

// ── AR-164 — la cadenza che smette di uscire ─────────────────────────────────
prova("AR-164: una cadenza ferma da due giorni si vede", () => {
  const adesso = Date.parse("2026-07-29T12:00:00Z");
  const stato = {
    cadenze: {
      "ritmo-mattino": { quando: "2026-07-27 06:00" }, // ~54h fa: oltre le 30 ammesse
      giro: { quando: "2026-07-29 10:00" },
    },
  };
  const stantie = cadenzeStantie({ stato, adessoMs: adesso });
  const tipi = stantie.map((s) => s.tipo);
  assert.ok(tipi.includes("ritmo-mattino"), "il Piano del mattino fermo da due giorni deve comparire");
  assert.ok(!tipi.includes("giro"), "il giro di due ore fa non è stantio");
});

prova("AR-164: una cadenza fresca non fa rumore", () => {
  const adesso = Date.parse("2026-07-29T12:00:00Z");
  const cadenze = Object.fromEntries(Object.keys(CADENZE).map((t) => [t, { quando: "2026-07-29 09:00" }]));
  const stantie = cadenzeStantie({ stato: { cadenze }, adessoMs: adesso });
  assert.equal(stantie.filter((s) => s.ore !== null).length, 0, "nessuna deve risultare invecchiata");
});

// ── AR-145 — il rilancio a raffica ───────────────────────────────────────────
prova("AR-145: il Piano del mattino non si rifà mezz'ora dopo", () => {
  // I sette rilanci in cento minuti erano IN FILA, non sovrapposti: il lucchetto d'esecuzione da
  // solo non li avrebbe fermati. Serve la domanda «l'ho già completata da poco?».
  const adesso = Date.parse("2026-07-29T09:00:00Z");
  const stato = { cadenze: { "ritmo-mattino": { quando: "2026-07-29 08:30", codice: 0, esito: "pulito" } } };
  const r = giaFattaDiRecente({ stato, tipo: "ritmo-mattino", adessoMs: adesso });
  assert.equal(r.gia, true, "mezz'ora dopo un mattino riuscito è un rilancio a vuoto");
});

prova("AR-145: il mattino di domani si fa, eccome", () => {
  const adesso = Date.parse("2026-07-30T06:00:00Z");
  const stato = { cadenze: { "ritmo-mattino": { quando: "2026-07-29 06:00", codice: 0, esito: "pulito" } } };
  assert.equal(giaFattaDiRecente({ stato, tipo: "ritmo-mattino", adessoMs: adesso }).gia, false);
});

prova("AR-145: dopo un fallimento si PUÒ riprovare — la cura non diventa un blocco", () => {
  const adesso = Date.parse("2026-07-29T09:00:00Z");
  const stato = { cadenze: { "ritmo-mattino": { quando: "2026-07-29 08:30", codice: 1, esito: "motore-fallito" } } };
  const r = giaFattaDiRecente({ stato, tipo: "ritmo-mattino", adessoMs: adesso });
  assert.equal(r.gia, false, "un mattino fallito alle 8:30 deve poter riprovare alle 9:00");
});

prova("AR-145: il giro NON è soggetto alla distanza minima — gira ogni due ore", () => {
  const adesso = Date.parse("2026-07-29T09:00:00Z");
  const stato = { cadenze: { giro: { quando: "2026-07-29 08:30", codice: 0, esito: "pulito" } } };
  assert.equal(giaFattaDiRecente({ stato, tipo: "giro", adessoMs: adesso }).gia, false, "il giro è ogni 2h di mestiere");
});

// ── AR-201 — si chiede alla policy, non si ritenta a memoria ─────────────────
prova("AR-201: dopo un fallimento si INTERROGA la retry-policy", () => {
  assert.equal(vaChiestaLaPolicy({ aiRc: 1, tentativo: 1, tentativiMax: 3 }), true);
  assert.equal(vaChiestaLaPolicy({ aiRc: 0, tentativo: 1, tentativiMax: 3 }), false, "riuscito: non si ritenta");
  assert.equal(vaChiestaLaPolicy({ aiRc: 1, tentativo: 3, tentativiMax: 3 }), false, "era l'ultimo tentativo");
});

prova("AR-201: se la policy dice stop, non si ritenta a vuoto", () => {
  assert.equal(ritentaSecondoPolicy('{"azione":"stop","motivo":"errore non ritentabile"}').ritenta, false);
  assert.equal(ritentaSecondoPolicy('{"azione":"ritenta"}').ritenta, true);
});

prova("AR-201: una risposta illeggibile della policy vale NO, non SÌ", () => {
  // Il default prudente conta: `|| echo '{}'` nel bash rende questo caso frequente, non teorico.
  assert.equal(ritentaSecondoPolicy("non-json").ritenta, false);
  assert.equal(ritentaSecondoPolicy("").ritenta, false);
  assert.equal(ritentaSecondoPolicy("{}").ritenta, false);
  // E la risposta ASSENTE — il caso che la mutazione ha scoperto essere scoperto: se la policy non
  // viene proprio interrogata (node fuori uso, timeout dei 20s), il chiamante passa nulla.
  assert.equal(ritentaSecondoPolicy(null).ritenta, false, "nessuna risposta non è un permesso");
  assert.equal(ritentaSecondoPolicy(undefined).ritenta, false);
  assert.equal(ritentaSecondoPolicy(0).ritenta, false);
});

// ── esito ────────────────────────────────────────────────────────────────────
const rotti = casi.filter((c) => !c.ok);
for (const c of casi) process.stdout.write(`${c.ok ? "✅" : "❌"} ${c.nome}${c.ok ? "" : `\n     ${c.err}`}\n`);
process.stdout.write(`\n${casi.length - rotti.length}/${casi.length} passati\n`);
process.exit(rotti.length ? 1 : 0);
