---
data: 2026-11-26 23:25
tipo: passaggio della regia (sesta → settima)
campagna: tutti i difetti del sito che non chiedono Nicola (26/11)
---

# Passaggio · alla settima regia

## In parole semplici
Questo foglio serve alla regia nuova per continuare senza rileggere la chat della sesta.
La sesta passa la mano a circa 300 mila token, oltre la soglia dei 250 mila.
Per esempio: due collaudi dell'onda 3 su quattro sono chiusi; mancano K08, K09 e il ricollaudo di R21, poi l'unione U03, il controllore C03 e la PR del sito.

## Cosa cambia per te
Niente: la campagna riprende dove la sesta l'ha lasciata.

## Cosa devi fare
Niente di nuovo. Le scelte arrivate sono già in `per-nicola.md`.

## Cosa non ho verificato
Le prove complete dei riparatori dopo i giri corti (verify verdi) le conosco dai loro messaggi. Il revert di R20-002 è provato sul ramo di R20, non ancora sopra l'unione.

## Dettagli tecnici

**Chi e cosa vale.** AD della campagna: session_015BmpnXuogkPZVts89PH67a (tappe: unione fatta, PR del sito pronta, spesa al 75% = 900 $, fine campagna; falle riservate solo in chat). La sesta è stata aperta dall'AD della chat «Sessioni odierne» (session_015BmpnWupeVireM1DyLQB3e) con le parole di Nicola delle 21:05: «Sì, fai il collaudo della terza ondata» e «aprila dopo la richiesta di unione, quando finisce la terza ondata» → la PR del sito (onde 1+2+3, base main) si APRE soltanto a onda 3 collaudata e unita; unire tocca a Nicola, come le PR #339 → #338 → #336 → #337. **A quella sessione vanno due messaggi: a collaudo finito, e a PR del sito aperta.** R26: niente push forzato (l'unione interna d3975f44 è solo storia). Tetto 1.200 $; quota settimanale in `allowed_warning` (non aprire niente oltre il collaudo e l'unione senza un sì di Nicola). Tetto 4 subagenti per collaudatore, niente ultracode.

**Spesa stimata.** Circa 815 $: ~765 fino alla quinta + giri corti ~22 (R24 2,2 · R22 4,6 · R27 1,75 · R28 4,7 · R18 1,4 · R23 6,2 · R21 0,5) + K07 11,25 + K10 8,66 + sesta regia 8,5. Mancano K08, K09, «R21 secondo» (limite 8 $).

**Basi.** Sito main @ ed12ed8ec8190e1132b690f6e034c30f0a5d55ba. Integrazione onde 1+2 `ccr-a672a2b3-92w5w1` @ aac2350b09db195d6d2286f15f75a7d02ae590a1. Clone: `git clone --filter=blob:none https://github.com/NicolaeRotaru/mycity /home/user/mycity`, poi `git fetch origin 'refs/heads/ccr-a672a2b3-92w5w1*:refs/remotes/origin/ccr-a672a2b3-92w5w1*'`. Cartella `consegne/riparazioni/2026-11-26-tutti-onda3/` (referti copiati e rilanciati in `referti/`, collaudi in `collaudi/`, `sessioni.json` con K07-K10 e le loro `collaudatori.Kxx.partenza`). guardia-ramo dei collaudatori: `--git . --partenza <sha>`; valida-referto sempre con `--ramo origin/<ramo>`.

**Riparatori: punte dopo i giri corti (guardia e referto verdi, rilanciati dalla sesta).**
| R | punta | note |
|---|---|---|
| R17 | 21ad24d5 | invariato |
| R18 | eb6eb4a2 | R18-015 tolta col revert (file altrui) → serve_file_altrui |
| R19 | c0bebde6 | invariato; va con R22 |
| R20 | e201a4f9 | invariato; patch R20-001 parte 2 in `-onda3/patch-R20-001.md` + per-nicola |
| R21 | a483dc10 → «R21 secondo» | vedi sotto |
| R22 | 2182ae53 | prove comuni tornate identiche senza revert; 916 invariata |
| R23 | 7082bc65 | + commit varie c90ef7ff (cura riservata del portiere, fuori elenco) |
| R24 | d9dabfcf | prove comuni identiche, ripiego in cancellazione.ts |
| R25 | 33840626 | invariato |
| R26 | 37ae03f5 | guardia rossa SOLO per l'unione interna d3975f44: collaudato così com'è |
| R27 | b8b196db | R27-004 tolta col revert → per-nicola |
| R28 | 39131061 | verificato_da aggiunto, R28-003 torna parziale |

**Collaudi.**
- **K07** (session_015BmpnW5UJVj5kuFk86pmss, finito, 11,25 $, collaudo 0b1bc266 copiato e verde): R17 6 reggono · R20 1 regge, **R20-002 rompe altro** · R21 5 reggono, **R21-003 e R21-016 rompono altro**, R21-012 non regge. Il revert di R21-003 litiga con 6 voci sopra → correzione invece di revert.
- **K10** (session_015BmpnXM2DGTXQryqn1Uxy7, finito, 8,66 $, collaudo d74ac2cc copiato e verde): R24 7 reggono (R24-015 due lenti), R24-003 non regge · R27 2 reggono (R27-002 con lente indipendente del quinto subagente autorizzato dalla regia) · R18 6 reggono, 4 a metà. Nessun rompe altro. Si può archiviare.
- **K08** (session_015BmpnXkPPduuZvaWJq3RAr, in corso): R25, R26, R23 alla punta 7082bc65. Verdetto sul commit varie di R23 già dato in chat: REGGE su due lenti (girato all'AD). Sta rifacendo il verify, poi consegna. Le schede alla sua copia nominano la quinta come regista: gli ho dato l'id della sesta → **dagli il tuo**.
- **K09** (session_015BmpnXxbcARpqmpSXNq8hL, in corso): R28, poi R19 + R22 insieme sopra i due rami uniti.
- **«R21 secondo»** (session_015BmpnYfgeg1hNf5wr5gGxr, in corso, limite 8 $, ramo -m21 dalla punta a483dc10): R21-003 (911 veloce a 20.000 prodotti, 57014 nel ripiego, conteggio coerente) e R21-016+R21-012 (non scartare i siti già salvati). R21 si è fermato al freno degli agenti (9° su 8) e non spinge più. Quando consegna: guardia + valida-referto, poi **ricollaudo dal K07** (stessa sessione) solo sul delta.

**Da togliere all'unione** (`-onda3/da-togliere.txt`): 52b0a163 (R20-002, revert pulito sul ramo). Più quello che K08/K09/ricollaudo diranno «rompe altro».

**Poi (F3).** Copia K08/K09 → valida-collaudo; prova-unione dei 12 rami sopra aac2350b; **U03** sulla integrazione del sito (unione in ordine m17…m28, revert di `da-togliere.txt`, verify + palestra SQL); **C03**; scrivi `campione_fino_a_40_dall_onda` se serve; `applica --git` a vuoto e `--scrivi`; riga in `misure.json` per le onde 1-3 (regola 7 del 21/11); togli `.riparazione/`; **PR del sito in bozza, solo aperta**, con le migrazioni 911 (contare prima il catalogo vero), 916, 926, 961, 980 (se R20-002 resta tolto, niente 980) come 🔴 a parte; messaggio all'AD della campagna e a session_015BmpnWupeVireM1DyLQB3e. Note per Nicola dal K07: la 980 va applicata prima dell'unione (Vercel pubblica senza aspettare la CI). Fuori voce dal K10: la disiscrizione dalla newsletter tratta «_» come jolly (già fra i nati di R24, due revisori lo vogliono grave).

**Riga di apertura per la regia nuova:** «Sei la regista della campagna consegne/riparazioni/2026-11-26-tutti (settima regia). Leggi consegne/riparazioni/2026-11-26-tutti/PASSAGGIO.md e REGIA.md, e di .claude/skills/riparazione/SKILL.md le regole del 21/11 e del 15/11 e le sezioni F2 e F3; poi continua dai collaudi dell'onda 3. L'AD è session_015BmpnXuogkPZVts89PH67a.»
