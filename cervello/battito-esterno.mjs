#!/usr/bin/env node
// AR-430 / AR-371 — chi controlla che la macchina sia viva abitava dentro la macchina.
//
// IL DANNO, misurato: dal 27/7 22:32 al 29/7 16:43 il VPS è stato fermo — dodici tick mancati di
// fila, quaranta ore — e nessun allarme è partito. Non perché l'allarme fosse rotto: perché ogni
// controllo di vitalità gira dentro `giro.sh` o da un timer del VPS, cioè **dentro la cosa che si
// era fermata**. Un morto non può chiamare il medico. Il blackout l'ha scoperto Nicola.
//
// LA CURA non è un allarme in più nello stesso posto: è un osservatore che vive **fuori**. Questo
// script gira su GitHub Actions, che non sa nemmeno che il VPS esista. Non gli serve una chiave:
// legge le tracce che i processi automatici lasciano nel repo (le stesse che guarda la visita —
// `FONTI_TRACCE` in salute.mjs, un elenco solo) e le giudica con la stessa funzione, `giudicaTracce`.
// Se copiassi qui la logica, fra un mese misurerei una macchina diversa da quella che misura la
// visita: è la malattia `cadenza-copiata-a-mano`, già pagata tre volte.
//
// PERCHÉ LA ISSUE E NON TELEGRAM: l'unico allarme previsto usciva da Telegram, che è spento, e il
// codice armava il timer del silenzio lo stesso — l'allerta svaniva e restava scritto che era
// partita (AR-365). La issue su GitHub arriva a Nicola per notifica, non ha bisogno di segreti
// (`GITHUB_TOKEN` ce l'ha già l'Action) e soprattutto **si può verificare**: l'Action guarda cosa
// torna dalla chiamata, non il fatto che sia partita.
//
// PERCHÉ UNA SOLA ISSUE CHE SI AGGIORNA: girando ogni ora, quaranta ore di blackout facevano
// quaranta issue. Un allarme che si impara a ignorare è peggio di nessun allarme — perciò
// `decidiAzione` apre la prima volta, poi commenta, e **chiude da sola** quando la macchina torna:
// un allarme che nessuno spegne diventa arredamento.

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..");

const { giudicaTracce, leggiTracce } = await import(join(QUI, "salute.mjs"));

/** L'etichetta che rende ritrovabile l'unica issue di questo guardiano. */
export const ETICHETTA = "macchina-ferma";

/**
 * Decide cosa fare, dato l'esito del controllo e l'eventuale issue già aperta.
 *
 * È qui che sta tutta la decisione — funzione pura, nessun I/O — perché una logica dentro un YAML
 * di GitHub Actions non la può eseguire nessun test: si potrebbe solo cercare una parola nel file,
 * ed è esattamente il tipo di prova che ha lasciato vivere questi difetti per mesi.
 *
 * @param {{esito: 'ok'|'rotto'|'nonvisto', detto: string, dati?: object}} esito
 * @param {{numero: number}|null} issueAperta
 */
export function decidiAzione({ esito, issueAperta = null, adesso = new Date() } = {}) {
  const quando = formattaOra(adesso);
  const detto = esito?.detto || "(nessun dettaglio)";

  // ⚪ non è mai ✅ (legge della visita). Un guardiano che non ha potuto misurare NON deve spegnere
  // un allarme vero: sarebbe il modo più elegante di perdere un blackout — l'occhio si chiude e la
  // stanza risulta in ordine.
  if (esito?.esito === "nonvisto") {
    return {
      azione: "taci",
      perche: issueAperta
        ? "non ho potuto misurare: lascio l'allarme aperto, perché ⚪ non è un verde"
        : "non ho potuto misurare: non apro un allarme su ciò che non ho visto",
      cieco: true,
    };
  }

  if (esito?.esito === "rotto") {
    if (issueAperta) {
      return {
        azione: "commenta",
        numero: issueAperta.numero,
        corpo: `Ancora ferma — controllato il ${quando}.\n\n${detto}`,
        perche: "l'allarme è già aperto: lo aggiorno invece di aprirne un altro",
      };
    }
    return {
      azione: "apri",
      // Titolo detto a voce: niente sigle, niente path — quelli scendono nel corpo, per chi esegue.
      titolo: titoloUmano(esito),
      corpo: [
        `**${detto}**`,
        "",
        `Controllato il ${quando} da GitHub Actions — cioè da fuori il VPS, che è il motivo per cui`,
        "questo messaggio esiste: i controlli che girano sul server non parlano quando è il server a",
        "fermarsi.",
        "",
        "**Cosa vuol dire:** nessun processo automatico (giro, ritmo, sentinelle) sta più scrivendo in",
        "memoria. La macchina non sta lavorando.",
        "",
        "**Cosa fare, sul VPS:**",
        "```bash",
        "systemctl status mycity-giro.timer mycity-giro.service --no-pager",
        "journalctl -u mycity-giro -n 80 --no-pager",
        "sudo systemctl restart mycity-giro.service   # se risulta appeso",
        "```",
        "",
        "Se i timer risultano attivi ma non producono nulla, il guasto è nel motore AI (quota o",
        "credenziali scadute), non nei servizi: `cervello/vps/collega-claude.sh`.",
        "",
        "_Questa issue si chiude da sola appena la macchina torna a lasciare tracce._",
      ].join("\n"),
      perche: "la macchina tace da troppo e non c'è ancora un allarme aperto",
    };
  }

  if (issueAperta) {
    return {
      azione: "chiudi",
      numero: issueAperta.numero,
      corpo: `Ripartita — ${detto} (controllato il ${quando}).`,
      perche: "la macchina è tornata a lasciare tracce: l'allarme va spento, non lasciato lì",
    };
  }

  // Se è tutto verde, sta zitta: una macchina che parla quando sta bene si impara a non leggere.
  return { azione: "taci", perche: "la macchina lascia tracce regolari" };
}

/** Il titolo che Nicola legge nella notifica: una frase, non un codice. */
export function titoloUmano(esito) {
  const ore = esito?.dati?.ore;
  return Number.isFinite(ore)
    ? `La macchina è ferma da ${ore} ore`
    : "La macchina non sta più lasciando tracce";
}

function formattaOra(d) {
  const p = new Intl.DateTimeFormat("it-IT", {
    timeZone: "Europe/Rome",
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).formatToParts(d).reduce((a, x) => ((a[x.type] = x.value), a), {});
  return `${p.day}/${p.month}/${p.year} alle ${p.hour}:${p.minute}`;
}

/** Il controllo vero, sui file del repo. Separato dalla decisione: così la decisione resta pura. */
export function controlla(radice = REPO) {
  return giudicaTracce(leggiTracce(radice));
}

const lanciato = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (lanciato) {
  const esito = controlla();
  const issueAperta = process.env.ISSUE_APERTA ? { numero: Number(process.env.ISSUE_APERTA) } : null;
  const decisione = decidiAzione({ esito, issueAperta });
  if (process.argv.includes("--json")) {
    console.log(JSON.stringify({ esito, decisione }, null, 2));
  } else {
    console.log(`${esito.esito.toUpperCase()} — ${esito.detto}`);
    console.log(`→ ${decisione.azione}: ${decisione.perche}`);
  }
  // Exit 0 sempre: il guardiano non deve tingere di rosso la lista delle Action quando la macchina
  // è ferma — l'allarme è la issue, non il fallimento del workflow. Un'Action rossa ricorrente si
  // silenzia, ed è il difetto che stiamo curando.
  process.exit(0);
}
