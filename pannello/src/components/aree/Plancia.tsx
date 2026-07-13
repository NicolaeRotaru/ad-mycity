"use client";

import { useEffect, useState } from "react";
import { PenLine, ShieldAlert, ListTodo, TrendingUp, Package, Euro, Truck, Users, Star, ShoppingCart, Clock, Footprints, FileText } from "lucide-react";
import { formatta, etichettaRitmo, ritmoEODoggi, giornoRoma, type Tipo } from "@/lib/format";
import { RitmoTesto } from "@/components/RitmoTesto";
import ParlaCasella from "@/components/ParlaCasella";
import Aggiornato from "@/components/Aggiornato";
import FraseLista from "@/components/FraseLista";
import { vaiArea } from "@/lib/nav";
import { codiceAzione, pulisciTitolo } from "@/lib/azioni-attesa";
import MacchinaHomeCard from "@/components/MacchinaHomeCard";
import LetteraAdCard from "@/components/LetteraAdCard";
import Volano from "@/components/Volano";

// "Cosa conta ora": la home del pannello. A colpo d'occhio, senza aprire nulla:
// cosa devi firmare, quali allarmi sono scattati, cosa devi fare, i KPI chiave,
// e l'ultima analisi dell'AD in poche righe. Tutto da fonti reali già pronte.

type Azione = { id: string; titolo: string; livello: string; reparto?: string; stato: string };
type Alert = { livello: "rosso" | "giallo"; titolo: string };
type Todo = { id: string; testo: string; livello: string; fatto: boolean };
type Mossa = { titolo: string; priorita?: "alta" | "media" | "bassa"; colore?: string };
type Voce = { data: string; testo: string; oggi?: boolean } | null;
type Doc = { file: string; titolo: string; data: string | null; etichetta?: string };

function dataItBreve(d: string | null): string {
  if (!d) return "";
  const [y, m, g] = d.split("-");
  return `${g}/${m}`;
}

// Un «trend» sano è un token breve (paracadute UI — non usato in home ridisegnata, tenuto per compat).
function trendBreve(_v: unknown): string {
  return "";
}

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
  const [ritmo, setRitmo] = useState<{ pianoMattino: Voce; reportSera: Voce }>({ pianoMattino: null, reportSera: null });
  const [documenti, setDocumenti] = useState<Doc[]>([]);
  const [aggAt, setAggAt] = useState<number | null>(null);

  useEffect(() => {
    // Ricarica anche a intervalli: i dati arrivano dal vault (giro) e cambiano mentre si è fermi sulla home.
    // Il timbro "Aggiornato" si rinfresca a ogni giro del polling, non solo al mount.
    const carica = () => {
      // Stessa fonte dell'area Azioni (include le sentinelle) → il conteggio "da firmare" coincide.
      fetch("/api/azioni-pronte", { cache: "no-store" }).then((r) => r.json()).then((d) => setAzioni(d.azioni || [])).catch(() => {});
      fetch("/api/alert", { cache: "no-store" }).then((r) => r.json()).then((d) => setAlerts(d.alert || [])).catch(() => {});
      fetch("/api/memoria/todo", { cache: "no-store" }).then((r) => r.json()).then((d) => setTodo(d.items || [])).catch(() => {});
      fetch("/api/memoria/intenzioni", { cache: "no-store" }).then((r) => r.json()).then((d) => setMosse(d.prossime_mosse || [])).catch(() => {});
      fetch("/api/ritmo", { cache: "no-store" }).then((r) => r.json()).then((d) => setRitmo({ pianoMattino: d.pianoMattino || null, reportSera: d.reportSera || null })).catch(() => {});
      fetch("/api/consegne", { cache: "no-store" }).then((r) => r.json()).then((d) => setDocumenti(d.recenti || [])).catch(() => {});
      setAggAt(Date.now());
    };
    carica();
    const id = setInterval(carica, 60000);
    return () => clearInterval(id);
  }, []);

  // "Da firmare" = azioni ancora da decidere (stato vuoto): STESSO conteggio del badge
  // "Da approvare" dell'area Azioni (che fa filter(!stato)). Un solo numero ovunque.
  const daFirmare = azioni.filter((a) => !a.stato);
  const daFare = todo.filter((t) => !t.fatto);
  const ordP: Record<string, number> = { alta: 0, media: 1, bassa: 2 };
  const mosseOrd = [...mosse].sort((a, b) => (ordP[a.priorita || "media"] ?? 1) - (ordP[b.priorita || "media"] ?? 1));
  // Salto all'area Azioni puntando la scheda giusta con UN SOLO canale di cronologia:
  // vaiArea (EVENTO_VAI) — page.tsx cambia vista e Azioni.tsx apre la scheda. Prima si
  // sommava hash + onVaiA → due voci di cronologia (INDIETRO da premere due volte). (bug #3)
  const vaiAzioni = (sub: string) => vaiArea("azioni", undefined, sub);
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

      {/* 1 · Da fare adesso: firmare + allarmi in evidenza */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button onClick={() => vaiAzioni("approvare")} className="card-priorita hover:border-brand/30 sm:col-span-1">
          <div className="flex items-center gap-2">
            <span className="sez-ico"><PenLine size={16} /></span>
            <span className="t-sez">Da firmare</span>
            <span className={`badge ml-auto ${daFirmare.length ? "badge-on" : "badge-off"}`}>{daFirmare.length}</span>
          </div>
          <div className="mt-2 space-y-1">
            {daFirmare.length === 0 && <p className="t-eti">Niente da firmare. 👍</p>}
            {daFirmare.slice(0, 3).map((a) => (
              <div key={a.id} className="flex items-start gap-1.5 t-riga">
                <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${dotCls(a.livello)}`} />
                <span className="mt-0.5 shrink-0 font-mono text-[10px] font-bold text-brand tabular-nums" title="Codice casella">{codiceAzione(a.id)}</span>
                <span className="mt-0.5 shrink-0 text-black/25 text-[10px]">—</span>
                <FraseLista testo={pulisciTitolo(a.titolo)} />
              </div>
            ))}
            {daFirmare.length > 3 && <p className="t-eti">+{daFirmare.length - 3} altre…</p>}
          </div>
        </button>

        <button onClick={() => vaiAzioni("sentinelle")} className="card-priorita hover:border-brand/30">
          <div className="flex items-center gap-2">
            <span className="sez-ico"><ShieldAlert size={16} /></span>
            <span className="t-sez">Allarmi</span>
            <span className={`badge ml-auto ${alerts.length ? "badge-on" : "badge-off"}`}>{alerts.length}</span>
          </div>
          <div className="mt-2 space-y-1">
            {alerts.length === 0 && <p className="t-eti">Nessun allarme. Tutto ok.</p>}
            {alerts.slice(0, 3).map((al, i) => (
              <div key={i} className="flex items-start gap-2 t-riga">
                <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${dotCls(al.livello)}`} />
                <FraseLista testo={al.titolo} />
              </div>
            ))}
            {alerts.length > 3 && <p className="t-eti">+{alerts.length - 3} altri…</p>}
          </div>
        </button>

        <button onClick={() => vaiAzioni("mosse")} className="card-priorita hover:border-brand/30">
          <div className="flex items-center gap-2">
            <span className="sez-ico"><Footprints size={16} /></span>
            <span className="t-sez">Mosse di Nicola</span>
            <span className={`badge ml-auto ${mosseOrd.length ? "badge-on" : "badge-off"}`}>{mosseOrd.length}</span>
          </div>
          <div className="mt-2 space-y-1">
            {mosseOrd.length === 0 && <p className="t-eti">Nessuna mossa in agenda.</p>}
            {mosseOrd.slice(0, 2).map((m, i) => (
              <div key={i} className="flex items-start gap-2 t-riga">
                <span className="mt-0.5 shrink-0 text-base">{m.colore || "•"}</span>
                <FraseLista testo={pulisciTitolo(m.titolo)} />
              </div>
            ))}
          </div>
        </button>

        <button onClick={() => vaiAzioni("dafare")} className="card-priorita hover:border-brand/30">
          <div className="flex items-center gap-2">
            <span className="sez-ico"><ListTodo size={16} /></span>
            <span className="t-sez">Cose da fare</span>
            <span className={`badge ml-auto ${daFare.length ? "badge-on" : "badge-off"}`}>{daFare.length}</span>
          </div>
          <div className="mt-2 space-y-1">
            {daFare.length === 0 && <p className="t-eti">Nessuna cosa in sospeso.</p>}
            {daFare.slice(0, 2).map((t) => (
              <div key={t.id} className="flex items-start gap-2 t-riga">
                <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${dotCls(t.livello)}`} />
                <FraseLista testo={t.testo} />
              </div>
            ))}
          </div>
        </button>
      </div>

      {/* 2 · Ritmo del giorno */}
      {(ritmo.pianoMattino || ritmo.reportSera) && (
        <section className="card p-4">
          <div className="sez-head mb-3">
            <span className="sez-ico"><Clock size={16} /></span>
            <div className="min-w-0 flex-1">
              <span className="t-sez">Ritmo del giorno</span>
              {(!ritmoEODoggi(ritmo.pianoMattino?.data) && !ritmoEODoggi(ritmo.reportSera?.data)) && (
                <p className="text-[12px] mt-1 font-medium text-amber-600 dark:text-amber-400">
                  ⚠️ Non ancora aggiornato oggi ({giornoRoma().split("-").reverse().join("/")})
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="surface-muted p-3.5">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="t-micro">🌅 Piano del mattino</span>
                {ritmo.pianoMattino && (
                  <span className={`badge ml-auto ${ritmoEODoggi(ritmo.pianoMattino.data) ? "badge-on" : "badge-off"}`} title={ritmo.pianoMattino.data}>
                    {etichettaRitmo(ritmo.pianoMattino.data)}
                  </span>
                )}
              </div>
              {ritmo.pianoMattino ? (
                <>
                  <RitmoTesto testo={ritmo.pianoMattino.testo} />
                  <ParlaCasella
                    titolo="Piano del mattino"
                    contesto={[ritmo.pianoMattino.data && `Data: ${ritmo.pianoMattino.data}`, ritmo.pianoMattino.testo].filter(Boolean).join("\n")}
                  />
                </>
              ) : (
                <p className="t-eti">Non ancora scritto oggi.</p>
              )}
            </div>
            <div className="surface-muted p-3.5">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="t-micro">🌙 Report della sera</span>
                {ritmo.reportSera && (
                  <span className={`badge ml-auto ${ritmoEODoggi(ritmo.reportSera.data) ? "badge-on" : "badge-off"}`} title={ritmo.reportSera.data}>
                    {etichettaRitmo(ritmo.reportSera.data)}
                  </span>
                )}
              </div>
              {ritmo.reportSera ? (
                <>
                  <RitmoTesto testo={ritmo.reportSera.testo} />
                  <ParlaCasella
                    titolo="Report della sera"
                    contesto={[ritmo.reportSera.data && `Data: ${ritmo.reportSera.data}`, ritmo.reportSera.testo].filter(Boolean).join("\n")}
                  />
                </>
              ) : (
                <p className="t-eti">Non ancora scritto oggi.</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 3 · Lettera dell'AD */}
      <LetteraAdCard />

      {/* 4 · KPI chiave */}
      <section className="card p-4">
        <div className="sez-head mb-3">
          <span className="sez-ico"><TrendingUp size={16} /></span>
          <span className="t-sez">Numeri che contano</span>
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

      {/* 5 · Macchina (card unica) */}
      <MacchinaHomeCard />

      <Volano />

      {/* Resto · documenti recenti */}
      <section className="card p-4">
        <div className="sez-head mb-3">
          <span className="sez-ico"><FileText size={16} /></span>
          <span className="t-sez">Report &amp; piani dell&apos;AD</span>
          <button onClick={() => vaiArea("report")} className="ml-auto t-eti hover:text-brand transition">tutti i documenti →</button>
        </div>
        {documenti.length === 0 ? (
          <p className="t-eti">Le radiografie e i piani che l&apos;AD produce compaiono qui.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {documenti.slice(0, 4).map((d) => (
              <button
                key={d.file}
                onClick={() => vaiArea("report", undefined, d.file)}
                className="text-left surface-muted p-3 rounded-xl hover:border-brand/30 border border-transparent transition flex items-start gap-2.5"
              >
                <span className="mt-0.5 text-black/40 shrink-0"><FileText size={15} /></span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-medium truncate" style={{ color: "var(--text-primary)" }}>{d.titolo}</span>
                  <span className="block t-eti mt-0.5 truncate">{d.etichetta}{d.data ? ` · ${dataItBreve(d.data)}` : ""}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
