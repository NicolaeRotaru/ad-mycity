---
tipo: piano
data: 2026-08-23 11:50
fonte: AD digitale. Correzione di Nicola in chat il 23/8. La data zero è il 29 agosto 2026, non settembre
fatto: cantiere.scadenza-zero (registro-fatti.json)
---

# 🎯 Piano dei sei giorni — data zero 29 agosto 2026

> **In due righe.** Restano sei giorni per 311 difetti aperti e due cose da costruire da zero.
> Il ritmo che servirebbe è cinque volte quello che la macchina ha tenuto finora.

**In parole semplici.** Nicola ha corretto la data. Non 29 settembre: **29 agosto**. Oggi è il 23,
quindi restano sei giorni più oggi. Dentro ci stanno quattro cose intere, e lui ha detto
«va finito tutto quello che ho detto». Nessuna delle quattro cade.

**Cosa cambia per te.** I difetti aperti sono **311 in tutto**: 103 della macchina e 208 del design
del sito. Vanno chiusi in sette giorni contando oggi. Fa **44 difetti al giorno**, festivi compresi.
Il ritmo vero tenuto finora è **8,4 al giorno**. E in quel conto non ci sono le due costruzioni.

Un esempio di cosa vuol dire. Il lotto più grosso mai fatto è quello del 21-22 agosto: 199 difetti
del sito chiusi in due giorni pieni, ma erano difetti già analizzati, con la radiografia in mano.
Qui servirebbe quel lotto lì, rifatto una volta e mezza, e in più due macchine nuove.

**Cosa devi fare.** Tre firme, oggi. Sono le uniche cose che nessun senior può fare al posto tuo,
e moltiplicano tutto il resto:

- **Card #168 — riaccendere il server.** È fermo dal 18 agosto alle 06:50. Finché è giù non si
   alza nessuna cadenza da sola. Si lavora solo quando apri una sessione.
- **Card #154 — le chiavi mancanti su Vercel.** Senza una di quelle, un pagamento riuscito non
   diventa un ordine. Nei registri fra il 18 e il 21 agosto ci sono 70 errori con quel nome dentro.
- **Card #155 — il dominio.** `mycity-marketplace.com` punta ancora al server vecchio.

Poi una scelta: **in che ordine vuoi vedere finite le quattro cose**, se il 29 arriva e non c'è
tutto. Se non me lo dici, l'ordine che seguo è questo: prima i bloccanti, macchina e sito insieme.
Poi le due costruzioni, con il worker davanti. Poi i gravi. I minori per ultimi.

**Cosa non ho verificato.** Il conto dei difetti l'ho letto dai file del cantiere stamattina alle
09:05. Non ho riaperto i difetti uno per uno. I 208 del design vengono da una lettura del codice,
non da pagine aperte in un browser. E non so se il server è ancora fermo adesso. L'ultima traccia
che ho è del 22 agosto alle 20:41.

---

## Il conto, riga per riga

| Cosa | Quanto è aperto | Da dove viene il numero |
|---|---|---|
| Difetti della macchina | **103 aperti**, più 10 da riverificare. Fra questi 6 bloccanti e 45 gravi | `auto-coscienza/cantiere-difetti.json`, letto il 23/8 alle 09:05 |
| Difetti del design del sito | **208 aperti**: 2 bloccanti, 86 gravi, 120 minori | radiografia del 22/8. Nessun lotto ancora aperto su questi |
| Worker per le botteghe | **non esiste**. Listino e architettura sì, codice zero | `worker-negozi.stato`, `architettura.tre-macchine` |
| Design della parte venditore | **mai lavorato**, nemmeno analizzato | detto da Nicola il 22/8 |

## Le tre corsie, in parallelo

**Corsia A — il design del sito, 208 difetti.** Si parte dai due bloccanti. Hanno la stessa radice.
Il magazzino delle immagini accetta un file solo se la prima cartella del percorso è l'identificativo
di chi carica. Tre punti del sito caricano in cartelle che si chiamano in un altro modo. Una
riparazione sola chiude tutti e due. Oggi, per quel difetto, un negoziante non riesce a mettere la
foto di copertina alla sua vetrina: è la card #167. Poi gli 86 gravi, in lotti da una trentina.
I 120 minori per ultimi. Sono quelli che si rimandano, se la data stringe.

**Corsia B — i difetti della macchina, 103 più 10.** Prima i 6 bloccanti, poi i 45 gravi.
Vale l'asticella: un difetto grave si chiude con una prova che gira e diventa rossa se il difetto
torna. Mai con una parola cercata dentro un file.

**Corsia C — le due costruzioni.** Queste due non sono difetti da chiudere: sono cose da costruire. Con sei giorni e le altre due corsie aperte,
l'unica versione onesta è una prima versione che funziona e si vede. Non quella finita. Per il worker vuol dire
una macchina sola, multi-negozio, che fa girare i tre negozi di prova. Per l'altra vuol dire i
flussi principali disegnati e messi in piedi, solo sulle pagine che il negoziante tocca ogni giorno.

## Dettagli tecnici

Fatto `cantiere.scadenza-zero` aggiornato il 2026-08-23 alle 11:45, con
`node cervello/coerenza-fatti.mjs registra` e la caccia aperta sul valore vecchio.
Il guardiano `coerenza-fatti.mjs` passa: exit 0, 1310 file vivi scansionati, nessuna copia
della data vecchia rimasta viva. Le cacce bonificate sono chiuse.
Difetti della macchina: `MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json`.
Difetti del design: `auto-coscienza/radiografia-marketplace.json` e il referto
`consegne/design/2026-08-22-radiografia-design.md`.
