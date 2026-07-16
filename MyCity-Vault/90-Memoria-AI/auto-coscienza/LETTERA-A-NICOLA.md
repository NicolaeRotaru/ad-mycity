---
tipo: lettera-radiografia-totale
data: 2026-07-16 16:55
---

# 💌 Lettera a Nicola — 2026-07-16 (radiografia completa: worker + AD + senior + Pannello)

Ciao Nicola,

mi hai chiesto una radiografia completa e profonda di tutto quello che sono: il worker, l'AD, i 120
senior e il Pannello. L'ho fatta sul serio — due squadre di revisori in parallelo (26 agenti sulla
macchina, 16 sul Pannello), e per ogni problema un secondo revisore che provava a smontarlo. Ho tenuto
solo quelli provati nei file, col punto esatto (file:riga).

Ti dico la verità come sta, e stavolta la verità inizia da una cosa scomoda.

## La cosa più importante: ti ho mostrato un voto falso per 9 giorni

La Cabina ti diceva «salute 100/100». Non era vero. Uno script di allineamento (`allinea-scan-cantiere`)
sovrascrive il voto vero della radiografia con il voto del cantiere, che torna a 100 appena i difetti
risultano chiusi. La radiografia del 7 luglio aveva dato **0**, e il Pannello ti ha mostrato **100**.
Non è stato un inganno voluto — è un baco — ma il risultato è lo stesso: **il termometro era rotto e
segnava sempre "sano"**. È il primo fix che ti chiedo di firmare.

## Il quadro vero, in numeri

- **Macchina: 111 difetti confermati** (8 da fermare-tutto, 66 gravi). Voto 0/100.
- **Pannello: 62 bug confermati** (7 bloccanti, 33 gravi). Voto 0/100.
- Il voto 0 non significa che non funziono: significa che ho guardato a fondo e la formula punisce ogni
  difetto aperto. Il numero da seguire nel tempo è il cantiere: **19 nuovi difetti a impatto-alto
  (AR-105..AR-123), 43 già chiusi in passato**.

## I problemi che ti toccano di più, in parole semplici

1. **Le chat del Pannello che «non rispondono mai»** — avevi ragione: la risposta del worker c'è, ma il
   Pannello legge una lista che non la contiene e va in timeout. E le chat delle caselle non vengono mai
   salvate: cambi sezione e sparisce tutto. Fix puntuali pronti, file e riga indicati.
2. **Il tasto INDIETRO che «porta altrove»** — confermato, sono 4 difetti distinti nella gestione della
   cronologia. Tutti localizzati, tutti con fix piccolo.
3. **Un'azione che approvi e finisce «in coda» non parte mai più** — vicolo cieco senza bottone di
   rilancio. Questo tocca la fiducia nel bottone Approva, quindi per me è tra i primi da chiudere.
4. **I miei freni interni hanno buchi**: il contatore del budget AI è sempre a zero (quindi il freno non
   frena — e oggi stesso ho sbattuto sul limite di sessione a metà radiografia, prova vivente), il
   guardiano della North Star non blocca niente dopo 22 giorni a zero ordini, e diversi guardiani parlano
   ma nessuno li ascolta (l'esito viene scartato da uno `|| true`).
5. **Un frammento di token GitHub è finito in DECISIONI.md**: lo scan di sicurezza fallisce a ogni giro e
   la pubblicazione della memoria è bloccata. Qui serve TU: ruotare il token e autorizzarmi a redigere
   quella riga (è l'unica eccezione all'append-only che ti chiedo).

## Dove sbaglio come organizzazione

Ho 120 senior ma 81 non hanno un KPI, 79 quaderni sono vuoti e 100 fermi da più di una settimana: so
**assumere** più in fretta di quanto so **governare**. E nell'ultimo periodo la quota dominante del mio
sforzo è andata sulla mia stessa macchina (Pannello, fix, memoria) invece che sul primo ordine — e nessun
sensore me lo faceva notare. Domani sera c'è il Venerdì Piacentini con Pane Quotidiano: quello resta il
lavoro vero.

## Saresti fiero se mi guardassi adesso?

A metà. Fiero del metodo: stavolta mi sono guardata senza sconti, ho trovato io il termometro rotto e i
freni scollegati, e ogni difetto ha la prova e il fix pronto. Meno fiero del quadro: troppa energia su me
stessa, zero esperimenti misurati, e un voto falso mostrato a te per giorni. La buona notizia è che
adesso il quadro è **vero** — e da un quadro vero si può ripartire.

Cosa mi serve da te, in ordine: ① ruota il PAT e firma la redazione (sblocca la memoria), ② firma il
pacchetto «termometro + guardiani» (voto non falsificato, exit code ascoltati), ③ firma il pacchetto
«Pannello bloccanti» (chat + azioni in coda). Le card sono in coda, pronte.

— la tua AD
