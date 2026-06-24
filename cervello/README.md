# 🫀 cervello/ — Far vivere l'AD con Claude Code (piano Max)

> Questa cartella contiene gli script che rendono l'AD **autonomo e ricorrente**
> usando **Claude Code a quota fissa** (Pro/Max) invece delle API a consumo.
> Claude Code gira in questa cartella, quindi prende automaticamente il manuale
> `CLAUDE.md`, gli agenti `.claude/agents/` e la memoria nel vault.

## ⚠️ Leggi prima questo (onestà)
- Il piano **Max non è illimitato**: ha limiti d'uso che si resettano ogni poche
  ore ed è pensato per **uso interattivo**. Funziona benissimo per **alcuni giri
  al giorno** (es. mattina/pomeriggio/sera), **non** per girare ogni secondo 24/7.
- Per "sempre vivo" intendiamo **ricorrente e affidabile**, non letteralmente
  non-stop. Un giro programmato ogni ora/mattina copre il 99% del valore.
- Gli script usano `--permission-mode acceptEdits`: l'AD può **scrivere nella sua
  memoria** (il vault) senza chiederti il permesso ogni volta, ma le azioni 🔴
  (soldi, deploy, messaggi a persone reali) restano comunque da firmare — è scritto
  nel `CLAUDE.md` e nei mansionari.
- Serve **Claude Code installato** e loggato col tuo account Max (`claude` da terminale).

---

## Modo A — Giro programmato (semplice, parti da qui) ✅
Nessun database richiesto. Una pianificazione di Windows lancia un "giro di
perlustrazione": l'AD legge dati + memoria, scrive un briefing nel vault e aggiorna `STATO.md`.

1. Verifica che funzioni a mano:
   ```powershell
   .\cervello\giro.ps1
   ```
2. Programmalo (Utilità di pianificazione di Windows): vedi `giro.ps1` in fondo
   per il comando `schtasks` già pronto (es. ogni mattina alle 8).

Il prompt del giro è in `giro.md` — modificalo per cambiare cosa fa l'AD ogni volta.

---

## Modo B — Coda lavori (la versione "ponte" del repo Assistente-mycity) 🔧
La dashboard web crea righe nella tabella `lavori` (Supabase memoria); questo
worker le prende e le fa eseguire all'AD. Serve solo se usi anche la dashboard web.

Richiede (variabili d'ambiente):
```
SUPABASE_URL         = https://LA-MEMORIA.supabase.co
SUPABASE_SERVICE_KEY = eyJ... (service_role del progetto MEMORIA, non del marketplace!)
```
Poi:
```powershell
.\cervello\worker.ps1
```
Il worker fa polling, esegue ogni lavoro con `claude -p`, e riscrive il risultato.
È uno **scheletro**: parte appena imposti le 2 variabili e crei la tabella `lavori`
(SQL nel `LEGGIMI.md` del repo Assistente-mycity).

---

## Mappa
- `giro.md` — il prompt del giro di perlustrazione (Modo A).
- `giro.ps1` — esegue un giro con Claude Code.
- `worker.ps1` — worker della coda lavori (Modo B).
