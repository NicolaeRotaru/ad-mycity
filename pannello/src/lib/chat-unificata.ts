// 💬 Chat unificata — una sola conversazione visibile ovunque (Assistente, fluttuante, ParlaCasella).
// Evento leggero: chi aggiorna il thread lo pubblica; le altre superfici si allineano senza loop.

export type ChatUnificataMsg = {
  role: "user" | "assistant";
  content: string;
  pending?: boolean;
};

export type DettaglioChatUnificata = {
  convId: string | null;
  titolo: string;
  messaggi: ChatUnificataMsg[];
};

export const EVENTO_CHAT_UNIFICATA = "mycity:chat-unificata";

type Payload = DettaglioChatUnificata & { origine: "casella" | "assistente" };

let ultima: Payload | null = null;

function uguale(a: Payload | null, b: Payload): boolean {
  if (!a) return false;
  if (a.origine !== b.origine || a.convId !== b.convId || a.titolo !== b.titolo) return false;
  const sa = a.messaggi.filter((m) => !m.pending);
  const sb = b.messaggi.filter((m) => !m.pending);
  return JSON.stringify(sa) === JSON.stringify(sb);
}

/** Pubblica il thread attivo (ignora se identico all'ultimo emit della stessa origine). */
export function pubblicaChatUnificata(det: DettaglioChatUnificata, origine: Payload["origine"]) {
  if (typeof window === "undefined") return;
  const payload: Payload = { ...det, origine };
  if (uguale(ultima, payload)) return;
  ultima = payload;
  window.dispatchEvent(new CustomEvent<Payload>(EVENTO_CHAT_UNIFICATA, { detail: payload }));
}

/** Ultimo thread pubblicato (utile al mount di ParlaCasella). */
export function leggiUltimaChatUnificata(): DettaglioChatUnificata | null {
  if (!ultima) return null;
  const { origine: _o, ...rest } = ultima;
  return rest;
}

/** Ascolta aggiornamenti dalle altre superfici (salta quelli della propria origine). */
export function ascoltaChatUnificata(
  origine: Payload["origine"],
  handler: (det: DettaglioChatUnificata) => void,
): () => void {
  if (typeof window === "undefined") return () => {};
  const fn = (e: Event) => {
    const det = (e as CustomEvent<Payload>).detail;
    if (!det || det.origine === origine) return;
    handler({ convId: det.convId, titolo: det.titolo, messaggi: det.messaggi });
  };
  window.addEventListener(EVENTO_CHAT_UNIFICATA, fn);
  return () => window.removeEventListener(EVENTO_CHAT_UNIFICATA, fn);
}
