// AR-185 / AR-583 — IL MANDATO DI UN SENIOR, LETTO PER INTERO.
//
// Perché questo file esiste. Il guardiano `keyword-owner-check.mjs` doveva garantire la regola di casa
// AR-008 («un mandato, un solo padrone»). Leggeva però soltanto l'elenco fra virgolette del blocco
// «Delega qui per "…"» e buttava via tutto il resto della scheda — cioè proprio la frase con cui il
// mansionario dichiara di cosa risponde: «Usa per …». Risultato: crm-lifecycle e cro si contendevano il
// carrello abbandonato, public-policy reclamava l'inquadramento dei rider di consulente-lavoro, e i due
// guardiani anti-doppione restavano verdi. Un controllo verde per cecità è indistinguibile da un sistema sano.
//
// Qui vive la logica che DECIDE, in funzioni pure senza I/O: i guardiani fanno solo da mani (leggono i
// file e stampano), così la prova può eseguire l'estrazione sui 120 mansionari veri invece di cercare
// parole dentro il codice.
//
// COME RICONOSCE DUE MANDATI CHE SI SOVRAPPONGONO
// Il router non fa il confronto lettera-per-lettera: «recupero carrelli abbandonati» e «tasso di abbandono
// carrello» sono lo stesso tema scritto in due modi. Quindi ogni frase del mandato viene ridotta alle sue
// RADICI (parole senza desinenza, tolte le parole vuote) e due frasi valgono come lo stesso mandato quando:
//   · condividono almeno MIN_RADICI_CONDIVISE radici,
//   · ciascuna aggiunge al più MAX_RADICI_ESTRANEE radici proprie (se una parla di molto altro, non è lo stesso tema),
//   · almeno una radice condivisa è SPECIFICA, cioè ricorre in non più di SOGLIA_RADICE_SPECIFICA mandati
//     su 120 (~7%): «carrello» e «rider» descrivono un tema, «cliente» o «negozio» sono il contesto di
//     qualunque scheda e da soli non fondano una rivendicazione.
// Il conflitto scatta solo se NESSUNO dei due rimanda all'altro: un deferral «(→ tema = **agente**)» è la
// dichiarazione che l'owner è il vicino, ed è quello che spegne l'ambiguità.

/** Frasi che dichiarano un limite (chi firma) e non una rivendicazione di mandato: non contano come tema. */
const RE_FRASE_LIMITE = /firma|nicola|🔴|umano abilitat|abilitato/i;

/** Parole vuote (già ridotte a radice dove serve): non fondano un tema. */
const RADICI_VUOTE = new Set(
  ("il lo la i gli le un uno una di del della dello dei degli delle da dal dalla dallo a al alla ai agli alle " +
    "in nel nella nei negli nelle con col su sul sulla sui per tra fra e o ed od che chi come quando quale " +
    "quali quanto quanti non si ci vi ne se ma anche piu meno molto poco tutto tutti questo questi quello " +
    "quelli sono essere ha hanno avere fa fare usa perche dove ogni altro altri suo sua loro nostro mio gia " +
    "solo sempre mai qui quant quest qual perch cosa davver siam possiam nessun dell degl dall nell sull " +
    "propr stess vers second event pero cioe oltre senza sotto sopra dopo prima poi ancora " +
    // nomi del contesto d'azienda: compaiono ovunque, non distinguono un mandato dall'altro
    "mycity marketplac piacenz laziend").split(/\s+/)
);

/** Una radice conta come "specifica" se non compare in più di tanti mandati (vedi testata). */
export const SOGLIA_RADICE_SPECIFICA = 8;
export const MAX_RADICI_ESTRANEE = 2;
export const MIN_RADICI_CONDIVISE = 2;

/** Estrae il campo `description:` dal frontmatter YAML di un mansionario. "" se manca. */
export function estraiDescription(testo) {
  const m = String(testo || "").match(/^---\s*[\r\n]([\s\S]*?)[\r\n]---/);
  const fm = m ? m[1] : String(testo || "");
  const d = fm.match(/description:\s*([\s\S]*?)(?:[\r\n]\w[\w-]*:\s|$)/);
  return d ? d[1].replace(/\s+/g, " ").trim() : "";
}

/**
 * Separa una description nelle sue tre parti:
 *   · mandato  — «Usa per …», la rivendicazione formale (la parte che il vecchio guardiano buttava via);
 *   · domande  — il blocco «Delega qui per "…"», le frasi colloquiali con cui si chiama il senior;
 *   · rimandi  — i deferral, sia «(→ tema = **agente**)» sia la coda «Deferral (owner unico): … → agente».
 */
export function separaDescription(desc) {
  const testo = String(desc || "");
  const rimandi = [];
  for (const blocco of testo.match(/\([^)]*→[^)]*\)/g) || []) rimandi.push(blocco);
  let resto = testo.replace(/\([^)]*→[^)]*\)/g, " ");
  const iCoda = resto.search(/deferral\s*\(owner unico\)\s*:/i);
  if (iCoda >= 0) {
    rimandi.push(resto.slice(iCoda));
    resto = resto.slice(0, iCoda);
  }
  const fuoriParentesi = resto.replace(/\([^)]*\)/g, " ");
  if (fuoriParentesi.includes("→")) rimandi.push(fuoriParentesi.slice(fuoriParentesi.indexOf("→")));
  const iDomande = resto.toLowerCase().indexOf("delega qui per");
  const mandato = (iDomande >= 0 ? resto.slice(0, iDomande) : resto).replace(/^\s*usa (per|come)\s*/i, "").trim();
  const domande = iDomande >= 0 ? resto.slice(iDomande + "delega qui per".length).trim() : "";
  return { mandato, domande, rimandi };
}

/** Radice grezza di una parola italiana: minuscole, niente accenti, via le desinenze più comuni. */
export function radice(parola) {
  let s = String(parola || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");
  if (s.length > 5) s = s.replace(/(zione|zioni|mento|menti|aggio|abile|ibili|ibile)$/, "");
  if (s.length > 4) s = s.replace(/(are|ere|ire|ato|ata|ati|ate|uto|uti|ita|ite|ito|iti|anti|ante|endo|ando)$/, "");
  if (s.length > 3) s = s.replace(/[aeiou]$/, "");
  return s;
}

/** Radici significative di una frase (senza doppioni, senza parole vuote, senza monosillabi). */
export function radiciDi(frase) {
  return [...new Set(String(frase || "").split(/\s+/).map(radice).filter((r) => r.length >= 4 && !RADICI_VUOTE.has(r)))];
}

/**
 * Spezza il MANDATO nelle sue frasi-tema. Separatori: virgole, slash, due punti, parentesi, trattini
 * lunghi, punto fermo — cioè il modo in cui questi mansionari elencano di cosa rispondono.
 * Restano fuori le frasi-limite («la firma resta di Nicola») e quelle con meno di due radici utili.
 */
export function frasiDelMandato(desc) {
  const { mandato } = separaDescription(desc);
  return mandato
    .split(/[/,:·()]|\s—\s|\s-\s|\.\s|«|»|"|"|"/)
    .map((p) => p.trim())
    .filter(Boolean)
    .filter((p) => !RE_FRASE_LIMITE.test(p))
    .map((testo) => ({ testo, radici: radiciDi(testo) }))
    .filter((f) => f.radici.length >= MIN_RADICI_CONDIVISE);
}

/**
 * Nomi di senior verso cui questa description rimanda (i deferral). Si cercano solo DENTRO i blocchi di
 * rimando: un nome citato nel mandato è una rivendicazione, non un rimando.
 * @param {string} desc
 * @param {string[]} nomiNoti i 120 nomi reali dei mansionari
 */
export function agentiRichiamati(desc, nomiNoti = []) {
  const { rimandi } = separaDescription(desc);
  const testo = rimandi.join(" ");
  const out = new Set();
  for (const n of nomiNoti) {
    if (new RegExp("\\b" + n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b").test(testo)) out.add(n);
  }
  return out;
}

/**
 * Il cuore: prende le schede reali e restituisce le coppie di senior che si contendono lo stesso mandato
 * senza che nessuno dei due rimandi all'altro.
 * @param {{nome:string, testo?:string, description?:string}[]} schede
 */
export function analizzaMandati(schede = []) {
  const nomi = schede.map((s) => s.nome);
  const desc = new Map();
  const frasi = new Map();
  const rimandi = new Map();
  const quantiMandati = new Map(); // radice -> in quanti mandati compare

  for (const s of schede) {
    const d = s.description != null ? s.description : estraiDescription(s.testo);
    desc.set(s.nome, d);
    const f = frasiDelMandato(d);
    frasi.set(s.nome, f);
    for (const r of new Set(f.flatMap((x) => x.radici))) quantiMandati.set(r, (quantiMandati.get(r) || 0) + 1);
  }
  for (const s of schede) rimandi.set(s.nome, agentiRichiamati(desc.get(s.nome), nomi));

  const specifica = (r) => (quantiMandati.get(r) || 0) <= SOGLIA_RADICE_SPECIFICA;

  const conflitti = [];
  for (let i = 0; i < nomi.length; i++) {
    for (let j = i + 1; j < nomi.length; j++) {
      const a = nomi[i];
      const b = nomi[j];
      // basta che UNO dei due dichiari il vicino: è la dichiarazione di chi è l'owner (AR-008).
      if (rimandi.get(a).has(b) || rimandi.get(b).has(a)) continue;
      const temi = [];
      for (const fa of frasi.get(a)) {
        for (const fb of frasi.get(b)) {
          const insiemeB = new Set(fb.radici);
          const condivise = fa.radici.filter((r) => insiemeB.has(r));
          if (condivise.length < MIN_RADICI_CONDIVISE) continue;
          if (fa.radici.length - condivise.length > MAX_RADICI_ESTRANEE) continue;
          if (fb.radici.length - condivise.length > MAX_RADICI_ESTRANEE) continue;
          if (!condivise.some(specifica)) continue;
          temi.push({ tema: [...condivise].sort().join("+"), frase_a: fa.testo, frase_b: fb.testo });
        }
      }
      if (temi.length) conflitti.push({ a, b, temi });
    }
  }
  conflitti.sort((x, y) => x.a.localeCompare(y.a) || x.b.localeCompare(y.b));

  return {
    conflitti,
    schede: nomi.length,
    frasi_mandato: [...frasi.values()].reduce((n, f) => n + f.length, 0),
    senza_mandato: nomi.filter((n) => frasi.get(n).length === 0),
    radici_specifiche: [...quantiMandati.keys()].filter(specifica).length,
  };
}

/**
 * AR-130 — I CAPIFILA MUTI. Se due o più specialisti rimandano a un senior, quel senior è un capofila:
 * deve dichiarare nella PROPRIA description dove finisce il suo confine. Finché tace, chi legge solo la
 * sua scheda crede che faccia tutto — ed è così che il lavoro dello specialista resta fermo dal
 * generalista (era il caso di security, legale-privacy, operations e altri cinque).
 * @param {{nome:string, testo?:string, description?:string}[]} schede
 * @param {number} soglia quanti rimandi ricevuti fanno di un senior un capofila
 */
export function capifilaMuti(schede = [], soglia = 2) {
  const nomi = schede.map((s) => s.nome);
  const desc = new Map(
    schede.map((s) => [s.nome, s.description != null ? s.description : estraiDescription(s.testo)])
  );
  const rimanda = new Map(nomi.map((n) => [n, agentiRichiamati(desc.get(n), nomi)]));
  const ricevuti = new Map(nomi.map((n) => [n, 0]));
  for (const verso of rimanda.values()) for (const v of verso) ricevuti.set(v, (ricevuti.get(v) || 0) + 1);
  return nomi.filter((n) => rimanda.get(n).size === 0 && ricevuti.get(n) >= soglia);
}

// ————————————————————————————————————————————————————————————————————————————————————
// AR-349 — i percorsi citati dentro un mansionario sono configurazione, non prosa.
// Un mansionario che manda il senior a leggere `MyCity-Vault/02-Aree/Area - Consegna.md` lo manda a
// sbattere: quella cartella non esiste più (le Aree stanno sotto 04-Prodotto-Ops). Finché nessuno APRE
// quei percorsi, l'errore è invisibile — il prompt sembra a posto perché è testo.
// ————————————————————————————————————————————————————————————————————————————————————

/** Vero se la stringa fra backtick sembra il percorso di un file (e non un segnaposto o un glob). */
const RE_PERCORSO = /^[A-Za-z0-9][A-Za-z0-9 _.\/'-]*\.(md|json|mjs|js|ts|sh|csv)$/;

/**
 * Percorsi di file citati fra backtick in un mansionario. I comandi («node cervello/x.mjs») sono
 * riconosciuti e ridotti al loro argomento-file, i segnaposto (AAAA-MM-GG, <nome>, glob) sono esclusi.
 */
export function percorsiCitati(testo) {
  const out = new Set();
  for (const m of String(testo || "").matchAll(/`([^`\n]+)`/g)) {
    let p = m[1].trim();
    const cmd = p.match(/^(?:node|bash|sh|npx|npm run|git)\s+(\S+)/);
    if (cmd) p = cmd[1];
    if (!RE_PERCORSO.test(p)) continue;
    if (p.includes("*") || /AAAA|<|>/.test(p)) continue;
    out.add(p);
  }
  return [...out];
}

/**
 * Percorsi morti = citati ma non risolvibili. `risolvi(p)` torna true se il percorso esiste così com'è
 * oppure se è la coda di un file vero (i mansionari citano spesso la forma corta `AZIONI-IN-ATTESA.md`).
 * @param {{nome:string, testo:string}[]} schede
 * @param {(p:string)=>boolean} risolvi
 */
export function percorsiMorti(schede = [], risolvi = () => true) {
  const out = [];
  for (const { nome, testo } of schede) {
    for (const p of percorsiCitati(testo)) if (!risolvi(p)) out.push({ agente: nome, percorso: p });
  }
  return out;
}

// ————————————————————————————————————————————————————————————————————————————————————
// AR-188 / AR-585 — la matrice letta dall'altro lato: non «ogni senior ha un mandato?» ma
// «ogni canale che parla a un cliente o a un negoziante ha un senior che ne risponde?».
// Finché la si legge in una direzione sola, i buchi si scoprono il giorno del primo invio.
// ————————————————————————————————————————————————————————————————————————————————————

/** Parole con cui una description può reclamare un canale. */
const PAROLE_CANALE = {
  email: ["email", "posta elettronica"],
  whatsapp: ["whatsapp"],
  telegram: ["telegram"],
  sms: ["sms"],
  push: ["push"],
  "notifiche in-app": ["notifiche in-app", "notifica in-app", "notifiche in app"],
};

/**
 * Canali verso persone dichiarati in `cervello/azioni.md`: si prendono le righe di tabella la cui
 * colonna «a cosa serve» nomina clienti o negozianti. L'elenco NON è scritto a mano qui: viene dal file
 * che descrive le mani, così quando nasce una mano nuova il controllo se ne accorge da solo.
 */
export function canaliVersoPersone(testoAzioni) {
  const out = [];
  for (const riga of String(testoAzioni || "").split(/\r?\n/)) {
    if (!riga.trim().startsWith("|")) continue;
    const celle = riga.split("|").map((c) => c.trim());
    if (celle.length < 4) continue;
    const mano = celle[1].replace(/\*\*|⭐|`/g, "").trim();
    const aCosaServe = celle[2].toLowerCase();
    if (!/client|negozian/.test(aCosaServe)) continue;
    const chiave = Object.keys(PAROLE_CANALE).find((k) =>
      PAROLE_CANALE[k].some((p) => mano.toLowerCase().includes(p.split(" ")[0]))
    );
    if (chiave) out.push({ mano, chiave });
  }
  // un canale può comparire in più tabelle (gratis / a consumo): tienilo una volta sola
  const visti = new Set();
  return out.filter((c) => (visti.has(c.chiave) ? false : visti.add(c.chiave)));
}

/**
 * Canali senza nessun senior che li reclami nella propria description.
 * @param {{mano:string, chiave:string}[]} canali
 * @param {Map<string,string>} descriptions nome → description
 */
export function canaliSenzaOwner(canali = [], descriptions = new Map()) {
  const out = [];
  for (const c of canali) {
    const parole = PAROLE_CANALE[c.chiave] || [c.chiave];
    const owner = [...descriptions.entries()]
      .filter(([, d]) => parole.some((p) => String(d).toLowerCase().includes(p)))
      .map(([n]) => n);
    if (owner.length === 0) out.push({ canale: c.mano, chiave: c.chiave });
  }
  return out;
}
