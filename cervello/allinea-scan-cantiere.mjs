#!/usr/bin/env node
// Allinea la lista «Radiografia» (foto scan) al cantiere vivo dopo i fix.
// 🟢 Sola lettura del codice + aggiornamento memoria auto-coscienza.
//
// Problema: il cantiere si chiude coi merge (auto-fix), ma i findings dello scan del 7/7
// restano tutti «aperti» → il Pannello mostra 74 problemi quando ne resta 1 da fare.
//
// Cosa fa:
//   1. Per ogni finding in auto-radiografia.json, se matcha un difetto del cantiere
//      (AR-id nel titolo, titolo simile, stessa dimensione + parole chiave) → copia stato
//   2. Se il finding ha blocco `verifica` e il fix risulta nel codice → chiude come «verificato»
//   3. Aggiorna sync_scan (conteggi aperti/chiusi/in-corso) + voto live dalla sonda
//   4. Stesso schema leggero su radiografia-marketplace.json se esiste chiusi-manuali
//
// Uso:
//   node cervello/allinea-scan-cantiere.mjs
//   node cervello/allinea-scan-cantiere.mjs --json

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { AD_ROOT, nowPiacenza, stampSegnale } from "./git-github.mjs";

const JSON_MODE = process.argv.includes("--json");
const VAULT = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza");
const RAD = join(VAULT, "auto-radiografia.json");
const CANTIERE = join(VAULT, "cantiere-difetti.json");
const MKP = join(VAULT, "radiografia-marketplace.json");

function readJson(path, fallback) {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return fallback;
  }
}
function writeJson(path, data) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8");
}

/** Normalizza per confronto titoli: minuscolo, niente emoji/punteggiatura, spazi collassati. */
function norm(s) {
  return String(s ?? "")
    .toLowerCase()
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
    .replace(/[^a-z0-9àèéìòù\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function paroleSignificative(s) {
  const stop = new Set(["il", "la", "le", "lo", "di", "da", "in", "su", "per", "con", "non", "che", "del", "della", "dei", "una", "uno", "the", "and"]);
  return norm(s)
    .split(" ")
    .filter((w) => w.length > 3 && !stop.has(w));
}

function overlapParole(a, b) {
  const pa = new Set(paroleSignificative(a));
  const pb = new Set(paroleSignificative(b));
  if (!pa.size || !pb.size) return 0;
  let n = 0;
  for (const w of pa) if (pb.has(w)) n++;
  return n / Math.min(pa.size, pb.size);
}

function arId(testo) {
  const m = String(testo ?? "").match(/AR-\d{3}/i);
  return m ? m[0].toUpperCase() : null;
}

/** Verifica oggettiva: il fix del finding è presente nel codice? (stessa logica di auto-fix.mjs) */
function verificaFinding(f) {
  const v = f.verifica;
  if (!v || !v.file || !v.pattern) return { esito: "manuale", dettaglio: "nessuna prova automatica" };
  const p = join(AD_ROOT, v.file);
  if (!existsSync(p)) return { esito: "aperto", dettaglio: `file assente: ${v.file}` };
  let txt = "";
  try {
    txt = readFileSync(p, "utf8");
  } catch (e) {
    return { esito: "aperto", dettaglio: `illeggibile: ${e.message}` };
  }
  let re;
  try {
    re = new RegExp(v.pattern);
  } catch (e) {
    return { esito: "manuale", dettaglio: `pattern non valido: ${e.message}` };
  }
  const trovato = re.test(txt);
  const vuolePresente = v.presente !== false;
  const risolto = vuolePresente ? trovato : !trovato;
  return {
    esito: risolto ? "risolto" : "aperto",
    dettaglio: `${v.file} ${vuolePresente ? "contiene" : "NON contiene"} /${v.pattern}/ → ${trovato ? "trovato" : "assente"}`,
  };
}

function matchCantiere(finding, dimKey, difetti) {
  const ft = finding.titolo || "";
  const fid = arId(ft);
  if (fid) {
    const d = difetti.find((x) => x.id === fid);
    if (d) return d;
  }
  const fn = norm(ft).slice(0, 45);
  for (const d of difetti) {
    const dn = norm(d.titolo || "").slice(0, 45);
    if (fn && dn && (fn.includes(dn.slice(0, 28)) || dn.includes(fn.slice(0, 28)))) return d;
    if (overlapParole(ft, d.titolo) >= 0.55) return d;
    if (d.dimensione === dimKey && overlapParole(ft, d.titolo) >= 0.35) return d;
  }
  return null;
}

function allineaMacchina() {
  const rad = readJson(RAD, null);
  const cantiere = readJson(CANTIERE, { difetti: [] });
  if (!rad) return { ok: false, motivo: "auto-radiografia.json assente" };

  const difetti = Array.isArray(cantiere.difetti) ? cantiere.difetti : [];
  const byId = Object.fromEntries(difetti.filter((d) => d.id).map((d) => [d.id, d]));
  let aggiornati = 0;
  let chiusiVerifica = 0;
  let aperti = 0;
  let chiusi = 0;
  let inCorso = 0;
  const ora = nowPiacenza();

  for (const dim of rad.dimensioni || []) {
    for (const f of dim.findings || []) {
      const d = matchCantiere(f, dim.key, difetti);
      const prev = f.stato;
      if (d) {
        if (d.stato === "chiuso") {
          f.stato = "chiuso";
          f.chiuso_il = f.chiuso_il || d.chiuso_il || "";
          f.chiuso_da = "cantiere";
          f.cantiere_id = d.id;
        } else if (d.stato === "in-corso") {
          f.stato = "in-corso";
          f.cantiere_id = d.id;
        } else if (f.stato !== "chiuso") {
          f.stato = "aperto";
        }
      } else if (f.stato !== "chiuso" && f.verifica) {
        const r = verificaFinding(f);
        if (r.esito === "risolto") {
          f.stato = "chiuso";
          f.chiuso_il = f.chiuso_il || ora;
          f.chiuso_come = r.dettaglio;
          f.chiuso_da = "verifica-codice";
          chiusiVerifica++;
        }
      }
      if (f.stato === "chiuso") chiusi++;
      else if (f.stato === "in-corso") inCorso++;
      else aperti++;
      if (f.stato !== prev) aggiornati++;
    }
  }

  const sonda = rad.sonda || {};
  const votoLive = typeof sonda.voto_provvisorio === "number" ? sonda.voto_provvisorio : null;
  if (votoLive != null) rad.voto_salute_architettura = votoLive;

  rad.sync_scan = {
    aggiornato: nowPiacenza(),
    findings_aperti: aperti,
    findings_in_corso: inCorso,
    findings_chiusi: chiusi,
    findings_tot: aperti + inCorso + chiusi,
    cantiere_aperti: difetti.filter((d) => d.stato === "aperto").length,
    cantiere_in_corso: difetti.filter((d) => d.stato === "in-corso").length,
    cantiere_chiusi: difetti.filter((d) => d.stato === "chiuso").length,
    match_aggiornati: aggiornati,
    chiusi_verifica: chiusiVerifica,
    data_scan: rad.data || null,
    voto_live: votoLive,
  };

  writeJson(RAD, rad);
  return {
    ok: true,
    aggiornati,
    chiusi_verifica: chiusiVerifica,
    aperti,
    in_corso: inCorso,
    chiusi,
    voto_live: votoLive,
    cantiere: { aperti: rad.sync_scan.cantiere_aperti, in_corso: rad.sync_scan.cantiere_in_corso, chiusi: rad.sync_scan.cantiere_chiusi },
  };
}

function allineaMarketplace() {
  const mkp = readJson(MKP, null);
  if (!mkp) return { ok: false, motivo: "radiografia-marketplace.json assente" };

  let aperti = 0;
  let chiusi = 0;
  for (const dim of mkp.dimensioni || []) {
    for (const f of dim.findings || []) {
      if (f.stato === "chiuso") chiusi++;
      else aperti++;
    }
  }

  mkp.sync_scan = {
    aggiornato: nowPiacenza(),
    findings_aperti: aperti,
    findings_chiusi: chiusi,
    findings_tot: aperti + chiusi,
    data_scan: mkp.data || null,
    nota: "Per aggiornare la lista serve un nuovo audit marketplace; i fix sul codice non la riscrivono da soli.",
  };
  writeJson(MKP, mkp);
  return { ok: true, aperti, chiusi };
}

async function main() {
  const mac = allineaMacchina();
  const mkp = allineaMarketplace();
  const ok = mac.ok;
  const sintesi = mac.ok
    ? `macchina: ${mac.aperti} aperti · ${mac.in_corso} in-corso · ${mac.chiusi} chiusi (${mac.aggiornati} aggiornati)`
    : `macchina: ${mac.motivo}`;

  await stampSegnale("allinea-scan-cantiere", ok ? "ok" : "warn", sintesi);

  const out = { ok, quando: nowPiacenza(), macchina: mac, marketplace: mkp };
  if (JSON_MODE) console.log(JSON.stringify(out, null, 2));
  else console.log(`🔄 allinea-scan-cantiere — ${sintesi}`);
  process.exit(ok ? 0 : 1);
}

main().catch(async (e) => {
  await stampSegnale("allinea-scan-cantiere", "errore", (e.message || e).toString().slice(0, 160));
  console.error("ERRORE allinea-scan-cantiere:", e.message || e);
  process.exit(1);
});
