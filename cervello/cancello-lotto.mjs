#!/usr/bin/env node
// 🚧 CANCELLO DI USCITA DI UN LOTTO — un comando solo che dice se il lavoro si può consegnare.
//
// PERCHÉ ESISTE. `cervello/come-riparo.md` chiudeva con cinque comandi da lanciare a mano. Cinque
// comandi da ricordare sono cinque occasioni di dimenticarne uno — ed è la stessa malattia che
// questo cantiere cura da ventotto lotti: una regola che funziona solo se qualcuno se la ricorda.
// Qui i controlli diventano UNO, e i due errori più costosi del cantiere (la prova con un OR
// dentro, la prova condivisa fra più difetti) smettono di essere avvertimenti scritti in fondo a un
// file e diventano un exit code.
//
// 🟢 Sola lettura: esegue guardiani e legge il cantiere. Non scrive niente, non tocca git.
//
// Uso:
//   node cervello/cancello-lotto.mjs             # tutti i controlli + verdetto
//   node cervello/cancello-lotto.mjs --veloce    # salta il typecheck del Pannello (~40s)
//   node cervello/cancello-lotto.mjs --json      # per gli script
//   node cervello/cancello-lotto.mjs --solo-prove  # solo i controlli sulle prove (istantaneo)
//
// Uscita (contratto guardiani, AR-322):
//   0 = si può consegnare
//   1 = violazione: qualcosa non torna, il lotto NON si consegna
//   2 = non ho potuto misurare (cantiere illeggibile, ambiente incompleto) → cieco, non «verde»

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza } from "./git-github.mjs";
import { comandoAmmesso, MOTIVO_COMANDO_NON_AMMESSO } from "./forma-prova.mjs";
import { storiaDelRepo } from "./storia-git.mjs";
import { contaProveDeboli } from "./chiusura-dichiarata.mjs";
import { verdettoConTetto, testDelLotto, idSospetti, testRossi, perimetroDichiarato } from "./tetto-guardiano.mjs";
import { percorsiDaGit } from "./percorsi-git.mjs";
// 📏 Il contratto della prova (contratto-prova.mjs): quanto vale una prova lo dice UN posto solo.
import { debitoDiMutazione } from "./contratto-prova.mjs";

const JSON_MODE = process.argv.includes("--json");
const VELOCE = process.argv.includes("--veloce");
const SOLO_PROVE = process.argv.includes("--solo-prove");
const AGGIORNA_TETTI = process.argv.includes("--aggiorna-tetti");

const CANTIERE = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json");
const TETTI = join(AD_ROOT, "cervello/tetti-lotto.json");
const MUTANTI = join(AD_ROOT, "cervello/mutanti.json");

// ─────────────────────────────────────────────────────────────────────────────
// Debito ereditato vs regressione del lotto — la differenza che rende usabile il cancello
//
// Alla prima accensione (29/7) il controllo `prova-con-or` ha trovato 23 difetti aperti che se lo
// portavano dietro da radiografie vecchie. Un cancello che fallisce su quel debito bloccherebbe
// OGNI lotto finché non lo si ripulisce tutto — e un cancello sempre rosso viene aggirato al
// secondo giro, che è peggio di non averlo.
//
// Quindi due misure diverse:
//   · il DEBITO storico ha un TETTO che scende e non si alza mai (stessa forma di malattie.json):
//     aggiungerne una è un errore, portarne via è il lavoro.
//   · ciò che il LOTTO TOCCA passa dal blocco duro, sempre: una prova nuova con un OR dentro non
//     entra, nemmeno se il totale resta sotto il tetto.
// ─────────────────────────────────────────────────────────────────────────────

const TETTI_DEFAULT = { prova_con_or: 0, mutazione_mancante: 0 };

function leggiTetti() {
  if (!existsSync(TETTI)) return { ...TETTI_DEFAULT, _mancante: true };
  try {
    return { ...TETTI_DEFAULT, ...JSON.parse(readFileSync(TETTI, "utf8")) };
  } catch {
    return { ...TETTI_DEFAULT, _illeggibile: true };
  }
}

/** Gli id dei difetti la cui `verifica` è cambiata rispetto al ramo pubblicato: quelli del lotto. */
export function difettiToccati(cantiereOra, cantierePrima) {
  if (!cantierePrima) return null; // niente confronto possibile → cieco su questo controllo
  const prima = new Map((cantierePrima.difetti || []).map((d) => [d.id, JSON.stringify(d.verifica || null)]));
  const toccati = [];
  for (const d of cantiereOra.difetti || []) {
    const ora = JSON.stringify(d.verifica || null);
    if (!prima.has(d.id) || prima.get(d.id) !== ora) toccati.push(d.id);
  }
  return toccati;
}

/**
 * AR-473 — PERCHÉ LA PROVA-CHE-LE-PROVE-PROVINO NON HA GIRATO, o `null` se ha girato.
 *
 * Il passo delle mutazioni è il più prezioso del metodo: è l'unico che misura se gli altri servono
 * a qualcosa. Ed era ON/OFF a seconda di QUANDO lo si lanciava: su un clone superficiale, dopo il
 * commit, «i pezzi già committati non risultano toccati» → zero difetti toccati → il passo spariva
 * dall'elenco, e il verdetto finale restava «✅ SI PUÒ CONSEGNARE» senza dire che mancava.
 *
 * La riga che conta è la quarta: il cantiere è cambiato — questo lotto lavora sui difetti — ma il
 * confronto non ne vede nessuno toccato. Non è «non c'era niente da provare»: è «non ho capito cosa
 * c'era da provare», e sono due cose diverse.
 *
 * Pura: riceve ciò che si sa già e non chiede niente a git, così una prova può metterla nei quattro
 * stati senza costruire quattro repo.
 *
 * @param {{mutantiLetti: boolean, toccati: string[]|null, quanteMutazioni: number, cantiereCambiato: boolean}} p
 * @returns {string|null} il motivo da dichiarare come ⚪, oppure null.
 */
export function mutazioniNonGirate({ mutantiLetti = true, toccati = null, quanteMutazioni = 0, cantiereCambiato = false } = {}) {
  if (quanteMutazioni > 0) return null; // ha girato: niente da dichiarare
  if (!mutantiLetti) return "la prova che le prove provino non ha girato: mutanti.json non è leggibile";
  if (toccati === null) {
    return "la prova che le prove provino non ha girato: non so quali difetti tocca questo lotto (nessun ramo pubblicato con cui confrontarmi)";
  }
  if (toccati.length === 0 && cantiereCambiato) {
    return "la prova che le prove provino non ha girato: il cantiere è cambiato ma il confronto non vede nessun difetto toccato (clone superficiale?)";
  }
  return null; // il lotto non lavora su difetti: non c'è nessuna mutazione da rompere, ed è vero
}

/**
 * Gli id che in questo lotto sono NATI: presenti adesso, assenti dal ramo pubblicato.
 *
 * Diverso da `difettiToccati`, che include anche le schede vecchie la cui prova è cambiata. Per
 * l'asticella serve la distinzione: a una scheda vecchia si può migliorare la prova a piccoli passi,
 * a una che nasce adesso si chiede la forma giusta subito.
 */
export function difettiNati(cantiereOra, cantierePrima) {
  if (!cantierePrima) return null; // niente confronto → cieco, e cieco non accusa
  const prima = new Set((cantierePrima.difetti || []).map((d) => d?.id));
  return (cantiereOra.difetti || []).map((d) => d?.id).filter((id) => id && !prima.has(id));
}

// ─────────────────────────────────────────────────────────────────────────────
// I controlli PURI sulle prove — la parte che nessun altro guardiano fa
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Una prova con un OR dentro chiude il difetto quando UNO QUALSIASI dei pezzi è a posto.
 *
 * Il caso che ha rotto (28/7, AR-178): la prova era `"VOLANO_VINCOLO|_tasso_rc|_sonda_rc"`, di tre
 * guardiani ne è stato cablato uno, il pattern ha fatto centro sulla metà riparata e il difetto si
 * è chiuso con l'altra metà ancora rotta e viva. È stata una chiusura falsa, scoperta per caso
 * trenta secondi dopo. Da qui in poi la scopre questo.
 */
/**
 * Due difetti DIVERSI con lo stesso id.
 *
 * Non è teoria: è successo il 30/7. Due sessioni aperte insieme hanno registrato un difetto nuovo
 * ciascuna prendendo «il prossimo numero libero» dalla copia del cantiere che avevano in mano —
 * `AR-444` per entrambe, uno «un difetto dichiarato aperto si richiude da solo» (chiuso), l'altro
 * «tredici test scrivono nella memoria vera» (aperto). Git non lo vede: sono righe diverse dello
 * stesso array, l'unione riesce senza conflitto.
 *
 * Il danno arriva dopo, ed è silenzioso: `auto-fix` cerca «il difetto AR-444» e ne trova due,
 * `prove-condivise` conta un id che compare due volte, una chiusura ne chiude uno a caso. Tutto il
 * cantiere è indicizzato per id — un id doppio non è un fastidio, è la rottura dell'indice.
 */
export function idDoppi(difetti = []) {
  const conta = new Map();
  for (const d of difetti) {
    if (!d?.id) continue;
    if (!conta.has(d.id)) conta.set(d.id, []);
    conta.get(d.id).push(d.titolo || "(senza titolo)");
  }
  return [...conta.entries()]
    .filter(([, titoli]) => titoli.length > 1)
    .map(([id, titoli]) => ({ id, quanti: titoli.length, titoli }));
}

/**
 * L'ASTICELLA (AR-564, approvata da Nicola il 10/8: «ok asticella»).
 *
 * Un difetto grave o bloccante che NASCE adesso deve portare una prova che GIRA — un comando —
 * non una parola da cercare in un file.
 *
 * Il conto che ha convinto: 193 difetti su 552 avevano per prova un file+pattern. Il caso vero è
 * AR-128, «non esiste nessun sensore per le contestazioni carta», la cui prova era che la parola
 * «chargeback» comparisse in un documento: scriverla bastava a chiudere il difetto, e il sensore
 * non c'era comunque. Una ricerca di parole non può fallire nel modo in cui fallisce la realtà —
 * per questo gli errori li trovava Nicola e non la macchina.
 *
 * Perché SOLO i nuovi, e solo grave/bloccante:
 *   · sui 193 ereditati c'è già `prova-debole`, un tetto che scende e non risale. Vietarli tutti
 *     adesso congelerebbe il cantiere, e un cancello sempre rosso viene aggirato al secondo giro
 *     (è la lezione scritta in cima a questo file, e vale anche qui).
 *   · sui `minore` la prova a pattern resta ammessa: il costo di scrivere un comando non lo vale.
 *
 * Le tre uscite oneste restano aperte: una prova a comando, oppure `tipo: "umano"` dichiarato
 * (nessun guardiano potrà chiuderlo, e si vede), oppure il difetto non nasce grave.
 *
 * @param {object[]} difetti tutte le schede del cantiere di adesso
 * @param {string[]|null} nati gli id NATI in questo lotto (assenti dal ramo pubblicato); null = cieco
 */
export function proveDeboliNate(difetti = [], nati = null) {
  if (!Array.isArray(nati)) return []; // non so chi è nato adesso → non accuso nessuno
  const grave = new Set(["grave", "bloccante", "critica", "alta", "alto"]);
  const dentro = new Set(nati);
  return difetti
    .filter((d) => d && dentro.has(d.id) && grave.has(String(d.gravita || "").toLowerCase()))
    .filter((d) => {
      const v = d.verifica;
      if (!v || typeof v !== "object") return true; // nessuna prova: è la forma più debole di tutte
      if (v.tipo === "umano") return false; // dichiarata umana: onesto, si vede, passa
      if (typeof v.comando === "string" && v.comando.trim()) return false; // gira: passa
      return true; // resta file+pattern su una scheda grave nata adesso
    })
    .map((d) => ({
      id: d.id,
      gravita: d.gravita,
      forma: d.verifica?.file ? `${d.verifica.file} ~ /${d.verifica.pattern}/` : "nessuna prova",
    }));
}

export function provaConOr(difetto) {
  const p = difetto?.verifica?.pattern;
  if (typeof p !== "string") return false;
  // Un `|` dentro una classe di caratteri [..] o scappato \| non è un'alternativa fra fix diversi.
  const senzaClassi = p.replace(/\[[^\]]*\]/g, "").replace(/\\\|/g, "");
  return senzaClassi.includes("|");
}

/**
 * Difetti che condividono lo stesso comando di prova senza che il test parli di ciascuno.
 *
 * Il caso che ha rotto (lotto 11): lo stesso `errore-ingoiato.test.mjs` è stato dato a cinque
 * difetti. Il test passava, ma AR-254 non era riparato — il suo fix gira DOPO la lettura, e la
 * lettura falliva già prima. Cinque difetti, una prova: si chiudono tutti e cinque anche se uno non
 * è stato toccato.
 *
 * Regola: un test condiviso va benissimo come FILE, ma dentro deve esserci almeno un caso che
 * parla solo di quel difetto — e il modo più semplice di dimostrarlo è che il file ne nomini l'id.
 */
export function proveCondiviseCieche(difetti, leggi) {
  const perComando = new Map();
  for (const d of difetti) {
    const c = d?.verifica?.comando;
    if (typeof c !== "string" || !c.trim()) continue;
    if (!perComando.has(c)) perComando.set(c, []);
    perComando.get(c).push(d.id);
  }
  const problemi = [];
  for (const [comando, ids] of perComando) {
    if (ids.length < 2) continue;
    const file = fileDelComando(comando);
    const testo = file ? leggi(file) : null;
    if (testo === null) {
      problemi.push({ comando, ids, motivo: "il file del test non è leggibile: non posso dire se copre ogni difetto" });
      continue;
    }
    const muti = ids.filter((id) => !testo.includes(id));
    if (muti.length) {
      problemi.push({
        comando,
        ids,
        muti,
        motivo: `il test è condiviso da ${ids.length} difetti ma non nomina ${muti.join(", ")}: chiuderebbe anche quelli mai toccati`,
      });
    }
  }
  return problemi;
}

/**
 * Estrae il path del file da un comando tipo `node cervello/test/x.test.mjs --flag`.
 *
 * ⚠️ La regola «il primo token che sembra un file» era a sua volta un perimetro DEDOTTO dalla forma
 * dei comandi esistenti (lotto 33). Appena un comando ha portato un caricatore —
 * `node --import ./cervello/test/hook-ts.mjs --test cervello/test/pannello-serratura.test.mjs` —
 * l'estrattore ha restituito il RISOLUTORE invece del test, e il cancello ha accusato una prova
 * condivisa di non nominare i suoi difetti mentre li nominava benissimo. Il modo di sbagliare è
 * quello brutto: legge il file sbagliato e ne trae una conclusione con la stessa sicurezza.
 *
 * Adesso si saltano le opzioni E il valore di quelle che ne prendono uno: resta il file da eseguire.
 */
const FLAG_CON_VALORE = new Set(["--import", "--require", "-r", "--loader", "--experimental-loader", "--env-file"]);

export function fileDelComando(comando) {
  const pezzi = String(comando || "").trim().split(/\s+/);
  for (let i = 0; i < pezzi.length; i++) {
    const p = pezzi[i];
    if (FLAG_CON_VALORE.has(p)) {
      i++; // il prossimo token è il suo valore, non il programma da eseguire
      continue;
    }
    if (p.startsWith("-")) continue; // `--test`, `--test-reporter=tap`, …
    if (/\.(mjs|mts|ts|js|sh|bats)$/.test(p)) return p;
  }
  return null;
}

/** Gli id nominati da una voce di `mutanti.json`: il campo `difetto` può accorparne più d'uno («AR-239+AR-264»). */
export function idDellaMutazione(m) {
  return String(m?.difetto || "").match(/AR-\d+/g) || [];
}

/**
 * Difetti con una prova che ESEGUE ma senza una mutazione che quella prova la rompa.
 *
 * Perché è la porta più importante rimasta aperta: il cancello pretende già che una prova condivisa
 * NOMINI ogni difetto che copre — ma per soddisfarlo basta scrivere l'id in un commento. La difesa
 * vera è `non-vacuita.mjs`, che rompe il fix apposta e pretende il rosso; e nessuno controllava che
 * ogni difetto toccato dal lotto avesse la sua voce in `mutanti.json`. Cioè: il lotto che predica di
 * chiudere le porte ne lasciava aperta una sua. Da qui in poi la chiude questo.
 *
 * Due modi di essere scoperti, stessa gravità:
 *   · nessuna voce che nomini il difetto → la sua prova non è mai stata rotta apposta;
 *   · una voce che lo nomina ma il cui `cerca` non sta più nel file → una mutazione fantasma:
 *     nomina il difetto e non lo può rompere. È lo stesso inganno di un id scritto in un commento,
 *     spostato di un file.
 *
 * Le prove a `pattern` restano fuori: quelle le governa `prova-con-or` e il suo tetto. Qui si
 * guardano solo i difetti che hanno già una prova comportamentale — gli unici che una mutazione
 * possa rendere rossi.
 */
export function mutazioniMancanti(difetti, mutanti, leggi) {
  const perId = new Map();
  for (const m of mutanti) {
    for (const id of idDellaMutazione(m)) {
      if (!perId.has(id)) perId.set(id, []);
      perId.get(id).push(m);
    }
  }
  const fuori = [];
  for (const d of difetti) {
    const c = d?.verifica?.comando;
    if (typeof c !== "string" || !c.trim()) continue;
    const mie = perId.get(d.id) || [];
    if (!mie.length) {
      fuori.push({ id: d.id, motivo: "nessuna voce in mutanti.json: quella prova non è mai stata rotta apposta, quindi non sappiamo se dimostri qualcosa" });
      continue;
    }
    const vive = mie.filter((m) => {
      if (typeof m.cerca !== "string" || !m.cerca) return false;
      const testo = leggi(m.file);
      return testo !== null && testo.includes(m.cerca);
    });
    if (!vive.length) {
      fuori.push({ id: d.id, motivo: `la mutazione punta a un pezzo che non esiste più in ${mie[0].file}: nomina il difetto ma non lo può rompere` });
    }
  }
  return fuori;
}

/** Difetti la cui prova punta a un file che non esiste: un puntatore rotto legge come «fix non fatto». */
export function proveOrfane(difetti, esiste) {
  const fuori = [];
  for (const d of difetti) {
    const c = d?.verifica?.comando;
    if (typeof c !== "string" || !c.trim()) continue;
    const f = fileDelComando(c);
    if (!f) {
      fuori.push({ id: d.id, comando: c, motivo: "il comando non nomina nessun file: non si può nemmeno controllare" });
      continue;
    }
    if (!esiste(f)) {
      fuori.push({ id: d.id, comando: c, motivo: `il file ${f} non esiste` });
      continue;
    }
    // Lotto 33: il file c'è, ma `auto-fix` — che è chi chiude davvero i difetti dopo il merge — sa
    // eseguire solo `node cervello/<script>.mjs [--flag]`, e quella restrizione è una difesa (un
    // difetto non deve poter far girare codice arbitrario per dichiararsi risolto). Una prova che
    // il cancello accetta e il motore non sa eseguire è peggio di una prova mancante: il lotto si
    // consegna, il merge passa, e il difetto resta aperto marcato «manuale» — cioè in attesa di un
    // umano che non sa di essere atteso. È successo qui, ad AR-409 e AR-226.
    if (!comandoAmmesso(c)) {
      fuori.push({
        id: d.id,
        comando: c,
        motivo: `auto-fix non potrà eseguirlo (${MOTIVO_COMANDO_NON_AMMESSO}): il difetto resterebbe aperto in silenzio dopo il merge`,
      });
    }
  }
  return fuori;
}

// ─────────────────────────────────────────────────────────────────────────────
// Esecuzione dei guardiani già esistenti
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Con cosa confrontarsi per capire cosa ha toccato QUESTO lotto.
 *
 * L'antenato comune col ramo pubblicato è la risposta giusta, ma questo repo è spesso clonato
 * shallow (il cloud agent lo fa) e lì `merge-base` non trova niente: confrontarsi con la punta di
 * `origin/main` darebbe «toccati» tutti i difetti cambiati dai lotti mergiati nel frattempo — 200
 * su 277, cioè un elenco inutile. In quel caso si torna a `HEAD`, che vede le modifiche non ancora
 * committate.
 *
 * Il limite di `HEAD`, dichiarato: se parte del lotto è già committata, il controllo «prova NUOVA»
 * non la vede. Non è un buco, è una perdita di precisione — la difesa principale resta il TETTO,
 * che è assoluto: una prova a OR in più alza il totale e blocca comunque.
 */
function basePerConfronto() {
  // AR-419 — prima si SAPEVA di essere shallow solo per deduzione: se `merge-base` non rispondeva,
  // si scriveva «repo shallow» come spiegazione più probabile. Quasi sempre giusta, ma è comunque
  // un motivo indovinato — e un guardiano che indovina il perché della propria cecità non sta
  // misurando, sta raccontando. Ora la storia si chiede alla porta e il motivo è quello vero.
  const storia = storiaDelRepo(AD_ROOT);
  if (storia.intera) {
    const mb = spawnSync("git", ["merge-base", "HEAD", "origin/main"], { cwd: AD_ROOT, encoding: "utf8" });
    if (mb.status === 0 && mb.stdout.trim()) return { spec: mb.stdout.trim(), nota: "antenato comune con origin/main" };
  }
  return { spec: "HEAD", nota: `${storia.motivo} → confronto con l'ultimo commit locale (i pezzi già committati non risultano toccati)` };
}

/** Un comando git che risponde con la sua uscita, o `null` se non ha potuto rispondere. */
function gitOrNull(args) {
  const r = spawnSync("git", args, { cwd: AD_ROOT, encoding: "utf8", timeout: 30_000, maxBuffer: 32 * 1024 * 1024 });
  return r.status === 0 ? r.stdout : null;
}

/**
 * AR-339 — un ELENCO DI PERCORSI si chiede alla porta, non a git direttamente.
 *
 * `gitOrNull(...).split("\n")` sembra equivalente e non lo è: senza il `-z` che mette la porta, un
 * nome con l'accento o con uno spazio torna citato o spezzato, e il perimetro del lotto ci perde
 * dentro un file — cioè un file mio viene contato come non-mio, che è esattamente ciò che il tetto
 * deve distinguere. Qui il fallimento NON è un errore: fuori da un clone git l'elenco è vuoto e il
 * cancello prosegue (il caso lo copre già `base.spec`), quindi si torna `[]` e non si alza niente.
 */
function elencoTracciato(args) {
  try {
    return percorsiDaGit(args, { cwd: AD_ROOT });
  } catch (e) {
    // Il `[]` non è mai una risposta: è l'assenza di risposta, e per chi legge somiglia a
    // «nessun file», che è un verdetto opposto. Fuori da un clone git è legittimo e atteso;
    // dentro un clone è git che ha detto no, e allora il perimetro del lotto è CIECO, non vuoto
    // — con un perimetro vuoto il blocco duro non riconosce più nessun test come «mio» e smette
    // di bloccare in silenzio. Lo si dichiara qui, dove il cancello lo può stampare.
    if (existsSync(join(AD_ROOT, ".git"))) {
      cieco.push(`perimetro del lotto: git non ha risposto (${e?.causaGit || e?.message || "motivo ignoto"})`);
    }
    return [];
  }
}

/** I motivi per cui questo cancello NON ha potuto misurare qualcosa: si dichiarano, non si tacciono. */
const cieco = [];

function gitShow(spec) {
  const r = spawnSync("git", ["show", spec], { cwd: AD_ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  return r.status === 0 ? r.stdout : null;
}

/**
 * L'ambiente del Pannello è pronto per un typecheck che voglia dire qualcosa?
 *
 * Pura: riceve la domanda «questo file esiste?» e non tocca il disco da sé, così la prova può
 * simulare una sessione appena aperta senza svuotare `node_modules` per davvero.
 */
export function ambientePannello(esiste) {
  if (!esiste("node_modules")) {
    return {
      pronto: false,
      caso: "assente",
      motivo: "pannello/node_modules assente: `tsc` sbaglierebbe su ogni import, e non è il tuo lavoro",
      comando: "npm ci --prefix pannello",
    };
  }
  if (!esiste("node_modules/@types/node")) {
    return {
      pronto: false,
      caso: "incompleto",
      motivo: "pannello/node_modules c'è ma senza @types/node: `process` e i moduli Node risulterebbero sconosciuti",
      comando: "npm ci --prefix pannello",
    };
  }
  return { pronto: true };
}

/**
 * Le righe da mostrare quando un controllo è rosso o cieco: il MOTIVO, non la coda.
 *
 * AR-491 — un rosso che non dice perché è un rosso che si aggira. Il 3/8 il contatore delle consegne
 * mute è uscito 1 in CI e 0 sulla stessa fusione qui: nel log comparivano solo le ultime sei righe,
 * che con `--json` erano le graffe di chiusura. Tre giri di indagine alla cieca su un guardiano che
 * la sua ragione ce l'aveva scritta dentro. La coda è una scelta comoda quando il comando parla per
 * ultimo; qui si sceglie invece per CONTENUTO: le righe che portano un marcatore di verdetto.
 * Se non ce n'è nessuna si torna alla coda — dichiarando così che il motivo non l'ho trovato.
 *
 * AR-656 — mezza riparazione, e la metà mancante è costata due indagini alla cieca il 13/8. Il
 * sorvegliante annuncia la propria cecità con una riga che finisce in due punti («⚪ non ho potuto
 * misurare:») e mette il perché nelle righe SOTTO, che sono elenchi puntati senza marcatore. Il
 * filtro teneva l'annuncio e buttava via il contenuto: nel log restava un cieco che non diceva di
 * cosa. Un'intestazione che promette un elenco vale solo insieme al suo elenco, quindi se la riga
 * scelta finisce in «:» si porta dietro le righe puntate che la seguono.
 */
export function righeMotivo(righe = []) {
  // I SIMBOLI VALGONO IN TESTA ALLA RIGA, le parole ovunque — e la differenza l'ha insegnata la CI.
  //
  // Prima bastava che il carattere comparisse in un punto qualsiasi. Il 15/8 il banco delle
  // mutazioni ha prodotto due righe RIUSCITE il cui titolo *cita* il carattere ⚪ («una prova non
  // eseguita resta come ⚪»): sono state scelte come motivi, hanno riempito le sei righe tenute, e
  // hanno spinto fuori l'unica riga che il problema ce l'aveva davvero. Il referto mostrava due
  // successi sotto l'intestazione di un fallimento.
  //
  // Un simbolo che APRE la riga è un VERDETTO; lo stesso simbolo in mezzo a una frase è una parola.
  //
  // «Apre», non «è il primo carattere»: un verdetto vero arriva spesso dentro un referto in JSON,
  // dove davanti ha spazi e una virgoletta (`      "❌ 14 consegne mute…"`), oppure dentro un
  // elenco puntato. Quindi si ammette la punteggiatura che sta prima, e si rifiuta il testo.
  // Ancorarlo alla colonna zero spegneva la diagnosi che questo filtro esiste per salvare — provato
  // subito, con un caso di questo file diventato rosso.
  //
  // Le parole-marcatore restano libere: `AssertionError` e `CIECO` compaiono in mezzo alle righe.
  const MARCATORE = /(^[\s"'`·•\-[(]*(❌|⛔|⚪)|CIECO|AssertionError|^\s*Error\b|^\s*Errore\b|^not ok\b)/;
  const scelte = new Set();
  righe.forEach((r, i) => {
    if (!MARCATORE.test(r)) return;
    scelte.add(i);
    if (!/:\s*$/.test(r)) return;
    for (let j = i + 1; j < righe.length && /^\s*[·•-]\s/.test(righe[j]); j++) scelte.add(j);
  });
  const motivi = righe.filter((_, i) => scelte.has(i));
  return motivi.length ? motivi.slice(-6) : righe.slice(-6);
}

function esegui(nome, cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    cwd: opts.cwd || AD_ROOT,
    encoding: "utf8",
    timeout: opts.timeout || 300_000,
    maxBuffer: 32 * 1024 * 1024,
  });
  const uscita = `${r.stdout || ""}${r.stderr || ""}`;
  const righe = uscita.trim().split("\n").filter(Boolean);
  // TRE ESITI, NON DUE — e prima erano due nei fatti anche se la documentazione ne raccontava tre.
  //
  // `2` è il codice con cui un guardiano di questa casa dice «non ho potuto misurare»: clone
  // superficiale, dipendenza assente, file che non c'è. Fino al 30/7 finiva in `fallito` come una
  // violazione, e la conseguenza si vedeva a occhio: in una sessione cloud il clone è SEMPRE
  // superficiale, quindi `prove-oneste` usciva sempre 2 e il cancello non poteva diventare verde
  // nemmeno con il lavoro perfetto. Un cancello che non può essere verde smette di essere letto —
  // ed è scritto nella skill stessa: «un cancello sempre rosso viene aggirato al secondo giro».
  //
  // Il segnale NON si perde: i ciechi restano contati e l'uscita finale del comando è 2, che per la
  // CI e per ogni script è diverso da 0 e blocca esattamente come prima (il workflow lo dichiara).
  // Cambia per chi legge: «questa parte non l'ho misurata» non si maschera più da «il tuo fix è
  // rotto», che è l'informazione per cui si aprono le indagini sbagliate.
  //
  // Un processo ucciso (timeout, segnale: `status === null`) NON è un cieco dichiarato: è un
  // guardiano che non ha finito, e resta rosso — altrimenti il controllo più lento diventerebbe
  // quello che si può saltare senza dirlo.
  const ucciso = r.status === null;
  const codice = ucciso ? 124 : r.status;
  return {
    nome,
    comando: `${cmd} ${args.join(" ")}`.trim(),
    codice,
    // La prima riga di solito è il verdetto, l'ultima l'errore: si tengono entrambe le code.
    testa: righe.slice(0, 3),
    coda: ucciso ? [...righe.slice(-5), `⏱️ non ha finito in tempo (${opts.timeout || 300_000} ms): rosso, non cieco`] : righeMotivo(righe),
    fallito: codice !== 0 && codice !== 2,
    cieco: codice === 2,
    // AR-437 — l'uscita INTERA, per chi deve contare le violazioni e non solo vederle. `righeMotivo`
    // tiene sei righe: bastano a un umano che legge, non a un tetto che deve dire un numero.
    uscita: uscita,
  };
}

/**
 * AR-437 — applica al passo la regola del TETTO, che da qui in poi è del cancello e non del guardiano.
 *
 * Mutare il passo invece di restituirne un altro è voluto: il verdetto finale (`passiRotti`) e la
 * stampa leggono `fallito`/`cieco`/`coda`, e una seconda forma di passo che le stesse righe devono
 * saper leggere è il modo in cui due strade divergono al primo cambiamento.
 */
function applicaTetto(passo, { quanti, delLotto, tetto, avvisi, violazioni, regola }) {
  const v = verdettoConTetto({ codice: passo.codice, quanti, tetto, delLotto });
  if (v.esito === "ok" || v.esito === "cieco") return v;
  if (v.esito === "violazione") {
    // Resta rosso, ma adesso il motivo dice DI CHI è: «tuo» o «il debito si è allargato», che sono
    // due mosse diverse per chi legge. Prima erano la stessa riga.
    passo.coda = [`❌ ${regola}: ${v.motivo}`, ...passo.coda];
    violazioni.push({ regola, ids: v.chi || [], motivo: `${passo.nome} — ${v.motivo}` });
    return v;
  }
  // DEBITO: il guardiano è rosso su roba di altri e sotto il tetto. Il passo NON blocca più, e il
  // numero resta in chiaro fra gli avvisi: sparire sarebbe barare, bloccare sarebbe il cancello
  // sempre rosso che si impara ad aggirare.
  passo.fallito = false;
  passo.debito = true;
  passo.coda = [`⚠️ ${regola}: ${v.motivo}`, ...passo.coda];
  avvisi.push(`${passo.nome} — ${v.motivo}`);
  return v;
}

function main() {
  if (!existsSync(CANTIERE)) {
    if (JSON_MODE) console.log(JSON.stringify({ ok: false, cieco: true, motivo: "cantiere assente" }));
    else console.error("cancello-lotto: cantiere-difetti.json assente → non posso misurare");
    process.exit(2);
  }
  let cantiere;
  try {
    cantiere = JSON.parse(readFileSync(CANTIERE, "utf8"));
  } catch (e) {
    if (JSON_MODE) console.log(JSON.stringify({ ok: false, cieco: true, motivo: `cantiere illeggibile: ${e.message}` }));
    else console.error(`cancello-lotto: cantiere illeggibile (${e.message}) → non posso misurare`);
    process.exit(2);
  }

  const difetti = Array.isArray(cantiere.difetti) ? cantiere.difetti : [];
  const aperti = difetti.filter((d) => d.stato !== "chiuso");
  const leggi = (f) => {
    try {
      return readFileSync(join(AD_ROOT, f), "utf8");
    } catch {
      return null;
    }
  };
  const esiste = (f) => existsSync(join(AD_ROOT, f));

  // ① Le regole sulle prove (istantanee, nessun processo).
  // L'id doppio viene per primo: se l'indice del cantiere è rotto, ogni controllo che segue sta
  // contando su una chiave che non identifica più niente. E non ha tetto — non è debito ereditato,
  // è una collisione fra due sessioni, e o c'è o non c'è.
  const doppi = idDoppi(difetti);
  const conOr = aperti.filter(provaConOr).map((d) => d.id);
  const condivise = proveCondiviseCieche(aperti, leggi);
  const orfane = proveOrfane(aperti, esiste);

  // `mutanti.json` illeggibile non è «nessuna mutazione mancante»: è non aver misurato.
  const ciechiProve = [];
  let mutanti = null;
  try {
    const m = JSON.parse(readFileSync(MUTANTI, "utf8")).mutanti;
    if (Array.isArray(m)) mutanti = m;
    else ciechiProve.push("mutanti.json non contiene un elenco `mutanti`: il controllo mutazione-mancante non ha misurato");
  } catch (e) {
    ciechiProve.push(`mutanti.json non leggibile (${e.message}): il controllo mutazione-mancante non ha misurato`);
  }
  const senzaMutazione = mutanti ? mutazioniMancanti(aperti, mutanti, leggi) : [];

  // Chi ha toccato il lotto: confronto con il cantiere del ramo pubblicato.
  const base = basePerConfronto();
  const primaTxt = gitShow(`${base.spec}:MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json`);
  let cantierePrima = null;
  try {
    cantierePrima = primaTxt ? JSON.parse(primaTxt) : null;
  } catch {
    cantierePrima = null;
  }
  const toccati = difettiToccati(cantiere, cantierePrima);
  const nati = difettiNati(cantiere, cantierePrima);
  const tetti = leggiTetti();

  if (AGGIORNA_TETTI) {
    if (ciechiProve.length) {
      console.error(`cancello-lotto: ${ciechiProve[0]} → non abbasso un tetto che non ho misurato`);
      process.exit(2);
    }
    // `prova_debole` entra qui dal lotto della conversione (11/8): il cancello consigliava
    // «abbassa il tetto con --aggiorna-tetti» e quel comando quel tetto non lo toccava. Un guardiano
    // che suggerisce un rimedio che non funziona insegna a ignorare i suoi consigli.
    const debolliOra = contaProveDeboli(difetti).deboli;
    // AR-437 — i due tetti nuovi si dichiarano da qui, e ci vogliono i loro guardiani: il numero non
    // si indovina, si misura. Costa i secondi delle due corse, e si paga solo con `--aggiorna-tetti`.
    const onesteOra = idSospetti(esegui("prove oneste", "node", ["cervello/prove-oneste.mjs"]).uscita).length;
    const rossiOra = testRossi(esegui("test del cervello", "node", ["cervello/test-cervello.mjs", "--json"], { timeout: 600_000 }).uscita);
    if (rossiOra === null) {
      console.error("cancello-lotto: non ho saputo leggere l'esito della suite → non dichiaro un tetto che non ho misurato");
      process.exit(2);
    }
    const nuovo = {
      prova_con_or: Math.min(conOr.length, tetti.prova_con_or ?? conOr.length),
      mutazione_mancante: Math.min(senzaMutazione.length, tetti.mutazione_mancante ?? senzaMutazione.length),
      prova_debole: Math.min(debolliOra, tetti.prova_debole ?? debolliOra),
      prove_oneste: Math.min(onesteOra, tetti.prove_oneste ?? onesteOra),
      test_cervello: Math.min(rossiOra.length, tetti.test_cervello ?? rossiOra.length),
    };
    // Si FONDE con quello che c'è già: la prima versione riscriveva il file da zero e cancellava
    // le note (fra cui il perché il tetto non è zero). Un guardiano che perde le sue spiegazioni
    // lascia dietro un numero senza motivo — la cosa che questo cantiere cura.
    const { _mancante, _illeggibile, ...vecchio } = tetti;
    writeFileSync(TETTI, `${JSON.stringify({ ...vecchio, aggiornato: nowPiacenza(), ...nuovo }, null, 1)}\n`);
    console.log(`🚧 tetti aggiornati: prova_con_or = ${nuovo.prova_con_or} · mutazione_mancante = ${nuovo.mutazione_mancante} · prova_debole = ${nuovo.prova_debole}`);
    process.exit(0);
  }

  const violazioniProve = [];
  const avvisi = [];

  for (const d of doppi) {
    violazioniProve.push({
      regola: "id-doppio",
      ids: [d.id],
      motivo: `${d.quanti} difetti diversi con l'id ${d.id} — «${d.titoli.map((t) => t.slice(0, 45)).join("» / «")}». Il cantiere è indicizzato per id: rinumera quello arrivato dopo prima di consegnare.`,
    });
  }

  // `prova-con-or`: il debito storico ha un tetto, le prove del LOTTO no.
  const tettoOr = tetti.prova_con_or ?? 0;
  const orNelLotto = toccati ? conOr.filter((id) => toccati.includes(id)) : [];
  if (orNelLotto.length) {
    violazioniProve.push({
      regola: "prova-con-or",
      ids: orNelLotto,
      motivo: "una prova NUOVA con un OR dentro: chiuderebbe il difetto con metà fix fatto (AR-178)",
    });
  }
  if (conOr.length > tettoOr) {
    violazioniProve.push({
      regola: "prova-con-or-oltre-il-tetto",
      ids: conOr,
      motivo: `${conOr.length} prove a OR contro un tetto di ${tettoOr}: il debito si è allargato`,
    });
  } else if (conOr.length < tettoOr) {
    avvisi.push(`prove a OR scese da ${tettoOr} a ${conOr.length}: abbassa il tetto con --aggiorna-tetti`);
  } else if (conOr.length) {
    avvisi.push(`${conOr.length} prove a OR ereditate (sotto il tetto): ${conOr.slice(0, 8).join(", ")}${conOr.length > 8 ? "…" : ""}`);
  }

  // `prova-debole`: le schede APERTE che portano ancora una prova a pattern (AR-444, clausola c).
  // Non le vietiamo — 127 su 151 il 30/7, vietarle congelerebbe l'84% del cantiere e un cancello
  // sempre rosso viene aggirato al secondo giro. Le CONTIAMO, sotto un tetto che scende e non
  // risale: così il debito è un numero che si vede, invece di una forma che si propaga in silenzio.
  const deboli = contaProveDeboli(difetti);
  const tettoDeboli = tetti.prova_debole ?? deboli.deboli;
  if (deboli.deboli > tettoDeboli) {
    violazioniProve.push({
      regola: "prova-debole-oltre-il-tetto",
      ids: deboli.ids.slice(0, 10),
      motivo: `${deboli.deboli} schede aperte con prova a pattern contro un tetto di ${tettoDeboli}: la forma debole si è allargata`,
    });
  } else if (deboli.deboli < tettoDeboli) {
    avvisi.push(`prove deboli scese da ${tettoDeboli} a ${deboli.deboli}: abbassa il tetto con --aggiorna-tetti`);
  } else {
    avvisi.push(`${deboli.deboli} schede aperte su ${deboli.aperti} portano ancora una prova a pattern (sotto il tetto)`);
  }

  // `asticella`: una scheda GRAVE che NASCE adesso con una prova a pattern non entra (AR-564).
  // Il debito vecchio resta sotto il tetto qui sopra; la porta d'ingresso però si chiude.
  const deboliNate = proveDeboliNate(difetti, nati);
  for (const x of deboliNate) {
    violazioniProve.push({
      regola: "asticella",
      ids: [x.id],
      motivo: `${x.id} nasce ${x.gravita} con una prova che non gira (${x.forma}): una parola in un file non è un comportamento. Dagli un comando che diventi rosso se il difetto c'è, oppure dichiara \`verifica: {tipo:"umano"}\` se nessun guardiano potrà mai chiuderlo`,
    });
  }
  if (nati === null) avvisi.push("non so quali schede sono NATE in questo lotto: l'asticella non ha misurato");
  else if (nati.length && !deboliNate.length) avvisi.push(`asticella: ${nati.length} schede nate in questo lotto, nessuna grave con prova debole`);
  // `mutazione-mancante`: stesso trattamento. Il debito ereditato ha un tetto che scende; un difetto
  // che il lotto tocca ADESSO senza la sua mutazione non si consegna, punto — anche sotto il tetto.
  const tettoMut = tetti.mutazione_mancante ?? 0;
  // AR-692 — RIAPRIRE ONESTAMENTE UN DIFETTO NON È AGGIUNGERE DEBITO.
  //
  // Il conto qui sotto ha tetto 0 e prende i difetti APERTI con prova a comando e senza mutazione.
  // Riaprirne due veri lo portava da 0 a 2 e faceva scattare l'allarme: il metro leggeva «il debito
  // si è allargato» dove il fatto è l'opposto — quel debito c'era già, dentro una scheda marcata
  // chiusa, e riaprirla lo ha reso VISIBILE. In un cantiere che vive di onestà è l'incentivo
  // esattamente rovesciato: la strada comoda diventa lasciare la scheda chiusa.
  //
  // La radice, più a fondo: la mutazione di un difetto RIPARATO risponde a «e se il fix tornasse
  // indietro?» — si rompe il fix e si pretende il rosso. Su un difetto riaperto non c'è nessun fix
  // da rompere, la prova è già rossa: è un'altra domanda, non la stessa più debole. Il contratto
  // (contratto-prova.mjs) separa le due, e chi è stato riaperto ADESSO esce dal conto del debito.
  //
  // ⚠️ Il blocco duro NON si allarga né si allenta: un difetto che il lotto tocca e dichiara
  // riparato senza mutazione resta una violazione. Cade solo per chi è stato appena riaperto.
  const eraChiuso = new Set(
    (cantierePrima?.difetti || []).filter((d) => String(d?.stato || "").toLowerCase() === "chiuso").map((d) => d?.id),
  );
  const riapertoAdesso = (id) => eraChiuso.has(id);
  // La stessa misura di `senzaMutazione`, fatta su TUTTO il registro invece che sui soli aperti:
  // senza le chiuse non si vede la metà del debito che conta di più — quella che si è già
  // dichiarata riparata. Una domanda sola, fatta a due popolazioni diverse, non due domande.
  const senzaMutazioneTutti = mutanti ? new Set(mutazioniMancanti(difetti, mutanti, leggi).map((x) => x.id)) : null;
  const debito = senzaMutazioneTutti
    ? debitoDiMutazione(difetti, (id) => !senzaMutazioneTutti.has(id), riapertoAdesso)
    : { riparati: [], aperti: [], riaperti: [], senzaProvaAComando: 0 };
  const senzaMutazioneContati = senzaMutazione.filter((x) => !riapertoAdesso(x.id));
  const mutNelLotto = toccati ? senzaMutazioneContati.filter((x) => toccati.includes(x.id)) : [];
  for (const x of mutNelLotto) {
    violazioniProve.push({
      regola: "mutazione-mancante",
      ids: [x.id],
      motivo: `${x.motivo} — rompi il fix in mutanti.json e pretendi il rosso (node cervello/non-vacuita.mjs)`,
    });
  }
  // …E LA PORTA DI SERVIZIO, che era aperta da sempre: una scheda CHIUSA in questo lotto senza
  // toccarne la `verifica` non risultava «toccata» (il confronto guarda solo quel campo) e non
  // risultava fra le aperte (il conto guarda solo quelle): usciva dal blocco duro da tutt'e due i
  // lati. Cioè il modo più comodo di consegnare un fix mai provato era dichiararlo riparato. Adesso
  // «l'ho chiuso io in questo lotto» conta come toccato — è la definizione stessa di riparato.
  //
  // Il debito vecchio non entra: chi era già chiuso sul ramo pubblicato resta nel conto informativo
  // qui sotto (98 schede), che si vede e deve scendere, ma non blocca nessuno.
  const chiusiInQuestoLotto = cantierePrima
    ? difetti
        .filter((d) => String(d?.stato || "").toLowerCase() === "chiuso" && !eraChiuso.has(d?.id))
        .map((d) => d.id)
        .filter((id) => senzaMutazioneTutti?.has(id))
    : [];
  for (const id of chiusiInQuestoLotto) {
    if (mutNelLotto.some((x) => x.id === id)) continue; // già nominato dal ramo qui sopra
    violazioniProve.push({
      regola: "mutazione-mancante",
      ids: [id],
      motivo:
        `${id} viene dichiarato CHIUSO in questo lotto e nessuna mutazione rompe il suo fix: ` +
        "una riparazione che nessuno ha mai visto diventare rossa non si consegna — rompi il fix in mutanti.json e pretendi il rosso (node cervello/non-vacuita.mjs)",
    });
  }
  if (senzaMutazioneContati.length > tettoMut) {
    violazioniProve.push({
      regola: "mutazione-mancante-oltre-il-tetto",
      ids: senzaMutazioneContati.map((x) => x.id),
      motivo: `${senzaMutazioneContati.length} prove mai rotte apposta contro un tetto di ${tettoMut}: il debito si è allargato`,
    });
  } else if (senzaMutazioneContati.length < tettoMut) {
    avvisi.push(`prove senza mutazione scese da ${tettoMut} a ${senzaMutazioneContati.length}: abbassa il tetto con --aggiorna-tetti`);
  } else if (senzaMutazioneContati.length) {
    avvisi.push(`${senzaMutazioneContati.length} prove ereditate mai rotte apposta (sotto il tetto): ${senzaMutazioneContati.map((x) => x.id).join(", ")}`);
  }
  if (debito.riaperti.length) {
    avvisi.push(
      `${debito.riaperti.length} difetti RIAPERTI in questo lotto senza mutazione (${debito.riaperti.map((x) => x.id).join(", ")}): ` +
        "debito ereditato reso visibile, non debito nuovo — non conta nel tetto, e va dichiarato nella PR (AR-692)",
    );
  }
  // IL DEBITO CHE NESSUNO CONTAVA, e che sta dall'altra parte: le schede DICHIARATE RIPARATE la cui
  // prova non è mai stata rotta apposta. Misurate il 14/8: 98. Non blocca — bloccare novantotto
  // schede vecchie renderebbe il cancello rosso per sempre, e un cancello sempre rosso si impara ad
  // aggirare — ma senza questa riga il numero non lo vedeva nessuno, ed è quello che deve scendere.
  if (debito.riparati.length) {
    avvisi.push(
      `${debito.riparati.length} schede dichiarate RIPARATE la cui prova non è mai stata rotta apposta: ` +
        "è il debito vero (una chiusura che nessuno ha mai visto diventare rossa), e sta tutto dentro schede già chiuse",
    );
  }

  // AR-473 — un controllo che non ha misurato va nella colonna dei CIECHI, non in quella degli
  // avvisi. Le due colonne si stampano identiche (⚠️) ma solo la prima cambia il verdetto: finché
  // questa riga diceva `avvisi`, «non ho misurato» finiva sotto un ✅ SI PUÒ CONSEGNARE.
  if (toccati === null) ciechiProve.push("non ho potuto confrontare col ramo pubblicato: il controllo «prova nuova» non ha misurato");
  else if (base.spec === "HEAD") avvisi.push(base.nota);

  for (const c of condivise) violazioniProve.push({ regola: "prova-condivisa-cieca", ...c });
  for (const o of orfane) violazioniProve.push({ regola: "prova-orfana", ...o });

  const passi = [];
  if (!SOLO_PROVE) {
    // I gate delle lezioni: costa 50 ms e impedisce l'unico modo di barare sulla pagella —
    // scrivere `gate: "node …"` accanto a una correzione di Nicola senza una mutazione che provi
    // che quel comando scatta davvero. Sta qui e non solo nel giro perché il momento in cui si è
    // tentati di gonfiare il numero è la consegna, non il mattino dopo.
    passi.push(esegui("gate delle lezioni", "node", ["cervello/gate-veri.mjs"]));
    // La forma dei JSON: costa un secondo e impedisce la PR da dodicimila righe per cambiarne una.
    passi.push(esegui("forma dei JSON toccati", "node", ["cervello/forma-json.mjs"]));
    // E l'altra metà (AR-558): `forma-json` vede il file DOPO che è stato riscritto — cioè quando il
    // commit è già bloccato e l'albero già sporco, che è l'anello 3 della catena di AR-522. Questo
    // guarda a monte, il CODICE che lo riscriverà: ogni `writeFileSync(X, JSON.stringify(…, null, N))`
    // dove N non è l'indentazione che X ha sul disco. Misurato: 12.953 righe di diff contro 3.
    passi.push(esegui("nessuno impone la forma ai JSON", "node", ["cervello/indentazione-guardia.mjs"]));
    // AR-437 — `prove-oneste` passa dal TETTO come `prova-con-or`: il debito ereditato si conta e
    // scende, ciò che il lotto tocca adesso non entra comunque. Prima il cancello ne propagava
    // l'uscita secca, quindi un lotto sano restava bloccato dalle prove disoneste di radiografie
    // vecchie — e un cancello che non può diventare verde viene aggirato al secondo giro.
    const pOneste = esegui("prove oneste", "node", ["cervello/prove-oneste.mjs"]);
    const disonesti = idSospetti(pOneste.uscita);
    applicaTetto(pOneste, {
      regola: "prove-oneste",
      // Rosso e zero id estratti = non ho saputo contare → `null`, e allora non si assolve niente.
      quanti: disonesti.length || null,
      delLotto: toccati ? disonesti.filter((id) => toccati.includes(id)) : null,
      tetto: tetti.prove_oneste ?? null,
      avvisi,
      violazioni: violazioniProve,
    });
    passi.push(pOneste);
    passi.push(esegui("spazzata dei fratelli", "node", ["cervello/spazzata-fratelli.mjs"]));
    // I due guardiani del lotto 40, cablati QUI e non lasciati sullo scaffale. Erano nati con la
    // stessa malattia che curano — costruiti e mai messi di guardia — e `guardiano-mai-messo-di-
    // guardia` li ha presi entrambi il giorno stesso: uno strumento che emette un verdetto e non lo
    // esegue nessuno non è una difesa, è un file. Stanno accanto alla spazzata perché fanno la sua
    // stessa domanda su due superfici diverse: quanti moduli partono da soli al solo essere
    // importati (AR-445), e quante prove esistono senza che nessuno le faccia girare (AR-660).
    passi.push(esegui("nessun modulo parte da solo se lo importi", "node", ["cervello/import-che-esegue.mjs"]));
    passi.push(esegui("nessuna prova scritta e mai eseguita", "node", ["cervello/prove-non-eseguite.mjs"]));
    // AR-693 ② — «29 prove in bash che nessuno fa girare» detto come NUMERO con un tetto, e non come
    // un ⚪ in fondo a un elenco di duecentoquaranta righe. Il tetto scende quando qualcuno installa
    // bats dove il banco gira davvero; sale mai. Aggiungere una prova in bash mentre nessuno esegue
    // le altre è una violazione, non un contributo.
    passi.push(esegui("prove in bash senza esecutore (tetto)", "node", ["cervello/debito-prove-bash.mjs"]));
    // AR-706 — e la stessa domanda sulle prove che guidano una superficie VIVA: quante non è mai
    // stata rotta apposta? Una prova a runtime non provata col fix disfatto può misurare il tema
    // invece della cura, e nessuno se ne accorge — è successo, ed è stato scoperto solo applicando
    // la mutazione davvero.
    passi.push(esegui("prove a runtime mai rotte apposta (tetto)", "node", ["cervello/prove-runtime-senza-mutazione.mjs"]));
    // La spazzata chiede «questa malattia si è allargata?». Questo chiede l'altra metà: «la forma che
    // è appena tornata ce l'ha, un nome?» — senza, il registro invecchia da fermo (AR-499).
    passi.push(esegui("le malattie che mancano", "node", ["cervello/malattie-mancanti.mjs"]));
    // AR-699 — LE MUTAZIONI CHE HO SCOLLEGATO RISCRIVENDO, e non solo quelle dei difetti che nomino.
    //
    // `non-vacuita.mjs` qui sotto gira SOLO sulle mutazioni dei difetti che il lotto tocca: è una
    // scelta giusta (rompere quelle di trenta lotti a ogni consegna costerebbe minuti), ma lascia
    // scoperto proprio il caso misurato — cinque mutazioni orfanate in un lotto solo, e nessuna
    // apparteneva a un difetto che quel lotto nominava. Il comportamento era SPOSTATO, non rimosso:
    // il fix restava, la difesa no, e il test continuava a passare.
    //
    // Questo passo fa la domanda sull'altro asse: non «i miei difetti», ma «i file che ho toccato».
    // Costa una lettura per file e nessun processo. Chi lo trova rosso ha due strade, e sono
    // entrambe di trenta secondi: se il pezzo l'ho spostato, aggiorno `cerca` in mutanti.json; se
    // l'ho tolto, ho appena disfatto un fix e lo devo sapere adesso.
    passi.push(esegui("nessuna mutazione scollegata dai file toccati", "node", ["cervello/mutazioni-orfane.mjs"]));
    // Due schede con lo stesso numero (AR-535): non è un fastidio, è una scheda che sparisce alla
    // prima unione — successo tre volte il 4/8 fra me e il worker. Costa 100 ms e sta qui perché il
    // momento in cui il numero si sceglie è la consegna, e il momento in cui il danno si vede è la
    // fusione: in mezzo non guardava nessuno.
    passi.push(esegui("nessun numero di scheda usato due volte", "node", ["cervello/prossimo-ar.mjs", "--controlla"]));
    // La guardia sul DELTA di questo lotto (30/7, Nicola: «trovi problemi che tu stesso hai creato»).
    // Sta qui e non in un comando a parte per la stessa ragione per cui questo cancello esiste: cinque
    // comandi da ricordare erano cinque occasioni di dimenticarne uno. Guarda solo le righe aggiunte,
    // quindi non porta debito storico dentro il cancello — nessun tetto da dichiarare.
    //
    // `--base` (4/8) — e senza, questo passo in CI MISURAVA ZERO. Il comando nudo confronta con
    // `HEAD`, cioè con l'ultimo commit: su un runner l'albero è appena clonato e quindi pulito, il
    // perimetro esce vuoto e il verdetto è un verde che non ha guardato niente. Il passo c'era, la
    // misura no — la forma esatta della malattia che questa casa ha in cima al registro. Gli si passa
    // lo STESSO antenato comune che il cancello usa già per i difetti: una risposta sola alla stessa
    // domanda, perché due calcoli della stessa cosa col tempo divergono sempre.
    passi.push(esegui("sorvegliante del delta", "node", ["cervello/sorvegliante.mjs", "--base", base.spec]));
    // AR-459 — un difetto nuovo deve dire COME è nato, altrimenti «l'ho creato io» e «l'ho appena
    // scoperto» restano indistinguibili e la domanda di Nicola («i fix stanno creando più problemi
    // di quanti ne chiudono?») non ha una risposta numerica. Sta nel cancello e non in un comando a
    // parte perché il momento in cui si compila è la consegna del lotto, non il mattino dopo.
    passi.push(esegui("nascita dei difetti", "node", ["cervello/nascita-difetti.mjs"]));
    // AR-474 — le tre domande dello Stop valgono anche qui: un difetto chiuso senza prova, un
    // allarme scritto e non accodato, una lezione senza freno. Nel turno arrivano prima (hook Stop),
    // ma il cancello del lotto e il posto che gira in CI su OGNI PR: qui il freno esiste comunque.
    passi.push(esegui("verdetti senza lettore", "node", ["cervello/cancello-stop.mjs"]));
    // AR-475 — il posto dove vivono i freni non era sorvegliato da nessuno. Il blocco Stop incollato
    // a mano l'1/8 aveva la graffa finale mancante (JSON non valido → NIENTE hook caricato, deny sui
    // .env compreso) e la chiave `stop` minuscola: due difetti, zero rumore. Sta nel cancello e non
    // in un comando a parte perché la configurazione si tocca proprio quando si consegna un freno
    // nuovo — cioè nel momento esatto in cui si può staccare tutto senza accorgersene.
    passi.push(esegui("gli hook attaccati", "node", ["cervello/hooks-check.mjs"]));
    // AR-524 — Nicola, 4/8: «non mi ha dato nessun blocco, perché?». Gli avevo consegnato una
    // configurazione che solo lui può incollare, l'avevo scritta in una consegna e in coda avevo
    // messo una card che diceva «apri quel file e incolla». Il materiale, davanti a lui, non è mai
    // arrivato. Sta nel cancello e non in un comando a parte perché il momento in cui si scrive una
    // card è la consegna: è lì che il puntatore sembra sufficiente.
    passi.push(esegui("il materiale in mano a Nicola", "node", ["cervello/materiale-in-mano.mjs"]));
    // AR-512 — il lato SOTTRAZIONE del cantiere. Tutti i controlli qui sopra contano quello che c'è;
    // il 4/7 una fusione ha riscritto cantiere-difetti.json da 78 a 24 difetti e nessuno ha fiatato
    // per un mese. Sta nel cancello perché il momento in cui un difetto sparisce è esattamente la
    // consegna — una fusione che tiene un lato solo, un JSON riscritto per intero (AR-448).
    passi.push(esegui("il cantiere non perde difetti", "node", ["cervello/cantiere-integrita.mjs"]));
    // AR-474 — il contatore dell'abitudine. I due cancelli fermano il caso nuovo; questo dice se il
    // comportamento sta scomparendo o se sto solo trovando il modo di aggirarli. Ha un tetto che
    // scende e non risale: qui diventa rosso solo se il debito si ALLARGA, cioè se una consegna muta
    // in più è entrata mentre il freno era acceso.
    // Senza `--json`: in JSON il verdetto è una chiave in mezzo al documento, e chi legge il log ne
    // vede solo le graffe finali. In italiano la riga col ❌ dice il numero, il tetto e la data.
    passi.push(esegui("consegne senza esito (contatore)", "node", ["cervello/conta-verdetti-muti.mjs"]));
    // AR-514 — il contatore del blocco che sparisce NON sta qui, e la ragione è la regola di casa.
    //
    // L'avevo messo. Un giro di CI dopo, rosso: su un runner GitHub le trascrizioni non esistono, il
    // contatore esce 2 (cieco) come deve, e questo workflow tratta il 2 come un blocco — apposta,
    // perché «un cancello che lascia passare ciò che non ha saputo misurare» è la bugia che tutto il
    // lotto 32 curava. Le due regole insieme davano un cancello ROSSO PER SEMPRE, e un cancello che
    // non può diventare verde viene aggirato al secondo giro: sarebbe morto tutto il resto con lui.
    //
    // Non è un cieco da dichiarare: è una misura fuori posto. Vive dove la sua fonte esiste — la
    // VISITA (`salute.mjs`, organo `cervello.scrittura`) e la sessione dove sto scrivendo.
    // AR-437 — la suite passa dalla stessa regola. `--json` invece del report perché un tetto ha
    // bisogno di un NUMERO e dei NOMI, e sei righe di coda non li danno: senza i nomi, «tre test
    // rossi da prima» e «hai appena rotto tre test» sono lo stesso rosso, e chi legge non sa se il
    // lavoro è suo. Il perimetro del blocco duro sono i test che questo lotto ha scritto o toccato.
    const pTest = esegui("test del cervello", "node", ["cervello/test-cervello.mjs", "--json"], { timeout: 600_000 });
    const rossi = testRossi(pTest.uscita);
    const miei = testDelLotto(
      // AR-339 — ENTRAMBI gli elenchi passano dalla porta, che mette il `-z`: senza, un nome con
      // l'accento o con uno spazio torna citato o spezzato, e il perimetro del lotto ci perde
      // dentro un file — cioè un file MIO viene contato come non-mio, che è precisamente la
      // distinzione su cui poggia il blocco duro. Il guardiano `segreto-in-un-nome-con-l-accento`
      // le vedeva tutte e due: la prima era sfuggita perché «diff» non sembra un elenco di nomi.
      elencoTracciato(["diff", "--name-only", base.spec]),
      elencoTracciato(["ls-files", "--others", "--exclude-standard"]),
      "cervello/test/",
      // AR-678 — con più corsie sullo stesso tronco git risponde a «cosa è cambiato», non a «cosa ho
      // toccato IO»: chi dichiara il proprio perimetro (LOTTO_PERIMETRO) viene giudicato su quello.
      perimetroDichiarato(process.env.LOTTO_PERIMETRO),
    );
    applicaTetto(pTest, {
      regola: "test-del-cervello",
      quanti: rossi ? rossi.length : null,
      delLotto: rossi ? rossi.filter((f) => miei.includes(f)) : null,
      tetto: tetti.test_cervello ?? null,
      avvisi,
      violazioni: violazioniProve,
    });
    // Con `--json` il report leggibile sparisce: i nomi dei rossi vanno rimessi a mano, altrimenti si
    // curerebbe il verde bugiardo creando un rosso indiagnosticabile (AR-450, di nuovo).
    if (rossi?.length) pTest.coda = [...pTest.coda, ...rossi.slice(0, 8).map((f) => `❌ ${f}`)];
    passi.push(pTest);

    // AR-393 — LA PROVA CHE LE PROVE PROVINO, ESEGUITA INVECE CHE NOMINATA.
    //
    // Fino al 29/7 `non-vacuita.mjs` compariva in tutto il repo solo dentro il messaggio poche
    // righe più su («rompi il fix in mutanti.json e pretendi il rosso») e dentro una skill: era un
    // cartello rivolto a chi legge, non un freno. Il cancello lanciava una decina di controlli e
    // non lanciava quello nato apposta dopo aver scoperto che una prova può essere verde perché
    // cieca — cioè l'unico che misura se gli altri servono a qualcosa.
    //
    // Gira SOLO sulle mutazioni dei difetti che questo lotto tocca: rompere quelle di trenta lotti
    // a ogni consegna costerebbe minuti, e un controllo che si impara a saltare è già spento.
    // Se il lotto non tocca difetti con una mutazione, il passo non si finge fatto: resta fuori, e
    // il buco lo copre già la regola `mutazione-mancante` qui sopra.
    const mieMutazioni = mutanti && toccati ? mutanti.filter((m) => idDellaMutazione(m).some((id) => toccati.includes(id))) : [];
    if (mieMutazioni.length) {
      passi.push(
        esegui("prove non vacue (mutazioni del lotto)", "node", ["cervello/non-vacuita.mjs", "--difetti", toccati.join(",")], {
          timeout: 900_000,
        }),
      );
    } else if (toccati && toccati.length) {
      avvisi.push("nessuna mutazione per i difetti di questo lotto: la prova che le prove provino non ha misurato niente");
    }
    // AR-473 ② — e se il passo NON è girato per cecità (niente confronto, oppure il cantiere è
    // cambiato ma il confronto non lo vede), lo si dichiara: sparire in silenzio dall'elenco è il
    // modo in cui il controllo più prezioso diventava facoltativo senza che nessuno lo decidesse.
    const muto = mutazioniNonGirate({
      mutantiLetti: Boolean(mutanti),
      toccati,
      quanteMutazioni: mieMutazioni.length,
      cantiereCambiato: primaTxt !== null && primaTxt !== readFileSync(CANTIERE, "utf8"),
    });
    if (muto) ciechiProve.push(muto);
    if (!VELOCE) {
      // AMBIENTE NON PRONTO ≠ CODICE ROTTO. In una sessione nuova `pannello/node_modules` non c'è
      // (il clone non li porta), e `tsc` esce 1 con «Cannot find name 'process'» e «Cannot find
      // module 'tailwindcss'»: errori che non parlano del lavoro di nessuno. Misurato il 30/7 su
      // main pulito — 65 secondi per un rosso che non era un rosso. Costa due volte: la prima
      // sessione ci perde tempo a indagare, e da lì in poi si impara a saltarlo, che è il modo in
      // cui un cancello muore. Ora quel caso è ⚪ «non ho potuto misurare» (exit 2) con il comando
      // per rimediare, e il verde dichiara di non coprire il Pannello.
      const ambiente = ambientePannello((f) => existsSync(join(AD_ROOT, "pannello", f)));
      if (ambiente.pronto) {
        passi.push(
          esegui("typecheck del Pannello", "npx", ["tsc", "--noEmit"], {
            cwd: join(AD_ROOT, "pannello"),
            timeout: 600_000,
          }),
        );
      } else {
        passi.push({
          nome: "typecheck del Pannello",
          comando: "npx tsc --noEmit",
          codice: 2,
          testa: [ambiente.motivo],
          coda: [`rimedio: ${ambiente.comando}`],
          fallito: false, // non blocca la consegna: non ha misurato, non ha bocciato
          cieco: true, // …ma si vede come ⚪ e va dichiarato nella PR: il verde non copre il Pannello
        });
      }
    }
  }

  const passiRotti = passi.filter((p) => p.fallito);
  const ciechi = passi.filter((p) => p.codice === 2);
  const ok = violazioniProve.length === 0 && passiRotti.length === 0;

  if (JSON_MODE) {
    console.log(JSON.stringify({ ok, violazioniProve, avvisi, ciechiProve, toccati, passi, aperti: aperti.length }, null, 2));
  } else {
    console.log("🚧 CANCELLO DI USCITA DEL LOTTO\n");
    console.log(`  Difetti aperti nel cantiere: ${aperti.length}\n`);
    console.log("  ── Le prove ──");
    if (!violazioniProve.length) {
      console.log("  ✅ nessuna prova nuova con un OR, orfana o condivisa alla cieca");
    } else {
      for (const v of violazioniProve) {
        const chi = v.ids ? v.ids.join(", ") : v.id;
        console.log(`  ❌ ${v.regola} — ${chi}`);
        console.log(`     ${v.motivo || v.spiega}`);
      }
    }
    for (const a of [...avvisi, ...ciechiProve]) console.log(`  ⚠️  ${a}`);
    if (toccati?.length) console.log(`  · difetti toccati da questo lotto: ${toccati.join(", ")}`);
    console.log("");
    if (passi.length) {
      console.log("  ── I guardiani ──");
      for (const p of passi) {
        console.log(`  ${p.fallito ? "❌" : p.cieco ? "⚪" : "✅"} ${p.nome} (exit ${p.codice})`);
        // Anche il cieco mostra il perché: senza, «non ho misurato» è indistinguibile da «passa».
        if (p.fallito || p.cieco) for (const r of p.coda) console.log(`     ${r}`);
      }
      console.log("");
    }
    const quantiCiechi = ciechi.length + ciechiProve.length;
    console.log(
      !ok
        ? "⛔ NON SI CONSEGNA: sistema i punti qui sopra e rilancia."
        : quantiCiechi
          ? "🟡 SI PUÒ CONSEGNARE, DICHIARANDO I BUCHI: tutto ciò che ho potuto misurare passa, ma le parti ⚪ qui sotto vanno scritte nella PR."
          : "✅ SI PUÒ CONSEGNARE.",
    );
    if (ciechi.length + ciechiProve.length) {
      console.log(`⚠️  ${ciechi.length + ciechiProve.length} controllo/i non ha potuto misurare: il verde non copre quella parte.`);
    }
  }

  if (!ok) process.exit(1);
  if (ciechi.length || ciechiProve.length) process.exit(2);
  process.exit(0);
}

// Eseguito direttamente (non importato dal test).
if (process.argv[1] && process.argv[1].endsWith("cancello-lotto.mjs")) main();
