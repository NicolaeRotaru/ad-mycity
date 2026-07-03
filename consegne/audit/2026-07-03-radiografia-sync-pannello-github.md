---
data: 2026-07-03 03:10
tipo: radiografia
tema: sincronizzazione GitHub → Pannello
autore: AD (tech + devops-sre)
gravita: BLOCCANTE
---

# 🩻 Radiografia — perché il Pannello non mostra ciò che c'è su GitHub

> Domanda di Nicola: «hai aggiunto un sacco di fix ma molti il pannello non li legge …
> deve vedersi sul pannello ogni informazione che c'è dentro GitHub».
> Sintomi concreti citati: (1) AR-004 e AR-006 restano BLOCCANTI anche se risolti+PR;
> (2) non si riesce a navigare dentro Auto-coscienza (riporta alla Plancia).

## ⚠️ Correzione onesta (dopo verifica sul remoto aggiornato)
La prima stima "75 commit / 64 file indietro" era misurata contro un `origin/main` **vecchio
nel clone**. Con `main` aggiornato (5e9efa8), il codice del Pannello su `memoria-ad` risulta
**quasi allineato** (1 file in `pannello/src`: `guardrail-semaforo.ts`; 9 file in `cervello/`).
Quindi il ponte di sync del codice **funziona più di quanto sembrasse**. Il difetto vero non è
"tutto indietro", ma è **più insidioso e provato**: le CANCELLAZIONI non si propagano.

## Verdetto in una riga
Il Pannello è servito dal ramo **`memoria-ad`**, allineato a `main` da un job shell sul VPS
(`aggiorna-cervello.sh`) che **(a)** non propaga le cancellazioni (`git checkout` non elimina),
**(b)** silenzia gli errori git. Prova regina: `cervello/vps/.env.save` (il PAT di AR-004) è
stato **rimosso su `main` ma è ancora VIVO su `memoria-ad`**. Aggiungi due gap indipendenti —
il Pannello **nasconde `nota_fix`** (i difetti sembrano non lavorati) e legge solo un **set
fisso di percorsi** (tutto il resto su GitHub è invisibile).

---

## Come funziona la sync oggi (la catena)
1. Il "cervello" (Claude Code + worker VPS) scrive la memoria e pubblica **sul ramo `memoria-ad`**
   (mai su `main`). — `cervello/vps/aggiorna-cervello.sh`, `giro.sh`.
2. Il **Pannello (Vercel)** legge il vault via **GitHub Contents API** sul ramo
   `OBSIDIAN_BRANCH` (default `memoria-ad`). — `pannello/src/lib/obsidian.ts`, `vault.ts`.
3. Le PR di codice (fix, feature) vengono **mergiate su `main`**.
4. Per portare quei fix al Pannello, il VPS esegue `aggiorna-cervello.sh` che fa
   `git checkout FETCH_HEAD -- <code_paths>` da `main` e **committa su `memoria-ad`**
   ("aggiorna-cervello: allinea codice a main").

Il punto 4 è l'anello debole: se salta, i fix di `main` non arrivano mai al Pannello.

---

## Causa radice #1 — [MADRE] Il ponte VPS non propaga le cancellazioni + silenzia gli errori
Il Pannello (Vercel) è servito da `memoria-ad`; `aggiorna-cervello.sh` copia il codice di `main`
con `git checkout FETCH_HEAD -- <code_paths>`.

**Prova regina (verificata):** `cervello/vps/.env.save` — il file col PAT reale di AR-004 —
è **assente su `main`** (rimosso) ma **ancora PRESENTE su `memoria-ad`**. Motivo: `git checkout
<tree> -- <path>` porta aggiunte/modifiche ma **non elimina** i file che main ha cancellato.
Conseguenze: (1) il segreto resta esposto sul ramo che serve il Pannello; (2) qualsiasi file
che main elimina come parte di un fix (componenti vecchi, route deprecate) **sopravvive** sul
Pannello e può essere quello servito.

**Fragilità aggiuntive di `aggiorna-cervello.sh`:**
- Dipende dal **VPS acceso** e dal worker systemd sano; se giù, zero allineamento.
- Silenzia gli errori con `2>/dev/null`: un `git fetch main` fallito lasciava `FETCH_HEAD` =
  memoria-ad (fetch precedente) → "allineamento" **no-op silenzioso** (memoria-ad su se stesso).

**Fix applicato (branch):** `aggiorna-cervello.sh` ora **propaga le cancellazioni**
(`git diff --diff-filter=D` + `git rm`) e **non silenzia** il fetch di main (salta l'allineamento
con errore esplicito invece di fingere successo).

---

## Causa radice #2 — AR-004/AR-006 sono aperti CORRETTAMENTE, ma il Pannello nasconde il perché
Verificato nel `cantiere-difetti.json`:
- **AR-004 e AR-006** hanno `verifica: {"tipo":"umano"}` → per `auto-fix.mjs` sono **manuali**,
  NON auto-chiudibili: attendono un'azione di Nicola (AR-004 = revoca del PAT; AR-006 = giudizio
  sul faro/allocazione). Restare `in-corso` è **corretto**. Il problema è che i loro `nota_fix`
  («fix tecnico già fatto — manca solo l'azione umana X») **non vengono mostrati** dal Pannello.
- **AR-024**: `verifica` cerca `voto_provvisorio` in `sonda-volano.mjs`, pattern **assente su
  ENTRAMBI** i rami → il fix non è ancora scritto: aperto correttamente.

Quindi NON è (qui) un problema di sync: è **display**. Il Pannello mostra solo `causa_radice` +
`fix_proposto`, mai `nota_fix` né lo stato «attende Nicola» → tu leggi "BLOCCANTE" e pensi che
nulla sia stato fatto.

**Fix applicato (branch):** `RadiografiaDiSe.tsx` ora mostra `nota_fix` e un badge
«🔧 fix fatto — attende Nicola» sugli `in-corso`.

---

## Causa radice #3 — [DISPLAY] Il Pannello non mostra `nota_fix`
`pannello/src/components/cervello/RadiografiaDiSe.tsx` renderizza `causa_radice` e
`fix_proposto`, ma **il tipo `Difetto` non include `nota_fix`** e non lo mostra. Eppure è lì
che sta scritto «fix già fatto — manca solo l'azione di Nicola (es. revoca del PAT)».
Risultato: vedi "BLOCCANTE" e pensi che nulla sia stato risolto.

**Effetto:** l'informazione ESISTE su GitHub ma non arriva ai tuoi occhi.

---

## Causa radice #4 — [COPERTURA] Il Pannello legge solo un set hardcoded di percorsi
Il Pannello NON è uno specchio del repo: legge una lista fissa (STATO, DECISIONI,
AZIONI-IN-ATTESA, Briefing/, Report/, OKR, 06-Piani/, memoria-squadra/, auto-coscienza/*.json).
Tutto il resto presente su `memoria-ad` **non ha alcuna superficie** e resta invisibile:
- `consegne/` — **28 cartelle** (audit, design, intelligence, marketing, tech, strategia, video…);
  il Pannello legge SOLO `consegne/vendite/pitch-garetti.md`.
- `90-Memoria-AI/`: `AUTO-ANALISI.md`, `AZIONI-PRONTE.md`, `RADIOGRAFIA-MACCHINA.md`,
  `PIANO-CABINA-OPERATIVA.md`, `Collegamento-AD.md`, `Intelligence/` (5 dossier).

**Effetto:** «mi sembra che non lo fa con tante altre cose».

---

## Piano di fix — stato

### ✅ FATTI su branch `claude/panel-github-sync-debug-waqnl2` (build verde)
- **Ponte sync (#1):** `aggiorna-cervello.sh` propaga le **cancellazioni** e non silenzia il
  fetch di main. Al prossimo giro il `.env.save` sparisce da `memoria-ad` e i file eliminati da
  un fix non sopravvivono più.
- **Display (#2/#3):** `RadiografiaDiSe.tsx` mostra `nota_fix` + badge «🔧 fix fatto — attende
  Nicola».
- **Copertura (#4):** nuova area **"GitHub"** (`EsploraGitHub.tsx` + `/api/repo/esplora`):
  browser in sola lettura su TUTTO l'albero del repo (ramo memoria-ad). Ogni file è raggiungibile.

### 🔴 RICHIEDE NICOLA (non automatizzabile)
- **AR-004 — revoca il PAT** su GitHub e generane uno nuovo mai committato. Rimuovere il file
  NON basta: il token è già nella storia git. (Poi: purga storia con BFG/filter-repo.)
- **Verifica Vercel:** Settings → Git → *Production Branch*. Se è `memoria-ad`, valuta l'opzione A.
- **Redeploy:** se il bug nav persiste, forza un redeploy (il fix nav è già nel codice servito).

### 🟡 DA DECIDERE — architettura (opzione A, la cura definitiva)
Deploy del **codice** del Pannello da `main`, lettura **dati** da `memoria-ad`. Disaccoppia la
freschezza del codice dalla salute del VPS. Elimina del tutto la classe di bug #1. Richiede il
cambio di Production Branch su Vercel + far girare `auto-fix.mjs` contro `main`.

### 🟢 ALTRI fix additivi candidati (tua domanda "ce ne sono altri?")
- **E — Stato sync visibile:** mostrare nel Pannello lo SHA di `main` allineato + timestamp
  dell'ultima sync, così un ritardo si vede invece di essere silenzioso.
- **F — Riconciliatore contro `main`:** `auto-fix.mjs verifica` legge il codice di `main` (non la
  copia di memoria-ad) → i difetti auto-verificabili si chiudono al merge, non al deploy.
- **G — Superfici mirate:** agganciare `consegne/audit`, `consegne/design`, `Intelligence/`,
  `RADIOGRAFIA-MACCHINA.md` alle aree esistenti (oltre al browser generico D).

## Raccomandazione
Ho già chiuso #1/#2/#3/#4 sul branch. La **cura definitiva** resta **A** (deploy codice da main):
finché il Pannello dipende dal ponte VPS, ogni fix futuro dipende dalla salute del VPS. Nel
frattempo E+F rendono i ritardi **visibili** e la riconciliazione **istantanea al merge**.
