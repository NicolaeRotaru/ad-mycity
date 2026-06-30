---
tipo: stato
aggiornato: 2026-07-01 01:00
fonte: AD digitale (7 numeri = live REST 1/7 00:17 · Supabase clmpyfvpvfjgeviworth · memoria DB · Pannello azioni_log 30/6 09:08)
---

# 📟 STATO — Cruscotto dell'azienda

> 🧠 **1/7 01:00 — Nicola rimanda presidio VP 3/7** (focus **inserimento negozi 6/7**). Casa Linda = DEMO; unico negozio reale = **Pane Quotidiano**. Stallo ~158h. Collo di bottiglia: **sbloccare ordine zombie €19,05** + **payout Stripe Pane Quotidiano** + onboarding batch 6/7.

## I 7 numeri (live 2026-07-01 00:56 · Supabase REST clmpyfvpvfjgeviworth)
| Numero | Oggi (1/7) | "Riuscito" | Note |
|---|---|---|---|
| Negozi REALI approvati | **1** (Pane Quotidiano) | ≥1 LIVE vero | Casa Linda = demo/seed — esclusa |
| Negozi con payout attivo | **0 reali** | 1 | Casa Linda payout demo; Pane Quotidiano payout OFF |
| Prodotti VERI del faro pubblicati | **0** | ≥5 | 250 "available" = seed/test, 7 draft, 1 sold |
| Ordini creati | **1** | ≥1 | COD €19,05 del 24/6, fermo su PENDING/NEW da **~6,6 giorni** |
| Ordini pagati | **0** | 1 | COD non incassato |
| Ordini consegnati | **0** | 1 | nessuna consegna mai avvenuta |
| Payout testato | **0** | 1 | mai eseguito |
| Nuovi clienti reali | **4 buyer** (0 ultimi 7g) | crescita | ultimo nuovo: "samir?" il 16/6 |

## Semafori
- 🟢 Va bene: infrastruttura pronta (REST Supabase OK marketplace + memoria; Stripe operativo; 407 lead `to_contact`; fallback REST quando MCP cieco).
- 🟡 Da tenere d'occhio: catalogo seed; ordine zombie 6,6 gg; **6 carrelli** con items abbandonati >4h; bando ER **20 giorni**; **onboarding negozi 6/7** (Nicola); **168h tra ~10h**; allerta temporali oggi. VP 3/7 presidio **rimandato** da Nicola.
- 🔴 Problema: **stallo 157,8h**; 0 transazioni reali; **~20 azioni approvate in Pannello ma 0 inviate** (mani non collegate).

## DB memoria Pannello (live 2026-07-01 00:06 · REST `xjljcsorpbqwttrejqte`)
| Tabella | Righe | Note |
|---|---|---|
| briefings | **11+** | popolata |
| lavori | **27** | popolata |
| conversazioni | **5** | popolata |

## Pannello · approvazioni Nicola (30/6 ~09:08)
| Esito | Quante | Note |
|---|---|---|
| ❌ Rifiutate | **2** | #10 wiring Vercel · kit earned media PR |
| ✅ Approvate → in coda | **~20** | Es. #1–3, #9, #12 + social/marketing |
| 🚀 Inviate sul mondo reale | **0** | Canali social/email non collegati |

## Mani · stato worker (30/6 23:32)
| Mano | Stato | Sblocca |
|---|---|---|
| Telegram | ❌ spenta | Avvisi esecuzione |
| Resend (email) | ❌ spenta | Kit bando #12, CRM |
| n8n | ❌ spenta | Hub social |
| `AZIONI_LIVE` | **0** | Trasforma approvato → inviato |
| Meta (IG/FB) | ❌ spenta | ~16 post in coda |

## Ultime mosse dell'AD
1. **Metabolizzazione 1/7 00:58** — Lezione L-2026-0701-04 (Casa Linda demo; Pane Quotidiano unico reale) in apprendimento.json + quaderni squadra.
2. **Chat 1/7 01:00** — Nicola rimanda presidio VP 3/7 (kit QR + contenuti): priorità = **inserire negozi del 6/7**. Proposta Pannello congelata; #7/#11 in attesa post-onboarding.
2. **Chat 1/7 00:35** — Web per tutti i senior: WebFetch globale + policy `WEB-APPRENDIMENTO-SENIOR.md` + 42 mansionari (fonte: chat Nicola 1/7). **Worker VPS:** serve pull `memoria-ad` per nuovo `settings.json`.
2. **Giro 1/7 00:17** — 7 numeri live REST (= vs 30/6 23:15). Stallo 157,8h ▲+1h. Playbook temporali 🟢. Vedi [[2026-07-01]].
3. **Chat 1/7 00:06** — Confermato accesso live marketplace + memoria Pannello (REST OK).
4. **Giro 30/6 23:15** — Nota escalation 168h 🟢. Sesto passaggio 30/6.

## Prossime priorità (da approvare)
- [ ] 🔴 **Sbloccare ordine zombie €19,05 — Pane Quotidiano** (1ª transazione reale)
- [ ] 🔴 **Completare payout Stripe — Pane Quotidiano** (charges+payouts OFF)
- [ ] 🔴 **Onboarding negozi 6/7** — Nicola inserisce batch (AD prepara checklist @onboarding-negozi)
- [ ] 🔴 Firmare le 3 decisioni di lancio — [[AZIONI-IN-ATTESA]]
- [ ] ~~Forzare transazione Casa Linda~~ — **RITIRATA** (negozio demo)
- [ ] ~~Presidio VP 3/7~~ — **RIMANDATO** da Nicola 1/7 (kit #7/#11 congelati; prossima finestra utile VP **10/17 lug** se link lista pronto)
- [ ] 🟡 **Kit "Bando ER + MyCity"** (#12, scade 21/7)

---
*Scritto dall'AD. Dettaglio in [[2026-07-01]]; decisioni in [[DECISIONI]].*
