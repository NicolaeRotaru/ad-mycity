#!/usr/bin/env node
// UNA SVEGLIA CHE NESSUNO INSTALLA È UNA SVEGLIA CHE NON SUONERÀ MAI.
//
// LA STORIA (21/8). Cinque delle sei cadenze del server non si alzavano più — il piano del mattino
// da 83 ore, il report della sera da 191, la review del venerdì da 338. Cercando il perché ho
// guardato chi INSTALLA quelle sveglie, e ho trovato che non le installa un posto solo: due copioni
// diversi si dividono l'elenco, ognuno col suo, scritto a mano.
//
//   · `install-ritmo-timers.sh` → le quattro del ritmo, più sentinelle, verifica, salute, watch-main
//   · `setup.sh`                → il giro e il monitoraggio
//
// Nessuno dei due, da solo, le installa tutte. `mycity-monitora.timer` non è dentro il copione del
// ritmo pur essendo una cadenza giornaliera come le altre: chi rilancia solo quello si ritrova il
// monitoraggio spento e non se ne accorge, perché un timer che non esiste non dà errore — non fa
// niente, che è diverso e assomiglia in tutto a «va bene».
//
// Questa prova non accusa nessuno dei due copioni: dice solo che ogni sveglia scritta nel repo deve
// essere installata da ALMENO uno dei due. Nasce VERDE sulle undici di oggi, quindi non blocca il
// parco esistente: blocca la DODICESIMA, cioè la prossima che qualcuno aggiunge dimenticandosi di
// metterla in lista. È la stessa forma dei guardiani-cricchetto di questa casa.

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const VPS = join(QUI, "..", "vps");

/** I copioni che hanno il diritto di installare una sveglia. */
const INSTALLATORI = ["install-ritmo-timers.sh", "setup.sh"];

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

/** Chi installa questa unità, fra i copioni dichiarati. Pura: il testo arriva da fuori. */
export function chiInstalla(unita, copioni) {
  return Object.entries(copioni)
    .filter(([, testo]) => String(testo).includes(unita))
    .map(([nome]) => nome);
}

const copioni = Object.fromEntries(INSTALLATORI.map((f) => [f, readFileSync(join(VPS, f), "utf8")]));
const sveglie = readdirSync(VPS).filter((f) => f.endsWith(".timer")).sort();

prova("nel repo ci sono delle sveglie da controllare, e le vedo", () => {
  assert.ok(sveglie.length >= 10, `attese almeno dieci sveglie, trovate ${sveglie.length}`);
});

prova("ogni sveglia del repo la installa almeno un copione", () => {
  const orfane = sveglie.filter((u) => chiInstalla(u, copioni).length === 0);
  assert.deepEqual(
    orfane,
    [],
    `queste sveglie non le installa nessuno: ${orfane.join(", ")}. Una sveglia che nessuno installa non dà errore — non fa niente, e da fuori sembra che vada bene`,
  );
});

prova("e il cancello è vero: una sveglia nuova non nominata da nessuno fa fallire", () => {
  const orfane = ["mycity-inventata.timer"].filter((u) => chiInstalla(u, copioni).length === 0);
  assert.deepEqual(orfane, ["mycity-inventata.timer"], "se non la vede, questa prova non protegge niente");
});

prova("il monitoraggio lo installa setup.sh, NON il copione del ritmo", () => {
  // Non è un difetto: è una divisione storica fra i due copioni. Ma va scritta, perche' chi
  // rilancia solo `install-ritmo-timers.sh` per rimettere in piedi le cadenze NON rimette il
  // monitoraggio, e quello resta spento in silenzio. La carta #143 lo dice a Nicola.
  const dove = chiInstalla("mycity-monitora.timer", copioni);
  assert.deepEqual(dove, ["setup.sh"], `atteso solo setup.sh, trovato: ${dove.join(", ") || "nessuno"}`);
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
