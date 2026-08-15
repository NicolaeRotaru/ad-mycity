// 🧪 PROVE-REGOLE — cosa rende una prova una prova, e una chiusura una chiusura.
//
// Nasce da AR-330, il 27/7. Alle 12:14 è stata mergiata una radiografia con 173 difetti; alle 12:15,
// SESSANTA SECONDI dopo, il commit automatico ne ha chiusi 91 — il 53%, di cui 17 bloccanti. Che
// fossero false si prova senza aprire un file: fra le 09:40 (nascita) e le 12:15 (chiusura) su main
// non era atterrato nessun fix. Non un fix parziale: nessuno.
//
// Il meccanismo è più interessante del danno. Le 91 verifiche erano tutte SODDISFATTE NELL'ISTANTE IN
// CUI IL DIFETTO NASCEVA, perché descrivevano il BUG invece del FIX:
//   AR-227 → pattern `registraFirma(n, "nicola")` presente:true   = «la riga bacata c'è»
//   AR-218 → pattern `Escape` presente:false                       = «il tasto Esc manca»
// Sono descrizioni del sintomo travestite da prove di risoluzione. Chi le ha scritte non ha barato:
// descrivere il bug è la cosa naturale da fare quando lo stai guardando — nei 24 prompt dei senior la
// clausola «scegli un pattern che esisterà SOLO col fix installato» compare in UNO.
//
// Da qui l'invariante che mancava, e che questo file rende controllabile da una macchina:
//
//   ① UNA PROVA GIÀ VERA ALLA NASCITA NON È UNA PROVA. Se il pattern era già soddisfatto nel file
//      com'era il giorno in cui il difetto è nato, quella riga descrive il sintomo, non la cura.
//   ② UNA CHIUSURA SENZA UNA MODIFICA NON È UNA CHIUSURA. Se fra la nascita e adesso il file citato
//      dalla prova non è mai cambiato, non c'è niente che possa aver risolto il difetto.
//
// Le due si coprono a vicenda: la ① intercetta la prova sbagliata quando nasce, la ② intercetta la
// chiusura a vuoto anche quando la prova era scritta bene ma qualcos'altro l'ha resa vera per caso.
// La ① da sola avrebbe fermato tutti e 91.
//
// Nessun import: qui c'è solo il ragionamento. Chi legge git e il filesystem sta fuori e passa i
// fatti già raccolti — così queste regole si possono ESEGUIRE in un test invece che rileggere, che è
// esattamente la differenza fra una prova e una descrizione (la lezione del 27/7, applicata a se stessa).

/**
 * La stessa semantica di confronto che usa auto-fix per decidere se una prova è soddisfatta.
 *
 * Vive qui e non là perché ora la usano in due (auto-fix per chiudere, il guardiano per controllare
 * come stavano le cose alla nascita): due copie divergerebbero, e una prova valutata con due metri
 * diversi non è un metro. auto-fix la importa da qui.
 *
 * Regex OPPURE testo letterale, di proposito: AR-151 ha mostrato che un pattern scritto come testo
 * (`id=eq.$id&stato=eq.in_attesa`) compilato come regex non può mai matchare — quel `$` in mezzo
 * asserisce fine-stringa. L'intento di `pattern` è «nel file ci dev'essere questo»: il confronto
 * letterale lo onora anche quando la regex tradisce.
 */
export function patternTrovato(pattern, testo) {
  return patternNelCodice(pattern, testo);
}

/**
 * AR-355 — UNA RIGA DI COMMENTO NON È UNA RIPARAZIONE.
 *
 * Il caso: due difetti del worker (AR-136, AR-137) risultavano chiusi perché la loro prova citava una
 * frase che nel file esisteva davvero — dentro un commento scritto da chi aveva fatto il fix. Il fix
 * non c'era; c'era la sua descrizione.
 *
 * La causa di sistema, scritta nella scheda: «nel vocabolario delle prove non esiste la nozione di
 * riga eseguibile — per la macchina un file è una stringa, quindi la documentazione di un fix e il
 * fix sono indistinguibili». Qui quella nozione entra nel vocabolario, e ci entra **sul dato**: la
 * cura sta dentro `patternTrovato`, cioè nel confronto che TUTTI usano (auto-fix per chiudere, la
 * sonda per accreditare, il guardiano per giudicare). Metterla in un solo chiamante avrebbe lasciato
 * aperte le altre porte — è AR-172, l'errore già pagato.
 *
 * Come funziona: il pattern si cerca due volte, sullo stesso testo e su una copia in cui le righe di
 * commento sono state svuotate (le righe restano, così un pattern che attraversa più righe non si
 * rompe). Se combacia solo nella prima, la prova NON è soddisfatta.
 */
const RE_RIGA_COMMENTO = /^\s*(\/\/|#(?!!)|\*|\/\*|<!--)/;

/** Il testo con le righe di solo commento svuotate. Le righe restano al loro posto. */
export function senzaCommenti(testo) {
  return String(testo ?? "")
    .split("\n")
    .map((r) => (RE_RIGA_COMMENTO.test(r) ? "" : r))
    .join("\n");
}

/** Il confronto grezzo: regex OPPURE letterale, su tutto il testo com'è (commenti compresi). */
export function patternOvunque(pattern, testo) {
  const p = String(pattern ?? "");
  const t = String(testo ?? "");
  if (!p) return false;
  let re = null;
  try {
    re = new RegExp(p);
  } catch {
    re = null; // regex non compilabile → resta il letterale, non si butta via la prova
  }
  return (re ? re.test(t) : false) || t.includes(p);
}

/** Il confronto che conta: solo sulle righe che il computer esegue. */
export function patternNelCodice(pattern, testo) {
  return patternOvunque(pattern, senzaCommenti(testo));
}

/**
 * La prova combacia SOLO dentro un commento?
 *
 * È il verdetto che mancava: non «assente» e non «presente», ma «c'è scritto e non fa niente».
 * Chi mostra una prova non soddisfatta deve poter dire quale dei due casi è, perché sono due
 * riparazioni diverse: una prova mai soddisfatta aspetta il fix, una soddisfatta-in-commento è già
 * stata chiusa una volta su una frase.
 */
export function soloInCommento(pattern, testo) {
  return patternOvunque(pattern, testo) && !patternNelCodice(pattern, testo);
}

/** Una prova file+pattern è soddisfatta da questo testo? (`presente` default: true) */
export function provaSoddisfatta(verifica, testo) {
  const v = verifica || {};
  const trovato = patternTrovato(v.pattern, testo);
  return v.presente === false ? !trovato : trovato;
}

/**
 * AR-356 — DOVE UNA PROVA NON PUÒ PUNTARE.
 *
 * Una prova che cita testo dentro `MyCity-Vault/` o `consegne/` si smonta da sola: sono i file che la
 * macchina RISCRIVE a ogni giro. Domani quella frase non c'è più, la prova diventa rossa (o verde) per
 * un motivo che non c'entra niente col difetto, e nessuno sa più cosa stava misurando.
 *
 * La causa di sistema è che l'ammissibilità della prova non veniva giudicata MAI — né alla nascita né
 * dopo: per il registro un `.md` di memoria e un `.mjs` di codice erano lo stesso tipo di file. Qui
 * l'ammissibilità diventa una regola, e chi valida il registro la può pretendere sul dato.
 *
 * Restano ammesse le prove per comando: un comando misura il presente, non cita una frase.
 */
export const CARTELLE_VOLATILI = ["MyCity-Vault/", "consegne/", "creativi/", "memoria-squadra/"];

export function provaSuFileVolatile(verifica) {
  const v = verifica || {};
  if (!v.file || !v.pattern) return false;
  const f = String(v.file).replace(/^\.\//, "");
  return CARTELLE_VOLATILI.some((c) => f.startsWith(c));
}

/**
 * AR-567 — «PROVA MAI SODDISFATTA» E «PROVA AL VUOTO» SONO DUE COSE DIVERSE.
 *
 * Otto riparazioni erano state progettate scrivendo nella prova il nome del file che il fix avrebbe
 * creato. Il lotto non è mai arrivato a costruirlo, e sono rimasti otto puntatori al niente — chiamati
 * «auto-sospette» insieme alle prove semplicemente non ancora soddisfatte. Sono due stati opposti:
 *
 *   · **mai-soddisfatta** — il file c'è, il pattern non ancora: è un piano che aspetta il lavoro.
 *   · **al-vuoto**        — il file non esiste: è un piano che NON PUÒ essere soddisfatto da nessuno.
 *     Non è un dubbio, è un allarme: o il fix si costruisce o la prova si riscrive.
 *
 * `fileEsiste` e `patternCombacia` li raccoglie chi chiama (qui non si tocca il disco), così questa
 * classificazione si esegue in un test invece di essere riletta.
 */
export function classificaProva({ verifica, fileEsiste = null, patternCombacia = null } = {}) {
  const v = verifica || {};
  if (v.comando !== undefined) return { classe: "comando", motivo: "prova comportamentale: la misura è l'uscita del comando" };
  if (v.tipo === "umano" || v.tipo === "umana") return { classe: "umana", motivo: "verifica umana dichiarata: nessun guardiano la chiuderà" };
  if (!v.file || !v.pattern) return { classe: "nessuna", motivo: "nessuna prova valutabile su questa scheda" };
  if (fileEsiste === false) {
    return {
      classe: "al-vuoto",
      motivo: `la prova punta a ${v.file}, che non esiste: nessun lavoro potrà mai soddisfarla (AR-567)`,
    };
  }
  if (fileEsiste === null) return { classe: "non-misurata", motivo: `non ho guardato se ${v.file} esiste` };
  if (patternCombacia === null) return { classe: "non-misurata", motivo: `${v.file} c'è, ma il pattern non è stato valutato` };
  if (patternCombacia) return { classe: "soddisfatta", motivo: `${v.file} contiene /${v.pattern}/` };
  return { classe: "mai-soddisfatta", motivo: `${v.file} c'è e non contiene ancora /${v.pattern}/: il fix è da fare` };
}

/** Solo le prove file+pattern sono controllabili qui: un comando non si può «rieseguire nel passato». */
export function provaControllabile(verifica) {
  const v = verifica || {};
  if (v.comando) return false; // prova comportamentale: la ① non si applica (e non serve)
  if (v.tipo === "umano") return false;
  return Boolean(v.file && v.pattern);
}

/**
 * L'istante esatto della nascita, in una forma che git non possa fraintendere.
 *
 * ⚠️ Questa funzione esiste per un difetto trovato NEL guardiano stesso, prima di consegnarlo. In
 * cantiere `nato` è quasi sempre una data secca («2026-07-27»). Passata così a `git rev-list
 * --before=`, l'approxidate di git riempie i campi mancanti con quelli CORRENTI: «2026-07-27»
 * lanciato alle 18:20 significa «prima delle 18:20 di oggi», non «prima di mezzanotte». Risultato:
 * per ogni difetto nato oggi la fotografia «alla nascita» era il file di ADESSO — coi fix già dentro
 * — e il guardiano dichiarava tutto onesto perché non stava guardando il passato.
 *
 * Un guardiano verde perché cieco è peggio di nessun guardiano: è la stessa famiglia del difetto che
 * deve sorvegliare. Qui la data si normalizza a un istante ISO completo, dove non c'è niente da
 * indovinare: giorno secco → mezzanotte di quel giorno (l'inizio della giornata in cui è nato).
 */
export function istanteNascita(nato) {
  const s = String(nato ?? "").trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/.exec(s);
  if (!m) return null;
  const [, y, mo, d, h, mi, se] = m;
  return `${y}-${mo}-${d}T${h ?? "00"}:${mi ?? "00"}:${se ?? "00"}`;
}

/**
 * ① LA GUARDIA DELLA NASCITA — la prova era già vera il giorno in cui il difetto è nato?
 *
 * `testoAllaNascita` è il contenuto del file com'era alla data di nascita, raccolto da chi chiama.
 * `null` = non ricostruibile (file nato dopo, storia troncata, repo superficiale): in quel caso NON
 * si accusa. Un guardiano che non riesce a misurare deve dire «cieco», non «bocciato» — è la regola
 * di AR-322, e vale anche per questo.
 */
export function nataGiaSoddisfatta(verifica, testoAllaNascita) {
  if (!provaControllabile(verifica)) {
    return { esito: "nonApplicabile", motivo: "prova comportamentale o umana: non si valuta nel passato" };
  }
  if (testoAllaNascita == null) {
    return { esito: "cieco", motivo: `impossibile ricostruire ${verifica.file} alla data di nascita` };
  }
  if (provaSoddisfatta(verifica, testoAllaNascita)) {
    const verso = verifica.presente === false ? "ASSENTE" : "presente";
    return {
      esito: "sospetta",
      motivo: `la prova era GIÀ soddisfatta alla nascita (${verifica.file}: /${verifica.pattern}/ era già ${verso}) → descrive il bug, non il fix`,
    };
  }
  return { esito: "onesta", motivo: "alla nascita la prova non era soddisfatta: può testimoniare un fix" };
}

/**
 * ② LA GUARDIA DELLA CHIUSURA — fra la nascita e adesso quel file è mai cambiato?
 *
 * `fileCambiatoDallaNascita`: true/false raccolto da chi chiama (`git log -- <file> --since <nato>`),
 * oppure `null` se git non ha saputo rispondere.
 *
 * Le prove per comando NON passano di qui: un guardiano che esce 0 è già una misura del presente, e
 * il file «citato» spesso non è quello che il fix ha toccato. Applicare la ② lì bloccherebbe le
 * chiusure oneste — e un cancello che punisce il comportamento giusto viene disattivato entro la
 * settimana, che è come si perdono i cancelli.
 *
 * Se git non risponde si LASCIA PASSARE, e si dice. Qui la scelta prudente è l'opposto della ①:
 * questa guardia gira dentro auto-fix su ogni chiusura, e fallire chiuso su un repo con la storia
 * troncata (i cloni dei cloud agent lo sono) bloccherebbe ogni chiusura per sempre. La ① intanto ha
 * già filtrato le prove disoneste a monte.
 */
export function chiusuraAmmessa({ verifica, nato, fileCambiatoDallaNascita }) {
  const v = verifica || {};
  if (v.comando) return { ammessa: true, motivo: "prova comportamentale: misura il presente, non serve la storia" };
  if (!v.file) return { ammessa: true, motivo: "nessun file citato: niente da controllare" };
  if (!nato) return { ammessa: true, motivo: "difetto senza data di nascita: non si può datare il confronto" };
  if (fileCambiatoDallaNascita == null) {
    return { ammessa: true, motivo: `storia di ${v.file} non leggibile: chiusura ammessa ma non corroborata` };
  }
  if (fileCambiatoDallaNascita) {
    return { ammessa: true, motivo: `${v.file} è cambiato dal ${nato}: c'è del lavoro dietro questa chiusura` };
  }
  return {
    ammessa: false,
    motivo: `${v.file} NON è mai cambiato dal ${nato}: nessun fix può averlo risolto → chiusura rifiutata (AR-330)`,
  };
}
