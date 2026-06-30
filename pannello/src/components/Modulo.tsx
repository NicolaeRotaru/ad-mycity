"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { formatta, type Tipo } from "@/lib/format";
import type { ModuloDef, RigaLista } from "@/lib/moduli";
import Aggiornato from "@/components/Aggiornato";
import ParlaCasella from "@/components/ParlaCasella";

function dotCls(c?: string) {
  return c === "rosso" ? "bg-red-500" : c === "giallo" ? "bg-amber-500" : c === "verde" ? "bg-green-500" : "bg-black/25";
}

// Card-accordion generica di un modulo di controllo. Mostra (a seconda della
// config): una griglia di KPI (da /api/metriche), un ELENCO reale (fetch lazy
// dall'endpoint def.lista), i punti "cosa contiene", e la fonte da collegare.
export default function Modulo({ def, metriche }: { def: ModuloDef; metriche: Record<string, any> | null }) {
  const [open, setOpen] = useState(def.apertaDefault ?? false);
  const [righe, setRighe] = useState<RigaLista[] | null>(null);
  const [listaColl, setListaColl] = useState(true);
  const [caricando, setCaricando] = useState(false);
  const [mostraTutte, setMostraTutte] = useState(false);
  const [aggAt, setAggAt] = useState<number | null>(null);

  // Carica l'elenco reale solo alla prima apertura (lazy).
  useEffect(() => {
    if (!open || !def.lista || righe !== null) return;
    setCaricando(true);
    fetch(def.lista)
      .then((r) => r.json())
      .then((d) => {
        setRighe(Array.isArray(d.righe) ? d.righe : []);
        setListaColl(Boolean(d.collegato));
      })
      .catch(() => {
        setRighe([]);
        setListaColl(false);
      })
      .finally(() => {
        setCaricando(false);
        setAggAt(Date.now());
      });
  }, [open, def.lista, righe]);

  const acceso = (chiave?: string, tipo?: Tipo) =>
    Boolean(chiave && metriche && metriche[chiave] !== undefined && metriche[chiave] !== null) &&
    formatta(metriche![chiave!], tipo) !== "—";

  const kpis = def.kpis || [];
  const collegate = kpis.filter((k) => acceso(k.chiave, k.tipo)).length;
  const statoLabel = def.stato === "live" ? "live" : def.stato === "parziale" ? "parziale" : "da collegare";
  const badge = righe ? String(righe.length) : kpis.length ? `${collegate}/${kpis.length}` : statoLabel;
  const haDati = (righe && righe.length > 0) || collegate > 0;

  return (
    <div className={`rounded-xl border transition ${open ? "border-brand/25 bg-brand-50/20" : "border-black/[0.06] bg-paper/30 hover:border-brand/20"}`}>
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center gap-2 px-3 py-2.5 text-left" aria-expanded={open}>
        <span className="t-sez">{def.emoji} {def.titolo}</span>
        <span className={`badge ${haDati ? "badge-on" : "badge-off"}`}>{badge}</span>
        <span className="ml-auto shrink-0 text-black/35">{open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</span>
      </button>

      {open && (
        <div className="px-3 pb-3">
          <div className="flex items-start justify-between gap-2 mb-2.5">
            <p className="t-eti">{def.descrizione}</p>
            {def.lista && <Aggiornato at={aggAt} className="shrink-0" />}
          </div>

          {kpis.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2.5">
              {kpis.map((k, i) => {
                const on = acceso(k.chiave, k.tipo);
                const v = on ? formatta(metriche![k.chiave!], k.tipo) : "—";
                return (
                  <div key={i} className={`rounded-xl border p-2.5 ${on ? "border-black/[0.06] bg-paper/40" : "border-dashed border-black/[0.10] bg-paper/20"}`}>
                    <div className="text-[10.5px] text-black/55 leading-tight">{k.label}</div>
                    <div className={`text-[18px] font-semibold tracking-tight mt-0.5 tabular-nums ${on ? "text-ink" : "text-black/25"}`}>{v}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Elenco reale (fetch lazy) */}
          {def.lista && (
            <div className="mb-1">
              {caricando && (
                <div className="flex items-center gap-2 text-black/45 text-[12px] py-2">
                  <Loader2 size={13} className="animate-spin" /> Carico l'elenco…
                </div>
              )}
              {righe && righe.length > 0 && (
                <div className="space-y-1">
                  {(mostraTutte ? righe : righe.slice(0, 8)).map((r, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-lg border border-black/[0.06] bg-paper/40 px-2.5 py-1.5">
                      {r.colore && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotCls(r.colore)}`} />}
                      <span className="text-[12.5px] text-ink/85 truncate flex-1">{r.titolo}</span>
                      {r.sottotitolo && <span className="text-[11px] text-black/50 shrink-0">{r.sottotitolo}</span>}
                      {r.meta && <span className="badge badge-off shrink-0">{r.meta}</span>}
                    </div>
                  ))}
                  {righe.length > 8 && (
                    <button onClick={() => setMostraTutte((v) => !v)} className="t-eti hover:text-brand transition pt-1">
                      {mostraTutte ? "mostra meno" : `mostra altri ${righe.length - 8}`}
                    </button>
                  )}
                </div>
              )}
              {righe && righe.length === 0 && !caricando && (
                <p className="t-eti py-1">{listaColl ? "Nessun elemento per ora." : "Marketplace non collegato: l'elenco si accende in produzione."}</p>
              )}
            </div>
          )}

          {def.punti && def.punti.length > 0 && (
            <ul className="space-y-1 mt-1.5">
              {def.punti.map((p, i) => (
                <li key={i} className="text-[12px] text-black/60 leading-snug flex gap-1.5">
                  <span className="text-brand shrink-0">•</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          )}

          {def.stato !== "live" && (
            <p className="t-eti mt-2.5">
              {def.stato === "placeholder" ? "Si accende quando colleghi: " : "Parzialmente collegato · fonte: "}
              <span className="text-black/70">{def.fonte}</span>
            </p>
          )}
          <ParlaCasella titolo={`Modulo: ${def.titolo}`} contesto={def.descrizione} />
        </div>
      )}
    </div>
  );
}
