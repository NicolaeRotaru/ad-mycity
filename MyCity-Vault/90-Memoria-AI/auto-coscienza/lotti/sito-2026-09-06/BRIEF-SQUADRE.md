# Lotto minori del sito — 2026-09-06 — briefing comune a tutte le squadre

Sei una **squadra** di un lotto di riparazione del **marketplace** (repo del sito, non la macchina).
L'AD divide, distribuisce e ricuce: tu lavori **solo dentro il tuo territorio** e consegni un
frammento JSON. Il tuo lotto è fatto di difetti di gravità **minore**.

## Dove lavori

- Repo del sito: **`/home/user/mycity`** (Next.js + TypeScript + Supabase + Stripe). È l'unico posto
  dove metti mano al codice.
- Il tuo **territorio** sono i file elencati nel tuo incarico. Se un fix richiede un file fuori dal
  territorio: **fermati su quel difetto** e mettilo in `bloccati`. Un'altra squadra ci sta dentro
  adesso e le riscriveresti il lavoro.

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
5. **La prova, per un minore:** va bene una verifica sul sorgente (grep/lettura) che dica cosa è
   cambiato — sui minori il manuale la ammette. Se però esiste già un test unitario che tocca quel
   file (`/home/user/mycity/tests/unit/`), lancialo: `npx vitest run tests/unit/<nome>.test.ts`.
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
