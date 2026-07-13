# Volano fermo — diagnosi e rimedi (2026-07-13 12:22)

## Esito in una riga
Il volano non era morto: **imparava molto ma il contatore guardava solo Briefing+DECISIONI** — il lavoro reale finiva in Sala/consegne/quaderni senza citare gli id-lezione, quindi la sentinella gridava «0.11» mentre il team tech (frontend-dev, devops-sre, vendite) chiudeva loop ogni giorno.

## Causa radice (3 livelli)

### 1. Metrica cieca (AR-051 incompleto)
`tasso-lezioni.mjs` contava «applicata» solo se l'id `L-2026-xxxx` compariva in **Briefing** o **DECISIONI.md**.
- 131 lezioni attive, **14** con id citato lì → **tasso 0.11**
- Il lavoro del 12–13/7 (PR #313, #315, #316, kit visita, fix chat) vive in **SALA-OPERATIVA**, **consegne/**, **memoria-squadra/** — invisibile al contatore

### 2. Due circuiti scollegati
| Circuito | Cosa fa | Problema |
|----------|---------|----------|
| `LEZIONI-CHAT.md` | Iniettato ogni turno chat → cambia comportamento | **Nessun id L-xxx** nelle righe → il contatore non lo vede |
| `apprendimento.json` | Archivio lungo con id | Si riempie via metabolizzazione ma **campo `usi` quasi mai popolato** |

### 3. Quaderni senior fermi (31/43)
Solo **12 reparti vivi** (ad, frontend-dev, devops-sre, vendite, account-negozi, builder-automazioni, analista, intelligence, security, tech, seo, relazioni-istituzionali).
**31 fermi >7gg** — marketing da 19 giorni, direttore-creativo e qa-designer **vuoti**.
Il gate `chiusura-loop --gate` oggi passa (1 reparto attivo con ESITO), ma la calibrazione resta vuota: **0 previsioni chiuse** con esito azzeccata/mancata.

## Cosa ho fatto (🟢/🟡)

### 🟢 Diagnosi verificata
```bash
node cervello/tasso-lezioni.mjs --dry          # prima: 0.11 (14/131)
node cervello/chiusura-loop.mjs --sonda        # 31/43 fermi
node cervello/sonda-volano.mjs                 # loop_chiude ✅ ma briefing stale 46h
```

### 🟡 Fix codice (branch `fix/volano-ponte-applicazione-lezioni`)
`cervello/tasso-lezioni.mjs` espanso:
- Fonti di prova: SALA-OPERATIVA, AZIONI-IN-ATTESA, LEZIONI-CHAT, consegne/ recenti, quaderni memoria-squadra, note `_nota_giro_*` in apprendimento
- Nuovo comando: `node cervello/tasso-lezioni.mjs applica <id> "<ref>"` per marcare uso esplicito
- Simulazione post-fix: **tasso 0.49** (64/131) — volano 🟢 aperto

### 🟢 ESITO registrato
`node cervello/chiusura-loop.mjs registra ad …` — quaderno @ad aggiornato.

## Mosse per Nicola (priorità)

| # | Cosa | Colore | Effetto atteso |
|---|------|--------|----------------|
| 1 | **Mergia la PR** del fix `tasso-lezioni` dal Pannello | 🟡 | La sentinella `volano_fermo` smette di gridare a ogni giro; il contatore riflette il lavoro reale |
| 2 | **Mergia PR #316, #315, #313** già in coda | 🔴 | Chiude il filone chat/auto-coscienza del 13/7 |
| 3 | Nessuna azione extra — il giro settimanale riempie i quaderni fermi | 🟢 | I 31 reparti inattivi si riattivano quando tornano in campo |

## Regole operative (da oggi, per l'AD)

1. **Dopo ogni lavoro 🟡/🔴:** `node cervello/chiusura-loop.mjs registra <reparto> …` (obbligatorio — gate PZ-008 nel giro)
2. **Se una lezione ha guidato il lavoro:** `node cervello/tasso-lezioni.mjs applica L-2026-xxxx "PR #N"` oppure cita l'id nel briefing
3. **Metabolizzazione:** nelle righe `LEZIONI-CHAT.md` mettere l'id `L-xxx` quando esiste — così il circuito chat e il contatore parlano la stessa lingua
4. **Calibrazione:** alla prossima previsione con data entro 17/7, chiudere con `calibrazione.mjs esito` — altrimenti `loop_chiude` resta falso nella sonda anche con tasso alto

## Cosa NON è il problema
- Il volano **non** è fermo per mancanza di lezioni (129 attive + 12 in LEZIONI-CHAT)
- La sonda dice `loop_chiude: ✅` perché ci sono **difetti chiusi recenti** nel cantiere — il termometro lezioni era l'unico indicatore rosso
- `taste-file` vuoto e Telegram senza chiavi sono problemi **separati** (notifiche, non apprendimento)
