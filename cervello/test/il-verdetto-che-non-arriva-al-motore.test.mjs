// AR-079 e AR-081 — il silo di allocazione dello sforzo: misurarlo a ogni giro, e far arrivare il
// suo verdetto al motore come una regola invece che come una riga di log.
//
// La scheda è chiusa dal 22/8: il verdetto dell'allocazione dello sforzo diventa un vincolo HARD per
// il motore, non una riga di log. Il fix c'è. **La sua prova non provava niente**, ed è per questo
// che questo file esiste.
//
// Come era rotta: `assert.match(giro, /ALLOC_VINCOLO/)`. In `giro.sh` quella parola compare cinque
// volte, e la mutazione registrata per rimettere il difetto ne rinomina UNA in
// `ALLOC_VINCOLO_SPENTO` — che contiene ancora, lettera per lettera, la parola cercata. La prova non
// poteva diventare rossa nemmeno col vincolo spento. Sesta forma dello stesso difetto in due giorni.
//
// Qui non si guarda nessun sorgente: si RITAGLIANO da `giro.sh` i due tratti veri — quello che
// interroga il guardiano e quello che infila il vincolo nel prompt — e li si ESEGUE con un guardiano
// finto che esce 0, 1 o 2. Si guarda il prompt che ne esce.
//
// E riparandola è saltato fuori un difetto vero, AR-842: il blocco si scriveva il vincolo da solo, e
// su rc=2 (il guardiano NON ha potuto misurare) diceva al motore «una entità non confermata sta
// accumulando asset pesanti» — una frase sul CONTENUTO, mentre nessuno aveva guardato il contenuto.
import { ok, titolo, finisci, sandbox, tratto, eseguiBash, guardianoFinto } from "./c4-banco.mjs";

const PROMPT_BASE = "PROMPT-DI-PARTENZA";

/**
 * Esegue i due tratti veri di giro.sh, in fila, con un `allocazione-check.mjs` finto che esce `rc`.
 * Torna il PROMPT come lo riceverebbe il motore.
 */
function giroConGuardianoA(rc) {
  const dove = sandbox(`alloc-rc${rc}`);
  guardianoFinto(dove, "allocazione-check.mjs", { stampa: "referto finto del guardiano", rc });
  // `guardiano` marca l'uso di una lezione quando il freno è rosso: qui è una finta che non deve
  // cambiare niente. Se manca, il tratto stampa un avviso e prosegue — e la prova non lo distingue
  // da un fallimento del guardiano vero.
  guardianoFinto(dove, "freno-scattato.mjs", { rc: 0 });
  return {
    dove,
    ...eseguiBash({
      dove,
      preludio:
        `SCRIPT_DIR=${JSON.stringify(dove)}\n` +
        `. "${process.cwd()}/cervello/giro-esito.sh"\n` +
        `ts() { echo 00:00; }\n` +
        `ALLOC_VINCOLO=""\n` +
        `PROMPT=${JSON.stringify(PROMPT_BASE)}\n` +
        `for _un_giro in 1; do\n`,
      blocco:
        tratto("cervello/giro.sh", 'guardiano "allocazione-check.mjs"', "Guardiano registro scelte ragionate") +
        "\ndone\n" +
        tratto("cervello/giro.sh", 'if [ -n "$ALLOC_VINCOLO" ]; then', 'if [ -n "${REGISTRO_SCELTE_VINCOLO:-}" ]; then'),
      leggi: ["PROMPT", "ALLOC_VINCOLO", "GUARDIANO_RC"],
    }),
  };
}

titolo("il guardiano passa: il motore non riceve nessun vincolo");
{
  const r = giroConGuardianoA(0);
  if (r.cieco) ok(false, "i tratti di giro.sh si eseguono", r.cieco);
  else {
    ok(r.vars.GUARDIANO_RC === "0", "il guardiano ha davvero risposto 0", r.log);
    ok(r.vars.ALLOC_VINCOLO === "", "nessun vincolo", r.vars.ALLOC_VINCOLO);
    ok(r.vars.PROMPT === PROMPT_BASE, "il prompt esce identico: un blocco vuoto insegna a ignorare quei blocchi", r.vars.PROMPT);
  }
}

titolo("il guardiano boccia: il vincolo ARRIVA al motore, ed è marcato HARD");
{
  const r = giroConGuardianoA(1);
  if (r.cieco) ok(false, "i tratti di giro.sh si eseguono", r.cieco);
  else {
    ok(r.vars.GUARDIANO_RC === "1", "il guardiano ha davvero risposto 1", r.log);
    ok(/ALLOCAZIONE SFORZO SBILANCIATA/.test(r.vars.ALLOC_VINCOLO), "il vincolo di dominio è stato composto", r.vars.ALLOC_VINCOLO);
    ok(r.vars.PROMPT !== PROMPT_BASE, "**il prompt è cambiato**: è questo che distingue un freno da un rituale", r.vars.PROMPT);
    ok(r.vars.PROMPT.includes(PROMPT_BASE), "e il prompt di partenza non è stato buttato via", r.vars.PROMPT.slice(0, 200));
    ok(/ALLOCAZIONE SFORZO SBILANCIATA/.test(r.vars.PROMPT), "il testo del vincolo è dentro il prompt", r.vars.PROMPT);
    ok(/HARD/.test(r.vars.PROMPT), "ed è marcato HARD: al motore si dice che non è un consiglio", r.vars.PROMPT);
  }
}

titolo("AR-842 — il guardiano è CIECO: al motore si dice «ripara lo strumento», non una bugia sul contenuto");
{
  const r = giroConGuardianoA(2);
  if (r.cieco) ok(false, "i tratti di giro.sh si eseguono", r.cieco);
  else {
    ok(r.vars.GUARDIANO_RC === "2", "il guardiano ha davvero risposto 2", r.log);
    ok(r.vars.ALLOC_VINCOLO !== "", "un cieco NON è un verde: un vincolo c'è", r.vars.ALLOC_VINCOLO);
    ok(
      !/ALLOCAZIONE SFORZO SBILANCIATA/.test(r.vars.PROMPT),
      "e NON è la frase di dominio: nessuno ha guardato il contenuto, dirlo sarebbe una bugia",
      r.vars.PROMPT,
    );
    ok(/GUARDIANO CIECO/.test(r.vars.PROMPT), "è la frase del cieco", r.vars.PROMPT);
    ok(/[Rr]ipara lo strumento/.test(r.vars.PROMPT), "che dice cosa fare: riparare lo strumento", r.vars.PROMPT);
  }
}

titolo("AR-079 · il verdetto lo raccoglie chi non lo perde: non finisce in una pipe");
{
  // AR-079 nasce da `node allocazione-check.mjs 2>&1 | tail -6 || true`: in una pipe il codice che
  // conta è quello di `tail`, sempre 0, quindi il verdetto si perdeva e il vincolo non nasceva mai.
  // La sua prova cercava l'idioma `_alloc_rc=$?` dentro `giro.sh` — guardava la forma, non l'effetto:
  // cambiare idioma la rompeva anche migliorando il codice, e togliere il vincolo la lasciava verde.
  // Adesso il blocco passa da `guardiano`, che l'esito non lo perde e in più marca la lezione quando
  // il freno è rosso. Si verifica ESEGUENDO: il sigillo del finto dice se è stato chiamato davvero,
  // e i tre casi qui sopra dicono se il verdetto è arrivato fino al prompt.
  const r = giroConGuardianoA(1);
  if (r.cieco) ok(false, "il tratto si esegue", r.cieco);
  else {
    const chiamato = eseguiBash({
      dove: r.dove,
      preludio: `[ -f ${JSON.stringify(`${r.dove}/partito-freno-scattato.mjs`)} ] && MARCATO=1 || MARCATO=0\n`,
      blocco: ":",
      leggi: ["MARCATO"],
    });
    ok(chiamato.vars?.MARCATO === "1", "su freno rosso l'uso della lezione viene marcato: è l'unico punto in cui una lezione risulta USATA", r.log);
  }
}

finisci("il verdetto dell'allocazione arriva davvero al motore (AR-081 · AR-842)");
