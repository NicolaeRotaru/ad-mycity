---
tipo: stato
aggiornato: 2026-07-01 01:38
fonte: AD digitale (7 numeri = live REST 1/7 00:17 · Supabase clmpyfvpvfjgeviworth · memoria DB · Pannello foglio-firma 1/7 01:02)
---

# 📟 STATO — Cruscotto dell'azienda

> 🧠 **1/7 01:02 — Foglio-firma lancio CHIUSO da Nicola:** (1) crea contratto 12% Pane Quotidiano ✅ bozza pronta · (2) payout-test **03/7 mattina** (lui) · (3) Stripe **sandbox** → COD fino a LIVE. Focus resta: **ordine zombie €19,05** + onboarding negozi **6/7**.

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
- 🟡 Da tenere d'occhio: catalogo seed; ordine zombie 6,6 gg; **6 carrelli** con items abbandonati >4h; **bando FESR Commercio ER chiuso 23/6** (tet domande — giro web 1/7) → kit #12 da rivedere prima del pitch; **onboarding negozi 6/7** (Nicola); **168h tra ~10h**; allerta temporali oggi. VP 3/7 presidio **rimandato** da Nicola. **Web senior:** giro **42/42** ✅ · policy+mansionari ✅ · **WebFetch globale live su worker** ✅ (merge `fix/webfetch-globale` + `aggiorna-cervello.sh` Nicola 1/7 01:37) · **Quaderni senior:** PR `fix/quaderni-senior` su **`main` in attesa merge** → Vercel redeploy · limiti **lato sito** restano (IG/paywall/Idealista anti-bot) — ripiego WebSearch · Nicola **non** fa pull `memoria-ad`.
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
1. **Metabolizzazione 1/7 01:38** — Nicola: merge PR WebFetch + `aggiorna-cervello.sh` + «apri la pr quaderni su main» → ciclo WebFetch **chiuso** (worker naviga); branch `fix/quaderni-senior` pushato (`9c5dc8e`), merge GitHub in attesa. L-2026-0701-16 + patch L-0701-03/12/13/14. Fonte: chat Nicola 1/7 01:37.
2. **Chat 1/7 01:37** — Nicola conferma merge PR **WebFetch globale** su `main` + esegue `aggiorna-cervello.sh`; chiede «apri la pr quaderni su main» → branch `fix/quaderni-senior` pushato, link compare GitHub. Fonte: chat Nicola 1/7 01:37.
2. **Chat 1/7 01:34** — Nicola: «aggiungi quaderni senior» → tab **Quaderni senior** in Memoria + API `/api/memoria/quaderni` (legge `memoria-squadra/` da memoria-ad); fix `listRepoDir` in `vault.ts`. **Locale ok** · deploy Vercel = PR su **`main`**. L-2026-0701-15. Fonte: chat Nicola 1/7 01:34.
2. **Chat 1/7 01:31** — Nicola: «rimandami la pr che non ho mergiato» → re-inviato link compare `main...fix/webfetch-globale` + post-merge `aggiorna-cervello.sh`; PR **ancora in attesa** merge GitHub. Fonte: chat Nicola 1/7 01:31.
2. **Chat 1/7 01:29** — Nicola: «fai giro web a tutti i senior» → **42/42** completati; sintesi top-10 + report `consegne/ad/2026-07-01-giro-web-senior.md`; quaderni aggiornati; handoff Sala Operativa (FESR chiuso, GDPR marketplace, fee consegna checkout). Giro iniziale in **Cursor**; worker allineato post-merge WebFetch 01:37. L-2026-0701-14.
2. **Chat 1/7 01:25** — Nicola: «ci altri siti con webfetch a cui non puoi aderire?» → risposta a due binari: whitelist worker (11 domini fino a merge PR) vs resistenza lato sito (IG/paywall/anti-bot); test Cursor catalogati; ripiego WebSearch. L-2026-0701-13.
2. **Chat 1/7 01:23** — Nicola: «apri la pr su main» → branch `fix/webfetch-globale` pushato (`3ccfb05`, WebFetch globale in `settings.json`); PR da mergiare su GitHub (token VPS push ✓, API PR ✗). Post-merge: `aggiorna-cervello.sh`. L-2026-0701-12.
2. **Chat 1/7 01:19** — Nicola: «come faccio PR su main?» → playbook: fix codice su **`main`** (non memoria-ad); due vie = AD apre PR o GitHub UI 8 passi; post-merge = `aggiorna-cervello.sh`. L-2026-0701-11.
3. **Chat 1/7 01:16** — Nicola esegue `sudo bash cervello/vps/aggiorna-cervello.sh`: worker **attivo** ✓ · commit `1394219` allinea a main · **`settings.json` = ancora whitelist** (11 domini) — WebFetch globale assente su `origin/main`. Percorso sync **corretto** (L-2026-0701-09); blocco resta PR su `main` + secondo sync. Fonte: chat Nicola 1/7 01:16.
1. **Chat 1/7 01:13** — Nicola: «come fanno ad essere arrivate su main?» → AD ammette: **WebFetch globale non è mai stato su `main`** (DECISIONI 00:35 sovrastimata). Fatto: policy su memoria-ad. Mancante: PR `settings.json` su main. Test Cursor ingannevole (IDE ≠ worker). L-2026-0701-10.
1. **Chat 1/7 01:11** — Nicola corregge: **non può fare pull su `memoria-ad`** (conflitti). AD corregge: binario memoria (worker) vs codice (`main`); sync VPS = `aggiorna-cervello.sh` o giro Pannello; WebFetch globale ancora da mergiare su `main`. L-2026-0701-09.
1. **Chat 1/7 01:08** — Nicola chiede come verificare web senior e vedere output: risposta con check tecnico (settings + test @seo) e mappa osservabilità (Sala Operativa, briefing, memoria-squadra, consegne — no log HTTP). Proposta vista «Quaderni senior» in Pannello 🟡 in attesa. *(Consiglio pull memoria-ad — **errato**, corretto 01:11.)*
1. **Metabolizzazione 1/7 01:08** — L-2026-0701-08 (verifica + osservabilità web) + preferenza Nicola in apprendimento.json.
1. **Metabolizzazione 1/7 01:07** — Lezione L-2026-0701-07 (impegni Nicola ≠ card 🔴) + preferenza in apprendimento.json.
1. **Chat 1/7 01:03** — Nicola: «perché devo approvare?» su card onboarding 6/7 → **non serve** (lavoro suo); proposta ritirata dal Pannello.
1. **Chat 1/7 01:02** — Nicola firma foglio-firma lancio: #1 contratto Pane Quotidiano (12%) · #2 payout-test 03/7 mattina · #3 Stripe sandbox. Bozza `consegne/legale/contratto-pane-quotidiano-bozza.md`. Aggiornati DECISIONI, AZIONI #1-2, STATO.
1. **Metabolizzazione 1/7 00:58** — Lezione L-2026-0701-04 (Casa Linda demo; Pane Quotidiano unico reale) in apprendimento.json + quaderni squadra.
1. **Metabolizzazione 1/7 01:06** — Lezione L-2026-0701-06 (foglio-firma: imperativi Nicola, payout 03/7 lui, sandbox confermato) + quaderni finanza/legale/vendite.
1. **Metabolizzazione 1/7 01:05** — Lezione L-2026-0701-05 (ops 6/7 > presidio VP) + sync #8 RIMANDATO.
2. **Chat 1/7 01:00** — Nicola rimanda presidio VP 3/7 (kit QR + contenuti): priorità = **inserire negozi del 6/7**. Proposta Pannello congelata; #7/#8/#11 in attesa post-onboarding.
2. **Chat 1/7 00:35** — Web per tutti i senior: WebFetch globale + policy `WEB-APPRENDIMENTO-SENIOR.md` + 42 mansionari (fonte: chat Nicola 1/7). **VPS:** merge su `main` + `aggiorna-cervello.sh` (non pull manuale memoria-ad).
2. **Giro 1/7 00:17** — 7 numeri live REST (= vs 30/6 23:15). Stallo 157,8h ▲+1h. Playbook temporali 🟢. Vedi [[2026-07-01]].
3. **Chat 1/7 00:06** — Confermato accesso live marketplace + memoria Pannello (REST OK).
4. **Giro 30/6 23:15** — Nota escalation 168h 🟢. Sesto passaggio 30/6.

## Prossime priorità (da approvare)
- [ ] 🔴 **Sbloccare ordine zombie €19,05 — Pane Quotidiano** (1ª transazione reale; COD coerente con sandbox)
- [ ] 🔴 **Payout-test Stripe — Nicola 03/7 mattina** (sandbox confermato; poi valutare passaggio LIVE)
- [ ] 🔴 **Firma contratto col negozio** — bozza pronta, serve validazione legale + firma Pane Quotidiano
- [ ] 🟢 **Onboarding negozi 6/7** — **Nicola inserisce** (lavoro suo, non serve approvazione Pannello); AD prepara checklist @onboarding-negozi
- [x] ~~Firmare le 3 decisioni di lancio~~ — **FATTO** Nicola 1/7 01:02
- [ ] ~~Forzare transazione Casa Linda~~ — **RITIRATA** (negozio demo)
- [ ] ~~Presidio VP 3/7~~ — **RIMANDATO** da Nicola 1/7 (kit #7/#11 congelati; prossima finestra utile VP **10/17 lug** se link lista pronto)
- [ ] 🟡 **Kit "Bando ER + MyCity"** (#12) — **⚠️ rivedere:** FESR Commercio ER **chiuso 23/6** (giro web 1/7); non promettere 40% fondo perduto finché kit non aggiornato

---
*Scritto dall'AD. Dettaglio in [[2026-07-01]]; decisioni in [[DECISIONI]].*
