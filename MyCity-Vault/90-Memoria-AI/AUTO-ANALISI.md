---
tipo: auto-analisi
data: 2026-06-28 16:46
fonte: AD digitale — cancello di serietà (verifica avversariale)
---

# 🔬 Auto-analisi del giro — 2026-06-28 16:46

## Voto di fiducia: 85 / 100 — trend ▲ (da 79)
Sale di 6 punti per un motivo concreto: **i sensori dati sono tornati**. Per la prima volta dal 24/6
i 7 numeri poggiano su query dirette a Supabase, non su stime. Due entità prima solo nominate sono ora
**confermate nei dati** (Casa Linda, Pane Quotidiano). Il voto non è 100 perché restano punti ciechi
**dichiarati** (memoria DB 2, Stripe, PostHog, radar esterno): un voto alto va dimostrato, non assunto.

## Errori per gravità
- 🟢 **Bassa** — *Baseline 250 prodotti non riverificata per 4 giorni.* La baseline 24/6 li dava come
  "seed da ignorare"; oggi confermato (250 available + 7 draft + 1 sold). Nessun danno: era effetto della
  cecità sensori, non un errore di giudizio. **Azione presa:** numeri riallineati live.

Nessun errore medio/grave in questo giro. Nessuna entità inventata, nessun numero orfano, nessuna 🔴
travestita da 🟢.

## Grounding delle entità (3 strade)
- **Casa Linda** → `confermato` (nei dati: seller approvato, payout attivo). Promossa nel registro.
- **Pane Quotidiano** → `confermato` (nei dati: seller approvato). Promossa nel registro.
- **Antica Salumeria Garetti** → resta `scelta_ragionata` (prospect, 0 ordini, non nel DB): legittima,
  fondata su `campo-aperto-faro.md` + fatti pubblici. Le 🔴 collegate restano da firmare (flusso normale).

## Domande per Nicola
1. 🔴 **Memoria = progetto Supabase separato o lo stesso del marketplace?** Le tabelle memoria esistono
   dentro `clmpyfvpvfjgeviworth` ma vuote; il `.env` le dà come progetto a parte. Da qui dipende `SUPABASE_URL`.
2. 🔴 **Forzo la prima transazione con Casa Linda** (payout-ready) invece di aspettare Garetti?

## Salute della macchina
- **Supabase (marketplace):** ✅ ok, `ACTIVE_HEALTHY`, riverificato live.
- **Stripe:** ⚪ non interrogato in questo giro.
- **PostHog:** 🔴 non collegato.
- **Dati freschi:** ✅ sì (query del 28/6 16:46). **Sensori attivi:** 1.

## Punti ciechi
- Memoria (DB 2) non distinguibile dal mio accesso; tabelle memoria vuote → rischio non-persistenza.
- Stripe e PostHog non letti → incassi/payout e traffico non riconciliati.
- Radar esterno non verificato oggi.

## Cosa miglioro al prossimo giro
- Interrogare anche Stripe e riconciliare incassi/payout.
- Far girare @intelligence sul radar esterno (fermo da giorni di cecità).
- Avviare la registrazione previsto-vs-reale (calibrazione) sulle azioni proposte oggi.
