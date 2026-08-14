#!/usr/bin/env node
// 👆 LA MALATTIA (corsia 3, lotto 41): la decisione vive dentro il componente, quindi nessuno la può
// provare. Ogni casella si costruisce da sé quanto è grande il bersaglio del dito, quanto è grande
// il campo di scrittura e chi comanda lo scorrimento — e la regola finisce scritta N volte,
// sbagliata in N-1.
//
// Copre, con un caso dedicato ciascuno:
//   AR-220 · su iPhone toccare per scrivere ingrandisce la pagina (campi sotto i 16px)
//   AR-223 · link e freccine alti 18px, più piccoli del polpastrello
//   AR-224 · liste dentro riquadri che scorrono da soli: il dito muove la lista, non la pagina
//
// Due strati di prova, e servono ENTRAMBI:
//   ① la DECISIONE — si esegue `lib/tocco-bersaglio.ts` vero (type-stripping di Node 22);
//   ② l'INSTALLAZIONE — si leggono i sorgenti VERI dei componenti e si conta che la chiamino.
//      È la lezione di AR-402: una prova che cerca l'esistenza del pezzo e non la sua adozione
//      diventa verde mentre il difetto è ancora a schermo.

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const M = await import(join(REPO, "pannello/src/lib/tocco-bersaglio.ts"));

const leggi = (p) => readFileSync(join(REPO, "pannello/src", p), "utf8");

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

// ── AR-220 · il campo che fa zoomare iOS ──────────────────────────────────────
prova("AR-220: un campo sotto i 16px zooma, e la cura lo porta a 16 senza toccare il desktop", () => {
  // Le tre misure vere trovate nel Pannello, più il caso che sfuggiva sempre.
  assert.equal(M.campoZoomaSuIOS("input-soft w-full text-[12.5px] resize-y"), true, "12,5px zooma");
  assert.equal(M.campoZoomaSuIOS("input-soft w-full text-[13px]"), true, "13px zooma");
  assert.equal(M.campoZoomaSuIOS("input-soft w-full text-sm"), true, "text-sm = 14px: zooma");
  assert.equal(
    M.campoZoomaSuIOS("input-soft w-full resize-y"),
    true,
    "senza nessun text- eredita .input-soft (14px): zooma lo stesso — è il caso che non si vedeva",
  );

  const curata = M.classeCampo("input-soft w-full text-[12.5px] resize-y");
  assert.equal(M.campoZoomaSuIOS(curata), false, "dopo la cura non zooma più");
  assert.ok(M.fontEffettivoPx(curata) >= M.CAMPO_MIN_PX, `il telefono legge ${M.fontEffettivoPx(curata)}px`);
  assert.ok(curata.includes("sm:text-[12.5px]"), "da sm: in su la densità di prima resta identica");
  assert.ok(curata.includes("resize-y") && curata.includes("input-soft"), "il resto della classe non si perde");
});

prova("AR-220: un campo già a norma non viene toccato (la cura non è un rifacimento)", () => {
  const gia = "input-soft w-full text-[16px]";
  assert.equal(M.classeCampo(gia), gia);
  assert.equal(M.classeCampo("w-full text-base px-2"), "w-full text-base px-2");
});

prova("AR-220: i campi veri del Pannello passano dalla regola, non se la riscrivono", () => {
  const attesi = [
    "components/BarraScritturaChat.tsx",
    "components/ParlaCasella.tsx",
    "components/ChatCasella.tsx",
    "components/AutoCoscienza.tsx",
    "components/RicercaGlobale.tsx",
    "components/QuaderniSenior.tsx",
    "components/BottoneFotoChat.tsx",
    "components/aree/Documenti.tsx",
  ];
  const scoperti = [];
  for (const f of attesi) {
    const src = leggi(f);
    // ogni <textarea>/<input> del file deve avere la sua classe passata da classeCampo(...)
    const campi = (src.match(/<(?:textarea|input)\b/g) || []).length;
    const curati = (src.match(/classeCampo\(/g) || []).length;
    if (campi > 0 && curati < campi) scoperti.push(`${f} (${curati}/${campi} curati)`);
  }
  assert.deepEqual(scoperti, [], `campi di scrittura ancora fuori dalla regola: ${scoperti.join(" · ")}`);
});

// ── AR-223 · il bersaglio più piccolo del polpastrello ────────────────────────
prova("AR-223: `t-eti` da sola misura ~18px, la cura porta il bersaglio a 44", () => {
  const nudo = "t-eti hover:text-brand inline-flex items-center gap-1 transition";
  const h = M.altezzaBersaglioPx(nudo);
  assert.ok(h < 24, `un comando testuale nudo misura ${h}px: sotto anche il minimo di legge (24)`);
  assert.equal(M.bersaglioSufficiente(nudo), false);

  const curato = M.classeComando(nudo);
  assert.equal(M.bersaglioSufficiente(curato), true, "dopo la cura il dito ci arriva");
  assert.ok(M.altezzaBersaglioPx(curato) >= M.BERSAGLIO_MIN_PX);
  assert.ok(curato.includes("-my-1"), "il margine negativo compensa il padding: la card non si gonfia");
});

prova("AR-223: un <summary> non diventa flex (perderebbe il triangolino) ma cresce lo stesso", () => {
  const s = M.classeComandoSommario("text-[12px] font-medium text-black/55 cursor-pointer select-none");
  assert.equal(M.bersaglioSufficiente(s), true);
  assert.ok(!/\binline-flex\b/.test(s), "niente cambio di display su un <summary>");
  assert.equal(M.classeComando("min-h-[44px] px-3"), "min-h-[44px] px-3", "chi è già a norma resta com'è");
});

prova("AR-223: i comandi testuali veri delle card passano dalla regola", () => {
  const attesi = [
    "components/aree/Azioni.tsx",
    "components/Modulo.tsx",
    "components/aree/Plancia.tsx",
    "components/AutoCoscienza.tsx",
    "components/QuaderniSenior.tsx",
    "components/NumeriReport.tsx",
    "components/cervello/RadiografiaDiSe.tsx",
  ];
  const senza = attesi.filter((f) => !/classeComando(Sommario)?\(/.test(leggi(f)));
  assert.deepEqual(senza, [], `file con comandi testuali ancora fuori dalla regola: ${senza.join(" · ")}`);
});

// ── AR-224 · il riquadro che ruba lo scorrimento ──────────────────────────────
prova("AR-224: un tetto in pixel + overflow ruba il gesto, e la cura lo toglie SOLO sul telefono", () => {
  const rubato = "scroll-soft space-y-2 max-h-[620px] overflow-y-auto pr-1";
  assert.equal(M.scorrimentoRubatoSuTelefono(rubato), true);

  const curato = M.classeListaScorrevole(rubato);
  assert.equal(M.scorrimentoRubatoSuTelefono(curato), false, "sul telefono scorre la pagina");
  assert.ok(curato.includes("max-h-none"), "sul telefono nessun tetto");
  assert.ok(curato.includes("sm:max-h-[620px]"), "sul desktop il riquadro di prima, intatto");
  assert.ok(curato.includes("overscroll-contain"), "e sul desktop il gesto non si trascina dietro la pagina");
});

prova("AR-224: un tetto già relativo alla finestra o già responsive non si tocca", () => {
  const vh = "flex-1 overflow-y-auto max-h-[30vh] sm:max-h-none";
  assert.equal(M.scorrimentoRubatoSuTelefono(vh), false);
  assert.equal(M.classeListaScorrevole(vh), vh);
  assert.equal(M.scorrimentoRubatoSuTelefono("max-h-[620px] p-3"), false, "senza overflow non c'è nessun gesto rubato");
});

prova("AR-224: le liste vere del Pannello passano dalla regola", () => {
  const attesi = [
    "components/LavoriCervello.tsx",
    "components/GovernoAD.tsx",
    "components/StatoNumeriVault.tsx",
    "components/Intelligence.tsx",
    "components/MemoriaViva.tsx",
    "components/aree/Storico.tsx",
    "components/QuaderniSenior.tsx",
    "components/RicercaGlobale.tsx",
    "components/NumeriReport.tsx",
  ];
  const scoperte = [];
  for (const f of attesi) {
    const src = leggi(f);
    // una classe LETTERALE (fra virgolette, non dentro classeListaScorrevole) con tetto fisso + overflow
    for (const m of src.matchAll(/className=\{?"([^"]*overflow-y-auto[^"]*)"/g)) {
      if (M.scorrimentoRubatoSuTelefono(m[1])) scoperte.push(`${f}: ${m[1].slice(0, 60)}`);
    }
  }
  assert.deepEqual(scoperte, [], `riquadri che rubano ancora il gesto: ${scoperte.join(" · ")}`);
});

// ── il metro sa dire di sì ────────────────────────────────────────────────────
prova("le tabelle responsive sono LETTERALI: Tailwind le deve poter leggere nel sorgente", () => {
  const sorgente = readFileSync(join(REPO, "pannello/src/lib/tocco-bersaglio.ts"), "utf8");
  for (const v of Object.values(M.CAMPO_RESPONSIVO)) {
    assert.ok(sorgente.includes(v), `«${v}» va scritta per esteso, o Tailwind non genera quella classe`);
  }
  for (const v of Object.values(M.TETTO_RESPONSIVO)) {
    assert.ok(sorgente.includes(v), `«${v}» va scritta per esteso, o Tailwind non genera quella classe`);
  }
});

const rossi = casi.filter((c) => !c.ok);
console.log(`TAP version 13\n1..${casi.length}`);
casi.forEach((c, i) => console.log(`${c.ok ? "ok" : "not ok"} ${i + 1} - ${c.nome}${c.ok ? "" : `\n  # ${c.err}`}`));
console.log(`# pass ${casi.length - rossi.length}`);
console.log(`# fail ${rossi.length}`);
process.exit(rossi.length ? 1 : 0);
