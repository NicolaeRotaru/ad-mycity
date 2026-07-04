---
tipo: runbook-sicurezza
titolo: R1 — Revoca + rotazione del PAT GitHub (AR-004)
data: 2026-07-04 09:40
owner: security / AD
colore: 🔴 (le mani su GitHub/Vercel/VPS le mette Nicola)
stato: APPROVATA dal Pannello 2026-07-04 — pronta a partire, aspetta le tue mani
riferimenti: AR-004 · AZIONI-IN-ATTESA #34 · DECISIONI 2026-07-04
---

# 🔴 R1 — Revoca il PAT GitHub (AR-004): runbook pronto

## Perché (in una riga)
Un vecchio `cervello/vps/.env.save` conteneva un **PAT GitHub reale** ed è **già entrato nella storia
git** del repo `ad-mycity`. Rimuovere il file dal branch **non** cancella il segreto dalla storia: chi
clona lo può recuperare. **L'unica remediation vera è revocare quel token su GitHub.** Il resto (gitignore,
hook, scan) impedisce che *ricapiti*, ma non chiude il buco già aperto.

## Cosa ho già verificato io (🟢, fatto)
Le difese "anti-ricaduta" ci sono davvero:
- ✅ `.gitignore` esteso: `.env`, `.env.*` (con `!.env.example`), `*.save` — con nota AR-004 esplicita.
- ✅ Il file `cervello/vps/.env.save` **non è più** nel working tree (resta solo `.env` a `chmod 600` e `.env.example` senza valori).
- ✅ `.githooks/pre-commit` presente ed eseguibile → passa **ogni commit** dallo `scan-segreti.mjs` sui file staged e **blocca** i segreti reali prima che entrino in storia.
- ✅ `cervello/scan-segreti.mjs` presente (seconda rete nel giro).
- ✅ Il `remote origin` in `.git/config` usa il placeholder `il_nuovo_token` (NON un token reale) → revocare il vecchio PAT non lascia scoperto `.git/config`. Il token vero vive solo in `cervello/vps/.env` come `GIT_PUSH_TOKEN`.

## ⚠️ Difetto trovato in questo giro (da chiudere)
Su **questo** checkout del VPS il pre-commit hook **non è agganciato**: `core.hooksPath` non è
impostato in `.git/config` e non c'è `.git/hooks/pre-commit`. Il file dell'hook esiste ma git non lo
esegue finché non lo si punta. È un comando **🟢** (locale, reversibile, idempotente), che io ho provato
a lanciare ma richiede la tua conferma sul write di git-config:

```bash
git -C /opt/mycity/ad-mycity config core.hooksPath .githooks
# oppure, equivalente e versionato:
bash /opt/mycity/ad-mycity/cervello/installa-hooks.sh
```

Va lanciato **una volta per ogni clone** (setup VPS incluso). Senza questo, la seconda rete resta solo
il giro, non il singolo commit.

---

## 🔴 Sequenza esatta di rotazione (le mani le metti tu — 5 minuti)
**Ordine obbligatorio**: prima il nuovo token è attivo ovunque, POI si revoca il vecchio.
Se revochi prima di rimpiazzare, il **VPS smette di pushare** e il **Pannello su Vercel va cieco**
(non legge più `memoria-ad` né il codice del marketplace per radiografia/audit — usa `GITHUB_TOKEN` in `obsidian.ts`).

**1) Genera il nuovo PAT** (GitHub → *Settings → Developer settings → Personal access tokens → Fine-grained*)
   - Repository: **`NicolaeRotaru/ad-mycity`** + **`NicolaeRotaru/mycity`**
   - Permessi: **Contents: Read and write** + **Pull requests: Read and write**
   - Scadenza: metti una data (es. 90 gg) e segnala il rinnovo.

**2) Metti il nuovo valore sul VPS**
   - Incollalo in `cervello/vps/.env` alla riga `GIT_PUSH_TOKEN=…` (file `chmod 600`, **mai committato**).
   - Questo stesso valore copre anche merge-on-approval (`GITHUB_MERGE_TOKEN` coincide col PAT — vedi coda #14/#15).
   - Riavvia i servizi che leggono l'env: `systemctl restart mycity-worker` (e i timer del ritmo se serve).

**3) Dai a Vercel il suo valore** (Pannello → Vercel → Project → Settings → Environment Variables → `GITHUB_TOKEN`)
   - Consigliato (least-privilege): un **2° PAT read-only** (Contents: Read-only sui 2 repo) — al Pannello serve solo leggere.
   - In alternativa più veloce: lo **stesso** nuovo PAT del passo 1.
   - **Redeploy** del Pannello per far prendere il nuovo valore.

**4) SOLO ORA revoca il vecchio PAT** (GitHub → *Settings → Developer settings → PAT* → il token compromesso → **Revoke/Delete**)
   - Da questo istante il segreto in storia git è **carta straccia**: non apre più nulla.

**5) Verifica che tutto respira ancora**
   - VPS: un `git push` di prova da un branch va a segno (niente 403).
   - Pannello: la card "Memoria collegata" resta verde e i briefing di `memoria-ad` si vedono.

## Nota tecnica (perché non riscriviamo la storia)
Si potrebbe anche *riscrivere* la storia git (`git filter-repo`/BFG) per togliere il valore dai commit
vecchi, ma è invasivo (cambia tutti gli hash, rompe i cloni e le PR aperte) e **non serve** una volta
revocato il token: un segreto morto in storia non è un rischio. Quindi: **revoca, non riscrivere.**

## Colore
- 🟢 Verifiche difese + questo runbook + (una volta lanciato) l'aggancio hook → li faccio/ho fatti io.
- 🔴 Generare/ruotare/revocare il PAT su GitHub, toccare env VPS e Vercel → **le mani sono di Nicola.**
