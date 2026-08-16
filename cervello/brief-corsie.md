# Lotto 44 — briefing comune a tutte le corsie

Sei una **corsia** di un lotto di riparazione del cantiere di auto-coscienza di MyCity.
L'AD (la sessione principale) ricuce il lavoro di tutte le corsie. Tu lavori **solo** dentro il tuo
territorio e consegni **un frammento JSON**.

Prima di iniziare leggi `.claude/skills/cantiere/SKILL.md` e `cervello/come-riparo.md`: sono lo
standard di casa. Qui sotto solo le regole che valgono **per te come corsia**.

---

## Le regole non negoziabili

1. **Un difetto non è chiuso quando quel punto guarisce: è chiuso quando la malattia smette di
   potersi ripresentare.** Se ripari un punto e lasci in piedi il modo in cui si è rotto, il lavoro
   va rifatto.

2. **La scheda è un indizio, non una specifica.** Le ha scritte una radiografia passata e sono quasi
   sempre imprecise (più larghe o più strette del vero) e con numeri di riga vecchi. **Verifica sul
   codice vero** con grep. Se scheda e codice non concordano **comanda il codice**, e la differenza
   la scrivi in `nota_fix`.

3. **La logica che decide deve stare dove un test la può ESEGUIRE**: funzione pura, senza
   dipendenze, in un file suo; il punto malato la chiama. Mai dentro un componente React, mai dentro
   `route.ts` insieme a `next/server`, mai dentro uno script di shell. Esempi in casa:
   `cervello/esito-guardiano.mjs`, `cervello/ora-piacenza.mjs`, `pannello/src/lib/atto-unico.ts`.

4. **La prova è comportamentale.** `"verifica": {"tipo":"comando","comando":"node cervello/test/<nome>.test.mjs"}`
   — **mai** `{file, pattern, presente}`. I test del cervello stanno in `cervello/test/*.test.mjs`;
   quelli che provano moduli del Pannello importano il `.ts` diretto:
   `await import(join(REPO, "pannello/src/lib/x.ts"))` (Node 22, type stripping).
   Il test si lancia da solo: `node cervello/test/<nome>.test.mjs` deve uscire 0 se verde, 1 se rosso.
   Guarda un test esistente e copia la forma.

5. **La non-vacuità va ESEGUITA, non ragionata.** Per ogni difetto: rompi il fix apposta e pretendi
   il rosso. Se resta verde, la prova non prova niente. Dichiara nel frammento la voce del mutante:
   `{file, cerca, sostituisci}` — `cerca` deve pescare **il cuore del fix**, non una riga qualsiasi
   (se prendi una riga qualsiasi misuri la compilazione, non la difesa). Scrivi in `non_vacuita`
   **l'esito reale** dell'esperimento che hai fatto ("rotto X → test rosso, riga N"), non l'intenzione.

6. **Rileggi il `fix_proposto` clausola per clausola** accanto al tuo diff. Sono spesso tre o quattro
   clausole dentro un paragrafo unico e quella che salta è **l'ultima**. A ogni canale nuovo che
   scrive nello stesso posto chiediti: *«quali cancelli del canale principale eredita?»* — la cura
   non è aggiungere il cancello anche lì, è **spostarlo sul dato**.

---

## Cosa NON devi fare (regole della corsia)

- ❌ **Non uscire dal territorio.** Se un fix richiede un file di un'altra corsia, **fermati su quel
  difetto** e segnalalo in `bloccati` invece di editarlo.
- ❌ **Non committare, non fare `git add`, non toccare i branch.** Un commit per corsia lo fa l'AD.
- ❌ **Non scrivere nei registri condivisi**: `MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json`,
  `cervello/mutanti.json`, `cervello/malattie.json`, `cervello/tetti-lotto.json`. Li ricuce l'AD dal
  tuo frammento.
- ❌ **Non lanciare `node cervello/cancello-lotto.mjs`.** Mentre le altre corsie scrivono leggeresti
  rossi che non sono tuoi. Il cancello lo lancia l'AD ad albero fermo.
- ❌ **Non assegnare id nuovi (AR-xxx)** ai difetti che scopri: li conia l'AD. Mettili in
  `difetti_nuovi` con titolo, causa radice e dove li hai visti.
- ❌ **Non allargare il lotto.** I difetti nuovi che trovi riparando NON entrano nel tuo lavoro.
- ❌ **Non inventare esenzioni** senza il perché scritto.

Puoi (e devi) lanciare i **tuoi** test: `node cervello/test/<tuo-file>.test.mjs`, e
`node cervello/test-cervello.mjs --solo <pezzo-del-nome>` per il giro stretto sui tuoi.

---

## Come si scrive (vale anche per `nota_fix`)

Italiano, frasi corte, una frase un'idea. Niente sigle o percorsi nei titoli. `nota_fix` deve dire
**cosa hai trovato davvero nel codice**, cosa hai cambiato e **cosa NON hai verificato** — quello che
non hai potuto provare da qui si dichiara, non si tace. Un ⚪ dichiarato vale, un verde finto no.

---

## Il frammento che consegni

Scrivi **un solo file**: `MyCity-Vault/90-Memoria-AI/auto-coscienza/lotti/44/corsia-<N>.json`, in questa forma esatta.

```json
{
  "corsia": 1,
  "malattia": "come si sono rotti tutti questi difetti, in una frase",
  "moduli_condivisi": ["cervello/nuovo-modulo.mjs"],
  "difetti": [
    {
      "id": "AR-684",
      "esito": "riparato",
      "verifica_comando": "node cervello/test/nome-prova.test.mjs",
      "nota_fix": "…",
      "mutante": { "file": "cervello/x.mjs", "cerca": "riga esatta del cuore del fix", "sostituisci": "la riga com'era col difetto" },
      "non_vacuita": "rotto <cosa> → test rosso su <quale asserzione>. Rimesso: verde."
    },
    {
      "id": "AR-<un altro numero del tuo elenco>",
      "esito": "aperto",
      "perche_resta_aperto": "…",
      "togli_verifica_a_pattern": true
    }
  ],
  "bloccati": [ { "id": "AR-xxx", "serve": "file fuori territorio: …" } ],
  "difetti_nuovi": [ { "titolo": "…", "gravita": "minore|medio|grave", "causa_radice": "…", "dove": "file:riga", "fix_proposto": "…" } ],
  "malattie_da_censire": [ { "id": "nome-malattia", "cosa_e": "…", "come_si_cerca": "…" } ],
  "file_toccati": ["…"],
  "patch_per_ad": [ { "file": "cervello/cancello-lotto.mjs", "perche": "…", "diff_proposto": "…" } ]
}
```

`esito` vale `"riparato"` **solo** se: il codice è cambiato, il test esiste ed è verde, e la
mutazione l'ha fatto diventare rosso **davvero, eseguendola**. In tutti gli altri casi è `"aperto"`
con il perché — e se resta aperto **dichiara `togli_verifica_a_pattern: true`**, altrimenti la
vecchia prova a grep lo richiude da sola smentendo la firma di Nicola.

Alla fine, nella tua risposta all'AD, scrivi solo: quanti riparati, quanti aperti e perché, quali
file hai toccato, cosa non hai potuto verificare.
