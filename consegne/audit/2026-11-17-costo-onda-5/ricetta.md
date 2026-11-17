---
data: 2026-11-17 16:05
tipo: ricetta
fonte: analisi.md nella stessa cartella, misure delle onde 1, 4 e 5
---

# Come chiudere un difetto minore con meno di 10 $

## In parole semplici

Questa è la ricetta per riparare i difetti piccoli del sito spendendo meno di 10 $ per ognuno che si chiude. Il collaudo e il controllore restano, sempre: un difetto conta come chiuso solo quando tutti e due dicono che regge.

Per scendere sotto i 10 $ non serve far spendere meno un riparatore. Serve fargli chiudere più difetti con la stessa spesa. Nell'onda 1 un riparatore chiudeva 11 difetti per circa 36 $, nell'onda 5 ne ha chiusi 2-3 per circa 37 $.

La ricetta cambia tre cose. Si danno solo difetti nuovi, con tutti i file in mano a un solo riparatore. Si collaudano anche le correzioni applicate dopo. La regia nasce corta e passa la mano presto.

## Cosa cambia per te

- Primo passo quasi gratis: collaudare le 15 correzioni già dentro il sito. Costa circa 7 $ e ne dovrebbe chiudere fra 8 e 11.
- Poi un pilota da circa 70 $ con 24 difetti scelti con la ricetta. Se ne chiude almeno 8, si allarga.
- Per circa 200 difetti piccoli il conto atteso è circa 480 $ per circa 56 chiusi, cioè circa 8,6 $ l'uno.

## Cosa devi fare

Dire sì o no al pilota da circa 70 $, più i 7 $ del primo passo. Senza il tuo sì non parte niente.

## Cosa non ho verificato

- Quanti chiude la ricetta nuova non è misurato. Uso le onde 1 e 4, che avevano difetti mai tentati: per questo c'è il pilota con la soglia scritta prima.
- Non ho contato quanti dei minori aperti hanno tutti i file in una sola sessione. Lo conta il passo 1 del pilota. Se sono meno di 200, il preventivo si accorcia in proporzione.
- Il modello piccolo e un ragionamento più corto potrebbero costare meno. Su questo lavoro non sono mai stati misurati da soli, quindi la ricetta non li usa: si provano dopo, uno alla volta.
- La regia nuova sotto i 250 mila token è misurata nell'onda 1 (58 $ per 275 voci), non in quelle dopo.

---

## Dettagli tecnici

### Perché funziona: il conto di un difetto chiuso

Il costo per voce data è stabile nelle tre onde misurate: 2,21 $ (onda 1), 2,65 $ (onda 4), 2,32 $ (onda 5). Il costo per voce chiusa è quel numero diviso la quota di voci che reggono al collaudo:

| Onda | $ per voce data | Quota che regge | $ per voce chiusa |
|---|---|---|---|
| 1 | 2,21 | 44% | 4,99 |
| 4 | 2,65 | 34% (28% senza K14) | 7,79 |
| 5 | 2,32 | 10% | 23,19 |
| **Ricetta, atteso** | **2,40** | **28%** | **8,6** |

Sotto i 10 $ servono almeno 24 voci su 100 che reggono, con 2,40 $ a voce data. L'onda 4 c'è arrivata, l'onda 5 no: la differenza è nei difetti dati, non nella spesa.

### La ricetta, punto per punto

**1. Come si scelgono i difetti** (è la leva più pesante: circa 15 $ dei 23 $ dell'onda 5)
- Solo minori. I gravi e tutto ciò che tocca soldi, permessi, migrazioni o dati vanno in un'onda a parte, con ultracode e revisori. Nell'onda 5 due gravi sono costati circa 22,6 $ e nessuno dei 7 ha retto.
- Solo voci mai tentate. Fuori gli elenchi B (serve_file_altrui) e C (parziali su file altrui) e le non fatte ripetute: queste entrano solo dal passo 0, se la loro patch è già scritta.
- Tutti i file della voce in mano a un solo riparatore. `dividi` raggruppa per file, non per tema. Una voce che tocca il file di un altro riparatore non entra nell'onda: va a quel riparatore o all'onda dopo.
- Una prova rossa scrivibile: un comando che fallisce col difetto e passa senza. Le voci senza prova possibile vanno a Nicola (elenco D).
- Fuori le voci già riparate in un ramo non ancora unito. `pronte` deve confrontare anche i rami aperti, non solo la base: nell'onda 5 ne sono entrate 10 su 100.

**2. Prima il già pagato** (regola 7 del 15/11)
- Collaudo breve delle 15 patch applicate alla cucitura dell'onda 5 (93dff97f), della diff di R33 nel referto e di R32-014: circa 17 verdetti a 0,4 $, circa 7 $.
- Da adesso in poi, ogni patch applicata dalla regista alla cucitura passa da un collaudo breve sulla testa unita, nella stessa onda. Senza, il lavoro è pagato e non conta: nell'onda 5 erano 22 voci, circa 51 $.

**3. Quanti riparatori e con quale modello**
- Pilota: 2 riparatori da 12 voci. Dopo il pilota: 4 riparatori da 12-16 voci per onda.
- Modello grande (Opus 5.5), effort xhigh, ultracode spento, al massimo 6 subagenti (regola 6). È la configurazione misurata nelle onde 4 e 5: un riparatore costa circa 1,5 $ per voce data. Cambiare modello o effort nello stesso pilota renderebbe illeggibile la misura (regola 10).
- Lotti da 12-16, non da 25: nell'onda 4 e nell'onda 5 un riparatore ha toccato 14-16 voci prima del tetto. Con 25 voci date, 9-17 restavano non fatte e i posti erano persi.
- L'avvio resta com'è: fino al piano costa 1-2 $ (misurato su R30-R33), non è lì che si risparmia. Consegna al 70% del tetto (regola 3).
- Tetto: consegna a 24 $, tetto duro 28 $ per 12 voci.

**4. Il collaudo**
- Un collaudatore diverso dal riparatore: chi ha costruito non collauda.
- Giudica tutti i minori, senza campione (regola 9, lotti fino a 40 voci).
- «Regge» solo con una prova che gira: rossa sulla base, verde sulla testa. Mai una parola cercata in un file.
- `valida-collaudo` verde, rilanciato dalla regista. Costo misurato: 0,37-0,41 $ a verdetto (K17, K18). Tetto: 0,5 $ a voce.

**5. Il controllore**
- Lavora dopo l'unione, sulla testa unita. Rilancia il verify e le prove SQL.
- Rilancia la prova di ogni voce data per «regge»: sono comandi, costano poco.
- Cerca i difetti nati nei file toccati. Nell'onda 5 C05 ha trovato 4 voci rosse e 3 difetti nuovi minori.
- Tetto 6 $ (C04 2,96 $, C05 7,99 $).

**6. La regia**
- Una sessione nuova per fase. Nasce sotto i 100 mila token e passa la mano a 250 mila (regola 4).
- Il permesso di Nicola si copia in DECISIONI e nella bacheca prima di partire. Così la regista nuova lo eredita, e nessuno resta in una chat lunga per non perderlo. Nell'onda 5 questo è costato circa 30 $.
- Legge la spesa delle figlie con get_session e si sveglia solo quando arriva un esito.
- Tetto: 0,25 $ per voce data (onda 1: 0,21 $; onda 5: 0,59 $).

### Come si controlla che il lavoro sia fatto bene

Tre controlli indipendenti, tutti dentro il costo per difetto:

1. Il riparatore scrive la prova rossa e lancia il verify sulla sua testa.
2. Il collaudatore, un'altra sessione, rilancia la prova e giudica ogni voce per intero.
3. Il controllore, sulla testa unita, rilancia il verify, le prove SQL e la prova di ogni «regge».

In più i programmi: `guardia-ramo`, `valida-referto`, `valida-collaudo` e `node cervello/cancello-lotto.mjs`. Una voce si chiude solo con i tre sì e i programmi verdi. Se il controllore trova una voce rossa, quella voce non si chiude, anche se il collaudo diceva «regge».

### Il pilota, con la soglia scritta prima

| Pezzo | Cosa | Atteso | Tetto |
|---|---|---|---|
| Passo 0 | collaudo breve di circa 17 voci già pagate | 7 $ | 8 $ |
| Riparatori | 2 da 12 minori scelti col punto 1 | 48 $ | 56 $ |
| Collaudo | 1 collaudatore sulle 24 voci | 10 $ | 12 $ |
| Controllore | 1, sulla testa unita | 5 $ | 6 $ |
| Regia | sessione nuova | 7 $ | 8 $ |
| **Totale** | | **77 $** | **90 $** |

**La soglia, misurata solo sui 24 difetti nuovi** (il passo 0 ha un conto a sé, perché le sue voci sono già pagate):
- **Si allarga** ai circa 200 minori se reggono almeno 8 voci su 24, con il controllore senza voci rosse fra queste. Vuol dire 70 $ diviso 8, cioè 8,75 $ a chiusa o meno.
- **Si ferma** se reggono 5 voci o meno: almeno 14 $ a chiusa. Prima di spendere ancora si rivede la scelta dei difetti.
- **Fra 6 e 7** si fa un secondo pilota, cambiando una cosa sola: il modello piccolo nei subagenti dei minori, oppure l'effort high.
- **Passo 0**: se reggono almeno 8 voci su 17, il collaudo dopo la cucitura diventa regola fissa.

### Il preventivo per circa 200 minori

Quattro onde da circa 50 voci, ognuna con il suo collaudo, il suo controllore e una regia nuova. Fra un'onda e l'altra un cancello: si continua sotto i 10 $ a chiusa, ci si ferma sopra i 12 $.

| Caso | $ per voce data | Quota che regge | Spesa | Chiusi | $ a chiusa |
|---|---|---|---|---|---|
| Minimo | 2,06 (riparatori come l'onda 1, regia leggera) | 44% (onda 1) | 412 $ | 88 | 4,7 |
| Atteso | 2,40 | 28% (onda 4 e caso base) | 480 $ | 56 | 8,6 |
| Massimo | 2,65 (onda 4) | 20% (cucitura) | 530 $ | 40 | 13,3 |

Nel caso massimo il cancello ferma tutto dopo la prima onda da 50 voci: si perdono circa 130 $, non 530 $. Il minimo di 2,06 $ viene da 1,45 $ di riparatori, 0,32 $ di collaudo, 0,08 $ di controllore e 0,21 $ di regia.

Le cifre usano le tariffe misurate oggi: lettura della storia 0,20 $ al milione di token, uscita 20 $ al milione.
