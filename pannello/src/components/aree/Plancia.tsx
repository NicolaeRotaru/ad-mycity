"use client";

import { useCallback, useEffect, useState } from "react";
import { PenLine, ShieldAlert, ListTodo, TrendingUp, Package, Euro, Truck, Users, Star, ShoppingCart, Clock, Footprints, FileText, Store } from "lucide-react";
import { KIT_CAMPO_BOTTEGHE } from "@/lib/kit-campo-botteghe";
import { totaleProspect } from "@/lib/lista-prospect-centro";
import { formatta, etichettaRitmo, ritmoEODoggi, type Tipo } from "@/lib/format";
import { RitmoTesto } from "@/components/RitmoTesto";
import ParlaCasella from "@/components/ParlaCasella";
import Aggiornato from "@/components/Aggiornato";
import FraseLista from "@/components/FraseLista";
import { vaiArea } from "@/lib/nav";
import { usePanelSync } from "@/lib/panel-sync";
import {
  leggiDato,
  collegatoFalso,
  fraseVuoto,
  badgeConteggio,
  piuRecente,
  VERDETTO_INIZIALE,
  type Verdetto,
} from "@/lib/verdetto-dato";
import { codiceAzione, pulisciTitolo } from "@/lib/azioni-attesa";
import MacchinaHomeCard from "@/components/MacchinaHomeCard";
import LetteraAdCard from "@/components/LetteraAdCard";
import Bacheca from "@/components/Bacheca";
import HomeSezione from "@/components/HomeSezione";
import ListaProspectHome from "@/components/ListaProspectHome";
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

function anteprimaRitmo(testo: string, max = 72): string {
  const flat = testo.replace(/\*\*/g, "").replace(/@\w+(-\w+)*/g, "").replace(/\n+/g, " ").trim();
  if (!flat) return "";
  return flat.length > max ? `${flat.slice(0, max)}…` : flat;
}

/** Mattino o sera: una riga chiusa, testo completo + chat solo se apri. */
function RitmoVocePieghevole({ emoji, label, voce, parlaTitolo }: { emoji: string; label: string; voce: Voce; parlaTitolo: string }) {
  const [aperto, setAperto] = useState(false);
  if (!voce) {
    return (
      <div className="rounded-lg border border-black/[0.06] px-3 py-1.5 t-eti text-[12px]">
        {emoji} {label} — non ancora scritto oggi
      </div>
    );
  }
  const ok = ritmoEODoggi(voce.data);
  const anteprima = anteprimaRitmo(voce.testo);
  return (
    <details
      className="rounded-lg border border-black/[0.07] bg-paper/30 group"
      onToggle={(e) => setAperto(e.currentTarget.open)}
    >
      <summary className="flex items-start gap-2 px-3 py-2 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[12.5px] font-medium" style={{ color: "var(--text-primary)" }}>{emoji} {label}</span>
            <span className={`badge ml-auto shrink-0 ${ok ? "badge-on" : "badge-off"}`}>{etichettaRitmo(voce.data)}</span>
          </div>
          {anteprima && <p className="t-eti text-[11px] truncate mt-0.5 group-open:hidden">{anteprima}</p>}
        </div>
      </summary>
      <div className="px-3 pb-2 pt-0 border-t border-black/[0.05] space-y-2">
        <RitmoTesto testo={voce.testo} />
        {aperto && (
          <ParlaCasella
            titolo={parlaTitolo}
            contesto={[voce.data && `Data: ${voce.data}`, voce.testo].filter(Boolean).join("\n")}
          />
        )}
      </div>
    </details>
  );
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
  // AR-401 — un verdetto per fonte. `VERDETTO_INIZIALE` è «cieco: non l'ho ancora letto»: al primo
  // render la home non parte da «vuoto», perché non ha ancora guardato niente.
  const [fonti, setFonti] = useState<Record<string, Verdetto>>({});
  // AR-237 — la data VERA di ogni fonte (`dato_al`), non l'ora in cui ho chiesto.
  const [dateFonti, setDateFonti] = useState<Record<string, string | null>>({});

  const carica = useCallback(() => {
    // AR-401 — le sei letture passano TUTTE dallo stesso confine (`leggiDato` → `verdettoLettura`).
    // Prima cinque su sei erano `fetch().then(r => r.json()).catch(() => {})`: `r.ok` mai guardato,
    // una 500 che arriva col suo corpo non fa nemmeno scattare il catch, e a schermo restava
    // «Nessun allarme. Tutto ok.» su un dato mai letto. Il verdetto adesso lo calcola il modulo:
    // qui si disegna soltanto.
    const segna = (k: string, v: Verdetto, quando?: unknown) => {
      setFonti((p) => ({ ...p, [k]: v }));
      setDateFonti((p) => ({ ...p, [k]: v.misurato ? (quando != null ? String(quando) : null) : null }));
    };

    leggiDato<Azione[]>("/api/azioni-pronte", { estrai: (c) => c.azioni, cieco: collegatoFalso }).then((r) => {
      setAzioni(r.dato || []);
      segna("azioni", r.verdetto, r.corpo?.dato_al);
    });
    leggiDato<Alert[]>("/api/alert", { estrai: (c) => c.alert, cieco: collegatoFalso }).then((r) => {
      setAlerts(r.dato || []);
      segna("alert", r.verdetto);
    });
    leggiDato<Todo[]>("/api/memoria/todo", { estrai: (c) => c.items, cieco: collegatoFalso }).then((r) => {
      setTodo(r.dato || []);
      segna("todo", r.verdetto, r.corpo?.dato_al);
    });
    leggiDato<Mossa[]>("/api/memoria/intenzioni", { estrai: (c) => c.prossime_mosse, cieco: collegatoFalso }).then((r) => {
      setMosse(r.dato || []);
      segna("mosse", r.verdetto);
    });
    leggiDato<{ pianoMattino: Voce; reportSera: Voce }>("/api/ritmo", {
      estrai: (c) => ({ pianoMattino: c.pianoMattino ?? null, reportSera: c.reportSera ?? null }),
      eVuoto: (d) => !d.pianoMattino && !d.reportSera,
      cieco: collegatoFalso,
    }).then((r) => {
      setRitmo(r.dato || { pianoMattino: null, reportSera: null });
      segna("ritmo", r.verdetto, piuRecente([r.dato?.pianoMattino?.data, r.dato?.reportSera?.data]));
    });
    leggiDato<Doc[]>("/api/consegne", { estrai: (c) => c.recenti, cieco: collegatoFalso }).then((r) => {
      setDocumenti(r.dato || []);
      segna("consegne", r.verdetto, r.corpo?.dato_al);
    });
  }, []);

  const v = (k: string): Verdetto => fonti[k] || VERDETTO_INIZIALE;
  // La targhetta parla dell'ETÀ DEL DATO più recente che ho in mano, non dell'ora in cui ho chiesto.
  const datoAl = piuRecente(Object.values(dateFonti));

  useEffect(() => {
    carica();
    const id = setInterval(carica, 60000);
    return () => clearInterval(id);
  }, [carica]);

  usePanelSync(["azioni", "memoria", "all"], carica);

  // AR-233 (conservato) + AR-401: «coda cieca» non è più uno stato a parte cablato a mano sulla
  // singola fetch — è il verdetto del modulo. Il ramo che stampa il pollice in su resta dietro il bivio.
  const codaCieca = v("azioni").misurato ? "" : v("azioni").motivo;

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

  const ritmoAggiornatoOggi = ritmoEODoggi(ritmo.pianoMattino?.data) && ritmoEODoggi(ritmo.reportSera?.data);
  const ritmoRiassunto = v("ritmo").misurato
    ? [
        ritmo.pianoMattino ? `Mattino ${etichettaRitmo(ritmo.pianoMattino.data)}` : "Mattino —",
        ritmo.reportSera ? `Sera ${etichettaRitmo(ritmo.reportSera.data)}` : "Sera —",
      ].join(" · ")
    : fraseVuoto(v("ritmo"), { vuoto: "" });

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="t-area text-[18px] sm:text-[20px]">🏠 Cosa conta ora</h2>
          <p className="t-eti mt-0.5 hidden sm:block">Decidi in 10 secondi — tocca un blocco per il dettaglio.</p>
        </div>
        {/* AR-237 — la targhetta dice di QUANDO SONO I DATI (dato_al delle fonti), non l'ora in cui
            il browser ha chiesto: su una fonte ferma da giorni diventa ambra invece di dire «adesso». */}
        <Aggiornato dataDato={datoAl} className="shrink-0" />
      </div>

      {/* 1 · Da fare adesso: firmare + allarmi in evidenza */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <button onClick={() => vaiAzioni("approvare")} className="card-priorita hover:border-brand/30 !p-2.5">
          <div className="flex items-center gap-1.5">
            <span className="sez-ico w-7 h-7"><PenLine size={15} /></span>
            <span className="t-sez text-[14px]">Da firmare</span>
            <span className={`badge ml-auto ${badgeConteggio(v("azioni"), daFirmare.length).acceso ? "badge-on" : "badge-off"}`}>{badgeConteggio(v("azioni"), daFirmare.length).testo}</span>
          </div>
          <div className="mt-1.5 space-y-0.5">
            {daFirmare.length === 0 &&
              (codaCieca ? (
                <p className="t-eti text-[12px] text-amber-600">⚠️ Non lo so: {codaCieca}. Riprova fra poco.</p>
              ) : (
                <p className="t-eti text-[12px]">Niente da firmare. 👍</p>
              ))}
            {daFirmare.slice(0, 2).map((a) => (
              <div key={a.id} className="flex items-start gap-1 t-riga text-[12.5px]">
                <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${dotCls(a.livello)}`} />
                <span className="mt-0.5 shrink-0 font-mono text-[9px] font-bold text-brand tabular-nums" title="Codice casella">{codiceAzione(a.id)}</span>
                <FraseLista testo={pulisciTitolo(a.titolo)} />
              </div>
            ))}
            {daFirmare.length > 2 && <p className="t-eti text-[11px]">+{daFirmare.length - 2} altre…</p>}
          </div>
        </button>

        <button onClick={() => vaiAzioni("sentinelle")} className="card-priorita hover:border-brand/30 !p-2.5">
          <div className="flex items-center gap-1.5">
            <span className="sez-ico w-7 h-7"><ShieldAlert size={15} /></span>
            <span className="t-sez text-[14px]">Allarmi</span>
            <span className={`badge ml-auto ${badgeConteggio(v("alert"), alerts.length).acceso ? "badge-on" : "badge-off"}`}>{badgeConteggio(v("alert"), alerts.length).testo}</span>
          </div>
          <div className="mt-1.5 space-y-0.5">
            {alerts.length === 0 && (
              <p className={`t-eti text-[12px] ${v("alert").misurato ? "" : "text-amber-600"}`}>
                {fraseVuoto(v("alert"), { vuoto: "Nessun allarme. Tutto ok." })}
              </p>
            )}
            {alerts.slice(0, 2).map((al, i) => (
              <div key={i} className="flex items-start gap-1.5 t-riga text-[12.5px]">
                <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${dotCls(al.livello)}`} />
                <FraseLista testo={al.titolo} />
              </div>
            ))}
            {alerts.length > 2 && <p className="t-eti text-[11px]">+{alerts.length - 2} altri…</p>}
          </div>
        </button>

        <button onClick={() => vaiAzioni("mosse")} className="card-priorita hover:border-brand/30 !p-2.5">
          <div className="flex items-center gap-1.5">
            <span className="sez-ico w-7 h-7"><Footprints size={15} /></span>
            <span className="t-sez text-[14px]">Mosse</span>
            <span className={`badge ml-auto ${badgeConteggio(v("mosse"), mosseOrd.length).acceso ? "badge-on" : "badge-off"}`}>{badgeConteggio(v("mosse"), mosseOrd.length).testo}</span>
          </div>
          <div className="mt-1.5 space-y-0.5">
            {mosseOrd.length === 0 && (
              <p className={`t-eti text-[12px] ${v("mosse").misurato ? "" : "text-amber-600"}`}>
                {fraseVuoto(v("mosse"), { vuoto: "Nessuna mossa in agenda." })}
              </p>
            )}
            {mosseOrd.slice(0, 2).map((m, i) => (
              <div key={i} className="flex items-start gap-1.5 t-riga text-[12.5px]">
                <span className="mt-0.5 shrink-0 text-sm">{m.colore || "•"}</span>
                <FraseLista testo={pulisciTitolo(m.titolo)} />
              </div>
            ))}
          </div>
        </button>

        <button onClick={() => vaiAzioni("dafare")} className="card-priorita hover:border-brand/30 !p-2.5">
          <div className="flex items-center gap-1.5">
            <span className="sez-ico w-7 h-7"><ListTodo size={15} /></span>
            <span className="t-sez text-[14px]">Da fare</span>
            <span className={`badge ml-auto ${badgeConteggio(v("todo"), daFare.length).acceso ? "badge-on" : "badge-off"}`}>{badgeConteggio(v("todo"), daFare.length).testo}</span>
          </div>
          <div className="mt-1.5 space-y-0.5">
            {daFare.length === 0 && (
              <p className={`t-eti text-[12px] ${v("todo").misurato ? "" : "text-amber-600"}`}>
                {fraseVuoto(v("todo"), { vuoto: "Nessuna cosa in sospeso." })}
              </p>
            )}
            {daFare.slice(0, 2).map((t) => (
              <div key={t.id} className="flex items-start gap-1.5 t-riga text-[12.5px]">
                <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${dotCls(t.livello)}`} />
                <FraseLista testo={t.testo} />
              </div>
            ))}
          </div>
        </button>
      </div>

      {/* Kit campo + mappa prospect — kit sempre visibile, lista pieghevole */}
      <section className="card p-3">
        <div className="sez-head mb-2">
          <span className="sez-ico w-7 h-7"><Store size={15} /></span>
          <span className="t-sez text-[15px]">Botteghe e prospect</span>
          <span className="ml-auto t-eti text-[11px]">{totaleProspect()} locali</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 mb-2">
          {KIT_CAMPO_BOTTEGHE.map((k) => (
            <button
              key={k.file}
              type="button"
              onClick={() => vaiArea("memoria", undefined, `archivio/${k.file}`)}
              className="text-left surface-muted p-2 rounded-xl hover:border-brand/30 border border-transparent transition flex items-center gap-2 min-h-[44px]"
            >
              <span className="text-base shrink-0">{k.emoji}</span>
              <span className="min-w-0">
                <span className="block text-[12.5px] font-medium truncate" style={{ color: "var(--text-primary)" }}>{k.titolo}</span>
                <span className="block t-eti text-[10px] truncate">{k.sottotitolo}</span>
              </span>
            </button>
          ))}
        </div>
        <details className="rounded-xl border border-black/[0.07] bg-paper/30 group">
          <summary className="flex items-center gap-2 px-3 py-2 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
            <span className="text-[13px] font-medium flex-1" style={{ color: "var(--text-primary)" }}>
              Mappa prospect
              <span className="ml-1.5 t-eti font-normal">({totaleProspect()} locali)</span>
            </span>
            <span className="t-eti text-[11px] hidden sm:inline">apri la categoria che ti serve</span>
          </summary>
          <div className="px-3 pb-2.5 pt-0 border-t border-black/[0.05]">
            <ListaProspectHome />
          </div>
        </details>
      </section>

      {/* 2 · Ritmo del giorno — chiuso di default; mattino/sera a accordion */}
      {(ritmo.pianoMattino || ritmo.reportSera || !v("ritmo").misurato) && (
        <HomeSezione
          icon={<Clock size={15} />}
          titolo="Ritmo del giorno"
          riassunto={ritmoRiassunto}
          defaultOpen={false}
          badge={
            !ritmoAggiornatoOggi ? (
              <span className="badge badge-off text-[10px]">da aggiornare</span>
            ) : undefined
          }
        >
          <div className="space-y-1.5">
            <RitmoVocePieghevole emoji="🌅" label="Piano del mattino" voce={ritmo.pianoMattino} parlaTitolo="Piano del mattino" />
            <RitmoVocePieghevole emoji="🌙" label="Report della sera" voce={ritmo.reportSera} parlaTitolo="Report della sera" />
          </div>
        </HomeSezione>
      )}

      {/* 3 · Lettera dell'AD */}
      <LetteraAdCard />

      {/* 3b · Bacheca — informazioni da sapere (vault: 90-Memoria-AI/BACHECA.md) */}
      <Bacheca />

      {/* 4 · KPI chiave — griglia densa, tutto visibile */}
      <section className="card p-3">
        <div className="sez-head mb-2">
          <span className="sez-ico w-7 h-7"><TrendingUp size={15} /></span>
          <span className="t-sez text-[15px]">Numeri che contano</span>
          <button onClick={() => onVaiA?.("numeri")} className="ml-auto t-eti hover:text-brand transition text-[12px]">tutti →</button>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
          {KPI_CHIAVE.map((k) => {
            const v = cell(k.chiave, k.tipo);
            const on = v !== "—";
            return (
              <div key={k.chiave} className={`kpi-tile !p-2 ${on ? "" : "kpi-tile-off"}`}>
                <div className="kpi-tile-label text-[10px]">
                  <span className={on ? "text-brand" : ""} style={on ? undefined : { color: "var(--text-faint)" }}>{k.icon}</span>
                  <span className="truncate">{k.label}</span>
                </div>
                <div className={`kpi-tile-value text-[16px] ${on ? "" : "kpi-tile-value-off"}`}>{v}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5 · Macchina (card unica) */}
      <MacchinaHomeCard />

      <Volano />

      {/* Resto · documenti recenti — chiuso di default, riassunto in header */}
      <HomeSezione
        icon={<FileText size={15} />}
        titolo="Report & piani dell'AD"
        riassunto={
          documenti.length === 0
            ? fraseVuoto(v("consegne"), { vuoto: "Radiografie e piani compaiono qui quando l'AD li produce." })
            : `${documenti.length} documenti recenti — tocca per aprire l'elenco`
        }
        defaultOpen={documenti.length === 0}
        badge={
          documenti.length > 0 ? (
            <span className={`badge ${documenti.length ? "badge-on" : "badge-off"}`}>{documenti.length}</span>
          ) : undefined
        }
      >
        <div className="flex items-center justify-end mb-2">
          <button onClick={() => vaiArea("memoria", undefined, "archivio")} className="t-eti hover:text-brand transition text-[12px]">tutti i documenti →</button>
        </div>
        {documenti.length === 0 ? (
          <p className={`t-eti ${v("consegne").misurato ? "" : "text-amber-600"}`}>
            {fraseVuoto(v("consegne"), { vuoto: "Le radiografie e i piani che l'AD produce compaiono qui." })}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {documenti.slice(0, 4).map((d) => (
              <button
                key={d.file}
                onClick={() => vaiArea("memoria", undefined, `archivio/${d.file}`)}
                className="text-left surface-muted p-2.5 rounded-xl hover:border-brand/30 border border-transparent transition flex items-start gap-2"
              >
                <span className="mt-0.5 text-black/40 shrink-0"><FileText size={14} /></span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-medium truncate" style={{ color: "var(--text-primary)" }}>{d.titolo}</span>
                  <span className="block t-eti mt-0.5 truncate text-[11px]">{d.etichetta}{d.data ? ` · ${dataItBreve(d.data)}` : ""}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </HomeSezione>
    </div>
  );
}
