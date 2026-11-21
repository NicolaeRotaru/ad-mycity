# Scheda S01: la scorta in «Modifica prodotto» e «Duplica»

## In parole semplici
Questa scheda diceva alla sessione S01 cosa riparare nella scorta dei prodotti con le taglie.
Per esempio: il negoziante apre «Modifica» senza rete, le taglie non arrivano, e il Salva scriveva la scorta su una somma vecchia.

## Cosa cambia per te
Niente adesso: il giro 3 è chiuso. La scheda resta come traccia del lavoro chiesto a S01.

## Cosa devi fare
Niente.

## Cosa non ho verificato
Questa è la scheda scritta prima del lavoro. L'esito di S01 sta nei referti e nei collaudi del giro 3, non qui.

---

Questa scheda dice alla sessione S01 cosa riparare e con quale regola. È la sessione dedicata dell'onda 9, giro 3, decisa da Nicola il 20/11.

Decisione di Nicola, 20/11 19:31: «Scorte sessione dedicata». Una voce sola, terzo giro: due giri sono falliti.

- **Voci:** sono due.
  - `S01-001`: `stati-ui|quando la rete torna, le pagine prodotto del negoziante rimettono il caricamento al posto del modulo e le modifiche non salvate si perdono`. Era R03-019 dell'onda 9 e R04-007 del giro 2.
  - `S01-002`: `api-backend|«duplica» di un prodotto escluso dal recesso: finché non si sa se la colonna c'è, la copia si salva recedibile senza avviso`. L'ho tolta a R04 del giro 3, perché vive in `new/page.tsx`.
- **Base:** `main` del sito `b2c62f34`. **Ramo:** `claude/adoring-bohr-kixq35-o9g3-s01`.
- **File tuoi:** `app/seller/products/[id]/edit/page.tsx`, `app/seller/products/new/page.tsx`, `components/seller/ProductForm.tsx` (solo per l'avviso del Salva) e le loro prove in `tests/`.

## Il buco, trovato dal collaudo K02 del giro 2
**In «Modifica».** È la prova E2. Il negoziante ha una copia vecchia in memoria con 0 taglie. Apre la pagina senza rete. Quando la rete torna, la rilettura delle taglie cade. Il modulo resta aperto con 0 taglie e nessun avviso.
Il codice: `edit/page.tsx` verso la riga 287 mette l'errore sotto «resta aperto». Verso le righe 320-323 non rimonta, perché le taglie lette non cambiano.
L'effetto: il Salva scrive `products.stock` sulla vecchia somma (`ProductForm.tsx`, righe 830 e 856-873 circa). La scorta si stacca dalla somma delle taglie.

**In «Duplica».** È la prova D2. Succede lo stesso. In `new/page.tsx`, verso la riga 286, il modulo aperto scavalca «taglie non arrivate». La copia nasce senza taglie e con la scorta della vecchia somma.

**Da tenere verdi.** Primo: passando da «Nuovo» a «Duplica» senza rimontare la pagina, la copia non si apre vuota (D4b, K2). Secondo: se le taglie cambiano senza rete, il testo non salvato resta (E4, D3).

**La prova vecchia non bastava.** Restava verde anche togliendo la protezione sugli errori. La tua deve cadere.

**Attenzione:** su `b2c62f34` le due riparazioni vecchie sono annullate. Quindi anche la prima metà va rifatta: il caricamento non deve prendere il posto del modulo.

## La regola da applicare
**Se le taglie non arrivano, il Salva si blocca con un avviso.** Il testo scritto resta nel modulo. Niente scrittura della scorta su una somma che non è stata letta.

## Prima di tutto
Scrivi E2 e D2 come prove automatiche, con vitest e Testing Library. Il modello è `tests/unit/riparazione-r04-modulo-resta-quando-torna-la-rete.test.tsx`. Falle diventare rosse su `b2c62f34`. Solo dopo ripari. Un commit per voce, con l'id `S01-001` o `S01-002`. `prova-rimessa` sui tre file.
