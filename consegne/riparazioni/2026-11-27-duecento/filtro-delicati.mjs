// Filtro dei delicati sul testo della voce (regola 4 del 21/11): titolo + descrizione + impatto + fix del registro.
import { readFileSync, writeFileSync } from "node:fs";
const [C] = process.argv.slice(2);
const per0 = JSON.parse(readFileSync(`${C}/perimetro.json`, "utf8")); const senza = new Set(JSON.parse(readFileSync(`${C}/senza-nicola.json`, "utf8")).senza); const per = { ...per0, lavorabili: per0.lavorabili.filter((v) => senza.has(v.chiave)) };
const reg = JSON.parse(readFileSync("MyCity-Vault/90-Memoria-AI/auto-coscienza/radiografia-marketplace.json", "utf8")).problemi;
const { chiaveProblema } = await import(process.cwd() + "/cervello/referti-sito.mjs");
const perChiave = new Map(reg.map((p) => [chiaveProblema(p), p]));
const vecchi = (n) => { try { return new Set(JSON.parse(readFileSync(`consegne/riparazioni/2026-11-21-settimana-700/${n}/perimetro.json`, "utf8")).lavorabili.map((v) => v.chiave)); } catch { return new Set(); } };
const exDel = vecchi("delicati"), exNor = vecchi("normali");
const L = "(?<![a-zà-ù])"; // inizio di parola: «età» non deve prendere «quantità», «iva» non deve prendere «arriva»
const RX = new RegExp(L + "(rimbors|pagament|payout|stripe|cassa|contant|bonific|carta di|carte di|addebit|incass|commission|prezz|totale|iva\\b|fattur|soldi|€|euro|annull|cancellazion|elimin|account|privacy|gdpr|dati personal|consens|telefon|indirizz|permess|ruol|admin|rls|policy|login|password|token|segret|sicurezz|resi\\b|reso\\b|storn|chargeback|disput|maggiore età|minorenn|disiscri|promozion|coupon|scont)", "i");
const DIM = new Set(["pagamenti-stripe", "privacy-legale", "rls-database", "sicurezza-auth"]);
const out = { delicati: [], normali: [], perche: {} };
for (const v of per.lavorabili) {
  const p = perChiave.get(v.chiave) || {};
  const testo = [v.titolo, p.descrizione, p.impatto, p.fix].join(" ");
  let d, m;
  if (v.gravita !== "minore") { d = true; m = "grave o bloccante"; }
  else if (DIM.has(v.dimensione)) { d = true; m = "dimensione " + v.dimensione; }
  else if (RX.test(testo)) { d = true; m = "testo: " + testo.match(RX)[0]; }
  else if (exDel.has(v.chiave)) { d = true; m = "delicata nel giro del 21/11"; }
  else { d = false; m = exNor.has(v.chiave) ? "normale nel giro del 21/11" : "testo senza soldi, dati, permessi"; }
  (d ? out.delicati : out.normali).push(v.chiave); out.perche[v.chiave] = m;
}
writeFileSync(`${C}/filtro-delicati.json`, JSON.stringify(out, null, 1));
writeFileSync(`${C}/chiavi-normali.txt`, out.normali.join("\n") + "\n");
writeFileSync(`${C}/chiavi-delicati.txt`, out.delicati.join("\n") + "\n");
const g = (arr) => { const o = {}; arr.forEach((k) => { const v = per.lavorabili.find((x) => x.chiave === k); o[v.gravita] = (o[v.gravita] || 0) + 1; }); return o; };
console.log("delicati", out.delicati.length, g(out.delicati), "· normali", out.normali.length, g(out.normali));
const ex = out.normali.filter((k) => exDel.has(k)).length; console.log("normali che il 21/11 erano delicate:", ex);
