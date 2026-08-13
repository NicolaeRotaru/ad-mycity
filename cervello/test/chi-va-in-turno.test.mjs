#!/usr/bin/env node
// 🧪 Le prove di CHI VA IN TURNO (cervello/turno-senior.mjs).
//
// Le due che contano:
//  · il turno NON è un elenco di sei nomi: cambia col giorno, e chi non ha mai lavorato ci finisce
//    dentro (AR-187 — 114 senior su 120 non erano mai entrati in turno);
//  · un passaggio lasciato a un collega e mai raccolto CONVOCA quel collega (AR-620 — sei passaggi
//    su sette caduti nel vuoto, tutti verso lo stesso collega, nessuno mai richiamato).
//
// Le prove girano sui file veri (i 120 mansionari, la Sala Operativa, OKR-Squadra, i quaderni) e su
// repo-fixture costruiti apposta, per far vedere che le decisioni seguono i FILE e non il codice.

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { elencoSenior, radiceRepo } from "../prompt-senior.mjs";
import {
  giorniDa,
  handoffDellaSala,
  handoffPendenti,
  motoriDiSoldi,
  rotazioneDelGiorno,
  senioriDaOkr,
  senioriFermi,
  turnoDelGiro,
  ultimiEsitiSenior,
} from "../turno-senior.mjs";
import { readFileSync } from "node:fs";

const RADICE = radiceRepo();
const SENIOR = elencoSenior(RADICE);
const OGGI = "2026-08-13";
// I sei nomi che erano scritti a mano nel giro: servono a provare che il turno non è più quello.
const I_SEI_DI_PRIMA = ["vendite", "crm-lifecycle", "growth-monetizzazione", "marketing", "operations", "analista"];

/** Un repo finto: squadra, numeri, sala e quaderni, tutti dentro una cartella temporanea. */
function repoFinto({ agenti, okr = "", sala = "", quaderni = {}, claude = "" }) {
  const dir = mkdtempSync(join(tmpdir(), "turno-"));
  mkdirSync(join(dir, ".claude/agents"), { recursive: true });
  mkdirSync(join(dir, "MyCity-Vault/05-Soldi-Rischi"), { recursive: true });
  mkdirSync(join(dir, "MyCity-Vault/90-Memoria-AI"), { recursive: true });
  mkdirSync(join(dir, "memoria-squadra"), { recursive: true });
  writeFileSync(join(dir, "CLAUDE.md"), claude || "# finto");
  for (const a of agenti) writeFileSync(join(dir, `.claude/agents/${a}.md`), `---\nname: ${a}\n---\nSono ${a}.`);
  writeFileSync(join(dir, "MyCity-Vault/05-Soldi-Rischi/OKR-Squadra.md"), okr);
  writeFileSync(join(dir, "MyCity-Vault/90-Memoria-AI/SALA-OPERATIVA.md"), sala);
  for (const [chi, testo] of Object.entries(quaderni)) writeFileSync(join(dir, `memoria-squadra/${chi}.md`), testo);
  return dir;
}

// ── ① il turno non è più una lista di sei nomi (AR-187) ─────────────────────

test("in turno entrano anche senior che l'elenco fisso non chiamava mai", () => {
  const { turno } = turnoDelGiro({ radice: RADICE, oggi: OGGI });
  assert.ok(turno.length > 0, "nessuno in turno");
  const nuovi = turno.filter((v) => !I_SEI_DI_PRIMA.includes(v.key));
  assert.ok(nuovi.length >= 1, `in turno solo i sei di prima: ${turno.map((v) => v.key).join(", ")}`);
  for (const v of turno) assert.ok(SENIOR.includes(v.key), `@${v.key} non è un senior che esiste`);
});

test("il turno ruota: in una settimana la squadra cambia", () => {
  const giorni = ["2026-08-13", "2026-08-14", "2026-08-15", "2026-08-16", "2026-08-17", "2026-08-18", "2026-08-19"];
  const visti = new Set();
  for (const g of giorni) for (const v of turnoDelGiro({ radice: RADICE, oggi: g }).turno) visti.add(v.key);
  assert.ok(visti.size > 6, `in sette giri hanno lavorato solo ${visti.size} senior: la rotazione non gira`);
});

test("il giro resta il motore dei soldi: metà turno ai motori dell'organigramma", () => {
  const { turno, copertura } = turnoDelGiro({ radice: RADICE, oggi: OGGI });
  assert.ok(copertura.motoriInTurno >= 2, `solo ${copertura.motoriInTurno} motori di soldi in turno su ${turno.length}`);
});

test("i motori di soldi si leggono dall'organigramma, non da una lista in questo file", () => {
  const motori = motoriDiSoldi(readFileSync(join(RADICE, "CLAUDE.md"), "utf8"), SENIOR);
  assert.ok(motori.includes("vendite"), "vendite non è riconosciuto come motore di soldi");
  assert.ok(motori.length >= 10, `solo ${motori.length} motori letti dall'organigramma`);
  assert.ok(!motori.includes("security"), "un reparto di fondamenta è finito fra i motori di soldi");

  // E se domani l'organigramma cambia, cambia il turno: nessun nome è inchiodato nel codice.
  const finto = "**💰 Motori di soldi & crescita** (i più importanti):\n- 🧪 **alfa** — vende.\n\n**🛡️ Fondamenta:**\n- 🔒 **beta** — protegge.\n";
  assert.deepEqual(motoriDiSoldi(finto, ["alfa", "beta"]), ["alfa"]);
});

test("il numero che ogni senior possiede si legge da OKR-Squadra", () => {
  const okr = senioriDaOkr(readFileSync(join(RADICE, "MyCity-Vault/05-Soldi-Rischi/OKR-Squadra.md"), "utf8"), SENIOR);
  assert.ok(okr.length >= 20, `solo ${okr.length} senior con un numero: la tabella non viene letta`);
  const v = okr.find((o) => o.key === "vendite");
  assert.ok(v && v.kpi.length > 3, "il KPI di vendite non arriva");
  // «qa-designer» non deve essere scambiato per «qa»: i nomi lunghi si provano prima.
  const riga = "| ✅ qa-designer | Pubblicazioni conformi | 100% | — |";
  assert.equal(senioriDaOkr(riga, ["qa", "qa-designer"])[0].key, "qa-designer");
});

test("il focus del turno porta il numero del senior, non un'entità scritta nel codice", () => {
  const { turno } = turnoDelGiro({ radice: RADICE, oggi: OGGI });
  const conNumero = turno.find((v) => v.kpi);
  assert.ok(conNumero, "nessun senior in turno con un numero dichiarato");
  assert.ok(conNumero.focus.includes(conNumero.kpi.slice(0, 20)), "il KPI non entra nel focus");
  for (const v of turno) assert.ok(!/Casa Linda|ordine zombie/i.test(v.focus), `@${v.key} riceve un'entità superata`);
});

test("chi è fermo da più tempo entra prima: il turno segue i quaderni", () => {
  const dir = repoFinto({
    agenti: ["alfa", "beta"],
    okr: "| Senior | KPI | Target | Budget |\n|---|---|---|---|\n| alfa | numero A | 1 | — |\n| beta | numero B | 2 | — |",
    quaderni: {
      alfa: "## Esiti\n- 2026-08-12 10:00 · ha lavorato ieri",
      beta: "## Esiti\n- 2026-01-01 10:00 · ferma da mesi",
    },
  });
  const { turno } = turnoDelGiro({ radice: dir, oggi: OGGI, quanti: 1 });
  assert.equal(turno[0].key, "beta", "è entrato chi ha lavorato ieri invece di chi è fermo da mesi");
  assert.ok(turno[0].fermoDa > 200, "i giorni di fermo non sono calcolati");
});

test("la copertura è dichiarata: si sa in quanti giri passa tutta la squadra", () => {
  const { copertura } = turnoDelGiro({ radice: RADICE, oggi: OGGI });
  assert.equal(copertura.senior, SENIOR.length);
  assert.equal(copertura.giriPerPassareTutti, Math.ceil(SENIOR.length / copertura.perGiro));
});

// ── ② i passaggi fra colleghi non cadono più nel vuoto (AR-620) ─────────────

test("un passaggio a un collega che non si è più fatto vivo risulta pendente", () => {
  const sala = [
    "- 2026-07-01 10:00 · @vendite · PASSO-A · @seo — sistema le schede del faro",
    "- 2026-07-02 09:00 · @vendite · FATTO · altra roba",
  ].join("\n");
  const p = handoffPendenti(sala, { senior: SENIOR, oggi: OGGI, giorniMax: 365 });
  assert.equal(p.length, 1);
  assert.equal(p[0].a, "seo");
  assert.equal(p[0].da, "vendite");
  assert.ok(p[0].testo.includes("sistema le schede"));
});

test("se il collega si fa vivo dopo, il passaggio non è più pendente", () => {
  const sala = [
    "- 2026-07-01 10:00 · @vendite · PASSO-A · @seo — sistema le schede del faro",
    "- 2026-07-03 09:00 · @seo · FATTO · schede sistemate",
  ].join("\n");
  assert.deepEqual(handoffPendenti(sala, { senior: SENIOR, oggi: OGGI, giorniMax: 365 }), []);
});

test("un passaggio a Nicola non è un turno da assegnare a un reparto", () => {
  const sala = "- 2026-07-01 10:00 · @ad · PASSO-A · @Nicola — firma la card";
  assert.deepEqual(handoffDellaSala(sala, { senior: SENIOR }), []);
});

test("i passaggi vecchi di mesi non convocano nessuno: si segnalano, non si inseguono", () => {
  const sala = "- 2025-01-01 10:00 · @vendite · PASSO-A · @seo — roba dell'anno scorso";
  assert.deepEqual(handoffPendenti(sala, { senior: SENIOR, oggi: OGGI }), []);
  assert.equal(handoffPendenti(sala, { senior: SENIOR, oggi: OGGI, giorniMax: 999 }).length, 1);
});

test("nella Sala vera i passaggi mai raccolti si vedono, e sono verso colleghi che esistono", () => {
  const sala = readFileSync(join(RADICE, "MyCity-Vault/90-Memoria-AI/SALA-OPERATIVA.md"), "utf8");
  const tutti = handoffDellaSala(sala, { senior: SENIOR });
  assert.ok(tutti.length >= 3, `solo ${tutti.length} passaggi letti dalla Sala: il formato non viene riconosciuto`);
  for (const h of handoffPendenti(sala, { senior: SENIOR, oggi: OGGI, giorniMax: 999 })) {
    assert.ok(SENIOR.includes(h.a), `passaggio verso @${h.a}, che non è un reparto`);
    assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(h.data));
  }
});

test("il collega con un passaggio da raccogliere viene convocato, e sa cosa deve raccogliere", () => {
  const dir = repoFinto({
    agenti: ["alfa", "beta", "gamma"],
    okr: "| Senior | KPI | Target | Budget |\n|---|---|---|---|\n| alfa | numero A | 1 | — |",
    sala: "- 2026-08-10 10:00 · @alfa · PASSO-A · @gamma — controlla i log del rilascio",
    quaderni: { gamma: "## Esiti\n- 2026-08-12 10:00 · fatto altro" },
  });
  const { turno, copertura } = turnoDelGiro({ radice: dir, oggi: OGGI, quanti: 2 });
  const g = turno.find((v) => v.key === "gamma");
  assert.ok(g, `@gamma non è stato convocato: ${turno.map((v) => v.key).join(", ")}`);
  assert.equal(g.motivo, "passaggio-da-raccogliere");
  assert.ok(g.focus.includes("controlla i log del rilascio"), "il collega non sa cosa deve raccogliere");
  assert.ok(g.focus.includes("@alfa"), "non sa nemmeno da chi arriva");
  assert.equal(copertura.passaggiPendenti, 1);
});

test("il passaggio pendente batte la rotazione: chi aspetta entra prima", () => {
  const dir = repoFinto({
    agenti: ["alfa", "beta"],
    okr: "| Senior | KPI | Target | Budget |\n|---|---|---|---|\n| alfa | numero A | 1 | — |\n| beta | numero B | 2 | — |",
    sala: "- 2026-08-10 10:00 · @alfa · PASSO-A · @beta — prendi in mano questa",
    quaderni: { beta: "## Esiti\n- 2026-08-12 10:00 · lavorato ieri" },
  });
  const { turno } = turnoDelGiro({ radice: dir, oggi: OGGI, quanti: 1 });
  assert.equal(turno[0].key, "beta");
  assert.equal(turno[0].motivo, "passaggio-da-raccogliere");
});

// ── ③ i mattoni ─────────────────────────────────────────────────────────────

test("i giorni fra due date, e il «fermo da sempre» quando la data non c'è", () => {
  assert.equal(giorniDa("2026-08-01", "2026-08-13"), 12);
  assert.ok(giorniDa(null, "2026-08-13") > 9000);
  assert.ok(giorniDa("data-storta", "2026-08-13") > 9000);
});

test("la rotazione del giorno sposta il punto di partenza senza perdere nessuno", () => {
  const lista = ["a", "b", "c", "d"];
  const uno = rotazioneDelGiorno(lista, "2026-08-13");
  const due = rotazioneDelGiorno(lista, "2026-08-14");
  assert.equal(uno.length, 4);
  assert.deepEqual([...uno].sort(), lista);
  assert.notDeepEqual(uno, due, "la rotazione non ruota");
});

test("chi non lascia una riga ESITO da un mese si vede: è il metro dell'attività, non dell'anagrafica", () => {
  const dir = repoFinto({
    agenti: ["attivo", "fermo", "mai"],
    quaderni: {
      attivo: "## Esiti\n- 2026-08-12 10:00 · lavorato ieri",
      fermo: "## Esiti\n- 2026-05-01 10:00 · l'ultima volta a maggio",
    },
  });
  const fermi = senioriFermi({ radice: dir, oggi: OGGI });
  assert.deepEqual(fermi.map((f) => f.key), ["mai", "fermo"], "l'elenco dei fermi non segue i quaderni");
  assert.equal(fermi[0].ultimo, null, "chi non ha mai lasciato un esito non è riconosciuto");
  assert.ok(fermi[1].fermoDa > 90);

  // Sui file veri: se un giorno saranno zero, vorrà dire che tutti lavorano davvero.
  const veri = senioriFermi({ radice: RADICE, oggi: OGGI });
  assert.ok(veri.length <= SENIOR.length);
  for (const f of veri) assert.ok(SENIOR.includes(f.key));
});

test("l'ultimo esito di ogni senior si legge dai quaderni veri", () => {
  const esiti = ultimiEsitiSenior(RADICE, SENIOR);
  assert.equal(esiti.size, SENIOR.length);
  const conData = [...esiti.values()].filter(Boolean);
  assert.ok(conData.length >= 5, `solo ${conData.length} quaderni con un ESITO leggibile`);
  for (const d of conData) assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(d), `data storta: ${d}`);
});
