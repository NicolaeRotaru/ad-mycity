"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquarePlus, Send, Loader2, CheckCircle2, Zap } from "lucide-react";
import {
  attendiEsitoLavoro,
  creaLavoroCasella,
  fondiMessaggi,
  recuperaThreadDaLavori,
  salvaConversazioneCasella,
  type ParlaMsg,
} from "@/lib/parla";

// 🚀 AR-036: cache CONDIVISA della lista conversazioni tra TUTTE le istanze di ParlaCasella.
// Prima ogni casella fetchava /api/conversazioni al proprio mount → con decine di caselle per pagina
// erano decine/centinaia di richieste identiche. Ora: una sola richiesta (dedup delle chiamate in volo)
// + cache breve (10s). Il fetch parte solo quando una casella viene aperta (vedi effetto sotto).
let convCache: { at: number; data: Array<{ id?: string | number; titolo?: string; messaggi?: unknown }> } | null = null;
let convInFlight: Promise<Array<{ id?: string | number; titolo?: string; messaggi?: unknown }>> | null = null;
async function fetchConversazioniCondiviso() {
  if (convCache && Date.now() - convCache.at < 10000) return convCache.data;
  if (convInFlight) return convInFlight;
  convInFlight = fetch("/api/conversazioni", { cache: "no-store" })
    .then((r) => r.json())
    .then((d) => {
      const arr = Array.isArray(d?.conversazioni) ? d.conversazioni : [];
      convCache = { at: Date.now(), data: arr };
      return arr;
    })
    .catch(() => convCache?.data ?? [])
    .finally(() => { convInFlight = null; });
  return convInFlight;
}

const SKILL_RAPIDE = [
  { label: "🔄 Giro", cmd: "fai un giro" },
  { label: "🔁 Loop 30m", cmd: "/loop 30m fai un giro" },
  { label: "✅ Verifica", cmd: "/verify" },
  { label: "📋 Audit Pannello", cmd: "/audit-pannello" },
  { label: "🔬 Radiografia", cmd: "/auto-radiografia" },
  { label: "🔍 Ricerca", cmd: "/deep-research " },
  { label: "🛡️ Sicurezza", cmd: "/security-review" },
  { label: "📅 Pianifica", cmd: "/schedule " },
];

// 💬 Pulsante "Parla con questa casella" — riutilizzabile su OGNI casella del Pannello.
// Chiuso di default: un click lo apre. Salva SUBITO la conversazione in Assistenza →
// Conversazioni (col messaggio di Nicola), poi manda il messaggio (col contesto della
// casella) a Claude Max nello stesso gruppo, mostra la risposta sul posto e completa il
// thread salvato. Se la pagina si chiude prima della risposta, il thread resta in lista
// e la risposta si ripesca dai lavori alla prossima apertura.
export default function ParlaCasella({ titolo, contesto }: { titolo: string; contesto?: string }) {
  const [aperto, setAperto] = useState(false);
  const [bozza, setBozza] = useState("");
  const [inviando, setInviando] = useState(false);
  const [msgs, setMsgs] = useState<ParlaMsg[]>([]);
  const [convId, setConvId] = useState<string | null>(null);
  const [salvata, setSalvata] = useState(false);
  const [err, setErr] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 🐛 Bug #5 (radiografia 2026-07-03): la risposta del box spariva cambiando sezione,
  // perché `msgs` è stato locale e al rimontaggio ripartiva da []. La conversazione è però
  // già salvata in Conversazioni sotto il titolo `💬 {titolo}` (thread stabile dal titolo):
  // al montaggio la ricarichiamo (server → fallback localStorage) e ripopoliamo msgs+convId,
  // così recuperiamo anche il convId reale e i salvataggi successivi fanno upsert sullo stesso thread.
  // AR-036: carica la storia della casella SOLO quando la apri (non a ogni mount di ogni casella),
  // e via la cache condivisa (una sola richiesta anche se apri più box). La maggior parte delle caselle
  // non viene mai aperta → zero fetch. Carica una volta per casella (si ritenta solo se il giro
  // precedente è stato annullato chiudendo il box a metà caricamento).
  const caricatoRef = useRef(false);
  useEffect(() => {
    if (!aperto || caricatoRef.current) return;
    let annullato = false;
    const chiave = `💬 ${titolo}`; // id thread stabile dal titolo
    (async () => {
      let salvati: ParlaMsg[] = [];
      let cid: string | null = null;
      // 1) server (lista condivisa, cache + dedup)
      try {
        const arr = await fetchConversazioniCondiviso();
        const c = arr.find((x) => x.titolo === chiave);
        if (c) {
          salvati = Array.isArray(c.messaggi) ? (c.messaggi as ParlaMsg[]) : [];
          cid = c.id != null ? String(c.id) : null;
        }
      } catch {
        /* rete instabile: passo al locale */
      }
      // 2) fallback locale (stesso formato della Cabina)
      if (!cid && salvati.length === 0) {
        try {
          const list = JSON.parse(localStorage.getItem("mycity_conversazioni") || "[]");
          const c = Array.isArray(list) ? list.find((x: any) => x.titolo === chiave) : null;
          if (c) {
            salvati = Array.isArray(c.messaggi) ? (c.messaggi as ParlaMsg[]) : [];
            cid = c.id != null ? String(c.id) : null;
          }
        } catch {
          /* localStorage non disponibile */
        }
      }
      if (annullato) return;
      caricatoRef.current = true;
      if (salvati.length || cid) {
        setMsgs(salvati);
        setConvId(cid);
      }
      // 3) 🩹 RECUPERO: risposta arrivata quando la pagina era chiusa → vive solo nei lavori
      //    (stesso gruppo_id, o stessa casella per i lavori nati prima del collegamento).
      //    Se il thread completo è più lungo di quello salvato, mostralo e RISALVALO in
      //    Conversazioni, così la lista dell'Assistente torna a dire la verità.
      const completi = await recuperaThreadDaLavori(titolo, cid, salvati);
      if (!completi) return;
      if (!annullato) setMsgs((cur) => fondiMessaggi(cur, completi));
      const id = await salvaConversazioneCasella(cid, chiave, completi);
      if (!annullato && id) setConvId(id);
    })();
    return () => {
      annullato = true;
    };
  }, [aperto, titolo]);

  async function invia() {
    const testo = bozza.trim();
    if (!testo || inviando) return;
    setErr("");
    setSalvata(false); // 🐛 Bug #5: azzera la spunta "salvata" all'inizio di ogni invio
    setBozza("");
    const chiave = `💬 ${titolo}`;
    const storia = msgs.filter((m) => !m.pending);
    const conMio: ParlaMsg[] = [...storia, { role: "user", content: testo }];
    setMsgs(conMio);
    setInviando(true);
    try {
      // ① Salva SUBITO la conversazione: compare in Assistente → Conversazioni col messaggio
      //    di Nicola anche se la risposta arriverà quando questa pagina non ci sarà più.
      //    (Prima si salvava solo a risposta ricevuta: un refresh nel mezzo = thread mai
      //    salvato, lavoro presente in Archivio ma conversazione assente dalla lista.)
      const id = (await salvaConversazioneCasella(convId, chiave, conMio)) ?? convId;
      if (id) setConvId(id);
      setSalvata(true);
      // ② Il lavoro nasce nello STESSO gruppo della conversazione (gruppo_id): Archivio e
      //    Assistente restano collegati e la risposta è sempre ricostruibile dai lavori.
      const lavoro = await creaLavoroCasella(titolo, contesto || "", storia, testo, id);
      // ③ Aspetta la risposta e completa il thread salvato.
      const esito = await attendiEsitoLavoro(lavoro.id, lavoro.tipo, lavoro.timeoutMs);
      if (esito.definitiva) {
        const completa: ParlaMsg[] = [...conMio, { role: "assistant", content: esito.testo }];
        setMsgs(completa);
        const idFinale = await salvaConversazioneCasella(id, chiave, completa);
        if (idFinale) setConvId(idFinale);
      } else {
        // Tempo scaduto: l'avviso resta solo a schermo (pending, non salvato) — la risposta
        // vera verrà ripescata dai lavori alla prossima apertura della casella/conversazione.
        setMsgs([...conMio, { role: "assistant", content: esito.testo, pending: true }]);
      }
    } catch (e: any) {
      setErr(e?.message || "Non riuscito.");
      setBozza(testo); // 🐛 Bug #5: non perdere la bozza se l'invio fallisce, ripristinala
    } finally {
      setInviando(false);
    }
  }

  if (!aperto) {
    return (
      <button onClick={() => setAperto(true)} className="mt-2 inline-flex items-center gap-1 text-[12px] font-medium text-brand hover:underline">
        <MessageSquarePlus size={13} /> 💬 Parla con questa casella
      </button>
    );
  }

  return (
    <div className="mt-2 rounded-lg border border-brand/15 bg-brand-50/30 p-2.5 space-y-2">
      <div className="flex items-center gap-1.5 text-[10.5px] font-semibold text-brand uppercase tracking-wide">
        <MessageSquarePlus size={12} /> Parla con: <span className="normal-case font-medium truncate">{titolo}</span>
        <button onClick={() => setAperto(false)} className="ml-auto t-eti hover:text-brand normal-case">chiudi</button>
      </div>

      {msgs.length > 0 && (
        <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
          {msgs.map((m, i) => (
            <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
              <span className={`inline-block text-[12px] leading-relaxed rounded-lg px-2.5 py-1.5 whitespace-pre-wrap max-w-[92%] ${m.role === "user" ? "bg-brand text-white" : "chat-bubble-assistant"}`}>
                {m.content}
              </span>
            </div>
          ))}
        </div>
      )}

      {inviando && <p className="t-eti flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Claude Max sta rispondendo…</p>}

      {/* Skill rapide — compaiono solo a bozza vuota */}
      {!bozza && !inviando && (
        <div className="flex flex-wrap gap-1">
          <span className="t-eti inline-flex items-center gap-0.5 opacity-50"><Zap size={10} /></span>
          {SKILL_RAPIDE.map((s) => (
            <button
              key={s.cmd}
              onClick={() => { setBozza(s.cmd); setTimeout(() => textareaRef.current?.focus(), 0); }}
              className="text-[11px] bg-brand-50 dark:bg-brand/15 text-brand rounded-md px-2 py-0.5 hover:bg-brand/15 dark:hover:bg-brand/25 transition"
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      <textarea
        ref={textareaRef}
        value={bozza}
        onChange={(e) => setBozza(e.target.value)}
        onKeyDown={(e) => {
          // 💬 Come una chat vera: Invio = manda · Maiusc+Invio = va a capo.
          // Guardia IME (isComposing): non inviare mentre si sta componendo un carattere (es. accenti/tastiere CJK).
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            invia();
          }
        }}
        rows={2}
        placeholder="Scrivi alla macchina su questa casella…  (Invio = invia · Maiusc+Invio = a capo)"
        className="input-soft w-full text-[12.5px] resize-y"
      />
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={invia}
          disabled={inviando || !bozza.trim()}
          className="inline-flex items-center gap-1.5 bg-brand text-white text-[12px] font-medium px-3 py-1.5 rounded-lg hover:bg-brand-dark disabled:opacity-50 transition"
        >
          {inviando ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />} Invia a Claude Max
        </button>
        {salvata && !inviando && <span className="t-eti inline-flex items-center gap-1 text-green-700"><CheckCircle2 size={12} /> salvata in Conversazioni</span>}
        {err && <span className="t-eti text-red-600">{err}</span>}
      </div>
    </div>
  );
}
