# Scheda S01: la scorta in «Modifica prodotto» e «Duplica»

Questa scheda dice alla sessione S01 cosa riparare e con quale regola. È la sessione dedicata dell'onda 9, giro 3, decisa da Nicola il 20/11.

Decisione di Nicola, 20/11 19:31: «Scorte sessione dedicata». Una voce sola, terzo giro: due giri sono falliti.

- **Voci:** sono due.
  - `S01-001`: `stati-ui|quando la rete torna, le pagine prodotto del negoziante rimettono il caricamento al posto del modulo e le modifiche non salvate si perdono`. Era R03-019 dell'onda 9 e R04-007 del giro 2.
  - `S01-002`: `api-backend|«duplica» di un prodotto escluso dal recesso: finché non si sa se la colonna c'è, la copia si salva recedibile senza avviso`. L'ho tolta a R04 del giro 3, perché vive in `new/page.tsx`.
- **Base:** `main` del sito `b2c62f34`. **Ramo:** `claude/adoring-bohr-kixq35-o9g3-s01`.
- **File tuoi:** `app/seller/products/[id]/edit/page.tsx`, `app/seller/products/new/page.tsx`, `components/seller/ProductForm.tsx` (solo per l'avviso del Salva) e le loro prove in `tests/`.

## Il buco (dal collaudo K02 del giro 2)
- In «Modifica», con una copia vecchia in memoria a 0 taglie e la pagina aperta senza rete, la rilettura delle taglie che cade al ritorno della rete lascia il modulo aperto con 0 taglie e senza avviso (`edit/page.tsx` ~287 mette l'errore sotto «resta aperto»; ~320-323 non rimonta perché le taglie lette non cambiano). Il Salva scrive `products.stock` sulla vecchia somma (`ProductForm.tsx` ~830, ~856-873): la scorta si stacca dalla somma delle taglie. **Prova E2**: deve essere rossa sulla base di partenza della riparazione vecchia e verde dopo la tua.
- In «Duplica» lo stesso: `new/page.tsx` alla riga 286 circa (il modulo aperto scavalca «taglie non arrivate») fa nascere la copia senza taglie e con la scorta della vecchia somma. **Prova D2**.
- Minori dello stesso collaudo, da tenere verdi: da «Nuovo» a «Duplica» senza rimontare la pagina la copia non deve aprirsi vuota (D4b, K2); se le taglie cambiano senza rete il testo non salvato non si perde (E4, D3).
- La prova vecchia del riparatore restava verde togliendo la protezione sugli errori: la tua prova deve cadere se la togli.

## La regola da applicare
**Se le taglie non arrivano, il Salva si blocca con un avviso e il testo scritto resta nel modulo.** Niente scrittura della scorta su una somma che non è stata letta.

## Prima di tutto
Scrivi E2 e D2 come prove automatiche (vitest + Testing Library, come `tests/unit/riparazione-r04-modulo-resta-quando-torna-la-rete.test.tsx`) e falle diventare rosse su `b2c62f34`. Solo dopo ripari. Un commit per voce, con l'id `S01-001` o `S01-002`. `prova-rimessa` sui tre file.
