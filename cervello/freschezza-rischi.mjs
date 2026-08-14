#!/usr/bin/env node
// freschezza-rischi.mjs — guardiano di FRESCHEZZA della mappa dei rischi (AR-431).
//
// ─────────────────────────────────────────────────────────────────────────────
// PERCHÉ ESISTE
// ─────────────────────────────────────────────────────────────────────────────
// Il registro dei rischi ha già un guardiano — `coerenza-rischi.mjs` — ma quello controlla la
// COERENZA fra le due copie (canonico e puntatore), non la VITALITÀ del contenuto: due copie
// perfettamente allineate e ferme al due luglio passano il controllo senza un fiato. È nato per
// risolvere il doppio registro e si è fermato lì.
//
// La causa di sistema: quando qui nasce una FAMIGLIA di controlli (la freschezza: checklist,
// cadenze, OKR, intelligence, segnali) nessuno passa in rassegna tutti i documenti che dovrebbero
// entrarci. Le famiglie crescono per incidenti, non per copertura — così il documento che dice
// quali rischi possono affondare l'azienda era l'unico senza sveglia.
//
// Cosa misura, e da dove:
//   ① `ultima_revisione` di ogni rischio del registro canonico → un rischio ALTA non rivisto da più
//      di 30 giorni è stantio;
//   ② il campo `aggiornato` del file → se il registro nel suo insieme non viene toccato da più di
//      45 giorni, la mappa non è più una mappa.
// Si legge la DATA SCRITTA DENTRO il file, mai l'mtime: su un clone fresco (il VPS ne fa) l'mtime
// dice che è tutto di oggi, e il guardiano nascerebbe cieco proprio dove deve lavorare (stessa
// lezione di AR-421 sul conteggio degli asset).
//
// 🟢 Sola lettura.
// Uso:  node cervello/freschezza-rischi.mjs [--json]
// Exit (AR-322): 0 = registro fresco · 1 = stantio (vincolo hard al giro) · 2 = non ho potuto leggere.

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza } from "./git-github.mjs";
import { FINESTRA, statoRevisione } from "./finestra-misura.mjs";

const JSON_MODE = process.argv.includes("--json");
const CANONICO = process.env.RISCHI_FILE || join(AD_ROOT, "MyCity-Vault/05-Soldi-Rischi/REGISTRO-RISCHI.json");
const MAX_GIORNI_ALTA = Number(process.env.RISCHI_MAX_GIORNI_ALTA || 30);
const MAX_GIORNI_FILE = Number(process.env.RISCHI_MAX_GIORNI_FILE || 45);

/** Le gravità che pretendono una revisione periodica. Un rischio basso può dormire; questi no. */
export const GRAVITA_SORVEGLIATE = new Set(["alta", "media-alta"]);

/**
 * Il verdetto, PURO: quali rischi sono stantii e se il registro nel suo insieme è fermo.
 * L'istante arriva da fuori, così un test può metterlo dove vuole senza toccare l'orologio.
 *
 * @param {{aggiornato?: string, rischi?: Array}} registro
 * @param {number} adessoMs
 * @returns {{ok: boolean, cieco: boolean, stantii: Array, file: object, controllati: number, motivo: string}}
 */
export function verdettoFreschezza(registro, adessoMs, { maxGiorniAlta = MAX_GIORNI_ALTA, maxGiorniFile = MAX_GIORNI_FILE } = {}) {
  if (!registro || !Array.isArray(registro.rischi))
    return { ok: false, cieco: true, stantii: [], file: null, controllati: 0, motivo: "registro assente o senza elenco rischi: non ho potuto misurare niente" };

  const sorvegliati = registro.rischi.filter((r) => GRAVITA_SORVEGLIATE.has(String(r?.gravita || "").toLowerCase()));
  const stantii = [];
  let senzaData = 0;
  for (const r of sorvegliati) {
    const s = statoRevisione({ timbro: r.ultima_revisione, adessoMs, tettoGiorni: maxGiorniAlta });
    if (s.esito === FINESTRA.SCADUTA) stantii.push({ id: r.id, rischio: r.rischio, gravita: r.gravita, owner: r.owner || null, giorni: s.giorni, motivo: s.motivo });
    else if (s.esito === FINESTRA.ASSENTE) {
      senzaData++;
      stantii.push({ id: r.id, rischio: r.rischio, gravita: r.gravita, owner: r.owner || null, giorni: null, motivo: `${s.motivo} — una revisione che non porta data non è una revisione` });
    }
  }

  const file = statoRevisione({ timbro: registro.aggiornato, adessoMs, tettoGiorni: maxGiorniFile });
  const fileFermo = file.esito !== FINESTRA.VIVA;

  return {
    ok: stantii.length === 0 && !fileFermo,
    cieco: false,
    stantii,
    file: { ...file, tetto_giorni: maxGiorniFile },
    controllati: sorvegliati.length,
    senza_data: senzaData,
    motivo:
      stantii.length === 0 && !fileFermo
        ? `${sorvegliati.length} rischi sorvegliati, tutti rivisti entro ${maxGiorniAlta} giorni`
        : `${stantii.length} rischi da rivedere su ${sorvegliati.length}${fileFermo ? ` · il registro nel suo insieme: ${file.motivo}` : ""}`,
  };
}

function main() {
  const quando = nowPiacenza();
  if (!existsSync(CANONICO)) {
    console.error(`⛔ FRESCHEZZA-RISCHI CIECO: il registro non esiste (${CANONICO}) — non è un verde.`);
    process.exit(2);
  }
  let registro;
  try {
    registro = JSON.parse(readFileSync(CANONICO, "utf8"));
  } catch (e) {
    console.error(`⛔ FRESCHEZZA-RISCHI CIECO: registro illeggibile (${e?.message || e}) — non è un verde.`);
    process.exit(2);
  }

  const v = verdettoFreschezza(registro, Date.now());
  if (v.cieco) {
    console.error(`⛔ FRESCHEZZA-RISCHI CIECO: ${v.motivo}`);
    process.exit(2);
  }

  if (JSON_MODE) {
    console.log(JSON.stringify({ ok: v.ok, quando, registro: CANONICO, tetto_giorni_alta: MAX_GIORNI_ALTA, tetto_giorni_file: MAX_GIORNI_FILE, ...v }, null, 2));
    process.exit(v.ok ? 0 : 1);
  }

  if (v.ok) {
    console.log(`✅ Mappa dei rischi fresca — ${v.motivo} (${quando}).`);
    process.exit(0);
  }

  console.log(`⛔ AR-431: MAPPA DEI RISCHI STANTIA — ${quando}`);
  console.log(`   Registro: ${CANONICO} (${v.file.motivo})`);
  for (const s of v.stantii) console.log(`   • ${s.id} — ${s.rischio} [${s.gravita}, owner ${s.owner || "nessuno"}]: ${s.motivo}`);
  console.log(
    `\n   VINCOLO: in questo giro rivedi i rischi qui sopra con l'owner indicato (stato della mitigazione ancora valido? la sentinella suona ancora?) ` +
      `e aggiorna 'ultima_revisione' e 'aggiornato'. Un rischio che nessuno guarda da ${MAX_GIORNI_ALTA}+ giorni non è sorvegliato: è archiviato senza dirlo.`
  );
  process.exit(1);
}

if (process.argv[1] && process.argv[1].endsWith("freschezza-rischi.mjs")) main();
