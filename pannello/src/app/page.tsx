"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Loader2,
  Wrench,
  Activity,
  TrendingUp,
  CheckCircle2,
  Package,
  Euro,
  Receipt,
  UserPlus,
  Users,
  Store,
  AlertTriangle,
  Percent,
  BarChart3,
  Eye,
  ShoppingCart,
  UserMinus,
  Trash2,
  History,
  Copy,
  FileText,
  Brain,
  Plus,
  MessagesSquare,
  Layers,
  Home,
  Mic,
  Mail,
  Target,
  Globe,
  Instagram,
  Wallet,
  MousePointer,
} from "lucide-react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import MemoriaViva from "@/components/MemoriaViva";
import GovernoAD from "@/components/GovernoAD";
import RicercaGlobale from "@/components/RicercaGlobale";
import Intelligence from "@/components/Intelligence";
import NumeriReport from "@/components/NumeriReport";

type Livello = "verde" | "giallo" | "rosso";
type Azione = { titolo: string; motivo: string; livello: Livello };
type Opportunita = {
  titolo: string;
  motivo: string;
  impatto: string;
  sforzo: string;
};
type Briefing = { situazione: string; opportunita: Opportunita[]; azioni: Azione[] };
type Msg = {
  role: "user" | "assistant";
  content: string;
  tools?: string[];
  esperto?: { nome: string; emoji: string };
  prompt?: boolean;
};
type Conversazione = {
  id: string;
  titolo: string;
  messaggi: Msg[];
  created_at: string;
  updated_at: string;
};
type DiarioVoce = {
  id: number | string;
  at: string;
  tipo: "chat" | "briefing" | "azione";
  titolo: string;
  testo: string;
};

const DIARIO_TIPO: Record<DiarioVoce["tipo"], string> = {
  chat: "💬 Chat",
  briefing: "🔭 Giro",
  azione: "⚡ Azione",
};

type Lavoro = {
  id: string;
  created_at: string;
  updated_at: string;
  stato: "in_attesa" | "in_corso" | "fatto" | "errore";
  tipo: string;
  richiesta: string;
  risultato: string;
  esperto: string;
};

const LAVORO_STATO: Record<string, { label: string; cls: string }> = {
  in_attesa: { label: "⏳ In attesa", cls: "bg-amber-50 text-amber-700 ring-amber-200" },
  in_corso: { label: "⚙️ In corso", cls: "bg-blue-50 text-blue-700 ring-blue-200" },
  fatto: { label: "✅ Fatto", cls: "bg-green-50 text-green-700 ring-green-200" },
  errore: { label: "⚠️ Errore", cls: "bg-red-50 text-red-700 ring-red-200" },
};

const TEAM = [
  { emoji: "🧠", nome: "Direzione (AD)", ruolo: "Strategia e coordinamento" },
  { emoji: "🎧", nome: "Supporto clienti", ruolo: "Clienti e reclami" },
  { emoji: "🛵", nome: "Operations", ruolo: "Ordini, rider, consegne" },
  { emoji: "📣", nome: "Marketing/Growth", ruolo: "Contenuti e acquisizione" },
  { emoji: "🤝", nome: "Vendite/Onboarding", ruolo: "Negozi" },
  { emoji: "📊", nome: "Analista", ruolo: "KPI e report" },
  { emoji: "💶", nome: "Finanza", ruolo: "Incassi e pagamenti" },
  { emoji: "🛠️", nome: "Tech", ruolo: "Analisi del sito" },
  { emoji: "🔎", nome: "Intelligence", ruolo: "Concorrenti e trend" },
];

const TOOL_LABELS: Record<string, string> = {
  web_search: "Ricerca web",
  marketplace_elenco_file: "Elenco file del sito",
  marketplace_leggi_file: "Lettura file del sito",
  dati_tabelle: "Tabelle del marketplace",
  dati_query: "Dati del marketplace",
  obsidian_cerca: "Note Obsidian",
  obsidian_leggi: "Lettura nota Obsidian",
  obsidian_scrivi: "Scrittura nota Obsidian",
};
const COLORI: Record<Livello, string> = {
  verde: "border-green-300 bg-green-50 text-green-800",
  giallo: "border-amber-300 bg-amber-50 text-amber-800",
  rosso: "border-red-300 bg-red-50 text-red-800",
};

// Il cockpit "I numeri di oggi": 30 dati Marketplace + 30 dati Marketing.
// Ogni KPI è una RIGA con tre finestre: oggi / 7 giorni / 30 giorni
// (10 KPI × 3 = 30 dati per blocco). Ogni finestra ha una "chiave" = campo di
// /api/metriche; senza chiave la cella è "—" (fonte ancora da collegare).
type Tipo = "n" | "euro" | "durata" | "stelle" | "perc";
type Kpi = {
  icon: React.ReactNode;
  label: string;
  fonte: string;
  tipo?: Tipo;
  oggi?: string; // chiave finestra "oggi"
  sett?: string; // chiave finestra "7 giorni"
  mese?: string; // chiave finestra "30 giorni"
};

// === 30 DATI MARKETPLACE — 10 KPI × (oggi/7g/30g), tutti dal DB ===
const MARKETPLACE_KPI: Kpi[] = [
  { icon: <Package size={16} />, label: "Ordini", fonte: "mycity", tipo: "n", oggi: "ordini_oggi", sett: "ordini_7g", mese: "ordini_30g" },
  { icon: <Euro size={16} />, label: "Incasso (GMV)", fonte: "mycity", tipo: "euro", oggi: "incasso_oggi", sett: "incasso_7g", mese: "incasso_30g" },
  { icon: <Receipt size={16} />, label: "Scontrino medio", fonte: "mycity", tipo: "euro", oggi: "scontrino_oggi", sett: "scontrino_7g", mese: "scontrino_30g" },
  { icon: <UserPlus size={16} />, label: "Nuovi clienti", fonte: "mycity", tipo: "n", oggi: "nuovi_clienti_oggi", sett: "nuovi_clienti_7g", mese: "nuovi_clienti_30g" },
  { icon: <Users size={16} />, label: "Clienti attivi", fonte: "mycity", tipo: "n", oggi: "clienti_attivi_oggi", sett: "clienti_attivi_7g", mese: "clienti_attivi_30g" },
  { icon: <CheckCircle2 size={16} />, label: "Consegne completate", fonte: "mycity", tipo: "n", oggi: "consegne_oggi", sett: "consegne_7g", mese: "consegne_30g" },
  { icon: <AlertTriangle size={16} />, label: "Ordini annullati", fonte: "mycity", tipo: "n", oggi: "annullati_oggi", sett: "annullati_7g", mese: "annullati_30g" },
  { icon: <ShoppingCart size={16} />, label: "Carrelli abbandonati", fonte: "mycity", tipo: "n", oggi: "carrelli_oggi", sett: "carrelli_7g", mese: "carrelli_30g" },
  { icon: <UserMinus size={16} />, label: "Carrelli recuperati", fonte: "mycity", tipo: "n", oggi: "carrelli_recuperati_oggi", sett: "carrelli_recuperati_7g", mese: "carrelli_recuperati_30g" },
  { icon: <Store size={16} />, label: "Nuovi negozi", fonte: "mycity", tipo: "n", oggi: "nuovi_negozi_oggi", sett: "nuovi_negozi_7g", mese: "nuovi_negozi_30g" },
];

// === 30 DATI MARKETING — 10 KPI × (oggi/7g/30g) ===
// Solo "Visite sito 7g" e "Conversione sito 7g" arrivano già da PostHog; il resto
// è pronto e si accende appena colleghi la fonte indicata.
const MARKETING_KPI: Kpi[] = [
  { icon: <Wallet size={16} />, label: "Spesa ads", fonte: "Meta/Google Ads", tipo: "euro" },
  { icon: <Target size={16} />, label: "ROAS", fonte: "Meta/Google Ads", tipo: "n" },
  { icon: <Receipt size={16} />, label: "CPA (costo/acquisizione)", fonte: "Meta/Google Ads", tipo: "euro" },
  { icon: <MousePointer size={16} />, label: "Click ads", fonte: "Meta/Google Ads", tipo: "n" },
  { icon: <Eye size={16} />, label: "Impression ads", fonte: "Meta/Google Ads", tipo: "n" },
  { icon: <Globe size={16} />, label: "Visite sito", fonte: "PostHog/GA4", tipo: "n", sett: "visite_7g" },
  { icon: <Users size={16} />, label: "Visitatori unici", fonte: "PostHog/GA4", tipo: "n" },
  { icon: <Percent size={16} />, label: "Conversione sito", fonte: "PostHog/GA4", tipo: "perc", sett: "conversione" },
  { icon: <Mail size={16} />, label: "Email inviate", fonte: "Resend", tipo: "n" },
  { icon: <Instagram size={16} />, label: "Nuovi follower social", fonte: "IG/Facebook", tipo: "n" },
];

// Lista piatta (KPI × finestra) per il generatore di prompt per Max.
const ALL_METRICHE: { label: string; periodo: string; chiave?: string; tipo?: Tipo }[] = [
  ...MARKETPLACE_KPI,
  ...MARKETING_KPI,
].flatMap((k) => [
  { label: k.label, periodo: "oggi", chiave: k.oggi, tipo: k.tipo },
  { label: k.label, periodo: "7 giorni", chiave: k.sett, tipo: k.tipo },
  { label: k.label, periodo: "30 giorni", chiave: k.mese, tipo: k.tipo },
]);

function formatta(v: any, tipo?: Tipo): string {
  if (v === undefined || v === null) return "—";
  if (tipo === "euro") return "€ " + Number(v).toLocaleString("it-IT", { maximumFractionDigits: 2 });
  if (tipo === "durata") {
    const min = Number(v);
    if (!min) return "—";
    return min >= 60 ? `${Math.floor(min / 60)}h ${Math.round(min % 60)}m` : `${Math.round(min)} min`;
  }
  if (tipo === "stelle") {
    const r = Number(v);
    return r > 0 ? `${r}/5` : "—";
  }
  if (tipo === "perc") return `${Number(v)}%`;
  return String(v);
}

function fa(iso: string | null): string {
  if (!iso) return "mai";
  const sec = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (sec < 90) return "poco fa";
  if (sec < 3600) return `${Math.round(sec / 60)} min fa`;
  if (sec < 86400) return `${Math.round(sec / 3600)} h fa`;
  return `${Math.round(sec / 86400)} g fa`;
}

export default function Dashboard() {
  const [vista, setVista] = useState<"oggi" | "assistente" | "storico">("oggi");
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [ultimoAt, setUltimoAt] = useState<string | null>(null);
  const [memoria, setMemoria] = useState(false);
  const [giri, setGiri] = useState(0);
  const [metriche, setMetriche] = useState<Record<string, any> | null>(null);

  const [messages, setMessages] = useState<Msg[]>([]);
  const [diario, setDiario] = useState<DiarioVoce[]>([]);
  const [lavori, setLavori] = useState<Lavoro[]>([]);
  const [conversazioni, setConversazioni] = useState<Conversazione[]>([]);
  const [convId, setConvId] = useState<string | null>(null);
  const [convServer, setConvServer] = useState(false);
  const [convSel, setConvSel] = useState<string[]>([]);
  const [base, setBase] = useState<{ titoli: string[]; testo: string } | null>(null);
  const [caricato, setCaricato] = useState(false);
  const [input, setInput] = useState("");
  const [ascoltando, setAscoltando] = useState(false);
  // Dettatura vocale (Web Speech API del browser): riempie l'input parlando.
  function dettaVoce() {
    const SR = typeof window !== "undefined" && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
    if (!SR) {
      alert("Il riconoscimento vocale non è supportato da questo browser (prova Chrome).");
      return;
    }
    const rec = new SR();
    rec.lang = "it-IT";
    rec.interimResults = false;
    rec.onresult = (e: any) => {
      const t = e.results?.[0]?.[0]?.transcript || "";
      setInput((cur) => (cur ? cur + " " : "") + t);
    };
    rec.onend = () => setAscoltando(false);
    rec.onerror = () => setAscoltando(false);
    setAscoltando(true);
    rec.start();
  }
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  function aggiungiDiario(tipo: DiarioVoce["tipo"], titolo: string, testo: string) {
    setDiario((d) => [{ id: Date.now() + Math.random(), at: new Date().toISOString(), tipo, titolo, testo }, ...d].slice(0, 200));
    // Salva anche nel database di memoria (server-side): resta dopo il refresh e su ogni dispositivo.
    fetch("/api/diario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo, titolo, testo }),
    }).catch(() => {});
  }
  // --- Conversazioni: ricordare e riprendere le chat ---
  function titoloDa(msgs: Msg[]): string {
    const u = msgs.find((m) => m.role === "user" && !m.prompt)?.content || "";
    const t = u.replace(/\s+/g, " ").trim();
    if (!t) return "Conversazione";
    return t.length > 60 ? t.slice(0, 60) + "…" : t;
  }
  function leggiConvLocali(): Conversazione[] {
    try {
      return JSON.parse(localStorage.getItem("mycity_conversazioni") || "[]");
    } catch {
      return [];
    }
  }
  function scriviConvLocali(list: Conversazione[]) {
    try {
      localStorage.setItem("mycity_conversazioni", JSON.stringify(list.slice(0, 100)));
    } catch {}
  }

  // Salva/aggiorna una conversazione (database se disponibile, altrimenti locale).
  // Non cambia la conversazione "attiva": restituisce solo l'id salvato.
  async function persistConversazione(id: string | null, msgs: Msg[]): Promise<string | null> {
    const reali = msgs.filter((m) => !m.prompt && (m.role === "user" || m.role === "assistant"));
    if (reali.length === 0) return id;
    const titolo = titoloDa(reali);
    let newId = id;
    if (convServer) {
      try {
        const res = await fetch("/api/conversazioni", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, titolo, messaggi: reali }),
        });
        const d = await res.json();
        if (d?.id) newId = d.id;
      } catch {}
    } else {
      newId = id || "loc_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    }
    if (!newId) return null;
    setConversazioni((list) => {
      const esiste = list.find((c) => c.id === newId);
      const created_at = esiste?.created_at || new Date().toISOString();
      const altri = list.filter((c) => c.id !== newId);
      const nuova: Conversazione[] = [
        { id: newId as string, titolo, messaggi: reali, created_at, updated_at: new Date().toISOString() },
        ...altri,
      ];
      if (!convServer) scriviConvLocali(nuova);
      return nuova;
    });
    return newId;
  }

  // Salva quella attuale e apre una chat nuova e vuota. NON fa partire risposte.
  async function nuovaConversazione() {
    await persistConversazione(convId, messages);
    setMessages([]);
    setConvId(null);
    setBase(null);
    setConvSel([]);
    try {
      localStorage.removeItem("mycity_chat");
      localStorage.removeItem("mycity_convid");
    } catch {}
  }

  // Riprende una conversazione esistente per continuarla. NON fa partire risposte.
  async function continuaConversazione(id: string) {
    await persistConversazione(convId, messages);
    const c = conversazioni.find((x) => x.id === id);
    if (!c) return;
    setMessages(c.messaggi);
    setConvId(c.id);
    setBase(null);
    setConvSel([]);
  }

  // Usa una o piu' conversazioni selezionate come BASE per una nuova chat: carica
  // il contesto ma NON fa partire nessuna risposta, aspetta che scrivi tu.
  async function usaComeBase() {
    if (convSel.length === 0) return;
    await persistConversazione(convId, messages);
    const scelte = conversazioni.filter((c) => convSel.includes(c.id));
    if (scelte.length === 0) return;
    const testo = scelte
      .map((c) => {
        const corpo = c.messaggi
          .filter((m) => !m.prompt)
          .map((m) => `${m.role === "user" ? "Utente" : "Assistente"}: ${m.content}`)
          .join("\n");
        return `### ${c.titolo}\n${corpo}`;
      })
      .join("\n\n")
      .slice(0, 8000);
    setBase({ titoli: scelte.map((c) => c.titolo), testo });
    setMessages([]);
    setConvId(null);
    setConvSel([]);
    try {
      localStorage.removeItem("mycity_convid");
    } catch {}
  }

  function toggleSel(id: string) {
    setConvSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  async function eliminaConversazione(id: string) {
    if (convServer) {
      fetch("/api/conversazioni", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      }).catch(() => {});
    }
    setConversazioni((list) => {
      const n = list.filter((c) => c.id !== id);
      if (!convServer) scriviConvLocali(n);
      return n;
    });
    setConvSel((s) => s.filter((x) => x !== id));
    if (convId === id) {
      setConvId(null);
      setMessages([]);
    }
  }

  function svuotaConversazioni() {
    if (convServer) {
      fetch("/api/conversazioni", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tutte: true }),
      }).catch(() => {});
    } else {
      scriviConvLocali([]);
    }
    setConversazioni([]);
    setConvSel([]);
    setConvId(null);
    setMessages([]);
  }
  function cancellaDiario() {
    setDiario([]);
    try {
      localStorage.removeItem("mycity_diario");
    } catch {}
    // Svuota anche la copia salvata nel database, altrimenti riappare al refresh.
    fetch("/api/diario", { method: "DELETE" }).catch(() => {});
  }

  // Manda un compito al "cervello" (Claude Code sul Max): lo esegue in background
  // e il risultato compare qui sotto in "Lavori del cervello". È il modo di
  // chattare SENZA usare l'API a pagamento: lavora il tuo abbonamento Max.
  async function mandaAlCervello(text?: string) {
    const t = (text ?? input).trim();
    if (!t || loading) return;
    if (text === undefined) setInput("");
    // Se hai scelto una o più conversazioni "come base", le accodo come contesto.
    const richiesta = base?.testo ? `${t}\n\n## Contesto (conversazioni scelte come base)\n${base.testo}` : t;
    setMessages((m) => [
      ...m,
      { role: "user", content: t },
      { role: "assistant", content: "🧠 Mandato al cervello (Max). La risposta compare qui sotto in «Lavori del cervello» appena è pronta." },
    ]);
    setLoading(true);
    try {
      const res = await fetch("/api/lavori", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ richiesta }),
      });
      const d = await res.json();
      if (d.ok && d.lavoro) {
        setLavori((l) => [d.lavoro, ...l]);
        aggiungiDiario("chat", "🧠 Mandato al cervello", t);
      } else {
        setMessages((m) => [...m, { role: "assistant", content: `⚠️ ${d.error || "Non sono riuscito a creare il lavoro. Serve il database di memoria collegato (tabella 'lavori')."}` }]);
      }
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "⚠️ Connessione fallita." }]);
    } finally {
      setLoading(false);
    }
  }

  function svuotaLavori() {
    setLavori([]);
    fetch("/api/lavori", { method: "DELETE" }).catch(() => {});
  }

  // Confeziona un prompt (con i dati attuali) da incollare in Claude col Max.
  // Costo API: ZERO — il lavoro pesante lo fai fare al tuo abbonamento.
  function generaPrompt(richiesta: string): string {
    const righe = metriche
      ? ALL_METRICHE.filter((x) => x.chiave && metriche[x.chiave] !== undefined && metriche[x.chiave] !== null)
          .map((x) => `- ${x.label} (${x.periodo}): ${formatta(metriche[x.chiave!], x.tipo)}`)
          .join("\n")
      : "(metriche non disponibili)";
    const brief = briefing ? `\n\n## Ultimo briefing dell'assistente\n${briefing.situazione}` : "";
    return `Sei il consulente di crescita di MyCity, il marketplace dei negozi di Piacenza.

## Dati attuali dell'azienda
${righe}${brief}

## Compito
${richiesta}

Rispondi in italiano, in modo concreto e operativo. Se ti servono dati che non vedi qui, elenca quali.`;
  }

  function dammiPrompt() {
    const t = input.trim();
    if (!t) return;
    const p = generaPrompt(t);
    setMessages((m) => [...m, { role: "user", content: t }, { role: "assistant", content: p, prompt: true }]);
    setInput("");
    aggiungiDiario("chat", "📋 Prompt per Claude Max", p);
  }

  function copia(testo: string) {
    try {
      navigator.clipboard.writeText(testo);
    } catch {}
  }

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const caricaStato = useCallback(async () => {
    try {
      const res = await fetch("/api/stato");
      const data = await res.json();
      setMemoria(Boolean(data.memoria));
      setGiri((data.giri || []).length);
      if (data.ultimo) {
        setBriefing(data.ultimo.data);
        setUltimoAt(data.ultimo.created_at);
      }
    } catch {
      /* offline */
    }
  }, []);

  // Aggiornamento automatico: ricarica l'ultima analisi del cervello-Max ogni 60s,
  // cosi' il briefing orario compare da solo (niente pulsante "Aggiorna").
  useEffect(() => {
    const id = setInterval(() => caricaStato(), 60000);
    return () => clearInterval(id);
  }, [caricaStato]);

  useEffect(() => {
    caricaStato();
    fetch("/api/metriche")
      .then((r) => r.json())
      .then((d) => {
        if (d && d.connected) setMetriche(d);
      })
      .catch(() => {});
    // Il diario salvato lato server e' la fonte durevole: se c'e', vince sul locale.
    fetch("/api/diario")
      .then((r) => r.json())
      .then((d) => {
        if (d?.memoria && Array.isArray(d.voci) && d.voci.length) {
          setDiario(
            d.voci.map((v: any) => ({ id: v.id, at: v.created_at, tipo: v.tipo, titolo: v.titolo, testo: v.testo }))
          );
        }
      })
      .catch(() => {});
  }, [caricaStato]);

  // Carica l'elenco conversazioni: dal database se la tabella esiste, altrimenti
  // dal salvataggio locale (questo dispositivo).
  useEffect(() => {
    fetch("/api/conversazioni")
      .then((r) => r.json())
      .then((d) => {
        if (d?.tabella && Array.isArray(d.conversazioni)) {
          setConvServer(true);
          setConversazioni(
            d.conversazioni.map((c: any) => ({
              id: c.id,
              titolo: c.titolo,
              messaggi: Array.isArray(c.messaggi) ? c.messaggi : [],
              created_at: c.created_at,
              updated_at: c.updated_at,
            }))
          );
        } else {
          setConvServer(false);
          setConversazioni(leggiConvLocali());
        }
      })
      .catch(() => {
        setConvServer(false);
        setConversazioni(leggiConvLocali());
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persistenza locale: chat, diario e briefing restano salvati e si ritrovano al refresh.
  useEffect(() => {
    try {
      const c = localStorage.getItem("mycity_chat");
      if (c) setMessages(JSON.parse(c));
      const d = localStorage.getItem("mycity_diario");
      if (d) setDiario(JSON.parse(d));
      const b = localStorage.getItem("mycity_briefing");
      if (b) {
        const o = JSON.parse(b);
        if (o.briefing) setBriefing(o.briefing);
        if (o.ultimoAt) setUltimoAt(o.ultimoAt);
      }
      const cid = localStorage.getItem("mycity_convid");
      if (cid) setConvId(cid);
    } catch {}
    setCaricato(true);
  }, []);

  useEffect(() => {
    if (caricato) try { localStorage.setItem("mycity_chat", JSON.stringify(messages)); } catch {}
  }, [messages, caricato]);
  useEffect(() => {
    if (caricato) try { localStorage.setItem("mycity_diario", JSON.stringify(diario)); } catch {}
  }, [diario, caricato]);
  useEffect(() => {
    if (caricato && briefing) try { localStorage.setItem("mycity_briefing", JSON.stringify({ briefing, ultimoAt })); } catch {}
  }, [briefing, ultimoAt, caricato]);
  useEffect(() => {
    if (!caricato) return;
    try {
      if (convId) localStorage.setItem("mycity_convid", convId);
      else localStorage.removeItem("mycity_convid");
    } catch {}
  }, [convId, caricato]);

  // Ponte col cervello (Max): controlla i lavori ogni 8s, cosi i risultati
  // del cervello compaiono qui appena pronti.
  useEffect(() => {
    let stop = false;
    const carica = async () => {
      try {
        const r = await fetch("/api/lavori");
        const d = await r.json();
        if (!stop && Array.isArray(d.lavori)) setLavori(d.lavori);
      } catch {}
    };
    carica();
    const id = setInterval(carica, 8000);
    return () => {
      stop = true;
      clearInterval(id);
    };
  }, []);

  async function approva(a: Azione) {
    try {
      const res = await fetch("/api/esegui", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ azione: a }),
      });
      const d = await res.json();
      if (d.collegato) {
        const esito = `${d.ok ? "✅ Eseguito" : "⚠️ Non riuscito"}: "${a.titolo}" — ${d.risultato || ""}`;
        setMessages((m) => [...m, { role: "assistant", content: esito }]);
        aggiungiDiario("azione", `Azione: ${a.titolo}`, esito);
        return;
      }
    } catch {
      /* canale non disponibile: ripiego sulla pianificazione */
    }
    // Nessun canale d'azione collegato: mando al cervello (Max) i passi da fare.
    mandaAlCervello(`Approvo: "${a.titolo}". Spiegami i passi concreti per realizzarla e cosa ti serve da me.`);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-20 border-b border-black/[0.06] bg-paper/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="grid place-items-center w-9 h-9 rounded-xl bg-brand text-white font-bold shadow-card shrink-0">
              M
            </div>
            <div className="leading-tight min-w-0">
              <h1 className="font-semibold text-[15px] tracking-tight truncate">Pannello di Controllo</h1>
              <span className="text-xs text-black/40">AD MyCity</span>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span
              className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ring-1 ${
                memoria ? "bg-green-50 text-green-700 ring-green-200" : "bg-amber-50 text-amber-700 ring-amber-200"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${memoria ? "bg-green-500 animate-pulse" : "bg-amber-500"}`} />
              {memoria ? "Vivo" : "In prova"}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-5 py-6 sm:py-8 space-y-6">
        {/* Battito */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-black/45">
          <Activity size={15} className={memoria ? "text-green-500" : "text-amber-500"} />
          {memoria ? (
            <span>Sistema vivo · ultimo giro {fa(ultimoAt)} · {giri} giri in memoria</span>
          ) : (
            <span>In prova · memoria non collegata (i giri non si salvano) · ultimo {fa(ultimoAt)}</span>
          )}
        </div>

        {/* Navigazione: 3 aree chiare invece di un muro unico */}
        {(() => {
          const SCHEDE = [
            { id: "oggi", label: "Oggi", icon: <Home size={16} />, desc: "Cosa devo decidere, i numeri di oggi e cosa ha scoperto l'AD." },
            { id: "assistente", label: "Assistente", icon: <Send size={16} />, desc: "Chiedi o dai un compito: risponde il cervello sul tuo Max, gratis." },
            { id: "storico", label: "Storico", icon: <History size={16} />, desc: "Il diario di tutto ciò che l'AD ha detto e fatto." },
          ] as const;
          const attiva = SCHEDE.find((s) => s.id === vista);
          return (
            <div>
              <div className="flex gap-1.5 sm:gap-2">
                {SCHEDE.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setVista(t.id)}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 sm:gap-2 text-sm font-medium px-2 sm:px-3 py-2.5 rounded-xl transition ${
                      vista === t.id
                        ? "bg-brand text-white shadow-card"
                        : "bg-white text-black/55 ring-1 ring-black/[0.06] hover:bg-black/[0.03]"
                    }`}
                  >
                    {t.icon}
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-black/45 mt-2 px-1">{attiva?.desc}</p>
            </div>
          );
        })()}

        {/* ===================== SCHEDA: OGGI ===================== */}
        {vista === "oggi" && (
        <div className="space-y-6">

        {/* Ricerca globale nel vault */}
        <RicercaGlobale />

        {/* Memoria viva dell'AD: da approvare · attività · stato · piani */}
        <MemoriaViva />

        {/* Briefing autonomo */}
        <section className="bg-white rounded-2xl border border-black/[0.06] shadow-card p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="grid place-items-center w-8 h-8 rounded-lg bg-brand-50 text-brand shrink-0">
              <TrendingUp size={16} />
            </span>
            <div className="min-w-0">
              <span className="text-[15px] font-semibold tracking-tight">Cosa ho scoperto e cosa propongo</span>
              <div className="text-xs text-black/40">
                L'analisi che Claude Max fa da solo ogni ora{briefing && ultimoAt ? ` · ultima ${fa(ultimoAt)}` : ""}
              </div>
            </div>
          </div>

          {!briefing && (
            <div className="text-center text-black/45 py-10">
              <p className="mb-1">Claude Max non ha ancora salvato un'analisi.</p>
              <p className="text-sm text-black/35">
                Appena fa il suo giro automatico (ogni ora), il risultato compare qui da solo.
              </p>
            </div>
          )}

          {briefing && (
            <div className="space-y-5">
              <p className="text-sm text-ink/90 leading-relaxed whitespace-pre-wrap">{briefing.situazione}</p>

              {briefing.opportunita?.length > 0 && (
                <div>
                  <div className="text-xs uppercase tracking-wide text-black/40 mb-2">Opportunità</div>
                  <div className="space-y-2">
                    {briefing.opportunita.map((o, i) => (
                      <div key={i} className="rounded-xl border border-black/[0.07] bg-paper/40 p-3.5 hover:border-brand/30 hover:bg-brand-50/40 transition">
                        <div className="text-sm font-medium">{o.titolo}</div>
                        <div className="text-sm text-black/60 mt-0.5">{o.motivo}</div>
                        <div className="text-xs text-black/40 mt-2 flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-black/5">impatto {o.impatto}</span>
                          <span className="px-1.5 py-0.5 rounded bg-black/5">sforzo {o.sforzo}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {briefing.azioni?.length > 0 && (
                <div>
                  <div className="text-xs uppercase tracking-wide text-black/40 mb-2">
                    Azioni proposte (servono la tua conferma)
                  </div>
                  <div className="space-y-2">
                    {briefing.azioni.map((a, i) => (
                      <div key={i} className={`border rounded-xl p-3.5 ${COLORI[a.livello] || ""}`}>
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold">{a.titolo}</div>
                            <div className="text-sm opacity-80 mt-0.5">{a.motivo}</div>
                          </div>
                          <button
                            onClick={() => approva(a)}
                            className="shrink-0 inline-flex items-center gap-1 text-xs font-medium bg-white/80 border border-black/10 rounded-full px-3 py-1.5 shadow-sm hover:bg-white active:scale-95 transition"
                          >
                            <CheckCircle2 size={13} /> Approva
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* I numeri (cockpit): 30 dati Marketplace + 30 dati Marketing */}
        <section className="bg-white rounded-2xl border border-black/[0.06] shadow-card p-5">
          <div className="flex items-center gap-2.5 mb-1">
            <span className="grid place-items-center w-8 h-8 rounded-lg bg-brand-50 text-brand shrink-0">
              <BarChart3 size={16} />
            </span>
            <span className="text-[15px] font-semibold tracking-tight">I numeri di oggi</span>
          </div>
          <p className="text-[12px] text-black/45 mb-5 pl-[42px]">
            Come va l'azienda adesso, in tre finestre: oggi · 7 giorni · 30 giorni. Le celle spente sono fonti ancora da collegare.
          </p>

          {/* 📦 Marketplace — 10 KPI × 3 finestre = 30 dati */}
          <TabellaNumeri
            titolo="Marketplace"
            emoji="📦"
            sottotitolo="30 dati su ordini, incassi, clienti, carrelli, consegne e negozi"
            kpis={MARKETPLACE_KPI}
            metriche={metriche}
          />

          {/* 📣 Marketing — 10 KPI × 3 finestre = 30 dati */}
          <TabellaNumeri
            titolo="Marketing"
            emoji="📣"
            sottotitolo="30 dati su pubblicità, traffico, conversione, email e social — si accendono appena colleghi le fonti"
            kpis={MARKETING_KPI}
            metriche={metriche}
            className="mt-7"
          />
        </section>

        {/* Governo dell'AD: decisioni · diretta agenti · feed · controllo */}
        <GovernoAD />

        {/* Intelligence & opportunità: alert · concorrenti · eventi · buchi */}
        <Intelligence />

        {/* Numeri & report: trend · unit economics · report */}
        <NumeriReport />

        </div>
        )}

        {/* ===================== SCHEDA: ASSISTENTE ===================== */}
        {vista === "assistente" && (
        <div className="space-y-6">

          {/* Chat */}
          <section className="flex flex-col bg-white rounded-2xl border border-black/[0.06] shadow-card overflow-hidden">
          <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-black/[0.05] gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="grid place-items-center w-8 h-8 rounded-lg bg-brand-50 text-brand shrink-0">
                <Send size={15} />
              </span>
              <div className="leading-tight min-w-0">
                <div className="text-[15px] font-semibold tracking-tight truncate">Parla con l'assistente</div>
                {convId && (
                  <div className="text-[11px] text-black/40 truncate">
                    {conversazioni.find((c) => c.id === convId)?.titolo || "Conversazione in corso"}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={nuovaConversazione}
              className="shrink-0 text-xs text-black/45 hover:text-brand inline-flex items-center gap-1 transition"
              title="Salva questa conversazione e iniziane una nuova"
            >
              <Plus size={13} /> Nuova
            </button>
          </div>
          {base && (
            <div className="px-5 py-2 bg-brand-50/70 border-b border-brand/15 text-xs text-brand flex items-center gap-2">
              <Layers size={13} className="shrink-0" />
              <span className="truncate">
                Base: {base.titoli.join(" · ")} — scrivi la tua domanda, ne terrò conto.
              </span>
              <button onClick={() => setBase(null)} className="ml-auto shrink-0 underline hover:no-underline">
                togli
              </button>
            </div>
          )}
          <div className="scroll-soft flex-1 p-5 space-y-4 overflow-y-auto min-h-[220px] max-h-[440px]">
            {messages.length === 0 && (
              <div className="pt-1">
                <p className="text-sm text-black/50 mb-3">
                  Scrivi un obiettivo o una domanda: l'AD la assegna all'esperto giusto del team.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {TEAM.map((e) => (
                    <div key={e.nome} className="flex items-start gap-2.5 text-xs border border-black/[0.07] bg-paper/40 rounded-xl px-3 py-2 hover:border-brand/30 hover:bg-brand-50/40 transition">
                      <span className="text-base leading-none mt-0.5">{e.emoji}</span>
                      <span className="leading-snug">
                        <span className="font-semibold text-ink/80">{e.nome}</span>
                        <br />
                        <span className="text-black/40">{e.ruolo}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) =>
              m.prompt ? (
                <div key={i} className="text-left">
                  <div className="text-xs text-black/45 mb-1.5 flex items-center gap-1">
                    <FileText size={12} className="text-brand" /> Prompt pronto — incollalo in Claude (claude.ai) col tuo Max: gratis
                  </div>
                  <div className="border border-brand/25 bg-brand-50/60 rounded-xl p-3.5">
                    <pre className="text-xs whitespace-pre-wrap font-sans text-ink/90 leading-relaxed">{m.content}</pre>
                    <button
                      onClick={() => copia(m.content)}
                      className="mt-2.5 inline-flex items-center gap-1 text-xs font-medium bg-brand text-white rounded-full px-3 py-1.5 hover:bg-brand-dark active:scale-95 transition"
                    >
                      <Copy size={12} /> Copia
                    </button>
                  </div>
                </div>
              ) : (
                <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                  {m.role === "assistant" && m.esperto && (
                    <div className="text-xs text-black/45 mb-1">
                      {m.esperto.emoji} {m.esperto.nome}
                    </div>
                  )}
                  {m.role === "user" ? (
                    <span className="inline-block px-4 py-2.5 rounded-2xl rounded-br-md text-sm whitespace-pre-wrap max-w-[85%] leading-relaxed bg-brand text-white shadow-card">
                      {m.content}
                    </span>
                  ) : (
                    <div className="inline-block align-top text-left px-4 py-2.5 rounded-2xl rounded-bl-md max-w-[92%] bg-black/[0.04] text-ink">
                      <Markdown>{m.content}</Markdown>
                    </div>
                  )}
                  {m.role === "assistant" && m.tools && m.tools.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-black/35 mt-1.5">
                      <Wrench size={12} />
                      {m.tools.map((t) => TOOL_LABELS[t] || t).join(" · ")}
                    </div>
                  )}
                </div>
              )
            )}
            {loading && (
              <div className="flex items-center gap-2 text-black/40 text-sm">
                <Loader2 size={16} className="animate-spin" /> Sto lavorando...
              </div>
            )}
            <div ref={endRef} />
          </div>
          <div className="border-t border-black/[0.06] p-3 space-y-2 bg-paper/30">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && mandaAlCervello()}
                placeholder="Scrivi al cervello (Max), gratis..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-black/[0.04] border border-transparent outline-none text-sm transition focus:bg-white focus:border-brand/30 focus:ring-2 focus:ring-brand/15"
              />
              <button
                onClick={dettaVoce}
                disabled={ascoltando}
                className={`px-3 rounded-xl border transition active:scale-95 ${
                  ascoltando ? "bg-red-500 text-white border-red-500 animate-pulse" : "border-black/10 text-black/55 hover:bg-black/[0.04]"
                }`}
                aria-label="Detta a voce"
                title="Detta a voce"
              >
                <Mic size={18} />
              </button>
              <button
                onClick={() => mandaAlCervello()}
                disabled={loading || !input.trim()}
                className="bg-brand text-white px-4 rounded-xl hover:bg-brand-dark active:scale-95 transition disabled:opacity-40 disabled:active:scale-100 inline-flex items-center gap-1.5"
                aria-label="Manda al cervello"
                title="Manda al cervello (Claude Code sul tuo Max): gratis, in background"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Brain size={18} />}
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={dammiPrompt}
                disabled={!input.trim()}
                className="flex-1 inline-flex items-center justify-center gap-1.5 border border-brand/40 text-brand px-3 py-1.5 rounded-xl text-xs font-medium hover:bg-brand-50 active:scale-95 transition disabled:opacity-40 disabled:active:scale-100"
                title="Crea un prompt pronto da incollare in Claude col tuo Max (gratis)"
              >
                <FileText size={14} /> Prompt (copia per Max)
              </button>
            </div>
            <p className="text-[11px] text-black/40 px-1 leading-relaxed">
              🧠 <b>Invia</b> = lo fa il cervello sul tuo Max (gratis, in background) · 📋 <b>Prompt</b> = lo copi e incolli in Claude. Niente API a pagamento.
            </p>
          </div>
          </section>

        {/* Conversazioni: ricorda e riprendi le chat precedenti */}
        <section className="bg-white rounded-2xl border border-black/[0.06] shadow-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <span className="grid place-items-center w-8 h-8 rounded-lg bg-brand-50 text-brand shrink-0">
                <MessagesSquare size={16} />
              </span>
              <span className="text-[15px] font-semibold tracking-tight">Conversazioni</span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={nuovaConversazione} className="text-xs text-black/45 hover:text-brand inline-flex items-center gap-1 transition">
                <Plus size={13} /> Nuova
              </button>
              {conversazioni.length > 0 && (
                <button onClick={svuotaConversazioni} className="text-xs text-black/40 hover:text-black/70 inline-flex items-center gap-1 transition">
                  <Trash2 size={12} /> Svuota
                </button>
              )}
            </div>
          </div>
          <p className="text-[11px] text-black/40 mb-3">
            {convServer
              ? "💾 Salvate nel database: le ritrovi anche da un altro dispositivo. Apri una conversazione per continuarla, oppure spunta una o più conversazioni e usale come base per una chat nuova."
              : "💾 Salvate su questo dispositivo. Apri una conversazione per continuarla, oppure spunta una o più conversazioni e usale come base per una chat nuova."}
          </p>

          {convSel.length > 0 && (
            <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-brand/25 bg-brand-50/50 px-3 py-2">
              <span className="text-xs text-brand font-medium">{convSel.length} selezionate</span>
              <button
                onClick={usaComeBase}
                className="inline-flex items-center gap-1.5 text-xs font-medium bg-brand text-white rounded-full px-3 py-1.5 hover:bg-brand-dark active:scale-95 transition"
              >
                <Layers size={13} /> Inizia nuova con queste come base
              </button>
              <button onClick={() => setConvSel([])} className="text-xs text-black/45 hover:text-black/70">
                annulla
              </button>
            </div>
          )}

          {conversazioni.length === 0 ? (
            <p className="text-sm text-black/40">
              Ancora nessuna conversazione. Quando scrivi nella chat qui sopra, la conversazione viene salvata qui e potrai riprenderla.
            </p>
          ) : (
            <div className="scroll-soft space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {conversazioni.map((c) => (
                <div
                  key={c.id}
                  className={`flex items-center gap-3 border rounded-xl p-3 transition ${
                    convId === c.id ? "border-brand/40 bg-brand-50/40" : "border-black/[0.07] hover:border-black/15 hover:bg-paper/40"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={convSel.includes(c.id)}
                    onChange={() => toggleSel(c.id)}
                    className="w-4 h-4 accent-brand shrink-0"
                    aria-label="Seleziona conversazione"
                  />
                  <button onClick={() => continuaConversazione(c.id)} className="flex-1 min-w-0 text-left">
                    <div className="text-sm font-medium text-ink/85 truncate">{c.titolo}</div>
                    <div className="text-[11px] text-black/40">
                      {c.messaggi.filter((m) => !m.prompt).length} messaggi · {fa(c.updated_at)}
                      {convId === c.id && " · in corso"}
                    </div>
                  </button>
                  <button
                    onClick={() => continuaConversazione(c.id)}
                    className="shrink-0 text-xs font-medium text-brand border border-brand/30 rounded-full px-3 py-1.5 hover:bg-brand-50 active:scale-95 transition"
                  >
                    Apri
                  </button>
                  <button
                    onClick={() => eliminaConversazione(c.id)}
                    className="shrink-0 text-black/30 hover:text-red-500 transition"
                    aria-label="Elimina conversazione"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Lavori del cervello: ponte con Claude Code sul Max */}
        <section className="bg-white rounded-2xl border border-black/[0.06] shadow-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <span className="grid place-items-center w-8 h-8 rounded-lg bg-brand-50 text-brand shrink-0">
                <Brain size={16} />
              </span>
              <span className="text-[15px] font-semibold tracking-tight">Lavori del cervello (Max)</span>
            </div>
            {lavori.length > 0 && (
              <button onClick={svuotaLavori} className="text-xs text-black/40 hover:text-black/70 inline-flex items-center gap-1 transition">
                <Trash2 size={12} /> Svuota
              </button>
            )}
          </div>
          <p className="text-[11px] text-black/40 mb-3">
            Compiti pesanti che esegue il cervello su Claude Code/Max, gratis. Se il cervello non è ancora acceso, restano «in attesa».
          </p>
          {lavori.length === 0 ? (
            <p className="text-sm text-black/40">
              Nessun lavoro. Scrivi un compito nella chat e premi «🧠 Manda al cervello».
            </p>
          ) : (
            <div className="scroll-soft space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {lavori.map((lv) => (
                <div key={lv.id} className="border border-black/[0.07] rounded-xl p-3.5">
                  <div className="flex items-center gap-2 text-xs mb-1.5">
                    <span className={`px-2 py-0.5 rounded-full ring-1 font-medium ${LAVORO_STATO[lv.stato]?.cls || "bg-black/5 ring-black/10 text-black/60"}`}>
                      {LAVORO_STATO[lv.stato]?.label || lv.stato}
                    </span>
                    {lv.esperto && <span className="text-black/45">{lv.esperto}</span>}
                    <span className="ml-auto text-black/40 shrink-0">{fa(lv.updated_at || lv.created_at)}</span>
                  </div>
                  <div className="text-sm font-medium text-ink/85">{lv.richiesta}</div>
                  {lv.risultato && (
                    <div className="mt-2 text-ink/85 border-t border-black/[0.06] pt-2">
                      <Markdown>{lv.risultato}</Markdown>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        </div>
        )}

        {/* ===================== SCHEDA: STORICO ===================== */}
        {vista === "storico" && (
        <div className="space-y-6">

        {/* Diario: tutto cio' che l'assistente dice e fa, salvato */}
        <section className="bg-white rounded-2xl border border-black/[0.06] shadow-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <span className="grid place-items-center w-8 h-8 rounded-lg bg-brand-50 text-brand shrink-0">
                <History size={16} />
              </span>
              <span className="text-[15px] font-semibold tracking-tight">Diario — tutto ciò che dice e fa</span>
            </div>
            {diario.length > 0 && (
              <button onClick={cancellaDiario} className="text-xs text-black/40 hover:text-black/70 inline-flex items-center gap-1 transition">
                <Trash2 size={12} /> Svuota
              </button>
            )}
          </div>
          <p className="text-[11px] text-black/40 mb-3">
            {memoria
              ? "💾 Salvato nel database: resta anche se aggiorni la pagina o cambi dispositivo."
              : "💾 Salvato su questo browser. Collega il database di memoria per ritrovarlo ovunque."}
          </p>
          {diario.length === 0 ? (
            <p className="text-sm text-black/40">
              Ancora niente. Qui resta salvato ogni messaggio della chat, ogni giro e ogni azione.
            </p>
          ) : (
            <div className="scroll-soft space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {diario.map((v) => (
                <div key={v.id} className="border border-black/[0.07] rounded-xl p-3.5 hover:border-black/10 hover:bg-paper/40 transition">
                  <div className="flex items-center gap-2 text-xs text-black/40 mb-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand font-medium shrink-0">{DIARIO_TIPO[v.tipo] || v.tipo}</span>
                    <span className="font-medium text-ink/70 truncate">{v.titolo}</span>
                    <span className="ml-auto shrink-0">{fa(v.at)}</span>
                  </div>
                  <div className="text-sm text-ink/85 whitespace-pre-wrap leading-relaxed">{v.testo}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        </div>
        )}
      </main>
    </div>
  );
}

const MD_COMPONENTS: Components = {
  p: ({ children }) => <p className="my-2">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  h1: ({ children }) => <h3 className="font-semibold text-[15px] mt-3 mb-1.5">{children}</h3>,
  h2: ({ children }) => <h3 className="font-semibold text-[15px] mt-3 mb-1.5">{children}</h3>,
  h3: ({ children }) => <h4 className="font-semibold text-sm mt-2.5 mb-1">{children}</h4>,
  h4: ({ children }) => <h4 className="font-semibold text-sm mt-2.5 mb-1">{children}</h4>,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noreferrer" className="text-brand underline break-words">
      {children}
    </a>
  ),
  code: ({ className, children }) =>
    className ? (
      <code className={className}>{children}</code>
    ) : (
      <code className="bg-black/[0.06] rounded px-1 py-0.5 text-[0.85em] font-mono">{children}</code>
    ),
  pre: ({ children }) => (
    <pre className="bg-black/[0.06] rounded-lg p-3 overflow-x-auto text-xs my-2">{children}</pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-black/15 pl-3 text-black/70 my-2">{children}</blockquote>
  ),
  hr: () => <hr className="border-black/10 my-3" />,
  table: ({ children }) => (
    <div className="overflow-x-auto my-2">
      <table className="w-full text-xs border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-black/[0.04]">{children}</thead>,
  th: ({ children }) => <th className="border border-black/10 px-2 py-1 text-left font-semibold">{children}</th>,
  td: ({ children }) => <td className="border border-black/10 px-2 py-1 align-top">{children}</td>,
};

// Mostra il testo dell'AI come Markdown formattato (grassetti, elenchi, tabelle)
// invece che come testo grezzo pieno di asterischi e barrette.
function Markdown({ children }: { children: string }) {
  return (
    <div className="text-sm leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={MD_COMPONENTS}>
        {children}
      </ReactMarkdown>
    </div>
  );
}

// Un blocco di numeri (Marketplace o Marketing) come tabella: una riga per KPI,
// tre colonne di valori (Oggi · 7 giorni · 30 giorni). Le celle senza fonte
// collegata mostrano "—".
function TabellaNumeri({
  titolo,
  emoji,
  sottotitolo,
  kpis,
  metriche,
  className = "",
}: {
  titolo: string;
  emoji: string;
  sottotitolo: string;
  kpis: Kpi[];
  metriche: Record<string, any> | null;
  className?: string;
}) {
  const cella = (chiave?: string, tipo?: Tipo) => {
    const on = Boolean(chiave && metriche && metriche[chiave] !== undefined && metriche[chiave] !== null);
    return { on, v: on ? formatta(metriche![chiave!], tipo) : "—" };
  };
  const totale = kpis.length * 3;
  const collegate = kpis.reduce(
    (s, k) => s + [k.oggi, k.sett, k.mese].filter((c) => c && metriche && metriche[c] !== undefined && metriche[c] !== null).length,
    0
  );
  return (
    <div className={className}>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-[14px] font-semibold tracking-tight">{emoji} {titolo}</span>
        <span className="text-[11px] text-black/40">{collegate}/{totale} dati collegati</span>
      </div>
      <p className="text-[11px] text-black/40 mb-3">{sottotitolo}</p>
      <div className="overflow-x-auto -mx-1 px-1">
        <table className="w-full border-separate border-spacing-y-1.5 min-w-[420px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-wide text-black/35">
              <th className="text-left font-medium py-1 pl-1">KPI</th>
              <th className="text-right font-medium py-1 px-2">Oggi</th>
              <th className="text-right font-medium py-1 px-2">7 giorni</th>
              <th className="text-right font-medium py-1 px-2 pr-1">30 giorni</th>
            </tr>
          </thead>
          <tbody>
            {kpis.map((k) => {
              const celle = [cella(k.oggi, k.tipo), cella(k.sett, k.tipo), cella(k.mese, k.tipo)];
              const acceso = celle.some((c) => c.on);
              return (
                <tr key={k.label} className="bg-paper/40 hover:bg-brand-50/30 transition">
                  <td className="rounded-l-xl border-y border-l border-black/[0.06] py-2.5 pl-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`grid place-items-center w-7 h-7 rounded-lg shrink-0 ${acceso ? "bg-brand-50 text-brand" : "bg-black/[0.04] text-black/30"}`}>
                        {k.icon}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[13px] font-medium text-ink/85 leading-tight truncate">{k.label}</span>
                        <span className="block text-[10px] uppercase tracking-wide text-black/30 leading-tight">
                          {acceso ? k.fonte : `da collegare · ${k.fonte}`}
                        </span>
                      </span>
                    </div>
                  </td>
                  {celle.map((c, i) => (
                    <td
                      key={i}
                      className={`border-y border-black/[0.06] text-right px-2 tabular-nums ${i === 2 ? "rounded-r-xl border-r pr-2.5" : ""}`}
                    >
                      <span className={`text-[15px] font-semibold tracking-tight ${c.on ? "text-ink" : "text-black/20"}`}>{c.v}</span>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
