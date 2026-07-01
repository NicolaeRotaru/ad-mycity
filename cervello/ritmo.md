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
3. 📚 CONSOLIDAMENTO APPRENDIMENTO (cervello/apprendimento.md, sezione settimanale): distilla le lezioni
   mature in PRINCIPI, pota le decadute, accorpa le ridondanti. Aggiorna auto-coscienza/apprendimento.json
   e i quaderni memoria-squadra/ (tienili piccoli e utili).
4. 🎯 CALIBRAZIONE (auto-coscienza/calibrazione.json): confronta EFFETTO-PREVISTO vs REALE per reparto,
   ricalcola il punteggio e l'autonomia. Chi azzecca guadagna autonomia; chi sbaglia sistematicamente va ricalibrato.
5. 🚀 CICLO PROFONDO DI AUTO-MIGLIORAMENTO (cervello/auto-miglioramento.md): scegli i 3 ambiti col divario
   più alto vs i migliori, fai il giro benchmark→squadra(torneo+peer-review)→misura su ciascuno, verifica
   che gli esperimenti della settimana scorsa siano stati MISURATI (loop chiuso). Aggiorna la mappa competenze dei senior.
6. 🩻 RADIOGRAFIA COMPLETA DI SÉ (cervello/auto-radiografia.md): esegui il workflow
   `.claude/workflows/auto-radiografia.js` (12 dimensioni + pre-mortem + benchmark). Scrivi
   `auto-coscienza/auto-radiografia.json`, aggiorna `cantiere-difetti.json` (nuovi difetti + chiudi quelli
   sistemati) e `storico-salute.json` (snapshot del voto). I findings diventano lezioni (③), proposte di
   auto-riscrittura/auto-espansione (④, 🟡) o domande per Nicola. Difetto bloccante → allerta immediata.
7. 🔬 RICONCILIAZIONE PREFERENZE (auto-coscienza): allinea le preferenze_nicola con ciò che ha approvato/
   **corretto** davvero nella settimana (ogni correzione = caso-studio alla radice).
8. 📨 LETTERA A NICOLA: scrivi `auto-coscienza/LETTERA-A-NICOLA.md` in parole semplici — come sto andando,
   dove sbaglio, cosa mi serve da te, «saresti fiero se mi guardassi adesso?». Onesta e bilanciata.
9. Proponi 1-2 auto-riscritture/auto-espansioni (.claude/agents/ o cervello/), le più sostenute dall'evidenza
   (sempre 🟡, le valida Nicola).
Output: pagella per reparto + 3 mosse per la prossima settimana + voto salute architettura + la lettera + decisioni per Nicola.
```

## Come schedularli

### VPS Linux (consigliato — sempre acceso)
```bash
sudo bash /opt/mycity/ad-mycity/cervello/vps/install-ritmo-timers.sh
# Timer: mattino 08:00 · sera 20:00 · review ven 18:00 (fuso Europe/Rome)
# Manuale: sudo bash .../ritmo-ora.sh {mattino|sera|settimana}
```

### Windows (PC locale)
Usa lo stesso pattern di `cervello/giro.ps1`: crea `mattino.ps1` / `sera.ps1` / `settimana.ps1` che fanno
`claude -p "<prompt sopra>" --permission-mode acceptEdits`, poi pianificali con `schtasks` (es. mattino 08:00,
sera 20:00, settimana ven 18:00). Senza scheduler, l'AD esegue queste cadenze quando glielo chiedi.
