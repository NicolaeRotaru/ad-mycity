#!/usr/bin/env node
// AR-211 / AR-212 — la memoria non deve dire a Nicola cose diverse da quelle che contiene.
//
// Due bloccanti, una radice: **un numero plausibile non viene mai messo in dubbio.**
//
//  · AR-211 — `coerenza-fatti.mjs` scriveva `esito: "ok"` («memoria coerente») avendo letto ZERO file.
//    Il guardiano scansiona solo quando c'è una «caccia» aperta, cioè un fatto appena cambiato da
//    propagare; a cacce zero non legge niente e dava comunque il verde. È nato per un caso preciso —
//    propagare un valore CAMBIATO — ed è stato letto da tutti come se misurasse la coerenza dello
//    stato corrente. Un verde comprato a credito.
//
//  · AR-212 — il giro scriveva `domande_bloccanti` mentre il Pannello legge `domande_per_nicola`.
//    Misurato il 27/7 alle 23:11: **TRE domande invisibili in Cabina**, una sul bando PI26 in
//    scadenza fra tre giorni. Nessuno se n'era accorto perché «nessuna domanda» è uno stato normale:
//    il numero sbagliato era plausibile, quindi non ha fatto rumore.
//
// Qui si eseguono le funzioni e i guardiani VERI.

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

/** Il rapporto del validatore. Esce ≠0 quando trova violazioni — che è il caso normale mentre un
 *  difetto è aperto — quindi lo stdout va letto lo stesso, non solo quando è tutto verde. */
function rapportoContratti() {
  try {
    return JSON.parse(execFileSync("node", [join(REPO, "cervello/valida-contratti.mjs"), "--json"], { cwd: REPO, encoding: "utf8" }));
  } catch (e) {
    return JSON.parse(String(e.stdout || "{}"));
  }
}

// ── AR-211: il verde comprato a credito ──────────────────────────────────────
prova("il caso che ha rotto: zero file letti NON può dare «ok»", () => {
  const src = readFileSync(join(REPO, "cervello/coerenza-fatti.mjs"), "utf8");
  assert.doesNotMatch(
    src,
    /esito: incoerenze\.length \? "incoerenze" : "ok",/,
    "l'esito non può essere «ok» senza guardare quanti file sono stati letti",
  );
  assert.match(src, /fileScansionati > 0 \? "ok" : "non_verificato"/, "un verde si dà solo dopo aver letto qualcosa");
});

prova("«non_verificato» non è un rosso: è l'assenza di una misura, e lo dice", () => {
  // La distinzione conta: se fosse un rosso, il guardiano fallirebbe a ogni giro senza cacce aperte
  // (cioè quasi sempre) e verrebbe disattivato entro la settimana. Deve dire la verità, non allarmare.
  const src = readFileSync(join(REPO, "cervello/coerenza-fatti.mjs"), "utf8");
  assert.match(src, /NON VERIFICATO/, "il messaggio deve spiegare che non è stato letto nulla");
  assert.match(src, /copertura: fileScansionati/, "quanti file ha letto dev'essere un dato, non un sottinteso");
});

prova("il guardiano vero, eseguito adesso, non mente sul proprio esito", () => {
  // Sul cantiere reale: se ha letto 0 file l'esito NON dev'essere "ok".
  const out = execFileSync("node", [join(REPO, "cervello/coerenza-fatti.mjs")], { cwd: REPO, encoding: "utf8" });
  const rep = JSON.parse(readFileSync(join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/coerenza-fatti.json"), "utf8"));
  if ((rep.copertura ?? rep.file_scansionati ?? 0) === 0) {
    assert.equal(rep.esito, "non_verificato", `ha letto 0 file ma dichiara "${rep.esito}"`);
    assert.match(out, /NON VERIFICATO/);
  } else {
    assert.ok(["ok", "incoerenze"].includes(rep.esito), `esito inatteso: ${rep.esito}`);
  }
});

// ── AR-212: le domande che spariscono dietro un sinonimo ─────────────────────
prova("il caso che ha rotto: il contratto VIETA gli alias che spengono informazione", () => {
  const src = readFileSync(join(REPO, "cervello/valida-contratti.mjs"), "utf8");
  for (const alias of ["domande_bloccanti", "errori_giro"]) {
    assert.match(src, new RegExp(alias), `l'alias «${alias}» dev'essere vietato: nasconde dati alla Cabina`);
  }
  assert.match(src, /vietati:/, "gli alias vanno dichiarati, non intuiti");
});

prova("il guardiano vero VEDE le tre domande nascoste, adesso", () => {
  // È il difetto vivo del 27/7: auto-analisi.json ha 3 domande sotto un nome che il Pannello non legge.
  const a = JSON.parse(readFileSync(join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/auto-analisi.json"), "utf8"));
  const nascoste = (a.domande_bloccanti || []).length;
  const visibili = (a.domande_per_nicola || []).length;
  if (nascoste > 0 && visibili === 0) {
    // Il validatore DEVE bocciare, e dire quante ne sparirebbero.
    let rc = 0, out = "";
    try {
      out = execFileSync("node", [join(REPO, "cervello/valida-contratti.mjs")], { cwd: REPO, encoding: "utf8" });
    } catch (e) {
      rc = e.status ?? 1;
      out = `${e.stdout || ""}${e.stderr || ""}`;
    }
    assert.notEqual(rc, 0, "con domande nascoste il contratto dev'essere rosso");
    assert.match(out, /domande_bloccanti/);
    assert.match(out, new RegExp(`ZERO invece di ${nascoste}`), "deve dire QUANTE ne sparirebbero, non solo che c'è un alias");
  }
});

prova("la Cabina riporta gli alias: le domande si vedono SUBITO, non al prossimo giro", () => {
  const src = readFileSync(join(REPO, "pannello/src/app/api/memoria/auto-coscienza/route.ts"), "utf8");
  assert.match(src, /riportaAlias/, "serve la difesa anche dal lato di chi legge");
  assert.match(src, /domande_bloccanti: "domande_per_nicola"/);
  // L'ordine conta: se il riporto girasse DOPO la sanificazione delle liste, il campo canonico
  // sarebbe già stato normalizzato a [] e le domande resterebbero invisibili.
  const iRiporto = src.indexOf("riportaAlias(a)");
  const iListe = src.indexOf("sanificaListe(a,");
  assert.ok(iRiporto > 0 && iRiporto < iListe, "il riporto degli alias deve venire PRIMA della sanificazione");
});

prova("il riporto non inventa e non sovrascrive dati veri", () => {
  // Se il campo canonico è già pieno, l'alias non deve toccarlo: sarebbe la macchina che riscrive
  // il proprio output invece di leggerlo.
  const ALIAS = { domande_bloccanti: "domande_per_nicola", errori_giro: "errori" };
  const riporta = (a) => {
    for (const [al, can] of Object.entries(ALIAS)) {
      const vuoto = !Array.isArray(a[can]) || a[can].length === 0;
      if (vuoto && Array.isArray(a[al]) && a[al].length > 0) a[can] = a[al];
    }
    return a;
  };
  const pieno = riporta({ domande_per_nicola: [{ domanda: "vera" }], domande_bloccanti: [{ domanda: "alias" }] });
  assert.equal(pieno.domande_per_nicola[0].domanda, "vera", "il canonico pieno non si sovrascrive");
  const vuoto = riporta({ domande_per_nicola: [], domande_bloccanti: [{ domanda: "alias" }] });
  assert.equal(vuoto.domande_per_nicola[0].domanda, "alias", "il canonico vuoto si riempie dall'alias");
  const niente = riporta({ voto_fiducia: 80 });
  assert.deepEqual(Object.keys(niente), ["voto_fiducia"], "senza alias non si crea nessun campo dal nulla");
});

// ── AR-213: il cancello che guardava tre file su venticinque ─────────────────
//
// È il motivo per cui AR-212 è arrivato fino alla Cabina: il controllo che doveva intercettarlo non
// guardava quel campo, e nemmeno quel file. Ventidue file su venticinque passavano in silenzio
// (`if (!regola) continue`) — non «promossi», proprio **non giudicati**.
//
// Trovato mentre chiudevo AR-212, e dalla guardia ② di AR-330: la prova di AR-213 era diventata
// soddisfatta per EFFETTO COLLATERALE del fix accanto (avevo toccato valida-contratti.mjs), e la
// guardia ha rifiutato la chiusura perché il file non era ancora cambiato dalla nascita. Senza,
// AR-213 si sarebbe chiuso da solo senza che nessuno lo riparasse.

prova("il caso che ha rotto: un file letto dalla Cabina non può restare senza contratto", () => {
  const src = readFileSync(join(REPO, "cervello/valida-contratti.mjs"), "utf8");
  assert.doesNotMatch(src, /if \(!regola\) continue;/, "un file non dichiarato non può passare in silenzio");
  assert.match(src, /LETTI_DAL_PANNELLO/, "serve l'elenco di ciò che la Cabina legge davvero");
});

prova("ogni file che il Pannello legge ha un contratto — verificato sul repo, non a memoria", () => {
  // L'elenco è ricavato grepando pannello/src: se domani una schermata nuova legge un file senza
  // contratto, questo test lo dice prima che una sezione si spenga in silenzio.
  const src = readFileSync(join(REPO, "cervello/valida-contratti.mjs"), "utf8");
  const letti = [...src.matchAll(/"([a-z-]+\.json)",?\s*(?=[\n\]])/g)];
  const rep = rapportoContratti();
  assert.ok(rep.file_controllati >= 14, `solo ${rep.file_controllati} file hanno un contratto: erano 3, devono coprire i 14 letti dalla Cabina`);
  assert.ok(Array.isArray(rep.non_dichiarati), "i non dichiarati devono essere un DATO, non un silenzio");
  // Nomi ESATTI, non sottostringhe. La prima versione usava un match largo, e il 28/7 ha bocciato
  // `apprendimento-potato.json` — un archivio di potatura che la Cabina non legge affatto — solo
  // perché contiene la parola «apprendimento». Un guardiano che boccia il file sbagliato viene
  // disattivato quanto uno che non boccia niente.
  const LETTI = new Set([
    "auto-analisi.json", "auto-radiografia.json", "cantiere-difetti.json", "storico-salute.json",
    "apprendimento.json", "registro-realta.json", "sensori-cecita.json",
  ]);
  for (const f of rep.non_dichiarati) {
    assert.ok(!LETTI.has(f.split("/").pop()), `${f} è letto dalla Cabina e non ha contratto`);
  }
  assert.ok(letti.length > 0);
});

prova("il denominatore c'è: «14 conformi» senza dire su quanti non vuol dire niente", () => {
  const rep = rapportoContratti();
  assert.ok(rep.file_totali >= rep.file_controllati, "serve il totale, non solo i controllati");
  assert.equal(rep.file_totali, rep.file_controllati + rep.non_dichiarati.length, "ogni file dev'essere o controllato o dichiaratamente fuori");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
