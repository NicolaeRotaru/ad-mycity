---
tipo: playbook
reparto: designer + vendite + relazioni-istituzionali
data: 2026-07-20 11:24
autore: AD digitale
colore: 🟢 produzione template · 🔴 stampa + posa fisica
stato: kit prodotto · stampa/posa gated
fonte_dati: REST live 20/7 11:23 (verifica-sensori ok)
---

# 📍 PLAYBOOK Capillarità — refresh 20/7

> **Scopo:** ogni negozio **aderente e confermato** esce dal go-live con kit fisico (QR vetrina/cassa,
> vetrofania, sacchetti brandizzati) + mappa punti di presenza in città. Capillarità = vetrine e
> consegne come cartelloni a costo quasi zero.

## 🚦 Cancello AR-006 (letto prima di produrre)

| Entità | Stato registro | Cosa ha ORA |
|---|---|---|
| **Pane Quotidiano** (Via Calzolai 25) | ✅ `confermato` | **Kit intestato** completo (QR URL live verificato HTTP 200) |
| **Casa Linda** | ❌ `demo` | Esclusa |
| **Garetti / Peretti / Amendolara** | 🟡 `scelta_ragionata` (prospect, non nel DB) | **Solo template neutri** — nessun pacchetto intestato finché non firmano |

**REST 20/7 11:23:** 17 seller totali · **1 approvato** (PQ) · 0 ordini `DELIVERED` · stallo ~625h.

---

## ✅ Cosa è pronto ORA (🟢 — verificato su disco)

### Template neutri — `creativi/output/kit-capillarita/`

| File | Uso |
|---|---|
| `qr-a5-cassa-neutro.svg` | Cartoncino A5 cassa — segnaposto `[NEGOZIO]` |
| `vetrofania-neutro.svg` | Vetrofania 20×20 cm statica |
| `qr-adesivo-tondo.svg` | Adesivo tondo Ø10 cm (punti città) |
| `sacchetto-piccolo-18x22.svg` | Kraft piccolo (pane) |
| `sacchetto-grande-26x32.svg` | Kraft grande (spesa) |
| `qr-mycity-home.png` | QR → home con UTM `qr-mycity` |

### Istanza Pane Quotidiano — `creativi/output/capillarita/`

| File | Uso |
|---|---|
| `qr-a5-cassa-pane-quotidiano.svg` | Cartoncino cassa intestato |
| `vetrofania-pane-quotidiano.svg` | Vetrofania vetrina |
| `qr-pane-quotidiano.png` | QR verificato live |

**URL QR PQ (HTTP 200, 20/7):**
`https://mycity-marketplace.com/store/c0b240c0-2a86-4218-9d0f-5154f08ff929/pane-quotidiano?utm_source=qr&utm_medium=vetrina&utm_campaign=qr-pane-quotidiano`

**Seller ID:** `c0b240c0-2a86-4218-9d0f-5154f08ff929` · tel. **0523 388601**

---

## 🔴 Cosa resta in coda (firma Nicola — costa soldi / tocca il mondo)

| Azione | Coda | Gate |
|---|---|---|
| Preventivo tipografia + stampa kit PQ | **#48** | PQ **evadibile** (`#ordine-test-pq` chiuso) — non mandare gente in vetrina prima |
| Posa fisica in negozio (vetrina + cassa) | **#48** | Stesso gate + ok titolare |
| Semina QR in città (bar, edicole, bacheche) | **#49** | **≥3 negozi reali evadibili** (AR-081) — oggi 1 PQ non evadibile |

> ⛔ **Correzione 6/7 (A1 ritirata):** il «bando Vita in Centro rimborsa 50% materiali» **non esiste**.
> Leva stampa alternativa: **PI26 CCIAA** (50% digitalizzazione, sportello dal 20/7, scade 30/7) — vedi
> `#bandi-cciaa-2007` e pitch scout A18.

---

## 🗺️ Punti di presenza — mappa Piacenza

| Livello | Dove | Materiale | Gate |
|---|---|---|---|
| ① Negozio aderente | Vetrina + cassa | QR A5 + vetrofania | 🔴 #48 dopo evadibilità |
| ② Sacchetto consegna | In mano al cliente | Kraft brandizzato | 🔴 stampa |
| ③ Partner quartiere | Bar, edicole, associazioni | Adesivo tondo | 🔴 #49 (≥3 negozi) |
| ④ Bacheche | Comune / associazioni | Locandina A5 neutra | 🔴 #49 + consenso partner |

**Oggi:** solo livello ① per PQ — **armato ma non stampare** finché North Star = 0.

---

## 💰 Preventivo tipografia (stima orientativa — da confermare in loco)

| Voce | Qty PQ (1° negozio) | Note |
|---|---|---|
| Cartoncino A5 QR cassa | 2 | Plastificato |
| Vetrofania 20×20 adesivo statico | 2 | Interno + esterno vetrina |
| Adesivo tondo Ø10 | 5 | Scorta cassa |
| Sacchetto kraft 18×22 | 100 | 1 colore terracotta |
| Sacchetto kraft 26×32 | 50 | 1 colore terracotta |
| **Totale stimato** | **~€80–150** | Tipografia Piacenza, 1 colore |

Al **2°–3° negozio firmato:** istanziare template neutro (2 min) + stampa batch.

---

## 📋 Prossimo passo per Nicola

1. **Prima:** `#ordine-test-pq` — PQ deve sapere evadere prima di mettere QR in vetrina.
2. **Poi:** chiedi preventivo tipografia con i file in `creativi/output/capillarita/` → firma **#48**.
3. **Dopo ≥3 negozi evadibili:** semina città → firma **#49**.

Anteprima operativa: [[AZIONI-PRONTE]] **A35** · playbook base 6/7: `consegne/vendite/2026-07-06-playbook-capillarita.md`
