#!/usr/bin/env node
// 🐚 LE PROVE IN BASH CHE NESSUNO FA GIRARE — il buco detto come NUMERO. 🟢 Sola lettura.
//
// IL DIFETTO CHE CHIUDE (AR-693, clausola ②). In `cervello/test/` vivono ventinove prove scritte in
// bash. Girano solo se `bats` è installato sulla macchina, e non lo installa nessuno: né la CI, né
// il VPS, né il primo avvio di una sessione. In tutto il repo l'unica traccia è un PERMESSO
// (`Bash(npx bats:*)` in .claude/settings.json) — cioè l'autorizzazione a lanciarlo, che non è
// qualcuno che lo lancia.
//
// Il conto, misurato il 14/8 sullo stesso commit: senza bats **1 rosso su 243**; con bats **12**.
// Dieci fallimenti veri erano invisibili. Non perché qualcuno mentisse: perché la macchina che
// misura non aveva lo strumento per guardare.
//
// PERCHÉ UN NUMERO E NON UN ⚪. Il banco già dichiara le prove non eseguite una per una, e quello è
// giusto. Ma un ⚪ in fondo a un elenco di duecentoquaranta righe si scorre; «ventinove prove non le
// fa girare nessuno» no. La differenza fra un buco DETTO e un buco MISURATO è che il secondo ha un
// tetto: scende quando si cura e non risale mai. Aggiungere una trentesima prova in bash mentre
// nessuno esegue le altre ventinove è una violazione, non un contributo.
//
// COSA GUARDA, e perché non guarda il PATH. La domanda non è «su QUESTA macchina c'è bats?» — quella
// risposta cambia da computer a computer, e un tetto che dipende da chi lo lancia è un tetto che si
// abbassa da solo il giorno in cui qualcuno ha `bats` nella cache di npx, per poi bloccare tutti gli
// altri per sempre. La domanda è: **il repo dichiara qualcuno che le esegue?** Un passo di CI, una
// dipendenza installata, una riga di avvio di sessione. Finché la risposta è no, la risposta è no
// per tutti, ovunque, e il numero è lo stesso ovunque.
//
// Uso:
//   node cervello/debito-prove-bash.mjs
//   node cervello/debito-prove-bash.mjs --json
//
// Uscita (contratto guardiani, AR-322):
//   0 = nessun debito nuovo (sotto o pari al tetto, oppure un esecutore esiste davvero)
//   1 = il debito si è allargato: prove in bash aggiunte mentre nessuno le esegue
//   2 = non ho potuto misurare (cartella assente)

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT } from "./git-github.mjs";
// Quali file SONO prove in bash lo decide il banco che le esegue, non questo guardiano: due
// definizioni della stessa cosa sono due elenchi che si allontanano, ed è la malattia da cui nasce
// tutto AR-693 (le prove scritte e le prove eseguite che divergono senza che nessuno misuri).
import { trovaBats } from "./test-cervello.mjs";

const JSON_MODE = process.argv.includes("--json");
const CARTELLA = process.env.PROVE_BASH_DIR || join(AD_ROOT, "cervello/test");
const TETTI = process.env.TETTI_FILE || join(AD_ROOT, "cervello/tetti-lotto.json");

/**
 * Il testo delle impostazioni SENZA il blocco dei permessi.
 *
 * `"permissions": { … }` elenca ciò che una sessione è AUTORIZZATA a lanciare; `"hooks": { … }`
 * elenca ciò che parte da solo. Sono due cose diverse e finché il file veniva saltato per intero
 * erano la stessa: il gancio di avvio, che è un esecutore vero, non lo vedeva nessuno.
 *
 * Taglio a graffe bilanciate invece che con un'espressione: un blocco annidato (e `permissions` lo è,
 * dentro ci sta `allow: […]`) fa fermare una regex golosa al primo `}` sbagliato.
 */
export function senzaPermessi(testo = "") {
  const s = String(testo);
  const i = s.search(/"permissions"\s*:\s*\{/);
  if (i < 0) return s;
  const apertura = s.indexOf("{", i);
  let livello = 0;
  for (let k = apertura; k < s.length; k++) {
    if (s[k] === "{") livello++;
    else if (s[k] === "}") {
      livello--;
      if (livello === 0) return s.slice(0, i) + s.slice(k + 1);
    }
  }
  return s.slice(0, i); // graffe sbilanciate: meglio tagliare troppo che contare un permesso
}

/**
 * Il repo dichiara qualcuno che ESEGUE le prove in bash?
 *
 * Le forme che valgono, e sono tutte «qualcuno lo installa o lo lancia», mai «qualcuno è
 * autorizzato a lanciarlo»:
 *   · un passo di CI che installa bats (`npm i -g bats`, `apt-get install bats`, `bats-core/bats-action`)
 *   · un passo di CI o di avvio che lo esegue (`bats cervello/test/...`, `npx bats ...`)
 *   · una dipendenza dichiarata in un package.json (`"bats"` fra le devDependencies)
 *
 * ⚠️ Il permesso `Bash(npx bats:*)` in `.claude/settings.json` NON conta, ed è il cuore del difetto:
 * è un'autorizzazione, non un esecutore. Era l'unica traccia di bats in tutto il repo mentre
 * ventinove prove non le faceva girare nessuno — cioè la prova che «esiste una traccia» e «qualcuno
 * lo fa» sono due cose diverse.
 *
 * Pura: la prova la esercita su testi finti e sui file veri di questa casa.
 *
 * @param fonti [{nome, testo}]  workflow di CI, package.json, script di avvio
 */
export function esecutoreDichiarato(fonti = []) {
  const dove = [];
  for (const f of fonti || []) {
    let testo = String(f?.testo || "");
    const nome = String(f?.nome || "");
    // 🔧 L'ATTREZZO NON È IL SUO PROPRIO ESECUTORE — stessa regola del permesso, altra faccia.
    //
    // `cervello/installa-bats.sh` installa bats: se contasse come esecutore di sé stesso, il
    // guardiano direbbe «qualcuno le esegue» anche il giorno in cui nessuno lo chiama più — cioè
    // esattamente il difetto che questo file esiste per misurare, riprodotto dalla sua stessa cura
    // (è AR-809: un cancello nuovo che nasce scollegato da chi agisce). Vale l'esecutore che lo
    // CHIAMA, mai il file che lo contiene.
    if (/(^|\/)installa-bats\.(sh|bash)$/.test(nome)) continue;
    // Le impostazioni non si saltano più per intero: dentro convivono i PERMESSI (che non sono un
    // esecutore, ed è il cuore del difetto) e i GANCI, che invece eseguono davvero un comando a
    // ogni avvio di sessione. Si toglie il blocco dei permessi e si guarda il resto.
    if (/\.claude\/settings(\.local)?\.[a-z]+$/.test(nome)) testo = senzaPermessi(testo);
    if (/bats-core\/bats-action/.test(testo)) dove.push(`${nome}: usa l'azione bats-core/bats-action`);
    else if (/installa-bats\.(sh|bash)/.test(testo)) dove.push(`${nome}: chiama cervello/installa-bats.sh`);
    else if (/(npm|yarn|pnpm)\s+(i|install|add)\s+(-g\s+|--global\s+)?[^\n]*\bbats\b/.test(testo)) dove.push(`${nome}: installa bats`);
    else if (/\bapt(-get)?\s+install[^\n]*\bbats\b/.test(testo)) dove.push(`${nome}: installa bats col gestore di pacchetti`);
    else if (/"(dev)?[Dd]ependencies"[\s\S]*?"bats"\s*:/.test(testo)) dove.push(`${nome}: bats fra le dipendenze`);
    // `- run: bats …` in YAML: il trattino della lista sta prima di `run:`, e senza di lui questa
    // riga non faceva match — cioè un passo di CI che ESEGUE le prove non veniva riconosciuto.
    else if (/(^|\n)\s*(-\s*)?(run:\s*)?(npx\s+(--yes\s+)?)?bats\s+[^\n]*\.bats/.test(testo)) dove.push(`${nome}: esegue le prove con bats`);
  }
  return { installato: dove.length > 0, dove };
}

/**
 * Il verdetto col tetto. Debito ereditato = si CONTA; debito nuovo = si BLOCCA.
 *
 * Se un esecutore esiste, il numero non è più un debito: quelle prove le fa girare qualcuno, e i
 * loro eventuali rossi sono rossi veri che il banco già dichiara. Il tetto smette di servire.
 */
export function verdettoDebitoBash({ quante = 0, esecutore = { installato: false, dove: [] }, tetto = null } = {}) {
  if (esecutore.installato) {
    return { esito: "ok", motivo: `${quante} prove in bash, e qualcuno le esegue: ${esecutore.dove.join(" · ")}` };
  }
  if (tetto === null || tetto === undefined) {
    return { esito: "debito", motivo: `${quante} prove in bash che non fa girare nessuno (nessun tetto ancora fissato)` };
  }
  if (quante > tetto) {
    return {
      esito: "violazione",
      motivo:
        `prove in bash senza esecutore salite da ${tetto} a ${quante}: una prova in più mentre nessuno fa girare le altre ` +
        `non è copertura, è un file. Installa bats dove il banco gira davvero (CI + VPS + avvio di sessione) o non aggiungerne.`,
    };
  }
  if (quante < tetto) return { esito: "debito", motivo: `prove in bash senza esecutore scese da ${tetto} a ${quante}: abbassa il tetto in cervello/tetti-lotto.json` };
  return {
    esito: "debito",
    motivo: `${quante} prove in bash non le fa girare nessuno (tetto ${tetto}): esistono, sono vere, e oggi non misurano niente — AR-693 clausola ①`,
  };
}

/**
 * Dove POTREBBE essere dichiarato un esecutore, derivato dal repo invece che elencato a mano.
 *
 * Un elenco scritto a mano è la malattia `perimetro-dedotto-non-misurato`: nasce guardando i file
 * che esistono oggi, resta verde per sempre, e il giorno in cui qualcuno aggiunge un workflow o uno
 * script di avvio nuovo il guardiano non lo cerca nemmeno. Qui si guarda per FORMA — tutti i
 * workflow, tutti i hook, tutti gli script di shell del cervello, tutti i `package.json` del primo
 * livello — e se domani nasce un workflow nuovo entra da solo nel perimetro.
 */
export function fontiPossibili(radice, { ceE = existsSync, elenca = readdirSync, tipo = statSync } = {}) {
  const fuori = [];
  const dentro = (rel, ammetti) => {
    const dir = join(radice, rel);
    if (!ceE(dir)) return;
    let voci = [];
    try {
      voci = elenca(dir);
    } catch {
      return;
    }
    for (const v of voci) {
      const r = `${rel}/${v}`;
      try {
        if (!tipo(join(radice, r)).isFile()) continue;
      } catch {
        continue;
      }
      if (!ammetti || ammetti(v)) fuori.push(r);
    }
  };
  dentro(".github/workflows");
  dentro(".claude/hooks");
  // Le impostazioni: dentro ci sono i GANCI di avvio di sessione, che eseguono un comando davvero.
  // Si guardano col blocco dei permessi tolto (senzaPermessi) — un'autorizzazione non è un esecutore.
  for (const f of [".claude/settings.json", ".claude/settings.local.json"]) {
    if (ceE(join(radice, f))) fuori.push(f);
  }
  // Gli script di shell del cervello e del VPS: è lì che vive l'avvio di sessione e il giro.
  const eShell = (v) => /\.(sh|bash|zsh)$/.test(v);
  dentro("cervello", eShell);
  dentro("cervello/vps", eShell);
  // I `package.json`: quello di casa e quelli dei sottoprogetti al primo livello.
  if (ceE(join(radice, "package.json"))) fuori.push("package.json");
  let primoLivello = [];
  try {
    primoLivello = elenca(radice);
  } catch {
    primoLivello = [];
  }
  for (const v of primoLivello) {
    if (v.startsWith(".") || v === "node_modules") continue;
    const p = `${v}/package.json`;
    if (ceE(join(radice, p))) fuori.push(p);
  }
  return fuori;
}

function main() {
  if (!existsSync(CARTELLA)) {
    console.error(`debito-prove-bash: ${CARTELLA} assente → non posso misurare`);
    process.exit(2);
  }
  const prove = trovaBats(readdirSync(CARTELLA));
  const fonti = [];
  for (const rel of fontiPossibili(AD_ROOT)) {
    try {
      fonti.push({ nome: rel, testo: readFileSync(join(AD_ROOT, rel), "utf8") });
    } catch {
      /* una fonte illeggibile non è un esecutore trovato */
    }
  }
  const esecutore = esecutoreDichiarato(fonti);
  let tetto = null;
  const ciechi = [];
  try {
    const t = JSON.parse(readFileSync(TETTI, "utf8"));
    tetto = Object.hasOwn(t, "prove_bash_senza_esecutore") ? Number(t.prove_bash_senza_esecutore) : null;
  } catch {
    ciechi.push("tetti-lotto.json illeggibile: il numero c'è, il confronto col tetto no");
  }
  const v = verdettoDebitoBash({ quante: prove.length, esecutore, tetto });

  if (JSON_MODE) {
    console.log(
      JSON.stringify({ ok: v.esito !== "violazione", esito: v.esito, motivo: v.motivo, quante: prove.length, tetto, esecutore, fonti_guardate: fonti.length, prove, ciechi }, null, 2),
    );
  } else {
    console.log("🐚 PROVE IN BASH E CHI LE FA GIRARE\n");
    for (const c of ciechi) console.log(`  ⚪ ${c}`);
    console.log(`  · prove in bash in ${CARTELLA.replace(`${AD_ROOT}/`, "")}: ${prove.length}`);
    console.log(`  · posti guardati per trovare un esecutore: ${fonti.length}`);
    console.log(`  · esecutore dichiarato dal repo: ${esecutore.installato ? esecutore.dove.join(" · ") : "NESSUNO"}`);
    console.log(`\n${v.esito === "violazione" ? "⛔" : v.esito === "debito" ? "⚠️ " : "✅"} ${v.motivo}`);
    if (!esecutore.installato) {
      console.log(
        "   Come si chiude davvero (clausola ①): un passo `npm i -g bats` + `BATS_BIN=$(command -v bats)` nei\n" +
          "   workflow di CI del cervello e del cancello, e la stessa riga all'avvio del VPS.",
      );
    }
  }
  process.exit(v.esito === "violazione" ? 1 : 0);
}

if (process.argv[1] && process.argv[1].endsWith("debito-prove-bash.mjs")) main();
