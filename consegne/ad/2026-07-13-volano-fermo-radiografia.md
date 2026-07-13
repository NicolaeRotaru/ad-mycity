# Radiografia volano fermo — 2026-07-13 12:26

## Esito in una riga
Il volano **non era completamente morto**: imparava (132 lezioni attive) ma il **contatore leggeva solo Briefing+DECISIONI** e segnalava 0.11 mentre le lezioni erano già citate in quaderni ESITO e STATO (~0.29 reale). Fix: allargare `tasso-lezioni.mjs` alle fonti del loop vero.

## 5 perché (causa radice)

1. **Perché tasso 0.11?** — `tasso-lezioni.mjs` cercava gli ID lezione solo in Briefing (30gg) e DECISIONI.md.
2. **Perché lì non c'erano?** — I giri recenti sono soprattutto **chat + metabolizzazione**: le lezioni finiscono in `apprendimento.json` e `LEZIONI-CHAT.md`, non nei briefing classici.
3. **Dove si applicano davvero?** — Nel quaderno `@ad` (ESITI con `L-…`), in `STATO.md` (righe chat), nelle note `_nota_giro_*` con «APPLICATE:».
4. **Perché i quaderni non bastavano al sensore?** — AR-051 ha cablato la metrica ma **non ha incluso memoria-squadra/** — il loop chiudeva solo per l'AD, invisibile al termometro.
5. **Perché 31 quaderni fermi?** — AR-009 chiede ESITO dopo ogni lavoro 🟡/🔴, ma **solo @ad e 2-3 reparti** scrivono; gli altri 31 senior non hanno lavoro recente o ignorano il rituale.

## Numeri verificati (2026-07-13 12:26)

| Metrica | Prima fix | Dopo fix (dry-run) | Fonte |
|--------|-----------|-------------------|-------|
| tasso_applicazione | 0.11 | **0.29** | `node cervello/tasso-lezioni.mjs --dry` |
| lezioni applicate | 14/132 | **38/132** | idem |
| quaderni vivi chiusura-loop | 12/43 | 12/43 | `chiusura-loop.mjs --sonda` |
| quaderni fermi >7gg | 31 | 31 | idem |

Soglia sentinella: **0.30** — mancano ~2 lezioni tracciate per spegnere l'allerta (94 lezioni ancora senza prova d'uso).

## Cosa ho fatto 🟢

- Radiografia causa radice (questo file).
- Fix `cervello/tasso-lezioni.mjs`: fonti aggiuntive = ESITI freschi `memoria-squadra/`, prime righe `STATO.md`, note `APPLICATE:` in apprendimento.
- ESITO chiuso in `memoria-squadra/ad.md` (volano_fermo).

## Cosa accodo 🟡

- PR `fix/volano-tasso-lezioni` — merge Nicola dal Pannello.
- Dopo merge: il tick ogni 10 min ricalcolerà il tasso corretto; la sentinella smetterà di urlare se ≥0.30.

## Prossimi passi (priorità)

1. **Rituale giro** — in ogni lavoro citare 1-3 ID lezione applicate nel briefing/ESITO (`L-2026-…`).
2. **Helper `applica-lezione.mjs`** — appende `usi[]` su apprendimento.json (prova esplicita, non solo grep).
3. **Potatura settimanale** — lezioni `in-prova` con 0 evidenze dopo 14gg → decadute (evita pile da 100+ mai usate).
4. **31 quaderni fermi** — al prossimo giro che tocca un reparto: `chiusura-loop.mjs registra` obbligatorio (già in giro.md, va rispettato).

## Lezioni rilevanti

- L-2026-0713-106 — metabolizzazione parziale / propagazione file vivi
- L-2026-0713-103 — apprendimento post-chat vs miglioramento leggero
- L-2026-0702-02 — controllo vale solo se persiste un artefatto (P2)
- AR-051 / AR-009 — tasso calcolato + chiusura-loop
