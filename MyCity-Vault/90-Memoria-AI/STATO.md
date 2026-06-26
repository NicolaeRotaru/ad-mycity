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

## Ultime mosse dell'AD
1. **Giro 26/6 — 2° passaggio** (dati ancora bloccati): consolidato le 3 decisioni 🔴 in un
   **foglio-firma da 2 minuti** `consegne/decisioni/2026-06-26-foglio-firma-lancio.md` per
   sbloccare la prima consegna. Vedi [[2026-06-26]].
2. **Giro 26/6 — 1° passaggio** (vigilia prima consegna): dati-live mancanti; checklist vigilia
   in `consegne/operations/2026-06-26-vigilia-prima-consegna.md`.
3. **MACCHINA DI MARKETING completa**: piano editoriale 4 settimane + 7 pacchetti di contenuti/copy
   (16 post, 7 flussi email, kit stampa, 8 reel, SEO/GBP, visivo) + **Marketing Autopilot** (scheduler
   + 5 publisher + n8n, dry-run) + **Content Factory** che genera **contenuti grafici VERI** (post PNG
   + reel): prodotti i contenuti S1, le **5 categorie** e i **5 "vincenti dei competitor" (W1–W5)**.
   Vedi [[2026-06-24-piano-editoriale]].
4. **Costruttore → DNA v1.1**: capacità di auto-marketing innestata nel genoma (riusabile da ogni
   Organismo). Comando **"contenuti pro"** salvato nel pannello.
5. **Giro 25/6**: 7 senior → pacchetto faro pronto (pitch, contratto, QR, payout, primo ordine).
   Decisioni 🔴 bloccanti ancora in coda (Stripe live/sandbox, fee, commissione) — [[AZIONI-IN-ATTESA]].

## Prossime priorità (da approvare)
- [ ] STASERA: confermare Stripe live/sandbox + sistemare branding + stampare materiali + creare form/IG.
- [ ] DOMANI 25/6 (vedi Piano del Mattino in [[SALA-OPERATIVA]]): ① Garetti LIVE · ② accendere domanda (QR+lista+storia) · ③ ordine-test fino al payout.
- [ ] SABATO 27/6: primo ordine reale consegnato concierge.
- [ ] ⛔ Sbloccare: Stripe live/sandbox + firme righe 1-2 di [[AZIONI-IN-ATTESA]].

---
*Scritto dall'AD. Per il dettaglio operativo vedi [[2026-06-25]]; per le decisioni [[DECISIONI]].*
