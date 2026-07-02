# 🎯 calibrazione.md — previsto vs reale (chi azzecca guadagna autonomia)

> **Perché esiste.** Senza calibrazione la macchina impara lezioni ma non sa se *azzeccava le previsioni*.
> Questo file chiude il loop: ogni mossa importante porta un **effetto previsto** misurabile; la settimana
> dopo si confronta col **reale** e si aggiorna l'autonomia per reparto. Contratto dati in `auto-coscienza.md`.
> Gira a **ogni giro** (registra previsioni) e si **chiude** il venerdì in `ritmo.md`.

Sei l'AD di MyCity. Fai la **CALIBRAZIONE** di questo giro.

## Quando registrar una previsione
Registra in `auto-coscienza/calibrazione.json` → `registro[]` ogni volta che:
1. **Accodi** una 🟡/🔴 in `AZIONI-IN-ATTESA.md` con effetto misurabile.
2. **Proponi** nel briefing una mossa con outcome atteso (ordini, iscritti, negozi, margine).
3. **Identifichi** il collo di bottiglia del giro (regola GM — vedi `regole-ad-gm.md`).

Non serve per ogni 🟢 interno (artefatto in `consegne/` senza effetto esterno).

## Formato di ogni voce nel registro
```json
{
  "id": "CAL-AAAA-MMDD-NN",
  "data_previsione": "AAAA-MM-GG HH:MM",
  "reparto": "@vendite",
  "azione": "titolo breve (link AZIONI o briefing)",
  "effetto_previsto": {
    "metrica": "ordini_pagati|negozi_live|iscritti_lista|margine|altro",
    "valore": 1,
    "orizzonte_giorni": 7,
    "confidenza": 0.7
  },
  "effetto_reale": null,
  "delta": null,
  "esito": "in_attesa|azzeccato|parziale|smentito",
  "lezione": "",
  "fonte_reale": "Supabase MCP|Nicola|documento"
}
```

## Come chiudere una previsione (venerdì o quando scade l'orizzonte)
1. Leggi la metrica reale (Supabase MCP o conferma di Nicola).
2. Compila `effetto_reale`, calcola `delta`, assegna `esito`:
   - **azzeccato** — entro ±20% o obiettivo binario raggiunto.
   - **parziale** — direzione giusta, magnitudine sbagliata.
   - **smentito** — direzione opposta o zero effetto.
3. Se **smentito** o **parziale** → scrivi `lezione` e passala ad `apprendimento.md` (fonte: calibrazione).
4. Aggiorna `per_reparto[]`: incrementa `previsioni` / `azzeccate`, ricalcola `punteggio` (= azzeccate/previsioni).

## Autonomia per reparto
| Punteggio | Autonomia | Comportamento AD |
|---|---|---|
| ≥ 0.75 | alta | Il reparto può proporre 🟡 senza doppio check AD |
| 0.50–0.74 | media | AD rivede prima di accodare |
| < 0.50 | bassa | Solo 🟢 autonomo; 🟡/🔴 sempre con peer-review |

## Regole
- **Nessun numero inventato** nel `effetto_reale`: se il sensore è cieco, lascia `in_attesa` e sposta la scadenza.
- **Una previsione = una metrica** (non «tutto andrà bene»).
- Le previsioni su 🔴 **non firmate** restano `in_attesa` finché Nicola non dà il via — non contano come smentite.
- Nicola che **ignora** un'azione per >14 giorni → `esito: parziale`, lezione «priorità disallineata».

## Cosa scrivi (ogni giro)
1. Nuove voci in `calibrazione.json` → `registro[]` per ogni mossa con effetto atteso.
2. Chiudi le voci scadute (orizzonte passato + dato disponibile).
3. Aggiorna `per_reparto[]` e `aggiornato` nel file JSON.

## Collegamenti
- Estrazione lezioni → `apprendimento.md` (fonte 3: calibrazione).
- Review settimanale → `ritmo.md` passo 4.
- Collo di bottiglia → `regole-ad-gm.md` regola 1.
