import type { KeyboardEvent } from "react";

/** Smartphone/touch: Invio va a capo; desktop: Invio invia (Maiusc+Invio = a capo). */
export function touchInvioVaACapo(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

export function gestisciInvioChat(
  e: KeyboardEvent<HTMLTextAreaElement>,
  invia: () => void,
): void {
  if (e.key !== "Enter" || e.shiftKey || e.nativeEvent.isComposing) return;
  if (touchInvioVaACapo()) return;
  e.preventDefault();
  invia();
}

export function hintInvioChat(): string {
  return touchInvioVaACapo()
    ? "Invio = a capo · invia col bottone"
    : "Invio = invia · Maiusc+Invio = a capo";
}
