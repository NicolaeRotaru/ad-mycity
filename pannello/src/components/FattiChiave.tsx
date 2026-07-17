"use client";

import { ShieldCheck, AlertTriangle } from "lucide-react";
import { useFatti } from "@/lib/fatti";

// 🧭 La FONTE UNICA DELLA VERITÀ a schermo: mostra i fatti-chiave DECISI leggendoli da
// registro-fatti.json (una casa sola), col badge del guardiano di coerenza. È la scheda che
// risponde a «una cosa sola vera, non copie che si contraddicono». Additiva: non tocca le altre.
export default function FattiChiave() {
  const { collegato, fatti, coerenza, aggiornato, caricato } = useFatti();

  return (
    <section className="card p-4">
      <div className="sez-head mb-4">
        <span className="sez-ico">
          <ShieldCheck size={16} />
        </span>
        <div className="min-w-0">
          <span className="t-sez">Fatti-chiave</span>
          <div className="t-eti">
            La fonte unica della verità · registro-fatti.json{aggiornato ? ` · ${aggiornato}` : ""}
          </div>
        </div>
      </div>

      {coerenza &&
        (coerenza.esito === "incoerenze" ? (
          <div className="mb-3 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/[0.06] p-3 text-sm text-red-700">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span>
              <b>
                {coerenza.incoerenze} {coerenza.incoerenze === 1 ? "copia vecchia" : "copie vecchie"}
              </b>{" "}
              di un fatto ancora in giro nei file: la memoria sta divergendo. Vanno bonificate
              (l&apos;AD lo fa col guardiano coerenza-fatti).
            </span>
          </div>
        ) : (
          <div className="mb-3 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.06] p-2.5 text-sm text-emerald-700">
            <ShieldCheck size={16} className="shrink-0" />
            <span>Memoria coerente — nessuna copia vecchia in giro nei file.</span>
          </div>
        ))}

      {!caricato ? (
        <div className="text-center text-black/40 py-6 text-sm">Carico i fatti…</div>
      ) : !collegato || fatti.length === 0 ? (
        <div className="text-center text-black/45 py-8">
          <p className="mb-1">Nessun fatto-chiave registrato ancora.</p>
          <p className="text-sm text-black/35">
            Si popolano quando l&apos;AD registra un fatto (o da una tua correzione in chat).
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {fatti.map((f) => (
            <div key={f.id} className="rounded-xl border border-black/[0.07] bg-paper/40 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-medium">{f.nome}</div>
                <code className="text-[11px] text-black/40 shrink-0">{f.id}</code>
              </div>
              <p className="text-sm text-ink/85 leading-snug mt-1 whitespace-pre-wrap">{f.valore}</p>
              {(f.fonte || f.aggiornato) && (
                <div className="text-[11px] text-black/40 mt-1.5">
                  {f.fonte}
                  {f.fonte && f.aggiornato ? " · " : ""}
                  {f.aggiornato}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
