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
  /** 🚧 AR-875 — la regola di POLITICA: la scarsità e l'urgenza fabbricate non passano. */
  politica: boolean;
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

// 🚧 AR-873 — i numeri scritti A PAROLE erano invisibili: «siamo già duemila famiglie», «un
// migliaio di noi», «qualche centinaio di persone» passavano tutti e tre. Il gemello di
// cervello/onesta-check.mjs, dove sta il perché per esteso.
const RE_SPIA = [
  { nome: "claim 'già N'", re: /\bgià\s+\d[\d.\s]*/gi },
  { nome: "claim vago 'centinaia/migliaia di'", re: /\b(centinaia|migliaia|decine)\s+di\b/gi },
  {
    nome: "claim scritto a parole ('duemila famiglie', 'un migliaio di')",
    re: /\b(?:(?:due|tre|quattro|cinque|sei|sette|otto|nove|dieci|undici|dodici|venti|trenta|quaranta|cinquanta|sessanta|settanta|ottanta|novanta)?(?:mila|mille|cento)|centinai[oa]|migliai[oa])\b/gi,
  },
];

// 🚧 AR-875 — LA SCARSITÀ FABBRICATA, che qui conta il doppio: è la regola di politica che decide
// se una mail parte verso una persona vera. «Restano 9 posti nel giro di consegna» non contiene
// nessun numero falso, contiene una pressione inventata — la stessa famiglia dei «prezzi che
// ballano» e delle «notifiche a chi passa davanti al negozio» che CONTESTO_BUSINESS.md §7 mette
// fra le cose da non costruire mai. Le forme sono COMPOSTE apposta: sul banco delle 41 mail le
// parole sole («restano», «ultimi», «adesso») compaiono in 15 mail oneste.
const RE_POLITICA = [
  {
    nome: "scarsità fabbricata: posti che si esauriscono",
    re: /\b(?:restano|rimangono|ne\s+restano|sono\s+rimasti|ultimi|ancora)\s+(?:sol[oi]\s+|soltanto\s+|pochi\s+|poche\s+)?(?:\d+|due|tre|quattro|cinque|pochi|poche)\s+(?:post[oi]|slot|pezz[oi]|consegne|carrell[oi]|copert[oi]|abbonament[oi])\b/gi,
  },
  { nome: "scarsità fabbricata: numero chiuso / chi resta fuori", re: /\b(?:numero\s+chiuso|chi\s+resta\s+fuori)\b/gi },
  { nome: "scarsità fabbricata: si sono esauriti", re: /\bsi\s+(?:sono\s+)?esaurit\w+\b/gi },
  {
    nome: "urgenza fabbricata: affrettati / ultima chiamata",
    re: /\b(?:affrettati|sbrigati|ultima\s+chiamata|non\s+perdere\s+l['’]occasione|prima\s+che\s+finiscano|finché\s+ci\s+sono\s+post[oi])\b/gi,
  },
];

// 🚧 AR-869 — con `\d{1,3}` in testa, «3000 famiglie» non veniva nemmeno visto (su «3000» prendeva
// «300», pretendeva il confine di parola, trovava un altro «0» e rinunciava): il metro chiedeva al
// bugiardo di scrivere il punto delle migliaia per essere fermato.
const RE_NUMERO = /\b\d+(?:[.,]\d{3})*(?:[.,]\d+)?\s?(?:€|euro|%|negozi|famiglie|clienti|ordini|utenti|iscritti|follower)?\b/gi;

// Fonte strutturata o citazione esplicita — niente parole generiche da sole.
const RE_FONTE = /(fonte\s*:|\(fonte|\[dati\]|\[fonte|supabase|stripe|posthog|registro-fatti|registro-realt|\{fonte:)/i;

// Il soggetto che trasforma una cifra in un CLAIM DI BUSINESS: «3.000 clienti» è una promessa da
// fondare, «3,50 €» e «dalle 9 alle 13» no.
// 🚧 AR-876 — due buchi chiusi: «nuclei familiari» (che è «famiglie» detto con un sinonimo) e la
// percentuale che promette un risultato. Il perché per esteso sta nel gemello.
const RE_SOGGETTO = /\b(negozi|botteghe|famiglie|nucle[oi]\s+familiar[ei]|clienti|utenti|iscritti|follower|recensioni|ordini|consegne)\b/i;

// Le parole che trasformano una PERCENTUALE in un risultato promesso. Lo sconto resta fuori: quello
// lo verifica il carrello alla cassa.
const RE_RISULTATO_PROMESSO = /\b(spesa|spese|tempo|sprec\w+|scadut\w+|risparmi\w+|fatica|attesa|cod[ae]|bolletta|costi)\b/i;

// I pezzi che SONO una fonte e non un numero orfano (AR-433).
// 🚧 AR-870 — senza il lookbehind questa riga costava 4,5 secondi su 80.000 caratteri senza spazi
// (misurato: 10k → 67 ms · 20k → 224 · 40k → 897 · 80k → 4.485): partiva da OGNI carattere del
// blocco e per ognuno risaliva all'indietro. Il verso del danno qui è «il canale si pianta».
export const RE_RIFERIMENTO_CODICE = /(?<![\w./-])[\w./-]+\.(?:mjs|sh|ts|tsx|js|jsx|json|md|ps1|bats|py):\d+(?:-\d+)?/g;
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
  ...RE_POLITICA.map((r) => voce("politica", r.nome, r.re)),
  voce("numero", "numero significativo", RE_NUMERO),
  voce("fonte", "marcatore di fonte", RE_FONTE),
  voce("soggetto", "numero attaccato a un soggetto di business", RE_SOGGETTO),
  voce("risultato", "percentuale che promette un risultato", RE_RISULTATO_PROMESSO),
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
    // 🚧 AR-875 — la lista «NON COSTRUIRE» di CONTESTO_BUSINESS.md §7 vale anche per quello che
    // SCRIVIAMO, non solo per quello che costruiamo: la scarsità inventata è la stessa spinta dei
    // prezzi che ballano e delle notifiche a chi passa davanti al negozio, detta a parole.
    politica: true,
    perche_numeri:
      "lettera a un cliente vero: ogni numero porta la sua fonte (metro severo, confermato da Nicola il 2026-08-28 — la proposta di fondare solo i claim aspetta che veda le otto mail di prova)",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// AR-870 — IL TETTO: oltre il quale il metro DICHIARA di non aver guardato (⚪)
// ─────────────────────────────────────────────────────────────────────────────
// Una mail vera non è mai enorme (la più lunga del banco delle 41: 1.400 caratteri). Oltre il tetto
// il metro non macina: dichiara di non aver potuto giudicare — e sul canale clienti quel ⚪ BLOCCA,
// perché una mail che nessuno ha letto non parte. Stessi numeri nel gemello, così i due verdetti
// non divergono proprio sul caso limite.
// Il Pannello serve UN canale solo — la lettera — quindi porta solo il tetto della lettera. Nel
// gemello c'è anche quello della memoria (i file del vault sono legittimamente enormi: DECISIONI.md
// pesa 856 KB), ma qui non serve e non deve esistere: un tetto che questo modulo non usa sarebbe
// solo una terza cosa da tenere allineata.
export const LIMITE_TESTO = 100000;
export const TIPO_NON_GIUDICABILE = "non-giudicabile";

export function rilievoTroppoLungo(lunghezza: number): ViolazioneOnesta {
  return {
    tipo: TIPO_NON_GIUDICABILE,
    regola: `testo troppo lungo per essere giudicato (${lunghezza} caratteri, il tetto è ${LIMITE_TESTO}): ⚪ non l'ho guardato, e ⚪ non è verde`,
    esempi: [],
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
  const contorno = `${raw} ${String(dopo ?? "").slice(0, 30)}`;
  // 🚧 AR-876 — la percentuale che promette un risultato è un claim anche senza soggetto.
  if (/%/.test(raw) && RE_RISULTATO_PROMESSO.test(contorno)) return true;
  RE_SOGGETTO.lastIndex = 0;
  return RE_SOGGETTO.test(contorno);
}

// ─────────────────────────────────────────────────────────────────────────────
// AR-791 — LE ESENZIONI DICHIARATE, PORTATE ANCHE QUI
// ─────────────────────────────────────────────────────────────────────────────
// È la strada da cui il difetto è nato e che nessuno aveva percorso. Le esenzioni («21 agosto» è
// una data, «14:29» è un orario, `[ -f "$1" ]` è shell citata) vivevano SOLO in
// cervello/onesta-ambito.mjs, quindi il Pannello bocciava gli orari e le date ISO che il cervello
// lasciava passare: tre casi del banco divergevano, e il Pannello era il più severo.
//
// I MOTIVI per esteso restano di là — quello è il registro, e non si sdoppia. Qui c'è solo il pezzo
// che DECIDE, perché i due verdetti coincidano; `due-metri-una-regola.test.mjs` esegue le due
// versioni sulla stessa griglia di rilievi e diventa rossa il giorno che una cambia senza l'altra.
const MESI = "gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre";

export type Rilievo = { regola: string; raw: string; prima?: string; dopo?: string };

/** «21» in «21/8», «21 agosto», «2026-08-21»: un pezzo di data, non una cifra di business. */
export function eUnaData({ raw, prima = "", dopo = "" }: Rilievo): boolean {
  const n = Number(String(raw).replace(/[^\d]/g, ""));
  const giorno = n >= 1 && n <= 31;
  const mese = n >= 1 && n <= 12;
  if (giorno && /^\/(0?[1-9]|1[0-2])\b/.test(dopo)) return true;
  if (mese && /\b(0?[1-9]|[12]\d|3[01])\/$/.test(prima)) return true;
  if (giorno && new RegExp(`^\\s+(${MESI})\\b`, "i").test(dopo)) return true;
  if (mese && /\b(19|20)\d{2}-$/.test(prima)) return true;
  if (giorno && /\b(19|20)\d{2}-(0?[1-9]|1[0-2])-$/.test(prima)) return true;
  return false;
}

/** «14» in «14:29», «29» in «14:29»: un pezzo d'orario. */
export function eUnOrario({ raw, prima = "", dopo = "" }: Rilievo): boolean {
  const n = Number(String(raw).replace(/[^\d]/g, ""));
  if (n >= 0 && n <= 23 && /^:[0-5]\d\b/.test(dopo)) return true;
  if (n >= 0 && n <= 59 && /\b([01]?\d|2[0-3]):$/.test(prima)) return true;
  return false;
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
 * Questo rilievo è uno dei falsi positivi DICHIARATI? Gemella di `esenzioneDelRilievo` in
 * cervello/onesta-ambito.mjs: stessa firma, stessi id, stesse risposte.
 */
export function esenzioneDelRilievo(r: Rilievo): { esente: boolean; id?: string } {
  const v: Rilievo = { regola: String(r?.regola ?? ""), raw: String(r?.raw ?? ""), prima: String(r?.prima ?? ""), dopo: String(r?.dopo ?? "") };
  if (v.regola === "numero-senza-fonte") {
    if (eUnaData(v)) return { esente: true, id: "data-di-calendario" };
    if (eUnOrario(v)) return { esente: true, id: "orario" };
  }
  if (v.regola === "segnaposto" && esenteSnippetDiShell(v.raw)) {
    return { esente: true, id: "snippet-di-shell-fra-parentesi-quadre" };
  }
  return { esente: false };
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

  // 🚧 AR-870 — il tetto PRIMA di ogni regola: se non posso guardare lo dico, e sul canale clienti
  // «non l'ho guardato» ferma la mail. Nessun silenzio, nessun verde comprato con un timeout.
  if (daGiudicare.length > LIMITE_TESTO) {
    return { file: nome, tipo: "lettera", regole_applicate: regole, violazioni: [rilievoTroppoLungo(daGiudicare.length)], esentati };
  }

  // Le esenzioni dichiarate, con l'id che finisce nel referto (AR-791: prima vivevano solo di là).
  const scarta = (regola: string, r: Rilievo): boolean => {
    const e = esenzioneDelRilievo({ ...r, regola });
    if (e.esente) esentati.push({ id: e.id as string, regola, esempio: r.raw });
    return e.esente;
  };

  // I wikilink [[...]] non sono segnaposto: sono link interni.
  const senzaWikilink = daGiudicare.replace(/\[\[[^\]]+\]\]/g, "");

  for (const { nome: rn, re } of RE_SEGNAPOSTO) {
    re.lastIndex = 0;
    const m = senzaWikilink.match(re);
    const veri = (m || []).filter((s) => !scarta("segnaposto", { regola: "segnaposto", raw: s }));
    if (veri.length) violazioni.push({ tipo: "segnaposto", regola: rn, esempi: [...new Set(veri)].slice(0, 3) });
  }
  for (const { nome: rn, re } of RE_SPIA) {
    re.lastIndex = 0;
    const m = daGiudicare.match(re);
    const veri = (m || []).filter((s) => !scarta("claim-non-verificato", { regola: "claim-non-verificato", raw: s }));
    if (veri.length) violazioni.push({ tipo: "claim-non-verificato", regola: rn, esempi: [...new Set(veri)].slice(0, 3) });
  }
  // 🚧 AR-875 — la scarsità e l'urgenza fabbricate: non guarda se il numero è vero, guarda se la
  // frase mette fretta con una scarsità che non esiste.
  for (const { nome: rn, re } of regole.politica ? RE_POLITICA : []) {
    re.lastIndex = 0;
    const m = daGiudicare.match(re);
    const veri = (m || []).filter((s) => !scarta("scarsita-fabbricata", { regola: "scarsita-fabbricata", raw: s }));
    if (veri.length) violazioni.push({ tipo: "scarsita-fabbricata", regola: rn, esempi: [...new Set(veri)].slice(0, 3) });
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
    // 🚧 AR-791 — il contorno si misura sul numero VERO (`raw`), come di là: `\s?` davanti all'unità
    // fa uscire «21 agosto» come «21 » con lo spazio dentro, e chi legge dal fondo del match si
    // perde proprio la parola che dice che quel 21 è un giorno.
    const prima = daGiudicare.slice(Math.max(0, mm.index - 16), mm.index);
    const dopo = daGiudicare.slice(mm.index + raw.length, mm.index + raw.length + 16);
    if (scarta("numero-senza-fonte", { regola: "numero-senza-fonte", raw, prima, dopo })) continue;
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

export const TIPO_METRO_IN_AVARIA = "metro-in-avaria";

/**
 * La porta che usa `mani.ts`: un nome, un testo, e le violazioni da mostrare a chi ha premuto.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * 🚧 AR-871 — SE IL METRO ESPLODE, NON LO PRENDE NESSUNO
 * ─────────────────────────────────────────────────────────────────────────────
 * Questa funzione la chiama `mani.ts` a riga 117, dentro `eseguiAzione`, che a sua volta gira
 * dentro il campo `atto:` di `attoUnaVoltaSola` (lib/cancello-atto.ts) — e lì `p.atto()` è chiamato
 * SENZA try/catch (verificato sul codice vero, non sulla scheda). Un'eccezione qui dentro — un
 * `RangeError` su un testo mostruoso, una regex che il motore rifiuta, un `undefined` arrivato da
 * una card malformata — non veniva presa da nessuno: usciva dalla route come 500 generico.
 *
 * Il difetto vero non è il 500: è che il verdetto d'onestà SPARISCE. Chi legge un 500 non sa se la
 * mail è stata giudicata, e il modo naturale di reagire — riprovare — è esattamente la cosa da non
 * fare. La regola della casa: se il metro non ha potuto giudicare, la mail NON parte, e lo dice.
 *
 * Quindi qui l'eccezione diventa un VERDETTO ESPLICITO DI BLOCCO col motivo dentro. È la stessa
 * forma del ⚪ di AR-870 (testo oltre il tetto): «non l'ho guardato» non è mai un verde, ed è per
 * questo che esce come violazione — `mani.ts` blocca su `violazioni.length`, e l'azione resta in
 * coda con scritto perché.
 */
export function esaminaOnesta(nome: string, testo: string): { file: string; violazioni: ViolazioneOnesta[] } {
  try {
    const esito = giudicaLettera(nome, testo);
    return { file: esito.file, violazioni: esito.violazioni };
  } catch (e) {
    const perche = e instanceof Error ? e.message : String(e);
    return {
      file: nome,
      violazioni: [
        {
          tipo: TIPO_METRO_IN_AVARIA,
          regola:
            "il controllo onestà non ha potuto giudicare questo testo: la mail NON parte finché non si capisce perché (⚪ non è un verde)",
          esempi: [perche.slice(0, 200)],
        },
      ],
    };
  }
}

export function riassuntoViolazioni(violazioni: ViolazioneOnesta[]): string {
  return violazioni
    .map((v) => `${v.regola}${v.esempi.length ? `: ${v.esempi.join(", ")}` : ""}`)
    .join(" · ");
}
