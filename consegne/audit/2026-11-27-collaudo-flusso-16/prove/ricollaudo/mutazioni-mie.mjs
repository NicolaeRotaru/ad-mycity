// Mutazioni mie sui punti riparati (nella COPIA). Dopo ognuna: suite del 16, file rimesso, repo vero confrontato.
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
const [COPIA, VERO] = process.argv.slice(2);
const C = 'flussi/16-attivita-da-visitare/codice/';
const K = 'flussi/16-attivita-da-visitare/costruisci.mjs';
const M = [
  ['R1 m8: la mappa con maxTries 1 (retryOnFail resta true, ma nessuna riprova)', K, "onError: 'continueRegularOutput', retryOnFail: true, maxTries: 3, waitBetweenTries: 5000,", "onError: 'continueRegularOutput', retryOnFail: true, maxTries: 1, waitBetweenTries: 5000,"],
  ['R2 m8: la mappa senza onError (dopo 3 tentativi il flusso si ferma, niente messaggio «la lista non c’è»)', K, "onError: 'continueRegularOutput', retryOnFail: true, maxTries: 3, waitBetweenTries: 5000,", "retryOnFail: true, maxTries: 3, waitBetweenTries: 5000,"],
  ['R3 m7: la tabella senza onError (tabella rotta = flusso fermo, il ramo «tabella non ha risposto» non si prende mai)', K, "position: pos(5), alwaysOutputData: true, executeOnce: true,\n      onError: 'continueRegularOutput',", "position: pos(5), alwaysOutputData: true, executeOnce: true,\n     "],
  ['R4 m2: tolto solo «tobacco» dalle categorie escluse (barriera doppia col nome)', C + 'metti-in-fila.js', "'no', 'tobacco', 'mobile_phone_accessories'", "'no', 'mobile_phone_accessories'"],
  ['R5 m2: tolti «printer_ink», «energy», «gas»', C + 'metti-in-fila.js', "'mobile_phone_accessories', 'printer_ink', 'energy', 'gas', 'electronics'", "'mobile_phone_accessories', 'electronics'"],
  ['R6 m1: nome dentro l’altro fino a 500 m invece di 30', C + 'metti-in-fila.js', 'if (d < 30 && v.chiave.length >= 5', 'if (d < 500 && v.chiave.length >= 5'],
  ['R7 m1: nome dentro l’altro anche coi nomi corti (≥1 invece di ≥5)', C + 'metti-in-fila.js', 'v.chiave.length >= 5 && chiave.length >= 5', 'v.chiave.length >= 1 && chiave.length >= 1'],
  ['R8 m1: nome generico fino a 150 m invece di 15', C + 'metti-in-fila.js', 'return d < 15 && v.tipo === tipoGrezzo && (generico || v.generico);', 'return d < 150 && v.tipo === tipoGrezzo && (generico || v.generico);'],
  ['R9 m6: lo schema senza maxLength', C + 'prepara-lavoro.js', "chi_e: { type: 'string', maxLength: 500 }", "chi_e: { type: 'string' }"],
  ['R10 G1: la negazione non conta («non iscritta» resta iscritta) — mutazione nulla di controllo: il codice è già così', C + 'metti-in-fila.js', "if (/iscritt/.test(t)) return 'iscritta';", "if (/iscritt/.test(t) && !/^non?\\b/.test(t)) return 'iscritta';"],
  ['R11 G1: «ok» non vale più sì', C + 'metti-in-fila.js', "if (/^(si|yes|ok)\\b/.test(t)) return 'si';", "if (/^(si|yes)\\b/.test(t)) return 'si';"],
  ['R12 G1: le celle con solo simboli (✅, 👍, ✓) contate come «non capito» invece che «da visitare»', C + 'metti-in-fila.js', "if (!t || /^da[ _]?visitare$/.test(t)) return 'da_visitare';", "if (!String(v ?? '').trim() || /^da[ _]?visitare$/.test(t)) return 'da_visitare';"],
  ['R13 m3: «obi» tolto dalle catene esatte', C + 'metti-in-fila.js', "new Set(['coin', 'obi', 'pam', 'tim'])", "new Set(['coin', 'pam', 'tim'])"],
];
for (const [nome, file, da, a] of M) {
  const p = `${COPIA}/${file}`;
  const orig = readFileSync(p, 'utf8');
  const volte = orig.split(da).length - 1;
  if (volte !== 1) { console.log(`${nome}: SALTATA (${volte})`); continue; }
  writeFileSync(p, orig.replace(da, a));
  let esito;
  try { execSync('node --test flussi/test/16-attivita-da-visitare.test.mjs', { cwd: COPIA, stdio: 'pipe' }); esito = 'VERDE (sopravvive)'; } catch { esito = 'rossa'; }
  writeFileSync(p, orig);
  const intatto = readFileSync(`${VERO}/${file}`, 'utf8') === orig;
  console.log(`${nome}: ${esito}${intatto ? '' : ' · ATTENZIONE: repo vero diverso'}`);
}
