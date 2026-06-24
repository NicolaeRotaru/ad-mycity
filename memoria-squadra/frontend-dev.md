---
tipo: quaderno-memoria
reparto: frontend-dev
---

# 🧠 Quaderno di frontend-dev
> Cosa ho imparato. Leggi all'inizio, aggiungi un ESITO alla fine di ogni lavoro.

## Esiti
- 2026-06-24 · Gruppo 1 audit-design (worktree isolato mycity-g1, branch fix/group1-conversione) · 6 fix conversione+microcopy chirurgici, commit 504a959, 13 file · pattern utili: badge carrello ospiti usa useCartCount() (storage locale, no login); upsell deve escludere has_variants per non creare articoli bloccati al checkout; mai scarsità finta sugli slot consegna (filtra le fasce passate via Date().getHours() + default prima fascia futura); soglia spedizione gratis è globale nel cart ma per-negozio al checkout → nel multi-negozio etichettare "Gratis" come stima. Worktree senza node_modules → typecheck/build delegati alla CI sulla PR. · lezione: prima di toccare, leggere lo stato del branch: alcuni fix (etichetta "stima" non-gratis, cart:236) erano già parzialmente presenti → ho integrato solo il delta mancante (caso gratis multi-negozio, "Carta o contanti"). #frontend #audit-design #microcopy #checkout
