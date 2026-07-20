## Summary
- **Contenuto vuoto al click:** la lista leggeva già il markdown ma aprendo la scheda mostrava bianco (aspettava uno state async invece di usare il testo già in memoria).
- **Caselle che spariscono/cambiano:** ogni refresh (30s o fine lavoro) sostituiva tutta la lista quando GitHub rispondeva parziale o con lo stesso numero di file diversi — ora unisce per path e toglie solo su refresh completo.
- **Scheda aperta:** se stai leggendo e arriva un refresh instabile, la casella aperta resta visibile finché non chiudi tu.
- Cache server 90s + errori onesti (502/503) se GitHub è al limite.

## Test plan
- [ ] Dopo merge e deploy (~2 min): tab **Diretta contenuti** → apri una scheda → testo completo subito, non bianco né «contenuto non trovato»
- [ ] Resta sulla tab 1–2 minuti: le caselle non devono sparire e riapparire a caso
- [ ] Apri una scheda, aspetta un refresh: la scheda aperta resta lì con il testo
- [ ] Apri/chiudi 2–3 schede diverse: nessun errore finto
