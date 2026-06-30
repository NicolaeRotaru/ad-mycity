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
2. **Fallo partire da solo con un doppio-clic** (niente comandi da scrivere):
   - ▶ Doppio-clic su `cervello\attiva-giro-automatico.cmd` → registra l'attività
     pianificata (ogni **2 ore**, percorso auto-rilevato, **senza permessi admin**).
   - ⏹ Per fermarlo: `cervello\disattiva-giro-automatico.cmd`.
   - Per cambiare intervallo: da PowerShell in `cervello\`, `.\installa-giro.ps1 -OgniOre 1`.

> ⚠️ **Onestà:** serve il **PC acceso** + Claude Code loggato col **Max**. Il Max ha limiti
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
Il worker fa polling, esegue ogni lavoro con `claude -p`, e riscrive il risultato.
È uno **scheletro**: parte appena imposti le 2 variabili e crei la tabella `lavori`
(SQL in `pannello/LEGGIMI.md`).

---

## Modo C — VPS Linux sempre acceso (24/7, senza il tuo PC) 🖥️
Far girare il cervello su un server Linux (es. Hetzner) **accanto** a quello che c'è già, senza
cancellare nulla. Giro automatico ogni 2 ore + worker delle approvazioni, sempre attivi, sul tuo Max.

➡️ **Guida completa: [`vps/SETUP-VPS.md`](./vps/SETUP-VPS.md)**. In breve, **sul VPS via SSH** (non sul PC Windows; il repo è **privato** → serve un **PAT**):
> ```bash
> ssh root@INDIRIZZO-IP-DEL-VPS            # 0) collegati al server (sei root)
> apt-get update && apt-get install -y git
> TOKEN=github_pat_xxxxxxxx                 # tuo PAT (Contents: read/write su ad-mycity)
> git clone https://x-access-token:$TOKEN@github.com/NicolaeRotaru/ad-mycity.git /opt/mycity/ad-mycity
> GIT_TOKEN=$TOKEN bash /opt/mycity/ad-mycity/cervello/vps/setup.sh   # 1) installa
> sudo -u mycity -H claude login           # 2) collega il Max · 3) segreti in .env · poi systemctl start
> ```

> ⚠️ **Onestà:** login Max interattivo una volta (`claude login`); i limiti d'uso del Max restano
> (giro ogni 2h sta largo); il server sempre acceso ha il suo costo. Le azioni 🔴 partono solo da
> approvazione nel Pannello (`AZIONI_LIVE=0`).

---

## 🔗 Collega il marketplace (per analizzare il codice del sito)
Per fare radiografia, audit del design o un fix tech, l'AD deve **leggere il codice vero** del
marketplace (repo `NicolaeRotaru/mycity`). Lo colleghi alla macchina con una copia locale in SOLA LETTURA:

```bash
node cervello/collega-marketplace.mjs            # clona o aggiorna la copia locale
node cervello/collega-marketplace.mjs --status   # dice solo dov'è collegato
```

- Di default la copia finisce in `marketplace/` (ignorata da git: è un altro repo, non va versionata qui).
- I workflow `radiografia` e `audit-design` la trovano da soli; per forzare un percorso esporta
  `MARKETPLACE_REPO=/percorso/della/copia`.
- Sul **VPS** ci pensa `vps/setup.sh` (la clona in `/opt/mycity/marketplace` e imposta `MARKETPLACE_REPO`).
- Override: `MARKETPLACE_GIT_REPO` (owner/repo), `MARKETPLACE_BRANCH` (ramo). Il repo è pubblico:
  un token serve solo se diventasse privato (`MARKETPLACE_GIT_TOKEN`).

---

## Mappa
- `collega-marketplace.mjs` · `marketplace-repo.mjs` — collegano/risolvono il codice del marketplace.
- `giro.md` — il prompt del giro di perlustrazione (Modi A/B/C).
- `giro.ps1` / `giro.sh` — esegue un giro con Claude Code (Windows / Linux).
- `worker.ps1` / `worker.sh` — worker della coda lavori (Windows / Linux).
- `attiva-giro-automatico.cmd` · `installa-giro.ps1` — giro automatico su Windows (un doppio-clic).
- `vps/` — installazione su VPS Linux: `setup.sh`, unit systemd `mycity-*`, `.env.example`, `SETUP-VPS.md`.
