"use client";

import { useEffect, useState } from "react";
import { PenLine, ShieldAlert, ListTodo, TrendingUp, Package, Euro, Truck, Users, Star, ShoppingCart, Clock, Footprints, Microscope, HelpCircle, Cpu, Hammer } from "lucide-react";
import { formatta, testoPulito, etichettaRitmo, ritmoEODoggi, type Tipo } from "@/lib/format";
import Aggiornato from "@/components/Aggiornato";
import CuoreMacchina from "@/components/CuoreMacchina";
import StatoMacchina from "@/components/StatoMacchina";
import Volano from "@/components/Volano";

// "Cosa conta ora": la home del pannello. A colpo d'occhio, senza aprire nulla:
// cosa devi firmare, quali allarmi sono scattati, cosa devi fare, i KPI chiave,
// e l'ultima analisi dell'AD in poche righe. Tutto da fonti reali già pronte.

type Azione = { numero: string; reparto: string; azione: string; livello: string; inAttesa: boolean };
type Alert = { livello: "rosso" | "giallo"; titolo: string };
type Todo = { id: string; testo: string; livello: string; fatto: boolean };
type Mossa = { titolo: string; priorita?: "alta" | "media" | "bassa"; colore?: string };
type AutoAnalisi = { voto_fiducia?: number | string; trend_fiducia?: string; errori?: any[]; domande_per_nicola?: any[]; sintesi?: string } | null;
type Radiografia = { voto_salute_architettura?: number | string; trend?: string; sintesi?: string } | null;
type Voce = { data: string; testo: string; oggi?: boolean } | null;

const KPI_CHIAVE: { label: string; chiave: string; tipo: Tipo; icon: React.ReactNode }[] = [
  { label: "Ordini oggi", chiave: "ordini_oggi", tipo: "n", icon: <Package size={14} /> },
  { label: "Incasso oggi", chiave: "incasso_oggi", tipo: "euro", icon: <Euro size={14} /> },
  { label: "Consegne in corso", chiave: "consegne_in_corso", tipo: "n", icon: <Truck size={14} /> },
  { label: "Clienti attivi (7g)", chiave: "clienti_attivi_7g", tipo: "n", icon: <Users size={14} /> },
  { label: "Recensione media", chiave: "recensione_media", tipo: "stelle", icon: <Star size={14} /> },
  { label: "Carrelli attivi", chiave: "carrelli", tipo: "n", icon: <ShoppingCart size={14} /> },
];

function dotCls(l: string) {
  return l === "rosso" ? "bg-red-500" : l === "giallo" ? "bg-amber-500" : l === "verde" ? "bg-green-500" : "bg-black/30";
}

export default function Plancia({
  metriche,
  briefing,
  onVaiA,
}: {
  metriche: Record<string, any> | null;
  briefing: { situazione?: string } | null;
  onVaiA?: (area: string) => void;
}) {
  const [azioni, setAzioni] = useState<Azione[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [todo, setTodo] = useState<Todo[]>([]);
  const [mosse, setMosse] = useState<Mossa[]>([]);
  const [autoAnalisi, setAutoAnalisi] = useState<AutoAnalisi>(null);
  const [radiografia, setRadiografia] = useState<Radiografia>(null);
  const [difettiAperti, setDifettiAperti] = useState<number>(0);
  const [ritmo, setRitmo] = useState<{ pianoMattino: Voce; reportSera: Voce }>({ pianoMattino: null, reportSera: null });
  const [aggAt, setAggAt] = useState<number | null>(null);

  useEffect(() => {
    // Ricarica anche a intervalli: i dati arrivano dal vault (giro) e cambiano mentre si è fermi sulla home.
    // Il timbro "Aggiornato" si rinfresca a ogni giro del polling, non solo al mount.
    const carica = () => {
      fetch("/api/memoria/azioni", { cache: "no-store" }).then((r) => r.json()).then((d) => setAzioni(d.azioni || [])).catch(() => {});
      fetch("/api/alert", { cache: "no-store" }).then((r) => r.json()).then((d) => setAlerts(d.alert || [])).catch(() => {});
      fetch("/api/memoria/todo", { cache: "no-store" }).then((r) => r.json()).then((d) => setTodo(d.items || [])).catch(() => {});
      fetch("/api/memoria/intenzioni", { cache: "no-store" }).then((r) => r.json()).then((d) => setMosse(d.prossime_mosse || [])).catch(() => {});
      fetch("/api/memoria/auto-coscienza", { cache: "no-store" }).then((r) => r.json()).then((d) => setAutoAnalisi(d.collegato ? d.analisi || null : null)).catch(() => {});
      fetch("/api/memoria/auto-radiografia", { cache: "no-store" }).then((r) => r.json()).then((d) => {
        setRadiografia(d.collegato ? d.radiografia || null : null);
        setDifettiAperti(d.collegato ? (d.cantiere?.difetti || []).filter((x: any) => x.stato !== "chiuso").length : 0);
      }).catch(() => {});
      fetch("/api/ritmo", { cache: "no-store" }).then((r) => r.json()).then((d) => setRitmo({ pianoMattino: d.pianoMattino || null, reportSera: d.reportSera || null })).catch(() => {});
      setAggAt(Date.now());
    };
    carica();
    const id = setInterval(carica, 60000);
    return () => clearInterval(id);
  }, []);

  const daFirmare = azioni.filter((a) => a.inAttesa);
  const daFare = todo.filter((t) => !t.fatto);
  const ordP: Record<string, number> = { alta: 0, media: 1, bassa: 2 };
  const mosseOrd = [...mosse].sort((a, b) => (ordP[a.priorita || "media"] ?? 1) - (ordP[b.priorita || "media"] ?? 1));
  const vaiAMosse = () => {
    if (typeof window !== "undefined") window.location.hash = "azioni-mosse";
    onVaiA?.("azioni");
  };
  const cell = (chiave: string, tipo: Tipo) => {
    const on = metriche && metriche[chiave] !== undefined && metriche[chiave] !== null;
    return on ? formatta(metriche![chiave], tipo) : "—";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="t-area">🏠 Cosa conta ora</h2>
          <p className="t-eti mt-0.5">Il riepilogo per decidere in 10 secondi. Tocca un blocco per andare al dettaglio.</p>
        </div>
        <Aggiornato at={aggAt} className="mt-1 shrink-0" />
      </div>

      {/* 🫀 Stato del cuore della macchina */}
      <CuoreMacchina />

      {/* 🧬 Gli 8 organi: a colpo d'occhio cosa è pronto e cosa va acceso */}
      <StatoMacchina />

      {/* 🔄 Il volano (effetto-rete) */}
      <Volano />

      {/* 🔬 Auto-analisi: la macchina si è controllata da sola. Il livello più serio → banner in evidenza. */}
      {autoAnalisi && (
        <button
          onClick={() => { if (typeof window !== "undefined") window.location.hash = "auto-coscienza"; onVaiA?.("auto-coscienza"); }}
          className="w-full card p-3.5 text-left hover:border-brand/30 transition border-brand/20"
        >
          <div className="flex items-center gap-3">
            <span className="sez-ico"><Microscope size={16} /></span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="t-sez">Auto-analisi della macchina</span>
                {Number.isFinite(Number(autoAnalisi.voto_fiducia)) && (
                  <span className={`text-[12px] font-bold tabular-nums shrink-0 ${Number(autoAnalisi.voto_fiducia) >= 80 ? "text-green-600" : Number(autoAnalisi.voto_fiducia) >= 60 ? "text-amber-600" : "text-red-600"}`}>
                    fiducia {Number(autoAnalisi.voto_fiducia)}/100 {autoAnalisi.trend_fiducia || ""}
                  </span>
                )}
              </div>
              {autoAnalisi.sintesi && <p className="t-eti line-clamp-1 mt-0.5">{autoAnalisi.sintesi}</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg ${(autoAnalisi.errori?.length || 0) ? "bg-red-50 text-red-700 ring-1 ring-red-200" : "bg-green-50 text-green-700 ring-1 ring-green-200"}`}>
                <ShieldAlert size={12} /> {autoAnalisi.errori?.length || 0} errori
              </span>
              <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg ${(autoAnalisi.domande_per_nicola?.length || 0) ? "bg-brand-50 text-brand ring-1 ring-brand/20" : "badge-off"}`}>
                <HelpCircle size={12} /> {autoAnalisi.domande_per_nicola?.length || 0} domande
              </span>
            </div>
          </div>
        </button>
      )}

      {/* 🩻 Radiografia di sé: la macchina si è analizzata da cima a fondo → area Cervello */}
      {radiografia && (
        <button
          onClick={() => { if (typeof window !== "undefined") window.location.hash = "auto-radiografia"; onVaiA?.("cervello"); }}
          className="w-full card p-3.5 text-left hover:border-brand/30 transition border-brand/20"
        >
          <div className="flex items-center gap-3">
            <span className="sez-ico"><Cpu size={16} /></span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="t-sez">Radiografia della macchina</span>
                {Number.isFinite(Number(radiografia.voto_salute_architettura)) && (
                  <span className={`text-[12px] font-bold tabular-nums shrink-0 ${Number(radiografia.voto_salute_architettura) >= 80 ? "text-green-600" : Number(radiografia.voto_salute_architettura) >= 60 ? "text-amber-600" : "text-red-600"}`}>
                    salute {Number(radiografia.voto_salute_architettura)}/100 {radiografia.trend || ""}
                  </span>
                )}
              </div>
              {radiografia.sintesi && <p className="t-eti line-clamp-1 mt-0.5">{radiografia.sintesi}</p>}
            </div>
            <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg shrink-0 ${difettiAperti ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200" : "bg-green-50 text-green-700 ring-1 ring-green-200"}`}>
              <Hammer size={12} /> {difettiAperti} difetti aperti
            </span>
          </div>
        </button>
      )}

      {/* 4 priorità: firmare · mosse di Nicola · allarmi · da fare */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Da firmare */}
        <button onClick={() => onVaiA?.("azioni")} className="card p-3.5 text-left hover:border-brand/30 transition">
          <div className="flex items-center gap-2">
            <span className="sez-ico"><PenLine size={16} /></span>
            <span className="t-sez">Da firmare</span>
            <span className={`badge ml-auto ${daFirmare.length ? "badge-on" : "badge-off"}`}>{daFirmare.length}</span>
          </div>
          <div className="mt-2 space-y-1">
            {daFirmare.length === 0 && <p className="t-eti">Niente da firmare. 👍</p>}
            {daFirmare.slice(0, 3).map((a) => (
              <div key={a.numero} className="flex items-start gap-1.5 t-riga">
                <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${dotCls(a.livello)}`} />
                <span className="line-clamp-1">{testoPulito(a.azione)}</span>
              </div>
            ))}
            {daFirmare.length > 3 && <p className="t-eti">+{daFirmare.length - 3} altre…</p>}
          </div>
        </button>

        {/* Mosse di Nicola */}
        <button onClick={vaiAMosse} className="card p-3.5 text-left hover:border-brand/30 transition">
          <div className="flex items-center gap-2">
            <span className="sez-ico"><Footprints size={16} /></span>
            <span className="t-sez">Mosse di Nicola</span>
            <span className={`badge ml-auto ${mosseOrd.length ? "badge-on" : "badge-off"}`}>{mosseOrd.length}</span>
          </div>
          <div className="mt-2 space-y-1">
            {mosseOrd.length === 0 && <p className="t-eti">Nessuna mossa in agenda.</p>}
            {mosseOrd.slice(0, 3).map((m, i) => (
              <div key={i} className="flex items-start gap-1.5 t-riga">
                <span className="mt-0.5 shrink-0">{m.colore || "•"}</span>
                <span className="line-clamp-1">{testoPulito(m.titolo)}</span>
              </div>
            ))}
            {mosseOrd.length > 3 && <p className="t-eti">+{mosseOrd.length - 3} altre…</p>}
          </div>
        </button>

        {/* Allarmi */}
        <button onClick={() => onVaiA?.("memoria")} className="card p-3.5 text-left hover:border-brand/30 transition">
          <div className="flex items-center gap-2">
            <span className="sez-ico"><ShieldAlert size={16} /></span>
            <span className="t-sez">Allarmi</span>
            <span className={`badge ml-auto ${alerts.length ? "badge-on" : "badge-off"}`}>{alerts.length}</span>
          </div>
          <div className="mt-2 space-y-1">
            {alerts.length === 0 && <p className="t-eti">Nessun allarme. Tutto ok.</p>}
            {alerts.slice(0, 3).map((al, i) => (
              <div key={i} className="flex items-start gap-1.5 t-riga">
                <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${dotCls(al.livello)}`} />
                <span className="line-clamp-1">{al.titolo}</span>
              </div>
            ))}
            {alerts.length > 3 && <p className="t-eti">+{alerts.length - 3} altri…</p>}
          </div>
        </button>

        {/* Cose da fare */}
        <button onClick={() => onVaiA?.("memoria")} className="card p-3.5 text-left hover:border-brand/30 transition">
          <div className="flex items-center gap-2">
            <span className="sez-ico"><ListTodo size={16} /></span>
            <span className="t-sez">Cose da fare</span>
            <span className={`badge ml-auto ${daFare.length ? "badge-on" : "badge-off"}`}>{daFare.length}</span>
          </div>
          <div className="mt-2 space-y-1">
            {daFare.length === 0 && <p className="t-eti">Nessuna cosa in sospeso.</p>}
            {daFare.slice(0, 3).map((t) => (
              <div key={t.id} className="flex items-start gap-1.5 t-riga">
                <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${dotCls(t.livello)}`} />
                <span className="line-clamp-1">{testoPulito(t.testo)}</span>
              </div>
            ))}
            {daFare.length > 3 && <p className="t-eti">+{daFare.length - 3} altre…</p>}
          </div>
        </button>
      </div>

      {/* KPI chiave */}
      <section className="card p-4">
        <div className="sez-head mb-3">
          <span className="sez-ico"><TrendingUp size={16} /></span>
          <span className="t-sez">KPI chiave</span>
          <button onClick={() => onVaiA?.("numeri")} className="ml-auto t-eti hover:text-brand transition">tutti i numeri →</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {KPI_CHIAVE.map((k) => {
            const v = cell(k.chiave, k.tipo);
            const on = v !== "—";
            return (
              <div key={k.chiave} className={`kpi-tile ${on ? "" : "kpi-tile-off"}`}>
                <div className="kpi-tile-label">
                  <span className={on ? "text-brand" : ""} style={on ? undefined : { color: "var(--text-faint)" }}>{k.icon}</span>
                  <span>{k.label}</span>
                </div>
                <div className={`kpi-tile-value ${on ? "" : "kpi-tile-value-off"}`}>{v}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Ultimo briefing in poche righe */}
      <section className="card p-4">
        <div className="sez-head mb-2">
          <span className="sez-ico"><TrendingUp size={16} /></span>
          <span className="t-sez">Cosa ha scoperto l'AD</span>
        </div>
        {briefing?.situazione ? (
          <p className="t-corpo line-clamp-3">{briefing.situazione}</p>
        ) : (
          <p className="t-eti">Appena l'AD fa il suo giro (ogni ora), il riassunto compare qui.</p>
        )}
      </section>

      {/* Ritmo del giorno: Piano del mattino / Report della sera */}
      {(ritmo.pianoMattino || ritmo.reportSera) && (
        <section className="card p-4">
          <div className="sez-head mb-3">
            <span className="sez-ico"><Clock size={16} /></span>
            <div className="min-w-0 flex-1">
              <span className="t-sez">Ritmo del giorno</span>
              <p className="t-eti mt-0.5">Piano del mattino e report della sera (ora di Piacenza, dal vault).</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="surface-muted p-3.5">
              <div className="flex items-center gap-2 mb-2">
                <span className="t-micro">🌅 Piano del mattino</span>
                {ritmo.pianoMattino && (
                  <span className={`badge ml-auto ${ritmoEODoggi(ritmo.pianoMattino.data) || ritmo.pianoMattino.oggi ? "badge-on" : "badge-off"}`}>
                    {etichettaRitmo(ritmo.pianoMattino.data)}
                  </span>
                )}
              </div>
              {ritmo.pianoMattino ? (
                <p className="t-corpo whitespace-pre-wrap">{ritmo.pianoMattino.testo}</p>
              ) : (
                <p className="t-eti">Non ancora scritto oggi.</p>
              )}
            </div>
            <div className="surface-muted p-3.5">
              <div className="flex items-center gap-2 mb-2">
                <span className="t-micro">🌙 Report della sera</span>
                {ritmo.reportSera && (
                  <span className={`badge ml-auto ${ritmoEODoggi(ritmo.reportSera.data) || ritmo.reportSera.oggi ? "badge-on" : "badge-off"}`}>
                    {etichettaRitmo(ritmo.reportSera.data)}
                  </span>
                )}
              </div>
              {ritmo.reportSera ? (
                <p className="t-corpo whitespace-pre-wrap">{ritmo.reportSera.testo}</p>
              ) : (
                <p className="t-eti">Non ancora scritto oggi.</p>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
