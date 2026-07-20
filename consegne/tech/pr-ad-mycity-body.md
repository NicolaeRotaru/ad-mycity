## Summary
- La tab **Diretta contenuti** legge già i file markdown quando costruisce la lista, ma aprendo una scheda rifaceva una seconda chiamata a GitHub → spesso falliva (limite API) e mostrava «contenuto non trovato» pur con titolo/estratto visibili.
- Ora la lista passa anche il **testo completo** già letto; apri scheda lo usa subito, senza seconda richiesta.
- Cache server 90s sui contenuti + errori onesti (502/503) quando GitHub è giù o al limite, non più finto «non trovato».

## Test plan
- [ ] Dopo merge e deploy (~2 min): tab **Diretta contenuti** → apri la scheda «Pitch 1-pager Glovo» → deve mostrare il testo completo, non «contenuto non trovato»
- [ ] Apri/chiudi 2–3 schede diverse: nessun errore finto
- [ ] Refresh pagina → lista stabile (fix #498 invariato)
