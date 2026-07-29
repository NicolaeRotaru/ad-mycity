/**
 * AR-409 — quali rotte SCRIVONO, misurato sul codice invece che dedotto dal verbo.
 *
 * IL DIFETTO: `serratura.ts` classificava per VERBO — GET/HEAD/OPTIONS passano sempre, perché «GET =
 * sola lettura» è la scorciatoia standard. Qui non regge: alcune rotte usano la GET per innescare
 * lavoro (due per farsi chiamare dal cron di `vercel.json`, che sa fare solo GET, e una per chiudere
 * le card mentre le legge). Quelle rotte nascevano fuori dalla serratura, e nessuno lo scopriva.
 *
 * Peggio: il collaudo che accompagnava il fix ASSERIVA «le letture non sono toccate», cioè
 * certificava il buco come comportamento corretto. Una prova che protegge il difetto è il modo più
 * efficace di renderlo permanente.
 *
 * LA RADICE (la stessa dei fratelli del lotto 33): il confine era disegnato sull'effetto PRESUNTO
 * del verbo invece che sull'effetto REALE della rotta, e non esisteva nessun guardiano che elencasse
 * gli handler che scrivono e verificasse che passino dal cancello. Finché il perimetro è una
 * deduzione e non una misura, ogni rotta nuova che scrive da una GET nasce scoperta.
 *
 * Questo modulo è la MISURA. Non ha import e non tocca il disco: prende il testo di un `route.ts` e
 * risponde. Così lo eseguono sia la serratura (a runtime, sull'elenco dichiarato) sia il guardiano
 * `cervello/rotte-scriventi-check.mjs` (a ogni giro, su tutti i file veri) — e i due non possono
 * divergere, perché la definizione di «scrive» è una sola.
 */

/** Le funzioni con cui una rotta del Pannello cambia lo stato del mondo. */
export const SCRITTURE = [
  "creaLavoro",
  "setImpostazione",
  "logAzione",
  "registraFirma",
  "scriviMemoria",
  "salvaConversazione",
] as const;

/**
 * Il corpo di un handler esportato (`export async function GET(...) { … }`), preso contando le
 * graffe. Torna `null` se quell'handler non c'è.
 *
 * Contare le graffe è grossolano rispetto a un parser vero, e va bene così: l'errore possibile è
 * prendere PIÙ codice del dovuto, cioè sospettare una rotta che non scrive — un falso allarme che si
 * chiude dichiarandolo. L'errore che non possiamo permetterci è quello opposto, e questa direzione
 * non lo produce.
 */
export function corpoHandler(testo: string, metodo: string): string | null {
  const re = new RegExp(`export\\s+(?:async\\s+)?function\\s+${metodo}\\b`);
  const m = re.exec(testo);
  if (!m) return null;
  const apre = testo.indexOf("{", m.index + m[0].length);
  if (apre < 0) return null;
  let livello = 0;
  for (let i = apre; i < testo.length; i++) {
    const c = testo[i];
    if (c === "{") livello++;
    else if (c === "}") {
      livello--;
      if (livello === 0) return testo.slice(apre + 1, i);
    }
  }
  return testo.slice(apre + 1); // graffe sbilanciate: meglio guardare troppo che troppo poco
}

/** Toglie commenti e stringhe: una scrittura NOMINATA in un commento non è una scrittura. */
export function senzaCommentiEStringhe(codice: string): string {
  return codice
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1 ")
    .replace(/`(?:\\[\s\S]|[^`\\])*`/g, "``")
    .replace(/"(?:\\.|[^"\\])*"/g, '""')
    .replace(/'(?:\\.|[^'\\])*'/g, "''");
}

/**
 * I corpi delle funzioni definite NEL FILE, per nome.
 *
 * Serve perché una rotta quasi mai scrive di persona: `/api/report` chiama `accoda()`, che chiama
 * `creaLavoro`; `/api/heartbeat` delega tutto a `handle()`, condiviso fra GET e POST. Fermarsi al
 * corpo dell'handler faceva vedere UNA rotta scrivente su tre — e un guardiano che ne dichiara una
 * su tre e si dice verde è la stessa malattia che stiamo curando, un piano più in basso.
 */
export function funzioniLocali(testo: string): Map<string, string> {
  const fuori = new Map<string, string>();
  const re = /(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)|(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\(/g;
  for (const m of testo.matchAll(re)) {
    const nome = m[1] || m[2];
    if (!nome || fuori.has(nome)) continue;
    const corpo = corpoHandler(testo, nome) ?? corpoDaPosizione(testo, m.index ?? 0);
    if (corpo != null) fuori.set(nome, corpo);
  }
  return fuori;
}

/** Il primo blocco `{…}` a partire da una posizione: per le funzioni-freccia assegnate a una const. */
function corpoDaPosizione(testo: string, da: number): string | null {
  const apre = testo.indexOf("{", da);
  if (apre < 0) return null;
  let livello = 0;
  for (let i = apre; i < testo.length; i++) {
    if (testo[i] === "{") livello++;
    else if (testo[i] === "}" && --livello === 0) return testo.slice(apre + 1, i);
  }
  return null;
}

/**
 * Le scritture che l'handler `metodo` esegue **davvero**, seguendo anche le funzioni locali che
 * chiama (e quelle che chiamano loro). Si resta dentro il file: basta e avanza per la domanda
 * «questa rotta cambia lo stato del mondo?», e non pretende di essere un analizzatore vero.
 */
export function scrittureNelMetodo(testo: string, metodo: string): string[] {
  const partenza = corpoHandler(testo, metodo);
  if (partenza == null) return [];
  const locali = funzioniLocali(testo);
  const trovate = new Set<string>();
  const viste = new Set<string>([metodo]);
  const coda = [partenza];

  while (coda.length) {
    const pulito = senzaCommentiEStringhe(coda.pop() as string);
    for (const f of SCRITTURE) if (new RegExp(`\\b${f}\\s*\\(`).test(pulito)) trovate.add(f);
    for (const m of pulito.matchAll(/\b([A-Za-z_$][\w$]*)\s*\(/g)) {
      const nome = m[1];
      if (viste.has(nome) || !locali.has(nome)) continue;
      viste.add(nome);
      coda.push(locali.get(nome) as string);
    }
  }
  return [...trovate].sort();
}

/** La rotta scrive da una GET? (È la domanda che la serratura sbagliava.) */
export function scriveInLettura(testo: string): string[] {
  return [...new Set(["GET", "HEAD", "OPTIONS"].flatMap((m) => scrittureNelMetodo(testo, m)))].sort();
}

/**
 * Le rotte che scrivono anche in GET, DICHIARATE — con il perché, come si fa per ogni esenzione in
 * questo repo. La serratura le tratta come una POST: servono same-origin o token.
 *
 * L'elenco non è la verità: la verità è il codice. `cervello/rotte-scriventi-check.mjs` confronta i
 * due a ogni giro e fallisce se una rotta scrive in GET senza essere qui — così questa lista non può
 * invecchiare in silenzio, che è il modo in cui tutte le liste scritte a mano di questo lotto si
 * erano scollegate dalla realtà.
 */
export const SCRIVONO_IN_GET: { path: string; perche: string }[] = [
  {
    path: "/api/report",
    perche: "`?genera=` fa partire la generazione del report e la scrive: è un innesco di lavoro travestito da lettura, tenuto in GET perché il cron di vercel.json sa fare solo GET",
  },
  {
    path: "/api/azioni-pronte",
    perche: "mentre legge le card chiude quelle già eseguite, cioè scrive lo stato delle azioni: la lettura ha un effetto collaterale sul mondo",
  },
  {
    path: "/api/heartbeat",
    perche: "il battito timbra la memoria a ogni chiamata; resta in GET per il cron di vercel.json ed è protetto a parte da CRON_SECRET fail-closed nella route stessa",
  },
];

/** Questa richiesta punta a una rotta che scrive anche in lettura? */
export function rottaScriveInGet(percorso: string): boolean {
  return SCRIVONO_IN_GET.some((r) => percorso === r.path || percorso.startsWith(r.path + "/"));
}
