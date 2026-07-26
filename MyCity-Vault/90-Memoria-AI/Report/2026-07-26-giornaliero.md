---
tipo: report-giornaliero
data: 2026-07-26 21:20
fonte: AD digitale
---

# Report giornaliero — 26 luglio 2026

## La situazione in una riga

Business **fermo esattamente come ieri** — **0 ordini pagati**, stallo **32 giorni** dall'unico ordine di test del 24/6 — coerente con la pausa negozi decisa da Nicola il 23/7 (ripresa 24/8-1/9). Giornata di sola manutenzione interna: nessuna spinta commerciale, priorità concentrata sulla domanda economica della notte (quanti ordini servono per 10.000€/mese — corretta due volte per costi/ricavi dimenticati) e su piccole pulizie di memoria/apprendimento. L'orologio più urgente resta **PI26: scade tra 4 giorni (30/7 ore 16:00)**, ancora ferma in attesa di 3 risposte da Nicola.

---

## Numeri chiave (ore 21:20 — query dirette ora su Supabase, tabelle `profiles`/`orders`/`products`/`activity_events`)

| KPI | Valore | Var. vs ieri |
|-----|--------|---------------------|
| **Ordini pagati (North Star)** | **0** | = |
| Ordini creati nel database | 1 (annullato, €19,05 COD, 24/6) — dato di test, escluso dai conteggi reali | = |
| Ordini consegnati | 0 | = |
| **Clienti iscritti** | **7** (4 buyer, 1 seller, 1 rider, 1 admin) — 0 nuovi oggi | = |
| Negozi live/approvati | **1** (Pane Quotidiano) | = |
| Prodotti pubblicati | **5** | = |
| Incasso pagato | **0 €** | = |
| Payout versati ai negozi | **0 €** | = |
| Cassa disponibile (Stripe) | **0 €** — burn mensile ancora non impostato nel `.env` del VPS, runway non calcolabile (noto da 256 giri) | = |
| Attività sul sito oggi | **0 eventi** (anche ieri 0) | = |
| Lead negozi in pipeline | **407** (baseline 7/7, non lavorati oggi) | = |
| Stallo North Star | **32 giorni** dall'ultimo ordine (24/6) | +1 |
| Notifiche in coda non inviate | **84** (mancano le chiavi Telegram) | +2 |

Nessun numero di business è cambiato: coerente con la decisione di Nicola del 23/7, l'inserimento negozi resta rinviato al 24/8-1/9.

---

## Cosa è successo oggi

**Notte (00:40-01:44) — Nicola ha chiesto i conti sul primo mese ("quanto guadagno", "quanti ordini per 10.000€/mese"), e mi ha corretto due volte per numeri incompleti.** Prima ho contato solo il burn fisso (~302€/m) dimenticando il costo del kit fisico per negozio (QR/vetrofania/sacchetti, 80-150€/negozio) quando sul tavolo c'era un volume di 50 negozi — corretto (totale reale ~4.600-8.100€, non 600€). Poi, sul target di 10.000€/mese, avevo contato solo la commissione 10% dimenticando l'abbonamento fisso (50€/mese/negozio) e la fee di consegna fissa (3€/ordine, trovata solo nel codice del marketplace) — con tutti e tre dentro, il numero di ordini necessari scende da ~5.000 a ~1.500/mese. Entrambe le lezioni sono ora scritte in memoria (grep registro-fatti + codice fee prima di dare un numero di ordini).

**Mattino (06:00-11:16) — cadenze del giorno + 4 playbook confermati "loop a vuoto" (nessuna nuova query, nessuna card ripetuta):** piano del mattino (06:03), anti-churn negozi, recupero carrelli, Contenuto del giorno, recensioni — tutti riconfermano lo stesso stallo senza rigenerare lavoro identico, con riga ESITO registrata nei quaderni di reparto.

**Giorno (11:06-18:03) — pulizia di memoria/apprendimento, nessun tocco al marketplace:** saldati i 4 debiti di misura rimasti aperti in `calibrazione.json` (previsioni "scadute" mai chiuse — 2 non più misurabili, 2 misurate come "mancata" con fonte); promosse a principio 3 lezioni mature (file sporchi prima di `git-pr.mjs`, diff-prima-di-accusare, coerenza parola↔fatto); confermato il cluster "mobile" dell'apprendimento come pattern reale (non etichetta-ombrello) e scritta la checklist "verificato su mobile E desktop" per ogni PR di layout chat.

**Sera (18:03-20:20) — report della sera + 2 giri di recupero scritture pendenti** (giri interrotti alle 18:20 e 20:20, normali, nessuna perdita di dati).

**Segnali della macchina — 3 avvisi in warning, non bloccanti:** `notifica-approvazioni` (84 notifiche non inviate per chiavi Telegram mancanti, +2 vs ieri), `tick-coscienza-leggero` e `freschezza-segnali` (8 guardiani senza battito recente: `sensori`, `allinea-scan-can`).

---

## Da firmare — in ordine di urgenza

### 🔴 Con orologio reale

1. **PI26 (bando CCIAA, fino a 10.000€ a fondo perduto)** — **scade 30/7 ore 16:00, mancano 4 giorni.** Un valutatore indipendente ha bocciato ieri la bozza come "non pronta": servono ancora 3 risposte tue (P.IVA/forma giuridica sì-no, spese reali documentabili sì-no e quanto, firma digitale attiva sì-no). Card `#pi26-conferma-ammissibilita`, la cosa più urgente sul tavolo.

### 🟡 Da decidere/mergiare

2. **Conferma se il "piano squadra" di stanotte (fratello + 2 amici non pagati, inserimento negozi da metà agosto) sostituisce la pausa fissata al 24/8-1/9** — chiesto due volte stanotte, ancora senza risposta. Card `#conferma-piano-squadra-ripresa-negozi`.
3. **Mergia PR #556** (`github.com/NicolaeRotaru/ad-mycity/pull/556`) — il fix vero dei doppioni "Nuova chat" (blocco sulla creazione, non sui punti di invio), pronta da ieri sera, ancora aperta.
4. **Dai l'ok ai 2 fix di macchina pronti in coda**: countdown automatico scadenze (`#merge-scadenzario-check-ar147`) e i controlli sui guardiani (`#auto-riscrittura-git-pr-esito`).
5. Il resto della coda (post social, referral, welcome email, whatsapp prospect) resta **in pausa** per la decisione del 23/7 — non la ripropongo finché non riparte quella finestra.

---

## Cosa ho imparato oggi (per non ripeterlo)

- Davanti a un **target di ricavo** in €, controllare sia `registro-fatti.json` (voci `pricing.*`) sia il **codice reale** (constants/fee) prima di dare un numero di ordini: mancava la fee di consegna fissa da 3€/ordine, mai censita a memoria.
- Davanti a un **numero di negozi esplicito**, includere sempre i costi che scalano per negozio (kit fisico QR/vetrofania/sacchetti) anche se la domanda non li nomina — non basta sommare solo i costi fissi mensili citati a voce.

---

*Numeri verificati ora via query dirette su Supabase (tabelle `profiles`, `orders`, `products`, `activity_events`). Mano email (Resend) non risulta collegata per invio autonomo — nessuna email è stata inviata a Nicola, il report resta solo su file.*
