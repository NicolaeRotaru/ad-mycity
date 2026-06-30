# 🖥️ Modo C — Il cervello MyCity sempre acceso su un VPS Linux

> Fa girare l'AD **24/7** (worker per la chat del pannello/assistenza) **senza dipendere dal tuo PC**.
> Il giro automatico (auto-analisi ogni 2h) è **DISATTIVATO**: si può lanciare a mano con `giro-ora.sh`.
> Il **motore AI** è **Cursor** di default (CLI `agent`, col tuo abbonamento Cursor); in alternativa
> Claude Code (`claude`, piano Max). Lo scegli con `CERVELLO_MOTORE` nel `.env`.
> Installazione **ACCANTO** a quello che c'è già sul server (es. il trading bot spento): **non cancella nulla**.

> ## ⚠️ LEGGI QUESTO PRIMA
> **Tutti i comandi qui sotto vanno eseguiti SUL VPS Linux (dopo esserti collegato via SSH), NON nel
> Prompt dei comandi di Windows del tuo PC.** Windows non ha `sudo`/`bash`/`apt`: da lì non funzionano.
> Il PC serve solo per **collegarti** al server (Passo 0). Quando sei "dentro" il VPS il prompt diventa
> tipo `root@nomeserver:~#` — è lì che incolli i comandi.

## Cosa ti serve prima
- Una VPS Linux **Debian/Ubuntu** (la tua Hetzner va benissimo), accesso **root** via SSH.
- Una **chiave API Cursor** (`CURSOR_API_KEY`): la crei su [cursor.com/dashboard](https://cursor.com/dashboard) → **API Keys**.
  *(In alternativa, col motore Claude, il tuo account **Claude Max** per fare `claude login`.)*
- Le chiavi della **memoria Supabase** (`SUPABASE_URL`, `SUPABASE_SERVICE_KEY` del progetto MEMORIA).
- ⚠️ **Un PAT GitHub** "fine-grained" con permesso *Contents: Read and write* sul repo `ad-mycity`.
  **Il repo è PRIVATO**: serve per **clonarlo** sul server e per ripushare il vault (la password
  GitHub non è più accettata). Crealo su github.com → Settings → Developer settings → Fine-grained tokens.
  **Configuralo bene (un token "vuoto" NON funziona):**
  1. **Repository access** → *Only select repositories* → scegli **`ad-mycity`**.
  2. **Repository permissions** → **Contents: Read and write** (Metadata: Read-only si aggiunge da solo).
  3. *Generate / Update token* → copia il valore `github_pat_…`.
  > Se il token risulta "*does not have access to any repositories*" o "*any repository permissions*",
  > non è configurato: premi **Edit**, aggiungi repo + Contents R/W e salva (il valore del token non cambia).
  >
  > ⚠️ **NOME ≠ VALORE.** Il **nome** del token (es. `assistente-mycity`) è solo un'etichetta. Quello che
  > serve è il **VALORE**: la stringa lunga **`github_pat_...`** mostrata **una sola volta** alla creazione.
  > Usala nei comandi (`TOKEN=github_pat_...`). Se non l'hai copiata, premi **Regenerate token**, copiala
  > subito. Controlla sempre con `echo $TOKEN`: deve iniziare con `github_pat_`, non essere il nome.

## Passi

**0. Collegati al VPS via SSH** (dal tuo PC — Windows cmd/PowerShell hanno `ssh` integrato, oppure
terminale Mac/Linux). L'**indirizzo IP** e la **password root** sono nella **console Hetzner** (il tuo server):
```bash
ssh root@INDIRIZZO-IP-DEL-VPS
```
Da qui in poi il prompt è quello del VPS (Linux): **tutti i comandi sotto si incollano lì.**

**0-bis. (Opzionale) Impedisci al bot di ripartire al reboot** — senza cancellarlo:
```bash
sudo systemctl disable --now NOME-SERVIZIO-DEL-BOT   # se gira come servizio systemd
```
Non tocchiamo i file del bot: restano sul disco, recuperabili.

**1. Clona ed esegui il setup** (il repo è **privato** → usa il tuo **PAT**; sei `root`, niente `sudo`).
Sostituisci `github_pat_xxxxxxxx` col tuo token:
```bash
apt-get update && apt-get install -y git
TOKEN=github_pat_xxxxxxxx
git clone https://x-access-token:$TOKEN@github.com/NicolaeRotaru/ad-mycity.git /opt/mycity/ad-mycity
GIT_TOKEN=$TOKEN bash /opt/mycity/ad-mycity/cervello/vps/setup.sh
```
> Lo **stesso** token va poi anche in `.env` come `GIT_PUSH_TOKEN` (passo 3), per il push del vault.

**2. Collega il motore AI.** Con il motore **Cursor** (default) NON serve un login interattivo:
basta mettere `CURSOR_API_KEY` nel `.env` (passo 3). Se preferisci il login interattivo una volta:
```bash
sudo -u mycity -H agent login        # motore Cursor (alternativa alla CURSOR_API_KEY)
# sudo -u mycity -H claude login     # SOLO se hai messo CERVELLO_MOTORE=claude
```

**3. Inserisci i segreti:**
```bash
sudo -u mycity nano /opt/mycity/ad-mycity/cervello/vps/.env
```
Compila `CURSOR_API_KEY` (e/o lascia `CERVELLO_MOTORE=cursor`), `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `GIT_PUSH_TOKEN`, `GIT_REPO`, `GIT_BRANCH`.

**4. Accendi tutto:**
```bash
sudo systemctl start mycity-worker.service     # worker sempre attivo (chat pannello + approvazioni)
# sudo systemctl start mycity-giro.timer       # ⛔ DISATTIVATO: giro automatico (auto-analisi)
sudo systemctl start mycity-monitora.timer     # monitoraggio web continuo (Ondata 3, giornaliero 06:30)
# Per un giro manuale: sudo bash /opt/mycity/ad-mycity/cervello/vps/giro-ora.sh
```

## ▶️ Far partire il giro + auto-analisi ADESSO (dopo aver committato cose nuove)
Quando hai appena pushato funzionalità nuove su `main` e vuoi vedere subito cosa tira fuori l'AD:
```bash
# Scorciatoia (sincronizza il codice nuovo da main + giro + auto-analisi, con log in diretta):
sudo bash /opt/mycity/ad-mycity/cervello/vps/giro-ora.sh
```
Oppure i due comandi a mano (equivalenti):
```bash
sudo systemctl start --no-block mycity-giro.service   # parte il giro adesso
sudo journalctl -u mycity-giro -f                     # log in diretta (Ctrl-C per uscire)
```
Non serve `git pull` a mano: **il primo passo del giro allinea da solo il codice a `origin/main`**
(pannello, cervello, agenti) — i tuoi merge entrano lì — lasciando intatto il vault. Al termine trovi
il nuovo briefing in `MyCity-Vault/90-Memoria-AI/Briefing/` + `AUTO-ANALISI.md`, pushati sul ramo
`memoria-ad` → visibili nel **Pannello**. ⚠️ I merge devono essere su `main`: il giro sincronizza solo da lì.

> Se hai cambiato i **file delle unit systemd** (`mycity-*.service`/`.timer`), ricopiali e ricarica prima:
> `sudo cp /opt/mycity/ad-mycity/cervello/vps/mycity-*.{service,timer} /etc/systemd/system/ && sudo systemctl daemon-reload`

## Verifica che funzioni
```bash
systemctl status mycity-worker --no-pager           # deve essere: active (running)
systemctl list-timers | grep mycity                 # mostra i timer attivi (monitora; giro disattivato)
journalctl -u mycity-worker -n 40 --no-pager        # log del worker (chat pannello)
```
Se tutto va: dopo il giro compare un nuovo file in `MyCity-Vault/90-Memoria-AI/Briefing/` e, se il
push è configurato, lo vedi anche nel **Pannello** (Attività & briefing / Cosa ho scoperto).
Premendo **Approva** nel Pannello, entro ~30s il worker esegue e la riga in `AZIONI-IN-ATTESA.md` passa a ✅ FATTO.

## Comandi utili
```bash
# Fermare tutto
sudo systemctl stop mycity-worker mycity-giro.timer mycity-monitora.timer
# Cambiare l'orario del monitoraggio: modifica OnCalendar in mycity-monitora.timer, poi ricopia + daemon-reload.
# Cambiare la frequenza del giro: modifica OnUnitActiveSec in mycity-giro.timer, poi:
sudo cp /opt/mycity/ad-mycity/cervello/vps/mycity-giro.timer /etc/systemd/system/ && sudo systemctl daemon-reload
# Mettere in PAUSA da remoto: nel Pannello (kill-switch) -> impostazioni.pausa = on
```

## ⚠️ Note oneste
- **Limiti dell'abbonamento:** sia Cursor sia Claude Max hanno tetti d'uso che si resettano ogni poche
  ore. Col solo worker (senza giro automatico) l'uso è minimo — i token si consumano solo quando chatti dal pannello.
- **Costo:** il VPS sempre acceso ha il suo costo mensile (quello che già paghi).
- **Sicurezza:** il `.env` ha permessi `600` e non va committato. Le azioni 🔴 (soldi/messaggi reali)
  partono **solo** quando le approvi dal Pannello (`AZIONI_LIVE=0` di default).
- **Convivenza col bot:** il cervello non apre porte di rete e gira sotto l'utente `mycity` con
  servizi `mycity-*` → nessun conflitto con il bot.
