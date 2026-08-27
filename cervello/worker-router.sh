#!/usr/bin/env bash
# 🧭 IL ROUTER DEL COSTO — quale motore per questo compito. AR-082.
#
# Chiede a `banco-ai.mjs` che modello usare per un compito. NON esegue nessuna AI: decide soltanto.
# Se node o il router falliscono torna vuoto, e il chiamante resta sul motore premium: nessuna
# rottura, ma neanche un risparmio silenzioso che nessuno ha deciso.
#
# PERCHE' IN UN FILE A PARTE: perche' una prova possa eseguirlo. Stava dentro `worker.sh`, e il suo
# caso cercava la parola `scegliModello` nel testo di quel file — dove compare due volte, l'import e
# la chiamata. Commentare l'import lasciava la prova verde mentre il router smetteva di rispondere:
# ogni compito sarebbe tornato al motore piu' caro, in silenzio.
#
# Stampa "modello|tier|collegato(1/0)", oppure niente se non ha potuto decidere.
#
# Prova: node cervello/test/i-freni-di-spesa-scollegati.test.mjs

router_scegli_modello() {
  ROUTER_COMPITO="$1" node --input-type=module 2>/dev/null <<'NODE' || true
import { scegliModello } from "./cervello/banco-ai.mjs";
const s = scegliModello(process.env.ROUTER_COMPITO || "");
process.stdout.write([s.modello, s.tier, s.collegato ? "1" : "0"].join("|"));
NODE
}
