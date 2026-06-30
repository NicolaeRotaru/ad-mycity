# 🫀 cervello/ — Far vivere l'AD (motore AI: Cursor o Claude)

> Questa cartella contiene gli script che rendono l'AD **autonomo e ricorrente**.
> Il **motore AI** è configurabile (vedi `motore-ai.sh`): di default usa **Cursor CLI**
> (`agent`, col tuo abbonamento Cursor); in alternativa **Claude Code** (`claude`, piano
> Pro/Max). Il motore gira in questa cartella, quindi prende automaticamente il manuale
> `CLAUDE.md` (via `.cursor/rules/` su Cursor), gli agenti `.claude/agents/` e la memoria nel vault.

## ⚙️ Quale motore? (una variabile)
In `cervello/vps/.env` imposti `CERVELLO_MOTORE`:
- `cursor` (default) → usa la CLI `agent`; serve `CURSOR_API_KEY` (o `agent login` una volta).
- `claude` → usa la CLI `claude`; serve il login del piano Max (`claude login`).
- `auto` → preferisce `agent` se installato, altrimenti `claude`.
Modello opzionale via `CERVELLO_MODELLO` (es. `composer-2.5`).

## ⚠️ Leggi prima questo (onestà)
- Gli abbonamenti **non sono illimitati**: hanno limiti d'uso che si resettano ogni poche
  ore. Funzionano benissimo per **alcuni giri al giorno** (es. mattina/pomeriggio/sera),
  **non** per girare ogni secondo 24/7.
- Per "sempre vivo" intendiamo **ricorrente e affidabile**, non letteralmente
  non-stop. Un giro programmato ogni ora/mattina copre il 99% del valore.
- Gli script lanciano il motore in modo che possa **scrivere nella sua memoria** (il vault)
  senza chiederti il permesso ogni volta (Cursor `--force`, Claude `--permission-mode acceptEdits`),
  ma le azioni 🔴 (soldi, deploy, messaggi a persone reali) restano comunque da firmare — è scritto
  nel `CLAUDE.md` e nei mansionari.
- Serve **un motore installato**: Cursor CLI (`curl https://cursor.com/install -fsS | bash`)
  oppure Claude Code, raggiungibile come `agent`/`claude` da terminale.

---

## Modo A — Giro programmato (semplice, parti da qui) ✅
Nessun database richiesto. Una pianificazione di Windows lancia un "giro di
perlustrazione": l'AD legge dati + memoria, scrive un briefing nel vault e aggiorna `STATO.md`.

1. Verifica che funzioni a mano:
   ```powershell
   .\cervello\giro.ps1
   ```
2. **Fallo partire da solo con un doppio-clic** (niente comandi da scrivere):
   - ▶ Doppio-clic su `cervello\attiva-giro-automatico.cmd` → registra l'attività
     pianificata (ogni **2 ore**, percorso auto-rilevato, **senza permessi admin**).
   - ⏹ Per fermarlo: `cervello\disattiva-giro-automatico.cmd`.
   - Per cambiare intervallo: da PowerShell in `cervello\`, `.\installa-giro.ps1 -OgniOre 1`.

> ⚠️ **Onestà:** serve il **PC acceso** + il motore AI configurato (Cursor `agent` con
> `CURSOR_API_KEY`/login, oppure Claude `claude` col **Max**). Gli abbonamenti hanno limiti
> d'uso che si resettano ogni poche ore: ogni 2 ore è un buon equilibrio; ogni ora 24/7 può
> incontrare i limiti. Le azioni 🔴 (soldi/messaggi reali) restano comunque da firmare.

Il prompt del giro è in `giro.md` — modificalo per cambiare cosa fa l'AD ogni volta.

---

## Modo B — Coda lavori (il "ponte" con il Pannello di Controllo) 🔧
Il Pannello di Controllo (cartella `pannello/`) crea righe nella tabella `lavori`
(Supabase memoria); questo worker le prende e le fa eseguire all'AD. Serve solo se
usi anche il pannello web.

Richiede (variabili d'ambiente):
```
SUPABASE_URL         = https://LA-MEMORIA.supabase.co
SUPABASE_SERVICE_KEY = eyJ... (service_role del progetto MEMORIA, non del marketplace!)
```
Poi:
```powershell
.\cervello\worker.ps1
```
Il worker fa polling, esegue ogni lavoro col motore AI (`agent -p` o `claude -p`), e riscrive il risultato.
È uno **scheletro**: parte appena imposti le 2 variabili e crei la tabella `lavori`
(SQL in `pannello/LEGGIMI.md`).

---

## Modo C — VPS Linux sempre acceso (24/7, senza il tuo PC) 🖥️
Far girare il cervello su un server Linux (es. Hetzner) **accanto** a quello che c'è già, senza
cancellare nulla. Giro automatico ogni 2 ore + worker delle approvazioni, sempre attivi, sul tuo
abbonamento (Cursor di default, o Claude Max).

➡️ **Guida completa: [`vps/SETUP-VPS.md`](./vps/SETUP-VPS.md)**. In breve, **sul VPS via SSH** (non sul PC Windows; il repo è **privato** → serve un **PAT**):
> ```bash
> ssh root@INDIRIZZO-IP-DEL-VPS            # 0) collegati al server (sei root)
> apt-get update && apt-get install -y git
> TOKEN=github_pat_xxxxxxxx                 # tuo PAT (Contents: read/write su ad-mycity)
> git clone https://x-access-token:$TOKEN@github.com/NicolaeRotaru/ad-mycity.git /opt/mycity/ad-mycity
> GIT_TOKEN=$TOKEN bash /opt/mycity/ad-mycity/cervello/vps/setup.sh   # 1) installa (motore Cursor)
> # 2) metti CURSOR_API_KEY + segreti in cervello/vps/.env · poi systemctl start
> ```

> ⚠️ **Onestà:** col motore Cursor basta `CURSOR_API_KEY` nel `.env` (o `agent login` una volta);
> col motore Claude serve `claude login`. I limiti d'uso degli abbonamenti restano
> (giro ogni 2h sta largo); il server sempre acceso ha il suo costo. Le azioni 🔴 partono solo da
> approvazione nel Pannello (`AZIONI_LIVE=0`).

---

## Mappa
- `motore-ai.sh` — sceglie il motore (Cursor `agent` o Claude `claude`) e costruisce il comando. Lo usano gli script `.sh`.
- `giro.md` — il prompt del giro di perlustrazione (Modi A/B/C).
- `giro.ps1` / `giro.sh` — esegue un giro col motore AI (Windows / Linux).
- `worker.ps1` / `worker.sh` — worker della coda lavori (Windows / Linux).
- `attiva-giro-automatico.cmd` · `installa-giro.ps1` — giro automatico su Windows (un doppio-clic).
- `vps/` — installazione su VPS Linux: `setup.sh`, unit systemd `mycity-*`, `.env.example`, `SETUP-VPS.md`.
