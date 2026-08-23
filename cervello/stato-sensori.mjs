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

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { scriviJsonAtomico } from "./scrivi-json.mjs";
import { timbroProvenienza } from "./scrittura-misura.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));

/**
 * Scrive uno stato di sensore SOLO se l'ambiente poteva davvero misurarlo.
 *
 * ── LA PENNA NON SI SCEGLIE PIÙ (residuo di AR-568, chiuso il 23/8) ────────────────────────────
 * Prima questa funzione accettava un `scrittore` e, se non gliene davi uno, scriveva con un
 * `writeFileSync` crudo. Il risultato misurato: dei quattro scrittori della classe, `verifica-sensori`
 * e `delta-gate` passavano la penna atomica — che porta addosso il freno «cieco non sovrascrive
 * vedente» — mentre `sensore-cassa` e `sentinella-fonti` non ne passavano nessuna e finivano sulla
 * penna cruda. Cioè: la porta era una sola, ma il freno stava nella penna, e la penna era
 * facoltativa. Una regola che vale solo per chi si ricorda di chiedere il pezzo giusto è una regola
 * da ricordare, ed è la forma che questo cantiere paga da mesi.
 *
 * Adesso la penna è una: `scriviJsonAtomico`. Non c'è nessun parametro da passare, quindi non c'è
 * niente da dimenticare.
 *
 * ── E IL TIMBRO SI METTE QUI, NON LO METTE CHI CHIAMA ──────────────────────────────────────────
 * Il freno della copertura si accende solo se il documento che c'è già dichiara `origine`. Con la
 * penna cruda quei due file l'origine non l'hanno mai avuta — `cassa-runway.json` non ce l'ha
 * tuttora — quindi anche montandoci sopra la penna giusta il freno li avrebbe lasciati passare
 * lo stesso. Un freno che si spegne se non dichiari niente è un freno a richiesta.
 *
 * Quindi il timbro lo mette la porta. Da qui in avanti un documento di stato-sensore non può
 * esistere senza `origine`, e la `copertura` — quando chi misura la dichiara — entra nel confronto.
 * Non dichiararla NON è una scappatoia: la regola ⑤ di `decidiScrittura` dice che una copertura
 * ignota non sovrascrive una dichiarata. Chi tace perde il confronto, invece di vincerlo.
 *
 * @param {string} path            File di stato da scrivere (di solito sotto auto-coscienza/).
 * @param {unknown} doc            Documento da serializzare in JSON.
 * @param {{ambienteConfigurato: boolean, motivo?: string, copertura?: number, scrittoDa?: string}} opts
 *        ambienteConfigurato = almeno una chiave/condizione del DOMINIO di questo sensore è presente.
 *        motivo = che cosa manca, in parole umane (finisce nel log: un rifiuto muto è un guasto).
 *        copertura = quante cose ha davvero guardato questa misura: è il numero che il freno confronta.
 * @returns {{scritto: boolean, path: string, spiegazione: string}}
 */
export function scriviStatoSensore(
  path,
  doc,
  { ambienteConfigurato, motivo = "ambiente non configurato", copertura = null, scrittoDa = "", env = process.env } = {},
) {
  if (!ambienteConfigurato) {
    return {
      scritto: false,
      path,
      spiegazione: `⏭️  NON aggiorno ${path}: ${motivo} — preservo lo stato reale del VPS (AR-035/AR-281).`,
    };
  }
  const timbrato = timbraSeSiPuo(doc, { env, copertura, scrittoDa });
  const scritto = scriviJsonAtomico(path, timbrato, env);
  if (scritto === null) {
    // La penna ha già spiegato sul log PERCHÉ non ha scritto (copertura minore, memoria protetta).
    // Qui la cosa che conta è non dire «scritto» a chi ci ha chiesto di scrivere: era la bugia di
    // prima, e chi la leggeva credeva che il file fosse cambiato.
    return { scritto: false, path, spiegazione: `Non scritto ${path}: fermato dal freno della memoria (vedi la riga qui sopra).` };
  }
  return { scritto: true, path, spiegazione: `Scritto: ${path}` };
}

/**
 * Il timbro di provenienza sul documento, quando il documento è un oggetto che può portarlo.
 *
 * Un array o una stringa non hanno un posto dove metterlo, e forzarglielo li deformerebbe: in quel
 * caso si scrive senza, e il freno tratterà quella misura come «copertura ignota» — cioè con
 * prudenza, non con un permesso.
 */
function timbraSeSiPuo(doc, { env, copertura, scrittoDa }) {
  if (!doc || typeof doc !== "object" || Array.isArray(doc)) return doc;
  return { ...doc, ...timbroProvenienza({ env, copertura, scrittoDa }) };
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
