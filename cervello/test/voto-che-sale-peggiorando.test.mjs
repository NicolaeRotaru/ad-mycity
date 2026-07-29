// AR-357 — «il voto di salute sale quando le aree peggiorano, perché le peggiori vengono buttate
// fuori dalla media».
//
// Il caso che rivela la malattia è il primo test: si prende una radiografia, si porta UNA dimensione
// da 40 a 0 (cioè si peggiora davvero), e si guarda il voto. Con il vecchio filtro `v > 0` quella
// dimensione spariva dalla media e il voto SALIVA. Un numero che migliora mentre la realtà peggiora
// non è un errore di arrotondamento: è un incentivo a lasciar affondare le aree già messe male.
//
//   node cervello/test/voto-che-sale-peggiorando.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { mediaCoperta, medieChePotanoGliZeri, perLoStorico } from "../misura-parziale.mjs";
import { votoPilastri, votoPerLoStorico } from "../sonda-volano.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

test("⬇️ IL CASO CHE RIVELA LA MALATTIA: peggiorare un'area NON deve far salire il voto", () => {
  const prima = { dimensioni: [{ voto: 80 }, { voto: 60 }, { voto: 40 }, { voto: 20 }] };
  const dopo = { dimensioni: [{ voto: 80 }, { voto: 60 }, { voto: 0 }, { voto: 20 }] }; // 40 → 0: PEGGIO

  const vPrima = votoPilastri(prima).valore;
  const vDopo = votoPilastri(dopo).valore;

  assert.equal(vPrima, 50, "media onesta di 80/60/40/20");
  assert.equal(vDopo, 40, "una dimensione crollata a zero ABBASSA la media");
  assert.ok(vDopo < vPrima, `peggiorando il voto deve scendere: ${vPrima} → ${vDopo}`);

  // La vecchia formula, riprodotta qui per far vedere il regalo: scartando gli zeri sarebbe 53,3 —
  // cioè TRE PUNTI IN PIÙ di prima del peggioramento.
  const vecchia = [80, 60, 0, 20].filter((v) => v > 0);
  const vecchiaMedia = vecchia.reduce((s, v) => s + v, 0) / vecchia.length;
  assert.ok(vecchiaMedia > vPrima, "la vecchia formula premiava il peggioramento (è il difetto)");
});

test("uno ZERO misurato entra nella media, un campo ASSENTE no — e la copertura lo dice", () => {
  const m = mediaCoperta([10, 0, null, undefined, NaN, "boh", 20]);
  assert.equal(m.misurati, 3, "10, 0 e 20 sono misure; null/undefined/NaN/stringa non lo sono");
  assert.equal(m.valore, 10, "(10+0+20)/3");
  assert.equal(m.totale, 7);
  assert.equal(m.esclusi, 4);
  assert.ok(m.parziale, "3 su 7 è una media parziale e deve dirlo");
});

test("la Misura STAMPA sempre la copertura: `${m}` non può nascondere il denominatore", () => {
  const m = mediaCoperta([50, null, null, null]);
  assert.match(String(m), /su 1\/4/, `chi interpola la misura vede la copertura: «${m}»`);
  assert.match(`voto: ${m}`, /su 1\/4/);
  // E chi vuole scriverla in un JSON deve passare da perLoStorico, che porta la copertura con sé.
  assert.deepEqual(perLoStorico(m), { valore: 50, copertura: "1/4", parziale: true, cieco: false });
  assert.throws(() => perLoStorico(50), TypeError, "un numero nudo non è una misura");
});

test("nessuna dimensione misurabile ⇒ CIECO: non si inventa un 72", () => {
  const m = votoPilastri({ dimensioni: [{ voto: null }, { nome: "senza voto" }] });
  assert.ok(m.cieco, "zero misure = cieco");
  assert.equal(m.valore, null, "una media su zero valori non è un numero");

  const r = votoPerLoStorico({ dimensioni: [] }, [{ voto_salute: 43 }, { voto_salute: 0 }]);
  assert.equal(r.voto_misurato, false, "va dichiarato NON misurato");
  assert.equal(r.voto, 43, "si riporta l'ultimo voto misurato davvero, non un numero di comodo");
});

test("sui DATI VERI di auto-radiografia.json la media onesta è più bassa di quella potata", () => {
  const rad = JSON.parse(readFileSync(join(ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/auto-radiografia.json"), "utf8"));
  const dims = Array.isArray(rad.dimensioni) ? rad.dimensioni : [];
  if (!dims.length) return; // il file può essere una sonda senza dimensioni: niente da misurare

  const onesta = votoPilastri(rad);
  assert.equal(onesta.totale, dims.length, "la copertura si misura su TUTTE le dimensioni del file");

  const voti = dims.map((d) => Number(d?.voto)).filter((v) => Number.isFinite(v));
  const zeri = voti.filter((v) => v === 0).length;
  if (zeri > 0) {
    const potati = voti.filter((v) => v > 0);
    const mediaPotata = potati.reduce((s, v) => s + v, 0) / potati.length;
    assert.ok(
      onesta.valore < mediaPotata,
      `con ${zeri} dimensioni a zero la media onesta (${onesta.valore}) deve essere sotto quella potata (${Math.round(mediaPotata)})`,
    );
  }
});

test("IL METRO: nessuno in cervello/ calcola più una media su una lista potata degli zeri", () => {
  // Prima il metro deve dimostrare di saper MORDERE, su un sorgente inventato che ha la malattia.
  const malato = [
    {
      file: "finto/malato.mjs",
      testo: `
        const voti = dims.map((d) => Number(d.voto)).filter((v) => Number.isFinite(v) && v > 0);
        const media = Math.round(voti.reduce((s, v) => s + v, 0) / voti.length);
      `,
    },
  ];
  const morsi = medieChePotanoGliZeri(malato);
  assert.equal(morsi.length, 1, "il metro deve accorgersi della media su lista potata");
  assert.match(morsi[0].motivo, /mediaCoperta/);

  // Un `.filter(x > 0)` che NON finisce in una media (es. prendere i primi K per punteggio) è
  // legittimo e non va accusato: un cancello che punisce il comportamento giusto viene spento.
  const sano = [
    {
      file: "finto/sano.mjs",
      testo: `
        const top = punteggi.filter((p) => p.score > 0).sort((a, b) => b.score - a.score).slice(0, K);
        const media = altri.reduce((s, v) => s + v, 0) / altri.length;
      `,
    },
  ];
  assert.equal(medieChePotanoGliZeri(sano).length, 0, "nessun falso positivo sulla selezione top-K");

  // E ora sul repo VERO.
  const files = [];
  const scendi = (dir, rel) => {
    for (const voce of readdirSync(dir)) {
      if (voce === "node_modules" || voce === "test" || voce.startsWith(".")) continue;
      const abs = join(dir, voce);
      const r = rel ? `${rel}/${voce}` : voce;
      let st;
      try {
        st = statSync(abs);
      } catch {
        continue;
      }
      if (st.isDirectory()) scendi(abs, r);
      else if (voce.endsWith(".mjs")) files.push({ file: `cervello/${r}`, testo: readFileSync(abs, "utf8") });
    }
  };
  scendi(join(ROOT, "cervello"), "");
  assert.ok(files.length > 50, "il metro deve aver letto davvero il cervello");

  const fuori = medieChePotanoGliZeri(files);
  assert.deepEqual(
    fuori.map((f) => `${f.file}:${f.riga}`),
    [],
    `medie che scartano gli zeri:\n${fuori.map((f) => `  ${f.file}:${f.riga} — ${f.motivo}`).join("\n")}`,
  );
});
