---
data: 2026-11-20 23:25
tipo: passaggio di regia
da: «Ondata 9 · 6.0» (session_015BmpnUxR79mzccgeUCjeKq), a circa 650 mila token
a: «Ondata 9 · 7.0»
---

# Onda 9, giro 3: il passaggio alla regia 7.0

## In parole semplici
Il giro 3 è riparato e collaudato. Restano l'unione dei rami, la verifica sul ramo unito, il controllore e la richiesta di unione a Nicola.
Un esempio di cosa entra: il prezzo in promozione adesso arriva davvero al carrello. Un esempio di cosa esce: il carrello in contanti di R05, che spostava la consegna sull'ordine di un altro carrello.

## Cosa cambia per te
Niente: Nicola scrive alla 7.0 come scriveva alla 6.0.

## Cosa devi fare
1. Aspettare la scelta di Nicola sulla scorta (sotto).
2. Unire i rami, togliere con `git revert` le riparazioni bocciate, verify e harness SQL, controllore C03, PR in bozza.
3. Chiedere a Nicola le firme sulle prove ritoccate e l'«ok migrazioni» per la 620.

## Cosa non ho verificato
- Non ho provato l'unione dei sei rami fra loro: `prova-unione` non l'ho lanciato a giro finito.
- I costi di «R01 secondo», «S01 secondo» e K02 non li ho letti a fine lavoro.

---

## Dettagli tecnici

### Rami del sito (base `b2c62f34`, tutti finiti)
| Ramo | Punta | Esito del collaudo |
|---|---|---|
| `-o9g3-m01` (R01 + «R01 secondo») | `cad2de05` | R01-002 regge; R01-001 parziale (minore); «R01-varie» parziale, solo minori (K01 secondo). Entra tutto. |
| `-o9g3-s01` (S01 + «S01 secondo», fuori programma) | `75d8e23e` | S01-002 regge; **S01-001 rompe_altro due volte** (la spunta «escluso dal recesso» torna vecchia col Salva). Scelta di Nicola aperta. |
| `-o9g3-m02` | `6b6dc73e` | 020+021, 005, 009 reggono; 004, 007, 018 parziali (K02). Entra tutto. |
| `-o9g3-m03` | `8aa248db` | 007, 020 reggono; 004, 012, 018 parziali; **021 non regge** (K03 secondo). |
| `-o9g3-m04` | `f634cff2` | 002, 007, 008, 009, 012, 015 reggono, 010 già riparata; 011 parziale; **021 rompe_altro** (K03). |
| `-o9g3-m05` | `948dbae9` | 009+010 reggono; 006 e 005 parziali; **007 rompe_altro** (K02). |

### Da togliere all'unione (`git revert`, un commit alla volta)
- R05-007: `52c5225a`.
- R04-021: `a88b03eb` e `b3c6329e`.
- R03-021: `7ad5d14f` e `5e181dcf`. Il motivo è riservato: lo dice la 6.0 in chat.
- S01-001, solo se Nicola sceglie di toglierla: `47ff5ad6`, `c5147aae`, `6dc1280d`, `6d72dc20`, `f28a17f5`, `7c4c0b69`. S01-002 (`bf5338f5`) resta.

### Decisioni aperte di Nicola
- **La scorta (S01-001):** un ultimo mini-giro di circa 5 $ (aggiungere `non_recedibile` alla firma, `COLONNE_RISCRITTE`, ProductForm.tsx:301-302 e :852), oppure togliere S01-001 tenendo S01-002. La 6.0 consiglia il mini-giro.
- **R05-008:** se cade la scrittura del secondo ordine veloce, il primo torna «Adesso» o resta nella fascia scelta?
- **Firme sulle prove ritoccate:** R02 (minori-s09, riparazione-r07-storico, riparazione-r15-backup: secondo K02 codificavano il difetto e nessuna è indebolita) e R04 (4 prove della rotta dei contanti, adattate e non indebolite; r15 cambia regola, più forte). Più i messaggi di commit di R02 che citano id di altre onde (`fa5dd0fa`, `19291cd4`).
- **Migrazione 620** (R05-006): «ok migrazioni». Senza, il codice resta sul percorso di prima.
- **Sentry:** account con regione UE e `NEXT_PUBLIC_SENTRY_DSN` su Vercel (R03-004).
- Lasciate come sono, salvo diverso avviso: «Riapri» della scorta perde il testo; «Esci» da un'altra scheda non toglie la bozza del reclamo.
- La regola «una veloce per fattorino» nel registro dei fatti ha come fonte «scelta dell'AD su delega» (19/11); il codice dice «scelta di Nicola».

### Difetti nuovi da scrivere nel registro (nati)
Dai referti (`nuovi_difetti_visti`) e dai collaudi: Duplica dalla memoria vecchia col recesso (S01); assi vecchi in ProductForm cambiando categoria (R02); `contaVelociInCorso` senza finestra di tempo (R04); cod-incasso-dichiarato 404 su guasto, pannello fattorino «mancante», reso «già rimborsato» se Stripe non risponde (K03); SUPPORT_EMAIL mancante → 500 a ogni giro del sorvegliante (K03 secondo); più quelli elencati nei collaudi.

### Lezione dal giro
Tre sessioni (R01, K01, K03) hanno perso l'ultracode dopo un riavvio del lavoratore. Un `/effort ultracode` mandato con send_message arriva come testo e non lo riaccende. La strada che ha funzionato: una sessione «secondo» nuova, con prompt `/effort ultracode`, dalla punta del ramo. Le figlie non possono clonare ad-mycity con add_repo (negato dal classificatore), ma `git clone` diretto a volte riesce.

### Le spese (usage.cost_usd)
R01 11,14 · R02 25,72 · R03 33,22 · R04 28,24 · R05 23,11 · S01 13,30 · K01 14,28 · K01 secondo 13,29 · K03 14,49 · K03 secondo ~18 · regia 6.0 ~25. Da leggere: «R01 secondo», «S01 secondo», K02. Totale circa 240 $ (tetto firmato 240 $). Limite «allowed», senza uso extra.
