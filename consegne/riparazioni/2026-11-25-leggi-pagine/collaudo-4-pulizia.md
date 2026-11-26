---
data: 2026-11-26 12:52
oggetto: collaudo 4 di togliBlocchi / htmlInTesto (n8n, ramo ccr-d58987f6-fnlly3, testa bbd4cc6)
verdetto: REGGE
---

# Collaudo 4: la pulizia di commenti e script in un passaggio solo

## In parole semplici
Il pezzo che toglie commenti e codice dalle pagine dei negozi non perde più l'indirizzo, il telefono e gli orari nel caso che il collaudo 3 aveva bocciato.
Ho cercato un caso reale in cui la versione nuova perda testo che la vecchia teneva. Non l'ho trovato, né a mano né con 1.500 pagine casuali.

## Cosa cambia per te
Le pagine vecchie fatte con Dreamweaver, i commenti condizionali di WordPress e gli script con «<!--» adesso si leggono intere.
Prima uscivano vuote: è la stessa cosa detta al contrario.

## Cosa devi fare
Niente. Il ramo può andare avanti verso la firma.

## Cosa non ho verificato
- Pagine vere scaricate da internet: ho usato pagine scritte da me, confrontate con Chromium (Playwright).
- Il flusso esportato vero del 12 (FLUSSO_12): non c'era, i 2 test che lo usano restano saltati.
- Altri browser oltre Chromium.

---
**Dettagli tecnici**

VERDETTO: **REGGE**

## Prove eseguite (copia in /tmp/claude-0/ricollaudo4, nessun push)
1. `node --test flussi/test/*.test.mjs`: 273 verdi, 0 rossi, 2 saltati, come atteso.
2. Varianti scomode, 27 casi, confronto browser / eae5946 / bbd4cc6 (banco in /tmp/claude-0/banco/confronta.cjs):
   - `<style><!-- … </style>` + commento vero più in basso: vecchio = vuoto, nuovo = come il browser.
   - più script con `<!--` e `//-->` misti: vecchio perdeva «Due», nuovo = browser.
   - `</SCRIPT>` maiuscolo e `</script >` con spazio: vecchio = vuoto, nuovo = browser.
   - commenti condizionali IE (anche `<!--[if !IE]><!-->…<!--<![endif]-->`): uguali al browser in tutti e due.
   - `<svg>` con commento Illustrator dentro: ok. `<svg><!-- rotto` senza chiusura: vecchio vuoto, nuovo tiene il testo.
   - `<scriptx>`, `<svg-icon>`: non trattati come codice, ok.
   - script dentro commento (chiuso e no): ok.
   - `<noscript>` con testo: tolto, come Chromium con JavaScript acceso.
   - pagina Dreamweaver tipica (MM_swapImgRestore senza `//-->`) e WordPress (`<!--[if lt IE 9]>` + `var x="<!--"`): vecchio = vuoto, nuovo = browser.
3. Regressioni: fuzz differenziale di 1.500 pagine casuali da 21 pezzi (aperture e chiusure di tutti i tipi, maiuscole, IE, quasi-tag). Parole visibili nel browser perse dal nuovo ma tenute dal vecchio: **0**.
4. Tempi: `togliBlocchi` esposta e misurata direttamente su 1, 2, 3 MB (aperture alternate di 8 tipi, blocchi chiusi alternati, quasi-tag, `<!--` senza chiusura, misto con maiuscole): massimo 69 ms a 3 MB, crescita lineare. `htmlInTesto` (taglia a 1 MB): massimo 202 ms (pagina di soli «<», fuori da togliBlocchi).
5. Mutazione: rimesso il file di eae5946, il test «collaudo 3» diventa rosso (272/1). Ripristinato: 273/0.

## Difetti gravi
Nessuno.

## Minori (non bocciano, nessuno è una regressione che perde testo)
1. **Script con document.write di uno script, dentro `<!-- //-->`** (schema vecchio ma reale):
   `<script><!--\ndocument.write("<script src='x.js'></script>");\n//--></script><p>Via A</p>`
   browser `Via A` · vecchio `Via A` · nuovo `"); //--> Via A`. Spazzatura in più, nessun testo perso. Il browser qui entra nello stato «double escaped»; il nuovo chiude lo script al primo `</script`. È l'unico caso in cui il nuovo è peggio del vecchio.
2. **`<!-->` e `<!--->`** (commento vuoto «brusco»): il browser lo chiude subito, il codice cerca il `-->` successivo e mangia il testo in mezzo (`<p>Via A</p><!--><p>Tel B</p><!-- c -->` perde «Tel B»). Uguale in eae5946: non è una regressione. Raro.
3. **`<svg>` senza `</svg>`** seguito da HTML normale: il browser esce dall'svg al primo `<p>`/`<div>`, il codice taglia fino in fondo. 45 parole perse su 1.500 pagine casuali, tutte in questo schema e tutte perse anche da eae5946.
4. **`</scriptx>` conta come chiusura di `<script>`** (il browser vuole spazio, `/` o `>` dopo il nome): mostra `var b=2;` in più. Uguale nel vecchio.
5. **Fallback di `<object>`** (`<object data="f.swf"><p>Installa Flash…</p></object>`): il browser lo mostra, il codice lo toglie. Uguale nel vecchio.
6. **`<!--` dentro un attributo** (`<div data-x="<!--">Via A</div><!-- c -->`): «Via A» persa, in tutti e due.
7. Commento senza chiusura: il browser nasconde tutto fino in fondo, il codice tiene il testo. Scelta voluta e più prudente.
