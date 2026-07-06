#!/usr/bin/env node
// Capacità #13 — IL BILANCIO VIVO. Ogni ordine sa quanto rende, al centesimo. Legge i numeri reali
// degli ordini (baseline STATO.md) e applica le unit economics documentate (commissione, contrassegno)
// per dire il margine REALIZZATO (su ciò che è davvero incassato/consegnato) vs il margine POTENZIALE.
// Include la corsia contrassegno: il COD è contante, Stripe non lo vede → riconciliazione a mano.
//
// 🟢 Sola lettura. NON scrive, NON tocca soldi. Ogni cifra ha la sua fonte; se non c'è, resta n/d.
// Oggi c'è 1 solo ordine documentato: il Bilancio è l'ENGINE, gira sottile finché non arrivano ordini
// veri — a quel punto i valori per-ordine andranno dal vivo (REST). Nessun numero inventato.
//
// Uso:  node cervello/bilancio-vivo.mjs [--json]
// Exit: 0 = c'è margine realizzato · 1 = 0 realizzato (business ancora a secco)

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza } from "./git-github.mjs";

const JSON_MODE = process.argv.includes("--json");
const STATO = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/STATO.md");

// Parametri economici DOCUMENTATI (con fonte) — non inventati.
const COMMISSIONE_PCT = { valore: 12, fonte: "contratto Pane Quotidiano firmato 1/7 (registro-realta)" };
const ORDINE_NOTO_EUR = { valore: 19.05, fonte: "ordine #16 COD €19,05 (registro-realta)" };

function numeroDaRiga(testo, etichetta) {
  const re = new RegExp("\\|\\s*" + etichetta + "[^|]*\\|\\s*\\**([0-9]+)", "i");
  const m = testo.match(re);
  return m ? Number(m[1]) : null;
}

const eur = (n) => (n == null ? "n/d" : "€" + n.toFixed(2));

function main() {
  const quando = nowPiacenza();
  if (!existsSync(STATO)) {
    const out = { ok: false, quando, errore: "STATO.md non trovato" };
    console.log(JSON_MODE ? JSON.stringify(out) : "❌ STATO.md non trovato");
    process.exit(1);
  }
  const testo = readFileSync(STATO, "utf8");
  const creati = numeroDaRiga(testo, "Ordini creati");
  const pagati = numeroDaRiga(testo, "Ordini pagati");
  const consegnati = numeroDaRiga(testo, "Ordini consegnati");

  const gmvNoto = ORDINE_NOTO_EUR.valore; // valore dell'unico ordine documentato
  const commissioneUnit = +(gmvNoto * (COMMISSIONE_PCT.valore / 100)).toFixed(2);

  // Realizzato = solo su ciò che è DAVVERO consegnato E pagato. Oggi 0 e 0 → 0.
  const ordiniChiusi = Math.min(pagati ?? 0, consegnati ?? 0);
  const margineRealizzato = +(ordiniChiusi * commissioneUnit).toFixed(2);
  // Potenziale = se l'ordine creato si fosse chiuso.
  const marginePotenziale = +((creati ?? 0) * commissioneUnit).toFixed(2);

  const out = {
    ok: margineRealizzato > 0,
    quando,
    fonte: "STATO.md (conteggi ordini) + parametri economici documentati (registro-realta)",
    parametri: { commissione_pct: COMMISSIONE_PCT, valore_ordine_noto_eur: ORDINE_NOTO_EUR, pagamento: "contrassegno (COD) — Stripe non lo vede, incasso contanti da riconciliare a mano" },
    ordini: { creati, pagati, consegnati, chiusi_end_to_end: ordiniChiusi },
    per_ordine: { gmv_eur: gmvNoto, commissione_mycity_eur: commissioneUnit },
    margine_realizzato_eur: margineRealizzato,
    margine_potenziale_eur: marginePotenziale,
    nota: "Engine pronto: con più ordini i valori per-ordine vanno dal vivo (REST). Oggi 1 ordine documentato, 0 chiusi.",
  };

  if (JSON_MODE) {
    console.log(JSON.stringify(out, null, 2));
    process.exit(out.ok ? 0 : 1);
  }

  console.log(`💶 Il Bilancio Vivo — ${quando}   (unit economics sui numeri reali)\n`);
  console.log(`   Parametri (documentati):`);
  console.log(`     • Commissione MyCity: ${COMMISSIONE_PCT.valore}%   [${COMMISSIONE_PCT.fonte}]`);
  console.log(`     • Valore ordine noto: ${eur(ORDINE_NOTO_EUR.valore)}   [${ORDINE_NOTO_EUR.fonte}]`);
  console.log(`     • Pagamento: contrassegno (COD) → contante, Stripe cieco, riconciliazione a mano\n`);
  console.log(`   Ordini: creati ${creati ?? "n/d"} · pagati ${pagati ?? "n/d"} · consegnati ${consegnati ?? "n/d"} · chiusi end-to-end ${ordiniChiusi}`);
  console.log(`   Per ordine: GMV ${eur(gmvNoto)} → commissione MyCity ${eur(commissioneUnit)}\n`);
  console.log(`   💰 Margine REALIZZATO (incassato+consegnato):  ${eur(margineRealizzato)}`);
  console.log(`   📈 Margine POTENZIALE (se i creati si chiudono): ${eur(marginePotenziale)}`);
  console.log("");
  if (margineRealizzato > 0) console.log(`   ✅ La macchina ha prodotto margine reale.`);
  else console.log(`   🔴 0 margine realizzato: nessun ordine chiuso end-to-end. Il Bilancio si accende col primo ordine consegnato+pagato.`);
  process.exit(out.ok ? 0 : 1);
}

main();
