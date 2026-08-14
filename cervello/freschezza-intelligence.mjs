#!/usr/bin/env node
// 📆 FRESCHEZZA INTELLIGENCE — quanto è vecchio quello che la Cabina sta mostrando.
//
// Il difetto che chiude (Nicola, 2026-08-10): la card «Intelligence & opportunità» mostrava un
// testo del 20 luglio come se fosse di oggi. Nessuna data sotto il titolo, nessun avviso: la data
// c'era solo DENTRO il testo, e solo se chi l'aveva scritto si era ricordato di metterla. Undici
// giorni di monitoraggio morto sono passati inosservati perché la schermata non aveva modo di dire
// «questo è vecchio». Un dato scaduto mostrato senza avviso è peggio di un dato assente: sull'assente
// non ci decidi sopra.
//
// La soglia NON è scritta a mano qui. Si DERIVA da cervello/radar-fonti.json: se una card ha almeno
// una fonte «giornaliera» deve rinfrescarsi ogni giorno (soglia 2 giorni: uno di cadenza, uno di
// margine); se ha solo fonti «settimanale», la soglia è 8 giorni. Così il giorno in cui Nicola
// cambia la cadenza di una fonte, la soglia lo segue da sola e non restano due verità in due file.
//
// Uso:
//   node cervello/freschezza-intelligence.mjs            -> tabella leggibile
//   node cervello/freschezza-intelligence.mjs --json     -> per il Pannello/altri script
//   node cervello/freschezza-intelligence.mjs --scrivi   -> aggiorna auto-coscienza/intelligence-freschezza.json
//   node cervello/freschezza-intelligence.mjs --check    -> exit 1 se una card è scaduta (gate del giro)

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza } from "./git-github.mjs";
import { msDaTimbro } from "./ora-piacenza.mjs";

const RADAR = join(AD_ROOT, "cervello/radar-fonti.json");
const INTEL_DIR = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/Intelligence");
export const FILE_FRESCHEZZA = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/intelligence-freschezza.json");

export const SOGLIA_GIORNALIERA = 2;
export const SOGLIA_SETTIMANALE = 8;

// Le cinque schede della card, con l'etichetta che Nicola vede sul bottone.
export const SCHEDE = [
  { id: "concorrenti", file: "radar-concorrenti", etichetta: "Concorrenti" },
  { id: "eventi", file: "eventi-picchi", etichetta: "Eventi & picchi" },
  { id: "buchi", file: "buchi-mercato", etichetta: "Buchi di mercato" },
  { id: "leve", file: "leve-uscita", etichetta: "Leve in uscita" },
  { id: "reputazione", file: "reputazione", etichetta: "Reputazione" },
];

/**
 * Legge la data dall'intestazione del testo. PURA.
 * Stessa lettura che fa già intelligence-agenda.mjs: la prima data ISO nei primi 600 caratteri.
 * Deve restare così perché in produzione il Pannello legge il vault da GitHub, non dal disco: la
 * data del filesystem lì non esiste, e l'unica verità disponibile è quella scritta nel testo.
 */
export function dataDaIntestazione(testo = "") {
  const m = String(testo).slice(0, 600).match(/(\d{4}-\d{2}-\d{2})/);
  if (m) return m[1];
  // Forma italiana: «Aggiornato: 20 luglio 2026 20:22»
  const MESI = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];
  const it = String(testo).slice(0, 600).match(new RegExp(`\\b(\\d{1,2})\\s+(${MESI.join("|")})\\s+(\\d{4})`, "i"));
  if (it) {
    const mese = String(MESI.indexOf(it[2].toLowerCase()) + 1).padStart(2, "0");
    return `${it[3]}-${mese}-${String(it[1]).padStart(2, "0")}`;
  }
  return null;
}

/**
 * Giorni interi fra due date ISO (aaaa-mm-gg), contati da mezzogiorno a mezzogiorno. PURA.
 *
 * Qui c'era `+02:00` scritto a mano su tutte e due le date. Sembra innocuo perché il conto si fa a
 * mezzogiorno e un'ora di scarto non attraversa la mezzanotte — ma l'errore non sta DENTRO la
 * giornata: sta sul confine dell'ora legale. Quando l'intervallo lo scavalca, le due date hanno
 * offset veri diversi (+01:00 e +02:00), il cablato ne perde uno e `Math.floor` trasforma l'ora
 * mancante in un giorno intero. Dal 15 gennaio al 15 luglio diceva 181 invece di 180. Sopra questo
 * numero stanno le soglie di scadenza delle schede: un giorno regalato fa scadere una card che
 * ancora fresca, e un avviso che parte da solo si impara a ignorare.
 *
 * Stessa cura, stesso conto e stessi numeri del gemello nel Pannello
 * (`pannello/src/lib/freschezza-intelligence.ts`, AR-414): l'offset lo si chiede al fuso per QUELLA
 * data, non lo si scrive.
 */
export function giorniFra(isoVecchia, isoOggi) {
  if (!isoVecchia) return null;
  const a = msDaTimbro(`${isoVecchia} 12:00`);
  const b = msDaTimbro(`${isoOggi} 12:00`);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return Math.floor((b - a) / 86400000);
}

/**
 * Deriva la soglia di ogni scheda dalle cadenze delle sue fonti. PURA.
 * Ritorna { [scrive_in]: { soglia, fonti, cadenze } }.
 */
export function soglieDaFonti(fonti = []) {
  const per = {};
  for (const f of fonti) {
    const k = f.scrive_in;
    if (!k) continue;
    (per[k] ||= { fonti: 0, cadenze: new Set() });
    per[k].fonti += 1;
    per[k].cadenze.add(f.cadenza || "settimanale");
  }
  const out = {};
  for (const [k, v] of Object.entries(per)) {
    out[k] = {
      soglia: v.cadenze.has("giornaliera") ? SOGLIA_GIORNALIERA : SOGLIA_SETTIMANALE,
      fonti: v.fonti,
      cadenze: [...v.cadenze],
    };
  }
  return out;
}

/**
 * Il giudizio su una scheda. PURA — è il cuore, e i test la spingono con date finte.
 * Stato: "fresca" | "scaduta" | "mai-scritta" | "senza-data".
 * ⚪ "senza-data" non è un verde: significa che non ho potuto misurare, e va detto così.
 */
export function giudica({ presente, testo, soglia, oggi }) {
  if (!presente) return { stato: "mai-scritta", giorni: null, scaduta: true, frase: "mai scritta" };
  const data = dataDaIntestazione(testo);
  if (!data) {
    return {
      stato: "senza-data",
      giorni: null,
      data: null,
      scaduta: false,
      frase: "senza data in cima: non posso dire quanto è vecchia",
    };
  }
  const g = giorniFra(data, oggi);
  const scaduta = g != null && g > soglia;
  return {
    stato: scaduta ? "scaduta" : "fresca",
    giorni: g,
    data,
    scaduta,
    frase: g === 0 ? "aggiornata oggi" : g === 1 ? "aggiornata ieri" : `aggiornata ${g} giorni fa`,
  };
}

/** Raccoglie il quadro completo leggendo il disco. */
export function analizza({ oggi = nowPiacenza().slice(0, 10) } = {}) {
  let fonti = [];
  try {
    fonti = JSON.parse(readFileSync(RADAR, "utf8")).fonti || [];
  } catch {
    fonti = [];
  }
  const soglie = soglieDaFonti(fonti);
  const schede = SCHEDE.map((s) => {
    const path = join(INTEL_DIR, `${s.file}.md`);
    const presente = existsSync(path);
    const testo = presente ? readFileSync(path, "utf8") : "";
    const conf = soglie[s.file] || { soglia: SOGLIA_SETTIMANALE, fonti: 0, cadenze: [] };
    return { ...s, soglia: conf.soglia, fonti: conf.fonti, ...giudica({ presente, testo, soglia: conf.soglia, oggi }) };
  });
  return {
    aggiornato: nowPiacenza(),
    oggi,
    scadute: schede.filter((s) => s.scaduta).map((s) => s.id),
    non_misurabili: schede.filter((s) => s.stato === "senza-data").map((s) => s.id),
    schede,
  };
}

// ─────────────────────────────── CLI ───────────────────────────────
const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const r = analizza();

  if (process.argv.includes("--scrivi") || process.argv.includes("--check")) {
    writeFileSync(
      FILE_FRESCHEZZA,
      JSON.stringify(
        {
          _cosa_e:
            "Quanto è vecchia ogni scheda della card «Intelligence & opportunità». La soglia è DERIVATA dalle cadenze delle fonti in radar-fonti.json, non scritta a mano: cambiando la cadenza di una fonte, la soglia si aggiorna da sola.",
          ...r,
        },
        null,
        2
      ) + "\n",
      "utf8"
    );
  }

  if (process.argv.includes("--json")) {
    console.log(JSON.stringify(r, null, 2));
    process.exit(r.scadute.length > 0 && process.argv.includes("--check") ? 1 : 0);
  }

  console.log(`📆 Freschezza Intelligence — ${r.aggiornato}\n`);
  for (const s of r.schede) {
    const segno = s.stato === "fresca" ? "✅" : s.stato === "senza-data" ? "⚪" : "❌";
    const eta = s.giorni == null ? "—" : `${s.giorni}g`;
    console.log(`${segno} ${s.etichetta.padEnd(18)} ${eta.padStart(4)} / soglia ${s.soglia}g · ${s.frase}`);
  }
  if (r.non_misurabili.length) {
    console.log(`\n⚪ Senza data in cima (non misurabili): ${r.non_misurabili.join(", ")} — vanno riscritte con la data.`);
  }
  if (process.argv.includes("--check")) {
    if (r.scadute.length) {
      console.error(`\n⛔ ${r.scadute.length} schede scadute: ${r.scadute.join(", ")}. La Cabina le sta mostrando come se fossero fresche.`);
      process.exit(1);
    }
    console.log("\n✅ Nessuna scheda scaduta.");
  }
}
