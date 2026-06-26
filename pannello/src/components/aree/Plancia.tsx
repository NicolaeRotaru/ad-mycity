"use client";

import { useEffect, useState } from "react";
import { PenLine, ShieldAlert, ListTodo, TrendingUp, Package, Euro, Truck, Users, Star, ShoppingCart, Clock } from "lucide-react";
import { formatta, testoPulito, dataVault, type Tipo } from "@/lib/format";

// "Cosa conta ora": la home del pannello. A colpo d'occhio, senza aprire nulla:
// cosa devi firmare, quali allarmi sono scattati, cosa devi fare, i KPI chiave,
// e l'ultima analisi dell'AD in poche righe. Tutto da fonti reali già pronte.

type Azione = { numero: string; reparto: string; azione: string; livello: string; inAttesa: boolean };
type Alert = { livello: "rosso" | "giallo"; titolo: string };
type Todo = { id: string; testo: string; livello: string; fatto: boolean };
type Voce = { data: string; testo: string } | null;

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
  const [ritmo, setRitmo] = useState<{ pianoMattino: Voce; reportSera: Voce }>({ pianoMattino: null, reportSera: null });

  useEffect(() => {
    fetch("/api/memoria/azioni").then((r) => r.json()).then((d) => setAzioni(d.azioni || [])).catch(() => {});
    fetch("/api/alert").then((r) => r.json()).then((d) => setAlerts(d.alert || [])).catch(() => {});
    fetch("/api/memoria/todo").then((r) => r.json()).then((d) => setTodo(d.items || [])).catch(() => {});
    fetch("/api/ritmo").then((r) => r.json()).then((d) => setRitmo({ pianoMattino: d.pianoMattino || null, reportSera: d.reportSera || null })).catch(() => {});
  }, []);

  const daFirmare = azioni.filter((a) => a.inAttesa);
  const daFare = todo.filter((t) => !t.fatto);
  const cell = (chiave: string, tipo: Tipo) => {
    const on = metriche && metriche[chiave] !== undefined && metriche[chiave] !== null;
    return on ? formatta(metriche![chiave], tipo) : "—";
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="t-area">🏠 Cosa conta ora</h2>
        <p className="t-eti mt-0.5">Il riepilogo per decidere in 10 secondi. Tocca un blocco per andare al dettaglio.</p>
      </div>

      {/* 3 priorità: firmare · allarmi · da fare */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
              <div key={a.numero} className="flex items-start gap-1.5 text-[12px] text-ink/85">
                <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${dotCls(a.livello)}`} />
                <span className="line-clamp-1">{testoPulito(a.azione)}</span>
              </div>
            ))}
            {daFirmare.length > 3 && <p className="t-eti">+{daFirmare.length - 3} altre…</p>}
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
              <div key={i} className="flex items-start gap-1.5 text-[12px] text-ink/85">
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
              <div key={t.id} className="flex items-start gap-1.5 text-[12px] text-ink/85">
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
              <div key={k.chiave} className={`rounded-xl border p-2.5 ${on ? "border-black/[0.06] bg-paper/40" : "border-dashed border-black/[0.10] bg-paper/20"}`}>
                <div className="flex items-center gap-1.5 text-black/55">
                  <span className={on ? "text-brand" : "text-black/30"}>{k.icon}</span>
                  <span className="text-[10.5px] leading-tight">{k.label}</span>
                </div>
                <div className={`text-[18px] font-semibold tracking-tight mt-0.5 tabular-nums ${on ? "text-ink" : "text-black/25"}`}>{v}</div>
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
            <span className="t-sez">Ritmo del giorno</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-black/[0.06] bg-paper/40 p-3">
              <div className="t-micro mb-1">🌅 Piano del mattino{ritmo.pianoMattino ? ` · ${dataVault(ritmo.pianoMattino.data)}` : ""}</div>
              {ritmo.pianoMattino ? (
                <p className="t-corpo whitespace-pre-wrap">{ritmo.pianoMattino.testo}</p>
              ) : (
                <p className="t-eti">Non ancora scritto oggi.</p>
              )}
            </div>
            <div className="rounded-xl border border-black/[0.06] bg-paper/40 p-3">
              <div className="t-micro mb-1">🌙 Report della sera{ritmo.reportSera ? ` · ${dataVault(ritmo.reportSera.data)}` : ""}</div>
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
