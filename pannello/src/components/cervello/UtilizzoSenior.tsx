"use client";

import { useEffect, useState } from "react";
import { Users, Moon, Trophy } from "lucide-react";

// 📊 UTILIZZO SENIOR — il roster dei senior come NUMERO, non come elenco. Legge
// /api/memoria/utilizzo-senior (quanti agenti hanno prodotto almeno un ESITO, dormienti, top).
// Rende l'overhead una decisione: se l'utilizzo è basso, i dormienti vanno in «panchina» dichiarata.

type Top = { reparto: string; esiti: number; giorni_fa: number | null };
type Dati = {
  collegato: boolean;
  messaggio?: string;
  aggiornato?: string | null;
  totale_agenti?: number;
  con_almeno_un_esito?: number;
  vivi?: number;
  fermi?: number;
  mai_un_esito?: number;
  utilizzo_reale?: number;
  top_consumatori?: Top[];
};

export default function UtilizzoSenior() {
  const [d, setD] = useState<Dati | null>(null);

  useEffect(() => {
    const carica = () =>
      fetch("/api/memoria/utilizzo-senior", { cache: "no-store" })
        .then((r) => r.json())
        .then(setD)
        .catch(() => {});
    carica();
    const id = setInterval(carica, 60_000);
    return () => clearInterval(id);
  }, []);

  const perc = d?.utilizzo_reale != null ? Math.round(d.utilizzo_reale * 100) : null;
  const percColore =
    perc == null ? "text-black/40" : perc >= 60 ? "text-green-600" : perc >= 40 ? "text-amber-600" : "text-red-600";
  const top = d?.top_consumatori || [];
  const maxEsiti = top.length ? Math.max(...top.map((t) => t.esiti)) : 1;

  return (
    <section className="card p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="sez-ico"><Users size={16} /></span>
          <div className="min-w-0">
            <span className="t-sez">📊 Utilizzo senior</span>
            <div className="t-eti">Il roster dei senior come numero: quanti lavorano davvero, quanti dormono.</div>
          </div>
        </div>
        {perc != null && (
          <div className="text-right shrink-0">
            <div className={`text-[26px] font-bold leading-none tabular-nums ${percColore}`}>
              {perc}
              <span className="text-[13px] text-black/30">%</span>
            </div>
            <div className="t-eti">
              {d?.con_almeno_un_esito}/{d?.totale_agenti} con esito
            </div>
          </div>
        )}
      </div>

      {!d && <p className="t-eti py-6 text-center">Caricamento…</p>}
      {d && !d.collegato && <p className="t-eti py-6 text-center">{d.messaggio}</p>}

      {d?.collegato && (
        <>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="rounded-xl border border-green-200 bg-green-50/50 px-2 py-1.5 text-center">
              <div className="text-[18px] font-bold tabular-nums text-green-700">{d.vivi}</div>
              <div className="t-micro">vivi</div>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 px-2 py-1.5 text-center">
              <div className="text-[18px] font-bold tabular-nums text-amber-700">{d.fermi}</div>
              <div className="t-micro">fermi</div>
            </div>
            <div className="rounded-xl border border-black/10 bg-paper/40 px-2 py-1.5 text-center">
              <div className="text-[18px] font-bold tabular-nums text-black/60 inline-flex items-center gap-1 justify-center">
                <Moon size={13} />
                {d.mai_un_esito}
              </div>
              <div className="t-micro">mai un esito</div>
            </div>
          </div>

          {perc != null && perc < 40 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 px-3 py-2 mb-3 text-[12px] text-amber-900/90">
              ⚠️ Utilizzo {perc}% &lt; 40%: il roster è per lo più overhead. Decisione da portare a Nicola:
              congelare i dormienti in una «panchina» dichiarata (nucleo ~30-40); ogni riattivazione richiede
              un mandato reale.
            </div>
          )}

          {top.length > 0 && (
            <div>
              <div className="t-micro mb-1.5 flex items-center gap-1.5"><Trophy size={13} /> Top consumatori (chi lavora davvero)</div>
              <div className="space-y-1">
                {top.map((t, i) => (
                  <div key={i} className="flex items-center gap-2 text-[12px]">
                    <span className="w-28 truncate" title={t.reparto}>{t.reparto}</span>
                    <div className="flex-1 h-2 rounded bg-black/[0.06] overflow-hidden">
                      <div
                        className="h-full rounded bg-brand/70"
                        style={{ width: `${Math.max(4, Math.round((t.esiti / maxEsiti) * 100))}%` }}
                      />
                    </div>
                    <span className="tabular-nums text-black/60 w-10 text-right">{t.esiti}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {d.aggiornato && <p className="t-micro mt-2 normal-case">Aggiornato {d.aggiornato}</p>}
        </>
      )}
    </section>
  );
}
