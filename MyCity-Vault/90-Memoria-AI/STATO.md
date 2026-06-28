---
tipo: stato
aggiornato: 2026-06-28 20:25
fonte: AD digitale (dati reali Supabase clmpyfvpvfjgeviworth — riverificati live)
---

# 📟 STATO — Cruscotto dell'azienda

> 🧠 **28/6 20:25 — MEMORIA COSTRUITA E COLLEGATA.** Il DB-memoria separato (`xjljcsorpbqwttrejqte`) è
> creato e verificato (5 tabelle, RLS) e ci ho scritto dentro il primo briefing. La memoria della Cabina
> ora persiste davvero. Resta solo il wiring Vercel (service key, lato Nicola).
> ⚠️ Business invariato dalle 16:46: stessi 7 numeri, **stallo a ~106h** (ultima attività 24/6 08:28). Il
> collo di bottiglia resta **far avvenire la prima transazione end-to-end** (leva: Casa Linda, payout-ready).

## I 7 numeri (verificati live 2026-06-28 20:25 · Supabase clmpyfvpvfjgeviworth)
| Numero | Oggi (28/6) | "Riuscito" | Note |
|---|---|---|---|
| Negozi approvati (con payout) | **2 approvati / 1 payout** | ≥1 LIVE vero | Casa Linda (payout ok) + Pane Quotidiano |
| Prodotti VERI del faro pubblicati | **0** | ≥5 | 250 "available" = seed/test, 7 draft, 1 sold |
| Ordini creati | **1** | ≥1 | COD €19,05 del 24/6, fermo su PENDING/NEW |
| Ordini pagati | **0** | 1 | l'unico ordine è COD non ancora incassato |
| Ordini consegnati | **0** | 1 | la "prima consegna 27/6" NON risulta avvenuta |
| Payout testato | **0** | 1 | mai eseguito un payout reale |
| Nuovi clienti reali | **4 buyer** (0 negli ultimi 7g) | crescita | nessun nuovo profilo nell'ultima settimana |

## Semafori
- 🟢 Va bene: **database ricollegato**; infrastruttura pronta (Stripe, COD, onboarding, 407 lead censiti, 250 prodotti seed).
- 🟡 Da tenere d'occhio: catalogo-vetrina ancora "finto" (solo seed); ordine €19,05 zombie da 4 giorni; 4 carrelli abbandonati.
- 🔴 Problema: **stallo da ~106h** (0 ordini/0 eventi); 3 decisioni di lancio ancora non firmate.

## Ultime mosse dell'AD
1. **Giro 28/6 20:25** — Memoria costruita (DB separato `xjljcsorpbqwttrejqte`, 5 tabelle, verificato) e primo briefing scritto dentro. 2ª lettura numeri: invariati, stallo a ~106h. Scan esterno live (@intelligence). Vedi [[2026-06-28]].
2. **Giro 28/6 16:46** — DB marketplace ricollegato: riverificati i numeri veri dal 24/6. Stallo confermato. 4 cadenze in un colpo.
3. Confermate nel registro 2 entità reali: **Casa Linda** e **Pane Quotidiano** (negozi approvati, nei dati) + entità «DB Memoria».
4. MACCHINA DI MARKETING completa: piano editoriale + 7 pacchetti contenuti + Content Factory.

## Prossime priorità (da approvare)
- [ ] 🔴 **Forzare la prima transazione con Casa Linda** (payout-ready): 1 prodotto vero → ordine-test → payout.
- [ ] 🔴 **Sbloccare l'ordine zombie €19,05** (accettare o annullare con nota al buyer).
- [ ] 🟡 Partire coi primi 10 dei **407 lead `to_contact`**.
- [ ] 🔴 Firmare le 3 decisioni di lancio (Stripe live/sandbox, commissione, fee) — [[AZIONI-IN-ATTESA]].
- [x] ✅ **Memoria chiarita** (Nicola, 28/6 16:52): progetto Supabase **separato** dal marketplace.
- [x] ✅ **Tabelle-memoria rimosse dal marketplace** (28/6 17:05): le 5 tabelle vuote tolte da `clmpyfvpvfjgeviworth`, business intatto. Backup ri-creabile in `pannello/sql/memoria-schema.sql`.
- [x] ✅ **Schema memoria creato nel DB-memoria separato** (28/6 20:19): collegato il DB-memoria agli strumenti (config MCP `.mcp.json` a 2 connessioni: marketplace RO + memoria RW) e applicato `pannello/sql/memoria-schema.sql` al progetto `xjljcsorpbqwttrejqte` → 5 tabelle (briefings·diario·lavori·conversazioni·impostazioni), RLS attiva, verificato live (advisor = solo INFO atteso). Resta solo il wiring Vercel.
- [ ] 🟡 **Vercel**: puntare `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` al DB-memoria + Redeploy (poi "Memoria collegata" diventa verde).

---
*Scritto dall'AD. Dettaglio del giro in [[2026-06-28]]; decisioni in [[DECISIONI]].*
