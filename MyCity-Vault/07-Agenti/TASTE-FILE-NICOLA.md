---
tipo: taste-file
fonte: AD digitale + verdetti di Nicola
stato: attivo v2 (Fase 2 Piano Massimo Potenziale — workflow raccolta verdetti attivo dal 2026-07-02)
---

# 👅 TASTE FILE DI NICOLA — il metro vero della qualità

> **Perché esiste.** Lo standard astratto ("livello mondiale") è buono, ma il **giudice finale è Nicola**.
> Finché il suo gusto vive solo a voce, ogni correzione va persa e i senior ricominciano a indovinare
> l'asticella. Qui lo **codifichiamo**: i suoi verdetti reali diventano il bersaglio contro cui i senior
> si auto-criticano *prima* di consegnare. Più si riempie, più la **prima bozza** esce già al suo livello.
>
> **Chi lo usa.** Tutti i senior *output-facing* (content, designer, copywriter, crm, pr, vendite, marketing)
> lo leggono nel loop interno. Pesa **molto** dove il giudice è il gusto; **poco** su finanza/analista/security
> (lì il metro è la correttezza dei numeri, non il piacere). Il `@direttore-creativo` ci giudica contro.
>
> **Chi lo aggiorna.** L'**AD**: ogni volta che Nicola approva/boccia/corregge un lavoro, registra qui una
> riga col verdetto e il *perché*. È un log **append-only** (come DECISIONI.md): non riscrivere le righe vecchie.

---

## 📝 Formato di una voce (verdetto reale)
```
AAAA-MM-GG HH:MM · [mestiere] · COSA: <pezzo giudicato> · VERDETTO: ✅sì / ⚠️quasi / ❌no
· PERCHÉ (1 riga): <la ragione del sì/no nelle parole di Nicola> · PRINCIPIO: <regola riusabile> · #tag
```
> Compila SUBITO dopo ogni reazione di Nicola, anche una sola frase ("questo è troppo da scaffale" → è una voce).

---

## ⚙️ WORKFLOW RACCOLTA (Fase 2 — obbligatorio per l'AD)

1. **Trigger:** Nicola approva, boccia, corregge o chiede rifacimento su qualsiasi output (post, pitch, briefing, analisi, proposta).
2. **Entro 1 ora:** l'AD aggiunge **una riga** nel LOG sotto (formato sopra) + aggiorna `preferenze_nicola[]` in `apprendimento.json`.
3. **Settimanalmente (venerdì):** se ≥3 verdetti nuovi → distillare/aggiornare i PRINCIPI sotto; se un principio è smentito da un verdetto → correggerlo.
4. **Nei senior output-facing:** ogni consegna importante passa dal loop «*come giudicherebbe Nicola?*» leggendo gli ultimi 5 verdetti + i principi.
5. **Caso-studio:** ogni correzione esplicita di Nicola → `caso_studio_nicola: true` in `apprendimento.json` (fonte 2, priorità massima).

> **Regola:** un briefing con 3 opzioni vaghe e zero raccomandazione = ⚠️quasi per principio 7. Nicola vuole **una mossa decisa**.

---

## ⭐ PRINCIPI DI GUSTO (il distillato — sale man mano che arrivano i verdetti)
> ⚠️ **Questi sono di partenza, estratti dal brand/manuale e dall'esperienza col team marketing — NON
> ancora confermati da verdetti espliciti di Nicola.** Vanno trattati come ipotesi forti e confermati/corretti
> coi suoi sì/no reali. Quando un verdetto reale conferma o ribalta un principio, aggiornalo qui.

1. **Mai "da scaffale".** Contenuto che un competitor qualunque (o Amazon) potrebbe firmare = bocciato.
   Serve l'angolo che solo MyCity-Piacenza può avere. *(dalla domanda-ghigliottina del @direttore-creativo)*
2. **Il volto prima del prodotto.** La persona vera (il bottegaio, la sua storia) batte la foto patinata.
   Autenticità grezza > catalogo. *(dallo [[SWIPE-FILE]], principio 3 e 7)*
3. **Una sola idea per pezzo.** Tre messaggi in uno = nessun messaggio. Single-minded sempre.
4. **Zero finto.** Niente numeri inventati, testimonianze finte, foto-stock anonime. Se non è reale, non esce.
   *(dalle ONESTA-RULES)*
5. **La causa, non lo sconto.** "Salviamo il centro / Piacenza non è in vendita" prima della promo.
   Il nemico chiaro (il magazzino fuori città) è il motore. *(dalla PIATTAFORMA-CREATIVA)*
6. **Alza, non accontentarti.** L'esperienza vera: Nicola fa rifare finché non è *davvero* alto. La prima
   bozza "carina" non basta mai — il senior deve già averla scartata da solo. *(comportamento osservato)*
7. **Concreto e al minuto.** Numeri reali, date con l'ora, una raccomandazione decisa (non 3 opzioni vaghe).
   *(dal CLAUDE.md e dalla RUBRICA-QUALITA)*

---

## 🗂️ LOG DEI VERDETTI (append-only — qui la storia vera del gusto di Nicola)
> Si riempie dal primo lavoro che Nicola giudica. Ogni riga col formato sopra.
> Più questo log cresce, meno serve spronare i senior: imparano il metro da qui.

2026-07-02 10:00 · [AD/sistema] · COSA: analisi "portare la macchina al massimo potenziale" · VERDETTO: ⚠️quasi
· PERCHÉ: "intelligente ed efficiente ma non ancora al massimo — lenta a capire, ragionare e agire nel modo giusto" · PRINCIPIO: meno volume più concentrazione — una mossa decisa che sblocca il resto, non 10 briefing · #metacognizione #gm #concentrazione

2026-06-27 01:35 · [sistema/senior] · COSA: qualità output senior generale · VERDETTO: ⚠️quasi
· PERCHÉ: (implicito da PIANO-SENIOR-AL-TOP) Nicola ha dovuto spronare a mano — rifai, alza, autoanalizzati · PRINCIPIO: la prima bozza deve già superare il loop interno; Nicola non è il revisore di serie · #senior #prima-bozza

2026-06-26 18:30 · [content] · COSA: post "storia bottega Garetti" v1 · VERDETTO: ❌no
· PERCHÉ: "sembra una pubblicità qualunque, non si sente la voce del bottegaio" · PRINCIPIO: apri con una frase vera detta da lui, non con noi che lo descriviamo · #volti #storia-bottega

---
*Quando questo file ha ~20 verdetti reali, l'AD lo RIASSUME in alto (aggiorna i Principi) e pota le righe
vecchie ridondanti — resta piccolo e affilato, come i quaderni `memoria-squadra/`.*
