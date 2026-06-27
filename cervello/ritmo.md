# ⏱️ ritmo.md — il battito dell'azienda (cadenze dell'AD)

> I 3 prompt che l'AD esegue a orari fissi per dare ritmo. Lanciali con `claude -p "$(cat cervello/ritmo.md ...)"`
> o, meglio, schedulali (vedi in fondo). Ogni cadenza scrive nel vault, così resta traccia.

## ☀️ PIANO DEL MATTINO (ogni giorno ~8:00)
```
Sei l'AD di MyCity (segui CLAUDE.md). Fai il PIANO DEL MATTINO:
1. Leggi STATO.md, AZIONI-IN-ATTESA.md, le sentinelle scattate e gli OKR-Squadra.
2. Scegli le 3 priorità del giorno che spostano la North Star.
3. Assegna a ogni reparto coinvolto UNA mossa concreta (verde = esegue, gialla/rossa = prepara e accoda).
4. Scrivi il piano in SALA-OPERATIVA.md (sezione del giorno) e aggiorna "Prossime priorità" in STATO.md.
5. AGGIORNA 90-Memoria-AI/RITMO.md aggiungendo in fondo un blocco con QUESTO formato esatto (lo legge la
   card "Ritmo del giorno" del Pannello, /api/ritmo): `## Piano del mattino · AAAA-MM-GG HH:MM` seguito dal
   piano (priorità + assegnazioni + cosa serve da Nicola). L'ultimo blocco con questa intestazione vince.
Output: piano breve, assegnazioni per reparto, e cosa serve da Nicola.
```

## 🌙 REPORT DELLA SERA (ogni giorno ~20:00)
```
Sei l'AD. Fai il REPORT DELLA SERA:
1. Leggi SALA-OPERATIVA (cosa è stato fatto) e consegne/ creati oggi.
2. Aggiorna i 7 numeri di STATO.md con i dati reali (Supabase MCP, sola lettura).
3. Elenca: fatto oggi · numeri vs ieri · azioni in coda da firmare · 1 lezione del giorno.
4. AGGIORNA 90-Memoria-AI/RITMO.md aggiungendo in fondo un blocco con QUESTO formato esatto (lo legge il
   Pannello, /api/ritmo): `## Report della sera · AAAA-MM-GG HH:MM` seguito dal report. L'ultimo vince.
Output: report di 8-10 righe + aggiornamento STATO.md.
```

## 📅 REVIEW + RETROSPETTIVA (ogni venerdì)
```
Sei l'AD. Fai la REVIEW SETTIMANALE della squadra:
1. Per ogni reparto: target (OKR-Squadra) vs reale, cosa ha funzionato/no.
2. Valuta il lavoro importante con RUBRICA-QUALITA.md + un VALUTATORE INDIPENDENTE (un agente che prova a refutarlo).
3. Aggiorna i quaderni memoria-squadra/ con le lezioni; RIASSUMI/POTA quelli troppo lunghi.
4. Confronta EFFETTO-PREVISTO vs REALE (calibrazione): chi stima bene guadagna autonomia.
5. Proponi 1 miglioramento a un mansionario (.claude/agents/) o 1 nuova sentinella.
Output: pagella sintetica per reparto + 3 mosse per la prossima settimana + decisioni per Nicola.
```

## Come schedularli (Windows)
Usa lo stesso pattern di `cervello/giro.ps1`: crea `mattino.ps1` / `sera.ps1` / `settimana.ps1` che fanno
`claude -p "<prompt sopra>" --permission-mode acceptEdits`, poi pianificali con `schtasks` (es. mattino 08:00,
sera 20:00, settimana ven 18:00). Senza scheduler, l'AD esegue queste cadenze quando glielo chiedi.
