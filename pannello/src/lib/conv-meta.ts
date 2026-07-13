/** Sync pallini «non letto» e graffette tra dispositivi (Supabase impostazioni). */

export type ConvMeta = { letta: Record<string, string>; pin: string[] };

export function mergeLette(
  a: Record<string, string>,
  b: Record<string, string>
): Record<string, string> {
  const out = { ...a };
  for (const [id, at] of Object.entries(b)) {
    if (!out[id] || at > out[id]) out[id] = at;
  }
  return out;
}

export async function caricaConvMeta(): Promise<ConvMeta | null> {
  try {
    const r = await fetch("/api/conversazioni-meta", { cache: "no-store" });
    const d = await r.json();
    if (!d?.memoria) return null;
    return {
      letta: d.letta && typeof d.letta === "object" ? d.letta : {},
      pin: Array.isArray(d.pin) ? d.pin.map(String) : [],
    };
  } catch {
    return null;
  }
}

let syncTimer: ReturnType<typeof setTimeout> | null = null;
let pendingLette: Record<string, string> | null = null;
let pendingPin: string[] | null = null;

export function accodaSyncConvMeta(lette?: Record<string, string>, pin?: string[]) {
  if (lette) pendingLette = lette;
  if (pin) pendingPin = pin;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    const body: { letta?: Record<string, string>; pin?: string[] } = {};
    if (pendingLette) body.letta = pendingLette;
    if (pendingPin) body.pin = pendingPin;
    pendingLette = null;
    pendingPin = null;
    syncTimer = null;
    if (!body.letta && !body.pin) return;
    fetch("/api/conversazioni-meta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => {});
  }, 400);
}
