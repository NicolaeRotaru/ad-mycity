---
tipo: quaderno-memoria
reparto: cro
---

# 🧠 Quaderno di cro
> Cosa ho imparato. Leggi all'inizio, aggiungi un ESITO alla fine di ogni lavoro.

## Esiti
- (ancora vuoto)

- 2026-06-25 · contenuto C4 POV/ZTL relatable · format POV "dolore quotidiano specifico → soluzione leggera in chiusura" funziona per top-of-funnel/share: la specificità (8:01, 3 giri, 83€) genera il tag, non il claim brand · KPI giusto = share+tag+commenti (NON vendite: sarebbe disonesto) · serie serializzabile a basso costo · lezione: footer brand a filo cornice → comprimere spaziature title/lista/cta nel template portrait 1080x1350 per non tagliarlo · #content #pov #relatable #funnel-top
- 2026-07-01 · giro web · FATTO (30 giu 2026): sequenziamento wallet per device (Apple Pay/Google Pay primo) segnala lift conversione mobile 6-11% in test A/B citati; checkout = superficie ad alta leva con CAC alti · https://onlinestorenews.com/checkout-page-abandonment-is-getting-a-data-driven-fix-in-2026/ · lezione: audit checkout MyCity mobile — Satispay/wallet in primo piano, costi spedizione visibili pre-checkout · #cro #checkout #wallet #mobile
- 2026-08-21 · audit design dim. flussi-conversione (repo mycity, sola lettura) · 14 difetti reali: 2 bloccanti (muro registrazione+verifica email all'ultimo clic; BuyerOnboardingTour montato in app/layout.tsx senza esclusione di rotta → modale sopra /checkout col CTA finale verso /search) · il filone piu' ricco NON e' il layout ma le PROMESSE non mantenute tra uno step e l'altro: "spedizione gratis" (soglia globale nel carrello vs per-negozio al checkout), "paghi alla consegna" (Compra ora atterra su checkout preselezionato Carta), "€5 di benvenuto automatici" (nessun automatismo in /api/orders/cod ne' stripe/checkout), credito MyCity invisibile sul percorso carta · lezione: in un funnel gia' curato nei dettagli i soldi cadono nelle GIUNTURE fra schermate, dove due file diversi calcolano la stessa cosa con due regole — cercare le costanti duplicate e i claim ripetuti, non i pixel · A/B home_hero acceso (enabled:true) con 0 ordini consegnati = zero potenza, spegnere e misurare prima/dopo · #cro #checkout #funnel #promesse-rotte #audit-design
