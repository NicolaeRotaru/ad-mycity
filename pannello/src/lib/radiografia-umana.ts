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
  // Auto-coscienza e giro
  [/\bNorth Star\s*0→1\b/gi, "primo ordine reale consegnato (obiettivo principale)"],
  [/\bNorth Star\s*0\b/gi, "ancora zero ordini reali"],
  [/\bNorth Star\b/gi, "obiettivo principale (primo ordine reale)"],
  [/\bREST\s+live\b/gi, "dati live dal sito"],
  [/\bREST\s+ok\b/gi, "dati del sito ok"],
  [/\bREST\b/g, "dati reali dal sito"],
  [/\bMCP\s+Supabase\s+cieco\b/gi, "collegamento diretto al database non attivo in questa sessione"],
  [/\bMCP\b/g, "collegamento diretto agli strumenti"],
  [/\bBURN_MENSILE_EUR\b/g, "spesa mensile in euro (da impostare sul server)"],
  [/\bvps\/\.env\b/gi, "file di configurazione sul server"],
  [/\bdelta-gate\b/gi, "controllo «è cambiato qualcosa dal giro precedente?»"],
  [/\bgiri_ciechi\b/gi, "giri senza accesso ai dati"],
  [/\bcantiere_difetti\b/gi, "lista difetti da sistemare"],
  [/\bPostHog\b/g, "strumento che misura le visite del sito"],
  [/\bGATE-BUDGET\b/gi, "freno sul budget dell'AI"],
  [/\bcoerenza-fatti\b/gi, "controllo che i numeri tornino ovunque"],
  [/\bchiusura-loop\b/gi, "registro di cosa ha imparato ogni reparto"],
  [/\ballowlist\b/gi, "lista permessi"],
  [/\bpreference learning\b/gi, "cosa ho capito delle tue preferenze"],
  [/\bscelta_ragionata\b/gi, "scelta motivata con prove"],
  [/\bda_verificare\b/gi, "da confermare con te"],
  [/\bpayout-test\b/gi, "test dell'incasso al negozio"],
  [/\bVP\b/g, "Venerdì Piacentini"],
  [/\bT-(\d+)\b/g, "$1 giorni prima dell'evento"],
  [/\bApprova\s+#(\d+)\b/gi, "approva la card $1 in Da approvare"],
  [/\bPR\s+#(\d+)\b/gi, "modifica da approvare numero $1"],
  [/\bAR-(\d+)\b/g, "regola interna AR-$1"],
  [/\bCtrl\+Shift\+R\b/gi, "ricarica forzata del Pannello"],
  [/\bgiri\b/gi, "cicli di controllo"],
  [/\bstallo\b/gi, "fermo"],
  [/\bseller_id\b/gi, "codice negozio"],
  [/\banti-?churn\b/gi, "controllo per non perdere negozi"],
  [/\bpeer review\b/gi, "revisione tra specialisti"],
  [/\bauto-riscrittura\b/gi, "riscrittura automatica dei prompt"],
  [/\[\[([^\]]+)\]\]/g, "($1)"],
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

/** Traduzione completa senza tagli: tutto il testo, in italiano semplice. */
export function traduciTestoCompleto(s: string): string {
  let t = testoPulito(s);
  if (!t) return "";
  const pathSegnaposto: string[] = [];
  t = t.replace(
    /[`']?((?:consegne|creativi|MyCity-Vault|cervello|pannello|vps)\/[\w./@-]+(?:\.[\w]+)?)[`']?/gi,
    (m) => {
      const i = pathSegnaposto.length;
      pathSegnaposto.push(m.replace(/[`']/g, ""));
      return `§P${i}§`;
    },
  );
  t = traduciSlugNelTesto(t);
  t = applicaSostituzioni(t);
  t = t.replace(/§P(\d+)§/g, (_, i) => {
    const p = pathSegnaposto[Number(i)] || "";
    const file = p.split("/").pop() || p;
    const cartella = p.split("/")[0] || "archivio";
    return `documento in ${cartella.replace("MyCity-Vault", "memoria")} (${file})`;
  });
  return t
    .split("\n")
    .map((riga) => riga.replace(/[^\S\n]{2,}/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export type QuadroTesto = { visibile: string; tecnici: string };

/** Testo umano completo + appendice con originali/path/codici (niente omesso). */
export function quadroTesto(testo: string): QuadroTesto {
  const raw = (testo || "").trim();
  if (!raw) return { visibile: "", tecnici: "" };
  const visibile = traduciTestoCompleto(raw);
  const parti: string[] = [];
  if (raw !== visibile) parti.push(raw);
  const paths = [...raw.matchAll(/(?:consegne|creativi|MyCity-Vault|cervello|pannello|vps)\/[\w./@-]+/g)].map((m) => m[0]);
  const codici = [...raw.matchAll(/\b(?:L-\d{4}-\d{3,}|AR-\d+|PR #\d+)\b/g)].map((m) => m[0]);
  if (paths.length) parti.push("File:\n" + [...new Set(paths)].join("\n"));
  if (codici.length) parti.push("Codici:\n" + [...new Set(codici)].join(" · "));
  return { visibile: visibile || raw, tecnici: parti.filter(Boolean).join("\n\n") };
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
  const cosaSuccede = e.dettaglio ? traduciTestoCompleto(e.dettaglio) : titolo;
  const tecnici = bloccoTecnico([
    e.titolo && e.titolo !== titolo ? `Titolo originale:\n${e.titolo}` : undefined,
    e.dettaglio && e.dettaglio !== cosaSuccede ? `Dettaglio originale:\n${e.dettaglio}` : undefined,
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
