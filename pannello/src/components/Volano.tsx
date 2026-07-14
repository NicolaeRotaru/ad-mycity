"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import { ChevronDown, RefreshCw } from "lucide-react";
import { formatta } from "@/lib/format";
import { usePanelSync } from "@/lib/panel-sync";

// 🔄 Il volano (effetto-rete): più negozi → più clienti → più ordini → più negozi.
export default function Volano() {
  const [m, setM] = useState<Record<string, any> | null>(null);
  const [aperto, setAperto] = useState(false);
  const carica = useCallback(() => {
    fetch("/api/metriche", { cache: "no-store" }).then((r) => r.json()).then(setM).catch(() => {});
  }, []);

  useEffect(() => { carica(); }, [carica]);
  usePanelSync(["memoria", "all"], carica);
  const v = (k: string) => (m && m[k] != null ? formatta(m[k], "n") : "—");

  const passi = [
    { e: "🏪", l: "Negozi", k: "negozi" },
    { e: "🛍️", l: "Clienti", k: "clienti" },
    { e: "🧾", l: "Ordini 7g", k: "ordini_7g" },
  ];
  const riassunto = passi.map((p) => `${p.e} ${v(p.k)}`).join(" → ");

  return (
    <section className="card overflow-hidden">
      <button
        type="button"
        onClick={() => setAperto((x) => !x)}
        className="w-full flex items-center gap-2 p-3 text-left hover:bg-black/[0.02] transition"
        aria-expanded={aperto}
      >
        <span className="sez-ico w-7 h-7"><RefreshCw size={15} /></span>
        <div className="min-w-0 flex-1">
          <span className="t-sez text-[15px]">Il volano (effetto-rete)</span>
          {!aperto && <p className="t-eti mt-0.5 tabular-nums truncate">{riassunto} ↻</p>}
        </div>
        <ChevronDown size={16} className={`shrink-0 text-black/35 transition ${aperto ? "rotate-180" : ""}`} />
      </button>
      {aperto && (
        <div className="px-3 pb-3 pt-0 border-t border-black/[0.06]">
          <p className="t-eti mb-2.5">Più negozi → più clienti → più ordini → più negozi. Ogni giro spinge il successivo.</p>
          <div className="flex items-center gap-2 flex-wrap">
            {passi.map((p, i) => (
              <Fragment key={p.k}>
                <div className="kpi-tile text-center min-w-[72px] p-2">
                  <div className="kpi-tile-label justify-center"><span>{p.e} {p.l}</span></div>
                  <div className="kpi-tile-value text-[16px]">{v(p.k)}</div>
                </div>
                {i < passi.length - 1 && <span className="text-brand font-bold">→</span>}
              </Fragment>
            ))}
            <span className="text-brand font-bold" title="il ciclo si richiude e accelera">↻</span>
          </div>
          <p className="t-eti mt-2.5">Lo spingono i playbook <b>Referral &amp; volano</b> e <b>Fedeltà di rete</b>; le Stelle (nuovi clienti · negozi · influenza) lo misurano. Quando gira da solo, è inarrestabile.</p>
        </div>
      )}
    </section>
  );
}
