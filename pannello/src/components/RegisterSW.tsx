"use client";

import { useEffect } from "react";

// Registra il service worker così il Pannello è installabile come app (PWA).
export default function RegisterSW() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
    // Quando un nuovo service worker prende il controllo (dopo un deploy), ricarica UNA volta la pagina:
    // evita il ChunkLoadError di chi resta su una versione vecchia con chunk non più esistenti.
    let ricaricato = false;
    const onChange = () => {
      if (ricaricato) return;
      ricaricato = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onChange);
    return () => navigator.serviceWorker.removeEventListener("controllerchange", onChange);
  }, []);
  return null;
}
