#!/usr/bin/env node
// Capacità #23 — IL MIDOLLO SPINALE. I riflessi rapidi della macchina. Legge lo stato reale delle
// sentinelle e, per ogni segnale, PROPONE un riflesso pronto (trigger + azione + tetto + kill-switch)
// come playbook pre-firmabile. Regola ferrea della Costituzione: NON esegue nulla — ogni riflesso
// nasce 🟡 come proposta; Nicola lo firma UNA volta e da lì scatta da solo NEI LIMITI firmati; i
// riflessi che scrivono a persone reali o toccano la produzione restano 🔴 finché non sono firmati.
//
// 🟢 Sola lettura: legge auto-coscienza/sentinella-dati.json. NON esegue riflessi, NON tocca il mondo.
//
// Uso:  node cervello/midollo-spinale.mjs [--json]
// Exit: 0 sempre (è un proponitore); 1 se un riflesso 🔴 "scatterebbe ORA" e va portato alla firma.

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza } from "./git-github.mjs";

const JSON_MODE = process.argv.includes("--json");
const FILE = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/sentinella-dati.json");

// Il catalogo dei riflessi: ognuno legge una metrica reale dello stato-sentinella.
// scatta(s) = true quando la condizione è vera ORA. colore = livello richiesto alla firma.
const RIFLESSI = [
  { nome: "Ordine pagato senza payout", metrica: "pagati_senza_payout", scatta: (s) => (s.pagati_senza_payout || 0) > 0,
    azione: "Allerta a Nicola + prepara il controllo del payout per quell'ordine", tetto: "1 allerta/ordine", killswitch: "AZIONI_LIVE=0", colore: "🟡" },
  { nome: "Negozio fermo", metrica: "negozi_fermi", scatta: (s) => (s.negozi_fermi || 0) > 0,
    azione: "Accoda l'anti-churn del negozio (telefonata/check-in) come proposta", tetto: "1 proposta/negozio/settimana", killswitch: "AZIONI_LIVE=0", colore: "🔴" },
  { nome: "Salute macchina bassa", metrica: "salute_voto", scatta: (s) => (s.salute_voto || 100) < 60,
    azione: "Accoda una radiografia della macchina + porta i bloccanti in cima alla coda", tetto: "1 radiografia/giorno", killswitch: "gate AR-019", colore: "🟡" },
  { nome: "Sensore cieco", metrica: "sensori_max_ciechi", scatta: (s) => (s.sensori_max_ciechi || 0) >= 3,
    azione: "Passa a baseline (niente numeri nuovi) + allerta quale sensore è cieco", tetto: "1 allerta/sensore", killswitch: "—", colore: "🟡" },
  { nome: "Worker morto", metrica: "worker_eta_min", scatta: (s) => (s.worker_eta_min || 0) > 15,
    azione: "Allerta a Nicola che il battito è fermo da >15 min", tetto: "1 allerta/ora", killswitch: "—", colore: "🟡" },
  { nome: "Carrello abbandonato", metrica: "carrelli", scatta: (s) => (s.carrelli || 0) > 0,
    azione: "Prepara il promemoria carrello (bozza pronta, invio alla firma)", tetto: "1 touch/carrello", killswitch: "mani Resend spente", colore: "🔴" },
  { nome: "Recensione bassa", metrica: "recensioni_basse", scatta: (s) => (s.recensioni_basse || 0) > 0,
    azione: "Accoda la bozza di risposta + avviso a supporto", tetto: "1 bozza/recensione", killswitch: "—", colore: "🔴" },
];

function main() {
  const quando = nowPiacenza();
  if (!existsSync(FILE)) {
    const out = { ok: false, quando, errore: "sentinella-dati.json non trovato" };
    console.log(JSON_MODE ? JSON.stringify(out) : "❌ sentinella-dati.json non trovato");
    process.exit(1);
  }
  const j = JSON.parse(readFileSync(FILE, "utf8"));
  const s = j.ultimo_stato || {};

  const proposte = RIFLESSI.map((r) => ({
    nome: r.nome,
    colore: r.colore,
    scatterebbe_ora: !!r.scatta(s),
    valore_ora: s[r.metrica] ?? null,
    trigger: `${r.metrica} — ${r.azione ? "vedi azione" : ""}`.trim(),
    azione: r.azione,
    tetto: r.tetto,
    kill_switch: r.killswitch,
  }));
  const attiviOra = proposte.filter((p) => p.scatterebbe_ora);
  const rossiOra = attiviOra.filter((p) => p.colore === "🔴");

  const out = {
    ok: true,
    quando,
    fonte: "auto-coscienza/sentinella-dati.json (ultimo_stato reale)",
    stato_letto: { quando: s.quando, salute_voto: s.salute_voto, ordini_tot: s.ordini_tot, worker_eta_min: s.worker_eta_min },
    riflessi_proposti: proposte,
    scatterebbero_ora: attiviOra.length,
    da_portare_alla_firma_ora: rossiOra.length,
    nota: "Nessun riflesso è eseguito: sono proposte 🟡/🔴 da firmare una volta (playbook pre-firmato).",
  };

  if (JSON_MODE) {
    console.log(JSON.stringify(out, null, 2));
    process.exit(rossiOra.length ? 1 : 0);
  }

  console.log(`⚡ Il Midollo Spinale — ${quando}   (riflessi PROPOSTI, non eseguiti)\n`);
  console.log(`   Stato letto: salute ${s.salute_voto ?? "n/d"} · ordini ${s.ordini_tot ?? "n/d"} · worker ${s.worker_eta_min ?? "n/d"} min fa\n`);
  for (const p of proposte) {
    const flag = p.scatterebbe_ora ? "🟢 SCATTA ORA" : "· quieto";
    console.log(`   ${p.colore} ${p.nome.padEnd(28)} [${flag}]  (${p.valore_ora ?? "n/d"})`);
    console.log(`      → ${p.azione} · tetto: ${p.tetto} · kill: ${p.kill_switch}`);
  }
  console.log(`\n   Scatterebbero ORA: ${attiviOra.length} · di cui 🔴 da firmare: ${rossiOra.length}`);
  console.log(`   Regola: la macchina NON li esegue. Firmi il playbook una volta → scatta nei limiti firmati.`);
  process.exit(rossiOra.length ? 1 : 0);
}

main();
