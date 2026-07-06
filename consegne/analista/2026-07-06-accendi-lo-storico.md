---
tipo: spec-operativa
titolo: Accendi lo storico — retention e coorti settimanali dal giorno 1
data: 2026-07-06 14:00
owner: data-engineer
mandato: Piano della Piramide, Fase 1 mossa 3 (consegne/strategia/2026-07-06-piano-piramide-infrastruttura-completa.md)
stato: 🟢 spec + query pronte — NESSUNA scrittura su DB; lo script che salva gli snapshot è 🟡 (auto-modifica, firma Nicola)
fonti_verificate: cervello/verifica-sensori.mjs · cervello/sentinella-dati.mjs · cervello/delta-gate.mjs · STATO.md (4/7 11:30) · registro-realta.json
---

# 📊 Accendi lo storico — così tra 12 mesi la Mente ha qualcosa da imparare

> **Perché ora:** la Fase 4 (Modello del Mondo, Scienziato) si allena su ≥12 mesi di storico, e il
> cancello di Fase 3b chiede «retention ≥ soglia su 2 coorti consecutive». Se lo storico parte oggi,
> la Fase 4 può partire a metà 2027. Ogni settimana di ritardo sposta quella data di una settimana —
> il tempo non si backfilla.
>
> **Fotografia reale (baseline REST, STATO 4/7 11:30):** 1 ordine creato (COD €19,05 del 24/6),
> 0 consegnati, 23 profili totali, 4 buyer reali, 1 negozio reale (Pane Quotidiano), Casa Linda = demo.
> Con questi numeri le coorti di oggi sono quasi vuote — ed è esattamente il momento giusto per
> accendere il contatore: la definizione si fissa PRIMA che i dati arrivino, non dopo.

---

## 1 · La definizione di retention: una sola, scritta perché chiunque la calcoli uguale

**KPI: `retention_60g` = % dei clienti di una coorte che fanno un 2° ordine valido entro 60 giorni dal loro 1° ordine valido.**

| Pezzo | Definizione esatta |
|---|---|
| **Coorte** | Tutti i buyer il cui **1° ordine valido di sempre** cade nella settimana ISO W (lun 00:00 → dom 23:59, fuso Europe/Rome). Un buyer appartiene a UNA sola coorte, per sempre. |
| **Denominatore** | Numero di buyer distinti della coorte W. |
| **Numeratore** | Quanti di quei buyer hanno un **2° ordine valido distinto** con `created_at` entro **60 giorni esatti (1.440 ore)** dal `created_at` del loro 1° ordine. |
| **Ordine valido (primario)** | Ordine **consegnato**: `delivered_at IS NOT NULL` (colonna già usata live da `sentinella-dati.mjs`, AR-071). È la definizione onesta: un ordine COD mai consegnato non è un cliente servito. |
| **Ordine valido (diagnostico)** | In parallelo si calcola la variante «ordine creato» (solo `created_at`), etichettata `retention_60g_creati` — serve a vedere il buco tra domanda e consegna, NON è il KPI del cancello. |
| **Anti-doppione** | Il 2° ordine conta solo se `created_at` ≥ **1 ora** dopo il 1° (para il doppio click/retry; due spese vere nella stessa ora sono rarissime, e la regola è dichiarata). |
| **Esclusioni** | ① Ordini del negozio demo **Casa Linda** (`seller_id = 11111111-1111-1111-1111-cccccccc0001`, confermato da Nicola 1/7 e in `registro-realta.json`). ② Ordini/buyer di test futuri: si escludono per UUID elencati in una **lista di esclusione dichiarata** dentro lo snapshot (oggi: solo Casa Linda). Mai esclusioni silenziose. |
| **Fuso** | I timestamp Supabase sono ISO/UTC; il taglio delle settimane si fa convertendo in **Europe/Rome**. La finestra dei 60 giorni è timestamp-su-timestamp (non giorni di calendario), quindi immune al fuso. |
| **Maturità** | Una coorte è **matura** (misurabile) solo 60 giorni dopo la fine della sua settimana. Prima di allora si pubblica come `parziale: true` e NON si usa per il cancello di Fase 3b. |

⚠️ **Da verificare al primo giro con sensori vivi (dichiarato, non inventato):**
- il **nome della colonna che identifica il buyer** su `orders`. Nessuno script del cervello la legge
  oggi (verificato con grep su `cervello/`): candidati tipici sono `user_id`/`buyer_id`/`customer_id`,
  ma va letto dallo schema reale con la query di scoperta Q0 qui sotto. Nella spec la chiamo
  `<BUYER_COL>`.
- l'esistenza di una colonna di **stato/annullamento** ordine (per escludere gli annullati anche dalla
  variante diagnostica). Oggi le colonne verificate in uso reale sono: `id, created_at, seller_id,
  payment_status, payment_method, payout_at, expected_delivery, delivered_at`.

---

## 2 · Le coorti settimanali: dove vivono e quando si aggiornano

**Dove si salvano: `MyCity-Vault/90-Memoria-AI/auto-coscienza/coorti-retention.json`** — scelto, per tre motivi:
1. È il pattern già esistente per gli artefatti scritti dalla macchina (`sensori-cecita.json`,
   `cassa-runway.json`, `delta-gate.json` vivono lì): stessa cartella, stesse regole di pubblicazione
   sul ramo `memoria-ad` che il Pannello legge.
2. È **versionato in git**: se una riga del DB venisse mai modificata o cancellata a posteriori, lo
   snapshot storico resta — è la protezione contro la riscrittura del passato, che è il punto di
   «accendere lo storico».
3. JSON = leggibile dalla Fase 4 senza parsing fragile. Un riassunto umano (1 riga) va in STATO.md a
   ogni chiusura di coorte, non serve un file Markdown gemello.

**Struttura proposta dello snapshot** (una entry per coorte, ricalcolata sempre da zero):

```json
{
  "_cosa_e": "Coorti settimanali di retention (2° ordine entro 60g). Scritto dal giro. Definizione: consegne/analista/2026-07-06-accendi-lo-storico.md",
  "aggiornato": "AAAA-MM-GG HH:MM",
  "definizione_versione": "v1 (2026-07-06)",
  "esclusioni": ["seller 11111111-1111-1111-1111-cccccccc0001 (Casa Linda, demo)"],
  "coorti": [
    {
      "settimana": "2026-W26",
      "denominatore": 0,
      "numeratore_60g": 0,
      "retention_60g": null,
      "retention_60g_creati": null,
      "parziale": true,
      "matura_il": "2026-08-27"
    }
  ]
}
```

**Cadenza: dentro il giro esistente, zero giri extra.** Il calcolo si aggancia a `giro.sh` subito dopo
`verifica-sensori.mjs`, come nuovo script `cervello/coorti-retention.mjs` (Node puro, 0 token AI, ~4
chiamate REST). Gira a ogni giro pieno ma è **idempotente**: ricalcola TUTTE le coorti dall'intera
storia ordini a ogni esecuzione (a questi volumi costa nulla) → stesso input, stesso output, nessun
bug incrementale, riproducibile da chiunque. Rispetta il patto del 4/7 (max 1 giro pieno/giorno): non
aggiunge inneschi, cavalca quelli che ci sono. Se `supabase_rest` è cieco, lo script NON scrive nulla
(mai snapshot da dati parziali) e lascia la entry precedente intatta.

> 🟡 **Nota di governo:** la spec e le query sono 🟢 (questo documento). **Creare lo script e agganciarlo
> a `giro.sh` è un'auto-modifica della macchina → 🟡, parte solo con la firma di Nicola.**

---

## 3 · Le query pronte — «da eseguire al primo giro con sensori vivi»

Tutte in **sola lettura** (GET), stesse env e stesso pattern già provato da `verifica-sensori.mjs` e
`delta-gate.mjs` (`MARKETPLACE_SUPABASE_URL` / `MARKETPLACE_SUPABASE_KEY`, conteggio esatto via
`Prefer: count=exact` + `Range: 0-0`). Nessuna di queste va lanciata ora da questa sessione: sono il
testo esatto per il primo giro con sensori vivi.

```bash
# Header comuni (mai stampare la chiave)
H=(-H "apikey: $MARKETPLACE_SUPABASE_KEY" -H "Authorization: Bearer $MARKETPLACE_SUPABASE_KEY")
B="$MARKETPLACE_SUPABASE_URL/rest/v1"
DEMO="11111111-1111-1111-1111-cccccccc0001"   # Casa Linda (demo) — esclusa

# Q0 — SCOPERTA SCHEMA (il passo che toglie il «da verificare»):
# legge 1 riga intera di orders e ne elenca le chiavi → fissa <BUYER_COL> e l'eventuale colonna stato.
curl -s "${H[@]}" "$B/orders?select=*&limit=1"

# Q1 — Tutti gli ordini utili alle coorti (volume attuale: 1 riga), esclusa la demo.
# <BUYER_COL> = colonna buyer scoperta con Q0. Ordinato per buyer+data: il 1° e il 2° ordine
# di ogni buyer si leggono in sequenza.
curl -s "${H[@]}" "$B/orders?select=id,<BUYER_COL>,created_at,delivered_at,seller_id,payment_method,payment_status&seller_id=neq.$DEMO&order=<BUYER_COL>.asc,created_at.asc"

# Q2 — Profili buyer (per denominatore e sanity-check: buyer negli ordini ⊆ profili).
curl -s "${H[@]}" "$B/profiles?select=id,role,created_at&role=neq.seller"

# Q3 — Riconciliazione (il totale deve quadrare col conteggio esatto, stesso trucco di delta-gate):
curl -s -D- -o /dev/null "${H[@]}" -H "Prefer: count=exact" -H "Range: 0-0" "$B/orders?select=id&seller_id=neq.$DEMO" | grep -i content-range

# Q4 — Profilazione qualità (le 6 dimensioni, prima di fidarsi):
#   duplicati: due ordini stesso buyer a <1h → conta come 1 (regola anti-doppione)
#   null: <BUYER_COL> nullo = ordine orfano → riga scartata E CONTATA nel campo "scartati" dello snapshot
#   fuso: created_at ISO/UTC → conversione Europe/Rome solo per il taglio settimana
curl -s "${H[@]}" "$B/orders?select=id,created_at&<BUYER_COL>=is.null&seller_id=neq.$DEMO"
```

**Riconciliazione con la fonte di verità:** il denominatore totale di tutte le coorti deve essere =
numero di buyer distinti con ≥1 ordine valido (da Q1), e il totale ordini di Q1 deve quadrare con Q3.
Se divergono, c'è un buco (RLS che nasconde righe alla chiave in uso, o righe orfane): si dichiara nel
campo `scartati` dello snapshot, non si nasconde.

---

## 4 · Cosa si conserva dal giorno 1 — e cosa brucia ogni settimana di ritardo

**Sta già al sicuro nel DB (non si perde aspettando):** `orders` e `profiles` con i loro `created_at`
sono righe persistenti — le coorti retroattive si potranno sempre ricalcolare da lì. È il motivo per
cui la definizione è più urgente dello script.

**Si perde davvero, settimana per settimana (non backfillabile):**

| Cosa | Perché brucia | Costo di 1 settimana di ritardo |
|---|---|---|
| **Eventi PostHog** (visite, funnel pre-ordine) | PostHog è spento per decisione firmata (fino a dopo il 10/7, ledger #17). Gli eventi non emessi non esistono: il funnel visita→carrello→ordine dei primi clienti veri sarà invisibile per sempre. | 1 settimana di funnel dei primi utenti reali — proprio quelli su cui la Fase 4 vorrà allenarsi. |
| **Transizioni di stato degli ordini** | Nel DB restano solo le colonne finali (es. `delivered_at`); la sequenza creato→accettato→consegnato con i suoi tempi non è storicizzata (nessuna tabella di audit verificata oggi). | I tempi di reazione negozio/consegna delle prime settimane, base del futuro «costo per consegna» e del Sismografo. |
| **Dinamica carrelli abbandonati** | `abandoned_carts` è una fotografia mutevole (`recovered`, `recovery_email_sent_at`, `last_activity` si sovrascrivono). Senza snapshot periodico, il tasso di recupero storico non è ricostruibile. | 1 settimana di tasso-recupero carrelli. |
| **Immunità alla riscrittura** | Senza snapshot versionato, un edit/delete futuro sul DB cambia il passato in silenzio. Lo snapshot in git congela il numero com'era. | Ogni settimana senza snapshot è una settimana di storia emendabile a posteriori. |

---

## 5 · Cosa serve per accenderla (chi, cosa, colore)

- 🟢 **Niente, per la definizione:** questo documento la fissa (v1). L'@analista e @finanza possono già
  usarla come definizione unica; se il GLOSSARIO-KPI ha una voce retention, va allineata a questa
  (proposta di modifica al vault → 🟡).
- 🟢 **Q0–Q4 al primo giro con sensori vivi:** sola lettura, dentro un giro già previsto — fissano
  `<BUYER_COL>` e la colonna stato, chiudendo gli unici due «da verificare».
- 🟡 **Firma di Nicola: script `cervello/coorti-retention.mjs` + aggancio a `giro.sh`** — è
  un'auto-modifica della macchina (regola di governo: sempre 🟡). Proposta pronta da accodare in
  AZIONI-IN-ATTESA quando l'AD la impacchetta.
- 🟡 **Decisione PostHog dopo il 10/7:** riaccenderlo al primo traffico vero (Fase 1 mossa 4). Finché
  è spento per scelta firmata non è una cecità, ma ogni settimana di traffico non tracciato è persa
  (tabella sopra). Da rivalutare col primo negozio in onboarding del 9/7.
- 🟡 **La soglia del cancello 3b:** il piano dice «retention ≥ soglia definita in Fase 1». Numero da
  fissare con Nicola quando le prime 2 coorti mature esistono (non prima: fissare una soglia senza
  denominatore sarebbe un numero inventato).

**Confidenza: 90%.** Solido: definizione, esclusione demo (UUID confermato), colonne `orders`/`profiles`
già lette in produzione dagli script del cervello, pattern REST provato. Buchi noti: `<BUYER_COL>` e
colonna stato ordine da verificare con Q0; volumi attuali quasi zero → le prime coorti significative
arrivano coi negozi dal 9/7.

---

✅ **COSA HO FATTO:** spec completa «Accendi lo storico» (definizione retention_60g calcolabile da
chiunque, coorti settimanali con snapshot in `auto-coscienza/coorti-retention.json`, 5 query REST
pronte, tabella delle perdite per ritardo) — questo file.
⏳ **COSA C'È DA ACCODARE:** ① 🟡 creazione `cervello/coorti-retention.mjs` + aggancio a `giro.sh`
(auto-modifica, firma) · ② 🟡 allineamento GLOSSARIO-KPI alla definizione v1 · ③ Q0–Q4 nel primo giro
con sensori vivi (🟢, dentro il giro).
🙋 **COSA SERVE DA NICOLA:** firma sul punto ① quando l'AD lo accoda; decisione PostHog dopo il 10/7;
la soglia di retention del cancello 3b si fissa insieme quando maturano le prime 2 coorti.

*PASSO-A @analista (definizione pronta all'uso) · @ad (accodare la 🟡 dello script).*
