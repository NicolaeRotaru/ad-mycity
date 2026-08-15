// AR-143 — UN SEGRETO CHE FINISCE SU DISCO CI RESTA.
//
// `collega-marketplace.mjs` scriveva l'indirizzo del repo **col token dentro** dentro
// `marketplace/.git/config` (`git remote set-url origin https://x-access-token:<PAT>@github.com/…`)
// e non lo toglieva più. Da quel momento chiunque potesse leggere un file di quella cartella aveva
// il token di GitHub, senza bisogno di arrivare al `.env` — che invece è protetto in lettura.
//
// La differenza con `cervello/vps/trigger-build.sh`, che il difetto cita come modello, è che là
// l'indirizzo autenticato veniva rimesso a posto subito dopo. Qui non veniva rimesso mai.
//
// ── PERCHÉ IL RIPRISTINO NON BASTA ───────────────────────────────────────────
// «Scrivo il segreto e poi lo cancello» lascia comunque una finestra, e la finestra è tutta la
// durata del clone. Se il programma muore in mezzo (rete, disco, Ctrl-C), il segreto resta. La cura
// vera è **non scriverlo mai**: l'indirizzo salvato è pulito, e le credenziali arrivano al singolo
// comando da una variabile d'ambiente, per il tempo di quel comando.
//
// Tre pezzi, tutti puri e provabili senza rete:
//   · `urlSenzaCredenziali` — l'indirizzo com'è giusto che stia scritto su disco;
//   · `pianoDiCollegamento` — la SEQUENZA di comandi git da lanciare. È qui che vive la decisione,
//     quindi è qui che un test la può eseguire: nessun elemento della sequenza contiene il segreto;
//   · `credenzialiInConfig` — il controllo sul DATO. Gira DOPO ogni operazione e guarda il file
//     vero: se un segreto è comparso lì dentro, da qualunque strada sia arrivato, si vede. È il
//     freno messo al confine invece che dentro il comando — un canale nuovo che clonasse per
//     un'altra via passerebbe comunque da qui.
//
// ⚠️ Nessuna funzione di questo file stampa mai il valore del token, nemmeno accorciato.

/** Il nome della variabile d'ambiente da cui git prende la password, un comando alla volta. */
export const ENV_TOKEN = "MYCITY_GIT_TOKEN";

/**
 * L'aiutante di credenziali: dice a git utente e password leggendole dall'AMBIENTE.
 * Il segreto non passa quindi dalla riga di comando (dove `ps` lo mostrerebbe a chiunque) e non
 * finisce nel file di configurazione (dove resterebbe per sempre).
 */
export function aiutanteCredenziali(nomeVariabile = ENV_TOKEN) {
  return `!f() { echo username=x-access-token; echo "password=\${${nomeVariabile}}"; }; f`;
}

/** L'indirizzo ripulito da qualunque `utente:password@` — è la forma che può stare su disco. */
export function urlSenzaCredenziali(url) {
  const s = String(url || "");
  return s.replace(/^(https?:\/\/)[^/@\s]*@/i, "$1");
}

/** L'indirizzo pubblico del repo, quello che va scritto nel remote. */
export function urlPubblico(repo) {
  return `https://github.com/${String(repo || "").replace(/^\/+|\/+$/g, "")}.git`;
}

/**
 * La sequenza di comandi git per collegare/aggiornare la copia locale.
 *
 * Il clone vero e proprio NON si usa: `git clone -c chiave=valore` scrive quella chiave nel
 * repository appena creato, quindi anche l'aiutante di credenziali resterebbe su disco. Si fa
 * invece `init` + `remote add` con l'indirizzo pulito + `fetch` autenticato con `-c`, che su un
 * comando normale vale solo per quella invocazione e non viene salvato da nessuna parte.
 *
 * @returns {{argv:string[], autenticato:boolean, descrizione:string}[]}
 */
export function pianoDiCollegamento({ repo, branch = "main", esiste = false, conToken = false } = {}) {
  const url = urlPubblico(repo);
  const c = conToken ? ["-c", `credential.helper=${aiutanteCredenziali()}`] : [];
  const passi = [];
  if (!esiste) {
    passi.push({ argv: ["init", "-q"], autenticato: false, descrizione: "prepara la cartella" });
  }
  passi.push({ argv: ["remote", "set-url", "origin", url], autenticato: false, descrizione: "indirizzo PULITO nel file di configurazione" });
  passi.push({ argv: [...c, "fetch", "--depth", "1", "origin", branch], autenticato: conToken, descrizione: "scarica" });
  passi.push({ argv: ["checkout", "-f", "-B", branch, "FETCH_HEAD"], autenticato: false, descrizione: "mette la copia sul ramo" });
  passi.push({ argv: ["clean", "-fd"], autenticato: false, descrizione: "toglie i residui" });
  return passi;
}

/** Il segreto compare in questa sequenza di comandi? Deve rispondere sempre di no. */
export function segretoNelPiano(passi, segreto) {
  const s = String(segreto || "");
  if (!s) return [];
  return (passi || [])
    .map((p, i) => ({ i, dove: (p.argv || []).findIndex((a) => String(a).includes(s)) }))
    .filter((x) => x.dove >= 0)
    .map((x) => ({ passo: x.i, argomento: x.dove }));
}

/**
 * Il controllo sul DATO: nel testo di un `.git/config` c'è un indirizzo con le credenziali dentro?
 *
 * Torna il NUMERO DI RIGA e la chiave, **mai il valore**: un guardiano che stampa il segreto per
 * dire che il segreto non va stampato è il difetto due volte.
 */
export function credenzialiInConfig(testo) {
  const righe = String(testo || "").split("\n");
  const out = [];
  righe.forEach((r, i) => {
    const m = /^\s*([\w.-]+)\s*=\s*(https?:\/\/[^/@\s]*@[^\s]*)$/i.exec(r);
    if (m) out.push({ riga: i + 1, chiave: m[1], motivo: "indirizzo con utente:password scritto in chiaro" });
    else if (/^\s*credential\.helper\s*=/i.test(r) || /^\s*helper\s*=/i.test(r)) {
      if (/(?:ghp_|github_pat_|gho_|ghs_)/.test(r)) out.push({ riga: i + 1, chiave: "credential.helper", motivo: "un aiutante di credenziali col segreto scritto dentro" });
    }
  });
  return out;
}

/** Il testo del config ripulito: le credenziali tolte dagli indirizzi, il resto intatto. */
export function configRipulito(testo) {
  return String(testo || "")
    .split("\n")
    .map((r) => {
      const m = /^(\s*[\w.-]+\s*=\s*)(https?:\/\/[^/@\s]*@[^\s]*)$/i.exec(r);
      return m ? `${m[1]}${urlSenzaCredenziali(m[2])}` : r;
    })
    .join("\n");
}
