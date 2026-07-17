# 🕳️ Buchi di Mercato — 2026-07-17

> Aggiornato: 17 luglio 2026 12:15 · fonte: supervisione marketplace (11:29) + radar

## Stato attuale del catalogo (fonte: REST 11:28)

- **1 negozio attivo** (Pane Quotidiano — bio e dietetica, Via Calzolai)
- **17 negozi nel DB** (1 approvato, 16 in varie fasi)
- **258 prodotti** catalogati
- **494 campi vuoti** (autofill pronti, reversibili — batch da approvare)

## Categorie completamente scoperte (priorità ordine impatto×velocità)

| # | Categoria | Perché priorità | Candidati |
|---|-----------|----------------|-----------|
| 1 | **Gastronomia / salumi** | Core del territorio (coppa, salame, pancetta DOP piacentine) — altissima domanda locale + turistica; differenzia da GDO | Da scouting Vita in Centro |
| 2 | **Macelleria** | Acquisto ad alta frequenza, margini alti, non coperta dal delivery locale | Da scouting |
| 3 | **Enoteca / vini** | Gutturnio, Ortrugo, Malvasia DOC — alto scontrino, gift-box, clientela medio-alta | Da scouting + Vita in Centro |
| 4 | **Pescheria** | Servizio premium (chi non va al mercato) | Da scouting |
| 5 | **Erboristeria / naturale** | Clientela sovrapponibile a PQ — upsell naturale post primo ordine | Da scouting |
| 6 | **Fiori / piante** | Acquisto d'impulso, urgente, alta frequenza (compleanni, eventi) | Da scouting |

## Zone geografiche scoperte

| Zona | Note |
|------|------|
| **Quartieri oltre la ZTL** (Farnesiana, Besurica, Roma) | Alta densità residenziale, accesso limitato al centro |
| **Periferia nord** (Borgotrebbia, Castelvetro) | Meno accesso al centro → domanda consegna più alta |

## Buchi nel negozio attuale (PQ)

| Campo mancante | N prodotti | Soluzione | Stato |
|---------------|-----------|-----------|-------|
| `condizione` (es. "nuovo") | 252 | Autofill reversibile | Batch in coda approvazione |
| `unità di misura` (es. "pezzo") | 242 | Autofill reversibile | Batch in coda approvazione |
| `store_logo` (foto banco) | 1 negozio | Script `carica-foto-negozio.mjs` da costruire | Gap tecnico identificato 17/7 |

## Mossa proposta per colmare i buchi

Chiamata settimanale @vendite a 1 categoria: iniziare dalla **gastronomia** (categoria più differenziante, più richiesta, più piacentina). Script pitch adattabile da `consegne/vendite/pitch-garetti.md`.

---
*Fonti: supervisione marketplace 11:29 · REST Supabase 11:28 · radar.json negozio-02*
