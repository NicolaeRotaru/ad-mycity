// Testo umano per radiografia macchina, salute sito e auto-coscienza (cervello/scrittura-umana.md).
// Titolo e corpo = come glielo diresti a voce; path, sigle e originali = sotto «Dettagli tecnici».

import { pulisciTitolo } from "@/lib/azioni-attesa";
import { testoPulito } from "@/lib/format";
import { nomeReparto } from "@/lib/spiega-azione";

const DIMENSIONI: Record<string, string> = {
  "coerenza-agenti": "La squadra — chi fa cosa",
  "vettori-installati": "Come pensa l'AD",
  "salute-sensori-dati": "Sensori e dati reali",
  "integrità-memoria": "Memoria e coerenza",
  "chiusura-volano": "Chi impara da cosa",
  "cadenza-esecuzione": "Ritmi di lavoro",
  "calibrazione-onesta": "Onestà sui numeri",
  "copertura-cieca": "Angoli ciechi",
  "guardrail-semaforo": "Freni di sicurezza",
  "allineamento-northstar": "Allineamento all'obiettivo",
  "efficienza-costo": "Costo dell'AI",
  "rischio-sicurezza-se": "Rischio tecnico",
  architettura: "Architettura del sito",
  "sicurezza-auth": "Sicurezza e accessi",
  "checkout-pagamenti": "Checkout e pagamenti",
  "ordini-resi": "Ordini e resi",
  "payout-venditori": "Incassi ai negozi",
  "consegne-rider": "Consegne e rider",
  "catalogo-negozi": "Catalogo e negozi",
  "seo-performance": "Velocità e SEO",
  "ux-accessibilita": "Usabilità e accessibilità",
  "osservabilita": "Monitoraggio errori",
  "compliance-privacy": "Privacy e compliance",
  "ops-deploy": "Deploy e operazioni",
};

const SOSTITUZIONI: [RegExp, string][] = [
  [/\bverbatim\b/gi, "parola per parola"],
  [/\bdescription\b/gi, "scheda del ruolo"],
  [/\bfrontmatter\b/gi, "intestazione del file"],
  [/\bsubagente\b/gi, "specialista"],
  [/\brouter\b/gi, "sistema che sceglie chi lavora"],
  [/\bdeferral\b/gi, "rimando"],
  [/\btrigger\b/gi, "parola chiave"],
  [/\bguardiano\b/gi, "controllo automatico"],
  [/\breaddirSync\b/g, "lettura elenco file"],
  [/\bVERIFICATO\.?\s*/gi, ""],
  [/\bowner unico per keyword\b/gi, "solo un responsabile per ogni tema"],
  [/\bresi\/rimborsi falsi\b/gi, "resi falsi"],
  [/\baccount multipli\b/gi, "account doppi"],
  [/\bcollidono sulla stessa frode\b/gi, "si pestano i piedi sulle frodi"],
  [/\bin entrambe le description\b/gi, "in due schede ruolo diverse"],
  [/\bprevenzione frodi\b/gi, "prevenzione frodi"],
  [/\boverselling\b/gi, "vendita di prodotti già esauriti"],
  [/\bRLS\b/g, "permessi database"],
  [/\bTTL\b/g, "tempo massimo di attesa"],
  [/\bwebhook\b/gi, "notifica automatica"],
  [/\bpayout\b/gi, "incasso al negozio"],
  [/\bclaw-back\b/gi, "recupero soldi"],
  [/\bidempotencyKey\b/g, "chiave anti-doppio"],
];

const SLUG_RE = /\b[a-z]+(?:-[a-z]+)+\b/g;
const AT_SLUG_RE = /@([a-z]+(?:-[a-z]+)*)/g;

function traduciSlugNelTesto(s: string): string {
  let t = s.replace(AT_SLUG_RE, (_, slug: string) => nomeReparto(slug) || slug.replace(/-/g, " "));
  return t.replace(SLUG_RE, (m) => {
    const umano = nomeReparto(m);
    if (umano !== "Un senior" && umano.toLowerCase() !== m.toLowerCase()) return umano;
    if (m.includes("-")) return m.replace(/-/g, " ");
    return m;
  });
}

function applicaSostituzioni(s: string): string {
  let t = s;
  for (const [re, rep] of SOSTITUZIONI) t = t.replace(re, rep);
  return t;
}

function frasePrincipale(s: string, max = 320): string {
  const pulito = applicaSostituzioni(traduciSlugNelTesto(testoPulito(s)));
  const senzaPath = pulito
    .replace(/\b[\w./@-]+\.(?:mjs|tsx?|jsx?|ts|sql|md|json|env)(?::\d+(?:-\d+)?)?\b/gi, "")
    .replace(/\b(?:app|lib|src|migrations)\/[\w./@-]+/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  if (!senzaPath) return "";
  const frasi = senzaPath.split(/(?<=[.!?])\s+/).filter(Boolean);
  let out = frasi[0] || senzaPath;
  if (out.length < 80 && frasi[1]) out = `${out} ${frasi[1]}`;
  if (out.length > max) {
    const tagliato = out.slice(0, max - 1);
    const ultimoSpazio = tagliato.lastIndexOf(" ");
    out = (ultimoSpazio > 40 ? tagliato.slice(0, ultimoSpazio) : tagliato) + "…";
  }
  return out;
}

export function dimensioneLeggibile(key: string): string {
  const k = (key || "").trim();
  if (!k) return "";
  return DIMENSIONI[k] || k.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function impattoCrescitaLeggibile(v: string): string {
  const x = (v || "").toLowerCase();
  if (x === "alto") return "pesa molto sulla crescita";
  if (x === "medio") return "pesa sulla crescita";
  if (x === "basso") return "impatto limitato";
  return v;
}

export function titoloFinding(titolo: string): string {
  const raw = testoPulito(titolo);
  if (!raw) return "";
  let t = traduciSlugNelTesto(raw);
  t = applicaSostituzioni(t);
  t = pulisciTitolo(t);
  // Se resta gergo da sviluppatore, prendi la parte prima dei due punti e riscrivila.
  if (/\.(?:mjs|tsx?|ts|sql)|readdir|frontmatter|verbatim|description/i.test(t)) {
    const prima = t.split(/[:—–-]/)[0]?.trim();
    if (prima && prima.length > 12) t = pulisciTitolo(prima);
  }
  if (t.length > 140) {
    const tagliato = t.slice(0, 137);
    const sp = tagliato.lastIndexOf(" ");
    t = (sp > 50 ? tagliato.slice(0, sp) : tagliato) + "…";
  }
  return t || raw;
}

export type FindingUmano = {
  titolo: string;
  cosaSuccede: string;
  perche?: string;
  cosaFare?: string;
  tecnici: string;
};

function bloccoTecnico(parti: (string | undefined)[]): string {
  return parti
    .map((p) => testoPulito(p || ""))
    .filter(Boolean)
    .join("\n\n");
}

export function humanizzaFinding(f: {
  titolo?: string;
  descrizione?: string;
  impatto?: string;
  causa_radice?: string;
  fix?: string;
  fix_proposto?: string;
  dove?: string;
}): FindingUmano {
  const titolo = titoloFinding(f.titolo || "Problema da sistemare");
  const impatto = f.impatto ? frasePrincipale(f.impatto) : "";
  const desc = f.descrizione ? frasePrincipale(f.descrizione) : "";
  const cosaSuccede = impatto || desc || titolo;
  const perche = f.causa_radice ? frasePrincipale(f.causa_radice, 260) : undefined;
  const fixRaw = f.fix || f.fix_proposto;
  const cosaFare = fixRaw ? frasePrincipale(fixRaw, 260) : undefined;
  const tecnici = bloccoTecnico([
    f.descrizione ? `Descrizione audit:\n${f.descrizione}` : undefined,
    f.impatto && f.impatto !== f.descrizione ? `Impatto:\n${f.impatto}` : undefined,
    f.causa_radice ? `Causa radice:\n${f.causa_radice}` : undefined,
    fixRaw ? `Fix proposto:\n${fixRaw}` : undefined,
    f.dove ? `Dove nel codice:\n${f.dove}` : undefined,
  ]);
  return { titolo, cosaSuccede, perche, cosaFare, tecnici };
}

export function humanizzaErrore(e: { titolo?: string; dettaglio?: string; riguarda?: string }): FindingUmano {
  const titolo = titoloFinding(e.titolo || "Errore");
  const cosaSuccede = e.dettaglio ? frasePrincipale(e.dettaglio) : titolo;
  const tecnici = bloccoTecnico([
    e.dettaglio && e.dettaglio !== cosaSuccede ? e.dettaglio : undefined,
    e.riguarda ? `Riguarda: ${e.riguarda}` : undefined,
  ]);
  return { titolo, cosaSuccede, tecnici };
}

export function humanizzaDifetto(d: {
  titolo?: string;
  causa_radice?: string;
  fix_proposto?: string;
  nota_fix?: string;
}): FindingUmano {
  const base = humanizzaFinding({
    titolo: d.titolo,
    causa_radice: d.causa_radice,
    fix: d.fix_proposto,
  });
  if (d.nota_fix) {
    base.tecnici = bloccoTecnico([base.tecnici, `Già fatto nel codice:\n${d.nota_fix}`]);
  }
  return base;
}
