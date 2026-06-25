# 🖥️ Modo C — Il cervello MyCity sempre acceso su un VPS Linux

> Fa girare l'AD **24/7** (giro ogni 2 ore + worker delle approvazioni) **senza dipendere dal tuo PC**.
> Usa il tuo **piano Max** (login interattivo una volta), non le API a pagamento.
> Installazione **ACCANTO** a quello che c'è già sul server (es. il trading bot spento): **non cancella nulla**.

> ## ⚠️ LEGGI QUESTO PRIMA
> **Tutti i comandi qui sotto vanno eseguiti SUL VPS Linux (dopo esserti collegato via SSH), NON nel
> Prompt dei comandi di Windows del tuo PC.** Windows non ha `sudo`/`bash`/`apt`: da lì non funzionano.
> Il PC serve solo per **collegarti** al server (Passo 0). Quando sei "dentro" il VPS il prompt diventa
> tipo `root@nomeserver:~#` — è lì che incolli i comandi.

## Cosa ti serve prima
- Una VPS Linux **Debian/Ubuntu** (la tua Hetzner va benissimo), accesso **root/sudo** via SSH.
- Il tuo account **Claude Max** (per fare `claude login`).
- Le chiavi della **memoria Supabase** (`SUPABASE_URL`, `SUPABASE_SERVICE_KEY` del progetto MEMORIA).
- Un **PAT GitHub** "fine-grained" con permesso *Contents: Read and write* sul repo `ad-mycity`
  (serve al server per ripushare il vault, così il Pannello lo vede).

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

**1. Scarica ed esegui il setup** (installa Node, Claude Code, clona il repo, prepara systemd).
Usa `git clone` (robusto, niente cache CDN che dà 404):
```bash
sudo apt-get update && sudo apt-get install -y git
sudo git clone https://github.com/NicolaeRotaru/ad-mycity.git /opt/mycity-bootstrap 2>/dev/null \
  || sudo git -C /opt/mycity-bootstrap pull --ff-only
sudo bash /opt/mycity-bootstrap/cervello/vps/setup.sh
```

**2. Collega il piano Max** (login interattivo, una volta sola):
```bash
sudo -u mycity -H claude login
```
Apri l'URL mostrato, autorizza, incolla il codice.

**3. Inserisci i segreti:**
```bash
sudo -u mycity nano /opt/mycity/ad-mycity/cervello/vps/.env
```
Compila `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `GIT_PUSH_TOKEN`, `GIT_REPO`, `GIT_BRANCH`.

**4. Accendi tutto:**
```bash
sudo systemctl start mycity-worker.service     # worker sempre attivo (le approvazioni)
sudo systemctl start mycity-giro.timer         # giro automatico ogni 2 ore
sudo systemctl start mycity-giro.service        # prova subito un giro adesso
```

## Verifica che funzioni
```bash
systemctl status mycity-worker --no-pager           # deve essere: active (running)
systemctl list-timers | grep mycity                 # mostra il prossimo giro (ogni 2h)
journalctl -u mycity-giro -n 40 --no-pager          # log dell'ultimo giro
```
Se tutto va: dopo il giro compare un nuovo file in `MyCity-Vault/90-Memoria-AI/Briefing/` e, se il
push è configurato, lo vedi anche nel **Pannello** (Attività & briefing / Cosa ho scoperto).
Premendo **Approva** nel Pannello, entro ~30s il worker esegue e la riga in `AZIONI-IN-ATTESA.md` passa a ✅ FATTO.

## Comandi utili
```bash
# Fermare tutto
sudo systemctl stop mycity-worker mycity-giro.timer
# Cambiare la frequenza del giro: modifica OnUnitActiveSec in mycity-giro.timer, poi:
sudo cp /opt/mycity/ad-mycity/cervello/vps/mycity-giro.timer /etc/systemd/system/ && sudo systemctl daemon-reload
# Mettere in PAUSA da remoto: nel Pannello (kill-switch) -> impostazioni.pausa = on
```

## ⚠️ Note oneste
- **Limiti del Max:** il Max ha tetti d'uso che si resettano ogni poche ore. Giro ogni 2h + worker
  on-demand stanno larghi. Se l'uso è troppo, alza l'intervallo del giro (es. 3-4h).
- **Costo:** il VPS sempre acceso ha il suo costo mensile (quello che già paghi).
- **Sicurezza:** il `.env` ha permessi `600` e non va committato. Le azioni 🔴 (soldi/messaggi reali)
  partono **solo** quando le approvi dal Pannello (`AZIONI_LIVE=0` di default).
- **Convivenza col bot:** il cervello non apre porte di rete e gira sotto l'utente `mycity` con
  servizi `mycity-*` → nessun conflitto con il bot.
