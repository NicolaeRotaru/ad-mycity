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
   OBSIDIAN_BRANCH     = main   ← RAMO UNICO: da Fase 2 la memoria si pubblica su `main`. Il vecchio
                                   ramo separato `memoria-ad` è IN PENSIONE, non usarlo più.
   ```
3. **Redeploy** del pannello (Vercel) o riavvio in locale.
   Dopo aver cambiato `OBSIDIAN_BRANCH` **devi fare Redeploy** su Vercel: salvare la variabile
   non basta, il sito in produzione tiene ancora il valore vecchio finché non riparte.

## ❓ Ramo unico: dove vive la memoria?

Da **Fase 2** c'è **UN solo ramo = `main`**: il giro pubblica lì sia il codice sia la memoria (vault,
consegne). Il vecchio ramo separato `memoria-ad` è **in pensione** — non puntarci più il Pannello.

| Cosa | Valore giusto |
|------|---------------|
| `OBSIDIAN_BRANCH` su Vercel | **`main`** (con `memoria-ad` la Cabina leggerebbe un ramo morto) |
| Dove pubblica il giro | `main` — dal VPS: commit+push diretto (rebase, non-force); da cloud agent: PR con base `main` fatta mergiare |
| Merge `memoria-ad → main` | non serve più: `memoria-ad` è pensionato |

## ⚠️ Errore Vercel «No GitHub account was found matching the commit author email»

Compare quando un commit del **giro sul VPS** usa un'email non collegata a GitHub (es. `ad@mycity.local`)
→ Vercel blocca il *deploy del codice* (non la lettura del vault). **Fix:** sul VPS in `.env` imposta
`GIT_AUTHOR_EMAIL` con la tua email GitHub verificata (es. `…@users.noreply.github.com`); i commit futuri
del giro passeranno i check.

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
