---
tipo: registro-salute-negozi
data: 2026-07-01 12:00
fonte: account-negozi (playbook anti-churn)
sensori: REST Supabase marketplace clmpyfvpvfjgeviworth
playbook: negozi-calo
---

# 📉 Playbook anti-churn — registro salute negozi (1/7 12:00)

## Metodo
Health score + sentinella `−40% ordini 30g vs 30g precedenti` **oppure** `0 ordini da 14g` (cervello/sentinelle.md).
Filtro **negozi REALI**: esclusi seed demo (UUID `11111111…`, conferma Nicola 1/7).

## Riepilogo (fonte live 1/7 11:57)
| Metrica | Valore |
|---|---|
| Seller nel DB | **17** |
| Seller REALI | **1** (Pane Quotidiano) |
| Seller demo (seed) | **16** — **nessuna azione** |
| 🔴 a rischio (real) | **1** (override operativo) |
| 🟡 attenzione trend −40% | **0** |
| 🟢 sani | **0** (l'unico reale ha frizione operativa) |

## Registro prioritizzato (solo REALI)

| Negozio | GMV 30g | Health | Segnale che pesa | Causa (dato) | Leva | Colore |
|---|---|---|---|---|---|---|
| **Pane Quotidiano** | €0 incassato · 1 ordine COD €19,05 | 🔴 **42** (override) | Ordine #58094956 fermo **7g** (24/6 → 1/7) · stato NEW/PENDING | **Frizione operativa MyCity** — non calo vendite negozio; primo ordine mai consegnato → rischio «non vendo qui» | Check-in titolare + chiudere ordine oggi (#16) · payout-test 03/7 | 🟡 contatto |

### Perché NON è «verde» nonostante trend +100%
- Algoritmo trend: 1 ordine ultimi 30g vs 0 nel mese prima = +100% (non −40%).
- **Override playbook:** ordine bloccato >7g su unico negozio reale = stadio **no value realized** (causa #1 churn KIT) — priorità assoluta indipendentemente dal trend.

### Diagnostica Pane Quotidiano (confidenza 90%)
| Ipotesi | Verifica dati | Esito |
|---|---|---|
| Catalogo fermo | 5 prodotti `available`, stock OK | ❌ scartata |
| Best-seller esaurito | stock ≥9 su tutti | ❌ scartata |
| Frizione operativa | ordine COD NEW/PENDING da 169h; Scelta A firmata 11:05; #16 in attesa | ✅ **causa** |
| No-value / zero ordini | 1 ordine esiste ma non chiuso | ✅ correlata |
| Stagionalità | panetteria bio — luglio OK | ❌ scartata |

**Contatto:** Via Calzolai 25 · tel. **0523 388601** (registro-realta.json, live REST).

---

## Demo seed — monitoraggio passivo (0 azioni)
16 negozi UUID `11111111…` (Casa Linda, Salumeria del Borgo, …): 0 ordini, catalogo seed. **Non contattare** — rischio confusione operativa (lezione Nicola 1/7).

---

## Prossimo ciclo (quando batch 6/7)
- Riapplicare registro su **≥6 negozi reali** · health score completo (login listing — mancano colonne DB oggi).
- Attivare sentinella `S-negozio-calo` quando ≥2 seller reali con trend.

## Azioni accodate
→ `MyCity-Vault/90-Memoria-AI/AZIONI-PRONTE.md` **A6** (check-in Pane Quotidiano) · **A7** (upsell post-prima-consegna, 🟢 pianificato)
