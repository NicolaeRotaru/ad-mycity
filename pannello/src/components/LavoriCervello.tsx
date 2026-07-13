"use client";

import { useEffect, useMemo, useState } from "react";
import { Brain, ChevronDown, ChevronRight, MessageSquare, Trash2, Ban } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { faRelativo } from "@/lib/format";
import ChatCasella from "@/components/ChatCasella";
import { emitSync } from "@/lib/panel-sync";
import {
  type LavoroBase,
  leggiMappaGruppiLocali,
  messaggiDaLavoro,
  raggruppaLavori,
  titoloLavoro,
} from "@/lib/lavori-gruppo";

const LAVORO_STATO: Record<string, { label: string; cls: string }> = {
  in_attesa: { label: "⏳ In attesa", cls: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-800" },
  in_corso: { label: "⚙️ In corso", cls: "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-800" },
  fatto: { label: "✅ Fatto", cls: "bg-green-50 text-green-700 ring-green-200 dark:bg-green-950/40 dark:text-green-300 dark:ring-green-800" },
  // Un lavoro fallito NON è un "errore" morto: è pronto per essere riapprovato (un clic → torna
  // in coda). Lo mostriamo come stato d'attesa (ambra), non come allarme rosso. (fix #6)
  errore: { label: "🔄 Da riapprovare", cls: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-800" },
  annullato: { label: "🚫 Annullato", cls: "bg-black/5 text-black/50 ring-black/10 dark:bg-white/10 dark:text-white/50 dark:ring-white/15" },
};

type Props = {
  lavori: LavoroBase[];
  onSvuota: () => void;
  /** Dentro l'area Lavori: senza intestazione esterna duplicata */
  embedded?: boolean;
  workerVivo?: boolean | null;
  adInPausa?: boolean;
};

function statoBadge(stato: string) {
  const s = LAVORO_STATO[stato] || { label: stato, cls: "bg-black/5 ring-black/10 text-black/60 dark:bg-white/10 dark:text-white/60" };
  return (
    <span className={`px-2 py-0.5 rounded-full ring-1 font-medium text-xs ${s.cls}`}>{s.label}</span>
  );
}

// Un lavoro in_attesa con riprova_dopo nel FUTURO non è bloccato: sta aspettando il ritentativo
// automatico (auto-recovery). Torna l'istante del prossimo tentativo, o null.
function attendeRitentativo(lv: LavoroBase): number | null {
  if (lv.stato !== "in_attesa" || !lv.riprova_dopo) return null;
  const t = new Date(lv.riprova_dopo).getTime();
  return !isNaN(t) && t > Date.now() ? t : null;
}

export default function LavoriCervello({ lavori, onSvuota, embedded = false, workerVivo, adInPausa }: Props) {
  // [fix radiografia-pannello 2026-07-03 — perf: useMemo con dip [lavori] rileggeva localStorage a ogni tick
  // ma NON reagiva ai veri cambi della mappa-gruppi. Ora è stato reattivo, riletto solo sugli eventi giusti.]
  const [mappa, setMappa] = useState<Record<string, string>>({});
  useEffect(() => {
    if (typeof window === "undefined") return;
    const aggiorna = () => setMappa(leggiMappaGruppiLocali());
    aggiorna();
    window.addEventListener("mycity:lavori", aggiorna);
    window.addEventListener("storage", aggiorna);
    return () => {
      window.removeEventListener("mycity:lavori", aggiorna);
      window.removeEventListener("storage", aggiorna);
    };
  }, []);
  const [apertiGruppi, setApertiGruppi] = useState<Record<string, boolean>>({});
  const [apertiLavori, setApertiLavori] = useState<Record<string, boolean>>({});
  const [dettagliLavori, setDettagliLavori] = useState<Record<string, LavoroBase>>({});
  const [caricamentoDettaglio, setCaricamentoDettaglio] = useState<Record<string, boolean>>({});
  // Chat in-place per gruppo: la casella È una chat che si apre/chiude SUL POSTO (niente salto all'Assistente).
  const [chatAperta, setChatAperta] = useState<Record<string, boolean>>({});

  const gruppi = useMemo(() => raggruppaLavori(lavori, mappa), [lavori, mappa]);

  // Auto-guarigione: riapprova un'azione APPROVATA ma FALLITA (worker giù). Un clic → nuovo lavoro in coda.
  const [riprovati, setRiprovati] = useState<Record<string, "invio" | "fatto" | "errore">>({});
  async function riprova(id: string) {
    setRiprovati((s) => ({ ...s, [id]: "invio" }));
    try {
      const res = await fetch("/api/riprova", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      // [fix radiografia-pannello 2026-07-03 — «Riprova» restava in errore + 409 non mostrato]
      // 409 = il backend l'ha GIÀ rimessa in coda (idempotenza): è comunque "in coda", non un errore.
      const ok = res.ok || res.status === 409;
      setRiprovati((s) => ({ ...s, [id]: ok ? "fatto" : "errore" }));
      // Il backend porta il vecchio lavoro a "fatto": rinfresca subito la lista così esce da "errore"
      // e la card non resta stale fino al prossimo poll.
      if (ok) emitSync("lavori");
    } catch {
      setRiprovati((s) => ({ ...s, [id]: "errore" }));
    }
  }
  // Annulla un lavoro ancora in coda (in_attesa) o fallito (errore): un clic → esce dalla coda.
  // Il server annulla SOLO ciò che non è ancora partito (CAS atomico): se il worker l'ha già preso,
  // torna "giaCorso" e lo spieghiamo, senza fingere di averlo fermato.
  const [annullati, setAnnullati] = useState<Record<string, "invio" | "fatto" | "giaCorso" | "errore">>({});
  async function annulla(id: string) {
    setAnnullati((s) => ({ ...s, [id]: "invio" }));
    try {
      const res = await fetch("/api/lavori/annulla", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const j = await res.json().catch(() => ({} as any));
      if ((res.ok && j?.ok) || j?.giaAnnullato) {
        setAnnullati((s) => ({ ...s, [id]: "fatto" }));
        emitSync("lavori");
      } else if (j?.giaInCorso) {
        setAnnullati((s) => ({ ...s, [id]: "giaCorso" }));
      } else {
        setAnnullati((s) => ({ ...s, [id]: "errore" }));
      }
    } catch {
      setAnnullati((s) => ({ ...s, [id]: "errore" }));
    }
  }
  // Bottone Annulla per un lavoro annullabile (in_attesa o errore). Reso null negli altri casi.
  function bottoneAnnulla(lv: LavoroBase) {
    if (lv.stato !== "in_attesa" && lv.stato !== "errore" && lv.stato !== "in_corso") return null;
    const st = annullati[lv.id];
    if (st === "fatto") return null; // sparirà al refresh; nel frattempo non mostrare più il bottone
    if (st === "giaCorso") {
      return (
        <span className="shrink-0 self-center mr-2.5 text-[11px] text-amber-700 dark:text-amber-400" title="Il worker lo sta già eseguendo">
          già in esecuzione
        </span>
      );
    }
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          annulla(lv.id);
        }}
        disabled={st === "invio"}
        className="shrink-0 self-center mr-2.5 inline-flex items-center gap-1 text-[11px] font-medium border border-black/10 dark:border-white/15 text-black/50 dark:text-white/50 rounded-lg px-2.5 py-1.5 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-black/70 dark:hover:text-white/70 transition disabled:opacity-50"
        title="Annulla questo lavoro: se non è ancora partito, esce dalla coda"
      >
        <Ban size={12} />
        {st === "invio" ? "Annullo…" : st === "errore" ? "Riprova" : "Annulla"}
      </button>
    );
  }
  function motivoBreve(risultato?: string): string {
    const righe = (risultato || "").split("\n").map((r) => r.trim()).filter(Boolean);
    const worker = [...righe].reverse().find((r) => /\[worker\]|timeout|rc=|errore|error|motore/i.test(r));
    return (worker || righe[righe.length - 1] || "il worker non ha lasciato dettagli").slice(0, 160);
  }

  const codaBloccata = lavori.some((lv) => {
    if (attendeRitentativo(lv)) return false; // aspetta il ritentativo programmato: non è "bloccato"
    const t = new Date(lv.updated_at || lv.created_at).getTime();
    if (isNaN(t)) return false;
    if (lv.stato === "in_attesa") return Date.now() - t > 3 * 60 * 1000;
    if (lv.stato === "in_corso") return Date.now() - t > 10 * 60 * 1000;
    return false;
  });

  const orfani = lavori.some((lv) => {
    if (lv.stato !== "in_corso") return false;
    const t = new Date(lv.updated_at || lv.created_at).getTime();
    return !isNaN(t) && Date.now() - t > 10 * 60 * 1000;
  });

  const cervelloSpento = codaBloccata && workerVivo === false;
  // (fix #5) Coda ferma MA il worker risulta acceso: prima non compariva NESSUNA spiegazione
  // accanto ai lavori fermi (l'utente vedeva "Worker ON" e tutto "in attesa" senza capire perché).
  const codaFermaMaVivo = codaBloccata && workerVivo !== false && !adInPausa && !orfani;
  const mostraAvviso = codaBloccata && (adInPausa || workerVivo === false || orfani || codaFermaMaVivo);

  function toggleGruppo(id: string) {
    setApertiGruppi((s) => {
      const apri = !s[id];
      if (apri) {
        const g = gruppi.find((x) => x.id === id);
        if (g) for (const lv of g.lavori) void caricaDettaglioLavoro(lv.id);
      }
      return { ...s, [id]: apri };
    });
  }

  function lavoroConDettaglio(lv: LavoroBase): LavoroBase {
    const d = dettagliLavori[lv.id];
    if (!d) return lv;
    return { ...lv, richiesta: d.richiesta ?? lv.richiesta, risultato: d.risultato ?? lv.risultato };
  }

  async function caricaDettaglioLavoro(id: string) {
    if (dettagliLavori[id]?.richiesta || caricamentoDettaglio[id]) return;
    setCaricamentoDettaglio((s) => ({ ...s, [id]: true }));
    try {
      const r = await fetch(`/api/lavori/${encodeURIComponent(id)}`, { cache: "no-store" });
      const d = await r.json();
      if (d?.lavoro) setDettagliLavori((s) => ({ ...s, [id]: d.lavoro }));
    } catch {
      /* retry al prossimo expand */
    } finally {
      setCaricamentoDettaglio((s) => {
        const next = { ...s };
        delete next[id];
        return next;
      });
    }
  }

  function toggleLavoro(id: string) {
    setApertiLavori((s) => {
      const apri = !s[id];
      if (apri) void caricaDettaglioLavoro(id);
      return { ...s, [id]: apri };
    });
  }

  function toggleChat(id: string) {
    setChatAperta((s) => {
      const apri = !s[id];
      if (apri) {
        const g = gruppi.find((x) => x.id === id);
        if (g) for (const lv of g.lavori) void caricaDettaglioLavoro(lv.id);
      }
      return { ...s, [id]: apri };
    });
  }

  useEffect(() => {
    for (const l of lavori) {
      if (l.stato === "errore" && !l.risultato && !dettagliLavori[l.id]) void caricaDettaglioLavoro(l.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- prefetch motivo errore on-demand
  }, [lavori]);

  // «Hai già risposto»: in un gruppo con più di un lavoro, ogni lavoro extra nasce da una TUA
  // risposta. Restituisce l'anteprima dell'ultima cosa che hai scritto, per il badge a colpo d'occhio.
  function tuaUltimaRisposta(g: { lavori: LavoroBase[] }): string | null {
    if (g.lavori.length < 2) return null;
    const ultimo = g.lavori[g.lavori.length - 1];
    const mioMsg = messaggiDaLavoro(ultimo).find((m) => m.role === "user")?.content;
    return mioMsg ? mioMsg.trim().slice(0, 80) : null;
  }

  // Banda "da riapprovare" + bottone Riapprova. `diretto` = mostrata sotto l'header del gruppo
  // (conversazione a 1 messaggio), senza il bordo che la aggancia a una card interna.
  // (fix #6) Non più un allarme rosso: un lavoro non andato in porto è semplicemente pronto per
  // essere rimesso in coda con un clic. Colore ambra (attesa), tono rassicurante.
  function bandaErrore(lv: LavoroBase, diretto = false) {
    if (lv.stato !== "errore") return null;
    const x = lavoroConDettaglio(lv);
    return (
      <div className={`${diretto ? "rounded-lg border" : "border-t"} border-amber-200/70 dark:border-amber-900/40 bg-amber-50/70 dark:bg-amber-950/20 px-3 py-2 flex items-start gap-2 flex-wrap`}>
        <div className="min-w-0 flex-1 text-[12px] text-amber-800 dark:text-amber-300 leading-snug">
          <b>Non è partita: da riapprovare.</b> Il primo tentativo non è andato a buon fine ({motivoBreve(x.risultato)}). Nulla è stato inviato — dai di nuovo l&apos;ok e torna in coda.
        </div>
        {(riprovati[lv.id] === "fatto" || (x.risultato || "").includes("[riproposto")) ? (
          <span className="shrink-0 text-[11px] font-medium text-green-700 dark:text-green-400">✅ Rimessa in coda</span>
        ) : (
          <button
            type="button"
            onClick={() => riprova(lv.id)}
            disabled={riprovati[lv.id] === "invio"}
            className="shrink-0 inline-flex items-center gap-1 text-[11px] font-medium border border-amber-400/60 text-amber-800 dark:text-amber-300 rounded-lg px-2.5 py-1 hover:bg-amber-100/70 dark:hover:bg-amber-900/30 transition disabled:opacity-50"
            title="Riapprova: rimette l'azione in coda per eseguirla di nuovo"
          >
            🔄 {riprovati[lv.id] === "invio" ? "Rimetto in coda…" : riprovati[lv.id] === "errore" ? "Riprova ancora" : "Riapprova"}
          </button>
        )}
      </div>
    );
  }

  // Corpo del messaggio: Richiesta + Risposta. `diretto` = reso subito sotto l'header del gruppo
  // (nessun padding/bordo di card interna: lo dà già il contenitore del gruppo).
  function corpoLavoro(lv: LavoroBase, diretto = false) {
    const x = lavoroConDettaglio(lv);
    if (!x.richiesta && caricamentoDettaglio[lv.id]) {
      return (
        <div className={`text-[12px] text-black/40 dark:text-white/40 ${diretto ? "" : "border-t border-black/[0.05] dark:border-white/10 px-3 pb-3 pt-2"}`}>
          Carico dettaglio…
        </div>
      );
    }
    return (
      <div className={`space-y-2 ${diretto ? "" : "border-t border-black/[0.05] dark:border-white/10 px-3 pb-3 pt-2"}`}>
        <div className="text-[13px] text-ink/80 dark:text-white/80 whitespace-pre-wrap break-words">
          <span className="text-[10px] uppercase tracking-wide text-black/40 dark:text-white/40 block mb-1">Richiesta</span>
          {x.richiesta || "—"}
        </div>
        {x.risultato && (
          <div className="text-ink/85 dark:text-white/85 border-t border-black/[0.06] dark:border-white/10 pt-2 text-[13px] prose-sm dark:prose-invert max-w-none">
            <span className="text-[10px] uppercase tracking-wide text-black/40 dark:text-white/40 block mb-1 not-prose">Risposta</span>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{x.risultato}</ReactMarkdown>
          </div>
        )}
      </div>
    );
  }

  // Badge "↻ ritenta ~HH:MM" per un lavoro in attesa del ritentativo automatico.
  function badgeRitentativo(lv: LavoroBase) {
    const q = attendeRitentativo(lv);
    if (!q) return null;
    return (
      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-800 font-medium">
        ↻ ritenta ~{new Date(q).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
        {lv.tentativi ? ` · tent. ${lv.tentativi}` : ""}
      </span>
    );
  }

  const contenuto = (
    <>
      {mostraAvviso && (
        <div
          className={`mb-3 rounded-xl border px-3.5 py-2.5 text-[12.5px] leading-snug space-y-1.5 ${
            codaFermaMaVivo
              ? "border-amber-200 dark:border-amber-900/50 bg-amber-50/80 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300"
              : "border-red-200 dark:border-red-900/50 bg-red-50/80 dark:bg-red-950/30 text-red-800 dark:text-red-300"
          }`}
        >
          {adInPausa ? (
            <>
              <b>⏸️ AD in pausa.</b> Il worker non esegue nulla finché non riattivi l&apos;AD dal Pannello (Azioni → Governo → <b>Riattiva l&apos;AD</b>).
            </>
          ) : orfani ? (
            <>
              <b>⛔ Lavori bloccati «In corso».</b> Probabilmente il worker è stato riavviato a metà giro.
              <div>
                Sul VPS:{" "}
                <code className="bg-red-100/80 dark:bg-red-900/40 px-1 rounded text-[11px]">
                  sudo -u mycity -H bash cervello/vps/recupera-lavori-orfani.sh
                </code>{" "}
                poi{" "}
                <code className="bg-red-100/80 dark:bg-red-900/40 px-1 rounded text-[11px]">sudo systemctl restart mycity-worker</code>
              </div>
            </>
          ) : cervelloSpento ? (
            <>
              <b>⛔ Worker VPS spento.</b> I messaggi restano in coda: il Pannello accoda, ma solo il worker sul server li esegue.
              <div>
                SSH sul VPS e lancia:{" "}
                <code className="bg-red-100/80 dark:bg-red-900/40 px-1 rounded text-[11px]">sudo systemctl start mycity-worker</code>
                {" · "}verifica:{" "}
                <code className="bg-red-100/80 dark:bg-red-900/40 px-1 rounded text-[11px]">systemctl status mycity-worker</code>
              </div>
              <div className="text-[11px] opacity-90">
                Dopo un aggiornamento codice:{" "}
                <code className="bg-red-100/80 dark:bg-red-900/40 px-1 rounded">sudo bash cervello/vps/aggiorna-cervello.sh</code>
              </div>
            </>
          ) : (
            <>
              <b>⏳ Il worker risulta acceso, ma la coda è ferma da qualche minuto.</b> I lavori li mette in
              coda il Pannello, ma a eseguirli è il worker sul tuo server: qui batte ancora, quindi è quasi
              sempre una di due cose — è impegnato su un lavoro lungo, oppure Claude ha finito il credito
              della sessione e riparte da solo al reset. Guarda «Stato worker» qui sopra per il dettaglio;
              se resta bloccato, usa <b>Riavvia worker</b>.
            </>
          )}
        </div>
      )}

      {gruppi.length === 0 ? (
        <p className="text-sm text-black/40 dark:text-white/40">Nessun lavoro in questa vista.</p>
      ) : (
        <div className="scroll-soft space-y-2 max-h-[620px] overflow-y-auto pr-1">
          {gruppi.map((g) => {
            const gruppoAperto = apertiGruppi[g.id] === true;
            const multi = g.lavori.length > 1;
            const statoUltimo = g.lavori[g.lavori.length - 1]?.stato || "in_attesa";
            // Il lavoro da annullare = l'ultimo ancora "vivo" del gruppo (in coda / in corso / da riapprovare).
            const daAnnullare = [...g.lavori].reverse().find((l) => ["in_attesa", "in_corso", "errore"].includes(l.stato));
            const chatOn = chatAperta[g.id] === true;
            const miaRisposta = tuaUltimaRisposta(g);

            return (
              <div
                key={g.id}
                className={`rounded-xl overflow-hidden transition-colors ${
                  g.haAttivo
                    ? "border-2 border-brand/50 bg-brand-50/30 dark:bg-brand/12 shadow-sm shadow-brand/10"
                    : "border border-black/[0.07] dark:border-white/10 bg-white dark:bg-white/[0.03]"
                }`}
              >
                <div className="flex items-stretch">
                <button
                  type="button"
                  onClick={() => toggleGruppo(g.id)}
                  className="flex-1 flex items-start gap-2 p-3.5 text-left hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition min-w-0"
                >
                  <span className="mt-0.5 text-black/40 dark:text-white/40 shrink-0">
                    {gruppoAperto ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {g.haAttivo && (
                        <span className="w-2 h-2 rounded-full bg-brand animate-pulse shrink-0" title="In elaborazione" />
                      )}
                      {statoBadge(statoUltimo)}
                      {multi ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-black/50 dark:text-white/50">
                          {g.lavori.length} messaggi · stessa chat
                        </span>
                      ) : (
                        badgeRitentativo(g.lavori[0])
                      )}
                      {miaRisposta && (
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-50 text-green-700 ring-1 ring-green-200 dark:bg-green-950/40 dark:text-green-300 dark:ring-green-800 font-medium max-w-[60%] truncate"
                          title={`Hai già risposto: «${miaRisposta}»`}
                        >
                          ✅ hai già risposto: «{miaRisposta}»
                        </span>
                      )}
                      <span className="ml-auto text-[11px] text-black/40 dark:text-white/40 shrink-0">{faRelativo(g.ultimoAt)}</span>
                    </div>
                    <div className="text-sm font-medium text-ink/85 dark:text-white/85 line-clamp-2">{g.titolo}</div>
                  </div>
                </button>
                {daAnnullare && bottoneAnnulla(daAnnullare)}
                <button
                  type="button"
                  onClick={() => toggleChat(g.id)}
                  className={`shrink-0 self-center mr-2.5 inline-flex items-center gap-1 text-[11px] font-medium border rounded-lg px-2.5 py-1.5 transition ${
                    chatOn
                      ? "border-brand bg-brand text-white"
                      : "border-brand/35 text-brand hover:bg-brand-50/60 dark:hover:bg-brand/10"
                  }`}
                  title="Apri la chat di questa casella qui sotto (si apre e si chiude sul posto)"
                >
                  <MessageSquare size={12} />
                  {chatOn ? "Chiudi chat" : "Chat"}
                </button>
                </div>

                {chatOn && (
                  <ChatCasella gruppoId={g.id} lavori={g.lavori.map(lavoroConDettaglio)} onChiudi={() => toggleChat(g.id)} />
                )}

                {gruppoAperto && !multi && (
                  // Conversazione a UN solo messaggio: l'header del gruppo È il messaggio →
                  // mostro il contenuto DIRETTAMENTE, senza una seconda card da riaprire.
                  <div className="border-t border-black/[0.06] dark:border-white/10 px-3 pb-3 pt-2.5 space-y-2">
                    {bandaErrore(g.lavori[0], true)}
                    {corpoLavoro(g.lavori[0], true)}
                  </div>
                )}

                {gruppoAperto && multi && (
                  <div className="border-t border-black/[0.10] dark:border-white/15 bg-black/[0.015] dark:bg-white/[0.02] px-3 pb-3 pt-2.5 space-y-2">
                    <div className="text-[10px] uppercase tracking-wider font-semibold text-black/35 dark:text-white/35 pb-1.5 flex items-center gap-1.5">
                      <span className="w-3 h-px bg-black/20 dark:bg-white/20 rounded" />
                      Storico messaggi ({g.lavori.length})
                      <span className="w-3 h-px bg-black/20 dark:bg-white/20 rounded" />
                    </div>
                    {g.lavori.map((lv, i) => {
                      const lavoroAperto = apertiLavori[lv.id] === true;
                      return (
                        <div
                          key={lv.id}
                          className="border border-black/[0.06] dark:border-white/10 rounded-lg overflow-hidden bg-paper/40 dark:bg-black/20"
                        >
                          <button
                            type="button"
                            onClick={() => toggleLavoro(lv.id)}
                            className="w-full flex items-start gap-2 p-3 text-left hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition"
                          >
                            <span className="mt-0.5 text-black/35 dark:text-white/35 shrink-0">
                              {lavoroAperto ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                <span className="text-[10px] text-black/35 dark:text-white/35 font-medium">#{i + 1}</span>
                                {statoBadge(lv.stato)}
                                {badgeRitentativo(lv)}
                                <span className="ml-auto text-[10px] text-black/35 dark:text-white/35">{faRelativo(lv.updated_at || lv.created_at)}</span>
                              </div>
                              <div className="text-[13px] font-medium text-ink/80 dark:text-white/80 line-clamp-2">{titoloLavoro(lv)}</div>
                            </div>
                          </button>

                          {bandaErrore(lv)}
                          {lavoroAperto && corpoLavoro(lv)}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );

  if (embedded) {
    return <div className="card p-4">{contenuto}</div>;
  }

  return (
    <section className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className="sez-ico">
            <Brain size={16} />
          </span>
          <span className="t-sez">Lavori del cervello (Max)</span>
        </div>
        {lavori.length > 0 && (
          <button
            onClick={onSvuota}
            className="text-xs text-black/40 dark:text-white/40 hover:text-black/70 dark:hover:text-white/70 inline-flex items-center gap-1 transition"
          >
            <Trash2 size={12} /> Svuota
          </button>
        )}
      </div>
      <p className="t-eti mb-3">
        Ogni conversazione è un contenitore: i messaggi della stessa chat restano insieme. Apri o chiudi ogni finestra.
      </p>
      {contenuto}
    </section>
  );
}
