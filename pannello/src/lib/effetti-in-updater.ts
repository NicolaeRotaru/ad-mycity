// ═══════════════════════════════════════════════════════════════════════════
// AR-605 — GLI ATTI NON PARTONO DA DENTRO UN AGGIORNAMENTO DI STATO
//
// Il difetto: salvataggi su Supabase, scritture in `localStorage` e letture di dettagli partivano da
// dentro la funzione di aggiornamento di un `setState`. React può richiamare quella funzione più di
// una volta (StrictMode in sviluppo, disegno concorrente): la stessa scrittura parte doppia. Il repo
// la regola ce l'aveva già scritta — nel commento della cura AR-268 in ParlaCasella, «un updater può
// essere richiamato più volte da React» — ma era un cartello, non un freno: cinque punti la
// violavano, e nessuno se ne accorgeva.
//
// LA CURA DI SISTEMA non è riparare i cinque punti: è un guardiano che li conta. Qui sotto c'è un
// lettore di sorgente che trova ogni aggiornamento di stato scritto come funzione e guarda se dentro
// c'è un ATTO. Vale per chiunque scriva il prossimo componente, non solo per chi ha letto il
// commento. Il tetto è ZERO e la prova lo pretende (`cervello/test/c4-effetti-fuori-dagli-updater.test.mjs`).
//
// Perché sta qui e non dentro il test: così la prova può farlo girare su sorgenti finte — un caso
// malato e uno sano — e dimostrare che il metro sa distinguere. Un guardiano che non è mai stato
// visto dire «rosso» è indistinguibile da un guardiano scollegato.
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Toglie commenti e stringhe, lasciando la lunghezza invariata (gli spazi prendono il loro posto):
 * così i numeri di riga restano quelli veri.
 *
 * Serve perché senza questo passo un `await` NOMINATO in un commento («dopo l'`await fetch`»)
 * verrebbe scambiato per un atto — è successo alla prima versione di questo lettore, e avrebbe
 * dichiarato malato un punto sano.
 */
export function senzaCommentiNeStringhe(src: string): string {
  const s = String(src ?? "");
  let out = "";
  let i = 0;
  const bianco = (c: string) => (c === "\n" ? "\n" : " ");
  while (i < s.length) {
    const c = s[i];
    const d = s[i + 1];
    if (c === "/" && d === "/") {
      while (i < s.length && s[i] !== "\n") out += bianco(s[i++]);
      continue;
    }
    if (c === "/" && d === "*") {
      out += "  ";
      i += 2;
      while (i < s.length && !(s[i] === "*" && s[i + 1] === "/")) out += bianco(s[i++]);
      out += "  ";
      i += 2;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      const chiusura = c;
      out += " ";
      i++;
      while (i < s.length) {
        if (s[i] === "\\") {
          out += "  ";
          i += 2;
          continue;
        }
        if (s[i] === chiusura) break;
        out += bianco(s[i++]);
      }
      out += " ";
      i++;
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

/** `setTimeout` e compagni assomigliano a un `setStato` ma non lo sono: non hanno un valore vecchio. */
const NON_SONO_STATI = new Set(["setTimeout", "setInterval", "setImmediate"]);

/** Gli ATTI: cose che toccano il mondo fuori e che rifatte due volte si vedono. */
const ATTI: { nome: string; re: RegExp }[] = [
  { nome: "una richiesta di rete", re: /\bfetch\s*\(/ },
  { nome: "una promessa lanciata e dimenticata (`void …`)", re: /\bvoid\s+[A-Za-z_$]/ },
  { nome: "una scrittura nella memoria del browser", re: /\b(?:local|session)Storage\.(?:set|remove)Item\s*\(/ },
  { nome: "un'attesa (`await`)", re: /\bawait\b/ },
  { nome: "un annuncio agli altri riquadri", re: /\b(?:emit|dispatch)[A-Z]\w*\s*\(/ },
  { nome: "una chiamata che scrive o legge fuori", re: /\b(?:persist|salva|scrivi|carica|invia|manda|accoda|log)[A-Z]\w*\s*\(/ },
];

export type AttoInUpdater = {
  file: string;
  riga: number;
  setter: string;
  atto: string;
};

/**
 * Ogni `setQualcosa((prev) => …)` il cui corpo contiene un atto.
 *
 * Riconosce l'updater dalla forma dell'argomento: deve cominciare con una funzione freccia. Un
 * `setLavori(merged)` — valore già calcolato fuori, che è la cura — non è un updater e non si conta.
 */
export function attiDentroGliUpdater(file: string, sorgente: string): AttoInUpdater[] {
  const src = senzaCommentiNeStringhe(sorgente);
  const trovati: AttoInUpdater[] = [];
  const apre = /\b(set[A-Z]\w*)\(/g;
  let m: RegExpExecArray | null;
  while ((m = apre.exec(src))) {
    if (NON_SONO_STATI.has(m[1])) continue;
    const inizio = m.index + m[0].length - 1;
    let liv = 0;
    let fine = -1;
    for (let i = inizio; i < src.length; i++) {
      if (src[i] === "(") liv++;
      else if (src[i] === ")") {
        liv--;
        if (liv === 0) {
          fine = i;
          break;
        }
      }
    }
    if (fine < 0) continue;
    const corpo = src.slice(inizio, fine + 1);
    // L'argomento è una funzione? `(prev) =>`, `prev =>`, `(prev: T) =>`, `async (prev) =>`.
    // `async` va previsto: un updater asincrono è la forma PEGGIORE del difetto (React scarta il
    // valore che torna), e lasciarlo fuori dal riconoscimento sarebbe un buco proprio nel caso grave.
    if (!/^\(\s*(?:async\s+)?(?:\([^()]*\)|[A-Za-z_$][\w$]*)\s*(?::[^=]*?)?=>/.test(corpo)) continue;
    for (const a of ATTI) {
      if (a.re.test(corpo)) {
        trovati.push({
          file,
          riga: src.slice(0, m.index).split("\n").length,
          setter: m[1],
          atto: a.nome,
        });
        break;
      }
    }
  }
  return trovati;
}
