---
tipo: stato
aggiornato: 2026-07-01 00:06
fonte: AD digitale (7 numeri = live REST 30/6 23:15 · memoria DB live 1/7 00:06 chat · Supabase clmpyfvpvfjgeviworth · Pannello azioni_log 30/6 09:08 · worker mani 30/6 23:32)
---

# 📟 STATO — Cruscotto dell'azienda

> 🧠 **30/6 23:15 — STALLO 156,8h, DATI LIVE CONFERMATI (=).** Sesto passaggio del giorno; business invariato dal 24/6. **Soglia 168h (7 giorni) tra ~11 ore** se nulla cambia. **VP 3/7 tra ~46 ore** (49 eventi). **Domani 1/7 allerta gialla temporali** (ER). Collo di bottiglia: **prima transazione Casa Linda** + **ordine zombie €19,05** + **link lista d'attesa**.

## I 7 numeri (live 2026-06-30 23:15 · Supabase REST clmpyfvpvfjgeviworth)
| Numero | Oggi (30/6) | "Riuscito" | Note |
|---|---|---|---|
| Negozi approvati (con payout) | **2 approvati / 1 payout** | ≥1 LIVE vero | Casa Linda (payout ok) + Pane Quotidiano |
| Prodotti VERI del faro pubblicati | **0** | ≥5 | 250 "available" = seed/test, 7 draft, 1 sold |
| Ordini creati | **1** | ≥1 | COD €19,05 del 24/6, fermo su PENDING/NEW da **~6,5 giorni** |
| Ordini pagati | **0** | 1 | COD non incassato |
| Ordini consegnati | **0** | 1 | nessuna consegna mai avvenuta |
| Payout testato | **0** | 1 | mai eseguito |
| Nuovi clienti reali | **4 buyer** (0 ultimi 7g) | crescita | ultimo nuovo: "samir?" il 16/6 |

## Semafori
- 🟢 Va bene: infrastruttura pronta (REST Supabase OK su **entrambi** i progetti — marketplace RO + memoria Pannello — da `cervello/vps/.env`; Stripe operativo; 407 lead `to_contact`; fallback REST quando MCP cieco / manca `SUPABASE_ACCESS_TOKEN`).
- 🟡 Da tenere d'occhio: catalogo seed; ordine zombie 6,5 gg; **6 carrelli** con items abbandonati >4h; bando ER 21 giorni; VP 3/7 tra ~46h senza link lista; **168h tra ~11h**.
- 🔴 Problema: **stallo 156,8h**; 0 transazioni reali; **~20 azioni approvate in Pannello ma 0 inviate** (mani non collegate).

## DB memoria Pannello (live 2026-07-01 00:06 · REST `xjljcsorpbqwttrejqte` · fonte: chat Nicola 1/7)
| Tabella | Righe | Note |
|---|---|---|
| briefings | **11** | popolata |
| lavori | **27** | popolata |
| conversazioni | **5** | popolata |

> L'AD legge il DB memoria da worker; la Cabina **Vercel** resta scollegata finché non si fa wiring env (#10 rifiutato 30/6) — gap deploy, non assenza dati.

## Pannello · approvazioni Nicola (30/6 ~09:08, fonte: chat + `azioni_log` Supabase memoria)
| Esito | Quante | Note |
|---|---|---|
| ❌ Rifiutate | **2** | #10 wiring Vercel · kit earned media PR |
| ✅ Approvate → in coda | **~20** | Es. #1–3, #9, #12 + social/marketing; ok strategico, non partite |
| 🚀 Inviate sul mondo reale | **0** | Canali social/email non collegati |

> Gap 🟡: click Pannello → DB memoria sì, vault (`DECISIONI`/`AZIONI`) no automatico — sincronizzato in metabolizzazione 30/6 23:29.

## Mani · stato worker (30/6 23:32, fonte: verifica worker + chat Nicola)
| Mano | Stato | Sblocca |
|---|---|---|
| Telegram | ❌ spenta | Avvisi esecuzione + test sicuro |
| Resend (email) | ❌ spenta | Kit bando #12, CRM, PR |
| n8n | ❌ spenta | Hub IG/FB/gruppi/WhatsApp |
| `AZIONI_LIVE` | **0** (kill-switch) | Trasforma approvato → inviato |
| Meta (IG/FB) | ❌ spenta | ~16 post social in coda |
| Supabase write marketplace | ❌ manca | Notifiche in-app, coupon, admin |

**Starter pack minimo** (prima azione ✅ inviata): Telegram + Resend + `AZIONI_LIVE=1` sul VPS. Checklist: `cervello/collega-le-mani.md`.
Alcune azioni approvate **non richiedono chiavi** (#1 termini Garetti di persona, #2 scelta payout, #3 concierge umano, #9 ok strategico, link lista d'attesa = prodotto).

## Ultime mosse dell'AD
1. **Chat 1/7 00:06** — Confermato accesso live a **marketplace + memoria Pannello** (REST, entrambi OK). MCP senza token; gap Vercel = wiring #10, non DB.
2. **Giro 30/6 23:15** — Conferma live 7 numeri (= vs 23:10). Nota escalation 168h 🟢. Sesto passaggio — onesto (L-2026-0629-03). Vedi [[2026-06-30]].
2. **Giro 30/6 23:10** — Snapshot KPI 🟢. Quinto passaggio giornata.
3. **Giro 30/6 23:08** — Checklist countdown VP 3/7 🟢.

## Prossime priorità (da approvare)
- [ ] 🔴 **Forzare la prima transazione con Casa Linda** (payout-ready) — **168h tra ~11h**
- [ ] 🔴 **Sbloccare l'ordine zombie €19,05**
- [ ] 🔴 **Link lista d'attesa** — sblocca presidio VP 3/7 (#6, #7, #11)
- [ ] 🔴 Firmare le 3 decisioni di lancio — [[AZIONI-IN-ATTESA]]
- [ ] 🟡 **Kit "Bando ER + MyCity"** (#12, scade 21/7)
- [ ] 🟡 **Presidio VP 3/7** — checklist in `consegne/operations/2026-06-30-checklist-countdown-vp-3-luglio.md`
- [x] ✅ Nota escalation stallo 168h (30/6 23:15)

---
*Scritto dall'AD. Dettaglio in [[2026-06-30]]; decisioni in [[DECISIONI]].*
