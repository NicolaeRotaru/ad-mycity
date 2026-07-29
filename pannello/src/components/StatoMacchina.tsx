"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { usePanelSync } from "@/lib/panel-sync";
import { leggiDato, collegatoFalso, organo, migliore, VERDETTO_INIZIALE, type Verdetto, type Organo } from "@/lib/verdetto-dato";

type Cuore = {
  collegato: boolean;
  demo?: boolean;
  ultimoBattito: string | null;
  ultimoGiro?: string | null;
  workerVivo?: boolean;
  vivo?: boolean;
  autopilota: boolean;
  ai: boolean;
  maniEmail: boolean;
  maniLive: boolean;
};

type Senior = { vivi?: number; fermi?: number; totale_agenti?: number; con_almeno_un_esito?: number };

// 🧬 Stato della macchina — gli 8 organi.
//
// AR-406 — QUATTRO ORGANI SU OTTO ERANO VERDI PER COSTANTE. Cervello, Freni, Cabina e Apprendimento
// avevano `ok: true` scritto nel codice: restavano ✅ anche a macchina spenta, e nessuno se ne
// accorgeva perché una casella verde non genera lamentele. Gli altri quattro dipendevano da due
// fetch con `.catch(() => {})`: a rete caduta mostravano «da collegare» — cioè un problema di
// configurazione — mentre la verità era «non lo so».
//
// La regola adesso è una sola, e la applica `organo()` in lib/verdetto-dato.ts: per essere verde un
// pallino deve avere (a) una FONTE dichiarata, (b) una lettura riuscita, (c) una misura vera. Se ne
// manca una è ⚪ «non misurato» — grigio. Non esiste più un modo di scrivere `ok: true` a mano.
export default function StatoMacchina() {
  const [c, setC] = useState<Cuore | null>(null);
  const [m, setM] = useState<Record<string, any> | null>(null);
  const [s, setS] = useState<Senior | null>(null);
  const [vc, setVc] = useState<Verdetto>(VERDETTO_INIZIALE);
  const [vm, setVm] = useState<Verdetto>(VERDETTO_INIZIALE);
  const [vs, setVs] = useState<Verdetto>(VERDETTO_INIZIALE);

  const carica = useCallback(() => {
    // `/api/cuore` NON passa da `collegatoFalso`: lì `collegato` significa «memoria Supabase
    // collegata» ed è uno dei dati serviti, non la dichiarazione di una lettura fallita.
    leggiDato<Cuore>("/api/cuore", { estrai: (b) => b as Cuore, eVuoto: () => false }).then((r) => {
      setC(r.dato);
      setVc(r.verdetto);
    });
    leggiDato<Record<string, any>>("/api/metriche", { estrai: (b) => b, eVuoto: () => false }).then((r) => {
      setM(r.dato);
      setVm(r.verdetto);
    });
    // Il sensore che mancava al Cervello: quanti senior hanno prodotto un ESITO vero (chiusura-loop).
    leggiDato<Senior>("/api/memoria/utilizzo-senior", { estrai: (b) => b as Senior, eVuoto: () => false, cieco: collegatoFalso }).then((r) => {
      setS(r.dato);
      setVs(r.verdetto);
    });
  }, []);

  useEffect(() => { carica(); }, [carica]);
  usePanelSync(["memoria", "all"], carica);

  const demo = !!c?.demo;
  // In demo la macchina si mostra "tutta accesa" (di esempio): la nota lo dichiara sempre.
  const organi: { e: string; n: string; d: string; o: Organo }[] = [
    {
      e: "👁️", n: "Sensi", d: "legge i dati veri",
      o: organo({
        fonte: "/api/metriche · marketplace_collegato",
        lettura: vm,
        misura: demo ? true : m ? Boolean(m.marketplace_collegato) : null,
        notaAcceso: demo ? "dati di esempio (demo)" : "dati collegati",
        notaSpento: "da collegare",
      }),
    },
    {
      e: "🧠", n: "Memoria", d: "ricorda tutto (il vault)",
      o: organo({
        fonte: "/api/cuore · collegato",
        lettura: vc,
        misura: demo ? true : c ? Boolean(c.collegato) : null,
        notaAcceso: demo ? "di esempio (demo)" : "collegata",
        notaSpento: "da collegare",
      }),
    },
    {
      e: "💡", n: "Cervello", d: "i senior + l'AD",
      // Prima: `ok: true` fisso. Adesso il verde arriva SOLO da senior che hanno chiuso un loop.
      o: organo({
        fonte: "/api/memoria/utilizzo-senior · vivi",
        lettura: vs,
        misura: s && typeof s.vivi === "number" ? s.vivi > 0 : null,
        notaAcceso: `${s?.vivi ?? 0} senior con esiti recenti`,
        notaSpento: "nessun senior ha chiuso un loop",
        notaNonMisurato: "non misurato: la sonda del giro non ha ancora scritto chiusura-loop.json",
      }),
    },
    {
      e: "🫀", n: "Battito", d: "lavora da solo, su orari",
      o: organo({
        fonte: "/api/cuore · vivo",
        lettura: vc,
        misura: demo ? true : c ? Boolean(c.vivo) : null,
        notaAcceso: demo ? "autopilota ON (demo)" : `ultimo giro ${c?.ultimoGiro ? "recente" : "—"} · worker ${c?.workerVivo ? "ON" : "spento"}`,
        notaSpento: "non ancora battuto",
      }),
    },
    {
      e: "✋", n: "Mani", d: "agisce nel mondo (email…)",
      o: organo({
        fonte: "/api/cuore · maniEmail + maniLive",
        lettura: vc,
        misura: demo ? true : c ? Boolean(c.maniEmail && c.maniLive) : null,
        notaAcceso: demo ? "simulate, 0 invii reali (demo)" : "email LIVE",
        notaSpento: c?.maniEmail ? "email pronta (test)" : "da collegare",
      }),
    },
    {
      e: "🛡️", n: "Freni", d: "🟢🟡🔴 + tetti + STOP",
      // Prima: `ok: true` con nota "attivi" — una dichiarazione, non una misura. I freni veri stanno
      // nel cervello (cancelli, tetti, firma) e da qui NON si leggono: nessun sensore, quindi ⚪.
      o: organo({
        fonte: "",
        lettura: vc,
        notaNonMisurato: "non misurato da qui: i cancelli girano nel cervello, non nel Pannello",
      }),
    },
    {
      e: "🎛️", n: "Cabina", d: "tu vedi e approvi",
      // Prima: `ok: true` con nota "attiva" (la pagina che lo dice di sé). Adesso è una misura vera:
      // le API del Pannello hanno risposto a questa scheda, oppure no.
      o: organo({
        fonte: "risposta delle API del Pannello",
        lettura: migliore(vc, vm, vs),
        misura: migliore(vc, vm, vs).misurato,
        notaAcceso: "le API del Pannello rispondono",
        notaSpento: "le API del Pannello non rispondono",
      }),
    },
    {
      e: "🔁", n: "Apprendimento", d: "impara dai propri errori",
      // Prima: `ok: true` + «lezioni attive» stampato a prescindere. Il tasso di lezioni APPLICATE
      // non è servito da nessuna rotta di questa scheda: finché non c'è il sensore, resta ⚪.
      o: organo({
        fonte: "",
        lettura: vc,
        notaNonMisurato: "non misurato: manca il sensore sul tasso di lezioni applicate",
      }),
    },
  ];

  const anelloCls = (o: Organo) =>
    o.stato === "acceso" ? "ring-1 ring-green-200/50" : o.stato === "spento" ? "ring-1 ring-amber-200/50" : "ring-1 ring-black/10 opacity-80";

  const nonMisurati = organi.filter((x) => x.o.stato === "non-misurato").length;

  return (
    <section className="card p-4">
      <div className="sez-head mb-3">
        <span className="sez-ico"><Activity size={16} /></span>
        <span className="t-sez">Stato della macchina — gli 8 organi</span>
        {nonMisurati > 0 && (
          <span className="ml-auto t-eti text-[11px]" title="Un organo grigio non è un organo sano: è un organo che non ho potuto misurare.">
            ⚪ {nonMisurati} non misurati
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {organi.map(({ e, n, d, o }) => (
          <div key={n} className={`kpi-tile ${anelloCls(o)}`}>
            <div className="flex items-center gap-1.5">
              <span>{e}</span>
              <span className="text-[12.5px] font-semibold" style={{ color: "var(--text-primary)" }}>{n}</span>
              <span className="ml-auto text-[12px]" title={o.fonte ? `Fonte: ${o.fonte}` : "Nessuna fonte dichiarata"}>{o.icona}</span>
            </div>
            <div className="kpi-tile-label mt-0.5 normal-case">{d}</div>
            <div className="frase-lista-rest text-[11px] mt-0.5">{o.nota}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
