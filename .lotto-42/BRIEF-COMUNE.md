# LOTTO 42 — brief comune a tutte le corsie

Sei **una corsia** di un lotto di riparazione parallelo. Altre 5 corsie lavorano NELLO STESSO
ALBERO in questo momento. Le regole qui sotto esistono perché ognuna è stata pagata sul campo.

## La regola che sta sotto a tutto

**Un difetto non è chiuso quando quel punto guarisce: è chiuso quando la malattia smette di potersi
ripresentare.** Se stai per scrivere un fix che ripara un punto e lascia in piedi il modo in cui
quel punto si è rotto, fermati: stai facendo un lavoro che dovrà essere rifatto.

## ① Il territorio è ESCLUSIVO — non uscirne mai

Il tuo brief elenca i file che possiedi. **Non toccare nessun altro file**, nemmeno per una riga
ovvia: un'altra corsia lo sta editando adesso e la tua scrittura ne cancella il lavoro (Edit legge
e riscrive: l'ultimo che scrive vince).

Se un fix richiede un file che non è tuo: **fermati su quel difetto**, lascialo aperto, e scrivilo
in `fuori_territorio` nel tuo frammento. Non è un fallimento: è il protocollo.

## ② VIETATO scrivere nei registri condivisi e in git

- ❌ `cervello/mutanti.json` · `MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json` ·
  `cervello/malattie.json` · `cervello/tetti-lotto.json` → li ricuce l'AD dal tuo frammento.
- ❌ **nessun `git add` / `git commit` / `git checkout` / `git stash`**. I commit li fa l'AD.
- ❌ **non lanciare `node cervello/cancello-lotto.mjs`**: mentre le altre corsie scrivono legge
  rossi che non sono tuoi e te li riporta come «debito preesistente». Il cancello lo lancia l'AD
  ad albero fermo. Puoi (e devi) lanciare **i tuoi** test.

## ③ La scheda del difetto è un INDIZIO, non una specifica

Le schede le ha scritte una radiografia passata: **vanno verificate sul codice vero**, perché sono
quasi sempre imprecise — più larghe o più strette del difetto reale. **Se scheda e codice non
concordano, comanda il codice**, e la differenza si scrive nella nota. Anche i numeri di riga sono
vecchi: cercali con `grep`.

Se verificando scopri che il difetto **non esiste più** o **è già riparato**, dillo: `esito:
"gia-riparato"` con la prova. Non inventare un fix per un difetto che non c'è.

## ④ La logica che decide deve stare dove un test la può ESEGUIRE

Non dentro un componente React, non dentro `route.ts` insieme a `next/server`, non dentro uno
script di shell. **Funzione pura, senza dipendenze, in un file suo**; il punto malato la chiama.
Altrimenti la prova controlla la **forma** invece dell'**effetto** — ed è così che questi difetti
sono sopravvissuti: la loro prova era un pattern cercato in un file.

Case in casa da imitare: `cervello/ora-piacenza.mjs` · `cervello/fonte-numero.mjs` ·
`cervello/contratto-scheda.mjs` · `pannello/src/lib/atto-unico.ts`.

**Un solo modulo condiviso per corsia.** Se te ne servono tre, la malattia era tre malattie: fanne
uno e dichiara il resto.

## ⑤ La prova è comportamentale, e non basta che sia verde

I test stanno in `cervello/test/<nome>.test.mjs` e girano con `node`. Il pattern di casa (leggilo,
è la forma attesa): `cervello/test/allarme-cronico.test.mjs` — intestazione che spiega la radice,
`prova(nome, fn)` con `assert`, e in fondo il conteggio + `process.exit(fail ? 1 : 0)`.

I moduli `.ts` del Pannello si importano diretti (Node 22):
`await import(join(REPO, "pannello/src/lib/x.ts"))`.

**⚠️ I casi asincroni vanno ATTESI.** Se scrivi `prova("...", async () => ...)` e il banco non
aspetta, l'asserzione gira dopo il conteggio e un `1 = 2` stampa «pass». È AR-694, ed è dentro
questo lotto: non riprodurlo.

**Non far scrivere ai tuoi test la memoria vera** (`MyCity-Vault/…`): inietta il percorso con una
env o un argomento e puntalo su una cartella temporanea. Un test che sporca il vault è un test che
si smette di lanciare.

### La prova di non-vacuità — obbligatoria, per OGNI difetto che tocchi

**Rompi il fix apposta e pretendi il ROSSO.** Se il test resta verde, la prova non prova niente e
il difetto NON è chiuso. Pesca il pezzo da rompere sul **cuore** del fix: se prendi una riga
qualsiasi misuri la compilazione, non la difesa.

Per ogni difetto riparato consegna nel frammento:
```
"mutante": { "file": "...", "cerca": "<riga ESATTA, copiata dal file>", "sostituisci": "<versione rotta>" },
"non_vacuita": "rompendo X i casi ①③ diventano rossi — verificato lanciando il test"
```
`cerca` deve essere una stringa **presente nel file dopo il tuo fix**, copiata carattere per
carattere. Se non lo è, lo strumento dirà «cieco» e il cancello ci fermerà tutti.

**Verificala davvero**: applica la mutazione, lancia il test, guarda il rosso, rimetti a posto.
Non dedurla.

## ⑥ Rileggi le clausole invece di fidarti del verde

Metti il testo del difetto accanto al tuo diff, **clausola per clausola**: sono spesso tre o
quattro dentro un paragrafo unico, e quella che salta è quasi sempre **l'ultima**, perché arriva
quando il lavoro sembra finito.

> Il precedente: era stata sistemata la porta a mano e non quella automatica. La prova passava,
> perché la conosceva chi aveva fatto il lavoro e copriva quello che aveva fatto.
> **Riparare la porta a mano e lasciare aperta quella automatica è il modo più sicuro di far
> tornare il difetto da solo.**

Cerca **l'atto**, non il tuo fix: `grep` del punto dove la cosa succede, e per ogni occorrenza
chiediti se il freno c'è. Poi verifica che il codice che hai aggiunto sia **usato davvero**
(`grep -c` del simbolo: se compare una volta sola è l'import, e il resto è morto).

## ⑦ I difetti NUOVI che trovi

Registrali nel frammento sotto `difetti_nuovi` (titolo · causa radice · dove l'hai visto), **senza
inventare un id AR-xxx** — lo assegna l'AD leggendo il numero libero da `origin/main`. NON
allargare il lotto per ripararli: allargarlo a metà è il modo classico di non finirlo.

## ⑧ Cosa consegni

Scrivi **UN SOLO FILE**: `.lotto-42/corsia-<LETTERA>.json`

> ⚠️ **SCRIVILO SUBITO E AGGIORNALO DOPO OGNI DIFETTO.** Il contenitore di questa sessione si è
> già riavviato una volta e ha buttato via il lavoro non salvato di sei corsie. Appena finisci un
> difetto — fix + test + mutazione verificata — riscrivi il file con quello che hai fatto FINORA.
> Non aspettare la fine: un frammento parziale su disco vale infinitamente più di un lavoro
> completo che non è mai stato scritto.

```json
{
  "corsia": "<lettera> — <malattia in una frase>",
  "modulo_condiviso": "cervello/<nome>.mjs",
  "difetti": [
    {
      "id": "AR-xxx",
      "esito": "riparato | gia-riparato | aperto",
      "verifica_comando": "node cervello/test/<nome>.test.mjs",
      "nota_fix": "cosa ho cambiato e perché, in italiano, 2-4 righe. Se la scheda diceva un'altra cosa del codice, la differenza va QUI.",
      "mutante": { "file": "...", "cerca": "...", "sostituisci": "..." },
      "non_vacuita": "rompendo X i casi ①③ diventano rossi — verificato",
      "motivo_se_aperto": "solo per esito=aperto"
    }
  ],
  "file_toccati": ["..."],
  "fuori_territorio": ["AR-xxx: servirebbe <file> che è di un'altra corsia"],
  "difetti_nuovi": [{ "titolo": "...", "causa_radice": "...", "visto_in": "..." }],
  "spazzata": "la malattia è censita in malattie.json? con che nome? quante istanze restano?"
}
```

## ⑨ Come si scrive (vale per le note che finiranno sotto gli occhi di Nicola)

Italiano, frasi corte, **una frase = un'idea**. Ogni numero col suo metro («17 punti su 19»).
Niente sigle o percorsi nelle frasi di sintesi: quelli vanno nei campi tecnici. Il metro è: se
poteva scriverlo un terminale, riscrivilo.

## Il giro completo

```
verifica il difetto sul codice vero → estrai la decisione in un modulo puro → applica nei punti →
un test per difetto → ROMPI il fix e pretendi il rosso → rileggi le clausole → scrivi il frammento
```
