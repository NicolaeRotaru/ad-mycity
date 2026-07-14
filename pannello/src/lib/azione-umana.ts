// Quadro completo delle azioni «Da approvare»: tutto in italiano semplice,
// nessun dettaglio operativo omesso — i riferimenti tecnici restano in appendice.

import { testoPulito } from "@/lib/format";

export type SezioneAzione = { etichetta: string; testo: string };

const TRADUZIONI: [RegExp, string][] = [
  [/\banti-?churn\b/gi, "controllo per non perdere negozi"],
  [/\bscan REST\b/gi, "lettura dati reali dal sito"],
  [/\bREST\s*→/gi, "dai dati risulta:"],
  [/\b0 negozi in calo\b/gi, "nessun negozio in calo al momento"],
  [/\bNorth Star\s*0→1\b/gi, "primo ordine reale consegnato (obiettivo principale)"],
  [/\bpayout-test\b/gi, "test dell'incasso al negozio"],
  [/\bT-1\b/g, "il giorno prima"],
  [/\bVP\b/g, "Venerdì Piacentini"],
  [/\bplaybook\b/gi, "piano operativo"],
  [/\bsentinella\b/gi, "allarme automatico"],
  [/\bgo-live\b/gi, "andare online sul marketplace"],
  [/\bUTM\b/g, "link tracciato per misurare i click"],
  [/\bCOD\b/g, "pagamento in contanti alla consegna"],
  [/\bKYC\b/g, "verifica identità del negozio"],
  [/\bIBAN\b/g, "IBAN"],
  [/\bQR\b/g, "codice QR"],
];

const META_RIGA_RE = /^[\s>*\-]*\*{0,2}(colore|canale|reparto|origine|stato|mani)\*{0,2}\s*:/i;
const CAMPO_RIGA_RE = /^[\s>*\-]*\*{0,2}([^*:]+)\*{0,2}\s*:\s*(.+)$/;

function traduci(testo: string): string {
  let t = testoPulito(testo);
  const pathSegnaposto: string[] = [];
  t = t.replace(
    /[`']?((?:consegne|creativi|MyCity-Vault)\/[\w./@-]+\.(?:md|json|tsx?))[`']?/gi,
    (m) => {
      const i = pathSegnaposto.length;
      pathSegnaposto.push(m.replace(/[`']/g, ""));
      return `§P${i}§`;
    },
  );
  for (const [re, rep] of TRADUZIONI) t = t.replace(re, rep);
  t = t.replace(/\{origine:[^}]+\}/gi, "");
  t = t.replace(/§P(\d+)§/g, (_, i) => {
    const p = pathSegnaposto[Number(i)] || "";
    const file = p.split("/").pop() || p;
    const cartella = p.includes("/") ? p.split("/")[0] : "archivio";
    return `documento in ${cartella.replace("MyCity-Vault", "memoria")} (${file})`;
  });
  return t.replace(/[^\S\n]{2,}/g, " ").trim();
}

function campo(blocco: string, etichette: string[]): string {
  for (const raw of blocco.split("\n")) {
    const line = raw.replace(/^[\s>*\-]+/, "").replace(/\*\*/g, "").trim();
    for (const et of etichette) {
      const m = line.match(new RegExp("^" + et + "\\s*:\\s*(.+)$", "i"));
      if (m?.[1]?.trim()) return m[1].trim();
    }
  }
  return "";
}

function blocchiCitazione(blocco: string): string[] {
  const out: string[] = [];
  let buf: string[] = [];
  for (const raw of blocco.split("\n")) {
    if (/^>\s?/.test(raw)) {
      buf.push(raw.replace(/^>\s?/, "").replace(/\*\*/g, "").trim());
    } else if (buf.length) {
      const t = buf.join(" ").trim();
      if (t) out.push(t);
      buf = [];
    }
  }
  if (buf.length) {
    const t = buf.join(" ").trim();
    if (t) out.push(t);
  }
  return out;
}

function etichettaCampo(chiave: string): string {
  const k = chiave.toLowerCase().trim();
  if (/contesto/i.test(k)) return "Contesto";
  if (/quando|timing/i.test(k)) return "Quando";
  if (/chi chiami|chi contatt|destinatario/i.test(k)) return "Chi contattare";
  if (/script|cosa dire|testo pronto/i.test(k)) return "Cosa dire o pubblicare";
  if (/prima del|servono da|pre-condiz/i.test(k)) return "Cosa serve prima";
  if (/contenuto completo/i.test(k)) return "Documento di riferimento";
  if (/cosa cambia|cambia|effetto/i.test(k)) return "Cosa cambia";
  if (/se va bene|seguito/i.test(k)) return "Se va bene";
  return chiave.replace(/\*\*/g, "").trim();
}

function corpoUtile(blocco: string): string {
  return blocco
    .split("\n")
    .filter((r) => r.trim() && !META_RIGA_RE.test(r) && !/^\s*---\s*$/.test(r))
    .join("\n")
    .trim();
}

/** Costruisce il quadro completo: sezioni in italiano semplice + appendice tecnica. */
export function quadroAzione(opts: {
  corpo: string;
  cambia?: string;
  seguito?: string;
}): { sezioni: SezioneAzione[]; tecnico: string } {
  const blocco = corpoUtile(opts.corpo || "");
  const sezioni: SezioneAzione[] = [];
  const viste = new Set<string>();

  const aggiungi = (etichetta: string, testo: string) => {
    const t = traduci(testo);
    if (!t || viste.has(etichetta)) return;
    viste.add(etichetta);
    sezioni.push({ etichetta, testo: t });
  };

  // Campi strutturati **Etichetta:** valore (o etichetta senza valore → blockquote sotto)
  let attendiBlockquotePer = "";
  for (const raw of blocco.split("\n")) {
    const line = raw.replace(/^[\s>*\-]+/, "").trim();
    const m = line.match(CAMPO_RIGA_RE);
    if (m) {
      const chiave = m[1].trim();
      const valore = m[2].replace(/\*+/g, "").trim();
      if (META_RIGA_RE.test(line)) continue;
      if (!valore || valore === "") {
        attendiBlockquotePer = etichettaCampo(chiave);
        continue;
      }
      if (/^[\d]+\.\s/.test(valore)) continue;
      aggiungi(etichettaCampo(chiave), valore);
      attendiBlockquotePer = "";
      continue;
    }
    if (attendiBlockquotePer && /^>/.test(raw.trim())) {
      const cit = raw.replace(/^>\s?/, "").replace(/\*\*/g, "").trim();
      if (cit) aggiungi(attendiBlockquotePer, cit);
      attendiBlockquotePer = "";
      continue;
    }
  }

  // Liste numerate (pre-condizioni, passi)
  const lista: string[] = [];
  for (const raw of blocco.split("\n")) {
    const m = raw.match(/^\s*\d+\.\s+\*\*(.+?)\*\*\s*[—–-]\s*(.+)$/);
    if (m) lista.push(`${m[1].trim()}: ${m[2].trim()}`);
    else {
      const m2 = raw.match(/^\s*\d+\.\s+(.+)$/);
      if (m2) lista.push(m2[1].replace(/\*\*/g, "").trim());
    }
  }
  if (lista.length) aggiungi("Passi o cose da preparare", lista.join("\n"));

  // Blockquote senza etichetta esplicita (solo se non già coperti)
  const citazioni = blocchiCitazione(blocco);
  if (citazioni.length === 1 && !viste.has("Cosa dire o pubblicare") && !viste.has("Contesto")) {
    const c = citazioni[0];
    if (/ciao|sono nicola|buongiorno|chi ha voglia/i.test(c)) aggiungi("Cosa dire o pubblicare", c);
    else aggiungi("Contesto", c);
  }

  // Cosa cambia / Se va bene (da parser o corpo)
  const cambia = (opts.cambia || campo(blocco, ["cosa cambia", "cambia", "effetto atteso"])).trim();
  const seguito = (opts.seguito || campo(blocco, ["se va bene", "seguito", "via libera"])).trim();
  if (cambia) aggiungi("Cosa cambia", cambia);
  if (seguito) aggiungi("Se va bene", seguito);

  // Se non abbiamo estratto nulla, traduci tutto il corpo
  if (sezioni.length === 0 && blocco) {
    aggiungi("Dettaglio", blocco.replace(/\*\*/g, "").replace(/^>\s?/gm, ""));
  }

  // Appendice tecnica: path, origini, slug — nulla si perde
  const tecnicoParti: string[] = [];
  const paths = [...(opts.corpo || "").matchAll(/`?((?:consegne|creativi|MyCity-Vault)\/[\w./@-]+)`?/g)].map((m) => m[1]);
  if (paths.length) tecnicoParti.push("File: " + [...new Set(paths)].join(" · "));
  const origini = [...(opts.corpo || "").matchAll(/\{origine:([^}]+)\}/g)].map((m) => m[1]);
  if (origini.length) tecnicoParti.push("Nata da: " + [...new Set(origini)].join(" · "));
  const slug = (opts.corpo || "").match(/#(?=[a-z])[a-z0-9-]+\b/i);
  if (slug) tecnicoParti.push("Codice interno coda: " + slug[0]);

  return { sezioni, tecnico: tecnicoParti.join("\n") };
}
