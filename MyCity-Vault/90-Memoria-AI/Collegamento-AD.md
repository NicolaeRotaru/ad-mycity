---
tipo: guida
fonte: AD digitale
---

# 🔌 Collegare il secondo cervello all'app AD (Assistente-mycity)

> Serve solo se vuoi che **anche la dashboard web** (il repo `Assistente-mycity`,
> quella che usa le API) legga/scriva queste note. Se usi l'AD via **Claude Code
> qui dentro**, il collegamento è **già fatto** (Claude Code legge il vault
> direttamente). Questa guida è per la versione web.

## Cosa fa
L'app AD ha già gli strumenti `obsidian_cerca / obsidian_leggi / obsidian_scrivi`.
Vanno solo puntati a questo vault, che è già su GitHub: `NicolaeRotaru/secondo-cervello`.

## Passi (5 minuti)
1. **Token GitHub** (lo crei tu, io non posso):
   GitHub → Settings → Developer settings → **Fine-grained tokens** → Generate.
   - Repository access: **Only select repositories** → `secondo-cervello`.
   - Permissions → Repository → **Contents: Read and write**.
   - Copia il token (inizia con `github_pat_...`). **Non incollarlo mai in chat.**
2. **Variabili d'ambiente** dell'app AD (su Vercel → Project → Settings →
   Environment Variables, oppure in `.env.local` se giri in locale):
   ```
   OBSIDIAN_REPO_OWNER = NicolaeRotaru
   OBSIDIAN_REPO       = secondo-cervello
   OBSIDIAN_TOKEN      = github_pat_...   (il token del passo 1)
   OBSIDIAN_BRANCH     = main
   ```
3. **Redeploy** dell'app (Vercel) o riavvio in locale.

## ⚠️ Nota sui percorsi
Le note stanno nella sottocartella `MyCity-Vault/`. Quindi quando l'app scrive,
deve usare percorsi tipo `MyCity-Vault/90-Memoria-AI/STATO.md`. L'AD ne è già a
conoscenza (è scritto in `CLAUDE.md`).

## Sincronizzazione con Obsidian
Per vedere in Obsidian ciò che l'AD scrive (e viceversa), tieni attivo il plugin
**Obsidian Git** sul vault, con pull/push automatici. Così umano e AI condividono
la stessa memoria.
