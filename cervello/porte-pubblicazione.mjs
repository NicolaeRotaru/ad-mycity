#!/usr/bin/env node
// AR-127 — la memoria che mente passa da un'altra porta.
//
// C'è un cancello condiviso, `gate_pubblicazione` in `cervello/gate-pubblicazione.sh`, e fa il suo
// mestiere: controlla il ramo, il perimetro (solo memoria, mai codice), e i guardiani di verità
// (scan-segreti, coerenza-fatti, vault-sanita). È **fail-closed** — se manca `node` non pubblica,
// invece di passare al verde per non aver potuto misurare.
//
// Misurato il 28/7, e il difetto va rovesciato rispetto a come è scritto. `ritmo.sh`, `monitora.sh` e
// `worker.sh` il cancello lo chiamano già (fu il fix del 27/7). Le due porte scoperte sono altre:
//
//   · **`giro.sh`** — il motore principale, quello su cui il cancello è stato modellato, gira ancora
//     una copia scritta a mano: ha il perimetro (AR-044) ma non il controllo del ramo, e i guardiani
//     di verità li esegue prima, come vincoli al motore, non come cancello davanti al push. Due
//     implementazioni della stessa regola: quando una si rafforza, l'altra non lo sa.
//
//   · **`monitora.sh`, il recupero delle scritture pendenti** — committa e pusha quello che un run
//     morto ha lasciato a metà, e lo fa PRIMA che il cancello sia caricato. È la porta più pericolosa
//     delle due: scatta esattamente quando la memoria ha più probabilità di essere scritta a metà.
//     Nei commit del VPS quel messaggio — «recupero: scritture pendenti da un run interrotto» —
//     compare 6 volte negli ultimi 60.
//
// È la terza volta che questa forma torna: il cancello dentro l'esecutore invece che al confine.
// AR-272 sulle uscite verso il mondo, AR-169 sugli invarianti del registro, e adesso sui push.
// Quando una regola vive in N posti, prima o poi N-1 restano indietro.
//
// Nessuna dipendenza: si esegue su testo passato da fuori, così un test può provarlo su uno script
// finto invece che su com'è il repo adesso.

/**
 * Un push verso il remoto. Non ci interessano i push locali o i `git push --dry-run`.
 * Il prefisso può essere un `timeout 60` oppure un array di comando (`"${T[@]}" git push …`), che è
 * la forma usata dal loop condiviso: senza riconoscerla, la porta più importante — quella da cui
 * passano ORA giro, ritmo e monitora — sarebbe invisibile a questo guardiano.
 *
 * E fra `git` e `push` ci possono stare le OPZIONI GLOBALI di git — `-c chiave=valore`, `-C cartella`,
 * `--no-pager`, oppure un array che le porta (`git "${C4_GIT_OPZ[@]}" push …`, la forma con cui il
 * worker pubblica dal 14/8). Misurato: prima del lotto 41 le porte viste erano 8, dopo 7, e la
 * mancante era proprio quella del worker — la più usata, una a ogni lavoro. La porta non era sparita
 * né rimasta scoperta (il cancello sopra c'è, worker.sh riga 291): era il METRO a leggere ancora la
 * forma vecchia. Un guardiano che smette di vedere una porta perché quella porta è stata scritta un
 * po' diversa è un verde comprato, ed è la malattia che questo file cura.
 */
const RE_OPZ_GLOBALE = String.raw`(?:"\$\{[A-Za-z_]\w*\[@\]\}"|-c\s+\S+|-C\s+\S+|--[\w-]+(?:=\S+)?)`;
const RE_PUSH = new RegExp(
  String.raw`^\s*(?:if\s+)?(?:(?:timeout\s+"?\$?\{?[\w:-]+\}?"?|"\$\{[A-Za-z_]\w*\[@\]\}")\s+)*git\s+(?:${RE_OPZ_GLOBALE}\s+)*push\s`,
);

/**
 * La porta INDIRETTA: chi pubblica chiamando il loop condiviso `pubblica_memoria`. Conta come porta
 * a tutti gli effetti — è da lì che esce la memoria — e va anch'essa preceduta dal cancello.
 */
const RE_PORTA_CONDIVISA = /\bpubblica_memoria\s+"/;

/**
 * La stessa porta scritta in JavaScript (lotto 33, AR-382).
 *
 * Finché il perimetro era «solo .sh di primo livello», bastava riconoscere la sintassi della shell.
 * Adesso che il guardiano scende anche nelle sottocartelle e legge i .mjs, fermarsi alla shell
 * sarebbe peggio del buco di prima: trasformerebbe una zona non guardata in un VERDE. È la forma
 * esatta di AR-380 — «il perimetro dedotto dagli esempi disponibili invece che dal bene da
 * proteggere» — e non va ripetuta dentro la cura di sé stessa.
 *
 * Copre le tre strade con cui Node lancia git: `execSync("git push …")`, `execFileSync("git",
 * ["push", …])` e `spawn*` nelle stesse due forme.
 */
const RE_PUSH_JS = [
  /\b(?:exec|execSync|execFile|execFileSync|spawn|spawnSync)\s*\(\s*["'`][^"'`]*\bgit\s+push\b/,
  /\b(?:execFile|execFileSync|spawn|spawnSync)\s*\(\s*["'`]git["'`]\s*,\s*\[\s*["'`]push["'`]/,
];

/**
 * Il cancello, in una delle forme in cui compare: la chiamata al gate completo, oppure la guardia
 * del ramo usata da sola dentro il loop condiviso (è l'ultima difesa prima del push).
 */
const RE_GATE = /gate_pubblicazione\s+"|\bramo_ammesso\s+"/;

/**
 * Righe che spengono il controllo: un push dentro un commento non è un push.
 * Da quando il perimetro comprende i .mjs servono anche le forme JavaScript (`//`, `*`, `/*`):
 * senza, il guardiano accusava la propria riga di documentazione. È la stessa lezione già scritta
 * in firma-riservata.mjs — un metro che accusa chi documenta la regola insegna a non documentarla.
 */
const commento = (riga) => /^\s*(?:#|\/\/|\*|\/\*)/.test(riga);

/**
 * Trova ogni push verso il remoto in uno script e dice se, PRIMA di quel punto, il cancello è stato
 * chiamato. «Prima nel file» è un'approssimazione — non segue i rami dell'esecuzione — e va bene per
 * quello che serve: se il cancello non compare nemmeno sopra, di sicuro quel push non ci passa.
 * Il caso opposto (cancello sopra ma su un ramo che non porta al push) resta da guardare a mano, e
 * questa funzione non pretende di coprirlo: meglio un controllo che dichiara il proprio limite di uno
 * che promette di più.
 */
export function porteDi(testo, nome = "?") {
  const righe = String(testo || "").split("\n");
  const porte = [];
  let gateVistoA = null;
  righe.forEach((riga, i) => {
    if (commento(riga)) return;
    if (RE_GATE.test(riga)) gateVistoA = i + 1;
    if (RE_PUSH.test(riga) || RE_PORTA_CONDIVISA.test(riga) || RE_PUSH_JS.some((re) => re.test(riga))) {
      porte.push({
        file: nome,
        riga: i + 1,
        testo: riga.trim().slice(0, 100),
        gateSopraA: gateVistoA,
        protetta: gateVistoA != null,
      });
    }
  });
  return porte;
}

/**
 * Le porte scoperte, con l'esenzione dichiarata. Un'esenzione senza motivo è il silenzio che stiamo
 * curando: chi esenta una porta deve dire perché, e il perché resta nel file.
 */
export function porteScoperte(porte = [], esenzioni = {}) {
  return porte.filter((p) => {
    if (p.protetta) return false;
    const chiave = `${p.file}:${p.riga}`;
    const e = esenzioni[chiave] || esenzioni[p.file];
    return !(e && String(e).trim().length > 10); // un motivo di due parole non è un motivo
  });
}

/** Contratto dei guardiani (AR-322): 0 tutte protette · 1 una porta scoperta · 2 non ho potuto leggere. */
export function codiceUscita({ cieco = 0, scoperte = 0 } = {}) {
  if (cieco > 0) return 2;
  return scoperte > 0 ? 1 : 0;
}
