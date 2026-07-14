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

// ✍️ Pulizia UMANA del titolo mostrato (regola cervello/scrittura-umana.md, mossa 2): toglie dal
// TITOLO le sigle interne (AR-004, #59/#16.2), gli ID tecnici (phc_…, chiavi Stripe, numeri-ordine
// lunghi), i path di file (…​.mjs/.env) e i numeri-comando (SQL 107). NON tocca: prezzi, %, telefoni,
// date, nomi, né il codice-casella #A42 (lettera+cifre, che il Pannello mostra apposta). È SOLO per
// la visualizzazione: il titolo grezzo resta la fonte del codice-casella (idSezione) e il "Contenuto"
// coi dettagli tecnici precisi resta intatto per chi esegue.
// Slug interni accodati dal worker (#ritiro-pq-vp17-checkin, #burn-mensile-runway…).
// NON tocca i codici-casella del Pannello (#A42 = lettera maiuscola + 2 cifre).
const SLUG_INTERNO_RE = /#(?=[a-z])[a-z0-9-]+\b/gi;

export function pulisciTitolo(s: string): string {
  let t = s || "";
  t = t.replace(/^[\s🟢🟡🔴🩻🛡️🔎📣🚀🚨🐙✍️💶🧾⏳◇◈]*\s*/u, "");
  // Formato worker «#slug-interno — Titolo umano · meta»: tieni solo la parte umana.
  const dopoSlug = t.match(/^#\S+\s*[—–-]\s*(.+)$/);
  if (dopoSlug) t = dopoSlug[1];
  t = t.replace(/\b(?:phc|phx|pi|cs|re|ch|cus|sub|acct|evt|prod|price|seti|pm)_[A-Za-z0-9]{6,}\b/g, "");
  t = t.replace(/\bSQL\s?\d+\b/gi, "");
  t = t.replace(/\bAR-\d+\b/g, "");
  t = t.replace(/#\d+(?:\.\d+)?\b/g, ""); // #59, #16.2 sì; #A42 (lettera dopo #) NO
  t = t.replace(SLUG_INTERNO_RE, "");
  t = t.replace(/\b[\w./@-]+\.(?:mjs|tsx?|jsx?|sh|json|env|sql|md|css|patch|png|webp)(?::\d+)?\b/gi, "");
  t = t.replace(/\b(?:cervello|pannello|consegne|creativi|src|MyCity-Vault)\/[\w./@-]+/g, "");
  t = t.replace(/\b\d{7,}\b/g, ""); // ID/ordini lunghi, non prezzi/telefoni
  // Meta di coda («⏳ accodata 2026-07-14 11:07») non va nel titolo visibile.
  t = t.replace(/[·|]\s*⏳?\s*accod(?:at[oa]|ata)\s+\d{4}-\d{2}-\d{2}(?:\s+\d{2}:\d{2})?/gi, "");
  t = t.replace(/\s*=\s*(?=[·,;:)\]]|$)/g, ""); // "= " orfano dopo un codice tolto
  t = t.replace(/\(\s*[·,;:\-–—.]*\s*\)/g, "");
  t = t.replace(/\[\s*\]/g, "");
  t = t.replace(/\s*·\s*(?=·|$)/g, " ");
  t = t.replace(/\s{2,}/g, " ");
  t = t.replace(/^\s*[·|:\-–—]+\s*/, "");
  t = t.replace(/\s*[·|:\-–—]+\s*$/, "");
  return t.trim() || (s || "").trim(); // se per assurdo svuota tutto, tieni l'originale
}

// Gergo da NON mostrare a Nicola nell'anteprima sotto il titolo (resta nel testo completo).
const GERGO_ANTEPRIMA_RE =
  /\b(?:anti-?churn|scan REST|REST\s*→|playbook|sentinella|north\s*star|0→1|payout-test|\.mjs\b|consegne\/|creativi\/|MyCity-Vault\/|phc_|report:\s*[`']?\S+\/)/i;

function soloRiferimentoFile(s: string): boolean {
  return /^(consegne|creativi)\/\S+(\s*\([^)]*\))?$/.test(s.trim());
}

/** Anteprima leggibile sotto il titolo: se il corpo è gergo tecnico, mostra «Cosa cambia». */
export function anteprimaAzione(opts: { perche: string; cambia?: string; seguito?: string }): string | null {
  const p = (opts.perche || "").replace(/^>\s*/, "").trim();
  if (!p || soloRiferimentoFile(p)) return null;
  const cambia = (opts.cambia || "").trim();
  if (GERGO_ANTEPRIMA_RE.test(p)) return cambia || null;
  // Prima frase utile, senza path/backtick residui.
  const pulito = p
    .replace(/\b[\w./@-]+\.(?:mjs|tsx?|jsx?|sh|json|env|sql|md|css)(?::\d+)?\b/gi, "")
    .replace(/\b(?:consegne|creativi|MyCity-Vault)\/[\w./@-]+/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  if (!pulito || GERGO_ANTEPRIMA_RE.test(pulito)) return cambia || null;
  const frase = pulito.split(/(?<=[.!?])\s+/)[0] || pulito;
  return frase.length > 280 ? frase.slice(0, 277) + "…" : frase;
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

// 🔖 Codice STABILE e PRONUNCIABILE mostrato sulla card ("#A42"), così Nicola e l'AD parlano
// della STESSA casella (in chat, a voce). È una funzione PURA dell'id stabile `S<hash>`: finché
// il contenuto dell'azione non cambia, il codice resta identico da un giro all'altro — NON è un
// indice posizionale che si rinumera (era la lamentela di Nicola: «nessuna casella è numerata»).
// Formato: prefisso "#" + 1 lettera A-Z + 2 cifre 00-99 → spazio di 2.600 codici (il "#A3" chiesto
// da Nicola è la FORMA; qui 2 cifre allargano lo spazio e riducono le collisioni). Con una coda
// tipica di <20 azioni la probabilità di collisione (compleanno) è <1%; e anche in caso di
// collisione il codice è solo un'etichetta parlata: il vero handle interno resta l'id completo
// `S<hash>` (i pulsanti Approva/Rifiuta usano quello), quindi nessun rischio funzionale.
export function codiceAzione(id: string): string {
  // Rehash dell'id stabile per spargere bene lettera e cifre anche su id molto simili.
  let h = 0;
  const s = id || "";
  for (let i = 0; i < s.length; i++) h = (Math.imul(131, h) + s.charCodeAt(i)) | 0;
  const u = h >>> 0;
  const lettera = String.fromCharCode(65 + (u % 26)); // A-Z
  const numero = Math.floor(u / 26) % 100; // 00-99
  return `#${lettera}${String(numero).padStart(2, "0")}`;
}

// Etichetta completa «#codice — nome» richiesta da Nicola: codice e nome SEMPRE insieme, mai il
// solo codice. Usala dove serve una stringa unica (es. testo parlato, tooltip); nella UI le due
// parti si stilizzano separate ma restano sulla stessa riga.
export function etichettaCasella(id: string, nome: string): string {
  return `${codiceAzione(id)} — ${nome}`.trim();
}

// Una heading `##`/`###` è PURA DOCUMENTAZIONE (NON un'azione) se non porta alcun segnale d'azione:
//   • nell'heading: una data, un @reparto o un semaforo 🟢🟡🔴, OPPURE
//   • nel corpo: un campo Stato:/Colore:, "in attesa", "via libera", "data proposta", "pronto"
//     o una checkbox 🔴/🟡 da firmare.
// Le sezioni-manuale della coda ("## Come approvare", "## Coda") non hanno né l'uno né l'altro:
// così NON diventano più card fantasma con "Canale non indicato". Le azioni vere (heading con
// data/@reparto/semaforo, o corpo con Stato:/Colore:/"in attesa") restano tutte.
function isSezioneDocumentazione(heading: string, blocco: string): boolean {
  const h = heading.replace(/^#{2,3}\s+/, "");
  const headingHaSegnale = DATA_RE.test(h) || /@[a-z0-9-]/i.test(h) || /[🟢🟡🔴]/.test(h);
  const corpoHaSegnale =
    /\b(in attesa|via libera|data proposta|pronto)\b/i.test(blocco) ||
    /^[\s>*\-]*\*{0,2}(stato|colore)\*{0,2}\s*:/im.test(blocco) ||
    /\[\s*\]\s*[🔴🟡🟢]/.test(blocco);
  return !headingHaSegnale && !corpoHaSegnale;
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
    const azioneRaw = senzaOrigine(cells[3]);
    // BUG #6 (radiografia 2026-07-03): la chiave decisione `azione:<id>` deve agganciarsi al
    // CONTENUTO, non al numero di riga posizionale (che il giro rinumera). Usa lo stesso id STABILE
    // delle sezioni così un'azione nuova non eredita lo stato «fatta/rifiutata» di una vecchia.
    // L'id resta sul titolo GREZZO (così il codice-casella non cambia); il display è ripulito.
    out.push({
      numero: idSezione(data, reparto, azioneRaw),
      data,
      reparto,
      azione: pulisciTitolo(azioneRaw),
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
    if (inAttesaSezione(blocco) && !isSezioneDocumentazione(cur.heading, blocco)) {
      const { data, reparto, titolo } = parseHeading(cur.heading);
      const colore = /🔴/.test(blocco) ? "🔴" : "🟡";
      const origine = estraiOrigine(blocco) || campo(blocco, ["origine", "nato da"]);
      out.push({
        numero: idSezione(data, reparto, titolo),
        data,
        reparto,
        azione: pulisciTitolo(senzaOrigine(titolo)),
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
    } else if (cur && !/^\s*\|/.test(raw)) {
      // Le righe-tabella (|…|) sono già gestite da parseTabella: non le lasciamo
      // assorbire da una sezione, altrimenti "## Coda" ingoia l'intera tabella e
      // diventa una card fantasma piena di 🟡/🔴 e "in attesa".
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
