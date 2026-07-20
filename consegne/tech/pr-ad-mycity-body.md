## Summary
- Aggiunge `freschezza-okr.mjs`: guardiano che segnala OKR stantio (>7 giorni), target con data passata (es. «27/6») o riferimenti faro obsoleti.
- Cabla il vincolo HARD nel preambolo di `giro.sh` (stesso pattern di AR-030 checklist): se fallisce, il motore deve riscrivere `OKR-Squadra.md` prima di chiudere il giro.
- Aggiorna la verifica auto-fix di AR-115 nel cantiere difetti.

## Perché
L'OKR definisce cosa è prioritario per ogni senior ma restava morto senza processo di riscrittura — target scaduti (1° ordine «27/6») e nessun guardiano.

## Come provare
```bash
bash -n cervello/giro.sh
node cervello/test/freschezza-okr.mjs
node cervello/freschezza-okr.mjs   # exit 1 finché c'è «27/6» in OKR-Squadra.md
node cervello/auto-fix.mjs verifica | rg AR-115
```
