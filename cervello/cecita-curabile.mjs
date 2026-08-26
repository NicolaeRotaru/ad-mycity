#!/usr/bin/env node
// 🩹 UNA CECITÀ CHE UN COMANDO CURA NON È UN PREZZO DELL'AMBIENTE — è una cosa non fatta.
//
// IL DIFETTO CHE CHIUDE, due volte la stessa forma.
//
// · AR-693 — in `cervello/test/` vivono ventinove prove scritte in bash. Girano solo se `bats` è
//   installato, e non lo installa nessuno: né la CI, né il VPS, né l'avvio di sessione. Il banco le
//   dichiara ⚪ «la prova esiste e nessuno l'ha fatta girare» — la parte giusta. Misurato il 26/8
//   installando `bats` in novecento millisecondi: **dieci file rossi, diciannove casi caduti**,
//   invisibili da mesi.
// · AR-800 — in ogni sessione cloud il repo arriva come clone superficiale, e tre controlli del
//   cancello si dichiarano ⚪ invece di dire verde. Anche questa è la parte giusta. Manca il passo
//   dopo: `git fetch --unshallow origin` porta la storia da 50 commit a settemila in pochi secondi,
//   e da lì i tre controlli misurano davvero.
//
// LA MALATTIA È UNA SOLA, e non è il ⚪: è che il ⚪ **si ferma lì**. Un cerchio bianco che nessuno
// può togliere è il prezzo dell'ambiente, e va detto. Un cerchio bianco che un comando toglie in un
// secondo è lavoro non fatto travestito da prezzo dell'ambiente — e la differenza fra i due non la
// vede chi legge, perché sulla pagina hanno lo stesso aspetto.
//
// LA CURA, e perché sta in un file suo. Qui vive la DECISIONE — «questa cecità ha una cura? è stata
// tentata? com'è andata?» — pura, senza dipendenze, in modo che una prova la esegua invece di
// cercarla come parola dentro un sorgente (regola ③ del cantiere). I due punti malati la chiamano:
// `test-cervello.mjs` per `bats`, `storia-git.mjs` per il clone superficiale. Se la decisione
// stesse dentro i due punti sarebbero due copie che si allontanano — la malattia già censita
// `una-parola-con-due-padroni`.
//
// I QUATTRO ESITI, e il terzo è quello che il difetto cancellava:
//   · `vedente`         — non c'è nessuna cecità.
//   · `curata`          — c'era, il comando è stato dato, adesso si vede.
//   · `cieca-curabile`  — c'è, esiste il comando, **nessuno l'ha dato**. NON è un ⚪: è un ⛔.
//   · `cieca-per-forza` — c'è, il comando è stato dato ed è fallito (rete chiusa, permessi, nessun
//                         remoto). Questo sì è un ⚪ legittimo, e si porta dietro il perché.

/**
 * Le cecità che questa casa sa curare, con il comando che le cura.
 *
 * Un registro dichiarato e non un elenco dedotto: la domanda «esiste una cura?» deve avere la stessa
 * risposta ovunque, altrimenti il verdetto dipende da chi lo chiede. Aggiungerne una è dichiarare
 * che quel ⚪ non è più il prezzo dell'ambiente.
 */
export const CURE = {
  "storia-troncata": {
    cosa: "la storia del repo è troncata (clone superficiale)",
    comando: "git fetch --unshallow origin",
    perche:
      "il commit di innesto non ha genitori, quindi git elenca tutto il suo albero come appena cambiato: " +
      "ogni domanda sulla finestra passata esce sbagliata invece che assente",
  },
  "dipendenze-del-pannello": {
    cosa: "manca un pacchetto del Pannello: la prova esiste e nessuno l'ha fatta girare",
    comando: "npm ci --prefix pannello",
    perche:
      "le prove che caricano una rotta del Pannello importano `next`: senza le dipendenze installate " +
      "non partono, e tre schede CHIUSE risultavano «prova rossa adesso» per una cosa che non era mai tornata indietro",
  },
  "prove-bash-senza-esecutore": {
    cosa: "`bats` non è installato: le prove scritte in bash non le esegue nessuno",
    comando: "npm i -g bats",
    perche:
      "ventinove prove esistono, sono vere, e senza il binario non misurano niente: " +
      "il 26/8 installarlo ha fatto uscire dieci file rossi rimasti invisibili per mesi",
  },
};

/** La cura di una cecità, o `null` se quella cecità nessuno la sa curare. */
export function curaPer(chiave) {
  const c = CURE[String(chiave || "")];
  return c ? { chiave: String(chiave), ...c } : null;
}

/**
 * Il verdetto su una cecità. PURA: entra lo stato osservato, esce il giudizio.
 *
 * `riuscita` va letto come un terzo valore e non come un booleano: `null` = il tentativo non c'è
 * stato. Un tentativo mai fatto e un tentativo fallito portano a due decisioni diverse — la prima è
 * un lavoro da fare, la seconda è un limite da dichiarare — e appiattirle su `false` è esattamente
 * il modo in cui questa malattia è sopravvissuta.
 *
 * @param chiave    quale cecità (una chiave di CURE, o una sconosciuta)
 * @param cieco     la cecità c'è, adesso?
 * @param tentata   il comando è stato dato?
 * @param riuscita  com'è andato: `true` | `false` | `null` (non tentato)
 * @param motivo    il perché della cecità, come l'ha detto chi l'ha osservata
 * @returns {{stato: string, riga: string, comando: string|null, curabile: boolean}}
 */
export function verdettoCecita({ chiave = "", cieco = false, tentata = false, riuscita = null, motivo = "" } = {}) {
  const cura = curaPer(chiave);
  const comando = cura ? cura.comando : null;
  const perche = String(motivo || cura?.cosa || "cecità non descritta");

  if (!cieco) {
    return {
      stato: tentata && riuscita ? "curata" : "vedente",
      riga: tentata && riuscita ? `✅ ${perche} → curata con \`${comando}\`` : "✅ nessuna cecità",
      comando,
      curabile: Boolean(cura),
    };
  }
  if (!cura) {
    return {
      stato: "cieca-per-forza",
      riga: `⚪ ${perche} — non conosco un comando che la curi`,
      comando: null,
      curabile: false,
    };
  }
  if (!tentata) {
    return {
      stato: "cieca-curabile",
      riga: `⛔ ${perche} — questa cecità si cura: \`${comando}\`. Nessuno l'ha dato, quindi non è il prezzo dell'ambiente: è una cosa non fatta.`,
      comando,
      curabile: true,
    };
  }
  return {
    stato: "cieca-per-forza",
    riga: `⚪ ${perche} — ho provato \`${comando}\` e non è bastato: la cecità resta e non dipende da me`,
    comando,
    curabile: true,
  };
}

/**
 * Esegue la cura UNA volta sola e rimisura. Impura per forza: qui si dà il comando.
 *
 * Una volta sola, e per due motivi diversi. Il primo è il costo: otto guardiani che chiedono la
 * stessa storia farebbero otto `fetch`. Il secondo è più importante — un comando che fallisce e
 * viene ritentato a ogni chiamata trasforma un limite dichiarato in una lentezza inspiegabile, e
 * chi la vede spegne il guardiano invece di leggerlo.
 *
 * @param chiave     quale cecità
 * @param esegui     () => boolean — dà il comando, torna se è andata
 * @param rimisura   () => stato osservato dopo la cura
 * @param memoria    Map dei tentativi già fatti in questo processo (iniettabile: le prove non
 *                   devono ereditare i tentativi delle prove precedenti)
 */
export function curaUnaVolta({ chiave, esegui, rimisura, memoria = TENTATIVI } = {}) {
  const gia = memoria.get(chiave);
  if (gia !== undefined) return { tentata: true, riuscita: gia, stato: rimisura(), gia: true };
  let riuscita = false;
  try {
    riuscita = Boolean(esegui());
  } catch {
    riuscita = false; // un comando che esplode è un comando che non ha curato, non un errore da propagare
  }
  memoria.set(chiave, riuscita);
  return { tentata: true, riuscita, stato: rimisura(), gia: false };
}

/** I tentativi di questo processo. Esportata perché una prova possa svuotarla fra un caso e l'altro. */
export const TENTATIVI = new Map();
