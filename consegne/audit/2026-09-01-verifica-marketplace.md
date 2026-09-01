---
data: 2026-09-01 14:20
tipo: verifica del marketplace + nota di metodo
repo: NicolaeRotaru/mycity @ 51ab3e3 (dopo PR #244)
---

# Verifica del marketplace — 1 settembre 2026

## Cosa è successo, prima di tutto il resto

Ho passato questa sessione a fare una radiografia profonda del marketplace **su una
copia di lavoro ferma al 30 luglio**, senza saperlo. Il repository vero era avanti di
un mese e di almeno quattro PR di riparazioni (#241–#244).

Risultato: ho annunciato tre bloccanti — scheda prodotto invisibile, ordini che non
avanzano, build rotto — che erano **già stati risolti**. Rifatte le verifiche sul
codice reale, i punti più pesanti del referto risultano chiusi, e in un caso meglio di
come li avrei chiusi io.

Il referto del 30 luglio e le azioni 🔴 che avevo accodato **non valgono** e sono
state rimosse: quelle migrazioni, applicate al database di oggi, lo farebbero
regredire.

## Lo stato reale, misurato oggi

| Gate | Esito |
|---|---|
| `tsc --noEmit` | ✅ **0 errori** |
| `next lint` | ✅ 0 errori |
| `next build` | ✅ **177 pagine** |
| `vitest run` | ✅ **1538 test su 1538** (178 file) |
| Ricostruzione schema da zero (130 migrazioni, Postgres 16 locale) | ✅ **130 applicate, 0 fallite** |
| `npm audit` (produzione) | ✅ **0 vulnerabilità** (erano 6, di cui 5 alte) |

A luglio i test erano 718 su 83 file. Sono più che raddoppiati.

## Verifiche puntuali sui punti che avevo dato per gravi

| Punto | Stato reale |
|---|---|
| Commissione dichiarata 8% vs incassata 10% | ✅ **Chiuso, e meglio**: i Termini ora scrivono `{MARKETPLACE_FEE_BPS / 100}%`, cioè leggono la costante. Il numero pubblicato **non può più divergere** da quello incassato. |
| P.IVA e PEC segnaposto nel footer | ✅ Non più presenti |
| `getClientIp` prendeva il primo XFF (rate limit aggirabili) | ✅ Chiuso: la catena si legge dalla coda, con il commento che spiega perché |
| `rider_fee_cents` mai scritto | ✅ Chiuso: ora scritto alla creazione dell'ordine |
| Scheda prodotto invisibile senza account | ✅ Chiuso (PR #244, migrazione 129) |
| Trigger ordini che citava `invoice_number` | ✅ Chiuso — provato sullo schema ricostruito |

## I tre difetti che sono sopravvissuti — riparati oggi

Commit `2ab20bd` sul ramo `claude/amazing-lovelace-nqa9o1`.

1. **`components/ui/Button.tsx`** — `disabled:opacity-50` compone l'intero pulsante
   sulla pagina: testo e fondo si schiariscono insieme. **Misurato in un browser vero**
   (Storybook, storia «Disabled»): **1,62:1** contro i 4,5:1 richiesti — la scritta è
   di fatto invisibile, e su `StickyAddToCart` quella scritta è «Non disponibile»,
   cioè un'informazione. Ora **8,80:1**, e resta visibilmente spento.

2. **`components/ui/Modal.tsx`** — l'`h2` del titolo non aveva nessuna classe `text-*`,
   quindi ereditava il default di `globals.css` (30px, serif) e con `truncate` i titoli
   veri si tagliavano. **Misurato**: su un modale `sm` restano 332px utili, «Condividi
   la lista della spesa» ne occupa 363 e «Scansiona il codice a barre» 341. Allineato a
   `ConfirmDialog`, la finestra gemella.

3. **`package-lock.json`** — 6 vulnerabilità in produzione (5 alte: Next.js SSRF nei
   rewrites, DoS sull'ottimizzazione immagini via SVG, esposizione non autenticata
   degli endpoint delle Server Function; postcss; sharp/libvips; fast-uri) → **zero**.
   Si muove solo il lockfile: Next da 15.5.18 a 15.5.25, dentro il range già dichiarato.

## La lezione, che vale più dei tre fix

**Non ho verificato l'età della copia su cui stavo lavorando.** È lo stesso errore che
stavo documentando: fidarsi di uno stato senza una prova che sia quello vero. Il costo
è stato un referto intero da buttare e quattro azioni pericolose accodate a Nicola.

Il freno, se lo vogliamo: **prima di aprire una radiografia, confrontare `HEAD` locale
con il ramo remoto e con la data dell'ultimo commit.** Trenta secondi. Se la copia è
indietro di più di un giorno, aggiornarla o dichiararlo in cima al referto.

## Cosa NON è stato fatto, e resta da fare

Una radiografia vera **del codice di oggi** non esiste ancora: quella di questa
sessione descrive luglio. Se serve, va rifatta da capo sul repository aggiornato —
il metodo (revisori paralleli, prove a runtime nel browser, ricostruzione dello schema
su Postgres locale) ha funzionato ed è riusabile così com'è.
