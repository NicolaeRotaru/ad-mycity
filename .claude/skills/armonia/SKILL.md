---
name: armonia
description: >-
  La base nascosta di OGNI sito che facciamo (Nicola, 28/11/2026): proporzioni auree, numerologia,
  astrologia, simboli e geometrie di tutte le culture, e la magia, messi dentro il codice e la grafica
  senza che si vedano come simboli. Aprila ogni volta che si costruisce, si rifà o si modifica la
  grafica di un sito: la bozza del sito di un cliente, il sito vero di un cliente, il marketplace
  MyCity, una pagina nuova, un componente che si vede. Vale anche quando Nicola, in qualunque forma,
  parla di esoterismo, numerologia, astrologia, segni, luna, geometria sacra, sezione aurea, simboli
  nascosti, magia o «armonia» nei siti. NON serve per i testi (post, email, schede): solo per come un
  sito è costruito e disegnato.
---

# Armonia nascosta: la base di ogni sito

> Nicola, 28/11/2026: «devi usare tutte queste cose esoteriche e metterle dentro nei siti… non devono
> vedersi direttamente, devi usarle in modo indiretto, devi applicarle dentro i codici ovunque».
> Poi: «usala come base per costruire i siti dei clienti, installala… il marketplace deve essere
> costruito sulla base di questo, e non solo esoterismo: simboli di ogni religione e cultura. E in più
> la magia: deve esserci magia».

## In parole semplici
Ogni sito nasce dalla **firma** della sua attività. La firma si calcola dal nome e da una data: dà un
numero, un segno, un elemento, un pianeta, un colore secondario, una forma, un ritmo, un motivo di
sfondo e un sigillo. Chi visita non vede simboli. Vede un sito ordinato, con una trama leggera dietro e
un puntino che è la luna di oggi.

## La regola
1. **Ogni sito parte dalla firma.** Mai un sito nuovo, o una grafica rifatta, senza `firmaDi(...)`.
2. **Si vede, ma non si capisce.** Niente simbolo riconoscibile, niente spiegazione sul sito. La
   spiegazione resta qui e nei commenti del codice, che spariscono quando il sito va online.
3. **Prima quello che il visitatore si aspetta.** Il giudizio su un sito si forma in 17-50 millisecondi
   e premia i siti semplici e fatti come ci si aspetta (Tuch e Google, 2012). La geometria decide misure,
   spazi e tempi: non sposta mai il menu, il carrello o il pulsante dal posto dove li cercano.
4. **Il marchio del cliente comanda.** Il colore principale resta il suo: la firma dà solo il secondo tono.
5. **Mai su prezzi, offerte, pagamenti, testi legali.** Nessuna urgenza legata alla luna («offerta della
   luna piena»), nessun prezzo che cambia col cielo, nessun fotogramma nascosto nei reel.
6. **Mai dietro al testo.** La trama sta nei margini (la maschera di `TramaNascosta` spegne il centro),
   mai dietro paragrafi, prezzi o moduli: lo chiede la British Dyslexia Association. Massimo 8% di opacità.
7. **Muta per chi non vede, ferma per chi chiede meno movimento.** `aria-hidden`; un solo respiro sotto i
   5 secondi (WCAG 2.2.2); con `prefers-reduced-motion` niente respiro e niente entrate.
8. **La data della firma non cambia mai.** Data d'apertura se c'è, altrimenti il giorno d'iscrizione a
   MyCity (`nascitaAttivita` del preventivo). Mai «oggi»: la bozza cambierebbe faccia ogni giorno.
9. **Mai promettere vendite.** Nessuno studio misura un effetto della geometria sulle vendite. Al cliente
   si racconta una storia vera (Fibonacci da Pisa, gli aruspici di Piacenza), mai «la sezione aurea fa vendere».

## Dove sta il codice (repo `NicolaeRotaru/mycity`)
- `lib/armonia/` — la libreria. `numeri.ts` (sezione aurea, Fibonacci, numerologia pitagorica, numeri
  vietati), `cielo.ts` (segno, elemento, pianeta, luna, wu xing, i 16 settori etruschi), `quadrati.ts`
  (quadrati magici dei pianeti, ordine di accensione, sigillo), `forme.ts` (i tracciati), `simboli.ts`
  (le culture e i vietati), `firma.ts` (la firma e i token CSS, più `FIRMA_MYCITY`).
- `components/armonia/` — `TramaNascosta`, `LunaDiOggi`, `SigilloNascosto`.
- `app/globals.css`, in fondo — i token `--armonia-*`, il respiro e l'entrata.
- La prova: `tests/unit/armonia-nascosta-dentro-ogni-sito.test.tsx`.

Già dentro: la bozza del sito dei clienti (`components/seller/AnteprimaServizio.tsx`, `BozzaDelSito`) e
il piè di pagina del marketplace (`components/Footer.tsx`, sotto i dati legali).

```tsx
import { firmaDi, ordineDiAccensione, tokenCss } from '@/lib/armonia';
import TramaNascosta from '@/components/armonia/TramaNascosta';
import LunaDiOggi from '@/components/armonia/LunaDiOggi';

const firma = firmaDi({ nome: 'Pane Quotidiano', data: dataApertura ?? giornoDelPreventivo });
const accensione = ordineDiAccensione(firma.pianeta, schede.length);

<section className="relative isolate overflow-hidden" style={tokenCss(firma)}>
  <TramaNascosta firma={firma} className="-z-10 text-ink-500" />
  {schede.map((s, i) => <Scheda key={s.id} className="armonia-entra" style={{ animationDelay: `${accensione[i] * 111}ms` }} />)}
  <LunaDiOggi dimensione={10} />
</section>
```

**La data della firma:** quella di apertura se la conosciamo; altrimenti il giorno d'iscrizione a MyCity.
Di un negozio si sa il giorno ma non l'ora: per convenzione si guarda il **mezzogiorno di Piacenza**, con
l'ora legale. Senza nessuna data, Mercurio: il dio del commercio e dei viaggiatori. **MyCity** ha numero
5; la sua data di nascita la sceglie Nicola (finché manca, Mercurio).

**Come sono fatti i calcoli (ricerca del 28/11):** il segno viene dalla longitudine vera del Sole (Meeus,
cap. 25), perché le date d'ingresso cambiano ogni anno; la luna dall'elongazione vera Luna-Sole (il mese
medio sbagliava fino a 14 ore); l'anno cinese dal lichun, il Sole a 315 gradi. La tabella numerologica
«pitagorica» è moderna (Balliett, primi del Novecento) e lo diciamo. I quadrati sono quelli di Agrippa
cella per cella; il 6×6 del Sole somma 666 ed è escluso. Dei quadrati non si usano mai i nomi degli
spiriti e delle intelligenze.

## Cosa si usa, e dove
| Livello | Cosa | Dove nel sito |
|---|---|---|
| Non si vede | Sezione aurea 61,8/38,2 · caratteri 16-26-42-68 · spazi 8-13-21-34-55-89 · larghezza 987 · curva 0,382/0,618 | colonne, titoli, spazi, animazioni (`--armonia-*`) |
| Non si vede | Numero del nome (pitagorico) → lati, durate (numero × 111 ms), quante voci in un gruppo | forma accanto al nome, tempi, menu |
| Si sente | Segno della data → elemento: fuoco angoli e ritmo veloce, terra forme piene e lento, aria linee e leggero, acqua curve e morbido | raggio degli angoli, peso dei titoli, ritmo |
| Si sente | Pianeta → metallo delle sfumature e giorno della settimana | colore secondario, giorno dei lanci e del post fisso |
| Si vede, non si capisce | La luna di oggi; alone leggero la notte di luna piena | piè di pagina |
| Si vede, non si capisce | Trama di sfondo dalla firma: triangoli o quincunx cosmatesco (fuoco), quadrati o kikkō (terra), cerchi o linee di vento (aria), onde o seigaiha (acqua); al punto aureo la rosa etrusca di Piacenza | nei margini di testate e piè di pagina |
| Magia | Quadrato magico del pianeta (Agrippa) → ordine in cui si accendono le schede, a passi di 89 ms | griglie di prodotti, sezioni |
| Magia | Sigillo dell'intenzione tracciato sul quadrato di Saturno | segno sottile accanto alla luna |
| Calendario | Siti nuovi online con la luna nuova, nel giorno del pianeta; eventi con la luna piena | quando si pubblica |

**Le culture:** i motivi «di casa» sono i migliori: il Fegato di Piacenza (16 settori, trovato nel 1877
vicino a Gossolengo, a Palazzo Farnese), i pavimenti cosmateschi (quincunx), Fibonacci (Pisa, 1202),
Gabriele Stornaloco, il matematico piacentino che nel 1391 propose lo schema a triangoli per il Duomo di
Milano, e Vignola, che progettò Palazzo Farnese. Poi la geometria mediterranea (vesica, spirale aurea),
il Giappone (seigaiha, kikkō), la Cina (Lo Shu, wu xing), l'alchimia (i quattro elementi). **Regola:** un
motivo di un'altra cultura entra solo come rete che continua oltre i bordi, a bassa opacità, mai come
figura sola. Asanoha forma rosette a sei punte e il fiore della vita ha un nome New Age: solo su
richiesta. I canoni storici veri usano rapporti tra interi presi dalla musica (Alberti, Palladio: 4:3,
3:2, 5:3, 2:1, √2), che sono anche i formati di foto e video: `RAPPORTI_ARMONICI`. Un motivo nuovo si
aggiunge in `forme.ts` e `simboli.ts`, con cultura e significato, e passa da `motivoAmmesso`.

## Mai, neanche nascosti
- **Simboli:** pentagramma, stella a sei punte (stella di David), svastica anche antica, sole nero,
  rune, croce celtica, triskele, occhio nella piramide, croce rovesciata.
- **Simboli di fede:** croci, mezzelune, om, ruote del dharma, Sri Yantra, loto come emblema, i
  trigrammi cinesi visibili, i simboli Adinkra. La stella a otto punte isolata (segna le sezioni del
  Corano), il sayagata (è fatto di svastiche). Nomi divini, calligrafia e testi sacri, il testo del
  Sator. Delle religioni si prendono i principi geometrici, mai i simboli di fede.
- **Culture native:** i loro simboli no (appropriazione).
- **Numeri:** 14, 18, 88, 1488 (codici neonazisti), 666, 17 (in Italia porta sfortuna).
  `numeroAmmesso` e `ammessoVicino` li tengono fuori da durate e quantità.
- **Niente testo nascosto** per Google (lo considera un trucco), niente audio che parte da solo.

## Da decidere con il titolare
La ricerca consiglia di dire al titolare, in una riga della proposta, che il sito è costruito sulle
proporzioni del nome e della data della sua attività. Per astrologia e magia, che la Chiesa cattolica
respinge (Catechismo §2116), consiglia anche di poterle spegnere se il titolare non le vuole: le
proporzioni restano. Nicola ha deciso il 28/11 che vanno in ogni sito; chiedere a lui se vuole questo
interruttore.

## Prima di consegnare un sito
1. La firma c'è, e i token `tokenCss(firma)` sono sul contenitore.
2. La trama è dietro al contenuto e non sotto al testo a più dell'8%.
3. Con «riduci movimento» acceso non si muove niente.
4. `npx vitest run tests/unit/armonia-nascosta-dentro-ogni-sito.test.tsx` è verde.
5. Al cliente si dice in una riga della proposta che il sito è costruito sulle proporzioni del nome e
   della data della sua attività. Ai visitatori non si dice niente.

Il rapporto completo, con tutte le fonti: `docs/ricerca/reports/Armonia nascosta nei siti.md` (ad-mycity).
