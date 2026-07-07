# Verifica «il Pannello online mostra il giro di oggi?» + fix token Vercel

**Data:** 2026-07-07 10:57 · **Reparto:** devops-sre / AD · **Colore:** 🟢 diagnosi (fix a valle = 🔴, mani di Nicola)
**Origine:** proposta approvata dal Pannello «Controlla a occhio che il Pannello online mostri il giro di oggi»
(contesto: revoca del vecchio PAT GitHub → se Vercel condivideva quel token, il Pannello hosted è cieco → dargli un token di sola lettura + Redeploy).

---

## 1. Come funziona davvero (verificato nel codice, oggi)

Il Pannello **hosted** (Vercel) NON legge il filesystem del VPS: legge il vault **da GitHub via API**
(`pannello/src/lib/obsidian.ts`), a ogni richiesta, con `cache: "no-store"`.

- Ramo letto: `OBSIDIAN_BRANCH` → default **`main`** (ramo unico).
- Token usato in lettura: **`OBSIDIAN_TOKEN` → in mancanza, fallback `GITHUB_TOKEN`**.
- Lo stesso `GITHUB_TOKEN` serve anche al lettore del **codice marketplace** (`pannello/src/lib/github.ts`,
  radiografia/audit del sito).

**Due conseguenze importanti:**
1. **Il contenuto (briefing/STATO/AZIONI) si aggiorna in tempo reale** appena è su `origin/main`:
   NON serve alcun redeploy per vederlo (lettura live via API). Lo conferma anche il commento in `/api/diagnosi`:
   *«legge in tempo reale, merge su main NON necessario»*.
2. **Il redeploy serve SOLO per far prendere a Vercel una nuova variabile d'ambiente** (es. un nuovo token).
   E `pannello/vercel.json` ha `git.deploymentEnabled.main = false`: **un push su `main` NON fa partire il deploy**
   → il Redeploy va lanciato **a mano** dalla dashboard Vercel.

---

## 2. Verdetto: il Pannello online oggi mostra il giro del 7/7?

**Quasi certamente NO — ma la causa PRIMA non è (necessariamente) il token.**

Ci sono **due** cause indipendenti, in quest'ordine:

### Causa A (primaria, già in coda come #54/#35) — la memoria di oggi non è ancora su `origin/main`
Il giro del 7/7 (briefing `2026-07-07.md` + `STATO.md`) è **sul `main` locale del VPS**, ma `origin/main`
su GitHub è **indietro di ~1600-1835 commit** (il push è fermo, gated dalla rete/sandbox). Finché non si
esegue il push, la copia hosted legge un `origin/main` vecchio → **non vede il giro di oggi a prescindere dal token.**
→ Questo è il blocco **#54** («Pubblica su GitHub la memoria del giro… così il Pannello online la vede») e
coincide con **#35/R2** (stesso `git push origin main`, AR-008: un solo push chiude entrambi).

### Causa B (secondaria, questa proposta) — il token di lettura di Vercel potrebbe essere quello revocato
Oggi Nicola ha **revocato il vecchio PAT GitHub** (R1 ✅). Se su Vercel `OBSIDIAN_TOKEN`/`GITHUB_TOKEN`
conteneva **ancora quel valore**, allora il Pannello hosted è **anche** cieco sul canale di lettura
(risposte 401/403 dell'API GitHub) → `/api/diagnosi` segnerebbe **«Vault GitHub (Pannello)» = ROSSO, accesso KO**.
- Il push del VPS usa un token **diverso** (`GIT_PUSH_TOKEN` = `github_push_token` nuovo, incollato il 2/7):
  quindi la revoca **non** blocca il push #54 — le due cose sono separate.
- Non ho una decisione/memoria che dica «aggiornato il token di Vercel al nuovo valore» → **il rischio B è reale
  ma non verificato** (in questa sessione non ho potuto aprire l'URL hosted: non è nel repo e la rete è gated).

**Ordine corretto di sblocco:** prima **A** (push #54), poi si guarda: se dopo il push il Pannello mostra il
giro → era solo A, il token va bene. Se resta cieco → è **B**, si applica il fix token qui sotto.

---

## 3. Il check «a occhio» per Nicola (30 secondi)

Apri, sul Pannello **online**, uno di questi:

- **`<url-pannello>/api/diagnosi`** → guarda la voce **«Vault GitHub (Pannello)»**:
  - **verde** = il token legge → il Pannello vede la memoria (se manca il giro di oggi, è la Causa A: manca il push).
  - **rosso «accesso KO / token o ramo non validi»** = **token morto** → è la Causa B: applica il fix §4.
- Oppure la **home della Cabina**: se la card «Cosa ho scoperto» / l'ultimo briefing mostra la **data 2026-07-07**,
  è tutto ok; se è vuota o ferma a una data vecchia → segui l'ordine A→B sopra.

---

## 4. Fix Causa B — dare a Vercel un token di sola lettura tutto suo (least-privilege) 🔴

Da fare **solo se** il check §3 mostra «Vault GitHub» ROSSO (token morto). Tutto lato Nicola.

1. **GitHub → Settings → Developer settings → Fine-grained PAT → Generate**:
   - **Repository access:** solo `NicolaeRotaru/ad-mycity` **+** `NicolaeRotaru/mycity`.
   - **Permissions:** *Contents: **Read-only*** (basta questo per leggere il vault e il codice; niente write).
   - Nome suggerito: `vercel-pannello-readonly`.
2. **Vercel → progetto Pannello → Settings → Environment Variables:**
   - imposta **`GITHUB_TOKEN`** = il nuovo PAT read-only (copre sia il vault via fallback, sia il codice marketplace);
   - (opzionale, per chiarezza) imposta anche **`OBSIDIAN_TOKEN`** = lo stesso valore.
   - lascia invariati `OBSIDIAN_BRANCH=main` e `OBSIDIAN_REPO_OWNER=NicolaeRotaru`, `OBSIDIAN_REPO=ad-mycity`.
3. **Vercel → Deployments → ⋯ → Redeploy** (a mano: con `deploymentEnabled.main=false` il push non lo fa da solo).
4. Ricontrolla `/api/diagnosi`: «Vault GitHub (Pannello)» deve tornare **verde**.

**Perché read-only e separato:** il PAT del VPS (`GIT_PUSH_TOKEN`) ha permessi di scrittura/PR e non deve stare
in un frontend pubblico. Vercel ha bisogno solo di **leggere** → un secondo PAT sola-lettura chiude il buco
AR-004 senza dare a Vercel poteri di scrittura (least-privilege).

---

## 5. Cosa ho fatto e cosa resta

- ✅ **Fatto (🟢):** diagnosi completa del meccanismo (letta nel codice), verdetto A→B, check a occhio per Nicola,
  fix pronto passo-passo. Questo documento.
- ⏳ **In coda (mani di Nicola):**
  - **#54 / #35** — `git pull --rebase origin main && git push origin main` (Causa A, gated su rete).
  - **#55** — token read-only su Vercel + Redeploy (Causa B, solo se il check §3 è rosso).
- 🙋 **Serve da Nicola:** il check §3 (30 s) per distinguere A da B, poi la mano che resta.
