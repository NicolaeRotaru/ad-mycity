// 💬 "Parla con la casella" — il motore condiviso dietro il pulsante che ogni casella
// del Pannello può avere. Ordine anti-perdita (stesso pattern della chat della Cabina):
// ① salva SUBITO la conversazione in Assistenza → Conversazioni (col messaggio di Nicola),
// ② crea il lavoro per il cervello nello STESSO gruppo della conversazione (gruppo_id),
// ③ aspetta la risposta e completa il thread. Così la conversazione esiste in lista anche
// se il browser si chiude prima della risposta — e la risposta resta ricostruibile dai
// lavori (recuperaThreadDaLavori). Server se c'è la tabella, altrimenti localStorage
// (stesso formato della Cabina). Notifica la Cabina di ricaricare l'elenco.
// €0: nessuna API a pagamento, il lavoro pesante lo fa il tuo Max.

import { preparaLavoro, messaggioLavoroInCorso } from "@/lib/comandi";
import {
  leggiMappaGruppiLocali,
  messaggiDaGruppo,
  salvaGruppoLavoroLocale,
  type LavoroBase,
} from "@/lib/lavori-gruppo";
import { bloccoMemoriaChat } from "@/lib/memoria-chat";
import { emitSync } from "@/lib/panel-sync";

// pending = bolla solo a schermo (avviso "ci sto lavorando"): non si salva in
// Conversazioni e non entra nella storia mandata al cervello.
export type ParlaMsg = { role: "user" | "assistant"; content: string; pending?: boolean };

const HEADERS = { "Content-Type": "application/json" };

// Crea il lavoro "su QUESTA casella" per il cervello, legato alla conversazione
// (gruppo_id = id conversazione): Archivio lavori e lista Conversazioni restano
// collegati. NON aspetta la risposta: per quella c'è attendiEsitoLavoro.
export async function creaLavoroCasella(
  titolo: string,
  contesto: string,
  storia: ParlaMsg[],
  messaggio: string,
  gruppoId: string | null
): Promise<{ id: string; tipo: string; timeoutMs: number }> {
  const storiaTxt = storia
    .filter((m) => !m.pending)
    .map((m) => `${m.role === "user" ? "Nicola" : "AD"}: ${m.content}`)
    .join("\n");
  const memoria = await bloccoMemoriaChat(gruppoId);
  const richiesta =
    (memoria ? `${memoria}\n` : "") +
    `## Casella del Pannello: ${titolo}\n` +
    (contesto ? `\n## Contenuto della casella\n${contesto}\n` : "") +
    (storiaTxt ? `\n## Conversazione finora\n${storiaTxt}\n` : "") +
    `\n## Nuovo messaggio di Nicola\n${messaggio}\n\n` +
    `## Istruzioni\nRispondi in italiano, conciso e concreto, riferito a QUESTA casella. Rispetta 🟢🟡🔴. ` +
    `Se Nicola dà un'informazione o una decisione utile, aggiorna la memoria nel vault e dichiara cosa hai aggiornato.`;

  const prep = preparaLavoro(messaggio);
  const post = await fetch("/api/lavori", {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({ richiesta, tipo: prep.tipo, ...(gruppoId ? { gruppo_id: gruppoId } : {}) }),
  })
    .then((r) => r.json())
    .catch(() => null);
  if (!post?.ok || !post.lavoro) {
    throw new Error(post?.error || "Serve il database di memoria collegato (tabella 'lavori').");
  }
  // Collegamento anche in localStorage: copre il caso in cui la colonna gruppo_id manchi sul DB.
  if (gruppoId) salvaGruppoLavoroLocale(post.lavoro.id, gruppoId);
  try {
    emitSync("lavori");
  } catch {
    /* SSR / nessun window */
  }
  return { id: post.lavoro.id, tipo: prep.tipo, timeoutMs: prep.timeoutMs };
}

// Polling ravvicinato (2s) finché il cervello marca il lavoro "fatto"/"errore" (o timeout).
// definitiva:false = tempo scaduto: il testo è solo un avviso da mostrare, NON un messaggio
// della conversazione (la risposta vera si ripesca dai lavori alla prossima apertura).
export async function attendiEsitoLavoro(
  id: string,
  tipo = "chat",
  timeoutMs = 5 * 60 * 1000
): Promise<{ testo: string; definitiva: boolean }> {
  const scadenza = Date.now() + timeoutMs;
  while (Date.now() < scadenza) {
    await new Promise((r) => setTimeout(r, 2000));
    try {
      const d = await fetch("/api/lavori", { cache: "no-store" }).then((r) => r.json());
      const l = Array.isArray(d.lavori) ? d.lavori.find((x: any) => x.id === id) : null;
      if (l && (l.stato === "fatto" || l.stato === "errore")) {
        const testo =
          l.risultato ||
          (l.stato === "errore"
            ? "🔄 Non è partita al primo colpo — la trovi come «da riapprovare» nell'area Lavori: un clic e riparte."
            : "(risposta vuota)");
        if (l.stato === "fatto") {
          try {
            emitSync("memoria");
            emitSync("radiografia");
            emitSync("azioni");
          } catch {
            /* SSR */
          }
        }
        return { testo, definitiva: true };
      }
    } catch {
      /* rete instabile: riprovo */
    }
  }
  return { testo: messaggioLavoroInCorso(tipo), definitiva: false };
}

// Salva/aggiorna la conversazione-con-la-casella in Conversazioni (Assistenza).
// Server se la tabella esiste, altrimenti localStorage (stesso formato della Cabina).
// Notifica la Cabina (`mycity:conversazioni`) di ricaricare l'elenco. Ritorna l'id.
export async function salvaConversazioneCasella(id: string | null, titolo: string, messaggi: ParlaMsg[]): Promise<string | null> {
  const reali = messaggi.filter((m) => !m.pending);
  if (reali.length === 0) return id;
  let nuovoId: string | null = id;
  try {
    const r = await fetch("/api/conversazioni", { method: "POST", headers: HEADERS, body: JSON.stringify({ id, titolo, messaggi: reali }) }).then((x) => x.json());
    nuovoId = r?.ok && r.id ? String(r.id) : salvaLocale(id, titolo, reali);
  } catch {
    nuovoId = salvaLocale(id, titolo, reali);
  }
  try {
    window.dispatchEvent(new CustomEvent("mycity:conversazioni"));
  } catch {
    /* SSR / nessun window */
  }
  return nuovoId;
}

// Fonde due versioni dello stesso thread senza perdere messaggi (stesso criterio del
// mergeThread della Cabina): base = la più lunga, e appende ciò che c'è solo nell'altra.
export function fondiMessaggi(a: ParlaMsg[], b: ParlaMsg[]): ParlaMsg[] {
  const pa = a.filter((m) => !m.pending);
  const pb = b.filter((m) => !m.pending);
  const base = pa.length >= pb.length ? pa : pb;
  const altro = pa.length >= pb.length ? pb : pa;
  const visti = new Set(base.map((m) => `${m.role}|${m.content}`));
  const extra = altro.filter((m) => !visti.has(`${m.role}|${m.content}`));
  return extra.length ? [...base, ...extra] : base;
}

// 🩹 RECUPERO: se la pagina si era chiusa prima della risposta, il thread salvato finisce
// col messaggio di Nicola e la risposta vive solo nei LAVORI (stesso gruppo_id — o stessa
// casella, per i lavori creati prima del collegamento gruppo_id). Ricostruisce il thread
// completo fondendo salvato + lavori; torna null se dai lavori non esce nulla in più.
export async function recuperaThreadDaLavori(
  titolo: string,
  convId: string | null,
  salvati: ParlaMsg[]
): Promise<ParlaMsg[] | null> {
  let lavori: LavoroBase[] = [];
  try {
    const d = await fetch("/api/lavori", { cache: "no-store" }).then((r) => r.json());
    lavori = Array.isArray(d?.lavori) ? d.lavori : [];
  } catch {
    return null;
  }
  const mappa = leggiMappaGruppiLocali();
  const prefisso = `## Casella del Pannello: ${titolo}\n`;
  const miei = lavori
    .filter((lv) => lv.tipo !== "metabolizza")
    .filter((lv) => {
      const gid = lv.gruppo_id || mappa[lv.id];
      if (gid) return convId != null && gid === convId;
      return typeof lv.richiesta === "string" && lv.richiesta.startsWith(prefisso);
    })
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  if (miei.length === 0) return null;
  const daLavori = (messaggiDaGruppo(miei) as ParlaMsg[]).filter((m) => !m.pending);
  if (daLavori.length === 0) return null;
  const fusi = fondiMessaggi(salvati, daLavori);
  return fusi.length > salvati.filter((m) => !m.pending).length ? fusi : null;
}

// Fallback locale: scrive nell'array `mycity_conversazioni` come fa la Cabina.
function salvaLocale(id: string | null, titolo: string, messaggi: ParlaMsg[]): string {
  const newId = id || "loc_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  try {
    const list = JSON.parse(localStorage.getItem("mycity_conversazioni") || "[]");
    const esiste = list.find((c: any) => c.id === newId);
    const created_at = esiste?.created_at || new Date().toISOString();
    const altri = list.filter((c: any) => c.id !== newId);
    const nuova = [{ id: newId, titolo, messaggi, created_at, updated_at: new Date().toISOString() }, ...altri].slice(0, 100);
    localStorage.setItem("mycity_conversazioni", JSON.stringify(nuova));
  } catch {
    /* localStorage non disponibile */
  }
  return newId;
}
