#!/usr/bin/env node
// SBLOCCO CAPACITÀ — il guardiano che veglia i CANCELLI DI REALTÀ delle 46 capacità ancora chiuse.
// Non si possono "sbloccare" a comando: aspettano un fatto vero (prima consegna, rete di negozi,
// storico, via libera legale, città densa). Questo script legge lo stato reale, dice quali cancelli
// sono APERTI/CHIUSI e — appena uno si apre — segnala «queste capacità sono ora COSTRUIBILI».
// Così lo sblocco smette di essere una promessa e diventa una soglia misurata che scatta da sola.
//
// 🟢 Sola lettura (STATO.md). NON scrive, NON tocca il mondo. Nessun numero inventato.
//
// Uso:  node cervello/sblocco-capacita.mjs [--json]
// Exit: 0 = almeno un cancello nuovo è aperto (ci sono capacità costruibili) · 1 = tutti ancora chiusi

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza } from "./git-github.mjs";

const JSON_MODE = process.argv.includes("--json");
const STATO = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/STATO.md");
const INIZIO_STORICO = "2026-06-24"; // primo ordine/briefing reale (fonte: registro-realta) → base dello storico

function numeroDaRiga(testo, etichetta) {
  const re = new RegExp("\\|\\s*" + etichetta + "[^|]*\\|\\s*\\**([0-9]+)", "i");
  const m = testo.match(re);
  return m ? Number(m[1]) : null;
}

function mesiDa(dataIso, now) {
  const d = new Date(dataIso + "T00:00");
  return +(((now - d) / (1000 * 60 * 60 * 24 * 30.44))).toFixed(1);
}

function main() {
  const quandoStr = nowPiacenza();
  const now = (() => {
    const m = quandoStr.match(/(\d{4})-(\d{2})-(\d{2})/);
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date();
  })();

  const testo = existsSync(STATO) ? readFileSync(STATO, "utf8") : "";
  const consegnati = numeroDaRiga(testo, "Ordini consegnati") ?? 0;
  const negozi = numeroDaRiga(testo, "Negozi REALI") ?? 0;
  const mesiStorico = mesiDa(INIZIO_STORICO, now);

  // I cancelli di realtà, ognuno con la sua soglia misurabile e le capacità che apre (mappa dal
  // Piano della Piramide: capacità → fase → cancello). Le 7 già COSTRUITE non compaiono qui.
  const CANCELLI = [
    { id: "G1", nome: "Prima consegna reale", metrica: "ordini consegnati", valore: consegnati, soglia: 1,
      aperto: consegnati >= 1, capacita: [6, 14, 15, 20, 24],
      cosa_serve: "chiudere il primo ordine end-to-end su Pane Quotidiano (accetta→consegna→payout) — mani di Nicola 🔴" },
    { id: "G2", nome: "Rete di botteghe", metrica: "negozi reali confermati", valore: negozi, soglia: 5,
      aperto: negozi >= 5, capacita: [2, 16, 18, 19, 21, 22, 32, 33, 34, 35],
      cosa_serve: "portare a bordo ≥5 negozi reali (onboarding dal 9/7) — servizi-negozio e vita di quartiere" },
    { id: "G2b", nome: "Rete densa + retention", metrica: "negozi reali confermati", valore: negozi, soglia: 10,
      aperto: negozi >= 10, capacita: [3, 8, 9, 10, 11, 17, 25, 26, 27, 28, 29, 31],
      cosa_serve: "≥10 negozi + 2 coorti con retention reale → domanda, logistica, prezzi, gruppo d'acquisto" },
    { id: "G3", nome: "Storico ≥12 mesi", metrica: "mesi di storico", valore: mesiStorico, soglia: 12,
      aperto: mesiStorico >= 12, capacita: [1, 5, 36, 39, 40, 41, 50],
      cosa_serve: "12 mesi di dati veri accumulati → le capacità cognitive (modello del mondo, previsione, scienziato)" },
    { id: "G5", nome: "Città densa + via libera legale", metrica: "negozi reali confermati", valore: negozi, soglia: 30,
      aperto: false, manuale: true, capacita: [42, 43, 44, 45, 46, 47, 48, 49],
      cosa_serve: "≥50% dei negozi del centro sulla rete + parere legale (credito/mutua/profiling) — cancello di Nicola/legale 🔴" },
    { id: "G6", nome: "Specie (Piacenza autonoma e in utile 6 mesi)", metrica: "—", valore: null, soglia: null,
      aperto: false, manuale: true, capacita: [7, 51, 52, 53],
      cosa_serve: "Piacenza autonoma e in utile da 6 mesi → replica su una seconda città" },
  ];

  const aperti = CANCELLI.filter((c) => c.aperto);
  const costruibiliOra = aperti.flatMap((c) => c.capacita);

  const out = {
    ok: costruibiliOra.length > 0,
    quando: quandoStr,
    fonte: "STATO.md (consegnati, negozi) + storico da " + INIZIO_STORICO,
    stato_reale: { ordini_consegnati: consegnati, negozi_reali: negozi, mesi_storico: mesiStorico },
    cancelli: CANCELLI.map((c) => ({
      id: c.id, nome: c.nome, aperto: c.aperto, valore: c.valore, soglia: c.soglia,
      capacita_dietro: c.capacita.length, capacita: c.capacita, cosa_serve: c.cosa_serve,
    })),
    capacita_costruibili_ora: costruibiliOra,
    capacita_ancora_chiuse: CANCELLI.filter((c) => !c.aperto).flatMap((c) => c.capacita).length,
  };

  if (JSON_MODE) {
    console.log(JSON.stringify(out, null, 2));
    process.exit(out.ok ? 0 : 1);
  }

  console.log(`🔓 Sblocco Capacità — ${quandoStr}   (i cancelli di realtà delle 46 chiuse)\n`);
  console.log(`   Stato reale: ${consegnati} consegne · ${negozi} negozi reali · ${mesiStorico} mesi di storico\n`);
  for (const c of CANCELLI) {
    const stato = c.aperto ? "🟢 APERTO" : "🔒 CHIUSO";
    const misura = c.soglia != null ? `  (${c.valore}/${c.soglia} ${c.metrica})` : "";
    console.log(`   ${stato}  ${c.id} · ${c.nome}${misura}  → ${c.capacita.length} capacità`);
    if (!c.aperto) console.log(`      serve: ${c.cosa_serve}`);
  }
  console.log("");
  if (costruibiliOra.length) {
    console.log(`   🟢 ${costruibiliOra.length} capacità ORA COSTRUIBILI (cancello aperto): #${costruibiliOra.join(" #")}`);
    console.log(`      → costruiscile: sono le prossime da convertire in codice.`);
  } else {
    console.log(`   🔒 Tutti i cancelli ancora chiusi: 46 capacità in attesa del loro carburante reale.`);
    console.log(`      Il primo che si apre è G1 (prima consegna) — è nelle mani di Nicola, non nel codice.`);
  }
  process.exit(out.ok ? 0 : 1);
}

main();
