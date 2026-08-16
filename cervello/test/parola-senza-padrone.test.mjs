#!/usr/bin/env node
// 🏷️ UNA PAROLA SENZA PADRONE — AR-659 · AR-684 · AR-671 · AR-670.
//
// LA RADICE, una sola per quattro difetti: **nessun file dichiara cosa significa la parola**, quindi
// ogni pezzo di codice che ha avuto bisogno della risposta se l'è riscritta. Non è un totale che
// invecchia — è che la parola non ha un proprietario, e finché restano due definizioni il prossimo
// chiamante sbaglierà di nuovo in buona fede.
//
// Le due parole, e cosa costavano:
//   · «azione vera» — cinque posti, quattro nomi, e due file con lo STESSO nome e contenuti diversi.
//     È la domanda da cui dipende la difesa contro il doppio invio: un tipo fuori lista torna
//     riaccodabile da ogni porta, cioè spedibile due volte senza la firma di Nicola (AR-659).
//   · «difetto aperto» — la rotta contava `stato === "aperto"`, il componente `stato !== "chiuso"`,
//     e la stessa pagina mostrava 225 in una frase e 281 in un badge (AR-670). In mezzo, 56 schede
//     `da-riverificare` che non entravano in NESSUN totale (AR-684), e i difetti senza data di
//     nascita che uscivano in silenzio dal confronto storico — sempre dalla parte comoda (AR-671).
//
// COSA PROVA QUESTO FILE, eseguendo le definizioni invece di cercarle:
//   ① `eUnAttoVero` risponde, e la copia per la shell è GENERATA dal modulo (bash eseguito davvero)
//   ② le cinque copie sparse dichiarano esattamente la lista del modulo: non possono più divergere
//   ③ la somma dei rami del conto FA il totale, sul cantiere vero e su uno stato mai visto prima
//   ④ un difetto senza data di nascita non sparisce: viene contato come IGNOTO
//   ⑤ le due porte del Pannello (rotta e componente) rispondono lo stesso numero sul cantiere vero
//
// NON-VACUITÀ (verificata rompendo il fix apposta, non dedotta):
//   · in `cervello/atti-veri.mjs`, riportando `altri` dentro nessun ramo (togliendo `else altri++`)
//     i casi di ③ diventano ROSSI: è precisamente il buco in cui sparivano i 56 `da-riverificare`.
//   · togliendo il ramo `if (nato == null) { if (!giaChiuso) ignoti++; continue; }` e rimettendo il
//     vecchio `continue` secco, il caso ④ diventa ROSSO.

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  ATTI_VERI,
  TIPI_CON_LE_MANI,
  apertiAllaData,
  contaDifetti,
  eChiusa,
  eUnAttoVero,
  haLeMani,
  shAttiVeri,
  sommaTorna,
} from "../atti-veri.mjs";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const leggi = (rel) => readFileSync(join(REPO, rel), "utf8");

// I moduli .ts del Pannello si importano diretti (Node 22). In cima, non dentro un caso: un
// `await` dentro `prova()` girerebbe dopo il conteggio e un `1 = 2` stamperebbe «pass» (AR-694).
const pannello = await import(join(REPO, "pannello/src/lib/cantiere-snello.ts"));

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

// ═══ ① «azione vera»: la risposta, e la copia per la shell generata dal modulo ═══════════════════

prova("① un atto vero è un atto vero comunque arrivi: stringa nuda o lavoro intero", () => {
  assert.equal(eUnAttoVero("esegui-azione"), true);
  assert.equal(eUnAttoVero({ tipo: "proposta" }), true);
  assert.equal(eUnAttoVero({ tipo: " esegui-azione " }), true, "gli spazi attorno non cambiano cosa tocca il mondo");
  assert.equal(eUnAttoVero("giro"), false);
  assert.equal(eUnAttoVero(""), false);
  assert.equal(eUnAttoVero(null), false);
  assert.equal(eUnAttoVero({ tipo: "esegui" }), false, "un pezzo di nome non è il nome");
});

prova("① «tocca il mondo» e «aziona le mani» restano due domande separate, con due nomi", () => {
  // Il nome uguale su liste diverse è peggio di due liste diverse: chi legge crede di aver capito.
  assert.deepEqual([...TIPI_CON_LE_MANI], ["esegui-azione"]);
  assert.equal(haLeMani("proposta"), false, "una proposta non aziona le mani, ma resta un atto vero");
  assert.equal(eUnAttoVero("proposta"), true);
  assert.notDeepEqual([...ATTI_VERI], [...TIPI_CON_LE_MANI], "se diventassero uguali, il nome separato non servirebbe più");
});

prova("① la copia per la shell è GENERATA: quella su disco è identica a quella del modulo", () => {
  // Una copia scritta a mano è la malattia che stiamo curando, spostata di un file. Cambiare
  // ATTI_VERI e non rigenerare deve diventare rosso QUI, non fra tre settimane su un lavoro vero.
  assert.equal(leggi("cervello/atti-veri.sh"), shAttiVeri(), "rigenera: node cervello/atti-veri.mjs --bash > cervello/atti-veri.sh");
});

prova("① la funzione bash risponde come quella JS, sulla stessa tabella di casi", () => {
  // Bash eseguito davvero, non cercato con un grep: è l'unico modo di sapere che la copia FUNZIONA.
  const casiTipo = ["esegui-azione", "proposta", "giro", "supervisione", ""];
  const script = `. "${join(REPO, "cervello/atti-veri.sh")}"\n` +
    casiTipo.map((t) => `if _e_un_atto_vero "${t}"; then echo si; else echo no; fi`).join("\n");
  const uscita = execFileSync("bash", ["-c", script], { encoding: "utf8" }).trim().split("\n");
  const atteso = casiTipo.map((t) => (eUnAttoVero(t) ? "si" : "no"));
  assert.deepEqual(uscita, atteso, `bash e JS devono dare lo stesso verdetto: ${JSON.stringify(casiTipo)}`);
});

// ═══ ② le cinque copie sparse sono PINZATE al padrone ════════════════════════════════════════════

/** I nomi dichiarati da una riga tipo `const X = ["a", "b"]`, presi dal codice vero. */
function elencoDaCodice(rel, re) {
  const m = re.exec(leggi(rel));
  assert.ok(m, `${rel}: non trovo più la dichiarazione — spostata o rinominata?`);
  return [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
}

prova("② i tre elenchi in JS/TS dichiarano ESATTAMENTE la lista del modulo", () => {
  // AR-659 resta aperto (i cinque punti non IMPORTANO ancora il modulo), ma da adesso il padrone
  // c'è: chi aggiunge un sesto tipo in un posto solo trova questo rosso.
  const punti = {
    "cervello/sentinella-lavori.mjs": /const TIPI_AZIONE = \[([^\]]+)\]/,
    "cervello/pulisci-coda.mjs": /const TIPI_PROTETTI = \[([^\]]+)\]/,
    "pannello/src/lib/recupero-lavoro.ts": /TIPI_AZIONE_REALE = \[([^\]]+)\]/,
  };
  for (const [file, re] of Object.entries(punti)) {
    const dichiarato = elencoDaCodice(file, re).sort();
    assert.deepEqual(dichiarato, [...ATTI_VERI].sort(), `${file} dichiara una lista diversa da cervello/atti-veri.mjs`);
  }
});

prova("② i due `case` in bash dichiarano ESATTAMENTE la lista del modulo", () => {
  for (const file of ["cervello/worker.sh", "cervello/lib-recupero.sh"]) {
    const m = /case " ([^"]+) " in/.exec(leggi(file));
    assert.ok(m, `${file}: il case degli atti veri non c'è più`);
    assert.deepEqual(m[1].split(/\s+/).sort(), [...ATTI_VERI].sort(), `${file} protegge una lista diversa`);
  }
});

prova("② retry-policy tiene la sua lista corta, e il modulo la nomina apposta", () => {
  const m = /TIPI_AZIONE_REALE = new Set\(\[([^\]]+)\]\)/.exec(leggi("cervello/retry-policy.mjs"));
  assert.ok(m, "retry-policy: la dichiarazione non c'è più");
  const dichiarato = [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
  assert.deepEqual(dichiarato, [...TIPI_CON_LE_MANI], "lì la domanda è «quale tipo aziona le mani», ed è un'altra");
});

// ═══ ③ «quanti difetti»: la somma dei rami DEVE fare il totale ═══════════════════════════════════

prova("③ sul cantiere VERO la somma dei rami fa il totale, e i da-riverificare non spariscono", () => {
  const vero = JSON.parse(leggi("MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json"));
  const c = contaDifetti(vero.difetti);
  assert.equal(c.letto, true);
  assert.equal(c.chiusi + c.aperti + c.in_corso + c.da_riverificare + c.altri, c.totale, "un ramo si è perso per strada");
  assert.equal(c.da_fare, c.totale - c.chiusi);
  assert.equal(sommaTorna(c), true);
  // Il fatto che ha generato AR-684: le schede del terzo stato esistono, e sono tante.
  assert.ok(c.da_riverificare > 0, "se un giorno saranno zero questa riga va tolta, non commentata");
  assert.equal(c.da_fare, c.aperti + c.in_corso + c.da_riverificare + c.altri, "«da fare» non è «aperto + in corso»");
});

prova("③ uno stato mai visto prima NON sparisce: finisce in `altri` e la somma torna lo stesso", () => {
  const c = contaDifetti([
    { stato: "chiuso" },
    { stato: "aperto" },
    { stato: "da-riverificare" },
    { stato: "in-corso" },
    { stato: "in-ferie" }, // il sesto stato che nascerà un giorno
    {}, // e la scheda senza stato
  ]);
  assert.equal(c.totale, 6);
  assert.equal(c.altri, 2, "lo stato sconosciuto e quello assente non sono difetti risolti");
  assert.equal(c.chiusi + c.aperti + c.in_corso + c.da_riverificare + c.altri, c.totale);
  assert.equal(c.da_fare, 5, "chiuso è uno solo: tutto il resto è lavoro");
  assert.equal(c.per_stato["in-ferie"], 1, "l'etichetta nuova si vede per nome, non si nasconde in un totale");
});

prova("③ non letto NON è zero: senza lista i conti restano `null` e il motivo viaggia col dato", () => {
  for (const cieco of [null, undefined, "boh", 42, { difetti: [] }]) {
    const c = contaDifetti(cieco);
    assert.equal(c.letto, false, `${JSON.stringify(cieco)} non è una lista: non si conta`);
    assert.equal(c.totale, null);
    assert.equal(c.da_fare, null);
    assert.ok(String(c.motivo).length > 10, "il motivo della cecità deve arrivare a chi decide");
    assert.equal(sommaTorna(c), null, "su un cieco non si emette un verdetto");
  }
  assert.equal(contaDifetti([]).letto, true, "una lista vuota davvero letta è invece un fatto: zero difetti");
});

// ═══ ④ i difetti senza data di nascita: dichiarati ignoti, non buttati ═══════════════════════════

prova("④ un difetto senza data di nascita non esce dalla statistica: è un IGNOTO", () => {
  const t = Date.parse("2026-08-01");
  const lista = [
    { id: "a", nato: "2026-07-01" }, // aperto da prima: conta
    { id: "b", nato: "2026-09-01" }, // non ancora nato: non conta
    { id: "c", nato: "2026-07-01", chiuso_il: "2026-07-15" }, // già chiuso: non conta
    { id: "d" }, // senza data e non chiuso: IGNOTO, non zero
    { id: "e", nato: "boh" }, // data illeggibile: stessa cosa
    { id: "f", chiuso_il: "2026-07-02" }, // senza nascita ma già chiuso: non è un dubbio
  ];
  const r = apertiAllaData(lista, t);
  assert.equal(r.conteggio, 1, "solo «a» era aperto e collocabile a quella data");
  assert.equal(r.ignoti, 2, "«d» ed «e» non si sanno collocare: vanno detti, non scartati");
  // Il vecchio comportamento (`if (nato == null) return false`) dava 1 e ZERO ignoti: il numero
  // sembrava esatto e sbagliava sempre nella direzione ottimista.
});

prova("④ senza una data valida non si inventa un conto: si dichiara cieco", () => {
  const r = apertiAllaData([{ id: "a", nato: "2026-07-01" }], NaN);
  assert.equal(r.letto, false);
  assert.equal(r.conteggio, null);
});

prova("④ il referto della salute onesta dichiara il terzo stato e il proprio margine", () => {
  const out = execFileSync("node", [join(REPO, "cervello/salute-onesta.mjs"), "--json"], { encoding: "utf8" });
  const r = JSON.parse(out);
  const vero = JSON.parse(leggi("MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json"));
  const c = contaDifetti(vero.difetti);
  assert.equal(r.cantiere_aperti_ora, c.da_fare, "«aperti ora» è tutto ciò che non è chiuso, non una somma di stati previsti");
  assert.equal(r.cantiere_da_riverificare, c.da_riverificare, "il terzo stato ha un numero suo (AR-684)");
  assert.equal(r.cantiere_senza_data_nascita, c.senza_data_nascita);
  assert.equal(r.cantiere_letto, true);
  // AR-671 — il margine si conta QUI, senza chiedere niente al modulo. È il margine di un confronto
  // ALL'INDIETRO, quindi la domanda è «quante schede non so collocare a QUELLA data»: senza data di
  // nascita, e non ancora chiuse allora. Una scheda chiusa ieri era aperta una settimana fa, e va
  // contata: guardare invece «non chiuse ADESSO» dava lo stesso numero solo finché non si chiudeva
  // niente — questo lotto ne ha chiuse 61 e i due conti si sono separati (2 contro 15).
  const giorno = (iso) => {
    const t = Date.parse(String(iso ?? "").slice(0, 10));
    return Number.isNaN(t) ? null : t;
  };
  const vive = vero.difetti.filter(Boolean);
  const note = vive.map((d) => giorno(d.chiuso_il) ?? giorno(d.nato)).filter((x) => x != null);
  const settimanaFa = Math.max(...note) - 7 * 86400000;
  const margine = vive.filter((d) => {
    const chiuso = giorno(d.chiuso_il);
    return giorno(d.nato) == null && !(chiuso != null && chiuso <= settimanaFa);
  }).length;
  assert.equal(r.burn_down_margine, margine, "il confronto storico deve dire di quanto può sbagliare, e il numero è questo");
  // E il margine non può essere più piccolo di quelle che ancora oggi non so collocare: se lo fosse,
  // ne starebbe buttando via.
  const apertiSenzaNascita = vive.filter(
    (d) => String(d.stato ?? "").trim() !== "chiuso" && giorno(d.nato) == null,
  ).length;
  assert.ok(r.burn_down_margine >= apertiSenzaNascita, `margine ${r.burn_down_margine} < ${apertiSenzaNascita} non collocabili di oggi`);
});

// ═══ ⑤ le due porte del Pannello rispondono lo stesso numero ═════════════════════════════════════

prova("⑤ la definizione del cervello e quella del Pannello danno lo STESSO numero sul cantiere vero", () => {
  const vero = JSON.parse(leggi("MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json"));
  const mio = contaDifetti(vero.difetti);
  const suo = pannello.contaDifetti(vero.difetti);
  assert.equal(suo.totale, mio.totale);
  assert.equal(suo.chiusi, mio.chiusi);
  assert.equal(suo.da_fare, mio.da_fare, "due case per la stessa parola, e devono dire la stessa cosa");
  // E il conto vecchio — `stato === "aperto"` — è DAVVERO diverso: è il difetto, misurato.
  const alVecchioModo = vero.difetti.filter((d) => d && d.stato === "aperto").length;
  assert.notEqual(alVecchioModo, mio.da_fare, `contando solo «aperto» ne restavano fuori ${mio.da_fare - alVecchioModo}`);
});

prova("⑤ `eChiusa` e `eChiuso` concordano su ogni stato che esiste davvero", () => {
  for (const d of [{ stato: "chiuso" }, { stato: "aperto" }, { stato: "da-riverificare" }, { stato: "in-corso" }, { stato: "Chiuso" }, {}, { stato: null }, { stato: "" }]) {
    assert.equal(eChiusa(d), pannello.eChiuso(d), `disaccordo su ${JSON.stringify(d)}`);
  }
  // E su TUTTE le schede del cantiere vero, una per una: è lì che il disaccordo costerebbe.
  const vero = JSON.parse(leggi("MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json"));
  for (const d of vero.difetti.filter(Boolean)) {
    assert.equal(eChiusa(d), pannello.eChiuso(d), `disaccordo sulla scheda ${d.id}`);
  }
});

prova("⑤ l'UNICO punto in cui le due divergono è dichiarato — e il Pannello si contraddice da solo", () => {
  // Trovato da questa prova, non ricordato. `eChiuso` del Pannello NON toglie gli spazi, ma il suo
  // stesso `contaDifetti` li toglie per fare `per_stato`. Su una scheda scritta `" chiuso "` la
  // stessa funzione la conta chiusa in una colonna e da fare nel totale. Qui la regola giusta è
  // togliere gli spazi (uno spazio in un JSON è un refuso, non un altro stato), quindi le due
  // divergono APPOSTA finché `pannello/src/lib/cantiere-snello.ts` — che non è di questa corsia —
  // non viene allineato. Il giorno che lo sarà, questo caso diventa rosso e l'esenzione va tolta.
  const conSpazi = { stato: " chiuso " };
  assert.equal(eChiusa(conSpazi), true, "per il cervello uno spazio non cambia lo stato");
  assert.equal(pannello.eChiuso(conSpazi), false, "se il Pannello è stato allineato, togli questa esenzione");
  const c = pannello.contaDifetti([conSpazi]);
  assert.equal(c.per_stato.chiuso, 1, "…e intanto la stessa funzione la mette fra le chiuse");
  assert.equal(c.chiusi, 0, "…ma non la conta chiusa: è la contraddizione, misurata");
});

prova("⑤ la scheda della Cabina non rifà più il filtro a mano sui difetti", () => {
  const src = leggi("pannello/src/components/cervello/RadiografiaDiSe.tsx");
  assert.match(src, /import \{ contaDifetti, eChiuso \} from "@\/lib\/cantiere-snello"/, "il componente deve passare dalla porta unica");
  assert.doesNotMatch(src, /difetti\.filter\(\(x\) => x\.stato !== "chiuso"\)/, "il filtro a mano sui difetti è tornato");
  assert.doesNotMatch(src, /difetti\.filter\(\(x\) => x\.stato === "chiuso"\)/, "il filtro a mano sui chiusi è tornato");
});

prova("⑤ nel Pannello i punti che contano ancora a mano sono DICHIARATI, e non ne nascono altri", () => {
  // Il passo che quasi tutti saltano: cercare l'ATTO, non il proprio fix. Questi due restano, e il
  // perché è scritto — un'esenzione si discute, un'omissione no perché nessuno la vede.
  const restano = {
    // Non è mio territorio in questo lotto: la card della Plancia conta i non chiusi a mano.
    "pannello/src/components/MacchinaHomeCard.tsx": 1,
    // È un'altra domanda (i FINDINGS di una radiografia, non le schede del cantiere) e la sua riga
    // è pinzata carattere per carattere da cervello/test/radiografia-snella.test.mjs.
    "pannello/src/components/cervello/RadiografiaDiSe.tsx": 1,
  };
  const daGuardare = [
    "pannello/src/components/MacchinaHomeCard.tsx",
    "pannello/src/components/cervello/RadiografiaDiSe.tsx",
    "pannello/src/app/api/memoria/auto-radiografia/route.ts",
    "pannello/src/app/api/memoria/salute-onesta/route.ts",
    "pannello/src/lib/cantiere-snello.ts",
  ];
  for (const f of daGuardare) {
    const quanti = (leggi(f).match(/\.stato (?:!==|===) "chiuso"|\.stato === "aperto"/g) || []).length;
    assert.equal(quanti, restano[f] ?? 0, `${f}: ${quanti} filtri a mano, ne erano dichiarati ${restano[f] ?? 0}`);
  }
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
