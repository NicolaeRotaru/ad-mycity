// 👆 LA REGOLA DEL DITO — quanto dev'essere grande un bersaglio, quanto grande un campo di
// scrittura, e chi comanda lo scorrimento sul telefono.
//
// LA MALATTIA (corsia 3 del lotto 41): ogni componente si costruisce da sé la propria regola di
// tocco. La misura non è scritta da nessuna parte, quindi è scritta N volte e sbagliata in N-1 —
// e non è provabile, perché vive dentro il JSX.
//
//   AR-220 — su iPhone toccare per scrivere INGRANDISCE la pagina. iOS Safari zooma quando il campo
//     che prende il fuoco ha `font-size < 16px`. Nessun campo del Pannello ci arriva: la base
//     `.input-soft` è `text-sm` (14px) e sopra ci finiscono override ancora più piccoli — 13px la
//     chat del worker, 12,5px ParlaCasella/ChatCasella/AutoCoscienza.
//   AR-223 — link e freccine alti ~18px: sono `<button>` e `<summary>` con la sola classe di testo
//     (`t-eti` = 13px × 1,375 ≈ 17,9px) e zero padding verticale. Nati come «note a piè di card»,
//     usati come comandi. WCAG 2.2 SC 2.5.8 (AA) chiede 24px; `.nav-tab` in casa usa già 44.
//   AR-224 — riquadri con `max-h-[620px] overflow-y-auto`: su un telefono 620px sono l'intero
//     schermo utile, il riquadro diventa indistinguibile dalla pagina e il dito muove la lista.
//
// LA RADICE COMUNE: i tetti e le misure sono scritti in pixel assoluti dentro il markup, tarati su
// una finestra desktop. Non esiste una regola che dica «questo è un campo», «questo è un comando»,
// «questa lista sul telefono scorre con la pagina».
//
// PERCHÉ STA QUI E NON IN globals.css. Una classe CSS non si può interrogare: un test che la cerca
// misura la presenza del file, non l'effetto sul componente. Qui la decisione — «questa classe
// zooma? questo bersaglio è troppo piccolo? questo tetto ruba lo scorrimento?» — è una funzione che
// si esegue, e la classe corretta la produce la stessa funzione che sa dire di no a quella malata.
//
// ⚠️ LE CLASSI STANNO NELLE TABELLE, NON NELLE INTERPOLAZIONI. Tailwind genera il CSS scansionando
// il SORGENTE: una classe costruita a runtime (`sm:${x}`) non esisterebbe nel foglio di stile. Per
// questo ogni variante responsive è scritta per esteso qui dentro — questo file è nel `content` di
// tailwind.config.ts (`./src/**/*.{js,ts,jsx,tsx,mdx}`) e viene scansionato.
//
// 🟢 Modulo puro: nessun import, nessun React, nessun window.
// Prova: cervello/test/c3-tocco-bersaglio.test.mjs

/** Sotto questa soglia iOS Safari ingrandisce la pagina al fuoco del campo. Non è negoziabile. */
export const CAMPO_MIN_PX = 16;

/**
 * Il bersaglio comodo sul telefono. Il minimo di legge è 24px (WCAG 2.2 SC 2.5.8, AA); si prende 44
 * per coerenza con `.nav-tab`, che in questo Pannello lo usa già da una correzione precedente.
 */
export const BERSAGLIO_MIN_PX = 44;

/**
 * Quanto misura un campo che NON dichiara la sua dimensione: eredita `.input-soft`, che è `text-sm`.
 * È il caso che sfuggiva sempre — «non c'è nessun text- piccolo qui» non vuol dire «non zooma».
 */
export const EREDITATO_DA_INPUT_SOFT_PX = 14;

/** La scala tipografica in uso nel Pannello, in pixel. `t-eti` è una classe di casa (13px). */
const SCALA_NOMINATA: Record<string, number> = {
  "text-xs": 12,
  "text-sm": 14,
  "text-base": 16,
  "text-lg": 18,
  "text-xl": 20,
  "t-eti": 13,
};

/** Interlinea media usata per stimare l'altezza di un comando testuale senza padding. */
const INTERLINEA = 1.4;

/**
 * Le varianti responsive dei campi: 16px sul telefono (niente zoom), la densità di prima da `sm:` in
 * su (il desktop non cambia di un pixel). Scritte per esteso perché Tailwind le deve poter leggere.
 */
export const CAMPO_RESPONSIVO: Record<string, string> = {
  "text-xs": "text-[16px] sm:text-xs",
  "text-sm": "text-[16px] sm:text-sm",
  "text-[11px]": "text-[16px] sm:text-[11px]",
  "text-[12px]": "text-[16px] sm:text-[12px]",
  "text-[12.5px]": "text-[16px] sm:text-[12.5px]",
  "text-[13px]": "text-[16px] sm:text-[13px]",
  "text-[13.5px]": "text-[16px] sm:text-[13.5px]",
  "text-[14px]": "text-[16px] sm:text-[14px]",
  "text-[15px]": "text-[16px] sm:text-[15px]",
};

/** Il ripiego quando la misura di partenza non è in tabella: sicuro, perde solo la densità desktop. */
const CAMPO_RIPIEGO = "text-[16px]";

/** Un campo che non dichiara niente eredita `.input-soft`: gli si dà la coppia della sua misura. */
const CAMPO_EREDITATO = "text-[16px] sm:text-sm";

/**
 * I tetti di altezza convertiti in «sul telefono scorre la pagina, sul desktop il riquadro».
 * Anche queste per esteso: `max-h-none sm:${tetto}` costruito a runtime non finirebbe nel CSS.
 */
export const TETTO_RESPONSIVO: Record<string, string> = {
  "max-h-[620px]": "max-h-none sm:max-h-[620px]",
  "max-h-[520px]": "max-h-none sm:max-h-[520px]",
  "max-h-[28rem]": "max-h-none sm:max-h-[28rem]",
  "max-h-[24rem]": "max-h-none sm:max-h-[24rem]",
  "max-h-96": "max-h-none sm:max-h-96",
  "max-h-72": "max-h-none sm:max-h-72",
  "max-h-80": "max-h-none sm:max-h-80",
  "max-h-64": "max-h-none sm:max-h-64",
};

/** Il tetto è già relativo alla finestra (vh) o già responsive: il dito non se lo trova addosso. */
function tettoGiaSano(token: string): boolean {
  return /vh|vw|dvh|svh|min\(|max\(|clamp\(|none|full|screen/.test(token);
}

function tokens(classe: string): string[] {
  return String(classe || "").split(/\s+/).filter(Boolean);
}

/** Da un pezzo di classe alla sua dimensione in pixel. `null` se non è una misura di testo. */
export function pxDaClasse(token: string): number | null {
  if (token in SCALA_NOMINATA) return SCALA_NOMINATA[token];
  const m = token.match(/^text-\[(\d+(?:\.\d+)?)(px|rem)\]$/);
  if (!m) return null;
  const n = Number(m[1]);
  return m[2] === "rem" ? n * 16 : n;
}

/**
 * La dimensione con cui il testo esce davvero. Le varianti a scaglione (`sm:`, `md:`…) NON contano:
 * il telefono sta sotto il primo scaglione, e il difetto è sul telefono.
 */
export function fontEffettivoPx(classe: string): number | null {
  let px: number | null = null;
  for (const t of tokens(classe)) {
    if (t.includes(":")) continue;
    const v = pxDaClasse(t);
    if (v != null) px = v; // l'ultimo dichiarato vince, come in CSS a parità di specificità
  }
  return px;
}

/**
 * Questo campo fa ingrandire la pagina su iPhone? (AR-220)
 *
 * Anche quando non dichiara niente: senza `text-…` eredita `.input-soft` = 14px, cioè zooma. È il
 * motivo per cui «non vedo classi piccole» non era mai una risposta.
 */
export function campoZoomaSuIOS(classe: string): boolean {
  const px = fontEffettivoPx(classe);
  return (px == null ? EREDITATO_DA_INPUT_SOFT_PX : px) < CAMPO_MIN_PX;
}

/**
 * La classe di un campo di scrittura che non fa zoomare iOS. Se era già a norma torna com'era:
 * questa funzione non ha il diritto di cambiare la resa di un campo che stava bene.
 */
export function classeCampo(classe: string): string {
  const lista = tokens(classe);
  if (!campoZoomaSuIOS(classe)) return lista.join(" ");

  let indice = -1;
  for (let i = 0; i < lista.length; i++) {
    if (lista[i].includes(":")) continue;
    if (pxDaClasse(lista[i]) != null) indice = i;
  }
  if (indice < 0) return [...lista, CAMPO_EREDITATO].join(" ");
  const sostituto = CAMPO_RESPONSIVO[lista[indice]] || CAMPO_RIPIEGO;
  return [...lista.slice(0, indice), sostituto, ...lista.slice(indice + 1)].join(" ");
}

/** L'altezza in pixel del bersaglio, come la misura il polpastrello. */
export function altezzaBersaglioPx(classe: string): number {
  const lista = tokens(classe);
  let minH = 0;
  let padding = 0;
  for (const t of lista) {
    if (t.includes(":")) continue;
    let m = t.match(/^(?:min-h|h)-\[(\d+(?:\.\d+)?)(px|rem)\]$/);
    if (m) minH = Math.max(minH, m[2] === "rem" ? Number(m[1]) * 16 : Number(m[1]));
    m = t.match(/^(?:min-h|h)-(\d+(?:\.\d+)?)$/);
    if (m) minH = Math.max(minH, Number(m[1]) * 4);
    m = t.match(/^-?py-\[(\d+(?:\.\d+)?)(px|rem)\]$/);
    if (m) padding += (t.startsWith("-") ? -1 : 1) * 2 * (m[2] === "rem" ? Number(m[1]) * 16 : Number(m[1]));
    m = t.match(/^py-(\d+(?:\.\d+)?)$/);
    if (m) padding += 2 * Number(m[1]) * 4;
  }
  const font = fontEffettivoPx(classe) ?? SCALA_NOMINATA["t-eti"];
  return Math.max(minH, Math.round(font * INTERLINEA) + Math.max(0, padding));
}

/** Il dito ci arriva? (AR-223) */
export function bersaglioSufficiente(classe: string): boolean {
  return altezzaBersaglioPx(classe) >= BERSAGLIO_MIN_PX;
}

/**
 * La classe di un comando testuale dentro una card (`<button>`): alto almeno 44px, con i margini
 * negativi che compensano il padding perché la card non si gonfi.
 */
export function classeComando(classe: string): string {
  if (bersaglioSufficiente(classe)) return tokens(classe).join(" ");
  const lista = tokens(classe);
  const aggiunte = ["min-h-[44px]", "py-2", "-my-1"];
  if (!lista.some((t) => t === "inline-flex" || t === "flex" || t === "grid")) {
    aggiunte.unshift("inline-flex", "items-center");
  }
  return [...lista, ...aggiunte].join(" ");
}

/**
 * Come sopra ma per `<summary>`: NIENTE cambio di display. Un `<summary>` è `display: list-item`, e
 * portarlo a flex gli toglie il triangolino di apertura — si guadagnerebbe il bersaglio e si
 * perderebbe il segnale che quella riga si apre.
 */
export function classeComandoSommario(classe: string): string {
  if (bersaglioSufficiente(classe)) return tokens(classe).join(" ");
  return [...tokens(classe), "min-h-[44px]", "py-2", "-my-1"].join(" ");
}

/** Questo riquadro ruba il gesto al telefono? (AR-224) */
export function scorrimentoRubatoSuTelefono(classe: string): boolean {
  const lista = tokens(classe);
  if (!lista.includes("overflow-y-auto") && !lista.includes("overflow-auto")) return false;
  for (const t of lista) {
    if (t.includes(":")) continue; // un tetto già dietro `sm:` sul telefono non c'è
    if (!t.startsWith("max-h-")) continue;
    if (tettoGiaSano(t)) continue;
    return true;
  }
  return false;
}

/**
 * La classe di una lista scorrevole: sul telefono nessun tetto (scorre la pagina, che è ciò che il
 * dito si aspetta), da `sm:` in su il riquadro di prima. `overscroll-contain` per il desktop, dove
 * il riquadro resta e il gesto non deve trascinarsi dietro la pagina.
 */
export function classeListaScorrevole(classe: string): string {
  const lista = tokens(classe);
  if (!scorrimentoRubatoSuTelefono(classe)) return lista.join(" ");
  const fuori: string[] = [];
  for (const t of lista) {
    if (!t.includes(":") && t.startsWith("max-h-") && !tettoGiaSano(t)) {
      fuori.push(TETTO_RESPONSIVO[t] || "max-h-none");
      continue;
    }
    fuori.push(t);
  }
  if (!fuori.includes("overscroll-contain")) fuori.push("overscroll-contain");
  return fuori.join(" ");
}
