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
import { SETTIMANE_MAX, verdettoCoda } from "../guardiano-tempo.mjs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
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

// AR-856 — IL CASO QUI SOTTO MISURAVA LA CODA DI OGGI, e per questo non provava niente: era
// racchiuso in un `if` sullo stato reale, e lo stato reale (più vecchia a 44 giorni, soglia 7) quel
// ramo non lo prende mai. La mutazione che toglie il volume dal verdetto restava verde. Adesso la
// decisione si esegue su un mondo finto, e le due metà di AR-569 si possono percorrere tutt'e due.

test("AR-856: la coda PIENA di card fresche non è «sotto controllo» — è il volume, non l'età", () => {
  // Lo stato esatto dell'11/8, costruito invece che aspettato: 57 firme, nessuna oltre soglia,
  // ritmo 4 a settimana → 14,3 settimane di arretrato.
  const v = verdettoCoda({ etaPiuVecchiaGg: 3, inAttesa: 57, ritmoSettimanale: 4 });
  assert.equal(v.stallo, false, "nessuna card è ferma da troppo: se qui è vero, il caso misura l'altra metà");
  assert.equal(v.troppeInCoda, true, "57 firme con quel ritmo sono un collo di bottiglia");
  assert.equal(v.ok, false, "il guardiano dice «sotto controllo» su una coda piena");
  assert.equal(v.settimaneArretrato, 14.3, "57 diviso 4 fa 14,25 → 14,3 arrotondato");
});

test("AR-856: e il verso opposto — una coda corta col ritmo giusto resta verde", () => {
  // Senza questo, la cura sarebbe «di' sempre che è un collo di bottiglia», che è inutile quanto
  // il difetto: un guardiano sempre rosso si impara a saltarlo.
  const v = verdettoCoda({ etaPiuVecchiaGg: 2, inAttesa: 8, ritmoSettimanale: 4 });
  assert.equal(v.ok, true, `una coda di 8 con ritmo 4 (2 settimane) è sana: ${JSON.stringify(v)}`);
  assert.equal(v.troppeInCoda, false);
});

test("AR-856: l'età da sola basta a bocciare, anche con la coda corta", () => {
  const v = verdettoCoda({ etaPiuVecchiaGg: 44, inAttesa: 3, ritmoSettimanale: 4 });
  assert.equal(v.stallo, true);
  assert.equal(v.ok, false, "una firma ferma da 44 giorni non è «sotto controllo» nemmeno da sola");
});

test("AR-856: senza ritmo non si divide per zero, e il «non lo so» non diventa un «va bene»", () => {
  const v = verdettoCoda({ etaPiuVecchiaGg: 1, inAttesa: 500, ritmoSettimanale: 0 });
  assert.equal(v.settimaneArretrato, null, "con ritmo zero l'arretrato non è calcolabile");
  assert.equal(v.troppeInCoda, false, "un «non lo so» non deve diventare un'accusa…");
  assert.equal(v.ok, true, "…né un rosso inventato: resta il conteggio nudo, che si legge nel referto");
});

test("AR-856: il corpo dello script USA il verdetto, non lo ricalcola", () => {
  // Estraendo la funzione pura è saltato fuori che il corpo rifaceva il conto per conto suo:
  // `ok: !stallo && !troppeInCoda` scritto una seconda volta, accanto alla chiamata che quella
  // risposta l'aveva appena data. Due lettori della stessa regola divergono al primo che cambia.
  //
  // Questo caso guarda il sorgente, e lo dichiara: è un ancoraggio, non un comportamento. Il
  // comportamento lo provano i quattro casi qui sopra, che ESEGUONO la decisione. Le righe
  // commentate si scartano prima di cercare — una riga commentata contiene ancora tutto.
  const viva = readFileSync(join(QUI, "..", "guardiano-tempo.mjs"), "utf8")
    .split("\n")
    .filter((r) => !r.trimStart().startsWith("//") && !r.trimStart().startsWith("*"))
    .join("\n");
  // L'ancora è la chiamata al verdetto, che è UNICA: `const out = {` compare due volte in questo
  // file (c'è anche il ramo «coda non trovata»), e ancorarsi alla prima faceva guardare il posto
  // sbagliato. Se l'ancora sparisce si GRIDA invece di passare — un ritaglio che non trova niente
  // non deve dichiararsi soddisfatto.
  const i = viva.indexOf("= verdettoCoda({");
  assert.ok(i > 0, "CIECO: non trovo la chiamata a verdettoCoda in guardiano-tempo.mjs");
  const dopo = viva.slice(i, i + 400);
  assert.match(dopo, /^\s*ok,\s*$/m, "il referto non usa il verdetto della funzione pura");
  assert.ok(!/ok: !stallo/.test(dopo), "il corpo ricalcola il verdetto invece di usarlo: due lettori della stessa regola");
});

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
