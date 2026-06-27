"use client";

import { Fragment, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { formatta } from "@/lib/format";

// 🔄 Il volano (effetto-rete): più negozi → più clienti → più ordini → più negozi.
export default function Volano() {
  const [m, setM] = useState<Record<string, any> | null>(null);
  useEffect(() => {
    fetch("/api/metriche", { cache: "no-store" }).then((r) => r.json()).then(setM).catch(() => {});
  }, []);
  const v = (k: string) => (m && m[k] != null ? formatta(m[k], "n") : "—");

  const passi = [
    { e: "🏪", l: "Negozi", k: "negozi" },
    { e: "🛍️", l: "Clienti", k: "clienti" },
    { e: "🧾", l: "Ordini 7g", k: "ordini_7g" },
  ];

  return (
    <section className="card p-4">
      <div className="sez-head mb-2">
        <span className="sez-ico"><RefreshCw size={16} /></span>
        <span className="t-sez">Il volano (effetto-rete)</span>
      </div>
      <p className="t-eti mb-3">Più negozi → più clienti → più ordini → più negozi. Ogni giro spinge il successivo.</p>
      <div className="flex items-center gap-2 flex-wrap">
        {passi.map((p, i) => (
          <Fragment key={p.k}>
            <div className="rounded-xl border border-black/[0.06] bg-paper/40 p-2.5 text-center min-w-[82px]">
              <div className="text-[11px] text-black/55">{p.e} {p.l}</div>
              <div className="text-[18px] font-semibold tracking-tight tabular-nums">{v(p.k)}</div>
            </div>
            {i < passi.length - 1 && <span className="text-brand font-bold">→</span>}
          </Fragment>
        ))}
        <span className="text-brand font-bold" title="il ciclo si richiude e accelera">↻</span>
      </div>
      <p className="t-eti mt-3">Lo spingono i playbook <b>Referral &amp; volano</b> e <b>Fedeltà di rete</b>; le Stelle (nuovi clienti · negozi · influenza) lo misurano. Quando gira da solo, è inarrestabile.</p>
    </section>
  );
}
