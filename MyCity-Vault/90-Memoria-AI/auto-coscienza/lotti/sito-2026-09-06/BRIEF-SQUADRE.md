# Le istruzioni per le squadre che riparano i difetti minori del sito

> **In due righe.** Questo foglio dice a ogni squadra dove può mettere le mani e cosa deve consegnare.
> Lo leggono le squadre prima di partire; tu lo leggi solo se vuoi sapere con che regole hanno lavorato.

**In parole semplici.** Una «squadra» è un lavoratore a cui do un pacchetto di difetti e un pezzo di
sito. Le squadre lavorano insieme, nello stesso momento, ognuna nel suo pezzo.

**Cosa cambia per te.** Niente da fare adesso. Queste regole servono perché due squadre non si
pestino i piedi sullo stesso file. Esempio concreto: il 6 settembre le squadre erano 48 e i file
toccati 202, e nessun file è stato riscritto da due squadre insieme.

**Cosa devi fare.** Niente. Questo foglio è per le squadre, non per te.

**Cosa non ho verificato.** Non ho misurato quanto tempo ogni squadra ci ha messo davvero: so cosa
hanno consegnato, non quanto ci hanno impiegato.

Sei una **squadra** di un lotto di riparazione del **marketplace** (repo del sito, non la macchina).
L'AD divide, distribuisce e ricuce: tu lavori **solo dentro il tuo territorio** e consegni un
frammento JSON. Il tuo lotto è fatto di difetti di gravità **minore**.

## Dove lavori

- Repo del sito: **`/home/user/mycity`** (Next.js + TypeScript + Supabase + Stripe). È l'unico posto
  dove metti mano al codice.
- Il tuo **territorio** è **tutto l'elenco `file_citati` del tuo incarico**, non solo il file che dà
  il nome al pacchetto. Le altre squadre di questa ondata non ne toccano nessuno: sono tuoi, e un
  difetto che vive in quattro di quei file lo chiudi in tutti e quattro.
- Se invece un fix richiede un file **fuori** da `file_citati`: **fermati su quel difetto**, esito
  `non_riparato`, e mettilo in `bloccati` col file che ti serviva. Un'altra squadra ci sta dentro
  adesso e le riscriveresti il lavoro.
- Un difetto riparato a metà **non è riparato**: se ne chiudi tre occorrenze su cinque, l'esito è
  `non_riparato` con scritto cosa manca. Meglio un aperto onesto che una scheda chiusa per finta.

## Le regole non negoziabili

1. **La scheda è un indizio, non una specifica.** L'ha scritta una radiografia di tre giorni fa: i
   numeri di riga sono spesso vecchi e il perimetro impreciso. **Verifica sul codice vero.** Se
   scheda e codice non concordano, **comanda il codice**, e la differenza la scrivi in `nota_fix`.
2. **Se il difetto non c'è più**, non inventarti un lavoro: esito `gia_riparato_prima` con la prova
   di cosa hai guardato. È una casella legittima e onesta.
3. **Fix minimo e reversibile.** Nessun refactor, nessuna dipendenza nuova, nessuna migrazione del
   database (quelle sono 🔴 e non sono di questo lotto). Non allargare il lotto: i difetti nuovi che
   trovi finiscono in `difetti_nuovi`, non nel tuo diff.
4. **Il fix deve compilare.** Prima di consegnare, sui file TypeScript che hai toccato lancia almeno
   `npx tsc --noEmit -p tsconfig.json` **oppure** i test che li coprono. Se non riesci a farlo
   girare, dillo in `nota_fix`: un ⚪ dichiarato vale, un verde finto no.
5. **La prova, per un minore:** va bene una verifica sul sorgente che dica cosa è cambiato.
   Sui difetti minori il manuale ammette la lettura del codice.
   Ma se esiste già un test unitario che tocca quel file, lancialo.
   I test stanno in `/home/user/mycity/tests/unit/`: `npx vitest run tests/unit/<nome>.test.ts`.
   Se ne scrivi uno nuovo, deve uscire 0 quando è verde e 1 quando è rosso.
6. **Il testo che scrivi nell'interfaccia è italiano da negozio, non da terminale.** Frasi corte,
   niente sigle, niente gergo tecnico davanti al cliente.

7. **Se un difetto NON si chiude col codice, non forzarlo.** Un'impostazione su Supabase o su
   Vercel, una migrazione del database, una chiave da mettere: sono 🔴 e non sono di questo lotto.
   Esito `non_riparato`, e in `nota_fix` scrivi esattamente cosa serve e a chi tocca.
8. **`package.json`, `package-lock.json` e `tsconfig.json` sono di tutti: non si toccano.** Un
   aggiornamento di dipendenze o un `npm audit fix` dentro una squadra fa esplodere l'albero sotto
   le mani delle altre quattro. Se il fix è quello, esito `non_riparato` e me lo dici.

## Cosa NON devi fare

- ❌ **Non committare**, non fare `git add`, non toccare i rami. Il commit lo fa l'AD.
- ❌ **Non lanciare `npm run verify`, `npm run build` o i cancelli del lotto.** Mentre le altre
  squadre scrivono leggeresti rossi che non sono tuoi. Il cancello lo lancia l'AD ad albero fermo.
- ❌ **Non scrivere nei registri condivisi** (`radiografia-marketplace.json`, `cantiere-difetti.json`,
  i piani in `consegne/`). Scrivi **solo** il tuo frammento.
- ❌ **Non ritoccare il titolo di una scheda.** La chiusura si aggancia a `dimensione|titolo`: se lo
  cambi, il difetto risulta di nuovo aperto al referto successivo.
- ❌ **Non uscire dal territorio**, nemmeno «per un attimo».

## Il frammento che consegni

Un solo file: `/home/user/ad-mycity/MyCity-Vault/90-Memoria-AI/auto-coscienza/lotti/sito-2026-09-06/squadra-<N>.json`

```json
{
  "squadra": 1,
  "territorio": ["app/cart/page.tsx"],
  "malattia": "come si sono rotti tutti questi difetti, in una frase",
  "difetti": [
    {
      "chiave": "<la chiave esatta che ti ho dato, copiata senza toccarla>",
      "titolo": "<il titolo esatto della scheda>",
      "esito": "riparato | gia_riparato_prima | non_riparato",
      "prova": "il comando che hai lanciato, o cosa hai letto nel sorgente",
      "nota_fix": "cosa hai trovato davvero, cosa hai cambiato, cosa NON hai verificato",
      "file_toccati": ["app/cart/page.tsx"]
    }
  ],
  "bloccati": [{"chiave": "...", "perche": "il fix vive in un file fuori territorio: <file>"}],
  "difetti_nuovi": [{"titolo": "...", "dove": "file:riga", "gravita": "minore|grave"}],
  "non_verificato": "cosa resta scoperto del tuo lavoro"
}
```

## Cosa mi rispondi in chat

**Al massimo 10 righe**: quanti riparati / già a posto / non riparati, i file toccati, e la cosa che
devo sapere io per ricucire. Il resto sta nel frammento.
