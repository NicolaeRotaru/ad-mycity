#!/usr/bin/env node
// 🚑 SENTINELLA LAVORI — auto-guarigione della coda (upgrade: la macchina si accorge da sola
//    delle azioni APPROVATE che NON sono partite e te le rimette davanti, spiegando perché).
//
// 🟢/🟡 Sicurezza (scelta di Nicola): RI-MOSTRA + SPIEGA, ma NON riesegue nulla da sola.
//    Un'azione 🔴 già approvata (email/payout reali) non riparte mai in automatico → zero doppio-invio.
//    La riesecuzione avviene SOLO quando Nicola clicca "Riprova" nel Pannello (→ /api/riprova).
//
// Cosa fa a ogni giro (timer breve, es. ogni 3 min — mycity-sentinella.timer):
//   1) Trova i lavori con stato=errore che erano AZIONI APPROVATE (tipo: proposta | esegui-azione).
//   2) Ne estrae titolo + MOTIVO del fallimento e li scrive in impostazioni['coda:falliti'] →
//      il Pannello mostra un avviso "N azioni approvate non eseguite — riapprova".
//   3) Recupera gli ORFANI (in_corso da troppo): quelli sicuri (giro/chat/metabolizza) li rimette
//      in coda; quelli reali (esegui-azione/proposta) li marca 'errore' con nota "riapprova"
//      (mai riesecuzione silenziosa di un'azione a metà).
//   4) Lascia un battito (stampSegnale) e, se configurato, un ping Telegram sui NUOVI falliti.
//
// Uso:  node cervello/sentinella-lavori.mjs [--json]
// Env:  SUPABASE_URL + SUPABASE_SERVICE_KEY (progetto MEMORIA). Opz: TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID.

import { nowPiacenza, stampSegnale } from "./git-github.mjs";
import { decidiRitento } from "./retry-policy.mjs";

const URL = process.env.SUPABASE_URL?.trim();
const KEY = process.env.SUPABASE_SERVICE_KEY?.trim();
const JSON_MODE = process.argv.includes("--json");

const TIPI_AZIONE = ["proposta", "esegui-azione"]; // job che eseguono un'azione approvata
const TIPI_ORFANO_SICURO = ["giro", "chat", "metabolizza", "analisi"]; // requeue sicuro
const ORFANO_MIN = 10; // minuti oltre i quali un in_corso è considerato orfano
const MARKER = "[sentinella:segnalata]";

function headers() {
  return { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };
}

async function q(path, init = {}) {
  const res = await fetch(`${URL}/rest/v1/${path}`, { ...init, headers: { ...headers(), ...(init.headers || {}) }, cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 160)}`);
  const t = await res.text();
  return t ? JSON.parse(t) : [];
}

// Titolo leggibile: estrae il «...» dalla proposta, o la prima riga della richiesta.
function titoloDa(richiesta = "") {
  const m = richiesta.match(/«([^»]+)»/);
  if (m) return m[1].trim();
  const riga = richiesta.split("\n").find((r) => r.trim());
  return (riga || "azione").replace(/^(È stata APPROVATA|Nicola ha APPROVATO.*?:)/i, "").trim().slice(0, 120) || "azione";
}

// Motivo: l'ultima parte del risultato del worker (dove sta l'errore vero).
function motivoDa(risultato = "") {
  const righe = risultato.split("\n").map((r) => r.trim()).filter(Boolean);
  const worker = righe.reverse().find((r) => /\[worker\]|timeout|rc=|errore|error|motore/i.test(r));
  return (worker || righe[0] || "il worker non ha lasciato dettagli").slice(0, 200);
}

async function main() {
  const quando = nowPiacenza();
  if (!URL || !KEY) {
    const msg = "SUPABASE_URL/SERVICE_KEY (memoria) assenti: sentinella no-op.";
    if (JSON_MODE) console.log(JSON.stringify({ esito: "skip", motivo: msg, quando }));
    else console.log(`⏭️  ${msg}`);
    process.exit(0);
  }

  // 1) Lavori falliti (stato=errore) — con i campi per il ritentativo.
  const errore = await q("lavori?stato=eq.errore&select=id,created_at,updated_at,tipo,richiesta,risultato,tentativi&order=created_at.desc&limit=100");

  // 1b) AUTO-RECOVERY (rete di sicurezza): se un lavoro è fallito con un errore RITENTABILE ma è
  //     rimasto 'errore' senza essere ri-programmato dal worker (worker morto a metà, crash, o codice
  //     vecchio), lo ri-armo io: torna in_attesa con riprova_dopo. Regola IDENTICA al worker
  //     (retry-policy.mjs): quota = provato-non-partito → sicuro anche 🔴; timeout su azione reale → resto fermo.
  const nowMs = Date.now();
  let riarmati = 0;
  const bloccati = []; // i davvero fermi (policy = stop) → questi vanno mostrati a Nicola
  for (const l of errore) {
    let d = { azione: "stop" };
    try {
      d = decidiRitento({ tipo: l.tipo, tentativi: l.tentativi ?? 0, risultato: l.risultato, nowMs });
    } catch {
      /* in caso di dubbio: NON ritentare (prudenza) */
    }
    if (d.azione === "ritenta") {
      await q(`lavori?id=eq.${l.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          stato: "in_attesa",
          tentativi: d.tentativi,
          riprova_dopo: d.quandoISO,
          risultato: `${(l.risultato || "").slice(0, 1200)}\n[sentinella] ri-armato: tentativo ${d.tentativi} per ${d.quandoISO} — ${d.motivo} · ${quando}`,
        }),
      }).catch(() => {});
      riarmati += 1;
    } else {
      bloccati.push(l);
    }
  }

  // I "da riapprovare" nel Pannello = i falliti DAVVERO fermi (non più auto-ritentabili):
  // azioni reali interrotte a metà, oppure tentativi automatici esauriti (quota/motore da sistemare).
  const falliti = bloccati.filter((l) => TIPI_AZIONE.includes(l.tipo));
  const nuovi = falliti.filter((l) => !(l.risultato || "").includes(MARKER));

  const voci = falliti.map((l) => ({
    id: l.id,
    titolo: titoloDa(l.richiesta),
    tipo: l.tipo,
    quando: l.updated_at || l.created_at,
    motivo: motivoDa(l.risultato),
  }));

  // 2) Pubblica la lista per il Pannello (banner "azioni approvate non eseguite")
  await q("impostazioni?on_conflict=chiave", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({
      chiave: "coda:falliti",
      valore: JSON.stringify({ aggiornato: quando, n: voci.length, voci }).slice(0, 8000),
      updated_at: new Date().toISOString(),
    }),
  });

  // 2b) Marca i nuovi come "segnalati" (così il ping Telegram non si ripete a ogni giro)
  for (const l of nuovi) {
    const nota = `${(l.risultato || "").slice(0, 1500)}\n${MARKER} ${quando}`;
    await q(`lavori?id=eq.${l.id}`, { method: "PATCH", body: JSON.stringify({ risultato: nota }) }).catch(() => {});
  }

  // 3) Orfani: in_corso da troppo tempo
  const inCorso = await q("lavori?stato=eq.in_corso&select=id,tipo,updated_at,created_at&order=updated_at.asc&limit=50");
  const sogliaMs = ORFANO_MIN * 60 * 1000;
  let requeued = 0;
  let orfaniReali = 0;
  for (const l of inCorso) {
    const t = new Date(l.updated_at || l.created_at).getTime();
    if (Number.isNaN(t) || Date.now() - t < sogliaMs) continue;
    if (TIPI_ORFANO_SICURO.includes(l.tipo)) {
      await q(`lavori?id=eq.${l.id}`, { method: "PATCH", body: JSON.stringify({ stato: "in_attesa" }) }).catch(() => {});
      requeued += 1;
    } else {
      // Azione reale interrotta: NON rieseguo da solo → errore con nota, finisce tra i "da riapprovare".
      await q(`lavori?id=eq.${l.id}`, {
        method: "PATCH",
        body: JSON.stringify({ stato: "errore", risultato: `[sentinella] interrotto (worker riavviato a metà) — riapprova per rieseguire. ${quando}` }),
      }).catch(() => {});
      orfaniReali += 1;
    }
  }

  // 4) Battito + ping Telegram sui nuovi
  const sintesi = `${riarmati} ri-armati (auto-retry) · ${voci.length} fermi da riapprovare (${nuovi.length} nuovi) · ${requeued} orfani ripresi · ${orfaniReali} reali da riapprovare`;
  await stampSegnale("sentinella-lavori", voci.length > 0 ? "warn" : "ok", `${sintesi} · ${quando}`);

  const tgTok = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const tgChat = process.env.TELEGRAM_CHAT_ID?.trim();
  if ((nuovi.length > 0 || orfaniReali > 0) && tgTok && tgChat) {
    const testo = `🚑 MyCity — ${nuovi.length + orfaniReali} azioni approvate NON eseguite (worker giù).\n` +
      voci.slice(0, 5).map((v) => `• ${v.titolo} — ${v.motivo}`).join("\n") +
      `\nAprile nel Pannello → "Riprova" per rieseguirle.`;
    await fetch(`https://api.telegram.org/bot${tgTok}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: tgChat, text: testo.slice(0, 3500) }),
    }).catch(() => {});
  }

  const out = { esito: "ok", quando, riarmati, falliti: voci.length, nuovi: nuovi.length, orfani_ripresi: requeued, orfani_reali: orfaniReali, voci };
  if (JSON_MODE) console.log(JSON.stringify(out, null, 2));
  else {
    console.log(`\n🚑 SENTINELLA LAVORI — ${quando}\n${sintesi}\n`);
    if (riarmati) console.log(`  🔁 ${riarmati} lavoro/i ri-armati in automatico (ritentativo programmato).`);
    for (const v of voci) console.log(`  ⚠️  ${v.titolo}\n      motivo: ${v.motivo}`);
    if (!voci.length) console.log("  ✅ Nessuna azione approvata in errore.");
  }
  process.exit(0);
}

main().catch(async (e) => {
  console.error("ERRORE sentinella-lavori:", e.message || e);
  await stampSegnale("sentinella-lavori", "errore", `crash: ${(e.message || e).toString().slice(0, 160)}`);
  process.exit(1);
});
