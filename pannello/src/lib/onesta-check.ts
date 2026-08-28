// 🕯️ IL METRO DELL'ONESTÀ SUL CANALE CLIENTI — il gemello di `cervello/onesta-check.mjs` (AR-075).
//
// Qui si giudica il testo di una mail che sta per partire verso una persona vera (lo chiama
// `pannello/src/lib/mani.ts` prima di consegnarla a Resend). Il gemello nel cervello giudica un'altra
// cosa: la memoria che il giro sta per pubblicare. Stesse regole, canale diverso.
//
// ─────────────────────────────────────────────────────────────────────────────
// AR-791 — PERCHÉ QUESTA COPIA ESISTE, E PERCHÉ NON È LIBERA
// ─────────────────────────────────────────────────────────────────────────────
// Le due metà portavano le stesse espressioni copiate a mano. In un lotto precedente l'ambito
// ristretto e le esenzioni dichiarate sono atterrati SOLO nel cervello, e da allora le due
// divergevano in silenzio: è la malattia già censita `una-parola-con-due-padroni`.
//
// Una casa sola non è possibile, e i due muri sono misurati, non supposti:
//   ① il Pannello si costruisce su Vercel con Root Directory = `pannello` (pannello/README.md:54):
//      al momento del build la cartella `cervello/` non esiste, quindi un import da lì romperebbe il
//      deploy. È la stessa ragione già scritta in `cantiere-snello.ts` e `radiografia-marketplace-conti.ts`.
//   ② al contrario, il metro del cervello deve saper girare in un clone PARZIALE (solo
//      `onesta-check.mjs` + `onesta-ambito.mjs`): lo prova `cervello/test/quarto-controllo-promesso.test.mjs`,
//      che copia esattamente quei due file in una cartella temporanea. Un import da `pannello/` lì
//      dentro non si risolve, e il cancello morirebbe invece di dare un verdetto.
//
// Quindi non «una casa o due», ma «due case pinzate o due case libere» — e due case libere sono la
// malattia. Il perno è `cervello/test/due-metri-una-regola.test.mjs`: confronta `SORGENTI_REGOLE`
// campo per campo ed ESEGUE i due giudizi sugli stessi testi. Il giorno che una delle due cambia
// senza l'altra, quella prova diventa rossa — lo stesso giorno, non mesi dopo e per caso.
//
// COSA CAMBIA FRA I DUE CANALI, e non è una divergenza: è un PROFILO scelto da chi chiama. Sulla
// memoria vale «ogni numero porta la sua fonte»; su una lettera a un cliente vale «ogni CLAIM porta
// la sua fonte». I marcatori di fonte che la regola cerca (fonte:, supabase, stripe, registro-fatti)
// sono vocabolario interno: in una mail non ci possono stare. Misurato il 28/8/2026 su otto mail
// realistiche col metro di allora: sette bocciate su otto, e sei per ragioni che non sono disonestà
// — gli orari di apertura, il prezzo del pane, lo sconto del 10%, i minuti di consegna. Un cancello
// che suona su tutto è un cancello spento (è AR-433, un piano più in là).
//
// 🟢 Modulo puro: nessun import, nessun fetch, nessun window, nessun orologio.

export type ViolazioneOnesta = {
  tipo: string;
  regola: string;
  esempi: string[];
};

export type EsitoOnesta = {
  file: string;
  tipo: string;
  regole_applicate: RegoleApplicate;
  violazioni: ViolazioneOnesta[];
  esentati: { id: string; regola: string; esempio: string }[];
};

export type RegoleApplicate = {
  segnaposto: boolean;
  claim: boolean;
  numeri: boolean | "solo-claim";
  perche_numeri: string;
};

// --- Regole (ogni regola: nome, regex, come spiegarla) — il gemello di onesta-check.mjs ---
const RE_SEGNAPOSTO = [
  { nome: "segnaposto [ESEMPIO]", re: /\[ESEMPIO\]/gi },
  { nome: "segnaposto [ ... ]", re: /\[[^\]\n]{2,40}\]/g },
  { nome: "segnaposto {{ ... }}", re: /\{\{[^}\n]+\}\}/g },
  { nome: "segnaposto XXX/TODO/TBD", re: /\b(XXX|TODO|TBD|PLACEHOLDER|LOREM)\b/gi },
  { nome: "segnaposto «…»", re: /«\s*…\s*»|<\s*inserire[^>]*>/gi },
];

const RE_SPIA = [
  { nome: "claim 'già N'", re: /\bgià\s+\d[\d.\s]*/gi },
  { nome: "claim vago 'centinaia/migliaia di'", re: /\b(centinaia|migliaia|decine)\s+di\b/gi },
];

const RE_NUMERO = /\b\d{1,3}(?:[.,]\d{3})*(?:[.,]\d+)?\s?(?:€|euro|%|negozi|famiglie|clienti|ordini|utenti|iscritti|follower)?\b/gi;

// Fonte strutturata o citazione esplicita — niente parole generiche da sole.
const RE_FONTE = /(fonte\s*:|\(fonte|\[dati\]|\[fonte|supabase|stripe|posthog|registro-fatti|registro-realt|\{fonte:)/i;

// Il soggetto che trasforma una cifra in un CLAIM DI BUSINESS: «3.000 clienti» è una promessa da
// fondare, «3,50 €» e «dalle 9 alle 13» no.
const RE_SOGGETTO = /\b(negozi|botteghe|famiglie|clienti|utenti|iscritti|follower|recensioni|ordini|consegne)\b/i;

// I pezzi che SONO una fonte e non un numero orfano (AR-433).
export const RE_RIFERIMENTO_CODICE = /[\w./-]+\.(?:mjs|sh|ts|tsx|js|jsx|json|md|ps1|bats|py):\d+(?:-\d+)?/g;
export const RE_SIGLA_DIFETTO = /\bAR-\d+\b/g;
export const RE_SIGLA_LEZIONE = /\bL-\d{4}-\d+(?:-\d+)?\b/g;
export const RE_CODICE_INLINE = /`[^`\n]*`/g;
export const RE_BLOCCO_CODICE = /```[\s\S]*?```/g;

/**
 * La tabella delle regole ricavata dalle espressioni qui sopra: `sorgente` è il TESTO della regola.
 * Non è una seconda copia — è la prima letta in un modo che si può CONFRONTARE con quella del
 * cervello. È il perno di AR-791: la prova mette le due tabelle una accanto all'altra.
 */
const voce = (classe: string, nome: string, re: RegExp) => ({ classe, nome, sorgente: re.source, flag: re.flags });

export const SORGENTI_REGOLE = Object.freeze([
  ...RE_SEGNAPOSTO.map((r) => voce("segnaposto", r.nome, r.re)),
  ...RE_SPIA.map((r) => voce("claim", r.nome, r.re)),
  voce("numero", "numero significativo", RE_NUMERO),
  voce("fonte", "marcatore di fonte", RE_FONTE),
  voce("soggetto", "numero attaccato a un soggetto di business", RE_SOGGETTO),
]);

/** Il profilo del canale clienti. Stesso oggetto che `regolePer("lettera")` torna nel cervello. */
export function regolePer(tipo: string): RegoleApplicate {
  if (tipo !== "lettera") {
    throw new Error(`onesta-check (Pannello): questo metro serve un canale solo, la lettera al cliente — non «${tipo}»`);
  }
  return {
    segnaposto: true,
    claim: true,
    // ⚖️ DECISO DA NICOLA il 2026-08-28: il metro sulle mail ai clienti resta SEVERO.
    // Il gemello nel cervello porta la stessa riga e la stessa ragione — e `due-metri-una-regola`
    // diventa rossa il giorno che una delle due cambia senza l'altra, che è tutto il punto di AR-791.
    numeri: true,
    perche_numeri:
      "lettera a un cliente vero: ogni numero porta la sua fonte (metro severo, confermato da Nicola il 2026-08-28 — la proposta di fondare solo i claim aspetta che veda le otto mail di prova)",
  };
}

/**
 * Toglie dal testo i pezzi che SONO una fonte, sostituendoli con spazi della stessa lunghezza: così
 * gli indici restano quelli del testo originale e il contesto dei numeri veri non si sposta.
 */
// ⚠️ `codice: false` SUL CANALE CLIENTI — il gemello di cervello/onesta-check.mjs. Mascherare il
// codice fra apici serve su un documento interno; in una mail a un cliente apre il cancello, perché
// basta scrivere «siamo scelti da `3.000 clienti`» e il numero sparisce dagli occhi del metro.
// Questo modulo serve UN canale solo, la lettera: qui il codice non si maschera mai.
export function mascheraRiferimenti(testo: string, { codice = true }: { codice?: boolean } = {}): string {
  let t = String(testo ?? "");
  const regole = codice
    ? [RE_BLOCCO_CODICE, RE_CODICE_INLINE, RE_RIFERIMENTO_CODICE, RE_SIGLA_DIFETTO, RE_SIGLA_LEZIONE]
    : [RE_RIFERIMENTO_CODICE, RE_SIGLA_DIFETTO, RE_SIGLA_LEZIONE];
  for (const re of regole) {
    t = t.replace(re, (m) => " ".repeat(m.length));
  }
  return t;
}

/**
 * Questo numero va fondato, dato il profilo? Funzione PURA: è la decisione, e la prova la ESEGUE.
 * Gemella di `numeroDaFondare` in cervello/onesta-check.mjs.
 */
export function numeroDaFondare(raw: string, dopo: string, modo: boolean | "solo-claim"): boolean {
  if (modo === false) return false;
  if (modo !== "solo-claim") return true;
  RE_SOGGETTO.lastIndex = 0;
  return RE_SOGGETTO.test(`${raw} ${String(dopo ?? "").slice(0, 30)}`);
}

/**
 * «[ -f "$1" ]» è un pezzo di shell citato, non un buco da riempire. Esenzione dichiarata
 * `snippet-di-shell-fra-parentesi-quadre` in cervello/onesta-ambito.mjs: il motivo per esteso vive
 * lì, qui c'è il solo pezzo che DECIDE, perché i due verdetti coincidano anche su questo caso.
 */
export function esenteSnippetDiShell(raw: string): boolean {
  const t = String(raw || "");
  if (!/^\[\s/.test(t) || !/\s\]$/.test(t)) return false;
  return /(\$|-eq\b|-ne\b|-gt\b|-lt\b|-ge\b|-le\b|\s-[fdnzex]\s|=)/.test(t);
}

/**
 * IL GIUDIZIO — funzione pura: entra un nome e un testo, esce il verdetto. Gemella di `giudica`
 * in cervello/onesta-check.mjs, che sullo stesso testo col profilo `lettera` deve dire la stessa cosa.
 */
export function giudicaLettera(nome: string, testo: string): EsitoOnesta {
  const violazioni: ViolazioneOnesta[] = [];
  const esentati: { id: string; regola: string; esempio: string }[] = [];
  const regole = regolePer("lettera");
  const daGiudicare = String(testo ?? "");

  // I wikilink [[...]] non sono segnaposto: sono link interni.
  const senzaWikilink = daGiudicare.replace(/\[\[[^\]]+\]\]/g, "");

  for (const { nome: rn, re } of RE_SEGNAPOSTO) {
    re.lastIndex = 0;
    const m = senzaWikilink.match(re);
    const veri = (m || []).filter((s) => {
      if (!esenteSnippetDiShell(s)) return true;
      esentati.push({ id: "snippet-di-shell-fra-parentesi-quadre", regola: "segnaposto", esempio: s });
      return false;
    });
    if (veri.length) violazioni.push({ tipo: "segnaposto", regola: rn, esempi: [...new Set(veri)].slice(0, 3) });
  }
  for (const { nome: rn, re } of RE_SPIA) {
    re.lastIndex = 0;
    const m = daGiudicare.match(re);
    if (m) violazioni.push({ tipo: "claim-non-verificato", regola: rn, esempi: [...new Set(m)].slice(0, 3) });
  }

  const testoNumeri = regole.numeri ? mascheraRiferimenti(daGiudicare, { codice: false }) : "";
  RE_NUMERO.lastIndex = 0;
  let mm: RegExpExecArray | null;
  const orfani = new Set<string>();
  while (regole.numeri && (mm = RE_NUMERO.exec(testoNumeri)) !== null) {
    const raw = mm[0].trim();
    const soloNum = raw.replace(/[^\d]/g, "");
    if (!soloNum) continue;
    if (/^(19|20)\d{2}$/.test(soloNum) && !/[€%]|euro|negozi|famiglie|clienti|ordini/i.test(raw)) continue;
    if (soloNum.length < 2 && !/[€%]/.test(raw)) continue;
    const ctx = daGiudicare.slice(Math.max(0, mm.index - 60), mm.index + raw.length + 60);
    if (RE_FONTE.test(ctx)) continue;
    if (!numeroDaFondare(raw, daGiudicare.slice(mm.index + raw.length, mm.index + raw.length + 30), regole.numeri)) continue;
    orfani.add(raw);
  }
  if (orfani.size) {
    violazioni.push({
      tipo: "numero-senza-fonte",
      regola: "ogni numero deve avere una fonte",
      esempi: [...orfani].slice(0, 5),
    });
  }

  return { file: nome, tipo: "lettera", regole_applicate: regole, violazioni, esentati };
}

/** La porta che usa `mani.ts`: un nome, un testo, e le violazioni da mostrare a chi ha premuto. */
export function esaminaOnesta(nome: string, testo: string): { file: string; violazioni: ViolazioneOnesta[] } {
  const esito = giudicaLettera(nome, testo);
  return { file: esito.file, violazioni: esito.violazioni };
}

export function riassuntoViolazioni(violazioni: ViolazioneOnesta[]): string {
  return violazioni
    .map((v) => `${v.regola}${v.esempi.length ? `: ${v.esempi.join(", ")}` : ""}`)
    .join(" · ");
}
