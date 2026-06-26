"use client";

import { useState } from "react";
import { Terminal, ChevronDown, ChevronRight, Sparkles } from "lucide-react";

// Il "menù dei comandi" dell'AD, identico a COMANDI.md ma cliccabile dal pannello.
// Clicca un comando → finisce nella chat qui sotto, pronto da inviare al cervello (Max).
// Tienilo allineato a /COMANDI.md quando aggiungi o cambi un comando.
//
// Layout: ogni reparto è una TENDINA in una griglia (1 colonna su mobile → 4 su
// desktop). Così su web vedi tutti i reparti a colpo d'occhio e su mobile scorri
// tendine compatte. Apri solo il reparto che ti serve: meno scroll, capisci veloce.

type Comando = { cmd: string; desc: string; evidenzia?: boolean; punti?: string[] };
type Reparto = { nome: string; comandi: Comando[] };

const REPARTI: Reparto[] = [
  {
    nome: "📅 Ogni giorno (ritmo)",
    comandi: [
      { cmd: "fai un giro", desc: "Guardo i dati reali, controllo le sentinelle, ti do un briefing." },
      { cmd: "piano del mattino", desc: "Priorità del giorno + una mossa per reparto." },
      { cmd: "report della sera", desc: "Cosa è stato fatto + numeri + cosa c'è da firmare." },
      { cmd: "review della settimana", desc: "Pagella della squadra + cosa migliorare." },
    ],
  },
  {
    nome: "📊 Numeri & soldi",
    comandi: [
      { cmd: "come stiamo?", desc: "Cruscotto: i numeri reali adesso." },
      { cmd: "report KPI", desc: "L'analista ti fa il quadro della settimana." },
      { cmd: "controlla i pagamenti", desc: "La finanza cerca anomalie e payout." },
      { cmd: "proiezione", desc: "Quanto costa e quanto rende." },
    ],
  },
  {
    nome: "🏪 Negozi",
    comandi: [
      { cmd: "porta [nome] LIVE", desc: "La squadra prepara tutto per metterlo online." },
      { cmd: "trovami negozi", desc: "Lista di botteghe da contattare + pitch pronto." },
      { cmd: "negozio in calo", desc: "Piano per recuperare un negozio che vende meno." },
    ],
  },
  {
    nome: "🚀 Crescita & contenuti",
    comandi: [
      { cmd: "lancia una campagna [tema]", desc: "Piano completo (post, grafiche, budget) da approvare." },
      { cmd: "contenuti della settimana", desc: "Calendario + post + reel pronti." },
      { cmd: "fammi [post / volantino / QR] per [X]", desc: "Il designer/AI te lo crea." },
      { cmd: "recupera i carrelli", desc: "La CRM prepara i messaggi per riattivare i clienti." },
    ],
  },
  {
    nome: "🛒 Il sito",
    comandi: [
      { cmd: "cambia il sito: [cosa]", desc: "Config subito, oppure codice con anteprima + tuo ok." },
      { cmd: "audit del marketplace", desc: "Check tecnico rapido: bug/rischi/frizioni principali." },
      { cmd: "radiografia", desc: "Analisi profonda e millimetrica di TUTTO il marketplace (13 dimensioni, ogni problema verificato)." },
    ],
  },
  {
    nome: "🎨 Design & grafica (tutto ciò che si vede)",
    comandi: [
      {
        cmd: "radiografia del design",
        desc: "L'analisi più profonda e completa di tutto ciò che si vede: la squadra design controlla ogni punto qui sotto, verifica ogni problema e ti consegna il report per gravità in consegne/design/.",
        evidenzia: true,
        punti: [
          "Aspetto visivo — Colori · Font/Testo · Spazi · Allineamento · Immagini/foto · Icone · Coerenza visiva (design system)",
          "Disposizione — Layout · Gerarchia visiva · Responsive (mobile)",
          "Esperienza d'uso — Navigazione/Menu · Pulsanti e CTA · Frizioni · Microcopy · Stati (caricamento/vuoto/errore) · Feedback",
          "Punti che fanno soldi — Home · Scheda prodotto · Ricerca e filtri · Carrello · Checkout · Pagina negozio",
          "Qualità invisibile — Accessibilità (a11y) · Velocità percepita",
        ],
      },
      { cmd: "design: [richiesta]", desc: "La squadra design analizza i problemi grafici/UX oppure modifica ciò che chiedi (colori/home/testi subito, layout/componenti con anteprima)." },
      { cmd: "sistema [il punto]", desc: "Dopo la radiografia: correggo una cosa specifica (es. \"sistema i colori della home\")." },
    ],
  },
  {
    nome: "🔎 Mercato",
    comandi: [
      { cmd: "cosa fanno i concorrenti?", desc: "Intelligence sul mondo esterno." },
      { cmd: "che opportunità ci sono?", desc: "Intelligence + growth: eventi, meteo, bandi." },
    ],
  },
  {
    nome: "👥 La squadra",
    comandi: [
      { cmd: "[reparto], fai [X]", desc: "Delego a quel senior (es. \"legale, scrivimi il contratto\")." },
      { cmd: "riunione su [obiettivo]", desc: "Faccio collaborare più reparti a catena." },
      { cmd: "crea un nuovo esperto di [X]", desc: "Aggiungo un nuovo senior alla squadra." },
      { cmd: "migliora [reparto]", desc: "Il prompt-engineer lo affina." },
    ],
  },
  {
    nome: "⚡ Decisioni & azioni",
    comandi: [
      { cmd: "cosa devo decidere?", desc: "Ti mostro la coda delle cose da firmare." },
      { cmd: "ok [numero]", desc: "Eseguo l'azione approvata." },
      { cmd: "collega [Telegram / Gemini / …]", desc: "Ti guido a collegare una \"mano\"." },
      { cmd: "che comandi ho?", desc: "Ti rimostro questo menù." },
    ],
  },
];

export default function Comandi({ onScegli }: { onScegli?: (cmd: string) => void }) {
  const [aperto, setAperto] = useState(false);
  // Quali reparti (tendine) sono aperti. Di default tutti chiusi: vedi prima i
  // titoli a colpo d'occhio, poi apri solo quello che ti serve.
  const [apertiReparti, setApertiReparti] = useState<Set<number>>(new Set());

  const toggleReparto = (i: number) =>
    setApertiReparti((s) => {
      const n = new Set(s);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });
  const tuttiAperti = apertiReparti.size === REPARTI.length;
  const toggleTutti = () =>
    setApertiReparti(tuttiAperti ? new Set() : new Set(REPARTI.map((_, i) => i)));

  return (
    <section className="bg-white rounded-2xl border border-black/[0.06] shadow-card p-4">
      <button onClick={() => setAperto((v) => !v)} className="w-full flex items-center gap-2.5 text-left">
        <span className="grid place-items-center w-8 h-8 rounded-lg bg-brand-50 text-brand shrink-0">
          <Terminal size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <span className="text-[15px] font-semibold tracking-tight">Comandi — cosa puoi dirmi</span>
          <div className="text-xs text-black/40">Apri un reparto e tocca un comando per metterlo nella chat.</div>
        </div>
        <span className="shrink-0 text-black/40">{aperto ? <ChevronDown size={18} /> : <ChevronRight size={18} />}</span>
      </button>

      {aperto && (
        <div className="mt-3">
          <div className="flex justify-end mb-2">
            <button
              onClick={toggleTutti}
              className="text-[11px] font-medium text-black/45 hover:text-brand transition px-2 py-1 rounded-lg hover:bg-brand-50/60"
            >
              {tuttiAperti ? "Chiudi tutti" : "Apri tutti"}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 items-start">
            {REPARTI.map((r, i) => {
              const open = apertiReparti.has(i);
              return (
                <div
                  key={r.nome}
                  className={`rounded-xl border transition ${
                    open ? "border-brand/30 bg-brand-50/20" : "border-black/[0.07] bg-paper/40 hover:border-brand/25"
                  }`}
                >
                  <button
                    onClick={() => toggleReparto(i)}
                    className="w-full flex items-center gap-1.5 text-left px-2.5 py-2"
                    aria-expanded={open}
                  >
                    <span className="text-[12.5px] font-semibold tracking-tight text-ink/85 leading-tight flex-1 min-w-0">
                      {r.nome}
                    </span>
                    <span className="text-[10px] text-black/35 shrink-0 tabular-nums">{r.comandi.length}</span>
                    <span className="shrink-0 text-black/35">
                      {open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                    </span>
                  </button>

                  {open && (
                    <div className="px-2 pb-2 space-y-1.5">
                      {r.comandi.map((c) => (
                        <button
                          key={c.cmd}
                          onClick={() => onScegli?.(c.cmd)}
                          className={`w-full text-left rounded-lg border p-2.5 transition ${
                            c.evidenzia
                              ? "border-brand/40 bg-brand-50/50 hover:bg-brand-50"
                              : "border-black/[0.07] bg-white/70 hover:border-brand/30 hover:bg-brand-50/40"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {c.evidenzia && <Sparkles size={12} className="text-brand shrink-0" />}
                            <code className="text-[12px] font-semibold text-brand bg-white/80 ring-1 ring-brand/15 rounded px-1.5 py-0.5">
                              {c.cmd}
                            </code>
                          </div>
                          <p className="text-[11.5px] text-black/55 mt-1 leading-snug">{c.desc}</p>
                          {c.punti && (
                            <ul className="mt-1.5 space-y-1 border-t border-brand/15 pt-1.5">
                              {c.punti.map((p, k) => (
                                <li key={k} className="text-[11px] text-black/55 leading-snug flex gap-1.5">
                                  <span className="text-brand shrink-0">•</span>
                                  <span>{p}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-black/40 leading-relaxed px-1 mt-3">
            💡 Non sono rigidi: scrivimi come ti viene, ti capisco lo stesso. Puoi sempre inventarne di nuovi
            («d'ora in poi quando scrivo X fai Y») e li aggiungo qui.
          </p>
        </div>
      )}
    </section>
  );
}
