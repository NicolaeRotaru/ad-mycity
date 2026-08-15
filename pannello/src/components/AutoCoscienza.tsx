"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Microscope,
  GraduationCap,
  Rocket,
  ShieldAlert,
  HelpCircle,
  EyeOff,
  Activity,
  Target,
  Lightbulb,
  Swords,
  CheckCircle2,
  AlertTriangle,
  Send,
  MessageSquarePlus,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { dataVault, dataVaultRecente } from "@/lib/format";
import { ancoraChiesta, vaiArea } from "@/lib/nav";
import { usePanelSync } from "@/lib/panel-sync";
import { fondiLocaliSuServer } from "@/lib/stato-vivo";
import ParlaCasella from "@/components/ParlaCasella";
import CasellaAnteprima, { anteprimaTesto } from "@/components/CasellaAnteprima";
import { TestoUmano } from "@/components/TestoUmano";
import { humanizzaErrore, traduciTestoCompleto } from "@/lib/radiografia-umana";
import { listaSicura } from "@/lib/memoria-json";
import { classeCampo, classeComando, classeComandoSommario } from "@/lib/tocco-bersaglio";
import {
  autonomiaLeggibile,
  contestoBenchmark,
  divarioLeggibile,
  repartoLeggibile,
  saluteValore,
  statoEntita,
  statoLezione,
} from "@/lib/auto-coscienza-umana";

// 🔑 Id stabile di una domanda, derivato dal suo testo (djb2): resta lo stesso tra
// un refresh e l'altro finché la domanda è la stessa → così sappiamo a quale è già
// stata data risposta. Niente dipendenze esterne.
function qidDa(testo: string): string {
  const s = (testo || "").trim();
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return "q" + h.toString(36);
}

type Salvata = { risposta: string; at: string };

// 💬 Casella per rispondere a una domanda dell'AD. Se c'è già una risposta, la
// mostra; altrimenti apre un campo e la manda al cervello (POST /api/memoria/risposta).
function RispostaBox({
  qid,
  domanda,
  salvata,
  onSalvata,
}: {
  qid: string;
  domanda: string;
  salvata?: Salvata;
  onSalvata: (qid: string, risposta: string, at: string) => void;
}) {
  const [aperto, setAperto] = useState(false);
  const [bozza, setBozza] = useState("");
  const [inviando, setInviando] = useState(false);
  const [err, setErr] = useState("");

  if (salvata) {
    return (
      <div className="mt-2 rounded-lg border border-green-200 bg-green-50/60 px-3 py-2">
        <div className="text-[10.5px] font-semibold text-green-700 uppercase tracking-wide flex items-center gap-1">
          <CheckCircle2 size={12} /> La tua risposta
        </div>
        <div className="text-[12.5px] text-ink/85 mt-0.5 whitespace-pre-wrap break-words">{salvata.risposta}</div>
        <div className="t-eti mt-0.5">il cervello la applica al prossimo giro{salvata.at ? ` · ${dataVault(salvata.at)}` : ""}</div>
      </div>
    );
  }

  async function invia() {
    const testo = bozza.trim();
    if (!testo) return;
    setInviando(true);
    setErr("");
    try {
      const r = await fetch("/api/memoria/risposta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qid, domanda, risposta: testo }),
      }).then((x) => x.json());
      if (r?.ok) onSalvata(qid, testo, r.at || "");
      else setErr(r?.error || "Non riuscito.");
    } catch {
      setErr("Errore di rete.");
    } finally {
      setInviando(false);
    }
  }

  return (
    <div className="mt-2">
      {!aperto ? (
        <button onClick={() => setAperto(true)} className="inline-flex items-center gap-1 text-[12px] font-medium text-brand hover:underline">
          <MessageSquarePlus size={13} /> ✍️ Rispondi
        </button>
      ) : (
        <div className="space-y-1.5">
          <textarea
            value={bozza}
            onChange={(e) => setBozza(e.target.value)}
            rows={2}
            autoFocus
            placeholder="Scrivi la tua risposta… arriva al cervello e chiude la domanda."
            className={classeCampo("input-soft w-full text-[12.5px] resize-y")}
          />
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={invia}
              disabled={inviando || !bozza.trim()}
              className="inline-flex items-center gap-1.5 bg-brand text-white text-[12px] font-medium px-3 py-1.5 rounded-lg hover:bg-brand-dark disabled:opacity-50 transition"
            >
              {inviando ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />} Invia al cervello
            </button>
            <button onClick={() => { setAperto(false); setBozza(""); setErr(""); }} className={classeComando("t-eti hover:text-brand")}>annulla</button>
            {err && <span className="t-eti text-red-600">{err}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

// 🧠 AUTO-COSCIENZA — il pannello con cui Nicola vede la macchina pensare su se stessa:
// si controlla (auto-analisi), impara (apprendimento), si migliora (auto-miglioramento).
// Legge /api/memoria/auto-coscienza (i 5 digest del vault). Spec: cervello/auto-coscienza.md.

type Errore = { gravita?: string; titolo?: string; dettaglio?: string; azione_presa?: string; riguarda?: string; livello_scoperta?: string };
type Domanda = { id?: string; domanda?: string; perche_serve?: string; se_rispondi?: string; gravita?: string };
type Analisi = {
  // voto_fiducia DOVREBBE essere un numero 0-100, ma il giro a volte ci scrive una frase:
  // accettiamo entrambi e in render coerciamo (vedi votoF/votoFOk), così l'header non esplode.
  data?: string; voto_fiducia?: number | string; trend_fiducia?: string; sintesi?: string;
  verifiche?: Record<string, string>; errori?: Errore[]; domande_per_nicola?: (Domanda | string)[];
  punti_ciechi?: string[]; miglioramenti_prossimo_giro?: string[];
  salute_macchina?: { supabase?: string; stripe?: string; dati_freschi?: boolean; sensori_attivi?: number; sito_uptime?: string };
};
type Lezione = { id?: string; testo?: string; tag?: string[]; reparto?: string; confidenza?: number; evidenze?: number; fonte?: string; stato?: string; nato?: string; ultima_conferma?: string };
type AppMeta = {
  lezioni_attive?: number;
  promosse_a_principio?: number;
  decadute?: number;
  tasso_applicazione?: number;
  tasso_calcolato_il?: string;
  tick_leggero_il?: string;
};
type Apprendimento = { data?: string; aggiornato?: string; lezioni?: Lezione[]; principi?: string[]; preferenze_nicola?: string[]; meta?: AppMeta };
type Calibrazione = { per_reparto?: { reparto?: string; previsioni?: number; azzeccate?: number; punteggio?: number; autonomia?: string; nota?: string }[] };
type Benchmark = {
  reparto?: string;
  ambito?: string;
  livello_attuale_L?: number;
  migliori?: { chi?: string; livello?: string; cosa_fa?: string; fonte?: string; esempi?: { cosa?: string; link?: string }[] }[];
  divario?: string;
  obiettivo?: string;
  progresso?: { data?: string; punteggio?: number; fonte?: string; nota?: string }[];
  nostro?: string;
  cosa_ci_manca?: string;
};
type Miglioramento = {
  data?: string;
  aggiornato?: string;
  meta_esperimenti?: { aggiornato?: string };
  benchmark?: Benchmark[];
  esperimenti?: { id?: string; ipotesi?: string; reparto_guida?: string; stato?: string; esito?: string }[];
  peer_review?: { lavoro?: string; autore?: string; reviewer?: string; revisori?: string[]; reviewed?: string; prima?: string; dopo?: string; guadagno?: string; voto?: number; punti_forza?: string[]; punti_deboli?: string[]; raccomandazione?: string }[];
  proposte_auto_riscrittura?: { cosa?: string; perche?: string; dove?: string; stato?: string }[];
};
type Entita = { id?: string; nome?: string; tipo?: string; stato?: string; fonte?: string; confidenza?: number; fonte_ragionamento?: string; evidenze?: string[]; note?: string; domanda_per_nicola?: string };
type Registro = { entita?: Entita[] };
type LiveAnalisi = {
  sensori_aggiornato?: string | null;
  analisi_data?: string | null;
  analisi_ore_fa?: number | null;
  analisi_stale?: boolean;
  salute_macchina?: Analisi["salute_macchina"];
  gap?: string[];
};
type Dati = {
  collegato: boolean;
  messaggio?: string;
  aggiornato?: string | null;
  live?: LiveAnalisi | null;
  analisi?: Analisi;
  analisi_affidabile?: boolean;
  apprendimento?: Apprendimento;
  apprendimento_non_leggibile?: string | null; // AR-254: perché la scheda è vuota
  miglioramento?: Miglioramento;
  calibrazione?: Calibrazione;
  registro?: Registro;
};

const VERIFICA_LABEL: Record<string, string> = { entita: "Entità reali", numeri: "Numeri con fonte", coerenza: "Coerenza", semaforo: "Semaforo 🟢🟡🔴", qualita: "Qualità" };

type Tab = "analisi" | "apprendimento" | "miglioramento";

const GRAV: Record<string, { cls: string; dot: string; label: string }> = {
  alta: { cls: "border-red-200 bg-red-50/60", dot: "bg-red-500", label: "ALTA" },
  media: { cls: "border-amber-200 bg-amber-50/60", dot: "bg-amber-500", label: "MEDIA" },
  bassa: { cls: "border-black/10 bg-paper/40", dot: "bg-black/30", label: "BASSA" },
};

function votoColore(v?: number) {
  if (v == null || !Number.isFinite(v)) return "text-black/40";
  if (v >= 80) return "text-green-600";
  if (v >= 60) return "text-amber-600";
  return "text-red-600";
}

// Un «trend» sano è un token breve. Il giro a volte ci scrive una frase intera: nel blocco shrink-0 a
// destra del titolo quella frase non si stringe → schiaccia il titolo a 1 carattere per riga (testo
// verticale). L'API già lo sanifica; questo è il paracadute UI. (fix «scritta in verticale»)
function trendBreve(v: unknown): string {
  const t = String(v ?? "").trim();
  return t.length > 0 && t.length <= 24 && !/[.:;—]/.test(t) ? t : "";
}

function barra(conf?: number) {
  const pct = Math.round((conf ?? 0) * 100);
  const c = pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-amber-500" : "bg-black/30";
  return (
    <div className="h-1.5 w-16 rounded-full bg-black/10 overflow-hidden shrink-0">
      <div className={`h-full ${c}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function dataLezione(l: Lezione): Date | null {
  const raw = (l.ultima_conferma || l.nato || "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const dt = new Date(`${raw}T12:00:00`);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function lezioneRecente(l: Lezione, giorni = 7): boolean {
  const dt = dataLezione(l);
  if (!dt) return false;
  const lim = new Date();
  lim.setDate(lim.getDate() - giorni);
  lim.setHours(0, 0, 0, 0);
  return dt >= lim;
}

export default function AutoCoscienza({
  fixedTab,
  hideSwitcher = false,
}: {
  fixedTab?: Tab;
  hideSwitcher?: boolean;
} = {}) {
  const [d, setD] = useState<Dati | null>(null);
  // Il riquadro di questa casella. Serve al salto del deep-link (AR-673): si punta al nodo, non a
  // un nome da cercare in giro per la pagina.
  const riquadroRef = useRef<HTMLElement | null>(null);
  const [tabInterno, setTabInterno] = useState<Tab>("analisi");
  const tab = fixedTab ?? tabInterno;
  const setTab = fixedTab ? () => {} : setTabInterno;
  // Risposte già date alle domande dell'AD (qid → {risposta, at}).
  const [risposte, setRisposte] = useState<Record<string, Salvata>>({});
  // AR-238 — MERGE, NON SOSTITUZIONE. Le risposte date IN QUESTA SESSIONE restano qui finché il
  // server non le riporta uguali. Prima il ripasso a 30s faceva `setRisposte(x.risposte)`, cioè
  // sostituiva l'intera mappa: se il salvataggio era fallito (e la route rispondeva ok:true lo
  // stesso) la risposta appena data spariva e la stessa domanda tornava sotto gli occhi.
  // È la difesa che l'area Azioni ha da mesi (`decisiLocaliRef`, «bug #7») e che qui non era mai
  // arrivata.
  const risposteLocaliRef = useRef<Map<string, Salvata>>(new Map());
  const onSalvata = (qid: string, risposta: string, at: string) => {
    risposteLocaliRef.current.set(qid, { risposta, at });
    setRisposte((s) => ({ ...s, [qid]: { risposta, at } }));
  };
  // 🔗 Azioni da firmare indicizzate per origine: per ogni casella (domanda/entità) sappiamo
  // se esiste un'azione che ne è nata → mostriamo "vai all'azione". (origine → id azione)
  const [azPerOrigine, setAzPerOrigine] = useState<Record<string, string>>({});
  const [mostraArchivioLezioni, setMostraArchivioLezioni] = useState(false);
  // AR-476 — il verdetto organo per organo della visita. Viveva in salute.json e in un referto
  // markdown: nessuna rotta lo serviva, quindi in Cabina si vedeva solo il voto sintetico.
  const [organi, setOrgani] = useState<SaluteOrgani | null>(null);

  // Il conto tiene i ⚪ SEPARATI dai verdi: sommarli farebbe sembrare piena una copertura bucata.
  type SaluteOrgani = {
    collegato?: boolean;
    messaggio?: string;
    aggiornato?: string | null;
    conto?: { verdi: number; rossi: number; nonVisti: number; totale: number; copertura: number };
    organi?: { organo: string; verdi: number; rossi: number; nonVisti: number; daGuardare: { titolo?: string; detto?: string; esito?: string }[] }[];
  };

  const carica = useCallback(() => {
    fetch("/api/memoria/auto-coscienza", { cache: "no-store" }).then((r) => r.json()).then(setD).catch(() => {});
    // Niente `.catch(() => {})`: se la lettura fallisce la sezione sparirebbe, e una sezione che
    // sparisce si legge come «nessun organo rotto». Il fallimento si DICE (AR-256, errore-ingoiato).
    fetch("/api/memoria/salute-organi", { cache: "no-store" })
      .then((r) => r.json())
      .then(setOrgani)
      .catch((e) => setOrgani({ collegato: false, messaggio: `non ho potuto leggere il referto degli organi (${String(e?.message || e)})` }));
    fetch("/api/memoria/risposta", { cache: "no-store" }).then((r) => r.json()).then((x) => {
      if (!x?.risposte) return;
      // AR-238: si fondono le locali sopra quelle del server; quando il server concorda, la copia
      // locale ha finito il suo lavoro e si dimentica (altrimenti coprirebbe per sempre un errore).
      const { fusa, daDimenticare } = fondiLocaliSuServer<Salvata>(
        x.risposte,
        risposteLocaliRef.current,
        (a, b) => a?.risposta === b?.risposta,
      );
      for (const qid of daDimenticare) risposteLocaliRef.current.delete(qid);
      setRisposte(fusa);
    }).catch(() => {});
    fetch("/api/azioni-pronte", { cache: "no-store" }).then((r) => r.json()).then((x) => {
      const m: Record<string, string> = {};
      for (const a of x?.azioni || []) if (a?.origine && !a.stato) m[String(a.origine)] = String(a.id);
      setAzPerOrigine(m);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    carica();
    const id = setInterval(carica, 30_000);
    return () => clearInterval(id);
  }, [carica]);

  usePanelSync(["radiografia", "azioni", "memoria", "all"], carica);

  // Deep-link dal banner della Plancia (#auto-coscienza): porta la card sott'occhio UNA volta.
  //
  // AR-257: la dipendenza era `[d]`. `carica()` gira ogni 30 secondi e `setD` mette sempre un
  // oggetto NUOVO (viene da `r.json()`), quindi per React la dipendenza cambiava anche a contenuto
  // identico: l'effetto ripartiva e la pagina saltava da sola sulla scheda ogni mezzo minuto, per
  // chi era arrivato da un link col vecchio hash. «Scorri quando i dati sono pronti» è vero una
  // volta sola — al montaggio — non a ogni ripasso.
  // AR-673: cercava il posto dove scorrere con `document.getElementById("auto-coscienza")`, cioè per
  // NOME, in tutta la pagina. Quel nome però la sezione ce l'ha solo mentre è aperta la scheda
  // Analisi — quando questa casella viene montata su un'altra scheda (succede: chi la monta può
  // fissargliela da fuori) il nome non c'è, la ricerca torna a mani vuote e il salto non avviene.
  // Nessun errore, nessun segnale: l'effetto gira, non trova niente e non fa niente. È il modo in
  // cui un pezzo di codice smette di funzionare senza che nessuno se ne accorga.
  //
  // Adesso la casella tiene il RIFERIMENTO al proprio riquadro. Un riferimento non può scollegarsi
  // da solo: se il riquadro è a schermo si scorre, e se non c'è non c'era niente da guardare.
  //
  // E il cancelletto non si legge più dalla barra: quando questa casella si sveglia lì non c'è già
  // più — il Pannello lo ha tradotto nel nuovo indirizzo mezzo secondo prima. Adesso si chiede a chi
  // l'ha ricevuto, che lo tiene da parte finché qualcuno lo viene a prendere (`ancoraChiesta`).
  // Il cancelletto si raccoglie al risveglio — è lì che c'è, e va preso prima che qualcun altro lo
  // consumi — ma il salto si fa quando c'è QUALCOSA DA GUARDARE. Al risveglio la casella è ancora
  // vuota e la pagina è corta: saltare lì è saltare su una pagina che non è ancora cresciuta, e
  // infatti non si muoveva niente. Quando i dati arrivano la pagina si allunga, e allora si salta.
  const chiesta = useRef(false);
  const saltoFatto = useRef(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (ancoraChiesta("auto-coscienza")) chiesta.current = true;
  }, []);
  // UNA volta sola: `saltoFatto` è il freno di AR-257 — `carica()` gira ogni 30 secondi e mette
  // sempre un oggetto nuovo, quindi senza freno la pagina salterebbe da sola ogni mezzo minuto.
  useEffect(() => {
    if (!chiesta.current || saltoFatto.current) return;
    // Si aspetta che ci sia qualcosa da guardare — con la casella ancora vuota la pagina è corta e
    // saltare non muove niente — ma non si aspetta all'infinito: se i dati non arrivano (rete giù,
    // memoria scollegata) la casella c'è lo stesso, col suo messaggio, e va portata sott'occhio
    // uguale. Senza questa seconda strada il salto dipenderebbe da una risposta che può non arrivare.
    const t = setTimeout(() => {
      saltoFatto.current = true;
      riquadroRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, d ? 120 : 1500);
    return () => clearTimeout(t);
  }, [d]);

  const a = d?.analisi;
  const live = d?.live;
  // Il voto può arrivare come numero o (per un giro che non rispetta il contratto) come frase.
  const votoF = Number(a?.voto_fiducia);
  // 🩺 Mostriamo il numerone SOLO se l'analisi è affidabile (l'API marca i gusci vuoti dei giri rotti:
  // voto 7 + sintesi vuota). Così non compare più un falso e allarmante «7/100». Default true per
  // retrocompatibilità se l'API non manda il flag.
  const analisiAffidabile = d?.analisi_affidabile !== false;
  const votoFOk = Number.isFinite(votoF) && analisiAffidabile;
  // Se il voto è una frase non numerica, mostriamola come sintesi piccola (non come numero gigante).
  const sintesiEff = a?.sintesi || (!votoFOk && typeof a?.voto_fiducia === "string" ? a!.voto_fiducia : "");
  const scelteRagionate = (d?.registro?.entita || []).filter((e) => e.stato === "scelta_ragionata");
  const daVerificare = (d?.registro?.entita || []).filter((e) => e.stato === "da_verificare");
  const ap = d?.apprendimento;
  const mi = d?.miglioramento;
  const dataApprendimento = dataVaultRecente(
    ap?.data,
    ap?.aggiornato,
    typeof ap?.meta?.tasso_calcolato_il === "string" ? ap.meta.tasso_calcolato_il : undefined,
  );
  const dataMiglioramento = dataVaultRecente(mi?.data, mi?.aggiornato, mi?.meta_esperimenti?.aggiornato);
  const cal = d?.calibrazione;
  const erroriLive = live?.gap?.length ? live.gap : a?.errori;
  const nErrori = (Array.isArray(erroriLive) ? erroriLive : []).length;
  // AR-252 — `?.length` non è una difesa: anche una stringa ha `.length`, e poi `.map` esplode in
  // pieno render portando via l'intera Cabina. Una lista sicura calcolata una volta, usata sia per
  // il conteggio che per il disegno: così le due letture non possono più divergere.
  const domande = listaSicura<Domanda | string>(a?.domande_per_nicola);
  const nDomande = domande.length;
  const tutteLezioni = ap?.lezioni || [];
  const lezioniRecenti = tutteLezioni.filter((l) => lezioneRecente(l));
  const lezioniVis = mostraArchivioLezioni ? tutteLezioni : lezioniRecenti;
  const nLezioniArchivio = Math.max(0, tutteLezioni.length - lezioniRecenti.length);

  const TABS: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "analisi", label: "Auto-analisi", icon: <Microscope size={15} />, badge: nErrori },
    { id: "apprendimento", label: "Apprendimento", icon: <GraduationCap size={15} />, badge: lezioniRecenti.length || undefined },
    { id: "miglioramento", label: "Auto-miglioramento", icon: <Rocket size={15} />, badge: mi?.benchmark?.length || 0 },
  ];

  const titoloSezione =
    tab === "apprendimento" ? "🎓 Apprendimento" : tab === "miglioramento" ? "🚀 Auto-miglioramento" : "🔬 Auto-analisi";
  // AR-254 — quando l'archivio non si è potuto leggere, il sottotitolo lo DICE. Prima la scheda
  // restava semplicemente vuota: 1.111.673 caratteri contro un tetto di 1.000.000, il file veniva
  // troncato a metà stringa, JSON.parse falliva, e nessuno sapeva perché. Una scheda vuota senza
  // spiegazione è indistinguibile da «non ho ancora imparato niente».
  const apprNonLeggibile = d?.apprendimento_non_leggibile || "";
  const sottotitoloSezione =
    tab === "apprendimento"
      ? apprNonLeggibile
        ? `⚠️ Archivio non leggibile — ${apprNonLeggibile}`
        : "Lezioni imparate e calibrazione."
      : tab === "miglioramento"
        ? "Confronto coi migliori, esperimenti e peer review."
        : "Si controlla prima di consegnare — errori, domande, entità.";

  return (
    <section ref={riquadroRef} data-test="riquadro-auto-coscienza" id={tab === "analisi" ? "auto-coscienza" : undefined} className="card p-4 border-brand/20 scroll-mt-24">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="sez-ico"><Microscope size={16} /></span>
          <div className="min-w-0">
            <span className="t-sez">{titoloSezione}</span>
            <div className="t-eti">{sottotitoloSezione}{" "}
              {tab === "analisi" && live?.sensori_aggiornato
                ? `· sensori ${dataVault(live.sensori_aggiornato)}${a?.data ? ` · analisi ${dataVault(a.data)}` : ""}`
                : a?.data && tab === "analisi"
                  ? `· ultima ${dataVault(a.data)}`
                  : dataApprendimento && tab === "apprendimento"
                    ? `· ultima ${dataVault(dataApprendimento)}`
                    : dataMiglioramento && tab === "miglioramento"
                      ? `· ultima ${dataVault(dataMiglioramento)}`
                      : ""}
            </div>
          </div>
        </div>
        {votoFOk ? (
          <div className="text-right shrink-0 max-w-[42%]">
            <div className={`text-[26px] font-bold leading-none tabular-nums ${votoColore(votoF)}`}>{votoF}<span className="text-[13px] text-black/30">/100</span></div>
            <div className="t-eti truncate">{trendBreve(a?.trend_fiducia) || (a?.trend_fiducia ? traduciTestoCompleto(String(a.trend_fiducia)).slice(0, 40) : "fiducia")}</div>
          </div>
        ) : a ? (
          <div className="text-right shrink-0 max-w-[44%]">
            <div className="text-[12px] font-medium text-amber-600 leading-tight">analisi in aggiornamento</div>
            <div className="t-eti">in attesa di un giro valido</div>
          </div>
        ) : null}
      </div>

      {!d?.collegato && (
        <p className="t-eti py-6 text-center">{d?.messaggio || "Caricamento…"}</p>
      )}

      {d?.collegato && (
        <>
          {!hideSwitcher && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-1.5 text-[12.5px] font-medium px-2.5 py-1.5 rounded-lg transition ${
                  tab === t.id ? "bg-brand text-white" : "bg-white text-black/60 ring-1 ring-black/[0.06] hover:bg-black/[0.03]"
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
                {t.badge ? <span className={`text-[10px] px-1.5 rounded-full ${tab === t.id ? "bg-white/25" : "bg-black/10"}`}>{t.badge}</span> : null}
              </button>
            ))}
          </div>
          )}

          {d?.collegato && (
            <div className="rounded-xl border border-black/[0.08] bg-paper/50 px-3 py-2.5 mb-3">
              {tab === "analisi" && (
                <p className="t-corpo text-[13px] font-semibold">
                  {votoFOk ? (votoF >= 80 ? "🟢" : votoF >= 60 ? "🟡" : "🔴") : "🟡"}{" "}
                  {votoFOk ? `${votoF}/100 fiducia` : "Analisi in aggiornamento"}
                  {nErrori > 0 ? ` · ${nErrori} errori` : ""}
                  {nDomande > 0 ? ` · ${nDomande} domande per te` : ""}
                </p>
              )}
              {tab === "apprendimento" && (
                <p className="t-corpo text-[13px] font-semibold">
                  {lezioniRecenti.length} lezioni negli ultimi 7 giorni
                  {ap?.meta?.tasso_applicazione != null ? ` · ${Math.round((ap.meta.tasso_applicazione || 0) * 100)}% citate` : ""}
                </p>
              )}
              {tab === "miglioramento" && (
                <p className="t-corpo text-[13px] font-semibold">
                  {mi?.benchmark?.length || 0} benchmark · {mi?.esperimenti?.length || 0} esperimenti
                  {(mi?.esperimenti?.length || 0) === 0 ? " · prossimo passo: misurare un esperimento" : ""}
                </p>
              )}
            </div>
          )}

          {/* ===== AUTO-ANALISI ===== */}
          {tab === "analisi" && (
            <div className="space-y-3">
              {live?.analisi_stale && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 px-3 py-2 text-[12px] text-amber-900/90">
                  <b>Testo e voto = ultimo giro</b>
                  {live.analisi_data ? ` (${dataVault(live.analisi_data)}` : ""}
                  {live.analisi_ore_fa != null ? `, ${live.analisi_ore_fa}h fa` : ""}
                  {live.analisi_data ? ")" : ""}.
                  {" "}Sensori, salute e avvisi sotto si aggiornano da soli ogni 30 secondi
                  {live.sensori_aggiornato ? ` (ultimo controllo ${dataVault(live.sensori_aggiornato)})` : ""}.
                  Per rifare tutta l&apos;analisi testuale: «fai un giro».
                </div>
              )}

              {sintesiEff && <TestoUmano testo={sintesiEff} className="t-corpo break-words whitespace-pre-wrap [overflow-wrap:anywhere]" />}

              {/* Le 5 verifiche a colpo d'occhio */}
              {a?.verifiche && (
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(a.verifiche).map(([k, v]) => {
                    const ok = v === "ok";
                    return (
                      <span key={k} className={`inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg ring-1 ${ok ? "bg-green-50 text-green-700 ring-green-200" : "bg-red-50 text-red-700 ring-red-200"}`}>
                        {ok ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />} {VERIFICA_LABEL[k] || k}
                      </span>
                    );
                  })}
                </div>
              )}

              {/* 🧠 Scelte ragionate: entità che la macchina ha scelto DA SOLA con prove (legittime, non inventate) */}
              {scelteRagionate.length > 0 && (
                <div>
                  <div className="t-micro mb-1.5 flex items-center gap-1.5"><CheckCircle2 size={13} /> Scelte ragionate della macchina ({scelteRagionate.length})</div>
                  <div className="space-y-2">
                    {scelteRagionate.map((e, i) => (
                      <CasellaAnteprima
                        key={i}
                        className="rounded-lg border border-green-200 bg-green-50/50"
                        titolo={e.nome}
                        meta={
                          <>
                            {e.tipo && <span className="text-[10px] px-1.5 rounded bg-black/5 text-black/50">{e.tipo}</span>}
                            <span className="text-[10px] px-1.5 rounded bg-green-100 text-green-700">{statoEntita(e.stato || "scelta_ragionata")}</span>
                            {e.confidenza != null && <span className="t-eti">confidenza {Math.round((e.confidenza || 0) * 100)}%</span>}
                          </>
                        }
                        anteprima={anteprimaTesto(e.fonte_ragionamento, e.evidenze?.[0])}
                      >
                        {e.evidenze && e.evidenze.length > 0 && (
                          <ul className="space-y-1">
                            {e.evidenze.map((ev, j) => (
                              <li key={j} className="flex gap-1.5">
                                <span className="text-green-600 shrink-0">✓</span>
                                <TestoUmano testo={ev} className="text-[12px] text-black/70" />
                              </li>
                            ))}
                          </ul>
                        )}
                        {e.fonte_ragionamento && (
                          <div>
                            <div className="text-[11px] font-semibold text-black/50 uppercase tracking-wide">Perché questa scelta</div>
                            <TestoUmano testo={e.fonte_ragionamento} className="text-[12px] text-black/65 mt-0.5" />
                          </div>
                        )}
                        {e.note && (
                          <div>
                            <div className="text-[11px] font-semibold text-black/50 uppercase tracking-wide">Note</div>
                            <TestoUmano testo={e.note} className="text-[12px] text-black/60 mt-0.5" />
                          </div>
                        )}
                        <ParlaCasella idCasella={`entita:${e.nome}`} titolo={`Scelta ragionata: ${e.nome}`} contesto={[e.fonte_ragionamento && `Perché: ${e.fonte_ragionamento}`, ...(e.evidenze || []), e.note].filter(Boolean).join(" · ")} />
                      </CasellaAnteprima>
                    ))}
                  </div>
                </div>
              )}

              {/* 🚩 Entità senza fondamento: il vero «inventato» → bloccate finché non chiarisci */}
              {daVerificare.length > 0 && (
                <div>
                  <div className="t-micro mb-1.5 flex items-center gap-1.5"><ShieldAlert size={13} /> Entità senza fondamento — bloccate ({daVerificare.length})</div>
                  <div className="space-y-2">
                    {daVerificare.map((e, i) => {
                      const domE = e.domanda_per_nicola || `${e.nome}: è reale o lo scarto?`;
                      // 🔑 id stabile: usa quello esplicito del giro (così il tag {origine:entita:<id>} combacia
                      // ESATTAMENTE), altrimenti ricavalo dal testo (link generico ok, puntuale solo con id).
                      const idE = e.id || qidDa(`entita:${e.nome}:${domE}`);
                      return (
                        <div id={`entita-${idE}`} key={i} className="rounded-xl border border-red-200 bg-red-50/60 p-3 scroll-mt-24">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-medium">{e.nome}</span>
                            {e.tipo && <span className="text-[10px] px-1.5 rounded bg-black/5 text-black/50">{e.tipo}</span>}
                            {e.confidenza != null && <span className="t-eti ml-auto">confidenza {Math.round((e.confidenza || 0) * 100)}%</span>}
                          </div>
                          {e.note && (
                            <div className="mt-1">
                              <TestoUmano testo={e.note} className="text-[12px] text-black/65" />
                            </div>
                          )}
                          {e.domanda_per_nicola && (
                            <div className="mt-1.5">
                              <div className="text-[12px] font-medium text-brand">❓ Domanda per te</div>
                              <TestoUmano testo={e.domanda_per_nicola} className="text-[12px] text-black/75 mt-0.5" />
                            </div>
                          )}
                          <RispostaBox qid={idE} domanda={domE} salvata={risposte[idE]} onSalvata={onSalvata} />
                          {azPerOrigine[`entita:${idE}`] && (
                            <button onClick={() => vaiArea("azioni", `azione-${azPerOrigine[`entita:${idE}`]}`, "approvare")} className="mt-2 inline-flex items-center gap-1 t-eti hover:text-brand transition">
                              <ArrowRight size={12} /> Vai all'azione collegata
                            </button>
                          )}
                          <ParlaCasella idCasella={`entita:${idE}`} titolo={`Entità: ${e.nome}`} contesto={[e.note, e.domanda_per_nicola].filter(Boolean).join(" · ")} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Salute della macchina — live dai sensori quando disponibili */}
              {(live?.salute_macchina || a?.salute_macchina) && (
                <div className="flex flex-wrap gap-1.5">
                  {(() => {
                    const sm = live?.salute_macchina || a!.salute_macchina!;
                    return [
                      { k: "Database", raw: sm.supabase, okKey: "supabase" },
                      { k: "Pagamenti", raw: sm.stripe, okKey: "stripe" },
                      { k: "Dati freschi", raw: sm.dati_freschi, okKey: "dati freschi" },
                      { k: "Sensori attivi", raw: sm.sensori_attivi ?? 0, okKey: "sensori" },
                      // Il quinto tile (10/8): il giro misurava il sito dei negozi da giorni e qui
                      // non compariva, quindi «il sito non risponde dal 30 luglio» non arrivava mai
                      // a questa schermata. Il contratto in cervello/valida-contratti.mjs ammette
                      // questa chiave insieme a questa riga: i due elenchi si muovono insieme.
                      { k: "Sito negozi", raw: sm.sito_uptime, okKey: "sito" },
                    ].map((s) => {
                      const { label, ok } = saluteValore(s.okKey, s.raw);
                      return (
                      <span key={s.k} className={`inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg ring-1 ${ok ? "bg-green-50 text-green-700 ring-green-200" : "bg-red-50 text-red-700 ring-red-200"}`}>
                        <Activity size={11} /> {s.k}: <b>{label}</b>
                        {live?.salute_macchina ? " · live" : ""}
                      </span>
                    );});
                  })()}
                </div>
              )}

              {/* 🫀 I cinque organi — AR-476. Il verdetto della visita, per organo.
                  ⚪ non è mai un verde: i non visti hanno la loro casella e la copertura si dichiara. */}
              {organi && !organi.collegato && (
                <div className="t-eti flex items-center gap-1.5 text-slate-500">
                  <Activity size={12} /> Organi: ⚪ {organi.messaggio || "referto non disponibile"} — non è un verde.
                </div>
              )}

              {organi?.collegato && (organi.conto?.totale || 0) > 0 && (
                <div>
                  <div className="t-micro mb-1.5 flex items-center gap-1.5">
                    <Activity size={13} /> Gli organi ({organi.conto!.rossi} rotti · {organi.conto!.nonVisti} non visti · {organi.conto!.verdi} provati)
                    <span className="t-eti">· copertura {organi.conto!.copertura}%{organi.aggiornato ? ` · ${dataVault(organi.aggiornato)}` : ""}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(organi.organi || []).map((o) => (
                      <span
                        key={o.organo}
                        title={o.daGuardare.map((v) => `${v.esito === "rotto" ? "❌" : "⚪"} ${v.titolo || ""}: ${v.detto || ""}`).join("\n") || "tutto provato"}
                        className={`inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg ring-1 ${
                          o.rossi > 0
                            ? "bg-red-50 text-red-700 ring-red-200"
                            : o.nonVisti > 0
                              ? "bg-slate-50 text-slate-600 ring-slate-200"
                              : "bg-green-50 text-green-700 ring-green-200"
                        }`}
                      >
                        {o.organo}: <b>{o.rossi > 0 ? `${o.rossi} rotti` : o.nonVisti > 0 ? `${o.nonVisti} non visti` : "provato"}</b>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Errori / gap — preferisci messaggi live dai sensori */}
              {nErrori > 0 && (
                <div>
                  <div className="t-micro mb-1.5 flex items-center gap-1.5"><ShieldAlert size={13} /> Errori trovati ({nErrori}){live?.gap?.length ? " · live" : ""}</div>
                  <div className="space-y-2">
                    {(Array.isArray(erroriLive) ? erroriLive : []).map((e, i) => {
                      const err: Errore = typeof e === "string" ? { titolo: e } : (e || {});
                      const g = GRAV[err.gravita || "bassa"] || GRAV.bassa;
                      const umano = humanizzaErrore(err);
                      return (
                        <div key={i} className={`rounded-xl border p-3 ${g.cls}`}>
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${g.dot}`} />
                            <span className="text-[10px] font-bold tracking-wide text-black/50">{g.label}</span>
                            {err.livello_scoperta && <span className="text-[10px] px-1.5 rounded bg-black/5 text-black/45">scoperto al livello {err.livello_scoperta}</span>}
                          </div>
                          <div className="text-[13px] font-medium mt-1 break-words [overflow-wrap:anywhere]">{umano.titolo}</div>
                          {umano.cosaSuccede && umano.cosaSuccede !== umano.titolo && (
                            <div className="text-[12px] text-black/65 mt-0.5 break-words [overflow-wrap:anywhere]">{umano.cosaSuccede}</div>
                          )}
                          {err.riguarda && (
                            <div className="mt-1">
                              <div className="text-[11px] font-semibold text-black/50">Riguarda</div>
                              <TestoUmano testo={err.riguarda} className="text-[12px] text-black/60 mt-0.5" />
                            </div>
                          )}
                          {err.azione_presa && (
                            <div className="text-[12px] text-black/60 mt-1">
                              <b>Azione già presa:</b> {traduciTestoCompleto(err.azione_presa)}
                            </div>
                          )}
                          {umano.tecnici && (
                            <details className="mt-2 group">
                              <summary className={classeComandoSommario("text-[11px] font-medium text-black/45 cursor-pointer select-none hover:text-brand list-none flex items-center gap-1")}>
                                <span className="group-open:rotate-90 transition-transform inline-block">▸</span> Dettagli tecnici
                              </summary>
                              <div className="text-[11px] text-black/50 mt-1.5 whitespace-pre-wrap break-words font-mono leading-relaxed">{umano.tecnici}</div>
                            </details>
                          )}
                          <ParlaCasella idCasella={`errore:${err.riguarda || umano.titolo}`} titolo={`Errore: ${umano.titolo}`} contesto={[umano.cosaSuccede, err.riguarda && `Riguarda: ${err.riguarda}`].filter(Boolean).join(" · ")} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Domande per Nicola */}
              {nDomande > 0 && (
                <div>
                  <div className="t-micro mb-1.5 flex items-center gap-1.5"><HelpCircle size={13} /> Domande per te ({nDomande})</div>
                  <div className="space-y-2">
                    {domande.map((q, i) => {
                      const testo = (typeof q === "string" ? q : q?.domanda) || "";
                      const perche = typeof q === "string" ? "" : q?.perche_serve;
                      const seRisp = typeof q === "string" ? "" : q?.se_rispondi;
                      // id stabile: quello dato dal giro se c'è (combacia col tag origine delle azioni), altrimenti dall'hash del testo.
                      const id = (typeof q !== "string" && q?.id) ? q.id : qidDa(testo || `domanda-${i}`);
                      const azId = azPerOrigine[`domanda:${id}`];
                      return (
                        <div id={`domanda-${id}`} key={i} className="rounded-xl border border-brand/20 bg-brand-50/30 p-3 scroll-mt-24">
                          <div className="text-[13px] font-medium break-words">❓ Domanda</div>
                          <TestoUmano testo={testo} className="text-[13px] font-medium mt-0.5" />
                          {perche && (
                            <div className="mt-1.5">
                              <div className="text-[12px] font-semibold text-black/70">Perché serve</div>
                              <TestoUmano testo={perche} className="text-[12px] text-black/65 mt-0.5" />
                            </div>
                          )}
                          {seRisp && (
                            <div className="mt-1.5">
                              <div className="text-[12px] font-semibold text-black/70">Se rispondi</div>
                              <TestoUmano testo={seRisp} className="text-[12px] text-black/65 mt-0.5" />
                            </div>
                          )}
                          <RispostaBox qid={id} domanda={testo} salvata={risposte[id]} onSalvata={onSalvata} />
                          {azId ? (
                            <button onClick={() => vaiArea("azioni", `azione-${azId}`, "approvare")} className="mt-2 inline-flex items-center gap-1 t-eti hover:text-brand transition">
                              <ArrowRight size={12} /> Vai all'azione collegata
                            </button>
                          ) : (
                            <button onClick={() => vaiArea("azioni", undefined, "approvare")} className="mt-2 inline-flex items-center gap-1 t-eti hover:text-brand transition">
                              <ArrowRight size={12} /> Vai alle Azioni da firmare
                            </button>
                          )}
                          <ParlaCasella idCasella={`domanda:${id}`} titolo={`Domanda: ${testo.slice(0, 60)}`} contesto={[testo, perche && `Perché serve: ${perche}`].filter(Boolean).join(" · ")} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Punti ciechi */}
              {a?.punti_ciechi && a.punti_ciechi.length > 0 && (
                <div>
                  <div className="t-micro mb-1.5 flex items-center gap-1.5"><EyeOff size={13} /> Punti ciechi</div>
                  <ul className="space-y-2">
                    {a.punti_ciechi.map((p, i) => (
                      <li key={i} className="flex gap-1.5">
                        <span className="text-black/30 shrink-0">•</span>
                        <TestoUmano testo={p} className="text-[12px] text-black/65" />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* ===== APPRENDIMENTO ===== */}
          {tab === "apprendimento" && (
            <div className="space-y-3">
              {ap?.meta && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { l: "Lezioni attive", v: ap.meta.lezioni_attive },
                    { l: "Principi", v: ap.meta.promosse_a_principio },
                    { l: "Decadute", v: ap.meta.decadute },
                    { l: "Lezioni citate", v: ap.meta.tasso_applicazione != null ? `${Math.round((ap.meta.tasso_applicazione || 0) * 100)}%` : "—" },
                  ].map((m) => (
                    <div key={m.l} className="rounded-xl border border-black/[0.06] bg-paper/40 p-2.5">
                      <div className="text-[18px] font-semibold tabular-nums">{m.v ?? "—"}</div>
                      <div className="t-eti">{m.l}</div>
                    </div>
                  ))}
                </div>
              )}

              {ap?.lezioni && ap.lezioni.length > 0 && (
                <div>
                  <div className="t-micro mb-1.5 flex items-center gap-1.5"><Lightbulb size={13} /> Lezioni imparate</div>
                  {nLezioniArchivio > 0 && (
                    <button
                      type="button"
                      onClick={() => setMostraArchivioLezioni((v) => !v)}
                      className="mb-2 text-[12.5px] font-medium text-brand hover:underline"
                    >
                      {mostraArchivioLezioni ? "Mostra solo ultimi 7 giorni" : `Mostra archivio (${nLezioniArchivio} lezioni più vecchie)`}
                    </button>
                  )}
                  <div className="space-y-2">
                    {lezioniVis.map((l, i) => (
                      <div key={i} className="rounded-xl border border-black/[0.06] bg-paper/40 p-3">
                        <TestoUmano testo={l.testo} />
                        <div className="flex items-center flex-wrap gap-1.5 mt-1.5">
                          {l.stato && <span className={`text-[10px] px-1.5 rounded ${l.stato === "principio" ? "bg-green-100 text-green-700" : l.stato === "decaduta" ? "bg-black/5 text-black/40" : "bg-amber-100 text-amber-700"}`}>{statoLezione(l.stato)}</span>}
                          {l.reparto && <span className="text-[10px] px-1.5 rounded bg-black/5 text-black/50">{repartoLeggibile(l.reparto)}</span>}
                          {l.fonte && <span className="t-eti">da: {traduciTestoCompleto(l.fonte)}</span>}
                          {l.evidenze != null && <span className="t-eti">· {l.evidenze} conferme</span>}
                          <span className="ml-auto flex items-center gap-1.5">{barra(l.confidenza)}<span className="t-eti tabular-nums">{Math.round((l.confidenza ?? 0) * 100)}%</span></span>
                        </div>
                        <ParlaCasella idCasella={`lezione:${l.id || l.testo}`} titolo={`Lezione: ${(l.testo || "").slice(0, 50)}`} contesto={l.testo} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Calibrazione */}
              {cal?.per_reparto && cal.per_reparto.length > 0 && (
                <div>
                  <div className="t-micro mb-1.5 flex items-center gap-1.5"><Target size={13} /> Calibrazione (previsto vs reale)</div>
                  <div className="space-y-1.5">
                    {cal.per_reparto.map((r, i) => (
                      <div key={i} className="rounded-lg border border-black/[0.05] bg-paper/30 px-2.5 py-2">
                        <div className="flex items-center gap-2 text-[12px] flex-wrap">
                          <span className="font-medium">{repartoLeggibile(r.reparto)}</span>
                          <span className="t-eti">{r.azzeccate}/{r.previsioni} previsioni azzeccate</span>
                          <span className="ml-auto flex items-center gap-1.5">{barra(r.punteggio)}<span className="t-eti">{autonomiaLeggibile(r.autonomia)}</span></span>
                        </div>
                        {r.nota && <TestoUmano testo={r.nota} className="text-[11.5px] text-black/55 mt-1" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {ap?.preferenze_nicola && ap.preferenze_nicola.length > 0 && (
                <div>
                  <div className="t-micro mb-1.5">🎯 Cosa ho capito che vuoi</div>
                  <ul className="space-y-2">
                    {ap.preferenze_nicola.map((p, i) => (
                      <li key={i} className="flex gap-1.5">
                        <span className="text-black/30 shrink-0">•</span>
                        <TestoUmano testo={p} className="text-[12px] text-black/65" />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* ===== AUTO-MIGLIORAMENTO ===== */}
          {tab === "miglioramento" && (
            <div className="space-y-3">
              {mi?.benchmark && mi.benchmark.length > 0 && (
                <div>
                  <div className="t-micro mb-1.5 flex items-center gap-1.5"><Swords size={13} /> Confronto coi migliori</div>
                  <div className="space-y-2">
                    {mi.benchmark.map((b, i) => {
                      const titolo = repartoLeggibile(b.reparto || b.ambito) || "Confronto";
                      const ultimoProgresso = b.progresso?.length ? b.progresso[b.progresso.length - 1] : undefined;
                      const contesto = contestoBenchmark(b);
                      return (
                      <CasellaAnteprima
                        key={i}
                        titolo={titolo}
                        meta={
                          <>
                            {b.livello_attuale_L != null && <span className="text-[10px] px-1.5 rounded bg-black/5 text-black/50">livello {b.livello_attuale_L}</span>}
                            {b.divario && <span className={`text-[10px] px-1.5 rounded ${b.divario === "alto" ? "bg-red-100 text-red-700" : b.divario === "medio" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>{divarioLeggibile(b.divario)}</span>}
                            {ultimoProgresso?.punteggio != null && <span className="t-eti">{ultimoProgresso.punteggio}/100</span>}
                          </>
                        }
                        anteprima={anteprimaTesto(b.obiettivo, b.nostro)}
                      >
                        {b.obiettivo && (
                          <div className="mt-1.5">
                            <div className="text-[12px] font-semibold text-black/70">Obiettivo</div>
                            <TestoUmano testo={b.obiettivo} className="text-[12px] text-black/65 mt-0.5" />
                          </div>
                        )}
                        {b.nostro && (
                          <div className="mt-1.5">
                            <div className="text-[12px] font-semibold text-black/70">Dove siamo noi</div>
                            <TestoUmano testo={b.nostro} className="text-[12px] text-black/65 mt-0.5" />
                          </div>
                        )}
                        {b.cosa_ci_manca && (
                          <div className="mt-1.5">
                            <div className="text-[12px] font-semibold text-black/70">Cosa ci manca</div>
                            <TestoUmano testo={b.cosa_ci_manca} className="text-[12px] text-black/65 mt-0.5" />
                          </div>
                        )}
                        {ultimoProgresso?.punteggio != null && (
                          <div className="mt-1.5">
                            <div className="text-[12px] font-semibold text-black/70">Ultimo punteggio: {ultimoProgresso.punteggio}/100</div>
                            {ultimoProgresso.nota && <TestoUmano testo={ultimoProgresso.nota} className="text-[12px] text-black/55 mt-0.5" />}
                          </div>
                        )}
                        {b.migliori && b.migliori.length > 0 && (
                          <div className="mt-2 space-y-2">
                            <div className="text-[11px] font-semibold text-black/50 uppercase tracking-wide">Chi fa meglio</div>
                            {b.migliori.map((m, j) => (
                              <div key={j}>
                                <div className="text-[12px] font-medium">↗ {m.chi}{m.livello ? ` (${m.livello})` : ""}</div>
                                {m.cosa_fa && <TestoUmano testo={m.cosa_fa} className="text-[11.5px] text-black/55 mt-0.5 pl-3" />}
                                {m.esempi?.map((e, k) => (
                                  <div key={k} className="pl-3 mt-0.5">
                                    <TestoUmano testo={e.cosa} className="text-[11.5px] text-black/50" />
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        )}
                        <ParlaCasella idCasella={`confronto:${titolo}`} titolo={`Confronto: ${titolo}`} contesto={contesto} />
                      </CasellaAnteprima>
                    );})}
                  </div>
                </div>
              )}

              {mi?.esperimenti && mi.esperimenti.length > 0 && (
                <div>
                  <div className="t-micro mb-1.5 flex items-center gap-1.5"><CheckCircle2 size={13} /> Esperimenti di miglioria</div>
                  <div className="space-y-2">
                    {mi.esperimenti.map((e, i) => (
                      <CasellaAnteprima
                        key={i}
                        titolo={e.ipotesi || "Esperimento"}
                        meta={
                          <>
                            {e.reparto_guida && <span className="text-[10px] px-1.5 rounded bg-black/5 text-black/50">{repartoLeggibile(e.reparto_guida)}</span>}
                            {e.stato && <span className="text-[10px] px-1.5 rounded bg-black/10 text-black/55">{traduciTestoCompleto(e.stato)}</span>}
                          </>
                        }
                        anteprima={anteprimaTesto(e.esito)}
                      >
                        <div className="text-[12px] font-semibold text-black/70">Ipotesi da testare</div>
                        <TestoUmano testo={e.ipotesi} className="text-[12.5px] font-medium mt-0.5" />
                        {e.esito && (
                          <div>
                            <div className="text-[12px] font-semibold text-black/70">Esito</div>
                            <TestoUmano testo={e.esito} className="text-[12px] text-black/60 mt-0.5" />
                          </div>
                        )}
                        <ParlaCasella idCasella={`esperimento:${e.id || e.ipotesi}`} titolo={`Esperimento: ${(e.ipotesi || "").slice(0, 50)}`} contesto={[e.ipotesi, e.esito].filter(Boolean).join(" · ")} />
                      </CasellaAnteprima>
                    ))}
                  </div>
                </div>
              )}

              {mi?.peer_review && mi.peer_review.length > 0 && (
                <div>
                  <div className="t-micro mb-1.5">🤝 I senior si migliorano a vicenda</div>
                  <div className="space-y-2">
                    {mi.peer_review.map((p, i) => {
                      const autoreDisplay = p.reviewer || p.autore;
                      const revistiDisplay = p.reviewed || (p.revisori ? p.revisori.join(", ") : undefined);
                      return (
                        <CasellaAnteprima
                          key={i}
                          titolo={traduciTestoCompleto(p.lavoro || "")}
                          meta={
                            <>
                              {autoreDisplay && <span className="t-eti">da {repartoLeggibile(autoreDisplay) || autoreDisplay}</span>}
                              {revistiDisplay && <span className="t-eti">su {revistiDisplay}</span>}
                              {p.voto != null && <span className="text-[11px] font-bold text-brand">{p.voto}/10</span>}
                            </>
                          }
                          anteprima={anteprimaTesto(p.raccomandazione, p.punti_forza?.[0])}
                        >
                          {p.punti_forza && p.punti_forza.length > 0 && (
                            <div className="mt-1.5">
                              <div className="text-[11px] font-semibold text-green-700">Punti di forza</div>
                              <ul className="mt-0.5 space-y-0.5">
                                {p.punti_forza.map((pf, j) => <li key={j} className="text-[11.5px] text-green-700/90">• {pf}</li>)}
                              </ul>
                            </div>
                          )}
                          {p.punti_deboli && p.punti_deboli.length > 0 && (
                            <div className="mt-1.5">
                              <div className="text-[11px] font-semibold text-red-600/70">Da migliorare</div>
                              <ul className="mt-0.5 space-y-0.5">
                                {p.punti_deboli.map((pd, j) => <li key={j} className="text-[11.5px] text-red-600/80">• {pd}</li>)}
                              </ul>
                            </div>
                          )}
                          {p.raccomandazione && (
                            <div className="mt-1.5">
                              <div className="text-[11px] font-semibold text-black/60">Raccomandazione</div>
                              <TestoUmano testo={p.raccomandazione} className="text-[11.5px] text-black/65 mt-0.5" />
                            </div>
                          )}
                          {p.guadagno && (
                            <div className="mt-1.5">
                              <div className="text-[12px] text-green-700 font-medium">Miglioramento</div>
                              <TestoUmano testo={p.guadagno} className="text-[12px] text-green-700/90 mt-0.5" />
                            </div>
                          )}
                          {p.prima && (
                            <div className="mt-1.5">
                              <div className="text-[11px] font-semibold text-black/50">Prima</div>
                              <TestoUmano testo={p.prima} className="text-[11.5px] text-black/55 mt-0.5" />
                            </div>
                          )}
                          {p.dopo && (
                            <div className="mt-1.5">
                              <div className="text-[11px] font-semibold text-black/50">Dopo</div>
                              <TestoUmano testo={p.dopo} className="text-[11.5px] text-black/55 mt-0.5" />
                            </div>
                          )}
                          <ParlaCasella idCasella={`revisione:${p.lavoro}`} titolo={`Revisione: ${p.lavoro}`} contesto={[p.lavoro, p.raccomandazione || p.guadagno].filter(Boolean).join(" · ")} />
                        </CasellaAnteprima>
                      );
                    })}
                  </div>
                </div>
              )}

              {mi?.proposte_auto_riscrittura && mi.proposte_auto_riscrittura.length > 0 && (
                <div>
                  <div className="t-micro mb-1.5 flex items-center gap-1.5"><AlertTriangle size={13} /> Proposte di auto-riscrittura (🟡 da validare)</div>
                  <div className="space-y-2">
                    {mi.proposte_auto_riscrittura.filter(p => p.stato !== "implementata").map((p, i) => (
                      <CasellaAnteprima
                        key={i}
                        className="rounded-lg border border-amber-200 bg-amber-50/50"
                        titolo={p.cosa || "Proposta"}
                        anteprima={anteprimaTesto(p.perche)}
                      >
                        <div className="text-[12px] font-semibold text-amber-900/80">Cosa vorrebbe cambiare</div>
                        <TestoUmano testo={p.cosa} className="text-[12.5px] font-medium mt-0.5" />
                        {p.perche && (
                          <div>
                            <div className="text-[12px] font-semibold text-black/70">Perché</div>
                            <TestoUmano testo={p.perche} className="text-[12px] text-black/65 mt-0.5" />
                          </div>
                        )}
                        {p.dove && (
                          <div>
                            <div className="text-[12px] font-semibold text-black/70">Dove nel sistema</div>
                            <TestoUmano testo={p.dove} className="text-[12px] text-black/55 mt-0.5" />
                          </div>
                        )}
                        <ParlaCasella idCasella={`proposta:${p.cosa}`} titolo={`Proposta: ${(p.cosa || "").slice(0, 50)}`} contesto={[p.cosa, p.perche, p.dove].filter(Boolean).join(" · ")} />
                      </CasellaAnteprima>
                    ))}
                  </div>
                </div>
              )}

              {(!mi?.benchmark?.length && !mi?.esperimenti?.length && !mi?.peer_review?.length) && (
                <p className="t-eti py-4 text-center">Nessun ciclo di miglioramento ancora. Parte al primo lavoro importante (contenuti, pitch, pagine).</p>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}
