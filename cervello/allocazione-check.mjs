#!/usr/bin/env node
// Guardiano deterministico dell'ALLOCAZIONE DELLO SFORZO — rende ATTIVO il cancello di allocazione (AR-006).
// 🟢 Sola lettura: NON scrive nel vault, NON fa git. Legge il registro-realtà + le consegne e stampa un report.
//
// Risolve AR-006: la regola "sforzo di reparto PESANTE (post/QR/reel/evento) solo su entità CONFERMATA
// nel sistema" viveva solo come prosa in CLAUDE.md e come correzione nella LETTERA-A-NICOLA (sola lettura).
// Nessun canale la misurava: un senior poteva sfornare 12+ asset intestati a una 'scelta_ragionata'
// (prospect non firmato, es. Garetti) mentre l'unica entità 'confermata' payout-ready (dal 3/7:
// Pane Quotidiano, il negozio-faro) restava a 0 asset. Questo guardiano misura lo squilibrio a OGNI giro,
// come agent-registry-check per il registro agenti: il silo diventa un numero, non più una scoperta che
// dorme in una lettera.
//
// Uso:
//   node cervello/allocazione-check.mjs           -> report leggibile
//   node cervello/allocazione-check.mjs --json     -> output JSON (per gate / sentinelle)
//
// Exit: 0 = allocazione sana · 1 = silo/violazione (così può fare da gate nel giro)

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { percorsiDaGit } from "./percorsi-git.mjs";
import { storiaDelRepo } from "./storia-git.mjs";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza, stampSegnale } from "./git-github.mjs";
import { FINESTRA, ritmoVsMagazzino } from "./finestra-misura.mjs";

const JSON_MODE = process.argv.includes("--json");

/**
 * Lo stato della storia di git, chiesto una volta sola (AR-419). La quota di sforzo si misura sui
 * file toccati negli ultimi 7 giorni: se la storia è troncata quella finestra non esiste, e il
 * numero che ne uscirebbe descriverebbe il magazzino invece della settimana.
 */
const STORIA = storiaDelRepo(AD_ROOT);

// Cartelle dove vivono gli ASSET PESANTI intestabili a un'entità (post, grafiche, QR, kit, pagine SEO…).
// NON includiamo consegne/audit, consegne/decisioni, consegne/finanza ecc.: non sono "sforzo di reparto
// pesante intestato a un negozio", sono documenti di sistema.
const ROOT_PESANTI = [
  "consegne/content",
  "consegne/design",
  "consegne/pr",
  "consegne/seo",
  "creativi/output",
];

// Soglia: sopra questo numero di asset pesanti su UNA entità 'scelta_ragionata' scatta la violazione.
// (Bozza-template neutra occasionale = ok; un pacchetto completo intestato = no.)
const SOGLIA_PESANTI = 3;

// ─────────────────────────────────────────────────────────────────────────────
// AR-114 — LA SECONDA DIMENSIONE: MACCHINA vs BUSINESS.
//
// Il guardiano qui sopra sa rispondere a «a QUALE NEGOZIO è intestato lo sforzo», ma è cieco su
// «lo sforzo è andato al business o alla macchina stessa?». Ed è lì che sta la quota dominante:
// al 25/7 `consegne/tech` da solo pesa 263 file, più di tutte le cartelle di business messe insieme,
// e non entrava in nessun conteggio — quindi ogni guardiano dichiarava «allocazione sana».
//
// Le 5 perché di AR-114 arrivano qui: la contabilità dello sforzo conosceva solo la destinazione
// «negozio», e la meta-attività (migliorare il Pannello, il cervello, se stessa) non era intestabile
// a nessun negozio → restava strutturalmente fuori bilancio. La dimensione mancava, non il dato.
//
// Come si misura: si guardano i file toccati negli ULTIMI 7 GIORNI secondo GIT, non secondo l'mtime.
// L'mtime qui mente: su un clone fresco (il VPS ne fa) tutti i file risultano "di oggi" e la finestra
// non esisterebbe. Git è l'unica fonte che sa davvero quando una cosa è stata fatta.
const GIORNI_FINESTRA = 7;

// ─────────────────────────────────────────────────────────────────────────────
// AR-421 — UN MAGAZZINO NON È UN RITMO
// ─────────────────────────────────────────────────────────────────────────────
// Questo cancello deve tenere lo sforzo sul negozio che può incassare. La sua unica condizione era
// un RAPPORTO fra due magazzini: «un non-confermato ha ≥3 asset E un confermato ne ha 0». Ventisei
// cartelle vecchie intestate al negozio giusto lo tengono muto per sempre — anche se da settimane
// per quel negozio non nasce più niente. Il guardiano era modellato sull'incidente che l'ha fatto
// nascere (AR-006, il silo su Garetti: destinazione sbagliata) e non sull'obiettivo dichiarato
// (produrre per chi incassa), quindi copre benissimo il passato e lascia scoperto il presente.
//
// Gli asset intestati si contano ANCHE dentro una finestra, la stessa della quota di sforzo, e
// sempre per data GIT: l'mtime su un clone fresco direbbe che è tutto di oggi.
const GIORNI_FINESTRA_ASSET = Number(process.env.ALLOCAZIONE_GIORNI_ASSET || GIORNI_FINESTRA);

// Dove finisce lo sforzo. Prefisso di percorso → destinazione. Il primo che matcha vince.
// Chi non è in lista NON viene assegnato d'ufficio a una delle due: finisce in "non classificato"
// e il report lo dice. Assegnarlo a caso falserebbe la quota in un senso o nell'altro; dirlo no.
const DESTINAZIONE = [
  // — la macchina che lavora su se stessa —
  ["cervello/", "macchina"],
  ["pannello/", "macchina"],
  ["consegne/tech/", "macchina"],
  ["consegne/audit/", "macchina"],
  ["consegne/automazioni/", "macchina"],
  ["consegne/bonifica/", "macchina"],
  ["consegne/devops/", "macchina"],
  ["consegne/qa/", "macchina"],
  ["consegne/collaudo/", "macchina"],
  ["consegne/giro/", "macchina"],
  ["MyCity-Vault/90-Memoria-AI/auto-coscienza/", "macchina"],
  ["MyCity-Vault/07-Agenti/", "macchina"], // mansionari e organigramma: la macchina che si organizza
  // AR-340 — la casa VERA dei quaderni è questa, in radice: è dove scrivono chiusura-loop,
  // stampo-check, tasso-lezioni e bootstrap-quaderni. La mappa conosceva solo l'indirizzo vecchio
  // (MyCity-Vault/90-Memoria-AI/memoria-squadra/, oggi archiviato con AR-342) e i 124 quaderni
  // finivano fra i non classificati: due terzi della zona cieca erano il loop di apprendimento dei
  // 120 senior, cioè il lavoro della macchina su se stessa per definizione.
  ["memoria-squadra/", "macchina"],
  ["consegne/ad/", "macchina"], // note di regia dell'AD su se stessa
  // Il banco di lavoro di un lotto di riparazione: il brief comune alle corsie, la misura di
  // partenza, i frammenti che ogni corsia consegna, e gli attrezzi della ricucitura. È lavoro della
  // macchina su se stessa per definizione — la stessa ragione per cui ci sono `cervello/` e i
  // quaderni. Mapparlo qui NON è la scorciatoia vietata da AR-340: quella era mappare appunti di
  // scarto per far tacere il tetto. Questi file esistono per essere riletti (la ricucitura e il
  // controllo del secondo giro si rilanciano), e contarli come macchina ALZA la quota-macchina,
  // che è la direzione scomoda: dichiara più meta-lavoro, non meno.
  [".lotto-", "macchina"],
  [".claude/", "macchina"],
  [".cursor/", "macchina"],
  [".github/", "macchina"],
  // — il business: negozi, clienti, soldi, mercato —
  ["consegne/content/", "business"],
  ["consegne/design/", "business"],
  ["consegne/pr/", "business"],
  ["consegne/seo/", "business"],
  ["consegne/vendite/", "business"],
  ["consegne/marketing/", "business"],
  ["consegne/crm/", "business"],
  ["consegne/growth/", "business"],
  ["consegne/account-negozi/", "business"],
  ["consegne/customer-success/", "business"],
  ["consegne/onboarding/", "business"],
  ["consegne/supervisione/", "business"],
  ["consegne/operations/", "business"],
  ["consegne/intelligence/", "business"],
  ["consegne/analista/", "business"],
  ["consegne/finanza/", "business"],
  ["consegne/strategia/", "business"],
  ["consegne/relazioni-istituzionali/", "business"],
  ["consegne/trust-safety/", "business"],
  ["consegne/legale/", "business"],
  ["consegne/security/", "business"],
  ["consegne/marketplace/", "business"],
  ["consegne/video/", "business"],
  ["creativi/", "business"],
  // Il vault di Nicola: strategia, mercato, prodotto, soldi, piani. È il pensiero SULL'AZIENDA.
  ["MyCity-Vault/01-Strategia/", "business"],
  ["MyCity-Vault/02-Mercato/", "business"],
  ["MyCity-Vault/03-", "business"],
  ["MyCity-Vault/04-Prodotto-Ops/", "business"],
  ["MyCity-Vault/05-Soldi-Rischi/", "business"],
  ["MyCity-Vault/06-Piani/", "business"],
  // Il resto della memoria AI (STATO, DECISIONI, briefing, coda azioni): è il diario del lavoro
  // sull'azienda, non lavoro sulla macchina. Sta DOPO le regole macchina, che sono più specifiche.
  ["MyCity-Vault/90-Memoria-AI/", "business"],
  // AR-340 — il tetto è un cricchetto: quando la zona cieca cresce si MAPPA, non si alza il tetto.
  // Il 29/7 alle 01:5x il guardiano ha suonato per un file solo (53 contro 52) e ha fatto il suo
  // mestiere: invece di spostare il numero, ho guardato i 53 e mappato i gruppi che hanno una
  // destinazione ovvia. Quelli davvero ambigui restano fuori: `.obsidian/` (configurazione
  // dell'editor di Nicola), l'indice e il blueprint del vault, le regole creative, e due artefatti
  // finiti in `consegne/` per sbaglio, più `README.md` (una prova storica lo usa apposta come
  // esempio di ciò che resta fuori). Metterli da una parte a caso falserebbe la quota, che è
  // esattamente ciò che questo guardiano esiste per evitare.
  ["MyCity-Vault/_Archivio/", "business"], // strategia, mercato, metriche archiviate: pensiero sull'azienda
  ["consegne/_archivio-prospect/", "business"], // gli asset del silo Garetti, archiviati
  ["consegne/decisioni/", "business"], // fogli firma su lancio e prezzi
  ["consegne/builder-automazioni/", "macchina"], // inventario VPS e strumenti
  // 29/7 — il guardiano ha suonato di nuovo per UN file (14 contro 13) e la regola di AR-340 vale
  // anche stavolta: si mappa, non si alza il tetto. Il file era
  // `consegne/salute/2026-07-29-1238-claude.md`, cioè il referto della visita ai cinque organi vivi:
  // è la macchina che si controlla da sola, esattamente come l'inventario qui sopra — non lavoro
  // sull'azienda. La cartella intera, così il prossimo referto non fa risuonare il tetto.
  ["consegne/salute/", "macchina"],
  // 29/7, lotto 33 — il guardiano ha suonato una terza volta per UN file (14 contro 13), e per la
  // terza volta la risposta è mappare. Il file è `consegne/sicurezza/2026-07-29-permessi-senza-jolly.md`,
  // cioè l'elenco esplicito dei permessi che sostituisce il jolly di AR-206: è la macchina che
  // stringe i propri confini, non lavoro sull'azienda — stessa famiglia dell'inventario VPS e del
  // referto di salute qui sopra. La cartella intera, così il prossimo documento di sicurezza non
  // fa risuonare il tetto per un file.
  ["consegne/sicurezza/", "macchina"],
  // I manuali con cui la macchina si istruisce: sono la macchina che si organizza, come 07-Agenti/.
  ["CLAUDE.md", "macchina"],
  ["AGENTS.md", "macchina"],
  ["COMANDI.md", "macchina"],
  ["INIZIA-QUI.md", "macchina"],
  // `README.md` NO, di proposito: `allocazione-macchina.test.mjs` lo usa da sempre come l'esempio
  // canonico di «ciò che non è in lista non viene assegnato d'ufficio». Mapparlo per guadagnare un
  // punto sul tetto avrebbe spento quella prova — cioè avrei tolto una rete per far scendere un
  // numero. Il tetto si abbassa mappando ciò che è ovvio, non svuotando i test che danno fastidio.
  // L'impianto: hook, ignore, configurazione degli strumenti.
  [".githooks/", "macchina"],
  [".gitignore", "macchina"],
  [".gitattributes", "macchina"],
  [".mcp.json", "macchina"],
];

/** Destinazione di un percorso: "macchina" | "business" | null (non classificato). */
export function destinazioneDi(rel) {
  const p = String(rel || "");
  for (const [pref, dest] of DESTINAZIONE) if (p.startsWith(pref)) return dest;
  return null;
}

/**
 * Quota di sforzo per destinazione. Pura: prende la lista dei file toccati e conta.
 * Ritorna { macchina, business, non_classificato, totale, quota_macchina }.
 * quota_macchina è calcolata sui soli file CLASSIFICATI: un non-classificato non deve
 * far scendere la quota per finta (sarebbe un modo per nascondere il meta-lavoro).
 */
/**
 * AR-340 — il tetto dichiarato della ZONA CIECA, con la data.
 *
 * Misurato il 2026-07-29 in due passate, ed è la prima passata che dimostra che il cancello serve.
 * Prima: messa in mappa la casa vera dei quaderni e fatta passare la lettura dalla porta di
 * `percorsi-git.mjs` — da **202 a 52**. Poi un merge di `main` ha portato un file nuovo e il tetto
 * ha suonato per **uno solo** (53 contro 52). La risposta giusta a quel suono non è spostare il
 * numero: è guardare i 53 e mappare i gruppi che hanno una destinazione ovvia (l'archivio del vault,
 * gli asset del silo Garetti, i manuali con cui la macchina si istruisce, l'impianto). **Da 52 a 13.**
 *
 * I 13 che restano sono ambigui sul serio e stanno fuori apposta: `.obsidian/` (configurazione
 * dell'editor di Nicola), l'indice e il blueprint del vault, le tre regole creative, e due artefatti
 * finiti in `consegne/` per sbaglio. Metterli da una parte a caso falserebbe la quota — che è
 * esattamente ciò che questo guardiano esiste per evitare.
 *
 * Il tetto è un cricchetto: scende quando si mappa, non sale. E parte da dove siamo (quindi verde
 * oggi) perché un cancello che nasce rosso su decine di file viene spento entro la settimana —
 * mentre uno che nasce verde becca la prima cosa che sporca. Qui l'ha beccata dopo un'ora.
 */
export const TETTO_NON_CLASSIFICATI = 13;
export const TETTO_MISURATO_IL = "2026-07-29";

/**
 * La zona cieca è cresciuta oltre il tetto dichiarato?
 *
 * Pura, così una prova la esegue senza toccare git. Il senso: un guardiano non può lasciare crescere
 * in silenzio la parte di mondo che non riconosce — una mappa che invecchia è indistinguibile da una
 * mappa giusta finché nessuno la misura, ed è esattamente com'è passato inosservato che i quaderni
 * avessero cambiato casa.
 */
export function zonaCiecaOltreIlTetto(quota, tetto = TETTO_NON_CLASSIFICATI) {
  // AR-419 — su una quota cieca non si accusa: «zero non classificati» e «non ho contato niente»
  // hanno lo stesso aspetto solo se si guarda il numero invece della sua provenienza.
  if (quota?.cieca) return { oltre: false, quanti: null, tetto, eccesso: 0, cieca: true };
  const n = Number(quota?.non_classificato || 0);
  return { oltre: n > tetto, quanti: n, tetto, eccesso: Math.max(0, n - tetto), cieca: false };
}

/**
 * AR-419 — `null` significa «non ho potuto vedere i file toccati», e non è la stessa cosa di «non
 * ne è stato toccato nessuno». Un elenco vuoto darebbe quota 0/0 → `quota_macchina: null`, che a
 * valle si legge identico a una quota sana: la differenza va portata avanti come DATO, non lasciata
 * indovinare a chi stampa.
 */
export function quotaSforzo(fileToccati = []) {
  if (fileToccati == null) {
    return { macchina: null, business: null, non_classificato: null, totale: null, quota_macchina: null, cieca: true };
  }
  let macchina = 0, business = 0, non_classificato = 0;
  for (const f of fileToccati) {
    const d = destinazioneDi(f);
    if (d === "macchina") macchina++;
    else if (d === "business") business++;
    else non_classificato++;
  }
  const classificati = macchina + business;
  return {
    macchina,
    business,
    non_classificato,
    totale: fileToccati.length,
    quota_macchina: classificati ? macchina / classificati : null,
    cieca: false,
  };
}

/**
 * Il percorso esiste ancora nell'albero di lavoro?
 *
 * 29/7 — I FANTASMI. La zona cieca è salita a 17 contro un tetto di 13, e i quattro in più erano
 * `tmp_agent_files.txt`, `tmp_agent_refs.txt`, `tmp_claude_bold.txt`, `tmp_deferral_targets.txt`:
 * appunti temporanei di una sessione, committati per sbaglio e già CANCELLATI. Su disco non
 * esistono — comparivano solo perché `git log --name-only` elenca anche ciò che è nato e morto
 * dentro la finestra dei sette giorni.
 *
 * Mapparli sarebbe stato peggio che sbagliato: avrebbe legittimato il committare file di scarto.
 * Alzare il tetto è vietato (AR-340: si mappa, non si alza). Ma la verità è che qui non c'era
 * niente da mappare: un percorso che non esiste più non è «un'area di lavoro senza mappa», è
 * rumore. E finché contava, il tetto diventava rosso a seconda di quanti file di scarto qualcuno
 * avesse cancellato quella settimana — cioè un cancello che suona a caso, che è il modo più veloce
 * perché venga aggirato.
 *
 * Il metro dichiarato dal test è «se risalgono, la mappa è tornata vecchia»: un fantasma non dice
 * nulla sulla mappa, quindi non deve poter far suonare quel campanello.
 *
 * Il filtro sta QUI e non dentro `quotaSforzo` apposta: quella è pura e le prove la chiamano con
 * percorsi finti che su disco non esistono. Mettercelo dentro renderebbe la funzione dipendente dal
 * disco e farebbe sparire proprio i casi che i test costruiscono.
 */
function esisteAncora(percorso) {
  return existsSync(join(AD_ROOT, percorso));
}

/**
 * Toglie i fantasmi da un elenco di percorsi. PURA: il «questo esiste?» arriva da fuori, così una
 * prova la esegue su percorsi inventati senza toccare il disco — e senza dover creare e cancellare
 * file veri per riprodurre il caso.
 *
 * @param {string[]} percorsi
 * @param {(p: string) => boolean} esiste
 */
export function senzaFantasmi(percorsi = [], esiste = esisteAncora) {
  return percorsi.filter((p) => esiste(p));
}

/**
 * I file toccati da git negli ultimi N giorni, meno quelli che nel frattempo sono spariti.
 * Se git non risponde torna [] (il report lo dice).
 *
 * AR-340 — passa dalla porta di `percorsi-git.mjs`. Prima chiedeva l'elenco senza `-z`, e i 26
 * percorsi del vault con l'accento arrivavano riscritti in ottali: non corrispondendo a nessun
 * prefisso della mappa finivano tutti fra i «non classificati», cioè fuori dalla quota.
 */
/**
 * AR-419 — perché prima si chiede se la storia è intera.
 *
 * `--since=7 days ago` su un clone superficiale non fallisce: risponde. Ma il commit di innesto non
 * ha genitori, quindi git elenca TUTTO il suo albero come cambiato dentro la finestra. Misurato il
 * 29/7 su questo repo: 4521 percorsi in sette giorni, di cui 1999 dal solo innesto. La quota che ne
 * usciva non diceva «dove è andato lo sforzo questa settimana» ma «com'è fatto il magazzino» — e
 * siccome è il numero con cui si giudica se stiamo lavorando sulla macchina invece che sul
 * business, sbagliarlo in quel verso è il modo più elegante di darsi ragione da soli.
 *
 * Qui non si filtra l'innesto e si tira avanti: anche togliendolo resterebbe cieco su tutto ciò che
 * è più vecchio del taglio ma dentro la finestra. Quando la storia non è intera la quota NON SI
 * PRODUCE. `null` è la risposta onesta, e il chiamante la porta fino all'uscita 2.
 */
export function fileToccatiDaGit(giorni = GIORNI_FINESTRA, storia = STORIA) {
  if (!storia.intera) return null;
  try {
    const toccati = [...new Set(percorsiDaGit(["log", `--since=${giorni} days ago`, "--name-only", "--pretty=format:"], { cwd: AD_ROOT }))];
    return senzaFantasmi(toccati);
  } catch {
    return null;
  }
}

// Parole troppo generiche per essere un alias affidabile di un negozio (evita falsi match).
const STOPWORD_ALIAS = new Set([
  "antica", "salumeria", "casa", "bottega", "panificio", "forno", "pane", "macelleria",
  "gastronomia", "alimentari", "negozio", "azienda", "linda", "della", "delle", "dei",
  // "corso" è troppo generico: significa via/avenue E "nel corso di…" → falsi positivi su "Panetteria Del Corso"
  "corso",
]);

/** Legge un JSON del vault; se manca o è rotto torna null (il guardiano lo segnala, non crasha). */
function leggiJson(rel) {
  const p = join(AD_ROOT, rel);
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

/** Deriva gli alias di match per un'entità: il nome intero + le parole "proprie" (≥4 char, non stopword). */
function aliasDi(nome) {
  const alias = new Set([nome]);
  for (const w of nome.split(/\s+/)) {
    const pulita = w.replace(/[^\p{L}]/gu, "");
    if (pulita.length >= 4 && !STOPWORD_ALIAS.has(pulita.toLowerCase())) alias.add(pulita);
  }
  return [...alias];
}

/** Elenca ricorsivamente i file .md/.txt/.png/.svg sotto una cartella (relativi ad AD_ROOT). */
function fileRicorsivi(relDir) {
  const abs = join(AD_ROOT, relDir);
  if (!existsSync(abs)) return [];
  const out = [];
  const stack = [abs];
  while (stack.length) {
    const dir = stack.pop();
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const e of entries) {
      const p = join(dir, e.name);
      if (e.isDirectory()) stack.push(p);
      else if (e.isFile()) out.push(p);
    }
  }
  return out;
}

/**
 * AR-031: entità PRIMARIA di un file (attribuzione ESCLUSIVA — un file conta per UNA sola entità).
 * Prima l'attribuzione era per-menzione (`alias.some(...includes)`): un post di Pane Quotidiano che
 * cita "Garetti" in una nota veniva contato ANCHE come asset di Garetti → conteggio gonfiato e falso
 * allarme-silo. Ora: ① se c'è il frontmatter `negozio:` vince quello; ② altrimenti l'entità con più
 * occorrenze (il nome intero pesa di più della singola parola); a parità → il negozio confermato.
 * Torna il nome dell'entità, o null se nessuna la intesta davvero.
 */
export function entitaPrimaria(blob, entitaNegozi) {
  const aliasCache = entitaNegozi.map((ent) => ({ ent, aliases: aliasDi(ent.nome).map((a) => a.toLowerCase()) }));

  // ① frontmatter `negozio:` — la fonte più forte di intestazione
  const fm = blob.match(/^\s*negozio:\s*(.+)$/m);
  if (fm) {
    const val = fm[1];
    let best = null, bestLen = 0;
    for (const { ent, aliases } of aliasCache) {
      for (const a of aliases) {
        if (val.includes(a) && a.length > bestLen) { best = ent; bestLen = a.length; }
      }
    }
    if (best) return best.nome;
  }

  // ② altrimenti: l'entità più citata nel blob (nome intero ×3, parola singola ×1); parità → confermato
  let best = null, bestScore = 0;
  for (const { ent, aliases } of aliasCache) {
    let score = 0;
    for (const a of aliases) {
      const occ = blob.split(a).length - 1;
      score += occ * (a.includes(" ") ? 3 : 1);
    }
    if (score > bestScore) { best = ent; bestScore = score; }
    else if (score === bestScore && score > 0 && best && ent.stato === "confermato" && best.stato !== "confermato") { best = ent; }
  }
  return bestScore > 0 ? best.nome : null;
}

/**
 * Conta quanti file pesanti "intestano" ciascuna entità — attribuzione ESCLUSIVA (un file → una entità).
 *
 * AR-421 — due numeri, non uno: `n` è il MAGAZZINO (quanti asset esistono in tutto) e `n_recenti` è
 * il RITMO (quanti ne sono nati dentro la finestra, per data GIT e non per mtime — su un clone
 * fresco l'mtime dice che è tutto di oggi). `recentiRel` è l'insieme dei percorsi toccati nella
 * finestra: se è `null` la storia di git non è intera e il ritmo NON si produce (`n_recenti: null`),
 * perché uno zero inventato qui direbbe «non stiamo producendo» quando la verità è «non lo so».
 */
function contaAssetPerEntita(entitaNegozi, recentiRel = null) {
  // Pre-carica i file pesanti una sola volta (path + testo per i file leggibili).
  const files = [];
  for (const root of ROOT_PESANTI) {
    for (const abs of fileRicorsivi(root)) {
      const rel = abs.slice(AD_ROOT.length + 1);
      let testo = "";
      if (/\.(md|txt|json|html|csv)$/i.test(rel) && statSync(abs).size < 1_000_000) {
        try {
          testo = readFileSync(abs, "utf8");
        } catch {
          testo = "";
        }
      }
      files.push({ rel, blob: (rel + "\n" + testo).toLowerCase() });
    }
  }

  const recenti = recentiRel instanceof Set ? recentiRel : Array.isArray(recentiRel) ? new Set(recentiRel) : null;
  const conteggio = {};
  for (const ent of entitaNegozi)
    conteggio[ent.nome] = { stato: ent.stato, n: 0, n_recenti: recenti ? 0 : null, esempi: [], esempi_recenti: [] };
  for (const f of files) {
    const nome = entitaPrimaria(f.blob, entitaNegozi);
    if (!nome || !conteggio[nome]) continue; // file non intestato a nessun negozio presidiato → non conta
    if (recenti && recenti.has(f.rel)) {
      conteggio[nome].n_recenti++;
      if (conteggio[nome].esempi_recenti.length < 4) conteggio[nome].esempi_recenti.push(f.rel);
    }
    conteggio[nome].n++;
    if (conteggio[nome].esempi.length < 4) conteggio[nome].esempi.push(f.rel);
  }
  return { conteggio, totaleFile: files.length };
}

async function main() {
  const quando = nowPiacenza();
  const registro = leggiJson("MyCity-Vault/90-Memoria-AI/auto-coscienza/registro-realta.json");

  if (!registro || !Array.isArray(registro.entita)) {
    const msg = "registro-realta.json mancante o illeggibile: impossibile misurare l'allocazione.";
    await stampSegnale("allocazione", "errore", `${msg} · ${quando}`);
    if (JSON_MODE) console.log(JSON.stringify({ esito: "errore", quando, messaggio: msg }, null, 2));
    else console.error(`\n⚖️  ALLOCAZIONE — ${quando}\n\n❌ ${msg}`);
    process.exit(1);
  }

  // Solo i negozi VERI candidabili a produzione. Uno scartato non è né un target valido né un
  // prospect: non deve entrare nel conteggio dell'allocazione.
  //
  // AR-577 — questa riga era il danno, non la difesa. Fino al 13/8 diceva `["demo", "scartato"]`:
  // conosceva lo stato inventato «demo» (Casa Linda) ma non «escluso», e i SEI ristoranti che Nicola
  // aveva escluso il 18/7 («i ristoranti non sono il nostro target») rientravano nel conteggio dei
  // negozi candidabili a ogni giro. Adesso il registro non può più portare quei valori — lo ferma
  // `valida-contratti.mjs` — e i sette sono migrati a «scartato».
  // I due nomi vecchi restano qui apposta: se una copia del registro precedente alla migrazione
  // tornasse da un backup o da un merge, non deve rientrare in silenzio nel conteggio prima che il
  // contratto se ne accorga. Costano una riga e coprono la finestra fra le due difese.
  const ESCLUSI = new Set(["scartato", "demo", "escluso"]);
  const negozi = registro.entita.filter((e) => e.tipo === "negozio" && !ESCLUSI.has(e.stato));
  // AR-421 — la finestra si chiede UNA volta e serve a due cose: la quota di sforzo (AR-114) e il
  // ritmo di produzione per negozio. `null` = storia di git troncata: nessuno dei due si produce.
  const toccati = fileToccatiDaGit(GIORNI_FINESTRA_ASSET);
  const { conteggio, totaleFile } = contaAssetPerEntita(negozi, toccati ? new Set(toccati) : null);

  const confermati = negozi.filter((e) => e.stato === "confermato");
  const nonConfermati = negozi.filter((e) => e.stato !== "confermato");

  // Violazione 1: entità NON confermata con troppi asset pesanti intestati (pacchetto completo su un prospect).
  const sovra = nonConfermati
    .map((e) => ({ nome: e.nome, stato: e.stato, n: conteggio[e.nome]?.n || 0, esempi: conteggio[e.nome]?.esempi || [] }))
    .filter((x) => x.n >= SOGLIA_PESANTI);

  // Violazione 2 (silo): esiste almeno un negozio CONFERMATO a 0 asset mentre un NON-confermato ne ha ≥ soglia.
  const confermatiAZero = confermati
    .map((e) => ({ nome: e.nome, n: conteggio[e.nome]?.n || 0 }))
    .filter((x) => x.n === 0);
  const siloAttivo = sovra.length > 0 && confermatiAZero.length > 0;

  // ── Violazione 3 (AR-421): SILENZIO PRODUTTIVO su un negozio confermato ────────────────────
  // La condizione che mancava. Le prime due si accendono solo se lo sforzo è finito sul negozio
  // SBAGLIATO; nessuna si accende se lo sforzo non c'è per NESSUNO — che è lo stato di oggi, e il
  // più costoso: il magazzino resta pieno di roba vecchia e il cancello tace.
  // Si misura SEMPRE; diventa violazione solo con ALLOCAZIONE_GATE_PRODUZIONE=1, per la stessa
  // ragione dichiarata sopra per il gate macchina: fino alla fine della fase tecnica suonerebbe a
  // ogni giro contraddicendo una decisione presa, e un allarme che suona sempre si impara a spegnere.
  const GATE_PRODUZIONE = process.env.ALLOCAZIONE_GATE_PRODUZIONE === "1";
  const silenzio = confermati.map((e) => {
    const c = conteggio[e.nome] || {};
    const r = ritmoVsMagazzino({ magazzino: c.n ?? 0, recenti: c.n_recenti, giorni: GIORNI_FINESTRA_ASSET });
    return { nome: e.nome, magazzino: r.magazzino, recenti: r.recenti, esito: r.esito, motivo: r.motivo };
  });
  const muti = silenzio.filter((s) => s.esito === FINESTRA.VUOTA);
  const ritmoCieco = silenzio.some((s) => s.esito === FINESTRA.ASSENTE);
  const violazioneProduzione = GATE_PRODUZIONE && muti.length > 0;

  // AR-114 — la seconda dimensione. Si misura SEMPRE; diventa una violazione solo se Nicola accende
  // il cancello (ALLOCAZIONE_GATE_MACCHINA=1). Non è timidezza: al 25/7 Nicola ha DECISO che fino al
  // 24/8-1/9 si perfezionano Pannello, AD, worker e marketplace, e solo dopo si torna sul business
  // (registro-fatti → ripresa.lavoro-operativo). Un guardiano che fallisse ogni giro contraddicendo
  // una decisione presa diventerebbe rumore, e il rumore si impara a ignorare: sarebbe il modo più
  // sicuro per rendere inutile proprio la misura che mancava. Quando la fase tecnica finisce, il
  // cancello si accende con una riga di env e il numero è già lì, con la sua storia.
  const GATE_MACCHINA = process.env.ALLOCAZIONE_GATE_MACCHINA === "1";
  const SOGLIA_MACCHINA = Number(process.env.ALLOCAZIONE_SOGLIA_MACCHINA || 0.7);
  const quota = quotaSforzo(toccati);
  const quotaOltre = !quota.cieca && quota.quota_macchina != null && quota.quota_macchina > SOGLIA_MACCHINA;
  const violazioneMacchina = GATE_MACCHINA && quotaOltre;

  const cieca = zonaCiecaOltreIlTetto(quota);
  const violazioni =
    sovra.length + (siloAttivo ? 1 : 0) + (violazioneMacchina ? 1 : 0) + (cieca.oltre ? 1 : 0) + (violazioneProduzione ? 1 : 0);

  // AR-419 — la cecità sulla quota non spegne le altre due dimensioni (il silo e i confermati a
  // zero si misurano sul disco, non sulla storia): quelle restano valide e il loro verdetto vale.
  // Ma se il cancello macchina è ACCESO, allora la quota è ciò che decide, e un cancello che non
  // può misurare deve dire 2 — non 0. Tenere il rosso solo dove la misura serve davvero è ciò che
  // impedisce a questo guardiano di diventare permanentemente cieco in ogni sessione cloud, e
  // quindi di essere ignorato: un cancello sempre rosso viene aggirato al secondo giro.
  const cecitaBloccante = quota.cieca && GATE_MACCHINA;
  const esito = cecitaBloccante ? "cieco" : violazioni > 0 ? "silo" : "sano";
  const codiceUscita = cecitaBloccante ? 2 : violazioni > 0 ? 1 : 0;

  await stampSegnale(
    "allocazione",
    cecitaBloccante ? "errore" : violazioni > 0 ? "errore" : "ok",
    cecitaBloccante
      ? `quota sforzo NON misurabile — ${STORIA.motivo} · ${quando}`
      : violazioni > 0
        ? `silo: ${sovra.map((s) => `${s.nome} (${s.n} asset, ${s.stato})`).join("; ")} · confermati a 0: ${confermatiAZero.map((c) => c.nome).join(", ") || "nessuno"} · ${quando}`
        : `allocazione sana su ${totaleFile} asset pesanti${quota.cieca ? " (quota sforzo non misurata: storia git troncata)" : ""} · ${quando}`
  );

  if (JSON_MODE) {
    console.log(JSON.stringify({ esito, quando, totaleFile, conteggio, sovra, confermatiAZero, siloAttivo, produzione: { giorni: GIORNI_FINESTRA_ASSET, gate_acceso: GATE_PRODUZIONE, per_negozio: silenzio, muti: muti.map((m) => m.nome), ritmo_cieco: ritmoCieco, violazione: violazioneProduzione }, sforzo: { ...quota, giorni: GIORNI_FINESTRA, soglia: SOGLIA_MACCHINA, gate_acceso: GATE_MACCHINA, oltre_soglia: quotaOltre, tetto_non_classificati: cieca.tetto, tetto_misurato_il: TETTO_MISURATO_IL, zona_cieca_oltre: cieca.oltre, storia_intera: STORIA.intera, motivo_cecita: quota.cieca ? STORIA.motivo : null } }, null, 2));
    process.exit(codiceUscita);
  }

  console.log(`\n⚖️  ALLOCAZIONE DELLO SFORZO — ${quando}\n`);
  console.log(`Asset pesanti scansionati (${ROOT_PESANTI.join(", ")}): ${totaleFile}\n`);
  console.log(`Per negozio (magazzino · ritmo negli ultimi ${GIORNI_FINESTRA_ASSET} giorni · stato):`);
  for (const e of negozi) {
    const c = conteggio[e.nome] || { n: 0, n_recenti: null, stato: e.stato };
    const bandiera = e.stato === "confermato" ? "✅" : "🟨";
    // AR-421: due numeri affiancati. Il primo non invecchia mai, il secondo sì — ed è il secondo
    // che dice se per quel negozio stiamo ancora lavorando.
    const ritmo = c.n_recenti == null ? "ritmo non misurabile (storia git troncata)" : `${c.n_recenti} nuovi`;
    console.log(`  ${bandiera} ${e.nome} — ${c.n} asset in magazzino · ${ritmo} · ${e.stato}`);
  }
  if (muti.length) {
    console.log(`\n🔇 SILENZIO PRODUTTIVO (AR-421) — negozi CONFERMATI senza un asset nuovo negli ultimi ${GIORNI_FINESTRA_ASSET} giorni:`);
    for (const m of muti) console.log(`  • ${m.nome}: ${m.motivo}`);
    console.log(
      GATE_PRODUZIONE
        ? "  ❌ cancello produzione ACCESO → violazione."
        : "  (cancello produzione spento durante la fase tecnica: si misura e si dichiara, non blocca. Accendilo con ALLOCAZIONE_GATE_PRODUZIONE=1.)"
    );
  }

  // AR-114: la quota macchina-vs-business, che prima non compariva da nessuna parte.
  const pc = (x) => (x == null ? "—" : `${Math.round(x * 100)}%`);
  console.log(`\nDove è andato lo sforzo (ultimi ${GIORNI_FINESTRA} giorni, file toccati secondo git):`);
  if (quota.cieca) {
    // AR-419: qui prima comparivano tre numeri. Nascevano da una storia troncata e descrivevano il
    // magazzino: meglio una riga che dice «non lo so» di tre cifre che sembrano una misura.
    console.log(`  ⚪ NON MISURATA — ${STORIA.motivo}.`);
    console.log(`     Per misurarla serve la storia intera: git fetch --unshallow (poi rilancia).`);
    console.log(
      GATE_MACCHINA
        ? `     ❌ il cancello macchina è ACCESO e senza questo numero non può decidere → uscita 2 (cieco).`
        : `     cancello macchina SPENTO: nessuna decisione dipendeva da questo numero adesso.`
    );
  } else {
  console.log(`  🔧 macchina (cervello, Pannello, tech, audit…): ${quota.macchina}`);
  console.log(`  🏪 business (negozi, clienti, contenuti, soldi): ${quota.business}`);
  if (quota.non_classificato) {
    console.log(`  ❔ non classificato: ${quota.non_classificato} su un tetto di ${cieca.tetto} (misurato il ${TETTO_MISURATO_IL})`);
    if (cieca.oltre) {
      console.log(`     ❌ la zona cieca è cresciuta di ${cieca.eccesso}: mappa i percorsi nuovi in DESTINAZIONE o abbassa il tetto con motivo.`);
    } else {
      console.log(`     (il tetto è un cricchetto: scende quando mappi altri percorsi, non sale)`);
    }
  }
  console.log(`  → quota macchina: ${pc(quota.quota_macchina)} (soglia ${pc(SOGLIA_MACCHINA)})`);
  if (!GATE_MACCHINA) {
    console.log(`     cancello SPENTO: fase tecnica dichiarata da Nicola fino al 24/8-1/9 (registro-fatti → ripresa.lavoro-operativo).`);
    console.log(`     Per accenderlo quando la fase finisce: ALLOCAZIONE_GATE_MACCHINA=1`);
  } else if (quotaOltre) {
    console.log(`     ❌ oltre soglia col cancello ACCESO → violazione.`);
  }
  }

  if (violazioni === 0) {
    console.log(`\n✅ Allocazione sana: nessun pacchetto pesante concentrato su un prospect non confermato.`);
  } else {
    console.log(`\n❌ SILO DI ALLOCAZIONE (AR-006) — lo sforzo pesante è sull'entità sbagliata:`);
    for (const s of sovra) {
      console.log(`  • ${s.nome} (${s.stato}) ha ${s.n} asset pesanti — dovrebbero essere solo bozze-template neutre finché non è 'confermato'.`);
      for (const ex of s.esempi) console.log(`      – ${ex}`);
    }
    if (siloAttivo) {
      console.log(`  • Intanto questi negozi CONFERMATI (payout-ready) sono a 0 asset: ${confermatiAZero.map((c) => c.nome).join(", ")}.`);
    }
    console.log(`\n→ Ripunta la produzione pesante sui negozi 'confermato'. Sui 'scelta_ragionata' solo bozze-template.`);
    console.log(`  Regola (CLAUDE.md, cancello di allocazione AR-006): asset pesanti SOLO su entità confermata nel registro-realtà.`);
  }

  process.exit(codiceUscita);
}

// Esegui main() solo se lanciato come script (non quando importato da un test).
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error("ERRORE allocazione-check:", e?.message || e);
    process.exit(1);
  });
}
