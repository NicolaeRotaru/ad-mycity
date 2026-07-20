---
tipo: operazione-marketplace
data: 2026-07-20 17:54
colore: 🔴
richiesta: Nicola — «elimina tutti i negozi tranne pane quotidiano» (casella Supervisione)
---

# Pulizia negozi demo — solo Pane Quotidiano

## Quadro (REST live 20/7 17:53)

| | Conteggio |
|---|---|
| Negozi totali | 17 |
| **Pane Quotidiano** (tenere) | 1 — approvato, 5 prodotti |
| Demo seed (`11111111…`) | 16 — 253 prodotti |

**Pane Quotidiano ID:** `c0b240c0-2a86-4218-9d0f-5154f08ff929`

## Demo da rimuovere (16)

| Negozio | Prodotti |
|---|---|
| Bellezza Naturale | 15 |
| Boutique Eleganza | 15 |
| Cartoleria Centrale | 15 |
| Casa Linda | 26 |
| Cucina Plus | 15 |
| Frutteto Verde | 15 |
| Giardino Bello | 15 |
| Libreria Romana | 15 |
| Outdoor Avventura | 15 |
| Profumeria Charme | 15 |
| Salumeria del Borgo | 15 |
| Smart Store | 15 |
| SportFit Piacenza | 15 |
| Stile Urbano | 15 |
| TechZone Piacenza | 15 |
| Verde Casa | 15 |

Tutti hanno UUID prefisso `11111111-1111-1111-1111-`.

## Esito esecuzione (2026-07-20 18:30)

| Step | Risultato |
|---|---|
| Prodotti demo → draft | 243 |
| Prodotti orfani (seller nullo) → draft | 2 |
| Profili demo anonimizzati | 16/16 |
| Auth demo cancellati | 16/16 |
| **Verifica finale** | **1 negozio** (Pane Quotidiano) · **5 prodotti available** |

Supervisione post-pulizia: 1 negozio (1 approvato) · 3 campi servono da te (logo, città, foto prodotto).

## Piano esecuzione (post-firma Nicola)

1. **Prodotti demo** — batch `status=deleted` (o rimozione) via `marketplace.mjs` con backup per riga; tabella `products` in allowlist.
2. **Profili demo** — `DELETE /api/admin/users/[id]/delete` per ciascuno dei 16 (anonimizza + rimuove auth); **mai** Pane Quotidiano.
3. **Verifica** — REST: 1 seller, 5 prodotti available; supervisione coerente.

## Rollback

Solo prodotti: backup in `creativi/output/marketplace-backup/`. Profili demo: non recuperabili dopo delete auth — operazione definitiva.
