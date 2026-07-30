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
    coda: ucciso ? [...righe.slice(-5), `⏱️ non ha finito in tempo (${opts.timeout || 300_000} ms): rosso, non cieco`] : righe.slice(-6),
    fallito: codice !== 0 && codice !== 2,
    cieco: codice === 2,
  };
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
  const tetti = leggiTetti();

  if (AGGIORNA_TETTI) {
    if (ciechiProve.length) {
      console.error(`cancello-lotto: ${ciechiProve[0]} → non abbasso un tetto che non ho misurato`);
      process.exit(2);
    }
    const nuovo = {
      prova_con_or: Math.min(conOr.length, tetti.prova_con_or ?? conOr.length),
      mutazione_mancante: Math.min(senzaMutazione.length, tetti.mutazione_mancante ?? senzaMutazione.length),
    };
    // Si FONDE con quello che c'è già: la prima versione riscriveva il file da zero e cancellava
    // le note (fra cui il perché il tetto non è zero). Un guardiano che perde le sue spiegazioni
    // lascia dietro un numero senza motivo — la cosa che questo cantiere cura.
    const { _mancante, _illeggibile, ...vecchio } = tetti;
    writeFileSync(TETTI, `${JSON.stringify({ ...vecchio, aggiornato: nowPiacenza(), ...nuovo }, null, 1)}\n`);
    console.log(`🚧 tetti aggiornati: prova_con_or = ${nuovo.prova_con_or} · mutazione_mancante = ${nuovo.mutazione_mancante}`);
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
  // `mutazione-mancante`: stesso trattamento. Il debito ereditato ha un tetto che scende; un difetto
  // che il lotto tocca ADESSO senza la sua mutazione non si consegna, punto — anche sotto il tetto.
  const tettoMut = tetti.mutazione_mancante ?? 0;
  const mutNelLotto = toccati ? senzaMutazione.filter((x) => toccati.includes(x.id)) : [];
  for (const x of mutNelLotto) {
    violazioniProve.push({
      regola: "mutazione-mancante",
      ids: [x.id],
      motivo: `${x.motivo} — rompi il fix in mutanti.json e pretendi il rosso (node cervello/non-vacuita.mjs)`,
    });
  }
  if (senzaMutazione.length > tettoMut) {
    violazioniProve.push({
      regola: "mutazione-mancante-oltre-il-tetto",
      ids: senzaMutazione.map((x) => x.id),
      motivo: `${senzaMutazione.length} prove mai rotte apposta contro un tetto di ${tettoMut}: il debito si è allargato`,
    });
  } else if (senzaMutazione.length < tettoMut) {
    avvisi.push(`prove senza mutazione scese da ${tettoMut} a ${senzaMutazione.length}: abbassa il tetto con --aggiorna-tetti`);
  } else if (senzaMutazione.length) {
    avvisi.push(`${senzaMutazione.length} prove ereditate mai rotte apposta (sotto il tetto): ${senzaMutazione.map((x) => x.id).join(", ")}`);
  }

  if (toccati === null) avvisi.push("non ho potuto confrontare col ramo pubblicato: il controllo «prova nuova» non ha misurato");
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
    passi.push(esegui("prove oneste", "node", ["cervello/prove-oneste.mjs"]));
    passi.push(esegui("spazzata dei fratelli", "node", ["cervello/spazzata-fratelli.mjs"]));
    // La guardia sul DELTA di questo lotto (30/7, Nicola: «trovi problemi che tu stesso hai creato»).
    // Sta qui e non in un comando a parte per la stessa ragione per cui questo cancello esiste: cinque
    // comandi da ricordare erano cinque occasioni di dimenticarne uno. Guarda solo le righe aggiunte,
    // quindi non porta debito storico dentro il cancello — nessun tetto da dichiarare.
    passi.push(esegui("sorvegliante del delta", "node", ["cervello/sorvegliante.mjs"]));
    passi.push(esegui("test del cervello", "node", ["cervello/test-cervello.mjs"], { timeout: 600_000 }));

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
