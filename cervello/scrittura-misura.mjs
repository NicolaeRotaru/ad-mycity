// 🔒 SCRITTURA-MISURA — quando uno strumento di misura ha il DIRITTO di scrivere quello che ha visto.
//
// ─────────────────────────────────────────────────────────────────────────────
// LA MALATTIA CHE QUESTO FILE CURA: «chi interroga la macchina la peggiora»
// ─────────────────────────────────────────────────────────────────────────────
// Uno strumento dichiarato di sola lettura che invece SCRIVE nella memoria condivisa. Due conti già
// pagati, e sono opposti fra loro:
//
//   ① IL CONTROLLO CHE COSTA UN DIFF (AR-464). Chi lancia un guardiano per verificare il proprio
//      lavoro si ritrova due file modificati che non sono suoi — l'unica riga diversa è l'ora. Il 30/7
//      è successo sei volte in una sessione e due volte quei file sono finiti in un commit. L'incentivo
//      che ne esce è «non lanciare il guardiano se non devi», cioè il contrario di quello che serve.
//      Un controllo che costa un diff si smette di fare, e un controllo che si smette di fare è spento.
//
//   ② LA MISURA CIECA CHE CANCELLA QUELLA VEDENTE (AR-568). Una sessione senza chiavi vede zero
//      sensori, scrive il suo zero sopra la misura del VPS, e il voto MIGLIORA — perché si è misurato
//      di meno. Su blocco-mancante.json la finestra è passata da 26 messaggi a 2 e la quota è scesa
//      dal 100% al 50%. Un numero che si abbassa restringendo il campione è una bugia che sembra un
//      progresso, ed è il caso peggiore proprio perché non è un rosso: nessuno va a guardarlo.
//
// Le due hanno la stessa radice: **la decisione «scrivo o no» sta dentro ogni strumento**, scritta a
// mano, diversa ogni volta, dove nessun test può eseguirla senza far girare tutto il programma. Qui la
// decisione è UNA, pura, e i punti malati la chiamano.
//
// 🟢 Modulo PURO: nessun file, nessuna rete, nessun `process.env` letto da dentro (l'ambiente arriva
// come parametro, così una prova può metterlo su un VPS senza esserci), nessun programma che parte
// all'import.

/**
 * I CAMPI-TIMBRO: quelli che cambiano a ogni esecuzione anche quando non è successo niente.
 *
 * Servono a rispondere a una domanda sola — «è cambiato qualcosa OLTRE l'ora?» — che è la domanda che
 * distingue un referto nuovo da una riscrittura a vuoto. L'elenco è dichiarato qui e non dedotto: un
 * nome nuovo di timbro va aggiunto a mano, perché dedurlo (per esempio «ogni campo che somiglia a una
 * data») farebbe sparire dal confronto anche i dati veri che sono date — e allora un guardiano
 * smetterebbe di accorgersi che una scadenza è cambiata.
 */
export const CAMPI_TIMBRO = [
  "data",
  "aggiornato",
  "aggiornato_il",
  "misurato",
  "misurato_il",
  "quando",
  "generato",
  "generato_il",
  "timestamp",
  "ultima_esecuzione",
  "ultimo_giro",
];

/**
 * L'oggetto senza i campi-timbro, a ogni livello di profondità.
 *
 * Profondo e non solo in superficie: i referti di questa casa annidano i loro timbri (`meta.aggiornato`,
 * `tetto.data`), e un confronto che guarda solo il primo livello direbbe «è cambiato» a ogni corsa —
 * cioè non servirebbe a niente.
 *
 * Gli array mantengono l'ordine e la lunghezza: due liste con gli stessi elementi in ordine diverso
 * sono due contenuti diversi, e fingere il contrario nasconderebbe un riordino vero.
 *
 * @param {unknown} obj il documento da ripulire.
 * @param {string[]} campi i nomi da togliere (default: i timbri di casa).
 * @returns {unknown} una copia senza i timbri. L'originale non si tocca.
 */
export function contenutoSostanziale(obj, campi = CAMPI_TIMBRO) {
  const daTogliere = new Set(campi);
  const pulisci = (v) => {
    if (Array.isArray(v)) return v.map(pulisci);
    if (v && typeof v === "object") {
      const out = {};
      for (const k of Object.keys(v)) {
        if (daTogliere.has(k)) continue;
        out[k] = pulisci(v[k]);
      }
      return out;
    }
    return v;
  };
  return pulisci(obj);
}

/** Due contenuti sono uguali? Confronto per valore, indipendente dall'ordine delle chiavi. */
export function stessoContenuto(a, b, campi = CAMPI_TIMBRO) {
  return chiaveStabile(contenutoSostanziale(a, campi)) === chiaveStabile(contenutoSostanziale(b, campi));
}

/** Serializzazione con le chiavi in ordine: `{a:1,b:2}` e `{b:2,a:1}` devono dare la stessa stringa. */
function chiaveStabile(v) {
  if (Array.isArray(v)) return `[${v.map(chiaveStabile).join(",")}]`;
  if (v && typeof v === "object") {
    return `{${Object.keys(v)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${chiaveStabile(v[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(v === undefined ? null : v);
}

/**
 * DA DOVE si sta misurando. Funzione pura di `env`, così una prova la esegue senza essere su un VPS.
 *
 *   · `vps`    — la casa del server: le chiavi ci sono e si vede tutto;
 *   · `cloud`  — una sessione dell'agente: cieca per costruzione, il VPS lo vede solo di riflesso;
 *   · `locale` — il computer di casa.
 *
 * Senza indizi si risponde `locale`, MAI `vps`: non si millanta la vista. È la riga che tiene onesto
 * tutto il resto, perché una misura che si dichiara «vps» senza esserlo comprerebbe il diritto di
 * sovrascrivere quella vera.
 *
 * ⚠️ DEBITO DICHIARATO: la stessa deduzione vive già in `misura-o-cieco.mjs` (`origineMisura`) e in
 * `eta-referto.mjs` (`ambienteDi`), e le due NON concordano — `SALUTE_CASA=vps` è un vps per la
 * seconda e un «locale» per la prima. Questa è la versione riconciliata (tiene tutti gli indizi di
 * entrambe); unificare le altre due richiede di toccare quei file, che in questo lotto sono di altre
 * corsie. Finché non si unificano, due programmi possono dire due macchine diverse per lo stesso file.
 */
export function origineCorrente(env = {}) {
  const e = env || {};
  if (e.MYCITY_ORIGINE) return String(e.MYCITY_ORIGINE);
  if (e.SALUTE_CASA === "vps" || e.VPS === "1" || e.MYCITY_VPS === "1") return "vps";
  if (e.CLAUDE_CODE_REMOTE || e.CODESPACES || e.CI) return "cloud";
  return "locale";
}

const si = (motivo) => ({ scrivi: true, affianca: false, motivo });
const no = (motivo) => ({ scrivi: false, affianca: false, motivo });

/** Un numero di copertura utilizzabile, oppure `null` se la misura non ne dichiara uno. */
function coperturaDi(m) {
  if (!m || typeof m !== "object") return null;
  const c = Number(m.copertura);
  return Number.isFinite(c) ? c : null;
}

/** L'origine dichiarata dentro una misura, normalizzata. `null` se la misura è anonima. */
function origineDi(m) {
  const o = m && typeof m === "object" ? m.origine : null;
  const s = String(o ?? "").trim();
  return s || null;
}

/**
 * ⭐ LA DECISIONE: questa misura può prendere il posto di quella che c'è già?
 *
 * Le regole, nell'ordine in cui si applicano — l'ordine è parte della regola:
 *
 *   ① `--sola-lettura` vince su tutto. Chi diagnostica da fuori non lascia impronte, nemmeno quando
 *      avrebbe il diritto di scrivere. È l'interruttore che mancava: il gesto che ha causato AR-568
 *      era innocente, e non aveva un modo di essere innocuo.
 *   ② niente da scrivere → non si scrive.
 *   ③ la misura che c'era NON SI LEGGE (file troncato, JSON rotto) → si scrive, e il motivo dice che
 *      è una riparazione, non un confronto vinto. Un errore di lettura non deve poter passare per
 *      «non c'era niente prima»: sarebbe un errore travestito da misura.
 *   ④ non c'era niente prima → si scrive: la prima misura non sovrascrive nessuno.
 *   ⑤ COPERTURA IGNOTA È IGNOTA. Se la misura che c'è dichiara quanto ha visto e quella nuova NON lo
 *      dichiara, non si può dimostrare di aver visto almeno altrettanto: non si scrive. Trattare
 *      «non lo so» come «zero» — o come «va bene» — sarebbe ricostruire il difetto dentro la cura.
 *   ⑥ CIECO NON SOVRASCRIVE VEDENTE. Copertura più bassa E punto d'osservazione DIVERSO → si rifiuta,
 *      e si dice perché. La misura nuova non si butta: si mette ACCANTO (`affianca`), così chi indaga
 *      la vede senza che il numero buono sparisca.
 *   ⑦ copertura più bassa dallo STESSO punto d'osservazione → si scrive, ed è importante che si
 *      scriva: lì il calo è una NOTIZIA (un sensore è caduto davvero), non una cecità di passaggio.
 *      Senza questa riga il rimedio diventerebbe peggiore del male — un guasto vero non potrebbe più
 *      entrare nel file, e la memoria resterebbe ferma all'ultimo giorno buono.
 *   ⑧ nulla è cambiato oltre l'ora → non si riscrive. È AR-464: verificare non deve costare un diff.
 *
 * @param {object} p
 * @param {boolean} p.solaLettura l'utente ha chiesto «guarda e non toccare».
 * @param {object|null} p.misuraNuova il documento appena calcolato (con `origine` e `copertura`).
 * @param {object|null} p.misuraVecchia quello già sul disco, o `null` se non c'era.
 * @param {boolean} [p.vecchiaLeggibile] `false` se il file c'era e NON si è potuto leggere.
 * @param {string[]} [p.campiTimbro] i campi da ignorare nel confronto «è cambiato qualcosa?».
 * @returns {{scrivi: boolean, motivo: string, affianca: boolean}}
 */
export function decidiScrittura({ solaLettura = false, misuraNuova = null, misuraVecchia = null, vecchiaLeggibile = true, campiTimbro = CAMPI_TIMBRO } = {}) {
  if (solaLettura) {
    return no("--sola-lettura: guardo e non scrivo, la memoria condivisa resta di chi l'ha scritta");
  }
  if (misuraNuova === null || misuraNuova === undefined) {
    return no("non c'è nessuna misura nuova da scrivere");
  }
  if (!vecchiaLeggibile) {
    return si("la misura che c'era non si legge (file rotto): la sostituisco, ed è una riparazione — non un confronto vinto");
  }
  if (misuraVecchia === null || misuraVecchia === undefined) {
    return si("non c'era nessuna misura prima: questa è la prima");
  }

  const nuova = coperturaDi(misuraNuova);
  const vecchia = coperturaDi(misuraVecchia);
  const daDove = origineDi(misuraNuova);
  const eraDa = origineDi(misuraVecchia);

  // ⑤ La copertura ignota NON vale zero e non vale «va bene»: vale ignota, e ignota non sovrascrive.
  // Senza questa riga bastava una misura senza timbro per calpestare quella del VPS — cioè
  // esattamente AR-568, ricostruito dentro la sua stessa cura.
  if (vecchia !== null && nuova === null) {
    return {
      scrivi: false,
      affianca: true,
      motivo:
        `non dichiaro quanto ho visto e la misura che c'è dichiara ${vecchia}` +
        `${eraDa ? ` (scritta da «${eraDa}»)` : ""}: una copertura ignota non è una copertura maggiore. ` +
        "La metto accanto, non al posto.",
    };
  }

  if (nuova !== null && vecchia !== null && nuova < vecchia) {
    if (daDove && eraDa && daDove !== eraDa) {
      return {
        scrivi: false,
        affianca: true,
        motivo:
          `cieco non sovrascrive vedente: da «${daDove}» ho visto ${nuova} cose, ` +
          `la misura che c'è l'ha scritta «${eraDa}» che ne aveva viste ${vecchia}. ` +
          "La metto accanto, non al posto — un voto che migliora perché si è misurato di meno è una bugia.",
      };
    }
    return {
      scrivi: true,
      affianca: false,
      motivo:
        `la copertura scende da ${vecchia} a ${nuova} dallo stesso punto d'osservazione` +
        `${daDove ? ` («${daDove}»)` : ""}: è un guasto vero, e un guasto vero va scritto`,
    };
  }

  if (stessoContenuto(misuraNuova, misuraVecchia, campiTimbro)) {
    return no("nulla è cambiato oltre l'ora: non riscrivo (verificare non deve costare un diff)");
  }

  return si(
    nuova !== null && vecchia !== null && nuova > vecchia
      ? `ho visto più cose di chi ha scritto prima (${nuova} contro ${vecchia})`
      : "il contenuto è cambiato",
  );
}

/**
 * ⭐ LA MISURA MESSA ACCANTO — la seconda metà di `decidiScrittura`, quella che mancava.
 *
 * AR-749. Quando la decisione dice `affianca: true` il motivo recita, alla lettera, «la metto
 * accanto, non al posto». Nessuno la metteva accanto: il verdetto usciva, il chiamante guardava solo
 * `scrivi`, e la misura finiva per terra. Da una sessione cloud il quadro dei sensori non entrava
 * quindi **da nessuna parte** — né sopra quello del VPS (giusto) né a fianco (promesso e mai fatto).
 * Il conto: quella promessa era nel testo del motivo, cioè nell'unico posto dove nessun test guarda.
 *
 * Qui la misura povera va in `misure_affiancate[origine]`, e la misura autorevole non si tocca: chi
 * legge il file trova il quadro del VPS dov'era, più — dichiarato e separato — quello che si vedeva
 * dall'altra parte. Ritorna `null` se non c'è niente di nuovo da dire, così affiancare non costa un
 * diff a ogni corsa (AR-464).
 *
 * @param {object|null} documento il file com'è adesso (la misura autorevole).
 * @param {object} misuraNuova la misura rifiutata come sostituta.
 * @param {object} [p]
 * @param {string} [p.origine] da dove arriva la misura nuova; senza, si legge da lei.
 * @param {string} [p.quando] il timbro dell'ora, passato da fuori (questo modulo resta puro).
 * @param {string[]} [p.campiTimbro]
 * @returns {object|null} il documento da riscrivere, o `null` se non cambierebbe niente.
 */
export function affiancaMisura(documento, misuraNuova, { origine, quando, campiTimbro = CAMPI_TIMBRO } = {}) {
  if (!misuraNuova || typeof misuraNuova !== "object") return null;
  const da = String(origine || origineDi(misuraNuova) || "").trim();
  // Senza un nome per la provenienza non c'è un posto dove metterla: due misure anonime si
  // sovrascriverebbero a vicenda dentro la casella «accanto», rifacendo il difetto di partenza.
  if (!da) return null;

  const base = documento && typeof documento === "object" ? documento : {};
  const accanto = base.misure_affiancate && typeof base.misure_affiancate === "object" ? base.misure_affiancate : {};
  const voce = {
    quando: quando ?? null,
    origine: da,
    copertura: coperturaDi(misuraNuova),
    scritto_da: misuraNuova.scritto_da ?? null,
    sensori: misuraNuova.sensori ?? null,
  };
  if (accanto[da] && stessoContenuto(accanto[da], voce, campiTimbro)) return null;
  return { ...base, misure_affiancate: { ...accanto, [da]: voce } };
}

/**
 * Il timbro di provenienza da appendere a OGNI file di misura (AR-286 · AR-568 a).
 *
 * Tre campi e nessuno di più: da dove, quanto ha visto, chi l'ha scritto. Senza questi una misura è
 * anonima, e una misura anonima non si può confrontare con nessun'altra — cioè la regola ④ qui sopra
 * non sarebbe nemmeno scrivibile.
 *
 * @param {object} p
 * @param {object} [p.env] l'ambiente da cui dedurre l'origine.
 * @param {number|null} [p.copertura] quante cose questa esecuzione ha davvero guardato.
 * @param {string} [p.scrittoDa] il nome dello script che scrive.
 */
export function timbroProvenienza({ env = {}, copertura = null, scrittoDa = "" } = {}) {
  const t = { origine: origineCorrente(env) };
  if (Number.isFinite(Number(copertura))) t.copertura = Number(copertura);
  if (scrittoDa) t.scritto_da = String(scrittoDa);
  return t;
}
