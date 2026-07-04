---
tipo: runbook
titolo: R2 — Merge + deploy dei fix del cantiere (attivare in main i fix macchina)
data: 2026-07-04 09:50
reparto: AD/DevOps-SRE
colore: 🔴 (merge in main → auto-deploy VPS; irreversibile-morbido, con rollback)
stato: pronto — approvato dal Pannello (R2), aspetta la mano/il via di Nicola
proposta: r2-merge-deploy-fix-cantiere-branch-machine-anal
---

# 🔴 R2 — Merge + deploy dei fix del cantiere

> **Approvata dal Pannello (proposta dal giro, livello giallo).** Questo runbook la rende
> eseguibile passo-passo. Chi la esegue: DevOps/AD in una sessione con **rete + git push**
> aperti (in questa sessione la rete è chiusa → l'azione è **pronta, in coda #35**).

---

## 0. La scoperta che cambia la premessa (leggi prima di agire)

La proposta diceva «i 18 fix sono scritti ma **inerti**». **Non è così**, e conviene saperlo:

- I 18–20 fix del cantiere (timeout giro AR-005, gate sensori anti-invenzione, guardiano
  agenti, `sensore-cassa`, `allocazione-check`, `scan-segreti` + pre-commit hook, gate HACCP,
  ecc.) **sono già committati e ATTIVI sul branch `memoria-ad`**, che è **il branch da cui gira
  il VPS** (`GIT_BRANCH` default in `aggiorna-cervello.sh:54`). `giro.sh` li richiama davvero
  (righe 66, 173, 175, 184, 190, 377). Quindi oggi **funzionano già in produzione**.
- **`main` invece è un relitto: ~116 commit / ~150 file di codice indietro** rispetto a
  `memoria-ad`. Il codice canonico vive di fatto su `memoria-ad`; `main` non viene aggiornato
  da settimane.

### Perché allora R2 serve DAVVERO (non è cosmesi)
`aggiorna-cervello.sh` (righe 122-124) **propaga le cancellazioni da main**: quando `watch-main`
rileva che `origin/main` è avanzato, allinea il codice di `memoria-ad` a main **e rimuove i file
di codice presenti in memoria-ad ma assenti in main**. Tradotto: **il giorno in cui `main` riceve
un qualsiasi commit, il sync cancellerebbe da `memoria-ad` tutti i file-fix del cantiere che non
sono in main** (`scan-segreti.mjs`, `sensore-cassa.mjs`, `agent-registry-check.mjs`,
`allocazione-check.mjs`, `chiusura-loop.mjs`, `delta-gate.mjs`, …) **rompendo `giro.sh`**.

➡️ **R2 = mettere in salvo i fix rendendoli canonici in `main`.** Non è "accendere" qualcosa di
spento: è togliere una trappola latente e riallineare la fonte di verità.

### ⚠️ Mina da NON spingere in main
Nel tree di `memoria-ad` risulta tracciato un oggetto **`marketplace`** (la copia locale del repo
`NicolaeRotaru/mycity`, oggi giustamente in `.gitignore` `/marketplace/`, ma storicamente
committato). **NON deve finire in `main`.** Va escluso esplicitamente dal merge.
`.mcp.json` invece è pulito (usa `${SUPABASE_ACCESS_TOKEN}`, nessun segreto hardcoded) → ok.

---

## 1. Precondizioni (verifica prima di partire)

1. **Working tree di `memoria-ad` pulito/settled.** Ora ci sono modifiche non committate
   (`giro.sh`, `marketplace-repo.mjs`, `routing.json` + `no-path-cablati-check.mjs` untracked):
   è lo stato **mid-giro** del wiring `no-path-cablati` (coda **#33**). Fai committare/chiudere il
   giro in corso (o lascia che `aggiorna-cervello.sh` faccia il commit «recupero pendenti») **prima**
   di calcolare il diff da mergiare. R2 va fatto da uno stato committato.
2. **Coordina con #33** (AR-033, path Windows nei 2 workflow + guardiano no-path-cablati): è lo
   stesso cantiere. Idealmente #33 atterra insieme o subito prima, così i workflow radiografia
   sono portabili anche in `main`.
3. **Coordina con R1/#34** (revoca PAT AR-004): R2 **non** peggiora AR-004 (il token è già nella
   storia git di tutti i branch; il fix di R2 rimuove `.env.save` andando avanti). Ma il push in
   `main` usa `GIT_PUSH_TOKEN`: se R1 viene fatto **prima**, usa il **nuovo** PAT.
4. **Momento a basso traffico.** Il merge fa ripartire il worker (`systemctl restart mycity-worker`)
   entro ~5 min: non lanciarlo mentre un giro/consegna critica è in corso.

---

## 2. Esecuzione — scegli la strada

### 🅰️ Strada A — merge del branch scoped (PREFERITA se il branch esiste ancora)
Il branch originale dei fix è **`claude/machine-analysis-ez7g3e`**: è il diff **isolato** dei 18
fix, **senza** la mina `marketplace` e senza il resto della divergenza. È la strada più pulita.

```bash
# 0) Verifica che il branch esista ancora su origin
git ls-remote --heads origin | grep -i machine-analysis
```

- **Se c'è** → apri/mergia la PR di `claude/machine-analysis-ez7g3e` → `main` (via GitHub, o
  `gh pr create --base main --head claude/machine-analysis-ez7g3e` poi merge). Salta a §3.
- **Se NON c'è più** (probabile: i fix sono già confluiti in `memoria-ad` e il branch è stato
  cancellato) → usa la **Strada B**.

### 🅱️ Strada B — riconciliazione code-only `memoria-ad` → `main` (se il branch scoped è sparito)
Porta in `main` **solo i path di codice** di `memoria-ad`, **escludendo** vault e la mina
`marketplace`. Da rivedere in PR prima del merge (mai push diretto su main).

```bash
cd /opt/mycity/ad-mycity
# parti da main aggiornato
git fetch origin main
git checkout -B r2-cantiere-in-main origin/main

# porta i file di CODICE da memoria-ad (tutto TRANNE vault/consegne/creativi/memoria-squadra)
# — stessa definizione di "codice" usata da aggiorna-cervello.sh:114
git checkout memoria-ad -- $(git ls-tree --name-only memoria-ad \
  | grep -vE '^(MyCity-Vault|consegne|creativi|memoria-squadra)$')

# ESCLUDI la mina: la copia locale del marketplace non va in main
git rm -r --cached --ignore-unmatch marketplace 2>/dev/null || true
rm -rf marketplace  # (ricreabile con: node cervello/collega-marketplace.mjs)

# rete di sicurezza: nessun segreto in ciò che stai per pushare
node cervello/scan-segreti.mjs   # deve uscire pulito

git add -A
git commit -m "R2: canonicalizza in main i fix del cantiere (timeout giro, gate sensori, guardiani, sensore cassa, hook segreti)"
git push origin r2-cantiere-in-main
gh pr create --base main --head r2-cantiere-in-main --title "R2 — fix cantiere in main" --body "Attiva/mette in salvo i fix del cantiere radiografia. Esclusa la copia locale marketplace."
# → rivedi il diff nella PR, poi merge su main
```

---

## 3. Deploy = automatico (non serve restart a mano)

Appena `main` avanza, **`mycity-watch-main.timer` (ogni 5 min)** rileva l'avanzamento →
`aggiorna-cervello.sh` porta il codice in `memoria-ad`, committa, pusha e **riavvia
`mycity-worker`** + `systemctl daemon-reload` per i `.service`/`.timer` cambiati (AR-059).
**Non serve toccare systemd a mano.** (Se vuoi forzarlo subito, come root:
`sudo bash /opt/mycity/ad-mycity/cervello/vps/watch-main.sh --force`.)

---

## 4. Verifica post-deploy (cancello di serietà)

```bash
systemctl is-active mycity-worker                 # atteso: active
journalctl -u mycity-worker -n 40 --no-pager      # nessun errore all'avvio
# lancia un giro dal Pannello e controlla che i guardiani girino verdi:
#   agent-registry-check (drift 0), scan-segreti (pulito), sensore-cassa,
#   allocazione-check, chiusura-loop --sonda, timeout AR-005 attivo
```
Esito atteso: worker attivo, giro completo senza errori, guardiani verdi, il Pannello continua a
leggere `memoria-ad`. Se un guardiano fallisce → §5.

---

## 5. Rollback (se qualcosa si rompe)

Il merge in `main` è reversibile:
```bash
git revert -m 1 <sha-del-merge-R2>   # oppure git revert <sha> se fast-forward
git push origin main
```
Al successivo `watch-main` (~5 min) il VPS si riallinea allo stato pre-R2 e riavvia il worker.
Nessun dato perso (il vault vive su `memoria-ad`, non toccato).

---

## Colore & governo
🔴 perché tocca `main` → **auto-deploy in produzione** del cervello dell'AD (worker restart).
Governo CLAUDE.md: ogni auto-modifica della macchina è firma-Nicola → **firma già data** (proposta
R2 approvata dal Pannello 2026-07-04). Resta la **mano** (rete/git push aperti) + la scelta
Strada A/B alla verifica del branch scoped su origin.
