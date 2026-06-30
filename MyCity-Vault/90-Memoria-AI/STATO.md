---
tipo: stato
aggiornato: 2026-07-01 00:36
fonte: AD digitale (7 numeri = live REST 1/7 00:17 · Supabase clmpyfvpvfjgeviworth · memoria DB · Pannello azioni_log 30/6 09:08)
---

# 📟 STATO — Cruscotto dell'azienda

> 🧠 **1/7 00:17 — STALLO 157,8h, DATI LIVE CONFERMATI (= vs 23:15).** Primo giro del 1/7. Business invariato dal 24/6. **Soglia 168h (7 giorni) tra ~10 ore.** **Oggi allerta gialla temporali+caldo (ER).** **VP 3/7 tra ~66 ore** (49 eventi). Collo di bottiglia: **prima transazione Casa Linda** + **ordine zombie €19,05** + **link lista d'attesa**.

## I 7 numeri (live 2026-07-01 00:17 · Supabase REST clmpyfvpvfjgeviworth)
| Numero | Oggi (1/7) | "Riuscito" | Note |
|---|---|---|---|
| Negozi approvati (con payout) | **2 approvati / 1 payout** | ≥1 LIVE vero | Casa Linda (payout ok) + Pane Quotidiano |
| Prodotti VERI del faro pubblicati | **0** | ≥5 | 250 "available" = seed/test, 7 draft, 1 sold |
| Ordini creati | **1** | ≥1 | COD €19,05 del 24/6, fermo su PENDING/NEW da **~6,6 giorni** |
| Ordini pagati | **0** | 1 | COD non incassato |
| Ordini consegnati | **0** | 1 | nessuna consegna mai avvenuta |
| Payout testato | **0** | 1 | mai eseguito |
| Nuovi clienti reali | **4 buyer** (0 ultimi 7g) | crescita | ultimo nuovo: "samir?" il 16/6 |

## Semafori
- 🟢 Va bene: infrastruttura pronta (REST Supabase OK marketplace + memoria; Stripe operativo; 407 lead `to_contact`; fallback REST quando MCP cieco).
- 🟡 Da tenere d'occhio: catalogo seed; ordine zombie 6,6 gg; **6 carrelli** con items abbandonati >4h; bando ER **20 giorni**; VP 3/7 tra ~66h senza link lista; **168h tra ~10h**; allerta temporali oggi.
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
1. **Chat 1/7 00:35** — Web per tutti i senior: WebFetch globale + policy `WEB-APPRENDIMENTO-SENIOR.md` + 42 mansionari (fonte: chat Nicola 1/7). **Worker VPS:** serve pull `memoria-ad` per nuovo `settings.json`.
2. **Giro 1/7 00:17** — 7 numeri live REST (= vs 30/6 23:15). Stallo 157,8h ▲+1h. Playbook temporali 🟢. Vedi [[2026-07-01]].
3. **Chat 1/7 00:06** — Confermato accesso live marketplace + memoria Pannello (REST OK).
4. **Giro 30/6 23:15** — Nota escalation 168h 🟢. Sesto passaggio 30/6.

## Prossime priorità (da approvare)
- [ ] 🔴 **Forzare la prima transazione con Casa Linda** — **168h tra ~10h**
- [ ] 🔴 **Sbloccare l'ordine zombie €19,05**
- [ ] 🔴 **Link lista d'attesa** — sblocca presidio VP 3/7 (#6, #7, #11)
- [ ] 🔴 Firmare le 3 decisioni di lancio — [[AZIONI-IN-ATTESA]]
- [ ] 🟡 **Kit "Bando ER + MyCity"** (#12, scade 21/7)
- [ ] 🟡 **Presidio VP 3/7** — checklist in `consegne/operations/2026-06-30-checklist-countdown-vp-3-luglio.md`

---
*Scritto dall'AD. Dettaglio in [[2026-07-01]]; decisioni in [[DECISIONI]].*
