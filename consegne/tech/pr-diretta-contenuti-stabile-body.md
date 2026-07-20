## Summary
Fix caselle Diretta contenuti che sparivano/cambiavano ad ogni refresh.

## Causa
- Elenco candidati con ~40 chiamate GitHub `listDir` a ogni poll (30s) → timeout parziali → categorie vuote.
- Tetto 30 schede su 533 file.
- Il client sostituiva tutta la lista ad ogni risposta incompleta.

## Fix
1. **Un albero git** (`listMarkdownPaths`) al posto di N listDir — ~3 call per l'elenco completo.
2. **Cache server 90s** sull'elenco candidati; ripiego cache se GitHub fallisce.
3. **80 schede** mostrate (100 lette per ordinare su frontmatter `data:`).
4. **Letture file a batch** (8 parallele) invece di 100 simultanee.
5. **Client**: se risposta `parziale`, unisce con l'elenco precedente — niente caselle che spariscono.
6. Footer: «X in diretta · Y totali» + avviso se elenco incompleto.

## Come provare
1. Mergia la PR e attendi deploy Vercel (~2 min).
2. Apri **Diretta contenuti**.
3. Premi refresh (↻) 5–6 volte: le stesse caselle devono restare (eventualmente + novità).
4. In fondo deve comparire «80 in diretta · N totali» (N ≈ 530+).
