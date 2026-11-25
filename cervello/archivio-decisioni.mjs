#!/usr/bin/env node
// 🗄️ L'ARCHIVIO PER MESE DI DECISIONI.md (Nicola 25/11: «alleggerire la macchina», archivio approvato).
//
// DECISIONI.md pesava 1,2 MB (circa 300 mila token se letto intero) e cresceva ogni giorno.
// Il file vivo tiene solo il MESE IN CORSO; i mesi passati stanno in
// `MyCity-Vault/90-Memoria-AI/Archivio/DECISIONI/AAAA-MM.md`, un file per mese.
// Le righe si SPOSTANO identiche, nello stesso ordine: niente si riscrive (append-only resta vero).
//
// Chi scrive (esegui-azione, autopilot, il giro, le sessioni) continua ad appendere a DECISIONI.md.
// Chi deve vedere TUTTA la storia usa `leggiDecisioniTutte()`: archivio in ordine di mese + file vivo.
//
// Uso:
//   node cervello/archivio-decisioni.mjs            → sposta in archivio i mesi chiusi (idempotente)
//   node cervello/archivio-decisioni.mjs --prova    → dice cosa sposterebbe, non scrive niente
//   node cervello/archivio-decisioni.mjs --mese 2026-12   → finge che il mese in corso sia quello
import { existsSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import { scriviTestoAtomico } from "./scrivi-json.mjs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
export const RADICE = join(QUI, "..");
export const FILE_VIVO = "MyCity-Vault/90-Memoria-AI/DECISIONI.md";
export const CARTELLA_ARCHIVIO = "MyCity-Vault/90-Memoria-AI/Archivio/DECISIONI";

// Una voce comincia con una data: «2026-07-11 15:41 · …», «- 2026-…», «## 2026-…», «- **2026-…**».
const INIZIO_VOCE = /^(?:#{2,3} |- )?(?:\*\*)?(20\d\d-\d\d)-\d\d\b/;

/** Il mese in corso a Piacenza, «AAAA-MM». */
export function meseInCorso(adesso = new Date()) {
  const p = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome", year: "numeric", month: "2-digit" }).formatToParts(adesso);
  return `${p.find((x) => x.type === "year").value}-${p.find((x) => x.type === "month").value}`;
}

/**
 * Divide il testo del file vivo. Pura.
 * Le righe prima della prima voce (frontmatter, titolo) e il titolo «# 🧾 DECISIONI — Registro» con
 * le sue righe di spiegazione restano nel file vivo. Ogni voce di un mese diverso da `mese` va
 * nell'archivio di quel mese, con le sue righe di seguito, nell'ordine in cui stava.
 * @returns {{ vivo: string, archivi: Map<string, string[]> }}
 */
export function dividiPerMese(testo, mese) {
  const righe = String(testo).split("\n");
  const vivo = [];
  const archivi = new Map();
  let corrente = null; // mese della voce aperta; null = intestazione, resta nel vivo
  for (const r of righe) {
    const m = r.match(INIZIO_VOCE);
    if (m) corrente = m[1];
    else if (/^# /.test(r)) corrente = null; // un titolo di primo livello è intestazione del file vivo
    if (corrente === null || corrente === mese) vivo.push(r);
    else {
      if (!archivi.has(corrente)) archivi.set(corrente, []);
      archivi.get(corrente).push(r);
    }
  }
  return { vivo: vivo.join("\n"), archivi };
}

function intestazioneArchivio(mese) {
  return `---\ntipo: archivio-decisioni\nmese: ${mese}\nfonte: AD digitale\n---\n\n` +
    `> Archivio di DECISIONI.md per il mese ${mese}. Le righe sono quelle originali, spostate identiche\n` +
    `> e nello stesso ordine da \`cervello/archivio-decisioni.mjs\`. È storia: non si riscrive.\n\n`;
}

/** La cartella d'archivio accanto a un DECISIONI.md: `<cartella del file>/Archivio/DECISIONI`. */
export function cartellaArchivioDi(percorsoVivo) {
  return join(dirname(percorsoVivo), "Archivio", "DECISIONI");
}

/** I file d'archivio presenti accanto a `percorsoVivo`, in ordine di mese. */
export function filesArchivio(percorsoVivo = join(RADICE, FILE_VIVO)) {
  const dir = cartellaArchivioDi(percorsoVivo);
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => /^20\d\d-\d\d\.md$/.test(f)).sort().map((f) => join(dir, f));
}

/**
 * La storia delle decisioni: l'archivio in ordine di mese, poi il file vivo.
 * Per chi deve vedere anche i mesi chiusi (riscontri, idempotenza, macchina del tempo).
 * `mesi` limita l'archivio agli ultimi N mesi (per chi guarda solo gli ultimi giorni: a inizio mese
 * la settimana scorsa sta già in archivio). Senza `mesi`, tutta la storia.
 */
export function leggiDecisioniTutte(percorsoVivo = join(RADICE, FILE_VIVO), { mesi } = {}) {
  let files = filesArchivio(percorsoVivo);
  if (mesi != null) files = files.slice(-mesi);
  const parti = files.map((f) => readFileSync(f, "utf8"));
  if (existsSync(percorsoVivo)) parti.push(readFileSync(percorsoVivo, "utf8"));
  return parti.join("\n");
}

/** Sposta in archivio i mesi chiusi. Idempotente: se non c'è niente da spostare non scrive. */
export function archivia({ radice = RADICE, mese = meseInCorso(), prova = false } = {}) {
  const pVivo = join(radice, FILE_VIVO);
  if (!existsSync(pVivo)) return { spostate: 0, mesi: [], motivo: "DECISIONI.md non trovato" };
  const prima = readFileSync(pVivo, "utf8");
  const { vivo, archivi } = dividiPerMese(prima, mese);
  if (archivi.size === 0) return { spostate: 0, mesi: [] };
  const mesi = [...archivi.keys()].sort();
  const spostate = [...archivi.values()].reduce((s, r) => s + r.length, 0);
  if (!prova) {
    const dir = cartellaArchivioDi(pVivo);
    mkdirSync(dir, { recursive: true });
    for (const m of mesi) {
      const p = join(dir, `${m}.md`);
      const testo = archivi.get(m).join("\n").replace(/\n+$/, "") + "\n";
      const esistente = existsSync(p) ? readFileSync(p, "utf8") : intestazioneArchivio(m);
      scriviTestoAtomico(p, esistente.replace(/\n*$/, "\n\n") + testo);
    }
    scriviTestoAtomico(pVivo, vivo);
  }
  return { spostate, mesi };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const a = process.argv.slice(2);
  const iMese = a.indexOf("--mese");
  const r = archivia({ prova: a.includes("--prova"), mese: iMese >= 0 ? a[iMese + 1] : meseInCorso() });
  if (r.motivo) { console.log(`⚪ ${r.motivo}`); process.exit(0); }
  if (!r.spostate) console.log("✅ DECISIONI.md tiene già solo il mese in corso: niente da spostare.");
  else console.log(`${a.includes("--prova") ? "🔎 sposterei" : "✅ spostate"} ${r.spostate} righe in archivio (${r.mesi.join(", ")}) → ${CARTELLA_ARCHIVIO}/`);
}
