---
tipo: stato
aggiornato: 2026-06-26
fonte: AD digitale (dati reali Supabase + Stripe)
---

# 📟 STATO — Cruscotto dell'azienda

> Baseline del PRIMO PASSO. Verificato sul vivo (Supabase `clmpyfvpvfjgeviworth` + Stripe reale).
> Domani (25/6) i numeri devono iniziare a muoversi da 0.
>
> ⚠️ **26/6 — numeri NON riverificati:** nel giro del 26/6 né il Supabase MCP né la rete in
> uscita erano autorizzati e le chiavi `SUPABASE_URL`/`SUPABASE_SERVICE_KEY` non sono configurate.
> I 7 numeri qui sotto restano alla **baseline 24/6**, da riverificare appena un canale dati è
> sbloccato. Oggi (ven 26/6) è la **vigilia della prima consegna** (sab 27/6), slot ordini entro 21:00.

## I 7 numeri del primo passo (baseline = oggi 24/6)
| Numero | Oggi | "Riuscito" domani | Note |
|---|---|---|---|
| Negozi LIVE nel cluster (approvato + payout + ≥1 prodotto) | **0** | ≥1 | oggi 2 approvati su 17, ma solo 1 con payout |
| Prodotti VERI del faro pubblicati | **0** | ≥5 | (250 "available" attuali = seed/test, da ignorare) |
| Ordini creati | **0** | ≥1 | anche l'ordine-test conta come prova pipeline |
| Ordini pagati | **0** | 1 | |
| Payout testato | **0** | 1 | la prova che incassa-trattiene-paga gira |
| Nuovi clienti reali | **0** | ≥1 | |
| Consegnato (primo sabato 27/6) | **0** | 1 (sab) | concierge a mano |

## Semafori
- 🟢 Va bene: infrastruttura pronta (Stripe attivo, onboarding/COD nel codice, catalogo tecnico ok).
- 🟡 Da tenere d'occhio: solo 1 seller con payout attivo; catalogo "sporco" di seed; email da confermare.
- 🔴 Problema: **chiave Stripe live o sandbox?** (da confermare stasera) · branding Stripe = "boh".

## Ultime 3 mosse dell'AD
1. **Giro di perlustrazione 26/6** (vigilia prima consegna): giro a **dati-live mancanti**
   (DB + web non autorizzati); checklist vigilia pronta in `consegne/operations/` — vedi [[2026-06-26]].
2. **Giro 25/6**: 7 senior → pacchetto faro pronto (pitch, contratto, QR, payout, primo ordine).
3. Decisioni 🔴 bloccanti ancora in coda (Stripe live/sandbox, fee, commissione) — vedi [[AZIONI-IN-ATTESA]].

## Prossime priorità (da approvare)
- [ ] STASERA: confermare Stripe live/sandbox + sistemare branding + stampare materiali + creare form/IG.
- [ ] DOMANI 25/6 (vedi Piano del Mattino in [[SALA-OPERATIVA]]): ① Garetti LIVE · ② accendere domanda (QR+lista+storia) · ③ ordine-test fino al payout.
- [ ] SABATO 27/6: primo ordine reale consegnato concierge.
- [ ] ⛔ Sbloccare: Stripe live/sandbox + firme righe 1-2 di [[AZIONI-IN-ATTESA]].

---
*Scritto dall'AD. Per il dettaglio operativo vedi [[2026-06-25]]; per le decisioni [[DECISIONI]].*
