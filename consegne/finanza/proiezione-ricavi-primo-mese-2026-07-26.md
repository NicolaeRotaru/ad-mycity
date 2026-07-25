---
data: 2026-07-26 00:00
tipo: proiezione
reparto: finanza
origine: richiesta diretta di Nicola — proiezione SOLI ricavi lordi (no costi) primo mese reale
---

# Proiezione ricavi lordi — primo mese di attività reale (Pane Quotidiano)

## ⚠️ ASSUNZIONI IN CIMA (leggere prima dei numeri)

- **Oggi non esiste un dato reale di volume vendite per il primo mese.** In `registro-fatti.json`
  `northstar.consegnati = 0` (zero ordini consegnati/pagati ad oggi, fonte: DB marketplace via MCP
  6/7). Pane Quotidiano è in **attesa concordata** con Nicola (`negozi.attesa-concordata`): non ha
  ancora ordini pagati né abbonamento attivo.
- Tutti gli scenari sotto sono **IPOTESI**, non dati reali. Ogni numero di volume/scontrino è una
  stima ragionevole per una bottega di gastronomia/forno a Piacenza in fase di lancio, **NON** un
  target concordato con Nicola né una misurazione.
- Le uniche cifre reali/certe usate come base di calcolo (fonte `registro-fatti.json`):
  - **Abbonamento venditore**: 50 €/mese fisso per negozio (`pricing.abbonamento`, confermato
    Nicola 20/7).
  - **Commissione piattaforma**: 10% sul venduto (`pricing.commissione`, confermato Nicola 20/7).
- Questo documento copre **SOLO i ricavi lordi di MyCity** (commissione + abbonamento). **Non
  include costi** (consegna, fee Stripe, infrastruttura, ecc.) — quelli sono trattati altrove
  (diagnosi cassa/runway in `consegne/finanza/`).
- Ipotesi di base comune a tutti gli scenari: 1 solo negozio attivo (Pane Quotidiano), abbonamento
  attivo dal mese 1, 4,3 settimane/mese.

## Formula

`Ricavo lordo mese = (ordini/settimana × scontrino medio × 4,3 settimane × 10%) + 50 € abbonamento`

## Scenario PRUDENTE (ipotesi)

| Parametro | Valore ipotizzato |
|---|---|
| Ordini/settimana | 15 (ipotesi) |
| Scontrino medio | 18 € (ipotesi) |
| Venduto/mese | 15 × 18 € × 4,3 = **1.161 €** (ipotesi) |
| Commissione (10%) | **116,10 €** (ipotesi) |
| Abbonamento | 50 € (reale, se attivo dal mese 1) |
| **Ricavo lordo mese** | **≈ 166 €** (ipotesi) |

## Scenario MEDIO (ipotesi)

| Parametro | Valore ipotizzato |
|---|---|
| Ordini/settimana | 30 (ipotesi) |
| Scontrino medio | 20 € (ipotesi) |
| Venduto/mese | 30 × 20 € × 4,3 = **2.580 €** (ipotesi) |
| Commissione (10%) | **258 €** (ipotesi) |
| Abbonamento | 50 € (reale, se attivo dal mese 1) |
| **Ricavo lordo mese** | **≈ 308 €** (ipotesi) |

## Scenario OTTIMISTA (ipotesi)

| Parametro | Valore ipotizzato |
|---|---|
| Ordini/settimana | 50 (ipotesi) |
| Scontrino medio | 22 € (ipotesi) |
| Venduto/mese | 50 × 22 € × 4,3 = **4.730 €** (ipotesi) |
| Commissione (10%) | **473 €** (ipotesi) |
| Abbonamento | 50 € (reale, se attivo dal mese 1) |
| **Ricavo lordo mese** | **≈ 523 €** (ipotesi) |

## Note di rigore

- Con **1 solo negozio confermato** (Pane Quotidiano) il ricavo lordo del primo mese resta
  strutturalmente basso qualunque sia lo scenario: il vero moltiplicatore non è lo scontrino
  ipotizzato ma il **numero di negozi live** — su questo la leva è onboarding, non pricing.
  Questa non è una raccomandazione nuova, solo il contesto per leggere i 3 numeri sopra senza
  aspettarsi cifre "aziendali" da un solo punto vendita al mese 1.
- Non ho incluso l'abbonamento come "certo": se Pane Quotidiano resta in attesa concordata oltre
  l'inizio del mese e l'abbonamento parte a metà mese, i 50 € vanno prorata (≈25 €). Segnalo
  l'assunzione, non la nascondo nella cifra tonda.
- Confidenza: **100% sui parametri di prezzo** (fonte registro-fatti.json, confermati da Nicola);
  **bassa/dichiarata "ipotesi"** su ordini/settimana e scontrino medio, perché non esiste ancora
  un dato reale di vendite per questo negozio in questa fase.

## Fonte

`MyCity-Vault/90-Memoria-AI/registro-fatti.json` — `pricing.abbonamento`, `pricing.commissione`,
`negozio.faro`, `northstar.consegnati`, `negozi.attesa-concordata` (letti 2026-07-26).
