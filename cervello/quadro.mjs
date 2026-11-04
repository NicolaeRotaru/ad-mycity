#!/usr/bin/env node
// 📋 IL QUADRO — tutti i difetti in una pagina, casa per casa. 🟢 Sola lettura.
//
// PERCHÉ ESISTE. Nicola, 4/11/2026: «guarda come sono messi i difetti della
// macchina/pannello/ad/senior/... — come posso chiederti di controllare tutte queste cose con una
// parola?». Quel giorno, per rispondere, servivano quattro strumenti in tre case diverse:
// `salute.mjs` (gli organi funzionano?), `cantiere-prove.mjs` (i difetti della macchina),
// `tasso-chiusura.mjs` (chiudo quanto apro?) e il registro del sito, letto a mano. Il «checkup»
// dice se gli organi funzionano, ma non conta i difetti casa per casa e non guarda il sito.
//
// Questo file NON misura niente di suo: chiama chi misura già e mette tutto in una pagina, con la
// stessa legge della visita — ✅ visto e a posto · ❌ visto e rotto · ⚪ non visto da qui. Un ⚪
// non diventa mai un verde, nemmeno qui sopra.
//
// La casa di un difetto della macchina si legge dalla sua dimensione. Quando la dimensione non dice
// dove sta (`trovato-riparando`, `macchina`, nessuna), si legge dal titolo; se nemmeno il titolo lo
// dice, la scheda va in «Senza casa» e il conto lo mostra: nessuna scheda sparisce dal totale.
//
// DUE QUADRI, NON UNO (Nicola, 5/11/2026: «voglio dividere la macchina dal marketplace»). La macchina
// e il sito sono due case con due registri e due strade di riparazione: messi nella stessa pagina,
// 996 difetti del sito coprivano i 218 della macchina. Il quadro della macchina non legge il registro
// del sito, e il quadro del sito non fa la visita degli organi.
//
// Uso:
//   node cervello/quadro.mjs                 -> LA MACCHINA: visita, difetti casa per casa, ritmo, bloccanti
//   node cervello/quadro.mjs --sito          -> IL SITO: i difetti del marketplace, per gravità e per area
//   node cervello/quadro.mjs --senza-visita  -> la macchina con l'ultima visita salvata, senza farne una nuova
//   node cervello/quadro.mjs --json          -> i dati, per chi ci deve ragionare sopra
//
// La visita di adesso è `salute.mjs`: scrive il suo referto, come quando si dice «checkup».
// Questo file non scrive niente.
//
// Exit: 0 = ho letto tutte le fonti · 2 = una fonte mancava o non si leggeva, o la visita di adesso
// è caduta e mostro quella salvata (quadro parziale, che NON è un quadro a posto). Non è un cancello: non boccia niente, mostra.

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { AD_ROOT, nowPiacenza } from "./git-github.mjs";
import { eChiusa, statoDi } from "./stati-cantiere.mjs";
import { OBIETTIVO, contaMese, perMese, verdetto } from "./tasso-chiusura.mjs";

const AUTO = "MyCity-Vault/90-Memoria-AI/auto-coscienza";
export const FONTI = Object.freeze({
  cantiere: `${AUTO}/cantiere-difetti.json`,
  sito: `${AUTO}/radiografia-marketplace.json`,
  salute: `${AUTO}/salute.json`,
});

// ── Le case dei difetti della macchina ──────────────────────────────────────

/** Ogni casa si riconosce dalla dimensione della scheda; il titolo serve solo quando la dimensione è vaga. */
export const CASE = Object.freeze([
  { casa: "Worker e server", dim: /worker|cadenz|vps/, titolo: /\bserver\b|worker|\bVPS\b|pubblica|\bpush\b|rebase|allineamento|contenitore/i },
  { casa: "Pannello e Cabina", dim: /pannello|cabina/, titolo: /pannello|cabina|\bcard\b|pallino/i },
  { casa: "AD e senior", dim: /senior|agent|^ad-|prompt|scrittura|comunicazione|apprendimento|capacita/, titolo: /\bsenior\b|mansionari|\bagenti\b|revisione tra pari|canale di squadra/i },
  { casa: "Sicurezza e permessi", dim: /sicurezza|freni/, titolo: /\broot\b|segret|permess|falle/i },
  { casa: "Sensori e dati", dim: /sensor|freschezza|copertura-cieca/, titolo: /sensore|dati veri/i },
  { casa: "Memoria", dim: /memoria|coerenza|registro|integrita/, titolo: /memoria|registro|\bid\b/i },
  { casa: "Guardiani e prove", dim: /guardian|guardrail|calibraz|onesta|volano|robustezza/, titolo: /guardian|\bprov[ae]\b|cancello|mutazion|sorvegliante|freno/i },
]);
export const ALTRO = "Strategia e altro";
export const SENZA_CASA = "Senza casa";
/** Le dimensioni che non dicono dove sta il difetto: lì si guarda il titolo. */
const DIMENSIONI_VAGHE = new Set(["", "trovato-riparando", "macchina"]);
const ORDINE_CASE = [...CASE.map((c) => c.casa), ALTRO, SENZA_CASA];

export function casaDi(d) {
  const dim = String(d?.dimensione ?? "").trim().toLowerCase();
  if (!DIMENSIONI_VAGHE.has(dim)) return CASE.find((c) => c.dim.test(dim))?.casa ?? ALTRO;
  const titolo = String(d?.titolo ?? "");
  return CASE.find((c) => c.titolo.test(titolo))?.casa ?? SENZA_CASA;
}

export const GRAVITA = Object.freeze(["bloccante", "grave", "medio", "minore"]);
const vuota = () => ({ bloccante: 0, grave: 0, medio: 0, minore: 0, senza: 0, totale: 0 });
const gravitaDi = (g) => (GRAVITA.includes(String(g ?? "").trim()) ? String(g).trim() : "senza");

/** I difetti NON chiusi della macchina, casa per casa. Lo stato si legge dalla porta unica `eChiusa`. */
export function contaPerCasa(difetti = []) {
  const case_ = {};
  const totale = vuota();
  for (const d of difetti) {
    if (!d || eChiusa(d)) continue;
    const casa = casaDi(d);
    const g = gravitaDi(d.gravita);
    case_[casa] ??= vuota();
    case_[casa][g]++;
    case_[casa].totale++;
    totale[g]++;
    totale.totale++;
  }
  const ordinate = Object.fromEntries(ORDINE_CASE.filter((c) => case_[c]).map((c) => [c, case_[c]]));
  return { case: ordinate, totale };
}

/** I difetti APERTI del sito. Sul sito «riparato», «doppione» e «gia_riparato_prima» non sono lavoro. */
export function contaSito(problemi = []) {
  const t = vuota();
  for (const d of problemi) {
    if (!d || String(d.stato ?? "").trim() !== "aperto") continue;
    t[gravitaDi(d.severita)]++;
    t.totale++;
  }
  return t;
}

/** I bloccanti ancora vivi, con il titolo come lo si dice a voce. */
export function bloccanti(difetti = [], { campoGravita = "gravita", vivo = (d) => !eChiusa(d) } = {}) {
  return difetti
    .filter((d) => d && vivo(d) && String(d[campoGravita] ?? "").trim() === "bloccante")
    .map((d) => ({ id: d.id || null, titolo: String(d.titolo || "(senza titolo)"), stato: statoDi(d) }));
}

// ── Gli organi, dalla visita ────────────────────────────────────────────────

export const ORGANI = Object.freeze({
  worker: "Worker e server",
  cervello: "Cervello (l'AD)",
  cabina: "Cabina (il Pannello)",
  senior: "I 120 senior",
  sensori: "Sensori",
});

/** I controlli della visita, organo per organo. `guasto` (il controllo stesso si è rotto) conta come rosso. */
export function organiDaVisita(controlli = []) {
  const out = {};
  for (const c of controlli) {
    if (!c) continue;
    const o = (out[c.organo || "altro"] ??= { ok: 0, rotti: [], nonvisti: [] });
    if (c.esito === "ok") o.ok++;
    else if (c.esito === "nonvisto") o.nonvisti.push({ titolo: c.titolo, detto: c.detto || "" });
    else o.rotti.push({ titolo: c.titolo, detto: c.detto || "", cronico: !!c.cronico });
  }
  return out;
}

/** Il segno di un organo: un rosso vince su tutto; un organo con soli ⚪ resta ⚪, mai ✅. */
export function segnoOrgano(o) {
  if (o.rotti.length) return "❌";
  if (o.ok === 0) return "⚪";
  return "✅";
}

// ── Il ritmo ────────────────────────────────────────────────────────────────

/** Gli ultimi mesi del cantiere, più il verdetto del mese in corso (con la sua soglia di campione). */
export function ritmo(difetti = [], mese, quanti = 4) {
  const storia = perMese(difetti).filter((m) => m.mese <= mese).slice(-quanti);
  const corrente = contaMese(difetti, mese);
  return { storia, mese: { mese, ...corrente }, adesso: verdetto(corrente), obiettivo: OBIETTIVO };
}

// ── I consigli ──────────────────────────────────────────────────────────────

/** Al massimo quattro righe: la parola da dire, e perché. Solo dove c'è un rosso. */
export function consigli({ organi = {}, macchina, sito, ritmo: r }) {
  // Ogni quadro consiglia solo la sua casa: il sito ha il suo quadro.
  const out = [];
  const rossi = Object.values(organi).reduce((n, o) => n + o.rotti.length, 0);
  if (rossi) out.push(`«checkup» — ${conta(rossi, "controllo degli organi è rosso", "controlli degli organi sono rossi")}: la visita apre l'organo malato e lo segue fino al verde.`);
  if (macchina?.totale?.bloccante) out.push(`«sistema i difetti» — ${conta(macchina.totale.bloccante, "bloccante", "bloccanti")} sulla macchina; si parte da lì, non dai minori.`);
  const seriSito = (sito?.bloccante || 0) + (sito?.grave || 0);
  if (seriSito) out.push(`«chiudi i gravi del sito» — ${seriSito} difetti seri sul sito (${sito.bloccante} bloccanti, ${sito.grave} gravi).`);
  const sotto = r?.storia?.slice(-2).some((m) => m.nati >= 5 && m.tasso !== null && m.tasso < OBIETTIVO);
  if (sotto || r?.adesso?.esito === "sotto") out.push("Finché chiudo meno di quanto apro, prima si chiude e poi si cerca: niente radiografie nuove.");
  return out;
}

// ── Il testo ────────────────────────────────────────────────────────────────

const MESI = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];
const nomeMese = (m) => `${MESI[Number(m.slice(5, 7)) - 1] || m} ${m.slice(0, 4)}`;
const virgola = (x) => String(x).replace(".", ",");
const corto = (s, n = 110) => {
  const t = String(s).replace(/\s+/g, " ").trim();
  return t.length > n ? `${t.slice(0, n - 1).trimEnd()}…` : t;
};
const conta = (n, uno, tanti) => `${n} ${n === 1 ? uno : tanti}`;
/** Il titolo senza l'etichetta di gravità scritta dentro: la gravità la dice già la sezione. */
const senzaEtichetta = (t) => String(t).replace(/^🔴\s*BLOCCANTE\s*[—–-]\s*/u, "");
const col = (x, n) => String(x).padStart(n);

export function testoQuadro(q) {
  const r = [];
  const m = q.macchina?.totale;
  const s = q.sito;
  const tuttiControlli = Object.values(q.organi || {});
  const nRossi = tuttiControlli.reduce((n, o) => n + o.rotti.length, 0);
  const nVisti = tuttiControlli.reduce((n, o) => n + o.ok + o.rotti.length, 0);
  const nNonVisti = tuttiControlli.reduce((n, o) => n + o.nonvisti.length, 0);

  const delSito = q.ambito === "sito";
  r.push(`${delSito ? "🏪 IL QUADRO DEL SITO" : "📋 IL QUADRO DELLA MACCHINA"} — ${q.quando} · da ${q.casa}`, "");
  const pezzi = [];
  if (m) pezzi.push(`sulla macchina restano ${m.totale} difetti aperti, ${m.bloccante} bloccanti.`);
  if (s) pezzi.push(`sul sito restano ${s.totale} difetti aperti: ${s.bloccante} bloccanti, ${s.grave} gravi, il resto minori.`);
  if (q.organi) pezzi.push(`Degli organi, ${nRossi} controlli rossi su ${nVisti} guardati, e ${nNonVisti} non li ho potuti vedere da qui.`);
  if (!pezzi.length) pezzi.push("non ho potuto leggere niente: questo quadro è vuoto, che non vuol dire a posto.");
  r.push(`In due righe — ${pezzi.join(" ")}`, "");

  if (q.organi) {
    r.push(`GLI ORGANI — ${q.visita.fonte}`);
    for (const [k, o] of Object.entries(q.organi)) {
      const nome = ORGANI[k] || k;
      const conti = [o.rotti.length && conta(o.rotti.length, "rosso", "rossi"), o.ok && `${o.ok} a posto`, o.nonvisti.length && conta(o.nonvisti.length, "non visto", "non visti")].filter(Boolean).join(" · ");
      r.push(`  ${segnoOrgano(o).padEnd(3)} ${nome.padEnd(22)} ${conti}`);
      for (const x of o.rotti) r.push(`        · ${corto(`${x.titolo}${x.cronico ? " (da più visite)" : ""}: ${x.detto}`, 130)}`);
    }
    r.push("");
  }

  if (q.macchina) {
    r.push("I DIFETTI APERTI — casa per casa");
    r.push(`  ${"".padEnd(26)}${col("bloccanti", 10)}${col("gravi", 7)}${col("medi", 6)}${col("minori", 8)}${col("totale", 8)}`);
    r.push("  La macchina");
    for (const [casa, c] of Object.entries(q.macchina.case)) {
      r.push(`    ${casa.padEnd(24)}${col(c.bloccante, 10)}${col(c.grave, 7)}${col(c.medio, 6)}${col(c.minore, 8)}${col(c.totale, 8)}`);
    }
    r.push(`    ${"totale macchina".padEnd(24)}${col(m.bloccante, 10)}${col(m.grave, 7)}${col(m.medio, 6)}${col(m.minore, 8)}${col(m.totale, 8)}${m.senza ? `   (${m.senza} senza gravità scritta)` : ""}`);
    r.push("  La casa si legge dalla dimensione della scheda; dove è vaga, dal titolo.", "");
  }

  if (q.ritmo) {
    r.push(`IL RITMO — difetti della macchina chiusi su aperti, mese per mese (obiettivo: almeno ${q.ritmo.obiettivo})`);
    for (const x of q.ritmo.storia) {
      const segno = x.nati < 5 ? "⚪ troppo pochi per dirlo" : x.tasso >= q.ritmo.obiettivo ? `${virgola(x.tasso)} ✅` : `${virgola(x.tasso)} ❌`;
      r.push(`  ${nomeMese(x.mese).padEnd(9)} ${col(x.nati, 4)} aperti → ${col(x.chiusi, 4)} chiusi   ${segno}`);
    }
    const a = q.ritmo.mese;
    if (a && !q.ritmo.storia.some((x) => x.mese === a.mese)) {
      r.push(`  ${nomeMese(a.mese).padEnd(9)} ${col(a.nati, 4)} aperti → ${col(a.chiusi, 4)} chiusi   ⚪ troppo pochi per dirlo`);
    }
    if (q.ritmo.adesso.esito === "piccolo") r.push(`  Il mese in corso non ha ancora un voto: servono almeno 5 difetti nati.`);
    r.push("");
  }

  if (q.sitoAree) {
    r.push("I DIFETTI APERTI DEL SITO — area per area (le dieci più piene)");
    r.push(`  ${"".padEnd(26)}${col("bloccanti", 10)}${col("gravi", 7)}${col("minori", 8)}${col("totale", 8)}`);
    for (const [area, c] of q.sitoAree) r.push(`  ${corto(area, 26).padEnd(26)}${col(c.bloccante, 10)}${col(c.grave, 7)}${col(c.minore, 8)}${col(c.totale, 8)}`);
    r.push(`  ${"totale sito".padEnd(26)}${col(s.bloccante, 10)}${col(s.grave, 7)}${col(s.minore, 8)}${col(s.totale, 8)}`, "");
  }

  const bl = q.bloccanti || [];
  if (bl.length) {
    r.push(`I BLOCCANTI — le cose che fermano tutto (${bl.length} ${delSito ? "sul sito" : "sulla macchina"})`);
    for (const b of bl) r.push(`  · ${corto(senzaEtichetta(b.titolo))}`);
    r.push("");
  }

  if (q.consigli?.length) {
    r.push("COSA FAREI ADESSO — la parola da dirmi");
    q.consigli.forEach((c, i) => r.push(`  ${i + 1}. ${c}`));
    r.push("");
  }

  const nonVisti = [];
  for (const [k, o] of Object.entries(q.organi || {})) for (const x of o.nonvisti) nonVisti.push(`${ORGANI[k] || k} — ${x.titolo}: ${x.detto}`);
  for (const f of q.fontiMancanti || []) nonVisti.push(`Non ho potuto leggere ${f.cosa}: ${f.perche}`);
  if (q.visita?.vecchia) nonVisti.push(q.visita.vecchia);
  if (nonVisti.length) {
    r.push("⚪ COSA NON HO POTUTO VEDERE DA QUI (non è un verde)");
    for (const x of nonVisti) r.push(`  · ${corto(x, 150)}`);
    r.push("");
  }

  r.push("---", "Dettagli tecnici");
  for (const f of q.fontiLette || []) r.push(`  · ${f}`);
  const ids = bl.filter((b) => b.id).map((b) => b.id);
  if (ids.length) r.push(`  · bloccanti: ${ids.join(", ")}`);
  r.push(delSito ? "  · l'altra casa: «quadro» (la macchina)" : "  · l'altra casa: «quadro sito» (il marketplace)");
  r.push(delSito
    ? "  · a fondo: node cervello/pacchetti-lotto.mjs --sito --gravi"
    : "  · a fondo: node cervello/salute.mjs --completo · node cervello/cantiere-prove.mjs · node cervello/tasso-chiusura.mjs");
  return r.join("\n");
}

// ── La raccolta ─────────────────────────────────────────────────────────────

function leggiJson(rel) {
  const p = join(AD_ROOT, rel);
  if (!existsSync(p)) return { errore: "il file non c'è" };
  try {
    return { dati: JSON.parse(readFileSync(p, "utf8")) };
  } catch (e) {
    return { errore: `non si legge (${String(e.message || e).split("\n")[0]})` };
  }
}

/** La visita: di adesso (salute.mjs --json) o l'ultima salvata. Se quella di adesso non risponde, lo dico. */
function visita(senzaVisita) {
  if (!senzaVisita) {
    const r = spawnSync(process.execPath, [join(AD_ROOT, "cervello/salute.mjs"), "--json"], { cwd: AD_ROOT, encoding: "utf8", timeout: 180_000 });
    try {
      const j = JSON.parse(r.stdout);
      if (Array.isArray(j.controlli)) return { controlli: j.controlli, fonte: `la visita di adesso, copertura ${Math.round((j.copertura || 0) * 100)}%`, letta: `visita: node cervello/salute.mjs --json (referto ${String(j.referto || "?").replace(`${AD_ROOT}/`, "")})` };
    } catch {}
  }
  const s = leggiJson(FONTI.salute);
  const ultima = s.dati?.ultime?.claude;
  if (!Array.isArray(ultima?.controlli)) return { errore: s.errore || "nessuna visita salvata" };
  return {
    controlli: ultima.controlli,
    fonte: `l'ultima visita salvata, del ${ultima.quando}`,
    vecchia: senzaVisita ? null : `La visita di adesso non ha risposto: mostro quella salvata del ${ultima.quando}.`,
    letta: `visita: ${FONTI.salute} (ultime.claude, ${ultima.quando})`,
  };
}

/** I difetti aperti del sito, area per area: le `quante` più piene. */
export function areeSito(problemi = [], quante = 10) {
  const m = {};
  for (const d of problemi) {
    if (!d || String(d.stato ?? "").trim() !== "aperto") continue;
    const a = String(d.dimensione || "senza area");
    m[a] ??= { bloccante: 0, grave: 0, medio: 0, minore: 0, senza: 0, totale: 0 };
    m[a][gravitaDi(d.severita)]++;
    m[a].totale++;
  }
  return Object.entries(m).sort((x, y) => y[1].bloccante - x[1].bloccante || y[1].grave - x[1].grave || y[1].totale - x[1].totale).slice(0, quante);
}

export function raccogli({ senzaVisita = false, ambito = "macchina" } = {}) {
  const quando = nowPiacenza();
  const mese = quando.slice(0, 7);
  const q = { ambito, quando, casa: existsSync("/opt/mycity/ad-mycity") ? "vps" : "claude", fontiLette: [], fontiMancanti: [] };

  if (ambito === "sito") {
    // Il quadro del sito non fa la visita: gli organi sono della macchina.
    const si = leggiJson(FONTI.sito);
    const problemi = si.dati?.problemi;
    if (!Array.isArray(problemi)) q.fontiMancanti.push({ cosa: "il registro del sito", perche: si.errore || "manca l'elenco «problemi»" });
    else {
      q.sito = contaSito(problemi);
      q.sitoAree = areeSito(problemi);
      q.bloccanti = bloccanti(problemi, { campoGravita: "severita", vivo: (d) => String(d.stato ?? "").trim() === "aperto" });
      const ultima = problemi.map((d) => d.chiuso_il || "").filter(Boolean).sort().at(-1) || "?";
      q.fontiLette.push(`sito: ${FONTI.sito} (${problemi.length} schede, ultima chiusura ${ultima})`);
    }
    q.consigli = consigli(q);
    return q;
  }

  // Il quadro della macchina non legge il registro del sito.
  const v = visita(senzaVisita);
  if (v.errore) q.fontiMancanti.push({ cosa: "la visita degli organi", perche: v.errore });
  else {
    q.organi = organiDaVisita(v.controlli);
    q.visita = { fonte: v.fonte, vecchia: v.vecchia || null };
    q.fontiLette.push(v.letta);
  }

  const c = leggiJson(FONTI.cantiere);
  const difetti = c.dati?.difetti;
  if (!Array.isArray(difetti)) q.fontiMancanti.push({ cosa: "il cantiere della macchina", perche: c.errore || "manca l'elenco «difetti»" });
  else {
    q.macchina = contaPerCasa(difetti);
    q.ritmo = ritmo(difetti, mese);
    q.bloccanti = bloccanti(difetti);
    q.fontiLette.push(`macchina: ${FONTI.cantiere} (${difetti.length} schede, aggiornato ${c.dati.aggiornato || "?"})`);
  }
  q.consigli = consigli(q);
  return q;
}

/** 0 = ho letto tutto · 2 = mancava una fonte, o la visita di adesso è caduta e ho mostrato quella salvata. */
export function codiceUscita(q) {
  return q.fontiMancanti?.length || q.visita?.vecchia ? 2 : 0;
}

function main() {
  const args = process.argv.slice(2);
  const q = raccogli({ senzaVisita: args.includes("--senza-visita"), ambito: args.includes("--sito") ? "sito" : "macchina" });
  console.log(args.includes("--json") ? JSON.stringify(q, null, 2) : testoQuadro(q));
  process.exit(codiceUscita(q));
}

const lanciato = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (lanciato) main();
