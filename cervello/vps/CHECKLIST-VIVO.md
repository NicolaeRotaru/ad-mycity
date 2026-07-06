# ✅ Checklist «tutto vivo» — chat + briefing + Pannello

> **Leggi questo prima di toccare git sul VPS.**  
> Tre sistemi separati: non confonderli.

---

## I tre tubi (non sono lo stesso cosa)

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. CHAT (Pannello → risposta in chat)                           │
│    Browser → Supabase tabella `lavori` → Worker VPS → AI        │
│    Serve: SUPABASE (memoria) + worker ATTIVO + motore AI        │
│    NON serve: OBSIDIAN_*, GitHub                                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 2. BRIEFING / STATO / AZIONI (cosa vedi nelle schede memoria)   │
│    Giro/Worker scrive su GitHub ramo unico `main`               │
│    Pannello LEGGE quel ramo via OBSIDIAN_* (GitHub API)         │
│    (Fase 2: il vecchio ramo `memoria-ad` è in pensione)         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 3. CODICE (pannello, cervello, fix)                             │
│    Vive su `main` · deploy Vercel · VPS allinea codice al giro  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Voglio SOLO Cursor `agent` (non Claude)

1. **Chiave API** — [cursor.com/dashboard](https://cursor.com/dashboard) → **API Keys** → crea e copia
2. Nel `.env` VPS:
   ```bash
   CERVELLO_MOTORE=cursor
   CURSOR_API_KEY=cur_...la_tua_chiave...
   ```
3. Verifica che `agent` ci sia:
   ```bash
   sudo -u mycity -H bash -lc 'export PATH="$HOME/.local/bin:$PATH"; agent --version'
   ```
4. Test reale (deve rispondere qualcosa, non errore auth):
   ```bash
   sudo -u mycity -H bash /opt/mycity/ad-mycity/cervello/vps/test-agent.sh
   ```
4b. Test prompt giro (legge giro.md dal disco, ~3 min):
   ```bash
   sudo -u mycity -H bash /opt/mycity/ad-mycity/cervello/vps/test-giro-prompt.sh
   ```
5. Riavvia: `sudo systemctl restart mycity-worker`
6. Nei log deve comparire: `Motore AI: cursor (agent)` — **non** `claude`

Se vedi `claude` → hai ancora `CERVELLO_MOTORE=auto` o `claude`, oppure `agent` non è nel PATH.

---

Copia e compila. **Regole sintassi:**
- Valori con **spazi** → virgolette: `GIT_AUTHOR_NAME="AD MyCity VPS"`
- **Mai** `git checkout main` sul VPS

```bash
# --- Motore AI ---
# Per usare SOLO Cursor agent (consigliato): cursor + CURSOR_API_KEY obbligatoria
CERVELLO_MOTORE=cursor
# Chiave API Cursor — OBBLIGATORIA su VPS (cursor.com/dashboard → API Keys)
CURSOR_API_KEY=

# --- Supabase MEMORIA (stessi valori di Vercel) ---
# ⚠️ NON il DB marketplace (clmpyfvpvfjgeviworth)
SUPABASE_URL=https://xjljcsorpbqwttrejqte.supabase.co
SUPABASE_SERVICE_KEY=eyJ_...service_role_MEMORIA...

# --- GitHub memoria (ramo unico main) ---
GIT_REPO=NicolaeRotaru/ad-mycity
GIT_BRANCH=main
GIT_PUSH_TOKEN=github_pat_...
GIT_AUTHOR_EMAIL=98592323+NicolaeRotaru@users.noreply.github.com
GIT_AUTHOR_NAME="AD MyCity VPS"
```

---

## Vercel — variabili Pannello

```bash
# Chat + coda lavori (OBBLIGATORIO per chat)
SUPABASE_URL=https://xjljcsorpbqwttrejqte.supabase.co
SUPABASE_SERVICE_KEY=eyJ_...service_role_MEMORIA...

# Lettura vault (OBBLIGATORIO per briefing/STATO, NON per chat)
OBSIDIAN_REPO_OWNER=NicolaeRotaru
OBSIDIAN_REPO=ad-mycity
OBSIDIAN_TOKEN=github_pat_...
OBSIDIAN_BRANCH=main
# opzionale in transizione: OBSIDIAN_BRANCH_FALLBACK=memoria-ad (ripiego sola lettura)
```

Dopo ogni modifica env su Vercel: **Redeploy**.

---

## 4 comandi diagnostici (VPS, da root)

```bash
# 1) Worker vivo?
systemctl is-active mycity-worker
journalctl -u mycity-worker -n 15 --no-pager

# 2) Motore AI per utente mycity?
sudo -u mycity -H bash -lc 'source /opt/mycity/ad-mycity/cervello/vps/.env 2>/dev/null; command -v agent; command -v claude'

# 3) .env senza errori sintassi?
sudo -u mycity -H bash -lc 'set -a; source /opt/mycity/ad-mycity/cervello/vps/.env; set +a; echo OK'

# 4) Riavvia dopo fix .env
sudo systemctl restart mycity-worker
```

---

## 4 comandi diagnostici (Pannello, browser)

Apri nel browser (sostituisci dominio):

1. `https://TUO-PANNELLO.vercel.app/api/lavori`  
   → `memoria: true` e lista lavori

2. `https://TUO-PANNELLO.vercel.app/api/diagnosi`  
   → verde: «Memoria Supabase», «Worker chat (VPS)», «Vault GitHub»

3. `https://TUO-PANNELLO.vercel.app/api/stato`  
   → `vaultRamo: "main"`, `briefingFonte: "vault"` o `"supabase"`

4. `https://TUO-PANNELLO.vercel.app/api/controllo`  
   → `pausa: false` (se true, worker non esegue nulla)

---

## Sintomi → causa → fix

| Sintomo | Causa vera | Fix |
|---------|------------|-----|
| Chat: «Serve database memoria» | `SUPABASE_*` mancanti su Vercel | Imposta + redeploy |
| Chat: «sto pensando…» ma in Lavori compare «Fatto» | Il polling chat non agganciava il lavoro (tab sospesa / ref perso) | Aggiorna Pannello (fix polling 2s + sessionStorage). Se persiste: `systemctl restart mycity-worker` |
| Chat: giro «Fatto» ma la memoria su GitHub (`main`) è ferma | Worker **legacy in RAM** (codice vecchio) o `GIT_PUSH_TOKEN` mancante | `sudo bash cervello/vps/aggiorna-cervello.sh` sul VPS |
| `Permission denied` su `.git/config` | `aggiorna-cervello.sh` eseguito come **root** → git di proprietà root, worker è **mycity** | `sudo chown -R mycity:mycity /opt/mycity/ad-mycity` poi `sudo systemctl restart mycity-worker` |
| Lavori giro «errore» push memoria | `GIT_PUSH_TOKEN` scaduto o email commit sbagliata | Rigenera token GitHub + `GIT_AUTHOR_EMAIL=98592323+NicolaeRotaru@users.noreply.github.com` |
| Chat: lavori restano `in_attesa` | Worker morto o `pausa=on` | Log worker + spegni pausa |
| Lavoro bloccato **«In corso»** per ore, worker in `sleep 5` | Restart durante un giro → lavoro orfano `in_corso` (il worker legge solo `in_attesa`) | `sudo -u mycity -H bash cervello/vps/recupera-lavori-orfani.sh` poi controlla journalctl |
| `CLI agent non trovata` | `CERVELLO_MOTORE=cursor` ma agent non in PATH | `CERVELLO_MOTORE=auto` o `claude` |
| `MyCity: command not found` | `GIT_AUTHOR_NAME` senza virgolette | `GIT_AUTHOR_NAME="AD MyCity VPS"` |
| Briefing vecchio | `OBSIDIAN_BRANCH` punta ancora al vecchio `memoria-ad`, o no redeploy | `OBSIDIAN_BRANCH=main` + redeploy Vercel |
| Errore Vercel su PR (email autore) | commit con email non-GitHub | RISOLTO: default ora `98592323+NicolaeRotaru@users.noreply.github.com` in tutti gli script. Per un mittente diverso: `GIT_AUTHOR_EMAIL` nel .env VPS (dev'essere un'email associata a un account GitHub) |
| Ritmo mattino/sera fallisce subito (status=1) | `cervello/ritmo.sh` assente sul VPS o motore AI non risponde | `sudo bash cervello/vps/aggiorna-cervello.sh` + `install-ritmo-timers.sh` · test `ritmo-ora.sh mattino` |
| Card «Ritmo del giorno» vuota | Nessun blocco recente in `RITMO.md` su `main` | `sudo bash cervello/vps/ritmo-ora.sh mattino` o chiedi «piano del mattino» in chat |

---

## Cosa NON fare mai sul VPS

- ❌ `git checkout`/`git reset` a mano sul repo del worker (lascia fare a `aggiorna-cervello.sh`: fa fetch+rebase senza perdere scritture)
- ❌ `sudo bash aggiorna-cervello` senza fix permessi se .git è di root — usa `chown -R mycity:mycity` dopo fix
- ❌ `export VAR=...` nel terminale (non vale per systemd — scrivi nel `.env`)
- ❌ Tornare a `GIT_BRANCH=memoria-ad`: il ramo separato è in pensione (Fase 2, ramo unico `main`)
- ❌ Confondere Supabase **memoria** con Supabase **marketplace**

---

## Sequenza ripristino rapido (5 min)

1. Correggi `/opt/mycity/ad-mycity/cervello/vps/.env` (modello sopra) — **GIT_PUSH_TOKEN obbligatorio**
2. **Dopo ogni merge su main**, allinea codice + riavvia worker:
   ```bash
   sudo bash /opt/mycity/ad-mycity/cervello/vps/aggiorna-cervello.sh
   ```
3. `journalctl -u mycity-worker -n 20` → deve dire `pipeline: giro-pipeline-v2` (NON legacy)
4. Vercel: verifica `SUPABASE_*` + `OBSIDIAN_BRANCH=main` → Redeploy
5. Pannello → Diagnosi: verde su **Pipeline giro** + **Push memoria**
6. «fai un giro» → briefing e GitHub `main` aggiornati insieme

> **Perché il giro alle 20:10 non ha pushato?** Il worker girava ancora con codice **vecchio in RAM**
> (prima del fix #108). Il TL;DR in chat era solo testo AI, non memoria su GitHub.
> `aggiorna-cervello.sh` + un nuovo giro risolvono.
