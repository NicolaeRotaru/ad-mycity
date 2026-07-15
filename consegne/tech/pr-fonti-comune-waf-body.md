## Summary

Le 3 fonti Comune Piacenza (news, eventi, imprese) segnalavano "morte" perché la sentinella riceve HTTP 403 — WAF anti-bot Municipium, non DNS morto. Il sito è vivo (WebSearch conferma contenuti freschi).

- `radar-fonti.json`: URL canonici (`/it/news`, `/it/eventi`), flag `sentinella_waf` + `accesso: websearch`
- `sentinella-fonti.mjs`: 403 su fonte `sentinella_waf` = viva con `waf_blocked`, non conta come morta
- `monitora.md`: passo 0 — salta `morta:true`, WebSearch per WAF
- Piano intelligence aggiornato in `consegne/intelligence/2026-07-16-piano-fonti-web-morte.md`

Dopo fix: `node cervello/sentinella-fonti.mjs` → exit 0, 16/17 vive, zero allerta peso≥4.

## Test plan

- [ ] `node cervello/sentinella-fonti.mjs` exit 0
- [ ] `fonti-salute.json`: comune-* con `viva:true`, `waf_blocked:true`, `falliti_consecutivi:0`
- [ ] Idealista resta `morta:true` (peso 3, ok)
- [ ] Merge → Ctrl+Shift+R Pannello, allerta fonti_web_morte sparisce al prossimo giro
