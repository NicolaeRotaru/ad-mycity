#!/usr/bin/env node
// 📏 QUANTO VALE UNA PROVA — il contratto, in un posto solo, senza toccare niente.
//
// 🟢 PURO: nessun file, nessun processo, nessuna rete. Riceve quello che si sa già e risponde. È
// la condizione perché un test possa ESEGUIRE queste decisioni invece di cercarle in un file — che
// è la malattia stessa di questa corsia.
//
// PERCHÉ ESISTE. La corsia C del lotto 42 cura una malattia sola, «la prova che non può fallire»:
// un difetto dichiarato chiuso il cui freno non frena vale meno di un difetto aperto, perché nessuno
// lo riguarderà più. Le forme misurate erano quattro, e tutte e quattro nascevano dallo stesso
// posto — la domanda «questa prova, vale?» aveva una risposta diversa in ogni file che se la faceva:
//
//   · un puntatore rotto contato come «fix in attesa», cioè auto-chiudibile          (AR-686)
//   · un difetto APERTO senza mutazione contato come debito nuovo di chi lo riapre   (AR-692)
//   · un caso di prova asincrono che il banco non aspetta: l'asserzione gira dopo il
//     conteggio, e un `1 = 2` stampa «pass»                                          (AR-694)
//   · una prova ROSSA sotto una scheda marcata CHIUSA, che nessuno riguarda          (AR-683)
//   · un freno dichiarato senza la mutazione che lo faccia scattare, contato come
//     freno vero perché un'ALTRA mutazione tocca lo stesso file              (AR-596/AR-565)
//
// Da qui in poi la risposta è una, e chi decide la CHIAMA invece di riscriversela.

// ─────────────────────────────────────────────────────────────────────────────
// ① LA FORMA DI UNA PROVA — e quando una prova non può chiudere niente (AR-686)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Che specie di prova è, e se un guardiano la può usare per chiudere il difetto da solo.
 *
 * AR-686 — IL CASO CHE HA ROTTO. Una prova a pattern che punta a un file inesistente veniva
 * classificata «fix in attesa» (auto-chiudibile: il fix consiste nel creare quel file, non c'è
 * ancora). Regge finché la prova chiede la PRESENZA di qualcosa; si ribalta quando chiede l'assenza
 * — `presente: false` su un file che non esiste combacia sempre, quindi il difetto si chiude perché
 * il file è SPARITO. Un puntatore rotto non è un fix in attesa: è un puntatore rotto, e le due cose
 * si distinguono solo guardando.
 *
 * @param {object|null|undefined} verifica il campo `verifica` della scheda
 * @param {{fileEsiste?: (percorso: string) => boolean}} mondo l'unica domanda al disco, iniettata
 * @returns {{tipo:"comando"|"pattern"|"umana"|"orfana", auto_chiudibile:boolean, motivo:string}}
 */
export function classificaProva(verifica, { fileEsiste = () => false } = {}) {
  const v = verifica;
  if (!v || typeof v !== "object") {
    return { tipo: "umana", auto_chiudibile: false, motivo: "nessuna prova dichiarata: nessun guardiano potrà mai chiuderlo" };
  }
  if (typeof v.comando === "string" && v.comando.trim()) {
    return { tipo: "comando", auto_chiudibile: true, motivo: `prova eseguibile: ${v.comando.trim()}` };
  }
  if (typeof v.file === "string" && v.file && typeof v.pattern === "string" && v.pattern) {
    if (!fileEsiste(v.file)) {
      // Le due strade che qui si separano, e che prima finivano nello stesso cassetto:
      //   `presente:false` + file assente → la prova COMBACIA e il difetto si chiuderebbe da solo;
      //   `presente:true`  + file assente → la prova non combacia e resta «in attesa» per sempre.
      // Nessuna delle due ha misurato qualcosa: il file su cui poggiano non c'è.
      return {
        tipo: "orfana",
        auto_chiudibile: false,
        motivo:
          `la prova punta a ${v.file}, che non esiste: un puntatore rotto non è un fix in attesa. ` +
          (v.presente === false
            ? "e con `presente:false` combacerebbe proprio PERCHÉ il file è sparito — il difetto si chiuderebbe da solo"
            : "finché quel file non c'è, questa prova non può dire né sì né no"),
      };
    }
    return { tipo: "pattern", auto_chiudibile: true, motivo: `prova a pattern: ${v.file} ~ /${v.pattern}/` };
  }
  return { tipo: "umana", auto_chiudibile: false, motivo: "verifica umana: nessun guardiano potrà mai chiuderlo" };
}

/**
 * Questo difetto si può chiudere a macchina con questo esito di prova?
 *
 * Due condizioni, e la seconda è quella che salta sempre: la prova dev'essere di una specie che un
 * guardiano sa usare, E l'esito dev'essere una MISURA — non «non ho potuto guardare». Un `misurato:
 * false` che passa per verde è il modo esatto in cui 53 schede si sono chiuse su prove che nessuno
 * ha mai eseguito.
 *
 * @param {object} difetto la scheda
 * @param {{esito?:string, misurato?:boolean, dettaglio?:string}} esitoProva quello che ha detto il motore
 * @param {{fileEsiste?: (percorso: string) => boolean}} mondo
 * @returns {{ok:boolean, motivo:string}}
 */
export function puoAutoChiudere(difetto, esitoProva = {}, mondo = {}) {
  const c = classificaProva(difetto?.verifica, mondo);
  if (!c.auto_chiudibile) return { ok: false, motivo: c.motivo };
  if (esitoProva.misurato === false) {
    return { ok: false, motivo: `la prova non è stata eseguita (${esitoProva.dettaglio || "non misurata"}): non dice né verde né rosso` };
  }
  if (esitoProva.esito !== "risolto") {
    return { ok: false, motivo: `la prova non è soddisfatta (${esitoProva.esito || "senza esito"})` };
  }
  return { ok: true, motivo: c.motivo };
}

// ─────────────────────────────────────────────────────────────────────────────
// ② IL DEBITO DI MUTAZIONE — due debiti diversi sotto lo stesso nome (AR-692)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Separa «riparato senza mutazione» da «aperto senza mutazione».
 *
 * AR-692 — L'INCENTIVO ROVESCIATO. Il cancello contava in un mucchio solo, con tetto 0, ogni difetto
 * con una prova a comando e senza mutazione. Riaprire onestamente due difetti veri portava il conto
 * da 0 a 2 e faceva scattare l'allarme del debito: il metro leggeva «il debito si è allargato» dove
 * il fatto era l'opposto — il debito c'era già, nascosto dentro una scheda marcata chiusa, e
 * riaprirla lo ha reso visibile. In un cantiere che vive di onestà, chi riapre veniva punito.
 *
 * Più a fondo, ed è la ragione per cui la separazione non è un'esenzione di comodo: la mutazione di
 * un difetto RIPARATO risponde a «e se il fix tornasse indietro?» — si rompe il fix e si pretende il
 * rosso. Su un difetto APERTO non c'è nessun fix da rompere: la prova è già rossa. La domanda lì è
 * un'altra — «il rilevatore sa ancora vedere?» — ed è un'altra meccanica, non la stessa più debole.
 *
 * Quindi:
 *   · riparati (stato chiuso/risolto) senza mutazione → DEBITO VERO, tetto 0: è la porta che AR-393
 *     ha chiuso e non si riapre.
 *   · aperti senza mutazione → debito EREDITATO, si conta e si vede, e non accusa chi riapre.
 *
 * @param {object[]} difetti le schede di ADESSO, ciascuna con `stato` e `verifica`
 * @param {(id:string)=>boolean} haMutazione risponde se quel difetto ha una mutazione viva
 * @param {(id:string)=>boolean} eRiaperto era chiuso sul ramo pubblicato ed è aperto adesso
 * @returns {{riparati:object[], aperti:object[], riaperti:object[], senzaProvaAComando:number}}
 */
export function debitoDiMutazione(difetti = [], haMutazione = () => false, eRiaperto = () => false) {
  const riparati = [];
  const aperti = [];
  const riaperti = [];
  let senzaProvaAComando = 0;
  for (const d of difetti) {
    const c = d?.verifica?.comando;
    if (typeof c !== "string" || !c.trim()) {
      senzaProvaAComando++;
      continue;
    }
    if (haMutazione(d.id)) continue;
    const chiuso = STATI_CHIUSI.has(String(d.stato || "").toLowerCase());
    if (chiuso) {
      riparati.push({
        id: d.id,
        stato: d.stato,
        motivo: "difetto dichiarato riparato senza nessuna mutazione: quella prova non è mai stata rotta apposta, quindi non sappiamo se dimostri il fix",
      });
      continue;
    }
    // RIAPERTO ADESSO: il debito non l'ha aggiunto chi riapre — era già lì, dentro una scheda
    // marcata chiusa, e riaprirla lo ha reso visibile. Contarlo come debito NUOVO è l'incentivo
    // rovesciato: la strada comoda diventerebbe lasciare la scheda chiusa.
    (eRiaperto(d.id) ? riaperti : aperti).push({
      id: d.id,
      stato: d.stato,
      motivo: eRiaperto(d.id)
        ? "difetto RIAPERTO in questo lotto: la sua prova è già rossa e non c'è nessun fix da rompere — il debito c'era prima, nascosto in una scheda chiusa"
        : "difetto APERTO senza mutazione: la prova è già rossa e non c'è nessun fix da rompere — qui la domanda è se il rilevatore sa ancora vedere, e nessuno l'ha fatta",
    });
  }
  return { riparati, aperti, riaperti, senzaProvaAComando };
}

/** Gli stati che significano «il fix c'è»: solo questi portano il debito con tetto 0. */
export const STATI_CHIUSI = new Set(["chiuso", "risolto", "chiusa"]);

// ─────────────────────────────────────────────────────────────────────────────
// ③ I CASI DI PROVA CHE NON POSSONO FALLIRE (AR-694)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * I casi asincroni che il banco del file NON aspetta: l'asserzione gira dopo il conteggio.
 *
 * IL CASO CHE HA ROTTO, misurato il 14/8: sette casi scritti `prova("...", async () => {...})` dentro
 * banchi che li lanciano con `fn()` secco. La promessa viene buttata via, il conteggio si stampa
 * subito, e un `assert.equal(1, 2)` dentro quel caso lascia «# pass N · # fail 0». Non è un test
 * debole: è un test che non può dire di no, cioè il difetto che tutta questa casa cura, dentro il
 * metro.
 *
 * NON È UN PATTERN SU UNA RIGA, ed è la clausola che la scheda chiede a voce alta: `async` da solo
 * non distingue un caso legittimo da uno spento. Qui si guarda il BANCO — come chiama la funzione —
 * e le tre forme sane restano sane:
 *   ① il banco ASPETTA e chi chiama aspetta lui  → `const prova = async (n, fn) => { await fn(); }`
 *      con `await prova(...)`;
 *   ② il banco RINVIA: mette il caso in una coda che il file svuota in fondo con `await`  → il suo
 *      corpo non è `async` e contiene un `await fn()` dentro una chiusura (`daFare.push(async …)`);
 *   ③ il banco REGISTRA e basta: `casi.push({nome, fn})`, e il ciclo finale fa `await c.fn()`.
 * Solo la quarta forma è malata: il banco CHIAMA il caso senza aspettarlo.
 *
 * Ciò che non vede, detto qui: un banco importato da un altro file (compreso `node:test`, che i
 * casi asincroni li aspetta di suo) non lo giudica — è una misura per DIFETTO, il numero vero è ≥.
 *
 * @param {string} sorgente il testo del file di prova
 * @returns {{banco:string, riga:number, nome:string, motivo:string}[]}
 */
export function casiSpenti(sorgente = "") {
  const src = String(sorgente);
  const fuori = [];
  const chiamate = /(await\s+)?\b([A-Za-z_$][\w$]*)\s*\(\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|`((?:[^`\\]|\\.)*)`)\s*,\s*async\b/g;
  const banchiVisti = new Map();
  let m;
  while ((m = chiamate.exec(src))) {
    const atteso = Boolean(m[1]);
    const banco = m[2];
    const nome = m[3] ?? m[4] ?? m[5] ?? "";
    if (!banchiVisti.has(banco)) banchiVisti.set(banco, bancoLocale(src, banco));
    const b = banchiVisti.get(banco);
    if (!b) continue; // banco non definito qui (node:test & simili): non lo giudico, e lo dichiaro
    if (b.rinvia) continue; // ② e ③ — il caso viene messo in coda e qualcuno lo aspetta dopo
    const riga = src.slice(0, m.index).split("\n").length;
    if (!b.chiamaSubito) continue; // forma che non so leggere: non accuso ciò che non ho capito
    if (b.attende && atteso) continue; // ① — il banco aspetta il caso e chi chiama aspetta il banco
    fuori.push({
      banco,
      riga,
      nome,
      motivo: b.attende
        ? `\`${banco}\` aspetta il caso ma chi lo chiama non aspetta \`${banco}\`: l'asserzione gira dopo il conteggio`
        : `\`${banco}\` chiama il caso senza aspettarlo: un caso \`async\` qui non può fallire — la promessa viene buttata via`,
    });
  }
  return fuori;
}

/**
 * Com'è fatto il banco definito DENTRO questo file: chiama il caso subito, lo aspetta, lo rinvia?
 *
 * `null` se il banco non è definito qui — e allora non si giudica: è la differenza fra «ho guardato
 * e va bene» e «non l'ho potuto guardare», che in questa casa non si confondono.
 */
export function bancoLocale(sorgente = "", nome = "") {
  const src = String(sorgente);
  if (!/^[A-Za-z_$][\w$]*$/.test(nome)) return null;
  const def = new RegExp(
    `(?:const|let|var)\\s+${nome}\\s*=\\s*(async\\s+)?\\(([^)]*)\\)\\s*=>|(?:async\\s+)?function\\s+${nome}\\s*\\(([^)]*)\\)`,
  ).exec(src);
  if (!def) return null;
  const parametri = (def[2] ?? def[3] ?? "").split(",").map((p) => p.trim().split(/[=\s]/)[0]).filter(Boolean);
  const caso = parametri[1] || parametri[0];
  if (!caso) return null;
  const corpo = src.slice(def.index, def.index + 1200);
  const eAsync = Boolean(def[1]) || /^\s*async\s/.test(src.slice(def.index).replace(/^(?:const|let|var)\s+\S+\s*=\s*/, ""));
  const invoca = new RegExp(`\\b${caso}\\s*\\(`).test(corpo);
  const attende = new RegExp(`await\\s+${caso}\\s*\\(`).test(corpo);
  // ② e ③: il banco non esegue il caso, lo consegna a qualcun altro — o dentro una chiusura
  // asincrona messa in coda, o come dato in un elenco. In tutt'e due i modi chi lo eseguirà è un
  // ciclo che può aspettarlo, e questo file non è il posto dove dirlo.
  //
  // Il segnale che distingue ② da un banco che il caso lo chiama davvero: un `await` dentro un corpo
  // NON asincrono non può stare al primo livello — sta per forza in una chiusura, cioè in coda.
  const rinvia = (attende && !eAsync) || (!invoca && new RegExp(`\\b${caso}\\b`).test(corpo));
  return { caso, chiamaSubito: invoca && !rinvia, attende, rinvia };
}

// ─────────────────────────────────────────────────────────────────────────────
// ④ LE CHIUSURE CON LA PROVA ROSSA ADESSO (AR-683)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Le schede CHIUSE la cui prova, eseguita adesso, non è verde.
 *
 * IL CASO CHE HA ROTTO: tre difetti chiusi avevano la prova rossa e nessuno se n'era accorto, per un
 * motivo strutturale — chi classifica le prove guarda solo i difetti APERTI (è lì che sta il lavoro
 * da fare), e il banco che esegue i test non sa che quei file sono la prova di qualcosa. Due metà
 * che non si parlano: ognuna verde per conto suo.
 *
 * Qui si cuciono. Il verdetto per file arriva già misurato dal banco, così questa resta pura e la
 * prova la può esercitare su una suite finta.
 *
 * ⚠️ Un file NON ESEGUITO (⚪) non è un rosso e non è un verde: esce con `stato: "non-misurata"`. Un
 * ambiente incompleto — manca `bats`, manca `node_modules` del Pannello — non è un fix regredito, e
 * dirlo «rosso» manda a cercare un guasto che non c'è. Ma non sparisce: resta contato a parte.
 *
 * @param {object[]} difetti tutte le schede
 * @param {Map<string,string>|object} verdettoPerFile percorso del test → esito ("ok"|"rosso"|"ineseguibile"|"non-eseguito")
 * @param {(comando:string)=>string|null} fileDelComando l'estrattore del file da un comando
 * @returns {{id:string, file:string, esito:string, stato:"regredita"|"non-misurata"}[]}
 */
export function chiusureDaRiverificare(difetti = [], verdettoPerFile = new Map(), fileDelComando = () => null) {
  const leggi = (k) => (verdettoPerFile instanceof Map ? verdettoPerFile.get(k) : verdettoPerFile?.[k]);
  const fuori = [];
  for (const d of difetti) {
    if (!STATI_CHIUSI.has(String(d?.stato || "").toLowerCase())) continue;
    const c = d?.verifica?.comando;
    if (typeof c !== "string" || !c.trim()) continue;
    const file = fileDelComando(c);
    if (!file) continue;
    const esito = leggi(file);
    if (!esito || esito === "ok") continue;
    fuori.push({
      id: d.id,
      file,
      esito,
      stato: esito === "non-eseguito" ? "non-misurata" : "regredita",
    });
  }
  return fuori;
}

// ─────────────────────────────────────────────────────────────────────────────
// ⑤ UN FRENO VERO — una definizione sola (AR-596 / AR-565)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Quanti freni dichiarati sono freni COSTRUITI, e quanti sono solo dichiarati.
 *
 * IL CASO CHE HA ROTTO. Due guardiani guardavano lo stesso mucchio di lezioni con due definizioni
 * diverse di «freno vero» e davano verdetti opposti sullo stesso giorno: uno contava i gate
 * DICHIARATI e diceva che la macchina sta imparando, l'altro pretendeva la mutazione e diceva che
 * un terzo dei freni non è mai stato visto scattare. Quando due numeri rispondono alla stessa
 * domanda, quello che finisce nella riga di riassunto vince — e in questa casa il verde vince
 * sempre. Da qui in poi la definizione è una e sta qui; chi decide la chiama.
 *
 * TRE GRADI, perché due non bastavano a dire la verità:
 *   · vero      → esiste una mutazione agganciata a QUESTA lezione, e trova ancora il suo pezzo;
 *   · per_file  → nessuna mutazione sua, ma un'altra rompe lo stesso file del gate. Quel comando
 *                 qualcuno l'ha visto diventare rosso: non è niente, e non è la sua prova.
 *   · finto     → il gate non nomina un file, o il file non c'è, o nessuna mutazione tocca quel
 *                 file, o quelle che lo toccano sono cieche.
 *
 * AR-596 misurava «19 lezioni frenate senza mutazione». Il numero vero, contato il 14/8 su 65
 * lezioni con gate: 24 senza la propria mutazione. La differenza non è un dettaglio — è la prova
 * che quel conto non lo guardava nessuno da settimane.
 *
 * @param {object[]} lezioni  le lezioni di apprendimento.json
 * @param {object[]} mutanti  l'elenco di mutanti.json
 * @param {(f:string)=>boolean} esiste
 * @param {(f:string)=>string|null} leggi
 * @param {(comando:string)=>string|null} fileDelComando
 */
export function misuraFreni(lezioni = [], mutanti = [], esiste = () => false, leggi = () => null, fileDelComando = () => null) {
  const conGate = lezioni.filter((l) => typeof l?.gate === "string" && l.gate.trim());
  const veri = [];
  const perFile = [];
  const violazioni = [];

  for (const l of conGate) {
    const file = fileDelComando(l.gate);
    if (!file) {
      violazioni.push({ regola: "gate-senza-comando", lezione: l.id, motivo: `«${l.gate}» non nomina nessun file eseguibile: non è un comando, è una frase` });
      continue;
    }
    if (!esiste(file)) {
      violazioni.push({ regola: "gate-orfano", lezione: l.id, motivo: `il gate punta a ${file}, che non esiste — «non fatto» è indistinguibile da «puntatore rotto»` });
      continue;
    }
    const vive = (m) => {
      const src = leggi(m?.file);
      return typeof m?.cerca === "string" && Boolean(m.cerca) && src !== null && src.includes(m.cerca);
    };
    const sue = mutanti.filter((m) => m?.lezione === l.id);
    const delFile = mutanti.filter((m) => m?.file === file);
    if (!sue.length && !delFile.length) {
      violazioni.push({ regola: "gate-mai-rotto", lezione: l.id, motivo: `nessuna mutazione rompe ${file} in mutanti.json — nessuno ha mai rimesso l'errore per vedere se quel freno scatta` });
      continue;
    }
    const sueVive = sue.filter(vive);
    const delFileVive = delFile.filter(vive);
    if (!sueVive.length && !delFileVive.length) {
      const cieca = [...sue, ...delFile][0];
      violazioni.push({ regola: "mutazione-cieca", lezione: l.id, motivo: `la mutazione di ${l.id} cerca in ${cieca.file} un pezzo che non c'è più: non prova niente, e lo dice «cieco», non «verde»` });
      continue;
    }
    if (sueVive.length) veri.push({ lezione: l.id, gate: l.gate, file, mutazioni: sueVive.length });
    else perFile.push({ lezione: l.id, gate: l.gate, file, mutazioni: delFileVive.length });
  }

  return { dichiarati: conGate.length, veri, perFile, violazioni };
}
