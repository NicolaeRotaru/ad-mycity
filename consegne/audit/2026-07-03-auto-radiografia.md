---
tipo: auto-radiografia (archivio)
data: 2026-07-03 14:07
voto_salute: 68
tipo_run: completa-parziale (4/12 dimensioni verificate; 8 + pre-mortem + benchmark da completare dopo il reset 11:20 UTC)
workflow: .claude/workflows/auto-radiografia.js — 16/26 agenti done, 10 falliti per limite sessione
colore: 🟢 analisi · 🟡 fix (firma Nicola)
---

# 🩻 Auto-radiografia della macchina — archivio 3/7/2026

Report umano completo: `MyCity-Vault/90-Memoria-AI/RADIOGRAFIA-MACCHINA.md`.
Dati machine-readable: `MyCity-Vault/90-Memoria-AI/auto-coscienza/auto-radiografia.json` + `cantiere-difetti.json`.

## Sintesi
Radiografia profonda su comando di Nicola. Il limite di sessione (reset 11:20 UTC) ha completato review+verifica solo su **4/12 dimensioni** e saltato pre-mortem + benchmark. **27 difetti macchina confermati** (verifica avversariale superata). Voto 68 = media dei 4 pilastri verificati (non aggregato pieno). L'audit è molto più profondo del 28/6 (che trovò 3 difetti).

**Filo rosso:** molti strati sono «scritti/descritti ma non installati come binario che produce». Radice comune: mancano guardiani/validatori deterministici.

## Difetti GRAVI confermati (impatto crescita alto in grassetto)
| ID | Dimensione | Titolo | Impatto |
|---|---|---|---|
| AR-024 | coerenza-agenti | Guardiano registro orbo (includes a sottostringa) | medio |
| AR-027 | coerenza-agenti | AR-008 owner-unico-per-keyword non applicato nelle description | medio |
| **AR-029** | vettori-installati | Strato 7 (scorecard) scritto ma non produce: 36/41 quaderni vuoti | **alto** |
| **AR-035** | salute-sensori-dati | Sensore-cassa scrive un file che nessuna sentinella legge | **alto** |
| **AR-037** | salute-sensori-dati | Cecità dati real-time non escalata (occhi muti, timer giro spento) | **alto** |
| AR-043 | integrita-memoria | Contratto salute_macchina rotto → tile Supabase/Stripe sempre spenti | medio |
| **AR-044** | integrita-memoria | Faro contraddittorio: Casa Linda (memoria) vs Pane Quotidiano (CLAUDE.md) | **alto** |

## Minori confermati: AR-025/026/028 (coerenza), AR-030/031/032/033/034 (vettori), AR-036/038/039/040/041/042 (sensori), AR-045/046/047/048/049/050 (memoria).
Chiusi in questo giro (bonifica memoria 🟢): AR-045, AR-046, AR-048, AR-047.

## Dimensioni da completare dopo il reset (findings grezzi, NON verificati → non nel cantiere)
`chiusura-volano`, `cadenza-esecuzione`, `calibrazione-onesta`, `copertura-cieca`, **`guardrail-semaforo`** (🔴), `allineamento-northstar`, `efficienza-costo`, **`rischio-sicurezza-se`** (🔴). + **pre-mortem** + **benchmark vs i migliori**.

## Domande per Nicola
1. Negozio-faro: Casa Linda o Pane Quotidiano? (AR-044)
2. STAMPO su 42/42 non validato: test prima/dopo ora, o accetti non-validato? (AR-032)
3. PostHog è instrumentato? (AR-040)

## Pannello (audit dedicato)
`consegne/design/2026-07-03-radiografia-pannello.md` — 30 bug, **1 bloccante** («Annulla» → doppia esecuzione azione reale), 11 gravi.
