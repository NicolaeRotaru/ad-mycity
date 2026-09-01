#!/usr/bin/env node
// 📦 PACCHETTI CHE SI PESTANO — la prova del comando che divide un lotto in pacchetti.
//
// LA MALATTIA: «un piano di lavoro vuoto che esce verde». Il 28/8/2026 il collaudo ha bocciato
// cervello/pacchetti-lotto.mjs con due difetti bloccanti, e tutti e due avevano lo stesso sintomo:
// il comando diceva 0 (uscita 0), e chi leggeva capiva «nessun problema».
//   ① `--max abc` → Number("abc") = NaN → slice(0, NaN) = vuoto → 163 pacchetti da ZERO difetti,
//      «coperti 0», uscita 0. Chi riceveva quel piano non riparava niente e nessuno lo avvisava.
//   ② le collisioni erano cieche sulla macchina: confrontavo la CHIAVE del pacchetto (li' una
//      dimensione) con dei percorsi di file, quindi «zero sconfinamenti» SEMPRE. Ricalcolato a mano
//      dal collaudatore: 15 coppie di pacchetti condividevano un file.
//   ③ lo stesso file spezzato in «parte 1/2/3» finiva a tre squadre insieme, e il controllo lo
//      scartava apposta con `f !== mio`.
//   ④ una chiave di registro rinominata dava «Aperti: 0» con uscita 0: registro pieno e registro
//      illeggibile erano indistinguibili.
//
// COSA PROVA QUESTO FILE, eseguendo il comando vero su registri finti (cosi' i numeri non scadono):
//   ① un argomento storto esce 2 e non produce mai un piano
//   ② una chiave di registro cambiata di nome esce 2, non «Aperti: 0» verde
//   ③ nessun difetto si perde e nessuno viene contato due volte
//   ④ due pacchetti che condividono un file non finiscono nella stessa ondata
//   ⑤ la chiave di chiusura del sito e' quella normalizzata di referti-sito.mjs, non il grezzo
//
// NON-VACUITA' (provata, non dedotta): rimettendo `const MAX = Number(val("--max", 12))` senza il
// controllo di `numero()` torna rosso ①; togliendo il ramo `if (!Array.isArray(...)) cieco(...)`
// torna rosso ②; rimettendo il confronto sulle chiavi invece che sugli insiemi di file torna rosso ④.
import { mkdtempSync, mkdirSync, writeFileSync, copyFileSync, readFileSync, rmSync } from "fs";
import { execFileSync } from "child_process";
import { tmpdir } from "os";
import path from "path";
import { fileURLToPath } from "url";
import { chiaveProblema } from "../referti-sito.mjs";

const QUI = path.dirname(fileURLToPath(import.meta.url));
const CERVELLO = path.join(QUI, "..");
let rossi = 0;
const dico = (ok, cosa, dettaglio = "") => {
  console.log(`${ok ? "✅" : "❌"} ${cosa}${dettaglio ? ` — ${dettaglio}` : ""}`);
  if (!ok) rossi++;
};

// ── il banco: una radice finta con dentro il comando vero e due registri costruiti a mano ──────
const RADICE = mkdtempSync(path.join(tmpdir(), "pacchetti-"));
mkdirSync(path.join(RADICE, "cervello"), { recursive: true });
mkdirSync(path.join(RADICE, "MyCity-Vault/90-Memoria-AI/auto-coscienza"), { recursive: true });
// Il comando vero, piu' i moduli che importa: una copia che non li porta prova solo se stessa.
for (const f of ["pacchetti-lotto.mjs", "referti-sito.mjs", "scrivi-json.mjs", "casa-memoria.mjs", "scrittura-misura.mjs", "memoria-senza-perdite.mjs"]) {
  copyFileSync(path.join(CERVELLO, f), path.join(RADICE, "cervello", f));
}
const COMANDO = path.join(RADICE, "cervello/pacchetti-lotto.mjs");
const CASA_SITO = path.join(RADICE, "MyCity-Vault/90-Memoria-AI/auto-coscienza/radiografia-marketplace.json");

// 12 difetti su 3 file, costruiti perche' due pacchetti si TOCCHINO: i difetti di ProductCard
// citano anche la pagina del prodotto, che e' il territorio di un altro pacchetto.
const problemi = [];
for (let i = 1; i <= 7; i++) problemi.push({ dimensione: "frontend-ux", titolo: `  Difetto A${i} DELLA pagina  `, severita: i === 1 ? "bloccante" : "grave", file: "app/product/[id]/page.tsx:10", stato: "aperto", fix: "x" });
for (let i = 1; i <= 3; i++) problemi.push({ dimensione: "frontend-ux", titolo: `Difetto B${i}`, severita: "grave", file: "components/ProductCard.tsx:4 · app/product/[id]/page.tsx:99", stato: "aperto", fix: "x" });
for (let i = 1; i <= 2; i++) problemi.push({ dimensione: "performance", titolo: `Difetto C${i}`, severita: "minore", file: "lib/ordini/prezzi.ts:7", stato: "aperto", fix: "x" });
problemi.push({ dimensione: "qa-flussi", titolo: "Gia' chiuso, non deve entrare", severita: "grave", file: "lib/altro.ts:1", stato: "chiuso", fix: "x" });
const scriviCasa = (contenuto) => writeFileSync(CASA_SITO, JSON.stringify(contenuto));
scriviCasa({ problemi });

const gira = (args) => {
  try {
    return { uscita: 0, testo: execFileSync("node", [COMANDO, ...args], { encoding: "utf8", timeout: 20_000 }) };
  } catch (e) {
    // Un comando che non finisce non e' un verde e non deve appendere la prova: il ciclo infinito
    // di `--max 0` faceva restare qui il collaudo per sempre. Il timeout lo trasforma in un rosso.
    return { uscita: e.killed ? "non finisce" : e.status, testo: `${e.stdout || ""}${e.stderr || ""}` };
  }
};

// ① gli argomenti storti non producono un piano
for (const args of [["--sito", "--max", "abc"], ["--sito", "--max", "0"], ["--sito", "--quota", "abc"], ["--sito", "--quota"], ["--sitto"], ["--sito", "--macchina"], ["-macchina"], ["macchina"]]) {
  const r = gira(args);
  dico(r.uscita === 2 && !/📦 PACCHETTI/.test(r.testo), `argomento storto rifiutato: ${args.join(" ")}`, `uscita ${r.uscita}`);
}

// ② un registro che cambia forma e' cieco, non zero
scriviCasa({ problemiDelSito: problemi });
const cambiato = gira(["--sito"]);
dico(cambiato.uscita === 2, "registro con la chiave rinominata: uscita 2", `uscita ${cambiato.uscita}`);
dico(!/Aperti: 0/.test(cambiato.testo), "registro con la chiave rinominata: non dice «Aperti: 0»");
scriviCasa({ problemi });

// ②bis un registro con gli stati rinominati non e' «zero difetti aperti»: e' cieco
scriviCasa({ problemi: problemi.map((p) => ({ ...p, stato: p.stato === "aperto" ? "open" : p.stato })) });
const rinominati = gira(["--sito"]);
dico(rinominati.uscita === 2, "stati rinominati: uscita 2, non «Aperti: 0» verde", `uscita ${rinominati.uscita}`);
scriviCasa({ problemi: [] });
dico(gira(["--sito"]).uscita === 2, "registro vuoto: uscita 2");
scriviCasa({ problemi: ["ciao", "mondo"] });
dico(gira(["--sito"]).uscita === 2, "voci che non sono schede: uscita 2");
scriviCasa({ problemi });

// ②ter una dimensione che si chiama come una parola magica non fa morire il comando
scriviCasa({ problemi: problemi.map((p, i) => (i === 0 ? { ...p, dimensione: "__proto__" } : p)) });
const magica = gira(["--sito"]);
dico(magica.uscita === 0 && !/TypeError/.test(magica.testo), "una dimensione «__proto__» non lo fa morire", `uscita ${magica.uscita}`);
scriviCasa({ problemi });

// ③ + ④ + ⑤ sul piano vero, letto dal JSON
const piano = gira(["--sito", "--quota", "12", "--max", "5", "--scrivi"]);
dico(piano.uscita === 0, "il piano si calcola", `uscita ${piano.uscita}`);
const scritto = /Scritto: (\S+)/.exec(piano.testo);
if (!scritto) { dico(false, "il piano viene salvato con --scrivi"); }
else {
  const j = JSON.parse(readFileSync(path.join(RADICE, scritto[1]), "utf8"));
  const dentro = j.ondate.flat().flatMap((p) => p.difetti);
  dico(dentro.length === j.coperti, "i difetti nelle ondate sono quanti ne dichiara", `${dentro.length} contro ${j.coperti}`);
  dico(dentro.length === 12, "nessun difetto perso: 12 aperti, 12 nei pacchetti", `${dentro.length} su 12`);
  const chiavi = dentro.map((d) => d.chiave);
  dico(new Set(chiavi).size === chiavi.length, "nessun difetto contato due volte");
  dico(!chiavi.some((k) => /chiuso/i.test(k)), "il difetto gia' chiuso resta fuori");

  // ④ due pacchetti che si toccano non stanno nella stessa ondata
  const territori = (p) => new Set(p.difetti.flatMap((d) => String(d.dove).match(/[\w./@[\]-]+\.(tsx?|jsx?|sql|json|css|mjs|js|sh|md|ya?ml|svg|bats)/g) || []));
  let insieme = 0;
  for (const ondata of j.ondate) {
    for (let a = 0; a < ondata.length; a++) {
      for (let b = a + 1; b < ondata.length; b++) {
        const A = territori(ondata[a]), B = territori(ondata[b]);
        if ([...A].some((f) => B.has(f))) insieme++;
      }
    }
  }
  dico(insieme === 0, "nessuna coppia che condivide un file lavora nella stessa ondata", `${insieme} coppie sovrapposte`);
  dico(j.coppie_che_si_toccano.length > 0, "le coppie che si toccano vengono dichiarate", `${j.coppie_che_si_toccano.length} coppie`);

  // ⑤ la chiave di chiusura e' quella di casa, normalizzata
  const attesa = chiaveProblema(problemi[0]);
  dico(chiavi.includes(attesa), "la chiave di chiusura e' quella di referti-sito.mjs", `attesa «${attesa}»`);
  dico(!chiavi.includes(`${problemi[0].dimensione}|${problemi[0].titolo}`), "la chiave non e' il grezzo con spazi e maiuscole");
}

// ⑥ due pacchetti che non nominano nessun file non sono «disgiunti»: sono NON MISURATI, e non
// possono finire nella stessa ondata. Sulla macchina succede spesso, perche' li' il campo e' prosa.
const CASA_MACCHINA = path.join(RADICE, "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json");
const difetti = [];
for (const dim of ["prosa-uno", "prosa-due", "prosa-tre"]) {
  for (let i = 1; i <= 2; i++) {
    difetti.push({ id: `${dim}-${i}`, titolo: `Difetto ${dim} ${i}`, dimensione: dim, gravita: "grave", stato: "aperto",
      causa_radice: "una spiegazione a parole che non nomina nessun percorso", fix_proposto: "si sistema parlando" });
  }
}
writeFileSync(CASA_MACCHINA, JSON.stringify({ difetti }));
const piano2 = gira(["--macchina", "--quota", "99", "--scrivi"]);
const scritto2 = /Scritto: (\S+)/.exec(piano2.testo);
dico(piano2.uscita === 0 && !!scritto2, "il piano della macchina si calcola", `uscita ${piano2.uscita}`);
if (scritto2) {
  const j2 = JSON.parse(readFileSync(path.join(RADICE, scritto2[1]), "utf8"));
  const senzaFile = (p) => !p.difetti.some((d) => /[\w./@[\]-]+\.(tsx?|mjs|js|sh|json|sql|md)/.test(String(d.dove)));
  const doppie = j2.ondate.filter((o) => o.filter(senzaFile).length > 1).length;
  dico(doppie === 0, "due pacchetti senza territorio non stanno nella stessa ondata", `${doppie} ondate con due o piu`);
  dico(/non nominano nessun file/.test(piano2.testo), "i pacchetti senza territorio vengono dichiarati");
}

rmSync(RADICE, { recursive: true, force: true });
console.log(rossi === 0 ? "\n✅ il comando dei pacchetti regge" : `\n❌ ${rossi} prove rosse`);
process.exit(rossi === 0 ? 0 : 1);
