"use client";

import { useEffect, useState } from "react";
import { Activity, TrendingUp, TrendingDown, Minus, Hammer } from "lucide-react";

// 📈 SALUTE ONESTA — «sto migliorando davvero?» come numero, non come sensazione. Legge
// /api/memoria/salute-onesta (voto_pieno onesto + burn-down cantiere). Mostra il metro ONESTO
// accanto alla Radiografia: se resta fermo a 0 mentre il voto creditato si muove, qui si vede.

type Dati = {
  collegato: boolean;
  messaggio?: string;
  voto_onesto_ultimo?: number | null;
  voto_onesto_trend?: string;
  rilevazioni_con_voto_pieno?: number;
  su_totale_snapshot?: number;
  ultimi10_fermi_a_zero?: number;
  cantiere_aperti_ora?: number | null;
  cantiere_aperti_settimana_fa?: number | null;
  burn_down_settimana?: number | null;
  serie_onesta?: { data: string; voto: number }[];
};

function votoColore(v?: number | null): string {
  if (v == null || !Number.isFinite(Number(v))) return "text-black/40";
  const n = Number(v);
  if (n >= 80) return "text-green-600";
  if (n >= 60) return "text-amber-600";
  return "text-red-600";
}

const BARRA_MAX_PX = 40;

export default function SaluteOnesta() {
  const [d, setD] = useState<Dati | null>(null);

  useEffect(() => {
    const carica = () =>
      fetch("/api/memoria/salute-onesta", { cache: "no-store" })
        .then((r) => r.json())
        .then(setD)
        .catch(() => {});
    carica();
    const id = setInterval(carica, 60_000);
    return () => clearInterval(id);
  }, []);

  const voto = d?.voto_onesto_ultimo;
  const votoOk = voto != null && Number.isFinite(Number(voto));
  const trend = d?.voto_onesto_trend || "";
  const TrendIco = trend === "in salita" ? TrendingUp : trend === "in discesa" ? TrendingDown : Minus;
  const burn = d?.burn_down_settimana;
  const fermi0 = d?.ultimi10_fermi_a_zero ?? 0;
  const serie = d?.serie_onesta || [];

  return (
    <section className="card p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="sez-ico"><Activity size={16} /></span>
          <div className="min-w-0">
            <span className="t-sez">📈 Salute onesta</span>
            <div className="t-eti">Sto migliorando davvero? Il voto ONESTO (voto_pieno), non quello creditato.</div>
          </div>
        </div>
        {votoOk && (
          <div className="text-right shrink-0">
            <div className={`text-[26px] font-bold leading-none tabular-nums ${votoColore(Number(voto))}`}>
              {voto}
              <span className="text-[13px] text-black/30">/100</span>
            </div>
            <div className="t-eti inline-flex items-center gap-1 justify-end">
              <TrendIco size={12} /> {trend || "n/d"}
            </div>
          </div>
        )}
      </div>

      {!d && <p className="t-eti py-6 text-center">Caricamento…</p>}
      {d && !d.collegato && <p className="t-eti py-6 text-center">{d.messaggio}</p>}

      {d?.collegato && (
        <>
          <div className="rounded-xl border border-black/[0.06] bg-paper/40 px-3 py-2 mb-3 text-[12.5px]">
            <b>{d.rilevazioni_con_voto_pieno}</b>/{d.su_totale_snapshot} rilevazioni con voto onesto ·{" "}
            ultimi 10 fermi a 0:{" "}
            <b className={fermi0 >= 8 ? "text-red-600" : ""}>{fermi0}</b>
          </div>

          {/* Burn-down cantiere: verde se cala, rosso se cresce */}
          <div
            className={`rounded-xl border px-3 py-2.5 mb-3 ${
              burn != null && burn < 0
                ? "border-red-200 bg-red-50/50"
                : burn != null && burn > 0
                  ? "border-green-200 bg-green-50/50"
                  : "border-black/10 bg-paper/40"
            }`}
          >
            <div className="t-micro mb-1 flex items-center gap-1.5"><Hammer size={13} /> Burn-down cantiere difetti</div>
            <p className="t-corpo text-[13px]">
              ~7 giorni fa: <b>{d.cantiere_aperti_settimana_fa ?? "n/d"}</b> aperti → ora:{" "}
              <b>{d.cantiere_aperti_ora ?? "n/d"}</b> aperti
            </p>
            {burn != null && (
              <p className="text-[12px] mt-0.5">
                {burn > 0
                  ? `✅ il cantiere CALA (${burn} difetti chiusi netti nella settimana)`
                  : burn < 0
                    ? `⚠️ il cantiere CRESCE (${-burn} difetti aperti netti in più): non va a zero`
                    : "⏸️ cantiere fermo (né su né giù)"}
              </p>
            )}
          </div>

          {/* Sparkline onesto: se resta a zero, le barre restano a terra — è il messaggio */}
          {serie.length > 1 && (
            <div>
              <div className="t-micro mb-1.5">Voto onesto giorno per giorno (ultime 3 settimane)</div>
              <div className="flex items-end gap-1">
                {serie.map((s, i) => (
                  <div key={i} className="flex flex-col items-center gap-0.5 flex-1 min-w-0" title={`${s.data}: ${s.voto}/100`}>
                    <div
                      className="w-full max-w-[20px] rounded-t bg-brand/70"
                      style={{ height: `${Math.max(2, Math.round((Number(s.voto) / 100) * BARRA_MAX_PX))}px` }}
                    />
                    <span className="text-[8px] text-black/40 whitespace-nowrap">{s.data.slice(8, 10)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
