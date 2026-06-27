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
};

export function livelloDi(c: string): AzioneAttesa["livello"] {
  if (c.includes("🟢")) return "verde";
  if (c.includes("🟡")) return "giallo";
  if (c.includes("🔴")) return "rosso";
  return "?";
}

const DATA_RE = /\d{4}-\d{2}-\d{2}(?:\s+\d{2}:\d{2})?/;

// Una sezione conta come "in attesa" se contiene 🟡/🔴 e NON è marcata come già fatta.
function inAttesaSezione(blocco: string): boolean {
  if (!/🟡|🔴/.test(blocco)) return false;
  if (/✅|\bMERGED\b|\bFATTO\b/i.test(blocco)) return false;
  return true;
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
    const m = titolo.match(/@([a-z0-9-]+)/i);
    if (m) reparto = m[1];
  }
  // ripulisci il titolo dalle emoji-semaforo iniziali
  titolo = titolo.replace(/^[🟢🟡🔴]\s*/, "").trim();
  return { data, reparto, titolo };
}

// Le righe-tabella a 8 colonne.
function parseTabella(md: string): AzioneAttesa[] {
  const out: AzioneAttesa[] = [];
  for (const raw of md.split("\n")) {
    const line = raw.trim();
    if (!line.startsWith("|")) continue;
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    if (cells.length < 8) continue;
    const numero = cells[0];
    if (!/^\d+$/.test(numero)) continue; // salta intestazione e separatori
    const stato = cells[7];
    out.push({
      numero,
      data: cells[1],
      reparto: cells[2],
      azione: cells[3],
      colore: cells[4],
      livello: livelloDi(cells[4]),
      contenuto: cells[5],
      canale: cells[6],
      stato,
      inAttesa: /attesa/i.test(stato),
    });
  }
  return out;
}

// I blocchi sezione ## / ### (formato libero dei senior).
function parseSezioni(md: string, startNumero: number): AzioneAttesa[] {
  const out: AzioneAttesa[] = [];
  const righe = md.split("\n");
  let cur: { heading: string; corpo: string[] } | null = null;
  let n = startNumero;
  const chiudi = () => {
    if (!cur) return;
    const blocco = cur.heading + "\n" + cur.corpo.join("\n");
    if (inAttesaSezione(blocco)) {
      const { data, reparto, titolo } = parseHeading(cur.heading);
      const colore = /🔴/.test(blocco) ? "🔴" : "🟡";
      out.push({
        numero: `S${n++}`,
        data,
        reparto,
        azione: titolo,
        colore,
        livello: livelloDi(colore),
        // prima riga utile del corpo come anteprima/contenuto
        contenuto: (cur.corpo.find((r) => r.trim().length > 0) || "").trim().slice(0, 240),
        canale: "",
        stato: "in attesa",
        inAttesa: true,
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
  const sezioni = parseSezioni(pulito, tabella.length + 1);
  return [...tabella, ...sezioni];
}
