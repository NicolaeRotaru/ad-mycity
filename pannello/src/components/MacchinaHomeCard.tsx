"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, ChevronDown, HeartPulse } from "lucide-react";
import { istante } from "@/lib/format";
import { etaTesto } from "@/lib/memoria-ferma";
import { vaiArea } from "@/lib/nav";
import { usePanelSync } from "@/lib/panel-sync";
import { listaSicura } from "@/lib/memoria-json";

type Cuore = {
  collegato: boolean;
  ultimoGiro?: string | null;
  ultimoBattito?: string | null;
  vivo?: boolean;
  workerVivo?: boolean;
  autopilota?: boolean;
  // AR-544: verdetto «memoria ferma» calcolato dal server (battito × ultimo push riuscito).
  memoriaFerma?: boolean;
  memoriaFermaOre?: number | null;
  memoriaLavora?: boolean;
  pushMemoriaUltimo?: string | null;
};
type Diagnosi = { salute: "verde" | "giallo" | "rosso"; checks: { nome: string; stato: "verde" | "giallo" | "rosso"; dettaglio: string }[] };
type SaluteLink = { label: string; vista: "cervello" | "auto-coscienza" | "salute-sito"; stat: string; semaforo: "verde" | "giallo" | "rosso" };

const ORGANI = [
  { e: "👁️", n: "Sensi", okKey: "sensi" as const },
  { e: "🧠", n: "Memoria", okKey: "memoria" as const },
  { e: "💡", n: "Cervello", okKey: "cervello" as const },
  { e: "🫀", n: "Battito", okKey: "battito" as const },
  { e: "✋", n: "Mani", okKey: "mani" as const },
  { e: "🛡️", n: "Freni", okKey: "freni" as const },
  { e: "🎛️", n: "Cabina", okKey: "cabina" as const },
  { e: "🔁", n: "Apprend.", okKey: "apprend" as const },
];

function dot(stato: "verde" | "giallo" | "rosso") {
  return stato === "verde" ? "bg-green-500" : stato === "giallo" ? "bg-amber-500" : "bg-red-500";
}

/** Card unica home: semaforo + 8 pallini + link alle 3 pagine salute. */
// AR-256: i tre collegamenti esistono SEMPRE. Cambia solo il dato che ci sta accanto: se non è
// arrivato, lo si dice — non si toglie la porta perché non si sa cosa c'è dietro. Vive fuori dal
// componente così `carica` (useCallback con deps vuote) lo cattura una volta sola.
const LINK_BASE: SaluteLink[] = [
  { label: "Radiografia macchina", vista: "cervello", stat: "dato non leggibile", semaforo: "giallo" },
  { label: "Auto-coscienza", vista: "auto-coscienza", stat: "dato non leggibile", semaforo: "giallo" },
  { label: "Salute sito", vista: "salute-sito", stat: "dato non leggibile", semaforo: "giallo" },
];

export default function MacchinaHomeCard() {
  const [c, setC] = useState<Cuore | null>(null);
  const [diag, setDiag] = useState<Diagnosi | null>(null);
  const [m, setM] = useState<Record<string, any> | null>(null);
  const [links, setLinks] = useState<SaluteLink[]>([]);
  const [dettagli, setDettagli] = useState(false);
  const [organoHover, setOrganoHover] = useState<string | null>(null);

  const carica = useCallback(() => {
    fetch("/api/cuore", { cache: "no-store" }).then((r) => r.json()).then(setC).catch(() => {});
    fetch("/api/diagnosi", { cache: "no-store" }).then((r) => r.json()).then(setDiag).catch(() => {});
    fetch("/api/metriche", { cache: "no-store" }).then((r) => r.json()).then(setM).catch(() => {});
    Promise.all([
      fetch("/api/memoria/auto-radiografia", { cache: "no-store" }).then((r) => r.json()).catch(() => null),
      fetch("/api/memoria/auto-coscienza", { cache: "no-store" }).then((r) => r.json()).catch(() => null),
      fetch("/api/memoria/radiografia-marketplace", { cache: "no-store" }).then((r) => r.json()).catch(() => null),
    ]).then(([rad, ac, sito]) => {
      // AR-256: qui sotto si legge dentro tre risposte che possono arrivare malformate. Se una riga
      // lancia, l'eccezione avviene DENTRO il .then() e `setLinks` non viene mai chiamato: dalla home
      // spariscono in silenzio i tre collegamenti alla salute. Non un errore — proprio il vuoto, come
      // se non ci fosse niente da vedere. La difesa è in fondo (.catch → LINK_BASE).
      // AR-253 — quarta copia della stessa lettura, l'unica rimasta nuda: qui il crash sarebbe sulla
      // HOME, cioè la prima cosa che Nicola vede. Stessa difesa delle altre tre, dalla stessa fonte.
      const difetti = rad?.collegato ? listaSicura<any>(rad.cantiere?.difetti).filter((x) => x.stato !== "chiuso").length : 0;
      const votoRad = Number(rad?.live?.voto ?? rad?.radiografia?.voto_salute_architettura);
      const fiducia = Number(ac?.analisi?.voto_fiducia);
      // 🏪 SALUTE SITO — il numero è quello che RESTA, non quello che l'audit aveva trovato.
      // Qui si leggeva `sito.meta.bloccanti`, cioè la fotografia del giorno del referto: il 20/8
      // diceva «12 bloccanti» in rosso mentre i bloccanti ancora aperti erano 1, e 216 dei 245
      // problemi erano già riparati. Il conto derivato dalla lista arriva dalla rotta come `conto`.
      const contoSito = sito?.conto;
      const sitoLetto = sito?.collegato && contoSito?.letto !== false && contoSito?.aperti != null;
      const blocc = sitoLetto ? (contoSito?.aperti_per_severita?.bloccante ?? 0) : 0;
      const gravi = sitoLetto ? (contoSito?.aperti_per_severita?.grave ?? 0) : 0;
      const apertiSito = sitoLetto ? (contoSito?.aperti ?? 0) : null;
      setLinks([
        {
          label: "Radiografia macchina",
          vista: "cervello",
          stat: Number.isFinite(votoRad) ? `${votoRad}/100 · ${difetti} aperti` : `${difetti} aperti`,
          semaforo: difetti > 0 || (Number.isFinite(votoRad) && votoRad < 70) ? "giallo" : "verde",
        },
        {
          label: "Auto-coscienza",
          vista: "auto-coscienza",
          stat: Number.isFinite(fiducia) ? `fiducia ${fiducia}/100` : "analisi giro",
          semaforo: Number.isFinite(fiducia) && fiducia < 70 ? "giallo" : "verde",
        },
        {
          label: "Salute sito",
          vista: "salute-sito",
          // ⚪ non è mai un verde: se il conto non si è potuto leggere, il semaforo resta giallo e
          // l'etichetta lo dice, invece di far passare un buco per «tutto a posto».
          stat: !sitoLetto
            ? "conto non leggibile"
            : blocc > 0
              ? `${blocc} ${blocc === 1 ? "bloccante aperto" : "bloccanti aperti"}`
              : apertiSito
                ? `${apertiSito} da riparare`
                : "nessuno aperto",
          semaforo: !sitoLetto ? "giallo" : blocc > 0 ? "rosso" : gravi > 0 ? "giallo" : "verde",
        },
      ]);
    }).catch(() => {
      // AR-256: se qualcosa è andato storto leggendo, i tre collegamenti restano — con etichetta
      // onesta e semaforo grigio. Sparire in silenzio dice a Nicola «non c'è niente da guardare»;
      // restare con «dato non leggibile» dice la verità, e il collegamento continua a funzionare.
      setLinks(LINK_BASE);
    });
  }, []);

  useEffect(() => {
    carica();
    const t = setInterval(carica, 60_000);
    return () => clearInterval(t);
  }, [carica]);

  usePanelSync(["radiografia", "azioni", "memoria", "all"], carica);

  if (!c) return null;

  const demo = !!c.collegato && !!(c as any).demo;
  const okMap: Record<string, boolean> = {
    sensi: demo || !!m?.marketplace_collegato,
    memoria: demo || !!c.collegato,
    cervello: true,
    battito: demo || !!c.vivo,
    mani: demo || !!((c as any).maniEmail && (c as any).maniLive),
    freni: true,
    cabina: true,
    apprend: true,
  };
  const organiStato = ORGANI.map((o) => ({ ...o, ok: okMap[o.okKey] }));
  const problemi = organiStato.filter((o) => !o.ok).length;
  // AR-544 — la memoria ferma VINCE su tutto: dal 30/7 al 4/8 questa riga diceva «🟢 Viva» col
  // battito del worker mentre ogni numero della Cabina era di quattro giorni prima. Il verde di un
  // organo non può coprire il fatto che ciò che Nicola sta guardando è il passato.
  const memoriaFerma = !demo && !!c.memoriaFerma;
  const etaMemoria = c.memoriaFermaOre != null ? etaTesto(c.memoriaFermaOre) : null;
  const salute = memoriaFerma ? "rosso" : (diag?.salute ?? (problemi ? "giallo" : c.vivo ? "verde" : "giallo"));
  const ultimo = c.ultimoGiro ?? c.ultimoBattito;
  const riga = memoriaFerma
    ? `🔴 ${c.memoriaLavora ? "Lavora ma non pubblica" : "Ferma"} · memoria di ${etaMemoria ?? "—"} fa`
    : salute === "verde"
      ? `🟢 Viva · ultimo giro ${ultimo ? istante(ultimo) : "—"}`
      : salute === "rosso"
        ? `🔴 Attenzione · ${problemi || 1} organi da sistemare`
        : `🟡 Ok con note · ${problemi ? `${problemi} organi · ` : ""}ultimo giro ${ultimo ? istante(ultimo) : "—"}`;

  return (
    <section className="card p-3">
      <div className="flex items-start gap-2 flex-wrap mb-2">
        <span className="grid place-items-center w-7 h-7 rounded-lg bg-brand-50 text-brand shrink-0">
          <HeartPulse size={15} />
        </span>
        <div className="min-w-0 flex-1">
          <span className="t-sez text-[15px]">La macchina</span>
          <p className="t-corpo text-[13px] font-medium mt-0.5">{riga}</p>
        </div>
      </div>

      {memoriaFerma && (
        <div role="alert" className="mb-2 rounded-xl border border-red-200 bg-red-50/60 p-2.5 text-[13px] leading-snug text-red-800">
          <b>⛔ La memoria è ferma da {etaMemoria ?? "troppo tempo"}</b>
          {c.pushMemoriaUltimo ? ` (ultima pubblicazione ${istante(c.pushMemoriaUltimo)})` : ""}.{" "}
          {c.memoriaLavora
            ? "La macchina dà segni di vita ma non riesce a pubblicare: i numeri qui sotto sono di allora."
            : "E la macchina non dà segni di vita: i numeri qui sotto sono di allora."}{" "}
          <button type="button" onClick={() => vaiArea("lavori")} className="underline font-semibold whitespace-nowrap">
            Apri la diagnosi con i comandi di sblocco
          </button>
        </div>
      )}

      <div className="flex items-center justify-center gap-1.5 py-1" role="list" aria-label="Stato degli 8 organi">
        {organiStato.map((o) => (
          <button
            key={o.n}
            type="button"
            role="listitem"
            title={`${o.n}: ${o.ok ? "ok" : "da accendere o controllare"}`}
            onMouseEnter={() => setOrganoHover(o.n)}
            onMouseLeave={() => setOrganoHover(null)}
            onFocus={() => setOrganoHover(o.n)}
            onBlur={() => setOrganoHover(null)}
            className="flex flex-col items-center gap-0.5 min-w-[2rem]"
          >
            <span className="text-base leading-none">{o.e}</span>
            <span className={`w-2.5 h-2.5 rounded-full ${o.ok ? "bg-green-500" : "bg-amber-500"}`} />
          </button>
        ))}
      </div>
      {organoHover && (
        <p className="text-center t-eti mt-1">{organoHover}: {organiStato.find((x) => x.n === organoHover)?.ok ? "ok" : "serve attenzione"}</p>
      )}

      <div className="flex flex-wrap gap-2 mt-3">
        {links.map((l) => (
          <button
            key={l.vista}
            type="button"
            onClick={() => vaiArea(l.vista)}
            className="flex-1 min-w-[140px] text-left surface-muted p-2.5 rounded-xl border border-transparent hover:border-brand/30 transition"
          >
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full shrink-0 ${dot(l.semaforo)}`} />
              <span className="text-[12.5px] font-semibold truncate">{l.label}</span>
            </div>
            <span className="block t-eti mt-0.5 tabular-nums">{l.stat}</span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setDettagli((v) => !v)}
        className="mt-2 flex items-center gap-1 t-eti hover:text-brand transition w-full justify-center"
      >
        <ChevronDown size={14} className={`transition ${dettagli ? "rotate-180" : ""}`} />
        {dettagli ? "Nascondi dettagli tecnici" : "Mostra dettagli tecnici"}
      </button>
      {dettagli && diag && (
        <div className="mt-2 rounded-xl border p-2.5 surface-muted text-[12px] space-y-1">
          {diag.checks.map((ch, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full shrink-0 ${dot(ch.stato)}`} />
              <span>{ch.nome}</span>
              <span className="ml-auto t-eti truncate max-w-[50%]">{ch.dettaglio}</span>
            </div>
          ))}
          {c.autopilota != null && (
            <div className="flex items-center gap-1.5 pt-1 border-t border-black/5">
              <Activity size={12} className="text-brand" />
              Autopilota {c.autopilota ? "ON" : "OFF"}
              {c.workerVivo === false && c.vivo ? " · worker spento" : ""}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
