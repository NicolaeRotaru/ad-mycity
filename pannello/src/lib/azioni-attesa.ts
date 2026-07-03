// Parser condiviso della coda "AZIONI-IN-ATTESA.md".
// Il giro/i senior accodano le azioni 🟡/🔴 in DUE formati che convivono nel file:
//   1) righe-tabella a 8 colonne  | # | Data e ora | Reparto | Azione | Colore | Contenuto | Canale | Stato |
//   2) blocchi sezione ## / ###   (heading con data·@reparto·titolo + corpo con 🔴/🟡 e "IN ATTESA DI FIRMA")
// Questo parser li copre ENTRAMBI, così "Da firmare" (Plancia) e "Da fare" (corsia Azioni) leggono
// l'unica fonte reale e nessuna azione resta invisibile.

export type AzioneAttesa = {
  numero: string;
  data: string;
  reparto: string;
  azione: string;
  colore: string;
  livello: "verde" | "giallo" | "rosso" | "?";
  contenuto: string;
  canale: string;
  stato: string;
  inAttesa: boolean;
  // Spiegazione specifica scritta dal senior (opzionale): cosa cambia nel mondo reale
  // e cosa succede dopo se va bene. Se vuote, il Pannello usa i testi per-reparto.
  cambia: string;
  seguito: string;
  // 🔗 Origine: la casella DA CUI è nata l'azione (es. "difetto:AR-001", "domanda:<id>",
  // "sentinella:<id>", "mossa:<n>"). Il giro la scrive come tag {origine:TIPO:ID} nell'azione.
  // Vuota se l'azione non dichiara un'origine.
  origine: string;
};

export function livelloDi(c: string): AzioneAttesa["livello"] {
  if (c.includes("🟢")) return "verde";
  if (c.includes("🟡")) return "giallo";
  if (c.includes("🔴")) return "rosso";
  return "?";
}

// Tag {origine:TIPO:ID} che il giro mette nell'azione per legarla alla casella d'origine.
const ORIGINE_RE = /\{\s*origine\s*:\s*([^}]+?)\s*\}/i;
export function estraiOrigine(s: string): string {
  const m = (s || "").match(ORIGINE_RE);
  return m ? m[1].trim() : "";
}
function senzaOrigine(s: string): string {
  return (s || "").replace(ORIGINE_RE, "").replace(/\s{2,}/g, " ").trim();
}

const DATA_RE = /\d{4}-\d{2}-\d{2}(?:\s+\d{2}:\d{2})?/;

// Id STABILE per le sezioni: derivato dal contenuto (data|reparto|titolo), non dalla posizione.
// Così la chiave `azione:<id>` resta agganciata all'azione giusta anche se cambia l'ordine dei blocchi.
function idSezione(data: string, reparto: string, titolo: string): string {
  const s = `${data}|${reparto}|${titolo}`;
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return "S" + (h >>> 0).toString(36);
}

// Una sezione conta come "in attesa" se contiene 🟡/🔴 e NON è dichiarata FATTA.
// IMPORTANTE: una ✅ nel CORPO (spunta di una pre-condizione) NON deve scartare l'azione: conta lo STATO
// esplicito. Se c'è "in attesa (di firma)" → è in attesa; "fatta" solo se una riga Stato: lo dichiara.
function inAttesaSezione(blocco: string): boolean {
  if (!/🟡|🔴/.test(blocco)) return false;
  if (/in attesa( di firma)?/i.test(blocco)) return true;
  const fatta = blocco
    .split("\n")
    .some((r) => /^[\s>*\-]*\*{0,2}stato\*{0,2}\s*:.*(✅|\bFATTO\b|\bMERGED\b)/i.test(r));
  return !fatta;
}

// Dal titolo di una sezione "AAAA-MM-GG · @reparto · titolo" (o varianti) estrae i campi.
function parseHeading(heading: string): { data: string; reparto: string; titolo: string } {
  // togli i marcatori # iniziali
  const h = heading.replace(/^#{2,3}\s+/, "").trim();
  const parti = h.split("·").map((p) => p.trim());
  let data = "";
  let reparto = "";
  const resto: string[] = [];
  for (const p of parti) {
    if (!data && DATA_RE.test(p) && /^\d{4}-\d{2}-\d{2}/.test(p)) {
      data = (p.match(DATA_RE) || [""])[0];
    } else if (!reparto && p.startsWith("@")) {
      reparto = p.replace(/^@/, "");
    } else {
      resto.push(p);
    }
  }
  // se il reparto non era una cella "·", provalo a pescare da un @parola nel titolo
  let titolo = resto.join(" · ").trim();
  if (!reparto) {
    // @reparto in qualunque punto del titolo, oppure uno slug-reparto tra parentesi (minuscolo+trattino,
    // es. "(content-social)"): evita falsi positivi tipo "(C4)" o "(DRY-RUN)".
    const m = titolo.match(/@([a-z0-9-]+)/i) || titolo.match(/\(@?([a-z]+-[a-z]+)\)/);
    if (m) reparto = m[1];
  }
  // ripulisci il titolo dalle emoji-semaforo iniziali
  titolo = titolo.replace(/^[🟢🟡🔴]\s*/, "").trim();
  return { data, reparto, titolo };
}

// Estrae da un blocco-sezione il valore di un campo etichettato (es. "Cosa cambia: ...").
// Accetta le righe anche con prefissi markdown (- , >, **) e si ferma alla prima riga utile.
function campo(blocco: string, etichette: string[]): string {
  for (const raw of blocco.split("\n")) {
    const line = raw.replace(/^[\s>*\-]+/, "").replace(/\*\*/g, "").trim();
    for (const et of etichette) {
      const m = line.match(new RegExp("^" + et + "\\s*:\\s*(.+)$", "i"));
      if (m && m[1].trim()) return m[1].trim();
    }
  }
  return "";
}

// Le righe-tabella: 8 colonne obbligatorie + 2 OPZIONALI (Cosa cambia · Se va bene).
function parseTabella(md: string): AzioneAttesa[] {
  const out: AzioneAttesa[] = [];
  for (const raw of md.split("\n")) {
    const line = raw.trim();
    if (!line.startsWith("|")) continue;
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    if (cells.length < 8) continue;
    const rigaNum = cells[0];
    if (!/^\d+$/.test(rigaNum)) continue; // salta intestazione e separatori
    const stato = cells[7];
    const origine = estraiOrigine(line);
    const data = cells[1];
    const reparto = cells[2];
    const azione = senzaOrigine(cells[3]);
    // BUG #6 (radiografia 2026-07-03): la chiave decisione `azione:<id>` deve agganciarsi al
    // CONTENUTO, non al numero di riga posizionale (che il giro rinumera). Usa lo stesso id STABILE
    // delle sezioni così un'azione nuova non eredita lo stato «fatta/rifiutata» di una vecchia.
    out.push({
      numero: idSezione(data, reparto, azione),
      data,
      reparto,
      azione,
      colore: cells[4],
      livello: livelloDi(cells[4]),
      contenuto: senzaOrigine(cells[5]),
      canale: cells[6],
      stato,
      inAttesa: /attesa/i.test(stato),
      cambia: cells[8] || "",
      seguito: cells[9] || "",
      origine,
    });
  }
  return out;
}

// I blocchi sezione ## / ### (formato libero dei senior).
function parseSezioni(md: string): AzioneAttesa[] {
  const out: AzioneAttesa[] = [];
  const righe = md.split("\n");
  let cur: { heading: string; corpo: string[] } | null = null;
  const chiudi = () => {
    if (!cur) return;
    const blocco = cur.heading + "\n" + cur.corpo.join("\n");
    if (inAttesaSezione(blocco)) {
      const { data, reparto, titolo } = parseHeading(cur.heading);
      const colore = /🔴/.test(blocco) ? "🔴" : "🟡";
      const origine = estraiOrigine(blocco) || campo(blocco, ["origine", "nato da"]);
      out.push({
        numero: idSezione(data, reparto, titolo),
        data,
        reparto,
        azione: senzaOrigine(titolo),
        colore,
        livello: livelloDi(colore),
        // prima riga utile del corpo come anteprima/contenuto
        contenuto: senzaOrigine((cur.corpo.find((r) => r.trim().length > 0) || "").trim()).slice(0, 240),
        canale: campo(blocco, ["canale", "mani"]),
        stato: "in attesa",
        inAttesa: true,
        cambia: campo(blocco, ["cosa cambia", "cambia", "conseguenza", "effetto atteso", "effetto atteso kpi"]),
        seguito: campo(blocco, ["se va bene", "seguito", "via libera"]),
        origine,
      });
    }
    cur = null;
  };
  for (const raw of righe) {
    if (/^#{2,3}\s+/.test(raw)) {
      chiudi();
      cur = { heading: raw, corpo: [] };
    } else if (cur) {
      cur.corpo.push(raw);
    }
  }
  chiudi();
  return out;
}

/** Parsa l'intera coda: righe-tabella + sezioni ##/###. */
export function parseAzioniAttesa(md: string): AzioneAttesa[] {
  // Via i commenti HTML (contengono righe-esempio che non sono azioni vere).
  const pulito = md.replace(/<!--[\s\S]*?-->/g, "");
  const tabella = parseTabella(pulito);
  const sezioni = parseSezioni(pulito);
  return [...tabella, ...sezioni];
}
