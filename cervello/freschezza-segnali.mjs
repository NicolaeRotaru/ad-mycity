#!/usr/bin/env node
// freschezza-segnali.mjs — meta-guardiano: i guardiani del preambolo hanno lasciato un battito?
// Se un guardiano crasha ma giro.sh ingoia l'errore con || true, questo script segnala l'assenza.
//
// Uso: node cervello/freschezza-segnali.mjs [--max-min=60]
// Exit: 0 = tutti i segnali attesi freschi · 1 = almeno uno mancante/stantio

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { nowPiacenza, stampSegnale } from "./git-github.mjs";
import { attesiDaGiro } from "./segnali-attesi.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const MAX_MIN = Number(process.argv.find((a) => a.startsWith("--max-min="))?.slice(10) || 60);

/**
 * Chi deve battere a ogni giro — MISURATO, non scritto a mano (AR-373, lotto 33).
 *
 * Prima qui c'era un elenco di otto nomi. Uno di quegli otto (`coerenza-fatti`) non è mai stato
 * emesso da nessuno: il guardiano falliva a ogni giro da sempre, e nessun giro poteva uscire pulito.
 * L'elenco si era scollegato dal codice e nessuno poteva accorgersene, perché un allarme sempre
 * acceso si legge come sfondo.
 *
 * Adesso l'elenco si deriva dal codice vero: gli script che giro.sh invoca, e i nomi che quegli
 * script passano a `stampSegnale`. Un nome nuovo entra da solo, un nome tolto sparisce da solo.
 */
function attesi() {
  const leggi = (nome) => {
    try {
      return readFileSync(join(QUI, nome), "utf8");
    } catch {
      return null;
    }
  };
  let testoGiro;
  try {
    testoGiro = readFileSync(join(QUI, "giro.sh"), "utf8");
  } catch {
    return { attesi: null, nonLetti: ["giro.sh"] };
  }
  return attesiDaGiro(testoGiro, leggi);
}

function etaMinutiIso(iso) {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return Math.round((Date.now() - t) / 60000);
}

async function leggiSegnali() {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_KEY?.trim();
  if (!url || !key) return { ok: false, motivo: "Supabase non configurato", segnali: {} };

  const res = await fetch(
    `${url}/rest/v1/impostazioni?select=chiave,valore,updated_at&chiave=like.automazione.*`,
    {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(8000),
    }
  );
  if (!res.ok) return { ok: false, motivo: `HTTP ${res.status}`, segnali: {} };
  const rows = await res.json();
  const segnali = {};
  for (const r of rows) {
    const nome = String(r.chiave || "").replace(/^automazione:/, "");
    if (nome) segnali[nome] = { valore: r.valore, updated_at: r.updated_at };
  }
  return { ok: true, segnali };
}

async function main() {
  const quando = nowPiacenza();
  const { ok, motivo, segnali } = await leggiSegnali();
  if (!ok) {
    console.log(`⚠️  freschezza-segnali: ${motivo} — skip (normale in sessione senza Supabase).`);
    await stampSegnale("freschezza-segnali", "warn", `non verificabile: ${motivo} · ${quando}`);
    process.exit(0);
  }

  // ⚪ non è mai ✅: se non riesco nemmeno a derivare CHI deve battere, non posso dire che battono
  // tutti. Prima di questo lotto un elenco vuoto sarebbe passato per «zero mancanti».
  const { attesi: ATTESI, nonLetti } = attesi();
  if (!ATTESI || !ATTESI.length) {
    const motivo = `non ho potuto derivare chi deve battere (${nonLetti.join(", ") || "nessuno script letto"})`;
    console.log(`⚠️  freschezza-segnali CIECO: ${motivo}`);
    await stampSegnale("freschezza-segnali", "warn", `cieco: ${motivo} · ${quando}`);
    process.exit(2);
  }

  // DUE DOMANDE DIVERSE, e prima del lotto 33 avevano la stessa risposta.
  //
  //   · «ha SMESSO di battere» — l'ho già visto battere, e adesso il suo segnale è vecchio. È il
  //     guasto vero: qualcosa che funzionava si è rotto. FERMA il giro.
  //   · «non l'ho mai visto» — nessun battito, mai. Con l'elenco derivato questo è quasi sempre uno
  //     script che il giro invoca in un ramo CONDIZIONALE e che stavolta non è passato. Trattarlo
  //     come un guasto ricrea esattamente il difetto che stiamo curando: un allarme sempre acceso,
  //     che si impara a ignorare. Si SCRIVE — non sparisce, resta sotto gli occhi — ma non ferma.
  //
  // Non fondere le due cose è metà della cura: derivare l'elenco toglie i fantasmi, distinguere il
  // silenzio cronico dal guasto nuovo toglie il rumore che li rendeva invisibili.
  const maiVisti = [];
  const stantii = [];
  for (const nome of ATTESI) {
    const s = segnali[nome];
    if (!s) {
      maiVisti.push(nome);
      continue;
    }
    const eta = etaMinutiIso(s.updated_at);
    if (eta == null || eta > MAX_MIN) stantii.push(`${nome} (${eta ?? "?"}min)`);
  }

  const vivi = ATTESI.length - maiVisti.length;
  const codaMaiVisti = maiVisti.length ? ` · mai visti (rami condizionali): ${maiVisti.slice(0, 8).join(", ")}${maiVisti.length > 8 ? ` +${maiVisti.length - 8}` : ""}` : "";

  if (stantii.length) {
    const sintesi = `${stantii.length} guardiani hanno SMESSO di battere (max ${MAX_MIN}min): ${stantii.slice(0, 5).join(", ")}${codaMaiVisti}`;
    console.log(`⚠️  ${sintesi}`);
    await stampSegnale("freschezza-segnali", "warn", `${sintesi} · ${quando}`);
    process.exit(1);
  }

  console.log(`✅ freschezza-segnali: ${vivi}/${ATTESI.length} guardiani attesi con battito fresco (≤${MAX_MIN}min)${codaMaiVisti}`);
  await stampSegnale("freschezza-segnali", "ok", `${vivi}/${ATTESI.length} freschi${codaMaiVisti} · ${quando}`);
  process.exit(0);
}

main().catch(async (e) => {
  await stampSegnale("freschezza-segnali", "errore", `crash: ${(e.message || e).toString().slice(0, 160)}`);
  console.error("ERRORE freschezza-segnali:", e.message || e);
  process.exit(1);
});
