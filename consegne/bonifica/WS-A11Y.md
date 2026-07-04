# WS-A11Y — Pacchetto di fix Accessibilità (WCAG 2.1)

**Workstream:** Accessibilità (a11y) · **Findings coperti:** 7/7 · **Fonte:** `consegne/bonifica/_findings.json` → `accessibilita`
**Autore:** frontend-dev (senior + a11y WCAG 2.1) · **Data:** 2026-07-04
**Modalità:** SOLA LETTURA sul repo `marketplace/` — questo file è il pacchetto pronto da applicare in branch (`fix/a11y-bonifica`), MAI su main. Nessun deploy (🔴 firma Nicola).

> ⚠️ **Coordinamento sessioni parallele.** Finding A3 (ProductCard) tocca `components/ProductCard.tsx` che è anche territorio di **WS-PERF** (memo/immagini) e **WS-FRONTEND** (griglia/`ProductGrid.tsx`). Prima di applicare A3: `git pull --rebase`, branch separato, e se WS-PERF/WS-FRONTEND stanno editando lo stesso file → si applica A3 per ULTIMO sopra le loro modifiche (il pattern linked-card cambia il wrapper radice `<Link>→<article>`, quindi va rebasato sulle loro modifiche interne, non viceversa). Segnalato in Sala Operativa.

---

## Riepilogo (per gravità)

| # | Finding | File | Sev | WCAG | Colore |
|---|---------|------|-----|------|--------|
| A1 | Lightbox foto: no Esc / focus-trap / frecce tastiera | `app/product/[id]/page.tsx` | grave | 2.1.1, 2.4.3, 1.4.13 | 🟡 |
| A2 | SearchBar: autocomplete senza semantica combobox | `components/SearchBar.tsx` | grave | 4.1.2, 1.3.1 | 🟡 |
| A3 | ProductCard: `<button>` annidati dentro `<a>` | `components/ProductCard.tsx` | grave | 4.1.2 + HTML parsing | 🟡 |
| A4 | ConfirmDialog danger: autofocus distruttivo + Enter + no describedby | `components/ConfirmDialog.tsx` | grave | 3.3.4, 4.1.2, 1.3.1 | 🟡 |
| A5 | Menu account: `aria-haspopup` senza role menu/Esc | `components/Navbar.tsx` | minore | 4.1.2 | 🟢 |
| A6 | Focus outline azzerato (`focus:outline-none`) | 3 file venditore | minore | 2.4.7 | 🟢 |
| A7 | Selettore stelle: no radiogroup / stato | `app/orders/[id]/review/page.tsx` | minore | 1.4.1, 4.1.2 | 🟢 |

---

## A1 — Lightbox foto prodotto: Esc + focus trap + navigazione tastiera

**File:** `app/product/[id]/page.tsx` (lightbox righe 483-540; stato righe 61-68; import riga 3)
**Causa-radice:** il lightbox è un `role="dialog" aria-modal="true"` costruito a mano. Le frecce ‹/› e lo swipe cambiano foto solo via mouse/touch; nessun listener `keydown` è legato al lightbox (i due `useEffect` a 180/188 riguardano scroll-sync e badge "Nuovo"). All'apertura il focus resta dietro l'overlay, alla chiusura non viene ripristinato, il Tab esce dal dialog.

**Scelta di design:** NON si riusa il primitivo `Modal` (ha header/footer con chrome e sfondo bianco: distruggerebbe il layout full-bleed nero della galleria). Si aggiunge un `useEffect` dedicato + focus management manuale — coerente con il pattern già usato in `Modal.tsx` (stesso selettore focusables).

### Diff

**1) Aggiungere il ref al bottone Chiudi** (stato, dopo riga 68):
```diff
   const galleryRef = useRef<HTMLDivElement>(null);
   const touchStartX = useRef<number | null>(null);
+  const lightboxCloseRef = useRef<HTMLButtonElement>(null);
+  const lightboxPrevFocus = useRef<HTMLElement | null>(null);
```

**2) Nuovo `useEffect` — inserire subito dopo l'effetto scroll-sync (dopo riga 184):**
```diff
   }, [lightbox, activeImg]);
+
+  // A11y lightbox: Esc chiude, ←/→ navigano, focus entra sul «Chiudi» e viene
+  // ripristinato alla chiusura, Tab intrappolato tra i controlli. WCAG 2.1.1/2.4.3.
+  useEffect(() => {
+    if (!lightbox) return;
+    lightboxPrevFocus.current = document.activeElement as HTMLElement | null;
+    const t = setTimeout(() => lightboxCloseRef.current?.focus(), 10);
+    const onKey = (e: KeyboardEvent) => {
+      if (e.key === 'Escape') { e.preventDefault(); setLightbox(false); return; }
+      if (images.length > 1) {
+        if (e.key === 'ArrowLeft')  { e.preventDefault(); setActiveImg((p) => (p - 1 + images.length) % images.length); return; }
+        if (e.key === 'ArrowRight') { e.preventDefault(); setActiveImg((p) => (p + 1) % images.length); return; }
+      }
+      if (e.key === 'Tab') {
+        const root = lightboxCloseRef.current?.closest('[role="dialog"]');
+        const f = root?.querySelectorAll<HTMLElement>('button:not([disabled])');
+        if (!f || f.length === 0) return;
+        const first = f[0], last = f[f.length - 1];
+        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
+        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
+      }
+    };
+    window.addEventListener('keydown', onKey);
+    return () => {
+      clearTimeout(t);
+      window.removeEventListener('keydown', onKey);
+      lightboxPrevFocus.current?.focus?.();
+    };
+  }, [lightbox, images.length]);
```

**3) Collegare il ref al bottone Chiudi** (riga 502-509):
```diff
             <button
               type="button"
+              ref={lightboxCloseRef}
               onClick={() => setLightbox(false)}
               aria-label="Chiudi"
```

> Nota: `setActiveImg` con updater funzionale `(p) => …` evita di mettere `activeImg` nelle deps (l'effetto si ri-registrerebbe ad ogni foto). Le dep sono solo `[lightbox, images.length]`.

**Test (Playwright, scheletro):**
```ts
test('lightbox: tastiera completa', async ({ page }) => {
  await page.goto('/product/<id>');
  await page.getByRole('button', { name: /ingrandisci|zoom|foto/i }).first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(page.getByRole('button', { name: 'Chiudi' })).toBeFocused(); // focus entra
  await page.keyboard.press('ArrowRight');            // naviga foto
  await page.keyboard.press('Escape');                // chiude
  await expect(dialog).toBeHidden();
});
// + axe: expect(await new AxeBuilder({page}).analyze()).violations toBe [] con lightbox aperto
```
**Verifica manuale:** apri zoom con Enter → focus sul ×, freccia dx/sx scorre, Tab resta dentro, Esc chiude e il focus torna alla thumbnail. Screen reader annuncia "Foto di <nome>, dialog".
**Rischio & rollback:** basso — additivo, nessun markup rimosso. Rollback = elimina il `useEffect` e il ref. Rischio residuo: se un'altra modale globale ascoltasse Escape sul `window` potrebbe esserci doppio handling → mitigato da `e.preventDefault()` e dal fatto che il lightbox è l'unico overlay su questa pagina.
**Dipendenze:** nessuna esterna. File esclusivo a11y (product page) — non collide con altri WS.

---

## A2 — SearchBar: semantica combobox + navigazione frecce

**File:** `components/SearchBar.tsx` (input 156-166; pannello 179-262; stato 34-46)
**Causa-radice:** l'input ha solo `aria-label="Cerca"`. Mancano `role="combobox"`, `aria-expanded/controls/autocomplete/activedescendant`; il pannello risultati e la `<ul>` non hanno `role="listbox"/option`; nessun `onKeyDown` per ArrowUp/Down/Enter/Escape (il commento riga 32 lo dichiara "MVP: clic").

**Fix — pattern ARIA 1.2 combobox con listbox + `aria-activedescendant`** (nessuna gestione roving tabindex: le opzioni restano non tabbabili, si naviga con le frecce e si conferma con Enter).

### Diff

**1) Stato indice attivo** (dopo riga 37):
```diff
   const [open, setOpen] = useState(false);
+  const [activeIdx, setActiveIdx] = useState(-1); // opzione evidenziata (frecce)
```

**2) Reset indice quando cambiano i suggerimenti** (dopo il debounce useEffect, ~riga 46):
```diff
+  // Ogni nuovo set di risultati riparte senza selezione.
+  useEffect(() => { setActiveIdx(-1); }, [debounced, suggestions.length]);
```

**3) `onKeyDown` sull'input + attributi combobox** (righe 156-166):
```diff
         <input
           ref={inputRef}
           type="text"
           value={q}
           onChange={(e) => { setQ(e.target.value); setOpen(true); }}
           onFocus={() => setOpen(true)}
+          onKeyDown={(e) => {
+            if (!open || suggestions.length === 0) return;
+            if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((i) => (i + 1) % suggestions.length); }
+            else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx((i) => (i - 1 + suggestions.length) % suggestions.length); }
+            else if (e.key === 'Enter' && activeIdx >= 0) {
+              e.preventDefault();
+              const s = suggestions[activeIdx];
+              const href = s.kind === 'product' ? `/product/${s.id}` : s.kind === 'store' ? `/store/${s.id}` : `/category/${s.slug}`;
+              setOpen(false); router.push(href);
+            } else if (e.key === 'Escape') { setOpen(false); setActiveIdx(-1); }
+          }}
           placeholder={placeholder}
-          aria-label="Cerca"
+          aria-label="Cerca"
+          role="combobox"
+          aria-expanded={open && debounced.length >= 2}
+          aria-controls="search-listbox"
+          aria-autocomplete="list"
+          aria-activedescendant={activeIdx >= 0 ? `search-opt-${activeIdx}` : undefined}
           autoFocus={autoFocus}
           className="w-full bg-white border-2 border-transparent focus:border-primary-400 focus:bg-white text-ink-900 placeholder-ink-400 rounded-full pl-11 pr-11 py-2.5 text-sm font-medium focus:outline-none transition-colors shadow-sm"
```
> ⚠️ **Nota su `focus:outline-none` (riga 165):** questo input compensa con `focus:border-primary-400` (bordo 2px visibile a fuoco), quindi NON rientra tra i campi rotti di A6. Lasciarlo. Se in review si preferisce uniformità, aggiungere `focus-visible:ring-2 focus-visible:ring-primary-400`.

**4) `role="listbox"` sul contenitore + `role="option"` con `id` e stato evidenziato.** Sul wrapper riga 180:
```diff
-        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-warm-lg ring-1 ring-ink-100 overflow-hidden z-50 max-h-[60vh] overflow-y-auto">
+        <div id="search-listbox" role="listbox" aria-label="Suggerimenti di ricerca"
+             className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-warm-lg ring-1 ring-ink-100 overflow-hidden z-50 max-h-[60vh] overflow-y-auto">
```
Su ciascun `<Link>` opzione (le 3 varianti product/store/category, righe 194/216/234) aggiungere `role`, `id`, stato attivo. Esempio (product, replicare sulle altre due usando lo stesso indice `i` del `.map`):
```diff
                       <Link
                         href={`/product/${s.id}`}
+                        id={`search-opt-${i}`}
+                        role="option"
+                        aria-selected={i === activeIdx}
                         onClick={() => setOpen(false)}
-                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-cream-100 transition-colors"
+                        className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${i === activeIdx ? 'bg-cream-100' : 'hover:bg-cream-100'}`}
                       >
```
> La riga "Vedi tutti i risultati" (250-258) e il ramo "Nessun risultato" restano `<Link>` normali fuori dal conteggio opzioni (non entrano in `aria-activedescendant`). Se si vuole includerli nel ciclo frecce, estendere `suggestions.length` con +1 — fuori scope, tenere semplice.

**Test:**
```ts
test('searchbar combobox tastiera', async ({ page }) => {
  const input = page.getByRole('combobox', { name: 'Cerca' });
  await input.fill('coppa');
  await expect(input).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('listbox')).toBeVisible();
  await input.press('ArrowDown');
  await expect(page.getByRole('option').first()).toHaveAttribute('aria-selected', 'true');
  await input.press('Enter'); // naviga all'opzione attiva
});
```
**Verifica manuale:** digita 2+ char → SR annuncia "Cerca, combobox, espanso"; freccia giù evidenzia e SR legge l'opzione; Enter naviga; Esc chiude.
**Rischio & rollback:** medio-basso. Rischio: l'Enter con `activeIdx>=0` intercetta il submit del form → gestito con `e.preventDefault()` prima del submit nativo; con `activeIdx===-1` il form fa il submit normale (`/search?q=`). Rollback: rimuovi `onKeyDown`, `activeIdx` e gli attributi ARIA.
**Dipendenze:** nessuna. `router` già importato (riga 35). File esclusivo — collisione solo se WS-FRONTEND tocca SearchBar (coordinare in Sala).

---

## A3 — ProductCard: sciogliere `<button>` annidati in `<a>` (linked-card)

**File:** `components/ProductCard.tsx` (radice `<Link>` riga 111; `<button>` cuore 135, `+` 187; export `memo` 203)
**Causa-radice:** l'intera card è un `<Link>`→`<a>` che contiene due `<button>` reali. L'HTML vieta interattivi annidati: l'albero di accessibilità è ambiguo (SR annunciano la card come un unico link, controllo vocale non mira i bottoni interni). Componente ubiquo (ogni griglia + rail home).

**Fix — pattern "linked card" con overlay `::after`:** la radice diventa un `<article>` posizionato; il link prodotto avvolge SOLO titolo+immagine e si stende su tutta la card via `after:absolute after:inset-0`; cuore e `+` diventano **fratelli** del link con `z-10` (sopra l'overlay). Così nessun `<button>` vive dentro un `<a>` e i click restano naturali senza `preventDefault`/`stopPropagation`.

### Diff (struttura)

**1) Radice: da `<Link>` a `<article>`** (righe 110-114):
```diff
-  return (
-    <Link
-      href={`/product/${id}`}
-      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-surface-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:border-primary-200 hover:shadow-warm-lg"
-    >
+  return (
+    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-surface-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:border-primary-200 hover:shadow-warm-lg">
```

**2) Il link-overlay va sul TITOLO** (righe 159-161), stendendolo su tutta la card con `::after`:
```diff
-        <h3 className="line-clamp-2 min-h-[2.6em] text-[13px] font-semibold leading-snug text-ink-900 transition-colors group-hover:text-primary-700">
-          {name}
-        </h3>
+        <h3 className="line-clamp-2 min-h-[2.6em] text-[13px] font-semibold leading-snug text-ink-900 transition-colors group-hover:text-primary-700">
+          <Link
+            href={`/product/${id}`}
+            className="after:absolute after:inset-0 after:content-[''] after:z-0 focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-primary-500 focus-visible:after:rounded-2xl"
+          >
+            {name}
+          </Link>
+        </h3>
```

**3) Cuore e `+` — alzare a `z-10` (già presenti) e SEMPLIFICARE gli handler** (niente più `preventDefault` sul link fantasma; restano `stopPropagation` per sicurezza ma non più necessari). Le classi `z-10` sul cuore (139) e da aggiungere sul `+` (192) tengono i bottoni sopra l'overlay:
```diff
             <button
               type="button"
               onClick={handleAdd}
               disabled={isOutOfStock}
               aria-label={hasVariants ? `Scegli le opzioni di ${name}` : `Aggiungi ${name} al carrello`}
-              className="ml-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-white shadow-sm transition-all hover:bg-primary-700 active:scale-95 disabled:cursor-not-allowed disabled:bg-cream-200 disabled:text-ink-400 disabled:active:scale-100"
+              className="relative z-10 ml-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-white shadow-sm transition-all hover:bg-primary-700 active:scale-95 disabled:cursor-not-allowed disabled:bg-cream-200 disabled:text-ink-400 disabled:active:scale-100"
             >
```
> `handleAdd`/`handleFav` (righe 68-94) mantengono `e.preventDefault(); e.stopPropagation();` — ora innocui ma difensivi: se in futuro l'immagine venisse avvolta anch'essa in un link, un click sul bottone non deve navigare. Per varianti `hasVariants` il tap sul "+" deve invece navigare alla scheda: oggi `handleAdd` fa `return` prima del preventDefault (riga 69) → **con la card non più cliccabile globalmente, il "+" con varianti NON naviga più.** Fix: nel ramo varianti, navigare esplicitamente.
```diff
   const handleAdd = (e: React.MouseEvent) => {
-    if (hasVariants) return;
+    if (hasVariants) { router.push(`/product/${id}`); return; }
     e.preventDefault();
     e.stopPropagation();
```
Aggiungere import `useRouter` (riga 3-6 area) e `const router = useRouter();` nel corpo:
```diff
-import { memo, useEffect, useState } from 'react';
+import { memo, useEffect, useState } from 'react';
 import Link from 'next/link';
+import { useRouter } from 'next/navigation';
```
```diff
   const isFav = favorites.has(id);
   const [heartBeat, setHeartBeat] = useState(false);
+  const router = useRouter();
```

**4) Chiudere `</Link>` → `</article>`** (riga 199):
```diff
-    </Link>
+    </article>
```

> **Immagine cliccabile:** con l'overlay `::after` sul link del titolo, cliccare la foto naviga comunque (l'overlay copre tutta la card). Se WS-FRONTEND vuole anche un `aria-hidden` sull'immagine per non duplicare il nome accessibile, coordinare — l'`alt={name}` sull'`<Image>` è ok (unico nome sul link è il testo del titolo).

**Test:**
```ts
test('productcard: nessun interattivo annidato', async ({ page }) => {
  const card = page.getByRole('article').first();
  // il link prodotto e i due button sono FRATELLI, non annidati
  await expect(card.getByRole('link', { name: /.+/ })).toBeVisible();
  await expect(card.getByRole('button', { name: /preferiti/i })).toBeVisible();
  await expect(card.getByRole('button', { name: /carrello|opzioni/i })).toBeVisible();
  // axe non deve segnalare nested-interactive
  const res = await new AxeBuilder({ page }).include('article').analyze();
  expect(res.violations.filter(v => v.id === 'nested-interactive')).toHaveLength(0);
});
```
**Verifica manuale:** click su titolo/foto → scheda prodotto; click su cuore → toggle preferito senza navigare; click su "+" → carrello (o scheda se varianti); Tab raggiunge link, cuore, "+"; focus visibile (ring sul link via `::after`).
**Rischio & rollback:** **medio-alto** (componente ubiquo + regressione varianti descritta sopra). Verificare la griglia su mobile 360px e desktop: l'overlay `::after` non deve coprire i bottoni (garantito da `z-10` sui bottoni vs `after:z-0`). Rollback: ripristina `<Link>` radice. **DA TESTARE su una griglia reale prima del merge** (`/search`, home rail).
**Dipendenze:** 🔗 **tocca la griglia** — coordina con **WS-PERF** (memo/immagini) e **WS-FRONTEND** (`ProductGrid.tsx`). Applicare A3 per ultimo, rebasato sopra le loro modifiche interne al corpo card. Peer review consigliata: @qa (regressione click griglia) + @cro (il "+" deve restare 1-tap, non introdurre attrito nel funnel).

---

## A4 — ConfirmDialog danger: focus su Annulla + Enter sicuro + aria-describedby + focus trap

**File:** `components/ConfirmDialog.tsx` (keydown 70-84; dialog 103-110; messaggio 136-140; bottoni 144-164)
**Causa-radice:** (a) `autoFocus` è sul bottone CONFERMA (riga 155) che nei danger è l'azione distruttiva rose-600; (b) Enter globale conferma sempre (riga 75) → un Invio d'istinto cancella/annulla; (c) il messaggio-conseguenza è in un `<p>` senza `id` e il dialog ha solo `aria-labelledby`, nessun `aria-describedby` → SR non legge "L'azione è irreversibile"; (d) nessun focus trap sul Tab.

### Diff

**1) Enter NON conferma per i danger + focus trap** (righe 70-84):
```diff
   // ESC chiude, Enter conferma, blocca lo scroll del body mentre aperto
   useEffect(() => {
     if (!state) return;
+    const isDangerDialog = !!state.danger;
     const onKey = (e: KeyboardEvent) => {
       if (e.key === 'Escape') { e.preventDefault(); closeWith(false); }
-      if (e.key === 'Enter')  { e.preventDefault(); closeWith(true); }
+      // Enter conferma SOLO nei dialog non distruttivi: per i danger evita la
+      // conferma accidentale di azioni irreversibili (WCAG 3.3.4).
+      if (e.key === 'Enter' && !isDangerDialog) { e.preventDefault(); closeWith(true); }
+      // Focus trap sul Tab tra i due bottoni del dialog.
+      if (e.key === 'Tab') {
+        const root = document.getElementById('confirm-dialog-panel');
+        const f = root?.querySelectorAll<HTMLElement>('button:not([disabled])');
+        if (!f || f.length === 0) return;
+        const first = f[0], last = f[f.length - 1];
+        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
+        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
+      }
     };
     document.addEventListener('keydown', onKey);
```

**2) `aria-describedby` sul dialog** (righe 104-110):
```diff
     <div
       className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn"
       onClick={(e) => { if (e.target === e.currentTarget) closeWith(false); }}
       role="dialog"
       aria-modal="true"
       aria-labelledby="confirm-title"
+      aria-describedby={state.message ? 'confirm-message' : undefined}
     >
```

**3) `id` sul panel (per il focus trap) e sul messaggio** (righe 111-114 e 136-140):
```diff
       <div
+        id="confirm-dialog-panel"
         className="bg-white w-full sm:w-auto sm:min-w-[420px] sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-slideUp sm:animate-popIn pb-[max(env(safe-area-inset-bottom),16px)] sm:pb-0"
         onClick={(e) => e.stopPropagation()}
       >
```
```diff
           {state.message && (
-            <p className="mt-2 text-sm text-ink-500 leading-relaxed max-w-[36ch] mx-auto">
+            <p id="confirm-message" className="mt-2 text-sm text-ink-500 leading-relaxed max-w-[36ch] mx-auto">
               {state.message}
             </p>
           )}
```

**4) `autoFocus`: su ANNULLA nei danger, su CONFERMA altrimenti** (righe 144-163). Sposta l'`autoFocus` condizionale:
```diff
           <button
             type="button"
             onClick={() => closeWith(false)}
+            autoFocus={isDanger}
             className="px-4 py-3 rounded-xl font-semibold text-ink-700 bg-white border-2 border-cream-300 hover:border-cream-300 hover:bg-cream-50 active:scale-[0.98] transition-all"
           >
             {state.cancelLabel ?? tActions('cancel')}
           </button>
           <button
             type="button"
             onClick={() => closeWith(true)}
-            autoFocus
+            autoFocus={!isDanger}
             className={`px-4 py-3 rounded-xl font-bold text-white shadow-md active:scale-[0.98] transition-all ${
```

**Test:**
```ts
test('confirmdialog danger: sicuro da tastiera', async ({ page }) => {
  // trigger di un'azione danger (es. annulla ordine)
  const cancelBtn = page.getByRole('button', { name: /annulla/i });
  await expect(cancelBtn).toBeFocused();              // focus su ANNULLA
  await page.keyboard.press('Enter');                 // Enter NON deve confermare il distruttivo
  await expect(page.getByRole('dialog')).toBeVisible(); // ancora aperto (Enter su Annulla lo chiude a false, ok)
  // aria-describedby collega il messaggio
  await expect(page.getByRole('dialog')).toHaveAttribute('aria-describedby', 'confirm-message');
});
```
> Precisazione test: con focus su ANNULLA, un Enter attiva il bottone Annulla (chiude a `false`) — comportamento corretto e sicuro. Il punto è che **non conferma il distruttivo**. Verificare anche il caso non-danger: Enter globale conferma (invariato).
**Verifica manuale:** apri un dialog danger → focus sul bottone bianco Annulla; SR legge titolo + "L'azione è irreversibile"; Tab rimbalza tra i 2 bottoni; Enter d'istinto NON cancella. Dialog non-danger: Enter conferma (invariato).
**Rischio & rollback:** basso. Rischio: codice a valle che si aspettava Enter=conferma anche nei danger → è precisamente il comportamento pericoloso da rimuovere (accettabile). Rollback: ripristina le 2 righe Enter/autoFocus.
**Dipendenze:** nessuna. File isolato globale. Peer review @qa: testare tutti i punti di chiamata `confirmDialog({danger:true})` (annulla ordine, elimina prodotto).

---

## A5 — Menu account Navbar: role menu/menuitem + Esc

**File:** `components/Navbar.tsx` (UserMenu 241-342; trigger 267-273; pannello 298-338)
**Causa-radice:** il trigger dichiara `aria-haspopup="menu"` ma il pannello è una `<ul>` senza `role="menu"/menuitem`; si chiude solo con click esterno e cambio pathname, non con Esc; il focus non entra all'apertura. Incoerente con `CategoriesDropdown` (che ha già Esc + role=menu).

**Fix — uniformare a `CategoriesDropdown`.** Aggiungere Esc all'`useEffect` esistente, `role="menu"` alla `<ul>`, `role="menuitem"` alle voci.

### Diff

**1) Esc nell'effetto click-outside** (righe 254-261):
```diff
   useEffect(() => {
     if (!open) return;
     const onClick = (e: MouseEvent) => {
       if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
     };
+    const onKey = (e: KeyboardEvent) => {
+      if (e.key === 'Escape') {
+        setOpen(false);
+        (ref.current?.querySelector('button[aria-haspopup]') as HTMLElement | null)?.focus();
+      }
+    };
     document.addEventListener('mousedown', onClick);
+    document.addEventListener('keydown', onKey);
-    return () => document.removeEventListener('mousedown', onClick);
+    return () => {
+      document.removeEventListener('mousedown', onClick);
+      document.removeEventListener('keydown', onKey);
+    };
   }, [open]);
```

**2) `role="menu"` sulla `<ul>`** (riga 322):
```diff
-          <ul className="py-1 text-ink-700">
+          <ul role="menu" className="py-1 text-ink-700">
```

**3) `role="menuitem"` sulle voci.** Il componente `MenuLink` va aggiornato per accettare/impostare il role (o passare `role="menuitem"` sui suoi `<Link>`); e il bottone Esci (riga 328-335):
```diff
               <button
                 type="button"
                 onClick={onSignOut}
+                role="menuitem"
                 className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-secondary-600 hover:bg-secondary-50 font-medium"
               >
```
Per `MenuLink` (definito altrove nel file) aggiungere `role="menuitem"` al suo `<Link>` interno. Le voci `<li>` wrapper restano; `role="menuitem"` va sull'elemento interattivo (`<Link>`/`<button>`), non sul `<li>`.

> **Alternativa più semplice e altrettanto valida (consigliata se si vuole minimizzare):** cambiare `aria-haspopup="menu"` → `aria-haspopup="true"` sul trigger (riga 272) e trattarlo come **disclosure** (nessun role=menu). È corretto WCAG e meno codice. Ma per coerenza con `CategoriesDropdown` si preferisce la via role=menu sopra. Scegliere UNA delle due — non lasciare `haspopup="menu"` senza `role="menu"`.

**Test:**
```ts
test('menu account: role + esc', async ({ page }) => {
  await page.getByRole('button', { name: 'Menu account' }).click();
  await expect(page.getByRole('menu')).toBeVisible();
  expect(await page.getByRole('menuitem').count()).toBeGreaterThan(0);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('menu')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Menu account' })).toBeFocused();
});
```
**Verifica manuale:** apri menu → SR annuncia "menu"; Esc chiude e riporta il focus sul trigger.
**Rischio & rollback:** molto basso. Rollback: rimuovi Esc + role. 🟢
**Dipendenze:** nessuna. Verificare che `MenuLink` sia usato solo qui (altrimenti il role potrebbe propagarsi indebitamente → renderlo opt-in via prop).

---

## A6 — Focus outline azzerato (`focus:outline-none` vince sul `:focus-visible`)

**File:** `components/products/ImportFromUrlBox.tsx:149` · `components/seller/StoreHoursEditor.tsx:58,66` · `components/seller/QuickAiTools.tsx:164`
**Causa-radice:** `globals.css` (righe 155-158) ha `:focus-visible { outline: 2px solid #C0492C }` (specificità 0,1,0). La utility `focus:outline-none` genera `.focus\:outline-none:focus { outline: 2px solid transparent }` (0,2,0) che **vince** quando l'elemento è a fuoco da tastiera → indicatore azzerato, senza anello compensativo. Colpisce l'area venditore (input URL import, orari, select lingua).

**Fix — aggiungere un anello `:focus-visible` esplicito su ciascun campo** (più sicuro che rimuovere `focus:outline-none`, perché non tocca lo styling del bordo esistente):

```diff
# ImportFromUrlBox.tsx:149 (input URL)
-  className="… focus:outline-none …"
+  className="… focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 …"

# StoreHoursEditor.tsx:58 e :66 (input orari)
-  className="… focus:outline-none …"
+  className="… focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 …"

# QuickAiTools.tsx:164 (select lingua)
-  className="… focus:outline-none …"
+  className="… focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 …"
```
> In alternativa, `focus-within:ring-2 focus-within:ring-primary-400` sul **contenitore** che avvolge input+icona (righe padre 142/52) — utile se l'input ha un'icona interna e si vuole l'anello attorno al gruppo. Scegliere per campo secondo il markup. Verificare che `ring` sia visibile (i padri con `overflow-hidden` taglierebbero il ring → usare `ring` con `ring-offset` o togliere l'overflow).

**Test:**
```ts
test('focus visibile sui campi venditore', async ({ page }) => {
  await page.goto('/seller/products/new'); // o dove vive ImportFromUrlBox
  const input = page.getByRole('textbox', { name: /url|link/i });
  await input.focus();
  // outline non trasparente OPPURE box-shadow (ring) presente
  const ring = await input.evaluate((el) => getComputedStyle(el).boxShadow);
  expect(ring).not.toBe('none');
});
```
**Verifica manuale:** Tab sui 4 campi → anello arancione/primary visibile. Controllare che il ring non sia clippato dai padri `overflow-hidden`.
**Rischio & rollback:** minimo (solo classi CSS additive). Rollback: rimuovi le classi `focus-visible:ring-*`. 🟢
**Dipendenze:** nessuna — 3 file dell'area venditore, non collidono con altri WS.

---

## A7 — Selettore stelle recensione: radiogroup + stato esposto

**File:** `app/orders/[id]/review/page.tsx` (StarRating 17-31)
**Causa-radice:** 5 `<button>` con `aria-label` ma nessun `role="radiogroup"` con etichetta e nessuno stato di selezione: la stella scelta è distinta solo dal colore (WCAG 1.4.1 — uso del solo colore). Manca `aria-checked`.

**Fix — avvolgere in `role="radiogroup"` etichettato e dare a ogni bottone `role="radio" aria-checked`.** Aggiungere una prop `label` per distinguere i due usi (negozio/rider).

### Diff (righe 17-31)
```diff
-const StarRating = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
-  <div className="flex gap-1">
-    {[1, 2, 3, 4, 5].map((n) => (
-      <button
-        key={n}
-        type="button"
-        onClick={() => onChange(n)}
-        className="text-4xl transition-transform hover:scale-110"
-        aria-label={`${n} ${n === 1 ? 'stella' : 'stelle'}`}
-      >
-        <span className={n <= value ? 'text-accent-700' : 'text-ink-300'}>★</span>
-      </button>
-    ))}
-  </div>
-);
+const StarRating = ({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) => (
+  <div role="radiogroup" aria-label={label} className="flex gap-1">
+    {[1, 2, 3, 4, 5].map((n) => (
+      <button
+        key={n}
+        type="button"
+        role="radio"
+        aria-checked={n === value}
+        onClick={() => onChange(n)}
+        onKeyDown={(e) => {
+          if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); onChange(Math.min(5, value + 1)); }
+          if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); onChange(Math.max(1, value - 1)); }
+        }}
+        tabIndex={n === value ? 0 : -1}
+        className="text-4xl transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded"
+        aria-label={`${n} ${n === 1 ? 'stella' : 'stelle'}`}
+      >
+        <span className={n <= value ? 'text-accent-700' : 'text-ink-300'} aria-hidden>★</span>
+      </button>
+    ))}
+  </div>
+);
```
Aggiornare i due call-site (aggiungere `label`):
```diff
-  <StarRating value={storeRating} onChange={setStoreRating} />
+  <StarRating value={storeRating} onChange={setStoreRating} label="Valutazione negozio" />
...
-  <StarRating value={riderRating} onChange={setRiderRating} />
+  <StarRating value={riderRating} onChange={setRiderRating} label="Valutazione rider" />
```
> Il roving `tabIndex` (solo la stella selezionata è tabbabile, le altre con frecce) è il pattern radiogroup corretto: il gruppo prende un solo stop di Tab. `aria-hidden` sul `★` evita che SR legga il glifo grezzo, lasciando solo l'`aria-label` del bottone.

**Test:**
```ts
test('star rating radiogroup', async ({ page }) => {
  const group = page.getByRole('radiogroup', { name: 'Valutazione negozio' });
  await expect(group).toBeVisible();
  const radios = group.getByRole('radio');
  await expect(radios.nth(4)).toHaveAttribute('aria-checked', 'true'); // default 5
  await radios.nth(2).click();
  await expect(radios.nth(2)).toHaveAttribute('aria-checked', 'true');
});
```
**Verifica manuale:** Tab entra nel gruppo (1 stop); frecce cambiano voto; SR annuncia "3 stelle, radio, selezionato". Il voto non dipende più dal solo colore.
**Rischio & rollback:** basso. La prop `label` è obbligatoria → aggiornare entrambi i call-site (altrimenti errore TS, il che è desiderabile). Rollback: ripristina il componente originale + rimuovi `label` dai call-site.
**Dipendenze:** nessuna — file isolato (pagina recensione). Nota: esiste `components/ui/RatingStars.tsx` (display read-only) — NON è questo (questo è il selettore interattivo). Non confonderli.

---

## Piano di applicazione (branch `fix/a11y-bonifica`)

1. **Prima gli isolati 🟢** (nessuna collisione): A5 (Navbar), A6 (3 file venditore), A7 (review), A4 (ConfirmDialog).
2. **Poi i grave isolati 🟡**: A1 (product page), A2 (SearchBar).
3. **Per ultimo A3 (ProductCard)** — rebase sopra WS-PERF/WS-FRONTEND, con test di regressione griglia su mobile 360px + desktop.
4. `npm run lint && npm run typecheck && npm test` verdi → PR piccola con screenshot prima/dopo (mobile+desktop) + report axe. **Nessun merge/deploy senza firma Nicola (🔴).**

**Peer review consigliata:** @qa (regressione click griglia A3 + tutti i call-site danger A4) · @cro (il "+" della card deve restare 1-tap, A3 non deve aggiungere attrito al funnel).
