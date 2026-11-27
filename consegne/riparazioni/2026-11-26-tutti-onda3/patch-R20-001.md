---
data: 2026-11-26 23:00
tipo: patch rimasta fuori dal ramo (prove comuni, firma di Nicola)
voce: R20-001 parte 2
---

# Patch di R20-001, parte 2: l'assistente vede tag e descrizione al primo messaggio

## In parole semplici
Oggi, al primo messaggio della chat Assistenza, l'assistente non vede tag e descrizione dei prodotti: risponde alla cieca e chiede di ripetere a scheda aperta.
Questa patch glieli fa vedere, entro un tetto. Per esempio: «aggiungi senza canditi al panettone» diventa subito una proposta da approvare.
Cambia tre prove comuni, quindi non è sul ramo: aspetta la firma di Nicola.

## Cosa non ho verificato
L'ho ricevuta da R20 in chat: dice `git apply --check` ok sopra a0f12545 e 65 prove verdi. Da qui non l'ho rilanciata.

## Dettagli tecnici
R20 · patch di R20-001 parte 2 (NON sul ramo). Cosa cura: al primo messaggio della chat Assistenza (nessun prodotto aperto) l'assistente riceve tag e descrizione attuali di ogni prodotto del catalogo del venditore (già filtrato per seller_id), entro MAX_CONTENT=2000 per descrizione e 40000 in tutto; la proposta su tag/descrizione passa solo per un prodotto letto per intero, le caratteristiche si tolgono sempre, l'avviso nomina i campi tolti. Ribalta 3 prove comuni (r03-catalog-chat, al-primo-messaggio, r04-chat-non-inventa): serve la firma di Nicola. Si applica con `git apply` sopra a0f1254545ab8fc817d3ae6791a8b03c4483e6b2 (controllato ora: --check ok). Con la patch 13 file / 65 prove verdi, eslint e tsc puliti (dal rapporto del subagente). Costo: fino a circa 10.000 token in più per chiamata di identificazione. Stat: route.ts +58/-? · al-primo-messaggio +30 · r03-catalog-chat 17 · r04-chat-non-inventa 8 · r20-chat-testo-intero +41 (132 righe in più, 22 in meno).

```diff
diff --git a/app/api/ai/catalog-chat/route.ts b/app/api/ai/catalog-chat/route.ts
index 0c1e59f..ad069f0 100644
--- a/app/api/ai/catalog-chat/route.ts
+++ b/app/api/ai/catalog-chat/route.ts
@@ -59,7 +59,7 @@ export const runtime = 'nodejs';
 const SYSTEM = `Sei l'assistente di "MyCity Piacenza" dentro la chat di Assistenza. Aiuti un venditore a trovare e correggere velocemente i SUOI prodotti, senza che debba cercarli a mano. Conversi in italiano, in modo caldo, concreto e onesto.
 
 Hai a disposizione:
-- l'elenco dei prodotti del venditore (catalogo) con id, nome, prezzo, stato e categoria, e — quando presenti — le loro miniature;
+- l'elenco dei prodotti del venditore (catalogo) con id, nome, prezzo, stato e categoria, i tag e la descrizione attuali (finché ci stanno: se di un prodotto non ci sono, aprilo prima di cambiarli) e — quando presenti — le loro miniature;
 - le foto che il venditore manda per indicare di QUALE prodotto parla: confrontale con le miniature del catalogo per capire qual è;
 - in modalità focus, lo stato completo del prodotto scelto (JSON), gli slug delle categorie e gli attributi validi;
 - lo strumento "web_search" per cercare online (specifiche, prezzo di mercato, identificare il prodotto reale): usalo con parsimonia, solo se serve davvero.
@@ -170,13 +170,27 @@ const MAX_CATALOG = 100; // prodotti elencati come testo
 const MAX_CATALOG_IMAGES = 10; // miniature inviate per il match visivo
 const MAX_HISTORY = 20;
 const MAX_CONTENT = 2000;
+/**
+ * In identificazione, tag e descrizione attuali di tutto il catalogo insieme:
+ * non oltre il testo di conversazione che la rotta gia' accetta (20 x 2000).
+ * Ogni descrizione col tetto di un messaggio (MAX_CONTENT).
+ */
+const MAX_DETTAGLI_CATALOGO = MAX_HISTORY * MAX_CONTENT;
 
-/** I campi che il modello, in identificazione, non ha visto: non si propongono. */
+/** I campi che il modello, in identificazione, puo' non aver visto: non si propongono. */
 const CAMPI_NON_VISTI_IN_IDENTIFICAZIONE = ['description', 'tags', 'attributes', 'attributes_remove'] as const;
+/** Le caratteristiche in identificazione non arrivano mai al modello. */
+const CARATTERISTICHE = ['attributes', 'attributes_remove'] as const;
+const NOME_DEL_CAMPO: Record<(typeof CAMPI_NON_VISTI_IN_IDENTIFICAZIONE)[number], string> = {
+  description: 'la descrizione',
+  tags: 'i tag',
+  attributes: 'le caratteristiche',
+  attributes_remove: 'le caratteristiche',
+};
 
-function senzaCampiNonVisti<T extends object>(proposta: T): T {
+function senzaCampi<T extends object>(proposta: T, campi: readonly string[]): T {
   const copia = { ...proposta } as Record<string, unknown>;
-  for (const k of CAMPI_NON_VISTI_IN_IDENTIFICAZIONE) delete copia[k];
+  for (const k of campi) delete copia[k];
   return copia as T;
 }
 
@@ -368,6 +382,8 @@ export const POST = withSellerAuth(async ({ user, req }): Promise<NextResponse>
     : null;
 
   let contextContent: Anthropic.ContentBlockParam[];
+  /** In identificazione: i prodotti di cui il modello ha letto per intero tag e descrizione attuali. */
+  const vistiPerIntero = new Set<string>();
 
   if (focused) {
     const snap = snapshot(focused, categories);
@@ -438,10 +454,30 @@ ${attrLines || '- (nessuno)'}`;
       const fotoAmmessa = sanitizeImageUrls([p.images![0]], 1)[0];
       if (fotoAmmessa) blocks.push({ type: 'image', source: { type: 'url', url: fotoAmmessa } });
     }
+    /**
+     * 26/11/2026 — AL PRIMO MESSAGGIO IL MODELLO NON VEDEVA TAG E DESCRIZIONE.
+     *
+     * Del catalogo arrivavano id, nome, prezzo, stato e categoria: a «aggiungi
+     * il tag senza canditi al panettone» il modello rispondeva alla cieca, e la
+     * rotta poteva solo togliere la proposta e chiedere di ripetere a scheda
+     * aperta. Adesso ogni riga porta tag e descrizione attuali (del solo
+     * catalogo del venditore, gia' filtrato per seller_id), finche' stanno nel
+     * tetto. Di un prodotto rimasto fuori, o con la descrizione tagliata, la
+     * proposta su quei campi continua a non uscire.
+     */
+    let spazio = MAX_DETTAGLI_CATALOGO;
     const list = products
       .map((p) => {
         const snap = snapshot(p, categories);
-        return `- id=${snap.id} · ${snap.name} · ${snap.price != null ? `€${snap.price}` : 's.p.'} · ${snap.status} · ${snap.categoryName ?? '—'}`;
+        const riga = `- id=${snap.id} · ${snap.name} · ${snap.price != null ? `€${snap.price}` : 's.p.'} · ${snap.status} · ${snap.categoryName ?? '—'}`;
+        const descrizione = snap.description.trim();
+        const tag = snap.tags.filter((t): t is string => typeof t === 'string' && t.trim() !== '');
+        const intera = descrizione.length <= MAX_CONTENT;
+        const dettagli = `\n  tag attuali: ${JSON.stringify(tag)}\n  descrizione attuale${intera ? '' : ' (TAGLIATA: non riscriverla da qui)'}: ${JSON.stringify(descrizione.slice(0, MAX_CONTENT))}`;
+        if (dettagli.length > spazio) return `${riga}\n  (tag e descrizione non mostrati: per cambiarli va aperto il prodotto)`;
+        spazio -= dettagli.length;
+        if (intera) vistiPerIntero.add(snap.id);
+        return `${riga}${dettagli}`;
       })
       .join('\n');
     blocks.push({
@@ -503,14 +539,22 @@ Identifica di quale prodotto parla il venditore e imposta "product_id". Se non s
     // cieca, quindi qui non esce: si propone dal giro dopo, a scheda aperta.
     // S10 (5/11/2026) — Con una scheda aperta il modello ha letto SOLO quella:
     // se indica un altro prodotto, di quello vale la stessa regola.
-    const patch = focused && matched?.id === focused.id ? proposta : senzaCampiNonVisti(proposta);
+    // 26/11/2026 — In identificazione tag e descrizione letti per intero si
+    // possono proporre; le caratteristiche no, non arrivano al modello.
+    const patch =
+      focused && matched?.id === focused.id
+        ? proposta
+        : !focused && matched && vistiPerIntero.has(matched.id)
+          ? senzaCampi(proposta, CARATTERISTICHE)
+          : senzaCampi(proposta, CAMPI_NON_VISTI_IN_IDENTIFICAZIONE);
     // 12/11/2026 (R04-001, revisione) — Se qui sono stati tolti dei campi, la
     // risposta del modello li promette ancora («ho aggiunto il tag…»): il
     // negoziante applicava solo il prezzo credendo di aver salvato tutto. Lo si
     // dice, e si chiede di riprovare col prodotto aperto.
     const tolti = CAMPI_NON_VISTI_IN_IDENTIFICAZIONE.filter((k) => k in proposta && !(k in patch));
+    const nomiTolti = [...new Set(tolti.map((k) => NOME_DEL_CAMPO[k]))];
     const avvisoTolti = tolti.length
-      ? ` Attenzione: descrizione, tag e caratteristiche non li ho ancora letti, quindi NON li cambio da qui. Apri il prodotto (si apre da solo con la prossima risposta) e ripeti la richiesta: li vedrai prima di applicare.`
+      ? ` Attenzione: ${nomiTolti.join(' e ')} non li ho ancora letti per intero, quindi NON li cambio da qui. Apri il prodotto (si apre da solo con la prossima risposta) e ripeti la richiesta: li vedrai prima di applicare.`
       : '';
     const daLeggere = matched ? daLeggerePrimaDiApplicare(patch, matched) : '';
 
diff --git a/tests/unit/al-primo-messaggio-la-chat-non-propone-quello-che-non-ha-letto.test.ts b/tests/unit/al-primo-messaggio-la-chat-non-propone-quello-che-non-ha-letto.test.ts
index 20ca3a6..d0d95c7 100644
--- a/tests/unit/al-primo-messaggio-la-chat-non-propone-quello-che-non-ha-letto.test.ts
+++ b/tests/unit/al-primo-messaggio-la-chat-non-propone-quello-che-non-ha-letto.test.ts
@@ -7,6 +7,9 @@ import { describe, it, expect, beforeEach, vi } from 'vitest';
  * arrivano solo id, nome, prezzo, stato e categoria di ogni prodotto. La rotta
  * pero' accettava nello stesso giro anche la proposta di modifica, e un «metti
  * il tag novita'» diventava una lista di tag nuova che cancellava le vecchie.
+ * 26/11/2026: adesso al modello arrivano anche tag e descrizione attuali (finche'
+ * stanno nel tetto): quelli letti per intero si propongono, le caratteristiche
+ * e una descrizione arrivata tagliata no.
  * Qui gira la rotta vera, con un modello finto: nessuna chiamata AI vera.
  */
 
@@ -60,25 +63,40 @@ async function chiedi(corpo: Record<string, unknown>, patch: unknown) {
   return (await res.json()) as { productId: string | null; patch: Record<string, unknown> };
 }
 
-describe('in identificazione la chat non propone tag, descrizione o caratteristiche', () => {
+describe('in identificazione la chat non propone quello che non ha letto', () => {
   beforeEach(() => {
     vi.clearAllMocks();
     __resetRateLimitBuckets();
     vi.stubEnv('ANTHROPIC_API_KEY', 'sk-ant-test');
   });
 
-  it('primo messaggio, proposta su descrizione e tag: nessuna proposta restituita su quei campi', async () => {
+  it('primo messaggio: descrizione e tag letti passano, le caratteristiche (mai mandate) no', async () => {
     const json = await chiedi({}, {
-      description: 'Una focaccia tutta nuova scritta alla cieca',
-      tags: ['novita'],
+      description: 'Focaccia genovese alta e morbida',
+      tags: ['forno', 'genovese', 'novita'],
       attributes: { colore: 'bianca' },
     });
+    const contesto = JSON.stringify((runMessageMock.mock.calls[0][0] as { messages: unknown }).messages);
+    expect(contesto).toContain('Focaccia genovese');
+    expect(contesto).toContain('forno');
     expect(json.productId).toBe(FOCACCIA.id);
-    expect(json.patch).not.toHaveProperty('description');
-    expect(json.patch).not.toHaveProperty('tags');
+    expect(json.patch).toHaveProperty('description');
+    expect(json.patch).toHaveProperty('tags');
     expect(json.patch).not.toHaveProperty('attributes');
   });
 
+  it('primo messaggio, descrizione piu lunga di quella che il modello vede: descrizione e tag non passano', async () => {
+    const prima = FOCACCIA.description;
+    FOCACCIA.description = 'Focaccia genovese. '.repeat(120);
+    try {
+      const json = await chiedi({}, { description: 'Riscritta sull inizio', tags: ['novita'] });
+      expect(json.patch).not.toHaveProperty('description');
+      expect(json.patch).not.toHaveProperty('tags');
+    } finally {
+      FOCACCIA.description = prima;
+    }
+  });
+
   it('a scheda aperta la stessa proposta passa: il modello quei campi li ha letti', async () => {
     const json = await chiedi({ focusProductId: FOCACCIA.id }, {
       description: 'Una focaccia genovese alta e morbida',
diff --git a/tests/unit/riparazione-r03-catalog-chat.test.ts b/tests/unit/riparazione-r03-catalog-chat.test.ts
index 3d0eebe..870f346 100644
--- a/tests/unit/riparazione-r03-catalog-chat.test.ts
+++ b/tests/unit/riparazione-r03-catalog-chat.test.ts
@@ -7,8 +7,8 @@ import { describe, it, expect, beforeEach, vi } from 'vitest';
  * Il forno ha il Panettone con quattro tag e una descrizione scritta a mano.
  * Chiede «aggiungi il tag senza canditi e scrivilo nella descrizione»: il
  * modello propone tags=['senza canditi'] e una riga di descrizione nuova.
- *  - al primo messaggio (nessun prodotto aperto) il modello tag e descrizione
- *    non li ha visti: la proposta su quei campi non esce;
+ *  - anche al primo messaggio (nessun prodotto aperto) tag e descrizione
+ *    attuali arrivano al modello, e la proposta esce col testo da leggere;
  *  - a scheda aperta la proposta esce, e la risposta mostrata sopra la scheda
  *    porta il testo nuovo da leggere e i tag che spariscono;
  *  - il prompt ha la regola: niente ingredienti, allergeni, origine o «senza…»
@@ -86,14 +86,15 @@ describe('chat Assistenza: tag e descrizione si cambiano solo dopo averli visti,
     vi.stubEnv('ANTHROPIC_API_KEY', 'sk-ant-test');
   });
 
-  it('primo messaggio (identificazione): la proposta su tag e descrizione non esce, il modello non li ha visti', async () => {
+  it('primo messaggio (identificazione): tag e descrizione attuali arrivano al modello, e la proposta esce col testo da leggere', async () => {
     const json = await chiedi({}, { tags: ['senza canditi'], description: DESCRIZIONE_NUOVA });
-    expect(testoAlModello()).not.toContain('lievito-madre');
-    expect(testoAlModello()).not.toContain('Marsala');
+    expect(testoAlModello()).toContain('lievito-madre');
+    expect(testoAlModello()).toContain('Marsala');
     expect(json.productId).toBe(PANETTONE.id);
-    expect(json.patch).not.toHaveProperty('tags');
-    expect(json.patch).not.toHaveProperty('description');
-    expect(json.reply).toMatch(/NON li cambio/);
+    expect(json.patch).toHaveProperty('description', DESCRIZIONE_NUOVA);
+    expect(json.patch).toHaveProperty('tags');
+    expect(json.reply).toContain(DESCRIZIONE_NUOVA);
+    expect(json.reply).toMatch(/spariscono/);
   });
 
   it('a scheda aperta: la risposta porta il testo nuovo della descrizione e i tag che spariscono', async () => {
diff --git a/tests/unit/riparazione-r04-chat-non-inventa.test.ts b/tests/unit/riparazione-r04-chat-non-inventa.test.ts
index 1650ba1..3a6e380 100644
--- a/tests/unit/riparazione-r04-chat-non-inventa.test.ts
+++ b/tests/unit/riparazione-r04-chat-non-inventa.test.ts
@@ -1,4 +1,4 @@
-import { describe, it, expect, beforeEach, vi } from 'vitest';
+import { describe, it, expect, beforeEach, onTestFinished, vi } from 'vitest';
 
 /**
  * R04-001 (parte nel mio territorio) — Il prompt della chat Assistenza deve
@@ -66,6 +66,12 @@ describe('la chat Assistenza: nel prompt c\'e\' la regola «non inventare»', ()
   });
 
   it('in identificazione, se i campi della proposta vengono tolti, la risposta lo dice', async () => {
+    // Una descrizione oltre il tetto arriva al modello tagliata: tag e descrizione non si cambiano da qui.
+    const prima = PANETTONE.description;
+    PANETTONE.description = 'Lievitazione 36 ore. '.repeat(120);
+    onTestFinished(() => {
+      PANETTONE.description = prima;
+    });
     runMessageMock.mockResolvedValue({
       text: '',
       toolInput: { reply: 'Ho aggiunto il tag e aggiornato la descrizione: premi Applica.', product_id: PANETTONE.id, patch: { price: 27, tags: ['senza canditi'], description: 'Panettone senza canditi.' } },
diff --git a/tests/unit/riparazione-r20-chat-testo-intero.test.ts b/tests/unit/riparazione-r20-chat-testo-intero.test.ts
index 23cf57f..38d805c 100644
--- a/tests/unit/riparazione-r20-chat-testo-intero.test.ts
+++ b/tests/unit/riparazione-r20-chat-testo-intero.test.ts
@@ -109,6 +109,47 @@ describe('chat Assistenza: la proposta da approvare porta il testo che entra dav
     expect(j.patch).toHaveProperty('price', 30);
   });
 
+  it('primo messaggio (nessun prodotto aperto): tag e descrizione attuali arrivano al modello e la proposta esce intera', async () => {
+    const nuova = 'Lievito madre, uvetta nel Marsala. Senza canditi.';
+    runMessageMock.mockResolvedValue({
+      text: '',
+      toolInput: { reply: 'Ecco.', product_id: prodotto.id, patch: { tags: ['dolci', 'natale', 'senza canditi'], description: nuova } },
+    });
+    const res = await POST(
+      new Request('http://localhost/api/ai/catalog-chat', {
+        method: 'POST',
+        headers: { 'content-type': 'application/json' },
+        body: JSON.stringify({ history: [{ role: 'user', content: 'aggiungi senza canditi al panettone, anche nella descrizione' }] }),
+      }) as never,
+    );
+    const j = (await res.json()) as Risposta;
+    const contesto = JSON.stringify((runMessageMock.mock.calls[0][0] as { messages: unknown }).messages);
+    expect(contesto).toContain('uvetta nel Marsala');
+    for (const t of ['dolci', 'natale']) expect(contesto).toContain(t);
+    expect(j.patch.description).toBe(nuova);
+    expect(j.patch.tags).toEqual(['dolci', 'natale', 'senza canditi']);
+    expect(j.reply).toContain(nuova);
+  });
+
+  it('primo messaggio, descrizione oltre il tetto: arriva tagliata e la proposta su tag e descrizione non esce', async () => {
+    prodotto = { ...BASE, description: 'Impasto a lunga lievitazione. '.repeat(100) };
+    runMessageMock.mockResolvedValue({
+      text: '',
+      toolInput: { reply: 'Ecco.', product_id: prodotto.id, patch: { tags: ['nuovo'], description: 'Riscritta sull inizio.' } },
+    });
+    const res = await POST(
+      new Request('http://localhost/api/ai/catalog-chat', {
+        method: 'POST',
+        headers: { 'content-type': 'application/json' },
+        body: JSON.stringify({ history: [{ role: 'user', content: 'riscrivi la descrizione del panettone' }] }),
+      }) as never,
+    );
+    const j = (await res.json()) as Risposta;
+    expect(j.patch).not.toHaveProperty('description');
+    expect(j.patch).not.toHaveProperty('tags');
+    expect(j.reply).toMatch(/NON li cambio da qui/);
+  });
+
   it('un tag NULL nella scheda attuale non lascia un buco nella frase dei tag che spariscono', async () => {
     prodotto = { ...BASE, tags: [null, 'dolci'] };
     const j = await chiedi({ tags: ['natale'] });
```
