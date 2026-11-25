---
tipo: quaderno di bordo
data: 2026-11-25 23:25
fonte: sessione «Dati mancanti» (session_01R8112LJpfxZRKXjZh6EgFy); Nicola: «Ripara» (~20:50), poi «apri una nuova sessione per continuare» (23:20)
---

# Le pagine dei clienti nuovi le legge n8n: lo stato di adesso

## Il problema (risolto)
La card di Ora del Gusto (20:30) era tutta «non trovato». Due guasti: la routine «Chiedi all'AD» non apre le pagine
(rete chiusa), e il controllo delle citazioni del 12 cercava il testo delle pagine nei blocchi dell'API a pagamento.

## Cosa è IN USO su n8n (23:25)
- 12 «11 · Nuovo cliente» `DnPXJXZOGasj09uw`: versione **0e29ac19** (prima della riparazione: 5a437a1d).
- 26 «26 · Nuovo cliente da MyCity» `xu0RPgoSNsDaP7xn`: versione **42d412fc** (prima: 36041275). Il 26 si rigenera
  dal 12 vivo con `flussi/16-nuovo-cliente-da-mycity/genera.mjs`: i nodi nuovi li ricopia (verificato, `controlla()` = []).
- 9 nodi nuovi: «Chiedi gli indirizzi delle pagine» (compito: riga PAGINE DA LEGGERE con TUTTI i candidati),
  «Pagine da leggere», «Ci sono pagine da leggere?», «Scarica le pagine», «Sottopagine da leggere», «Ci sono sottopagine?»,
  «Scarica le sottopagine», «Metti le pagine nella risposta», «Ritocca l'anteprima». I nodi grandi del 12 non sono toccati.
- Live = repository nella sostanza: `node flussi/chiedi-all-ad/leggi-pagine.mjs --file <export>` → «uguale».

## Il codice
- PR **NicolaeRotaru/N8N#18**, ramo `ccr-d58987f6-fnlly3`, testa **eae5946** (sopra main con #16 e #17, senza conflitti).
- File: `flussi/chiedi-all-ad/leggi-pagine.mjs`, `flussi/chiedi-all-ad/codice/{pagine-indirizzi,pagine-testo,pagine-da-leggere,
  sottopagine-da-leggere,metti-le-pagine,ritocca-anteprima,indirizzi-nel-compito}.js`, `flussi/test/leggi-pagine.test.mjs`
  (33 casi), fixture `flussi/test/fixture/ad-ricerca-ora-del-gusto.json`. Suite intera: 273 verdi, 1 saltata.
- Prova sul codice vero: `FLUSSO_12=<12 esportato> node --test flussi/test/leggi-pagine.test.mjs` (catena vecchia
  «non trovato», nuova «confermato»; richiesta della scheda < 64 KB anche con 8 foto e indirizzi da 3 byte).
- Memoria: PR **NicolaeRotaru/ad-mycity#1027** (stesso ramo): DECISIONI, BACHECA, LAVORO-APERTO, quaderni, scorciatoia n. 39.

## I collaudi (metodo `collaudo`, regola di arresto: al TERZO rosso decide Nicola)
1. Lente A sicurezza, 1° giro: BOCCIATO (4 difetti) → corretti in b3a67f0.
2. Lente B catena dati: REGGE con 3 difetti → corretti in 88f3ea5.
3. Lente A ricollaudo: BOCCIATO (punto lento in sottopagine 13 s, byte contati prima della pulizia ‹›, host dopo la
   PRIMA @, commento «<!--» che cancellava la pagina) → corretti in eae5946, ognuno con mutazione rossa. **Due rossi.**
   Script dei collaudatori: scratchpad della sessione vecchia (spariscono): non contarci.

## Prossimi passi (in ordine)
1. **Chiedere a Nicola** (non partire da soli): un terzo collaudo indipendente della sicurezza (~150-200 mila token)
   o fermarsi qui. È l'ultimo giro ammesso: se boccia ancora, decide lui *semplifica, restringi o continua*.
2. **Prova vera**: la sessione «Demo e preventivo» (`session_01R8112NUV9py61BAPkYSVQ6`) ha rifatto Ora del Gusto alle
   22:38 e la riga PAGINE DA LEGGERE era vuota → corretta (compito nuovo dalle 22:55). Chiederle l'esito della nuova prova,
   o leggerlo con `list_events`. Atteso: «pagine lette da n8n: N» con N > 0, indirizzo e telefono ✅.
3. **Unione**: la sessione che unisce (`session_01R8112KTPLRuAkWr1PreRUu`) aspetta. Dirle «PRONTA (testa …)» per N8N#18
   e ad-mycity#1027 solo dopo la decisione al punto 1 e la prova del punto 2. Unire non pubblica niente su n8n.
4. **Memoria**: aggiornare DECISIONI (voce del 25/11 22:15) e LAVORO-APERTO con il ricollaudo e le versioni sopra.
5. **Limite aperto, da firmare**: un nome DNS pubblico che punta a un IP interno non si vede dal nome. Proposta 🟡:
   `N8N_SSRF_PROTECTION_ENABLED=true` su Sliplane con `officina.internal` fra i permessi (prima verificare la versione n8n).

## Attenzione
- Niente chiave API n8n in questa macchina: si aggiorna coi soli strumenti MCP (`update_workflow` + `publish_workflow`),
  prima bozza, poi verifica con `leggi-pagine.mjs --file`, poi pubblicazione. Controllare la cronologia prima di pubblicare.
- Lo strumento converte `\uXXXX` scritti nelle chiamate in caratteri veri: il confronto `ugualiNellaSostanza` lo regge.
- Non chiedere ad altre sessioni di pubblicare con le loro chiavi: il sistema dei permessi lo blocca (giusto così).
