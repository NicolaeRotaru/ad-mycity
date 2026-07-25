#!/usr/bin/env node
// 🔎 VERIFICA IL ROUND 3 del programma intelligenza (2026-07-25). SOLA LETTURA: non scrive niente.
//
// A che serve: dare a Nicola UN comando che dice se i due freni che proteggono la sua firma
// funzionano davvero, invece di una lista di cose da controllare a mano. Esce 0 se tutto regge,
// 1 se qualcosa non torna — così si può anche appendere a un giro.
//
// Perché in sola lettura: nel round 2 il comando di verifica consegnato era rotto proprio nello
// strumento che serviva a controllare la macchina. Qui il verificatore non tocca la memoria, non
// chiude difetti e non scrive segnali: se sbaglia, sbaglia dicendo "no", non sporcando lo stato.
//
// Cosa controlla, in tre mosse:
//   ① I TEST — le 3 prove nuove (colore autopilot, firma Pannello, voto salute) devono passare.
//   ② LE PROVE DEL CANTIERE — i pattern con cui AR-109 e AR-110 si chiudono da soli devono
//      trovare il codice giusto: è ciò che permette al VPS di chiuderli senza intervento umano.
//   ③ IL CABLAGGIO — le funzioni non devono essere solo scritte, ma COLLEGATE. È l'errore che
//      ha generato AR-109: coloreMinimo() esisteva dal 16/7 e nessuno la chiamava.
//
// Uso:  node cervello/round3-verifica.mjs

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { AD_ROOT } from "./git-github.mjs";

const R = (p) => join(AD_ROOT, p);
const leggi = (p) => (existsSync(R(p)) ? readFileSync(R(p), "utf8") : null);

const esiti = [];
const ok = (t, d = "") => esiti.push({ ok: true, t, d });
const ko = (t, d = "") => esiti.push({ ok: false, t, d });

// ─────────────── ① i test ───────────────
const FILE_TEST = [
  "cervello/test/autopilot-colore.test.mjs",
  "cervello/test/consenso-firma-pannello.test.mjs",
  "cervello/test/auto-fix-salute.test.mjs",
  "cervello/test/consenso-azione.test.mjs",
];
const mancanti = FILE_TEST.filter((f) => !existsSync(R(f)));
if (mancanti.length) {
  ko("Test del round 3 presenti", `mancano: ${mancanti.join(", ")}`);
} else {
  // `--test-reporter=tap` — il formato del report va PINZATO, non lasciato al default: cambia con
  // la versione di Node (su v22 è TAP, su v24 no) e il conteggio qui sotto lo legge. Trovato sul
  // VPS: girando su Node v24 il verificatore stampava «Test: ? passati» perché il regex non
  // agganciava più. Stesso difetto di nascita di AR-109 in miniatura — uno strumento provato in un
  // ambiente e usato in un altro.
  const r = spawnSync(process.execPath, ["--test", "--test-reporter=tap", ...FILE_TEST.map(R)], {
    encoding: "utf8",
    cwd: AD_ROOT,
  });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const conta = (re) => {
    const m = out.match(re);
    return m ? Number(m[1]) : null;
  };
  const passati = conta(/^# pass (\d+)$/m);
  const falliti = conta(/^# fail (\d+)$/m);
  // Il verdetto è l'EXIT CODE, non il testo del report: se il conteggio non si legge lo si dice,
  // non si stampa un numero inventato (prima usciva "NaN" quando il parsing falliva).
  if (r.status === 0) {
    ok(passati === null ? "Test: tutti passati (conteggio non leggibile)" : `Test: ${passati} passati, 0 falliti`);
  } else {
    const quanti = falliti === null ? "" : ` (${falliti} su ${(passati ?? 0) + falliti})`;
    ko(`Test: FALLITI${quanti}`, "rilancia: node --test cervello/test/*.test.mjs");
  }
}

// ─────────────── ② le prove del cantiere ───────────────
// Sono le stesse che auto-fix.mjs usa per chiudere un difetto da solo: se trovano il codice,
// il VPS chiude AR-109 e AR-110 appena il fix arriva su main, senza che nessuno lo faccia a mano.
const PROVE = [
  { id: "AR-109", file: "cervello/autopilot.mjs", pattern: /coloreMinimo/, cosa: "il colore lo decide il canale" },
  { id: "AR-110", file: "pannello/src/app/api/approva/route.ts", pattern: /AZIONE_ID|\{approvato/, cosa: "l'Approva passa l'id firmato" },
];
for (const p of PROVE) {
  const src = leggi(p.file);
  if (src === null) ko(`${p.id}: prova`, `file assente: ${p.file}`);
  else if (p.pattern.test(src)) ok(`${p.id} si chiude da solo`, `${p.cosa} — ${p.file}`);
  else ko(`${p.id}: la prova NON scatta`, `${p.file} non contiene ${p.pattern}`);
}

// ─────────────── ③ il cablaggio (non basta che il codice esista) ───────────────
const autopilot = leggi("cervello/autopilot.mjs") || "";
const consenso = leggi("cervello/consenso-azione.mjs") || "";
const approva = leggi("pannello/src/app/api/approva/route.ts") || "";
const azioniPronte = leggi("pannello/src/app/api/azioni-pronte/route.ts") || "";
const autopilotaPannello = leggi("pannello/src/lib/autopilota.ts") || "";
const firmaLib = leggi("pannello/src/lib/firma-azione.ts") || "";

const CABLAGGI = [
  {
    t: "AR-109 · l'autopilot IMPORTA il colore del canale",
    ok: /import\s*\{[^}]*coloreMinimoPer[^}]*\}\s*from\s*"\.\/publishers\/index\.mjs"/.test(autopilot),
    d: "senza l'import, coloreMinimo resta un commento come prima del fix",
  },
  {
    t: "AR-109 · il cancello LIVE usa il colore EFFETTIVO",
    ok: /if \(LIVE && effettivo !== "🟢"\)/.test(autopilot),
    d: "il gate non deve più leggere voce.colore direttamente",
  },
  {
    t: "AR-109 · gli invii LIVE passano dal consenso (pausa + allowlist)",
    ok: /cancelloInvio\(voce\)/.test(autopilot) && /from "\.\/consenso-azione\.mjs"/.test(autopilot),
    d: "anche il verde deve passare dal kill-switch",
  },
  {
    t: "AR-110 · l'esecutore sa leggere la firma del Pannello",
    ok: /export async function firmaPannello/.test(consenso) && /firmaPannello\(blk\.id\)/.test(consenso),
    d: "la firma vive in Supabase: il cancello deve andarsela a prendere lì",
  },
  {
    t: "AR-110 · solo «nicola» apre il cancello",
    ok: /FIRMA_UMANA_RE\s*=\s*\/\^\\s\*nicola/.test(consenso),
    d: "l'autopilota non deve poter firmare al posto di Nicola",
  },
  {
    t: "AR-110 · il clic Approva REGISTRA la firma",
    ok: /registraFirma\(id, "nicola"\)/.test(azioniPronte) && /registraFirma\(n, "nicola"\)/.test(approva),
    d: "entrambe le vie di approvazione devono scriverla",
  },
  {
    t: "AR-110 · l'autopilota del Pannello firma come «auto», non come Nicola",
    ok: /registraFirma\(a\.id, "auto"\)/.test(autopilotaPannello),
    d: "è il punto che evita di aprire un buco invece di chiuderlo",
  },
  {
    t: "AR-110 · rifiuto e annullamento REVOCANO la firma",
    ok: /revocaFirma/.test(azioniPronte) && /revocaFirma/.test(approva) && /export async function revocaFirma/.test(firmaLib),
    d: "un'azione respinta non deve restare firmata",
  },
  {
    t: "Voto salute · chiudere un difetto non lo abbassa più",
    ok: /export function votoSaluteDaRegistrare/.test(leggi("cervello/auto-fix.mjs") || ""),
    d: "prima ogni chiusura scriveva 0 nello storico e la pagella crollava da 43 a 0",
  },
];
for (const c of CABLAGGI) (c.ok ? ok : ko)(c.t, c.d);

// ─────────────── esito ───────────────
console.log(`\n🔎 VERIFICA ROUND 3 — i due freni che proteggono la firma di Nicola\n`);
for (const e of esiti) {
  console.log(`${e.ok ? "✅" : "❌"} ${e.t}`);
  if (e.d) console.log(`      ${e.d}`);
}
const rotti = esiti.filter((e) => !e.ok);
if (rotti.length) {
  console.log(`\n❌ ${rotti.length} controllo/i NON passano. Il round 3 non è a posto.`);
  process.exit(1);
}
console.log(`\n✅ Tutti i ${esiti.length} controlli passano.`);
console.log(`   Prossimo passo: al merge su main il VPS chiude AR-109 e AR-110 da solo`);
console.log(`   (aggiorna-cervello.sh → auto-fix.mjs verifica --applica) e i freni rotti scendono di 2.`);
console.log(`   Rimisura con:  node cervello/pagella-intelligenza.mjs --gate`);
