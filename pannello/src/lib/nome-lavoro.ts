/**
 * IL NOME DI UN LAVORO — come lo chiamerebbe Nicola a voce.
 *
 * Il difetto che cura (segnalato da Nicola il 12/8 con lo screenshot dei Lavori): nella lista le
 * caselle si chiamavano «analisi», «analisi», «playbook», «playbook». Non è un nome, è il nome
 * della SPECIE: quattro cartelle identiche in cui bisogna entrare una per una per sapere cosa
 * contengono. Il nome vero c'è sempre stato — dentro la richiesta — ma la lista non lo guardava.
 *
 * Qui ogni forma di richiesta che la macchina scrive davvero (le ho contate sul database della
 * memoria, 3.033 righe) diventa un nome proprio:
 *
 *   PLAYBOOK Recupero carrelli: leggi i carrelli…        →  🛒 Recupero carrelli abbandonati
 *   Sentinella macchina 🧠 — SALUTE BASSA: il voto…      →  🧠 Salute bassa: il voto salute…
 *   Sentinella azioni 💼 — NEGOZIO FERMO: 1 negozi…      →  💼 Negozio fermo: 1 negozi LIVE con…
 *   ## Casella del Pannello: Esperimento prezzi          →  Esperimento prezzi
 *   Recupero automatico della cadenza «Piano del…»       →  Recupero «Piano del mattino»
 *   RIPROVA (…). Azione originale fallita: PLAYBOOK…     →  🔄 🛒 Recupero carrelli abbandonati
 *
 * Regola di scrittura (cervello/scrittura-umana.md): il nome si legge a voce, comincia da COSA è
 * successo e non da chi l'ha mandato, e non porta sigle, id o percorsi. Le targhe stanno dentro,
 * non sul titolo.
 *
 * Funzione PURA: nessuna rete, nessun DOM. Gira uguale nel browser, nella route e nel test.
 */

import { PLAYBOOKS } from "./playbook-catalogo";
import { PLACEHOLDER_ALLEGATI, userContentDaRichiesta } from "./chat-thread-merge";

export type LavoroDaNominare = {
  tipo?: string | null;
  richiesta?: string | null;
};

/** Quanto può essere lungo un nome: due righe di card, non di più. */
const LIMITE = 100;

/**
 * Il nome della SPECIE, per quando la richiesta non c'è (lista leggera che non l'ha ancora
 * caricata, o riga senza testo). È un ripiego, ma almeno è italiano: mai lo slug tecnico.
 */
const ETICHETTE: Record<string, string> = {
  giro: "Giro di perlustrazione",
  chat: "Messaggio in chat",
  playbook: "Playbook dell'arsenale",
  analisi: "Analisi dell'AD",
  report: "Report",
  intelligence: "Ricerca sul mercato",
  monitora: "Monitoraggio del web",
  metabolizza: "Memoria da metabolizzare",
  proposta: "Proposta approvata",
  "esegui-azione": "Azione approvata",
  "rifiuta-azione": "Azione rifiutata",
  manutenzione: "Manutenzione della macchina",
  spiegazione: "Spiegazione di una decisione",
  "ritmo-mattino": "Piano del mattino",
  "ritmo-mezzogiorno": "Punto di mezzogiorno",
  "ritmo-sera": "Report della sera",
  "ritmo-settimana": "Review della settimana",
};

/** Taglia a `max` senza spezzare una parola a metà. */
function taglia(testo: string, max = LIMITE): string {
  const t = testo.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const corto = t.slice(0, max);
  const spazio = corto.lastIndexOf(" ");
  return `${(spazio > max * 0.6 ? corto.slice(0, spazio) : corto).trim()}…`;
}

/** La prima frase (fino al primo punto fermo), che è quasi sempre "cosa è successo". */
function primaFrase(testo: string): string {
  const t = testo.replace(/\s+/g, " ").trim();
  const stop = t.search(/[.!?](\s|$)/);
  return stop > 0 ? t.slice(0, stop) : t;
}

/**
 * «SALUTE BASSA» → «Salute bassa». Solo se il testo è davvero tutto maiuscolo: un nome scritto
 * normalmente (con dentro sigle come SEO o IVA) non va toccato.
 */
function daMaiuscolo(testo: string): string {
  const t = testo.trim();
  const lettere = t.replace(/[^\p{L}]/gu, "");
  const maiuscole = t.replace(/[^\p{Lu}]/gu, "").length;
  const urlato = lettere.length > 0 && maiuscole / lettere.length > 0.7;
  const base = urlato ? t.toLocaleLowerCase("it-IT") : t;
  return base.charAt(0).toLocaleUpperCase("it-IT") + base.slice(1);
}

/** Le emoji dentro un frammento (la sentinella porta la sua: 🧠 macchina, 💼 azioni, …). */
function emojiDi(testo: string): string {
  return (testo.match(/\p{Extended_Pictographic}/gu) || []).join("");
}

const RIPROVA = /^RIPROVA\s*\([^)]*\)\.\s*Azione originale fallita:\s*/i;

/** Una riapprovazione è la STESSA azione di prima: si nomina come l'originale, con 🔄 davanti. */
function sciogliRiprova(testo: string): { testo: string; riprovata: boolean } {
  if (!RIPROVA.test(testo)) return { testo, riprovata: false };
  return { testo: testo.replace(RIPROVA, "").trim(), riprovata: true };
}

/** Il playbook del catalogo che ha generato questa richiesta (per nome e emoji veri). */
function playbookDalCompito(chiave: string) {
  const atteso = `playbook ${chiave.trim().toLocaleLowerCase("it-IT")}:`;
  return PLAYBOOKS.find((p) => p.compito.toLocaleLowerCase("it-IT").startsWith(atteso));
}

function nomeDalTesto(testo: string, tipo: string): string {
  // Il giro ha un nome solo, e lo ha sempre avuto.
  if (tipo === "giro") return "Giro di perlustrazione";
  if (!testo) return "";

  // ① La casella del Pannello porta già il suo titolo scritto da chi l'ha aperta.
  const casella = testo.match(/^##\s*Casella del Pannello:\s*(.+)$/m);
  if (casella?.[1]?.trim()) return casella[1].trim();

  // ② Playbook: il nome vero sta nel catalogo dell'arsenale, non nella riga di istruzioni.
  const pb = testo.match(/^PLAYBOOK\s+([^:\n]{2,60}):/i);
  if (pb) {
    const trovato = playbookDalCompito(pb[1]);
    return trovato ? `${trovato.emoji} ${trovato.titolo}` : `Playbook ${pb[1].trim()}`;
  }

  // ③ Sentinelle: «Sentinella macchina 🧠 — SALUTE BASSA: il voto…». Il TITOLO dice cosa è
  //    successo, il dettaglio distingue due allarmi della stessa famiglia (voto 45 ≠ voto 9).
  const sn = testo.match(/^Sentinella\s+([^\n—]*?)\s*—\s*([^:\n]{2,90})(:\s*)?/);
  if (sn) {
    const emoji = emojiDi(sn[1]);
    const testa = [emoji, daMaiuscolo(sn[2])].filter(Boolean).join(" ");
    const dettaglio = sn[3] ? primaFrase(testo.slice(sn[0].length)) : "";
    return dettaglio ? `${testa}: ${taglia(dettaglio, 60)}` : testa;
  }

  // ④ Cadenza recuperata dopo un rate-limit del motore.
  const cadenza = testo.match(/Recupero automatico della cadenza\s*«([^»]+)»/);
  if (cadenza) return `Recupero «${cadenza[1].trim()}»`;

  // ⑤ Le due forme dell'approvazione dal Pannello: proposta del giro e azione in coda.
  const proposta = testo.match(/PROPOSTA DAL GIRO:\s*\n?\s*«?([^»\n]+)»?/);
  if (proposta?.[1]?.trim()) return `Proposta approvata: ${proposta[1].trim()}`;
  const azione = testo.match(/APPROVATA dal Pannello l['’]azione\s*[“"«]([^”"»\n]+)[”"»]/);
  if (azione?.[1]?.trim()) return `Azione approvata: ${azione[1].trim()}`;

  // ⑥ «Spiegami perché è stata presa questa decisione: "…"».
  const perche = testo.match(/questa decisione di MyCity:\s*[“"«]?\s*\**([^”"»\n*]+)/i);
  if (perche?.[1]?.trim()) return `Perché: ${perche[1].trim()}`;

  // ⑦ Chat: conta il messaggio di Nicola, non il contesto che gli sta sopra.
  const messaggio = userContentDaRichiesta(testo).trim();
  if (messaggio && messaggio !== PLACEHOLDER_ALLEGATI) return primaFrase(messaggio);

  // ⑧ Ultimo appiglio: la prima riga che sia davvero una frase (niente intestazioni né note).
  const prima = testo
    .split("\n")
    .map((r) => r.trim())
    .find((r) => r && !r.startsWith("#") && !r.startsWith("[") && !r.startsWith(">"));
  return prima ? primaFrase(prima) : "";
}

/**
 * Il nome di un lavoro. Ricavato dalla richiesta quando c'è; altrimenti l'etichetta italiana della
 * sua specie — mai lo slug tecnico, che è il difetto da cui è nata questa funzione.
 */
export function nomeLavoro(lv: LavoroDaNominare): string {
  const tipo = (lv.tipo || "").trim();
  const grezza = (lv.richiesta || "").trim();
  const { testo, riprovata } = sciogliRiprova(grezza);
  const nome = nomeDalTesto(testo, tipo) || etichettaTipo(tipo);
  return taglia(riprovata ? `🔄 ${nome}` : nome);
}

/** Il nome italiano della specie di lavoro (ripiego quando la richiesta non è stata caricata). */
export function etichettaTipo(tipo: string): string {
  const t = (tipo || "").trim();
  if (!t) return "Lavoro";
  return ETICHETTE[t] || daMaiuscolo(t.replace(/[-_]+/g, " "));
}
