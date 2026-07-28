import { NextResponse } from "next/server";
import { apprendimentoSnello } from "@/lib/risposta-snella"; // AR-247/254: la logica sta dove un test la può eseguire
import { readVaultFile, readVaultFileEsito } from "@/lib/vault"; // AR-254: distinguere «vuoto» da «non letto»
import { sanificaListe } from "@/lib/memoria-json";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// 🧠 AUTO-COSCIENZA — il livello con cui la macchina pensa su se stessa: si controlla
// (auto-analisi), impara (apprendimento), si migliora (auto-miglioramento). Qui leggiamo
// i 5 digest che il giro scrive nel vault (cartella 90-Memoria-AI/auto-coscienza/) e li
// serviamo alla Cabina. €0: nessuna API Claude, solo lettura del vault.
// Spec/contratti: cervello/auto-coscienza.md.

const BASE = "90-Memoria-AI/auto-coscienza";

async function leggiJson(rel: string): Promise<any | null> {
  const raw = await readVaultFile(rel);
  if (raw == null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * AR-254 — come sopra, ma dice PERCHÉ quando non ci riesce.
 *
 * `apprendimento.json` ha superato il tetto di lettura (1.111.673 caratteri contro 1.000.000):
 * finora veniva troncato a metà stringa, `JSON.parse` falliva, e la scheda restava vuota **per
 * sempre** senza che nessuno sapesse perché. Un `null` non è una spiegazione.
 */
async function leggiJsonConMotivo(rel: string): Promise<{ dati: any | null; motivo: string }> {
  const esito = await readVaultFileEsito(rel);
  if (esito.stato === "troppo-grande") {
    return { dati: null, motivo: esito.dettaglio || "archivio troppo grande per essere letto" };
  }
  if (esito.stato !== "ok" || esito.testo == null) {
    return { dati: null, motivo: esito.stato === "assente" ? "" : "non riesco a raggiungere la memoria" };
  }
  try {
    return { dati: JSON.parse(esito.testo), motivo: "" };
  } catch {
    return { dati: null, motivo: "l'archivio è arrivato incompleto (JSON non valido)" };
  }
}

// 🛡️ Normalizzatore: il giro a volte scrive i JSON fuori dal contratto (nomi di campo o valori enum
// diversi). Qui rimappiamo le varianti più comuni sui campi che il Pannello legge, così le sezioni non
// restano vuote. NON inventa dati: copia solo da un sinonimo al campo giusto. La spec (cervello/*.md) resta
// la fonte di verità; questo è il paracadute per la deriva del giro.
function normStato(s: any): string {
  const v = String(s || "").toLowerCase();
  if (["confermato", "scelta_ragionata", "da_verificare", "scartato"].includes(v)) return v;
  if (v === "reale") return "confermato";
  if (v.includes("ragion")) return "scelta_ragionata";
  if (v.includes("conferm") || v.includes("verific") || v.includes("dubbi")) return "da_verificare";
  return v || "da_verificare";
}
// 🚫 Tipi che NON sono entità del mondo reale: sono concetti/metriche che un giro sbagliato
// a volte infila nel registro (es. «I 7 numeri» tipo "kpi-interni"). Non vanno MAI mostrati come
// «entità senza fondamento — bloccate»: un concetto non si «fonda» né si blocca. Si filtrano via.
const TIPI_NON_ENTITA = ["kpi-interni", "kpi", "numero", "numeri", "metrica", "metriche", "concetto", "dato", "dati"];
function eUnConcetto(e: any): boolean {
  const tipo = String(e?.tipo || "").toLowerCase().trim();
  if (TIPI_NON_ENTITA.includes(tipo)) return true;
  // Anche per nome: «i 7 numeri», «7 numeri», «numeri interni»…
  const nome = String(e?.nome || "").toLowerCase();
  return /\b\d?\s*numeri\b/.test(nome) || nome.startsWith("i 7 numeri");
}
function normalizza(d: { apprendimento: any; registro: any }) {
  // AR-252 — prima di tutto: i campi-lista dell'apprendimento devono ESSERE liste. Se il giro ci
  // scrive una frase o ci lascia dentro un buco, il `.map` del componente porta via l'intera Cabina.
  sanificaListe(d.apprendimento, { lezioni: "testo", principi: "", preferenze_nicola: "" });
  // Lezioni: il giro a volte usa `lezione`/`come_applicare` invece di `testo`.
  const lez = d.apprendimento?.lezioni;
  if (Array.isArray(lez)) {
    for (const l of lez) {
      if (l && l.testo == null) l.testo = l.lezione ?? l.come_applicare ?? l.principio ?? "";
    }
  }
  // Registro entità: il giro a volte usa stati REALE/DA-CONFERMARE/NON-VERIFICABILE → rimappa,
  // e SCARTA i non-entità (concetti/metriche) così non finiscono tra le «bloccate».
  if (d.registro && Array.isArray(d.registro.entita)) {
    d.registro.entita = d.registro.entita.filter((e: any) => e && !eUnConcetto(e));
    for (const e of d.registro.entita) e.stato = normStato(e.stato);
  }
}

// 🧹 SANIFICA i campi «header» dell'auto-analisi. Il giro a volte scrive un'INTERA FRASE dentro
// trend_fiducia (es. "= 86: refresh onesto +9min dal refresh 11:40 — …") o un voto sporco tipo
// "86: refresh…". Renderizzati nei badge compatti del Pannello (shrink-0) quei mattoni di testo
// SFONDANO la card e schiacciano il titolo accanto a 1 carattere per riga (testo verticale). Qui li
// riportiamo al contratto ALLA FONTE — così TUTTI i consumatori (Plancia + Auto-coscienza + futuri)
// ricevono un voto intero 0-100 e un trend che è SOLO un token breve (freccia/parola/±numero), mai una
// frase. Non inventa nulla: taglia il rumore. (fix «scritte che escono / testo verticale», per sempre)
function primoIntero(v: any): number | null {
  const m = String(v ?? "").match(/-?\d+/);
  if (!m) return null;
  const n = Math.round(Number(m[0]));
  return Number.isFinite(n) ? n : null;
}
function trendBreve(v: any): string {
  const t = String(v ?? "").trim();
  // Un trend legittimo è corto e senza punteggiatura di frase (. : ; —). Tutto il resto = deriva del giro.
  return t.length > 0 && t.length <= 24 && !/[.:;—]/.test(t) ? t : "";
}
/**
 * AR-212 — gli alias che SPENGONO informazione nella Cabina.
 *
 * Il giro scriveva `domande_bloccanti` mentre questa route (e il Pannello) leggono
 * `domande_per_nicola`: risultato, «nessuna domanda» in Cabina mentre nel file ce n'erano TRE, una
 * sul bando in scadenza fra tre giorni. Nessuno se n'è accorto perché il numero mostrato era
 * plausibile: zero domande è uno stato normale, non un errore che salta all'occhio.
 *
 * Il cancello vero è in `cervello/valida-contratti.mjs`, che ora vieta gli alias e dà al giro un
 * vincolo hard. Questo è la difesa dal lato di chi LEGGE, e serve per due motivi: fa vedere a Nicola
 * le domande SUBITO invece che al prossimo giro, e continua a coprire se un domani il modello
 * inventerà un sinonimo nuovo — cosa che, sotto pressione di contesto, farà.
 *
 * Non inventa niente: sposta un campo dove il Pannello lo cerca, e solo se quello canonico è vuoto.
 */
const ALIAS_ANALISI: Record<string, string> = {
  domande_bloccanti: "domande_per_nicola",
  domande: "domande_per_nicola",
  errori_giro: "errori",
  problemi: "errori",
};
function riportaAlias(a: any): void {
  if (!a || typeof a !== "object") return;
  for (const [alias, canonico] of Object.entries(ALIAS_ANALISI)) {
    const vuoto = !Array.isArray(a[canonico]) || a[canonico].length === 0;
    if (vuoto && Array.isArray(a[alias]) && a[alias].length > 0) a[canonico] = a[alias];
  }
}

function sanificaAnalisi(a: any): void {
  if (!a || typeof a !== "object") return;
  riportaAlias(a); // AR-212: prima di tutto, non perdere le domande per un sinonimo
  const voto = primoIntero(a.voto_fiducia);
  if (voto != null) a.voto_fiducia = Math.max(0, Math.min(100, voto));
  if (a.trend_fiducia != null) a.trend_fiducia = trendBreve(a.trend_fiducia);
  // AR-252 — anche i campi-LISTA vanno riportati al contratto qui, alla fonte. Il giro a volte scrive
  // `domande_per_nicola` come una frase sola: sulle stringhe `.length` è vero ma `.map` non esiste,
  // quindi il guardiano `?.length` del Pannello lasciava passare proprio ciò da cui doveva difendere
  // e la Cabina diventava bianca. Difeso qui vale per OGNI consumatore, presente e futuro — invece
  // che a mano, un campo alla volta, dove qualcuno ha visto rompersi qualcosa.
  sanificaListe(a, { domande_per_nicola: "domanda", errori: "titolo", punti_ciechi: "", miglioramenti_prossimo_giro: "" });
}

// 🩺 Un'auto-analisi è «affidabile» solo se ha davvero contenuto: un voto numerico in [0,100] E una
// sintesi non vuota. I giri rotti del VPS scrivono { voto_fiducia: 7, sintesi: "", salute: null }:
// un guscio vuoto. Restituire false fa sì che il Pannello NON mostri quel «7/100» come fosse credibile.
function analisiAffidabile(a: any): boolean {
  if (!a) return false;
  const v = Number(a.voto_fiducia);
  const votoOk = Number.isFinite(v) && v >= 0 && v <= 100;
  const sintesiOk = typeof a.sintesi === "string" && a.sintesi.trim().length >= 20;
  return votoOk && sintesiOk;
}

function oreDaDataPiacenza(dataStr: unknown): number | null {
  const m = String(dataStr ?? "").match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/);
  if (!m) return null;
  const [, y, mo, d, h = "12", mi = "00"] = m;
  const t = new Date(`${y}-${mo}-${d}T${h}:${mi}:00+02:00`).getTime();
  if (Number.isNaN(t)) return null;
  return (Date.now() - t) / 3600000;
}

/** Sensori LIVE: salute e gap si aggiornano a ogni poll anche senza un giro completo. */
function calcolaLive(analisi: any, sensori: any) {
  if (!sensori?.sensori) return null;
  const s = sensori.sensori;
  const meta = sensori.meta || {};
  const aggSensori = sensori.aggiornato || null;
  const oreSensori = oreDaDataPiacenza(aggSensori);
  const oreAnalisi = oreDaDataPiacenza(analisi?.data);
  const restOk = s.supabase_rest?.stato === "ok" && meta.dati_ordini_ciechi !== true;
  const mcpCieco = s.mcp_supabase?.stato === "cieco";
  const stripeStato = String(s.stripe_api?.stato || "");
  const salute_macchina = {
    supabase: restOk ? "ok" : s.supabase_rest?.stato === "ok" ? "parziale" : "cieco",
    stripe: stripeStato === "ok" ? "ok" : stripeStato === "non_configurato" ? "non_configurato" : "cieco",
    dati_freschi: oreSensori != null && oreSensori < 3,
    sensori_attivi: Number(meta.sensori_ok) || 0,
  };
  const gap: string[] = [];
  if (mcpCieco && !restOk) {
    gap.push("Sensori marketplace parzialmente ciechi — verifica canale ordini.");
  }
  if (s.sito_uptime?.stato === "non_configurato") {
    gap.push("Uptime del sito non monitorato (URL storefront assente).");
  }
  return {
    sensori_aggiornato: aggSensori,
    analisi_data: analisi?.data || null,
    analisi_ore_fa: oreAnalisi != null ? Math.round(oreAnalisi) : null,
    analisi_stale: oreAnalisi != null && oreAnalisi > 24,
    salute_macchina,
    gap,
  };
}

export async function GET() {
  const [analisi, appEsito, miglioramento, calibrazione, registro, sensori] = await Promise.all([
    leggiJson(`${BASE}/auto-analisi.json`),
    leggiJsonConMotivo(`${BASE}/apprendimento.json`),
    leggiJson(`${BASE}/auto-miglioramento.json`),
    leggiJson(`${BASE}/calibrazione.json`),
    leggiJson(`${BASE}/registro-realta.json`),
    leggiJson(`${BASE}/sensori-cecita.json`),
  ]);
  // AR-254: l'apprendimento porta con sé il MOTIVO quando non si è potuto leggere.
  const apprendimento = appEsito.dati;
  const apprendimentoMotivo = appEsito.motivo;

  const collegato = Boolean(analisi || apprendimento || miglioramento);
  if (!collegato) {
    return NextResponse.json({
      collegato: false,
      messaggio:
        "La macchina non ha ancora fatto la sua auto-analisi. Al prossimo giro (cervello/giro.md, passi Auto-analisi/Apprendimento) genera il primo verdetto su se stessa.",
    });
  }
  normalizza({ apprendimento, registro });
  sanificaAnalisi(analisi); // voto→intero 0-100, trend→token breve (niente frasi che sfondano la card)
  // 🩺 Segnaliamo al Pannello se l'auto-analisi è un guscio vuoto (giro rotto): così mostra uno stato
  // «in aggiornamento» invece di un allarmante e falso «7/100». Il dato grezzo resta, ma marcato.
  const analisi_affidabile = analisiAffidabile(analisi);
  const live = calcolaLive(analisi, sensori);
  if (analisi && live?.salute_macchina) {
    analisi.salute_macchina = live.salute_macchina;
  }
  const aggiornato = [analisi?.aggiornato, apprendimento?.aggiornato, miglioramento?.aggiornato, live?.sensori_aggiornato]
    .filter(Boolean)
    .sort()
    .pop() || null;
  // AR-247 / AR-254 — due difetti, un fix solo: mancava il confine fra «file di memoria della
  // macchina» e «risposta per il telefono». La route rimandava l'oggetto INTERO, e apprendimento.json
  // pesa 1.131.270 byte — 344 KB in rete a ogni tick, ogni 30 secondi, anche in 4G. Le stesse cifre
  // spiegano AR-254: quel file ha superato il tetto di lettura di 1 MiB (1.048.576), quindi in
  // produzione arriva `null` e la scheda Apprendimento resta vuota PER SEMPRE.
  //
  // Il grasso è tutto di servizio: 211 chiavi su 217 iniziano con `_` (note di metabolizzazione, gate,
  // consolidamenti) e nessuna schermata le mostra. Le lezioni sono 476 e la UI ne mostra quelle di 7
  // giorni. Qui si manda ciò che la UI dichiara di leggere, e basta.
  return NextResponse.json({
    collegato: true,
    aggiornato,
    live,
    analisi,
    analisi_affidabile,
    apprendimento: apprendimentoSnello(apprendimento),
    // AR-254: se la scheda è vuota, questa riga dice perché — invece di lasciarla vuota per sempre.
    apprendimento_non_leggibile: apprendimentoMotivo || null,
    miglioramento,
    calibrazione,
    registro,
  });
}
