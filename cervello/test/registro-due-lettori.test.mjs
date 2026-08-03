// 🧪 UN REGISTRO, DUE LETTORI — e devono leggerlo allo stesso modo (AR-500).
//
// `cervello/malattie.json` ha due consumatori: `spazzata-fratelli.mjs`, che conta le istanze vive
// nel repo, e `sorvegliante.mjs`, che cerca le stesse forme sulle righe che sto aggiungendo adesso.
// Il 3/8, censendo tre malattie nuove, quei due lettori si sono contraddetti TRE volte in un'ora —
// e ogni volta il risultato era un verde:
//
//   ① il flag `m`. La spazzata compilava il pattern senza `m`, quindi `^` significava «inizio del
//      FILE» invece di «inizio della riga»: ha risposto «0 istanze, curata 📉» su 25 istanze vive.
//   ② il `#`. `senzaCommenti` azzerava ogni riga che comincia con `#` — giusto per il codice, falso
//      per un .md, dove `#` apre un TITOLO. Ogni regola di casa che vive nei titoli non poteva
//      scattare mai: la riga arrivava al pattern già vuota.
//   ③ il campo `percorsi`. Lo leggeva solo il sorvegliante: la stessa malattia valeva in un file per
//      uno e in tutto il vault per l'altro.
//
// Nessuno dei tre era un errore di logica: erano due interpretazioni della stessa fonte. Un registro
// con due semantiche non è una fonte unica — sono due fonti che si somigliano, e divergono in
// silenzio. Queste prove tengono i due lettori d'accordo.

import { test } from "node:test";
import assert from "node:assert/strict";
import { senzaCommenti, istanzeNelTesto, nelPerimetro } from "../spazzata-fratelli.mjs";
import { sorveglia, gravi } from "../sorvegliante.mjs";

test("① un pattern ancorato con ^ vale per RIGA in tutti e due i lettori", () => {
  const malattia = { id: "programma-che-parte-importando", pattern: "^main\\(\\);$", estensioni: [".mjs"] };
  // Il lettore della spazzata — la SUA funzione, non una regex riscritta qui: la prima stesura di
  // questa prova compilava `new RegExp(..., "gm")` dentro il test, cioè controllava che le regex di
  // JavaScript funzionino. Rompendo la spazzata restava verde, e me l'ha detto non-vacuita.mjs.
  assert.equal(istanzeNelTesto(malattia, "prima riga\nmain();\nterza riga", "cervello/x.mjs"), 1, "senza `m` sarebbe 0, e la malattia risulterebbe curata");
  // Il lettore del sorvegliante: riga per riga.
  const e = sorveglia({
    malattie: [malattia],
    mutanti: [],
    toccati: [{ file: "cervello/nuovo.mjs", contenuto: "", aggiunte: [{ n: 2, testo: "main();" }] }],
  });
  assert.equal(gravi(e.voci).length, 1, "i due lettori devono vedere la stessa istanza");
});

test("② in un .md il # apre un titolo, non un commento", () => {
  assert.equal(senzaCommenti("## Sistemare AR-495", "coda.md"), "## Sistemare AR-495", "azzerarlo rende invisibile ogni regola sui titoli");
  assert.equal(senzaCommenti("# commento", "script.sh"), "", "…ma nel codice resta un commento");
});

test("②-bis la regola sui titoli scatta davvero, dal registro fino al verdetto", () => {
  const e = sorveglia({
    malattie: [{ id: "titolo-che-parla-in-codice", pattern: "^##[ \\t]+.*(AR-[0-9]+)", estensioni: [".md"], percorsi: ["MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md"] }],
    mutanti: [],
    toccati: [{ file: "MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md", contenuto: "", aggiunte: [{ n: 9, testo: "## Chiudere AR-495 entro venerdì" }] }],
  });
  assert.equal(gravi(e.voci).length, 1, "è la prova che ② non era teorica: senza il fix questa resta 0");
});

test("②-ter e il taglio dei commenti resta acceso dove serve: nel codice il # sparisce davvero", () => {
  const malattia = { id: "x", pattern: "^main\\(\\);$", estensioni: [".sh"] };
  assert.equal(istanzeNelTesto(malattia, "# main();\nmain();", "cervello/x.sh"), 1, "la riga commentata non conta, quella vera sì");
});

test("③ `percorsi` restringe per tutti e due, o la stessa malattia ha due perimetri", () => {
  const malattia = { id: "casa", pattern: "AR-[0-9]+", estensioni: [".md"], percorsi: ["MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md"] };
  // Il lettore della spazzata: la sua funzione di perimetro, eseguita.
  assert.equal(nelPerimetro(malattia, "MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md"), true);
  assert.equal(nelPerimetro(malattia, "MyCity-Vault/07-Agenti/kit/x.md"), false, "i due file KIT accusati il 3/8 erano esattamente questo caso");
  assert.equal(nelPerimetro({ id: "y", pattern: "x" }, "qualsiasi.md"), true, "senza `percorsi` vale ovunque: il campo è facoltativo");
  const dentro = sorveglia({ malattie: [malattia], mutanti: [], toccati: [{ file: "MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md", contenuto: "", aggiunte: [{ n: 1, testo: "vedi AR-495" }] }] });
  const fuori = sorveglia({ malattie: [malattia], mutanti: [], toccati: [{ file: "MyCity-Vault/07-Agenti/kit/x.md", contenuto: "", aggiunte: [{ n: 1, testo: "vedi AR-495" }] }] });
  assert.equal(gravi(dentro.voci).length, 1);
  assert.equal(gravi(fuori.voci).length, 0, "i due file KIT che la spazzata accusava erano esattamente questo caso");
});
