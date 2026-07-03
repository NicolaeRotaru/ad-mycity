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

## Verdetto in una riga
**Tutti i sintomi hanno UNA causa madre:** il Pannello è servito dal ramo **`memoria-ad`**,
il cui **codice** è disallineato da `main` di **75 commit / 64 file** in `pannello/`. L'unico
ponte che copia il codice di `main` su `memoria-ad` è un job shell sul VPS
(`cervello/vps/aggiorna-cervello.sh`) — fragile e attualmente in ritardo. Quando lagga o
fallisce, il Pannello serve **codice e riconciliazioni vecchie**. Le altre due anomalie
(coverage e display) sono aggravanti indipendenti.

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

## Causa radice #1 — [MADRE] Il codice del Pannello vive su `memoria-ad`, in ritardo su `main`
**Prove:**
- `origin/memoria-ad` è indietro di **75 commit** che toccano `pannello/` rispetto a `main`.
- Diff `pannello/src`: **64 file, +1093 / −5298** tra i due rami.
- Il fix di navigazione `8bfebd7` ("cambiare tab Radiografia/Auto-coscienza non riporta più
  alla Plancia") **NON è presente su `memoria-ad`** → il bug nav è ancora vivo sul Pannello.

**Perché il ponte è fragile (`aggiorna-cervello.sh`):**
- Dipende dal **VPS acceso** e dal worker systemd sano; se giù, zero allineamento.
- Silenzia gli errori git con `2>/dev/null` (righe 83, 87, 112): un `git fetch main`
  fallito lascia `FETCH_HEAD` = memoria-ad (fetch precedente, riga 83) e l'"allineamento"
  diventa un **no-op silenzioso** (allinea memoria-ad a se stesso).
- Usa `git checkout FETCH_HEAD -- <path>`: **non può cancellare** i file che `main` ha
  eliminato → componenti vecchi restano su `memoria-ad` (es. `Storico.tsx`,
  `RadiografiaDiSe.tsx` in versioni disallineate) e possono essere quelli serviti.

**Effetto:** «hai aggiunto un sacco di fix ma il pannello non li legge».

---

## Causa radice #2 — La riconciliazione dei difetti gira contro codice STALE
`cervello/auto-fix.mjs` chiude un difetto solo se il suo `verifica:{file,pattern}` **matcha
nel codice del checkout locale** (sul VPS = codice di `memoria-ad`).
- AR-004, AR-006 e AR-024 **hanno** il campo `verifica` → dovrebbero auto-chiudersi quando
  il fix è presente. Restano `in-corso`/`aperto` perché il riconciliatore legge il codice di
  `memoria-ad`, che **non contiene** ancora i fix di `main` (scan-segreti / pre-commit hook /
  `allocazione-check.mjs`). → è la stessa causa #1.
- AR-024 nel Pannello **già lo dice**: «le 20 chiusure-in-codice non sono accreditate finché
  non c'è merge+deploy». La salute resta inchiodata a 42.

**Effetto:** AR-004/AR-006 mostrati BLOCCANTI anche se il fix tecnico è fatto.

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

## Piano di fix (in ordine di leva)

### A. STRUTTURALE (risolve #1 e #2 alla radice) — decisione di Nicola
**Deploy del CODICE del Pannello da `main`, lettura DATI da `memoria-ad`.**
- Su Vercel: **Production Branch = `main`** (root `pannello/`). Il codice è sempre fresco al merge.
- `OBSIDIAN_BRANCH=memoria-ad` resta invariato → i dati/memoria restano freschi via API.
- Il VPS **non deve più copiare codice** su `memoria-ad` (elimina l'anello debole).
- Il riconciliatore `auto-fix.mjs` va fatto girare contro il codice di **`main`** (non memoria-ad),
  così i difetti si chiudono al merge del fix.
- Richiede la mano di Nicola (impostazione Vercel). Verifica in 5 secondi: Vercel → Project →
  Settings → Git → *Production Branch*.

### B. HARDENING del ponte (se si vuole tenere `memoria-ad` come ramo di deploy)
- `aggiorna-cervello.sh`: togliere i `2>/dev/null` sui fetch critici, fallire forte se
  `git fetch main` non aggiorna, e **propagare le cancellazioni** (usare `git checkout` +
  rimozione dei file assenti in main, o un `git read-tree`/rsync della sottocartella).
- Esporre nel Pannello lo **stato dell'ultima sync** (SHA di main allineato + timestamp), così
  un ritardo è visibile invece che silenzioso.

### C. DISPLAY (sicuro, additivo) — risolve #3
- `RadiografiaDiSe.tsx`: aggiungere `nota_fix` al tipo `Difetto` e mostrarlo, con stato chiaro
  «🔧 fix fatto — attende Nicola: <azione>» per gli `in-corso`.

### D. COPERTURA (sicuro, additivo) — risolve #4 e la richiesta-titolo
- Nuova area **"Esplora GitHub"**: browser in sola lettura sull'albero di `memoria-ad`
  (riusa `listVaultDirEntries` + Contents API). Garantisce che **ogni file su GitHub sia
  raggiungibile dal Pannello**, senza dover cablare a mano ogni nuovo tipo di artefatto.

---

## Raccomandazione
Fare **A** (la cura vera: disaccoppia codice-freshness dal VPS) + **C** e **D** (additivi,
sicuri, li implemento subito su branch). **B** solo se Nicola vuole restare su `memoria-ad`
come ramo di deploy. Senza **A**, ogni fix futuro continuerà a dipendere dalla salute del VPS.
