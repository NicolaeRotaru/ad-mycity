// Service worker minimo: abilita l'installazione come app sul telefono.
// Nessuna cache aggressiva: le richieste passano normalmente alla rete.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
