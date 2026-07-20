/** Fusione thread chat: dedup risposte AD e unifica messaggi utente allegato-only. */

export const PLACEHOLDER_ALLEGATI = "(nessun testo — vedi allegati)";

export type ThreadMsg = {
  role: "user" | "assistant";
  content: string;
  pending?: boolean;
  prompt?: boolean;
  id?: string;
};

export function estraiNomiAllegatiDaRichiesta(richiesta: string): string[] {
  const nomi: string[] = [];
  const re = /@ALLEGATO nome="([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(richiesta)) !== null) nomi.push(m[1]);
  return nomi;
}

export function parseUserBolla(content: string): { testo: string; allegati: string[] } {
  const allegati = [...content.matchAll(/📎\s*(\S+)/g)].map((x) => x[1]);
  let testo = content
    .replace(/📎\s*\S+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (testo === PLACEHOLDER_ALLEGATI) testo = "";
  return { testo, allegati };
}

export function bollaUtenteDaTesto(testo: string, nomiAllegati: string[]): string {
  const nomi = nomiAllegati.map((n) => `📎 ${n}`).join("  ");
  const t = testo.trim();
  if (!t && !nomi) return PLACEHOLDER_ALLEGATI;
  return [t === PLACEHOLDER_ALLEGATI ? "" : t, nomi].filter(Boolean).join("\n");
}

/** Testo utente per la bolla, ricavato dalla richiesta lavoro (allinea UI ↔ Lavori). */
export function userContentDaRichiesta(richiesta: string): string {
  const nuovo = richiesta.match(/## Nuovo messaggio di Nicola\n([\s\S]*?)(?:\n\n## |\n*$)/);
  let testo = nuovo?.[1]?.trim() || "";
  if (testo.includes("\n## Allegati")) testo = testo.split("\n## Allegati")[0].trim();
  const nomi = estraiNomiAllegatiDaRichiesta(richiesta);
  return bollaUtenteDaTesto(testo, nomi);
}

export function userMessagesEquivalent(a: string, b: string): boolean {
  if (a.trim() === b.trim()) return true;
  const pa = parseUserBolla(a);
  const pb = parseUserBolla(b);
  if (pa.testo !== pb.testo) return false;
  const sameFiles = [...pa.allegati].sort().join() === [...pb.allegati].sort().join();
  if (sameFiles) return true;
  const placeholderOnly = (raw: string, p: ReturnType<typeof parseUserBolla>) =>
    !p.testo && p.allegati.length === 0 && raw.trim() === PLACEHOLDER_ALLEGATI;
  const allegatoOnly = (p: ReturnType<typeof parseUserBolla>) => !p.testo && p.allegati.length > 0;
  if (
    (placeholderOnly(a, pa) && allegatoOnly(pb)) ||
    (placeholderOnly(b, pb) && allegatoOnly(pa))
  ) {
    return true;
  }
  return false;
}

export function userContentPreferito(a: string, b: string): string {
  const pa = parseUserBolla(a);
  const pb = parseUserBolla(b);
  const testo = pa.testo || pb.testo;
  const allegati = [...new Set([...pa.allegati, ...pb.allegati])];
  return bollaUtenteDaTesto(testo, allegati);
}

function pulisci<T extends ThreadMsg>(list: T[]): T[] {
  return list.filter((m) => !m.pending && !m.prompt);
}

function msgKey(m: ThreadMsg): string {
  if (m.role === "user") return `user|${normalizeUserKey(m.content)}`;
  return `assistant|${m.content}`;
}

function normalizeUserKey(content: string): string {
  const { testo, allegati } = parseUserBolla(content);
  if (!testo && allegati.length === 0 && content.trim() === PLACEHOLDER_ALLEGATI) {
    return "__allegati_only__";
  }
  if (!testo && allegati.length > 0) {
    return `__allegati_only__:${[...allegati].sort().join(",")}`;
  }
  return `${testo}:${[...allegati].sort().join(",")}`;
}

function giaInThread<T extends ThreadMsg>(base: T[], m: T): boolean {
  if (m.role === "user") {
    return base.some((b) => b.role === "user" && userMessagesEquivalent(b.content, m.content));
  }
  return base.some((b) => b.role === "assistant" && b.content === m.content);
}

/** Collassa utenti equivalenti ravvicinati e risposte AD identiche consecutive. */
export function normalizzaThread<T extends ThreadMsg>(msgs: T[]): T[] {
  if (!msgs.length) return [];
  const out: T[] = [];

  for (let i = 0; i < msgs.length; i++) {
    const m = msgs[i];
    if (m.role === "user") {
      let lastUserIdx = -1;
      for (let j = out.length - 1; j >= 0; j--) {
        if (out[j].role === "user") {
          lastUserIdx = j;
          break;
        }
      }
      if (lastUserIdx >= 0) {
        const lastUser = out[lastUserIdx];
        const hasAsstAfter = out.slice(lastUserIdx + 1).some((x) => x.role === "assistant");
        if (hasAsstAfter && userMessagesEquivalent(lastUser.content, m.content)) {
          out[lastUserIdx] = { ...lastUser, content: userContentPreferito(lastUser.content, m.content) };
          if (i + 1 < msgs.length && msgs[i + 1].role === "assistant") {
            const nextAsst = msgs[i + 1];
            const lastAsst = out[out.length - 1];
            if (lastAsst?.role === "assistant" && lastAsst.content === nextAsst.content) i++;
          }
          continue;
        }
      }
      out.push(m);
      continue;
    }
    const prev = out[out.length - 1];
    if (prev?.role === "assistant" && prev.content === m.content) continue;
    out.push(m);
  }
  return out;
}

/** Fonde due versioni dello stesso thread senza duplicare turni allegato / risposte AD. */
export function mergeThreadMsgs<T extends ThreadMsg>(a: T[], b: T[]): T[] {
  const pa = normalizzaThread(pulisci(a));
  const pb = normalizzaThread(pulisci(b));
  if (pa.length === 0) return pb;
  if (pb.length === 0) return pa;

  const base = pa.length >= pb.length ? pa : pb;
  const altro = pa.length >= pb.length ? pb : pa;
  const visti = new Set(base.map((m) => msgKey(m)));
  const extra = altro.filter((m) => !visti.has(msgKey(m)) && !giaInThread(base, m));
  let merged: T[] = extra.length ? [...base, ...extra] : [...base];
  for (let i = 0; i < merged.length; i++) {
    if (merged[i].role !== "user") continue;
    const altroUser = [...pa, ...pb].find(
      (m) => m.role === "user" && userMessagesEquivalent(m.content, merged[i].content),
    );
    if (altroUser) {
      merged[i] = { ...merged[i], content: userContentPreferito(merged[i].content, altroUser.content) };
    }
  }
  return normalizzaThread(merged);
}
