// AR-569 — il conto di quanto lavoro aspetta Nicola deve vedere le stesse card che vede lui.
//
// Il difetto, trovato l'11/8 accodando due card e guardando il guardiano ignorarle. La coda ha
// avuto due formati: una tabella a 8 colonne, e poi i blocchi `###`. La Cabina è stata aggiornata,
// `guardiano-tempo.mjs` no. Contate a mano quel giorno: **49 card a blocchi, 18 righe-tabella**.
// Il guardiano diceva «In attesa della tua firma: 5 · ✅ Coda sotto controllo». Nel Pannello erano 57.
//
// Perché era bloccante e non un dettaglio: è il numero che risponde alla domanda «sono io il collo
// di bottiglia?», e il verde spegneva proprio l'allarme che doveva suonare.
//
// La cura ha due metà, e qui si provano tutte e due:
//   ① il guardiano non ha più un parser suo — carica quello VERO della Cabina (una regola, una casa);
//   ② il verdetto guarda anche il VOLUME, non solo l'età della card più vecchia: 57 firme con
//      nessuna oltre i 7 giorni davano comunque «sotto controllo».
//
// I primi due casi sono il metro: col codice vecchio il conteggio era 0 e il verdetto verde.

import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const { azioniDellaCoda, aspettaLaFirma } = await import(join(QUI, "..", "coda-cabina.mjs"));

/** Una coda finta col formato a BLOCCHI, quello che il guardiano vecchio non vedeva. */
const CODA_A_BLOCCHI = `---
tipo: coda-azioni
---

# ⏳ AZIONI IN ATTESA

## Come approvare
Scrivi all'AD: **"ok [numero]"**. Questa sezione è manuale, non è un'azione.

### 🟡 #prima-card — Chiama il fornaio per confermare l'ordine · ⏳ accodata 2026-08-01 09:00

**Cosa cambia:** il pane di sabato arriva o non arriva.
**Se va bene:** confermo la consegna.
- **Colore:** 🟡
- **Stato:** in attesa di firma

### 🔴 #seconda-card — Paga la bolletta della luce · ⏳ accodata 2026-08-02 10:00

**Cosa cambia:** 84 euro dal conto.
**Se va bene:** il negozio resta acceso.
- **Colore:** 🔴
- **Stato:** in attesa di firma

### 🟡 #terza-card — Ordina i sacchetti nuovi · ⏳ accodata 2026-08-03 11:00

**Cosa cambia:** 200 sacchetti col logo.
- **Colore:** 🟡
- **Stato:** ✅ FATTO 2026-08-04 08:00 — ordinati
`;

function scriviCoda(testo) {
  const dove = mkdtempSync(join(tmpdir(), "coda-"));
  const f = join(dove, "AZIONI-IN-ATTESA.md");
  writeFileSync(f, testo);
  return f;
}

// ── ① Il caso che ha rotto ───────────────────────────────────────────────────
test("il caso che ha rotto: le card a BLOCCHI si contano (col parser vecchio erano zero)", async () => {
  const r = await azioniDellaCoda(scriviCoda(CODA_A_BLOCCHI));
  assert.ok(!r.cieco, `non ho potuto leggere: ${r.cieco}`);
  const attesa = r.azioni.filter(aspettaLaFirma);
  assert.equal(attesa.length, 2, `attese 2 card in attesa, viste ${attesa.length}: ${JSON.stringify(r.azioni.map((a) => [a.azione, a.inAttesa]))}`);
});

test("una card dichiarata FATTA non aspetta più nessuno", async () => {
  const r = await azioniDellaCoda(scriviCoda(CODA_A_BLOCCHI));
  const titoli = r.azioni.filter(aspettaLaFirma).map((a) => a.azione);
  assert.ok(!titoli.some((t) => /sacchetti/i.test(t)), `la card FATTA non doveva contare: ${JSON.stringify(titoli)}`);
});

test("«Come approvare» è manuale, non è una firma da dare", async () => {
  const r = await azioniDellaCoda(scriviCoda(CODA_A_BLOCCHI));
  assert.ok(!r.azioni.some((a) => /come approvare/i.test(a.azione || "")), "una sezione-manuale è finita fra le azioni");
});

// ── ② Il guardiano, eseguito davvero ─────────────────────────────────────────
/** Esegue il guardiano su una coda scelta e ne restituisce il JSON. */
function eseguiGuardiano(fileCoda) {
  const r = spawnSync(process.execPath, [join(QUI, "..", "guardiano-tempo.mjs"), "--json"], {
    cwd: REPO,
    encoding: "utf8",
    timeout: 120_000,
    env: { ...process.env, GUARDIANO_TEMPO_CODA: fileCoda || "" },
  });
  const i = String(r.stdout || "").indexOf("{");
  return { codice: r.status, dati: i >= 0 ? JSON.parse(String(r.stdout).slice(i)) : null, testo: `${r.stdout || ""}${r.stderr || ""}` };
}

test("sul mondo VERO il guardiano conta quello che conta la Cabina, card per card", async () => {
  const dallaCabina = await azioniDellaCoda();
  assert.ok(!dallaCabina.cieco, `qui non posso leggere la coda: ${dallaCabina.cieco}`);
  const attese = dallaCabina.azioni.filter(aspettaLaFirma).length;
  const g = eseguiGuardiano();
  assert.ok(g.dati, `il guardiano non ha risposto in JSON: ${g.testo.slice(0, 200)}`);
  assert.equal(
    g.dati.coda_firma_nicola?.totale_in_attesa,
    attese,
    "il guardiano e la Cabina devono vedere lo STESSO numero: se divergono, uno dei due sta mentendo a Nicola",
  );
  assert.ok(attese > 18, `sulla coda vera le card sono ben più delle 18 righe-tabella: viste ${attese}`);
});

// ── ③ Il volume, non solo l'età ──────────────────────────────────────────────
test("il verdetto guarda anche QUANTE sono: 57 firme fresche non sono «sotto controllo»", () => {
  const g = eseguiGuardiano();
  assert.ok(g.dati, "nessun JSON");
  const c = g.dati.coda_firma_nicola;
  if (c.totale_in_attesa > 20 && (c.piu_vecchia_gg ?? 0) <= g.dati.soglia_stallo_gg) {
    // È esattamente lo stato dell'11/8: nessuna card oltre soglia, e comunque troppe.
    assert.equal(g.dati.ok, false, "con la coda piena il guardiano deve dire che è un collo di bottiglia, non «sotto controllo»");
    assert.equal(g.codice, 1, "e deve uscire 1, altrimenti nessun cancello se ne accorge");
  }
  assert.ok(g.dati.settimane_di_arretrato === null || typeof g.dati.settimane_di_arretrato === "number");
});

test("l'arretrato si misura col ritmo VERO di Nicola, e senza ritmo si dichiara di non saperlo", () => {
  const g = eseguiGuardiano();
  const s = g.dati.settimane_di_arretrato;
  const ritmo = g.dati.ultimi_7_giorni?.ti_coinvolgono ?? 0;
  if (ritmo > 0) {
    assert.equal(s, +(g.dati.coda_firma_nicola.totale_in_attesa / ritmo).toFixed(1), "le settimane di arretrato sono la coda diviso il ritmo reale");
  } else {
    assert.equal(s, null, "senza ritmo non si divide per zero: si dice che non si sa");
  }
});

// ── ④ Cieco non è verde ──────────────────────────────────────────────────────
test("se la coda non c'è, il guardiano non inventa un numero", async () => {
  const r = await azioniDellaCoda(join(tmpdir(), "coda-che-non-esiste-mai", "AZIONI-IN-ATTESA.md"));
  assert.ok(r.cieco, "un file assente deve dare cieco, non una lista vuota che sembra «zero in attesa»");
  assert.match(r.cieco, /non c'è|non ho potuto/, "il cieco deve dire PERCHÉ");
});
