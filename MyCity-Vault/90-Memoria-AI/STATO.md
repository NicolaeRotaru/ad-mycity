---
tipo: stato
aggiornato: 2026-06-27 08:48
fonte: AD digitale (dati reali Supabase + Stripe)
---

# 📟 STATO — Cruscotto dell'azienda

> Baseline del PRIMO PASSO. Verificato sul vivo (Supabase `clmpyfvpvfjgeviworth` + Stripe reale).
> Domani (25/6) i numeri devono iniziare a muoversi da 0.
>
> ⚠️ **27/6 08:48 (passaggio 3, MATTINA) — Web ✅ / Supabase ❌:** il Web è tornato; ho preso il
> **meteo orario** di oggi (ore 8 = 28°C, ore 11 = 34°C, picco ore 17 = 38°C). **Supabase MCP ancora
> non autorizzato e NESSUN file .env** sul sistema → i 7 numeri restano alla baseline 24/6. Unico
> sblocco possibile: **autorizzare il Supabase MCP**. Oggi (sab 27/6) è il **GIORNO della prima
> consegna concierge** e la **finestra fresca è ADESSO**: priorità n°1 = consegnare i freschi
> **tra le 9:00 e le 10:30** (catena del freddo) — piano affinato con la curva oraria in
> `consegne/operations/2026-06-27-piano-caldo-prima-consegna.md`. Vedi [[2026-06-27]].

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
0a. **Giro 27/6 — 08:48 (passaggio 4):** chiuso il gap **ops-02** via WebSearch → **Supabase e Stripe
   OPERATIVI**, nessuna outage. Conclusione importante: il blackout sui 7 numeri **non è un guasto**, è
   solo il **permesso del Supabase MCP** da concedere. Le rotaie del payout per oggi sono in piedi (🟢).
   (Nota minore: monitor terzo segnala possibile intoppo sul componente Stripe "Acquirers" — riverificare ai primi incassi.) Vedi [[2026-06-27]].
0. **Giro 27/6 — 08:48 (mattina consegna):** check **meteo orario** live (8h=28°C, 11h=34°C, picco
   17h=38°C) → **finestra di consegna 9:00-10:30** blindata nel piano caldo (🟢). Verificato: nessun
   file .env → l'unico sblocco dati è autorizzare il Supabase MCP. Vedi [[2026-06-27]].
0bis. **Giro 27/6 — 00:39 (notte):** radar live → **caldo 38-39°C**. Scritto il **piano catena del
   freddo** per la consegna di oggi (🟢) e aggiornati i 3 file Intelligence del Pannello
   (eventi-picchi, concorrenti, buchi-mercato). Supabase cieco. Vedi [[2026-06-27]].
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
