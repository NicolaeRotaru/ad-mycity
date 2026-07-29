#!/usr/bin/env node
// stato-sensori.mjs — L'UNICA PORTA da cui passa una scrittura di stato dei sensori (AR-281).
//
// Il difetto che questo file chiude: la guardia contro la FALSA CECITÀ (AR-035) era stata scritta
// come una variabile dentro il main() di verifica-sensori.mjs, cioè nel file dove il sintomo era
// stato visto. I tre fratelli che scrivono lo stesso genere di stato condiviso — sensore-cassa.mjs,
// delta-gate.mjs, sentinella-fonti.mjs — continuavano a scrivere alla cieca. Da una sessione cloud
// senza chiavi finiva in git (e nel Pannello, e in git per il VPS) un «Stripe non collegato» su una
// macchina dove Stripe funziona benissimo, e una firma-di-nulla che al giro dopo costringeva a un
// giro pieno inutile.
//
// La regola vera non è «verifica-sensori non deve scrivere alla cieca»: è «NESSUNO scrive uno stato
// di sensore che non ha potuto misurare». Una regola di classe si implementa una volta sola, in un
// punto solo, e si fa attraversare da tutti — non si ricopia in quattro file.
//
// Uso come modulo:
//   import { scriviStatoSensore } from "./stato-sensori.mjs";
//   const esito = scriviStatoSensore(PATH, doc, { ambienteConfigurato: Boolean(process.env.X), motivo: "…" });
//   if (!esito.scritto) console.log(esito.spiegazione);
//
// Uso come guardiano (nel giro):
//   node cervello/stato-sensori.mjs --check   -> exit 1 se uno degli scrittori noti NON passa da qui

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));

/**
 * Scrive uno stato di sensore SOLO se l'ambiente poteva davvero misurarlo.
 *
 * @param {string} path            File di stato da scrivere (di solito sotto auto-coscienza/).
 * @param {unknown} doc            Documento da serializzare in JSON.
 * @param {{ambienteConfigurato: boolean, motivo?: string, scrittore?: (p: string, d: unknown) => void}} opts
 *        ambienteConfigurato = almeno una chiave/condizione del DOMINIO di questo sensore è presente.
 *        motivo = che cosa manca, in parole umane (finisce nel log: un rifiuto muto è un guasto).
 *        scrittore = come scrivere (default JSON indentato); serve a chi scrive in modo atomico.
 * @returns {{scritto: boolean, path: string, spiegazione: string}}
 */
export function scriviStatoSensore(path, doc, { ambienteConfigurato, motivo = "ambiente non configurato", scrittore } = {}) {
  if (!ambienteConfigurato) {
    return {
      scritto: false,
      path,
      spiegazione: `⏭️  NON aggiorno ${path}: ${motivo} — preservo lo stato reale del VPS (AR-035/AR-281).`,
    };
  }
  mkdirSync(dirname(path), { recursive: true });
  if (scrittore) scrittore(path, doc);
  else writeFileSync(path, JSON.stringify(doc, null, 2) + "\n", "utf8");
  return { scritto: true, path, spiegazione: `Scritto: ${path}` };
}

/**
 * Gli scrittori di stato-sensore conosciuti. Serve al controllo di classe: un difetto di questa
 * famiglia non si chiude guardando UN file (era la prova sbagliata di AR-035), si chiude
 * dimostrando che TUTTI i file della classe passano dalla porta.
 */
export const SCRITTORI_STATO_SENSORI = [
  "verifica-sensori.mjs",
  "sensore-cassa.mjs",
  "delta-gate.mjs",
  "sentinella-fonti.mjs",
];

/** @returns {{ok: boolean, fuori: string[]}} chi scrive stato-sensore senza passare da qui. */
export function verificaAdozione() {
  const fuori = [];
  for (const nome of SCRITTORI_STATO_SENSORI) {
    const p = join(QUI, nome);
    if (!existsSync(p)) {
      fuori.push(`${nome} (file mancante)`);
      continue;
    }
    if (!readFileSync(p, "utf8").includes("scriviStatoSensore")) fuori.push(nome);
  }
  return { ok: fuori.length === 0, fuori };
}

if (process.argv[1] && process.argv[1].endsWith("stato-sensori.mjs") && process.argv.includes("--check")) {
  const { ok, fuori } = verificaAdozione();
  if (ok) {
    console.log(`✅ stato-sensori: ${SCRITTORI_STATO_SENSORI.length}/${SCRITTORI_STATO_SENSORI.length} scrittori passano dalla guardia d'ambiente.`);
    process.exit(0);
  }
  console.error(`❌ stato-sensori: questi scrivono stato di sensore SENZA la guardia d'ambiente (AR-281): ${fuori.join(", ")}`);
  console.error(`   Importa scriviStatoSensore da cervello/stato-sensori.mjs e passa da lì.`);
  process.exit(1);
}
