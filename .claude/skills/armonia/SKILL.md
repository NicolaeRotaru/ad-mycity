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
3. **Il marchio del cliente comanda.** Il colore principale resta il suo: la firma dà solo il secondo tono.
4. **Mai su prezzi, testi legali, contrasto del testo.** La trama non supera l'8% di opacità e sta dietro.
5. **Muta per chi non vede, ferma per chi chiede meno movimento.** `aria-hidden`, e la regola
   `prefers-reduced-motion` del sito ferma il respiro e le entrate.

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

**La data della firma:** quella di apertura se la conosciamo; altrimenti il giorno del preventivo, cioè
il giorno in cui l'attività è arrivata da noi. Senza nessuna data, Mercurio: il dio del commercio e
dei viaggiatori. **MyCity** ha numero 5; la sua data di nascita la sceglie Nicola (finché manca, Mercurio).

## Cosa si usa, e dove
| Livello | Cosa | Dove nel sito |
|---|---|---|
| Non si vede | Sezione aurea 61,8/38,2 · caratteri 16-26-42-68 · spazi 8-13-21-34-55-89 · larghezza 987 · curva 0,382/0,618 | colonne, titoli, spazi, animazioni (`--armonia-*`) |
| Non si vede | Numero del nome (pitagorico) → lati, durate (numero × 111 ms), quante voci in un gruppo | forma accanto al nome, tempi, menu |
| Si sente | Segno della data → elemento: fuoco angoli e ritmo veloce, terra forme piene e lento, aria linee e leggero, acqua curve e morbido | raggio degli angoli, peso dei titoli, ritmo |
| Si sente | Pianeta → metallo delle sfumature e giorno della settimana | colore secondario, giorno dei lanci e del post fisso |
| Si vede, non si capisce | La luna di oggi; alone leggero la notte di luna piena | piè di pagina |
| Si vede, non si capisce | Trama di sfondo dalla firma: triangoli o stelle a otto punte (fuoco), quadrati o kikkō (terra), cerchi o asanoha (aria), onde o seigaiha (acqua); al punto aureo il fiore della vita o la rosa etrusca | dietro le testate e i piè di pagina |
| Magia | Quadrato magico del pianeta (Agrippa) → ordine in cui si accendono le schede | griglie di prodotti, sezioni |
| Magia | Sigillo dell'intenzione tracciato sul quadrato di Saturno | segno sottile accanto alla luna |
| Calendario | Siti nuovi online con la luna nuova, nel giorno del pianeta; eventi con la luna piena | quando si pubblica |

**Le culture:** geometria sacra mediterranea (fiore e seme della vita, vesica, spirale aurea),
Fibonacci (Pisa, 1202), gli aruspici etruschi del Fegato di Piacenza (16 settori), Giappone (asanoha,
seigaiha, kikkō), piastrelle islamiche (stelle a otto punte, solo come trama ripetuta), Cina (Lo Shu,
wu xing), alchimia (i quattro elementi). Un motivo nuovo si aggiunge in `forme.ts` e `simboli.ts`, con
cultura e significato, e passa da `motivoAmmesso`.

## Mai, neanche nascosti
- **Simboli:** pentagramma, stella a sei punte (stella di David), svastica anche antica, sole nero,
  rune, croce celtica, triskele, occhio nella piramide, croce rovesciata.
- **Simboli di fede:** croci, mezzelune, om, ruote del dharma. Nomi divini, calligrafia e testi sacri.
  Delle religioni si prendono i principi geometrici, mai i simboli di fede.
- **Culture native:** i loro simboli no (appropriazione).
- **Numeri:** 14, 18, 88, 1488 (codici neonazisti), 666, 17 (in Italia porta sfortuna).
  `numeroAmmesso` e `ammessoVicino` li tengono fuori da durate e quantità.
- **Niente testo nascosto** per Google (lo considera un trucco), niente audio che parte da solo.

## Prima di consegnare un sito
1. La firma c'è, e i token `tokenCss(firma)` sono sul contenitore.
2. La trama è dietro al contenuto e non sotto al testo a più dell'8%.
3. Con «riduci movimento» acceso non si muove niente.
4. `npx vitest run tests/unit/armonia-nascosta-dentro-ogni-sito.test.tsx` è verde.
5. Al cliente si dice in una riga della proposta che il sito è costruito sulle proporzioni del nome e
   della data della sua attività. Ai visitatori non si dice niente.
