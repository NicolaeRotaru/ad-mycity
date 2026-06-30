---
tipo: guida
fonte: AD digitale
---

# 🔌 Collegare la memoria dell'AD al Pannello di Controllo

> Il **Pannello di Controllo** (l'app web nella cartella `pannello/`) e la memoria
> dell'AD (questo vault) vivono nella **stessa repo `ad-mycity`**. Quando giri l'AD
> via **Claude Code qui dentro**, il collegamento è **già fatto** (Claude Code legge
> il vault direttamente dai file). Questa guida serve per la **versione web**: quando
> il pannello è deployato (Vercel) deve leggere/scrivere queste note via **GitHub API**.

## Cosa fa
Il pannello ha già gli strumenti `obsidian_cerca / obsidian_leggi / obsidian_scrivi`.
Vanno solo puntati a questa repo, che è già su GitHub: `NicolaeRotaru/ad-mycity`.

## Passi (5 minuti)
1. **Token GitHub** (lo crei tu, io non posso):
   GitHub → Settings → Developer settings → **Fine-grained tokens** → Generate.
   - Repository access: **Only select repositories** → `ad-mycity`.
   - Permissions → Repository → **Contents: Read and write**.
   - Copia il token (inizia con `github_pat_...`). **Non incollarlo mai in chat.**
2. **Variabili d'ambiente** del pannello (su Vercel → Project → Settings →
   Environment Variables, oppure in `pannello/.env.local` se giri in locale):
   ```
   OBSIDIAN_REPO_OWNER = NicolaeRotaru
   OBSIDIAN_REPO       = ad-mycity
   OBSIDIAN_TOKEN      = github_pat_...   (il token del passo 1)
   OBSIDIAN_BRANCH     = memoria-ad   ← il ramo dove il giro pubblica il vault (NON main: là è vecchio)
   ```
3. **Redeploy** del pannello (Vercel) o riavvio in locale.

## ❓ Devo mergiare `memoria-ad` in `main` per vedere i giri nel Pannello?

**No.** Il Pannello legge il vault **direttamente dal ramo `memoria-ad`** via GitHub API
(`OBSIDIAN_BRANCH=memoria-ad`). Appena il giro fa push su `memoria-ad`, la Cabina vede briefing,
STATO, AZIONI, consegne — **senza alcun merge su `main`**.

| Operazione | Serve per il Pannello? |
|------------|------------------------|
| Giro push su `memoria-ad` | ✅ Sì — è così che arrivano i dati |
| `OBSIDIAN_BRANCH=memoria-ad` su Vercel | ✅ Sì — senza, legge `main` (dati vecchi) |
| Merge PR giro → `memoria-ad` | ✅ Sì (se il giro è su branch `cursor/…`) |
| Merge `memoria-ad` → `main` | ❌ No — opzionale solo per backup/sync Obsidian |

**Perché esistono due rami?** `main` ospita il codice (pannello, cervello); `memoria-ad` accumula
la memoria senza conflitti con le PR di codice. Il VPS allinea il codice da `main` a ogni giro,
ma **non tocca** il vault su `memoria-ad`.

## ⚠️ Nota sui percorsi
Le note stanno nella sottocartella `MyCity-Vault/`. Quindi quando il pannello scrive,
deve usare percorsi tipo `MyCity-Vault/90-Memoria-AI/STATO.md`. L'AD ne è già a
conoscenza (è scritto in `CLAUDE.md`).

## ⚠️ Nota su Vercel (monorepo)
Il pannello sta in `pannello/`: nel progetto Vercel imposta **Root Directory = `pannello`**.
Ogni push del vault può far ripartire un deploy del pannello — se vuoi, limita i build con
"Ignored Build Step" sul path `pannello/`. La freschezza dei dati NON dipende dal redeploy:
il pannello legge sempre l'ultima versione del vault via GitHub API.

## Sincronizzazione con Obsidian
Per vedere in Obsidian ciò che l'AD scrive (e viceversa), tieni attivo il plugin
**Obsidian Git** sul vault, con pull/push automatici. Così umano e AI condividono
la stessa memoria.
