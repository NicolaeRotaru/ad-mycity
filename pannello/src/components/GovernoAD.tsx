"use client";

import { useCallback, useEffect, useState } from "react";
import { Scale, Radio, ListTree, Power, RefreshCw, Loader2, HelpCircle, Pause, Play } from "lucide-react";

type Tab = "decisioni" | "agenti" | "feed" | "controllo";

type Decisione = {
  data: string; colore: string; livello: "verde" | "giallo" | "rosso" | "?";
  reparto: string; cosa: string; perche: string; stato: string; firma: string;
};
type RigaSala = { ts: string; reparto: string; tipo: string; msg: string };
type Lavoro = { id: string; stato: string; richiesta: string; tipo: string };
type VoceFeed = { quando: string; tipo: string; titolo: string; testo: string };

function dot(l: Decisione["livello"]) {
  const c = l === "verde" ? "bg-green-500" : l === "giallo" ? "bg-amber-500" : l === "rosso" ? "bg-red-500" : "bg-black/30";
  return <span className={`inline-block w-2 h-2 rounded-full ${c}`} />;
}

function quando(s: string) {
  // "2026-06-24T15:16:00Z" o "2026-06-24 02:20" → forma breve
  return (s || "").replace("T", " ").replace(/:\d{2}(\.\d+)?Z?$/, "").slice(0, 16);
}

export default function GovernoAD() {
  const [tab, setTab] = useState<Tab>("decisioni");
  const [loading, setLoading] = useState(false);

  const [decisioni, setDecisioni] = useState<Decisione[]>([]);
  const [filtro, setFiltro] = useState<"tutte" | "verde" | "giallo" | "rosso">("tutte");
  const [spiega, setSpiega] = useState<Record<number, string>>({});
  const [spiegando, setSpiegando] = useState<number | null>(null);

  const [sala, setSala] = useState<RigaSala[]>([]);
  const [lavori, setLavori] = useState<Lavoro[]>([]);
  const [feed, setFeed] = useState<VoceFeed[]>([]);

  const [controllo, setControllo] = useState<{ collegato: boolean; pausa: boolean; tetto_spesa: string; spesa_attuale: string } | null>(null);
  const [salvando, setSalvando] = useState(false);

  const carica = useCallback(async (t: Tab) => {
    setLoading(true);
    try {
      if (t === "decisioni") {
        const d = await fetch("/api/memoria/decisioni").then((r) => r.json()).catch(() => ({ decisioni: [] }));
        setDecisioni(d.decisioni || []);
      } else if (t === "agenti") {
        const a = await fetch("/api/agenti-live").then((r) => r.json()).catch(() => ({ righe: [], lavori: [] }));
        setSala(a.righe || []);
        setLavori(a.lavori || []);
      } else if (t === "feed") {
        const f = await fetch("/api/feed").then((r) => r.json()).catch(() => ({ feed: [] }));
        setFeed(f.feed || []);
      } else if (t === "controllo") {
        const c = await fetch("/api/controllo").then((r) => r.json()).catch(() => null);
        setControllo(c);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carica(tab);
  }, [tab, carica]);

  // Polling leggero per la diretta agenti.
  useEffect(() => {
    if (tab !== "agenti") return;
    const id = setInterval(() => carica("agenti"), 8000);
    return () => clearInterval(id);
  }, [tab, carica]);

  async function spiegaPerche(i: number, d: Decisione) {
    setSpiegando(i);
    try {
      const msg = `Spiegami in 3-4 righe, in modo concreto, perché è stata presa questa decisione di MyCity: "${d.cosa}" (reparto ${d.reparto}, ${d.data}, livello ${d.colore}). Motivo annotato: "${d.perche}". Basati sul vault se serve.`;
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: msg }] }),
      }).then((x) => x.json());
      setSpiega((s) => ({ ...s, [i]: r.reply || "Nessuna spiegazione." }));
    } catch (e: any) {
      setSpiega((s) => ({ ...s, [i]: "Errore: " + e.message }));
    } finally {
      setSpiegando(null);
    }
  }

  async function impostaControllo(chiave: string, valore: string) {
    setSalvando(true);
    try {
      await fetch("/api/controllo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chiave, valore }),
      });
      await carica("controllo");
    } finally {
      setSalvando(false);
    }
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "decisioni", label: "Decisioni", icon: <Scale size={14} /> },
    { id: "agenti", label: "Diretta agenti", icon: <Radio size={14} /> },
    { id: "feed", label: "Feed attività", icon: <ListTree size={14} /> },
    { id: "controllo", label: "Controllo", icon: <Power size={14} /> },
  ];

  const decViste = decisioni.filter((d) => filtro === "tutte" || d.livello === filtro);

  return (
    <section className="bg-white rounded-2xl border border-black/[0.06] shadow-card p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="grid place-items-center w-8 h-8 rounded-lg bg-brand-50 text-brand shrink-0">
          <Scale size={16} />
        </span>
        <span className="text-[15px] font-semibold tracking-tight">Governo dell'AD</span>
        <button
          onClick={() => carica(tab)}
          disabled={loading}
          className="ml-auto inline-flex items-center gap-1.5 text-xs text-black/55 hover:text-black px-2.5 py-1.5 rounded-lg hover:bg-black/[0.04] transition disabled:opacity-50"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          Aggiorna
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-1.5 text-[13px] font-medium px-3 py-1.5 rounded-lg transition ${
              tab === t.id ? "bg-brand text-white shadow-card" : "bg-paper/60 text-black/60 hover:bg-black/[0.05]"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* DECISIONI */}
      {tab === "decisioni" && (
        <div className="space-y-2.5">
          <div className="flex gap-1.5">
            {(["tutte", "verde", "giallo", "rosso"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`text-[12px] px-2.5 py-1 rounded-lg transition ${filtro === f ? "bg-black/[0.08] font-medium" : "text-black/50 hover:bg-black/[0.04]"}`}
              >
                {f === "tutte" ? "Tutte" : f === "verde" ? "🟢" : f === "giallo" ? "🟡" : "🔴"}
              </button>
            ))}
          </div>
          {decViste.length === 0 && <p className="text-sm text-black/45 py-4 text-center">Nessuna decisione registrata.</p>}
          {decViste.map((d, i) => (
            <div key={i} className="rounded-xl border border-black/[0.07] bg-paper/40 p-3.5">
              <div className="flex items-center gap-2 flex-wrap">
                {dot(d.livello)}
                <span className="text-[11px] font-medium text-brand bg-brand-50 px-1.5 py-0.5 rounded">{d.reparto}</span>
                <span className="text-[11px] text-black/40">{d.data}</span>
                {d.stato && <span className="text-[11px] px-1.5 py-0.5 rounded bg-black/[0.05] text-black/60">{d.stato}</span>}
              </div>
              <p className="text-[13px] text-ink/90 mt-1.5 leading-snug">{d.cosa}</p>
              {d.perche && <p className="text-[11px] text-black/45 mt-1">Perché: {d.perche}</p>}
              <button
                onClick={() => spiegaPerche(i, d)}
                disabled={spiegando === i}
                className="mt-2 inline-flex items-center gap-1.5 text-[12px] text-brand hover:text-brand-dark disabled:opacity-50"
              >
                {spiegando === i ? <Loader2 size={13} className="animate-spin" /> : <HelpCircle size={13} />}
                Spiegami perché
              </button>
              {spiega[i] && <p className="text-[12px] text-ink/80 mt-2 bg-brand-50/40 rounded-lg p-2.5 whitespace-pre-wrap">{spiega[i]}</p>}
            </div>
          ))}
        </div>
      )}

      {/* DIRETTA AGENTI */}
      {tab === "agenti" && (
        <div className="space-y-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-black/40 mb-2">Lavori in corso / in coda</div>
            {lavori.length === 0 ? (
              <p className="text-[13px] text-black/45">Nessun lavoro attivo.</p>
            ) : (
              <div className="space-y-1.5">
                {lavori.map((l) => (
                  <div key={l.id} className="flex items-center gap-2 text-[13px] rounded-lg bg-paper/40 px-3 py-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${l.stato === "in_corso" ? "bg-green-500 animate-pulse" : "bg-amber-500"}`} />
                    <span className="text-black/45 text-[11px]">{l.stato}</span>
                    <span className="truncate">{l.richiesta}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-black/40 mb-2">Sala Operativa (ultimi movimenti)</div>
            {sala.length === 0 ? (
              <p className="text-[13px] text-black/45">Ancora nessun movimento di squadra.</p>
            ) : (
              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {sala.map((r, i) => (
                  <div key={i} className="text-[13px] rounded-lg bg-paper/40 px-3 py-2">
                    <span className="text-[11px] text-black/40">{quando(r.ts)}</span>{" "}
                    <span className="text-[11px] font-medium text-brand">@{r.reparto}</span>{" "}
                    <span className="text-[11px] px-1.5 rounded bg-black/[0.05] text-black/60">{r.tipo}</span>
                    <div className="text-ink/85 mt-0.5">{r.msg}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* FEED */}
      {tab === "feed" && (
        <div className="space-y-2 max-h-[28rem] overflow-y-auto pr-1">
          {feed.length === 0 && <p className="text-sm text-black/45 py-4 text-center">Nessuna attività registrata ancora.</p>}
          {feed.map((v, i) => (
            <div key={i} className="rounded-xl border border-black/[0.06] bg-paper/30 p-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wide text-brand bg-brand-50 px-1.5 py-0.5 rounded">{v.tipo}</span>
                <span className="text-[11px] text-black/40">{quando(v.quando)}</span>
              </div>
              <p className="text-[13px] text-ink/90 mt-1 font-medium leading-snug">{v.titolo}</p>
              {v.testo && <p className="text-[12px] text-black/55 mt-0.5 line-clamp-3">{v.testo}</p>}
            </div>
          ))}
        </div>
      )}

      {/* CONTROLLO */}
      {tab === "controllo" && (
        <div className="space-y-4">
          {!controllo?.collegato && (
            <p className="text-[12px] text-black/45">
              Per usare il controllo serve la memoria Supabase con la tabella <code className="bg-black/[0.05] px-1 rounded">impostazioni</code> (chiave, valore).
            </p>
          )}
          <div className="flex items-center justify-between rounded-xl border border-black/[0.07] bg-paper/40 p-4">
            <div>
              <div className="text-[14px] font-semibold flex items-center gap-2">
                {controllo?.pausa ? <Pause size={16} className="text-red-500" /> : <Play size={16} className="text-green-600" />}
                {controllo?.pausa ? "AD in PAUSA" : "AD attivo"}
              </div>
              <div className="text-[12px] text-black/45 mt-0.5">In pausa, il giro e il worker non eseguono finché non riattivi.</div>
            </div>
            <button
              onClick={() => impostaControllo("pausa", controllo?.pausa ? "off" : "on")}
              disabled={salvando || !controllo?.collegato}
              className={`inline-flex items-center gap-1.5 text-[13px] font-medium px-3.5 py-2 rounded-lg shadow-card transition disabled:opacity-50 ${
                controllo?.pausa ? "bg-green-600 text-white hover:bg-green-700" : "bg-red-500 text-white hover:bg-red-600"
              }`}
            >
              {salvando ? <Loader2 size={14} className="animate-spin" /> : controllo?.pausa ? <Play size={14} /> : <Pause size={14} />}
              {controllo?.pausa ? "Riattiva l'AD" : "Ferma l'AD"}
            </button>
          </div>
          <div className="rounded-xl border border-black/[0.07] bg-paper/40 p-4">
            <div className="text-[14px] font-semibold mb-1">Budget AI (tetto di spesa)</div>
            <div className="text-[12px] text-black/45 mb-2">Tetto mensile indicativo in €. Spesa attuale: <b>{controllo?.spesa_attuale || "—"}</b></div>
            <div className="flex gap-2">
              <input
                type="number"
                defaultValue={controllo?.tetto_spesa || ""}
                placeholder="es. 150"
                id="tetto-input"
                className="w-32 text-[13px] rounded-lg border border-black/10 px-3 py-2 outline-none focus:border-brand"
              />
              <button
                onClick={() => {
                  const v = (document.getElementById("tetto-input") as HTMLInputElement)?.value || "";
                  impostaControllo("tetto_spesa", v);
                }}
                disabled={salvando || !controllo?.collegato}
                className="text-[13px] font-medium px-3.5 py-2 rounded-lg bg-brand text-white shadow-card hover:bg-brand-dark transition disabled:opacity-50"
              >
                Salva tetto
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
