// 🗺️ CENSIMENTO DELLA MACCHINA — le nove parti di cui è fatta, misurate e spiegate.
//
// Nicola (29/7): «aggiungi la descrizione delle 9 parti dentro la bacheca … con l'approfondimento
// di ogni punto … e vorrei che questa sezione venga aggiornata ogni volta che c'è una cosa nuova
// dentro la macchina».
//
// LE DUE METÀ, e perché una sola basta a rendere la mappa una bugia (stessa lezione di
// `censimento-guardiani.mjs`, da cui questo file eredita il metodo):
//   · **le misure** — quanti agenti, quante rotte, quali sensori, quali servizi — si CONTANO dal
//     repo a ogni giro. Questa metà non può invecchiare: se domani nasce il senior numero 121, il
//     numero cambia da solo senza che nessuno se lo ricordi.
//   · **le parole** — cosa fa un pezzo, perché esiste, cosa succede se si rompe — si scrivono a
//     mano qui sotto, perché nessun parser sa spiegare a cosa serve una cosa. Questa metà PUÒ
//     invecchiare, ed è l'unica che il cancello pretende: quando compare una skill, un sensore, una
//     mano, un servizio o un'area del Pannello **senza una riga che dica cosa fa**, il giro resta
//     rosso finché qualcuno non la scrive. Costa una riga adesso; se non si scrive adesso non si
//     scrive più.
//
// PERCHÉ LA DATA NON CORRE. La Bacheca ordina per data, e questo blocco parla di una cosa che
// cambia di continuo (basta un file nuovo in `cervello/` per muovere un conteggio). Se la data si
// muovesse a ogni ritocco, questo blocco starebbe **sempre** in cima, sopra il registro dei fatti, e
// produrrebbe un commit a ogni giro che non dice niente. Quindi: il corpo si riscrive quando i
// numeri cambiano, ma la **data si muove solo quando cambia la STRUTTURA** — un pezzo nuovo o un
// pezzo sparito (vedi `firmaStruttura`). La data risponde a «è comparso qualcosa di nuovo?», non a
// «qualcuno ha toccato un file».
//
// 🟢 Sola lettura: questo file conta e compone testo. A scrivere è `mappa-macchina.mjs`.

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

// AR-700 — la porta unica per elencare i file di un ramo, RICORSIVAMENTE. Non è un'importazione di
// comodo: è il punto del difetto. Il censimento aveva la sua funzione, che leggeva una cartella sola.
import { elencaFile } from "./perimetro.mjs";

/** Il titolo del blocco in bacheca. Fisso: è la chiave con cui il blocco si ritrova e si sostituisce. */
export const TITOLO_BACHECA = "🗺️ Com'è fatta la macchina";

// ═══════════════════════════════════════════════════════════════════════════
// LE PAROLE — la metà che si scrive a mano (e che il cancello pretende)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Gli INVENTARI SORVEGLIATI: le cose che, quando nascono, cambiano davvero cosa sa fare la macchina.
 * Ognuna vuole la sua riga. Un nome misurato che non è qui = 🔴 (una cosa nuova non spiegata);
 * un nome qui che non esiste più = 🔴 (la mappa promette un pezzo che non c'è).
 *
 * NON sono sorvegliati per nome i 120 senior (hanno già il loro registro in `agent-registry-check`)
 * né i 141 script del cervello (li descrive uno per uno il censimento dei guardiani): lì basta il
 * numero, e il numero si conta da solo.
 */
export const DESCRIZIONI = {
  // ── Le aree del Pannello (da pannello/src/lib/nav.ts) ─────────────────────
  aree: {
    plancia: "La home: il colpo d'occhio del giorno — cosa è successo, cosa aspetta la tua firma, come sta la macchina.",
    azioni: "La coda delle decisioni: ogni card è un'azione pronta con «cosa cambia» e «se va bene». Qui si firma.",
    lavori: "I lavori del cervello in corso o finiti: cosa sta girando adesso, cosa è andato storto, cosa si può ritentare.",
    cervello: "Come ragiona la macchina: radiografie, salute onesta, utilizzo dei senior, schede dei problemi aperti.",
    "salute-sito": "Lo stato del marketplace vero: cosa non funziona sul sito dei negozi, per gravità.",
    "auto-coscienza": "La macchina che si guarda allo specchio: difetti trovati su sé stessa, cantiere delle riparazioni, storico della salute.",
    numeri: "I KPI reali: ordini, incassi, negozi, clienti, payout, funnel — solo dati misurati, mai stime travestite.",
    "analisi-report": "Trend, funnel e unit economics: gli stessi numeri di Numeri letti in profondità, più i report scritti dall'AD.",
    memoria: "Quello che la macchina ricorda: stato, decisioni, fatti chiave, quaderni dei reparti, archivio.",
    persone: "Chi c'è attorno al marketplace: negozi, clienti, rider, la squadra dei senior, i contatti esterni.",
    operazioni: "Come gira la macchina operativa: ordini, consegne, catalogo, magazzino, ritmi.",
    mondo: "Il fuori: concorrenti, eventi in città, bandi, stampa, trend — quello che non dipende da noi.",
    intelligence: "Alert, concorrenti, eventi, buchi di mercato, leve in uscita e reputazione: le 7 schede di analisi che prima stavano dentro Mercato.",
    assistente: "La chat con l'AD: da qui gli parli, gli chiedi un lavoro, gli fai una domanda.",
    contenuti: "I contenuti prodotti e in attesa di pubblicazione: post, grafiche, reel, con il loro colore di rischio.",
    esplora: "Vecchia area di esplorazione file — resta come scorciatoia: oggi porta a Memoria/Archivio/GitHub.",
    report: "Vecchia area dei report — resta come scorciatoia: oggi i report vivono in Memoria/Archivio.",
    storico: "Vecchia area dello storico — resta come scorciatoia: oggi lo storico vive dentro Memoria.",
  },

  // ── I sensori (da cervello/verifica-sensori.mjs) ───────────────────────────
  sensori: {
    supabase_rest: "L'occhio principale sul marketplace: negozi, prodotti, ordini, clienti veri. Se è cieco, il giro NON può scrivere numeri nuovi.",
    stripe_api: "L'occhio sui soldi veri: incassi, payout, contestazioni. Finché la chiave non c'è, i payout restano stime dichiarate come tali.",
    posthog_api: "L'occhio sul comportamento: chi visita, cosa clicca, dove abbandona. Serve a capire il perché dietro i numeri.",
    resend_api: "Il canale email: dice se la posta può davvero partire. Un canale che non risponde non è una mano attiva.",
    sito_uptime: "Il battito del marketplace: il sito dei negozi risponde? È il controllo che scopre un sito giù prima dei clienti.",
    supabase_memoria: "Il battito della memoria: il database separato dove vivono coda, chat, diario e impostazioni della Cabina.",
    pannello_uptime: "Il battito della Cabina: il Pannello risponde? Se è giù, tu non vedi niente anche se la macchina lavora.",
    telegram_bot: "Il canale con cui la macchina ti scrive sul telefono quando qualcosa non può aspettare il prossimo giro.",
    watchdog_esterno: "Il guardiano di fuori: controlla che la macchina batta anche quando la macchina stessa è morta e non può dirlo.",
    n8n_health: "Lo stato del motore delle automazioni: è lo strumento con cui i senior collegherebbero le mani ai servizi esterni.",
    mcp_supabase: "Il secondo canale verso i dati (comodità di sessione): utile quando c'è, mai la fonte di verità — quella resta il REST.",
  },

  // ── Le mani (da cervello/publishers/) ─────────────────────────────────────
  mani: {
    telegram: "Ti scrive sul telefono. È l'unica mano che parla solo con te: nessun estraneo la riceve.",
    email: "Manda email vere (via Resend) a clienti e negozi. Ferma finché il destinatario non è nell'allowlist.",
    gbp: "Pubblica sulla scheda Google del negozio (Google Business Profile): post, orari, novità — dove la gente cerca.",
    facebook: "Pubblica un post sulla pagina Facebook. Pubblico: quindi mai sotto 🟡, mai in automatico senza firma.",
    instagram: "Pubblica un post o una storia su Instagram. Stesso principio di Facebook: è la voce pubblica di MyCity.",
  },

  // ── I servizi del VPS (da cervello/vps/*.service) ─────────────────────────
  servizi: {
    "mycity-worker": "Il worker principale: sempre acceso, prende i lavori dalla coda e li fa eseguire all'AD. È quello che si muove quando premi «Approva».",
    "mycity-worker-chat": "Il worker della chat: corsia separata, così una tua domanda non finisce in fila dietro un giro lungo.",
    "mycity-giro": "Fa partire il giro di perlustrazione: legge i dati reali, passa i guardiani, scrive il briefing.",
    "mycity-ritmo-mattino": "Il piano del mattino: cosa conta oggi, in ordine di ritorno.",
    "mycity-ritmo-mezzogiorno": "Il controllo di metà giornata: cosa si è mosso e cosa si è arenato.",
    "mycity-ritmo-sera": "Il report della sera: cosa è successo davvero oggi, numeri alla mano.",
    "mycity-ritmo-settimana": "La review del venerdì: cosa ha funzionato, cosa si taglia, cosa si prova la settimana prossima.",
    "mycity-sentinella": "Le sentinelle: i segnali che devono svegliare qualcuno (negozio fermo, anomalia, soglia superata).",
    "mycity-sentinella-dati": "La sentinella sui dati veri del marketplace: guarda i numeri, non i file.",
    "mycity-sentinella-motore": "La veglia sul motore AI: quando il pacchetto di Claude si esaurisce è l'unica cosa che resta sveglia — controlla se il limite è caduto e rimette in coda i lavori saltati, così la macchina si riaccende da sola.",
    "mycity-salute": "La visita di salute, mattina e sera: worker, cervello, Cabina, senior, sensori — e scrive il referto.",
    "mycity-monitora": "Il sorvegliante del worker: se la coda si blocca o un lavoro resta orfano, se ne accorge.",
    "mycity-verifica": "La verifica periodica dei sensori: gli occhi sono ancora aperti, o uno si è spento in silenzio?",
    "mycity-watch-main": "Tiene la copia sul VPS allineata a `main`: senza, il worker lavorerebbe con un cervello vecchio.",
  },

  // ── Le skill (da .claude/skills/) ─────────────────────────────────────────
  skill: {
    salute: "La visita: controlla i cinque organi vivi e distingue ✅ provato, ❌ rotto e ⚪ non l'ho potuto vedere da qui.",
    worker: "Il worker e il VPS a fondo: code, servizi, lock, orfani, riavvii — quando qualcosa è fermo e serve la causa vera.",
    senior: "La squadra dei 120 a fondo: chi è vivo, chi dorme, chi si sovrappone, chi non consegna nel formato giusto.",
    cantiere: "La riparazione dei difetti che le radiografie hanno trovato: si sceglie per malattia, non per conteggio.",
    verify: "La prova sul campo: guida il Pannello vero con un browser e i test del worker, per dimostrare che un fix funziona.",
    // Qui si descrive solo ciò che sta in `.claude/skills/`: le skill di un pacchetto plugin
    // entrano quando il pacchetto le mette in quella cartella, non prima (il censimento segna
    // «fantasma» ogni riga rimasta per un pezzo assente — è successo con 67 skill di un pack rimosso).
  },

  // ── I workflow (da .claude/workflows/) ────────────────────────────────────
  workflow: {
    radiografia: "Audit profondo del marketplace: 13 dimensioni in sola lettura, ogni problema verificato prima di essere riportato.",
    "audit-design": "Audit profondo del design: 11 dimensioni che coprono i 24 punti visivi e di usabilità del sito.",
    "audit-pannello": "Audit del Pannello stesso: bug di navigazione, stato perso, liste vecchie, errori a runtime.",
    "auto-radiografia": "La macchina che analizza sé stessa: 12 dimensioni sull'architettura, più pre-mortem e confronto coi migliori.",
    "giro-operativo": "Il giro fatto da una flotta di senior in parallelo: ognuno propone le mosse a maggior ritorno, poi l'AD ordina.",
    "radiografia-totale": "Tutti gli organi insieme in tre giri: 48 dimensioni su macchina, Pannello, senior, worker, GitHub e codice, dove ogni giro cerca ciò che il precedente non ha visto.",
  },
};

/** Come si chiama, a voce, ogni inventario sorvegliato. */
export const NOMI_INVENTARIO = {
  aree: "aree del Pannello",
  sensori: "sensori",
  mani: "mani",
  servizi: "servizi del VPS",
  skill: "skill",
  workflow: "workflow",
};

// ═══════════════════════════════════════════════════════════════════════════
// LE MISURE — la metà che si conta (e che non può invecchiare)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GLI OCCHI — l'unico posto da cui questo file tocca il disco.
 *
 * Perché un oggetto invece di tre funzioni comode. La forma naturale sarebbe
 * `const elenca = (d) => { try { return readdirSync(d); } catch { return []; } }`, e sarebbe una
 * malattia con un nome già scritto in `cervello/malattie.json`: *una fonte letta a metà produce un
 * verdetto intero*. Se `.claude/skills/` per un istante non si lasciasse leggere, quel `catch`
 * tornerebbe una lista vuota, il censimento direbbe «0 skill» e la bacheca annuncerebbe a Nicola una
 * macchina senza skill — con la stessa faccia di un conteggio giusto. La cosa non letta deve
 * arrivare al verdetto: qui ogni guasto si annota, e chi legge le misure decide che quello **non è
 * uno zero, è cecità** (uscita 2, mai un verde).
 */
export function creaOcchi() {
  const guasti = [];
  const nota = (che, dove, e) => guasti.push(`${che} ${dove}: ${e?.code || e?.message || e}`);

  const elenca = (d) => { try { return readdirSync(d); } catch (e) { nota("non elenco", d, e); return []; } };
  const leggi = (f) => { try { return readFileSync(f, "utf8"); } catch (e) { nota("non leggo", f, e); return ""; } };
  const esiste = (f) => { try { return existsSync(f); } catch (e) { nota("non vedo", f, e); return false; } };

  /** Cammina una cartella e torna i file che passano il filtro. Salta node_modules/.next/.git. */
  const cammina = (dir, filtro = () => true, dentro = []) => {
    for (const voce of elenca(dir)) {
      if (voce === "node_modules" || voce === ".next" || voce === ".git") continue;
      const p = join(dir, voce);
      let st;
      try { st = statSync(p); } catch (e) { nota("non guardo", p, e); continue; }
      if (st.isDirectory()) cammina(p, filtro, dentro);
      else if (filtro(p)) dentro.push(p);
    }
    return dentro;
  };

  return {
    guasti,
    elenca,
    leggi,
    esiste,
    cammina,
    /** File di una cartella (non ricorsivo) che finiscono con una delle estensioni date. */
    fileCon: (dir, ...est) => elenca(dir).filter((f) => est.some((e) => f.endsWith(e))).sort(),
    /**
     * AR-700 — I FILE DI UN RAMO, SOTTOCARTELLE COMPRESE, dalla porta unica di `perimetro.mjs`.
     *
     * `fileCon` legge un livello solo, ed è giusto per le cartelle piatte (i sensori, i workflow).
     * Su `cervello/` era una bugia: 227 moduli contati al primo livello contro 306 veri, perché
     * `capacita/`, `vps/`, `publishers/`, `content-factory/` e `riparazioni/` non venivano
     * guardati. È l'altra metà di AR-677 — lì il conto serviva a un CANCELLO ed è stato curato, qui
     * serve a RACCONTARE la macchina a Nicola ed era rimasto sbagliato. Un numero più piccolo del
     * vero non allarma nessuno: è per questo che è sopravvissuto.
     *
     * Torna `null` — non `[]` — se la radice non si lascia leggere: «non ho potuto guardare» e «non
     * c'è niente» sono due risposte diverse, e confonderle è come nascono i verdetti ciechi.
     */
    sottoAlbero: (dir, estensioni, escludi = []) => {
      const fuori = elencaFile(dir, { estensioni, escludi }, {
        leggiCartella: (d) => readdirSync(d, { withFileTypes: true }),
      });
      if (fuori == null) { nota("non elenco (nemmeno la radice)", dir, { message: "illeggibile" }); return null; }
      return fuori;
    },
    /** Cartelle dentro una cartella. */
    cartelle: (dir) => elenca(dir)
      .filter((f) => { try { return statSync(join(dir, f)).isDirectory(); } catch (e) { nota("non guardo", join(dir, f), e); return false; } })
      .sort(),
    /** Quante righe in tutto questi file. Dà la TAGLIA di un pezzo, non la sua qualità. */
    righeDi: (file) => file.reduce((n, f) => n + leggi(f).split("\n").length, 0),
    /** Quante chiavi ha un JSON di memoria. Un JSON illeggibile è un guasto, non uno zero. */
    chiaviJson: (f, campo) => {
      const testo = leggi(f);
      if (!testo) return 0;
      try {
        const j = JSON.parse(testo);
        return Object.keys((campo ? j[campo] : j) || {}).length;
      } catch (e) { nota("non capisco", f, e); return 0; }
    },
  };
}

/**
 * Le aree del Pannello, lette dall'union `VistaNav` in nav.ts.
 * Si leggono dal codice e non da un elenco a mano: un'area nuova compare qui da sola, ed è
 * esattamente il momento in cui qualcuno deve scrivere cosa contiene.
 *
 * Tre voci sono vecchie scorciatoie che oggi rimandano altrove, e nel codice lo dichiarano con un
 * `// legacy` sulla loro riga. Contarle insieme alle altre gonferebbe il numero di stanze vere della
 * Cabina: si leggono, si spiegano, ma si dicono per quello che sono.
 */
export function areeDaNav(testo = "") {
  // Il `;` chiude l'union ma il `// legacy` dell'ULTIMA voce gli sta a destra, sulla stessa riga:
  // fermandosi al punto e virgola quella voce risultava viva. Si arriva a fine riga, non al `;`.
  const m = String(testo).match(/export type VistaNav\s*=([\s\S]*?;[^\n]*)/);
  if (!m) return { tutte: [], legacy: [] };
  const tutte = [];
  const legacy = [];
  for (const riga of m[1].split("\n")) {
    const nome = riga.match(/"([a-z-]+)"/);
    if (!nome) continue;
    tutte.push(nome[1]);
    if (/\blegacy\b/i.test(riga)) legacy.push(nome[1]);
  }
  return { tutte, legacy };
}

/** I sensori, letti dai `nome: "..."` di verifica-sensori.mjs. */
export function sensoriDaVerifica(testo = "") {
  return [...String(testo).matchAll(/nome:\s*["']([a-z0-9_]+)["']/g)].map((x) => x[1]);
}

/** Le mani, lette dai file di cervello/publishers/ (fuori: l'indice e il modulo comune). */
export function maniDaPublishers(file = []) {
  return file
    .filter((f) => f.endsWith(".mjs") && f !== "index.mjs" && !f.startsWith("_"))
    .map((f) => f.replace(/\.mjs$/, ""));
}

/** Conta tutto quello che c'è nella macchina, leggendo il repo. Ogni guasto di lettura resta scritto. */
export function misura(repo, occhi = creaOcchi()) {
  const p = (...x) => join(repo, ...x);
  const { leggi, elenca, esiste, cammina, fileCon, sottoAlbero, cartelle, righeDi, chiaviJson } = occhi;

  const pannelloFile = esiste(p("pannello/src")) ? cammina(p("pannello/src"), (f) => /\.tsx?$/.test(f)) : [];
  const aree = areeDaNav(leggi(p("pannello/src/lib/nav.ts")));
  // AR-700 — i moduli del cervello si contano SOTTOCARTELLE COMPRESE. `test/` resta fuori perché ha
  // già il suo numero nella stessa riga del referto: contarlo qui lo direbbe due volte.
  const cervelloScript = sottoAlbero(p("cervello"), [".mjs", ".sh"], ["test"]);
  const servizi = fileCon(p("cervello/vps"), ".service").map((f) => f.replace(/\.service$/, ""));
  const timer = fileCon(p("cervello/vps"), ".timer").map((f) => f.replace(/\.timer$/, ""));

  return {
    guasti: occhi.guasti,
    // 1 — Pannello
    pannello: {
      file: pannelloFile.length,
      righe: righeDi(pannelloFile),
      aree: aree.tutte,
      areeLegacy: aree.legacy,
      rotte: esiste(p("pannello/src/app/api")) ? cammina(p("pannello/src/app/api"), (f) => f.endsWith("route.ts")).length : 0,
      componenti: esiste(p("pannello/src/components")) ? cammina(p("pannello/src/components"), (f) => f.endsWith(".tsx")).length : 0,
      lib: elenca(p("pannello/src/lib")).length,
      sql: fileCon(p("pannello/sql"), ".sql").length,
    },
    // 2 — Worker e VPS
    worker: {
      righe: leggi(p("cervello/worker.sh")).split("\n").length,
      servizi,
      timer,
    },
    // 3 — AD
    ad: {
      righeGiro: leggi(p("cervello/giro.sh")).split("\n").length,
      righeMansionario: leggi(p("CLAUDE.md")).split("\n").length,
      documenti: fileCon(p("cervello"), ".md").length,
    },
    // 4 — Senior
    senior: {
      agenti: fileCon(p(".claude/agents"), ".md").length,
      quaderni: fileCon(p("memoria-squadra"), ".md").length,
    },
    // 5 — Guardiani e sensori
    immunitario: {
      // `null` = non ho potuto contare. Non è uno zero, e chi stampa il referto lo dice a parole.
      script: cervelloScript == null ? null : cervelloScript.length,
      scriptSottocartelle: cervelloScript == null ? null : cervelloScript.filter((f) => f.includes("/")).length,
      sensori: sensoriDaVerifica(leggi(p("cervello/verifica-sensori.mjs"))),
      test: fileCon(p("cervello/test"), ".test.mjs").length,
      testBash: fileCon(p("cervello/test"), ".bats").length,
      ci: fileCon(p(".github/workflows"), ".yml", ".yaml").length,
    },
    // 6 — Memoria
    memoria: {
      cartelleVault: cartelle(p("MyCity-Vault")).length,
      autoCoscienza: elenca(p("MyCity-Vault/90-Memoria-AI/auto-coscienza")).length,
      fatti: chiaviJson(p("MyCity-Vault/90-Memoria-AI/registro-fatti.json"), "fatti"),
    },
    // 7 — Mani
    mani: {
      canali: maniDaPublishers(elenca(p("cervello/publishers"))),
      allowlist: {
        email: chiaviJson(p("cervello/mani-allowlist.json"), "email"),
        notifiche: chiaviJson(p("cervello/mani-allowlist.json"), "notifica_user"),
      },
      template: fileCon(p("cervello/content-factory/templates"), ".html").length,
    },
    // 9 — Estensioni
    estensioni: {
      skill: cartelle(p(".claude/skills")),
      workflow: fileCon(p(".claude/workflows"), ".js").map((f) => f.replace(/\.js$/, "")),
      capacita: fileCon(p("cervello/capacita"), ".mjs").length,
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// IL CENSIMENTO — misure + parole, e i buchi tra le due
// ═══════════════════════════════════════════════════════════════════════════

/** Cosa è misurato, per ogni inventario sorvegliato. */
export function inventariMisurati(m) {
  return {
    aree: m.pannello.aree,
    sensori: m.immunitario.sensori,
    mani: m.mani.canali,
    servizi: m.worker.servizi,
    skill: m.estensioni.skill,
    workflow: m.estensioni.workflow,
  };
}

/**
 * Mette a confronto quello che c'è con quello che è spiegato.
 * `mancanti` = una cosa nuova senza parole (il caso che questo cancello esiste per prendere).
 * `fantasmi` = parole rimaste per una cosa che non c'è più (una mappa che promette un pezzo assente).
 */
export function censimento(repo, occhi = creaOcchi()) {
  const m = misura(repo, occhi);
  const inv = inventariMisurati(m);
  const mancanti = [];
  const fantasmi = [];
  for (const [chiave, nomi] of Object.entries(inv)) {
    const dette = DESCRIZIONI[chiave] || {};
    for (const n of nomi) if (!dette[n]) mancanti.push(`${chiave}/${n}`);
    for (const n of Object.keys(dette)) if (!nomi.includes(n)) fantasmi.push(`${chiave}/${n}`);
  }
  return { misure: m, inventari: inv, mancanti, fantasmi, guasti: m.guasti };
}

/**
 * Perché NON riesco a misurare, se non ci riesco. Un elenco vuoto qui non vuol dire «zero pezzi»:
 * vuol dire che ho guardato e non c'era niente da vedere — che è un'altra cosa dal non aver potuto
 * guardare, e le due non devono avere la stessa faccia.
 */
export function motiviDiCecita(cens) {
  const motivi = [...(cens.guasti || [])];
  const inv = cens.inventari || {};
  for (const [chiave, nomi] of Object.entries(inv)) {
    if (!nomi.length) motivi.push(`non ho contato nemmeno un elemento di «${NOMI_INVENTARIO[chiave] || chiave}»`);
  }
  if (!cens.misure?.senior?.agenti) motivi.push("non ho contato nemmeno un senior");
  return motivi;
}

/** 0 = mappa allineata · 1 = un pezzo nuovo senza parole, o parole per un pezzo sparito. */
export function codiceUscita(cens) {
  return cens.mancanti.length || cens.fantasmi.length ? 1 : 0;
}

/**
 * La FIRMA DELLA STRUTTURA: cambia solo quando nasce o sparisce un pezzo, non quando qualcuno
 * aggiunge righe a un file. È lei a decidere se la data del blocco si muove (e quindi se il blocco
 * risale in cima alla bacheca) oppure se il corpo si aggiorna in silenzio.
 */
export function firmaStruttura(cens) {
  const inv = cens.inventari;
  return {
    aree: [...inv.aree].sort(),
    sensori: [...inv.sensori].sort(),
    mani: [...inv.mani].sort(),
    servizi: [...inv.servizi].sort(),
    skill: [...inv.skill].sort(),
    workflow: [...inv.workflow].sort(),
    agenti: cens.misure.senior.agenti,
    parti: PARTI.length,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// LE NOVE PARTI — cosa sono, dette a Nicola
// ═══════════════════════════════════════════════════════════════════════════

const num = (n) => new Intl.NumberFormat("it-IT").format(n);
const pipe = (s) => String(s).replace(/\|/g, "\\|");

/**
 * Cosa compare al posto della spiegazione quando un pezzo nuovo non ce l'ha. Non è decorazione: il
 * buco deve VEDERSI, perché è il segnale che qualcuno deve scrivere una riga. (Con un buco in
 * elenco il guardiano esce 1 e la bacheca non viene nemmeno riscritta: questo testo si vede solo
 * lanciando il comando a mano, ed è lì che serve.)
 */
const senzaParole = "❓ **senza descrizione** — va scritta in `cervello/censimento-macchina.mjs`";

/** Le stanze vere della Cabina: le scorciatoie vecchie si contano a parte, non gonfiano il numero. */
const areeVive = (m) => m.pannello.aree.length - m.pannello.areeLegacy.length;

/** Una tabella «nome → cosa fa» per un inventario sorvegliato. */
function tabella(nomi, dette, intestazione) {
  const r = [`| ${intestazione} | Cosa fa |`, "| --- | --- |"];
  for (const n of nomi) r.push(`| \`${n}\` | ${pipe(dette[n] || senzaParole)} |`);
  return r;
}

/**
 * Le nove parti. `taglia` e `voci` ricevono le misure: i numeri dentro il testo sono quelli veri di
 * adesso, non quelli del giorno in cui è stata scritta la frase.
 */
export const PARTI = [
  {
    n: 1,
    emoji: "🖥️",
    titolo: "Il Pannello — la faccia",
    unaFrase: "Quello che vedi e dove firmi.",
    dove: "`pannello/` — ospitato su Vercel",
    taglia: (m) => `${m.pannello.file} file · ${num(m.pannello.righe)} righe · ${areeVive(m)} aree · ${m.pannello.rotte} rotte`,
    corpo: () =>
      "Un'app web che **non decide niente**: mostra quello che la macchina ha scritto e raccoglie le tue " +
      "risposte. È fatta così apposta — se il Pannello sparisse, la macchina continuerebbe a lavorare; " +
      "quello che perderesti è la possibilità di vederla e di firmarle le decisioni.",
    voci: (m) => [
      ["1.1", `Le aree (${areeVive(m)})`, `Le stanze in cui è divisa la Cabina — più ${m.pannello.areeLegacy.length} vecchie scorciatoie che oggi rimandano altrove. L'elenco qui sotto è letto dal codice, non scritto a mano.`],
      ["1.2", `Le caselle (${m.pannello.componenti} componenti)`, "I riquadri dentro le aree: bacheca, cuore della macchina, chat, autopilota, quaderni, volano."],
      ["1.3", `Le rotte interne (${m.pannello.rotte})`, "Ogni casella ha la sua fonte: memoria, metriche, lavori, marketplace, controllo. Nessuna scrive sul sito dei negozi."],
      ["1.4", `La logica (${m.pannello.lib} moduli)`, "Dove vivono le regole vere: firma di un'azione, chat unificata, autopilota, controllo di onestà, economia."],
      ["1.5", "Il contratto di navigazione", "La regola che fa funzionare il tasto INDIETRO sul telefono: ogni area, scheda e pannello sovrapposto è una tappa di cronologia, non un interruttore nascosto."],
      ["1.6", "Deploy e installazione", `Va online solo quando cambia \`pannello/\`, via Deploy Hook. È installabile sul telefono come un'app (PWA).`],
      ["1.7", `Il database della Cabina (${m.pannello.sql} file SQL)`, "Supabase **separato** da quello del marketplace: coda dei lavori, chat, diario, impostazioni, briefing. I dati dei negozi non si toccano da qui."],
    ],
    tabella: (m) => {
      const righe = ["| Area | Cosa contiene |", "| --- | --- |"];
      for (const a of m.pannello.aree) {
        const eti = m.pannello.areeLegacy.includes(a) ? " *(scorciatoia)*" : "";
        righe.push(`| \`${a}\`${eti} | ${pipe(DESCRIZIONI.aree[a] || senzaParole)} |`);
      }
      return ["", "**Le aree, una per una:**", "", ...righe];
    },
  },
  {
    n: 2,
    emoji: "🦾",
    titolo: "Il worker e il VPS — le braccia",
    unaFrase: "L'unico pezzo che esegue davvero, 24 ore su 24.",
    dove: "`cervello/worker.sh` + `cervello/vps/` — su un server sempre acceso",
    taglia: (m) => `${num(m.worker.righe)} righe · ${m.worker.servizi.length} servizi · ${m.worker.timer.length} timer`,
    corpo: () =>
      "Quando premi «Approva» sul Pannello, il Pannello **non fa** la cosa: scrive una riga in una coda. " +
      "È il worker, sul server, che la prende e la esegue. Questa separazione è voluta: la Cabina può " +
      "essere chiusa, il telefono spento, la sessione finita — il lavoro parte lo stesso. E se il worker " +
      "si ferma, non parte niente di nascosto: resta tutto in coda, visibile.",
    voci: (m) => [
      ["2.1", "Le due corsie", "Un worker per i lavori lunghi (giro, azioni) e uno per la chat, così una tua domanda non finisce in fila dietro mezz'ora di lavoro."],
      ["2.2", "La coda", "`in attesa` → `in corso` → `fatto` o `errore`. Con ritentativo automatico, recupero dei lavori rimasti orfani e scarto di quelli scaduti."],
      ["2.3", `I servizi e i timer (${m.worker.servizi.length} + ${m.worker.timer.length})`, "Due sempre accesi (worker e chat); gli altri partono a orario. L'elenco completo è qui sotto."],
      ["2.4", "Il motore AI", "Claude Code è il motore principale. Un instradatore sceglie il modello in base al compito, invece di usare sempre il più costoso."],
      ["2.5", "Le difese", "Non si sostituisce con una versione di sé stesso che non compila; lucchetto sulle scritture git; interruttore di pausa; battito del cuore."],
      ["2.6", "Installazione e diagnosi", "Script di setup, aggiornamento e diagnostica completa. Per guardarci dentro c'è la skill `worker`."],
    ],
    tabella: (m) => {
      const t = new Set(m.worker.timer);
      const righe = [`| Servizio | Quando parte | Cosa fa |`, "| --- | --- | --- |"];
      for (const s of m.worker.servizi) {
        righe.push(`| \`${s}\` | ${t.has(s) ? "a orario" : "sempre acceso"} | ${pipe(DESCRIZIONI.servizi[s] || senzaParole)} |`);
      }
      return ["", "**I servizi del server, uno per uno:**", "", ...righe];
    },
  },
  {
    n: 3,
    emoji: "🧠",
    titolo: "L'AD — la testa",
    unaFrase: "Chi decide, delega e scrive in memoria.",
    dove: "`CLAUDE.md` + i documenti in `cervello/`",
    taglia: (m) => `mansionario di ${num(m.ad.righeMansionario)} righe · giro di ${num(m.ad.righeGiro)} righe · ${m.ad.documenti} manuali`,
    corpo: () =>
      "L'AD non è un programma: è un **mansionario** che l'intelligenza artificiale rilegge ogni volta " +
      "prima di lavorare. Dice chi è, cosa può fare da sola, cosa deve chiederti, come parla e a chi " +
      "delega. Cambiare il comportamento della macchina vuol dire cambiare queste parole — non " +
      "riscrivere del codice.",
    voci: () => [
      ["3.1", "La regola d'oro 🟢🟡🔴", "Verde = lo fa e basta. Giallo = lo fa e ti avvisa. Rosso = si ferma e aspetta la tua firma. Nel dubbio sale di colore. Tutto il resto poggia su questo."],
      ["3.2", "Il giro", "La perlustrazione: legge i dati veri, passa i controlli automatici, scrive il briefing e aggiorna lo stato. È il battito che tiene viva l'azienda."],
      ["3.3", "Le cadenze", "Mattino, mezzogiorno, sera, venerdì, mese: ognuna ha uno scopo diverso e un formato diverso."],
      ["3.4", "I comandi", "Le frasi che fanno partire un lavoro («fai un giro», «radiografia», «contenuti pro»). Riconosciute anche dette in modo diverso."],
      ["3.5", "L'auto-coscienza", "Quattro manuali: verificare il proprio lavoro, analizzare sé stessa, confrontarsi coi migliori, estrarre le lezioni."],
      ["3.6", "I cancelli di qualità", "Nessun numero senza fonte · nessuna entità inventata · il titolo di un'azione deve suonare come lo diresti a voce, senza sigle."],
    ],
  },
  {
    n: 4,
    emoji: "👥",
    titolo: "I senior — la squadra",
    unaFrase: "Gli specialisti a cui l'AD passa il lavoro invece di farlo tutto lei.",
    dove: "`.claude/agents/` — un file per specialista",
    taglia: (m) => `${m.senior.agenti} senior · ${m.senior.quaderni} quaderni di memoria`,
    corpo: (m) =>
      `${m.senior.agenti} ruoli, ognuno col suo mansionario, i suoi limiti e il suo quaderno. ` +
      "Non sono chatbot diversi: sono lo stesso motore con istruzioni diverse, e il motivo per cui " +
      "esistono è che un esperto di una cosa sola sbaglia meno di un tuttofare. La regola che li tiene " +
      "in ordine è **un solo padrone per ogni mandato**: se due potrebbero occuparsene, uno dei due " +
      "rimanda all'altro per iscritto.",
    voci: () => [
      ["4.1", "Motori di soldi", "Vendite, onboarding, retention negozi, marketing, growth, CRM, ads, influencer, contenuti, SEO, design, stampa, istituzioni."],
      ["4.2", "Occhi", "Intelligence (il mondo fuori), analista (i numeri), data engineer (le tubature dei dati)."],
      ["4.3", "Costruttori", "Chi tocca il codice: tech, backend, frontend, devops, prodotto, automazioni."],
      ["4.4", "Fondamenta", "Finanza, contabilità, legale, sicurezza, antifrode, dispute, QA, consegne, supporto, cura del cliente."],
      ["4.5", "Cancelli creativi", "Direttore creativo e QA design: uccidono il contenuto debole prima che esca. Più UX, CRO e chi ottimizza i prompt."],
      ["4.6", "L'espansione", "Rischio e conformità, governo, innovazione, operazioni a scala, professionisti (commercialista, notaio, avvocati: **preparano, non firmano**), banche e finanziamenti."],
      ["4.7", "Le regole della squadra", "Un padrone per mandato · consegnare il lavoro fatto e non l'analisi di cosa fare · la Sala Operativa come canale comune · chiudere il cerchio scrivendo com'è andata."],
      ["4.8", "I quaderni", "Cosa ha imparato ogni reparto, in un file per reparto. Per guardarli a fondo c'è la skill `senior`."],
    ],
  },
  {
    n: 5,
    emoji: "🛡️",
    titolo: "Guardiani e sensori — il sistema immunitario",
    unaFrase: "Quello che impedisce alla macchina di raccontarti una bugia.",
    dove: "`cervello/*.mjs` — girano prima che l'AI scriva una riga",
    // AR-700 — `script` può essere `null` («non ho potuto contarli»): a Nicola si dice così, non «0».
    taglia: (m) =>
      `${m.immunitario.script == null ? "non sono riuscito a contare gli" : m.immunitario.script} script` +
      `${m.immunitario.scriptSottocartelle ? ` (${m.immunitario.scriptSottocartelle} nelle sottocartelle)` : ""}` +
      ` · ${m.immunitario.sensori.length} sensori · ${m.immunitario.test} test + ${m.immunitario.testBash} prove bash`,
    corpo: () =>
      "Sono controlli automatici che girano **prima** che il lavoro si chiuda. Non danno consigli: molti " +
      "hanno il potere di fermare tutto. Il principio è uno solo — *meglio memoria vecchia che memoria " +
      "che mente*: se uno strumento non riesce a misurare, il suo silenzio non vale come un sì. " +
      "L'elenco completo, con chi ferma cosa, è nella sezione «🛡️ I guardiani della macchina» qui in " +
      "bacheca: lì vive quella verità, e questa mappa la cita invece di ricopiarla.",
    voci: (m) => [
      ["5.1", "I guardiani del giro", "Esempi veri: un fatto cambiato in un posto solo · lo sforzo pesante solo dove c'è un negozio vero · chi esegue non può firmare sé stesso · nessun numero senza fonte."],
      ["5.2", `I sensori (${m.immunitario.sensori.length})`, "Gli occhi sul mondo. Un occhio cieco blocca i numeri nuovi: l'elenco è qui sotto."],
      ["5.3", "La visita di salute", "Tre risposte possibili per ogni controllo: ✅ provato, ❌ rotto, ⚪ non l'ho potuto vedere da qui. Il ⚪ non è mai un verde."],
      ["5.4", "Il cantiere dei difetti", "I difetti trovati sulla macchina stessa, con la loro causa radice e una prova che diventa rossa se il difetto torna."],
      ["5.5", `I test e la CI (${m.immunitario.test} + ${m.immunitario.testBash} + ${m.immunitario.ci})`, "I test girano a ogni giro, non solo quando qualcuno se li ricorda: un test che nessuno esegue è un file, non una rete."],
    ],
    tabella: (m) => ["", "**I sensori, uno per uno:**", "", ...tabella(m.immunitario.sensori, DESCRIZIONI.sensori, "Sensore")],
  },
  {
    n: 6,
    emoji: "📚",
    titolo: "La memoria — quello che ricorda",
    unaFrase: "Dove vive tutto ciò che la macchina sa e ha deciso.",
    dove: "`MyCity-Vault/` — più il database della Cabina",
    taglia: (m) => `${m.memoria.cartelleVault} cartelle · ${m.memoria.fatti} fatti-chiave · ${m.memoria.autoCoscienza} file di auto-coscienza`,
    corpo: () =>
      "Le cartelle numerate sono **tue**: lì la macchina propone, non riscrive. La cartella `90-Memoria-AI` " +
      "è sua: lì scrive da sola. La regola che tiene insieme tutto è **una casa sola per ogni fatto** — " +
      "un prezzo, una data, un obiettivo vivono in un posto e gli altri file li citano. Se una copia " +
      "vecchia resta in giro, un guardiano la trova e blocca la pubblicazione: una copia vecchia è una " +
      "bugia che il Pannello ti mostrerebbe come verità.",
    voci: (m) => [
      ["6.1", "Le tue cartelle", "Strategia, mercato, clienti, prodotto, soldi e rischi, piani, agenti. Sono tue: lì la macchina chiede prima di toccare."],
      ["6.2", "La memoria dell'AD", "Stato, decisioni (registro che non si riscrive mai), azioni in attesa, bacheca, sala operativa, lezioni, briefing archiviati."],
      ["6.3", `Il registro dei fatti (${m.memoria.fatti})`, "La fonte unica: prezzi, date concordate, negozio faro, obiettivi. Quello che leggi nella prima sezione di questa bacheca."],
      ["6.4", `L'auto-coscienza (${m.memoria.autoCoscienza} file)`, "Difetti, calibrazione, apprendimento, chi è reale e chi è una scelta ragionata, salute, costi, pagella."],
      ["6.5", "La memoria viva", "Chat, diario e briefing anche a database, così il Pannello te li mostra da qualunque dispositivo."],
      ["6.6", "Le consegne", "Dove i senior depositano il lavoro finito, una cartella per reparto. Le grafiche stanno in `creativi/`."],
    ],
  },
  {
    n: 7,
    emoji: "✋",
    titolo: "Mani e sensi — come tocca il mondo",
    unaFrase: "Come legge la realtà e come, quando glielo permetti, la cambia.",
    dove: "`cervello/publishers/` per le mani · i sensori per gli occhi",
    taglia: (m) => `${m.mani.canali.length} mani · ${m.mani.template} modelli grafici`,
    corpo: (m) =>
      "È la parte più delicata, e per questo è quella con più freni. I **sensi** leggono soltanto: sul " +
      "database del marketplace la macchina non scrive mai. Le **mani** invece toccano il mondo — un'email " +
      "che parte non torna indietro — e funzionano al contrario di come ci si aspetta: **quello che non è " +
      "esplicitamente permesso non parte**. Oggi la lista dei destinatari autorizzati contiene " +
      `${m.mani.allowlist.email} email e ${m.mani.allowlist.notifiche} utenti: finché resta così, anche ` +
      "un'azione firmata gira **a vuoto** e ti mostra cosa avrebbe fatto.",
    voci: (m) => [
      ["7.1", `Le mani (${m.mani.canali.length})`, "Ogni canale dichiara da sé il proprio rischio minimo e a chi arriva davvero. Un canale nuovo che non lo dichiara è trattato come 🔴 senza destinatario: non può aprirsi per distrazione."],
      ["7.2", "La lista dei permessi", "Vuota = prova a vuoto forzata. È il freno che rende sicura tutta l'automazione: si toglie un destinatario alla volta, di proposito."],
      ["7.3", "I sensi in lettura", "Dati del marketplace, pagamenti, comportamento sul sito. Sola lettura, sempre."],
      ["7.4", "Il codice del sito", "Una copia in sola lettura del marketplace, che i senior tecnici leggono per capire i problemi. Le modifiche vanno in un ramo separato, la messa online resta 🔴."],
      ["7.5", `La fabbrica dei contenuti (${m.mani.template} modelli)`, "Trasforma un testo in una grafica vera, con i colori e i caratteri del marchio. Più i collegamenti alle AI per immagini e video."],
    ],
    tabella: (m) => ["", "**Le mani, una per una:**", "", ...tabella(m.mani.canali, DESCRIZIONI.mani, "Mano")],
  },
  {
    n: 8,
    emoji: "🔄",
    titolo: "I flussi — come le parti si parlano",
    unaFrase: "I cicli veri: qui non ci sono file nuovi, c'è il «come funziona».",
    dove: "trasversale — tiene insieme le parti da 1 a 7",
    taglia: () => "5 cicli",
    corpo: () =>
      "Le prime sette parti sono i pezzi; questa è il movimento. Se dovessi capire una cosa sola di " +
      "tutta la macchina, capisci questi cinque cicli: spiegano perché tutto il resto esiste.",
    voci: () => [
      ["8.1", "Il ciclo di un'azione", "Un senior la prepara completa → finisce nella coda delle azioni → il Pannello te la mostra con «cosa cambia» e «se va bene» → tu firmi → il worker la esegue → l'esito torna in memoria. **Senza firma non parte niente.**"],
      ["8.2", "Il ciclo di un lavoro", "Scrivi in chat o premi un comando → nasce una riga in coda → il worker la prende → l'AI lavora → la risposta ti arriva mentre si scrive. Se cade: ritenta da solo, e se resta orfana qualcuno la recupera."],
      ["8.3", "Il ciclo del giro", "Un orario fa partire il giro → i sensori aprono gli occhi → i guardiani controllano → l'AD scrive briefing e stato → la memoria viene pubblicata → il Pannello la legge e si aggiorna."],
      ["8.4", "Il ciclo dell'apprendimento", "Com'è andata → lezione (le tue correzioni valgono doppio) → registro delle lezioni → torna nel contesto della sessione dopo. È il motivo per cui a inizio chat vedi «memoria persistente»."],
      ["8.5", "Il ciclo della pubblicazione", "Un ramo unico. Il codice ci arriva solo da una revisione, la memoria direttamente. Un lucchetto impedisce a due scritture di pestarsi, e il server tiene la sua copia allineata."],
    ],
  },
  {
    n: 9,
    emoji: "🧩",
    titolo: "Le estensioni — i moduli che si aggiungono",
    unaFrase: "Le capacità che si accendono quando servono, senza gonfiare il resto.",
    dove: "`.claude/skills/`, `.claude/workflows/`, `cervello/capacita/`",
    taglia: (m) => `${m.estensioni.skill.length} skill · ${m.estensioni.workflow.length} workflow · ${m.estensioni.capacita} capacità`,
    corpo: () =>
      "Tre cose diverse che spesso vengono confuse. Una **skill** è un mansionario che si apre da solo " +
      "quando serve (chiedi «la macchina sta bene?» e si apre quello della visita). Un **workflow** è una " +
      "squadra di analisti che parte in parallelo su un problema grosso e verifica ogni scoperta prima " +
      "di riportarla. Una **capacità** è un'idea di frontiera già scritta come modulo, in attesa del " +
      "momento in cui avrà senso accenderla.",
    voci: (m) => [
      ["9.1", `Le skill (${m.estensioni.skill.length})`, "Si aprono al momento giusto senza che tu debba chiamarle per nome. L'elenco è qui sotto."],
      ["9.2", `I workflow (${m.estensioni.workflow.length})`, "Analisi profonde a molte dimensioni, dove ogni problema trovato viene messo alla prova prima di finire nel report."],
      ["9.3", `Le capacità (${m.estensioni.capacita})`, "Il magazzino del futuro: il gemello digitale del negoziante, il concierge della spesa, il catalogo che si scrive da solo, il sismografo della città."],
    ],
    tabella: (m) => [
      "",
      "**Le skill:**",
      "",
      ...tabella(m.estensioni.skill, DESCRIZIONI.skill, "Skill"),
      "",
      "**I workflow:**",
      "",
      ...tabella(m.estensioni.workflow, DESCRIZIONI.workflow, "Workflow"),
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// IL TESTO — il blocco per la bacheca e il documento lungo
// ═══════════════════════════════════════════════════════════════════════════

/** Cosa questa mappa NON dice, scritto prima che qualcuno ci si appoggi troppo. */
export const COSA_NON_DICE =
  "Questa mappa dice **cosa c'è e quanto è grande**, non se funziona. Un pezzo può essere contato, " +
  "descritto e completamente rotto: qui risulterebbe sano. «Funziona?» è un'altra domanda e ha un " +
  "altro strumento — la visita di salute.";

function corpoParti(m) {
  const r = [];
  for (const p of PARTI) {
    r.push(`### ${p.n}. ${p.emoji} ${p.titolo}`);
    r.push("");
    r.push(p.corpo(m));
    r.push("");
    for (const [cod, tit, testo] of p.voci(m)) r.push(`- **${cod} ${tit}** — ${testo}`);
    if (p.tabella) r.push(...p.tabella(m));
    r.push("");
    r.push(`> 📁 Dove: ${p.dove} · 📏 Quanto: ${p.taglia(m)}`);
    r.push("");
  }
  return r;
}

/** Il blocco markdown per BACHECA.md, nel formato che il Pannello sa leggere. */
export function bloccoBacheca(cens, quando = "") {
  const m = cens.misure;
  const r = [];
  r.push(`## ${TITOLO_BACHECA} · ${quando}`);
  r.push("");
  r.push(
    "La macchina che manda avanti MyCity, spiegata a chi non l'ha costruita. **Nove parti**: tre fanno " +
      "il lavoro (la faccia, le braccia, la testa), tre lo controllano (la squadra, i guardiani, la " +
      "memoria), tre lo collegano al mondo (le mani, i flussi, le estensioni)."
  );
  r.push("");
  r.push(
    "Questa sezione non è scritta a mano: i numeri li conta `cervello/mappa-macchina.mjs` a ogni giro " +
      "leggendo il repo, quindi non possono invecchiare. Se nasce un pezzo nuovo — una skill, un " +
      "sensore, una mano, un servizio, un'area del Pannello — **il giro resta rosso finché qualcuno non " +
      "ha scritto cosa fa**. La data qui sopra si muove solo quando cambia la struttura, non a ogni ritocco."
  );
  r.push("");
  r.push("| # | Parte | In una frase | Quanto è grande |");
  r.push("| --- | --- | --- | --- |");
  for (const p of PARTI) {
    r.push(`| ${p.n} | ${p.emoji} **${pipe(p.titolo)}** | ${pipe(p.unaFrase)} | ${pipe(p.taglia(m))} |`);
  }
  r.push("");
  r.push(...corpoParti(m));
  r.push("### Come approfondire");
  r.push("");
  r.push(
    "Ogni voce ha un numero: in chat basta **«approfondisci 5.1»** o «spiegami il 2.2». Se preferisci a " +
      "voce: «cosa succede quando premo Approva» (è l'8.1), «chi mi protegge dalle bugie» (la parte 5), " +
      "«dove finiscono i soldi» (la 6.3 e i numeri della parte 1)."
  );
  r.push("");
  r.push(`> ⚠️ ${COSA_NON_DICE}`);
  if (cens.mancanti.length) {
    r.push("");
    r.push(
      `> 🔴 **${cens.mancanti.length} pezzi nuovi senza spiegazione:** ${cens.mancanti.map((x) => `\`${x}\``).join(", ")}. ` +
        "La mappa qui sopra è quindi incompleta: manca la riga che dice cosa fanno."
    );
  }
  return r.join("\n");
}

/** Il documento lungo per la memoria (stessa sostanza, fuori dalla bacheca). */
export function documento(cens, quando = "") {
  const m = cens.misure;
  const r = [];
  r.push("# 🗺️ Mappa della macchina — com'è fatta, pezzo per pezzo");
  r.push("");
  r.push(`> Generato da \`cervello/mappa-macchina.mjs\` — ultimo aggiornamento della struttura: ${quando}.`);
  r.push("> **Non si scrive a mano:** i numeri si contano dal repo a ogni giro; le parole che spiegano");
  r.push("> ogni pezzo vivono in `cervello/censimento-macchina.mjs`. Se modifichi questo file a mano, il");
  r.push("> prossimo giro lo sovrascrive.");
  r.push("");
  r.push("Lo stesso contenuto è nella Bacheca della home, nella sezione «Com'è fatta la macchina».");
  r.push("");
  r.push("| # | Parte | In una frase | Quanto è grande |");
  r.push("| --- | --- | --- | --- |");
  for (const p of PARTI) {
    r.push(`| ${p.n} | ${p.emoji} **${pipe(p.titolo)}** | ${pipe(p.unaFrase)} | ${pipe(p.taglia(m))} |`);
  }
  r.push("");
  r.push("---");
  r.push("");
  r.push(...corpoParti(m));
  r.push("---");
  r.push("");
  r.push("## Come approfondire");
  r.push("");
  r.push("In chat basta il numero: «approfondisci 5.1», «spiegami il 2.2».");
  r.push("");
  r.push(`⚠️ ${COSA_NON_DICE}`);
  r.push("");
  return r.join("\n");
}
