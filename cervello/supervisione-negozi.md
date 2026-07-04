# 🛡️ Supervisione negozi & prodotti — la macchina veglia i dati mancanti

> **Cosa fa:** guarda **ogni negozio** e **ogni prodotto**, trova i **dati mancanti** e prepara il
> **riempimento automatico** — ma sempre come **proposta da firmare**. Niente si scrive sul sito senza l'ok di Nicola.
>
> Nasce dalla richiesta di Nicola: *«voglio che la macchina supervisioni ogni negozio e i suoi prodotti e
> inserisca in automatico ogni dato mancante, chiedendomi sempre il permesso prima».*

Motore: `cervello/supervisione-negozi.mjs`. Gira **a ogni giro** (agganciato in `giro.sh`) e a comando
(*"supervisiona i negozi"*, `COMANDI.md`).

## Le 3 classi di sicurezza (il cuore della cosa)

Ogni campo mancante viene classificato — è così che la macchina resta onesta e prudente:

| Classe | Cosa | Esempi | Cosa fa la macchina |
|---|---|---|---|
| ① **AUTOFILL** | campo descrittivo **deducibile** con un valore difendibile e un **precedente reale** sul sito | `unit` → «pezzo» (unico valore già usato), `condition` → «nuovo» (prevalente), `category_id` dedotta dal nome | **propone** il valore (🟡) col comando pronto in [[AZIONI-IN-ATTESA]] |
| ② **PROCURA** | serve **materia prima reale**, non si inventa | foto prodotto, logo, prezzo, giacenza, telefono, indirizzo, orari, **descrizione** (voce del negozio), città | lo **elenca** in «serve da te»; al massimo una bozza con segnaposto evidente |
| ③ **MAI** | campo **sensibile** | dati legali, P.IVA/codice fiscale, IBAN/carta, documenti KYC, account Stripe, consensi (TOS/privacy), stato di approvazione, wallet, rider | **non lo tocca mai**, nemmeno se vuoto (blocklist rigida + doppia guardia) |

La blocklist (classe ③) è applicata **due volte**: nella spec dei campi e di nuovo in `proponi()` prima di
emettere qualunque comando di scrittura. È verificata dal `--selftest`.

## Il flusso (Osserva → Proponi → Firma → Esegui → Traccia)

1. **Osserva** (🟢 sola lettura REST): legge tutti i seller e tutti i prodotti. Se i sensori sono ciechi o
   le chiavi mancano → **no-op onesto**, nessun numero inventato (come le altre sentinelle).
2. **Proponi**: raggruppa i gap in poche card — una per `(tabella, campo, valore)`, es. «unità = pezzo su 242
   prodotti» — invece di centinaia di azioni separate. Scrive:
   - il report in `consegne/supervisione/AAAA-MM-GG-supervisione.md` (con **comando pronto** + elenco ID);
   - la memoria in `MyCity-Vault/90-Memoria-AI/auto-coscienza/supervisione-negozi.json`;
   - con `--accoda`, il blocco 🟡 in [[AZIONI-IN-ATTESA]] (idempotente: un blocco marcato, riscritto ogni giro).
3. **Firma**: Nicola scrive *"ok riempi [unità/condizione]"* o *"ok a tutte le proposte di supervisione"*.
4. **Esegui** (🟡, solo dopo l'ok): gira il comando pronto del report —
   `AZIONI_LIVE=1 node cervello/marketplace.mjs aggiorna <tabella> <id> '<json>'` — che fa **backup di ogni
   riga** (reversibile) usando la mano di scrittura già esistente.
5. **Traccia**: `marketplace.mjs` salva il backup; `esegui-azione`/le mani lasciano la riga in [[DECISIONI]].

## Colore 🟢🟡🔴

- La **scansione + proposta** è 🟢 (sola lettura del sito, scrive solo memoria/report/coda).
- Il **riempimento** approvato è 🟡 (modifica dati del catalogo, ma reversibile con backup per riga).
- I campi **sensibili** (③) sarebbero 🔴/umani: la macchina non li propone mai → non arrivano nemmeno in coda.

## Comandi

```bash
node cervello/supervisione-negozi.mjs            # report leggibile (scansione + proposte)
node cervello/supervisione-negozi.mjs --json     # output JSON (Pannello/sonde)
node cervello/supervisione-negozi.mjs --accoda    # scrive report + accoda le proposte 🟡 in AZIONI-IN-ATTESA
node cervello/supervisione-negozi.mjs --selftest  # test deterministico della logica (senza DB)
```

## Estenderla

Per vegliare un nuovo campo, aggiungilo a `SPEC_PRODOTTI` o `SPEC_NEGOZI` con la sua `classe`:
- `autofill` → dai una `proposta(riga, ctx)` che ritorna `{ valore, perche, nota? }` **solo** se il valore è
  difendibile (precedente reale o deduzione con confidenza); altrimenti `null` (finisce in «procura»).
- `procura` → basta `etichetta` + (`voce: true` se serve la voce del negozio, o `nota`/`materiale`).
- Se il campo è sensibile: **non aggiungerlo**. La blocklist lo scarterebbe comunque, ma la spec resti pulita.
