#!/usr/bin/env node
// ✍️ LA MALATTIA: la revoca della firma era l'unica scrittura di cui nessuno guardava l'esito.
//    (AR-384, lotto 41 corsia 1)
//
// Quando Nicola annulla un lavoro dal Pannello, l'azione che l'aveva generato deve tornare «da
// approvare» E perdere la firma. La riga era `await revocaFirma(az.id);` col booleano buttato via,
// mentre le due scritture immediatamente successive — meno critiche — l'esito lo controllavano.
// Risultato: revoca fallita in silenzio, azione «tornata in approvazione» con la firma ancora viva,
// e il worker che poteva ancora eseguirla davvero.
//
// La radice non è la distrazione: `setImpostazione` segnala il fallimento con un VALORE DI RITORNO,
// e un valore di ritorno si può ignorare senza che niente protesti. Qui si prova che per le chiavi
// di sicurezza esiste la versione che LANCIA — ignorarla richiede di scrivere un `try/catch`
// apposta, e quello si vede nel diff.
//
// Copre: AR-384.
// Si esegue con: node cervello/test/c1-firma-revocata-davvero.test.mjs

import { registerHooks } from "node:module";
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { existsSync } from "node:fs";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const SRC = join(REPO, "pannello/src");

registerHooks({
  resolve(spec, ctx, next) {
    if (spec.startsWith("@/")) {
      const base = join(SRC, spec.slice(2));
      for (const e of [".ts", ".tsx", "/index.ts", ""]) {
        if (existsSync(base + e)) return { url: pathToFileURL(base + e).href, shortCircuit: true };
      }
    }
    try {
      return next(spec, ctx);
    } catch (errore) {
      if (errore?.code !== "ERR_MODULE_NOT_FOUND" && errore?.code !== "ERR_UNSUPPORTED_DIR_IMPORT") throw errore;
      for (const x of spec.startsWith(".") ? [".ts", ".tsx", "/index.ts"] : [".js", ".mjs"]) {
        try {
          return next(spec + x, ctx);
        } catch {
          /* provo il prossimo */
        }
      }
      throw errore;
    }
  },
});

// Memoria staccata: `setImpostazione` torna false senza toccare la rete. È la condizione del difetto.
delete process.env.SUPABASE_URL;
delete process.env.SUPABASE_SERVICE_KEY;

const { revocaFirma, revocaFirmaObbligatoria, registraFirmaObbligatoria, FirmaNonScritta, oraFirma } = await import(
  join(REPO, "pannello/src/lib/firma-azione.ts")
);
const { scrivereInOrdine } = await import(join(REPO, "pannello/src/lib/cancello-atto.ts"));

const casi = [];
const prova = async (nome, fn) => {
  try {
    await fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

await prova("AR-384: una revoca che non è passata LANCIA, non torna un booleano da dimenticare", async () => {
  // La versione vecchia (che resta, per chi l'esito lo raccoglie davvero) dice solo «false».
  assert.equal(await revocaFirma("az-1"), false, "senza memoria la revoca non passa: è il presupposto");
  // Quella di sicurezza non si può ignorare: per non gestirla bisogna scrivere un catch apposta.
  await assert.rejects(() => revocaFirmaObbligatoria("az-1"), FirmaNonScritta, "doveva lanciare e non l'ha fatto");
});

await prova("AR-384: anche la firma in scrittura ha la sua versione che non si può ignorare", async () => {
  await assert.rejects(() => registraFirmaObbligatoria("az-1", "nicola"), FirmaNonScritta);
});

await prova("AR-384: l'errore dice QUALE azione è rimasta firmata", async () => {
  try {
    await revocaFirmaObbligatoria("az-42");
    assert.fail("doveva lanciare");
  } catch (e) {
    assert.ok(e instanceof FirmaNonScritta);
    assert.equal(e.idAzione, "az-42", "senza l'id, Nicola non sa su cosa mettere le mani");
    assert.ok(/firmata/i.test(e.message), "e il messaggio deve dire il pericolo, non il codice dell'errore");
  }
});

await prova("AR-384: con la revoca fallita, l'azione NON torna «da approvare»", async () => {
  // È la sequenza vera della rotta di annullamento, con le stesse funzioni.
  let rimessaInCircolo = 0;
  const esito = await scrivereInOrdine({
    sicurezza: {
      nome: "revoca della firma",
      esegui: async () => {
        try {
          await revocaFirmaObbligatoria("az-1");
          return true;
        } catch (e) {
          if (!(e instanceof FirmaNonScritta)) throw e;
          return false;
        }
      },
    },
    poi: async () => {
      rimessaInCircolo++;
      return [{ nome: "stato", ok: true }];
    },
  });
  assert.equal(rimessaInCircolo, 0, "rimettere la card in circolo con la firma viva è il danno del difetto");
  assert.equal(esito.bloccataSullaSicurezza, true);
});

await prova("il metro sa dire di SÌ: con la memoria che risponde, la firma si scrive e si revoca", async () => {
  // `oraFirma` è la parte che non dipende dalla memoria: serve a provare che il modulo è vivo e
  // che il fallimento di sopra viene dalla memoria staccata, non da un import rotto.
  assert.match(oraFirma(new Date("2026-08-14T09:05:00Z")), /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
});

const rossi = casi.filter((c) => !c.ok);
console.log(`TAP version 13\n1..${casi.length}`);
casi.forEach((c, i) => console.log(`${c.ok ? "ok" : "not ok"} ${i + 1} - ${c.nome}${c.ok ? "" : `\n  # ${c.err}`}`));
console.log(`# pass ${casi.length - rossi.length}`);
console.log(`# fail ${rossi.length}`);
process.exit(rossi.length ? 1 : 0);
