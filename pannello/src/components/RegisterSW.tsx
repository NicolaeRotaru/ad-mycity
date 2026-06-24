"use client";

import { useEffect } from "react";

// Registra il service worker così il Pannello è installabile come app (PWA).
export default function RegisterSW() {
  useEffect(() => {
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}
