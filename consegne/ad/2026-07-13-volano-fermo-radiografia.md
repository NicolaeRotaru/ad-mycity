# Radiografia volano fermo — 2026-07-13 12:38

## Esito in una riga
Il volano **non era morto al 11%**: era un **falso allarme** (sonda stantia) + contatore troppo stretto. Tasso **onesto = 0.29** (39/133 lezioni citate nel lavoro reale). Fix pipeline: `tasso-lezioni` prima della sonda nel giro + sentinella legge `meta` non la copia vecchia.

## 5 perché (causa radice)

1. **Perché la sentinella gridava 0.11?** — `sentinella-dati.mjs` preferiva `auto-radiografia.json` (copia del 12:20) invece di `apprendimento.json.meta` (calcolato da script).
2. **Perché la sonda restava stantia?** — `giro.sh` chiamava `sonda-volano.mjs` ma **non** `tasso-lezioni.mjs` prima: la sonda copiava un meta vecchio.
3. **Perché 0.11 vs 0.29?** — La PR #317 aveva allargato le fonti (SALA, consegne, quaderni…); il contatore stretto (solo Briefing+DECISIONI) dava ~0.11; quello onesto con ESITI freschi dà **0.29**.
4. **Perché sotto 0.30 comunque?** — 133 lezioni attive, solo **39** hanno l'ID citato in un lavoro degli ultimi 30 giorni. Il resto resta in `apprendimento.json` senza diventare comportamento.
5. **Perché 31 quaderni fermi?** — AR-009 chiede ESITO dopo ogni lavoro 🟡/🔴, ma **solo @ad** (e 2-3 reparti) scrivono; gli altri 31 senior ignorano il rituale o non lavorano.

## Numeri verificati (2026-07-13 12:38)

| Metrica | Prima (allarme) | Dopo fix | Fonte |
|--------|-----------------|----------|-------|
| tasso_applicazione | 0.11 (sonda stantia) | **0.29** | `node cervello/tasso-lezioni.mjs` |
| lezioni applicate | 14/132 (stretto) | **39/133** | idem |
| quaderni fermi >7gg | 31 | 31 | `chiusura-loop.mjs --sonda` |
| loop_chiude (sonda) | sì (prova cantiere) | sì | `sonda-volano.mjs` |

## Fix applicati (🟡 — PR in coda)

1. **`giro.sh`**: esegue `tasso-lezioni.mjs` **prima** di `sonda-volano.mjs` a ogni giro.
2. **`sentinella-dati.mjs`**: legge `apprendimento.json.meta.tasso_applicazione` come fonte primaria (non la copia in radiografia).
3. **`tasso-lezioni.mjs`** (già su branch): fonti multi-file + ESITI freschi quaderni + STATO intero.

## Cosa serve ancora (processo, non solo codice)

| # | Azione | Colore | Effetto atteso |
|---|--------|--------|----------------|
| 1 | Mergia la PR volano dal Pannello | 🟡 | Giro ricalcola il tasso; sentinella smette di gridare 0.11 |
| 2 | In ogni ESITO/briefing chat: cita **1-3 ID lezione** (`L-…`) usate | 🟢 | Tasso sale sopra 0.30 in 2-3 giri |
| 3 | Potatura settimanale: lezioni `in-prova` mai citate → `decaduta` | 🟢 | Meno rumore, metrica più leggibile |
| 4 | Quando un reparto lavora: `chiusura-loop.mjs registra` obbligatorio | 🟢 | I 31 quaderni fermi si sbloccano uno a uno |

## Lezioni da applicare subito (questo lavoro)

- **L-2026-0702-02** (P2): un controllo vale solo se persiste un artefatto — fix pipeline = artefatto reale.
- **L-2026-0702-03** (P3): ciò che descrive la macchina va generato dai file — tasso da script, non a mano.
- **AR-009**: ESITO nel quaderno dopo ogni lavoro — registrato su `@ad` in questo giro.
